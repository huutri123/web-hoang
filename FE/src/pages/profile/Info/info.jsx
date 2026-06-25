import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../services/AuthContext';
import './info.css';

function Info() {
  const { user } = useAuth();
  
  // Local state for DB user fields
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('Nam');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Cập nhật thông tin cá nhân thành công!');

  // Fetch user information from database on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !user.email) return;
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/users/profile?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setFullname(data.fullname || '');
          setPhone(data.phone || '');
          setBirthdate(data.birthdate || '');
          setGender(data.gender || 'Nam');
          setAddress(data.address || '');
        }
      } catch (err) {
        console.error("Lỗi fetch thông tin cá nhân:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !user.email) return;

    // Validate phone number format (starts with 0 and exactly 10 digits if provided)
    if (phone) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(phone)) {
        setToastMessage('Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        return;
      }
    }

    // Validate birthdate (year between 1900 and current year)
    if (birthdate) {
      const selectedYear = new Date(birthdate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (selectedYear < 1900 || selectedYear > currentYear) {
        setToastMessage(`Năm sinh phải nằm trong khoảng từ 1900 đến ${currentYear}!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        return;
      }
    }

    try {
      const res = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          fullname,
          phone,
          birthdate,
          gender,
          address
        })
      });

      if (res.ok) {
        setToastMessage('Cập nhật thông tin cá nhân thành công!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        const errorData = await res.json();
        setToastMessage(errorData.detail || 'Cập nhật thất bại!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Lỗi cập nhật thông tin cá nhân:", err);
      setToastMessage('Lỗi kết nối máy chủ!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="info-container" style={{ padding: '40px', textAlign: 'center' }}>
        <p>Đang tải thông tin cá nhân của bạn...</p>
      </div>
    );
  }

  return (
    <div className="info-container">
      <div className="info-header">
        <h2 className="info-title">Thông tin cá nhân</h2>
        <p className="info-subtitle">Quản lý và cập nhật thông tin hồ sơ cá nhân của bạn trực tiếp từ hệ thống</p>
      </div>

      <form className="info-form" onSubmit={handleSave}>
        <div className="info-form-grid">
          {/* Full Name */}
          <div className="info-form-group">
            <label className="info-label">Họ và tên</label>
            <input 
              type="text" 
              className="info-input" 
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          {/* Email (Read only) */}
          <div className="info-form-group">
            <label className="info-label">Email tài khoản</label>
            <input 
              type="email" 
              className="info-input info-input-readonly" 
              value={user?.email || ''}
              disabled
              title="Email đăng nhập không thể thay đổi"
            />
          </div>

          {/* Phone number */}
          <div className="info-form-group">
            <label className="info-label">Số điện thoại</label>
            <input 
              type="tel" 
              className="info-input" 
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Birthday */}
          <div className="info-form-group">
            <label className="info-label">Ngày sinh</label>
            <input 
              type="date" 
              className="info-input" 
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              min="1900-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Gender */}
          <div className="info-form-group">
            <label className="info-label">Giới tính</label>
            <select 
              className="info-input" 
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Address */}
          <div className="info-form-group">
            <label className="info-label">Địa chỉ</label>
            <input 
              type="text"
              className="info-input" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ của bạn..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="info-submit-row">
          <button type="submit" className="info-submit-btn">
            💾 Cập nhật thông tin
          </button>
        </div>
      </form>

      {/* Success Notification Toast */}
      {showToast && (
        <div className="info-toast">
          <span className="info-toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default Info;
