// Type definitions for the application

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TTSResponse {
  audio: number[];
  sampleRate: number;
  audioDuration: number;
  phonemes: string[];
  durations: number[];
  llmResponse?: string;
  finalText?: string;
}

export interface VisemeData {
  visemes: string[];
  vtimes: number[];
  vdurations: number[];
}

export interface WordTimingData {
  words: string[];
  wtimes: number[];
  wdurations: number[];
}

export interface AvatarConfig {
  ttsEndpoint: string;
  lipsyncModules: string[];
  cameraView: string;
  mixerGainSpeech: number;
  cameraRotateEnable: boolean;
}

export interface AvatarLoadOptions {
  url: string;
  body: string;
  avatarMood: string;
}

export interface SpeakAudioOptions {
  audio: AudioBuffer;
  words: string[];
  wtimes: number[];
  wdurations: number[];
  visemes: string[];
  vtimes: number[];
  vdurations: number[];
}

export type StatusCallback = (msg: string) => void;
