from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from connectionDB import get_db
from models import Contest, ContestQuestion, ContestSubmission, User, ContestExam
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/api/contests",
    tags=["Contests"]
)

# ==========================================
# HÀM TIỆN ÍCH
# ==========================================

def compute_status(start_time, end_time) -> str:
    """Tính trạng thái cuộc thi tự động từ thời gian bắt đầu và kết thúc."""
    now = datetime.now()
    if now < start_time:
        return "Sắp diễn ra"
    elif now > end_time:
        return "Đã kết thúc"
    else:
        return "Đang diễn ra"

def contest_to_dict(c: Contest, db: Session = None) -> dict:
    """Chuyển object Contest thành dict trả về cho FE, bao gồm trạng thái tự tính, các bài thi (exams) và câu hỏi."""
    exams_list = []
    questions_list = []
    if db:
        try:
            # 1. Tự động migrate dữ liệu cũ nếu chưa có bài thi (contest_exams) nào
            exam_count = db.query(ContestExam).filter(ContestExam.contest_id == c.id).count()
            if exam_count == 0:
                direct_questions = db.query(ContestQuestion).filter(
                    ContestQuestion.contest_id == c.id, 
                    ContestQuestion.exam_id == None
                ).all()
                if direct_questions:
                    default_exam = ContestExam(contest_id=c.id, title="Bài thi 1", order=1)
                    db.add(default_exam)
                    db.flush()
                    for dq in direct_questions:
                        dq.exam_id = default_exam.id
                    db.commit()
            
            # 2. Lấy danh sách bài thi
            exams_db = db.query(ContestExam).filter(ContestExam.contest_id == c.id).order_by(ContestExam.order.asc()).all()
            for exam in exams_db:
                q_db = db.query(ContestQuestion).filter(ContestQuestion.exam_id == exam.id).all()
                qs = [{
                    "id": q.id,
                    "text": q.question_text,
                    "options": [q.option_a, q.option_b, q.option_c, q.option_d],
                    "correctOption": q.correct_option,
                    "points": q.points or 1
                } for q in q_db]
                exams_list.append({
                    "id": exam.id,
                    "title": exam.title,
                    "questions": qs
                })
                
            if exams_list:
                questions_list = exams_list[0]["questions"]
            else:
                questions_list = []
        except Exception as e:
            print(f"Error fetching contest exams/questions: {e}")

    return {
        "id": c.id,
        "title": c.title,
        "short_desc": c.short_desc,
        "description": c.description,
        "image": c.image,
        "banner": c.banner,
        "topic": c.topic,
        "start_time": c.start_time.strftime("%d/%m/%Y %H:%M") if c.start_time else None,
        "end_time": c.end_time.strftime("%d/%m/%Y %H:%M") if c.end_time else None,
        "duration": c.duration,
        "max_attempts": c.max_attempts,
        "passing_score": c.passing_score,
        "password": c.password,
        "participants": c.participants or 0,
        "level": c.level,
        "prize_1": c.prize_1,
        "prize_2": c.prize_2,
        "prize_3": c.prize_3,
        "ranking_policy": c.ranking_policy or "realtime",
        "status": compute_status(c.start_time, c.end_time),
        "exams": exams_list,
        "questions": questions_list
    }

# ==========================================
# GET: Lấy danh sách tất cả cuộc thi
# ==========================================
@router.get("")
def get_all_contests(db: Session = Depends(get_db)):
    """Trả về danh sách tất cả cuộc thi, trạng thái tự tính từ thời gian."""
    try:
        contests = db.query(Contest).order_by(Contest.start_time.desc()).all()
        # Trả về list cuộc thi mà không kèm chi tiết câu hỏi để tối ưu hiệu năng
        return [contest_to_dict(c) for c in contests]
    except Exception as e:
        return {"error": "Lỗi lấy danh sách cuộc thi: " + str(e)}

