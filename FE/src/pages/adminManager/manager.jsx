import React, { useState } from "react";
import "./manager.css";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import AdminCourse from "./AdminCourse/AdminCourse";
import AdminContest from "./AdminContest/AdminContest";
import CreatContest from "./AdminContest/CreatContest/CreatContest";
import AdminUsers from "./AdminUsers/AdminUsers";
import AdminVoucher from "./AdminVoucher/AdminVoucher";
import CreatVoucher from "./AdminVoucher/CreatVoucher/CreatVoucher";

export default function AdminManager() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [openSubmenus, setOpenSubmenus] = useState({
    courses: true,
    contests: false,
    vouchers: false,
  });

  // Sidebar Menu Configuration
  const menuGroups = [
    {
      groupName: "QUẢN LÝ NỘI DUNG",
      items: [
        { id: "courses", label: "Quản lý khóa học", icon: "📘", hasSubmenu: true },
        { id: "contests", label: "Quản lý cuộc thi", icon: "🏆", hasSubmenu: true },
        { id: "vouchers", label: "Quản lý Voucher", icon: "🎟️", hasSubmenu: true },
      ]
    },
    {
      groupName: "QUẢN LÝ NGƯỜI DÙNG",
      items: [
        { id: "users", label: "Người dùng", icon: "👥" },
      ]
    }
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            <header className="admin-header">
              <div className="header-left">
                <h2>Dashboard</h2>
                <p className="welcome-text">Xin chào, Admin Nguyễn Hoàng 👋</p>
              </div>
            </header>
            <AdminDashboard />
          </>
        );
      case "courses":
        return <AdminCourse key="courses-list" initialCreateView={false} />;
      case "courses-create":
        return <AdminCourse key="courses-create" initialCreateView={true} />;
      case "contests":
        return <AdminContest />;
      case "contests-create":
        return <CreatContest onCancel={() => setActiveMenu("contests")} />;
      case "users":
        return <AdminUsers />;
      case "vouchers":
        return <AdminVoucher onAddClick={() => setActiveMenu("vouchers-create")} />;
      case "vouchers-create":
        return <CreatVoucher onCancel={() => setActiveMenu("vouchers")} />;

      default:
        return (
          <div style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px", color: "var(--admin-text-primary)" }}>
              Tính năng đang phát triển
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Trang quản lý cho chức năng này đang được thiết kế. Cảm ơn bạn!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar Panel */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">EduPro Admin</span>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard item */}
          <div 
            className={`nav-item ${activeMenu === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveMenu("dashboard")}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </div>

          {menuGroups.map((group, groupIdx) => (
            <div className="nav-group" key={groupIdx}>
              <h3 className="nav-group-title">{group.groupName}</h3>
              {group.items.map((item) => {
                const isCoursesActive = item.id === "courses" && (activeMenu === "courses" || activeMenu === "courses-create");
                const isContestsActive = item.id === "contests" && (activeMenu === "contests" || activeMenu === "contests-create");
                const isVouchersActive = item.id === "vouchers" && (activeMenu === "vouchers" || activeMenu === "vouchers-create");
                const isItemActive = activeMenu === item.id || isCoursesActive || isContestsActive || isVouchersActive;
                return (
                  <div key={item.id} className="nav-item-wrapper">
                    <div 
                      className={`nav-item ${isItemActive ? "active" : ""}`}
                      onClick={() => {
                        if (item.hasSubmenu) {
                          setOpenSubmenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                          setActiveMenu(item.id);
                        } else {
                          setActiveMenu(item.id);
                        }
                      }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {item.hasSubmenu && (
                        <span className={`nav-arrow ${openSubmenus[item.id] ? "open" : ""}`}>v</span>
                      )}
                    </div>

                    {item.hasSubmenu && openSubmenus[item.id] && (
                      <div className="nav-submenu">
                        {item.id === "courses" && (
                          <div 
                            className={`nav-subitem ${activeMenu === "courses-create" ? "active" : ""}`}
                            onClick={() => setActiveMenu("courses-create")}
                          >
                            Thêm khóa học mới
                          </div>
                        )}
                        {item.id === "contests" && (
                          <div 
                            className={`nav-subitem ${activeMenu === "contests-create" ? "active" : ""}`}
                            onClick={() => setActiveMenu("contests-create")}
                          >
                            Thêm cuộc thi mới
                          </div>
                        )}
                        {item.id === "vouchers" && (
                          <div 
                            className={`nav-subitem ${activeMenu === "vouchers-create" ? "active" : ""}`}
                            onClick={() => setActiveMenu("vouchers-create")}
                          >
                            Thêm voucher mới
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

      </aside>

      {/* Main Administrative Area */}
      <main className="admin-content">
        {renderContent()}
      </main>
    </div>
  );
}
