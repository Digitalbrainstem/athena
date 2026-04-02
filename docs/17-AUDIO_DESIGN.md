# 17 — Audio Design

> Sound is half the experience. In voice-only mode, it IS the experience. Nexus Academy
> uses Fish Audio TTS for the companion voice, Qwen3-TTS for narration, a library of
> 500+ sound effects, adaptive layered music per biome, and spatial audio for immersion.
> Every biome is recognizable by sound alone. Every action has audio feedback. Music
> adapts to gameplay state in real-time. This document covers the full audio system.

---

## Audio Architecture

```
Audio Engine
├── Voice System
│   ├── Fish Audio TTS (companion voice — primary)
│   ├── Qwen3-TTS (narration, NPCs — secondary)
│   └── Voice ducking (auto-lower music/sfx when speaking)
│
├── Sound Effects
│   ├── Action feedback (correct, wrong, discover, build, craft)
│   ├── Environmental (weather, terrain, creatures, machinery)
│   ├── Movement (footsteps per terrain type, vehicle sounds)
│   └── UI (menu, inventory, save, quest accept)
│
├── Music System
│   ├── Per-biome layered tracks (ambient + activity + intensity)
│   ├── Adaptive (layers add/remove based on state)
│   └── Crossfade (seamless biome-to-biome transitions)
│
└── Spatial Audio
    ├── Web Audio API (binaural processing)
    ├── Positional sounds (creatures, machinery, water)
    └── Distance attenuation (closer = louder)
```

---

## Companion Voice

### Primary: Fish Audio TTS

Fish Audio provides the companion's main voice — warm, expressive, and
character-consistent. Multiple voice profiles are available:

| Profile | Characteristics | Best For |
|---------|----------------|----------|
| **Warm** | Gentle pace, nurturing tone, soft resonance | Foundation, anxious players |
| **Energetic** | Fast pace, enthusiastic, higher pitch range | Discovery, re-engagement |
| **Calm** | Steady pace, reassuring, measured delivery | Builder, complex problem-solving |
| **Playful** | Variable pace, witty tone, wide pitch range | Any age, humor-responsive players |
| **Scholarly** | Precise diction, moderate pace, articulate | Innovator, Creator |

### Emotional Modulation

The companion's voice expresses emotion through:

| Emotion | Audio Characteristics |
|---------|---------------------|
| **Excited** | Faster pace, higher pitch, more dynamic range |
| **Thinking** | Slower pace, lower pitch, occasional "hmm" |
| **Celebrating** | High energy, ascending pitch, faster |
| **Concerned** | Softer volume, lower pitch, careful pacing |
| **Curious** | Rising intonation, medium pace, engaged tone |
| **Impressed** | Breathy, wide-eyed tone, genuine surprise |
| **Gentle redirect** | Soft, steady, warm — never harsh |

### Secondary: Qwen3-TTS

