# 05 — Gameplay Loops

> Every game needs loops — repeatable cycles of action that keep players engaged.
> Nexus Academy has loops at every scale: a 30-second micro-loop of discover-try-succeed,
> a 15-minute quest loop, a multi-session story arc, and a years-long mastery journey.
> This document covers the core loops, quest structure, crafting, building, the economy,
> the Code Forge, and how they all connect to learning.

---

## Loop Hierarchy

```
MICRO-LOOP (30 seconds)
  Discover → Attempt → Feedback → Adjust → Succeed
  
QUEST LOOP (10-30 minutes)
  Encounter challenge → Understand requirements → Gather/build/calculate →
  Solve → Unlock reward → World expands

SESSION LOOP (30-90 minutes)
  Enter world → Complete 1-3 quests → Explore freely → Build/craft →
  Companion recap → Natural exit point

ARC LOOP (weeks-months)
  Follow story thread → Unlock new biome → Master subject area →
  Discover Founders fragment → World significantly expands

JOURNEY LOOP (years)
  Progress through tiers → Travel expands → Story deepens →
  Approach the Nexus Core → Become a Founder
```

Each loop nests inside the larger one. A single play session contains dozens of
micro-loops, 1-3 quest loops, and advances the arc loop by a small amount. The
player is always making progress at every scale simultaneously.

---

## The Micro-Loop (30 Seconds)

The fundamental unit of gameplay. Every interaction follows this pattern:

1. **Discover** — The player encounters something (object, NPC, puzzle, obstacle)
2. **Attempt** — They try to interact (tap, speak, build, calculate)
3. **Feedback** — The world responds immediately (success animation, physics result, companion reaction)
4. **Adjust** — If it didn't work, they try a different approach
5. **Succeed** — The challenge is resolved, and the player feels competent

**Critical rule:** Feedback is IMMEDIATE. The player should never wait more than 1 second
to see the result of their action. Physics simulations run in real-time. Wrong answers
get instant (gentle) feedback. The world is always responsive.

**First-person perspective:** All loops play out in first person. The player IS in the
world — they see their hands building the bridge, their tools mixing the potion, the
companion reacting right in front of them. This creates maximum immersion: the feedback
loop isn't "watch my character succeed" — it's "I succeeded." See
[16-ART_DIRECTION.md](16-ART_DIRECTION.md) for the full first-person design.

**Examples by tier:**

| Tier | Micro-Loop Example |
|------|-------------------|
| Foundation | "Tap the red bridge" → taps → confetti + companion celebrates |
| Discovery | "How much fencing for 12×8 field?" → answers 40m → fence appears around field |
| Builder | "Balance the equation: _H₂ + O₂ → _H₂O" → enters 2,1,2 → reaction animates |
| Innovator | "Calculate orbital insertion Δv" → enters 3.2 km/s → ship adjusts trajectory smoothly |
| Creator | "Predict protein fold conformation" → submits model → molecular dynamics sim runs |

---

## Quest Structure

Quests are the primary content delivery mechanism. Every quest teaches something, but
it never feels like a lesson — it feels like an adventure.

### Quest Anatomy

```
Quest
├── Hook — Why should the player care? (Narrative + curiosity)
│   "The village well is poisoned. People are getting sick."
│
├── Investigation — What's the problem? (Discovery + observation)
│   "Test the water. Trace the source upstream. Analyze samples."
│
├── Challenge Steps — What must the player do? (Skills applied)
│   Step 1: "Identify the contaminant" (chemistry)
│   Step 2: "Calculate the filtration rate needed" (math)
│   Step 3: "Build the filtration system" (engineering)
│   Step 4: "Test the clean water" (scientific method)
│
├── Resolution — Did it work? (Physics/chemistry/world responds truthfully)
│   "Water tests clean. Villagers recover over the next few days."
│
└── Reward — What opens up? (New areas, tools, story fragments)
    "The grateful village elder gives you a map to the Crystal Caverns."
```

