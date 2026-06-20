// Module 08: Scene Lifecycle Runtime
// Scene lifecycle state machine, validation, transition guards, and ownership rules

import { SceneState, SceneStateName } from '../states/SceneState';
import { OwnershipDefinition } from './OwnershipDefinitions';

export interface LifecycleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface SceneLifecycleContract {
  getAllowedTransitions(current: SceneStateName): readonly SceneStateName[];
  validateTransition(current: SceneStateName, next: SceneStateName): LifecycleValidationResult;
  canActivateScene(state: SceneState): boolean;
  canCompleteActivation(state: SceneState): boolean;
  canBeginLeave(state: SceneState): boolean;
  canCompleteDisposal(state: SceneState): boolean;
  transitionSceneState(current: SceneState, next: SceneStateName): SceneState;
  createInitialSceneState(sceneId: string): SceneState;
}

export const SceneLifecycleOwnership: OwnershipDefinition = {
  domain: 'SceneSystem',
  owns: ['SceneState'],
  readOnlyAccess: ['GlobalExperienceState'],
  writes: ['SceneState'],
  allowedDependencies: ['ExperienceDirector'],
};

export const SceneLifecycleTransitions: readonly { readonly from: SceneStateName; readonly to: SceneStateName }[] = [
  { from: 'Preload', to: 'Ready' },
  { from: 'Ready', to: 'Enter' },
  { from: 'Enter', to: 'Active' },
  { from: 'Active', to: 'Leave' },
  { from: 'Leave', to: 'Dispose' },
];

export const SceneLifecycleTransitionMap: Record<SceneStateName, readonly SceneStateName[]> = {
  Preload: ['Ready'],
  Ready: ['Enter'],
  Enter: ['Active'],
  Active: ['Leave'],
  Leave: ['Dispose'],
  Dispose: [],
};

export class SceneLifecycleRuntime implements SceneLifecycleContract {
  public getAllowedTransitions(current: SceneStateName): readonly SceneStateName[] {
    return SceneLifecycleTransitionMap[current] ?? [];
  }

  public validateTransition(current: SceneStateName, next: SceneStateName): LifecycleValidationResult {
    const errors: string[] = [];

    if (!Object.prototype.hasOwnProperty.call(SceneLifecycleTransitionMap, current)) {
      errors.push(`Invalid scene lifecycle state: ${current}`);
      return { valid: false, errors };
    }

    if (current === next) {
      return { valid: true, errors };
    }

    const allowedTransitions = this.getAllowedTransitions(current);
    if (!allowedTransitions.includes(next)) {
      errors.push(`Invalid scene lifecycle transition: ${current} -> ${next}`);
    }

    return { valid: errors.length === 0, errors };
  }

  public canActivateScene(state: SceneState): boolean {
    return state.current === 'Ready';
  }

  public canCompleteActivation(state: SceneState): boolean {
    return state.current === 'Enter';
  }

  public canBeginLeave(state: SceneState): boolean {
    return state.current === 'Active';
  }

  public canCompleteDisposal(state: SceneState): boolean {
    return state.current === 'Leave';
  }

  public transitionSceneState(current: SceneState, next: SceneStateName): SceneState {
    const validation = this.validateTransition(current.current, next);
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '));
    }

    return {
      ...current,
      current: next,
      lastTransitionTime: Date.now(),
    };
  }

  public createInitialSceneState(sceneId: string): SceneState {
    return {
      sceneId,
      current: 'Preload',
      lastTransitionTime: Date.now(),
      preloadProgress: 0,
      isRecoveryPending: false,
    };
  }
}
