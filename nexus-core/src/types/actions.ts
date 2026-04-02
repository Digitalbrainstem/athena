// Game actions — input from renderers to the core

export interface MovePayload {
  direction: { x: number; z: number };
  running: boolean;
}

export interface LookPayload {
  deltaX: number;
  deltaY: number;
}

export interface SelectPayload {
  entityId: number;
}

export interface SpeakPayload {
  text: string;
  confidence: number;
}

export type ActionType =
  | 'move'
  | 'look'
  | 'interact'
  | 'select'
  | 'back'
  | 'inventory'
  | 'speak'
  | 'craft'
  | 'map'
  | 'companion'
  | 'pause';

export type ActionSource = 'keyboard' | 'mouse' | 'touch' | 'voice' | 'gamepad';

export interface GameAction {
  type: ActionType;
  source: ActionSource;
  payload?: MovePayload | LookPayload | SelectPayload | SpeakPayload;
}
