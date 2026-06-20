// Core event definitions for Birthday Experience Project
// Module 01: Core Contracts

export type EventType =
  | 'SCENE_PRELOADED'
  | 'SCENE_READY'
  | 'SCENE_ENTERED'
  | 'SCENE_ACTIVE'
  | 'SCENE_LEFT'
  | 'SCENE_DISPOSED'
  | 'TRANSITION_STARTED'
  | 'TRANSITION_COMPLETED'
  | 'HERO_MOMENT_STARTED'
  | 'HERO_MOMENT_COMPLETED'
  | 'ASSET_GROUP_LOADED'
  | 'ASSET_GROUP_RELEASED'
  | 'MEMORY_LOADED'
  | 'MEMORY_RELEASED'
  | 'CAMERA_LOCK_ACQUIRED'
  | 'CAMERA_LOCK_RELEASED'
  | 'PERFORMANCE_DOWNGRADED'
  | 'PERFORMANCE_UPGRADED'
  | 'RECOVERY_INITIATED'
  | 'RECOVERY_COMPLETED';

export interface EventPayload {
  [key: string]: unknown;
}

export interface Event {
  readonly type: EventType;
  readonly source: string;
  readonly payload?: EventPayload;
  readonly timestamp: number;
}
