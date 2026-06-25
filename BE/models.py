from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime
from connectionDB import Base
from datetime import datetime

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)  # Mã định danh khóa học (Khóa chính)
    slug = Column(String(100), unique=True, nullable=False)  # Đường dẫn URL thân thiện (ví dụ: lap-trinh-react)
    category = Column(String(50), nullable=False)  # Danh mục hiển thị có dấu (ví dụ: Lập trình)
    image = Column(String(255), nullable=True)  # Đường dẫn ảnh đại diện/ảnh bìa khóa học
    video = Column(String(255), nullable=True)  # Đường dẫn video giới thiệu khóa học
    title = Column(String(255), nullable=False)  # Tên/Tiêu đề khóa học
    description = Column(Text, nullable=True)  # Mô tả ngắn hiển thị trên card
    detailed_description = Column(Text, nullable=True)  # Mô tả chi tiết nội dung khóa học
    price_old = Column(String(50), nullable=True)  # Học phí gốc (khi chưa giảm giá)
    price_discount = Column(String(50), nullable=False, default="0đ")  # Học phí khuyến mãi học viên cần đóng
    instructor = Column(String(100), nullable=False)  # Tên giảng viên đứng lớp
    duration = Column(String(50), nullable=False)  # Thời lượng học (ví dụ: 30 giờ)
    level = Column(String(50), nullable=False)  # Cấp độ yêu cầu (Sơ cấp, Trung cấp, Cao cấp)
    rating = Column(Numeric(3, 2), default=0.00)  # Điểm số đánh giá từ học viên (từ 0.0 đến 5.0)
    student_count = Column(Integer, default=0)  # Số lượng học viên đã đăng ký
    goals = Column(Text, nullable=True)  # Mục tiêu khóa học (lưu danh sách mục tiêu dạng text/JSON)

class CourseChapter(Base):
    __tablename__ = "course_chapters"

    id = Column(Integer, primary_key=True, index=True)  # Mã định danh chương học (Khóa chính)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)  # Liên kết khóa học
    title = Column(String(255), nullable=False)  # Tiêu đề chương học
    order = Column(Integer, default=1)  # Thứ tự chương

class CourseLesson(Base):
    __tablename__ = "course_lessons"

    id = Column(Integer, primary_key=True, index=True)  # Mã định danh bài học (Khóa chính)
    chapter_id = Column(Integer, ForeignKey("course_chapters.id", ondelete="CASCADE"), nullable=False)  # Liên kết chương
    title = Column(String(255), nullable=False)  # Tiêu đề bài học
    type = Column(String(50), default="video")  # Loại bài học (video, text,...)
    duration = Column(String(50), nullable=True)  # Thời lượng bài học
    order = Column(Integer, default=1)  # Thứ tự bài học
    video_url = Column(String(500), nullable=True)  # URL video bài giảng (YouTube / Google Drive)
    content = Column(Text, nullable=True)  # Nội dung bài học (text / HTML)

class LessonExercise(Base):
    __tablename__ = "lesson_exercises"

    id = Column(Integer, primary_key=True, index=True)  # Mã định danh câu hỏi (Khóa chính)
    lesson_id = Column(Integer, ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False)  # Liên kết bài học
    question = Column(Text, nullable=False)  # Đề bài / câu hỏi tự luận
    answer = Column(Text, nullable=True)  # Đáp án gợi ý / hướng dẫn chấm
    order = Column(Integer, default=1)  # Thứ tự hiển thị câu hỏi

