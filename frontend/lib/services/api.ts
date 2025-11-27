// API service for backend communication
import { API_CONFIG } from '../constants/config';
import type { TTSResponse } from '../types';

/**
 * Call the TTS API endpoint
 */
export async function callTTSAPI(text: string): Promise<TTSResponse> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TTS}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.statusText}`);
  }

  return response.json();
}
