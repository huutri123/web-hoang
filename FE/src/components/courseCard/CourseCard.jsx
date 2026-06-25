import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

/* ============================================================
   COURSECARD - Component dùng chung cho khóa học
   Props:
   - title   : Tên khóa học
   - desc    : Mô tả khóa học
   - price   : Giá tiền (number)
   - rating  : Điểm đánh giá (number, mặc định 4.8)
   - color   : URL ảnh nền, ví dụ: "url('/assets/images/abc.jpg')"
   - category: Danh mục khóa học (string, tùy chọn)
   ============================================================ */
function CourseCard({ title, desc, price, rating = 4.8, color, className = "", courseId = 'lap-trinh-python' }) {
  return (
    <div className={`course-card ${className}`}>
      {/* Ảnh nền thumbnail */}
      <div
        className="course-card-thumb"
        style={{
          background: color,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Nội dung thông tin */}
      <div className="course-card-body">
        <h3 className="course-card-title">{title}</h3>
        <p className="course-card-desc">{desc}</p>

        {/* Giá + Đánh giá */}
        <div className="course-card-pricing">
          <span className="course-card-price">{price.toLocaleString()}đ</span>
          <span className="course-card-price-old">
            {Math.floor(price * 1.4).toLocaleString()}đ
          </span>
          <div className="course-card-rating">
            <span className="course-card-star">⭐</span>
            <span className="course-card-rating-val">{parseFloat(rating) === 0 ? "Chưa có" : rating}</span>
          </div>
        </div>

        {/* Nút hành động */}
        <Link to={`/course/${courseId}`} className="course-card-btn-link">
          <button className="course-card-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Xem Chi Tiết
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CourseCard;
