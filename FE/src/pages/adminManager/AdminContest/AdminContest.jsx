import React, { useState, useEffect } from "react";
import "./AdminContest.css";
import CreatContest from "./CreatContest/CreatContest";
import { getContests, deleteContest } from "../../../services/contestService";

// Map trạng thái → CSS class
const STATUS_CLASS = {
  "Đang diễn ra": "status-active",
  "Đã kết thúc":  "status-ended",
  "Sắp diễn ra":  "status-upcoming",
};

export default function AdminContest() {
  const [contests, setContests]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [showCreateView, setShowCreateView] = useState(false);
  const [editContestId, setEditContestId]   = useState(null);

  // Bộ lọc
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTopic, setSelectedTopic]   = useState("all");

  // Checkbox
  const [selectedRows, setSelectedRows]   = useState([]);

  // Pagination
  const [pageSize, setPageSize]           = useState(10);
  const [currentPage, setCurrentPage]     = useState(1);

  // ── Tải dữ liệu từ DB ──────────────────────────────────
  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const data = await getContests();
      setContests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showCreateView || editContestId !== null) {
    return (
      <CreatContest 
        editId={editContestId} 
        onCancel={() => { 
          setShowCreateView(false); 
          setEditContestId(null); 
          fetchContests(); 
        }} 
      />
    );
  }

  // ── Xử lý xóa ──────────────────────────────────────────
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa cuộc thi "${title}" không?`)) return;
    try {
      await deleteContest(id);
      setContests(prev => prev.filter(c => c.id !== id));
      alert("Xóa cuộc thi thành công!");
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  // ── Checkbox ────────────────────────────────────────────
  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? filtered.map(c => c.id) : []);
  };
  const handleSelectRow = (id, checked) => {
    setSelectedRows(prev => checked ? [...prev, id] : prev.filter(r => r !== id));
  };

  // ── Lọc dữ liệu ────────────────────────────────────────
  const filtered = contests.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.topic && c.topic.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = selectedStatus === "all" || c.status === selectedStatus;
    const matchTopic  = selectedTopic  === "all" || c.topic === selectedTopic;
    return matchSearch && matchStatus && matchTopic;
  });

  // Danh sách chủ đề duy nhất từ dữ liệu thực
  const topicOptions = [...new Set(contests.map(c => c.topic).filter(Boolean))];

  // ── Thống kê ────────────────────────────────────────────
  const totalContests   = contests.length;
  const totalCandidates = contests.reduce((sum, c) => sum + (c.participants || 0), 0);
  const activeCount     = contests.filter(c => c.status === "Đang diễn ra").length;
  const endedCount      = contests.filter(c => c.status === "Đã kết thúc").length;

  // ── Pagination ──────────────────────────────────────────
  const totalPages  = Math.ceil(filtered.length / pageSize) || 1;
  const paginated   = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="act-container">
      {/* Header */}
      <div className="act-header-section">
        <h2 className="act-title">Quản lý cuộc thi</h2>
        <button className="act-create-btn" onClick={() => setShowCreateView(true)}>
          + Thêm cuộc thi
        </button>
      </div>

      {/* Stats cards */}
      <div className="act-stats-grid">
        <div className="act-stat-card border-green">
          <div className="act-stat-icon-bg bg-purple"><span className="act-stat-icon">🏆</span></div>
          <div className="act-stat-content">
            <span className="act-stat-label">Tổng cuộc thi</span>
            <span className="act-stat-value">{totalContests}</span>
          </div>
        </div>
        <div className="act-stat-card border-pink">
          <div className="act-stat-icon-bg bg-green"><span className="act-stat-icon">👥</span></div>
          <div className="act-stat-content">
            <span className="act-stat-label">Tổng thí sinh</span>
            <span className="act-stat-value">{totalCandidates.toLocaleString("vi-VN")}</span>
          </div>
        </div>
        <div className="act-stat-card border-orange">
          <div className="act-stat-icon-bg bg-orange"><span className="act-stat-icon">📅</span></div>
          <div className="act-stat-content">
            <span className="act-stat-label">Đang diễn ra</span>
            <span className="act-stat-value">{activeCount}</span>
          </div>
        </div>
        <div className="act-stat-card border-purple">
          <div className="act-stat-icon-bg bg-pink"><span className="act-stat-icon">🚩</span></div>
          <div className="act-stat-content">
            <span className="act-stat-label">Đã kết thúc</span>
            <span className="act-stat-value">{endedCount}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="act-filter-box">
        <div className="act-search-wrapper">
          <svg className="act-search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm cuộc thi..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="act-dropdowns-group">
          <div className="act-select-wrapper">
            <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang diễn ra">Đang diễn ra</option>
              <option value="Sắp diễn ra">Sắp diễn ra</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>

          <div className="act-select-wrapper">
            <select value={selectedTopic} onChange={(e) => { setSelectedTopic(e.target.value); setCurrentPage(1); }}>
              <option value="all">Tất cả chủ đề</option>
              {topicOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="act-table-wrapper">
        <table className="act-table">
          <thead>
            <tr>
              <th width="40">
                <input
                  type="checkbox"
                  className="act-checkbox"
                  onChange={handleSelectAll}
                  checked={paginated.length > 0 && paginated.every(c => selectedRows.includes(c.id))}
                />
              </th>
              <th width="40" className="text-center">#</th>
              <th>CUỘC THI</th>
              <th>CHỦ ĐỀ</th>
              <th>THỜI GIAN</th>
              <th>THÍ SINH</th>
              <th>GIẢI THƯỞNG</th>
              <th>TRẠNG THÁI</th>
              <th className="text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center" style={{ padding: "40px", color: "#64748b" }}>
                  Đang tải dữ liệu từ máy chủ...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" className="text-center" style={{ padding: "40px", color: "#ef4444" }}>
                  Lỗi: {error}
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center" style={{ padding: "40px", color: "#64748b" }}>
                  Không tìm thấy cuộc thi nào phù hợp.
                </td>
              </tr>
            ) : (
              paginated.map((contest, idx) => (
                <tr key={contest.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="act-checkbox"
                      checked={selectedRows.includes(contest.id)}
                      onChange={(e) => handleSelectRow(contest.id, e.target.checked)}
                    />
                  </td>
                  <td className="text-center act-row-index">{(currentPage - 1) * pageSize + idx + 1}</td>

                  {/* Cuộc thi */}
                  <td>
                    <div className="act-contest-info">
                      <div className="act-contest-icon-placeholder">
                        {contest.image
                          ? <img src={contest.image} alt={contest.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                          : "🏆"}
                      </div>
                      <div className="act-contest-texts">
                        <div className="act-contest-title">{contest.title}</div>
                        {contest.short_desc && (
                          <div className="act-contest-subtitle">{contest.short_desc}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Chủ đề */}
                  <td>
                    {contest.topic
                      ? <span className="act-tag">{contest.topic}</span>
                      : <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>

                  {/* Thời gian */}
                  <td>
                    <div className="act-time-cell">
                      <div className="time-start">{contest.start_time}</div>
                      <div className="time-divider">Đến: {contest.end_time}</div>
                    </div>
                  </td>

                  {/* Thí sinh */}
                  <td className="act-candidates-cell">
                    {(contest.participants || 0).toLocaleString("vi-VN")}
                  </td>

                  {/* Giải thưởng */}
                  <td>
                    <div className="act-prize-cell">
                      {contest.prize_1
                        ? <div className="prize-amount">{contest.prize_1}</div>
                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td>
                    <span className={`act-status-pill ${STATUS_CLASS[contest.status] || "status-ended"}`}>
                      {contest.status}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td>
                    <div className="act-actions-group">
                      <button 
                        className="act-action-icon-btn btn-edit" 
                        title="Chỉnh sửa"
                        onClick={() => setEditContestId(contest.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button
                        className="act-action-icon-btn btn-delete"
                        title="Xóa"
                        onClick={() => handleDelete(contest.id, contest.title)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="act-footer-pagination">
        <div className="act-page-size-selector">
          <span>Hiển thị</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>kết quả</span>
        </div>

        <div className="act-pagination-controls">
          <span className="act-pagination-info">Trang {currentPage} / {totalPages}</span>
          <div className="act-page-buttons">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`act-page-btn ${p === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
