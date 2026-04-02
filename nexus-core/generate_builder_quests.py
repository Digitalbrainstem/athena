#!/usr/bin/env python3
"""Generate Builder tier (ages 11-14) quest files for Nexus Academy.
Produces 27 biome files with ~37 quests each = ~1000 total quests.
Builder companion tone: Trusted Ally — respectful, debates ideas as equals.
"""
import os, sys, random

OUTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'data', 'quests', 'builder')

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

STORY_INTRO = "I found something unusual. {d} This could be connected to the ancient machines. Let's investigate carefully."
STORY_OUTRO = "Fascinating. Whatever built these machines understood principles we are only starting to rediscover. This fragment might be part of something larger."


def esc(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")


def step_ts(idx, obj_type, instr, hint, success, failure, indent=8):
    sp = ' ' * indent
    sr = f'{SR[obj_type]}. {instr}'
    hints = hint if isinstance(hint, list) else [hint]
    hl = ',\n'.join(f"{sp}    '{esc(h)}'" for h in hints)
    return f"""{sp}{{
{sp}  index: {idx},
{sp}  instruction: '{esc(instr)}',
{sp}  spokenInstruction: '{esc(instr)}',
{sp}  screenReaderText: '{esc(sr)}',
{sp}  companionRepeat: '{esc(instr)}',
{sp}  objectiveType: '{obj_type}',
{sp}  hints: [
{hl},
{sp}  ],
{sp}  successResponse: '{esc(success)}',
{sp}  failureResponse: '{esc(failure)}',
{sp}}}"""


def quest_ts(biome, q, qi):
    slug, title, skills, mins, desc, steps = q[0], q[1], q[2], q[3], q[4], q[5]
    story = len(q) > 6 and q[6]
    qid = f'b-{biome}-{slug}'
    sk = ', '.join(f"'{s}'" for s in skills)
    intro_t = STORY_INTRO if story else INTROS[qi % len(INTROS)]
    outro = STORY_OUTRO if story else OUTROS[qi % len(OUTROS)]
    intro = intro_t.format(d=desc)
    ss = ',\n'.join(step_ts(i, s[0], s[1], s[2], s[3], s[4]) for i, s in enumerate(steps))
    return f"""  {{
    id: '{esc(qid)}',
    title: '{esc(title)}',
    biome: '{biome}',
    masteryTier: 'builder',
    skillsRequired: [],
    skillsTaught: [{sk}],
    content: {{
      description: '{esc(desc)}',
      companionIntro: '{esc(intro)}',
      steps: [
{ss},
      ],
      companionOutro: '{esc(outro)}',
      estimatedMinutes: {mins},
    }},
  }}"""


def write_biome(biome_slug, var_name, quests):
    qs = ',\n\n'.join(quest_ts(biome_slug, q, i) for i, q in enumerate(quests))
    c = f"""// Builder tier quests - {biome_slug} biome
// Ages 11-14, companion as trusted ally

import type {{ CreateQuestInput }} from '../../../types/quest.js';

export const {var_name}: CreateQuestInput[] = [

{qs},
];
"""
    fp = os.path.join(OUTDIR, f'builder-{biome_slug}.ts')
    os.makedirs(OUTDIR, exist_ok=True)
    with open(fp, 'w') as f:
        f.write(c)
    return len(quests)


# ============================================================================
# BIOME DATA: Each quest = (slug, title, [skills], minutes, description, [(type, instr, hint, success, failure)...], [story_flag])
# ============================================================================

def workshop():
    return [
        ('gear-ratio', 'Gear Ratio Calibration', ['math.ratios', 'engineering.mechanisms'], 20,
         'The Workshop crane needs recalibrated gear ratios to lift heavy forge components safely.',
         [('measure', 'Count the teeth on each gear in the crane drive train and record their sizes.', 'Count teeth around each gear circumference.', 'The tooth counts reveal stage ratios of 3:1 and 4:1 in the current drive train.', 'Make sure to count every gear, including the small pinion gears near the motor.'),
          ('solve', 'Calculate the compound gear ratio by multiplying the individual stage ratios together.', 'For stages with ratios a:1 and b:1, the compound ratio is (a times b):1.', 'The compound calculation shows a 12:1 overall mechanical advantage from motor to output.', 'Check each individual ratio is correct before combining them.'),
          ('build', 'Assemble a new gear train that achieves a 16:1 compound mechanical advantage for the heavy lift.', 'Try combining stages like 4:1 and 4:1, or 8:1 and 2:1.', 'The new gear train meshes smoothly and delivers the designed 16:1 advantage.', 'Ensure the gears mesh without binding and spin freely before testing under load.'),
          ('experiment', 'Test the gear train by measuring input and output forces and verify the 16:1 ratio.', 'Apply a known force to the input shaft and measure force at the output.', 'The measured force ratio confirms the 16:1 mechanical advantage matches calculations.', 'If the measured ratio differs from calculations, check for friction losses in bearings.'),
         ]),
        ('pulley-advantage', 'Pulley Mechanical Advantage', ['physics.simple-machines', 'math.proportions'], 20,
         'The Workshop hoist cannot lift the heaviest anvils and needs a redesigned pulley system.',
         [('observe', 'Examine the current single-pulley hoist and note how much force is needed to lift a standard weight.', 'A single fixed pulley changes direction but does not reduce force.', 'The single pulley requires the same force as the weight being lifted, just redirected.', 'Observe how the rope tension compares to the weight on the hook.'),
          ('build', 'Add a second pulley to create a compound pulley system with a mechanical advantage of 2.', 'In a compound pulley, the load is supported by two rope segments.', 'The two-pulley system cuts the required force in half, though the rope must be pulled twice as far.', 'Make sure the rope threads through both pulleys correctly.'),
          ('measure', 'Measure the force required to lift the standard weight with the new compound system.', 'Use the force gauge attached to the rope end.', 'The force measurement confirms the load is halved compared to the single pulley.', 'Verify the weight is hanging freely and not resting on anything.'),
          ('design', 'Design a four-pulley block-and-tackle system to lift the heaviest anvils with one-quarter the force.', 'Each additional supporting rope segment adds 1 to the mechanical advantage.', 'The four-pulley design reduces the 400-newton anvil to just 100 newtons of pull force.', 'Sketch the rope path through all four pulleys before building.'),
         ]),
        ('lever-classes', 'Lever Classification Workshop', ['physics.forces', 'math.equations'], 18,
         'The Workshop has three broken tools that each use a different class of lever and need repair.',
         [('observe', 'Examine the crowbar, wheelbarrow, and tongs to identify the fulcrum, effort, and load positions on each.', 'The fulcrum is the pivot point, the effort is where force is applied, and the load is what resists.', 'Each tool shows a distinct arrangement of fulcrum, effort, and load.', 'Look at where each tool pivots and where force is applied versus where work happens.'),
          ('sort', 'Classify each tool as a first-class, second-class, or third-class lever based on the positions.', 'In a first-class lever, the fulcrum is between effort and load, like a seesaw.', 'The crowbar is first-class, the wheelbarrow is second-class, and the tongs are third-class.', 'Think about what sits in the middle position for each tool.'),
          ('solve', 'Calculate the mechanical advantage of the crowbar given a 30 cm effort arm and a 5 cm load arm.', 'Mechanical advantage equals effort arm length divided by load arm length.', 'The calculation shows a mechanical advantage of 6, meaning 10 newtons of effort moves 60 newtons of load.', 'Double-check the arm length measurements before dividing.'),
          ('repair', 'Fix the broken wheelbarrow by repositioning the wheel to maximize mechanical advantage.', 'Moving the wheel closer to the load increases the effort arm relative to the load arm.', 'The repaired wheelbarrow lifts heavy loads with noticeably less effort than before.', 'The wheel acts as the fulcrum, so its position determines both arm lengths.'),
         ]),
        ('inclined-plane', 'Ramp Force Calculations', ['physics.forces', 'math.equations'], 20,
         'A new loading ramp must be built for the Workshop to move heavy equipment between floors.',
         [('measure', 'Measure the height of the Workshop platform and the available floor space for the ramp.', 'Record the vertical rise and the horizontal run separately.', 'The platform stands 2 meters high with 8 meters of available floor space for the ramp.', 'Use the measuring tools on the wall and floor markings.'),
          ('solve', 'Calculate the ideal mechanical advantage of the ramp using the formula: length divided by height.', 'A longer ramp relative to its height means less force is needed to push loads up.', 'With an 8-meter ramp and 2-meter height, the mechanical advantage is 4, reducing the push force to one quarter.', 'The ramp length is the hypotenuse, not the horizontal distance.'),
          ('build', 'Construct the ramp at the calculated angle and add surface texture to prevent slipping.', 'The angle can be found using the inverse tangent of height over horizontal distance.', 'The ramp stands at about 14 degrees and heavy crates slide up smoothly with reduced effort.', 'A steeper ramp requires more force but takes less space.'),
          ('experiment', 'Push a 200-newton crate up the ramp and verify the force needed matches your calculations.', 'The force needed should be roughly the weight divided by the mechanical advantage.', 'The force gauge reads approximately 50 newtons, confirming the 4:1 advantage minus some friction.', 'If the force is higher than calculated, friction is adding resistance.'),
         ]),
        ('fma-catapult', 'Catapult Force and Acceleration', ['physics.newtons-laws', 'math.equations'], 22,
         'The Workshop catapult launches test masses inconsistently and needs force-mass-acceleration calibration.',
         [('measure', 'Weigh five test masses of different sizes and record each mass in kilograms.', 'Use the Workshop balance scale and convert grams to kilograms by dividing by 1000.', 'The five masses range from 0.1 kg to 0.5 kg, each precisely measured.', 'Make sure the scale is zeroed before each measurement.'),
          ('experiment', 'Launch each mass with the same spring tension and measure the acceleration using the distance markers.', 'Acceleration equals the change in velocity divided by time.', 'Lighter masses accelerate faster under the same force, exactly as Newton predicted.', 'Ensure the spring tension is identical for each launch.'),
          ('solve', 'Use F = ma to calculate the force the catapult spring applies, given the mass and measured acceleration.', 'Rearrange to F = m times a, using one of your measured mass-acceleration pairs.', 'All five mass-acceleration pairs yield approximately the same force, confirming F = ma.', 'If forces differ significantly between trials, check for measurement errors.'),
          ('predict', 'Predict the acceleration of a new 0.25 kg mass using the calculated force, then test it.', 'Rearrange F = ma to a = F divided by m.', 'The predicted and measured accelerations match closely, validating the F = ma model.', 'Remember to use consistent units throughout the calculation.'),
         ]),
        ('friction-surfaces', 'Surface Friction Investigation', ['physics.forces', 'engineering.materials-science'], 20,
         'Workshop tool trays slide off angled shelves, and different shelf surfaces need testing to find the best grip.',
         [('experiment', 'Place a standard weight on each of four shelf surfaces and slowly tilt until it begins to slide.', 'The angle at which sliding begins is called the angle of repose.', 'Each surface produces a different slide angle, from smooth metal at 12 degrees to rubber at 35 degrees.', 'Tilt very slowly and note the exact angle when motion begins.'),
          ('measure', 'Record the slide angle for each surface and calculate the coefficient of friction using the tangent.', 'The coefficient of static friction equals the tangent of the angle of repose.', 'Rubber has the highest coefficient at 0.70, while polished metal is lowest at 0.21.', 'Make sure the angle is measured from horizontal, not from vertical.'),
          ('compare', 'Rank the four surfaces by friction coefficient and determine which is best for tool storage shelves.', 'Higher friction means tools are less likely to slide, but harder to reposition.', 'The rubber surface provides the best grip without making tools impossible to move.', 'Consider both safety and usability when choosing the optimal surface.'),
          ('design', 'Create a composite shelf surface that combines high friction edges with a smooth center for easy repositioning.', 'A border of high-friction material keeps tools from sliding off the edges.', 'The composite design holds tools securely on angled shelves while allowing easy access from the center.', 'Test the design at the same angles to confirm it prevents sliding.'),
         ]),
        ('momentum-collision', 'Collision Momentum Lab', ['physics.momentum', 'math.equations'], 22,
         'Two Workshop carts keep colliding at the intersection and the track layout needs momentum analysis.',
         [('measure', 'Weigh both carts and measure their velocities as they approach the intersection.', 'Use the track markers and timing gates to calculate velocity as distance over time.', 'Cart A has a mass of 5 kg moving at 2 meters per second, Cart B is 3 kg at 4 meters per second.', 'Record both mass and velocity for each cart before the collision.'),
          ('solve', 'Calculate the momentum of each cart before collision using p = mv.', 'Momentum equals mass times velocity, measured in kilogram-meters per second.', 'Cart A carries 10 kg m/s of momentum and Cart B carries 12 kg m/s.', 'Include the direction of motion when calculating momentum.'),
          ('predict', 'Predict the combined velocity after the carts stick together using conservation of momentum.', 'Total momentum before equals total momentum after: m1v1 + m2v2 = (m1+m2)v_final.', 'The combined 8 kg cart should move at 2.75 m/s after the perfectly inelastic collision.', 'Add the momentums as vectors, accounting for direction of travel.'),
          ('experiment', 'Run the collision and measure the actual final velocity to compare with your prediction.', 'Use the same timing gates to measure the combined cart velocity after collision.', 'The measured velocity closely matches the predicted 2.75 m/s, confirming momentum conservation.', 'Small differences between predicted and measured values are due to friction and energy loss.'),
         ]),
        ('work-energy', 'Work and Energy Transfer', ['physics.work-energy', 'math.equations'], 20,
         'The Workshop conveyor belt wastes energy moving crates uphill and needs efficiency improvements.',
         [('measure', 'Measure the force needed to push a crate along the conveyor and the distance it travels.', 'Work equals force times distance, measured in joules.', 'The conveyor requires 50 newtons of force over a 4-meter distance to move each crate.', 'Make sure force is measured in the direction of motion.'),
          ('solve', 'Calculate the work done on the crate and compare it to the gravitational potential energy gained.', 'Gravitational PE = mass times gravity times height gained.', 'The work done is 200 joules, but the crate only gains 150 joules of potential energy, revealing 50 joules lost to friction.', 'The difference between work input and energy gained represents losses.'),
          ('optimize', 'Identify where energy is being lost and redesign the conveyor to improve efficiency.', 'Efficiency equals useful energy output divided by total energy input, times 100 percent.', 'Reducing friction by adding rollers improves efficiency from 75 percent to 92 percent.', 'Focus on the parts of the conveyor where the most friction occurs.'),
          ('experiment', 'Test the improved conveyor and calculate the new efficiency to verify your changes.', 'Compare the new work input to the same gravitational PE gain.', 'The measured efficiency matches the predicted improvement, saving significant energy per crate.', 'Run multiple trials to confirm the improvement is consistent.'),
         ]),
        ('thermal-conduction', 'Thermal Conductivity Testing', ['physics.thermal-energy', 'engineering.materials-science'], 20,
         'The Workshop forge loses too much heat through its walls and different insulation materials need testing.',
         [('experiment', 'Place four different materials between a heat source and a temperature sensor, and record heat transfer rates.', 'Measure the temperature on the cool side every minute for ten minutes.', 'Metal transfers heat fastest, then stone, then wood, with ceramic wool transferring the least.', 'Keep the heat source at a constant temperature throughout each trial.'),
          ('measure', 'Calculate the rate of heat transfer through each material by finding the temperature change per minute.', 'Rate of heat transfer depends on the material conductivity, thickness, and area.', 'The data shows metal conducts heat 100 times faster than ceramic wool insulation.', 'Plot temperature vs time for each material to see the patterns clearly.'),
          ('compare', 'Rank the materials by thermal conductivity and identify the best insulator for the forge walls.', 'Good insulators have low thermal conductivity and slow heat transfer.', 'Ceramic wool is the clear winner for insulation, keeping the cool side nearly unchanged.', 'Consider both insulation value and structural strength for practical use.'),
          ('design', 'Design a layered forge wall using the best combination of structural and insulating materials.', 'A strong outer layer with insulating inner layers combines both properties.', 'The layered design maintains forge temperature while keeping the outer wall safe to touch.', 'Test the layered design with the same heat source to verify performance.'),
         ]),
        ('density-float', 'Density and Buoyancy Workshop', ['physics.density', 'math.equations'], 18,
         'Workshop parts keep sinking or floating unexpectedly in the quenching tank and density analysis is needed.',
         [('measure', 'Measure the mass and volume of five different workshop materials to calculate their densities.', 'Density equals mass divided by volume, measured in grams per cubic centimeter.', 'The materials range from aluminum at 2.7 g per cc to lead at 11.3 g per cc.', 'Use water displacement to find the volume of irregular shapes.'),
          ('solve', 'Calculate the density of each material and predict whether it will float or sink in water.', 'Objects with density greater than 1.0 g per cc sink in water, less than 1.0 float.', 'All the metals sink because their densities exceed water, but the wooden handle floats.', 'Remember that water has a density of exactly 1.0 g per cc.'),
          ('predict', 'Determine which materials will float in the Workshop mercury bath, which has a density of 13.6 g per cc.', 'Any material less dense than mercury will float on its surface.', 'Even lead floats on mercury because 11.3 is less than 13.6 g per cc.', 'Compare each material density to mercury density of 13.6.'),
          ('experiment', 'Test your predictions by carefully placing each material in the mercury bath.', 'Observe whether each sample floats, sinks, or is partially submerged.', 'Every prediction matches the observations, confirming that relative density determines buoyancy.', 'Handle materials carefully and observe the depth they float at.'),
         ]),
        ('ohm-law', 'Circuit Resistance Lab', ['physics.circuits', 'math.equations'], 22,
         'The Workshop lighting circuits keep dimming and the electrical resistance in the wiring needs diagnosis.',
         [('measure', 'Use a multimeter to measure voltage across and current through each section of the lighting circuit.', 'Set the multimeter to voltage mode for across and current mode for through.', 'The readings show 12 volts across the source but only 9 volts reaching the lights.', 'Record voltage and current at multiple points along the circuit.'),
          ('solve', 'Apply V = IR to calculate the resistance of the wiring between the source and the lights.', 'Rearrange to R = V divided by I, where V is the voltage drop across the wire.', 'The 3-volt drop with 2 amps of current reveals 1.5 ohms of wire resistance causing the dimming.', 'Use the voltage drop across just the wire, not the total circuit voltage.'),
          ('diagnose', 'Identify which wire section has the highest resistance by measuring voltage drops along the path.', 'Higher voltage drop across a section means higher resistance in that section.', 'A corroded connector accounts for 2 of the 3 volts of total drop.', 'Compare voltage drops at each connection point along the circuit.'),
          ('repair', 'Replace the high-resistance section and verify the lights receive full voltage.', 'Clean or replace corroded connectors to reduce resistance.', 'After the repair, the lights receive 11.8 volts and shine at full brightness.', 'Measure the circuit again after repair to confirm the improvement.'),
         ]),
        ('series-parallel', 'Series vs Parallel Circuits', ['physics.circuits', 'math.equations'], 22,
         'The Workshop needs both series and parallel circuit sections for different equipment requirements.',
         [('build', 'Construct a series circuit with three identical resistors and measure the total resistance.', 'In a series circuit, total resistance equals R1 + R2 + R3.', 'Three 10-ohm resistors in series produce a total resistance of 30 ohms.', 'Connect each resistor end-to-end in a single path.'),
          ('build', 'Construct a parallel circuit with the same three resistors and measure the total resistance.', 'In parallel, 1 over R_total = 1 over R1 + 1 over R2 + 1 over R3.', 'Three 10-ohm resistors in parallel produce a total resistance of 3.33 ohms.', 'Each resistor needs its own path from positive to negative.'),
          ('compare', 'Compare how current divides in each circuit type using ammeter readings at multiple points.', 'In series, current is the same everywhere; in parallel, it divides among branches.', 'The series circuit carries 0.4 amps everywhere, while the parallel circuit splits 1.2 amps into 0.4 per branch.', 'Place the ammeter in the main line and then in each branch.'),
          ('design', 'Design a combination circuit that powers high-resistance sensors in series and low-resistance motors in parallel.', 'Series adds resistance for current-sensitive components, parallel shares current for power-hungry ones.', 'The combination circuit delivers the right current to each component type.', 'Sketch the circuit diagram before building to plan the connections.'),
         ]),
        ('pythagorean-roof', 'Roof Truss Geometry', ['math.pythagorean-theorem', 'engineering.structural-analysis'], 20,
         'A new Workshop roof truss must be cut to exact measurements using right-triangle geometry.',
         [('measure', 'Measure the span of the Workshop roof opening and the desired peak height for the truss.', 'The span is the horizontal distance from wall to wall.', 'The opening spans 8 meters and the peak will rise 3 meters above the walls.', 'The half-span is what you will use for right-triangle calculations.'),
          ('solve', 'Use the Pythagorean theorem to calculate the length of each rafter from wall to peak.', 'With half-span as one leg and height as the other, the rafter is the hypotenuse: a squared plus b squared equals c squared.', 'Each rafter must be 5 meters long, since 4 squared plus 3 squared equals 25, and the square root of 25 is 5.', 'Use half the total span as the horizontal leg of the triangle.'),
          ('build', 'Cut the rafters to the calculated length and assemble the triangular truss frame.', 'Mark the exact length on each timber before cutting.', 'The rafters meet perfectly at the peak, forming a stable triangular truss.', 'Check measurements twice before cutting to avoid waste.'),
          ('experiment', 'Load-test the truss by placing weights at the peak and measuring any deflection.', 'A well-built triangular truss distributes load evenly to both walls.', 'The truss holds the test load with minimal deflection, proving the geometry is sound.', 'Add weight gradually and watch for any bowing or shifting.'),
         ]),
        ('percentage-efficiency', 'Machine Efficiency Calculations', ['math.percentages', 'physics.work-energy'], 18,
         'Several Workshop machines run at unknown efficiencies and need testing to identify which ones waste the most energy.',
         [('measure', 'Measure the energy input and useful energy output of each machine during a standard task.', 'Input energy is the total energy consumed; output energy is the useful work done.', 'The drill uses 500 joules of input energy to do 400 joules of useful cutting work.', 'Use the energy meters attached to each machine.'),
          ('solve', 'Calculate the efficiency of each machine as a percentage: output divided by input times 100.', 'Efficiency percentage = (useful output / total input) x 100.', 'The drill runs at 80 percent efficiency, while the old grinder manages only 45 percent.', 'An efficiency over 100 percent would violate conservation of energy.'),
          ('sort', 'Rank all machines from most to least efficient and identify the worst performers.', 'Machines with low efficiency waste more energy as heat and friction.', 'The ranking reveals the grinder and the belt sander as the biggest energy wasters.', 'Look for machines below 60 percent efficiency as priority targets.'),
          ('optimize', 'Improve the least efficient machine by lubricating, aligning, or replacing worn components.', 'Friction is the main source of energy loss in mechanical systems.', 'After maintenance, the grinder efficiency jumps from 45 percent to 72 percent.', 'Test the machine again after each improvement to track progress.'),
         ]),
        ('linear-spring', 'Spring Constant Measurement', ['math.linear-functions', 'physics.forces'], 20,
         'The Workshop spring press needs calibration and the relationship between force and extension must be mapped.',
         [('experiment', 'Hang increasing weights from the spring and measure the extension for each weight.', 'Record at least six data points with equal weight increments.', 'Each added 100-gram weight stretches the spring an additional 2 centimeters.', 'Make sure the spring is not stretched beyond its elastic limit.'),
          ('solve', 'Plot the data as a graph with force on the vertical axis and extension on the horizontal axis.', 'A linear relationship means force is directly proportional to extension.', 'The data points form a straight line, confirming the spring follows a linear force-extension law.', 'Use consistent units: newtons for force and meters for extension.'),
          ('measure', 'Calculate the spring constant k by finding the slope of the force-extension line.', 'The slope equals the change in force divided by the change in extension, giving k in newtons per meter.', 'The spring constant is 49 newtons per meter, meaning 49 N stretches it by 1 meter.', 'Pick two points far apart on the line for the most accurate slope.'),
          ('predict', 'Use the spring constant to predict the extension for a new weight, then verify with a measurement.', 'Extension equals force divided by spring constant: x = F / k.', 'The predicted extension matches the measured value within 2 percent.', 'If the prediction is way off, check whether the spring is still in its linear range.'),
         ]),
        ('area-volume-casting', 'Metal Casting Calculations', ['math.area-volume', 'engineering.materials-science'], 22,
         'The Workshop foundry needs precise mold volume calculations to avoid wasting expensive molten metal.',
         [('measure', 'Measure the dimensions of a rectangular mold cavity: length, width, and depth.', 'Record each dimension in centimeters using the precision calipers.', 'The cavity measures 15 cm long, 8 cm wide, and 5 cm deep.', 'Measure at multiple points to check for taper or unevenness.'),
          ('solve', 'Calculate the volume of the rectangular mold using length times width times depth.', 'Volume of a rectangular prism = l x w x d.', 'The mold volume is 600 cubic centimeters, requiring 600 cc of molten metal.', 'Convert to appropriate units if needed for the metal density calculation.'),
          ('solve', 'Calculate the mass of metal needed using the density formula: mass = density times volume.', 'Bronze has a density of about 8.8 grams per cubic centimeter.', 'The casting requires 5,280 grams (5.28 kg) of bronze to fill the mold completely.', 'Make sure density and volume use compatible units.'),
          ('design', 'Design a cylindrical mold with the same volume but different proportions for a round part.', 'Volume of a cylinder = pi times radius squared times height.', 'A cylinder with radius 6.18 cm and height 5 cm holds the same 600 cc as the rectangular mold.', 'Use pi = 3.14159 and solve for the radius given the desired height.'),
         ]),
        ('scale-drawing', 'Blueprint Scale Drawing', ['math.ratios', 'math.proportions'], 18,
         'The Workshop expansion plans need accurate scale drawings before construction can begin.',
         [('measure', 'Measure the actual dimensions of the current Workshop floor space.', 'Record length and width of the main room and each workstation area.', 'The Workshop measures 12 meters by 8 meters with four workstation alcoves.', 'Use the measuring tape from the tool rack for long distances.'),
          ('solve', 'Determine the best scale ratio to fit the full Workshop on a single drawing sheet.', 'If the paper is 60 cm wide and the Workshop is 12 meters, the scale is 1:20.', 'A 1:20 scale means every 1 centimeter on paper represents 20 centimeters in reality.', 'Make sure both dimensions fit on the paper at the chosen scale.'),
          ('build', 'Draw the Workshop floor plan at the chosen scale, converting every real measurement.', 'Multiply each real measurement by the scale factor to get the drawing size.', 'The 12-meter wall becomes 60 cm on paper, and each 2-meter workstation becomes 10 cm.', 'Use a ruler and draw straight lines for accurate representation.'),
          ('solve', 'Use the scale drawing to calculate the area of the proposed expansion, then convert back to real size.', 'Measure the expansion area on paper, then multiply by the scale factor squared for real area.', 'The expansion adds 24 square meters of floor space based on the scale drawing calculations.', 'Remember: area scales by the square of the linear scale factor.'),
         ]),
        ('equation-balance', 'Balanced Beam Equations', ['math.equations', 'physics.forces'], 18,
         'The Workshop balance beam is used to sort materials by weight, but the balance point calculations are off.',
         [('observe', 'Place known weights at various positions on the beam and observe when it balances.', 'A heavier weight closer to the fulcrum can balance a lighter weight farther away.', 'A 2 kg weight at 3 meters balances a 3 kg weight at 2 meters from the fulcrum.', 'Try different weight and position combinations to see the pattern.'),
          ('solve', 'Write the balance equation: mass1 times distance1 equals mass2 times distance2.', 'This is the principle of moments, or torque balance.', 'The equation m1 x d1 = m2 x d2 correctly predicts every balanced configuration tested.', 'Both sides must produce equal torque for the beam to balance.'),
          ('solve', 'Calculate where to place an unknown weight to balance the beam with a known weight at a known position.', 'Rearrange: d2 = (m1 x d1) / m2 to find the unknown distance.', 'The calculated position balances the beam perfectly when tested.', 'Substitute the known values carefully and solve for the unknown.'),
          ('experiment', 'Use the balance equation to determine the mass of an unknown Workshop part.', 'Place the unknown mass on one side and adjust a known mass on the other until balanced.', 'The balance equation reveals the unknown part weighs exactly 4.5 kilograms.', 'Make sure the beam is truly level before reading the balance point.'),
         ]),
        ('scientific-notation', 'Forge Temperature Notation', ['math.scientific-notation', 'physics.thermal-energy'], 18,
         'The Workshop forge reaches extreme temperatures that are easier to work with in scientific notation.',
         [('measure', 'Record the temperatures of five different forge zones in standard notation.', 'Use the infrared thermometer to measure each zone safely.', 'Temperatures range from 800 degrees C in the outer zone to 1,500 degrees in the core.', 'Point the thermometer at each zone for at least 3 seconds for accurate readings.'),
          ('transform', 'Convert each temperature to Kelvin by adding 273, then express in scientific notation.', 'To write in scientific notation, move the decimal until one digit is before it, then count places moved.', '1,773 Kelvin becomes 1.773 times 10 to the third power in scientific notation.', 'Remember the exponent tells how many places the decimal moved.'),
          ('solve', 'Calculate the total thermal energy in the forge using E = mcT with the scientific notation values.', 'Multiply the values and add the exponents when multiplying powers of 10.', 'The total energy is approximately 4.2 times 10 to the seventh joules.', 'When multiplying in scientific notation, multiply the coefficients and add exponents.'),
          ('compare', 'Compare the forge energy to everyday objects like boiling a kettle to give context to the numbers.', 'A kettle uses about 4 times 10 to the fifth joules to boil.', 'The forge contains about 100 times the energy needed to boil a kettle, making the scale tangible.', 'Dividing the larger number by the smaller gives the ratio.'),
         ]),
        ('variables-coding', 'Workshop Inventory Tracker', ['cs.variables', 'cs.functions'], 20,
         'The Workshop needs a simple program to track material inventory and alert when supplies run low.',
         [('code', 'Create variables to store the current stock levels for five Workshop materials.', 'Variables store values that can change, like counts of bolts, screws, and sheet metal.', 'Five variables are initialized with current stock counts for each material type.', 'Use descriptive variable names that indicate what each one stores.'),
          ('code', 'Write a function that checks if any material is below the minimum threshold and returns its name.', 'The function should loop through all materials and compare each to its minimum.', 'The function correctly identifies that rivet stock is below the 50-unit minimum.', 'Use comparison operators to check each stock level against its threshold.'),
          ('code', 'Add a function that calculates how many units to order based on the difference between current and target stock.', 'Order quantity equals target stock minus current stock.', 'The order function calculates 150 rivets needed to bring stock from 30 back to 180.', 'Make sure the function handles cases where stock is already above target.'),
          ('experiment', 'Test the inventory system by simulating a week of Workshop activity with material usage and restocking.', 'Run the functions after each simulated day and check the outputs.', 'The system correctly tracks declining stock and triggers reorder alerts at the right times.', 'Test edge cases like zero stock and exactly-at-threshold values.'),
         ]),
        ('loop-pattern-cut', 'Automated Pattern Cutting', ['cs.loops', 'math.patterns'], 20,
         'The Workshop cutting machine needs a program to repeat precise cut patterns across a sheet of material.',
         [('observe', 'Study the cut pattern that needs to repeat: a series of notches spaced 5 cm apart across a 50 cm sheet.', 'Count how many repetitions are needed and identify the pattern spacing.', 'The pattern requires 10 evenly spaced cuts, each 2 cm deep and 1 cm wide.', 'Note both the spacing between cuts and the dimensions of each cut.'),
          ('code', 'Write a loop that positions the cutter at each notch location using a counter variable.', 'A for loop can count from 0 to 9, with each position at counter times 5 cm.', 'The loop correctly generates all 10 cut positions from 0 cm to 45 cm.', 'Make sure the loop counter starts at 0 and the position calculation uses multiplication.'),
          ('code', 'Add conditional logic inside the loop to make every third cut deeper for structural folding points.', 'Use the modulo operator to check if the counter is divisible by 3.', 'Cuts at positions 0, 15, and 30 cm are 4 cm deep while others remain 2 cm deep.', 'The modulo operator gives the remainder of division, so counter modulo 3 equals 0 for every third cut.'),
          ('experiment', 'Run the cutting program on a test sheet and verify all cuts match the specified pattern.', 'Compare each cut position and depth to the original specifications.', 'All 10 cuts are precisely positioned and the deeper folding cuts are in the correct locations.', 'If a cut is mispositioned, check the loop arithmetic for off-by-one errors.'),
         ]),
        ('functions-calculator', 'Workshop Measurement Converter', ['cs.functions', 'math.equations'], 20,
         'The Workshop receives materials with measurements in different unit systems and needs a conversion tool.',
         [('code', 'Write a function that converts inches to centimeters by multiplying by 2.54.', 'A function takes an input, processes it, and returns an output.', 'The function correctly converts 12 inches to 30.48 centimeters.', 'Test with known values like 1 inch = 2.54 cm to verify the function.'),
          ('code', 'Write a second function that converts pounds to kilograms by multiplying by 0.4536.', 'Follow the same function structure but with the different conversion factor.', 'The function converts 10 pounds to 4.536 kilograms accurately.', 'Name the function clearly to distinguish it from the length converter.'),
          ('code', 'Create a main function that takes a value, a source unit, and a target unit, then calls the right converter.', 'Use conditional statements to select the correct conversion function.', 'The unified converter handles both length and mass conversions with a single call.', 'Consider what should happen if an unknown unit is provided.'),
          ('experiment', 'Test the converter with a parts order that lists dimensions in inches and weights in pounds.', 'Convert all values and verify they make physical sense.', 'All conversions match the expected metric equivalents for the entire parts order.', 'Cross-check a few conversions manually to confirm the program is accurate.'),
         ]),
        ('bridge-truss', 'Bridge Truss Design', ['engineering.structural-analysis', 'math.pythagorean-theorem'], 22,
         'The Workshop access bridge has failed and a new truss bridge must be designed using triangular structures.',
         [('observe', 'Examine why the old bridge failed by identifying which structural elements gave way.', 'Look for bent, broken, or displaced members in the old bridge debris.', 'The rectangular frame buckled because rectangles deform under load while triangles resist deformation.', 'Notice how the shape of the failed sections relates to their weakness.'),
          ('design', 'Design a Warren truss pattern using alternating triangles across the bridge span.', 'A Warren truss uses diagonal members alternating in direction to form triangles.', 'The Warren truss design distributes load evenly through its triangular web members.', 'Each triangle should share sides with adjacent triangles for maximum rigidity.'),
          ('solve', 'Calculate the length of the diagonal members using the Pythagorean theorem given the bridge height and panel width.', 'If the height is 2 m and panel width is 3 m, the diagonal is the hypotenuse.', 'Each diagonal member must be 3.61 meters, since the square root of 4 + 9 = square root of 13.', 'Use a-squared plus b-squared equals c-squared for each right triangle in the truss.'),
          ('build', 'Construct the truss bridge and test it with progressively heavier loads.', 'Start with light loads and increase gradually to find the maximum safe capacity.', 'The triangulated truss supports five times the load that the old rectangular frame could handle.', 'Listen for creaking or observe deflection as load increases.'),
         ]),
        ('hydraulic-press', 'Hydraulic Press Principles', ['physics.pressure', 'math.equations'], 20,
         'The Workshop hydraulic press needs recalibration and the pressure-force relationship must be verified.',
         [('measure', 'Measure the diameter of the small input piston and the large output piston.', 'Use calipers to measure each piston diameter precisely in centimeters.', 'The input piston has a diameter of 2 cm and the output piston has a diameter of 10 cm.', 'Measure across the center of each piston for the true diameter.'),
          ('solve', 'Calculate the area of each piston using A = pi times radius squared.', 'The radius is half the diameter.', 'The input area is 3.14 sq cm and the output area is 78.5 sq cm, a ratio of 1:25.', 'Use pi = 3.14159 for the calculation.'),
          ('predict', 'Predict the output force when 20 newtons is applied to the input piston using the area ratio.', 'Force multiplies by the ratio of output area to input area.', 'The predicted output force is 500 newtons, amplifying the 20-newton input by 25 times.', 'The pressure is equal in both cylinders, so F1/A1 = F2/A2.'),
          ('experiment', 'Apply 20 newtons to the input and measure the output force to verify the hydraulic principle.', 'Use a force gauge on the output piston to measure the actual force.', 'The measured output of 490 newtons closely matches the predicted 500, confirming the hydraulic principle.', 'Small differences are due to friction in the seals and fluid compressibility.'),
         ]),
        ('weight-distribution', 'Load Distribution Analysis', ['physics.forces', 'math.equations'], 18,
         'A heavy machine must be placed on the Workshop floor without exceeding the maximum weight per support post.',
         [('measure', 'Weigh the machine and count the number of support posts available.', 'The total weight must be shared across all support posts equally.', 'The machine weighs 1,200 newtons and rests on 4 support posts.', 'Include the weight of the support platform in the total.'),
          ('solve', 'Calculate the force on each post assuming even weight distribution.', 'Divide the total weight by the number of posts.', 'Each post carries 300 newtons, which is within the 400-newton maximum for each post.', 'This assumes the machine center of gravity is exactly centered over the posts.'),
          ('predict', 'Predict what happens if the machine is placed off-center so one pair of posts carries 60 percent of the weight.', 'If weight shifts to one side, those posts carry more than the average.', 'The loaded pair would carry 360 newtons each while the other pair carries only 240 newtons each.', 'Multiply total weight by the percentage each pair carries, then divide by posts per pair.'),
          ('design', 'Design a spreader plate that ensures even weight distribution regardless of machine placement.', 'A rigid plate distributes point loads across its entire surface area.', 'The spreader plate keeps all posts within safe limits even when the machine is offset.', 'Make the plate large enough to span all four posts with overhang.'),
         ]),
        ('pendulum-period', 'Pendulum Timing System', ['physics.forces', 'math.equations'], 20,
         'The Workshop clock uses a pendulum that has drifted off time and needs length adjustments to correct the period.',
         [('measure', 'Time ten full swings of the current pendulum and calculate the period of one swing.', 'One full swing is from one side to the other and back.', 'Ten swings take 25 seconds, giving a period of 2.5 seconds per swing.', 'Timing ten swings and dividing reduces measurement error.'),
          ('solve', 'Use the pendulum formula T = 2 pi times the square root of L over g to find the current length.', 'Rearrange to L = g times (T divided by 2 pi) squared.', 'The current pendulum length is 1.55 meters based on the measured period.', 'Use g = 9.8 meters per second squared for gravitational acceleration.'),
          ('solve', 'Calculate what length the pendulum needs to be for an exact 2.0 second period.', 'Substitute T = 2.0 into the formula and solve for L.', 'The target length is 0.994 meters, about 1 meter, for a perfect 2-second period.', 'Plug in the values carefully and simplify step by step.'),
          ('experiment', 'Adjust the pendulum to the calculated length and verify the period with a timing test.', 'Shorten the pendulum to the new length and time ten swings again.', 'The adjusted pendulum completes ten swings in 20.0 seconds, confirming a 2.0-second period.', 'Fine-tune the length if the period is close but not exactly 2.0 seconds.'),
         ]),
        ('proportional-mixing', 'Alloy Proportions', ['math.proportions', 'engineering.materials-science'], 18,
         'The Workshop needs to mix a specific bronze alloy with exact proportions of copper and tin.',
         [('solve', 'Calculate the masses of copper and tin needed for a 12 kg batch of 88 percent copper, 12 percent tin bronze.', 'Multiply the total mass by each percentage expressed as a decimal.', 'The batch needs 10.56 kg of copper and 1.44 kg of tin.', 'Convert percentages to decimals by dividing by 100 before multiplying.'),
          ('measure', 'Weigh out the calculated amounts of copper and tin using the precision balance.', 'Tare the container before adding each metal.', 'Both metals are weighed to within 10 grams of the calculated amounts.', 'Double-check the balance reads zero before each measurement.'),
          ('mix', 'Combine the metals in the crucible at the correct melting temperature for bronze.', 'Bronze melts at about 950 degrees C; add tin to molten copper.', 'The metals combine into a uniform bronze alloy with the characteristic golden color.', 'Stir the molten mixture to ensure complete and even mixing.'),
          ('experiment', 'Test the hardness and color of the cast alloy against the Workshop reference samples.', 'Compare the hardness using the Workshop indentation tester.', 'The alloy matches the reference bronze in both hardness and color, confirming correct proportions.', 'If hardness differs, the tin percentage may need slight adjustment.'),
         ]),
        ('coordinate-layout', 'Workshop Floor Coordinate System', ['math.coordinate-geometry', 'engineering.design-process'], 18,
         'New equipment must be placed on the Workshop floor using a coordinate grid system for precise positioning.',
         [('design', 'Set up a coordinate system with the origin at the Workshop entrance and axes along the walls.', 'The x-axis runs along the front wall and the y-axis goes toward the back.', 'The coordinate grid covers the full 12 by 8 meter Workshop with 1-meter grid squares.', 'Label the axes with distance markers at each meter.'),
          ('place', 'Position the drill press at coordinates (3, 5) and the lathe at (8, 2) on the grid.', 'Walk to the x-value along the front wall, then turn and walk the y-value toward the back.', 'Both machines are placed precisely at their designated coordinates.', 'Count grid squares carefully from the origin to reach the correct position.'),
          ('solve', 'Calculate the distance between the drill press and lathe using the distance formula.', 'Distance = square root of (x2-x1) squared + (y2-y1) squared.', 'The machines are exactly the square root of 34, or about 5.83 meters apart.', 'Subtract the coordinates: (8-3) = 5 and (2-5) = -3, then apply the formula.'),
          ('solve', 'Find the midpoint between the two machines as the ideal location for a shared tool rack.', 'Midpoint = ((x1+x2)/2, (y1+y2)/2).', 'The tool rack should go at (5.5, 3.5), centered between both machines.', 'Average the x-coordinates and average the y-coordinates separately.'),
         ]),
        ('probability-quality', 'Quality Control Probability', ['math.probability', 'math.statistics'], 18,
         'The Workshop produces batches of parts and needs a quality inspection system based on probability.',
         [('count', 'Inspect a batch of 100 parts and count how many have defects.', 'Examine each part against the specification standards.', 'Out of 100 parts, 6 have defects: 3 are oversized, 2 are cracked, and 1 has a surface flaw.', 'Check every part, even ones that look fine at first glance.'),
          ('solve', 'Calculate the probability of randomly selecting a defective part from the batch.', 'Probability = number of defective parts divided by total parts.', 'The probability of selecting a defective part is 6 out of 100, or 0.06 (6 percent).', 'Express the probability as both a fraction and a decimal.'),
          ('predict', 'Predict how many defective parts to expect in a production run of 500 parts.', 'Multiply the probability by the total production.', 'At a 6 percent defect rate, expect about 30 defective parts in 500.', 'This prediction assumes the defect rate stays constant across the full run.'),
          ('solve', 'Calculate the probability of randomly selecting two defective parts in a row from the batch.', 'For sequential events without replacement, multiply probabilities and adjust for the changing total.', 'The probability is (6/100) times (5/99), approximately 0.003 or 0.3 percent.', 'After removing one defective part, both the numerator and denominator change for the second draw.'),
         ]),
        ('statistics-production', 'Production Data Analysis', ['math.statistics', 'math.percentages'], 18,
         'The Workshop tracks daily production counts and needs statistical analysis to optimize scheduling.',
         [('collect', 'Gather the daily production counts for the past two weeks: 45, 52, 48, 38, 55, 42, 50, 47, 53, 44.', 'Record each day count in order.', 'All ten production counts are recorded and ready for analysis.', 'Make sure no days are skipped or double-counted.'),
          ('solve', 'Calculate the mean, median, and mode of the production data.', 'Mean = sum divided by count; median = middle value when sorted; mode = most frequent value.', 'The mean is 47.4 parts per day, the median is 47.5, and no mode exists since all values are unique.', 'Sort the data first to find the median easily.'),
          ('solve', 'Calculate the range and determine if any days had unusually low or high production.', 'Range = maximum minus minimum; look for values far from the mean.', 'The range is 17 (from 38 to 55), with the 38-part day standing out as unusually low.', 'Values more than 1.5 times the interquartile range from the quartiles are considered outliers.'),
          ('predict', 'Use the mean to predict next month total production and calculate a confidence range.', 'Multiply the daily mean by the number of working days.', 'At 47.4 parts per day over 22 working days, expect about 1,043 parts next month.', 'The range of daily values suggests actual production could vary.'),
         ]),
        ('machine-fragment-power', 'Machine Fragment: The Power Core', ['physics.work-energy', 'engineering.mechanisms'], 22,
         'An ancient machine fragment with a mysterious power core has been unearthed beneath the Workshop floor.', True),
        ('machine-fragment-drive', 'Machine Fragment: The Drive Mechanism', ['engineering.mechanisms', 'math.ratios'], 22,
         'A complex gear mechanism from the ancient machines has been discovered embedded in the Workshop wall.', True),
        ('machine-fragment-frame', 'Machine Fragment: Structural Frame', ['engineering.structural-analysis', 'physics.forces'], 22,
         'An impossibly strong structural frame fragment was found during Workshop renovations.', True),
        ('machine-fragment-circuit', 'Machine Fragment: Circuit Board', ['physics.circuits', 'math.equations'], 22,
         'A circuit board of unknown origin was uncovered in the Workshop foundation with patterns unlike anything modern.', True),
        ('machine-fragment-alloy', 'Machine Fragment: Unknown Alloy', ['engineering.materials-science', 'chemistry.elements'], 22,
         'A metal sample from the ancient machines defies classification with properties no known alloy possesses.', True),
        ('machine-fragment-spring', 'Machine Fragment: Resonant Spring', ['physics.forces', 'math.linear-functions'], 22,
         'A spring mechanism from the ancient machines vibrates at a frequency that matches no natural harmonic.', True),
        ('machine-fragment-balance', 'Machine Fragment: Perfect Balance', ['physics.forces', 'math.equations'], 22,
         'A balancing mechanism from the ancient machines maintains equilibrium despite appearing asymmetric.', True),
    ]
    # Flesh out story quests with actual steps
    fleshed = []
    for q in fleshed_quests:
        fleshed.append(q)
    # Actually, define story quest steps inline above. Let me restructure.
    result = []
    for q in fleshed_quests:
        if len(q) > 6 and q[6] and len(q[5]) == 0:
            # Need to add steps to story quests
            pass
        else:
            result.append(q)
    return result

# Placeholder - will replace with proper approach
fleshed_quests = []
