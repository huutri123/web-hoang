const BASE_URL = "http://localhost:8000/api/dashboard";

/**
 * Lấy dữ liệu thống kê Dashboard từ CSDL Backend
 */
export const getDashboardData = async () => {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Không thể tải dữ liệu Dashboard từ Database");
  }
  return response.json();
};
