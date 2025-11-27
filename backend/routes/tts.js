import express from 'express';
import { getGeminiResponse } from '../services/gemini.js';
import { generateTTS } from '../services/tts.js';
import { textToPhonemes, estimatePhoneDurations } from '../services/phoneme.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { text } = req.body;
        
        console.log('TTS request received, user text:', text);
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        // Step 1: Get response from Gemini LLM
        let finalText = text;
        let llmResponse = null;
        
        const systemPrompt = `You are a helpful assistant. Respond to the user's input in exactly 2-3 sentences. 
Use only plain text - no numbers, no special formatting, no lists, no bullet points.
Write in a natural, conversational style. Keep responses concise and clear.`;
        
        try {
            console.log('Calling Gemini LLM...');
            llmResponse = await getGeminiResponse(text, systemPrompt);
            finalText = llmResponse;
            console.log('LLM response:', llmResponse);
        } catch (error) {
            console.warn('LLM error, using original text:', error.message);
            finalText = text;
        }
        
        // Step 2: Generate TTS
        console.log('Generating TTS for text:', finalText);
        const { audio, sampleRate, wavBuffer } = await generateTTS(finalText);
        const phonemes = await textToPhonemes(finalText);
        console.log('Phonemes extracted:', phonemes.length, 'phonemes');
        
        const audioDuration = audio.length / sampleRate;
        const durations = await estimatePhoneDurations(wavBuffer, phonemes, audioDuration);
        
        res.json({
            audio: Array.from(audio),
            sampleRate,
            phonemes,
            durations,
            audioDuration,
            originalText: text,
            llmResponse: llmResponse || null,
            finalText: finalText
        });
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
