const API_BASE_URL = 'http://localhost:8000/api/learning';

export const learningService = {
  // Lấy cấu trúc bài học và chương học kèm tiến độ học viên
  getCourseSyllabus: async (courseId, email) => {
    const response = await fetch(`${API_BASE_URL}/course/${courseId}/syllabus?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return await response.json();
  },

  // Đánh dấu hoàn thành / chưa hoàn thành bài học
  completeLesson: async (email, lessonId, completed) => {
    const response = await fetch(`${API_BASE_URL}/lesson/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        lesson_id: lessonId,
        completed
      })
    });
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return await response.json();
  },

  // Lấy danh sách bài tập của bài học kèm bài nộp của học viên
  getLessonExercises: async (lessonId, email) => {
    const response = await fetch(`${API_BASE_URL}/lesson/${lessonId}/exercises?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return await response.json();
  },

  // Nộp bài tập tự luận
  submitExercise: async (email, exerciseId, submissionText) => {
    const response = await fetch(`${API_BASE_URL}/exercise/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        exercise_id: exerciseId,
        submission_text: submissionText
      })
    });
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    return await response.json();
  }
};