# ==========================================
# GET: Lấy bảng xếp hạng tổng hợp (toàn hệ thống)
# Query param: period = 'week' / 'month' / 'all'
# ==========================================
@router.get("/global-leaderboard")
def get_global_leaderboard(period: str = "all", db: Session = Depends(get_db)):
    """Trả về bảng xếp hạng tổng hợp trên toàn hệ thống dựa trên tổng điểm các cuộc thi."""
    try:
        # 1. Lấy tất cả các cuộc thi
        contests = db.query(Contest).all()
        total_contests_count = len(contests)

        # 2. Lấy tất cả bài thi (ContestExam)
        contest_exams = db.query(ContestExam).all()
        # Gom nhóm exam_ids theo contest_id
        contest_to_exams = {}
        for exam in contest_exams:
            if exam.contest_id not in contest_to_exams:
                contest_to_exams[exam.contest_id] = []
            contest_to_exams[exam.contest_id].append(exam.id)

        # 3. Lấy các lượt nộp bài, có thể lọc theo khoảng thời gian
        query = db.query(ContestSubmission)
        if period == "week":
            start_date = datetime.now() - timedelta(days=7)
            query = query.filter(ContestSubmission.submitted_at >= start_date)
        elif period == "month":
            start_date = datetime.now() - timedelta(days=30)
            query = query.filter(ContestSubmission.submitted_at >= start_date)

        submissions = query.all()

        # 4. Gom nhóm các bài nộp theo: email -> contest_id -> exam_id -> list of submissions
        user_submissions = {}
        for sub in submissions:
            email = sub.email
            if not email:
                continue
            if email not in user_submissions:
                user_submissions[email] = {}
            c_id = sub.contest_id
            if c_id not in user_submissions[email]:
                user_submissions[email][c_id] = {}
            e_id = sub.exam_id
            if e_id not in user_submissions[email][c_id]:
                user_submissions[email][c_id][e_id] = []
            user_submissions[email][c_id][e_id].append(sub)

        # 5. Lấy tất cả user từ hệ thống
        users = db.query(User).all()

        # 6. Tính điểm cho mỗi user
        leaderboard_candidates = []
        for user in users:
            email = user.email
            global_score = 0
            completed_contests = 0
            latest_time = None

            if email in user_submissions:
                for c_id, exams_subs in user_submissions[email].items():
                    exam_ids = contest_to_exams.get(c_id, [])
                    if not exam_ids:
                        continue

                    # Kiểm tra xem user đã làm đủ hết tất cả các bài thi trong cuộc thi này chưa
                    has_all = True
                    for e_id in exam_ids:
                        if e_id not in exams_subs or not exams_subs[e_id]:
                            has_all = False
                            break

                    if has_all:
                        completed_contests += 1
                        # Tính điểm cao nhất cho cuộc thi này (tổng điểm cao nhất của từng bài thi)
                        contest_score = 0
                        for e_id in exam_ids:
                            best_sub = max(exams_subs[e_id], key=lambda s: s.score)
                            contest_score += best_sub.score
                            if latest_time is None or best_sub.submitted_at > latest_time:
                                latest_time = best_sub.submitted_at
                        
                        global_score += contest_score

            level = max(1, int(global_score / 200) + 1)

            leaderboard_candidates.append({
                "email": email,
                "name": user.fullname or user.username or "Ẩn danh",
                "avatar": user.avatar or "http://localhost:8000/upload/avatar/default_avatar.png",
                "level": level,
                "school": user.address or "Thành viên EduPro",
                "points": global_score,
                "solved_count": completed_contests,
                "time": latest_time,
            })

        # 7. Sắp xếp danh sách theo điểm giảm dần, thời gian nộp bài mới nhất tăng dần
        leaderboard_candidates.sort(
            key=lambda x: (-x["points"], x["time"] or datetime.min)
        )

        # 8. Trả về kết quả hoàn chỉnh có Rank và Badge
        leaderboard = []
        for idx, item in enumerate(leaderboard_candidates):
            rank = idx + 1
            if rank == 1:
                badge = "gold"
            elif rank in (2, 3):
                badge = "silver" if rank == 2 else "bronze"
            elif rank <= 7:
                badge = "blue"
            elif rank <= 9:
                badge = "green"
            else:
                badge = "none"

            leaderboard.append({
                "rank": rank,
                "email": item["email"],
                "name": item["name"],
                "avatar": item["avatar"],
                "level": item["level"],
                "school": item["school"],
                "points": item["points"],
                "solved": f"{item['solved_count']} / {total_contests_count}",
                "time": item["time"].strftime("%d/%m/%Y %H:%M") if item["time"] else "--:--",
                "badge": badge,
            })

        return leaderboard
    except Exception as e:
        return {"error": "Lỗi lấy bảng xếp hạng tổng hợp: " + str(e)}

