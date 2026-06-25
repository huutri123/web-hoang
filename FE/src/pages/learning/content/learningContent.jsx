import React, { useRef, useEffect, useState } from 'react';
import './learningContent.css';

// Inline SVGs for zero dependency usage
const SvgPlay = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M424.4 214.7L72.4 6.6C58.6-1.7 41.3-2.1 27.2 5.6 13.1 13.3 4.4 28 4.4 44v424c0 16 8.7 30.7 22.8 38.4 14.1 7.7 31.4 7.3 45.2-1l352-208c14.6-8.6 23.6-24.5 23.6-41.7 0-17.2-9-33.1-23.6-41.7z"></path>
  </svg>
);

const SvgChevronLeft = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path>
  </svg>
);

const SvgChevronRight = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M285.47 272.97L91.13 467.31c-9.37 9.37-24.57 9.37-33.94 0L34.52 444.64c-9.36-9.36-9.37-24.52-.04-33.9L188.51 256 34.49 101.25c-9.34-9.38-9.32-24.54.04-33.9l22.67-22.67c9.37-9.37 24.57-9.37 33.94 0l194.34 194.34c9.37 9.37 9.37 24.57 0 33.94z"></path>
  </svg>
);

const SvgClipboard = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 40c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm144 416H48V112h288v344z"></path>
  </svg>
);

const SvgCheck = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path>
  </svg>
);

export default function LearningContent({ 
  lesson, 
  chapterTitle, 
  onPrev, 
  onNext, 
  isFirst, 
  isLast,
  onVideoComplete
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRates, setShowRates] = useState(false);

  // Reset video state when lesson changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setPlaybackRate(1);
    }
  }, [lesson]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log('Video play error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    
    // Xem 90% trở lên sẽ đánh dấu bài học hoàn thành
    if (videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (pct >= 90) {
        onVideoComplete(lesson.id);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedChange = (rate) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowRates(false);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatMarkdown = (text) => {
    if (!text) return '';
    let html = text;
    
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^\s*\*\s+(.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.trim().split('\n');

    return (
      <div className="lesson-code-block-container">
        <div className="lesson-code-block-header">
          <span className="code-lang">{language || 'code'}</span>
          <button className="code-copy-btn" onClick={handleCopy}>
            {copied ? (
              <>
                <SvgCheck /> Đã sao chép
              </>
            ) : (
              <>
                <SvgClipboard /> Copy
              </>
            )}
          </button>
        </div>
        <div className="lesson-code-block-body">
          <div className="code-line-numbers">
            {lines.map((_, i) => (
              <span key={i} className="line-number">{i + 1}</span>
            ))}
          </div>
          <pre className="code-content">
            <code>
              {lines.map((line, i) => (
                <div key={i} className="code-line">{line || ' '}</div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    );
  };

  const renderLessonContent = (text) => {
    if (!text) return <p className="no-content-txt">Không có tài liệu văn bản cho bài học này.</p>;
    
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);
        return (
          <CodeBlock key={idx} code={code} language={language} />
        );
      }
      return (
        <div 
          key={idx} 
          className="lesson-text-part" 
          dangerouslySetInnerHTML={{ __html: formatMarkdown(part) }} 
        />
      );
    });
  };

  const getVideoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/upload') || url.startsWith('upload')) {
      return `http://localhost:8000/${url.replace(/^\//, '')}`;
    }
    return url;
  };

  return (
    <div className="learning-content">
      {/* Breadcrumb và Nút điều hướng */}
      <div className="learning-content-header">
        <span className="learning-breadcrumb">
          {chapterTitle} &gt; Bài {lesson.order}
        </span>
        <div className="learning-navigation-btns">
          <button 
            className="learning-nav-btn" 
            onClick={onPrev}
            disabled={isFirst}
          >
            <SvgChevronLeft /> Bài trước
          </button>
          <button 
            className="learning-nav-btn primary" 
            onClick={onNext}
            disabled={isLast}
          >
            Bài tiếp <SvgChevronRight />
          </button>
        </div>
      </div>

      {/* Tiêu đề bài học */}
      <h1 className="learning-lesson-title-main">
        {lesson.order}. {lesson.title}
      </h1>
      <p className="learning-lesson-subtitle">
        Trong bài học này, bạn sẽ học về {lesson.title.toLowerCase()}.
      </p>

      {/* Video Player */}
      <div className="learning-video-container">
        {lesson.video_url ? (
          (() => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = lesson.video_url.match(regExp);
            const ytId = match && match[2].length === 11 ? match[2] : null;

            if (ytId) {
              // Tự động hoàn thành bài học youtube khi xem
              setTimeout(() => onVideoComplete(lesson.id), 2000);
              return (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=0&enablejsapi=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="main-video-element"
                  title={lesson.title}
                  style={{ width: '100%', height: '100%', aspectRatio: '16/9' }}
                />
              );
            }

            return (
              <div className="custom-video-player">
                <video
                  ref={videoRef}
                  src={getVideoUrl(lesson.video_url)}
                  className="main-video-element"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={handlePlayPause}
                />
                
                {!isPlaying && (
                  <div className="video-play-overlay" onClick={handlePlayPause}>
                    <div className="video-play-icon-center">
                      <SvgPlay />
                    </div>
                  </div>
                )}

                <div className="video-control-bar">
                  <button className="video-control-btn play-pause" onClick={handlePlayPause}>
                    {isPlaying ? (
                      <span className="custom-video-pause-icon">||</span>
                    ) : (
                      <SvgPlay />
                    )}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="video-progress-slider"
                  />

                  <div className="video-time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>

                  <div className="video-speed-container">
                    <button 
                      className="video-control-btn speed-btn" 
                      onClick={() => setShowRates(!showRates)}
                    >
                      {playbackRate}x
                    </button>
                    {showRates && (
                      <div className="video-speed-dropdown">
                        {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                          <div 
                            key={rate} 
                            className={`speed-option ${playbackRate === rate ? 'active' : ''}`}
                            onClick={() => handleSpeedChange(rate)}
                          >
                            {rate}x
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="video-placeholder">
            <div className="video-placeholder-icon">🎞️</div>
            <p>Bài học này không có video bài giảng.</p>
          </div>
        )}
      </div>

      {/* Lý thuyết & Nội dung bài học */}
      <div className="learning-lesson-document">
        <div className="document-header">
          <span className="document-header-icon">📘</span>
          <h2>Nội dung bài học</h2>
        </div>
        <div className="document-body">
          {renderLessonContent(lesson.content)}
        </div>
      </div>
    </div>
  );
}
