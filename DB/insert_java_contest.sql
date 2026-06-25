-- ============================================================
-- SQL Script: Thêm dữ liệu cuộc thi "Lập trình Java" vào CSDL
-- ============================================================

-- Dọn dẹp dữ liệu cũ (nếu có) để tránh trùng lặp
DELETE FROM contests WHERE title = 'Lập trình Java';

-- 1. Thêm cuộc thi (contests)
INSERT INTO contests (
    title, short_desc, description, image, banner, topic,
    start_time, end_time, duration, max_attempts, passing_score,
    password, participants, level, prize_1, prize_2, prize_3, ranking_policy
)
VALUES (
    'Lập trình Java',
    'Cuộc thi đánh giá năng lực lập trình Java nền tảng bao gồm cú pháp cơ bản, biến, cấu trúc điều khiển, mảng, phương thức và OOP.',
    'Cuộc thi Kiến thức Lập trình Java là sân chơi học thuật dành cho những người yêu thích lập trình và công nghệ. Thí sinh sẽ tham gia trả lời các câu hỏi trắc nghiệm về ngôn ngữ Java, bao gồm kiến thức cơ bản, biến, kiểu dữ liệu, toán tử, cấu trúc điều khiển, mảng, phương thức và lập trình hướng đối tượng (OOP). Cuộc thi giúp người tham gia củng cố kiến thức, đánh giá năng lực và phát triển tư duy lập trình một cách hiệu quả. ☕🚀🏆',
    'assets/images/bg_contest.png',
    'assets/images/bg_contest.png',
    'Lập trình',
    '2026-06-26 00:00:00',
    '2026-08-26 00:00:00',
    25,
    3,
    50,
    NULL,
    0,
    'Trung bình',
    '1.000.000đ',
    '500.000đ',
    '300.000đ',
    'realtime'
);

SET @contest_id = LAST_INSERT_ID();

-- Thêm bài thi Phần 1: Cơ bản & Kiểu dữ liệu
INSERT INTO contest_exams (contest_id, title, `order`) VALUES (@contest_id, 'Phần 1: Cơ bản & Kiểu dữ liệu', 1);
SET @exam_ex1_id = LAST_INSERT_ID();

-- Thêm câu hỏi cho bài thi Phần 1: Cơ bản & Kiểu dữ liệu
INSERT INTO contest_questions (contest_id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, points) VALUES
(@contest_id, @exam_ex1_id, 'Java là ngôn ngữ lập trình thuộc loại nào?', 'Hướng đối tượng', 'Hướng thủ tục', 'Hướng cấu trúc', 'Hướng dữ liệu', 0, 1),
(@contest_id, @exam_ex1_id, 'Java được phát triển bởi ai?', 'Microsoft', 'Sun Microsystems', 'Google', 'IBM', 1, 1),
(@contest_id, @exam_ex1_id, 'Từ khóa dùng để khai báo lớp trong Java là gì?', 'object', 'class', 'method', 'public', 1, 1),
(@contest_id, @exam_ex1_id, 'Phương thức nào là điểm bắt đầu thực thi chương trình Java?', 'start()', 'run()', 'main()', 'execute()', 2, 1),
(@contest_id, @exam_ex1_id, 'JDK là viết tắt của?', 'Java Development Kit', 'Java Design Kit', 'Java Document Kit', 'Java Data Kit', 0, 1),
(@contest_id, @exam_ex1_id, 'Kiểu dữ liệu nào dùng để lưu số nguyên?', 'double', 'float', 'int', 'char', 2, 1),
(@contest_id, @exam_ex1_id, 'Kiểu dữ liệu nào dùng để lưu ký tự?', 'String', 'char', 'text', 'character', 1, 1),
(@contest_id, @exam_ex1_id, 'Kiểu dữ liệu boolean có các giá trị nào?', '0 và 1', 'Yes và No', 'True và False', 'true và false', 3, 1),
(@contest_id, @exam_ex1_id, 'Từ khóa khai báo hằng số là?', 'const', 'static', 'final', 'fixed', 2, 1),
(@contest_id, @exam_ex1_id, 'Kiểu dữ liệu nào dùng để lưu chuỗi ký tự?', 'char', 'text', 'String', 'string', 2, 1);

