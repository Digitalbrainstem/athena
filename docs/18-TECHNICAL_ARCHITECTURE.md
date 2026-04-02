# 18 — Technical Architecture

> The technical foundation of Nexus Academy: a Three.js client, a FastAPI server,
> SQLite database, Atlas module integration, offline/sync system, and multi-platform
> deployment. The game runs entirely on a local network — no cloud dependency. This
> document covers the full technical stack, key interfaces, database schema, and
> deployment architecture.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT (TypeScript / Three.js)              │
│                                                             │
│  World Engine │ Quest System │ Craft System │ Companion AI  │
│  Physics      │ Mastery Track│ Audio Engine │ Input Manager │
│  3D Renderer  │ Biome Mgr    │ Travel System│ UI / HUD      │
│                                                             │
│  Platforms: Browser │ Surface Go Kiosk │ Mobile PWA │ Audio │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API + WebSocket
┌───────────────────────────┴─────────────────────────────────┐
│                  SERVER (Python / FastAPI)                    │
│                                                             │
│  Profile Service │ Progress Service │ Content Service       │
│  Auth Service    │ Mastery Engine   │ Quest Server          │
│  Parent Dashboard│ Spaced Repetition│ Asset Pipeline        │
│  Satellite Mgr   │ Screen Time      │ Classroom Mgr        │
│                                                             │
│  Database: SQLite (WAL mode) │ Atlas Module API             │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (nightly batch)
┌───────────────────────────┴─────────────────────────────────┐
│                  ATLAS CORTEX (Nightly Batch)                │
│                                                             │
│  Content Generator │ Gap Analyzer │ Difficulty Tuner        │
│  Quest Builder     │ Interest Track│ Boredom Detector       │
│  Fish Audio TTS    │ World Shaper │ Parent Reporter         │
└─────────────────────────────────────────────────────────────┘
```

---

## Client Architecture

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript (strict mode) |
| 3D Engine | Three.js (WebGL 2.0) |
| Build | Vite |
| Testing | Vitest |
| Audio | Web Audio API |
| Offline | Service Worker + IndexedDB |
| State | Custom store (no framework dependency) |

### Directory Structure

```
client/
├── src/
│   ├── engine/
│   │   ├── world.ts          # World engine — chunk loading, biome management
│   │   ├── physics.ts        # Physics engine — collision, gravity, structural analysis
│   │   ├── renderer.ts       # Three.js renderer — LOD, post-processing, mode switching
│   │   └── travel.ts         # Travel system — vehicles, navigation, orbital mechanics
│   ├── game/
│   │   ├── quest.ts          # Quest system — loading, execution, state tracking
│   │   ├── craft.ts          # Crafting — recipe system, chemistry validation
│   │   ├── build.ts          # Building — structure placement, physics validation
│   │   ├── economy.ts        # Economy — trading, currency, market simulation
│   │   └── codeforge.ts      # Code Forge — in-game programming environment
│   ├── companion/
│   │   ├── companion.ts      # Companion AI — dialogue selection, personality state
│   │   ├── memory.ts         # Companion memory — short-term and long-term
│   │   └── teaching.ts       # Teaching interactions — "Can you explain this?"
│   ├── audio/
│   │   ├── engine.ts         # Audio engine — spatial audio, mixer, ducking
│   │   ├── music.ts          # Adaptive music — layer management, crossfade
│   │   ├── sfx.ts            # Sound effects — library management, playback
│   │   └── tts.ts            # TTS integration — Fish Audio, Qwen3-TTS
│   ├── input/
│   │   ├── manager.ts        # Input manager — unified action system
│   │   ├── touch.ts          # Touch input — gestures, hit detection
│   │   ├── voice.ts          # Voice input — STT integration, fuzzy matching
│   │   ├── keyboard.ts       # Keyboard/mouse — key bindings, remapping
│   │   └── gamepad.ts        # Gamepad — controller mapping, haptics
│   ├── ui/
│   │   ├── hud.ts            # HUD — health, inventory icons, compass
│   │   ├── inventory.ts      # Inventory UI — grid, drag-and-drop
│   │   ├── map.ts            # Map UI — world map, mini-map, coordinates
│   │   ├── quest-log.ts      # Quest log — active, completed, story fragments
│   │   └── crafting-ui.ts    # Crafting interface — recipe browser, workbench
│   ├── net/
│   │   ├── api.ts            # Server API client — REST calls
│   │   ├── sync.ts           # Offline sync — queue, merge, conflict resolution
│   │   ├── cache.ts          # Content cache — IndexedDB management
│   │   └── multiplayer.ts    # Multiplayer — LAN discovery, session management
│   └── main.ts               # Entry point
├── assets/
├── public/
└── tests/
```

### Key Interfaces

```typescript
// World chunk — the building block of the game world
interface BiomeChunk {
    id: string;
    biomeType: BiomeType;
    terrain: TerrainData;
    objects: WorldObject[];
    quests: QuestTrigger[];
    ambientAudio: AudioProfile;
    connections: ChunkEdge[];
}

