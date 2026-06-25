// pages/ContestDetailPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { getContestById, getContestLeaderboard, getContestResult } from "../../../services/contestService";
import "./ContestDetailPage.css";

const ContestDetailPage = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  const getSumOfPrizes = () => {
    if (!contest) return "0đ";
    
    // Nếu không có prize_1, prize_2, prize_3 thì fallback về contest.prize
    if (!contest.prize_1 && !contest.prize_2 && !contest.prize_3) {
      return contest.prize || "Chưa cập nhật";
    }

    const parsePrize = (str) => {
      if (!str) return 0;
      const clean = String(str).replace(/[^\d]/g, '');
      return parseInt(clean, 10) || 0;
    };

    const p1 = parsePrize(contest.prize_1);
    const p2 = parsePrize(contest.prize_2);
    const p3 = parsePrize(contest.prize_3);
    const total = p1 + p2 + p3;
    
    if (total === 0) {
      const parts = [contest.prize_1, contest.prize_2, contest.prize_3].filter(Boolean);
      return parts.join(" + ") || "Chưa cập nhật";
    }
    
    const isPercent = [contest.prize_1, contest.prize_2, contest.prize_3].some(p => String(p).includes('%'));
    if (isPercent) {
      const parts = [contest.prize_1, contest.prize_2, contest.prize_3].filter(Boolean);
      return parts.join(" + ");
    }
    
    return total.toLocaleString("vi-VN") + "đ";
  };

  // 🚀 ĐOẠN SỬA LỖI 1: Đổi tab mặc định khi vừa vào trang thành "overview" (Tổng quan)
  const [activeTab, setActiveTab] = useState("overview");
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [examsResults, setExamsResults] = useState({});
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

  useEffect(() => {
    const loadContestData = async () => {
      try {
        setLoading(true);
        const data = await getContestById(contestId);
        setContest(data);
        
        // Tải bảng xếp hạng từ API
        const leaderboardData = await getContestLeaderboard(contestId);
        setRankings(leaderboardData || []);

        // Tải kết quả bài thi của người dùng hiện tại (nếu đã đăng nhập)
        if (userEmail) {
          try {
            const resultData = await getContestResult(contestId, userEmail);
            if (resultData && resultData.exams) {
              setExamsResults(resultData.exams);
            }
          } catch (err) {
            console.error("Lỗi tải kết quả thi:", err);
          }
        }
      } catch (err) {
        console.error("Lỗi tải thông tin cuộc thi:", err);
      } finally {
        setLoading(false);
      }
    };
    loadContestData();
  }, [contestId, userEmail]);

  // Hỗ trợ parse date string dd/mm/yyyy hh:MM từ BE thành Date object
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    if (typeof dateString === "string" && dateString.includes("/")) {
      const [datePart, timePart] = dateString.split(" ");
      const [d, m, y] = datePart.split("/");
      const [h, min] = timePart.split(":");
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min));
    }
    return new Date(dateString);
  };

  const getStatusInfo = () => {
    if (!contest) return { text: "Đã kết thúc", class: "ended", icon: "✅" };
    const now = new Date();
    const start = parseDate(contest.startTime || contest.start_time);
    const end = parseDate(contest.endTime || contest.end_time);

    if (now < start)
      return { text: "Sắp diễn ra", class: "upcoming", icon: "⏰" };
    if (now > end) return { text: "Đã kết thúc", class: "ended", icon: "✅" };
    return { text: "Đang diễn ra", class: "ongoing", icon: "🔥" };
  };

  const formatDateTime = (dateString) => {
    const date = parseDate(dateString);
    return {
      date: date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return `http://localhost:8000${image}`;
    if (image.includes("/") || image.includes(".")) return `http://localhost:8000/${image}`;
    return null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Đang tải cuộc thi...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!contest) {
    return (
      <>
        <Navbar />
        <div className="not-found">
          <div className="not-found-content">
            <span className="not-found-icon">🔍</span>
            <h2>Không tìm thấy cuộc thi</h2>
            <p>Cuộc thi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
            <button
              onClick={() => navigate("/contests")}
              className="back-home-btn"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const status = getStatusInfo();
  // Biến kiểm tra xem cuộc thi có phải là "Sắp diễn ra" không
  const isUpcoming = status.class === "upcoming";
  const isEnded = status.class === "ended";
  const startInfo = formatDateTime(contest.startTime || contest.start_time);
  const endTimeStr = contest.endTime || contest.end_time;
  const rankingPolicy = contest.ranking_policy || contest.rankingPolicy || "realtime";
  
  // Tính tổng số điểm tối đa từ danh sách câu hỏi thực tế của toàn bộ các bài thi
  const maxScore = contest.exams 
    ? contest.exams.reduce((total, exam) => total + (exam.questions ? exam.questions.reduce((sum, q) => sum + (q.points || 0), 0) : 0), 0)
    : 100;

  return (
    <>
      <Navbar />
      <div className="contest-detail-wrapper">
        {/* Hero Section */}
        <div
          className="contest-hero-modern"
          style={{
            backgroundImage: "url('/assets/images/bg_contest.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="hero-particles"></div>
          <div className="hero-container">
            <button
              className="back-button"
              onClick={() => navigate("/contests")}
            >
              <span className="back-icon">←</span> Tất cả cuộc thi
            </button>

            <div className="hero-grid">
              <div className="cd-hero-left">
                <div className="contest-icon-modern">
                  {getImageUrl(contest.image) ? (
                    <img 
                      src={getImageUrl(contest.image)} 
                      alt={contest.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = "🏆";
                      }}
                    />
                  ) : (
                    contest.image || "🏆"
                  )}
                </div>
                <div className={`contest-status-modern ${status.class}`}>
                  <span>{status.text}</span>
                </div>
              </div>

              <div className="hero-right">
                <h1 className="contest-title-modern">{contest.title}</h1>
                <p className="contest-desc-modern">{contest.description}</p>

                <div className="contest-stats-grid">
                  <div className="stat-card-modern">
                    <div className="cd-stat-icon">📅</div>
                    <div className="cd-stat-info">
                      <div className="cd-stat-label">Thời gian</div>
                      <div className="cd-stat-value">
                        {startInfo.date} <span className="stat-value-unit" style={{ fontSize: '15px', color: '#64748b', fontWeight: 'normal' }}>- {startInfo.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card-modern">
                    <div className="cd-stat-icon">⏱️</div>
                    <div className="cd-stat-info">
                      <div className="cd-stat-label">Thời lượng</div>
                      <div className="cd-stat-value">
                        {contest.duration} <span className="stat-value-unit" style={{ fontSize: '15px', color: '#64748b', fontWeight: 'normal' }}>phút</span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card-modern">
                    <div className="cd-stat-icon">👥</div>
                    <div className="cd-stat-info">
                      <div className="cd-stat-label">Thí sinh</div>
                      <div className="cd-stat-value">
                        {contest.participants.toLocaleString()} <span className="stat-value-unit" style={{ fontSize: '15px', color: '#64748b', fontWeight: 'normal' }}>tham gia</span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card-modern">
                    <div className="cd-stat-icon">🏆</div>
                    <div className="cd-stat-info">
                      <div className="cd-stat-label">Giải thưởng</div>
                      <div className="cd-stat-value prize">
                        {getSumOfPrizes()} <span className="stat-value-unit" style={{ fontSize: '15px', color: '#64748b', fontWeight: 'normal' }}>tổng giải</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 ĐOẠN SỬA LỖI 2: Đổi thứ tự Tabs và thêm hiệu ứng vô hiệu hóa */}
        <div className="tabs-modern">
          <div className="tabs-container">
            {/* Tab 1: Tổng quan (Luôn bấm được) */}
            <button
              className={`tab-modern ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <span>Tổng quan</span>
            </button>

            {/* Tab 2: Danh sách bài thi (Khóa nếu sắp diễn ra) */}
            <button
              className={`tab-modern ${activeTab === "problems" ? "active" : ""}`}
              onClick={() => !isUpcoming && setActiveTab("problems")}
              style={{
                opacity: isUpcoming ? 0.4 : 1,
                cursor: isUpcoming ? "not-allowed" : "pointer",
              }}
              title={
                isUpcoming ? "Cuộc thi chưa bắt đầu, bạn chưa thể xem đề!" : ""
              }
            >
              <span>Danh sách bài thi</span>
            </button>

            {/* Tab 3: Bảng xếp hạng (Khóa nếu sắp diễn ra) */}
            <button
              className={`tab-modern ${activeTab === "ranking" ? "active" : ""}`}
              onClick={() => !isUpcoming && setActiveTab("ranking")}
              style={{
                opacity: isUpcoming ? 0.4 : 1,
                cursor: isUpcoming ? "not-allowed" : "pointer",
              }}
              title={
                isUpcoming
                  ? "Cuộc thi chưa diễn ra, chưa có bảng xếp hạng!"
                  : ""
              }
            >
              <span>Bảng xếp hạng</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-modern">
          <div className="content-container">
            {/* 🚀 ĐOẠN SỬA LỖI 3: Đảo khối Overview lên trước cho logic dễ nhìn */}
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="overview-section">
                <div className="overview-grid">
                  <div className="overview-card">
                    <div className="card-icon">📌</div>
                    <h3>Thông tin chi tiết</h3>
                    <div className="info-list">
                      <div className="info-row">
                        <span className="info-label">Ngày bắt đầu</span>
                        <span className="info-value">
                          {startInfo.date} - {startInfo.time}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Ngày kết thúc</span>
                        <span className="info-value">
                          {formatDateTime(contest.endTime).date} -{" "}
                          {formatDateTime(contest.endTime).time}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Thời gian làm bài</span>
                        <span className="info-value">
                          {contest.duration} phút
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Cấp độ</span>
                        <span className={`level-badge ${contest.levelClass}`}>
                          {contest.level}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Số lượng tham gia</span>
                        <span className="info-value">
                          {contest.participants.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="card-icon">🏆</div>
                    <h3>Giải thưởng hấp dẫn</h3>
                    <div className="prize-list-modern">
                      <div className="prize-item gold">
                        <span className="prize-medal">🥇</span>
                        <div className="prize-info">
                          <strong>Giải nhất</strong>
                          <span>{contest.prize_1 || contest.prize || "Chưa cập nhật"}</span>
                        </div>
                      </div>
                      <div className="prize-item silver">
                        <span className="prize-medal">🥈</span>
                        <div className="prize-info">
                          <strong>Giải nhì</strong>
                          <span>{contest.prize_2 || "5.000.000đ"}</span>
                        </div>
                      </div>
                      <div className="prize-item bronze">
                        <span className="prize-medal">🥉</span>
                        <div className="prize-info">
                          <strong>Giải ba</strong>
                          <span>{contest.prize_3 || "2.000.000đ"}</span>
                        </div>
                      </div>
                      <div className="prize-item">
                        <span className="prize-medal">🎁</span>
                        <div className="prize-info">
                          <strong>Top 10</strong>
                          <span>Huy hiệu đặc biệt + Chứng chỉ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overview-card">
                    <div className="card-icon">📜</div>
                    <h3>Thể lệ cuộc thi</h3>
                    <ul className="rules-list-modern">
                      <li>✓ Mỗi thí sinh chỉ được tham gia 1 lần duy nhất</li>
                      <li>✓ Hệ thống tự động chấm điểm</li>
                      <li>✓ Không được rời khỏi màn hình làm bài</li>
                      <li>✓ Kết quả được công bố sau 24h</li>
                      <li>✓ Gian lận sẽ bị hủy kết quả</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Problems Tab (Sẽ không render nếu isUpcoming = true) */}
            {activeTab === "problems" && !isUpcoming && (
              <div className="problems-section">
                <div className="section-header">
                  <h2 className="section-title-modern">
                    <span className="title-icon">📋</span>
                    Các bài thi trong cuộc thi
                  </h2>
                  <p className="section-subtitle">
                    Hoàn thành tất cả bài thi để có cơ hội nhận giải thưởng
                  </p>
                </div>

                <div className="problems-grid-modern">
                  {contest.exams && contest.exams.length > 0 ? (
                    contest.exams.map((exam, idx) => {
                      const examResult = examsResults[String(exam.id)] || { submitted: false, attempt_count: 0, highest_score: 0 };
                      const maxAttempts = contest.max_attempts || 1;
                      const attemptsLeft = Math.max(0, maxAttempts - examResult.attempt_count);
                      const isLocked = examResult.attempt_count >= maxAttempts;
                      const examPoints = exam.questions ? exam.questions.reduce((sum, q) => sum + (q.points || 0), 0) : 0;
                      return (
                        <div key={exam.id} className="problem-card-modern">
                          <div className="problem-card-header">
                            <div className="problem-number-badge">
                              <span className="badge-number">
                              {String(idx + 1).padStart(2, "0")}
                              </span>
                            </div>
                            <div className="problem-points-badge">
                              <span className="points-icon">⭐</span>
                              <span className="points-value">{examPoints}</span>
                              <span className="points-unit">điểm</span>
                            </div>
                          </div>

                          <div className="problem-card-body">
                            <h3 className="problem-name">{exam.title || `Bài thi ${idx + 1}`}</h3>
                            <p className="problem-short-desc">
                              Nội dung câu hỏi được bảo mật cho đến khi bắt đầu làm bài.
                            </p>

                            <div className="problem-tags-modern" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              <span className="tag-modern type-tag">📝 Trắc nghiệm</span>
                              <span className="tag-modern level-tag">
                                {contest.level === "Dễ" ? "🟢 Dễ"
                                  : contest.level === "Trung bình" ? "🟡 Trung bình"
                                  : "🔴 Nâng cao"}
                              </span>
                              {examResult.submitted && (
                                <>
                                  <span className="tag-modern" style={{
                                    background: "#d1fae5", color: "#059669",
                                    border: "1px solid #6ee7b7", fontWeight: "600"
                                  }}>✅ Đã hoàn thành</span>
                                  <span className="tag-modern" style={{
                                    background: "#e0f2fe", color: "#0369a1",
                                    border: "1px solid #7dd3fc", fontWeight: "600"
                                  }}>🏆 Điểm cao nhất: {examResult.highest_score}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="problem-card-footer">
                            {/* Hiển thị số lượt còn lại */}
                            {maxAttempts > 0 && (
                              <div style={{
                                textAlign: "center", fontSize: "12px",
                                color: isLocked ? "#ef4444" : "#64748b",
                                marginBottom: "10px", fontWeight: "500"
                              }}>
                                {isLocked
                                  ? "🔒 Đã hết lượt thi"
                                  : `Lượt thi còn lại: ${attemptsLeft}/${maxAttempts}`
                                }
                              </div>
                            )}
                            <button
                              className="start-test-btn"
                              onClick={() => {
                                if (!isLocked) {
                                  setSelectedExam(exam);
                                  setShowStartModal(true);
                                }
                              }}
                              disabled={isLocked}
                              style={isLocked ? {
                                background: "#94a3b8", cursor: "not-allowed", opacity: 0.7
                              } : {}}
                            >
                              <span>{isLocked ? "Đã hết lượt thi" : "Làm bài ngay"}</span>
                              {!isLocked && <span className="btn-arrow">→</span>}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state-modern">
                      <div className="empty-icon">📭</div>
                      <h3>Chưa có bài thi</h3>
                      <p>Bài thi sẽ được cập nhật sớm nhất có thể</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ranking Tab (Sẽ không render nếu isUpcoming = true) */}
            {activeTab === "ranking" && !isUpcoming && (
              <div className="ranking-section">
                <div className="section-header">
                  <h2 className="section-title-modern">
                    <span className="title-icon">🏆</span>
                    Bảng xếp hạng
                  </h2>
                  <p className="section-subtitle">Top thí sinh xuất sắc nhất</p>
                </div>

                {rankingPolicy === "after_end" && !isEnded ? (
                  <div className="empty-state-modern" style={{ padding: "40px 20px", background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(10px)", border: "1px solid #e2e8f0", borderRadius: "12px", textAlign: "center" }}>
                    <div className="empty-icon" style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
                    <h3>Bảng xếp hạng đang ẩn</h3>
                    <p style={{ maxWidth: "500px", margin: "0 auto 16px auto", color: "#64748b", lineHeight: "1.6" }}>
                      Bảng xếp hạng của cuộc thi này được thiết lập chỉ công bố sau khi thời gian thi kết thúc.
                    </p>
                    <div style={{ display: "inline-block", background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0284c7", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "500" }}>
                      ⏰ Thời gian mở công bố: {formatDateTime(endTimeStr).date} lúc {formatDateTime(endTimeStr).time}
                    </div>
                  </div>
                ) : rankings.length > 0 ? (
                  <div className="ranking-container">
                    {/* Top 3 Highlight */}
                    <div className="top-three">
                      {rankings.slice(0, 3).map((user, idx) => (
                        <div
                          key={user.rank}
                          className={`top-card rank-${idx + 1}`}
                        >
                          <div className="top-medal">
                            {idx === 0 && "🥇"}
                            {idx === 1 && "🥈"}
                            {idx === 2 && "🥉"}
                          </div>
                          <div className="top-avatar">{user.avatar || '🧑‍🎓'}</div>
                          <div className="top-name">{user.name}</div>
                          <div className="top-score">{user.score} điểm</div>
                          {idx !== 0 && <div className="top-time">{user.time}</div>}
                        </div>
                      ))}
                    </div>

                    {/* Bảng xếp hạng chi tiết */}
                    <div className="ranking-table-modern">
                      <div className="table-header">
                        <div className="cd-col-rank">Hạng</div>
                        <div className="cd-col-user">Thí sinh</div>
                        <div className="cd-col-score">Điểm số</div>
                        <div className="cd-col-time">Thời gian nộp</div>
                      </div>
                      <div className="table-body">
                        {rankings.map((user) => (
                          <div key={user.rank} className="table-row">
                            <div className="cd-col-rank">
                              <span
                                className={`rank-badge ${user.rank <= 3 ? "top" : ""}`}
                              >
                                {user.rank}
                              </span>
                            </div>
                            <div className="cd-col-user">
                              <span className="user-avatar-small">
                                {user.avatar || '🧑‍🎓'}
                              </span>
                              <span className="user-name-small">
                                {user.name}
                              </span>
                            </div>
                            <div className="cd-col-score">
                              <span className="score-value">{user.score}</span>
                              <span className="score-max">
                                /{maxScore}
                              </span>
                            </div>
                            <div className="cd-col-time">{user.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state-modern">
                    <div className="empty-icon">🏆</div>
                    <h3>Chưa có dữ liệu xếp hạng</h3>
                    <p>Hãy là người đầu tiên tham gia cuộc thi!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Modal xác nhận bắt đầu thi */}
      {showStartModal && (
        <div style={overlayStyle}>
          <div style={modalCardStyle}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🏁</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>Sẵn sàng làm bài?</h3>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: "0 0 8px" }}>
              Cuộc thi sẽ bắt đầu tính giờ ngay khi bạn vào trang thi.
            </p>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: "0 0 24px" }}>
              Thời gian làm bài: <strong style={{ color: "#0f172a" }}>{contest?.duration} phút</strong>. Hãy chắc chắn bạn đã chuẩn bị sẵn sàng!
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowStartModal(false)}
                style={btnCancelStyle}
              >
                Chưa, để sau
              </button>
              <button
                onClick={() => {
                  setShowStartModal(false);
                  if (selectedExam) {
                    navigate(`/exam/${contest.id}?examId=${selectedExam.id}`);
                  }
                }}
                style={btnConfirmStyle}
              >
                Bắt đầu ngay! →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Inline styles cho modal (tránh xung đột CSS toàn cục)
const overlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
};
const modalCardStyle = {
  background: "#fff", borderRadius: 24, padding: "36px 32px",
  maxWidth: 440, width: "90%", textAlign: "center",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
  animation: "none",
};
const btnCancelStyle = {
  flex: 1, background: "#f1f5f9", border: "1px solid #cbd5e1",
  color: "#475569", fontWeight: 600, padding: "10px 0",
  borderRadius: 10, cursor: "pointer", fontSize: 14,
};
const btnConfirmStyle = {
  flex: 1, background: "#10b981", border: "1px solid #10b981",
  color: "#fff", fontWeight: 700, padding: "10px 0",
  borderRadius: 10, cursor: "pointer", fontSize: 14,
};

export default ContestDetailPage;
