// Procedural Quest Engine — Template-based generation with anti-repetition
// Generates varied, meaningful quests from parameterized templates.
// Anti-repetition ensures no mechanic+biome repeats within window.

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { MasteryTier } from '../types/components.js';
import type {
  QuestMechanic, QuestTemplate, GenerationCriteria,
  GeneratedQuest, GeneratedQuestContent, GeneratedQuestStep,
  MechanicUsageRecord,
} from '../types/procedural.js';
import { QUEST_MECHANICS } from '../types/procedural.js';
import { QUEST_TEMPLATES } from '../data/quest-templates.js';

// ─── Anti-Repetition Tracker ─────────────────────────────────────────────────

const HISTORY_SIZE = 20;
const SAME_MECHANIC_BIOME_WINDOW = 5;
const SAME_MECHANIC_WINDOW = 8;
const SAME_MECHANIC_MAX_IN_WINDOW = 2;
const PREFER_FRESH_WINDOW = 10;
const MULTI_STEP_WINDOW = 3;

export class AntiRepetitionTracker {
  private history: Map<string, MechanicUsageRecord[]> = new Map();

  /** Record that a mechanic+context was used */
  record(
    profileId: string,
    mechanic: QuestMechanic,
    biome: string,
    skills: string[],
    stepCount: number,
  ): void {
    const records = this.getHistory(profileId);
    records.push({
      mechanic,
      biome,
      skills,
      stepCount,
      timestamp: new Date().toISOString(),
    });

    // Keep only last HISTORY_SIZE records
    if (records.length > HISTORY_SIZE) {
      records.splice(0, records.length - HISTORY_SIZE);
    }
    this.history.set(profileId, records);
  }

  /** Check if this mechanic+biome combo would feel repetitive */
  wouldRepeat(profileId: string, mechanic: QuestMechanic, biome: string): boolean {
    const records = this.getHistory(profileId);

    // Rule 1: Never repeat same mechanic+biome within last 5
    const recentWindow = records.slice(-SAME_MECHANIC_BIOME_WINDOW);
    if (recentWindow.some(r => r.mechanic === mechanic && r.biome === biome)) {
      return true;
    }

    // Rule 2: Never repeat same mechanic 3x in last 8
    const mechanicWindow = records.slice(-SAME_MECHANIC_WINDOW);
    const mechanicCount = mechanicWindow.filter(r => r.mechanic === mechanic).length;
    if (mechanicCount >= SAME_MECHANIC_MAX_IN_WINDOW) {
      return true;
    }

    return false;
  }

  /** Check if last N quests were all multi-step (structural variety) */
  shouldPreferSimple(profileId: string): boolean {
    const records = this.getHistory(profileId);
    const recent = records.slice(-MULTI_STEP_WINDOW);
    return recent.length >= MULTI_STEP_WINDOW && recent.every(r => r.stepCount > 1);
  }

  /** Get mechanics to AVOID for this player right now */
  getAvoidList(profileId: string): QuestMechanic[] {
    const avoid: Set<QuestMechanic> = new Set();
    const records = this.getHistory(profileId);

    // Avoid mechanics that appear in the mechanic window too often
    const mechanicWindow = records.slice(-SAME_MECHANIC_WINDOW);
    const counts = new Map<QuestMechanic, number>();
    for (const r of mechanicWindow) {
      counts.set(r.mechanic, (counts.get(r.mechanic) ?? 0) + 1);
    }
    for (const [mechanic, count] of counts) {
      if (count >= SAME_MECHANIC_MAX_IN_WINDOW) {
        avoid.add(mechanic);
      }
    }

    return [...avoid];
  }

  /** Get mechanics not used recently (prefer these) */
  getFreshMechanics(profileId: string): QuestMechanic[] {
    const records = this.getHistory(profileId);
    const recentMechanics = new Set(
      records.slice(-PREFER_FRESH_WINDOW).map(r => r.mechanic),
    );

    return QUEST_MECHANICS.filter(m => !recentMechanics.has(m));
  }

  /** Get the full history for a profile */
  getHistory(profileId: string): MechanicUsageRecord[] {
    if (!this.history.has(profileId)) {
      this.history.set(profileId, []);
    }
    return this.history.get(profileId)!;
  }

