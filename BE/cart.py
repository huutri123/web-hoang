from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from connectionDB import get_db
from models import CartItem, Course, UserCourse
from courses import map_course_to_fe

router = APIRouter(
    prefix="/api/cart",
    tags=["cart"]
)

# 1. API Lấy danh sách giỏ hàng của người dùng theo email
@router.get("")
def get_cart_items(email: str = Query(..., description="Email của người dùng"), db: Session = Depends(get_db)):
    try:
        items = db.query(CartItem).filter(CartItem.email == email).all()
        course_ids = [item.course_id for item in items]
        
        if not course_ids:
            return []
            
        courses_db = db.query(Course).filter(Course.id.in_(course_ids)).all()
        
        # Ánh xạ thông tin chi tiết khóa học sang định dạng FE mong đợi
        res = []
        for c in courses_db:
            mapped = map_course_to_fe(c)
            # Thêm thông tin selected mặc định là True cho giỏ hàng
            mapped["selected"] = True
            res.append(mapped)
            
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi máy chủ khi lấy giỏ hàng: " + str(e))

# 2. API Thêm khóa học vào giỏ hàng
@router.post("/add")
def add_to_cart(data: dict, db: Session = Depends(get_db)):
    try:
        email = data.get("email")
        course_id = data.get("course_id")
        
        if not email or not course_id:
            raise HTTPException(status_code=400, detail="Thiếu tham số email hoặc course_id")
            
        # Kiểm tra xem khóa học có tồn tại không
        course_exists = db.query(Course).filter(Course.id == course_id).first()
        if not course_exists:
            raise HTTPException(status_code=404, detail="Khóa học không tồn tại")
            
        # Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        exists = db.query(CartItem).filter(CartItem.email == email, CartItem.course_id == course_id).first()
        if exists:
            return {"message": "Khóa học đã có sẵn trong giỏ hàng"}
            
        new_item = CartItem(email=email, course_id=course_id)
        db.add(new_item)
        db.commit()
        return {"message": "Thêm vào giỏ hàng thành công!"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi máy chủ khi thêm giỏ hàng: " + str(e))

# 3. API Xóa một khóa học khỏi giỏ hàng
@router.delete("/remove")
def remove_from_cart(email: str = Query(..., description="Email người dùng"), course_id: int = Query(..., description="Mã khóa học"), db: Session = Depends(get_db)):
    try:
        item = db.query(CartItem).filter(CartItem.email == email, CartItem.course_id == course_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Không tìm thấy khóa học trong giỏ hàng")
            
        db.delete(item)
        db.commit()
        return {"message": "Đã xóa khóa học khỏi giỏ hàng"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi máy chủ khi xóa giỏ hàng: " + str(e))

# 4. API Dọn sạch giỏ hàng của người dùng
@router.delete("/clear")
def clear_cart(email: str = Query(..., description="Email người dùng"), db: Session = Depends(get_db)):
    try:
        # Lấy tất cả các sản phẩm đang có trong giỏ hàng
        cart_items = db.query(CartItem).filter(CartItem.email == email).all()
        
        # Thêm các sản phẩm này vào danh sách khóa học sở hữu (UserCourse) nếu chưa tồn tại
        for item in cart_items:
            exists = db.query(UserCourse).filter(
                UserCourse.email == email,
                UserCourse.course_id == item.course_id
            ).first()
            
            if not exists:
                new_user_course = UserCourse(email=email, course_id=item.course_id)
                db.add(new_user_course)
                
        db.query(CartItem).filter(CartItem.email == email).delete()
        db.commit()
        return {"message": "Đã dọn sạch giỏ hàng và cập nhật quyền sở hữu khóa học thành công!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi máy chủ khi dọn giỏ hàng: " + str(e))
