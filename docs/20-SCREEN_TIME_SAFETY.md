# 20 — Screen Time & Safety

> Screen time is unlimited by default. Nexus Academy is a learning tool, not a
> dopamine trap — and we trust parents to set limits that work for their family.
> The game never punishes, never locks out, and never uses dark patterns. Break
> reminders are gentle and in-character. Child protection is built into every system.
> This document covers screen time philosophy, parental controls, COPPA compliance,
> and safety architecture.

---

## Screen Time Philosophy

### Why Unlimited Default

Most "educational" apps enforce strict screen time limits. We don't, because:

1. **This is a learning tool.** Would you limit time at the library? Time doing
   math puzzles? Time building with LEGO? Nexus Academy is the digital equivalent.

2. **Arbitrary limits are harmful.** "Your 30 minutes are up" mid-quest teaches
   the child that learning has a timer. It creates anxiety and rushed play.

3. **Parents know best.** Every family is different. Some children thrive with
   2 hours of focused play. Others need breaks every 20 minutes. Parents configure
   what works for their child.

4. **The game self-regulates.** Sessions have natural breakpoints. The companion
   suggests breaks in-character. The game is designed to be satisfying in short
   sessions — there's no "one more level" addiction mechanic.

### What We DON'T Do

| Anti-Pattern | Why We Reject It |
|-------------|-----------------|
| **Hard lockout** | "Time's up!" mid-quest → frustration, lost progress, negative association |
| **Countdown timer** | Visible countdown → anxiety, rushed play, not thoughtful learning |
| **Streak pressure** | "Log in daily!" → obligation, not genuine interest |
| **Reward cooldowns** | "Come back in 4 hours!" → artificial time gates |
| **Notification spam** | "Your garden needs you!" → manipulation |
| **Loss on absence** | "Your crops died!" → guilt-based retention |
| **Social pressure** | "Your friends are playing!" → peer pressure manipulation |

---

## Break Reminders

### How They Work

The companion suggests breaks naturally, in character, at narrative breakpoints:

```
After 30 minutes:
COMPANION: "Wow, we've been exploring for a while!
I'm getting thirsty. Want to take a water break?
The cave will still be here when we get back!"

After 45 minutes:
COMPANION: "My wings are tired from all that flying!
Let's rest for a bit. Maybe stretch?"

After 60 minutes:
COMPANION: "You know what would feel great? Standing up
and touching your toes! I'll count to 10."
```

### Break Reminder Design

- **Never interrupts a challenge.** Waits for the current quest step to complete.
- **Never punishes.** If the player ignores the suggestion, the game continues.
- **In-character.** The companion is tired/thirsty/wants to stretch — not the game saying "stop playing."
- **Age-appropriate frequency.** More frequent for Foundation tier (every 15 min), less for older tiers.
- **Physical activity suggestions.** "Let's do 10 jumping jacks!" — the break itself is active.

### Break Reminder Schedule (Defaults)

| Mastery Tier | First Reminder | Subsequent | Style |
|----------|---------------|-----------|-------|
| Foundation (typically 2–5) | 15 min | Every 10 min | Natural narrative breakpoints |
| Discovery (typically 6–10) | 30 min | Every 15 min | Companion suggests activity |
| Builder (typically 11–14) | 45 min | Every 20 min | Gentle suggestion |
| Innovator (typically 15–18) | 60 min | Every 30 min | Brief mention |
| Creator (18+) | 90 min | Every 45 min | Minimal |

---

## Parental Controls

### Configuration Options

Parents access controls through the parent dashboard
(see [15-PROFILES_PROGRESSION.md](15-PROFILES_PROGRESSION.md)):

| Setting | Default | Options | Notes |
|---------|---------|---------|-------|
| **Session limit** | Unlimited | 15 min – 4 hours | Per-session maximum |
| **Daily limit** | Unlimited | 30 min – 8 hours | Total time per calendar day |
| **Allowed hours** | All hours | Configurable start/end | "Only between 8am-8pm" |
| **Break reminders** | Age-default (above) | 10 min – 90 min | How often companion suggests breaks |
| **Break enforcement** | Gentle | Gentle / Firm | Gentle = suggestion. Firm = session pause for 5 min. |
| **Content filter** | Age-appropriate | Standard / Strict | Strict removes all conflict themes |
| **Multiplayer** | Disabled | Disabled / Enabled | See [14-MULTIPLAYER.md](14-MULTIPLAYER.md) |
| **Voice recording** | Enabled | Enabled / Disabled | For STT. Audio never stored permanently. |
| **Progress sharing** | Private | Private / Classroom | Share with teacher if in school |

