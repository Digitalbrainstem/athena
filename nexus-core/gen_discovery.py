#!/usr/bin/env python3
"""Generate 1,000 Discovery tier quests across 27 biomes for Nexus Academy.
Ages 6-10. Singapore math CPA progression. Real education. No quiz language.
Run: python3 gen_discovery.py
"""
import os, re, textwrap

OUT = os.path.join(os.path.dirname(__file__), "src/data/quests/discovery")
os.makedirs(OUT, exist_ok=True)

def esc(s):
    return s.replace("\\","\\\\").replace("'","\\'").replace("\n","\\n")

SR_LABELS = {
    'interact':'Interaction','collect':'Collection','build':'Building',
    'craft':'Crafting','navigate':'Navigation','observe':'Observation',
    'teach':'Teaching','count':'Counting','match':'Matching',
    'sort':'Sorting','find':'Finding','mix':'Mixing',
    'measure':'Measurement','pattern':'Pattern','place':'Placement',
    'solve':'Solve','design':'Design','experiment':'Experiment',
    'balance':'Balance','decode':'Decode','diagnose':'Diagnose',
    'repair':'Repair','optimize':'Optimize','predict':'Prediction',
    'code':'Coding','explore':'Exploration','sequence':'Sequencing',
    'compare':'Comparison','transform':'Transform','protect':'Protection',
}

def sr(obj, inst):
    return f"{SR_LABELS.get(obj,'Activity')} task. {inst}"

def cr(inst):
    if len(inst)<=90: return inst
    for e in ['. ','! ','— ']:
        i=inst.find(e)
        if 0<i<100: return inst[:i+1].strip()
    t=inst[:85]; sp=t.rfind(' ')
    return (t[:sp] if sp>40 else t)+'.'

def S(obj, inst, hints, succ, fail):
    """Step shorthand."""
    return (obj, inst, hints, succ, fail)

def Q(slug, title, skills, desc, intro, steps, outro, mins=10):
    """Quest shorthand."""
    return (slug, title, skills, desc, intro, steps, outro, mins)

def fmt_step(i, s):
    obj,inst,hints,succ,fail = s
    lines = []
    lines.append("        {")
    lines.append(f"          index: {i},")
    lines.append(f"          instruction: '{esc(inst)}',")
    lines.append(f"          spokenInstruction: '{esc(inst)}',")
    lines.append(f"          screenReaderText: '{esc(sr(obj,inst))}',")
    lines.append(f"          companionRepeat: '{esc(cr(inst))}',")
    lines.append(f"          objectiveType: '{obj}',")
    hs = ", ".join(f"'{esc(h)}'" for h in hints)
    lines.append(f"          hints: [{hs}],")
    lines.append(f"          successResponse: '{esc(succ)}',")
    lines.append(f"          failureResponse: '{esc(fail)}',")
    lines.append("        },")
    return "\n".join(lines)

def fmt_quest(biome, q):
    slug,title,skills,desc,intro,steps,outro,mins = q
    qid = f"d-{biome}-{slug}"
    sk = ", ".join(f"'{s}'" for s in skills)
    st = "\n".join(fmt_step(i,s) for i,s in enumerate(steps))
    return f"""  {{
    id: '{qid}',
    title: '{esc(title)}',
    biome: '{biome}',
    masteryTier: 'discovery',
    skillsRequired: [],
    skillsTaught: [{sk}],
    content: {{
      description: '{esc(desc)}',
      companionIntro: '{esc(intro)}',
      steps: [
{st}
      ],
      companionOutro: '{esc(outro)}',
      estimatedMinutes: {mins},
    }},
  }}"""

def write_biome(slug, export_name, quests, comment):
    body = ",\n\n".join(fmt_quest(slug, q) for q in quests)
    content = f"""// Discovery tier quests — {comment}
// Ages 6-10: Companion is adventure partner, 2-4 steps, 2-3 skills per quest
// Singapore math CPA progression. Real education through gameplay.

import type {{ CreateQuestInput }} from '../../../types/quest.js';

export const {export_name}: CreateQuestInput[] = [
{body},
];
"""
    path = os.path.join(OUT, f"discovery-{slug}.ts")
    with open(path, 'w') as f:
        f.write(content)
    return len(quests)

# ============================================================
# QUEST DATA — 27 biomes × ~37 quests each = ~1,000 total
# ============================================================

