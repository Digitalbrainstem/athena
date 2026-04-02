# Nexus Academy — Game Design Document

> *"The OASIS school from Ready Player One, but real."*
> An open-world adaptive learning game for ages 2–24.
> Powered by Atlas. Built by Digital Brainstem.

**Version:** 1.0
**Date:** July 2025
**Author:** Derek Thomas + Atlas Copilot

---

## 1. Vision Statement

Nexus Academy is an open-world game where **playing IS learning**. The player never
takes a test. They never write an essay. They never answer a pop quiz. They explore,
build, craft, solve, discover, and adventure — and in doing so, they master everything
from counting to calculus, from colors to chemistry, from letters to linear algebra.

The game world adapts to the player's interests. Love space? You'll be calculating
orbital trajectories. Love fantasy? You'll be mixing potions using stoichiometry.
Love building? You'll be designing circuits and structures. Love stories? You'll be
decoding ancient languages and writing quest logs that other explorers read. The
learning happens because the gameplay **requires** it — not because we bolted a quiz
onto a game.

Atlas doesn't run the game. Atlas is the **architect** — it reshapes the world between
sessions, personalizes quest lines, detects boredom, identifies knowledge gaps, and
ensures the player is always in the sweet spot between "I can do this" and "this is
challenging." The game itself runs standalone — no LLM needed during play.

**The core promise:** A child who plays Nexus Academy for 10 years will have mastered
the equivalent of a college education — not because they studied, but because the
world demanded it of them.

### Design Pillars

1. **Knowledge is the only currency.** No microtransactions. No pay-to-play. No loot
   boxes. No ads. No premium tiers. Ever. This is a gift to the world.

2. **The game never feels like school.** No grades. No report cards visible to the
   player. No "you got 7 out of 10." The world simply responds — build something
   wrong and it falls down. Mix chemicals wrong and you get smoke instead of potion.

3. **Every mechanic teaches something real.** If a crafting recipe exists, it uses real
   chemistry. If a building stands, it uses real physics. If an economy runs, it uses
   real economics. Nothing is fake. Nothing is simplified past the point of truth.

4. **The world grows with the player.** A 3-year-old and a 20-year-old play the same
   game — but the world is unrecognizably different for each. The transition between
   age tiers is seamless. The player never notices the world growing up with them.

5. **Gender-neutral, universal, inclusive.** No "boy" or "girl" paths. No assumptions.
   No stereotypes. All content available to all players. Interests tracked by behavior,
   never by demographics.

---

## 2. References & Inspiration

| Source | What We Take From It |
|--------|---------------------|
| **Ready Player One** (book) | The OASIS school — a virtual world IS the classroom. Parzival learns because the world demands it. |
| **Ender's Game** | The Mind Game — adapts psychologically. The "impossible game" that's secretly evaluating you. The Battle Room — learn by doing under pressure. |
| **Dora the Explorer / Blue's Clues** | For ages 2–5: character talks TO the player, asks for help, celebrates success. Breaks the fourth wall. The pause-and-wait technique. |
| **Minecraft** | Open world, crafting, building — accidentally teaches geometry, resource management, planning. Player agency above all. |
| **Prodigy** | Kids do 50 math problems per session because they're "battling monsters." They BEG to play. But Nexus goes further — no quiz-style questions at all. |
| **Kerbal Space Program** | Accidentally teaches orbital mechanics because the gameplay demands it. The gold standard for learning-through-simulation. |
| **No Man's Sky** | Procedurally generated worlds — every player's experience is different. Sense of infinite exploration. |
| **Zelda: Tears of the Kingdom** | Building/crafting system where physics IS the gameplay. Emergent solutions. |
| **Zelda: Breath of the Wild** | Art style that scales from playful to breathtaking. Weather and physics as gameplay systems. |
| **Journey** (thatgamecompany) | Wordless communication, emotional storytelling, companion bonding. |
| **Monument Valley** | Geometric puzzles as art. Beautiful, calm, contemplative gameplay suitable for all ages. |
| **Spiderverse** (film) | Stylized rendering that is MORE expressive than realism. Art direction that makes you feel something. |

---

## 3. The World — "The Nexus"

### 3.1 Core Concept

The Nexus is an **infinite, adaptive open world** that reshapes itself around the player.
There is no fixed map. The world generates environments based on:

- **Player's interests** — picked at start, evolves over time based on behavior
- **Player's progress** — new areas unlock as skills develop
- **Player's engagement** — bored? the world changes. In flow? it deepens
- **Player's choices** — explore a cave → underground theme. Find a telescope → space theme
- **Player's age tier** — world complexity scales with cognitive development

The world is not a theme park with learning stations. It's a living place where knowledge
is woven into the fabric of reality. Water flows according to real fluid dynamics (simplified
at lower tiers, accurate at higher ones). Plants grow according to real biology. Bridges
stand or collapse according to real physics. Chemistry is real chemistry. Economics is real
economics.

### 3.2 Environment Biomes (Learning Contexts)

Every biome is a **learning context** where different subjects emerge naturally:

