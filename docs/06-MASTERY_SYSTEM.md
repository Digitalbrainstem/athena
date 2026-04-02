# 06 — Mastery System (The Ender Protocol)

> Named after Ender's Game. The game never tells the player their "level." They just
> notice the world getting more interesting. Mastery is tracked invisibly using spaced
> repetition disguised as world events, gap detection that traces failures to root
> causes, impossible challenges that stretch without punishing, and cross-subject
> transfer that proves true understanding. This document covers the full mastery system.

---

## Core Principles

### 1. Mastery ≠ Getting Five Right

Getting five answers correct is memory. Mastery is understanding. The Ender Protocol
distinguishes between them by testing four dimensions:

| Dimension | How It's Tested | Example |
|-----------|----------------|---------|
| **Retention** | Can they do it days later without prompting? | Bridge-repair quest revisits geometry from last week |
| **Transfer** | Can they apply it in a new context? | Use fractions learned in cooking for distance calculation |
| **Depth** | Can they explain it to the companion? | "Can you teach me how to balance equations?" |
| **Integration** | Can they combine it with other knowledge? | Build a spaceship requiring physics + chemistry + math |

A skill is only marked as "mastered" when ALL four dimensions are demonstrated across
multiple interactions over multiple sessions.

### 2. Spaced Repetition Built Into the World

Old challenges return naturally as world events — never as "review exercises."

**How it works:**

The game uses a modified SM-2 algorithm (SuperMemo) to schedule skill reviews. But
instead of flashcards, the reviews are disguised as world events:

| Time Since Last Practice | World Event |
|--------------------------|-------------|
| 1 day | "The potion you made yesterday — the villager wants more!" |
| 3 days | "The bridge you built? A trader needs a wider one next to it." |
| 1 week | "Storm damaged your fence. Rebuild, but this time the field is hexagonal." |
| 2 weeks | "The navigation system from your old ship — can you adapt it for the new one?" |
| 1 month | "The ancient ruins revealed a NEW inscription. Same cipher, harder message." |
| 3 months | "Your apprentice is trying to build a bridge and failing. Can you help?" |

The player is doing the SAME SKILLS at HIGHER DIFFICULTY without realizing it's review.
The interval increases with each successful review. If they struggle, the interval resets
and Atlas creates a remediation quest (see Gap Detection below).

**SM-2 Implementation (simplified):**

```
After each interaction:
  if success:
    interval = interval * ease_factor  (default ease: 2.5)
    ease_factor += 0.1 (max 3.0)
  if struggle:
    interval = 1 day
    ease_factor -= 0.2 (min 1.3)
  next_review = now + interval
```

But the player never sees intervals, ease factors, or review schedules. They just see
a rich world that keeps calling them back to use their skills.

### 3. The Impossible Challenge

Periodically (roughly every 10-15 quests), the game presents something slightly ABOVE
the player's current level. This is inspired by Ender's Game — the Battle Room that
threw challenges students weren't "ready" for.

**How it works:**

1. Atlas selects a skill the player is close to mastering but hasn't quite reached
2. A quest appears that requires that skill at a level 10-20% above demonstrated mastery
3. The quest is presented exactly like any other — no warning, no special framing
4. If the player SOLVES it → massive reward, world expands, companion is genuinely impressed
5. If the player FAILS → absolutely no penalty. No mention of failure. No "try again."
   The companion moves on naturally. Atlas logs the attempt for future calibration.

**The player doesn't know it was an impossible challenge.** They just know some quests
are harder than others. The ones they crack open feel incredible. The ones they don't
are forgotten.

**Why this works:**
- Successful impossible challenges produce the highest engagement spikes
- They test readiness for the next tier without a formal assessment
- They create "peak experiences" — memorable moments of breakthrough
- They prevent the plateau feeling of "I already know everything at this level"

### 4. Gap Detection

When a player struggles, the system doesn't just retry. It traces WHY.

**The diagnostic tree:**

