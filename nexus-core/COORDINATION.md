# Nexus Academy — Build Coordination Hub

> Every agent reads this before starting. Every agent updates it when done.
> This is the "interdimensional portal" — the single source of truth.

---

## Architecture

```
nexus-core/           ← Pure TS game engine (runs everywhere)
  ├── ecs/            ← Entity Component System
  ├── db/             ← SQLite/WASM local database
  ├── systems/        ← Game logic (mastery, quest, craft, companion, etc.)
  ├── data/           ← Content (quests, biomes, elements, recipes, etc.)
  ├── scene/          ← Renderer-agnostic scene graph output
  ├── accessibility/  ← Announcements, captions, settings
  └── types/          ← All shared TypeScript interfaces

client/               ← Thin Three.js renderer (browser)
  ├── renderer/       ← SceneGraph → Three.js
  ├── input/          ← Raw events → GameActions
  ├── audio/          ← Web Audio, TTS, captions
  ├── a11y/           ← AccessibilityManager, screen reader, color blind
  ├── ui/             ← HUD, profile screen, dialogue
  └── net/            ← API client, offline/PWA, sync queue

server/               ← Optional FastAPI sync layer
  ├── api/            ← Auth, profiles, sync, parent dashboard
  ├── services/       ← Sync engine, reports
  └── db/             ← SQLite WAL
```

## Current State (verified 2026-04-02)

### What's Built & Tested
| Component | Tests | Status |
|-----------|-------|--------|
| ECS engine | ✅ | Entity/component/system/world/query |
| Database (sql.js) | ✅ | 11 tables, 7 indexes, 6 repositories |
| SM-2 mastery | ✅ | Real algorithm, 4 dimensions, gap detection |
| Quest engine | ✅ | State machine, selection, completion |
| Crafting | ✅ | 37 elements, 35 compounds, 23 reactions, 121 recipes, 20 materials |
| Companion | ✅ | 4 stages, trust, memory — NO dialogue generation yet |
| World/biomes | ✅ | 27/27 biomes (all built) |
| Foundation quests | ✅ | 37 quests across 3 biomes (workshop/forest/caverns) |
| Client renderer | ✅ | Three.js scene graph renderer, material caching, disposal |
| Input (kbd+touch) | ✅ | Keyboard + touch + gamepad + voice input |
| Audio engine | ✅ | Spatial, adaptive music, TTS, captions, haptics |
| Accessibility | ✅ | Screen reader, color blind, reduced motion, one-switch, captions |
| Profile flow | ✅ | Create → select → load → play (end-to-end) |
| Offline/PWA | ✅ | Service worker, IndexedDB cache, sync queue, manifest |
| Server sync | ✅ | Auth, profiles, multi-device merge, parent dashboard |
| Total tests | 2,398 | nexus-core: 1,695 / client: 357 / server: 69 |

### What's Missing
| Feature | Priority | Notes |
|---------|----------|-------|
| 0 biomes | — | All 27 built |
| Discovery tier quests (ages 6-10) | ✅ | 1,000 quests across 27 biomes |
| Builder tier quests (ages 11-14) | HIGH | 0 quests |
| Innovator tier quests (ages 15-18) | MEDIUM | 0 quests |
| Creator tier quests (ages 18+) | MEDIUM | 0 quests |
| Companion dialogue generation | HIGH | State works, no dialogue output |
| Interest tracking system | HIGH | 0% — blocks world adaptation |
| Story/narrative system | ✅ | Codex system, 101 fragments, 12 mysteries, 5 story threads |
| Procedural quest engine | ✅ | 51 templates, 23 mechanics, anti-repetition tracker |
| Gamepad input | ✅ | Xbox, PlayStation, Switch, adaptive controller |
| Voice input (STT) | ✅ | Web Speech API, fuzzy matching, child speech |
| Economy/trading system | MEDIUM | Trading Post biome |
| Code Forge system | ✅ | Block + text programming, robot control |
| Travel system | MEDIUM | Cross-biome travel, vehicles |
| Calibration system | MEDIUM | New player assessment |
| Screen time enforcement | LOW | DB exists, no enforcement |
| Multiplayer (LAN co-op) | LOW | Full spec, 0 code |
| Classroom mode | LOW | Full spec, 0 code |

## Biome Registry

