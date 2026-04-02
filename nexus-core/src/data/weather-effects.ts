// Weather effects — each weather type cascades realistically through the world
// Rain extinguishes fires, waters plants, makes surfaces slippery, fills containers

import type { WeatherEffect, WeatherType } from '../types/world-sim.js';

export interface WeatherTransition {
  from: WeatherType;
  to: WeatherType;
  probability: number;
  /** Minimum duration of 'from' weather before transition (seconds) */
  minDuration: number;
}

export const WEATHER_EFFECTS: readonly WeatherEffect[] = [
  // ── CLEAR ─────────────────────────────────────────────────────────────────
  {
    type: 'clear',
    effects: [
      { target: 'plants', action: 'grow', magnitude: 0.3, description: 'Sunlight enables photosynthesis' },
      { target: 'visibility', action: 'boost', magnitude: 1.0, description: 'Clear skies allow maximum visibility' },
      { target: 'movement', action: 'boost', magnitude: 0.1, description: 'Dry ground is easy to traverse' },
    ],
    educational: 'Clear weather occurs under high-pressure systems where descending air suppresses cloud formation.',
  },

  // ── RAIN ──────────────────────────────────────────────────────────────────
  {
    type: 'rain',
    effects: [
      { target: 'fire', action: 'extinguish', magnitude: 0.5, description: 'Light rain dampens fires' },
      { target: 'plants', action: 'grow', magnitude: 0.7, description: 'Rain provides water for growth' },
      { target: 'terrain', action: 'erode', magnitude: 0.1, description: 'Rainfall causes light erosion' },
      { target: 'movement', action: 'slow', magnitude: 0.2, description: 'Wet surfaces reduce traction' },
      { target: 'water', action: 'create', magnitude: 0.5, description: 'Rain fills containers and rivers' },
      { target: 'visibility', action: 'slow', magnitude: 0.3, description: 'Rain reduces visibility' },
    ],
    educational: 'Rain forms when water vapor condenses on dust particles in clouds. Droplets grow by collision-coalescence until heavy enough to fall.',
  },

  // ── HEAVY RAIN ────────────────────────────────────────────────────────────
  {
    type: 'heavy_rain',
    effects: [
      { target: 'fire', action: 'extinguish', magnitude: 1.0, description: 'Heavy rain extinguishes all fires' },
      { target: 'plants', action: 'grow', magnitude: 0.5, description: 'Heavy rain waters plants but can damage them' },
      { target: 'terrain', action: 'erode', magnitude: 0.5, description: 'Heavy rain causes significant erosion' },
      { target: 'structures', action: 'damage', magnitude: 0.2, description: 'Flooding threatens low structures' },
      { target: 'movement', action: 'slow', magnitude: 0.5, description: 'Flooding impedes ground travel' },
      { target: 'water', action: 'create', magnitude: 1.0, description: 'Rivers swell, containers overflow' },
      { target: 'visibility', action: 'slow', magnitude: 0.6, description: 'Heavy rain severely limits visibility' },
      { target: 'creatures', action: 'slow', magnitude: 0.4, description: 'Animals seek shelter' },
    ],
    educational: 'Heavy rain can produce 25+ mm per hour. This overwhelms soil absorption capacity, causing surface runoff and potential flash floods.',
  },

  // ── SNOW ──────────────────────────────────────────────────────────────────
  {
    type: 'snow',
    effects: [
      { target: 'terrain', action: 'freeze', magnitude: 0.5, description: 'Snow covers the ground, insulating it' },
      { target: 'plants', action: 'damage', magnitude: 0.2, description: 'Snow can damage exposed plants' },
      { target: 'movement', action: 'slow', magnitude: 0.4, description: 'Snow impedes walking speed' },
      { target: 'visibility', action: 'slow', magnitude: 0.3, description: 'Falling snow reduces visibility' },
      { target: 'fire', action: 'extinguish', magnitude: 0.3, description: 'Snow dampens small fires' },
      { target: 'water', action: 'freeze', magnitude: 0.3, description: 'Standing water begins to freeze' },
      { target: 'structures', action: 'damage', magnitude: 0.1, description: 'Snow load on roofs' },
    ],
    educational: 'Snow forms when water vapor deposits directly into ice crystals around a nucleus. Each snowflake has a unique hexagonal structure due to the crystal lattice of ice.',
  },

  // ── BLIZZARD ──────────────────────────────────────────────────────────────
  {
    type: 'blizzard',
    effects: [
      { target: 'movement', action: 'block', magnitude: 0.9, description: 'Near-zero visibility, extreme cold' },
      { target: 'visibility', action: 'block', magnitude: 0.9, description: 'Whiteout conditions' },
      { target: 'structures', action: 'damage', magnitude: 0.4, description: 'Wind and snow stress structures' },
      { target: 'fire', action: 'extinguish', magnitude: 0.8, description: 'Wind-driven snow extinguishes fires' },
      { target: 'creatures', action: 'damage', magnitude: 0.5, description: 'Extreme cold endangers wildlife' },
      { target: 'plants', action: 'damage', magnitude: 0.6, description: 'Extreme cold kills exposed vegetation' },
      { target: 'terrain', action: 'freeze', magnitude: 1.0, description: 'Everything freezes solid' },
    ],
    educational: 'Blizzards require temperatures below -7°C, winds above 56 km/h, and sufficient snow. Wind chill can make effective temperature 20-30°C colder than actual air temperature.',
  },

  // ── WIND ──────────────────────────────────────────────────────────────────
  {
    type: 'wind',
    effects: [
      { target: 'fire', action: 'spread', magnitude: 0.7, description: 'Wind fans flames and carries embers' },
      { target: 'movement', action: 'slow', magnitude: 0.2, description: 'Strong headwinds slow travel' },
      { target: 'terrain', action: 'erode', magnitude: 0.2, description: 'Wind erodes exposed surfaces' },
      { target: 'structures', action: 'damage', magnitude: 0.1, description: 'Wind stress on tall structures' },
      { target: 'plants', action: 'damage', magnitude: 0.1, description: 'Wind can break branches' },
    ],
    educational: 'Wind is caused by pressure differences in the atmosphere. Air flows from high to low pressure. The Coriolis effect (Earth\'s rotation) curves wind patterns into spirals.',
  },

  // ── STORM ─────────────────────────────────────────────────────────────────
  {
    type: 'storm',
    effects: [
      { target: 'metal', action: 'electrify', magnitude: 0.8, description: 'Lightning strikes metal objects' },
      { target: 'electronics', action: 'damage', magnitude: 0.6, description: 'Lightning surges damage electronics' },
      { target: 'structures', action: 'damage', magnitude: 0.3, description: 'Wind and lightning damage buildings' },
      { target: 'fire', action: 'create', magnitude: 0.3, description: 'Lightning can start fires' },
      { target: 'fire', action: 'extinguish', magnitude: 0.5, description: 'Rain from storm extinguishes fires' },
      { target: 'movement', action: 'slow', magnitude: 0.6, description: 'Dangerous to travel during storms' },
      { target: 'visibility', action: 'slow', magnitude: 0.5, description: 'Dark clouds and rain limit sight' },
      { target: 'water', action: 'create', magnitude: 0.7, description: 'Heavy storm rain raises water levels' },
      { target: 'terrain', action: 'erode', magnitude: 0.4, description: 'Storm runoff causes erosion' },
    ],
    educational: 'Thunderstorms form when warm, moist air rises rapidly (convection). Lightning occurs when charge separates within the cloud — a single bolt can be 30,000°C, five times hotter than the Sun\'s surface.',
  },

  // ── FOG ───────────────────────────────────────────────────────────────────
  {
    type: 'fog',
    effects: [
      { target: 'visibility', action: 'block', magnitude: 0.7, description: 'Fog drastically reduces visibility' },
      { target: 'movement', action: 'slow', magnitude: 0.3, description: 'Navigation is difficult in fog' },
      { target: 'plants', action: 'grow', magnitude: 0.2, description: 'Fog provides moisture to plants' },
      { target: 'water', action: 'create', magnitude: 0.1, description: 'Fog condensation on surfaces' },
    ],
    educational: 'Fog is a cloud at ground level — tiny water droplets suspended in air. It forms when air cools below its dew point. Radiation fog forms on clear, calm nights.',
  },

  // ── HEATWAVE ──────────────────────────────────────────────────────────────
  {
    type: 'heatwave',
    effects: [
      { target: 'water', action: 'erode', magnitude: 0.5, description: 'Water evaporates rapidly' },
      { target: 'plants', action: 'damage', magnitude: 0.4, description: 'Heat stress wilts plants' },
      { target: 'fire', action: 'spread', magnitude: 0.5, description: 'Dry conditions increase fire risk' },
      { target: 'creatures', action: 'slow', magnitude: 0.3, description: 'Animals are less active in extreme heat' },
      { target: 'metal', action: 'damage', magnitude: 0.1, description: 'Metal expands in heat, joints can buckle' },
      { target: 'movement', action: 'slow', magnitude: 0.2, description: 'Heat exhaustion slows travel' },
    ],
    educational: 'Heatwaves form under persistent high-pressure systems that trap hot air. Urban areas are 1-3°C hotter than surroundings (urban heat island effect) due to concrete and asphalt absorbing heat.',
  },

  // ── DROUGHT ───────────────────────────────────────────────────────────────
  {
    type: 'drought',
    effects: [
      { target: 'water', action: 'erode', magnitude: 0.8, description: 'Water sources dry up' },
      { target: 'plants', action: 'damage', magnitude: 0.7, description: 'Plants wither without water' },
      { target: 'fire', action: 'spread', magnitude: 0.8, description: 'Extreme fire danger' },
      { target: 'terrain', action: 'erode', magnitude: 0.3, description: 'Soil dries and cracks' },
      { target: 'creatures', action: 'damage', magnitude: 0.4, description: 'Wildlife struggles to find water' },
      { target: 'structures', action: 'damage', magnitude: 0.1, description: 'Soil shrinkage can crack foundations' },
    ],
    educational: 'Droughts result from prolonged periods without precipitation. They affect soil moisture, river levels, groundwater, and ecosystems. Droughts are natural but worsened by climate change and overuse of water resources.',
  },
] as const;

