// World state, biome management, object placement

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { WorldStateRepository } from '../db/repositories/world-state.js';
import type { BiomeDefinition, WorldState, InventoryEntry } from '../types/world.js';
import type { SceneGraph, SceneObject, SceneLight, AudioCue } from '../types/scene.js';

// --- Biome Definitions ---

export const BIOME_DEFINITIONS: BiomeDefinition[] = [
  {
    id: 'workshop',
    name: 'The Workshop',
    description: 'A sprawling inventor\'s workshop where engineering, math, and physics come alive through hands-on building.',
    primarySubjects: ['engineering', 'math.arithmetic', 'math.geometry', 'science.physics'],
    objects: [
      {
        id: 'workbench',
        name: 'Workbench',
        meshType: 'box',
        color: '#8B4513',
        scale: { x: 2, y: 1, z: 1 },
        position: { x: 0, y: 0.5, z: -3 },
        interactionType: 'craft',
        teaches: ['engineering.basics'],
      },
      {
        id: 'gear-wall',
        name: 'Gear Display Wall',
        meshType: 'plane',
        color: '#4A4A4A',
        scale: { x: 4, y: 3, z: 0.1 },
        position: { x: -5, y: 1.5, z: -5 },
        interactionType: 'examine',
        teaches: ['math.geometry', 'science.physics'],
      },
      {
        id: 'blueprint-table',
        name: 'Blueprint Table',
        meshType: 'box',
        color: '#2F4F4F',
        scale: { x: 1.5, y: 0.8, z: 1.5 },
        position: { x: 4, y: 0.4, z: -2 },
        interactionType: 'use',
        teaches: ['math.geometry', 'engineering.structures'],
      },
    ],
    ambientLighting: {
      ambientColor: '#FFE4B5',
      ambientIntensity: 0.4,
      directionalColor: '#FFF8DC',
      directionalIntensity: 0.8,
      directionalDirection: { x: -1, y: -2, z: -1 },
    },
    groundType: 'wood',
    groundColor: '#8B6914',
    skyType: 'color',
    skyPrimaryColor: '#87CEEB',
  },
  {
    id: 'alchemist-lab',
    name: "The Alchemist's Lab",
    description: 'A mysterious laboratory filled with bubbling potions, chemical reactions, and biological wonders.',
    primarySubjects: ['science.chemistry', 'science.biology.basics', 'science.matter'],
    objects: [
      {
        id: 'cauldron',
        name: 'Mixing Cauldron',
        meshType: 'cylinder',
        color: '#2F2F2F',
        scale: { x: 1, y: 1.2, z: 1 },
        position: { x: 0, y: 0.6, z: -2 },
        interactionType: 'craft',
        teaches: ['science.chemistry'],
      },
      {
        id: 'specimen-shelf',
        name: 'Specimen Shelf',
        meshType: 'box',
        color: '#654321',
        scale: { x: 3, y: 2, z: 0.5 },
        position: { x: -4, y: 1, z: -4 },
        interactionType: 'examine',
        teaches: ['science.biology.basics'],
      },
      {
        id: 'element-table',
        name: 'Element Classification Table',
        meshType: 'box',
        color: '#1C1C1C',
        scale: { x: 2, y: 0.8, z: 1 },
        position: { x: 3, y: 0.4, z: -3 },
        interactionType: 'use',
        teaches: ['science.matter'],
      },
    ],
    ambientLighting: {
      ambientColor: '#9370DB',
      ambientIntensity: 0.3,
      directionalColor: '#DDA0DD',
      directionalIntensity: 0.5,
      directionalDirection: { x: 0, y: -1, z: -1 },
    },
    groundType: 'stone',
    groundColor: '#3D3D3D',
    skyType: 'gradient',
    skyPrimaryColor: '#2E0854',
    skySecondaryColor: '#4B0082',
  },
  {
    id: 'crystal-caverns',
    name: 'The Crystal Caverns',
    description: 'Glittering underground caverns where geology, chemistry, and mathematical patterns intertwine in crystalline formations.',
    primarySubjects: ['science.geology', 'science.chemistry', 'math.geometry'],
    objects: [
      {
        id: 'crystal-cluster',
        name: 'Crystal Cluster',
        meshType: 'model',
        modelId: 'crystal_cluster',
        color: '#00CED1',
        scale: { x: 1.5, y: 2, z: 1.5 },
        position: { x: -2, y: 0, z: -4 },
        interactionType: 'examine',
        teaches: ['science.geology', 'math.geometry'],
      },
      {
        id: 'mineral-vein',
        name: 'Mineral Vein',
        meshType: 'box',
        color: '#DAA520',
        scale: { x: 3, y: 0.5, z: 0.3 },
        position: { x: 2, y: 1, z: -6 },
        interactionType: 'pickup',
        teaches: ['science.geology'],
      },
      {
        id: 'echo-pool',
        name: 'Echo Pool',
        meshType: 'cylinder',
        color: '#4169E1',
        scale: { x: 2, y: 0.1, z: 2 },
        position: { x: 0, y: 0, z: -8 },
        interactionType: 'examine',
        teaches: ['science.chemistry'],
      },
    ],
    ambientLighting: {
      ambientColor: '#00BFFF',
      ambientIntensity: 0.2,
      directionalColor: '#E0FFFF',
      directionalIntensity: 0.3,
      directionalDirection: { x: 0, y: -1, z: 0 },
    },
    groundType: 'rock',
    groundColor: '#2F4F4F',
    skyType: 'color',
    skyPrimaryColor: '#0D0D2B',
  },
  {
    id: 'living-forest',
    name: 'The Living Forest',
    description: 'A vibrant forest ecosystem teeming with life, where biology and ecology are discovered through observation and interaction.',
    primarySubjects: ['science.biology.basics', 'science.biology.ecology'],
    objects: [
      {
        id: 'ancient-tree',
        name: 'Ancient Tree',
        meshType: 'model',
        modelId: 'ancient_tree',
        color: '#228B22',
        scale: { x: 3, y: 5, z: 3 },
        position: { x: 0, y: 0, z: -5 },
        interactionType: 'examine',
        teaches: ['science.biology.basics'],
      },
      {
        id: 'pond',
        name: 'Forest Pond',
        meshType: 'cylinder',
        color: '#5F9EA0',
        scale: { x: 3, y: 0.05, z: 3 },
        position: { x: 5, y: 0, z: -8 },
        interactionType: 'examine',
        teaches: ['science.biology.ecology'],
      },
      {
        id: 'mushroom-ring',
        name: 'Mushroom Ring',
        meshType: 'model',
        modelId: 'mushroom_ring',
        color: '#FF6347',
        scale: { x: 2, y: 0.5, z: 2 },
        position: { x: -4, y: 0, z: -6 },
        interactionType: 'examine',
        teaches: ['science.biology.basics'],
      },
    ],
    ambientLighting: {
      ambientColor: '#90EE90',
      ambientIntensity: 0.5,
      directionalColor: '#FFFACD',
      directionalIntensity: 0.7,
      directionalDirection: { x: -0.5, y: -1, z: -0.5 },
    },
    groundType: 'grass',
    groundColor: '#228B22',
    skyType: 'gradient',
    skyPrimaryColor: '#87CEEB',
    skySecondaryColor: '#E0F7FA',
  },
  {
    id: 'library-echoes',
    name: 'The Library of Echoes',
    description: 'An infinite library where words have weight, stories come alive, and language is the key to every door.',
    primarySubjects: ['language.reading', 'language.writing', 'language.grammar'],
    objects: [
      {
        id: 'story-lectern',
        name: 'Story Lectern',
        meshType: 'box',
        color: '#8B0000',
        scale: { x: 0.6, y: 1.2, z: 0.6 },
        position: { x: 0, y: 0.6, z: -3 },
        interactionType: 'use',
        teaches: ['language.reading'],
      },
      {
        id: 'writing-desk',
        name: 'Enchanted Writing Desk',
        meshType: 'box',
        color: '#4B0082',
        scale: { x: 1.5, y: 0.8, z: 1 },
        position: { x: -3, y: 0.4, z: -4 },
        interactionType: 'use',
        teaches: ['language.writing'],
      },
      {
        id: 'word-wall',
        name: 'Word Wall',
        meshType: 'plane',
        color: '#F5DEB3',
        scale: { x: 5, y: 3, z: 0.1 },
        position: { x: 0, y: 1.5, z: -7 },
        interactionType: 'examine',
        teaches: ['language.grammar'],
      },
    ],
    ambientLighting: {
      ambientColor: '#FFD700',
      ambientIntensity: 0.3,
      directionalColor: '#FAEBD7',
      directionalIntensity: 0.6,
      directionalDirection: { x: 0, y: -1, z: -0.5 },
    },
    groundType: 'marble',
    groundColor: '#F5F5DC',
    skyType: 'color',
    skyPrimaryColor: '#2C1810',
  },

  // --- Humanities + Culture Cluster ---

  {
    id: 'ancient-ruins',
    name: 'The Ancient Ruins',
    description: 'Crumbling structures from a lost civilization where history, archaeology, and ancient languages are uncovered through excavation and exploration.',
    spokenName: 'The Ancient Ruins',
    ambientDescription: 'Wind whispers through stone corridors. Distant chiseling echoes off weathered columns.',
    primarySubjects: ['history.civilizations', 'history.archaeology', 'language.ancient', 'history.chronology'],
    objects: [
      {
        id: 'excavation-site',
        name: 'Excavation Site',
        meshType: 'box',
        color: '#C4A46C',
        iconShape: 'diamond',
        scale: { x: 4, y: 0.3, z: 4 },
        position: { x: 0, y: 0.15, z: -4 },
        interactionType: 'craft',
        teaches: ['history.archaeology', 'science.geology'],
        spokenName: 'Excavation Site',
        accessibilityDescription: 'A roped-off dig area with layered soil. Use tools to carefully uncover buried artifacts from different historical periods.',
      },
      {
        id: 'inscription-wall',
        name: 'Inscription Wall',
        meshType: 'plane',
        color: '#8B8378',
        iconShape: 'square',
        scale: { x: 5, y: 3, z: 0.3 },
        position: { x: -5, y: 1.5, z: -6 },
        interactionType: 'examine',
        teaches: ['language.ancient', 'history.writing'],
        spokenName: 'Inscription Wall',
        accessibilityDescription: 'A tall stone wall carved with symbols from ancient writing systems including cuneiform, hieroglyphs, and early alphabets.',
      },
      {
        id: 'artifact-table',
        name: 'Artifact Table',
        meshType: 'box',
        color: '#6B4226',
        iconShape: 'circle',
        scale: { x: 2, y: 0.8, z: 1.2 },
        position: { x: 4, y: 0.4, z: -3 },
        interactionType: 'use',
        teaches: ['history.artifacts', 'history.archaeology'],
        spokenName: 'Artifact Table',
        accessibilityDescription: 'A wooden table for sorting and cataloging discovered artifacts. Classify objects by age, material, and origin.',
      },
      {
        id: 'timeline-mural',
        name: 'Timeline Mural',
        meshType: 'plane',
        color: '#D2B48C',
        iconShape: 'arrow',
        scale: { x: 8, y: 2.5, z: 0.1 },
        position: { x: 0, y: 2, z: -8 },
        interactionType: 'examine',
        teaches: ['history.chronology', 'history.civilizations'],
        spokenName: 'Timeline Mural',
        accessibilityDescription: 'A sweeping wall painting showing the rise and fall of civilizations from Mesopotamia through the Renaissance, arranged left to right in chronological order.',
      },
      {
        id: 'pottery-workshop',
        name: 'Pottery Workshop',
        meshType: 'cylinder',
        color: '#A0522D',
        iconShape: 'circle',
        scale: { x: 1.2, y: 0.9, z: 1.2 },
        position: { x: -3, y: 0.45, z: -2 },
        interactionType: 'craft',
        teaches: ['history.archaeology', 'art.ceramics'],
        spokenName: 'Pottery Workshop',
        accessibilityDescription: 'A potter\'s wheel and kiln for shaping clay vessels. Recreate pottery styles from ancient Greek, Chinese, and Pueblo traditions.',
      },
      {
        id: 'stone-tablet',
        name: 'Stone Tablet',
        meshType: 'box',
        color: '#696969',
        iconShape: 'square',
        scale: { x: 0.8, y: 1.2, z: 0.15 },
        position: { x: 3, y: 0.6, z: -6 },
        interactionType: 'examine',
        teaches: ['language.decoding', 'history.records'],
        spokenName: 'Stone Tablet',
        accessibilityDescription: 'A weathered stone tablet with etched markings. Decode messages by matching symbol patterns to known ancient scripts.',
      },
      {
        id: 'map-room',
        name: 'Map Room',
        meshType: 'box',
        color: '#8B7D6B',
        iconShape: 'star',
        scale: { x: 3, y: 0.1, z: 3 },
        position: { x: 0, y: 0.8, z: -10 },
        interactionType: 'use',
        teaches: ['geography.ancient', 'history.trade'],
        spokenName: 'Map Room',
        accessibilityDescription: 'A raised stone table displaying ancient trade routes and territorial boundaries. Trace how civilizations connected through the Silk Road, Mediterranean shipping lanes, and river valleys.',
      },
    ],
    ambientLighting: {
      ambientColor: '#D2B48C',
      ambientIntensity: 0.4,
      directionalColor: '#FAEBD7',
      directionalIntensity: 0.7,
      directionalDirection: { x: -0.5, y: -1.5, z: -1 },
    },
    groundType: 'sandstone',
    groundColor: '#C4A46C',
    skyType: 'gradient',
    skyPrimaryColor: '#87CEEB',
    skySecondaryColor: '#F5DEB3',
  },
  {
    id: 'time-rift',
    name: 'The Time Rift',
    description: 'A shimmering portal chamber where historical periods converge, teaching cause and effect through witnessing pivotal moments in history.',
    spokenName: 'The Time Rift',
    ambientDescription: 'A deep harmonic hum pulses rhythmically. Clock-like ticking echoes from every direction.',
    primarySubjects: ['history.events', 'history.causation', 'social-studies.civics', 'history.chronology'],
    objects: [
      {
        id: 'time-portal',
        name: 'Time Portal',
        meshType: 'cylinder',
        color: '#7B68EE',
        iconShape: 'circle',
        scale: { x: 2, y: 3, z: 2 },
        position: { x: 0, y: 1.5, z: -5 },
        interactionType: 'use',
        teaches: ['history.periods', 'history.events'],
        spokenName: 'Time Portal',
        accessibilityDescription: 'A glowing archway that opens views into different historical periods. Step through to witness events from ancient Egypt to the space age.',
      },
      {
        id: 'event-viewer',
        name: 'Event Viewer',
        meshType: 'sphere',
        color: '#4169E1',
        iconShape: 'circle',
        scale: { x: 1.5, y: 1.5, z: 1.5 },
        position: { x: -4, y: 1.2, z: -3 },
        interactionType: 'examine',
        teaches: ['history.events', 'history.analysis'],
        spokenName: 'Event Viewer',
        accessibilityDescription: 'A floating crystal sphere showing scenes from history. Watch key moments unfold — the signing of the Magna Carta, the first Moon landing, the fall of the Berlin Wall.',
      },
      {
        id: 'decision-console',
        name: 'Decision Console',
        meshType: 'box',
        color: '#483D8B',
        iconShape: 'diamond',
        scale: { x: 1.5, y: 1, z: 1 },
        position: { x: 4, y: 0.5, z: -4 },
        interactionType: 'use',
        teaches: ['history.causation', 'social-studies.civics'],
        spokenName: 'Decision Console',
        accessibilityDescription: 'A panel of levers and dials for exploring historical what-ifs. Change a decision and watch how it ripples through the timeline.',
      },
      {
        id: 'consequence-map',
        name: 'Consequence Map',
        meshType: 'plane',
        color: '#6A5ACD',
        iconShape: 'arrow',
        scale: { x: 4, y: 3, z: 0.1 },
        position: { x: -3, y: 1.5, z: -7 },
        interactionType: 'examine',
        teaches: ['history.causation', 'social-studies.systems'],
        spokenName: 'Consequence Map',
        accessibilityDescription: 'A branching diagram on the wall showing how one historical event leads to others. Trace how the invention of the printing press led to the Reformation and the scientific revolution.',
      },
      {
        id: 'historical-figure-hologram',
        name: 'Historical Figure Hologram',
        meshType: 'cylinder',
        color: '#9370DB',
        iconShape: 'star',
        scale: { x: 0.8, y: 2, z: 0.8 },
        position: { x: 3, y: 1, z: -7 },
        interactionType: 'talk',
        teaches: ['history.figures', 'history.biography'],
        spokenName: 'Historical Figure Hologram',
        accessibilityDescription: 'A shimmering projection platform that presents historical figures. Listen to accounts from explorers, scientists, leaders, and artists who shaped the world.',
      },
      {
        id: 'timeline-web',
        name: 'Timeline Web',
        meshType: 'plane',
        color: '#B0C4DE',
        iconShape: 'hexagon',
        scale: { x: 5, y: 4, z: 0.1 },
        position: { x: 0, y: 2.5, z: -9 },
        interactionType: 'examine',
        teaches: ['history.chronology', 'math.patterns'],
        spokenName: 'Timeline Web',
        accessibilityDescription: 'An interconnected web of threads on the ceiling, each thread representing a chain of events. See how simultaneous events across continents influenced each other.',
      },
      {
        id: 'butterfly-effect-display',
        name: 'Butterfly Effect Display',
        meshType: 'box',
        color: '#8A2BE2',
        iconShape: 'triangle',
        scale: { x: 2, y: 2, z: 0.5 },
        position: { x: 0, y: 1, z: -2 },
        interactionType: 'examine',
        teaches: ['history.causation', 'science.systems'],
        spokenName: 'Butterfly Effect Display',
        accessibilityDescription: 'An interactive display showing how small actions create large consequences. Watch a single trade route decision reshape an entire civilization\'s future.',
      },
    ],
    ambientLighting: {
      ambientColor: '#9370DB',
      ambientIntensity: 0.3,
      directionalColor: '#E6E6FA',
      directionalIntensity: 0.5,
      directionalDirection: { x: 0, y: -1, z: -0.5 },
    },
    groundType: 'crystal',
    groundColor: '#2F1F4F',
    skyType: 'gradient',
    skyPrimaryColor: '#0D0D2B',
    skySecondaryColor: '#4B0082',
  },
  {
    id: 'explorers-map',
    name: "The Explorer's Map",
    description: 'A cartographer\'s base where geography, navigation, and world cultures are discovered through mapping, exploration, and cultural exchange.',
    spokenName: "The Explorer's Map",
    ambientDescription: 'Compass needles click softly. Parchment rustles as an ocean breeze drifts through open windows.',
    primarySubjects: ['geography.regions', 'geography.navigation', 'social-studies.cultures', 'geography.climate'],
    objects: [
      {
        id: 'world-map-table',
        name: 'World Map Table',
        meshType: 'box',
        color: '#DEB887',
        iconShape: 'square',
        scale: { x: 3.5, y: 0.9, z: 2.5 },
        position: { x: 0, y: 0.45, z: -4 },
        interactionType: 'use',
        teaches: ['geography.regions', 'geography.mapping'],
        spokenName: 'World Map Table',
        accessibilityDescription: 'A large table covered with detailed maps of every continent. Place markers to identify countries, mountain ranges, rivers, and oceans.',
      },
      {
        id: 'compass-workshop',
        name: 'Compass Workshop',
        meshType: 'box',
        color: '#8B4513',
        iconShape: 'diamond',
        scale: { x: 1.2, y: 0.8, z: 1.2 },
        position: { x: -4, y: 0.4, z: -2 },
        interactionType: 'craft',
        teaches: ['geography.navigation', 'math.angles'],
        spokenName: 'Compass Workshop',
        accessibilityDescription: 'A workbench with magnetic needles and protractors. Build compasses and practice using cardinal directions, bearings, and angular measurement.',
      },
      {
        id: 'globe',
        name: 'Globe',
        meshType: 'sphere',
        color: '#4682B4',
        iconShape: 'circle',
        scale: { x: 1.5, y: 1.5, z: 1.5 },
        position: { x: 4, y: 1.2, z: -3 },
        interactionType: 'examine',
        teaches: ['geography.continents', 'geography.coordinates'],
        spokenName: 'Globe',
        accessibilityDescription: 'A rotating model of Earth showing continents, oceans, and latitude and longitude lines. Spin it to locate any place on the planet.',
      },
      {
        id: 'terrain-model',
        name: 'Terrain Model',
        meshType: 'box',
        color: '#556B2F',
        iconShape: 'triangle',
        scale: { x: 2.5, y: 1, z: 2.5 },
        position: { x: -3, y: 0.5, z: -6 },
        interactionType: 'examine',
        teaches: ['geography.landforms', 'science.geology'],
        spokenName: 'Terrain Model',
        accessibilityDescription: 'A raised-relief model of different landforms — mountains, valleys, plateaus, and coastlines. Feel and see how tectonic forces shape the land.',
      },
      {
        id: 'culture-display',
        name: 'Culture Display',
        meshType: 'box',
        color: '#CD853F',
        iconShape: 'star',
        scale: { x: 3, y: 2.5, z: 0.5 },
        position: { x: 3, y: 1.25, z: -7 },
        interactionType: 'examine',
        teaches: ['social-studies.cultures', 'geography.human'],
        spokenName: 'Culture Display',
        accessibilityDescription: 'A wall of alcoves showcasing traditions from around the world — clothing, instruments, foods, and architectural models from every inhabited continent.',
      },
      {
        id: 'climate-chart',
        name: 'Climate Chart',
        meshType: 'plane',
        color: '#87CEEB',
        iconShape: 'hexagon',
        scale: { x: 3, y: 2, z: 0.1 },
        position: { x: -4, y: 1.5, z: -8 },
        interactionType: 'examine',
        teaches: ['geography.climate', 'science.weather'],
        spokenName: 'Climate Chart',
        accessibilityDescription: 'A wall chart showing climate zones from tropical to polar. Compare temperature, rainfall, and seasonal patterns across different regions of the world.',
      },
      {
        id: 'navigation-tools',
        name: 'Navigation Tools',
        meshType: 'box',
        color: '#B8860B',
        iconShape: 'arrow',
        scale: { x: 1.5, y: 0.5, z: 1 },
        position: { x: 0, y: 0.8, z: -1 },
        interactionType: 'use',
        teaches: ['geography.navigation', 'math.geometry'],
        spokenName: 'Navigation Tools',
        accessibilityDescription: 'A collection of sextants, astrolabes, and rulers. Practice measuring angles, plotting courses, and calculating distances on a map.',
      },
    ],
    ambientLighting: {
      ambientColor: '#FAEBD7',
      ambientIntensity: 0.5,
      directionalColor: '#FFF8DC',
      directionalIntensity: 0.7,
      directionalDirection: { x: -1, y: -1.5, z: -0.5 },
    },
    groundType: 'wood',
    groundColor: '#A0522D',
    skyType: 'gradient',
    skyPrimaryColor: '#87CEEB',
    skySecondaryColor: '#E0F7FA',
  },
  {
    id: 'gallery',
    name: 'The Gallery',
    description: 'A creative studio and museum where art, design, mathematical patterns, and art history converge through hands-on creation and observation.',
    spokenName: 'The Gallery',
    ambientDescription: 'Soft footsteps on polished floors. Brushstrokes swish gently. A quiet hum of creative energy fills the air.',
    primarySubjects: ['art.painting', 'art.sculpture', 'math.geometry', 'art.history'],
    objects: [
      {
        id: 'canvas-easel',
        name: 'Canvas Easel',
        meshType: 'box',
        color: '#F5F5DC',
        iconShape: 'square',
        scale: { x: 0.8, y: 1.8, z: 0.5 },
        position: { x: -3, y: 0.9, z: -3 },
        interactionType: 'craft',
        teaches: ['art.painting', 'art.technique'],
        spokenName: 'Canvas Easel',
        accessibilityDescription: 'A tall wooden easel holding a blank canvas. Mix pigments and apply brushstrokes to create paintings using techniques from impressionism to pointillism.',
      },
      {
        id: 'sculpture-station',
        name: 'Sculpture Station',
        meshType: 'cylinder',
        color: '#D3D3D3',
        iconShape: 'circle',
        scale: { x: 1.2, y: 0.8, z: 1.2 },
        position: { x: 3, y: 0.4, z: -3 },
        interactionType: 'craft',
        teaches: ['art.sculpture', 'math.geometry'],
        spokenName: 'Sculpture Station',
        accessibilityDescription: 'A turning pedestal with clay and carving tools. Shape three-dimensional forms while exploring volume, proportion, and geometric solids.',
      },
      {
        id: 'color-wheel',
        name: 'Color Wheel',
        meshType: 'cylinder',
        color: '#FF6347',
        iconShape: 'circle',
        scale: { x: 1.5, y: 0.1, z: 1.5 },
        position: { x: 0, y: 1.5, z: -6 },
        interactionType: 'examine',
        teaches: ['art.color-theory', 'science.light'],
        spokenName: 'Color Wheel',
        accessibilityDescription: 'A large rotating disc showing primary, secondary, and tertiary colors. Explore complementary pairs, warm and cool tones, and how mixing pigments differs from mixing light.',
      },
      {
        id: 'perspective-grid',
        name: 'Perspective Grid',
        meshType: 'plane',
        color: '#F0E68C',
        iconShape: 'diamond',
        scale: { x: 4, y: 3, z: 0.1 },
        position: { x: -5, y: 1.5, z: -7 },
        interactionType: 'use',
        teaches: ['art.perspective', 'math.geometry'],
        spokenName: 'Perspective Grid',
        accessibilityDescription: 'A wall panel with vanishing-point guidelines. Practice drawing objects in one-point and two-point perspective to create depth on a flat surface.',
      },
      {
        id: 'art-history-timeline',
        name: 'Art History Timeline',
        meshType: 'plane',
        color: '#DAA520',
        iconShape: 'arrow',
        scale: { x: 6, y: 2, z: 0.1 },
        position: { x: 0, y: 2, z: -9 },
        interactionType: 'examine',
        teaches: ['art.history', 'history.culture'],
        spokenName: 'Art History Timeline',
        accessibilityDescription: 'A panoramic display showing major art movements from cave paintings through cubism and beyond. See how art changed with society, technology, and new ideas.',
      },
      {
        id: 'pattern-design-table',
        name: 'Pattern Design Table',
        meshType: 'box',
        color: '#9370DB',
        iconShape: 'hexagon',
        scale: { x: 2, y: 0.8, z: 1.5 },
        position: { x: 4, y: 0.4, z: -6 },
        interactionType: 'craft',
        teaches: ['art.patterns', 'math.symmetry'],
        spokenName: 'Pattern Design Table',
        accessibilityDescription: 'A table with tiles, stamps, and drawing tools for creating repeating patterns. Explore tessellations, rotational symmetry, and Islamic geometric art.',
      },
      {
        id: 'photography-lab',
        name: 'Photography Lab',
        meshType: 'box',
        color: '#2F4F4F',
        iconShape: 'square',
        scale: { x: 2, y: 1.5, z: 1.5 },
        position: { x: -4, y: 0.75, z: -5 },
        interactionType: 'use',
        teaches: ['art.photography', 'art.composition'],
        spokenName: 'Photography Lab',
        accessibilityDescription: 'A workstation with a camera and editing tools. Learn composition through the rule of thirds, framing, leading lines, and light balance.',
      },
    ],
    ambientLighting: {
      ambientColor: '#FFFFF0',
      ambientIntensity: 0.6,
      directionalColor: '#FFFAF0',
      directionalIntensity: 0.8,
      directionalDirection: { x: 0, y: -2, z: -1 },
    },
    groundType: 'marble',
    groundColor: '#F5F5F5',
    skyType: 'color',
    skyPrimaryColor: '#FAF0E6',
  },
  {
    id: 'newsroom',
    name: 'The Newsroom',
    description: 'A bustling media center where language arts, writing, journalism, and media literacy are practiced through real-world reporting and storytelling.',
    spokenName: 'The Newsroom',
    ambientDescription: 'Typewriter keys clatter rapidly. A printing press rumbles in the background. Urgent murmuring fills the room.',
    primarySubjects: ['language.writing', 'language.reading', 'language.media-literacy', 'language.research'],
    objects: [
      {
        id: 'editors-desk',
        name: "Editor's Desk",
        meshType: 'box',
        color: '#654321',
        iconShape: 'square',
        scale: { x: 2, y: 0.8, z: 1.2 },
        position: { x: 0, y: 0.4, z: -3 },
        interactionType: 'use',
        teaches: ['language.writing', 'language.editing'],
        spokenName: "Editor's Desk",
        accessibilityDescription: 'A wide desk covered with drafts and red pencils. Revise articles by improving clarity, fixing grammar, and strengthening arguments.',
      },
      {
        id: 'printing-press',
        name: 'Printing Press',
        meshType: 'box',
        color: '#2F2F2F',
        iconShape: 'diamond',
        scale: { x: 2, y: 2, z: 1.5 },
        position: { x: -4, y: 1, z: -5 },
        interactionType: 'craft',
        teaches: ['language.publishing', 'history.communication'],
        spokenName: 'Printing Press',
        accessibilityDescription: 'A mechanical press with movable type. Arrange letters, set headlines, and print your articles — just as Gutenberg\'s invention revolutionized information sharing.',
      },
      {
        id: 'interview-booth',
        name: 'Interview Booth',
        meshType: 'box',
        color: '#8B0000',
        iconShape: 'star',
        scale: { x: 1.5, y: 2, z: 1.5 },
        position: { x: 4, y: 1, z: -4 },
        interactionType: 'talk',
        teaches: ['language.speaking', 'language.questioning'],
        spokenName: 'Interview Booth',
        accessibilityDescription: 'A soundproofed recording booth with two chairs and a microphone. Practice asking open-ended questions and listening for the key details in a story.',
      },
      {
        id: 'fact-check-station',
        name: 'Fact-Check Station',
        meshType: 'box',
        color: '#006400',
        iconShape: 'hexagon',
        scale: { x: 1.5, y: 1.2, z: 1 },
        position: { x: -3, y: 0.6, z: -7 },
        interactionType: 'use',
        teaches: ['language.analysis', 'language.media-literacy'],
        spokenName: 'Fact-Check Station',
        accessibilityDescription: 'A research desk with reference books and a magnifying glass. Verify claims by cross-referencing sources, spotting logical fallacies, and distinguishing opinion from fact.',
      },
      {
        id: 'headline-board',
        name: 'Headline Board',
        meshType: 'plane',
        color: '#F5F5DC',
        iconShape: 'arrow',
        scale: { x: 4, y: 2.5, z: 0.1 },
        position: { x: 0, y: 2, z: -8 },
        interactionType: 'use',
        teaches: ['language.writing', 'language.persuasion'],
        spokenName: 'Headline Board',
        accessibilityDescription: 'A large corkboard for composing and arranging headlines. Craft concise, accurate titles that capture the essence of a story without misleading.',
      },
      {
        id: 'photo-editor',
        name: 'Photo Editor',
        meshType: 'box',
        color: '#4169E1',
        iconShape: 'circle',
        scale: { x: 1.5, y: 1, z: 1 },
        position: { x: 3, y: 0.5, z: -7 },
        interactionType: 'use',
        teaches: ['art.photography', 'language.visual-literacy'],
        spokenName: 'Photo Editor',
        accessibilityDescription: 'A lightbox and cropping tools for selecting and arranging photographs. Choose images that tell the truth of a story and learn how framing changes meaning.',
      },
      {
        id: 'archive-library',
        name: 'Archive Library',
        meshType: 'box',
        color: '#8B7D6B',
        iconShape: 'square',
        scale: { x: 3, y: 2.5, z: 0.8 },
        position: { x: 0, y: 1.25, z: -10 },
        interactionType: 'examine',
        teaches: ['language.research', 'history.records'],
        spokenName: 'Archive Library',
        accessibilityDescription: 'Floor-to-ceiling shelves of bound newspapers, photographs, and documents. Research past events to provide context and depth to current stories.',
      },
    ],
    ambientLighting: {
      ambientColor: '#FFFDD0',
      ambientIntensity: 0.5,
      directionalColor: '#FFF8DC',
      directionalIntensity: 0.7,
      directionalDirection: { x: -1, y: -2, z: -0.5 },
    },
    groundType: 'wood',
    groundColor: '#696969',
    skyType: 'color',
    skyPrimaryColor: '#708090',
  },
  {
    id: 'theater',
    name: 'The Theater',
    description: 'A grand performance hall where language arts, literature, and dramatic expression are experienced through storytelling, stagecraft, and collaborative creation.',
    spokenName: 'The Theater',
    ambientDescription: 'Heavy curtains rustle. Footsteps echo on a wooden stage. A spotlight hums overhead.',
    primarySubjects: ['language.performance', 'language.writing', 'language.literature', 'art.design'],
    objects: [
      {
        id: 'stage',
        name: 'Stage',
        meshType: 'box',
        color: '#8B4513',
        iconShape: 'square',
        scale: { x: 6, y: 0.6, z: 4 },
        position: { x: 0, y: 0.3, z: -6 },
        interactionType: 'use',
        teaches: ['language.performance', 'language.expression'],
        spokenName: 'Stage',
        accessibilityDescription: 'A raised wooden platform with velvet curtains on each side. Step into the spotlight to perform scenes, practice public speaking, or act out historical events.',
      },
      {
        id: 'script-writing-desk',
        name: 'Script Writing Desk',
        meshType: 'box',
        color: '#4B0082',
        iconShape: 'diamond',
        scale: { x: 1.5, y: 0.8, z: 1 },
        position: { x: -5, y: 0.4, z: -3 },
        interactionType: 'craft',
        teaches: ['language.writing', 'language.storytelling'],
        spokenName: 'Script Writing Desk',
        accessibilityDescription: 'A desk with quill pens and bound scripts. Write dialogue, stage directions, and plot outlines to bring original stories to life on stage.',
      },
      {
        id: 'costume-workshop',
        name: 'Costume Workshop',
        meshType: 'box',
        color: '#DC143C',
        iconShape: 'star',
        scale: { x: 2, y: 2, z: 1.5 },
        position: { x: 5, y: 1, z: -4 },
        interactionType: 'craft',
        teaches: ['art.design', 'history.fashion'],
        spokenName: 'Costume Workshop',
        accessibilityDescription: 'Racks of fabrics, sewing tools, and pattern books. Design costumes that reflect the era, culture, and character of a performance — from ancient togas to modern attire.',
      },
      {
        id: 'set-design-table',
        name: 'Set Design Table',
        meshType: 'box',
        color: '#2E8B57',
        iconShape: 'hexagon',
        scale: { x: 2, y: 0.8, z: 1.5 },
        position: { x: -4, y: 0.4, z: -7 },
        interactionType: 'craft',
        teaches: ['art.design', 'math.geometry'],
        spokenName: 'Set Design Table',
        accessibilityDescription: 'A table with miniature stage models and building supplies. Plan and construct sets using scale, proportion, and spatial reasoning.',
      },
      {
        id: 'sound-board',
        name: 'Sound Board',
        meshType: 'box',
        color: '#1C1C1C',
        iconShape: 'circle',
        scale: { x: 2, y: 1.2, z: 0.8 },
        position: { x: 4, y: 0.6, z: -8 },
        interactionType: 'use',
        teaches: ['music.sound', 'science.acoustics'],
        spokenName: 'Sound Board',
        accessibilityDescription: 'A mixing console with sliders and dials. Control music, sound effects, and ambient audio to set the mood for each scene.',
      },
      {
        id: 'directors-chair',
        name: "Director's Chair",
        meshType: 'box',
        color: '#000080',
        iconShape: 'triangle',
        scale: { x: 0.8, y: 1.2, z: 0.8 },
        position: { x: 0, y: 0.6, z: -1 },
        interactionType: 'use',
        teaches: ['language.direction', 'social-studies.leadership'],
        spokenName: "Director's Chair",
        accessibilityDescription: 'A tall canvas chair facing the stage. Sit here to direct a performance — choose blocking, manage timing, and coordinate the entire production.',
      },
      {
        id: 'audience-seating',
        name: 'Audience Seating',
        meshType: 'box',
        color: '#800020',
        iconShape: 'square',
        scale: { x: 5, y: 1.5, z: 3 },
        position: { x: 0, y: 0.75, z: 3 },
        interactionType: 'examine',
        teaches: ['social-studies.community', 'language.critique'],
        spokenName: 'Audience Seating',
        accessibilityDescription: 'Rows of cushioned seats arranged in a semicircle. Watch performances and reflect on the story, the characters, and the craft of the production.',
      },
    ],
    ambientLighting: {
      ambientColor: '#FFD700',
      ambientIntensity: 0.2,
      directionalColor: '#FFFAF0',
      directionalIntensity: 0.9,
      directionalDirection: { x: 0, y: -2, z: -0.3 },
    },
    groundType: 'wood',
    groundColor: '#3D1C02',
    skyType: 'color',
    skyPrimaryColor: '#1A1A2E',
  },
  {
    id: 'marketplace',
    name: 'The Marketplace',
    description: 'A vibrant trading hub where economics, arithmetic, social studies, and entrepreneurship emerge naturally through buying, selling, and running a business.',
    spokenName: 'The Marketplace',
    ambientDescription: 'Coins clink on countertops. Cheerful haggling and the creak of wooden carts fill a bustling open-air market.',
    primarySubjects: ['economics.trade', 'math.arithmetic', 'social-studies.systems', 'economics.entrepreneurship'],
    objects: [
      {
        id: 'market-stalls',
        name: 'Market Stalls',
        meshType: 'box',
        color: '#DAA520',
        iconShape: 'square',
        scale: { x: 3, y: 2, z: 2 },
        position: { x: -3, y: 1, z: -4 },
        interactionType: 'use',
        teaches: ['economics.trade', 'math.arithmetic'],
        spokenName: 'Market Stalls',
        accessibilityDescription: 'Colorful wooden stalls displaying goods from different regions. Set prices, make change, and negotiate trades using addition, subtraction, and multiplication.',
      },
      {
        id: 'bank-counter',
        name: 'Bank Counter',
        meshType: 'box',
        color: '#2F4F4F',
        iconShape: 'diamond',
        scale: { x: 2.5, y: 1.2, z: 1 },
        position: { x: 4, y: 0.6, z: -3 },
        interactionType: 'use',
        teaches: ['economics.banking', 'math.percentages'],
        spokenName: 'Bank Counter',
        accessibilityDescription: 'A polished counter with a ledger, coins, and a balance scale. Manage savings, calculate simple interest, and learn how lending and borrowing work.',
      },
      {
        id: 'stock-ticker',
        name: 'Stock Ticker',
        meshType: 'box',
        color: '#006400',
        iconShape: 'arrow',
        scale: { x: 3, y: 1.5, z: 0.3 },
        position: { x: 0, y: 1.5, z: -7 },
        interactionType: 'examine',
        teaches: ['economics.markets', 'math.statistics'],
        spokenName: 'Stock Ticker',
        accessibilityDescription: 'A scrolling board showing the rising and falling values of different goods. Track supply and demand patterns, read simple charts, and predict market trends.',
      },
      {
        id: 'business-plan-table',
        name: 'Business Plan Table',
        meshType: 'box',
        color: '#4169E1',
        iconShape: 'hexagon',
        scale: { x: 2, y: 0.8, z: 1.5 },
        position: { x: -4, y: 0.4, z: -7 },
        interactionType: 'craft',
        teaches: ['economics.entrepreneurship', 'language.planning'],
        spokenName: 'Business Plan Table',
        accessibilityDescription: 'A planning table with charts, budgets, and idea cards. Design a business from scratch — choose a product, calculate costs, set prices, and plan for growth.',
      },
      {
        id: 'supply-chain-map',
        name: 'Supply Chain Map',
        meshType: 'plane',
        color: '#CD853F',
        iconShape: 'arrow',
        scale: { x: 4, y: 2.5, z: 0.1 },
        position: { x: 3, y: 1.5, z: -8 },
        interactionType: 'examine',
        teaches: ['economics.logistics', 'geography.trade'],
        spokenName: 'Supply Chain Map',
        accessibilityDescription: 'A wall map with routes drawn between farms, factories, and shops. Trace how raw materials travel the world to become finished products on store shelves.',
      },
      {
        id: 'customer-service-desk',
        name: 'Customer Service Desk',
        meshType: 'box',
        color: '#B22222',
        iconShape: 'star',
        scale: { x: 1.5, y: 1, z: 1 },
        position: { x: 0, y: 0.5, z: -2 },
        interactionType: 'talk',
        teaches: ['social-studies.communication', 'economics.service'],
        spokenName: 'Customer Service Desk',
        accessibilityDescription: 'A help counter with a bell and a suggestion box. Practice listening to needs, solving problems, and communicating clearly and kindly.',
      },
      {
        id: 'innovation-lab',
        name: 'Innovation Lab',
        meshType: 'box',
        color: '#4682B4',
        iconShape: 'triangle',
        scale: { x: 2, y: 1.5, z: 2 },
        position: { x: -3, y: 0.75, z: -9 },
        interactionType: 'craft',
        teaches: ['economics.innovation', 'engineering.design'],
        spokenName: 'Innovation Lab',
        accessibilityDescription: 'A prototyping corner with tools and materials. Invent new products, test them with customers, improve the design, and bring ideas from concept to market.',
      },
    ],
    ambientLighting: {
      ambientColor: '#FFF8DC',
      ambientIntensity: 0.5,
      directionalColor: '#FFFACD',
      directionalIntensity: 0.8,
      directionalDirection: { x: -0.5, y: -1.5, z: -1 },
    },
    groundType: 'cobblestone',
    groundColor: '#A9A9A9',
    skyType: 'gradient',
    skyPrimaryColor: '#87CEEB',
    skySecondaryColor: '#FFE4B5',
  },
];