# ==========================================
# GET: Lấy chi tiết một cuộc thi
# ==========================================
@router.get("/{contest_id}")
def get_contest(contest_id: int, db: Session = Depends(get_db)):
    """Trả về thông tin chi tiết của một cuộc thi theo ID kèm bộ đề thi."""
    try:
        c = db.query(Contest).filter(Contest.id == contest_id).first()
        if not c:
            return {"error": "Không tìm thấy cuộc thi!"}
        return contest_to_dict(c, db)
    except Exception as e:
        return {"error": "Lỗi lấy chi tiết cuộc thi: " + str(e)}

# ==========================================
# POST: Tạo cuộc thi mới
# ==========================================
@router.post("")
def create_contest(data: dict, db: Session = Depends(get_db)):
    """Tạo một cuộc thi mới và lưu vào CSDL kèm bộ bài thi và câu hỏi."""
    try:
        def parse_dt(s):
            if not s:
                return None
            for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M"):
                try:
                    return datetime.strptime(s, fmt)
                except ValueError:
                    continue
            return None

        new_contest = Contest(
            title=(data.get("title") or "").strip(),
            short_desc=(data.get("short_desc") or "").strip(),
            description=(data.get("description") or "").strip(),
            image=(data.get("image") or "").strip() or None,
            banner=(data.get("banner") or "").strip() or None,
            topic=(data.get("topic") or "").strip() or None,
            start_time=parse_dt(data.get("start_time")),
            end_time=parse_dt(data.get("end_time")),
            duration=int(data.get("duration", 60)),
            max_attempts=int(data.get("max_attempts", 1)),
            passing_score=int(data.get("passing_score", 50)),
            password=(data.get("password") or "").strip() or None,
            participants=0,
            level=(data.get("level") or "Trung bình").strip(),
            prize_1=(data.get("prize_1") or "").strip() or None,
            prize_2=(data.get("prize_2") or "").strip() or None,
            prize_3=(data.get("prize_3") or "").strip() or None,
            ranking_policy=(data.get("ranking_policy") or "realtime").strip(),
        )
        db.add(new_contest)
        db.flush()

        # Lưu danh sách bài thi và câu hỏi trắc nghiệm
        exams_data = data.get("exams", [])
        if not exams_data and "questions" in data:
            exams_data = [{
                "title": "Bài thi 1",
                "questions": data["questions"]
            }]

        for idx, exam_data in enumerate(exams_data):
            new_exam = ContestExam(
                contest_id=new_contest.id,
                title=(exam_data.get("title") or f"Bài thi {idx + 1}").strip(),
                order=idx + 1
            )
            db.add(new_exam)
            db.flush()

            questions_data = exam_data.get("questions", [])
            for q_data in questions_data:
                q_points = int(q_data.get("points", 1))
                options = q_data.get("options", ["", "", "", ""])
                while len(options) < 4:
                    options.append("")
                new_question = ContestQuestion(
                    contest_id=new_contest.id,
                    exam_id=new_exam.id,
                    question_text=q_data.get("text", "").strip(),
                    option_a=options[0].strip(),
                    option_b=options[1].strip(),
                    option_c=options[2].strip(),
                    option_d=options[3].strip(),
                    correct_option=int(q_data.get("correctOption", 0)),
                    points=q_points
                )
                db.add(new_question)

        db.commit()
        db.refresh(new_contest)
        return {"message": "Tạo cuộc thi thành công!", "contest": contest_to_dict(new_contest, db)}
    except Exception as e:
        db.rollback()
        return {"error": "Lỗi tạo cuộc thi: " + str(e)}