| Biome | Primary Subjects | Example Gameplay |
|-------|-----------------|------------------|
| **The Workshop** | Engineering, Math, Physics | Build machines, design circuits, calculate loads |
| **The Alchemist's Lab** | Chemistry, Biology | Craft potions (stoichiometry), grow plants (biology), mix compounds |
| **The Observatory** | Astronomy, Physics, Math | Navigate by stars, calculate orbits, understand light/gravity |
| **The Ancient Ruins** | History, Archaeology, Language | Decode inscriptions (language arts), piece together civilizations |
| **The Living Forest** | Biology, Ecology, Earth Science | Ecosystem management, animal classification, weather patterns |
| **The Trading Post** | Economics, Math, Social Studies | Supply/demand, percentages, negotiation, currency systems |
| **The Architect's Domain** | Geometry, Engineering, Art | Build structures, angles, load-bearing, symmetry, design |
| **The Code Forge** | Computer Science, Logic | Program machines, debug systems, automate the world |
| **The Healer's Sanctuary** | Biology, Chemistry, Medicine | Anatomy, first aid, pharmacology (age-appropriate) |
| **The Explorer's Map** | Geography, Navigation, Culture | World travel, coordinate systems, cultures, languages |
| **The Time Rift** | History, Cause & Effect | Travel to historical periods, witness events, understand consequences |
| **The Crystal Caverns** | Geology, Chemistry, Math | Mineral classification, crystal structures, mining math |
| **The Storm Tower** | Physics, Weather, Energy | Electricity, magnetism, renewable energy, weather systems |
| **The Library of Echoes** | Language Arts, Literature, Writing | Stories, vocabulary, creative writing through world-building |
| **The Arena** | Strategy, Game Theory, Logic | Puzzles, competitions, strategic thinking, probability |
| **The Shipyard** | Engineering, Physics, Chemistry | Build vehicles from carts to starships, fuel chemistry, propulsion |
| **The Music Hall** | Music Theory, Physics, Math | Instrument crafting, acoustic design, harmony, rhythm |
| **The Gallery** | Art, Design, Math, History | Visual design, perspective, color theory, art history |

New biomes can be generated by Atlas based on player interest — if a player is fascinated
by volcanoes, a **Volcanic Forge** biome emerges with geology, thermodynamics, and chemistry.

### 3.3 World Morphing

The world is not static. It transforms based on player actions:

**Example Flow:**
1. Player is exploring a dungeon (math/logic puzzles to unlock doors)
2. They find an **ancient, broken spaceship** in a cavern
3. Game: "This ship looks ancient… but the controls still glow. Want to try to get it running?"
4. Player says yes → world gradually shifts to **space exploration**
5. Fixing the ship requires: physics (thrust), chemistry (fuel), math (trajectory)
6. Once flying, they discover a space station → new biome unlocks
7. If they get bored of space → they find a portal back, or discover a planet with forests (biology biome)

**Morphing Rules:**
- Transitions are gradual, never jarring — the forest slowly thins into desert, not a hard border
- Player choices drive morphing, but Atlas fine-tunes between sessions
- Every morph is reversible — the player can always find their way back
- Morphing respects built structures — the player's workshop doesn't disappear

**Boredom Detection (In-Session):**
- Repeated failed attempts without trying different approaches → offer hints, shift scene
- Rapid random tapping/clicking → engagement drop → introduce a surprising event
- Long idle → companion character checks in: "Hey, want to try something different?"
- Completing tasks too fast without challenge → escalate difficulty immediately
- Repeating same biome for too long → companion suggests: "I heard about a new place…"

### 3.4 Travel System

Travel mechanics expand directly with the player's knowledge. The journey IS the curriculum.

**Stage 1 — Local (Little Learner, Ages 2–5)**
- Walk around the village, garden, companion's house
- Companion leads: "Let's go to the garden! This way!"
- World is small, safe, contained — no getting lost
- Movement teaches spatial concepts: left/right, near/far, over/under

**Stage 2 — Regional (Explorer, Ages 6–10)**
- Map unlocks with a compass rose
- Walk, ride animals, take boats between biomes
- Navigation requires cardinal directions, simple coordinates
- Distance/speed/time word problems: "The village is 3 km away. Walking at 4 km/h…"
- First vehicle: a simple cart (basic engineering)

**Stage 3 — Continental (Adventurer, Ages 11–14)**
- Build advanced vehicles: ships, hot air balloons, gliders
- Navigation requires trigonometry: bearing, heading, triangulation
- Fuel management requires chemistry: combustion, energy density
- Weather affects travel: wind vectors, ocean currents, storm avoidance
- Map becomes a full coordinate system (Cartesian and polar)

**Stage 4 — Planetary (Scholar, Ages 15–18)**
- Build aircraft, submarines, ground-penetrating vehicles
- Physics of flight: Bernoulli's principle, lift/drag coefficients
- Circumnavigation: great circle routes, latitude/longitude
- Atmosphere layers, ocean depths, geological features at scale
- Build the first rocket: escape velocity, staging, fuel mass ratios

**Stage 5 — Interplanetary (Scholar–Master, 17–24)**
- Orbital mechanics: Hohmann transfer orbits, gravity assists, Δv budgets
- Navigate the solar system: inner planets, asteroid belt, outer planets, moons
- Fuel chemistry evolves: chemical → ion → nuclear thermal
- Time dilation at high velocities (special relativity)
- Build space stations: structural engineering in microgravity

