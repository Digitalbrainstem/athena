# 02 — World Design

> The Nexus is an infinite, adaptive open world that reshapes itself around each player.
> There is no fixed map. Biomes emerge based on the player's interests, progress,
> engagement, and choices. The world IS the curriculum — every environment teaches
> through its mechanics, resources, challenges, and physics. This document covers the
> world structure, biomes, morphing rules, procedural generation, and environment design.

---

## Core Concept

The Nexus is not a theme park with learning stations. It's a living world where knowledge
is woven into the fabric of reality. The world generates environments based on:

- **Player interests** — selected at start, evolves based on behavior over time
- **Player progress** — new areas unlock as skills develop, existing areas deepen
- **Player engagement** — bored? the world changes. In flow? it deepens
- **Player choices** — explore a cave → underground theme. Find a telescope → space theme
- **Player age tier** — world complexity scales with cognitive development

The world looks and feels different for every player. Two 10-year-olds starting on the
same day will have entirely different experiences within an hour. One might be exploring
crystal caves, the other building ships at the coast. Both are learning the same core
math — but through the context they chose.

---

## Biomes

Every biome is a **learning context** — a themed environment where specific subjects
emerge naturally from the setting, characters, resources, and challenges.

### Complete Biome List

| Biome | Primary Subjects | Description |
|-------|-----------------|-------------|
| **The Workshop** | Engineering, Math, Physics | A maker's paradise. Workbenches, tools, raw materials. Build machines, design circuits, test prototypes. Everything from simple levers (age 5) to automated factories (age 18). |
| **The Alchemist's Lab** | Chemistry, Biology | Shelves of ingredients, bubbling cauldrons, growing racks. Craft potions with real stoichiometry, grow plants with real biology, mix compounds and observe real reactions. |
| **The Observatory** | Astronomy, Physics, Math | A mountain-top telescope station. Navigate by stars, calculate orbits, understand light spectra, track celestial events. Gateway to space exploration. |
| **The Ancient Ruins** | History, Archaeology, Language | Crumbling structures from a lost civilization. Decode inscriptions, piece together timelines, excavate artifacts, reconstruct languages from fragments. |
| **The Living Forest** | Biology, Ecology, Earth Science | A thriving ecosystem. Manage food chains, classify species, observe weather patterns, understand seasonal cycles. Interventions have cascading consequences. |
| **The Trading Post** | Economics, Math, Social Studies | A busy market hub. Supply and demand drive prices. Negotiate deals, manage currency, track market trends, invest in ventures. |
| **The Architect's Domain** | Geometry, Engineering, Art | A city of grand structures. Design buildings with load-bearing calculations, tessellate surfaces, create symmetrical patterns, plan urban layouts. |
| **The Code Forge** | Computer Science, Logic | A hall of programmable machines. Write code to control robots, automate mining, sort logistics, decrypt messages, build communication networks. |
| **The Healer's Sanctuary** | Biology, Chemistry, Medicine | A place of restoration. Anatomy studies, first aid practice, pharmacology (age-appropriate), disease diagnosis, nutrition science. |
| **The Explorer's Map** | Geography, Navigation, Culture | A cartographer's base. World travel, coordinate systems, cultural encounters, language sampling, climate analysis, terrain mapping. |
| **The Time Rift** | History, Cause & Effect | A shimmering portal to the past. Visit historical periods, witness pivotal events, make decisions, see consequences ripple forward through time. |
| **The Crystal Caverns** | Geology, Chemistry, Math | Glittering underground chambers. Mineral classification, crystal lattice structures, mining mathematics, cave geometry, underground rivers. |
| **The Storm Tower** | Physics, Weather, Energy | A tower piercing the clouds. Electricity experiments, magnetism puzzles, renewable energy design, weather prediction, atmospheric science. |
| **The Library of Echoes** | Language Arts, Literature, Writing | An infinite library where stories whisper. Reading comprehension, creative writing, vocabulary through context, rhetoric, literary analysis. |
| **The Arena** | Strategy, Game Theory, Logic | A colosseum of the mind. Logic puzzles, probability challenges, strategic thinking, pattern recognition, competitive and cooperative games. |
| **The Shipyard** | Engineering, Physics, Chemistry | Docks and drydocks. Build vehicles from carts to starships. Fuel chemistry, propulsion physics, structural engineering, navigation systems. See [03-TRAVEL_MECHANICS.md](03-TRAVEL_MECHANICS.md). |
| **The Music Hall** | Music Theory, Physics, Math | A grand concert hall. Instrument crafting, acoustic design, harmony and melody, rhythm mathematics, sound wave physics. |
| **The Gallery** | Art, Design, Math, History | A creative studio and museum. Perspective drawing, color theory, symmetry, art history periods, design principles, visual storytelling. |

