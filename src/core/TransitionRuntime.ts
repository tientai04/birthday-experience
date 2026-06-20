// Module 17: Transition Runtime
// Transition lifecycle, state machine, camera/audio coordination, and ownership registration

import { TransitionState, TransitionStateName } from '../states/TransitionState';
import { OwnershipDefinitions } from './OwnershipDefinitions';
import { runtimeRegistry } from './RuntimeRegistry';
import { CameraLock } from './CameraRuntime';

export interface TransitionRequest {
  readonly sourceSceneId: string;
  readonly targetSceneId: string;
  readonly transitionDurationMs: number;
}

export interface TransitionRuntimeContract {
  getState(): TransitionState;
  startTransition(request: TransitionRequest): TransitionState;
  beginExecution(): TransitionState;
  completeTransition(): TransitionState;
  cancelTransition(): TransitionState;
  isTransitionActive(): boolean;
  getSourceScene(): string | undefined;
  getTargetScene(): string | undefined;
  validateTransition(from: TransitionStateName, to: TransitionStateName): boolean;
}

const TRANSITION_STATE_TRANSITIONS: Record<TransitionStateName, readonly TransitionStateName[]> = {
  Prepare: ['Running', 'Completed'],
  Running: ['Completed'],
  Completed: [],
};

// Ensure canonical TransitionEngine ownership is registered with runtime registry
{
  const existing = runtimeRegistry.getOwnershipDefinition('TransitionEngine');
  if (!existing) {
    const def = OwnershipDefinitions.find((d) => d.domain === 'TransitionEngine');
    if (def) {
      runtimeRegistry.registerOwnership(def);
    }
  }
}

const DEFAULT_TRANSITION_STATE: TransitionState = {
  current: 'Completed',
  lastUpdated: Date.now(),
};

export interface TransitionLocks {
  readonly camera?: CameraLock;
  readonly audioPriority?: string;
}

export class TransitionRuntime implements TransitionRuntimeContract {
  private state: TransitionState = { ...DEFAULT_TRANSITION_STATE };
  private locks: TransitionLocks = {};
  private startedAt?: number;
  private durationMs: number = 0;

  public getState(): TransitionState {
    return this.state;
  }

  public startTransition(request: TransitionRequest): TransitionState {
    if (this.state.current !== 'Completed') {
      throw new Error('Cannot start a new transition while one is in progress.');
    }

    if (!request.sourceSceneId || !request.targetSceneId) {
      throw new Error('Transition request must specify both source and target scene IDs.');
    }

    if (request.transitionDurationMs <= 0) {
      throw new Error('Transition duration must be positive.');
    }

    this.assertTransition('Completed', 'Prepare');

    const now = Date.now();
    this.durationMs = request.transitionDurationMs;
    this.startedAt = undefined;

    this.state = {
      current: 'Prepare',
      sourceSceneId: request.sourceSceneId,
      targetSceneId: request.targetSceneId,
      startTime: now,
      lastUpdated: now,
    };

    return this.state;
  }

  public beginExecution(): TransitionState {
    if (this.state.current !== 'Prepare') {
      throw new Error('Transition must be in Prepare state to begin execution.');
    }

    this.assertTransition('Prepare', 'Running');

    const now = Date.now();
    this.startedAt = now;

    this.state = {
      ...this.state,
      current: 'Running',
      lastUpdated: now,
    };

    return this.state;
  }

  public completeTransition(): TransitionState {
    if (this.state.current !== 'Running') {
      throw new Error('Transition must be in Running state to complete.');
    }

    this.assertTransition('Running', 'Completed');

    const now = Date.now();

    this.state = {
      ...this.state,
      current: 'Completed',
      lastUpdated: now,
    };

    this.locks = {};
    this.startedAt = undefined;
    this.durationMs = 0;

    return this.state;
  }

  public cancelTransition(): TransitionState {
    if (this.state.current === 'Completed') {
      throw new Error('Cannot cancel a transition that is already completed.');
    }

    const now = Date.now();

    this.state = {
      ...this.state,
      current: 'Completed',
      lastUpdated: now,
    };

    this.locks = {};
    this.startedAt = undefined;
    this.durationMs = 0;

    return this.state;
  }

  public isTransitionActive(): boolean {
    return this.state.current !== 'Completed';
  }

  public getSourceScene(): string | undefined {
    return this.state.sourceSceneId;
  }

  public getTargetScene(): string | undefined {
    return this.state.targetSceneId;
  }

  public validateTransition(from: TransitionStateName, to: TransitionStateName): boolean {
    const allowed = TRANSITION_STATE_TRANSITIONS[from] ?? [];
    return allowed.includes(to);
  }

  public attachCameraLock(lock: CameraLock): void {
    if (!this.isTransitionActive()) {
      throw new Error('Cannot attach camera lock to inactive transition.');
    }

    this.locks.camera = lock;
  }

  public detachCameraLock(): CameraLock | undefined {
    const lock = this.locks.camera;
    this.locks.camera = undefined;
    return lock;
  }

  public getCameraLock(): CameraLock | undefined {
    return this.locks.camera;
  }

  public attachAudioPriority(priorityId: string): void {
    if (!this.isTransitionActive()) {
      throw new Error('Cannot attach audio priority to inactive transition.');
    }

    this.locks.audioPriority = priorityId;
  }

  public detachAudioPriority(): string | undefined {
    const priorityId = this.locks.audioPriority;
    this.locks.audioPriority = undefined;
    return priorityId;
  }

  public getAudioPriority(): string | undefined {
    return this.locks.audioPriority;
  }

  public getElapsedMs(): number {
    if (!this.startedAt) {
      return 0;
    }
    return Date.now() - this.startedAt;
  }

  public getDurationMs(): number {
    return this.durationMs;
  }

  public isExecutionComplete(): boolean {
    if (this.state.current !== 'Running') {
      return false;
    }
    return this.getElapsedMs() >= this.durationMs;
  }

  private assertTransition(from: TransitionStateName, to: TransitionStateName): void {
    if (!this.validateTransition(from, to)) {
      throw new Error(`Invalid transition state transition from ${from} to ${to}.`);
    }
  }
}
