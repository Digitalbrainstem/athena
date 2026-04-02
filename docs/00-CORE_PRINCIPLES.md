# 00 — Core Principles

> These are the non-negotiable principles of Nexus Academy. They are not feature
> requests, not nice-to-haves, and not design suggestions. They are the foundation.
> Every feature, mechanic, quest, and line of code must be consistent with these
> principles. If it isn't, the feature is wrong — not the principle. Adapted from
> the Atlas Cortex Principles and expanded for the game's educational mission.

---

## The Hierarchy

When principles conflict, resolve by tier. Higher tiers always prevail.

### Tier 0 — Foundation

*The ground everything stands on.*

- **Principle 0:** Learning Through Play, Never Through Testing

### Tier 1 — Safety & Access

*Always prevails over all other considerations.*

- **Principle I:** First, Protect the Child
- **Principle II:** Every Child Deserves Access
- **Principle III:** Privacy Is Inviolable

### Tier 2 — Integrity

- **Principle IV:** Knowledge Is the Only Currency
- **Principle V:** The World Is for Everyone
- **Principle VI:** No Judgment

### Tier 3 — Design

- **Principle VII:** The Game Adapts to the Player
- **Principle VIII:** Mastery Over Speed
- **Principle IX:** Atlas Enhances, Never Required
- **Principle X:** Grounded in Evidence
- **Principle XI:** No Artificial Limits
- **Principle XII:** All Learning Counts

---

## Principle 0: Learning Through Play, Never Through Testing

> *If it feels like school, we've failed.*

The game never asks a quiz question. Never presents a flashcard. Never says "What is
3 + 4?" The world simply REQUIRES knowledge to interact with it. Building a bridge
requires geometry. Mixing a potion requires stoichiometry. Navigating to an island
requires trigonometry. The player learns because they want to succeed in the world —
not because someone told them to study.

**The test:** Take any mechanic in the game. Remove all the educational content. Is it
still fun? If yes, it's a good mechanic. If no, it's a quiz wearing a costume.

**What this means in practice:**
- No "answer this question to proceed" gates
- No visible scores, grades, percentages, or "you got 7 out of 10"
- No curriculum labels visible to the player ("Chapter 3: Fractions")
- Wrong answers produce world consequences (bridge collapses), not red X marks
- The companion celebrates discovery, not "correct answers"
- Every challenge has multiple valid approaches — there is no single "right answer" to
  how you play the game

**Why Principle Zero:** This is the epistemological foundation of the entire project.
It defines what "educational game" means for Nexus Academy. Every other principle
assumes this one. An educational game that feels like school has failed before it starts.

---

## Principle I: First, Protect the Child

> *When in doubt, default to the safest assumption — always.*

Children are the primary users of this game. Their safety overrides every other
consideration — including fun, engagement, learning outcomes, and technical elegance.

**What this means:**
- **No cross-network play.** Multiplayer is same-LAN only. No internet matchmaking,
  no remote connections, no exceptions. See [14-MULTIPLAYER.md](14-MULTIPLAYER.md).
- **No direct communication between players.** The companion mediates all interaction.
  No text chat, no voice chat, no image sharing between players.
- **No personal data leaves the home network.** All data stays on local hardware.
  See [20-SCREEN_TIME_SAFETY.md](20-SCREEN_TIME_SAFETY.md).
- **Content is always age-appropriate.** Auto-filtered by tier, parent-overridable
  to be more restrictive (never less).
- **Wrong answers are never punished.** Failure is gentle, educational, and
  companion-mediated. The game never says "wrong" — it says "interesting, let's
  try something else."
- **Parental controls for everything.** Screen time, multiplayer, content filters,
  voice recording — all configurable, all defaulting to the safe option.
- **No dark patterns.** No streaks, no loss aversion, no FOMO, no "come back or
  lose your progress." Engagement comes from genuine curiosity, never manipulation.