### Dynamic Biomes

Atlas can generate new biomes between sessions based on player interest. If a player
is fascinated by volcanoes, a **Volcanic Forge** biome emerges — combining geology,
thermodynamics, materials science, and chemistry in a lava-filled landscape. If they
love the ocean, a **Deep Reef** biome appears with marine biology, fluid dynamics,
and underwater engineering.

Dynamic biomes follow the same rules as core biomes: every element teaches something
real, and the subjects emerge from the environment naturally.

---

## Interest-Driven Theming

The world doesn't just adapt to what the player does — it adapts to what the player
LOVES. This is the most important world-shaping system in the game, and it follows
one absolute rule: **interests are detected by behavior, never asked or assumed.**

### How Interest Detection Works

The game watches what the player actually does:

| Signal | What It Means | World Response |
|--------|--------------|---------------|
| Player spends extra time in the Living Forest | Loves animals/nature | More wildlife encounters, animal companions, veterinary quests |
| Player keeps picking up crystals and shiny objects | Loves sparkly/beautiful things | Crystal Caverns expand, aurora landscapes appear, fairy gardens grow |
| Player builds machines whenever possible | Loves engineering/making | Workshop biome deepens, robotics workshop appears, factories unlock |
| Player always chooses space-related options | Loves space | Observatory expands, star maps appear, rocket building opportunities increase |
| Player decorates everything and picks colors carefully | Loves art/design | Gallery biome grows, design quests appear, world becomes more colorful |
| Player keeps visiting the Trading Post | Loves social/economic systems | Market expands, complex trade routes appear, NPC stories deepen |
| Player breeds creatures and builds habitats | Loves animals/caretaking | Farm biome appears, animal rescue quests, ecosystem management deepens |

### The Rules (Non-Negotiable)

1. **The game NEVER asks "are you a boy or girl?"** — it watches what the player DOES.
   No gender field. No demographic questions. No assumptions from name or avatar choice.

2. **There are no "boy themes" or "girl themes."** Robots are not "for boys." Sparkles
   are not "for girls." Space is not masculine. Art is not feminine. The game treats
   every interest as equally valid, equally supported, and equally available.

3. **Interests are detected by behavior ONLY.** What the player interacts with. What
   they linger on. What they choose when given options. What they return to. What
   makes them engage more deeply. Never by any demographic proxy.

4. **The player can change direction AT ANY TIME.** If a player who's been building
   machines for months suddenly picks up a paintbrush, the world starts adding art
   studios nearby. If a player who's been tending a garden suddenly looks at the stars,
   a telescope appears. The world follows the player, always.

5. **Themes BLEND.** The world doesn't lock into one theme. A player can have:
   - Crystal caves WITH robots
   - Farms WITH spaceships
   - Pink sparkly workshops where you build engines
   - A fairy garden with a rocket launch pad
   - Any combination the player's behavior suggests

6. **The learning content is IDENTICAL regardless of theme.** Counting farm animals =
   counting crystals = counting stars = counting robot parts. The math is the same. The
   chemistry is the same. The physics is the same. Only the wrapper changes. No player
   gets easier or harder content because of their theme preference.

### Interest-Themed World Examples

