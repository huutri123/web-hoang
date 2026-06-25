const API_BASE = "http://localhost:8000/api/vouchers";

// ==========================================
// Lấy danh sách tất cả voucher
// ==========================================
export async function getVouchers() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Lỗi kết nối server khi lấy danh sách voucher!");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Tạo voucher mới
// ==========================================
export async function createVoucher(voucherData) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voucherData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Lỗi kết nối server khi tạo voucher!");
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Xóa voucher
// ==========================================
export async function deleteVoucher(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Lỗi kết nối server khi xóa voucher!");
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Áp dụng voucher khi thanh toán
// ==========================================
export async function applyVoucher(code, email) {
  const res = await fetch(`${API_BASE}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, email })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Mã giảm giá không hợp lệ!");
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ==========================================
// Ghi nhận sử dụng voucher
// ==========================================
export async function recordVoucherUse(code) {
  const res = await fetch(`${API_BASE}/use/${code}`, {
    method: "POST"
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Lỗi ghi nhận sử dụng voucher!");
  }
  return await res.json();
}