// Every interactable thing in the world
interface WorldObject {
    id: string;
    type: 'npc' | 'item' | 'structure' | 'portal' | 'puzzle' | 'vehicle';
    position: Vector3;
    interactionScript: string;
    requiredKnowledge?: string[];
    teaches?: string[];
}

// Unified input action
interface GameAction {
    type: 'move' | 'interact' | 'select' | 'back' | 'inventory' |
          'speak' | 'craft' | 'map' | 'companion' | 'pause';
    source: InputMethod;
    payload?: unknown;
}
```

---

## Server Architecture

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | Python 3.11+ |
| Framework | FastAPI |
| Database | SQLite (WAL mode, foreign keys) |
| Testing | pytest (asyncio_mode = auto) |
| TTS | Fish Audio (via Atlas) |
| Auth | bcrypt (PIN/password hashing) |

### Directory Structure

```
server/
├── app/
│   ├── main.py               # FastAPI app, startup, middleware
│   ├── config.py              # Environment-driven configuration
│   ├── api/
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── profiles.py        # Profile CRUD
│   │   ├── progress.py        # Progress reporting
│   │   ├── quests.py          # Quest serving
│   │   ├── content.py         # Content/asset serving
│   │   ├── sync.py            # Device sync
│   │   ├── parent.py          # Parent dashboard
│   │   ├── satellite.py       # Satellite management
│   │   └── classroom.py       # Classroom mode
│   ├── services/
│   │   ├── mastery.py         # Ender Protocol mastery evaluation
│   │   ├── spaced_rep.py      # SM-2 spaced repetition
│   │   ├── content_mgr.py     # Content selection, caching
│   │   ├── calibration.py     # New player calibration
│   │   ├── companion.py       # Companion state management
│   │   └── screen_time.py     # Screen time tracking
│   ├── atlas/
│   │   ├── bridge.py          # Atlas module API client
│   │   ├── batch.py           # Nightly batch integration
│   │   └── content_gen.py     # Content generation coordination
│   └── db/
│       ├── schema.py          # Database schema
│       ├── migrations.py      # Idempotent migrations
│       └── queries.py         # Query helpers
└── tests/
```

### API Endpoints

```
# Auth
POST   /api/auth/login          # Authenticate (PIN, password, or passkey)
POST   /api/auth/parent         # Parent authentication

# Profiles
POST   /api/profiles            # Create profile
GET    /api/profiles/:id        # Get profile
PUT    /api/profiles/:id        # Update profile
GET    /api/profiles            # List profiles (for home screen)

# Progress
POST   /api/progress/event      # Report learning event
GET    /api/progress/mastery    # Get mastery levels
GET    /api/progress/gaps       # Get identified gaps
GET    /api/progress/schedule   # Get spaced repetition schedule

