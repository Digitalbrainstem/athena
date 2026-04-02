# 14 — Multiplayer

> Multiplayer in Nexus Academy is same-network only — no internet play. This is a
> deliberate child-protection decision. Three modes exist: cooperative quests (2-4
> players), classroom mode (up to 30 students with teacher dashboard), and sibling
> play (household members sharing a world). No voice chat between players. No
> competitive ranking. The companion mediates all interaction.

---

## Design Constraints

These are non-negotiable:

1. **Same network only.** All players must be on the same LAN/WiFi. No internet
   matchmaking, no remote play, no server-based multiplayer. This eliminates nearly
   all online safety concerns.

2. **No voice/text chat between players.** Players cannot communicate directly.
   The companion mediates: "Maya solved the first part! Now we need someone to
   build the bridge." This prevents bullying, inappropriate content, and unwanted
   contact.

3. **No competitive ranking.** No leaderboards, no "Player A is better than Player B,"
   no PvP. Collaboration ONLY. Players can compare their worlds but never their scores.

4. **Parent/teacher approval required.** Multiplayer must be explicitly enabled per
   profile by a parent (household) or teacher (classroom). Default is single-player.

5. **Age-appropriate matching.** A 5-year-old and a 16-year-old don't get the same
   quests. The system adapts to the lowest and highest tiers present.

---

## Mode 1: Cooperative Quests (2–4 Players)

### How It Works

Players on the same network can join a shared quest. Each player contributes their
strengths while the quest scales to the group's combined skill profile.

### Discovery & Join

```
PLAYER A's companion: "There's a big challenge ahead — building 
a dam to save the valley from flooding. This might need more 
than just us. Want to invite help?"

[Player A approves → beacon goes out on LAN]

PLAYER B's companion: "Hey! Alex is working on a dam project 
nearby and could use some help. Want to join?"

[Player B approves → both enter shared quest instance]
```

### Quest Structure

Cooperative quests have **parallel objectives** — tasks that are independent enough
for different players to work simultaneously:

| Quest: "Build a Dam to Save the Valley" |
|---|
| **Objective 1:** Design the dam structure (geometry, engineering) |
| **Objective 2:** Calculate water flow rate and pressure (physics, calculus) |
| **Objective 3:** Source and transport building materials (logistics, chemistry) |
| **Objective 4:** Manage the village during construction (economics, leadership) |

Each player takes objectives matching their strengths. The companion assigns based on
mastery profiles:

```
COMPANION (to Alex): "You're great with math — can you figure out
the water flow calculations?"

COMPANION (to Maya): "You've built amazing structures before.
Can you design the dam?"
```

### Credit & Learning

- ALL players earn full credit for skills practiced in the quest
- Players who observe others solving problems get partial "exposure" credit
- Teaching moments: "Maya, can you show Alex how you calculated the angle?"
- Each player's mastery profile updates independently

### Technical Implementation

- Host player's device runs the shared quest instance
- Other players connect via LAN WebSocket
- Game state synced at 10Hz (lower than visual rendering, sufficient for quest logic)
- If host disconnects, another player can become host (graceful handoff)
- If a player drops, their objectives become available for others

---

## Mode 2: Classroom Mode (Up to 30 Students)

### Overview

A teacher creates a classroom session. Students join from their devices (tablets,
laptops, or satellite speakers). The teacher has a real-time dashboard showing every
student's engagement and progress.