export function getBiomeDefinition(biomeId: string): BiomeDefinition | undefined {
  return BIOME_DEFINITIONS.find((b) => b.id === biomeId);
}

// --- WorldSystem ---

export class WorldSystem implements System {
  readonly name = 'world';
  readonly priority = 5;

  private worldStateRepo: WorldStateRepository | null = null;
  private activeProfileId: string | null = null;
  private cachedWorldState: WorldState | null = null;
  setRepository(repo: WorldStateRepository): void {
    this.worldStateRepo = repo;
  }

  loadProfile(profileId: string): void {
    this.activeProfileId = profileId;
    this.cachedWorldState = null;
  }

  update(world: World, _dt: number): void {
    if (!this.activeProfileId || !this.worldStateRepo) return;

    // Process move actions
    const actions = world.peekActions();
    for (const action of actions) {
      if (action.type === 'move' && action.payload && 'direction' in action.payload) {
        // Movement updates player position entities
        const players = world.query(['player', 'position']);
        for (const entity of players) {
          const pos = world.getComponent(entity, 'position');
          const payload = action.payload as { direction: { x: number; z: number }; running: boolean };
          if (pos) {
            const speed = payload.running ? 8 : 4;
            pos.x += payload.direction.x * speed * _dt;
            pos.z += payload.direction.z * speed * _dt;
          }
        }
      }
    }
  }