  /** Clear history for a profile */
  clearHistory(profileId: string): void {
    this.history.delete(profileId);
  }
}

// ─── Procedural Quest Generator ──────────────────────────────────────────────

// Simple seeded PRNG for deterministic but varied selection
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7FFFFFFF;
    return state / 0x7FFFFFFF;
  };
}

export class ProceduralQuestGenerator implements System {
  readonly name = 'procedural-quest';
  readonly priority = 22;

  private tracker = new AntiRepetitionTracker();
  private questCounter = 0;

  /** Access the anti-repetition tracker */
  getTracker(): AntiRepetitionTracker {
    return this.tracker;
  }

  update(_world: World, _dt: number): void {
    // Quest generation is on-demand, not tick-driven
  }

  /** Generate a single quest for a player */
  generate(profileId: string, criteria: GenerationCriteria): GeneratedQuest | null {
    const template = this.selectTemplate(profileId, criteria);
    if (!template) return null;

    const quest = this.instantiateTemplate(template, profileId, criteria);

    // Record for anti-repetition
    this.tracker.record(
      profileId,
      template.mechanic,
      quest.biome,
      quest.skillsTaught,
      template.structure.steps.length,
    );

    return quest;
  }

  /** Generate multiple quest options for a player */
  generateOptions(profileId: string, count: number, criteria?: GenerationCriteria): GeneratedQuest[] {
    const options: GeneratedQuest[] = [];
    const usedTemplates = new Set<string>();
    const baseCriteria = criteria ?? {};

    for (let i = 0; i < count * 3 && options.length < count; i++) {
      const template = this.selectTemplate(profileId, baseCriteria, usedTemplates);
      if (!template) break;

      usedTemplates.add(template.id);
      const quest = this.instantiateTemplate(template, profileId, baseCriteria);
      options.push(quest);
    }

    return options;
  }

  /** Record a quest completion for anti-repetition tracking */
  recordCompletion(
    profileId: string,
    mechanic: QuestMechanic,
    biome: string,
    skills: string[],
    stepCount: number,
  ): void {
    this.tracker.record(profileId, mechanic, biome, skills, stepCount);
  }

  // ─── Template Selection ──────────────────────────────────────────────────

  private selectTemplate(
    profileId: string,
    criteria: GenerationCriteria,
    excludeIds?: Set<string>,
  ): QuestTemplate | null {
    let candidates = [...QUEST_TEMPLATES];

    // Filter by tier if we can infer it from criteria
    if (criteria.difficulty !== undefined) {
      const tier = this.difficultyToTier(criteria.difficulty);
      candidates = candidates.filter(t => t.tier.includes(tier));
    }

    // Filter by biome
    if (criteria.biome) {
      candidates = candidates.filter(
        t => t.biomes.includes('any') || t.biomes.includes(criteria.biome!),
      );
    }

    // Filter by mechanic
    if (criteria.mechanic) {
      candidates = candidates.filter(t => t.mechanic === criteria.mechanic);
    }

    // Filter by target skills
    if (criteria.targetSkills && criteria.targetSkills.length > 0) {
      candidates = candidates.filter(t =>
        t.skillSlots.some(s =>
          criteria.targetSkills!.some(ts => s.category.startsWith(ts)),
        ),
      );
    }

    // Exclude already-used templates in this batch
    if (excludeIds && excludeIds.size > 0) {
      candidates = candidates.filter(t => !excludeIds.has(t.id));
    }

    // Filter by anti-repetition
    const avoidMechanics = new Set(this.tracker.getAvoidList(profileId));
    const preferSimple = this.tracker.shouldPreferSimple(profileId);

    // Prefer fresh mechanics
    const freshMechanics = new Set(this.tracker.getFreshMechanics(profileId));

    // Score candidates
    const scored = candidates.map(t => {
      let score = 1.0;

      // Penalize avoided mechanics
      if (avoidMechanics.has(t.mechanic)) {
        score *= 0.1;
      }

      // Check biome-specific repetition
      const biome = criteria.biome ?? t.biomes[0] ?? 'workshop';
      if (this.tracker.wouldRepeat(profileId, t.mechanic, biome)) {
        score *= 0.05;
      }

      // Boost fresh mechanics
      if (freshMechanics.has(t.mechanic)) {
        score *= 2.0;
      }

      // Prefer simple quests if recent ones were all multi-step
      if (preferSimple && t.structure.steps.length === 1) {
        score *= 1.5;
      } else if (preferSimple && t.structure.steps.length > 2) {
        score *= 0.5;
      }

      // Boost review quests if includeReview is set
      if (criteria.includeReview && t.skillSlots.some(s => s.role === 'review')) {
        score *= 1.5;
      }

      // Avoid skills the player is frustrated with
      if (criteria.avoidSkills && criteria.avoidSkills.length > 0) {
        const hasAvoidSkill = t.skillSlots.some(
          s => criteria.avoidSkills!.some(as => s.category.startsWith(as)),
        );
        if (hasAvoidSkill) {
          score *= 0.1;
        }
      }

      return { template: t, score };
    });

    // Filter to only viable candidates (score > 0)
    const viable = scored.filter(s => s.score > 0);
    if (viable.length === 0) return null;

    // Weighted random selection
    const totalScore = viable.reduce((sum, s) => sum + s.score, 0);
    const seed = Date.now() + this.questCounter;
    const rng = seededRandom(seed);
    let roll = rng() * totalScore;

    for (const candidate of viable) {
      roll -= candidate.score;
      if (roll <= 0) {
        return candidate.template;
      }
    }

    // Fallback to highest-scored
    viable.sort((a, b) => b.score - a.score);
    return viable[0]?.template ?? null;
  }

