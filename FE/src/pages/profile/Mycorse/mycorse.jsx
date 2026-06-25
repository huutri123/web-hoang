import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';
import './mycorse.css';

/* ============================================================
   MYCORSE - Subcomponent Khóa học của tôi
   ============================================================ */

const getCourseAesthetics = (category) => {
  const catLower = (category || "").toLowerCase();
  if (catLower.includes("python")) {
    return {
      gradient: 'linear-gradient(135deg, #0d1e3d 0%, #173b75 100%)',
      badgeText: 'Python',
      icon: '🐍'
    };
  } else if (catLower.includes("sql") || catLower.includes("dữ liệu") || catLower.includes("data")) {
    return {
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      badgeText: 'SQL / Data',
      icon: '🛢️'
    };
  } else if (catLower.includes("native") || catLower.includes("react") || catLower.includes("di động")) {
    return {
      gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
      badgeText: 'React Native',
      icon: '📱'
    };
  } else if (catLower.includes("java") || catLower.includes("dsa") || catLower.includes("thuật toán")) {
    return {
      gradient: 'linear-gradient(135deg, #431407 0%, #78350f 100%)',
      badgeText: 'Java / DSA',
      icon: '☕'
    };
  } else if (catLower.includes("thiết kế") || catLower.includes("figma") || catLower.includes("design") || catLower.includes("ui")) {
    return {
      gradient: 'linear-gradient(135deg, #311042 0%, #581c87 100%)',
      badgeText: 'UI/UX Design',
      icon: '🎨'
    };
  }
  return {
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    badgeText: category || 'Khóa học',
    icon: '📖'
  };
};

const formatImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
    return img;
  }
  return `http://localhost:8000/${img}`;
};

