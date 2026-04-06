// Nexus Portal — full GLSL shader (WebGL via Three.js ShaderMaterial).
// Black hole photon ring + stargate wormhole shimmer.
// Particles swirl inward from all directions. On click: wormhole tunnel fly-through.

import * as THREE from 'three';
import { noiseGLSL } from './noise.glsl.js';

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uFlythrough;
uniform float uWarp;
uniform float uReveal;
uniform vec2  uResolution;
uniform sampler2D uText;

varying vec2 vUv;

${noiseGLSL}

const vec3 VOID       = vec3(0.0, 0.0, 0.01);
const vec3 COOL_BLUE  = vec3(0.2, 0.5, 0.9);
const vec3 CYAN       = vec3(0.3, 0.8, 1.0);
const vec3 PALE_BLUE  = vec3(0.6, 0.8, 1.0);
const vec3 HOT_WHITE  = vec3(0.95, 0.97, 1.0);
const float PI = 3.14159265;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash1(float n) { return fract(sin(n) * 43758.5453); }

// ── Star field ──
float starLayer(vec2 uv, float scale, float time, float threshold) {
  vec2 suv = uv * scale;
  vec2 cell = floor(suv);
  vec2 sub = fract(suv);
  float rnd = hash(cell);
  if (rnd < threshold) return 0.0;
  vec2 sp = vec2(hash(cell + 0.1), hash(cell + 0.2));
  float d = length(sub - sp);
  float twinkle = 0.5 + 0.5 * sin(time * (1.5 + rnd * 3.0) + rnd * 6.28);
  float size = 0.008 + (rnd - threshold) / (1.0 - threshold) * 0.014;
  return (smoothstep(size, size * 0.1, d) + smoothstep(size * 3.0, 0.0, d) * 0.15) * twinkle;
}

// ── Photon ring — black hole photon sphere with trapped, glowing light ──
vec3 photonRing(vec2 pos, float dist, float angle, float time, float ringR) {
  float delta = dist - ringR;

  // Multi-layer glow — bright trapped light like a photon sphere
  float sharp = exp(-delta * delta / 0.0003) * 1.6;
  float mid   = exp(-delta * delta / 0.004)  * 0.7;
  float wide  = exp(-delta * delta / 0.025)  * 0.25;
  float outer = exp(-delta * delta / 0.08)   * 0.08;

  // Swirling light bands trapped in orbit
  float swirl = angle + time * 0.5 + 1.0 / (abs(delta) + 0.02) * 0.02;
  float band1 = pow(0.5 + 0.5 * sin(swirl * 6.0 + time * 1.8), 2.0);
  float band2 = pow(0.5 + 0.5 * sin(swirl * 11.0 - time * 1.2 + delta * 30.0), 3.0);

  // Asymmetric Doppler brightness — one side brighter (relativistic beaming)
  float doppler = 0.8 + 0.4 * sin(angle - time * 0.3);

  float intensity = (sharp * (0.5 + band1 * 0.5) + mid * (0.6 + band2 * 0.4) + wide + outer) * doppler;
  vec3 col = mix(COOL_BLUE, HOT_WHITE, sharp * 0.6) * intensity;

  // Inner edge glow — light that almost escapes
  float innerGlow = smoothstep(ringR, ringR - 0.04, dist) * exp(-pow(dist - ringR + 0.02, 2.0) / 0.002);
  col += CYAN * innerGlow * 0.3;

  return col;
}

// ── Wormhole shimmer — stargate liquid surface inside the ring ──
vec3 wormholeShimmer(vec2 pos, float dist, float time, float ringR) {
  float inside = smoothstep(ringR - 0.005, ringR - 0.07, dist);
  if (inside < 0.001) return vec3(0.0);

  float n1 = snoise(vec3(pos * 3.0 + time * 0.08, time * 0.15)) * 0.5 + 0.5;
  float n2 = snoise(vec3(pos * 7.0 - time * 0.1, time * 0.2 + 5.0)) * 0.5 + 0.5;
  float n3 = snoise(vec3(pos * 14.0 + 10.0, time * 0.35)) * 0.5 + 0.5;
  float shimmer = n1 * 0.45 + n2 * 0.35 + n3 * 0.2;

  float ripple = sin(dist * 30.0 - time * 1.8) * 0.5 + 0.5;
  ripple *= sin(dist * 50.0 - time * 2.5 + atan(pos.y, pos.x) * 2.0) * 0.5 + 0.5;
  shimmer = shimmer * 0.6 + ripple * 0.4;

  vec3 col = mix(VOID * 2.0, COOL_BLUE * 0.3, shimmer);
  col += CYAN * pow(shimmer, 3.0) * 0.2;
  col += PALE_BLUE * pow(n3, 5.0) * 0.1;
  col += PALE_BLUE * exp(-dist * dist / 0.012) * 0.1;
  return col * inside;
}

