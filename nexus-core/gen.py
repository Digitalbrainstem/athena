#!/usr/bin/env python3
"""Generate all 27 Builder tier biome quest files for Nexus Academy."""
import os

OUTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'data', 'quests', 'builder')
os.makedirs(OUTDIR, exist_ok=True)

SR = {
    'interact':'Interact task','collect':'Collect task','build':'Build task','craft':'Craft task',
    'navigate':'Navigate task','observe':'Observe task','teach':'Teach task','count':'Count task',
    'match':'Match task','sort':'Sort task','find':'Find task','mix':'Mix task',
    'measure':'Measure task','pattern':'Pattern task','place':'Place task','solve':'Solve task',
    'design':'Design task','experiment':'Experiment task','balance':'Balance task','decode':'Decode task',
    'diagnose':'Diagnose task','repair':'Repair task','optimize':'Optimize task','predict':'Predict task',
    'code':'Code task','explore':'Explore task','sequence':'Sequence task','compare':'Compare task',
    'transform':'Transform task','protect':'Protect task',
}

INTROS = [
    "I've been thinking about this. {d} Let's work through it together.",
    "This caught my attention. {d} I think we can figure this out.",
    "Here's something that needs solving. {d} Want to tackle it with me?",
    "I noticed something here. {d} Let's investigate together.",
    "I've been looking at this. {d} I have some ideas, but let's see what you think.",
    "There's a real challenge here. {d} Let's approach it step by step.",
    "This is worth figuring out. {d} I'm curious what we'll discover.",
    "Something's not working right. {d} Let's dig into it.",
]
OUTROS = [
    "Solid work. The approach we used here is how professionals solve real problems.",
    "Nice job. Understanding these principles opens up real-world possibilities.",
    "That was well done. This kind of problem-solving builds genuine expertise.",
    "Good thinking. What we figured out connects to many real-world applications.",
    "Impressive work. These skills are used by engineers and scientists every day.",
    "That's the kind of careful analysis that makes a real difference in practice.",
    "Well handled. Each problem like this deepens our understanding of how things work.",
    "Strong work. These are the foundations that real engineering and science build on.",
]
SINTRO = "I found something unusual. {d} This could be connected to the ancient machines. Let's investigate carefully."
SOUTRO = "Fascinating. Whatever built these machines understood principles we are only starting to rediscover. This fragment might be part of something larger."

