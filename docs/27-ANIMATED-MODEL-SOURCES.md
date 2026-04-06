# 27 — Animated 3D Model Sources

> Research findings for pre-rigged, animated low-poly 3D models suitable for
> Nexus Academy's stylized art direction (BotW × Monument Valley × Spiderverse).

## TL;DR — Can We Find Pre-Rigged Animated Models We Just Retexture?

**Yes.** Quaternius alone covers ~80% of our needs with CC0 animated low-poly
animals, humanoids, monsters, and fantasy creatures — all in glTF/FBX with
animations baked in. KayKit fills the humanoid character gap with rigged,
animated adventurer packs. Mixamo provides an infinite animation library for
any humanoid rig. The strategy is:

1. **Animals/Companions** → Quaternius animated animal packs (fox, bear, rabbit, fish, dinosaurs)
2. **NPC Humanoids** → Quaternius Universal Base Characters + KayKit Adventurers
3. **Animations** → Quaternius Universal Animation Library + Mixamo retargeting
4. **Creatures/Monsters** → Quaternius Cute Monsters + Ultimate Monsters
5. **Environment** → Quaternius Stylized Nature MegaKit + KayKit environments

All CC0 except Mixamo (free but no raw redistribution) and some KayKit extras (paid tiers).

---

## Companion Coverage Matrix

| Companion | Quaternius Pack | Alt Source | Status |
|-----------|----------------|-----------|--------|
| **Fox** | Ultimate Animated Animals (12 animals w/ 12+ anims each) | Poly.pizza individual models | ✅ Covered |
| **Owl** | Ultimate Animated Animals / Farm Animals | Sketchfab CC0, Poly.pizza | ⚠️ May need retexture or custom |
| **Rabbit** | Ultimate Animated Animals / Farm Animals (7 models) | Poly.pizza, itch.io | ✅ Covered |
| **Bear** | Ultimate Animated Animals | Poly.pizza | ✅ Covered |
| **Cat** | Ultimate Animated Animals / Farm Animals | Sketchfab CC0 (Behemot Cat) | ✅ Covered |
| **Dragon** | Ultimate Monsters (50 models, animated) / Cute Monsters (21 models) | Sketchfab CC0 (Black Dragon w/ Idle Anim) | ✅ Covered |

---

## Source 1: Quaternius ⭐⭐⭐⭐⭐ (PRIMARY SOURCE)

- **URL:** https://quaternius.com
- **License:** CC0 — free for personal, educational, and commercial projects
- **Formats:** FBX, OBJ, glTF, Blend
- **Quality:** Low-poly stylized, perfect match for our art direction
- **Download:** Direct from site (Standard tier = 60-70% free; Source/Pro = paid)

### Key Packs for Nexus Academy

| Pack | Models | Animated | Textured | Relevance |
|------|--------|----------|----------|-----------|
| **Ultimate Animated Animal Pack** | 12 | ✅ 12+ anims each | ❌ | Companions (fox, bear, rabbit, cat) |
| **Farm Animal Pack** | 7 | ✅ | ❌ | Additional animals (chicken, cow, pig, horse) |
| **Animated Cute Fish Pack** | 52 | ✅ | ❌ | Aquatic biome creatures |
| **Cute Animated Monsters Pack** | 21 | ✅ | ✅ | Friendly creatures, dragon companion base |
| **Ultimate Monsters Pack** | 50 | ✅ | ❌ | Dragons, fantasy creatures |
| **Animated Dinosaur Pack** | — | ✅ | — | Prehistoric biome |
| **Ultimate Animated Character Pack** | 52 | ✅ | ❌ | NPC humanoids base |
| **RPG Character Pack** | 6 | ✅ | ✅ | NPC adventurers |
| **Animated Women Pack** | — | ✅ | — | Female NPC humanoids |
| **Animated Men Pack** | — | ✅ | — | Male NPC humanoids |
| **Universal Base Characters** | 6 | Rigged | ✅ | Customizable NPCs (3 body types × M/F) |
| **Universal Animation Library 2** | 130+ anims | ✅ | N/A | Retargetable humanoid animations |
| **Modular Character Outfits - Fantasy** | — | Rigged | — | NPC outfit customization |
| **Stylized Nature MegaKit** | 116 | ❌ | ✅ | Ghibli-style environments (40 trees, 35 plants, 27 rocks) |
| **Medieval Village MegaKit** | — | ❌ | — | Town/village biome |
| **Ultimate RPG Pack** | — | ❌ | — | Props, weapons, items |
| **Fantasy Props MegaKit** | — | ❌ | — | Furniture, weapons |

### Universal Base Characters (NPC System)

This is particularly powerful for our NPC needs:
- 6 base models: Superhero / Regular / Teen proportions (male + female)
- 20 interchangeable hairstyles
- Customizable eye and skin colors
- ~13K triangle count (game-optimized)
- Humanoid rig compatible with retargeting
- Works with Universal Animation Library (130+ animations)

**This is essentially a modular NPC factory — exactly what we need.**

### Animation Library

