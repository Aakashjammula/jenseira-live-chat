// Audio processing utilities

/**
 * Convert raw audio data array to AudioBuffer
 */
export function createAudioBuffer(
  audioContext: AudioContext,
  audioData: number[],
  sampleRate: number
): AudioBuffer {
  const audioBuffer = audioContext.createBuffer(1, audioData.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  for (let i = 0; i < audioData.length; i++) {
    channelData[i] = audioData[i];
  }
  
  return audioBuffer;
}

/**
 * Ensure audio context is in running state
 */
export async function ensureAudioContextRunning(audioContext: AudioContext): Promise<void> {
  if (audioContext.state !== 'running') {
    await audioContext.resume();
  }
}
