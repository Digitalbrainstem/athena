# 28 — Music & Sound Effects Sources

> Research findings for free/open music and SFX libraries to complement
> DiffRhythm-generated music in Nexus Academy.

## TL;DR — What We Need and Where to Get It

| Need | Primary Source | License | Cost |
|------|---------------|---------|------|
| Orchestral/fantasy game music | Incompetech (Kevin MacLeod) | CC-BY 4.0 | Free w/ attribution |
| Ambient/exploration music | OpenGameArt CC0 collections | CC0 | Free |
| Classical music (education biomes) | Musopen | Public Domain | Free |
| Nature/weather/environment SFX | Freesound.org | CC0 / CC-BY | Free |
| Crafting/UI/footsteps SFX | Sonniss GDC Bundle | Royalty-free | Free |
| Animal sounds | Freesound.org + BBC (non-commercial ref) | Mixed | Free |
| CC music variety | Free Music Archive | CC0 / CC-BY | Free |

**Strategy:** DiffRhythm generates biome-specific adaptive music. These
libraries fill the gaps: ambient loops, one-shot SFX, UI sounds, and
pre-composed tracks for menus/cutscenes.

---

## Source 1: Incompetech (Kevin MacLeod) ⭐⭐⭐⭐⭐

- **URL:** https://incompetech.com/music/royalty-free/music.html
- **License:** CC-BY 4.0 (free with attribution) or paid Standard License (no attribution)
- **Catalog:** 2,000+ tracks across all genres
- **Format:** MP3 (individual free download); full catalog bulk download $38
- **Quality:** Professional, widely used in games and YouTube

### What's Available

Kevin MacLeod's catalog is the gold standard for free game music. Relevant genres:

| Genre | Example Tracks | Use Case |
|-------|---------------|----------|
| Fantasy/Medieval | "Lord of the Rangs", "Goblin Tinker Soldier Spy" | Quest music, exploration |
| Orchestral | "Grand Dark Waltz" series, "Adventures in Adventureland" | Boss encounters, dramatic moments |
| Ambient | "Cloud Dancer", "Mesmerizing Galaxy" | Biome ambience, meditation zones |
| Whimsical | "Sergio's Magic Dustbin" | Foundation tier (ages 2-5) |
| World music | Various cultural themes | Cultural biomes |

### Attribution Format

```
Music: "Track Name" by Kevin MacLeod (https://incompetech.com)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
```

### How to Browse

- Filter by genre, mood, tempo, and instruments at the music page
- JSON catalog available for programmatic filtering:
  https://incompetech.com/music/royalty-free/pieces.json
- Download all tracks at once: https://incompetech.com/music/royalty-free/Downloads/allthemusic.html

### Nexus Academy Fit

Perfect for menu music, cutscene scores, and any non-adaptive music needs.
The whimsical and fantasy tracks align well with our stylized art direction.
**Main limitation:** CC-BY 4.0 requires attribution (easy — add to credits screen).

---

## Source 2: Free Music Archive (FMA) ⭐⭐⭐⭐

- **URL:** https://freemusicarchive.org
- **License:** Mixed — filter for CC0 and CC-BY
- **Catalog:** Large, curated by genre
- **Format:** MP3, some WAV
- **Quality:** Ranges from amateur to professional
- **Operator:** Tribe of Noise (since ~2019)

### License Types Available

| License | Attribution? | Commercial? | Best For |
|---------|-------------|------------|---------|
| CC0 | No | ✅ | Worry-free use anywhere |
| CC-BY | Yes | ✅ | Credit in game credits |
| CC-BY-SA | Yes + ShareAlike | ✅ | Use with caution (derivative works share license) |
| CC-BY-NC | Yes | ❌ | **Avoid** — no commercial use |

### How to Search

Advanced search with license filter:
https://freemusicarchive.org/search?adv=1&music-filter-public-domain=1&music-filter-commercial-allowed=1

### Nexus Academy Fit

Good supplementary source for ambient, electronic, and world music tracks.
**Always verify license per-track** — the archive hosts multiple license types.
Filter for CC0 or CC-BY only.

---

## Source 3: OpenGameArt Music ⭐⭐⭐⭐

