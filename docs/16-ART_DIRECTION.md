# 16 — Art Direction

> Nexus Academy uses stylized 3D — not photorealistic, not pixel art. The visual
> style scales smoothly across mastery tiers from soft and playful (Foundation) to
> stunning and atmospheric (Innovator/Creator), all within a single coherent aesthetic.
> Think Breath of the Wild's environmental beauty meets Monument Valley's geometric
> elegance meets Spiderverse's expressive rendering. This document covers the visual
> philosophy, per-tier styling, color system, and rendering approach.

---

## Visual Philosophy

### First-Person Perspective

Nexus Academy is a **first-person game**. The player IS in the world — not watching a
character from above or behind. This is a deliberate design choice:

- **More immersive.** Closer to the OASIS vision. The player is IN the Nexus, not
  observing it.
- **The player's hands/tools are visible** but there is no full avatar on screen.
  What the player sees is the world itself, their tools, and their companion.
- **For Foundation tier (typically ages 2–5):** First person, but the companion is always visible
  directly ahead — talking TO the player, pointing at things, reacting to what happens.
  The companion is the player's anchor in the world.
- **For older players:** First-person exploration, building, and crafting — like
  Minecraft or No Man's Sky perspective. The world is what matters, not watching
  an avatar from behind.
- **No avatar to judge.** The player never sees their own body rendered, which means
  there's no appearance to compare, no body type to worry about, no visual "level
  indicator" on their character. They just ARE in the world.

This integrates with the companion-as-growth-mirror philosophy
(see [11-COMPANION_SYSTEM.md](11-COMPANION_SYSTEM.md)): the player experiences growth
by seeing their companion evolve and their world expand, not by watching their own
character change.

### Why Stylized, Not Realistic

1. **Timeless.** Realistic graphics age badly. Stylized ages gracefully. A game meant
   to last 20 years needs art that still looks good in 2045.

2. **Performant.** Stylized requires fewer polygons, simpler shaders, smaller textures.
   Runs on a Surface Go, a budget tablet, even an old phone browser.

3. **Emotionally expressive.** Stylized art conveys MORE emotion than realism, not less.
   The Spiderverse films proved that stylization creates more feeling, not less.

4. **Age-scalable.** Soft rounded shapes for toddlers and angular complex geometry for
   adults can coexist in the same visual language.

5. **Focus on learning.** When the art isn't trying to be photorealistic, the player's
   attention goes to the content, not the graphics. The visuals serve the gameplay.

---

## Per-Tier Visual Style

### Foundation (typically ages 2–5)

**Reference:** Monument Valley + Fisher-Price + Dora's environment

| Attribute | Description |
|-----------|-------------|
| Geometry | Soft, rounded. Chamfered edges. No sharp corners. |
| Colors | Bright, saturated, high contrast. Primary palette. |
| Detail level | Low polygon count. Large, clear shapes. |
| Animation | Bouncy, exaggerated, delightful. Squash and stretch. |
| UI | Minimal. 3-5 elements max. Everything is large. |
| Characters | Big heads, big eyes, expressive faces. Cute, approachable. |
| Text | Almost none. Icons and images communicate. |
| Lighting | Soft, even. No harsh shadows. Always feels safe. |

### Discovery (typically ages 6–10)

**Reference:** Zelda: Wind Waker + Minecraft (shaders) + Journey

| Attribute | Description |
|-----------|-------------|
| Geometry | Clean, defined shapes. Some detail. Hand-painted textures. |
| Colors | Vibrant, adventurous. Rich biome palettes. Seasonal variation. |
| Detail level | Medium polygon count. Environmental storytelling through detail. |
| Animation | Smooth, expressive. Natural movement. Particle effects begin. |
| UI | Emerging HUD elements. Compass, inventory icon, mini-map. |
| Characters | Proportional but stylized. Expressive body language. |
| Text | Labels, short dialogue. Clear, readable fonts. |
| Lighting | Dynamic day/night cycle. Soft shadows. Warm tones. |

### Builder (typically ages 11–14)

**Reference:** Breath of the Wild + Gris + Alto's Odyssey

| Attribute | Description |
|-----------|-------------|
| Geometry | Rich detail. Complex structures. Environmental complexity. |
| Colors | Deeper, more nuanced palettes. Atmospheric color grading. |
| Detail level | Higher polygon count. Normal maps for surface detail. |
| Animation | Fluid, weighted. Physics-driven cloth, water, particles. |
| UI | Full game UI. Inventory, quest log, map, crafting interface. |
| Characters | Detailed, expressive, individual. Unique NPC designs. |
| Text | Full dialogue, journal entries, in-world text. |
| Lighting | Volumetric effects. God rays. Dynamic weather lighting. |

