# Project Athena — Nexus Academy

> *"The OASIS school from Ready Player One, but real."*

An open-world adaptive learning game for ages 2–24. No quizzes. No tests. No essays.
The world demands knowledge and rewards mastery. Playing IS learning.

Powered by [Atlas Cortex](https://github.com/Betanu701/atlas-cortex). Built by
[Digital Brainstem](https://github.com/Digitalbrainstem).

---

## Architecture

```mermaid
graph TB
    subgraph Client["🎮 Game Client (Three.js/TypeScript)"]
        WE[World Engine] --> R[3D Renderer]
        WE --> P[Physics]
        WE --> C[Crafting]
        AI[Audio/Input] --> V[Voice]
        AI --> T[Touch/Gamepad]
        AI --> K[Keyboard]
    end

    subgraph Server["⚡ Game Server (FastAPI/Python)"]
        PR[Profiles] --> MS[Mastery Tracker]
        CT[Content Server] --> QS[Quest System]
        SY[Sync Engine] --> OF[Offline Support]
    end

    subgraph Atlas["🧠 Atlas Cortex"]
        LLM[LLM Engine] --> CG[Content Generator]
        LLM --> GA[Gap Analysis]
        LLM --> DT[Difficulty Tuning]
        TTS[Fish Audio TTS] --> CV[Companion Voice]
    end

    Client -->|REST API| Server
    Server -->|Module API / Nightly Batch| Atlas

    subgraph Platforms["📱 Platforms"]
        B[Browser]
        S[Surface Go Kiosk]
        SAT[Satellite Speaker]
    end

    Client --- Platforms
```

## The Game

Five age tiers, one seamless world that grows with the player:

| Tier | Ages | Experience |
|------|------|-----------|
| **Little Learner** | 2–5 | Dora-style companion talks directly to the child. Touch + voice. Colors, counting, shapes, phonics. |
| **Explorer** | 6–10 | Open world unlocks. Companion becomes adventure partner. Quests teach arithmetic through calculus foundations. |
| **Adventurer** | 11–14 | Full crafting, Code Forge, Time Rift missions. Real chemistry formulas, structural physics, economy systems. |
| **Scholar** | 15–18 | Physics simulations, chemistry labs, historical debates. AP/college-prep level content. |
| **Master** | 18–24 | Research-grade tools. Calc 3, organic chemistry, quantum mechanics, ML, distributed systems. |

**Knowledge is the only currency.** No microtransactions. No ads. No pay-to-play. Ever.

## Documentation

| Document | Description |
|----------|-------------|
| [Game Design Document](docs/GAME_DESIGN.md) | Full GDD — vision, world, mechanics, mastery system, story |
| [Subject Mapping](docs/SUBJECT_MAPPING.md) | Every subject mapped to game mechanics at each age tier |
| [Voice Gameplay](docs/VOICE_GAMEPLAY.md) | Audio-only mode for satellite speakers (zero screen) |
| [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) | Client, server, Atlas integration, content pipeline |
| [Copilot Instructions](.github/copilot-instructions.md) | AI assistant context for development |

## Getting Started

### Prerequisites

- Node.js 18+ (client)
- Python 3.11+ (server)
- Atlas Cortex instance (optional — game runs standalone)

### Development

```bash
# Clone
git clone https://github.com/Digitalbrainstem/athena.git
cd athena

# Client (not yet implemented)
cd client && npm install && npm run dev

# Server (not yet implemented)
cd server && pip install -r requirements.txt && python -m server.app
```

### Satellite Audio-Only Mode

The game runs on Atlas satellite speakers (Hermes) with zero screen — pure voice
interaction. See [Voice Gameplay](docs/VOICE_GAMEPLAY.md) for the full design.

## Design Principles

1. **Learning IS gameplay** — the world demands knowledge, not answers to questions
2. **The game runs standalone** — Atlas is the architect, not the engine
3. **No microtransactions** — knowledge is the only currency
4. **Never feels like school** — no grades, no scores, the world simply responds
5. **Radians AND degrees from age 2** — angles as "turns" builds lifelong intuition
6. **Gender-neutral everything** — interests tracked by behavior, never demographics
7. **Screen time is unlimited** — parent-configurable, never punitive
8. **The companion grows up with you** — from Dora-style friend to research partner

## Atlas Ecosystem

| Codename | Project |
|----------|---------|
| **Atlas** (Cortex) | Self-evolving personal AI |
| **Athena** | Nexus Academy — this game |
| **Apollo** | ContextForge — context window manager |
| **Hermes** | Satellite speakers (Pi/ESP32) |
| **Iris** | Computer vision system |

## License

[MIT](LICENSE) — © 2026 Digital Brainstem / Derek Thomas
