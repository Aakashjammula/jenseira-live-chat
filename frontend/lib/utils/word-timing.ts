// Word timing utilities
import type { WordTimingData } from '../types';

/**
 * Prepare word timing data for lip sync
 */
export function prepareWordTiming(
  text: string,
  audioDuration: number
): WordTimingData {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wtimes: number[] = [];
  const wdurations: number[] = [];
  const audioDurationMs = Math.round(audioDuration * 1000);

  if (words.length === 0) {
    return { words: [], wtimes: [], wdurations: [] };
  }

  const avgTimePerWord = audioDurationMs / words.length;

  for (let i = 0; i < words.length; i++) {
    const startTime = Math.round(i * avgTimePerWord);
    wtimes.push(startTime);
    
    // Last word extends to end of audio
    if (i === words.length - 1) {
      wdurations.push(audioDurationMs - startTime);
    } else {
      wdurations.push(Math.round(avgTimePerWord));
    }
  }

  return { words, wtimes, wdurations };
}
