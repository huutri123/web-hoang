import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { getCourses } from '../../services/courseService';
import { getContests, getGlobalLeaderboard } from '../../services/contestService';
import { useAuth } from '../../services/AuthContext';
import './HomePage.css';
import CourseCard from '../../components/courseCard/CourseCard';

/* ============================================================
   HOMEPAGE - Trang chủ EduPro
   Cấu trúc: Hero → 2 cột (CourseSection + Sidebar phải)
   ============================================================ */


/* ---- 1. HERO ---- */
function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-inner">

        {/* Cột trái: Tiêu đề + Nút */}
        <div className="hero-left">
          <div className="hero-badge">
            ✨ Nền tảng học tập &amp; thi đấu hàng đầu
          </div>
          <h1 className="hero-title">
            Nâng tầm tư duy<br />
            <span className="hero-title-highlight">chinh phục thử thách</span>
          </h1>
          <p className="hero-desc">
            EduPro mang đến cho bạn trải nghiệm học tập hiện đại kết hợp thi đấu hấp dẫn,
            giúp bạn bứt phá giới hạn bản thân.
          </p>
          <div className="hero-buttons">
            <Link to="/courses" className="btn-primary">Khám phá khóa học →</Link>
            <a href="#contest" className="btn-secondary">Tham gia cuộc thi ⚡</a>
          </div>

          {/* Mini features */}
          <div className="hero-features">
            <div className="hero-feature-item">
              <div className="hero-feature-icon hero-feature-icon--blue">📘</div>
              <div>
                <p className="hero-feature-title">Khóa học chất lượng</p>
                <p className="hero-feature-sub">Được giảng viên hàng đầu</p>
              </div>
            </div>
            <div className="hero-feature-item">
              <div className="hero-feature-icon hero-feature-icon--purple">🏆</div>
              <div>
                <p className="hero-feature-title">Thi đấu &amp; nhận thưởng</p>
                <p className="hero-feature-sub">Thử thách kỹ năng mỗi ngày</p>
              </div>
            </div>
            <div className="hero-feature-item hero-feature-item--hidden-mobile">
              <div className="hero-feature-icon hero-feature-icon--green">🤖</div>
              <div>
                <p className="hero-feature-title">AI hỗ trợ học tập</p>
                <p className="hero-feature-sub">Học thông minh, hiệu quả hơn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Hình minh họa */}
        <div className="hero-right">
          <div className="hero-img-glow"></div>
          <img src="/assets/images/hero-img.png" alt="EduPro" className="hero-img" />
        </div>
      </div>
    </section>
  );
}


