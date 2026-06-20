// Module 02: State Models
// Memory State Model for Birthday Experience Project

export type MemoryStateName = 'Inactive' | 'Loading' | 'Ready' | 'Visible' | 'Released';

export type MemoryBudgetType = 'Photo' | 'Hero' | 'Discovery';

export type MemoryAssetPriority = 'Critical' | 'Narrative' | 'Visual' | 'Decorative';

export interface MemoryAllocationEntry {
  readonly assetId: string;
  readonly bytes: number;
  readonly budgetType: MemoryBudgetType;
  readonly priority: MemoryAssetPriority;
  readonly isCurrentDiscoveryCluster: boolean;
  readonly isOutsideDiscoveryRange: boolean;
  readonly allocatedAt: number;
}

export interface MemoryBudgetCaps {
  readonly photo: number;
  readonly hero: number;
  readonly discovery: number;
}

export interface MemoryBudgetSummary {
  readonly total: number;
  readonly photo: number;
  readonly hero: number;
  readonly discovery: number;
}

export interface MemoryState {
  readonly current: MemoryStateName;
  readonly activeMemoryId?: string;
  readonly memoryBudgetCaps?: MemoryBudgetCaps;
  readonly memoryBudget?: MemoryBudgetSummary;
  readonly allocatedBytes: number;
  readonly allocations: readonly MemoryAllocationEntry[];
  readonly evictedAssetIds?: readonly string[];
  readonly visibleSince?: number;
  readonly lastUpdated: number;
}

export type MemoryStateTransition = {
  readonly from: MemoryStateName;
  readonly to: MemoryStateName;
};

export const MemoryStateTransitions: readonly MemoryStateTransition[] = [
  { from: 'Inactive', to: 'Loading' },
  { from: 'Loading', to: 'Ready' },
  { from: 'Ready', to: 'Visible' },
  { from: 'Ready', to: 'Released' },
  { from: 'Visible', to: 'Released' },
] as const;

export const MemoryStateTransitionMap: Record<MemoryStateName, readonly MemoryStateName[]> = {
  Inactive: ['Loading'],
  Loading: ['Ready'],
  Ready: ['Visible', 'Released'],
  Visible: ['Released'],
  Released: [],
};

export const isValidMemoryStateTransition = (
  from: MemoryStateName,
  to: MemoryStateName,
): boolean => MemoryStateTransitionMap[from].includes(to);
