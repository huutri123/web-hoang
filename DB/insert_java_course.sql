-- ============================================================
-- SQL Script: Thêm dữ liệu khóa học "Lập trình Java" vào CSDL
-- ============================================================

-- 1. Thêm thông tin cơ bản của khóa học
INSERT INTO courses (
    slug, 
    category, 
    image, 
    video, 
    title, 
    description, 
    detailed_description, 
    price_old, 
    price_discount, 
    instructor, 
    duration, 
    level, 
    rating, 
    student_count, 
    goals
)
VALUES (
    'lap-trinh-java',
    'Lập trình',
    'assets/images/java_course.jpg',
    'https://www.youtube.com/embed/ayA1Lz2qEZo',
    'Lập trình Java',
    '🚀 Học Java từ con số 0 đến thành thạo. Làm quen với cú pháp, OOP, cấu trúc dữ liệu và các dự án thực tế để sẵn sàng phát triển phần mềm chuyên nghiệp.',
    'Khóa học Lập trình Java cung cấp kiến thức từ cơ bản đến nâng cao về ngôn ngữ Java. Học viên sẽ được tìm hiểu cú pháp, biến, kiểu dữ liệu, cấu trúc điều khiển, hàm và lập trình hướng đối tượng (OOP). Khóa học kết hợp lý thuyết với thực hành, giúp người học xây dựng nền tảng vững chắc để phát triển ứng dụng Java và tiếp cận các công nghệ nâng cao trong tương lai. 🚀',
    '1.000.000đ',
    '800.000đ',
    'TITV',
    '8 bài học',
    'Trung cấp',
    5.00,
    0,
    '✅ Hiểu được các khái niệm và cú pháp cơ bản của ngôn ngữ Java.\n✅ Nắm vững tư duy lập trình và kỹ năng giải quyết bài toán bằng Java.\n✅ Áp dụng các nguyên lý lập trình hướng đối tượng (OOP) vào xây dựng chương trình.\n✅ Phát triển các ứng dụng Java cơ bản thông qua các bài tập thực hành.\n✅ Xây dựng nền tảng kiến thức để học các công nghệ Java nâng cao và phát triển phần mềm trong tương lai. 🚀'
);

-- Lấy ID của khóa học Lập trình Java vừa chèn
SET @course_id = LAST_INSERT_ID();

-- 2. Thêm các chương học (course_chapters)
-- Chương 1
INSERT INTO course_chapters (course_id, title, `order`) VALUES (@course_id, 'Chương 1', 1);
SET @chapter_1_id = LAST_INSERT_ID();

-- Chương 2
INSERT INTO course_chapters (course_id, title, `order`) VALUES (@course_id, 'Chương 2', 2);
SET @chapter_2_id = LAST_INSERT_ID();

-- Chương 3
INSERT INTO course_chapters (course_id, title, `order`) VALUES (@course_id, 'Chương 3', 3);
SET @chapter_3_id = LAST_INSERT_ID();


-- 3. Thêm các bài học (course_lessons) và câu hỏi tự luận (lesson_exercises)

-- ==========================================
-- CHƯƠNG 1
-- ==========================================

-- Chương 1 - Bài 1
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_1_id,
    'Bài học 1: Cài đặt JDK và Eclipse',
    'video',
    '',
    1,
    'https://youtu.be/ayA1Lz2qEZo?si=JZ5ad02ZyfN4xS7L',
    'Trong bài học này, học viên sẽ được hướng dẫn cài đặt Java Development Kit (JDK) và môi trường phát triển tích hợp Eclipse. Đây là những công cụ cần thiết để viết, biên dịch và chạy các chương trình Java. Sau khi hoàn thành bài học, học viên có thể thiết lập môi trường lập trình Java trên máy tính và sẵn sàng cho các bài học tiếp theo.'
);
SET @lesson_1_1_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_1_1_id, 'JDK là gì?', 'JDK (Java Development Kit) là bộ công cụ dùng để phát triển và chạy các chương trình Java.', 1),
(@lesson_1_1_id, 'Eclipse là gì?', 'Eclipse là một môi trường phát triển tích hợp (IDE) hỗ trợ lập trình Java.', 2);


