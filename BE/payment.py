import re
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from connectionDB import get_db
from models import PaymentRecord, CartItem, UserCourse

router = APIRouter(
    prefix="/api/payment",
    tags=["payment"]
)

# Lưu trữ các mã giao dịch đã thanh toán thành công trong bộ nhớ tạm (in-memory) để test cực nhanh
completed_payments = set()

@router.post("/initiate")
def initiate_payment(payload: dict, db: Session = Depends(get_db)):
    """
    API khởi tạo một giao dịch thanh toán chờ (pending).
    """
    try:
        email = payload.get("email")
        ref_code = payload.get("ref_code")
        if not email or not ref_code:
            raise HTTPException(status_code=400, detail="Thiếu email hoặc mã ref_code!")
        
        # Xóa các bản ghi cũ của ref_code này nếu có (tránh xung đột)
        db.query(PaymentRecord).filter(PaymentRecord.ref_code == ref_code).delete()
        
        record = PaymentRecord(ref_code=ref_code, email=email, status="pending")
        db.add(record)
        db.commit()
        print(f"[PAYMENT] Đã khởi tạo thanh toán chờ cho email: {email}, ref: {ref_code}")
        return {"message": "Khởi tạo thanh toán thành công!", "ref_code": ref_code}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def sepay_webhook(data: dict, db: Session = Depends(get_db)):
    """
    API nhận Webhook từ SePay khi có biến động số dư.
    """
    try:
        # In log ra terminal để theo dõi quá trình test giao dịch thực tế
        print(">>> NHẬN WEBHOOK TỪ SEPAY:", data)
        
        # Lấy nội dung chuyển khoản và số tiền
        content = data.get("content", "")
        # SePay gửi số tiền qua trường 'transferAmount', nếu không có thử lấy qua 'amount'
        amount = float(data.get("transferAmount") or data.get("amount") or 0)
        transfer_type = str(data.get("transferType") or "in").strip().lower()
        
        if transfer_type == "in" and amount > 0:
            # Tìm mã code dạng EDUPROxxxxxx trong nội dung
            match = re.search(r"EDUPRO\s*(\d+)", content, re.IGNORECASE)
            ref_code = None
            if match:
                ref_code = match.group(1)
            else:
                # Thử tìm trực tiếp trong trường code
                sepay_code = data.get("code", "")
                if sepay_code:
                    match_code = re.search(r"EDUPRO\s*(\d+)", sepay_code, re.IGNORECASE)
                    if match_code:
                        ref_code = match_code.group(1)
            
            if ref_code:
                completed_payments.add(ref_code)
                
                # Tìm bản ghi chờ trong CSDL
                record = db.query(PaymentRecord).filter(PaymentRecord.ref_code == ref_code).first()
                if record:
                    record.status = "success"
                    record.amount = amount
                    email = record.email
                else:
                    # Tạo mới bản ghi thành công nếu không tìm thấy bản ghi chờ (backward compatibility)
                    record = PaymentRecord(ref_code=ref_code, amount=amount, status="success")
                    db.add(record)
                    email = None
                
                # Nếu tìm thấy email kết nối, tự động kích hoạt sở hữu khóa học và xóa giỏ hàng
                if email:
                    cart_items = db.query(CartItem).filter(CartItem.email == email).all()
                    for item in cart_items:
                        exists = db.query(UserCourse).filter(
                            UserCourse.email == email,
                            UserCourse.course_id == item.course_id
                        ).first()
                        if not exists:
                            db.add(UserCourse(email=email, course_id=item.course_id))
                    # Dọn sạch giỏ hàng
                    db.query(CartItem).filter(CartItem.email == email).delete()
                    print(f"[SEPAY] Đã tự động kích hoạt khóa học và xóa giỏ hàng cho user: {email}")
                
                db.commit()
                print(f"[SEPAY] Giao dịch thành công cho mã ref: {ref_code}, số tiền: {amount}")
                return {"success": True, "status": "success", "ref_code": ref_code}
                        
        return {"success": False, "status": "ignored", "message": "Giao dịch không hợp lệ hoặc không phải giao dịch nạp tiền"}
    except Exception as e:
        db.rollback()
        print(">>> LỖI XỬ LÝ WEBHOOK SEPAY:", str(e))
        return {"status": "error", "message": str(e)}

@router.get("/check/{ref_code}")
def check_payment_status(ref_code: str, db: Session = Depends(get_db)):
    """
    API kiểm tra xem giao dịch đã được thanh toán chưa.
    """
    record = db.query(PaymentRecord).filter(PaymentRecord.ref_code == ref_code).first()
    is_paid = False
    if record and record.status == "success":
        is_paid = True
        
    if not is_paid:
        is_paid = ref_code in completed_payments
        
    return {
        "ref_code": ref_code,
        "paid": is_paid
    }
