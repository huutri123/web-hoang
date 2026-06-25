// pages/ExamPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import { formatTime } from "./ExamLogic";
import { getContestById, submitContest } from "../../../services/contestService";
import "./ExamPage.css";

const ExamPage = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examIdStr = searchParams.get("examId");
  const examId = examIdStr ? parseInt(examIdStr, 10) : null;

  // Lấy email từ đối tượng edupro_user lưu trong localStorage
  const getLoggedInEmail = () => {
    try {
      const savedUser = localStorage.getItem("edupro_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return u?.email || "";
      }
    } catch (e) {
      console.error("Lỗi parse edupro_user:", e);
    }
    return "";
  };
  const userEmail = getLoggedInEmail();

  // States dữ liệu cuộc thi
  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // States quản lý thi
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [bookmarks, setBookmarks] = useState({}); // { [questionId]: boolean }
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(null); // Số lượt đã dùng (thực tế từ DB)

  // Tải dữ liệu cuộc thi + câu hỏi từ API
  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const data = await getContestById(contestId);

        // Lọc theo bài thi cụ thể (examId) nếu có
        let selectedExam = null;
        if (examId) {
          selectedExam = (data.exams || []).find((ex) => ex.id === examId);
        }
        if (!selectedExam && data.exams && data.exams.length > 0) {
          selectedExam = data.exams[0];
        }

        // Map câu hỏi của bài thi đã chọn về cấu trúc FE
        const targetQuestions = selectedExam ? (selectedExam.questions || []) : (data.questions || []);
        const mappedQuestions = targetQuestions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options || [],
          correctOption: q.correctOption,
          points: q.points || 1,
        }));

        setContest(data);
        setQuestions(mappedQuestions);
        setTimeLeft((data.duration || 120) * 60); // duration tính bằng phút
      } catch (err) {
        console.error("Lỗi tải cuộc thi:", err);
        setLoadError("Không thể tải bài thi. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [contestId, examId]);

  // Bộ đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0 || submitted || loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, loading]);

  // Tự động nộp bài khi hết giờ
  useEffect(() => {
    if (timeLeft === 0 && !submitted && !loading && questions.length > 0) {
      handleConfirmSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleSelectOption = (questionId, optionIdx) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionId]: optionIdx });
  };

  const toggleBookmark = (questionId) => {
    if (submitted) return;
    setBookmarks({ ...bookmarks, [questionId]: !bookmarks[questionId] });
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const handleSubmitClick = () => {
    if (submitted) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      // Chuyển answers key thành string để gửi lên BE
      const answersForApi = {};
      Object.keys(answers).forEach((k) => {
        answersForApi[String(k)] = answers[k];
      });

      const result = await submitContest(contestId, {
        email: userEmail,
        answers: answersForApi,
        examId: examId, // Gửi kèm examId
      });

      setScore(result.score || 0);
      setTotalScore(result.total_score || questions.reduce((s, q) => s + q.points, 0));
      // Lấy số lượt thi trực tiếp từ response của BE (không cần gọi thêm API)
      if (result.attempt_count) {
        setAttemptCount(result.attempt_count);
      }
    } catch (err) {
      console.warn("Lỗi gửi bài lên server, tính điểm offline:", err);
      // Fallback: tính điểm offline nếu API lỗi
      let sc = 0;
      let ts = 0;
      questions.forEach((q) => {
        ts += q.points;
        if (answers[q.id] === q.correctOption) sc += q.points;
      });
      setScore(sc);
      setTotalScore(ts);
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  // --- Trạng thái loading / lỗi ---
  if (loading) {
    return (
      <div className="exam-layout">
        <Navbar />
        <div className="exam-loading-screen">
          <div className="exam-spinner"></div>
          <p>Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="exam-layout">
        <Navbar />
        <div className="exam-loading-screen">
          <p style={{ color: "#ef4444" }}>{loadError || "Cuộc thi này chưa có câu hỏi nào."}</p>
          <button className="btn-exit" style={{ marginTop: 16 }} onClick={() => navigate(`/contest/${contestId}`)}>
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const correctAnswersCount = questions.filter((q) => answers[q.id] === q.correctOption).length;

  return (
    <div className="exam-layout">
      <Navbar />

      {/* Top Bar / Header */}
      <div className="exam-topbar">
        <div className="topbar-left">
          <button
            className="btn-exit"
            onClick={() => submitted ? navigate(`/contest/${contestId}`) : setShowExitModal(true)}
          >
            ← Thoát
          </button>
        </div>
        <div className="topbar-right">
          <div className={`exam-timer ${timeLeft < 300 ? "timer-danger" : ""}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="exam-workspace-new">
        
        {/* Left Panel: Question Display */}
        <div className="panel-left-new">
          
          {submitted && (
            <div className="result-banner" style={{ display: "block" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "700", color: "#10b981" }}>
                🎉 Kết quả bài thi của bạn
              </h3>
              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", fontSize: "14px", color: "#94a3b8" }}>
                <span>Điểm số: <strong className="result-score-highlight" style={{ fontSize: "18px", color: "#f59e0b" }}>{score}/{totalScore}</strong> điểm</span>
                <span style={{ color: "#475569" }}>|</span>
                <span>Số câu đúng: <strong style={{ color: "#10b981" }}>{correctAnswersCount}/{totalQuestions}</strong> câu ({Math.round((correctAnswersCount/totalQuestions)*100)}%)</span>
                {contest?.max_attempts > 0 && (
                  <>
                    <span style={{ color: "#475569" }}>|</span>
                    <span>📝 Lượt sử dụng: <strong style={{ color: "#60a5fa" }}>{attemptCount ?? "..."}/{contest.max_attempts}</strong> lượt thi</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="question-card-new">
            <div className="question-card-header">
              <span className="question-number">Câu {currentIdx + 1}/{totalQuestions}</span>
              <span className="question-points">{activeQuestion.points} điểm</span>
            </div>

            <div className="question-card-body">
              <h3 className="question-text">{activeQuestion.text}</h3>
              <p className="question-subtitle">Chọn một đáp án đúng nhất.</p>

              <div className="options-list-new">
                {activeQuestion.options.map((option, idx) => {
                  const optionLabel = ["A", "B", "C", "D"][idx];
                  const isSelected = answers[activeQuestion.id] === idx;
                  const isCorrect = activeQuestion.correctOption === idx;

                  // Xác định CSS Class cho thẻ option
                  let optionClass = "option-card-new";
                  if (isSelected) optionClass += " selected";
                  if (submitted) {
                    if (isCorrect) optionClass += " correct-ans";
                    else if (isSelected) optionClass += " incorrect-ans";
                  }

                  return (
                    <div
                      key={idx}
                      className={optionClass}
                      onClick={() => handleSelectOption(activeQuestion.id, idx)}
                    >
                      <div className="option-radio-circle">
                        {isSelected && <div className="radio-dot"></div>}
                      </div>
                      <span className="option-letter-badge">{optionLabel}</span>
                      <span className="option-text-content">{option}</span>
                      
                      {submitted && isCorrect && <span className="ans-indicator-icon">✅</span>}
                      {submitted && isSelected && !isCorrect && <span className="ans-indicator-icon">❌</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="question-card-footer">
              <button
                className="btn-footer-nav"
                onClick={handlePrev}
                disabled={currentIdx === 0}
              >
                ‹ Câu trước
              </button>

              <button
                className={`btn-footer-bookmark ${bookmarks[activeQuestion.id] ? "active" : ""}`}
                onClick={() => toggleBookmark(activeQuestion.id)}
                disabled={submitted}
              >
                🔖 {bookmarks[activeQuestion.id] ? "Đã đánh dấu" : "Đánh dấu câu hỏi"}
              </button>

              <button
                className="btn-footer-next"
                onClick={handleNext}
                disabled={currentIdx === totalQuestions - 1}
              >
                Câu tiếp theo ›
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Progress & Info */}
        <div className="panel-right-new">
          
          {/* Box 1: Tiến độ bài thi */}
          <div className="info-box-new">
            <h3>Tiến độ bài thi</h3>
            <div className="progress-text-row">
              <span>{answeredCount}/{totalQuestions} câu</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Box 2: Bảng câu hỏi */}
          <div className="info-box-new">
            <h3>Bảng câu hỏi</h3>
            
            <div className="legend-row">
              <div className="legend-item">
                <span className="legend-square square-unanswered"></span>
                <span>Chưa trả lời</span>
              </div>
              <div className="legend-item">
                <span className="legend-square square-answered"></span>
                <span>{submitted ? "Đúng" : "Đã trả lời"}</span>
              </div>
              <div className="legend-item">
                <span className="legend-square square-bookmarked"></span>
                <span>{submitted ? "Sai" : "Đánh dấu"}</span>
              </div>
            </div>

            <div className="question-grid-new">
              {questions.map((q, idx) => {
                const isCurrent = currentIdx === idx;
                const isAnswered = answers[q.id] !== undefined;
                const isBookmarked = bookmarks[q.id] === true;
                const isCorrect = answers[q.id] === q.correctOption;

                // Xác định CSS cho ô lưới số câu hỏi
                let boxClass = "grid-box-new";
                if (isCurrent) boxClass += " current";
                
                if (submitted) {
                  if (isAnswered) {
                    boxClass += isCorrect ? " correct" : " incorrect";
                  } else {
                    boxClass += " unanswered";
                  }
                } else {
                  if (isBookmarked) boxClass += " bookmarked";
                  else if (isAnswered) boxClass += " answered";
                }

                return (
                  <button
                    key={q.id}
                    className={boxClass}
                    onClick={() => setCurrentIdx(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Box riêng: Nút Nộp bài */}
          {!submitted && (
            <div className="info-box-new submit-box">
              <button className="btn-submit-exam-new" onClick={handleSubmitClick}>
                🚩 Nộp bài
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="modal-header-icon">⚠️</div>
            <h3>Xác nhận nộp bài</h3>
            <p>Bạn có chắc chắn muốn nộp bài thi không? Hãy kiểm tra kỹ các đáp án trước khi nộp.</p>
            <div className="exam-modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                className={`btn-modal-confirm ${submitting ? "btn-loading" : ""}`}
                onClick={handleConfirmSubmit}
                disabled={submitting}
              >
                {submitting ? "Đang nộp..." : "Nộp bài ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận thoát khỏi trang thi */}
      {showExitModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="modal-header-icon">⚠️</div>
            <h3>Xác nhận thoát</h3>
            <p>
              Bạn có chắc chắn muốn thoát khỏi bài thi không?
              <br />
              <strong style={{ color: "#ef4444" }}>Tiến độ làm bài sẽ không được lưu lại!</strong>
            </p>
            <div className="exam-modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setShowExitModal(false)}
              >
                Ở lại làm bài
              </button>
              <button
                className="btn-modal-confirm"
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
                onClick={() => navigate(`/contest/${contestId}`)}
              >
                Thoát ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExamPage;
