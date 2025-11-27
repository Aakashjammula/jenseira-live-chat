# Avatar TTS Frontend

Interactive 3D avatar with AI-powered conversations and real-time lip-sync.

## Features

- 🎭 3D avatar with realistic lip-sync
- 💬 AI-powered conversations
- 🎨 Modern, responsive UI
- ⚡ Real-time speech synthesis
- 🎯 Type-safe TypeScript codebase

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **3D**: TalkingHead (Three.js)
- **UI**: Radix UI

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on port 3001

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
│
├── components/             # React Components
│   └── AvatarChat.tsx     # Main chat interface
│
├── hooks/                  # Custom React Hooks
│   ├── useAvatar.ts       # Avatar management
│   ├── useChat.ts         # Chat logic
│   └── index.ts           # Exports
│
├── lib/                    # Core Business Logic
│   ├── constants/         # Configuration
│   │   ├── config.ts      # API & avatar config
│   │   └── visemes.ts     # Phoneme mappings
│   │
│   ├── services/          # Business Logic
│   │   ├── api.ts         # Backend API calls
│   │   ├── avatar.ts      # Avatar initialization
│   │   ├── speech.ts      # Speech synthesis
│   │   └── talkinghead-loader.ts
│   │
│   ├── types/             # TypeScript Types
│   │   └── index.ts       # All type definitions
│   │
│   ├── utils/             # Utility Functions
│   │   ├── audio.ts       # Audio processing
│   │   ├── viseme-converter.ts
│   │   └── word-timing.ts
│   │
│   └── index.ts           # Main exports
│
└── public/                 # Static Assets
    └── avatars/           # 3D avatar models
```

## Usage Examples

### Using Custom Hooks (Recommended)

```typescript
import { useAvatar, useChat } from '@/hooks';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize avatar
  const { head, status } = useAvatar(containerRef);
  
  // Manage chat
  const { messages, isProcessing, sendMessage, clearMessages } = useChat(
    head,
    (status) => console.log(status)
  );

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={() => sendMessage("Hello!")}>Send</button>
    </div>
  );
}
```

### Using Services Directly

```typescript
import { initAvatar, loadAvatar, animateText } from '@/lib';

// Initialize avatar
const head = await initAvatar(containerElement);
await loadAvatar(head, (status) => console.log(status));

// Animate speech
const response = await animateText(
  "Hello world",
  head,
  (status) => console.log(status)
);
```

### Using Types

```typescript
import type { Message, StatusCallback, TTSResponse } from '@/lib';

const message: Message = {
  role: 'user',
  content: 'Hello',
  timestamp: new Date()
};
```

## Architecture

### Separation of Concerns

- **Components**: UI rendering and user interaction only
- **Hooks**: React state management and lifecycle
- **Services**: Business logic and API calls
- **Utils**: Pure functions and transformations
- **Constants**: Configuration and static data
- **Types**: TypeScript definitions

### Import Pattern

Always import from index files:

```typescript
// ✅ Good
import { initAvatar, animateText } from '@/lib';
import { useAvatar, useChat } from '@/hooks';
import type { Message } from '@/lib';

// ❌ Avoid
import { initAvatar } from '@/lib/services/avatar';
import { animateText } from '@/lib/services/speech';
```

### Data Flow

```
User Input → Component → Hook → Service → API → Backend
                ↓         ↓        ↓
              State   Business   Utils
                       Logic
```

## Configuration

All configuration is centralized in `lib/constants/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: { TTS: '/tts' }
};

export const AVATAR_CONFIG = {
  DEFAULT_AVATAR: '/avatars/jenseira.glb',
  BODY_TYPE: 'F',
  MOOD: 'neutral',
  CAMERA_VIEW: 'upper'
};
```

## Adding New Features

### New Component
1. Create in `components/`
2. Import hooks from `@/hooks`
3. Keep it focused on UI

### New Hook
1. Create in `hooks/`
2. Export from `hooks/index.ts`
3. Use services from `@/lib`

### New Service
1. Create in `lib/services/`
2. Export from `lib/index.ts`
3. Add types to `lib/types/index.ts`

### New Utility
1. Create in `lib/utils/`
2. Export from `lib/index.ts`
3. Keep it pure (no side effects)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Best Practices

1. ✅ Import from index files (`@/lib`, `@/hooks`)
2. ✅ Use TypeScript for everything
3. ✅ Keep components small and focused
4. ✅ Extract logic into hooks or services
5. ✅ Use constants instead of magic values
6. ✅ Handle errors gracefully
7. ❌ Don't mix UI and business logic
8. ❌ Don't use `any` type without good reason
9. ❌ Don't hardcode configuration values

## Troubleshooting

### Avatar not loading
- Check backend is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for errors

### TypeScript errors
```bash
npm run lint
```

### Build fails
```bash
rm -rf .next
npm run build
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TalkingHead Library](https://github.com/met4citizen/TalkingHead)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