### Quest Types

| Type | Duration | Example |
|------|----------|---------|
| **Micro-quest** | 2-5 min | "Count the butterflies" / "Balance this equation" |
| **Standard quest** | 10-30 min | "Build a bridge to the island" / "Crack the cipher" |
| **Chain quest** | Multiple sessions | "Design, build, and test a water purification system" |
| **Story quest** | Ongoing | "Follow The Founders' trail to the next fragment" |
| **Impossible challenge** | Variable | Ender Protocol challenge — see [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md) |
| **Review quest** | 5-15 min | "The bridge you built? A storm damaged it." (spaced repetition) |
| **Cross-subject quest** | 30-60 min | "Build a spaceship and navigate to the moon" (physics + chem + math + CS) |

### Quest Sources

| Source | Description |
|--------|-----------|
| **Handcrafted** | Designed by humans, highest quality, used for key story moments and calibration |
| **Atlas-generated** | Created by Atlas between sessions based on player needs (see [09-CONTENT_PIPELINE.md](09-CONTENT_PIPELINE.md)) |
| **Player-created** | Creator-tier players can design quests (Atlas-validated before serving) |
| **World-emergent** | Generated by world state changes (storm damages bridge → repair quest) |

### Quest Difficulty

Quests don't have a visible difficulty rating. Instead, they have a **skill profile** —
what skills are needed and at what mastery level. The game only presents quests the player
is ready for (or almost ready for — see "impossible challenges" in [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md)).

---

## The Crafting System

Crafting is where chemistry, physics, and engineering come alive. Every recipe uses real
science.

### How Crafting Works

1. **Gather ingredients** — Found in the world, traded, or refined from raw materials
2. **Follow or discover recipes** — Some are given, some are discovered by experimentation
3. **Measure and combine** — Precision matters (especially at higher tiers)
4. **Process** — Heat, cool, mix, wait, pressurize — each step has real effects
5. **Result** — Success produces the item. Failure produces something else (never nothing).

### Crafting by Tier

**Foundation:** Simple mixing
- "Put the red paint and blue paint together" → purple paint
- "Add water to the seeds" → plant grows
- Recipes are 1-2 steps. Results are immediate and visual.

**Discovery:** Recipe following with measurement
- "Combine 2 parts sand + 1 part clay. Heat to dry" → bricks
- "Mix ½ cup salt + 1 cup water. Let crystals form" → salt crystals
- Recipes are 3-5 steps. Measurement introduces fractions and ratios.

**Builder:** Real chemistry
- "2H₂ + O₂ → 2H₂O. Apply heat as catalyst" → water
- "CaCO₃ → CaO + CO₂. Heat limestone to get quickite and carbon dioxide"
- Balanced equations required. Mass conservation enforced. Molar ratios matter.

**Innovator:** Complex synthesis and analysis
- Organic chemistry: "Connect the benzene ring to the carboxyl group"
- Thermodynamics: "Calculate the heat of reaction. Is this safe?"
- Multi-step synthesis with purification and testing

**Creator:** Research-grade
- Protein folding, drug design, novel material synthesis
- Experimental design: controls, variables, statistical analysis
- Original discovery (Atlas-generated problems with multiple valid solutions)

### Crafting Failure

Failure is ALWAYS safe and educational:
- Bad proportions → companion explains what went wrong
- Wrong ingredients → unexpected but interesting result
- Wrong conditions → partial reaction, companion identifies the issue
- At no tier does failure punish the player. The companion says "Interesting! That made
  smoke instead of potion. I wonder why?" — and the investigation IS the lesson.

---

## The Building System

Build structures in the world using real engineering principles.

### How Building Works

1. **Choose materials** — Wood, stone, metal, composite, exotic materials
2. **Design the structure** — Place beams, walls, roofs, foundations
3. **Physics validates** — The engine runs structural analysis in real-time
4. **If it stands** → Success. The structure persists in the world permanently.
5. **If it fails** → It collapses (safely). Companion helps diagnose why.

