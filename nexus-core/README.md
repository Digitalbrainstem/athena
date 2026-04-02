# @nexus-academy/core

Platform-agnostic game engine core for **Nexus Academy** — an open-world adaptive learning game for ages 2+.

This package contains ALL game logic, data persistence, and game state. Renderers (Three.js, Godot, audio-only) are thin layers that consume this core.

## Architecture

```
nexus-core/
├── src/
│   ├── ecs/          # Entity Component System engine
│   ├── db/           # SQLite (sql.js/WASM) persistence layer
│   ├── systems/      # Game systems (mastery, quests, world, companion)
│   ├── scene/        # Renderer-agnostic scene graph
│   ├── types/        # TypeScript type definitions
│   ├── core.ts       # NexusCore — main public API
│   └── index.ts      # Package entry point
└── tests/            # Comprehensive test suite (199 tests)
```

## Quick Start

```typescript
import { NexusCore } from '@nexus-academy/core';

// Create the engine
const core = await NexusCore.create();

// Create a player profile
const profile = await core.createProfile({ name: 'Explorer' });
await core.loadProfile(profile.id);

// Game loop (called by your renderer every frame)
function gameLoop(dt: number, actions: GameAction[]) {
  core.update(dt, actions);
  const scene = core.getSceneGraph(); // Feed this to your renderer
}
```

## Key Systems

### ECS Engine
Entities are numeric IDs with generation tracking. Components are typed data attached to entities. Systems process entities each frame in priority order.

### Mastery System (SM-2 Spaced Repetition)
Implements the SuperMemo 2 algorithm with four mastery dimensions:
- **Retention** — Can they do it days later?
- **Transfer** — Can they apply it in new contexts?
- **Depth** — Can they explain it?
- **Integration** — Can they combine skills?

### Quest Engine
State machine (`available → active → completed/abandoned`) with automatic learning event generation on completion.

### World System
Manages biomes (Workshop, Alchemist's Lab, Crystal Caverns, Living Forest, Library of Echoes), inventory, and scene graph generation.

### Companion System
Personality stages (guide → partner → ally → peer) that evolve with trust and player age.

## Build & Test

```bash
npm install
npm run build    # TypeScript compilation
npm test         # Run all 199 tests
```

## Design Principles

- **Zero browser/DOM dependencies** — runs in Node.js, Deno, browsers, WASM
- **TypeScript strict mode** — no `any` types
- **Learning IS gameplay** — no quizzes, no tests
- **Knowledge is the only currency** — no microtransactions
