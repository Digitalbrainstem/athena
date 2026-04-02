# Voice Gameplay — Zero-Screen Mode

> How Nexus Academy works with NO screen at all.
> Designed for Atlas satellite speakers (Hermes) — Pi or ESP32 audio devices.

---

## Overview

Voice gameplay is not a reduced version of the visual game. It's a **parallel experience**
designed from the ground up for audio-only interaction. The companion character becomes
the player's eyes, narrator, and game master — running interactive stories, puzzles,
adventures, and learning games entirely through speech and sound.

The satellite speaker connects to the Nexus Academy server over the local network.
Game state syncs with the player's profile, so progress earned in voice mode carries
over to the visual game and vice versa.

---

## How It Works

### Input
- **Wake word:** "Hey Nexus" or custom name for the companion
- **Voice commands:** Natural speech, processed by Atlas STT (Whisper)
- **Fuzzy matching:** Especially for toddler speech — "twee" matches "three"
- **Confirmation:** "Did you say three? Yes or no?"
- **Timeout grace:** Long pause ≠ wrong answer. Companion waits, then gently prompts.

### Output
- **Companion voice:** Fish Audio TTS (warm, expressive, character-consistent)
- **Sound effects:** Spatial audio for immersion (footsteps, water, fire, animals)
- **Music:** Ambient background per biome, victory fanfares, tension cues
- **Silence:** Used deliberately — thinking time, suspense, emphasis

### Audio Engine
- Spatial audio via Web Audio API (even on mono speakers, stereo when available)
- Sound effect library: 500+ procedural and pre-recorded effects
- Dynamic music: layers added/removed based on gameplay state
- Voice ducking: music/sfx automatically lower when companion speaks

---

## Voice-Only Quest Design Principles

1. **Paint with words.** Every scene described vividly. The companion is a storyteller.
2. **Binary or small-set choices.** "Left or right?" "Red, blue, or green?" Never more than 4 options.
3. **Repeat on request.** "Say that again?" always works. No penalty.
4. **State reminders.** Companion periodically reminds: "You have 3 crystals and a map."
5. **No time pressure by default.** Player thinks as long as they need. Optional timed challenges.
6. **Audio landmarks.** Each biome has a signature sound. Player learns to recognize where they are.
7. **Save anywhere.** "Let's save our adventure here. Say 'Hey Nexus' when you want to continue!"

---

## Age-Tier Voice Experiences

### Little Learner (Ages 2–5)

**Style:** Dora the Explorer meets bedtime story. Companion talks directly to the child,
asks questions, celebrates answers, uses repetition and rhythm.

**Example Session — "The Counting Garden"**

```
COMPANION: [cheerful music starts, birds chirping]
"Hi, Emma! Welcome back to the Counting Garden!
Last time we planted three sunflowers. Do you remember how many?
... Three! That's right! Great job!

[seed dropping sound]
Today, Farmer Fox gave us MORE seeds! Let's count them together.
Ready? One... [plop] ... two... [plop] ... three... [plop] ...
four... [plop] ... five! [plop]

Five seeds! Can you say five?"

CHILD: "Five!"

COMPANION: "FIVE! Amazing! [confetti sound, happy music]
Now let's plant them! Each seed needs a little hole.
I'll dig... [digging sound] ... you count the holes!
One... how many is that?"

CHILD: "One!"

COMPANION: "One hole! Here's another... [digging sound]"
```

**Voice-Only Mechanics for Ages 2–5:**
- Counting games (companion counts, child joins in or answers)
- Animal sounds ("What does a cow say?")
- Color identification through story ("The ball is RED. What color?")
- Yes/no questions ("Is a fish bigger than a whale?")
- Action songs with rhythm (clapping, stomping, described actions)
- Simple choices ("Should we go to the river or the mountain?")
- Shape descriptions ("I'm round like a ball. What shape am I?")
- Phonics ("B says buh. Ball! Bear! What else starts with B?")

---

### Explorer (Ages 6–10)

**Style:** Choose-your-own-adventure with puzzle elements. Companion is an adventure
partner. Narration is vivid and immersive.