### Physics in Building

| Tier | Physics Level | What The Player Learns |
|------|-------------|----------------------|
| Foundation | Blocks stack, triangles are stable | Balance, gravity, basic shapes |
| Discovery | Supports needed for bridges, roofs need slopes | Load distribution, geometry |
| Builder | Stress, strain, load calculations | F=ma, material properties, structural integrity |
| Innovator | Beam deflection, moment of inertia, resonance | Advanced mechanics, calculus applications |
| Creator | Finite element analysis concepts, novel materials | Advanced engineering, research methodology |

### Building Example: The Bridge Quest (Discovery Tier)

```
COMPANION: "We need to cross this 10-meter gap.
I found some wooden planks. Each is 3 meters long.
Can we just lay them across?"

PLAYER: "No, they're too short."

COMPANION: "Right! What if we use supports?
We could put a pillar in the middle of the gap...
but the water is too deep for a pillar here.
What about building from both sides and meeting in the middle?"

[Player designs a cantilever bridge]

COMPANION: "Clever! But will it hold? Let's calculate.
Each plank can hold 100 kg. The player weighs 60 kg.
The supplies weigh 40 kg. That's exactly 100 kg on each plank.
Is that enough margin?"

PLAYER: "No — we should double up the planks for safety."

COMPANION: "Smart thinking. Engineers always build in a safety factor.
Typically 2x to 3x the expected load."

[Player builds with doubled planks, walks across successfully]
```

---

## The Economy

The in-game economy runs on real economic principles with **real supply and demand
dynamics**. No microtransactions — knowledge is the only real currency (see
[01-VISION.md](01-VISION.md)), but the in-game economy uses gold/silver/copper as
the medium of exchange.

### Economic Mechanics

| Mechanic | How It Works | What It Teaches |
|----------|-------------|----------------|
| **Trading** | Buy/sell at Trading Post and Marketplace with NPC merchants | Supply/demand, negotiation |
| **Price fluctuation** | Prices change based on world events, player actions, and real supply/demand simulation | Market dynamics |
| **Crafting profit** | Raw materials → crafted goods at higher value | Value-added economics |
| **Investment** | Build infrastructure that generates passive income | ROI, compound growth |
| **Scarcity** | Rare materials command premium prices | Supply/demand, resource allocation |
| **Currency exchange** | Different regions use different currencies | Exchange rates, conversion |
| **Taxes/fees** | Trading Post charges fees, maintained by government | Public finance basics |
| **Debt/credit** | Borrow from the bank for large purchases (Builder+) | Interest, compound growth, risk |
| **Entrepreneurship** | Start businesses in the Marketplace biome | Profit margins, supply chains, risk management |

### Real Supply & Demand

The economy uses a genuine supply/demand simulation, not scripted price lists:

- **Supply** is driven by what players and NPCs produce — more iron mined means lower iron prices
- **Demand** is driven by what's needed — a building boom increases demand for lumber
- **World events affect markets** — a storm destroying crops raises food prices; a new
  mine discovery crashes ore prices
- **Player actions have real economic consequences** — cornering the market on a resource
  affects availability for everyone (in multiplayer), or affects NPC behavior (in single player)
- **Seasonal cycles** — agricultural goods fluctuate with growing seasons; trading routes
  shift with weather patterns
- **Economic feedback loops** — high prices incentivize production, which increases supply,
  which lowers prices — the invisible hand, experienced firsthand

### Economy by Tier

**Foundation:** Coin counting — 1, 2, 5, 10 coins. "How many to buy the apple?"

**Discovery:** Arithmetic with money. Percentage discounts. Unit pricing. Budgeting.

**Builder:** Supply/demand simulation. Market trends. Investment vs. spending. Opportunity cost.