  getWorldState(): WorldState | null {
    if (!this.activeProfileId || !this.worldStateRepo) return null;
    if (!this.cachedWorldState) {
      this.cachedWorldState = this.worldStateRepo.get(this.activeProfileId) ?? null;
    }
    return this.cachedWorldState;
  }

  changeBiome(biomeId: string): boolean {
    if (!this.activeProfileId || !this.worldStateRepo) return false;

    const state = this.getWorldState();
    if (!state) return false;

    if (!state.discoveredBiomes.includes(biomeId)) return false;

    this.worldStateRepo.update(this.activeProfileId, { activeBiome: biomeId });
    this.cachedWorldState = null;
    return true;
  }

  discoverBiome(biomeId: string): boolean {
    if (!this.activeProfileId || !this.worldStateRepo) return false;

    const definition = getBiomeDefinition(biomeId);
    if (!definition) return false;

    this.worldStateRepo.addDiscoveredBiome(this.activeProfileId, biomeId);
    this.cachedWorldState = null;
    return true;
  }

  addInventoryItem(itemType: string, quantity: number): boolean {
    if (!this.activeProfileId || !this.worldStateRepo) return false;
    this.worldStateRepo.updateInventory(this.activeProfileId, itemType, quantity);
    this.cachedWorldState = null;
    return true;
  }