# ==========================================
# PUT: Cập nhật cuộc thi
# ==========================================
@router.put("/{contest_id}")
def update_contest(contest_id: int, data: dict, db: Session = Depends(get_db)):
    """Cập nhật thông tin cuộc thi theo ID và đồng bộ bộ bài thi/câu hỏi."""
    try:
        c = db.query(Contest).filter(Contest.id == contest_id).first()
        if not c:
            return {"error": "Không tìm thấy cuộc thi!"}

        def parse_dt(s):
            if not s:
                return None
            for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M"):
                try:
                    return datetime.strptime(s, fmt)
                except ValueError:
                    continue
            return None

        if "title" in data:        c.title       = (data["title"] or "").strip()
        if "short_desc" in data:   c.short_desc  = (data["short_desc"] or "").strip()
        if "description" in data:  c.description = (data["description"] or "").strip()
        if "image" in data:        c.image       = (data["image"] or "").strip() or None
        if "banner" in data:       c.banner      = (data["banner"] or "").strip() or None
        if "topic" in data:        c.topic       = (data["topic"] or "").strip() or None
        if "start_time" in data:   c.start_time  = parse_dt(data["start_time"])
        if "end_time" in data:     c.end_time    = parse_dt(data["end_time"])
        if "duration" in data:     c.duration    = int(data["duration"])
        if "max_attempts" in data: c.max_attempts = int(data["max_attempts"])
        if "passing_score" in data:c.passing_score = int(data["passing_score"])
        if "password" in data:     c.password    = (data["password"] or "").strip() or None
        if "level" in data:        c.level       = (data["level"] or "").strip()
        if "prize_1" in data:      c.prize_1     = (data["prize_1"] or "").strip() or None
        if "prize_2" in data:      c.prize_2     = (data["prize_2"] or "").strip() or None
        if "prize_3" in data:      c.prize_3     = (data["prize_3"] or "").strip() or None
        if "ranking_policy" in data: c.ranking_policy = (data["ranking_policy"] or "realtime").strip()

        # Đồng bộ bộ bài thi và câu hỏi
        if "exams" in data or "questions" in data:
            db.query(ContestQuestion).filter(ContestQuestion.contest_id == contest_id).delete()
            db.query(ContestExam).filter(ContestExam.contest_id == contest_id).delete()
            
            exams_data = data.get("exams", [])
            if not exams_data and "questions" in data:
                exams_data = [{
                    "title": "Bài thi 1",
                    "questions": data["questions"]
                }]
                
            for idx, exam_data in enumerate(exams_data):
                new_exam = ContestExam(
                    contest_id=contest_id,
                    title=(exam_data.get("title") or f"Bài thi {idx + 1}").strip(),
                    order=idx + 1
                )
                db.add(new_exam)
                db.flush()
                
                questions_data = exam_data.get("questions", [])
                for q_data in questions_data:
                    q_points = int(q_data.get("points", 1))
                    options = q_data.get("options", ["", "", "", ""])
                    while len(options) < 4:
                        options.append("")
                    new_question = ContestQuestion(
                        contest_id=contest_id,
                        exam_id=new_exam.id,
                        question_text=q_data.get("text", "").strip(),
                        option_a=options[0].strip(),
                        option_b=options[1].strip(),
                        option_c=options[2].strip(),
                        option_d=options[3].strip(),
                        correct_option=int(q_data.get("correctOption", 0)),
                        points=q_points
                    )
                    db.add(new_question)

        db.commit()
        db.refresh(c)
        return {"message": "Cập nhật cuộc thi thành công!", "contest": contest_to_dict(c, db)}
    except Exception as e:
        db.rollback()
        return {"error": "Lỗi cập nhật cuộc thi: " + str(e)}

