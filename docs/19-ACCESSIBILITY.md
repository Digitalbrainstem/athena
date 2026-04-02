# 19 — Accessibility

> Nexus Academy is for EVERY learner — including those with visual, motor, cognitive,
> and auditory differences. Accessibility is not an afterthought or a checkbox; it's
> designed into every system from the start. The voice-only mode (see [12-VOICE_GAMEPLAY.md](12-VOICE_GAMEPLAY.md))
> is itself a full accessibility mode. This document covers the complete accessibility
> design across visual, motor, cognitive, and auditory dimensions.

---

## Design Principle

**No learner is excluded.** The game must be fully playable by:

- A child who cannot see the screen
- A child who cannot use their hands
- A child who processes information slowly
- A child who cannot hear
- A child with any combination of the above

Every feature designed for accessibility ALSO benefits non-disabled players. Subtitles
help in noisy rooms. Voice input helps when hands are busy. Simplified UI helps when
you're tired. Accessibility is universal design.

---

## Visual Accessibility

### Color Blind Modes

Three modes supporting the major types:

| Type | Prevalence | Adaptation |
|------|-----------|-----------|
| **Deuteranopia** | ~6% of males | Red/green palette shifted to blue/yellow |
| **Protanopia** | ~2% of males | Red shifted to distinguishable alternatives |
| **Tritanopia** | ~0.01% | Blue/yellow palette shifted to red/green |

Implementation:
- All color-based information also uses **shape, pattern, or label**
- Color blind modes apply a post-processing filter to the entire render
- UI elements use color + icon (never color alone)
- Biome palettes have color-blind-safe variants

### High Contrast Mode

- Enhanced outlines around all interactive objects (3px bright border)
- Distinct visual patterns IN ADDITION to color (hatching, dots, stripes)
- Background darkened to increase foreground contrast
- Text contrast minimum 7:1 (exceeds WCAG AAA)
- Companion speech bubble has high-contrast background

### Screen Reader Support

Full ARIA labels on all interactive elements:

```html
<button aria-label="Red bridge. Tap to select. 1 of 3 choices.">
  [Red bridge visual]
</button>

<div role="status" aria-live="polite">
  Companion says: "Which bridge should we use?"
</div>
```

- All visual elements have descriptive text alternatives
- Game state announced via screen reader ("You are in the Crystal Caverns. 3 paths ahead.")
- Companion narrates all visual events when screen reader is detected
- Quest progress announced on change

### Font & Text

| Setting | Range | Default |
|---------|-------|---------|
| Font size | 50% – 200% | 100% |
| Font family | System default, OpenDyslexic, high-legibility | System default |
| Line spacing | 1.0 – 2.0 | 1.5 |
| Letter spacing | Normal – Extra wide | Normal |
| Text background | None, semi-transparent, opaque | None |

All text scaling works without breaking layout. UI elements reflow.

### Reduced Motion

When enabled:
- All particle effects disabled
- Animations replaced with instant transitions
- Camera movements smoothed/reduced
- No screen shake
- Companion animations simplified to static poses with expression changes
- Weather effects simplified (no moving rain, just darkened sky + sound)

---

## Motor Accessibility

### One-Switch Mode

The entire game playable with a single input (button, switch, sip-and-puff):

```
Single Input → Scanning System
│
├── Auto-scan highlights interactive elements in sequence
│   (adjustable speed: 0.5s – 5s per element)
│
├── Press to SELECT highlighted element
│
├── Hold to ACCESS secondary menu (back, inventory, companion)
│
└── Double-press for CONFIRM/INTERACT
```

Scanning patterns:
- **Row-column:** First scan selects a row, then scans within the row
- **Linear:** Scans all elements in order (simpler but slower)
- **Group:** Scans groups of elements, then individual within group

### Adjustable Timing

