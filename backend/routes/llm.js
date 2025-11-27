import express from 'express';
import { getGeminiResponse } from '../services/gemini.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { text, systemPrompt } = req.body;
        
        console.log('LLM request received:', text);
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        const defaultPrompt = `You are a helpful assistant. Respond to the user's input in exactly 2-3 sentences. 
Use only plain text - no numbers, no special formatting, no lists, no bullet points.
Write in a natural, conversational style. Keep responses concise and clear.`;
        
        const llmResponse = await getGeminiResponse(text, systemPrompt || defaultPrompt);
        
        res.json({ 
            response: llmResponse,
            originalText: text
        });
    } catch (error) {
        console.error('LLM error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
