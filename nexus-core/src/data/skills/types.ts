// Skill tree node types and builder utilities for generating the 11,400-node
// curriculum prerequisite graph. Helpers keep per-subject files compact.

import type { MasteryTier } from '../../types/components.js';
export type { MasteryTier } from '../../types/components.js';

/** Full skill node with curriculum metadata. */
export interface SkillNode {
  id: string;
  name: string;
  subject: string;
  tier: MasteryTier;
  requires: string[];
  description: string;
  biomes: string[];
}

// Compact tuple: [suffix, name, prereq-suffixes | full-ids, description]
// When prereq starts with the same prefix it's treated as a suffix, otherwise full ID.
export type SkillTuple = [string, string, string[], string];

// ---------------------------------------------------------------------------
// Builder helpers
// ---------------------------------------------------------------------------

/**
 * Build skill entries from compact tuples scoped to a prefix/subject/tier/biomes.
 * Prerequisite strings that don't contain '.' are treated as suffixes under `prefix`.
 */
export function topic(
  prefix: string,
  subject: string,
  tier: MasteryTier,
  biomes: string[],
  skills: SkillTuple[],
): SkillNode[] {
  return skills.map(([suffix, name, reqs, desc]) => ({
    id: `${prefix}.${suffix}`,
    name,
    subject,
    tier,
    requires: reqs.map(r => (r.includes('.') ? r : `${prefix}.${r}`)),
    description: desc,
    biomes,
  }));
}

/** Convenience: build a single standalone skill. */
export function skill(
  id: string,
  name: string,
  subject: string,
  tier: MasteryTier,
  requires: string[],
  description: string,
  biomes: string[],
): SkillNode {
  return { id, name, subject, tier, requires, description, biomes };
}

/**
 * Build a linear chain where each skill requires the previous one.
 * The first skill's prerequisites come from `entryReqs`.
 */
export function chain(
  prefix: string,
  subject: string,
  tier: MasteryTier,
  biomes: string[],
  steps: Array<[string, string, string]>, // [suffix, name, desc]
  entryReqs: string[] = [],
): SkillNode[] {
  const result: SkillNode[] = [];
  let prev: string | undefined;
  for (const [suffix, name, desc] of steps) {
    const id = `${prefix}.${suffix}`;
    result.push({
      id,
      name,
      subject,
      tier,
      requires: prev ? [prev] : entryReqs,
      description: desc,
      biomes,
    });
    prev = id;
  }
  return result;
}

/**
 * Build skills that all share the same prerequisites (fan-out).
 */
export function parallel(
  prefix: string,
  subject: string,
  tier: MasteryTier,
  biomes: string[],
  requires: string[],
  items: Array<[string, string, string]>, // [suffix, name, desc]
): SkillNode[] {
  return items.map(([suffix, name, desc]) => ({
    id: `${prefix}.${suffix}`,
    name,
    subject,
    tier,
    requires,
    description: desc,
    biomes,
  }));
}

/**
 * Expand a template across a list of instances to produce N skills.
 * Useful for repeated patterns like "X with fractions", "X with decimals", etc.
 */
export function expand(
  prefix: string,
  subject: string,
  tier: MasteryTier,
  biomes: string[],
  requires: string[],
  template: string, // name template with {item}
  descTemplate: string,
  items: Array<[string, string]>, // [suffix-fragment, display-name]
): SkillNode[] {
  return items.map(([sfx, display]) => ({
    id: `${prefix}.${sfx}`,
    name: template.replace('{item}', display),
    subject,
    tier,
    requires,
    description: descTemplate.replace('{item}', display),
    biomes,
  }));
}
