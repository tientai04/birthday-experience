// Module 10: Timeline Runtime
// Timeline scheduling and execution contracts, TimelineState ownership, and state transitions

import { TimelineState, TimelineStateName, TimelineStateTransitionMap, isValidTimelineStateTransition } from '../states/TimelineState';
import { OwnershipDefinitions } from './OwnershipDefinitions';
import { runtimeRegistry } from './RuntimeRegistry';

export interface TimelineSchedulingRequest {
  readonly sceneId: string;
  readonly scheduledAt?: number; // epoch ms, optional
  readonly metadata?: Record<string, unknown>;
}

export interface TimelineExecutionContext {
  readonly sceneId: string;
  readonly startedAt?: number;
  readonly completedAt?: number;
}

export interface TimelineRuntimeContract {
  getState(): TimelineState;
  createInitialState(): TimelineState;
  schedule(request: TimelineSchedulingRequest): TimelineState;
  start(): TimelineState;
  complete(): TimelineState;
  validateTransition(from: TimelineStateName, to: TimelineStateName): boolean;
}

// Ensure canonical Timeline ownership is registered with the runtime registry.
// Use the authoritative definition from Module 01 (`OwnershipDefinitions`) rather than
// declaring a duplicate here.
{
  const existing = runtimeRegistry.getOwnershipDefinition('TimelineSystem');
  if (!existing) {
    const def = OwnershipDefinitions.find((d) => d.domain === 'TimelineSystem');
    if (def) {
      runtimeRegistry.registerOwnership(def);
    }
  }
}

const DEFAULT_INITIAL_STATE: TimelineState = {
  current: 'Idle',
  lastUpdated: Date.now(),
  isRecoveryPending: false,
};

export class TimelineRuntime implements TimelineRuntimeContract {
  private state: TimelineState;
  private context?: TimelineExecutionContext;

  constructor(initial?: TimelineState) {
    this.state = initial ?? DEFAULT_INITIAL_STATE;
  }

  public getState(): TimelineState {
    return this.state;
  }

  public createInitialState(): TimelineState {
    this.state = { ...DEFAULT_INITIAL_STATE, lastUpdated: Date.now() };
    this.context = undefined;
    return this.state;
  }

  public schedule(request: TimelineSchedulingRequest): TimelineState {
    // Only allow scheduling from Idle
    if (this.state.current !== 'Idle') {
      throw new Error(`Cannot schedule timeline from state ${this.state.current}`);
    }

    const next: TimelineState = {
      ...this.state,
      current: 'Scheduled',
      scheduledSceneId: request.sceneId,
      startTime: request.scheduledAt,
      lastUpdated: Date.now(),
      isRecoveryPending: false,
    };

    this.state = next;
    return this.state;
  }

  public start(): TimelineState {
    // Allow start only from Scheduled
    if (this.state.current !== 'Scheduled') {
      throw new Error(`Cannot start timeline from state ${this.state.current}`);
    }

    const next: TimelineState = {
      ...this.state,
      current: 'Running',
      startTime: this.state.startTime ?? Date.now(),
      lastUpdated: Date.now(),
    };

    this.context = {
      sceneId: next.scheduledSceneId ?? '',
      startedAt: next.startTime,
    };

    this.state = next;
    return this.state;
  }

  public complete(): TimelineState {
    // Allow complete only from Running
    if (this.state.current !== 'Running') {
      throw new Error(`Cannot complete timeline from state ${this.state.current}`);
    }

    const next: TimelineState = {
      ...this.state,
      current: 'Completed',
      completionTime: Date.now(),
      lastUpdated: Date.now(),
    };

    if (this.context) {
      this.context = { ...this.context, completedAt: next.completionTime };
    }

    this.state = next;
    return this.state;
  }

  public validateTransition(from: TimelineStateName, to: TimelineStateName): boolean {
    // Use state-level helper when available; otherwise use local map
    try {
      return isValidTimelineStateTransition(from, to);
    } catch {
      const allowed = TimelineStateTransitionMap[from] ?? [];
      return allowed.includes(to);
    }
  }
}
