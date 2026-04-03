// Calibration Flow — guided first-play experience for new profiles.
//
// When a new profile has no mastery data, the companion leads the player
// through a natural-feeling adventure that is secretly calibration.
// Every interaction feeds the CalibrationSystem's binary search.
//
// Principles enforced:
// - Feels like playing, not a test
// - No scores, no levels, no "assessment" language
// - Companion is enthusiastic and encouraging (never says "good job")
// - 15–20 interactions in ~10 minutes → converged skill profile

import type {
  NexusCore,
  CalibrationSession,
  CalibrationResponse,
  CalibrationNext,
  CalibrationResults,
  Profile,
} from '@nexus-academy/core';
import type { Disposable } from '../types.js';

// ---------------------------------------------------------------------------
// Calibration challenge prompts — disguised as world interactions
// ---------------------------------------------------------------------------

interface ChallengePrompt {
  /** Challenge ID from CalibrationSystem (e.g. 'cal-math-counting') */
  challengeId: string;
  /** What the companion says to introduce this challenge */
  companionIntro: string;
  /** The visible interaction prompt */
  interactionPrompt: string;
  /** Short description for the world scene */
  sceneDescription: string;
}

const CHALLENGE_PROMPTS: Record<string, ChallengePrompt> = {
  // Math
  'cal-math-counting': {
    challengeId: 'cal-math-counting',
    companionIntro: "Look, the machine needs gears to work! Can you put the right number in?",
    interactionPrompt: 'Place gears on the machine',
    sceneDescription: 'A whirring machine with empty gear slots',
  },
  'cal-math-number-sense': {
    challengeId: 'cal-math-number-sense',
    companionIntro: "These crystals are glowing with numbers! I wonder which one is bigger...",
    interactionPrompt: 'Compare the number crystals',
    sceneDescription: 'Glowing crystals with numbers floating above them',
  },
  'cal-math-arithmetic': {
    challengeId: 'cal-math-arithmetic',
    companionIntro: "The door has a lock with a number puzzle! Let me see...",
    interactionPrompt: 'Solve the puzzle lock',
    sceneDescription: 'A puzzle lock on a wooden door',
  },
  'cal-math-fractions': {
    challengeId: 'cal-math-fractions',
    companionIntro: "We need to divide these supplies equally! How should we split them?",
    interactionPrompt: 'Divide the supplies',
    sceneDescription: 'A pile of supplies that need to be shared',
  },
  'cal-math-pre-algebra': {
    challengeId: 'cal-math-pre-algebra',
    companionIntro: "There's a balance scale here... something needs to go on the other side!",
    interactionPrompt: 'Balance the scale',
    sceneDescription: 'A golden balance scale with items on one side',
  },
  'cal-math-algebra': {
    challengeId: 'cal-math-algebra',
    companionIntro: "These runes form an equation! If we figure it out, the door opens...",
    interactionPrompt: 'Decipher the rune equation',
    sceneDescription: 'Ancient runes glowing on a stone door',
  },
  'cal-math-geometry': {
    challengeId: 'cal-math-geometry',
    companionIntro: "A bridge needs building! It has to be the right shape to hold...",
    interactionPrompt: 'Design the bridge shape',
    sceneDescription: 'A gap with building materials for a bridge',
  },
  'cal-math-trigonometry': {
    challengeId: 'cal-math-trigonometry',
    companionIntro: "The catapult needs aiming — what angle do you think?",
    interactionPrompt: 'Aim the catapult',
    sceneDescription: 'A wooden catapult aimed at a distant target',
  },
  'cal-math-calculus': {
    challengeId: 'cal-math-calculus',
    companionIntro: "The water flow changes over time... can you predict where it goes?",
    interactionPrompt: 'Predict the water path',
    sceneDescription: 'A stream flowing through carved channels',
  },

  // Reading
  'cal-read-letters': {
    challengeId: 'cal-read-letters',
    companionIntro: "Ooh, there are letters carved into this stone! Can you find them?",
    interactionPrompt: 'Trace the carved letters',
    sceneDescription: 'A moss-covered stone with letters carved into it',
  },
  'cal-read-phonics': {
    challengeId: 'cal-read-phonics',
    companionIntro: "Listen! The wind chimes are making sounds... what sound is that?",
    interactionPrompt: 'Listen to the wind chimes',
    sceneDescription: 'Musical wind chimes with letter shapes',
  },
  'cal-read-words': {
    challengeId: 'cal-read-words',
    companionIntro: "Can you read what this sign says? I think it's pointing somewhere!",
    interactionPrompt: 'Read the wooden sign',
    sceneDescription: 'A handpainted wooden signpost',
  },
  'cal-read-sentences': {
    challengeId: 'cal-read-sentences',
    companionIntro: "Someone left a message on this scroll! What does it say?",
    interactionPrompt: 'Read the scroll',
    sceneDescription: 'An unrolled parchment scroll with writing',
  },
  'cal-read-paragraphs': {
    challengeId: 'cal-read-paragraphs',
    companionIntro: "There's a whole story written on this wall! Let's see what it tells us...",
    interactionPrompt: 'Read the wall inscription',
    sceneDescription: 'A stone wall covered in inscriptions',
  },
  'cal-read-comprehension': {
    challengeId: 'cal-read-comprehension',
    companionIntro: "A book fell open here! Let's read and figure out what the author meant...",
    interactionPrompt: 'Study the open book',
    sceneDescription: 'A large book open on a pedestal',
  },
  'cal-read-analysis': {
    challengeId: 'cal-read-analysis',
    companionIntro: "Two manuscripts side by side — they seem to tell different versions of the same event...",
    interactionPrompt: 'Compare the manuscripts',
    sceneDescription: 'Two ancient manuscripts side by side',
  },
  'cal-read-critical': {
    challengeId: 'cal-read-critical',
    companionIntro: "This text makes a big claim! Let's think about whether the evidence supports it...",
    interactionPrompt: 'Evaluate the argument',
    sceneDescription: 'A debate podium with a persuasive essay',
  },

  // Science
  'cal-sci-observation': {
    challengeId: 'cal-sci-observation',
    companionIntro: "Whoa, look at that plant! Something interesting is happening...",
    interactionPrompt: 'Observe the glowing plant',
    sceneDescription: 'A bioluminescent plant pulsing with light',
  },
  'cal-sci-classification': {
    challengeId: 'cal-sci-classification',
    companionIntro: "These colored crystals need sorting! Which ones go together?",
    interactionPrompt: 'Sort the crystals',
    sceneDescription: 'A collection of colorful crystals on a table',
  },
  'cal-sci-cause-effect': {
    challengeId: 'cal-sci-cause-effect',
    companionIntro: "Every time I touch this lever, something changes... what do you notice?",
    interactionPrompt: 'Experiment with the lever',
    sceneDescription: 'A mechanical lever connected to a mysterious device',
  },
  'cal-sci-hypothesis': {
    challengeId: 'cal-sci-hypothesis',
    companionIntro: "I have a theory about why this river changes color... what do you think?",
    interactionPrompt: 'Test the river theory',
    sceneDescription: 'A river that shifts between blue and green',
  },
  'cal-sci-experimentation': {
    challengeId: 'cal-sci-experimentation',
    companionIntro: "An alchemist's station! If we mix these, what will happen?",
    interactionPrompt: 'Mix the compounds',
    sceneDescription: 'An alchemist station with bubbling liquids',
  },
  'cal-sci-analysis': {
    challengeId: 'cal-sci-analysis',
    companionIntro: "These experiment results are fascinating... can you spot the pattern in the data?",
    interactionPrompt: 'Analyze the data',
    sceneDescription: 'A chart showing experimental results',
  },
  'cal-sci-synthesis': {
    challengeId: 'cal-sci-synthesis',
    companionIntro: "We have findings from three different experiments — what's the big picture?",
    interactionPrompt: 'Synthesize the findings',
    sceneDescription: 'Multiple experiment journals open on a desk',
  },

  // Logic
  'cal-logic-patterns': {
    challengeId: 'cal-logic-patterns',
    companionIntro: "There's a pattern in these tiles! I wonder what comes next...",
    interactionPrompt: 'Complete the tile pattern',
    sceneDescription: 'A mosaic floor with a pattern that has missing tiles',
  },
  'cal-logic-sequences': {
    challengeId: 'cal-logic-sequences',
    companionIntro: "These bells play a sequence... what comes after?",
    interactionPrompt: 'Continue the bell sequence',
    sceneDescription: 'A row of enchanted bells chiming in order',
  },
  'cal-logic-categories': {
    challengeId: 'cal-logic-categories',
    companionIntro: "These objects are all mixed up! Which ones belong together?",
    interactionPrompt: 'Group the objects',
    sceneDescription: 'A jumble of diverse objects on a shelf',
  },
  'cal-logic-deduction': {
    challengeId: 'cal-logic-deduction',
    companionIntro: "Someone left clues about which chest has the treasure... let's figure it out!",
    interactionPrompt: 'Follow the clues',
    sceneDescription: 'Three locked chests with clue cards beside them',
  },
  'cal-logic-inference': {
    challengeId: 'cal-logic-inference',
    companionIntro: "We can see part of the map, but the rest is hidden... what can we figure out?",
    interactionPrompt: 'Infer the hidden path',
    sceneDescription: 'A partially-revealed treasure map',
  },
  'cal-logic-formal': {
    challengeId: 'cal-logic-formal',
    companionIntro: "This puzzle has strict rules — if A then B, and if not B then...",
    interactionPrompt: 'Solve the logic gates',
    sceneDescription: 'A panel of glowing logic gates',
  },
  'cal-logic-proof': {
    challengeId: 'cal-logic-proof',
    companionIntro: "Can we prove this claim is true? Let's build the argument step by step...",
    interactionPrompt: 'Construct the proof',
    sceneDescription: 'A chalkboard with theorems and blank proof steps',
  },

  // Spatial
  'cal-spatial-shapes': {
    challengeId: 'cal-spatial-shapes',
    companionIntro: "Look at these shapes floating in the air! So cool!",
    interactionPrompt: 'Match the floating shapes',
    sceneDescription: 'Colorful 3D shapes spinning in the air',
  },
  'cal-spatial-directions': {
    challengeId: 'cal-spatial-directions',
    companionIntro: "There's a maze ahead! Which way should we go?",
    interactionPrompt: 'Navigate the maze',
    sceneDescription: 'A small garden maze with multiple paths',
  },
  'cal-spatial-rotation': {
    challengeId: 'cal-spatial-rotation',
    companionIntro: "This key is the wrong way around... can you turn it to fit the lock?",
    interactionPrompt: 'Rotate the key to fit',
    sceneDescription: 'An ornate key that needs rotating to fit a lock',
  },
  'cal-spatial-3d': {
    challengeId: 'cal-spatial-3d',
    companionIntro: "What does this object look like from the other side? Let's imagine...",
    interactionPrompt: 'Visualize the hidden side',
    sceneDescription: 'A complex 3D sculpture on a pedestal',
  },
  'cal-spatial-coordinates': {
    challengeId: 'cal-spatial-coordinates',
    companionIntro: "The map uses a grid — can you find the spot at these coordinates?",
    interactionPrompt: 'Locate the grid point',
    sceneDescription: 'A glowing grid map with coordinate markings',
  },
  'cal-spatial-transformation': {
    challengeId: 'cal-spatial-transformation',
    companionIntro: "If we flip and stretch this blueprint, what does the building look like?",
    interactionPrompt: 'Transform the blueprint',
    sceneDescription: 'A holographic blueprint floating in space',
  },
  'cal-spatial-topology': {
    challengeId: 'cal-spatial-topology',
    companionIntro: "Is this shape the same as that one if you bend it? Topology is wild!",
    interactionPrompt: 'Compare the shapes',
    sceneDescription: 'Two deformable shapes that may be topologically equivalent',
  },

  // Vocabulary
  'cal-vocab-basic': {
    challengeId: 'cal-vocab-basic',
    companionIntro: "There's a sign here with a picture! Do you know what it's called?",
    interactionPrompt: 'Name the picture',
    sceneDescription: 'A wooden sign with a colorful illustration',
  },
  'cal-vocab-everyday': {
    challengeId: 'cal-vocab-everyday',
    companionIntro: "The books are whispering! Let's listen to what they say...",
    interactionPrompt: 'Listen to the whispering books',
    sceneDescription: 'A shelf of books with soft, glowing text',
  },
  'cal-vocab-contextual': {
    challengeId: 'cal-vocab-contextual',
    companionIntro: "This word means something different here than where I've seen it before!",
    interactionPrompt: 'Figure out the word meaning',
    sceneDescription: 'A word etched in stone with context clues around it',
  },
  'cal-vocab-descriptive': {
    challengeId: 'cal-vocab-descriptive',
    companionIntro: "How would you describe this scene? So many interesting words come to mind...",
    interactionPrompt: 'Describe what you see',
    sceneDescription: 'A vivid landscape begging for description',
  },
  'cal-vocab-academic': {
    challengeId: 'cal-vocab-academic',
    companionIntro: "The inscription uses some fancy words... let's decode them!",
    interactionPrompt: 'Decode the inscription',
    sceneDescription: 'An academic text carved into a monument',
  },
  'cal-vocab-technical': {
    challengeId: 'cal-vocab-technical',
    companionIntro: "This engineer's manual uses specialized language. Let's crack it!",
    interactionPrompt: 'Read the technical manual',
    sceneDescription: 'A technical manual with diagrams and specialized terms',
  },
  'cal-vocab-specialized': {
    challengeId: 'cal-vocab-specialized',
    companionIntro: "An ancient scroll written in a specialized scholarly tradition — fascinating!",
    interactionPrompt: 'Interpret the scholarly scroll',
    sceneDescription: 'A scroll written in specialized scholarly language',
  },
};

