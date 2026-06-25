import React, { useState } from "react";
import "./AdminVourcher.css";

export default function AdminVourcher() {
  // State for search and active voucher
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'running', 'expired'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Mock Vouchers Database
  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      code: "EDUPRO50",
      type: "percentage", // 'percentage' or 'fixed'
      value: 50,
      minSpend: 200000,
      usageLimit: 200,
      usageCount: 84,
      expiryDate: "2026-12-31",
      status: "Đang chạy",
      recentUsers: [
        { name: "Nguyễn Văn An", date: "20/05/2026", saving: "100.000đ", emoji: "👨‍💻" },
        { name: "Trần Thị Bình", date: "18/05/2026", saving: "120.000đ", emoji: "👩‍💼" },
        { name: "Lê Hoàng Nam", date: "15/05/2026", saving: "95.000đ", emoji: "👨‍🎨" }
      ]
    },
    {
      id: 2,
      code: "WELCOMENEW",
      type: "fixed",
      value: 50000,
      minSpend: 150000,
      usageLimit: 500,
      usageCount: 342,
      expiryDate: "2026-12-15",
      status: "Đang chạy",
      recentUsers: [
        { name: "Vũ Thị Mai", date: "21/05/2026", saving: "50.000đ", emoji: "👩‍💻" },
        { name: "Hoàng Quốc Bảo", date: "19/05/2026", saving: "50.000đ", emoji: "👨‍🚀" }
      ]
    },
    {
      id: 3,
      code: "SUMMER30",
      type: "percentage",
      value: 30,
      minSpend: 300000,
      usageLimit: 100,
      usageCount: 98,
      expiryDate: "2026-08-31",
      status: "Sắp hết",
      recentUsers: [
        { name: "Đỗ Thu Hương", date: "20/05/2026", saving: "90.000đ", emoji: "👩‍⚕️" }
      ]
    },
    {
      id: 4,
      code: "DIRECT100K",
      type: "fixed",
      value: 100000,
      minSpend: 500000,
      usageLimit: 50,
      usageCount: 12,
      expiryDate: "2026-10-10",
      status: "Đang chạy",
      recentUsers: [
        { name: "Nguyễn Thanh Tùng", date: "14/05/2026", saving: "100.000đ", emoji: "👨‍⚖️" }
      ]
    },
    {
      id: 5,
      code: "EXPIRED99",
      type: "percentage",
      value: 15,
      minSpend: 100000,
      usageLimit: 100,
      usageCount: 100,
      expiryDate: "2026-05-01",
      status: "Hết hạn",
      recentUsers: []
    }
  ]);

  // Selected Voucher ID
  const [selectedVoucherId, setSelectedVoucherId] = useState(1);

  // Active Voucher detailed inspector
  const activeVoucher = vouchers.find(v => v.id === selectedVoucherId) || vouchers[0];

  // Form State for edit/create dialog
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minSpend: "",
    usageLimit: "",
    expiryDate: "",
    status: "Đang chạy"
  });

  // Toggle Voucher status
  const handleToggleStatus = (id) => {
    const v = vouchers.find(item => item.id === id);
    if (v) {
      const nextStatus = v.status === "Đang chạy" ? "Tạm dừng" : "Đang chạy";
      alert(nextStatus === "Tạm dừng" ? `Đã tạm dừng áp dụng mã ${v.code}` : `Đã kích hoạt hoạt động mã ${v.code}`);
      setVouchers(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
    }
  };

  // Delete Voucher
  const handleDeleteVoucher = (id) => {
    const v = vouchers.find(item => item.id === id);
    if (!v) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã voucher "${v.code}" không?`)) {
      setVouchers(prev => prev.filter(item => item.id !== id));
      alert(`Đã xóa thành công mã voucher ${v.code}`);
      setSelectedVoucherId(vouchers[0]?.id || null);
    }
  };

  // Open Form for Create
  const openCreateForm = () => {
    setIsEditMode(false);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minSpend: "",
      usageLimit: "",
      expiryDate: "",
      status: "Đang chạy"
    });
    setShowFormModal(true);
  };

  // Open Form for Edit
  const openEditForm = (voucher) => {
    setIsEditMode(true);
    setFormData({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minSpend: voucher.minSpend,
      usageLimit: voucher.usageLimit,
      expiryDate: voucher.expiryDate,
      status: voucher.status
    });
    setShowFormModal(true);
  };

  // Save/Submit Form data
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      alert("Vui lòng điền mã và giá trị giảm giá!");
      return;
    }

    const valueNum = Number(formData.value);
    const minSpendNum = Number(formData.minSpend) || 0;
    const limitNum = Number(formData.usageLimit) || 100;

    if (isEditMode) {
      setVouchers(prev => prev.map(v => v.id === activeVoucher.id ? {
        ...v,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: valueNum,
        minSpend: minSpendNum,
        usageLimit: limitNum,
        expiryDate: formData.expiryDate || "2026-12-31",
        status: formData.status
      } : v));
      alert("Cập nhật mã voucher thành công!");
    } else {
      const newVoucher = {
        id: Date.now(),
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: valueNum,
        minSpend: minSpendNum,
        usageLimit: limitNum,
        usageCount: 0,
        expiryDate: formData.expiryDate || "2026-12-31",
        status: "Đang chạy",
        recentUsers: []
      };
      setVouchers(prev => [newVoucher, ...prev]);
      setSelectedVoucherId(newVoucher.id);
      alert("Thêm mới mã voucher thành công!");
    }
    setShowFormModal(false);
  };

  // Filtered list computed
  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === "running") {
      return matchesSearch && (v.status === "Đang chạy" || v.status === "Sắp hết");
    }
    if (statusFilter === "expired") {
      return matchesSearch && (v.status === "Hết hạn" || v.status === "Tạm dừng");
    }
    return matchesSearch;
  });

  // Stats Counters
  const totalCount = vouchers.length;
  const activeCount = vouchers.filter(v => v.status === "Đang chạy" || v.status === "Sắp hết").length;
  const warningCount = vouchers.filter(v => v.status === "Sắp hết").length;
  const expiredCount = vouchers.filter(v => v.status === "Hết hạn" || v.status === "Tạm dừng").length;

  return (
    <div className="vch-container">
      {/* Top 4 Stats Cards */}
      <div className="vch-stats-grid">
        <div className="vch-stat-card border-green">
          <div className="vch-stat-icon-bg bg-blue">
            <span className="vch-stat-icon">🏷️</span>
          </div>
          <div className="vch-stat-content">
            <span className="vch-stat-label">Tổng mã Voucher</span>
            <span className="vch-stat-value">{totalCount}</span>
          </div>
        </div>

        <div className="vch-stat-card border-pink">
          <div className="vch-stat-icon-bg bg-green">
            <span className="vch-stat-icon">🟢</span>
          </div>
          <div className="vch-stat-content">
            <span className="vch-stat-label">Đang hoạt động</span>
            <span className="vch-stat-value">{activeCount}</span>
          </div>
        </div>

        <div className="vch-stat-card border-orange">
          <div className="vch-stat-icon-bg bg-purple">
            <span className="vch-stat-icon">⚠️</span>
          </div>
          <div className="vch-stat-content">
            <span className="vch-stat-label">Sắp hết lượt</span>
            <span className="vch-stat-value">{warningCount}</span>
          </div>
        </div>

        <div className="vch-stat-card border-purple">
          <div className="vch-stat-icon-bg bg-red">
            <span className="vch-stat-icon">🔒</span>
          </div>
          <div className="vch-stat-content">
            <span className="vch-stat-label">Tạm dừng / Hết hạn</span>
            <span className="vch-stat-value">{expiredCount}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="vch-workspace-layout">
        
        {/* LEFT COLUMN: Vouchers list */}
        <div className="vch-left-panel">
          <div className="panel-header-flex">
            <h3 className="panel-title">Danh sách voucher</h3>
            <button type="button" className="add-vch-btn" onClick={openCreateForm}>
              + Thêm mới
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="search-filter-row">
            <div className="vch-search-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm voucher..."
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
                    Tất cả
                  </div>
                  <div 
                    className={`filter-item ${statusFilter === "running" ? "active" : ""}`}
                    onClick={() => { setStatusFilter("running"); setShowFilterDropdown(false); }}
                  >
                    Đang hoạt động
                  </div>
                  <div 
                    className={`filter-item ${statusFilter === "expired" ? "active" : ""}`}
                    onClick={() => { setStatusFilter("expired"); setShowFilterDropdown(false); }}
                  >
                    Tạm dừng / Hết hạn
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vouchers Directory List */}
          <div className="vouchers-directory-list">
            {filteredVouchers.length === 0 ? (
              <div className="empty-search-state">Không tìm thấy mã voucher nào.</div>
            ) : (
              filteredVouchers.map((voucher) => (
                <div 
                  key={voucher.id} 
                  className={`voucher-directory-card ${selectedVoucherId === voucher.id ? "selected" : ""}`}
                  onClick={() => setSelectedVoucherId(voucher.id)}
                >
                  <div className="vch-avatar-circle">🎟️</div>
                  
                  <div className="voucher-card-summary">
                    <div className="card-top-row">
                      <span className="voucher-card-code">{voucher.code}</span>
                      <span className={`status-badge ${
                        voucher.status === "Đang chạy" ? "active" :
                        voucher.status === "Sắp hết" ? "warning" : "locked"
                      }`}>
                        {voucher.status}
                      </span>
                    </div>
                    <div className="card-desc-row">
                      {voucher.type === "percentage" ? `Giảm ${voucher.value}%` : `Giảm ${voucher.value.toLocaleString("vi-VN")}đ`}
                    </div>
                    <div className="card-date-row">Hạn: {new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Voucher Profile Inspector */}
        <div className="vch-right-panel">
          {activeVoucher ? (
            <div className="user-inspector-wrapper">
              
              {/* INSPECTOR TOP: Detail Card */}
              <div className="inspector-card-header">
                <div className="inspector-avatar-large">🎟️</div>

                <div className="inspector-profile-title">
                  <div className="profile-name-flex">
                    <h3 className="profile-name">{activeVoucher.code}</h3>
                    <span className={`status-badge ${
                      activeVoucher.status === "Đang chạy" ? "active" :
                      activeVoucher.status === "Sắp hết" ? "warning" : "locked"
                    }`}>
                      {activeVoucher.status}
                    </span>
                  </div>
                  
                  {/* Bio Info Grid */}
                  <div className="profile-bio-grid">
                    <div className="bio-item">
                      <span className="bio-icon">🏷️</span>
                      <span className="bio-text">
                        Mức giảm: {activeVoucher.type === "percentage" ? `${activeVoucher.value}%` : `${activeVoucher.value.toLocaleString("vi-VN")}đ`}
                      </span>
                    </div>
                    <div className="bio-item">
                      <span className="bio-icon">💰</span>
                      <span className="bio-text">
                        Đơn tối thiểu: {activeVoucher.minSpend === 0 ? "Không yêu cầu" : `${activeVoucher.minSpend.toLocaleString("vi-VN")}đ`}
                      </span>
                    </div>
                    <div className="bio-item">
                      <span className="bio-icon">📊</span>
                      <span className="bio-text">Loại mã: {activeVoucher.type === "percentage" ? "Phần trăm" : "Cố định"}</span>
                    </div>
                    <div className="bio-item">
                      <span className="bio-icon">👥</span>
                      <span className="bio-text">Đã dùng: {activeVoucher.usageCount} / {activeVoucher.usageLimit} lượt</span>
                    </div>
                    <div className="bio-item col-span-2">
                      <span className="bio-icon">📅</span>
                      <span className="bio-text">Ngày hết hạn: {new Date(activeVoucher.expiryDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </div>

                {/* Left Sidebar Action Commands */}
                <div className="inspector-action-menu">
                  <button 
                    type="button" 
                    className="cmd-btn"
                    onClick={() => openEditForm(activeVoucher)}
                  >
                    <span className="cmd-icon">✏️</span> Chỉnh sửa mã
                  </button>
                  {activeVoucher.status === "Đang chạy" || activeVoucher.status === "Sắp hết" ? (
                    <button 
                      type="button" 
                      className="cmd-btn btn-lock"
                      onClick={() => handleToggleStatus(activeVoucher.id)}
                    >
                      <span className="cmd-icon">🔒</span> Tạm dừng mã
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="cmd-btn btn-unlock"
                      onClick={() => handleToggleStatus(activeVoucher.id)}
                    >
                      <span className="cmd-icon">🔓</span> Kích hoạt mã
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="cmd-btn btn-lock"
                    onClick={() => handleDeleteVoucher(activeVoucher.id)}
                  >
                    <span className="cmd-icon">🗑️</span> Xóa Voucher
                  </button>
                </div>
              </div>

              {/* INSPECTOR BOTTOM: Sub-panels Grid for usage */}
              <div className="subpanel-card" style={{ height: "auto", minHeight: "260px" }}>
                <div className="subpanel-header">
                  <h4 className="subpanel-title">Học viên sử dụng gần đây</h4>
                  <span className="subpanel-link-all">Xem tất cả</span>
                </div>
                <div className="subpanel-body-list" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                  {activeVoucher.recentUsers && activeVoucher.recentUsers.length > 0 ? (
                    activeVoucher.recentUsers.map((user, idx) => (
                      <div className="subpanel-item" key={idx} style={{ border: "1px solid #f1f5f9", padding: "10px", borderRadius: "8px", background: "#f8fafc" }}>
                        <div className="item-thumbnail-placeholder" style={{ width: "36px", height: "36px", fontSize: "18px" }}>{user.emoji}</div>
                        <div className="item-details">
                          <span className="item-title" style={{ fontSize: "13px" }}>{user.name}</span>
                          <span className="item-sub" style={{ fontSize: "11px" }}>Sử dụng: {user.date}</span>
                        </div>
                        <span className="contest-rank-pill" style={{ background: "#eff6ff", color: "#1d4ed8" }}>-{user.saving}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-subpanel-state" style={{ gridColumn: "span 2", padding: "40px" }}>Chưa có lượt sử dụng nào gần đây.</div>
                  )}
                </div>
              </div>
              
            </div>
          ) : (
            <div className="no-user-selected-state">
              Vui lòng chọn một voucher ở danh sách bên trái để xem thông tin chi tiết.
            </div>
          )}
        </div>

      </div>

      {/* FORM DIALOG MODAL */}
      {showFormModal && (
        <div className="vch-modal-overlay">
          <div className="vch-modal-card">
            <h3 className="modal-title">{isEditMode ? "✏️ Chỉnh sửa mã voucher" : "➕ Thêm mã voucher mới"}</h3>
            <form onSubmit={handleSaveForm} className="modal-form">
              <div className="form-group">
                <label>Mã Voucher</label>
                <input 
                  type="text" 
                  name="code"
                  placeholder="Ví dụ: EDUPRO50"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                  className="input-code"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Loại giảm giá</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Tiền mặt (đ)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mức giảm giá</label>
                  <input 
                    type="number" 
                    name="value"
                    placeholder="Ví dụ: 30"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Đơn tối thiểu (đ)</label>
                  <input 
                    type="number" 
                    name="minSpend"
                    placeholder="Ví dụ: 150000"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({...formData, minSpend: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Giới hạn lượt dùng</label>
                  <input 
                    type="number" 
                    name="usageLimit"
                    placeholder="Ví dụ: 200"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Ngày hết hạn</label>
                  <input 
                    type="date" 
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>

                {isEditMode && (
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Đang chạy">Đang chạy</option>
                      <option value="Tạm dừng">Tạm dừng</option>
                      <option value="Hết hạn">Hết hạn</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="modal-save-btn">Lưu cấu hình</button>
                <button type="button" className="modal-cancel-btn" onClick={() => setShowFormModal(false)}>Hủy bỏ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
