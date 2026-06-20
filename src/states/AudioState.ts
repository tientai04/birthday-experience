// Module 02: State Models
// Audio State Model for Birthday Experience Project

export type AudioStateName = 'Loading' | 'Ready' | 'Playing' | 'Transitioning' | 'Stopped';

export interface AudioState {
  readonly current: AudioStateName;
  readonly activeTrackId?: string;
  readonly volumeLevel: number;
  readonly lastUpdated: number;
}
