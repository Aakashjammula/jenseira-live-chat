// Application configuration constants

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    TTS: '/tts',
  },
} as const;

export const AVATAR_CONFIG = {
  DEFAULT_AVATAR: '/avatars/jenseira.glb',
  BODY_TYPE: 'F',
  MOOD: 'neutral',
  CAMERA_VIEW: 'upper',
  MIXER_GAIN: 3,
  CAMERA_Y: 0,
} as const;

export const TALKING_HEAD_CDN = {
  THREE_JS: 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js/+esm',
  THREE_ADDONS: 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/',
  TALKING_HEAD: 'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.5/modules/talkinghead.mjs',
} as const;
