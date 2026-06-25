import os
import shutil
import time
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from connectionDB import engine, SessionLocal
from models import Base, User
import courses
import contests
import users
import dashboard
import cart
import learning
import payment
import vouchers

# Tự động tạo các bảng trong CSDL MySQL nếu chưa tồn tại
Base.metadata.create_all(bind=engine)

UPLOAD_DIR = "upload"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app = FastAPI(title="EduPro Backend Service")

# Cấu hình CORS để cho phép React Frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình phục vụ file tĩnh cho thư mục upload
app.mount("/upload", StaticFiles(directory=UPLOAD_DIR), name="upload")

# Tích hợp APIRouter của khóa học
app.include_router(courses.router)

# Tích hợp APIRouter của cuộc thi
app.include_router(contests.router)

# Tích hợp APIRouter của quản lý người dùng
app.include_router(users.router)

# Tích hợp APIRouter của Dashboard thống kê
app.include_router(dashboard.router)

# Tích hợp APIRouter của giỏ hàng
app.include_router(cart.router)

# Tích hợp APIRouter của phòng học trực tuyến (Syllabus, Tiến trình, Bài tập)
app.include_router(learning.router)

# Tích hợp APIRouter của thanh toán SePay
app.include_router(payment.router)

# Tích hợp APIRouter của quản lý Voucher
app.include_router(vouchers.router)

# ==========================================
# API UPLOAD FILE ẢNH
# ==========================================
@app.post("/api/upload")
async def upload_file(type: str = "course", file: UploadFile = File(...)):
    try:
        # Tách tên file và phần mở rộng
        filename, ext = os.path.splitext(file.filename)
        ext_lower = ext.lower()
        
        # Xác định thư mục con dựa trên tham số type (course hoặc contest)
        subfolder = "contest" if type == "contest" else "course"
            
        target_dir = os.path.join(UPLOAD_DIR, subfolder)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            
        # Tạo tên file duy nhất bằng timestamp tránh trùng
        unique_filename = f"{int(time.time())}{ext_lower}"
        file_path = os.path.join(target_dir, unique_filename)
        
        # Lưu file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "message": "Upload file thành công!",
            "url": f"http://localhost:8000/upload/{subfolder}/{unique_filename}"
        }
    except Exception as e:
        return {"error": "Lỗi upload file: " + str(e)}

# ==========================================
# API ĐĂNG KÝ
# ==========================================
@app.post("/register")
async def register(user_data: dict):
    db = SessionLocal()
    try:
        email = user_data.get("email")
        exists = db.query(User).filter(User.email == email).first()
        if exists:
            return {"error": "Email này đã được đăng ký trước đó!"}

        # Nếu đăng ký bằng admin@gmail.com, tự động gán role admin
        role = "admin" if email == "admin@gmail.com" else "user"

        new_user = User(
            username=user_data.get("username"),
            fullname=user_data.get("username"),
            email=email,
            password=user_data.get("password"),
            role=role,
            points=0,
            avatar="🧑‍🎓"
        )
        db.add(new_user)
        db.commit()
        return {"message": "Đăng ký thành công!", "user": user_data.get("username")}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

# ==========================================
# API ĐĂNG NHẬP
# ==========================================
@app.post("/login")
async def login(user_data: dict):
    db = SessionLocal()
    try:
        email = user_data.get("email")
        password = user_data.get("password")

        user = db.query(User).filter(User.email == email, User.password == password).first()
        if user:
            return {
                "message": "Đăng nhập thành công!",
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "points": user.points,
                "avatar": user.avatar
            }
        else:
            return {"error": "Sai Email hoặc Mật khẩu, hãy kiểm tra lại!"}
            
    except Exception as e:
        return {"error": "Lỗi Backend: " + str(e)}
    finally:
        db.close()
