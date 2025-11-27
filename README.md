# Avatar TTS - AI-Powered Talking Avatar

> ✅ **Clean & Production Ready**

An interactive 3D avatar with AI-powered conversations, text-to-speech, and accurate lip-sync animation.

## ✨ Features

- 🤖 **AI Conversations** - Powered by Google Gemini 2.5 Flash
- 🎤 **Text-to-Speech** - High-quality voice synthesis with Supertonic
- 👄 **Lip Sync** - Accurate phoneme-based animation
- 🎭 **3D Avatar** - Interactive Ready Player Me avatars
- ⚡ **Real-time** - Fast response and smooth animations

## 🎯 Tech Stack

**Frontend:**
- Next.js 15 + TypeScript
- React 19
- Tailwind CSS v4
- Three.js + TalkingHead Library

**Backend:**
- Express.js + Node.js
- Google Gemini 2.5 Flash AI
- Supertonic TTS (HuggingFace)
- CMU Pronunciation Dictionary

## 🚀 Quick Start

**1. Setup Environment**
```bash
# Create .env file in root directory
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

**2. Start Backend**
```bash
cd backend
npm install
npm start
```
Backend runs at `http://localhost:3001`

**3. Start Frontend (Next.js)**
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:3000`

**4. Open Browser**
Navigate to `http://localhost:3000` and start chatting!

## 🎮 Usage

1. Type your message in the input box
2. Press Enter or click "Generate & Speak"
3. Avatar responds with AI-generated speech and lip-sync

That's it! The avatar will:
- Generate an AI response using Gemini
- Convert it to speech
- Animate lip-sync in real-time

## 🔌 API Endpoints

### POST /llm
Get AI response (text only)

```bash
curl -X POST http://localhost:3001/llm \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello!"}'
```

### POST /tts
Generate speech with lip-sync data

```bash
curl -X POST http://localhost:3001/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello!"}'
```

### GET /health
Health check

```bash
curl http://localhost:3001/health
```

## 📁 Project Structure

```
avatar-tts/
├── backend/                    # Express.js API
│   ├── data/
│   │   └── cmudict.json       # Pronunciation dictionary
│   ├── routes/
│   │   ├── llm.js             # LLM endpoint
│   │   └── tts.js             # TTS endpoint
│   ├── services/
│   │   ├── gemini.js          # Gemini AI
│   │   ├── tts.js             # TTS generation
│   │   └── phoneme.js         # Phoneme processing
│   ├── utils/
│   │   └── fastPhonemeDurations.js  # Duration estimation
│   ├── server.js              # Express server
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── AvatarChat.tsx     # Main component
│   ├── lib/
│   │   ├── avatar.ts          # Avatar initialization
│   │   ├── speech.ts          # TTS & lip-sync
│   │   └── visemes.ts         # Phoneme mapping
│   ├── public/
│   │   └── avatars/           # 3D models
│   └── package.json
│
├── avatars/                    # 3D models (7 avatars)
├── backend/
│   └── voices/                 # Voice embeddings (4 voices)
├── .env                        # Environment variables
└── README.md
```

## 🔄 Architecture

**Clean Separated Architecture:**
- ✅ Backend: Express.js REST API (Port 3001)
- ✅ Frontend: Static files (Port 3000)
- ✅ CORS enabled
- ✅ Modular structure
- ✅ Production ready

## 🛠️ Development

**Backend:**
```bash
cd backend
npm start
# Edit files in backend/
# Server auto-restarts with nodemon
```

**Frontend:**
```bash
cd frontend
python -m http.server 3000
# Edit files in frontend/
# Just refresh browser
```

## ⚙️ Customization

### Change Voice
Edit `backend/services/tts.js`:
```javascript
const voiceBuffer = await fs.readFile("../voices/F1.bin"); // F1, F2, M1, or M2
```

### Change Avatar
Edit `frontend/js/avatar.js`:
```javascript
url: "../avatars/julia.glb"  // david, jin, mike, mikey, julia, jenseira
```

### Change AI Model
Edit `backend/services/gemini.js`:
```javascript
model: 'gemini-2.5-flash'  // or gemini-1.5-pro
```

## 📊 Performance

- **First load**: ~2s (avatar loading)
- **TTS generation**: ~2-3s
- **Lip sync**: Real-time, 60fps
- **Memory**: ~500MB (backend), ~200MB (frontend)

## 🚢 Deployment

**Backend:**
```bash
cd backend
npm install --production
node server.js
```

**Frontend:**
Serve `frontend/` folder with any static server (nginx, Apache, CDN)

## 🤝 Contributing

This is a clean, modular codebase. Feel free to:
- Add new voices
- Add new avatars
- Improve lip-sync accuracy
- Add new features

## 📄 License

ISC

## 👤 Author

aakashjammula