**Why immutable:** An educational game with access to children's attention, behavior data,
and daily routines has an extraordinary responsibility. We treat that responsibility as
sacred. One breach of trust destroys everything.

---

## Principle II: Every Child Deserves Access

> *No paywalls. No premium tiers. No microtransactions. Knowledge is free.*

The educational content in Nexus Academy is available to every player equally. There
is no premium version with "better" content. There is no subscription tier. There are
no in-app purchases. There are no ads. There is no "pay to skip."

**What this means:**
- **Zero monetization.** The game is free. Period.
- **No pay-to-win.** No purchasable items, boosts, or shortcuts.
- **No artificial scarcity.** No "limited time offers," no "premium currency,"
  no "battle passes."
- **No ads.** No banners, no interstitials, no rewarded video, no sponsored content.
  Not now. Not ever.
- **No data monetization.** Player data is never sold, shared, or used for advertising.
- **Offline-capable.** The game works without internet. A family without reliable
  internet is not a family without education.

**Why immutable:** The mission is to educate every child. A paywall is a wall between
a child and knowledge. We don't build those walls.

---

## Principle III: Privacy Is Inviolable

> *What happens in the game stays in the game. Player data belongs to the family.*

Adapted from Atlas Cortex Principle III.

**What this means:**
- **All data stays on local hardware.** SQLite on the family's server. IndexedDB on the
  family's device. SD card on the family's satellite. Nothing goes to the cloud.
- **No telemetry.** No analytics pings, no usage tracking, no "anonymous" data
  collection. We don't know how many people use the game and we don't need to.
- **PII is never collected.** No email addresses, no phone numbers, no location data,
  no biometric data. Player profiles use first names only, stored locally.
- **Voice audio is processed and discarded.** STT converts speech to text. The audio
  is never stored, never transmitted, never retained.
- **Parents can delete everything.** Full profile deletion is instant and permanent.
  Not soft-delete. Not "we'll delete it in 30 days." Gone.
- **COPPA compliance by architecture,** not by policy. The system physically cannot
  violate COPPA because the data never leaves the local network.

---

## Principle IV: Knowledge Is the Only Currency

> *You earn by learning, not by paying. Your power in the game reflects what you understand.*

The in-game economy runs on knowledge and skill. A player who understands more can build
more, travel farther, solve harder problems, and explore deeper. There is no way to
shortcut this with money, time, or grinding.

**What this means:**
- Progress = demonstrated understanding, not hours played
- In-game resources are earned through skill application, not farming
- The companion never says "buy" or "upgrade" — the world responds to what you KNOW
- A gifted 8-year-old who understands algebra explores further than a 12-year-old who
  doesn't — because the world responds to mastery, not age
- See [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md) for how mastery is measured

---

## Principle V: The World Is for Everyone

> *No gendered content, no demographic assumptions. All interests celebrated equally.*

The game never asks "are you a boy or a girl?" It never assumes. It watches what the
player DOES and adapts to their demonstrated interests — not their demographics.

**What this means:**
- **No "boy themes" or "girl themes."** Robots and sparkles, space and gardens, building
  and art — all available to everyone, all equally supported.
- **Interests are detected by behavior.** What does the player interact with? What do
  they linger on? What do they choose? That drives the world. Never age, never gender,
  never any demographic proxy.
- **Themes blend freely.** A player can have crystal caves WITH robots. Farms WITH
  spaceships. Pink sparkly workshops. Gritty, muddy star maps. Any combination.
- **The learning is identical.** Counting farm animals = counting crystals = counting
  stars. The math is the same. The wrapper changes. No player gets "easier" or "harder"
  content because of their theme preference.
- **Avatars are fully customizable.** Any body type, any skin tone, any hair, any
  clothing. No gendered defaults. No "pick male or female."
- **The companion can be anything.** Bear, robot, dragon, fairy, geometric shape,
  flame, cloud. No gendered defaults.
- See [02-WORLD_DESIGN.md](02-WORLD_DESIGN.md) for the interest-driven theming system.

