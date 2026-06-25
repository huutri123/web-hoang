const API_BASE = "http://localhost:8000/api/contests";

// ==========================================
// Lấy danh sách tất cả cuộc thi
// Trạng thái (Sắp / Đang / Đã kết thúc) được tính tự động từ BE
// ==========================================
export async function getContests() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Lỗi kết nối server khi lấy danh sách cuộc thi!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Lấy chi tiết một cuộc thi theo ID
// ==========================================
export async function getContestById(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Lỗi kết nối server khi lấy chi tiết cuộc thi!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Tạo cuộc thi mới
// payload: { title, short_desc, description, image, topic,
//            start_time, end_time, duration, level,
//            prize_1, prize_2, prize_3 }
// ==========================================
export async function createContest(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Lỗi kết nối server khi tạo cuộc thi!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Cập nhật cuộc thi theo ID
// payload: các trường cần cập nhật (partial update)
// ==========================================
export async function updateContest(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Lỗi kết nối server khi cập nhật cuộc thi!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Xóa cuộc thi theo ID
// ==========================================
export async function deleteContest(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Lỗi kết nối server khi xóa cuộc thi!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Hàm tiện ích: tính trạng thái cuộc thi ở FE
// (dự phòng khi cần tính offline, BE đã tự tính sẵn)
// ==========================================
export function computeContestStatus(start_time, end_time) {
  const now = new Date();
  const start = new Date(start_time);
  const end = new Date(end_time);
  if (now < start) return { label: "Sắp diễn ra", cls: "status-upcoming" };
  if (now > end)   return { label: "Đã kết thúc",  cls: "status-ended" };
  return { label: "Đang diễn ra", cls: "status-active" };
}

// ==========================================
// Nộp bài thi trắc nghiệm
// payload: { email, answers: { [questionId]: optionIndex } }
// ==========================================
export async function submitContest(contestId, payload) {
  const res = await fetch(`${API_BASE}/${contestId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Lỗi kết nối server khi nộp bài thi!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Lấy kết quả bài thi gần nhất của học viên
// ==========================================
export async function getContestResult(contestId, email) {
  const res = await fetch(`${API_BASE}/${contestId}/result?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Lỗi kết nối server khi lấy kết quả thi!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Lấy bảng xếp hạng của cuộc thi
// ==========================================
export async function getContestLeaderboard(contestId) {
  const res = await fetch(`${API_BASE}/${contestId}/leaderboard`);
  if (!res.ok) throw new Error("Lỗi kết nối server khi lấy bảng xếp hạng cuộc thi!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Lấy bảng xếp hạng tổng hợp (toàn hệ thống)
// period: 'week' / 'month' / 'all'
// ==========================================
export async function getGlobalLeaderboard(period = "all") {
  const res = await fetch(`${API_BASE}/global-leaderboard?period=${period}`);
  if (!res.ok) throw new Error("Lỗi kết nối server khi lấy bảng xếp hạng tổng hợp!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

