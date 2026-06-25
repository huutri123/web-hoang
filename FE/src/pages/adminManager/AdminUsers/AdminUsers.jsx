import React, { useState, useEffect } from "react";
import "./AdminUsers.css";
import { getUsers, updateUserStatus, updateUserContestBan } from "../../../services/userService";

const getMockDetails = (id) => {
  if (id % 3 === 0) {
    return {
      courses: [
        { name: "Cấu trúc dữ liệu và giải thuật", date: "12/05/2026", image: "📊" },
        { name: "Java Spring Boot từ A-Z", date: "01/04/2026", image: "☕" }
      ],
      contests: [
        { name: "Data Science Hackathon", date: "10/03/2026", rank: "Top 25%" }
      ],
      reviews: []
    };
  } else if (id % 2 === 0) {
    return {
      courses: [
        { name: "React.js từ A-Z", date: "10/04/2026", image: "⚛️" },
        { name: "UI/UX Design cho người mới", date: "01/03/2026", image: "🎨" }
      ],
      contests: [
        { name: "Frontend Challenge 2026", date: "15/04/2026", rank: "Top 8%" }
      ],
      reviews: [
        { course: "React.js từ A-Z", stars: 5, date: "12/04/2026" }
      ]
    };
  } else {
    return {
      courses: [
        { name: "Python cơ bản đến nâng cao", date: "20/05/2026", image: "🐍" },
        { name: "React.js từ A-Z", date: "15/04/2026", image: "⚛️" }
      ],
      contests: [
        { name: "AI Coding Battle 2026", date: "20/05/2026", rank: "Top 5%" }
      ],
      reviews: [
        { course: "Python cơ bản đến nâng cao", stars: 5, date: "20/05/2026" }
      ]
    };
  }
};

