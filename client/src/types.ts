import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

/** Any object that holds resources requiring explicit cleanup */
export interface Disposable {
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Collision primitives
// ---------------------------------------------------------------------------

/** Axis-aligned bounding box used for world-object collision */
export interface AABB {
  readonly min: THREE.Vector3;
  readonly max: THREE.Vector3;
}

// ---------------------------------------------------------------------------
// World objects
// ---------------------------------------------------------------------------

export const WORLD_OBJECT_TYPES = [
  'npc', 'item', 'structure', 'portal', 'puzzle', 'vehicle',
] as const;
export type WorldObjectType = typeof WORLD_OBJECT_TYPES[number];

/** Every interactable thing in the world */
export interface WorldObject {
  id: string;
  type: WorldObjectType;
  position: THREE.Vector3;
  mesh?: THREE.Mesh;
  aabb?: AABB;
  interactionRadius: number;
  requiredKnowledge?: string[];
  teaches?: string[];
}

// ---------------------------------------------------------------------------
// Biome chunks
// ---------------------------------------------------------------------------

/** Biome chunk — a loadable section of the world */
export interface BiomeChunk {
  id: string;
  biomeType: string;
  objects: WorldObject[];
}

// ---------------------------------------------------------------------------
// Input system
// ---------------------------------------------------------------------------

export const GAME_ACTION_TYPES = [
  'move', 'interact', 'select', 'back', 'inventory',
  'speak', 'craft', 'map', 'companion', 'pause',
] as const;
export type GameActionType = typeof GAME_ACTION_TYPES[number];

export type InputMethod = 'keyboard' | 'mouse' | 'touch' | 'voice' | 'gamepad';

/** Unified input action — the core abstraction */
export interface GameAction {
  type: GameActionType;
  source: InputMethod;
  payload?: unknown;
}

/** Movement vector payload for 'move' actions */
export interface MovePayload {
  x: number;
  z: number;
}

export type ActionCallback = (action: GameAction) => void;

/** Every input source implements this to feed actions into InputManager */
export interface InputProvider extends Disposable {
  readonly name: InputMethod;
  attach(emit: ActionCallback): void;
  detach(): void;
}

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

/** Called at a fixed rate for deterministic physics / game logic */
export type FixedUpdateCallback = (fixedDt: number) => void;

/** Called once per frame with wall-clock delta and interpolation alpha */
export type FrameUpdateCallback = (dt: number, alpha: number) => void;

/** Called once per frame to submit draw calls */
export type RenderCallback = (alpha: number) => void;

// ---------------------------------------------------------------------------
// API types
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
