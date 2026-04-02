"""Quest generator helper — shared formatting function"""

def esc(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")

def fmt_quest(q):
    steps_str = ""
    for i, s in enumerate(q["steps"]):
        hints_str = ", ".join([f"'{esc(h)}'" for h in s["hints"]])
        extras = ""
        for key in ["targetValue","requiredCount","maxChoices","targetId"]:
            if key in s and s[key] is not None:
                v = s[key]
                if isinstance(v, str):
                    extras += f"\n          {key}: '{v}',"
                elif isinstance(v, (int, float)):
                    extras += f"\n          {key}: {v},"
        steps_str += f"""
        {{
          index: {i},
          instruction: '{esc(s["inst"])}',
          spokenInstruction: '{esc(s["spoken"])}',
          screenReaderText: '{esc(s["sr"])}',
          companionRepeat: '{esc(s["repeat"])}',
          objectiveType: '{s["obj"]}',{extras}
          hints: [{hints_str}],
          successResponse: '{esc(s["success"])}',
          failureResponse: '{esc(s["fail"])}',
        }},"""

    return f"""  {{
    id: '{q["id"]}',
    title: '{esc(q["title"])}',
    biome: '{q["biome"]}',
    masteryTier: 'foundation',
    skillsRequired: [],
    skillsTaught: {q["skills"]},
    content: {{
      description: '{esc(q["desc"])}',
      companionIntro: '{esc(q["intro"])}',
      steps: [{steps_str}
      ],
      companionOutro: '{esc(q["outro"])}',
      estimatedMinutes: {q["mins"]},
    }},
  }},
"""

def write_quests_file(filename, export_name, comment, quests, close=True):
    with open(filename, "w") as f:
        f.write(f"""// Foundation tier quests — {comment}
// Ages 2-5: Every quest teaches real pre-K skills through play

import type {{ CreateQuestInput }} from '../../types/quest.js';

export const {export_name}: CreateQuestInput[] = [
""")
        for q in quests:
            f.write(fmt_quest(q))
        if close:
            f.write("];\n")

def append_quests(filename, quests, close=False):
    with open(filename, "a") as f:
        for q in quests:
            f.write(fmt_quest(q))
        if close:
            f.write("];\n")

def step(inst, spoken, sr, repeat, obj, hints, success, fail, **kwargs):
    d = {"inst":inst, "spoken":spoken, "sr":sr, "repeat":repeat, "obj":obj, "hints":hints, "success":success, "fail":fail}
    d.update(kwargs)
    return d

def quest(id, title, biome, skills, desc, intro, steps, outro, mins=5):
    return {"id":id,"title":title,"biome":biome,"skills":skills,"desc":desc,"intro":intro,"steps":steps,"outro":outro,"mins":mins}