/* ---- 2. STATS ---- */
function Stats() {
  const stats = [
    { label: 'Học viên', value: '10,000+', icon: '👥', colorClass: 'stat-card--blue', textColor: '#2563EB' },
    { label: 'Khóa học chất lượng', value: '500+', icon: '📔', colorClass: 'stat-card--green', textColor: '#059669' },
    { label: 'Cuộc thi mỗi tháng', value: '50+', icon: '🏆', colorClass: 'stat-card--orange', textColor: '#EA580C' },
    { label: 'Học viên hài lòng', value: '95%', icon: '⭐', colorClass: 'stat-card--purple', textColor: '#7C3AED' },
  ];

  return (
    <section className="stats-section">
      <div className="stats-box">
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className={`stat-card ${s.colorClass}`} style={{ color: s.textColor, borderColor: s.textColor }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.textColor }}>{s.value}</div>
              <div className="stat-label" style={{ color: s.textColor }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ---- 4. COURSE SECTION ---- */
function CourseSection() {
  const tabs = ['Lập trình', 'Thiết kế', 'Kinh doanh', 'Ngoại ngữ'];
  const [activeTab, setActiveTab] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        const mapped = data.map(course => {
          const parsePrice = (priceStr) => {
            if (!priceStr) return 0;
            const cleanStr = priceStr.toString().replace(/[^\d]/g, '');
            return parseInt(cleanStr, 10) || 0;
          };
          return {
            id: course.id,
            courseId: course.slug || course.id.toString(),
            title: course.title,
            desc: course.description || "",
            price: parsePrice(course.price_discount),
            rating: parseFloat(course.rating) || 4.8,
            color: course.image?.startsWith("url") ? course.image : `url('${course.image || '/assets/images/python_course.jpg'}')`,
            category: course.category
          };
        });
        setCourses(mapped);
      } catch (err) {
        console.warn("Lỗi lấy danh sách khóa học:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = !activeTab ? courses : courses.filter(c => c.category === activeTab);

  return (
    <section id="courses" className="courses-section">
      <div className="courses-box">
        <div className="courses-header">
          <h2 className="courses-title">Khóa học nổi bật</h2>
          <Link to="/courses" className="courses-view-all">Xem tất cả →</Link>
        </div>
        <div className="courses-tabs">
          <button
            onClick={() => setActiveTab(null)}
            className={`courses-tab-btn ${activeTab === null ? 'courses-tab-btn--active' : ''}`}
          >
            Tất cả
          </button>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`courses-tab-btn ${activeTab === tab ? 'courses-tab-btn--active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="courses-grid">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Đang tải danh sách khóa học nổi bật...
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map(c => <CourseCard key={c.id} {...c} className="hp-card" />)
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Không tìm thấy khóa học nào trong danh mục này.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


/* ---- 5. CONTEST WIDGET ---- */
function ContestWidget() {
  const [contests, setContests] = useState([]);
  const [featuredContest, setFeaturedContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });

  // Hàm parse chuỗi "dd/mm/yyyy HH:MM" thành Date object
  const parseContestDate = (str) => {
    if (!str) return null;
    const parts = str.split(' ');
    if (parts.length < 2) return null;
    const [d, m, y] = parts[0].split('/');
    const [h, min] = parts[1].split(':');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min));
  };

  // Hàm tính độ khó
  const getDiffInfo = (level) => {
    if (level === 'Dễ') return { label: 'Dễ', cls: 'diff--easy' };
    if (level === 'Khó') return { label: 'Khó', cls: 'diff--hard' };
    return { label: 'Trung bình', cls: 'diff--medium' };
  };

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const data = await getContests();
        const now = new Date();

        // Tìm cuộc thi đang diễn ra hoặc sắp diễn ra gần nhất để làm featured
        const activeOrUpcoming = data.filter(c => {
          const end = parseContestDate(c.end_time);
          return end && end > now;
        }).sort((a, b) => {
          const statusOrder = { 'Đang diễn ra': 0, 'Sắp diễn ra': 1 };
          const oa = statusOrder[a.status] ?? 2;
          const ob = statusOrder[b.status] ?? 2;
          if (oa !== ob) return oa - ob;
          return parseContestDate(a.start_time) - parseContestDate(b.start_time);
        });

        if (activeOrUpcoming.length > 0) {
          setFeaturedContest(activeOrUpcoming[0]);
        } else if (data.length > 0) {
          // Fallback: lấy cuộc thi mới nhất kể cả đã kết thúc
          setFeaturedContest(data[0]);
        }

        // Danh sách phụ (bỏ qua featured, tối đa 3 cuộc thi tiếp theo)
        const rest = data.filter((c, idx) => {
          if (activeOrUpcoming.length > 0) return c.id !== activeOrUpcoming[0].id;
          return idx !== 0;
        }).slice(0, 3);
        setContests(rest);
      } catch (err) {
        console.warn('Lỗi tải cuộc thi nổi bật:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // Đồng hồ đếm ngược thực tế
  useEffect(() => {
    if (!featuredContest) return;
    const isOngoing = featuredContest.status === 'Đang diễn ra';
    const targetDate = parseContestDate(
      isOngoing ? featuredContest.end_time : featuredContest.start_time
    );
    if (!targetDate) return;

    const tick = () => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        setCountdown({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0'),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [featuredContest]);

  if (loading) {
    return (
      <div id="contest">
        <div className="widget-box">
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Đang tải cuộc thi nổi bật...
          </div>
        </div>
      </div>
    );
  }

  if (!featuredContest) {
    return (
      <div id="contest">
        <div className="widget-box">
          <div className="courses-header">
            <h2 className="courses-title" style={{ fontSize: '20px' }}>Cuộc thi nổi bật</h2>
            <Link to="/contests" className="courses-view-all">Xem tất cả →</Link>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Hiện chưa có cuộc thi nào. Hãy quay lại sau! 🏆
          </div>
        </div>
      </div>
    );
  }

  const isOngoing = featuredContest.status === 'Đang diễn ra';
  const prize = featuredContest.prize_1 || 'Giải thưởng hấp dẫn';
  const prize2 = featuredContest.prize_2 ? ` + ${featuredContest.prize_2}` : '';

  return (
    <div id="contest">
      <div className="widget-box">
        <div className="courses-header">
          <h2 className="courses-title" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Cuộc thi nổi bật
          </h2>
          <Link to="/contests" className="courses-view-all">Xem tất cả →</Link>
        </div>

        {/* Banner cuộc thi nổi bật */}
        <div className="contest-banner-advanced">
          <div className="contest-banner-badge">
            {isOngoing ? '🔥 CUỘC THI ĐANG DIỄN RA' : '⏰ CUỘC THI SẮP DIỄN RA'}
          </div>
          <h3 className="contest-name-large">{featuredContest.title}</h3>
          <p className="contest-desc">{featuredContest.short_desc || featuredContest.description || ''}</p>

          <div className="contest-prize-box">
            <div className="prize-icon-container">🏆</div>
            <div className="prize-info">
              <span className="prize-label">GIẢI THƯỞNG HẤP DẪN</span>
              <span className="prize-value">{prize}{prize2}</span>
            </div>
          </div>

          <div className="countdown-wrapper">
            <div className="countdown-title">
              {isOngoing ? 'THỜI GIAN CÒN LẠI' : 'ĐẾM NGƯỢC ĐẾN KHI BẮT ĐẦU'}
            </div>
            <div className="contest-countdown-advanced">
              {[
                { v: countdown.days, l: 'Ngày' },
                { v: countdown.hours, l: 'Giờ' },
                { v: countdown.mins, l: 'Phút' },
                { v: countdown.secs, l: 'Giây' },
              ].map((t, idx) => (
                <React.Fragment key={t.l}>
                  <div className="countdown-item-advanced">
                    <p className="countdown-value-adv">{t.v}</p>
                    <p className="countdown-label-adv">{t.l}</p>
                  </div>
                  {idx < 3 && <span className="countdown-colon">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Link
            to={`/contest/${featuredContest.id}`}
            className="contest-join-btn-adv"
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
          >
            Tham gia ngay →
          </Link>
        </div>

        {/* Danh sách cuộc thi còn lại */}
        {contests.length > 0 && (
          <div className="contest-list">
            {contests.map(c => {
              const diff = getDiffInfo(c.level);
              return (
                <div key={c.id} className="contest-item">
                  <div>
                    <div className="contest-item-header">
                      <span className="contest-item-name">{c.title}</span>
                      <span className={`contest-diff ${diff.cls}`}>{diff.label}</span>
                    </div>
                    <p className="contest-item-date">Bắt đầu: {c.start_time}</p>
                  </div>
                  <Link
                    to={`/contest/${c.id}`}
                    className="contest-item-btn"
                    style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
                  >
                    Tham gia
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


/* ---- 6. LEADERBOARD WIDGET ---- */
function LeaderboardWidget() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week'); // 'week' | 'month' | 'all'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getGlobalLeaderboard(period);
        setLeaderboard(data);
      } catch (err) {
        console.error("Lỗi khi tải bảng xếp hạng widget:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  const topUsers = leaderboard.slice(0, 5);

  // Find the logged-in user in the entire leaderboard
  const currentUserEntry = user ? leaderboard.find(u => u.email === user.email) : null;

  return (
    <div id="leaderboard" className="lb-widget">
      <div className="lb-widget-header">
        <h3 className="lb-widget-title">Bảng xếp hạng</h3>
        <Link to="/leaderboard" className="lb-view-all">Xem tất cả</Link>
      </div>
      <div className="lb-tabs">
        <button 
          onClick={() => setPeriod('week')}
          className={`lb-tab ${period === 'week' ? 'lb-tab--active' : ''}`}
        >
          Tuần này
        </button>
        <button 
          onClick={() => setPeriod('month')}
          className={`lb-tab ${period === 'month' ? 'lb-tab--active' : ''}`}
        >
          Tháng này
        </button>
        <button 
          onClick={() => setPeriod('all')}
          className={`lb-tab ${period === 'all' ? 'lb-tab--active' : ''}`}
        >
          Tất cả thời gian
        </button>
      </div>
      <div className="lb-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b' }}>
            Đang tải...
          </div>
        ) : topUsers.length > 0 ? (
          topUsers.map(u => (
            <div key={u.rank} className="lb-item">
              <div className="lb-item-left">
                <span className="lb-rank">{u.rank}</span>
                <div className="lb-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', width: '32px', height: '32px' }}>
                  {u.avatar || '🧑‍🎓'}
                </div>
                <div>
                  <p className="lb-name">{u.name} {user && u.email === user.email && <span style={{ color: '#3b82f6', fontSize: '10px' }}>(Bạn)</span>}</p>
                  <p className="lb-level">Level {u.level}</p>
                </div>
              </div>
              <span className="lb-xp">{u.points.toLocaleString()} XP</span>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
            Chưa có lượt thi nào.
          </div>
        )}
      </div>
      <div className="lb-me-wrap">
        {user ? (
          currentUserEntry ? (
            <div className="lb-me">
              <div className="lb-item-left">
                <span className="lb-rank">{currentUserEntry.rank}</span>
                <span className="lb-me-avatar" style={{ fontSize: '20px' }}>
                  {currentUserEntry.avatar || '👋'}
                </span>
                <span className="lb-me-name">Bạn</span>
              </div>
              <span className="lb-me-xp">{currentUserEntry.points.toLocaleString()} XP</span>
            </div>
          ) : (
            <div className="lb-me">
              <div className="lb-item-left">
                <span className="lb-rank">--</span>
                <span className="lb-me-avatar">👋</span>
                <span className="lb-me-name">Bạn chưa xếp hạng</span>
              </div>
              <span className="lb-me-xp">0 XP</span>
            </div>
          )
        ) : (
          <div className="lb-me" style={{ justifyContent: 'center' }}>
            <span className="lb-me-name" style={{ fontSize: '12px', color: '#64748b' }}>Đăng nhập để xem thứ hạng của bạn</span>
          </div>
        )}
      </div>
    </div>
  );
}


/* ---- MAIN: HomePage Layout ---- */
function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />

      {/* Main Content: 2 cột */}
      <div className="homepage-content">
        <div className="homepage-layout">
          {/* Cột trái */}
          <div className="homepage-main-col">
            <CourseSection />
            <Stats />
          </div>
          {/* Cột phải */}
          <aside className="homepage-sidebar">
            <ContestWidget />
            <LeaderboardWidget />
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default HomePage;
