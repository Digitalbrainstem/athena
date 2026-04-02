#!/usr/bin/env python3
"""Generate Innovator and Creator tier quest files for Nexus Academy.
Creates 27 files per tier (one per biome) with 30 quests each.
All quests contain real AP/college-level academic content."""

import os, json, re, textwrap

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'data', 'quests')

BIOMES = [
    'workshop','alchemist-lab','crystal-caverns','living-forest',
    'library-echoes','ancient-ruins','time-rift','explorers-map',
    'gallery','newsroom','theater','marketplace',
    'observatory','storm-tower','healers-sanctuary','hospital',
    'farm','laboratory','architects-domain','shipyard',
    'code-forge','digital-world','space-station','debate-hall',
    'trading-post','arena','music-hall',
]

INNOVATOR_INTROS = [
    "Here is an interesting challenge. {d} Let us approach this systematically.",
    "Take a look at this situation. {d} We can work through this together.",
    "This is a fascinating problem. {d} Ready to dig in?",
    "I have been thinking about this. {d} Let us tackle it step by step.",
    "This requires careful analysis. {d} Let us figure this out.",
    "There is real depth to this problem. {d} Let us reason through it.",
]
INNOVATOR_OUTROS = [
    "Strong analytical work. The principles we applied here have broad applications across many fields.",
    "That was a rigorous approach. Understanding these concepts at this depth opens many possibilities.",
    "Excellent problem-solving. This kind of work builds real expertise that transfers everywhere.",
    "Well executed. The methods we used here are fundamental to advanced work in this area.",
    "That solution demonstrates real mastery. This depth of understanding is how breakthroughs happen.",
    "Impressive reasoning. Connecting theory to application like this is what real expertise looks like.",
]
CREATOR_INTROS = [
    "I have been reviewing the data on this. {d} This could yield significant insights.",
    "There is an open question here worth investigating. {d} Shall we design an approach?",
    "The research literature has conflicting results. {d} Let us develop our own analysis.",
    "This connects to several active research areas. {d} Our work could contribute something new.",
    "I have identified an interesting anomaly. {d} Let us develop a hypothesis and test it.",
    "This is at the frontier of current understanding. {d} Let us push the boundary together.",
]
CREATOR_OUTROS = [
    "Our findings advance the understanding of this area. This is publication-quality work.",
    "The methodology we developed could be adapted for similar research questions.",
    "Excellent collaborative research. This work demonstrates genuine contribution to the field.",
    "Our results are consistent and well-supported. Rigorous work like this moves knowledge forward.",
    "This research bridges theory and application beautifully. A strong contribution to the field.",
    "The depth of analysis here is remarkable. This work opens new avenues for investigation.",
]

def camel(biome):
    return ''.join(w.capitalize() for w in biome.split('-'))

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')

def fmt_step(s, idx):
    obj, inst, hint, ok, fail = s
    # Derive spoken (slightly more conversational)
    spoken = inst
    # Screen reader (formal)
    sr = f"{obj.capitalize()} task. {inst}"
    # Companion repeat (first sentence, shortened)
    repeat = inst.split('.')[0].strip() + '.'
    if len(repeat) > len(inst) + 25:
        repeat = inst[:80].rsplit(' ', 1)[0] + '.'
    hints = hint if isinstance(hint, list) else [hint]
    lines = []
    lines.append(f"        {{")
    lines.append(f"          index: {idx},")
    lines.append(f"          instruction: '{esc(inst)}',")
    lines.append(f"          spokenInstruction: '{esc(spoken)}',")
    lines.append(f"          screenReaderText: '{esc(sr)}',")
    lines.append(f"          companionRepeat: '{esc(repeat)}',")
    lines.append(f"          objectiveType: '{obj}',")
    h = ', '.join(f"'{esc(x)}'" for x in hints)
    lines.append(f"          hints: [{h}],")
    lines.append(f"          successResponse: '{esc(ok)}',")
    lines.append(f"          failureResponse: '{esc(fail)}',")
    lines.append(f"        }},")
    return '\n'.join(lines)

def fmt_quest(q, tier, prefix, biome, qi):
    slug, title, desc, skills, mins, steps = q
    qid = f"{prefix}-{biome}-{slug}"
    intro_t = INNOVATOR_INTROS if tier == 'innovator' else CREATOR_INTROS
    outro_t = INNOVATOR_OUTROS if tier == 'innovator' else CREATOR_OUTROS
    intro = intro_t[qi % len(intro_t)].format(d=desc)
    outro = outro_t[qi % len(outro_t)]
    sk = ', '.join(f"'{s}'" for s in skills)
    steps_ts = '\n'.join(fmt_step(s, i) for i, s in enumerate(steps))
    return f"""  {{
    id: '{qid}',
    title: '{esc(title)}',
    biome: '{biome}',
    masteryTier: '{tier}',
    skillsRequired: [],
    skillsTaught: [{sk}],
    content: {{
      description: '{esc(desc)}',
      companionIntro: '{esc(intro)}',
      steps: [
{steps_ts}
      ],
      companionOutro: '{esc(outro)}',
      estimatedMinutes: {mins},
    }},
  }},"""

def write_biome_file(tier, biome, quests):
    prefix = 'i' if tier == 'innovator' else 'c'
    var = f"{tier}{camel(biome)}Quests"
    body = '\n\n'.join(fmt_quest(q, tier, prefix, biome, i) for i, q in enumerate(quests))
    content = f"""// {tier.capitalize()} tier quests — {biome} biome
// {'AP-level content, ages 15-18, companion as intellectual peer' if tier == 'innovator' else 'College/research-level content, ages 18+, companion as research collaborator'}

import type {{ CreateQuestInput }} from '../../../types/quest.js';

export const {var}: CreateQuestInput[] = [
{body}
];
"""
    d = os.path.join(BASE, tier)
    os.makedirs(d, exist_ok=True)
    fpath = os.path.join(d, f"{tier}-{biome}.ts")
    with open(fpath, 'w') as f:
        f.write(content)
    return var, fpath

# ── Quest data loaded from sections below ──
INNOVATOR = {}
CREATOR = {}

