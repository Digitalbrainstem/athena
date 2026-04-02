// 50+ quest templates covering all 23 mechanics across multiple tiers
// Templates use variable placeholders: {playerName}, {companionName}, {biome}, {skill}
// Every template has full accessibility fields.

import type { QuestTemplate } from '../types/procedural.js';

export const QUEST_TEMPLATES: readonly QuestTemplate[] = [
  // ─── BUILD (construction, engineering) ─────────────────────────────────────
  {
    id: 'tpl-build-bridge',
    name: 'Bridge Builder',
    mechanic: 'build',
    tier: ['foundation', 'discovery', 'builder'],
    biomes: ['workshop', 'living-forest', 'architects-domain'],
    skillSlots: [
      { role: 'primary', category: 'engineering.basics', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'math.geometry', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Examine the gap that needs a bridge.', spokenInstruction: 'Take a look at the gap that needs a bridge.', screenReaderText: 'Examine the gap between two platforms that needs bridging.', objectiveType: 'observe', hints: ['Look at the space between the two sides.', 'How wide is the gap?'], successResponse: 'Great observation! Now you know how far the bridge needs to span.', failureResponse: 'The gap is right ahead — take another look at the space between the two sides.' },
        { instruction: 'Choose materials strong enough for the span.', spokenInstruction: 'Pick materials that are strong enough to hold the bridge.', screenReaderText: 'Select building materials with sufficient strength for the bridge span.', objectiveType: 'collect', hints: ['Stronger materials can span wider gaps.', 'Check the material strength ratings.'], successResponse: 'Those materials should work perfectly!', failureResponse: 'Hmm, those materials might not be strong enough. Let us try something sturdier.' },
        { instruction: 'Build the bridge and test it.', spokenInstruction: 'Build the bridge and see if it holds!', screenReaderText: 'Construct the bridge from selected materials and test its structural integrity.', objectiveType: 'build', hints: ['Place beams across the gap.', 'Make sure the supports are solid.'], successResponse: 'The bridge holds! Fantastic engineering!', failureResponse: 'The bridge wobbles — maybe we need to adjust the support placement.' },
      ],
      companionIntro: 'There is a gap here that needs crossing, {playerName}. I bet we can build something great!',
      companionOutro: 'What an amazing bridge! You really understand how structures work.',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'construction',
  },
  {
    id: 'tpl-build-shelter',
    name: 'Shelter Design',
    mechanic: 'build',
    tier: ['discovery', 'builder'],
    biomes: ['workshop', 'living-forest', 'architects-domain'],
    skillSlots: [
      { role: 'primary', category: 'engineering.structures', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'science.weather', minLevel: 0, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Survey the environment and note weather conditions.', spokenInstruction: 'Look around and check what weather this shelter needs to handle.', screenReaderText: 'Observe the local weather patterns and terrain to plan shelter requirements.', objectiveType: 'observe', hints: ['Is it rainy? Windy? Sunny?', 'Different weather needs different designs.'], successResponse: 'Good assessment! You understand what the shelter needs to withstand.', failureResponse: 'Look at the sky and feel the wind — what conditions will the shelter face?' },
        { instruction: 'Design a shelter that handles the conditions.', spokenInstruction: 'Design a shelter that can handle the weather here.', screenReaderText: 'Create a shelter design appropriate for the observed weather conditions.', objectiveType: 'build', hints: ['Sloped roofs shed rain.', 'Thick walls block wind.'], successResponse: 'That design looks solid! It should handle the weather well.', failureResponse: 'The design might need adjustment — think about what the weather will do to it.' },
      ],
      companionIntro: 'We need shelter here, {playerName}. Let us figure out what the weather demands!',
      companionOutro: 'A shelter that works with the environment, not against it. The Founders would approve.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'construction',
  },
  {
    id: 'tpl-build-tower',
    name: 'Tower Challenge',
    mechanic: 'build',
    tier: ['builder', 'innovator'],
    biomes: ['workshop', 'architects-domain', 'storm-tower'],
    skillSlots: [
      { role: 'primary', category: 'engineering.structures', minLevel: 2, teaches: true },
      { role: 'secondary', category: 'science.physics', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Calculate the maximum height for the given base width.', spokenInstruction: 'Figure out how tall the tower can be with this base.', screenReaderText: 'Calculate maximum tower height using the base width and material properties.', objectiveType: 'measure', hints: ['Taller towers need wider bases.', 'Check the material compressive strength.'], successResponse: 'Perfect calculation! You understand the height-to-base ratio.', failureResponse: 'The ratio seems off — remember, taller structures need proportionally wider bases.' },
        { instruction: 'Build the tower layer by layer.', spokenInstruction: 'Start building the tower from the ground up.', screenReaderText: 'Construct the tower by stacking layers, checking stability as you go.', objectiveType: 'build', hints: ['Each layer must be level.', 'Check for wobble after each layer.'], successResponse: 'Rising beautifully! Each layer is solid.', failureResponse: 'There is a slight lean — try adjusting the placement of the last layer.' },
      ],
      companionIntro: 'Let us see how high we can build, {playerName}! Physics is our guide.',
      companionOutro: 'An impressive tower! You balanced ambition with structural reality.',
      estimatedMinutes: 15,
    },
    antiRepetitionCategory: 'construction',
  },

  // ─── CRAFT (chemistry, recipes) ────────────────────────────────────────────
  {
    id: 'tpl-craft-potion',
    name: 'Potion Mixing',
    mechanic: 'craft',
    tier: ['foundation', 'discovery'],
    biomes: ['alchemist-lab'],
    skillSlots: [
      { role: 'primary', category: 'science.chemistry', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'math.counting', minLevel: 0, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Read the recipe and identify the ingredients needed.', spokenInstruction: 'Read the recipe and figure out what ingredients we need.', screenReaderText: 'Read the recipe card to identify required ingredients and quantities.', objectiveType: 'observe', hints: ['The recipe lists each ingredient.', 'Count how much of each we need.'], successResponse: 'You have identified all the ingredients!', failureResponse: 'Take another look at the recipe — there might be an ingredient we missed.' },
        { instruction: 'Measure and combine the ingredients in the right order.', spokenInstruction: 'Measure out each ingredient and combine them in the right order.', screenReaderText: 'Measure ingredients precisely and add them to the cauldron in the specified order.', objectiveType: 'craft', hints: ['Order matters in chemistry!', 'Measure carefully — too much or too little changes the result.'], successResponse: 'The potion bubbles and glows — perfect mix!', failureResponse: 'The mixture fizzles and smokes. Let us try adjusting the amounts.' },
      ],
      companionIntro: 'Time for some chemistry, {playerName}! Shall we mix something wonderful?',
      companionOutro: 'A perfectly mixed potion! You understand how ingredients work together.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'chemistry',
  },
  {
    id: 'tpl-craft-compound',
    name: 'Compound Synthesis',
    mechanic: 'craft',
    tier: ['builder', 'innovator'],
    biomes: ['alchemist-lab'],
    skillSlots: [
      { role: 'primary', category: 'science.chemistry', minLevel: 2, teaches: true },
      { role: 'secondary', category: 'math.arithmetic', minLevel: 1, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Balance the chemical equation.', spokenInstruction: 'Balance the chemical equation so both sides match.', screenReaderText: 'Balance the chemical equation by ensuring equal atoms on each side.', objectiveType: 'solve', hints: ['Count atoms on both sides.', 'Coefficients change quantities, not subscripts.'], successResponse: 'Perfectly balanced! The equation is correct.', failureResponse: 'The equation is not balanced yet — count the atoms on each side again.' },
        { instruction: 'Measure reagents in the correct stoichiometric ratios.', spokenInstruction: 'Measure out the reagents using the ratios from the balanced equation.', screenReaderText: 'Use the balanced equation to calculate and measure the correct reagent amounts.', objectiveType: 'measure', hints: ['The coefficients tell you the ratio.', 'Double-check your measurements.'], successResponse: 'Precise measurements! Ready for synthesis.', failureResponse: 'The proportions seem off — check the coefficients in the equation again.' },
        { instruction: 'Combine and observe the reaction.', spokenInstruction: 'Combine the reagents and watch what happens!', screenReaderText: 'Add measured reagents to the vessel and observe the chemical reaction.', objectiveType: 'craft', hints: ['Watch for color changes, bubbles, or heat.', 'Some reactions take time.'], successResponse: 'The reaction completes beautifully! A new compound forms.', failureResponse: 'The reaction did not go as expected. Let us review the equation and try again.' },
      ],
      companionIntro: 'Real chemistry time, {playerName}. Stoichiometry is our guide!',
      companionOutro: 'You synthesized a real compound from a balanced equation. That is genuine chemistry.',
      estimatedMinutes: 15,
    },
    antiRepetitionCategory: 'chemistry',
  },

  // ─── DIAGNOSE (troubleshooting, root cause) ───────────────────────────────
  {
    id: 'tpl-diagnose-machine',
    name: 'Machine Doctor',
    mechanic: 'diagnose',
    tier: ['discovery', 'builder'],
    biomes: ['workshop', 'code-forge'],
    skillSlots: [
      { role: 'primary', category: 'engineering.basics', minLevel: 1, teaches: true },
      { role: 'secondary', category: 'science.observation', minLevel: 0, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Observe the broken machine and list the symptoms.', spokenInstruction: 'Look at the broken machine and describe what is wrong.', screenReaderText: 'Examine the malfunctioning machine and identify observable symptoms.', objectiveType: 'observe', hints: ['Does it make strange noises?', 'Are parts visibly damaged or misaligned?'], successResponse: 'Good observations! You have identified the symptoms.', failureResponse: 'Look more carefully — what sounds, movements, or visual clues do you notice?' },
        { instruction: 'Test each component to find the root cause.', spokenInstruction: 'Test each part to figure out what is actually causing the problem.', screenReaderText: 'Systematically test machine components to isolate the root cause of failure.', objectiveType: 'interact', hints: ['Test one thing at a time.', 'The symptom is not always the cause.'], successResponse: 'You found it! The root cause is clear now.', failureResponse: 'That component seems fine. Let us test the next one.' },
        { instruction: 'Fix the root cause and verify the machine works.', spokenInstruction: 'Fix what is broken and make sure the machine runs properly.', screenReaderText: 'Repair the identified root cause and verify full machine functionality.', objectiveType: 'interact', hints: ['Apply the fix carefully.', 'Test the full machine, not just the fixed part.'], successResponse: 'The machine hums to life! Problem solved!', failureResponse: 'Something else might be contributing. Let us check our diagnosis again.' },
      ],
      companionIntro: 'Something is broken, {playerName}. Let us figure out why — not just what.',
      companionOutro: 'You did not just fix it — you understood WHY it broke. That is real engineering.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'troubleshooting',
  },
  {
    id: 'tpl-diagnose-ecosystem',
    name: 'Ecosystem Health Check',
    mechanic: 'diagnose',
    tier: ['builder', 'innovator'],
    biomes: ['living-forest', 'healers-sanctuary'],
    skillSlots: [
      { role: 'primary', category: 'science.biology.ecology', minLevel: 1, teaches: true },
      { role: 'secondary', category: 'science.observation', minLevel: 0, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Survey the ecosystem and note what seems different.', spokenInstruction: 'Walk through the area and note anything that seems off.', screenReaderText: 'Survey the local ecosystem for signs of imbalance or distress.', objectiveType: 'observe', hints: ['Are any species missing?', 'Do the plants look healthy?'], successResponse: 'Sharp eyes! You noticed something important.', failureResponse: 'Compare what you see to what was here before — what has changed?' },
        { instruction: 'Trace the cause through the food web.', spokenInstruction: 'Follow the connections in the food web to find the root cause.', screenReaderText: 'Trace the observed symptoms through the food web to identify the cascade origin.', objectiveType: 'interact', hints: ['Predators and prey are connected.', 'Removing one species affects others.'], successResponse: 'You traced it perfectly through the web!', failureResponse: 'The connections are complex. Try following one link at a time.' },
      ],
      companionIntro: 'The ecosystem seems different, {playerName}. Something is out of balance.',
      companionOutro: 'You diagnosed the ecosystem like a real ecologist. Everything is connected.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'troubleshooting',
  },

  // ─── EXPLORE (discovery, search) ───────────────────────────────────────────
  {
    id: 'tpl-explore-biome',
    name: 'Biome Discovery',
    mechanic: 'explore',
    tier: ['foundation', 'discovery'],
    biomes: ['any'],
    skillSlots: [
      { role: 'primary', category: 'science.observation', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Explore the area and find three interesting objects.', spokenInstruction: 'Explore around and find three interesting things.', screenReaderText: 'Explore the current area and interact with three notable objects.', objectiveType: 'find', hints: ['Look in corners and behind things.', 'Interesting objects often glow or make sounds.'], successResponse: 'Three discoveries! Each one teaches something new.', failureResponse: 'Keep exploring! There is always something more to find around the next corner.' },
      ],
      companionIntro: 'A new area to explore, {playerName}! Let us see what we can discover.',
      companionOutro: 'What wonderful discoveries! Every exploration reveals something new.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'exploration',
  },
  {
    id: 'tpl-explore-cave',
    name: 'Cavern Expedition',
    mechanic: 'explore',
    tier: ['discovery', 'builder'],
    biomes: ['crystal-caverns'],
    skillSlots: [
      { role: 'primary', category: 'science.geology', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'spatial.directions', minLevel: 0, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Map the tunnel system by noting each junction.', spokenInstruction: 'Map the tunnels by noting each place where paths split.', screenReaderText: 'Create a mental map of the tunnel junctions as you navigate the cavern.', objectiveType: 'navigate', hints: ['Count the tunnels at each junction.', 'Mark where you have been.'], successResponse: 'Excellent mapping! You have the whole layout.', failureResponse: 'It is easy to get turned around. Try going back to the last junction.' },
        { instruction: 'Identify three different mineral types in the walls.', spokenInstruction: 'Find three different minerals in the cave walls.', screenReaderText: 'Examine cave walls to identify and classify three distinct mineral types.', objectiveType: 'find', hints: ['Different minerals have different colors and textures.', 'Some minerals sparkle, others are dull.'], successResponse: 'Three different minerals identified! Real geology!', failureResponse: 'The walls have many minerals. Look for different colors and textures.' },
      ],
      companionIntro: 'The caverns go deep, {playerName}. Let us map them and see what we find!',
      companionOutro: 'You explored and identified real minerals. A true geologist in the making!',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'exploration',
  },

  // ─── TEACH (explain to NPCs/companion) ────────────────────────────────────
  {
    id: 'tpl-teach-companion',
    name: 'Teaching Moment',
    mechanic: 'teach',
    tier: ['discovery', 'builder', 'innovator'],
    biomes: ['any'],
    skillSlots: [
      { role: 'review', category: 'math.arithmetic', minLevel: 1, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'The companion is confused about a concept. Explain it clearly.', spokenInstruction: 'I am a bit confused about this. Can you explain it to me?', screenReaderText: 'The companion asks you to explain a concept. Demonstrate understanding by teaching.', objectiveType: 'teach', hints: ['Try explaining it step by step.', 'Use examples from the world around you.'], successResponse: 'Oh, I get it now! You explained that really well.', failureResponse: 'Hmm, I am still a bit confused. Can you try explaining it a different way?' },
      ],
      companionIntro: 'Hey {playerName}, can you help me understand something?',
      companionOutro: 'Thanks for teaching me, {playerName}! Explaining things helps us both understand better.',
      estimatedMinutes: 5,
    },
    antiRepetitionCategory: 'teaching',
  },
  {
    id: 'tpl-teach-npc',
    name: 'Village Teacher',
    mechanic: 'teach',
    tier: ['builder', 'innovator', 'creator'],
    biomes: ['any'],
    skillSlots: [
      { role: 'review', category: 'science.physics', minLevel: 2, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'A young villager needs to understand why something works.', spokenInstruction: 'A young villager wants to learn how this works. Can you show them?', screenReaderText: 'A young NPC asks for help understanding a concept. Teach them through demonstration.', objectiveType: 'teach', hints: ['Show, do not just tell.', 'Start with something they already know.'], successResponse: 'The villager\'s eyes light up with understanding!', failureResponse: 'They are trying hard. Maybe a different approach would help.' },
        { instruction: 'Help the villager apply what you taught.', spokenInstruction: 'Now help them try it on their own.', screenReaderText: 'Guide the villager as they attempt to apply the concept independently.', objectiveType: 'interact', hints: ['Let them try first.', 'Offer encouragement when they get close.'], successResponse: 'They did it! And you made it possible.', failureResponse: 'Almost! Just a small adjustment. Encourage them to try again.' },
      ],
      companionIntro: 'Someone could use your knowledge, {playerName}. Teaching is the deepest form of understanding.',
      companionOutro: 'By teaching others, you proved you truly understand. The Founders would be proud.',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'teaching',
  },

  // ─── EXPERIMENT (scientific method) ────────────────────────────────────────
  {
    id: 'tpl-experiment-hypothesis',
    name: 'Hypothesis Testing',
    mechanic: 'experiment',
    tier: ['discovery', 'builder'],
    biomes: ['alchemist-lab', 'living-forest', 'storm-tower'],
    skillSlots: [
      { role: 'primary', category: 'science.observation', minLevel: 1, teaches: true },
      { role: 'secondary', category: 'science.matter', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Observe the phenomenon and form a hypothesis.', spokenInstruction: 'Watch what is happening and come up with an idea about why.', screenReaderText: 'Observe the phenomenon carefully and formulate a testable hypothesis.', objectiveType: 'observe', hints: ['What do you think is causing this?', 'A hypothesis is a guess you can test.'], successResponse: 'Interesting hypothesis! Let us test it.', failureResponse: 'Think about what might be causing what you see. What could we test?' },
        { instruction: 'Design a test for your hypothesis.', spokenInstruction: 'Figure out how to test your idea.', screenReaderText: 'Design an experiment that could prove or disprove your hypothesis.', objectiveType: 'interact', hints: ['Change one thing at a time.', 'What would you expect to see if your hypothesis is correct?'], successResponse: 'A well-designed experiment! Only one variable changes.', failureResponse: 'If you change too many things, you will not know what caused the result. Try changing just one thing.' },
        { instruction: 'Run the experiment and interpret the results.', spokenInstruction: 'Run the experiment and see what happens!', screenReaderText: 'Execute the experiment and compare results to your hypothesis prediction.', objectiveType: 'interact', hints: ['Record what you observe.', 'Does the result match your prediction?'], successResponse: 'Science in action! Your results tell a clear story.', failureResponse: 'Unexpected results are not failures — they teach us something new.' },
      ],
      companionIntro: 'Something interesting is happening here, {playerName}. Let us investigate scientifically!',
      companionOutro: 'You used the scientific method! Observe, hypothesize, test, conclude. Real science.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'science',
  },

  // ─── NEGOTIATE (economics, trade, social) ──────────────────────────────────
  {
    id: 'tpl-negotiate-trade',
    name: 'Fair Trade',
    mechanic: 'negotiate',
    tier: ['discovery', 'builder'],
    biomes: ['trading-post'],
    skillSlots: [
      { role: 'primary', category: 'math.arithmetic', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Assess the value of goods on both sides.', spokenInstruction: 'Figure out what each side is offering and what it is worth.', screenReaderText: 'Evaluate the relative value of goods offered by both trading parties.', objectiveType: 'observe', hints: ['What is rare is often more valuable.', 'Consider what each side needs.'], successResponse: 'Good assessment! You understand the value here.', failureResponse: 'Think about what each side needs most — value is not just about rarity.' },
        { instruction: 'Propose a trade that leaves both sides satisfied.', spokenInstruction: 'Suggest a trade where everyone walks away happy.', screenReaderText: 'Negotiate a mutually beneficial exchange using math to ensure fairness.', objectiveType: 'interact', hints: ['Both sides should feel they gained something.', 'Use math to check the fairness.'], successResponse: 'A fair trade! Both sides are happy.', failureResponse: 'One side does not seem satisfied. Can we adjust the offer?' },
      ],
      companionIntro: 'Trade time, {playerName}! Remember, the best trades make everyone happy.',
      companionOutro: 'Fair economics in action. You proved that math and empathy go together.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'social',
  },

  // ─── NAVIGATE (pathfinding, spatial reasoning) ────────────────────────────
  {
    id: 'tpl-navigate-stars',
    name: 'Stellar Navigation',
    mechanic: 'navigate',
    tier: ['builder', 'innovator'],
    biomes: ['observatory', 'explorers-map'],
    skillSlots: [
      { role: 'primary', category: 'math.trigonometry', minLevel: 1, teaches: true },
      { role: 'secondary', category: 'science.physics', minLevel: 1, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Identify your position using three star sightings.', spokenInstruction: 'Figure out where you are by measuring three different stars.', screenReaderText: 'Determine current position through triangulation using three stellar observations.', objectiveType: 'measure', hints: ['Measure the angle of each star above the horizon.', 'Three measurements give you a unique position.'], successResponse: 'Triangulation complete! You know exactly where you are.', failureResponse: 'The angles need to be more precise. Try measuring again carefully.' },
        { instruction: 'Plot a course to the destination.', spokenInstruction: 'Now chart a path from here to the destination.', screenReaderText: 'Calculate and plot the navigational course to the target destination.', objectiveType: 'navigate', hints: ['The shortest path on a sphere is a great circle.', 'Account for drift and rotation.'], successResponse: 'Course plotted! The math checks out.', failureResponse: 'The course may need adjustment — remember we are navigating on a curved surface.' },
      ],
      companionIntro: 'The stars are our map, {playerName}. Let us navigate by their light!',
      companionOutro: 'Navigation by the stars! Humanity has done this for thousands of years, and so have you.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'navigation',
  },
  {
    id: 'tpl-navigate-maze',
    name: 'Maze Runner',
    mechanic: 'navigate',
    tier: ['foundation', 'discovery'],
    biomes: ['crystal-caverns', 'ancient-ruins', 'living-forest'],
    skillSlots: [
      { role: 'primary', category: 'spatial.directions', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Navigate through the maze to the other side.', spokenInstruction: 'Find your way through the maze!', screenReaderText: 'Navigate through a maze using spatial reasoning and directional choices.', objectiveType: 'navigate', hints: ['Try following one wall.', 'Remember which paths you already tried.'], successResponse: 'You made it through! Great spatial reasoning.', failureResponse: 'Dead end! Let us go back and try a different path.' },
      ],
      companionIntro: 'A maze, {playerName}! Let us find our way through together.',
      companionOutro: 'You navigated brilliantly! Every wrong turn taught us something.',
      estimatedMinutes: 6,
    },
    antiRepetitionCategory: 'navigation',
  },

  // ─── DECODE (ciphers, patterns, language) ──────────────────────────────────
  {
    id: 'tpl-decode-inscription',
    name: 'Ancient Inscription',
    mechanic: 'decode',
    tier: ['discovery', 'builder'],
    biomes: ['ancient-ruins', 'library-echoes'],
    skillSlots: [
      { role: 'primary', category: 'language.reading', minLevel: 1, teaches: true },
      { role: 'secondary', category: 'math.patterns', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Study the symbols and look for repeating patterns.', spokenInstruction: 'Study these symbols carefully. Do any of them repeat?', screenReaderText: 'Analyze the inscription symbols for repeating patterns and frequency.', objectiveType: 'observe', hints: ['Some symbols appear more than others.', 'The most common symbol might be a common letter.'], successResponse: 'You spotted the pattern! Those repeating symbols are key.', failureResponse: 'Look again — some symbols show up more often than others. That is the clue.' },
        { instruction: 'Use the patterns to decode the message.', spokenInstruction: 'Use what you found to figure out what it says!', screenReaderText: 'Apply identified patterns to decode the complete inscription message.', objectiveType: 'solve', hints: ['Start with the most common symbols.', 'Context can help you guess the rest.'], successResponse: 'Decoded! The message reveals ancient wisdom.', failureResponse: 'Some symbols are tricky. Try the ones you are most confident about first.' },
      ],
      companionIntro: 'Ancient writing, {playerName}! I wonder what it says. Let us decode it!',
      companionOutro: 'You cracked a code that has been here for ages. Words across time!',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'language',
  },

  // ─── COLLECT (gathering, counting) ─────────────────────────────────────────
  {
    id: 'tpl-collect-specimens',
    name: 'Specimen Collection',
    mechanic: 'collect',
    tier: ['foundation', 'discovery'],
    biomes: ['living-forest', 'crystal-caverns', 'alchemist-lab'],
    skillSlots: [
      { role: 'primary', category: 'math.counting', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'science.observation', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Find and collect different specimens from the area.', spokenInstruction: 'Find and gather different specimens from around here.', screenReaderText: 'Search the area and collect distinct specimen types.', objectiveType: 'collect', hints: ['Look in different spots — variety is everywhere.', 'Count how many of each type you find.'], successResponse: 'What a great collection! Each specimen is unique.', failureResponse: 'Keep searching! There are more types to find in different places.' },
      ],
      companionIntro: 'Let us collect some specimens, {playerName}! Science starts with gathering.',
      companionOutro: 'A wonderful collection! Observation is the foundation of all science.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'gathering',
  },

  // ─── PROTECT (defense, preservation) ───────────────────────────────────────
  {
    id: 'tpl-protect-garden',
    name: 'Garden Guardian',
    mechanic: 'protect',
    tier: ['foundation', 'discovery'],
    biomes: ['living-forest', 'healers-sanctuary'],
    skillSlots: [
      { role: 'primary', category: 'science.biology.basics', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Identify which plants are being threatened and why.', spokenInstruction: 'Figure out which plants need help and what is threatening them.', screenReaderText: 'Identify threatened plants and the source of the environmental threat.', objectiveType: 'observe', hints: ['Look for wilting or discolored leaves.', 'What changed recently in the environment?'], successResponse: 'You identified the threat! Now we can act.', failureResponse: 'Look at the plants more closely — which ones look unhappy, and why?' },
        { instruction: 'Take action to protect the garden.', spokenInstruction: 'Do what you can to protect these plants!', screenReaderText: 'Implement a solution to protect the garden from the identified threat.', objectiveType: 'interact', hints: ['Sometimes removing the threat is enough.', 'Sometimes plants need extra support.'], successResponse: 'The garden is safe! You protected it with knowledge.', failureResponse: 'The plants are still struggling. Let us think about what else they need.' },
      ],
      companionIntro: 'The garden needs our help, {playerName}! Something is threatening these plants.',
      companionOutro: 'You protected living things with knowledge. That is what a guardian does.',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'caretaking',
  },

  // ─── DESIGN (creative problem-solving) ────────────────────────────────────
  {
    id: 'tpl-design-machine',
    name: 'Invention Workshop',
    mechanic: 'design',
    tier: ['builder', 'innovator'],
    biomes: ['workshop', 'code-forge', 'architects-domain'],
    skillSlots: [
      { role: 'primary', category: 'engineering.basics', minLevel: 2, teaches: true },
      { role: 'secondary', category: 'math.algebra', minLevel: 1, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Define the problem the invention needs to solve.', spokenInstruction: 'What problem does this invention need to solve?', screenReaderText: 'Define the specific problem the invention must address.', objectiveType: 'observe', hints: ['A good invention starts with a clear problem.', 'Who needs this, and why?'], successResponse: 'Clear problem definition! Now we know what to build.', failureResponse: 'Let us be more specific. What exactly needs to be different?' },
        { instruction: 'Design the solution and explain how it works.', spokenInstruction: 'Design your solution and explain the mechanism.', screenReaderText: 'Create a design for the invention and explain its operating principle.', objectiveType: 'build', hints: ['Every part should serve a purpose.', 'How does energy or information flow through it?'], successResponse: 'Brilliant design! The mechanism is sound.', failureResponse: 'The design needs refinement. Let us think about how each part contributes.' },
      ],
      companionIntro: 'Time to invent, {playerName}! Every great invention starts with a problem worth solving.',
      companionOutro: 'From problem to solution — that is the engineering design process in action!',
      estimatedMinutes: 15,
    },
    antiRepetitionCategory: 'creative',
  },

  // ─── MEASURE (quantification, estimation) ──────────────────────────────────
  {
    id: 'tpl-measure-height',
    name: 'How Tall Is That?',
    mechanic: 'measure',
    tier: ['foundation', 'discovery', 'builder'],
    biomes: ['any'],
    skillSlots: [
      { role: 'primary', category: 'math.geometry', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Estimate the height of the object using a reference.', spokenInstruction: 'How tall do you think that is? Use something you know the height of as a reference.', screenReaderText: 'Estimate the height of a tall object using a known reference measurement.', objectiveType: 'measure', hints: ['You know your own height. How many of you tall is it?', 'Shadows can help measure too.'], successResponse: 'Great estimate! Your measurement is close.', failureResponse: 'Good try! Compare it to your reference again — is it taller or shorter than you thought?' },
      ],
      companionIntro: 'How tall is that, {playerName}? Let us figure it out with math!',
      companionOutro: 'You measured using geometry! No ruler needed when you understand the math.',
      estimatedMinutes: 5,
    },
    antiRepetitionCategory: 'measurement',
  },
  {
    id: 'tpl-measure-distance',
    name: 'Distance Finder',
    mechanic: 'measure',
    tier: ['discovery', 'builder'],
    biomes: ['observatory', 'explorers-map', 'living-forest'],
    skillSlots: [
      { role: 'primary', category: 'math.trigonometry', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Use triangulation to calculate the distance to a landmark.', spokenInstruction: 'Measure from two different spots and use the angles to calculate the distance.', screenReaderText: 'Apply triangulation from two observation points to calculate the distance to a landmark.', objectiveType: 'measure', hints: ['Measure the angle to the landmark from two known positions.', 'The triangle tells you the distance.'], successResponse: 'Distance calculated! Trigonometry strikes again.', failureResponse: 'The angles need adjustment. Try measuring from a wider baseline.' },
      ],
      companionIntro: 'How far away is that, {playerName}? We can figure it out without going there!',
      companionOutro: 'You measured distance with angles alone. That is how surveyors work!',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'measurement',
  },

  // ─── COMPARE (analysis, classification) ───────────────────────────────────
  {
    id: 'tpl-compare-materials',
    name: 'Material Showdown',
    mechanic: 'compare',
    tier: ['discovery', 'builder'],
    biomes: ['workshop', 'crystal-caverns'],
    skillSlots: [
      { role: 'primary', category: 'science.matter', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Test both materials and compare their properties.', spokenInstruction: 'Test both materials and figure out how they are different.', screenReaderText: 'Conduct property tests on two materials and compare results.', objectiveType: 'interact', hints: ['Test strength, weight, flexibility.', 'Which property matters most for this use?'], successResponse: 'Thorough comparison! You know which is better for what.', failureResponse: 'Try testing another property — there is more to compare.' },
      ],
      companionIntro: 'Two materials, one choice, {playerName}. Let us test them and see which wins!',
      companionOutro: 'You compared systematically. The right choice depends on what you need!',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'analysis',
  },

  // ─── SORT (ordering, classification) ───────────────────────────────────────
  {
    id: 'tpl-sort-elements',
    name: 'Element Organizer',
    mechanic: 'sort',
    tier: ['foundation', 'discovery'],
    biomes: ['alchemist-lab'],
    skillSlots: [
      { role: 'primary', category: 'math.sorting', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'science.matter', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Sort the elements by the given property.', spokenInstruction: 'Sort these elements in order of the property shown.', screenReaderText: 'Arrange the elements in order based on the specified property.', objectiveType: 'sort', hints: ['Compare two at a time.', 'Heavier things go on one end, lighter on the other.'], successResponse: 'Perfectly sorted! You see the pattern in the order.', failureResponse: 'Almost right! Compare the ones near the middle again.' },
      ],
      companionIntro: 'Let us put these elements in order, {playerName}! Sorting reveals patterns.',
      companionOutro: 'The periodic table is just clever sorting! You are thinking like a chemist.',
      estimatedMinutes: 6,
    },
    antiRepetitionCategory: 'classification',
  },

  // ─── SEQUENCE (ordering events, processes) ────────────────────────────────
  {
    id: 'tpl-sequence-history',
    name: 'Timeline Builder',
    mechanic: 'sequence',
    tier: ['discovery', 'builder'],
    biomes: ['ancient-ruins', 'time-rift', 'library-echoes'],
    skillSlots: [
      { role: 'primary', category: 'language.reading', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Read the clues and arrange events in chronological order.', spokenInstruction: 'Read each clue and figure out what happened in what order.', screenReaderText: 'Analyze historical clues and arrange events on a timeline.', objectiveType: 'sequence', hints: ['Look for words like before, after, and during.', 'Cause always comes before effect.'], successResponse: 'The timeline is correct! History makes sense in order.', failureResponse: 'Some events might be switched. Think about which caused which.' },
      ],
      companionIntro: 'When did these things happen, {playerName}? Let us build a timeline!',
      companionOutro: 'Understanding sequence is understanding cause and effect. You think like a historian!',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'ordering',
  },

  // ─── BALANCE (equilibrium, proportions) ───────────────────────────────────
  {
    id: 'tpl-balance-equation',
    name: 'Chemical Balance',
    mechanic: 'balance',
    tier: ['builder', 'innovator'],
    biomes: ['alchemist-lab'],
    skillSlots: [
      { role: 'primary', category: 'science.chemistry', minLevel: 2, teaches: true },
      { role: 'secondary', category: 'math.arithmetic', minLevel: 1, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Count atoms on both sides and add coefficients to balance.', spokenInstruction: 'Count the atoms on each side and add numbers to make them equal.', screenReaderText: 'Balance the chemical equation by adding coefficients to equalize atoms.', objectiveType: 'solve', hints: ['Start with the most complex molecule.', 'Balancing one element may unbalance another — keep iterating.'], successResponse: 'Balanced! Conservation of mass in action.', failureResponse: 'Count again — one element might still be unequal. Take it one atom at a time.' },
      ],
      companionIntro: 'Atoms cannot appear from nothing, {playerName}. Let us balance this equation!',
      companionOutro: 'You balanced real chemistry! Conservation of mass is a universal law.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'chemistry',
  },
  {
    id: 'tpl-balance-ecosystem',
    name: 'Ecosystem Balance',
    mechanic: 'balance',
    tier: ['discovery', 'builder'],
    biomes: ['living-forest'],
    skillSlots: [
      { role: 'primary', category: 'science.biology.ecology', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Adjust predator and prey populations to achieve balance.', spokenInstruction: 'Figure out how many predators and prey we need for a balanced ecosystem.', screenReaderText: 'Adjust species populations to achieve a sustainable ecosystem equilibrium.', objectiveType: 'interact', hints: ['Too many predators means not enough prey.', 'Too few predators means prey overrun everything.'], successResponse: 'The ecosystem is in balance! All species can sustain their populations.', failureResponse: 'The balance is off. Think about what happens when one population changes.' },
      ],
      companionIntro: 'The ecosystem is out of balance, {playerName}. Let us restore it!',
      companionOutro: 'You balanced a real ecosystem. Nature is all about equilibrium.',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'ecology',
  },

  // ─── TRANSFORM (state changes, conversions) ──────────────────────────────
  {
    id: 'tpl-transform-states',
    name: 'State Changer',
    mechanic: 'transform',
    tier: ['foundation', 'discovery'],
    biomes: ['alchemist-lab', 'storm-tower'],
    skillSlots: [
      { role: 'primary', category: 'science.matter', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Change the substance from one state to another.', spokenInstruction: 'Change this substance from its current state to a different one.', screenReaderText: 'Apply energy changes to transform a substance between solid, liquid, and gas states.', objectiveType: 'interact', hints: ['Adding heat makes things melt or evaporate.', 'Cooling makes things condense or freeze.'], successResponse: 'State changed! Same substance, different form.', failureResponse: 'Not enough change yet. Try adding more heat or cold.' },
      ],
      companionIntro: 'Same stuff, different forms, {playerName}! Let us transform matter.',
      companionOutro: 'You transformed matter between states. That is thermodynamics!',
      estimatedMinutes: 6,
    },
    antiRepetitionCategory: 'physics',
  },

  // ─── OBSERVE (careful watching, data recording) ───────────────────────────
  {
    id: 'tpl-observe-weather',
    name: 'Weather Watcher',
    mechanic: 'observe',
    tier: ['foundation', 'discovery'],
    biomes: ['storm-tower', 'observatory', 'living-forest'],
    skillSlots: [
      { role: 'primary', category: 'science.weather', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'science.observation', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Observe and record three weather measurements.', spokenInstruction: 'Watch the weather and record three different measurements.', screenReaderText: 'Observe and document three weather measurements: temperature, wind, and precipitation.', objectiveType: 'observe', hints: ['Check the thermometer.', 'Feel which way the wind blows.', 'Is it raining, snowing, or clear?'], successResponse: 'Three measurements recorded! Real meteorological data.', failureResponse: 'There are more measurements to take. Check the instruments around you.' },
      ],
      companionIntro: 'What is the weather doing, {playerName}? Let us observe like meteorologists!',
      companionOutro: 'You collected real weather data. Every forecast starts with observation!',
      estimatedMinutes: 6,
    },
    antiRepetitionCategory: 'observation',
  },
  {
    id: 'tpl-observe-stars',
    name: 'Stargazer',
    mechanic: 'observe',
    tier: ['discovery', 'builder'],
    biomes: ['observatory'],
    skillSlots: [
      { role: 'primary', category: 'science.physics', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'math.patterns', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Identify constellations and record their positions.', spokenInstruction: 'Find the constellations and note where they are in the sky.', screenReaderText: 'Locate and identify star constellations, recording their positions.', objectiveType: 'observe', hints: ['Look for patterns of bright stars.', 'The map shows what you should see.'], successResponse: 'Constellations identified! You see the patterns in the stars.', failureResponse: 'The stars can be overwhelming. Focus on the brightest ones first — patterns emerge.' },
      ],
      companionIntro: 'The sky is full of stories, {playerName}. Let us read them!',
      companionOutro: 'You mapped real constellations. Ancient navigators would be impressed!',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'observation',
  },

  // ─── PREDICT (forecasting, extrapolation) ──────────────────────────────────
  {
    id: 'tpl-predict-reaction',
    name: 'Reaction Predictor',
    mechanic: 'predict',
    tier: ['builder', 'innovator'],
    biomes: ['alchemist-lab'],
    skillSlots: [
      { role: 'primary', category: 'science.chemistry', minLevel: 2, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Predict what will happen when these substances are combined.', spokenInstruction: 'Before we mix these, what do you think will happen?', screenReaderText: 'Predict the products and observable effects of combining two chemical substances.', objectiveType: 'predict', hints: ['Think about what elements are present.', 'Will the reaction release or absorb energy?'], successResponse: 'Your prediction matches the result! Scientific thinking!', failureResponse: 'Interesting! The result was different from expected. Let us figure out why.' },
        { instruction: 'Test your prediction by mixing the substances.', spokenInstruction: 'Now let us mix them and see if you were right!', screenReaderText: 'Perform the reaction and compare the actual results to your prediction.', objectiveType: 'craft', hints: ['Watch for color, temperature, and gas production.', 'Compare what you see to what you predicted.'], successResponse: 'Prediction verified! Theory meets practice.', failureResponse: 'The result surprised us! Understanding why predictions fail IS science.' },
      ],
      companionIntro: 'Before we experiment, {playerName}, let us predict the outcome first!',
      companionOutro: 'Predicting then testing — that is the essence of the scientific method!',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'science',
  },

  // ─── REPAIR (fixing, restoration) ──────────────────────────────────────────
  {
    id: 'tpl-repair-bridge',
    name: 'Bridge Repair',
    mechanic: 'repair',
    tier: ['discovery', 'builder'],
    biomes: ['workshop', 'living-forest'],
    skillSlots: [
      { role: 'primary', category: 'engineering.basics', minLevel: 1, teaches: true },
      { role: 'review', category: 'math.geometry', minLevel: 0, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Inspect the damaged structure and identify what failed.', spokenInstruction: 'Look at the damage and figure out what broke and why.', screenReaderText: 'Inspect the damaged structure to identify the failure point and cause.', objectiveType: 'observe', hints: ['Where did it break first?', 'What kind of stress caused this?'], successResponse: 'You found the weak point! Now we know what to fix.', failureResponse: 'Look more carefully at where the damage started, not where it ended.' },
        { instruction: 'Repair the structure using appropriate materials and technique.', spokenInstruction: 'Fix the structure with the right materials.', screenReaderText: 'Apply appropriate repair materials and techniques to restore structural integrity.', objectiveType: 'build', hints: ['Use material stronger than what failed.', 'Reinforce the weak point.'], successResponse: 'Repaired and stronger than before!', failureResponse: 'The repair did not hold. We may need stronger material at the failure point.' },
      ],
      companionIntro: 'A storm damaged this structure, {playerName}. Let us repair it — better than before!',
      companionOutro: 'You did not just fix it, you improved it. Understanding failure leads to better design.',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'maintenance',
  },

  // ─── OPTIMIZE (improvement, efficiency) ───────────────────────────────────
  {
    id: 'tpl-optimize-route',
    name: 'Route Optimizer',
    mechanic: 'optimize',
    tier: ['builder', 'innovator'],
    biomes: ['explorers-map', 'trading-post'],
    skillSlots: [
      { role: 'primary', category: 'math.algebra', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Map all possible routes and calculate their costs.', spokenInstruction: 'Map every possible route and figure out the cost of each.', screenReaderText: 'Enumerate all possible routes and calculate the distance or resource cost for each.', objectiveType: 'measure', hints: ['Add up the distances for each path.', 'Sometimes the shortest route is not the cheapest.'], successResponse: 'All routes mapped and costed! Data is power.', failureResponse: 'There might be another route you missed. Check for paths between intermediate stops.' },
        { instruction: 'Choose the optimal route and explain why.', spokenInstruction: 'Pick the best route and explain your choice.', screenReaderText: 'Select the optimal route based on calculated costs and justify the choice.', objectiveType: 'interact', hints: ['Optimal means best for what you need — speed? Cost? Safety?', 'Explain the trade-offs.'], successResponse: 'Optimal route selected with clear reasoning!', failureResponse: 'Consider what optimal means in this context. What are we optimizing for?' },
      ],
      companionIntro: 'Many paths, one best choice, {playerName}. Let us find the optimal route!',
      companionOutro: 'Optimization is making the best choice with the information you have. Well done!',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'optimization',
  },

  // ─── COLLABORATE (teamwork, coordination) ──────────────────────────────────
  {
    id: 'tpl-collaborate-build',
    name: 'Team Build',
    mechanic: 'collaborate',
    tier: ['discovery', 'builder'],
    biomes: ['workshop', 'architects-domain'],
    skillSlots: [
      { role: 'primary', category: 'engineering.basics', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Divide the project into tasks that can be done simultaneously.', spokenInstruction: 'Break the project into parts that different people can work on at the same time.', screenReaderText: 'Divide the construction project into parallel tasks for efficient collaboration.', objectiveType: 'interact', hints: ['Some tasks depend on others — do those first.', 'Independent tasks can happen at the same time.'], successResponse: 'Great task division! Everyone has a role.', failureResponse: 'Some tasks might depend on others. Make sure the foundation is laid before the walls.' },
        { instruction: 'Coordinate the assembly and verify everything connects.', spokenInstruction: 'Bring all the parts together and make sure they fit.', screenReaderText: 'Coordinate assembly of all completed subtasks and verify connections.', objectiveType: 'build', hints: ['Communication is key.', 'Check that each piece fits with its neighbors.'], successResponse: 'Everything connects! Collaboration at its finest.', failureResponse: 'Some pieces do not quite fit. Let us communicate with the other builders.' },
      ],
      companionIntro: 'This project is too big for one person, {playerName}. Let us work together!',
      companionOutro: 'Together we built something none of us could have built alone. That is the power of collaboration.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'social',
  },

  // ─── Additional templates for mechanics not yet covered ───────────────────

  // EXPERIMENT (additional)
  {
    id: 'tpl-experiment-control',
    name: 'Control Group',
    mechanic: 'experiment',
    tier: ['builder', 'innovator'],
    biomes: ['alchemist-lab', 'healers-sanctuary'],
    skillSlots: [
      { role: 'primary', category: 'science.biology.basics', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Set up two identical tests — change only one variable in the second.', spokenInstruction: 'Set up two identical tests but change only one thing in the second.', screenReaderText: 'Create a controlled experiment with an experimental group and a control group.', objectiveType: 'interact', hints: ['Everything must be the same except the one thing you are testing.', 'The control group shows what normally happens.'], successResponse: 'Perfect experimental design! One variable, one difference.', failureResponse: 'More than one thing is different between the groups. Let us make them match better.' },
        { instruction: 'Compare results and draw a conclusion.', spokenInstruction: 'Compare both results. What does the difference tell us?', screenReaderText: 'Analyze the difference between control and experimental results to draw a conclusion.', objectiveType: 'observe', hints: ['The difference between the groups tells you the effect.', 'No difference means your variable did not matter.'], successResponse: 'Clear conclusion from solid evidence!', failureResponse: 'Think about what the difference — or lack of difference — actually means.' },
      ],
      companionIntro: 'Time for a proper experiment with controls, {playerName}!',
      companionOutro: 'You used a control group! That is how real scientists prove their ideas.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'science',
  },

  // COLLECT (additional)
  {
    id: 'tpl-collect-minerals',
    name: 'Mineral Hunter',
    mechanic: 'collect',
    tier: ['discovery', 'builder'],
    biomes: ['crystal-caverns'],
    skillSlots: [
      { role: 'primary', category: 'science.geology', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'math.sorting', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Collect five different mineral samples from the cave walls.', spokenInstruction: 'Find and collect five different minerals from the cave walls.', screenReaderText: 'Search cave walls for five distinct mineral samples, identifying each type.', objectiveType: 'collect', hints: ['Different minerals have different hardness, color, and luster.', 'Try the scratch test to tell them apart.'], successResponse: 'Five unique minerals! You have an eye for geology.', failureResponse: 'Some of those might be the same mineral. Check their properties more carefully.' },
        { instruction: 'Sort the minerals by hardness.', spokenInstruction: 'Now sort your minerals from softest to hardest.', screenReaderText: 'Arrange the collected mineral samples in order of Mohs hardness.', objectiveType: 'sort', hints: ['A harder mineral can scratch a softer one.', 'Try scratching each with a fingernail and a coin.'], successResponse: 'Perfectly ordered by hardness! Real mineralogy!', failureResponse: 'Try the scratch test between each pair. The order will become clear.' },
      ],
      companionIntro: 'The caves are full of minerals, {playerName}! Let us collect and classify them.',
      companionOutro: 'You classified minerals like a geologist. Mohs would be proud!',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'gathering',
  },

  // DECODE (additional)
  {
    id: 'tpl-decode-number',
    name: 'Number Code',
    mechanic: 'decode',
    tier: ['foundation', 'discovery'],
    biomes: ['crystal-caverns', 'ancient-ruins', 'observatory'],
    skillSlots: [
      { role: 'primary', category: 'math.patterns', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Find the pattern in the number sequence.', spokenInstruction: 'Look at these numbers. Can you see the pattern?', screenReaderText: 'Analyze a number sequence to identify the underlying mathematical pattern.', objectiveType: 'pattern', hints: ['Look at the difference between each number.', 'Is the pattern adding, multiplying, or something else?'], successResponse: 'You cracked the pattern! Mathematics is full of hidden order.', failureResponse: 'Try writing the differences between consecutive numbers. The pattern might appear.' },
      ],
      companionIntro: 'Numbers hide patterns, {playerName}! Let us decode this sequence.',
      companionOutro: 'Pattern recognition is one of the most powerful math skills. You have it!',
      estimatedMinutes: 5,
    },
    antiRepetitionCategory: 'patterns',
  },

  // PROTECT (additional)
  {
    id: 'tpl-protect-artifact',
    name: 'Artifact Preservation',
    mechanic: 'protect',
    tier: ['builder', 'innovator'],
    biomes: ['ancient-ruins', 'library-echoes'],
    skillSlots: [
      { role: 'primary', category: 'science.chemistry', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Identify what is damaging the artifact.', spokenInstruction: 'Figure out what is causing the artifact to deteriorate.', screenReaderText: 'Analyze the artifact to identify the chemical or environmental cause of degradation.', objectiveType: 'observe', hints: ['Is it moisture? Acidity? Oxidation?', 'The damage pattern tells you the cause.'], successResponse: 'You identified the threat! Now we can stop it.', failureResponse: 'Look at the type of damage more carefully. Is it chemical, physical, or biological?' },
        { instruction: 'Apply the right preservation technique.', spokenInstruction: 'Use the right technique to protect the artifact.', screenReaderText: 'Apply an appropriate chemical or physical preservation technique to halt degradation.', objectiveType: 'craft', hints: ['Neutralize acids with bases.', 'Control humidity for moisture damage.'], successResponse: 'The artifact is preserved! Future generations will see it too.', failureResponse: 'The preservation is not quite right. Match the technique to the damage type.' },
      ],
      companionIntro: 'This artifact is deteriorating, {playerName}. Can we save it with science?',
      companionOutro: 'You preserved history with chemistry. That is exactly what museum conservators do.',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'caretaking',
  },

  // TRANSFORM (additional)
  {
    id: 'tpl-transform-energy',
    name: 'Energy Transformer',
    mechanic: 'transform',
    tier: ['builder', 'innovator'],
    biomes: ['storm-tower', 'workshop'],
    skillSlots: [
      { role: 'primary', category: 'science.physics', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Convert one form of energy to another using the available device.', spokenInstruction: 'Use this device to convert one type of energy into another.', screenReaderText: 'Operate the device to transform energy from one form (kinetic, thermal, electrical) to another.', objectiveType: 'interact', hints: ['Generators convert motion to electricity.', 'Heaters convert electricity to heat.'], successResponse: 'Energy transformed! Conservation of energy in action.', failureResponse: 'The conversion is not complete. Check that energy is flowing through the device properly.' },
      ],
      companionIntro: 'Energy never disappears, {playerName}. It just changes form. Let us see it happen!',
      companionOutro: 'You transformed energy! The first law of thermodynamics — energy is conserved.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'physics',
  },

  // PREDICT (additional)
  {
    id: 'tpl-predict-growth',
    name: 'Growth Forecaster',
    mechanic: 'predict',
    tier: ['discovery', 'builder'],
    biomes: ['living-forest', 'healers-sanctuary'],
    skillSlots: [
      { role: 'primary', category: 'science.biology.basics', minLevel: 1, teaches: true },
      { role: 'secondary', category: 'math.patterns', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Observe the growth pattern and predict the next stage.', spokenInstruction: 'Watch how this organism is growing and predict what happens next.', screenReaderText: 'Analyze the growth pattern of an organism to predict its next developmental stage.', objectiveType: 'predict', hints: ['Look at how much it grew in each period.', 'Is the growth speeding up, slowing down, or constant?'], successResponse: 'Your prediction matches the growth perfectly!', failureResponse: 'Growth can be surprising! Let us look at the data more carefully.' },
      ],
      companionIntro: 'This organism is growing, {playerName}. Can you predict what happens next?',
      companionOutro: 'Predicting biological growth — you think like a biologist!',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'biology',
  },

  // REPAIR (additional)
  {
    id: 'tpl-repair-circuit',
    name: 'Circuit Fixer',
    mechanic: 'repair',
    tier: ['builder', 'innovator'],
    biomes: ['workshop', 'code-forge'],
    skillSlots: [
      { role: 'primary', category: 'engineering.circuits', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Trace the circuit to find the broken connection.', spokenInstruction: 'Follow the circuit path and find where it is broken.', screenReaderText: 'Trace the electrical circuit to locate the broken or disconnected component.', objectiveType: 'observe', hints: ['Electricity needs a complete path.', 'Check for burnt or disconnected components.'], successResponse: 'Found the break! Now we know what to fix.', failureResponse: 'Keep tracing. The break could be anywhere along the circuit.' },
        { instruction: 'Repair the connection and test the circuit.', spokenInstruction: 'Fix the connection and test if the circuit works.', screenReaderText: 'Repair the broken circuit connection and verify electrical flow.', objectiveType: 'build', hints: ['Make sure the connection is solid.', 'Test by checking if the output device works.'], successResponse: 'The circuit is complete! Electricity flows again.', failureResponse: 'Still no flow. Check that the repaired connection is making good contact.' },
      ],
      companionIntro: 'This circuit is dead, {playerName}. Let us find the break and fix it!',
      companionOutro: 'You repaired a circuit by understanding how electricity flows. Real engineering!',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'maintenance',
  },

  // OPTIMIZE (additional)
  {
    id: 'tpl-optimize-recipe',
    name: 'Recipe Optimizer',
    mechanic: 'optimize',
    tier: ['innovator', 'creator'],
    biomes: ['alchemist-lab'],
    skillSlots: [
      { role: 'primary', category: 'science.chemistry', minLevel: 3, teaches: true },
      { role: 'secondary', category: 'math.algebra', minLevel: 2, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Analyze the current recipe for inefficiencies.', spokenInstruction: 'Study the recipe and find where we could use less material for the same result.', screenReaderText: 'Analyze the chemical recipe to identify stoichiometric inefficiencies.', objectiveType: 'observe', hints: ['Are any reagents in excess?', 'Check the mole ratios against the balanced equation.'], successResponse: 'Inefficiency identified! Less waste is better science.', failureResponse: 'Check the balanced equation against the actual amounts used. Where is the mismatch?' },
        { instruction: 'Reformulate the recipe for maximum efficiency.', spokenInstruction: 'Rewrite the recipe to use exactly what we need and nothing more.', screenReaderText: 'Recalculate reagent quantities for optimal stoichiometric efficiency.', objectiveType: 'solve', hints: ['The balanced equation tells you the perfect ratio.', 'Scale everything proportionally.'], successResponse: 'Perfectly optimized! Zero waste chemistry.', failureResponse: 'The ratios are not quite right yet. Double-check the stoichiometry.' },
      ],
      companionIntro: 'This recipe works, but can we make it better, {playerName}? Less waste, same result!',
      companionOutro: 'Optimization is elegance. You found the most efficient path through chemistry.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'optimization',
  },

  // DESIGN (additional)
  {
    id: 'tpl-design-garden',
    name: 'Garden Architect',
    mechanic: 'design',
    tier: ['foundation', 'discovery'],
    biomes: ['living-forest', 'healers-sanctuary'],
    skillSlots: [
      { role: 'primary', category: 'science.biology.basics', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'math.shapes', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Choose plants that grow well together.', spokenInstruction: 'Pick plants that like to grow near each other.', screenReaderText: 'Select companion plants that benefit from proximity.', objectiveType: 'interact', hints: ['Some plants help each other grow.', 'Think about sunlight — tall plants shade short ones.'], successResponse: 'Great plant choices! They will thrive together.', failureResponse: 'These plants might compete. Let us think about what each one needs.' },
        { instruction: 'Arrange the garden to use the space well.', spokenInstruction: 'Arrange your garden so every plant gets what it needs.', screenReaderText: 'Design the garden layout optimizing space and sunlight for all plants.', objectiveType: 'place', hints: ['Tall plants go north so they do not shade shorter ones.', 'Leave enough space between each plant.'], successResponse: 'Beautiful garden design! Every plant has what it needs.', failureResponse: 'Some plants might not get enough light. Try rearranging the taller ones.' },
      ],
      companionIntro: 'Let us design a garden, {playerName}! Nature plus planning equals paradise.',
      companionOutro: 'A garden designed with biology and geometry. The Founders would love it!',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'creative',
  },

  // NEGOTIATE (additional)
  {
    id: 'tpl-negotiate-resources',
    name: 'Resource Diplomat',
    mechanic: 'negotiate',
    tier: ['builder', 'innovator'],
    biomes: ['trading-post', 'workshop'],
    skillSlots: [
      { role: 'primary', category: 'math.arithmetic', minLevel: 2, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Calculate the fair distribution of limited resources.', spokenInstruction: 'Figure out how to share these limited resources fairly.', screenReaderText: 'Calculate a mathematically fair distribution of limited resources among multiple parties.', objectiveType: 'solve', hints: ['Fair does not always mean equal.', 'Consider what each party needs most.'], successResponse: 'A fair distribution backed by math! Everyone gets what they need.', failureResponse: 'Someone is not getting enough. Recalculate based on needs, not just equal shares.' },
      ],
      companionIntro: 'Resources are limited, {playerName}. Let us figure out a fair way to share.',
      companionOutro: 'You solved a real-world problem with math and fairness. That is leadership.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'social',
  },

  // SEQUENCE (additional)
  {
    id: 'tpl-sequence-algorithm',
    name: 'Algorithm Designer',
    mechanic: 'sequence',
    tier: ['builder', 'innovator'],
    biomes: ['code-forge', 'workshop'],
    skillSlots: [
      { role: 'primary', category: 'engineering.basics', minLevel: 1, teaches: true },
      { role: 'secondary', category: 'math.patterns', minLevel: 1, teaches: false },
    ],
    structure: {
      steps: [
        { instruction: 'Put the instructions in the correct order to achieve the goal.', spokenInstruction: 'Arrange these instructions in the right order to solve the problem.', screenReaderText: 'Sequence a set of instructions into a correct algorithm that achieves the specified goal.', objectiveType: 'sequence', hints: ['What must happen first before other steps can work?', 'Some steps depend on the results of earlier steps.'], successResponse: 'The algorithm runs perfectly! Every step in the right order.', failureResponse: 'The algorithm did not produce the right result. Check which step depends on which.' },
      ],
      companionIntro: 'Computers follow exact orders, {playerName}. Let us get these steps right!',
      companionOutro: 'You built a working algorithm! Programming is just very precise sequencing.',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'programming',
  },

  // COMPARE (additional)
  {
    id: 'tpl-compare-ecosystems',
    name: 'Biome Comparison',
    mechanic: 'compare',
    tier: ['builder', 'innovator'],
    biomes: ['living-forest', 'crystal-caverns', 'storm-tower'],
    skillSlots: [
      { role: 'primary', category: 'science.biology.ecology', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'List the key features of each ecosystem.', spokenInstruction: 'What are the key features of each ecosystem?', screenReaderText: 'Document key features including climate, species, and resources in each ecosystem.', objectiveType: 'observe', hints: ['Temperature, moisture, and sunlight define an ecosystem.', 'What species live here and why?'], successResponse: 'Thorough feature lists! You see what makes each unique.', failureResponse: 'There are more features to consider. Think about what organisms need to survive.' },
        { instruction: 'Identify what is similar and what is different between them.', spokenInstruction: 'What do these ecosystems share and where are they different?', screenReaderText: 'Analyze similarities and differences between the documented ecosystems.', objectiveType: 'compare', hints: ['Some principles apply everywhere.', 'Differences often relate to energy sources and climate.'], successResponse: 'Excellent comparison! You see both the universal and the unique.', failureResponse: 'Look deeper at both the similarities and differences. What patterns do you see?' },
      ],
      companionIntro: 'Two ecosystems, {playerName}. What is the same? What is different?',
      companionOutro: 'Comparative ecology! Understanding differences reveals universal principles.',
      estimatedMinutes: 10,
    },
    antiRepetitionCategory: 'ecology',
  },

  // EXPLORE (additional)
  {
    id: 'tpl-explore-ruins',
    name: 'Ruin Explorer',
    mechanic: 'explore',
    tier: ['discovery', 'builder'],
    biomes: ['ancient-ruins'],
    skillSlots: [
      { role: 'primary', category: 'language.reading', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'science.observation', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Explore the ruins and find clues about who lived here.', spokenInstruction: 'Explore the ruins and find clues about who once lived here.', screenReaderText: 'Explore ancient ruins to discover archaeological clues about past inhabitants.', objectiveType: 'find', hints: ['Look for tool marks, pottery fragments, and inscriptions.', 'The layout of rooms tells a story about daily life.'], successResponse: 'Fascinating discoveries! Each artifact tells a story.', failureResponse: 'Keep looking carefully. Even small details can reveal big stories about the past.' },
        { instruction: 'Piece together what you found into a story about this place.', spokenInstruction: 'Use your clues to imagine what life was like here.', screenReaderText: 'Synthesize discovered artifacts into a narrative about the ruins\' former inhabitants.', objectiveType: 'teach', hints: ['What did they eat? How did they build? What did they value?', 'Think about the evidence, not just guesses.'], successResponse: 'A compelling story built from evidence! That is how archaeology works.', failureResponse: 'Think about what each clue tells us. What would someone need these things for?' },
      ],
      companionIntro: 'Ancient ruins, {playerName}! Every stone has a story. Let us find them!',
      companionOutro: 'You reconstructed history from evidence. A true archaeologist in the making!',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'exploration',
  },

  // SORT (additional)
  {
    id: 'tpl-sort-timeline',
    name: 'History Sorter',
    mechanic: 'sort',
    tier: ['discovery', 'builder'],
    biomes: ['ancient-ruins', 'time-rift', 'library-echoes'],
    skillSlots: [
      { role: 'primary', category: 'language.reading', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Sort the historical artifacts from oldest to newest.', spokenInstruction: 'Sort these artifacts from the oldest to the newest.', screenReaderText: 'Arrange historical artifacts in chronological order from oldest to most recent.', objectiveType: 'sort', hints: ['Look at the style of writing and tools used.', 'Older civilizations used simpler materials.'], successResponse: 'Perfectly sorted through time! You have an eye for history.', failureResponse: 'A couple might be switched. Think about which technologies came first.' },
      ],
      companionIntro: 'When were these made, {playerName}? Let us sort them through time!',
      companionOutro: 'You ordered history! Understanding sequence reveals how civilizations evolve.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'ordering',
  },

  // BUILD (additional)
  {
    id: 'tpl-build-waterwheel',
    name: 'Waterwheel Engineer',
    mechanic: 'build',
    tier: ['discovery', 'builder'],
    biomes: ['workshop', 'living-forest'],
    skillSlots: [
      { role: 'primary', category: 'engineering.basics', minLevel: 1, teaches: true },
      { role: 'secondary', category: 'science.physics', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Measure the water flow to determine the wheel size.', spokenInstruction: 'Measure how fast the water flows to figure out how big the wheel should be.', screenReaderText: 'Measure water flow rate to calculate appropriate waterwheel dimensions.', objectiveType: 'measure', hints: ['Faster water can turn a bigger wheel.', 'Width and depth of the stream both matter.'], successResponse: 'Good measurements! You know the power available.', failureResponse: 'Try measuring both the speed and volume of water. Both affect wheel size.' },
        { instruction: 'Build a waterwheel that harnesses the flow.', spokenInstruction: 'Build a waterwheel that catches the water and turns.', screenReaderText: 'Construct a waterwheel sized to efficiently harness the measured water flow.', objectiveType: 'build', hints: ['Paddles should face into the current.', 'The axle must be strong enough to handle the torque.'], successResponse: 'The wheel turns! Kinetic energy from water — renewable power!', failureResponse: 'The wheel is not catching enough water. Try adjusting the paddle angle.' },
      ],
      companionIntro: 'Running water is free energy, {playerName}! Let us build something to capture it.',
      companionOutro: 'A working waterwheel! Humans have been doing this for thousands of years.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'construction',
  },

  // OBSERVE (additional)
  {
    id: 'tpl-observe-insects',
    name: 'Insect Observer',
    mechanic: 'observe',
    tier: ['foundation', 'discovery'],
    biomes: ['living-forest', 'healers-sanctuary'],
    skillSlots: [
      { role: 'primary', category: 'science.biology.basics', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'math.counting', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Sit quietly and count how many different insect species you can see.', spokenInstruction: 'Sit quietly and count how many different kinds of insects you can see.', screenReaderText: 'Observe the immediate area quietly and count distinct insect species visible.', objectiveType: 'observe', hints: ['Stay very still and they will come out.', 'Look on leaves, under rocks, and near flowers.'], successResponse: 'So many species in one small area! Biodiversity is everywhere.', failureResponse: 'Try sitting even more still. Insects are shy but they are definitely here.' },
      ],
      companionIntro: 'Let us be very quiet, {playerName}. The tiniest creatures have the biggest stories.',
      companionOutro: 'Patient observation reveals a whole world we usually miss. Real science starts here!',
      estimatedMinutes: 6,
    },
    antiRepetitionCategory: 'observation',
  },

  // COLLABORATE (additional)
  {
    id: 'tpl-collaborate-research',
    name: 'Research Partners',
    mechanic: 'collaborate',
    tier: ['builder', 'innovator'],
    biomes: ['library-echoes', 'observatory'],
    skillSlots: [
      { role: 'primary', category: 'language.reading', minLevel: 1, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Divide the research topic into parts each person can explore.', spokenInstruction: 'Split the research topic so each of us can explore a different part.', screenReaderText: 'Divide a research question into subtopics for parallel investigation.', objectiveType: 'interact', hints: ['Break the big question into smaller questions.', 'Each person should focus on their strengths.'], successResponse: 'Well-divided research plan! Every part will be covered.', failureResponse: 'Some parts overlap. Try making each subtopic more specific.' },
        { instruction: 'Share findings and synthesize a complete answer.', spokenInstruction: 'Share what you found and put it all together.', screenReaderText: 'Present individual findings and collaboratively synthesize a comprehensive answer.', objectiveType: 'teach', hints: ['Listen to what others found — it may change your understanding.', 'The whole is greater than the sum of parts.'], successResponse: 'A complete picture from everyone\'s contributions! This is how real research works.', failureResponse: 'Some pieces do not fit together yet. Let us discuss where our findings connect.' },
      ],
      companionIntro: 'This question is too big for one mind, {playerName}. Let us research together!',
      companionOutro: 'Collaborative research — every great discovery has been a team effort.',
      estimatedMinutes: 12,
    },
    antiRepetitionCategory: 'social',
  },

  // NAVIGATE (additional)
  {
    id: 'tpl-navigate-forest',
    name: 'Forest Pathfinder',
    mechanic: 'navigate',
    tier: ['foundation', 'discovery'],
    biomes: ['living-forest'],
    skillSlots: [
      { role: 'primary', category: 'spatial.directions', minLevel: 0, teaches: true },
      { role: 'secondary', category: 'science.observation', minLevel: 0, teaches: true },
    ],
    structure: {
      steps: [
        { instruction: 'Use natural landmarks to find your way to the clearing.', spokenInstruction: 'Use the things around you — trees, rocks, the sun — to find the clearing.', screenReaderText: 'Navigate to a forest clearing by using natural landmarks like trees, rocks, and sun position.', objectiveType: 'navigate', hints: ['The sun rises in the east and sets in the west.', 'Moss often grows on the shady side of trees.'], successResponse: 'You found the clearing using nature as your guide!', failureResponse: 'This path doubled back. Try using the sun to keep your direction consistent.' },
      ],
      companionIntro: 'No map needed, {playerName}! Nature gives us all the directions we need.',
      companionOutro: 'You navigated by nature! People have found their way like this for thousands of years.',
      estimatedMinutes: 8,
    },
    antiRepetitionCategory: 'navigation',
  },
];

/** Get a quest template by ID */
export function getQuestTemplate(id: string): QuestTemplate | undefined {
  return QUEST_TEMPLATES.find(t => t.id === id);
}

/** Get all templates for a specific mechanic */
export function templatesForMechanic(mechanic: string): readonly QuestTemplate[] {
  return QUEST_TEMPLATES.filter(t => t.mechanic === mechanic);
}

/** Get all templates valid for a specific tier */
export function templatesForTier(tier: string): readonly QuestTemplate[] {
  return QUEST_TEMPLATES.filter(t => t.tier.includes(tier as QuestTemplate['tier'][number]));
}

/** Get all templates valid for a specific biome (or 'any') */
export function templatesForBiome(biome: string): readonly QuestTemplate[] {
  return QUEST_TEMPLATES.filter(t => t.biomes.includes('any') || t.biomes.includes(biome));
}
