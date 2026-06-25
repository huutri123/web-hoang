import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <div className="footer-brand-logo">
              <div className="footer-brand-icon">
                <span>🎓</span>
              </div>
              <span className="footer-brand-name">EduPro</span>
            </div>
            <p className="footer-brand-desc">
              Nền tảng học tập và thi đấu lập trình trực tuyến hàng đầu Việt Nam.
            </p>
            <div className="footer-social-links">
              {['f', 'yt', 'in', 'gh'].map(s => (
                <button key={s} className="footer-social-btn">{s}</button>
              ))}
            </div>
          </div>

          {/* Khóa học */}
          <div>
            <h4 className="footer-col-title">Khóa học</h4>
            <ul className="footer-link-list">
              <li><a href="#">Lập trình</a></li>
              <li><a href="#">Cấu trúc dữ liệu</a></li>
              <li><a href="#">Trí tuệ nhân tạo</a></li>
              <li><a href="#">Phát triển web</a></li>
            </ul>
          </div>

          {/* Cuộc thi */}
          <div>
            <h4 className="footer-col-title">Cuộc thi</h4>
            <ul className="footer-link-list">
              <li><a href="#">Cuộc thi hiện tại</a></li>
              <li><a href="#">Cuộc thi sắp diễn ra</a></li>
              <li><a href="#">Lịch sử cuộc thi</a></li>
              <li><a href="#">Thể lệ cuộc thi</a></li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="footer-col-title">Hỗ trợ</h4>
            <ul className="footer-link-list">
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">Hướng dẫn sử dụng</a></li>
              <li><a href="#">Điều khoản dịch vụ</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="footer-col-title">Đăng ký nhận tin</h4>
            <p className="footer-newsletter-desc">Nhận thông tin về khóa học và cuộc thi mới nhất</p>
            <div className="footer-newsletter-form">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="footer-newsletter-input"
              />
              <button className="footer-newsletter-btn">Đăng ký</button>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2024 EduPro. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
