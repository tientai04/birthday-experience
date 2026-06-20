// Module 03: Runtime Registry
// Runtime Registration, Module Discovery, Ownership Registration

import { OwnershipDefinition, OwnershipDefinitions, OwnershipDomain } from './OwnershipDefinitions';
import { ExperienceState } from '../states/ExperienceState';
import { SceneState } from '../states/SceneState';
import { TransitionState } from '../states/TransitionState';
import { CameraState } from '../states/CameraState';
import { AudioState } from '../states/AudioState';
import { MemoryState } from '../states/MemoryState';
import { QualityState } from '../states/QualityState';
import { HeroState } from '../states/HeroState';

export type RuntimeDomain =
  | 'Core'
  | 'Scene'
  | 'Timeline'
  | 'Camera'
  | 'Audio'
  | 'Assets'
  | 'Memory'
  | 'Transition'
  | 'Hero'
  | 'Performance'
  | 'Recovery';

export interface RuntimeModuleMetadata {
  readonly moduleId: string;
  readonly name: string;
  readonly domain: RuntimeDomain;
  readonly dependencies: readonly string[];
  readonly owner: OwnershipDomain;
  readonly description?: string;
}

export interface RuntimeModuleRegistration {
  readonly metadata: RuntimeModuleMetadata;
  readonly createdAt: number;
}

export class RuntimeRegistry {
  private readonly modules: Map<string, RuntimeModuleRegistration> = new Map();
  private readonly ownershipMap: Map<OwnershipDomain, OwnershipDefinition> = new Map();

  constructor() {
    OwnershipDefinitions.forEach((definition) => {
      this.ownershipMap.set(definition.domain, definition);
    });
  }

  registerModule(metadata: RuntimeModuleMetadata): RuntimeModuleRegistration {
    if (this.modules.has(metadata.moduleId)) {
      throw new Error(`Runtime module already registered: ${metadata.moduleId}`);
    }

    const registration: RuntimeModuleRegistration = {
      metadata,
      createdAt: Date.now(),
    };

    this.modules.set(metadata.moduleId, registration);
    return registration;
  }

  getModule(moduleId: string): RuntimeModuleRegistration | undefined {
    return this.modules.get(moduleId);
  }

  getAllModules(): readonly RuntimeModuleRegistration[] {
    return Array.from(this.modules.values());
  }

  getModulesByDomain(domain: RuntimeDomain): readonly RuntimeModuleRegistration[] {
    return Array.from(this.modules.values()).filter(
      (registration) => registration.metadata.domain === domain,
    );
  }

  getModulesByOwner(owner: OwnershipDomain): readonly RuntimeModuleRegistration[] {
    return Array.from(this.modules.values()).filter(
      (registration) => registration.metadata.owner === owner,
    );
  }

  registerOwnership(definition: OwnershipDefinition): void {
    if (this.ownershipMap.has(definition.domain)) {
      throw new Error(`Ownership domain already registered: ${definition.domain}`);
    }

    this.ownershipMap.set(definition.domain, definition);
  }

  getOwnershipDefinition(domain: OwnershipDomain): OwnershipDefinition | undefined {
    return this.ownershipMap.get(domain);
  }

  getAllOwnershipDefinitions(): readonly OwnershipDefinition[] {
    return Array.from(this.ownershipMap.values());
  }
}

export const runtimeRegistry = new RuntimeRegistry();
