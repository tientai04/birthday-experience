ARCHITECTURE COMPLIANCE CHECKLIST
Birthday Experience Project
Document Purpose

This checklist is the authoritative audit framework used for:
Codex Review
Pull Request Review
Architecture Review
QA Validation
Release Certification
Production Readiness Approval

This document does not redefine architecture.
Its purpose is to detect violations of the locked architecture.

1. OWNERSHIP COMPLIANCE
Rule O-01 — Single Source of Truth
Validation Criteria
Must exist exactly one owner for:
Experience State
Scene State
Timeline State
Camera State
Audio State
Memory State
Asset Registry
Quality State
Hero State
Transition State

Failure Examples
Scene modifies Experience State directly.
Camera modifies Timeline State directly.
Audio modifies Scene State directly.

Severity
Critical

Remediation
Remove direct state mutation.
Route changes through owning subsystem.

Rule O-02 — Runtime Authority Enforcement
Validation Criteria
Experience Director remains highest runtime authority.

Failure Examples
Scene initiates scene activation.
Camera initiates experience completion.
Hero initiates scene lifecycle changes.

Severity
Critical

Remediation
Transfer authority to Experience Director.

Rule O-03 — Ownership Isolation
Validation Criteria
Subsystem may read shared data only through approved contracts.
Subsystem may not mutate foreign state.

Failure Examples
Memory updates Camera State.
Asset Runtime updates Scene State.
Timeline updates Hero State.

Severity
Critical

Remediation
Replace mutation with command/event flow.

Rule O-04 — Runtime Control Hierarchy
Validation Criteria
Hierarchy remains:
Experience Director
↓
Scene Runtime
↓
Timeline Runtime
↓
Subsystem Controllers
↓
Rendering / Presentation Layers

Failure Examples
Lower layer controls higher layer.

Severity
Critical

Remediation
Restore hierarchy ownership.

2. DEPENDENCY COMPLIANCE
Allowed Dependency Validation
Detection Method
Static dependency inspection.

Pass Criteria
Dependency graph follows approved order.

Failure Examples
Scene → Camera
Camera → Scene
Bidirectional dependency.

Severity
High

Forbidden Dependency Validation
Forbidden
Hero → Scene Lifecycle
Camera → Experience Director
Audio → Scene Registry
Memory → Transition Engine

Severity
Critical

Circular Dependency Audit
Detection Method
Dependency graph analysis.

Pass Criteria
No cycles.

Fail Criteria
Any cycle exists.

Severity
Critical

Domain Isolation Audit
Pass Criteria
Domains communicate only through contracts.

Fail Examples
Cross-domain internal imports.

Severity
High

3. STATE MACHINE COMPLIANCE
Experience State
Valid
Boot → Running → Transitioning → Completed
Invalid
Boot → Completed
Completed → Running
Recovery Requirement
Recovery allowed from all non-terminal states.

Scene State
Valid
Preload → Ready → Enter → Active → Leave → Dispose
Invalid
Preload → Active
Ready → Dispose
Dispose → Active
Recovery Requirement
Rollback only to approved prior states.

Timeline State
Valid
Idle → Scheduled → Running → Completed
Invalid
Idle → Completed
Completed → Running

Transition State
Valid
Prepare → Running → Completed
Invalid
Prepare → Completed
Completed → Running

Camera State
Valid
Idle → Locked → Moving → Blending → Released
Invalid
Any ownership bypass.

Audio State
Valid
Loading → Ready → Playing → Transitioning → Stopped

Memory State
Valid
Inactive → Loading → Ready → Visible → Released

Hero State
Valid
Waiting → Validating → Protected → Running → Completed
Invalid
Waiting → Running
Validating → Completed

Recovery State
Valid
Detected → Recovering → Stabilized → Resumed
Invalid
Detected → Resumed

4. EVENT BUS COMPLIANCE
Command Audit
Audit Questions
Does command have exactly one receiver?
Does command request an action?
Is authority respected?

Pass Criteria
Single sender → single receiver.

Fail Criteria
Broadcast commands.

Severity
Critical

Event Audit
Audit Questions
Is event informational only?
Does event mutate state?

Pass Criteria
Events announce facts.

Fail Criteria
Events directly change state.

Severity
Critical

Signal Audit
Audit Questions
Is signal observational?
Is signal triggering business logic?

Pass Criteria
Signal reports runtime conditions.

