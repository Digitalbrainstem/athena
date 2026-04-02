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
| World/biomes | ✅ | 18/21 biomes (workshop, alchemist, caverns, forest, library, ancient-ruins, time-rift, explorers-map, gallery, newsroom, theater, marketplace, observatory, storm-tower, healers-sanctuary, hospital, farm, laboratory) |
| Foundation quests | ✅ | 37 quests across 3 biomes (workshop/forest/caverns) |
| Client renderer | ✅ | Three.js scene graph renderer, material caching, disposal |
| Input (kbd+touch) | ✅ | Keyboard + touch. NO gamepad, NO voice input |
| Audio engine | ✅ | Spatial, adaptive music, TTS, captions, haptics |
| Accessibility | ✅ | Screen reader, color blind, reduced motion, one-switch, captions |
| Profile flow | ✅ | Create → select → load → play (end-to-end) |
| Offline/PWA | ✅ | Service worker, IndexedDB cache, sync queue, manifest |
| Server sync | ✅ | Auth, profiles, multi-device merge, parent dashboard |
| Total tests | 1,979 | nexus-core: 1,633 / client: 277 / server: 69 |

### What's Missing
| Feature | Priority | Notes |
|---------|----------|-------|
| 3 biomes | HIGH | Only 18/21 built |
| Discovery tier quests (ages 6-10) | HIGH | 0 quests |
| Builder tier quests (ages 11-14) | HIGH | 0 quests |
| Innovator tier quests (ages 15-18) | MEDIUM | 0 quests |
| Creator tier quests (ages 18+) | MEDIUM | 0 quests |
| Companion dialogue generation | HIGH | State works, no dialogue output |
| Interest tracking system | HIGH | 0% — blocks world adaptation |
| Story/narrative system | HIGH | Codex, fragments, Founders lore |
| Gamepad input | HIGH | Specified as first-class |
| Voice input (STT) | MEDIUM | Web Speech API |
| Economy/trading system | MEDIUM | Trading Post biome |
| Code Forge system | MEDIUM | Programming environment |
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
| trading-post | The Trading Post | ❌ TODO | Economics, Math |
| architects-domain | The Architect's Domain | ❌ TODO | Geometry, Engineering, Art |
| code-forge | The Code Forge | ❌ TODO | Computer Science, Logic |
| healers-sanctuary | The Healer's Sanctuary | ✅ BUILT | Biology, Chemistry, Medicine |
| hospital | The Hospital | ✅ BUILT | Medicine, Health, Anatomy, First Aid |
| farm | The Farm | ✅ BUILT | Biology, Agriculture, Economics, Ecology |
| laboratory | The Laboratory | ✅ BUILT | Physics, Chemistry, Scientific Method |
| explorers-map | The Explorer's Map | ✅ BUILT | Geography, Navigation, Culture |
| time-rift | The Time Rift | ✅ BUILT | History, Cause & Effect |
| storm-tower | The Storm Tower | ✅ BUILT | Physics, Weather, Energy |
| arena | The Arena | ❌ TODO | Strategy, Game Theory, Logic |
| shipyard | The Shipyard | ❌ TODO | Engineering, Physics |
| music-hall | The Music Hall | ❌ TODO | Music Theory, Physics |
| gallery | The Gallery | ✅ BUILT | Art, Design, Math, History |
| newsroom | The Newsroom | ✅ BUILT | Language Arts, Writing, Journalism |
| theater | The Theater | ✅ BUILT | Language Arts, Literature, Performance |
| marketplace | The Marketplace | ✅ BUILT | Economics, Math, Entrepreneurship |

## Quest Count by Tier & Biome

| Biome | Foundation | Discovery | Builder | Innovator | Creator |
|-------|-----------|-----------|---------|-----------|---------|
| workshop | 16 ✅ | 0 ❌ | 0 ❌ | 0 ❌ | 0 ❌ |
| alchemist-lab | 0 | 0 | 0 | 0 | 0 |
| crystal-caverns | 10 ✅ | 0 | 0 | 0 | 0 |
| living-forest | 11 ✅ | 0 | 0 | 0 | 0 |
| library-echoes | 0 | 0 | 0 | 0 | 0 |
| (13 more biomes) | — | — | — | — | — |

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