The **Universal Animation Library 2** provides 130+ retargetable animations:
- Melee and armed combos (3-4 hit)
- Parkour movement
- Farming and fishing
- General locomotion
- Compatible with Unreal Engine, Unity, and Godot

---

## Source 2: Kay Lousberg (KayKit) ⭐⭐⭐⭐

- **URL:** https://kaylousberg.itch.io/
- **License:** CC0 (free tier); paid Extra/Source tiers available
- **Formats:** FBX, glTF (compatible with Unity, Godot, Unreal, Roblox)
- **Quality:** Stylized low-poly, slightly more "chunky" than Quaternius — good match
- **Download:** itch.io (name-your-price, $0 is fine for free tier)

### Key Packs

| Pack | Contents | Free? | Relevance |
|------|----------|-------|-----------|
| **Adventurers Character Pack** | 5 rigged/animated characters + 25 accessories | ✅ Free (CC0) | NPC adventurers |
| **Skeletons Character Pack** | 4+ rigged skeleton characters + accessories | ✅ Free (CC0) | Undead NPCs |
| **Character Animations** | Standalone animation pack for KayKit characters | ✅ Free | Shared animation library |
| **Dungeon Remastered** | Dungeon environment tiles | ✅ Free (CC0) | Underground biome |
| **Forest Nature Pack** | Forest environment props | ✅ Free (CC0) | Nature biome |
| **Medieval Hexagon** | Hex-based terrain tiles | ✅ Free (CC0) | World building |
| **Platformer Pack** | Platform game props | ✅ Free (CC0) | Foundation tier gameplay |
| **Resource Bits** | Collectible resource items | ✅ Free (CC0) | Crafting ingredients |

### Character System

KayKit characters use a single 1024×1024 gradient atlas texture (downsample
to 128×128 for mobile). All characters share the same rig, meaning:
- One animation set works across all characters
- Easy to retexture by swapping the atlas
- Accessories are interchangeable

---

## Source 3: Kenney.nl ⭐⭐⭐⭐

- **URL:** https://kenney.nl/assets
- **License:** CC0 1.0 Universal (public domain)
- **Formats:** Various (FBX, OBJ, glTF depending on pack)
- **Quality:** Clean, game-ready, optimized — slightly more minimal than Quaternius
- **Download:** Direct from kenney.nl or itch.io (kenney-assets.itch.io)

### Key Assets

| Pack | Contents | Relevance |
|------|----------|-----------|
| **Animated Characters 3** | 1 rigged model × 4 skins (human M/F, zombie M/F), 3 anims | NPC base prototyping |
| **Modular Characters** | 425 modular character parts | NPC customization |
| **Various environment packs** | Buildings, nature, furniture | World building |

### Notes

Kenney is more focused on environment props and modular pieces than animated
characters. Great supplement to Quaternius/KayKit for buildings, furniture,
and items, but not the primary character source.

---

## Source 4: Poly.pizza ⭐⭐⭐

- **URL:** https://poly.pizza
- **License:** CC0 (most models, verify per-model)
- **Formats:** OBJ, FBX, glTF
- **Quality:** Varies — aggregates from multiple creators (many Quaternius models)
- **Download:** Direct download, no account required
- **Catalog:** 10,500+ free low-poly models

### How to Use

Poly.pizza is primarily an aggregator/browser for CC0 models. Key searches:
- https://poly.pizza/explore/Animals — animal models
- https://poly.pizza/search/animated%20animals — animated subset
- https://poly.pizza/u/Quaternius/Lists — Quaternius models on Poly.pizza

**Best used as:** A search/discovery tool when you need a specific model that
isn't in a Quaternius or KayKit pack. Individual downloads rather than bulk packs.

---

## Source 5: Sketchfab (CC0 Animated) ⭐⭐⭐

- **URL:** https://sketchfab.com/3d-models?features=downloadable+animated&licenses=cc0&sort_by=-likeCount
- **License:** CC0 filter available (verify per-model)
- **Formats:** glTF, FBX, OBJ, USDZ (varies by model)
- **Quality:** Varies widely — from professional to student work
- **Download:** Free account required for download

### Notable CC0 Animated Models

| Model | Creator | Relevance |
|-------|---------|-----------|
| Phoenix Bird | norberto3d | Flying creature template |
| Black Dragon with Idle Animation | dennish2010 | Dragon companion base |
| Wolf with Animations | dennish2010 | Canine/fox template |
| Shibahu (Shiba) | Kensyouen | Animal companion style |
| Medieval Fantasy Book | stefan.lengyel1 | Animated prop |

### Notes

Sketchfab is best for one-off finds rather than consistent packs. The CC0
animated filter shows a good selection, but styles are inconsistent. Best
used to fill specific gaps (e.g., a particular animal not in Quaternius packs).

---

## Source 6: Mixamo ⭐⭐⭐⭐ (ANIMATIONS ONLY)

- **URL:** https://www.mixamo.com
- **License:** Free (Adobe account required); commercial use allowed; **no raw file redistribution**
- **Formats:** FBX, OBJ, COLLADA (.dae)
- **Quality:** Professional-grade mocap animations
- **Download:** Web-based auto-rigging and animation browser