-- Thêm bài thi Phần 2: Phép toán & Cấu trúc điều khiển
INSERT INTO contest_exams (contest_id, title, `order`) VALUES (@contest_id, 'Phần 2: Phép toán & Cấu trúc điều khiển', 2);
SET @exam_ex2_id = LAST_INSERT_ID();

-- Thêm câu hỏi cho bài thi Phần 2: Phép toán & Cấu trúc điều khiển
INSERT INTO contest_questions (contest_id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, points) VALUES
(@contest_id, @exam_ex2_id, 'Toán tử lấy phần dư là?', '/', '%', '*', '//', 1, 1),
(@contest_id, @exam_ex2_id, 'Kết quả của 10 / 3 với kiểu int là?', '3.33', '3', '4', '3.0', 1, 1),
(@contest_id, @exam_ex2_id, 'Toán tử tăng giá trị lên 1 đơn vị là?', '+=', '++', '--', '==', 1, 1),
(@contest_id, @exam_ex2_id, 'Toán tử so sánh bằng là?', '=', '===', '==', '!=', 2, 1),
(@contest_id, @exam_ex2_id, 'Toán tử AND trong Java là?', '&', '&&', 'AND', '||', 1, 1),
(@contest_id, @exam_ex2_id, 'Câu lệnh điều kiện trong Java là?', 'if', 'check', 'when', 'select', 0, 1),
(@contest_id, @exam_ex2_id, 'Câu lệnh nào dùng để lựa chọn nhiều trường hợp?', 'if', 'else', 'switch', 'loop', 2, 1),
(@contest_id, @exam_ex2_id, 'Vòng lặp nào biết trước số lần lặp?', 'while', 'do-while', 'for', 'foreach', 2, 1),
(@contest_id, @exam_ex2_id, 'Vòng lặp nào luôn thực hiện ít nhất một lần?', 'for', 'while', 'do-while', 'foreach', 2, 1),
(@contest_id, @exam_ex2_id, 'Từ khóa dùng để thoát khỏi vòng lặp?', 'continue', 'stop', 'return', 'break', 3, 1);

-- Thêm bài thi Phần 3: Mảng, Phương thức & OOP
INSERT INTO contest_exams (contest_id, title, `order`) VALUES (@contest_id, 'Phần 3: Mảng, Phương thức & OOP', 3);
SET @exam_ex3_id = LAST_INSERT_ID();

-- Thêm câu hỏi cho bài thi Phần 3: Mảng, Phương thức & OOP
INSERT INTO contest_questions (contest_id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, points) VALUES
(@contest_id, @exam_ex3_id, 'Chỉ số đầu tiên của mảng là?', '0', '1', '-1', 'Tùy trường hợp', 0, 1),
(@contest_id, @exam_ex3_id, 'Thuộc tính lấy độ dài mảng là?', 'size', 'length', 'count', 'getLength', 1, 1),
(@contest_id, @exam_ex3_id, 'Từ khóa dùng để trả về giá trị trong phương thức?', 'break', 'continue', 'return', 'yield', 2, 1),
(@contest_id, @exam_ex3_id, 'Một phương thức không trả về giá trị có kiểu?', 'null', 'empty', 'void', 'static', 2, 1),
(@contest_id, @exam_ex3_id, 'Tham số của phương thức được khai báo ở đâu?', 'Trong thân phương thức', 'Sau dấu ;', 'Trong dấu ngoặc ()', 'Trong class', 2, 1),
(@contest_id, @exam_ex3_id, 'OOP là viết tắt của?', 'Object Oriented Programming', 'Object Organized Program', 'Oriented Object Process', 'Object Output Program', 0, 1),
(@contest_id, @exam_ex3_id, 'Đối tượng được tạo từ?', 'Method', 'Variable', 'Class', 'Package', 2, 1),
(@contest_id, @exam_ex3_id, 'Từ khóa tạo đối tượng là?', 'create', 'object', 'make', 'new', 3, 1),
(@contest_id, @exam_ex3_id, 'Tính đóng gói trong OOP là?', 'Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 0, 1),
(@contest_id, @exam_ex3_id, 'Tính kế thừa trong Java sử dụng từ khóa?', 'implements', 'extends', 'inherit', 'super', 1, 1);
