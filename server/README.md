# Nexus Academy — Server

FastAPI server powering Nexus Academy. Manages player profiles, progress tracking,
mastery data, content serving, and Atlas integration.

## Tech Stack

- Python 3.11+ / FastAPI
- SQLite (WAL mode) for player data
- Atlas Cortex module integration
- Fish Audio TTS for companion voice generation

## Responsibilities

- **Profiles** — Player creation, authentication (child PIN, parent password)
- **Progress** — Mastery tracking, spaced repetition scheduling, gap analysis
- **Content** — Quest serving, asset management, content cache
- **Sync** — Offline satellite sync, multi-device progress merge
- **Atlas Bridge** — Nightly batch content generation, difficulty tuning
- **Parent API** — Reports, screen time config, profile management

## Structure

```
server/
├── app/
│   ├── api/           # FastAPI route modules
│   ├── models/        # Data models (profiles, progress, quests)
│   ├── services/      # Business logic (mastery, content, sync)
│   ├── atlas/         # Atlas Cortex integration module
│   └── db/            # Database schema, migrations
├── tests/             # Server tests
└── config/            # Configuration files
```

## Getting Started

```bash
pip install -r requirements.txt
python -m server.app      # Start on port 5200
python -m pytest tests/   # Run tests
```

> ⚠️ **Not yet implemented.** This is the planned structure. See [docs/TECHNICAL_ARCHITECTURE.md](../docs/TECHNICAL_ARCHITECTURE.md) for architecture details.
