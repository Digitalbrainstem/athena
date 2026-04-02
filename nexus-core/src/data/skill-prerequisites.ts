// Skill prerequisite tree for gap detection and cross-tier reinforcement.
// Maps each skill to its required prerequisite skills.
// The mastery system traverses this tree to identify knowledge gaps.
//
// Design principles:
// - Prerequisites represent genuine conceptual dependencies
// - Cross-subject links encode real-world knowledge dependencies
//   (e.g., physics requires math, chemistry requires arithmetic)
// - Foundation-tier skills have few/no prerequisites (entry points)
// - Higher tiers build on lower tiers naturally
// - The graph is a DAG (directed acyclic) — no circular dependencies

export interface SkillNode {
  id: string;
  name: string;
  tier: string;
  prerequisites: string[];
}

/** Complete skill prerequisite map (~500+ relationships). */
export const SKILL_PREREQUISITES: Record<string, string[]> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // MATHEMATICS — Full chain from counting through calculus
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Foundation: Early numeracy (ages 2-5) ---
  'math.counting': [],
  'math.number-sense': ['math.counting'],
  'math.one-to-one-correspondence': ['math.counting'],
  'math.cardinality': ['math.counting', 'math.one-to-one-correspondence'],
  'math.number-comparison': ['math.number-sense'],
  'math.number-ordering': ['math.number-comparison'],
  'math.skip-counting': ['math.counting', 'math.patterns'],
  'math.place-value': ['math.number-sense', 'math.counting'],

  // --- Foundation: Shapes & spatial ---
  'math.shapes': [],
  'math.shapes.2d': ['math.shapes'],
  'math.shapes.3d': ['math.shapes', 'math.shapes.2d'],
  'math.symmetry': ['math.shapes'],
  'math.patterns': ['math.counting'],
  'math.size-comparison': ['math.counting'],
  'math.sorting': ['math.counting', 'math.size-comparison'],
  'math.measurement.length': ['math.number-sense', 'math.size-comparison'],
  'math.measurement.weight': ['math.number-sense', 'math.size-comparison'],
  'math.measurement.volume': ['math.number-sense', 'math.size-comparison'],
  'math.measurement.time': ['math.number-sense', 'math.number-ordering'],
  'math.measurement.temperature': ['math.number-sense', 'math.number-comparison'],

  // --- Discovery: Arithmetic operations (ages 6-10) ---
  'math.addition': ['math.counting', 'math.number-sense'],
  'math.subtraction': ['math.addition'],
  'math.multiplication': ['math.addition', 'math.skip-counting'],
  'math.division': ['math.subtraction', 'math.multiplication'],
  'math.arithmetic': ['math.addition', 'math.subtraction'],
  'math.arithmetic.multi-digit': ['math.arithmetic', 'math.place-value'],
  'math.arithmetic.word-problems': ['math.arithmetic', 'language.reading'],
  'math.order-of-operations': ['math.addition', 'math.subtraction', 'math.multiplication', 'math.division'],

  // --- Discovery: Fractions & decimals ---
  'math.fractions': ['math.division'],
  'math.fractions.equivalence': ['math.fractions', 'math.multiplication'],
  'math.fractions.operations': ['math.fractions', 'math.arithmetic'],
  'math.decimals': ['math.fractions', 'math.place-value'],
  'math.percentages': ['math.fractions', 'math.decimals'],

  // --- Discovery: Ratios & proportions ---
  'math.ratios': ['math.fractions', 'math.division'],
  'math.proportions': ['math.ratios'],
  'math.rates': ['math.ratios', 'math.measurement.time'],
  'math.unit-conversion': ['math.ratios', 'math.decimals'],

  // --- Builder: Geometry (ages 11-14) ---
  'math.geometry': ['math.shapes', 'math.arithmetic'],
  'math.geometry.angles': ['math.geometry', 'math.measurement.length'],
  'math.geometry.triangles': ['math.geometry.angles'],
  'math.geometry.polygons': ['math.geometry.angles', 'math.geometry.triangles'],
  'math.geometry.circles': ['math.geometry', 'math.ratios'],
  'math.geometry.area': ['math.geometry', 'math.multiplication'],
  'math.geometry.perimeter': ['math.geometry', 'math.addition'],
  'math.geometry.volume': ['math.geometry.area', 'math.shapes.3d'],
  'math.geometry.surface-area': ['math.geometry.area', 'math.shapes.3d'],
  'math.geometry.coordinate-plane': ['math.geometry', 'math.arithmetic'],
  'math.geometry.transformations': ['math.geometry.coordinate-plane'],
  'math.geometry.congruence': ['math.geometry.triangles'],
  'math.geometry.similarity': ['math.geometry.congruence', 'math.ratios'],
  'math.geometry.pythagorean': ['math.geometry.triangles', 'math.arithmetic.multi-digit'],

  // --- Builder: Algebra foundations ---
  'math.variables': ['math.arithmetic'],
  'math.expressions': ['math.variables', 'math.order-of-operations'],
  'math.equations': ['math.expressions'],
  'math.equations.one-step': ['math.equations'],
  'math.equations.two-step': ['math.equations.one-step'],
  'math.equations.multi-step': ['math.equations.two-step'],
  'math.inequalities': ['math.equations'],
  'math.algebra': ['math.equations', 'math.expressions'],
  'math.algebra.linear': ['math.algebra', 'math.geometry.coordinate-plane'],
  'math.algebra.systems': ['math.algebra.linear'],
  'math.algebra.quadratic': ['math.algebra.linear'],
  'math.algebra.polynomials': ['math.algebra', 'math.order-of-operations'],
  'math.algebra.factoring': ['math.algebra.polynomials', 'math.multiplication'],
  'math.algebra.rational-expressions': ['math.algebra.factoring', 'math.fractions.operations'],
  'math.algebra.exponents': ['math.multiplication'],
  'math.algebra.logarithms': ['math.algebra.exponents'],
  'math.algebra.sequences': ['math.patterns', 'math.algebra'],
  'math.algebra.series': ['math.algebra.sequences'],
  'math.algebra.functions': ['math.algebra', 'math.geometry.coordinate-plane'],

  // --- Builder: Data & statistics ---
  'math.data.collection': ['math.counting', 'math.sorting'],
  'math.data.graphs': ['math.data.collection', 'math.geometry.coordinate-plane'],
  'math.data.mean': ['math.arithmetic', 'math.division'],
  'math.data.median': ['math.number-ordering', 'math.data.collection'],
  'math.data.mode': ['math.data.collection'],
  'math.statistics.descriptive': ['math.data.mean', 'math.data.median', 'math.data.mode'],
  'math.probability.basic': ['math.fractions', 'math.ratios'],
  'math.probability.compound': ['math.probability.basic', 'math.multiplication'],
  'math.probability.distributions': ['math.probability.compound', 'math.statistics.descriptive'],
  'math.statistics.inference': ['math.statistics.descriptive', 'math.probability.distributions'],

  // --- Innovator: Trigonometry (ages 15-18) ---
  'math.trig.basics': ['math.geometry.triangles', 'math.ratios'],
  'math.trig.unit-circle': ['math.trig.basics', 'math.geometry.circles'],
  'math.trig.identities': ['math.trig.unit-circle', 'math.algebra'],
  'math.trig.equations': ['math.trig.identities', 'math.equations.multi-step'],
  'math.trig.law-of-sines': ['math.trig.basics', 'math.geometry.triangles'],
  'math.trig.law-of-cosines': ['math.trig.law-of-sines'],
  'math.trig.inverse': ['math.trig.basics', 'math.algebra.functions'],
  'math.trigonometry': ['math.trig.basics', 'math.algebra'],

  // --- Innovator: Pre-calculus ---
  'math.precalc.functions': ['math.algebra.functions', 'math.trig.basics'],
  'math.precalc.limits': ['math.precalc.functions'],
  'math.precalc.continuity': ['math.precalc.limits'],
  'math.precalc.polar': ['math.trig.unit-circle', 'math.geometry.coordinate-plane'],
  'math.precalc.vectors': ['math.trig.basics', 'math.geometry.coordinate-plane'],
  'math.precalc.matrices': ['math.algebra.systems', 'math.algebra.linear'],
  'math.precalc.conic-sections': ['math.algebra.quadratic', 'math.geometry.circles'],

  // --- Creator: Calculus (18+) ---
  'math.calculus.derivatives': ['math.precalc.limits'],
  'math.calculus.derivative-rules': ['math.calculus.derivatives', 'math.algebra.polynomials'],
  'math.calculus.chain-rule': ['math.calculus.derivative-rules', 'math.precalc.functions'],
  'math.calculus.applications': ['math.calculus.derivative-rules'],
  'math.calculus.integrals': ['math.calculus.derivatives'],
  'math.calculus.fundamental-theorem': ['math.calculus.integrals'],
  'math.calculus.integration-techniques': ['math.calculus.integrals', 'math.trig.identities'],
  'math.calculus.sequences-series': ['math.algebra.series', 'math.precalc.limits'],
  'math.calculus.multivariable': ['math.calculus.derivatives', 'math.precalc.vectors'],
  'math.calculus.differential-equations': ['math.calculus.integrals', 'math.calculus.derivatives'],
  'math.calculus': ['math.calculus.derivatives', 'math.calculus.integrals'],

  // --- Creator: Linear algebra & discrete math ---
  'math.linear-algebra': ['math.precalc.matrices', 'math.precalc.vectors'],
  'math.linear-algebra.eigenvalues': ['math.linear-algebra', 'math.algebra.polynomials'],
  'math.discrete.logic': ['math.algebra'],
  'math.discrete.sets': ['math.discrete.logic'],
  'math.discrete.combinatorics': ['math.probability.compound', 'math.algebra.factoring'],
  'math.discrete.graph-theory': ['math.discrete.sets'],
  'math.discrete.number-theory': ['math.algebra', 'math.division'],

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE — Observation through advanced disciplines
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Foundation: Early science (ages 2-5) ---
  'science.observation': [],
  'science.senses': ['science.observation'],
  'science.colors': ['science.observation'],
  'science.matter': ['science.observation'],
  'science.matter.states': ['science.matter'],
  'science.weather': ['science.observation'],
  'science.seasons': ['science.weather', 'math.patterns'],
  'science.living-things': ['science.observation'],
  'science.plants.basics': ['science.living-things'],
  'science.animals.basics': ['science.living-things'],
  'science.habitats': ['science.animals.basics', 'science.plants.basics'],

  // --- Discovery: Earth science ---
  'science.earth.rocks': ['science.matter', 'science.observation'],
  'science.earth.soil': ['science.earth.rocks'],
  'science.earth.water-cycle': ['science.matter.states', 'science.weather'],
  'science.earth.erosion': ['science.earth.rocks', 'science.earth.water-cycle'],
  'science.earth.layers': ['science.earth.rocks'],
  'science.earth.plate-tectonics': ['science.earth.layers'],
  'science.earth.volcanism': ['science.earth.plate-tectonics', 'science.matter.states'],
  'science.earth.atmosphere': ['science.weather', 'science.matter.states'],

  // --- Discovery: Life science ---
  'science.biology.basics': ['science.observation', 'science.living-things'],
  'science.biology.cells': ['science.biology.basics'],
  'science.biology.plant-anatomy': ['science.plants.basics', 'science.biology.basics'],
  'science.biology.animal-anatomy': ['science.animals.basics', 'science.biology.basics'],
  'science.biology.life-cycles': ['science.biology.basics'],
  'science.biology.ecosystems': ['science.habitats', 'science.biology.basics'],
  'science.biology.food-chains': ['science.biology.ecosystems'],
  'science.biology.ecology': ['science.biology.ecosystems', 'science.biology.food-chains'],
  'science.biology.classification': ['science.biology.basics', 'math.sorting'],
  'science.biology.heredity': ['science.biology.basics'],
  'science.biology.evolution': ['science.biology.heredity', 'science.biology.classification'],

  // --- Builder: Chemistry (ages 11-14) ---
  'science.chemistry.atoms': ['science.matter', 'math.arithmetic'],
  'science.chemistry.elements': ['science.chemistry.atoms'],
  'science.chemistry.periodic-table': ['science.chemistry.elements', 'math.patterns'],
  'science.chemistry.molecules': ['science.chemistry.atoms'],
  'science.chemistry.bonds': ['science.chemistry.atoms', 'science.chemistry.elements'],
  'science.chemistry.compounds': ['science.chemistry.bonds', 'science.chemistry.molecules'],
  'science.chemistry.reactions': ['science.chemistry.compounds'],
  'science.chemistry.equations': ['science.chemistry.reactions', 'math.equations'],
  'science.chemistry.stoichiometry': ['science.chemistry.equations', 'math.ratios'],
  'science.chemistry.acids-bases': ['science.chemistry.compounds', 'science.chemistry.reactions'],
  'science.chemistry.solutions': ['science.chemistry.compounds', 'math.ratios'],
  'science.chemistry.gas-laws': ['science.chemistry.molecules', 'math.algebra', 'science.physics.pressure'],
  'science.chemistry': ['science.chemistry.reactions', 'math.arithmetic'],

  // --- Builder: Physics foundations ---
  'science.physics.motion': ['math.arithmetic', 'science.matter'],
  'science.physics.speed': ['science.physics.motion', 'math.rates'],
  'science.physics.acceleration': ['science.physics.speed', 'math.algebra'],
  'science.physics.forces': ['science.physics.motion', 'math.algebra'],
  'science.physics.newtons-laws': ['science.physics.forces'],
  'science.physics.gravity': ['science.physics.forces'],
  'science.physics.friction': ['science.physics.forces'],
  'science.physics.pressure': ['science.physics.forces', 'math.geometry.area'],
  'science.physics.energy': ['science.physics.forces', 'math.arithmetic'],
  'science.physics.kinetic-energy': ['science.physics.energy', 'science.physics.speed'],
  'science.physics.potential-energy': ['science.physics.energy', 'science.physics.gravity'],
  'science.physics.conservation-energy': ['science.physics.kinetic-energy', 'science.physics.potential-energy'],
  'science.physics.work': ['science.physics.forces', 'math.multiplication'],
  'science.physics.power': ['science.physics.work', 'math.rates'],
  'science.physics.momentum': ['science.physics.forces', 'science.physics.speed'],
  'science.physics.simple-machines': ['science.physics.forces', 'science.physics.work'],
  'science.physics': ['science.physics.forces', 'math.algebra'],

  // --- Builder: Waves, sound, light ---
  'science.physics.waves': ['science.physics.energy', 'math.trig.basics'],
  'science.physics.sound': ['science.physics.waves'],
  'science.physics.light': ['science.physics.waves'],
  'science.physics.optics': ['science.physics.light', 'math.geometry.angles'],
  'science.physics.electromagnetic-spectrum': ['science.physics.light', 'science.physics.waves'],

  // --- Innovator: Advanced physics (ages 15-18) ---
  'science.physics.electricity': ['science.physics.forces', 'science.chemistry.atoms'],
  'science.physics.circuits': ['science.physics.electricity', 'math.algebra'],
  'science.physics.magnetism': ['science.physics.electricity'],
  'science.physics.electromagnetism': ['science.physics.electricity', 'science.physics.magnetism'],
  'science.physics.thermodynamics': ['science.physics.energy', 'science.physics.motion', 'math.calculus.derivatives'],
  'science.physics.fluid-dynamics': ['science.physics.pressure', 'math.calculus.derivatives'],
  'science.physics.rotational-mechanics': ['science.physics.newtons-laws', 'math.trig.basics'],
  'science.physics.relativity': ['science.physics.newtons-laws', 'math.calculus'],
  'science.physics.quantum-basics': ['science.physics.waves', 'science.physics.light', 'math.probability.basic'],

  // --- Innovator: Advanced chemistry ---
  'science.chemistry.organic': ['science.chemistry.bonds', 'science.chemistry.compounds'],
  'science.chemistry.thermochemistry': ['science.chemistry.reactions', 'science.physics.energy'],
  'science.chemistry.electrochemistry': ['science.chemistry.reactions', 'science.physics.electricity'],
  'science.chemistry.kinetics': ['science.chemistry.reactions', 'math.algebra'],
  'science.chemistry.equilibrium': ['science.chemistry.kinetics', 'math.algebra'],
  'science.chemistry.nuclear': ['science.chemistry.atoms', 'science.physics.energy'],

  // --- Innovator: Advanced biology ---
  'science.biology.anatomy': ['science.biology.basics', 'science.biology.cells'],
  'science.biology.physiology': ['science.biology.anatomy', 'science.chemistry.reactions'],
  'science.biology.genetics': ['science.biology.heredity', 'science.biology.cells', 'math.probability.basic'],
  'science.biology.dna': ['science.biology.genetics', 'science.chemistry.organic'],
  'science.biology.microbiology': ['science.biology.cells', 'science.chemistry.compounds'],
  'science.biology.biochemistry': ['science.biology.cells', 'science.chemistry.organic'],
  'science.biology.neuroscience': ['science.biology.anatomy', 'science.physics.electricity'],

  // --- Discovery/Builder: Geology ---
  'science.geology': ['science.observation', 'science.matter'],
  'science.geology.minerals': ['science.geology', 'science.chemistry.elements'],
  'science.geology.fossils': ['science.geology', 'science.biology.evolution'],

  // --- Innovator: Astronomy ---
  'science.astronomy.basics': ['science.observation', 'math.geometry'],
  'science.astronomy.solar-system': ['science.astronomy.basics'],
  'science.astronomy.stars': ['science.astronomy.basics', 'science.physics.light'],
  'science.astronomy.gravity': ['science.astronomy.basics', 'science.physics.gravity'],
  'science.astronomy.cosmology': ['science.astronomy.stars', 'science.physics.relativity'],
  'science.astronomy.orbital-mechanics': ['science.astronomy.gravity', 'math.calculus', 'math.trig.basics'],

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGE ARTS — Listening through composition and rhetoric
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Foundation ---
  'language.listening': [],
  'language.phonics': ['language.listening'],
  'language.vocabulary': ['language.listening'],
  'language.letters': ['language.listening'],
  'language.sight-words': ['language.letters'],
  'language.syllables': ['language.phonics'],
  'language.rhyming': ['language.phonics'],

  // --- Discovery ---
  'language.reading': ['language.vocabulary', 'language.phonics', 'language.letters'],
  'language.reading.fluency': ['language.reading'],
  'language.reading.comprehension': ['language.reading.fluency'],
  'language.reading.inference': ['language.reading.comprehension'],
  'language.writing': ['language.reading'],
  'language.writing.sentences': ['language.writing'],
  'language.writing.paragraphs': ['language.writing.sentences'],
  'language.grammar': ['language.reading'],
  'language.grammar.parts-of-speech': ['language.grammar'],
  'language.grammar.sentence-structure': ['language.grammar.parts-of-speech'],
  'language.spelling': ['language.phonics', 'language.reading'],
  'language.punctuation': ['language.writing.sentences'],
  'language.handwriting': ['language.letters'],

  // --- Builder ---
  'language.composition': ['language.writing.paragraphs', 'language.grammar.sentence-structure'],
  'language.composition.narrative': ['language.composition'],
  'language.composition.expository': ['language.composition'],
  'language.composition.persuasive': ['language.composition', 'language.reading.inference'],
  'language.literary-analysis': ['language.reading.comprehension', 'language.vocabulary'],
  'language.figurative-language': ['language.reading.comprehension'],
  'language.poetry': ['language.figurative-language', 'language.rhyming'],
  'language.research-skills': ['language.reading.comprehension', 'language.writing.paragraphs'],
  'language.public-speaking': ['language.composition', 'language.vocabulary'],

  // --- Innovator ---
  'language.rhetoric': ['language.composition.persuasive', 'language.literary-analysis'],
  'language.critical-analysis': ['language.literary-analysis', 'language.reading.inference'],
  'language.academic-writing': ['language.composition.expository', 'language.research-skills'],
  'language.creative-writing': ['language.composition.narrative', 'language.figurative-language'],

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTER SCIENCE — Logic through advanced CS
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Discovery: Computational thinking ---
  'cs.computational-thinking': ['math.patterns', 'language.reading'],
  'cs.sequencing': ['cs.computational-thinking'],
  'cs.loops': ['cs.sequencing', 'math.patterns'],
  'cs.conditionals': ['cs.sequencing', 'math.number-comparison'],
  'cs.decomposition': ['cs.computational-thinking'],
  'cs.pattern-recognition': ['cs.computational-thinking', 'math.patterns'],

  // --- Builder: Programming fundamentals ---
  'cs.variables': ['cs.sequencing', 'math.variables'],
  'cs.data-types': ['cs.variables'],
  'cs.operators': ['cs.variables', 'math.order-of-operations'],
  'cs.functions': ['cs.variables', 'cs.decomposition'],
  'cs.arrays': ['cs.variables', 'cs.loops'],
  'cs.strings': ['cs.variables', 'language.reading'],
  'cs.debugging': ['cs.sequencing', 'cs.conditionals'],
  'cs.algorithms.basics': ['cs.loops', 'cs.conditionals', 'cs.functions'],
  'cs.algorithms.search': ['cs.algorithms.basics', 'cs.arrays'],
  'cs.algorithms.sort': ['cs.algorithms.basics', 'cs.arrays', 'math.number-comparison'],

  // --- Innovator: Intermediate CS ---
  'cs.oop.basics': ['cs.functions', 'cs.data-types'],
  'cs.oop.inheritance': ['cs.oop.basics'],
  'cs.oop.polymorphism': ['cs.oop.inheritance'],
  'cs.data-structures.linked-lists': ['cs.arrays', 'cs.oop.basics'],
  'cs.data-structures.trees': ['cs.data-structures.linked-lists'],
  'cs.data-structures.graphs': ['cs.data-structures.trees', 'math.discrete.graph-theory'],
  'cs.data-structures.hash-tables': ['cs.arrays', 'cs.functions'],
  'cs.algorithms.complexity': ['cs.algorithms.basics', 'math.algebra.logarithms'],
  'cs.algorithms.recursion': ['cs.functions', 'math.algebra.sequences'],
  'cs.algorithms.dynamic-programming': ['cs.algorithms.recursion', 'cs.arrays'],
  'cs.web.html': ['cs.strings', 'language.reading'],
  'cs.web.css': ['cs.web.html'],
  'cs.web.javascript': ['cs.web.html', 'cs.functions'],
  'cs.databases.basics': ['cs.data-types', 'cs.arrays'],
  'cs.databases.sql': ['cs.databases.basics', 'math.discrete.sets'],

  // --- Creator: Advanced CS ---
  'cs.algorithms.graph-algorithms': ['cs.data-structures.graphs', 'cs.algorithms.complexity'],
  'cs.networking.basics': ['cs.data-types'],
  'cs.security.basics': ['cs.networking.basics', 'math.discrete.number-theory'],
  'cs.ai.basics': ['cs.algorithms.basics', 'math.statistics.descriptive', 'math.linear-algebra'],
  'cs.machine-learning': ['cs.ai.basics', 'math.calculus', 'math.statistics.inference'],

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINEERING — Builds on math + physics + CS
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Foundation ---
  'engineering.basics': ['math.shapes'],
  'engineering.building-blocks': ['engineering.basics', 'math.shapes.3d'],
  'engineering.simple-machines.intro': ['science.physics.forces'],

  // --- Discovery ---
  'engineering.design-process': ['engineering.basics', 'cs.decomposition'],
  'engineering.measurement': ['math.measurement.length', 'math.measurement.weight'],
  'engineering.materials': ['science.matter', 'engineering.basics'],

  // --- Builder ---
  'engineering.structures': ['math.geometry', 'science.physics.forces'],
  'engineering.structures.bridges': ['engineering.structures', 'math.geometry.triangles'],
  'engineering.structures.buildings': ['engineering.structures', 'math.geometry.area'],
  'engineering.circuits': ['math.algebra', 'science.physics.circuits'],
  'engineering.circuits.digital': ['engineering.circuits', 'math.discrete.logic'],
  'engineering.mechanisms': ['science.physics.simple-machines', 'math.ratios'],
  'engineering.robotics.basics': ['engineering.circuits', 'cs.functions'],

  // --- Innovator ---
  'engineering.thermodynamics': ['science.physics.thermodynamics', 'math.calculus'],
  'engineering.statics': ['science.physics.forces', 'math.trig.basics'],
  'engineering.dynamics': ['engineering.statics', 'math.calculus.derivatives'],
  'engineering.fluid-mechanics': ['science.physics.fluid-dynamics', 'math.calculus'],
  'engineering.control-systems': ['math.calculus.differential-equations', 'engineering.circuits'],
  'engineering.robotics.advanced': ['engineering.robotics.basics', 'cs.algorithms.basics', 'engineering.control-systems'],

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORY & SOCIAL STUDIES
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Foundation ---
  'social.self-identity': [],
  'social.family': ['social.self-identity'],
  'social.community': ['social.family'],
  'social.rules': ['social.community'],
  'social.calendar': ['math.measurement.time', 'math.patterns'],
  'social.maps.basics': ['spatial.directions'],

  // --- Discovery ---
  'history.timelines': ['math.number-ordering', 'social.calendar'],
  'history.cause-and-effect': ['language.reading.comprehension'],
  'history.primary-sources': ['language.reading.comprehension', 'history.cause-and-effect'],
  'history.ancient-civilizations': ['history.timelines', 'history.cause-and-effect'],
  'history.world-geography': ['social.maps.basics', 'math.geometry.coordinate-plane'],
  'social.government.basics': ['social.rules', 'social.community'],
  'social.economics.basics': ['math.arithmetic', 'social.community'],

  // --- Builder ---
  'history.medieval': ['history.ancient-civilizations'],
  'history.renaissance': ['history.medieval'],
  'history.industrial-revolution': ['history.renaissance', 'science.physics.energy'],
  'history.modern': ['history.industrial-revolution'],
  'social.government.democracy': ['social.government.basics', 'language.composition.persuasive'],
  'social.economics.supply-demand': ['social.economics.basics', 'math.data.graphs'],
  'social.economics.trade': ['social.economics.supply-demand', 'math.ratios'],
  'social.civics': ['social.government.basics', 'history.cause-and-effect'],

  // --- Innovator ---
  'history.historiography': ['history.primary-sources', 'language.critical-analysis'],
  'social.economics.macro': ['social.economics.supply-demand', 'math.algebra', 'math.data.graphs'],
  'social.economics.micro': ['social.economics.supply-demand', 'math.algebra'],
  'social.economics.game-theory': ['social.economics.micro', 'math.probability.basic', 'math.discrete.logic'],
  'social.political-science': ['social.government.democracy', 'social.economics.basics'],
  'social.philosophy.logic': ['math.discrete.logic', 'language.rhetoric'],
  'social.philosophy.ethics': ['social.philosophy.logic', 'language.critical-analysis'],

  // ═══════════════════════════════════════════════════════════════════════════
  // ECONOMICS — Depends on math + social studies
  // ═══════════════════════════════════════════════════════════════════════════

  'economics.money': ['math.arithmetic', 'social.community'],
  'economics.budgeting': ['economics.money', 'math.subtraction'],
  'economics.interest': ['economics.money', 'math.percentages'],
  'economics.compound-interest': ['economics.interest', 'math.algebra.exponents'],
  'economics.investing': ['economics.compound-interest', 'math.probability.basic'],
  'economics.statistics': ['social.economics.macro', 'math.statistics.descriptive'],

  // ═══════════════════════════════════════════════════════════════════════════
  // BIOLOGY (advanced) — Depends on chemistry
  // ═══════════════════════════════════════════════════════════════════════════

  'biology.molecular': ['science.biology.biochemistry', 'science.biology.dna'],
  'biology.immunology': ['science.biology.microbiology', 'science.biology.physiology'],
  'biology.ecology.populations': ['science.biology.ecology', 'math.statistics.descriptive'],
  'biology.ecology.conservation': ['biology.ecology.populations', 'social.economics.basics'],
  'biology.bioethics': ['science.biology.genetics', 'social.philosophy.ethics'],

  // ═══════════════════════════════════════════════════════════════════════════
  // SPATIAL / FOUNDATION MOTOR SKILLS
  // ═══════════════════════════════════════════════════════════════════════════

  'spatial.directions': [],
  'spatial.turns': ['spatial.directions'],
  'spatial.turns.quarter': ['spatial.turns'],
  'spatial.turns.half': ['spatial.turns'],
  'spatial.turns.full': ['spatial.turns'],
  'spatial.navigation': ['spatial.directions', 'math.counting'],
  'spatial.coordinates': ['spatial.navigation', 'math.number-sense'],
  'motor.fine': [],
  'motor.gross': [],
  'motor.hand-eye': ['motor.fine'],

  // ═══════════════════════════════════════════════════════════════════════════
  // ART & DESIGN
  // ═══════════════════════════════════════════════════════════════════════════

  'art.colors.basics': ['science.colors'],
  'art.colors.mixing': ['art.colors.basics'],
  'art.colors.theory': ['art.colors.mixing', 'math.geometry.circles'],
  'art.shapes': ['math.shapes'],
  'art.patterns': ['math.patterns', 'art.shapes'],
  'art.perspective': ['math.geometry', 'art.shapes'],
  'art.proportion': ['math.ratios', 'art.shapes'],
  'art.composition': ['art.perspective', 'art.proportion'],
  'art.digital.basics': ['art.shapes', 'cs.computational-thinking'],
  'art.design-principles': ['art.composition', 'math.symmetry'],

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSIC — Connects to math (ratios, fractions, patterns)
  // ═══════════════════════════════════════════════════════════════════════════

  'music.rhythm': ['math.patterns', 'math.counting'],
  'music.beat': ['music.rhythm'],
  'music.tempo': ['music.beat', 'math.rates'],
  'music.melody': ['music.rhythm'],
  'music.pitch': ['music.melody'],
  'music.scales': ['music.pitch', 'math.patterns'],
  'music.intervals': ['music.scales', 'math.ratios'],
  'music.chords': ['music.intervals'],
  'music.harmony': ['music.chords'],
  'music.time-signatures': ['music.beat', 'math.fractions'],
  'music.notation': ['music.pitch', 'music.time-signatures'],
  'music.composition': ['music.harmony', 'music.notation'],
  'music.acoustics': ['music.pitch', 'science.physics.sound'],
};

