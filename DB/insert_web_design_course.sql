-- ============================================================
-- SQL Script: Thêm dữ liệu khóa học "Thiết kế Web" vào CSDL
-- ============================================================

-- Dọn dẹp dữ liệu cũ (nếu có) để tránh trùng lặp slug
DELETE FROM courses WHERE slug = 'thiet-ke-web';

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
    'thiet-ke-web',
    'Lập trình',
    'assets/images/web_design_course.jpg',
    'https://www.youtube.com/embed/VCzjgQhORYk',
    'Thiết kế Web',
    '🚀 Khóa học Thiết kế Web từ TITV cung cấp kiến thức nền tảng vững chắc về HTML, HTML5, CSS và CSS3. Tự tin xây dựng các dự án website cho riêng mình.',
    'Khóa học "Thiết kế Web" do kênh TITV hướng dẫn được thiết kế bài bản, trực quan và dễ hiểu. Nội dung khóa học bao gồm các kiến thức từ những khái niệm cốt lõi nhất về Internet, Website, cho đến việc nắm vững ngôn ngữ đánh dấu HTML (và HTML5) cùng ngôn ngữ định dạng CSS (và CSS3).\n\nTrong suốt quá trình học, học viên sẽ được từng bước làm quen với công cụ lập trình chuyên nghiệp Visual Studio Code, hiểu rõ cấu trúc chuẩn của một trang web, và cách sử dụng linh hoạt các thẻ HTML từ cơ bản đến nâng cao. Khóa học mang tính thực hành cao, giúp học viên có thể lập tức áp dụng kiến thức để bố cục và xây dựng giao diện trang web thực tế.',
    '300.000đ',
    '150.000đ',
    'TITV',
    '6 bài học',
    'Cao cấp',
    5.00,
    0,
    '✅ Hiểu rõ các khái niệm nền tảng về Internet, Website và cách chúng hoạt động.\n✅ Cài đặt và sử dụng thành thạo công cụ lập trình Visual Studio Code cùng các tiện ích mở rộng (như HTML Preview).\n✅ Nắm vững cấu trúc cơ bản của một trang HTML và ý nghĩa của các thẻ (tags) quan trọng.\n✅ Biết cách trình bày, định dạng văn bản và bố cục nội dung trên trang web bằng HTML/HTML5.\n✅ Có nền tảng vững chắc để tiếp tục học sâu hơn về CSS/CSS3 và các kỹ năng Front-end khác.'
);

-- Lấy ID của khóa học Thiết kế Web vừa chèn
SET @course_id = LAST_INSERT_ID();

-- 2. Thêm các chương học (course_chapters)
-- Chương 1
INSERT INTO course_chapters (course_id, title, `order`) VALUES (@course_id, 'Chương 1', 1);
SET @chapter_1_id = LAST_INSERT_ID();

-- Chương 2
INSERT INTO course_chapters (course_id, title, `order`) VALUES (@course_id, 'Chương 2', 2);
SET @chapter_2_id = LAST_INSERT_ID();


-- 3. Thêm các bài học (course_lessons) và câu hỏi tự luận (lesson_exercises)

-- ==========================================
-- CHƯƠNG 1
-- ==========================================

-- Chương 1 - Bài 1
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_1_id,
    'Bài học 1: Hướng dẫn cài đặt Visual Studio Code',
    'video',
    '',
    1,
    'https://www.youtube.com/watch?v=76X5f0pWDn0&list=PLyxSzL3F7484b-CWrbJF7td2zYCkoUYQ6&index=2',
    'Bài học này sẽ hướng dẫn bạn từng bước tải xuống và cài đặt Visual Studio Code (VS Code) – trình soạn thảo mã nguồn (Code Editor) miễn phí, nhẹ và được giới lập trình viên sử dụng phổ biến nhất hiện nay. Học viên sẽ được làm quen với giao diện làm việc, cách mở thư mục dự án và thiết lập môi trường chuẩn bị cho việc viết code HTML.'
);
SET @lesson_1_1_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_1_1_id, 'Visual Studio Code là gì?', 'Visual Studio Code (VS Code) là một trình soạn thảo mã nguồn (Code Editor) miễn phí, mạnh mẽ và phổ biến được phát triển bởi Microsoft, hỗ trợ viết code cho nhiều ngôn ngữ lập trình khác nhau.', 1),
(@lesson_1_1_id, 'Làm thế nào để mở một thư mục dự án trong Visual Studio Code?', 'Để mở một thư mục dự án, bạn chọn File > Open Folder trên thanh công cụ của VS Code, sau đó chọn thư mục lưu trữ dự án của bạn trên máy tính.', 2);


