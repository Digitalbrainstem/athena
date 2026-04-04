# 23 — Audio Generation Manifest

> Complete inventory of all audio assets for Nexus Academy. Everything runs on the
> RTX 4060 (8GB CUDA) on Overwatch. Fish Audio handles ALL voice work + sound effects.
> DiffRhythm + HeartMuLa handle all music. Start with Priority 1, then batch the rest.

---

## Generation Tools

| Tool | GPU | Purpose |
|------|-----|---------|
| **Fish Audio** | 4060 | ALL voices (companion, NPC, narration, Nexus Voice), nature sounds, SFX, footsteps, ambient effects |
| **DiffRhythm** | 4060 | Biome music (ambient/activity/intensity layers), overworld music, exploration music |
| **HeartMuLa** | 4060 | Main theme, tier transitions, story moments, boss encounters, special events |

---

## Priority 1: Game Startup (generate FIRST)

These are needed to have a playable game. Generate immediately.

### Nexus Voice Lines (Fish Audio)
The voice of the academy itself — female, warm, futuristic, authoritative but kind.

| ID | Line | Emotion |
|----|------|---------|
| nv-welcome-01 | "Welcome to Nexus Academy. Your journey begins now." | warm, inviting |
| nv-welcome-02 | "A new mind enters the Nexus. The world has been waiting for you." | reverent |
| nv-welcome-back-01 | "Welcome back, explorer. The world remembers you." | warm |
| nv-welcome-back-02 | "You've returned. Your creations still stand." | pleased |
| nv-portal-01 | "Step through. Everything you need is on the other side." | encouraging |
| nv-portal-02 | "The gateway awaits. Are you ready?" | anticipation |
| nv-first-steps-01 | "Look around. This is the Workshop — your home." | gentle, guiding |
| nv-first-steps-02 | "Everything here was built by someone who started just like you." | inspiring |
| nv-companion-intro-01 | "Choose wisely. Your companion will grow with you." | meaningful |
| nv-companion-intro-02 | "They're more than a guide. They're a friend." | warm |
| nv-tier-up-foundation | "You've taken your first steps. The world opens before you." | proud |
| nv-tier-up-discovery | "Discovery awaits. The unknown becomes familiar." | excited |
| nv-tier-up-builder | "You build now. The world responds to your hands." | respect |
| nv-tier-up-innovator | "Innovation flows through you. Create what hasn't existed." | awe |
| nv-tier-up-creator | "You are a Creator now. Teach others what you've learned." | reverent |
| nv-nexus-core-01 | "The Nexus Core. Few reach this place. Fewer understand it." | hushed awe |
| nv-hint-gentle-01 | "Take your time. There's no rush here." | patient |
| nv-hint-gentle-02 | "Try a different approach. The answer is closer than you think." | encouraging |
| nv-night-01 | "The stars are out. Even the Nexus rests." | peaceful |
| nv-break-01 | "You've been exploring a while. Stretch your legs?" | caring |

### Companion Voice Lines — Foundation Tier (Fish Audio)
For ages 2-5. Direct, warm, Dora-style. Each companion type needs these.

| ID Pattern | Line | Emotion |
|------------|------|---------|
| comp-{type}-hello-01 | "Hi! I'm {name}! Want to explore together?" | excited, friendly |
| comp-{type}-hello-02 | "You're here! I've been waiting for you!" | joyful |
| comp-{type}-look-01 | "Look at that! What do you think it is?" | curious |
| comp-{type}-look-02 | "Ooh! Do you see it? Over there!" | pointing, excited |
| comp-{type}-count-01 | "One... two... three! Can you count with me?" | playful |
| comp-{type}-color-01 | "What color is that? I think it's... blue!" | thinking, fun |
| comp-{type}-good-01 | "You did it! That was amazing!" | celebrating |
| comp-{type}-good-02 | "Wow! You're so smart!" | genuine praise |
| comp-{type}-try-01 | "Hmm, not quite. Want to try again?" | gentle, no judgment |
| comp-{type}-try-02 | "That's okay! Let's figure it out together." | supportive |
| comp-{type}-walk-01 | "Come on, let's go this way!" | adventurous |
| comp-{type}-build-01 | "Let's build something! What should we make?" | creative |
| comp-{type}-bye-01 | "See you next time! I'll be right here waiting!" | warm |
| comp-{type}-idle-01 | "*hums softly*" | content |
| comp-{type}-idle-02 | "I wonder what's over that hill..." | curious, musing |

