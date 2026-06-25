import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { useAuth } from '../../services/AuthContext';
import { learningService } from '../../services/learningService';
import LearningSidebar from './sidebar/learningSidebar';
import LearningContent from './content/learningContent';
import LearningExercises from './tab/learningExercises';
import './LearningPage.css';

export default function LearningPage() {
  const { courseId } = useParams();
  const { user, openModal } = useAuth();
  const navigate = useNavigate();

  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);

  // Tải danh sách syllabus khi component mount hoặc thay đổi khóa học
  useEffect(() => {
    if (!user) return;
    if (!courseId) return;

    const fetchSyllabus = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await learningService.getCourseSyllabus(courseId, user.email);
        setSyllabus(data);
        
        // Lấy tất cả lesson_ids đã hoàn thành
        const completedIds = [];
        data.chapters.forEach(ch => {
          ch.lessons.forEach(ls => {
            if (ls.completed) {
              completedIds.push(ls.id);
            }
          });
        });
        setCompletedLessonIds(completedIds);

        // Bài học mặc định: bài học đầu tiên chưa hoàn thành, hoặc bài học đầu tiên của khóa học
        let defaultLesson = null;
        for (const ch of data.chapters) {
          for (const ls of ch.lessons) {
            if (!ls.completed) {
              defaultLesson = ls;
              break;
            }
          }
          if (defaultLesson) break;
        }

        if (!defaultLesson && data.chapters.length > 0 && data.chapters[0].lessons.length > 0) {
          defaultLesson = data.chapters[0].lessons[0];
        }

        setActiveLesson(defaultLesson);
      } catch (err) {
        console.error('Lỗi tải giáo trình khóa học:', err);
        setError('Không thể tải giáo trình của khóa học này. Vui lòng kiểm tra lại kết nối.');
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabus();
  }, [courseId, user]);

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
  };

  const handleVideoComplete = async (lessonId) => {
    if (completedLessonIds.includes(lessonId)) return;

    try {
      await learningService.completeLesson(user.email, lessonId, true);
      
      const newCompleted = [...completedLessonIds, lessonId];
      setCompletedLessonIds(newCompleted);

      // Cập nhật lại tiến trình học tập
      if (syllabus) {
        const flatLessonsCount = syllabus.total_lessons || 1;
        const newProgress = Math.round((newCompleted.length / flatLessonsCount) * 100);
        setSyllabus(prev => ({
          ...prev,
          progress: newProgress
        }));
      }
    } catch (err) {
      console.error('Lỗi lưu trạng thái hoàn thành bài học:', err);
    }
  };

  // Xác định vị trí bài học hiện tại trong danh sách phẳng
  const flatLessons = syllabus ? syllabus.chapters.flatMap(ch => ch.lessons || []) : [];
  const currentFlatIndex = activeLesson ? flatLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const isFirstLesson = currentFlatIndex === 0;
  const isLastLesson = currentFlatIndex === flatLessons.length - 1;

  const handlePrevLesson = () => {
    if (currentFlatIndex > 0) {
      setActiveLesson(flatLessons[currentFlatIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (currentFlatIndex < flatLessons.length - 1) {
      setActiveLesson(flatLessons[currentFlatIndex + 1]);
    }
  };

  const activeChapter = syllabus && activeLesson
    ? syllabus.chapters.find(ch => ch.lessons.some(l => l.id === activeLesson.id))
    : null;



  // Nếu chưa đăng nhập, hiển thị thông báo yêu cầu đăng nhập
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="learning-page-unauth-container">
          <div className="learning-unauth-card">
            <div className="learning-unauth-icon">🔒</div>
            <h3>Yêu cầu đăng nhập</h3>
            <p>Vui lòng đăng nhập tài khoản học viên của bạn để vào phòng học trực tuyến.</p>
            <button onClick={() => openModal('login')} className="learning-unauth-login-btn">
              Đăng nhập ngay
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="learning-page-container">
        {loading ? (
          <div className="learning-loading-screen">
            <div className="learning-spinner"></div>
            <p>Đang tải phòng học trực tuyến của bạn...</p>
          </div>
        ) : error ? (
          <div className="learning-error-screen">
            <div className="error-icon">⚠️</div>
            <h3>Không thể truy cập lớp học</h3>
            <p>{error}</p>
            <button onClick={() => navigate('/my-courses')} className="error-back-btn">
              Quay lại khóa học của tôi
            </button>
          </div>
        ) : !activeLesson ? (
          <div className="learning-error-screen">
            <div className="error-icon">📖</div>
            <h3>Khóa học chưa sẵn sàng</h3>
            <p>Khóa học này hiện chưa có giáo trình bài giảng được thiết lập.</p>
            <button onClick={() => navigate('/my-courses')} className="error-back-btn">
              Quay lại khóa học của tôi
            </button>
          </div>
        ) : (
          <div className="learning-page-layout">
            {/* Cột 1: Danh sách bài học bên trái */}
            <LearningSidebar
              courseTitle={syllabus.course_title}
              progress={syllabus.progress}
              chapters={syllabus.chapters}
              activeLessonId={activeLesson.id}
              onSelectLesson={handleSelectLesson}
              completedLessonIds={completedLessonIds}
            />

            {/* Cột 2: Khung phát video & nội dung ở giữa */}
            <LearningContent
              lesson={activeLesson}
              chapterTitle={activeChapter ? `Chương ${activeChapter.order}` : ''}
              onPrev={handlePrevLesson}
              onNext={handleNextLesson}
              isFirst={isFirstLesson}
              isLast={isLastLesson}
              onVideoComplete={handleVideoComplete}
            />

            {/* Cột 3: Quản lý bài tập bên phải */}
            <LearningExercises
              lessonId={activeLesson.id}
              email={user.email}
            />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
