2. MODULE ORDER
Hệ thống chia làm các đợt (Waves) thực thi phụ thuộc tuyến tính:

Wave 1 — Foundation
Module 01: Core Contracts (Commands, Events, Signals, Contracts, Ownership Definitions). Dependencies: None.
Module 02: State Models (Experience State, Scene State, Transition State, Camera State, Audio State, Memory State, Quality State, Hero State). Dependencies: Module 01.
Module 03: Runtime Registry (Runtime Registration, Module Discovery, Ownership Registration). Dependencies: Module 01, Module 02.

Wave 2 — Runtime Authority
Module 04: Experience Director. Dependencies: Modules 01-03.
Module 05: Event Bus. Dependencies: Modules 01-03.
Module 06: Validation Framework. Dependencies: Modules 01-05.

Wave 3 — Scene Runtime
Module 07: Scene Registry. Dependencies: Modules 01-06.
Module 08: Scene Lifecycle Runtime. Dependencies: Module 07.
Module 09: Scene Recovery Runtime. Dependencies: Module 08.

Wave 4 — Timeline Runtime
Module 10: Timeline Runtime. Dependencies: Modules 07-09.
Module 11: Timeline Synchronization. Dependencies: Module 10.
Module 12: Timeline Validation. Dependencies: Module 11.

Wave 5 — Runtime Subsystems (Parallel Build Allowed)
Module 13: Camera Runtime. Dependencies: Module 12.
Module 14: Audio Runtime. Dependencies: Module 12.
Module 15: Asset Runtime. Dependencies: Modules 01-06.

Wave 6 — Extended Runtime
Module 16: Memory Runtime. Dependencies: Module 15.
Module 17: Transition Engine. Dependencies: Modules 13, 14, 10.

Wave 7 — Scene Packages
Module 18: Loading Prelude
Module 19: Envelope
Module 20: Birthday Letter
Module 21: Star Transition
Module 22: Sunflower World
Module 23: Final Blessing
Dependencies: Modules 08, 10, 17.

Wave 8 — Hero Runtime
Module 24: Hero Validation. Dependencies: Module 22.
Module 25: Hero Ownership. Dependencies: Module 24.
Module 26: Hero Protection. Dependencies: Module 25.
Module 27: Hero Runtime. Dependencies: Module 26.

Wave 9 — Runtime Stability
Module 28: Performance Governor. Dependencies: All Runtime Modules.
Module 29: Recovery Framework. Dependencies: All Runtime Modules.

Wave 10 — Certification
Module 30: Test Harness
Module 31: Integration Validation
Module 32: Performance Validation
Module 33: Release Validation
Dependencies: Everything.

2) YÊU CẦU KỸ THUẬT VẬN HÀNH (Bổ sung từ Kế hoạch ban đầu)
Thiết bị hỗ trợ: Desktop (1920x1080), Laptop (1366x768), Tablet (iPad, Android Tablet), Mobile (iPhone, Android).
Hiệu năng mục tiêu: Desktop (60 FPS), Mobile (30–60 FPS).
Mục tiêu tải trang: First Load ≤ 3 giây, Time To Interactive ≤ 5 giây.
Accessibility cơ bản: Hỗ trợ touch, Hỗ trợ keyboard cơ bản, Có thể tắt nhạc, Có thể bỏ qua animation nặng.

7. Sunflower System (Đặc tả chi tiết Kỹ thuật)
Vai trò: Lớp môi trường lớn nhất dự án.
Foreground Flowers: Gần camera. Chi tiết cao. Animation đầy đủ.
Midground Flowers: Chi tiết trung bình. Animation đơn giản hơn.
Background Flowers: Khối màu và hình dạng tổng thể. Animation tối thiểu.
Wind Propagation: Gió không tác động toàn bộ đồng thời. Gió lan truyền theo vùng. Tạo cảm giác tự nhiên.
Animation Optimization: Ưu tiên: Foreground ↓ Midground ↓ Background. Khi cần giảm tải sẽ giảm từ xa trước.

8. Memory System (Đặc tả chi tiết Kỹ thuật)
Memory Discovery: Ký ức xuất hiện khi: Người xem khám phá, Đi đến vùng cụ thể, Quan sát đủ lâu. Không xuất hiện đồng loạt.
Photo Streaming: Chỉ tải: Ký ức sắp xuất hiện, Ký ức gần camera. Không tải toàn bộ thư viện.
Memory Priority: Active Memory (Ưu tiên cao nhất) → Nearby Memory (Chuẩn bị tải) → Far Memory (Chưa tải).
Asset Release: Ký ức đã rời xa: Giải phóng texture, Giải phóng dữ liệu trung gian, Giữ RAM ổn định.

9. Audio System (Đặc tả chi tiết Kỹ thuật)
Main Music: Một bản nhạc chủ đạo xuyên suốt. Biến đổi cường độ theo Scene. Không đổi bài liên tục.
Ambient Layer: Theo từng Scene. Ví dụ: Prelude Đêm, Sunflower World Gió đồng hoa, Final Blessing Không khí bình minh.
Event Layer: Âm thanh sự kiện. Ví dụ: Mở thư, Ánh sao, Hero Moment.
Audio Transition Principles: Âm thanh luôn: Fade, Blend, Chồng lớp nhẹ. Không chuyển tức thời.

10. Responsive Strategy
Desktop: Camera Đầy đủ chuyển động điện ảnh. Rendering Đầy đủ lớp chiều sâu. Interaction Tự do nhất.
Laptop: Camera Giữ nguyên cảm xúc. Rendering Giảm chi tiết xa. Interaction Tương đương Desktop.
iPad: Camera Biên độ nhỏ hơn. Rendering Giảm độ phức tạp môi trường. Interaction Ưu tiên cảm ứng.
Mobile: Camera Đơn giản hóa. Rendering Giảm lớp nền xa. Interaction Một tay. Không yêu cầu thao tác phức tạp.

11. Performance Strategy
Performance Tiers: Tier High (Desktop mạnh), Tier Medium (Laptop), Tier Low (Tablet), Tier Ultra Low (Mobile yếu).
Texture Strategy: Ưu tiên: Hero Assets, Near Assets. Giảm chất lượng từ xa.
Memory Strategy: Giữ: Current Scene + Next Scene. Giải phóng các scene đã qua.

DEVELOPMENT MILESTONES
M1 — Runtime Foundation Certified. Exit: Contracts complete, Event Bus validated.
M2 — Experience Runtime Certified. Exit: Authority validated.
M3 — Scene Runtime Certified. Exit: Lifecycle validated.
M4 — Timeline Certified. Exit: Synchronization validated.
M5 — Camera + Audio Certified. Exit: Ownership validated, Synchronization validated.
M6 — Asset + Memory Certified. Exit: Streaming validated, Budget validated.
M7 — Transition Runtime Certified. Exit: Transition recovery validated.
M8 — Narrative Scenes Certified. Exit: Full scene flow validated.
M9 — Hero Moment Certified. Exit: Trigger validated, Protection validated.
M10 — Performance Certified. Exit: Tier scaling validated, Mobile validated.
M11 — Recovery Certified. Exit: All recovery paths validated.
M12 — Production Candidate. Exit: Full regression pass, Acceptance pass, Performance pass, Hero certification pass.