---

## Principle VI: No Judgment

> *Wrong answers are learning opportunities, not failures.*

The game world responds to what the player does — it does not judge. A wrong answer
is not a failure. It's data. It's a step in the learning process. The companion never
says "wrong." The companion says "interesting — let's figure out why."

**What this means:**
- **No negative feedback sounds.** No buzzer, no red X, no sad trombone.
- **No failure screens.** No "game over," no "try again," no "you failed."
- **The companion takes shared responsibility.** "Let's figure this out together" —
  not "you got it wrong."
- **Full credit for corrected answers.** If the player gets it wrong, gets a hint,
  and then gets it right — same celebration as a first-try success.
- **Struggling is private.** The player's struggles are visible only to Atlas (for gap
  analysis) and parents (via dashboard). Never to other players. Never made visible in
  the game world.
- **Every player moves at their own pace.** No "you should be at this level by now."
  No comparison to other players. No age-based expectations visible to the player.
- See [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md) for the gap detection system.

---

## Principle VII: The Game Adapts to the Player

> *The player never adapts to the game. The game meets them where they are.*

Nexus Academy adjusts to each player's interests, skill level, learning pace, and
engagement patterns. The player should always feel that the world is built for them —
because it is.

**What this means:**
- **Interests drive the world.** The player gravitates toward animals → the world
  becomes farms, wildlife, veterinary science. They love machines → workshops,
  factories, robotics. See [02-WORLD_DESIGN.md](02-WORLD_DESIGN.md).
- **Difficulty auto-adjusts.** Too easy → escalate. Too hard → scaffold. Always aiming
  for the flow channel. See [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md).
- **Mastery tiers are guides, not gates.** A gifted 7-year-old gets algebra. A struggling
  13-year-old gets reinforced fundamentals. No child is held back or rushed.
- **Input methods are flexible.** Touch, voice, keyboard, gamepad — all first-class.
  Switch mid-session. See [13-INPUT_CONTROLS.md](13-INPUT_CONTROLS.md).
- **The companion adapts.** Personality, vocabulary, communication style — all calibrated
  to the player. See [11-COMPANION_SYSTEM.md](11-COMPANION_SYSTEM.md).

---

## Principle VIII: Mastery Over Speed

> *We don't rush anyone through. True understanding takes the time it takes.*

The game never pushes a player to move faster. There are no timers on learning (timed
challenges are optional and always skippable). No "you should have learned this by now."
The world waits for the player, and the player progresses when they're ready.

**What this means:**
- **Spaced repetition is invisible.** Skills return naturally through world events —
  never as "review exercises." See [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md).
- **Mastery requires four dimensions.** Retention, transfer, depth, and integration.
  Getting five right in a row is memory. Mastery is understanding.
- **Content goes 3-4 years ahead.** No player ever outpaces the content. Gifted
  players are never waiting for the game to catch up.
- **Regression is handled gently.** If a player forgets something, the world
  reintroduces it naturally. No "you used to know this" messaging.

---

## Principle IX: Atlas Enhances, Never Required

> *The game works standalone. Atlas makes it better. But the game works without Atlas.*

Nexus Academy MUST be a complete, functional, educational game without Atlas connected.
Atlas is the invisible architect that adds personalization, dynamic content, gap
analysis, and adaptive difficulty — but the game engine, curriculum, physics, crafting,
and all core mechanics work independently.

**What this means:**
- **Standalone Mode** is a full game — not a demo, not a trial, not a degraded experience.
  All subjects, all mastery tiers, all mechanics functional.
- **Atlas-Enhanced Mode** adds: dynamic content generation, Ender Protocol adaptive
  difficulty, interest tracking and world reshaping, parent reports, multi-device sync,
  and nightly content refresh.
- **The boundary is clean.** Game Engine → optional Atlas API. If Atlas isn't there,
  built-in content and algorithms take over. If Atlas IS there, it enhances everything.