export default function AdminUsers() {
  // State for user search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'locked'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch users from API
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        const populated = data.map(u => ({
          ...u,
          ...getMockDetails(u.id)
        }));
        setUsers(populated);
        if (populated.length > 0) {
          setSelectedUserId(populated[0].id);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách người dùng:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  // Get active user details
  const activeUser = users.find(u => u.id === selectedUserId) || users[0];

  // Helper actions to modify user status
  const handleLockAccount = async (id) => {
    try {
      await updateUserStatus(id, "Đã khóa");
      alert(`Đã khóa tài khoản của học viên ${activeUser.fullname || activeUser.username}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "Đã khóa" } : u));
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleUnlockAccount = async (id) => {
    try {
      await updateUserStatus(id, "Hoạt động");
      alert(`Đã mở khóa tài khoản cho học viên ${activeUser.fullname || activeUser.username}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "Hoạt động" } : u));
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleToggleContestBan = async (id) => {
    const userToToggle = users.find(u => u.id === id);
    if (userToToggle) {
      const nextStatus = !userToToggle.contest_banned;
      try {
        await updateUserContestBan(id, nextStatus);
        alert(nextStatus ? `Đã cấm thi đấu đối với học viên ${userToToggle.fullname || userToToggle.username}` : `Đã bỏ cấm thi đấu cho học viên ${userToToggle.fullname || userToToggle.username}`);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, contest_banned: nextStatus } : u));
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  };

  const handleGrantFreeCourse = () => {
    const courseName = prompt("Nhập tên khóa học muốn cấp miễn phí:");
    if (courseName) {
      setUsers(prev => prev.map(u => {
        if (u.id === selectedUserId) {
          return {
            ...u,
            courses: [
              { name: courseName, date: new Date().toLocaleDateString("vi-VN"), image: "🎓" },
              ...u.courses
            ]
          };
        }
        return u;
      }));
      alert(`Đã cấp thành công khóa học "${courseName}" cho học viên ${activeUser.fullname || activeUser.username}`);
    }
  };

  // Filter and Search computed list
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "active") {
      return matchesSearch && user.status === "Hoạt động";
    }
    if (statusFilter === "locked") {
      return matchesSearch && user.status === "Đã khóa";
    }
    return matchesSearch;
  });

  // Stats Counters
  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === "Hoạt động").length;
  const lockedCount = users.filter(u => u.status === "Đã khóa").length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;

  if (loading) {
    return <div className="usr-container" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Đang tải danh sách học viên...</div>;
  }

  return (
    <div className="usr-container">
      {/* Top 4 Stats Cards */}
      <div className="usr-stats-grid">
        <div className="usr-stat-card border-green">
          <div className="usr-stat-icon-bg bg-blue">
            <span className="usr-stat-icon">👥</span>
          </div>
          <div className="usr-stat-content">
            <span className="usr-stat-label">Tổng người dùng</span>
            <span className="usr-stat-value">{totalCount}</span>
          </div>
        </div>

        <div className="usr-stat-card border-pink">
          <div className="usr-stat-icon-bg bg-green">
            <span className="usr-stat-icon">💚</span>
          </div>
          <div className="usr-stat-content">
            <span className="usr-stat-label">Học viên</span>
            <span className="usr-stat-value">{userCount}</span>
          </div>
        </div>

        <div className="usr-stat-card border-orange">
          <div className="usr-stat-icon-bg bg-purple">
            <span className="usr-stat-icon">👑</span>
          </div>
          <div className="usr-stat-content">
            <span className="usr-stat-label">Quản trị viên</span>
            <span className="usr-stat-value">{adminCount}</span>
          </div>
        </div>

        <div className="usr-stat-card border-purple">
          <div className="usr-stat-icon-bg bg-red">
            <span className="usr-stat-icon">🔒</span>
          </div>
          <div className="usr-stat-content">
            <span className="usr-stat-label">Bị khóa</span>
            <span className="usr-stat-value">{lockedCount}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace Layout */}
      <div className="usr-workspace-layout">
        
        {/* LEFT COLUMN: Users Directory */}
        <div className="usr-left-panel">
          <div className="panel-header-flex">
            <h3 className="panel-title">Danh sách người dùng</h3>
          </div>

          {/* Search and Filters Bar */}
          <div className="search-filter-row">
            <div className="usr-search-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-dropdown-wrapper">
              <button 
                type="button" 
                className="filter-toggle-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <span>⚙️ Bộ lọc</span>
              </button>

              {showFilterDropdown && (
                <div className="filter-dropdown-menu">
                  <div 
                    className={`filter-item ${statusFilter === "all" ? "active" : ""}`}
                    onClick={() => { setStatusFilter("all"); setShowFilterDropdown(false); }}
                  >
                    Tất cả trạng thái
                  </div>
                  <div 
                    className={`filter-item ${statusFilter === "active" ? "active" : ""}`}
                    onClick={() => { setStatusFilter("active"); setShowFilterDropdown(false); }}
                  >
                    Hoạt động
                  </div>
                  <div 
                    className={`filter-item ${statusFilter === "locked" ? "active" : ""}`}
                    onClick={() => { setStatusFilter("locked"); setShowFilterDropdown(false); }}
                  >
                    Đã khóa
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Users Directory List */}
          <div className="users-directory-list">
            {filteredUsers.length === 0 ? (
              <div className="empty-search-state">Không tìm thấy người dùng nào phù hợp.</div>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className={`user-directory-card ${selectedUserId === user.id ? "selected" : ""}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="user-avatar-circle">
                    {user.fullname ? user.fullname[0].toUpperCase() : (user.username ? user.username[0].toUpperCase() : "?")}
                  </div>
                  
                  <div className="user-card-summary">
                    <div className="card-top-row">
                      <span className="user-card-name">{user.fullname || user.username}</span>
                      <span className={`status-badge ${user.status === "Hoạt động" ? "active" : "locked"}`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="card-email-row">{user.email}</div>
                    <div className="card-date-row">Tham gia: {user.created_at || ""}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected User Profile Inspector */}
        <div className="usr-right-panel">
          {activeUser ? (
            <div className="user-inspector-wrapper">
              
              {/* INSPECTOR TOP: Detail Card */}
              <div className="inspector-card-header">
                <div className="inspector-avatar-large">
                  {activeUser.fullname ? activeUser.fullname[0].toUpperCase() : (activeUser.username ? activeUser.username[0].toUpperCase() : "?")}
                </div>

                <div className="inspector-profile-title">
                  <div className="profile-name-flex" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                    <h3 className="profile-name" style={{ margin: 0 }}>{activeUser.fullname || activeUser.username}</h3>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Tên đăng nhập: <strong>{activeUser.username}</strong></span>
                      <span className={`status-badge ${activeUser.role === "admin" ? "active" : ""}`} style={{ background: activeUser.role === "admin" ? "#fef3c7" : "#e2e8f0", color: activeUser.role === "admin" ? "#d97706" : "#475569" }}>
                        {activeUser.role === "admin" ? "Quản trị viên" : "Học viên"}
                      </span>
                      <span className={`status-badge ${activeUser.status === "Hoạt động" ? "active" : "locked"}`}>
                        {activeUser.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Bio Info Grid */}
                  <div className="profile-bio-grid">
                    <div className="bio-item">
                      <span className="bio-icon">✉️</span>
                      <span className="bio-text">{activeUser.email}</span>
                    </div>
                    <div className="bio-item">
                      <span className="bio-icon">📞</span>
                      <span className="bio-text">{activeUser.phone || "Chưa cập nhật"}</span>
                    </div>
                    <div className="bio-item">
                      <span className="bio-icon">📅</span>
                      <span className="bio-text">Ngày sinh: {activeUser.birthdate || "Chưa cập nhật"}</span>
                    </div>
                    <div className="bio-item">
                      <span className="bio-icon">👤</span>
                      <span className="bio-text">Giới tính: {activeUser.gender || "Chưa cập nhật"}</span>
                    </div>
                    <div className="bio-item">
                      <span className="bio-icon">⏰</span>
                      <span className="bio-text">Tham gia: {activeUser.created_at ? activeUser.created_at.split(" ")[0] : ""}</span>
                    </div>
                    <div className="bio-item col-span-2">
                      <span className="bio-icon">📍</span>
                      <span className="bio-text">Địa chỉ: {activeUser.address || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>

                {/* Left Sidebar Action Commands */}
                <div className="inspector-action-menu">
                  {activeUser.status === "Hoạt động" ? (
                    <button 
                      type="button" 
                      className="cmd-btn btn-lock"
                      onClick={() => handleLockAccount(activeUser.id)}
                    >
                      <span className="cmd-icon">🔒</span> Khóa tài khoản
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="cmd-btn btn-unlock"
                      onClick={() => handleUnlockAccount(activeUser.id)}
                    >
                      <span className="cmd-icon">🔓</span> Mở khóa tài khoản
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="cmd-btn"
                    onClick={handleGrantFreeCourse}
                  >
                    <span className="cmd-icon">🎓</span> Cấp khóa học miễn phí
                  </button>
                  {activeUser.contest_banned ? (
                    <button 
                      type="button" 
                      className="cmd-btn btn-unlock"
                      onClick={() => handleToggleContestBan(activeUser.id)}
                    >
                      <span className="cmd-icon">🔓</span> Bỏ cấm thi đấu
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="cmd-btn btn-lock"
                      onClick={() => handleToggleContestBan(activeUser.id)}
                    >
                      <span className="cmd-icon">🚫</span> Cấm tham gia cuộc thi
                    </button>
                  )}
                </div>
              </div>

              {/* INSPECTOR BOTTOM: Sub-panels Grid */}
              <div className="inspector-subpanels-grid">
                
                {/* Panel 1: Bought Courses */}
                <div className="subpanel-card">
                  <div className="subpanel-header">
                    <h4 className="subpanel-title">Khóa học đã mua</h4>
                    <span className="subpanel-link-all">Xem tất cả</span>
                  </div>
                  <div className="subpanel-body-list">
                    {activeUser.courses && activeUser.courses.slice(0, 5).map((course, idx) => (
                      <div className="subpanel-item" key={idx}>
                        <div className="item-thumbnail-placeholder">{course.image}</div>
                        <div className="item-details">
                          <span className="item-title">{course.name}</span>
                          <span className="item-sub">Ngày mua: {course.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 2: Entered Contests */}
                <div className="subpanel-card">
                  <div className="subpanel-header">
                    <h4 className="subpanel-title">Cuộc thi đã tham gia</h4>
                    <span className="subpanel-link-all">Xem tất cả</span>
                  </div>
                  <div className="subpanel-body-list">
                    {!activeUser.contests || activeUser.contests.length === 0 ? (
                      <div className="empty-subpanel-state">Chưa tham gia cuộc thi nào.</div>
                    ) : (
                      activeUser.contests.slice(0, 5).map((contest, idx) => (
                        <div className="subpanel-item" key={idx}>
                          <div className="item-thumbnail-placeholder type-contest">🏆</div>
                          <div className="item-details">
                            <span className="item-title">{contest.name}</span>
                            <span className="item-sub">Tham gia: {contest.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Panel 3: Reviews Written */}
                <div className="subpanel-card">
                  <div className="subpanel-header">
                    <h4 className="subpanel-title">Đánh giá đã viết</h4>
                    <span className="subpanel-link-all">Xem tất cả</span>
                  </div>
                  <div className="subpanel-body-list">
                    {!activeUser.reviews || activeUser.reviews.length === 0 ? (
                      <div className="empty-subpanel-state">Chưa đăng đánh giá nào.</div>
                    ) : (
                      activeUser.reviews.slice(0, 5).map((rev, idx) => (
                        <div className="subpanel-item type-review" key={idx}>
                          <div className="item-details">
                            <span className="item-title">{rev.course}</span>
                            <div className="stars-row">
                              {Array.from({ length: 5 }).map((_, starIdx) => (
                                <span 
                                  key={starIdx} 
                                  className={`star-char ${starIdx < rev.stars ? "star-filled" : "star-empty"}`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="review-date-label">{rev.date}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
              
            </div>
          ) : (
            <div className="no-user-selected-state">
              Vui lòng chọn một học viên ở cột danh sách bên trái để xem thông tin chi tiết.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
