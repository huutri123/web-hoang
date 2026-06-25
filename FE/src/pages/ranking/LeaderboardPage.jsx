import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { getGlobalLeaderboard, getContests } from '../../services/contestService';
import { useAuth } from '../../services/AuthContext';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // 'all' | 'top10' | 'sameSchool'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch global leaderboard
        const lb = await getGlobalLeaderboard("all");
        setLeaderboardData(lb);

        // Fetch contests
        const cts = await getContests();
        setContests(cts);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu bảng xếp hạng:", err);
        setError("Không thể kết nối đến server để tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderRankBadge = (rank) => {
    if (rank === 1) return <div className="rank-badge gold-badge">{rank}</div>;
    if (rank === 2) return <div className="rank-badge silver-badge">{rank}</div>;
    if (rank === 3) return <div className="rank-badge bronze-badge">{rank}</div>;
    return <div className="rank-badge normal-badge">{rank}</div>;
  };

  const renderShield = (type) => {
    const colors = {
      gold: '#F59E0B',
      silver: '#9CA3AF',
      bronze: '#D97706',
      blue: '#3B82F6',
      green: '#10B981',
      none: 'transparent'
    };
    if (type === 'none' || !type) return null;
    return (
      <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L0 4V13C0 20.35 5.12 27.23 12 28C18.88 27.23 24 20.35 24 13V4L12 0Z" fill={colors[type]} fillOpacity="0.15"/>
        <path d="M12 2.2L2 6V13C2 19.3 6.12 25 12 25.8C17.88 25 22 19.3 22 13V6L12 2.2Z" fill={colors[type]}/>
        <path d="M12 7L13.5 10.5L17 11L14.5 13.5L15 17L12 15L9 17L9.5 13.5L7 11L10.5 10.5L12 7Z" fill="white"/>
      </svg>
    );
  };

  // Find current user's school for the "Cùng khu vực" filter
  const myLeaderboardEntry = user ? leaderboardData.find(item => item.email === user.email) : null;
  const mySchool = myLeaderboardEntry?.school || null;

  // Process data: search and filter options
  let processedData = [...leaderboardData];

  // 1. Filter by Search Term
  if (searchTerm.trim() !== '') {
    processedData = processedData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // 2. Filter by Option
  if (filterOption === 'top10') {
    processedData = processedData.slice(0, 10);
  } else if (filterOption === 'sameSchool') {
    if (mySchool) {
      processedData = processedData.filter(item => item.school === mySchool);
    } else {
      // Fallback if not logged in or has no school
      processedData = [];
    }
  }

  // 3. Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <>
      <Navbar />
      <main className="lb-main-content">
        <div className="lb-container">
          
          {/* Breadcrumb */}
          <div className="lb-breadcrumb">
            <Link to="/" className="lb-breadcrumb-link">Trang chủ</Link>
            <span className="separator">›</span>
            <span className="current">Bảng xếp hạng</span>
          </div>

          {/* Page Title Section */}
          <div className="lb-page-title-sec">
            <div className="lb-title-left">
              <h1>Bảng xếp hạng cuộc thi 🏆</h1>
              <p>Xếp hạng tất cả thí sinh đang tham gia cuộc thi</p>
            </div>
            
            <div className="lb-header-right-col">
              {/* Stats Bar */}
              <div className="lb-title-stats-bar">
                <div className="lb-title-stat-item">
                  <span className="stat-bar-icon">👥</span>
                  <strong className="stat-bar-value">{leaderboardData.length}</strong>
                  <span className="stat-bar-label">Thí sinh</span>
                </div>
                <div className="lb-title-stat-item">
                  <span className="stat-bar-icon">🌐</span>
                  <strong className="stat-bar-value">{Math.max(1, Math.floor(leaderboardData.length * 0.4 + 2))}</strong>
                  <span className="stat-bar-label">Online</span>
                </div>
                <div className="lb-title-stat-item">
                  <span className="stat-bar-icon">🎁</span>
                  <strong className="stat-bar-value">{contests.length * 3}</strong>
                  <span className="stat-bar-label">Giải thưởng</span>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="lb-title-filter-bar">
                <div className="lb-filter-search-wrap">
                  <span className="search-icon">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Nhập tên thí sinh..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="lb-filter-search-input"
                  />
                </div>
                <div className="lb-filter-divider"></div>
                <select 
                  className="lb-filter-select"
                  value={filterOption}
                  onChange={(e) => {
                    setFilterOption(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Tất cả thí sinh</option>
                  <option value="top10">Top 10</option>
                  <option value="sameSchool">Cùng trường học</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Layout Grid: Left content, Right sidebar */}
          <div className="lb-page-layout-grid">
            
            {/* Left Column */}
            <div className="lb-left-column">
              {/* Table Section */}
              <div className="lb-table-wrapper">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
                    Đang tải bảng xếp hạng...
                  </div>
                ) : error ? (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: '#ef4444' }}>
                    {error}
                  </div>
                ) : currentItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
                    {filterOption === 'sameSchool' && !user 
                      ? 'Vui lòng đăng nhập để xem thí sinh cùng trường!' 
                      : 'Không tìm thấy thí sinh nào.'}
                  </div>
                ) : (
                  <>
                    <table className="lb-table">
                      <thead>
                        <tr>
                          <th>Hạng</th>
                          <th>Thí sinh</th>
                          <th>Trường / Đơn vị</th>
                          <th>Điểm số</th>
                          <th>Cuộc thi đã làm</th>
                          <th>Thời gian</th>
                          <th>Huy hiệu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map(row => (
                          <tr key={row.rank}>
                            <td className="col-rank">{renderRankBadge(row.rank)}</td>
                            <td className="col-user">
                              <div className="user-avatar-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                {row.avatar && row.avatar.startsWith('http') ? (
                                  <img src={row.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  row.avatar || '🧑‍🎓'
                                )}
                              </div>
                              <div className="user-info-text">
                                <strong>{row.name} {user && row.email === user.email && <span style={{ color: '#3b82f6', fontSize: '12px' }}>(Bạn)</span>}</strong>
                                <span className="level-badge">Level {row.level}</span>
                              </div>
                            </td>
                            <td className="col-school">{row.school}</td>
                            <td className="col-points">{row.points.toLocaleString()}</td>
                            <td className="col-solved">{row.solved}</td>
                            <td className="col-time">{row.time}</td>
                            <td className="col-badge">{renderShield(row.badge)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="lb-pagination">
                        <button 
                          className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                          <button 
                            key={num}
                            className={`page-btn ${currentPage === num ? 'active' : ''}`}
                            onClick={() => handlePageChange(num)}
                          >
                            {num}
                          </button>
                        ))}
                        <button 
                          className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Info Cards Bottom */}
              <div className="lb-info-grid">
                <div className="lb-info-card">
                  <div className="info-icon">⚙️</div>
                  <h4>Quy tắc xếp hạng</h4>
                  <ul>
                    <li>Điểm số càng cao, thứ hạng càng cao</li>
                    <li>Nếu bằng điểm, thí sinh nộp bài nhanh hơn sẽ xếp hạng cao hơn</li>
                    <li>Bảng xếp hạng tổng hợp dựa trên điểm cao nhất của các cuộc thi</li>
                  </ul>
                  <div className="info-bg-illus">📋</div>
                </div>
                <div className="lb-info-card">
                  <div className="info-icon">📊</div>
                  <h4>Cách tính điểm</h4>
                  <p className="subtitle">Mỗi cuộc thi được tính bằng tổng điểm cao nhất các bài thi</p>
                  <ul>
                    <li>Chỉ tính điểm khi hoàn thành đủ tất cả bài thi trong cuộc thi</li>
                    <li>Điểm thi sẽ cập nhật khi bạn đạt điểm số cao hơn</li>
                  </ul>
                  <div className="info-bg-illus">🧮</div>
                </div>
                <div className="lb-info-card">
                  <div className="info-icon">💎</div>
                  <h4>Huy hiệu</h4>
                  <ul>
                    <li>🏅 Top 1: Huy hiệu Vàng</li>
                    <li>🥈 Top 2 - 3: Huy hiệu Bạc / Đồng</li>
                    <li>💎 Top 7: Huy hiệu Kim cương</li>
                    <li>🔰 Top 9: Huy hiệu Ngọc lục bảo</li>
                  </ul>
                  <div className="info-bg-illus" style={{fontSize: '52px'}}>🏆</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
};

export default LeaderboardPage;
