// Module 07: Scene Registry
// Scene registration, discovery, lookup, and metadata contracts

import { OwnershipDefinition, OwnershipDomain } from './OwnershipDefinitions';

export type SceneCategory = 'Prelude' | 'Envelope' | 'BirthdayLetter' | 'StarTransition' | 'SunflowerWorld' | 'FinalBlessing' | 'Utility';

export interface SceneMetadata {
  readonly sceneId: string;
  readonly title: string;
  readonly description: string;
  readonly category: SceneCategory;
  readonly priority: number;
  readonly tags?: readonly string[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface SceneDiscoveryFilter {
  readonly category?: SceneCategory;
  readonly minPriority?: number;
  readonly tags?: readonly string[];
}

export interface SceneRegistryContract {
  registerScene(metadata: Omit<SceneMetadata, 'createdAt' | 'updatedAt'>): SceneMetadata;
  getScene(sceneId: string): SceneMetadata | undefined;
  discoverScenes(filter?: SceneDiscoveryFilter): readonly SceneMetadata[];
  hasScene(sceneId: string): boolean;
  getAllScenes(): readonly SceneMetadata[];
}

export const SceneRegistryOwnership: OwnershipDefinition = {
  domain: 'SceneSystem',
  owns: ['SceneRegistry'],
  readOnlyAccess: ['GlobalExperienceState'],
  writes: ['SceneRegistry'],
  allowedDependencies: ['ExperienceDirector'],
};

export class SceneRegistry implements SceneRegistryContract {
  private readonly scenes: Map<string, SceneMetadata> = new Map();

  public registerScene(metadata: Omit<SceneMetadata, 'createdAt' | 'updatedAt'>): SceneMetadata {
    this.validateMetadata(metadata);

    if (this.scenes.has(metadata.sceneId)) {
      throw new Error(`Scene already registered: ${metadata.sceneId}`);
    }

    const nextMetadata: SceneMetadata = {
      ...metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.scenes.set(metadata.sceneId, nextMetadata);
    return nextMetadata;
  }

  public getScene(sceneId: string): SceneMetadata | undefined {
    return this.scenes.get(sceneId);
  }

  public discoverScenes(filter?: SceneDiscoveryFilter): readonly SceneMetadata[] {
    const scenes = Array.from(this.scenes.values());

    if (!filter) {
      return scenes;
    }

    return scenes.filter((scene) => {
      if (filter.category && scene.category !== filter.category) {
        return false;
      }

      if (typeof filter.minPriority === 'number' && scene.priority < filter.minPriority) {
        return false;
      }

      if (filter.tags && filter.tags.length > 0) {
        return filter.tags.every((tag) => scene.tags?.includes(tag) ?? false);
      }

      return true;
    });
  }

  public hasScene(sceneId: string): boolean {
    return this.scenes.has(sceneId);
  }

  public getAllScenes(): readonly SceneMetadata[] {
    return Array.from(this.scenes.values());
  }

  private validateMetadata(metadata: Omit<SceneMetadata, 'createdAt' | 'updatedAt'>): void {
    if (typeof metadata.sceneId !== 'string' || metadata.sceneId.trim().length === 0) {
      throw new Error('Scene metadata must include a valid sceneId.');
    }

    if (typeof metadata.title !== 'string' || metadata.title.trim().length === 0) {
      throw new Error('Scene metadata must include a valid title.');
    }

    if (typeof metadata.description !== 'string' || metadata.description.trim().length === 0) {
      throw new Error('Scene metadata must include a valid description.');
    }

    if (typeof metadata.priority !== 'number' || Number.isNaN(metadata.priority)) {
      throw new Error('Scene metadata must include a valid numeric priority.');
    }

    if (metadata.tags && !Array.isArray(metadata.tags)) {
      throw new Error('Scene metadata tags must be an array if provided.');
    }
  }
}
