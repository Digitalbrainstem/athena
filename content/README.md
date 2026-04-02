# Nexus Academy — Content

Pre-generated and hand-crafted content for Nexus Academy. Atlas generates content
in nightly batches, stored here for the game server to serve.

## Content Types

- **Quests** — Quest definitions with objectives, dialogue, rewards
- **Biome Templates** — World generation rules per biome
- **Dialogue** — Companion character scripts, NPC dialogue trees
- **Audio** — Pre-rendered TTS audio for companion voice lines
- **Assets** — Procedurally generated textures, models, sound effects
- **Curriculum Maps** — Subject → game mechanic mappings per mastery tier

## Structure

```
content/
├── quests/            # Quest definitions (JSON/YAML)
│   ├── foundation/
│   ├── discovery/
│   ├── builder/
│   ├── innovator/
│   └── creator/
├── biomes/            # Biome generation templates
├── dialogue/          # Character dialogue trees
├── audio/             # Pre-rendered TTS audio
├── curriculum/        # Educational standard alignments
└── seeds/             # Hand-crafted starter content
```

## Content Pipeline

```
Atlas LLM (nightly batch)
    → Quest Generator (validates educational accuracy)
    → Asset Generator (TTS audio, procedural graphics)
    → Content Cache (3-4 years ahead per player)
    → Satellite Sync (push to offline devices)
```

> ⚠️ **Not yet populated.** Content generation begins after the game engine MVP. See [docs/GAME_DESIGN.md](../docs/GAME_DESIGN.md) for content design.