  // ─── Template Instantiation ──────────────────────────────────────────────

  private instantiateTemplate(
    template: QuestTemplate,
    _profileId: string,
    criteria: GenerationCriteria,
  ): GeneratedQuest {
    this.questCounter++;
    const questId = `pq-${template.id}-${this.questCounter}`;

    // Determine biome
    const biome = criteria.biome ?? template.biomes.find(b => b !== 'any') ?? 'workshop';

    // Determine tier
    const tier: MasteryTier = criteria.difficulty !== undefined
      ? this.difficultyToTier(criteria.difficulty)
      : template.tier[0] ?? 'foundation';

    // Build skills lists
    const skillsRequired = template.skillSlots
      .filter(s => s.minLevel > 0)
      .map(s => s.category);
    const skillsTaught = template.skillSlots
      .filter(s => s.teaches)
      .map(s => s.category);

    // Substitute variables in text
    const vars: Record<string, string> = {
      '{playerName}': 'Explorer',
      '{companionName}': 'Companion',
      '{biome}': biome.replace(/-/g, ' '),
      '{skill}': skillsTaught[0] ?? 'knowledge',
    };

    const substituteVars = (text: string): string => {
      let result = text;
      for (const [key, value] of Object.entries(vars)) {
        result = result.replaceAll(key, value);
      }
      return result;
    };

    // Build steps
    const steps: GeneratedQuestStep[] = template.structure.steps.map((step, index) => ({
      index,
      instruction: substituteVars(step.instruction),
      spokenInstruction: substituteVars(step.spokenInstruction),
      screenReaderText: substituteVars(step.screenReaderText),
      companionRepeat: substituteVars(step.spokenInstruction),
      objectiveType: step.objectiveType,
      hints: step.hints.map(substituteVars),
      successResponse: substituteVars(step.successResponse),
      failureResponse: substituteVars(step.failureResponse),
    }));

    const content: GeneratedQuestContent = {
      description: `${template.name} — ${substituteVars(template.structure.companionIntro)}`,
      steps,
      companionIntro: substituteVars(template.structure.companionIntro),
      companionOutro: substituteVars(template.structure.companionOutro),
      estimatedMinutes: template.structure.estimatedMinutes,
    };

    return {
      id: questId,
      templateId: template.id,
      title: template.name,
      biome,
      masteryTier: tier,
      mechanic: template.mechanic,
      skillsRequired,
      skillsTaught,
      content,
    };
  }

  private difficultyToTier(difficulty: number): MasteryTier {
    if (difficulty < 0.2) return 'foundation';
    if (difficulty < 0.4) return 'discovery';
    if (difficulty < 0.6) return 'builder';
    if (difficulty < 0.8) return 'innovator';
    return 'creator';
  }
}
