# 04 — Mastery Tiers

> Nexus Academy serves learners ages 2 and up across five seamless mastery tiers. Each tier
> transforms the interface, world complexity, companion relationship, subject depth,
> and narrative sophistication — while the underlying world remains continuous. A
> player never "levels up" to a new tier; the world gradually grows with them. This
> document details what each tier looks, feels, and plays like.

---

## Tier Overview

| Tier | Typical Starting Mastery | Name Shown to Player | Interface | Companion Role |
|------|--------------------------|---------------------|-----------|---------------|
| 1 | Ages 2–5 | Foundation | Voice + large touch targets | Best friend who talks directly to the child |
| 2 | Ages 6–10 | Nexus Academy: Discovery | Touch/mouse/keyboard, simple HUD | Adventure partner |
| 3 | Ages 11–14 | Nexus Academy: Builder | Full game UI, inventory, quest log | Trusted ally who respects your intelligence |
| 4 | Ages 15–18 | Nexus Academy: Innovator | Sophisticated UI, equation renderer, simulators | Intellectual peer |
| 5 | Ages 18+ | Nexus Academy: Creator | Research environment, creation tools, publication | Research partner and collaborator |

The transition between tiers is **seamless**. There is no "Congratulations, you've
reached Discovery mode!" screen. The world just gradually adds complexity. The companion
gradually shifts tone. The UI gradually offers more controls. A player moving from tier
1 to tier 2 won't notice it happening — they'll just realize one day that the world is
bigger than it used to be.

---

## Tier 1 — Foundation (typically ages 2–5)

### Inspiration

Dora the Explorer, Blue's Clues, Sesame Street. The companion talks TO the child,
breaks the fourth wall, waits for answers, and celebrates every response.

### Interface

- **Visuals:** Soft, rounded, bright. Large shapes. Minimal clutter. 3–5 interactive
  elements on screen at a time, never more.
- **Touch targets:** Minimum 80×80dp (much larger than standard). Forgiving tap zones.
- **Voice input:** Primary interaction method. Fuzzy matching for toddler speech —
  "twee" matches "three," "weh" matches "red." See [13-INPUT_CONTROLS.md](13-INPUT_CONTROLS.md).
- **Text:** Minimal. Large font. Mostly companion speech (spoken aloud, optionally shown).
- **No reading required.** Everything is communicated through voice, images, and animation.

### The Fourth Wall Is Gone

The companion character looks at the camera (or speaks directly through the speaker in
voice mode — see [12-VOICE_GAMEPLAY.md](12-VOICE_GAMEPLAY.md)). They address the child
by name. They ask questions and WAIT for answers. They react to the child's response
with genuine excitement or gentle redirection.

This is not a game character the child watches. This is the child's **friend who lives
in the screen**.

```
COMPANION: "Hi, Emma! I'm so happy you're here!
Look — I found something sparkly! [holds up a blue gem]
Do you know what COLOR this is?"

[Waits 3-5 seconds]

CHILD: "Boo!" (blue)

COMPANION: "BLUE! That's RIGHT! It's a beautiful BLUE gem!
[confetti, happy music, companion dances]
Let's find more! I think there are RED ones hiding too!"
```

### Mechanics

| Mechanic | How It Works | What It Teaches |
|----------|-------------|----------------|
| **Tap to select** | Large objects highlight on approach, tap to pick | Choice, color, shape recognition |
| **Drag to place** | Drag items to target locations with generous snapping | Spatial reasoning, matching |
| **Count along** | Companion counts, child joins verbally or by tapping | Numbers 1–100, place value |
| **Shake/tilt** | Shake the tablet to activate something (optional) | Cause and effect |
| **Voice answer** | Companion asks, child speaks answer | Vocabulary, pronunciation, confidence |
| **Turn/rotate** | Turn character or object by specified amount | "Quarter turn!" = radians foundation |

### Subject Coverage

- **Counting:** 1 to 100, skip counting by 2s, 5s, 10s
- **Place value:** Coins stack in groups of 10 (10 copper = 1 silver)
- **Shapes:** Circle, square, triangle, rectangle, star → sphere, cube, pyramid, cylinder
- **Colors:** Primary → secondary → mixing
- **Patterns:** AB, ABC, ABBC — visual, auditory, and movement patterns
- **Letters & phonics:** Letter shapes, letter sounds, first words, rhyming
- **Spatial:** Left/right, up/down, over/under, big/small, near/far
- **Angles as turns:** "Do a QUARTER TURN! Now a HALF TURN!" — radian intuition
- **Animals & nature:** Sounds, habitats, basic classification, life cycles
- **Music:** Rhythm (clap along), pitch (high/low), simple instruments
- **Emotions:** "The bear looks sad. Why?" — emotional vocabulary and empathy
- **Cause & effect:** "What happens when we add water to the sand?"
- **Sorting:** By color, size, shape, type — fundamental classification

