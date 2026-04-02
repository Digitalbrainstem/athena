# 13 — Input & Controls

> Nexus Academy supports four input methods — touch, voice, keyboard+mouse, and
> gamepad — all as first-class citizens. No input method is secondary or "also
> supported." Every mechanic in the game works with every input method. This document
> covers the input abstraction layer, per-method details, age-tier considerations,
> and accessibility integration.

---

## Design Principle

**Every interaction must work with every input method.** If a quest requires "tap the
red bridge," it must also work as "say red," "click the red bridge," and "press A on
the highlighted bridge." The game never assumes which device the player has.

---

## Input Abstraction

The game engine uses a unified action system. Raw input from any method is translated
into game actions:

```
Touch/tap         ─┐
Voice command      ─┤─→ InputManager ─→ GameAction ─→ Game Engine
Keyboard/click     ─┤
Gamepad button     ─┘
```

### Game Actions

| Action | Touch | Voice | Keyboard/Mouse | Gamepad |
|--------|-------|-------|---------------|---------|
| Move | Tap destination / joystick | "Go left" / "Walk to the tree" | WASD / click to move | Left stick |
| Interact | Tap object | "Open it" / "Pick up" | E key / click | A button |
| Select (from choices) | Tap choice | Say the choice | Click / number key | D-pad + A |
| Answer (numeric) | On-screen keypad | Speak the number | Type number + Enter | D-pad numbers + A |
| Answer (text) | On-screen keyboard | Speak the answer | Type + Enter | On-screen keyboard |
| Inventory | Tap bag icon | "Open inventory" | I key | Y button |
| Map | Tap map icon | "Show map" | M key | Select/View |
| Pause | Tap pause | "Pause" / "Hey Nexus, wait" | Escape | Start/Menu |
| Companion | Tap companion | "Hey [name]" | C key | LB button |
| Back/Cancel | Swipe back / tap X | "Go back" / "Never mind" | Escape / Backspace | B button |

---

## Touch Input

**Primary for:** Little Learner, mobile, Surface Go (kiosk)

### Touch Targets

| Age Tier | Minimum Target Size | Spacing |
|----------|-------------------|---------|
| Little Learner (2–5) | 80×80dp | 16dp gap |
| Explorer (6–10) | 56×56dp | 12dp gap |
| Adventurer+ (11+) | 44×44dp | 8dp gap |

Standard mobile guidelines require 48dp minimum. Little Learner goes to 80dp because
small children have less motor precision and often use their whole palm.

### Gesture Recognition

| Gesture | Action | Tier |
|---------|--------|------|
| Tap | Select / interact | All |
| Long press | Inspect / info | Explorer+ |
| Drag | Place / move objects | All (forgiving snapping for Little Learner) |
| Pinch zoom | Map zoom | Explorer+ |
| Swipe | Navigation / page turn | Explorer+ |
| Two-finger rotate | Rotate object | Adventurer+ |
| Shake (accelerometer) | Special actions | Little Learner (optional) |

### Touch-Specific Design

- **Forgiving tap zones:** Hit detection extends 20% beyond visual boundaries for Little Learner
- **Snap-to-target:** When dragging, objects snap to valid positions within 30dp
- **No precision dragging for young tiers:** Large targets, generous snapping
- **Visual feedback:** Every touchable object has a highlight/glow on approach
- **Undo:** Last action is always undoable with a visible button

---

## Voice Input

**Primary for:** Satellite speakers (voice-only), Little Learner, accessibility

### Speech Recognition

STT is handled by Whisper (via Atlas satellite hardware or server-side):

| Feature | Details |
|---------|---------|
| Engine | Whisper (OpenAI) via Atlas infrastructure |
| Latency | < 500ms for short utterances |
| Languages | English primary, multilingual future |
| Wake word | "Hey Nexus" or companion name |
| Continuous | Active during gameplay, not just after prompts |

### Fuzzy Matching

Critical for young children whose speech is developing:

