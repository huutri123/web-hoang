import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from connectionDB import get_db
from models import Voucher

router = APIRouter(
    prefix="/api/vouchers",
    tags=["vouchers"]
)

def voucher_to_dict(v):
    return {
        "id": v.id,
        "code": v.code,
        "name": v.name,
        "discount_type": v.discount_type,
        "discount_value": v.discount_value,
        "limit_uses": v.limit_uses,
        "used_uses": v.used_uses,
        "start_date": v.start_date.strftime("%Y-%m-%d") if v.start_date else None,
        "end_date": v.end_date.strftime("%Y-%m-%d") if v.end_date else None,
        "status": v.status
    }

@router.get("")
def get_vouchers(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả voucher."""
    try:
        vouchers_list = db.query(Voucher).order_by(Voucher.id.desc()).all()
        return [voucher_to_dict(v) for v in vouchers_list]
    except Exception as e:
        return {"error": "Lỗi lấy danh sách voucher: " + str(e)}

@router.post("")
async def create_voucher(payload: dict, db: Session = Depends(get_db)):
    """Tạo mới voucher."""
    try:
        code = payload.get("code", "").strip().upper()
        name = payload.get("name", "").strip()
        discount_type = payload.get("discount_type", "percent")
        discount_value = int(payload.get("discount_value", 0))
        limit_uses = int(payload.get("limit_uses", 100))
        
        # Parse ngày tháng
        start_date_str = payload.get("start_date")
        end_date_str = payload.get("end_date")
        
        def parse_date(date_str, default_val=None):
            if not date_str:
                return default_val
            for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            raise ValueError(f"Không thể định dạng ngày: {date_str}")

        start_date = parse_date(start_date_str, datetime.now())
        end_date = parse_date(end_date_str)
        
        if not end_date:
            raise HTTPException(status_code=400, detail="Vui lòng cung cấp ngày hết hạn!")
            
        if not code or not name:
            raise HTTPException(status_code=400, detail="Mã voucher và Tên voucher không được để trống!")
            
        # Kiểm tra trùng mã
        existing = db.query(Voucher).filter(Voucher.code == code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Mã voucher này đã tồn tại trong hệ thống!")
            
        new_voucher = Voucher(
            code=code,
            name=name,
            discount_type=discount_type,
            discount_value=discount_value,
            limit_uses=limit_uses,
            used_uses=0,
            start_date=start_date,
            end_date=end_date,
            status="Hoạt động"
        )
        db.add(new_voucher)
        db.commit()
        db.refresh(new_voucher)
        
        return {"message": "Tạo voucher thành công!", "voucher": voucher_to_dict(new_voucher)}
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi khi tạo voucher: " + str(e))

@router.delete("/{voucher_id}")
def delete_voucher(voucher_id: int, db: Session = Depends(get_db)):
    """Xóa voucher."""
    try:
        voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()
        if not voucher:
            raise HTTPException(status_code=404, detail="Không tìm thấy voucher!")
        
        db.delete(voucher)
        db.commit()
        return {"message": "Đã xóa voucher thành công!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi khi xóa voucher: " + str(e))

@router.post("/apply")
def apply_voucher(payload: dict, db: Session = Depends(get_db)):
    """Kiểm tra và áp dụng voucher khi checkout."""
    code = payload.get("code", "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Vui lòng nhập mã giảm giá!")
        
    voucher = db.query(Voucher).filter(Voucher.code == code).first()
    if not voucher:
        raise HTTPException(status_code=404, detail="Mã giảm giá không tồn tại!")
        
    if voucher.status != "Hoạt động":
        raise HTTPException(status_code=400, detail="Mã giảm giá đã ngừng hoạt động!")
        
    now = datetime.now()
    if voucher.start_date and now < voucher.start_date:
        raise HTTPException(status_code=400, detail="Mã giảm giá chưa bắt đầu có hiệu lực!")
        
    if now > voucher.end_date:
        raise HTTPException(status_code=400, detail="Mã giảm giá đã hết hạn sử dụng!")
        
    if voucher.used_uses >= voucher.limit_uses:
        raise HTTPException(status_code=400, detail="Mã giảm giá đã hết lượt sử dụng!")
        
    return {
        "message": "Áp dụng mã giảm giá thành công!",
        "code": voucher.code,
        "name": voucher.name,
        "discount_type": voucher.discount_type,
        "discount_value": voucher.discount_value
    }

@router.post("/use/{code}")
def use_voucher(code: str, db: Session = Depends(get_db)):
    """Tăng số lần sử dụng của voucher khi đơn hàng thanh toán thành công."""
    code_upper = code.strip().upper()
    voucher = db.query(Voucher).filter(Voucher.code == code_upper).first()
    if voucher:
        if voucher.used_uses < voucher.limit_uses:
            voucher.used_uses += 1
            if voucher.used_uses >= voucher.limit_uses:
                voucher.status = "Đã dùng hết"
            db.commit()
            return {"status": "success", "used_uses": voucher.used_uses}
    return {"status": "ignored", "message": "Voucher không tồn tại hoặc đã hết lượt"}
