// Module 12: Timeline Validation
// Timeline validation contracts: schedule validation, synchronization validation, and timeline integrity validation

import { ValidationResult } from './ValidationFramework';
import { TimelineState, TimelineStateName, TimelineStateTransitionMap, isValidTimelineStateTransition } from '../states/TimelineState';
import { TimelineSynchronization, AlignmentValidationResult } from './TimelineSynchronization';

export interface TimelineValidationContract {
  validateSchedule(state: TimelineState): ValidationResult;
  validateSynchronization(state: TimelineState, referenceTime: number, maxAllowedDriftMs: number): AlignmentValidationResult;
  validateIntegrity(previous?: TimelineState, current?: TimelineState): ValidationResult;
}

export class TimelineValidation implements TimelineValidationContract {
  private readonly sync: TimelineSynchronization;

  constructor(sync?: TimelineSynchronization) {
    this.sync = sync ?? new TimelineSynchronization();
  }

  public validateSchedule(state: TimelineState): ValidationResult {
    const errors: string[] = [];

    if (!state) {
      return { valid: false, errors: ['Timeline state is undefined.'] };
    }

    // If scheduled, ensure there is a scheduledSceneId and a startTime
    if (state.current === 'Scheduled') {
      if (typeof state.scheduledSceneId !== 'string' || state.scheduledSceneId.trim().length === 0) {
        errors.push('Scheduled state requires a valid scheduledSceneId.');
      }
      if (typeof state.startTime !== 'number' || Number.isNaN(state.startTime)) {
        errors.push('Scheduled state requires a valid startTime.');
      }
    }

    // If running, ensure startTime exists and is not in the future by a large margin
    if (state.current === 'Running') {
      if (typeof state.startTime !== 'number' || Number.isNaN(state.startTime)) {
        errors.push('Running state requires a valid startTime.');
      } else {
        const now = Date.now();
        if (state.startTime - now > 5 * 60 * 1000) { // more than 5 minutes in future
          errors.push('Running state startTime is unexpectedly far in the future.');
        }
      }
    }

    // If completed, completionTime must exist and be >= startTime if startTime present
    if (state.current === 'Completed') {
      if (typeof state.completionTime !== 'number' || Number.isNaN(state.completionTime)) {
        errors.push('Completed state requires a valid completionTime.');
      }
      if (typeof state.startTime === 'number' && typeof state.completionTime === 'number') {
        if (state.completionTime < state.startTime) {
          errors.push('completionTime precedes startTime.');
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  public validateSynchronization(state: TimelineState, referenceTime: number, maxAllowedDriftMs: number): AlignmentValidationResult {
    // Delegates to TimelineSynchronization which performs non-mutating alignment checks
    return this.sync.validateScheduleAlignment(state, referenceTime, maxAllowedDriftMs);
  }

  public validateIntegrity(previous?: TimelineState, current?: TimelineState): ValidationResult {
    const errors: string[] = [];

    if (!current) {
      return { valid: false, errors: ['Current timeline state is required for integrity validation.'] };
    }

    // Validate that current state name is known
    if (!Object.prototype.hasOwnProperty.call(TimelineStateTransitionMap, current.current)) {
      errors.push(`Unknown timeline state: ${current.current}`);
      return { valid: false, errors };
    }

    // If previous provided, ensure transition is allowed
    if (previous) {
      if (previous.current === current.current) {
        return { valid: true, errors };
      }

      // Allow only permitted transitions according to the transition map
      const allowed = TimelineStateTransitionMap[previous.current] ?? [];
      if (!allowed.includes(current.current)) {
        // Allow a special case: Completed may be observed after Running only
        errors.push(`Invalid timeline state transition: ${previous.current} -> ${current.current}`);
      }

      // Additional integrity checks
      if (current.current === 'Running') {
        if (typeof current.startTime !== 'number' || Number.isNaN(current.startTime)) {
          errors.push('Running state must include a valid startTime.');
        }
      }

      if (current.current === 'Completed') {
        if (typeof current.completionTime !== 'number' || Number.isNaN(current.completionTime)) {
          errors.push('Completed state must include a valid completionTime.');
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
