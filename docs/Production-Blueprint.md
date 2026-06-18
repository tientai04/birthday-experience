PRODUCTION BLUEPRINT

1. Repository Structure Blueprint
Mục tiêu Repository phải phản ánh đúng Architecture Lock.
Không tổ chức theo: component UI page
Mà tổ chức theo: Experience Domain

Top-Level Domains
Experience
├── Core
├── Runtime
├── Scenes
├── Camera
├── Timeline
├── Audio
├── Memory
├── Assets
├── Performance
├── Transitions
├── HeroMoment
├── Recovery
└── Testing

Dependency Boundaries
Core: Được phép phụ thuộc vào: Nothing. Là tầng thấp nhất.
Runtime: Được phép phụ thuộc: Core.
Scene Domain: Được phép phụ thuộc: Core, Runtime. Không được phụ thuộc: Audio, Camera, Memory trực tiếp.
Camera Domain: Được phép phụ thuộc: Core, Runtime.
Audio Domain: Được phép phụ thuộc: Core, Runtime.
Memory Domain: Được phép phụ thuộc: Core, Assets, Runtime.
Hero Moment Domain: Được phép phụ thuộc: Scene, Timeline, Camera, Audio, Memory. Không hệ nào khác được phụ thuộc ngược lại vào Hero Moment.

Production Risk
Nguy cơ lớn nhất: Cross Domain Dependency. Cần kiểm soát nghiêm ngặt.

2. Scene Blueprint
Scene Inventory
Loading Prelude, Envelope, Birthday Letter, Star Transition, Sunflower World, Final Blessing.
Scene Responsibility
Mỗi Scene chỉ sở hữu: Narrative State, Visual State, Scene Event Rules. Không sở hữu: Camera Logic, Audio Logic, Asset Logic.
Runtime Flow
Preload ↓ Ready ↓ Enter ↓ Active ↓ Leave ↓ Dispose
Scene Data Flow
Scene ↓ Timeline Requests ↓ Event Bus ↓ Runtime Systems
Production Risk
Scene trở thành God Object. Cần giữ Scene ở vai trò: Coordinator không phải: Executor.
Testing Strategy
Kiểm tra: Lifecycle Transition Compatibility, Asset Availability, Recovery Path.

3. Camera Blueprint
Vai trò: Camera là Narrative Device. Không phải User Camera.
Camera Layers
Narrative Layer: Điều khiển cảm xúc.
Transition Layer: Điều khiển chuyển cảnh.
Hero Layer: Điều khiển Hero Moment.
Ambient Layer: Điều khiển chuyển động nền.
Ownership Flow
Camera Lock ↓ Owner Selected ↓ Motion Execution ↓ Release Lock
Runtime Risk
Nhiều hệ thống yêu cầu camera cùng lúc.
Testing Strategy
Lock Acquisition, Lock Release, Conflict Resolution, Transition Interruption.

4. Timeline Blueprint
Vai trò: Timeline là Orchestrator. Không phải Executor.
Timeline Layers
Narrative Timeline: Scene progression.
Audio Timeline: Music evolution.
Camera Timeline: Camera presets.
Event Timeline: Hero Moment, Memory Discovery.
Runtime Flow
Timeline Tick ↓ Rule Evaluation ↓ Command Emission ↓ Event Response
Production Risk
Timeline trở thành điểm nghẽn.
Testing Strategy
Event Ordering, Timing Accuracy, Hero Trigger Validation, Transition Synchronization.

5. Asset Streaming Blueprint
Asset Classes
Critical, Narrative, Visual, Decorative.
Streaming Flow
Scene Forecast ↓ Priority Queue ↓ Load ↓ Ready ↓ Use ↓ Release
Forecast Window
Chỉ duy trì: Current Scene, Next Scene.
Runtime Risk
Hero Assets cạnh tranh với Discovery Assets.
Asset Protection
Hero Assets có Priority Lane riêng. Không dùng queue chung.
Testing Strategy
Cold Start, Scene Transition, Memory Pressure, Hero Moment Readiness.