-- Chương 1 - Bài 2
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_1_id,
    'Bài học 2: Cấu trúc của một lớp Java',
    'video',
    '',
    2,
    'https://youtu.be/6Gbxt2Sox7k?si=5f3DsnX8_0Im6JVh',
    'Bài học giới thiệu cấu trúc cơ bản của một lớp Java, bao gồm khai báo lớp, phương thức main(), các thuộc tính và phương thức. Học viên sẽ hiểu cách tổ chức mã nguồn trong Java và vai trò của từng thành phần trong một chương trình.'
);
SET @lesson_1_2_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_1_2_id, 'Từ khóa dùng để khai báo lớp trong Java là gì?', 'class', 1),
(@lesson_1_2_id, 'Phương thức nào là điểm bắt đầu thực thi của chương trình Java?', 'public static void main(String[] args)', 2);


-- ==========================================
-- CHƯƠNG 2
-- ==========================================

-- Chương 2 - Bài 1
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_2_id,
    'Bài học 1: Cách khai báo biến trong Java',
    'video',
    '',
    1,
    'https://youtu.be/zEbraQ5vIaU?si=xM1N7aV-WUa2Rx-Z',
    'Trong bài học này, học viên sẽ tìm hiểu khái niệm biến, cách khai báo và khởi tạo biến trong Java. Ngoài ra, bài học còn giới thiệu quy tắc đặt tên biến và phạm vi sử dụng của biến trong chương trình.'
);
SET @lesson_2_1_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_2_1_id, 'Biến trong Java là gì?', 'Biến là vùng nhớ dùng để lưu trữ dữ liệu trong chương trình.', 1),
(@lesson_2_1_id, 'Cú pháp khai báo biến trong Java là gì?', 'kiểu_dữ_liệu tên_biến;', 2),
(@lesson_2_1_id, 'Ví dụ khai báo biến số nguyên.', 'int age = 19;', 3);


-- Chương 2 - Bài 2
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_2_id,
    'Bài học 2: Kiểu dữ liệu trong Java',
    'video',
    '',
    2,
    'https://youtu.be/S29I8oXEXf8?si=zq82aR0vZVsVso5G',
    'Bài học giới thiệu các kiểu dữ liệu cơ bản trong Java như int, double, char, boolean và String. Học viên sẽ hiểu cách lựa chọn kiểu dữ liệu phù hợp để lưu trữ và xử lý thông tin trong chương trình.'
);
SET @lesson_2_2_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_2_2_id, 'Kiểu dữ liệu int dùng để lưu trữ gì?', 'Số nguyên.', 1),
(@lesson_2_2_id, 'Kiểu dữ liệu double dùng để lưu trữ gì?', 'Số thực.', 2),
(@lesson_2_2_id, 'Kiểu dữ liệu boolean có những giá trị nào?', 'true và false.', 3),
(@lesson_2_2_id, 'Kiểu dữ liệu dùng để lưu trữ chuỗi ký tự là gì?', 'String.', 4);


-- Chương 2 - Bài 3
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_2_id,
    'Bài học 3: Hằng số trong Java',
    'video',
    '',
    3,
    'https://youtu.be/IrtwjVY18do?si=EqyaGkdaIPVLzwk8',
    'Trong bài học này, học viên sẽ tìm hiểu khái niệm hằng số trong Java và cách khai báo hằng số bằng từ khóa final. Hằng số được sử dụng để lưu trữ các giá trị không thay đổi trong suốt quá trình thực thi chương trình, giúp mã nguồn dễ đọc và dễ bảo trì hơn.'
);
SET @lesson_2_3_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_2_3_id, 'Hằng số trong Java là gì?', 'Hằng số là giá trị không thể thay đổi sau khi được khởi tạo.', 1),
(@lesson_2_3_id, 'Từ khóa nào được dùng để khai báo hằng số trong Java?', 'final', 2),
(@lesson_2_3_id, 'Ví dụ khai báo hằng số PI trong Java.', 'final double PI = 3.14;', 3);


