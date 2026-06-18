ENGINEERING BLUEPRINT
1. Core Engineering Blueprint
ExperienceDirector
Sở hữu dữ liệu tối cao của toàn bộ hệ thống.
Trách nhiệm: Điều phối các trạng thái cao nhất. Tiếp nhận Command hợp lệ để cập nhật Global State. Thực thi Recovery tổng thể khi có báo động đỏ từ hệ thống.
API hợp lệ:
initialize(config: ExperienceConfig): void
dispatchCommand(command: Command): void
registerSystem(systemId: string, system: BaseSystem): void
getGlobalState(): Readonly<GlobalState>

EventBus
Hệ thống trung chuyển thông tin phi tập trung. Tách biệt hoàn toàn phần phát tin và phần xử lý tin.
Trách nhiệm: Đảm bảo luồng sự kiện phân phát đúng Command (1 nhận), Event (nhiều nhận), Signal (liên tục).
API hợp lệ:
sendCommand(command: Command): void
registerCommandHandler(type: string, handler: CommandHandler): void
publishEvent(event: Event): void
subscribeEvent(type: string, callback: EventCallback): Unsubscribe
emitSignal(signal: Signal): void
listenSignal(type: string, callback: SignalCallback): Unsubscribe

2. Scene Engine Blueprint
SceneSystem
Quản lý tập hợp các phân đoạn trải nghiệm.
Trách nhiệm: Kích hoạt đúng lifecycle tuần tự của từng Scene Package. Đảm bảo quy tắc cô lập môi trường giữa các phân đoạn.
API hợp lệ:
loadScene(sceneId: string): Promise<void>
activateScene(sceneId: string): void
unloadScene(sceneId: string): Promise<void>
getCurrentScene(): Readonly<BaseScene>

BaseScene
Lớp trừu tượng cho mọi Scene. Mọi Scene phải kế thừa từ đây.
State Machine cục bộ:
Preload → Ready → Enter → Active → Leave → Dispose
API bắt buộc triển khai:
onPreload(): Promise<void>
onReady(): void
onEnter(): Promise<void>
onActive(): void
onLeave(): Promise<void>
onDispose(): void

3. Camera Engineering Blueprint
CameraSystem
Quản lý Narrative Device thị giác duy nhất.
Trách nhiệm: Cấp quyền sở hữu Camera dựa trên Priority Matrix. Áp dụng chuyển động mượt mà (Blending) giữa các yêu cầu camera khác nhau.
API hợp lệ:
acquireLock(requestorId: string, priority: number): Promise<CameraLock>
releaseLock(lock: CameraLock): void
setPreset(preset: CameraPreset, duration: number): Promise<void>
updateCameraMatrix(matrix: Matrix4): void

CameraLock
Token chứng minh quyền kiểm soát Camera hợp lệ.
Properties:
id: string
requestorId: string
priority: number
active: boolean

4. Timeline Engineering Blueprint
TimelineSystem
Quản lý nhịp độ của trải nghiệm.
Trách nhiệm: Duy trì Timeline Tick chính xác. Đọc cấu hình phân đoạn để phát Command kích hoạt hành động đúng thời điểm. Đồng bộ hóa với nguồn phát thời gian của Audio.
API hợp lệ:
startTimeline(): void
pauseTimeline(): void
seekTimeline(time: number): void
registerSegment(segment: TimelineSegment): void
getTimelineTime(): number

5. Asset Streaming Engineering Blueprint
AssetRuntime
Quản lý tải tài nguyên động.
Trách nhiệm: Thực thi Priority Queue (Critical, Narrative, Visual, Decorative). Bảo vệ Asset của Hero khỏi việc giải phóng bộ nhớ. Streaming dữ liệu dựa trên Forecast Window của Scene System.
API hợp lệ:
loadAssetGroup(groupId: string, priority: AssetPriority): Promise<AssetGroup>
releaseAssetGroup(groupId: string): void
protectAsset(assetId: string): void
unprotectAsset(assetId: string): void
getQueueStatus(): AssetQueueStatus

