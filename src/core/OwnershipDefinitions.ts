// Ownership definitions for Birthday Experience Project
// Module 01: Core Contracts

export type OwnershipDomain =
  | 'ExperienceDirector'
  | 'SceneSystem'
  | 'TimelineSystem'
  | 'TransitionEngine'
  | 'CameraSystem'
  | 'AudioSystem'
  | 'MemorySystem'
  | 'AssetSystem'
  | 'PerformanceGovernor'
  | 'HeroSystem'
  | 'RecoveryFramework';

export interface OwnershipDefinition {
  readonly domain: OwnershipDomain;
  readonly owns: readonly string[];
  readonly readOnlyAccess: readonly string[];
  readonly writes: readonly string[];
  readonly allowedDependencies: readonly OwnershipDomain[];
}

export const OwnershipDefinitions: readonly OwnershipDefinition[] = [
  {
    domain: 'ExperienceDirector',
    owns: ['GlobalExperienceState'],
    readOnlyAccess: ['SceneState', 'TimelineState', 'CameraState', 'AudioState', 'MemoryState', 'TransitionState', 'HeroState', 'QualityState'],
    writes: ['GlobalExperienceState'],
    allowedDependencies: [],
  },
  {
    domain: 'SceneSystem',
    owns: ['SceneState'],
    readOnlyAccess: ['GlobalExperienceState'],
    writes: ['SceneState'],
    allowedDependencies: ['ExperienceDirector'],
  },
  {
    domain: 'TimelineSystem',
    owns: ['TimelineState'],
    readOnlyAccess: ['SceneState', 'GlobalExperienceState'],
    writes: ['TimelineState'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem'],
  },
  {
    domain: 'TransitionEngine',
    owns: ['TransitionState'],
    readOnlyAccess: ['SceneState', 'TimelineState', 'CameraState'],
    writes: ['TransitionState'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem'],
  },
  {
    domain: 'AssetSystem',
    owns: ['AssetRegistry'],
    readOnlyAccess: ['GlobalExperienceState', 'SceneState', 'TimelineState'],
    writes: ['AssetRegistry'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem'],
  },
  {
    domain: 'CameraSystem',
    owns: ['CameraState'],
    readOnlyAccess: ['GlobalExperienceState', 'SceneState', 'TimelineState', 'TransitionState'],
    writes: ['CameraState'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem', 'TransitionEngine'],
  },
  {
    domain: 'AudioSystem',
    owns: ['AudioState'],
    readOnlyAccess: ['GlobalExperienceState', 'SceneState', 'TimelineState'],
    writes: ['AudioState'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem'],
  },
  {
    domain: 'MemorySystem',
    owns: ['MemoryState'],
    readOnlyAccess: ['GlobalExperienceState', 'SceneState', 'TimelineState'],
    writes: ['MemoryState'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem', 'AssetSystem'],
  },
  {
    domain: 'AssetSystem',
    owns: ['AssetRegistry'],
    readOnlyAccess: ['GlobalExperienceState', 'SceneState', 'TimelineState'],
    writes: ['AssetRegistry'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem'],
  },
  {
    domain: 'PerformanceGovernor',
    owns: ['QualityState'],
    readOnlyAccess: ['GlobalExperienceState', 'SceneState', 'TimelineState', 'CameraState', 'AudioState', 'MemoryState'],
    writes: ['QualityState'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem', 'CameraSystem', 'AudioSystem', 'MemorySystem'],
  },
  {
    domain: 'HeroSystem',
    owns: ['HeroState'],
    readOnlyAccess: ['SceneState', 'TimelineState', 'CameraState', 'AudioState', 'MemoryState'],
    writes: ['HeroState'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem', 'CameraSystem', 'AudioSystem', 'MemorySystem'],
  },
  {
    domain: 'RecoveryFramework',
    owns: ['RecoveryState'],
    readOnlyAccess: ['GlobalExperienceState', 'SceneState', 'TimelineState', 'CameraState', 'AudioState', 'MemoryState', 'TransitionState', 'HeroState', 'QualityState'],
    writes: ['RecoveryState'],
    allowedDependencies: ['ExperienceDirector', 'SceneSystem', 'TimelineSystem', 'TransitionEngine', 'CameraSystem', 'AudioSystem', 'MemorySystem', 'PerformanceGovernor', 'HeroSystem'],
  },
];