| Utterance | Matched To | Confidence |
|-----------|-----------|------------|
| "twee" | "three" | 0.85 (phonetic similarity) |
| "weh" | "red" | 0.78 |
| "puh-ple" | "purple" | 0.92 |
| "sqware" | "square" | 0.90 |
| "fibe" | "five" | 0.88 |

The system uses:
1. **Phonetic matching** — Soundex/Metaphone for consonant patterns
2. **Context-aware** — If asking "what color?" only color words are candidates
3. **Confirmation** — Low-confidence matches get confirmed: "Did you say three?"
4. **Learning** — Player's speech patterns are profiled over time for better matching

### Voice Commands

Natural language processing maps speech to game actions:

| Spoken | Action |
|--------|--------|
| "Go left" / "Turn left" / "Left" | Move/turn left |
| "Pick it up" / "Grab that" / "Take it" | Interact with nearest object |
| "Open my bag" / "Inventory" / "What do I have?" | Open inventory |
| "Where am I?" / "Show map" | Show map / companion describes location |
| "Help" / "I'm stuck" / "Give me a hint" | Companion offers hint |
| "Say that again" / "Repeat" / "What?" | Replay last companion dialogue |
| "Save" / "Save and quit" / "I need to go" | Save and exit gracefully |
| Any number | Numeric answer to current challenge |
| Any word/phrase | Text answer to current challenge |

### Voice Response Timing

| Scenario | Wait Time Before Re-Prompt |
|----------|--------------------------|
| Little Learner | 5 seconds ("Can you say it?") |
| Explorer | 8 seconds ("Take your time!") |
| Adventurer+ | 15 seconds ("Still thinking? No rush.") |
| Complex problem | 30+ seconds (companion waits silently) |

The companion NEVER says "I didn't hear you" in a way that implies the child failed.
Instead: "Hmm, it's noisy! Can you say that one more time?"

---

## Keyboard & Mouse

**Primary for:** Explorer+ on desktop/laptop, classroom mode

### Default Key Bindings

| Action | Key | Notes |
|--------|-----|-------|
| Move | WASD | Arrow keys as alternative |
| Interact | E | Or left-click on object |
| Inventory | I | |
| Map | M | |
| Quest log | J (journal) | Adventurer+ |
| Crafting | K | Adventurer+ |
| Companion | C | Calls companion |
| Pause | Escape | |
| Quick save | F5 | |
| Number input | 0-9 + Enter | During challenges |
| Chat/text input | T or Enter | Opens text field |

### Mouse

| Action | Mouse Input |
|--------|------------|
| Select/interact | Left click |
| Inspect | Right click |
| Camera rotate | Middle button drag / right drag |
| Zoom | Scroll wheel |
| Drag items | Click and drag |

### Key Remapping

All bindings are fully remappable through settings. Presets for:
- Standard (WASD)
- Left-handed (IJKL)
- Accessibility (minimal keys required)
- Custom

---

## Gamepad

**Primary for:** Comfort play, living room, any tier

### Supported Controllers

| Controller | Support Level |
|-----------|--------------|
| Xbox (USB/BT) | Full — Gamepad API standard |
| PlayStation (USB/BT) | Full — Gamepad API with mapping |
| Nintendo Switch Pro | Full — Gamepad API with mapping |
| Generic USB/BT | Best effort — Gamepad API |

### Button Mapping (Xbox Layout)

| Button | Action |
|--------|--------|
| A | Interact / Confirm |
| B | Back / Cancel |
| X | Inspect / Info |
| Y | Inventory |
| LB | Companion |
| RB | Map |
| Left stick | Move |
| Right stick | Camera (Explorer+) |
| D-pad | Navigate menus / select from choices |
| Start/Menu | Pause |
| Select/View | Quest log |
| Left trigger | Sprint (Explorer+) |
| Right trigger | Use tool (Explorer+) |

### Gamepad-Specific Design

