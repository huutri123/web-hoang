const API_BASE_URL = 'http://localhost:8000/api/cart';

/**
 * Lấy danh sách giỏ hàng từ Backend
 */
export async function getCart(email) {
  if (!email) return [];
  try {
    const res = await fetch(`${API_BASE_URL}?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error(`Lỗi HTTP: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Lỗi getCart:", err);
    return [];
  }
}

/**
 * Thêm khóa học vào giỏ hàng
 */
export async function addToCart(email, courseId) {
  if (!email || !courseId) return { error: "Thiếu thông tin người dùng hoặc khóa học" };
  try {
    const res = await fetch(`${API_BASE_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, course_id: courseId })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || `Lỗi HTTP: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Phát sự kiện toàn cục để thông báo cho Navbar cập nhật số lượng
    window.dispatchEvent(new Event('cartUpdated'));
    
    return data;
  } catch (err) {
    console.error("Lỗi addToCart:", err);
    return { error: err.message };
  }
}

/**
 * Xóa khóa học khỏi giỏ hàng
 */
export async function removeFromCart(email, courseId) {
  if (!email || !courseId) return { error: "Thiếu thông tin để xóa" };
  try {
    const res = await fetch(
      `${API_BASE_URL}/remove?email=${encodeURIComponent(email)}&course_id=${courseId}`,
      { method: 'DELETE' }
    );
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || `Lỗi HTTP: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Phát sự kiện toàn cục để thông báo cho Navbar cập nhật số lượng
    window.dispatchEvent(new Event('cartUpdated'));
    
    return data;
  } catch (err) {
    console.error("Lỗi removeFromCart:", err);
    return { error: err.message };
  }
}

/**
 * Dọn sạch giỏ hàng khi thanh toán thành công
 */
export async function clearCart(email) {
  if (!email) return { error: "Thiếu email để dọn giỏ hàng" };
  try {
    const res = await fetch(`${API_BASE_URL}/clear?email=${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || `Lỗi HTTP: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Phát sự kiện toàn cục để thông báo cho Navbar cập nhật số lượng
    window.dispatchEvent(new Event('cartUpdated'));
    
    return data;
  } catch (err) {
    console.error("Lỗi clearCart:", err);
    return { error: err.message };
  }
}
