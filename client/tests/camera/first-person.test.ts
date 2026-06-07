import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FirstPersonCamera } from '../../src/camera/first-person.js';
import type { SceneObject } from '@nexus-academy/core';

describe('FirstPersonCamera', () => {
  let cam: FirstPersonCamera;

  beforeEach(() => {
    cam = new FirstPersonCamera();
  });

  afterEach(() => { cam.dispose(); });

  it('starts with no pending look actions', () => {
    expect(cam.flushLookActions()).toHaveLength(0);
  });

  it('reports pointer lock state', () => {
    expect(cam.isPointerLocked).toBe(false);
  });

  it('flushLookActions returns and clears actions', () => {
    // Simulate mouse move events by dispatching directly
    // Since pointer lock is not active, no look actions should be generated
    const actions = cam.flushLookActions();
    expect(actions).toHaveLength(0);
    // Second flush also empty
    expect(cam.flushLookActions()).toHaveLength(0);
  });

  it('getPredictiveRotation returns yaw and pitch', () => {
    const rot = cam.getPredictiveRotation();
    expect(typeof rot.yaw).toBe('number');
    expect(typeof rot.pitch).toBe('number');
  });

  it('dispose cleans up', () => {
    cam.dispose();
    expect(cam.isPointerLocked).toBe(false);
  });

  it('dispose is idempotent', () => {
    cam.dispose();
    expect(() => cam.dispose()).not.toThrow();
  });

  it('requestPointerLock does not throw when disposed', () => {
    cam.dispose();
    const el = document.createElement('div');
    expect(() => cam.requestPointerLock(el)).not.toThrow();
  });

  it('does not add interactable objects as collision blockers', () => {
    const baseObject: SceneObject = {
      entityId: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      renderable: {
        meshType: 'box',
        color: '#888888',
        scale: { x: 2, y: 1, z: 2 },
        visible: true,
      },
      highlight: false,
    };

    cam.updateCollisionBoxes([
      baseObject,
      {
        ...baseObject,
        entityId: 2,
        interactable: {
          interactionType: 'craft',
          radius: 2,
          prompt: 'Interact with Workbench',
        },
      },
    ]);

    expect((cam as unknown as { collisionBoxes: unknown[] }).collisionBoxes).toHaveLength(1);
  });
});
