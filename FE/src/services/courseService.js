const BASE_URL = "http://localhost:8000/api/courses";

/**
 * 1. Lấy toàn bộ danh sách khóa học từ Database
 */
export const getCourses = async () => {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Không thể tải danh sách khóa học");
  }
  return response.json();
};

/**
 * 2. Thêm mới một khóa học
 */
export const createCourse = async (courseData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Không thể tạo khóa học mới");
  }
  return response.json();
};

/**
 * 3. Cập nhật thông tin khóa học
 */
export const updateCourse = async (courseId, courseData) => {
  const response = await fetch(`${BASE_URL}/${courseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Không thể cập nhật khóa học");
  }
  return response.json();
};

/**
 * 4. Xóa một khóa học
 */
export const deleteCourse = async (courseId) => {
  const response = await fetch(`${BASE_URL}/${courseId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Không thể xóa khóa học");
  }
  return response.json();
};

/**
 * 5. Tải ảnh đại diện khóa học lên Backend
 */
export const uploadImage = async (file, type = "course") => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`http://localhost:8000/api/upload?type=${type}`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Không thể upload file ảnh");
  }
  return response.json();
};

/**
 * 6. Tải ảnh đại diện khóa học lên Backend kèm theo dõi tiến độ
 */
export const uploadImageWithProgress = (file, onProgress, type = "course") => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error("Lỗi đọc kết quả phản hồi từ server"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || "Không thể tải file lên server"));
        } catch (e) {
          reject(new Error(`Server trả về lỗi code: ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Lỗi kết nối mạng khi tải file lên"));
    });

    xhr.open("POST", `http://localhost:8000/api/upload?type=${type}`);
    xhr.send(formData);
  });
};

/**
 * 7. Lấy chi tiết khóa học bằng ID hoặc Slug
 */
export const getCourseDetail = async (identifier) => {
  const response = await fetch(`${BASE_URL}/${identifier}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Không thể tải thông tin chi tiết khóa học");
  }
  return response.json();
};

/**
 * 8. Gửi đánh giá khóa học của học viên
 * @param {number} courseId - ID khóa học
 * @param {{ email: string, rating: number, comment: string }} payload
 */
export const addCourseReview = async (courseId, payload) => {
  const response = await fetch(`${BASE_URL}/${courseId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Không thể gửi đánh giá khóa học");
  }
  return data;
};

/**
 * 9. Xóa đánh giá khóa học (chỉ chủ sở hữu)
 * @param {number} courseId - ID khóa học
 * @param {number} reviewId - ID đánh giá cần xóa
 * @param {string} email    - Email của học viên (xác thực quyền)
 */
export const deleteCourseReview = async (courseId, reviewId, email) => {
  const response = await fetch(
    `${BASE_URL}/${courseId}/reviews/${reviewId}?email=${encodeURIComponent(email)}`,
    { method: "DELETE" }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Không thể xóa đánh giá");
  }
  return data;
};
