import React, { useState } from "react";
import "./CreatVoucher.css";
import { createVoucher } from "../../../../services/voucherService";

export default function CreatVoucher({ onCancel }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("percent"); // 'percent' or 'amount'
  const [discountValue, setDiscountValue] = useState("");
  const [limitUses, setLimitUses] = useState(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 16)); // Format YYYY-MM-DDTHH:mm
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!code.trim()) {
      setErrorMessage("Vui lòng nhập Mã voucher!");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Vui lòng nhập Tên voucher!");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setErrorMessage("Giá trị giảm giá phải lớn hơn 0!");
      return;
    }
    if (discountType === "percent" && Number(discountValue) > 100) {
      setErrorMessage("Giá trị giảm theo phần trăm không được vượt quá 100%!");
      return;
    }
    if (!limitUses || Number(limitUses) <= 0) {
      setErrorMessage("Số lượt sử dụng phải lớn hơn 0!");
      return;
    }
    if (!endDate) {
      setErrorMessage("Vui lòng nhập Ngày hết hạn!");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMessage("Ngày hết hạn phải sau ngày bắt đầu!");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        limit_uses: Number(limitUses),
        start_date: startDate,
        end_date: endDate
      };

      await createVoucher(payload);
      alert("Đã tạo voucher mới thành công!");
      onCancel(); // Quay lại trang danh sách
    } catch (err) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi tạo voucher!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crv-container">
      <div className="crv-header-row">
        <div>
          <h2>Tạo Voucher Mới</h2>
          <p className="crv-subtitle">Thêm mã giảm giá mới vào hệ thống của bạn</p>
        </div>
        <button className="crv-back-btn" onClick={onCancel}>
          ⬅️ Quay lại danh sách
        </button>
      </div>

      <div className="crv-form-card">
        {errorMessage && (
          <div className="crv-error-banner">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="crv-form-group">
            <label htmlFor="code">Mã Voucher <span className="crv-required">*</span></label>
            <input 
              type="text" 
              id="code"
              placeholder="Ví dụ: SUMMERSALE50 (Viết hoa, viết liền không dấu)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="crv-form-group">
            <label htmlFor="name">Tên / Mô tả Voucher <span className="crv-required">*</span></label>
            <input 
              type="text" 
              id="name"
              placeholder="Ví dụ: Khuyến mãi mừng ngày Quốc tế Thiếu nhi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="crv-form-row">
            <div className="crv-form-group col-half">
              <label htmlFor="discountType">Loại giảm giá <span className="crv-required">*</span></label>
              <select 
                id="discountType" 
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value);
                  setDiscountValue("");
                }}
              >
                <option value="percent">Giảm theo phần trăm (%)</option>
                <option value="amount">Giảm tiền mặt trực tiếp (đ)</option>
              </select>
            </div>

            <div className="crv-form-group col-half">
              <label htmlFor="discountValue">
                Giá trị giảm <span className="crv-required">*</span>
              </label>
              <input 
                type="number" 
                id="discountValue"
                placeholder={discountType === "percent" ? "Ví dụ: 10 (tức là 10%)" : "Ví dụ: 50000 (tức là 50.000đ)"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="crv-form-row">
            <div className="crv-form-group col-half">
              <label htmlFor="limitUses">Số lượt sử dụng tối đa <span className="crv-required">*</span></label>
              <input 
                type="number" 
                id="limitUses"
                placeholder="Ví dụ: 100"
                value={limitUses}
                onChange={(e) => setLimitUses(e.target.value)}
                required
              />
            </div>

            <div className="crv-form-group col-half">
              <label>Trạng thái</label>
              <input 
                type="text" 
                value="Hoạt động (Mặc định)" 
                disabled 
                className="crv-input-disabled"
              />
            </div>
          </div>

          <div className="crv-form-row">
            <div className="crv-form-group col-half">
              <label htmlFor="startDate">Thời gian bắt đầu có hiệu lực</label>
              <input 
                type="datetime-local" 
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="crv-form-group col-half">
              <label htmlFor="endDate">Thời gian hết hạn <span className="crv-required">*</span></label>
              <input 
                type="datetime-local" 
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="crv-actions-row">
            <button 
              type="button" 
              className="crv-cancel-btn" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="crv-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "➕ Tạo Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
