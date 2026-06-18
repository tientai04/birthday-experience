3. FILE CREATION ORDER
Trình tự tạo file bắt buộc trong hệ thống mã nguồn:

Tier 1 — Create first:
Contracts
Commands
Events
Signals
State Definitions
Ownership Definitions

Tier 2 — Create second:
Runtime Registry
Event Bus
Validation Framework

Tier 3 — Create third:
Experience Director
Scene Registry
Scene Lifecycle

Tier 4 — Create fourth:
Timeline Runtime
Timeline Sync
Timeline Validation

Tier 5 — Create fifth:
Camera Runtime
Audio Runtime
Asset Runtime

Tier 6 — Create sixth:
Memory Runtime
Transition Runtime

Tier 7 — Create seventh:
Scene Packages (Order: Loading Prelude → Envelope → Birthday Letter → Star Transition → Sunflower World → Final Blessing)

Tier 8 — Create eighth:
Hero Runtime

Tier 9 — Create ninth:
Performance Governor
Recovery Framework

Tier 10 — Create tenth:
Testing
Validation
Certification

4. DEPENDENCY ORDER
Hard Dependency Chain
Contracts ↓ States ↓ Event Bus ↓ Experience Director ↓ Scene Runtime ↓ Timeline Runtime ↓ Camera / Audio ↓ Transition Engine ↓ Scene Packages ↓ Hero Runtime ↓ Performance Governor ↓ Recovery Framework ↓ Certification

Soft Dependency Chain
Asset Runtime ↓ Memory Runtime ↓ Sunflower World ↓ Hero Runtime

5. INTEGRATION CHECKPOINTS
Checkpoint A — Foundation Ready: Validate: Contracts, States, Ownership, Event Bus. Required before proceeding.
Checkpoint B — Runtime Ready: Validate: Experience Director, Scene Runtime, Timeline Runtime.
Checkpoint C — Subsystem Ready: Validate: Camera, Audio, Assets.
Checkpoint D — Narrative Runtime Ready: Validate: All Scenes, Transitions, Memory.
Checkpoint E — Hero Ready: Validate: Hero Trigger, Hero Protection, Hero Completion.
Checkpoint F — Production Ready: Validate: Performance, Recovery, Full Experience.

INTEGRATION ORDER
Integration 01: Runtime + Experience
Integration 02: Experience + Scene
Integration 03: Scene + Timeline
Integration 04: Timeline + Camera
Integration 05: Timeline + Audio
Integration 06: Assets + Memory
Integration 07: Scene Packages
Integration 08: Transition Engine
Integration 09: Hero Moment
Integration 10: Performance Governor
Integration 11: Recovery
Integration 12: Full Experience

ACCEPTANCE CRITERIA
Runtime: PASS: Event ordering preserved, State consistency maintained. FAIL: Authority conflict, State corruption.
Scene: PASS: Lifecycle valid, Rollback valid. FAIL: Invalid state transitions.
Camera: PASS: Single ownership maintained. FAIL: Multiple active owners.
Audio: PASS: Seamless transitions. FAIL: Broken synchronization.
Assets: PASS: Priority rules respected. FAIL: Critical asset starvation.
Memory: PASS: Budget respected. FAIL: Unbounded growth.
Hero Moment: PASS: Always reachable, Always completes. FAIL: Missed trigger, Interrupted completion.
Recovery: PASS: No dead-end states. FAIL: Unrecoverable runtime.

DEFINITION OF DONE
A subsystem is DONE only if:
1. Contract implemented
2. State machine implemented
3. Events integrated
4. Recovery path implemented
5. Unit tests passing
6. Integration tests passing
7. Runtime tests passing
8. No ownership violations
9. No unresolved critical defects
10. Acceptance criteria satisfied
All ten conditions are mandatory.

RISK MATRIX
Runtime Authority Conflict | Impact: Critical | Probability: Medium | Mitigation: Ownership enforcement, Contract validation
Event Ordering Failure | Impact: Critical | Probability: Medium | Mitigation: Ordered transport, Event replay validation
Scene Lifecycle Corruption | Impact: High | Probability: Medium | Mitigation: Lifecycle guards, Rollback support
Asset Starvation | Impact: High | Probability: High | Mitigation: Priority queues, Hero protection
Memory Growth | Impact: High | Probability: Medium | Mitigation: Budget enforcement, Eviction policy
Hero Failure | Impact: Critical | Probability: Medium | Mitigation: Validation pipeline, Protected execution
Mobile Performance Collapse | Impact: Critical | Probability: High | Mitigation: Governor, Quality tiers, Hysteresis
Recovery Failure | Impact: Critical | Probability: Low | Mitigation: Recovery certification, Failure simulation

FINAL BUILD LOCK STATUS
Architecture Status: LOCKED
Runtime Ownership Status: LOCKED
Scene Flow Status: LOCKED
Hero Moment Status: LOCKED
Implementation Order Status: LOCKED
Dependency Graph Status: LOCKED
Acceptance Criteria Status: LOCKED
Definition of Done Status: LOCKED
PRODUCTION EXECUTION STATUS: READY FOR IMPLEMENTATION
This document represents the final execution contract. At this point, implementation teams should only make low-level engineering decisions (naming, internal APIs, packaging details, optimization techniques) and should not alter architecture, ownership, scene flow, narrative flow, or Hero Moment behavior.