# Quests
GET    /api/quests/next         # Get next quest(s) for player
POST   /api/quests/:id/complete # Report quest completion
GET    /api/quests/:id          # Get quest details + assets

# Content
GET    /api/content/assets/:id  # Serve asset (model, texture, audio)
POST   /api/content/sync        # Sync content to device (delta)

# Parent
GET    /api/parent/reports      # Progress reports
PUT    /api/parent/screen-time  # Configure screen time
GET    /api/parent/dashboard    # Dashboard data

# Satellite
POST   /api/satellite/register  # Register device
POST   /api/satellite/push      # Push content
GET    /api/satellite/status    # Device status

# Classroom
POST   /api/classroom/create    # Create classroom session
GET    /api/classroom/:id/dashboard  # Teacher dashboard data
POST   /api/classroom/:id/assign     # Assign quest to class/group

# Atlas Module (called by Atlas Cortex)
POST   /api/atlas/quests        # Push generated quests
POST   /api/atlas/difficulty    # Push difficulty adjustments
POST   /api/atlas/world-shape   # Push world modifications
GET    /api/atlas/play-data     # Get play data for batch
```

---

## Database Schema

SQLite with WAL mode. Mirrors Atlas Cortex conventions.

### Core Tables

```sql
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_data TEXT,               -- JSON
    age_tier TEXT NOT NULL,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    settings TEXT                    -- JSON: preferences, screen time config
);

CREATE TABLE auth (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
    auth_type TEXT NOT NULL,        -- none/pin/password/passkey
    auth_hash TEXT,
    parent_profile_id TEXT REFERENCES profiles(id)
);

CREATE TABLE mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    skill_id TEXT NOT NULL,
    level REAL DEFAULT 0.0,
    retention_score REAL DEFAULT 0.0,
    transfer_score REAL DEFAULT 0.0,
    depth_score REAL DEFAULT 0.0,
    attempts INTEGER DEFAULT 0,
    successes INTEGER DEFAULT 0,
    last_attempt TIMESTAMP,
    next_review TIMESTAMP,
    ease_factor REAL DEFAULT 2.5,
    streak INTEGER DEFAULT 0,
    UNIQUE(profile_id, skill_id)
);

CREATE TABLE learning_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    skill_id TEXT NOT NULL,
    quest_id TEXT,
    event_type TEXT NOT NULL,       -- attempt/success/failure/hint/skip/teach
    context TEXT,                   -- JSON
    response_time_ms INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    biome TEXT NOT NULL,
    age_tier TEXT NOT NULL,
    skills_required TEXT,           -- JSON
    skills_taught TEXT,             -- JSON
    content TEXT NOT NULL,          -- JSON: full quest definition
    generated_by TEXT,              -- atlas/handcrafted/player
    validated INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quest_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    quest_id TEXT NOT NULL REFERENCES quests(id),
    status TEXT DEFAULT 'available',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    steps_completed INTEGER DEFAULT 0,
    UNIQUE(profile_id, quest_id)
);

CREATE TABLE companions (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
    name TEXT NOT NULL DEFAULT 'Buddy',
    appearance TEXT,                -- JSON
    personality_stage TEXT,
    trust_level REAL DEFAULT 0.5,
    traits TEXT,                    -- JSON: personality traits
    memory TEXT                     -- JSON: long-term memory
);

CREATE TABLE world_state (
    profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
    active_biome TEXT,
    discovered_biomes TEXT,         -- JSON
    built_structures TEXT,          -- JSON
    inventory TEXT,                 -- JSON
    travel_capability TEXT,         -- JSON
    world_seed TEXT
);

CREATE TABLE screen_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL REFERENCES profiles(id),
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP,
    duration_minutes REAL,
    device_type TEXT
);

CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    device_type TEXT NOT NULL,
    name TEXT,
    last_seen TIMESTAMP,
    last_sync TIMESTAMP,
    cached_content_version TEXT
);
```

### Indexes

```sql
CREATE INDEX idx_mastery_profile ON mastery(profile_id);
CREATE INDEX idx_mastery_skill ON mastery(skill_id);
CREATE INDEX idx_events_profile_time ON learning_events(profile_id, timestamp);
CREATE INDEX idx_events_skill ON learning_events(skill_id);
CREATE INDEX idx_quests_biome_tier ON quests(biome, age_tier);
CREATE INDEX idx_quest_progress_profile ON quest_progress(profile_id, status);
```

---

## Offline & Sync

### Client Offline Architecture

```
Service Worker
├── Static Cache: JS, CSS, HTML, 3D models, textures, sounds
├── Content Cache: Quest definitions + TTS audio (IndexedDB)
├── Progress Store: Local mastery data, learning events (IndexedDB)
└── Sync Queue: Pending uploads for server
```

### Sync Protocol

```
1. Client connects to server (LAN)
2. Upload queued learning events (POST /api/progress/event — batch)
3. Upload quest completions
4. Download mastery updates (server may have merged from other devices)
5. Download new quest content (delta since last sync)
6. Download world state updates (Atlas modifications)
7. Update local cache
8. Timestamp sync completion
```

### Conflict Resolution

| Data | Resolution Strategy |
|------|-------------------|
| Mastery levels | Max(local, server) — can't un-learn |
| Learning events | Union — all events from all devices |
| Quest completions | Union — completed on any device = completed |
| World state | Last-write-wins per field |
| Inventory | Union with dedup |

---

## Atlas-Optional Architecture

The game uses a provider pattern to abstract Atlas dependency. Every system that can
be enhanced by Atlas has a built-in fallback. See [08-ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md)
for the full Standalone vs. Atlas-Enhanced comparison.

### Provider Interface

```typescript
// Content provider — serves quests and assets
interface ContentProvider {
    getNextQuests(profileId: string, count: number): Promise<Quest[]>;
    getAsset(assetId: string): Promise<Asset>;
}

// Difficulty provider — calibrates challenge levels
interface DifficultyProvider {
    getDifficultyForSkill(profileId: string, skillId: string): number;
    reportLearningEvent(event: LearningEvent): void;
}

// Interest provider — tracks and responds to player interests
interface InterestProvider {
    getInterestProfile(profileId: string): InterestWeights;
    reportInteraction(profileId: string, interaction: Interaction): void;
}

// Companion provider — manages companion dialogue and personality
interface CompanionProvider {
    getDialogue(context: DialogueContext): CompanionLine;
    getPersonalityState(profileId: string): PersonalityState;
}
```

### Standalone Providers (Built-In)

```python
class StandaloneContentProvider:
    """Serves quests from the handcrafted content library."""
    
    def get_next_quests(self, profile_id: str, count: int) -> list[Quest]:
        # Select from 1000+ handcrafted quests based on:
        # - Player's current mastery levels
        # - Spaced repetition schedule
        # - Biome the player is in
        # - Basic interest heuristics
        ...

class StandaloneDifficultyProvider:
    """Static difficulty curves with sensible defaults."""
    
    def get_difficulty(self, profile_id: str, skill_id: str) -> float:
        # Use mastery level to set difficulty
        # Simple formula: difficulty = mastery_level + 0.1 (slight stretch)
        # Clamp to [0.0, 1.0]
        ...

class StandaloneInterestProvider:
    """Tracks interests using local heuristics."""
    
    def get_interest_profile(self, profile_id: str) -> InterestWeights:
        # Weighted average of recent interactions:
        # - Time in biome (40% weight)
        # - Objects interacted with (30% weight)
        # - Choices made (20% weight)
        # - Items kept vs discarded (10% weight)
        ...
```

### Atlas Providers (Enhanced)

```python
class AtlasContentProvider:
    """Serves personalized quests from Atlas-generated content."""
    
    def get_next_quests(self, profile_id: str, count: int) -> list[Quest]:
        # Check Atlas-generated quest cache first
        # Fall back to handcrafted if cache is empty
        # Quests are targeted to specific gaps and interests
        ...

