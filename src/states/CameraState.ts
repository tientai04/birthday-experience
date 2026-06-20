// Module 02: State Models
// Camera State Model for Birthday Experience Project

export type CameraStateName = 'Idle' | 'Locked' | 'Moving' | 'Blending' | 'Released';

export interface CameraState {
  readonly current: CameraStateName;
  readonly ownerId?: string;
  readonly priority?: number;
  readonly lockAcquiredAt?: number;
  readonly lastUpdated: number;
}