-- Chương 1 - Bài 2
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_1_id,
    'Bài học 2: HTML Preview trong Visual Studio Code',
    'video',
    '',
    2,
    'https://www.youtube.com/watch?v=ghJOygE7gaA&list=PLyxSzL3F7484b-CWrbJF7td2zYCkoUYQ6&index=5',
    'Để quá trình lập trình diễn ra nhanh chóng và trực quan hơn, bài học này sẽ hướng dẫn bạn cách cài đặt các tiện ích mở rộng (Extensions) ngay trong Visual Studio Code, cụ thể là công cụ HTML Preview. Công cụ này cho phép bạn xem ngay lập tức các thay đổi trên giao diện web ngay khi vừa gõ code mà không cần phải liên tục chuyển sang cửa sổ trình duyệt để tải lại trang.'
);
SET @lesson_1_2_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_1_2_id, 'Tiện ích mở rộng (Extensions) trong VS Code dùng để làm gì?', 'Tiện ích mở rộng là các công cụ hoặc tính năng bổ sung cài đặt vào VS Code nhằm hỗ trợ tăng hiệu suất lập trình, cung cấp các tính năng như gợi ý code, xem trước giao diện, định dạng mã nguồn...', 1),
(@lesson_1_2_id, 'HTML Preview giúp ích gì trong quá trình viết code HTML?', 'HTML Preview giúp người lập trình xem trực quan kết quả hiển thị của trang HTML ngay bên cạnh cửa sổ viết code mà không cần mở trình duyệt và tải lại trang thủ công.', 2);


-- ==========================================
-- CHƯƠNG 2
-- ==========================================

-- Chương 2 - Bài 1
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_2_id,
    'Bài học 1: Giới thiệu về Internet và Website',
    'video',
    '',
    1,
    'https://www.youtube.com/watch?v=VCzjgQhORYk&list=PLyxSzL3F7484b-CWrbJF7td2zYCkoUYQ6&index=1',
    'Trong bài học đầu tiên này, chúng ta sẽ làm quen với những khái niệm nền tảng nhất về môi trường web. Học viên sẽ tìm hiểu Internet là gì, Website hoạt động như thế nào, và cần những thành phần cốt lõi nào (như tên miền, hosting, trình duyệt) để một trang web có thể vận hành và đến được với người dùng. Đây là kiến thức cơ sở quan trọng trước khi bắt tay vào lập trình.'
);
SET @lesson_2_1_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_2_1_id, 'Trình bày khái niệm cơ bản về Internet và Website. Nêu sự khác biệt cốt lõi giữa hai khái niệm này.', 'Internet là một hệ thống mạng máy tính toàn cầu kết nối các thiết bị với nhau, cho phép truyền tải dữ liệu và thông tin. Trong khi đó, Website là tập hợp các trang thông tin (web pages) chứa văn bản, hình ảnh, video... được lưu trữ trên một máy chủ (web server) và được truy cập thông qua địa chỉ URL trên mạng Internet.', 1),
(@lesson_2_1_id, 'Trình duyệt web (Web Browser) là gì? Hãy kể tên ít nhất 3 trình duyệt web phổ biến hiện nay.', 'Trình duyệt web là một phần mềm ứng dụng cho phép người dùng truy cập, đọc và tương tác với nội dung của các trang web trên Internet. Các trình duyệt phổ biến hiện nay bao gồm: Google Chrome, Cốc Cốc, Safari, Mozilla Firefox, và Microsoft Edge.', 2);


-- Chương 2 - Bài 2
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_2_id,
    'Bài học 2: Giới thiệu về HTML Hypertext Transfer Protocol',
    'video',
    '',
    2,
    'https://www.youtube.com/watch?v=dfRrepUXx-Q&list=PLyxSzL3F7484b-CWrbJF7td2zYCkoUYQ6&index=3',
    'Chúng ta sẽ chính thức bước vào thế giới lập trình web với HTML (HyperText Markup Language - Ngôn ngữ đánh dấu siêu văn bản). Bài học sẽ giải thích chi tiết HTML là gì, vai trò của nó trong việc cấu trúc nội dung trang web, đồng thời giới thiệu sơ lược về giao thức HTTP (HyperText Transfer Protocol) giúp bạn hiểu rõ cách thức dữ liệu được truyền tải trên mạng.'
);
SET @lesson_2_2_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_2_2_id, 'HTML là viết tắt của cụm từ gì? Vai trò chính của HTML trong việc xây dựng một trang web là gì?', 'HTML là viết tắt của HyperText Markup Language (Ngôn ngữ đánh dấu siêu văn bản). Vai trò chính của HTML là xây dựng bộ khung, cấu trúc và định dạng các thành phần trên trang web (như văn bản, hình ảnh, video, danh sách, liên kết...) để trình duyệt web có thể hiểu và hiển thị chính xác nội dung cho người dùng.', 1),
(@lesson_2_2_id, 'HTML có phải là một ngôn ngữ lập trình (Programming Language) không? Hãy giải thích ngắn gọn lý do.', 'Không, HTML không phải là ngôn ngữ lập trình. Nó là một "ngôn ngữ đánh dấu" (Markup Language). HTML chỉ dùng để miêu tả cấu trúc và cách hiển thị của dữ liệu trên trang web, nó không có khả năng thực hiện các chức năng xử lý logic, tính toán, hay các câu lệnh điều kiện (if/else, vòng lặp) như các ngôn ngữ lập trình thực thụ (ví dụ: Python, JavaScript, C++).', 2);


