# 30 — Engine Decision & Multi-Platform Strategy

> **DECISION: Godot Engine (GDScript/C#)**
> 
> Chosen for: native export to ALL platforms including consoles.
> TypeScript/Three.js was the initial prototype engine but does NOT reach
> Nintendo Switch, Xbox, or PlayStation. Godot exports everywhere.

---

## Why Godot Over Three.js/Babylon.js

| Requirement | Three.js | Babylon.js | Godot |
|-------------|----------|------------|-------|
| Nintendo Switch | ❌ | ❌ | ✅ (via porting partners) |
| Xbox Series | ❌ | ❌ | ✅ (via W4 Games / Pineapple Works) |
| PlayStation 5 | ❌ | ❌ | ✅ (via porting partners) |
| Steam Deck | ❌ (needs Electron) | ❌ | ✅ Official Linux export |
| iOS native | ❌ (PWA only) | ❌ | ✅ Native export |
| Android native | ❌ (PWA only) | ❌ | ✅ Native export |
| PC native | ❌ (needs Electron) | ❌ | ✅ Win/Mac/Linux |
| Web browser | ✅ | ✅ | ✅ HTML5 export |
| Audio-only (Hermes) | ⚠️ Custom | ⚠️ Custom | ✅ Headless/server export |
| Built-in physics | ❌ (needs Rapier) | ✅ Havok | ✅ Godot Physics / Jolt |
| Built-in audio | ❌ (Web Audio API) | ✅ | ✅ AudioServer |
| Built-in UI system | ❌ (HTML/CSS) | ✅ | ✅ Control nodes |
| Scene editor | ❌ | ❌ | ✅ Full visual editor |
| Animation system | ❌ (manual) | ✅ | ✅ AnimationPlayer/Tree |
| Open source | ✅ MIT | ✅ Apache | ✅ MIT |
| Language | TypeScript | TypeScript | GDScript / C# / C++ |

## Hardware Tiers (from Core Principles)

The game adapts to the hardware it runs on:

### Tier 1 — Full 3D (Primary)
- **Devices:** PC, Mac, consoles, tablets, phones, Surface Go, Steam Deck
- **Engine:** Godot 4.x with Vulkan/OpenGL renderer
- **Features:** Full 3D world, animated companions, particle effects, spatial audio

### Tier 2 — Simplified 3D
- **Devices:** Low-end phones, older tablets, Raspberry Pi with display
- **Engine:** Godot 4.x with Compatibility renderer (OpenGL ES 3.0)
- **Features:** Reduced draw distance, simpler shaders, fewer particles, same gameplay

### Tier 3 — Audio Only (Hermes Satellites)
- **Devices:** Raspberry Pi speakers, ESP32 audio devices
- **Engine:** Lightweight Python/Rust runtime (not Godot)
- **Features:** Pure voice interaction, companion narrates everything, no screen needed
- **Syncs:** Progress syncs to player's profile on home server

## Getting on Nintendo Switch — The Path

### Step 1: Register as Nintendo Developer (FREE)
- https://developer.nintendo.com/register
- Individuals can register (no company needed)
- Sign NDA and publishing contracts

### Step 2: Get Accepted
- Nintendo is known to be MORE accepting of indie/educational developers
- Our case is strong: free educational game, no monetization, open source
- Being non-commercial may actually help — Nintendo has education initiatives

### Step 3: Use a Porting Partner
Since Godot can't include console code in its open-source repo (NDA conflict),
third-party companies provide the console export:

| Company | Platforms | Notes |
|---------|-----------|-------|
| **W4 Games** | Switch, Xbox, PS5 | Official Godot middleware (founded by Godot creators) |
| **Pineapple Works** | Switch, Xbox | Also offers publishing |
| **Lone Wolf Technology** | Switch, PS4 | Porting + publishing |
| **Seaven Studio** | Switch, Xbox, PS4, PS5 | Full console coverage |
| **Sickhead Games** | All consoles | Experienced Godot porter |
| **mazette! games** | Switch, Xbox | Porting + publishing |

### Cost Considerations for Open-Source/Free Games
- Nintendo developer registration: **FREE**
- Devkit: Confidential but typically $300-500 for indie
- Porting cost: $10-30K through a porting company
- **Alternative:** W4 Games middleware may be cheaper for self-porting
- **Alternative:** Apply for Nintendo indie/education grants
- **Alternative:** Community fundraiser (since game is free for all)
- **Alternative:** Apply for educational technology grants (NSF, Gates Foundation, etc.)
- The game can be listed as FREE on eShop ($0.00)

### The Free Distribution Question
Yes, you CAN list a free game on Nintendo eShop. Examples exist.
The main cost is the one-time porting, not ongoing distribution.

## What Transfers from TypeScript → Godot

| Asset | Transfers? | Notes |
|-------|-----------|-------|
| 3D Models (GLB/GLTF) | ✅ 100% | Godot loads GLB natively |
| Audio (WAV/OGG) | ✅ 100% | Godot AudioServer plays both |
| Music (WAV) | ✅ 100% | Convert to OGG for smaller size |
| Voice lines | ✅ 100% | Same audio files |
| Game design docs | ✅ 100% | Logic unchanged |
| Content pipeline | ✅ 100% | Python scripts unchanged |
| Atlas integration | ✅ 100% | REST API unchanged |
| Shaders | ⚠️ Rewrite | GLSL → Godot Shader Language (similar) |
| UI code | ⚠️ Rewrite | HTML/CSS → Godot Control nodes |
| Game logic | ⚠️ Rewrite | TypeScript → GDScript or C# |
| Physics | ✅ Simpler | Godot has built-in physics |

## Port Strategy

1. **Phase 1:** Set up Godot project, import all GLB models and audio
2. **Phase 2:** Rebuild portal intro as Godot scene
3. **Phase 3:** Rebuild companion picker with Godot UI
4. **Phase 4:** Build Workshop biome in Godot scene editor
5. **Phase 5:** Implement game physics (built-in, not Rapier)
6. **Phase 6:** Test on PC, Android, Web exports
7. **Phase 7:** Contact W4 Games or porting partner for console builds

---

*This decision supersedes the Three.js/Babylon.js TODO in 18-TECHNICAL_ARCHITECTURE.md.*
*The TypeScript prototype served its purpose for rapid iteration. Production builds use Godot.*
