-- ============================================================
-- SQL Script: Thêm dữ liệu cuộc thi "Thiết kế Web" vào CSDL
-- ============================================================

-- Dọn dẹp dữ liệu cũ (nếu có) để tránh trùng lặp
DELETE FROM contests WHERE title = 'Thiết kế Web';

-- 1. Thêm cuộc thi (contests)
INSERT INTO contests (
    title, short_desc, description, image, banner, topic,
    start_time, end_time, duration, max_attempts, passing_score,
    password, participants, level, prize_1, prize_2, prize_3, ranking_policy
)
VALUES (
    'Thiết kế Web',
    'Cuộc thi trắc nghiệm kiến thức HTML, CSS, JavaScript nền tảng dành cho lập trình viên.',
    'Cuộc thi Kiến thức Lập trình Web là sân chơi dành cho những người yêu thích công nghệ và phát triển web. Thí sinh sẽ tham gia trả lời các câu hỏi trắc nghiệm về HTML, CSS, JavaScript và các kiến thức web cơ bản. Cuộc thi giúp đánh giá năng lực, củng cố kiến thức và tạo cơ hội học hỏi, giao lưu trong lĩnh vực lập trình web. 🏆💻🚀',
    'assets/images/bg_contest.png',
    'assets/images/bg_contest.png',
    'Lập trình',
    '2026-06-26 00:00:00',
    '2026-08-26 00:00:00',
    15,
    3,
    50,
    NULL,
    0,
    'Dễ',
    '1.000.000đ',
    '500.000đ',
    '300.000đ',
    'realtime'
);

SET @contest_id = LAST_INSERT_ID();

-- Thêm bài thi Phần 1: HTML
INSERT INTO contest_exams (contest_id, title, `order`) VALUES (@contest_id, 'Phần 1: HTML', 1);
SET @exam_html_id = LAST_INSERT_ID();

-- Thêm câu hỏi cho bài thi Phần 1: HTML
INSERT INTO contest_questions (contest_id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, points) VALUES
(@contest_id, @exam_html_id, 'HTML là viết tắt của?', 'Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Tool Markup Language', 'Home Text Markup Language', 0, 1),
(@contest_id, @exam_html_id, 'Thẻ nào tạo tiêu đề cấp 1?', '<title>', '<head>', '<h1>', '<header>', 2, 1),
(@contest_id, @exam_html_id, 'Thẻ nào dùng để chèn ảnh?', '<image>', '<picture>', '<img>', '<src>', 2, 1),
(@contest_id, @exam_html_id, 'Thuộc tính nào chứa đường dẫn ảnh?', 'href', 'alt', 'src', 'link', 2, 1),
(@contest_id, @exam_html_id, 'Thẻ nào dùng để tạo liên kết?', '<link>', '<a>', '<href>', '<url>', 1, 1),
(@contest_id, @exam_html_id, 'Thẻ nào tạo danh sách có thứ tự?', '<ul>', '<li>', '<ol>', '<list>', 2, 1),
(@contest_id, @exam_html_id, 'Thuộc tính alt của thẻ img có tác dụng gì?', 'Đổi kích thước ảnh', 'Mô tả ảnh', 'Đổi màu ảnh', 'Tăng tốc độ tải', 1, 1),
(@contest_id, @exam_html_id, 'Thẻ nào dùng để tạo bảng?', '<tb>', '<table>', '<grid>', '<tab>', 1, 1),
(@contest_id, @exam_html_id, 'Thẻ nào dùng để nhập dữ liệu?', '<data>', '<input>', '<type>', '<textbox>', 1, 1),
(@contest_id, @exam_html_id, 'HTML là ngôn ngữ:', 'Lập trình', 'Đánh dấu', 'Cơ sở dữ liệu', 'Hệ điều hành', 1, 1);

-- Thêm bài thi Phần 2: CSS
INSERT INTO contest_exams (contest_id, title, `order`) VALUES (@contest_id, 'Phần 2: CSS', 2);
SET @exam_css_id = LAST_INSERT_ID();

