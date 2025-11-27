// Speech synthesis and lip sync service
import { callTTSAPI } from './api';
import { createAudioBuffer, ensureAudioContextRunning } from '../utils/audio';
import { convertPhonemesToVisemes } from '../utils/viseme-converter';
import { prepareWordTiming } from '../utils/word-timing';
import type { StatusCallback, SpeakAudioOptions } from '../types';

/**
 * Main function to generate speech and animate avatar
 */
export async function animateText(
  text: string,
  head: any,
  statusCallback: StatusCallback
): Promise<string | null> {
  if (!text.trim()) return null;

  try {
    statusCallback('Generating speech...');

    // Ensure audio context is ready
    await ensureAudioContextRunning(head.audioCtx);

    // Call TTS API
    const data = await callTTSAPI(text);
    
    console.log('Received TTS data:', {
      samples: data.audio.length,
      sampleRate: data.sampleRate,
      duration: data.audioDuration,
      phonemes: data.phonemes.length,
      llmResponse: data.llmResponse,
    });

    if (data.llmResponse) {
      statusCallback('LLM: ' + data.llmResponse.substring(0, 50) + '...');
    }

    // Convert audio data to AudioBuffer
    const audioBuffer = createAudioBuffer(
      head.audioCtx,
      data.audio,
      data.sampleRate
    );

    statusCallback('Playing speech...');

    // Convert phonemes to visemes
    const { visemes, vtimes, vdurations } = convertPhonemesToVisemes(
      data.phonemes,
      data.durations,
      audioBuffer.duration
    );

    // Prepare word timing
    const { words, wtimes, wdurations } = prepareWordTiming(
      data.finalText || text,
      audioBuffer.duration
    );

    // Play audio with lip sync
    await playAudioWithLipSync(
      audioBuffer,
      visemes,
      vtimes,
      vdurations,
      words,
      wtimes,
      wdurations,
      head,
      statusCallback
    );

    return data.llmResponse || data.finalText || text;
  } catch (error: any) {
    console.error('Speech animation error:', error);
    statusCallback('Error: ' + error.message);
    return null;
  }
}

/**
 * Play audio with synchronized lip movements
 */
async function playAudioWithLipSync(
  audioBuffer: AudioBuffer,
  visemes: string[],
  vtimes: number[],
  vdurations: number[],
  words: string[],
  wtimes: number[],
  wdurations: number[],
  head: any,
  statusCallback: StatusCallback
): Promise<void> {
  // Stop any existing speech
  head.stopSpeaking();
  await new Promise(resolve => setTimeout(resolve, 100));

  // Ensure audio context is running
  await ensureAudioContextRunning(head.audioCtx);

  try {
    // Start audio playback
    const audioSource = head.audioCtx.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(head.audioCtx.destination);
    audioSource.start(0);
    
    console.log('Audio playback started, duration:', audioBuffer.duration, 'seconds');

    audioSource.onended = () => {
      console.log('Audio playback completed');
      statusCallback('Ready');
    };

    // Start lip sync animation
    const options: SpeakAudioOptions = {
      audio: audioBuffer,
      words,
      wtimes,
      wdurations,
      visemes,
      vtimes,
      vdurations,
    };

    head.speakAudio(options, { playAudio: false }, (event: string, word: string) => {
      if (event === 'word' && word) {
        console.log('Lip sync word:', word);
      }
      if (event === 'end') {
        console.log('Lip sync animation ended');
      }
    });
    
    console.log('TalkingHead lip sync started');
    statusCallback('Speaking...');
  } catch (error) {
    console.error('Error playing speech:', error);
    statusCallback('Ready');
  }
}