### What Mixamo Offers

Mixamo is not a model source — it's an **animation factory**:
- **Auto-Rigger:** Upload any humanoid mesh → get a fully rigged character
- **2000+ Animations:** Walking, running, jumping, combat, dancing, emotes, etc.
- **Retargeting:** Apply any animation to any humanoid rig

### License Details

| Usage | Allowed? | Notes |
|-------|----------|-------|
| Commercial games | ✅ Yes | Must be integrated (compiled/packaged) |
| Attribution | Not required | — |
| Raw file redistribution | ❌ No | Cannot share FBX files outside project |
| AI/ML training | ❌ No | — |

### Strategy for Nexus Academy

1. Use Quaternius Universal Base Characters as mesh
2. Upload to Mixamo for additional animations not in Quaternius library
3. Export retargeted animations as FBX
4. Apply to all compatible humanoid characters

**This gives us unlimited NPC animations at zero cost.**

---

## Source 7: OpenGameArt ⭐⭐⭐

- **URL:** https://opengameart.org
- **License:** Various (CC0, CC-BY, GPL — filter carefully)
- **Formats:** Various
- **Quality:** Highly variable
- **Download:** Direct, no account required

### Notable Collections

| Collection | License | Contents |
|------------|---------|----------|
| Animated Characters Pack (Quaternius mirror) | CC0 | 50+ animated low-poly characters |
| CC0 Assets 3D Low Poly | CC0 | Landscape, props, vehicles, some characters |
| CC0 Characters | CC0 | Rigged creatures, people, stylized animals |

### Notes

OpenGameArt is more of a community repository. Much of the best content is
Quaternius mirrored. The search/filter UX is rough but the CC0 animated
3D section has useful finds. Always verify the license on each individual asset.

---

## Recommended Acquisition Plan

### Phase 1 — Core Assets (Week 1)

| Need | Source | Pack | Est. Models |
|------|--------|------|-------------|
| 6 companion bases | Quaternius | Ultimate Animated Animals + Cute Monsters | 33 |
| NPC humanoids | Quaternius | Universal Base Characters + Animation Library 2 | 6 + 130 anims |
| NPC variety | KayKit | Adventurers + Skeletons | 9 |
| Environment | Quaternius | Stylized Nature MegaKit | 116 |

### Phase 2 — Expansion (Week 2-3)

| Need | Source | Pack |
|------|--------|------|
| More NPCs | Quaternius | RPG Characters, Animated Men/Women |
| Aquatic creatures | Quaternius | Animated Cute Fish (52 models) |
| Fantasy creatures | Quaternius | Ultimate Monsters (50 models) |
| Buildings | Quaternius | Medieval Village MegaKit |
| Additional animations | Mixamo | Upload base chars → browse 2000+ anims |

### Phase 3 — Gap Filling (Ongoing)

- Poly.pizza and Sketchfab for specific one-off models
- Kenney modular pieces for props and furniture
- Custom retexturing of Quaternius models for companion personalities

---

## Retexturing Strategy

All Quaternius models use simple flat-color or gradient textures, making them
ideal candidates for retexturing to match our Frost (#22d3ee) + Aurora (#a78bfa)
palette:

1. **Companions:** Retexture base animal models with unique color schemes per
   personality (e.g., Fox gets warm amber, Owl gets deep purple/teal)
2. **NPCs:** Use Universal Base Characters' built-in skin/eye color system +
   swap hairstyles for variety
3. **Environment:** Stylized Nature MegaKit includes 7 leaf color varieties
   already — swap to match biome themes

### Technical Pipeline

```
Quaternius glTF/FBX → Blender (retexture/tweak) → glTF export → Three.js loader
                                                              → Babylon.js loader
```

All source models include .blend files (Source tier) or can be imported into
Blender from FBX/glTF for modification.

---

## License Summary

| Source | License | Attribution? | Commercial? | Redistribution? |
|--------|---------|-------------|------------|----------------|
| Quaternius | CC0 | No | ✅ Yes | ✅ Yes |
| KayKit (free tier) | CC0 | No | ✅ Yes | ✅ (don't resell unmodified) |
| Kenney | CC0 | No | ✅ Yes | ✅ Yes |
| Poly.pizza | CC0 (per-model) | No | ✅ Yes | ✅ Yes |
| Sketchfab | CC0 (filter) | No | ✅ Yes | ✅ Yes |
| Mixamo | Adobe EULA | No | ✅ Yes (integrated) | ❌ No raw files |
| OpenGameArt | Varies | Varies | Varies | Varies |

---

## Key Links

- Quaternius: https://quaternius.com
- KayKit: https://kaylousberg.itch.io/
- Kenney: https://kenney.nl/assets
- Poly.pizza: https://poly.pizza
- Sketchfab CC0 Animated: https://sketchfab.com/3d-models?features=downloadable+animated&licenses=cc0
- Mixamo: https://www.mixamo.com
- OpenGameArt: https://opengameart.org
- Itch.io CC0 Low-Poly: https://itch.io/game-assets/assets-cc0/tag-low-poly
