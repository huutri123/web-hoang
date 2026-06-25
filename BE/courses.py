import re
import time
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from connectionDB import get_db
from models import Course, CourseChapter, CourseLesson, LessonExercise, CourseReview, User, UserCourse
from sqlalchemy import func

router = APIRouter(
    prefix="/api/courses",
    tags=["courses"]
)

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[áàảãạăắằẳẵặâấầẩẫậ]', 'a', text)
    text = re.sub(r'[éèẻẽẹêếềểễệ]', 'e', text)
    text = re.sub(r'[íìỉĩị]', 'i', text)
    text = re.sub(r'[óòỏõọôốồổỗộơớờởỡợ]', 'o', text)
    text = re.sub(r'[úùủũụưứừửữự]', 'u', text)
    text = re.sub(r'[ýỳỷỹỵ]', 'y', text)
    text = re.sub(r'[đ]', 'd', text)
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'[^a-z0-9\-]', '', text)
    return text

def map_course_to_fe(c: Course):
    # Xử lý goals mục tiêu khóa học
    goals_list = []
    if c.goals:
        try:
            goals_list = json.loads(c.goals)
            if not isinstance(goals_list, list):
                goals_list = [str(goals_list)]
        except:
            goals_list = [g.strip() for g in c.goals.split("\n") if g.strip()]

    # Ánh xạ từ DB schema sang định dạng FE mong đợi để giữ tương thích
    return {
        "id": c.id,
        "slug": c.slug,
        "category": c.category,
        "image": c.image,
        "title": c.title,
        "description": c.description,
        "detailed_description": c.detailed_description,
        "price_old": c.price_old,
        "price_discount": c.price_discount,
        "instructor": c.instructor,
        "duration": c.duration,
        "level": c.level,
        "rating": float(c.rating) if c.rating is not None else 0.0,
        "student_count": c.student_count,
        "video": c.video,
        "goals": goals_list,
        "goals_raw": c.goals or "",
        
        # Các cột tương thích FE cũ
        "subtitle": c.description[:120] + "..." if c.description else "",
        "instructorAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
        "price": c.price_discount,
        "students": str(c.student_count or 0),
        "status": "Hiển thị",  # Mặc định tất cả hiển thị
        "icon": c.image or "📘"
    }

# 1. API Lấy danh sách khóa học
@router.get("")
def get_all_courses(db: Session = Depends(get_db)):
    try:
        courses = db.query(Course).all()
        return [map_course_to_fe(c) for c in courses]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi lấy danh sách khóa học: " + str(e))