class Contest(Base):
    __tablename__ = "contests"

    id           = Column(Integer, primary_key=True, index=True)   # Mã định danh cuộc thi (Khóa chính)
    title        = Column(String(255), nullable=False)              # Tên cuộc thi
    short_desc   = Column(String(255), nullable=True)               # Mô tả ngắn hiển thị trên card
    description  = Column(Text, nullable=True)                      # Thể lệ cuộc thi (nội dung đầy đủ)
    image        = Column(String(500), nullable=True)               # URL ảnh đại diện cuộc thi
    banner       = Column(String(500), nullable=True)               # URL ảnh banner cuộc thi
    topic        = Column(String(50), nullable=True)                # Chủ đề (AI, Lập trình, Python...)
    start_time   = Column(DateTime, nullable=False)                 # Thời gian bắt đầu
    end_time     = Column(DateTime, nullable=False)                  # Thời gian kết thúc
    duration     = Column(Integer, nullable=False)                  # Thời gian làm bài (phút)
    max_attempts = Column(Integer, default=1)                       # Số lượt thi tối đa
    passing_score= Column(Integer, default=50)                      # Điểm đạt (trên 100)
    password     = Column(String(100), nullable=True)               # Mật khẩu cuộc thi
    participants = Column(Integer, default=0)                       # Số thí sinh đã tham gia
    level        = Column(String(50), default="Trung bình")         # Cấp độ khó (Dễ / Trung bình / Khó)
    prize_1      = Column(String(255), nullable=True)               # Giải nhất
    prize_2      = Column(String(255), nullable=True)               # Giải nhì
    prize_3      = Column(String(255), nullable=True)               # Giải ba
    ranking_policy = Column(String(50), default="realtime")         # Cơ chế công bố bảng xếp hạng ('realtime' / 'after_end')

class ContestExam(Base):
    __tablename__ = "contest_exams"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    order = Column(Integer, default=1)

class ContestQuestion(Base):
    __tablename__ = "contest_questions"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("contest_exams.id", ondelete="CASCADE"), nullable=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(255), nullable=True)
    option_b = Column(String(255), nullable=True)
    option_c = Column(String(255), nullable=True)
    option_d = Column(String(255), nullable=True)
    correct_option = Column(Integer, nullable=True) # 0, 1, 2, 3
    points = Column(Integer, default=1)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)  # Mã tài khoản thành viên (Khóa chính)
    username = Column(String(50), unique=True, nullable=False)  # Tên đăng nhập
    email = Column(String(100), unique=True, nullable=False)  # Địa chỉ Email tài khoản
    password = Column(String(100), nullable=False)  # Mật khẩu tài khoản (mã hóa)
    role = Column(String(20), default="user")  # Quyền hạn tài khoản (ví dụ: admin, user)
    points = Column(Integer, default=0)  # Điểm tích lũy học tập của thành viên
    avatar = Column(String(255), default="http://localhost:8000/upload/avatar/default_avatar.png")  # Đường dẫn ảnh đại diện của thành viên
    fullname = Column(String(100), nullable=True)  # Tên đầy đủ học viên
    status = Column(String(20), default="Hoạt động")  # Trạng thái hoạt động
    contest_banned = Column(Integer, default=0)  # Trạng thái cấm thi đấu (0: bình thường, 1: bị cấm)
    phone = Column(String(20), nullable=True)  # Số điện thoại
    birthdate = Column(String(20), nullable=True)  # Ngày sinh
    gender = Column(String(10), nullable=True)  # Giới tính
    address = Column(String(255), nullable=True)  # Địa chỉ
    created_at = Column(DateTime, default=datetime.now)  # Ngày tham gia

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), ForeignKey("users.email", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.now)

class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), ForeignKey("users.email", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Integer, default=1)  # 1: Đã hoàn thành, 0: Chưa
    completed_at = Column(DateTime, default=datetime.now)

class UserExerciseSubmission(Base):
    __tablename__ = "user_exercise_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), ForeignKey("users.email", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("lesson_exercises.id", ondelete="CASCADE"), nullable=False)
    submission_text = Column(Text, nullable=False)  # Nội dung bài nộp (code/văn bản)
    submitted_at = Column(DateTime, default=datetime.now)