```
Player struggles with: "Calculate buoyancy for the ship hull"
│
├── Is it the buoyancy formula? (F = ρVg)
│   ├── Do they understand density? (ρ = m/V)
│   │   ├── Do they understand mass vs volume?
│   │   └── Do they understand units?
│   ├── Do they understand volume calculation?
│   │   ├── Can they calculate rectangular volume?
│   │   └── Can they multiply three numbers?
│   └── Do they understand what g is?
│
├── Is it the arithmetic?
│   ├── Multiplication with decimals?
│   └── Large number handling?
│
└── Is it the application?
    ├── Can they set up the problem from the word description?
    └── Do they understand what "displacement" means physically?
```

Atlas runs this analysis between sessions (see [08-ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md)).
It identifies the DEEPEST prerequisite gap — the root cause — and creates a quest that
addresses that specific skill. The remediation quest feels like a normal adventure, not
a "let's review multiplication" exercise.

**Example gap chain:**

```
Struggled with: Ship buoyancy calculation
Root cause identified: Volume calculation for rectangular prisms
Remediation quest created: "The builder needs to fill a pool for the festival.
  The pool is 8m × 3m × 2m. How many liters of water?" (volume → liters)
  
After success, follow-up: "The supply crate is 2m × 1m × 0.5m and weighs 
  800 kg. Will it float in the river? Water density is 1000 kg/m³."
  
After success, return to original: "Now let's recalculate the ship hull."
```

The player experienced three adventures. They don't know the first two were targeted
remediation. They just know the ship hull calculation makes sense now.

### 5. Never Stunt Progression

If a 7-year-old is ready for algebra, give them algebra. If a 5-year-old grasps
multiplication, don't hold them back because "that's second grade."

**Rules:**
- Age is a GUIDE for default content, not a GATE
- Content is available 3-4 years ahead of the player's current demonstrated level
- If calibration (see [15-PROFILES_PROGRESSION.md](15-PROFILES_PROGRESSION.md)) shows
  the player is ahead, the world adjusts immediately
- If the player is behind, the world slows down without judgment
- Tier-appropriate framing always applies (algebra for a 7-year-old is presented through
  Discovery-tier gameplay, not Innovator-tier equations)

### 6. Cross-Subject Transfer

True mastery means knowledge doesn't stay siloed. Atlas specifically creates quests
that test whether a player can apply knowledge from one subject in another context.

**Transfer test examples:**

| Knowledge Source | Transfer Quest | What It Proves |
|-----------------|---------------|----------------|
| Fractions from cooking | "Split this land evenly among 3 villages" | Math transfers to geography |
| Physics from bridge-building | "Design the rocket engine thrust" | Mechanics transfers to aerospace |
| Algebra from crafting | "Model the population growth curve" | Variables transfer to biology |
| Logic from Code Forge | "Find the flaw in the senator's argument" | Logic transfers to rhetoric |
| Chemistry from potions | "Why is the soil acidic?" | Chemistry transfers to ecology |

Cross-subject transfer is the HIGHEST mastery signal. A player who can apply knowledge
across domains truly understands it.

---

## Engagement Psychology

The Ender Protocol uses research-backed psychological techniques — but always ethically.
The goal is genuine engagement from curiosity and accomplishment, never addiction.

### Techniques Used

