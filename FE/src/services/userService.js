const API_BASE = "http://localhost:8000/api/users";

// ==========================================
// Lấy danh sách tất cả học viên
// ==========================================
export async function getUsers() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Lỗi kết nối server khi lấy danh sách người dùng!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Cập nhật trạng thái (Khóa / Mở khóa)
// ==========================================
export async function updateUserStatus(id, status) {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Lỗi kết nối server khi cập nhật trạng thái!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Cập nhật cấm / bỏ cấm thi đấu cuộc thi
// ==========================================
export async function updateUserContestBan(id, isBanned) {
  const res = await fetch(`${API_BASE}/${id}/contest-ban`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contest_banned: isBanned })
  });
  if (!res.ok) throw new Error("Lỗi kết nối server khi cập nhật cấm thi đấu!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}
