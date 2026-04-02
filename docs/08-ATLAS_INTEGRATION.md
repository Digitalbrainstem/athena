# 08 — Atlas Integration

> Atlas is the invisible architect. It never appears during gameplay, never interrupts
> the player, and never makes the experience feel like school. Atlas works between
> sessions — reshaping the world, generating content, analyzing gaps, tuning difficulty,
> and producing parent reports. The game runs fully standalone without Atlas connected.
> This document defines the boundary between game and architect.

---

## The Core Rule

**Atlas operates BETWEEN sessions. Never during.**

| During Gameplay | Between Sessions (Atlas) |
|----------------|------------------------|
| All content pre-loaded | Analyzes play data |
| Physics engine is built-in | Generates new quests |
| Quest logic runs locally | Tunes difficulty |
| Companion dialogue is pre-rendered | Detects gaps |
| No LLM calls | Shapes the world |
| No network required | Produces parent reports |

A player can go MONTHS without Atlas connectivity and still have content. The game
pre-caches 3-4 years of content ahead of the player's current level. Atlas enriches
and personalizes the experience — but is never required for play.

---

## What Atlas Does

### 1. World Shaping

Atlas analyzes play patterns and reshapes the world between sessions:

- **Biome emphasis:** If the player spends 70% of time in the Workshop, expand it.
  Add new machines, deeper challenges, connected biomes.
- **Interest tracking:** Player keeps visiting the Observatory → create a storyline
  that leads from stargazing to space exploration to rocket building.
- **Boredom response:** Player hasn't visited the Library in weeks → insert an
  intriguing artifact that connects the Library to their favorite biome.
- **Challenge placement:** Insert "impossible challenges" (see [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md))
  at carefully timed intervals.

### 2. Gap Analysis

Nightly, Atlas reviews every player's learning events:

```
Gap Analysis Pipeline:
1. Identify struggling skills (high attempt count, low success rate)
2. Trace prerequisites (struggling with fractions → check division fundamentals)
3. Find root cause (the DEEPEST prerequisite that's weak)
4. Generate remediation quest (feels like a normal adventure)
5. Schedule quest delivery (next session, disguised as world event)
```

**Example:**
```
Player: Alex, age 12
Struggling with: Stoichiometry (balancing chemical equations)

Atlas traces:
  → Can they identify elements? YES (0.87 mastery)
  → Can they count atoms in formulas? STRUGGLING (0.45 mastery)
  → Can they multiply? YES (0.92 mastery)
  → ROOT CAUSE: Reading chemical formulas (subscripts vs coefficients)

Generated quest: "The Alchemist's apprentice mixed up the labels.
  H₂O has how many hydrogen atoms? What about 2H₂O?"
  (Teaches formula reading through practical lab context)
```

### 3. Content Generation

Atlas generates quests, dialogue, and assets in nightly batches:

**Quest generation:**
- Uses the player's skill profile to target specific learning gaps
- Wraps educational content in narrative appropriate to the player's interests
- Generates multiple difficulty variants of each quest
- Validates educational accuracy before caching

**Companion dialogue:**
- Generates contextual lines for new quests
- Adapts tone to the companion's current personality stage
- Pre-renders TTS audio using Fish Audio (see [17-AUDIO_DESIGN.md](17-AUDIO_DESIGN.md))

**Asset generation:**
- Procedural 3D terrain and objects for new quest areas
- SVG/texture generation for quest-specific items
- Sound effects for new interactions

### 4. Difficulty Tuning

Atlas adjusts challenge calibration per skill per player:

| Signal | Atlas Action |
|--------|-------------|
| Player completing too easily (< 10s response, 100% success) | Increase difficulty by 10-20%. Insert impossible challenge. |
| Player struggling (> 50% failure rate on skill) | Decrease difficulty. Create scaffold quests. |
| Player in flow (moderate response time, 70-85% success) | Maintain. Gradually increase over weeks. |
| Player avoiding a subject area | Create appealing entry point through their favorite biome |
| Player plateaued (no new skills for 2+ weeks) | Introduce cross-subject challenge to stimulate growth |

