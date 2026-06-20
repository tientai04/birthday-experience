// Module 14: Audio Runtime
// Audio ownership model, audio state machine, lifecycle guards, validation, and ownership registration

import { AudioStateName } from '../states/AudioState';
import { OwnershipDefinitions } from './OwnershipDefinitions';
import { runtimeRegistry } from './RuntimeRegistry';

export type AudioLayerType = 'Music' | 'Ambient' | 'Event';

export interface AudioLayerState {
  readonly current: AudioStateName;
  readonly activeTrackId?: string;
  readonly volumeLevel: number;
  readonly lastUpdated: number;
}

export interface AudioRuntimeState {
  readonly music: AudioLayerState;
  readonly ambient: AudioLayerState;
  readonly event: AudioLayerState;
}

export interface AudioLayerIsolationContract {
  getLayerState(layer: AudioLayerType): AudioLayerState;
  validateLayerIndependence(layer: AudioLayerType): boolean;
}

export interface AudioRuntimeContract extends AudioLayerIsolationContract {
  getState(): AudioRuntimeState;
  loadTrack(trackId: string, layer?: AudioLayerType): AudioRuntimeState;
  markReady(layer?: AudioLayerType): AudioRuntimeState;
  play(trackId: string, layer?: AudioLayerType): AudioRuntimeState;
  transitionAudio(trackId: string, layer?: AudioLayerType): AudioRuntimeState;
  stop(layer?: AudioLayerType): AudioRuntimeState;
  validateTransition(from: AudioStateName, to: AudioStateName): boolean;
}

const AUDIO_STATE_TRANSITIONS: Record<AudioStateName, readonly AudioStateName[]> = {
  Loading: ['Ready', 'Stopped'],
  Ready: ['Playing', 'Stopped'],
  Playing: ['Transitioning', 'Stopped'],
  Transitioning: ['Playing', 'Stopped'],
  Stopped: ['Loading'],
};

// Ensure canonical AudioSystem ownership is registered with runtime registry
{
  const existing = runtimeRegistry.getOwnershipDefinition('AudioSystem');
  if (!existing) {
    const def = OwnershipDefinitions.find((d) => d.domain === 'AudioSystem');
    if (def) {
      runtimeRegistry.registerOwnership(def);
    }
  }
}

const DEFAULT_AUDIO_LAYER_STATE: AudioLayerState = {
  current: 'Stopped',
  volumeLevel: 1,
  lastUpdated: Date.now(),
};

const DEFAULT_AUDIO_STATE: AudioRuntimeState = {
  music: { ...DEFAULT_AUDIO_LAYER_STATE },
  ambient: { ...DEFAULT_AUDIO_LAYER_STATE },
  event: { ...DEFAULT_AUDIO_LAYER_STATE },
};

export class AudioRuntime implements AudioRuntimeContract {
  private state: AudioRuntimeState = { ...DEFAULT_AUDIO_STATE };

  public getState(): AudioRuntimeState {
    return this.state;
  }

  public getLayerState(layer: AudioLayerType): AudioLayerState {
    return this.state[layer.toLowerCase() as keyof AudioRuntimeState] as AudioLayerState;
  }

  public validateLayerIndependence(layer: AudioLayerType): boolean {
    const layerState = this.getLayerState(layer);
    const musicState = this.state.music;
    const ambientState = this.state.ambient;
    const eventState = this.state.event;
    const layersAreDistinct =
      musicState !== ambientState && musicState !== eventState && ambientState !== eventState;

    return (
      layerState !== undefined &&
      typeof layerState.current === 'string' &&
      layersAreDistinct &&
      typeof musicState.current === 'string' &&
      typeof ambientState.current === 'string' &&
      typeof eventState.current === 'string'
    );
  }

