// Core signal definitions for Birthday Experience Project
// Module 01: Core Contracts

export type SignalType =
  | 'FPS_LOW'
  | 'MEMORY_WARNING'
  | 'THERMAL_WARNING'
  | 'CAMERA_AVAILABLE'
  | 'ASSET_PRESSURE_HIGH'
  | 'HERO_READY'
  | 'SCENE_RECOVERY_REQUIRED';

export interface SignalPayload {
  [key: string]: unknown;
}

export interface Signal {
  readonly type: SignalType;
  readonly source: string;
  readonly payload?: SignalPayload;
  readonly timestamp: number;
}