6. Performance Blueprint
Runtime Governor Layers
FPS Layer, Memory Layer, Thermal Layer, Loading Layer.
Quality States
Ultra, High, Medium, Low, Critical.
Downgrade Order
Decorative ↓ Visual ↓ Animation Density ↓ Environment Complexity.
Protected Elements
Không được giảm: Hero Moment, Birthday Letter, Main Music, Narrative Timeline.
Runtime Risk
Sunflower World là Peak Load Zone.
Testing Strategy
Desktop Stress Test, Laptop Stress Test, Tablet Stress Test, Mobile Stress Test, Thermal Endurance Test.

7. Hero Moment Blueprint
Vai trò: Hero Moment là: Narrative Apex không phải hiệu ứng.
Ownership
Timeline là nguồn kích hoạt duy nhất.
Activation Conditions
Tất cả phải đúng: Sunflower World Active, Hero Region Reached, Required Memories Seen, Camera Available, Hero Assets Ready, Audio Ready.
Runtime Flow
Validate Conditions ↓ Acquire Camera Lock ↓ Acquire Audio Priority ↓ Start Hero Sequence ↓ Portrait Formation ↓ Hero Completion ↓ Release Ownership.
Dependency Boundaries
Hero Moment được phép đọc: Scene State, Timeline State, Camera State, Memory State, Audio State. Nhưng không được sửa trực tiếp bất kỳ state nào. Mọi thay đổi phải đi qua: Commands, Events.
Production Risks
Hero Assets chưa sẵn sàng, Camera đang bị lock sai, Memory Discovery chạy đồng thời, Performance downgrade giữa Hero Moment.
Mandatory Protection Rules
Trong thời gian Hero Moment: Camera Ownership Locked, Asset Eviction Disabled, Quality Downgrade Restricted, Transition Disabled.
Testing Strategy
Hero Trigger Test, Hero Asset Readiness Test, Camera Lock Test, Recovery Test, Mobile Hero Test, Low FPS Hero Test.

PRODUCTION DATA FLOW
High-Level Runtime Flow
Experience Director ↓ Global Experience State ↓ Scene System ↓ Timeline System ↓ Transition Engine ↓ Event Bus ↓ Camera Audio Animation Memory ↓ WebGL Layer / DOM Layer

Critical Subsystem Interaction (Scene Change)
Scene System (Emit ACTIVATE_SCENE) ↓ Event Bus ↓ Transition Engine (Acquire Camera Lock) ↓ Asset System (Preload Next Scene) ↓ Camera System (Blend Presets) ↓ Transition Engine (Emit TRANSITION_COMPLETE) ↓ Scene System (Dispose Old Scene)

Hero Moment Execution Flow
Timeline System (Emit START_HERO_MOMENT) ↓ Hero Controller (Validate Assets & Locks) ↓ Camera System (Forced Lock To Hero Layer) ↓ Performance Governor (Lock Quality Tier) ↓ Asset System (Protect Hero Portrait Asset) ↓ Animation System (Execute Formation) ↓ Hero Controller (Emit HERO_MOMENT_COMPLETED)

8. Production Safety Requirements
Rule S-01 — Single Active Scene Execution
Hệ thống không bao giờ cho phép hai Scene cùng chạy logic ở trạng thái Active.
Rule S-02 — Locked Camera Hierarchy
Camera Ownership không được vi phạm ưu tiên: Transition/Hero luôn trên Scene.
Rule S-03 — Deterministic Memory Recovery
Khi chuyển Scene, toàn bộ bộ nhớ của Scene cũ (trừ phần preload được giữ) phải được giải phóng hoàn toàn trong tối đa 2 khung hình (frames).
Rule S-04 — Failure Isolation
Lỗi của Audio hoặc Animation phụ không được gây dừng (block) Narrative Flow.

9. Production Architecture Diagram
[Experience Architecture Sơ đồ Khóa hoàn chỉnh hạ tầng]
(Chi tiết như sơ đồ tại mục 9 của Architecture Lock Patch)

10. Production Blueprint Status
Architecture Lock Compliance: ✅ Verified
Domain Boundaries: ✅ Validated
Data Flow Determinism: ✅ Locked
Production Blueprint Status: APPROVED FOR SPRINT PLANNING