# ==========================================
# DELETE: Xóa cuộc thi
# ==========================================
@router.delete("/{contest_id}")
def delete_contest(contest_id: int, db: Session = Depends(get_db)):
    """Xóa một cuộc thi khỏi CSDL theo ID."""
    try:
        c = db.query(Contest).filter(Contest.id == contest_id).first()
        if not c:
            return {"error": "Không tìm thấy cuộc thi!"}
        title = c.title
        db.delete(c)
        db.commit()
        return {"message": f"Đã xóa cuộc thi '{title}' thành công!"}
    except Exception as e:
        db.rollback()
        return {"error": "Lỗi xóa cuộc thi: " + str(e)}

# ==========================================
# POST: Nộp bài thi trắc nghiệm
# Body: { email, answers: { "questionId": optionIndex, ... }, examId }
# ==========================================
@router.post("/{contest_id}/submit")
def submit_contest(contest_id: int, data: dict, db: Session = Depends(get_db)):
    """Chấm điểm bài thi trắc nghiệm và lưu kết quả vào CSDL theo từng bài thi riêng biệt."""
    try:
        email = (data.get("email") or "").strip()
        if not email:
            return {"error": "Vui lòng đăng nhập để nộp bài thi!"}

        # Kiểm tra cuộc thi tồn tại
        contest = db.query(Contest).filter(Contest.id == contest_id).first()
        if not contest:
            return {"error": "Không tìm thấy cuộc thi!"}

        # Lấy examId từ payload
        exam_id = data.get("examId") or data.get("exam_id")
        if not exam_id:
            # Fallback: lấy bài thi đầu tiên
            first_exam = db.query(ContestExam).filter(ContestExam.contest_id == contest_id).order_by(ContestExam.order.asc()).first()
            if first_exam:
                exam_id = first_exam.id
            else:
                return {"error": "Cuộc thi chưa có bài thi nào!"}

        # Kiểm tra số lượt thi tối đa cho bài thi cụ thể này
        if contest.max_attempts and contest.max_attempts > 0:
            existing_count = db.query(ContestSubmission).filter(
                ContestSubmission.contest_id == contest_id,
                ContestSubmission.exam_id == exam_id,
                ContestSubmission.email == email
            ).count()
            if existing_count >= contest.max_attempts:
                return {"error": f"Bạn đã hết {contest.max_attempts} lượt thi cho bài thi này!"}

        # Lấy danh sách câu hỏi của bài thi này
        questions = db.query(ContestQuestion).filter(
            ContestQuestion.contest_id == contest_id,
            ContestQuestion.exam_id == exam_id
        ).all()

        if not questions:
            return {"error": "Bài thi chưa có câu hỏi!"}

        # Lấy đáp án học viên đã chọn { "str(questionId)": optionIndex }
        user_answers = data.get("answers", {})

        # Chấm điểm
        score = 0
        correct_count = 0
        total_score = sum(q.points or 1 for q in questions)

        for q in questions:
            chosen = user_answers.get(str(q.id))
            if chosen is not None and int(chosen) == q.correct_option:
                score += (q.points or 1)
                correct_count += 1

        # Lấy thông tin user để lưu quan hệ user_id
        user_record = db.query(User).filter(User.email == email).first()
        user_id = user_record.id if user_record else None

        # Lưu kết quả vào bảng contest_submissions
        import json
        submission = ContestSubmission(
            email=email,
            contest_id=contest_id,
            exam_id=exam_id,
            user_id=user_id,
            score=score,
            total_score=total_score,
            correct_count=correct_count,
            total_count=len(questions),
            answers_json=json.dumps(user_answers)
        )
        db.add(submission)

        # Tăng số lượt tham gia cuộc thi nếu đây là lượt làm bài đầu tiên
        first_ever_submission = db.query(ContestSubmission).filter(
            ContestSubmission.contest_id == contest_id,
            ContestSubmission.email == email
        ).count() == 0
        
        if first_ever_submission:
            contest.participants = (contest.participants or 0) + 1
            
        db.commit()

        # Đếm tổng số lần nộp bài của email này cho bài thi cụ thể
        attempt_count = db.query(ContestSubmission).filter(
            ContestSubmission.contest_id == contest_id,
            ContestSubmission.exam_id == exam_id,
            ContestSubmission.email == email
        ).count()

        return {
            "message": "Nộp bài thành công!",
            "score": score,
            "total_score": total_score,
            "correct_count": correct_count,
            "total_count": len(questions),
            "attempt_count": attempt_count,
            "percent": round(score / total_score * 100) if total_score > 0 else 0
        }
    except Exception as e:
        db.rollback()
        return {"error": "Lỗi nộp bài thi: " + str(e)}

