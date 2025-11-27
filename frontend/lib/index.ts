// Main library exports - centralized entry point

// Services
export { initAvatar, loadAvatar } from './services/avatar';
export { animateText } from './services/speech';
export { callTTSAPI } from './services/api';
export {
  executeAvatarCommand,
  fetchAndExecuteGesture,
  fetchAndExecuteMood,
  fetchAndExecuteSuggestions,
  getAvatarOptions,
  type AvatarCommand,
} from './services/avatar-controller';

// Types
export type {
  Message,
  TTSResponse,
  VisemeData,
  WordTimingData,
  AvatarConfig,
  AvatarLoadOptions,
  SpeakAudioOptions,
  StatusCallback,
} from './types';

// Constants
export { PHONEME_TO_VISEME } from './constants/visemes';
export { API_CONFIG, AVATAR_CONFIG, TALKING_HEAD_CDN } from './constants/config';

// Utils
export { createAudioBuffer, ensureAudioContextRunning } from './utils/audio';
export { convertPhonemesToVisemes } from './utils/viseme-converter';
export { prepareWordTiming } from './utils/word-timing';
