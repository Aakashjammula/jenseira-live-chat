/**
 * Avatar Animation Control Service
 * Provides functions to generate avatar animation commands
 */

// Available gestures
export const GESTURES = {
  HANDUP: 'handup',
  INDEX: 'index',
  OK: 'ok',
  THUMBUP: 'thumbup',
  THUMBDOWN: 'thumbdown',
  SIDE: 'side',
  SHRUG: 'shrug'
};

// Available moods
export const MOODS = {
  NEUTRAL: 'neutral',
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  FEAR: 'fear',
  DISGUST: 'disgust',
  LOVE: 'love',
  SLEEP: 'sleep'
};

// Emoji expressions
export const EMOJIS = {
  HAPPY: '😊',
  SAD: '😢',
  ANGRY: '😠',
  FEAR: '😱',
  THINKING: '🤔',
  SLEEPY: '😴',
  LOVE: '❤️'
};

/**
 * Create a gesture command
 */
export function createGesture(gesture, duration = 3, mirror = false, transition = 1000) {
  return {
    type: 'gesture',
    action: gesture,
    duration,
    mirror,
    transition
  };
}

/**
 * Create a mood command
 */
export function createMood(mood) {
  return {
    type: 'mood',
    action: mood
  };
}

/**
 * Create an emoji gesture command
 */
export function createEmojiGesture(emoji, duration = 3) {
  return {
    type: 'emoji',
    action: emoji,
    duration
  };
}

/**
 * Create a look at command
 */
export function createLookAt(x, y, duration = 3000) {
  return {
    type: 'lookAt',
    x,
    y,
    duration
  };
}

/**
 * Create a look at camera command
 */
export function createLookAtCamera(duration = 2000) {
  return {
    type: 'lookAtCamera',
    duration
  };
}

/**
 * Create a make eye contact command
 */
export function createEyeContact(duration = 3000) {
  return {
    type: 'eyeContact',
    duration
  };
}

/**
 * Create an animation command (Mixamo)
 */
export function createAnimation(path, duration = 10) {
  return {
    type: 'animation',
    path,
    duration
  };
}

/**
 * Create a pose command (Mixamo)
 */
export function createPose(path, duration = 5) {
  return {
    type: 'pose',
    path,
    duration
  };
}

/**
 * Create a stop gesture command
 */
export function createStopGesture() {
  return {
    type: 'stopGesture'
  };
}

/**
 * Create a stop animation command
 */
export function createStopAnimation() {
  return {
    type: 'stopAnimation'
  };
}

/**
 * Analyze text sentiment and suggest appropriate animations
 */
export function suggestAnimationsFromText(text) {
  const animations = [];
  const lowerText = text.toLowerCase();
  
  // Detect sentiment and suggest mood
  if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('awesome')) {
    animations.push(createMood(MOODS.HAPPY));
    animations.push(createGesture(GESTURES.THUMBUP, 3));
  } else if (lowerText.includes('sad') || lowerText.includes('sorry') || lowerText.includes('unfortunately')) {
    animations.push(createMood(MOODS.SAD));
  } else if (lowerText.includes('angry') || lowerText.includes('frustrated')) {
    animations.push(createMood(MOODS.ANGRY));
  } else if (lowerText.includes('think') || lowerText.includes('consider')) {
    animations.push(createEmojiGesture(EMOJIS.THINKING, 3));
  } else if (lowerText.includes('hello') || lowerText.includes('hi ') || lowerText.includes('hey')) {
    animations.push(createMood(MOODS.HAPPY));
    animations.push(createGesture(GESTURES.HANDUP, 3));
  } else if (lowerText.includes('yes') || lowerText.includes('correct') || lowerText.includes('right')) {
    animations.push(createGesture(GESTURES.THUMBUP, 2));
  } else if (lowerText.includes('no') || lowerText.includes('wrong') || lowerText.includes('incorrect')) {
    animations.push(createGesture(GESTURES.THUMBDOWN, 2));
  } else if (lowerText.includes('not sure') || lowerText.includes('maybe') || lowerText.includes('dunno')) {
    animations.push(createGesture(GESTURES.SHRUG, 3));
  }
  
  // Default: look at camera for engagement
  if (animations.length === 0) {
    animations.push(createLookAtCamera(2000));
  }
  
  return animations;
}

/**
 * Create a sequence of animations
 */
export function createAnimationSequence(commands) {
  return {
    type: 'sequence',
    commands
  };
}
