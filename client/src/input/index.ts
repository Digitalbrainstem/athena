export { InputManager } from './manager.js';
export { KeyboardInput } from './keyboard.js';
export { TouchInput } from './touch.js';
export { TouchCameraController } from './touch-camera.js';
export { VirtualJoystick } from './virtual-joystick.js';
export { GamepadInput, detectControllerType, getControllerLabel, HAPTIC_PATTERNS } from './gamepad.js';
export type { ControllerType, GamepadButtonMapping, HapticPattern, GamepadConfig } from './gamepad.js';
export { VoiceInput, CHILD_SPEECH_MAP, levenshteinDistance, similarity, fuzzyMatchWord, fuzzyMatchTranscript, isSpeechRecognitionAvailable } from './voice.js';
export type { VoiceConfig } from './voice.js';