// ---------------------------------------------------------------------------
// Calibration Flow phases
// ---------------------------------------------------------------------------

export type CalibrationPhase =
  | 'intro'           // Companion greets, sets the scene
  | 'exploring'       // Player walking to next challenge (companion leads)
  | 'challenge'       // Player interacting with a calibration probe
  | 'transition'      // Between challenges, companion chats
  | 'complete'        // Calibration done, seamless transition to gameplay
  | 'inactive';       // Not in calibration

// ---------------------------------------------------------------------------
// CalibrationFlow — orchestrates the first-play experience
// ---------------------------------------------------------------------------

export class CalibrationFlow implements Disposable {
  private phase: CalibrationPhase = 'inactive';
  private session: CalibrationSession | null = null;
  private sessionId: string | null = null;
  private currentChallenge: ChallengePrompt | null = null;
  private challengeStartTime = 0;
  private interactionCount = 0;
  private disposed = false;

  // UI overlay for calibration challenges
  private overlay: HTMLElement | null = null;

  // Callbacks
  private onDialogue: ((speaker: string, text: string) => void) | null = null;
  private onComplete: ((results: CalibrationResults) => void) | null = null;

  /**
   * Start calibration for a new profile.
   * Returns true if calibration was started, false if the profile already has mastery data.
   */
  start(
    core: NexusCore,
    profile: Profile,
    onDialogue: (speaker: string, text: string) => void,
    onComplete: (results: CalibrationResults) => void,
  ): boolean {
    if (this.disposed) return false;

    // Check if profile already has mastery data — skip calibration if so
    const mastery = core.getMasteryForProfile(profile.id);
    if (mastery.length > 0) return false;

    this.onDialogue = onDialogue;
    this.onComplete = onComplete;

    // Estimate age from profile tier
    const estimatedAge = this.tierToAge(profile.masteryTier);

    // Start calibration session
    this.session = core.calibrationSystem.startCalibration(profile.id, estimatedAge);
    this.sessionId = this.session.id;
    this.phase = 'intro';
    this.interactionCount = 0;

    // Companion introduces the adventure
    this.emitDialogue(
      "Welcome to the Nexus! I'm so excited to explore with you! Let's see what's around here...",
    );

    // After a brief pause, get the first challenge
    setTimeout(() => {
      if (this.phase !== 'intro') return;
      const first = core.calibrationSystem.getFirstChallenge(this.sessionId!);
      if (first.done) {
        this.completeCalibration(core);
        return;
      }
      this.presentChallenge(first);
    }, 3000);

    return true;
  }

