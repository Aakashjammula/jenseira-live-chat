# Avatar TTS Backend

Express.js backend API for Avatar TTS with AI-powered conversations and text-to-speech.

## Features

- **LLM Endpoint** - Google Gemini AI responses
- **TTS Endpoint** - High-quality speech synthesis with phoneme data
- **Phoneme Processing** - Accurate timing for lip sync
- **CORS Enabled** - Works with any frontend

## Setup

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file in the root directory (not in backend/):

```env
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

## Run

```bash
npm start
```

Server runs at `http://localhost:3001`

## API Endpoints

### POST /llm
Get AI response (text only)

**Request:**
```json
{
  "text": "Hello!",
  "systemPrompt": "Optional custom prompt"
}
```

**Response:**
```json
{
  "response": "AI generated response",
  "originalText": "Hello!"
}
```

### POST /tts
Generate speech with lip-sync data

**Request:**
```json
{
  "text": "Hello!"
}
```

**Response:**
```json
{
  "audio": [0.1, 0.2, ...],
  "sampleRate": 24000,
  "phonemes": ["HH", "AH", "L", "OW"],
  "durations": [0.1, 0.15, 0.1, 0.2],
  "audioDuration": 0.55,
  "originalText": "Hello!",
  "llmResponse": "AI response",
  "finalText": "AI response"
}
```

### GET /health
Health check endpoint

## Project Structure

```
backend/
├── server.js           # Express server
├── routes/
│   ├── llm.js         # LLM endpoint
│   └── tts.js         # TTS endpoint
├── services/
│   ├── gemini.js      # Gemini AI service
│   ├── tts.js         # TTS generation
│   └── phoneme.js     # Phoneme processing
└── package.json
```
