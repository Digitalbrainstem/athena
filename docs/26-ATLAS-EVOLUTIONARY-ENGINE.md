# 26 — Atlas Evolutionary Engine (Optional Advanced Feature)

> Inspired by Google DeepMind's AlphaEvolve. When Atlas is connected, the game
> doesn't just generate content — it evolves its own algorithms. Teaching methods,
> difficulty curves, NPC behavior, and economy rules all improve automatically
> by testing mutations against simulated play data. The game teaches itself
> how to teach.
>
> **This feature ONLY exists when Atlas is running.** The game works perfectly
> without it — static algorithms, pre-generated content, all local. Atlas makes
> it *better over time*, but is never required.

---

## How It Works

```
NIGHTLY CYCLE (Atlas server, between sessions):

1. ANALYZE — Review play data from all connected players
   - Where do players get stuck?
   - Which teaching methods work for which learning styles?
   - Where do players disengage? Where do they flow?

2. MUTATE — Generate candidate algorithm improvements
   - Modify difficulty curves, hint timing, reward schedules
   - Adjust NPC behavior strategies, economy parameters
   - Evolve quest scaffolding sequences

3. EVALUATE — Test mutations against simulated player populations
   - Run thousands of simulated play sessions
   - Measure: learning rate, engagement, frustration, mastery speed
   - Compare against current production algorithm

4. SELECT — Keep improvements, discard regressions
   - Only deploy mutations that measurably improve outcomes
   - Gradual rollout — test on subset before full deployment

5. DEPLOY — Push updated parameters to player devices
   - Tiny update: JSON config files, not code rewrite
   - Device applies new parameters next session
   - Player never notices — game just works better
```

---

## What Evolves

### 1. Calibration & Difficulty (The Ender Protocol)

```
BASELINE (no Atlas): Static Bayesian IRT
  - Fixed difficulty curves per tier
  - Works well for most players
  - Same algorithm for everyone

WITH ATLAS:
  - Atlas evolves the IRT parameters per learning style
  - Discovers that visual learners need 30% more spatial puzzles
  - Finds that morning players handle harder content than evening
  - Adjusts "impossible challenge" timing per player profile
  - Result: 20-40% faster mastery for connected players
```

**What gets pushed to device:**
```json
{
  "calibration_v": 47,
  "irt_params": {
    "discrimination_base": 1.2,
    "difficulty_range": [-3.0, 3.0],
    "hint_delay_curve": [5, 8, 12, 20],
    "impossible_challenge_rate": 0.03
  },
  "per_style_adjustments": {
    "visual": {"spatial_weight": 1.3},
    "kinesthetic": {"build_weight": 1.4},
    "auditory": {"story_weight": 1.2}
  }
}
```

### 2. NPC Behavior & Social Dynamics

```
BASELINE (no Atlas): Scripted NPC behavior
  - Fixed dialogue trees
  - Static pricing in markets
  - Predictable quest givers

WITH ATLAS:
  - NPCs evolve trading strategies (game theory)
  - Merchants adapt pricing based on supply/demand
  - Quest givers offer dynamic deals based on player behavior
  - NPC relationships form and evolve
  - Economy self-balances when players exploit loopholes
```

**Inspired by AlphaEvolve's VAD-CFR:**
- NPCs use volatility-adaptive strategies
- When a player floods the market with potions → NPC merchants lower potion prices
- When nobody crafts weapons → blacksmith offers premium rewards for weapon quests
- All evolved, not hand-coded

### 3. Teaching Method Optimization

```
BASELINE (no Atlas): Fixed teaching sequences
  - "To learn fractions, do these 10 activities in order"
  - Same path for every player

WITH ATLAS:
  - Atlas discovers that some players learn fractions better through:
    a) Potion mixing (visual/hands-on)
    b) Bridge building (spatial/structural)
    c) Music composition (auditory/pattern)
    d) Trade negotiation (social/practical)
  - Evolves per-topic teaching paths
  - Different players get different paths to same mastery
```

### 4. Engagement & Flow Optimization