| Feature | Default | Accessible Range |
|---------|---------|-----------------|
| Response timeout | Per age tier | Disabled (infinite) – 60s |
| Challenge time limits | None by default | Always optional, never required |
| Input debounce | 100ms | 100ms – 1000ms |
| Double-tap window | 300ms | 300ms – 2000ms |
| Hold duration | 500ms | 200ms – 3000ms |
| Auto-scroll speed | Medium | Slow – Fast (or disabled) |

### Alternative Input Support

| Input | Details |
|-------|---------|
| Eye tracking | Compatible with eye-tracking input systems via pointer events |
| Head tracking | Compatible with head-tracking systems |
| Sip-and-puff | Works as single-switch input |
| Foot pedals | Maps to keyboard inputs |
| Adaptive controllers | Xbox Adaptive Controller fully supported |

### Large Touch Targets

Already designed into the base game (see [13-INPUT_CONTROLS.md](13-INPUT_CONTROLS.md)):

| Tier | Minimum Size | Accessibility Mode Size |
|------|-------------|------------------------|
| Little Learner | 80×80dp | 100×100dp |
| Explorer | 56×56dp | 80×80dp |
| Adventurer+ | 44×44dp | 64×64dp |

### Sticky Keys / Hold Instead of Press

For players who can't do quick taps or combinations:
- All multi-key actions available as single key (remappable)
- Hold-to-activate replaces tap-to-activate
- No quick-time events or reflex-based challenges
- Building mode: place with one action, confirm with another (no drag required)

---

## Cognitive Accessibility

### Simplified UI Mode

When enabled:
- Maximum 3 interactive elements on screen at once
- Clearer visual hierarchy — primary action is obvious
- Fewer simultaneous sounds
- Quest steps presented ONE at a time (not full quest log)
- Companion speaks more slowly and repeats automatically

### Pacing Control

| Feature | Default | Accessible |
|---------|---------|-----------|
| Companion speech speed | Normal | 50% – 150% |
| Time between events | Per age tier | Extended (2x – 5x) |
| Information density | Per age tier | Reduced |
| Number of choices | 2-4 | 2 (binary only if needed) |
| Quest complexity | Per mastery | Simplified branches |

### Repeat & Review

- "Say that again?" works ANYWHERE, ANYTIME — no limit
- Companion automatically repeats key information after 10 seconds of silence
- Instructions are ALWAYS available in the quest log
- Visual instructions + audio instructions + text instructions (all three)
- "What am I supposed to do?" always gets a clear, simple answer

### Consistent Navigation

- Same controls in every biome, every tier, every mode
- Menu structure never changes — items are always in the same place
- Back button always goes back. Save always saves. Pause always pauses.
- No surprise mechanics — the game never suddenly changes how it works

### Gentle Failure

Already a core design principle (see [01-VISION.md](01-VISION.md)), but reinforced:
- Wrong answers NEVER cause negative consequences
- No "game over" screens
- No lives/hearts/limited attempts
- The companion always offers a path forward
- Failure IS the learning — the bridge falling teaches physics

---

## Auditory Accessibility

### Subtitles & Captions

All spoken content has text display:

| Content | Caption Style |
|---------|-------------|
| Companion speech | Full dialogue with speaker name |
| NPC dialogue | Full text with speaker identification |
| Sound effects | Descriptive label: "[Crystal chime]", "[Thunder]", "[Footsteps on stone]" |
| Music mood | Optional: "[Tense music]", "[Calm ambient]" |
| Off-screen sounds | Directional indicator: "[Water sounds from the left]" |

Caption settings:
- Font size: 50% – 200%
- Background: none, semi-transparent, opaque
- Position: bottom, top, or floating near source
- Speaker colors: customizable per character

### Visual Sound Indicators

When enabled, sounds are represented visually:

| Sound | Visual Indicator |
|-------|-----------------|
| Companion speaking | Speech bubble with text |
| Directional sound | Arrow/icon showing direction |
| Ambient change | Subtle screen-edge glow matching biome |
| Alert/discovery | Radial pulse from source |
| Correct/wrong | Visual effect only (already exists) |

### Haptic Feedback