- **URL:** https://opengameart.org (filter: Art Type → Music)
- **License:** Varies — many CC0 and CC-BY collections
- **Catalog:** Hundreds of game-specific music packs
- **Format:** OGG, MP3, WAV, FLAC
- **Quality:** Game-focused, often loopable

### Notable CC0 Collections

| Collection | Contents | License |
|------------|----------|---------|
| **CC0 Fantasy Music & Sounds** | Orchestral RPG tracks, "Forgotten Tomb Ambience", "Forest Ambience", "Fantasy Choir" | CC0 |
| **Free Music Pack** | Ambient, battle, exploration themes | CC0 |
| **Contemplative Fantasy Music Pack** (YannZ) | Zelda/Ori/Ghibli-inspired ambient and emotional tracks | CC-BY |

### itch.io CC0 Music Packs (Related)

| Pack | Contents | License |
|------|----------|---------|
| **Fantasy Music Mega Pack** | 100+ songs for films/games | CC0 |
| **SKYETUNES** | Ambient, cinematic, fantasy | CC0 |
| **Atmospheric Piano Pack** | 1 hour of loopable ambient piano | CC0 |

### Pixabay Music (Bonus Source)

- **URL:** https://pixabay.com/music/search/fantasy%20ambient/
- **License:** Pixabay Content License (free for commercial, no attribution required)
- **Catalog:** 20,000+ tracks
- **Notable:** Ethereal, magical, and orchestral fantasy tracks

### Nexus Academy Fit

OpenGameArt CC0 collections are the best match for biome-specific ambient
music. The "CC0 Fantasy Music & Sounds" pack is almost purpose-built for a
game like ours. **These supplement DiffRhythm** for pre-composed loops.

---

## Source 4: Freesound.org ⭐⭐⭐⭐⭐ (PRIMARY SFX SOURCE)

- **URL:** https://freesound.org
- **License:** CC0 and CC-BY (per-sound, filter available)
- **Catalog:** 500,000+ sounds (celebrated 20th anniversary in 2025)
- **Format:** WAV, FLAC, OGG, MP3
- **Quality:** Ranges from field recordings to studio quality
- **Download:** Free account required

### License Types

| License | Attribution? | Commercial? |
|---------|-------------|------------|
| CC0 | No | ✅ |
| CC-BY 4.0 | Yes | ✅ |

### Relevant Sound Categories

| Category | Search Tags | Nexus Academy Use |
|----------|------------|-------------------|
| **Nature ambient** | forest, rain, wind, river, ocean, birds | Biome background loops |
| **Weather** | thunder, storm, snow, rain-on-roof | Dynamic weather system |
| **Footsteps** | footsteps-grass, footsteps-wood, footsteps-stone, footsteps-snow | Player movement feedback |
| **Animals** | bird-call, wolf-howl, insect, frog, owl-hoot | Wildlife ambience + companions |
| **Crafting** | hammer, anvil, saw, grinding, potion-bubble, forge-fire | Crafting mechanic SFX |
| **Magic** | spell, magic-whoosh, enchant, shimmer, energy | Ability/mastery SFX |
| **UI sounds** | click, notification, menu, confirm, cancel, hover | Interface feedback |
| **Building** | construction, wood-creak, stone-place, rope-pull | Building mechanic SFX |
| **Water** | splash, underwater, drip, waterfall, stream | Aquatic biome |
| **Fire** | campfire, torch, explosion, sizzle | Fire elements |
| **Musical** | chime, bell, harp-string, flute-note | Companion sounds, UI accents |

### Tips for Efficient Use