### Session Structure

Sessions are naturally short (5–15 minutes) with clear narrative breakpoints:

```
COMPANION: "Wow, we collected 5 stars today! That was amazing!
I'm a little sleepy now. Want to play again later?
Okay! See you soon, Emma! [waves, screen gently fades]"
```

No abrupt cutoff. No timer. The companion suggests natural breaks (see [20-SCREEN_TIME_SAFETY.md](20-SCREEN_TIME_SAFETY.md)). If the child wants to keep playing, they can.

### What Wrong Answers Feel Like

Wrong answers are NEVER punished:

```
COMPANION: "Hmm, I don't think that's quite right. Let me help!
I think the RED one might be this one over here... [highlights it]
Can you tap it? YES! That's the RED one! Great job!"
```

The companion takes shared responsibility ("Let me help" not "Try again"). Celebration
happens on the corrected answer, not differently from a first-try success.

---

## Tier 2 — Discovery (typically ages 6–10)

### Interface

- **Visuals:** Vibrant, adventurous, detailed but clear. More elements on screen.
- **HUD:** Simple health/energy bar, item count, mini-map (optional), compass
- **Inventory:** Basic grid inventory. Drag-and-drop. Visual item icons.
- **Text:** Labels, short dialogue, journal entries. Reading expected but not required
  (companion reads aloud on request or by default for younger Discovery-tier players).

### The World Opens

The player creates their avatar (see [15-PROFILES_PROGRESSION.md](15-PROFILES_PROGRESSION.md)),
chooses a starting interest, and begins exploring beyond the village. The companion
shifts from "talking at you" to "adventuring WITH you."

```
COMPANION: "Look at that cave! I wonder what's inside.
Should we check it out, or follow the river path?"

[Player chooses cave]

COMPANION: "Into the cave! I'll bring the torch.
Whoa — look at these crystals! There are... let me count...
a LOT. Can you count the blue ones?"
```

### Core Loop

1. **Discover** — Find a new location, character, puzzle, or object
2. **Understand** — What does this challenge need? (Not stated as a "question")
3. **Solve** — Build, craft, calculate, decode, experiment
4. **Unlock** — New area, tool, ability, or story chapter
5. **Return** — Spaced repetition: old areas present new challenges (see [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md))

### Subject Expansion

Everything from Tier 1, plus:
- All four arithmetic operations, fractions, decimals, percentages
- Pre-algebra: variables as unknowns ("The machine needs X crystals…")
- Forces, energy, simple machines, basic electricity
- World geography through exploration, map reading
- History through Ancient Ruins and Time Rift visits
- Reading comprehension through in-world text (journals, signs, scrolls)
- Introduction to programming (Code Forge with visual/block coding)
- Scientific method: observe, hypothesize, test, conclude

### Example Quests

| Quest | Subjects | Mechanic |
|-------|----------|----------|
| "The farmer needs a fence" | Perimeter, multiplication | Calculate fencing needed for rectangular field |
| "Decode the ancient inscription" | Pattern recognition, language | Letter/number substitution cipher |
| "The recipe needs ¾ cup" | Fractions | Use ½ cup measures to get ¾ |
| "Build a catapult" | Angles, force | Adjust angle and tension to hit target |
| "The robot maze" | Sequencing, logic | Program directional commands |
| "The merchant's deal" | Unit rates, comparison | "3 for 10 gold or 5 for 15 gold?" |

---

## Tier 3 — Builder (typically ages 11–14)

### Interface

- **Full game UI:** Inventory with categories, quest log, world map, crafting table, journal
- **Crafting system:** Real chemical formulas and engineering specs
- **Code Forge:** Text-based programming (not just blocks)
- **Data displays:** Simple graphs, charts, tables within gameplay

### The World Deepens

Multi-step quests with branching outcomes. Real consequences for decisions. The
companion becomes a trusted ally who debates ideas and respects the player's intelligence.

```
COMPANION: "The village well is contaminated. We could:
A) Build a water purification system — that's engineering and chemistry
B) Find the source of contamination upstream — that's investigation
C) Dig a new well — faster but doesn't solve the root problem

What do you think? I'm leaning toward finding the source first,
but B and A together would be the most thorough..."
```

### Subject Expansion

