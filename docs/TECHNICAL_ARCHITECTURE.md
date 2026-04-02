# Technical Architecture

> System design for Nexus Academy — client, server, Atlas integration,
> content pipeline, and multi-platform deployment.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     NEXUS ACADEMY CLIENT                         │
│                                                                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Browser  │  │ Surface   │  │ Satellite    │  │ Mobile    │  │
│  │ (any)    │  │ Go Kiosk  │  │ Speaker      │  │ (PWA)     │  │
│  └────┬─────┘  └─────┬─────┘  └──────┬───────┘  └─────┬─────┘  │
│       │               │               │                │        │
│       └───────────────┼───────────────┼────────────────┘        │
│                       │               │                         │
│  ┌────────────────────┴───────────────┴──────────────────────┐  │
│  │                    Game Engine (TypeScript)                │  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌───────────┐  │  │
│  │  │ World    │  │ Quest    │  │ Craft  │  │ Companion │  │  │
│  │  │ Engine   │  │ System   │  │ System │  │ AI        │  │  │
│  │  ├──────────┤  ├──────────┤  ├────────┤  ├───────────┤  │  │
│  │  │ Physics  │  │ Mastery  │  │ Audio  │  │ Input     │  │  │
│  │  │ Engine   │  │ Tracker  │  │ Engine │  │ Manager   │  │  │
│  │  ├──────────┤  ├──────────┤  ├────────┤  ├───────────┤  │  │
│  │  │ 3D       │  │ Biome    │  │ Travel │  │ UI / HUD  │  │  │
│  │  │ Renderer │  │ Manager  │  │ System │  │ System    │  │  │
│  │  └──────────┘  └──────────┘  └────────┘  └───────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                     REST API + WebSocket                         │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────────┐
│                     NEXUS ACADEMY SERVER                         │
│                      (FastAPI / Python)                           │
│                                                                  │
│  ┌────────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Profile    │  │ Progress  │  │ Content  │  │ Sync        │  │
│  │ Service    │  │ Service   │  │ Service  │  │ Service     │  │
│  ├────────────┤  ├───────────┤  ├──────────┤  ├─────────────┤  │
│  │ Auth       │  │ Mastery   │  │ Quest    │  │ Satellite   │  │
│  │ Service    │  │ Engine    │  │ Server   │  │ Manager     │  │
│  ├────────────┤  ├───────────┤  ├──────────┤  ├─────────────┤  │
│  │ Parent     │  │ Spaced    │  │ Asset    │  │ Device      │  │
│  │ Dashboard  │  │ Repetition│  │ Pipeline │  │ Registry    │  │
│  └────────────┘  └───────────┘  └──────────┘  └─────────────┘  │
│                              │                                   │
│                    SQLite (WAL) + Atlas Module API                │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────────┐
│                        ATLAS CORTEX                              │
│                    (Nightly Batch Only)                           │
│                                                                  │
│  ┌────────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Content    │  │ Gap       │  │ Difficulty│  │ Parent      │  │
│  │ Generator  │  │ Analyzer  │  │ Tuner    │  │ Reporter    │  │
│  ├────────────┤  ├───────────┤  ├──────────┤  ├─────────────┤  │
│  │ Quest      │  │ Interest  │  │ Boredom  │  │ Curriculum  │  │
│  │ Builder    │  │ Tracker   │  │ Detector │  │ Aligner     │  │
│  ├────────────┤  ├───────────┤  ├──────────┤  ├─────────────┤  │
│  │ Fish Audio │  │ SVG/3D    │  │ World    │  │ Calibration │  │
│  │ TTS        │  │ Assets    │  │ Shaper   │  │ Engine      │  │
│  └────────────┘  └───────────┘  └──────────┘  └─────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Client Architecture

### Rendering Engine

**Primary:** Three.js (WebGL 2.0)
- Chosen for ecosystem size, documentation quality, and community support
- Falls back to Canvas 2D for very low-end devices
- Audio-only mode skips rendering entirely (satellite speakers)