  /**
   * Called when the player completes a calibration interaction.
   * The `correct` and `responseTimeMs` come from the game interaction result.
   */
  submitResponse(
    core: NexusCore,
    correct: boolean,
    responseTimeMs?: number,
  ): void {
    if (this.phase !== 'challenge' || !this.sessionId) return;

    const elapsed = responseTimeMs ?? (Date.now() - this.challengeStartTime);
    const response: CalibrationResponse = {
      correct,
      responseTimeMs: elapsed,
      attemptCount: 1,
    };

    const next = core.calibrationSystem.processResponse(this.sessionId, response);
    this.interactionCount++;

    if (next.done) {
      this.completeCalibration(core);
      return;
    }

    // Transition dialogue from companion
    this.phase = 'transition';
    this.emitDialogue(next.companionDialogue);

    // Brief pause before next challenge
    setTimeout(() => {
      if (this.phase !== 'transition') return;
      this.presentChallenge(next);
    }, 2500);
  }

  /**
   * Simulate a response for a calibration interaction (used by debug tools
   * or when the player interacts with a calibration object in the scene).
   */
  simulateInteraction(
    core: NexusCore,
    correct: boolean,
    responseTimeMs = 4000,
  ): void {
    this.submitResponse(core, correct, responseTimeMs);
  }

