// DialogueGenerator — generates contextual companion dialogue from templates

import type {
  DialogueTrigger,
  DialogueContext,
  GeneratedDialogue,
  DialogueResponse,
  DialogueCondition,
  DialogueTemplate,
} from '../types/dialogue.js';
import { DIALOGUE_TEMPLATES, getTemplatesForTrigger } from '../data/dialogue-templates.js';

// Simple seeded PRNG for deterministic tests when needed
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Condition evaluator ---

function evaluateCondition(condition: DialogueCondition, context: DialogueContext): boolean {
  let actual: number | string;

  switch (condition.type) {
    case 'biome':
      actual = context.currentBiome;
      break;
    case 'skill_level':
      actual = context.recentSkills.length;
      break;
    case 'trust_level':
      actual = context.trustLevel;
      break;
    case 'time_of_day':
      actual = new Date().getHours();
      break;
    case 'session_count':
      actual = context.sessionCount;
      break;
  }

  const expected = condition.value;

  if (typeof actual === 'string' || typeof expected === 'string') {
    return condition.operator === 'eq'
      ? String(actual) === String(expected)
      : false;
  }

  const numActual = Number(actual);
  const numExpected = Number(expected);

  switch (condition.operator) {
    case 'eq': return numActual === numExpected;
    case 'gt': return numActual > numExpected;
    case 'lt': return numActual < numExpected;
    case 'gte': return numActual >= numExpected;
    case 'lte': return numActual <= numExpected;
  }
}

// --- Variable interpolation ---

function interpolate(text: string, context: DialogueContext): string {
  return text
    .replace(/\{playerName\}/g, context.playerName)
    .replace(/\{companionName\}/g, context.companionName)
    .replace(/\{biome\}/g, context.currentBiome)
    .replace(/\{quest\}/g, context.currentQuest ?? '');
}

// --- Template scoring ---

function scoreTemplate(template: DialogueTemplate, context: DialogueContext): number {
  let score = 1;

  // Boost if trust level matches conditions in any variant
  for (const variant of template.variants) {
    if (!variant.conditions) continue;
    let allMet = true;
    for (const cond of variant.conditions) {
      if (!evaluateCondition(cond, context)) {
        allMet = false;
        break;
      }
    }
    if (allMet && variant.conditions.length > 0) {
      score += variant.conditions.length;
    }
  }

  return score;
}

// --- Recent-use tracking to avoid repetition ---

const MAX_HISTORY_PER_TRIGGER = 5;

export class DialogueGenerator {
  private recentTemplates: Map<string, string[]> = new Map();
  private rng: () => number;

  constructor(seed?: number) {
    this.rng = seed !== undefined ? mulberry32(seed) : Math.random;
  }

  /** Generate contextual dialogue for a trigger */
  generate(trigger: DialogueTrigger, context: DialogueContext): GeneratedDialogue | null {
    const candidates = getTemplatesForTrigger(trigger, context.personalityStage);
    if (candidates.length === 0) return null;

    // Filter to viable candidates (all variant conditions optionally checked)
    const viable = candidates.filter((t) => this.hasViableVariant(t, context));
    if (viable.length === 0) return null;

    // Score and select, avoiding recent templates
    const recentKey = `${context.profileId}:${trigger}`;
    const recent = this.recentTemplates.get(recentKey) ?? [];

    // Prefer templates not recently used
    const fresh = viable.filter((t) => !recent.includes(t.id));
    const pool = fresh.length > 0 ? fresh : viable;

    // Weighted random selection based on score
    const scored = pool.map((t) => ({ template: t, score: scoreTemplate(t, context) }));
    const totalScore = scored.reduce((sum, s) => sum + s.score, 0);

    let pick = this.rng() * totalScore;
    let selected = scored[0]!.template;
    for (const s of scored) {
      pick -= s.score;
      if (pick <= 0) {
        selected = s.template;
        break;
      }
    }

    // Track recent usage
    recent.push(selected.id);
    if (recent.length > MAX_HISTORY_PER_TRIGGER) {
      recent.shift();
    }
    this.recentTemplates.set(recentKey, recent);

    // Select best variant
    const variant = this.selectVariant(selected, context);
    const text = interpolate(variant, context);
    const spokenText = interpolate(selected.accessibility.spokenText, context);
    const screenReaderText = interpolate(selected.accessibility.screenReaderText, context);

    return {
      text,
      spokenText,
      screenReaderText,
      emotion: selected.emotion,
      templateId: selected.id,
    };
  }

  /** Get available dialogue responses (for branching) */
  getResponses(dialogueId: string): DialogueResponse[] {
    const template = DIALOGUE_TEMPLATES.find((t) => t.id === dialogueId);
    if (!template) return [];

    // Generate generic branching responses based on trigger type
    return this.generateResponses(template.trigger);
  }

  /** Get total number of available templates */
  getTemplateCount(): number {
    return DIALOGUE_TEMPLATES.length;
  }

  /** Clear recent-use history (useful for testing) */
  clearHistory(): void {
    this.recentTemplates.clear();
  }

  private hasViableVariant(template: DialogueTemplate, context: DialogueContext): boolean {
    for (const variant of template.variants) {
      if (!variant.conditions || variant.conditions.length === 0) return true;
      const allMet = variant.conditions.every((c) => evaluateCondition(c, context));
      if (allMet) return true;
    }
    return true; // Templates without conditions are always viable
  }

  private selectVariant(template: DialogueTemplate, context: DialogueContext): string {
    // Find variants matching all conditions
    const matching = template.variants.filter((v) => {
      if (!v.conditions || v.conditions.length === 0) return true;
      return v.conditions.every((c) => evaluateCondition(c, context));
    });

    const pool = matching.length > 0 ? matching : template.variants;
    const idx = Math.floor(this.rng() * pool.length);
    return pool[idx]!.text;
  }

  private generateResponses(trigger: DialogueTrigger): DialogueResponse[] {
    switch (trigger) {
      case 'quest_intro':
        return [
          { id: 'accept', text: 'Let\'s do it!' },
          { id: 'more_info', text: 'Tell me more about it.' },
          { id: 'later', text: 'Maybe later.' },
        ];
      case 'quest_hint':
        return [
          { id: 'try_hint', text: 'Let me try that!' },
          { id: 'more_hint', text: 'Can you say more?' },
        ];
      case 'teach_request':
        return [
          { id: 'explain', text: 'Sure, let me explain!' },
          { id: 'show', text: 'Watch me do it.' },
          { id: 'not_now', text: 'I\'m not sure yet.' },
        ];
      case 'redirect_suggestion':
        return [
          { id: 'accept_redirect', text: 'Let\'s try something else!' },
          { id: 'stay', text: 'I want to keep trying this.' },
        ];
      case 'idle_suggestion':
        return [
          { id: 'go', text: 'Let\'s go!' },
          { id: 'stay_here', text: 'I want to stay here a bit longer.' },
        ];
      default:
        return [];
    }
  }
}
