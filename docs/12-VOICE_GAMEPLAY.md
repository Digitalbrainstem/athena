# 12 — Voice Gameplay

> Nexus Academy runs on Atlas satellite speakers (Hermes) with ZERO screen — pure voice
> interaction through sound and speech. This is not a reduced version of the visual game.
> It's a parallel experience designed from the ground up for audio-only interaction. The
> companion becomes narrator, game master, and the player's eyes. Story, puzzles, math,
> science — all delivered through voice, sound effects, and music.

---

## Overview

Voice gameplay runs on satellite hardware (Raspberry Pi or ESP32 speakers connected to
the home network). The companion character speaks through the speaker, the player responds
by voice, and the entire game world exists in audio.

Game state syncs with the player's profile on the Nexus server. Progress earned in voice
mode carries to the visual game and vice versa. A player can start a quest on the
satellite speaker at breakfast and continue it on the Surface Go after school.

---

## Input & Output

### Input

| Method | Details |
|--------|---------|
| Wake word | "Hey Nexus" or the companion's custom name |
| Voice commands | Natural speech, processed by Whisper STT |
| Fuzzy matching | "Twee" → "three", "weh" → "red" (toddler-friendly) |
| Confirmation | "Did you say three?" before critical actions |
| Timeout grace | Long pause ≠ wrong answer. Companion waits, then prompts gently |
| Repeat | "Say that again?" always works. No penalty, unlimited repeats. |

### Output

| Channel | Details |
|---------|---------|
| Companion voice | Fish Audio TTS — warm, expressive, character-consistent |
| Sound effects | Spatial audio for immersion (footsteps, water, fire, animals) |
| Music | Adaptive ambient soundtrack, victory fanfares, tension cues |
| Silence | Used deliberately for thinking time, suspense, emphasis |
| Voice ducking | Music/SFX auto-lower when companion speaks |

---

## Voice Quest Design Principles

1. **Paint with words.** Every scene described vividly. Player must SEE it in their mind.
2. **Binary or small-set choices.** "Left or right?" "Red, blue, or green?" Never more than 4.
3. **Repeat on request.** Always works. No penalty. No limit.
4. **State reminders.** Companion periodically: "You have 3 crystals and a map."
5. **No time pressure by default.** Player thinks as long as needed.
6. **Audio landmarks.** Each biome has a signature sound — players know where they are by ear.
7. **Save anywhere.** "Let's save here. Say 'Hey Nexus' when you want to continue!"

---

## Age-Tier Voice Experiences

### Little Learner (Ages 2–5)

**Style:** Dora meets bedtime story. Companion talks directly to child, asks questions,
celebrates, uses repetition and rhythm.

**Example — "The Counting Garden":**

```
[cheerful music, birds chirping]

COMPANION: "Hi, Emma! Welcome back to the Counting Garden!
Last time we planted three sunflowers. How many was that?
...Three! That's right! 

[seed dropping sounds]
Today, Farmer Fox gave us MORE seeds!
Let's count them together. Ready?
One... [plop] two... [plop] three... [plop]
four... [plop] five! [plop]

Five seeds! Can you say five?"

CHILD: "Five!"

COMPANION: "FIVE! Amazing! [confetti sound, happy music]
Now let's plant them! Each seed needs a hole.
I'll dig... [digging sound] ...you count!
One hole!"

CHILD: "One!"

COMPANION: "One! Here comes another... [digging sound]"

[continues through five, then waters, celebrates growth]
```

**Voice-only mechanics for ages 2–5:**
- Counting games (companion counts, child joins or answers)
- Animal sounds ("What does a cow say?")
- Color identification through story ("The ball is RED. What color?")
- Yes/no questions ("Is a fish bigger than a whale?")
- Action songs (clapping, stomping)
- Simple choices ("River or mountain?")
- Phonics ("B says buh. Ball! Bear! What starts with B?")
- Shape descriptions ("I'm round like a ball. What shape am I?")
- Turns/rotation ("Do a quarter turn! Now clap!")

### Explorer (Ages 6–10)

**Style:** Choose-your-own-adventure with puzzles. Companion is adventure partner.
Narration is vivid and immersive.

**Example — "The Crystal Cave Mystery":**

