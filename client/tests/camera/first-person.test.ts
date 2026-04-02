import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FirstPersonCamera } from '../../src/camera/first-person.js';

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
});