// ── Swirling particles — lots of them, pulled inward, stretching near ring ──
float swirlParticles(vec2 pos, float time) {
  float result = 0.0;
  for (int i = 0; i < 80; i++) {
    float fi = float(i);
    float r1 = hash1(fi * 3.17);
    float r2 = hash1(fi * 7.31);
    float r3 = hash1(fi * 13.73);

    float orbitSpeed = 0.06 + r1 * 0.16;
    float phase = time * orbitSpeed + r1 * 100.0;
    float decay = fract(phase * 0.035 + r3);
    // Start from far out — fill the whole screen
    float startR = 0.15 + r2 * 0.75;
    float r = startR * (1.0 - decay * 0.7);

    float ang = phase + decay * 5.0;
    vec2 pPos = vec2(cos(ang), sin(ang)) * r;
    float d = length(pos - pPos);

    // Stretch into streaks as they get close to the ring
    float nearRing = smoothstep(0.42, 0.28, r);
    vec2 tangent = vec2(-sin(ang), cos(ang));
    float sLen = 0.003 + nearRing * 0.045;
    float t = clamp(dot(pos - pPos, tangent), -sLen, sLen);
    vec2 closest = pPos + tangent * t;
    float dStreak = length(pos - closest);
    float shape = mix(d, dStreak, nearRing);

    float size = 0.002 + r3 * 0.003;
    float core = smoothstep(size, size * 0.08, shape);
    float glow = smoothstep(size * 4.0, 0.0, shape) * 0.1;
    float lifecycle = sin(decay * PI) * (0.25 + r1 * 0.75);
    result += (core + glow) * lifecycle;
  }
  return result;
}

// ── Wormhole tunnel during fly-through — stargate streaks of light ──
vec3 wormholeTunnel(vec2 pos, float dist, float angle, float time, float fly) {
  if (fly < 0.01) return vec3(0.0);

  // Light streaks rushing past — radial lines of energy
  float streakAngle = angle + time * 0.5;
  float streaks = 0.0;
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    float sa = fi * PI / 8.0 + hash1(fi * 5.7) * 0.3;
    float angDiff = abs(mod(streakAngle - sa + PI, PI * 2.0) - PI);
    float width = 0.02 + hash1(fi * 3.1) * 0.03;
    float streak = exp(-angDiff * angDiff / (width * width)) * fly;
    // Streaks get longer and brighter as fly progresses
    float depthPulse = pow(0.5 + 0.5 * sin(dist * 40.0 - time * 15.0 + fi * 2.0), 2.0);
    streaks += streak * depthPulse * (0.5 + hash1(fi * 9.3) * 0.5);
  }

  // Tunnel wall energy — expanding ring of light we pass through
  float expandR = 0.30 + fly * fly * 1.2;
  float wallDist = abs(dist - expandR);
  float wallGlow = exp(-wallDist * wallDist / (0.003 + fly * 0.01)) * fly;

  // Turbulent energy on tunnel walls — noise-driven, not geometric rings
  float tunnelN1 = snoise(vec3(angle * 3.0 + time * 4.0, dist * 8.0 - time * 10.0, time * 0.3));
  float tunnelN2 = snoise(vec3(angle * 5.0 - time * 3.0, dist * 12.0 - time * 14.0, time * 0.5 + 7.0));
  float energy = pow(0.5 + 0.5 * tunnelN1, 3.0) * 0.6 + pow(0.5 + 0.5 * tunnelN2, 4.0) * 0.4;
  energy *= fly * smoothstep(0.0, 0.08, dist);

  vec3 col = vec3(0.0);
  col += mix(CYAN, HOT_WHITE, fly * 0.5) * streaks * 0.4;
  col += mix(COOL_BLUE, HOT_WHITE, fly) * wallGlow * 0.6;
  col += PALE_BLUE * energy * 0.2;

  // Center brightens — light at the end of the tunnel
  float endLight = exp(-dist * dist / (0.005 + fly * fly * 0.15)) * fly;
  col += HOT_WHITE * endLight * 0.6;

  return col;
}

