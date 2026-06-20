// Module 02: State Models
// Scene State Model for Birthday Experience Project

export type SceneStateName = 'Preload' | 'Ready' | 'Enter' | 'Active' | 'Leave' | 'Dispose';

export interface SceneState {
  readonly sceneId: string;
  readonly current: SceneStateName;
  readonly lastTransitionTime: number;
  readonly preloadProgress: number;
  readonly isRecoveryPending: boolean;
}
