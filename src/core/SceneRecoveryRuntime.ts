// Module 09: Scene Recovery Runtime
// Recovery contracts, recovery state machine, retry and rollback strategy, safe scene recovery

import { OwnershipDefinition } from './OwnershipDefinitions';
import { SceneState, SceneStateName } from '../states/SceneState';

export type RecoveryStateName = 'Detected' | 'Recovering' | 'Stabilized' | 'Resumed';

export interface RecoveryState {
  readonly current: RecoveryStateName;
  readonly sceneId?: string;
  readonly reason: string;
  readonly retryCount: number;
  readonly lastUpdated: number;
}

export interface SceneRecoveryContract {
  createRecoveryState(sceneId: string | undefined, reason: string): RecoveryState;
  getAllowedRecoveryTransitions(current: RecoveryStateName): readonly RecoveryStateName[];
  validateRecoveryTransition(current: RecoveryStateName, next: RecoveryStateName): RecoveryValidationResult;
  transitionRecoveryState(current: RecoveryState, next: RecoveryStateName): RecoveryState;
  evaluateRetryStrategy(current: RecoveryState): number;
  shouldRollbackScene(state: RecoveryState): boolean;
}

export interface RecoveryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export const SceneRecoveryOwnership: OwnershipDefinition = {
  domain: 'RecoveryFramework',
  owns: ['RecoveryState'],
  readOnlyAccess: ['GlobalExperienceState', 'SceneState', 'TimelineState', 'CameraState', 'AudioState', 'MemoryState', 'TransitionState', 'HeroState', 'QualityState'],
  writes: ['RecoveryState'],
  allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem', 'TransitionEngine', 'CameraSystem', 'AudioSystem', 'MemorySystem', 'PerformanceGovernor', 'HeroSystem'],
};

export const RecoveryTransitions: readonly { readonly from: RecoveryStateName; readonly to: RecoveryStateName }[] = [
  { from: 'Detected', to: 'Recovering' },
  { from: 'Recovering', to: 'Stabilized' },
  { from: 'Stabilized', to: 'Resumed' },
];

export const RecoveryTransitionMap: Record<RecoveryStateName, readonly RecoveryStateName[]> = {
  Detected: ['Recovering'],
  Recovering: ['Stabilized'],
  Stabilized: ['Resumed'],
  Resumed: [],
};

export class SceneRecoveryRuntime implements SceneRecoveryContract {
  private static readonly maxRetries = 3;
  private static readonly rollbackThreshold = 2;

  public createRecoveryState(sceneId: string | undefined, reason: string): RecoveryState {
    return {
      current: 'Detected',
      sceneId,
      reason,
      retryCount: 0,
      lastUpdated: Date.now(),
    };
  }

  public getAllowedRecoveryTransitions(current: RecoveryStateName): readonly RecoveryStateName[] {
    return RecoveryTransitionMap[current] ?? [];
  }

  public validateRecoveryTransition(current: RecoveryStateName, next: RecoveryStateName): RecoveryValidationResult {
    const errors: string[] = [];

    if (!Object.prototype.hasOwnProperty.call(RecoveryTransitionMap, current)) {
      errors.push(`Invalid recovery state: ${current}`);
      return { valid: false, errors };
    }

    if (current === next) {
      return { valid: true, errors };
    }

    const allowedTransitions = this.getAllowedRecoveryTransitions(current);
    if (!allowedTransitions.includes(next)) {
      errors.push(`Invalid recovery transition: ${current} -> ${next}`);
    }

    return { valid: errors.length === 0, errors };
  }

  public transitionRecoveryState(current: RecoveryState, next: RecoveryStateName): RecoveryState {
    const validation = this.validateRecoveryTransition(current.current, next);
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '));
    }

    return {
      ...current,
      current: next,
      retryCount: next === 'Recovering' ? current.retryCount + 1 : current.retryCount,
      lastUpdated: Date.now(),
    };
  }

  public evaluateRetryStrategy(current: RecoveryState): number {
    if (current.current === 'Detected' || current.current === 'Recovering') {
      return Math.min(SceneRecoveryRuntime.maxRetries - current.retryCount, 0);
    }
    return 0;
  }

  public shouldRollbackScene(state: RecoveryState): boolean {
    return state.retryCount >= SceneRecoveryRuntime.rollbackThreshold && state.current === 'Recovering';
  }

  public canRecoverScene(sceneState: SceneState): boolean {
    return sceneState.current !== 'Dispose';
  }
}
