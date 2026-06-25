import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { useAuth } from '../../services/AuthContext';
import { Link } from 'react-router-dom';
import { getCart } from '../../services/cartService';

const Navbar = () => {
  const { user, logout, openModal } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [cartItemsCount, setCartItemsCount] = useState(0);

  const fetchCartCount = async () => {
    if (user && user.email) {
      const items = await getCart(user.email);
      setCartItemsCount(items.length);
    } else {
      setCartItemsCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();

    // Lắng nghe sự kiện giỏ hàng thay đổi từ các trang khác
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, [user]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <div className="navbar-logo" onClick={() => window.location.href = '/'}>
          <div className="navbar-logo-img-wrap">
            <img src="/assets/images/logo.png" alt="EduPro Logo" className="navbar-logo-img" />
          </div>
          <span className="navbar-logo-text">EduPro</span>
        </div>



        {/* Nav Links */}
        <div className="navbar-links">
          <Link to="/courses">Khóa học</Link>
          <Link to="/contests">Cuộc thi</Link>
          <a href="/leaderboard">Bảng xếp hạng</a>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="navbar-icon-btn">☀️</button>

          {user ? (
            <div className="navbar-auth-section">

              {/* Giỏ hàng */}
              <Link to="/checkout" className="navbar-cart-link" style={{ textDecoration: 'none' }}>
                <button className="navbar-cart-btn" title="Giỏ hàng">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="navbar-cart-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  {cartItemsCount > 0 && (
                    <span className="navbar-cart-badge">{cartItemsCount}</span>
                  )}
                </button>
              </Link>

              {/* Tên + Avatar + Dropdown */}
              <div className="navbar-user-dropdown" ref={dropdownRef}>
                <button
                  className="navbar-user-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user.name}</span>
                    <span className="navbar-user-role">
                      {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                    </span>
                  </div>
                  <div className="navbar-avatar">
                    {user.avatar || '🧑‍🎓'}
                  </div>
                  {/* Mũi tên trạng thái mở/đóng */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    className={`navbar-chevron ${showDropdown ? 'open' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="navbar-dropdown">
                    {/* Thông tin tài khoản */}
                    <div className="navbar-dropdown-header">
                      <div className="navbar-dropdown-user">
                        <div className="navbar-dropdown-avatar">
                          {user.avatar || '🧑‍🎓'}
                        </div>
                        <div className="navbar-dropdown-info">
                          <span className="navbar-dropdown-name">{user.name}</span>
                          <span className="navbar-dropdown-email">
                            {user.role === 'admin' ? 'Quản trị viên EduPro' : user.email || 'Học viên EduPro'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="navbar-dropdown-body">
                      {user.role === 'admin' && (
                        <button 
                          className="navbar-dropdown-item admin-item" 
                          onClick={() => { setShowDropdown(false); window.open('/admin', '_blank'); }}
                          style={{ color: '#3b82f6', fontWeight: '700' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="navbar-dropdown-item-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                          </svg>
                          Trang quản lý
                        </button>
                      )}
                      <Link to="/profile?tab=info" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setShowDropdown(false)}>
                        <button className="navbar-dropdown-item">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="navbar-dropdown-item-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                          Hồ sơ cá nhân
                        </button>
                      </Link>
                      <Link to="/profile?tab=my-courses" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setShowDropdown(false)}>
                        <button className="navbar-dropdown-item">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="navbar-dropdown-item-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                          </svg>
                          Khóa học của tôi
                        </button>
                      </Link>
                      <button className="navbar-dropdown-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="navbar-dropdown-item-icon">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Cài đặt tài khoản
                      </button>
                    </div>

                    {/* Đăng xuất */}
                    <div className="navbar-dropdown-divider">
                      <button onClick={handleLogout} className="navbar-dropdown-logout">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="navbar-dropdown-item-icon">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <>
              <button
                onClick={() => openModal('login')}
                className="navbar-btn-login"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => openModal('register')}
                className="navbar-btn-register"
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
