// Module 05: Event Bus
// Command transport, Event transport, Signal transport
// Event ordering guarantees and single receiver command routing

import { Command, CommandType } from './CommandDefinitions';
import { Event, EventType } from './EventDefinitions';
import { Signal, SignalType } from './SignalDefinitions';

export type CommandHandler = (command: Command) => void;
export type EventCallback = (event: Event) => void;
export type SignalCallback = (signal: Signal) => void;

interface CommandHandlerEntry {
  readonly type: CommandType;
  readonly handler: CommandHandler;
}

interface EventSubscriberEntry {
  readonly type: EventType;
  readonly callback: EventCallback;
}

interface SignalSubscriberEntry {
  readonly type: SignalType;
  readonly callback: SignalCallback;
}

export class EventBus {
  private readonly commandHandlers: Map<CommandType, CommandHandler> = new Map();
  private readonly eventSubscribers: EventSubscriberEntry[] = [];
  private readonly signalSubscribers: SignalSubscriberEntry[] = [];
  private readonly commandQueue: Command[] = [];
  private readonly eventQueue: Event[] = [];
  private readonly signalQueue: Signal[] = [];

  public registerCommandHandler(type: CommandType, handler: CommandHandler): void {
    if (this.commandHandlers.has(type)) {
      throw new Error(`Command handler already registered for type: ${type}`);
    }
    this.commandHandlers.set(type, handler);
  }

  public sendCommand(command: Command): void {
    this.enqueueCommand(command);
    this.processCommands();
  }

  public publishEvent(event: Event): void {
    this.enqueueEvent(event);
    this.processEvents();
  }

  public emitSignal(signal: Signal): void {
    this.enqueueSignal(signal);
    this.processSignals();
  }

  public subscribeEvent(type: EventType, callback: EventCallback): () => void {
    const entry: EventSubscriberEntry = { type, callback };
    this.eventSubscribers.push(entry);
    return () => {
      const index = this.eventSubscribers.indexOf(entry);
      if (index >= 0) {
        this.eventSubscribers.splice(index, 1);
      }
    };
  }

  public listenSignal(type: SignalType, callback: SignalCallback): () => void {
    const entry: SignalSubscriberEntry = { type, callback };
    this.signalSubscribers.push(entry);
    return () => {
      const index = this.signalSubscribers.indexOf(entry);
      if (index >= 0) {
        this.signalSubscribers.splice(index, 1);
      }
    };
  }

  private enqueueCommand(command: Command): void {
    this.commandQueue.push(command);
  }

  private enqueueEvent(event: Event): void {
    this.eventQueue.push(event);
  }

  private enqueueSignal(signal: Signal): void {
    this.signalQueue.push(signal);
  }

  private processCommands(): void {
    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (!command) {
        continue;
      }
      const handler = this.commandHandlers.get(command.type);
      if (!handler) {
        throw new Error(`No command handler registered for type: ${command.type}`);
      }
      handler(command);
    }
  }

  private processEvents(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (!event) {
        continue;
      }
      this.eventSubscribers
        .filter((subscriber) => subscriber.type === event.type)
        .forEach((subscriber) => subscriber.callback(event));
    }
  }

  private processSignals(): void {
    while (this.signalQueue.length > 0) {
      const signal = this.signalQueue.shift();
      if (!signal) {
        continue;
      }
      this.signalSubscribers
        .filter((subscriber) => subscriber.type === signal.type)
        .forEach((subscriber) => subscriber.callback(signal));
    }
  }
}

export const eventBus = new EventBus();