### 5. Parent Reports

Weekly automated reports plus on-demand:

**Weekly report contents:**
- Time played per day (graph)
- Subjects practiced (breakdown by time and interaction count)
- Skills progressing (green: advancing, yellow: steady, red: struggling)
- Identified gaps and what Atlas is doing about them
- Strengths to celebrate ("Emma mastered fractions this week!")
- Suggestions for real-world reinforcement ("Emma loves building — try LEGO or K'NEX")

**Reports are for PARENTS only.** The player never sees grades, scores, or assessments.

### 6. Curriculum Alignment

Atlas maps game progression to educational standards:

- **Common Core** (US grades K-12)
- **AP** (Advanced Placement course equivalents)
- **IB** (International Baccalaureate)
- **Custom mappings** for other frameworks (configurable)

Parents/teachers can view: "This player has covered 85% of Common Core 5th Grade
Mathematics through gameplay." But the player sees: "I built a bridge and sailed
to the island."

### 7. Companion Tuning

Atlas adjusts the companion's behavior between sessions:

- **Hint frequency:** Player needs more hints → companion offers earlier. Player is
  independent → companion steps back.
- **Dialogue complexity:** Vocabulary and sentence structure match the player's reading
  level (tracked continuously).
- **Personality emphasis:** If the player responds well to humor, more humor. If they
  prefer direct information, be more direct.
- **Emotional calibration:** After a frustrating session, next session starts with an
  easy win and companion encouragement.

---

## What Atlas Does NOT Do

1. **Does NOT generate in real-time.** All content is pre-generated and cached. No LLM
   calls during gameplay. No network dependency.

2. **Does NOT interrupt.** Atlas never pops up with a message, notification, or
   suggestion during play. The companion handles all in-session communication.

3. **Does NOT make it feel like school.** No curriculum references visible to the player.
   No "Chapter 3" or "Lesson 7." The player just plays.

4. **Does NOT judge.** No grading, no scoring, no ranking. The world responds.
   Atlas analyzes. The player explores.

5. **Does NOT share data between players.** Each player's data is isolated. No
   leaderboards, no comparisons, no "your friend is ahead of you."

6. **Does NOT require always-on connectivity.** The game works offline. Atlas
   enriches when connected.

---

## The Nightly Batch

Atlas runs a nightly batch job at 22:00 ET:

```
22:00 — Batch begins
│
├── Phase 1: Data Collection (5 min)
│   ├── Pull learning events from all active profiles
│   ├── Pull quest completion data
│   ├── Pull engagement metrics (time per biome, idle time, interaction speed)
│   └── Pull companion interaction logs
│
├── Phase 2: Analysis (15 min)
│   ├── Gap analysis per profile
│   ├── Interest evolution tracking
│   ├── Boredom pattern detection
│   ├── Tier transition readiness assessment
│   └── Spaced repetition schedule updates
│
├── Phase 3: Content Generation (30-60 min)
│   ├── Generate remediation quests for identified gaps
│   ├── Generate advancement quests for ready-to-progress skills
│   ├── Generate impossible challenges for high-performing players
│   ├── Generate 3-4 years of content ahead (incremental)
│   ├── Generate companion dialogue for new content
│   └── Validate all generated content for educational accuracy
│
├── Phase 4: Asset Rendering (20-30 min)
│   ├── Render TTS audio for new dialogue (Fish Audio batch)
│   ├── Generate procedural 3D assets for new quest areas
│   └── Generate sound effects for new interactions
│
├── Phase 5: Difficulty & World Update (10 min)
│   ├── Push difficulty adjustments per skill per profile
│   ├── Push world shape modifications (biome emphasis, new features)
│   ├── Update spaced repetition schedules
│   └── Schedule impossible challenges
│
├── Phase 6: Reports (10 min, weekly only)
│   ├── Generate parent progress reports
│   ├── Generate curriculum alignment reports
│   └── Generate teacher dashboards (if classroom mode)
│
└── Phase 7: Distribution (5-10 min)
    ├── Push new content to game server cache
    ├── Update satellite content (see below)
    └── Log batch completion metrics
```

