# Nexus Academy — Client

The game client for Nexus Academy. Built with Three.js/Babylon.js for 3D rendering,
with fallback to 2D canvas for younger tiers and audio-only mode for satellite speakers.

## Target Platforms

- **Browser** — Any modern Chromium/Firefox/Safari
- **Surface Go Kiosk** — Dedicated household learning station
- **Satellite Audio** — Voice-only mode via Atlas satellite speakers (Hermes)

## Tech Stack

- Three.js / Babylon.js (3D world rendering)
- TypeScript
- Web Audio API (spatial audio, sound effects)
- Service Worker (offline support)
- Web Speech API + Fish Audio TTS (companion voice)

## Structure

```
client/
├── src/
│   ├── engine/        # World engine, physics, rendering
│   ├── ui/            # HUD, menus, inventory, quest log
│   ├── audio/         # Sound engine, TTS integration, music
│   ├── input/         # Touch, voice, keyboard, gamepad handlers
│   ├── world/         # Biome generation, morphing, travel
│   ├── companion/     # Companion character AI and dialogue
│   ├── craft/         # Crafting system
│   └── net/           # Server sync, offline cache
├── assets/            # Static assets (textures, models, sounds)
├── public/            # HTML entry points
└── tests/             # Client-side tests
```

## Getting Started

```bash
npm install
npm run dev      # Development server with hot reload
npm run build    # Production build
npm run test     # Run tests
```

> ⚠️ **Not yet implemented.** This is the planned structure. See [docs/GAME_DESIGN.md](../docs/GAME_DESIGN.md) for the full design.
