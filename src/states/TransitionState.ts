// Module 02: State Models
// Transition State Model for Birthday Experience Project

export type TransitionStateName = 'Prepare' | 'Running' | 'Completed';

export interface TransitionState {
  readonly current: TransitionStateName;
  readonly sourceSceneId?: string;
  readonly targetSceneId?: string;
  readonly startTime?: number;
  readonly lastUpdated: number;
}
