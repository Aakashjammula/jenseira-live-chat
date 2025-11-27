import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import llmRouter from './routes/llm.js';
import ttsRouter from './routes/tts.js';
import avatarRouter from './routes/avatar.js';
import animationStreamRouter from './routes/animation-stream.js';
import { getGeminiResponse } from './services/gemini.js';
import { generateTTS } from './services/tts.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/llm', llmRouter);
app.use('/tts', ttsRouter);
app.use('/avatar', avatarRouter);
app.use('/animation', animationStreamRouter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Jenseira Live Chat Backend API' });
});

// Warmup function to preload models
async function warmup() {
    console.log('\n🔥 Warming up models...');
    
    try {
        // Warm up TTS model
        console.log('📦 Loading TTS model...');
        await generateTTS('Hello');
        console.log('✅ TTS model loaded and ready');
        
        // Warm up LLM
        console.log('🤖 Warming up LM Studio AI...');
        await getGeminiResponse('Hi', 'Respond with just "Ready"');
        console.log('✅ LM Studio AI warmed up and ready');
        
        console.log('🚀 All models ready!\n');
    } catch (error) {
        console.error('⚠️  Warmup error:', error.message);
        console.log('Server will continue, but first request may be slower.\n');
    }
}

const server = app.listen(PORT, async () => {
    console.log(`Backend API running at http://localhost:${PORT}`);
    console.log(`LLM endpoint: http://localhost:${PORT}/llm`);
    console.log(`TTS endpoint: http://localhost:${PORT}/tts`);
    console.log(`Avatar endpoint: http://localhost:${PORT}/avatar`);
    console.log(`Animation Stream: http://localhost:${PORT}/animation/stream`);
    console.log(`Animation Trigger: http://localhost:${PORT}/animation/trigger`);
    
    // Start warmup in background
    warmup();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
