# Nexus Academy — Design Specification Index

> Complete design specification for Project Athena (codename) / Nexus Academy.
> Each document is self-contained, focused, and independently readable.

## Documents

| # | Document | Description |
|---|----------|-------------|
| 00 | [CORE_PRINCIPLES.md](00-CORE_PRINCIPLES.md) | Non-negotiable principles — safety, access, privacy, no monetization, inclusion |
| 01 | [VISION.md](01-VISION.md) | Vision statement, inspirations, design pillars, what this game IS and ISN'T |
| 02 | [WORLD_DESIGN.md](02-WORLD_DESIGN.md) | The Nexus: biomes, world morphing, environment rules, procedural generation |
| 03 | [TRAVEL_MECHANICS.md](03-TRAVEL_MECHANICS.md) | Travel expansion from village to galaxy: vehicles, FTL, wormholes, fuel chemistry |
| 04 | [MASTERY_TIERS.md](04-AGE_TIERS.md) | Five mastery tiers from Foundation (2–5) to Creator (18+), detailed gameplay per tier |
| 05 | [GAMEPLAY_LOOPS.md](05-GAMEPLAY_LOOPS.md) | Core loops, quest structure, crafting, building, economy, Code Forge |
| 06 | [MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md) | The Ender Protocol: spaced repetition, gap detection, impossible challenges, flow |
| 07 | [SUBJECT_MAPPING.md](07-SUBJECT_MAPPING.md) | Every subject mapped to game mechanics at every mastery tier, with examples |
| 08 | [ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md) | Atlas as the invisible architect: nightly batch, world shaping, what it does and doesn't do |
| 09 | [CONTENT_PIPELINE.md](09-CONTENT_PIPELINE.md) | How content is authored, generated, validated, cached, and distributed |
| 10 | [STORY_NARRATIVE.md](10-STORY_NARRATIVE.md) | The Founders, the overarching mystery, story threads per tier, the endgame revelation |
| 11 | [COMPANION_SYSTEM.md](11-COMPANION_SYSTEM.md) | Companion character arc, personality, customization, voice, teaching-as-mastery |
| 12 | [VOICE_GAMEPLAY.md](12-VOICE_GAMEPLAY.md) | Zero-screen mode for satellite speakers: full audio-only game experience |
| 13 | [INPUT_CONTROLS.md](13-INPUT_CONTROLS.md) | Touch, voice, keyboard+mouse, gamepad — all first-class input methods |
| 14 | [MULTIPLAYER.md](14-MULTIPLAYER.md) | Same-network co-op, classroom mode, sibling play, child protection |
| 15 | [PROFILES_PROGRESSION.md](15-PROFILES_PROGRESSION.md) | Player profiles, calibration zone, multi-device sync, progression tracking |
| 16 | [ART_DIRECTION.md](16-ART_DIRECTION.md) | Visual style per tier, 3D approach, color palette, age-adaptive rendering |
| 17 | [AUDIO_DESIGN.md](17-AUDIO_DESIGN.md) | TTS companion voice, sound effects, adaptive music, spatial audio |
| 18 | [TECHNICAL_ARCHITECTURE.md](18-TECHNICAL_ARCHITECTURE.md) | Three.js client, FastAPI server, database schema, offline/sync, deployment |
| 19 | [ACCESSIBILITY.md](19-ACCESSIBILITY.md) | Visual, motor, cognitive, and auditory accessibility — full spec |
| 20 | [SCREEN_TIME_SAFETY.md](20-SCREEN_TIME_SAFETY.md) | Parental controls, screen time philosophy, COPPA compliance, child protection |

## Suggested Reading Order

**First time? Start here:**

1. **[00-CORE_PRINCIPLES.md](00-CORE_PRINCIPLES.md)** — The non-negotiable foundation
2. **[01-VISION.md](01-VISION.md)** — What this game is and why it exists
3. **[04-AGE_TIERS.md](04-AGE_TIERS.md)** — How the game adapts across mastery levels, from toddler to any age
4. **[02-WORLD_DESIGN.md](02-WORLD_DESIGN.md)** — The living world that teaches through play
5. **[06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md)** — How learning is tracked invisibly

**Building the game?**

6. **[05-GAMEPLAY_LOOPS.md](05-GAMEPLAY_LOOPS.md)** — Core gameplay mechanics
7. **[07-SUBJECT_MAPPING.md](07-SUBJECT_MAPPING.md)** — What the game teaches and how
8. **[18-TECHNICAL_ARCHITECTURE.md](18-TECHNICAL_ARCHITECTURE.md)** — How to build it
9. **[13-INPUT_CONTROLS.md](13-INPUT_CONTROLS.md)** — Input handling across devices

**Understanding the ecosystem?**

10. **[08-ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md)** — Atlas as the invisible architect
11. **[09-CONTENT_PIPELINE.md](09-CONTENT_PIPELINE.md)** — Content generation and distribution
12. **[11-COMPANION_SYSTEM.md](11-COMPANION_SYSTEM.md)** — The companion character

**Everything else:**

12. Remaining docs in any order — each is self-contained.

## Conventions

- Documents cross-reference each other by number: "See [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md)"
- Each document starts with a one-paragraph summary
- Examples are concrete and specific, not abstract
- All subjects covered through college level and beyond (ages 2 and up)
- "The player" is always gender-neutral

---

**Version:** 2.1 — Added Core Principles, interest-driven theming, Atlas-optional architecture
**Date:** July 2025
**Author:** Derek Thomas + Atlas Copilot
