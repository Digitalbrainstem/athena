// Text shader with gravitational warping and black hole split effect.
//
// Idle: outer letters stretch toward the portal edges (spaghettification)
// Fly-through: text splits top/bottom, halves fly apart into the ring

import * as THREE from 'three';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uTexture;
uniform float uWarp;       // 0-1+ gravitational stretch of outer letters
uniform float uSplit;      // 0 = normal, 0→1 = halves fly apart
uniform float uFade;       // overall opacity
uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // ── Gravitational spaghettification ──
  // Stretch UVs horizontally at the edges, compress vertically
  if (uWarp > 0.0) {
    // Distance from horizontal center (0 at center, 1 at edges)
    float edgeDist = abs(uv.x - 0.5) * 2.0;
    float warpAmount = uWarp * edgeDist * edgeDist; // quadratic — more at edges

    // Pull edges outward (stretch X)
    float dir = sign(uv.x - 0.5);
    uv.x = 0.5 + (uv.x - 0.5) * (1.0 - warpAmount * 0.3);

    // Thin the letters at edges (compress Y toward center)
    float yCompress = 1.0 + warpAmount * 0.5;
    uv.y = 0.5 + (uv.y - 0.5) * yCompress;
  }

  // ── Black hole split ──
  // Top half slides up, bottom half slides down, both stretch outward
  if (uSplit > 0.0) {
    float isTop = step(0.5, vUv.y);
    float isBottom = 1.0 - isTop;

    // Split direction
    float splitOffset = uSplit * 0.8;
    uv.y -= isTop * splitOffset;
    uv.y += isBottom * splitOffset;

    // Stretch outward as halves separate
    float splitStretch = uSplit * 0.6;
    uv.x = 0.5 + (uv.x - 0.5) * (1.0 + splitStretch);

    // Thin vertically as they stretch
    float yThin = 1.0 + uSplit * 2.0;
    float midY = isTop > 0.5 ? 0.75 : 0.25;
    uv.y = midY + (uv.y - midY) * yThin;

    // Slight curve — edges pull faster than center
    float edgeDist = abs(uv.x - 0.5) * 2.0;
    float curveAmount = uSplit * edgeDist * 0.15;
    uv.y += isTop > 0.5 ? -curveAmount : curveAmount;
  }

  // Clamp to avoid sampling outside texture
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec4 texColor = texture2D(uTexture, uv);

  // Edge dissolution during split — letters break apart at edges
  if (uSplit > 0.3) {
    float dissolveFactor = (uSplit - 0.3) / 0.7;
    float noise = fract(sin(dot(vUv * 50.0, vec2(12.9898, 78.233))) * 43758.5453);
    if (noise < dissolveFactor * 0.8) {
      texColor.a *= max(0.0, 1.0 - dissolveFactor * 2.0);
    }
  }

  gl_FragColor = vec4(texColor.rgb, texColor.a * uFade);
}
`;

export interface GravTextUniforms {
  [key: string]: THREE.IUniform;
  uTexture: { value: THREE.Texture | null };
  uWarp: { value: number };
  uSplit: { value: number };
  uFade: { value: number };
  uTime: { value: number };
}

export function createGravTextMaterial(texture: THREE.Texture): THREE.ShaderMaterial {
  const uniforms: GravTextUniforms = {
    uTexture: { value: texture },
    uWarp: { value: 0 },
    uSplit: { value: 0 },
    uFade: { value: 0 },
    uTime: { value: 0 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}
