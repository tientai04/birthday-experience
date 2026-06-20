// Module 15: Asset State Model
// Asset metadata, priority, state machine, and registry model for the Birthday Experience project.

export type AssetType = 'Texture' | 'Model' | 'AudioClip' | 'Video' | 'Document' | 'Shader' | 'Prefab';

export type AssetPriority = 'Critical' | 'Narrative' | 'Visual' | 'Decorative';

export type AssetStateName = 'Unregistered' | 'Registered' | 'Loaded' | 'Ready' | 'Released';

export interface AssetMetadata {
  readonly id: string;
  readonly name: string;
  readonly type: AssetType;
  readonly priority: AssetPriority;
  readonly sourceUri?: string;
  readonly sizeBytes?: number;
  readonly tags?: readonly string[];
  readonly createdAt: number;
}

export interface AssetEntry {
  readonly metadata: AssetMetadata;
  readonly current: AssetStateName;
  readonly lastUpdated: number;
  readonly loadedAt?: number;
  readonly readyAt?: number;
  readonly releasedAt?: number;
}

export interface AssetRegistry {
  readonly assets: Record<string, AssetEntry>;
  readonly lastUpdated: number;
}

export type AssetState = AssetRegistry;