# Auto-generated success/failure responses rotate through these per type
SUCC = {
    'measure':['The measurements provide clear data for the next phase of analysis.','The recorded values reveal the pattern in the system.','The measurement data aligns with expectations and is ready for calculations.','Precise measurements capture the key parameters of the system.'],
    'solve':['The calculation yields results consistent with the observations.','The mathematical solution confirms the expected relationship.','The computed values validate the approach and match the data.','The solution reveals how the variables relate to each other.'],
    'build':['The construction holds firm and meets all design requirements.','The assembled structure performs exactly as planned.','The build is solid and ready for testing.','Everything fits together properly and functions as designed.'],
    'craft':['The crafted result meets the specifications precisely.','The finished piece works exactly as intended.','The crafting process produces a quality result.','The completed work meets all the design criteria.'],
    'observe':['Careful observation reveals the important details of the system.','The observations capture key features that explain the behavior.','Close examination reveals patterns that were not immediately obvious.','The observed details provide the foundation for further analysis.'],
    'experiment':['The experiment produces results consistent with the underlying principles.','The experimental data confirms the hypothesis.','The results match predictions, validating the theoretical model.','The experiment provides clear evidence supporting the analysis.'],
    'code':['The code executes correctly and produces the expected output.','The program runs without errors and delivers accurate results.','The implementation works as designed and handles all test cases.','The code logic is sound and outputs match expectations.'],
    'design':['The design meets all the specified constraints and requirements.','The planned design satisfies every requirement efficiently.','The design solution addresses all the identified needs.','The design is practical, efficient, and ready for implementation.'],
    'balance':['The system reaches equilibrium with all forces properly distributed.','Balance is achieved with each component carrying its share.','The balanced configuration is stable and maintains itself.','All elements are in proper balance, confirming the calculations.'],
    'mix':['The mixture produces the anticipated result with correct proportions.','The combined materials react as predicted by the formula.','The mixing process yields the expected product.','The proportions produce exactly the desired outcome.'],
    'predict':['The prediction matches the observed outcome closely.','The predicted values align with what actually happened.','The forecast proves accurate when tested against reality.','The prediction is confirmed by the experimental results.'],
    'compare':['The comparison highlights clear and meaningful differences.','Side-by-side analysis reveals the key distinguishing factors.','The comparison identifies specific advantages and trade-offs.','Detailed comparison shows how each option performs differently.'],
    'find':['The target is located and matches the expected criteria.','The search is successful, revealing the item in its context.','The discovery matches what the analysis predicted.','The located item confirms the pattern identified earlier.'],
    'collect':['All required items are gathered and accounted for.','The collection is complete with every needed component.','Everything needed for the next step has been gathered.','All items are collected and organized for use.'],
    'sequence':['The sequence follows the correct logical order.','Each step is properly positioned in the sequence.','The ordering is correct and produces the expected flow.','The sequence logic is verified and complete.'],
    'decode':['The encoded information is successfully interpreted.','The decoded message reveals the underlying pattern.','The cipher is solved, revealing meaningful information.','The decoding is complete and the content is now readable.'],
    'diagnose':['The root cause is identified through systematic analysis.','The diagnosis pinpoints the exact source of the issue.','Careful analysis reveals what is causing the observed behavior.','The underlying problem is now clearly identified.'],
    'repair':['The repair restores proper function to the system.','After the fix, everything operates as it should.','The repaired component works reliably again.','Normal operation is restored and verified.'],
    'optimize':['The optimization measurably improves system performance.','After the changes, efficiency increases significantly.','The optimized system outperforms the original configuration.','Performance gains are clear and measurable.'],
    'place':['Each component is correctly positioned in its designated location.','The placement is precise and everything aligns properly.','All elements are in their correct positions.','The positioning is accurate and the layout is complete.'],
    'transform':['The transformation produces the desired result.','The converted form matches the target specification.','The transformation process is complete and verified.','The output matches what the transformation was designed to produce.'],
    'sort':['The items are arranged in the correct order.','Everything is properly sorted according to the criteria.','The sorting is complete and verified against the requirements.','The sorted arrangement follows the specified pattern.'],
    'match':['All pairs are correctly matched based on the criteria.','The matching is complete with every pair properly identified.','Each item is paired with its correct counterpart.','The matches are verified and all pairings are correct.'],
    'navigate':['The correct path leads to the intended destination.','Navigation is successful using the calculated route.','The destination is reached via the planned path.','The route proves accurate and efficient.'],
    'explore':['The exploration reveals useful details about the area.','Thorough exploration uncovers important information.','The investigation yields valuable discoveries.','Careful exploration provides the data needed to proceed.'],
    'interact':['The interaction produces the expected response from the system.','The system responds as predicted to the interaction.','The interaction triggers the correct sequence of events.','The response confirms the system works as designed.'],
    'pattern':['The pattern is correctly identified and can be extended.','Pattern recognition reveals the underlying rule.','The identified pattern holds true across all tested cases.','The pattern logic is verified and consistent.'],
    'count':['The count matches the expected total.','The tally is complete and accurate.','All items are counted and the total is verified.','The count is confirmed by cross-checking.'],
    'protect':['The protective measures prove effective under testing.','The protection holds up against the anticipated conditions.','The safeguards function as designed.','The protective system meets all safety requirements.'],
    'teach':['The explanation demonstrates solid understanding of the concept.','The clear explanation shows mastery of the material.','The teaching is effective and covers all key points.','The explanation accurately conveys the core principles.'],
}
FAIL = {
    'measure':['Some readings seem inconsistent. Try measuring from a different reference point.','Double-check the measurement technique and try again.','Verify the measuring tool is properly calibrated.','Retake the measurement more slowly and carefully.'],
    'solve':['The answer does not quite fit. Review each step of the calculation.','Check the arithmetic and make sure all values are in the correct units.','Re-examine the formula and verify each substituted value.','The calculation needs another look. Try working through it step by step.'],
    'build':['The structure needs some adjustment. Check the connections and alignment.','Something is not fitting together properly. Review the assembly steps.','The construction needs revision. Check that each piece is in the right position.','Verify the dimensions and try reassembling the components.'],
    'craft':['The result is not quite right. Review the materials and process.','Check the proportions and try the crafting process again.','The crafting needs adjustment. Review the recipe carefully.','Something in the process needs changing. Check each step.'],
    'observe':['Something may have been overlooked. Take another careful look.','Look more carefully at all the visible details.','Some observations may be missing. Examine the system from different angles.','Try focusing on specific features one at a time.'],
    'experiment':['The results differ from expectations. Consider which variable might have changed.','Check that all experimental conditions are properly controlled.','The experiment may need to be repeated with more careful controls.','Review the setup to ensure only the intended variable changed.'],
    'code':['The output is not what was expected. Trace through the logic step by step.','Check for syntax issues and verify the logic flow.','Debug by testing each part of the code independently.','Review the code logic and check for off-by-one or type errors.'],
    'design':['The design does not meet all constraints yet. Review the requirements.','Some specifications are not satisfied. Check each requirement individually.','The design needs revision. Identify which constraints are not met.','Revisit the design parameters and adjust accordingly.'],
    'balance':['The system is not yet balanced. Adjust and check both sides.','The balance is off. Try redistributing the loads.','Check whether all forces or quantities are properly accounted for.','Recheck the values on each side and adjust until equal.'],
    'mix':['The proportions are not quite right. Double-check the ratios.','The mixture needs adjustment. Verify the amounts of each component.','Check the recipe and make sure all quantities are correct.','The mixing ratios may need fine-tuning. Review the formula.'],
    'predict':['The prediction did not match. Reconsider the factors involved.','Review the assumptions behind the prediction.','Check whether any important variable was overlooked.','The model may need adjustment. Revisit the data.'],
    'compare':['The comparison needs more detail. Focus on specific measurable attributes.','Look more carefully at the differences between the items.','Try comparing one attribute at a time for clarity.','Some differences may have been overlooked. Check again.'],
    'find':['The target has not been located yet. Try a different search area.','Expand the search and look for less obvious locations.','Review the clues and try a more systematic search.','The item may be in a less obvious location. Keep looking.'],
    'collect':['Not everything has been gathered. Check for items that may have been missed.','Some items remain uncollected. Review the full list.','Look in areas that have not been checked yet.','Double-check the collection against the complete list.'],
    'sequence':['The order is not quite right. Think about what must happen before each step.','Check the logical dependencies between steps.','Review the sequence for steps that are out of order.','Consider cause and effect when arranging the order.'],
    'decode':['The decoding is not complete. Look for additional patterns or clues.','Try a different approach to interpreting the encoded information.','Some elements of the code remain unsolved. Look for new patterns.','Review the decoding method and check for errors.'],
    'diagnose':['The diagnosis needs refinement. Consider additional symptoms or evidence.','Look for other possible causes of the observed behavior.','The root cause has not been identified yet. Gather more data.','Consider less obvious explanations for the symptoms.'],
    'repair':['The repair is not holding. Look for underlying issues that need attention.','Check whether additional components need attention.','The fix is incomplete. Look for related problems.','Test the repair under load to identify remaining issues.'],
    'optimize':['Performance has not improved enough. Look for other factors limiting efficiency.','Other bottlenecks may be limiting the improvement.','Try identifying additional sources of inefficiency.','The optimization approach may need to target different factors.'],
    'place':['The placement needs adjustment. Check the alignment and spacing.','Some components are not in the correct position. Recheck the layout.','Verify positions against the reference diagram.','The alignment is slightly off. Adjust and try again.'],
    'transform':['The transformation is not complete. Review the process for missed steps.','Check whether all transformation steps were applied correctly.','The conversion needs another attempt. Review the procedure.','Some aspects of the transformation were missed. Try again.'],
    'sort':['Some items are not in order. Double-check the sorting criteria.','Review the sorting rules and check each item placement.','The sorting has errors. Recheck the criteria carefully.','Try sorting a smaller subset first to verify the approach.'],
    'match':['Some pairs do not match correctly. Review the matching criteria.','Check each pairing individually against the requirements.','Some matches need correction. Review the criteria more carefully.','Not all pairs are correctly matched. Try a different approach.'],
    'navigate':['This path does not lead to the destination. Check the directions.','The route needs correction. Verify the coordinates or bearing.','Recalculate the heading and try a different path.','Navigation is off course. Check the reference points.'],
    'explore':['There is more to discover here. Try approaching from a different angle.','The exploration is incomplete. Check areas that have not been visited.','Try a more systematic exploration pattern.','Some areas remain unexplored. Continue the investigation.'],
    'interact':['The interaction did not produce the expected result. Try a different approach.','The system did not respond as expected. Try an alternative method.','Check the interaction method and try again.','The response was unexpected. Consider a different approach.'],
    'pattern':['The pattern is not quite right. Look for the repeating elements more carefully.','Recheck the pattern against more examples.','The pattern rule needs adjustment. Look at the data again.','Try identifying the pattern from a different starting point.'],
    'count':['The count seems off. Try organizing the items before counting again.','Recount carefully, making sure nothing is counted twice or skipped.','The total does not match expectations. Verify the count.','Try counting in groups to reduce errors.'],
    'protect':['The protection is not adequate. Identify and reinforce the weak points.','The safeguards need strengthening. Check for vulnerabilities.','Some areas are not adequately protected. Review the coverage.','Test the protection again and reinforce any gaps.'],
    'teach':['The explanation could be clearer. Try breaking it into smaller parts.','Some key concepts were not fully explained. Add more detail.','The explanation needs more structure. Organize the key points.','Try explaining from a different angle for clarity.'],
}

