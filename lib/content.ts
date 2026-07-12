// Nội dung nghiệp vụ của trang — theo project-brief.md (Phần A).
// Mọi chỉnh sửa giá/tên gói/nội dung nên sửa ở đây, không rải rác trong component.

export const site = {
  brand: "Phễu Khách Tài Chính",
  tagline: "Khóa 6 tuần · Dành cho người làm nghề",
  zaloNumber: "0964938167",
  zaloLink: "https://zalo.me/0964938167",
};

export const hero = {
  badge: "🔥 Khai giảng Khóa 1 — số lượng có hạn",
  h1: "6 tuần nữa, khách lạ tự nhắn tin cho bạn — không vét danh bạ, không gọi làm phiền ai.",
  sub: "Rời khóa với một phễu đang chạy thật: tối thiểu 20 khách mới không phải người quen trong Zalo, bộ kịch bản chat của riêng bạn, và những đơn đầu tiên đến từ người lạ.",
  positioning:
    "Mọi khóa sales dạy bạn nói gì khi ĐÃ có khách trước mặt. Khóa này giải quyết chuyện xảy ra trước đó: làm sao để ngày nào cũng có khách MỚI tìm đến bạn.",
  stats: [
    { value: "6", label: "Tuần đào tạo" },
    { value: "25", label: "Suất khóa 1" },
    { value: "20+", label: "Khách mới mỗi học viên" },
    { value: "1.290K", label: "Học phí khóa 1" },
  ],
};

export const packages = [
  {
    id: "khoa-1",
    name: "Khóa 1",
    description: "6 buổi Zoom trực tiếp + chấm bài từng người, từng tuần.",
    price: "1.290.000đ",
    oldPrice: "1.790.000đ",
    priceNote: "Giá chịu rủi ro khóa đầu — từ khóa 2 trở đi là 1.790.000đ",
    seats: "25 suất",
    highlight: true,
    benefits: [
      "6 buổi Zoom trực tiếp 90 phút (bản ghi giữ 6 tháng)",
      "Bộ 12 template cầm tay (kịch bản chat, xử lý từ chối, checklist lọc hồ sơ...)",
      "Chấm bài từng người, từng tuần + 2 buổi office-hours + Q&A 60 ngày sau tốt nghiệp",
      "Bài học lọc hồ sơ trước khi gửi link — tránh chốt khách mà hoa hồng bằng 0",
      "Hoàn tiền 100% nếu học hết buổi 2 thấy không đáng tiền",
    ],
  },
];

export const whyChoose = [
  {
    icon: "🎥",
    title: "6 buổi Zoom trực chiến",
    desc: "Không lý thuyết suông — mỗi tuần dựng xong một bộ phận của phễu thật.",
  },
  {
    icon: "📋",
    title: "Bộ 12 template cầm tay",
    desc: "Kịch bản chat, xử lý từ chối, checklist lọc hồ sơ — dùng được ngay không cần tự soạn.",
  },
  {
    icon: "✍️",
    title: "Chấm bài từng người, từng tuần",
    desc: "Sĩ số chốt 25 để đọc log chat thật và sửa tận tay, không dạy đại trà rồi bỏ mặc.",
  },
  {
    icon: "🔍",
    title: "Bài học lọc hồ sơ trước khi gửi link",
    desc: "Tránh cảnh chốt được khách mà hoa hồng bằng 0 vì hồ sơ rớt duyệt.",
  },
];

export const timeline = [
  {
    step: 1,
    time: "Tuần 1",
    title: "Định vị & chọn sân đấu",
    tags: ["Định vị", "Chọn ngách"],
  },
  {
    step: 2,
    time: "Tuần 2",
    title: "Dựng group + bộ content 6–3–1",
    tags: ["Group", "Content"],
  },
  {
    step: 3,
    time: "Tuần 3",
    title: "Kịch bản chat 4 nhịp",
    tags: ["Kịch bản chat"],
  },
  {
    step: 4,
    time: "Tuần 4",
    title: "Lọc hồ sơ & xin giới thiệu",
    tags: ["Lọc hồ sơ", "Giới thiệu"],
  },
  {
    step: 5,
    time: "Tuần 5",
    title: "Bán chéo & đo số",
    tags: ["Bán chéo", "Đo lường"],
  },
  {
    step: 6,
    time: "Tuần 6",
    title: "Lên hệ thống + Lễ khai phễu tốt nghiệp",
    tags: ["Hệ thống", "Tốt nghiệp"],
  },
];

export const instructor = {
  name: "Bùi Văn Thành",
  title: "Chuyên gia Tài chính · Người sáng lập Phễu Khách Tài Chính",
  badges: ["Chuyên Gia Tư Vấn Tài Chính"],
  bio: "Là người hướng dẫn tài chính có kinh nghiệm thực chiến cùng nhiều kết quả kinh doanh nổi bật. Anh chia sẻ những phương pháp quản lý tài chính và phát triển thu nhập dựa trên trải nghiệm thực tế, hướng đến tính ứng dụng cao thay vì lý thuyết.",
  photo: "/assets/team/bui-van-thanh.jpg",
  stats: [
    { value: "10 năm", label: "Kinh nghiệm bán lẻ & telesale" },
    { value: "1000+", label: "Hợp đồng tư vấn & chốt sale" },
    { value: "5+", label: "Ngách tài chính đã triển khai phễu" },
  ],
};

export const policies = [
  {
    icon: "💳",
    text: "Học hết buổi 2 mà thấy không đáng tiền — hoàn 100%, không hỏi lý do, giữ luôn tài liệu đã nhận.",
  },
  {
    icon: "🤝",
    text: "Không hứa bạn kiếm được bao nhiêu tiền — chỉ cam kết thứ tôi kiểm soát được: hệ thống, template, và việc chấm bài từng tuần.",
  },
  {
    icon: "🔎",
    text: "Minh bạch cách kiếm tiền từ khóa này: học phí của bạn, và hoa hồng hệ thống nếu bạn tự nguyện vào đội nhóm sau này.",
  },
];

// Chưa có testimonial thật — để trống theo project-brief.md mục A.3.13.
// Khi có phản hồi học viên thật, thêm vào mảng này (ảnh + trích dẫn + tên + khóa/lớp).
export const testimonials: {
  quote: string;
  name: string;
  cohort: string;
  photo?: string;
}[] = [];

export const faq = [
  {
    q: "Tôi mới vào nghề / bán sản phẩm khác với ví dụ trong khóa, có học được không?",
    a: "Được — hệ thống phễu + chat áp dụng cho mọi sản phẩm tài chính vùng sạch (bảo hiểm, thẻ, tài khoản, chứng khoán...). Buổi 1 bạn chọn đúng sản phẩm và tệp của mình, các buổi sau mọi template đều cá nhân hóa theo lựa chọn đó.",
  },
  {
    q: "Bận đi làm, một tuần cần bao nhiêu thời gian?",
    a: "1 buổi Zoom 90 phút (có bản ghi nếu lỡ) + khoảng 60–90 phút/ngày cho bài tập thực chiến (đăng bài, chat với khách).",
  },
  {
    q: "Nếu học xong mà không ra khách thì sao?",
    a: "Tiêu chí tốt nghiệp là con số thật (20 khách mới + đơn từ khách lạ) và tôi chấm bài từng tuần để bạn không đi lệch. Có cam kết hoàn 100% sau buổi 2 để bạn thử với rủi ro bằng 0.",
  },
];