### Innovator (typically ages 15–18)

**Reference:** Journey + Spiderverse + Inside + Firewatch

| Attribute | Description |
|-----------|-------------|
| Geometry | High detail with artistic restraint. Elegant simplicity. |
| Colors | Sophisticated palettes. Data visualization aesthetics. |
| Detail level | High polygon where it matters, stylized where it doesn't. |
| Animation | Cinematic quality. Camera work. Dramatic reveals. |
| UI | Clean, sophisticated. Equation renderer. Graphing tools. Data displays. |
| Characters | Mature proportions. Subtle expressions. Body language focus. |
| Text | Complex. Technical. Scientific. But always clear. |
| Lighting | Dramatic. Atmospheric. Emotional. Uses light to guide attention. |

### Creator (ages 18+)

**Reference:** Fez + scientific visualization + data art + Manifest

| Attribute | Description |
|-----------|-------------|
| Geometry | Varies: elegant minimalism OR dense scientific visualization. |
| Colors | Restrained, powerful. Frost/Aurora accents on muted backgrounds. |
| Detail level | Extremely high for simulation views. Clean for navigation. |
| Animation | Precise, purposeful. Data-driven. Simulation visualization. |
| UI | Research-grade. Equation editor, graphing, data dashboards. |
| Characters | Minimal presence. The world and data are the focus. |
| Text | Dense, technical, precise. Academic-quality rendering. |
| Lighting | Functional + beautiful. Lab lighting, deep space, abstract. |

---

## Tier Transition

The visual style transitions are **seamless**. There is no moment where the game
suddenly looks different. Instead:

- Polygon count gradually increases over months
- Color palettes slowly shift from saturated to nuanced
- UI elements appear one at a time as needed
- Lighting complexity increases gradually
- Animation quality improves continuously

A player going from age 5 to age 10 will never notice a "graphics upgrade." They'll
just feel that the world is getting richer and more detailed — because it is, gradually.

---

## Color System

### Accent Colors

Two accent colors used across all tiers for UI elements:

| Color | Hex | Usage |
|-------|-----|-------|
| **Frost** | `#22d3ee` | Primary actions, interactive elements, progress indicators |
| **Aurora** | `#a78bfa` | Secondary actions, companion UI, story/narrative elements |

### Biome Palettes

Each biome has a 5-color palette that harmonizes with Frost/Aurora:

| Biome | Dominant | Accent 1 | Accent 2 | Shadow | Highlight |
|-------|----------|----------|----------|--------|-----------|
| Workshop | Warm brown | Copper orange | Steel grey | Dark umber | Spark gold |
| Alchemist's Lab | Deep purple | Emerald green | Ruby red | Dark indigo | Alchemical gold |
| Observatory | Midnight blue | Silver | Soft violet | Deep space | Star white |
| Living Forest | Forest green | Moss yellow | Earth brown | Deep pine | Sunbeam gold |
| Crystal Caverns | Amethyst | Crystal blue | Rose quartz | Cave shadow | Diamond white |
| Trading Post | Warm sand | Market red | Spice orange | Wood brown | Gold coin |
| Storm Tower | Storm grey | Lightning blue | Thunder purple | Dark cloud | Flash white |
| Code Forge | Terminal green | Circuit blue | Data amber | Dark carbon | LED white |

### Age-Adaptive Color Saturation

| Tier | Saturation | Brightness | Contrast |
|------|-----------|-----------|---------|
| Foundation | High (80-100%) | High | High (>7:1 for text) |
| Discovery | Medium-High (60-85%) | Medium-High | High |
| Builder | Medium (50-75%) | Medium | Medium-High |
| Innovator | Medium-Low (40-65%) | Varies (dramatic) | Medium |
| Creator | Low-Medium (30-60%) | Varies (functional) | High for data |

---

## Rendering Approach

### Engine: Three.js (WebGL 2.0)

Primary rendering engine chosen for:
- Ecosystem size and community support
- Cross-browser compatibility
- Performance on low-end hardware
- Shader programmability for stylized effects

### Render Modes

| Mode | Target Hardware | Features |
|------|----------------|----------|
| Full 3D | Desktop, Surface Go, modern tablets | All effects, shadows, particles, post-processing |
| 3D Lite | Older tablets, phones | Reduced geometry, baked shadows, fewer particles |
| 2D Canvas | Very old devices | Sprite-based, top-down or isometric, fully playable |
| Audio Only | Satellite speakers | No rendering — companion narrates everything |