-- Chương 2 - Bài 3
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_2_id,
    'Bài học 3: Cấu trúc của trang HTML và một số tags cơ bản',
    'video',
    '',
    3,
    'https://www.youtube.com/watch?v=kYJ5x_6l8O4',
    'Bài học này hướng dẫn cấu trúc cơ bản của một tài liệu HTML chuẩn, bao gồm các thẻ bắt buộc như <!DOCTYPE html>, <html>, <head>, <body> và cách sử dụng các thẻ tiêu đề (h1-h6), thẻ đoạn văn (p) để xây dựng trang web.'
);
SET @lesson_2_3_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_2_3_id, 'Cấu trúc của một trang HTML cơ bản gồm những phần nào? Giải thích ngắn gọn nhiệm vụ của từng phần.', 'Một trang HTML cơ bản gồm: 1. <!DOCTYPE html>: Khai báo phiên bản HTML5. 2. <html>: Thẻ cha bao bọc toàn bộ trang web. 3. <head>: Chứa thông tin cấu hình (tiêu đề, bộ mã hóa UTF-8, liên kết CSS/JS). 4. <body>: Chứa tất cả nội dung hiển thị cho người dùng (văn bản, hình ảnh, liên kết...).', 1),
(@lesson_2_3_id, 'Thẻ <head> và thẻ <body> khác nhau như thế nào về mục đích sử dụng?', 'Thẻ <head> dùng để chứa siêu dữ liệu (metadata) của trang web, thông tin cấu hình mà người dùng không nhìn thấy trực tiếp trên trang. Thẻ <body> dùng để chứa toàn bộ nội dung trực quan, các phần tử giao diện hiển thị cho người xem.', 2);


-- Chương 2 - Bài 4
INSERT INTO course_lessons (chapter_id, title, type, duration, `order`, video_url, content)
VALUES (
    @chapter_2_id,
    'Bài học 4: Các thẻ về Text trong HTML',
    'video',
    '',
    4,
    'https://www.youtube.com/watch?v=S21hX54x3oE',
    'Tìm hiểu sâu về nhóm các thẻ định dạng văn bản (text tags) trong HTML bao gồm các thẻ headings, paragraphs, thẻ strong/em để làm nổi bật văn bản, thẻ blockquote để trích dẫn và cách sử dụng thẻ br để xuống dòng.'
);
SET @lesson_2_4_id = LAST_INSERT_ID();

INSERT INTO lesson_exercises (lesson_id, question, answer, `order`) VALUES
(@lesson_2_4_id, 'Thẻ <strong> và thẻ <em> khác thẻ <b> và thẻ <i> như thế nào về mặt ngữ nghĩa?', 'Thẻ <strong> và <em> mang ý nghĩa ngữ nghĩa (semantic importance) biểu thị văn bản cực kỳ quan trọng hoặc cần nhấn mạnh, được các trình đọc màn hình chú ý đặc biệt. Trong khi đó, thẻ <b> (bold) và <i> (italic) chỉ đơn thuần thay đổi hiển thị trực quan (in đậm/in nghiêng) mà không mang ý nghĩa nhấn mạnh ngữ nghĩa.', 1),
(@lesson_2_4_id, 'Làm thế nào để xuống dòng trong một đoạn văn HTML mà không tạo ra khoảng cách lớn giữa hai dòng? Hãy nêu tên thẻ và ví dụ.', 'Sử dụng thẻ tự đóng <br> (Line Break). Ví dụ: <p>Dòng thứ nhất<br>Dòng thứ hai</p>. Trình duyệt sẽ xuống dòng ngay lập tức mà không tạo ra khoảng trống dòng (margin) lớn như thẻ <p>.', 2);
