import React, { useState, useRef, useEffect } from "react";
import "./CreatCourse.css";
import { createCourse, uploadImageWithProgress, updateCourse } from "../../../../services/courseService";

export default function CreatCourse({ onCancel, courseToEdit, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Lưu trữ file thực tế để tải lên khi nhấn Xuất bản
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    e.target.value = "";
    setCoverImageFile(file);
    setCoverImage(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    e.target.value = "";
    setVideoFile(file);
    setVideoThumb(URL.createObjectURL(file));
  };
  
  // Step 1 Form States
  const [courseName, setCourseName] = useState("");
  const [category, setCategory] = useState("lap-trinh");
  const [instructor, setInstructor] = useState(""); // 'an', 'duc', 'huy', 'yen'
  const [level, setLevel] = useState("trung-cap");
  const [shortDesc, setShortDesc] = useState("");
  const [detailedDesc, setDetailedDesc] = useState("");
  const [courseGoals, setCourseGoals] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [videoThumb, setVideoThumb] = useState("");
  
  // Step 2 Form States (Curriculum builder)
  const [chapters, setChapters] = useState([]);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [activeAddLessonChapterId, setActiveAddLessonChapterId] = useState(null);
  const [activeAddLessonTitle, setActiveAddLessonTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState(null); // { chapterId, lessonId }
  const [editingLessonTitle, setEditingLessonTitle] = useState("");
  const [expandedLessonId, setExpandedLessonId] = useState(null); // ID bài học đang mở panel chi tiết
  
  // Step 3 Form States (Pricing)
  const [pricingType, setPricingType] = useState("paid"); // 'free' or 'paid'
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  // Character counters
  const maxName = 100;
  const maxShortDesc = 200;
  const maxDetailedDesc = 5000;
  const maxCourseGoals = 5000;

  useEffect(() => {
    if (courseToEdit) {
      // Map category
      const categoryMap = {
        "Lập trình": "lap-trinh",
        "Thiết kế": "thiet-ke",
        "Công nghệ": "cong-nghe",
        "Kinh doanh": "kinh-doanh"
      };
      // Map level
      const levelMap = {
        "Sơ cấp": "so-cap",
        "Trung cấp": "trung-cap",
        "Cao cấp": "cao-cap"
      };

      setCourseName(courseToEdit.title || "");
      setCategory(categoryMap[courseToEdit.category] || "lap-trinh");
      setInstructor(courseToEdit.instructor || "");
      setLevel(levelMap[courseToEdit.level] || "trung-cap");
      setShortDesc(courseToEdit.description || courseToEdit.subtitle || "");
      setDetailedDesc(courseToEdit.detailed_description || "");
      
      // Parse goals
      if (Array.isArray(courseToEdit.goals)) {
        setCourseGoals(courseToEdit.goals.join("\n"));
      } else {
        setCourseGoals(courseToEdit.goals || "");
      }
      
      setCoverImage(courseToEdit.image || "");
      setVideoThumb(courseToEdit.video || "");

      // Parse price values (remove 'đ' and dots)
      const parsePriceVal = (priceStr) => {
        if (!priceStr) return "";
        return priceStr.toString().replace(/[^\d]/g, "");
      };
      
      const cleanBase = parsePriceVal(courseToEdit.price_old);
      const cleanDiscount = parsePriceVal(courseToEdit.price_discount);
      
      setBasePrice(cleanBase);
      setDiscountPrice(cleanDiscount);
      if (cleanBase === "0" && cleanDiscount === "0") {
        setPricingType("free");
      } else {
        setPricingType("paid");
      }

      // Parse chapters and lessons
      if (courseToEdit.syllabus && Array.isArray(courseToEdit.syllabus)) {
        const mappedChapters = courseToEdit.syllabus.map((ch, index) => ({
          id: ch.id || index + 1,
          title: ch.chapter || ch.title || `Chương ${index + 1}`,
          lessons: (ch.lessons || []).map((ls, idx) => ({
            id: ls.id || (index + 1) * 100 + idx + 1,
            title: ls.title || "",
            duration: ls.duration || "",
            video_url: ls.video_url || "",
            content: ls.content || "",
            exercises: (ls.exercises || []).map((ex, eidx) => ({
              id: ex.id || eidx + 1,
              question: ex.question || "",
              answer: ex.answer || ""
            }))
          }))
        }));
        setChapters(mappedChapters);
      }
    }
  }, [courseToEdit]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const addChapter = () => {
    if (!newChapterTitle.trim()) return;
    const newId = chapters.length > 0 ? Math.max(...chapters.map(c => c.id)) + 1 : 1;
    setChapters([...chapters, { id: newId, title: newChapterTitle, lessons: [] }]);
    setNewChapterTitle("");
  };

  // Tạo bài học mới ngay lập tức và mở panel chi tiết
  const triggerAddLesson = (chapterId) => {
    setChapters(prev => {
      const ch = prev.find(c => c.id === chapterId);
      const nextLessonId = ch && ch.lessons.length > 0
        ? Math.max(...ch.lessons.map(l => l.id)) + 1
        : 101;
      const newLesson = {
        id: nextLessonId,
        title: "",
        duration: "",
        video_url: "",
        content: "",
        exercises: []
      };
      const updated = prev.map(c =>
        c.id === chapterId ? { ...c, lessons: [...c.lessons, newLesson] } : c
      );
      // Mở panel chi tiết cho bài học mới
      setExpandedLessonId(nextLessonId);
      return updated;
    });
  };

  const cancelAddLesson = () => {
    setActiveAddLessonChapterId(null);
    setActiveAddLessonTitle("");
  };

  const startEditLesson = (chapterId, lesson) => {
    setEditingLesson({ chapterId, lessonId: lesson.id });
    setEditingLessonTitle(lesson.title);
    setActiveAddLessonChapterId(null);
  };

  const saveEditLesson = () => {
    if (!editingLessonTitle || !editingLessonTitle.trim()) {
      return;
    }
    setChapters(chapters.map(ch => {
      if (ch.id === editingLesson.chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === editingLesson.lessonId) {
              return { ...l, title: editingLessonTitle.trim() };
            }
            return l;
          })
        };
      }
      return ch;
    }));
    setEditingLesson(null);
    setEditingLessonTitle("");
  };

  const cancelEditLesson = () => {
    setEditingLesson(null);
    setEditingLessonTitle("");
  };

  const deleteChapter = (chapterId) => {
    setChapters(chapters.filter(ch => ch.id !== chapterId));
  };

  const deleteLesson = (chapterId, lessonId) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.filter(l => l.id !== lessonId)
        };
      }
      return ch;
    }));
    if (expandedLessonId === lessonId) setExpandedLessonId(null);
  };

  // Cập nhật một trường cụ thể của lesson trong state
  const updateLessonField = (chapterId, lessonId, field, value) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l =>
            l.id === lessonId ? { ...l, [field]: value } : l
          )
        };
      }
      return ch;
    }));
  };

  // Thêm một câu hỏi bài tập mới vào bài học
  const addExercise = (chapterId, lessonId) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              const newId = l.exercises.length > 0 ? Math.max(...l.exercises.map(e => e.id)) + 1 : 1;
              return { ...l, exercises: [...l.exercises, { id: newId, question: "", answer: "" }] };
            }
            return l;
          })
        };
      }
      return ch;
    }));
  };

  // Cập nhật một trường của câu hỏi bài tập
  const updateExercise = (chapterId, lessonId, exerciseId, field, value) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              return {
                ...l,
                exercises: l.exercises.map(e =>
                  e.id === exerciseId ? { ...e, [field]: value } : e
                )
              };
            }
            return l;
          })
        };
      }
      return ch;
    }));
  };

  // Xóa một câu hỏi bài tập
  const deleteExercise = (chapterId, lessonId, exerciseId) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              return { ...l, exercises: l.exercises.filter(e => e.id !== exerciseId) };
            }
            return l;
          })
        };
      }
      return ch;
    }));
  };

  const handlePublish = async () => {
    // 1. Kiểm tra tính hợp lệ dữ liệu (Validation)
    if (!courseName.trim()) {
      alert("Vui lòng nhập tên khóa học!");
      setCurrentStep(1);
      return;
    }
    if (!instructor) {
      alert("Vui lòng chọn giảng viên!");
      setCurrentStep(1);
      return;
    }
    if (!shortDesc.trim()) {
      alert("Vui lòng nhập mô tả ngắn khóa học!");
      setCurrentStep(1);
      return;
    }
    if (pricingType === "paid" && (!basePrice || !discountPrice)) {
      alert("Vui lòng điền đầy đủ giá gốc và giá khuyến mãi!");
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = coverImage;
      let finalVideoUrl = videoThumb;

      // 1. Tải ảnh bìa lên server nếu người dùng đã chọn file từ máy
      if (coverImageFile) {
        setUploadingImage(true);
        setUploadProgress(0);
        try {
          const res = await uploadImageWithProgress(coverImageFile, (percent) => {
            setUploadProgress(percent);
          });
          finalImageUrl = res.url;
        } catch (err) {
          alert("Lỗi tải ảnh bìa lên server: " + (err.message || err));
          setUploadingImage(false);
          setIsSubmitting(false);
          return;
        }
        setUploadingImage(false);
      }

      // 2. Tải video lên server nếu người dùng đã chọn file từ máy
      if (videoFile) {
        setUploadingVideo(true);
        setVideoProgress(0);
        try {
          const res = await uploadImageWithProgress(videoFile, (percent) => {
            setVideoProgress(percent);
          });
          finalVideoUrl = res.url;
        } catch (err) {
          alert("Lỗi tải video giới thiệu lên server: " + (err.message || err));
          setUploadingVideo(false);
          setIsSubmitting(false);
          return;
        }
        setUploadingVideo(false);
      }

      // 3. Định nghĩa cấu trúc ánh xạ
      const categoryMap = {
        "lap-trinh": "Lập trình",
        "thiet-ke": "Thiết kế",
        "cong-nghe": "Công nghệ",
        "kinh-doanh": "Kinh doanh"
      };

      const levelMap = {
        "so-cap": "Sơ cấp",
        "trung-cap": "Trung cấp",
        "cao-cap": "Cao cấp"
      };

      // 4. Chuẩn bị payload gửi lên API
      const courseData = {
        title: courseName.trim(),
        category: categoryMap[category] || "Lập trình",
        image: finalImageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
        description: shortDesc.trim(),
        detailed_description: detailedDesc.trim(),
        goals: courseGoals.trim(),
        price_old: pricingType === "free" ? "0đ" : `${basePrice.trim()}đ`,
        price_discount: pricingType === "free" ? "0đ" : `${discountPrice.trim()}đ`,
        instructor: instructor.trim() || "Chưa rõ",
        duration: `${chapters.reduce((acc, c) => acc + c.lessons.length, 0)} bài học`,
        level: levelMap[level] || "Trung cấp",
        video: finalVideoUrl || null,
        chapters: chapters.map(ch => ({
          title: ch.title,
          lessons: ch.lessons.map(l => ({
            title: l.title,
            duration: l.duration || "",
            type: "video",
            video_url: l.video_url || "",
            content: l.content || "",
            exercises: (l.exercises || []).map(e => ({
              question: e.question,
              answer: e.answer
            }))
          }))
        }))
      };

      // 4. Gọi API tạo hoặc sửa khóa học
      if (courseToEdit) {
        await updateCourse(courseToEdit.id, courseData);
        alert("Chúc mừng! Khóa học của bạn đã được cập nhật thành công!");
      } else {
        await createCourse(courseData);
        alert("Chúc mừng! Khóa học của bạn đã được tạo và xuất bản thành công!");
      }
      if (onSuccess) {
        onSuccess();
      } else {
        onCancel();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || (courseToEdit ? "Đã xảy ra lỗi khi cập nhật khóa học!" : "Đã xảy ra lỗi khi tạo khóa học!"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cc-container">
      {/* Header Section */}
      <div className="cc-header">
        <div className="cc-header-title-row">
          <h2 className="cc-title">{courseToEdit ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}</h2>
          <span className="cc-badge">{courseToEdit ? "Đang chỉnh sửa" : "Bản nháp"}</span>
        </div>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="cc-stepper-container">
        <div className="cc-stepper">
          <div 
            className={`cc-step ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}
            onClick={() => setCurrentStep(1)}
          >
            <span className="cc-step-num">1</span>
            <span className="cc-step-text">Thông tin cơ bản</span>
          </div>
          <div className="cc-step-line"></div>
          <div 
            className={`cc-step ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}
            onClick={() => setCurrentStep(2)}
          >
            <span className="cc-step-num">2</span>
            <span className="cc-step-text">Nội dung khóa học</span>
          </div>
          <div className="cc-step-line"></div>
          <div 
            className={`cc-step ${currentStep === 3 ? "active" : currentStep > 3 ? "completed" : ""}`}
            onClick={() => setCurrentStep(3)}
          >
            <span className="cc-step-num">3</span>
            <span className="cc-step-text">Giá bán</span>
          </div>
          <div className="cc-step-line"></div>
          <div 
            className={`cc-step ${currentStep === 4 ? "active" : ""}`}
            onClick={() => setCurrentStep(4)}
          >
            <span className="cc-step-num">4</span>
            <span className="cc-step-text">Xuất bản</span>
          </div>
        </div>
      </div>

      {/* Step Content Container */}
      <div className="cc-content-card">
        
        {/* ==================== STEP 1: THÔNG TIN CƠ BẢN ==================== */}
        {currentStep === 1 && (
          <div className="cc-step-content animate-fade-in">
            <h3 className="cc-section-title">Thông tin cơ bản</h3>
            <p className="cc-section-subtitle">Cung cấp thông tin tổng quan về khóa học của bạn.</p>

            <div className="cc-form-grid">
              {/* Left Column: Tên khóa học */}
              <div className="cc-form-group">
                <label className="cc-form-label">Tên khóa học <span className="cc-required">*</span></label>
                <div className="cc-input-wrapper">
                  <input
                    type="text"
                    maxLength={maxName}
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Nhập tên khóa học"
                  />
                  <span className="cc-char-count">{courseName.length}/{maxName}</span>
                </div>
              </div>

              {/* Right Column: Danh mục */}
              <div className="cc-form-group">
                <label className="cc-form-label">Danh mục <span className="cc-required">*</span></label>
                <select 
                  className="cc-select" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="lap-trinh">Lập trình</option>
                  <option value="thiet-ke">Thiết kế</option>
                  <option value="cong-nghe">Công nghệ</option>
                  <option value="kinh-doanh">Kinh doanh</option>
                </select>
              </div>

              {/* Left Column: Giảng viên */}
              <div className="cc-form-group">
                <label className="cc-form-label">Giảng viên <span className="cc-required">*</span></label>
                <div className="cc-input-wrapper">
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="Nhập tên giảng viên"
                  />
                </div>
              </div>

              {/* Right Column: Trình độ */}
              <div className="cc-form-group">
                <label className="cc-form-label">Trình độ</label>
                <select 
                  className="cc-select" 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="so-cap">Sơ cấp</option>
                  <option value="trung-cap">Trung cấp</option>
                  <option value="cao-cap">Cao cấp</option>
                </select>
              </div>
            </div>

            {/* Mô tả ngắn (Full width) */}
            <div className="cc-form-group mt-20">
              <label className="cc-form-label">Mô tả ngắn <span className="cc-required">*</span></label>
              <div className="cc-input-wrapper">
                <input
                  type="text"
                  maxLength={maxShortDesc}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Nhập mô tả ngắn gọn về khóa học"
                />
                <span className="cc-char-count">{shortDesc.length}/{maxShortDesc}</span>
              </div>
            </div>

            {/* Mô tả chi tiết - Rich Text Editor Mockup */}
            <div className="cc-form-group mt-20">
              <label className="cc-form-label">Mô tả chi tiết</label>
              <div className="cc-editor-container">
                <div className="cc-editor-toolbar">
                  <button className="cc-toolbar-btn bold" title="In đậm">B</button>
                  <button className="cc-toolbar-btn italic" title="In nghiêng">I</button>
                  <button className="cc-toolbar-btn underline" title="Gạch chân">U</button>
                  <div className="cc-toolbar-divider"></div>
                  <button className="cc-toolbar-btn" title="Danh sách không thứ tự">•—</button>
                  <button className="cc-toolbar-btn" title="Danh sách có thứ tự">1—</button>
                  <button className="cc-toolbar-btn" title="Canh lề trái">⫷</button>
                  <button className="cc-toolbar-btn" title="Canh lề giữa">⫸⫷</button>
                  <button className="cc-toolbar-btn" title="Canh lề phải">⫸</button>
                  <div className="cc-toolbar-divider"></div>
                  <button className="cc-toolbar-btn" title="Chèn ảnh">🖼️</button>
                  <button className="cc-toolbar-btn" title="Chèn video">📹</button>
                  <button className="cc-toolbar-btn" title="Trích dẫn">“</button>
                  <button className="cc-toolbar-btn" title="Mã nguồn">”</button>
                  <button className="cc-toolbar-btn" title="Chèn liên kết">🔗</button>
                </div>
                <div className="cc-editor-body">
                  <textarea
                    maxLength={maxDetailedDesc}
                    value={detailedDesc}
                    onChange={(e) => setDetailedDesc(e.target.value)}
                    placeholder="Mô tả chi tiết nội dung, lộ trình khóa học..."
                    rows={8}
                  />
                  <span className="cc-editor-char-count">{detailedDesc.length}/{maxDetailedDesc}</span>
                </div>
              </div>
            </div>

            {/* Mục tiêu khóa học - Rich Text Editor Mockup */}
            <div className="cc-form-group mt-20">
              <label className="cc-form-label">Mục tiêu khóa học</label>
              <div className="cc-editor-container">
                <div className="cc-editor-toolbar">
                  <button className="cc-toolbar-btn bold" title="In đậm">B</button>
                  <button className="cc-toolbar-btn italic" title="In nghiêng">I</button>
                  <button className="cc-toolbar-btn underline" title="Gạch chân">U</button>
                  <div className="cc-toolbar-divider"></div>
                  <button className="cc-toolbar-btn" title="Danh sách không thứ tự">•—</button>
                  <button className="cc-toolbar-btn" title="Danh sách có thứ tự">1—</button>
                  <div className="cc-toolbar-divider"></div>
                  <button className="cc-toolbar-btn" title="Chèn liên kết">🔗</button>
                </div>
                <div className="cc-editor-body">
                  <textarea
                    maxLength={maxCourseGoals}
                    value={courseGoals}
                    onChange={(e) => setCourseGoals(e.target.value)}
                    placeholder="Mục tiêu nội dung khóa học (mỗi mục tiêu một dòng)..."
                    rows={6}
                  />
                  <span className="cc-editor-char-count">{courseGoals.length}/{maxCourseGoals}</span>
                </div>
              </div>
            </div>

            {/* Media uploads */}
            <div className="cc-media-grid mt-24">
              {/* Left Box: Ảnh khóa học */}
              <div className="cc-form-group">
                <label className="cc-form-label">Ảnh khóa học <span className="cc-required">*</span></label>
                <div className="cc-upload-box">
                  <div 
                    className="cc-upload-preview-wrapper" 
                    onClick={() => !uploadingImage && fileInputRef.current && fileInputRef.current.click()}
                    style={{ cursor: uploadingImage ? "not-allowed" : "pointer" }}
                  >
                    {coverImage ? (
                      <img src={coverImage} alt="Course cover preview" className="cc-upload-preview" />
                    ) : (
                      <div className="cc-upload-placeholder">
                        <span className="cc-upload-placeholder-plus">+</span>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="cc-upload-progress-overlay">
                        <div className="cc-progress-bar-container">
                          <div className="cc-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <span className="cc-progress-percent">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="cc-upload-actions">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      style={{ display: "none" }} 
                      accept="image/*" 
                    />
                    <button 
                      className="cc-action-btn-blue" 
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? "Đang tải lên..." : "Tải ảnh từ máy"}
                    </button>
                    <span className="cc-upload-info-text">JPG, PNG (tối đa 2MB)</span>
                    <span className="cc-upload-warning-text">Kích thước khuyến nghị: 1280x720px</span>
                  </div>
                </div>
              </div>

              {/* Right Box: Video giới thiệu */}
              <div className="cc-form-group">
                <label className="cc-form-label">Video giới thiệu khóa học</label>
                <div className="cc-upload-box">
                  <div 
                    className="cc-upload-preview-wrapper"
                    onClick={() => !uploadingVideo && videoInputRef.current && videoInputRef.current.click()}
                    style={{ cursor: uploadingVideo ? "not-allowed" : "pointer" }}
                  >
                    {videoThumb ? (
                      <>
                        {((videoFile && videoFile.type.startsWith("video/")) || 
                          (typeof videoThumb === "string" && (
                            videoThumb.endsWith(".mp4") || 
                            videoThumb.endsWith(".mov") || 
                            videoThumb.endsWith(".webm") || 
                            videoThumb.includes("/video/")
                          ))
                        ) ? (
                          <video src={videoThumb} className="cc-upload-preview" muted />
                        ) : (
                          <img src={videoThumb} alt="Video thumbnail preview" className="cc-upload-preview" />
                        )}
                        <div className="cc-play-overlay">
                          <span className="cc-play-arrow">▶</span>
                        </div>
                      </>
                    ) : (
                      <div className="cc-upload-placeholder">
                        <span className="cc-upload-placeholder-plus">+</span>
                      </div>
                    )}
                    {uploadingVideo && (
                      <div className="cc-upload-progress-overlay">
                        <div className="cc-progress-bar-container">
                          <div className="cc-progress-bar-fill" style={{ width: `${videoProgress}%` }}></div>
                        </div>
                        <span className="cc-progress-percent">{videoProgress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="cc-upload-actions">
                    <input 
                      type="file" 
                      ref={videoInputRef} 
                      onChange={handleVideoChange} 
                      style={{ display: "none" }} 
                      accept="video/*" 
                    />
                    <button 
                      className="cc-action-btn-blue" 
                      onClick={() => videoInputRef.current && videoInputRef.current.click()}
                      disabled={uploadingVideo}
                    >
                      {uploadingVideo ? "Đang tải lên..." : "Tải video từ máy"}
                    </button>
                    <span className="cc-upload-info-text">MP4, MOV (tối đa 50MB)</span>
                    <span className="cc-upload-warning-text">Kích thước khuyến nghị: 1280x720px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: NỘI DUNG KHÓA HỌC ==================== */}
        {currentStep === 2 && (
          <div className="cc-step-content animate-fade-in">
            <h3 className="cc-section-title">Nội dung khóa học</h3>
            <p className="cc-section-subtitle">Xây dựng cấu trúc chương mục và các bài học của khóa học.</p>

            <div className="cc-curriculum-builder">
              {/* Add Chapter Box */}
              <div className="cc-add-chapter-box">
                <input
                  type="text"
                  placeholder="Tên chương mới... (Ví dụ: Chương 3: Hooks nâng cao)"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="cc-chapter-input"
                />
                <button onClick={addChapter} className="cc-btn-primary">
                  + Thêm chương
                </button>
              </div>

              {/* Chapters List */}
              <div className="cc-chapters-list mt-20">
                {chapters.length === 0 ? (
                  <p className="cc-empty-state">Chưa có chương nào. Hãy tạo một chương mới!</p>
                ) : (
                  chapters.map((ch, chIdx) => (
                    <div className="cc-chapter-item-card" key={ch.id}>
                      <div className="cc-chapter-header">
                        <div className="cc-chapter-title-group">
                          <span className="cc-drag-handle">☰</span>
                          <span className="cc-chapter-title-text">{ch.title}</span>
                        </div>
                        <div className="cc-chapter-actions">
                          <button onClick={() => triggerAddLesson(ch.id)} className="cc-chapter-action-btn add-btn" title="Thêm bài học">
                            + Thêm bài học
                          </button>
                          <button onClick={() => deleteChapter(ch.id)} className="cc-chapter-action-btn delete-btn" title="Xóa chương">
                            Xóa
                          </button>
                        </div>
                      </div>

                      <div className="cc-chapter-lessons">
                        {ch.lessons.length === 0 && activeAddLessonChapterId !== ch.id ? (
                          <div className="cc-no-lessons">Chưa có bài học nào trong chương này.</div>
                        ) : (
                          <>
                            {ch.lessons.map((ls, lsIdx) => {
                              const isEditing = editingLesson && editingLesson.chapterId === ch.id && editingLesson.lessonId === ls.id;
                              return (
                                <div className="cc-lesson-item-wrapper" key={ls.id}>
                                  {/* Dòng tiêu đề bài học */}
                                  <div className={`cc-lesson-item ${expandedLessonId === ls.id ? "expanded" : ""}`}>
                                    <div className="cc-lesson-left">
                                      <span className="cc-lesson-num">{lsIdx + 1}</span>
                                      {expandedLessonId === ls.id ? (
                                        <input
                                          type="text"
                                          value={ls.title}
                                          onChange={(e) => updateLessonField(ch.id, ls.id, "title", e.target.value)}
                                          className="cc-lesson-inline-input cc-lesson-title-edit"
                                          placeholder="Tên bài học..."
                                        />
                                      ) : (
                                        <span className={`cc-lesson-title-text ${!ls.title ? "cc-lesson-title-empty" : ""}`}>
                                          {ls.title || "Bài học chưa đặt tên..."}
                                        </span>
                                      )}
                                    </div>
                                    <div className="cc-lesson-right">
                                      <button
                                        onClick={() => setExpandedLessonId(expandedLessonId === ls.id ? null : ls.id)}
                                        className="cc-lesson-edit-btn"
                                        title={expandedLessonId === ls.id ? "Thu lại" : "Chỉnh sửa bài học"}
                                      >
                                        {expandedLessonId === ls.id ? "▲" : "✏️"}
                                      </button>
                                      <button onClick={() => deleteLesson(ch.id, ls.id)} className="cc-lesson-delete-btn" title="Xóa bài học">
                                        ×
                                      </button>
                                    </div>
                                  </div>

                                  {/* Panel chi tiết bài học — mở rộng khi click ✏️ */}
                                  {expandedLessonId === ls.id && (
                                    <div className="cc-lesson-detail-panel">

                                      {/* Tiêu đề bài học */}
                                      <div className="cc-detail-field">
                                        <label className="cc-detail-label">✏️ Tiêu đề bài học</label>
                                        <input
                                          type="text"
                                          className="cc-detail-input"
                                          placeholder="Nhập tiêu đề bài học..."
                                          value={ls.title}
                                          autoFocus
                                          onChange={(e) => updateLessonField(ch.id, ls.id, "title", e.target.value)}
                                        />
                                      </div>

                                      <div className="cc-detail-field">
                                        <label className="cc-detail-label">🎬 URL Video bài giảng</label>
                                        <input
                                          type="url"
                                          className="cc-detail-input"
                                          placeholder="https://youtube.com/watch?v=... hoặc Google Drive link"
                                          value={ls.video_url || ""}
                                          onChange={(e) => updateLessonField(ch.id, ls.id, "video_url", e.target.value)}
                                        />
                                      </div>

                                      {/* Nội dung bài học */}
                                      <div className="cc-detail-field">
                                        <label className="cc-detail-label">📝 Nội dung bài học</label>
                                        <textarea
                                          className="cc-detail-textarea"
                                          placeholder="Nhập nội dung, tóm tắt lý thuyết, hướng dẫn của bài học..."
                                          rows={5}
                                          value={ls.content || ""}
                                          onChange={(e) => updateLessonField(ch.id, ls.id, "content", e.target.value)}
                                        />
                                      </div>

                                      {/* Bài tập tự luận */}
                                      <div className="cc-detail-field">
                                        <div className="cc-detail-label-row">
                                          <label className="cc-detail-label">📋 Bài tập tự luận</label>
                                          <button
                                            className="cc-add-exercise-btn"
                                            onClick={() => addExercise(ch.id, ls.id)}
                                          >
                                            + Thêm câu hỏi
                                          </button>
                                        </div>

                                        {(ls.exercises || []).length === 0 ? (
                                          <p className="cc-no-exercise-text">Chưa có câu hỏi. Nhấn "+ Thêm câu hỏi" để thêm.</p>
                                        ) : (
                                          <div className="cc-exercise-list">
                                            {ls.exercises.map((ex, exIdx) => (
                                              <div className="cc-exercise-item" key={ex.id}>
                                                <div className="cc-exercise-header">
                                                  <span className="cc-exercise-num">Câu {exIdx + 1}</span>
                                                  <button
                                                    className="cc-exercise-delete-btn"
                                                    onClick={() => deleteExercise(ch.id, ls.id, ex.id)}
                                                    title="Xóa câu hỏi"
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                                <textarea
                                                  className="cc-detail-textarea cc-exercise-question"
                                                  placeholder="Đề bài / câu hỏi tự luận..."
                                                  rows={3}
                                                  value={ex.question}
                                                  onChange={(e) => updateExercise(ch.id, ls.id, ex.id, "question", e.target.value)}
                                                />
                                                <textarea
                                                  className="cc-detail-textarea cc-exercise-answer"
                                                  placeholder="Đáp án gợi ý / hướng dẫn chấm..."
                                                  rows={2}
                                                  value={ex.answer}
                                                  onChange={(e) => updateExercise(ch.id, ls.id, ex.id, "answer", e.target.value)}
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <div className="cc-detail-footer">
                                        <button className="cc-detail-close-btn" onClick={() => setExpandedLessonId(null)}>
                                          ✓ Đóng chi tiết
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                              );
                            })}
                            


                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 3: GIÁ BÁN ==================== */}
        {currentStep === 3 && (
          <div className="cc-step-content animate-fade-in">
            <h3 className="cc-section-title">Cấu hình giá bán</h3>
            <p className="cc-section-subtitle">Thiết lập học phí và các chính sách ưu đãi cho khóa học của bạn.</p>

            <div className="cc-pricing-selection mt-24">
              <div 
                className={`cc-pricing-card ${pricingType === "free" ? "selected" : ""}`}
                onClick={() => setPricingType("free")}
              >
                <div className="cc-pricing-card-header">
                  <div className="cc-pricing-badge free">FREE</div>
                  <h4>Miễn phí</h4>
                </div>
                <p>Học viên có thể tham gia học hoàn toàn miễn phí mà không cần thanh toán.</p>
              </div>

              <div 
                className={`cc-pricing-card ${pricingType === "paid" ? "selected" : ""}`}
                onClick={() => setPricingType("paid")}
              >
                <div className="cc-pricing-card-header">
                  <div className="cc-pricing-badge paid">PAID</div>
                  <h4>Thu phí</h4>
                </div>
                <p>Học viên cần thanh toán học phí theo giá cấu hình để truy cập nội dung.</p>
              </div>
            </div>

            {pricingType === "paid" && (
              <div className="cc-pricing-fields mt-24 animate-fade-in">
                <div className="cc-form-grid">
                  <div className="cc-form-group">
                    <label className="cc-form-label">Học phí gốc (đ) <span className="cc-required">*</span></label>
                    <input
                      type="text"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="Ví dụ: 499.000"
                      className="cc-input"
                    />
                  </div>

                  <div className="cc-form-group">
                    <label className="cc-form-label">Học phí khuyến mãi (đ)</label>
                    <input
                      type="text"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="Ví dụ: 299.000"
                      className="cc-input"
                    />
                  </div>
                </div>
                <p className="cc-pricing-note">
                  * Học phí khuyến mãi sẽ hiển thị nổi bật trên website của học viên kèm tỷ lệ giảm giá so với học phí gốc.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 4: XUẤT BẢN ==================== */}
        {currentStep === 4 && (
          <div className="cc-step-content animate-fade-in">
            <h3 className="cc-section-title">Xem trước và Xuất bản</h3>
            <p className="cc-section-subtitle">Kiểm tra lại toàn bộ thông tin trước khi chính thức xuất bản khóa học.</p>

            <div className="cc-publish-summary mt-24">
              <div className="cc-summary-course-card">
                <img src={coverImage} alt="Course cover" className="cc-summary-img" />
                <div className="cc-summary-details">
                  <div className="cc-summary-category-badge">{category === "lap-trinh" ? "Lập trình" : category === "thiet-ke" ? "Thiết kế" : category === "cong-nghe" ? "Công nghệ" : "Kinh doanh"}</div>
                  <h4 className="cc-summary-title">{courseName || "Chưa đặt tên khóa học"}</h4>
                  <p className="cc-summary-desc">{shortDesc || "Chưa có mô tả ngắn."}</p>
                  
                  <div className="cc-summary-meta">
                    <div className="cc-meta-instructor">
                      <span className="cc-meta-avatar" style={{ fontSize: "1.2rem", display: "inline-block", marginRight: "6px" }}>👨‍🏫</span>
                      <span>Giảng viên: <strong>{instructor || "Chưa nhập"}</strong></span>
                    </div>
                    <div className="cc-meta-stats">
                      <span>Cấp độ: <strong>{level === "trung-cap" ? "Trung cấp" : level === "so-cap" ? "Sơ cấp" : "Cao cấp"}</strong></span>
                      <span>Chương: <strong>{chapters.length}</strong></span>
                      <span>Bài học: <strong>{chapters.reduce((acc, c) => acc + c.lessons.length, 0)}</strong></span>
                    </div>
                  </div>

                  <div className="cc-summary-price-box">
                    <span>Giá hiển thị:</span>
                    {pricingType === "free" ? (
                      <strong className="cc-price-free">Miễn phí</strong>
                    ) : (
                      <div className="cc-price-group">
                        <strong className="cc-price-discount">{discountPrice}đ</strong>
                        <span className="cc-price-original">{basePrice}đ</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ready to Publish Info */}
              <div className="cc-publish-notice-box mt-24">
                <h5>{courseToEdit ? "Sẵn sàng cập nhật!" : "Khóa học đã sẵn sàng!"}</h5>
                <p>
                  Tất cả các thông tin cơ bản, nội dung học liệu và biểu phí đã hoàn tất. 
                  Sau khi bạn nhấn <strong>"{courseToEdit ? "Lưu thay đổi" : "Xuất bản ngay"}"</strong>, các thông tin cập nhật của khóa học sẽ chính thức được lưu và hiển thị công khai trên cổng học tập EduPro.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Actions Panel */}
      <div className="cc-footer-actions">
        <button className="cc-btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </button>

        <div className="cc-footer-right-buttons">
          {currentStep > 1 && (
            <button className="cc-btn-nav" onClick={handleBack} disabled={isSubmitting}>
              ← Quay lại
            </button>
          )}

          {currentStep < 4 ? (
            <button className="cc-btn-primary cc-btn-next-step" onClick={handleNext}>
              Tiếp tục <span className="arrow-icon">→</span>
            </button>
          ) : (
            <button 
              className="cc-btn-publish" 
              onClick={handlePublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                uploadingImage ? `⌛ Tải ảnh (${uploadProgress}%)` :
                uploadingVideo ? `⌛ Tải video (${videoProgress}%)` :
                (courseToEdit ? "⌛ Đang cập nhật..." : "⌛ Đang xuất bản...")
              ) : (courseToEdit ? "🚀 Lưu thay đổi" : "🚀 Xuất bản ngay")}
            </button>
          )}
        </div>
      </div>

      {/* Global Loading Overlay */}
      {isSubmitting && (
        <div className="cc-global-loading-overlay">
          <div className="cc-global-loading-card">
            <h4>Đang chuẩn bị khóa học...</h4>
            {uploadingImage && (
              <div className="cc-global-loading-row">
                <span>Tải ảnh bìa lên máy chủ:</span>
                <div className="cc-progress-bar-container" style={{ width: "100%", margin: "8px 0" }}>
                  <div className="cc-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="cc-progress-percent">{uploadProgress}%</span>
              </div>
            )}
            {uploadingVideo && (
              <div className="cc-global-loading-row">
                <span>Tải video giới thiệu lên máy chủ:</span>
                <div className="cc-progress-bar-container" style={{ width: "100%", margin: "8px 0" }}>
                  <div className="cc-progress-bar-fill" style={{ width: `${videoProgress}%` }}></div>
                </div>
                <span className="cc-progress-percent">{videoProgress}%</span>
              </div>
            )}
            {!uploadingImage && !uploadingVideo && (
              <div className="cc-global-loading-spinner-wrap">
                <div className="cc-global-spinner"></div>
                <p style={{ fontSize: "13.5px", color: "#64748b", marginTop: "10px" }}>
                  Đang lưu thông tin khóa học và chương trình học...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