Everything from Tier 2, plus:
- Algebra I and II, geometry with proofs, intro trigonometry
- Biology: cells, genetics, ecology, evolution, classification
- Chemistry: periodic table, balanced equations, stoichiometry, acid/base
- Physics: Newton's laws, momentum, energy conservation, waves
- World history with cause-and-effect analysis, primary sources
- Computer science: algorithms, data structures, databases
- Electrical engineering: circuits, Ohm's law, series/parallel, basic digital logic
- Economics: supply/demand, markets, investment, opportunity cost
- Ship building and continental navigation (see [03-TRAVEL_MECHANICS.md](03-TRAVEL_MECHANICS.md))

### Example Quests

| Quest | Subjects | Mechanic |
|-------|----------|----------|
| "Design a water purification system" | Chemistry, biology, engineering | Multi-step design challenge |
| "Navigate to the island by stars" | Trigonometry, astronomy | Celestial navigation |
| "The ancient code is encrypted" | CS, modular arithmetic | Cipher cracking |
| "Build a wind turbine" | Physics, engineering, math | Design, build, test, iterate |
| "The kingdom's economy is crashing" | Economics, data analysis | Investigate, diagnose, propose solutions |
| "Build a boat for 500 kg cargo" | Physics, engineering | Archimedes' principle, structural design |

---

## Tier 4 — Innovator (typically ages 15–18)

### Interface

- **Equation rendering:** KaTeX integration for displaying and entering formulas
- **Graphing tools:** Plot functions, visualize data, interactive graphs
- **Simulation environments:** Physics sims, chemistry labs, economic models
- **Research journal:** Track hypotheses, experimental results, conclusions

### The World Challenges

Problems require real academic knowledge. The game world IS the interactive textbook.
The companion is an intellectual peer who challenges assumptions and encourages rigor.

```
COMPANION: "The reactor's power output follows P(t) = 100e^(-0.02t).
At what time does output drop to 50% of initial?

I can set up the equation if you want to solve it, or you can
derive the approach yourself. This is essentially asking:
when does e^(-0.02t) = 0.5?"
```

### Subject Expansion

Everything from Tier 3, plus:
- Trigonometry, pre-calculus, introduction to calculus (derivatives, integrals)
- Physics: mechanics, E&M, optics, thermodynamics, modern physics introduction
- Chemistry: equilibrium, organic chemistry intro, electrochemistry, thermodynamics
- AP/college-prep level history, government, economics, political science
- Literature analysis through the Library of Echoes biome
- CS: algorithms, data structures, networking, basic ML concepts
- Electrical engineering: AC/DC, signal processing basics, digital logic
- Interplanetary travel (orbital mechanics, rocket equation, gravity assists)

### Example Quests

| Quest | Subjects | Mechanic |
|-------|----------|----------|
| "Design the orbital insertion burn" | Calculus, orbital mechanics | Calculate Δv, burn time, fuel mass |
| "Synthesize the antidote" | Organic chemistry | Build molecule from functional groups |
| "Model the epidemic" | Diff eq, biology | SIR model, predict outbreak trajectory |
| "Build a communication relay" | Physics (EM), engineering | Signal propagation, antenna design |
| "Debate the trade agreement" | Economics, rhetoric, history | Present evidence-based argument |
| "Optimize the power grid" | Calculus, EE | Minimize loss across the network |

---

## Tier 5 — Creator (ages 18+)

### Interface

- **Full simulation environment:** Laboratory-grade tools, research interfaces
- **Publication system:** Write papers, build documentation, create teaching content
- **Creation tools:** Design quests, biomes, and systems for other players
- **Collaboration features:** Multi-player research projects

### The World Is Yours

The player transitions from consumer to creator. They design systems, run experiments,
solve open-ended problems, and contribute to the world itself.

```
COMPANION: "I've been analyzing the data from our protein folding
experiments. The molecular dynamics simulation shows three stable
conformations, but the experimental NMR data only supports two.

Either our force field parameters are wrong, or there's a kinetic
trap preventing the third conformation from being observed in
practice. How should we investigate?"
```

### Subject Coverage

Everything from Tier 4, plus:
- Calculus I → II → III, Linear Algebra, Differential Equations
- Organic Chemistry, Biochemistry, Analytical Chemistry
- Quantum Mechanics, Thermodynamics, Statistical Mechanics
- Advanced CS: distributed systems, ML/AI, compilers, OS design
- Electrical Engineering: signal processing, control systems, power electronics
- Research methodology, experimental design, statistical analysis
- Technical writing and peer review
- Graduate-level specialization in chosen areas of interest
- Interstellar travel requiring general relativity and quantum field theory

### Teaching as Mastery

At Creator tier, the companion suggests that the player teach younger players:

```
COMPANION: "A new Discovery-tier player in the Living Forest is struggling with
food chains. You mastered ecology years ago. Want to create a quest
that teaches it? Designing a teaching experience is the deepest
form of mastery."
```

Content created by Creator-tier players (after Atlas quality validation) can appear in
other players' worlds, creating a living, growing educational ecosystem.

---

## Tier Transitions

### Tiers Are Internal Only

**Critical design rule:** The tier names (Foundation, Discovery, Builder, Innovator,
Creator) are internal design categories. **The player never sees them.** There is no
"Congratulations, you've reached Builder!" screen. No tier badge. No rank indicator.
No progress bar toward the next tier.

The player experiences a world that gradually, organically expands. That's it.

### How Transition Works

1. **The world quietly expands.** A new path appears. A hill reveals something beyond
   it. A door that was stuck now opens. The companion notices something it hadn't
   before: "Wait — was that cave always there?"

2. **UI elements appear when needed.** The quest log icon appears when the player starts
   doing multi-step tasks. The crafting formula display appears when the player is ready
   for precise chemistry. An equation renderer appears when the math demands it. These
   aren't "unlocked" — they just weren't needed until now.

3. **Companion language shifts.** "Let's count together!" gradually becomes "What do you
   think we need?" which becomes "I've been considering your hypothesis…" The companion
   grows alongside the player (see [11-COMPANION_SYSTEM.md](11-COMPANION_SYSTEM.md)).

4. **Content sophistication increases.** Vocabulary, sentence complexity, visual detail,
   and narrative depth all ramp continuously. Not in steps — on a smooth curve.

5. **UI adapts independently from content.** A brilliant 3-year-old solving pre-algebra
   still gets large touch targets and voice-first interaction. Motor skills, reading
   ability, and knowledge mastery are tracked on separate axes. See the Progression
   Philosophy in [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md).

### Mastery Drives Expansion, Not Age

Age is a guide for default starting content, not a gate:

| Mastery Achieved | World Responds |
|-----------------|---------------|
| Counting + basic addition | Inventory and trading systems appear |
| Reading comprehension | Journals, signs, and scrolls appear with quest clues |
| Shapes + angles | Building tools and architectural challenges emerge |
| Variables + unknowns | Crafting recipes show formulas, not just pictures |
| Navigation + coordinates | Map gains a coordinate grid, longer journeys possible |
| Basic programming | Code Forge machines become programmable |

A gifted 7-year-old can be encountering what we internally call "Builder-tier"
content. A struggling 13-year-old might still be solidifying "Discovery-tier" skills.
Both are valid. Both are having fun. Neither knows their internal tier label.

### What Triggers Transition

Atlas evaluates between sessions (see [08-ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md)).
In standalone mode, the game uses simpler heuristics:

- **Breadth:** Has the player demonstrated competence across core subject areas?
- **Depth:** Can they apply skills in novel contexts? Teach the companion?
- **Engagement:** Are they bored with current content? Completing too easily?
- **Readiness signals:** Have they tried interacting with things beyond their current level?

If these signals align, the game gradually introduces next-tier elements over several
sessions. The transition takes weeks, not minutes. And the player never knows it's happening.

---

## Research Required

Before building against this document, complete the following research:

- [ ] **Child development stages (Piaget)** — Study Piaget's stages of cognitive development (sensorimotor, preoperational, concrete operational, formal operational). Map to our mastery tiers. Identify where our tier boundaries align/diverge and why.
- [ ] **Child UX research** — Review Sesame Workshop's research methodology and published findings on children's interaction with screens. Study PBS Kids' design guidelines. Read Nielsen Norman Group's "Children's UX" reports.
- [ ] **Motor skill development by age** — Research fine motor development milestones (pincer grasp, finger isolation, stylus control). Inform touch target sizes and gesture complexity per tier.
- [ ] **Age-appropriate interaction design** — Study how children at ages 2-3, 4-5, 6-8, and 9-12 interact with tablets and voice interfaces differently. Review Apple's and Google's child-design guidelines.
- [ ] **Toddler speech recognition** — Research state-of-the-art in child speech recognition. Whisper's performance on child speech. Fuzzy phonetic matching approaches (Soundex, Metaphone, Beider-Morse). Benchmark with actual toddler speech samples.
- [ ] **Gifted child accommodation** — Research how gifted education programs handle acceleration. Study Davidson Institute guidelines. Ensure our "never stunt progression" principle is developmentally appropriate.

---

*Previous: [03-TRAVEL_MECHANICS.md](03-TRAVEL_MECHANICS.md) — Travel from walking to FTL.*
*Next: [05-GAMEPLAY_LOOPS.md](05-GAMEPLAY_LOOPS.md) — Core gameplay mechanics and loops.*