**Types:** fox, owl, rabbit, bear, cat, dragon (6 × 15 lines = 90 lines)

### Starting Music (DiffRhythm)

| ID | Description | Duration | Style |
|----|-------------|----------|-------|
| music-portal-ambient | Portal screen background — ethereal, cosmic, anticipation | 2:00 loop | ambient electronic, stargate-like |
| music-workshop-ambient-01 | Workshop biome calm — warm, safe, creative | 3:00 loop | acoustic + soft synth, Ghibli-like |
| music-workshop-activity-01 | Workshop active — building, crafting energy | 3:00 loop | layered percussion + melody |
| music-workshop-intensity-01 | Workshop challenge — focused, determined | 3:00 loop | driving rhythm, still warm |
| music-overworld-01 | Overworld exploration — wonder, open sky | 3:00 loop | orchestral + electronic |
| music-main-theme | Nexus Academy main theme | 2:00 | heroic, wonder, adventure (HeartMuLa) |

### Starting Ambiance & SFX (Fish Audio)

| ID | Description | Type |
|----|-------------|------|
| amb-workshop-base | Workshop ambient — gentle machinery hum, crackling fire, birdsong | loop 30s |
| amb-workshop-forge | Forge area — bellows, metal clanks, fire roar | loop 30s |
| amb-wind-gentle | Gentle breeze through grass | loop 15s |
| amb-wind-strong | Strong wind gusts | loop 15s |
| amb-birds-morning | Morning birdsong chorus | loop 30s |
| amb-birds-single | Single bird calling | one-shot 3s |
| amb-water-stream | Babbling brook / stream | loop 30s |
| amb-water-ocean | Ocean waves on shore | loop 30s |
| amb-crickets-night | Night crickets | loop 30s |
| amb-fire-crackling | Campfire / hearth crackling | loop 30s |
| sfx-footstep-grass-01 through 05 | Footsteps on grass (5 variations) | one-shot |
| sfx-footstep-stone-01 through 05 | Footsteps on stone | one-shot |
| sfx-footstep-wood-01 through 05 | Footsteps on wood | one-shot |
| sfx-footstep-sand-01 through 05 | Footsteps on sand | one-shot |
| sfx-footstep-water-01 through 05 | Footsteps in shallow water | one-shot |
| sfx-door-open | Wooden door opening | one-shot |
| sfx-door-close | Wooden door closing | one-shot |
| sfx-chest-open | Treasure chest opening | one-shot |
| sfx-item-pickup | Picking up an item — satisfying click | one-shot |
| sfx-craft-start | Crafting begins — tools gathering sound | one-shot |
| sfx-craft-complete | Crafting complete — satisfying ding | one-shot |
| sfx-build-place | Placing a block/object — solid thud | one-shot |
| sfx-build-complete | Building complete — triumphant short chime | one-shot |
| sfx-discovery | New area/thing discovered — wonder chord | one-shot |
| sfx-quest-accept | Quest accepted — confident tone | one-shot |
| sfx-quest-complete | Quest complete — celebration fanfare | one-shot |
| sfx-level-up | Mastery level increase — ascending sparkle | one-shot |
| sfx-ui-click | Menu click | one-shot |
| sfx-ui-back | Menu back | one-shot |
| sfx-ui-hover | Menu hover | one-shot |
| sfx-correct | Correct action — bright ascending chime | one-shot |
| sfx-incorrect | Wrong action — soft neutral tone (NOT harsh) | one-shot |

**Priority 1 total: ~150 voice lines + 6 music tracks + 45 SFX/ambient**

---

## Priority 2: All 27 Biomes (generate after Priority 1)

### Biome Music (DiffRhythm) — 27 biomes × 100 variations each

Each biome gets:
- 50 ambient tracks (calm, exploration, different moods/times of day)
- 30 activity tracks (building, crafting, questing — energy)
- 20 intensity tracks (challenges, boss encounters, time pressure)

**= 2,700 tracks minimum, expandable to 5,400+ with weather/season variants**

