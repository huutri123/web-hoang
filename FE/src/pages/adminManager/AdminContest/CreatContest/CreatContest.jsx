import React, { useState, useRef, useEffect } from "react";
import "./CreatContest.css";
import { createContest, getContestById, updateContest } from "../../../../services/contestService";

export default function CreatContest({ onCancel, editId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for upload
  const imageInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Upload states
  const [contestImage, setContestImage] = useState("");       // URL sau khi upload
  const [imagePreview, setImagePreview] = useState("");       // Preview local
  const [imageFile, setImageFile] = useState(null);          // File gốc
  
  const [bannerPreview, setBannerPreview] = useState("");     // Preview local
  const [bannerFile, setBannerFile] = useState(null);        // File gốc

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  // Step 1: Basic Info state
  const [title, setTitle] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [shortDesc, setShortDesc] = useState("");
  const [detailedDesc, setDetailedDesc] = useState("");

  // Step 2: Configurations state
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [duration, setDuration] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [passingScore, setPassingScore] = useState(60);
  const [contestPassword, setContestPassword] = useState("");
  const [exams, setExams] = useState([
    {
      id: Date.now(),
      title: "Bài thi 1",
      questions: []
    }
  ]);
  const [collapsedExams, setCollapsedExams] = useState({});

  const toggleExamCollapse = (examId) => {
    setCollapsedExams(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };

  const handleDurationChange = (val) => {
    if (val === "") {
      setDuration("");
    } else {
      const parsed = parseInt(val, 10);
      setDuration(isNaN(parsed) ? "" : parsed);
    }
  };

  const handleMaxAttemptsChange = (val) => {
    if (val === "") {
      setMaxAttempts("");
    } else {
      const parsed = parseInt(val, 10);
      setMaxAttempts(isNaN(parsed) ? "" : parsed);
    }
  };

  const handlePassingScoreChange = (val) => {
    if (val === "") {
      setPassingScore("");
    } else {
      const parsed = parseInt(val, 10);
      setPassingScore(isNaN(parsed) ? "" : parsed);
    }
  };

  const addExam = () => {
    setExams(prev => [
      ...prev,
      {
        id: Date.now(),
        title: `Bài thi ${prev.length + 1}`,
        questions: []
      }
    ]);
  };

  const deleteExam = (examId) => {
    setExams(prev => prev.filter(e => e.id !== examId));
  };



  const addQuestionToExam = (examId, type = "multiple_choice") => {
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          questions: [
            ...e.questions,
            {
              id: Date.now() + Math.random(),
              type: type,
              text: "",
              options: ["", "", "", ""],
              correctOption: 0,
              points: 1,
              correct_answer: "",
              hasPresetAnswer: false
            }
          ]
        };
      }
      return e;
    }));
  };

  const deleteQuestionFromExam = (examId, qId) => {
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          questions: e.questions.filter(q => q.id !== qId)
        };
      }
      return e;
    }));
  };

  const updateQuestionText = (examId, qId, text) => {
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          questions: e.questions.map(q => q.id === qId ? { ...q, text } : q)
        };
      }
      return e;
    }));
  };

  const updateQuestionPoints = (examId, qId, points) => {
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          questions: e.questions.map(q => q.id === qId ? { ...q, points: points === "" ? "" : (Number(points) || 0) } : q)
        };
      }
      return e;
    }));
  };

  const updateOptionText = (examId, qId, optIdx, text) => {
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          questions: e.questions.map(q => {
            if (q.id === qId) {
              const newOptions = [...q.options];
              newOptions[optIdx] = text;
              return { ...q, options: newOptions };
            }
            return q;
          })
        };
      }
      return e;
    }));
  };

  const updateCorrectOption = (examId, qId, optIdx) => {
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          questions: e.questions.map(q => q.id === qId ? { ...q, correctOption: optIdx } : q)
        };
      }
      return e;
    }));
  };

  // Step 3: Prizes & Rankings state
  const [prizes, setPrizes] = useState([
    { rank: "Giải nhất", prize: "" },
    { rank: "Giải nhì",  prize: "" },
    { rank: "Giải ba",   prize: "" }
  ]);
  const [showRankings, setShowRankings] = useState("realtime");

  // Step helper navigation
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Remove individual items from multi-selects
  const removeTopic = (topicToRemove) => {
    setSelectedTopics(selectedTopics.filter(t => t !== topicToRemove));
  };

  useEffect(() => {
    if (editId) {
      const loadContest = async () => {
        try {
          const c = await getContestById(editId);
          setTitle(c.title || "");
          setSelectedTopics(c.topic ? [c.topic] : []);
          setShortDesc(c.short_desc || "");
          setDetailedDesc(c.description || "");
          
          // Điền dữ liệu ảnh và banner
          setContestImage(c.image || "");
          setImagePreview(c.image ? (c.image.startsWith("http") ? c.image : `http://localhost:8000/${c.image}`) : "");
          setBannerPreview(c.banner ? (c.banner.startsWith("http") ? c.banner : `http://localhost:8000/${c.banner}`) : "");
          
          // Chuyển đổi định dạng ngày giờ sang datetime-local (YYYY-MM-DDTHH:mm)
          const convertToDateTimeLocal = (dateStr) => {
            if (!dateStr) return "";
            if (dateStr.includes("T")) return dateStr.substring(0, 16);
            const [dPart, tPart] = dateStr.split(" ");
            if (!dPart || !tPart) return "";
            const [d, m, y] = dPart.split("/");
            const [h, min] = tPart.split(":");
            return `${y}-${m}-${d}T${h}:${min}`;
          };
          setTimeStart(convertToDateTimeLocal(c.start_time || c.startTime));
          setTimeEnd(convertToDateTimeLocal(c.end_time || c.endTime));
          setDuration(c.duration || 60);
          setMaxAttempts(c.max_attempts || 1);
          setPassingScore(c.passing_score || 50);
          setContestPassword(c.password || "");
          setShowRankings(c.ranking_policy || "realtime");
          
          // Điền dữ liệu giải thưởng
          setPrizes([
            { rank: "Giải nhất", prize: c.prize_1 || "" },
            { rank: "Giải nhì",  prize: c.prize_2 || "" },
            { rank: "Giải ba",   prize: c.prize_3 || "" }
          ]);
          
          // Điền dữ liệu bài thi / câu hỏi
          if (c.exams && c.exams.length > 0) {
            setExams(c.exams.map((ex, exIdx) => ({
              id: ex.id,
              title: ex.title || `Bài thi ${exIdx + 1}`,
              questions: (ex.questions || []).map((q, idx) => ({
                id: q.id || idx + 1,
                type: q.type || "multiple_choice",
                text: q.text || "",
                options: q.options || ["", "", "", ""],
                correctOption: q.correctOption !== undefined ? q.correctOption : 0,
                points: q.points || 1,
                correct_answer: q.correct_answer || "",
                hasPresetAnswer: !!q.correct_answer
              }))
            })));
          } else if (c.questions && c.questions.length > 0) {
            // Tương thích ngược: map vào 1 bài thi mặc định
            setExams([
              {
                id: Date.now(),
                title: "Bài thi 1",
                questions: c.questions.map((q, idx) => ({
                  id: q.id || idx + 1,
                  type: q.type || "multiple_choice",
                  text: q.text || "",
                  options: q.options || ["", "", "", ""],
                  correctOption: q.correctOption !== undefined ? q.correctOption : 0,
                  points: q.points || 1,
                  correct_answer: q.correct_answer || "",
                  hasPresetAnswer: !!q.correct_answer
                }))
              }
            ]);
          } else {
            setExams([
              {
                id: Date.now(),
                title: "Bài thi 1",
                questions: []
              }
            ]);
          }
        } catch (err) {
          console.error("Lỗi khi tải thông tin cuộc thi để chỉnh sửa:", err);
          alert("Lỗi khi tải thông tin cuộc thi để chỉnh sửa: " + err.message);
        }
      };
      loadContest();
    }
  }, [editId]);


  const handlePublish = async () => {
    // Validation cơ bản
    if (!title.trim()) { alert("Vui lòng nhập tên cuộc thi!"); setCurrentStep(1); return; }
    if (!shortDesc.trim()) { alert("Vui lòng nhập mô tả ngắn!"); setCurrentStep(1); return; }
    if (!timeStart || !timeEnd) { alert("Vui lòng chọn thời gian bắt đầu và kết thúc!"); setCurrentStep(2); return; }

    setIsSubmitting(true);
    try {
      // Upload ảnh đại diện nếu có chọn file
      let finalImage = contestImage;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("http://localhost:8000/api/upload?type=contest", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.url) finalImage = uploadData.url;
      }

      // Upload banner nếu có chọn file
      let finalBanner = "";
      if (bannerFile) {
        const formData = new FormData();
        formData.append("file", bannerFile);
        const uploadRes = await fetch("http://localhost:8000/api/upload?type=contest", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.url) finalBanner = uploadData.url;
      }

      const payload = {
        title: title.trim(),
        short_desc: shortDesc.trim(),
        description: detailedDesc.trim(),
        image: finalImage || null,
        banner: finalBanner || null,
        topic: selectedTopics[0] || null,         // Lấy chủ đề đầu tiên
        start_time: timeStart,                    // "2026-05-10T20:00"
        end_time: timeEnd,
        duration: duration,
        max_attempts: parseInt(maxAttempts) || 1,
        passing_score: parseInt(passingScore) || 50,
        password: contestPassword.trim() || null,
        level: "Trung bình",                    // Mặc định, có thể thêm field sau
        prize_1: prizes[0] ? prizes[0].prize : null,
        prize_2: prizes[1] ? prizes[1].prize : null,
        prize_3: prizes[2] ? prizes[2].prize : null,
        ranking_policy: showRankings,
        exams: exams.map((e, idx) => ({
          title: `Bài thi ${idx + 1}`,
          questions: e.questions.map(q => ({
            type: q.type || "multiple_choice",
            text: q.text.trim(),
            options: q.options.map(opt => opt.trim()),
            correctOption: q.correctOption,
            points: q.points || 1,
            correct_answer: q.correct_answer || ""
          }))
        }))
      };

      if (editId) {
        await updateContest(editId, payload);
        alert("✅ Cuộc thi đã được cập nhật thành công!");
      } else {
        await createContest(payload);
        alert("✅ Cuộc thi đã được xuất bản thành công!");
      }
      if (onCancel) onCancel();
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cr-container">
      {/* Wizard Header */}
      <div className="cr-header-section">
        <div className="cr-title-wrapper">
          <h2 className="cr-title">{editId ? "Chỉnh sửa cuộc thi" : "Thêm cuộc thi mới"}</h2>
          <span className="cr-draft-badge">{editId ? "Đang chỉnh sửa" : "Bản nháp"}</span>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="cr-stepper">
        <div className={`cr-step-item ${currentStep === 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
          <div className="step-number">1</div>
          <span className="step-label">Thông tin cơ bản</span>
        </div>
        <div className="step-connector"></div>
        <div className={`cr-step-item ${currentStep === 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
          <div className="step-number">2</div>
          <span className="step-label">Cấu hình cuộc thi</span>
        </div>
        <div className="step-connector"></div>
        <div className={`cr-step-item ${currentStep === 3 ? "active" : ""} ${currentStep > 3 ? "completed" : ""}`}>
          <div className="step-number">3</div>
          <span className="step-label">Giải thưởng & xếp hạng</span>
        </div>
        <div className="step-connector"></div>
        <div className={`cr-step-item ${currentStep === 4 ? "active" : ""}`}>
          <div className="step-number">4</div>
          <span className="step-label">Xem lại & xuất bản</span>
        </div>
      </div>

      {/* Wizard Content Panel */}
      <div className="cr-wizard-panel">
        
        {/* ================= STEP 1: BASIC INFO ================= */}
        {currentStep === 1 && (
          <div className="cr-step-content animate-fade-in">
            <h3 className="cr-step-heading">Thông tin cơ bản</h3>
            <p className="cr-step-subheading">Cung cấp thông tin cơ bản về cuộc thi.</p>

            <div className="cr-form-grid">
              {/* Contest Title */}
              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Tên cuộc thi <span className="text-red">*</span></label>
                <div className="input-with-counter">
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                    placeholder="Nhập tên cuộc thi..."
                  />
                  <span className="char-counter">{title.length}/100</span>
                </div>
              </div>

              {/* Topics Select */}
              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Chủ đề <span className="text-red">*</span></label>
                <div className="tag-select-container">
                  {selectedTopics.map(t => (
                    <span className="selected-tag-pill" key={t}>
                      {t} <button type="button" onClick={() => removeTopic(t)} className="tag-remove-btn">&times;</button>
                    </span>
                  ))}
                  <select 
                    onChange={(e) => {
                      if (e.target.value && !selectedTopics.includes(e.target.value)) {
                        setSelectedTopics([...selectedTopics, e.target.value]);
                      }
                      e.target.value = "";
                    }}
                    value=""
                  >
                    <option value="" disabled>Chọn chủ đề...</option>
                    <option value="AI">AI</option>
                    <option value="Lập trình">Lập trình</option>
                    <option value="Python">Python</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Bảo mật">Bảo mật</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>
              </div>



              {/* Short Description */}
              <div className="cr-form-group col-span-2">
                <label className="cr-form-label">Mô tả ngắn <span className="text-red">*</span></label>
                <div className="input-with-counter">
                  <input 
                    type="text" 
                    value={shortDesc} 
                    onChange={(e) => setShortDesc(e.target.value.slice(0, 200))}
                    placeholder="Nhập mô tả ngắn gọn về mục tiêu cuộc thi..."
                  />
                  <span className="char-counter">{shortDesc.length}/200</span>
                </div>
              </div>

              {/* Rich-text Mockup Editor */}
              <div className="cr-form-group col-span-2">
                <label className="cr-form-label">Mô tả chi tiết <span className="text-red">*</span></label>
                <div className="mockup-editor-wrapper">
                  {/* Toolbar */}
                  <div className="editor-toolbar">
                    <button type="button" className="editor-tb-btn font-bold" title="Bold">B</button>
                    <button type="button" className="editor-tb-btn font-italic" title="Italic">I</button>
                    <button type="button" className="editor-tb-btn font-underline" title="Underline">U</button>
                    <div className="tb-separator"></div>
                    <button type="button" className="editor-tb-btn" title="Bullet List">☰</button>
                    <button type="button" className="editor-tb-btn" title="Numbered List">📋</button>
                    <div className="tb-separator"></div>
                    <button type="button" className="editor-tb-btn" title="Align Left">Align</button>
                    <button type="button" className="editor-tb-btn" title="Link">🔗</button>
                    <button type="button" className="editor-tb-btn" title="Image">🖼</button>
                    <button type="button" className="editor-tb-btn" title="Code Block">&lt;/&gt;</button>
                  </div>
                  {/* Textarea */}
                  <textarea 
                    value={detailedDesc}
                    onChange={(e) => setDetailedDesc(e.target.value.slice(0, 2000))}
                    rows={8}
                    placeholder="Nhập nội dung mô tả chi tiết, thể lệ cuộc thi, các mốc thời gian..."
                  />
                  <div className="editor-footer">
                    <span className="char-counter">{detailedDesc.length}/2000</span>
                  </div>
                </div>
              </div>

              {/* Upload ảnh đại diện */}
              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Ảnh đại diện <span className="text-red">*</span></label>
                <div className="cr-upload-box">
                  <div 
                    className="cr-upload-preview-wrapper" 
                    onClick={() => imageInputRef.current?.click()}
                    style={{ cursor: "pointer" }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="cr-upload-preview" />
                    ) : (
                      <div className="cr-upload-placeholder">
                        <span className="cr-upload-placeholder-plus">+</span>
                      </div>
                    )}
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                  <div className="cr-upload-instructions">
                    <button type="button" className="cr-upload-action-btn" onClick={() => imageInputRef.current?.click()}>
                      Tải ảnh từ máy
                    </button>
                    <p className="upload-tip">JPG, PNG (tối đa 2MB)</p>
                    <p className="upload-tip font-medium">Kích thước khuyến nghị: 600x450px</p>
                  </div>
                </div>
              </div>

              {/* Upload Wide Banner */}
              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Banner cuộc thi <span className="text-red">*</span></label>
                <div className="cr-upload-box">
                  <div 
                    className="cr-upload-preview-wrapper banner-wrapper" 
                    onClick={() => bannerInputRef.current?.click()}
                    style={{ cursor: "pointer" }}
                  >
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="banner preview" className="cr-upload-preview" />
                    ) : (
                      <div className="cr-upload-placeholder">
                        <span className="cr-upload-placeholder-plus">+</span>
                      </div>
                    )}
                  </div>
                  <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerChange} />
                  <div className="cr-upload-instructions">
                    <button type="button" className="cr-upload-action-btn" onClick={() => bannerInputRef.current?.click()}>
                      Tải banner từ máy
                    </button>
                    <p className="upload-tip">JPG, PNG (tối đa 4MB)</p>
                    <p className="upload-tip font-medium">Kích thước khuyến nghị: 1200x400px</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CONTEST CONFIG ================= */}
        {currentStep === 2 && (
          <div className="cr-step-content animate-fade-in">
            <h3 className="cr-step-heading">Cấu hình cuộc thi</h3>
            <p className="cr-step-subheading">Cài đặt các mốc thời gian và quy chế dự thi.</p>

            <div className="cr-form-grid">
              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Thời gian bắt đầu <span className="text-red">*</span></label>
                <input 
                  type="datetime-local" 
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  className="cr-select-input"
                />
              </div>

              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Thời gian kết thúc <span className="text-red">*</span></label>
                <input 
                  type="datetime-local" 
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  className="cr-select-input"
                />
              </div>

              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Thời gian làm bài (Phút) <span className="text-red">*</span></label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="cr-select-input"
                  min="10"
                />
              </div>

              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Số lượt nộp bài tối đa <span className="text-red">*</span></label>
                <input 
                  type="number" 
                  value={maxAttempts}
                  onChange={(e) => handleMaxAttemptsChange(e.target.value)}
                  className="cr-select-input"
                  min="1"
                />
              </div>

              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Điểm số vượt qua (%) <span className="text-red">*</span></label>
                <input 
                  type="number" 
                  value={passingScore}
                  onChange={(e) => handlePassingScoreChange(e.target.value)}
                  className="cr-select-input"
                  min="0"
                  max="100"
                />
              </div>
              <div className="cr-form-group col-span-1">
                <label className="cr-form-label">Mật khẩu tham gia (Tùy chọn)</label>
                <input 
                  type="password" 
                  value={contestPassword}
                  onChange={(e) => setContestPassword(e.target.value)}
                  placeholder="Để trống nếu không cần mật khẩu"
                  className="cr-select-input"
                />
              </div>
            </div>

            {/* Dynamic Exams & Questions Builder */}
            <div className="cr-questions-section" style={{ padding: 0, background: "none", border: "none", boxShadow: "none" }}>
              <div className="questions-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h4 className="questions-section-title">Danh sách bài thi ({exams.length})</h4>
                <button type="button" className="cr-btn-add-question" onClick={addExam} style={{ background: "var(--admin-primary)", color: "white", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none" }}>
                  + Thêm bài thi mới
                </button>
              </div>

              {exams.length === 0 ? (
                <div className="empty-questions-box" style={{ padding: "40px 20px" }}>
                  Chưa có bài thi nào được tạo. Nhấp vào "+ Thêm bài thi mới" để bắt đầu!
                </div>
              ) : (
                <div className="exams-list-wrapper" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                  {exams.map((exam, examIdx) => {
                    const examCollapsed = !!collapsedExams[exam.id];
                    return (
                      <div key={exam.id} className="exam-builder-card" style={{ border: "1px solid #cbd5e1", borderRadius: "12px", background: "#f8fafc", padding: "20px" }}>
                        {/* Exam Header: Title and Delete Button */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: examCollapsed ? "none" : "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: examCollapsed ? "0" : "16px" }}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                            <button
                              type="button"
                              onClick={() => toggleExamCollapse(exam.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", outline: "none" }}
                              title={examCollapsed ? "Mở rộng bài thi" : "Thu gọn bài thi"}
                            >
                              {examCollapsed ? "▶" : "▼"}
                            </button>
                            <span className="question-index-badge" style={{ background: "var(--admin-primary)", color: "white", padding: "4px 10px", borderRadius: "6px", fontWeight: "600", fontSize: "13px" }}>
                              Bài thi {examIdx + 1}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteExam(exam.id)}
                            style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500", marginLeft: "12px" }}
                          >
                            Xóa bài thi 🗑
                          </button>
                        </div>

                        {/* Exam Questions List */}
                        {!examCollapsed && (
                          <div className="cr-questions-section" style={{ padding: 0, background: "none", border: "none", boxShadow: "none" }}>
                            <div className="questions-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                              <h5 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                                Danh sách câu hỏi ({exam.questions.length})
                              </h5>
                              <button
                                type="button"
                                className="cr-btn-add-question mc"
                                onClick={() => addQuestionToExam(exam.id, "multiple_choice")}
                                style={{ background: "#0284c7", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "none" }}
                              >
                                + Thêm câu hỏi
                              </button>
                            </div>

                            {exam.questions.length === 0 ? (
                              <div className="empty-questions-box" style={{ padding: "20px", background: "#fff", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                                Chưa có câu hỏi nào trong bài thi này.
                              </div>
                            ) : (
                              <div className="questions-list-wrapper" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {exam.questions.map((q, qIdx) => (
                                  <div className="question-card-item" key={q.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                                    <div className="question-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <span className="question-index-badge">Câu hỏi {qIdx + 1}</span>
                                        <span style={{ fontSize: "11px", background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>Trắc nghiệm 📋</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "12px" }}>
                                          <span style={{ fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Điểm:</span>
                                          <input 
                                            type="number" 
                                            min="1"
                                            max="100"
                                            value={q.points ?? 1}
                                            onChange={(e) => updateQuestionPoints(exam.id, q.id, e.target.value)}
                                            style={{ width: "55px", padding: "3px 6px", fontSize: "12px", border: "1px solid #cbd5e1", borderRadius: "4px", textAlign: "center", outline: "none" }}
                                          />
                                        </div>
                                      </div>
                                      <button 
                                        type="button" 
                                        className="question-delete-btn"
                                        onClick={() => deleteQuestionFromExam(exam.id, q.id)}
                                        title="Xóa câu hỏi"
                                      >
                                        Xóa câu hỏi 🗑
                                      </button>
                                    </div>

                                    <div className="question-card-body">
                                      {/* Question Text Input */}
                                      <div className="cr-form-group">
                                        <label className="cr-form-label">Nội dung câu hỏi <span className="text-red">*</span></label>
                                        <input 
                                          type="text"
                                          value={q.text}
                                          onChange={(e) => updateQuestionText(exam.id, q.id, e.target.value)}
                                          placeholder="Nhập nội dung câu hỏi..."
                                          className="question-text-input"
                                        />
                                      </div>

                                      {/* Options Input */}
                                      <div className="options-grid-builder">
                                        <label className="cr-form-label">Danh sách đáp án (Chọn nút tròn đầu dòng để đánh dấu đáp án đúng) <span className="text-red">*</span></label>
                                        <div className="options-inputs-list">
                                          {q.options.map((opt, optIdx) => (
                                            <div className={`option-input-row ${q.correctOption === optIdx ? "is-correct" : ""}`} key={optIdx}>
                                              <label className="option-radio-wrapper">
                                                <input 
                                                  type="radio"
                                                  name={`correct-opt-${q.id}`}
                                                  checked={q.correctOption === optIdx}
                                                  onChange={() => updateCorrectOption(exam.id, q.id, optIdx)}
                                                />
                                                <span className="option-letter-badge">{String.fromCharCode(65 + optIdx)}</span>
                                              </label>
                                              <input 
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOptionText(exam.id, q.id, optIdx, e.target.value)}
                                                placeholder={`Nhập nội dung đáp án ${String.fromCharCode(65 + optIdx)}...`}
                                                className="option-text-input"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: PRIZES & RANKINGS ================= */}
        {currentStep === 3 && (
          <div className="cr-step-content animate-fade-in">
            <h3 className="cr-step-heading">Giải thưởng & xếp hạng</h3>
            <p className="cr-step-subheading">Xác lập các giải thưởng, chứng nhận và quyền công bố.</p>

            <div className="cr-form-grid">
              <div className="cr-form-group col-span-2">
                <label className="cr-form-label">Cơ cấu giải thưởng</label>
                <table className="cr-prizes-table">
                  <thead>
                    <tr>
                      <th>Hạng giải</th>
                      <th>Giá trị giải thưởng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prizes.map((p, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">{p.rank}</td>
                        <td>
                          <input 
                            type="text" 
                            value={p.prize} 
                            onChange={(e) => {
                              const updated = [...prizes];
                              updated[idx].prize = e.target.value;
                              setPrizes(updated);
                            }}
                            className="table-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="cr-form-group col-span-2">
                <label className="cr-form-label">Cơ chế công bố bảng xếp hạng</label>
                <div className="radio-options-flex">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="rankings" 
                      value="realtime" 
                      checked={showRankings === "realtime"}
                      onChange={() => setShowRankings("realtime")}
                    />
                    <div className="option-desc">
                      <strong>Thời gian thực (Real-time)</strong>
                      <span>Thí sinh có thể thấy bảng xếp hạng thay đổi ngay khi hoàn thành bài.</span>
                    </div>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="rankings" 
                      value="ended" 
                      checked={showRankings === "ended"}
                      onChange={() => setShowRankings("ended")}
                    />
                    <div className="option-desc">
                      <strong>Sau khi kết thúc</strong>
                      <span>Bảng xếp hạng chỉ được hiển thị sau khi cuộc thi chính thức khép lại.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PUBLISH ================= */}
        {currentStep === 4 && (
          <div className="cr-step-content animate-fade-in">
            <h3 className="cr-step-heading">Xem lại & xuất bản</h3>
            <p className="cr-step-subheading">Vui lòng rà soát lại toàn bộ thông tin cuộc thi trước khi công bố ra trang chủ.</p>

            <div className="cr-review-container">
              <div className="review-block">
                <h4 className="review-title">Thông tin cơ bản</h4>
                <div className="review-details">
                  <div className="detail-item"><strong>Tên cuộc thi:</strong> <span>{title}</span></div>
                  <div className="detail-item"><strong>Chủ đề:</strong> <span>{selectedTopics.join(", ")}</span></div>
                  <div className="detail-item"><strong>Mô tả ngắn:</strong> <span>{shortDesc}</span></div>
                </div>
              </div>

              <div className="review-block">
                <h4 className="review-title">Cấu hình thời gian & quy chế</h4>
                <div className="review-details">
                  <div className="detail-item"><strong>Bắt đầu:</strong> <span>{new Date(timeStart).toLocaleString("vi-VN")}</span></div>
                  <div className="detail-item"><strong>Kết thúc:</strong> <span>{new Date(timeEnd).toLocaleString("vi-VN")}</span></div>
                  <div className="detail-item"><strong>Thời gian làm bài:</strong> <span>{duration} phút</span></div>
                  <div className="detail-item"><strong>Số lượt nộp tối đa:</strong> <span>{maxAttempts} lần</span></div>
                  <div className="detail-item"><strong>Điểm chuẩn đạt:</strong> <span>{passingScore}%</span></div>
                </div>
              </div>

              <div className="review-block">
                <h4 className="review-title">Giải thưởng & Xếp hạng</h4>
                <div className="review-details">
                  {prizes.map((p, idx) => (
                    <div className="detail-item" key={idx}>
                      <strong>{p.rank}:</strong> <span>{p.prize}</span>
                    </div>
                  ))}
                  <div className="detail-item"><strong>Hiển thị bảng xếp hạng:</strong> <span>{showRankings === "realtime" ? "Thời gian thực" : "Sau khi kết thúc"}</span></div>
                </div>
              </div>

              <div className="review-block">
                <h4 className="review-title">Danh sách bài thi ({exams.length} bài thi)</h4>
                <div className="review-details">
                  {exams.length === 0 ? (
                    <div className="detail-item"><span>Chưa có bài thi nào được thêm.</span></div>
                  ) : (
                    exams.map((exam, examIdx) => (
                      <div key={exam.id} style={{ marginBottom: "24px", border: "1px solid #cbd5e1", padding: "16px", borderRadius: "10px", background: "#ffffff" }}>
                        <h5 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "var(--admin-primary)" }}>
                          Bài thi {examIdx + 1}: {exam.title} ({exam.questions.length} câu hỏi)
                        </h5>
                        {exam.questions.length === 0 ? (
                          <div style={{ color: "#64748b", fontSize: "13px" }}>Chưa có câu hỏi nào.</div>
                        ) : (
                          exam.questions.map((q, qIdx) => (
                            <div className="review-question-summary" key={q.id} style={{ marginBottom: "12px", borderBottom: "1px dashed #cbd5e1", paddingBottom: "8px" }}>
                              <div style={{ fontWeight: "600", fontSize: "13.5px", marginBottom: "4px", display: "flex", gap: "8px", alignItems: "center" }}>
                                <span>Câu {qIdx + 1}: {q.text || "(Trống)"}</span>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal" }}>({q.points || 1} điểm)</span>
                                <span style={{ fontSize: "10px", background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd", padding: "1px 4px", borderRadius: "3px" }}>Trắc nghiệm 📋</span>
                              </div>
                              <div style={{ paddingLeft: "12px", fontSize: "12.5px" }}>
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} style={{ color: q.correctOption === optIdx ? "#10b981" : "#64748b", fontWeight: q.correctOption === optIdx ? "600" : "normal" }}>
                                    {String.fromCharCode(65 + optIdx)}. {opt || "(Trống)"} {q.correctOption === optIdx && "✓"}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="cr-footer-bar">
        <button type="button" className="cr-btn-cancel" onClick={onCancel}>Hủy</button>
        <div className="cr-nav-actions">
          {currentStep > 1 && (
            <button type="button" className="cr-btn-prev" onClick={prevStep}>← Quay lại</button>
          )}
          {currentStep < 4 ? (
            <button type="button" className="cr-btn-next" onClick={nextStep}>Tiếp tục →</button>
          ) : (
            <button type="button" className="cr-btn-publish" onClick={handlePublish} disabled={isSubmitting}>
              {isSubmitting 
                ? (editId ? "⏳ Đang cập nhật..." : "⏳ Đang xuất bản...") 
                : (editId ? "Lưu thay đổi 💾" : "Xuất bản cuộc thi 🚀")
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
