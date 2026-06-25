import React, { useState } from 'react';
import './learningSidebar.css';

// Inline SVG components for zero dependency usage
const SvgChevronDown = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M207.029 381.476L12.74 187.187c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.693-153.967c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
  </svg>
);

const SvgChevronUp = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M240.971 130.524l194.289 194.29c9.373 9.372 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.307 381.462c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z"></path>
  </svg>
);

const SvgCheckCircle = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.6 387.6l184-184c6.2-6.2 6.2-16.4 0-22.6l-22.6-22.6c-6.2-6.2-16.4-6.2-22.6 0L192 312.4l-74.4-74.4c-6.2-6.2-16.4-6.2-22.6 0l-22.6 22.6c-6.2 6.2-6.2 16.4 0 22.6l108.6 108.6c6.2 6.2 16.4 6.2 22.6 0z"></path>
  </svg>
);

const SvgLock = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
    <path d="M400 224h-24v-72C376 68.48 307.52 0 224 0S72 68.48 72 152v72H48c-26.51 0-48 21.49-48 48v192c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V272c0-26.51-21.49-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path>
  </svg>
);

const SvgPlayCircle = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm115.7 272l-176 101c-15.8 9.1-35.7-2.4-35.7-20.6V151.6c0-18.2 19.9-29.7 35.7-20.6l176 101c15.8 9.1 15.8 31.9 0 41z"></path>
  </svg>
);

export default function LearningSidebar({ 
  courseTitle, 
  progress, 
  chapters, 
  activeLessonId, 
  onSelectLesson,
  completedLessonIds 
}) {
  const [openChapters, setOpenChapters] = useState({ 0: true }); // Mở chương đầu tiên theo mặc định

  const toggleChapter = (index) => {
    setOpenChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Hàm xác định xem bài học có bị khóa hay không
  const isLessonLocked = (lesson, allLessons, index) => {
    if (flatLessons.findIndex(l => l.id === activeLessonId) >= index) return false;
    if (index === 0) return false;
    const prevLesson = allLessons[index - 1];
    if (completedLessonIds.includes(prevLesson.id)) return false;
    if (completedLessonIds.includes(lesson.id) || lesson.id === activeLessonId) return false;
    return true;
  };

  const flatLessons = chapters.flatMap(ch => ch.lessons || []);

  return (
    <div className="learning-sidebar">
      {/* Khối tiêu đề & tiến độ */}
      <div className="learning-sidebar-header">
        <h2 className="learning-course-title" title={courseTitle}>
          {courseTitle || 'Đang tải khóa học...'}
        </h2>
        <div className="learning-progress-container">
          <div className="learning-progress-label-row">
            <span>Tiến độ khóa học</span>
            <span>{progress}%</span>
          </div>
          <div className="learning-progress-bar-bg">
            <div className="learning-progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Danh sách chương và bài học */}
      <div className="learning-chapters-list">
        {chapters.map((chapter, chIdx) => {
          const isOpen = openChapters[chIdx];
          return (
            <div key={chapter.id} className="learning-chapter-item">
              <div 
                className={`learning-chapter-header ${isOpen ? 'active' : ''}`}
                onClick={() => toggleChapter(chIdx)}
              >
                <span className="learning-chapter-title">
                  Chương {chapter.order}: {chapter.title}
                </span>
                <span className="learning-chapter-toggle-icon">
                  {isOpen ? <SvgChevronUp /> : <SvgChevronDown />}
                </span>
              </div>

              {isOpen && (
                <div className="learning-lessons-list">
                  {chapter.lessons.map((lesson) => {
                    const flatIdx = flatLessons.findIndex(l => l.id === lesson.id);
                    const locked = isLessonLocked(lesson, flatLessons, flatIdx);
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedLessonIds.includes(lesson.id);

                    return (
                      <div 
                        key={lesson.id} 
                        className={`learning-lesson-item ${isActive ? 'active' : ''} ${locked ? 'locked' : ''}`}
                        onClick={() => !locked && onSelectLesson(lesson)}
                      >
                        <div className="learning-lesson-left">
                          <span className="learning-lesson-icon">
                            {isActive ? (
                              <span className="learning-active-dot"></span>
                            ) : (
                              <SvgPlayCircle />
                            )}
                          </span>
                          <div className="learning-lesson-details">
                            <span className="learning-lesson-title">
                              {lesson.order}. {lesson.title}
                            </span>
                            <span className="learning-lesson-duration">
                              {lesson.duration || '10:00'}
                            </span>
                          </div>
                        </div>
                        <div className="learning-lesson-right">
                          {isCompleted ? (
                            <SvgCheckCircle />
                          ) : locked ? (
                            <SvgLock />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