**A player who gravitates toward animals:**
```
World evolves:
  Village → gets a farm with baby animals to raise
  Living Forest → becomes central, expands with new species
  Healer's Sanctuary → shifts toward veterinary medicine
  Trading Post → becomes an animal market with breeding genetics
  
Counting quest: "How many chicks hatched this morning?"
Fractions quest: "The horse feed is ¾ oats, ¼ barley. Mix 20 kg."
Chemistry quest: "The sick puppy needs medicine. What's the dosage per kg?"
Physics quest: "Build a birdhouse. Will the branch hold the weight?"
```

**A player who loves pink, sparkly, beautiful things:**
```
World evolves:
  Crystal Caverns → become central, expand with gem types
  Gallery → grows, full of color and light
  Aurora landscapes appear at biome boundaries
  Fairy gardens bloom with bioluminescent plants
  
Counting quest: "How many pink crystals? How many purple?"
Fractions quest: "Mix ⅓ ruby dust + ⅔ diamond dust for the rose gem."
Chemistry quest: "Why do these crystals glow? It's a chemical reaction!"
Physics quest: "Angle the prism to split light into a rainbow."
```

**A player who loves machines and building:**
```
World evolves:
  Workshop → expands with new stations and tools
  Code Forge → grows adjacent to the Workshop
  Factories and assembly lines appear
  Robotics workshop unlocks
  
Counting quest: "How many gears in the machine?"
Fractions quest: "The blueprint says ⅝ inch bolts. Which drawer?"
Chemistry quest: "What metal alloy is strongest? Mix and test."
Physics quest: "The crane arm needs to lift 500 kg. Counterweight?"
```

**A player who loves space:**
```
World evolves:
  Observatory → becomes central, expands with new instruments
  Shipyard → grows with rocket components
  Star maps and navigation tools appear everywhere
  Night sky becomes rich with identifiable constellations
  
Counting quest: "How many moons does this planet have?"
Fractions quest: "The fuel tank is ¾ full. How many km can we go?"
Chemistry quest: "Synthesize rocket fuel. What ratio of hydrogen to oxygen?"
Physics quest: "Calculate orbital velocity to stay above the planet."
```

### When Interests Evolve

Children's interests change — sometimes rapidly. The world handles this gracefully:

- **Short-term interest:** Player spends one session looking at animals → a few
  animals appear nearby. No permanent world change. If they don't return to animals,
  the additions fade naturally.
- **Medium-term interest:** Player engages with animals across 3-5 sessions → the
  Living Forest expands, animal quests appear. Reversible if interest shifts.
- **Long-term interest:** Player consistently engages with animals for weeks → the
  world has a strong animal/nature theme. Still reversible, but changes gradually.
- **Interest blending:** Player loves BOTH animals AND machines → animal-themed
  machines appear (automated feeders, habitat climate control, veterinary equipment).

Atlas (when connected) handles interest tracking between sessions. In standalone mode
(see [08-ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md)), the built-in interest tracker
uses simpler heuristics (time in biome, interaction frequency, choice patterns) to
approximate the same behavior.

---

## Biome Detail: How Subjects Emerge

Biomes don't "contain lessons." They contain **situations** where knowledge is required.

### Example: The Alchemist's Lab

**Setting:** A cluttered lab with shelves of labeled ingredients, a central workbench
with scales and measuring tools, bubbling containers, a garden alcove for growing plants,
and a reference shelf of element samples.

**What happens here (by tier):**

**Little Learner (2–5):**
- Mix colors: "Put the RED liquid and the BLUE liquid together — what color?"
- Count ingredients: "The recipe needs 3 mushrooms. Let's count them!"
- Sort by property: "Which bottles are cold? Which are warm?"
- Grow flowers: "Plant the seed, water it, wait — it's growing!"

**Explorer (6–10):**
- Simple recipes: "Mix 2 parts water + 1 part salt. Stir. What happens?"
- Temperature experiments: "Heat the ice. What happens at each stage?"
- Plant biology: "This plant needs sunlight and water. What happens without light?"
- Measurement: "The recipe says 250 ml. This beaker shows 100 ml. How many times?"

