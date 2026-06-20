// Core contract interfaces for Birthday Experience Project
// Module 01: Core Contracts

import { Command } from './CommandDefinitions';
import { Event } from './EventDefinitions';
import { Signal } from './SignalDefinitions';

export interface ICommandContract {
  validateCommand(command: Command): boolean;
}

export interface IEventContract {
  validateEvent(event: Event): boolean;
}

export interface ISignalContract {
  validateSignal(signal: Signal): boolean;
}

export interface IBaseContract {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export interface IOwnershipContract extends IBaseContract {
  readonly owner: string;
  readonly responsibilities: readonly string[];
  readonly allowedDependencies: readonly string[];
}