**Alternative consideration:** Babylon.js
- Stronger built-in physics (Havok integration)
- Better TypeScript support out of the box
- Final choice made during Phase 1 prototyping

### Rendering Modes

| Mode | Target | Engine | Description |
|------|--------|--------|-------------|
| **3D Full** | Desktop browser, Surface Go | Three.js WebGL | Full 3D world, particle effects, shadows |
| **3D Lite** | Mobile browser, older tablets | Three.js WebGL (reduced) | Simplified geometry, fewer effects |
| **2D Canvas** | Very old devices | Canvas 2D | Sprite-based fallback, still fully playable |
| **Audio Only** | Satellite speakers | None | Voice + sound effects only, companion narrates |

### World Engine

The world is built from **biome chunks** — modular, tileable pieces that assemble
into a seamless environment.

```typescript
interface BiomeChunk {
    id: string;
    biomeType: BiomeType;
    terrain: TerrainData;        // Height map, textures
    objects: WorldObject[];      // Interactable items, NPCs, structures
    quests: QuestTrigger[];      // Quest entry points in this chunk
    ambientAudio: AudioProfile;  // Background soundscape
    connections: ChunkEdge[];    // Links to adjacent chunks
}

interface WorldObject {
    id: string;
    type: 'npc' | 'item' | 'structure' | 'portal' | 'puzzle';
    position: Vector3;
    interactionScript: string;   // Script ID for interaction behavior
    requiredKnowledge?: string[];// Skills needed to interact
    teaches?: string[];          // Skills this interaction develops
}
```

### Travel System

Travel mechanics expand as the player's knowledge grows:

**Stage 1 — Local (Little Learner)**
- Walk around the immediate area (village, garden, room)
- Companion guides: "Let's go to the garden! Walk this way!"
- No map needed — the world is small and contained

**Stage 2 — Regional (Explorer)**
- Map unlocks with compass directions
- Walk, ride animals, take boats between biomes
- Simple navigation: "The Workshop is north of the forest"
- Coordinate system introduced through map grid

**Stage 3 — Continental (Adventurer)**
- Build vehicles: carts, ships, hot air balloons
- Navigation requires math: distance, speed, time
- Fuel management: chemistry of different fuel types
- Weather affects travel: wind, currents, storms

**Stage 4 — Planetary (Scholar)**
- Build aircraft, submarines, advanced vehicles
- Physics of flight: lift, drag, thrust, weight
- Circumnavigation quests: great circle routes
- Planetary science: atmosphere, geology of distant regions

**Stage 5 — Interplanetary & Interstellar (Master)**
- Build spacecraft (requires physics, chemistry, engineering)
- Orbital mechanics: Hohmann transfers, gravity assists
- FTL/wormhole travel requires advanced math
- Navigation: stellar cartography, relativity effects
- Fuel chemistry: chemical propellants → ion drives → fusion → exotic matter
- Each new propulsion technology requires deeper knowledge to unlock
- The galaxy is vast — reaching distant systems requires mastery of physics

```
Local Village → Surrounding Biomes → Continent → Whole Planet → Orbit
→ Inner System → Outer System → Nearby Stars → Across the Galaxy

Each stage requires MORE knowledge to unlock.
The journey literally expands with what you know.
```

### Input System

Four input methods, all first-class:

| Method | Primary Use | Implementation |
|--------|-------------|---------------|
| **Touch** | Little Learner, mobile | Pointer events, gesture recognition, large hit targets |
| **Voice** | All tiers, satellite mode | Web Speech API → server STT (Whisper). Fuzzy matching for young children |
| **Keyboard + Mouse** | Explorer+, desktop | Standard WASD + mouse look. Keyboard shortcuts for inventory/crafting |
| **Gamepad** | All tiers, comfort play | Gamepad API. Xbox, PlayStation, generic controllers. Button remapping |

