# 15 — Profiles & Progression

> Every player has a profile that tracks their world state, mastery data, companion
> relationship, and preferences across all devices. New players enter through the
> Calibration Zone — a gameplay sequence that feels like playing, not testing, and
> produces a complete skill profile in 15-30 minutes. Progress syncs across devices
> and persists offline. This document covers profiles, calibration, sync, and the
> progression system.

---

## Player Profiles

### What a Profile Contains

| Category | Data | Example |
|----------|------|---------|
| **Identity** | Name, avatar, age tier | "Emma, bear avatar, Explorer" |
| **World state** | Active biome, discovered biomes, structures, inventory | "Crystal Caverns, 3 biomes discovered, 2 bridges built" |
| **Interests** | Behavior-detected interest profile, theme weights | "animals: 0.7, sparkly: 0.4, machines: 0.2" |
| **Mastery** | Per-skill mastery levels across all subjects | "math.fractions: 0.72, physics.forces: 0.45" |
| **Companion** | Name, appearance, personality stage, memory | "Buddy, blue bear, adventure partner, remembers Crystal Cave" |
| **Story** | Codex fragments discovered, story progress | "12/50 Founders fragments found" |
| **Travel** | Unlocked travel methods, vehicles built | "Walking, horse, basic cart, sailing ship" |
| **Preferences** | Input method, voice profile, UI settings | "Touch primary, warm voice, large text" |
| **Schedule** | Spaced repetition queue, upcoming reviews | "5 reviews due today across math and chemistry" |
| **History** | Session log, learning events, quest completions | "Completed 147 quests, 2,340 learning events" |

### Interest Profile

Every player has a behavior-detected interest profile that drives world theming
(see [02-WORLD_DESIGN.md](02-WORLD_DESIGN.md) for the full interest-driven theming system).

**How interests are tracked:**
- Time spent in each biome type
- Objects interacted with (animals, machines, crystals, plants, stars…)
- Choices made when presented with options ("Left to the forest or right to the workshop?")
- Items collected and kept vs. discarded
- Quests completed vs. abandoned, by theme
- Companion conversations initiated, by topic

**How interests are NOT tracked:**
- Never from demographic data (no gender, no age-based assumptions)
- Never from avatar appearance (pink hair ≠ "likes girly things")
- Never from name (no gendered name inference)
- Never asked directly — the game watches behavior, never surveys

**Interest weights** are floating-point values (0.0–1.0) per theme category:
```
animals: 0.7, nature: 0.5, sparkly: 0.4, machines: 0.2,
space: 0.3, art: 0.1, building: 0.6, social: 0.2, stories: 0.3
```

Weights change continuously based on recent sessions. A player who abandons machines
for animals will see machine weight decay and animal weight rise over several sessions.
Themes blend — the world reflects ALL interests proportionally, not just the top one.

### Profile Creation

**Little Learner (2–5):**
- Parent creates the profile
- Child picks avatar from large, colorful options (no typing required)
- Child picks companion form and names it (voice or parent types)
- Calibration zone runs automatically on first play

**Explorer+ (6+):**
- Player creates with parent oversight
- Avatar builder with customization options
- Companion selection and naming
- NO interest questionnaire — interests are detected through play (see [00-CORE_PRINCIPLES.md](00-CORE_PRINCIPLES.md), Principle V)
- Calibration zone adapts to indicated age and detects initial interests through gameplay choices

### Authentication

| Actor | Method | Details |
|-------|--------|---------|
| Little Learner (2–5) | Avatar tap | Big avatar icons on home screen. Tap to play. No auth. |
| Explorer (6–10) | PIN (4 digits) | Simple, child-friendly. Set by parent. |
| Adventurer+ (11+) | PIN (4-6 digits) or password | Player chooses. |
| Parent | Password or passkey | Full access to settings, reports, all profiles. |

---

## The Calibration Zone

When a new player joins at ANY age, the game runs a calibration sequence that feels
like the first play session — not an assessment.

### How It Works