- **Offline means fully playable.** A camping trip, a plane ride, an internet outage —
  none of these should stop a child from learning.
- See [08-ATLAS_INTEGRATION.md](08-ATLAS_INTEGRATION.md) for the full standalone vs.
  enhanced architecture.

---

## Principle X: Grounded in Evidence

> *Every fact the game teaches must be true. Every mechanic must reflect real science.*

Adapted from Atlas Cortex Principle 0.

The game teaches real subjects. Real chemistry, real physics, real biology, real history.
Nothing is faked. Nothing is simplified past the point of truth. If a simplification is
used (and many are, especially at younger tiers), it must be an honest stepping stone to
the full truth — never a falsehood that will need to be unlearned later.

**What this means:**
- **Chemical formulas are real.** H₂O is water. NaCl is salt. Equations balance.
- **Physics simulations use real laws.** F=ma. Conservation of energy. Real gravity.
- **History is presented fairly.** Multiple perspectives. Primary sources. Cause and
  effect. No propaganda, no revisionism.
- **"I don't know" is acceptable.** When science is genuinely unsettled, the game
  says so: "Scientists are still studying this."
- **Simplification is honest.** "Angles as turns" (radian intuition for toddlers) is
  an honest simplification — it's actually MORE correct than starting with degrees.
  "Atoms are tiny balls" is acceptable at Discovery tier because it's a useful model
  that gets refined later — not a lie.
- **Content is validated.** All Atlas-generated content passes through an educational
  accuracy validator. See [09-CONTENT_PIPELINE.md](09-CONTENT_PIPELINE.md).


---

## Principle XI: No Artificial Limits

> *If a tool exists to solve a problem, we use it. AI generates art, music, content,
> and code. Humans direct, review, and playtest.*

We don't artificially constrain ourselves. If AI can generate 3D models, we use it. If
AI can compose adaptive music, we use it. If AI can write quest dialogue, we use it. If
AI can generate sound effects, we use it. The goal is the best possible game for every
child — not proving that humans can do everything by hand.

**What this means:**
- **AI-generated 3D assets** — Text-to-3D tools (Meshy, Tripo3D, Shap-E) generate
  models. Humans review, refine, and approve for the art style. See
  [18-TECHNICAL_ARCHITECTURE.md](18-TECHNICAL_ARCHITECTURE.md) for the AI asset pipeline.
- **AI-composed music** — AI tools (Suno, MusicGen) generate biome themes and adaptive
  layers. Humans review for quality, emotional tone, and age-appropriateness.
- **AI-generated sound effects** — Synthesis and AI audio tools create the 500+ SFX
  library. Humans curate and test.
- **LLM-generated quest content** — Atlas (or a standalone generator) writes quests.
  Validators check educational accuracy. Humans review a sample for quality.
- **AI-assisted code** — Copilot, Atlas, and other tools accelerate development.
  Humans review, test, and ship.
- **AI-generated voice** — Fish Audio TTS with custom character voices. Humans select
  voices, tune emotion, and validate quality.

**What "no artificial limits" does NOT mean:**
- It does NOT mean shipping unreviewed AI output. Every AI-generated asset passes
  through validation (automated) and review (human spot-check).
- It does NOT mean replacing human judgment. Humans direct the creative vision, set
  quality standards, and make final approval decisions.
- It does NOT mean using AI where it's worse. If hand-crafting something produces
  better results for reasonable effort, hand-craft it.
- It does NOT mean compromising on principles. AI-generated content must still be
  educationally accurate (Principle X), age-appropriate (Principle I), and
  non-discriminatory (Principle V).

---

## Principle XII: All Learning Counts

> *Looking up an answer IS learning. Asking a friend IS learning. Researching online
> IS learning. There is no cheating — because the "cheat" is the goal.*