| Biome | Mood Keywords | Instruments |
|-------|--------------|-------------|
| Workshop | warm, creative, safe, home | acoustic guitar, soft piano, gentle percussion |
| Meadow | peaceful, sunny, pastoral | flute, strings, birdsong elements |
| Forest | mysterious, ancient, deep | cello, woodwinds, ambient pads |
| Mountain | majestic, crisp, challenging | horns, timpani, echoing synth |
| Desert | vast, ancient, scorching | oud, tabla, windswept pads |
| Ocean | flowing, deep, rhythmic | harp, whale-song synth, waves |
| Cave | echoing, hidden, crystalline | glass marimba, dripping reverb |
| Volcano | intense, primal, raw | tribal drums, brass, rumble bass |
| Arctic | pure, still, vast | glass bells, ethereal choir, wind |
| Jungle | dense, alive, humid | marimba, congas, animal calls |
| Swamp | murky, ancient, organic | didgeridoo, frogs, squelch bass |
| Coral Reef | colorful, bubbly, playful | steel drum, xylophone, bubble fx |
| Storm Plains | electric, dynamic, wild | synth arpeggios, thunder rolls |
| Crystal Caves | sparkling, geometric, harmonic | crystal bowls, chimes, resonance |
| Sky Islands | airy, free, weightless | pan flute, harp, wind chimes |
| Clockwork City | mechanical, precise, rhythmic | clock ticks, gears, piano |
| Library Nexus | quiet, scholarly, deep | soft piano, page turns, whispers |
| Starport | futuristic, vast, excited | synth pads, spacey arps, engines |
| Magma Depths | heavy, ancient, powerful | taiko drums, bass growl, lava |
| Enchanted Garden | magical, whimsical, bright | music box, harp, fairy bells |
| Ruins | ancient, melancholy, mysterious | lonely violin, stone echoes |
| Farmland | honest, hardworking, seasons | fiddle, banjo, morning birds |
| Harbor | salty, adventurous, bustling | accordion, gulls, wood creaks |
| Code Forge | digital, logical, electric | 8-bit + orchestral hybrid |
| Nexus Core | transcendent, awe, infinite | full orchestra + synth choir |
| Alien Worlds (5) | each unique — see universe doc | varies per civilization |
| Space | vast, empty, wonder | ambient synth, distant stars |

### Biome Ambiance (Fish Audio) — 27 biomes × 5-10 ambient loops each

| Biome | Ambient Elements |
|-------|-----------------|
| Workshop | forge hammering, wood sawing, chicken clucking, cart wheels |
| Meadow | wind through tall grass, insects buzzing, distant birdsong |
| Forest | leaves rustling, twigs snapping, owl hoots, wolf howl distant |
| Mountain | wind gusts, rock crumbles, eagle cry, snow crunch |
| Desert | sand blowing, heat shimmer hum, distant camel, oasis trickle |
| Ocean | waves crashing, gulls calling, dolphin clicks, wind spray |
| Cave | dripping water, echo footsteps, bat flutter, mineral hum |
| Volcano | lava bubbling, steam vents, rock grinding, deep rumble |
| Arctic | ice cracking, wind howl, snow settling, aurora hum |
| Jungle | parrots, monkeys, rain on leaves, insects, river rush |
| (etc for all 27...) | |

**= 200+ ambient loops**

### Biome Footsteps (Fish Audio) — per terrain type

| Terrain | Variations | Notes |
|---------|-----------|-------|
| Grass | 8 | soft, varied pitch |
| Stone | 8 | hard, echoey |
| Wood | 8 | hollow, creaky |
| Sand | 8 | soft, shifting |
| Water (shallow) | 8 | splashy |
| Snow | 8 | crunchy |
| Metal | 8 | clangy |
| Mud | 8 | squelchy |
| Crystal | 8 | tinkling |
| Leaves | 8 | rustling |

**= 80 footstep sounds**

### Nature Sounds (Fish Audio) — immersive world sounds

| Category | Count | Examples |
|----------|-------|---------|
| Weather | 20 | light rain, heavy rain, thunder close/far, hail, wind levels 1-5 |
| Water | 15 | waterfall, river, puddle splash, wave types, underwater |
| Animals | 40 | birds (10 types), insects (5), mammals (10), fish (5), aliens (10) |
| Vegetation | 15 | tree creak, leaves rustle, grass sway, flower bloom, branch snap |
| Mechanical | 20 | gears turning, steam hiss, piston pump, bell ring, clock tick |
| Atmospheric | 10 | cave echo, canyon reverb, space hum, portal whoosh, energy crackle |