6. Memory Safety Engineering Blueprint
MemoryManager
Giám sát dung lượng bộ nhớ.
Trách nhiệm: Kiểm soát dung lượng của Photo Budget, Hero Budget, Discovery Budget. Thực thi dọn dẹp cưỡng bức (Forced Cleanup) khi nhận được tín hiệu THERMAL_WARNING hoặc MEMORY_WARNING.
API hợp lệ:
allocateBudget(domain: MemoryDomain, size: number): void
trackAllocation(domain: MemoryDomain, assetId: string, size: number): void
freeAllocation(domain: MemoryDomain, assetId: string): void
enforceEviction(): void

7. Scene Package Blueprint
Common Scene Package
Cấu trúc đóng gói tiêu chuẩn cho một Scene độc lập.
Thành phần bắt buộc bên trong mỗi gói:
ScenePackage
├── Metadata (Định danh ID, Tên)
├── Contracts (Ràng buộc dữ liệu đầu vào)
├── Assets (Danh mục tài nguyên đăng ký)
├── TimelineConfig (Cấu hình dòng thời gian nội bộ)
├── Events (Các sự kiện tự phát sinh)
├── Recovery (Kịch bản cứu hộ cục bộ)
└── Validation (Bộ quy tắc tự kiểm tra tính đúng đắn)

Chi tiết cấu trúc 6 Scene Package chuẩn hóa:
Loading Prelude: BootstrapRules, CriticalAssets, RuntimeValidation, RecoveryRules
Envelope: NarrativeConfig, Assets, Timeline, Recovery
Birthday Letter: LetterConfig, PauseRules, Timeline, Recovery
Star Transition: TransitionConfig, CameraConfig, AudioConfig, Recovery
Sunflower World: WorldConfig, DiscoveryConfig, MemoryConfig, HeroIntegration, PerformanceRules, Recovery
Final Blessing: ClosureConfig, Timeline, AudioConfig, Recovery

8. Hero Package Blueprint
HeroMoment Subsystem
Hệ thống quản lý điểm cao trào của trải nghiệm. Cô lập hoàn toàn với bên ngoài.
Thành phần bên trong:
HeroMoment
├── Metadata
├── TriggerPipeline (Tuyến kích hoạt điều kiện)
├── ValidationRules (Kiểm tra độ sẵn sàng của Camera, Audio, Assets)
├── AssetRequirements (Các tài nguyên chân dung đặc biệt)
├── CameraRequirements (Yêu cầu lock camera layer riêng)
├── AudioRequirements (Cường độ âm thanh cao trào)
├── OwnershipManager (Kiểm soát chiếm quyền độc quyền)
├── RuntimeProtection (Chống gián đoạn trạng thái)
├── CompletionRules (Tiêu chí hoàn thành)
├── RecoveryRules (Phương án fallback ảnh dự phòng)
└── Analytics (Ghi nhận hành vi hoàn thành)

9. Testing Package Blueprint
Hệ thống kiểm thử tự động tích hợp sẵn trong mã nguồn.
Unit Test: State Machines, Event Bus, Ownership Rules, Asset Rules, Governor Rules.
Integration Test: Scene + Timeline, Timeline + Camera, Timeline + Audio, Memory + Assets, Hero + Runtime, Full Experience.
Performance Test: FPS Testing, Memory Testing, Thermal Testing, Streaming Testing, Hero Load Testing.
Recovery Test: Long Session, Recovery Session, Cold Start.

10. Build Pipeline Blueprint
Quy trình đóng gói phân phối mã nguồn sản xuất.
Development Pipeline Objectives: Kiểm tra cú pháp nghiêm ngặt, Đo lường dung lượng tài nguyên đầu vào, Xác minh cấu trúc thư mục domain cô lập, Ngăn chặn Dependency Inversion và Circular Dependency.