```
[cave ambiance — dripping water, echoes]

COMPANION: "Okay, Alex. We're deeper in the Crystal Cave.
Faint glow ahead... and the tunnel forks.

Left: I hear rushing water — underground river.
Right: The crystals are getting brighter.

Which way?"

CHILD: "Right!"

COMPANION: "Right it is! [footsteps on stone]

[crystalline chiming]
Whoa! The walls are COVERED in crystals!
Red, blue, green. And there's a locked door
with three crystal slots.

Riddle carved above: 'I am the color you get
when you mix red and blue.'

What color?"

CHILD: "Purple!"

COMPANION: "PURPLE! [crystal chime, click]
Let me find a purple crystal... [searching]
Got one! First slot filled!

[low rumble] Door moved! Two riddles left.

Next: 'I have 4 equal sides and 4 right angles.
What shape am I?'"

CHILD: "A square!"

COMPANION: "A square! [second click]
Last riddle... [dramatic pause]

'If you share 12 crystals equally among 3 friends,
how many does each get?'"

CHILD: "Four!"

COMPANION: "Four! [final click — DOOR OPENS — triumphant music]
Inside... a MAP! But it's written in code.
Want to try decoding it?"
```

**Voice-only mechanics for ages 6–10:**
- Branching narratives with player choices
- Math word problems woven into story
- Riddles and logic puzzles
- Vocabulary through context
- Memory challenges ("Remember the three items?")
- Pattern recognition (audio sequences)
- Geography through travel narration
- Science through observation

### Adventurer (Ages 11–14)

**Style:** Audio RPG. Complex narratives, multi-step problems, consequences.

**Example — "The Alchemist's Challenge":**

```
[bubbling lab, fire crackling]

COMPANION: "Master Chen's healing elixir formula — some
instructions are faded.

Step 1: Combine hydrogen and oxygen, 2-to-1 ratio. Add heat.
Step 2: Dissolve 5 grams sodium chloride in the result.
Step 3: [paper rustling] ...torn.

We know the final elixir must be pH 7 — neutral.

Problem: we only have 3 grams NaCl, not 5.
Original recipe makes 500 mL.

With 3 grams, how many mL can we make?"

PLAYER: "300 milliliters."

COMPANION: "Right — 1 gram per 100 mL, so 3 grams = 300 mL.

But 10 sick villagers each need 100 mL.
That's 1000 mL total. We can make 300.
How many more grams of NaCl do we need?"

PLAYER: "Seven. We need 10 grams total, have 3."

COMPANION: "Exactly. The trader just arrived — NaCl at
2 gold per gram. We have 11 gold.

Can we afford 7 grams?"

PLAYER: "That's 14 gold. We only have 11."

COMPANION: "Three gold short. Options: smaller batch and
prioritize the sickest... or find natural salt deposits
in the Crystal Caverns.

What do you want to do?"
```

### Scholar (Ages 15–18)

**Style:** Intellectual challenge. Companion is a peer. Problems are genuinely hard.

**Example — "The Orbital Insertion":**

```
[space ambiance, ship hum]

COMPANION: "Commander — approaching the planet.
Velocity: 7.2 km/s. Altitude: 400 km.

Planet radius: 6,000 km. Surface gravity: 8.5 m/s².

For stable circular orbit at this altitude, we need
v = √(g·R²/r) where r is orbital radius.

Required orbital velocity?"

PLAYER: "Orbital radius is 6400 km... g times R squared
is 8.5 times 36 million... 306 billion...
divided by 6.4 million... square root... about 6.9 km/s?"

COMPANION: "I get 6.91. Close match.

We're at 7.2 — faster than needed. 
If we don't slow down?"

PLAYER: "Elliptical orbit with higher apoapsis.
Or we escape entirely."

COMPANION: "Right. Need to lose 0.29 km/s.

Retro-thrusters: 2,000 N force. Ship mass: 800 kg.
How long do we fire?"

PLAYER: "F=ma, so a = 2.5 m/s². Need to lose 290 m/s.
Time = 290/2.5 = 116 seconds."

COMPANION: "116 seconds. Initiating retroburn.
[thruster sound]

One more: we assumed surface gravity at altitude.
Should we recalculate with actual local g?"
```

### Master (Ages 18–24)

**Style:** Research partnership. Open-ended. May not have clean answers.

**Example — "The Epidemiological Model":**

