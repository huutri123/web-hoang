import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import './AuthModal.css';

const AuthModal = () => {
  const { showAuthModal, closeModal, authMode, setAuthMode, login, authError, setAuthError } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  // Xử lý Gửi Form
  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    const loginData = { email: loginForm.email, password: loginForm.password };
    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const result = await response.json();
      if (response.ok && result.message) {
        alert('🎉 CHÀO MỪNG TRỞ LẠI: ' + result.username);
        login(result); 
      } else {
        setAuthError(result.error);
      }
    } catch (error) {
      setAuthError('Máy chủ chưa bật hoặc rớt mạng!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); 
    if (registerForm.password !== registerForm.confirm) {
      setAuthError('Mật khẩu xác nhận không khớp!'); return;
    }
    if (registerForm.password.length < 6) {
      setAuthError('Mật khẩu phải có ít nhất 6 ký tự!'); return;
    }
    setLoading(true);
    const userData = { username: registerForm.name, email: registerForm.email, password: registerForm.password };
    try {
        const response = await fetch('http://127.0.0.1:8000/register', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData) 
        });
        const result = await response.json(); 
        if (response.ok && result.message) {
            alert('🎉 CHÚC MỪNG: ' + result.message);
            switchMode('login');
        } else {
            setAuthError(result.error || 'Có lỗi xảy ra, đăng ký thất bại!');
        }
    } catch (error) {
        setAuthError('Lỗi kết nối tới máy chủ, vui lòng kiểm tra Backend!');
    } finally {
        setLoading(false);
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setAuthError('');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className="modal-container" id="auth-modal">
        {/* Left panel — EduPro Light Design */}
        <div 
          className="modal-left" 
          style={{ background: "#F1F6FE url('/auth-bg.png') center bottom / 100% auto no-repeat" }}
        >
          <div className="modal-left-content">
            <div className="modal-brand-wrap">
              <span className="modal-brand-icon">🎓</span>
              <h2 className="modal-brand">EduPro</h2>
            </div>
            <h1 className="modal-main-title">
              Nền tảng học tập<br/>hàng đầu <span className="text-blue">Việt Nam</span>
            </h1>
            <p className="modal-tagline">
              Học tập chất lượng – Thi đấu hấp dẫn –<br/>
              Cộng đồng phát triển mỗi ngày.
            </p>
          </div>
        </div>

        {/* Right panel — form with fixed height container to prevent resize */}
        <div className="modal-right">
          <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>

          {/* Tabs */}
          <div className="modal-tabs">
            <button
              className={`modal-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Đăng nhập
            </button>
            <button
              className={`modal-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Đăng ký
            </button>
          </div>

          <div className="modal-form-container">
            {/* Header Titles */}
            <div className="form-header">
              {authMode === 'login' ? (
                <>
                  <h3>Chào mừng trở lại! 👋</h3>
                  <p>Đăng nhập để tiếp tục hành trình học tập của bạn</p>
                </>
              ) : (
                <>
                  <h3>Tạo tài khoản mới 🚀</h3>
                  <p>Tham gia cùng hàng ngàn học viên trên EduPro</p>
                </>
              )}
            </div>

            {/* Error */}
            {authError && (
              <div className="auth-error" role="alert">
                ⚠️ {authError}
              </div>
            )}

            {/* Login Form */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="auth-form fade-in">
                <div className="form-group">
                  <label className="form-label">Email hoặc tên đăng nhập</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Nhập email hoặc tên đăng nhập"
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Nhập mật khẩu"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowLoginPw(!showLoginPw)}>
                      {showLoginPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                
                <div className="form-actions-row">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="#" className="forgot-pw" onClick={e => e.preventDefault()}>Quên mật khẩu?</a>
                </div>

                <button type="submit" className="auth-submit-btn blue-btn mt-2" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Đăng nhập →'}
                </button>
                
                <div className="social-auth pt-4">
                  <div className="social-divider"><span>hoặc đăng nhập với</span></div>
                  <div className="social-buttons">
                    <button type="button" className="social-btn">
                      <span>𝐆</span> Google
                    </button>
                    <button type="button" className="social-btn">
                      <span className="fb-icon">𝐟</span> Facebook
                    </button>
                    <button type="button" className="social-btn">
                      <span>🍏</span> Apple
                    </button>
                  </div>
                </div>
                
                <div className="auth-footer">
                  <p>Chưa có tài khoản? <a href="#" onClick={(e) => {e.preventDefault(); switchMode('register');}}>Đăng ký ngay</a></p>
                  <p className="security-note">🛡️ Thông tin của bạn được bảo mật tuyệt đối</p>
                </div>
              </form>
            )}

            {/* Register Form */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="auth-form fade-in">
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập họ và tên đầy đủ"
                      value={registerForm.name}
                      onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Nhập địa chỉ email"
                      value={registerForm.email}
                      onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showRegisterPw ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Tối thiểu 6 ký tự"
                      value={registerForm.password}
                      onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔐</span>
                    <input
                      type={showRegisterPw ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Nhập lại mật khẩu"
                      value={registerForm.confirm}
                      onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions-row">
                  <label className="remember-me">
                    <input type="checkbox" required />
                    <span>Tôi đồng ý với Điều khoản và Chính sách</span>
                  </label>
                </div>

                <button type="submit" className="auth-submit-btn blue-btn mt-2" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Đăng ký ngay →'}
                </button>
                
                <div className="auth-footer mt-4">
                  <p>Đã có tài khoản? <a href="#" onClick={(e) => {e.preventDefault(); switchMode('login');}}>Đăng nhập</a></p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
