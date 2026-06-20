// Core command definitions for Birthday Experience Project
// Module 01: Core Contracts

export type CommandType =
  | 'ACTIVATE_SCENE'
  | 'START_TRANSITION'
  | 'START_HERO_MOMENT'
  | 'PAUSE_TIMELINE'
  | 'RESUME_TIMELINE'
  | 'SEEK_TIMELINE'
  | 'LOAD_ASSET_GROUP'
  | 'RELEASE_ASSET_GROUP'
  | 'ALLOCATE_MEMORY_BUDGET'
  | 'FREE_MEMORY_ALLOCATION'
  | 'REQUEST_CAMERA_LOCK'
  | 'RELEASE_CAMERA_LOCK'
  | 'VALIDATE_SCENE'
  | 'REQUEST_RECOVERY'
  | 'COMPLETE_HERO_MOMENT';

export interface CommandPayload {
  [key: string]: unknown;
}

export interface Command {
  readonly type: CommandType;
  readonly source: string;
  readonly target: string;
  readonly payload?: CommandPayload;
  readonly timestamp: number;
}
