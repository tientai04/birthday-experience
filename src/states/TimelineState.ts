// Module 02: State Models
// Timeline State Model for Birthday Experience Project

export type TimelineStateName = 'Idle' | 'Scheduled' | 'Running' | 'Completed';

export interface TimelineState {
  readonly current: TimelineStateName;
  readonly scheduledSceneId?: string;
  readonly startTime?: number;
  readonly completionTime?: number;
  readonly isRecoveryPending: boolean;
  readonly lastUpdated: number;
}

export type TimelineStateTransition = {
  readonly from: TimelineStateName;
  readonly to: TimelineStateName;
};

export const TimelineStateTransitions: readonly TimelineStateTransition[] = [
  { from: 'Idle', to: 'Scheduled' },
  { from: 'Scheduled', to: 'Running' },
  { from: 'Running', to: 'Completed' },
] as const;

export const TimelineStateTransitionMap: Record<TimelineStateName, readonly TimelineStateName[]> = {
  Idle: ['Scheduled'],
  Scheduled: ['Running'],
  Running: ['Completed'],
  Completed: [],
};

export const isValidTimelineStateTransition = (
  from: TimelineStateName,
  to: TimelineStateName
): boolean => TimelineStateTransitionMap[from].includes(to);
