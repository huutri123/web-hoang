from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from connectionDB import get_db
from models import Course, CourseChapter, CourseLesson, LessonExercise, UserLessonProgress, UserExerciseSubmission, User, UserCourse

router = APIRouter(
    prefix="/api/learning",
    tags=["learning"]
)

@router.get("/course/{course_id}/syllabus")
def get_course_syllabus(course_id: int, email: str, db: Session = Depends(get_db)):
    """Lấy cấu trúc giáo trình gồm chương và bài học kèm tiến độ học viên."""
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Không tìm thấy khóa học!")

        # Kiểm tra quyền truy cập của người dùng (Chỉ cho phép admin hoặc học viên đã mua khóa học)
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Người dùng không tồn tại!")
            
        if user.role != "admin":
            enrolled = db.query(UserCourse).filter(
                UserCourse.email == email,
                UserCourse.course_id == course_id
            ).first()
            if not enrolled:
                raise HTTPException(status_code=403, detail="Bạn chưa mua khóa học này!")

        # Lấy tất cả chương học
        chapters = db.query(CourseChapter).filter(CourseChapter.course_id == course_id).order_by(CourseChapter.order).all()
        
        # Lấy danh sách bài học đã học xong của học viên
        completed_lessons = db.query(UserLessonProgress).filter(
            UserLessonProgress.email == email,
            UserLessonProgress.completed == 1
        ).all()
        completed_ids = {p.lesson_id for p in completed_lessons}

        total_lessons = 0
        completed_count = 0
        chapters_data = []

        for ch in chapters:
            lessons = db.query(CourseLesson).filter(CourseLesson.chapter_id == ch.id).order_by(CourseLesson.order).all()
            lessons_data = []
            
            for ls in lessons:
                total_lessons += 1
                is_completed = ls.id in completed_ids
                if is_completed:
                    completed_count += 1
                
                lessons_data.append({
                    "id": ls.id,
                    "chapter_id": ls.chapter_id,
                    "title": ls.title,
                    "type": ls.type,
                    "duration": ls.duration or "00:00",
                    "order": ls.order,
                    "video_url": ls.video_url,
                    "content": ls.content,
                    "completed": is_completed
                })
            
            chapters_data.append({
                "id": ch.id,
                "title": ch.title,
                "order": ch.order,
                "lessons": lessons_data
            })

        progress_percentage = 0
        if total_lessons > 0:
            progress_percentage = int((completed_count / total_lessons) * 100)

        return {
            "course_id": course.id,
            "course_title": course.title,
            "progress": progress_percentage,
            "total_lessons": total_lessons,
            "completed_lessons": completed_count,
            "chapters": chapters_data
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Lỗi hệ thống: " + str(e))

@router.post("/lesson/complete")
def complete_lesson(payload: dict, db: Session = Depends(get_db)):
    """Đánh dấu hoàn thành / chưa hoàn thành bài học."""
    try:
        email = payload.get("email")
        lesson_id = payload.get("lesson_id")
        completed = payload.get("completed", True)

        if not email or not lesson_id:
            raise HTTPException(status_code=400, detail="Thiếu email học viên hoặc mã bài học!")

        # Kiểm tra bài học tồn tại
        lesson = db.query(CourseLesson).filter(CourseLesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Bài học không tồn tại!")

        # Cập nhật hoặc thêm mới tiến trình
        progress = db.query(UserLessonProgress).filter(
            UserLessonProgress.email == email,
            UserLessonProgress.lesson_id == lesson_id
        ).first()

        val = 1 if completed else 0

        if progress:
            progress.completed = val
        else:
            progress = UserLessonProgress(
                email=email,
                lesson_id=lesson_id,
                completed=val
            )
            db.add(progress)

        db.commit()
        return {"message": "Cập nhật tiến trình học tập thành công!", "completed": val == 1}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Lỗi lưu tiến trình: " + str(e))

@router.get("/lesson/{lesson_id}/exercises")
def get_lesson_exercises(lesson_id: int, email: str, db: Session = Depends(get_db)):
    """Lấy danh sách bài tập của bài học kèm trạng thái nộp bài của học viên."""
    try:
        exercises = db.query(LessonExercise).filter(LessonExercise.lesson_id == lesson_id).order_by(LessonExercise.order).all()
        
        exercises_data = []
        for ex in exercises:
            submission = db.query(UserExerciseSubmission).filter(
                UserExerciseSubmission.email == email,
                UserExerciseSubmission.exercise_id == ex.id
            ).first()

            sub_data = None
            if submission:
                sub_data = {
                    "submission_text": submission.submission_text,
                    "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None
                }

            exercises_data.append({
                "id": ex.id,
                "lesson_id": ex.lesson_id,
                "question": ex.question,
                "answer": ex.answer,  # Hướng dẫn gợi ý giải quyết bài tập
                "order": ex.order,
                "submission": sub_data
            })

        return {"exercises": exercises_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi lấy bài tập: " + str(e))

@router.post("/exercise/submit")
def submit_exercise(payload: dict, db: Session = Depends(get_db)):
    """Nộp bài làm bài tập."""
    try:
        email = payload.get("email")
        exercise_id = payload.get("exercise_id")
        submission_text = payload.get("submission_text")

        if not email or not exercise_id or submission_text is None:
            raise HTTPException(status_code=400, detail="Thiếu thông tin nộp bài tập!")

        # Kiểm tra bài tập tồn tại
        ex = db.query(LessonExercise).filter(LessonExercise.id == exercise_id).first()
        if not ex:
            raise HTTPException(status_code=404, detail="Bài tập không tồn tại!")

        # Thêm hoặc cập nhật bài nộp
        sub = db.query(UserExerciseSubmission).filter(
            UserExerciseSubmission.email == email,
            UserExerciseSubmission.exercise_id == exercise_id
        ).first()

        if sub:
            sub.submission_text = submission_text
        else:
            sub = UserExerciseSubmission(
                email=email,
                exercise_id=exercise_id,
                submission_text=submission_text
            )
            db.add(sub)

        db.commit()
        return {"message": "Nộp bài tập thành công!"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Lỗi nộp bài tập: " + str(e))