def esc(s):
    return s.replace('\\','\\\\').replace("'","\\'")

# Counter for rotating through template variations
_sc = {}
_fc = {}

def get_succ(t):
    _sc[t] = _sc.get(t, -1) + 1
    arr = SUCC.get(t, SUCC['observe'])
    return arr[_sc[t] % len(arr)]

def get_fail(t):
    _fc[t] = _fc.get(t, -1) + 1
    arr = FAIL.get(t, FAIL['observe'])
    return arr[_fc[t] % len(arr)]

def write_biome(biome, var_name, quests):
    """Write a single biome TypeScript file."""
    lines = []
    lines.append(f"// Builder tier quests - {biome} biome")
    lines.append("// Ages 11-14, companion as trusted ally")
    lines.append("")
    lines.append("import type { CreateQuestInput } from '../../../types/quest.js';")
    lines.append("")
    lines.append(f"export const {var_name}: CreateQuestInput[] = [")
    lines.append("")

    for qi, q in enumerate(quests):
        slug, title, skills, mins, desc = q[0], q[1], q[2], q[3], q[4]
        steps_data = q[5]
        story = len(q) > 6 and q[6]
        qid = f'b-{biome}-{slug}'
        sk = ', '.join(f"'{s}'" for s in skills)

        if story:
            intro = SINTRO.format(d=desc)
            outro = SOUTRO
        else:
            intro = INTROS[qi % len(INTROS)].format(d=desc)
            outro = OUTROS[qi % len(OUTROS)]

        lines.append("  {")
        lines.append(f"    id: '{esc(qid)}',")
        lines.append(f"    title: '{esc(title)}',")
        lines.append(f"    biome: '{biome}',")
        lines.append(f"    masteryTier: 'builder',")
        lines.append(f"    skillsRequired: [],")
        lines.append(f"    skillsTaught: [{sk}],")
        lines.append(f"    content: {{")
        lines.append(f"      description: '{esc(desc)}',")
        lines.append(f"      companionIntro: '{esc(intro)}',")
        lines.append(f"      steps: [")

        for si, step in enumerate(steps_data):
            stype = step[0]
            sinstr = step[1]
            shint = step[2]
            # Steps can have 3, 4, or 5 elements
            if len(step) >= 5:
                ssucc = step[3]
                sfail = step[4]
            elif len(step) >= 4:
                ssucc = step[3]
                sfail = get_fail(stype)
            else:
                ssucc = get_succ(stype)
                sfail = get_fail(stype)

            sr = f'{SR[stype]}. {sinstr}'
            hints = shint if isinstance(shint, list) else [shint]
            hl = ', '.join(f"'{esc(h)}'" for h in hints)

            lines.append("        {")
            lines.append(f"          index: {si},")
            lines.append(f"          instruction: '{esc(sinstr)}',")
            lines.append(f"          spokenInstruction: '{esc(sinstr)}',")
            lines.append(f"          screenReaderText: '{esc(sr)}',")
            lines.append(f"          companionRepeat: '{esc(sinstr)}',")
            lines.append(f"          objectiveType: '{stype}',")
            lines.append(f"          hints: [{hl}],")
            lines.append(f"          successResponse: '{esc(ssucc)}',")
            lines.append(f"          failureResponse: '{esc(sfail)}',")
            lines.append("        },")

        lines.append("      ],")
        lines.append(f"      companionOutro: '{esc(outro)}',")
        lines.append(f"      estimatedMinutes: {mins},")
        lines.append("    },")
        lines.append("  },")
        lines.append("")

    lines.append("];")
    lines.append("")

    fp = os.path.join(OUTDIR, f'builder-{biome}.ts')
    with open(fp, 'w') as f:
        f.write('\n'.join(lines))
    return len(quests)


