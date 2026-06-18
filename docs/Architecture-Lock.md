ARCHITECTURE LOCK PATCH
Bối cảnh:
Narrative Locked
Visual Bible Locked
Architecture Review Completed
Architecture Review đã xác định 8 hạng mục bắt buộc:
Global Experience State Model
Command / Event / Signal Separation
Scene Lifecycle bổ sung Preload + Ready
Camera Lock Ownership System
Asset Priority Classes
Memory Budget System cho Photo Assets
Performance Recovery Hysteresis
Safe Scene Recovery State

Nhiệm vụ: Thiết kế Architecture Lock Patch.
Mục tiêu: khóa hoàn toàn ownership khóa event flow khóa scene flow khóa runtime authority loại bỏ ambiguity trước khi triển khai
Yêu cầu đầu ra:

1. Global Experience State Model
Xác định: Source of Truth duy nhất State Ownership Matrix Runtime Authority Matrix

2. Command / Event / Signal Model
Định nghĩa: Command Event Signal Cho ví dụ cụ thể với: Scene Activation Hero Moment Transition Memory Discovery

3. Updated Scene Lifecycle
Thiết kế lifecycle cuối cùng.
Bao gồm: Preload Ready Enter Active Leave Dispose Xác định: ai được phép chuyển state điều kiện chuyển state điều kiện rollback

4. Camera Ownership Model
Thiết kế: Camera Lock System Bao gồm: Ownership Rules Priority Rules Conflict Resolution Cho ví dụ: Transition Hero Moment Memory Discovery

5. Asset Priority Model
Thiết kế các cấp: Critical Narrative Visual Decorative Xác định: preload order eviction order downgrade order

6. Memory Budget Model
Thiết kế: Photo Budget Hero Asset Budget Discovery Budget Xác định: load policy unload policy cache policy

7. Performance Recovery Hysteresis
Thiết kế: downgrade threshold upgrade threshold cooldown window
Ngăn quality oscillation.

8. Safe Scene Recovery State
Thiết kế: transition failure recovery scene crash recovery asset failure recovery Mục tiêu: Người dùng không bao giờ mắc kẹt.

9. Final Architecture Diagram
Tạo sơ đồ cuối cùng của toàn bộ hệ thống.

10. Architecture Lock Report
Kết luận: LOCKED hoặc NOT LOCKED

Không viết code. Không đề xuất framework.
Chỉ hoàn thiện kiến trúc cuối cùng trước khi bước vào Production Blueprint.

1. Global Experience State Model
Single Source of Truth
Toàn bộ runtime chỉ có một nguồn trạng thái duy nhất: Global Experience State Mọi hệ thống: Scene Timeline Camera Audio Memory Performance Transition chỉ được đọc hoặc cập nhật thông qua mô hình này.
Không tồn tại: Camera State riêng Scene State riêng Transition State riêng đóng vai trò Source of Truth.

State Ownership Matrix
State | Owner
Experience State | Experience Director
Scene State | Scene System
Timeline State | Timeline System
Transition State | Transition Engine
Camera State | Camera System
Audio State | Audio System
Memory State | Memory System
Quality State | Performance Governor

Runtime Authority Matrix
Absolute Authority
Experience Director
Được quyền: chấp nhận state transition rollback recovery

Operational Authority
Scene System
Transition Engine
Performance Governor

Execution Authority
Camera
Audio
Animation
Memory

2. Command / Event / Signal Model
Command
Định nghĩa
Yêu cầu thực hiện hành động.
Có người gửi.
Có người nhận.
Chỉ được xử lý một lần.
Ví dụ
ACTIVATE_SCENE Scene System nhận.
START_TRANSITION Transition Engine nhận.
START_HERO_MOMENT Timeline gửi. Hero Controller nhận.

Event
Định nghĩa
Thông báo rằng điều gì đó đã xảy ra.
Không yêu cầu phản hồi.
Có thể có nhiều listener.
Ví dụ
SCENE_ACTIVE
TRANSITION_COMPLETE
MEMORY_DISCOVERED
HERO_MOMENT_COMPLETED

Signal
Định nghĩa
Tín hiệu runtime liên tục.
Không phải hành động.
Không phải sự kiện nghiệp vụ.
Ví dụ
FPS_LOW
MEMORY_WARNING
THERMAL_WARNING

Hero Moment Example
Command: START_HERO_MOMENT ↓ Event: HERO_MOMENT_STARTED ↓ Event: HERO_MOMENT_COMPLETED

Transition Example
Command: START_TRANSITION ↓ Event: TRANSITION_STARTED ↓ Event: TRANSITION_COMPLETED

3. Updated Scene Lifecycle
Final Lifecycle
Preload ↓ Ready ↓ Enter ↓ Active ↓ Leave ↓ Dispose

Preload
Owner: Asset System
Điều kiện: vào Scene được lên lịch tiếp theo.

Ready
Owner: Scene System
Điều kiện: Toàn bộ Critical Assets sẵn sàng.

Enter
Owner: Transition Engine
Điều kiện: Transition bắt đầu.

Active
Owner: Scene System
Điều kiện: Transition hoàn tất.