**Adventurer (11–14):**
- Stoichiometry: "2H₂ + O₂ → 2H₂O. You have 6 mol of hydrogen. How much oxygen?"
- pH and acids/bases: "The lake water is pH 4. How much base to reach pH 7?"
- Genetics: "Cross red-flower and white-flower plants. Predict the offspring colors."
- Conservation of mass: "Reactants weigh 50g. Products weigh 48g. Where did 2g go?"

**Scholar (15–18):**
- Equilibrium: "Le Chatelier's principle — add more reactant, which way does equilibrium shift?"
- Organic chemistry: "Synthesize aspirin. What functional groups are involved?"
- Enzyme kinetics: "The reaction rate peaks at 37°C. Why? Model it."
- Thermodynamics: "Is this reaction exothermic or endothermic? Calculate ΔH."

**Master (18–24):**
- Biochemistry: "The protein misfolded. Analyze the amino acid sequence. Find the error."
- Quantum chemistry: "Place electrons in orbitals. Predict the molecule's reactivity."
- Analytical chemistry: "Identify the unknown compound using spectroscopy data."
- Research design: "Design an experiment to test this hypothesis. Controls? Variables?"

---

## World Morphing

The world is not static. It transforms based on player actions, creating seamless
transitions between learning contexts.

### Morphing Rules

1. **Transitions are gradual.** The forest slowly thins into desert — no hard borders.
   As the player walks, the environment shifts over dozens of steps, not instantly.

2. **Player choices drive morphing.** Pick up a telescope → the Observatory biome
   emerges over the next few play sessions. Start building machines → the Workshop
   expands. Atlas fine-tunes between sessions (see [08-ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md)).

3. **Every morph is reversible.** The player can always find their way back. Nothing
   is permanently lost. Built structures persist even when the surrounding biome changes.

4. **Morphing respects player investment.** The workshop the player built doesn't
   vanish. Their garden still grows. Their structures still stand. The world morphs
   around what the player has created.

5. **Multi-biome blending.** Transition zones mix subjects naturally: where the Living
   Forest meets the Alchemist's Lab, you find medicinal plants. Where the Workshop
   meets the Storm Tower, you find electrical engineering.

### Morphing Example Flow

1. Player is exploring a dungeon (math/logic puzzles to unlock doors)
2. They find an **ancient, broken spaceship** buried in a cavern
3. Companion: "This ship looks ancient… but the controls still glow. Want to try fixing it?"
4. Player says yes → world gradually shifts toward **space exploration**
5. Fixing the ship requires: physics (thrust calculations), chemistry (fuel synthesis), math (trajectory)
6. Once flying, they discover a space station → the Shipyard biome unlocks
7. If they lose interest in space → a portal back appears, or they discover a planet with forests (biology biome)
8. The dungeon they started in? Still there. Still accessible. But the world has grown.

### Boredom Detection

The game monitors engagement in real-time (logged for Atlas to analyze between sessions):

| Signal | Detection | Response |
|--------|-----------|----------|
| Repeated failures, same approach | Player stuck in a loop | Companion offers a hint. If ignored, offers a different activity. |
| Rapid random input | Engagement dropped | Surprise event: earthquake, discovery, visitor, unusual weather |
| Long idle (30s+) | Distracted or thinking | Companion checks in gently: "Still thinking? No rush." |
| Very long idle (2min+) | Left the game | "I'll be right here when you get back!" (auto-save) |
| Tasks completed too fast | Under-challenged | Difficulty escalates immediately. Impossible challenge inserted. |
| Same biome, no exploration | Comfort zone | Companion mentions a new discovery in another biome |
| Avoidance of specific subjects | Potential gap or dislike | Atlas logs it, creates appealing entry point between sessions |

---

## Environment Physics

The world uses real physics, simplified per age tier but always honest.

### Physics Tiers