  removeInventoryItem(itemType: string, quantity: number): boolean {
    if (!this.activeProfileId || !this.worldStateRepo) return false;

    const state = this.getWorldState();
    if (!state) return false;

    const item = state.inventory.find((i) => i.itemType === itemType);
    if (!item || item.quantity < quantity) return false;

    this.worldStateRepo.updateInventory(this.activeProfileId, itemType, -quantity);
    this.cachedWorldState = null;
    return true;
  }

  getInventory(): InventoryEntry[] {
    const state = this.getWorldState();
    return state?.inventory ?? [];
  }

  /** Build a scene graph from the current world state */
  buildSceneGraph(world: World): SceneGraph {
    const state = this.getWorldState();
    const biome = state ? getBiomeDefinition(state.activeBiome) : getBiomeDefinition('workshop');
    const biomeDef = biome ?? BIOME_DEFINITIONS[0]!;

    // Build lights from biome
    const lights: SceneLight[] = [
      {
        entityId: -1,
        position: biomeDef.ambientLighting.directionalDirection,
        lightType: 'ambient',
        color: biomeDef.ambientLighting.ambientColor,
        intensity: biomeDef.ambientLighting.ambientIntensity,
      },
      {
        entityId: -2,
        position: biomeDef.ambientLighting.directionalDirection,
        lightType: 'directional',
        color: biomeDef.ambientLighting.directionalColor,
        intensity: biomeDef.ambientLighting.directionalIntensity,
      },
    ];

    // Add light entities
    const lightEntities = world.query(['light', 'position']);
    for (const entity of lightEntities) {
      const lightComp = world.getComponent(entity, 'light');
      const pos = world.getComponent(entity, 'position');
      if (lightComp && pos) {
        lights.push({
          entityId: entity,
          position: { x: pos.x, y: pos.y, z: pos.z },
          lightType: lightComp.lightType,
          color: lightComp.color,
          intensity: lightComp.intensity,
          range: lightComp.range,
        });
      }
    }

    // Build objects from biome templates + ECS entities
    const objects: SceneObject[] = [];

    // Biome static objects
    for (const template of biomeDef.objects) {
      objects.push({
        entityId: -100 - objects.length,
        position: template.position,
        rotation: { x: 0, y: 0, z: 0 },
        renderable: {
          meshType: template.meshType,
          modelId: template.modelId,
          color: template.color,
          scale: template.scale,
          visible: true,
        },
        interactable: template.interactionType
          ? {
              interactionType: template.interactionType,
              radius: 2,
              prompt: `Interact with ${template.name}`,
            }
          : undefined,
        highlight: false,
      });
    }

    // ECS renderable entities
    const renderables = world.query(['position', 'renderable']);
    for (const entity of renderables) {
      const pos = world.getComponent(entity, 'position')!;
      const rot = world.getComponent(entity, 'rotation');
      const rend = world.getComponent(entity, 'renderable')!;
      const interact = world.getComponent(entity, 'interactable');

      objects.push({
        entityId: entity,
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: rot ? { x: rot.x, y: rot.y, z: rot.z } : { x: 0, y: 0, z: 0 },
        renderable: {
          meshType: rend.meshType,
          modelId: rend.modelId,
          color: rend.color,
          scale: rend.scale,
          material: rend.material,
          visible: rend.visible,
        },
        interactable: interact
          ? {
              interactionType: interact.interactionType,
              radius: interact.radius,
              prompt: interact.prompt,
            }
          : undefined,
        highlight: false,
      });
    }

    // Player camera
    const players = world.query(['player', 'position']);
    const playerEntity = players[0];
    let cameraPos = { x: 0, y: 5, z: 10 };
    let cameraRot = { x: -0.3, y: 0, z: 0 };

    if (playerEntity !== undefined) {
      const pos = world.getComponent(playerEntity, 'position');
      if (pos) {
        cameraPos = { x: pos.x, y: pos.y + 5, z: pos.z + 10 };
      }
    }

    const audio: AudioCue[] = [];

    return {
      camera: {
        position: cameraPos,
        rotation: cameraRot,
        fov: 60,
        near: 0.1,
        far: 1000,
      },
      lights,
      objects,
      sky: {
        type: biomeDef.skyType,
        primaryColor: biomeDef.skyPrimaryColor,
        secondaryColor: biomeDef.skySecondaryColor,
      },
      ground: {
        type: biomeDef.groundType,
        color: biomeDef.groundColor,
        size: { width: 100, depth: 100 },
      },
      ui: {
        elements: [],
        dialogueActive: false,
        inventoryOpen: false,
        mapOpen: false,
        paused: false,
      },
      audio,
      announcements: [],
      captions: [],
    };
  }
}
