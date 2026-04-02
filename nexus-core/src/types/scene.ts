// Scene graph types — output to renderers

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface CameraDescriptor {
  position: Vec3;
  rotation: Vec3;
  fov: number;
  near: number;
  far: number;
}

export interface SceneLight {
  entityId: number;
  position: Vec3;
  lightType: 'point' | 'directional' | 'ambient' | 'hemisphere';
  color: string;
  intensity: number;
  range?: number;
}

export interface SceneObject {
  entityId: number;
  position: Vec3;
  rotation: Vec3;
  renderable: {
    meshType: 'box' | 'sphere' | 'cylinder' | 'model' | 'plane';
    modelId?: string;
    color?: string;
    scale: Vec3;
    material?: string;
    visible: boolean;
  };
  interactable?: {
    interactionType: string;
    radius: number;
    prompt: string;
  };
  highlight: boolean;
}

export interface SkyDescriptor {
  type: 'color' | 'gradient' | 'skybox';
  primaryColor: string;
  secondaryColor?: string;
  skyboxId?: string;
}

export interface GroundDescriptor {
  type: string;
  color: string;
  textureId?: string;
  size: { width: number; depth: number };
}

export interface UIElement {
  id: string;
  type: 'text' | 'bar' | 'icon' | 'panel';
  position: { x: number; y: number };
  data: Record<string, unknown>;
  visible: boolean;
}

export interface UIState {
  elements: UIElement[];
  dialogueActive: boolean;
  dialogueText?: string;
  dialogueSpeaker?: string;
  inventoryOpen: boolean;
  mapOpen: boolean;
  paused: boolean;
}

export interface AudioCue {
  id: string;
  type: 'sfx' | 'music' | 'ambient' | 'voice';
  action: 'play' | 'stop' | 'fade_in' | 'fade_out';
  asset: string;
  volume: number;
  loop: boolean;
  position?: Vec3;
  /** Text alternative for this audio cue (accessibility). */
  captionText?: string;
}

export interface SceneGraph {
  camera: CameraDescriptor;
  lights: SceneLight[];
  objects: SceneObject[];
  sky: SkyDescriptor;
  ground: GroundDescriptor;
  ui: UIState;
  audio: AudioCue[];
  /** Screen-reader announcements queued this frame */
  announcements: Announcement[];
  /** Captions for deaf / hard-of-hearing players */
  captions: Caption[];
}

// Re-export accessibility types used in the scene graph
import type { Announcement, Caption } from './accessibility.js';
export type { Announcement, Caption };