```typescript
interface InputManager {
    // Unified input abstraction
    onAction(action: GameAction, callback: ActionHandler): void;
    getActiveMethod(): InputMethod;

    // Input-specific features
    touch: TouchInput;      // Gesture recognition, multi-touch
    voice: VoiceInput;      // STT integration, fuzzy matching
    keyboard: KeyboardInput;// Key bindings, shortcuts
    gamepad: GamepadInput;  // Controller support, vibration
}

type InputMethod = 'touch' | 'voice' | 'keyboard_mouse' | 'gamepad';

interface GameAction {
    type: 'move' | 'interact' | 'select' | 'back' | 'inventory' |
          'speak' | 'craft' | 'map' | 'companion' | 'pause';
    payload?: any;
}
```

### Audio Engine

```typescript
interface AudioEngine {
    // Spatial audio
    setListenerPosition(pos: Vector3): void;
    playPositional(sound: SoundId, pos: Vector3, options?: AudioOptions): void;

    // TTS companion voice
    speak(text: string, emotion: EmotionType): Promise<void>;

    // Music system (layered, adaptive)
    setMusicBiome(biome: BiomeType): void;
    setMusicIntensity(level: number): void;    // 0.0 = ambient, 1.0 = action

    // Voice ducking — auto-lower music/sfx when companion speaks
    enableDucking(enabled: boolean): void;
}
```

### Offline Support

```
Service Worker
├── Cache: Static assets (3D models, textures, sounds)
├── Cache: Quest content (3-4 years ahead)
├── IndexedDB: Player progress, world state
├── IndexedDB: Pre-rendered TTS audio clips
└── Sync Queue: Pending progress updates for server
```

- Game plays fully offline with cached content
- Progress queues for sync when reconnected
- New content downloaded in background when available
- Satellite mode: server pushes content updates over LAN

---

## Server Architecture

### FastAPI Application

```
server/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment-driven configuration
│   ├── api/
│   │   ├── auth.py          # Authentication (child PIN, parent password, passkey)
│   │   ├── profiles.py      # Player profile CRUD
│   │   ├── progress.py      # Progress reporting and querying
│   │   ├── quests.py        # Quest serving and completion
│   │   ├── content.py       # Content and asset serving
│   │   ├── sync.py          # Device sync endpoint
│   │   ├── parent.py        # Parent dashboard API
│   │   └── satellite.py     # Satellite speaker management
│   ├── services/
│   │   ├── mastery.py       # Mastery evaluation (Ender Protocol)
│   │   ├── spaced_rep.py    # Spaced repetition scheduling
│   │   ├── content_mgr.py   # Content selection and caching
│   │   ├── calibration.py   # New player calibration
│   │   ├── companion.py     # Companion state management
│   │   └── screen_time.py   # Screen time tracking and limits
│   ├── atlas/
│   │   ├── bridge.py        # Atlas Cortex module API client
│   │   ├── batch.py         # Nightly batch job orchestration
│   │   └── content_gen.py   # Content generation coordination
│   └── db/
│       ├── schema.py        # Database schema (SQLite, WAL mode)
│       ├── migrations.py    # Idempotent schema migrations
│       └── queries.py       # Query helpers
├── tests/
└── config/
```

### Authentication

| Actor | Method | Security |
|-------|--------|----------|
| **Child (Little Learner)** | Avatar tap (no auth) | Device-local only, parent approval |
| **Child (Explorer+)** | PIN (4-6 digits) | Simple, child-friendly |
| **Parent** | Password or passkey | Full access to settings, reports |
| **Admin** | API key | Server management |

### API Endpoints

