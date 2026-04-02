# Project Athena — Copilot Instructions

## Project Overview

**Codename:** Athena (the game)
**Public name:** Nexus Academy
**What it is:** An open-world adaptive learning game for ages 2 and up. The OASIS school
from Ready Player One meets the Mind Game from Ender's Game. Playing IS learning —
no quizzes, no tests, no essays. The world demands knowledge and rewards mastery.

**Creator:** Derek Thomas / Digital Brainstem

## Atlas Ecosystem Codenames

| Codename | Project | Repo |
|----------|---------|------|
| **Atlas** (Cortex) | Self-evolving personal AI, OpenAI-compatible API | `Betanu701/atlas-cortex` |
| **Athena** | Nexus Academy — adaptive learning game (THIS REPO) | `Digitalbrainstem/athena` |
| **Apollo** | ContextForge — context window manager | `Betanu701/context-forge` |
| **Hephaestus** | Coding assistant / dev tools | — |
| **Hermes** | Satellite speakers (Pi/ESP32 audio devices) | `Betanu701/atlas-satellites` |
| **Iris** | Sight — computer vision system | — |

## Repository Structure

```
athena/
├── .github/
│   └── copilot-instructions.md   # This file
├── client/                        # Game client (Three.js/Babylon.js)
├── server/                        # FastAPI game server
├── content/                       # Pre-generated game content
├── docs/
│   ├── GAME_DESIGN.md            # Full Game Design Document
│   ├── SUBJECT_MAPPING.md        # Subject → game mechanic mapping
│   ├── VOICE_GAMEPLAY.md         # Audio-only gameplay design
│   └── TECHNICAL_ARCHITECTURE.md # Technical architecture
├── README.md
├── LICENSE                        # MIT
└── .gitignore
```

## Tech Stack

### Client
- **3D Engine:** Three.js or Babylon.js (WebGL)
- **Language:** TypeScript
- **Audio:** Web Audio API + Fish Audio TTS (companion voice)
- **Input:** Touch, voice (Web Speech API), keyboard+mouse, gamepad (Xbox/PS/generic)
- **Offline:** Service Worker + IndexedDB content cache

### Server
- **Framework:** FastAPI (Python 3.11+)
- **Database:** SQLite (WAL mode)
- **Atlas Integration:** Module API for nightly batch content generation
- **TTS:** Fish Audio for companion voice, Qwen3-TTS for narration

### Content Pipeline
- Atlas LLM generates content in nightly batches
- Content cached 3-4 years ahead of player's current level
- Synced to offline satellites via Hermes

## Build / Test / Run

```bash
# Client
cd client && npm install && npm run dev       # Dev server
cd client && npm run build                     # Production build
cd client && npm test                          # Tests

# Server
pip install -r server/requirements.txt
python -m server.app                           # Start server (port 5200)
python -m pytest server/tests/                 # Tests
```

## Game Design Principles — READ THESE

1. **Learning IS gameplay.** Never bolt a quiz onto a game. The world demands knowledge.
   Building a bridge requires geometry. Mixing a potion requires stoichiometry.
   Navigation requires trigonometry. The player learns because they WANT to succeed.

2. **No stubs, no placeholders.** Every mechanic must teach something real. If it's in
   the game, it's educationally valid. A crafting recipe uses real chemistry. A building
   uses real physics. A trade uses real economics.

3. **The game runs standalone.** Atlas is the architect (works between sessions), but the
   game MUST work without Atlas connected. All mechanics, physics, and crafting are
   built into the engine. Pre-generated content is cached locally.

4. **Knowledge is the only currency.** No microtransactions. No pay-to-play. No loot
   boxes. No ads. Players advance by learning. Period.

5. **Never make it feel like school.** No grades. No report cards visible to the player.
   No "you got 7 out of 10." The world simply responds — build something wrong and it
   falls down. Mix chemicals wrong and you get smoke instead of a potion.

6. **Radians AND degrees from age 2.** Angles are "turns" — full turn, half turn,
   quarter turn. This builds intuition for radians before the word is ever introduced.

7. **Gender-neutral everything.** No "boy" or "girl" paths. All content available to all
   players. Interests tracked by behavior, never demographics.

8. **The companion grows with the player.** Ages 2-5: talks directly to the child (Dora
   style). Ages 6-10: adventuring partner. Ages 11-14: trusted ally. Ages 15+: peer
   and research partner. The companion never talks down.

9. **Spaced repetition is invisible.** Old challenges return as natural world events —
   "The bridge you built last week? A storm damaged it." The player reviews without
   knowing they're reviewing.

10. **Screen time is unlimited by default.** Parent-configurable, but the game itself
    never punishes. Break reminders are gentle and in-character.

## Derek's Preferences

- **Timezone:** Eastern Time (ET)
- **Color palette:** Frost (#22d3ee) + Aurora (#a78bfa) — use for UI accents
- **Monetization:** ABSOLUTELY NONE. No microtransactions, no ads, no premium tiers.
  This is a gift to the world. Knowledge is free.
- **Target hardware:** Surface Go (kiosk mode) as primary, browser secondary,
  satellite speakers (audio-only) tertiary
- **Art direction:** Stylized 3D — playful and colorful for Foundation tier,
  increasingly stunning and immersive for older tiers. NOT realistic. Think
  Breath of the Wild meets Monument Valley meets Spiderverse.

## Atlas Integration Details

Atlas is the **invisible game designer**. It works BETWEEN sessions:

- **World Shaping:** Analyzes play data, generates new quests, modifies biomes
- **Difficulty Tuning:** Adjusts challenge levels, inserts "impossible challenges"
- **Gap Analysis:** Reviews mistakes nightly, identifies prerequisite gaps
- **Content Generation:** Batch-generates 3-4 years of content ahead
- **Parent Reports:** Weekly progress summaries with strength/weakness analysis

Atlas does NOT:
- Generate content in real-time during gameplay
- Interrupt the player
- Make the game feel like school
- Judge or grade — the world simply responds

## Key Conventions

- Every Python module starts with `from __future__ import annotations`
- TypeScript strict mode for all client code
- All async code uses native async/await
- Tests use pytest (server) and vitest (client)
- Environment variables drive configuration (no hardcoded URLs/keys)
- Branch protection on `main` — all changes through PRs

## Key Documents

20 focused spec documents in `docs/` — see [docs/README.md](../docs/README.md) for
the full index and reading order.

**Start here:**
- [01-VISION.md](../docs/01-VISION.md) — What this game is and why
- [04-AGE_TIERS.md](../docs/04-AGE_TIERS.md) — The five mastery tiers in detail
- [02-WORLD_DESIGN.md](../docs/02-WORLD_DESIGN.md) — The living world
- [06-MASTERY_SYSTEM.md](../docs/06-MASTERY_SYSTEM.md) — The Ender Protocol

**Building the game:**
- [05-GAMEPLAY_LOOPS.md](../docs/05-GAMEPLAY_LOOPS.md) — Core gameplay mechanics
- [07-SUBJECT_MAPPING.md](../docs/07-SUBJECT_MAPPING.md) — Subject → mechanic mapping
- [18-TECHNICAL_ARCHITECTURE.md](../docs/18-TECHNICAL_ARCHITECTURE.md) — Architecture
- [13-INPUT_CONTROLS.md](../docs/13-INPUT_CONTROLS.md) — Input handling
