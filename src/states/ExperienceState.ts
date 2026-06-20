// Module 02: State Models
// Experience State Model for Birthday Experience Project

export type ExperienceStateName = 'Boot' | 'Running' | 'Transitioning' | 'Completed';

export interface ExperienceState {
  readonly current: ExperienceStateName;
  readonly lastUpdated: number;
  readonly activeSceneId?: string;
  readonly isRecoveryActive: boolean;
}