-- Chương 2 - Bài 4
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_2_id,
    'Bài học 4: Cách ghi chú trong Java',
    'video',
    '',
    4,
    'https://youtu.be/jgzgkUbK35M?si=YOllh8frPNjUaxfv',
    'Bài học giới thiệu các loại ghi chú (comment) trong Java. Ghi chú giúp giải thích mã nguồn, tăng khả năng đọc hiểu chương trình và không được trình biên dịch thực thi. Java hỗ trợ ghi chú một dòng, nhiều dòng và ghi chú tài liệu.'
);
SET @lesson_2_4_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_2_4_id, 'Ghi chú trong Java dùng để làm gì?', 'Dùng để giải thích mã nguồn và giúp chương trình dễ hiểu hơn.', 1),
(@lesson_2_4_id, 'Ký hiệu ghi chú một dòng trong Java là gì?', '//', 2),
(@lesson_2_4_id, 'Ký hiệu ghi chú nhiều dòng trong Java là gì?', '/* ... */', 3),
(@lesson_2_4_id, 'Ký hiệu ghi chú tài liệu trong Java là gì?', '/** ... */', 4);


-- ==========================================
-- CHƯƠNG 3
-- ==========================================

-- Chương 3 - Bài 1
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_3_id,
    'Bài học 1: Chuyển đổi dữ liệu trong Java',
    'video',
    '',
    1,
    'https://youtu.be/BwOt3IeeP64?si=uctM_cUy6AF7b-RW',
    'Trong bài học này, học viên sẽ tìm hiểu cách chuyển đổi dữ liệu giữa các kiểu dữ liệu khác nhau trong Java. Nội dung bao gồm ép kiểu tự động (Widening Casting), ép kiểu tường minh (Narrowing Casting) và chuyển đổi giữa chuỗi (String) với các kiểu dữ liệu số. Đây là kỹ năng quan trọng giúp xử lý dữ liệu linh hoạt và tránh các lỗi liên quan đến kiểu dữ liệu trong chương trình.'
);
SET @lesson_3_1_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_3_1_id, 'Chuyển đổi dữ liệu trong Java là gì?', 'Là quá trình chuyển một giá trị từ kiểu dữ liệu này sang kiểu dữ liệu khác.', 1),
(@lesson_3_1_id, 'Có mấy loại ép kiểu trong Java?', 'Có hai loại: ép kiểu tự động (Widening Casting) và ép kiểu tường minh (Narrowing Casting).', 2),
(@lesson_3_1_id, 'Ép kiểu tự động xảy ra khi nào?', 'Khi chuyển từ kiểu dữ liệu có phạm vi nhỏ sang kiểu dữ liệu có phạm vi lớn hơn.', 3),
(@lesson_3_1_id, 'Từ khóa nào được sử dụng để ép kiểu tường minh?', 'Sử dụng cú pháp (kiểu_dữ_liệu) trước giá trị cần chuyển đổi.', 4);


-- Chương 3 - Bài 2
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_3_id,
    'Bài học 2: Các phép toán cơ bản',
    'video',
    '',
    2,
    'https://youtu.be/-F8_zsyfs2I?si=XbOUCEGrFN8RE0_c',
    'Trong bài học này, học viên sẽ tìm hiểu các phép toán cơ bản trong Java, bao gồm phép toán số học, phép toán gán, phép toán so sánh và phép toán logic. Đây là những kiến thức nền tảng giúp thực hiện các phép tính và xử lý điều kiện trong chương trình Java.'
);
SET @lesson_3_2_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_3_2_id, 'Các phép toán số học cơ bản trong Java gồm những phép toán nào?', 'Cộng (+), trừ (-), nhân (*), chia (/), chia lấy dư (%).', 1),
(@lesson_3_2_id, 'Phép toán nào dùng để lấy phần dư của phép chia?', 'Phép toán %.', 2),
(@lesson_3_2_id, 'Phép toán == dùng để làm gì?', 'Dùng để so sánh hai giá trị có bằng nhau hay không.', 3),
(@lesson_3_2_id, 'Phép toán logic AND trong Java được ký hiệu như thế nào?', '&&.', 4);
