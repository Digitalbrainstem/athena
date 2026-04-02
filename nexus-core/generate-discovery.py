#!/usr/bin/env python3
"""Generate Discovery tier quest files for Nexus Academy.
Produces 27 TypeScript files with ~37 quests each (1,000 total).
Run: python3 generate-discovery.py
"""
import os, sys, re

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "src/data/quests/discovery")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def esc(s):
    """Escape for TS single-quoted strings."""
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")

SCREEN_LABELS = {
    'interact': 'Interaction', 'collect': 'Collection', 'build': 'Building',
    'craft': 'Crafting', 'navigate': 'Navigation', 'observe': 'Observation',
    'teach': 'Teaching', 'count': 'Counting', 'match': 'Matching',
    'sort': 'Sorting', 'find': 'Finding', 'mix': 'Mixing',
    'measure': 'Measurement', 'pattern': 'Pattern', 'place': 'Placement',
}

def screen_reader(obj_type, instr):
    label = SCREEN_LABELS.get(obj_type, 'Activity')
    return f"{label} task. {instr}"

def companion_rpt(instr):
    if len(instr) <= 90:
        return instr
    for end in ['. ', '! ', '— ']:
        idx = instr.find(end)
        if 0 < idx < 100:
            return instr[:idx+1].strip()
    t = instr[:85]
    sp = t.rfind(' ')
    return (t[:sp] if sp > 40 else t) + '!'

def fmt_val(v):
    if isinstance(v, list):
        return "[" + ", ".join(f"'{esc(x)}'" for x in v) + "]"
    if isinstance(v, str):
        return f"'{esc(v)}'"
    return str(v)

def fmt_step(i, s):
    otype, instr = s[0], s[1]
    target = s[2]
    hints = s[3]
    succ, fail = s[4], s[5]
    tid = s[6] if len(s) > 6 else None
    rc = s[7] if len(s) > 7 else None
    sr = screen_reader(otype, instr)
    cr = companion_rpt(instr)
    lines = [
        f"        {{",
        f"          index: {i},",
        f"          instruction: '{esc(instr)}',",
        f"          spokenInstruction: '{esc(instr)}',",
        f"          screenReaderText: '{esc(sr)}',",
        f"          companionRepeat: '{esc(cr)}',",
        f"          objectiveType: '{otype}',",
    ]
    if tid: lines.append(f"          targetId: '{esc(tid)}',")
    lines.append(f"          targetValue: {fmt_val(target)},")
    if rc is not None: lines.append(f"          requiredCount: {rc},")
    hs = ", ".join(f"'{esc(h)}'" for h in hints)
    lines += [
        f"          hints: [{hs}],",
        f"          successResponse: '{esc(succ)}',",
        f"          failureResponse: '{esc(fail)}',",
        f"        }},",
    ]
    return "\n".join(lines)

def fmt_quest(biome, q):
    slug, title, skills, desc, intro, steps, outro, mins = q[:8]
    sreq = q[8] if len(q) > 8 else []
    qid = f"d-{biome}-{slug}"
    sk = ", ".join(f"'{s}'" for s in skills)
    sr = ", ".join(f"'{s}'" for s in sreq)
    st = "\n".join(fmt_step(i, s) for i, s in enumerate(steps))
    return f"""  {{
    id: '{qid}',
    title: '{esc(title)}',
    biome: '{biome}',
    masteryTier: 'discovery',
    skillsRequired: [{sr}],
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
// Ages 6-10: Multipart adventures with 2-3 skills per quest
// Every quest teaches real elementary education skills through gameplay

import type {{ CreateQuestInput }} from '../../../types/quest.js';

export const {export_name}: CreateQuestInput[] = [
{body},
];
"""
    path = os.path.join(OUTPUT_DIR, f"discovery-{slug}.ts")
    with open(path, 'w') as f:
        f.write(content)
    return len(quests)

# ---------- QUEST VALIDATION ----------
BAD_PATTERNS = [
    (r'\bWhat is\b', 'quiz'), (r'\bHow many .+ are there\?', 'quiz'),
    (r'\bCan you tell me\b', 'quiz'), (r'\bDo you know\b', 'quiz'),
    (r'\bboy\b', 'gender'), (r'\bgirl\b', 'gender'), (r'\bprince\b', 'gender'),
    (r'\bprincess\b', 'gender'), (r'\bbrother\b', 'gender'), (r'\bsister\b', 'gender'),
    (r'\bwrong\b', 'harsh'), (r'\bincorrect\b', 'harsh'), (r'\bfailed\b', 'harsh'),
    (r'\bgame over\b', 'harsh'), (r'\bstupid\b', 'harsh'), (r'\bbad\b', 'harsh'),
    (r'\bhurry\b', 'timer'), (r'\btimer\b', 'timer'), (r'\btime.s up\b', 'timer'),
    (r'\bdrag\b', 'drag'), (r'\byour score\b', 'score'), (r'\bgrade\b', 'score'),
    (r'\byour task\b', 'school'), (r'\bthe teacher\b', 'school'),
    (r'\bthe lesson\b', 'school'), (r'\blet.s learn about\b', 'school'),
    (r'\byou earned\b', 'reward'), (r'\breward points\b', 'reward'),
    (r'\bXP\b', 'reward'), (r'\blevel up\b', 'reward'),
]

def validate_text(text, quest_id, field):
    errors = []
    for pat, cat in BAD_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            errors.append(f"  {quest_id} [{field}]: contains '{cat}' pattern: {pat}")
    return errors

def validate_quest(biome, q):
    errors = []
    slug, title, skills, desc, intro, steps, outro, mins = q[:8]
    qid = f"d-{biome}-{slug}"
    if not re.match(r'^[a-z0-9-]+$', qid):
        errors.append(f"  {qid}: invalid ID format")
    if len(skills) < 2:
        errors.append(f"  {qid}: needs 2+ skills, has {len(skills)}")
    for sk in skills:
        if not re.match(r'^[a-z]+\.[a-z0-9-]+(\.[a-z0-9-]+)*$', sk):
            errors.append(f"  {qid}: invalid skill format: {sk}")
    if len(steps) < 2:
        errors.append(f"  {qid}: needs 2+ steps for Discovery, has {len(steps)}")
    if mins < 8 or mins > 15:
        errors.append(f"  {qid}: estimatedMinutes {mins} out of range 8-15")
    for field, text in [('desc', desc), ('intro', intro), ('outro', outro)]:
        errors.extend(validate_text(text, qid, field))
    for i, s in enumerate(steps):
        otype, instr = s[0], s[1]
        hints, succ, fail = s[3], s[4], s[5]
        if otype not in SCREEN_LABELS:
            errors.append(f"  {qid} step {i}: invalid objectiveType '{otype}'")
        if len(hints) < 2:
            errors.append(f"  {qid} step {i}: needs 2+ hints, has {len(hints)}")
        for field, text in [('instr', instr), ('succ', succ), ('fail', fail)]:
            errors.extend(validate_text(text, qid, f"step{i}.{field}"))
        for h in hints:
            errors.extend(validate_text(h, qid, f"step{i}.hint"))
    return errors

print("Discovery Quest Generator — Nexus Academy")
print("=" * 50)
