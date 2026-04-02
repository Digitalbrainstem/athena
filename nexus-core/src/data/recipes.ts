// Game recipes mapped to real science
// Every recipe is grounded in real chemistry, physics, or color theory

import type { CraftRecipe } from '../types/craft.js';

export const RECIPES: readonly CraftRecipe[] = [
  // =========================================================================
  // Foundation (ages 2-5) — sensory exploration, color theory, counting
  // =========================================================================
  {
    id: 'mix-purple-paint',
    name: 'Mix Purple Paint',
    description: 'Combine red and blue pigments to create purple paint.',
    tier: 'foundation',
    biome: 'workshop',
    inputs: [
      { type: 'item', id: 'red-pigment', quantity: 1 },
      { type: 'item', id: 'blue-pigment', quantity: 1 },
    ],
    output: { type: 'item', id: 'purple-pigment', quantity: 1 },
    skillsTaught: ['color-theory-subtractive-mixing'],
    scienceExplanation: 'Red and blue are primary colors. When you mix them, each pigment absorbs different wavelengths of light, and what remains looks purple to our eyes.',
    accessibility: {
      spokenName: 'mix purple paint',
      spokenFormula: 'red pigment plus blue pigment makes purple pigment',
      description: 'Select red pigment from your inventory, then select blue pigment. Tap craft to mix them into purple paint.',
      iconShape: 'triangle',
    },
  },
  {
    id: 'mix-green-paint',
    name: 'Mix Green Paint',
    description: 'Combine yellow and blue pigments to create green paint.',
    tier: 'foundation',
    biome: 'workshop',
    inputs: [
      { type: 'item', id: 'yellow-pigment', quantity: 1 },
      { type: 'item', id: 'blue-pigment', quantity: 1 },
    ],
    output: { type: 'item', id: 'green-pigment', quantity: 1 },
    skillsTaught: ['color-theory-subtractive-mixing'],
    scienceExplanation: 'Yellow absorbs blue light and blue absorbs red light. Together, only green wavelengths pass through — giving you green paint!',
    accessibility: {
      spokenName: 'mix green paint',
      spokenFormula: 'yellow pigment plus blue pigment makes green pigment',
      description: 'Select yellow pigment from your inventory, then select blue pigment. Tap craft to mix them into green paint.',
      iconShape: 'triangle',
    },
  },
  {
    id: 'mix-orange-paint',
    name: 'Mix Orange Paint',
    description: 'Combine red and yellow pigments to create orange paint.',
    tier: 'foundation',
    biome: 'workshop',
    inputs: [
      { type: 'item', id: 'red-pigment', quantity: 1 },
      { type: 'item', id: 'yellow-pigment', quantity: 1 },
    ],
    output: { type: 'item', id: 'orange-pigment', quantity: 1 },
    skillsTaught: ['color-theory-subtractive-mixing'],
    scienceExplanation: 'Red and yellow pigments together reflect wavelengths in between — the orange part of the spectrum.',
    accessibility: {
      spokenName: 'mix orange paint',
      spokenFormula: 'red pigment plus yellow pigment makes orange pigment',
      description: 'Select red pigment from your inventory, then select yellow pigment. Tap craft to mix them into orange paint.',
      iconShape: 'triangle',
    },
  },
  {
    id: 'stack-block-tower',
    name: 'Build a Block Tower',
    description: 'Stack wooden blocks to build a stable tower. Wider base = taller tower!',
    tier: 'foundation',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'pine-wood', quantity: 5 },
    ],
    output: { type: 'structure', id: 'block-tower', quantity: 1 },
    skillsTaught: ['basic-stability', 'counting-to-five'],
    scienceExplanation: 'A tower is stable when its center of gravity is over its base. Wider bases make more stable towers — that is why pyramids never fall over.',
    accessibility: {
      spokenName: 'build a block tower',
      spokenFormula: 'five pine wood makes a block tower',
      description: 'Select five units of pine wood from your inventory. Tap craft to stack them into a block tower.',
      iconShape: 'square',
    },
  },
  {
    id: 'counting-potion',
    name: 'Counting Potion',
    description: 'Add exactly three drops of blue and two drops of red to make a magic potion.',
    tier: 'foundation',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'item', id: 'blue-pigment', quantity: 3 },
      { type: 'item', id: 'red-pigment', quantity: 2 },
    ],
    output: { type: 'item', id: 'counting-potion', quantity: 1 },
    skillsTaught: ['counting-to-five', 'color-theory-subtractive-mixing'],
    scienceExplanation: 'Counting out exact amounts is important in science — chemists measure things very carefully. You used 3 + 2 = 5 drops total!',
    accessibility: {
      spokenName: 'counting potion',
      spokenFormula: 'three blue pigment plus two red pigment makes a counting potion',
      description: 'Select three units of blue pigment and two units of red pigment from your inventory. Tap craft to mix them into a counting potion.',
      iconShape: 'triangle',
    },
  },
  {
    id: 'mud-brick',
    name: 'Make a Mud Brick',
    description: 'Mix clay and water, then shape and dry it in the sun.',
    tier: 'foundation',
    biome: 'workshop',
    inputs: [
      { type: 'item', id: 'clay', quantity: 2 },
      { type: 'compound', id: 'H2O', quantity: 1 },
    ],
    output: { type: 'item', id: 'mud-brick', quantity: 1 },
    skillsTaught: ['material-properties-basics'],
    scienceExplanation: 'When clay dries, the water evaporates and the clay particles stick together tightly, making a hard brick. People have built with mud bricks for over 10,000 years!',
    accessibility: {
      spokenName: 'make a mud brick',
      spokenFormula: 'two clay plus one water makes a mud brick',
      description: 'Select two units of clay and one unit of water from your inventory. Tap craft to shape and dry them into a mud brick.',
      iconShape: 'triangle',
    },
  },

  // =========================================================================
  // Discovery (ages 6-10) — observable reactions, basic building
  // =========================================================================
  {
    id: 'fizzy-volcano',
    name: 'Fizzy Volcano',
    description: 'Mix vinegar and baking soda to create a fizzy eruption!',
    tier: 'discovery',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'CH3COOH', quantity: 1 },
      { type: 'compound', id: 'NaHCO3', quantity: 1 },
    ],
    output: { type: 'compound', id: 'CO2', quantity: 1 },
    skillsTaught: ['acid-base-intro', 'gas-production'],
    scienceExplanation: 'Vinegar (acetic acid) reacts with baking soda (sodium bicarbonate) to produce carbon dioxide gas — the bubbles you see! The equation: CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂',
    accessibility: {
      spokenName: 'fizzy volcano',
      spokenFormula: 'one acetic acid plus one sodium bicarbonate makes one carbon dioxide',
      description: 'Select acetic acid and sodium bicarbonate from your inventory. Tap craft to mix them and create a fizzy eruption of carbon dioxide.',
      iconShape: 'circle',
    },
  },
  {
    id: 'salt-from-sea',
    name: 'Harvest Sea Salt',
    description: 'Evaporate seawater to collect salt crystals.',
    tier: 'discovery',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'item', id: 'seawater', quantity: 3 },
    ],
    output: { type: 'compound', id: 'NaCl', quantity: 1 },
    skillsTaught: ['dissolution', 'crystallization', 'evaporation'],
    scienceExplanation: 'Seawater contains dissolved sodium chloride (NaCl). When the water evaporates, the salt ions come together to form crystals. This is how salt has been harvested for thousands of years.',
    accessibility: {
      spokenName: 'harvest sea salt',
      spokenFormula: 'three seawater makes one sodium chloride',
      description: 'Select three units of seawater from your inventory. Tap craft to evaporate the water and collect salt crystals.',
      iconShape: 'circle',
    },
  },
  {
    id: 'wooden-bridge',
    name: 'Build a Wooden Bridge',
    description: 'Construct a simple beam bridge from oak planks.',
    tier: 'discovery',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'oak-wood', quantity: 6 },
    ],
    output: { type: 'structure', id: 'wooden-bridge', quantity: 1 },
    skillsTaught: ['beam-bridge-basics', 'load-distribution'],
    scienceExplanation: 'A beam bridge supports weight by transferring the load to its supports (abutments) at each end. The beam experiences compression on top and tension on the bottom. Oak is strong enough for a short bridge.',
    accessibility: {
      spokenName: 'build a wooden bridge',
      spokenFormula: 'six oak wood makes a wooden bridge',
      description: 'Select six units of oak wood from your inventory. Tap craft to construct a simple beam bridge.',
      iconShape: 'square',
    },
  },
  {
    id: 'simple-wall',
    name: 'Build a Stone Wall',
    description: 'Stack sandstone blocks to build a wall.',
    tier: 'discovery',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'sandstone', quantity: 8 },
    ],
    output: { type: 'structure', id: 'stone-wall', quantity: 1 },
    skillsTaught: ['compressive-strength-intro', 'stacking-stability'],
    scienceExplanation: 'Stone walls work because stone is incredibly strong in compression — it can handle heavy loads pushing down on it. That is why ancient stone buildings still stand after thousands of years.',
    accessibility: {
      spokenName: 'build a stone wall',
      spokenFormula: 'eight sandstone makes a stone wall',
      description: 'Select eight units of sandstone from your inventory. Tap craft to stack them into a stone wall.',
      iconShape: 'square',
    },
  },
  {
    id: 'glass-pane',
    name: 'Make Glass from Sand',
    description: 'Heat sand (silicon dioxide) to make glass.',
    tier: 'discovery',
    biome: 'workshop',
    inputs: [
      { type: 'compound', id: 'SiO2', quantity: 3 },
    ],
    output: { type: 'item', id: 'glass-pane', quantity: 1 },
    skillsTaught: ['melting-point', 'amorphous-solids'],
    scienceExplanation: 'Glass is made by heating sand (SiO₂) to about 1700°C. Unlike crystals, glass is an amorphous solid — its molecules are arranged randomly, which is why it is transparent.',
    accessibility: {
      spokenName: 'make glass from sand',
      spokenFormula: 'three silicon dioxide makes one glass pane',
      description: 'Select three units of silicon dioxide from your inventory. Tap craft to heat the sand and form a glass pane.',
      iconShape: 'triangle',
    },
  },
  {
    id: 'rust-experiment',
    name: 'Rust an Iron Nail',
    description: 'Expose iron to moisture and air to observe rust formation.',
    tier: 'discovery',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'element', id: 'Fe', quantity: 4 },
      { type: 'compound', id: 'O2', quantity: 3 },
    ],
    output: { type: 'compound', id: 'Fe2O3', quantity: 2 },
    skillsTaught: ['oxidation-intro', 'chemical-change-vs-physical'],
    scienceExplanation: 'Rust is iron(III) oxide — iron atoms combine with oxygen from the air. 4Fe + 3O₂ → 2Fe₂O₃. This is a chemical change because you cannot simply "unrust" iron.',
    accessibility: {
      spokenName: 'rust an iron nail',
      spokenFormula: 'four iron plus three oxygen gas makes two iron oxide',
      description: 'Select four units of iron and three units of oxygen gas from your inventory. Tap craft to expose the iron to oxygen and form rust.',
      iconShape: 'circle',
    },
  },
  {
    id: 'slaked-lime',
    name: 'Make Slaked Lime',
    description: 'Add water to quicklime to create slaked lime — watch it get hot!',
    tier: 'discovery',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'CaO', quantity: 1 },
      { type: 'compound', id: 'H2O', quantity: 1 },
    ],
    output: { type: 'compound', id: 'Ca(OH)2', quantity: 1 },
    skillsTaught: ['exothermic-reactions', 'lime-chemistry'],
    scienceExplanation: 'CaO + H₂O → Ca(OH)₂ releases heat — so much that it can boil water! This exothermic reaction has been used to make mortar and plaster since Roman times.',
    accessibility: {
      spokenName: 'make slaked lime',
      spokenFormula: 'one quicklime plus one water makes one slaked lime',
      description: 'Select quicklime and water from your inventory. Tap craft to combine them into slaked lime in an exothermic reaction.',
      iconShape: 'circle',
    },
  },

  // =========================================================================
  // Builder (ages 11-14) — stoichiometry, structural engineering
  // =========================================================================
  {
    id: 'water-from-elements',
    name: 'Synthesize Water',
    description: 'Combine hydrogen and oxygen in the correct ratio to produce water.',
    tier: 'builder',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'H2', quantity: 2 },
      { type: 'compound', id: 'O2', quantity: 1 },
    ],
    output: { type: 'compound', id: 'H2O', quantity: 2 },
    skillsTaught: ['stoichiometry-balanced-equations', 'mole-ratios', 'exothermic-reactions'],
    scienceExplanation: '2H₂ + O₂ → 2H₂O. Two molecules of hydrogen react with one molecule of oxygen to form two molecules of water. The 2:1 ratio is critical — excess hydrogen would remain unreacted.',
    accessibility: {
      spokenName: 'synthesize water',
      spokenFormula: 'two hydrogen gas plus one oxygen gas makes two water',
      description: 'Select two units of hydrogen gas and one unit of oxygen gas from your inventory. Tap craft to combine them into water through combustion.',
      iconShape: 'circle',
    },
  },
  {
    id: 'ammonia-synthesis',
    name: 'Haber Process — Make Ammonia',
    description: 'Synthesize ammonia from nitrogen and hydrogen under pressure.',
    tier: 'builder',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'N2', quantity: 1 },
      { type: 'compound', id: 'H2', quantity: 3 },
    ],
    output: { type: 'compound', id: 'NH3', quantity: 2 },
    skillsTaught: ['industrial-chemistry', 'catalysis-intro', 'mole-ratios'],
    scienceExplanation: 'N₂ + 3H₂ → 2NH₃. The Haber process revolutionized agriculture by making fertilizer. It requires an iron catalyst, high pressure (200 atm), and high temperature (450°C).',
    accessibility: {
      spokenName: 'haber process, make ammonia',
      spokenFormula: 'one nitrogen gas plus three hydrogen gas makes two ammonia',
      description: 'Select one unit of nitrogen gas and three units of hydrogen gas from your inventory. Tap craft to synthesize ammonia under pressure.',
      iconShape: 'circle',
    },
  },
  {
    id: 'neutralization',
    name: 'Acid–Base Neutralization',
    description: 'Mix hydrochloric acid with sodium hydroxide to form salt and water.',
    tier: 'builder',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'HCl', quantity: 1 },
      { type: 'compound', id: 'NaOH', quantity: 1 },
    ],
    output: { type: 'compound', id: 'NaCl', quantity: 1 },
    skillsTaught: ['acid-base-chemistry', 'neutralization', 'salt-formation'],
    scienceExplanation: 'HCl + NaOH → NaCl + H₂O. An acid (HCl) and a base (NaOH) combine to form a salt (NaCl) and water. The H⁺ from the acid meets the OH⁻ from the base to make water.',
    accessibility: {
      spokenName: 'acid base neutralization',
      spokenFormula: 'one hydrochloric acid plus one sodium hydroxide makes one sodium chloride',
      description: 'Select hydrochloric acid and sodium hydroxide from your inventory. Tap craft to neutralize them into salt and water.',
      iconShape: 'circle',
    },
  },
  {
    id: 'smelt-iron',
    name: 'Smelt Iron Ore',
    description: 'Reduce iron oxide with carbon to extract pure iron.',
    tier: 'builder',
    biome: 'workshop',
    inputs: [
      { type: 'compound', id: 'Fe2O3', quantity: 1 },
      { type: 'element', id: 'C', quantity: 3 },
    ],
    output: { type: 'element', id: 'Fe', quantity: 2 },
    skillsTaught: ['reduction-reactions', 'metallurgy', 'oxidation-states'],
    scienceExplanation: 'Fe₂O₃ + 3C → 2Fe + 3CO. Carbon removes oxygen from iron oxide — this is called reduction. Real blast furnaces use coke (pure carbon) at over 1500°C.',
    accessibility: {
      spokenName: 'smelt iron ore',
      spokenFormula: 'one iron oxide plus three carbon makes two iron',
      description: 'Select one unit of iron oxide and three units of carbon from your inventory. Tap craft to reduce the ore and extract pure iron.',
      iconShape: 'hexagon',
    },
  },
  {
    id: 'truss-bridge',
    name: 'Build a Truss Bridge',
    description: 'Design and build a triangulated truss bridge from steel beams.',
    tier: 'builder',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'mild-steel', quantity: 12 },
    ],
    output: { type: 'structure', id: 'truss-bridge', quantity: 1 },
    skillsTaught: ['triangulation', 'tension-compression-members', 'load-calculation'],
    scienceExplanation: 'Trusses use triangles because triangles cannot deform without changing the length of a side. Each member carries either pure tension or pure compression, making trusses very efficient.',
    accessibility: {
      spokenName: 'build a truss bridge',
      spokenFormula: 'twelve mild steel makes a truss bridge',
      description: 'Select twelve units of mild steel from your inventory. Tap craft to design and build a triangulated truss bridge.',
      iconShape: 'square',
    },
  },
  {
    id: 'methane-burn',
    name: 'Burn Methane Fuel',
    description: 'Combust methane with oxygen to release energy.',
    tier: 'builder',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'CH4', quantity: 1 },
      { type: 'compound', id: 'O2', quantity: 2 },
    ],
    output: { type: 'compound', id: 'CO2', quantity: 1 },
    skillsTaught: ['combustion-reactions', 'energy-release', 'stoichiometry-balanced-equations'],
    scienceExplanation: 'CH₄ + 2O₂ → CO₂ + 2H₂O. Methane combustion is highly exothermic — it powers stoves and heaters. Notice you need exactly 2 molecules of O₂ for every 1 of CH₄.',
    accessibility: {
      spokenName: 'burn methane fuel',
      spokenFormula: 'one methane plus two oxygen gas makes one carbon dioxide',
      description: 'Select one unit of methane and two units of oxygen gas from your inventory. Tap craft to combust the methane and release energy.',
      iconShape: 'circle',
    },
  },
  {
    id: 'lime-from-limestone',
    name: 'Burn Limestone',
    description: 'Heat calcium carbonate to produce quicklime and carbon dioxide.',
    tier: 'builder',
    biome: 'workshop',
    inputs: [
      { type: 'compound', id: 'CaCO3', quantity: 1 },
    ],
    output: { type: 'compound', id: 'CaO', quantity: 1 },
    skillsTaught: ['thermal-decomposition', 'endothermic-reactions'],
    scienceExplanation: 'CaCO₃ → CaO + CO₂. This endothermic reaction requires heating to about 900°C. Quicklime is essential for making cement and mortar.',
    accessibility: {
      spokenName: 'burn limestone',
      spokenFormula: 'one calcium carbonate makes one quicklime',
      description: 'Select one unit of calcium carbonate from your inventory. Tap craft to heat it and produce quicklime and carbon dioxide.',
      iconShape: 'circle',
    },
  },
  {
    id: 'fermentation-recipe',
    name: 'Ferment Glucose',
    description: 'Convert glucose into ethanol and CO₂ using yeast.',
    tier: 'builder',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'C6H12O6', quantity: 1 },
    ],
    output: { type: 'compound', id: 'C2H5OH', quantity: 2 },
    skillsTaught: ['fermentation', 'biochemistry-intro', 'enzyme-catalysis'],
    scienceExplanation: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂. Yeast enzymes break glucose into ethanol and carbon dioxide. This is how bread rises and how ancient civilizations made beverages.',
    accessibility: {
      spokenName: 'ferment glucose',
      spokenFormula: 'one glucose makes two ethanol',
      description: 'Select one unit of glucose from your inventory. Tap craft to ferment it with yeast into ethanol and carbon dioxide.',
      iconShape: 'circle',
    },
  },
  {
    id: 'concrete-column',
    name: 'Pour a Concrete Column',
    description: 'Build a reinforced concrete column for structural support.',
    tier: 'builder',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'reinforced-concrete', quantity: 4 },
    ],
    output: { type: 'structure', id: 'concrete-column', quantity: 1 },
    skillsTaught: ['concrete-reinforcement', 'compressive-vs-tensile'],
    scienceExplanation: 'Plain concrete is strong in compression but weak in tension. Adding steel rebar creates reinforced concrete that handles both forces. This combination supports modern skyscrapers.',
    accessibility: {
      spokenName: 'pour a concrete column',
      spokenFormula: 'four reinforced concrete makes a concrete column',
      description: 'Select four units of reinforced concrete from your inventory. Tap craft to pour and set a structural concrete column.',
      iconShape: 'square',
    },
  },

  // =========================================================================
  // Innovator (ages 15-18) — organic synthesis, advanced structural
  // =========================================================================
  {
    id: 'aspirin-craft',
    name: 'Synthesize Aspirin',
    description: 'React salicylic acid with acetic anhydride to synthesize aspirin.',
    tier: 'innovator',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'C7H6O3', quantity: 1 },
      { type: 'compound', id: 'C4H6O3', quantity: 1 },
    ],
    output: { type: 'compound', id: 'C9H8O4', quantity: 1 },
    skillsTaught: ['organic-synthesis', 'esterification', 'catalysis'],
    scienceExplanation: 'C₇H₆O₃ + C₄H₆O₃ → C₉H₈O₄ + CH₃COOH. Aspirin synthesis is an esterification reaction catalyzed by phosphoric acid. The hydroxyl group on salicylic acid reacts with acetic anhydride.',
    accessibility: {
      spokenName: 'synthesize aspirin',
      spokenFormula: 'one salicylic acid plus one acetic anhydride makes one aspirin',
      description: 'Select salicylic acid and acetic anhydride from your inventory. Tap craft to perform esterification and synthesize aspirin.',
      iconShape: 'circle',
    },
  },
  {
    id: 'electrolysis-water',
    name: 'Electrolyze Water',
    description: 'Split water into hydrogen and oxygen using electrical current.',
    tier: 'innovator',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'H2O', quantity: 2 },
    ],
    output: { type: 'compound', id: 'H2', quantity: 2 },
    skillsTaught: ['electrolysis', 'electrochemistry', 'energy-conversion'],
    scienceExplanation: '2H₂O → 2H₂ + O₂. Electrolysis uses electrical energy to break water molecules apart. This is the reverse of hydrogen combustion — endothermic instead of exothermic.',
    accessibility: {
      spokenName: 'electrolyze water',
      spokenFormula: 'two water makes two hydrogen gas',
      description: 'Select two units of water from your inventory. Tap craft to split them into hydrogen and oxygen using electrical current.',
      iconShape: 'circle',
    },
  },
  {
    id: 'thermite',
    name: 'Thermite Reaction',
    description: 'React aluminium with iron oxide in an intensely exothermic reaction.',
    tier: 'innovator',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'element', id: 'Al', quantity: 2 },
      { type: 'compound', id: 'Fe2O3', quantity: 1 },
    ],
    output: { type: 'element', id: 'Fe', quantity: 2 },
    skillsTaught: ['redox-chemistry', 'activity-series', 'thermodynamics-intro'],
    scienceExplanation: '2Al + Fe₂O₃ → Al₂O₃ + 2Fe. Aluminium is more reactive than iron, so it steals the oxygen. This reaction reaches ~2500°C and is used for welding railway tracks!',
    accessibility: {
      spokenName: 'thermite reaction',
      spokenFormula: 'two aluminium plus one iron oxide makes two iron',
      description: 'Select two units of aluminium and one unit of iron oxide from your inventory. Tap craft to trigger an intensely exothermic thermite reaction producing iron.',
      iconShape: 'hexagon',
    },
  },
  {
    id: 'steel-arch-bridge',
    name: 'Design a Steel Arch Bridge',
    description: 'Build an arch bridge from high-strength steel with load calculations.',
    tier: 'innovator',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'high-strength-steel', quantity: 20 },
    ],
    output: { type: 'structure', id: 'steel-arch-bridge', quantity: 1 },
    skillsTaught: ['arch-mechanics', 'safety-factor-calculation', 'load-path'],
    scienceExplanation: 'An arch bridge converts vertical loads into diagonal compressive forces that travel along the arch to the abutments. The parabolic shape ensures the arch is primarily in compression — using steel efficiently.',
    accessibility: {
      spokenName: 'design a steel arch bridge',
      spokenFormula: 'twenty high-strength steel makes a steel arch bridge',
      description: 'Select twenty units of high-strength steel from your inventory. Tap craft to design and build an arch bridge with load calculations.',
      iconShape: 'square',
    },
  },
  {
    id: 'sulfuric-acid-neutralize',
    name: 'Neutralize Sulfuric Acid',
    description: 'Carefully neutralize sulfuric acid with sodium hydroxide.',
    tier: 'innovator',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'H2SO4', quantity: 1 },
      { type: 'compound', id: 'NaOH', quantity: 2 },
    ],
    output: { type: 'compound', id: 'Na2SO4', quantity: 1 },
    skillsTaught: ['diprotic-acids', 'molar-stoichiometry', 'neutralization'],
    scienceExplanation: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O. Sulfuric acid is diprotic — it has TWO H⁺ ions to donate, so you need two moles of NaOH per mole of acid.',
    accessibility: {
      spokenName: 'neutralize sulfuric acid',
      spokenFormula: 'one sulfuric acid plus two sodium hydroxide makes one sodium sulfate',
      description: 'Select one unit of sulfuric acid and two units of sodium hydroxide from your inventory. Tap craft to carefully neutralize them into sodium sulfate and water.',
      iconShape: 'circle',
    },
  },
  {
    id: 'copper-displacement',
    name: 'Iron Displaces Copper',
    description: 'Place iron in copper sulfate solution and watch copper appear.',
    tier: 'innovator',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'element', id: 'Fe', quantity: 1 },
      { type: 'compound', id: 'CuSO4', quantity: 1 },
    ],
    output: { type: 'element', id: 'Cu', quantity: 1 },
    skillsTaught: ['single-displacement', 'redox-reactions', 'activity-series'],
    scienceExplanation: 'Fe + CuSO₄ → FeSO₄ + Cu. Iron is more reactive than copper, so it displaces copper from the solution. The blue solution turns green (FeSO₄) and copper metal deposits on the iron.',
    accessibility: {
      spokenName: 'iron displaces copper',
      spokenFormula: 'one iron plus one copper sulfate makes one copper',
      description: 'Select one unit of iron and one unit of copper sulfate from your inventory. Tap craft to displace copper from the solution using iron.',
      iconShape: 'hexagon',
    },
  },

  // =========================================================================
  // Creator (18+) — advanced synthesis, composite engineering
  // =========================================================================
  {
    id: 'glucose-respiration',
    name: 'Model Cellular Respiration',
    description: 'Simulate the complete oxidation of glucose.',
    tier: 'creator',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'C6H12O6', quantity: 1 },
      { type: 'compound', id: 'O2', quantity: 6 },
    ],
    output: { type: 'compound', id: 'CO2', quantity: 6 },
    skillsTaught: ['cellular-respiration', 'ATP-energy', 'biochemistry', 'thermodynamics'],
    scienceExplanation: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy. This is the reverse of photosynthesis. In cells, this reaction proceeds through glycolysis, the Krebs cycle, and the electron transport chain, producing ~36 ATP molecules.',
    accessibility: {
      spokenName: 'model cellular respiration',
      spokenFormula: 'one glucose plus six oxygen gas makes six carbon dioxide',
      description: 'Select one unit of glucose and six units of oxygen gas from your inventory. Tap craft to simulate the complete oxidation of glucose into carbon dioxide and water.',
      iconShape: 'circle',
    },
  },
  {
    id: 'composite-bridge',
    name: 'Carbon Fiber Composite Bridge',
    description: 'Design an advanced bridge using carbon fiber composite materials.',
    tier: 'creator',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'carbon-fiber-composite', quantity: 15 },
    ],
    output: { type: 'structure', id: 'composite-bridge', quantity: 1 },
    skillsTaught: ['composite-materials', 'anisotropy', 'fiber-matrix-interaction'],
    scienceExplanation: 'Carbon fiber composites have fibers (strong in tension) embedded in a polymer matrix (distributes loads). The result has an exceptional strength-to-weight ratio — about 5× stronger than steel per unit weight.',
    accessibility: {
      spokenName: 'carbon fiber composite bridge',
      spokenFormula: 'fifteen carbon fiber composite makes a composite bridge',
      description: 'Select fifteen units of carbon fiber composite from your inventory. Tap craft to design and build an advanced composite bridge.',
      iconShape: 'square',
    },
  },
  {
    id: 'washing-soda',
    name: 'Solvay Process — Sodium Carbonate',
    description: 'Produce sodium carbonate from salt and limestone via the Solvay process.',
    tier: 'creator',
    biome: 'alchemist-lab',
    inputs: [
      { type: 'compound', id: 'NaCl', quantity: 2 },
      { type: 'compound', id: 'CaCO3', quantity: 1 },
    ],
    output: { type: 'compound', id: 'Na2CO3', quantity: 1 },
    skillsTaught: ['industrial-processes', 'multi-step-synthesis', 'chemical-engineering'],
    scienceExplanation: 'The Solvay process uses ammonia and CO₂ as intermediates to convert NaCl + CaCO₃ → Na₂CO₃. It is one of the most important industrial chemical processes, producing millions of tons of soda ash per year.',
    accessibility: {
      spokenName: 'solvay process, sodium carbonate',
      spokenFormula: 'two sodium chloride plus one calcium carbonate makes one sodium carbonate',
      description: 'Select two units of sodium chloride and one unit of calcium carbonate from your inventory. Tap craft to produce sodium carbonate via the Solvay process.',
      iconShape: 'circle',
    },
  },
  {
    id: 'aluminium-smelting',
    name: 'Smelt Aluminium (Hall–Héroult)',
    description: 'Extract aluminium from aluminium oxide by electrolysis.',
    tier: 'creator',
    biome: 'workshop',
    inputs: [
      { type: 'compound', id: 'Al2O3', quantity: 2 },
    ],
    output: { type: 'element', id: 'Al', quantity: 4 },
    skillsTaught: ['electrolytic-smelting', 'industrial-electrolysis', 'energy-economics'],
    scienceExplanation: '2Al₂O₃ → 4Al + 3O₂ (via electrolysis in molten cryolite). The Hall–Héroult process requires enormous electrical energy — about 15 kWh per kg of aluminium. This is why aluminium smelters are near hydroelectric plants.',
    accessibility: {
      spokenName: 'smelt aluminium',
      spokenFormula: 'two aluminium oxide makes four aluminium',
      description: 'Select two units of aluminium oxide from your inventory. Tap craft to extract aluminium through electrolysis.',
      iconShape: 'hexagon',
    },
  },
  {
    id: 'uhpc-foundation',
    name: 'UHPC Super-Foundation',
    description: 'Cast an ultra-high-performance concrete foundation.',
    tier: 'creator',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'ultra-high-performance-concrete', quantity: 10 },
    ],
    output: { type: 'structure', id: 'uhpc-foundation', quantity: 1 },
    skillsTaught: ['advanced-concrete-technology', 'fiber-reinforcement', 'durability-engineering'],
    scienceExplanation: 'UHPC achieves compressive strengths above 150 MPa (5× normal concrete) through optimized particle packing, low water-to-cement ratio, and steel fiber reinforcement. It is nearly impermeable and self-healing.',
    accessibility: {
      spokenName: 'u h p c super-foundation',
      spokenFormula: 'ten ultra-high-performance concrete makes a u h p c foundation',
      description: 'Select ten units of ultra-high-performance concrete from your inventory. Tap craft to cast an ultra-strong foundation.',
      iconShape: 'square',
    },
  },
  {
    id: 'titanium-truss',
    name: 'Titanium Alloy Truss',
    description: 'Build an aerospace-grade titanium truss structure.',
    tier: 'creator',
    biome: 'workshop',
    inputs: [
      { type: 'material', id: 'titanium-alloy', quantity: 8 },
    ],
    output: { type: 'structure', id: 'titanium-truss', quantity: 1 },
    skillsTaught: ['aerospace-materials', 'fatigue-analysis', 'weight-optimization'],
    scienceExplanation: 'Ti-6Al-4V alloy has a strength-to-weight ratio superior to steel and excellent corrosion resistance. It is the workhorse alloy for aerospace structures, prosthetics, and high-performance engineering.',
    accessibility: {
      spokenName: 'titanium alloy truss',
      spokenFormula: 'eight titanium alloy makes a titanium truss',
      description: 'Select eight units of titanium alloy from your inventory. Tap craft to build an aerospace-grade titanium truss structure.',
      iconShape: 'square',
    },
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getRecipe(id: string): CraftRecipe | undefined {
  return RECIPES.find(r => r.id === id);
}

export function recipesForTierAndBiome(tier: CraftRecipe['tier'], biome: string): CraftRecipe[] {
  const order: Record<string, number> = {
    foundation: 0, discovery: 1, builder: 2, innovator: 3, creator: 4,
  };
  const max = order[tier] ?? 0;
  return RECIPES.filter(r =>
    (order[r.tier] ?? 0) <= max && (r.biome === biome || r.biome === 'any'),
  );
}
