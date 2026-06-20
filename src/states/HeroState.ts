// Module 02: State Models
// Hero State Model for Birthday Experience Project

export type HeroStateName = 'Waiting' | 'Validating' | 'Protected' | 'Running' | 'Completed';

export interface HeroState {
  readonly current: HeroStateName;
  readonly isReady: boolean;
  readonly portraitAssetId?: string;
  readonly triggerTimestamp?: number;
  readonly lastUpdated: number;
}
