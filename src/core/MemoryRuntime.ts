// Module 16: Memory Runtime
// Memory ownership, lifecycle, visibility, and transition validation for the Birthday Experience project.

import { OwnershipDefinitions } from './OwnershipDefinitions';
import { runtimeRegistry } from './RuntimeRegistry';
import { MemoryBudgetCaps, MemoryState, MemoryStateName, MemoryStateTransitionMap, isValidMemoryStateTransition } from '../states/MemoryState';

export interface MemoryAllocationRequest {
  readonly assetId: string;
  readonly bytes: number;
  readonly budgetType: 'Photo' | 'Hero' | 'Discovery';
  readonly priority: 'Critical' | 'Narrative' | 'Visual' | 'Decorative';
  readonly isCurrentDiscoveryCluster: boolean;
  readonly isOutsideDiscoveryRange: boolean;
}

export interface MemoryRuntimeContract {
  getState(): MemoryState;
  initializeMemory(memoryId: string, memoryBudgetCaps?: MemoryBudgetCaps): MemoryState;
  markReady(): MemoryState;
  showMemory(): MemoryState;
  releaseMemory(): MemoryState;
  allocateMemoryAsset(request: MemoryAllocationRequest): MemoryState;
  releaseMemoryAsset(assetId: string): MemoryState;
  getBudgetUsage(): MemoryBudgetSummary;
  validateTransition(from: MemoryStateName, to: MemoryStateName): boolean;
  validateMemoryOwnership(memoryId: string): boolean;
}

const MEMORY_STATE_TRANSITIONS: Record<MemoryStateName, readonly MemoryStateName[]> = {
  Inactive: ['Loading'],
  Loading: ['Ready'],
  Ready: ['Visible', 'Released'],
  Visible: ['Released'],
  Released: [],
};

// Ensure canonical MemorySystem ownership is registered with runtime registry
{
  const existing = runtimeRegistry.getOwnershipDefinition('MemorySystem');
  if (!existing) {
    const def = OwnershipDefinitions.find((definition) => definition.domain === 'MemorySystem');
    if (def) {
      runtimeRegistry.registerOwnership(def);
    }
  }
}

const DEFAULT_MEMORY_STATE: MemoryState = {
  current: 'Inactive',
  allocatedBytes: 0,
  allocations: [],
  memoryBudgetCaps: {
    photo: 0,
    hero: 0,
    discovery: 0,
  },
  memoryBudget: {
    total: 0,
    photo: 0,
    hero: 0,
    discovery: 0,
  },
  lastUpdated: Date.now(),
};

const MEMORY_PRIORITY_ORDER: readonly MemoryState['allocations'][number]['priority'][] = [
  'Decorative',
  'Visual',
  'Narrative',
  'Critical',
];

export class MemoryRuntime implements MemoryRuntimeContract {
  private state: MemoryState = { ...DEFAULT_MEMORY_STATE };

  public getState(): MemoryState {
    return this.state;
  }

  public initializeMemory(memoryId: string, memoryBudgetCaps?: MemoryBudgetCaps): MemoryState {
    this.assertTransition(this.state.current, 'Loading');

    const now = Date.now();
    this.state = {
      ...this.state,
      current: 'Loading',
      activeMemoryId: memoryId,
      memoryBudgetCaps: memoryBudgetCaps ?? { photo: 0, hero: 0, discovery: 0 },
      lastUpdated: now,
    };

    return this.state;
  }

  public markReady(): MemoryState {
    this.assertTransition(this.state.current, 'Ready');

    const now = Date.now();
    this.state = {
      ...this.state,
      current: 'Ready',
      lastUpdated: now,
    };

    return this.state;
  }

  public showMemory(): MemoryState {
    this.assertTransition(this.state.current, 'Visible');

    const now = Date.now();
    this.state = {
      ...this.state,
      current: 'Visible',
      visibleSince: now,
      lastUpdated: now,
    };

    return this.state;
  }

  public releaseMemory(): MemoryState {
    this.assertTransition(this.state.current, 'Released');

    const now = Date.now();
    this.state = {
      ...this.state,
      current: 'Released',
      allocatedBytes: 0,
      allocations: [],
      evictedAssetIds: [],
      lastUpdated: now,
    };

    return this.state;
  }