### Gentle vs. Firm Break Enforcement

**Gentle (default):**
```
COMPANION: "We've been playing for a while! Want to take a break?
...No? Okay, let's keep going! But let me know if you get tired."
[Player continues playing]
```

**Firm:**
```
COMPANION: "We've had an amazing adventure! Let's take a 5-minute 
break. I'll save everything right here.
[stretching music plays, countdown appears]
Stand up and stretch! Try touching your toes! 
I'll be right here when the timer is done."
[Game pauses, simple animation plays, resumes after 5 min]
```

Even "firm" mode is:
- In-character (companion, not a system message)
- Positive (not punitive)
- Brief (5 minutes, not a lockout)
- Active (suggests physical activities during the break)

### Session End (When Limits Apply)

When a session limit is reached, the companion wraps up naturally:

```
COMPANION: "Wow, what a great adventure today! We discovered the
Crystal Bridge and solved three riddles. 

I'm going to save everything right here.
[sparkle save effect]

Next time, we can keep exploring the cavern.
I think there's something amazing deeper inside!
See you soon, Emma! [waves]"

[Screen gently fades. No abrupt cutoff.]
```

The session ALWAYS ends at a narrative breakpoint — never mid-challenge.
The companion teases what's next to create positive anticipation (not FOMO).

---

## Child Protection (COPPA Compliance)

### What We Collect

| Data | Stored? | Purpose | Shared? |
|------|---------|---------|---------|
| Player name | Yes (local only) | Companion uses it | Never |
| Avatar choices | Yes (local only) | Game display | Never |
| Learning events | Yes (local only) | Mastery tracking | Never externally |
| Voice audio | **No** (processed, discarded) | STT only | Never |
| Biometric data | **No** | Not collected | N/A |
| Location data | **No** | Not collected | N/A |
| Email/phone | **No** | Not collected | N/A |
| Social graph | **No** | Not collected | N/A |

### COPPA Compliance Points

1. **No personal information collected from children.** Profile data is local.
2. **No data leaves the local network.** All processing is on-device or LAN.
3. **No advertising.** Zero. None. Ever.
4. **No social features.** No profiles visible to strangers. No chat.
5. **No tracking.** No analytics, no telemetry, no cookies for external services.
6. **Parent consent.** Parent creates child profiles. Parent controls all settings.
7. **Data deletion.** Parents can delete any profile and all associated data instantly.
8. **No cloud dependency.** All data stays on the family's hardware.

### Network Safety

| Threat | Mitigation |
|--------|-----------|
| External network access | Game runs on LAN only. No internet required. |
| Data exfiltration | No external API calls. No telemetry. |
| Unauthorized access | PIN/password auth. Parent controls. |
| Device compromise | Standard OS security. No elevated privileges. |
| Content injection | All content validated by Atlas before serving. |

---

## Safety in Multiplayer

See [14-MULTIPLAYER.md](14-MULTIPLAYER.md) for full details. Key safety points:

- **Same network only.** No internet multiplayer.
- **No direct communication.** Companion mediates all interaction.
- **No user-generated content sharing.** No text/voice/images between players.
- **Parent opt-in.** Multiplayer is disabled by default.
- **Teacher supervision.** Classroom mode requires teacher account.

---

## Content Safety

### Age-Appropriate Content

All content is filtered by mastery tier:

| Topic | Foundation | Discovery | Builder | Innovator | Creator |
|-------|---------------|----------|------------|---------|--------|
| Conflict | None | Minor obstacles | Strategy (no violence) | Complex dilemmas | Full complexity |
| Death | Not mentioned | Natural cycles only | Historical context | Academic context | Full academic |
| Romance | None | None | None | None (optional at 18+) | Optional context |
| Fear/horror | None | Mild surprise only | Tension/suspense | Genuine challenge | Full range |
| Substances | None | None | Chemistry context | Chemistry/biology | Full academic |

