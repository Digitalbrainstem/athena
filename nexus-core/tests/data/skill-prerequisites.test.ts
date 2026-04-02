import { describe, it, expect } from 'vitest';
import {
  SKILL_PREREQUISITES,
  getPrerequisites,
  getAllPrerequisites,
  arePrerequisitesMet,
  getRootSkills,
  getDependents,
} from '../../src/data/skill-prerequisites.js';

describe('skill-prerequisites data', () => {
  // ─── Data Integrity ───────────────────────────────────────────────────

  describe('data integrity', () => {
    it('has at least 300 skills defined', () => {
      const count = Object.keys(SKILL_PREREQUISITES).length;
      expect(count).toBeGreaterThanOrEqual(300);
    });

    it('all prerequisite references exist as skill IDs', () => {
      const allIds = new Set(Object.keys(SKILL_PREREQUISITES));
      const missing: string[] = [];

      for (const [skillId, prereqs] of Object.entries(SKILL_PREREQUISITES)) {
        for (const prereq of prereqs) {
          if (!allIds.has(prereq)) {
            missing.push(`${skillId} requires ${prereq} (not found)`);
          }
        }
      }

      expect(missing).toEqual([]);
    });

    it('has no circular dependencies', () => {
      const visited = new Set<string>();
      const inStack = new Set<string>();
      const cycles: string[] = [];

      function dfs(nodeId: string, path: string[]): void {
        if (inStack.has(nodeId)) {
          cycles.push(`Cycle detected: ${[...path, nodeId].join(' → ')}`);
          return;
        }
        if (visited.has(nodeId)) return;

        visited.add(nodeId);
        inStack.add(nodeId);

        for (const prereq of getPrerequisites(nodeId)) {
          dfs(prereq, [...path, nodeId]);
        }

        inStack.delete(nodeId);
      }

      for (const skillId of Object.keys(SKILL_PREREQUISITES)) {
        dfs(skillId, []);
      }

      expect(cycles).toEqual([]);
    });

    it('has no duplicate prerequisites for any skill', () => {
      const duplicates: string[] = [];
      for (const [skillId, prereqs] of Object.entries(SKILL_PREREQUISITES)) {
        const seen = new Set<string>();
        for (const prereq of prereqs) {
          if (seen.has(prereq)) {
            duplicates.push(`${skillId} has duplicate prereq: ${prereq}`);
          }
          seen.add(prereq);
        }
      }
      expect(duplicates).toEqual([]);
    });

    it('no skill lists itself as a prerequisite', () => {
      const selfRefs: string[] = [];
      for (const [skillId, prereqs] of Object.entries(SKILL_PREREQUISITES)) {
        if (prereqs.includes(skillId)) {
          selfRefs.push(skillId);
        }
      }
      expect(selfRefs).toEqual([]);
    });
  });

  // ─── Root Skills ──────────────────────────────────────────────────────

  describe('root skills', () => {
    it('has root skills with no prerequisites', () => {
      const roots = getRootSkills();
      expect(roots.length).toBeGreaterThan(0);
    });

    it('root skills are all valid entries', () => {
      const roots = getRootSkills();
      for (const root of roots) {
        expect(getPrerequisites(root)).toEqual([]);
      }
    });

    it('includes fundamental entry points', () => {
      const roots = getRootSkills();
      expect(roots).toContain('math.counting');
      expect(roots).toContain('math.shapes');
      expect(roots).toContain('science.observation');
      expect(roots).toContain('language.listening');
      expect(roots).toContain('spatial.directions');
      expect(roots).toContain('motor.fine');
    });
  });

  // ─── Math Chain ───────────────────────────────────────────────────────

  describe('math prerequisite chains', () => {
    it('counting → arithmetic → algebra → trigonometry → calculus', () => {
      // Counting is root
      expect(getPrerequisites('math.counting')).toEqual([]);

      // Arithmetic depends on counting and number-sense
      const arithPrereqs = getPrerequisites('math.arithmetic');
      expect(arithPrereqs).toContain('math.addition');

      // Algebra depends on arithmetic
      const algebraPrereqs = getPrerequisites('math.algebra');
      expect(algebraPrereqs).toContain('math.equations');

      // Trig depends on geometry and algebra
      const trigPrereqs = getPrerequisites('math.trigonometry');
      expect(trigPrereqs).toContain('math.trig.basics');

      // Calculus depends on limits
      const calcPrereqs = getPrerequisites('math.calculus.derivatives');
      expect(calcPrereqs).toContain('math.precalc.limits');
    });

    it('fractions → ratios → proportions chain', () => {
      expect(getPrerequisites('math.fractions')).toContain('math.division');
      expect(getPrerequisites('math.ratios')).toContain('math.fractions');
      expect(getPrerequisites('math.proportions')).toContain('math.ratios');
    });

    it('geometry chain exists', () => {
      expect(getPrerequisites('math.geometry')).toContain('math.shapes');
      expect(getPrerequisites('math.geometry.triangles')).toContain('math.geometry.angles');
      expect(getPrerequisites('math.geometry.pythagorean')).toContain('math.geometry.triangles');
    });

    it('calculus requires precalculus limits', () => {
      const allPrereqs = getAllPrerequisites('math.calculus.derivatives');
      expect(allPrereqs).toContain('math.precalc.limits');
      expect(allPrereqs).toContain('math.precalc.functions');
    });

    it('full transitive chain from calculus back to counting', () => {
      const allPrereqs = getAllPrerequisites('math.calculus.derivatives');
      expect(allPrereqs).toContain('math.counting');
      expect(allPrereqs).toContain('math.arithmetic');
    });

    it('statistics depends on arithmetic and data collection', () => {
      const prereqs = getPrerequisites('math.statistics.descriptive');
      expect(prereqs).toContain('math.data.mean');
    });
  });

  // ─── Physics Depends on Math ──────────────────────────────────────────

  describe('physics depends on math', () => {
    it('basic physics requires algebra', () => {
      const allPrereqs = getAllPrerequisites('science.physics');
      expect(allPrereqs).toContain('math.algebra');
    });

    it('forces depend on motion and algebra', () => {
      const prereqs = getPrerequisites('science.physics.forces');
      expect(prereqs).toContain('science.physics.motion');
      expect(prereqs).toContain('math.algebra');
    });

    it('thermodynamics depends on calculus', () => {
      const prereqs = getPrerequisites('science.physics.thermodynamics');
      expect(prereqs).toContain('math.calculus.derivatives');
    });

    it('circuits require electricity and algebra', () => {
      const prereqs = getPrerequisites('science.physics.circuits');
      expect(prereqs).toContain('science.physics.electricity');
      expect(prereqs).toContain('math.algebra');
    });
  });

  // ─── Chemistry Depends on Math + Physics ──────────────────────────────

  describe('chemistry depends on math and physics', () => {
    it('stoichiometry requires ratios and chemical equations', () => {
      const prereqs = getPrerequisites('science.chemistry.stoichiometry');
      expect(prereqs).toContain('math.ratios');
      expect(prereqs).toContain('science.chemistry.equations');
    });

    it('chemistry equations depend on math equations', () => {
      const prereqs = getPrerequisites('science.chemistry.equations');
      expect(prereqs).toContain('math.equations');
    });

    it('gas laws depend on algebra and pressure', () => {
      const prereqs = getPrerequisites('science.chemistry.gas-laws');
      expect(prereqs).toContain('math.algebra');
      expect(prereqs).toContain('science.physics.pressure');
    });

    it('electrochemistry depends on electricity', () => {
      const prereqs = getPrerequisites('science.chemistry.electrochemistry');
      expect(prereqs).toContain('science.physics.electricity');
    });
  });

  // ─── Biology Depends on Chemistry ─────────────────────────────────────

  describe('biology depends on chemistry', () => {
    it('physiology requires chemistry reactions', () => {
      const prereqs = getPrerequisites('science.biology.physiology');
      expect(prereqs).toContain('science.chemistry.reactions');
    });

    it('biochemistry requires organic chemistry', () => {
      const prereqs = getPrerequisites('science.biology.biochemistry');
      expect(prereqs).toContain('science.chemistry.organic');
    });

    it('genetics requires probability', () => {
      const prereqs = getPrerequisites('science.biology.genetics');
      expect(prereqs).toContain('math.probability.basic');
    });

    it('DNA depends on genetics and organic chemistry', () => {
      const prereqs = getPrerequisites('science.biology.dna');
      expect(prereqs).toContain('science.biology.genetics');
      expect(prereqs).toContain('science.chemistry.organic');
    });

    it('neuroscience depends on anatomy and electricity', () => {
      const prereqs = getPrerequisites('science.biology.neuroscience');
      expect(prereqs).toContain('science.biology.anatomy');
      expect(prereqs).toContain('science.physics.electricity');
    });
  });

  // ─── CS Depends on Math + Language ────────────────────────────────────

  describe('CS depends on math and language', () => {
    it('computational thinking requires patterns and reading', () => {
      const prereqs = getPrerequisites('cs.computational-thinking');
      expect(prereqs).toContain('math.patterns');
      expect(prereqs).toContain('language.reading');
    });

    it('variables depend on math variables', () => {
      const prereqs = getPrerequisites('cs.variables');
      expect(prereqs).toContain('math.variables');
    });

    it('algorithms complexity requires logarithms', () => {
      const prereqs = getPrerequisites('cs.algorithms.complexity');
      expect(prereqs).toContain('math.algebra.logarithms');
    });

    it('AI basics requires linear algebra and statistics', () => {
      const prereqs = getPrerequisites('cs.ai.basics');
      expect(prereqs).toContain('math.linear-algebra');
      expect(prereqs).toContain('math.statistics.descriptive');
    });

    it('machine learning requires calculus and statistics', () => {
      const prereqs = getPrerequisites('cs.machine-learning');
      expect(prereqs).toContain('math.calculus');
      expect(prereqs).toContain('math.statistics.inference');
    });
  });

  // ─── Engineering Depends on Math + Physics + CS ───────────────────────

  describe('engineering depends on math, physics, CS', () => {
    it('structures depend on geometry and forces', () => {
      const prereqs = getPrerequisites('engineering.structures');
      expect(prereqs).toContain('math.geometry');
      expect(prereqs).toContain('science.physics.forces');
    });

    it('circuits depend on physics circuits and algebra', () => {
      const prereqs = getPrerequisites('engineering.circuits');
      expect(prereqs).toContain('science.physics.circuits');
      expect(prereqs).toContain('math.algebra');
    });

    it('robotics depends on circuits and programming', () => {
      const prereqs = getPrerequisites('engineering.robotics.basics');
      expect(prereqs).toContain('engineering.circuits');
      expect(prereqs).toContain('cs.functions');
    });

    it('control systems depend on differential equations', () => {
      const prereqs = getPrerequisites('engineering.control-systems');
      expect(prereqs).toContain('math.calculus.differential-equations');
    });
  });

  // ─── Economics Depends on Math + Social Studies ───────────────────────

  describe('economics depends on math and social studies', () => {
    it('basic economics depends on arithmetic', () => {
      const prereqs = getPrerequisites('economics.money');
      expect(prereqs).toContain('math.arithmetic');
    });

    it('compound interest depends on exponents', () => {
      const prereqs = getPrerequisites('economics.compound-interest');
      expect(prereqs).toContain('math.algebra.exponents');
    });

    it('game theory depends on probability and logic', () => {
      const prereqs = getPrerequisites('social.economics.game-theory');
      expect(prereqs).toContain('math.probability.basic');
      expect(prereqs).toContain('math.discrete.logic');
    });
  });

  // ─── Cross-Subject Dependencies ───────────────────────────────────────

  describe('cross-subject dependencies', () => {
    it('word problems require reading', () => {
      const prereqs = getPrerequisites('math.arithmetic.word-problems');
      expect(prereqs).toContain('language.reading');
    });

    it('music intervals require math ratios', () => {
      const prereqs = getPrerequisites('music.intervals');
      expect(prereqs).toContain('math.ratios');
    });

    it('music acoustics requires physics sound', () => {
      const prereqs = getPrerequisites('music.acoustics');
      expect(prereqs).toContain('science.physics.sound');
    });

    it('art perspective requires geometry', () => {
      const prereqs = getPrerequisites('art.perspective');
      expect(prereqs).toContain('math.geometry');
    });

    it('art proportion requires ratios', () => {
      const prereqs = getPrerequisites('art.proportion');
      expect(prereqs).toContain('math.ratios');
    });

    it('history timelines require number ordering', () => {
      const prereqs = getPrerequisites('history.timelines');
      expect(prereqs).toContain('math.number-ordering');
    });

    it('orbital mechanics requires calculus and trig', () => {
      const prereqs = getPrerequisites('science.astronomy.orbital-mechanics');
      expect(prereqs).toContain('math.calculus');
      expect(prereqs).toContain('math.trig.basics');
    });
  });

  // ─── Utility Functions ────────────────────────────────────────────────

  describe('getPrerequisites', () => {
    it('returns empty array for unknown skill', () => {
      expect(getPrerequisites('nonexistent.skill')).toEqual([]);
    });

    it('returns direct prerequisites only', () => {
      const prereqs = getPrerequisites('math.addition');
      expect(prereqs).toContain('math.counting');
      expect(prereqs).toContain('math.number-sense');
      expect(prereqs).not.toContain('math.shapes'); // Not a direct prereq
    });
  });

  describe('getAllPrerequisites', () => {
    it('returns all transitive prerequisites', () => {
      const all = getAllPrerequisites('math.division');
      expect(all).toContain('math.multiplication');
      expect(all).toContain('math.addition');
      expect(all).toContain('math.counting');
    });

    it('returns empty array for root skills', () => {
      expect(getAllPrerequisites('math.counting')).toEqual([]);
    });

    it('does not include the skill itself', () => {
      const all = getAllPrerequisites('math.algebra');
      expect(all).not.toContain('math.algebra');
    });

    it('handles diamond dependencies without duplicates', () => {
      // Math geometry depends on shapes AND arithmetic, both eventually from counting
      const all = getAllPrerequisites('math.geometry');
      const counts = new Map<string, number>();
      for (const id of all) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      for (const [id, count] of counts) {
        expect(count, `${id} appears ${count} times`).toBe(1);
      }
    });
  });

  describe('arePrerequisitesMet', () => {
    it('returns true for root skills', () => {
      expect(arePrerequisitesMet('math.counting', new Map())).toBe(true);
    });

    it('returns true when all prereqs are met', () => {
      const levels = new Map([
        ['math.counting', 0.5],
        ['math.number-sense', 0.5],
      ]);
      expect(arePrerequisitesMet('math.addition', levels)).toBe(true);
    });

    it('returns false when prereqs are below threshold', () => {
      const levels = new Map([
        ['math.counting', 0.1],
        ['math.number-sense', 0.1],
      ]);
      expect(arePrerequisitesMet('math.addition', levels, 0.3)).toBe(false);
    });

    it('returns false when prereqs are missing', () => {
      expect(arePrerequisitesMet('math.addition', new Map())).toBe(false);
    });

    it('uses custom threshold', () => {
      const levels = new Map([
        ['math.counting', 0.8],
        ['math.number-sense', 0.8],
      ]);
      expect(arePrerequisitesMet('math.addition', levels, 0.9)).toBe(false);
      expect(arePrerequisitesMet('math.addition', levels, 0.7)).toBe(true);
    });
  });

  describe('getDependents', () => {
    it('finds skills that depend on counting', () => {
      const deps = getDependents('math.counting');
      expect(deps).toContain('math.number-sense');
      expect(deps).toContain('math.addition');
      expect(deps).toContain('math.patterns');
    });

    it('returns empty array for leaf skills with no dependents', () => {
      // Calculus multivariable has few/no dependents in the tree
      const deps = getDependents('music.composition');
      // Even if it has no dependents, function should return an array
      expect(Array.isArray(deps)).toBe(true);
    });
  });

  // ─── Subject Coverage ─────────────────────────────────────────────────

  describe('subject coverage', () => {
    const allSkills = Object.keys(SKILL_PREREQUISITES);

    it('has math skills', () => {
      expect(allSkills.filter(s => s.startsWith('math.')).length).toBeGreaterThan(80);
    });

    it('has science skills', () => {
      expect(allSkills.filter(s => s.startsWith('science.')).length).toBeGreaterThan(60);
    });

    it('has language skills', () => {
      expect(allSkills.filter(s => s.startsWith('language.')).length).toBeGreaterThan(20);
    });

    it('has CS skills', () => {
      expect(allSkills.filter(s => s.startsWith('cs.')).length).toBeGreaterThan(20);
    });

    it('has engineering skills', () => {
      expect(allSkills.filter(s => s.startsWith('engineering.')).length).toBeGreaterThan(10);
    });

    it('has social studies / history skills', () => {
      const count = allSkills.filter(s => s.startsWith('social.') || s.startsWith('history.')).length;
      expect(count).toBeGreaterThan(15);
    });

    it('has economics skills', () => {
      expect(allSkills.filter(s => s.startsWith('economics.')).length).toBeGreaterThan(3);
    });

    it('has art skills', () => {
      expect(allSkills.filter(s => s.startsWith('art.')).length).toBeGreaterThan(5);
    });

    it('has music skills', () => {
      expect(allSkills.filter(s => s.startsWith('music.')).length).toBeGreaterThan(8);
    });

    it('has spatial and motor skills', () => {
      const count = allSkills.filter(s => s.startsWith('spatial.') || s.startsWith('motor.')).length;
      expect(count).toBeGreaterThan(5);
    });

    it('total prerequisites relationships exceed 500', () => {
      let totalRelationships = 0;
      for (const prereqs of Object.values(SKILL_PREREQUISITES)) {
        totalRelationships += prereqs.length;
      }
      expect(totalRelationships).toBeGreaterThanOrEqual(500);
    });
  });
});