class AtlasDifficultyProvider:
    """Full Ender Protocol adaptive difficulty."""
    
    def get_difficulty(self, profile_id: str, skill_id: str) -> float:
        # Uses gap analysis results from nightly batch
        # Implements impossible challenges
        # Tracks flow state per skill
        ...
```

### Provider Selection at Startup

```python
async def initialize_providers():
    """Select providers based on Atlas availability."""
    atlas_available = await check_atlas_connection()
    
    if atlas_available:
        content = AtlasContentProvider(atlas_url=config.ATLAS_URL)
        difficulty = AtlasDifficultyProvider(atlas_url=config.ATLAS_URL)
        interest = AtlasInterestProvider(atlas_url=config.ATLAS_URL)
        companion = AtlasCompanionProvider(atlas_url=config.ATLAS_URL)
        log.info("Atlas connected — using enhanced providers")
    else:
        content = StandaloneContentProvider(content_dir=config.CONTENT_DIR)
        difficulty = StandaloneDifficultyProvider()
        interest = StandaloneInterestProvider()
        companion = StandaloneCompanionProvider(dialogue_dir=config.DIALOGUE_DIR)
        log.info("Atlas not available — using standalone providers")
    
    return Providers(content, difficulty, interest, companion)
```

### Health Check and Failover

The game periodically checks Atlas connectivity (every 5 minutes):
- If Atlas was connected and goes down → seamless fallback to standalone providers
- If Atlas was down and comes up → seamless upgrade to Atlas providers
- Progress accumulated during standalone mode is synced on reconnection
- The player NEVER notices the switch

---

## Deployment

### Surface Go Kiosk

Primary household device:

```
Surface Go (Windows or Linux)
└── Chromium (kiosk mode, full-screen)
    └── Nexus Academy Client (Three.js)
        ├── Service Worker (offline)
        └── IndexedDB (content cache)

+ Local Nexus Server (optional — can run on same device or separate)
```

### Browser

Any modern browser. PWA installable:
- Chrome, Edge, Firefox, Safari
- Automatic service worker registration
- "Add to Home Screen" prompt

### Satellite (Hermes)

```
Raspberry Pi / ESP32
└── Nexus Voice Client
    ├── Whisper STT (local on Pi, or server-side)
    ├── Audio Engine (TTS + SFX)
    ├── Quest Logic (cached JSON)
    └── WiFi → Game Server (sync)
```

### Docker Deployment (Optional)

```yaml
services:
  nexus-server:
    build: ./server
    ports: ["5200:5200"]
    volumes:
      - ./data:/app/data        # SQLite database
      - ./content:/app/content  # Content cache
    environment:
      - ATLAS_URL=http://atlas-cortex:5100
      - DATABASE_PATH=/app/data/nexus.db
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Client FPS (Surface Go) | 30 FPS stable |
| Client FPS (Desktop) | 60 FPS |
| API response time | < 100ms (local network) |
| Content sync | < 30s for daily delta |
| Quest load time | < 2s (including assets) |
| TTS latency (pre-rendered) | < 50ms |
| TTS latency (real-time) | < 500ms |
| Offline startup | < 5s |
| Memory (client) | < 512 MB |
| Storage (per player cache) | < 500 MB |

---

## Security

### Child Protection

- No internet-facing endpoints (LAN only)
- No PII in telemetry or logs
- COPPA compliance by design (no email, no social, no tracking)
- All data stays on local network
- Parent controls for all sensitive settings

### Network

- HTTPS for all API communication (even on LAN — self-signed cert)
- Short-lived auth tokens per device
- Signed payloads for satellite sync
- No cloud dependency

---

*Previous: [17-AUDIO_DESIGN.md](17-AUDIO_DESIGN.md) — Audio system.*
*Next: [19-ACCESSIBILITY.md](19-ACCESSIBILITY.md) — Accessibility design.*
