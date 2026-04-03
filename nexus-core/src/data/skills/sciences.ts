import { topic, chain, parallel, expand, skill } from './types.js';
import type { SkillNode } from './types.js';

// Subject identifiers
const SCI = 'science';
const PHYS = 'physics';
const CHEM = 'chemistry';
const BIO = 'biology';
const EARTH = 'earth-science';

// Biome aliases
const CAV = 'caverns';
const FOR = 'forest';
const WS = 'workshop';
const ALC = 'alchemist-lab';
const OBS = 'observatory';
const RUI = 'ancient-ruins';
const REEF = 'reef';

// ===========================================================================
// PHYSICS — FOUNDATION  (~65 skills)
// Ages 2-5: Observation, senses, colours, matter, push/pull, magnets, light,
//           sound, floating/sinking, simple machines intro
// ===========================================================================

const physicsFoundation: SkillNode[] = [

  // ---- General science entry-point skills (no prerequisites) ----
  skill('science.observation', 'Observation', SCI, 'foundation',
    [], 'Use your eyes, ears, and hands to notice details about the world', [WS, FOR, CAV]),
  skill('science.senses', 'Five Senses', SCI, 'foundation',
    [], 'Explore seeing, hearing, touching, smelling, and tasting', [WS, FOR]),
  skill('science.colors', 'Colours', SCI, 'foundation',
    ['science.observation'], 'Name and sort objects by colour', [WS]),
  skill('science.matter', 'Matter', SCI, 'foundation',
    ['science.observation'], 'Understand that everything around you is made of matter', [WS, ALC]),
  skill('science.living-things', 'Living Things', SCI, 'foundation',
    ['science.observation'], 'Tell living things apart from non-living things', [FOR]),
  skill('science.weather', 'Weather', SCI, 'foundation',
    ['science.observation'], 'Describe today weather: sunny, rainy, windy, cloudy', [OBS]),
  skill('science.plants.basics', 'Plants Basics', SCI, 'foundation',
    ['science.living-things'], 'Recognise roots, stems, leaves, and flowers', [FOR]),
  skill('science.animals.basics', 'Animals Basics', SCI, 'foundation',
    ['science.living-things'], 'Name common animals and where they live', [FOR]),
  skill('science.measurement', 'Measurement Basics', SCI, 'foundation',
    ['science.observation', 'math.counting'], 'Measure and compare using simple tools', [WS]),
  skill('science.patterns', 'Science Patterns', SCI, 'foundation',
    ['science.observation', 'math.patterns'], 'Spot repeating patterns in nature and experiments', [WS, FOR]),
  skill('science.sorting', 'Science Sorting', SCI, 'foundation',
    ['science.observation', 'math.sorting'], 'Group objects by shared properties', [WS, FOR]),
  skill('science.cause-effect', 'Cause and Effect', SCI, 'foundation',
    ['science.observation'], 'Notice that actions cause things to happen', [WS]),
  skill('science.tools', 'Science Tools', SCI, 'foundation',
    ['science.observation'], 'Use magnifying glasses, rulers, and scales safely', [WS]),
  skill('science.safety', 'Science Safety', SCI, 'foundation',
    ['science.observation'], 'Follow safety rules when exploring and experimenting', [WS, ALC]),
  skill('science.recording', 'Recording Observations', SCI, 'foundation',
    ['science.observation', 'language.reading'], 'Draw and write what you observe', [WS]),

  // ---- Senses exploration (8) ----
  ...topic('science.phys.senses', PHYS, 'foundation', [WS, FOR], [
    ['sight', 'Sight Exploration', ['science.senses'], 'Observe and describe what you see in detail'],
    ['hearing', 'Hearing Exploration', ['science.senses'], 'Listen carefully to identify different sounds'],
    ['touch', 'Touch Exploration', ['science.senses'], 'Describe textures, temperatures, and shapes by touch'],
    ['smell', 'Smell Exploration', ['science.senses'], 'Identify and classify different smells safely'],
    ['taste', 'Taste Exploration', ['science.senses'], 'Distinguish sweet, sour, salty, and bitter tastes'],
    ['compare', 'Compare Senses', ['sight', 'hearing', 'touch'], 'Use multiple senses together to investigate objects'],
    ['sort', 'Sensory Sorting', ['compare', 'science.sorting'], 'Sort objects by sensory properties'],
    ['describe', 'Sensory Descriptions', ['compare', 'science.recording'], 'Describe objects using all five senses'],
  ]),

  // ---- Colours and light intro (6) ----
  ...topic('science.phys.colors', PHYS, 'foundation', [WS], [
    ['primary', 'Primary Colours', ['science.colors'], 'Identify red, blue, and yellow as primary colours'],
    ['secondary', 'Secondary Colours', ['primary'], 'Mix primary colours to create green, orange, and purple'],
    ['mixing', 'Colour Mixing', ['secondary'], 'Predict results of mixing different colours together'],
    ['rainbow', 'Rainbow Colours', ['primary'], 'Name the colours of the rainbow in order'],
    ['warm-cool', 'Warm and Cool Colours', ['primary'], 'Sort colours into warm and cool groups'],
    ['light-dark', 'Light and Dark Shades', ['primary'], 'Create lighter and darker versions of a colour'],
  ]),

  // ---- Matter and states (8) ----
  ...topic('science.phys.matter', PHYS, 'foundation', [WS, ALC], [
    ['solid', 'Solids', ['science.matter'], 'Identify solids and describe their rigid shape'],
    ['liquid', 'Liquids', ['science.matter'], 'Identify liquids and describe how they flow and pour'],
    ['gas', 'Gases', ['science.matter'], 'Understand that air and steam are invisible gases'],
    ['properties', 'Matter Properties', ['solid', 'liquid', 'gas'], 'Compare properties of solids, liquids, and gases'],
    ['melting', 'Melting', ['solid', 'liquid'], 'Observe solids turning into liquids when heated'],
    ['freezing', 'Freezing', ['liquid', 'solid'], 'Observe liquids turning into solids when cooled'],
    ['boiling', 'Boiling', ['liquid', 'gas'], 'Watch liquids bubble and turn into steam'],
    ['condensing', 'Condensing', ['gas', 'liquid'], 'See water droplets form when steam meets a cold surface'],
  ]),

  // ---- Push, pull, and forces intro (6) ----
  ...topic('science.phys.push-pull', PHYS, 'foundation', [WS], [
    ['push', 'Pushing', ['science.observation'], 'Explore what happens when you push objects'],
    ['pull', 'Pulling', ['science.observation'], 'Explore what happens when you pull objects'],
    ['strength', 'Force Strength', ['push', 'pull'], 'Discover that pushes and pulls can be strong or weak'],
    ['direction', 'Force Direction', ['push', 'pull'], 'Observe that forces act in specific directions'],
    ['speed-change', 'Changing Speed', ['strength'], 'Use forces to make things go faster or slower'],
    ['shape-change', 'Changing Shape', ['strength'], 'Squash, stretch, twist, and bend objects with force'],
  ]),

  // ---- Magnets intro (5) ----
  ...topic('science.phys.magnets-intro', PHYS, 'foundation', [WS], [
    ['attract', 'Magnetic Attraction', ['science.phys.push-pull.pull'], 'Discover that magnets pull certain metals'],
    ['repel', 'Magnetic Repulsion', ['attract'], 'Discover that magnets can push each other away'],
    ['materials', 'Magnetic Materials', ['attract', 'science.sorting'], 'Sort objects into magnetic and non-magnetic groups'],
    ['explore', 'Magnet Exploration', ['attract', 'repel'], 'Test magnets with different objects and surfaces'],
    ['through', 'Magnets Through Materials', ['explore'], 'Discover magnets work through paper, wood, and water'],
  ]),

  // ---- Light and shadow (5) ----
  ...topic('science.phys.light-shadow', PHYS, 'foundation', [WS], [
    ['sources', 'Light Sources', ['science.observation'], 'Identify natural and artificial sources of light'],
    ['shadow-making', 'Making Shadows', ['sources'], 'Create shadows by blocking light with objects'],
    ['shadow-size', 'Shadow Size', ['shadow-making'], 'Change shadow size by moving objects nearer or farther from light'],
    ['transparent', 'Transparent and Opaque', ['shadow-making'], 'Sort materials by how much light passes through them'],
    ['darkness', 'Light and Darkness', ['sources'], 'Understand that we cannot see without light'],
  ]),

  // ---- Sound intro (5) ----
  ...topic('science.phys.sound-intro', PHYS, 'foundation', [WS], [
    ['making', 'Making Sounds', ['science.observation'], 'Create sounds by plucking, tapping, blowing, and shaking'],
    ['loud-quiet', 'Loud and Quiet', ['making'], 'Describe sounds as loud or quiet'],
    ['high-low', 'High and Low Pitch', ['making'], 'Describe sounds as high-pitched or low-pitched'],
    ['vibrations', 'Vibrations', ['making'], 'Feel and see that sounds come from vibrating objects'],
    ['travel', 'Sound Travel', ['vibrations'], 'Discover that sound travels through air, water, and solids'],
  ]),

  // ---- Floating and sinking (4) ----
  ...topic('science.phys.float-sink', PHYS, 'foundation', [WS, REEF], [
    ['predict', 'Predict Float or Sink', ['science.observation'], 'Guess whether objects will float or sink in water'],
    ['test', 'Test Floating', ['predict'], 'Place objects in water to test predictions'],
    ['materials', 'Materials That Float', ['test', 'science.sorting'], 'Discover which materials tend to float or sink'],
    ['shape', 'Shape and Floating', ['test'], 'Find that shape affects whether objects float'],
  ]),

  // ---- Simple machines intro (6) ----
  ...chain('science.phys.machines-intro', PHYS, 'foundation', [WS], [
    ['ramp', 'Ramps', 'Use a ramp to move heavy objects upward more easily'],
    ['lever', 'Levers', 'Use a lever to lift heavy things with less effort'],
    ['wheel', 'Wheels', 'Discover how wheels help things move smoothly'],
    ['wedge', 'Wedges', 'Use a wedge to split or cut materials apart'],
    ['pulley', 'Pulleys', 'Pull a rope over a wheel to lift a load'],
    ['combine', 'Combining Machines', 'Put simple machines together to solve bigger problems'],
  ], ['science.phys.push-pull.strength']),
];

// ===========================================================================
// PHYSICS — DISCOVERY  (~155 skills)
// Grades K-2: Forces, motion, energy forms, simple machines detail, magnets,
//             light, sound, electricity intro, heat intro
// ===========================================================================

const physicsDiscovery: SkillNode[] = [

  // ---- Preserved entry-point skills ----
  skill('science.physics.forces', 'Forces', PHYS, 'discovery',
    ['science.phys.push-pull.strength', 'science.phys.push-pull.direction'],
    'Understand that forces are pushes and pulls that change motion', [WS]),
  skill('science.physics.simple-machines', 'Simple Machines', PHYS, 'discovery',
    ['science.phys.machines-intro.combine', 'science.physics.forces'],
    'Identify the six simple machines and how they multiply force', [WS]),
  skill('science.physics.sound', 'Sound', PHYS, 'discovery',
    ['science.phys.sound-intro.vibrations', 'science.phys.sound-intro.travel'],
    'Understand sound as vibrations that travel through matter', [WS]),

  // ---- Gravity (8) ----
  ...topic('science.physics.gravity', PHYS, 'discovery', [WS], [
    ['what-is', 'What Is Gravity', ['science.physics.forces'], 'Discover the invisible force that pulls everything down'],
    ['weight', 'Weight', ['what-is', 'math.measurement.weight'], 'Understand weight as the pull of gravity on mass'],
    ['falling', 'Falling Objects', ['what-is'], 'Observe that all objects fall at the same rate without air'],
    ['mass-weight', 'Mass vs Weight', ['weight'], 'Distinguish between mass and the force of weight'],
    ['direction', 'Gravity Direction', ['what-is'], 'Learn that gravity always pulls toward the centre of Earth'],
    ['moon-gravity', 'Gravity on the Moon', ['weight'], 'Compare gravity on Earth and the Moon'],
    ['orbits-intro', 'Orbits Introduction', ['direction'], 'See how gravity keeps the Moon circling Earth'],
    ['air-resistance', 'Air Resistance and Gravity', ['falling'], 'Discover that air slows falling objects differently'],
  ]),

  // ---- Friction (7) ----
  ...topic('science.physics.friction', PHYS, 'discovery', [WS], [
    ['what-is', 'What Is Friction', ['science.physics.forces'], 'Feel the force that resists sliding surfaces'],
    ['rough-smooth', 'Rough and Smooth', ['what-is'], 'Compare friction on different surfaces'],
    ['reducing', 'Reducing Friction', ['rough-smooth'], 'Use lubricants and smooth surfaces to reduce friction'],
    ['increasing', 'Increasing Friction', ['rough-smooth'], 'Add grip and texture to increase friction'],
    ['air', 'Air Resistance Detail', ['what-is'], 'Explore how air pushes back on moving objects'],
    ['water', 'Water Resistance', ['what-is'], 'Feel how water slows objects moving through it'],
    ['useful', 'Useful Friction', ['reducing', 'increasing'], 'Recognise when friction helps and when it hinders'],
  ]),

  // ---- Contact and non-contact forces (6) ----
  ...topic('science.physics.contact', PHYS, 'discovery', [WS], [
    ['contact-force', 'Contact Forces', ['science.physics.forces'], 'Identify forces that need objects to touch'],
    ['non-contact', 'Non-Contact Forces', ['science.physics.forces'], 'Identify forces that act at a distance'],
    ['normal', 'Normal Force', ['contact-force'], 'Feel the surface pushing back when you set an object down'],
    ['tension', 'Tension', ['contact-force'], 'Recognise pulling force in a stretched rope or string'],
    ['elastic', 'Elastic Force', ['contact-force'], 'Stretch and compress springs and rubber bands'],
    ['compare', 'Comparing Forces', ['contact-force', 'non-contact'], 'Sort forces into contact and non-contact groups'],
  ]),

  // ---- Motion (10) ----
  ...topic('science.physics.motion', PHYS, 'discovery', [WS], [
    ['speed', 'Speed', ['science.physics.forces', 'math.measurement.length', 'math.measurement.time'], 'Measure how fast objects move over a distance'],
    ['direction', 'Direction of Motion', ['science.physics.forces'], 'Describe which way an object is moving'],
    ['distance-time', 'Distance and Time', ['speed', 'math.measurement.time'], 'Record distance travelled over time intervals'],
    ['position', 'Position', ['direction'], 'Describe where an object is relative to a starting point'],
    ['accel-intro', 'Speeding Up and Slowing Down', ['speed'], 'Observe objects getting faster or slower'],
    ['balanced', 'Balanced Forces', ['science.physics.forces'], 'Understand that balanced forces mean no change in motion'],
    ['unbalanced', 'Unbalanced Forces', ['balanced'], 'See how unbalanced forces cause changes in motion'],
    ['diagrams', 'Force Diagrams', ['balanced', 'unbalanced'], 'Draw arrows to show forces acting on an object'],
    ['predict', 'Predicting Motion', ['unbalanced'], 'Predict how an object will move given known forces'],
    ['experiment', 'Motion Experiments', ['distance-time', 'science.recording'], 'Design fair tests to investigate motion'],
  ]),

  // ---- Energy forms (12) ----
  ...topic('science.physics.energy', PHYS, 'discovery', [WS], [
    ['what-is', 'What Is Energy', ['science.physics.forces'], 'Understand energy as the ability to make things happen'],
    ['kinetic', 'Kinetic Energy', ['what-is', 'science.physics.motion.speed'], 'Recognise energy in moving objects'],
    ['potential', 'Potential Energy', ['what-is'], 'Recognise stored energy waiting to be released'],
    ['thermal', 'Thermal Energy', ['what-is'], 'Feel heat as a form of energy'],
    ['light-energy', 'Light Energy', ['what-is'], 'Recognise light as energy we can see'],
    ['sound-energy', 'Sound Energy', ['what-is', 'science.physics.sound'], 'Recognise sound as energy we can hear'],
    ['electrical', 'Electrical Energy', ['what-is'], 'Identify energy that flows through wires'],
    ['chemical', 'Chemical Energy', ['what-is'], 'Discover energy stored in food, fuel, and batteries'],
    ['elastic', 'Elastic Potential Energy', ['potential'], 'Store energy by stretching or compressing objects'],
    ['transfer', 'Energy Transfer', ['kinetic', 'potential'], 'Trace how energy moves from one object to another'],
    ['sources', 'Energy Sources', ['transfer'], 'Identify where our energy comes from: sun, food, fuel'],
    ['conservation-intro', 'Energy Conservation Intro', ['transfer'], 'Learn that energy is never created or destroyed'],
  ]),

  // ---- Simple machines detail (18) ----
  ...topic('science.physics.machines', PHYS, 'discovery', [WS], [
    ['lever-types', 'Types of Levers', ['science.physics.simple-machines'], 'Identify first, second, and third class levers'],
    ['lever-class1', 'First-Class Levers', ['lever-types'], 'Build a seesaw with the fulcrum between effort and load'],
    ['lever-class2', 'Second-Class Levers', ['lever-types'], 'Build a wheelbarrow with the load between fulcrum and effort'],
    ['lever-class3', 'Third-Class Levers', ['lever-types'], 'Use tongs where effort falls between fulcrum and load'],
    ['pulley-fixed', 'Fixed Pulleys', ['science.physics.simple-machines'], 'Change direction of a pull with a fixed pulley'],
    ['pulley-movable', 'Movable Pulleys', ['pulley-fixed'], 'Reduce effort needed with a movable pulley'],
    ['pulley-compound', 'Compound Pulleys', ['pulley-movable'], 'Combine pulleys to lift very heavy loads'],
    ['wedge-uses', 'Wedge Uses', ['science.physics.simple-machines'], 'Find wedges in axes, knives, and doorstops'],
    ['inclined-plane', 'Inclined Planes', ['science.physics.simple-machines'], 'Use a slope to trade distance for reduced force'],
    ['wheel-axle', 'Wheel and Axle', ['science.physics.simple-machines'], 'Discover how a wheel turns on an axle to move loads'],
    ['screw', 'Screws', ['inclined-plane'], 'Recognise a screw as a spiral inclined plane'],
    ['gear-intro', 'Gears Introduction', ['wheel-axle'], 'See how interlocking gears transfer turning force'],
    ['gear-ratios', 'Gear Ratios', ['gear-intro', 'math.ratios'], 'Change speed and force by combining different gear sizes'],
    ['mech-advantage', 'Mechanical Advantage', ['science.physics.simple-machines', 'math.division'], 'Calculate how much a machine multiplies your force'],
    ['efficiency', 'Machine Efficiency', ['mech-advantage', 'science.physics.friction.what-is'], 'Understand why machines never return 100 percent of energy input'],
    ['compound-machines', 'Compound Machines', ['lever-types', 'pulley-fixed', 'wheel-axle'], 'Combine simple machines into compound machines'],
    ['design-challenge', 'Machine Design Challenge', ['compound-machines'], 'Design a machine to solve a real-world lifting problem'],
    ['machines-history', 'Machines in History', ['compound-machines'], 'Explore how ancient civilizations used simple machines'],
  ]),

  // ---- Magnets detail (10) ----
  ...topic('science.physics.magnets', PHYS, 'discovery', [WS], [
    ['poles', 'Magnetic Poles', ['science.phys.magnets-intro.attract', 'science.phys.magnets-intro.repel'], 'Identify north and south poles on a magnet'],
    ['attract-repel', 'Attract and Repel Rules', ['poles'], 'Discover that opposite poles attract and like poles repel'],
    ['compass', 'Using a Compass', ['poles'], 'Watch a compass needle point to magnetic north'],
    ['field', 'Magnetic Fields', ['attract-repel'], 'Sprinkle iron filings to reveal invisible field lines'],
    ['electromagnet', 'Electromagnet Introduction', ['field', 'science.physics.energy.electrical'], 'Wrap wire around a nail and run current to make a magnet'],
    ['earth-magnet', 'Earth as a Magnet', ['compass', 'field'], 'Understand why compasses point north: Earth has a magnetic field'],
    ['temporary', 'Temporary Magnets', ['electromagnet'], 'Make and unmake magnets by stroking iron'],
    ['permanent', 'Permanent Magnets', ['poles'], 'Identify magnets that keep their magnetism indefinitely'],
    ['materials', 'Magnetic Materials Detail', ['poles', 'science.sorting'], 'Test iron, steel, nickel, and cobalt for magnetism'],
    ['uses', 'Magnets in Everyday Life', ['field'], 'Find magnets in speakers, motors, fridges, and credit cards'],
  ]),

  // ---- Light detail (12) ----
  ...topic('science.physics.light', PHYS, 'discovery', [WS], [
    ['straight', 'Light Travels Straight', ['science.phys.light-shadow.sources'], 'Show that light moves in straight lines'],
    ['reflection', 'Reflection Introduction', ['straight'], 'Observe light bouncing off shiny surfaces'],
    ['mirror', 'Mirrors', ['reflection'], 'Explore flat, curved, and funhouse mirrors'],
    ['refraction', 'Refraction Introduction', ['straight'], 'See how light bends when entering water or glass'],
    ['lens', 'Lenses Introduction', ['refraction'], 'Use magnifying lenses to focus light and enlarge images'],
    ['prism', 'Prisms', ['refraction'], 'Split white light into a rainbow with a prism'],
    ['spectrum', 'Colour Spectrum', ['prism'], 'Name the colours of the visible spectrum in order'],
    ['absorption', 'Light Absorption', ['straight'], 'Discover that dark objects absorb more light and get warmer'],
    ['filters', 'Colour Filters', ['spectrum'], 'Use coloured filters to block certain colours of light'],
    ['translucent', 'Translucent Materials', ['science.phys.light-shadow.transparent'], 'Explore materials that let some light through but scatter it'],
    ['pinhole', 'Pinhole Camera', ['straight'], 'Build a pinhole camera to see inverted images'],
    ['mixing-light', 'Mixing Coloured Light', ['spectrum'], 'Combine red, green, and blue light to make white'],
  ]),

  // ---- Sound detail (10) ----
  ...topic('science.physics.sound-disc', PHYS, 'discovery', [WS], [
    ['vibration-source', 'Vibration Sources', ['science.physics.sound'], 'Identify the vibrating object producing every sound'],
    ['medium', 'Sound Needs a Medium', ['science.physics.sound'], 'Prove that sound cannot travel through a vacuum'],
    ['speed', 'Speed of Sound', ['medium'], 'Compare the speed of sound in air, water, and steel'],
    ['pitch', 'Pitch and Frequency', ['science.physics.sound', 'math.measurement.length'], 'Shorter or tighter objects vibrate faster and sound higher'],
    ['volume', 'Volume and Amplitude', ['science.physics.sound'], 'Bigger vibrations make louder sounds'],
    ['echo', 'Echoes', ['medium'], 'Hear sound bounce off surfaces and return to you'],
    ['absorption-sound', 'Sound Absorption', ['medium'], 'Soft materials absorb sound and reduce echoes'],
    ['insulation', 'Sound Insulation', ['absorption-sound'], 'Design barriers that block sound from passing through'],
    ['music-science', 'The Science of Music', ['pitch', 'volume'], 'Explore how musical instruments create different notes'],
    ['ear-hearing', 'How We Hear', ['medium', 'pitch'], 'Trace sound waves from source to eardrum to brain'],
  ]),

  // ---- Electricity introduction (12) ----
  ...topic('science.physics.electricity', PHYS, 'discovery', [WS], [
    ['static', 'Static Electricity', ['science.physics.contact.non-contact'], 'Rub a balloon on your hair and watch it stick to a wall'],
    ['current', 'Electric Current', ['science.physics.energy.electrical'], 'Understand that current is a flow of electric charge'],
    ['circuit', 'Complete Circuits', ['current'], 'Build a circuit that lights a bulb using a battery and wires'],
    ['battery', 'Batteries', ['current'], 'Discover how batteries push electric charge around a circuit'],
    ['conductor', 'Conductors', ['circuit'], 'Test materials that let electricity pass through them'],
    ['insulator', 'Insulators', ['circuit'], 'Test materials that block the flow of electricity'],
    ['switch', 'Switches', ['circuit'], 'Add a switch to turn a circuit on and off'],
    ['bulb', 'Light Bulbs', ['circuit'], 'Watch electrical energy transform into light and heat'],
    ['series-intro', 'Series Circuits Introduction', ['circuit'], 'Connect bulbs one after another in a single loop'],
    ['parallel-intro', 'Parallel Circuits Introduction', ['circuit'], 'Connect bulbs on separate branches so each gets full power'],
    ['safety-elec', 'Electrical Safety', ['current'], 'Learn why water and electricity are dangerous together'],
    ['static-experiments', 'Static Experiments', ['static'], 'Bend water streams and pick up paper with static charge'],
  ]),

  // ---- Heat introduction (10) ----
  ...topic('science.physics.heat', PHYS, 'discovery', [WS], [
    ['temperature', 'Temperature', ['science.physics.energy.thermal', 'math.measurement.temperature'], 'Measure how hot or cold something is with a thermometer'],
    ['conduction-intro', 'Conduction Introduction', ['temperature'], 'Feel heat travel through a metal spoon in hot water'],
    ['convection-intro', 'Convection Introduction', ['temperature'], 'Watch warm air rise and cool air sink'],
    ['radiation-intro', 'Radiation Introduction', ['temperature'], 'Feel warmth from the sun and a fire without touching them'],
    ['insulators-heat', 'Thermal Insulators', ['conduction-intro'], 'Discover materials that keep things warm or cold'],
    ['conductors-heat', 'Thermal Conductors', ['conduction-intro'], 'Identify metals as good conductors of heat'],
    ['expansion', 'Thermal Expansion', ['temperature'], 'See materials expand when heated'],
    ['contraction', 'Thermal Contraction', ['expansion'], 'See materials shrink when cooled'],
    ['heat-sources', 'Heat Sources', ['temperature'], 'Identify where heat comes from: sun, fire, friction, electricity'],
    ['mixing-temps', 'Mixing Temperatures', ['temperature', 'math.arithmetic'], 'Predict the temperature when mixing hot and cold water'],
  ]),

  // ---- Measurement instruments (8) ----
  ...expand('science.physics.instrument', PHYS, 'discovery', [WS],
    ['science.measurement'],
    'Using a {item}', 'Read and use a {item} to make accurate measurements', [
    ['ruler', 'Ruler'], ['stopwatch', 'Stopwatch'], ['spring-scale', 'Spring Scale'],
    ['thermometer', 'Thermometer'], ['balance', 'Balance Scale'], ['tape-measure', 'Tape Measure'],
    ['measuring-cylinder', 'Measuring Cylinder'], ['protractor', 'Protractor'],
  ]),

  // ---- Physics experiments (8) ----
  ...parallel('science.physics.experiments', PHYS, 'discovery', [WS],
    ['science.physics.forces', 'science.recording'], [
    ['pendulum', 'Pendulum Experiment', 'Swing a pendulum and measure its period'],
    ['ramp-test', 'Ramp Experiment', 'Roll objects down ramps and measure distance'],
    ['magnet-strength', 'Magnet Strength Test', 'Measure how many paperclips a magnet can hold'],
    ['circuit-build', 'Circuit Builder', 'Wire a working circuit from a diagram'],
    ['sound-pitch', 'Pitch Experiment', 'Change the length of a vibrating string to alter pitch'],
    ['shadow-clock', 'Shadow Clock', 'Track shadow length throughout the day'],
    ['insulation-test', 'Insulation Test', 'Wrap cups in different materials and compare cooling rates'],
    ['parachute', 'Parachute Drop', 'Design parachutes to slow a falling object'],
  ]),
];


// ===========================================================================
// PHYSICS — BUILDER  (~200 skills)
// Grades 3-5: Newton laws, momentum, pressure, work/power/energy, waves,
//             optics, circuits, static, magnetism, heat transfer, fluids
// ===========================================================================

const physicsBuilder: SkillNode[] = [

  // ---- Preserved entry-point skills ----
  skill('science.physics.waves', 'Waves', PHYS, 'builder',
    ['science.physics.sound', 'science.physics.light.straight', 'math.algebra'],
    'Understand waves as disturbances that transfer energy without transferring matter', [WS]),
  skill('science.physics.circuits', 'Circuits', PHYS, 'builder',
    ['science.physics.electricity.series-intro', 'science.physics.electricity.parallel-intro', 'math.algebra'],
    'Analyse series and parallel circuits using Ohm law', [WS]),
  skill('science.physics.fluid-dynamics', 'Fluid Dynamics', PHYS, 'builder',
    ['science.physics.forces', 'science.phys.float-sink.shape', 'math.algebra'],
    'Study how liquids and gases flow and exert forces', [WS]),
  skill('science.physics.thermodynamics', 'Thermodynamics', PHYS, 'builder',
    ['science.physics.heat.temperature', 'science.physics.energy.conservation-intro', 'math.algebra'],
    'Understand the laws governing heat and energy transfer', [WS]),
  skill('science.physics.pressure', 'Pressure', PHYS, 'builder',
    ['science.physics.forces', 'math.geometry.area', 'math.division'],
    'Calculate pressure as force divided by area', [WS]),

  // ---- Newton laws (10) ----
  ...chain('science.physics.newton', PHYS, 'builder', [WS], [
    ['first-law', 'Newton First Law', 'Objects at rest stay at rest unless a force acts on them'],
    ['inertia', 'Inertia', 'Experience resistance to changes in motion'],
    ['second-law', 'Newton Second Law', 'Calculate that force equals mass times acceleration'],
    ['fma', 'F = ma Calculations', 'Solve problems using force, mass, and acceleration'],
    ['third-law', 'Newton Third Law', 'Every action has an equal and opposite reaction'],
    ['action-reaction', 'Action-Reaction Pairs', 'Identify paired forces in rockets, swimming, and walking'],
    ['net-force', 'Net Force', 'Add forces acting on an object to find the resultant'],
    ['free-body', 'Free-Body Diagrams', 'Draw diagrams showing all forces acting on an object'],
    ['equilibrium', 'Equilibrium', 'Determine when forces balance to zero net force'],
    ['applications', 'Newton Applications', 'Apply all three laws to real-world scenarios'],
  ], ['science.physics.forces', 'math.algebra', 'math.multiplication']),

  // ---- Momentum (10) ----
  ...topic('science.physics.momentum', PHYS, 'builder', [WS], [
    ['linear', 'Linear Momentum', ['science.physics.newton.second-law', 'math.multiplication'], 'Calculate momentum as mass times velocity'],
    ['impulse', 'Impulse', ['linear'], 'Relate force and time to changes in momentum'],
    ['conservation', 'Conservation of Momentum', ['linear'], 'Total momentum stays constant in a closed system'],
    ['collisions', 'Collisions', ['conservation'], 'Analyse what happens when two objects crash together'],
    ['elastic', 'Elastic Collisions', ['collisions'], 'Study collisions where kinetic energy is conserved'],
    ['inelastic', 'Inelastic Collisions', ['collisions'], 'Study collisions where objects stick together'],
    ['explosions', 'Explosions', ['conservation'], 'Analyse objects that fly apart from rest'],
    ['crumple-zones', 'Crumple Zones', ['impulse'], 'Design safety features that extend collision time'],
    ['rocket', 'Rocket Propulsion', ['conservation', 'science.physics.newton.third-law'], 'Explain how rockets accelerate by expelling exhaust'],
    ['problems', 'Momentum Problems', ['elastic', 'inelastic', 'math.equations'], 'Solve multi-step momentum conservation problems'],
  ]),

  // ---- Pressure (12) ----
  ...topic('science.physics.press', PHYS, 'builder', [WS], [
    ['definition', 'Pressure Definition', ['science.physics.pressure'], 'Calculate pressure as force per unit area in pascals'],
    ['solid', 'Pressure in Solids', ['definition'], 'Explain why sharp objects exert more pressure than blunt ones'],
    ['liquid', 'Pressure in Liquids', ['definition', 'science.physics.fluid-dynamics'], 'Liquid pressure increases with depth'],
    ['gas', 'Pressure in Gases', ['definition'], 'Gas pressure results from molecules hitting container walls'],
    ['atmospheric', 'Atmospheric Pressure', ['gas'], 'Measure the weight of the air column above us'],
    ['barometer', 'Barometers', ['atmospheric'], 'Read atmospheric pressure using a barometer'],
    ['hydraulic', 'Hydraulic Systems', ['liquid'], 'Multiply force using trapped liquid in connected cylinders'],
    ['pascal-law', 'Pascal Law', ['hydraulic', 'math.equations'], 'Apply the Pascal principle to hydraulic calculations'],
    ['boyle-intro', 'Boyle Law Introduction', ['gas', 'math.multiplication'], 'Squeezing a gas raises its pressure'],
    ['depth-calc', 'Pressure and Depth', ['liquid', 'math.equations'], 'Calculate liquid pressure at different depths'],
    ['manometer', 'Manometers', ['liquid'], 'Measure gas pressure using a U-tube of liquid'],
    ['applications', 'Pressure Applications', ['hydraulic', 'atmospheric'], 'Find pressure at work in brakes, syringes, and weather maps'],
  ]),

  // ---- Work, power, and energy (14) ----
  ...topic('science.physics.work-energy', PHYS, 'builder', [WS], [
    ['work', 'Work', ['science.physics.forces', 'math.multiplication'], 'Calculate work as force times distance in the direction of force'],
    ['joules', 'Joules', ['work'], 'Use the joule as the unit of work and energy'],
    ['power', 'Power', ['work', 'math.division'], 'Calculate power as work done per unit time'],
    ['watts', 'Watts', ['power'], 'Use the watt as the unit of power'],
    ['ke-formula', 'Kinetic Energy Formula', ['science.physics.energy.kinetic', 'math.multiplication'], 'Calculate KE using half times mass times velocity squared'],
    ['pe-formula', 'Gravitational PE Formula', ['science.physics.energy.potential', 'math.multiplication'], 'Calculate PE as mass times gravity times height'],
    ['work-energy', 'Work-Energy Theorem', ['work', 'ke-formula'], 'Connect work done on an object to its change in kinetic energy'],
    ['conservation', 'Conservation of Energy', ['ke-formula', 'pe-formula'], 'Total energy stays constant in a closed system'],
    ['efficiency', 'Energy Efficiency', ['conservation', 'math.percentages'], 'Calculate the percentage of useful energy output'],
    ['power-calc', 'Power Calculations', ['power', 'math.equations'], 'Solve problems involving power, work, and time'],
    ['diagrams', 'Energy Diagrams', ['conservation'], 'Draw Sankey diagrams to show energy transfers'],
    ['elastic-pe', 'Elastic PE', ['science.physics.energy.elastic', 'math.multiplication'], 'Calculate energy stored in a stretched or compressed spring'],
    ['dissipation', 'Energy Dissipation', ['efficiency'], 'Trace where wasted energy goes: usually heat and sound'],
    ['resources', 'Energy Resources', ['efficiency'], 'Compare renewable and non-renewable energy sources'],
  ]),

  // ---- Wave properties (14) ----
  ...topic('science.physics.wave-props', PHYS, 'builder', [WS], [
    ['transverse', 'Transverse Waves', ['science.physics.waves'], 'Vibration is perpendicular to direction of travel'],
    ['longitudinal', 'Longitudinal Waves', ['science.physics.waves'], 'Vibration is parallel to direction of travel'],
    ['amplitude', 'Amplitude', ['science.physics.waves'], 'Measure the maximum displacement from the rest position'],
    ['wavelength', 'Wavelength', ['science.physics.waves'], 'Measure the distance between successive wave crests'],
    ['frequency', 'Frequency', ['science.physics.waves', 'math.division'], 'Count waves passing a point each second in hertz'],
    ['period', 'Period', ['frequency'], 'Calculate the time for one complete wave cycle'],
    ['wave-speed', 'Wave Speed', ['frequency', 'wavelength', 'math.multiplication'], 'Calculate wave speed as frequency times wavelength'],
    ['reflection-wave', 'Wave Reflection', ['transverse'], 'Observe waves bouncing off barriers'],
    ['refraction-wave', 'Wave Refraction', ['transverse'], 'Observe waves bending as they change speed between media'],
    ['diffraction', 'Wave Diffraction', ['transverse'], 'Watch waves spread out through gaps and around obstacles'],
    ['interference-intro', 'Wave Interference Introduction', ['transverse'], 'See two waves combine to make a bigger or smaller wave'],
    ['standing', 'Standing Waves', ['interference-intro'], 'Create patterns of nodes and antinodes on a vibrating string'],
    ['resonance', 'Resonance', ['standing', 'frequency'], 'Drive a system at its natural frequency to amplify vibrations'],
    ['wave-equation', 'Wave Equation', ['wave-speed', 'math.equations'], 'Solve v = f times lambda problems for any missing variable'],
  ]),

  // ---- Optics (14) ----
  ...topic('science.physics.optics', PHYS, 'builder', [WS], [
    ['law-reflection', 'Law of Reflection', ['science.physics.light.reflection', 'math.geometry.angles'], 'Angle of incidence equals angle of reflection'],
    ['plane-mirror', 'Plane Mirrors', ['law-reflection'], 'Locate images in flat mirrors using ray diagrams'],
    ['concave', 'Concave Mirrors', ['plane-mirror'], 'Focus light with curved mirrors that bow inward'],
    ['convex-mirror', 'Convex Mirrors', ['plane-mirror'], 'Spread light with curved mirrors that bow outward'],
    ['snells', 'Snell Law', ['science.physics.light.refraction', 'math.trig.basics'], 'Calculate how much light bends at a boundary'],
    ['converging', 'Converging Lenses', ['snells'], 'Focus light through convex lenses to form images'],
    ['diverging', 'Diverging Lenses', ['snells'], 'Spread light through concave lenses'],
    ['image-formation', 'Image Formation', ['converging', 'diverging'], 'Locate and describe real and virtual images'],
    ['magnification', 'Magnification', ['image-formation', 'math.ratios'], 'Calculate how much larger or smaller an image appears'],
    ['total-internal', 'Total Internal Reflection', ['snells'], 'Trap light inside glass or water at steep angles'],
    ['fiber-optics', 'Fibre Optics Introduction', ['total-internal'], 'Send light signals through thin glass fibres'],
    ['colour-theory', 'Colour Theory', ['science.physics.light.spectrum'], 'Explain why objects appear coloured under white light'],
    ['human-eye', 'The Human Eye', ['converging', 'image-formation'], 'Model the eye as a lens system focusing light on the retina'],
    ['eye-defects', 'Eye Defects', ['human-eye'], 'Correct short-sight and long-sight with lenses'],
  ]),

  // ---- Circuits detail (16) ----
  ...topic('science.physics.circuit', PHYS, 'builder', [WS], [
    ['ohms-law', 'Ohm Law', ['science.physics.circuits', 'math.equations'], 'Calculate V = IR relating voltage, current, and resistance'],
    ['resistance', 'Resistance', ['ohms-law'], 'Understand resistance as opposition to current flow'],
    ['voltage', 'Voltage', ['ohms-law'], 'Measure the energy given to charges by a battery'],
    ['current', 'Current', ['ohms-law'], 'Measure the flow of charge past a point each second'],
    ['series', 'Series Circuits', ['ohms-law'], 'Calculate total resistance and current in series circuits'],
    ['parallel-circ', 'Parallel Circuits', ['ohms-law'], 'Calculate total resistance and current in parallel circuits'],
    ['combined', 'Combined Circuits', ['series', 'parallel-circ'], 'Analyse circuits with both series and parallel sections'],
    ['power-elec', 'Electrical Power', ['ohms-law', 'math.multiplication'], 'Calculate power as voltage times current'],
    ['energy-elec', 'Electrical Energy', ['power-elec', 'math.multiplication'], 'Calculate energy used over time in kilowatt-hours'],
    ['resistors', 'Resistors', ['resistance'], 'Read resistor colour codes and choose correct values'],
    ['capacitors-intro', 'Capacitors Introduction', ['voltage'], 'Store and release electrical energy on parallel plates'],
    ['ammeter', 'Using an Ammeter', ['current'], 'Connect an ammeter in series to measure current'],
    ['voltmeter', 'Using a Voltmeter', ['voltage'], 'Connect a voltmeter in parallel to measure voltage'],
    ['fuse', 'Fuses and Safety', ['current'], 'Protect circuits with fuses that melt at excess current'],
    ['diagrams', 'Circuit Diagrams', ['series', 'parallel-circ'], 'Draw and interpret standard circuit symbols'],
    ['kirchhoff-intro', 'Kirchhoff Laws Introduction', ['series', 'parallel-circ'], 'Apply junction and loop rules to solve circuits'],
  ]),

  // ---- Static electricity (8) ----
  ...topic('science.physics.static', PHYS, 'builder', [WS], [
    ['charging', 'Charging by Rubbing', ['science.physics.electricity.static'], 'Transfer electrons between materials through friction'],
    ['triboelectric', 'Triboelectric Series', ['charging'], 'Predict which materials gain or lose electrons when rubbed'],
    ['conductors-static', 'Conductors and Charge', ['charging'], 'See charge spread across a conductor instantly'],
    ['insulators-static', 'Insulators and Charge', ['charging'], 'See charge stay localised on an insulator'],
    ['grounding', 'Grounding', ['conductors-static'], 'Safely discharge an object by connecting it to ground'],
    ['lightning', 'Lightning', ['charging', 'grounding'], 'Understand lightning as a massive static discharge'],
    ['van-de-graaff', 'Van de Graaff Generator', ['charging'], 'Build up huge static charges on a metal dome'],
    ['coulomb-intro', 'Coulomb Law Introduction', ['charging', 'math.equations'], 'Calculate the force between two charges'],
  ]),

  // ---- Magnetism detail (10) ----
  ...topic('science.physics.magnetism', PHYS, 'builder', [WS], [
    ['domains', 'Magnetic Domains', ['science.physics.magnets.field'], 'Understand magnetism as aligned atomic domains'],
    ['electromagnets', 'Electromagnets', ['science.physics.magnets.electromagnet', 'science.physics.circuits'], 'Build stronger electromagnets with more coils and current'],
    ['solenoid', 'Solenoids', ['electromagnets'], 'Create a uniform magnetic field inside a coil of wire'],
    ['relay', 'Relays', ['electromagnets'], 'Use a small current to switch a large current on and off'],
    ['motor-intro', 'Electric Motors', ['electromagnets', 'science.physics.magnets.field'], 'Spin a coil in a magnetic field to make a motor'],
    ['generator-intro', 'Generators', ['motor-intro'], 'Spin a coil to generate electricity from motion'],
    ['flux', 'Magnetic Flux', ['science.physics.magnets.field', 'math.geometry.area'], 'Calculate magnetic field passing through an area'],
    ['earth-field', 'Earth Magnetic Field', ['science.physics.magnets.earth-magnet'], 'Study the magnetosphere that shields us from solar wind'],
    ['mag-materials', 'Magnetic Materials Advanced', ['domains'], 'Compare ferromagnetic, paramagnetic, and diamagnetic materials'],
    ['applications-mag', 'Magnetism Applications', ['motor-intro', 'generator-intro'], 'Find electromagnets in speakers, MRI machines, and maglev trains'],
  ]),

  // ---- Heat transfer (12) ----
  ...topic('science.physics.heat-transfer', PHYS, 'builder', [WS], [
    ['conduction', 'Conduction Detail', ['science.physics.thermodynamics'], 'Trace heat flowing through vibrating particles in solids'],
    ['convection', 'Convection Detail', ['science.physics.thermodynamics'], 'Track rising warm fluid and sinking cool fluid'],
    ['radiation', 'Radiation Detail', ['science.physics.thermodynamics'], 'Understand heat radiation as infrared waves'],
    ['thermal-eq', 'Thermal Equilibrium', ['conduction'], 'Predict when two objects reach the same temperature'],
    ['specific-heat', 'Specific Heat Capacity', ['thermal-eq', 'math.equations'], 'Calculate energy needed to raise temperature'],
    ['latent-heat', 'Latent Heat', ['specific-heat'], 'Calculate energy to change state without changing temperature'],
    ['phase-changes', 'Phase Changes', ['latent-heat'], 'Map melting, boiling, freezing on heating curves'],
    ['expansion', 'Thermal Expansion Detail', ['conduction', 'math.equations'], 'Calculate how much materials expand when heated'],
    ['insulation', 'Insulation Design', ['conduction', 'convection', 'radiation'], 'Choose materials to minimise heat loss'],
    ['r-value', 'R-Value', ['insulation', 'math.equations'], 'Rate insulating materials by thermal resistance'],
    ['heat-engines', 'Heat Engines Introduction', ['convection'], 'Convert heat into useful mechanical work'],
    ['entropy-intro', 'Entropy Introduction', ['heat-engines'], 'Energy spreads out and becomes less useful over time'],
  ]),

  // ---- Fluid basics (12) ----
  ...topic('science.physics.fluid', PHYS, 'builder', [WS, REEF], [
    ['density', 'Density', ['science.physics.fluid-dynamics', 'math.division'], 'Calculate density as mass divided by volume'],
    ['buoyancy', 'Buoyancy', ['density', 'science.phys.float-sink.shape'], 'Understand the upward force on submerged objects'],
    ['archimedes', 'Archimedes Principle', ['buoyancy', 'math.equations'], 'Buoyant force equals weight of displaced fluid'],
    ['viscosity', 'Viscosity', ['science.physics.fluid-dynamics'], 'Compare how easily different fluids flow'],
    ['flow-types', 'Laminar and Turbulent Flow', ['viscosity'], 'Distinguish smooth laminar from chaotic turbulent flow'],
    ['bernoulli-intro', 'Bernoulli Principle', ['science.physics.fluid-dynamics', 'science.physics.pressure'], 'Faster-moving fluid exerts lower pressure'],
    ['pressure-fluids', 'Pressure in Fluids', ['science.physics.pressure', 'density'], 'Calculate pressure at any depth in a fluid'],
    ['pascal', 'Pascal Principle', ['pressure-fluids'], 'Pressure applied to trapped fluid transmits equally'],
    ['hydraulics', 'Hydraulic Systems', ['pascal', 'math.equations'], 'Design systems that transmit force through trapped fluid'],
    ['pneumatics', 'Pneumatic Systems', ['science.physics.press.gas'], 'Use compressed air to do work in machines'],
    ['surface-tension', 'Surface Tension', ['science.physics.fluid-dynamics'], 'Water surface acts like an elastic skin'],
    ['capillary', 'Capillary Action', ['surface-tension'], 'Watch water climb narrow tubes against gravity'],
  ]),

  // ---- Lab skills (8) ----
  ...chain('science.physics.lab', PHYS, 'builder', [WS], [
    ['hypothesis', 'Forming Hypotheses', 'Write testable predictions based on observations'],
    ['variables', 'Identifying Variables', 'Distinguish independent, dependent, and controlled variables'],
    ['controls', 'Designing Controls', 'Set up control experiments to ensure fair tests'],
    ['data', 'Collecting Data', 'Record measurements systematically in tables'],
    ['graphing', 'Graphing Results', 'Plot data on line graphs and bar charts'],
    ['analysis', 'Analysing Data', 'Identify trends, patterns, and anomalies in results'],
    ['conclusion', 'Drawing Conclusions', 'State whether results support or refute the hypothesis'],
    ['peer-review', 'Peer Review', 'Evaluate and improve methods through feedback'],
  ], ['science.recording', 'math.data.graphs']),

  // ---- SI units (10) ----
  ...expand('science.physics.unit', PHYS, 'builder', [WS],
    ['science.measurement', 'math.multiplication'],
    'SI Unit: {item}', 'Use the {item} correctly in physics calculations', [
    ['newton', 'Newton'], ['joule', 'Joule'], ['watt', 'Watt'],
    ['pascal-unit', 'Pascal'], ['ohm', 'Ohm'], ['ampere', 'Ampere'],
    ['volt', 'Volt'], ['hertz', 'Hertz'], ['coulomb', 'Coulomb'],
    ['kelvin', 'Kelvin'],
  ]),

  // ---- Design challenges (10) ----
  ...parallel('science.physics.challenge', PHYS, 'builder', [WS],
    ['science.physics.lab.hypothesis', 'science.physics.forces'], [
    ['bridge', 'Bridge Building', 'Design a bridge to hold the most weight with limited materials'],
    ['egg-drop', 'Egg Drop', 'Protect a falling egg using impulse and cushioning'],
    ['catapult', 'Catapult Design', 'Build a catapult that launches a projectile to a target'],
    ['solar-oven', 'Solar Oven', 'Cook food using reflected and concentrated sunlight'],
    ['wind-turbine', 'Wind Turbine', 'Generate electricity from moving air'],
    ['boat', 'Boat Design', 'Build a boat that carries the most cargo without sinking'],
    ['insulation-cup', 'Insulation Cup', 'Keep a drink warm as long as possible'],
    ['roller-coaster', 'Roller Coaster Model', 'Design a track where a marble completes a loop'],
    ['speaker-build', 'Speaker Build', 'Turn a magnet and coil into a working speaker'],
    ['periscope', 'Periscope Build', 'Use mirrors to see around corners'],
  ]),
];

// ===========================================================================
// PHYSICS — INNOVATOR  (~250 skills)
// Grades 6-8: Kinematics, rotational, thermo, electromagnetism, EM spectrum,
//             wave interference, AC/DC, nuclear, relativity, quantum basics
// ===========================================================================

const physicsInnovator: SkillNode[] = [

  // ---- Kinematics equations (12) ----
  ...chain('science.physics.kinematics', PHYS, 'innovator', [WS], [
    ['displacement', 'Displacement', 'Distinguish displacement from distance as a vector quantity'],
    ['velocity-vec', 'Velocity Vectors', 'Combine speed and direction into velocity'],
    ['accel-vec', 'Acceleration Vectors', 'Calculate the rate of change of velocity'],
    ['eq1', 'Kinematics Equation 1', 'Use v = u + at to find final velocity'],
    ['eq2', 'Kinematics Equation 2', 'Use s = ut + half at squared to find displacement'],
    ['eq3', 'Kinematics Equation 3', 'Use v squared = u squared + 2as to eliminate time'],
    ['projectile', 'Projectile Motion', 'Separate horizontal and vertical motion of launched objects'],
    ['relative', 'Relative Motion', 'Analyse motion from different reference frames'],
    ['circular', 'Circular Motion', 'Describe motion along a curved path'],
    ['centripetal', 'Centripetal Force', 'Calculate the inward force that keeps objects on a circle'],
    ['banked-curves', 'Banked Curves', 'Analyse how angled surfaces help vehicles turn safely'],
    ['projectile-adv', 'Advanced Projectiles', 'Solve projectile problems with air resistance'],
  ], ['science.physics.newton.fma', 'math.algebra', 'math.trig.basics']),

  // ---- Rotational mechanics (14) ----
  ...topic('science.physics.rotation', PHYS, 'innovator', [WS], [
    ['angular-disp', 'Angular Displacement', ['science.physics.kinematics.circular', 'math.geometry.angles'], 'Measure rotation in radians'],
    ['angular-vel', 'Angular Velocity', ['angular-disp'], 'Calculate the rate of angular rotation'],
    ['angular-accel', 'Angular Acceleration', ['angular-vel'], 'Calculate the rate of change of angular velocity'],
    ['torque', 'Torque', ['science.physics.newton.net-force', 'angular-disp'], 'Calculate rotational force as radius times force'],
    ['moment-inertia', 'Moment of Inertia', ['torque'], 'Determine rotational resistance based on mass distribution'],
    ['angular-momentum', 'Angular Momentum', ['moment-inertia', 'angular-vel'], 'Calculate L = I times omega'],
    ['conservation-L', 'Conservation of Angular Momentum', ['angular-momentum'], 'Spinning objects speed up when they pull inward'],
    ['rotational-ke', 'Rotational Kinetic Energy', ['moment-inertia', 'angular-vel'], 'Calculate energy of rotation'],
    ['rolling', 'Rolling Motion', ['rotational-ke', 'science.physics.work-energy.ke-formula'], 'Combine translational and rotational energy for rolling objects'],
    ['precession', 'Precession', ['angular-momentum', 'torque'], 'Observe a spinning top wobble due to gravity-torque interaction'],
    ['gyroscope', 'Gyroscopes', ['precession'], 'Explore devices that resist orientation changes'],
    ['rotational-eq', 'Rotational Equilibrium', ['torque'], 'Set net torque to zero for balanced rotating systems'],
    ['pulleys-adv', 'Advanced Pulley Systems', ['torque', 'moment-inertia'], 'Solve pulley problems involving rotational inertia'],
    ['flywheels', 'Flywheels', ['rotational-ke'], 'Store energy in massive spinning discs'],
  ]),

  // ---- Thermodynamics (14) ----
  ...topic('science.physics.thermo', PHYS, 'innovator', [WS], [
    ['zeroth-law', 'Zeroth Law', ['science.physics.thermodynamics'], 'If A and B each equal C in temperature, A equals B'],
    ['first-law', 'First Law of Thermodynamics', ['science.physics.thermodynamics', 'math.calculus'], 'Internal energy change equals heat added minus work done'],
    ['second-law', 'Second Law of Thermodynamics', ['first-law'], 'Entropy of an isolated system never decreases'],
    ['third-law', 'Third Law of Thermodynamics', ['second-law'], 'Entropy approaches zero as temperature approaches absolute zero'],
    ['entropy', 'Entropy', ['second-law', 'math.calculus'], 'Calculate disorder and the direction of natural processes'],
    ['enthalpy', 'Enthalpy', ['first-law'], 'Measure heat content at constant pressure'],
    ['free-energy', 'Gibbs Free Energy', ['enthalpy', 'entropy'], 'Predict whether a process will occur spontaneously'],
    ['heat-engines-adv', 'Heat Engines Advanced', ['second-law'], 'Analyse efficiency of engines converting heat to work'],
    ['carnot', 'Carnot Cycle', ['heat-engines-adv'], 'Derive the maximum theoretical efficiency of a heat engine'],
    ['refrigeration', 'Refrigeration', ['carnot'], 'Reverse a heat engine to pump heat from cold to hot'],
    ['pv-diagrams', 'PV Diagrams', ['first-law', 'math.calculus'], 'Read pressure-volume graphs to calculate work done by a gas'],
    ['ideal-gas', 'Ideal Gas Law', ['science.physics.press.boyle-intro', 'math.equations'], 'Combine pressure, volume, temperature, and amount in PV = nRT'],
    ['real-gas', 'Real Gases', ['ideal-gas'], 'Account for molecular size and attraction in real gases'],
    ['kinetic-theory', 'Kinetic Theory', ['ideal-gas'], 'Derive gas behaviour from random molecular motion'],
  ]),

  // ---- Electromagnetism (16) ----
  ...topic('science.physics.em', PHYS, 'innovator', [WS], [
    ['electric-field', 'Electric Fields', ['science.physics.static.coulomb-intro', 'math.calculus'], 'Map the force-per-charge surrounding charged objects'],
    ['electric-potential', 'Electric Potential', ['electric-field'], 'Calculate the energy-per-charge at any point in a field'],
    ['capacitance', 'Capacitance', ['science.physics.circuit.capacitors-intro', 'math.equations'], 'Calculate charge stored per volt on a capacitor'],
    ['dielectrics', 'Dielectrics', ['capacitance'], 'Insert insulators between capacitor plates to boost capacity'],
    ['mag-force', 'Magnetic Force on Charges', ['science.physics.magnetism.flux', 'math.trig.basics'], 'Calculate force on a moving charge in a magnetic field'],
    ['mag-force-wire', 'Force on Current-Carrying Wire', ['mag-force'], 'Calculate force on a wire carrying current through a field'],
    ['faraday', 'Faraday Law', ['science.physics.magnetism.generator-intro', 'math.calculus'], 'A changing magnetic flux induces an EMF in a loop'],
    ['lenz', 'Lenz Law', ['faraday'], 'Induced current opposes the change that caused it'],
    ['inductance', 'Inductance', ['faraday'], 'Measure a coil resistance to changes in current'],
    ['mutual-induction', 'Mutual Induction', ['inductance'], 'A changing current in one coil induces EMF in another'],
    ['transformers', 'Transformers', ['mutual-induction', 'math.ratios'], 'Step voltage up or down using coil turns ratios'],
    ['em-induction', 'Electromagnetic Induction', ['faraday', 'lenz'], 'Generate current by moving a conductor through a field'],
    ['eddy-currents', 'Eddy Currents', ['em-induction'], 'Observe circulating currents induced in bulk conductors'],
    ['motor-effect', 'Motor Effect', ['mag-force-wire'], 'Explain how current and field produce rotation in motors'],
    ['hall-effect', 'Hall Effect', ['mag-force'], 'Detect magnetic fields by measuring voltage across a conductor'],
    ['em-applications', 'EM Applications', ['transformers', 'motor-effect'], 'Trace electromagnetism in generators, motors, and power grids'],
  ]),

  // ---- EM spectrum (14) ----
  ...topic('science.physics.em-spectrum', PHYS, 'innovator', [WS, OBS], [
    ['overview', 'EM Spectrum Overview', ['science.physics.waves', 'science.physics.light.spectrum'], 'Survey the full range from radio waves to gamma rays'],
    ['radio', 'Radio Waves', ['overview'], 'Use the longest EM waves for broadcasting and communication'],
    ['microwave', 'Microwaves', ['overview'], 'Heat food and carry mobile phone signals'],
    ['infrared', 'Infrared', ['overview'], 'Detect heat radiation with thermal cameras'],
    ['visible', 'Visible Light', ['overview'], 'Identify the narrow band of EM waves our eyes detect'],
    ['ultraviolet', 'Ultraviolet', ['overview'], 'Explore UV light from the sun and its effects on skin'],
    ['x-ray', 'X-Rays', ['overview'], 'Penetrate soft tissue to image bones'],
    ['gamma', 'Gamma Rays', ['overview'], 'Identify the most energetic EM waves from nuclear reactions'],
    ['properties', 'EM Wave Properties', ['overview', 'math.equations'], 'All EM waves travel at the speed of light in a vacuum'],
    ['detection', 'Detecting EM Waves', ['overview'], 'Match detectors to different parts of the spectrum'],
    ['emission', 'Emission Spectra', ['visible', 'science.chemistry.atoms'], 'Identify elements by the light they emit when heated'],
    ['absorption-spectra', 'Absorption Spectra', ['emission'], 'Identify elements by the wavelengths they absorb'],
    ['blackbody', 'Blackbody Radiation', ['infrared', 'math.calculus'], 'Relate temperature to the peak wavelength of emitted light'],
    ['wien', 'Wien Law', ['blackbody', 'math.equations'], 'Calculate peak wavelength from temperature'],
  ]),

  // ---- Wave advanced (14) ----
  ...topic('science.physics.wave-adv', PHYS, 'innovator', [WS], [
    ['superposition', 'Superposition Principle', ['science.physics.wave-props.interference-intro'], 'Overlapping waves add their displacements at every point'],
    ['constructive', 'Constructive Interference', ['superposition'], 'Waves in phase combine to make a bigger wave'],
    ['destructive', 'Destructive Interference', ['superposition'], 'Waves out of phase combine to cancel each other'],
    ['beats', 'Beats', ['superposition'], 'Hear pulsating loudness when two close frequencies overlap'],
    ['doppler', 'Doppler Effect', ['science.physics.wave-props.frequency'], 'Pitch changes when a source moves toward or away from you'],
    ['sonic-boom', 'Sonic Boom', ['doppler'], 'A shock wave forms when an object exceeds the speed of sound'],
    ['single-slit', 'Single-Slit Diffraction', ['science.physics.wave-props.diffraction', 'math.trig.basics'], 'Calculate the diffraction pattern through a narrow slit'],
    ['double-slit', 'Double-Slit Interference', ['single-slit'], 'Observe the famous two-slit pattern proving wave behaviour'],
    ['thin-films', 'Thin Film Interference', ['constructive', 'destructive'], 'Explain rainbow colours in soap bubbles and oil slicks'],
    ['polarization', 'Polarisation', ['science.physics.wave-props.transverse'], 'Filter waves to vibrate in one plane only'],
    ['diffraction-grating', 'Diffraction Gratings', ['double-slit'], 'Separate wavelengths precisely with many parallel slits'],
    ['huygens', 'Huygens Principle', ['science.physics.wave-props.diffraction'], 'Model wave propagation as expanding circular wavelets'],
    ['coherence', 'Coherence', ['double-slit'], 'Understand why interference requires waves of the same frequency'],
    ['applications-wave', 'Wave Applications', ['doppler', 'polarization'], 'Apply wave physics in sonar, radar, and noise cancelling'],
  ]),

  // ---- AC/DC circuits (12) ----
  ...topic('science.physics.acdc', PHYS, 'innovator', [WS], [
    ['ac-gen', 'AC Generation', ['science.physics.em.faraday', 'science.physics.magnetism.generator-intro'], 'Generate alternating current by rotating a coil in a field'],
    ['dc-sources', 'DC Sources', ['science.physics.circuit.ohms-law'], 'Identify batteries and rectifiers as DC sources'],
    ['rectification', 'Rectification', ['ac-gen', 'dc-sources'], 'Convert AC to DC using diodes'],
    ['rlc', 'RLC Circuits', ['science.physics.em.inductance', 'science.physics.circuit.capacitors-intro'], 'Analyse circuits with resistors, inductors, and capacitors'],
    ['impedance', 'Impedance', ['rlc', 'math.algebra'], 'Calculate combined opposition to AC current'],
    ['phase', 'Phase in AC', ['impedance'], 'Understand voltage and current timing differences in AC'],
    ['resonance-ac', 'AC Resonance', ['rlc'], 'Find the frequency where impedance is minimised'],
    ['power-factor', 'Power Factor', ['phase', 'math.trig.basics'], 'Calculate the fraction of power doing useful work in AC'],
    ['transformers-adv', 'Transformer Calculations', ['science.physics.em.transformers', 'math.equations'], 'Calculate voltage, current, and turns in transformers'],
    ['transmission', 'Power Transmission', ['transformers-adv'], 'Explain why high voltage reduces losses in power lines'],
    ['semiconductor', 'Semiconductor Introduction', ['science.physics.circuit.resistors'], 'Discover materials between conductors and insulators'],
    ['diodes', 'Diodes', ['semiconductor'], 'Allow current flow in one direction only'],
  ]),

  // ---- Nuclear physics intro (10) ----
  ...topic('science.physics.nuclear', PHYS, 'innovator', [WS], [
    ['radioactivity', 'Radioactivity', ['science.chemistry.atoms', 'science.physics.em-spectrum.gamma'], 'Discover that unstable nuclei emit radiation spontaneously'],
    ['alpha', 'Alpha Radiation', ['radioactivity'], 'Identify heavy helium nuclei emitted by large atoms'],
    ['beta', 'Beta Radiation', ['radioactivity'], 'Identify fast electrons emitted when neutrons convert to protons'],
    ['gamma-rad', 'Gamma Radiation', ['radioactivity'], 'Identify high-energy EM waves from nuclear transitions'],
    ['half-life', 'Half-Life', ['radioactivity', 'math.algebra'], 'Calculate the time for half a sample to decay'],
    ['decay-eq', 'Decay Equations', ['alpha', 'beta'], 'Balance nuclear equations conserving mass and charge'],
    ['fission', 'Nuclear Fission', ['decay-eq'], 'Split heavy nuclei to release enormous energy'],
    ['fusion', 'Nuclear Fusion', ['decay-eq'], 'Merge light nuclei at extreme temperatures'],
    ['mass-energy', 'Mass-Energy Equivalence', ['fission', 'fusion', 'math.algebra'], 'Calculate energy from mass using E = mc squared'],
    ['binding-energy', 'Binding Energy', ['mass-energy'], 'Calculate the energy holding a nucleus together'],
  ]),

  // ---- Relativity intro (8) ----
  ...topic('science.physics.relativity-intro', PHYS, 'innovator', [WS, OBS], [
    ['frames', 'Frames of Reference', ['science.physics.kinematics.relative'], 'Compare observations from different viewpoints'],
    ['galilean', 'Galilean Relativity', ['frames'], 'Add velocities in classical mechanics'],
    ['time-dilation', 'Time Dilation', ['frames', 'math.algebra'], 'Discover that moving clocks tick slower'],
    ['length-contraction', 'Length Contraction', ['time-dilation'], 'Discover that moving objects appear shorter'],
    ['light-speed', 'Speed of Light', ['time-dilation'], 'Nothing with mass can reach the speed of light'],
    ['twin-paradox', 'Twin Paradox', ['time-dilation'], 'Explore the puzzling age difference for space travellers'],
    ['gps-relativity', 'GPS and Relativity', ['time-dilation'], 'GPS satellites correct for relativistic time differences'],
    ['mass-energy-rel', 'Mass-Energy in Relativity', ['science.physics.nuclear.mass-energy'], 'Understand the full meaning of E = mc squared'],
  ]),

  // ---- Quantum basics (8) ----
  ...topic('science.physics.quantum-intro', PHYS, 'innovator', [WS], [
    ['photoelectric', 'Photoelectric Effect', ['science.physics.em-spectrum.visible', 'math.equations'], 'Light ejects electrons from metal only above a threshold frequency'],
    ['wave-particle', 'Wave-Particle Duality', ['photoelectric'], 'Light and matter behave as both waves and particles'],
    ['photon', 'Photons', ['photoelectric'], 'Light energy comes in discrete packets called photons'],
    ['de-broglie', 'de Broglie Wavelength', ['wave-particle', 'math.equations'], 'Every particle has an associated wavelength'],
    ['uncertainty', 'Uncertainty Principle', ['de-broglie'], 'Position and momentum cannot both be known precisely'],
    ['quantization', 'Energy Quantisation', ['photon'], 'Energy levels in atoms come in discrete steps'],
    ['bohr', 'Bohr Model', ['quantization', 'science.chemistry.atoms'], 'Electrons orbit in fixed energy levels around the nucleus'],
    ['quantum-numbers', 'Quantum Numbers Introduction', ['bohr'], 'Describe electron states with four quantum numbers'],
  ]),

  // ---- Oscillations and SHM (10) ----
  ...topic('science.physics.shm', PHYS, 'innovator', [WS], [
    ['intro', 'Simple Harmonic Motion', ['science.physics.kinematics.circular', 'math.trig.basics'], 'An object oscillates symmetrically about an equilibrium point'],
    ['spring-mass', 'Spring-Mass Systems', ['intro', 'science.physics.work-energy.elastic-pe'], 'Analyse a mass bouncing on a spring'],
    ['pendulum', 'Pendulum Physics', ['intro'], 'Calculate the period of a swinging pendulum'],
    ['energy-shm', 'Energy in SHM', ['spring-mass'], 'KE and PE trade back and forth during oscillation'],
    ['damping', 'Damped Oscillations', ['intro'], 'Watch amplitude decrease due to friction or resistance'],
    ['forced', 'Forced Oscillations', ['damping'], 'Drive a system with an external periodic force'],
    ['resonance-shm', 'Resonance in SHM', ['forced'], 'Maximum amplitude occurs when driving frequency matches natural frequency'],
    ['coupled', 'Coupled Oscillators', ['intro'], 'Two connected oscillators exchange energy back and forth'],
    ['natural-freq', 'Natural Frequency', ['intro', 'math.equations'], 'Calculate the frequency a system prefers to oscillate at'],
    ['phase-space', 'Phase Space Introduction', ['energy-shm', 'math.algebra'], 'Plot position vs momentum to visualise oscillatory systems'],
  ]),

  // ---- Statics and elasticity (10) ----
  ...topic('science.physics.statics', PHYS, 'innovator', [WS], [
    ['torque-eq', 'Torque Equilibrium', ['science.physics.rotation.torque'], 'Set net torque to zero for objects in rotational balance'],
    ['center-mass', 'Centre of Mass', ['torque-eq'], 'Find the balance point of an extended object'],
    ['stability', 'Stability', ['center-mass'], 'Relate base width and centre of mass to tipping tendency'],
    ['trusses', 'Trusses', ['science.physics.newton.free-body'], 'Analyse rigid frameworks of connected beams'],
    ['stress', 'Stress', ['science.physics.pressure', 'math.equations'], 'Calculate force per unit cross-section area'],
    ['strain', 'Strain', ['stress'], 'Calculate fractional change in length under load'],
    ['young', 'Young Modulus', ['stress', 'strain'], 'Measure material stiffness from the stress-strain ratio'],
    ['tensile', 'Tensile Strength', ['young'], 'Determine the maximum stress a material can withstand'],
    ['compression-mat', 'Compressive Strength', ['young'], 'Measure resistance to being crushed'],
    ['shear', 'Shear Forces', ['stress'], 'Analyse forces that slide layers of material past each other'],
  ]),

  // ---- Gravitation (10) ----
  ...topic('science.physics.gravitation', PHYS, 'innovator', [WS, OBS], [
    ['universal', 'Universal Gravitation', ['science.physics.gravity.what-is', 'math.calculus'], 'Every mass attracts every other mass with a calculable force'],
    ['grav-field', 'Gravitational Field Strength', ['universal'], 'Calculate the force per unit mass at any point'],
    ['orbital', 'Orbital Motion', ['universal', 'science.physics.kinematics.centripetal'], 'Derive the speed needed to orbit at a given height'],
    ['kepler', 'Kepler Laws', ['orbital'], 'Describe planetary orbits with three elegant laws'],
    ['escape-vel', 'Escape Velocity', ['orbital', 'science.physics.work-energy.conservation'], 'Calculate the speed needed to leave a gravitational well'],
    ['satellites', 'Satellite Orbits', ['kepler', 'math.equations'], 'Calculate orbital period and altitude for artificial satellites'],
    ['grav-pe', 'Gravitational PE Advanced', ['grav-field', 'math.calculus'], 'Calculate potential energy between two masses'],
    ['tides', 'Tides', ['universal'], 'Explain ocean tides through differential gravitational pull'],
    ['weightlessness', 'Weightlessness', ['orbital'], 'Understand free-fall as the sensation of zero weight'],
    ['black-holes-intro', 'Black Holes Introduction', ['escape-vel'], 'When escape velocity exceeds the speed of light'],
  ]),

  // ---- Fluid dynamics advanced (10) ----
  ...topic('science.physics.fluid-adv', PHYS, 'innovator', [WS], [
    ['reynolds', 'Reynolds Number', ['science.physics.fluid.flow-types', 'math.equations'], 'Predict laminar or turbulent flow from a dimensionless ratio'],
    ['drag', 'Drag Force', ['reynolds'], 'Calculate the resisting force on objects moving through fluid'],
    ['lift', 'Lift Force', ['science.physics.fluid.bernoulli-intro', 'math.trig.basics'], 'Explain how wings generate upward force'],
    ['aero-intro', 'Aerodynamics Introduction', ['drag', 'lift'], 'Shape objects to minimise drag and maximise lift'],
    ['boundary', 'Boundary Layer', ['reynolds'], 'Study the thin fluid layer closest to a surface'],
    ['pipe-flow', 'Pipe Flow', ['reynolds', 'science.physics.fluid.pressure-fluids'], 'Calculate flow rate and pressure drop in pipes'],
    ['venturi', 'Venturi Effect', ['science.physics.fluid.bernoulli-intro'], 'Measure flow speed from pressure differences in a constriction'],
    ['pitot', 'Pitot Tubes', ['venturi'], 'Measure aircraft speed from stagnation pressure'],
    ['continuity', 'Continuity Equation', ['pipe-flow', 'math.equations'], 'Mass flow rate stays constant along a streamline'],
    ['stokes', 'Stokes Law', ['drag', 'science.physics.fluid.viscosity'], 'Calculate drag on a small sphere falling through viscous fluid'],
  ]),

  // ---- Acoustics advanced (8) ----
  ...topic('science.physics.acoustics', PHYS, 'innovator', [WS], [
    ['harmonics', 'Harmonics', ['science.physics.wave-props.standing'], 'Identify whole-number multiples of the fundamental frequency'],
    ['overtones', 'Overtones', ['harmonics'], 'Hear higher-frequency vibrations that colour musical tone'],
    ['resonance-tubes', 'Resonance Tubes', ['harmonics'], 'Find resonant lengths for open and closed air columns'],
    ['doppler-app', 'Doppler Applications', ['science.physics.wave-adv.doppler'], 'Use frequency shifts to measure motion of stars and vehicles'],
    ['ultrasound', 'Ultrasound', ['harmonics'], 'Use very high-frequency sound for imaging and cleaning'],
    ['infrasound', 'Infrasound', ['harmonics'], 'Detect very low-frequency sound from earthquakes and whales'],
    ['acoustic-design', 'Acoustic Design', ['harmonics', 'science.physics.wave-adv.constructive'], 'Shape rooms for clear speech and rich music'],
    ['noise-control', 'Noise Control', ['science.physics.wave-adv.destructive'], 'Cancel unwanted sound with anti-noise technology'],
  ]),

  // ---- EM waves detail (8) ----
  ...topic('science.physics.em-waves', PHYS, 'innovator', [WS, OBS], [
    ['wave-eq-em', 'EM Wave Equation', ['science.physics.em.faraday', 'math.calculus'], 'Derive that oscillating electric and magnetic fields propagate together'],
    ['polarization-det', 'Polarisation Detail', ['science.physics.wave-adv.polarization'], 'Analyse linear, circular, and elliptical polarisation'],
    ['brewster', 'Brewster Angle', ['polarization-det', 'math.trig.basics'], 'Calculate the angle that produces perfectly polarised reflection'],
    ['malus', 'Malus Law', ['polarization-det', 'math.trig.basics'], 'Calculate intensity of polarised light through a filter'],
    ['scattering', 'Light Scattering', ['science.physics.em-spectrum.visible'], 'Explain why the sky is blue and sunsets are red'],
    ['rayleigh', 'Rayleigh Scattering', ['scattering', 'math.equations'], 'Calculate scattering intensity versus wavelength'],
    ['antenna', 'Antenna Basics', ['science.physics.em-spectrum.radio', 'science.physics.em.em-induction'], 'Convert EM waves to electrical signals and back'],
    ['radar', 'Radar Principles', ['antenna', 'science.physics.wave-adv.doppler'], 'Detect and range objects using reflected radio pulses'],
  ]),

  // ---- Modern physics applications (12) ----
  ...parallel('science.physics.modern-app', PHYS, 'innovator', [WS, OBS],
    ['science.physics.nuclear.radioactivity', 'science.physics.quantum-intro.photon'], [
    ['xray-imaging', 'X-Ray Imaging', 'Use X-rays to see inside the body'],
    ['mri-basics', 'MRI Basics', 'Use magnetic resonance to image soft tissue'],
    ['ultrasound-med', 'Medical Ultrasound', 'Image internal organs with high-frequency sound'],
    ['pet-scan', 'PET Scans', 'Detect gamma rays from positron-emitting tracers'],
    ['radiation-therapy', 'Radiation Therapy', 'Target cancer cells with focused radiation beams'],
    ['nuclear-power', 'Nuclear Power Stations', 'Generate electricity from controlled fission'],
    ['solar-cell', 'Solar Cells', 'Convert light directly into electricity with semiconductors'],
    ['led', 'LEDs', 'Produce light efficiently from semiconductor junctions'],
    ['laser-app', 'Laser Applications', 'Use coherent light in surgery, manufacturing, and communication'],
    ['mass-spec', 'Mass Spectrometry', 'Separate and identify atoms by mass using magnetic fields'],
    ['electron-micro', 'Electron Microscopy', 'Image tiny structures using electron beams instead of light'],
    ['superconductor-intro', 'Superconductors Introduction', 'Discover materials with zero electrical resistance at low temperatures'],
  ]),

  // ---- Lab instruments advanced (8) ----
  ...expand('science.physics.adv-instrument', PHYS, 'innovator', [WS],
    ['science.physics.lab.data', 'science.physics.circuits'],
    'Advanced Instrument: {item}', 'Operate and interpret data from a {item}', [
    ['oscilloscope', 'Oscilloscope'], ['spectrometer', 'Spectrometer'],
    ['geiger', 'Geiger Counter'], ['cloud-chamber', 'Cloud Chamber'],
    ['calorimeter', 'Calorimeter'], ['interferometer', 'Interferometer'],
    ['force-sensor', 'Force Sensor'], ['data-logger', 'Data Logger'],
  ]),
];

// ===========================================================================
// PHYSICS — CREATOR  (~200 skills)
// Advanced: Lagrangian/Hamiltonian, advanced thermo, Maxwell, relativity,
//           quantum mechanics, particle physics, astrophysics, plasma, condensed
// ===========================================================================

const physicsCreator: SkillNode[] = [

  // ---- Lagrangian and Hamiltonian (10) ----
  ...chain('science.physics.analytical', PHYS, 'creator', [WS], [
    ['lagrangian', 'Lagrangian Mechanics', 'Reformulate mechanics using kinetic minus potential energy'],
    ['euler-lagrange', 'Euler-Lagrange Equation', 'Derive equations of motion from the Lagrangian'],
    ['constraints', 'Constraints and Generalized Coordinates', 'Handle constrained systems elegantly'],
    ['noether', 'Noether Theorem', 'Connect symmetries to conservation laws'],
    ['hamiltonian', 'Hamiltonian Mechanics', 'Reformulate mechanics using total energy as the Hamiltonian'],
    ['hamilton-eq', 'Hamilton Equations', 'Solve pairs of first-order differential equations for motion'],
    ['phase-space-adv', 'Phase Space', 'Visualise all possible states of a mechanical system'],
    ['poisson', 'Poisson Brackets', 'Express time evolution using bracket notation'],
    ['canonical', 'Canonical Transformations', 'Change variables while preserving Hamiltonian structure'],
    ['action-principle', 'Principle of Least Action', 'Nature chooses the path that minimises the action integral'],
  ], ['science.physics.rotation.torque', 'math.calculus.derivatives', 'math.calculus.integrals']),

  // ---- Advanced thermodynamics (10) ----
  ...topic('science.physics.thermo-adv', PHYS, 'creator', [WS], [
    ['stat-mech', 'Statistical Mechanics', ['science.physics.thermo.kinetic-theory', 'math.probability.basic'], 'Derive thermodynamic properties from microscopic statistics'],
    ['boltzmann', 'Boltzmann Distribution', ['stat-mech'], 'Calculate the probability of particles having a given energy'],
    ['partition', 'Partition Functions', ['boltzmann', 'math.calculus'], 'Encode all thermodynamic info in a single mathematical function'],
    ['maxwell-speed', 'Maxwell Speed Distribution', ['boltzmann'], 'Calculate the distribution of molecular speeds in a gas'],
    ['bose-einstein', 'Bose-Einstein Statistics', ['partition'], 'Describe systems of identical bosons'],
    ['fermi-dirac', 'Fermi-Dirac Statistics', ['partition'], 'Describe systems of identical fermions'],
    ['phase-transitions', 'Phase Transitions', ['partition'], 'Classify and analyse sudden changes in material properties'],
    ['critical-point', 'Critical Point', ['phase-transitions'], 'Find where liquid and gas phases become indistinguishable'],
    ['irreversibility', 'Irreversibility', ['science.physics.thermo.entropy', 'math.calculus'], 'Quantify why natural processes run in one direction'],
    ['information-thermo', 'Information and Thermodynamics', ['irreversibility'], 'Connect entropy to information and computation'],
  ]),

  // ---- Maxwell equations (10) ----
  ...chain('science.physics.maxwell', PHYS, 'creator', [WS], [
    ['gauss-e', 'Gauss Law for Electricity', 'Electric flux through a closed surface equals enclosed charge'],
    ['gauss-m', 'Gauss Law for Magnetism', 'Magnetic flux through a closed surface is always zero'],
    ['faraday-full', 'Faraday Law (Full Form)', 'A changing magnetic field induces a curling electric field'],
    ['ampere-maxwell', 'Ampere-Maxwell Law', 'Current and changing electric fields produce magnetic fields'],
    ['em-wave-derivation', 'EM Wave Derivation', 'Derive electromagnetic waves from the four equations'],
    ['poynting', 'Poynting Vector', 'Calculate energy flow carried by electromagnetic waves'],
    ['wave-solutions', 'Plane Wave Solutions', 'Solve Maxwell equations for plane electromagnetic waves'],
    ['boundary-em', 'Boundary Conditions', 'Match fields at interfaces between different media'],
    ['waveguides', 'Waveguides', 'Confine and guide electromagnetic waves through structures'],
    ['radiation-em', 'Electromagnetic Radiation', 'Accelerating charges radiate electromagnetic energy'],
  ], ['science.physics.em.faraday', 'science.physics.em.electric-field', 'math.calculus.integrals']),

  // ---- Special relativity (10) ----
  ...topic('science.physics.special-rel', PHYS, 'creator', [WS, OBS], [
    ['postulates', 'Postulates of Special Relativity', ['science.physics.relativity-intro.light-speed', 'math.linear-algebra'], 'Physics laws are the same in all inertial frames; light speed is constant'],
    ['lorentz', 'Lorentz Transformations', ['postulates'], 'Transform space and time coordinates between moving frames'],
    ['spacetime', 'Spacetime', ['lorentz'], 'Merge space and time into a four-dimensional continuum'],
    ['four-vectors', 'Four-Vectors', ['spacetime', 'math.linear-algebra'], 'Represent physical quantities as vectors in spacetime'],
    ['relativistic-mom', 'Relativistic Momentum', ['four-vectors'], 'Momentum increases without bound as speed approaches c'],
    ['relativistic-energy', 'Relativistic Energy', ['relativistic-mom'], 'Total energy includes rest mass energy and kinetic energy'],
    ['invariants', 'Lorentz Invariants', ['four-vectors'], 'Identify quantities that remain unchanged between frames'],
    ['simultaneity', 'Relativity of Simultaneity', ['lorentz'], 'Events simultaneous in one frame may not be in another'],
    ['minkowski', 'Minkowski Diagrams', ['spacetime'], 'Visualise spacetime events on lightcone diagrams'],
    ['paradoxes', 'Relativistic Paradoxes', ['simultaneity'], 'Resolve apparent contradictions in special relativity'],
  ]),

  // ---- General relativity (8) ----
  ...topic('science.physics.general-rel', PHYS, 'creator', [WS, OBS], [
    ['equiv-principle', 'Equivalence Principle', ['science.physics.special-rel.postulates'], 'Gravity and acceleration are locally indistinguishable'],
    ['curved-space', 'Curved Spacetime', ['equiv-principle', 'math.linear-algebra'], 'Mass and energy curve the fabric of spacetime'],
    ['geodesics', 'Geodesics', ['curved-space'], 'Objects follow the straightest paths through curved spacetime'],
    ['schwarzschild', 'Schwarzschild Solution', ['geodesics'], 'Solve Einstein equations for a spherical mass'],
    ['gravitational-waves', 'Gravitational Waves', ['curved-space'], 'Detect ripples in spacetime from merging black holes'],
    ['black-holes', 'Black Holes', ['schwarzschild'], 'Study regions where spacetime curvature becomes extreme'],
    ['cosmological', 'Cosmological Solutions', ['curved-space'], 'Apply general relativity to the expanding universe'],
    ['grav-lensing', 'Gravitational Lensing', ['geodesics'], 'Light bends around massive objects acting as cosmic lenses'],
  ]),

  // ---- Quantum mechanics (14) ----
  ...topic('science.physics.quantum', PHYS, 'creator', [WS], [
    ['schrodinger', 'Schrodinger Equation', ['science.physics.quantum-intro.de-broglie', 'math.calculus'], 'The fundamental equation governing quantum states'],
    ['wave-function', 'Wave Functions', ['schrodinger'], 'Describe quantum states as complex probability amplitudes'],
    ['probability', 'Probability Interpretation', ['wave-function', 'math.probability.basic'], 'The square of the wave function gives detection probability'],
    ['infinite-well', 'Particle in a Box', ['schrodinger'], 'Solve for quantised energy levels in an infinite potential well'],
    ['harmonic-osc', 'Quantum Harmonic Oscillator', ['infinite-well'], 'Solve the oscillator with equally spaced energy levels'],
    ['hydrogen', 'Hydrogen Atom', ['schrodinger', 'science.physics.quantum-intro.quantum-numbers'], 'Solve the full quantum model of the simplest atom'],
    ['spin', 'Quantum Spin', ['hydrogen'], 'Intrinsic angular momentum with no classical analogue'],
    ['pauli', 'Pauli Exclusion Principle', ['spin'], 'No two identical fermions can share the same quantum state'],
    ['tunnelling', 'Quantum Tunnelling', ['wave-function'], 'Particles penetrate barriers that classical physics forbids'],
    ['entanglement', 'Quantum Entanglement', ['wave-function'], 'Measuring one particle instantly determines its entangled partner'],
    ['superposition-q', 'Quantum Superposition', ['wave-function'], 'Particles exist in multiple states until measured'],
    ['measurement', 'Measurement Problem', ['superposition-q'], 'Measurement collapses a superposition into a definite state'],
    ['perturbation', 'Perturbation Theory', ['hydrogen', 'math.linear-algebra'], 'Approximate solutions to nearly-solvable quantum problems'],
    ['variational', 'Variational Method', ['hydrogen', 'math.calculus'], 'Find approximate ground states by minimising energy'],
  ]),

  // ---- Particle physics (12) ----
  ...topic('science.physics.particles', PHYS, 'creator', [WS], [
    ['standard-model', 'Standard Model Overview', ['science.physics.quantum.spin', 'science.physics.nuclear.binding-energy'], 'Survey the fundamental particles and forces of nature'],
    ['quarks', 'Quarks', ['standard-model'], 'Discover six flavours of quarks that build protons and neutrons'],
    ['leptons', 'Leptons', ['standard-model'], 'Identify electrons, muons, taus, and their neutrinos'],
    ['bosons', 'Gauge Bosons', ['standard-model'], 'Meet the force-carrying particles: photon, W, Z, gluon'],
    ['higgs', 'Higgs Boson', ['bosons'], 'Understand the particle that gives others mass'],
    ['strong-force', 'Strong Nuclear Force', ['quarks'], 'The force that binds quarks into protons and neutrons'],
    ['weak-force', 'Weak Nuclear Force', ['leptons', 'bosons'], 'The force responsible for radioactive beta decay'],
    ['antimatter', 'Antimatter', ['standard-model'], 'Every particle has an opposite-charge antiparticle'],
    ['conservation-laws', 'Conservation Laws in Particles', ['quarks', 'leptons'], 'Charge, lepton number, and baryon number are always conserved'],
    ['accelerators', 'Particle Accelerators', ['standard-model'], 'Collide particles at extreme energies to study fundamental physics'],
    ['feynman', 'Feynman Diagrams', ['bosons', 'math.linear-algebra'], 'Draw particle interactions as spacetime diagrams'],
    ['beyond-standard', 'Beyond the Standard Model', ['higgs'], 'Explore open questions: dark matter, neutrino mass, unification'],
  ]),

  // ---- Astrophysics (12) ----
  ...topic('science.physics.astrophysics', PHYS, 'creator', [OBS], [
    ['stellar-struct', 'Stellar Structure', ['science.physics.thermo-adv.stat-mech', 'science.physics.nuclear.fusion'], 'Model the interior of a star in hydrostatic equilibrium'],
    ['hr-diagram', 'HR Diagram', ['stellar-struct'], 'Classify stars by luminosity and temperature'],
    ['stellar-evolution', 'Stellar Evolution', ['hr-diagram'], 'Trace the life cycle from nebula to remnant'],
    ['white-dwarfs', 'White Dwarfs', ['stellar-evolution'], 'Study dense stellar remnants supported by electron pressure'],
    ['neutron-stars', 'Neutron Stars', ['stellar-evolution'], 'Study ultra-dense remnants with extreme magnetic fields'],
    ['supernovae', 'Supernovae', ['stellar-evolution'], 'Witness the explosive death of massive stars'],
    ['big-bang', 'Big Bang Theory', ['science.physics.general-rel.cosmological'], 'Trace the universe back to a hot, dense origin'],
    ['cmb', 'Cosmic Microwave Background', ['big-bang'], 'Detect the afterglow radiation from the early universe'],
    ['dark-matter', 'Dark Matter', ['big-bang'], 'Infer invisible mass from galactic rotation curves'],
    ['dark-energy', 'Dark Energy', ['big-bang'], 'Discover the mysterious force accelerating cosmic expansion'],
    ['galaxy-formation', 'Galaxy Formation', ['big-bang', 'science.physics.gravitation.universal'], 'Model how galaxies assembled from primordial fluctuations'],
    ['exoplanets', 'Exoplanet Detection', ['stellar-struct'], 'Find planets around other stars using transit and radial velocity'],
  ]),

  // ---- Plasma physics (8) ----
  ...topic('science.physics.plasma', PHYS, 'creator', [WS, OBS], [
    ['intro', 'Plasma Introduction', ['science.physics.em.electric-field', 'science.physics.thermo.kinetic-theory'], 'Study the fourth state of matter: ionised gas'],
    ['debye', 'Debye Shielding', ['intro', 'math.calculus'], 'Calculate how plasmas screen electric fields'],
    ['plasma-freq', 'Plasma Frequency', ['debye'], 'Find the natural oscillation frequency of electrons in plasma'],
    ['mhd', 'Magnetohydrodynamics', ['intro', 'science.physics.fluid-adv.continuity'], 'Model plasma as an electrically conducting fluid'],
    ['fusion-plasma', 'Fusion Plasmas', ['mhd'], 'Confine superhot plasma to achieve controlled fusion'],
    ['tokamak', 'Tokamak Design', ['fusion-plasma'], 'Use toroidal magnetic fields to contain fusion plasma'],
    ['space-plasma', 'Space Plasmas', ['mhd'], 'Study the solar wind and magnetospheric plasmas'],
    ['plasma-app', 'Plasma Applications', ['intro'], 'Apply plasma physics in displays, etching, and lighting'],
  ]),

  // ---- Condensed matter (8) ----
  ...topic('science.physics.condensed', PHYS, 'creator', [WS], [
    ['crystal', 'Crystal Structure', ['science.physics.quantum.pauli', 'math.linear-algebra'], 'Describe solids as repeating lattices of atoms'],
    ['band-theory', 'Band Theory', ['crystal'], 'Explain conductors, insulators, and semiconductors with energy bands'],
    ['semiconductors-adv', 'Semiconductors Advanced', ['band-theory'], 'Engineer materials for transistors and solar cells'],
    ['superconductors', 'Superconductivity', ['band-theory'], 'Study zero-resistance states and their quantum origins'],
    ['magnetism-cond', 'Magnetism in Solids', ['crystal'], 'Explain ferromagnetism, antiferromagnetism, and ferrimagnetism'],
    ['phonons', 'Phonons', ['crystal'], 'Quantise lattice vibrations as phonon quasiparticles'],
    ['topological', 'Topological Materials', ['band-theory'], 'Discover materials with exotic surface states protected by topology'],
    ['nanoscale', 'Nanoscale Physics', ['crystal'], 'Explore quantum effects that emerge at the nanometre scale'],
  ]),

  // ---- Computational physics (8) ----
  ...topic('science.physics.comp-phys', PHYS, 'creator', [WS], [
    ['numerical', 'Numerical Methods', ['math.calculus', 'science.physics.newton.fma'], 'Solve physics problems that resist analytical solutions'],
    ['monte-carlo', 'Monte Carlo Simulation', ['numerical', 'math.probability.basic'], 'Use random sampling to estimate physical quantities'],
    ['molecular-dyn', 'Molecular Dynamics', ['numerical', 'science.physics.thermo-adv.stat-mech'], 'Simulate many-particle systems step by step'],
    ['finite-element', 'Finite Element Methods', ['numerical'], 'Divide complex structures into small elements to solve PDEs'],
    ['n-body', 'N-Body Simulations', ['molecular-dyn', 'science.physics.gravitation.universal'], 'Simulate gravitational interactions among many objects'],
    ['fluid-sim', 'Computational Fluid Dynamics', ['numerical', 'science.physics.fluid-adv.continuity'], 'Simulate fluid flow on a discrete grid'],
    ['quantum-computing', 'Quantum Computing Introduction', ['science.physics.quantum.superposition-q'], 'Use quantum bits to solve problems faster than classical computers'],
    ['visualization', 'Physics Visualisation', ['numerical'], 'Render simulations as animations and interactive plots'],
  ]),

  // ---- Biophysics (8) ----
  ...topic('science.physics.biophysics', PHYS, 'creator', [WS, FOR], [
    ['intro', 'Biophysics Introduction', ['science.physics.thermo.free-energy'], 'Apply physics principles to biological systems'],
    ['biomechanics', 'Biomechanics', ['intro', 'science.physics.statics.stress'], 'Analyse forces in bones, muscles, and joints'],
    ['membrane', 'Membrane Biophysics', ['intro'], 'Model ion transport across cell membranes'],
    ['protein-folding', 'Protein Folding Physics', ['intro', 'science.physics.thermo-adv.stat-mech'], 'Understand how proteins find their minimum-energy shape'],
    ['neural-physics', 'Neural Signal Physics', ['membrane'], 'Model action potentials as electrical pulses along neurons'],
    ['photosynthesis-phys', 'Photosynthesis Physics', ['science.physics.quantum-intro.photon'], 'Trace quantum efficiency in light-harvesting complexes'],
    ['dna-mechanics', 'DNA Mechanics', ['biomechanics'], 'Study the twisting and stretching of DNA molecules'],
    ['imaging-phys', 'Biophysical Imaging', ['intro'], 'Apply physics to MRI, PET, ultrasound, and optical imaging'],
  ]),

  // ---- Quantum field theory intro (8) ----
  ...chain('science.physics.qft', PHYS, 'creator', [WS], [
    ['classical-field', 'Classical Field Theory', 'Extend Lagrangian mechanics to continuous fields'],
    ['quantize-fields', 'Field Quantisation', 'Promote classical fields to quantum operators'],
    ['creation-annihilation', 'Creation and Annihilation', 'Describe particles appearing and disappearing in quantum fields'],
    ['vacuum', 'Quantum Vacuum', 'Discover that empty space seethes with virtual particles'],
    ['qed-intro', 'QED Introduction', 'Quantum electrodynamics: the quantum theory of light and charge'],
    ['renormalization', 'Renormalisation', 'Tame infinities by absorbing them into measured quantities'],
    ['qcd-intro', 'QCD Introduction', 'Quantum chromodynamics: the quantum theory of the strong force'],
    ['symmetry-breaking', 'Symmetry Breaking', 'Understand how hidden symmetries give rise to particle masses'],
  ], ['science.physics.quantum.perturbation', 'science.physics.particles.feynman']),

  // ---- Capstone projects (8) ----
  ...parallel('science.physics.capstone', PHYS, 'creator', [WS, OBS],
    ['science.physics.analytical.lagrangian', 'science.physics.quantum.schrodinger'], [
    ['research-project', 'Physics Research Project', 'Conduct original research investigating an open problem'],
    ['simulation-project', 'Simulation Project', 'Build a computational model of a complex physical system'],
    ['experimental', 'Experimental Project', 'Design and execute a novel experiment with full error analysis'],
    ['theory-paper', 'Theory Paper', 'Derive new results and write a formal physics paper'],
    ['instrument-design', 'Instrument Design', 'Engineer a new measurement device for a specific purpose'],
    ['interdisciplinary', 'Interdisciplinary Project', 'Apply physics to solve a problem in another field'],
    ['outreach', 'Physics Outreach', 'Create materials that explain advanced physics to the public'],
    ['review-paper', 'Literature Review', 'Survey and synthesise current research on a physics topic'],
  ]),
];

// ===========================================================================
// CHEMISTRY — FOUNDATION  (~40 skills)
// Ages 2-5: Matter/materials, mixing/separating, dissolving, states, hot/cold
// ===========================================================================

const chemFoundation: SkillNode[] = [

  // ---- Matter and materials (8) ----
  ...topic('science.chem.materials', CHEM, 'foundation', [ALC, WS], [
    ['what-is-material', 'What Are Materials', ['science.matter'], 'Everything is made from different materials'],
    ['types', 'Types of Materials', ['what-is-material'], 'Identify wood, metal, plastic, glass, fabric, and paper'],
    ['properties', 'Material Properties', ['types', 'science.sorting'], 'Describe hard, soft, rough, smooth, shiny, and dull'],
    ['choosing', 'Choosing Materials', ['properties'], 'Pick the best material for a job'],
    ['natural', 'Natural Materials', ['types'], 'Identify materials that come from plants, animals, or the ground'],
    ['manufactured', 'Manufactured Materials', ['types'], 'Identify materials made by people in factories'],
    ['waterproof', 'Waterproof Materials', ['properties'], 'Test which materials keep water out'],
    ['flexible-rigid', 'Flexible and Rigid', ['properties'], 'Sort materials by whether they bend or stay stiff'],
  ]),

  // ---- Mixing and separating (6) ----
  ...topic('science.chem.mixing', CHEM, 'foundation', [ALC], [
    ['mix', 'Mixing Things', ['science.matter'], 'Combine materials and observe what happens'],
    ['stir', 'Stirring', ['mix'], 'Use stirring to help things mix together'],
    ['filter', 'Simple Filtering', ['mix'], 'Pour a mixture through a sieve to separate big from small'],
    ['sieve', 'Sieving', ['filter'], 'Use different-sized sieves to sort mixtures'],
    ['magnet-sep', 'Magnet Separation', ['mix', 'science.phys.magnets-intro.attract'], 'Pull magnetic objects out of a mixture with a magnet'],
    ['evaporate', 'Evaporation', ['mix', 'science.phys.matter.boiling'], 'Leave a liquid mixture in the sun and watch the water disappear'],
  ]),

  // ---- Dissolving (5) ----
  ...topic('science.chem.dissolving', CHEM, 'foundation', [ALC], [
    ['what-dissolves', 'What Dissolves', ['science.chem.mixing.mix'], 'Add sugar, salt, and sand to water and see what disappears'],
    ['temperature', 'Temperature and Dissolving', ['what-dissolves', 'science.phys.matter.melting'], 'Warm water dissolves things faster than cold water'],
    ['stirring', 'Stirring and Dissolving', ['what-dissolves'], 'Stirring speeds up dissolving'],
    ['saturation', 'Full Up', ['what-dissolves'], 'Discover that water can only hold so much dissolved stuff'],
    ['recover', 'Getting It Back', ['what-dissolves', 'science.chem.mixing.evaporate'], 'Evaporate water to recover dissolved salt or sugar'],
  ]),

  // ---- States of matter changes (6) ----
  ...topic('science.chem.state-changes', CHEM, 'foundation', [ALC, WS], [
    ['heat-change', 'Heating Changes Things', ['science.phys.matter.melting'], 'Heat can change a material from one state to another'],
    ['cool-change', 'Cooling Changes Things', ['science.phys.matter.freezing'], 'Cooling can reverse some changes made by heat'],
    ['reversible', 'Reversible Changes', ['heat-change', 'cool-change'], 'Melting ice and freezing water switch back and forth'],
    ['irreversible', 'Irreversible Changes', ['heat-change'], 'Cooking an egg changes it forever: you cannot uncook it'],
    ['cooking', 'Cooking Changes', ['irreversible'], 'Heat transforms raw food into cooked food permanently'],
    ['burning', 'Burning', ['irreversible', 'science.safety'], 'Fire changes materials into ash, smoke, and new substances'],
  ]),

  // ---- Hot and cold (5) ----
  ...topic('science.chem.hot-cold', CHEM, 'foundation', [ALC, WS], [
    ['hot-things', 'Hot Things', ['science.observation'], 'Identify things that feel hot and why we must be careful'],
    ['cold-things', 'Cold Things', ['science.observation'], 'Identify things that feel cold'],
    ['warming', 'Warming Up', ['hot-things', 'science.phys.matter.melting'], 'Observe materials warming and changing'],
    ['cooling-down', 'Cooling Down', ['cold-things', 'science.phys.matter.freezing'], 'Observe materials cooling and changing'],
    ['thermometer-read', 'Reading a Thermometer', ['warming', 'cooling-down', 'math.counting'], 'Use a thermometer to tell how hot or cold something is'],
  ]),

  // ---- Cooking science (6) ----
  ...topic('science.chem.cooking', CHEM, 'foundation', [ALC], [
    ['ingredients', 'Ingredients', ['science.chem.materials.types'], 'Identify different cooking ingredients and their origins'],
    ['mixing-food', 'Mixing Ingredients', ['ingredients', 'science.chem.mixing.stir'], 'Combine ingredients and observe how mixtures change'],
    ['heating-food', 'Heating Food', ['ingredients', 'science.chem.state-changes.cooking'], 'Observe bread rising, eggs setting, and butter melting'],
    ['cooling-food', 'Cooling Food', ['heating-food'], 'Watch jelly set and chocolate harden when cooled'],
    ['food-changes', 'Food Changes', ['heating-food', 'cooling-food'], 'Decide which cooking changes are reversible or not'],
    ['food-safety-chem', 'Kitchen Safety', ['science.safety'], 'Follow safety rules in the kitchen laboratory'],
  ]),
];

// ===========================================================================
// CHEMISTRY — DISCOVERY  (~120 skills)
// Grades K-2: Atoms intro, elements, periodic table basics, molecules,
//             mixtures vs compounds, chemical vs physical, acids/bases, gases
// ===========================================================================

const chemDiscovery: SkillNode[] = [

  // ---- Preserved entry-point skills ----
  skill('science.chemistry.atoms', 'Atoms', CHEM, 'discovery',
    ['science.matter', 'science.phys.matter.properties'],
    'Discover that all matter is made of tiny particles called atoms', [ALC, WS]),

  // ---- Atoms intro (10) ----
  ...topic('science.chem.atoms', CHEM, 'discovery', [ALC], [
    ['tiny', 'Atoms Are Tiny', ['science.chemistry.atoms'], 'Understand that atoms are too small to see with any ordinary microscope'],
    ['building-blocks', 'Building Blocks', ['science.chemistry.atoms'], 'Everything is built from about 100 types of atoms'],
    ['proton', 'Protons', ['tiny'], 'Find positive particles in the centre of an atom'],
    ['neutron', 'Neutrons', ['tiny'], 'Find neutral particles alongside protons in the nucleus'],
    ['electron', 'Electrons', ['tiny'], 'Find tiny negative particles orbiting the nucleus'],
    ['nucleus', 'The Nucleus', ['proton', 'neutron'], 'Protons and neutrons are packed tightly in the atom centre'],
    ['atomic-number', 'Atomic Number', ['proton', 'math.counting'], 'Count protons to identify which element an atom is'],
    ['mass-number', 'Mass Number', ['proton', 'neutron', 'math.addition'], 'Add protons and neutrons to get the mass number'],
    ['isotopes', 'Isotopes', ['mass-number'], 'Same element, different numbers of neutrons'],
    ['electron-shells', 'Electron Shells', ['electron', 'nucleus'], 'Electrons arrange themselves in layers around the nucleus'],
  ]),

  // ---- Elements (10) ----
  ...topic('science.chem.elements', CHEM, 'discovery', [ALC], [
    ['what-is-element', 'What Is an Element', ['science.chemistry.atoms'], 'A pure substance made of only one type of atom'],
    ['common', 'Common Elements', ['what-is-element'], 'Meet hydrogen, oxygen, carbon, nitrogen, and iron'],
    ['symbols', 'Element Symbols', ['common', 'language.reading'], 'Read one- and two-letter symbols like H, O, C, Fe'],
    ['metals', 'Metals Introduction', ['common'], 'Identify shiny, strong materials that conduct heat and electricity'],
    ['nonmetals', 'Non-Metals Introduction', ['common'], 'Identify gases and dull solids that do not conduct'],
    ['metalloids', 'Metalloids', ['metals', 'nonmetals'], 'Find elements with properties of both metals and non-metals'],
    ['native', 'Elements in Nature', ['common'], 'Find gold, copper, sulphur, and diamond occurring naturally'],
    ['abundance', 'Element Abundance', ['common', 'math.number-comparison'], 'Learn which elements are most common on Earth'],
    ['uses', 'Element Uses', ['common'], 'Match elements to their everyday uses'],
    ['element-game', 'Element Guessing Game', ['symbols', 'uses'], 'Identify elements from clues about their properties'],
  ]),

  // ---- Periodic table basics (10) ----
  ...topic('science.chem.periodic', CHEM, 'discovery', [ALC], [
    ['what-is', 'What Is the Periodic Table', ['science.chem.elements.what-is-element'], 'A map organising all known elements by properties'],
    ['periods', 'Periods', ['what-is', 'science.chem.atoms.electron-shells'], 'Rows correspond to the number of electron shells'],
    ['groups', 'Groups', ['what-is'], 'Columns group elements with similar behaviour'],
    ['group1', 'Group 1: Alkali Metals', ['groups'], 'Soft, reactive metals that fizz in water'],
    ['group7', 'Group 7: Halogens', ['groups'], 'Reactive non-metals that form salts with metals'],
    ['group0', 'Group 0: Noble Gases', ['groups'], 'Unreactive gases with full outer electron shells'],
    ['transitions', 'Transition Metals', ['groups'], 'Strong, dense metals in the middle of the table'],
    ['trends', 'Periodic Trends', ['periods', 'groups'], 'Properties change in predictable patterns across the table'],
    ['reading', 'Reading the Table', ['what-is', 'science.chem.atoms.atomic-number'], 'Find atomic number, symbol, and mass for any element'],
    ['predict', 'Predicting Properties', ['trends'], 'Use position in the table to guess an unknown element behavior'],
  ]),

  // ---- Molecules (8) ----
  ...topic('science.chem.molecules', CHEM, 'discovery', [ALC], [
    ['what-is', 'What Is a Molecule', ['science.chemistry.atoms'], 'Two or more atoms joined together'],
    ['water', 'Water Molecule', ['what-is'], 'Two hydrogen atoms bonded to one oxygen atom: H2O'],
    ['oxygen-mol', 'Oxygen Molecule', ['what-is'], 'Two oxygen atoms bonded together: O2'],
    ['carbon-dioxide', 'Carbon Dioxide', ['what-is'], 'One carbon and two oxygens: CO2'],
    ['models', 'Molecular Models', ['what-is'], 'Build ball-and-stick models to see molecular shapes'],
    ['formulas', 'Chemical Formulas', ['models', 'science.chem.elements.symbols'], 'Read and write formulas like H2O and NaCl'],
    ['naming', 'Naming Compounds', ['formulas'], 'Follow naming rules to identify chemical compounds'],
    ['bonding-intro', 'Bonding Introduction', ['what-is'], 'Atoms share or transfer electrons to stick together'],
  ]),

  // ---- Mixtures vs compounds (8) ----
  ...topic('science.chem.mix-comp', CHEM, 'discovery', [ALC], [
    ['mixture', 'What Is a Mixture', ['science.chem.mixing.mix'], 'Two or more substances physically combined'],
    ['compound', 'What Is a Compound', ['science.chem.molecules.what-is'], 'Atoms chemically joined in fixed proportions'],
    ['difference', 'Mixture vs Compound', ['mixture', 'compound'], 'Mixtures separate easily; compounds need chemical reactions'],
    ['solutions', 'Solutions', ['mixture', 'science.chem.dissolving.what-dissolves'], 'A special mixture where one substance dissolves in another'],
    ['alloys', 'Alloys', ['mixture', 'science.chem.elements.metals'], 'Mix metals together to make stronger materials'],
    ['suspensions', 'Suspensions', ['mixture'], 'Tiny solid particles floating in a liquid'],
    ['colloids', 'Colloids', ['suspensions'], 'Particles too small to settle but too big to dissolve: milk, fog'],
    ['separating', 'Separating Mixtures', ['mixture', 'science.chem.mixing.filter'], 'Use filtration, evaporation, and distillation to unmix'],
  ]),

  // ---- Chemical vs physical changes (8) ----
  ...topic('science.chem.changes', CHEM, 'discovery', [ALC], [
    ['physical', 'Physical Changes', ['science.chem.state-changes.reversible'], 'No new substance forms: cutting, crushing, melting'],
    ['chemical', 'Chemical Changes', ['science.chem.state-changes.irreversible'], 'New substances form: burning, rusting, cooking'],
    ['signs', 'Signs of Chemical Change', ['chemical'], 'Look for colour change, gas bubbles, heat, light, or smell'],
    ['energy-changes', 'Energy in Changes', ['chemical'], 'Some reactions release heat; others absorb it'],
    ['rusting', 'Rusting', ['chemical', 'science.chem.elements.metals'], 'Iron reacts with oxygen and water to form rust'],
    ['combustion-intro', 'Combustion Introduction', ['chemical'], 'Fuels react with oxygen, releasing heat and light'],
    ['decomposition-intro', 'Decomposition Introduction', ['chemical'], 'Some substances break down when heated'],
    ['conservation-mass', 'Conservation of Mass', ['chemical', 'math.measurement.weight'], 'Total mass stays the same before and after a reaction'],
  ]),

  // ---- Acids and bases intro (8) ----
  ...topic('science.chem.acids-intro', CHEM, 'discovery', [ALC], [
    ['sour-bitter', 'Sour and Bitter', ['science.phys.senses.taste'], 'Acids taste sour; bases taste bitter'],
    ['indicators', 'Indicators', ['sour-bitter'], 'Use red cabbage juice to test for acids and bases'],
    ['common-acids', 'Common Acids', ['indicators'], 'Find acids in lemon juice, vinegar, and fizzy drinks'],
    ['common-bases', 'Common Bases', ['indicators'], 'Find bases in soap, baking soda, and bleach'],
    ['neutral', 'Neutral Substances', ['common-acids', 'common-bases'], 'Water and salt are neither acidic nor basic'],
    ['litmus', 'Litmus Paper', ['indicators'], 'Red litmus turns blue in a base; blue turns red in acid'],
    ['safety-acids', 'Acid and Base Safety', ['common-acids', 'science.safety'], 'Handle acids and bases safely with gloves and goggles'],
    ['mixing-acid-base', 'Mixing Acids and Bases', ['common-acids', 'common-bases'], 'An acid plus a base produces a neutral solution and heat'],
  ]),

  // ---- Gases (8) ----
  ...topic('science.chem.gases', CHEM, 'discovery', [ALC], [
    ['air', 'Air Is a Mixture', ['science.phys.matter.gas', 'science.chem.mix-comp.mixture'], 'Air contains nitrogen, oxygen, carbon dioxide, and more'],
    ['oxygen-gas', 'Oxygen', ['air'], 'The gas we breathe and that fuels fire'],
    ['carbon-dioxide-gas', 'Carbon Dioxide', ['air'], 'The gas we breathe out and that plants absorb'],
    ['nitrogen-gas', 'Nitrogen', ['air'], 'The most abundant gas in our atmosphere'],
    ['gas-properties', 'Gas Properties', ['air'], 'Gases fill their container, can be compressed, and are light'],
    ['collecting', 'Collecting Gases', ['gas-properties', 'science.tools'], 'Trap gases over water or in upturned containers'],
    ['testing', 'Gas Tests', ['collecting'], 'Test oxygen with a glowing splint and CO2 with limewater'],
    ['gas-production', 'Making Gases', ['testing', 'science.chem.changes.chemical'], 'Generate gases from chemical reactions in the lab'],
  ]),

  // ---- Solutions detail (8) ----
  ...topic('science.chem.solutions-disc', CHEM, 'discovery', [ALC], [
    ['solute', 'Solute', ['science.chem.mix-comp.solutions'], 'The substance that dissolves in the solvent'],
    ['solvent', 'Solvent', ['science.chem.mix-comp.solutions'], 'The liquid that does the dissolving, often water'],
    ['concentration', 'Concentration Introduction', ['solute', 'solvent'], 'More solute means a more concentrated solution'],
    ['dilute', 'Dilute and Concentrated', ['concentration'], 'Compare weak and strong solutions of the same substance'],
    ['solubility', 'Solubility', ['concentration', 'math.measurement.weight'], 'Measure how much solute dissolves at a given temperature'],
    ['temp-solubility', 'Temperature and Solubility', ['solubility', 'math.measurement.temperature'], 'Most solids dissolve more in hotter water'],
    ['crystallisation', 'Crystallisation', ['solubility'], 'Grow crystals by slowly evaporating a saturated solution'],
    ['distillation-intro', 'Distillation Introduction', ['solvent'], 'Boil a solution and condense the vapour to separate solvent'],
  ]),

  // ---- Lab safety and techniques (8) ----
  ...chain('science.chem.lab-safety', CHEM, 'discovery', [ALC], [
    ['hazard-symbols', 'Hazard Symbols', 'Read warning symbols on chemical containers'],
    ['ppe', 'Personal Protective Equipment', 'Wear goggles, gloves, and lab coat before starting'],
    ['bunsen', 'Bunsen Burner', 'Light, adjust, and extinguish a Bunsen burner safely'],
    ['measuring', 'Measuring Chemicals', 'Weigh solids and measure liquids accurately'],
    ['heating', 'Heating Safely', 'Heat test tubes and beakers without cracking them'],
    ['disposal', 'Safe Disposal', 'Dispose of waste chemicals following lab rules'],
    ['spill', 'Spill Procedures', 'Clean up chemical spills quickly and safely'],
    ['recording-lab', 'Recording Results', 'Write clear observations in a lab notebook'],
  ], ['science.safety', 'science.recording']),

  // ---- Common elements expand (14) ----
  ...expand('science.chem.element', CHEM, 'discovery', [ALC],
    ['science.chem.elements.common', 'science.chem.elements.symbols'],
    'Element: {item}', 'Explore the properties and uses of {item}', [
    ['hydrogen', 'Hydrogen'], ['helium', 'Helium'], ['carbon', 'Carbon'],
    ['nitrogen', 'Nitrogen'], ['oxygen-elem', 'Oxygen'], ['sodium', 'Sodium'],
    ['magnesium', 'Magnesium'], ['aluminium', 'Aluminium'], ['silicon', 'Silicon'],
    ['chlorine', 'Chlorine'], ['iron', 'Iron'], ['copper', 'Copper'],
    ['silver', 'Silver'], ['gold', 'Gold'],
  ]),
];

// ===========================================================================
// CHEMISTRY — BUILDER  (~180 skills)
// Grades 3-5: Atomic structure, bonding, equations, stoichiometry, reaction
//             types, acids/bases/pH, solutions, gas laws, energy in reactions
// ===========================================================================

const chemBuilder: SkillNode[] = [

  // ---- Preserved entry-point skills ----
  skill('science.chemistry.reactions', 'Chemical Reactions', CHEM, 'builder',
    ['science.chem.changes.chemical', 'science.chem.changes.conservation-mass', 'math.algebra'],
    'Understand and represent chemical reactions with balanced equations', [ALC]),

  // ---- Atomic structure (12) ----
  ...topic('science.chem.atomic', CHEM, 'builder', [ALC], [
    ['electron-config', 'Electron Configuration', ['science.chem.atoms.electron-shells', 'math.patterns'], 'Fill electron shells using the 2-8-8 rule'],
    ['valence', 'Valence Electrons', ['electron-config'], 'Count the electrons in the outermost shell'],
    ['octet', 'Octet Rule', ['valence'], 'Atoms want eight electrons in their outer shell'],
    ['ions', 'Ions', ['valence'], 'Atoms that gain or lose electrons become charged ions'],
    ['cation', 'Cations', ['ions'], 'Atoms that lose electrons become positive cations'],
    ['anion', 'Anions', ['ions'], 'Atoms that gain electrons become negative anions'],
    ['electron-dot', 'Electron Dot Diagrams', ['valence'], 'Draw dots around element symbols to show valence electrons'],
    ['atomic-radius', 'Atomic Radius', ['electron-config', 'science.chem.periodic.trends'], 'Atoms get smaller across a period and larger down a group'],
    ['ionisation', 'Ionisation Energy', ['ions', 'science.chem.periodic.trends'], 'Energy needed to remove an electron from an atom'],
    ['electronegativity', 'Electronegativity', ['valence', 'science.chem.periodic.trends'], 'Measure how strongly an atom attracts shared electrons'],
    ['isotope-detail', 'Isotopes Detail', ['science.chem.atoms.isotopes', 'math.decimals'], 'Calculate relative atomic mass from isotope abundances'],
    ['spectroscopy-intro', 'Spectroscopy Introduction', ['electron-config'], 'Atoms absorb and emit light at characteristic wavelengths'],
  ]),

  // ---- Bonding (14) ----
  ...topic('science.chem.bonding', CHEM, 'builder', [ALC], [
    ['why-bond', 'Why Atoms Bond', ['science.chem.atomic.octet'], 'Atoms bond to achieve stable electron configurations'],
    ['ionic', 'Ionic Bonding', ['why-bond', 'science.chem.atomic.ions'], 'Metals transfer electrons to non-metals'],
    ['ionic-struct', 'Ionic Structures', ['ionic'], 'Ions arrange in a regular lattice held by electrostatic forces'],
    ['ionic-props', 'Ionic Properties', ['ionic-struct'], 'High melting points, dissolve in water, conduct when liquid'],
    ['covalent', 'Covalent Bonding', ['why-bond'], 'Non-metals share pairs of electrons'],
    ['covalent-struct', 'Covalent Structures', ['covalent'], 'Simple molecules with weak intermolecular forces'],
    ['covalent-props', 'Covalent Properties', ['covalent-struct'], 'Low melting points, poor conductors, often gases or liquids'],
    ['metallic', 'Metallic Bonding', ['why-bond', 'science.chem.elements.metals'], 'Metal atoms share a sea of delocalised electrons'],
    ['metallic-props', 'Metallic Properties', ['metallic'], 'Good conductors, malleable, ductile, lustrous'],
    ['giant-covalent', 'Giant Covalent Structures', ['covalent'], 'Diamond and silicon dioxide: extremely hard, very high melting points'],
    ['intermolecular', 'Intermolecular Forces', ['covalent-struct'], 'Weak attractions between molecules determine physical properties'],
    ['hydrogen-bond', 'Hydrogen Bonding', ['intermolecular'], 'Extra-strong intermolecular force in water and biological molecules'],
    ['shapes', 'Molecular Shapes', ['covalent', 'math.geometry'], 'Electron pairs repel to give molecules 3D shapes'],
    ['polarity', 'Polarity', ['shapes', 'science.chem.atomic.electronegativity'], 'Unequal electron sharing creates polar molecules'],
  ]),

  // ---- Chemical equations (10) ----
  ...chain('science.chem.equations', CHEM, 'builder', [ALC], [
    ['word-eq', 'Word Equations', 'Write reactions using reactant and product names'],
    ['formula-eq', 'Formula Equations', 'Replace names with chemical formulas'],
    ['balancing', 'Balancing Equations', 'Adjust coefficients so atoms balance on both sides'],
    ['state-symbols', 'State Symbols', 'Add (s), (l), (g), and (aq) to show physical states'],
    ['interpreting', 'Interpreting Equations', 'Read equations to predict products and reactants'],
    ['ionic-eq', 'Ionic Equations', 'Write equations showing only the ions that change'],
    ['net-ionic', 'Net Ionic Equations', 'Remove spectator ions to show the essential reaction'],
    ['half-eq', 'Half Equations', 'Separate oxidation and reduction into two equations'],
    ['yield', 'Reaction Yield', 'Calculate expected product mass from a balanced equation'],
    ['limiting', 'Limiting Reactant', 'Identify which reactant runs out first'],
  ], ['science.chemistry.reactions', 'science.chem.molecules.formulas', 'math.algebra']),

  // ---- Stoichiometry (12) ----
  ...topic('science.chem.stoichiometry', CHEM, 'builder', [ALC], [
    ['mole', 'The Mole', ['science.chem.equations.balancing', 'math.multiplication'], 'Count particles using Avogadro number as a unit'],
    ['molar-mass', 'Molar Mass', ['mole'], 'Calculate the mass of one mole of a substance'],
    ['mass-to-mole', 'Mass to Moles', ['molar-mass', 'math.division'], 'Convert grams to moles and back'],
    ['mole-ratios', 'Mole Ratios', ['mole', 'science.chem.equations.balancing', 'math.ratios'], 'Use balanced equations to find ratios of reactants and products'],
    ['mass-mass', 'Mass-Mass Calculations', ['mole-ratios'], 'Calculate product mass from reactant mass'],
    ['limiting-reagent', 'Limiting Reagent Calculations', ['mass-mass', 'science.chem.equations.limiting'], 'Determine which reactant limits the reaction mathematically'],
    ['percent-yield', 'Percent Yield', ['mass-mass', 'math.percentages'], 'Compare actual yield to theoretical yield'],
    ['empirical', 'Empirical Formula', ['mole', 'math.ratios'], 'Find the simplest whole-number ratio of atoms'],
    ['molecular-formula', 'Molecular Formula', ['empirical'], 'Determine the actual number of atoms in a molecule'],
    ['percent-comp', 'Percent Composition', ['molar-mass', 'math.percentages'], 'Calculate the mass percentage of each element'],
    ['solution-stoich', 'Solution Stoichiometry', ['mole-ratios', 'math.multiplication'], 'Use molarity and volume to calculate moles in solutions'],
    ['titration-intro', 'Titration Introduction', ['solution-stoich'], 'Add measured amounts of one solution to another until complete'],
  ]),

  // ---- Reaction types (12) ----
  ...topic('science.chem.reaction-types', CHEM, 'builder', [ALC], [
    ['synthesis', 'Synthesis Reactions', ['science.chemistry.reactions'], 'Two or more substances combine to form one product'],
    ['decomposition', 'Decomposition Reactions', ['science.chemistry.reactions'], 'One compound breaks down into simpler substances'],
    ['single-replace', 'Single Replacement', ['science.chemistry.reactions'], 'A more reactive element displaces a less reactive one'],
    ['double-replace', 'Double Replacement', ['science.chemistry.reactions'], 'Two compounds swap partners to form new products'],
    ['combustion', 'Combustion', ['science.chemistry.reactions'], 'A substance reacts with oxygen releasing heat and light'],
    ['complete-comb', 'Complete Combustion', ['combustion'], 'Burning with plenty of oxygen produces CO2 and water'],
    ['incomplete-comb', 'Incomplete Combustion', ['combustion'], 'Burning with limited oxygen produces carbon monoxide or soot'],
    ['activity-series', 'Activity Series', ['single-replace'], 'Rank metals by how readily they react'],
    ['oxidation', 'Oxidation', ['science.chem.equations.half-eq'], 'Loss of electrons or gain of oxygen'],
    ['reduction', 'Reduction', ['science.chem.equations.half-eq'], 'Gain of electrons or loss of oxygen'],
    ['redox', 'Redox Reactions', ['oxidation', 'reduction'], 'Oxidation and reduction always happen together'],
    ['precipitation', 'Precipitation', ['double-replace'], 'Mixing solutions produces an insoluble solid'],
  ]),

  // ---- Acids, bases, and pH (12) ----
  ...topic('science.chem.acids-bases', CHEM, 'builder', [ALC], [
    ['arrhenius', 'Arrhenius Theory', ['science.chem.acids-intro.mixing-acid-base', 'science.chem.atomic.ions'], 'Acids produce H+ in water; bases produce OH-'],
    ['ph-scale', 'pH Scale', ['arrhenius', 'math.number-ordering'], 'Measure acidity on a scale from 0 to 14'],
    ['ph-indicators', 'pH Indicators', ['ph-scale'], 'Use universal indicator to find the pH of solutions'],
    ['strong-acid', 'Strong Acids', ['arrhenius'], 'Fully ionise in water to produce many H+ ions'],
    ['weak-acid', 'Weak Acids', ['arrhenius'], 'Partially ionise, leaving most molecules intact'],
    ['strong-base', 'Strong Bases', ['arrhenius'], 'Fully dissociate to produce many OH- ions'],
    ['weak-base', 'Weak Bases', ['arrhenius'], 'Partially dissociate in water'],
    ['neutralisation', 'Neutralisation', ['ph-scale'], 'Acid plus base produces salt and water'],
    ['salt-formation', 'Salt Formation', ['neutralisation'], 'Name the salt formed from a given acid and base'],
    ['titration', 'Titration', ['neutralisation', 'science.chem.stoichiometry.titration-intro'], 'Measure exact volumes to find unknown concentrations'],
    ['buffer-intro', 'Buffers Introduction', ['weak-acid', 'weak-base'], 'Solutions that resist changes in pH'],
    ['ph-calc', 'pH Calculations', ['ph-scale', 'math.algebra'], 'Calculate pH from hydrogen ion concentration'],
  ]),

  // ---- Solutions and concentration (10) ----
  ...topic('science.chem.solutions', CHEM, 'builder', [ALC], [
    ['molarity', 'Molarity', ['science.chem.stoichiometry.mole', 'math.division'], 'Calculate concentration as moles per litre'],
    ['dilution', 'Dilution', ['molarity', 'math.equations'], 'Use M1V1 = M2V2 to calculate dilution volumes'],
    ['solubility-curve', 'Solubility Curves', ['science.chem.solutions-disc.solubility', 'math.data.graphs'], 'Read graphs showing solubility versus temperature'],
    ['saturated', 'Saturated Solutions', ['solubility-curve'], 'A solution holding the maximum dissolved solute'],
    ['supersaturated', 'Supersaturated Solutions', ['saturated'], 'Force extra solute to dissolve then trigger crystallisation'],
    ['colligative', 'Colligative Properties Introduction', ['molarity'], 'Dissolved particles affect boiling and freezing points'],
    ['boiling-elevation', 'Boiling Point Elevation', ['colligative'], 'Dissolved solute raises the boiling point'],
    ['freezing-depression', 'Freezing Point Depression', ['colligative'], 'Dissolved solute lowers the freezing point'],
    ['osmosis-intro', 'Osmosis Introduction', ['molarity'], 'Water moves through membranes from dilute to concentrated'],
    ['electrolyte', 'Electrolytes', ['science.chem.atomic.ions', 'molarity'], 'Dissolved ions carry electric current through a solution'],
  ]),

  // ---- Gas laws (10) ----
  ...topic('science.chem.gas-laws', CHEM, 'builder', [ALC], [
    ['boyle', 'Boyle Law', ['science.physics.press.boyle-intro', 'math.equations'], 'Pressure times volume stays constant at fixed temperature'],
    ['charles', 'Charles Law', ['science.chem.gases.gas-properties', 'math.equations'], 'Volume increases proportionally with temperature'],
    ['gay-lussac', 'Gay-Lussac Law', ['boyle', 'charles'], 'Pressure increases proportionally with temperature at fixed volume'],
    ['combined', 'Combined Gas Law', ['boyle', 'charles', 'gay-lussac'], 'Combine all three gas laws into one equation'],
    ['ideal', 'Ideal Gas Law', ['combined', 'science.chem.stoichiometry.mole'], 'PV = nRT: the master equation for ideal gases'],
    ['dalton', 'Dalton Law of Partial Pressures', ['ideal'], 'Total pressure equals the sum of each gas partial pressure'],
    ['molar-volume', 'Molar Volume', ['ideal'], 'One mole of any gas occupies the same volume at standard conditions'],
    ['gas-stoich', 'Gas Stoichiometry', ['molar-volume', 'science.chem.stoichiometry.mole-ratios'], 'Use gas volumes in stoichiometric calculations'],
    ['kinetic-molecular', 'Kinetic Molecular Theory', ['ideal'], 'Gas behaviour arises from fast, random particle motion'],
    ['real-gases-chem', 'Real Gases', ['ideal'], 'Real gases deviate from ideal at high pressure and low temperature'],
  ]),

  // ---- Energy in reactions (10) ----
  ...topic('science.chem.energy-rxn', CHEM, 'builder', [ALC], [
    ['exothermic', 'Exothermic Reactions', ['science.chemistry.reactions', 'science.chem.changes.energy-changes'], 'Reactions that release heat to the surroundings'],
    ['endothermic', 'Endothermic Reactions', ['exothermic'], 'Reactions that absorb heat from the surroundings'],
    ['energy-diagrams', 'Energy Profile Diagrams', ['exothermic', 'endothermic'], 'Draw energy diagrams showing reactants, products, and activation energy'],
    ['activation', 'Activation Energy', ['energy-diagrams'], 'The minimum energy needed to start a reaction'],
    ['catalyst-intro', 'Catalysts Introduction', ['activation'], 'A substance that speeds up reactions without being consumed'],
    ['bond-energy', 'Bond Energies', ['activation', 'math.addition'], 'Calculate energy by comparing bonds broken and bonds formed'],
    ['hess-intro', 'Hess Law Introduction', ['bond-energy'], 'Total enthalpy change is the same regardless of route'],
    ['calorimetry', 'Calorimetry', ['exothermic', 'math.equations'], 'Measure heat released or absorbed using a calorimeter'],
    ['enthalpy-rxn', 'Enthalpy of Reaction', ['calorimetry'], 'Calculate the heat change per mole of reaction'],
    ['entropy-chem', 'Entropy in Chemistry', ['enthalpy-rxn'], 'Reactions favour increasing disorder of particles'],
  ]),

  // ---- Metals and reactivity (10) ----
  ...topic('science.chem.metals', CHEM, 'builder', [ALC, WS], [
    ['extraction', 'Metal Extraction', ['science.chem.reaction-types.activity-series'], 'Separate metals from their ores by reduction'],
    ['reactivity-series', 'Reactivity Series', ['science.chem.reaction-types.activity-series'], 'Rank metals from most to least reactive'],
    ['displacement', 'Displacement Reactions', ['reactivity-series'], 'A more reactive metal pushes a less reactive one out of solution'],
    ['corrosion', 'Corrosion', ['reactivity-series', 'science.chem.reaction-types.oxidation'], 'Metals deteriorate through chemical reaction with their environment'],
    ['rust-prevention', 'Rust Prevention', ['corrosion'], 'Use paint, oil, galvanising, or sacrificial metals to stop rust'],
    ['alloys-detail', 'Alloys Detail', ['science.chem.mix-comp.alloys'], 'Adding other elements changes metal properties'],
    ['electrolysis-intro', 'Electrolysis Introduction', ['science.chem.solutions.electrolyte'], 'Use electricity to split compounds into elements'],
    ['electroplating', 'Electroplating', ['electrolysis-intro'], 'Coat objects with a thin layer of metal using electrolysis'],
    ['recycling-metals', 'Recycling Metals', ['extraction'], 'Recycle metals to save energy and resources'],
    ['metal-tests', 'Flame Tests', ['science.chem.atomic.spectroscopy-intro'], 'Identify metals by the colour they burn in a flame'],
  ]),

  // ---- Periodic table groups expand (8) ----
  ...expand('science.chem.group-study', CHEM, 'builder', [ALC],
    ['science.chem.periodic.groups', 'science.chem.atomic.valence'],
    'Group: {item}', 'Study the properties and trends of {item}', [
    ['alkali-metals', 'Alkali Metals'], ['alkaline-earth', 'Alkaline Earth Metals'],
    ['halogens-detail', 'Halogens'], ['noble-gases-detail', 'Noble Gases'],
    ['transition-detail', 'Transition Metals'], ['carbon-group', 'Carbon Group'],
    ['nitrogen-group', 'Nitrogen Group'], ['oxygen-group', 'Oxygen Group'],
  ]),
];

// ===========================================================================
// CHEMISTRY — INNOVATOR  (~220 skills)
// Grades 6-8: Organic intro, equilibrium, kinetics, thermochemistry,
//             electrochemistry, nuclear, spectroscopy, polymers, biochemistry
// ===========================================================================

const chemInnovator: SkillNode[] = [

  // ---- Organic chemistry intro (16) ----
  ...topic('science.chem.organic', CHEM, 'innovator', [ALC], [
    ['what-is', 'What Is Organic Chemistry', ['science.chem.bonding.covalent', 'science.chem.element.carbon'], 'The chemistry of carbon-based compounds'],
    ['hydrocarbons', 'Hydrocarbons', ['what-is'], 'Compounds containing only carbon and hydrogen'],
    ['alkanes', 'Alkanes', ['hydrocarbons'], 'Saturated hydrocarbons with single bonds only'],
    ['alkenes', 'Alkenes', ['hydrocarbons'], 'Unsaturated hydrocarbons with at least one double bond'],
    ['alkynes', 'Alkynes', ['hydrocarbons'], 'Hydrocarbons with at least one triple bond'],
    ['naming-organic', 'IUPAC Naming', ['alkanes', 'alkenes'], 'Name organic molecules following international rules'],
    ['isomers', 'Isomers', ['naming-organic'], 'Different structures sharing the same molecular formula'],
    ['alcohols', 'Alcohols', ['alkanes'], 'Hydrocarbons with an OH group attached'],
    ['carboxylic', 'Carboxylic Acids', ['alcohols'], 'Organic acids with a COOH group'],
    ['esters', 'Esters', ['carboxylic', 'alcohols'], 'Sweet-smelling compounds from acid plus alcohol'],
    ['amines', 'Amines', ['alkanes'], 'Organic compounds containing nitrogen'],
    ['aldehydes', 'Aldehydes', ['alcohols'], 'Partial oxidation products of primary alcohols'],
    ['ketones', 'Ketones', ['alcohols'], 'Oxidation products of secondary alcohols'],
    ['ethers', 'Ethers', ['alcohols'], 'Two carbon groups linked through an oxygen'],
    ['halogenoalkanes', 'Halogenoalkanes', ['alkanes'], 'Alkanes with a halogen substituent'],
    ['cracking', 'Cracking', ['alkanes'], 'Break long hydrocarbons into shorter, more useful molecules'],
  ]),

  // ---- Chemical equilibrium (12) ----
  ...topic('science.chem.equilibrium', CHEM, 'innovator', [ALC], [
    ['reversible', 'Reversible Reactions', ['science.chemistry.reactions'], 'Some reactions can go forward and backward'],
    ['dynamic', 'Dynamic Equilibrium', ['reversible'], 'Forward and reverse rates become equal'],
    ['le-chatelier', 'Le Chatelier Principle', ['dynamic'], 'A system at equilibrium resists changes imposed on it'],
    ['conc-effect', 'Concentration Effects', ['le-chatelier'], 'Adding reactant shifts equilibrium toward products'],
    ['temp-effect', 'Temperature Effects', ['le-chatelier'], 'Raising temperature favours the endothermic direction'],
    ['pressure-effect', 'Pressure Effects', ['le-chatelier'], 'Increasing pressure favours the side with fewer gas moles'],
    ['kc', 'Equilibrium Constant Kc', ['dynamic', 'math.algebra'], 'Calculate Kc from equilibrium concentrations'],
    ['kp', 'Equilibrium Constant Kp', ['kc'], 'Express equilibrium using partial pressures for gases'],
    ['ice-tables', 'ICE Tables', ['kc', 'math.equations'], 'Organise initial, change, and equilibrium concentrations'],
    ['solubility-product', 'Solubility Product Ksp', ['kc'], 'Predict whether a precipitate will form'],
    ['common-ion', 'Common Ion Effect', ['solubility-product'], 'Adding a shared ion reduces solubility'],
    ['equilibrium-calc', 'Equilibrium Calculations', ['ice-tables', 'math.equations'], 'Solve for unknown concentrations at equilibrium'],
  ]),

  // ---- Chemical kinetics (12) ----
  ...topic('science.chem.kinetics', CHEM, 'innovator', [ALC], [
    ['rate', 'Reaction Rate', ['science.chemistry.reactions', 'math.rates'], 'Measure how fast reactants are consumed or products formed'],
    ['factors', 'Factors Affecting Rate', ['rate'], 'Temperature, concentration, surface area, and catalysts'],
    ['collision', 'Collision Theory', ['factors'], 'Particles must collide with enough energy and correct orientation'],
    ['rate-law', 'Rate Law', ['rate', 'math.algebra'], 'Express rate as k times concentration raised to an order'],
    ['order', 'Reaction Order', ['rate-law'], 'Determine exponents from experimental data'],
    ['rate-constant', 'Rate Constant', ['rate-law'], 'The proportionality factor k that depends on temperature'],
    ['half-life-chem', 'Chemical Half-Life', ['order', 'math.algebra'], 'Calculate the time for concentration to halve'],
    ['arrhenius', 'Arrhenius Equation', ['rate-constant', 'math.algebra'], 'Relate rate constant to temperature and activation energy'],
    ['mechanisms', 'Reaction Mechanisms', ['rate-law'], 'Break complex reactions into elementary steps'],
    ['rate-determining', 'Rate-Determining Step', ['mechanisms'], 'The slowest step controls the overall rate'],
    ['catalysis', 'Catalysis', ['collision', 'science.chem.energy-rxn.catalyst-intro'], 'Catalysts provide an alternative pathway with lower activation energy'],
    ['enzyme-intro', 'Enzyme Catalysis Introduction', ['catalysis'], 'Biological catalysts that speed up reactions in living things'],
  ]),

  // ---- Thermochemistry (12) ----
  ...topic('science.chem.thermochem', CHEM, 'innovator', [ALC], [
    ['enthalpy-detail', 'Enthalpy Detail', ['science.chem.energy-rxn.enthalpy-rxn', 'math.calculus'], 'Define enthalpy as heat content at constant pressure'],
    ['standard-enthalpy', 'Standard Enthalpies', ['enthalpy-detail'], 'Measure enthalpy changes under standard conditions'],
    ['formation', 'Enthalpy of Formation', ['standard-enthalpy'], 'Energy change when one mole of compound forms from elements'],
    ['combustion-enth', 'Enthalpy of Combustion', ['standard-enthalpy'], 'Energy released when one mole of substance burns completely'],
    ['hess', 'Hess Law', ['formation', 'combustion-enth'], 'Total enthalpy change depends only on initial and final states'],
    ['born-haber-intro', 'Born-Haber Cycle Introduction', ['hess', 'science.chem.bonding.ionic'], 'Calculate lattice energy using a thermodynamic cycle'],
    ['entropy-detail', 'Entropy Detail', ['science.chem.energy-rxn.entropy-chem', 'math.calculus'], 'Quantify disorder as entropy in joules per kelvin'],
    ['gibbs', 'Gibbs Free Energy', ['enthalpy-detail', 'entropy-detail'], 'Calculate spontaneity: delta G = delta H minus T delta S'],
    ['spontaneity', 'Spontaneity', ['gibbs'], 'Negative delta G means a reaction proceeds on its own'],
    ['coupled', 'Coupled Reactions', ['spontaneity'], 'Drive non-spontaneous reactions by coupling with spontaneous ones'],
    ['calorimetry-adv', 'Advanced Calorimetry', ['science.chem.energy-rxn.calorimetry', 'math.calculus'], 'Use bomb and coffee-cup calorimeters for precise measurements'],
    ['thermo-calc', 'Thermochemistry Calculations', ['gibbs', 'math.equations'], 'Solve multi-step thermochemistry problems'],
  ]),

  // ---- Electrochemistry (14) ----
  ...topic('science.chem.electrochem', CHEM, 'innovator', [ALC, WS], [
    ['redox-review', 'Redox Review', ['science.chem.reaction-types.redox'], 'Track electron transfer using oxidation numbers'],
    ['oxidation-numbers', 'Oxidation Numbers', ['redox-review'], 'Assign oxidation states to atoms in compounds'],
    ['galvanic', 'Galvanic Cells', ['redox-review'], 'Generate electricity from spontaneous chemical reactions'],
    ['cell-notation', 'Cell Notation', ['galvanic'], 'Write shorthand for electrochemical cells'],
    ['standard-potential', 'Standard Electrode Potential', ['galvanic', 'math.equations'], 'Measure and compare half-cell voltages'],
    ['emf', 'Cell EMF', ['standard-potential'], 'Calculate overall cell voltage from half-cell potentials'],
    ['electrolysis', 'Electrolysis Detail', ['science.chem.metals.electrolysis-intro'], 'Use electricity to force non-spontaneous reactions'],
    ['faraday-law-chem', 'Faraday Law of Electrolysis', ['electrolysis', 'math.equations'], 'Calculate mass deposited from current and time'],
    ['batteries-chem', 'Batteries', ['galvanic'], 'Compare primary, secondary, and fuel cells'],
    ['corrosion-electro', 'Electrochemical Corrosion', ['galvanic', 'science.chem.metals.corrosion'], 'Understand rusting as an electrochemical process'],
    ['cathodic', 'Cathodic Protection', ['corrosion-electro'], 'Protect metals by making them the cathode'],
    ['fuel-cells', 'Fuel Cells', ['galvanic'], 'Generate electricity by combining hydrogen and oxygen'],
    ['nernst-intro', 'Nernst Equation Introduction', ['emf', 'math.algebra'], 'Adjust cell voltage for non-standard conditions'],
    ['industrial-electrolysis', 'Industrial Electrolysis', ['electrolysis'], 'Produce aluminium, chlorine, and sodium hydroxide at scale'],
  ]),

  // ---- Nuclear chemistry (8) ----
  ...topic('science.chem.nuclear', CHEM, 'innovator', [ALC], [
    ['nuclear-stability', 'Nuclear Stability', ['science.chem.atoms.isotopes', 'science.physics.nuclear.binding-energy'], 'Relate the neutron-to-proton ratio to stability'],
    ['decay-types', 'Decay Types', ['nuclear-stability', 'science.physics.nuclear.alpha'], 'Compare alpha, beta, and gamma decay'],
    ['half-life-calc', 'Half-Life Calculations', ['decay-types', 'math.algebra'], 'Calculate remaining sample after multiple half-lives'],
    ['carbon-dating', 'Carbon Dating', ['half-life-calc'], 'Determine the age of organic materials from carbon-14 ratios'],
    ['fission-chem', 'Nuclear Fission Chemistry', ['nuclear-stability'], 'Analyse the products of splitting heavy nuclei'],
    ['fusion-chem', 'Nuclear Fusion Chemistry', ['nuclear-stability'], 'Analyse the products of merging light nuclei'],
    ['radiation-uses', 'Radiation Uses', ['decay-types'], 'Apply radioactivity in medicine, industry, and archaeology'],
    ['nuclear-waste', 'Nuclear Waste', ['fission-chem'], 'Manage radioactive waste safely over long timescales'],
  ]),

  // ---- Spectroscopy (10) ----
  ...topic('science.chem.spectroscopy', CHEM, 'innovator', [ALC], [
    ['ir', 'IR Spectroscopy', ['science.chem.organic.what-is', 'science.physics.em-spectrum.infrared'], 'Identify functional groups by infrared absorption patterns'],
    ['mass-spec', 'Mass Spectrometry', ['science.chem.stoichiometry.molar-mass'], 'Determine molecular mass and fragmentation patterns'],
    ['uv-vis', 'UV-Vis Spectroscopy', ['science.chem.atomic.spectroscopy-intro'], 'Measure concentration from light absorption'],
    ['nmr-intro', 'NMR Introduction', ['science.chem.organic.hydrocarbons'], 'Map hydrogen environments in organic molecules'],
    ['chromatography', 'Chromatography', ['science.chem.solutions.molarity'], 'Separate and identify components of mixtures'],
    ['tlc', 'Thin-Layer Chromatography', ['chromatography'], 'Separate compounds on a coated plate'],
    ['gas-chrom', 'Gas Chromatography', ['chromatography'], 'Separate volatile compounds through a heated column'],
    ['hplc', 'HPLC', ['chromatography'], 'Separate compounds under high pressure through a packed column'],
    ['beer-lambert', 'Beer-Lambert Law', ['uv-vis', 'math.equations'], 'Relate absorbance to concentration and path length'],
    ['combined-analysis', 'Combined Spectral Analysis', ['ir', 'mass-spec', 'nmr-intro'], 'Use multiple techniques together to identify unknown compounds'],
  ]),

  // ---- Polymers (10) ----
  ...topic('science.chem.polymers', CHEM, 'innovator', [ALC], [
    ['what-is-polymer', 'What Are Polymers', ['science.chem.organic.alkenes'], 'Long chain molecules built from repeating monomer units'],
    ['addition', 'Addition Polymers', ['what-is-polymer'], 'Monomers with double bonds join end to end'],
    ['condensation', 'Condensation Polymers', ['what-is-polymer', 'science.chem.organic.carboxylic'], 'Monomers join by releasing small molecules like water'],
    ['plastics', 'Plastics', ['addition'], 'Versatile synthetic polymers with many everyday uses'],
    ['thermoplastics', 'Thermoplastics', ['plastics'], 'Polymers that soften when heated and can be remoulded'],
    ['thermosets', 'Thermosets', ['plastics'], 'Polymers that set permanently and cannot be remelted'],
    ['elastomers', 'Elastomers', ['what-is-polymer'], 'Stretchy polymers like rubber that return to original shape'],
    ['natural-polymers', 'Natural Polymers', ['what-is-polymer'], 'Starch, cellulose, proteins, and DNA are nature polymers'],
    ['recycling-polymers', 'Polymer Recycling', ['plastics'], 'Sort, melt, and reshape plastics to reduce waste'],
    ['bioplastics', 'Bioplastics', ['recycling-polymers'], 'Polymers made from renewable sources that biodegrade'],
  ]),

  // ---- Biochemistry intro (12) ----
  ...topic('science.chem.biochem', CHEM, 'innovator', [ALC, FOR], [
    ['carbohydrates', 'Carbohydrates', ['science.chem.organic.what-is'], 'Sugars, starches, and cellulose built from C, H, and O'],
    ['monosaccharides', 'Monosaccharides', ['carbohydrates'], 'Simple sugars: glucose, fructose, galactose'],
    ['disaccharides', 'Disaccharides', ['monosaccharides'], 'Two monosaccharides joined: sucrose, lactose, maltose'],
    ['polysaccharides', 'Polysaccharides', ['disaccharides'], 'Long sugar chains: starch, glycogen, cellulose'],
    ['lipids', 'Lipids', ['science.chem.organic.esters'], 'Fats, oils, and waxes that store energy'],
    ['fatty-acids', 'Fatty Acids', ['lipids'], 'Long hydrocarbon chains: saturated and unsaturated'],
    ['amino-acids', 'Amino Acids', ['science.chem.organic.amines', 'science.chem.organic.carboxylic'], 'Building blocks of proteins with amino and carboxyl groups'],
    ['peptide-bonds', 'Peptide Bonds', ['amino-acids'], 'Amino acids link together through condensation reactions'],
    ['proteins-intro', 'Proteins Introduction', ['peptide-bonds'], 'Long polypeptide chains that fold into specific shapes'],
    ['enzymes-detail', 'Enzymes Detail', ['proteins-intro', 'science.chem.kinetics.enzyme-intro'], 'Protein catalysts with active sites that fit specific substrates'],
    ['nucleotides', 'Nucleotides', ['monosaccharides', 'science.chem.organic.amines'], 'Sugar, phosphate, and base units that build DNA and RNA'],
    ['dna-structure', 'DNA Structure', ['nucleotides'], 'A double helix of paired nucleotides carrying genetic code'],
  ]),

  // ---- Coordination chemistry (8) ----
  ...topic('science.chem.coordination', CHEM, 'innovator', [ALC], [
    ['transition-props', 'Transition Metal Properties', ['science.chem.periodic.transitions', 'science.chem.atomic.electron-config'], 'Variable oxidation states and coloured compounds'],
    ['complex-ions', 'Complex Ions', ['transition-props'], 'Central metal ions surrounded by ligands'],
    ['ligands', 'Ligands', ['complex-ions'], 'Molecules or ions that donate electron pairs to the metal'],
    ['coordination-number', 'Coordination Number', ['complex-ions'], 'Count the bonds from ligands to the central metal'],
    ['naming-complex', 'Naming Complexes', ['complex-ions'], 'Follow IUPAC rules for naming coordination compounds'],
    ['colour', 'Colour in Complexes', ['complex-ions'], 'Split d-orbitals explain why transition metal compounds are coloured'],
    ['isomerism-coord', 'Isomerism in Complexes', ['complex-ions'], 'Same formula, different ligand arrangements'],
    ['applications-coord', 'Coordination Applications', ['complex-ions'], 'Find complexes in haemoglobin, chlorophyll, and catalysts'],
  ]),

  // ---- Industrial chemistry (8) ----
  ...topic('science.chem.industrial', CHEM, 'innovator', [ALC, WS], [
    ['haber', 'Haber Process', ['science.chem.equilibrium.le-chatelier', 'science.chem.kinetics.catalysis'], 'Manufacture ammonia from nitrogen and hydrogen'],
    ['contact', 'Contact Process', ['science.chem.equilibrium.le-chatelier'], 'Manufacture sulphuric acid on an industrial scale'],
    ['chlor-alkali', 'Chlor-Alkali Process', ['science.chem.electrochem.industrial-electrolysis'], 'Electrolyse brine to make chlorine and sodium hydroxide'],
    ['fertilisers', 'Fertiliser Production', ['haber'], 'Convert ammonia into ammonium nitrate and other fertilisers'],
    ['petroleum', 'Petroleum Refining', ['science.chem.organic.alkanes', 'science.chem.organic.cracking'], 'Distil crude oil into useful fractions'],
    ['cement', 'Cement Manufacturing', ['science.chem.reaction-types.decomposition'], 'Heat limestone and clay to produce cement clinker'],
    ['iron-steel', 'Iron and Steel Production', ['science.chem.metals.extraction'], 'Reduce iron ore in a blast furnace and refine into steel'],
    ['green-chem-intro', 'Green Chemistry Introduction', ['science.chem.kinetics.catalysis'], 'Design chemical processes that minimise waste and hazards'],
  ]),

  // ---- Environmental chemistry intro (8) ----
  ...topic('science.chem.environ', CHEM, 'innovator', [ALC, FOR], [
    ['atmosphere', 'Atmospheric Chemistry', ['science.chem.gases.air'], 'Study the chemical composition and reactions of the atmosphere'],
    ['ozone', 'Ozone Layer', ['atmosphere'], 'Ozone absorbs UV; CFCs destroy it'],
    ['greenhouse', 'Greenhouse Gases', ['atmosphere'], 'CO2, methane, and water vapour trap heat in the atmosphere'],
    ['acid-rain', 'Acid Rain', ['atmosphere', 'science.chem.acids-bases.ph-scale'], 'SO2 and NOx dissolve in rain to form acids'],
    ['water-pollution', 'Water Pollution', ['science.chem.solutions.molarity'], 'Detect and measure chemical pollutants in water'],
    ['water-treatment', 'Water Treatment', ['water-pollution'], 'Filter, disinfect, and purify water for safe drinking'],
    ['soil-chem', 'Soil Chemistry', ['science.chem.acids-bases.ph-scale'], 'Measure pH and nutrient content of soil'],
    ['remediation', 'Environmental Remediation', ['water-pollution', 'soil-chem'], 'Clean up contaminated land and water using chemistry'],
  ]),

  // ---- Photochemistry (6) ----
  ...topic('science.chem.photochem', CHEM, 'innovator', [ALC], [
    ['light-rxn', 'Light-Driven Reactions', ['science.physics.quantum-intro.photon', 'science.chemistry.reactions'], 'Light provides the activation energy for chemical reactions'],
    ['photosynthesis-chem', 'Photosynthesis Chemistry', ['light-rxn'], 'Light drives the conversion of CO2 and water into glucose'],
    ['photography', 'Photography Chemistry', ['light-rxn'], 'Silver halide crystals darken when exposed to light'],
    ['solar-chem', 'Solar Chemistry', ['light-rxn'], 'Harness sunlight to drive useful chemical reactions'],
    ['fluorescence', 'Fluorescence', ['light-rxn'], 'Substances absorb UV and re-emit visible light'],
    ['phosphorescence', 'Phosphorescence', ['fluorescence'], 'Delayed emission: glow-in-the-dark materials'],
  ]),

  // ---- Functional groups expand (14) ----
  ...expand('science.chem.func-group', CHEM, 'innovator', [ALC],
    ['science.chem.organic.naming-organic'],
    'Functional Group: {item}', 'Identify and react with the {item} functional group', [
    ['hydroxyl', 'Hydroxyl (-OH)'], ['carbonyl', 'Carbonyl (C=O)'],
    ['carboxyl', 'Carboxyl (-COOH)'], ['amino', 'Amino (-NH2)'],
    ['phosphate', 'Phosphate (-PO4)'], ['sulfhydryl', 'Sulfhydryl (-SH)'],
    ['methyl', 'Methyl (-CH3)'], ['ester-group', 'Ester (-COO-)'],
    ['amide', 'Amide (-CONH2)'], ['nitro', 'Nitro (-NO2)'],
    ['nitrile', 'Nitrile (-CN)'], ['thiol', 'Thiol (-SH)'],
    ['vinyl', 'Vinyl (C=C)'], ['phenyl', 'Phenyl (C6H5-)'],
  ]),
];

// ===========================================================================
// CHEMISTRY — CREATOR  (~190 skills)
// Advanced: Advanced organic, quantum chem, analytical, materials science,
//           medicinal, environmental, computational, green, forensic
// ===========================================================================

const chemCreator: SkillNode[] = [

  // ---- Advanced organic (14) ----
  ...topic('science.chem.organic-adv', CHEM, 'creator', [ALC], [
    ['reaction-mechanisms', 'Reaction Mechanisms', ['science.chem.organic.halogenoalkanes', 'science.chem.kinetics.mechanisms'], 'Trace electron movement with curly arrows'],
    ['nucleophilic-sub', 'Nucleophilic Substitution', ['reaction-mechanisms'], 'A nucleophile replaces a leaving group on carbon'],
    ['elimination', 'Elimination Reactions', ['reaction-mechanisms'], 'Remove atoms to form a double bond'],
    ['electrophilic-add', 'Electrophilic Addition', ['reaction-mechanisms', 'science.chem.organic.alkenes'], 'An electrophile attacks a double bond'],
    ['aromatic', 'Aromatic Chemistry', ['science.chem.organic.hydrocarbons'], 'Explore the stability and reactions of benzene rings'],
    ['electrophilic-sub-ar', 'Electrophilic Aromatic Substitution', ['aromatic', 'nucleophilic-sub'], 'Replace hydrogen on a benzene ring with another group'],
    ['carbonyl-chem', 'Carbonyl Chemistry', ['science.chem.organic.aldehydes', 'science.chem.organic.ketones'], 'React with nucleophiles at the electrophilic carbon'],
    ['enolates', 'Enolate Chemistry', ['carbonyl-chem'], 'Remove a proton next to a carbonyl to form a reactive intermediate'],
    ['aldol', 'Aldol Reactions', ['enolates'], 'Join two carbonyl compounds to build larger molecules'],
    ['grignard', 'Grignard Reagents', ['carbonyl-chem'], 'Use organomagnesium compounds to build carbon-carbon bonds'],
    ['protecting-groups', 'Protecting Groups', ['reaction-mechanisms'], 'Temporarily shield reactive groups during multi-step synthesis'],
    ['retrosynthesis', 'Retrosynthesis', ['protecting-groups', 'aldol'], 'Plan a synthesis backward from target to starting materials'],
    ['stereochemistry', 'Stereochemistry', ['science.chem.organic.isomers'], 'Analyse 3D arrangement of atoms and its chemical consequences'],
    ['chirality', 'Chirality', ['stereochemistry'], 'Non-superimposable mirror-image molecules have different biological effects'],
  ]),

  // ---- Quantum chemistry (10) ----
  ...topic('science.chem.quantum-chem', CHEM, 'creator', [ALC], [
    ['atomic-orbitals', 'Atomic Orbitals', ['science.physics.quantum.hydrogen', 'science.chem.atomic.electron-config'], 'Describe electron probability clouds as s, p, d, and f orbitals'],
    ['molecular-orbitals', 'Molecular Orbital Theory', ['atomic-orbitals'], 'Combine atomic orbitals to form bonding and antibonding MOs'],
    ['homo-lumo', 'HOMO-LUMO', ['molecular-orbitals'], 'Identify frontier orbitals that control reactivity'],
    ['hybridisation', 'Hybridisation', ['atomic-orbitals'], 'Mix orbitals to explain molecular geometry: sp, sp2, sp3'],
    ['conjugation', 'Conjugation', ['molecular-orbitals', 'science.chem.organic.alkenes'], 'Overlapping p-orbitals create delocalised electron systems'],
    ['aromaticity', 'Aromaticity', ['conjugation', 'science.chem.organic-adv.aromatic'], 'Special stability from cyclic conjugated systems'],
    ['crystal-field', 'Crystal Field Theory', ['science.chem.coordination.colour'], 'Explain colours and magnetism of transition metal complexes'],
    ['ligand-field', 'Ligand Field Theory', ['crystal-field', 'molecular-orbitals'], 'Refine crystal field theory with MO concepts'],
    ['dft-intro', 'Density Functional Theory Introduction', ['molecular-orbitals', 'math.calculus'], 'Approximate quantum calculations using electron density'],
    ['computational-chem', 'Computational Chemistry', ['dft-intro'], 'Use software to predict molecular properties and reactions'],
  ]),

  // ---- Analytical chemistry (12) ----
  ...topic('science.chem.analytical', CHEM, 'creator', [ALC], [
    ['qualitative', 'Qualitative Analysis', ['science.chem.spectroscopy.combined-analysis'], 'Identify what substances are present in a sample'],
    ['quantitative', 'Quantitative Analysis', ['qualitative', 'math.statistics.descriptive'], 'Determine how much of each substance is present'],
    ['gravimetric', 'Gravimetric Analysis', ['quantitative'], 'Measure mass changes to determine composition'],
    ['volumetric', 'Volumetric Analysis', ['science.chem.stoichiometry.titration-intro'], 'Measure volumes to determine concentration'],
    ['electroanalysis', 'Electroanalytical Methods', ['science.chem.electrochem.nernst-intro'], 'Use electrical measurements to analyse solutions'],
    ['atomic-absorption', 'Atomic Absorption Spectroscopy', ['science.chem.spectroscopy.uv-vis'], 'Measure element concentrations from light absorption by atoms'],
    ['icp', 'ICP Spectroscopy', ['atomic-absorption'], 'Use plasma to excite and detect trace elements'],
    ['xrd', 'X-Ray Diffraction', ['science.physics.wave-adv.diffraction-grating'], 'Determine crystal structures from X-ray scattering patterns'],
    ['sampling', 'Sampling Techniques', ['quantitative'], 'Collect representative samples for reliable analysis'],
    ['calibration', 'Calibration', ['quantitative', 'math.data.graphs'], 'Create standard curves to convert instrument readings to concentrations'],
    ['validation', 'Method Validation', ['calibration', 'math.statistics.descriptive'], 'Prove an analytical method is accurate and reliable'],
    ['error-analysis', 'Error Analysis', ['validation', 'math.statistics.descriptive'], 'Quantify and minimise sources of measurement error'],
  ]),

  // ---- Materials science (12) ----
  ...topic('science.chem.materials-sci', CHEM, 'creator', [ALC, WS], [
    ['ceramics', 'Ceramics', ['science.chem.bonding.giant-covalent'], 'Hard, brittle materials formed by heating minerals'],
    ['glasses', 'Glasses', ['ceramics'], 'Amorphous solids without regular crystal structure'],
    ['composites', 'Composite Materials', ['science.chem.polymers.what-is-polymer'], 'Combine materials to get the best properties of each'],
    ['smart-materials', 'Smart Materials', ['composites'], 'Materials that change properties in response to stimuli'],
    ['semiconductors-chem', 'Semiconductor Chemistry', ['science.chem.bonding.covalent', 'science.physics.condensed.band-theory'], 'Dope silicon to control electrical conductivity'],
    ['liquid-crystals', 'Liquid Crystals', ['science.chem.organic-adv.aromatic'], 'Materials between liquid and solid states used in displays'],
    ['nanomaterials-chem', 'Nanomaterials', ['science.chem.bonding.covalent'], 'Engineer materials at the nanometre scale'],
    ['graphene', 'Graphene', ['nanomaterials-chem'], 'A single layer of carbon atoms with extraordinary properties'],
    ['carbon-nanotubes', 'Carbon Nanotubes', ['nanomaterials-chem'], 'Rolled graphene sheets with remarkable strength and conductivity'],
    ['metal-organic', 'Metal-Organic Frameworks', ['science.chem.coordination.complex-ions'], 'Porous crystalline materials for gas storage and catalysis'],
    ['biomaterials', 'Biomaterials', ['science.chem.polymers.natural-polymers'], 'Materials compatible with living tissue for medical implants'],
    ['self-healing', 'Self-Healing Materials', ['smart-materials'], 'Materials that repair their own damage automatically'],
  ]),

  // ---- Medicinal chemistry (10) ----
  ...topic('science.chem.medicinal', CHEM, 'creator', [ALC], [
    ['drug-design', 'Drug Design', ['science.chem.organic-adv.retrosynthesis', 'science.chem.biochem.enzymes-detail'], 'Design molecules that interact with biological targets'],
    ['pharmacokinetics', 'Pharmacokinetics', ['drug-design'], 'Study how the body absorbs, distributes, metabolises, and excretes drugs'],
    ['receptor-binding', 'Receptor Binding', ['drug-design'], 'Design molecules that fit into protein receptor sites'],
    ['sar', 'Structure-Activity Relationships', ['receptor-binding'], 'Link molecular structure to biological activity'],
    ['combinatorial', 'Combinatorial Chemistry', ['drug-design'], 'Synthesise and screen large libraries of compounds rapidly'],
    ['antibiotics', 'Antibiotic Chemistry', ['drug-design'], 'Design molecules that kill bacteria without harming human cells'],
    ['antiviral', 'Antiviral Agents', ['drug-design'], 'Design molecules that block viral replication'],
    ['prodrugs', 'Prodrugs', ['pharmacokinetics'], 'Design inactive compounds that activate inside the body'],
    ['natural-products', 'Natural Product Chemistry', ['drug-design'], 'Isolate and study medicinally active compounds from nature'],
    ['clinical-trials', 'Clinical Trials Chemistry', ['pharmacokinetics'], 'Understand the chemistry behind drug safety testing'],
  ]),

  // ---- Environmental chemistry advanced (10) ----
  ...topic('science.chem.environ-adv', CHEM, 'creator', [ALC, FOR], [
    ['climate-chem', 'Climate Chemistry', ['science.chem.environ.greenhouse', 'math.calculus'], 'Model radiative forcing and carbon cycle feedback'],
    ['stratospheric', 'Stratospheric Chemistry', ['science.chem.environ.ozone'], 'Study catalytic ozone destruction cycles in detail'],
    ['aerosol-chem', 'Aerosol Chemistry', ['science.chem.environ.atmosphere'], 'Analyse tiny particles that affect climate and health'],
    ['persistent-pollutants', 'Persistent Organic Pollutants', ['science.chem.organic-adv.halogenoalkanes'], 'Study chemicals that accumulate in food chains'],
    ['bioremediation', 'Bioremediation', ['science.chem.environ.remediation'], 'Use microorganisms to break down pollutants'],
    ['green-solvents', 'Green Solvents', ['science.chem.industrial.green-chem-intro'], 'Replace hazardous solvents with safer alternatives'],
    ['life-cycle', 'Life Cycle Assessment', ['green-solvents'], 'Evaluate total environmental impact from cradle to grave'],
    ['carbon-capture', 'Carbon Capture', ['climate-chem'], 'Remove CO2 from emissions and store it safely'],
    ['water-analysis', 'Advanced Water Analysis', ['science.chem.environ.water-treatment'], 'Detect trace contaminants in water at parts-per-billion levels'],
    ['air-quality', 'Air Quality Monitoring', ['aerosol-chem'], 'Measure and model air pollutant concentrations'],
  ]),

  // ---- Green chemistry (8) ----
  ...topic('science.chem.green', CHEM, 'creator', [ALC], [
    ['twelve-principles', 'Twelve Principles', ['science.chem.industrial.green-chem-intro'], 'Apply the twelve principles of green chemistry to design'],
    ['atom-economy', 'Atom Economy', ['twelve-principles', 'math.percentages'], 'Maximise the fraction of atoms that end up in the product'],
    ['catalysis-green', 'Green Catalysis', ['twelve-principles', 'science.chem.kinetics.catalysis'], 'Design catalysts that reduce waste and energy use'],
    ['solvent-free', 'Solvent-Free Reactions', ['twelve-principles'], 'Run reactions without solvents to eliminate waste'],
    ['renewable-feedstocks', 'Renewable Feedstocks', ['twelve-principles'], 'Use plant-based starting materials instead of petroleum'],
    ['bio-catalysis', 'Biocatalysis', ['catalysis-green', 'science.chem.kinetics.enzyme-intro'], 'Use enzymes as green catalysts for industrial reactions'],
    ['flow-chemistry', 'Flow Chemistry', ['catalysis-green'], 'Run reactions in continuous flow for better control and less waste'],
    ['metrics', 'Green Metrics', ['atom-economy', 'math.equations'], 'Quantify environmental impact with E-factor and process mass intensity'],
  ]),

  // ---- Supramolecular chemistry (8) ----
  ...topic('science.chem.supramolecular', CHEM, 'creator', [ALC], [
    ['host-guest', 'Host-Guest Chemistry', ['science.chem.bonding.intermolecular'], 'Larger molecules encapsulate smaller ones through non-covalent forces'],
    ['self-assembly-chem', 'Self-Assembly', ['host-guest'], 'Molecules spontaneously organise into structured complexes'],
    ['crown-ethers', 'Crown Ethers', ['host-guest'], 'Cyclic molecules that selectively capture metal ions'],
    ['rotaxanes', 'Rotaxanes', ['self-assembly-chem'], 'Molecular dumbbell threaded through a ring'],
    ['catenanes', 'Catenanes', ['self-assembly-chem'], 'Interlocked molecular rings'],
    ['molecular-machines', 'Molecular Machines', ['rotaxanes', 'catenanes'], 'Molecular-scale devices that perform mechanical work'],
    ['dendrimers', 'Dendrimers', ['self-assembly-chem'], 'Branching tree-like polymers with precise nanoscale structure'],
    ['sensors-chem', 'Chemical Sensors', ['host-guest'], 'Design molecules that signal the presence of specific analytes'],
  ]),

  // ---- Catalysis advanced (8) ----
  ...topic('science.chem.catalysis-adv', CHEM, 'creator', [ALC], [
    ['heterogeneous', 'Heterogeneous Catalysis', ['science.chem.kinetics.catalysis'], 'Catalyst and reactants are in different phases'],
    ['homogeneous', 'Homogeneous Catalysis', ['science.chem.kinetics.catalysis'], 'Catalyst and reactants are in the same phase'],
    ['surface', 'Surface Chemistry', ['heterogeneous'], 'Study adsorption and reaction on catalyst surfaces'],
    ['zeolites', 'Zeolites', ['heterogeneous'], 'Porous aluminosilicate catalysts for petroleum refining'],
    ['organometallic', 'Organometallic Catalysts', ['homogeneous', 'science.chem.coordination.complex-ions'], 'Metal complexes that catalyse organic transformations'],
    ['asymmetric', 'Asymmetric Catalysis', ['organometallic', 'science.chem.organic-adv.chirality'], 'Produce one mirror-image form preferentially'],
    ['photocatalysis', 'Photocatalysis', ['science.chem.photochem.solar-chem'], 'Use light-activated catalysts to drive reactions'],
    ['electrocatalysis', 'Electrocatalysis', ['science.chem.electrochem.fuel-cells'], 'Catalyse reactions at electrode surfaces'],
  ]),

  // ---- Forensic chemistry (8) ----
  ...topic('science.chem.forensic', CHEM, 'creator', [ALC], [
    ['evidence-chem', 'Chemical Evidence', ['science.chem.analytical.qualitative'], 'Identify substances found at crime scenes'],
    ['drug-analysis', 'Drug Analysis', ['science.chem.spectroscopy.combined-analysis'], 'Identify controlled substances using spectral methods'],
    ['toxicology', 'Toxicology', ['drug-analysis'], 'Determine cause of death from chemical analysis'],
    ['arson-analysis', 'Arson Analysis', ['science.chem.organic.hydrocarbons'], 'Detect accelerants at fire scenes'],
    ['trace-evidence', 'Trace Evidence', ['evidence-chem'], 'Analyse paint, fibres, glass, and soil fragments'],
    ['dna-forensic', 'DNA Forensics', ['science.chem.biochem.dna-structure'], 'Match DNA profiles to identify individuals'],
    ['fingerprints', 'Fingerprint Chemistry', ['evidence-chem'], 'Develop latent fingerprints with chemical reagents'],
    ['ballistics-chem', 'Ballistics Chemistry', ['trace-evidence'], 'Analyse gunshot residue and bullet composition'],
  ]),

  // ---- Food chemistry (8) ----
  ...topic('science.chem.food', CHEM, 'creator', [ALC], [
    ['maillard', 'Maillard Reaction', ['science.chem.organic.carboxylic', 'science.chem.biochem.amino-acids'], 'Browning reaction between sugars and amino acids'],
    ['flavour', 'Flavour Chemistry', ['maillard'], 'Volatile compounds create taste and aroma'],
    ['preservation', 'Food Preservation', ['science.chem.kinetics.arrhenius'], 'Slow spoilage through temperature, pH, and chemical control'],
    ['additives', 'Food Additives', ['preservation'], 'Understand preservatives, emulsifiers, and flavour enhancers'],
    ['fermentation-chem', 'Fermentation Chemistry', ['science.chem.biochem.monosaccharides'], 'Yeast converts sugars to alcohol and carbon dioxide'],
    ['nutrition-chem', 'Nutritional Chemistry', ['science.chem.biochem.carbohydrates', 'science.chem.biochem.lipids'], 'Analyse macronutrient and micronutrient content'],
    ['antioxidants', 'Antioxidant Chemistry', ['science.chem.reaction-types.oxidation'], 'Compounds that prevent harmful oxidation in food and the body'],
    ['food-testing', 'Food Testing', ['science.chem.analytical.quantitative'], 'Verify food quality and safety through chemical analysis'],
  ]),

  // ---- Synthesis techniques expand (12) ----
  ...expand('science.chem.synthesis', CHEM, 'creator', [ALC],
    ['science.chem.organic-adv.retrosynthesis'],
    'Synthesis: {item}', 'Master the {item} technique for organic synthesis', [
    ['reflux', 'Reflux'], ['distillation-adv', 'Fractional Distillation'],
    ['recrystallization', 'Recrystallisation'], ['extraction', 'Liquid-Liquid Extraction'],
    ['column-chrom', 'Column Chromatography'], ['rotary-evap', 'Rotary Evaporation'],
    ['vacuum-filt', 'Vacuum Filtration'], ['inert-atmosphere', 'Inert Atmosphere'],
    ['microwave-synth', 'Microwave Synthesis'], ['flow-synth', 'Flow Synthesis'],
    ['solid-phase', 'Solid-Phase Synthesis'], ['asymmetric-synth', 'Asymmetric Synthesis'],
  ]),

  // ---- Capstone (8) ----
  ...parallel('science.chem.capstone', CHEM, 'creator', [ALC],
    ['science.chem.organic-adv.retrosynthesis', 'science.chem.analytical.quantitative'], [
    ['research-chem', 'Chemistry Research Project', 'Conduct original research on a chemistry topic'],
    ['total-synthesis', 'Total Synthesis Project', 'Plan and execute a multi-step organic synthesis'],
    ['analytical-project', 'Analytical Project', 'Develop and validate a new analytical method'],
    ['materials-project', 'Materials Project', 'Design and characterise a novel material'],
    ['environmental-project', 'Environmental Project', 'Investigate and propose solutions to a pollution problem'],
    ['computational-project', 'Computational Project', 'Model chemical systems using computational methods'],
    ['review-chem', 'Chemistry Literature Review', 'Survey and synthesise current research in a chemistry area'],
    ['outreach-chem', 'Chemistry Outreach', 'Create engaging demonstrations that explain chemistry to others'],
  ]),
];

// ===========================================================================
// BIOLOGY — FOUNDATION  (~60 skills)
// Ages 2-5: Living/nonliving, plants, animals, body parts, senses, habitats,
//           life cycles, food/nutrition basics
// ===========================================================================

const bioFoundation: SkillNode[] = [

  // ---- Living vs nonliving (8) ----
  ...topic('science.bio.living', BIO, 'foundation', [FOR], [
    ['alive', 'What Is Alive', ['science.living-things'], 'Living things move, grow, eat, and reproduce'],
    ['not-alive', 'Non-Living Things', ['alive'], 'Rocks, water, and toys do not grow or eat'],
    ['once-alive', 'Once Alive', ['alive'], 'Wood, wool, and leather came from living things'],
    ['needs', 'What Living Things Need', ['alive'], 'All living things need food, water, air, and shelter'],
    ['grow', 'Growing', ['needs'], 'Living things get bigger over time'],
    ['move', 'Movement', ['needs'], 'Living things can move on their own'],
    ['reproduce', 'Making More', ['needs'], 'Living things produce offspring like themselves'],
    ['respond', 'Responding', ['needs'], 'Living things react to changes around them'],
  ]),

  // ---- Plants basics (8) ----
  ...topic('science.bio.plants', BIO, 'foundation', [FOR], [
    ['parts', 'Plant Parts', ['science.plants.basics'], 'Identify roots, stems, leaves, and flowers'],
    ['roots', 'Roots', ['parts'], 'Roots anchor the plant and absorb water from soil'],
    ['stems', 'Stems', ['parts'], 'Stems hold the plant up and carry water to leaves'],
    ['leaves', 'Leaves', ['parts'], 'Leaves catch sunlight and make food for the plant'],
    ['flowers', 'Flowers', ['parts'], 'Flowers help plants make seeds'],
    ['seeds', 'Seeds', ['flowers'], 'Seeds grow into new plants when conditions are right'],
    ['trees', 'Trees', ['parts'], 'The biggest plants with thick wooden trunks'],
    ['plants-need', 'What Plants Need', ['parts'], 'Plants need sunlight, water, air, and soil to grow'],
  ]),

  // ---- Animals basics (8) ----
  ...topic('science.bio.animals', BIO, 'foundation', [FOR], [
    ['groups', 'Animal Groups', ['science.animals.basics'], 'Sort animals into mammals, birds, fish, reptiles, and insects'],
    ['mammals', 'Mammals', ['groups'], 'Warm-blooded animals with fur that feed milk to babies'],
    ['birds', 'Birds', ['groups'], 'Feathered animals with wings and beaks'],
    ['fish', 'Fish', ['groups'], 'Animals with scales and fins that breathe underwater'],
    ['reptiles', 'Reptiles', ['groups'], 'Cold-blooded animals with scaly dry skin'],
    ['insects', 'Insects', ['groups'], 'Tiny animals with six legs and three body sections'],
    ['pets', 'Pets', ['groups'], 'Animals that live with and are cared for by people'],
    ['wild', 'Wild Animals', ['groups'], 'Animals that live freely in nature'],
  ]),

  // ---- Body parts (6) ----
  ...topic('science.bio.body', BIO, 'foundation', [FOR, WS], [
    ['head', 'Head and Face', ['science.senses'], 'Identify eyes, ears, nose, mouth, and brain inside your head'],
    ['trunk', 'Trunk', ['science.observation'], 'Your chest and tummy hold your heart, lungs, and stomach'],
    ['limbs', 'Arms and Legs', ['science.observation'], 'Arms and legs help you reach, carry, walk, and run'],
    ['hands-feet', 'Hands and Feet', ['limbs'], 'Hands grip and feel; feet balance and walk'],
    ['skeleton', 'Bones', ['trunk', 'limbs'], 'A skeleton of bones holds your body up'],
    ['muscles', 'Muscles', ['skeleton'], 'Muscles pull on bones to make you move'],
  ]),

  // ---- Senses and the body (5) ----
  ...topic('science.bio.senses', BIO, 'foundation', [FOR, WS], [
    ['eyes', 'Eyes and Seeing', ['science.senses'], 'Your eyes detect light and send pictures to your brain'],
    ['ears', 'Ears and Hearing', ['science.senses'], 'Your ears catch sound vibrations and send signals to your brain'],
    ['nose', 'Nose and Smelling', ['science.senses'], 'Your nose detects chemicals in the air'],
    ['tongue', 'Tongue and Tasting', ['science.senses'], 'Your tongue detects sweet, sour, salty, and bitter chemicals'],
    ['skin', 'Skin and Touching', ['science.senses'], 'Your skin feels pressure, temperature, and pain'],
  ]),

  // ---- Habitats (8) ----
  ...topic('science.bio.habitats', BIO, 'foundation', [FOR, REEF], [
    ['what-is', 'What Is a Habitat', ['science.living-things'], 'A place where a living thing finds food, water, and shelter'],
    ['pond', 'Ponds', ['what-is'], 'A small body of still fresh water full of life'],
    ['woodland', 'Woodlands', ['what-is'], 'Forests and woods full of trees and animals'],
    ['garden', 'Gardens', ['what-is'], 'Patches of land where people grow plants and animals visit'],
    ['ocean', 'Oceans', ['what-is'], 'The vast salty waters covering most of Earth'],
    ['desert', 'Deserts', ['what-is'], 'Very dry places where tough plants and animals survive'],
    ['arctic', 'Arctic', ['what-is'], 'Icy cold lands at the top and bottom of the world'],
    ['micro', 'Microhabitats', ['what-is'], 'Tiny habitats under rocks, in leaf litter, and inside logs'],
  ]),

  // ---- Life cycles (8) ----
  ...topic('science.bio.life-cycles', BIO, 'foundation', [FOR], [
    ['what-is', 'What Is a Life Cycle', ['science.bio.living.reproduce'], 'The stages a living thing passes through from birth to death'],
    ['human', 'Human Life Cycle', ['what-is'], 'Baby, child, teenager, adult, elderly'],
    ['butterfly', 'Butterfly Life Cycle', ['what-is'], 'Egg, caterpillar, chrysalis, butterfly'],
    ['frog', 'Frog Life Cycle', ['what-is'], 'Egg, tadpole, froglet, frog'],
    ['plant-cycle', 'Plant Life Cycle', ['what-is', 'science.bio.plants.seeds'], 'Seed, seedling, plant, flower, fruit, seed again'],
    ['chicken', 'Chicken Life Cycle', ['what-is'], 'Egg, chick, hen or rooster'],
    ['compare-cycles', 'Comparing Life Cycles', ['butterfly', 'frog', 'plant-cycle'], 'Find similarities and differences between life cycles'],
    ['seasons-life', 'Seasons and Life', ['what-is', 'science.weather'], 'Plants and animals change with the seasons'],
  ]),

  // ---- Food and nutrition basics (6) ----
  ...topic('science.bio.nutrition', BIO, 'foundation', [FOR], [
    ['food-groups', 'Food Groups', ['science.observation'], 'Sort foods into fruits, vegetables, grains, protein, and dairy'],
    ['healthy', 'Healthy Eating', ['food-groups'], 'Eat a variety of foods to stay healthy'],
    ['energy-food', 'Food Gives Energy', ['healthy'], 'Your body uses food as fuel to move, grow, and think'],
    ['water-drink', 'Drinking Water', ['healthy'], 'Your body needs water every day to stay healthy'],
    ['teeth', 'Teeth and Eating', ['food-groups'], 'Different teeth cut, tear, and grind different foods'],
    ['food-sources', 'Where Food Comes From', ['food-groups'], 'Trace food from farm or sea to your plate'],
  ]),
];

// ===========================================================================
// BIOLOGY — DISCOVERY  (~170 skills)
// Grades K-2: Cells intro, plant anatomy, animal classification, ecosystems,
//             food chains, classification, heredity, adaptations, body systems
// ===========================================================================

const bioDiscovery: SkillNode[] = [

  // ---- Cells intro (10) ----
  ...topic('science.bio.cells', BIO, 'discovery', [FOR, WS], [
    ['what-is', 'What Is a Cell', ['science.bio.living.alive'], 'The smallest unit of life: every living thing is made of cells'],
    ['plant-cell', 'Plant Cells', ['what-is', 'science.plants.basics'], 'Plant cells have a wall, chloroplasts, and a large vacuole'],
    ['animal-cell', 'Animal Cells', ['what-is', 'science.animals.basics'], 'Animal cells have a membrane, nucleus, and cytoplasm'],
    ['cell-membrane', 'Cell Membrane', ['what-is'], 'A thin skin that controls what enters and leaves the cell'],
    ['nucleus-cell', 'Nucleus', ['what-is'], 'The control centre containing genetic instructions'],
    ['cytoplasm', 'Cytoplasm', ['what-is'], 'Jelly-like fluid where chemical reactions happen'],
    ['microscope', 'Using a Microscope', ['what-is', 'science.tools'], 'Magnify tiny objects to see cells and their parts'],
    ['single-cell', 'Single-Celled Organisms', ['what-is'], 'Some living things are just one cell: bacteria, amoeba'],
    ['multi-cell', 'Multi-Cellular Organisms', ['what-is'], 'Plants and animals are made of millions of cells working together'],
    ['specialised', 'Specialised Cells', ['multi-cell'], 'Different cells have different shapes for different jobs'],
  ]),

  // ---- Plant anatomy detail (10) ----
  ...topic('science.bio.plant-anatomy', BIO, 'discovery', [FOR], [
    ['root-types', 'Root Types', ['science.bio.plants.roots'], 'Compare taproots and fibrous roots'],
    ['stem-function', 'Stem Transport', ['science.bio.plants.stems'], 'Stems carry water up and food down through tubes'],
    ['leaf-structure', 'Leaf Structure', ['science.bio.plants.leaves'], 'Find the waxy surface, tiny pores, and green cells inside a leaf'],
    ['transpiration', 'Transpiration', ['leaf-structure'], 'Water evaporates from leaves, pulling more up through the stem'],
    ['pollination', 'Pollination', ['science.bio.plants.flowers'], 'Pollen moves from flower to flower by wind or insects'],
    ['seed-dispersal', 'Seed Dispersal', ['science.bio.plants.seeds'], 'Seeds travel by wind, water, animals, or explosion'],
    ['germination', 'Germination', ['science.bio.plants.seeds'], 'A seed sprouts when it gets water, warmth, and air'],
    ['photosynthesis-intro', 'Photosynthesis Introduction', ['leaf-structure'], 'Leaves use sunlight to turn water and CO2 into food'],
    ['tropism', 'Plant Responses', ['science.bio.plants.plants-need'], 'Plants grow toward light and roots grow toward water'],
    ['plant-reproduction', 'Plant Reproduction', ['pollination', 'seed-dispersal'], 'Plants reproduce through seeds or vegetative parts'],
  ]),

  // ---- Animal classification (14) ----
  ...topic('science.bio.animal-class', BIO, 'discovery', [FOR, REEF], [
    ['vertebrates', 'Vertebrates', ['science.bio.animals.groups'], 'Animals with a backbone: fish, amphibians, reptiles, birds, mammals'],
    ['invertebrates', 'Invertebrates', ['science.bio.animals.groups'], 'Animals without a backbone: insects, spiders, worms, jellyfish'],
    ['amphibians', 'Amphibians', ['vertebrates'], 'Cold-blooded animals that live in water and on land'],
    ['arachnids', 'Arachnids', ['invertebrates'], 'Eight-legged creatures: spiders, scorpions, and ticks'],
    ['crustaceans', 'Crustaceans', ['invertebrates'], 'Hard-shelled water creatures: crabs, lobsters, shrimp'],
    ['molluscs', 'Molluscs', ['invertebrates'], 'Soft-bodied animals: snails, octopus, clams'],
    ['worms', 'Worms', ['invertebrates'], 'Long, soft creatures that live in soil or water'],
    ['warm-cold', 'Warm and Cold Blooded', ['vertebrates'], 'Warm-blooded animals control body temperature; cold-blooded cannot'],
    ['herbivore', 'Herbivores', ['science.bio.animals.groups'], 'Animals that eat only plants'],
    ['carnivore', 'Carnivores', ['science.bio.animals.groups'], 'Animals that eat other animals'],
    ['omnivore', 'Omnivores', ['science.bio.animals.groups'], 'Animals that eat both plants and animals'],
    ['nocturnal', 'Nocturnal Animals', ['science.bio.animals.groups'], 'Animals active at night with special adaptations for darkness'],
    ['migration', 'Migration', ['science.bio.animals.wild'], 'Animals that travel long distances with the seasons'],
    ['hibernation', 'Hibernation', ['science.bio.animals.wild'], 'Animals that sleep through winter to save energy'],
  ]),

  // ---- Ecosystems (10) ----
  ...topic('science.bio.ecosystems', BIO, 'discovery', [FOR, REEF], [
    ['what-is', 'What Is an Ecosystem', ['science.bio.habitats.what-is'], 'All living things and non-living things interacting in an area'],
    ['producers', 'Producers', ['what-is', 'science.bio.plant-anatomy.photosynthesis-intro'], 'Green plants that make their own food from sunlight'],
    ['consumers', 'Consumers', ['what-is'], 'Animals that eat other organisms for energy'],
    ['decomposers', 'Decomposers', ['what-is'], 'Fungi and bacteria that break down dead matter'],
    ['community', 'Community', ['what-is'], 'All the living things in an ecosystem'],
    ['population', 'Population', ['community'], 'All organisms of one species in an area'],
    ['habitat-niche', 'Habitats and Niches', ['what-is'], 'Where an organism lives and what role it plays'],
    ['interdependence', 'Interdependence', ['producers', 'consumers', 'decomposers'], 'Living things depend on each other to survive'],
    ['energy-flow', 'Energy Flow', ['producers', 'consumers'], 'Energy passes from sun to plants to animals'],
    ['cycles', 'Nutrient Cycles Introduction', ['decomposers'], 'Materials are recycled between living and non-living things'],
  ]),

  // ---- Food chains and webs (10) ----
  ...topic('science.bio.food-chain', BIO, 'discovery', [FOR, REEF], [
    ['chain', 'Food Chains', ['science.bio.ecosystems.producers', 'science.bio.ecosystems.consumers'], 'A line showing who eats whom'],
    ['predator', 'Predators', ['chain'], 'Animals that hunt and eat other animals'],
    ['prey', 'Prey', ['chain'], 'Animals that are hunted and eaten by predators'],
    ['trophic', 'Trophic Levels', ['chain'], 'Each step in a food chain from producer to top predator'],
    ['web', 'Food Webs', ['chain'], 'Many interconnected food chains in an ecosystem'],
    ['pyramid-numbers', 'Pyramid of Numbers', ['trophic', 'math.counting'], 'Usually more organisms at the bottom than the top'],
    ['pyramid-energy', 'Energy Pyramid', ['trophic'], 'Energy decreases at each level of the food chain'],
    ['disruption', 'Chain Disruption', ['web'], 'Removing one species affects the whole food web'],
    ['decomposer-role', 'Decomposer Role', ['chain', 'science.bio.ecosystems.decomposers'], 'Decomposers recycle nutrients back into the soil'],
    ['aquatic-chain', 'Aquatic Food Chains', ['chain'], 'Follow food chains in ponds, rivers, and oceans'],
  ]),

  // ---- Classification (10) ----
  ...topic('science.bio.classification', BIO, 'discovery', [FOR], [
    ['why-classify', 'Why Classify', ['science.sorting', 'science.bio.animals.groups'], 'Sorting living things helps us understand and study them'],
    ['kingdoms', 'Kingdoms of Life', ['why-classify'], 'Five main groups: animals, plants, fungi, protists, bacteria'],
    ['plant-kingdom', 'Plant Kingdom', ['kingdoms'], 'Flowering plants, conifers, ferns, and mosses'],
    ['animal-kingdom', 'Animal Kingdom', ['kingdoms'], 'Vertebrates and invertebrates of all shapes and sizes'],
    ['fungi', 'Fungi Kingdom', ['kingdoms'], 'Mushrooms, moulds, and yeast: not plants, not animals'],
    ['bacteria', 'Bacteria', ['kingdoms'], 'Tiny single-celled organisms found everywhere'],
    ['keys', 'Identification Keys', ['why-classify'], 'Use yes-or-no questions to identify unknown organisms'],
    ['species', 'What Is a Species', ['kingdoms'], 'A group of organisms that can breed and produce fertile offspring'],
    ['binomial', 'Scientific Names', ['species', 'language.reading'], 'Every species has a two-part Latin name'],
    ['taxonomy-intro', 'Taxonomy Introduction', ['kingdoms'], 'Kingdom, phylum, class, order, family, genus, species'],
  ]),

  // ---- Heredity intro (8) ----
  ...topic('science.bio.heredity', BIO, 'discovery', [FOR], [
    ['offspring', 'Offspring Resemble Parents', ['science.bio.life-cycles.what-is'], 'Baby animals and plants look like their parents'],
    ['variation', 'Variation', ['offspring'], 'Individuals of the same species are not identical'],
    ['inherited', 'Inherited Traits', ['variation'], 'Some traits come from your parents: eye colour, hair type'],
    ['acquired', 'Acquired Traits', ['variation'], 'Some traits develop from experience: scars, skills'],
    ['dominant-intro', 'Dominant Traits Introduction', ['inherited'], 'Some traits show up more often than others'],
    ['selective-breed', 'Selective Breeding', ['inherited'], 'People choose animals and plants with desired traits to breed'],
    ['diversity', 'Biodiversity', ['variation'], 'The variety of living things makes ecosystems stronger'],
    ['extinction-intro', 'Extinction Introduction', ['diversity'], 'When the last member of a species dies, it is gone forever'],
  ]),

  // ---- Adaptations (10) ----
  ...topic('science.bio.adaptations', BIO, 'discovery', [FOR, REEF], [
    ['what-is', 'What Are Adaptations', ['science.bio.habitats.what-is', 'science.bio.heredity.inherited'], 'Features that help organisms survive in their habitat'],
    ['structural', 'Structural Adaptations', ['what-is'], 'Body shape features: thick fur, webbed feet, long beaks'],
    ['behavioural', 'Behavioural Adaptations', ['what-is'], 'Actions that help survival: migration, playing dead, nest building'],
    ['camouflage', 'Camouflage', ['structural'], 'Blending in with surroundings to avoid predators'],
    ['mimicry', 'Mimicry', ['structural'], 'Looking or acting like something else for protection'],
    ['desert-adapt', 'Desert Adaptations', ['what-is'], 'Storing water, big ears for cooling, nocturnal habits'],
    ['arctic-adapt', 'Arctic Adaptations', ['what-is'], 'Thick blubber, white fur, hibernation in the cold'],
    ['aquatic-adapt', 'Aquatic Adaptations', ['what-is'], 'Gills, fins, streamlined bodies, and waterproof feathers'],
    ['plant-adapt', 'Plant Adaptations', ['what-is'], 'Thorns, deep roots, and waxy leaves for different environments'],
    ['predator-adapt', 'Predator Adaptations', ['what-is'], 'Sharp claws, speed, venom, and keen senses for hunting'],
  ]),

  // ---- Human body systems intro (12) ----
  ...chain('science.bio.body-systems', BIO, 'discovery', [FOR, WS], [
    ['overview', 'Body Systems Overview', 'Your body has many systems that work together to keep you alive'],
    ['skeletal', 'Skeletal System Introduction', 'Bones support your body, protect organs, and allow movement'],
    ['muscular', 'Muscular System Introduction', 'Muscles contract to move bones and pump blood'],
    ['digestive', 'Digestive System Introduction', 'Your body breaks down food to get energy and nutrients'],
    ['circulatory', 'Circulatory System Introduction', 'Heart and blood vessels carry oxygen and nutrients everywhere'],
    ['respiratory', 'Respiratory System Introduction', 'Lungs breathe in oxygen and breathe out carbon dioxide'],
    ['nervous', 'Nervous System Introduction', 'Brain and nerves control everything: movement, thoughts, senses'],
    ['excretory', 'Excretory System Introduction', 'Kidneys and skin remove waste products from your body'],
    ['immune', 'Immune System Introduction', 'Your body fights off germs that try to make you sick'],
    ['reproductive', 'Reproductive System Introduction', 'Systems that allow organisms to produce offspring'],
    ['endocrine-intro', 'Endocrine System Introduction', 'Glands release hormones that control growth and development'],
    ['integumentary', 'Skin System Introduction', 'Skin protects you from germs, sun, and water loss'],
  ], ['science.bio.body.skeleton']),

  // ---- Microbes intro (8) ----
  ...topic('science.bio.microbes', BIO, 'discovery', [FOR, WS], [
    ['what-are', 'What Are Microbes', ['science.bio.classification.bacteria'], 'Tiny living things too small to see: bacteria, viruses, fungi'],
    ['helpful', 'Helpful Microbes', ['what-are'], 'Bacteria in yoghurt, yeast in bread, decomposers in soil'],
    ['harmful', 'Harmful Microbes', ['what-are'], 'Germs that cause illness: cold, flu, food poisoning'],
    ['spread', 'How Germs Spread', ['harmful'], 'Through air, water, food, touch, and animal bites'],
    ['handwashing', 'Handwashing', ['spread'], 'Washing hands properly is the best defence against germs'],
    ['vaccines-intro', 'Vaccines Introduction', ['harmful'], 'Tiny safe doses that teach your body to fight diseases'],
    ['antibiotics-intro', 'Antibiotics Introduction', ['harmful'], 'Medicines that kill or stop bacteria from growing'],
    ['microscope-microbes', 'Viewing Microbes', ['what-are', 'science.bio.cells.microscope'], 'Use a microscope to see bacteria, yeast, and pond life'],
  ]),

  // ---- Health and hygiene (8) ----
  ...topic('science.bio.health', BIO, 'discovery', [FOR], [
    ['hygiene', 'Personal Hygiene', ['science.bio.microbes.handwashing'], 'Keep clean to stay healthy: bathing, brushing teeth, clean clothes'],
    ['exercise', 'Exercise', ['science.bio.body.muscles'], 'Moving your body keeps your heart, muscles, and bones strong'],
    ['sleep', 'Sleep', ['science.bio.body-systems.nervous'], 'Sleep helps your body repair and your brain organise memories'],
    ['balanced-diet', 'Balanced Diet', ['science.bio.nutrition.healthy'], 'Eat the right amounts from each food group'],
    ['nutrients', 'Nutrients', ['balanced-diet'], 'Carbohydrates, proteins, fats, vitamins, and minerals'],
    ['dental', 'Dental Health', ['science.bio.nutrition.teeth'], 'Brush, floss, and limit sugar to keep teeth healthy'],
    ['mental-health', 'Mental Health', ['sleep'], 'Taking care of your feelings and asking for help when needed'],
    ['first-aid-intro', 'First Aid Introduction', ['hygiene'], 'Basic steps to help if someone is hurt'],
  ]),

  // ---- Conservation intro (6) ----
  ...topic('science.bio.conservation', BIO, 'discovery', [FOR, REEF], [
    ['why-conserve', 'Why Conserve', ['science.bio.heredity.diversity'], 'Protecting nature keeps ecosystems healthy for all'],
    ['endangered', 'Endangered Species', ['science.bio.heredity.extinction-intro'], 'Species at risk of disappearing forever'],
    ['habitat-loss', 'Habitat Loss', ['why-conserve'], 'Cutting forests and draining wetlands destroys homes'],
    ['pollution-bio', 'Pollution', ['why-conserve'], 'Chemicals and rubbish harm plants, animals, and water'],
    ['recycle', 'Reduce, Reuse, Recycle', ['pollution-bio'], 'Simple actions to reduce waste and protect the planet'],
    ['wildlife-reserves', 'Wildlife Reserves', ['endangered'], 'Protected areas where plants and animals can thrive safely'],
  ]),

  // ---- Habitat types expand (10) ----
  ...expand('science.bio.habitat-type', BIO, 'discovery', [FOR, REEF],
    ['science.bio.habitats.what-is'],
    'Habitat: {item}', 'Explore the living things and conditions in a {item} habitat', [
    ['rainforest', 'Rainforest'], ['coral-reef', 'Coral Reef'], ['grassland', 'Grassland'],
    ['tundra', 'Tundra'], ['wetland', 'Wetland'], ['mountain', 'Mountain'],
    ['deep-sea', 'Deep Sea'], ['cave', 'Cave'], ['mangrove', 'Mangrove'],
    ['estuary', 'Estuary'],
  ]),

  // ---- Animal groups detail expand (12) ----
  ...expand('science.bio.animal-detail', BIO, 'discovery', [FOR, REEF],
    ['science.bio.animal-class.vertebrates', 'science.bio.animal-class.invertebrates'],
    'Animal Group: {item}', 'Study the features and life of {item}', [
    ['sharks', 'Sharks'], ['whales', 'Whales'], ['primates', 'Primates'],
    ['big-cats', 'Big Cats'], ['raptors', 'Raptors'], ['penguins', 'Penguins'],
    ['sea-turtles', 'Sea Turtles'], ['frogs-detail', 'Frogs'], ['beetles', 'Beetles'],
    ['butterflies-detail', 'Butterflies'], ['octopus-detail', 'Octopuses'],
    ['coral-animals', 'Corals'],
  ]),
];

// ===========================================================================
// BIOLOGY — BUILDER  (~220 skills)
// Grades 3-5: Cell structure, photosynthesis, respiration, genetics, evolution,
//             ecology, human body systems detail, disease/immunity
// ===========================================================================

const bioBuilder: SkillNode[] = [

  // ---- Cell structure detail (14) ----
  ...topic('science.bio.cell-struct', BIO, 'builder', [FOR, WS], [
    ['organelles', 'Organelles', ['science.bio.cells.what-is'], 'Tiny structures inside cells that each have a specific job'],
    ['mitochondria', 'Mitochondria', ['organelles'], 'Powerhouses that release energy from food through respiration'],
    ['chloroplast', 'Chloroplasts', ['organelles', 'science.bio.cells.plant-cell'], 'Green organelles that capture light energy for photosynthesis'],
    ['ribosome', 'Ribosomes', ['organelles'], 'Tiny factories that build proteins from instructions'],
    ['er', 'Endoplasmic Reticulum', ['ribosome'], 'A network of membranes that transports materials through the cell'],
    ['golgi', 'Golgi Apparatus', ['er'], 'Packages and ships proteins to where they are needed'],
    ['vacuole', 'Vacuoles', ['organelles'], 'Storage sacs for water, nutrients, and waste'],
    ['cell-wall', 'Cell Wall', ['organelles', 'science.bio.cells.plant-cell'], 'A rigid outer layer that gives plant cells their shape'],
    ['cell-division', 'Cell Division Introduction', ['organelles'], 'Cells reproduce by splitting into two identical copies'],
    ['mitosis', 'Mitosis', ['cell-division'], 'Cell division that produces two identical daughter cells'],
    ['meiosis-intro', 'Meiosis Introduction', ['cell-division'], 'Special division that produces sex cells with half the DNA'],
    ['diffusion', 'Diffusion', ['science.bio.cells.cell-membrane'], 'Particles move from high to low concentration naturally'],
    ['osmosis', 'Osmosis', ['diffusion'], 'Water moves through membranes from dilute to concentrated'],
    ['active-transport', 'Active Transport', ['diffusion'], 'Cells use energy to move particles against the concentration gradient'],
  ]),

  // ---- Photosynthesis (10) ----
  ...chain('science.bio.photosynthesis', BIO, 'builder', [FOR], [
    ['equation', 'Photosynthesis Equation', 'Carbon dioxide plus water plus light energy yields glucose and oxygen'],
    ['light-role', 'Role of Light', 'Light provides energy to split water molecules'],
    ['chlorophyll', 'Chlorophyll', 'The green pigment that captures light energy'],
    ['light-reactions', 'Light Reactions', 'Water is split and energy carriers are made in the thylakoid'],
    ['calvin-intro', 'Calvin Cycle Introduction', 'CO2 is fixed into glucose in the stroma'],
    ['factors', 'Limiting Factors', 'Light intensity, CO2 concentration, and temperature affect rate'],
    ['rate', 'Measuring Rate', 'Count oxygen bubbles or measure gas volume to find the rate'],
    ['leaf-adaptations', 'Leaf Adaptations for Photosynthesis', 'Large surface area, thin shape, many chloroplasts, stomata'],
    ['importance', 'Importance of Photosynthesis', 'Photosynthesis produces food for plants and oxygen for animals'],
    ['artificial', 'Artificial Photosynthesis Introduction', 'Mimic photosynthesis to produce clean fuel from sunlight'],
  ], ['science.bio.plant-anatomy.photosynthesis-intro', 'science.chem.molecules.carbon-dioxide', 'math.equations']),

  // ---- Cellular respiration (8) ----
  ...chain('science.bio.respiration', BIO, 'builder', [FOR, WS], [
    ['equation', 'Respiration Equation', 'Glucose plus oxygen yields carbon dioxide, water, and energy'],
    ['aerobic', 'Aerobic Respiration', 'Uses oxygen to release maximum energy from glucose'],
    ['anaerobic', 'Anaerobic Respiration', 'Releases energy without oxygen, producing lactic acid or ethanol'],
    ['glycolysis-intro', 'Glycolysis Introduction', 'Glucose is split into two smaller molecules in the cytoplasm'],
    ['krebs-intro', 'Krebs Cycle Introduction', 'A cycle of reactions that releases energy carriers in mitochondria'],
    ['etc-intro', 'Electron Transport Introduction', 'Energy carriers power a chain that makes most of the ATP'],
    ['comparison', 'Photosynthesis vs Respiration', 'Opposite processes that depend on each other'],
    ['fermentation', 'Fermentation', 'Anaerobic respiration used in baking and brewing'],
  ], ['science.bio.cell-struct.mitochondria', 'science.chem.molecules.formulas', 'math.equations']),

  // ---- Genetics (16) ----
  ...topic('science.bio.genetics', BIO, 'builder', [FOR, WS], [
    ['dna-intro', 'DNA Introduction', ['science.bio.cell-struct.cell-division'], 'The molecule inside every cell that carries genetic instructions'],
    ['chromosomes', 'Chromosomes', ['dna-intro'], 'Tightly coiled DNA packed into thread-like structures'],
    ['genes', 'Genes', ['chromosomes'], 'Sections of DNA that code for specific traits'],
    ['alleles', 'Alleles', ['genes'], 'Different versions of the same gene'],
    ['dominant', 'Dominant and Recessive', ['alleles'], 'Dominant alleles show when one copy is present; recessive need two'],
    ['genotype', 'Genotype', ['alleles'], 'The pair of alleles an organism carries for a trait'],
    ['phenotype', 'Phenotype', ['genotype'], 'The observable characteristic produced by the genotype'],
    ['punnett', 'Punnett Squares', ['genotype', 'phenotype', 'math.probability.basic'], 'Predict offspring ratios by crossing parental alleles'],
    ['monohybrid', 'Monohybrid Crosses', ['punnett'], 'Follow one trait through a genetic cross'],
    ['dihybrid-intro', 'Dihybrid Cross Introduction', ['monohybrid'], 'Follow two traits through a genetic cross'],
    ['sex-linked', 'Sex-Linked Traits', ['chromosomes'], 'Traits carried on the X or Y chromosome'],
    ['codominance', 'Codominance', ['dominant'], 'Both alleles contribute to the phenotype together'],
    ['incomplete', 'Incomplete Dominance', ['dominant'], 'The heterozygote shows a blend of both alleles'],
    ['mutations', 'Mutations', ['genes'], 'Random changes in DNA that may alter traits'],
    ['genetic-disorders', 'Genetic Disorders', ['mutations', 'punnett'], 'Inherited conditions caused by faulty genes'],
    ['genetic-testing', 'Genetic Testing', ['genetic-disorders'], 'Analyse DNA to identify genetic conditions'],
  ]),

  // ---- Evolution (14) ----
  ...topic('science.bio.evolution', BIO, 'builder', [FOR, RUI], [
    ['darwin', 'Darwin and Natural Selection', ['science.bio.heredity.variation', 'science.bio.adaptations.what-is'], 'Organisms best adapted to their environment survive and reproduce'],
    ['natural-selection', 'Natural Selection', ['darwin'], 'Variation, competition, survival, and reproduction drive evolution'],
    ['evidence-fossils', 'Fossil Evidence', ['darwin'], 'Fossils show how organisms changed over millions of years'],
    ['evidence-anatomy', 'Anatomical Evidence', ['darwin'], 'Similar bone structures suggest common ancestry'],
    ['evidence-dna', 'DNA Evidence', ['darwin', 'science.bio.genetics.dna-intro'], 'Shared DNA sequences reveal evolutionary relationships'],
    ['speciation', 'Speciation', ['natural-selection'], 'New species form when populations are separated and adapt differently'],
    ['common-ancestor', 'Common Ancestors', ['evidence-anatomy', 'evidence-dna'], 'All life shares ancestors if you go back far enough'],
    ['tree-of-life', 'Tree of Life', ['common-ancestor'], 'A branching diagram showing evolutionary relationships'],
    ['extinction', 'Extinction', ['natural-selection'], 'Species that cannot adapt to change eventually die out'],
    ['mass-extinction', 'Mass Extinctions', ['extinction'], 'Events that wiped out huge numbers of species at once'],
    ['coevolution', 'Coevolution', ['natural-selection'], 'Two species evolve together in response to each other'],
    ['convergent', 'Convergent Evolution', ['natural-selection'], 'Unrelated species evolve similar features in similar environments'],
    ['artificial-select', 'Artificial Selection', ['science.bio.heredity.selective-breed'], 'Humans select traits in crops and livestock over generations'],
    ['evolution-timeline', 'Evolution Timeline', ['mass-extinction', 'math.measurement.time'], 'Map major evolutionary events across geologic time'],
  ]),

  // ---- Ecology (14) ----
  ...topic('science.bio.ecology', BIO, 'builder', [FOR, REEF], [
    ['abiotic', 'Abiotic Factors', ['science.bio.ecosystems.what-is'], 'Non-living factors: light, temperature, water, pH, soil'],
    ['biotic', 'Biotic Factors', ['science.bio.ecosystems.what-is'], 'Living factors: predators, competition, disease, food supply'],
    ['competition', 'Competition', ['biotic'], 'Organisms compete for limited resources'],
    ['predator-prey', 'Predator-Prey Relationships', ['biotic', 'math.data.graphs'], 'Predator and prey populations rise and fall in cycles'],
    ['symbiosis', 'Symbiosis', ['biotic'], 'Close relationships between different species'],
    ['mutualism', 'Mutualism', ['symbiosis'], 'Both species benefit from the relationship'],
    ['parasitism', 'Parasitism', ['symbiosis'], 'One species benefits while the other is harmed'],
    ['commensalism', 'Commensalism', ['symbiosis'], 'One species benefits and the other is unaffected'],
    ['succession', 'Ecological Succession', ['science.bio.ecosystems.community'], 'Ecosystems change over time from bare ground to climax community'],
    ['carbon-cycle', 'Carbon Cycle', ['science.bio.ecosystems.cycles', 'science.bio.photosynthesis.equation'], 'Carbon moves between atmosphere, organisms, oceans, and rocks'],
    ['nitrogen-cycle', 'Nitrogen Cycle', ['science.bio.ecosystems.cycles'], 'Nitrogen is fixed, used by organisms, and returned to the atmosphere'],
    ['water-cycle-bio', 'Water Cycle in Ecosystems', ['science.bio.ecosystems.cycles'], 'Water moves through evaporation, transpiration, and precipitation'],
    ['sampling', 'Ecological Sampling', ['science.bio.ecosystems.population', 'math.data.collection'], 'Use quadrats and transects to estimate population size'],
    ['biodiversity-index', 'Biodiversity Index', ['sampling', 'math.statistics.descriptive'], 'Calculate species richness and evenness in an area'],
  ]),

  // ---- Human body systems detail (50) ----
  ...topic('science.bio.skeletal', BIO, 'builder', [WS], [
    ['bones', 'Bones Detail', ['science.bio.body-systems.skeletal'], 'Bones are living tissue with blood vessels and nerves'],
    ['joints', 'Joints', ['bones'], 'Where two bones meet: hinge, ball-and-socket, pivot'],
    ['cartilage', 'Cartilage', ['joints'], 'Smooth, flexible tissue that cushions joints'],
    ['ligaments', 'Ligaments', ['joints'], 'Strong bands that hold bones together at joints'],
    ['bone-growth', 'Bone Growth', ['bones'], 'Bones grow longer and stronger through childhood'],
    ['fractures', 'Fractures', ['bones'], 'Broken bones heal by forming new bone tissue'],
  ]),

  ...topic('science.bio.muscular', BIO, 'builder', [WS], [
    ['types', 'Muscle Types', ['science.bio.body-systems.muscular'], 'Skeletal, smooth, and cardiac muscles have different roles'],
    ['contraction', 'Muscle Contraction', ['types'], 'Muscles shorten when nerve signals tell them to contract'],
    ['pairs', 'Antagonistic Pairs', ['contraction'], 'Muscles work in pairs: one contracts while the other relaxes'],
    ['tendons', 'Tendons', ['contraction'], 'Strong cords that attach muscles to bones'],
    ['exercise-muscle', 'Muscles and Exercise', ['contraction'], 'Regular exercise makes muscles stronger and more enduring'],
  ]),

  ...topic('science.bio.nervous', BIO, 'builder', [WS], [
    ['brain', 'The Brain', ['science.bio.body-systems.nervous'], 'The command centre: cerebrum, cerebellum, and brainstem'],
    ['spinal-cord', 'Spinal Cord', ['brain'], 'A highway of nerves connecting brain to body'],
    ['neurons', 'Neurons', ['brain'], 'Nerve cells that carry electrical signals'],
    ['reflex', 'Reflexes', ['neurons', 'spinal-cord'], 'Automatic fast responses that bypass the brain'],
    ['senses-nervous', 'Senses and the Nervous System', ['neurons'], 'Sense organs send signals along nerves to the brain'],
    ['reaction-time', 'Reaction Time', ['reflex', 'math.measurement.time'], 'Measure how fast your nervous system responds'],
  ]),

  ...topic('science.bio.digestive', BIO, 'builder', [WS], [
    ['mouth', 'Mouth and Teeth', ['science.bio.body-systems.digestive'], 'Teeth chew food and saliva starts breaking down starch'],
    ['oesophagus', 'Oesophagus', ['mouth'], 'Muscles push food down the tube to the stomach'],
    ['stomach', 'Stomach', ['oesophagus'], 'Acid and enzymes break food into a soupy mixture'],
    ['small-intestine', 'Small Intestine', ['stomach'], 'Nutrients are absorbed into the blood through tiny villi'],
    ['large-intestine', 'Large Intestine', ['small-intestine'], 'Water is absorbed and waste is compacted'],
    ['enzymes', 'Digestive Enzymes', ['stomach', 'small-intestine'], 'Proteins that speed up the breakdown of food molecules'],
    ['absorption', 'Nutrient Absorption', ['small-intestine'], 'Villi provide a huge surface area for absorbing nutrients'],
  ]),

  ...topic('science.bio.circulatory', BIO, 'builder', [WS], [
    ['heart', 'The Heart', ['science.bio.body-systems.circulatory'], 'A muscular pump with four chambers'],
    ['blood-vessels', 'Blood Vessels', ['heart'], 'Arteries, veins, and capillaries carry blood around the body'],
    ['arteries', 'Arteries', ['blood-vessels'], 'Thick-walled vessels carrying blood away from the heart'],
    ['veins', 'Veins', ['blood-vessels'], 'Thin-walled vessels with valves carrying blood to the heart'],
    ['capillaries', 'Capillaries', ['blood-vessels'], 'Tiny vessels where exchange between blood and tissues occurs'],
    ['blood', 'Blood Components', ['heart'], 'Red cells, white cells, platelets, and plasma'],
    ['red-cells', 'Red Blood Cells', ['blood'], 'Carry oxygen using haemoglobin'],
    ['white-cells', 'White Blood Cells', ['blood'], 'Fight infections and destroy invaders'],
    ['circulation', 'Double Circulation', ['heart'], 'Blood flows to lungs then body in two separate circuits'],
  ]),

  ...topic('science.bio.respiratory', BIO, 'builder', [WS], [
    ['lungs', 'Lungs', ['science.bio.body-systems.respiratory'], 'Spongy organs where gas exchange occurs'],
    ['breathing', 'Breathing Mechanism', ['lungs'], 'Diaphragm and ribs expand the chest to pull air in'],
    ['alveoli', 'Alveoli', ['lungs'], 'Tiny air sacs with thin walls for efficient gas exchange'],
    ['gas-exchange', 'Gas Exchange', ['alveoli', 'science.bio.circulatory.capillaries'], 'Oxygen enters blood and carbon dioxide leaves in the alveoli'],
    ['breathing-rate', 'Breathing Rate', ['breathing', 'math.measurement.time'], 'Exercise increases breathing rate to supply more oxygen'],
    ['smoking', 'Effects of Smoking', ['alveoli'], 'Smoking damages alveoli and increases disease risk'],
  ]),

  // ---- Disease and immunity (12) ----
  ...topic('science.bio.disease', BIO, 'builder', [FOR, WS], [
    ['pathogens', 'Pathogens', ['science.bio.microbes.harmful'], 'Bacteria, viruses, fungi, and parasites that cause disease'],
    ['bacterial-disease', 'Bacterial Diseases', ['pathogens'], 'Infections caused by bacteria: food poisoning, tuberculosis'],
    ['viral-disease', 'Viral Diseases', ['pathogens'], 'Infections caused by viruses: flu, measles, COVID'],
    ['spread-disease', 'How Diseases Spread', ['pathogens'], 'Droplets, direct contact, contaminated water, and vectors'],
    ['defence', 'Body Defences', ['pathogens', 'science.bio.body-systems.immune'], 'Skin, mucus, stomach acid, and white blood cells stop invaders'],
    ['antibodies', 'Antibodies', ['defence'], 'Proteins made by white blood cells that lock onto specific pathogens'],
    ['vaccination', 'Vaccination', ['antibodies', 'science.bio.microbes.vaccines-intro'], 'Dead or weakened pathogens trigger immunity without disease'],
    ['antibiotic-detail', 'Antibiotics Detail', ['science.bio.microbes.antibiotics-intro'], 'Medicines that kill bacteria but not viruses'],
    ['resistance', 'Antibiotic Resistance', ['antibiotic-detail', 'science.bio.evolution.natural-selection'], 'Overusing antibiotics breeds resistant bacteria'],
    ['non-communicable', 'Non-Communicable Diseases', ['pathogens'], 'Diseases not spread between people: cancer, diabetes, heart disease'],
    ['lifestyle', 'Lifestyle and Disease', ['non-communicable'], 'Diet, exercise, smoking, and alcohol affect disease risk'],
    ['clinical-trials-bio', 'Clinical Trials', ['vaccination'], 'Test new medicines for safety and effectiveness before public use'],
  ]),

  // ---- Reproduction (10) ----
  ...topic('science.bio.reproduction', BIO, 'builder', [FOR, WS], [
    ['asexual', 'Asexual Reproduction', ['science.bio.cell-struct.mitosis'], 'One parent produces genetically identical offspring'],
    ['sexual', 'Sexual Reproduction', ['science.bio.cell-struct.meiosis-intro'], 'Two parents combine DNA to produce genetically unique offspring'],
    ['gametes', 'Gametes', ['sexual'], 'Sex cells: sperm and egg each carry half the chromosomes'],
    ['fertilisation', 'Fertilisation', ['gametes'], 'Sperm and egg fuse to form a cell with a complete set of chromosomes'],
    ['development', 'Embryo Development', ['fertilisation'], 'A fertilised egg divides and grows into a new organism'],
    ['plant-repro', 'Plant Reproduction Detail', ['science.bio.plant-anatomy.plant-reproduction'], 'Flowers, cones, spores, and vegetative methods'],
    ['pollination-detail', 'Pollination Detail', ['plant-repro'], 'Wind and insect pollination strategies'],
    ['fruits', 'Fruits and Seeds', ['plant-repro'], 'Fruits protect seeds and help them disperse'],
    ['cloning-intro', 'Cloning Introduction', ['asexual'], 'Produce genetically identical organisms artificially'],
    ['advantages', 'Asexual vs Sexual', ['asexual', 'sexual'], 'Compare advantages and disadvantages of each strategy'],
  ]),

  // ---- Plant biology detail (10) ----
  ...topic('science.bio.plant-bio', BIO, 'builder', [FOR], [
    ['xylem', 'Xylem', ['science.bio.plant-anatomy.stem-function'], 'Dead tubes that transport water and minerals upward'],
    ['phloem', 'Phloem', ['science.bio.plant-anatomy.stem-function'], 'Living tubes that transport dissolved sugars throughout the plant'],
    ['stomata', 'Stomata', ['science.bio.plant-anatomy.leaf-structure'], 'Tiny pores that open and close to control gas exchange'],
    ['guard-cells', 'Guard Cells', ['stomata'], 'Bean-shaped cells that control stomatal opening'],
    ['transpiration-detail', 'Transpiration Detail', ['stomata', 'science.bio.plant-anatomy.transpiration'], 'Water loss from leaves drives the upward pull of water'],
    ['mineral-nutrition', 'Mineral Nutrition', ['xylem'], 'Plants need nitrogen, phosphorus, potassium, and more from soil'],
    ['plant-hormones', 'Plant Hormones', ['science.bio.plant-anatomy.tropism'], 'Auxin, gibberellin, and ethylene control growth and responses'],
    ['phototropism', 'Phototropism', ['plant-hormones'], 'Auxin causes plants to grow toward light'],
    ['gravitropism', 'Gravitropism', ['plant-hormones'], 'Roots grow downward and shoots grow upward in response to gravity'],
    ['commercial', 'Commercial Plant Biology', ['plant-hormones'], 'Use hormones and selective breeding to improve crop yields'],
  ]),

  // ---- Organism phyla expand (12) ----
  ...expand('science.bio.phylum', BIO, 'builder', [FOR, REEF],
    ['science.bio.classification.taxonomy-intro'],
    'Phylum: {item}', 'Study the characteristics and diversity of {item}', [
    ['chordata', 'Chordata'], ['arthropoda', 'Arthropoda'], ['mollusca', 'Mollusca'],
    ['annelida', 'Annelida'], ['cnidaria', 'Cnidaria'], ['echinodermata', 'Echinodermata'],
    ['porifera', 'Porifera'], ['nematoda', 'Nematoda'], ['platyhelminthes', 'Platyhelminthes'],
    ['bryophyta', 'Bryophyta'], ['pteridophyta', 'Pteridophyta'], ['angiosperms', 'Angiosperms'],
  ]),

  // ---- Lab biology (8) ----
  ...parallel('science.bio.lab', BIO, 'builder', [FOR, WS],
    ['science.bio.cells.microscope', 'science.physics.lab.hypothesis'], [
    ['dissection', 'Dissection', 'Examine internal structures of a flower, fish, or eye safely'],
    ['staining', 'Cell Staining', 'Use dyes to make cell structures visible under a microscope'],
    ['culturing', 'Culturing Microorganisms', 'Grow bacteria on agar plates following aseptic technique'],
    ['field-study', 'Field Study', 'Observe and record organisms in their natural habitats'],
    ['photosynthesis-lab', 'Photosynthesis Experiments', 'Measure oxygen production to investigate photosynthesis rate'],
    ['enzyme-lab', 'Enzyme Experiments', 'Test how temperature and pH affect enzyme activity'],
    ['respiration-lab', 'Respiration Experiments', 'Measure CO2 production to investigate respiration rate'],
    ['genetics-lab', 'Genetics Modelling', 'Use coins or dice to simulate genetic inheritance'],
  ]),
];

// ===========================================================================
// BIOLOGY — INNOVATOR  (~250 skills)
// Grades 6-8: Molecular bio, DNA/RNA, protein synthesis, gene expression,
//             biotech, microbiology, physiology, neuroscience, immunology,
//             ecology advanced
// ===========================================================================

const bioInnovator: SkillNode[] = [

  // ---- Molecular biology (14) ----
  ...topic('science.bio.molecular', BIO, 'innovator', [FOR, WS], [
    ['dna-structure', 'DNA Structure Detail', ['science.bio.genetics.dna-intro', 'science.chem.biochem.dna-structure'], 'A double helix with sugar-phosphate backbone and base pairs'],
    ['base-pairing', 'Base Pairing', ['dna-structure'], 'Adenine pairs with thymine; cytosine pairs with guanine'],
    ['replication', 'DNA Replication', ['base-pairing'], 'The double helix unzips and each strand is copied'],
    ['rna', 'RNA', ['dna-structure'], 'Single-stranded nucleic acid: mRNA, tRNA, rRNA'],
    ['transcription', 'Transcription', ['rna'], 'DNA is copied into messenger RNA in the nucleus'],
    ['translation', 'Translation', ['transcription'], 'Ribosomes read mRNA and build proteins from amino acids'],
    ['codons', 'Codons', ['transcription'], 'Three-letter codes in mRNA that specify amino acids'],
    ['genetic-code', 'The Genetic Code', ['codons'], 'The universal dictionary from codons to amino acids'],
    ['protein-folding', 'Protein Folding', ['translation', 'science.chem.biochem.proteins-intro'], 'Amino acid chains fold into specific 3D shapes'],
    ['enzymes-molecular', 'Enzymes at Molecular Level', ['protein-folding'], 'Shape determines which substrates fit the active site'],
    ['gene-regulation', 'Gene Regulation Introduction', ['transcription'], 'Not all genes are active all the time'],
    ['promoters', 'Promoters and Enhancers', ['gene-regulation'], 'DNA sequences that control when and where genes are turned on'],
    ['epigenetics-intro', 'Epigenetics Introduction', ['gene-regulation'], 'Chemical modifications that affect gene activity without changing DNA'],
    ['central-dogma', 'Central Dogma', ['replication', 'transcription', 'translation'], 'DNA makes RNA makes protein: the flow of genetic information'],
  ]),

  // ---- Biotechnology (14) ----
  ...topic('science.bio.biotech', BIO, 'innovator', [WS], [
    ['restriction-enzymes', 'Restriction Enzymes', ['science.bio.molecular.dna-structure'], 'Molecular scissors that cut DNA at specific sequences'],
    ['gel-electrophoresis', 'Gel Electrophoresis', ['restriction-enzymes'], 'Separate DNA fragments by size in an electric field'],
    ['pcr', 'PCR', ['science.bio.molecular.replication'], 'Polymerase chain reaction: copy tiny DNA samples billions of times'],
    ['cloning-gene', 'Gene Cloning', ['restriction-enzymes'], 'Insert a gene into a bacterial plasmid to make copies'],
    ['gmo', 'Genetic Modification', ['cloning-gene'], 'Insert genes from one species into another'],
    ['crispr', 'CRISPR Introduction', ['restriction-enzymes'], 'Edit genes precisely at any location in the genome'],
    ['gene-therapy', 'Gene Therapy', ['crispr'], 'Replace faulty genes to treat genetic diseases'],
    ['forensic-dna', 'DNA Profiling', ['gel-electrophoresis', 'pcr'], 'Create unique genetic fingerprints for identification'],
    ['sequencing', 'DNA Sequencing', ['pcr'], 'Read the order of bases in a strand of DNA'],
    ['bioinformatics-intro', 'Bioinformatics Introduction', ['sequencing'], 'Use computers to analyse biological data'],
    ['stem-cells-intro', 'Stem Cells Introduction', ['science.bio.cell-struct.cell-division'], 'Unspecialised cells that can become any cell type'],
    ['tissue-engineering', 'Tissue Engineering', ['stem-cells-intro'], 'Grow replacement tissues and organs in the lab'],
    ['ethics-biotech', 'Bioethics Introduction', ['gmo', 'crispr'], 'Consider the moral implications of genetic technologies'],
    ['agriculture-biotech', 'Agricultural Biotechnology', ['gmo'], 'Improve crops through genetic engineering for yield and resistance'],
  ]),

  // ---- Microbiology (12) ----
  ...topic('science.bio.microbiology', BIO, 'innovator', [WS, FOR], [
    ['bacterial-struct', 'Bacterial Structure', ['science.bio.classification.bacteria'], 'Cell wall, membrane, DNA loop, ribosomes, flagella'],
    ['bacterial-repro', 'Bacterial Reproduction', ['bacterial-struct'], 'Binary fission: one cell splits into two identical cells rapidly'],
    ['growth-curve', 'Bacterial Growth Curve', ['bacterial-repro', 'math.data.graphs'], 'Lag, exponential, stationary, and death phases'],
    ['virus-structure', 'Virus Structure', ['science.bio.disease.pathogens'], 'Protein coat surrounding genetic material: not truly alive'],
    ['virus-replication', 'Virus Replication', ['virus-structure'], 'Viruses hijack host cells to make copies of themselves'],
    ['fungi-detail', 'Fungi Biology', ['science.bio.classification.fungi'], 'Hyphae, mycelium, and spore reproduction'],
    ['protists', 'Protists', ['science.bio.classification.kingdoms'], 'Single-celled eukaryotes: amoeba, paramecium, algae'],
    ['archaea', 'Archaea', ['bacterial-struct'], 'Ancient microbes thriving in extreme environments'],
    ['biofilm', 'Biofilms', ['bacterial-repro'], 'Bacteria form protective communities on surfaces'],
    ['industrial-micro', 'Industrial Microbiology', ['bacterial-repro'], 'Use microbes to make food, medicine, and biofuels'],
    ['microbiome-intro', 'Human Microbiome Introduction', ['bacterial-struct'], 'Trillions of microbes living in and on your body'],
    ['aseptic', 'Aseptic Technique', ['science.bio.lab.culturing'], 'Prevent contamination when working with microbes'],
  ]),

  // ---- Physiology advanced (12) ----
  ...topic('science.bio.physiology', BIO, 'innovator', [WS], [
    ['homeostasis', 'Homeostasis', ['science.bio.body-systems.overview'], 'The body maintains stable internal conditions despite external changes'],
    ['thermoregulation', 'Thermoregulation', ['homeostasis'], 'Sweating, shivering, and blood vessel changes control body temperature'],
    ['blood-glucose', 'Blood Glucose Regulation', ['homeostasis'], 'Insulin and glucagon keep blood sugar at the right level'],
    ['osmoregulation', 'Osmoregulation', ['homeostasis', 'science.bio.cell-struct.osmosis'], 'Kidneys control water and salt balance in the blood'],
    ['kidney-detail', 'Kidney Detail', ['osmoregulation'], 'Nephrons filter blood and produce urine'],
    ['liver', 'Liver Functions', ['homeostasis'], 'Detoxification, bile production, and nutrient processing'],
    ['hormones', 'Hormones Detail', ['science.bio.body-systems.endocrine-intro'], 'Chemical messengers carried in the blood to target organs'],
    ['adrenaline', 'Adrenaline', ['hormones'], 'The fight-or-flight hormone that prepares the body for action'],
    ['insulin', 'Insulin and Diabetes', ['blood-glucose'], 'Insufficient insulin or insulin resistance causes diabetes'],
    ['reproductive-hormones', 'Reproductive Hormones', ['hormones'], 'Oestrogen, testosterone, and progesterone control reproduction'],
    ['menstrual-cycle', 'Menstrual Cycle', ['reproductive-hormones'], 'A monthly hormone cycle that prepares the body for pregnancy'],
    ['feedback', 'Feedback Mechanisms', ['homeostasis'], 'Negative feedback loops maintain balance; positive feedback amplifies'],
  ]),

  // ---- Neuroscience (12) ----
  ...topic('science.bio.neuroscience', BIO, 'innovator', [WS], [
    ['neuron-detail', 'Neuron Structure Detail', ['science.bio.nervous.neurons'], 'Dendrites receive signals; axons transmit them; myelin insulates'],
    ['action-potential', 'Action Potential', ['neuron-detail'], 'An electrical impulse travels along the axon as ions flow in and out'],
    ['synapse', 'Synapses', ['action-potential'], 'Chemical signals jump the gap between neurons'],
    ['neurotransmitters', 'Neurotransmitters', ['synapse'], 'Chemical messengers: dopamine, serotonin, acetylcholine'],
    ['brain-regions', 'Brain Regions', ['science.bio.nervous.brain'], 'Map the cerebrum, cerebellum, brainstem, and their functions'],
    ['brain-imaging', 'Brain Imaging', ['brain-regions'], 'Use fMRI and PET scans to see brain activity'],
    ['memory', 'Memory', ['brain-regions'], 'How the brain encodes, stores, and retrieves information'],
    ['learning', 'Learning and Plasticity', ['memory'], 'The brain rewires itself as you learn new things'],
    ['sleep-science', 'Sleep Science', ['brain-regions'], 'Sleep stages, circadian rhythms, and the role of dreams'],
    ['drugs-brain', 'Drugs and the Brain', ['neurotransmitters'], 'How substances alter neurotransmitter levels and brain function'],
    ['sensory-processing', 'Sensory Processing', ['action-potential'], 'How the brain interprets signals from eyes, ears, and skin'],
    ['motor-control', 'Motor Control', ['brain-regions', 'science.bio.muscular.contraction'], 'How the brain plans and executes movement'],
  ]),

  // ---- Immunology (12) ----
  ...topic('science.bio.immunology', BIO, 'innovator', [WS], [
    ['innate', 'Innate Immunity', ['science.bio.disease.defence'], 'Non-specific defences present from birth: skin, mucus, phagocytes'],
    ['adaptive', 'Adaptive Immunity', ['innate'], 'Specific responses that develop after exposure to pathogens'],
    ['b-cells', 'B Cells', ['adaptive'], 'Produce antibodies that neutralise specific pathogens'],
    ['t-cells', 'T Cells', ['adaptive'], 'Destroy infected cells and coordinate immune responses'],
    ['memory-cells', 'Memory Cells', ['b-cells', 't-cells'], 'Long-lived cells that provide rapid response on re-infection'],
    ['vaccines-detail', 'Vaccines Detail', ['memory-cells', 'science.bio.disease.vaccination'], 'How different vaccine types stimulate immunity'],
    ['autoimmune', 'Autoimmune Diseases', ['adaptive'], 'The immune system mistakenly attacks the body own tissues'],
    ['allergies', 'Allergies', ['adaptive'], 'Overreaction of the immune system to harmless substances'],
    ['hiv', 'HIV and AIDS', ['t-cells'], 'A virus that destroys helper T cells and weakens immunity'],
    ['inflammation', 'Inflammation', ['innate'], 'Redness, swelling, heat, and pain as the body fights infection'],
    ['complement', 'Complement System', ['innate'], 'Proteins that punch holes in pathogen membranes'],
    ['monoclonal', 'Monoclonal Antibodies', ['b-cells'], 'Lab-made antibodies used in diagnosis and treatment'],
  ]),

  // ---- Ecology advanced (14) ----
  ...topic('science.bio.ecology-adv', BIO, 'innovator', [FOR, REEF], [
    ['energy-transfer', 'Energy Transfer Efficiency', ['science.bio.food-chain.pyramid-energy', 'math.percentages'], 'Only about 10 percent of energy passes to the next trophic level'],
    ['biomass', 'Biomass', ['energy-transfer'], 'The total mass of living material at each trophic level'],
    ['biogeochemical', 'Biogeochemical Cycles', ['science.bio.ecology.carbon-cycle'], 'Track carbon, nitrogen, phosphorus, and water through systems'],
    ['population-dynamics', 'Population Dynamics', ['science.bio.ecology.predator-prey', 'math.algebra'], 'Model how populations grow, decline, and stabilise'],
    ['carrying-capacity', 'Carrying Capacity', ['population-dynamics'], 'The maximum population an environment can sustain'],
    ['r-k-selection', 'r and K Selection', ['carrying-capacity'], 'Compare fast-reproducing r-strategists with slow K-strategists'],
    ['island-biogeography', 'Island Biogeography', ['carrying-capacity'], 'Species richness depends on island size and distance from mainland'],
    ['keystone', 'Keystone Species', ['science.bio.ecology.biotic'], 'Species with outsized effects on their ecosystem'],
    ['trophic-cascade', 'Trophic Cascades', ['keystone'], 'Top predators indirectly affect producers through the food web'],
    ['invasive', 'Invasive Species', ['science.bio.ecology.competition'], 'Non-native species that outcompete and displace local organisms'],
    ['ecosystem-services', 'Ecosystem Services', ['science.bio.ecology.biotic', 'science.bio.ecology.abiotic'], 'Benefits humans get from nature: clean water, pollination, climate regulation'],
    ['conservation-strategies', 'Conservation Strategies', ['ecosystem-services'], 'Protected areas, wildlife corridors, and rewilding'],
    ['climate-ecology', 'Climate Change and Ecology', ['science.bio.ecology-adv.biogeochemical'], 'Rising temperatures shift habitats and disrupt food webs'],
    ['restoration', 'Ecological Restoration', ['conservation-strategies'], 'Rebuild damaged ecosystems to their natural state'],
  ]),

  // ---- Endocrine system detail (8) ----
  ...topic('science.bio.endocrine', BIO, 'innovator', [WS], [
    ['pituitary', 'Pituitary Gland', ['science.bio.physiology.hormones'], 'The master gland that controls other endocrine glands'],
    ['thyroid', 'Thyroid Gland', ['pituitary'], 'Controls metabolism, growth, and body temperature'],
    ['adrenal', 'Adrenal Glands', ['science.bio.physiology.adrenaline'], 'Produce adrenaline and cortisol for stress responses'],
    ['pancreas', 'Pancreas', ['science.bio.physiology.blood-glucose'], 'Produces insulin and glucagon for blood sugar control'],
    ['gonads', 'Gonads', ['science.bio.physiology.reproductive-hormones'], 'Ovaries and testes produce sex hormones'],
    ['growth-hormone', 'Growth Hormone', ['pituitary'], 'Stimulates growth and cell repair throughout the body'],
    ['melatonin', 'Melatonin', ['pituitary'], 'Regulates sleep-wake cycles from the pineal gland'],
    ['endocrine-disorders', 'Endocrine Disorders', ['pituitary', 'thyroid'], 'Hormone imbalances cause conditions like hypothyroidism and gigantism'],
  ]),

  // ---- Developmental biology (8) ----
  ...topic('science.bio.development', BIO, 'innovator', [WS, FOR], [
    ['embryology', 'Embryology', ['science.bio.reproduction.development'], 'Study how a single cell develops into a complex organism'],
    ['differentiation', 'Cell Differentiation', ['embryology'], 'Cells become specialised for specific functions'],
    ['morphogenesis', 'Morphogenesis', ['differentiation'], 'Cells organise into tissues, organs, and body plans'],
    ['stem-cells-dev', 'Stem Cells in Development', ['science.bio.biotech.stem-cells-intro', 'differentiation'], 'Embryonic stem cells can become any cell type'],
    ['growth-development', 'Growth Patterns', ['morphogenesis', 'math.data.graphs'], 'Track growth curves from birth to adulthood'],
    ['metamorphosis', 'Metamorphosis', ['embryology'], 'Dramatic body transformations in amphibians and insects'],
    ['aging-intro', 'Ageing', ['growth-development'], 'Biological processes that cause gradual decline over time'],
    ['regeneration', 'Regeneration', ['differentiation'], 'Some organisms regrow lost body parts'],
  ]),

  // ---- Plant physiology advanced (8) ----
  ...topic('science.bio.plant-physiol', BIO, 'innovator', [FOR], [
    ['photosynthesis-detail', 'Photosynthesis Detail', ['science.bio.photosynthesis.light-reactions', 'math.equations'], 'Light-dependent and light-independent reactions in detail'],
    ['c3-c4-cam', 'C3, C4, and CAM Plants', ['photosynthesis-detail'], 'Different carbon fixation strategies for different climates'],
    ['transpiration-adv', 'Transpiration Stream', ['science.bio.plant-bio.transpiration-detail', 'math.equations'], 'Calculate water uptake using potometers'],
    ['mineral-uptake', 'Mineral Uptake', ['science.bio.plant-bio.mineral-nutrition'], 'Active transport and root hair adaptations for nutrient absorption'],
    ['auxin-detail', 'Auxin in Detail', ['science.bio.plant-bio.plant-hormones'], 'How auxin concentration gradients control growth direction'],
    ['phytochrome', 'Phytochrome', ['science.bio.plant-bio.plant-hormones'], 'Light-sensitive pigments that control flowering and dormancy'],
    ['defence-plants', 'Plant Defences', ['science.bio.plant-bio.plant-hormones'], 'Chemical and physical defences against herbivores and pathogens'],
    ['nitrogen-fixation', 'Nitrogen Fixation', ['science.bio.plant-bio.mineral-nutrition', 'science.bio.ecology.nitrogen-cycle'], 'Bacteria in root nodules convert atmospheric nitrogen to ammonia'],
  ]),

  // ---- Virology (8) ----
  ...topic('science.bio.virology', BIO, 'innovator', [WS], [
    ['classification-virus', 'Virus Classification', ['science.bio.microbiology.virus-structure'], 'Classify viruses by genome type, shape, and host range'],
    ['lytic', 'Lytic Cycle', ['science.bio.microbiology.virus-replication'], 'Virus takes over cell, replicates, and bursts out destroying the host'],
    ['lysogenic', 'Lysogenic Cycle', ['lytic'], 'Viral DNA integrates into host genome and lies dormant'],
    ['retrovirus', 'Retroviruses', ['lysogenic'], 'RNA viruses that use reverse transcriptase to make DNA'],
    ['emerging', 'Emerging Viruses', ['classification-virus'], 'New viruses that jump from animals to humans'],
    ['antiviral-mech', 'Antiviral Mechanisms', ['lytic'], 'How antiviral drugs block viral entry, replication, or release'],
    ['phage', 'Bacteriophages', ['lytic'], 'Viruses that infect bacteria: potential alternatives to antibiotics'],
    ['pandemic', 'Pandemics', ['emerging'], 'How new viruses spread globally and how we respond'],
  ]),

  // ---- Animal behaviour (8) ----
  ...topic('science.bio.behaviour', BIO, 'innovator', [FOR], [
    ['innate-behaviour', 'Innate Behaviour', ['science.bio.neuroscience.neuron-detail'], 'Genetically programmed responses: reflexes and instincts'],
    ['learned-behaviour', 'Learned Behaviour', ['science.bio.neuroscience.learning'], 'Behaviour that changes through experience'],
    ['conditioning', 'Conditioning', ['learned-behaviour'], 'Classical and operant conditioning shape behaviour'],
    ['communication-animal', 'Animal Communication', ['innate-behaviour'], 'Signals through sound, colour, scent, and movement'],
    ['social-behaviour', 'Social Behaviour', ['communication-animal'], 'Living in groups: hierarchies, cooperation, and altruism'],
    ['courtship', 'Courtship', ['communication-animal'], 'Behaviours used to attract mates'],
    ['navigation', 'Animal Navigation', ['innate-behaviour'], 'Magnetic fields, sun position, and landmarks guide migration'],
    ['circadian', 'Circadian Rhythms', ['innate-behaviour', 'science.bio.neuroscience.sleep-science'], 'Internal clocks that regulate daily activity patterns'],
  ]),

  // ---- Marine biology (10) ----
  ...topic('science.bio.marine', BIO, 'innovator', [REEF], [
    ['zones', 'Ocean Zones', ['science.bio.habitat-type.deep-sea'], 'Sunlit, twilight, midnight, abyssal, and hadal zones'],
    ['coral-reef', 'Coral Reef Ecology', ['science.bio.habitat-type.coral-reef'], 'Complex ecosystems built by tiny coral animals'],
    ['plankton', 'Plankton', ['zones'], 'Tiny organisms that form the base of ocean food chains'],
    ['deep-sea-life', 'Deep-Sea Life', ['zones'], 'Bioluminescent and extremophile organisms in the abyss'],
    ['whale-ecology', 'Whale Ecology', ['science.bio.marine.zones'], 'How whales cycle nutrients and support ocean productivity'],
    ['mangrove-eco', 'Mangrove Ecosystems', ['science.bio.habitat-type.mangrove'], 'Coastal forests that protect shores and nurture marine life'],
    ['overfishing', 'Overfishing', ['coral-reef'], 'Harvesting fish faster than populations can recover'],
    ['ocean-acidification', 'Ocean Acidification', ['coral-reef', 'science.chem.environ.greenhouse'], 'Absorbed CO2 lowers ocean pH, threatening shell-building organisms'],
    ['marine-protected', 'Marine Protected Areas', ['overfishing'], 'Designated zones where fishing and development are limited'],
    ['bioluminescence', 'Bioluminescence', ['deep-sea-life'], 'Living organisms that produce their own light'],
  ]),

  // ---- Evolutionary mechanisms (8) ----
  ...topic('science.bio.evo-mech', BIO, 'innovator', [FOR, RUI], [
    ['genetic-drift', 'Genetic Drift', ['science.bio.evolution.natural-selection', 'math.probability.basic'], 'Random changes in allele frequency in small populations'],
    ['gene-flow', 'Gene Flow', ['genetic-drift'], 'Movement of alleles between populations through migration'],
    ['bottleneck', 'Bottleneck Effect', ['genetic-drift'], 'Sudden population reduction drastically changes allele frequencies'],
    ['founder', 'Founder Effect', ['genetic-drift'], 'A small group starts a new population with limited genetic diversity'],
    ['sexual-selection', 'Sexual Selection', ['science.bio.evolution.natural-selection'], 'Traits that improve mating success are favoured'],
    ['adaptive-radiation', 'Adaptive Radiation', ['science.bio.evolution.speciation'], 'One ancestor diversifies into many species filling different niches'],
    ['punctuated-eq', 'Punctuated Equilibrium', ['science.bio.evolution.speciation'], 'Long periods of stability interrupted by rapid change'],
    ['molecular-clock', 'Molecular Clock', ['science.bio.evolution.evidence-dna', 'math.rates'], 'Estimate divergence times from accumulated DNA mutations'],
  ]),

  // ---- Biome ecology expand (10) ----
  ...expand('science.bio.biome-eco', BIO, 'innovator', [FOR, REEF],
    ['science.bio.ecology-adv.ecosystem-services'],
    'Biome Ecology: {item}', 'Analyse the ecological processes and challenges of {item}', [
    ['tropical-forest', 'Tropical Rainforests'], ['temperate-forest', 'Temperate Forests'],
    ['boreal', 'Boreal Forests'], ['savanna', 'Savannas'],
    ['temperate-grass', 'Temperate Grasslands'], ['desert-biome', 'Deserts'],
    ['tundra-biome', 'Tundra'], ['freshwater', 'Freshwater Systems'],
    ['marine-biome', 'Marine Systems'], ['wetland-biome', 'Wetlands'],
  ]),
];

// ===========================================================================
// BIOLOGY — CREATOR  (~200 skills)
// Advanced: Genomics, epigenetics, systems biology, synthetic biology,
//           bioinformatics, conservation, bioethics, astrobiology
// ===========================================================================

const bioCreator: SkillNode[] = [

  // ---- Genomics (12) ----
  ...topic('science.bio.genomics', BIO, 'creator', [WS], [
    ['genome', 'The Human Genome', ['science.bio.biotech.sequencing'], 'The complete set of DNA instructions in a human cell'],
    ['comparative', 'Comparative Genomics', ['genome'], 'Compare genomes across species to find shared and unique genes'],
    ['functional', 'Functional Genomics', ['genome'], 'Determine what each gene does through large-scale experiments'],
    ['transcriptomics', 'Transcriptomics', ['functional'], 'Measure all RNA molecules to see which genes are active'],
    ['proteomics', 'Proteomics', ['transcriptomics'], 'Identify and quantify all proteins in a cell or tissue'],
    ['metabolomics', 'Metabolomics', ['proteomics'], 'Measure all small molecules to understand metabolic state'],
    ['gwas', 'Genome-Wide Association Studies', ['genome', 'math.statistics.descriptive'], 'Link genetic variants to disease risk across populations'],
    ['pharmacogenomics', 'Pharmacogenomics', ['gwas'], 'Tailor medicine to individual genetic profiles'],
    ['metagenomics', 'Metagenomics', ['genome'], 'Sequence all DNA from an environmental sample at once'],
    ['single-cell', 'Single-Cell Genomics', ['functional'], 'Analyse gene activity in individual cells'],
    ['long-read', 'Long-Read Sequencing', ['science.bio.biotech.sequencing'], 'Read very long DNA stretches for better genome assembly'],
    ['genome-editing', 'Advanced Genome Editing', ['science.bio.biotech.crispr'], 'Base editing, prime editing, and other precision tools'],
  ]),

  // ---- Epigenetics (8) ----
  ...topic('science.bio.epigenetics', BIO, 'creator', [WS], [
    ['methylation', 'DNA Methylation', ['science.bio.molecular.epigenetics-intro'], 'Adding methyl groups to DNA silences gene expression'],
    ['histone', 'Histone Modification', ['methylation'], 'Chemical tags on histone proteins open or close DNA for reading'],
    ['chromatin', 'Chromatin Remodelling', ['histone'], 'Restructure chromatin to control access to genes'],
    ['non-coding-rna', 'Non-Coding RNA', ['science.bio.molecular.rna'], 'RNA molecules that regulate genes without making protein'],
    ['imprinting', 'Genomic Imprinting', ['methylation'], 'Some genes are silenced depending on which parent they came from'],
    ['environmental-epi', 'Environmental Epigenetics', ['methylation'], 'Diet, stress, and toxins can alter epigenetic marks'],
    ['transgenerational', 'Transgenerational Epigenetics', ['environmental-epi'], 'Epigenetic changes that pass from parent to offspring'],
    ['cancer-epi', 'Cancer Epigenetics', ['methylation', 'histone'], 'Aberrant epigenetic marks contribute to cancer development'],
  ]),

  // ---- Systems biology (10) ----
  ...topic('science.bio.systems', BIO, 'creator', [WS], [
    ['networks', 'Biological Networks', ['science.bio.genomics.functional', 'math.linear-algebra'], 'Map gene regulatory, protein interaction, and metabolic networks'],
    ['modelling', 'Systems Modelling', ['networks', 'math.calculus'], 'Build mathematical models of biological systems'],
    ['feedback-systems', 'Biological Feedback Systems', ['science.bio.physiology.feedback', 'modelling'], 'Model positive and negative feedback loops mathematically'],
    ['emergent', 'Emergent Properties', ['networks'], 'Complex behaviours arise from simple interactions between components'],
    ['flux-analysis', 'Metabolic Flux Analysis', ['networks'], 'Track the flow of metabolites through biochemical pathways'],
    ['signalling', 'Cell Signalling Pathways', ['networks'], 'Map cascades of molecular signals within and between cells'],
    ['multi-scale', 'Multi-Scale Modelling', ['modelling'], 'Connect molecular, cellular, tissue, and organism-level models'],
    ['synthetic-circuits', 'Synthetic Gene Circuits', ['signalling'], 'Design genetic switches, oscillators, and logic gates'],
    ['digital-twin-bio', 'Digital Twin Biology', ['multi-scale'], 'Create virtual models of organisms for prediction and testing'],
    ['systems-medicine', 'Systems Medicine', ['networks', 'science.bio.genomics.pharmacogenomics'], 'Apply systems biology to understand and treat complex diseases'],
  ]),

  // ---- Synthetic biology (10) ----
  ...topic('science.bio.synbio', BIO, 'creator', [WS], [
    ['principles', 'Synthetic Biology Principles', ['science.bio.biotech.cloning-gene'], 'Engineer biological systems from standardised parts'],
    ['biobricks', 'BioBricks', ['principles'], 'Standard genetic parts that snap together like building blocks'],
    ['minimal-genome', 'Minimal Genome', ['principles', 'science.bio.genomics.genome'], 'Find the smallest set of genes needed for life'],
    ['metabolic-eng', 'Metabolic Engineering', ['principles'], 'Redesign metabolic pathways to produce useful chemicals'],
    ['biosensors', 'Biosensors', ['principles'], 'Engineer cells that detect and report specific chemicals'],
    ['cell-free', 'Cell-Free Systems', ['principles'], 'Run biological reactions outside living cells'],
    ['directed-evolution', 'Directed Evolution', ['principles', 'science.bio.evo-mech.genetic-drift'], 'Evolve proteins in the lab for new functions'],
    ['xenobiology', 'Xenobiology', ['minimal-genome'], 'Create life using non-standard biochemistry'],
    ['biocontainment', 'Biocontainment', ['principles'], 'Design safety mechanisms that prevent engineered organisms from escaping'],
    ['applications-synbio', 'Synthetic Biology Applications', ['metabolic-eng', 'biosensors'], 'Produce biofuels, medicines, and materials with engineered organisms'],
  ]),

  // ---- Bioinformatics (10) ----
  ...topic('science.bio.bioinformatics', BIO, 'creator', [WS], [
    ['sequence-alignment', 'Sequence Alignment', ['science.bio.biotech.bioinformatics-intro'], 'Compare DNA or protein sequences to find similarities'],
    ['blast', 'BLAST Search', ['sequence-alignment'], 'Search databases for sequences matching a query'],
    ['phylogenetics', 'Phylogenetic Analysis', ['sequence-alignment', 'science.bio.evolution.tree-of-life'], 'Build evolutionary trees from sequence data'],
    ['gene-prediction', 'Gene Prediction', ['sequence-alignment'], 'Identify genes within raw genome sequence data'],
    ['protein-structure', 'Protein Structure Prediction', ['science.bio.molecular.protein-folding'], 'Predict 3D protein shape from amino acid sequence'],
    ['databases', 'Biological Databases', ['blast'], 'Navigate GenBank, UniProt, and other data repositories'],
    ['rna-seq', 'RNA-Seq Analysis', ['science.bio.genomics.transcriptomics'], 'Quantify gene expression from sequencing data'],
    ['network-analysis', 'Network Analysis', ['science.bio.systems.networks'], 'Identify hubs and bottlenecks in biological networks'],
    ['machine-learning-bio', 'Machine Learning in Biology', ['databases', 'math.statistics.descriptive'], 'Train algorithms to predict biological outcomes from data'],
    ['data-viz-bio', 'Biological Data Visualisation', ['databases'], 'Create clear plots and diagrams from complex biological data'],
  ]),

  // ---- Conservation biology advanced (12) ----
  ...topic('science.bio.conservation-adv', BIO, 'creator', [FOR, REEF], [
    ['population-viability', 'Population Viability Analysis', ['science.bio.ecology-adv.population-dynamics', 'math.probability.basic'], 'Model extinction risk for threatened species'],
    ['genetic-diversity', 'Genetic Diversity in Conservation', ['science.bio.evo-mech.genetic-drift'], 'Maintain genetic variation to keep populations healthy'],
    ['corridors', 'Wildlife Corridors', ['science.bio.ecology-adv.conservation-strategies'], 'Connect fragmented habitats to allow animal movement'],
    ['rewilding', 'Rewilding', ['corridors'], 'Reintroduce keystone species to restore natural processes'],
    ['ex-situ', 'Ex-Situ Conservation', ['population-viability'], 'Protect species in zoos, seed banks, and breeding programs'],
    ['in-situ', 'In-Situ Conservation', ['population-viability'], 'Protect species within their natural habitats'],
    ['citizen-science', 'Citizen Science', ['science.bio.ecology.sampling'], 'Engage the public in collecting biodiversity data'],
    ['de-extinction', 'De-Extinction', ['science.bio.biotech.crispr', 'genetic-diversity'], 'Use genetic technology to bring back extinct species'],
    ['ecosystem-valuation', 'Ecosystem Valuation', ['science.bio.ecology-adv.ecosystem-services'], 'Assign economic value to the services nature provides'],
    ['policy', 'Conservation Policy', ['ecosystem-valuation'], 'Design laws and agreements that protect biodiversity'],
    ['indigenous-knowledge', 'Indigenous Knowledge', ['policy'], 'Integrate traditional ecological knowledge with modern science'],
    ['urban-ecology', 'Urban Ecology', ['science.bio.ecology-adv.restoration'], 'Study and enhance nature in cities and towns'],
  ]),

  // ---- Bioethics (8) ----
  ...topic('science.bio.bioethics', BIO, 'creator', [WS, FOR], [
    ['genetic-ethics', 'Genetic Ethics', ['science.bio.biotech.ethics-biotech'], 'Navigate moral questions around genetic modification and screening'],
    ['cloning-ethics', 'Cloning Ethics', ['genetic-ethics'], 'Debate reproductive and therapeutic cloning'],
    ['stem-cell-ethics', 'Stem Cell Ethics', ['genetic-ethics', 'science.bio.biotech.stem-cells-intro'], 'Balance research potential with embryo moral status'],
    ['animal-testing', 'Animal Testing Ethics', ['genetic-ethics'], 'Weigh scientific benefits against animal welfare'],
    ['consent', 'Informed Consent', ['genetic-ethics'], 'Research participants must understand and agree freely'],
    ['equity', 'Equity in Science', ['genetic-ethics'], 'Ensure scientific advances benefit all communities fairly'],
    ['biosecurity', 'Biosecurity', ['science.bio.synbio.biocontainment'], 'Prevent misuse of biological knowledge and materials'],
    ['environmental-ethics', 'Environmental Ethics', ['science.bio.conservation-adv.policy'], 'Our moral duty to protect the natural world'],
  ]),

  // ---- Astrobiology (8) ----
  ...topic('science.bio.astrobiology', BIO, 'creator', [OBS, FOR], [
    ['origins', 'Origin of Life', ['science.bio.molecular.central-dogma', 'science.chem.organic.what-is'], 'How simple chemicals might have assembled into the first living cell'],
    ['extremophiles', 'Extremophiles', ['origins'], 'Organisms thriving in extreme heat, cold, acid, and radiation'],
    ['habitable-zone', 'Habitable Zones', ['origins'], 'The goldilocks region around a star where liquid water can exist'],
    ['biosignatures', 'Biosignatures', ['habitable-zone'], 'Chemical and physical signs that could indicate life'],
    ['mars-life', 'Life on Mars', ['biosignatures'], 'Search for past or present life on the Red Planet'],
    ['europa', 'Ocean Worlds', ['biosignatures'], 'Subsurface oceans on Europa and Enceladus may harbour life'],
    ['panspermia', 'Panspermia', ['extremophiles'], 'Could life have travelled between planets on meteorites'],
    ['seti', 'SETI', ['biosignatures'], 'Search for extraterrestrial intelligence through radio signals'],
  ]),

  // ---- Structural biology (8) ----
  ...topic('science.bio.structural', BIO, 'creator', [WS], [
    ['xray-crystal', 'X-Ray Crystallography', ['science.bio.molecular.protein-folding', 'science.physics.wave-adv.diffraction-grating'], 'Determine protein structure from X-ray diffraction patterns'],
    ['cryo-em', 'Cryo-Electron Microscopy', ['xray-crystal'], 'Image protein structures by freezing and electron imaging'],
    ['nmr-bio', 'Biological NMR', ['xray-crystal'], 'Determine protein structure in solution using nuclear magnetic resonance'],
    ['alphafold', 'AI Structure Prediction', ['science.bio.bioinformatics.protein-structure'], 'Use deep learning to predict protein folds from sequence'],
    ['drug-target', 'Structure-Based Drug Design', ['xray-crystal', 'science.chem.medicinal.drug-design'], 'Design drugs that fit precisely into protein binding sites'],
    ['membrane-struct', 'Membrane Protein Structure', ['cryo-em'], 'Determine the shapes of proteins embedded in cell membranes'],
    ['molecular-dynamics-bio', 'Molecular Dynamics in Biology', ['alphafold'], 'Simulate protein motion and flexibility on a computer'],
    ['structural-genomics', 'Structural Genomics', ['alphafold', 'science.bio.genomics.functional'], 'Systematically determine the structures of all proteins'],
  ]),

  // ---- Cancer biology (8) ----
  ...topic('science.bio.cancer', BIO, 'creator', [WS], [
    ['oncogenes', 'Oncogenes', ['science.bio.molecular.gene-regulation', 'science.bio.genetics.mutations'], 'Mutated genes that promote uncontrolled cell growth'],
    ['tumour-suppressors', 'Tumour Suppressors', ['oncogenes'], 'Genes that normally prevent cancer by controlling cell division'],
    ['metastasis', 'Metastasis', ['oncogenes'], 'Cancer cells break away and spread to other parts of the body'],
    ['angiogenesis', 'Angiogenesis', ['metastasis'], 'Tumours stimulate new blood vessel growth to feed themselves'],
    ['immunotherapy', 'Cancer Immunotherapy', ['science.bio.immunology.t-cells'], 'Harness the immune system to recognise and destroy cancer cells'],
    ['targeted-therapy', 'Targeted Cancer Therapy', ['oncogenes', 'science.chem.medicinal.drug-design'], 'Drugs that precisely block cancer-specific molecular targets'],
    ['tumour-microenv', 'Tumour Microenvironment', ['angiogenesis'], 'The complex ecosystem surrounding a tumour'],
    ['cancer-genomics', 'Cancer Genomics', ['science.bio.genomics.gwas'], 'Sequence tumour genomes to guide treatment decisions'],
  ]),

  // ---- Microbiome (8) ----
  ...topic('science.bio.microbiome', BIO, 'creator', [WS, FOR], [
    ['gut-microbiome', 'Gut Microbiome', ['science.bio.microbiology.microbiome-intro'], 'The community of microbes in your digestive system'],
    ['dysbiosis', 'Dysbiosis', ['gut-microbiome'], 'Imbalanced microbiome associated with disease'],
    ['probiotics', 'Probiotics', ['gut-microbiome'], 'Beneficial microbes added to food or supplements'],
    ['microbiome-immunity', 'Microbiome and Immunity', ['gut-microbiome', 'science.bio.immunology.innate'], 'Gut bacteria train and regulate the immune system'],
    ['soil-microbiome', 'Soil Microbiome', ['science.bio.microbiology.industrial-micro'], 'Microbial communities essential for soil health and plant growth'],
    ['microbiome-brain', 'Gut-Brain Axis', ['gut-microbiome', 'science.bio.neuroscience.neurotransmitters'], 'Gut microbes influence mood and brain function'],
    ['phage-therapy', 'Phage Therapy', ['science.bio.virology.phage'], 'Use bacteriophages as targeted alternatives to antibiotics'],
    ['metagenomics-app', 'Metagenomics Applications', ['science.bio.genomics.metagenomics'], 'Analyse microbial communities using DNA sequencing'],
  ]),

  // ---- Evolutionary development (8) ----
  ...topic('science.bio.evo-devo', BIO, 'creator', [WS, FOR], [
    ['hox', 'Hox Genes', ['science.bio.development.morphogenesis', 'science.bio.molecular.gene-regulation'], 'Master genes that control body plan layout'],
    ['body-plans', 'Body Plan Evolution', ['hox'], 'Small changes in regulatory genes produce different body forms'],
    ['toolkit', 'Genetic Toolkit', ['hox'], 'A shared set of developmental genes across animal phyla'],
    ['heterochrony', 'Heterochrony', ['body-plans'], 'Changes in developmental timing produce evolutionary novelty'],
    ['modularity', 'Developmental Modularity', ['toolkit'], 'Body regions evolve independently through modular gene control'],
    ['constraint', 'Developmental Constraints', ['modularity'], 'Development limits the range of possible evolutionary outcomes'],
    ['gene-duplication', 'Gene Duplication', ['toolkit'], 'Extra gene copies provide raw material for new functions'],
    ['deep-homology', 'Deep Homology', ['toolkit'], 'Distantly related organisms share ancient developmental mechanisms'],
  ]),

  // ---- Frontier biology expand (10) ----
  ...expand('science.bio.frontier', BIO, 'creator', [WS, FOR],
    ['science.bio.genomics.genome', 'science.bio.synbio.principles'],
    'Frontier: {item}', 'Explore cutting-edge research in {item}', [
    ['organ-on-chip', 'Organ-on-a-Chip'], ['optogenetics', 'Optogenetics'],
    ['connectomics', 'Connectomics'], ['spatial-transcriptomics', 'Spatial Transcriptomics'],
    ['ancient-dna', 'Ancient DNA'], ['gene-drive', 'Gene Drives'],
    ['synthetic-cells', 'Synthetic Cells'], ['brain-organoids', 'Brain Organoids'],
    ['crispr-diagnostics', 'CRISPR Diagnostics'], ['living-materials', 'Living Materials'],
  ]),

  // ---- Capstone projects (8) ----
  ...parallel('science.bio.capstone', BIO, 'creator', [WS, FOR],
    ['science.bio.genomics.genome', 'science.bio.molecular.central-dogma'], [
    ['research-bio', 'Biology Research Project', 'Conduct original research on a biological question'],
    ['field-ecology', 'Field Ecology Project', 'Design and execute a biodiversity survey'],
    ['biotech-project', 'Biotechnology Project', 'Engineer a biological system to solve a problem'],
    ['conservation-project', 'Conservation Project', 'Develop a conservation plan for a threatened species'],
    ['bioinformatics-project', 'Bioinformatics Project', 'Analyse genomic data to discover biological insights'],
    ['review-bio', 'Biology Literature Review', 'Survey current research on a biological topic'],
    ['science-comm', 'Science Communication', 'Create materials that make complex biology accessible'],
    ['interdisciplinary-bio', 'Interdisciplinary Project', 'Apply biology to solve a problem in another field'],
  ]),
];

// ===========================================================================
// EARTH SCIENCE — FOUNDATION  (~40 skills)
// Ages 2-5: Weather, seasons, rocks/soil, water, day/night, sun/moon
// ===========================================================================

const earthFoundation: SkillNode[] = [

  // ---- Weather (8) ----
  ...topic('science.earth.weather', EARTH, 'foundation', [OBS], [
    ['sunny', 'Sunny Days', ['science.weather'], 'Feel the warmth and see the bright sky on a sunny day'],
    ['rainy', 'Rainy Days', ['science.weather'], 'Watch rain fall from clouds and form puddles'],
    ['windy', 'Windy Days', ['science.weather'], 'Feel the invisible force of moving air'],
    ['cloudy', 'Cloudy Days', ['science.weather'], 'Identify different cloud shapes in the sky'],
    ['snowy', 'Snowy Days', ['science.weather'], 'Observe snowflakes and ice forming when it is very cold'],
    ['stormy', 'Storms', ['science.weather'], 'Stay safe during thunder, lightning, and strong winds'],
    ['weather-chart', 'Weather Chart', ['sunny', 'rainy', 'windy', 'science.recording'], 'Record daily weather on a simple chart'],
    ['dressing', 'Dressing for Weather', ['weather-chart'], 'Choose the right clothes for today weather'],
  ]),

  // ---- Seasons (6) ----
  ...topic('science.earth.seasons', EARTH, 'foundation', [OBS, FOR], [
    ['spring', 'Spring', ['science.weather'], 'Flowers bloom, animals are born, days get longer'],
    ['summer', 'Summer', ['science.weather'], 'The warmest season with the longest days'],
    ['autumn', 'Autumn', ['science.weather'], 'Leaves change colour and fall, days get shorter'],
    ['winter', 'Winter', ['science.weather'], 'The coldest season with the shortest days'],
    ['changes', 'Seasonal Changes', ['spring', 'summer', 'autumn', 'winter'], 'Notice how nature changes through the four seasons'],
    ['calendar-seasons', 'Seasons and Calendar', ['changes', 'math.measurement.time'], 'Match months to seasons in your part of the world'],
  ]),

  // ---- Rocks and soil (6) ----
  ...topic('science.earth.rocks', EARTH, 'foundation', [CAV, RUI], [
    ['rocks', 'Rocks', ['science.observation'], 'Find and describe rocks by colour, size, and texture'],
    ['pebbles', 'Pebbles and Stones', ['rocks'], 'Smooth, rounded stones shaped by water and wind'],
    ['soil', 'Soil', ['rocks'], 'The mixture of tiny rock pieces, dead plants, and living things'],
    ['sand', 'Sand', ['rocks'], 'Tiny grains of broken-down rock found on beaches and deserts'],
    ['clay', 'Clay', ['soil'], 'Sticky fine-grained soil you can mould into shapes'],
    ['sorting-rocks', 'Sorting Rocks', ['rocks', 'science.sorting'], 'Group rocks by colour, hardness, and texture'],
  ]),

  // ---- Water (6) ----
  ...topic('science.earth.water', EARTH, 'foundation', [REEF, OBS], [
    ['where', 'Where Is Water', ['science.observation'], 'Find water in rivers, lakes, oceans, clouds, and taps'],
    ['rain', 'Rain', ['where', 'science.earth.weather.rainy'], 'Water falls from clouds as rain'],
    ['ice', 'Ice', ['where', 'science.phys.matter.freezing'], 'Water turns into ice when it gets very cold'],
    ['puddles', 'Puddles', ['rain'], 'Puddles form when rain collects and disappear as water evaporates'],
    ['rivers', 'Rivers', ['where'], 'Water flowing downhill from mountains to the sea'],
    ['ocean-intro', 'Oceans', ['where'], 'Vast bodies of salty water covering most of Earth'],
  ]),

  // ---- Day and night (5) ----
  ...topic('science.earth.day-night', EARTH, 'foundation', [OBS], [
    ['day', 'Daytime', ['science.observation'], 'The sun lights up the sky during the day'],
    ['night', 'Nighttime', ['science.observation'], 'The sky is dark and we can see stars and the moon'],
    ['sunrise', 'Sunrise and Sunset', ['day', 'night'], 'The sun appears to rise in the east and set in the west'],
    ['shadow-time', 'Shadows Change', ['sunrise', 'science.phys.light-shadow.shadow-size'], 'Shadows move and change length as the sun moves across the sky'],
    ['spin', 'Earth Spins', ['sunrise'], 'Day and night happen because Earth spins on its axis'],
  ]),

  // ---- Sun and moon (5) ----
  ...topic('science.earth.sun-moon', EARTH, 'foundation', [OBS], [
    ['sun', 'The Sun', ['science.earth.day-night.day'], 'A huge ball of hot gas that gives us light and heat'],
    ['moon', 'The Moon', ['science.earth.day-night.night'], 'A rocky ball that orbits Earth and shines with reflected sunlight'],
    ['moon-phases', 'Moon Shapes', ['moon'], 'The moon appears to change shape during the month'],
    ['stars-intro', 'Stars', ['science.earth.day-night.night'], 'Tiny points of light that are actually distant suns'],
    ['space-intro', 'Space', ['sun', 'stars-intro'], 'The vast emptiness beyond Earth atmosphere'],
  ]),
];

// ===========================================================================
// EARTH SCIENCE — DISCOVERY  (~100 skills)
// Grades K-2: Water cycle, rock cycle, erosion, fossils, earthquakes,
//             volcanoes, atmosphere, ocean basics, maps/globes
// ===========================================================================

const earthDiscovery: SkillNode[] = [

  // ---- Water cycle (8) ----
  ...chain('science.earth.water-cycle', EARTH, 'discovery', [OBS, REEF], [
    ['evaporation', 'Evaporation', 'Water heats up and rises into the air as invisible vapour'],
    ['condensation', 'Condensation', 'Water vapour cools and forms tiny droplets that make clouds'],
    ['precipitation', 'Precipitation', 'Water falls back to Earth as rain, snow, sleet, or hail'],
    ['collection', 'Collection', 'Water gathers in rivers, lakes, oceans, and underground'],
    ['transpiration', 'Transpiration in the Water Cycle', 'Plants release water vapour through their leaves'],
    ['runoff', 'Runoff', 'Water flows over land into streams and rivers'],
    ['groundwater', 'Groundwater', 'Water seeps through soil and collects underground'],
    ['cycle-diagram', 'Water Cycle Diagram', 'Draw and label the complete water cycle'],
  ], ['science.earth.water.puddles', 'science.phys.matter.boiling', 'science.phys.matter.condensing']),

  // ---- Rock cycle (8) ----
  ...chain('science.earth.rock-cycle', EARTH, 'discovery', [CAV, RUI], [
    ['igneous', 'Igneous Rocks', 'Rocks formed when molten material cools and hardens'],
    ['sedimentary', 'Sedimentary Rocks', 'Rocks formed from layers of sediment pressed together over time'],
    ['metamorphic', 'Metamorphic Rocks', 'Rocks changed by extreme heat and pressure deep underground'],
    ['weathering', 'Weathering', 'Wind, water, ice, and living things break rocks into smaller pieces'],
    ['erosion-intro', 'Erosion', 'Broken rock pieces are carried away by wind, water, or ice'],
    ['deposition', 'Deposition', 'Eroded materials settle in new places forming layers'],
    ['compaction', 'Compaction and Cementation', 'Layers of sediment are squeezed and glued into solid rock'],
    ['cycle-diagram-rock', 'Rock Cycle Diagram', 'Draw the continuous cycle of rock formation and destruction'],
  ], ['science.earth.rocks.rocks']),

  // ---- Erosion and weathering (8) ----
  ...topic('science.earth.erosion', EARTH, 'discovery', [CAV, RUI], [
    ['water-erosion', 'Water Erosion', ['science.earth.rock-cycle.erosion-intro'], 'Rivers carve valleys and waterfalls cut through rock'],
    ['wind-erosion', 'Wind Erosion', ['science.earth.rock-cycle.erosion-intro'], 'Wind carries sand that wears away rock surfaces'],
    ['ice-erosion', 'Ice Erosion', ['science.earth.rock-cycle.erosion-intro'], 'Glaciers grind and carve the landscape as they move'],
    ['chemical-weather', 'Chemical Weathering', ['science.earth.rock-cycle.weathering'], 'Acid rain and plant acids dissolve rock slowly'],
    ['biological-weather', 'Biological Weathering', ['science.earth.rock-cycle.weathering'], 'Plant roots and burrowing animals crack and break rock'],
    ['caves', 'Cave Formation', ['chemical-weather'], 'Acidic water dissolves limestone underground creating caves'],
    ['soil-formation', 'Soil Formation', ['science.earth.rock-cycle.weathering'], 'Weathered rock mixes with dead organisms to form soil'],
    ['prevention', 'Erosion Prevention', ['water-erosion', 'wind-erosion'], 'Plant trees and build barriers to slow erosion'],
  ]),

  // ---- Fossils (8) ----
  ...topic('science.earth.fossils', EARTH, 'discovery', [RUI, CAV], [
    ['what-is', 'What Are Fossils', ['science.earth.rock-cycle.sedimentary'], 'Preserved remains or traces of ancient living things'],
    ['formation', 'How Fossils Form', ['what-is'], 'Organism buried in sediment, minerals replace tissues over millions of years'],
    ['types', 'Types of Fossils', ['formation'], 'Body fossils, trace fossils, mould and cast fossils'],
    ['excavation', 'Fossil Excavation', ['types'], 'Carefully dig and remove fossils from rock'],
    ['dating', 'Dating Fossils', ['types', 'math.number-ordering'], 'Deeper layers are older; radioactive dating gives exact ages'],
    ['dinosaurs', 'Dinosaurs', ['types'], 'Giant reptiles that ruled Earth for over 160 million years'],
    ['living-fossils', 'Living Fossils', ['types'], 'Species that have barely changed for millions of years'],
    ['fossil-record', 'The Fossil Record', ['dating'], 'Fossils tell the story of life on Earth through time'],
  ]),

  // ---- Earthquakes (8) ----
  ...topic('science.earth.earthquakes', EARTH, 'discovery', [CAV], [
    ['what-is', 'What Are Earthquakes', ['science.earth.rocks.rocks'], 'Sudden shaking of the ground when rocks underground break and shift'],
    ['cause', 'Earthquake Causes', ['what-is'], 'Stress builds up where plates push, pull, or slide past each other'],
    ['waves', 'Seismic Waves', ['what-is'], 'Energy radiates outward from the earthquake source'],
    ['epicentre', 'Epicentre', ['waves'], 'The point on the surface directly above where the earthquake starts'],
    ['measurement', 'Measuring Earthquakes', ['waves', 'math.number-comparison'], 'Use seismographs and the Richter scale to measure strength'],
    ['effects', 'Earthquake Effects', ['what-is'], 'Shaking damages buildings, triggers landslides, and causes tsunamis'],
    ['safety-eq', 'Earthquake Safety', ['effects'], 'Drop, cover, and hold on during an earthquake'],
    ['prediction', 'Earthquake Prediction', ['measurement'], 'Scientists monitor faults but cannot predict exact timing'],
  ]),

  // ---- Volcanoes (8) ----
  ...topic('science.earth.volcanoes', EARTH, 'discovery', [CAV], [
    ['what-is', 'What Are Volcanoes', ['science.earth.rocks.rocks'], 'Openings where molten rock from deep underground reaches the surface'],
    ['magma', 'Magma and Lava', ['what-is'], 'Molten rock underground is magma; on the surface it becomes lava'],
    ['eruption', 'Volcanic Eruptions', ['magma'], 'Pressure forces magma, ash, and gas out of a volcano'],
    ['types-volcano', 'Types of Volcanoes', ['eruption'], 'Shield, composite, and cinder cone volcanoes differ in shape'],
    ['ring-of-fire', 'Ring of Fire', ['types-volcano'], 'A horseshoe of volcanoes around the Pacific Ocean'],
    ['benefits', 'Benefits of Volcanoes', ['eruption'], 'Fertile soil, geothermal energy, and new land'],
    ['hazards', 'Volcanic Hazards', ['eruption'], 'Lava flows, ash clouds, pyroclastic flows, and lahars'],
    ['famous', 'Famous Volcanoes', ['types-volcano'], 'Vesuvius, Krakatoa, Mount St Helens, and Kilauea'],
  ]),

  // ---- Atmosphere (8) ----
  ...topic('science.earth.atmosphere', EARTH, 'discovery', [OBS], [
    ['what-is', 'What Is the Atmosphere', ['science.earth.weather.sunny'], 'The blanket of air surrounding Earth'],
    ['layers', 'Atmospheric Layers', ['what-is'], 'Troposphere, stratosphere, mesosphere, thermosphere, exosphere'],
    ['composition', 'Air Composition', ['what-is'], 'Nitrogen 78 percent, oxygen 21 percent, plus trace gases'],
    ['air-pressure', 'Air Pressure', ['what-is'], 'The weight of the air pushing down on everything'],
    ['wind', 'What Causes Wind', ['air-pressure'], 'Air moves from high pressure to low pressure areas'],
    ['clouds', 'Cloud Types', ['science.earth.weather.cloudy'], 'Cumulus, stratus, and cirrus clouds at different heights'],
    ['precipitation-types', 'Precipitation Types', ['clouds'], 'Rain, snow, sleet, hail, and drizzle form in different conditions'],
    ['weather-forecast', 'Weather Forecasting', ['clouds', 'wind', 'air-pressure'], 'Use observations and data to predict tomorrow weather'],
  ]),

  // ---- Ocean basics (8) ----
  ...topic('science.earth.ocean', EARTH, 'discovery', [REEF], [
    ['five-oceans', 'Five Oceans', ['science.earth.water.ocean-intro'], 'Pacific, Atlantic, Indian, Southern, and Arctic oceans'],
    ['salt', 'Why the Ocean Is Salty', ['five-oceans'], 'Rivers carry dissolved minerals into the sea over millions of years'],
    ['tides', 'Tides', ['five-oceans', 'science.earth.sun-moon.moon'], 'The Moon gravity pulls ocean water causing tides'],
    ['waves-ocean', 'Ocean Waves', ['five-oceans'], 'Wind blowing across the surface creates waves'],
    ['currents-intro', 'Ocean Currents Introduction', ['five-oceans'], 'Rivers of water flowing through the ocean'],
    ['depth', 'Ocean Depth', ['five-oceans', 'math.measurement.length'], 'The ocean floor has mountains, valleys, and trenches'],
    ['coral', 'Coral Reefs', ['five-oceans'], 'Underwater cities built by tiny coral animals'],
    ['ocean-life', 'Ocean Life Zones', ['depth'], 'Different creatures live at different depths'],
  ]),

  // ---- Maps and globes (10) ----
  ...topic('science.earth.maps', EARTH, 'discovery', [OBS, RUI], [
    ['globe', 'Globes', ['science.earth.day-night.spin'], 'A round model of Earth showing land and water'],
    ['flat-map', 'Flat Maps', ['globe'], 'Flatten the round Earth onto a flat surface'],
    ['continents', 'Continents', ['globe'], 'Seven large landmasses: Africa, Antarctica, Asia, Australia, Europe, North and South America'],
    ['oceans-map', 'Oceans on Maps', ['globe', 'science.earth.ocean.five-oceans'], 'Locate the five oceans on a world map'],
    ['compass-rose', 'Compass Rose', ['flat-map'], 'Use north, south, east, and west to give directions on maps'],
    ['map-key', 'Map Key', ['flat-map'], 'Read symbols and colours that represent features on a map'],
    ['scale', 'Map Scale', ['map-key', 'math.measurement.length'], 'Use scale to calculate real distances from map distances'],
    ['latitude', 'Latitude', ['globe'], 'Horizontal lines measuring distance north or south of the equator'],
    ['longitude', 'Longitude', ['globe'], 'Vertical lines measuring distance east or west of the prime meridian'],
    ['coordinates', 'Map Coordinates', ['latitude', 'longitude', 'math.number-ordering'], 'Use latitude and longitude to pinpoint any location on Earth'],
  ]),

  // ---- Soil types (6) ----
  ...topic('science.earth.soil', EARTH, 'discovery', [CAV, FOR], [
    ['layers', 'Soil Layers', ['science.earth.rocks.soil'], 'Topsoil, subsoil, and bedrock form distinct layers'],
    ['types', 'Soil Types', ['layers'], 'Sandy, clay, loam, and peat soils have different properties'],
    ['organisms', 'Soil Organisms', ['layers'], 'Worms, insects, fungi, and bacteria live in soil'],
    ['fertility', 'Soil Fertility', ['organisms'], 'Good soil has nutrients, water, and air for plant roots'],
    ['erosion-soil', 'Soil Erosion', ['science.earth.erosion.water-erosion'], 'Wind and water wash away precious topsoil'],
    ['conservation-soil', 'Soil Conservation', ['erosion-soil'], 'Terracing, mulching, and planting prevent soil loss'],
  ]),

  // ---- Landforms expand (10) ----
  ...expand('science.earth.landform', EARTH, 'discovery', [CAV, OBS],
    ['science.earth.maps.flat-map'],
    'Landform: {item}', 'Identify and describe {item} on maps and in nature', [
    ['mountain', 'Mountains'], ['valley', 'Valleys'], ['plateau', 'Plateaus'],
    ['plain', 'Plains'], ['delta', 'Deltas'], ['canyon', 'Canyons'],
    ['island', 'Islands'], ['peninsula', 'Peninsulas'], ['volcano-form', 'Volcanic Landforms'],
    ['glacier-form', 'Glacial Landforms'],
  ]),
];

// ===========================================================================
// EARTH SCIENCE — BUILDER  (~120 skills)
// Grades 3-5: Plate tectonics, minerals, rock types, climate vs weather,
//             ocean currents, topography, natural resources, natural disasters
// ===========================================================================

const earthBuilder: SkillNode[] = [

  // ---- Plate tectonics (12) ----
  ...topic('science.earth.tectonics', EARTH, 'builder', [CAV], [
    ['lithosphere', 'Lithosphere', ['science.earth.rock-cycle.metamorphic'], 'The rigid outer shell of Earth broken into tectonic plates'],
    ['asthenosphere', 'Asthenosphere', ['lithosphere'], 'Hot, slowly flowing rock beneath the plates'],
    ['plates', 'Tectonic Plates', ['lithosphere'], 'Large slabs of rock that fit together like a jigsaw puzzle'],
    ['divergent', 'Divergent Boundaries', ['plates'], 'Plates pull apart and new crust forms from rising magma'],
    ['convergent', 'Convergent Boundaries', ['plates'], 'Plates push together causing mountains or subduction'],
    ['transform', 'Transform Boundaries', ['plates'], 'Plates slide past each other causing earthquakes'],
    ['continental-drift', 'Continental Drift', ['plates'], 'Continents have moved across Earth surface over millions of years'],
    ['pangaea', 'Pangaea', ['continental-drift'], 'All continents were once joined in a single supercontinent'],
    ['evidence-tect', 'Evidence for Plate Tectonics', ['pangaea'], 'Fossil, rock, and coastline matches prove plates move'],
    ['mountain-building', 'Mountain Building', ['convergent'], 'Plates colliding push rock upward to form mountain ranges'],
    ['seafloor-spread', 'Seafloor Spreading', ['divergent'], 'New ocean floor forms at mid-ocean ridges and pushes outward'],
    ['subduction', 'Subduction Zones', ['convergent'], 'One plate dives under another, creating deep trenches'],
  ]),

  // ---- Minerals (10) ----
  ...topic('science.earth.minerals', EARTH, 'builder', [CAV], [
    ['what-is', 'What Are Minerals', ['science.earth.rock-cycle.igneous'], 'Naturally occurring solid crystals with a specific chemical composition'],
    ['properties', 'Mineral Properties', ['what-is'], 'Test colour, streak, lustre, hardness, and cleavage'],
    ['mohs', 'Mohs Hardness Scale', ['properties', 'math.number-ordering'], 'Rank minerals from talc at 1 to diamond at 10'],
    ['identification', 'Mineral Identification', ['properties'], 'Use property tests to identify unknown minerals'],
    ['crystal-systems', 'Crystal Systems', ['what-is', 'math.geometry'], 'Minerals form crystals in six basic geometric systems'],
    ['silicates', 'Silicate Minerals', ['what-is'], 'The most abundant mineral group, containing silicon and oxygen'],
    ['carbonates', 'Carbonate Minerals', ['what-is'], 'Minerals containing carbon and oxygen, like calcite and dolomite'],
    ['oxides', 'Oxide Minerals', ['what-is'], 'Metal-oxygen compounds that are important ores'],
    ['gems', 'Gems and Precious Stones', ['identification'], 'Rare, beautiful minerals valued for their colour and clarity'],
    ['mining', 'Mining', ['identification'], 'Extract useful minerals and ores from the Earth'],
  ]),

  // ---- Rock types detail (10) ----
  ...topic('science.earth.rock-types', EARTH, 'builder', [CAV, RUI], [
    ['igneous-intrusive', 'Intrusive Igneous', ['science.earth.rock-cycle.igneous'], 'Magma cools slowly underground forming large crystals: granite'],
    ['igneous-extrusive', 'Extrusive Igneous', ['science.earth.rock-cycle.igneous'], 'Lava cools quickly on the surface forming small crystals: basalt'],
    ['clastic', 'Clastic Sedimentary', ['science.earth.rock-cycle.sedimentary'], 'Made from fragments of other rocks: sandstone, shale'],
    ['chemical-sed', 'Chemical Sedimentary', ['science.earth.rock-cycle.sedimentary'], 'Formed from dissolved minerals precipitating out: limestone, rock salt'],
    ['organic-sed', 'Organic Sedimentary', ['science.earth.rock-cycle.sedimentary'], 'Made from remains of living things: coal, chalk'],
    ['foliated', 'Foliated Metamorphic', ['science.earth.rock-cycle.metamorphic'], 'Metamorphic rocks with visible layers: slate, schist, gneiss'],
    ['non-foliated', 'Non-Foliated Metamorphic', ['science.earth.rock-cycle.metamorphic'], 'Metamorphic rocks without layers: marble, quartzite'],
    ['rock-id', 'Rock Identification', ['igneous-intrusive', 'clastic', 'foliated'], 'Use texture, composition, and structure to identify rocks'],
    ['rock-uses', 'Rock Uses', ['rock-id'], 'Granite for countertops, limestone for cement, marble for statues'],
    ['stratigraphic', 'Stratigraphic Principles', ['clastic', 'math.number-ordering'], 'Lower layers are older; fossils help match distant layers'],
  ]),

  // ---- Climate vs weather (10) ----
  ...topic('science.earth.climate', EARTH, 'builder', [OBS], [
    ['difference', 'Climate vs Weather', ['science.earth.atmosphere.weather-forecast'], 'Weather is daily; climate is the average over decades'],
    ['climate-zones', 'Climate Zones', ['difference'], 'Tropical, temperate, polar, arid, and Mediterranean climates'],
    ['factors', 'Climate Factors', ['difference'], 'Latitude, altitude, ocean currents, and wind patterns shape climate'],
    ['global-wind', 'Global Wind Patterns', ['science.earth.atmosphere.wind'], 'Trade winds, westerlies, and polar easterlies circle the globe'],
    ['jet-stream', 'Jet Streams', ['global-wind'], 'Fast-flowing air rivers high in the atmosphere steer weather systems'],
    ['el-nino', 'El Nino and La Nina', ['science.earth.ocean.currents-intro'], 'Pacific Ocean temperature changes affect weather worldwide'],
    ['monsoon', 'Monsoons', ['global-wind'], 'Seasonal wind reversals bring heavy rains to parts of Asia'],
    ['climate-data', 'Climate Data', ['difference', 'math.data.graphs'], 'Analyse temperature and rainfall graphs for different regions'],
    ['urban-heat', 'Urban Heat Islands', ['factors'], 'Cities are warmer than surrounding countryside'],
    ['climate-history', 'Climate History', ['climate-data'], 'Ice cores and tree rings reveal past climate patterns'],
  ]),

  // ---- Ocean currents (8) ----
  ...topic('science.earth.currents', EARTH, 'builder', [REEF], [
    ['surface', 'Surface Currents', ['science.earth.ocean.currents-intro', 'science.earth.climate.global-wind'], 'Wind drives circular patterns of water flow in each ocean basin'],
    ['deep', 'Deep Ocean Currents', ['surface'], 'Cold, salty, dense water sinks and flows along the ocean floor'],
    ['thermohaline', 'Thermohaline Circulation', ['deep'], 'Temperature and salinity drive a global ocean conveyor belt'],
    ['upwelling', 'Upwelling', ['deep'], 'Deep, nutrient-rich water rises to the surface feeding ocean life'],
    ['gulf-stream', 'Gulf Stream', ['surface'], 'A warm current that carries heat from the tropics to northern Europe'],
    ['climate-oceans', 'Oceans and Climate', ['thermohaline'], 'Oceans store and distribute heat, moderating global climate'],
    ['coral-bleaching', 'Coral Bleaching', ['climate-oceans'], 'Warming waters stress corals, causing them to expel algae and turn white'],
    ['sea-level', 'Sea Level Changes', ['climate-oceans'], 'Melting ice and warming water cause seas to rise'],
  ]),

  // ---- Topography (8) ----
  ...topic('science.earth.topography', EARTH, 'builder', [CAV, OBS], [
    ['contour', 'Contour Lines', ['science.earth.maps.scale'], 'Lines connecting points of equal elevation on a map'],
    ['topographic', 'Topographic Maps', ['contour'], 'Maps that show the shape of the land with contour lines'],
    ['relief', 'Relief', ['topographic'], 'The difference between highest and lowest elevations in an area'],
    ['profile', 'Elevation Profiles', ['contour', 'math.data.graphs'], 'Draw a side view of the land from a contour map'],
    ['gis-intro', 'GIS Introduction', ['topographic'], 'Geographic Information Systems layer data onto maps digitally'],
    ['remote-intro', 'Remote Sensing Introduction', ['gis-intro'], 'Satellites and aircraft capture images of Earth surface'],
    ['bathymetry', 'Bathymetry', ['topographic'], 'Map the depth and shape of the ocean floor'],
    ['landform-processes', 'Landform Processes', ['topographic'], 'Weathering, erosion, and deposition shape the landscape'],
  ]),

  // ---- Natural resources (10) ----
  ...topic('science.earth.resources', EARTH, 'builder', [CAV, WS], [
    ['renewable', 'Renewable Resources', ['science.earth.water-cycle.cycle-diagram'], 'Resources that replenish naturally: water, wind, solar, wood'],
    ['non-renewable', 'Non-Renewable Resources', ['science.earth.minerals.mining'], 'Resources that take millions of years to form: fossil fuels, ores'],
    ['fossil-fuels', 'Fossil Fuels', ['non-renewable'], 'Coal, oil, and natural gas formed from ancient organisms'],
    ['solar-resource', 'Solar Energy', ['renewable'], 'Capture sunlight directly for heat and electricity'],
    ['wind-resource', 'Wind Energy', ['renewable'], 'Convert moving air into electricity with turbines'],
    ['hydro', 'Hydroelectric Energy', ['renewable'], 'Falling water spins turbines to generate electricity'],
    ['geothermal', 'Geothermal Energy', ['renewable'], 'Heat from inside Earth drives power stations'],
    ['conservation-res', 'Resource Conservation', ['renewable', 'non-renewable'], 'Use resources wisely to preserve them for the future'],
    ['water-resource', 'Water as a Resource', ['renewable'], 'Fresh water is limited and must be managed carefully'],
    ['recycling-res', 'Recycling Resources', ['conservation-res'], 'Recover and reuse materials to reduce mining and waste'],
  ]),

  // ---- Natural disasters (10) ----
  ...topic('science.earth.disasters', EARTH, 'builder', [CAV, OBS], [
    ['tsunami', 'Tsunamis', ['science.earth.earthquakes.effects'], 'Undersea earthquakes trigger massive ocean waves'],
    ['hurricane', 'Hurricanes', ['science.earth.atmosphere.wind', 'science.earth.ocean.waves-ocean'], 'Huge rotating storms that form over warm ocean water'],
    ['tornado', 'Tornadoes', ['science.earth.atmosphere.wind'], 'Violent spinning columns of air touching the ground'],
    ['flood', 'Floods', ['science.earth.water-cycle.runoff'], 'Rivers overflow when too much rain falls too quickly'],
    ['drought', 'Droughts', ['science.earth.climate.climate-data'], 'Extended periods without enough rain'],
    ['wildfire', 'Wildfires', ['science.earth.climate.climate-data'], 'Uncontrolled fires that burn through forests and grasslands'],
    ['landslide', 'Landslides', ['science.earth.erosion.water-erosion'], 'Saturated or unstable slopes suddenly collapse'],
    ['preparedness', 'Disaster Preparedness', ['tsunami', 'hurricane'], 'Plan and prepare for natural disasters before they happen'],
    ['warning-systems', 'Warning Systems', ['preparedness'], 'Technology that detects and alerts people to incoming disasters'],
    ['recovery', 'Disaster Recovery', ['preparedness'], 'Rebuild communities and restore services after a disaster'],
  ]),
];

// ===========================================================================
// EARTH SCIENCE — INNOVATOR  (~130 skills)
// Grades 6-8: Geological time, stratigraphy, paleontology, climate science,
//             atmospheric chemistry, oceanography, hydrology, astronomy
// ===========================================================================

const earthInnovator: SkillNode[] = [

  // ---- Geological time (10) ----
  ...topic('science.earth.geologic-time', EARTH, 'innovator', [RUI, CAV], [
    ['deep-time', 'Deep Time', ['science.earth.fossils.fossil-record', 'math.measurement.time'], 'Earth is 4.6 billion years old: almost incomprehensibly ancient'],
    ['eons', 'Eons', ['deep-time'], 'The largest divisions of geologic time: Hadean, Archean, Proterozoic, Phanerozoic'],
    ['eras', 'Eras', ['eons'], 'Paleozoic, Mesozoic, and Cenozoic divide the Phanerozoic eon'],
    ['periods', 'Periods', ['eras'], 'Finer divisions like Cambrian, Jurassic, and Quaternary'],
    ['epochs', 'Epochs', ['periods'], 'The finest divisions of geologic time within periods'],
    ['relative-dating', 'Relative Dating', ['science.earth.rock-types.stratigraphic'], 'Determine which events came first using rock layer position'],
    ['absolute-dating', 'Absolute Dating', ['relative-dating', 'science.chem.nuclear.half-life-calc'], 'Use radioactive decay to calculate exact ages in years'],
    ['index-fossils', 'Index Fossils', ['relative-dating', 'science.earth.fossils.fossil-record'], 'Widespread, short-lived species used to date rock layers'],
    ['correlation', 'Stratigraphic Correlation', ['index-fossils'], 'Match rock layers across different locations'],
    ['timeline', 'Geologic Timeline', ['eons', 'eras', 'periods'], 'Place major events on a scale model of Earth history'],
  ]),

  // ---- Stratigraphy (8) ----
  ...topic('science.earth.stratigraphy', EARTH, 'innovator', [CAV, RUI], [
    ['superposition', 'Law of Superposition', ['science.earth.geologic-time.relative-dating'], 'Undisturbed layers: bottom is oldest, top is youngest'],
    ['original-horiz', 'Original Horizontality', ['superposition'], 'Sedimentary layers are originally deposited horizontally'],
    ['cross-cutting', 'Cross-Cutting Relationships', ['superposition'], 'A feature that cuts through rock must be younger than the rock'],
    ['unconformities', 'Unconformities', ['superposition'], 'Gaps in the rock record where layers were eroded or not deposited'],
    ['facies', 'Sedimentary Facies', ['superposition'], 'Different rock types deposited at the same time in different environments'],
    ['sequence-strat', 'Sequence Stratigraphy', ['facies'], 'Analyse patterns of sea-level change preserved in rock layers'],
    ['biostratigraphy', 'Biostratigraphy', ['science.earth.geologic-time.index-fossils'], 'Use fossils to correlate and date rock layers'],
    ['magnetostratigraphy', 'Magnetostratigraphy', ['sequence-strat'], 'Date rocks using the record of Earth magnetic field reversals'],
  ]),

  // ---- Paleontology (10) ----
  ...topic('science.earth.paleontology', EARTH, 'innovator', [RUI], [
    ['cambrian', 'Cambrian Explosion', ['science.earth.geologic-time.eras'], 'A sudden burst of complex life appearing in the fossil record'],
    ['early-life', 'Early Life', ['cambrian'], 'First single-celled organisms, then photosynthesisers oxygenated the atmosphere'],
    ['marine-invert', 'Marine Invertebrate Fossils', ['cambrian'], 'Trilobites, ammonites, and brachiopods dominated ancient seas'],
    ['fish-evolution', 'Fish Evolution', ['marine-invert'], 'From jawless fish to jawed fish to the first land-going vertebrates'],
    ['land-colonization', 'Land Colonization', ['fish-evolution'], 'Plants, arthropods, then vertebrates moved onto land'],
    ['age-dinosaurs', 'Age of Dinosaurs', ['land-colonization'], 'Dinosaurs ruled for 160 million years across the Mesozoic'],
    ['kt-extinction', 'K-T Extinction', ['age-dinosaurs'], 'An asteroid impact ended the age of dinosaurs 66 million years ago'],
    ['mammal-rise', 'Rise of Mammals', ['kt-extinction'], 'Mammals diversified rapidly after dinosaurs disappeared'],
    ['human-evolution', 'Human Evolution', ['mammal-rise'], 'Trace the fossil record from early primates to Homo sapiens'],
    ['taphonomy', 'Taphonomy', ['science.earth.fossils.formation'], 'Study how organisms become fossils and what information is lost'],
  ]),

  // ---- Climate science (12) ----
  ...topic('science.earth.climate-sci', EARTH, 'innovator', [OBS], [
    ['greenhouse-effect', 'Greenhouse Effect', ['science.earth.atmosphere.composition', 'science.chem.environ.greenhouse'], 'Certain gases trap heat in the atmosphere like a blanket'],
    ['carbon-cycle-earth', 'Carbon Cycle', ['greenhouse-effect', 'science.bio.ecology.carbon-cycle'], 'Carbon moves between atmosphere, ocean, land, and living things'],
    ['evidence-climate', 'Climate Change Evidence', ['greenhouse-effect', 'math.data.graphs'], 'Temperature records, ice cores, sea levels, and glacial retreat'],
    ['feedback-climate', 'Climate Feedbacks', ['greenhouse-effect'], 'Melting ice, water vapour, and cloud changes amplify or dampen warming'],
    ['models', 'Climate Models', ['evidence-climate', 'math.algebra'], 'Computer simulations that project future climate scenarios'],
    ['impacts', 'Climate Change Impacts', ['evidence-climate'], 'Rising seas, extreme weather, ecosystem disruption, and food insecurity'],
    ['mitigation', 'Climate Mitigation', ['impacts'], 'Reduce emissions through renewable energy, efficiency, and technology'],
    ['adaptation', 'Climate Adaptation', ['impacts'], 'Adjust infrastructure and practices to cope with changing climate'],
    ['paleoclimate', 'Paleoclimate', ['science.earth.geologic-time.deep-time'], 'Study ancient climates using ice cores, pollen, and isotopes'],
    ['ice-ages', 'Ice Ages', ['paleoclimate'], 'Periodic glaciations driven by orbital changes and feedbacks'],
    ['milankovitch', 'Milankovitch Cycles', ['ice-ages', 'math.trig.basics'], 'Variations in Earth orbit that trigger ice age cycles'],
    ['tipping-points', 'Climate Tipping Points', ['feedback-climate'], 'Thresholds beyond which climate changes become self-reinforcing'],
  ]),

  // ---- Atmospheric science (8) ----
  ...topic('science.earth.atmos-sci', EARTH, 'innovator', [OBS], [
    ['energy-balance', 'Earth Energy Balance', ['science.earth.climate-sci.greenhouse-effect', 'math.equations'], 'Incoming solar energy must balance outgoing heat for stable climate'],
    ['radiation-atm', 'Atmospheric Radiation', ['energy-balance'], 'Track solar and terrestrial radiation through the atmosphere'],
    ['coriolis', 'Coriolis Effect', ['science.earth.climate.global-wind'], 'Earth rotation deflects moving air to the right in the north, left in the south'],
    ['pressure-systems', 'Pressure Systems', ['coriolis'], 'High and low pressure centres drive weather patterns'],
    ['fronts', 'Weather Fronts', ['pressure-systems'], 'Boundaries between air masses of different temperature and humidity'],
    ['severe-weather', 'Severe Weather Science', ['fronts'], 'Conditions that create thunderstorms, tornadoes, and hurricanes'],
    ['ozone-sci', 'Ozone Science', ['science.chem.environ.ozone'], 'Stratospheric ozone absorbs UV; tropospheric ozone is a pollutant'],
    ['aerosols', 'Atmospheric Aerosols', ['radiation-atm'], 'Tiny particles that reflect sunlight and seed cloud formation'],
  ]),

  // ---- Oceanography (10) ----
  ...topic('science.earth.oceanography', EARTH, 'innovator', [REEF], [
    ['ocean-structure', 'Ocean Structure', ['science.earth.currents.deep'], 'Temperature layers: warm surface, thermocline, cold deep water'],
    ['salinity', 'Salinity', ['ocean-structure'], 'Dissolved salt concentration varies by location and depth'],
    ['density-ocean', 'Ocean Water Density', ['salinity', 'ocean-structure'], 'Temperature and salinity together determine water density'],
    ['waves-detail', 'Ocean Wave Physics', ['science.earth.ocean.waves-ocean', 'science.physics.wave-props.wavelength'], 'Wave height, period, and energy depend on wind, duration, and fetch'],
    ['tides-detail', 'Tide Science', ['science.earth.ocean.tides', 'science.physics.gravitation.tides'], 'Spring and neap tides result from sun-moon gravitational alignment'],
    ['mid-ocean', 'Mid-Ocean Ridges', ['science.earth.tectonics.seafloor-spread'], 'Underwater mountain chains where new ocean floor forms'],
    ['trenches', 'Ocean Trenches', ['science.earth.tectonics.subduction'], 'The deepest parts of the ocean where plates descend'],
    ['hydrothermal', 'Hydrothermal Vents', ['mid-ocean'], 'Superheated water supports unique ecosystems in total darkness'],
    ['ocean-chemistry', 'Ocean Chemistry', ['salinity', 'science.chem.solutions.molarity'], 'Analyse the dissolved gases, nutrients, and pH of seawater'],
    ['ocean-technology', 'Ocean Technology', ['ocean-structure'], 'Submersibles, sonar, and satellites explore the deep'],
  ]),

  // ---- Hydrology (8) ----
  ...topic('science.earth.hydrology', EARTH, 'innovator', [REEF, CAV], [
    ['watershed', 'Watersheds', ['science.earth.water-cycle.runoff'], 'An area of land where all water drains to a common outlet'],
    ['aquifer', 'Aquifers', ['science.earth.water-cycle.groundwater'], 'Underground layers of rock that hold and transmit water'],
    ['well', 'Wells', ['aquifer'], 'Holes drilled into aquifers to access groundwater'],
    ['water-table', 'Water Table', ['aquifer'], 'The upper surface of the saturated zone underground'],
    ['stream-flow', 'Stream Flow', ['watershed', 'math.equations'], 'Measure the volume of water flowing past a point per second'],
    ['flood-hydrology', 'Flood Hydrology', ['stream-flow'], 'Predict when and where rivers will overflow'],
    ['water-quality', 'Water Quality', ['aquifer', 'science.chem.environ.water-pollution'], 'Test water for pollutants, pH, dissolved oxygen, and clarity'],
    ['water-management', 'Water Resource Management', ['water-quality'], 'Balance human water needs with environmental protection'],
  ]),

  // ---- Astronomy (16) ----
  ...topic('science.earth.astronomy', EARTH, 'innovator', [OBS], [
    ['solar-system', 'Solar System', ['science.earth.sun-moon.sun', 'science.earth.sun-moon.stars-intro'], 'Our sun and the planets, moons, and small bodies that orbit it'],
    ['inner-planets', 'Inner Planets', ['solar-system'], 'Mercury, Venus, Earth, and Mars: small and rocky'],
    ['outer-planets', 'Outer Planets', ['solar-system'], 'Jupiter, Saturn, Uranus, and Neptune: large gas and ice giants'],
    ['moons', 'Moons', ['solar-system'], 'Natural satellites orbiting planets throughout the solar system'],
    ['asteroids', 'Asteroids', ['solar-system'], 'Rocky bodies orbiting mostly between Mars and Jupiter'],
    ['comets', 'Comets', ['solar-system'], 'Icy bodies that develop tails when approaching the sun'],
    ['earth-moon', 'Earth-Moon System', ['moons', 'science.earth.ocean.tides'], 'How the Moon affects tides, eclipses, and Earth rotation'],
    ['eclipses', 'Eclipses', ['earth-moon'], 'Solar and lunar eclipses occur when sun, Earth, and Moon align'],
    ['seasons-astro', 'Seasons Explained', ['science.earth.seasons.changes', 'math.geometry.angles'], 'Earth tilted axis causes seasons as it orbits the sun'],
    ['star-types', 'Star Types', ['science.earth.sun-moon.stars-intro'], 'Main sequence, red giants, white dwarfs, and neutron stars'],
    ['star-life', 'Stellar Life Cycle', ['star-types'], 'Stars are born in nebulae, live, and die as remnants'],
    ['galaxies', 'Galaxies', ['star-types'], 'Billions of stars bound by gravity: spiral, elliptical, irregular'],
    ['milky-way', 'The Milky Way', ['galaxies'], 'Our home galaxy containing hundreds of billions of stars'],
    ['telescope', 'Telescopes', ['star-types'], 'Optical, radio, and space telescopes reveal the universe'],
    ['light-year', 'Light-Years', ['telescope', 'math.multiplication'], 'The distance light travels in one year: measuring cosmic distances'],
    ['universe-scale', 'Scale of the Universe', ['light-year', 'galaxies'], 'From atoms to superclusters: the vast range of cosmic scales'],
  ]),

  // ---- Geomorphology (8) ----
  ...topic('science.earth.geomorphology', EARTH, 'innovator', [CAV], [
    ['fluvial', 'Fluvial Processes', ['science.earth.hydrology.stream-flow'], 'Rivers erode, transport, and deposit sediment shaping valleys'],
    ['glacial', 'Glacial Processes', ['science.earth.erosion.ice-erosion'], 'Glaciers carve U-shaped valleys, cirques, and moraines'],
    ['coastal', 'Coastal Processes', ['science.earth.oceanography.waves-detail'], 'Waves erode cliffs and deposit beaches and spits'],
    ['aeolian', 'Aeolian Processes', ['science.earth.erosion.wind-erosion'], 'Wind shapes sand dunes and erodes desert landforms'],
    ['karst', 'Karst Landscapes', ['science.earth.erosion.caves'], 'Dissolved limestone creates sinkholes, caves, and underground rivers'],
    ['volcanic-land', 'Volcanic Landforms', ['science.earth.volcanoes.types-volcano'], 'Calderas, lava plateaus, and volcanic islands'],
    ['mass-wasting', 'Mass Wasting', ['science.earth.disasters.landslide'], 'Gravity moves rock and soil downslope: slides, flows, and falls'],
    ['landscape-evolution', 'Landscape Evolution', ['fluvial', 'glacial', 'coastal'], 'Landscapes change through cycles of uplift and erosion'],
  ]),

  // ---- Geological periods expand (12) ----
  ...expand('science.earth.period', EARTH, 'innovator', [RUI],
    ['science.earth.geologic-time.periods'],
    'Period: {item}', 'Explore the life, climate, and geology of the {item} Period', [
    ['cambrian', 'Cambrian'], ['ordovician', 'Ordovician'], ['silurian', 'Silurian'],
    ['devonian', 'Devonian'], ['carboniferous', 'Carboniferous'], ['permian', 'Permian'],
    ['triassic', 'Triassic'], ['jurassic', 'Jurassic'], ['cretaceous', 'Cretaceous'],
    ['paleogene', 'Paleogene'], ['neogene', 'Neogene'], ['quaternary', 'Quaternary'],
  ]),

  // ---- Field methods (8) ----
  ...parallel('science.earth.field', EARTH, 'innovator', [CAV, RUI],
    ['science.earth.geologic-time.relative-dating', 'science.physics.lab.hypothesis'], [
    ['geological-map', 'Geological Mapping', 'Record rock types, structures, and boundaries on a field map'],
    ['cross-section', 'Cross-Section Drawing', 'Create vertical slices through the landscape showing rock layers'],
    ['compass-clinometer', 'Compass and Clinometer', 'Measure the orientation and dip angle of rock layers'],
    ['rock-sampling', 'Rock Sampling', 'Collect and label rock samples systematically in the field'],
    ['soil-profiling', 'Soil Profiling', 'Dig a pit and describe each soil horizon'],
    ['stream-survey', 'Stream Survey', 'Measure velocity, depth, and channel shape along a river'],
    ['fossil-collection', 'Fossil Collection', 'Find, extract, and catalogue fossils following ethical guidelines'],
    ['hazard-assessment', 'Hazard Assessment', 'Evaluate geological risks at a field site'],
  ]),
];

// ===========================================================================
// EARTH SCIENCE — CREATOR  (~110 skills)
// Advanced: Planetary science, cosmology, geophysics, climate modelling,
//           astrobiology, remote sensing, space exploration
// ===========================================================================

const earthCreator: SkillNode[] = [

  // ---- Planetary science (12) ----
  ...topic('science.earth.planetary', EARTH, 'creator', [OBS], [
    ['formation', 'Solar System Formation', ['science.earth.astronomy.solar-system', 'science.physics.gravitation.universal'], 'A collapsing cloud of gas and dust formed the sun and planets'],
    ['accretion', 'Planetary Accretion', ['formation'], 'Dust and rock collided and stuck together to build planets'],
    ['differentiation', 'Planetary Differentiation', ['accretion'], 'Heavy elements sank to form cores; light elements rose to form crusts'],
    ['atmospheres', 'Planetary Atmospheres', ['differentiation'], 'Compare atmospheres of Venus, Earth, Mars, and the gas giants'],
    ['mars-geology', 'Mars Geology', ['atmospheres'], 'Olympus Mons, Valles Marineris, and evidence of ancient water'],
    ['venus', 'Venus', ['atmospheres'], 'Runaway greenhouse effect created a hellish surface environment'],
    ['jupiter-saturn', 'Giant Planet Systems', ['science.earth.astronomy.outer-planets'], 'Massive atmospheres, ring systems, and dozens of moons'],
    ['titan', 'Titan', ['jupiter-saturn'], 'Saturn moon with a thick atmosphere and liquid methane lakes'],
    ['ice-moons', 'Ice Moons', ['jupiter-saturn'], 'Europa, Enceladus, and Ganymede may harbour subsurface oceans'],
    ['exoplanets', 'Exoplanet Science', ['science.physics.astrophysics.exoplanets'], 'Thousands of planets discovered around other stars'],
    ['habitable', 'Habitability', ['exoplanets'], 'Conditions needed for a planet to potentially support life'],
    ['planetary-protection', 'Planetary Protection', ['habitable'], 'Prevent biological contamination between Earth and other worlds'],
  ]),

  // ---- Cosmology (10) ----
  ...topic('science.earth.cosmology', EARTH, 'creator', [OBS], [
    ['big-bang', 'Big Bang Evidence', ['science.physics.astrophysics.big-bang'], 'CMB radiation, galaxy redshifts, and element abundances confirm the Big Bang'],
    ['expansion', 'Cosmic Expansion', ['big-bang'], 'Space itself stretches, carrying galaxies apart'],
    ['dark-matter-cosmo', 'Dark Matter', ['expansion', 'science.physics.astrophysics.dark-matter'], 'Invisible mass that holds galaxies together'],
    ['dark-energy-cosmo', 'Dark Energy', ['expansion', 'science.physics.astrophysics.dark-energy'], 'Mysterious force accelerating cosmic expansion'],
    ['nucleosynthesis', 'Nucleosynthesis', ['big-bang'], 'Light elements formed in the first minutes; heavy elements in stars'],
    ['structure-universe', 'Large-Scale Structure', ['expansion'], 'Galaxies cluster into filaments and voids spanning billions of light-years'],
    ['fate', 'Fate of the Universe', ['dark-energy-cosmo'], 'The universe may expand forever, collapse, or reach a steady state'],
    ['multiverse', 'Multiverse Hypothesis', ['fate'], 'Could our universe be one of many'],
    ['cosmic-inflation', 'Cosmic Inflation', ['big-bang'], 'A brief exponential expansion that smoothed the early universe'],
    ['gravitational-wave-cosmo', 'Gravitational Wave Cosmology', ['science.physics.general-rel.gravitational-waves'], 'Listen to the universe through ripples in spacetime'],
  ]),

  // ---- Geophysics (10) ----
  ...topic('science.earth.geophysics', EARTH, 'creator', [CAV], [
    ['seismology', 'Seismology', ['science.earth.earthquakes.waves', 'math.calculus'], 'Study seismic waves to reveal Earth interior structure'],
    ['earth-interior', 'Earth Interior', ['seismology'], 'Crust, mantle, outer core, and inner core'],
    ['convection-mantle', 'Mantle Convection', ['earth-interior'], 'Hot rock rises and cool rock sinks driving plate motion'],
    ['geomagnetism', 'Geomagnetism', ['earth-interior', 'science.physics.magnetism.earth-field'], 'Earth magnetic field is generated by the liquid iron outer core'],
    ['magnetic-reversals', 'Magnetic Reversals', ['geomagnetism'], 'Earth magnetic field flips direction every few hundred thousand years'],
    ['gravity-surveys', 'Gravity Surveys', ['science.physics.gravitation.grav-field'], 'Map density variations underground from subtle gravity differences'],
    ['isostasy', 'Isostasy', ['convection-mantle'], 'The crust floats on the denser mantle like ice on water'],
    ['heat-flow', 'Earth Heat Flow', ['convection-mantle'], 'Measure heat escaping from Earth interior through the crust'],
    ['geophysical-methods', 'Geophysical Methods', ['gravity-surveys', 'seismology'], 'Use seismic, magnetic, and electrical methods to image underground'],
    ['earthquake-eng', 'Earthquake Engineering', ['seismology'], 'Design structures that withstand seismic shaking'],
  ]),

  // ---- Climate modelling (10) ----
  ...topic('science.earth.climate-model', EARTH, 'creator', [OBS], [
    ['gcm', 'General Circulation Models', ['science.earth.climate-sci.models', 'math.calculus'], 'Simulate atmosphere and ocean circulation on a global grid'],
    ['parametrization', 'Parametrisation', ['gcm'], 'Represent processes too small for the grid as statistical approximations'],
    ['scenarios', 'Emission Scenarios', ['gcm'], 'Model future climate under different greenhouse gas pathways'],
    ['regional', 'Regional Climate Models', ['gcm'], 'Downscale global models for local climate projections'],
    ['earth-system', 'Earth System Models', ['gcm'], 'Couple atmosphere, ocean, ice, land, and biosphere in one model'],
    ['validation', 'Model Validation', ['earth-system', 'math.statistics.descriptive'], 'Test models against historical observations and paleoclimate data'],
    ['sensitivity', 'Climate Sensitivity', ['earth-system'], 'How much temperature rises per doubling of CO2'],
    ['attribution', 'Climate Attribution', ['validation'], 'Determine how much of observed warming is caused by humans'],
    ['projections', 'Future Projections', ['scenarios'], 'Forecast temperature, sea level, and weather extremes for coming decades'],
    ['policy-modelling', 'Climate Policy Modelling', ['projections'], 'Use models to evaluate the impact of emission reduction strategies'],
  ]),

  // ---- Remote sensing advanced (8) ----
  ...topic('science.earth.remote-sensing', EARTH, 'creator', [OBS], [
    ['satellite', 'Satellite Remote Sensing', ['science.earth.topography.remote-intro'], 'Observe Earth from orbit using optical and radar instruments'],
    ['spectral', 'Spectral Analysis', ['satellite', 'science.physics.em-spectrum.overview'], 'Identify surface materials from their spectral signatures'],
    ['lidar', 'LiDAR', ['satellite'], 'Measure surface elevation with laser pulses from aircraft'],
    ['sar', 'Synthetic Aperture Radar', ['satellite'], 'Image the surface through clouds using radar pulses'],
    ['thermal-remote', 'Thermal Remote Sensing', ['satellite', 'science.physics.em-spectrum.infrared'], 'Map surface temperatures from space'],
    ['change-detection', 'Change Detection', ['satellite', 'math.statistics.descriptive'], 'Compare satellite images over time to detect land use changes'],
    ['gis-adv', 'Advanced GIS', ['science.earth.topography.gis-intro'], 'Analyse spatial data with overlay, buffer, and network analysis'],
    ['drone-survey', 'Drone Surveys', ['lidar'], 'Use unmanned aircraft for high-resolution local mapping'],
  ]),

  // ---- Space exploration (10) ----
  ...topic('science.earth.space-exploration', EARTH, 'creator', [OBS], [
    ['rocketry', 'Rocketry', ['science.physics.momentum.rocket'], 'Overcome Earth gravity with staged rocket propulsion'],
    ['orbital-mechanics', 'Orbital Mechanics', ['science.physics.gravitation.satellites'], 'Calculate trajectories for spacecraft missions'],
    ['iss', 'International Space Station', ['orbital-mechanics'], 'A habitable laboratory orbiting Earth since 1998'],
    ['mars-missions', 'Mars Missions', ['orbital-mechanics'], 'Rovers, landers, and plans for human missions to Mars'],
    ['deep-space', 'Deep Space Probes', ['orbital-mechanics'], 'Voyager, New Horizons, and missions beyond the solar system'],
    ['space-telescopes', 'Space Telescopes', ['science.earth.astronomy.telescope'], 'Hubble and James Webb observe the universe above the atmosphere'],
    ['human-spaceflight', 'Human Spaceflight', ['iss'], 'Challenges of keeping humans alive and healthy in space'],
    ['space-habitats', 'Space Habitats', ['human-spaceflight'], 'Design self-sustaining environments for long-duration missions'],
    ['asteroid-mining', 'Asteroid Mining', ['deep-space'], 'Extract valuable resources from near-Earth asteroids'],
    ['space-policy', 'Space Policy and Law', ['iss'], 'International treaties and regulations governing space activities'],
  ]),

  // ---- Volcanology advanced (8) ----
  ...topic('science.earth.volcanology', EARTH, 'creator', [CAV], [
    ['magma-chem', 'Magma Chemistry', ['science.earth.volcanoes.magma', 'science.chem.bonding.ionic'], 'Silica content determines magma viscosity and eruption style'],
    ['eruption-dynamics', 'Eruption Dynamics', ['magma-chem', 'science.physics.fluid-adv.reynolds'], 'Model the physics of magma flow and explosive fragmentation'],
    ['pyroclastic', 'Pyroclastic Flows', ['eruption-dynamics'], 'Deadly fast-moving currents of hot gas and volcanic debris'],
    ['lahar', 'Lahars', ['eruption-dynamics'], 'Volcanic mudflows that sweep down river valleys'],
    ['caldera', 'Caldera Formation', ['eruption-dynamics'], 'Massive collapse craters from the most powerful eruptions'],
    ['monitoring', 'Volcano Monitoring', ['eruption-dynamics'], 'Track seismicity, gas emissions, and ground deformation'],
    ['super-volcanoes', 'Supervolcanoes', ['caldera'], 'Rare eruptions that can alter global climate for years'],
    ['volcanic-climate', 'Volcanic Climate Effects', ['super-volcanoes', 'science.earth.climate-sci.feedback-climate'], 'Major eruptions inject aerosols that cool the planet temporarily'],
  ]),

  // ---- Seismology advanced (8) ----
  ...topic('science.earth.seismology', EARTH, 'creator', [CAV], [
    ['p-waves', 'P-Waves', ['science.earth.geophysics.seismology'], 'Primary compressional waves that travel through solids and liquids'],
    ['s-waves', 'S-Waves', ['p-waves'], 'Secondary shear waves that travel only through solids'],
    ['surface-waves', 'Surface Waves', ['p-waves', 's-waves'], 'Love and Rayleigh waves that cause most earthquake damage'],
    ['seismograph', 'Seismograph Analysis', ['surface-waves', 'math.data.graphs'], 'Interpret seismograms to locate and measure earthquakes'],
    ['moment-magnitude', 'Moment Magnitude', ['seismograph', 'math.algebra'], 'A more accurate measure of earthquake size than the Richter scale'],
    ['tomography', 'Seismic Tomography', ['p-waves', 's-waves', 'math.calculus'], 'Create 3D images of Earth interior from seismic wave travel times'],
    ['fault-mechanics', 'Fault Mechanics', ['science.earth.tectonics.transform', 'science.physics.statics.shear'], 'Analyse stress accumulation and release along fault planes'],
    ['induced-seismicity', 'Induced Seismicity', ['fault-mechanics'], 'Human activities like fracking and reservoir filling trigger earthquakes'],
  ]),

  // ---- Glaciology (8) ----
  ...topic('science.earth.glaciology', EARTH, 'creator', [CAV, OBS], [
    ['ice-sheets', 'Ice Sheets', ['science.earth.geomorphology.glacial'], 'Continental-scale ice masses covering Greenland and Antarctica'],
    ['glacier-dynamics', 'Glacier Dynamics', ['ice-sheets', 'science.physics.fluid-adv.drag'], 'Ice flows under its own weight, faster at the centre than edges'],
    ['ice-cores', 'Ice Core Analysis', ['ice-sheets', 'science.earth.climate-sci.paleoclimate'], 'Trapped air bubbles preserve records of past atmospheres'],
    ['sea-ice', 'Sea Ice', ['ice-sheets'], 'Frozen ocean surface that expands and contracts with seasons'],
    ['permafrost', 'Permafrost', ['ice-sheets'], 'Permanently frozen ground that stores vast amounts of carbon'],
    ['glacial-geology', 'Glacial Geology', ['glacier-dynamics'], 'Moraines, drumlins, erratics, and other landforms left by ice'],
    ['ice-mass-balance', 'Ice Mass Balance', ['glacier-dynamics', 'math.calculus'], 'Measure accumulation and ablation to track glacier health'],
    ['ice-climate', 'Ice and Climate', ['ice-mass-balance', 'science.earth.climate-sci.feedback-climate'], 'Melting ice raises sea levels and reduces Earth reflectivity'],
  ]),

  // ---- Stellar objects expand (8) ----
  ...expand('science.earth.stellar', EARTH, 'creator', [OBS],
    ['science.earth.astronomy.star-types'],
    'Stellar Object: {item}', 'Study the formation, properties, and fate of {item}', [
    ['red-giant', 'Red Giants'], ['white-dwarf', 'White Dwarfs'],
    ['neutron-star', 'Neutron Stars'], ['pulsar', 'Pulsars'],
    ['black-hole', 'Black Holes'], ['nebula', 'Nebulae'],
    ['binary-star', 'Binary Stars'], ['supernova-remnant', 'Supernova Remnants'],
  ]),

  // ---- Capstone (8) ----
  ...parallel('science.earth.capstone', EARTH, 'creator', [CAV, OBS],
    ['science.earth.geophysics.seismology', 'science.earth.climate-sci.models'], [
    ['research-earth', 'Earth Science Research Project', 'Conduct original research on an earth science question'],
    ['field-project', 'Field Geology Project', 'Map and interpret the geology of a local area'],
    ['climate-project', 'Climate Analysis Project', 'Analyse climate data to identify trends and patterns'],
    ['remote-project', 'Remote Sensing Project', 'Use satellite data to investigate an environmental problem'],
    ['hazard-project', 'Natural Hazard Project', 'Assess and map natural hazards in a region'],
    ['planetary-project', 'Planetary Science Project', 'Analyse data from a space mission to another world'],
    ['review-earth', 'Earth Science Literature Review', 'Survey current research on an earth science topic'],
    ['outreach-earth', 'Earth Science Outreach', 'Create materials that explain earth science to the public'],
  ]),
];


// ===========================================================================
// SUPPLEMENTARY SECTIONS — Additional depth and breadth across all subjects
// ===========================================================================

// ---- Physics supplementary (~170 skills) ----

const physicsDiscovery2: SkillNode[] = [
  ...expand('science.physics.force-type', PHYS, 'discovery', [WS],
    ['science.physics.forces'],
    'Force: {item}', 'Investigate the {item} force through experiments', [
    ['spring', 'Spring'], ['drag', 'Drag'], ['thrust', 'Thrust'],
    ['upthrust', 'Upthrust'], ['weight-force', 'Weight'], ['reaction', 'Reaction'],
    ['centripetal-intro', 'Centripetal'], ['magnetic-force', 'Magnetic'],
    ['electrostatic', 'Electrostatic'], ['gravitational', 'Gravitational'],
  ]),
  ...expand('science.physics.energy-source', PHYS, 'discovery', [WS],
    ['science.physics.energy.sources'],
    'Energy Source: {item}', 'Explore how {item} provides energy', [
    ['sun-energy', 'The Sun'], ['food-energy', 'Food'], ['fossil-fuel', 'Fossil Fuels'],
    ['wind-energy', 'Wind'], ['water-energy', 'Flowing Water'], ['nuclear-source', 'Nuclear'],
    ['biomass', 'Biomass'], ['geothermal-src', 'Geothermal'], ['tidal', 'Tidal'],
    ['wave-energy', 'Wave Energy'],
  ]),
  ...topic('science.physics.weather-phys', PHYS, 'discovery', [WS, OBS], [
    ['wind-force', 'Wind as a Force', ['science.physics.forces', 'science.weather'], 'Moving air exerts force on objects'],
    ['rain-cycle', 'Rain and Energy', ['science.physics.energy.thermal', 'science.weather'], 'Heat energy drives the water cycle'],
    ['thunder', 'Thunder and Lightning', ['science.physics.sound', 'science.physics.electricity.static'], 'Lightning is a giant spark and thunder is the sound it makes'],
    ['rainbow-phys', 'Rainbow Physics', ['science.physics.light.prism', 'science.weather'], 'Raindrops split sunlight into a rainbow'],
    ['barometer-weather', 'Barometers and Weather', ['science.physics.heat.temperature', 'science.weather'], 'Air pressure changes predict weather'],
  ]),
  ...parallel('science.physics.sound-project', PHYS, 'discovery', [WS],
    ['science.physics.sound', 'science.physics.sound-disc.pitch'], [
    ['string-phone', 'String Telephone', 'Transmit sound through a taut string between two cups'],
    ['straw-oboe', 'Straw Oboe', 'Cut a straw to make a simple reed instrument'],
    ['bottle-organ', 'Bottle Organ', 'Fill bottles with water to create different musical notes'],
    ['drum-build', 'Drum Building', 'Stretch material over a container to make a drum'],
    ['kazoo', 'Kazoo Making', 'Build a kazoo from a comb and tissue paper'],
  ]),
];

const physicsBuilder2: SkillNode[] = [
  ...expand('science.physics.wave-app', PHYS, 'builder', [WS],
    ['science.physics.waves'],
    'Wave Application: {item}', 'Apply wave physics to understand {item}', [
    ['music-acoustics', 'Musical Acoustics'], ['earthquake-waves', 'Earthquake Waves'],
    ['medical-ultrasound', 'Medical Ultrasound'], ['sonar-app', 'Sonar'],
    ['radar-app', 'Radar'], ['radio-waves-app', 'Radio Communication'],
    ['microwave-oven', 'Microwave Ovens'], ['wifi', 'WiFi Signals'],
    ['noise-cancel', 'Noise Cancelling'], ['seismic-survey', 'Seismic Surveys'],
  ]),
  ...expand('science.physics.circuit-comp', PHYS, 'builder', [WS],
    ['science.physics.circuits'],
    'Circuit Component: {item}', 'Understand the role of {item} in electrical circuits', [
    ['led-comp', 'LEDs'], ['motor-comp', 'Electric Motors'],
    ['buzzer', 'Buzzers'], ['relay-comp', 'Relays'],
    ['thermistor', 'Thermistors'], ['ldr', 'Light-Dependent Resistors'],
    ['diode-comp', 'Diodes'], ['potentiometer', 'Potentiometers'],
    ['transformer-comp', 'Transformers'], ['inductor', 'Inductors'],
  ]),
  ...topic('science.physics.materials-phys', PHYS, 'builder', [WS], [
    ['elastic-materials', 'Elastic Materials', ['science.physics.newton.third-law'], 'Materials that return to original shape after deformation'],
    ['plastic-materials', 'Plastic Materials', ['elastic-materials'], 'Materials that permanently deform under stress'],
    ['brittle', 'Brittle Materials', ['elastic-materials'], 'Materials that break without bending'],
    ['ductile', 'Ductile Materials', ['plastic-materials'], 'Materials that can be drawn into wires'],
    ['malleable', 'Malleable Materials', ['plastic-materials'], 'Materials that can be hammered into sheets'],
    ['composite-phys', 'Composite Materials Physics', ['elastic-materials'], 'Combining materials to get the best of each'],
    ['hooke', 'Hooke Law', ['elastic-materials', 'math.equations'], 'Force is proportional to extension for elastic materials'],
    ['springs', 'Springs', ['hooke'], 'Calculate spring constants and elastic potential energy'],
  ]),
  ...parallel('science.physics.energy-project', PHYS, 'builder', [WS],
    ['science.physics.work-energy.conservation', 'science.physics.lab.hypothesis'], [
    ['pendulum-energy', 'Pendulum Energy Transfer', 'Track KE and PE exchange in a swinging pendulum'],
    ['bouncing-ball', 'Bouncing Ball Efficiency', 'Measure energy lost with each bounce'],
    ['mousetrap-car', 'Mousetrap Car', 'Convert spring PE into vehicle motion'],
    ['rubber-band-car', 'Rubber Band Car', 'Power a car with elastic potential energy'],
    ['water-wheel', 'Water Wheel', 'Convert flowing water into rotational energy'],
    ['hand-generator', 'Hand Generator', 'Turn mechanical energy into electrical energy by hand'],
  ]),
];

const physicsInnovator2: SkillNode[] = [
  ...expand('science.physics.em-app', PHYS, 'innovator', [WS, OBS],
    ['science.physics.em-spectrum.overview'],
    'EM Application: {item}', 'Explore the physics behind {item}', [
    ['radio-telescope', 'Radio Telescopes'], ['ir-camera', 'Infrared Cameras'],
    ['uv-sterilization', 'UV Sterilisation'], ['microwave-comm', 'Microwave Links'],
    ['fiber-comm', 'Fibre-Optic Communication'], ['satellite-comm', 'Satellite Communication'],
    ['spectroscopy-app', 'Spectroscopy'], ['remote-sensing-em', 'Remote Sensing'],
    ['xray-security', 'X-Ray Security'], ['gamma-sterilize', 'Gamma Sterilisation'],
    ['thermal-imaging', 'Thermal Imaging'], ['radio-astronomy', 'Radio Astronomy'],
  ]),
  ...topic('science.physics.math-phys', PHYS, 'innovator', [WS], [
    ['vectors', 'Vectors in Physics', ['science.physics.kinematics.velocity-vec', 'math.trig.basics'], 'Represent forces and velocities as vectors with magnitude and direction'],
    ['dot-product', 'Dot Product', ['vectors'], 'Calculate work as the dot product of force and displacement'],
    ['cross-product', 'Cross Product', ['vectors'], 'Calculate torque as the cross product of radius and force'],
    ['calculus-phys', 'Calculus in Physics', ['math.calculus.derivatives'], 'Differentiate position for velocity and velocity for acceleration'],
    ['integration-phys', 'Integration in Physics', ['math.calculus.integrals'], 'Integrate force over distance for work and over time for impulse'],
    ['diff-eq-phys', 'Differential Equations in Physics', ['calculus-phys'], 'Set up and solve differential equations for physical systems'],
    ['dimensional', 'Dimensional Analysis', ['vectors', 'math.algebra'], 'Check equation validity by analysing units on each side'],
    ['error-prop', 'Error Propagation', ['math.statistics.descriptive'], 'Calculate how measurement uncertainties combine in calculations'],
    ['graphical-analysis', 'Graphical Analysis', ['math.data.graphs'], 'Extract physical quantities from gradients and intercepts of graphs'],
    ['logarithmic', 'Logarithmic Scales', ['math.algebra'], 'Use log scales for quantities spanning many orders of magnitude'],
  ]),
  ...expand('science.physics.thermo-app', PHYS, 'innovator', [WS],
    ['science.physics.thermo.first-law'],
    'Thermo Application: {item}', 'Analyse the thermodynamics of {item}', [
    ['steam-engine', 'Steam Engines'], ['internal-combustion', 'Internal Combustion Engines'],
    ['refrigerator', 'Refrigerators'], ['heat-pump', 'Heat Pumps'],
    ['air-conditioning', 'Air Conditioning'], ['power-plant', 'Power Plants'],
    ['rocket-thermo', 'Rocket Engines'], ['turbine', 'Gas Turbines'],
  ]),
  ...parallel('science.physics.investigation', PHYS, 'innovator', [WS],
    ['science.physics.lab.peer-review', 'math.statistics.descriptive'], [
    ['uncertainty-lab', 'Uncertainty Analysis', 'Quantify and report measurement uncertainties'],
    ['systematic-error', 'Systematic Errors', 'Identify and correct sources of systematic error'],
    ['random-error', 'Random Errors', 'Reduce random errors through repeated measurements'],
    ['significant-figures', 'Significant Figures', 'Report results to an appropriate number of significant figures'],
    ['scientific-notation', 'Scientific Notation', 'Express very large and small numbers concisely'],
    ['experimental-design', 'Advanced Experimental Design', 'Design experiments that control for multiple variables'],
  ]),
];

const physicsCreator2: SkillNode[] = [
  ...expand('science.physics.frontier', PHYS, 'creator', [WS, OBS],
    ['science.physics.quantum.schrodinger', 'science.physics.general-rel.curved-space'],
    'Frontier: {item}', 'Explore cutting-edge research in {item}', [
    ['quantum-gravity', 'Quantum Gravity'], ['string-theory', 'String Theory'],
    ['loop-quantum', 'Loop Quantum Gravity'], ['holographic', 'Holographic Principle'],
    ['quantum-info', 'Quantum Information'], ['metamaterials', 'Metamaterials'],
    ['spintronics', 'Spintronics'], ['photonics', 'Photonics'],
    ['neutrino-phys', 'Neutrino Physics'], ['gravitational-wave-det', 'Gravitational Wave Detection'],
    ['dark-sector', 'Dark Sector Physics'], ['topological-phys', 'Topological Physics'],
  ]),
];

// ---- Chemistry supplementary (~210 skills) ----

const chemDiscovery2: SkillNode[] = [
  ...expand('science.chem.compound', CHEM, 'discovery', [ALC],
    ['science.chem.molecules.formulas'],
    'Compound: {item}', 'Explore the properties and uses of {item}', [
    ['water-compound', 'Water (H2O)'], ['salt', 'Table Salt (NaCl)'],
    ['sugar', 'Sugar (C12H22O11)'], ['baking-soda', 'Baking Soda (NaHCO3)'],
    ['vinegar', 'Vinegar (CH3COOH)'], ['chalk', 'Chalk (CaCO3)'],
    ['rust-compound', 'Rust (Fe2O3)'], ['ammonia-comp', 'Ammonia (NH3)'],
    ['methane', 'Methane (CH4)'], ['ethanol', 'Ethanol (C2H5OH)'],
    ['hydrogen-peroxide', 'Hydrogen Peroxide (H2O2)'], ['aspirin', 'Aspirin'],
    ['caffeine', 'Caffeine'], ['citric-acid', 'Citric Acid'],
  ]),
  ...expand('science.chem.separation', CHEM, 'discovery', [ALC],
    ['science.chem.mix-comp.separating'],
    'Separation: {item}', 'Separate mixtures using the {item} technique', [
    ['filtration-tech', 'Filtration'], ['evaporation-tech', 'Evaporation'],
    ['distillation-tech', 'Distillation'], ['chromatography-paper', 'Paper Chromatography'],
    ['decanting', 'Decanting'], ['centrifuge', 'Centrifuging'],
    ['magnetic-sep-tech', 'Magnetic Separation'], ['sublimation', 'Sublimation'],
  ]),
  ...parallel('science.chem.experiments', CHEM, 'discovery', [ALC],
    ['science.chem.changes.chemical', 'science.chem.lab-safety.recording-lab'], [
    ['elephant-toothpaste', 'Elephant Toothpaste', 'Catalyse hydrogen peroxide to create a foam eruption'],
    ['volcano-model', 'Volcano Model', 'Mix baking soda and vinegar for a fizzy eruption'],
    ['invisible-ink', 'Invisible Ink', 'Write secret messages with lemon juice'],
    ['crystal-growing', 'Crystal Growing', 'Grow beautiful crystals from saturated solutions'],
    ['slime', 'Making Slime', 'Cross-link polymer chains to make a non-Newtonian fluid'],
    ['ph-garden', 'pH Rainbow', 'Test household substances with indicator to make a pH rainbow'],
    ['density-column', 'Density Column', 'Layer liquids of different densities in a glass'],
    ['milk-colours', 'Milk Colour Explosion', 'Add soap to milk with food colouring to see surface tension'],
  ]),
];

const chemBuilder2: SkillNode[] = [
  ...expand('science.chem.reaction-practice', CHEM, 'builder', [ALC],
    ['science.chemistry.reactions', 'science.chem.equations.balancing'],
    'Reaction: {item}', 'Balance and analyse the {item} reaction', [
    ['neutralisation-rxn', 'Neutralisation'], ['combustion-rxn', 'Combustion'],
    ['decomposition-rxn', 'Decomposition'], ['displacement-rxn', 'Displacement'],
    ['precipitation-rxn', 'Precipitation'], ['fermentation-rxn', 'Fermentation'],
    ['rusting-rxn', 'Rusting'], ['photosynthesis-rxn', 'Photosynthesis'],
    ['respiration-rxn', 'Respiration'], ['electrolysis-rxn', 'Electrolysis'],
    ['polymerisation', 'Polymerisation'], ['esterification', 'Esterification'],
  ]),
  ...topic('science.chem.lab-techniques', CHEM, 'builder', [ALC], [
    ['distillation-detail', 'Distillation Detail', ['science.chem.solutions-disc.distillation-intro'], 'Separate liquids by their different boiling points'],
    ['fractional-dist', 'Fractional Distillation', ['distillation-detail'], 'Separate mixtures of liquids with close boiling points'],
    ['paper-chrom', 'Paper Chromatography', ['science.chem.solutions-disc.crystallisation'], 'Separate coloured mixtures by how far they travel on paper'],
    ['recrystallisation', 'Recrystallisation', ['science.chem.solutions-disc.crystallisation'], 'Purify a solid by dissolving and regrowing crystals'],
    ['gravimetric', 'Gravimetric Analysis', ['science.chem.stoichiometry.mass-to-mole'], 'Determine composition by carefully measuring mass'],
    ['drying', 'Drying Agents', ['recrystallisation'], 'Remove water from products using desiccants'],
    ['melting-point', 'Melting Point Determination', ['recrystallisation'], 'Measure melting point to identify and assess purity'],
    ['volumetric-flask', 'Volumetric Techniques', ['science.chem.solutions.molarity'], 'Make solutions of precise concentration using volumetric flasks'],
  ]),
  ...expand('science.chem.material-type', CHEM, 'builder', [ALC, WS],
    ['science.chem.bonding.why-bond'],
    'Material: {item}', 'Investigate the chemistry and bonding of {item}', [
    ['steel-chem', 'Steel'], ['bronze', 'Bronze'], ['brass', 'Brass'],
    ['glass-chem', 'Glass'], ['concrete', 'Concrete'], ['plastic-chem', 'Plastics'],
    ['rubber-chem', 'Rubber'], ['paper-chem', 'Paper'], ['ceramic-chem', 'Ceramics'],
    ['silicon-chem', 'Silicon'], ['diamond-chem', 'Diamond'], ['graphite', 'Graphite'],
  ]),
];

const chemInnovator2: SkillNode[] = [
  ...expand('science.chem.organic-rxn', CHEM, 'innovator', [ALC],
    ['science.chem.organic.alkanes'],
    'Organic Reaction: {item}', 'Study the mechanism and conditions for {item}', [
    ['halogenation', 'Halogenation'], ['hydrogenation', 'Hydrogenation'],
    ['oxidation-org', 'Oxidation'], ['reduction-org', 'Reduction'],
    ['hydrolysis', 'Hydrolysis'], ['dehydration', 'Dehydration'],
    ['polymerisation-org', 'Polymerisation'], ['saponification', 'Saponification'],
    ['nitration', 'Nitration'], ['sulfonation', 'Sulfonation'],
    ['friedel-crafts', 'Friedel-Crafts'], ['diels-alder', 'Diels-Alder'],
  ]),
  ...expand('science.chem.analytical-tech', CHEM, 'innovator', [ALC],
    ['science.chem.spectroscopy.ir'],
    'Analytical: {item}', 'Apply {item} to identify and quantify chemical substances', [
    ['flame-photometry', 'Flame Photometry'], ['colorimetry', 'Colorimetry'],
    ['conductimetry', 'Conductimetry'], ['potentiometry', 'Potentiometry'],
    ['polarimetry', 'Polarimetry'], ['refractometry', 'Refractometry'],
    ['thermal-analysis', 'Thermal Analysis'], ['karl-fischer', 'Karl Fischer Titration'],
  ]),
  ...topic('science.chem.industrial-adv', CHEM, 'innovator', [ALC, WS], [
    ['ammonia-uses', 'Ammonia Uses', ['science.chem.industrial.haber'], 'Convert ammonia into nitric acid, fertilisers, and nylon'],
    ['sulphuric-uses', 'Sulphuric Acid Uses', ['science.chem.industrial.contact'], 'The most-produced industrial chemical used in batteries, fertilisers, and detergents'],
    ['ethanol-production', 'Ethanol Production', ['science.chem.organic.alcohols'], 'Produce ethanol by fermentation or hydration of ethene'],
    ['soap-production', 'Soap Manufacturing', ['science.chem.organic.esters'], 'Saponify fats with alkali to make soap'],
    ['plastic-production', 'Plastic Manufacturing', ['science.chem.polymers.plastics'], 'Polymerise monomers at industrial scale'],
    ['paint-chemistry', 'Paint Chemistry', ['science.chem.polymers.plastics'], 'Formulate pigments, binders, solvents, and additives'],
    ['glass-making', 'Glass Making', ['science.chem.bonding.giant-covalent'], 'Melt silica with soda and lime to create glass'],
    ['paper-making', 'Paper Making', ['science.chem.polymers.natural-polymers'], 'Process cellulose fibres into paper sheets'],
  ]),
];

const chemCreator2: SkillNode[] = [
  ...expand('science.chem.atmos-compound', CHEM, 'creator', [ALC],
    ['science.chem.environ-adv.climate-chem'],
    'Atmospheric: {item}', 'Analyse the atmospheric chemistry of {item}', [
    ['ozone-chem', 'Ozone'], ['methane-atm', 'Methane'], ['nitrous-oxide', 'Nitrous Oxide'],
    ['cfc', 'CFCs'], ['sulfur-dioxide', 'Sulfur Dioxide'], ['nitrogen-oxides', 'Nitrogen Oxides'],
    ['particulate', 'Particulate Matter'], ['volatile-organic', 'Volatile Organic Compounds'],
    ['carbon-monoxide', 'Carbon Monoxide'], ['peroxyacetyl', 'Peroxyacetyl Nitrate'],
  ]),
  ...expand('science.chem.bio-molecule', CHEM, 'creator', [ALC, FOR],
    ['science.chem.biochem.proteins-intro'],
    'Biomolecule: {item}', 'Study the structure and function of {item}', [
    ['haemoglobin', 'Haemoglobin'], ['insulin-mol', 'Insulin'], ['collagen', 'Collagen'],
    ['keratin', 'Keratin'], ['actin', 'Actin'], ['myosin', 'Myosin'],
    ['chlorophyll-mol', 'Chlorophyll'], ['atp', 'ATP'],
    ['nad', 'NAD+'], ['coenzyme-a', 'Coenzyme A'],
  ]),
];

// ---- Biology supplementary (~250 skills) ----

const bioDiscovery2: SkillNode[] = [
  ...expand('science.bio.plant-type', BIO, 'discovery', [FOR],
    ['science.bio.classification.plant-kingdom'],
    'Plant Type: {item}', 'Study the features and habitat of {item}', [
    ['fern', 'Ferns'], ['moss', 'Mosses'], ['conifer', 'Conifers'],
    ['grass', 'Grasses'], ['wildflower', 'Wildflowers'], ['succulent', 'Succulents'],
    ['vine', 'Vines'], ['shrub', 'Shrubs'], ['aquatic-plant', 'Aquatic Plants'],
    ['carnivorous', 'Carnivorous Plants'], ['orchid', 'Orchids'], ['cactus', 'Cacti'],
  ]),
  ...expand('science.bio.insect-type', BIO, 'discovery', [FOR],
    ['science.bio.animals.insects'],
    'Insect: {item}', 'Study the life cycle and adaptations of {item}', [
    ['ant', 'Ants'], ['bee', 'Bees'], ['butterfly-type', 'Butterflies'],
    ['dragonfly', 'Dragonflies'], ['grasshopper', 'Grasshoppers'], ['ladybird', 'Ladybirds'],
    ['mosquito', 'Mosquitoes'], ['beetle-type', 'Beetles'], ['moth', 'Moths'],
    ['termite', 'Termites'], ['firefly', 'Fireflies'], ['cricket', 'Crickets'],
  ]),
  ...topic('science.bio.seasons-life', BIO, 'discovery', [FOR], [
    ['spring-life', 'Life in Spring', ['science.bio.life-cycles.seasons-life'], 'New growth, nesting, and babies in spring'],
    ['summer-life', 'Life in Summer', ['science.bio.life-cycles.seasons-life'], 'Active feeding, growing, and reproduction in summer'],
    ['autumn-life', 'Life in Autumn', ['science.bio.life-cycles.seasons-life'], 'Preparing for winter: food storage and migration'],
    ['winter-life', 'Life in Winter', ['science.bio.life-cycles.seasons-life'], 'Hibernation, dormancy, and survival strategies'],
    ['seed-seasons', 'Seeds Through Seasons', ['science.bio.plants.seeds'], 'How seeds wait for the right season to sprout'],
    ['bird-seasons', 'Birds Through Seasons', ['science.bio.animal-class.vertebrates'], 'Migration, nesting, and moulting with the seasons'],
  ]),
];

const bioBuilder2: SkillNode[] = [
  ...expand('science.bio.body-organ', BIO, 'builder', [WS],
    ['science.bio.body-systems.overview'],
    'Organ: {item}', 'Study the structure and function of the {item}', [
    ['brain-organ', 'Brain'], ['heart-organ', 'Heart'], ['lungs-organ', 'Lungs'],
    ['liver-organ', 'Liver'], ['kidneys', 'Kidneys'], ['stomach-organ', 'Stomach'],
    ['intestines', 'Intestines'], ['skin-organ', 'Skin'], ['eyes-organ', 'Eyes'],
    ['ears-organ', 'Ears'], ['pancreas-organ', 'Pancreas'], ['spleen', 'Spleen'],
    ['bladder', 'Bladder'], ['thyroid-organ', 'Thyroid'], ['bone-marrow', 'Bone Marrow'],
  ]),
  ...expand('science.bio.nutrient', BIO, 'builder', [FOR],
    ['science.bio.health.nutrients'],
    'Nutrient: {item}', 'Understand the role of {item} in the body', [
    ['carbohydrate-nut', 'Carbohydrates'], ['protein-nut', 'Proteins'],
    ['fat-nut', 'Fats'], ['vitamin-a', 'Vitamin A'], ['vitamin-c', 'Vitamin C'],
    ['vitamin-d', 'Vitamin D'], ['calcium-nut', 'Calcium'], ['iron-nut', 'Iron'],
    ['fibre', 'Dietary Fibre'], ['water-nut', 'Water'],
    ['potassium-nut', 'Potassium'], ['zinc-nut', 'Zinc'],
  ]),
  ...topic('science.bio.ecology-field', BIO, 'builder', [FOR, REEF], [
    ['quadrat', 'Quadrat Sampling', ['science.bio.ecology.sampling'], 'Randomly place quadrats to estimate plant population density'],
    ['transect', 'Belt Transect', ['quadrat'], 'Sample along a line to measure how species change across a habitat'],
    ['mark-recapture', 'Mark-Recapture', ['science.bio.ecology.sampling', 'math.multiplication'], 'Estimate mobile animal populations by marking and recounting'],
    ['pitfall', 'Pitfall Traps', ['mark-recapture'], 'Catch ground-dwelling invertebrates for counting'],
    ['sweep-net', 'Sweep Netting', ['mark-recapture'], 'Collect flying insects from vegetation for identification'],
    ['kick-sampling', 'Kick Sampling', ['mark-recapture'], 'Disturb stream beds to collect aquatic invertebrates'],
    ['species-richness', 'Species Richness', ['quadrat', 'transect'], 'Count the number of different species in an area'],
    ['simpson', 'Simpson Diversity Index', ['species-richness', 'math.statistics.descriptive'], 'Calculate biodiversity using a quantitative index'],
  ]),
];

const bioInnovator2: SkillNode[] = [
  ...expand('science.bio.technique', BIO, 'innovator', [WS],
    ['science.bio.biotech.pcr', 'science.bio.biotech.gel-electrophoresis'],
    'Technique: {item}', 'Master the {item} molecular biology technique', [
    ['western-blot', 'Western Blot'], ['southern-blot', 'Southern Blot'],
    ['northern-blot', 'Northern Blot'], ['cell-culture', 'Cell Culture'],
    ['transfection', 'Transfection'], ['flow-cytometry', 'Flow Cytometry'],
    ['immunohistochem', 'Immunohistochemistry'], ['in-situ-hybrid', 'In Situ Hybridisation'],
    ['microarray', 'Microarrays'], ['rt-pcr', 'RT-PCR'],
    ['confocal', 'Confocal Microscopy'], ['crispr-lab', 'CRISPR Editing Lab'],
  ]),
  ...expand('science.bio.disease-type', BIO, 'innovator', [WS, FOR],
    ['science.bio.disease.pathogens'],
    'Disease: {item}', 'Study the cause, transmission, and treatment of {item}', [
    ['malaria', 'Malaria'], ['tuberculosis', 'Tuberculosis'],
    ['influenza', 'Influenza'], ['cholera', 'Cholera'],
    ['ebola', 'Ebola'], ['hiv-disease', 'HIV/AIDS'],
    ['covid', 'COVID-19'], ['measles', 'Measles'],
    ['dengue', 'Dengue'], ['rabies', 'Rabies'],
    ['lyme', 'Lyme Disease'], ['zika', 'Zika'],
  ]),
  ...topic('science.bio.ecology-human', BIO, 'innovator', [FOR], [
    ['deforestation', 'Deforestation', ['science.bio.ecology-adv.ecosystem-services'], 'Clearing forests destroys habitats and releases stored carbon'],
    ['desertification', 'Desertification', ['deforestation'], 'Overgrazing and drought turn fertile land into desert'],
    ['eutrophication', 'Eutrophication', ['science.bio.ecology.nitrogen-cycle'], 'Excess nutrients cause algal blooms that suffocate aquatic life'],
    ['bioaccumulation', 'Bioaccumulation', ['science.bio.food-chain.trophic'], 'Toxins concentrate at higher levels of the food chain'],
    ['habitat-fragmentation', 'Habitat Fragmentation', ['science.bio.ecology-adv.conservation-strategies'], 'Breaking habitats into smaller pieces isolates populations'],
    ['sustainable-dev', 'Sustainable Development', ['science.bio.ecology-adv.ecosystem-services'], 'Meeting human needs without compromising future generations'],
    ['ecological-footprint', 'Ecological Footprint', ['sustainable-dev', 'math.multiplication'], 'Calculate the resources needed to support a lifestyle'],
    ['carbon-footprint', 'Carbon Footprint', ['ecological-footprint'], 'Calculate total greenhouse gas emissions from activities'],
  ]),
  ...expand('science.bio.body-system-detail', BIO, 'innovator', [WS],
    ['science.bio.body-systems.overview'],
    'System Detail: {item}', 'Study the advanced physiology of the {item}', [
    ['lymphatic', 'Lymphatic System'], ['urinary', 'Urinary System'],
    ['reproductive-detail', 'Reproductive System Detail'], ['integumentary-detail', 'Integumentary System'],
    ['immune-detail', 'Immune System Detail'], ['endocrine-detail', 'Endocrine System Detail'],
    ['skeletal-detail', 'Skeletal System Detail'], ['muscular-detail', 'Muscular System Detail'],
    ['cardiovascular', 'Cardiovascular System'], ['digestive-detail', 'Digestive System Detail'],
  ]),
];

const bioCreator2: SkillNode[] = [
  ...expand('science.bio.omics', BIO, 'creator', [WS],
    ['science.bio.genomics.genome'],
    'Omics: {item}', 'Apply {item} approaches to study biological systems holistically', [
    ['epigenomics', 'Epigenomics'], ['interactomics', 'Interactomics'],
    ['lipidomics', 'Lipidomics'], ['glycomics', 'Glycomics'],
    ['phenomics', 'Phenomics'], ['nutrigenomics', 'Nutrigenomics'],
    ['pharmacoproteomics', 'Pharmacoproteomics'], ['exposomics', 'Exposomics'],
    ['immunogenomics', 'Immunogenomics'], ['radiomics', 'Radiomics'],
  ]),
  ...expand('science.bio.model-organism', BIO, 'creator', [WS, FOR],
    ['science.bio.molecular.central-dogma'],
    'Model Organism: {item}', 'Study how {item} is used in biological research', [
    ['e-coli', 'E. coli'], ['yeast-model', 'Yeast'], ['c-elegans', 'C. elegans'],
    ['drosophila', 'Drosophila'], ['zebrafish', 'Zebrafish'], ['mouse-model', 'Mouse'],
    ['arabidopsis', 'Arabidopsis'], ['xenopus', 'Xenopus'],
  ]),
  ...topic('science.bio.one-health', BIO, 'creator', [FOR, WS], [
    ['concept', 'One Health Concept', ['science.bio.virology.emerging', 'science.bio.ecology-adv.climate-ecology'], 'Human, animal, and environmental health are interconnected'],
    ['zoonotic', 'Zoonotic Diseases', ['concept'], 'Diseases that jump from animals to humans'],
    ['antimicrobial-resist', 'Antimicrobial Resistance', ['science.bio.disease.resistance'], 'A global threat as microbes evolve to resist our drugs'],
    ['food-safety', 'Food Safety Science', ['concept'], 'Prevent contamination and disease in the food supply'],
    ['vector-control', 'Vector Control', ['zoonotic'], 'Manage mosquitoes, ticks, and other disease carriers'],
    ['surveillance', 'Disease Surveillance', ['concept', 'math.statistics.descriptive'], 'Monitor and track disease outbreaks globally'],
    ['pandemic-preparedness', 'Pandemic Preparedness', ['surveillance'], 'Plan for and respond to emerging infectious disease threats'],
    ['environmental-health', 'Environmental Health', ['concept'], 'Study how environmental conditions affect human and animal health'],
  ]),
];

// ---- Earth Science supplementary (~90 skills) ----

const earthDiscovery2: SkillNode[] = [
  ...expand('science.earth.weather-type', EARTH, 'discovery', [OBS],
    ['science.earth.atmosphere.weather-forecast'],
    'Weather: {item}', 'Observe and explain the science behind {item}', [
    ['hail', 'Hail'], ['fog', 'Fog'], ['dew', 'Dew'], ['frost', 'Frost'],
    ['blizzard', 'Blizzards'], ['drought-weather', 'Drought'], ['heat-wave', 'Heat Waves'],
    ['rainbow-weather', 'Rainbows'], ['thunder-weather', 'Thunderstorms'],
    ['sleet-weather', 'Sleet'],
  ]),
  ...expand('science.earth.cloud-type', EARTH, 'discovery', [OBS],
    ['science.earth.atmosphere.clouds'],
    'Cloud: {item}', 'Identify and describe {item} clouds', [
    ['cumulus', 'Cumulus'], ['stratus', 'Stratus'], ['cirrus', 'Cirrus'],
    ['cumulonimbus', 'Cumulonimbus'], ['nimbostratus', 'Nimbostratus'],
    ['altocumulus', 'Altocumulus'], ['altostratus', 'Altostratus'],
    ['stratocumulus', 'Stratocumulus'],
  ]),
  ...topic('science.earth.map-skills', EARTH, 'discovery', [OBS, RUI], [
    ['map-types', 'Types of Maps', ['science.earth.maps.flat-map'], 'Physical, political, topographic, and weather maps'],
    ['satellite-img', 'Satellite Images', ['map-types'], 'View Earth from space to understand geography'],
    ['aerial-photo', 'Aerial Photographs', ['satellite-img'], 'Study landscapes from above'],
    ['map-making', 'Making Maps', ['science.earth.maps.map-key', 'science.recording'], 'Draw a map of your school or neighbourhood'],
    ['distance-calc', 'Calculating Distance', ['science.earth.maps.scale', 'math.multiplication'], 'Use the map scale to find real-world distances'],
    ['direction-map', 'Giving Directions', ['science.earth.maps.compass-rose'], 'Use compass directions to guide someone on a map'],
  ]),
];

const earthBuilder2: SkillNode[] = [
  ...expand('science.earth.mineral-type', EARTH, 'builder', [CAV],
    ['science.earth.minerals.identification'],
    'Mineral: {item}', 'Identify and describe the properties of {item}', [
    ['quartz', 'Quartz'], ['feldspar', 'Feldspar'], ['mica', 'Mica'],
    ['calcite', 'Calcite'], ['halite', 'Halite'], ['gypsum', 'Gypsum'],
    ['magnetite', 'Magnetite'], ['pyrite', 'Pyrite'], ['fluorite', 'Fluorite'],
    ['talc', 'Talc'], ['topaz', 'Topaz'], ['corundum', 'Corundum'],
  ]),
  ...expand('science.earth.climate-zone', EARTH, 'builder', [OBS],
    ['science.earth.climate.climate-zones'],
    'Climate Zone: {item}', 'Analyse the characteristics and challenges of {item} climate', [
    ['tropical-wet', 'Tropical Wet'], ['tropical-dry', 'Tropical Dry'],
    ['arid', 'Arid'], ['semiarid', 'Semiarid'],
    ['mediterranean', 'Mediterranean'], ['humid-subtropical', 'Humid Subtropical'],
    ['oceanic', 'Oceanic'], ['continental', 'Continental'],
    ['subarctic', 'Subarctic'], ['polar-zone', 'Polar'],
  ]),
  ...topic('science.earth.resources-adv', EARTH, 'builder', [CAV, WS], [
    ['coal', 'Coal', ['science.earth.resources.fossil-fuels'], 'A sedimentary rock formed from compressed ancient plants'],
    ['petroleum-res', 'Petroleum', ['science.earth.resources.fossil-fuels'], 'Liquid fossil fuel formed from ancient marine organisms'],
    ['natural-gas', 'Natural Gas', ['science.earth.resources.fossil-fuels'], 'A gaseous fossil fuel often found with petroleum'],
    ['uranium', 'Uranium', ['science.earth.resources.non-renewable'], 'A radioactive element used as nuclear fuel'],
    ['lithium', 'Lithium', ['science.earth.resources.non-renewable'], 'A light metal essential for rechargeable batteries'],
    ['rare-earth', 'Rare Earth Elements', ['science.earth.resources.non-renewable'], 'Scarce metals crucial for electronics and green technology'],
    ['sand-gravel', 'Sand and Gravel', ['science.earth.resources.non-renewable'], 'The most mined materials by volume, used in construction'],
    ['fresh-water-res', 'Fresh Water', ['science.earth.resources.water-resource'], 'Only 3 percent of Earth water is fresh, and most is frozen'],
  ]),
];

const earthInnovator2: SkillNode[] = [
  ...expand('science.earth.astro-object', EARTH, 'innovator', [OBS],
    ['science.earth.astronomy.solar-system'],
    'Solar System: {item}', 'Study the characteristics and exploration of {item}', [
    ['mercury', 'Mercury'], ['venus-planet', 'Venus'], ['mars-planet', 'Mars'],
    ['jupiter', 'Jupiter'], ['saturn', 'Saturn'], ['uranus', 'Uranus'],
    ['neptune', 'Neptune'], ['pluto', 'Pluto'], ['asteroid-belt', 'Asteroid Belt'],
    ['kuiper', 'Kuiper Belt'], ['oort', 'Oort Cloud'], ['earths-moon', 'The Moon'],
  ]),
  ...topic('science.earth.natural-hazard', EARTH, 'innovator', [CAV, OBS], [
    ['risk-assessment', 'Risk Assessment', ['science.earth.disasters.preparedness', 'math.probability.basic'], 'Calculate the probability and impact of natural hazards'],
    ['vulnerability', 'Vulnerability', ['risk-assessment'], 'Factors that make communities more susceptible to disaster'],
    ['resilience', 'Community Resilience', ['vulnerability'], 'Building capacity to recover from natural disasters'],
    ['early-warning', 'Early Warning Systems', ['science.earth.disasters.warning-systems'], 'Technology and communication for timely hazard alerts'],
    ['insurance', 'Hazard Insurance', ['risk-assessment'], 'Financial protection against natural disaster losses'],
    ['land-use', 'Land Use Planning', ['vulnerability'], 'Build in safe locations to reduce disaster risk'],
  ]),
];

// ---- Additional depth: Physics discovery experiments (10) ----
const physicsDiscovery3: SkillNode[] = [
  ...expand('science.physics.measure-skill', PHYS, 'discovery', [WS],
    ['science.measurement', 'math.arithmetic'],
    'Measuring {item}', 'Measure {item} accurately and record results', [
    ['length', 'Length'], ['mass', 'Mass'], ['volume', 'Volume'],
    ['time', 'Time'], ['temperature-meas', 'Temperature'], ['force-meas', 'Force'],
    ['speed-meas', 'Speed'], ['area', 'Area'], ['capacity', 'Capacity'],
    ['weight-meas', 'Weight'],
  ]),
];

// ---- Additional depth: Physics builder applications (20) ----
const physicsBuilder3: SkillNode[] = [
  ...expand('science.physics.machine-app', PHYS, 'builder', [WS],
    ['science.physics.work-energy.efficiency'],
    'Machine: {item}', 'Analyse the physics of {item}', [
    ['bicycle', 'Bicycles'], ['car', 'Cars'], ['crane', 'Cranes'],
    ['escalator', 'Escalators'], ['elevator', 'Elevators'], ['sewing-machine', 'Sewing Machines'],
    ['clock', 'Clocks'], ['washing-machine', 'Washing Machines'],
    ['fan', 'Electric Fans'], ['blender', 'Blenders'],
  ]),
  ...expand('science.physics.sport-phys', PHYS, 'builder', [WS],
    ['science.physics.newton.fma', 'science.physics.work-energy.ke-formula'],
    'Sport Physics: {item}', 'Analyse the physics of {item}', [
    ['baseball', 'Baseball'], ['soccer', 'Football'], ['swimming-phys', 'Swimming'],
    ['cycling', 'Cycling'], ['archery', 'Archery'], ['gymnastics', 'Gymnastics'],
    ['skating', 'Ice Skating'], ['skiing', 'Skiing'], ['basketball', 'Basketball'],
    ['golf', 'Golf'],
  ]),
];

// ---- Additional depth: Chemistry builder common reactions (10) ----
const chemBuilder3: SkillNode[] = [
  ...expand('science.chem.everyday-chem', CHEM, 'builder', [ALC],
    ['science.chemistry.reactions'],
    'Everyday Chemistry: {item}', 'Explain the chemistry behind {item}', [
    ['cleaning', 'Cleaning Products'], ['cosmetics', 'Cosmetics'],
    ['batteries-everyday', 'Batteries'], ['dyes', 'Dyes and Pigments'],
    ['adhesives', 'Adhesives'], ['sunscreen', 'Sunscreen'],
    ['photography-chem', 'Photography'], ['fireworks', 'Fireworks'],
    ['matches', 'Matches'], ['detergent', 'Detergent'],
  ]),
];

// ---- Additional depth: Chemistry innovator applications (12) ----
const chemInnovator3: SkillNode[] = [
  ...expand('science.chem.element-adv', CHEM, 'innovator', [ALC],
    ['science.chem.periodic.trends', 'science.chem.atomic.electron-config'],
    'Element Chemistry: {item}', 'Study the detailed chemistry and applications of {item}', [
    ['lithium-chem', 'Lithium'], ['boron', 'Boron'], ['fluorine', 'Fluorine'],
    ['phosphorus', 'Phosphorus'], ['sulfur', 'Sulfur'], ['titanium', 'Titanium'],
    ['chromium', 'Chromium'], ['manganese', 'Manganese'], ['cobalt', 'Cobalt'],
    ['nickel-chem', 'Nickel'], ['zinc-chem', 'Zinc'], ['platinum', 'Platinum'],
  ]),
];

// ---- Additional depth: Biology discovery body exploration (10) ----
const bioDiscovery3: SkillNode[] = [
  ...expand('science.bio.body-explore', BIO, 'discovery', [FOR, WS],
    ['science.bio.body-systems.overview'],
    'Body Exploration: {item}', 'Discover how the {item} works inside your body', [
    ['blood-explore', 'Blood'], ['bones-explore', 'Bones'], ['muscles-explore', 'Muscles'],
    ['brain-explore', 'Brain'], ['lungs-explore', 'Lungs'], ['heart-explore', 'Heart'],
    ['stomach-explore', 'Stomach'], ['skin-explore', 'Skin'], ['eyes-explore', 'Eyes'],
    ['teeth-explore', 'Teeth'],
  ]),
];

// ---- Additional depth: Biology builder genetics practice (12) ----
const bioBuilder3: SkillNode[] = [
  ...expand('science.bio.trait-genetics', BIO, 'builder', [FOR, WS],
    ['science.bio.genetics.punnett'],
    'Genetic Trait: {item}', 'Predict inheritance patterns for {item} using Punnett squares', [
    ['eye-colour', 'Eye Colour'], ['hair-colour', 'Hair Colour'],
    ['blood-type', 'Blood Type'], ['tongue-rolling', 'Tongue Rolling'],
    ['earlobe', 'Earlobe Attachment'], ['handedness', 'Handedness'],
    ['dimples', 'Dimples'], ['freckles', 'Freckles'],
    ['widows-peak', 'Widow Peak'], ['pea-genetics', 'Pea Plant Traits'],
    ['flower-colour', 'Flower Colour'], ['seed-shape', 'Seed Shape'],
  ]),
];

// ---- Additional depth: Biology innovator ecosystem expand (10) ----
const bioInnovator3: SkillNode[] = [
  ...expand('science.bio.food-web-eco', BIO, 'innovator', [FOR, REEF],
    ['science.bio.ecology-adv.trophic-cascade'],
    'Ecosystem Study: {item}', 'Analyse the food web and ecology of {item}', [
    ['savanna-eco', 'African Savanna'], ['amazon-eco', 'Amazon Rainforest'],
    ['great-reef-eco', 'Great Barrier Reef'], ['arctic-eco', 'Arctic Tundra'],
    ['deep-ocean-eco', 'Deep Ocean Vents'], ['temperate-wood', 'Temperate Woodland'],
    ['desert-eco', 'Sonoran Desert'], ['boreal-eco', 'Boreal Forest'],
    ['estuary-eco', 'Chesapeake Bay'], ['alpine-eco', 'Alpine Meadows'],
  ]),
];

// ---- Additional depth: Biology creator applied biology (12) ----
const bioCreator3: SkillNode[] = [
  ...expand('science.bio.applied', BIO, 'creator', [WS, FOR],
    ['science.bio.biotech.agriculture-biotech'],
    'Applied Biology: {item}', 'Apply biological science to solve problems in {item}', [
    ['aquaculture', 'Aquaculture'], ['forestry', 'Forestry'],
    ['wildlife-mgmt', 'Wildlife Management'], ['pest-control', 'Pest Control'],
    ['soil-biology', 'Soil Biology'], ['crop-science', 'Crop Science'],
    ['animal-husbandry', 'Animal Husbandry'], ['fisheries', 'Fisheries'],
    ['restoration-ecology', 'Restoration Ecology'], ['agroecology', 'Agroecology'],
    ['ethnobotany', 'Ethnobotany'], ['marine-conservation', 'Marine Conservation'],
  ]),
];

// ---- Additional depth: Earth discovery nature observation (10) ----
const earthDiscovery3: SkillNode[] = [
  ...expand('science.earth.nature-obs', EARTH, 'discovery', [FOR, CAV],
    ['science.earth.rocks.rocks', 'science.observation'],
    'Nature Observation: {item}', 'Observe and describe {item} in the natural world', [
    ['river-features', 'River Features'], ['beach-features', 'Beach Features'],
    ['cliff-features', 'Cliff Features'], ['cave-features', 'Cave Features'],
    ['waterfall-obs', 'Waterfalls'], ['glacier-obs', 'Glaciers'],
    ['dune-obs', 'Sand Dunes'], ['tide-pool', 'Tide Pools'],
    ['hot-spring', 'Hot Springs'], ['volcanic-spring', 'Volcanic Features'],
  ]),
];

// ---- Additional depth: Earth builder soil and resources (10) ----
const earthBuilder3: SkillNode[] = [
  ...expand('science.earth.energy-tech', EARTH, 'builder', [WS, OBS],
    ['science.earth.resources.conservation-res'],
    'Energy Technology: {item}', 'Evaluate the science and sustainability of {item}', [
    ['solar-panel', 'Solar Panels'], ['wind-farm', 'Wind Farms'],
    ['hydroelectric-dam', 'Hydroelectric Dams'], ['geothermal-plant', 'Geothermal Plants'],
    ['tidal-barrage', 'Tidal Barrages'], ['biomass-plant', 'Biomass Plants'],
    ['nuclear-plant', 'Nuclear Plants'], ['wave-generator', 'Wave Generators'],
    ['hydrogen-fuel', 'Hydrogen Fuel'], ['battery-storage', 'Battery Storage'],
  ]),
];

// ---- Additional depth: Earth creator planetary detail (10) ----
const earthCreator2: SkillNode[] = [
  ...expand('science.earth.space-tech', EARTH, 'creator', [OBS],
    ['science.earth.space-exploration.orbital-mechanics'],
    'Space Technology: {item}', 'Study the engineering and science behind {item}', [
    ['rocket-propulsion', 'Rocket Propulsion'], ['satellite-tech', 'Satellite Technology'],
    ['space-station', 'Space Stations'], ['space-suit', 'Space Suits'],
    ['rover-tech', 'Rover Technology'], ['space-telescope-tech', 'Space Telescopes'],
    ['ion-drive', 'Ion Drives'], ['solar-sail', 'Solar Sails'],
    ['life-support', 'Life Support Systems'], ['re-entry', 'Atmospheric Re-Entry'],
  ]),
];


// ---- Final depth: Physics innovator mathematical applications (10) ----
const physicsInnovator3: SkillNode[] = [
  ...expand('science.physics.constant', PHYS, 'innovator', [WS],
    ['science.physics.newton.fma', 'math.equations'],
    'Constant: {item}', 'Use the physical constant {item} in calculations', [
    ['g-accel', 'g (9.81 m/s^2)'], ['speed-light', 'c (Speed of Light)'],
    ['planck-const', 'h (Planck Constant)'], ['boltzmann-const', 'k (Boltzmann Constant)'],
    ['avogadro-const', 'Na (Avogadro Number)'], ['gas-constant', 'R (Gas Constant)'],
    ['coulomb-const', 'ke (Coulomb Constant)'], ['permittivity', 'Permittivity of Free Space'],
    ['permeability', 'Permeability of Free Space'], ['stefan-boltzmann', 'Stefan-Boltzmann Constant'],
  ]),
];

// ---- Final depth: Physics creator advanced topics (12) ----
const physicsCreator3: SkillNode[] = [
  ...expand('science.physics.nobel', PHYS, 'creator', [WS, OBS],
    ['science.physics.quantum.schrodinger'],
    'Nobel Topic: {item}', 'Study the Nobel Prize-winning physics of {item}', [
    ['photoelectric-nobel', 'Photoelectric Effect'], ['brownian', 'Brownian Motion'],
    ['superconductivity-nobel', 'Superconductivity'], ['transistor', 'The Transistor'],
    ['laser-nobel', 'The Laser'], ['quark-model', 'Quark Model'],
    ['cmb-discovery', 'CMB Discovery'], ['higgs-discovery', 'Higgs Boson Discovery'],
    ['grav-wave-discover', 'Gravitational Wave Detection'], ['quantum-entangle-nobel', 'Quantum Entanglement'],
    ['led-nobel', 'Blue LEDs'], ['exoplanet-discovery', 'Exoplanet Discovery'],
  ]),
];

// ---- Final depth: Chemistry discovery kitchen chemistry (10) ----
const chemDiscovery3: SkillNode[] = [
  ...expand('science.chem.kitchen', CHEM, 'discovery', [ALC],
    ['science.chem.changes.chemical', 'science.chem.cooking.food-changes'],
    'Kitchen Chemistry: {item}', 'Investigate the chemistry of {item} in the kitchen', [
    ['bread-rising', 'Bread Rising'], ['butter-making', 'Butter Making'],
    ['cheese-making', 'Cheese Making'], ['jam-setting', 'Jam Setting'],
    ['candy-making', 'Candy Making'], ['pickle-making', 'Pickling'],
    ['yoghurt-making', 'Yoghurt Making'], ['chocolate', 'Chocolate Tempering'],
    ['caramelisation', 'Caramelisation'], ['emulsions', 'Emulsions'],
  ]),
];

// ---- Final depth: Chemistry creator advanced applications (12) ----
const chemCreator3: SkillNode[] = [
  ...expand('science.chem.frontier-chem', CHEM, 'creator', [ALC],
    ['science.chem.quantum-chem.computational-chem'],
    'Frontier Chemistry: {item}', 'Explore cutting-edge research in {item}', [
    ['click-chemistry', 'Click Chemistry'], ['flow-chem-adv', 'Continuous Flow Chemistry'],
    ['mechanochemistry', 'Mechanochemistry'], ['photocatalytic', 'Photocatalytic Water Splitting'],
    ['co2-capture', 'CO2 Conversion'], ['artificial-enzyme', 'Artificial Enzymes'],
    ['molecular-switch', 'Molecular Switches'], ['porous-materials', 'Porous Materials'],
    ['battery-chem', 'Next-Generation Batteries'], ['biodegradable', 'Biodegradable Polymers'],
    ['chemical-robotics', 'Chemical Robotics'], ['origin-life-chem', 'Origin of Life Chemistry'],
  ]),
];

// ---- Final depth: Biology foundation nature walk (8) ----
const bioFoundation2: SkillNode[] = [
  ...expand('science.bio.nature-find', BIO, 'foundation', [FOR],
    ['science.observation', 'science.living-things'],
    'Nature Find: {item}', 'Find and observe {item} on a nature walk', [
    ['leaf-shapes', 'Leaf Shapes'], ['bark-textures', 'Bark Textures'],
    ['flower-colours', 'Flower Colours'], ['bird-songs', 'Bird Songs'],
    ['spider-webs', 'Spider Webs'], ['rock-collect', 'Rock Collection'],
    ['cloud-watch', 'Cloud Watching'], ['puddle-life', 'Puddle Life'],
  ]),
];

// ---- Final depth: Biology discovery garden science (8) ----
const bioDiscovery4: SkillNode[] = [
  ...expand('science.bio.garden', BIO, 'discovery', [FOR],
    ['science.bio.plant-anatomy.germination', 'science.bio.habitats.garden'],
    'Garden Science: {item}', 'Grow and observe {item} in a garden experiment', [
    ['sunflower', 'Sunflowers'], ['bean-growth', 'Bean Plants'],
    ['herb-garden', 'Herb Garden'], ['compost', 'Composting'],
    ['worm-farm', 'Worm Farm'], ['bird-feeder', 'Bird Feeders'],
    ['butterfly-garden', 'Butterfly Garden'], ['pond-life-garden', 'Pond Life'],
  ]),
];

// ---- Final depth: Biology builder human health (10) ----
const bioBuilder4: SkillNode[] = [
  ...expand('science.bio.health-topic', BIO, 'builder', [WS],
    ['science.bio.health.balanced-diet', 'science.bio.disease.lifestyle'],
    'Health Topic: {item}', 'Understand the biology behind {item}', [
    ['heart-health', 'Heart Health'], ['bone-health', 'Bone Health'],
    ['mental-wellbeing', 'Mental Wellbeing'], ['respiratory-health', 'Respiratory Health'],
    ['digestive-health', 'Digestive Health'], ['immune-health', 'Immune Health'],
    ['eye-health', 'Eye Health'], ['dental-health-bio', 'Dental Health'],
    ['skin-health', 'Skin Health'], ['hearing-health', 'Hearing Health'],
  ]),
];

// ---- Final depth: Biology creator conservation case studies (10) ----
const bioCreator4: SkillNode[] = [
  ...expand('science.bio.conservation-case', BIO, 'creator', [FOR, REEF],
    ['science.bio.conservation-adv.in-situ'],
    'Case Study: {item}', 'Analyse the conservation challenges and solutions for {item}', [
    ['giant-panda', 'Giant Panda'], ['mountain-gorilla', 'Mountain Gorilla'],
    ['coral-reef-cons', 'Coral Reef Conservation'], ['amazon-defores', 'Amazon Deforestation'],
    ['wolf-reintro', 'Wolf Reintroduction'], ['whale-conservation', 'Whale Conservation'],
    ['sea-turtle-cons', 'Sea Turtle Conservation'], ['orangutan', 'Orangutan Conservation'],
    ['ivory-trade', 'Ivory Trade'], ['seed-bank', 'Global Seed Vault'],
  ]),
];

// ---- Final depth: Earth science foundation earth materials (8) ----
const earthFoundation2: SkillNode[] = [
  ...expand('science.earth.material', EARTH, 'foundation', [CAV],
    ['science.earth.rocks.rocks', 'science.sorting'],
    'Earth Material: {item}', 'Find and describe {item} in the world around you', [
    ['gravel', 'Gravel'], ['mud', 'Mud'], ['chalk-mat', 'Chalk'],
    ['slate-mat', 'Slate'], ['marble-mat', 'Marble'], ['granite-mat', 'Granite'],
    ['limestone-mat', 'Limestone'], ['sandstone-mat', 'Sandstone'],
  ]),
];

// ---- Final depth: Earth innovator space science (10) ----
const earthInnovator3: SkillNode[] = [
  ...expand('science.earth.constellation', EARTH, 'innovator', [OBS],
    ['science.earth.astronomy.star-types'],
    'Constellation: {item}', 'Locate and learn the mythology of {item}', [
    ['orion', 'Orion'], ['ursa-major', 'Ursa Major'],
    ['cassiopeia', 'Cassiopeia'], ['scorpius', 'Scorpius'],
    ['leo', 'Leo'], ['cygnus', 'Cygnus'],
    ['southern-cross', 'Southern Cross'], ['andromeda-const', 'Andromeda'],
    ['taurus', 'Taurus'], ['gemini', 'Gemini'],
  ]),
];

// ---- Final depth: Earth creator earth systems (10) ----
const earthCreator3: SkillNode[] = [
  ...expand('science.earth.earth-system', EARTH, 'creator', [OBS, CAV],
    ['science.earth.climate-model.earth-system'],
    'Earth System: {item}', 'Model the interactions and feedbacks of {item}', [
    ['atmosphere-sys', 'Atmosphere'], ['hydrosphere', 'Hydrosphere'],
    ['lithosphere-sys', 'Lithosphere'], ['biosphere', 'Biosphere'],
    ['cryosphere', 'Cryosphere'], ['pedosphere', 'Pedosphere'],
    ['magnetosphere-sys', 'Magnetosphere'], ['carbon-sys', 'Carbon System'],
    ['nitrogen-sys', 'Nitrogen System'], ['phosphorus-sys', 'Phosphorus System'],
  ]),
];

// ===========================================================================
// COMBINED EXPORT
// ===========================================================================



// ===========================================================================
// COMBINED EXPORT
// ===========================================================================

export const sciencesSkills: SkillNode[] = [
  ...physicsFoundation, ...physicsDiscovery, ...physicsDiscovery2, ...physicsDiscovery3,
  ...physicsBuilder, ...physicsBuilder2, ...physicsBuilder3,
  ...physicsInnovator, ...physicsInnovator2, ...physicsInnovator3,
  ...physicsCreator, ...physicsCreator2, ...physicsCreator3,
  ...chemFoundation, ...chemDiscovery, ...chemDiscovery2, ...chemDiscovery3,
  ...chemBuilder, ...chemBuilder2, ...chemBuilder3,
  ...chemInnovator, ...chemInnovator2, ...chemInnovator3,
  ...chemCreator, ...chemCreator2, ...chemCreator3,
  ...bioFoundation, ...bioFoundation2, ...bioDiscovery, ...bioDiscovery2, ...bioDiscovery3, ...bioDiscovery4,
  ...bioBuilder, ...bioBuilder2, ...bioBuilder3, ...bioBuilder4,
  ...bioInnovator, ...bioInnovator2, ...bioInnovator3,
  ...bioCreator, ...bioCreator2, ...bioCreator3, ...bioCreator4,
  ...earthFoundation, ...earthFoundation2, ...earthDiscovery, ...earthDiscovery2, ...earthDiscovery3,
  ...earthBuilder, ...earthBuilder2, ...earthBuilder3,
  ...earthInnovator, ...earthInnovator2, ...earthInnovator3,
  ...earthCreator, ...earthCreator2, ...earthCreator3,
];
