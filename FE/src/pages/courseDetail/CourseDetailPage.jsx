import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { getCourseDetail, addCourseReview, deleteCourseReview } from '../../services/courseService';
import { useAuth } from '../../services/AuthContext';
import { addToCart } from '../../services/cartService';
import './CourseDetailPage.css';

/* ============================================================
   COURSE DETAIL PAGE - Trang chi tiết khóa học
   Layout: Breadcrumb → Header info → Video + Sidebar → Tabs
   ============================================================ */

/* ── Stars ── */
function StarRow({ rating }) {
  return (
    <div className="cd-stars">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`cd-star ${s <= Math.round(rating) ? 'cd-star--filled' : ''}`}>★</span>
      ))}
    </div>
  );
}

/* ── Tab: Mục tiêu ── */
function TabGoals({ goals }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="cd-tab-content">
        <h2 className="cd-tab-heading">Bạn sẽ đạt được gì sau khóa học?</h2>
        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Chưa có mục tiêu cụ thể nào được thiết lập cho khóa học này.</p>
      </div>
    );
  }
  return (
    <div className="cd-tab-content">
      <h2 className="cd-tab-heading">Bạn sẽ đạt được gì sau khóa học?</h2>
      <div className="cd-goals-grid">
        {goals.map((g, i) => (
          <div key={i} className="cd-goal-item">
            <span className="cd-goal-check">✓</span>
            <span>{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab: Chương trình học ── */
function TabSyllabus({ syllabus }) {
  const [openIdx, setOpenIdx] = useState(0);
  if (!syllabus || syllabus.length === 0) {
    return (
      <div className="cd-tab-content">
        <h2 className="cd-tab-heading">Chương trình học</h2>
        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Chưa có chương học và bài giảng nào được tải lên cho khóa học này.</p>
      </div>
    );
  }
  return (
    <div className="cd-tab-content">
      <h2 className="cd-tab-heading">Chương trình học</h2>
      <div className="cd-syllabus">
        {syllabus.map((ch, i) => (
          <div key={i} className="cd-chapter">
            <button className="cd-chapter-header" onClick={() => setOpenIdx(openIdx === i ? -1 : i)}>
              <span className="cd-chapter-title">{ch.chapter}</span>
              <span className="cd-chapter-count">{ch.lessons ? ch.lessons.length : 0} bài</span>
              <span className="cd-chapter-arrow">{openIdx === i ? '▲' : '▼'}</span>
            </button>
            {openIdx === i && (
              <div className="cd-chapter-body">
                {ch.lessons && ch.lessons.map((l, j) => (
                  <div key={j} className="cd-lesson-item">
                    <span className="cd-lesson-icon">▶</span>
                    <span>{typeof l === 'string' ? l : l.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab: Đánh giá ── */
function TabReviews({ courseId, reviews: initReviews, rating: initRating, enrolled, onReviewAdded, onReviewRemoved }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initReviews || []);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);   // ID review đang mở menu 3 chấm
  const [isEditMode, setIsEditMode] = useState(false);  // Đang chỉnh sửa hay viết mới

  // Đồng bộ khi parent load xong dữ liệu từ API
  useEffect(() => { setReviews(initReviews || []); }, [initReviews]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    if (openMenuId === null) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenuId]);

  const hasReviews = reviews && reviews.length > 0;

  // Kiểm tra user đã đánh giá chưa
  const myReview = user ? reviews.find(r => r.email === user.email || r.name === user.name) : null;
  const hasReviewed = !!myReview;

  // Bắt đầu chế độ sửa đánh giá
  const startEdit = (review) => {
    setIsEditMode(true);
    setNewComment(review.comment);
    setNewRating(review.rating);
    setOpenMenuId(null);
  };

  // Xóa đánh giá
  const handleDelete = async (review) => {
    setOpenMenuId(null);
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await deleteCourseReview(courseId, review.id, user.email);
      setReviews(prev => prev.filter(r => r.id !== review.id));
      if (onReviewRemoved) onReviewRemoved();
    } catch (err) {
      alert(err.message || 'Không thể xóa đánh giá!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newComment.trim()) {
      setSubmitMsg({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá!' });
      return;
    }
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const result = await addCourseReview(courseId, {
        email: user.email,
        rating: newRating,
        comment: newComment.trim(),
      });
      const saved = result.review;
      setReviews(prev => {
        const exists = prev.find(r => r.id === saved.id);
        if (exists) return prev.map(r => r.id === saved.id ? saved : r);
        return [saved, ...prev];
      });
      setNewComment('');
      setNewRating(5);
      const wasEdit = isEditMode;
      setIsEditMode(false);
      setSubmitMsg({ type: 'success', text: result.message || 'Thành công! ❤️' });
      if (!wasEdit && onReviewAdded) onReviewAdded(); // Chỉ tăng count khi tạo mới, không tính khi sửa
    } catch (err) {
      setSubmitMsg({ type: 'error', text: err.message || 'Có lỗi xảy ra!' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(null), 4000);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="cd-tab-content">
      <h2 className="cd-tab-heading">Đánh giá từ học viên</h2>

      {/* Tổng quan rating */}
      <div className="cd-rating-summary">
        <div className="cd-rating-big">{hasReviews ? avgRating : 'Chưa có'}</div>
        <div className="cd-rating-detail">
          <StarRow rating={parseFloat(avgRating)} />
          <p>{hasReviews ? `${reviews.length} đánh giá` : 'Chưa có đánh giá nào'}</p>
        </div>
      </div>

      {/* Danh sách đánh giá */}
      {hasReviews ? (
        <div className="cd-reviews">
          {reviews.map((r) => {
            const isOwner = user && r.email === user.email;
            return (
              <div key={r.id} className="cd-review-card" style={{ position: 'relative' }}>
                {/* Avatar */}
                <div className="cd-review-avatar" style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0
                }}>
                  {r.avatar || r.name?.[0]?.toUpperCase() || 'U'}
                </div>

                {/* Nội dung */}
                <div className="cd-review-body" style={{ flex: 1 }}>
                  <div className="cd-review-header">
                    <strong>{r.name}</strong>
                    <StarRow rating={r.rating} />
                    <span className="cd-review-date">{r.date}</span>
                  </div>
                  <p className="cd-review-text">{r.comment}</p>
                </div>

                {/* Nút 3 chấm — chỉ hiển thị với chủ sở hữu */}
                {isOwner && (
                  <div style={{ position: 'relative', marginLeft: '8px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === r.id ? null : r.id); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px 8px', borderRadius: '6px', color: '#64748b',
                        fontSize: '18px', lineHeight: 1,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      title="Tùy chọn"
                    >
                      ⋮
                    </button>

                    {/* Dropdown menu */}
                    {openMenuId === r.id && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute', right: 0, top: '110%',
                          background: '#fff', borderRadius: '10px', zIndex: 50,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          border: '1px solid #e2e8f0',
                          minWidth: '130px', overflow: 'hidden'
                        }}
                      >
                        <button
                          onClick={() => startEdit(r)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            width: '100%', padding: '10px 14px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '14px', color: '#334155', textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <span>✏️</span> Chỉnh sửa
                        </button>
                        <div style={{ height: '1px', background: '#f1f5f9' }} />
                        <button
                          onClick={() => handleDelete(r)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            width: '100%', padding: '10px 14px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '14px', color: '#ef4444', textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <span>🗑️</span> Xóa
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: '#64748b', fontStyle: 'italic', marginTop: '20px', marginBottom: '24px' }}>
          Chưa có đánh giá nào từ học viên cho khóa học này.
        </p>
      )}

      {/* Form đánh giá — Ẩn khi đã có đánh giá (trừ khi đang sửa), chỉ cho phép khi đã mua khóa học */}
      {user && enrolled && (!hasReviewed || isEditMode) && (
        <div className="cd-write-review-section">
          <div className="cd-write-review-avatar" style={{
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontWeight: '700'
          }}>
            {user ? user.email.substring(0, 2).toUpperCase() : 'U'}
          </div>

          {submitMsg && (
            <div style={{
              position: 'absolute', top: '-48px', left: '0', right: '0',
              padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
              background: submitMsg.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: submitMsg.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${submitMsg.type === 'success' ? '#6ee7b7' : '#fca5a5'}`,
            }}>
              {submitMsg.type === 'success' ? '✅' : '⚠️'} {submitMsg.text}
            </div>
          )}

          <form className="cd-write-review-form" onSubmit={handleSubmit} style={{ position: 'relative', flex: 1 }}>
            <div className="cd-write-review-input-wrapper">
              <input
                type="text"
                className="cd-write-review-input"
                placeholder={user ? (isEditMode ? 'Chỉnh sửa đánh giá của bạn...' : 'Viết đánh giá của bạn...') : 'Vui lòng đăng nhập để gửi đánh giá...'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!user || submitting}
              />
              <div className="cd-write-review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`cd-write-star-btn ${star <= (hoveredStar || newRating) ? 'active' : ''}`}
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    disabled={!user || submitting}
                    title={`${star} sao`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => { setIsEditMode(false); setNewComment(''); setNewRating(5); }}
                  style={{
                    padding: '0 12px', height: '38px', borderRadius: '8px',
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    cursor: 'pointer', fontSize: '13px', color: '#64748b',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                className="cd-write-review-submit-btn"
                disabled={!user || !newComment.trim() || submitting}
                title={!user ? 'Vui lòng đăng nhập' : (isEditMode ? 'Lưu chỉnh sửa' : 'Gửi đánh giá')}
              >
                {submitting ? (
                  <span style={{ fontSize: '12px', padding: '0 4px' }}>⏳</span>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="cd-send-icon-svg" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thông báo đã đánh giá (khi không trong chế độ sửa) */}
      {hasReviewed && !isEditMode && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginTop: '20px', padding: '12px 16px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '10px', fontSize: '14px', color: '#15803d'
        }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <span>Bạn đã đánh giá khóa học này. Nhấn nút <strong>⋮</strong> trên đánh giá của bạn để chỉnh sửa hoặc xóa.</span>
        </div>
      )}

      {/* Thông báo chưa mua khóa học */}
      {user && !enrolled && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginTop: '20px', padding: '12px 16px',
          background: '#fee2e2', border: '1px solid #fca5a5',
          borderRadius: '10px', fontSize: '14px', color: '#991b1b'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <span>Bạn phải sở hữu khóa học này mới được gửi đánh giá.</span>
        </div>
      )}
    </div>
  );
}



/* ── Tab: Thông tin ── */
function TabInfo({ course }) {
  return (
    <div className="cd-tab-content">
      <h2 className="cd-tab-heading">Thông tin khóa học</h2>
      <div className="cd-info-grid">
        {course.stats.map((s, i) => (
          <div key={i} className="cd-info-item">
            <span className="cd-info-icon">{s.icon}</span>
            <div>
              <div className="cd-info-value">{s.value}</div>
              <div className="cd-info-label">{s.label}</div>
            </div>
          </div>
        ))}
        <div className="cd-info-item">
          <span className="cd-info-icon">📅</span>
          <div>
            <div className="cd-info-value">{course.updatedAt}</div>
            <div className="cd-info-label">Cập nhật lần cuối</div>
          </div>
        </div>
        <div className="cd-info-item">
          <span className="cd-info-icon">🎯</span>
          <div>
            <div className="cd-info-value">{course.level}</div>
            <div className="cd-info-label">Cấp độ</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ══ */
function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, openModal } = useAuth();
  const [activeTab, setActiveTab] = useState('goals');
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && user.email && courseId) {
        try {
          const res = await fetch(`http://localhost:8000/api/courses/my-courses?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const myCourses = await res.json();
            const isEnrolled = myCourses.some(c => c.id === parseInt(courseId));
            setEnrolled(isEnrolled);
          }
        } catch (err) {
          console.error("Lỗi kiểm tra sở hữu khóa học:", err);
        }
      } else {
        setEnrolled(false);
      }
    };
    checkEnrollment();
  }, [courseId, user]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleEnrollClick = async () => {
    if (!user) {
      openModal('login');
      return;
    }
    
    // Gọi API thêm vào giỏ hàng
    const res = await addToCart(user.email, course.id);
    if (res && !res.error) {
      triggerToast('Thêm khóa học vào giỏ hàng thành công!');
    } else {
      triggerToast(res?.error || 'Không thể thêm khóa học vào giỏ hàng.');
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await getCourseDetail(courseId);
        
        const parsePrice = (priceStr) => {
          if (!priceStr) return 0;
          const cleanStr = priceStr.toString().replace(/[^\d]/g, '');
          return parseInt(cleanStr, 10) || 0;
        };

        // Đồng bộ dữ liệu mock còn thiếu để tránh lỗi UI
        setCourse({
          ...data,
          subtitle: data.subtitle || data.description || "",
          studentCount: parseInt(data.student_count) || 0,
          price: parsePrice(data.price_discount),
          reviewCount: (data.reviews?.length) || 0,
          lessons: data.lessons_count || 0,
          exercises: data.exercises_count || 0,
          thumbnail: data.image || "/assets/images/python_course.jpg",
          updatedAt: data.updatedAt || '06/2026',
          goals: data.goals || [],
          includes: [
            { icon: '🎬', text: `Tổng thời lượng: ${data.duration || 'Chưa cập nhật'}` },
            { icon: '🎯', text: `Cấp độ: ${data.level || 'Chưa cập nhật'}` },
            { icon: '💻', text: 'Học 100% online, chủ động thời gian' },
            { icon: '📝', text: 'Tài liệu và bài tập đa dạng' },
            { icon: '♾️', text: 'Truy cập khóa học trọn đời' }
          ],
          stats: [
            { icon: '👨‍🎓', value: (parseInt(data.student_count) || 0).toLocaleString(), label: 'Học viên đã đăng ký' },
            { icon: '⏱️', value: data.duration || 'Chưa cập nhật', label: 'Tổng thời lượng' },
            { icon: '📚', value: `${data.lessons_count || 0}`, label: 'Bài giảng' },
            { icon: '✏️', value: `${data.exercises_count || 0}`, label: 'Bài tập thực hành' }
          ],
          syllabus: data.syllabus || [],
          reviews: data.reviews || []
        });
        setReviewCount((data.reviews?.length) || 0);
      } catch (err) {
        console.warn("Không thể tải khóa học từ API:", err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="cd-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '18px' }}>
            Đang tải dữ liệu khóa học...
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="cd-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '18px' }}>
            Không tìm thấy thông tin khóa học!
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const TABS = [
    { key: 'goals',    label: 'Mục tiêu khóa học' },
    { key: 'info',     label: 'Thông tin khóa học' },
    { key: 'syllabus', label: 'Chương trình học' },
    { key: 'reviews',  label: `Đánh giá (${reviewCount})` },
  ];

  return (
    <>
      <Navbar />

      <div className="cd-wrapper">
        {/* ── Breadcrumb ── */}
        <div className="cd-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="cd-breadcrumb-sep">›</span>
          <Link to="/courses">{course.category}</Link>
          <span className="cd-breadcrumb-sep">›</span>
          <span>{course.title}</span>
        </div>

        {/* ── Header info ── */}
        <div className="cd-header">
          <h1 className="cd-title">{course.title}</h1>
          <p className="cd-subtitle">{course.subtitle}</p>
          <div className="cd-meta">
            <span className="cd-meta-rating">
              ⭐ <strong>{parseFloat(course.rating) === 0 ? "Chưa có đánh giá" : course.rating}</strong>
              {parseFloat(course.rating) > 0 && (
                <span className="cd-meta-reviews">({course.reviewCount} đánh giá)</span>
              )}
            </span>
            <span className="cd-meta-divider" />
            <span>👨‍🎓 {course.studentCount.toLocaleString()} học viên</span>
            <span className="cd-meta-divider" />
            <span className="cd-meta-level">🎯 {course.level}</span>
          </div>
          <p className="cd-instructor">Giảng viên: <strong>{course.instructor}</strong></p>
        </div>

        {/* ── Body: Video + Sidebar ── */}
        <div className="cd-body">
          {/* Left column */}
          <div className="cd-main">
            {/* Video player area */}
            <div className="cd-video-wrap">
              {course.video ? (
                <video 
                  src={course.video} 
                  controls 
                  poster={course.thumbnail} 
                  style={{ width: "100%", maxHeight: "380px", display: "block", backgroundColor: "#000000" }}
                />
              ) : (
                <div className="cd-video-thumbnail" style={{ backgroundImage: `url('${course.thumbnail}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="cd-video-overlay">
                    <div className="cd-play-btn">▶</div>
                    <span className="cd-preview-text">Chưa có video giới thiệu</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="cd-tabs-bar">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`cd-tab-btn ${activeTab === t.key ? 'cd-tab-btn--active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'goals'    && <TabGoals goals={course.goals} />}
            {activeTab === 'info'     && <TabInfo course={course} />}
            {activeTab === 'syllabus' && <TabSyllabus syllabus={course.syllabus} />}
            {activeTab === 'reviews'  && <TabReviews
              courseId={course.id}
              reviews={course.reviews}
              rating={course.rating}
              enrolled={enrolled}
              onReviewAdded={() => setReviewCount(prev => prev + 1)}
              onReviewRemoved={() => setReviewCount(prev => Math.max(0, prev - 1))}
            />}
          </div>

          {/* Right Sidebar */}
          <aside className="cd-sidebar">
            {/* Price card */}
            <div className="cd-price-card">
              <div className="cd-price">{course.price.toLocaleString()}đ</div>

              <button
                className="cd-enroll-btn"
                onClick={handleEnrollClick}
              >
                THÊM VÀO GIỎ HÀNG
              </button>

              {/* Bao gồm */}
              <div className="cd-includes">
                <p className="cd-includes-title">KHÓA HỌC NÀY BAO GỒM:</p>
                {course.includes.map((item, i) => (
                  <div key={i} className="cd-include-item">
                    <span className="cd-include-icon">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats card */}
            <div className="cd-stats-card">
              {course.stats.map((s, i) => (
                <div key={i} className="cd-stat-row">
                  <span className="cd-stat-icon">{s.icon}</span>
                  <div>
                    <div className="cd-stat-value">{s.value}</div>
                    <div className="cd-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
              <div className="cd-stat-row">
                <span className="cd-stat-icon">🎯</span>
                <div>
                  <div className="cd-stat-value">Cấp độ</div>
                  <div className="cd-level-badge">{course.level}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />

      {showToast && (
        <div className="cd-toast-notification">
          <div className="cd-toast-header">
            <div className="cd-toast-title-group">
              <svg viewBox="0 0 24 24" fill="none" className="cd-toast-icon-svg" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                <path d="M12 16V11M12 8H12.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="cd-toast-title">Thông báo</span>
            </div>
            <button className="cd-toast-close" onClick={() => setShowToast(false)}>✕</button>
          </div>
          <div className="cd-toast-body">
            {toastMsg}
          </div>
          <div className="cd-toast-progressbar" />
        </div>
      )}
    </>
  );
}

export default CourseDetailPage;