-- Thêm câu hỏi cho bài thi Phần 2: CSS
INSERT INTO contest_questions (contest_id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, points) VALUES
(@contest_id, @exam_css_id, 'CSS là viết tắt của?', 'Creative Style Sheets', 'Computer Style Sheets', 'Cascading Style Sheets', 'Coding Style Sheets', 2, 1),
(@contest_id, @exam_css_id, 'Thuộc tính nào đổi màu chữ?', 'font-color', 'text-color', 'color', 'foreground', 2, 1),
(@contest_id, @exam_css_id, 'Thuộc tính nào đổi màu nền?', 'color', 'bg-color', 'background', 'background-color', 3, 1),
(@contest_id, @exam_css_id, 'margin dùng để:', 'Khoảng cách bên trong', 'Khoảng cách bên ngoài', 'Tạo viền', 'Căn giữa', 1, 1),
(@contest_id, @exam_css_id, 'padding dùng để:', 'Khoảng cách bên trong', 'Khoảng cách bên ngoài', 'Đổi màu nền', 'Tạo hiệu ứng', 0, 1),
(@contest_id, @exam_css_id, 'Thuộc tính nào làm chữ đậm?', 'font-size', 'font-style', 'font-weight', 'text-bold', 2, 1),
(@contest_id, @exam_css_id, 'Đơn vị nào là tương đối?', 'px', 'cm', 'em', 'mm', 2, 1),
(@contest_id, @exam_css_id, 'display: flex dùng để:', 'Tạo animation', 'Tạo bố cục linh hoạt', 'Tạo bảng', 'Tạo form', 1, 1),
(@contest_id, @exam_css_id, 'Thuộc tính nào bo góc phần tử?', 'border-style', 'border-radius', 'border-width', 'radius', 1, 1),
(@contest_id, @exam_css_id, 'CSS được đặt trong thẻ nào của HTML?', '<script>', '<css>', '<style>', '<design>', 2, 1);

-- Thêm bài thi Phần 3: JavaScript
INSERT INTO contest_exams (contest_id, title, `order`) VALUES (@contest_id, 'Phần 3: JavaScript', 3);
SET @exam_js_id = LAST_INSERT_ID();

-- Thêm câu hỏi cho bài thi Phần 3: JavaScript
INSERT INTO contest_questions (contest_id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, points) VALUES
(@contest_id, @exam_js_id, 'JavaScript là ngôn ngữ:', 'Máy chủ', 'Lập trình web', 'Cơ sở dữ liệu', 'Hệ điều hành', 1, 1),
(@contest_id, @exam_js_id, 'Từ khóa khai báo biến hiện đại là:', 'int', 'var', 'let', 'value', 2, 1),
(@contest_id, @exam_js_id, 'Hàm nào hiển thị hộp thoại?', 'print()', 'alert()', 'show()', 'popup()', 1, 1),
(@contest_id, @exam_js_id, 'Kết quả của typeof 100 là:', 'int', 'float', 'number', 'integer', 2, 1),
(@contest_id, @exam_js_id, 'Ký hiệu chú thích một dòng là:', '/* */', '<!-- -->', '//', '**', 2, 1),
(@contest_id, @exam_js_id, 'Toán tử so sánh bằng giá trị và kiểu dữ liệu là:', '==', '=', '===', '!=', 2, 1),
(@contest_id, @exam_js_id, 'Kết quả của 5 + "5" là:', '10', '55', 'Error', 'undefined', 1, 1),
(@contest_id, @exam_js_id, 'DOM là viết tắt của:', 'Document Object Model', 'Data Object Management', 'Dynamic Object Method', 'Document Operation Mode', 0, 1),
(@contest_id, @exam_js_id, 'Sự kiện click được viết là:', 'onhover', 'onpress', 'onclick', 'onfocus', 2, 1),
(@contest_id, @exam_js_id, 'JavaScript thường được nhúng bằng thẻ:', '<javascript>', '<js>', '<code>', '<script>', 3, 1);
