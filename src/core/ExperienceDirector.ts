// Module 04: Experience Director
// Experience Director ownership and lifecycle orchestration

import { Command } from './CommandDefinitions';
import { OwnershipDefinition, OwnershipDomain, OwnershipDefinitions } from './OwnershipDefinitions';
import { RuntimeRegistry, runtimeRegistry } from './RuntimeRegistry';
import { ExperienceState, ExperienceStateName } from '../states/ExperienceState';

export interface RuntimeAuthority {
  readonly highestAuthority: OwnershipDomain;
  readonly authorityChain: readonly OwnershipDomain[];
  isHighestAuthority(domain: OwnershipDomain): boolean;
}

export interface RecoveryAuthority {
  requestRecovery(reason: string, context?: RecoveryContext): RecoveryRequest;
  getCurrentRecoveryState(): RecoveryContext | undefined;
}

export interface RecoveryContext {
  readonly sceneId?: string;
  readonly transitionId?: string;
  readonly reason: string;
  readonly requestedAt: number;
}

export interface RecoveryRequest {
  readonly accepted: boolean;
  readonly context: RecoveryContext;
}

export const ExperienceStateOwnership: OwnershipDefinition = {
  domain: 'ExperienceDirector',
  owns: ['GlobalExperienceState'],
  readOnlyAccess: ['SceneState', 'TimelineState', 'CameraState', 'AudioState', 'MemoryState', 'TransitionState', 'HeroState', 'QualityState'],
  writes: ['GlobalExperienceState'],
  allowedDependencies: [],
};

export class ExperienceDirector implements RuntimeAuthority, RecoveryAuthority {
  public readonly highestAuthority: OwnershipDomain = 'ExperienceDirector';
  public readonly authorityChain: readonly OwnershipDomain[] = [
    'ExperienceDirector',
    'SceneSystem',
    'TimelineSystem',
    'TransitionEngine',
    'CameraSystem',
    'AudioSystem',
    'MemorySystem',
    'PerformanceGovernor',
    'HeroSystem',
    'RecoveryFramework',
  ];

  private experienceState: ExperienceState;
  private readonly registry: RuntimeRegistry;
  private currentRecoveryContext?: RecoveryContext;

  constructor(initialState: ExperienceState, registry: RuntimeRegistry = runtimeRegistry) {
    this.experienceState = initialState;
    this.registry = registry;
    this.registerExperienceOwnership();
  }

  public initialize(state: ExperienceState): void {
    this.assertAuthority('ExperienceDirector');
    this.experienceState = state;
  }

  public dispatchCommand(command: Command): void {
    this.assertAuthority('ExperienceDirector');
    // Command routing and handling are intentionally undefined in Module 04.
    // This method exists to establish the command-based authority model.
  }

  public getExperienceState(): Readonly<ExperienceState> {
    return this.experienceState;
  }

  public updateExperienceState(current: ExperienceStateName, activeSceneId?: string): void {
    this.assertAuthority('ExperienceDirector');
    this.experienceState = {
      ...this.experienceState,
      current,
      activeSceneId,
      lastUpdated: Date.now(),
    };
  }

  public isHighestAuthority(domain: OwnershipDomain): boolean {
    return domain === this.highestAuthority;
  }

  public requestRecovery(reason: string, context?: Omit<RecoveryContext, 'requestedAt'>): RecoveryRequest {
    this.assertAuthority('ExperienceDirector');

    const recoveryContext: RecoveryContext = {
      reason,
      requestedAt: Date.now(),
      ...context,
    };

    this.currentRecoveryContext = recoveryContext;

    return {
      accepted: true,
      context: recoveryContext,
    };
  }

  public getCurrentRecoveryState(): RecoveryContext | undefined {
    return this.currentRecoveryContext;
  }

  public getOwnershipDefinition(domain: OwnershipDomain): OwnershipDefinition | undefined {
    return this.registry.getOwnershipDefinition(domain);
  }

  public getRegisteredModules(): readonly RuntimeRegistry['getAllModules'] extends () => infer R ? R : never {
    return this.registry.getAllModules();
  }

  private assertAuthority(domain: OwnershipDomain): void {
    if (domain !== this.highestAuthority) {
      throw new Error('ExperienceDirector must remain the highest runtime authority.');
    }
  }

  private registerExperienceOwnership(): void {
    const registered = this.registry.getOwnershipDefinition(this.highestAuthority);
    if (!registered) {
      this.registry.registerOwnership(ExperienceStateOwnership);
    }
  }
}