Used for:
- In-world narration (signs, scrolls, journals)
- NPC dialogue (distinct from companion)
- Story recordings (The Founders' messages)
- Tutorial text (when companion isn't speaking)

Different voice from the companion to maintain clear distinction.

### Pre-Rendered vs. Real-Time

| Content Type | Rendering | Latency |
|-------------|-----------|---------|
| Companion quest dialogue | Pre-rendered in Atlas batch | 0ms (cached) |
| Dynamic companion responses | Real-time Fish Audio API | 200-500ms |
| NPC dialogue | Pre-rendered | 0ms |
| Player name in dialogue | Real-time (spliced into pre-rendered) | 100ms |

Pre-rendering is preferred for quality and latency. Atlas generates TTS audio for all
known dialogue during the nightly batch (see [09-CONTENT_PIPELINE.md](09-CONTENT_PIPELINE.md)).
Real-time TTS is used only for dynamic responses that can't be pre-generated.

---

## Sound Effects

### Action Feedback

Every player action gets immediate audio feedback:

| Action | Sound | Design Notes |
|--------|-------|-------------|
| **Correct answer** | Bright ascending chime (major chord) | 200ms, satisfying, not over-the-top |
| **Wrong answer** | Soft neutral tone (not harsh, not sad) | 150ms, gentle, no punishment feeling |
| **Discovery** | Wonder chord (open fifth, shimmer) | 500ms, sense of awe |
| **Build success** | Solid "click" + structural settling | 300ms, feels permanent |
| **Build failure** | Crumbling/collapsing (playful, not scary) | 800ms, clear but not punishing |
| **Craft success** | Bubbling completion + sparkle | 400ms, magical |
| **Craft failure** | Poof/smoke (comedic) | 300ms, companion reacts with humor |
| **Quest complete** | Triumphant fanfare (short) | 2s, memorable |
| **Story fragment found** | Ancient resonance + chime | 1s, mysterious, exciting |
| **Level up (invisible)** | Subtle warm glow tone | 500ms, the player feels it but doesn't know why |

### Age-Tier Audio Adjustment

| Element | Foundation | Discovery | Builder+ |
|---------|---------------|----------|-------------|
| Correct sound | Big celebration (confetti + music) | Satisfying chime | Clean confirmation |
| Wrong sound | Barely audible + companion redirect | Soft neutral tone | Quick, informational |
| Celebration frequency | Every single correct answer | Key moments | Milestones only |
| Sound complexity | Simple, clear, distinct | Moderate, contextual | Rich, layered, subtle |

### Environmental Sounds

| Category | Examples | Spatial? |
|----------|---------|----------|
| **Weather** | Rain, thunder, wind, snow | Yes — directional |
| **Water** | River, waterfall, dripping, ocean waves | Yes — positional |
| **Animals** | Birds, insects, creatures per biome | Yes — positioned in world |
| **Machinery** | Workshop gears, Code Forge hums, lab bubbles | Yes — tied to objects |
| **Terrain** | Footsteps on grass/stone/sand/metal/water/wood | Follows player position |
| **Ambient** | Distant sounds, atmosphere, cave echoes | Yes — reverb zones |

### Sound Library

Target: 500+ unique sound effects at launch, expandable:

- **100+** environmental/ambient sounds (per biome)
- **50+** footstep variations (terrain × speed)
- **100+** action/feedback sounds (crafting, building, discovery)
- **50+** creature sounds (per biome animals)
- **50+** UI sounds (menus, inventory, navigation)
- **100+** weather/nature sounds
- **50+** companion emotion sounds (non-verbal reactions)

---

## Music System

### Layered Adaptive Music

Each biome has a multi-layer musical track that responds to gameplay:

```
Layer 1: AMBIENT (always playing)
  Low-key, atmospheric, biome-specific
  Example: Crystal Caverns = crystalline pads, soft reverb, occasional chime

Layer 2: ACTIVITY (plays during active gameplay)
  Gentle rhythm, melodic elements
  Added when the player is exploring/crafting/building
  
Layer 3: INTENSITY (plays during challenges)
  Driving rhythm, harmonic tension
  Added during quest challenges, impossible challenges, timed elements
  
Layer 4: TRIUMPH (brief, plays on success)
  Full orchestral/melodic resolution
  Plays for 5-10 seconds after major accomplishments
```

### Biome Musical Identity

| Biome | Musical Character | Instruments |
|-------|------------------|-------------|
| Workshop | Industrial, rhythmic, warm | Hammer percussion, brass, mechanical sounds |
| Alchemist's Lab | Mysterious, bubbling, wonder | Glass percussion, harp, woodwind |
| Observatory | Cosmic, ethereal, vast | Strings, synth pads, theremin-like tones |
| Ancient Ruins | Ancient, solemn, discovery | Duduk, frame drum, stone percussion |
| Living Forest | Organic, breathing, alive | Flute, acoustic guitar, nature sounds |
| Trading Post | Bustling, warm, multicultural | World instruments, percussion, folk |
| Crystal Caverns | Crystalline, echoey, otherworldly | Crystal bowls, bell trees, reversed piano |
| Code Forge | Electronic, precise, flowing | Synth, digital sounds, lo-fi beats |
| Storm Tower | Dramatic, electric, powerful | Electronic, orchestral, thunder percussion |
| Library of Echoes | Quiet, contemplative, whispered | Solo piano, strings, page-turn ASMR |
| Shipyard | Maritime, adventurous, mechanical | Accordion, sea shanty elements, mechanical |

### Crossfade Between Biomes

When the player moves between biomes, music crossfades over 10-15 seconds:
- Current biome music fades out
- Silence or blend for 3-5 seconds
- New biome music fades in
- Blending zones play a mix of both biome themes

### Age-Tier Musical Complexity

| Tier | Musical Complexity | Instrumentation |
|------|-------------------|-----------------|
| Foundation | Simple melodies, clear rhythms, repetitive | Xylophone, ukulele, simple percussion |
| Discovery | More complex melodies, developing themes | Acoustic instruments, light orchestra |
| Builder | Rich arrangements, dynamic range | Full orchestra, electronic elements |
| Innovator | Sophisticated harmony, complex rhythms | Chamber ensemble, advanced electronic |
| Creator | Subtle, powerful, sometimes minimal | Whatever serves the moment |

---

## Spatial Audio

### Web Audio API Implementation

All audio in the game is spatialized using the Web Audio API:

- **Listener position** tracks the player/camera
- **Sound sources** are positioned in 3D space
- **Distance attenuation** — sounds get quieter with distance
- **Binaural processing** on stereo systems for directional perception
- **Mono fallback** on single speakers (satellite) — still uses volume for distance

### Audio Zones

Different areas of the world have different audio properties:

| Zone Type | Reverb | Attenuation | Examples |
|-----------|--------|-------------|---------|
| Open air | Low reverb | Normal | Forest, trading post, field |
| Cave | High reverb, long decay | Slower | Crystal Caverns, mines |
| Indoor | Medium reverb | Faster | Workshop, library, lab |
| Underwater | Filtered, muffled | Variable | Submarine quests |
| Space | No reverb (vacuum) | Sharp cutoff | Orbit, interplanetary |

---

## Voice Ducking

When the companion speaks, all other audio reduces:

```
Companion starts speaking:
  Music volume → 30% over 200ms
  Ambient SFX → 50% over 200ms
  Action SFX → unchanged (still need feedback)

Companion stops speaking:
  Music volume → 100% over 500ms
  Ambient SFX → 100% over 500ms
```

This ensures the companion voice is always clearly audible without the player
adjusting volume. Critical for voice-only mode on satellite speakers.

---

## Audio for Voice-Only Mode

When playing on satellite speakers (see [12-VOICE_GAMEPLAY.md](12-VOICE_GAMEPLAY.md)),
audio is the ENTIRE experience. Design requirements:

1. **Every visual element must have an audio equivalent.** If it exists on screen,
   it has a sound in voice mode.
2. **Biome recognition by sound alone.** Players must know where they are by ambient audio.
3. **Spatial cues for navigation.** "The river is to your left" supported by actual
   left-channel water sounds.
4. **Distinct sound per interaction type.** Player must distinguish "correct" from
   "discovery" from "quest complete" by sound alone.
5. **Companion describes visuals.** "The crystals are glowing blue" — paired with
   crystalline blue-tinted audio.

---

## Technical Specs

| Component | Specification |
|-----------|--------------|
| TTS quality | 24kHz minimum, 44.1kHz preferred |
| SFX format | OGG Vorbis 44.1kHz (pre-loaded into memory) |
| Music format | OGG Vorbis 128kbps (streaming or cached) |
| Spatial processing | Web Audio API with HRTF for stereo |
| Max simultaneous sources | 32 (with priority system) |
| Latency budget | < 50ms from action to audio feedback |
| Pre-rendered TTS cache | ~50 MB per player of companion dialogue |

---

## Research Required

Before building against this document, complete the following research:

- [ ] **AI music composition** — Evaluate Suno, Udio, MusicGen (Meta), and Stable Audio for game music generation. Test ability to generate layered, loopable biome tracks. Measure quality of adaptive music (can AI generate separate layers that mix well?). Evaluate licensing terms for AI-generated game music.
- [ ] **AI sound effect generation** — Test AudioGen (Meta), Stable Audio, and ElevenLabs sound effects for game SFX generation. Compare to traditional Foley and synthesis. Evaluate whether AI can generate 500+ unique, high-quality game sounds.
- [ ] **Adaptive music systems in games** — Study Wwise (Audiokinetic) and FMOD adaptive music implementations. Research how Zelda: BotW, Minecraft, and Journey implement layered adaptive soundtracks. Identify patterns portable to Web Audio API.
- [ ] **Fish Audio TTS benchmarks** — Benchmark Fish Audio for: latency per line, emotional range, voice consistency across long sessions, batch rendering throughput, child-appropriate voice profiles. Compare with Qwen3-TTS, Kokoro, and Piper for quality/speed tradeoffs.
- [ ] **Web Audio API spatial audio** — Test HRTF (Head-Related Transfer Function) processing in Web Audio API across browsers. Benchmark on Surface Go. Evaluate whether binaural audio is perceptible on typical tablet speakers. Test mono-speaker psychoacoustic techniques.
- [ ] **Game audio design books** — Read "A Composer's Guide to Game Music" (Winifred Phillips), "Game Sound" (Karen Collins), and "An Introduction to the Art of Sound Design" (David Sonnenschein). Extract principles for educational game audio.

---

*Previous: [16-ART_DIRECTION.md](16-ART_DIRECTION.md) — Visual style.*
*Next: [18-TECHNICAL_ARCHITECTURE.md](18-TECHNICAL_ARCHITECTURE.md) — System architecture.*