  /** Get current calibration state for debug inspection */
  getState(): {
    phase: CalibrationPhase;
    sessionId: string | null;
    interactionCount: number;
    currentChallenge: string | null;
  } {
    return {
      phase: this.phase,
      sessionId: this.sessionId,
      interactionCount: this.interactionCount,
      currentChallenge: this.currentChallenge?.challengeId ?? null,
    };
  }

  /** Whether calibration is currently active */
  get isActive(): boolean {
    return this.phase !== 'inactive' && this.phase !== 'complete';
  }

  /** Current phase of calibration */
  get currentPhase(): CalibrationPhase {
    return this.phase;
  }

  /** Get the active challenge prompt (if any) */
  get activeChallenge(): ChallengePrompt | null {
    return this.currentChallenge;
  }

  /** Hide the calibration challenge overlay (if visible) */
  hideOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.hideOverlay();
    this.phase = 'inactive';
    this.session = null;
    this.sessionId = null;
    this.onDialogue = null;
    this.onComplete = null;
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private presentChallenge(next: CalibrationNext): void {
    if (next.done || !next.nextChallenge) return;

    const prompt = CHALLENGE_PROMPTS[next.nextChallenge];
    if (!prompt) {
      // Unknown challenge ID — use generic prompt
      this.currentChallenge = {
        challengeId: next.nextChallenge,
        companionIntro: next.companionDialogue,
        interactionPrompt: 'Explore this area',
        sceneDescription: 'An interesting discovery',
      };
    } else {
      this.currentChallenge = prompt;
    }

    this.phase = 'challenge';
    this.challengeStartTime = Date.now();

    // Show companion intro dialogue
    this.emitDialogue(this.currentChallenge.companionIntro);

    // Show the challenge interaction overlay
    this.showChallengeOverlay(this.currentChallenge);
  }

