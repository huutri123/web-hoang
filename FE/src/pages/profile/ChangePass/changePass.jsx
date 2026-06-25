import React, { useState } from 'react';
import { useAuth } from '../../../services/AuthContext';
import './changePass.css';

function ChangePass() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      setToastMessage('Mật khẩu mới nhập lại không khớp!');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      if (res.ok) {
        setToastMessage('Đổi mật khẩu thành công!');
        setToastType('success');
        setShowToast(true);
        // Clear fields
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        const errorData = await res.json();
        setToastMessage(errorData.detail || 'Đổi mật khẩu thất bại!');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      setToastMessage('Lỗi kết nối máy chủ!');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  return (
    <div className="cp-container">
      <div className="cp-header">
        <h2 className="cp-title">Đổi mật khẩu</h2>
        <p className="cp-subtitle">Cập nhật mật khẩu tài khoản học viên để bảo vệ thông tin của bạn</p>
      </div>

      <form className="cp-form" onSubmit={handleSave}>
        <div className="cp-form-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '500px' }}>
          {/* Old Password */}
          <div className="cp-form-group">
            <label className="cp-label">Mật khẩu hiện tại</label>
            <input 
              type="password" 
              className="cp-input" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
          </div>

          {/* New Password */}
          <div className="cp-form-group">
            <label className="cp-label">Mật khẩu mới</label>
            <input 
              type="password" 
              className="cp-input" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="cp-form-group">
            <label className="cp-label">Xác nhận mật khẩu mới</label>
            <input 
              type="password" 
              className="cp-input" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <div className="cp-submit-row" style={{ marginTop: '24px' }}>
          <button type="submit" className="cp-submit-btn">
            🔑 Đổi mật khẩu
          </button>
        </div>
      </form>

      {/* Notification Toast */}
      {showToast && (
        <div className="cp-toast" style={{
          backgroundColor: toastType === 'error' ? '#EF4444' : '#10B981'
        }}>
          <span className="cp-toast-icon">{toastType === 'error' ? '✗' : '✓'}</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default ChangePass;
