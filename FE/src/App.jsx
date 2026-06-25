import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import AuthModal from './components/login/AuthModal';
import LeaderboardPage from './pages/ranking/LeaderboardPage';
import HomePage from './pages/homePage/HomePage';
import './index.css';
import ContestDetailPage from './pages/contest/contestdetail/ContestDetailPage';
import ExamPage from './pages/contest/exampage/ExamPage';
import ContestPage from './pages/contest/All_contest_page/ContestsPage';
import AllCoursePage from './pages/allCourse/AllCoursePage';
import CourseDetailPage from './pages/courseDetail/CourseDetailPage';
import AdminManager from './pages/adminManager/manager';
import CheckoutPage from './pages/checkout/CheckoutPage';
import ProfilePage from './pages/profile/ProfilePage';
import LearningPage from './pages/learning/LearningPage';

/* ============================================================
   PROTECTED ROUTE - Chặn truy cập của khách chưa đăng nhập
   ============================================================ */
function ProtectedRoute({ children }) {
  const { user, openModal } = useAuth();

  useEffect(() => {
    if (!user) {
      openModal('login');
    }
  }, [user, openModal]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* ============================================================
   APP - Điều hướng trang (Routing)
   / → Trang chủ
   /leaderboard → Trang Bảng xếp hạng chi tiết (Bảo vệ)
   ============================================================ */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Nền xanh nhạt pastel: 2 bên đậm khớp với footer, ở giữa trắng xám */}
        <div className="app-wrapper">
          <AuthModal />
          <Routes>
            {/* Route công khai */}
            <Route path="/" element={<HomePage />} />
            
            {/* Các route yêu cầu đăng nhập */}
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/contests" element={<ProtectedRoute><ContestPage /></ProtectedRoute>} />
            <Route path="/contest/:contestId" element={<ProtectedRoute><ContestDetailPage /></ProtectedRoute>} />
            <Route path="/exam/:contestId" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><AllCoursePage /></ProtectedRoute>} />
            <Route path="/course/:courseId" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminManager /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/my-courses" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/learning/:courseId" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;