  public allocateMemoryAsset(request: MemoryAllocationRequest): MemoryState {
    if (this.state.current === 'Released') {
      throw new Error('Cannot allocate memory after memory runtime has been released.');
    }

    if (request.bytes <= 0) {
      throw new Error('Memory allocation request must specify a positive byte count.');
    }

    if (request.isOutsideDiscoveryRange) {
      throw new Error('Memory allocation may only occur for current or nearby discovery assets.');
    }

    if (this.state.allocations.some((allocation) => allocation.assetId === request.assetId)) {
      throw new Error(`Memory asset already allocated: ${request.assetId}`);
    }

    const pendingAllocations = [...this.state.allocations, this.buildAllocationEntry(request)];
    const budgetUsage = this.calculateBudgetUsage(pendingAllocations);

    if (!this.validateAllocation(request, budgetUsage)) {
      const evictionIds = this.evictAssets(request.bytes, request.budgetType);
      if (evictionIds.length === 0) {
        throw new Error('Memory budget exceeded and no eligible assets are available for eviction.');
      }
      const remainingAllocations = this.state.allocations.filter(
        (allocation) => !evictionIds.includes(allocation.assetId),
      );
      const finalAllocations = [...remainingAllocations, this.buildAllocationEntry(request)];
      const finalUsage = this.calculateBudgetUsage(finalAllocations);
      if (!this.validateAllocation(request, finalUsage)) {
        throw new Error('Memory budget could not be satisfied after eviction.');
      }
      return this.updateAllocations(finalAllocations, evictionIds);
    }

    return this.updateAllocations(pendingAllocations, []);
  }

  public releaseMemoryAsset(assetId: string): MemoryState {
    if (!this.state.allocations.some((allocation) => allocation.assetId === assetId)) {
      throw new Error(`Memory asset not found: ${assetId}`);
    }

    const remainingAllocations = this.state.allocations.filter((allocation) => allocation.assetId !== assetId);
    return this.updateAllocations(remainingAllocations, this.state.evictedAssetIds ?? []);
  }

  public getBudgetUsage(): MemoryBudgetSummary {
    return this.calculateBudgetUsage(this.state.allocations);
  }

  public validateTransition(from: MemoryStateName, to: MemoryStateName): boolean {
    return isValidMemoryStateTransition(from, to);
  }

  public validateMemoryOwnership(memoryId: string): boolean {
    return this.state.activeMemoryId === memoryId;
  }

  private buildAllocationEntry(request: MemoryAllocationRequest): MemoryAllocationEntry {
    return {
      assetId: request.assetId,
      bytes: request.bytes,
      budgetType: request.budgetType,
      priority: request.priority,
      isCurrentDiscoveryCluster: request.isCurrentDiscoveryCluster,
      isOutsideDiscoveryRange: request.isOutsideDiscoveryRange,
      allocatedAt: Date.now(),
    };
  }

  private validateAllocation(request: MemoryAllocationRequest, usage: MemoryBudgetSummary): boolean {
    const caps = this.state.memoryBudgetCaps ?? { photo: 0, hero: 0, discovery: 0 };

    if (request.budgetType === 'Hero') {
      return usage.hero <= caps.hero;
    }

    if (request.budgetType === 'Photo') {
      return usage.photo <= caps.photo;
    }

    if (request.budgetType === 'Discovery') {
      return usage.discovery <= caps.discovery;
    }

    return false;
  }

  private evictAssets(requiredBytes: number, budgetType: MemoryAllocationRequest['budgetType']): readonly string[] {
    if (budgetType === 'Hero') {
      return [];
    }

    const candidates = this.state.allocations.filter(
      (allocation) =>
        allocation.isOutsideDiscoveryRange &&
        !allocation.isCurrentDiscoveryCluster &&
        allocation.budgetType !== 'Hero' &&
        allocation.priority !== 'Critical',
    );

    const ordered = [...candidates].sort((a, b) => {
      const priorityA = MEMORY_PRIORITY_ORDER.indexOf(a.priority);
      const priorityB = MEMORY_PRIORITY_ORDER.indexOf(b.priority);
      return priorityA - priorityB || a.allocatedAt - b.allocatedAt;
    });

    const evicted: string[] = [];
    let reclaimed = 0;

    for (const allocation of ordered) {
      if (reclaimed >= requiredBytes) {
        break;
      }
      evicted.push(allocation.assetId);
      reclaimed += allocation.bytes;
    }

    return reclaimed >= requiredBytes ? evicted : [];
  }

  private calculateBudgetUsage(allocations: readonly MemoryAllocationEntry[]): MemoryBudgetSummary {
    return allocations.reduce<MemoryBudgetSummary>(
      (summary, allocation) => {
        const photo = summary.photo + (allocation.budgetType === 'Photo' ? allocation.bytes : 0);
        const discovery = summary.discovery + (allocation.budgetType === 'Discovery' ? allocation.bytes : 0);
        const hero = summary.hero + (allocation.budgetType === 'Hero' ? allocation.bytes : 0);
        return {
          total: photo + discovery + hero,
          photo,
          discovery,
          hero,
        };
      },
      { total: 0, photo: 0, hero: 0, discovery: 0 },
    );
  }

  private updateAllocations(allocations: readonly MemoryAllocationEntry[], evictedAssetIds: readonly string[]): MemoryState {
    const usage = this.calculateBudgetUsage(allocations);
    const now = Date.now();
    this.state = {
      ...this.state,
      allocations,
      allocatedBytes: usage.total,
      memoryBudget: usage,
      evictedAssetIds,
      lastUpdated: now,
    };
    return this.state;
  }

  private assertTransition(from: MemoryStateName, to: MemoryStateName): void {
    if (!this.validateTransition(from, to)) {
      throw new Error(`Invalid memory state transition from ${from} to ${to}.`);
    }
  }
}
