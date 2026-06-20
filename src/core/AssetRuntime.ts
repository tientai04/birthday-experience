// Module 15: Asset Runtime
// Asset ownership, registry, lookup, lifecycle, and single-source-of-truth contract.

import { OwnershipDefinitions } from './OwnershipDefinitions';
import { runtimeRegistry } from './RuntimeRegistry';
import { AssetEntry, AssetMetadata, AssetRegistry, AssetState, AssetStateName, AssetType, AssetPriority } from '../states/AssetState';

export interface AssetRegistrationRequest {
  readonly metadata: AssetMetadata;
}

export interface AssetLookupRequest {
  readonly assetId: string;
}

export interface AssetLifecycleRequest {
  readonly assetId: string;
}

export interface AssetRuntimeContract {
  getState(): AssetState;
  registerAsset(request: AssetRegistrationRequest): AssetState;
  lookupAsset(request: AssetLookupRequest): AssetEntry | undefined;
  markLoaded(request: AssetLifecycleRequest): AssetState;
  markReady(request: AssetLifecycleRequest): AssetState;
  releaseAsset(request: AssetLifecycleRequest): AssetState;
  validateTransition(from: AssetStateName, to: AssetStateName): boolean;
  validateAssetOwnership(assetId: string): boolean;
}

const ASSET_STATE_TRANSITIONS: Record<AssetStateName, readonly AssetStateName[]> = {
  Unregistered: ['Registered'],
  Registered: ['Loaded', 'Released'],
  Loaded: ['Ready', 'Released'],
  Ready: ['Released'],
  Released: [],
};

// Ensure canonical AssetSystem ownership is registered with runtime registry
{
  const existing = runtimeRegistry.getOwnershipDefinition('AssetSystem');
  if (!existing) {
    const def = OwnershipDefinitions.find((d) => d.domain === 'AssetSystem');
    if (def) {
      runtimeRegistry.registerOwnership(def);
    }
  }
}

const DEFAULT_ASSET_REGISTRY: AssetRegistry = {
  assets: {},
  lastUpdated: Date.now(),
};

export class AssetRuntime implements AssetRuntimeContract {
  private state: AssetState = { ...DEFAULT_ASSET_REGISTRY };

  public getState(): AssetState {
    return this.state;
  }

  public registerAsset(request: AssetRegistrationRequest): AssetState {
    if (this.state.assets[request.metadata.id]) {
      throw new Error(`Asset already registered: ${request.metadata.id}`);
    }

    const now = Date.now();
    const entry: AssetEntry = {
      metadata: request.metadata,
      current: 'Registered',
      lastUpdated: now,
    };

    this.state = {
      ...this.state,
      assets: {
        ...this.state.assets,
        [request.metadata.id]: entry,
      },
      lastUpdated: now,
    };

    return this.state;
  }

  public lookupAsset(request: AssetLookupRequest): AssetEntry | undefined {
    return this.state.assets[request.assetId];
  }

  public markLoaded(request: AssetLifecycleRequest): AssetState {
    const entry = this.getAssetEntry(request.assetId);
    this.assertTransition(entry.current, 'Loaded');

    const now = Date.now();
    const updatedEntry: AssetEntry = {
      ...entry,
      current: 'Loaded',
      loadedAt: now,
      lastUpdated: now,
    };

    return this.updateEntry(request.assetId, updatedEntry);
  }

  public markReady(request: AssetLifecycleRequest): AssetState {
    const entry = this.getAssetEntry(request.assetId);
    this.assertTransition(entry.current, 'Ready');

    const now = Date.now();
    const updatedEntry: AssetEntry = {
      ...entry,
      current: 'Ready',
      readyAt: now,
      lastUpdated: now,
    };

    return this.updateEntry(request.assetId, updatedEntry);
  }

  public releaseAsset(request: AssetLifecycleRequest): AssetState {
    const entry = this.getAssetEntry(request.assetId);
    this.assertTransition(entry.current, 'Released');

    const now = Date.now();
    const updatedEntry: AssetEntry = {
      ...entry,
      current: 'Released',
      releasedAt: now,
      lastUpdated: now,
    };

    return this.updateEntry(request.assetId, updatedEntry);
  }

  public validateTransition(from: AssetStateName, to: AssetStateName): boolean {
    const allowed = ASSET_STATE_TRANSITIONS[from] ?? [];
    return allowed.includes(to);
  }

  public validateAssetOwnership(assetId: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.state.assets, assetId);
  }

  private getAssetEntry(assetId: string): AssetEntry {
    const entry = this.state.assets[assetId];
    if (!entry) {
      throw new Error(`Asset not found: ${assetId}`);
    }
    return entry;
  }

  private updateEntry(assetId: string, entry: AssetEntry): AssetState {
    this.state = {
      ...this.state,
      assets: {
        ...this.state.assets,
        [assetId]: entry,
      },
      lastUpdated: Date.now(),
    };

    return this.state;
  }
}
