"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAvatar, useChat } from "@/hooks"
import { executeAvatarCommand } from "@/lib"

export default function AvatarChat() {
  const [text, setText] = useState("")
  const [showAnimations, setShowAnimations] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null!)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Use custom hooks for avatar and chat management
  const { head, status } = useAvatar(containerRef)
  const { messages, isProcessing, sendMessage, clearMessages } = useChat(head, () => {
    // Status updates are handled by useAvatar
  })

  // Listen to animation stream from backend (SSE)
  useEffect(() => {
    if (!head) return

    const eventSource = new EventSource('http://localhost:3001/animation/stream')

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'connected') {
          console.log('[Animation] Connected to stream:', data.clientId)
        } else if (data.type) {
          // Execute animation command
          console.log('[Animation] Received:', data)
          await executeAvatarCommand(head, data)
        }
      } catch (error) {
        console.error('[Animation] Error:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('[Animation] Stream error:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [head])

  // Button style helper
  const btnClass = isDarkTheme 
    ? 'bg-white/10 hover:bg-white/20 border-white/20' 
    : 'bg-white/50 hover:bg-white/80 border-gray-300'

  // Quick animation triggers
  const triggerAnimation = async (type: any, action: string, duration: any = 3, mirror = false) => {
    if (!head) return
    
    // Handle different command types
    if (type === 'gesture') {
      await executeAvatarCommand(head, { 
        type: 'gesture', 
        action, 
        duration, 
        mirror, 
        transition: 1000 
      } as any)
    } else if (type === 'mood') {
      await executeAvatarCommand(head, { type: 'mood', action } as any)
      
      // Auto-reset sleep mood to neutral after 3 seconds
      if (action === 'sleep') {
        setTimeout(async () => {
          await executeAvatarCommand(head, { type: 'mood', action: 'neutral' } as any)
        }, 3000)
      }
    } else if (type === 'emoji') {
      await executeAvatarCommand(head, { type: 'emoji', action, duration } as any)
      
      // Auto-reset sleepy emoji to neutral after duration
      if (action === '😴') {
        setTimeout(async () => {
          await executeAvatarCommand(head, { type: 'mood', action: 'neutral' } as any)
        }, duration * 1000)
      }
    } else if (type === 'lookAtCamera') {
      await executeAvatarCommand(head, { type: 'lookAtCamera', duration } as any)
    } else if (type === 'eyeContact') {
      await executeAvatarCommand(head, { type: 'eyeContact', duration } as any)
    } else {
      await executeAvatarCommand(head, { type, action, duration } as any)
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isProcessing) return

    const userMessage = text.trim()
    setText("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    
    await sendMessage(userMessage)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    adjustTextareaHeight()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatTime = (d: Date) => {
    try {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  return (
    <div className={`w-full h-screen overflow-hidden flex transition-colors ${
      isDarkTheme 
        ? 'bg-[#0A0A0A] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Left Panel - Avatar (50%) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`w-1/2 h-full flex flex-col items-center justify-center p-8 relative max-lg:hidden transition-colors ${
          isDarkTheme
            ? 'bg-gradient-to-br from-[#0F0F0F] to-[#0A0A0A] border-r border-white/5'
            : 'bg-gradient-to-br from-gray-100 to-white border-r border-gray-200'
        }`}
      >
        <div ref={containerRef} className="w-full h-full flex items-center justify-center" id="avatar-container"></div>
        
        {/* Status Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-6 left-6 px-3 py-1.5 backdrop-blur-xl border rounded-full text-xs font-medium flex items-center gap-2 ${
            isDarkTheme
              ? 'bg-white/5 border-white/10 text-white/70'
              : 'bg-black/5 border-gray-300 text-gray-600'
          }`}
        >
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
          <span>{status}</span>
        </motion.div>

        {/* Control Buttons - Top Right (Emotes, Sound, Theme) */}
        <div className="absolute top-6 right-6 flex gap-2">
          {/* Emotes/Animations Button */}
          {head && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowAnimations(!showAnimations)}
              className={`w-10 h-10 backdrop-blur-xl border rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                isDarkTheme
                  ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 border-violet-500/20'
                  : 'bg-gradient-to-br from-violet-400 to-fuchsia-400 border-violet-400/20'
              }`}
              title="Animations"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          )}

          {/* Sound/Mute Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsMuted(!isMuted)}
            className={`w-10 h-10 backdrop-blur-xl border rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              isDarkTheme
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : 'bg-black/5 border-gray-300 hover:bg-black/10'
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </motion.button>

          {/* Theme Toggle Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`w-10 h-10 backdrop-blur-xl border rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              isDarkTheme
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : 'bg-black/5 border-gray-300 hover:bg-black/10'
            }`}
            title={isDarkTheme ? "Light Mode" : "Dark Mode"}
          >
            {isDarkTheme ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Animation Menu - Expandable from Emotes button */}
        {head && (
          <div className="absolute top-6 right-6">
            {/* Expandable Menu */}
            <AnimatePresence>
              {showAnimations && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-16 right-0 backdrop-blur-md border rounded-xl p-3 space-y-3 min-w-[200px] max-h-[70vh] overflow-y-auto ${
                    isDarkTheme
                      ? 'bg-black/20 border-white/10'
                      : 'bg-white/60 border-gray-300 shadow-lg'
                  }`}
                >
                  {/* Gestures */}
                  <div>
                    <div className={`text-xs font-semibold mb-2 ${isDarkTheme ? 'text-white/70' : 'text-gray-700'}`}>GESTURES</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      <button onClick={() => triggerAnimation('gesture', 'handup', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Wave">👋</button>
                      <button onClick={() => triggerAnimation('gesture', 'thumbup', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Thumbs Up">👍</button>
                      <button onClick={() => triggerAnimation('gesture', 'thumbdown', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Thumbs Down">👎</button>
                      <button onClick={() => triggerAnimation('gesture', 'index', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Point">👉</button>
                      <button onClick={() => triggerAnimation('gesture', 'ok', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="OK">👌</button>
                      <button onClick={() => triggerAnimation('gesture', 'shrug', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Shrug">🤷</button>
                      <button onClick={() => triggerAnimation('gesture', 'side', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Hand to Side">🫱</button>
                      <button onClick={() => triggerAnimation('gesture', 'handup', 3, true)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Wave Right">🤚</button>
                      <button onClick={() => triggerAnimation('gesture', 'thumbup', 3, true)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Thumbs Up Right">👍🏻</button>
                      <button onClick={() => triggerAnimation('gesture', 'index', 3, true)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Point Right">👈</button>
                    </div>
                  </div>

                  {/* Moods */}
                  <div>
                    <div className={`text-xs font-semibold mb-2 ${isDarkTheme ? 'text-white/70' : 'text-gray-700'}`}>MOODS</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      <button onClick={() => triggerAnimation('mood', 'happy')} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Happy">😊</button>
                      <button onClick={() => triggerAnimation('mood', 'neutral')} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Neutral">😐</button>
                      <button onClick={() => triggerAnimation('mood', 'sad')} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Sad">😢</button>
                      <button onClick={() => triggerAnimation('mood', 'angry')} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Angry">😠</button>
                      <button onClick={() => triggerAnimation('mood', 'fear')} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Fear">😱</button>
                      <button onClick={() => triggerAnimation('mood', 'love')} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Love">❤️</button>
                      <button onClick={() => triggerAnimation('mood', 'sleep')} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Sleep (auto-resets)">😴</button>
                    </div>
                  </div>

                  {/* Emoji Gestures - Only verified working emojis */}
                  <div>
                    <div className={`text-xs font-semibold mb-2 ${isDarkTheme ? 'text-white/70' : 'text-gray-700'}`}>EXPRESSIONS</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      <button onClick={() => triggerAnimation('emoji', '🤔', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Thinking">🤔</button>
                      <button onClick={() => triggerAnimation('emoji', '😊', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Happy">😊</button>
                      <button onClick={() => triggerAnimation('emoji', '😠', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Angry">😠</button>
                      <button onClick={() => triggerAnimation('emoji', '😱', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Scared">😱</button>
                      <button onClick={() => triggerAnimation('emoji', '😴', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Sleepy (auto-resets)">😴</button>
                      <button onClick={() => triggerAnimation('emoji', '❤️', 3)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Love">❤️</button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div className={`text-xs font-semibold mb-2 ${isDarkTheme ? 'text-white/70' : 'text-gray-700'}`}>ACTIONS</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      <button onClick={() => triggerAnimation('lookAtCamera', '', 2000)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Look at Camera">📷</button>
                      <button onClick={() => triggerAnimation('eyeContact', '', 3000)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Eye Contact">👁️</button>
                      <button onClick={() => head?.lookAhead(2000)} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Look Ahead">⬆️</button>
                      <button onClick={() => triggerAnimation('mood', 'neutral')} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Reset">🔄</button>
                      <button onClick={() => head?.stopGesture()} className={`w-9 h-9 border rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${btnClass}`} title="Stop">⏸️</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Right Panel - Chat (50%) */}
      <div className={`w-1/2 h-full flex flex-col relative max-lg:w-full transition-colors ${
        isDarkTheme ? 'bg-[#0A0A0A]' : 'bg-white'
      }`}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex-shrink-0 px-6 py-4 border-b backdrop-blur-xl flex items-center justify-between transition-colors ${
            isDarkTheme
              ? 'border-white/5 bg-[#0F0F0F]/80'
              : 'border-gray-200 bg-gray-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
              </svg>
            </div>
            <div>
              <h1 className={`text-sm font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Avatar</h1>
              <p className={`text-xs ${isDarkTheme ? 'text-white/40' : 'text-gray-500'}`}>Powered by AI</p>
            </div>
          </div>

          <button
            onClick={clearMessages}
            className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${
              isDarkTheme
                ? 'hover:bg-white/5 text-white/40 hover:text-white/70'
                : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'
            }`}
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border flex items-center justify-center mb-6 ${
                isDarkTheme ? 'border-white/5' : 'border-gray-200'
              }`}>
                <svg className={`w-8 h-8 ${isDarkTheme ? 'text-white/40' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
                </svg>
              </div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>How can I help you today?</h2>
              <p className={`text-sm mb-8 ${isDarkTheme ? 'text-white/40' : 'text-gray-500'}`}>Start a conversation with Avatar</p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {["Explain quantum computing", "Write a poem", "Help me brainstorm"].map((prompt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setText(prompt)}
                    className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                      isDarkTheme
                        ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white/90'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      msg.role === "assistant" 
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500" 
                        : "bg-white/10"
                    }`}>
                      {msg.role === "assistant" ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 group ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                      <div className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl ${
                        msg.role === "user"
                          ? isDarkTheme ? "bg-white/10 text-white" : "bg-violet-500 text-white"
                          : isDarkTheme ? "bg-white/5 text-white/90" : "bg-gray-100 text-gray-900"
                      }`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      {/* Actions */}
                      <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === "user" ? "justify-end" : ""}`}>
                        <span className={`text-xs px-2 ${isDarkTheme ? 'text-white/30' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</span>
                        <button
                          onClick={() => copyToClipboard(msg.content)}
                          className={`w-7 h-7 rounded-md transition-colors flex items-center justify-center ${
                            isDarkTheme
                              ? 'hover:bg-white/5 text-white/30 hover:text-white/60'
                              : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                          }`}
                          title="Copy"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex-shrink-0 p-4 border-t backdrop-blur-xl transition-colors ${
            isDarkTheme
              ? 'border-white/5 bg-[#0F0F0F]/80'
              : 'border-gray-200 bg-gray-50/80'
          }`}
        >
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Avatar..."
                  disabled={isProcessing}
                  className={`w-full border rounded-2xl px-5 py-3.5 pr-12 text-[15px] outline-none resize-none transition-all max-h-[200px] ${
                    isDarkTheme
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:bg-white/[0.07] focus:border-white/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-gray-50 focus:border-violet-500'
                  }`}
                  rows={1}
                  style={{ minHeight: "52px" }}
                />
                <div className={`absolute right-3 bottom-3 text-xs ${isDarkTheme ? 'text-white/20' : 'text-gray-400'}`}>
                  {text.length > 0 && `${text.length}`}
                </div>
              </div>
              
              <motion.button
                type="submit"
                disabled={isProcessing || !text.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-violet-500/20 disabled:shadow-none"
              >
                {isProcessing ? (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </motion.button>
            </div>
            
            <p className={`text-xs text-center mt-3 ${isDarkTheme ? 'text-white/20' : 'text-gray-400'}`}>
              AI can make mistakes. Verify important information.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
