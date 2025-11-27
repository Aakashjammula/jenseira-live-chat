// Viseme conversion utilities
import { PHONEME_TO_VISEME } from '../constants/visemes';
import type { VisemeData } from '../types';

/**
 * Convert phonemes to visemes with timing information
 */
export function convertPhonemesToVisemes(
  phonemes: string[],
  durations: number[],
  audioDuration: number
): VisemeData {
  const visemes: string[] = [];
  const vtimes: number[] = [];
  const vdurations: number[] = [];

  const audioDurationMs = Math.round(audioDuration * 1000);
  let currentTime = 0;

  phonemes.forEach((phoneme, i) => {
    const viseme = PHONEME_TO_VISEME[phoneme] || 'sil';
    const durationSeconds = durations[i];
    let durationMs: number;

    // Last phoneme should extend to end of audio
    if (i === phonemes.length - 1) {
      durationMs = audioDurationMs - currentTime;
    } else {
      durationMs = durationSeconds * 1000;
    }

    visemes.push(viseme);
    vtimes.push(Math.round(currentTime));
    vdurations.push(Math.max(1, Math.round(durationMs)));

    currentTime += durationMs;
  });

  return { visemes, vtimes, vdurations };
}