```
BASELINE (no Atlas): Fixed pacing
  - Break reminders every 45 minutes
  - Quest length: 10-15 minutes fixed

WITH ATLAS:
  - Discovers optimal session lengths per player age/style
  - Some kids flow best in 20-min bursts, others in 60-min deep dives
  - Adapts quest pacing to match individual flow states
  - Optimizes the "one more quest" hook vs healthy break timing
  - Evolves gentle disengagement sequences for bedtime
```

### 5. Content Quality Scoring

```
BASELINE (no Atlas): All pre-gen content treated equally

WITH ATLAS:
  - Scores every quest, dialogue, and challenge by effectiveness
  - "Quest 4732 teaches multiplication but 40% of players skip it"
  - Mutates the quest design → tests variants → deploys winner
  - Bad content naturally gets replaced by better content
  - The game's 9,000 hours of content improve continuously
```

---

## Architecture

```
┌──────────────────────────────────────┐
│           ATLAS SERVER               │
│  (player's home server, optional)    │
│                                      │
│  ┌──────────┐  ┌─────────────────┐  │
│  │ Play Data│  │ Evolution Engine │  │
│  │ Analyzer │→ │ (AlphaEvolve-   │  │
│  │          │  │  inspired)       │  │
│  └──────────┘  └────────┬────────┘  │
│                          │           │
│  ┌──────────┐  ┌────────▼────────┐  │
│  │Simulation│← │  Mutation Pool  │  │
│  │ Sandbox  │  │  (candidate     │  │
│  │          │→ │   algorithms)   │  │
│  └──────────┘  └────────┬────────┘  │
│                          │           │
│                 ┌────────▼────────┐  │
│                 │  Deploy Winner  │  │
│                 │  (JSON configs) │  │
│                 └────────┬────────┘  │
└──────────────────────────┼───────────┘
                           │ WiFi sync overnight
                    ┌──────▼──────┐
                    │   DEVICE    │
                    │  (phone,    │
                    │   tablet,   │
                    │   PC)       │
                    │             │
                    │ Applies new │
                    │ parameters  │
                    │ next session│
                    └─────────────┘
```

---

## What Gets Synced (Tiny Payloads)

| Update Type | Size | Frequency |
|---|---|---|
| Calibration parameters | ~2 KB | Weekly |
| NPC behavior weights | ~10 KB | Weekly |
| Teaching path rankings | ~5 KB | Weekly |
| Flow/pacing configs | ~1 KB | Weekly |
| Content quality scores | ~20 KB | Monthly |
| **Total** | **~38 KB/week** | |

The game doesn't download new code. It downloads **parameters** that tune
existing algorithms. The on-device code never changes — only the numbers
that drive its decisions.

---

## Privacy & Ethics

- **No personal data leaves the device** unless player opts in
- Atlas analyzes AGGREGATED, ANONYMIZED play patterns
- No individual player tracking — only population-level trends
- Parents can disable Atlas sync entirely (game still works)
- All evolution serves ONE goal: help the player learn better
- NO engagement dark patterns — Atlas optimizes for LEARNING, not screen time
- Mutations that increase play time without increasing mastery are REJECTED

---

## Without Atlas

The game ships with **v1 algorithms** that work well for most players:
- Standard Bayesian IRT calibration
- Scripted NPC behavior
- Fixed teaching sequences
- Pre-tuned pacing

These are the baseline that Atlas improves upon. A player without Atlas
has a great experience. A player with Atlas has an experience that gets
better every week.

**Atlas is the invisible hand that makes good → great.**

---

## Research References

1. **AlphaEvolve** (Google DeepMind, 2025) — LLM-driven algorithm evolution
   - VAD-CFR: Volatility-adaptive game theory strategies
   - Outperformed human experts in 10/11 competitive settings
2. **Ender's Game: The Mind Game** — Adaptive difficulty that learns the player
3. **Bayesian IRT** — Item Response Theory for educational assessment
4. **Multi-Agent Reinforcement Learning** — NPC behavior evolution

---

*Previous: [25-PROCEDURAL-ASSEMBLY-ENGINE.md](25-PROCEDURAL-ASSEMBLY-ENGINE.md)*