**Example Session — "The Crystal Cave Mystery"**

```
COMPANION: [cave ambiance — dripping water, distant echoes]
"Okay, Alex, we made it deeper into the Crystal Cave.
I can see a faint glow ahead... and there's a fork in the tunnel.

To the LEFT, I hear rushing water — maybe an underground river.
To the RIGHT, the crystals on the walls are getting brighter.

Which way should we go?"

CHILD: "Right!"

COMPANION: "Right it is! Let's follow the crystals! [footsteps on stone]

[crystalline chiming sounds]
Whoa! Look at this chamber! The walls are COVERED in crystals —
red ones, blue ones, green ones. And there's a locked door
with three crystal slots.

There's a riddle carved above the door:
'I am the color you get when you mix red and blue.'

Hmm... what color do you get when you mix red and blue?"

CHILD: "Purple!"

COMPANION: "PURPLE! Yes! [crystal chime, slot clicking]
Let me find a purple crystal... [searching sounds]
Got one! It fits perfectly in the first slot!

[low rumble] The door moved a little! Two more riddles to go.

Next riddle: 'I have 4 equal sides and 4 right angles. What shape am I?'

What do you think?"

CHILD: "A square!"

COMPANION: "A square! Of course! [second crystal slots in]
One more riddle... [dramatic pause]

'If you have 12 crystals and share them equally between 3 friends,
how many does each friend get?'"

CHILD: "Four!"

COMPANION: "Four each! [final crystal slots in — big door opening sound]
The door is OPEN! [triumphant music]
And inside... I can see... a MAP! A map to the NEXT chamber!
But it looks like it's written in code. Want to try decoding it?"
```

**Voice-Only Mechanics for Ages 6–10:**
- Choose-your-own-adventure branching narratives
- Math word problems woven into story ("How many total?")
- Riddles and logic puzzles
- Vocabulary building through context ("The cave was luminescent — that means it glowed!")
- Memory challenges ("Remember the three items we collected?")
- Pattern recognition (audio sequences)
- Geography through travel narration ("We're heading north toward the mountains")
- Science through observation ("Why do you think the ice melted?")

---

### Adventurer (Ages 11–14)

**Style:** Full audio RPG. Complex narratives, multi-step problems, consequences for
decisions. Companion is a trusted ally who respects the player's intelligence.

**Example Session — "The Alchemist's Challenge"**

```
COMPANION: [bubbling lab sounds, fire crackling]
"Alright, so Master Chen left us the formula for the healing elixir,
but some of the instructions are faded. Here's what we can read:

Step 1: Combine hydrogen and oxygen in a 2-to-1 ratio. Apply heat.
Step 2: Dissolve 5 grams of sodium chloride in the result from Step 1.
Step 3: Add... [rustling paper] ...the page is torn here.

We know the final elixir needs to be pH neutral — that's pH 7.
The sodium chloride solution is already neutral, so Step 3 probably
doesn't change the pH.

But here's the problem: we only have 3 grams of sodium chloride,
not 5. Master Chen's recipe makes 500 milliliters.

If we only use 3 grams, how many milliliters can we make?"

PLAYER: "300 milliliters?"

COMPANION: "Let me check... 5 grams for 500 mL, so that's 1 gram per
100 mL. With 3 grams... yes! 300 milliliters. Nice proportional
reasoning.

But 300 mL isn't enough for all the sick villagers. There are 10
villagers and each needs 100 mL.

That's 1000 mL total. We can make 300. How many more grams of
sodium chloride do we need?"

PLAYER: "Seven grams? Because we need 10 grams total and have 3."

COMPANION: "Exactly right. 10 grams for 1000 mL, minus the 3 we have,
equals 7 more grams needed.

[door opening sound] Wait — the supply trader just arrived.
She has sodium chloride at 2 gold per gram. We have 11 gold.

Can we afford the 7 grams we need?"

PLAYER: "That's 14 gold. We only have 11. So no."

COMPANION: "Right — we're 3 gold short. Options: we could make a smaller
batch and prioritize the sickest villagers, or... [thoughtful pause]
...we could try to find natural salt deposits in the Crystal Caverns.

What do you want to do?"
```

