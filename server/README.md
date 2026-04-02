# Nexus Academy — Server

Optional sync server for Nexus Academy. The game runs **fully standalone** via
nexus-core in the client. This server adds multi-device sync, authentication,
parent dashboard, and Atlas bridge capabilities.

## Tech Stack

- Python 3.11+ / FastAPI
- SQLite (WAL mode) for player data
- bcrypt password hashing + JWT tokens
- aiosqlite for async database access

## What the Server Provides

- **Sync** — Multi-device merge engine (max-mastery, union events, completed-wins)
- **Auth** — PIN (children) and password (parents) with JWT access/refresh tokens
- **Parent Dashboard** — Progress reports, mastery breakdowns, screen-time config
- **Profiles** — CRUD with pagination
- **Atlas Bridge** — Stubs for nightly LLM content generation (future)

## Structure

```
server/
├── app/
│   ├── main.py               # FastAPI app, lifespan, middleware, CORS
│   ├── config.py             # Pydantic Settings (env-driven, NEXUS_ prefix)
│   ├── errors.py             # NexusError hierarchy
│   ├── security.py           # JWT + bcrypt
│   ├── middleware.py         # Request ID + access logging
│   ├── api/
│   │   ├── auth.py           # /api/auth/* — login, refresh, parent, setup
│   │   ├── profiles.py       # /api/profiles/* — CRUD + paginated list
│   │   ├── sync.py           # /api/sync/* — upload, download, full
│   │   └── parent.py         # /api/parent/* — reports, dashboard, screen-time
│   ├── services/
│   │   ├── sync.py           # Multi-device merge logic
│   │   └── reports.py        # Report generation
│   └── db/
│       ├── connection.py     # SQLite WAL, init/close, transactions
│       └── schema.py         # Schema matching nexus-core
├── tests/                    # 48 pytest tests
├── requirements.txt
└── pyproject.toml
```

## Getting Started

```bash
pip install -r requirements.txt

# Run server (port 5200)
cd server && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 5200

# Run tests
python3 -m pytest tests/ -v
```

## Configuration

All settings via environment variables with `NEXUS_` prefix:

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXUS_DATABASE_PATH` | `./data/nexus.db` | SQLite database path |
| `NEXUS_JWT_SECRET` | — | **Required** for production |
| `NEXUS_JWT_ACCESS_TTL_MINUTES` | `30` | Access token lifetime |
| `NEXUS_JWT_REFRESH_TTL_DAYS` | `7` | Refresh token lifetime |
| `NEXUS_BCRYPT_COST` | `12` | bcrypt cost factor |
| `NEXUS_CORS_ORIGINS` | `http://localhost:5173` | Comma-separated origins |
| `NEXUS_HOST` | `0.0.0.0` | Server bind address |
| `NEXUS_PORT` | `5200` | Server port |
| `NEXUS_DEBUG` | `false` | Debug mode |

## API Endpoints

```
GET    /api/health                          # DB probe + version
POST   /api/auth/login                      # PIN or password → tokens
POST   /api/auth/refresh                    # Refresh → new access token
POST   /api/auth/parent                     # Parent login → parent-scoped token
POST   /api/auth/setup                      # Set/update auth for a profile
POST   /api/profiles                        # Create profile
GET    /api/profiles/{id}                   # Get profile
PUT    /api/profiles/{id}                   # Update profile
GET    /api/profiles?offset=0&limit=20      # List (paginated)
POST   /api/sync/upload                     # Upload local changes → merge
POST   /api/sync/download                   # Download merged state (optionally since timestamp)
POST   /api/sync/full                       # Full export for first sync / recovery
GET    /api/parent/reports/{profile_id}     # Weekly progress report (parent token)
GET    /api/parent/dashboard                # All children overview (parent token)
PUT    /api/parent/screen-time/{profile_id} # Configure screen-time limits (parent token)
GET    /api/parent/mastery/{profile_id}     # Detailed mastery breakdown (parent token)
GET    /api/parent/accessibility/{profile_id}  # Get child's accessibility settings (parent token)
PUT    /api/parent/accessibility/{profile_id}  # Set child's accessibility settings (parent token)
```

## Accessibility Settings

Every profile has an optional `accessibility_settings` JSON field that syncs across
devices (last-write-wins). Parents can view and configure these via the parent dashboard.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `color_blind_mode` | `none\|deuteranopia\|protanopia\|tritanopia` | `none` | Color blind filter |
| `high_contrast` | bool | `false` | High contrast mode |
| `reduced_motion` | bool | `false` | Reduce animations |
| `font_size` | int (50–200) | `100` | Font size percentage |
| `font_family` | string | `default` | Preferred font |
| `line_spacing` | float | `1.4` | Line height multiplier |
| `subtitles` | bool | `false` | Show subtitles |
| `sound_captions` | bool | `false` | Describe sound effects in text |
| `one_switch_mode` | bool | `false` | Single-switch scanning input |
| `scan_speed` | float | `1.0` | Auto-scan speed multiplier |
| `input_debounce` | float | `0.0` | Input debounce delay (ms) |
| `simplified_ui` | bool | `false` | Reduced UI complexity |
| `companion_speech_speed` | float | `1.0` | Companion TTS speed |

Accessible via: profile CRUD, sync upload/download, and parent dashboard endpoints.

## Sync Merge Rules

The server is the merge authority for multi-device play:

- **Mastery levels:** `max(local, server)` — you can't un-learn
- **Learning events:** union with dedup by (skill_id, timestamp)
- **Quest progress:** completed on any device = completed; max steps
- **World state:** union for collections (biomes, inventory, structures, travel); last-write-wins for scalars
- **Companion:** max trust; union traits and memories
- **Accessibility settings:** last-write-wins (preferences replace entirely)