On supported devices (gamepad, mobile with haptic):

| Event | Haptic Pattern |
|-------|---------------|
| Correct answer | Short, clean pulse |
| Wrong answer | None (no punishment) |
| Discovery | Rising pattern |
| Companion speaks | Gentle ongoing rhythm |
| Impact/explosion | Strong pulse |
| Heartbeat (suspense) | Rhythmic double-pulse |

---

## Combined Accessibility Profiles

Preset profiles for common combinations:

| Profile | Features Enabled |
|---------|-----------------|
| **Visual** | Screen reader, audio descriptions, high contrast |
| **Motor** | One-switch mode, extended timing, large targets |
| **Cognitive** | Simplified UI, slow pacing, auto-repeat, binary choices |
| **Auditory** | Full captions, visual sound indicators, haptics |
| **Low vision** | Large text, high contrast, audio descriptions, magnification |
| **Full accessibility** | All features enabled, fully voice-driven |

Profiles are starting points — every individual setting is independently configurable.

---

## Voice Mode as Accessibility

The voice-only mode (see [12-VOICE_GAMEPLAY.md](12-VOICE_GAMEPLAY.md)) is itself a
powerful accessibility tool:

- **Blind/low-vision players:** Full game experience through audio
- **Motor-impaired players:** Voice commands require no physical input
- **Reading-difficulty players:** All content is spoken, never requires reading
- **Multi-sensory learners:** Audio-first learning supports different learning styles

This means Nexus Academy has a COMPLETE accessibility mode built into its core design,
not bolted on as an afterthought.

---

## Testing Requirements

Accessibility features must be tested with:

- Screen readers (NVDA, VoiceOver, TalkBack)
- Switch access (iOS Switch Control, Android Switch Access)
- Color blindness simulation (all three types)
- Keyboard-only navigation (no mouse/touch)
- Voice-only interaction (satellite mode)
- Reduced motion (no animations)
- Slow network (offline mode)
- Low-end hardware (2D fallback mode)

Every quest must pass accessibility testing before shipping.

---

## Research Required

Before building against this document, complete the following research:

- [ ] **WCAG game guidelines** — Review WCAG 2.2 AA/AAA requirements and their applicability to games. Study the W3C Game Accessibility Guidelines draft. Identify which success criteria apply to our game and which are irrelevant (e.g., form labels).
- [ ] **Xbox Accessibility Guidelines (XAG)** — Read the full Xbox Accessibility Guidelines. These are the industry gold standard for game accessibility. Map each guideline to our implementation plan. Identify gaps.
- [ ] **AbleGamers foundation** — Review AbleGamers' Includification guide and Player Panels methodology. Consider engaging AbleGamers for accessibility consulting during Phase 1 prototyping.
- [ ] **One-switch gaming** — Study SpecialEffect's one-switch gaming setups. Test scanning interfaces with actual switch hardware. Benchmark scan speed and selection accuracy for different age groups.
- [ ] **Screen reader + Three.js** — Research how screen readers interact with WebGL canvas elements. Study A-Frame's accessibility work. Test NVDA, VoiceOver, and TalkBack with a Three.js scene. Identify what can be made accessible and what requires audio-description fallback.
- [ ] **Cognitive accessibility in games** — Review research on game design for players with intellectual disabilities, learning disabilities, and autism spectrum. Study the Game Accessibility Conference (GAConf) proceedings. Identify evidence-based design patterns for simplified UI modes.
- [ ] **Dyslexia-friendly design** — Research OpenDyslexic font effectiveness (studies are mixed). Evaluate alternative approaches: increased letter spacing, specific font choices (Comic Sans performs well in studies), background color options. Test with dyslexic users.

---

*Previous: [18-TECHNICAL_ARCHITECTURE.md](18-TECHNICAL_ARCHITECTURE.md) — System architecture.*
*Next: [20-SCREEN_TIME_SAFETY.md](20-SCREEN_TIME_SAFETY.md) — Screen time and child protection.*