### Teacher Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  CLASSROOM: Ms. Rodriguez — 5th Grade — Period 3            │
│  Active Students: 27/30    Duration: 32 min                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ENGAGEMENT HEAT MAP                                        │
│  🟢🟢🟢🟡🟢🟢    Row 1: Alex, Maya, Jordan, Sam, Lee, Kai │
│  🟢🟢🟡🟢🟡🟢    Row 2: ...                               │
│  🟢🟡🟢🟢🟢🔴    Row 3: ...  (🔴 = Chris may need help)   │
│  🟢🟢🟢🟢🟢🟢    Row 4: ...                               │
│  🟡🟢🟢🟢        Row 5: ...                                │
│                                                             │
│  GREEN = in flow  YELLOW = thinking  RED = struggling       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SKILL FOCUS: Fractions (addition/subtraction)              │
│  Class average mastery: 0.62                                │
│  Top performers: Maya (0.91), Jordan (0.88), Kai (0.85)    │
│  Need support: Chris (0.31), Sam (0.38), Pat (0.42)        │
│                                                             │
│  [Assign Quest]  [Create Groups]  [Pause All]  [Export]    │
└─────────────────────────────────────────────────────────────┘
```

### Teacher Capabilities

| Action | Description |
|--------|-------------|
| **Assign quests** | Push a specific quest to all students or selected groups |
| **Create groups** | Group students by skill level or mixed for peer teaching |
| **Set objectives** | "Today: everyone masters fraction addition" |
| **Monitor real-time** | See which students are engaged, stuck, or idle |
| **Pause/resume** | Pause all student sessions (for class discussion) |
| **Send hints** | Push a hint to a struggling student via their companion |
| **Review progress** | See mastery levels per skill per student |
| **Export reports** | CSV/PDF of session data aligned to curriculum standards |
| **Time limit** | Set class period duration (companions wrap up gracefully) |

### Student Experience

From the student's perspective, classroom mode feels like regular Nexus Academy with
a few differences:

- The teacher-assigned quest appears as a "special mission" from the companion
- The companion might mention classmates: "Other explorers are working on this too!"
- The world is shared but instances are separate (students don't interfere)
- At the end, the teacher may facilitate class discussion about what was learned

### Technical Requirements

- Teacher device runs the classroom server (any laptop/desktop on school LAN)
- Student devices connect via browser (no install required)
- Works on school WiFi WITHOUT internet (entirely LAN-based)
- Teacher dashboard is a web UI served from the classroom server
- Session data stored locally, exportable, no cloud dependency

---

## Mode 3: Sibling Play (Household)

### How It Works

Siblings sharing a household can exist in the same world, each at their own difficulty
level. This is the most seamless multiplayer mode — it happens naturally when multiple
profiles exist on the same server.

### Shared World Features

- Siblings can visit each other's buildings and biomes
- Structures built by one sibling persist for others to see
- The companion acknowledges siblings: "Your brother built this workshop! Impressive."
- Older siblings can help younger ones (the companion suggests it)

### Cross-Tier Interaction

When an older and younger sibling interact in the same area:

```
OLDER (age 12): [Working on a bridge with trig calculations]

YOUNGER's COMPANION (age 7): "Look! Your sister is building 
a bridge! She's using ANGLES to make it strong. You know about 
angles too — remember quarter turns and half turns?"

YOUNGER: "Can I help?"

COMPANION: "How about you count the planks she needs? 
She's designing, you're supplying!"
```

The younger child gets age-appropriate tasks that contribute to the older child's
project. Both learn. The older child practices by needing to explain. The younger
child sees advanced concepts in action (exposure without assessment).

### Teaching Bonus

When an older sibling helps a younger one, BOTH benefit:

- **Younger:** Gets the concept explained at peer level (often more effective than adult explanation)
- **Older:** Teaching reinforces understanding (Feynman technique — see [06-MASTERY_SYSTEM.md](06-MASTERY_SYSTEM.md))
- **Both:** Companion celebrates the collaboration

The companion explicitly encourages this:

```
COMPANION (to older): "Emma is stuck on division. You're great at 
it. Want to help her with a quick example? Teaching is actually 
the best way to make sure YOU really understand it too."
```

---

## Child Protection

### What's Prevented

| Threat | Prevention |
|--------|-----------|
| Contact with strangers | Same-network only. No internet multiplayer. |
| Cyberbullying | No direct communication. Companion mediates all. |
| Inappropriate content | No user-generated text/voice between players. |
| Data exposure | No PII shared between players. Profile IDs only. |
| Predatory behavior | No 1:1 private sessions. Always in shared context. |
| Competitive anxiety | No rankings, no scores visible to other players. |

### What's Allowed

| Interaction | How |
|-------------|-----|
| See each other's builds | Walk through shared world areas |
| Collaborate on quests | Cooperative quest system (companion-mediated) |
| Help each other | Companion facilitates teaching moments |
| Share discoveries | "Alex found a new biome!" (companion announcement) |
| Compete (friendly) | Optional timed challenges in the Arena biome (opt-in, no records) |

### Parent Controls for Multiplayer

Parents can configure per profile:

| Setting | Options |
|---------|---------|
| Multiplayer enabled | Yes / No (default: No) |
| Cooperative quests | Allowed / Not allowed |
| Sibling interaction | Allowed / Not allowed |
| Classroom mode | Allowed / Not allowed |
| Teaching (by this child) | Allowed / Not allowed |
| Teaching (of this child) | Allowed / Not allowed |

---

## Network Architecture

```
Household Network (LAN only)
├── Game Server (Surface Go or dedicated device)
│   ├── Profile manager
│   ├── Quest coordinator
│   ├── World state (shared areas)
│   └── Multiplayer session manager
│
├── Player A (Surface Go — browser)
├── Player B (tablet — browser)
├── Player C (satellite speaker — voice only)
└── Teacher device (classroom mode only)

NO traffic leaves the local network during multiplayer.
Atlas sync happens separately, outside of multiplayer sessions.
```

---

*Previous: [13-INPUT_CONTROLS.md](13-INPUT_CONTROLS.md) — Input methods.*
*Next: [15-PROFILES_PROGRESSION.md](15-PROFILES_PROGRESSION.md) — Player profiles and calibration.*