**Voice-Only Mechanics for Ages 11–14:**
- Multi-step problem solving with real math/science
- Resource management (track inventory verbally, companion summarizes on request)
- Ethical dilemmas with no "right" answer
- Chemistry and physics woven into narrative challenges
- Historical scenarios with decision consequences
- Code-like logic ("If the pressure exceeds 100, the valve opens. Current pressure?")
- Collaborative companion dialogue (companion thinks out loud, player corrects)

---

### Scholar (Ages 15–18)

**Style:** Intellectual challenge. Companion is a peer who debates, questions, and
respects the player as near-equal. Problems are genuinely hard.

**Example Session — "The Orbital Insertion"**

```
COMPANION: [space ambiance, gentle hum of ship systems]
"Commander, we're approaching the planet. Current velocity is
7.2 kilometers per second, altitude 400 kilometers above the surface.

The planet's radius is 6,000 km and surface gravity is 8.5 m/s².

For a stable circular orbit at our altitude, we need orbital velocity
equal to the square root of g-surface times radius-squared divided
by the orbital radius.

Can you calculate our required orbital velocity? I'll wait while
you work through it."

PLAYER: "Okay so... orbital radius is 6400 km, surface gravity 8.5...
so g times R squared is 8.5 times 6000 squared... that's 306 billion...
divided by 6400... square root... about 6.9 km/s?"

COMPANION: "I get 6.91 km/s. Close match.

So we're currently at 7.2 km/s — that's FASTER than orbital velocity.
What happens if we don't slow down?"

PLAYER: "We'll escape the planet's gravity? Or at least go into a
higher orbit?"

COMPANION: "Right — we'd end up in an elliptical orbit with a higher
apoapsis. We need to lose 0.29 km/s.

The retro-thrusters can produce 2,000 newtons of force and our ship
masses 800 kg. How long do we need to fire them?"

PLAYER: "F equals ma... acceleration is 2000 over 800, that's 2.5 m/s².
We need to lose 290 m/s. So time is 290 divided by 2.5... 116 seconds."

COMPANION: "116 seconds. Good. Initiating retroburn in 30 seconds.
[thruster warm-up sound]

One more thing — we're not accounting for the gravity gradient.
At 400 km altitude, local gravity isn't 8.5 anymore. Should we
recalculate with actual local gravity, or is the approximation
close enough for our burn duration?"
```

---

### Master (Ages 18–24)

**Style:** Research partnership. Companion presents open-ended problems, discusses
methodology, challenges assumptions. Problems may not have clean answers.

**Example Session — "The Epidemiological Model"**

```
COMPANION: "The settlement is dealing with an unknown pathogen.
Here's what we know from the healer's records:

Day 0: 3 infected out of 500 people.
Day 5: 12 infected.
Day 10: 45 infected.
Day 15: 150 infected.

This looks roughly exponential in the early phase. Can you estimate
the basic reproduction number, R-naught, from this data?

Think about the generation interval — assume about 5 days between
successive infections based on symptom onset patterns."

PLAYER: "If generation interval is 5 days, then each generation is
roughly one data point apart. Gen 0: 3, Gen 1: 12, Gen 2: 45,
Gen 3: 150. So each generation multiplies by about 3.5 to 4.
R-naught is approximately 3.7?"

COMPANION: "That's a reasonable estimate from the raw data. But
consider — are all those Day 5 cases necessarily second-generation
infections from the Day 0 cases? Some could be independent
introductions.

Also, once we get to 150 out of 500, we're depleting the
susceptible pool. The effective R starts dropping.

If you wanted to model this more precisely, would you use SIR
or SEIR? And why might it matter for our intervention strategy?"
```

---

## Sound Design for Voice Mode

### Biome Signatures

Each biome has a unique ambient soundscape that plays continuously, allowing the
player to know where they are by sound alone:

| Biome | Ambient Sound | Transition Cue |
|-------|--------------|----------------|
| Counting Garden | Birds, gentle breeze, wind chimes | Flower blooming chime |
| Crystal Cave | Dripping water, crystalline echoes, distant rumbles | Crystal resonance tone |
| The Workshop | Hammering, gears turning, steam hissing | Anvil strike |
| Observatory | Night wind, telescope creaking, cosmic hum | Star twinkle melody |
| Ancient Ruins | Sand blowing, distant chanting, stone grinding | Hieroglyph unlock tone |
| Living Forest | Rustling leaves, animal calls, stream flowing | Growth flourish |
| Trading Post | Crowd chatter, coin clinking, cart wheels | Market bell |
| Code Forge | Electronic hums, data streams, mechanical clicks | Connection established beep |
| Storm Tower | Thunder, wind howling, electricity crackling | Lightning strike |
| Library of Echoes | Page turning, whispers, quill scratching | Book opening whoosh |

### Sound Effect Categories

- **Action feedback:** Correct answer (bright chime), wrong answer (soft neutral tone — never harsh), discovery (wonder chord)
- **Movement:** Footsteps vary by terrain (stone, grass, sand, metal, water)
- **Companion emotion:** Excitement (tempo up), concern (lower pitch), celebration (full fanfare), thinking (humming)
- **Environmental:** Weather, animals, machinery, water, fire — all contextual
- **UI sounds:** Menu navigation clicks, save confirmation, quest accepted jingle

### Music System

- **Layered tracks:** Base ambient layer + activity layer + intensity layer
- **Adaptive:** Layers added/removed based on gameplay state
- **Per-biome themes:** Each biome has a musical identity
- **Victory/failure:** Distinct but never punishing. Failure music is "try again" energy, not "you lost" energy.
- **Age-appropriate:** Simpler melodies and rhythms for younger tiers, richer compositions for older

---

## Technical Requirements

### Satellite Hardware
- **Minimum:** ESP32 with speaker (mono, voice + simple effects)
- **Recommended:** Raspberry Pi with stereo speakers (full audio experience)
- **Ideal:** Pi with spatial audio setup (immersive biome soundscapes)

### Network
- Connects to Nexus Academy server on local network
- Pre-caches upcoming content for offline play
- Syncs progress when reconnected

### Latency Targets
- **STT processing:** < 500ms (local Whisper on Pi, or server-side)
- **Response generation:** < 1s for scripted content, < 3s for dynamic
- **TTS rendering:** Pre-rendered for known dialogue, real-time for dynamic
- **Total turn time:** < 2s for scripted, < 5s for complex dynamic responses

### Audio Quality
- **TTS:** 24kHz minimum, 44.1kHz preferred (Fish Audio quality)
- **Sound effects:** 44.1kHz WAV, pre-loaded into memory
- **Music:** 128kbps OGG Vorbis streaming from server or cached locally
- **Spatial audio:** Binaural processing on stereo, psychoacoustic cues on mono

---

## Session Management

### Starting a Session
```
[Device powers on or player says wake word]

COMPANION: "Hi! [name recognition or prompt]
Welcome to Nexus Academy! Ready to continue our adventure
in the Crystal Cave, or do you want to try something new?"
```

### Saving & Resuming
- Auto-save after every meaningful interaction
- "Hey Nexus, save and quit" → graceful narrative wrap-up
- Resume always recaps: "Last time, we were in the Crystal Cave and had just decoded the first riddle. You had 3 crystals and a rope. Ready to keep going?"

### Session Handoff (Voice → Screen)
- Player can start on satellite, continue on tablet
- "Hey Nexus, I'm switching to the tablet" → companion acknowledges, state syncs
- Visual game loads at exact narrative point, world reflects voice-mode progress

### Interruption Handling
- Long silence (30s+): "Still there? No rush, take your time."
- Very long silence (2min+): "I'll be right here when you're ready. Just say my name!"
- External interruption: "Welcome back! Want me to repeat where we were?"
- Background noise tolerance: STT filters non-speech audio