# ==========================================
# GET: Lấy kết quả thi gần nhất của một học viên
# ==========================================
@router.get("/{contest_id}/result")
def get_contest_result(contest_id: int, email: str, db: Session = Depends(get_db)):
    """Trả về kết quả bài thi gần nhất của học viên theo email, phân loại theo từng bài thi."""
    try:
        # Tự động migrate dữ liệu cũ nếu chưa có bài thi (contest_exams) nào
        exam_count = db.query(ContestExam).filter(ContestExam.contest_id == contest_id).count()
        if exam_count == 0:
            direct_questions = db.query(ContestQuestion).filter(
                ContestQuestion.contest_id == contest_id, 
                ContestQuestion.exam_id == None
            ).all()
            if direct_questions:
                default_exam = ContestExam(contest_id=contest_id, title="Bài thi 1", order=1)
                db.add(default_exam)
                db.flush()
                for dq in direct_questions:
                    dq.exam_id = default_exam.id
                db.commit()

        exams = db.query(ContestExam).filter(ContestExam.contest_id == contest_id).all()
        exams_data = {}
        import json

        for exam in exams:
            subs = db.query(ContestSubmission).filter(
                ContestSubmission.contest_id == contest_id,
                ContestSubmission.exam_id == exam.id,
                ContestSubmission.email == email
            ).all()

            if subs:
                attempt_count = len(subs)
                highest_score = max(s.score for s in subs)
                most_recent = sorted(subs, key=lambda s: s.submitted_at, reverse=True)[0]
                exams_data[str(exam.id)] = {
                    "submitted": True,
                    "attempt_count": attempt_count,
                    "highest_score": highest_score,
                    "score": most_recent.score,
                    "total_score": most_recent.total_score,
                    "correct_count": most_recent.correct_count,
                    "total_count": most_recent.total_count,
                    "percent": round(most_recent.score / most_recent.total_score * 100) if most_recent.total_score > 0 else 0,
                    "answers": json.loads(most_recent.answers_json) if most_recent.answers_json else {},
                    "submitted_at": most_recent.submitted_at.strftime("%d/%m/%Y %H:%M") if most_recent.submitted_at else None
                }
            else:
                exams_data[str(exam.id)] = {
                    "submitted": False,
                    "attempt_count": 0,
                    "highest_score": 0
                }

        # Tương thích ngược: lấy bài thi gần nhất tổng quát
        last_sub = db.query(ContestSubmission).filter(
            ContestSubmission.contest_id == contest_id,
            ContestSubmission.email == email
        ).order_by(ContestSubmission.submitted_at.desc()).first()

        if not last_sub:
            return {
                "submitted": False,
                "attempt_count": 0,
                "exams": exams_data
            }

        total_attempt_count = db.query(ContestSubmission).filter(
            ContestSubmission.contest_id == contest_id,
            ContestSubmission.email == email
        ).count()

        return {
            "submitted": True,
            "attempt_count": total_attempt_count,
            "score": last_sub.score,
            "total_score": last_sub.total_score,
            "correct_count": last_sub.correct_count,
            "total_count": last_sub.total_count,
            "percent": round(last_sub.score / last_sub.total_score * 100) if last_sub.total_score > 0 else 0,
            "answers": json.loads(last_sub.answers_json) if last_sub.answers_json else {},
            "submitted_at": last_sub.submitted_at.strftime("%d/%m/%Y %H:%M") if last_sub.submitted_at else None,
            "exams": exams_data
        }
    except Exception as e:
        return {"error": "Lỗi lấy kết quả thi: " + str(e)}