- **Cursor highlighting:** D-pad cycles through interactive objects with visual highlight
- **Radial menus:** For crafting, inventory, and option selection (accessible via stick)
- **Haptic feedback:** Vibration for confirmations, impacts, discoveries, and companion emotion
- **No text input required:** Voice or on-screen keyboard for text answers
- **Quick-select:** Hold LB + face buttons for quick tool access

### Number Input on Gamepad

For numeric answers (math challenges), a number wheel appears:
- D-pad up/down cycles digits (0-9)
- D-pad left/right moves to next/previous digit position
- A confirms the number
- Visual display shows the number being built

---

## Input Switching

Players can switch input methods MID-SESSION. The game detects the active input
device and adapts the UI:

| Detected Input | UI Changes |
|---------------|-----------|
| Touch | Show touch targets, hide cursor, enlarge buttons |
| Keyboard/mouse | Show cursor, show key hints, standard UI |
| Gamepad | Show button prompts, highlight navigation, radial menus |
| Voice only | Companion narrates all options, no visual UI needed |

Switching is instant and automatic. Pick up a controller → controller prompts appear.
Touch the screen → touch mode. No settings required.

---

## Per-Tier Input Recommendations

| Tier | Primary | Secondary | Notes |
|------|---------|-----------|-------|
| Little Learner (2–5) | Touch + Voice | Gamepad (simplified) | Max 4 buttons used on gamepad |
| Explorer (6–10) | Touch or K+M | Voice, Gamepad | Full gamepad support begins |
| Adventurer (11–14) | K+M or Gamepad | Touch, Voice | Complex crafting benefits from K+M |
| Scholar (15–18) | K+M | Gamepad, Voice | Equation entry, graphing need keyboard |
| Master (18–24) | K+M | Voice (dictation) | Research tools optimized for keyboard |

These are recommendations, not requirements. A Scholar can play entirely by voice on
a satellite speaker. A Little Learner can use a gamepad. Every combination works.

---

## Accessibility Integration

Input controls integrate directly with the accessibility system
(see [19-ACCESSIBILITY.md](19-ACCESSIBILITY.md)):

| Accessibility Need | Input Adaptation |
|-------------------|-----------------|
| Motor impairment | One-switch mode: single button cycles and selects |
| Visual impairment | Voice input + audio output only (voice mode) |
| Hearing impairment | Touch/keyboard/gamepad with visual captions |
| Cognitive | Simplified input mapping, fewer simultaneous options |
| Temporary injury | Switch input method mid-session without loss |

---

## Research Required

Before building against this document, complete the following research:

- [ ] **Gamepad API browser support** — Test Gamepad API across Chrome, Firefox, Safari, and Edge. Document controller compatibility (Xbox, PS5, Switch Pro, 8BitDo). Identify browser-specific quirks and workarounds.
- [ ] **Touch gesture libraries** — Evaluate Hammer.js, interact.js, and native pointer events for gesture recognition in Three.js. Benchmark performance on Surface Go and low-end tablets.
- [ ] **Voice-to-action mapping** — Research NLU (natural language understanding) approaches for game commands. Evaluate whether a simple intent classifier (keyword matching + synonyms) is sufficient or if a small language model is needed. Benchmark latency.
- [ ] **Adaptive controller support** — Study Xbox Adaptive Controller hardware and software integration. Review accessibility APIs for web (Gamepad API extensions). Test with switch-access and eye-tracking systems.
- [ ] **Input latency budgets** — Research acceptable input latency for children's games by input method. Touch: target < 50ms. Voice: target < 500ms for STT + < 200ms for action. Gamepad: target < 16ms. Measure actual latency in Three.js prototype.

---

*Previous: [12-VOICE_GAMEPLAY.md](12-VOICE_GAMEPLAY.md) — Voice-only mode.*
*Next: [14-MULTIPLAYER.md](14-MULTIPLAYER.md) — Same-network multiplayer and classroom mode.*