- Use the **Game Audio Browser** (https://gamesfxmaker.com/) to filter
  Freesound for commercial-friendly licenses
- Search with CC0 tag for zero-attribution sounds
- Download packs rather than individual sounds when available
- Freesound API available for programmatic batch searching

### Nexus Academy Fit

**This is our primary SFX source.** The combination of CC0 sounds (no
attribution headache) and the massive catalog means we can find virtually
any environmental, mechanical, or UI sound we need.

---

## Source 5: Sonniss GDC Game Audio Bundle ⭐⭐⭐⭐⭐

- **URL:** https://sonniss.com/gameaudiogdc
- **License:** Royalty-free, lifetime, unlimited projects
- **Catalog:** 27.5 GB+ per annual bundle (2015–2024 available = 400+ GB total)
- **Format:** WAV (high quality, professional)
- **Quality:** Professional studio recordings from commercial sound libraries
- **Download:** Direct / Google Drive mirror / Torrent (split into 9 ZIPs for 2024)

### License Terms

| Usage | Allowed? |
|-------|----------|
| Commercial games | ✅ Yes |
| Attribution required | ❌ No |
| Modify/edit sounds | ✅ Yes |
| AI/ML training | ❌ No |
| Resell as standalone | ❌ No |

### What's in the 2024 Bundle

600+ WAV files sourced from professional sound libraries:
- Ambiences and environmental sounds
- Vehicles and machinery
- Weapons and impacts
- Synthesized effects
- Footsteps and foley
- All with detailed metadata for easy cataloging

### Nexus Academy Fit

**This is our professional SFX backbone.** The Sonniss bundles provide
studio-quality recordings that elevate the game's audio above typical
CC0 fare. Key categories for us:

- **Ambiences** → biome backgrounds
- **Footsteps/foley** → player movement
- **Impacts** → building/crafting feedback
- **Synthesized effects** → magic/mastery abilities

**Recommendation:** Download the 2024 bundle (and optionally 2023 and earlier).
Don't download all 400+ GB — cherry-pick the most relevant annual bundles.

---

## Source 6: BBC Sound Effects ⚠️ LIMITED USE

- **URL:** https://sound-effects.bbcrewind.co.uk
- **License:** RemArc License — **non-commercial only** (free tier)
- **Catalog:** 33,000+ sounds
- **Format:** WAV
- **Quality:** Professional broadcast-quality field recordings

### License Details

| Usage | Free Tier | Commercial License |
|-------|-----------|-------------------|
| Personal/educational | ✅ Free | — |
| Research | ✅ Free | — |
| Commercial (games) | ❌ No | 💰 Paid via Pro Sound Effects |
| Attribution | Required | Depends on license |

### Commercial Licensing

Commercial licenses available through **Pro Sound Effects** (prosoundeffects.com).
Cost ranges from a few dollars per sound to thousands for large collections.

### Nexus Academy Fit

**Use as reference and inspiration only** for the free tier. The 33K sound
catalog is excellent for finding specific rare sounds (e.g., specific bird
species, historical machinery, regional ambiences). If we need specific
broadcast-quality sounds commercially, budget for individual licenses.

**Alternative:** Freesound.org and Sonniss cover most of the same categories
with friendlier licensing.

---

## Source 7: Musopen ⭐⭐⭐⭐

- **URL:** https://musopen.org
- **License:** Public Domain (recordings specifically commissioned to be PD)
- **Catalog:** 100,000+ classical recordings and sheet music
- **Format:** MP3, FLAC, lossless
- **Quality:** Professional orchestra recordings
- **Download:** Free account (5 downloads/day free tier; paid for more)

### What's Available

Full orchestral recordings of public domain classical compositions:
- Beethoven, Mozart, Bach, Vivaldi, Chopin, Debussy, etc.
- Performed specifically for Musopen's public domain mission
- High-quality studio recordings, not MIDI renderings

### Nexus Academy Fit

Classical music is a natural fit for several game contexts:

| Use Case | Example Compositions |
|----------|---------------------|
| **Scholar's Academy biome** | Bach, Debussy, Satie |
| **Grand architecture areas** | Beethoven symphonies, Handel |
| **Calm/meditation zones** | Chopin nocturnes, Debussy "Clair de Lune" |
| **Cultural education** | Regional classical traditions |
| **Music theory teaching** | Any — the compositions ARE the curriculum |
| **Foundation tier (ages 2-5)** | Mozart, Vivaldi "Four Seasons" |

**This is particularly powerful for Nexus Academy** because classical music
isn't just background — it's educational content. Playing Beethoven's 5th in
the Music Hall teaches music appreciation naturally (Design Principle #1).

---

## Needs Coverage Matrix

| Sound Need | Primary | Backup | License |
|------------|---------|--------|---------|
| **Biome ambient loops** | Freesound CC0 | Sonniss GDC | CC0 / RF |
| **Nature (forest, ocean, wind)** | Freesound CC0 | Sonniss GDC | CC0 / RF |
| **Weather (rain, thunder, snow)** | Freesound CC0 | Sonniss GDC | CC0 / RF |
| **Footsteps (multi-surface)** | Sonniss GDC | Freesound CC0 | RF / CC0 |
| **UI sounds (click, hover, confirm)** | Freesound CC0 | Sonniss GDC | CC0 / RF |
| **Crafting SFX** | Freesound CC0 | Sonniss GDC | CC0 / RF |
| **Magic/ability SFX** | Sonniss GDC | Freesound CC0 | RF / CC0 |
| **Building/construction** | Sonniss GDC | Freesound CC0 | RF / CC0 |
| **Animal sounds** | Freesound CC0 | BBC (reference) | CC0 |
| **Menu/title music** | Incompetech | FMA CC0 | CC-BY / CC0 |
| **Exploration music** | DiffRhythm (generated) | OGA CC0 Fantasy | Generated / CC0 |
| **Boss/dramatic music** | Incompetech | DiffRhythm | CC-BY / Generated |
| **Calm/ambient music** | DiffRhythm | OGA + FMA | Generated / CC0 |
| **Classical (education)** | Musopen | — | Public Domain |
| **Whimsical (ages 2-5)** | Incompetech | Musopen | CC-BY / PD |

---

## Audio Pipeline Integration

### How These Sources Fit with DiffRhythm

```
┌─────────────────────────────────────────────────────┐
│                 NEXUS ACADEMY AUDIO                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MUSIC LAYER                                        │
│  ├── DiffRhythm (primary) ── adaptive biome music   │
│  ├── Incompetech ── menu, cutscene, dramatic        │
│  ├── Musopen ── classical education contexts         │
│  ├── OGA/FMA CC0 ── ambient loops, supplementary    │
│  └── Pixabay ── additional variety                  │
│                                                     │
│  SFX LAYER                                          │
│  ├── Sonniss GDC ── professional foley/impacts      │
│  ├── Freesound CC0 ── environment, nature, UI       │
│  └── Custom ── companion voices (Fish Audio TTS)    │
│                                                     │
│  VOICE LAYER                                        │
│  ├── Fish Audio TTS ── companion dialogue            │
│  ├── Qwen3-TTS ── narration                         │
│  └── Web Speech API ── player voice input           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Attribution Tracking

For CC-BY licensed content, we need attribution in the game credits.
Recommended approach:

1. Create `content/audio/ATTRIBUTIONS.md` tracking every CC-BY asset used
2. Display attributions in the game's Credits screen
3. Include in the game's README/documentation
4. CC0 and Public Domain assets don't require attribution but we credit anyway

### Attribution Template

```json
{
  "track": "Grand Dark Waltz",
  "author": "Kevin MacLeod",
  "source": "incompetech.com",
  "license": "CC-BY-4.0",
  "url": "https://incompetech.com/music/royalty-free/music.html"
}
```

---

## License Summary

| Source | License | Attribution? | Commercial? | Cost |
|--------|---------|-------------|------------|------|
| Incompetech | CC-BY 4.0 | ✅ Yes | ✅ Yes | Free (or $38 bulk) |
| Free Music Archive | CC0 / CC-BY (filter) | Varies | ✅ (filter) | Free |
| OpenGameArt Music | CC0 / CC-BY (varies) | Varies | ✅ (verify) | Free |
| Freesound.org | CC0 / CC-BY (per-sound) | Varies | ✅ Yes | Free |
| Sonniss GDC | Royalty-free | ❌ No | ✅ Yes | Free |
| BBC Sound Effects | RemArc (non-commercial) | ✅ Yes | ❌ Free tier | Paid for commercial |
| Musopen | Public Domain | ❌ No | ✅ Yes | Free |
| Pixabay Music | Pixabay License | ❌ No | ✅ Yes | Free |

---

## Key Links

- Incompetech: https://incompetech.com/music/royalty-free/music.html
- Free Music Archive: https://freemusicarchive.org
- OpenGameArt: https://opengameart.org
- Freesound: https://freesound.org
- Sonniss GDC 2024: https://gdc.sonniss.com/gdc-2024-game-audio-bundle/
- BBC Sound Effects: https://sound-effects.bbcrewind.co.uk
- Musopen: https://musopen.org
- Pixabay Music: https://pixabay.com/music/
- itch.io CC0 Music: https://itch.io/game-assets/free/tag-cc0/tag-music
- Freesound Game Audio Browser: https://gamesfxmaker.com/
