import React, { useState, useEffect } from 'react';
import { learningService } from '../../../services/learningService';
import './learningExercises.css';

// Inline SVGs for zero dependency usage
const SvgBookOpen = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1.1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M542.22 32.05c-54.8 3.11-163.72 14.42-223.3 56.59-15.19 10.74-24.1 28.1-24.1 46.57v325.29c0 21.41 16.47 38.64 37.85 38.64 8.35 0 17.6-4.26 24.58-9.19 59.88-42.27 169.14-53.63 224.14-56.74 13.14-.74 24.62-10.3 24.62-24.47V56.49c-.01-13.79-10.78-23.75-23.79-24.44zM24.29 32.05C11.29 32.74.5 42.7.5 56.49v328.74c0 14.17 11.48 23.73 24.62 24.47 55 3.11 164.26 14.47 224.14 56.74 6.99 4.93 16.23 9.19 24.58 9.19 21.38 0 37.85-17.23 37.85-38.64V135.21c0-18.47-8.9-35.83-24.1-46.57-59.58-42.17-168.5-53.48-223.3-56.59z"></path>
  </svg>
);

const SvgRegLightbulb = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.1em" width="1.1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
    <path d="M9 18h6"></path>
    <path d="M10 22h4"></path>
  </svg>
);

export default function LearningExercises({ 
  lessonId, 
  email
}) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [showGuides, setShowGuides] = useState({});

  useEffect(() => {
    if (!lessonId || !email) return;
    
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await learningService.getLessonExercises(lessonId, email);
        setExercises(res.exercises || []);
        
        const initialAnswers = {};
        res.exercises.forEach(ex => {
          if (ex.submission) {
            initialAnswers[ex.id] = ex.submission.submission_text;
          } else {
            initialAnswers[ex.id] = '';
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Lỗi lấy danh sách bài tập:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [lessonId, email]);

  const handleTextChange = (exId, val) => {
    setAnswers(prev => ({
      ...prev,
      [exId]: val
    }));
  };

  const toggleGuide = (exId) => {
    setShowGuides(prev => ({
      ...prev,
      [exId]: !prev[exId]
    }));
  };

  const handleSubmitting = async (exId) => {
    const text = answers[exId];
    if (!text || !text.trim()) {
      alert('Vui lòng nhập lời giải trước khi nộp!');
      return;
    }

    setSubmittingId(exId);
    try {
      await learningService.submitExercise(email, exId, text);
      alert('Nộp bài thành công!');
      
      setExercises(prev => prev.map(ex => {
        if (ex.id === exId) {
          return {
            ...ex,
            submission: {
              submission_text: text,
              submitted_at: new Date().toISOString()
            }
          };
        }
        return ex;
      }));
    } catch (err) {
      alert('Lỗi khi nộp bài: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmittingId(null);
    }
  };


  return (
    <div className="learning-exercises-sidebar">
      {/* Khối danh sách bài tập */}
      <div className="exercises-section">
        <h3 className="exercises-section-title">
          <SvgBookOpen />
          Bài tập thực hành
        </h3>

        {loading ? (
          <p className="exercises-loading">Đang tải bài tập...</p>
        ) : exercises.length === 0 ? (
          <div className="exercises-empty-box">
            <p>Không có bài tập thực hành nào cho bài học này.</p>
          </div>
        ) : (
          <div className="exercises-list">
            {exercises.map((ex, index) => {
              const isSubmitted = !!ex.submission;
              const isSubmitting = submittingId === ex.id;
              const hasGuide = !!ex.answer;
              const showGuide = !!showGuides[ex.id];

              return (
                <div key={ex.id} className="exercise-card">
                  <div className="exercise-card-header">
                    <span className="exercise-index">Bài tập {index + 1}</span>
                  </div>
                  <p className="exercise-question">{ex.question}</p>

                  <textarea
                    className="exercise-textarea"
                    placeholder="Nhập code Python hoặc câu trả lời của bạn tại đây..."
                    value={answers[ex.id] || ''}
                    onChange={(e) => handleTextChange(ex.id, e.target.value)}
                  />

                  <div className="exercise-actions-row">
                    <button
                      className={`exercise-submit-btn ${isSubmitted ? 'submitted' : ''}`}
                      disabled={isSubmitting}
                      onClick={() => handleSubmitting(ex.id)}
                    >
                      {isSubmitting ? 'Đang gửi...' : isSubmitted ? 'Nộp lại bài' : 'Nộp bài'}
                    </button>

                    {hasGuide && (
                      <button 
                        className="exercise-guide-toggle-btn"
                        onClick={() => toggleGuide(ex.id)}
                      >
                        <SvgRegLightbulb /> {showGuide ? 'Ẩn hướng dẫn' : 'Xem hướng dẫn'}
                      </button>
                    )}
                  </div>

                  {showGuide && (
                    <div className="exercise-guide-content">
                      <div className="guide-title">💡 Hướng dẫn giải quyết:</div>
                      <pre className="guide-body-code">
                        <code>{ex.answer}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