class ContestSubmission(Base):
    """Lưu kết quả bài thi trắc nghiệm của học viên sau khi nộp bài."""
    __tablename__ = "contest_submissions"

    id           = Column(Integer, primary_key=True, index=True)
    contest_id   = Column(Integer, ForeignKey("contests.id", ondelete="CASCADE"), nullable=False)
    exam_id      = Column(Integer, ForeignKey("contest_exams.id", ondelete="CASCADE"), nullable=True)
    user_id      = Column(Integer, nullable=True)                  # Cột cũ (giữ lại tương thích)
    score        = Column(Integer, default=0)                      # Điểm số đạt được
    time_taken   = Column(Integer, nullable=True)                  # Cột cũ (giữ lại tương thích)
    submitted_at = Column(DateTime, default=datetime.now)          # Thời điểm nộp bài
    email        = Column(String(100), nullable=True)              # Email học viên
    total_score  = Column(Integer, default=0)                      # Tổng điểm tối đa của đề thi
    correct_count= Column(Integer, default=0)                      # Số câu trả lời đúng
    total_count  = Column(Integer, default=0)                      # Tổng số câu hỏi
    answers_json = Column(Text, nullable=True)                     # JSON lưu {questionId: chosenOptionIndex}

class CourseReview(Base):
    """Lưu đánh giá và nhận xét của học viên về khóa học."""
    __tablename__ = "course_reviews"

    id          = Column(Integer, primary_key=True, index=True)
    course_id   = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)  # Liên kết khóa học
    email       = Column(String(100), ForeignKey("users.email", ondelete="CASCADE"), nullable=False)  # Email học viên
    fullname    = Column(String(100), nullable=True)               # Tên hiển thị của học viên
    rating      = Column(Integer, nullable=False)                  # Số sao đánh giá (1 - 5)
    comment     = Column(Text, nullable=True)                      # Nội dung nhận xét
    created_at  = Column(DateTime, default=datetime.now)           # Thời điểm đánh giá

class Voucher(Base):
    """Lưu trữ thông tin mã giảm giá/voucher."""
    __tablename__ = "vouchers"

    id             = Column(Integer, primary_key=True, index=True)
    code           = Column(String(50), unique=True, nullable=False, index=True)  # Mã code (ví dụ: EDUPRO10)
    name           = Column(String(255), nullable=False)  # Tên voucher (ví dụ: Giảm giá hè)
    discount_type  = Column(String(20), nullable=False)  # 'percent' hoặc 'amount'
    discount_value = Column(Integer, nullable=False)  # Giá trị giảm (ví dụ: 10 hoặc 50000)
    limit_uses     = Column(Integer, default=100)  # Giới hạn tổng số lượt dùng
    used_uses      = Column(Integer, default=0)  # Số lượt đã sử dụng
    start_date     = Column(DateTime, nullable=False, default=datetime.now)  # Ngày bắt đầu
    end_date       = Column(DateTime, nullable=False)  # Ngày hết hạn
    status         = Column(String(20), default="Hoạt động")  # 'Hoạt động' hoặc 'Ngưng áp dụng'

class UserCourse(Base):
    """Lưu trữ thông tin các khóa học mà người dùng đã sở hữu/mua."""
    __tablename__ = "user_courses"

    id          = Column(Integer, primary_key=True, index=True)
    email       = Column(String(100), ForeignKey("users.email", ondelete="CASCADE"), nullable=False)
    course_id   = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    created_at  = Column(DateTime, default=datetime.now)

class PaymentRecord(Base):
    """Lưu trữ lịch sử giao dịch thanh toán đã xác thực từ SePay."""
    __tablename__ = "payment_records"

    id          = Column(Integer, primary_key=True, index=True)
    ref_code    = Column(String(50), unique=True, index=True, nullable=False)
    amount      = Column(Numeric(12, 2), nullable=True)
    email       = Column(String(100), nullable=True)
    status      = Column(String(20), default="pending")
    created_at  = Column(DateTime, default=datetime.now)