| ID | Name | Status | Primary Subjects |
|----|------|--------|-----------------|
| workshop | The Workshop | ✅ BUILT | Engineering, Math, Physics |
| alchemist-lab | The Alchemist's Lab | ✅ BUILT | Chemistry, Biology |
| crystal-caverns | The Crystal Caverns | ✅ BUILT | Geology, Chemistry, Math |
| living-forest | The Living Forest | ✅ BUILT | Biology, Ecology |
| library-echoes | The Library of Echoes | ✅ BUILT | Language Arts, Literature |
| observatory | The Observatory | ✅ BUILT | Astronomy, Physics, Math |
| ancient-ruins | The Ancient Ruins | ✅ BUILT | History, Archaeology, Language |
| trading-post | The Trading Post | ✅ BUILT | Economics, Math |
| architects-domain | The Architect's Domain | ✅ BUILT | Geometry, Engineering, Art |
| code-forge | The Code Forge | ✅ BUILT | Computer Science, Logic |
| healers-sanctuary | The Healer's Sanctuary | ✅ BUILT | Biology, Chemistry, Medicine |
| hospital | The Hospital | ✅ BUILT | Medicine, Health, Anatomy, First Aid |
| farm | The Farm | ✅ BUILT | Biology, Agriculture, Economics, Ecology |
| laboratory | The Laboratory | ✅ BUILT | Physics, Chemistry, Scientific Method |
| explorers-map | The Explorer's Map | ✅ BUILT | Geography, Navigation, Culture |
| time-rift | The Time Rift | ✅ BUILT | History, Cause & Effect |
| storm-tower | The Storm Tower | ✅ BUILT | Physics, Weather, Energy |
| arena | The Arena | ✅ BUILT | Strategy, Game Theory, Logic |
| shipyard | The Shipyard | ✅ BUILT | Engineering, Physics |
| music-hall | The Music Hall | ✅ BUILT | Music Theory, Physics |
| digital-world | The Digital World | ✅ BUILT | CS, Networking, Cybersecurity, AI |
| space-station | The Space Station | ✅ BUILT | Physics, Astronomy, Engineering |
| debate-hall | The Debate Hall | ✅ BUILT | Philosophy, Logic, Rhetoric, Ethics |
| gallery | The Gallery | ✅ BUILT | Art, Design, Math, History |
| newsroom | The Newsroom | ✅ BUILT | Language Arts, Writing, Journalism |
| theater | The Theater | ✅ BUILT | Language Arts, Literature, Performance |
| marketplace | The Marketplace | ✅ BUILT | Economics, Math, Entrepreneurship |

## Quest Count by Tier & Biome

| Biome | Foundation | Discovery | Builder | Innovator | Creator |
|-------|-----------|-----------|---------|-----------|---------|
| workshop | 16 ✅ | 38 ✅ | 0 ❌ | 0 ❌ | 0 ❌ |
| alchemist-lab | 0 | 37 ✅ | 0 | 0 | 0 |
| crystal-caverns | 10 ✅ | 37 ✅ | 0 | 0 | 0 |
| living-forest | 11 ✅ | 37 ✅ | 0 | 0 | 0 |
| library-echoes | 0 | 37 ✅ | 0 | 0 | 0 |
| (22 more biomes) | — | 37 each ✅ | — | — | — |

## Non-Negotiable Principles (EVERY agent must follow)

1. **Learning IS gameplay** — world demands knowledge, never asks quiz questions
2. **Protect the child** — no punishment, no dark patterns, no FOMO
3. **Zero monetization** — no ads, no microtransactions, no premium tiers
4. **Privacy** — no telemetry, no cloud data, COPPA compliant by architecture
5. **Gender-neutral** — no gendered content, interests by behavior not demographics
6. **No judgment** — no "wrong", no negative sounds, companion shares responsibility
7. **Mastery over speed** — no timers (Foundation), spaced repetition is invisible
8. **Standalone** — works without Atlas, works offline
9. **Real science** — all chemistry/physics is factually accurate
10. **Accessibility** — screen reader, color blind, motor, cognitive, auditory. Built in, not bolted on.

## Accessibility Checklist (EVERY piece of content)

- [ ] Triple instruction: visual + spoken + screenReader on every quest step
- [ ] companionRepeat on every step
- [ ] Never color alone — always color + shape/position
- [ ] Gentle failure — world consequence, never "wrong"
- [ ] No timer for Foundation tier
- [ ] Gender-neutral language
- [ ] All audio has captionText
- [ ] Hints available on every step

