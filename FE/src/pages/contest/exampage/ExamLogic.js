// pages/ExamLogic.js

// Danh sách 20 câu hỏi trắc nghiệm mặc định để render UI
export const DEFAULT_QUESTIONS = [
  {
    id: 1,
    text: "Trong Python, module nào được sử dụng để tạo và quản lý các luồng (thread)?",
    options: ["threading", "multiprocessing", "asyncio", "time"],
    correctOption: 0,
    points: 5
  },
  {
    id: 2,
    text: "Từ khóa nào được dùng để khai báo một hàm trong Python?",
    options: ["func", "define", "def", "function"],
    correctOption: 2,
    points: 5
  },
  {
    id: 3,
    text: "Phương thức nào dùng để thêm một phần tử vào cuối list trong Python?",
    options: ["add()", "append()", "insert()", "push()"],
    correctOption: 1,
    points: 5
  },
  {
    id: 4,
    text: "Kết quả của biểu thức '3 * 1 ** 3' trong Python là gì?",
    options: ["27", "9", "3", "1"],
    correctOption: 2,
    points: 5
  },
  {
    id: 5,
    text: "Kiểu dữ liệu nào sau đây là không thể thay đổi (immutable) trong Python?",
    options: ["list", "dict", "set", "tuple"],
    correctOption: 3,
    points: 5
  },
  {
    id: 6,
    text: "Hàm nào dùng để lấy độ dài của một chuỗi hoặc danh sách?",
    options: ["length()", "size()", "len()", "count()"],
    correctOption: 2,
    points: 5
  },
  {
    id: 7,
    text: "Cách nào để bắt đầu một khối lệnh điều kiện trong Python?",
    options: ["if x > 5:", "if x > 5 then", "if (x > 5)", "if x > 5;"],
    correctOption: 0,
    points: 5
  },
  {
    id: 8,
    text: "Lệnh nào dùng để thoát khỏi vòng lặp trong Python?",
    options: ["exit", "break", "continue", "stop"],
    correctOption: 1,
    points: 5
  },
  {
    id: 9,
    text: "Để mở một file ghi dữ liệu dạng văn bản mới (hoặc ghi đè), ta dùng mode nào?",
    options: ["'r'", "'w'", "'a'", "'x'"],
    correctOption: 1,
    points: 5
  },
  {
    id: 10,
    text: "Ký hiệu nào dùng để viết comment trên một dòng đơn trong Python?",
    options: ["//", "/*", "#", "--"],
    correctOption: 2,
    points: 5
  },
  {
    id: 11,
    text: "Kết quả của biểu thức '10 // 3' trong Python là bao nhiêu?",
    options: ["3.333", "3", "1", "0"],
    correctOption: 1,
    points: 5
  },
  {
    id: 12,
    text: "Phương thức nào dùng để loại bỏ khoảng trắng dư thừa ở đầu và cuối chuỗi?",
    options: ["trim()", "strip()", "clean()", "replace()"],
    correctOption: 1,
    points: 5
  },
  {
    id: 13,
    text: "Lớp cha của mọi lớp (class) tự định nghĩa trong Python 3 là gì?",
    options: ["BaseClass", "Super", "object", "type"],
    correctOption: 2,
    points: 5
  },
  {
    id: 14,
    text: "Để import một thư viện dưới một tên bí danh khác, ta sử dụng từ khóa nào?",
    options: ["in", "as", "like", "to"],
    correctOption: 1,
    points: 5
  },
  {
    id: 15,
    text: "Khối lệnh nào dùng để xử lý ngoại lệ trong Python?",
    options: ["try ... except", "try ... catch", "try ... handle", "throw ... catch"],
    correctOption: 0,
    points: 5
  },
  {
    id: 16,
    text: "Để chuyển đổi một chuỗi số thành số nguyên trong Python, ta dùng hàm nào?",
    options: ["str()", "float()", "int()", "parse()"],
    correctOption: 2,
    points: 5
  },
  {
    id: 17,
    text: "Khái niệm OOP nào cho phép một lớp thừa hưởng các thuộc tính từ lớp khác?",
    options: ["Đóng gói", "Đa hình", "Kế thừa", "Trừu tượng"],
    correctOption: 2,
    points: 5
  },
  {
    id: 18,
    text: "Hàm 'range(1, 5)' sẽ sinh ra dãy số nào?",
    options: ["[1, 2, 3, 4, 5]", "[1, 2, 3, 4]", "[2, 3, 4, 5]", "[0, 1, 2, 3, 4]"],
    correctOption: 1,
    points: 5
  },
  {
    id: 19,
    text: "Phương thức nào dùng để đảo ngược thứ tự các phần tử của một list trực tiếp?",
    options: ["reverse()", "inverted()", "flip()", "sort(reverse=True)"],
    correctOption: 0,
    points: 5
  },
  {
    id: 20,
    text: "Trong Python, 'self' đại diện cho đối tượng nào?",
    options: ["Lớp cha", "Lớp con", "Chính thực thể (instance) đang gọi phương thức", "Biến toàn cục"],
    correctOption: 2,
    points: 5
  }
];

// Hàm định dạng thời gian từ giây sang dạng MM:SS hoặc HH:MM:SS
export const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