**Stage 6 — Interstellar (Master, 18–24)**
- FTL concepts: wormholes (general relativity), Alcubierre drives (theoretical physics)
- Stellar cartography: parsecs, light-years, stellar classification
- Navigation across light-years: reference frames, relativistic effects
- Exotic fuel sources: fusion, antimatter, zero-point energy (speculative but grounded)
- Each new propulsion system requires deeper physics to understand and unlock
- The galaxy is VAST — reaching the galactic core takes true mastery

```
Walking the garden → Riding to the next biome → Sailing the ocean →
Flying across continents → Orbiting the planet → Visiting the moon →
Hohmann transfers to other planets → Gravity assists to the outer system →
First wormhole to a nearby star → Across the galaxy

THE JOURNEY EXPANDS WITH WHAT YOU KNOW.
```

### 3.5 Off-World Exploration

Beyond the home planet, the game opens into a galaxy of procedurally generated worlds:

- **Inner System:** Rocky planets with geology, volcanism, mineral wealth
- **Outer System:** Gas giants with atmospheric chemistry, icy moons with subsurface oceans
- **Nearby Stars:** Each system has unique characteristics driven by stellar physics
- **Deep Space:** Nebulae (chemistry), neutron stars (extreme physics), black holes (GR)
- **The Galactic Core:** The ultimate destination — requires mastery across all subjects

Each world has its own biomes, resources, and challenges. A water world demands fluid
dynamics and marine biology. A volcanic world demands thermodynamics and materials science.
A frozen world demands cryogenics and survival engineering.

### 3.6 Gender-Neutral Design

- No "boy" or "girl" paths — all content available to all players
- Avatar is fully customizable (any appearance, any style, any combination)
- Characters in the world are diverse in every way
- Interests are tracked by behavior, never by demographic assumptions
- Combat is optional — building, exploration, and puzzle-solving are equally valid paths
- Companion character can be any form: bear, robot, dragon, cat, abstract shape, anything
- No pink/blue defaults. Color choices are the player's alone.

---

## 4. Age Tiers & Gameplay Modes

### 4.1 Little Learner Mode (Ages 2–5)

**Inspiration:** Dora the Explorer, Blue's Clues, Sesame Street

**Interface:** Voice-driven, large touch targets, avatar companion talks directly to the child

**The Companion:** A friendly character (customizable — bear, bunny, robot, dragon, cat,
alien, or anything the child wants) who talks directly to the child:

- "I see three butterflies! Can you count them with me? One… two…"
- "Oh no! The bridge needs to be the RED one! Can you tap the red bridge?"
- "We need to collect 3 stars to open the door! How many do we have? How many more?"
- "What sound does a cow make? MOO! That's right!"
- "Let's do a QUARTER TURN! That's like turning to face the window!" (radians from age 2)

**The Fourth Wall Is Gone:** The companion looks at the camera, waits for answers, reacts
to the child's voice and touch. This isn't a game character — this is the child's friend
who lives in the screen (or speaker).

**Mechanics:**
- Tap to select, drag to place, shake to activate
- Voice responses accepted (fuzzy matching for toddler speech — "twee" matches "three")
- Every correct action → celebration (confetti, music, companion dances)
- Wrong answer → gentle redirect, never negative ("Hmm, let's try again! I think it's…")
- Automatic difficulty based on response patterns
- Sessions are short (5-15 minutes natural breakpoints), but no forced limit

**Subjects at this tier:**
- Counting (1–100, introducing place value with coin stacking)
- Colors, shapes (2D and 3D), patterns
- Letters, phonics, first words, rhyming
- Animals, body parts, food, nature, seasons
- Music (rhythm, pitch, simple instruments, clapping games)
- **Radians AND degrees** — angles as "turns": full turn, half turn, quarter turn
- Basic spatial reasoning (left/right, big/small, over/under, behind/in front)
- Sorting and categorization
- Cause and effect ("What happens if we add water?")
- Emotional vocabulary ("The bear looks SAD. Why do you think?")

### 4.2 Explorer Mode (Ages 6–10)

**Interface:** Touchscreen or mouse/keyboard, text + images + voice, simple inventory

**The World Opens:** Player creates their avatar, picks a starting biome, and begins
exploring. The companion evolves from "talking to you" to "adventuring with you."

**Core Loop:**
1. **Discover** a location, puzzle, or character in the world
2. **Understand** the challenge (presented as a game problem, not a "question")
3. **Solve** using skills (build, craft, calculate, decode, experiment)
4. **Unlock** new areas, tools, abilities, story chapters
5. **Return** to mastered areas periodically (spaced repetition disguised as world events)

**Example Quests:**
- "The farmer needs a fence around a 12m × 8m field. How much fencing?" (perimeter)
- "These ruins have inscriptions in a pattern. What comes next?" (language, sequences)
- "The recipe needs ¾ cup of this but we only have ½ cup measures" (fractions)
- "Build a catapult to launch supplies across the river. Adjust the angle!" (physics, angles)
- "The merchant is offering a deal: 3 for 10 or 5 for 15. Which is cheaper per item?" (unit rates)
- "Program the robot to navigate the maze. Forward, turn, forward…" (intro programming)

**Subjects expand to:**
- All arithmetic operations, fractions, decimals, percentages
- Pre-algebra (variables as unknowns in crafting recipes)
- Basic science (forces, energy, living systems, materials)
- World geography and history through exploration
- Reading comprehension (journals, notes, maps found in the world)
- Creative problem-solving (multiple valid solutions to challenges)
- Introduction to programming through the Code Forge (visual/block coding)
- Basic music theory through instrument crafting

