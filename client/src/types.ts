// Client-only types — renderer / input / lifecycle
// Game types (GameAction, SceneGraph, etc.) are imported from @nexus-academy/core

// Re-export core types used across the client
export type {
  GameAction, ActionType, ActionSource,
  MovePayload, LookPayload, SelectPayload, SpeakPayload,
  SceneGraph, SceneObject, SceneLight, CameraDescriptor,
  SkyDescriptor, GroundDescriptor, UIState, UIElement, AudioCue, Vec3,
} from '@nexus-academy/core';

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

/** Any object that holds resources requiring explicit cleanup */
export interface Disposable {
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Input system (client-side abstractions)
// ---------------------------------------------------------------------------

import type { GameAction, ActionSource } from '@nexus-academy/core';

export type ActionCallback = (action: GameAction) => void;

/** Every input source implements this to feed actions into InputManager */
export interface InputProvider extends Disposable {
  readonly name: ActionSource;
  attach(emit: ActionCallback): void;
  detach(): void;
}

// ---------------------------------------------------------------------------
// Game loop callback signatures
// ---------------------------------------------------------------------------

/** Called at a fixed rate for deterministic game logic */
export type FixedUpdateCallback = (fixedDt: number) => void;

/** Called once per frame with wall-clock delta and interpolation alpha */
export type FrameUpdateCallback = (dt: number, alpha: number) => void;

/** Called once per frame to submit draw calls */
export type RenderCallback = (alpha: number) => void;

// ---------------------------------------------------------------------------
// API types (kept for the networking layer)
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  name: string;
  ageTier: string;
  createdAt: string;
}

export interface CreateProfileRequest {
  name: string;
  birthDate: string;
}

export interface LearningEvent {
  profileId: string;
  subject: string;
  action: string;
  result: 'success' | 'failure' | 'partial';
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface MasteryRecord {
  subject: string;
  level: number;
  lastPracticed: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: number;
}

// ---------------------------------------------------------------------------
// API configuration & errors
// ---------------------------------------------------------------------------

export interface APIConfig {
  baseUrl: string;
  /** Per-request timeout in milliseconds (default 10 000) */
  timeoutMs: number;
  /** Maximum retry attempts for transient failures (default 3) */
  maxRetries: number;
  /** Base delay between retries in ms — doubled each attempt (default 500) */
  retryBaseMs: number;
}

/** Structured error thrown by NexusAPI on non-OK responses */
export class APIError extends Error {
  constructor(
    public readonly method: string,
    public readonly path: string,
    public readonly status: number,
    public readonly statusText: string,
  ) {
    super(`${method} ${path} failed: ${status} ${statusText}`);
    this.name = 'APIError';
  }

  /** True for 5xx or network errors that are worth retrying */
  get retryable(): boolean {
    return this.status >= 500 || this.status === 429;
  }
}

/** Request queued while the device is offline */
export interface QueuedRequest {
  path: string;
  method: 'GET' | 'POST';
  body?: string;
  createdAt: number;
}