```
# Profiles
POST   /api/profiles              # Create player profile
GET    /api/profiles/:id          # Get profile
PUT    /api/profiles/:id          # Update profile
GET    /api/profiles/:id/progress # Full progress summary

# Quests
GET    /api/quests/next           # Get next quest for player
POST   /api/quests/:id/complete   # Report quest completion
GET    /api/quests/:id            # Get quest details

# Progress
POST   /api/progress/report       # Report learning event
GET    /api/progress/mastery      # Get mastery levels per subject
GET    /api/progress/gaps         # Get identified gaps

# Content
GET    /api/content/assets/:id    # Serve asset (texture, model, audio)
GET    /api/content/quests        # List available quests
POST   /api/content/sync          # Sync content to device

# Parent
GET    /api/parent/reports        # Progress reports
PUT    /api/parent/screen-time    # Configure screen time
GET    /api/parent/dashboard      # Dashboard summary

# Satellite
POST   /api/satellite/register    # Register satellite device
POST   /api/satellite/push        # Push content to satellite
GET    /api/satellite/status      # Device status
```

---

## Database Schema

SQLite with WAL mode and foreign keys enabled. Schema design mirrors Atlas Cortex conventions.

### Core Tables

```sql
-- Player profiles
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_data TEXT,              -- JSON: appearance customization
    age_tier TEXT NOT NULL,        -- little_learner/explorer/adventurer/scholar/master
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    settings TEXT                  -- JSON: preferences, screen time config
);

-- Authentication
CREATE TABLE auth (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
    auth_type TEXT NOT NULL,       -- none/pin/password/passkey
    auth_hash TEXT,                -- bcrypt hash
    parent_profile_id TEXT REFERENCES profiles(id)
);

-- Mastery tracking per skill
CREATE TABLE mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    skill_id TEXT NOT NULL,        -- e.g., 'math.fractions.addition'
    level REAL DEFAULT 0.0,        -- 0.0 to 1.0
    attempts INTEGER DEFAULT 0,
    successes INTEGER DEFAULT 0,
    last_attempt TIMESTAMP,
    next_review TIMESTAMP,         -- Spaced repetition schedule
    streak INTEGER DEFAULT 0,
    UNIQUE(profile_id, skill_id)
);

-- Learning events (every meaningful interaction)
CREATE TABLE learning_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    skill_id TEXT NOT NULL,
    quest_id TEXT,
    event_type TEXT NOT NULL,      -- attempt/success/failure/hint/skip
    context TEXT,                  -- JSON: biome, quest step, input method
    response_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quest definitions
CREATE TABLE quests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    biome TEXT NOT NULL,
    age_tier TEXT NOT NULL,
    skills_required TEXT,          -- JSON: prerequisite skill IDs
    skills_taught TEXT,            -- JSON: skill IDs this quest develops
    content TEXT NOT NULL,         -- JSON: full quest definition
    generated_by TEXT,             -- 'atlas' or 'handcrafted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quest progress per player
CREATE TABLE quest_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    quest_id TEXT NOT NULL REFERENCES quests(id),
    status TEXT DEFAULT 'available', -- available/active/completed/abandoned
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    steps_completed INTEGER DEFAULT 0,
    total_steps INTEGER,
    UNIQUE(profile_id, quest_id)
);

-- Companion state
CREATE TABLE companions (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
    name TEXT NOT NULL DEFAULT 'Buddy',
    appearance TEXT,               -- JSON: type, colors, accessories
    personality_stage TEXT,        -- toddler_friend/adventure_partner/ally/peer
    trust_level REAL DEFAULT 0.5,
    dialogue_history TEXT          -- JSON: recent interactions for continuity
);

-- World state per player
CREATE TABLE world_state (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
    active_biome TEXT,
    discovered_biomes TEXT,        -- JSON: list of unlocked biomes
    built_structures TEXT,         -- JSON: persistent player buildings
    inventory TEXT,                -- JSON: items, currencies
    travel_capability TEXT,        -- JSON: unlocked travel methods
    world_seed TEXT                -- Procedural generation seed
);

-- Spaced repetition schedule
CREATE TABLE review_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    skill_id TEXT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    interval_days REAL NOT NULL,
    ease_factor REAL DEFAULT 2.5,
    UNIQUE(profile_id, skill_id)
);

-- Screen time tracking
CREATE TABLE screen_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP,
    duration_minutes REAL,
    device_type TEXT               -- browser/surface/satellite/mobile
);

-- Device registry (satellites, tablets, etc.)
CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    device_type TEXT NOT NULL,     -- satellite/surface/browser/mobile
    name TEXT,
    last_seen TIMESTAMP,
    last_sync TIMESTAMP,
    cached_content_version TEXT
);

-- Atlas batch jobs
CREATE TABLE atlas_jobs (
    id TEXT PRIMARY KEY,
    job_type TEXT NOT NULL,        -- content_gen/gap_analysis/difficulty_tune/report
    profile_id TEXT REFERENCES profiles(id),
    status TEXT DEFAULT 'pending', -- pending/running/completed/failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    result TEXT                    -- JSON: job output
);

-- Parent reports
CREATE TABLE parent_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    report_type TEXT NOT NULL,     -- weekly/monthly/on_demand
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL          -- JSON: full report data
);
```

