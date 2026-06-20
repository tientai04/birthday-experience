// Module 06: Validation Framework
// Architecture validation and runtime compliance validation

import { Command } from './CommandDefinitions';
import { Event } from './EventDefinitions';
import { Signal } from './SignalDefinitions';
import { OwnershipDefinition, OwnershipDomain } from './OwnershipDefinitions';
import { RuntimeRegistry, RuntimeModuleMetadata } from './RuntimeRegistry';
import { ExperienceState, SceneState, TimelineState, TransitionState, CameraState, AudioState, MemoryState, QualityState, HeroState } from '../states';
import { RuntimeAuthority } from './ExperienceDirector';

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IValidationRule<T> {
  validate(target: T): ValidationResult;
}

const commandTypes: readonly string[] = [
  'ACTIVATE_SCENE',
  'START_TRANSITION',
  'START_HERO_MOMENT',
  'PAUSE_TIMELINE',
  'RESUME_TIMELINE',
  'SEEK_TIMELINE',
  'LOAD_ASSET_GROUP',
  'RELEASE_ASSET_GROUP',
  'ALLOCATE_MEMORY_BUDGET',
  'FREE_MEMORY_ALLOCATION',
  'REQUEST_CAMERA_LOCK',
  'RELEASE_CAMERA_LOCK',
  'VALIDATE_SCENE',
  'REQUEST_RECOVERY',
  'COMPLETE_HERO_MOMENT',
];

const eventTypes: readonly string[] = [
  'SCENE_PRELOADED',
  'SCENE_READY',
  'SCENE_ENTERED',
  'SCENE_ACTIVE',
  'SCENE_LEFT',
  'SCENE_DISPOSED',
  'TRANSITION_STARTED',
  'TRANSITION_COMPLETED',
  'HERO_MOMENT_STARTED',
  'HERO_MOMENT_COMPLETED',
  'ASSET_GROUP_LOADED',
  'ASSET_GROUP_RELEASED',
  'MEMORY_LOADED',
  'MEMORY_RELEASED',
  'CAMERA_LOCK_ACQUIRED',
  'CAMERA_LOCK_RELEASED',
  'PERFORMANCE_DOWNGRADED',
  'PERFORMANCE_UPGRADED',
  'RECOVERY_INITIATED',
  'RECOVERY_COMPLETED',
];

const signalTypes: readonly string[] = [
  'FPS_LOW',
  'MEMORY_WARNING',
  'THERMAL_WARNING',
  'CAMERA_AVAILABLE',
  'ASSET_PRESSURE_HIGH',
  'HERO_READY',
  'SCENE_RECOVERY_REQUIRED',
];

function isCommand(target: Command | Event | Signal): target is Command {
  return 'target' in target;
}

function isEvent(target: Command | Event | Signal): target is Event {
  return !('target' in target) && !('payload' in target ? false : false) ? true : 'type' in target && eventTypes.includes(target.type);
}

