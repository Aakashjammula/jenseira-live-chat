import express from 'express';
import {
  createGesture,
  createMood,
  createEmojiGesture,
  createLookAt,
  createLookAtCamera,
  createEyeContact,
  createAnimation,
  createPose,
  createStopGesture,
  createStopAnimation,
  suggestAnimationsFromText,
  createAnimationSequence,
  GESTURES,
  MOODS,
  EMOJIS
} from '../services/avatar.js';

const router = express.Router();

/**
 * POST /avatar/gesture
 * Play a hand gesture
 */
router.post('/gesture', (req, res) => {
  try {
    const { gesture, duration = 3, mirror = false, transition = 1000 } = req.body;
    
    if (!gesture) {
      return res.status(400).json({ error: 'Gesture name is required' });
    }
    
    const command = createGesture(gesture, duration, mirror, transition);
    res.json({ success: true, command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /avatar/mood
 * Set avatar mood/facial expression
 */
router.post('/mood', (req, res) => {
  try {
    const { mood } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }
    
    const command = createMood(mood);
    res.json({ success: true, command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /avatar/emoji
 * Play emoji gesture
 */
router.post('/emoji', (req, res) => {
  try {
    const { emoji, duration = 3 } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }
    
    const command = createEmojiGesture(emoji, duration);
    res.json({ success: true, command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /avatar/look
 * Control where avatar looks
 */
router.post('/look', (req, res) => {
  try {
    const { type, x, y, duration = 2000 } = req.body;
    
    let command;
    if (type === 'at' && x !== undefined && y !== undefined) {
      command = createLookAt(x, y, duration);
    } else if (type === 'camera') {
      command = createLookAtCamera(duration);
    } else if (type === 'contact') {
      command = createEyeContact(duration);
    } else {
      return res.status(400).json({ error: 'Invalid look type or missing coordinates' });
    }
    
    res.json({ success: true, command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /avatar/animation
 * Play Mixamo animation
 */
router.post('/animation', (req, res) => {
  try {
    const { path, duration = 10 } = req.body;
    
    if (!path) {
      return res.status(400).json({ error: 'Animation path is required' });
    }
    
    const command = createAnimation(path, duration);
    res.json({ success: true, command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /avatar/pose
 * Play Mixamo pose
 */
router.post('/pose', (req, res) => {
  try {
    const { path, duration = 5 } = req.body;
    
    if (!path) {
      return res.status(400).json({ error: 'Pose path is required' });
    }
    
    const command = createPose(path, duration);
    res.json({ success: true, command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /avatar/stop
 * Stop current gesture or animation
 */
router.post('/stop', (req, res) => {
  try {
    const { type = 'gesture' } = req.body;
    
    const command = type === 'animation' ? createStopAnimation() : createStopGesture();
    res.json({ success: true, command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /avatar/suggest
 * Analyze text and suggest appropriate animations
 */
router.post('/suggest', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const animations = suggestAnimationsFromText(text);
    res.json({ success: true, animations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /avatar/sequence
 * Execute a sequence of animation commands
 */
router.post('/sequence', (req, res) => {
  try {
    const { commands } = req.body;
    
    if (!commands || !Array.isArray(commands)) {
      return res.status(400).json({ error: 'Commands array is required' });
    }
    
    const sequence = createAnimationSequence(commands);
    res.json({ success: true, sequence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /avatar/options
 * Get available gestures, moods, and emojis
 */
router.get('/options', (_req, res) => {
  res.json({
    gestures: Object.values(GESTURES),
    moods: Object.values(MOODS),
    emojis: Object.values(EMOJIS)
  });
});

export default router;
