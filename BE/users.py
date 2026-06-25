from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from connectionDB import get_db
from models import User

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

def user_to_dict(u):
    return {
        "id": u.id,
        "username": u.username,
        "fullname": u.fullname or u.username,
        "email": u.email,
        "role": u.role,
        "status": u.status or "Hoạt động",
        "contest_banned": bool(u.contest_banned),
        "phone": u.phone or "",
        "birthdate": u.birthdate or "",
        "gender": u.gender or "",
        "address": u.address or "",
        "created_at": u.created_at.strftime("%d/%m/%Y %H:%M") if u.created_at else None,
    }

@router.get("")
def get_users(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả người dùng."""
    try:
        users_list = db.query(User).all()
        return [user_to_dict(u) for u in users_list]
    except Exception as e:
        return {"error": "Lỗi lấy danh sách người dùng: " + str(e)}

@router.put("/{user_id}/status")
def update_user_status(user_id: int, payload: dict, db: Session = Depends(get_db)):
    """Cập nhật trạng thái hoạt động (Khóa/Mở khóa) của tài khoản."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng!")
        
        status_val = payload.get("status")
        if status_val not in ["Hoạt động", "Đã khóa"]:
            raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ!")
            
        user.status = status_val
        db.commit()
        return {"message": "Cập nhật trạng thái thành công!", "user": user_to_dict(user)}
    except Exception as e:
        db.rollback()
        return {"error": "Lỗi cập nhật trạng thái: " + str(e)}

@router.put("/{user_id}/contest-ban")
def update_user_contest_ban(user_id: int, payload: dict, db: Session = Depends(get_db)):
    """Cấm hoặc bỏ cấm tham gia cuộc thi đấu."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng!")
            
        is_banned = payload.get("contest_banned")
        user.contest_banned = 1 if is_banned else 0
        db.commit()
        return {"message": "Cập nhật trạng thái cấm thi đấu thành công!", "user": user_to_dict(user)}
    except Exception as e:
        db.rollback()
        return {"error": "Lỗi cập nhật trạng thái cấm thi đấu: " + str(e)}

@router.get("/profile")
def get_user_profile(email: str, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết hồ sơ cá nhân theo email."""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy thông tin tài khoản!")
        return user_to_dict(user)
    except Exception as e:
        return {"error": "Lỗi lấy thông tin cá nhân: " + str(e)}

@router.put("/profile")
def update_user_profile(payload: dict, db: Session = Depends(get_db)):
    """Cập nhật thông tin chi tiết hồ sơ cá nhân theo email."""
    try:
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Thiếu thông tin email để xác thực!")
            
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng để cập nhật!")
            
        # Cập nhật các trường thông tin cá nhân từ payload
        if "fullname" in payload:
            user.fullname = payload.get("fullname")
        if "phone" in payload:
            phone_val = payload.get("phone")
            if phone_val:
                import re
                if not re.match(r"^0\d{9}$", phone_val):
                    raise HTTPException(status_code=400, detail="Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số!")
            user.phone = phone_val
        if "birthdate" in payload:
            birthdate_val = payload.get("birthdate")
            if birthdate_val:
                import re
                if re.match(r"^\d{4}-\d{2}-\d{2}$", birthdate_val):
                    try:
                        from datetime import datetime
                        bdate = datetime.strptime(birthdate_val, "%Y-%m-%d")
                        current_year = datetime.now().year
                        if bdate.year < 1900 or bdate.year > current_year:
                            raise HTTPException(status_code=400, detail=f"Năm sinh phải từ 1900 đến {current_year}!")
                    except ValueError:
                        raise HTTPException(status_code=400, detail="Định dạng ngày sinh không hợp lệ!")
            user.birthdate = birthdate_val
        if "gender" in payload:
            user.gender = payload.get("gender")
        if "address" in payload:
            user.address = payload.get("address")
            
        db.commit()
        return {"message": "Cập nhật thông tin hồ sơ thành công!", "user": user_to_dict(user)}
    except Exception as e:
        db.rollback()
        return {"error": "Lỗi cập nhật thông tin cá nhân: " + str(e)}

@router.put("/change-password")
def change_password(payload: dict, db: Session = Depends(get_db)):
    """Đổi mật khẩu tài khoản học viên."""
    try:
        email = payload.get("email")
        old_password = payload.get("old_password")
        new_password = payload.get("new_password")
        
        if not email or not old_password or not new_password:
            raise HTTPException(status_code=400, detail="Thiếu thông tin yêu cầu!")
            
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản học viên!")
            
        if user.password != old_password:
            raise HTTPException(status_code=400, detail="Mật khẩu cũ không chính xác!")
            
        user.password = new_password
        db.commit()
        return {"message": "Đổi mật khẩu thành công!"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        return {"error": "Lỗi hệ thống: " + str(e)}