### LOD (Level of Detail) System

Objects have 3-4 LOD levels. Distance and device capability determine which is shown:

```
LOD 0: Full detail (near camera, high-end device)
LOD 1: Medium detail (mid-distance or mid-end device)
LOD 2: Low detail (far distance or low-end device)
LOD 3: Billboard/impostor (very far distance)
```

### Post-Processing

Age-tier-appropriate post-processing:

| Effect | Foundation | Discovery | Builder | Innovator | Creator |
|--------|---------------|----------|------------|---------|--------|
| Bloom | Soft, dreamy | Subtle | Atmospheric | Dramatic | Functional |
| Depth of field | None (everything clear) | Gentle | Cinematic | Dramatic | Data-driven |
| Color grading | Warm, bright | Vibrant | Nuanced | Moody | Restrained |
| Vignette | None | None | Subtle | Present | Optional |
| Motion blur | None | None | Subtle | Present | Optional |
| Screen-space AO | None | None | Subtle | Present | Present |

---

## Character Design

### Player Avatar

Fully customizable at every tier:
- **Body type:** Multiple options, no gendered defaults
- **Skin tone:** Full spectrum, accurate representation
- **Hair:** Wide variety of styles, colors, textures
- **Clothing:** Functional and decorative options earned through play
- **Accessories:** Earned through quests and building
- **Scale:** Adjusts subtly with mastery tier (child proportions → adult proportions)

### Companion (see [11-COMPANION_SYSTEM.md](11-COMPANION_SYSTEM.md))

- Stylized to match the biome the player is in (subtle color adaptation)
- Expression system: 20+ emotional states visible in face/body language
- Size appropriate to tier (slightly larger relative to avatar for Foundation tier)

### NPCs

- Each biome has a distinctive NPC style (Workshop: smiths and inventors; Forest: rangers)
- Diverse in every way — appearance, clothing, mannerisms
- Expression and gesture communicate meaning before words

---

## Performance Budgets

| Platform | Target FPS | Polygon Budget | Texture Budget | Draw Calls |
|----------|-----------|---------------|---------------|-----------|
| Surface Go | 30 FPS | 100K visible | 256 MB | < 200 |
| Desktop browser | 60 FPS | 500K visible | 512 MB | < 500 |
| Mobile (mid) | 30 FPS | 50K visible | 128 MB | < 100 |
| Mobile (low) | 30 FPS (2D mode) | N/A | 64 MB | < 50 |

---

## Research Required

Before building against this document, complete the following research:

- [ ] **AI 3D asset generation** — Evaluate Meshy, Tripo3D, Shap-E, and Point-E for text-to-3D model generation. Test output quality in glTF format for Three.js import. Measure polygon counts, texture quality, and generation time. Identify which tools produce game-ready assets vs. those needing manual cleanup.
- [ ] **Stylized low-poly pipelines** — Study stylized 3D art pipelines used in: Monument Valley (ustwo), Journey (thatgamecompany), AER: Memories of Old. Identify Blender workflows for producing consistent stylized assets. Evaluate procedural generation tools (Houdini, Geometry Nodes).
- [ ] **Three.js rendering techniques** — Research post-processing in Three.js: outline shaders (toon rendering), custom materials, LOD systems. Benchmark performance on Surface Go hardware. Study Three.js examples gallery for stylized rendering approaches.
- [ ] **Age-adaptive visual design** — Review academic research on visual complexity and cognitive load for different ages. Study how PBS Kids, Sesame Street, and Disney Junior transition visual complexity across age ranges. Quantify what "too complex" looks like for a 3-year-old.
- [ ] **Procedural world generation in WebGL** — Study marching cubes, dual contouring, and wave function collapse for web-based terrain generation. Benchmark performance in Three.js. Review Townscaper's procedural architecture generation as inspiration.
- [ ] **Color blindness in game design** — Research prevalence data and test tools (Color Oracle, Coblis simulator). Study how Fortnite, Overwatch, and Splatoon handle colorblind modes. Ensure every biome palette has a tested colorblind-safe variant.

---

*Previous: [15-PROFILES_PROGRESSION.md](15-PROFILES_PROGRESSION.md) — Profiles and calibration.*
*Next: [17-AUDIO_DESIGN.md](17-AUDIO_DESIGN.md) — Sound effects, music, and TTS voice.*