Total batch time: ~60-120 minutes depending on active player count.

---

## Atlas Module API

The game server communicates with Atlas through a dedicated REST API.

### Atlas → Game Server (push after batch)

```
POST   /atlas/profiles/{id}/quests         — Push generated quests
POST   /atlas/profiles/{id}/difficulty      — Push difficulty adjustments
POST   /atlas/profiles/{id}/world-shape     — Push world modifications
POST   /atlas/profiles/{id}/companion-tune  — Push companion adjustments
POST   /atlas/reports/{id}                  — Push parent reports
```

### Game Server → Atlas (pull for batch)

```
GET    /atlas/profiles/{id}/play-data       — Recent learning events
GET    /atlas/profiles/{id}/mastery         — Current mastery profile
GET    /atlas/profiles/{id}/engagement      — Engagement metrics
POST   /atlas/calibrate/{id}               — Request calibration analysis
```

### On-Demand (not batch)

```
POST   /atlas/generate/quest               — Emergency quest generation
POST   /atlas/generate/report              — On-demand parent report
```

---

## The Game Without Atlas

If Atlas is unreachable (offline mode, network failure, Atlas maintenance):

1. **Game plays normally.** All pre-cached content is available.
2. **Spaced repetition continues.** Review schedules run locally using cached intervals.
3. **New quests come from the cache.** 3-4 years of pre-generated content.
4. **Difficulty stays at last-set levels.** No dynamic adjustment until Atlas reconnects.
5. **Progress queues locally.** Learning events stored in local DB, synced when reconnected.
6. **Companion uses cached dialogue.** No new personality adjustments, but existing works.

When Atlas reconnects:
1. Sync queued progress data
2. Run gap analysis on new data
3. Generate fresh content based on updated profile
4. Push updates to the game server
5. The player notices nothing — just that the world has new stuff next session.

---

## Atlas Implementation in Cortex

Atlas integration lives in the `cortex/` codebase as a module:

```
atlas-cortex/
└── cortex/
    └── athena/                    # Atlas module for Nexus Academy
        ├── __init__.py
        ├── batch.py               # Nightly batch orchestration
        ├── gap_analysis.py        # Prerequisite tracing, root cause identification
        ├── content_gen.py         # Quest generation using LLM
        ├── difficulty.py          # Challenge calibration per skill
        ├── world_shaper.py        # Biome modification, feature placement
        ├── companion_tuner.py     # Companion personality/dialogue adjustment
        ├── reports.py             # Parent report generation
        ├── curriculum.py          # Educational standard alignment
        └── validators.py          # Content accuracy validation
```

The module uses Atlas Cortex's existing LLM pipeline (Qwen3-4B or similar) for content
generation, Fish Audio TTS for voice rendering, and the standard SQLite database for
player data storage.

---

## Content Pre-Generation Strategy

Atlas generates content 3-4 YEARS ahead. Here's why and how:

**Why 3-4 years:**
- Gifted players can accelerate rapidly — they should never hit a content wall
- Offline periods can last months — always have fresh content available
- Quality improves with lead time — content can be validated and refined
- Seasonal/thematic content can be pre-planned (holiday quests, world events)

**How it works:**
1. Atlas projects the player's learning trajectory based on current pace
2. Generates content for skills 3-4 years ahead of current mastery
3. Content is cached on the game server AND on satellite devices
4. As the player progresses, they encounter content that was generated months ago
5. Atlas continuously refreshes the leading edge of the cache

**Cache size per player:** ~500 MB of quest data, dialogue audio, and procedural assets.
Easily fits on a Surface Go or Raspberry Pi.

---

*Previous: [07-SUBJECT_MAPPING.md](07-SUBJECT_MAPPING.md) — Subject to game mechanic mapping.*
*Next: [09-CONTENT_PIPELINE.md](09-CONTENT_PIPELINE.md) — Content authoring, generation, and distribution.*
