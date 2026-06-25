import React, { useState, useEffect } from "react";
import "./AdminCourse.css";
import CreatCourse from "./CreatCourse/CreatCourse";
import { getCourses, deleteCourse, getCourseDetail } from "../../../services/courseService";

export default function AdminCourse({ initialCreateView = false }) {
  const [showCreateView, setShowCreateView] = useState(initialCreateView);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState("all");
  const [pageSize, setPageSize] = useState(10);

  // Tải danh sách khóa học khi khởi chạy trang
  useEffect(() => {
    fetchCoursesData();
  }, []);

  const fetchCoursesData = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xóa khóa học
  const handleDelete = async (id, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}" khỏi hệ thống không?`)) {
      try {
        await deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id));
        alert("Xóa khóa học thành công!");
      } catch (err) {
        alert("Lỗi khi xóa khóa học: " + err.message);
      }
    }
  };

  // Hàm xử lý khi nhấn chỉnh sửa khóa học
  const handleEdit = async (course) => {
    try {
      setLoading(true);
      const detail = await getCourseDetail(course.slug || course.id);
      setEditingCourse(detail);
    } catch (err) {
      alert("Lỗi tải thông tin chi tiết khóa học để chỉnh sửa: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showCreateView || editingCourse) {
    return (
      <CreatCourse 
        courseToEdit={editingCourse} 
        onCancel={() => {
          setShowCreateView(false);
          setEditingCourse(null);
        }}
        onSuccess={() => {
          setShowCreateView(false);
          setEditingCourse(null);
          fetchCoursesData();
        }}
      />
    );
  }

  // 1. Phân loại lớp học CSS cho Danh mục
  const getCategoryClass = (category) => {
    switch (category) {
      case "Lập trình":
        return "tag-programming";
      case "Thiết kế":
        return "tag-design";
      case "Công nghệ":
        return "tag-tech";
      case "Kinh doanh":
        return "tag-business";
      default:
        return "tag-programming";
    }
  };

  // 2. Phân loại lớp học CSS cho Trạng thái
  const getStatusClass = (status) => {
    return status === "Hiển thị" ? "status-active" : "status-hidden";
  };

  // 3. Thực hiện lọc và tìm kiếm dữ liệu thực tế
  const filteredCourses = courses.filter((course) => {
    // Tìm kiếm theo tên khóa học hoặc tên giảng viên
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()));

    // Lọc theo danh mục
    let matchesCategory = true;
    if (selectedCategory !== "all") {
      const catMap = {
        "lap-trinh": "Lập trình",
        "thiet-ke": "Thiết kế",
        "cong-nghe": "Công nghệ",
        "kinh-doanh": "Kinh doanh"
      };
      matchesCategory = course.category === catMap[selectedCategory] || course.category === selectedCategory;
    }

    // Lọc theo trạng thái
    let matchesStatus = true;
    if (selectedStatus !== "all") {
      const statusMap = {
        "hien-thi": "Hiển thị",
        "an": "Ẩn"
      };
      matchesStatus = course.status === statusMap[selectedStatus] || course.status === selectedStatus;
    }

    // Lọc theo giảng viên
    let matchesInstructor = true;
    if (selectedInstructor !== "all") {
      const instMap = {
        "an": "Nguyễn Văn An",
        "duc": "Trần Minh Đức",
        "huy": "Phạm Quốc Huy",
        "yen": "Lê Hoàng Yến"
      };
      matchesInstructor = course.instructor === instMap[selectedInstructor] || course.instructor === selectedInstructor;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesInstructor;
  });

  // 4. Tính toán các chỉ số thống kê động
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.status === "Hiển thị").length;
  const hiddenCourses = courses.filter(c => c.status === "Ẩn").length;
  const ratedCourses = courses.filter(c => parseFloat(c.rating) > 0);
  const averageRating = ratedCourses.length > 0
    ? (ratedCourses.reduce((acc, curr) => acc + parseFloat(curr.rating), 0) / ratedCourses.length).toFixed(1)
    : "Chưa có";

  return (
    <div className="mc-container">
      {/* Title and Breadcrumb */}
      <div className="mc-header-section">
        <h2 className="mc-title">Quản lý khóa học</h2>
        <div className="mc-breadcrumb">
          <span>Dashboard</span>
          <span className="mc-divider">&gt;</span>
          <span className="mc-active-crumb">Quản lý khóa học</span>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="mc-stats-grid">
        <div className="mc-stat-card border-green">
          <div className="mc-stat-icon-bg bg-green">
            <span className="mc-stat-icon">📘</span>
          </div>
          <div className="mc-stat-content">
            <span className="mc-stat-label">Tổng khóa học</span>
            <span className="mc-stat-value">{totalCourses}</span>
          </div>
        </div>

        <div className="mc-stat-card border-pink">
          <div className="mc-stat-icon-bg bg-pink">
            <span className="mc-stat-icon">✔️</span>
          </div>
          <div className="mc-stat-content">
            <span className="mc-stat-label">Đang hiển thị</span>
            <span className="mc-stat-value">{activeCourses}</span>
          </div>
        </div>

        <div className="mc-stat-card border-orange">
          <div className="mc-stat-icon-bg bg-orange">
            <span className="mc-stat-icon">👁️‍🗨️</span>
          </div>
          <div className="mc-stat-content">
            <span className="mc-stat-label">Đang ẩn</span>
            <span className="mc-stat-value">{hiddenCourses}</span>
          </div>
        </div>

        <div className="mc-stat-card border-purple">
          <div className="mc-stat-icon-bg bg-purple">
            <span className="mc-stat-icon">⭐</span>
          </div>
          <div className="mc-stat-content">
            <span className="mc-stat-label">Đánh giá TB</span>
            <span className="mc-stat-value">{averageRating} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Table Filter Control Box */}
      <div className="mc-filter-box">
        <div className="mc-search-wrapper">
          <svg className="mc-search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mc-dropdowns-group">
          <div className="mc-select-wrapper">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">Tất cả danh mục</option>
              <option value="lap-trinh">Lập trình</option>
              <option value="thiet-ke">Thiết kế</option>
              <option value="cong-nghe">Công nghệ</option>
              <option value="kinh-doanh">Kinh doanh</option>
            </select>
          </div>

          <div className="mc-select-wrapper">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="hien-thi">Hiển thị</option>
              <option value="an">Ẩn</option>
            </select>
          </div>

          <div className="mc-select-wrapper">
            <select value={selectedInstructor} onChange={(e) => setSelectedInstructor(e.target.value)}>
              <option value="all">Tất cả giảng viên</option>
              <option value="an">Nguyễn Văn An</option>
              <option value="duc">Trần Minh Đức</option>
              <option value="huy">Phạm Quốc Huy</option>
              <option value="yen">Lê Hoàng Yến</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Data Table */}
      <div className="mc-table-wrapper">
        <table className="mc-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" className="mc-checkbox" /></th>
              <th width="40" className="text-center">#</th>
              <th>KHÓA HỌC</th>
              <th>DANH MỤC</th>
              <th>GIẢNG VIÊN</th>
              <th>GIÁ</th>
              <th>HỌC VIÊN</th>
              <th>ĐÁNH GIÁ</th>
              <th>TRẠNG THÁI</th>
              <th className="text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center" style={{ padding: "32px", color: "#64748b" }}>
                  Đang tải danh sách khóa học từ máy chủ...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="10" className="text-center" style={{ padding: "32px", color: "#ef4444" }}>
                  Có lỗi xảy ra: {error}. Vui lòng thử lại!
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center" style={{ padding: "32px", color: "#64748b" }}>
                  Không tìm thấy khóa học nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredCourses.map((course, idx) => (
                <tr key={course.id}>
                  <td><input type="checkbox" className="mc-checkbox" /></td>
                  <td className="text-center mc-row-index">{idx + 1}</td>
                  <td>
                    <div className="mc-course-title">{course.title}</div>
                  </td>
                  <td>
                    <span className={`mc-tag ${getCategoryClass(course.category)}`}>
                      {course.category || "Chưa phân loại"}
                    </span>
                  </td>
                  <td>
                    <div className="mc-instructor-info">
                      <img 
                        src={course.instructorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80"} 
                        alt={course.instructor} 
                        className="mc-instructor-avatar" 
                      />
                      <span className="mc-instructor-name">{course.instructor || "Giảng viên"}</span>
                    </div>
                  </td>
                  <td className="mc-price-cell">{course.price || "0đ"}</td>
                  <td className="mc-students-cell">{course.students || "0"}</td>
                  <td>
                    <div className="mc-rating-cell">
                      <span className="star-icon">⭐</span>
                      <span className="rating-value">{parseFloat(course.rating) === 0 ? "Chưa có" : course.rating}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`mc-status-pill ${getStatusClass(course.status)}`}>
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <div className="mc-actions-group">
                      <button className="mc-action-icon-btn btn-edit" title="Chỉnh sửa" onClick={() => handleEdit(course)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="mc-action-icon-btn btn-delete" 
                        title="Xóa"
                        onClick={() => handleDelete(course.id, course.title)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mc-footer-pagination">
        <div className="mc-page-size-selector">
          <span>Hiển thị</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>kết quả</span>
        </div>

        <div className="mc-pagination-controls">
          <span className="mc-pagination-info">
            Trang 1 / {Math.ceil(filteredCourses.length / pageSize) || 1}
          </span>
          <div className="mc-page-buttons">
            <button className="mc-page-btn active">1</button>
            {Math.ceil(filteredCourses.length / pageSize) > 1 && (
              <button className="mc-page-btn">2</button>
            )}
            <button className="mc-page-btn btn-next">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
