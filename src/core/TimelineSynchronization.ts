// Module 11: Timeline Synchronization
// Synchronization contracts, timing alignment contracts, and schedule alignment validation

import { TimelineState, TimelineStateName } from '../states/TimelineState';

export interface AlignmentResult {
  readonly offsetMs: number; // positive: timeline is ahead of reference, negative: behind
  readonly referenceTime: number;
}

export interface AlignmentValidationResult {
  readonly valid: boolean;
  readonly driftMs: number;
  readonly errors: readonly string[];
}

export interface TimelineSynchronizationContract {
  // Compute the offset between the timeline's scheduled start and an external reference clock
  computeAlignment(state: TimelineState, referenceTime: number): AlignmentResult;

  // Validate that a timeline's schedule aligns within allowed drift threshold
  validateScheduleAlignment(state: TimelineState, referenceTime: number, maxAllowedDriftMs: number): AlignmentValidationResult;

  // Assess if a scheduled timeline can be safely advanced to the reference time (no mutation)
  assessSafeAdvance(state: TimelineState, referenceTime: number, maxAllowedDriftMs: number): AlignmentValidationResult;
}

export class TimelineSynchronization implements TimelineSynchronizationContract {
  public computeAlignment(state: TimelineState, referenceTime: number): AlignmentResult {
    const scheduled = state.startTime ?? state.lastUpdated;
    const offset = (scheduled ?? referenceTime) - referenceTime;
    return { offsetMs: offset, referenceTime };
  }

  public validateScheduleAlignment(state: TimelineState, referenceTime: number, maxAllowedDriftMs: number): AlignmentValidationResult {
    const result = this.computeAlignment(state, referenceTime);
    const drift = Math.abs(result.offsetMs);
    const errors: string[] = [];

    if (isNaN(drift)) {
      errors.push('Unable to determine schedule time for timeline state.');
    }

    if (drift > maxAllowedDriftMs) {
      errors.push(`Timeline schedule drift ${drift}ms exceeds allowed ${maxAllowedDriftMs}ms.`);
    }

    return { valid: errors.length === 0, driftMs: drift, errors };
  }

  public assessSafeAdvance(state: TimelineState, referenceTime: number, maxAllowedDriftMs: number): AlignmentValidationResult {
    // Assessment must not mutate the timeline; it only returns whether advancing to referenceTime
    // would be within acceptable drift and therefore safe to request a controlled start via
    // approved contracts (e.g., dispatching a START command).
    return this.validateScheduleAlignment(state, referenceTime, maxAllowedDriftMs);
  }
}
