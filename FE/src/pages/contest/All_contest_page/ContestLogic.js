// logic/contestLogic.js

// Hàm tính toán trạng thái dựa vào thời gian thực
export const getRealTimeStatus = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "ended";
};

// Gắn trạng thái thực tế vào danh sách cuộc thi
export const getContestsWithStatus = (contests) => {
  return contests.map((contest) => ({
    ...contest,
    realStatus: getRealTimeStatus(contest.startTime, contest.endTime),
  }));
};

// Lọc và sắp xếp danh sách cuộc thi
export const filterAndSortContests = (contestsWithRealStatus, activeFilter) => {
  // 1. Lọc dựa trên bộ lọc đang chọn
  const filteredContests = contestsWithRealStatus.filter((contest) => {
    if (activeFilter === "all") return true;
    return contest.realStatus === activeFilter;
  });

  // 2. Sắp xếp theo thứ tự Đang diễn ra (1) -> Sắp diễn ra (2) -> Đã kết thúc (3)
  const sortedContests = [...filteredContests].sort((a, b) => {
    const priority = {
      ongoing: 1,
      upcoming: 2,
      ended: 3,
    };
    return priority[a.realStatus] - priority[b.realStatus];
  });

  return sortedContests;
};

// Hàm lấy class CSS dựa trên trạng thái
export const getStatusClass = (status) => {
  switch (status) {
    case "upcoming":
      return "status-upcoming";
    case "ongoing":
      return "status-ongoing";
    case "ended":
      return "status-ended";
    default:
      return "";
  }
};

// Hàm lấy text hiển thị dựa trên trạng thái
export const getStatusText = (status) => {
  switch (status) {
    case "upcoming":
      return "Sắp diễn ra";
    case "ongoing":
      return "Đang diễn ra";
    case "ended":
      return "Đã kết thúc";
    default:
      return "";
  }
};
