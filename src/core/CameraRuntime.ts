// Module 13: Camera Runtime
// Camera ownership model, lock acquisition/release, priority system, and ownership registration

import { CameraState, CameraStateName } from '../states/CameraState';
import { OwnershipDefinitions, OwnershipDomain } from './OwnershipDefinitions';
import { runtimeRegistry } from './RuntimeRegistry';

export interface CameraLock {
  readonly ownerDomain: OwnershipDomain;
  readonly ownerId: string;
  readonly priority: number;
  readonly acquiredAt: number;
}

export interface CameraRuntimeContract {
  getState(): CameraState;
  getCurrentLock(): CameraLock | undefined;
  requestLock(domain: OwnershipDomain, ownerId: string): { success: boolean; error?: string; preempted?: CameraLock };
  beginMove(ownerId: string): { success: boolean; error?: string };
  beginBlend(ownerId: string): { success: boolean; error?: string };
  releaseLock(ownerId: string): { success: boolean; error?: string };
  validateOwnerDomain(domain: OwnershipDomain): boolean;
  validateTransition(from: CameraStateName, to: CameraStateName): boolean;
}

// Priority mapping: higher number = higher priority
const PRIORITY_MAP: Partial<Record<OwnershipDomain, number>> = {
  TimelineSystem: 1,
  TransitionEngine: 2,
  HeroSystem: 3,
};

const CAMERA_STATE_TRANSITIONS: Record<CameraStateName, readonly CameraStateName[]> = {
  Idle: ['Locked'],
  Locked: ['Moving', 'Released'],
  Moving: ['Blending', 'Released'],
  Blending: ['Released'],
  Released: [],
};

// Ensure canonical CameraSystem ownership is registered with runtime registry
{
  const existing = runtimeRegistry.getOwnershipDefinition('CameraSystem');
  if (!existing) {
    const def = OwnershipDefinitions.find((d) => d.domain === 'CameraSystem');
    if (def) {
      runtimeRegistry.registerOwnership(def);
    }
  }
}

const DEFAULT_STATE: CameraState = {
  current: 'Idle',
  lastUpdated: Date.now(),
};

export class CameraRuntime implements CameraRuntimeContract {
  private state: CameraState = { ...DEFAULT_STATE };
  private lock?: CameraLock;

  public getState(): CameraState {
    return this.state;
  }

  public getCurrentLock(): CameraLock | undefined {
    return this.lock;
  }

  public validateOwnerDomain(domain: OwnershipDomain): boolean {
    // Accept only known ownership domains that are expected to request camera locks
    return domain === 'HeroSystem' || domain === 'TransitionEngine' || domain === 'TimelineSystem' || domain === 'SceneSystem' || domain === 'ExperienceDirector';
  }

  public requestLock(domain: OwnershipDomain, ownerId: string): { success: boolean; error?: string; preempted?: CameraLock } {
    if (!this.validateOwnerDomain(domain)) {
      return { success: false, error: `Domain not permitted to request camera lock: ${domain}` };
    }

    const requestedPriority = PRIORITY_MAP[domain] ?? 0;
    if (requestedPriority === 0) {
      return { success: false, error: `No priority defined for domain ${domain}` };
    }

    const now = Date.now();

    if (!this.lock) {
      // No current owner; grant lock
      this.lock = { ownerDomain: domain, ownerId, priority: requestedPriority, acquiredAt: now };
      this.state = { ...this.state, current: 'Locked', ownerId, priority: requestedPriority, lockAcquiredAt: now, lastUpdated: now };
      return { success: true };
    }

    // If same owner requesting, refresh timestamp
    if (this.lock.ownerId === ownerId && this.lock.ownerDomain === domain) {
      this.lock = { ...this.lock, acquiredAt: now };
      this.state = { ...this.state, lockAcquiredAt: now, lastUpdated: now };
      return { success: true };
    }

    // Conflict: compare priorities
    if (requestedPriority > this.lock.priority) {
      const prev = this.lock;
      // Preempt current owner
      this.lock = { ownerDomain: domain, ownerId, priority: requestedPriority, acquiredAt: now };
      this.state = { ...this.state, current: 'Locked', ownerId, priority: requestedPriority, lockAcquiredAt: now, lastUpdated: now };
      return { success: true, preempted: prev };
    }

    // Requested priority is lower or equal; reject
    return { success: false, error: `Lock held by ${this.lock.ownerDomain}/${this.lock.ownerId} with equal or higher priority` };
  }

  public beginMove(ownerId: string): { success: boolean; error?: string } {
    if (!this.lock || this.lock.ownerId !== ownerId) {
      return { success: false, error: 'Only the current lock owner may begin moving the camera.' };
    }

    if (!this.validateTransition(this.state.current, 'Moving')) {
      return { success: false, error: `Invalid transition from ${this.state.current} to Moving.` };
    }

    const now = Date.now();
    this.state = { ...this.state, current: 'Moving', lastUpdated: now };
    return { success: true };
  }

  public beginBlend(ownerId: string): { success: boolean; error?: string } {
    if (!this.lock || this.lock.ownerId !== ownerId) {
      return { success: false, error: 'Only the current lock owner may begin blending the camera.' };
    }

    if (!this.validateTransition(this.state.current, 'Blending')) {
      return { success: false, error: `Invalid transition from ${this.state.current} to Blending.` };
    }

    const now = Date.now();
    this.state = { ...this.state, current: 'Blending', lastUpdated: now };
    return { success: true };
  }

  public releaseLock(ownerId: string): { success: boolean; error?: string } {
    if (!this.lock) {
      return { success: false, error: 'No camera lock to release.' };
    }

    if (this.lock.ownerId !== ownerId) {
      return { success: false, error: 'Only the lock owner may release the camera lock.' };
    }

    // Release lock
    this.lock = undefined;
    const now = Date.now();
    this.state = { ...this.state, current: 'Released', ownerId: undefined, priority: undefined, lockAcquiredAt: undefined, lastUpdated: now };
    return { success: true };
  }

  public validateTransition(from: CameraStateName, to: CameraStateName): boolean {
    const allowed = CAMERA_STATE_TRANSITIONS[from] ?? [];
    return allowed.includes(to);
  }
}