Fail Criteria
Signal performs actions directly.

Severity
Critical

5. SCENE COMPLIANCE
Lifecycle Enforcement
Mandatory Checks
Preload completed
Ready validated
Enter validated
Active validated
Leave validated
Dispose validated

Failure Scenarios
Active scene without Ready.
Dispose skipped.
Multiple active scenes.

Severity
Critical

Scene Isolation
Checks
Scene cannot:
Own Camera
Own Audio
Own Transition

Severity
High

Scene Recovery
Checks
Failed scene enters recovery flow.

Severity
Critical

6. CAMERA COMPLIANCE
Single Camera Owner
Validation
Exactly one owner.

Failure
Multiple owners.

Severity
Critical

Ownership Priority
Priority must remain:
Hero
↑
Transition
↑
Timeline

Severity
Critical

Lock Acquisition
Checks
Request validated
Ownership granted
Previous owner released

Lock Release
Checks
No orphan lock.

Severity
Critical

Conflict Tests
Required
Simulate:
Timeline vs Hero
Transition vs Hero
Transition vs Timeline
Hero must win.

7. AUDIO COMPLIANCE
Audio Layer Isolation
Validation
Music layer independent.
Ambient independent.
Event layer independent.

Severity
Medium

Crossfade Integrity
Checks
No abrupt transition.

Severity
Medium

Timeline Synchronization
Checks
Timeline alignment maintained.

Severity
High

Recovery Support
Checks
Audio failure never blocks narrative.

Severity
Critical

8. ASSET COMPLIANCE
Priority Rules
Must remain:
Critical
Narrative
Visual
Decorative

Severity
High

Protection Rules
Critical protected assets not evicted.

Severity
Critical

Streaming Rules
Streaming must respect priority queue.

Severity
High

Eviction Rules
Eviction order:
Decorative
Visual
Narrative

Severity
High

Hero Asset Protection Checks
Verify
Hero assets protected.

Severity
Critical

Asset Starvation Checks
Verify
Critical assets always acquire resources.

Severity
Critical

9. MEMORY COMPLIANCE
Discovery Rules
Verify
Discovery requests routed through Asset Runtime.

Severity
High

Cache Rules
Verify
Cache follows approved policy.

Severity
High

Budget Enforcement
Verify
Budget never exceeded.

Severity
Critical

Leak Detection Checklist
Audit:
Released assets freed
Discovery assets cleaned
Scene disposal cleanup completed

Severity
Critical

Budget Violation Checklist
Audit:
Peak usage
Sustained usage
Hero usage

Severity
Critical

10. TRANSITION COMPLIANCE
Transition Ownership
Verify
Transition Engine owns transition lifecycle.

Severity
Critical

Transition Lifecycle
Verify
Prepare → Running → Completed

Severity
High

Recovery Path
Verify
Transition failure recoverable.

Severity
Critical

Scene Activation Ordering
Required Order
Next Scene Ready
↓
Transition Start
↓
Transition Complete
↓
Old Scene Dispose
↓
New Scene Active

Severity
Critical

Failure Scenarios
Transition interrupted
Scene unavailable
Camera unavailable
Audio unavailable
Recovery required.

11. HERO MOMENT COMPLIANCE
Enhanced Audit Depth
Hero Moment is highest-risk zone.

Trigger Conditions
Verify
Sunflower World active
Assets ready
Audio ready
Camera ready

Severity
Critical

Ownership Acquisition
Verify
Hero owns:
Camera
Asset Protection
Transition Lock

Severity
Critical

Runtime Protection
Verify
No interruption after Protected state.

Severity
Critical

Completion Rules
Verify
Hero reaches completion.

Severity
Critical

Recovery Rules
Verify
Hero failure has recovery path.

Severity
Critical

Mandatory Protection Verification
Required
Attempt interruption:
Scene change
Transition request
Asset eviction
Quality downgrade
Hero must remain protected.

Hero Failure Verification
Required
Simulate:
Missing asset
Missing audio
Camera failure
Recovery must succeed.

12. PERFORMANCE COMPLIANCE
Quality Tier Validation
Verify:
Ultra
High
Medium
Low
Critical

Severity
Medium

Hysteresis Validation
Verify
Upgrade threshold differs from downgrade threshold.

Severity
High

Budget Enforcement
Verify
Memory and performance budgets enforced.

Severity
Critical