function Mycorse() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  const menuRef = useRef(null);
  
  // Close dot-menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Lấy danh sách khóa học thực tế từ Backend
        const res = await fetch(`http://localhost:8000/api/courses/my-courses?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const dbCourses = await res.json();
          
          // Với mỗi khóa học trong DB, gọi API lấy syllabus để tính toán tiến trình thực của user
          const mappedPromises = dbCourses.map(async (c) => {
            const aes = getCourseAesthetics(c.category);
            try {
              const syllabusRes = await fetch(`http://localhost:8000/api/learning/course/${c.id}/syllabus?email=${encodeURIComponent(user.email)}`);
              if (syllabusRes.ok) {
                const syllabusData = await syllabusRes.json();
                
                // Xác định bài học tiếp theo hoặc trạng thái hoàn thành dựa trên DB
                let lastLessonTitle = "Chưa bắt đầu học";
                if (syllabusData.chapters && syllabusData.chapters.length > 0) {
                  let firstLesson = null;
                  let lastCompletedLesson = null;
                  
                  syllabusData.chapters.forEach(ch => {
                    ch.lessons.forEach(ls => {
                      if (!firstLesson) firstLesson = ls;
                      if (ls.completed) lastCompletedLesson = ls;
                    });
                  });
                  
                  if (syllabusData.progress === 100) {
                    lastLessonTitle = "Hoàn thành khóa học";
                  } else if (lastCompletedLesson) {
                    lastLessonTitle = `Đã học xong: ${lastCompletedLesson.title}`;
                  } else if (firstLesson) {
                    lastLessonTitle = `Bài học tiếp theo: ${firstLesson.title}`;
                  }
                }
                
                return {
                  ...c,
                  progress: syllabusData.progress || 0,
                  lastLesson: lastLessonTitle,
                  lastUpdated: "Vừa xong",
                  status: syllabusData.progress === 100 ? "completed" : "learning",
                  gradient: aes.gradient,
                  badgeText: aes.badgeText,
                  icon: aes.icon,
                  image: c.image
                };
              }
            } catch (err) {
              console.error(`Lỗi tải tiến độ khóa học ${c.id}:`, err);
            }
            
            // Fallback khi không thể lấy tiến độ (ví dụ bài học chưa setup)
            return {
              ...c,
              progress: 0,
              lastLesson: "Chưa có giáo trình bài giảng",
              lastUpdated: "Mới đây",
              status: "learning",
              gradient: aes.gradient,
              badgeText: aes.badgeText,
              icon: aes.icon,
              image: c.image
            };
          });
          
          const mapped = await Promise.all(mappedPromises);
          setCourses(mapped);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Lỗi lấy khóa học của tôi:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  // Counts computed from total courses state
  const countAll = courses.length;
  const countLearning = courses.filter(c => c.status === 'learning').length;
  const countCompleted = courses.filter(c => c.status === 'completed').length;

  // Filter & Search logic
  const filteredCourses = courses
    .filter(course => {
      // 1. Filter tab
      if (activeFilter === 'learning') return course.status === 'learning';
      if (activeFilter === 'completed') return course.status === 'completed';
      if (activeFilter === 'expired') return course.status === 'expired';
      return true;
    })
    .filter(course => {
      // 2. Search query
      return course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Handle options menu actions
  const handleMenuAction = (action, courseTitle) => {
    alert(`Đang thực hiện chức năng: "${action}" đối với khóa học "${courseTitle}"`);
    setActiveMenuId(null);
  };

  return (
    <div className="my-courses-content-wrapper">
      {/* Header */}
      <div className="my-courses-header">
        <div className="my-courses-header-title-row">
          <h1 className="my-courses-title">Khóa học của tôi</h1>
          <span className="my-courses-title-separator">—</span>
          <p className="my-courses-subtitle">Theo dõi tiến độ và tiếp tục học các khóa học của bạn</p>
        </div>
      </div>

      {/* Row 2: Search and Filter Tabs */}
      <div className="my-courses-controls-row">
        <div className="my-courses-search-bar">
          <span className="my-courses-search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm khóa học..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="my-courses-filter-tabs">
          <button 
            className={`my-filter-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tất cả ({countAll})
          </button>
          <button 
            className={`my-filter-tab-btn ${activeFilter === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveFilter('learning')}
          >
            Đang học ({countLearning})
          </button>
          <button 
            className={`my-filter-tab-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Đã hoàn thành ({countCompleted})
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="my-courses-grid">
        {/* Cột trái: Danh sách khóa học */}
        <div className="my-courses-main">
          {loading ? (
            <div className="my-courses-empty">
              <p>Đang tải danh sách khóa học của bạn...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="my-courses-empty">
              <div className="my-courses-empty-icon">📖</div>
              <h3>Không tìm thấy khóa học nào</h3>
              <p>Thử tìm kiếm từ khóa khác hoặc thay đổi bộ lọc học tập.</p>
              <Link to="/courses" className="my-courses-empty-btn">
                Khám phá khóa học mới
              </Link>
            </div>
          ) : (
            filteredCourses.map(course => (
              <div key={course.id} className="my-course-card">
                {/* Thumbnail */}
                <div className="my-course-thumb" style={{ background: course.image ? 'none' : course.gradient }}>
                  {course.image ? (
                    <img src={formatImageUrl(course.image)} alt={course.title} className="my-course-thumb-img" />
                  ) : (
                    <div className="my-course-thumb-placeholder">
                      <div className="my-course-thumb-badge">{course.badgeText}</div>
                      <div className="my-course-thumb-icon">{course.icon}</div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="my-course-info">
                  <h3 className="my-course-title" title={course.title}>
                    {course.title}
                  </h3>
                  <div className="my-course-metadata-col">
                    <div className="my-course-metadata-line">
                      <span className="my-course-meta-item">Giảng viên: <strong>{course.instructor}</strong></span>
                    </div>
                    <div className="my-course-metadata-line" style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                      <span className="my-course-meta-item">Thời lượng: <strong>{course.duration}</strong></span>
                      <span className="my-course-meta-item">Danh mục: <strong>{course.category}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="my-course-actions">
                  <Link to={`/learning/${course.id}`} className="my-course-continue-btn">
                    ▶ Tiếp tục học
                  </Link>
                </div>

                {/* Options Menu */}
                <div className="my-course-options" ref={activeMenuId === course.id ? menuRef : null}>
                  <button 
                    className="my-course-options-btn"
                    onClick={() => setActiveMenuId(activeMenuId === course.id ? null : course.id)}
                  >
                    •••
                  </button>
                  {activeMenuId === course.id && (
                    <div className="my-course-options-menu">
                      <button onClick={() => handleMenuAction('Xem tài liệu', course.title)} className="my-course-options-item">
                        📚 Tài liệu học tập
                      </button>
                      <button onClick={() => handleMenuAction('Đánh giá khóa học', course.title)} className="my-course-options-item">
                        ⭐ Đánh giá khóa học
                      </button>
                      {course.progress === 100 && (
                        <button onClick={() => handleMenuAction('Xem chứng chỉ', course.title)} className="my-course-options-item" style={{ color: '#10B981', fontWeight: 'bold' }}>
                          🎓 Nhận chứng chỉ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Mycorse;