### Content Moderation

All Atlas-generated content passes through validation
(see [09-CONTENT_PIPELINE.md](09-CONTENT_PIPELINE.md)):

1. **Auto-filter** for inappropriate language, themes, or concepts
2. **Age-tier check** for content appropriateness
3. **Educational accuracy** validation
4. **Human review** for flagged or uncertain content
5. **Parent override** to restrict content further ("Strict" mode)

---

## Data Handling

### Local-First

All data lives on the family's local hardware:

```
Data Location:
├── Game Server (SQLite on LAN server)
│   ├── All player profiles
│   ├── All learning events
│   ├── All quest content
│   └── All mastery data
│
├── Client Device (IndexedDB)
│   ├── Cached content
│   ├── Local progress
│   └── Sync queue
│
├── Satellite (SD card / flash)
│   ├── Cached voice content
│   └── Session progress
│
└── Atlas (if connected)
    ├── Receives anonymized play data for content generation
    ├── Generates content based on data
    └── Does NOT store PII
```

### Data Deletion

Parents can:
- Delete individual learning events
- Delete an entire profile (all data)
- Export all data for a profile (JSON)
- Clear all device caches
- Factory reset the game server

Deletion is **immediate and permanent**. No "soft delete." No 30-day retention.

### Atlas Data Flow

When Atlas is connected, it receives:
- Profile ID (not name, not real identity)
- Learning events (skill + success/failure + response time)
- Quest completion data
- Engagement metrics (time per biome, interaction frequency)

Atlas does NOT receive:
- Child's name or any PII
- Voice recordings
- Avatar or demographic data
- Device identifiers beyond the session

---

## Emergency Features

### Panic Button (Configurable)

Parents can configure a "panic" action:
- Specific key combination or voice command
- Immediately saves and exits the game
- Can optionally lock the device
- For situations where a child needs to stop immediately

### Content Reporting

If a parent notices inappropriate content:
- Flag in parent dashboard → content removed from child's queue
- Report to Atlas → content reviewed and potentially removed globally
- Override: parent can approve/reject any quest before the child sees it

---

## Summary

| Principle | Implementation |
|-----------|---------------|
| Screen time unlimited by default | Parents configure limits; game self-regulates |
| Breaks are gentle and in-character | Companion suggests, never demands |
| No dark patterns | No streaks, no loss aversion, no FOMO |
| No data leaves the network | Local-first architecture |
| COPPA compliant | No PII, no tracking, no ads, no social |
| Content is age-appropriate | Auto-filtered by tier + parent override |
| Safety in multiplayer | Same-network, no chat, companion-mediated |
| Parent has full control | Dashboard with per-profile settings |

---

## Research Required

Before building against this document, complete the following research:

- [ ] **Screen time research** — Read the AAP (American Academy of Pediatrics) current screen time recommendations and the underlying research. Study the nuance: not all screen time is equal. Review research distinguishing passive consumption from active/educational use.
- [ ] **Child development and technology** — Study "The Anxious Generation" (Jonathan Haidt) and counterpoint research. Understand the current debate on children and screens. Position Nexus Academy clearly as active educational engagement, not passive consumption.
- [ ] **COPPA compliance technical guide** — Work through the FTC's COPPA compliance technical guide step by step. Verify that our local-first architecture satisfies every requirement. Document the compliance case.
- [ ] **GDPR-K and international child privacy** — Research child privacy regulations beyond COPPA: GDPR Article 8 (EU), Age Appropriate Design Code (UK ICO), Australian Privacy Act amendments. Ensure our architecture works globally.
- [ ] **Dark patterns in children's apps** — Study the FTC's enforcement actions against children's apps (Epic Games/Fortnite, TikTok, YouTube Kids). Document specific dark patterns and verify none exist in our design. Use as negative examples in developer onboarding.
- [ ] **Break reminder effectiveness** — Research whether break reminders actually work. Study Nintendo's approach (Wii Sports break reminders), Apple Screen Time effectiveness research, and educational game break implementations. Optimize our companion-mediated break approach based on evidence.

---

*Previous: [19-ACCESSIBILITY.md](19-ACCESSIBILITY.md) — Accessibility design.*

*This is the final document in the specification suite. Return to [README.md](README.md) for the full index.*