1. **Welcome:** Companion greets the player, introduces itself, begins exploring together
2. **Natural challenges:** Environment presents progressively harder challenges per subject
3. **Binary search:** Each response adjusts the next challenge up or down on the skill scale
4. **No scores visible:** Player never knows they're being assessed
5. **Feels like gameplay:** Same mechanics, same rewards, same companion behavior
6. **Duration:** 15-30 minutes (20-30 interactions across subjects)
7. **Result:** Complete skill profile seeded across all subject areas

### Calibration Accuracy

The zone uses adaptive testing with binary search:

```
Start at age-expected level
  → Correct (fast)   → jump up 2 levels
  → Correct (slow)   → jump up 1 level  
  → Incorrect        → drop 1 level
  → No attempt       → skip subject, try later
  
3-5 interactions per subject → ±1 level accuracy
Covers: math, reading, science, logic, spatial, vocabulary
```

### Example: Age 10 Entry

```
COMPANION: "Welcome to the Nexus! I'm Spark! Let's explore!
Hey, look at that door — it has a puzzle lock!"

[Door: 3 + 4 = ?]           → Instant correct → escalate fast
[Next: 47 + 38 = ?]         → Correct, 5 sec → arithmetic solid, note speed
[Next: 3 × 12 = ?]          → Correct → multiplication confirmed
[Next: 144 ÷ 12 = ?]        → Struggled, 15 sec → division flagged
[Next: ½ + ¼ = ?]            → Correct → fractions started
[Switch subject]
[Sign: "LUMINESCENT"]       → "What does it mean?" → vocabulary probe
[Plant grows toward light]  → "Why?" → science probe
[Logic: "All zorps are blue. This is a zorp. What color?"] → logic probe
[Pattern: 2, 4, 8, 16, ?]  → "32!" → sequences confirmed
[Coordinate: "Treasure at (5,3)"] → spatial probe
```

Each subject sampled in 3-5 interactions. Within 20-30 total, the game has a starter
profile covering every subject area. The player has been having fun the entire time.

### Calibration at Different Ages

| Entry Age | Calibration Focus | Starting Point |
|-----------|------------------|---------------|
| 2-3 | Colors, counting 1-5, shapes, animal sounds | Lowest level |
| 4-5 | Counting 1-20, letters, phonics, patterns | Little Learner mid |
| 6-8 | Arithmetic, reading, basic science, logic | Explorer start |
| 9-10 | All arithmetic, fractions, pre-algebra, geography | Explorer mid |
| 11-13 | Algebra, basic sciences, history, programming | Adventurer start |
| 14-16 | Geometry, trig, chemistry, physics, CS | Adventurer-Scholar |
| 17-18 | Pre-calc/calc, advanced sciences, literature | Scholar |
| 19-24 | College-level math, sciences, engineering | Scholar-Master |

### Re-Calibration

Calibration isn't just for new players. Atlas runs soft re-calibration continuously:

- Every learning event updates the mastery profile
- Every spaced repetition result refines the estimate
- If a player returns after a long absence, the companion runs a gentle re-calibration:
  "It's been a while! Let's warm up with some of your favorite challenges."
- Re-calibration is NEVER announced or visible. It's just the game adapting.

---

## Multi-Device Sync

### How Sync Works

```
Device A (Surface Go)
  │ play → progress events saved locally
  │ connected → sync to server
  └─── Server (game server on LAN)
         │
         ├── merge progress
         │
  ┌──────┘
Device B (tablet browser)
  │ play → progress continues
  │ connected → sync to server
  └─── pulls latest state

Device C (satellite speaker)
  │ play → progress cached on device
  │ reconnects → sync to server
  └─── pulls content updates
```

### Conflict Resolution

