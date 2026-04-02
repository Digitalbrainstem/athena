# Nexus Academy — Client

First-person open-world adaptive learning game built with **Three.js + Vite + TypeScript**.

## Target Platforms

- **Surface Go Kiosk** — Primary deployment target
- **Browser** — Any modern Chromium/Firefox/Safari
- **Satellite Audio** — Voice-only mode via Atlas satellite speakers (Hermes)

## Tech Stack

- **3D Engine:** Three.js (WebGL) with ACES tone mapping, LOD system
- **Build:** Vite 6 (dev server + production bundler)
- **Language:** TypeScript (strict mode, no implicit any)
- **Testing:** Vitest + jsdom (45 tests)
- **Input:** Unified `GameAction` abstraction (keyboard, touch, gamepad)

## Architecture

```
client/
├── src/
│   ├── engine/          # Renderer (LOD, disposal), World (material/geometry caches),
│   │                    # Physics (AABB collision, gravity)
│   ├── game/            # Fixed-timestep game loop (accumulator pattern, 60 Hz physics)
│   ├── input/           # InputManager + providers (keyboard w/ AbortController,
│   │                    # touch w/ dead zone + passive listeners)
│   ├── camera/          # First-person controller (smooth accel/decel, AABB collision,
│   │                    # pointer lock, pre-allocated scratch vectors)
│   ├── ui/              # HUD (ARIA labels, CSS classes, flash prompts)
│   ├── net/             # REST API client (retry + backoff, timeout via AbortController,
│   │                    # offline event queue with auto-flush)
│   ├── types.ts         # Full type system (Disposable, AABB, APIError, etc.)
│   ├── main.ts          # Entry point with error boundary + visibility handling
│   └── vite-env.d.ts    # Vite type declarations
├── public/
│   └── index.html       # Accessible HTML (ARIA, responsive, touch-action: none)
├── tests/               # 45 tests — happy path, errors, disposal, edge cases
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

```bash
npm install              # Install dependencies
npm run dev              # Dev server (port 3000)
npm run build            # Type-check + production build
npm test                 # Run tests (vitest)
npm run test:watch       # Watch mode
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5200` | Nexus Academy server URL |

## Production Patterns

- **Fixed-timestep loop** — Physics at 60 Hz via accumulator; rendering at display refresh rate with interpolation alpha
- **Material/geometry caches** — Shared across identical objects; bulk disposal on scene teardown
- **AABB collision** — Player collides against all world objects; shallowest-axis resolution
- **AbortController cleanup** — All event listeners use signal-based teardown
- **Offline-first API** — Events queued in memory when offline; auto-flushed on `online` event
- **Retry with jitter** — Exponential backoff + random jitter for transient API failures
- **Memory safety** — All subsystems implement `Disposable`; visibility change pauses the loop

See [docs/GAME_DESIGN.md](../docs/GAME_DESIGN.md) for the full design.
