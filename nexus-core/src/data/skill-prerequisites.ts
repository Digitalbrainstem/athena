// Skill prerequisite tree for gap detection
// Maps each skill to its required prerequisite skills.
// The mastery system traverses this tree to identify knowledge gaps.

export interface SkillNode {
  id: string;
  name: string;
  tier: string;
  prerequisites: string[];
}

/** Complete skill prerequisite map. */
export const SKILL_PREREQUISITES: Record<string, string[]> = {
  // --- Math ---
  'math.counting': [],
  'math.number-sense': ['math.counting'],
  'math.shapes': [],
  'math.patterns': ['math.counting'],
  'math.size-comparison': ['math.counting'],
  'math.sorting': ['math.counting', 'math.size-comparison'],
  'math.arithmetic': ['math.counting', 'math.number-sense'],
  'math.geometry': ['math.shapes', 'math.arithmetic'],
  'math.algebra': ['math.arithmetic'],
  'math.trigonometry': ['math.geometry', 'math.algebra'],
  'math.calculus': ['math.algebra', 'math.trigonometry'],

  // --- Science ---
  'science.observation': [],
  'science.matter': ['science.observation'],
  'science.colors': ['science.observation'],
  'science.weather': ['science.observation'],
  'science.senses': ['science.observation'],
  'science.chemistry': ['math.arithmetic', 'science.matter'],
  'science.physics': ['math.algebra', 'science.matter'],
  'science.geology': ['science.observation', 'science.matter'],
  'science.biology.basics': ['science.observation'],
  'science.biology.ecology': ['science.biology.basics'],
  'science.biology.anatomy': ['science.biology.basics'],

  // --- Language ---
  'language.listening': [],
  'language.vocabulary': ['language.listening'],
  'language.reading': ['language.vocabulary'],
  'language.writing': ['language.reading'],
  'language.grammar': ['language.reading'],

  // --- Engineering ---
  'engineering.basics': ['math.shapes'],
  'engineering.structures': ['math.geometry', 'science.physics'],
  'engineering.circuits': ['math.algebra', 'science.physics'],

  // --- Foundation-specific skills ---
  'spatial.directions': [],
  'spatial.turns': ['spatial.directions'],
  'motor.fine': [],
};

/**
 * Get the direct prerequisites for a skill.
 * Returns an empty array for skills with no prerequisites.
 */
export function getPrerequisites(skillId: string): string[] {
  return SKILL_PREREQUISITES[skillId] ?? [];
}

/**
 * Get ALL transitive prerequisites for a skill (breadth-first).
 * Returns them in bottom-up order (deepest dependencies first).
 */
export function getAllPrerequisites(skillId: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  const queue = [...getPrerequisites(skillId)];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    result.push(current);
    queue.push(...getPrerequisites(current));
  }

  return result;
}

/**
 * Check whether all prerequisites for a skill are met at the given threshold.
 */
export function arePrerequisitesMet(
  skillId: string,
  masteryLevels: Map<string, number>,
  threshold = 0.3,
): boolean {
  const prereqs = getPrerequisites(skillId);
  return prereqs.every((p) => (masteryLevels.get(p) ?? 0) >= threshold);
}

/** Return all skill IDs that have no prerequisites (entry points). */
export function getRootSkills(): string[] {
  return Object.entries(SKILL_PREREQUISITES)
    .filter(([_, prereqs]) => prereqs.length === 0)
    .map(([id]) => id);
}

/** Return all skill IDs that depend directly on the given skill. */
export function getDependents(skillId: string): string[] {
  return Object.entries(SKILL_PREREQUISITES)
    .filter(([_, prereqs]) => prereqs.includes(skillId))
    .map(([id]) => id);
}