**= 120 nature/world sounds**

---

## Priority 3: Full Voice Lines (batch over days)

### Companion Voices — Full Set (Fish Audio)
6 companion types × 1,000 lines each = **6,000 lines**

Categories per companion:
- Greetings/farewells (50)
- Exploration commentary (200)
- Teaching/hints (150)
- Celebrations/praise (100)
- Encouragement/support (100)
- Quest dialogue (200)
- Idle chatter (100)
- Emotional responses (100)

### NPC Dialogue (Fish Audio)
13,600 NPC templates × 5 lines average = **68,000 lines**

Voice profiles needed:
- 20 distinct adult voices (10 male, 10 female)
- 10 child voices
- 5 elder voices
- 10 alien voices (per civilization)
- Modular — same line, different voice = different NPC

### Quest Narration (Fish Audio)
~8,000 quest narration lines for signs, scrolls, journals, books.

### Nexus Voice — Full Set (Fish Audio)
500 lines covering every game state, transition, hint, celebration.

---

## Full Scale Summary

| Category | Count | Tool | Est. Gen Time |
|----------|-------|------|---------------|
| Priority 1 voices | 150 | Fish Audio | ~30 min |
| Priority 1 music | 6 | DiffRhythm + HeartMuLa | ~5 min |
| Priority 1 SFX/ambient | 45 | Fish Audio | ~15 min |
| Biome music (P2) | 2,700-5,400 | DiffRhythm | ~8-15 hours |
| Biome ambiance (P2) | 200+ | Fish Audio | ~2 hours |
| Footsteps (P2) | 80 | Fish Audio | ~20 min |
| Nature sounds (P2) | 120 | Fish Audio | ~1 hour |
| Companion voices (P3) | 6,000 | Fish Audio | ~8 hours |
| NPC dialogue (P3) | 68,000 | Fish Audio | ~56 hours |
| Quest narration (P3) | 8,000 | Fish Audio | ~7 hours |
| Nexus Voice full (P3) | 500 | Fish Audio | ~1 hour |
| Special music (P3) | 100 | HeartMuLa | ~2 hours |
| **TOTAL** | **~86,000 audio files** | | **~100 hours gen** |

---

## File Organization

```
content/audio/
├── voice/
│   ├── nexus/           # nv-welcome-01.ogg, nv-tier-up-foundation.ogg...
│   ├── companion/
│   │   ├── fox/         # comp-fox-hello-01.ogg...
│   │   ├── owl/
│   │   ├── rabbit/
│   │   ├── bear/
│   │   ├── cat/
│   │   └── dragon/
│   ├── npc/
│   │   ├── adult-m-01/  # Voice profile folders
│   │   ├── adult-f-01/
│   │   └── ...
│   └── narration/       # quest-001.ogg, sign-workshop-01.ogg...
├── music/
│   ├── theme/           # music-main-theme.ogg
│   ├── portal/          # music-portal-ambient.ogg
│   ├── biome/
│   │   ├── workshop/    # workshop-ambient-001.ogg through 050.ogg
│   │   ├── meadow/
│   │   └── ...
│   └── special/         # tier transitions, story moments
├── sfx/
│   ├── footsteps/       # grass-01.ogg, stone-01.ogg...
│   ├── actions/         # craft-start.ogg, build-place.ogg...
│   ├── ui/              # click.ogg, hover.ogg...
│   └── feedback/        # correct.ogg, discovery.ogg...
└── ambient/
    ├── nature/          # wind-gentle.ogg, birds-morning.ogg...
    ├── weather/         # rain-light.ogg, thunder-close.ogg...
    ├── biome/
    │   ├── workshop/    # workshop-base.ogg, workshop-forge.ogg...
    │   ├── meadow/
    │   └── ...
    └── mechanical/      # gears.ogg, steam-hiss.ogg...
```

All files: OGG Vorbis, 44.1kHz, mono for SFX, stereo for music/ambient.

---

*Previous: [22-UNIVERSE_DESIGN.md](22-UNIVERSE_DESIGN.md)*