void main() {
  vec2 uv = vUv;
  float time = uTime;
  float fly = uFlythrough;
  float warp = uWarp;

  float aspect = uResolution.x / uResolution.y;
  vec2 pos = (uv - 0.5) * vec2(aspect, 1.0);
  float dist = length(pos);
  float angle = atan(pos.y, pos.x);

  float ringR = 0.30;

  // ── Deep space ──
  vec3 color = VOID;

  // Reveal progression — cinematic fade-in of effects
  float starsReveal   = smoothstep(0.0,  0.35, uReveal);
  float particleReveal = smoothstep(0.2, 0.55, uReveal);
  float ringReveal    = smoothstep(0.4,  0.75, uReveal);
  float shimmerReveal = smoothstep(0.6,  1.0,  uReveal);

  // Nebula haze
  float neb = snoise(vec3(pos * 1.2, time * 0.015)) * 0.5 + 0.5;
  neb *= snoise(vec3(pos * 2.0 + 7.0, time * 0.02)) * 0.5 + 0.5;
  color += COOL_BLUE * neb * 0.02 * starsReveal;

  // Star fields — multiple layers
  float stars = starLayer(uv, 30.0, time, 0.90);
  stars += starLayer(uv + 0.5, 55.0, time, 0.92) * 0.7;
  stars += starLayer(uv + 0.3, 90.0, time * 0.8, 0.94) * 0.5;
  stars += starLayer(uv + 0.7, 150.0, time * 0.6, 0.96) * 0.3;
  color += HOT_WHITE * stars * 0.4 * starsReveal;

  // Gravitational lensing
  float lensZone = smoothstep(0.55, 0.32, dist) * smoothstep(0.22, 0.30, dist);
  float lensAngle = angle + lensZone * 0.6;
  vec2 lensUV = vec2(cos(lensAngle), sin(lensAngle)) * dist * 0.6 + 0.5;
  float lensStars = starLayer(lensUV, 45.0, time, 0.87);
  color += PALE_BLUE * lensStars * lensZone * 0.5 * starsReveal;

  // ── Swirling particles everywhere ──
  float particles = swirlParticles(pos, time);
  color += mix(COOL_BLUE, CYAN, clamp(particles, 0.0, 1.0)) * particles * 0.45 * particleReveal;

  // ── Photon ring ──
  color += photonRing(pos, dist, angle, time, ringR) * ringReveal;

  // ── Wormhole shimmer ──
  color += wormholeShimmer(pos, dist, time, ringR) * shimmerReveal;

  // ── Fly-through: wormhole tunnel ──
  color += wormholeTunnel(pos, dist, angle, time, fly);

  // ── Text layer ──
  vec2 textUv = uv;

  // Spaghettification — text stretches
  if (warp > 0.0) {
    float edgeDist = abs(textUv.x - 0.5) * 2.0;
    float warpAmt = warp * edgeDist * edgeDist;
    textUv.x = 0.5 + (textUv.x - 0.5) * (1.0 + warpAmt * 0.5);
    textUv.y = 0.5 + (textUv.y - 0.5) * (1.0 + warpAmt * 0.7);
  }

  // Fly-through: text rips apart, dragged into the tunnel walls
  if (fly > 0.0) {
    // Words split vertically — pulled to top and bottom walls
    float splitAmt = fly * fly * 2.5;
    float isTop = step(0.5, vUv.y);
    textUv.y += (isTop * 2.0 - 1.0) * splitAmt * 0.4;

    // Horizontal stretch — pulled outward toward ring walls
    textUv.x = 0.5 + (textUv.x - 0.5) * (1.0 + fly * fly * 2.0);

    // Radial pull — text curves toward the ring edge
    vec2 textDir = textUv - 0.5;
    float textDist = length(textDir);
    if (textDist > 0.001) {
      textUv += normalize(textDir) * fly * fly * 0.15;
    }
  }

  vec4 textSample = vec4(0.0);
  if (textUv.x >= 0.0 && textUv.x <= 1.0 && textUv.y >= 0.0 && textUv.y <= 1.0) {
    textSample = texture2D(uText, textUv);
  }

  // Text fades as it's torn apart
  float textFade = 1.0 - smoothstep(0.0, 0.4, fly);
  float textAlpha = textSample.a * textFade;
  color = mix(color, textSample.rgb, textAlpha);

  // ── Final fly-through: darken then flash ──
  if (fly > 0.25) {
    color *= 1.0 - smoothstep(0.25, 0.8, fly) * 0.85;
  }
  if (fly > 0.8) {
    float flashT = (fly - 0.8) / 0.2;
    color = mix(color, HOT_WHITE, flashT * flashT);
  }

  // Vignette
  float vig = 1.0 - smoothstep(0.5, 1.6, length(vUv - 0.5) * 2.0);
  color *= 0.7 + 0.3 * vig;

  gl_FragColor = vec4(color, 1.0);
}
`;

export interface GalaxyPortalUniforms {
  [key: string]: THREE.IUniform;
  uTime: { value: number };
  uFlythrough: { value: number };
  uWarp: { value: number };
  uReveal: { value: number };
  uResolution: { value: THREE.Vector2 };
  uText: { value: THREE.Texture | null };
}

export function createGalaxyPortalMaterial(
  textTexture: THREE.Texture,
): THREE.ShaderMaterial & { uniforms: GalaxyPortalUniforms } {
  const uniforms: GalaxyPortalUniforms = {
    uTime: { value: 0 },
    uFlythrough: { value: 0 },
    uWarp: { value: 0 },
    uReveal: { value: 1.0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uText: { value: textTexture },
  };

  return new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    depthWrite: false, depthTest: false,
  }) as THREE.ShaderMaterial & { uniforms: GalaxyPortalUniforms };
}
