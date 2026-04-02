// Code Forge — in-game programming environment types

import type { MasteryTier } from './components.js';

// ─── Block Definitions ──────────────────────────────────────────────────────

export type BlockCategory =
  | 'motion'
  | 'control'
  | 'logic'
  | 'data'
  | 'event'
  | 'function'
  | 'operator'
  | 'string'
  | 'list'
  | 'advanced';

export interface BlockInputDef {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'direction' | 'variable' | 'expression';
  defaultValue?: string | number | boolean;
  options?: string[];
}

export interface BlockDefinition {
  id: string;
  category: BlockCategory;
  label: string;
  description: string;
  minTier: MasteryTier;
  inputs: BlockInputDef[];
  hasBody: boolean;
  hasElse: boolean;
}

// ─── Block Instances (player-authored programs) ─────────────────────────────

export interface BlockInstance {
  blockId: string;
  id: string;
  inputs: Record<string, string | number | boolean>;
  body?: BlockInstance[];
  elseBody?: BlockInstance[];
}

export interface BlockProgram {
  blocks: BlockInstance[];
}

// ─── Execution ──────────────────────────────────────────────────────────────

export interface RobotState {
  x: number;
  y: number;
  direction: number;
  penDown: boolean;
  penColor: string;
  trail: TrailSegment[];
  inventory: string[];
  sensorData: SensorData;
}

export interface TrailSegment {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
}

export interface SensorData {
  wallAhead: boolean;
  wallLeft: boolean;
  wallRight: boolean;
  objectAhead: string | null;
  currentTile: string;
  distanceToWall: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string[];
  robotState: RobotState;
  error?: string;
  steps: number;
  variables: Record<string, unknown>;
}

export type CodeLanguage = 'python' | 'javascript';

export interface CodeExecutionInput {
  code: string;
  language: CodeLanguage;
  maxSteps?: number;
  maxOutputLines?: number;
}

// ─── Grid World (for robot challenges) ──────────────────────────────────────

export interface GridCell {
  type: 'empty' | 'wall' | 'goal' | 'item' | 'hazard';
  item?: string;
}

export interface GridWorld {
  width: number;
  height: number;
  cells: GridCell[][];
  robotStart: { x: number; y: number; direction: number };
  goals: Array<{ x: number; y: number }>;
}