---

## Current Build Phase (2026-04-03)

### Major Architectural Change: Connected Overworld
The game is being rebuilt from disconnected floating platforms into a
continuous connected world. Key changes:

1. Central town square hub connecting all 27 biomes via paths
2. Each biome has EXTERIOR (landmark visible from distance) + INTERIOR (enclosed space)
3. Buildings have walls, ceiling, door, windows, atmosphere
4. Natural biomes (forest, caverns) are open-air but enveloping
5. Terrain with height variation, paths, rivers, bridges
6. NPCs, animals, day/night, weather make world feel alive
7. No loading screens between biomes — one continuous world
8. Consequence-based boundaries, no invisible walls

### Audio Overhaul
- Each biome has distinct ambient soundscape (synthesized)
- Procedural music per biome (pentatonic, adaptive layers)
- SFX on all interactions (footsteps, chimes, doors)
- Companion voice with personality per type (not generic TTS)
- Nexus Voice: female futuristic-warm, welcome on first launch
- Reverb presets per space (outdoor dry, cave echo, room medium)

### Portal Gateway
- First screen: swirling Frost→Aurora particle portal
- Nexus Voice speaks welcome
- "Step Inside" prompt
- Portal dissolves into profile creation

### Companion Characters
- 6 types: fox, owl, rabbit, bear, cat, dragon
- 3D models (not emoji, not orbs)
- Personality-specific voice parameters
- Follow player, face when speaking, gesture toward objects

### Mobile Web
- Virtual joystick (left side) for movement
- Touch-drag (right side) for camera rotation
- No pointer lock needed
- Touch targets 80x80dp+ for Foundation tier

### Key Documents
- docs/STYLE_GUIDE.md — Visual identity LAW
- docs/16-ART_DIRECTION.md — Per-tier visual style
- docs/02-WORLD_DESIGN.md — Biome descriptions
- docs/17-AUDIO_DESIGN.md — Sound design
- docs/13-INPUT_CONTROLS.md — All input methods
- docs/19-ACCESSIBILITY.md — A11y requirements
- docs/00-CORE_PRINCIPLES.md — Non-negotiable principles

### E2E Testing
- Playwright on Overwatch (192.168.3.8) Docker container
- Tests: movement, interaction, biomes, visual regression
- Run: `node e2e/run-tests.mjs`
- NOTHING is done until E2E passes on Overwatch

### Audio Generation Pipeline (Fish Audio on Overwatch)
Fish Audio runs on Overwatch (192.168.3.8) RTX 4060, port 8090.
ALL audio is pre-generated as .ogg files, NOT runtime TTS.

Voice lines to generate:
- Nexus Voice: ~20 lines (female, warm, futuristic)
- 6 companion types × 200+ dialogue templates = ~1,200+ files
- Quest narration: 4,017 quest intros + outros = ~8,000 files
- Codex fragments: 101 readings
- Mystery reveals: 12
- NPC dialogue: per-biome voices

Ambiance & Music:
- 27 biome ambient loops (real sounds, not synth oscillators)
- 27 biome music tracks (3 layers each: ambient/activity/intensity)
- Transition sounds between biomes

SFX:
- Interaction chimes, footsteps (6 terrain types), doors, crafting
- Discovery sparkles, quest completion, UI sounds

File structure: client/public/audio/{voices,ambiance,sfx,music,quests}/
Game loads by ID — zero runtime TTS, works offline.
Atlas nightly batch generates audio for new quests.

### 3D Asset Pipeline (TRELLIS 2 on Overwatch 7900 XT)
TRELLIS-AMD generates real 3D GLB models from reference images.
Runs on 7900 XT (20GB VRAM), cloned to /mnt/user/appdata/trellis/TRELLIS-AMD/

Total models needed: 1,093
- Companion characters: 66 (6 types × variants + emotions)
- UI/screens: 41
- Building exteriors: 97
- Building interiors: 327  
- Natural biome objects: 77
- Per-biome specific objects: 247 (workshop, observatory, alchemist, etc.)
- Other biome objects: 176
- NPCs: 50
- Overworld: 43
- Vehicles: 9
- Crafting/building: 48
- Weather/effects: 10
- Quest objects: 73
- Easter eggs: 5

Estimated generation time: 3.5-5 hours
Output: client/public/models/{category}/{model-name}.glb
Game loads GLB via Three.js GLTFLoader — replacing procedural geometry.