Leave
Owner: Scene System
Điều kiện: Timeline yêu cầu chuyển cảnh.

Dispose
Owner: Transition Engine
Điều kiện: Scene mới Active thành công.

Rollback Rules
Cho phép: Enter ↓ Ready nếu transition thất bại.
Cho phép: Ready ↓ Preload nếu asset không còn hợp lệ.
Không cho phép rollback từ: Dispose

4. Camera Ownership Model
Camera Lock System
Mỗi thời điểm: One Camera One Owner

Ownership Priority
Transition ↓ Hero Moment ↓ Scene Narrative ↓ Memory Discovery ↓ Ambient Motion

Conflict Resolution
Nếu owner mới có ưu tiên thấp hơn: Rejected
Nếu owner mới có ưu tiên cao hơn: Preempt Current Owner

Example 01 Transition
Đang chuyển cảnh.
Memory Discovery yêu cầu camera.
Kết quả: Transition Wins

Example 02 Hero Moment
Memory Discovery đang hoạt động.
Hero Moment bắt đầu.
Kết quả: Hero Moment Takes Lock

Example 03 Memory Discovery
Không có owner khác.
Kết quả: Memory Discovery Owns Camera

5. Asset Priority Model
Priority Levels
Critical
Không có thì Scene không thể hoạt động.
Ví dụ: Scene Core Assets, Hero Assets, Transition Assets
Narrative
Liên quan trực tiếp đến cảm xúc.
Ví dụ: Memory Photos, Letter Assets
Visual
Tăng chất lượng hình ảnh.
Ví dụ: Extra Sky Layers, Additional Flowers
Decorative
Chỉ làm đẹp.
Ví dụ: Dust Sparkles, Ambient Particles

Preload Order
Critical ↓ Narrative ↓ Visual ↓ Decorative

Eviction Order
Decorative ↓ Visual ↓ Narrative ↓ Critical

Downgrade Order
Decorative ↓ Visual ↓ Narrative
Critical không được giảm.

6. Memory Budget Model
Photo Budget
Dành riêng cho: Ký ức Chân dung Ảnh nghệ thuật

Hero Asset Budget
Dành riêng cho: Hero Moment Portrait, Hero Transition

Discovery Budget
Dành riêng cho: Memory Discovery

Load Policy
Chỉ load: Current + Nearby

Unload Policy
Unload khi: Outside Discovery Range

Cache Policy
Kept cache: Current Discovery Cluster
Không cache: Completed Regions

Protection Rule
Hero Assets không nằm trong budget chung.
Không bị eviction bởi: Discovery Visual Assets

7. Performance Recovery Hysteresis
Downgrade Threshold
Kích hoạt khi: FPS thấp liên tục, Memory Pressure kéo dài, Thermal Warning kéo dài

Upgrade Threshold
Chỉ nâng cấp khi: FPS ổn định, Memory ổn định, Thermal bình thường trong thời gian dài hơn downgrade.

Cooldown Window
Sau khi downgrade: Temporary Lock không cho phép upgrade ngay.

Recovery Strategy
Fast Downgrade, Slow Upgrade

Quality Stability Rule
Ngăn: High ↓ Medium ↑ High ↓ Medium lặp lại liên tục.

8. Safe Scene Recovery State
Recovery State
Thêm trạng thái mới: Recovery

Transition Failure Recovery
Transition Fail ↓ Recovery ↓ Last Stable Scene

Scene Crash Recovery
Scene Crash ↓ Recovery ↓ Reload Scene
Nếu thất bại lần hai: Skip Scene ↓ Next Scene

Asset Failure Recovery
Critical Asset: Fallback Asset
Narrative Asset: Narrative Fallback
Decorative Asset: Discard

Recovery Principle
Người dùng không bao giờ thấy: Blank Screen, Dead State, Infinite Loading

9. Final Architecture Diagram
Experience Director
│
▼
Global Experience State
│
┌────────┼────────┐
▼        ▼        ▼
Scene  Timeline Performance
System   System   Governor
│        │        │
└────┬───┘        │
     ▼            │
Transition Engine │
     │            │
┌────┼────┐       │
▼    ▼    ▼       │
Camera Audio Animation
│    │    │       │
└────┼────┘       │
     ▼            │
Memory System ◄───┘
     ▼
Asset System

10. Architecture Lock Report
Ownership ✅ Locked
Runtime Authority ✅ Locked
Scene Lifecycle ✅ Locked
Camera Ownership ✅ Locked
Event Flow ✅ Locked
Asset Streaming ✅ Locked
Memory Safety ✅ Locked
Runtime Recovery ✅ Locked

Production Ambiguity
Không còn điểm mơ hồ lớn nào về: quyền điều khiển, thứ tự thực thi, lifecycle, recovery path, performance governance

FINAL STATUS
ARCHITECTURE LOCK: LOCKED
Kiến trúc hiện tại đã đạt trạng thái đủ chặt chẽ để chuyển sang giai đoạn Production Blueprint mà không cần thay đổi: Narrative, Visual Bible, Scene Flow, Hero Moment, Runtime Ownership Model. Mọi thay đổi tiếp theo nên chỉ tập trung vào triển khai chi tiết, không thay đổi kiến trúc nền tảng.