Mobile Verification Checklist
Verify:
Sustained stability
No runaway memory
No overheating escalation loops

Severity
Critical

Peak Load Verification Checklist
Verify:
Hero Moment
Sunflower World
Scene transition peaks

Severity
Critical

13. RECOVERY COMPLIANCE
Recovery Availability
Verify
Every critical failure has recovery.

Severity
Critical

Recovery Entry Conditions
Verify
Failure correctly enters recovery.

Severity
High

Recovery Exit Conditions
Verify
Recovery reaches stable state.

Severity
High

Retry Rules
Verify
Retries bounded.

Severity
High

Fallback Rules
Verify
Fallback path available.

Severity
Critical

Dead-State Detection
Verify
No unreachable recovery exit.

Severity
Critical

Infinite-Loop Detection
Verify
Recovery cannot recursively re-enter forever.

Severity
Critical

14. RUNTIME SAFETY COMPLIANCE
Single Active Scene
Verify
One active scene maximum.

Severity
Critical

Single Active Transition
Verify
One transition maximum.

Severity
Critical

Single Camera Owner
Verify
One owner maximum.

Severity
Critical

Hero Protection
Verify
Protected state cannot be interrupted.

Severity
Critical

Narrative Continuity
Verify
User can always progress:
Loading Prelude → Envelope → Birthday Letter → Star Transition → Sunflower World → Final Blessing

Severity
Critical

Critical Failure Scenarios
Must test:
Scene crash
Asset failure
Audio failure
Transition failure
Hero failure
No permanent blockage allowed.

Safety Certification Checks
Pass only if:
No dead state
No ownership conflict
No unrecoverable failure

15. ARCHITECTURE CERTIFICATION MATRIX
Rule Category | Severity | Validation Method | Pass Criteria | Blocking
--- | --- | --- | --- | ---
Ownership | Critical | Review + Runtime | No violations | Yes
Runtime Authority | Critical | Review | Single authority | Yes
Dependency Graph | Critical | Static analysis | No cycles | Yes
State Machines | Critical | Runtime tests | Valid transitions | Yes
Event Bus | Critical | Contract audit | Rules enforced | Yes
Scene Lifecycle | Critical | Runtime tests | Lifecycle valid | Yes
Camera Ownership | Critical | Runtime tests | Single owner | Yes
Hero Protection | Critical | Stress tests | Protected | Yes
Asset Budget | Critical | Load tests | Budget respected | Yes
Memory Safety | Critical | Profiling | No leaks | Yes
Performance Governor | High | Load tests | Stable scaling | No
Audio Runtime | Medium | Runtime tests | Recovery works | No
Recovery Framework | Critical | Fault injection | Recovery succeeds | Yes

Severity Levels:
Critical
High
Medium
Low

16. MERGE APPROVAL RULES
Automatic Approval
Requirements:
No Critical failures
No High failures
All blocking rules pass
Certification matrix pass rate = 100% on blocking items

Conditional Approval
Requirements:
No Critical failures
High failures have approved mitigation
Blocking rules pass

Rejection
Required if:
Any Critical violation exists
Any ownership violation exists
Any circular dependency exists
Hero protection violated
Recovery unavailable
Runtime safety violated

17. PRODUCTION READINESS AUDIT
Architecture Compliance Score
Target: ≥ 95%
Blocking Threshold: < 90%

Runtime Safety Score
Target: 100%
Blocking Threshold: < 100%

Ownership Compliance Score
Target: 100%
Blocking Threshold: < 100%

Recovery Compliance Score
Target: ≥ 95%
Blocking Threshold: < 90%

Hero Moment Compliance Score
Target: 100%
Blocking Threshold: < 100%

Production Readiness Score
Target: ≥ 95%
Blocking Threshold: < 90%

FINAL CERTIFICATION DECISION
A release may be certified only if:
All Critical checks pass
All Ownership checks pass
All Runtime Safety checks pass
Hero Moment compliance is 100%
No unresolved architectural violations remain
Production Readiness Score meets threshold

Certification Outcomes
CERTIFIED: All blocking checks pass.
CONDITIONALLY CERTIFIED: No critical failures; documented mitigations approved.
NOT CERTIFIED: One or more blocking rules fail.

ARCHITECTURE COMPLIANCE CHECKLIST STATUS: LOCKED FOR CODE REVIEW, QA VALIDATION, AND RELEASE CERTIFICATION.