### 4.3 Adventurer Mode (Ages 11–14)

**Interface:** Full game UI with inventory, maps, crafting system, quest log, journal

**The World Deepens:** More complex mechanics, longer quest chains, multi-step problems,
real consequences for decisions. The companion becomes a trusted ally.

**Mechanics:**
- Crafting system with real chemical formulas (inputs → outputs balanced by mass)
- Building system with structural physics (bridges that collapse if engineered wrong)
- Economy system with supply/demand, trade, investment, opportunity cost
- Code Forge: write programs to automate machines (text coding, not just blocks)
- Time Rift missions: visit historical periods, make decisions, see outcomes ripple
- Travel system: build ships, navigate by stars, manage fuel chemistry

**Example Quests:**
- "Design a water purification system for the village" (chemistry + biology + engineering)
- "Navigate to the island using only stars and a compass" (trigonometry, astronomy)
- "The ancient code is encrypted — crack it" (CS, modular arithmetic, pattern recognition)
- "Build a wind turbine to power the workshop" (physics, engineering, math)
- "The kingdom's economy is crashing — figure out why" (economics, data analysis)
- "Build a boat that can carry 500 kg. Archimedes' principle." (physics, engineering)

**Subjects expand to:**
- Algebra I & II, geometry with proofs, intro trigonometry
- Biology (cells, genetics, ecology, evolution)
- Chemistry (elements, reactions, conservation of mass, stoichiometry)
- Physics (mechanics, energy, waves, basic E&M)
- World history (connecting events, cause and effect, primary sources)
- Computer science (algorithms, data structures as game puzzles)
- Electrical engineering basics (circuits, Ohm's law, series/parallel)
- Economics (markets, trade, investment fundamentals)

### 4.4 Scholar Mode (Ages 15–18)

**Interface:** Sophisticated UI, equation rendering (KaTeX), graphing tools, simulation
environments, research journal

**The World Challenges:** Problems require real academic knowledge. The game world IS the
textbook — but interactive, explorable, testable. The companion is a peer.

**Mechanics:**
- Physics simulations (launch rockets, design pendulums, model waves, build reactors)
- Chemistry lab (virtual experiments with accurate reaction outcomes)
- Program full automation systems in the Code Forge (real Python-like language)
- Historical debates (take positions, argue with evidence from primary sources)
- Creative engineering (design, test, iterate, fail, redesign — engineering cycle)
- Interplanetary travel (orbital mechanics, Δv budgets, gravity assists)

**Subjects:**
- Trigonometry, pre-calc, intro calculus (derivatives, integrals)
- Physics (mechanics, E&M, optics, thermodynamics, modern physics intro)
- Chemistry (stoichiometry, equilibrium, acids/bases, organic chemistry introduction)
- AP-level history, government, economics, political science
- Literature analysis through the Library of Echoes
- CS: algorithms, data structures, basic ML concepts, networking
- Electrical engineering (AC/DC circuits, signal basics, digital logic)

### 4.5 Master Mode (Ages 18–24)

**Interface:** Full simulation environment, research tools, collaboration features,
publication system (write papers other players can read)

**The World Is Yours:** The player becomes a creator in the world — designing systems,
running experiments, solving unsolved problems. The companion is a research partner.

**Mechanics:**
- Design and run full experiments with controls, variables, statistical analysis
- Build systems from scratch (power grids, communication networks, economies)
- Teach younger players (teaching reinforces mastery — the companion suggests it)
- Interstellar travel (FTL concepts, wormhole physics, exotic propulsion)
- Create content for the world (quests, buildings, systems that other players encounter)

**Subjects:**
- Calculus I → II → III, Linear Algebra, Differential Equations
- Organic Chemistry, Biochemistry, Analytical Chemistry
- Quantum Mechanics, Thermodynamics, Statistical Mechanics
- Advanced CS (distributed systems, ML/AI, compilers, OS design)
- Electrical Engineering (signal processing, control systems, power electronics)
- Research methodology, technical writing, experimental design
- Graduate-level specialization tracks in areas of interest

---

## 5. Mastery System — The Ender Protocol

Named after Ender's Game. The game never tells the player their "level." They just
notice the world getting more interesting.

### 5.1 Principles

1. **Mastery ≠ Getting 5 Right.** True mastery means:
   - Can solve it DAYS later without prompting (retention)
   - Can solve VARIATIONS they haven't seen (transfer)
   - Can EXPLAIN it by teaching a companion character (depth)
   - Can APPLY it in a different context (cross-subject integration)

2. **Spaced Repetition Built Into the World.** Old challenges return naturally:
   - "The bridge you built last week? A storm damaged it. But now it needs to be longer."
   - "The potion recipe worked before, but the ingredient ratios changed with altitude."
   - Player uses the same skills at higher difficulty without realizing it's review.
   - Review intervals follow SM-2 algorithm, disguised as world events.

3. **The Impossible Challenge.** Periodically, the game presents something slightly
   above the player's level. If they solve it → big reward, world expands dramatically,
   companion is genuinely impressed. If they don't → no penalty, no mention of failure.
   Atlas logs the attempt for future calibration. The player might not even know it was
   an impossible challenge.

4. **Gap Detection.** When a player struggles, Atlas doesn't just repeat. It traces WHY:
   - Wrong calculation → is it the operation or the numbers?
   - Wrong chemistry → do they know the elements or just the process?
   - Can't build the bridge → is it geometry or physics that's the gap?
   - Find the prerequisite gap and create a quest that fills it — without the player
     knowing they're being remediated.

5. **Never Stunt Progression.** If a 7-year-old is ready for algebra, give them algebra
   (wrapped in age-appropriate gameplay). If a 5-year-old grasps multiplication, don't
   hold them back because "that's second grade." The game content goes 3-4 years AHEAD
   of where the player currently is, always pre-loaded and ready.

6. **Cross-Subject Transfer.** True mastery is demonstrated when a player applies knowledge
   from one subject in another context:
   - Uses algebra learned in crafting to solve a trading problem
   - Applies physics from bridge-building to rocket design
   - Uses pattern recognition from language to crack a code
   - Atlas specifically creates quests that test cross-subject transfer.

### 5.2 Engagement Psychology

| Technique | Implementation |
|-----------|---------------|
| **Variable Reward Schedule** | Sometimes quests give rare items, sometimes common. Unpredictability drives engagement. |
| **Flow State** | Challenge matches skill level. Too easy → escalate. Too hard → scaffold. Micro-adjustments every interaction. |
| **Curiosity Gap** | "What's behind that locked door?" — player must learn something to find out. |
| **Social Proof** | Companion mentions what "other explorers" have discovered (anonymized community data). |
| **Ownership** | Player builds things that PERSIST. Their workshop. Their garden. Their spaceship. Their world. |
| **Identity** | Player becomes "The Architect" or "The Alchemist" based on their path — but can always explore other paths. |
| **Narrative Drive** | The overarching mystery of The Founders unfolds as the player progresses across all subjects. |
| **Meaningful Choice** | Multiple paths to every solution. No single "right answer" to how to play. |
| **Competence Signaling** | The world reacts differently as the player grows — NPCs defer, structures are grander, problems are deeper. |
| **Teaching as Mastery** | Companion sometimes asks "Can you explain this to me?" — teaching cements knowledge. |

### 5.3 The Calibration Zone

When a new player joins at ANY age, the game runs a calibration sequence. This is NOT a
test. It feels like playing the game for the first time.

**How it works:**
1. Companion greets the player, introduces the world, begins exploring together
2. Environment presents progressively harder challenges in each subject area
3. Challenges are disguised as natural exploration — door puzzles, conversations, building tasks
4. Each response adjusts the next challenge up or down (binary search on skill level)
5. No scores, no feedback on "performance" — just the world responding
6. Takes 15-30 minutes, feels like the tutorial
7. Result: a complete skill profile across all subjects, informing initial world configuration

**Example (Age 10 entry):**
```
COMPANION: "Welcome to the Nexus! I'm [name]! Let's explore!
Hey, look at that door — it has a puzzle lock!"

[Door: 3 + 4 = ?]         → Instant → escalate rapidly
[Next: 47 + 38 = ?]       → Correct with pause → note speed
[Next: 3 × 12 = ?]        → Correct → multiplication confirmed
[Next: 144 ÷ 12 = ?]      → Struggled → division flagged
[Switch to language: "The sign says 'LUMINESCENT.' What does that mean?"]
[Then science: "Why does this plant grow toward the light?"]
[Then logic: "If all zorps are blue, and this is a zorp, what color?"]
```

Each subject is sampled in 3-5 interactions. Within 20-30 total interactions, the
game has a starter profile — and the player has been having fun the entire time.

---

## 6. Atlas Integration — The Architect

Atlas is the **invisible game designer**. The player never interacts with Atlas during
gameplay. Atlas works between sessions — reshaping the world, preparing content, analyzing
progress, and ensuring every player is getting the perfect experience.

### 6.1 What Atlas Does

| Role | When | How |
|------|------|-----|
| **World Shaping** | Between sessions | Analyzes play data, generates new quests, modifies biomes |
| **Difficulty Tuning** | Between sessions | Adjusts challenge levels, inserts impossible challenges |
| **Interest Tracking** | Continuous (logged) | Tracks time spent, biome preferences, quest types chosen |
| **Gap Analysis** | Nightly batch | Reviews mistakes, identifies prerequisite gaps, traces root causes |
| **Content Generation** | Batch (pre-computed) | Generates 3-4 years of content ahead of player's level |
| **Boredom Response** | Flagged in-session, acted on next session | Detects engagement drops, plans scene changes |
| **Parent Reports** | Weekly + on-demand | Progress summaries, strength/weakness analysis, recommendations |
| **Curriculum Alignment** | Setup + ongoing | Maps game progression to educational standards (Common Core, AP, IB, etc.) |
| **Companion Tuning** | Between sessions | Adjusts companion personality, dialogue style, hint frequency |
| **Cross-Player Insights** | Aggregated, anonymized | Identifies common stumbling points, improves quest design globally |

### 6.2 What Atlas Does NOT Do

- Does NOT generate content in real-time during gameplay (all pre-generated)
- Does NOT interrupt the player or break immersion
- Does NOT make the game feel like school
- Does NOT judge or grade — the world simply responds to what the player knows
- Does NOT share individual data between players
- Does NOT require internet to play (all content cached locally)

### 6.3 The Game Runs Standalone

The game engine MUST work WITHOUT Atlas connected:
- All mechanics, physics, crafting systems are built into the engine
- Pre-generated content is cached 3-4 years ahead
- Offline-capable (satellite mode, airplane mode, camping trip, internet outage)
- When Atlas reconnects, it syncs progress and refreshes the content cache
- A player can go MONTHS without Atlas and still have content

### 6.4 Content Pipeline

```
Atlas LLM (nightly batch, 22:00 ET)
    │
    ├── Collect play data from all active profiles
    │
    ├── Gap analysis per profile
    │   └── Trace struggle → find prerequisite → generate remediation quest
    │
    ├── Quest Generator
    │   ├── Validates educational accuracy
    │   ├── Ensures game mechanic is appropriate for age tier
    │   ├── Creates multiple difficulty variants
    │   └── Generates companion dialogue per quest step
    │
    ├── Asset Generator
    │   ├── Fish Audio TTS → companion voice lines (batch render)
    │   ├── Procedural 3D assets (terrain, objects)
    │   └── Quest-specific sound effects
    │
    ├── Content Cache
    │   └── 3-4 years ahead per player, stored on server
    │
    └── Satellite Sync
        └── Push new content to offline devices (Hermes)
```

---

## 7. The Companion Character

The companion is the player's constant presence — from age 2 to 24. It grows, changes,
and deepens alongside the player.

### 7.1 Companion Arc

| Age Tier | Companion Role | Communication Style |
|----------|---------------|-------------------|
| Little Learner (2-5) | **Best friend / teacher** | Talks directly to child, Dora-style. "Can YOU help me?" Uses repetition, songs, celebration. |
| Explorer (6-10) | **Adventure partner** | "Let's figure this out together!" Shares excitement, offers hints when asked, celebrates discoveries. |
| Adventurer (11-14) | **Trusted ally** | "I think we should consider…" Respects the player's growing intelligence. Debates ideas. |
| Scholar (15-18) | **Peer** | "What's your hypothesis?" Engages as intellectual equal. Challenges assumptions. |
| Master (18-24) | **Research partner** | "I ran the numbers differently — want to compare approaches?" Genuine collaboration. |

### 7.2 Companion Customization

- **Appearance:** Fully customizable at any time (species, colors, accessories, size)
- **Name:** Player names the companion (default suggestions available)
- **Voice:** Fish Audio TTS with selectable voice profiles (warm, energetic, calm, playful)
- **Personality traits:** Curious, cautious, enthusiastic, analytical — develops based on player interaction
- **Memory:** Companion remembers past adventures, references them naturally

### 7.3 Companion as Teaching Tool

The companion periodically asks the player to EXPLAIN things:
- "Wait, I don't understand. Why did the bridge need that angle?" (tests depth)
- "Could you teach me how to mix that potion?" (tests procedural knowledge)
- "I heard another explorer does it differently. Which way is better?" (tests critical thinking)

Teaching the companion is one of the strongest mastery signals — if the player can
explain it simply, they truly understand it.

---

## 8. The Overarching Story — The Founders

### 8.1 The Mystery

The Nexus wasn't always here. Someone — or something — built it. Scattered throughout
the world are fragments of a story:

- **Who were The Founders?** An ancient civilization that built The Nexus as a repository
  of all knowledge. But why? And where did they go?
- **The Core:** At the center of the galaxy lies the Nexus Core — the source of all the
  world's power. Nobody has reached it. Nobody knows what's there.
- **Fragments:** Every major discovery, every mastered skill, every biome explored reveals
  another fragment of The Founders' story.
- **The Pattern:** The deeper the player goes, the more they realize — The Founders faced
  a challenge that required mastery of EVERY discipline. Math, science, language, art,
  engineering, philosophy — all of it mattered. The Nexus was their training ground.

### 8.2 Story Threads by Age Tier

| Tier | Story Thread |
|------|-------------|
| Little Learner | "The Founders left a trail of STARS! Let's follow them!" Simple treasure hunt with sparkly clues. |
| Explorer | "The Founders' journal says they explored these lands too. They left messages for us!" Discovery and wonder. |
| Adventurer | "The Founders built incredible machines — but some are broken. Can we rebuild them?" Engineering + mystery. |
| Scholar | "The Founders' equations describe something impossible. A doorway. What's on the other side?" Science + philosophy. |
| Master | "The Founders weren't just scientists. They were everything — artists, engineers, poets, mathematicians. And their final creation awaits at the Core." The answer: knowledge itself IS the destination. |

### 8.3 The Revelation (Endgame)

When a player reaches the Nexus Core (requiring genuine mastery across all subjects),
they discover: **The Founders were future humans.** They built The Nexus because they
understood that the only way to solve the problems ahead — climate, disease, space,
consciousness — was to ensure every human being had access to the full breadth of
knowledge. Not as schoolwork. As lived experience.

The player, having mastered everything from counting to quantum mechanics through play,
IS what The Founders hoped for. The Core activates and the player becomes a **Founder**
themselves — able to shape the world for the next generation of players.

---

## 9. Player Profiles

### 9.1 Child Profiles

- Big avatar icon on login screen (tap to select — no typing for little ones)
- Voice greeting: "Hi [name]! Ready to explore?"
- Each child has their own:
  - World state (biome, built structures, inventory, traveled regions)
  - Progress + mastery per subject (hundreds of skill nodes)
  - Interest profile (tracked automatically from behavior)
  - Companion character + customization + memory
  - Achievements + unlocks (meaningful milestones, not gamification padding)
  - Travel capability (what vehicles/methods they've unlocked)

### 9.2 Multi-Device Sync

- Progress syncs to the Nexus server automatically
- Start playing on Surface Go → continue on phone browser → continue on satellite speaker
- Satellite mode: cache locally, sync when connected
- Parent sees aggregated progress across all devices
- Conflict resolution: most recent progress wins per skill

### 9.3 Screen Time

- **Default:** Unlimited — this is a learning tool, not a dopamine trap
- **Parent configurable:** min/max session length, allowed hours, break reminders
- **Break reminders:** Companion suggests breaks naturally and in-character:
  - "I'm thirsty! Let's take a water break and come back!"
  - "My wings are tired. Let's rest for a bit!"
  - "That was a LOT of exploring. Want to stretch?"
- **NOT punitive:** The game doesn't lock out. It just gets gentler about suggesting breaks.
- **Tracked:** Session lengths logged for parent dashboard reporting

---

## 10. Multiplayer

### 10.1 Design Constraints

- **Same network only.** No internet multiplayer. Child protection is paramount.
- **No voice chat between players.** Companion mediates all interaction.
- **No competitive ranking.** Collaboration, not competition.
- **Parent approval required.** Parent enables multiplayer per profile.

### 10.2 Cooperative Quests (2-4 Players)

Shared quest where each player contributes their strengths:
- "You're good at math — calculate the trajectory. I'll handle the chemistry."
- All players earn credit for their contributions
- Quest difficulty scales to the group's combined skill level
- Companion helps coordinate: "Maya solved the first part! Now we need someone to build it."

### 10.3 Classroom Mode (Up to 30 Students)

- Teacher dashboard with class-wide progress view and heat map
- Shared world instance with individual progress tracking
- Teacher can assign specific quests, create groups, set objectives
- Works on school LAN without internet
- Real-time view of which students are engaged/struggling
- Export progress reports aligned to educational standards

### 10.4 Sibling Play (Household)

- Siblings in the same world, each at their own difficulty level
- Older sibling can help younger (teaching reinforces the older child's mastery)
- Companion adjusts: "Your sister is great at fractions — ask her for help!"
- Shared buildings persist — one sibling's workshop benefits all

---

## 11. Art Direction

### 11.1 Style

**NOT photorealistic.** Stylized 3D that is more expressive than realism.

The art style scales across age tiers:

| Tier | Visual Style | Reference |
|------|-------------|-----------|
| Little Learner (2-5) | Soft, rounded, bright, playful, large shapes | Monument Valley meets Dora |
| Explorer (6-10) | Vibrant, adventurous, detailed but approachable | Zelda: Wind Waker meets Minecraft |
| Adventurer (11-14) | Rich, immersive, slightly complex, atmospheric | Breath of the Wild |
| Scholar (15-18) | Stunning, atmospheric, sophisticated, data-beautiful | Journey meets Spiderverse |
| Master (18-24) | Elegant, clean, powerful, minimal when needed | Fez meets scientific visualization |

The transition between styles is seamless — as the player ages through the game, the
rendering complexity increases gradually. The player never notices a "style change."

### 11.2 Color Palette

- **UI accents:** Frost (#22d3ee) and Aurora (#a78bfa) across all tiers
- **Per-biome palettes:** Each biome has a distinct color identity that harmonizes with the accent colors
- **Age-appropriate saturation:** Brighter, higher saturation for young tiers; deeper, more nuanced for older
- **Accessibility:** All color choices work with all three color blindness types

### 11.3 Audio Design

**Companion Voice:**
- Fish Audio TTS (primary) — warm, expressive, character-consistent
- Qwen3-TTS (narration, secondary characters)
- Multiple voice profiles selectable by the player
- Voice emotion modulation: excited, thoughtful, concerned, celebratory, curious

**Sound Effects:**
- Spatial audio for immersion (even simplified on mono satellite speakers)
- Every action has audio feedback (build → hammer/click, craft → bubbling/mixing)
- Biome-specific ambient soundscapes (see Voice Gameplay doc for full breakdown)
- Audio landmarks — each biome is recognizable by sound alone (critical for voice mode)

**Music:**
- Layered, adaptive soundtrack per biome
- Intensity scales with gameplay (exploration = calm, challenge = focused, discovery = triumph)
- Per-age-tier instrumentation (simple for young, orchestral for older)
- Never repetitive — procedural variation on composed themes

---

## 12. Technical Architecture Summary

*Full details in [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md).*

### 12.1 Stack

| Component | Technology |
|-----------|-----------|
| **Client** | Three.js (WebGL), TypeScript, Web Audio API |
| **Server** | FastAPI (Python 3.11+), SQLite (WAL mode) |
| **Atlas Module** | REST API bridge to Atlas Cortex |
| **TTS** | Fish Audio (companion voice), Qwen3-TTS (narration) |
| **STT** | Whisper (via Atlas or local on Pi) |
| **Content Format** | JSON quest definitions, glTF 3D assets, OGG audio |

### 12.2 Platforms

| Platform | Rendering Mode | Input Methods |
|----------|---------------|---------------|
| Surface Go (kiosk) | Full 3D WebGL | Touch, keyboard, voice |
| Browser (any) | 3D or 2D fallback | Touch/mouse/keyboard, voice, gamepad |
| Mobile (PWA) | 3D lite | Touch, voice |
| Satellite (Hermes) | Audio only | Voice only |

### 12.3 Offline Architecture

- Service Worker + IndexedDB for client-side content cache
- Content pre-loaded 3-4 years ahead per player
- Progress queues locally, syncs when connected
- Satellite devices sync over LAN via Hermes protocol

---

## 13. Accessibility

### 13.1 Visual Accessibility

- **Color blind modes:** Full support for deuteranopia, protanopia, tritanopia
- **High contrast mode:** Enhanced outlines, patterns in addition to color
- **Font scaling:** 50% to 200% without layout breaking
- **Screen reader support:** Full ARIA labels, companion narrates all visual elements
- **Reduced motion:** Option to disable all animations and particle effects

### 13.2 Motor Accessibility

- **One-switch mode:** Full game playable with a single input
- **Adjustable timing:** No time-limited challenges by default
- **Auto-aim assist:** For any targeting/aiming mechanics
- **Large touch targets:** All interactive elements minimum 48x48dp
- **Sticky keys / hold instead of press:** For crafting and building

### 13.3 Cognitive Accessibility

- **Simplified UI mode:** Fewer on-screen elements, clearer hierarchy
- **Slower pacing option:** More time between events, longer companion pauses
- **Repeat any instruction:** "Say that again?" always works
- **Visual + audio + text:** Every piece of information presented in multiple modes
- **Consistent navigation:** Same controls, same layout, throughout the game

### 13.4 Audio Accessibility

- **Full subtitles/captions:** All spoken content has text option
- **Visual sound indicators:** Sound effects represented visually when enabled
- **Haptic feedback:** Controller vibration as audio substitute where possible
- **Audio descriptions:** All visual events have audio equivalents (for voice mode users)

---

## 14. What Needs Building

### Phase 1: Foundation (MVP on Surface Go)

- Game engine (Three.js, TypeScript, basic world rendering)
- Little Learner mode (ages 2-5): companion, counting, colors, shapes, letters, turns
- Explorer mode (ages 6-10): open world, basic quests, crafting intro
- FastAPI server with profiles, progress, auth, mastery tracking
- Fish Audio TTS for companion voice
- Fuzzy speech matching for voice answers (toddler-friendly)
- Touch + keyboard + voice + gamepad input systems
- Audio-only rendering mode for satellite speakers
- Atlas module integration (progress sync, content generation hook)
- Calibration zone for new players

### Phase 2: World Expansion

- Adventurer mode (ages 11-14): full crafting, Code Forge, Time Rift
- All 18+ biomes with subject-specific content
- Travel system: regional → continental (vehicles, navigation)
- Atlas nightly content generation pipeline (full batch)
- Offline cache + sync for satellites
- Parent dashboard in Atlas admin panel
- Multiplayer: cooperative quests, sibling play
- Spaced repetition system fully integrated into world events

### Phase 3: Advanced + Polish

- Scholar mode (ages 15-18): simulations, equation rendering, research tools
- Master mode (ages 18-24): creation tools, advanced simulations, interstellar travel
- Travel system: planetary → interstellar (orbital mechanics, FTL)
- Classroom mode (teacher dashboard, up to 30 students)
- Advanced Atlas difficulty tuning (full Ender Protocol)
- The Founders storyline: all fragments, endgame, Core revelation
- Curriculum standards alignment (Common Core, AP, IB mapping)
- Mobile optimization (PWA)
- Accessibility: all modes fully implemented
- Content: minimum 1000 handcrafted seed quests across all tiers

---

## 15. Open Questions (Resolved + Remaining)

### Resolved

| Question | Decision |
|----------|----------|
| Art style | Stylized 3D — scales from playful (Monument Valley) to stunning (Spiderverse) |
| Multiplayer | Same-network only. Coop quests, classroom mode, sibling play. No internet PvP. |
| Companion voice | Fish Audio TTS primary. Multiple voice profiles. Personality evolves with age tier. |
| Overarching story | The Founders — ancient civilization that built the Nexus. Mystery unfolds across all tiers. Core at galaxy center. |
| Audio-only experience | Rich and fully designed. See VOICE_GAMEPLAY.md. Parallel experience, not reduced. |
| Monetization | None. Ever. Knowledge is free. |
| Engine | Three.js primary (evaluate Babylon.js in Phase 1). |

### Remaining

1. **Exact content volume for MVP:** How many quests per biome per tier for Phase 1?
2. **Companion voice selection:** How many Fish Audio voices? How to handle custom voice training?
3. **Curriculum mapping granularity:** Per-standard alignment or broader skill categories?
4. **Teacher onboarding:** How do teachers set up classroom mode? Self-service or guided?
5. **Content moderation:** How to validate Atlas-generated content quality before serving?
6. **Performance baselines:** Minimum FPS targets per platform? Three.js budget?
7. **Localization:** Multi-language from Phase 1 or Phase 2? Which languages?
8. **Assessment export:** Can schools use Nexus mastery data for official assessment?

---

*This document is a living design. Derek reviews and adjusts before any code is written.
All game mechanics must teach real knowledge. All content must be educationally valid.
Knowledge is the only currency.*