**Innovator:** Macroeconomics. Monetary policy. Game theory (prisoner's dilemma in multiplayer trading). Econometric modeling.

**Creator:** Complex systems modeling. Policy design. Market manipulation detection. International trade theory.

---

## The Code Forge

A dedicated biome where players learn programming by automating the game world.

### How It Works

Players write code that controls machines, robots, and systems in the game world. The
code is real — not a metaphor. It executes against real game objects.

### Programming Progression

| Tier | Language Level | What They Build |
|------|---------------|----------------|
| Discovery (6-10) | Visual/block coding | Direct robot: forward, turn, pick up, drop |
| Discovery (8-10) | Simple text commands | Loops: "Repeat 10: plant, step forward" |
| Builder | Full text, Python-like syntax | Variables, functions, conditionals, arrays |
| Innovator | Real Python/JS in sandbox | Data structures, algorithms, file I/O, networking |
| Creator | Systems programming | Distributed systems, ML models, compilers, OS concepts |

### Code Forge Examples

**Discovery (block coding):**
```
[MOVE FORWARD] → [TURN LEFT] → [MOVE FORWARD] → [PICK UP]
```
Robot navigates maze and collects ore.

**Builder (text coding):**
```python
for tree in forest.trees:
    if tree.has_fruit:
        robot.move_to(tree)
        robot.harvest()
        robot.move_to(storage)
        robot.deposit()
```

**Innovator (algorithm design):**
```python
def sort_packages(packages):
    # Quick sort for efficiency
    if len(packages) <= 1:
        return packages
    pivot = packages[0].weight
    lighter = [p for p in packages[1:] if p.weight <= pivot]
    heavier = [p for p in packages[1:] if p.weight > pivot]
    return sort_packages(lighter) + [packages[0]] + sort_packages(heavier)
```

**Creator (distributed systems):**
```python
async def consensus(towers, threat_level):
    """Byzantine fault-tolerant consensus among guard towers."""
    votes = await asyncio.gather(*[t.vote(threat_level) for t in towers])
    # Need 2/3 + 1 agreement for Byzantine tolerance
    threshold = (2 * len(towers)) // 3 + 1
    agrees = sum(1 for v in votes if v == threat_level)
    return agrees >= threshold
```

### Code Forge Integration

Code written in the Code Forge controls REAL game systems:
- Automate mining → resources flow without manual collection
- Program security systems → protect built structures
- Build communication networks → link distant outposts
- Design AI for NPCs → create helpers for younger players

The code has real consequences. A bug means the robot goes the wrong way. An infinite
loop jams the machine (companion: "I think your code is stuck in a loop — the machine
won't stop! How do we break out?").

---

## Cross-Subject Quest Examples

The most powerful quests combine multiple subjects:

### "Build a Spaceship and Reach the Moon" (Innovator)

| Step | Subject | Challenge |
|------|---------|-----------|
| 1. Design hull | Engineering | Choose materials, calculate structural strength |
| 2. Build engine | Physics + Chemistry | Rocket equation, fuel chemistry, thrust calculations |
| 3. Calculate trajectory | Math (calculus) | Orbital mechanics, Δv budget, launch window |
| 4. Program autopilot | CS | Navigation algorithm, course correction |
| 5. Life support | Biology + Chemistry | Oxygen, CO₂ scrubbing, water recycling |
| 6. Launch | All combined | Everything works together or the mission fails |

### "Cure the Village Plague" (Builder)

| Step | Subject | Challenge |
|------|---------|-----------|
| 1. Identify symptoms | Biology | Analyze patient reports, narrow diagnosis |
| 2. Find the pathogen | Biology + Chemistry | Microscope analysis, culture tests |
| 3. Trace the source | Geography + Logic | Epidemiological investigation |
| 4. Synthesize treatment | Chemistry | Stoichiometry, dosage calculation |
| 5. Distribute fairly | Economics + Ethics | Limited supply, who gets treated first? |
| 6. Prevent recurrence | Engineering | Sanitation system design |

### "Run the Kingdom for a Year" (Builder–Innovator)

| Step | Subject | Challenge |
|------|---------|-----------|
| 1. Budget | Math + Economics | Revenue vs. expenditure, tax rates |
| 2. Trade policy | Economics + History | Tariffs, trade agreements, alliances |
| 3. Infrastructure | Engineering + Math | Roads, bridges, buildings, resource allocation |
| 4. Governance | History + Ethics | Laws, justice, representation |
| 5. Defense | Strategy + Physics | Fortification, diplomatic alternatives |
| 6. Culture | Art + Language | Libraries, theaters, education system |

---

## Reward Types

| Reward | Description | Psychological Purpose |
|--------|-----------|---------------------|
| **Area unlock** | New biome or region becomes accessible | Curiosity, exploration drive |
| **Tool unlock** | New capability (compass, sextant, microscope) | Competence, power growth |
| **Story fragment** | Piece of The Founders' mystery (see [10-STORY_NARRATIVE.md](10-STORY_NARRATIVE.md)) | Narrative drive |
| **Building materials** | New materials for construction | Ownership, creativity |
| **Companion evolution** | Companion gains new ability or personality trait | Relationship investment |
| **World change** | Visible impact on the world (village thrives, forest grows) | Meaningful agency |
| **Knowledge itself** | "I understand how bridges work now" | Intrinsic satisfaction |

Rewards are NEVER:
- Purchasable with real money
- Random loot boxes
- Cosmetic-only with no function
- Time-gated behind daily limits (play whenever, earn whenever)

---

## Session Flow

A typical play session:

```
1. LOG IN
   → Companion greets by name, recaps last session
   → "Last time we were building the waterwheel. And the forest 
      grew three new trees while you were away!"

2. CONTINUE OR EXPLORE
   → Resume active quest, or explore freely
   → World has evolved since last session (Atlas changes)

3. QUEST ENGAGEMENT (1-3 quests)
   → Micro-loops within each quest
   → Cross-subject challenges
   → Companion helps when stuck

4. FREE EXPLORATION
   → Build, craft, trade, program, explore
   → Discover new areas, NPCs, story fragments

5. NATURAL EXIT
   → Companion suggests a break at narrative breakpoint
   → "Good stopping point! We just finished the bridge. 
      Want to keep going or save for next time?"
   → Auto-save always active
```

---

## Research Required

Before building against this document, complete the following research:

- [ ] **Game theory — flow state** — Read Csikszentmihalyi's "Flow: The Psychology of Optimal Experience." Study the flow channel model. Research how games like Journey, Celeste, and Hades maintain flow state.
- [ ] **Variable reward schedules** — Study Skinner's operant conditioning research, specifically variable-ratio and variable-interval schedules. Understand the neuroscience (dopamine prediction error). Identify the ethical boundary between engagement and addiction.
- [ ] **GDC talks on engagement** — Watch and summarize: "Designing for Curiosity" (GDC 2019), "The Chemistry of Game Design" (Daniel Cook), "Idle Hands: Designing for Anticipation" (GDC 2017). Extract implementable engagement principles.
- [ ] **Top children's games analysis** — Deep-play and document loop structures in: Prodigy Math, DragonBox Algebra, Minecraft Education, Roblox education experiences, PBS Kids games, Duolingo Kids. Map each game's core/meta/outer loops.
- [ ] **Crafting system design** — Research crafting in Zelda: TotK, Minecraft, Terraria, and Valheim. What makes crafting compelling vs. tedious? How to integrate real science without making it feel like homework.
- [ ] **In-game programming environments** — Study Scratch (MIT), Roblox Studio, Minecraft commands, and Code.org. Evaluate what makes in-game coding engaging. Review Bret Victor's "Learnable Programming" essay.

---

*Previous: [04-AGE_TIERS.md](04-AGE_TIERS.md) — The five mastery tiers.*
*Next: [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md) — The Ender Protocol mastery system.*