/**
 * Get the direct prerequisites for a skill.
 * Returns an empty array for skills with no prerequisites.
 */
export function getPrerequisites(skillId: string): string[] {
  return SKILL_PREREQUISITES[skillId] ?? [];
}

/**
 * Get ALL transitive prerequisites for a skill (breadth-first).
 * Returns them in bottom-up order (deepest dependencies first).
 */
export function getAllPrerequisites(skillId: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  const queue = [...getPrerequisites(skillId)];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    result.push(current);
    queue.push(...getPrerequisites(current));
  }

  return result;
}

/**
 * Check whether all prerequisites for a skill are met at the given threshold.
 */
export function arePrerequisitesMet(
  skillId: string,
  masteryLevels: Map<string, number>,
  threshold = 0.3,
): boolean {
  const prereqs = getPrerequisites(skillId);
  return prereqs.every((p) => (masteryLevels.get(p) ?? 0) >= threshold);
}

/** Return all skill IDs that have no prerequisites (entry points). */
export function getRootSkills(): string[] {
  return Object.entries(SKILL_PREREQUISITES)
    .filter(([_, prereqs]) => prereqs.length === 0)
    .map(([id]) => id);
}

/** Return all skill IDs that depend directly on the given skill. */
export function getDependents(skillId: string): string[] {
  return Object.entries(SKILL_PREREQUISITES)
    .filter(([_, prereqs]) => prereqs.includes(skillId))
    .map(([id]) => id);
}