| Tier | Physics Level | Examples |
|------|-------------|---------|
| Little Learner | Intuitive | Things fall down. Heavy things are harder to push. Water flows downhill. |
| Explorer | Qualitative | Larger forces move heavier objects. Bridges need support. Heat melts ice. |
| Adventurer | Quantitative basics | F=ma for simple cases. Buoyancy calculations. Ohm's law in circuits. |
| Scholar | Full Newtonian + intro modern | Vector forces, torque, wave equations, basic E&M, thermodynamics. |
| Master | Advanced | Quantum mechanics, statistical mechanics, relativity in space travel. |

The same bridge exists at all tiers. A Little Learner builds with big blocks and learns
"triangles are strong." A Scholar calculates the stress tensor and moment of inertia.
The physics engine scales its feedback — simple animations for kids, numerical output
and graphs for advanced players.

### Chemistry Rules

All chemistry in the game follows real rules:

- **Conservation of mass** — always enforced
- **Real formulas** — H₂O, NaCl, C₆H₁₂O₆ are the actual compounds
- **Balanced equations** — required at Adventurer tier and above
- **Energy changes** — exothermic/endothermic reactions behave correctly
- **Phase changes** — accurate melting/boiling points (simplified labels for young players)

At Little Learner tier, chemistry presents as "mixing colors" and "making things hot
or cold." The underlying system is the same — it's just displayed differently.

### Ecology Rules

The Living Forest and other biological biomes follow real ecological principles:

- **Food chains** — remove a predator and prey populations explode
- **Carrying capacity** — overpopulation leads to resource depletion
- **Symbiosis** — mutualism, commensalism, parasitism all modeled
- **Succession** — disturbed areas recover through predictable stages
- **Weather effects** — drought, flood, fire all affect the ecosystem

At Explorer tier, this manifests as "the rabbits ate all the plants because the foxes
disappeared." At Scholar tier, the same system produces population differential equations
and predator-prey models (Lotka-Volterra).

---

## World Scale

The world expands as the player progresses. See [03-TRAVEL_MECHANICS.md](03-TRAVEL_MECHANICS.md)
for the full travel system. Here's the world-scale overview:

| Stage | Scope | Age Tier | Size Feel |
|-------|-------|----------|-----------|
| Local | Village, garden, companion's home | Little Learner | A single neighborhood — cozy, safe |
| Regional | Multiple biomes, paths between them | Explorer | A small country — days of exploration |
| Continental | Oceans, continents, diverse climates | Adventurer | An entire world — weeks of travel |
| Planetary | Atmosphere, orbit, global features | Scholar | A planet seen from space — awe-inspiring |
| Interplanetary | Moons, planets, asteroid belt | Scholar–Master | A solar system — vast and humbling |
| Interstellar | Other star systems, nebulae, deep space | Master | A galaxy — the final frontier |

Each scale increase requires genuinely deeper knowledge to navigate, survive, and thrive.
The world doesn't just get bigger — it gets more scientifically complex.

---

## Procedural Generation

### World Seed

Each player's world has a unique seed, ensuring no two players have the same layout.
The seed determines:

- Biome placement and adjacency
- Terrain features (mountains, rivers, caves)
- Resource distribution
- NPC locations and personalities
- Starting conditions

Atlas modifies the world between sessions by adjusting the generation parameters without
changing the seed — so the world evolves but stays consistent with the player's experience.

### Chunk System

The world is built from **biome chunks** — modular, tileable pieces that assemble into
a seamless environment. Each chunk contains:

- Terrain data (heightmap, textures, water features)
- Interactable objects (items, NPCs, structures, puzzles)
- Quest entry points (triggers that start quests when approached)
- Ambient audio profile (unique soundscape per biome — see [17-AUDIO_DESIGN.md](17-AUDIO_DESIGN.md))
- Connections to adjacent chunks (seamless borders)

Chunks are pre-generated by Atlas and cached. The client loads chunks dynamically as the
player moves, streaming terrain and objects from local cache or server.

### Blending Zones

Where two biomes meet, a blending zone creates a unique hybrid environment:

| Biome A | Biome B | Blending Zone | Subjects |
|---------|---------|--------------|----------|
| Living Forest | Alchemist's Lab | Medicinal herb garden | Biology + Chemistry |
| Workshop | Storm Tower | Electrical workshop | Engineering + E&M |
| Crystal Caverns | Observatory | Underground telescope chamber | Geology + Astronomy |
| Trading Post | Ancient Ruins | Artifact auction house | Economics + History |
| Code Forge | Shipyard | Automated shipyard | CS + Engineering |
| Music Hall | Storm Tower | Lightning organ | Music + Physics |

Blending zones are where some of the richest cross-subject learning happens, because the
player must combine knowledge from two domains simultaneously.

---

## Time and Weather

### Day/Night Cycle

The world has a day/night cycle (accelerated — roughly 20 minutes real time per game day).
Time affects gameplay:

- **Daytime:** Most biomes fully active, good visibility, NPC schedules
- **Night:** Observatory becomes most useful, nocturnal creatures emerge, firelight mechanics
- **Seasons:** Affect the Living Forest, Trading Post (seasonal goods), weather patterns

### Weather System

Weather is physics-based and educational:

| Weather | Educational Content | Example Gameplay |
|---------|-------------------|------------------|
| Rain | Water cycle, erosion | "The river is rising. How fast? When does it flood?" |
| Snow | Phase changes, insulation | "Build a shelter. How does insulation work?" |
| Thunderstorm | Electricity, sound/light speed | "Lightning! Count the seconds to thunder. How far away?" |
| Wind | Forces, pressure, renewable energy | "Angle the windmill blades. More wind = more power?" |
| Fog | Light scattering, navigation | "Can't see the path. Use compass and distance calculation." |
| Eclipse | Orbital mechanics, geometry | "The moon is passing in front of the sun. Predict the duration." |

Weather at Little Learner tier is simple and friendly — "It's raining! The flowers are
happy!" At Scholar tier, the same rain involves calculating precipitation rates, erosion
coefficients, and flood modeling.

---

## World Persistence

Everything the player builds persists:

- **Structures** remain exactly where placed and in the condition left
- **Gardens** continue growing between sessions (companion reports on changes)
- **Machines** continue running if left powered
- **Economy** evolves based on player choices (and Atlas adjustments)
- **Ecosystem** changes based on interventions (remove a species, observe consequences)

This persistence creates ownership and investment. The player cares about their world
because it's truly theirs — shaped by every choice they've made.

---

## Research Required

Before building against this document, complete the following research:

- [ ] **Procedural world generation** — Study No Man's Sky's biome generation (GDC talks by Sean Murray), Minecraft chunk loading, and Houdini procedural workflows. Identify algorithms suitable for educational biome generation in Three.js.
- [ ] **Interest detection systems** — Research recommendation engine approaches (collaborative filtering, content-based filtering) adapted for behavior tracking without demographic data. Study how Spotify Discover Weekly works as a model for interest-driven content.
- [ ] **Child interest research** — Review developmental psychology research on how children's interests form and evolve (Renninger & Hidi's "The Power of Interest"). Understand how interests differ from preferences and how to avoid stereotyping.
- [ ] **Dynamic difficulty in open worlds** — Study how Skyrim, Breath of the Wild, and Witcher 3 handle level scaling. Identify approaches that feel natural vs. "rubber-banding."
- [ ] **Biome-based learning environments** — Review research on contextual learning and situated cognition (Lave & Wenger). How does the learning environment affect retention and transfer?
- [ ] **Ecological modeling for games** — Research simplified ecological simulations suitable for real-time gameplay (Lotka-Volterra for Explorer tier, agent-based models for Scholar tier). Review Ecosystem games (Eco by Strange Loop Games).

---

*Previous: [01-VISION.md](01-VISION.md) — Vision and design pillars.*
*Next: [03-TRAVEL_MECHANICS.md](03-TRAVEL_MECHANICS.md) — How travel expands from walking to FTL.*