| Technique | Implementation | Why It Works |
|-----------|---------------|-------------|
| **Variable reward schedule** | Quest rewards vary — sometimes rare items, sometimes common | Unpredictability drives exploration (Skinner, but ethical) |
| **Flow state** | Challenge precisely matches skill (Csikszentmihalyi's channel) | Too easy → bored. Too hard → frustrated. Just right → flow. |
| **Curiosity gap** | "What's behind that locked door?" | Player must learn to satisfy curiosity (Loewenstein) |
| **Social proof** | Companion mentions other explorers' discoveries | "Others can do it → I can too" motivation |
| **Ownership** | Built structures persist forever | Endowment effect — players value what they created |
| **Identity** | "You're becoming quite the Architect!" | Self-concept drives consistent behavior (Cialdini) |
| **Narrative drive** | The Founders' mystery unfolds with progress | "What happens next?" keeps engagement across sessions |
| **Meaningful choice** | Multiple valid solutions to every problem | Autonomy drives intrinsic motivation (Deci & Ryan) |
| **Competence signaling** | World visibly changes — NPCs defer, structures are grander | Progress is tangible and visible |
| **Teaching** | Companion asks player to explain concepts | Explaining deepens understanding (Feynman technique) |

### Techniques NOT Used

| Technique | Why We Reject It |
|-----------|-----------------|
| Streak pressure | "Log in daily or lose your streak" — creates anxiety, not learning |
| Artificial scarcity | "Only 2 hours left to get this item!" — manipulative urgency |
| Social comparison | "You're ranked #47" — competition undermines collaboration |
| Loss aversion tricks | "You'll lose your progress!" — fear-based retention |
| Infinite scroll / autoplay | Keep the player consuming without thinking — not educational |
| Dark patterns | Any UI designed to trick the player into unintended actions |

---

## Skill Tracking (Internal)

### Skill Taxonomy

Every learnable concept has a node in the skill tree:

```
math
├── number_sense
│   ├── counting (1-20, 1-100, skip counting)
│   ├── place_value (ones, tens, hundreds...)
│   ├── comparison (greater/less, ordering)
│   └── estimation
├── arithmetic
│   ├── addition
│   ├── subtraction
│   ├── multiplication
│   ├── division
│   ├── fractions
│   │   ├── concepts (halves, quarters, thirds)
│   │   ├── addition_subtraction
│   │   ├── multiplication_division
│   │   └── mixed_numbers
│   ├── decimals
│   └── percentages
├── algebra
│   ├── variables
│   ├── linear_equations
│   ├── quadratics
│   ├── systems
│   └── polynomials
├── geometry
│   ├── shapes_2d
│   ├── shapes_3d
│   ├── angles (includes radians)
│   ├── perimeter_area
│   ├── volume
│   ├── coordinate_geometry
│   ├── transformations
│   └── proofs
├── trigonometry
│   ├── basic_ratios
│   ├── unit_circle
│   ├── identities
│   └── applications
├── calculus
│   ├── limits
│   ├── derivatives
│   ├── integrals
│   ├── multivariable
│   └── differential_equations
└── linear_algebra
    ├── vectors
    ├── matrices
    ├── eigenvalues
    └── transformations
```

Similar trees exist for every subject (chemistry, physics, biology, CS, language arts,
history, economics, music, art, engineering). See [07-SUBJECT_MAPPING.md](07-SUBJECT_MAPPING.md)
for the full mapping.

### Mastery Levels Per Skill

Each skill node tracks:

| Field | Type | Description |
|-------|------|-------------|
| `level` | 0.0 – 1.0 | Overall mastery estimate |
| `retention_score` | 0.0 – 1.0 | Can they do it after time passes? |
| `transfer_score` | 0.0 – 1.0 | Can they apply it in new contexts? |
| `depth_score` | 0.0 – 1.0 | Can they explain it to the companion? |
| `attempts` | integer | Total attempts |
| `successes` | integer | Successful attempts |
| `last_attempt` | timestamp | When last practiced |
| `next_review` | timestamp | Spaced repetition due date |
| `streak` | integer | Consecutive successes |
| `ease_factor` | 1.3 – 3.0 | SM-2 ease factor |

A skill is considered **mastered** when:
- `level >= 0.85`
- `retention_score >= 0.8` (tested after at least 7 days)
- `transfer_score >= 0.7` (demonstrated in at least 2 different contexts)
- `depth_score >= 0.6` (successfully taught the companion at least once)

A skill is considered **struggling** when:
- `level < 0.4` after 5+ attempts
- `ease_factor` has dropped below 1.5
- Player actively avoids quests requiring this skill

Struggling skills trigger gap detection and targeted remediation through Atlas.

---

## The Flow Channel

The game continuously adjusts difficulty to keep the player in flow:

```
ANXIETY ZONE (too hard)
  ↑
  │  ╔═══════════════════════════╗
  │  ║                           ║
  │  ║    THE FLOW CHANNEL       ║
  │  ║    (Where learning        ║
  │  ║     happens best)         ║
  │  ║                           ║
  │  ╚═══════════════════════════╝
  │
BOREDOM ZONE (too easy)
  └─────────────────────────────────→ Skill Level
```

**Staying in the channel:**
- Complete too easily → immediate difficulty increase (more variables, larger numbers, time pressure)
- Struggle repeatedly → scaffold (hints, simpler numbers, companion talks through it)
- Complete with effort → perfect. Maintain this level. Gradually increase.
- The adjustment is PER-SKILL, not global. A player can be in flow for math while getting scaffolding for chemistry.

---

## Parent/Teacher Visibility

While the player NEVER sees grades, scores, or assessments, parents and teachers have
access to detailed progress data through the parent dashboard:

| Visible to Player | Visible to Parent/Teacher |
|-------------------|--------------------------|
| World state, inventory, built structures | All player data plus: |
| Companion relationship | Mastery level per subject and skill |
| Discovered biomes, story progress | Identified gaps and remediation plans |
| "I can build bridges!" (felt competence) | "Geometry: 0.72, struggling with 3D shapes" |
| Nothing that looks like a report card | Weekly progress report, strength/weakness charts |

See [08-ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md) for parent report generation
and [15-PROFILES_PROGRESSION.md](15-PROFILES_PROGRESSION.md) for profile management.

---

## Mastery Milestones

While the player doesn't see numerical scores, they DO experience mastery milestones
through the world:

| Milestone | World Response | Player Feels |
|-----------|---------------|-------------|
| Master a skill | World visibly changes (bigger builds, farther travel) | "I can do more than before" |
| Master a subject area | New biome unlocks, companion comments | "A whole new place to explore!" |
| Cross-subject transfer | Impossible challenge succeeds | "I figured out something hard!" |
| Teach the companion | Companion gains new ability | "My friend learned from me!" |
| Complete a tier | World gradually transforms to next tier | "The world is getting so cool" |

These milestones create memorable moments without the negative associations of grades
and scoring. The player measures progress by what they can DO, not by a number.

---

## Progression Philosophy

This section captures the unified philosophy of how progression FEELS in Nexus Academy.
It ties together the mastery system, the companion, the world, and the player's experience
into a single coherent design intent.

### No Gates, No Ceremonies, No Visible Tiers

The mastery tiers (Foundation, Discovery, Builder, Innovator, Creator) are **internal
design categories only**. The player never sees them. There is no "Congratulations,
you've reached Discovery mode!" screen. No locked doors with "Requires Discovery Rank."
No progress bars showing "78% to next tier."

The world just quietly expands:

- A new path appears where there wasn't one before
- A hill reveals something beyond it that the player couldn't see last week
- The companion notices something new: "Hey, I think there's a cave over there…"
- A tool appears in the workshop that wasn't there yesterday
- An NPC mentions a distant land the player has never heard of

The expansion is driven by **mastery, not time or age:**

| When the player masters… | The world responds with… |
|--------------------------|-------------------------|
| Counting + addition | Inventory system appears, trading becomes possible |
| Reading | Journals, scrolls, and signs appear in the world with clues |
| Shapes + angles | Building tools appear, architectural challenges emerge |
| Basic chemistry | The Alchemist's Lab deepens, new ingredients appear |
| Programming basics | Code Forge machines become programmable, not just operable |
| Navigation + trig | Maps get coordinate systems, longer voyages become possible |
| Calculus | Optimization challenges, rocket design, rate-of-change puzzles |

A 4-year-old genius and a 12-year-old beginner can be experiencing the same part of
the world — they got there by different paths, but the experience is equally valid.

### UI Adapts Independently from Content

This is critical and often overlooked: **motor skills and reading ability are tracked
separately from knowledge mastery.**

A brilliant 3-year-old solving algebra-level challenges still gets:
- 80×80dp touch targets (because their fingers are small and imprecise)
- Voice input as primary (because they may not read yet)
- Companion speaking everything aloud (because reading shouldn't gate learning)
- Simple, uncluttered HUD (because visual complexity overwhelms young eyes)

A 15-year-old with motor impairments working on Innovator-level physics still gets:
- Large touch targets and one-switch compatibility
- Extended timing on all interactions
- Full equation rendering and sophisticated content

The UI complexity scales based on:
1. **Motor development** — Touch target size, gesture complexity, input method
2. **Reading level** — How much text appears vs. spoken content
3. **Visual processing** — Number of simultaneous on-screen elements
4. **Attention span** — Session length suggestions, break frequency

These are INDEPENDENT axes from knowledge mastery. The game never assumes that a player
who understands calculus also has adult motor skills, or that a player with a PhD-level
reading ability is ready for advanced physics.

### The Companion Embodies Growth

The player doesn't see themselves grow — they see the **companion** grow. This is the
primary mechanism by which the player perceives their own progression. See
[11-COMPANION_SYSTEM.md](11-COMPANION_SYSTEM.md) for the full companion growth system.

- Early: companion is small, simple, excited about everything
- Mid: companion is helpful, knowledgeable, a true collaborator
- Advanced: companion is sophisticated, challenges the player intellectually
- The companion may physically change — grows taller, gains tools, wears gear reflecting
  the biomes explored together

This is MORE powerful than the player's own avatar changing. It's like watching your
best friend grow up alongside you. The companion is a mirror that reflects the player's
growth back to them without ever making it feel like an evaluation.

### First-Person Immersion

The game is first-person (see [16-ART_DIRECTION.md](16-ART_DIRECTION.md) and
[05-GAMEPLAY_LOOPS.md](05-GAMEPLAY_LOOPS.md)). The player IS in the world, not
watching a character from above. The player's hands and tools are visible, but there
is no avatar on screen to judge or compare.

Combined with companion-as-mirror, first-person perspective means the player experiences
growth through:
1. **What they can DO** — "I can build bridges now. I couldn't before."
2. **Where they can GO** — "The world is so much bigger than when I started."
3. **How the companion talks** — "My companion is SO much smarter now."
4. **What the world offers** — "There's always something new to discover."

They never experience growth through:
- Numbers going up
- Bars filling
- Ranks unlocking
- Comparison to others
- Being told they've improved

### The Player Never Feels Evaluated

This is the emotional summary of the entire progression philosophy:

**The player feels like an explorer whose world keeps getting more interesting.**

Not a student whose grades keep improving. Not a gamer whose level keeps rising. Not a
test-taker whose scores keep climbing. An explorer. The world is endlessly fascinating,
and it keeps revealing new wonders because the player keeps becoming capable of
perceiving them.

The moment a player feels evaluated — the moment they think "the game is testing me" —
we've failed. The progression system exists to ensure that moment never comes.

---

## Research Required

Before building against this document, complete the following research:

- [ ] **Spaced repetition science** — Study Ebbinghaus forgetting curve (original 1885 research and modern replications). Read Piotr Wozniak's SuperMemo documentation on the SM-2 through SM-18 algorithms. Compare Leitner system, Anki's implementation, and FSRS (Free Spaced Repetition Scheduler). Determine which algorithm best fits disguised-as-gameplay repetition.
- [ ] **Cognitive load theory** — Read Sweller's cognitive load theory papers. Understand intrinsic, extraneous, and germane load. Apply to quest design: how many simultaneous concepts can a player handle per tier?
- [ ] **Zone of Proximal Development** — Study Vygotsky's ZPD and scaffolding theory. Map to our difficulty adjustment system. Research "desirable difficulties" (Bjork & Bjork) — when is struggle productive?
- [ ] **Transfer of learning** — Research near-transfer vs. far-transfer in educational psychology. What conditions promote cross-subject transfer? Study Perkins & Salomon's work on transfer. Inform our cross-subject quest design.
- [ ] **Mastery learning** — Read Bloom's mastery learning framework. Compare to our 4-dimension mastery model. Study Khan Academy's implementation of mastery-based progression.
- [ ] **Adaptive testing (CAT)** — Research computerized adaptive testing algorithms (Rasch model, item response theory). Evaluate for calibration zone design. Study how GRE/GMAT adapt question difficulty.
- [ ] **Teaching as learning** — Research the "protégé effect" and Feynman technique in educational psychology. Quantify the learning benefit of explaining to others. Inform companion teaching interactions.

---

*Previous: [05-GAMEPLAY_LOOPS.md](05-GAMEPLAY_LOOPS.md) — Core gameplay loops and quests.*
*Next: [07-SUBJECT_MAPPING.md](07-SUBJECT_MAPPING.md) — Every subject mapped to game mechanics.*