# API Lấy danh sách khóa học đã mua/sở hữu của người dùng
@router.get("/my-courses")
def get_my_courses(email: str = Query(..., description="Email người dùng"), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng!")
            
        # Nếu là admin, trả về tất cả khóa học
        if user.role == "admin":
            courses = db.query(Course).all()
            return [map_course_to_fe(c) for c in courses]
            
        # Nếu là user thường, lấy danh sách khóa học trong bảng UserCourse
        user_courses = db.query(UserCourse).filter(UserCourse.email == email).all()
        course_ids = [uc.course_id for uc in user_courses]
        
        if not course_ids:
            return []
            
        courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
        return [map_course_to_fe(c) for c in courses]
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi lấy danh sách khóa học của tôi: " + str(e))

# API Lấy chi tiết khóa học bằng ID hoặc Slug
@router.get("/{identifier}")
def get_course_detail(identifier: str, db: Session = Depends(get_db)):
    try:
        if identifier.isdigit():
            course = db.query(Course).filter(Course.id == int(identifier)).first()
        else:
            course = db.query(Course).filter(Course.slug == identifier).first()
            
        if not course:
            raise HTTPException(status_code=404, detail="Không tìm thấy khóa học!")
            
        # Lấy thông tin chương và bài học
        from models import CourseChapter, CourseLesson, LessonExercise
        chapters = db.query(CourseChapter).filter(CourseChapter.course_id == course.id).order_by(CourseChapter.order).all()
        
        syllabus_list = []
        total_lessons = 0
        for ch in chapters:
            lessons = db.query(CourseLesson).filter(CourseLesson.chapter_id == ch.id).order_by(CourseLesson.order).all()
            total_lessons += len(lessons)
            
            lessons_detail = []
            for ls in lessons:
                exercises = db.query(LessonExercise).filter(LessonExercise.lesson_id == ls.id).order_by(LessonExercise.order).all()
                lessons_detail.append({
                    "id": ls.id,
                    "title": ls.title,
                    "type": ls.type,
                    "duration": ls.duration or "",
                    "video_url": ls.video_url or "",
                    "content": ls.content or "",
                    "exercises": [{"id": ex.id, "question": ex.question, "answer": ex.answer} for ex in exercises]
                })
                
            syllabus_list.append({
                "id": ch.id,
                "chapter": ch.title,
                "title": ch.title,
                "lessons": lessons_detail
            })
            
        res_data = map_course_to_fe(course)
        res_data["syllabus"] = syllabus_list or None
        res_data["lessons_count"] = total_lessons

        # Lấy danh sách đánh giá của khóa học
        reviews_db = db.query(CourseReview).filter(
            CourseReview.course_id == course.id
        ).order_by(CourseReview.created_at.desc()).all()

        reviews_list = [{
            "id": r.id,
            "email": r.email,
            "name": r.fullname or r.email.split('@')[0],
            "avatar": r.fullname[0].upper() if r.fullname else r.email[0].upper(),
            "rating": r.rating,
            "comment": r.comment or "",
            "date": r.created_at.strftime("%d/%m/%Y") if r.created_at else ""
        } for r in reviews_db]

        res_data["reviews"] = reviews_list
        res_data["reviews_count"] = len(reviews_list)

        # Tính lại rating trung bình từ đánh giá thực tế
        if reviews_list:
            avg = round(sum(r["rating"] for r in reviews_list) / len(reviews_list), 1)
            res_data["rating"] = avg

        return res_data
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi lấy chi tiết khóa học: " + str(e))

# 2. API Tạo khóa học mới
@router.post("")
async def create_course(course_data: dict, db: Session = Depends(get_db)):
    try:
        title = course_data.get("title", "Khóa học mới")
        slug = course_data.get("slug") or (slugify(title) + "-" + str(int(time.time())))
        
        # 1. Tạo bản ghi khóa học
        new_course = Course(
            slug=slug,
            category=course_data.get("category", "Lập trình"),
            image=course_data.get("image") or course_data.get("icon", "📘"),
            title=title,
            description=course_data.get("description") or course_data.get("subtitle", ""),
            detailed_description=course_data.get("detailed_description") or None,
            price_old=course_data.get("price_old"),
            price_discount=course_data.get("price_discount") or course_data.get("price_current") or course_data.get("price", "0đ"),
            instructor=course_data.get("instructor", "Nguyễn Văn An"),
            duration=course_data.get("duration", "30 giờ"),
            level=course_data.get("level", "Trung cấp"),
            rating=float(course_data.get("rating", 0.0)),
            student_count=int(course_data.get("student_count") or course_data.get("students") or 0),
            video=course_data.get("video"),
            goals=course_data.get("goals") or None
        )
        db.add(new_course)
        db.flush()  # Sinh ra new_course.id cho khóa ngoại

        # 2. Lưu các chương và bài học nếu có gửi lên
        chapters_data = course_data.get("chapters", [])
        for ch_idx, ch_data in enumerate(chapters_data):
            new_chapter = CourseChapter(
                course_id=new_course.id,
                title=ch_data.get("title", f"Chương {ch_idx + 1}"),
                order=ch_idx + 1
            )
            db.add(new_chapter)
            db.flush()  # Sinh ra new_chapter.id

            lessons_data = ch_data.get("lessons", [])
            for ls_idx, ls_data in enumerate(lessons_data):
                new_lesson = CourseLesson(
                    chapter_id=new_chapter.id,
                    title=ls_data.get("title", f"Bài {ls_idx + 1}"),
                    type=ls_data.get("type", "video"),
                    duration=ls_data.get("duration"),
                    order=ls_idx + 1,
                    video_url=ls_data.get("video_url"),
                    content=ls_data.get("content")
                )
                db.add(new_lesson)
                db.flush()  # Sinh ra new_lesson.id cho khóa ngoại

                # Lưu danh sách bài tập tự luận nếu có
                exercises_data = ls_data.get("exercises", [])
                for ex_idx, ex_data in enumerate(exercises_data):
                    if ex_data.get("question", "").strip():
                        new_exercise = LessonExercise(
                            lesson_id=new_lesson.id,
                            question=ex_data.get("question", "").strip(),
                            answer=ex_data.get("answer", "").strip() or None,
                            order=ex_idx + 1
                        )
                        db.add(new_exercise)

        db.commit()
        db.refresh(new_course)
        return {"message": "Tạo khóa học thành công!", "course": map_course_to_fe(new_course)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi tạo khóa học: " + str(e))

# 3. API Sửa thông tin khóa học
@router.put("/{course_id}")
async def update_course(course_id: int, course_data: dict, db: Session = Depends(get_db)):
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Không tìm thấy khóa học!")
        
        course.title = course_data.get("title", course.title)
        course.description = course_data.get("description") or course_data.get("subtitle", course.description)
        course.category = course_data.get("category", course.category)
        course.image = course_data.get("image") or course_data.get("icon", course.image)
        course.price_discount = course_data.get("price_discount") or course_data.get("price_current") or course_data.get("price", course.price_discount)
        course.price_old = course_data.get("price_old", course.price_old)
        course.instructor = course_data.get("instructor", course.instructor)
        course.duration = course_data.get("duration", course.duration)
        course.level = course_data.get("level", course.level)
        course.rating = float(course_data.get("rating", course.rating))
        course.student_count = int(course_data.get("student_count") or course_data.get("students") or course.student_count)
        
        if "goals" in course_data:
            course.goals = course_data.get("goals")
            
        # Cập nhật chương và bài giảng
        if "chapters" in course_data:
            from models import CourseChapter, CourseLesson, LessonExercise
            # Xóa các chương học cũ (Cascade delete tự động xóa lessons và exercises)
            db.query(CourseChapter).filter(CourseChapter.course_id == course.id).delete()
            db.flush()
            
            chapters_data = course_data.get("chapters", [])
            for ch_idx, ch_data in enumerate(chapters_data):
                new_chapter = CourseChapter(
                    course_id=course.id,
                    title=ch_data.get("title", f"Chương {ch_idx + 1}"),
                    order=ch_idx + 1
                )
                db.add(new_chapter)
                db.flush()  # Sinh ra new_chapter.id

                lessons_data = ch_data.get("lessons", [])
                for ls_idx, ls_data in enumerate(lessons_data):
                    new_lesson = CourseLesson(
                        chapter_id=new_chapter.id,
                        title=ls_data.get("title", f"Bài {ls_idx + 1}"),
                        type=ls_data.get("type", "video"),
                        duration=ls_data.get("duration"),
                        order=ls_idx + 1,
                        video_url=ls_data.get("video_url"),
                        content=ls_data.get("content")
                    )
                    db.add(new_lesson)
                    db.flush()  # Sinh ra new_lesson.id cho khóa ngoại

                    # Lưu danh sách bài tập tự luận nếu có
                    exercises_data = ls_data.get("exercises", [])
                    for ex_idx, ex_data in enumerate(exercises_data):
                        if ex_data.get("question", "").strip():
                            new_exercise = LessonExercise(
                                lesson_id=new_lesson.id,
                                question=ex_data.get("question", "").strip(),
                                answer=ex_data.get("answer", "").strip() or None,
                                order=ex_idx + 1
                            )
                            db.add(new_exercise)

        db.commit()
        db.refresh(course)
        return {"message": "Cập nhật khóa học thành công!", "course": map_course_to_fe(course)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi sửa khóa học: " + str(e))

# 4. API Xóa khóa học
@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Không tìm thấy khóa học!")
        db.delete(course)
        db.commit()
        return {"message": "Xóa khóa học thành công!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi xóa khóa học: " + str(e))


# 5. API Lấy danh sách đánh giá của khóa học
@router.get("/{course_id}/reviews")
def get_course_reviews(course_id: int, db: Session = Depends(get_db)):
    """Trả về tất cả đánh giá của học viên cho một khóa học."""
    try:
        reviews = db.query(CourseReview).filter(
            CourseReview.course_id == course_id
        ).order_by(CourseReview.created_at.desc()).all()

        return [{
            "id": r.id,
            "email": r.email,
            "name": r.fullname or r.email.split('@')[0],
            "avatar": r.fullname[0].upper() if r.fullname else r.email[0].upper(),
            "rating": r.rating,
            "comment": r.comment or "",
            "date": r.created_at.strftime("%d/%m/%Y") if r.created_at else ""
        } for r in reviews]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi lấy danh sách đánh giá: " + str(e))


# 6. API Gửi đánh giá mới cho khóa học
@router.post("/{course_id}/reviews")
def add_course_review(course_id: int, payload: dict, db: Session = Depends(get_db)):
    """Học viên gửi đánh giá mới (hoặc cập nhật đánh giá cũ nếu đã từng đánh giá)."""
    try:
        email = (payload.get("email") or "").strip()
        rating = int(payload.get("rating", 5))
        comment = (payload.get("comment") or "").strip()

        if not email:
            raise HTTPException(status_code=400, detail="Vui lòng đăng nhập để gửi đánh giá!")
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Số sao đánh giá phải từ 1 đến 5!")
        if not comment:
            raise HTTPException(status_code=400, detail="Vui lòng nhập nội dung đánh giá!")

        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Không tìm thấy khóa học!")

        # Lấy tên đầy đủ từ bảng users
        user = db.query(User).filter(User.email == email).first()
        fullname = user.fullname or user.username if user else email.split('@')[0]

        # Kiểm tra xem học viên đã mua khóa học này chưa (nếu không phải admin)
        if user and user.role != "admin":
            enrolled = db.query(UserCourse).filter(
                UserCourse.email == email,
                UserCourse.course_id == course_id
            ).first()
            if not enrolled:
                raise HTTPException(status_code=403, detail="Bạn phải mua khóa học này mới được đánh giá!")

        # Kiểm tra học viên đã đánh giá khóa học này chưa
        existing = db.query(CourseReview).filter(
            CourseReview.course_id == course_id,
            CourseReview.email == email
        ).first()

        if existing:
            # Cập nhật đánh giá cũ
            existing.rating = rating
            existing.comment = comment
            existing.fullname = fullname
            db.commit()
            review = existing
            msg = "Cập nhật đánh giá thành công!"
        else:
            # Tạo đánh giá mới
            review = CourseReview(
                course_id=course_id,
                email=email,
                fullname=fullname,
                rating=rating,
                comment=comment
            )
            db.add(review)
            db.commit()
            db.refresh(review)
            msg = "Gửi đánh giá thành công!"

        # Cập nhật lại điểm rating trung bình của khóa học
        all_reviews = db.query(CourseReview).filter(CourseReview.course_id == course_id).all()
        if all_reviews:
            avg_rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 1)
            course.rating = avg_rating
            db.commit()

        return {
            "message": msg,
            "review": {
                "id": review.id,
                "email": review.email,
                "name": fullname,
                "avatar": fullname[0].upper() if fullname else "U",
                "rating": review.rating,
                "comment": review.comment or "",
                "date": review.created_at.strftime("%d/%m/%Y") if review.created_at else ""
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi gửi đánh giá: " + str(e))


# 7. API Xóa đánh giá (chỉ chủ nhân đánh giá mới được xóa)
@router.delete("/{course_id}/reviews/{review_id}")
def delete_course_review(course_id: int, review_id: int, email: str, db: Session = Depends(get_db)):
    """Học viên xóa đánh giá của chính mình."""
    try:
        review = db.query(CourseReview).filter(
            CourseReview.id == review_id,
            CourseReview.course_id == course_id,
            CourseReview.email == email
        ).first()

        if not review:
            raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá hoặc bạn không có quyền xóa!")

        db.delete(review)
        db.commit()

        # Cập nhật lại điểm rating trung bình của khóa học
        course = db.query(Course).filter(Course.id == course_id).first()
        if course:
            remaining = db.query(CourseReview).filter(CourseReview.course_id == course_id).all()
            course.rating = round(sum(r.rating for r in remaining) / len(remaining), 1) if remaining else 0.0
            db.commit()

        return {"message": "Đã xóa đánh giá thành công!"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi xóa đánh giá: " + str(e))