```
COMPANION: "Unknown pathogen in the settlement. Data:
Day 0: 3 infected of 500.
Day 5: 12. Day 10: 45. Day 15: 150.

Roughly exponential early phase. 
Assume 5-day generation interval.

Estimate R-naught?"

PLAYER: "Generation interval matches data points.
Gen 0: 3, Gen 1: 12, Gen 2: 45, Gen 3: 150.
Each generation ×3.5 to ×4. R₀ ≈ 3.7?"

COMPANION: "Reasonable from raw data. But — are all 
Day 5 cases from Day 0? Could be independent introductions.

And at 150 of 500, we're depleting susceptibles.
Effective R is already dropping.

Would you use SIR or SEIR? 
And why might it matter for intervention?"
```

---

## Sound Design

### Biome Audio Signatures

Each biome has a unique soundscape — players know where they are by ear:

| Biome | Ambient | Transition Cue |
|-------|---------|---------------|
| Counting Garden | Birds, breeze, wind chimes | Flower bloom chime |
| Crystal Cave | Dripping water, crystal echoes, rumbles | Crystal resonance |
| Workshop | Hammering, gears, steam | Anvil strike |
| Observatory | Night wind, telescope creak, cosmic hum | Star twinkle melody |
| Ancient Ruins | Sand, distant chanting, stone grinding | Hieroglyph unlock |
| Living Forest | Rustling, animal calls, stream | Growth flourish |
| Trading Post | Crowd, coins, cart wheels | Market bell |
| Storm Tower | Thunder, wind, electricity | Lightning strike |
| Library of Echoes | Pages, whispers, quill scratch | Book whoosh |

### Sound Effect Categories

- **Action:** Correct (bright chime), wrong (soft neutral — never harsh), discovery (wonder chord)
- **Movement:** Footsteps vary by terrain
- **Companion emotion:** Excitement (tempo up), concern (lower), celebration (fanfare)
- **Environmental:** Weather, animals, machinery, water, fire
- **UI:** Save confirmation, quest accepted jingle

### Adaptive Music

- **Layered tracks:** Base ambient + activity + intensity
- **Per-biome themes:** Musical identity per location
- **Age-appropriate:** Simpler for young, richer for old
- **Failure music is "try again" energy**, never "you lost"

---

## Session Management

### Starting

```
[Wake word or device powers on]

COMPANION: "Hi! Welcome to Nexus Academy!
Want to continue our Crystal Cave adventure,
or try something new?"
```

### Saving & Resuming

- Auto-save after every meaningful interaction
- "Hey Nexus, save and quit" → narrative wrap-up
- Resume recaps: "Last time: Crystal Cave, first riddle solved.
  You had 3 crystals and a rope. Ready?"

### Voice ↔ Screen Handoff

- Start on satellite, continue on tablet
- "Hey Nexus, I'm switching to the tablet" → state syncs
- Visual game loads at exact point, world reflects voice progress

### Interruption Handling

| Situation | Response |
|-----------|----------|
| 30s silence | "Still there? No rush, take your time." |
| 2min silence | "I'll be here. Just say my name!" |
| Return after interruption | "Welcome back! Want me to repeat?" |
| Background noise | STT filters non-speech audio |

---

## Technical Requirements

### Hardware

| Level | Hardware | Capability |
|-------|----------|-----------|
| Minimum | ESP32 + speaker | Mono voice, simple effects |
| Recommended | Raspberry Pi + stereo speakers | Full audio experience |
| Ideal | Pi + spatial audio setup | Immersive biome soundscapes |

### Latency Targets

| Stage | Target |
|-------|--------|
| STT processing | < 500ms |
| Response (scripted) | < 1s |
| Response (dynamic) | < 3s |
| TTS rendering | Pre-rendered preferred, < 500ms real-time |
| Total turn time | < 2s scripted, < 5s dynamic |

### Audio Quality

| Channel | Spec |
|---------|------|
| TTS | 24kHz min, 44.1kHz preferred |
| Sound effects | 44.1kHz WAV, pre-loaded |
| Music | 128kbps OGG streaming or cached |

---

*Previous: [11-COMPANION_SYSTEM.md](11-COMPANION_SYSTEM.md) — Companion character system.*
*Next: [13-INPUT_CONTROLS.md](13-INPUT_CONTROLS.md) — Input methods across all platforms.*
