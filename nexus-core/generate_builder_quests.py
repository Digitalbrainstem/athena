#!/usr/bin/env python3
"""Generate Builder tier (ages 11-14) quest files for Nexus Academy.

Produces 27 biome files with ~37 quests each = ~1000 total quests.
Builder companion tone: Trusted Ally — respectful, debates ideas as equals.
"""

import os
import textwrap

OUTDIR = os.path.join(os.path.dirname(__file__), 'src', 'data', 'quests', 'builder')

# Screen reader prefixes per objective type
SR = {
    'interact': 'Interact task', 'collect': 'Collect task', 'build': 'Build task',
    'craft': 'Craft task', 'navigate': 'Navigate task', 'observe': 'Observe task',
    'teach': 'Teach task', 'count': 'Count task', 'match': 'Match task',
    'sort': 'Sort task', 'find': 'Find task', 'mix': 'Mix task',
    'measure': 'Measure task', 'pattern': 'Pattern task', 'place': 'Place task',
    'solve': 'Solve task', 'design': 'Design task', 'experiment': 'Experiment task',
    'balance': 'Balance task', 'decode': 'Decode task', 'diagnose': 'Diagnose task',
    'repair': 'Repair task', 'optimize': 'Optimize task', 'predict': 'Predict task',
    'code': 'Code task', 'explore': 'Explore task', 'sequence': 'Sequence task',
    'compare': 'Compare task', 'transform': 'Transform task', 'protect': 'Protect task',
}

# Builder companion intros (trusted ally tone)
INTROS = [
    "I've been thinking about this. {d} Let's work through it together.",
    "This caught my attention. {d} I think we can figure this out.",
    "Here's something that needs solving. {d} Want to tackle it with me?",
    "I noticed a problem here. {d} Let's investigate together.",
    "I've been looking at this. {d} I have some ideas, but let's see what you think.",
    "There's a real challenge here. {d} Let's approach it step by step.",
    "This is worth figuring out. {d} I'm curious what we'll find.",
    "Something's not working right here. {d} Let's dig into it.",
]

OUTROS = [
    "Solid work. The approach we used here is how professionals solve real problems.",
    "Nice job. Understanding these concepts opens up a lot of real-world possibilities.",
    "That was well done. This kind of problem-solving builds genuine expertise.",
    "Good thinking. What we figured out here connects to many real-world applications.",
    "Impressive work. These skills are used by engineers and scientists every day.",
    "That's the kind of careful analysis that makes a real difference in practice.",
    "Well handled. Each problem like this deepens our understanding of how things work.",
    "Strong work. These are the foundations that real engineering and science build on.",
]

STORY_INTRO = "I found something unusual here. {d} This could be connected to the ancient machines. Let's investigate carefully."
STORY_OUTRO = "Fascinating. Whatever built these machines understood principles we're only starting to rediscover. This fragment might be part of something larger."


def esc(s):
    """Escape single quotes for TypeScript strings."""
    return s.replace("\\", "\\\\").replace("'", "\\'")


def step_ts(s, indent=8):
    """Convert step tuple to TypeScript object string."""
    sp = ' ' * indent
    obj_type, instr, hint, success, failure = s[0], s[1], s[2], s[3], s[4]
    idx = s[5]  # index added by caller
    sr_text = f'{SR[obj_type]}. {instr}'
    hints = hint if isinstance(hint, list) else [hint]
    hint_lines = ',\n'.join(f"{sp}    '{esc(h)}'" for h in hints)
    return f"""{sp}{{
{sp}  index: {idx},
{sp}  instruction: '{esc(instr)}',
{sp}  spokenInstruction: '{esc(instr)}',
{sp}  screenReaderText: '{esc(sr_text)}',
{sp}  companionRepeat: '{esc(instr)}',
{sp}  objectiveType: '{obj_type}',
{sp}  hints: [
{hint_lines},
{sp}  ],
{sp}  successResponse: '{esc(success)}',
{sp}  failureResponse: '{esc(failure)}',
{sp}}}"""


def quest_ts(biome, q, qi):
    """Convert quest tuple to TypeScript object string."""
    slug, title, skills, minutes, desc, steps = q[0], q[1], q[2], q[3], q[4], q[5]
    story = len(q) > 6 and q[6]
    qid = f'b-{biome}-{slug}'
    skills_str = ', '.join(f"'{s}'" for s in skills)

    intro_t = STORY_INTRO if story else INTROS[qi % len(INTROS)]
    outro = STORY_OUTRO if story else OUTROS[qi % len(OUTROS)]
    intro = intro_t.format(d=desc)

    indexed_steps = [(*s, i) for i, s in enumerate(steps)]
    steps_str = ',\n'.join(step_ts(s) for s in indexed_steps)

    return f"""  {{
    id: '{esc(qid)}',
    title: '{esc(title)}',
    biome: '{biome}',
    masteryTier: 'builder',
    skillsRequired: [],
    skillsTaught: [{skills_str}],
    content: {{
      description: '{esc(desc)}',
      companionIntro: '{esc(intro)}',
      steps: [
{steps_str},
      ],
      companionOutro: '{esc(outro)}',
      estimatedMinutes: {minutes},
    }},
  }}"""


def write_biome_file(biome_slug, var_name, quests):
    """Write a single biome TypeScript file."""
    quest_strs = ',\n\n'.join(quest_ts(biome_slug, q, i) for i, q in enumerate(quests))
    content = f"""// Builder tier quests - {biome_slug} biome
// Ages 11-14, companion as trusted ally
// Auto-generated with unique educational content

import type {{ CreateQuestInput }} from '../../../types/quest.js';

export const {var_name}: CreateQuestInput[] = [

{quest_strs},
];
"""
    filepath = os.path.join(OUTDIR, f'builder-{biome_slug}.ts')
    os.makedirs(OUTDIR, exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)
    print(f'  Wrote {filepath} ({len(quests)} quests)')


# ============================================================================
# BIOME QUEST DATA
# Each quest: (slug, title, [skills], minutes, description, [(type, instr, hint, success, failure), ...], [story_flag])
# ============================================================================

