import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { getDashboardData } from "../../../services/dashboardService";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        if (isMounted) {
          setDashboardData(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Không thể lấy dữ liệu thống kê!");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu thống kê từ CSDL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <span className="error-icon">⚠️</span>
        <p>Lỗi: {error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Tải lại trang</button>
      </div>
    );
  }

  const { stats, revenueChart, bestSellingCourses } = dashboardData || { stats: [], revenueChart: [], bestSellingCourses: [] };

  // Helper to draw SVG path for Line Chart
  const generateLinePath = (data, width, height, padding) => {
    if (!data || data.length === 0) return "";
    const xStep = (width - padding * 2) / (data.length - 1);
    const maxVal = 100; // max value of revenue data points (0-100M scale)
    const points = data.map((item, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (item.value / maxVal) * (height - padding * 2);
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cpX1 = points[i - 1].x + xStep / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i].x - xStep / 2;
      const cpY2 = points[i].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  // Helper to draw SVG area path under the line
  const generateAreaPath = (data, width, height, padding) => {
    if (!data || data.length === 0) return "";
    const xStep = (width - padding * 2) / (data.length - 1);
    const maxVal = 100;
    const points = data.map((item, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (item.value / maxVal) * (height - padding * 2);
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cpX1 = points[i - 1].x + xStep / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i].x - xStep / 2;
      const cpY2 = points[i].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    // Connect to bottom right, then bottom left to close the shape
    path += ` L ${points[points.length - 1].x} ${height - padding}`;
    path += ` L ${points[0].x} ${height - padding} Z`;
    return path;
  };

  // Render course image helper supporting both text/emoji and url path
  const renderCourseAvatar = (img) => {
    if (!img) return "📘";
    if (img.startsWith("/") || img.startsWith("http")) {
      return (
        <img 
          src={img} 
          alt="course" 
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} 
        />
      );
    }
    return img;
  };

  const chartWidth = 550;
  const chartHeight = 220;
  const chartPadding = 30;

  return (
    <div className="admin-dashboard-container">
      {/* Stats Grid */}
      <section className="admin-stats-grid">
        {stats.map((stat) => (
          <div className={`admin-stat-card card-${stat.id}`} key={stat.id}>
            <div className="admin-stat-header">
              <div className="admin-stat-icon-wrapper">{stat.icon}</div>
              <div className="admin-stat-info">
                <span className="admin-stat-title">{stat.title}</span>
                <h3 className="admin-stat-value">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        {/* Line Chart Card */}
        <div className="chart-card line-chart-card">
          <div className="chart-header">
            <h3>Doanh thu 7 ngày qua</h3>
            <select className="chart-filter" defaultValue="7days">
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
            </select>
          </div>
          <div className="chart-body">
            <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((gridVal, i) => {
                const y = chartPadding + ((100 - gridVal) / 100) * (chartHeight - chartPadding * 2);
                return (
                  <g key={i} className="chart-grid-line">
                    <line x1={chartPadding} y1={y} x2={chartWidth - chartPadding} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
                    <text x={chartPadding - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{gridVal}M</text>
                  </g>
                );
              })}

              {/* Gradient Area */}
              <path d={generateAreaPath(revenueChart, chartWidth, chartHeight, chartPadding)} fill="url(#chart-area-grad)" />

              {/* Smooth Chart Line */}
              <path d={generateLinePath(revenueChart, chartWidth, chartHeight, chartPadding)} fill="none" stroke="#3b82f6" strokeWidth="3" />

              {/* Data Points */}
              {revenueChart.map((item, idx) => {
                const xStep = (chartWidth - chartPadding * 2) / (revenueChart.length - 1);
                const x = chartPadding + idx * xStep;
                const y = chartHeight - chartPadding - (item.value / 100) * (chartHeight - chartPadding * 2);
                return (
                  <g key={idx} className="chart-point-group">
                    <circle cx={x} cy={y} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                    <text x={x} y={chartHeight - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">{item.date}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Best Sellers Card */}
        <div className="chart-card best-sellers-card">
          <div className="chart-header">
            <h3>Khóa học bán chạy</h3>
            <button className="view-all-btn">Xem tất cả →</button>
          </div>
          <div className="chart-body">
            <ul className="best-sellers-list">
              {bestSellingCourses.map((course) => (
                <li className="list-item course-item" key={course.id}>
                  <div className="course-avatar-wrapper">{renderCourseAvatar(course.image)}</div>
                  <div className="course-main-info">
                    <h4 className="course-title-text">{course.title}</h4>
                    <span className="course-price-tag">{course.price}</span>
                  </div>
                  <span className="course-student-badge">{course.students}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