### Indexes

```sql
CREATE INDEX idx_mastery_profile ON mastery(profile_id);
CREATE INDEX idx_mastery_skill ON mastery(skill_id);
CREATE INDEX idx_events_profile ON learning_events(profile_id, timestamp);
CREATE INDEX idx_events_skill ON learning_events(skill_id);
CREATE INDEX idx_quests_biome_tier ON quests(biome, age_tier);
CREATE INDEX idx_review_due ON review_queue(profile_id, due_date);
CREATE INDEX idx_screen_time_profile ON screen_time(profile_id, session_start);
```

---

## Atlas Integration

### Module API

Atlas connects to the Nexus server via a dedicated module API. This is a
REST API that Atlas's nightly batch jobs call.

```
# Atlas → Nexus Server (nightly batch)
GET    /atlas/profiles/:id/play-data     # Get recent play data for analysis
POST   /atlas/profiles/:id/quests        # Push generated quests
POST   /atlas/profiles/:id/difficulty    # Push difficulty adjustments
POST   /atlas/profiles/:id/world-shape   # Push world modifications
GET    /atlas/profiles/:id/gaps          # Get identified knowledge gaps
POST   /atlas/reports/:id               # Push generated parent report

# Nexus Server → Atlas (on demand)
POST   /atlas/generate/quest             # Request quest generation
POST   /atlas/generate/report            # Request parent report
POST   /atlas/calibrate/:id             # Request calibration analysis
```

### Nightly Batch Flow

```
22:00 ET — Atlas batch begins
│
├── 1. Collect play data from all active profiles
│      └── Learning events, quest completions, engagement metrics
│
├── 2. Gap analysis per profile
│      ├── Identify skills with declining mastery
│      ├── Find prerequisite gaps (struggled with fractions → weak on division?)
│      └── Flag boredom patterns (low engagement biomes)
│
├── 3. Content generation
│      ├── Generate new quests for identified gaps
│      ├── Create "impossible challenge" quests for advanced players
│      ├── Build 3-4 years of content ahead per profile
│      └── Generate TTS audio for new companion dialogue
│
├── 4. Difficulty tuning
│      ├── Adjust challenge levels per skill per profile
│      ├── Modify biome complexity
│      └── Update spaced repetition schedules
│
├── 5. World shaping
│      ├── Insert new biome features based on interests
│      ├── Create narrative hooks for upcoming content
│      └── Plan "surprise events" for engagement recovery
│
├── 6. Parent report generation (weekly)
│      ├── Progress summaries with visualizations
│      ├── Strength/weakness analysis
│      └── Recommendations for real-world reinforcement
│
└── 7. Push updates to Nexus server
       ├── New quest content
       ├── Modified world state
       ├── Updated difficulty settings
       └── Sync to satellites
```

### Content Pre-Generation

Atlas generates content 3-4 YEARS ahead of the player's current level.
This ensures:

1. **No waiting.** Content is always ready when the player is.
2. **Offline capability.** Months of content cached locally.
3. **Gifted player support.** A fast-moving player never hits a content wall.
4. **Quality.** Time to validate and curate generated content before it's needed.