// ---------------------------------------------------------------------------
// Weather transition probabilities (Markov chain)
// ---------------------------------------------------------------------------

export const WEATHER_TRANSITIONS: readonly WeatherTransition[] = [
  // From clear
  { from: 'clear', to: 'clear', probability: 0.6, minDuration: 60 },
  { from: 'clear', to: 'wind', probability: 0.15, minDuration: 120 },
  { from: 'clear', to: 'rain', probability: 0.1, minDuration: 180 },
  { from: 'clear', to: 'fog', probability: 0.08, minDuration: 240 },
  { from: 'clear', to: 'heatwave', probability: 0.05, minDuration: 300 },
  { from: 'clear', to: 'snow', probability: 0.02, minDuration: 300 },

  // From rain
  { from: 'rain', to: 'clear', probability: 0.3, minDuration: 120 },
  { from: 'rain', to: 'rain', probability: 0.3, minDuration: 60 },
  { from: 'rain', to: 'heavy_rain', probability: 0.15, minDuration: 120 },
  { from: 'rain', to: 'storm', probability: 0.1, minDuration: 180 },
  { from: 'rain', to: 'fog', probability: 0.1, minDuration: 60 },
  { from: 'rain', to: 'wind', probability: 0.05, minDuration: 60 },

  // From heavy rain
  { from: 'heavy_rain', to: 'rain', probability: 0.4, minDuration: 60 },
  { from: 'heavy_rain', to: 'storm', probability: 0.25, minDuration: 60 },
  { from: 'heavy_rain', to: 'clear', probability: 0.15, minDuration: 120 },
  { from: 'heavy_rain', to: 'heavy_rain', probability: 0.15, minDuration: 60 },
  { from: 'heavy_rain', to: 'fog', probability: 0.05, minDuration: 60 },

  // From storm
  { from: 'storm', to: 'rain', probability: 0.35, minDuration: 60 },
  { from: 'storm', to: 'heavy_rain', probability: 0.25, minDuration: 60 },
  { from: 'storm', to: 'clear', probability: 0.2, minDuration: 120 },
  { from: 'storm', to: 'wind', probability: 0.15, minDuration: 60 },
  { from: 'storm', to: 'storm', probability: 0.05, minDuration: 60 },

  // From wind
  { from: 'wind', to: 'clear', probability: 0.4, minDuration: 60 },
  { from: 'wind', to: 'rain', probability: 0.2, minDuration: 120 },
  { from: 'wind', to: 'storm', probability: 0.1, minDuration: 180 },
  { from: 'wind', to: 'wind', probability: 0.2, minDuration: 60 },
  { from: 'wind', to: 'snow', probability: 0.1, minDuration: 120 },

  // From snow
  { from: 'snow', to: 'clear', probability: 0.25, minDuration: 120 },
  { from: 'snow', to: 'snow', probability: 0.3, minDuration: 60 },
  { from: 'snow', to: 'blizzard', probability: 0.15, minDuration: 180 },
  { from: 'snow', to: 'fog', probability: 0.15, minDuration: 120 },
  { from: 'snow', to: 'wind', probability: 0.15, minDuration: 60 },

  // From blizzard
  { from: 'blizzard', to: 'snow', probability: 0.5, minDuration: 60 },
  { from: 'blizzard', to: 'wind', probability: 0.2, minDuration: 60 },
  { from: 'blizzard', to: 'clear', probability: 0.15, minDuration: 120 },
  { from: 'blizzard', to: 'blizzard', probability: 0.15, minDuration: 60 },

  // From fog
  { from: 'fog', to: 'clear', probability: 0.5, minDuration: 60 },
  { from: 'fog', to: 'rain', probability: 0.2, minDuration: 120 },
  { from: 'fog', to: 'fog', probability: 0.2, minDuration: 60 },
  { from: 'fog', to: 'wind', probability: 0.1, minDuration: 60 },

  // From heatwave
  { from: 'heatwave', to: 'clear', probability: 0.3, minDuration: 120 },
  { from: 'heatwave', to: 'heatwave', probability: 0.3, minDuration: 60 },
  { from: 'heatwave', to: 'storm', probability: 0.15, minDuration: 240 },
  { from: 'heatwave', to: 'drought', probability: 0.15, minDuration: 300 },
  { from: 'heatwave', to: 'wind', probability: 0.1, minDuration: 60 },

  // From drought
  { from: 'drought', to: 'drought', probability: 0.4, minDuration: 120 },
  { from: 'drought', to: 'heatwave', probability: 0.2, minDuration: 120 },
  { from: 'drought', to: 'clear', probability: 0.2, minDuration: 180 },
  { from: 'drought', to: 'rain', probability: 0.1, minDuration: 300 },
  { from: 'drought', to: 'wind', probability: 0.1, minDuration: 60 },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getWeatherEffect(type: WeatherType): WeatherEffect | undefined {
  return WEATHER_EFFECTS.find(e => e.type === type);
}

export function getTransitionsFrom(weather: WeatherType): readonly WeatherTransition[] {
  return WEATHER_TRANSITIONS.filter(t => t.from === weather);
}

/** Pick next weather using weighted random based on transition probabilities */
export function nextWeather(
  current: WeatherType,
  elapsed: number,
  rng: () => number = Math.random,
): WeatherType {
  const transitions = WEATHER_TRANSITIONS.filter(
    t => t.from === current && elapsed >= t.minDuration,
  );

  if (transitions.length === 0) return current;

  const total = transitions.reduce((sum, t) => sum + t.probability, 0);
  let roll = rng() * total;

  for (const t of transitions) {
    roll -= t.probability;
    if (roll <= 0) return t.to;
  }

  return current;
}
