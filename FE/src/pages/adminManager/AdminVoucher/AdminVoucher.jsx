import React, { useState, useEffect } from "react";
import "./AdminVoucher.css";
import { getVouchers, deleteVoucher } from "../../../services/voucherService";

export default function AdminVoucher({ onAddClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'expired'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  // Fetch vouchers from Backend
  const loadVouchers = async () => {
    try {
      setLoading(true);
      const data = await getVouchers();
      setVouchers(data);
      if (data.length > 0) {
        setSelectedVoucherId(data[0].id);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách voucher:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const activeVoucher = vouchers.find(v => v.id === selectedVoucherId) || vouchers[0];

  const handleDelete = async (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa voucher ${code} không?`)) {
      try {
        await deleteVoucher(id);
        alert(`Đã xóa voucher ${code} thành công!`);
        
        // Cập nhật lại danh sách và chọn voucher khác
        const updated = vouchers.filter(v => v.id !== id);
        setVouchers(updated);
        if (updated.length > 0) {
          setSelectedVoucherId(updated[0].id);
        } else {
          setSelectedVoucherId(null);
        }
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  };

  // Helper check status
  const getVoucherStatus = (v) => {
    if (v.status !== "Hoạt động") return v.status;
    const now = new Date();
    const end = new Date(v.end_date);
    if (now > end) return "Hết hạn";
    if (v.used_uses >= v.limit_uses) return "Hết lượt";
    return "Hoạt động";
  };

  // Search & filter logic
  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const vStatus = getVoucherStatus(v);
    if (statusFilter === "active") {
      return matchesSearch && vStatus === "Hoạt động";
    }
    if (statusFilter === "expired") {
      return matchesSearch && (vStatus === "Hết hạn" || vStatus === "Hết lượt" || vStatus === "Ngưng áp dụng");
    }
    return matchesSearch;
  });

  // Calculate statistics
  const totalCount = vouchers.length;
  const activeCount = vouchers.filter(v => getVoucherStatus(v) === "Hoạt động").length;
  const expiredCount = vouchers.filter(v => {
    const s = getVoucherStatus(v);
    return s === "Hết hạn" || s === "Hết lượt" || s === "Ngưng áp dụng";
  }).length;
  const totalUsedCount = vouchers.reduce((sum, v) => sum + (v.used_uses || 0), 0);

  if (loading) {
    return <div className="vch-container" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Đang tải danh sách voucher...</div>;
  }

  return (
    <div className="vch-container">
      {/* 4 Stats Cards */}
      <div className="vch-stats-grid">
        <div className="vch-stat-card border-blue">
          <div className="vch-stat-icon-bg bg-blue">
            <span className="vch-stat-icon">🎟️</span>
          </div>
          <div className="vch-stat-content">
            <span className="vch-stat-label">Tổng Voucher</span>
            <span className="vch-stat-value">{totalCount}</span>
          </div>
        </div>

        <div className="vch-stat-card border-green">
          <div className="vch-stat-icon-bg bg-green">
            <span className="vch-stat-icon">💚</span>
          </div>
          <div className="vch-stat-content">
            <span className="vch-stat-label">Đang hoạt động</span>
            <span className="vch-stat-value">{activeCount}</span>
          </div>
        </div>

        <div className="vch-stat-card border-orange">
          <div className="vch-stat-icon-bg bg-purple">
            <span className="vch-stat-icon">⌛</span>
          </div>
          <div className="vch-stat-content">
            <span className="vch-stat-label">Hết hạn / Hết lượt</span>
            <span className="vch-stat-value">{expiredCount}</span>
          </div>
        </div>

        <div className="vch-stat-card border-purple">
          <div className="vch-stat-icon-bg bg-red">
            <span className="vch-stat-icon">📊</span>
          </div>
          <div className="vch-stat-content">
            <span className="vch-stat-label">Tổng lượt đã dùng</span>
            <span className="vch-stat-value">{totalUsedCount}</span>
          </div>
        </div>
      </div>

      <div className="vch-layout-grid">
        {/* Left Column: List */}
        <div className="vch-list-panel">
          <div className="vch-panel-header">
            <h3>Danh sách Voucher</h3>
            <button className="vch-add-header-btn" onClick={onAddClick}>
              ➕ Thêm Voucher
            </button>
          </div>

          <div className="vch-search-bar-row">
            <div className="vch-search-input-wrapper">
              <span className="vch-search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="vch-filter-btn-wrapper">
              <button 
                className={`vch-filter-toggle-btn ${statusFilter !== "all" ? "active-filter" : ""}`}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                ⚙️ Bộ lọc
              </button>
              {showFilterDropdown && (
                <div className="vch-filter-dropdown-menu">
                  <div 
                    className={`vch-dropdown-item ${statusFilter === "all" ? "selected" : ""}`}
                    onClick={() => { setStatusFilter("all"); setShowFilterDropdown(false); }}
                  >
                    Tất cả voucher
                  </div>
                  <div 
                    className={`vch-dropdown-item ${statusFilter === "active" ? "selected" : ""}`}
                    onClick={() => { setStatusFilter("active"); setShowFilterDropdown(false); }}
                  >
                    Đang hoạt động
                  </div>
                  <div 
                    className={`vch-dropdown-item ${statusFilter === "expired" ? "selected" : ""}`}
                    onClick={() => { setStatusFilter("expired"); setShowFilterDropdown(false); }}
                  >
                    Hết hạn / Khóa
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="vch-list-items">
            {filteredVouchers.length === 0 ? (
              <div className="vch-empty-state">Không tìm thấy voucher phù hợp.</div>
            ) : (
              filteredVouchers.map(v => {
                const isSelected = selectedVoucherId === v.id;
                const vStatus = getVoucherStatus(v);
                return (
                  <div 
                    key={v.id} 
                    className={`vch-list-item-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedVoucherId(v.id)}
                  >
                    <div className="vch-item-avatar-circle">🎟️</div>
                    <div className="vch-item-summary">
                      <div className="vch-item-title-row">
                        <strong className="vch-item-code">{v.code}</strong>
                        <span className={`vch-status-badge ${vStatus === "Hoạt động" ? "status-active" : "status-locked"}`}>
                          {vStatus}
                        </span>
                      </div>
                      <div className="vch-item-subtitle">{v.name}</div>
                      <div className="vch-item-meta">
                        <span>Đã dùng: {v.used_uses}/{v.limit_uses} lượt</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="vch-detail-panel">
          {activeVoucher ? (
            <div className="vch-detail-card">
              <div className="vch-detail-header-card">
                <div className="vch-detail-avatar-large">🎟️</div>
                <div className="vch-detail-primary-info">
                  <h2>{activeVoucher.code}</h2>
                  <p className="vch-detail-username">{activeVoucher.name}</p>
                  <div className="vch-detail-badges">
                    <span className={`vch-status-badge ${getVoucherStatus(activeVoucher) === "Hoạt động" ? "status-active" : "status-locked"}`}>
                      {getVoucherStatus(activeVoucher)}
                    </span>
                  </div>
                </div>
                <div className="vch-detail-actions">
                  <button 
                    className="vch-action-btn btn-danger"
                    onClick={() => handleDelete(activeVoucher.id, activeVoucher.code)}
                  >
                    🗑️ Xóa Voucher
                  </button>
                </div>
              </div>

              <div className="vch-detail-body-info">
                <h3>Thông tin chi tiết</h3>
                <div className="vch-info-grid">
                  <div className="vch-info-row">
                    <span className="vch-info-label">🎟️ Mã voucher:</span>
                    <strong className="vch-info-value">{activeVoucher.code}</strong>
                  </div>
                  <div className="vch-info-row">
                    <span className="vch-info-label">📝 Tên voucher:</span>
                    <span className="vch-info-value">{activeVoucher.name}</span>
                  </div>
                  <div className="vch-info-row">
                    <span className="vch-info-label">⚡ Loại giảm giá:</span>
                    <span className="vch-info-value">
                      {activeVoucher.discount_type === "percent" ? "Giảm theo phần trăm (%)" : "Giảm tiền trực tiếp (đ)"}
                    </span>
                  </div>
                  <div className="vch-info-row">
                    <span className="vch-info-label">💰 Giá trị giảm:</span>
                    <strong className="vch-info-value color-blue">
                      {activeVoucher.discount_type === "percent" 
                        ? `${activeVoucher.discount_value}%` 
                        : `${activeVoucher.discount_value.toLocaleString()}đ`}
                    </strong>
                  </div>
                  <div className="vch-info-row">
                    <span className="vch-info-label">📊 Số lượt sử dụng:</span>
                    <span className="vch-info-value">
                      <strong>{activeVoucher.used_uses}</strong> / {activeVoucher.limit_uses} lượt
                    </span>
                  </div>
                  <div className="vch-info-row">
                    <span className="vch-info-label">📅 Ngày bắt đầu:</span>
                    <span className="vch-info-value">{activeVoucher.start_date}</span>
                  </div>
                  <div className="vch-info-row">
                    <span className="vch-info-label">⌛ Ngày kết thúc:</span>
                    <span className="vch-info-value">{activeVoucher.end_date}</span>
                  </div>
                  <div className="vch-info-row">
                    <span className="vch-info-label">⚙️ Trạng thái:</span>
                    <span className="vch-info-value">{activeVoucher.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="vch-no-selection">
              <span className="vch-no-selection-icon">🎟️</span>
              <p>Chọn một voucher từ danh sách để xem chi tiết.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