function isSignal(target: Command | Event | Signal): target is Signal {
  return !('target' in target) && signalTypes.includes(target.type);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export class ContractValidation implements IValidationRule<Command | Event | Signal> {
  public validate(target: Command | Event | Signal): ValidationResult {
    const errors: string[] = [];

    if (typeof target.type !== 'string') {
      errors.push('Invalid type field.');
    }

    if (typeof target.source !== 'string' || target.source.trim().length === 0) {
      errors.push('Invalid or missing source field.');
    }

    if (typeof target.timestamp !== 'number' || Number.isNaN(target.timestamp)) {
      errors.push('Invalid timestamp field.');
    }

    if (isCommand(target)) {
      if (!commandTypes.includes(target.type)) {
        errors.push(`Invalid command type: ${target.type}`);
      }
      if (typeof target.target !== 'string' || target.target.trim().length === 0) {
        errors.push('Command target is required.');
      }
      if (target.payload !== undefined && !isObject(target.payload)) {
        errors.push('Command payload must be an object if provided.');
      }
    } else if (isSignal(target)) {
      if (!signalTypes.includes(target.type)) {
        errors.push(`Invalid signal type: ${target.type}`);
      }
      if (target.payload !== undefined && !isObject(target.payload)) {
        errors.push('Signal payload must be an object if provided.');
      }
    } else {
      if (!eventTypes.includes(target.type)) {
        errors.push(`Invalid event type: ${target.type}`);
      }
      if (target.payload !== undefined && !isObject(target.payload)) {
        errors.push('Event payload must be an object if provided.');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

export class OwnershipValidation {
  constructor(private readonly registry: RuntimeRegistry) {}

  public validateOwnershipIsolation(sourceDomain: OwnershipDomain, targetDomain: OwnershipDomain): ValidationResult {
    const errors: string[] = [];
    const sourceDefinition = this.registry.getOwnershipDefinition(sourceDomain);
    const targetDefinition = this.registry.getOwnershipDefinition(targetDomain);

    if (!sourceDefinition) {
      errors.push(`Ownership definition missing for source domain ${sourceDomain}.`);
    }
    if (!targetDefinition) {
      errors.push(`Ownership definition missing for target domain ${targetDomain}.`);
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    if (!sourceDefinition.allowedDependencies.includes(targetDomain) && sourceDomain !== targetDomain) {
      errors.push(`Ownership isolation violation: ${sourceDomain} may not depend on ${targetDomain}.`);
    }

    return { valid: errors.length === 0, errors };
  }

  public validateOwnerWrites(domain: OwnershipDomain, stateKey: string): ValidationResult {
    const errors: string[] = [];
    const definition = this.registry.getOwnershipDefinition(domain);

    if (!definition) {
      return { valid: false, errors: [`Ownership definition missing for ${domain}.`] };
    }

    if (!definition.writes.includes(stateKey) && !definition.owns.includes(stateKey)) {
      errors.push(`${domain} is not authorized to write ${stateKey}.`);
    }

    return { valid: errors.length === 0, errors };
  }

  public validateOwnerReads(domain: OwnershipDomain, stateKey: string): ValidationResult {
    const errors: string[] = [];
    const definition = this.registry.getOwnershipDefinition(domain);

    if (!definition) {
      return { valid: false, errors: [`Ownership definition missing for ${domain}.`] };
    }

    if (!definition.readOnlyAccess.includes(stateKey) && !definition.owns.includes(stateKey)) {
      errors.push(`${domain} is not authorized to read ${stateKey}.`);
    }

    return { valid: errors.length === 0, errors };
  }
}

export class RuntimeValidation {
  constructor(private readonly authority: RuntimeAuthority, private readonly registry: RuntimeRegistry) {}

  public validateRuntimeAuthority(): ValidationResult {
    const errors: string[] = [];

    if (!this.authority.isHighestAuthority('ExperienceDirector')) {
      errors.push('ExperienceDirector must be the highest runtime authority.');
    }

    return { valid: errors.length === 0, errors };
  }

  public validateSingleSourceOfTruth(): ValidationResult {
    const errors: string[] = [];
    const experienceOwner = this.registry.getOwnershipDefinition('ExperienceDirector');

    if (!experienceOwner) {
      errors.push('ExperienceDirector ownership definition is missing.');
      return { valid: false, errors };
    }

    if (!experienceOwner.owns.includes('GlobalExperienceState')) {
      errors.push('ExperienceDirector must own GlobalExperienceState.');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class StateMachineValidation {
  private readonly experienceTransitions: Record<string, readonly string[]> = {
    Boot: ['Running'],
    Running: ['Transitioning', 'Completed'],
    Transitioning: ['Running', 'Completed'],
    Completed: [],
  };

  private readonly experienceRecoveryTransitions: Record<string, readonly string[]> = {
    Running: ['Boot', 'Transitioning'],
    Transitioning: ['Running', 'Boot'],
  };

  private readonly sceneTransitions: Record<string, readonly string[]> = {
    Preload: ['Ready'],
    Ready: ['Enter'],
    Enter: ['Active'],
    Active: ['Leave'],
    Leave: ['Dispose'],
    Dispose: [],
  };

  private readonly sceneRecoveryTransitions: Record<string, readonly string[]> = {
    Ready: ['Preload'],
    Enter: ['Ready'],
  };

  private readonly transitionTransitions: Record<string, readonly string[]> = {
    Prepare: ['Running'],
    Running: ['Completed'],
    Completed: [],
  };

  private readonly transitionRecoveryTransitions: Record<string, readonly string[]> = {
    Prepare: ['Prepare'],
    Running: ['Prepare'],
  };

  private readonly timelineTransitions: Record<string, readonly string[]> = {
    Idle: ['Scheduled'],
    Scheduled: ['Running'],
    Running: ['Completed'],
    Completed: [],
  };

  private readonly timelineRecoveryTransitions: Record<string, readonly string[]> = {
    Scheduled: ['Idle'],
    Running: ['Scheduled'],
  };

  private readonly cameraTransitions: Record<string, readonly string[]> = {
    Idle: ['Locked'],
    Locked: ['Moving', 'Released'],
    Moving: ['Blending', 'Released'],
    Blending: ['Released'],
    Released: [],
  };

  private readonly cameraRecoveryTransitions: Record<string, readonly string[]> = {
    Locked: ['Idle'],
    Moving: ['Locked'],
    Blending: ['Moving'],
  };

  private readonly audioTransitions: Record<string, readonly string[]> = {
    Loading: ['Ready'],
    Ready: ['Playing'],
    Playing: ['Transitioning', 'Stopped'],
    Transitioning: ['Playing', 'Stopped'],
    Stopped: [],
  };

  private readonly audioRecoveryTransitions: Record<string, readonly string[]> = {
    Ready: ['Loading'],
    Playing: ['Ready'],
    Transitioning: ['Playing'],
  };

  private readonly memoryTransitions: Record<string, readonly string[]> = {
    Inactive: ['Loading'],
    Loading: ['Ready'],
    Ready: ['Visible', 'Released'],
    Visible: ['Released'],
    Released: [],
  };

  private readonly memoryRecoveryTransitions: Record<string, readonly string[]> = {
    Loading: ['Inactive'],
    Ready: ['Loading'],
    Visible: ['Ready'],
  };

  private readonly heroTransitions: Record<string, readonly string[]> = {
    Waiting: ['Validating'],
    Validating: ['Protected', 'Completed'],
    Protected: ['Running'],
    Running: ['Completed'],
    Completed: [],
  };

  private readonly heroRecoveryTransitions: Record<string, readonly string[]> = {
    Validating: ['Waiting'],
    Protected: ['Validating'],
    Running: ['Protected'],
  };

  private readonly qualityTransitions: Record<string, readonly string[]> = {
    Ultra: ['High'],
    High: ['Ultra', 'Medium'],
    Medium: ['High', 'Low'],
    Low: ['Medium', 'Critical'],
    Critical: ['Low'],
  };

  private validateTransition(current: string, next: string, transitions: Record<string, readonly string[]>, label: string): ValidationResult {
    const errors: string[] = [];

    if (!Object.prototype.hasOwnProperty.call(transitions, current)) {
      errors.push(`Invalid ${label} state: ${current}`);
      return { valid: false, errors };
    }

    if (current === next) {
      return { valid: true, errors };
    }

    const allowed = transitions[current];
    if (!allowed.includes(next)) {
      errors.push(`${label} state transition invalid: ${current} -> ${next}`);
    }

    return { valid: errors.length === 0, errors };
  }

  private validateRecoveryTransition(current: string, next: string, recoveryTransitions: Record<string, readonly string[]>, transitions: Record<string, readonly string[]>, label: string): ValidationResult {
    const standardResult = this.validateTransition(current, next, transitions, label);
    if (standardResult.valid) {
      return standardResult;
    }

    if (!Object.prototype.hasOwnProperty.call(recoveryTransitions, current)) {
      return standardResult;
    }

    const allowed = recoveryTransitions[current];
    if (allowed.includes(next)) {
      return { valid: true, errors: [] };
    }

    const errors = [...standardResult.errors, `${label} recovery transition invalid: ${current} -> ${next}`];
    return { valid: false, errors };
  }

  public validateExperienceTransition(current: ExperienceState, next: ExperienceState, recovery = false): ValidationResult {
    return recovery
      ? this.validateRecoveryTransition(current.current, next.current, this.experienceRecoveryTransitions, this.experienceTransitions, 'Experience')
      : this.validateTransition(current.current, next.current, this.experienceTransitions, 'Experience');
  }

  public validateSceneTransition(current: SceneState, next: SceneState, recovery = false): ValidationResult {
    return recovery
      ? this.validateRecoveryTransition(current.current, next.current, this.sceneRecoveryTransitions, this.sceneTransitions, 'Scene')
      : this.validateTransition(current.current, next.current, this.sceneTransitions, 'Scene');
  }

  public validateTimelineTransition(current: TimelineState, next: TimelineState, recovery = false): ValidationResult {
    return recovery
      ? this.validateRecoveryTransition(current.current, next.current, this.timelineRecoveryTransitions, this.timelineTransitions, 'Timeline')
      : this.validateTransition(current.current, next.current, this.timelineTransitions, 'Timeline');
  }

  public validateTransitionStateTransition(current: TransitionState, next: TransitionState, recovery = false): ValidationResult {
    return recovery
      ? this.validateRecoveryTransition(current.current, next.current, this.transitionRecoveryTransitions, this.transitionTransitions, 'Transition')
      : this.validateTransition(current.current, next.current, this.transitionTransitions, 'Transition');
  }

  public validateCameraTransition(current: CameraState, next: CameraState, recovery = false): ValidationResult {
    return recovery
      ? this.validateRecoveryTransition(current.current, next.current, this.cameraRecoveryTransitions, this.cameraTransitions, 'Camera')
      : this.validateTransition(current.current, next.current, this.cameraTransitions, 'Camera');
  }

  public validateAudioTransition(current: AudioState, next: AudioState, recovery = false): ValidationResult {
    return recovery
      ? this.validateRecoveryTransition(current.current, next.current, this.audioRecoveryTransitions, this.audioTransitions, 'Audio')
      : this.validateTransition(current.current, next.current, this.audioTransitions, 'Audio');
  }

  public validateMemoryTransition(current: MemoryState, next: MemoryState, recovery = false): ValidationResult {
    return recovery
      ? this.validateRecoveryTransition(current.current, next.current, this.memoryRecoveryTransitions, this.memoryTransitions, 'Memory')
      : this.validateTransition(current.current, next.current, this.memoryTransitions, 'Memory');
  }

  public validateHeroTransition(current: HeroState, next: HeroState, recovery = false): ValidationResult {
    return recovery
      ? this.validateRecoveryTransition(current.current, next.current, this.heroRecoveryTransitions, this.heroTransitions, 'Hero')
      : this.validateTransition(current.current, next.current, this.heroTransitions, 'Hero');
  }

  public validateQualityTransition(current: QualityState, next: QualityState): ValidationResult {
    return this.validateTransition(current.current, next.current, this.qualityTransitions, 'Quality');
  }
}

export class DependencyValidation {
  constructor(private readonly registry: RuntimeRegistry) {}

  public validateModuleDependencies(metadata: RuntimeModuleMetadata): ValidationResult {
    const errors: string[] = [];

    metadata.dependencies.forEach((dependency) => {
      const module = this.registry.getModule(dependency);
      if (!module) {
        errors.push(`Module dependency not found: ${dependency}`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  public validateOwnershipDependency(domain: OwnershipDomain, dependency: OwnershipDomain): ValidationResult {
    const errors: string[] = [];
    const definition = this.registry.getOwnershipDefinition(domain);

    if (!definition) {
      errors.push(`Ownership definition missing for ${domain}.`);
      return { valid: false, errors };
    }

    if (!definition.allowedDependencies.includes(dependency)) {
      errors.push(`${domain} is not allowed to depend on ${dependency}.`);
    }

    return { valid: errors.length === 0, errors };
  }

  public validateForbiddenDependencies(): ValidationResult {
    const errors: string[] = [];
    const modules = this.registry.getAllModules();

    modules.forEach((module) => {
      module.metadata.dependencies.forEach((dependencyId) => {
        const dependency = this.registry.getModule(dependencyId);
        if (!dependency) {
          errors.push(`Missing module dependency: ${dependencyId}`);
          return;
        }

        const sourceOwner = module.metadata.owner;
        const targetOwner = dependency.metadata.owner;
        const sourceDefinition = this.registry.getOwnershipDefinition(sourceOwner);

        if (!sourceDefinition) {
          errors.push(`Ownership definition missing for ${sourceOwner}.`);
          return;
        }

        if (!sourceDefinition.allowedDependencies.includes(targetOwner) && sourceOwner !== targetOwner) {
          errors.push(`Forbidden dependency: ${sourceOwner} -> ${targetOwner} via module ${module.metadata.moduleId}.`);
        }
      });
    });

    return { valid: errors.length === 0, errors };
  }

  public validateNoCircularDependencies(): ValidationResult {
    const errors: string[] = [];
    const modules = this.registry.getAllModules();
    const visited: Set<string> = new Set();
    const recStack: Set<string> = new Set();

    const graph = new Map<string, readonly string[]>();
    modules.forEach((module) => graph.set(module.metadata.moduleId, module.metadata.dependencies));

    const dfs = (moduleId: string): boolean => {
      if (recStack.has(moduleId)) {
        errors.push(`Circular dependency detected at module ${moduleId}.`);
        return true;
      }
      if (visited.has(moduleId)) {
        return false;
      }
      visited.add(moduleId);
      recStack.add(moduleId);
      const deps = graph.get(moduleId) ?? [];
      deps.forEach((dep) => dfs(dep));
      recStack.delete(moduleId);
      return false;
    };

    modules.forEach((module) => dfs(module.metadata.moduleId));

    return { valid: errors.length === 0, errors };
  }
}

export class ValidationFramework {
  public readonly contractValidation = new ContractValidation();
  public readonly ownershipValidation: OwnershipValidation;
  public readonly runtimeValidation: RuntimeValidation;
  public readonly stateMachineValidation = new StateMachineValidation();
  public readonly dependencyValidation: DependencyValidation;

  constructor(authority: RuntimeAuthority, registry: RuntimeRegistry) {
    this.ownershipValidation = new OwnershipValidation(registry);
    this.runtimeValidation = new RuntimeValidation(authority, registry);
    this.dependencyValidation = new DependencyValidation(registry);
  }

  public validateCommand(command: Command): ValidationResult {
    return this.contractValidation.validate(command);
  }

  public validateEvent(event: Event): ValidationResult {
    return this.contractValidation.validate(event);
  }

  public validateSignal(signal: Signal): ValidationResult {
    return this.contractValidation.validate(signal);
  }
}
