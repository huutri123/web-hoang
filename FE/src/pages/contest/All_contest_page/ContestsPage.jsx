import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { getContests } from "../../../services/contestService";
import { 
  getContestsWithStatus, 
  filterAndSortContests, 
  getStatusClass, 
  getStatusText 
} from "./ContestLogic";
import "./ContestsPage.css";

const ContestsPage = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return `http://localhost:8000${image}`;
    if (image.includes("/") || image.includes(".")) return `http://localhost:8000/${image}`;
    return null;
  };

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const data = await getContests();
        
        // Map dữ liệu từ DB sang FE structure
        const mapped = data.map(c => {
          // Chuyển "dd/mm/yyyy HH:MM" của BE thành ISO "yyyy-mm-ddTHH:MM:00" để JS Date parse chuẩn
          const parseDateTimeStr = (str) => {
            if (!str) return null;
            const parts = str.split(" ");
            if (parts.length < 2) return null;
            const dateParts = parts[0].split("/"); // [dd, mm, yyyy]
            const timeParts = parts[1].split(":"); // [HH, MM]
            if (dateParts.length < 3 || timeParts.length < 2) return null;
            return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeParts[0]}:${timeParts[1]}:00`;
          };

          // Tự động nhận diện emoji hoặc hiển thị ảnh từ URL upload
          const getContestIcon = (img, topic) => {
            if (img && (img.startsWith("http") || img.startsWith("/"))) {
              return img;
            }
            if (img) return img;
            const t = (topic || "").toLowerCase();
            if (t.includes("ai")) return "🤖";
            if (t.includes("data") || t.includes("science")) return "📊";
            if (t.includes("math")) return "⚡";
            if (t.includes("web") || t.includes("hackathon")) return "💻";
            return "🏆";
          };

          // Tạo chuỗi hiển thị giải thưởng từ các cột prize_1, prize_2, prize_3
          const getPrizesString = (item) => {
            if (item.prize_1) {
              let p = item.prize_1;
              if (item.prize_2) p += ` + ${item.prize_2}`;
              return p;
            }
            return "Giải thưởng hấp dẫn";
          };

          return {
            id: c.id,
            title: c.title,
            description: c.description,
            shortDesc: c.short_desc || c.description,
            startTime: parseDateTimeStr(c.start_time),
            endTime: parseDateTimeStr(c.end_time),
            duration: c.duration,
            participants: c.participants || 0,
            maxScore: 100,
            prize: getPrizesString(c),
            level: c.level || "Trung bình",
            image: getContestIcon(c.image, c.topic),
            banner: c.banner,
            status: c.status
          };
        });

        setContests(mapped);
      } catch (err) {
        console.error("Lỗi khi tải cuộc thi từ DB:", err);
        setError("Không thể tải danh sách cuộc thi. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "upcoming", label: "Sắp diễn ra" },
    { id: "ongoing", label: "Đang diễn ra" },
    { id: "ended", label: "Đã kết thúc" },
  ];

  // Gắn trạng thái thực tế vào data
  const contestsWithRealStatus = getContestsWithStatus(contests);

  // Lọc theo search term và status
  const filteredBySearch = contestsWithRealStatus.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lọc và sắp xếp theo filter tab
  const sortedContests = filterAndSortContests(filteredBySearch, activeFilter);

  return (
    <>
      <Navbar />
      <div className="contests-page">
        <div 
          className="contests-header"
          style={{ backgroundImage: "url('/assets/images/allcontest.png')" }}
        >
          <div className="contests-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Tất cả cuộc thi</span>
          </div>
          <div className="contests-badge">
            <span>🏆</span> THỬ THÁCH BẢN THÂN – NHẬN THƯỞNG HẤP DẪN
          </div>
          <h1>
            Tất cả <span className="text-blue">cuộc thi</span>
          </h1>
          <p>
            Tham gia các cuộc thi để thử thách bản thân, học hỏi kiến thức mới và nhận những phần thưởng giá trị.
          </p>
        </div>

        {/* Filter + Search Bar */}
        <div className="contests-filter-bar">
          <div className="contests-filter-inner">
            {/* Search Bar */}
            <div className="contests-search">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm cuộc thi..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div className="filter-tabs">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={`filter-btn ${activeFilter === filter.id ? "active" : ""}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contest list */}
        {loading ? (
          <div className="loading-contests">
            <div className="spinner"></div>
            <p>Đang tải danh sách cuộc thi...</p>
          </div>
        ) : error ? (
          <div className="loading-contests">
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        ) : sortedContests.length === 0 ? (
          <div className="no-contests">
            <span className="no-contests-icon">🏆</span>
            <p>Không tìm thấy cuộc thi nào phù hợp.</p>
          </div>
        ) : (
          <div className="contests-grid">
            {sortedContests.map((contest) => (
              <div
                key={contest.id}
                className="contest-card"
                onClick={() => navigate(`/contest/${contest.id}`)}
                style={{
                  cursor: "pointer",
                  opacity: 1,
                }}
              >
                <div className="contest-card-header">
                  <div className="contest-icon">
                    {getImageUrl(contest.image) ? (
                      <img 
                        src={getImageUrl(contest.image)} 
                        alt={contest.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = "🏆";
                        }}
                      />
                    ) : (
                      contest.image || "🏆"
                    )}
                  </div>
                  <div
                    className={`contest-status ${getStatusClass(contest.realStatus)}`}
                  >
                    {getStatusText(contest.realStatus)}
                  </div>
                </div>
                <div className="contest-card-body">
                  <h3 className="contest-title">{contest.title}</h3>
                  <p className="contest-description">
                    {contest.shortDesc || contest.description}
                  </p>
                  <div className="contest-meta">
                    <div className="meta-item">
                      <span>📅</span>
                      <span>
                        {contest.startTime ? new Date(contest.startTime).toLocaleDateString("vi-VN") : "Chưa cấu hình"}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span>⏱️</span>
                      <span>{contest.duration} phút</span>
                    </div>
                    <div className="meta-item">
                      <span>👥</span>
                      <span>{(contest.participants || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="contest-footer">
                    <div className="contest-prize">🏆 {contest.prize}</div>
                    <button
                      className="view-detail-btn"
                      style={{
                        backgroundColor: "",
                        color: "",
                      }}
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ContestsPage;
