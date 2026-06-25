import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import { useAuth } from '../../services/AuthContext';
import { getCart, removeFromCart, clearCart } from '../../services/cartService';
import { applyVoucher, recordVoucherUse } from '../../services/voucherService';
import './CheckoutPage.css';


/* ============================================================
   CHECKOUTPAGE - Trang Giỏ hàng và Thanh toán
   ============================================================ */

const formatImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
    return img;
  }
  return `http://localhost:8000/${img}`;
};

const getCourseThumbnailMeta = (course) => {
  const category = (course.category || '').toLowerCase();
  if (category.includes('python')) {
    return {
      gradient: 'linear-gradient(135deg, #0d1e3d 0%, #173b75 100%)',
      badgeText: 'Python',
      icon: '🐍'
    };
  } else if (category.includes('sql') || category.includes('database') || category.includes('dữ liệu')) {
    return {
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      badgeText: 'SQL / Data',
      icon: '🛢️'
    };
  } else {
    return {
      gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
      badgeText: course.category || 'EduPro',
      icon: '🎓'
    };
  }
};

function CheckoutPage() {
  const { user, openModal } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code: string, rate: number }
  const [promoError, setPromoError] = useState('');
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentRefCode, setPaymentRefCode] = useState('');

  // Fetch real cart items from DB
  const fetchCartItems = async () => {
    if (user && user.email) {
      setLoading(true);
      const items = await getCart(user.email);
      
      const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        const cleanStr = priceStr.toString().replace(/[^\d]/g, '');
        return parseInt(cleanStr, 10) || 0;
      };

      const mapped = items.map(item => {
        const thumbMeta = getCourseThumbnailMeta(item);
        // Nếu giá gốc bằng 0 hoặc không có, lấy giá khuyến mãi làm giá gốc
        const priceOldParsed = parsePrice(item.price_old);
        const priceCurrentParsed = parsePrice(item.price_discount);
        
        return {
          id: item.id,
          title: item.title,
          instructor: item.instructor || 'Giảng viên EduPro',
          rating: item.rating || 0.0,
          reviews: item.reviewCount || 0,
          students: item.studentCount || 0,
          priceOld: priceOldParsed > 0 ? priceOldParsed : priceCurrentParsed,
          priceCurrent: priceCurrentParsed,
          gradient: thumbMeta.gradient,
          badgeText: thumbMeta.badgeText,
          icon: thumbMeta.icon,
          image: item.image,
          selected: true,
        };
      });
      setCartItems(mapped);
      setLoading(false);
    } else {
      setCartItems([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // Polling to check if payment is confirmed
  useEffect(() => {
    if (!showQRModal || !paymentRefCode) return;

    let intervalId = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/payment/check/${paymentRefCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.paid) {
            clearInterval(intervalId);
            // Clear cart from DB
            if (user && user.email) {
              await clearCart(user.email);
            }
            // Use voucher in DB if applied
            if (appliedPromo) {
              try {
                await recordVoucherUse(appliedPromo.code);
              } catch (vErr) {
                console.error("Lỗi sử dụng voucher:", vErr);
              }
            }
            setShowQRModal(false);
            setCheckoutDone(true);
          }
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái thanh toán:", err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [showQRModal, paymentRefCode, user, appliedPromo]);




  // Toggle selection
  const handleToggleItem = (id) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  const handleToggleAll = () => {
    const targetState = !isAllSelected;
    setCartItems(prev => prev.map(item => ({ ...item, selected: targetState })));
  };

  // Delete individual item
  const handleDeleteItem = async (id) => {
    if (user && user.email) {
      await removeFromCart(user.email, id);
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Delete all selected items
  const handleDeleteSelected = async () => {
    if (user && user.email) {
      for (const item of selectedItems) {
        await removeFromCart(user.email, item.id);
      }
      setCartItems(prev => prev.filter(item => !item.selected));
    } else {
      setCartItems(prev => prev.filter(item => !item.selected));
    }
  };

  // Apply promo code logic
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    if (!promoCode.trim()) return;

    try {
      const code = promoCode.toUpperCase().trim();
      const data = await applyVoucher(code, user.email);
      setAppliedPromo({
        code: data.code,
        name: data.name,
        discountType: data.discount_type,
        discountValue: data.discount_value
      });
    } catch (err) {
      setPromoError(err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      setAppliedPromo(null);
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  // Calculations
  const totalOldPrice = selectedItems.reduce((sum, item) => sum + item.priceOld, 0);
  const totalCurrentPrice = selectedItems.reduce((sum, item) => sum + item.priceCurrent, 0);
  const baseDiscount = totalOldPrice - totalCurrentPrice;
  const promoDiscount = appliedPromo 
    ? (appliedPromo.discountType === 'percent' 
        ? Math.floor(totalCurrentPrice * (appliedPromo.discountValue / 100))
        : Math.min(appliedPromo.discountValue, totalCurrentPrice))
    : 0;
  const finalTotal = totalCurrentPrice - promoDiscount;
  const totalSavings = baseDiscount + promoDiscount;


  // Handle proceed to checkout
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 khóa học để thanh toán.');
      return;
    }
    
    // Tạo mã nội dung chuyển khoản ngẫu nhiên (6 chữ số)
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      const response = await fetch('http://localhost:8000/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          ref_code: randomCode
        })
      });
      if (!response.ok) {
        throw new Error('Không thể khởi tạo giao dịch trên hệ thống');
      }
    } catch (err) {
      console.error("Lỗi đăng ký giao dịch chờ:", err);
    }
    
    setPaymentRefCode(randomCode);
    setShowQRModal(true);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="checkout-container">
          <div className="empty-cart-card">
            <div className="empty-cart-icon">🔒</div>
            <p>Vui lòng đăng nhập để xem giỏ hàng của bạn.</p>
            <button onClick={() => openModal('login')} className="empty-cart-btn" style={{ border: 'none', cursor: 'pointer' }}>
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
      
      <div className="checkout-container">
        {showQRModal ? (
          <div className="checkout-qr-card">
            <div className="qr-header">
              <h2>Thanh toán qua QR Code Ngân hàng (VietQR)</h2>
              <p>Mở ứng dụng ngân hàng quét mã bên dưới để kích hoạt khóa học tự động.</p>
            </div>
            
            <div className="qr-body-grid">
              {/* Cột trái: Ảnh QR */}
              <div className="qr-image-column">
                <div className="qr-image-wrapper">
                  <img 
                    src={`https://api.vietqr.io/image/BIDV-96247UCTCN-vietqr.png?amount=${finalTotal}&addInfo=EDUPRO%20${paymentRefCode}`} 
                    alt="VietQR Code" 
                    className="qr-img"
                  />
                  <div className="qr-scan-guide">
                    <span>Quét để thanh toán</span>
                  </div>
                </div>
                <div className="qr-timer-pulse">
                  <div className="pulse-dot"></div>
                  <span>Đang chờ hệ thống ghi nhận chuyển khoản tự động...</span>
                </div>
              </div>

              {/* Cột phải: Thông tin chi tiết */}
              <div className="qr-info-column">
                <div className="qr-info-item">
                  <span className="qr-label">Ngân hàng</span>
                  <div className="qr-value-group">
                    <strong className="qr-value">BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam)</strong>
                  </div>
                </div>
                
                <div className="qr-info-item">
                  <span className="qr-label">Số tài khoản ảo (VA)</span>
                  <div className="qr-value-group">
                    <strong className="qr-value">96247UCTCN</strong>
                  </div>
                </div>

                <div className="qr-info-item">
                  <span className="qr-label">Chủ tài khoản</span>
                  <div className="qr-value-group">
                    <strong className="qr-value">NGUYEN HOANG</strong>
                  </div>
                </div>

                <div className="qr-info-item">
                  <span className="qr-label">Số tiền</span>
                  <div className="qr-value-group">
                    <strong className="qr-value-amount">{finalTotal.toLocaleString()}đ</strong>
                  </div>
                </div>

                <div className="qr-info-item highlight-item">
                  <span className="qr-label">Nội dung chuyển khoản (Bắt buộc chính xác)</span>
                  <div className="qr-value-group">
                    <strong className="qr-value-code">EDUPRO {paymentRefCode}</strong>
                  </div>
                  <p className="qr-warning-note">⚠️ Quý khách vui lòng giữ nguyên nội dung chuyển khoản để hệ thống kích hoạt khóa học tự động trong 3 giây.</p>
                </div>
              </div>
            </div>

            <div className="qr-actions" style={{ justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  setShowQRModal(false);
                  setPaymentRefCode('');
                }} 
                className="success-btn success-btn-secondary"
                style={{ width: '100%', maxWidth: '300px' }}
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        ) : checkoutDone ? (
          <div className="checkout-success-card">
            <div className="success-icon">🎉</div>
            <h2>Đăng ký khóa học thành công!</h2>
            <p>
              Cảm ơn bạn đã tham gia khóa học tại EduPro. Hệ thống đã kích hoạt quyền truy cập học tập trực tuyến cho bạn.
            </p>
            <div className="success-actions">
              <Link to="/courses" className="success-btn success-btn-primary">
                Đến trang khóa học
              </Link>
              <button 
                onClick={() => {
                  setCartItems([]);
                  setCheckoutDone(false);
                  setAppliedPromo(null);
                  setPromoCode('');
                }} 
                className="success-btn success-btn-secondary"
              >
                Về giỏ hàng
              </button>
            </div>
          </div>
        ) : (
          <div className="checkout-grid">
            {/* Cột trái: Danh sách giỏ hàng */}
            <div className="checkout-main">
              <div className="cart-header">
                <h1 className="cart-title">Giỏ hàng</h1>
                <p className="cart-subtitle">
                  Bạn đang có <span className="highlight">{cartItems.length}</span> khóa học trong giỏ hàng
                </p>
              </div>

              {loading ? (
                <div className="empty-cart-card">
                  <p>Đang tải giỏ hàng của bạn...</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="empty-cart-card">
                  <div className="empty-cart-icon">🛒</div>
                  <p>Giỏ hàng của bạn đang trống.</p>
                  <Link to="/courses" className="empty-cart-btn">
                    Khám phá khóa học ngay
                  </Link>
                </div>
              ) : (
                <>
                  {/* Thanh chọn tất cả */}
                  <div className="cart-controls">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={isAllSelected} 
                        onChange={handleToggleAll} 
                      />
                      <span className="checkmark" />
                      <span className="checkbox-label">
                        Chọn tất cả ({cartItems.length})
                      </span>
                    </label>
                    
                    {selectedItems.length > 0 && (
                      <button 
                        onClick={handleDeleteSelected} 
                        className="delete-selected-btn"
                      >
                        🗑️ Xóa đã chọn
                      </button>
                    )}
                  </div>

                  {/* Danh sách khóa học */}
                  <div className="cart-items-list">
                    {cartItems.map(item => (
                      <div key={item.id} className={`cart-item-row ${item.selected ? 'selected' : ''}`}>
                        {/* Checkbox chọn */}
                        <div className="item-checkbox">
                          <label className="checkbox-container">
                            <input 
                              type="checkbox" 
                              checked={item.selected} 
                              onChange={() => handleToggleItem(item.id)} 
                            />
                            <span className="checkmark" />
                          </label>
                        </div>

                        {/* Thumbnail */}
                        <div className="item-thumb-wrapper" style={{ background: item.image ? 'none' : item.gradient }}>
                          {item.image ? (
                            <img src={formatImageUrl(item.image)} alt={item.title} className="item-thumb-img" />
                          ) : (
                            <>
                              <div className="item-thumb-badge">{item.badgeText}</div>
                              <div className="item-thumb-icon">{item.icon}</div>
                            </>
                          )}
                        </div>

                        {/* Thông tin khóa học */}
                        <div className="item-info">
                          <h3 className="item-title">{item.title}</h3>
                          <div className="item-instructor">Giảng viên: {item.instructor}</div>
                          <div className="item-meta">
                            <span className="item-rating">⭐ {parseFloat(item.rating) === 0 ? "Chưa có" : item.rating}</span>
                            {parseFloat(item.rating) > 0 && item.reviews > 0 && (
                              <span className="item-reviews">({item.reviews} đánh giá)</span>
                            )}
                            <span className="meta-divider">|</span>
                            <span className="item-students">👤 {item.students.toLocaleString()} học viên</span>
                          </div>
                        </div>

                        {/* Giá tiền */}
                        <div className="item-pricing">
                          <div className="current-price">{item.priceCurrent.toLocaleString()}đ</div>
                          {item.priceOld > item.priceCurrent && (
                            <>
                              <div className="old-price">{item.priceOld.toLocaleString()}đ</div>
                              <div className="savings-badge">
                                Tiết kiệm {(item.priceOld - item.priceCurrent).toLocaleString()}đ
                              </div>
                            </>
                          )}
                        </div>

                        {/* Nút hành động đơn lẻ */}
                        <div className="item-actions">
                          <button 
                            onClick={() => handleDeleteItem(item.id)} 
                            className="action-btn remove-btn" 
                            title="Xóa"
                          >
                            <svg viewBox="0 0 24 24" fill="none" className="item-remove-icon-svg" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 7L18.1327 19.1422C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1422L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cột phải: Tổng đơn hàng */}
            <div className="checkout-sidebar">
              <div className="summary-card">
                <h2 className="summary-title">Tổng đơn hàng</h2>
                
                <div className="summary-row">
                  <span>Tạm tính ({selectedItems.length} khóa học)</span>
                  <span className="price-val">{totalOldPrice.toLocaleString()}đ</span>
                </div>
                
                <div className="summary-row saving-row">
                  <span>Giảm giá</span>
                  <span className="price-val discount-val">-{totalSavings.toLocaleString()}đ</span>
                </div>

                {appliedPromo && (
                  <div className="summary-row promo-row">
                    <span>Mã {appliedPromo.code} ({appliedPromo.rate * 100}%)</span>
                    <button onClick={handleRemovePromo} className="remove-promo-btn" title="Hủy mã">
                      ✕
                    </button>
                  </div>
                )}

                <div className="summary-divider" />

                <div className="summary-total-row">
                  <div className="total-label">Tổng thanh toán</div>
                  <div className="total-price-group">
                    <div className="total-price">{finalTotal.toLocaleString()}đ</div>
                    {totalSavings > 0 && (
                      <div className="savings-note">Đã tiết kiệm {totalSavings.toLocaleString()}đ</div>
                    )}
                  </div>
                </div>

                {/* Ô nhập mã giảm giá */}
                <form onSubmit={handleApplyPromo} className="promo-form">
                  <label className="promo-label">
                    🏷️ Mã giảm giá
                  </label>
                  <div className="promo-input-group">
                    <input 
                      type="text" 
                      placeholder="Nhập mã giảm giá" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={!!appliedPromo}
                    />
                    {appliedPromo ? (
                      <button type="button" onClick={handleRemovePromo} className="promo-btn promo-btn-remove">
                        Hủy
                      </button>
                    ) : (
                      <button type="submit" className="promo-btn">
                        Áp dụng
                      </button>
                    )}
                  </div>
                  {promoError && <p className="promo-error">{promoError}</p>}
                  {appliedPromo && (
                    <p className="promo-success">
                      Áp dụng mã thành công! Bạn được giảm thêm {appliedPromo.rate * 100}%.
                    </p>
                  )}
                </form>

                {/* Nút thanh toán */}
                <button 
                  onClick={handleCheckout} 
                  className={`checkout-btn ${selectedItems.length === 0 ? 'disabled' : ''}`}
                  disabled={selectedItems.length === 0}
                >
                  <span className="lock-icon">🔒</span> Tiến hành thanh toán
                </button>
                
                <div className="security-tag">
                  🛡️ Thanh toán 100% an toàn và bảo mật
                </div>

                {/* Các tiêu chí cam kết */}
                <div className="trust-factors">
                  <div className="trust-item">
                    <span className="check-icon">✓</span>
                    <span>Truy cập khóa học ngay sau khi thanh toán</span>
                  </div>
                  <div className="trust-item">
                    <span className="check-icon">✓</span>
                    <span>Học trên mọi thiết bị: Web, iOS, Android</span>
                  </div>
                  <div className="trust-item">
                    <span className="check-icon">✓</span>
                    <span>Hỗ trợ 24/7 trong suốt quá trình học</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
}

export default CheckoutPage;