# ==========================================
# GET: Lấy bảng xếp hạng của cuộc thi
# ==========================================
@router.get("/{contest_id}/leaderboard")
def get_contest_leaderboard(contest_id: int, db: Session = Depends(get_db)):
    """Trả về bảng xếp hạng danh sách thí sinh làm bài của cuộc thi, sắp xếp theo điểm cao nhất và thời gian nộp sớm nhất."""
    try:
        # 1. Lấy tất cả các bài thi (ContestExam) của cuộc thi này
        exams = db.query(ContestExam).filter(ContestExam.contest_id == contest_id).all()
        exam_ids = [e.id for e in exams]
        if not exam_ids:
            return []

        # 2. Lấy tất cả các lượt nộp bài thuộc cuộc thi này kèm thông tin user
        submissions = db.query(ContestSubmission, User).join(
            User, ContestSubmission.email == User.email
        ).filter(
            ContestSubmission.contest_id == contest_id
        ).all()

        # 3. Phân nhóm các bài nộp theo email -> exam_id -> list of submissions
        user_subs = {}
        for sub, user in submissions:
            email = sub.email
            if not email:
                continue
            if email not in user_subs:
                user_subs[email] = {
                    "user": user,
                    "subs_by_exam": {}
                }
            e_id = sub.exam_id
            if e_id not in user_subs[email]["subs_by_exam"]:
                user_subs[email]["subs_by_exam"][e_id] = []
            user_subs[email]["subs_by_exam"][e_id].append(sub)

        # 4. Chỉ giữ lại những user đã hoàn thành ĐỦ tất cả các bài thi
        leaderboard_candidates = []
        for email, data in user_subs.items():
            subs_by_exam = data["subs_by_exam"]
            user = data["user"]

            has_all_exams = True
            for e_id in exam_ids:
                if e_id not in subs_by_exam or not subs_by_exam[e_id]:
                    has_all_exams = False
                    break
            
            if not has_all_exams:
                continue

            # Tính tổng điểm cao nhất từ mỗi bài thi
            total_score = 0
            latest_submit_time = None

            for e_id in exam_ids:
                exam_subs = subs_by_exam[e_id]
                # Lấy submission có điểm cao nhất của bài thi này
                best_sub = max(exam_subs, key=lambda s: s.score)
                total_score += best_sub.score

                # Lấy thời gian nộp bài mới nhất của các bài thi đạt điểm cao nhất
                if latest_submit_time is None or best_sub.submitted_at > latest_submit_time:
                    latest_submit_time = best_sub.submitted_at

            leaderboard_candidates.append({
                "name": user.fullname or user.username or "Ẩn danh",
                "avatar": user.avatar or "http://localhost:8000/upload/avatar/default_avatar.png",
                "score": total_score,
                "time": latest_submit_time,
            })

        # 5. Sắp xếp danh sách xếp hạng theo điểm số giảm dần, thời gian tăng dần (nộp sớm hơn xếp trên)
        leaderboard_candidates.sort(
            key=lambda x: (-x["score"], x["time"] or datetime.min)
        )

        # 6. Gán thứ hạng rank và format thời gian hiển thị
        leaderboard = []
        for idx, item in enumerate(leaderboard_candidates):
            leaderboard.append({
                "rank": idx + 1,
                "name": item["name"],
                "avatar": item["avatar"],
                "score": item["score"],
                "time": item["time"].strftime("%d/%m/%Y %H:%M") if item["time"] else "",
            })

        return leaderboard
    except Exception as e:
        return {"error": "Lỗi lấy bảng xếp hạng: " + str(e)}

