import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { useAuth } from '../../services/AuthContext';
import PersonalInfo from './Info/info';
import MyCoursesList from './Mycorse/mycorse';
import ChangePassword from './ChangePass/changePass';
import './ProfilePage.css';

function ProfilePage() {
  const { user, openModal } = useAuth();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || (pathname.includes('my-courses') ? 'my-courses' : 'info');

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Safe navigation if user changes active tab and wants to keep URL clean
  useEffect(() => {
    if (!searchParams.get('tab')) {
      const defaultTab = pathname.includes('my-courses') ? 'my-courses' : 'info';
      setSearchParams({ tab: defaultTab }, { replace: true });
    }
  }, [searchParams, setSearchParams, pathname]);

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="profile-wrapper" style={{ margin: '80px auto' }}>
          <div className="my-courses-empty" style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div className="my-courses-empty-icon" style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>Vui lòng đăng nhập</h3>
            <p style={{ color: '#6B7280', margin: '0 0 24px', fontSize: '14px' }}>Bạn cần đăng nhập tài khoản học viên để xem và quản lý hồ sơ cá nhân.</p>
            <button 
              onClick={() => openModal('login')} 
              className="pi-submit-btn" 
              style={{ border: 'none', cursor: 'pointer', float: 'none', display: 'inline-block' }}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Get first letter of username for placeholder avatar
  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <Navbar />
      <div className="profile-wrapper">
        <div className="profile-grid">
          {/* Cột trái: Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-user-card">
              <div className="profile-avatar-circle">
                {avatarLetter}
              </div>
              <h3 className="profile-user-name">{user.name}</h3>
              <p className="profile-user-email">{user.email}</p>
            </div>

            <div className="profile-menu">
              <button 
                className={`profile-menu-item ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => handleTabChange('info')}
              >
                <div className="profile-menu-item-left">
                  <span className="profile-menu-item-icon">💳</span>
                  <span>Thông tin cá nhân</span>
                </div>
                <span className="profile-menu-chevron">➔</span>
              </button>

              <button 
                className={`profile-menu-item ${activeTab === 'my-courses' ? 'active' : ''}`}
                onClick={() => handleTabChange('my-courses')}
              >
                <div className="profile-menu-item-left">
                  <span className="profile-menu-item-icon">🎓</span>
                  <span>Khóa học của tôi</span>
                </div>
                <span className="profile-menu-chevron">➔</span>
              </button>

              <button 
                className={`profile-menu-item ${activeTab === 'change-password' ? 'active' : ''}`}
                onClick={() => handleTabChange('change-password')}
              >
                <div className="profile-menu-item-left">
                  <span className="profile-menu-item-icon">🔑</span>
                  <span>Đổi mật khẩu</span>
                </div>
                <span className="profile-menu-chevron">➔</span>
              </button>
            </div>
          </div>

          {/* Cột phải: Content */}
          <div className="profile-content-card">
            {activeTab === 'info' && <PersonalInfo />}
            {activeTab === 'my-courses' && <MyCoursesList />}
            {activeTab === 'change-password' && <ChangePassword />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProfilePage;
