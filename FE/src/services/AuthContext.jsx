import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("edupro_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authError, setAuthError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // ==========================================
  // Hàm nhận thông tin từ AuthModal sau khi Backend xác nhận đăng nhập thành công
  // ==========================================
  const login = (userData) => {
    const loggedInUser = {
      id: userData.id || Date.now(),
      email: userData.email,
      name: userData.username || userData.name,
      avatar: userData.avatar || 'http://localhost:8000/upload/avatar/default_avatar.png',
      role: userData.role || 'user',
      points: userData.points || 0,
    };
    setUser(loggedInUser);
    localStorage.setItem("edupro_user", JSON.stringify(loggedInUser));
    setAuthError('');
    setShowAuthModal(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("edupro_user");
  };

  const openModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthError('');
    setShowAuthModal(true);
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setAuthError('');
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      authError, setAuthError,
      showAuthModal, openModal, closeModal,
      authMode, setAuthMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
