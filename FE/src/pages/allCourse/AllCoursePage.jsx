import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { getCourses } from '../../services/courseService';
import './AllCoursePage.css';
import CourseCard from '../../components/courseCard/CourseCard';

/* ============================================================
   ALL COURSE PAGE - Trang tất cả khóa học
   Cấu trúc: Navbar → Hero Banner → Filter Tabs → Course Grid → Pagination → Footer
   ============================================================ */

const TABS = ['Tất cả', 'Lập trình', 'Thiết kế', 'Kinh doanh', 'Ngoại ngữ'];
const SORT_OPTIONS = ['Bán chạy', 'Mới nhất', 'Giá tăng dần', 'Giá giảm dần', 'Đánh giá cao'];
const COURSES_PER_PAGE = 6;

/* ---- Pagination ---- */
function Pagination({ current, total, onChange }) {
  const pages = [];

  // Luôn hiện: 1, current-1, current, current+1, ..., total
  const showPage = (p) => {
    if (p < 1 || p > total || pages.includes(p)) return;
    pages.push(p);
  };

  showPage(1);
  if (current - 2 > 2) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) showPage(i);
  if (current + 2 < total - 1) pages.push('..2');
  showPage(total);

  return (
    <div className="ac-pagination">
      <button
        className="ac-page-btn ac-page-arrow"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
      >
        ‹
      </button>
      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button
            key={i}
            className={`ac-page-btn ${p === current ? 'ac-page-btn--active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ) : (
          <span key={i} className="ac-page-dots">…</span>
        )
      )}
      <button
        className="ac-page-btn ac-page-arrow"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
      >
        ›
      </button>
    </div>
  );
}

/* ---- Main Page ---- */
function AllCoursePage() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('Bán chạy');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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
        console.warn("Lỗi lấy danh sách khóa học từ API:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter theo tab và từ khoá tìm kiếm
  const filtered = courses
    .filter(c => activeTab === 'Tất cả' || c.category === activeTab)
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Giá tăng dần') return a.price - b.price;
    if (sortBy === 'Giá giảm dần') return b.price - a.price;
    if (sortBy === 'Đánh giá cao') return b.rating - a.rating;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / COURSES_PER_PAGE);
  const paginated = sorted.slice((page - 1) * COURSES_PER_PAGE, page * COURSES_PER_PAGE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <>
      <Navbar />

      {/* ── Hero Banner ── */}
      <section 
        className="ac-hero" 
        style={{ backgroundImage: "url('/assets/images/allCourse.png')" }}
      >
        <div className="ac-hero-inner">
          {/* ── Breadcrumb ── */}
          <div className="ac-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="ac-breadcrumb-sep">›</span>
            <span>Tất cả khóa học</span>
          </div>

          <div className="ac-hero-content">
            <div className="ac-hero-badge">
              <span>📚</span> KHÁM PHÁ TRI THỨC – LÀM CHỦ KỸ NĂNG
            </div>
            <h1 className="ac-hero-title">
              Tất cả <span className="ac-hero-highlight">khóa học</span>
            </h1>
            <p className="ac-hero-desc">
              Khám phá các khóa học chất lượng cao được thiết kế bởi chuyên gia,
              giúp bạn nâng cao kỹ năng và phát triển sự nghiệp.
            </p>
          </div>
        </div>
      </section>

      {/* ── Filter + Sort Bar ── */}
      <section className="ac-filter-bar">
        <div className="ac-filter-inner">

          {/* Thanh tìm kiếm bên trái */}
          <div className="ac-search-wrap">
            <svg className="ac-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="ac-search-input"
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Tabs - không có icon */}
          <div className="ac-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`ac-tab-btn ${activeTab === tab ? 'ac-tab-btn--active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="ac-sort-wrap">
            <select
              className="ac-sort-select"
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Course Grid ── */}
      <section className="ac-grid-section">
        <div className="ac-grid-inner">
          {loading ? (
            <div className="ac-empty">
              <p>Đang tải danh sách khóa học...</p>
            </div>
          ) : paginated.length > 0 ? (
            <div className="ac-grid">
              {paginated.map(c => <CourseCard key={c.id} {...c} className="ac-card" />)}
            </div>
          ) : (
            <div className="ac-empty">
              <span>😕</span>
              <p>Không tìm thấy khóa học nào trong danh mục này.</p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination current={page} total={totalPages} onChange={setPage} />
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default AllCoursePage;