  private showChallengeOverlay(challenge: ChallengePrompt): void {
    this.hideOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'calibration-challenge';
    overlay.setAttribute('role', 'region');
    overlay.setAttribute('aria-label', 'Exploration challenge');
    overlay.style.cssText = `
      position: fixed; bottom: 22%; left: 50%; transform: translateX(-50%);
      z-index: 45; pointer-events: auto;
      max-width: 28rem; width: 90%;
      background: rgba(26, 27, 46, 0.9);
      border: 1px solid #a78bfa; border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      color: #F5F0E8; font-family: 'Nunito', system-ui, sans-serif;
      box-shadow: 0 0 16px rgba(167, 139, 250, 0.2);
      text-align: center;
    `;

    const sceneDesc = document.createElement('p');
    sceneDesc.textContent = challenge.sceneDescription;
    sceneDesc.style.cssText = `
      font-size: 0.8125rem; color: #94A3B8; font-style: italic;
      margin-bottom: 0.5rem;
    `;
    overlay.appendChild(sceneDesc);

    const promptEl = document.createElement('p');
    promptEl.textContent = challenge.interactionPrompt;
    promptEl.style.cssText = `
      font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;
    `;
    overlay.appendChild(promptEl);

    // Interaction buttons — correct / try-again feel natural
    const btnRow = document.createElement('div');
    btnRow.style.cssText = `display: flex; gap: 0.5rem; justify-content: center;`;

    const successBtn = document.createElement('button');
    successBtn.type = 'button';
    successBtn.textContent = 'I did it!';
    successBtn.setAttribute('aria-label', 'Mark this challenge as completed');
    successBtn.style.cssText = `
      padding: 0.5rem 1rem; font-size: 0.9375rem; font-weight: 600;
      font-family: 'Nunito', system-ui, sans-serif;
      color: #0f172a; background: linear-gradient(135deg, #22d3ee, #a78bfa);
      border: none; border-radius: 0.5rem; cursor: pointer;
      min-height: 2.5rem;
    `;

    const tryAgainBtn = document.createElement('button');
    tryAgainBtn.type = 'button';
    tryAgainBtn.textContent = "I'm not sure...";
    tryAgainBtn.setAttribute('aria-label', 'Try another approach');
    tryAgainBtn.style.cssText = `
      padding: 0.5rem 1rem; font-size: 0.9375rem; font-weight: 600;
      font-family: 'Nunito', system-ui, sans-serif;
      color: #94A3B8; background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem;
      cursor: pointer; min-height: 2.5rem;
    `;

    // Store reference to core via closure — submitResponse needs it
    successBtn.dataset.action = 'correct';
    tryAgainBtn.dataset.action = 'incorrect';

    btnRow.appendChild(successBtn);
    btnRow.appendChild(tryAgainBtn);
    overlay.appendChild(btnRow);

    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Focus first button for keyboard users
    successBtn.focus();
  }

  private completeCalibration(core: NexusCore): void {
    this.phase = 'complete';
    this.hideOverlay();

    this.emitDialogue(
      "We explored so much! This world is amazing — I can't wait to see more!",
    );

    if (this.sessionId) {
      const results = core.calibrationSystem.getResults(this.sessionId);
      // Brief delay so the completion dialogue is seen before gameplay starts
      setTimeout(() => {
        if (this.onComplete) this.onComplete(results);
        this.phase = 'inactive';
      }, 3000);
    } else {
      this.phase = 'inactive';
    }
  }

  private emitDialogue(text: string): void {
    if (this.onDialogue) {
      this.onDialogue('Companion', text);
    }
  }

  private tierToAge(tier: string): number {
    switch (tier) {
      case 'foundation': return 4;
      case 'discovery': return 8;
      case 'builder': return 12;
      case 'innovator': return 16;
      case 'creator': return 20;
      default: return 8;
    }
  }
}
