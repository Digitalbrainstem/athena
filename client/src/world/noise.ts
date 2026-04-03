// Deterministic 2D noise for terrain generation
// Uses hash-based value noise with fractal Brownian motion

function hash2D(ix: number, iz: number): number {
  let n = (ix * 73856093) ^ (iz * 19349663);
  n = ((n >> 13) ^ n);
  n = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
  return n / 0x7fffffff;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** 2D value noise returning [0, 1] */
export function noise2D(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smoothstep(x - ix);
  const fz = smoothstep(z - iz);

  const a = hash2D(ix, iz);
  const b = hash2D(ix + 1, iz);
  const c = hash2D(ix, iz + 1);
  const d = hash2D(ix + 1, iz + 1);

  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}

/** Fractal Brownian motion — layered noise for natural-looking terrain */
export function fbm(
  x: number,
  z: number,
  octaves = 6,
  lacunarity = 2,
  gain = 0.5,
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += noise2D(x * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return value / maxValue;
}

/** Ridged noise — sharper peaks, good for mountain ridges */
export function ridgedNoise(x: number, z: number, octaves = 4): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise2D(x * frequency, z * frequency) * 2 - 1);
    value += n * n * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}
