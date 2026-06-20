// Module 02: State Models
// Quality State Model for Birthday Experience Project

export type QualityStateName = 'Ultra' | 'High' | 'Medium' | 'Low' | 'Critical';

export interface QualityState {
  readonly current: QualityStateName;
  readonly fallbackLevel?: QualityStateName;
  readonly lastChanged: number;
  readonly isHysteresisActive: boolean;
}