---

## Calibration Zone

When a new player joins at ANY age, the game runs a calibration sequence that feels
like gameplay — NOT a test.

### How It Works

1. **Welcome sequence.** Companion greets the player, explores the world together.
2. **Natural challenges.** The environment presents progressively harder challenges
   in each subject area, disguised as exploration.
3. **Adaptive difficulty.** Each response adjusts the next challenge up or down.
4. **No scores shown.** The player never knows they're being assessed.
5. **Takes 15-30 minutes.** Feels like playing the game for the first time.
6. **Result:** A complete skill profile seeded across all subject areas, informing
   initial quest selection and world configuration.

### Example (Age 10 Entry)

```
COMPANION: "Welcome to the Nexus! I'm [companion name]!
Let's explore together. Hey, look at that door — it has a puzzle lock!"

[Door puzzle: 3 + 4 = ?]  → Correct instantly → escalate
[Next: 47 + 38 = ?]       → Correct with pause → note arithmetic speed
[Next: 3 × 12 = ?]        → Correct → multiplication confirmed
[Next: 144 ÷ 12 = ?]      → Struggled → division needs work

COMPANION: "That lock was tricky! Let's try this path instead..."

[Switches to language: "The sign says 'DANGER.' What does that mean?"]
[Then science: "Why do you think this plant grows toward the light?"]
[Then logic: "If all zorps are blue, and this is a zorp, what color is it?"]
```

The calibration zone spans all subjects and builds a starter profile in 20-30
interactions, each feeling like natural exploration.

---

## Multiplayer

### Design Constraints

- **Same network only.** No internet multiplayer. Child protection is paramount.
- **No voice chat between players.** Companion mediates all interaction.
- **No competitive ranking.** Collaboration, not competition.
- **Parent approval required.** Parent enables multiplayer per profile.

### Modes

**Cooperative Quests (2-4 players)**
- Shared quest where each player contributes their strengths
- "You're good at math — calculate the trajectory. I'll handle the chemistry."
- All players earn credit for their contributions

**Classroom Mode (up to 30 students)**
- Teacher dashboard with class-wide progress view
- Shared world instance with individual progress tracking
- Teacher can assign quests, create groups, set objectives
- Works on school LAN without internet

**Sibling Play (household)**
- Siblings in the same world, each at their own level
- Older sibling can help younger (teaching reinforces learning)
- Companion adjusts: "Your sister is great at fractions — ask her for help!"

---

## Multi-Platform Deployment

### Surface Go Kiosk

Primary household device. Runs Chromium in kiosk mode:

```
┌─────────────────────────────────┐
│ Surface Go (Windows/Linux)      │
│ ┌─────────────────────────────┐ │
│ │ Chromium (kiosk mode)       │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Nexus Academy Client    │ │ │
│ │ │ (Three.js + WebGL)      │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│ Service Worker + IndexedDB      │
│ Local Nexus Server (optional)   │
└─────────────────────────────────┘
```

### Browser

Any modern browser. Progressive Web App (PWA) with installable prompt.

### Satellite Speaker (Hermes)

Audio-only mode on Atlas satellite hardware:

```
┌─────────────────────────────────┐
│ Raspberry Pi / ESP32            │
│ ┌─────────────────────────────┐ │
│ │ Nexus Voice Client          │ │
│ │ ┌────────┐ ┌──────────────┐ │ │
│ │ │ STT    │ │ Audio Engine │ │ │
│ │ │(Whisper)│ │ (TTS + SFX) │ │ │
│ │ └────────┘ └──────────────┘ │ │
│ │ Quest Logic (cached)        │ │
│ └─────────────────────────────┘ │
│ WiFi → Nexus Server (sync)     │
└─────────────────────────────────┘
```

### Mobile (PWA)

Responsive design, touch-first, reduced visual complexity.

---

## Art Direction

### Style Guide

**NOT photorealistic.** Stylized 3D that scales across age tiers:

| Tier | Style | Reference |
|------|-------|-----------|
| Little Learner (2-5) | Soft, rounded, bright, playful | Monument Valley + Dora aesthetic |
| Explorer (6-10) | Vibrant, adventurous, detailed | Zelda: Wind Waker + Minecraft |
| Adventurer (11-14) | Rich, immersive, slightly complex | Breath of the Wild |
| Scholar (15-18) | Stunning, atmospheric, sophisticated | Journey + Spiderverse |
| Master (18-24) | Elegant, clean, data-beautiful | Fez + scientific visualization |

### Color Palette

Frost (#22d3ee) and Aurora (#a78bfa) as UI accent colors across all tiers.
Each biome has its own palette that harmonizes with these accents.

### Accessibility

- **Color blind modes:** Deuteranopia, protanopia, tritanopia filters
- **High contrast mode:** Enhanced outlines, distinct visual patterns beyond color
- **Screen reader support:** Full ARIA labels, companion narrates all visual elements
- **Motor accessibility:** One-switch mode, adjustable timing, auto-aim assist
- **Cognitive accessibility:** Simplified UI mode, reduced visual clutter, slower pacing option
- **Audio descriptions:** All visual events have audio equivalents
- **Subtitle/caption system:** All spoken content has visual text option
- **Font scaling:** 50% to 200% with no layout breaking
- **Reduced motion:** Option to disable all animations and particle effects

---

## Content Pipeline Detail

### Quest Definition Format

```json
{
    "id": "quest-crystal-bridge-001",
    "title": "The Crystal Bridge",
    "biome": "crystal_caverns",
    "age_tier": "explorer",
    "estimated_minutes": 15,
    "skills": {
        "required": ["math.arithmetic.addition", "math.geometry.shapes"],
        "taught": ["math.geometry.angles", "physics.forces.balance"]
    },
    "steps": [
        {
            "type": "narrative",
            "companion_text": "Look at this cavern! There's a gap we need to cross.",
            "audio_id": "quest-crystal-bridge-001-step1"
        },
        {
            "type": "challenge",
            "prompt": "The gap is 5 meters wide. Each crystal plank is 1.5 meters long. How many planks minimum?",
            "answer_type": "number",
            "correct": 4,
            "hints": ["Think about 1.5 + 1.5 + 1.5...", "How many 1.5s fit in 5? A bit more than 3..."],
            "skills_tested": ["math.arithmetic.division", "math.number_sense.estimation"]
        },
        {
            "type": "build",
            "description": "Place the crystal planks to build the bridge.",
            "physics_enabled": true,
            "success_condition": "bridge_stable AND player_crossed"
        }
    ],
    "rewards": {
        "items": ["crystal_compass"],
        "biome_unlock": null,
        "companion_dialogue": "We make a great team! That bridge is solid."
    }
}
```

### Asset Generation

| Asset Type | Source | Format | Storage |
|-----------|--------|--------|---------|
| Quest dialogue audio | Fish Audio TTS (batch) | OGG Vorbis 44.1kHz | Content server + satellite cache |
| 3D models (procedural) | Parametric generation | glTF 2.0 | Content server + client cache |
| Textures (procedural) | Noise functions + coloring | WebP/PNG | Client cache |
| Sound effects | Pre-recorded library | OGG Vorbis 44.1kHz | Client bundle |
| Music | Composed + layered | OGG Vorbis 128kbps | Client cache |

---

## Security

### Child Protection

- **No internet multiplayer.** Same network only.
- **No user-generated content sharing.** No chat, no uploads to other players.
- **No PII in telemetry.** Progress data is profile-ID only.
- **COPPA compliance.** No email, no social features, no tracking.
- **Parent controls.** Screen time, content filters, multiplayer toggle.
- **Local-first.** All data stays on the home network by default.

### Network Security

- HTTPS for all API communication
- Authentication tokens per device with short expiry
- Satellite sync uses signed payloads
- No cloud dependency — runs entirely on local network