  public loadTrack(trackId: string, layer: AudioLayerType = 'Music'): AudioRuntimeState {
    const currentLayer = this.getLayerState(layer);
    this.assertLayerTransition(currentLayer.current, 'Loading');

    const now = Date.now();
    const nextState = {
      ...this.state,
      [layer.toLowerCase()]: {
        ...currentLayer,
        current: 'Loading',
        activeTrackId: trackId,
        lastUpdated: now,
      },
    } as AudioRuntimeState;

    this.assertSiblingLayerStability(this.state, nextState, layer);
    this.state = nextState;

    return this.state;
  }

  public markReady(layer: AudioLayerType = 'Music'): AudioRuntimeState {
    const currentLayer = this.getLayerState(layer);
    this.assertLayerTransition(currentLayer.current, 'Ready');

    const now = Date.now();
    const nextState = {
      ...this.state,
      [layer.toLowerCase()]: {
        ...currentLayer,
        current: 'Ready',
        lastUpdated: now,
      },
    } as AudioRuntimeState;

    this.assertSiblingLayerStability(this.state, nextState, layer);
    this.state = nextState;

    return this.state;
  }

  public play(trackId: string, layer: AudioLayerType = 'Music'): AudioRuntimeState {
    const currentLayer = this.getLayerState(layer);
    if (currentLayer.current !== 'Ready' && currentLayer.current !== 'Transitioning') {
      throw new Error(`Cannot play audio on ${layer} from state ${currentLayer.current}.`);
    }

    const now = Date.now();
    const nextState = {
      ...this.state,
      [layer.toLowerCase()]: {
        ...currentLayer,
        current: 'Playing',
        activeTrackId: trackId,
        lastUpdated: now,
      },
    } as AudioRuntimeState;

    this.assertSiblingLayerStability(this.state, nextState, layer);
    this.state = nextState;

    return this.state;
  }

  public transitionAudio(trackId: string, layer: AudioLayerType = 'Music'): AudioRuntimeState {
    const currentLayer = this.getLayerState(layer);
    if (!this.validateTransition(currentLayer.current, 'Transitioning')) {
      throw new Error(`Invalid audio transition on ${layer} from ${currentLayer.current} to Transitioning.`);
    }

    const now = Date.now();
    const nextState = {
      ...this.state,
      [layer.toLowerCase()]: {
        ...currentLayer,
        current: 'Transitioning',
        activeTrackId: trackId,
        lastUpdated: now,
      },
    } as AudioRuntimeState;

    this.assertSiblingLayerStability(this.state, nextState, layer);
    this.state = nextState;

    return this.state;
  }

  public stop(layer: AudioLayerType = 'Music'): AudioRuntimeState {
    const currentLayer = this.getLayerState(layer);
    if (!this.validateTransition(currentLayer.current, 'Stopped')) {
      throw new Error(`Invalid audio transition on ${layer} from ${currentLayer.current} to Stopped.`);
    }

    const now = Date.now();
    const nextState = {
      ...this.state,
      [layer.toLowerCase()]: {
        ...currentLayer,
        current: 'Stopped',
        lastUpdated: now,
      },
    } as AudioRuntimeState;

    this.assertSiblingLayerStability(this.state, nextState, layer);
    this.state = nextState;

    return this.state;
  }

  public validateTransition(from: AudioStateName, to: AudioStateName): boolean {
    const allowed = AUDIO_STATE_TRANSITIONS[from] ?? [];
    return allowed.includes(to);
  }

  private assertSiblingLayerStability(
    previousState: AudioRuntimeState,
    nextState: AudioRuntimeState,
    modifiedLayer: AudioLayerType,
  ): void {
    const layers: readonly AudioLayerType[] = ['Music', 'Ambient', 'Event'];

    layers.forEach((layer) => {
      if (layer !== modifiedLayer) {
        const key = layer.toLowerCase() as keyof AudioRuntimeState;
        if (previousState[key] !== nextState[key]) {
          throw new Error(
            `Audio layer isolation violation: ${layer} changed while updating ${modifiedLayer}.`,
          );
        }
      }
    });
  }

  private assertLayerTransition(from: AudioStateName, to: AudioStateName): void {
    if (!this.validateTransition(from, to)) {
      throw new Error(`Invalid audio transition from ${from} to ${to}.`);
    }
  }
}