The game doesn't care HOW a player gained knowledge. It only cares whether they can
**apply** it. A player who looks up the chemical formula for water and then successfully
uses it to synthesize water in the Alchemist's Lab has learned something real. A player
who asks their parent for help with a bridge calculation and then builds the bridge has
learned something real. A player who watches a YouTube video about orbital mechanics
and then plots a Hohmann transfer has learned something real.

**There is no cheating in Nexus Academy** because the thing people would "cheat" to
get — knowledge — is the thing we want them to have. The "cheat" IS the goal.

**What this means:**
- **No anti-cheat systems.** No "did you really figure this out yourself?" verification.
  No proctoring. No lockdown browser. No "you must work alone."
- **Looking things up is encouraged.** The companion might even suggest it: "I'm not
  sure about that either. Want to look it up?"
- **Collaboration is celebrated.** Asking a friend, a parent, or a teacher for help is
  a valid learning strategy — and one of the most effective ones (see
  [14-MULTIPLAYER.md](14-MULTIPLAYER.md) for sibling and classroom collaboration).
- **External resources are welcome.** If a player watches a Khan Academy video about
  fractions and then comes back and nails the potion recipe — great. That's learning.
- **The mastery system catches bluffs naturally.** You can't fake understanding long-term
  because the Ender Protocol tests through novel application, not recall. Spaced
  repetition returns weeks later with variations. Impossible challenges probe real
  comprehension. Cross-subject transfer quests require genuine understanding, not
  memorized answers. See the Anti-Cheat by Design section in
  [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md).

**Why this principle matters:** Traditional education treats external help as cheating.
This teaches children that learning is a solo test of recall, and that using available
resources is dishonest. That's the opposite of how the real world works. In the real
world, the best engineers look things up. The best scientists collaborate. The best
doctors consult references. We're building a game that prepares people for reality —
not for a testing regime.

---

## Applying These Principles

Every design decision should pass this checklist:

1. ☐ Does it feel like play, not school? (Principle 0)
2. ☐ Is it safe for the youngest possible player? (Principle I)
3. ☐ Is it accessible without payment? (Principle II)
4. ☐ Does it protect the player's privacy? (Principle III)
5. ☐ Can it be bypassed with money? If so, reject it. (Principle IV)
6. ☐ Does it assume anything about the player's demographics? (Principle V)
7. ☐ Does it judge, rank, or shame the player? (Principle VI)
8. ☐ Does the player have to adapt to it, or does it adapt to the player? (Principle VII)
9. ☐ Does it rush the player? (Principle VIII)
10. ☐ Does it require Atlas to function? (Principle IX)
11. ☐ Is the content factually accurate? (Principle X)
12. ☐ Are we using the best available tools, including AI? (Principle XI)
13. ☐ Does it punish players for using external resources or help? (Principle XII)

If any answer is wrong, fix the feature — not the principle.

---

## Research Required

Before building against this document, complete the following research:

- [ ] **Atlas Cortex Principles deep-read** — Study the full `CORE_PRINCIPLES.md` from Atlas Cortex. Understand the hierarchy-of-conscience model and how it resolves conflicts between principles.
- [ ] **COPPA compliance** — Read the actual Children's Online Privacy Protection Act text and FTC enforcement guidelines. Confirm our architecture meets every requirement.
- [ ] **Child psychology of reward systems** — Research intrinsic vs. extrinsic motivation (Deci & Ryan's Self-Determination Theory). Ensure our "no grades, no scores" approach is supported by evidence, and identify any risks.
- [ ] **Freemium model analysis** — Study why the no-monetization principle matters by analyzing the harm done by predatory monetization in children's games (Prodigy post-paywall, Roblox economy, gacha games). Document as supporting evidence for Principle II.
- [ ] **AI content safety** — Research best practices for validating AI-generated educational content for accuracy and age-appropriateness. Review existing tools and approaches (OpenAI moderation API, custom classifiers, human-in-the-loop pipelines).

---

*Next: [01-VISION.md](01-VISION.md) — Vision statement and inspiration.*