| Conflict Type | Resolution |
|--------------|-----------|
| Same skill, different mastery | Highest mastery wins (can't un-learn) |
| Different quests completed | Union (both count) |
| World state differences | Most recent timestamp wins per biome |
| Inventory | Union with dedup |
| Companion state | Most recent interaction wins |

### Offline Support

- All progress saved locally first, always
- Sync happens when device connects to server (LAN or local)
- Player can go days/weeks offline — local cache has months of content
- When reconnecting: progress uploads, new content downloads
- No data loss — progress never depends on connectivity

---

## Progression Tracking

### What's Tracked

Every meaningful interaction generates a **learning event**:

```json
{
  "profile_id": "emma-001",
  "skill_id": "math.fractions.addition",
  "quest_id": "quest-crystal-bridge-001",
  "event_type": "attempt",
  "success": true,
  "response_time_ms": 4200,
  "context": {
    "biome": "crystal_caverns",
    "quest_step": 2,
    "input_method": "voice",
    "hint_used": false,
    "attempt_number": 1
  },
  "timestamp": "2025-07-15T14:23:07Z"
}
```

### Progression Visibility

| Audience | What They See |
|----------|--------------|
| **Player (child)** | World expansion, new biomes, companion comments, built structures |
| **Parent** | Mastery per subject, weekly reports, strengths/gaps, recommendations |
| **Teacher** | Class-wide mastery, individual profiles, curriculum alignment |
| **Atlas** | Raw learning events, engagement metrics, gap analysis input |

The player NEVER sees:
- Numerical scores
- Letter grades
- Percentage correct
- "You're at level 7"
- Comparison to other players
- "Areas for improvement"

The player DOES notice:
- "I can build bigger bridges now"
- "The companion treats me differently — more like a friend than a teacher"
- "The world has SO much more in it than when I started"
- "I solved that hard puzzle on the first try!"

---

## Parent Dashboard

Parents access the dashboard through the Nexus server web UI or Atlas admin panel:

### Dashboard Views

**Overview:**
- Time played this week (graph)
- Subjects active (pie chart)
- Skills advancing (green list)
- Skills needing attention (yellow/red — with explanation)
- Next milestones approaching

**Subject Detail:**
- Skill tree visualization per subject
- Mastery levels shown as filled/empty nodes
- "Emma has mastered addition and subtraction. Fractions are 72% — she's working on adding unlike denominators."
- Suggested real-world activities: "Emma loves building — try LEGO or K'NEX for geometry reinforcement."

**Curriculum Alignment:**
- Maps to Common Core, AP, or chosen standard
- "Emma has covered 85% of 3rd-grade Common Core Math through gameplay"
- Exportable as PDF for school communication

**Session History:**
- When the child played, for how long, on which device
- What subjects were practiced
- Notable achievements

---

## Screen Time Integration

Profiles include screen time configuration (see [20-SCREEN_TIME_SAFETY.md](20-SCREEN_TIME_SAFETY.md)):

| Setting | Default | Options |
|---------|---------|---------|
| Session limit | Unlimited | 15 min – 4 hours |
| Daily limit | Unlimited | 30 min – 8 hours |
| Allowed hours | All hours | Configurable start/end times |
| Break reminders | Every 30 min | 15 – 60 min intervals |
| Break enforcement | Gentle (suggestion only) | Gentle / Firm (session pause) |

These settings are per-profile and parent-controlled.

---

## Research Required

Before building against this document, complete the following research:

- [ ] **Adaptive testing for calibration** — Study Item Response Theory (IRT) and Computerized Adaptive Testing (CAT). Review how the GRE, GMAT, and MAP Growth assessments calibrate student ability in 20-30 items. Adapt for gameplay-disguised calibration.
- [ ] **Offline-first database sync** — Evaluate CRDTs (Conflict-free Replicated Data Types) for multi-device progress merge. Study Automerge, Yjs, and cr-sqlite. Benchmark sync performance for our data model.
- [ ] **Child profile UX** — Review how existing children's platforms handle profiles: Netflix Kids, Disney+, PBS Kids, Khan Academy Kids. Identify best practices for avatar-based login and minimal-auth flows.
- [ ] **Interest profiling without demographics** — Research recommendation systems that avoid demographic bias. Study Spotify's taste profile system. Review fairness-aware recommendation research. Ensure our interest tracking can't inadvertently create gendered clusters.
- [ ] **Progress data visualization for parents** — Study how to present educational progress without triggering parental anxiety. Review Khan Academy parent dashboard, ClassDojo reports, and Seesaw portfolios. Design for encouragement, not surveillance.

---

*Previous: [14-MULTIPLAYER.md](14-MULTIPLAYER.md) — Multiplayer and classroom mode.*
*Next: [16-ART_DIRECTION.md](16-ART_DIRECTION.md) — Visual style and art direction.*
