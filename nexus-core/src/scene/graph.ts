// Scene graph — renderer-agnostic description of what to draw
// The scene graph is primarily built by the WorldSystem.
// This module provides utilities for scene graph manipulation.

import type { SceneGraph, SceneObject, Vec3 } from '../types/scene.js';

/** Calculate distance between two Vec3 points */
export function distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Find objects within a radius of a point */
export function findObjectsInRadius(
  graph: SceneGraph,
  center: Vec3,
  radius: number,
): SceneObject[] {
  return graph.objects.filter((obj) => distance(obj.position, center) <= radius);
}

/** Find the nearest interactable object to a point */
export function findNearestInteractable(
  graph: SceneGraph,
  position: Vec3,
): SceneObject | undefined {
  let nearest: SceneObject | undefined;
  let nearestDist = Infinity;

  for (const obj of graph.objects) {
    if (!obj.interactable) continue;
    const dist = distance(obj.position, position);
    if (dist <= obj.interactable.radius && dist < nearestDist) {
      nearest = obj;
      nearestDist = dist;
    }
  }

  return nearest;
}

/** Update highlight state for objects near the player */
export function updateHighlights(
  graph: SceneGraph,
  playerPosition: Vec3,
): SceneGraph {
  const updatedObjects = graph.objects.map((obj) => {
    if (!obj.interactable) return { ...obj, highlight: false };
    const dist = distance(obj.position, playerPosition);
    return { ...obj, highlight: dist <= obj.interactable.radius };
  });

  return { ...graph, objects: updatedObjects };
}

/** Create an empty scene graph with defaults */
export function createEmptySceneGraph(): SceneGraph {
  return {
    camera: {
      position: { x: 0, y: 5, z: 10 },
      rotation: { x: -0.3, y: 0, z: 0 },
      fov: 60,
      near: 0.1,
      far: 1000,
    },
    lights: [],
    objects: [],
    sky: {
      type: 'color',
      primaryColor: '#87CEEB',
    },
    ground: {
      type: 'grass',
      color: '#228B22',
      size: { width: 100, depth: 100 },
    },
    ui: {
      elements: [],
      dialogueActive: false,
      inventoryOpen: false,
      mapOpen: false,
      paused: false,
    },
    audio: [],
  };
}
