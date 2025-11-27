/**
 * Avatar Animation Controller
 * Executes animation commands from the backend API
 */

export interface AvatarCommand {
  type: 'gesture' | 'mood' | 'emoji' | 'lookAt' | 'lookAtCamera' | 'eyeContact' | 
        'animation' | 'pose' | 'stopGesture' | 'stopAnimation' | 'sequence';
  action?: string;
  duration?: number;
  mirror?: boolean;
  transition?: number;
  x?: number;
  y?: number;
  path?: string;
  commands?: AvatarCommand[];
}

/**
 * Execute a single animation command on the avatar
 */
export async function executeAvatarCommand(head: any, command: AvatarCommand): Promise<void> {
  if (!head) {
    console.warn('Avatar head not initialized');
    return;
  }

  try {
    switch (command.type) {
      case 'gesture':
        if (command.action) {
          head.playGesture(
            command.action,
            command.duration || 3,
            command.mirror || false,
            command.transition || 1000
          );
        }
        break;

      case 'mood':
        if (command.action) {
          head.setMood(command.action);
        }
        break;

      case 'emoji':
        if (command.action) {
          head.playGesture(command.action, command.duration || 3);
        }
        break;

      case 'lookAt':
        if (command.x !== undefined && command.y !== undefined) {
          head.lookAt(command.x, command.y, command.duration || 3000);
        }
        break;

      case 'lookAtCamera':
        head.lookAtCamera(command.duration || 2000);
        break;

      case 'eyeContact':
        head.makeEyeContact(command.duration || 3000);
        break;

      case 'animation':
        if (command.path) {
          await head.playAnimation(command.path, null, command.duration || 10);
        }
        break;

      case 'pose':
        if (command.path) {
          await head.playPose(command.path, null, command.duration || 5);
        }
        break;

      case 'stopGesture':
        head.stopGesture();
        break;

      case 'stopAnimation':
        head.stopAnimation();
        break;

      case 'sequence':
        if (command.commands && Array.isArray(command.commands)) {
          for (const cmd of command.commands) {
            await executeAvatarCommand(head, cmd);
            // Small delay between commands
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        break;

      default:
        console.warn('Unknown command type:', command.type);
    }
  } catch (error) {
    console.error('Error executing avatar command:', error);
  }
}

/**
 * Fetch and execute animation command from backend
 */
export async function fetchAndExecuteGesture(
  head: any,
  gesture: string,
  duration = 3,
  mirror = false
): Promise<void> {
  try {
    const response = await fetch('http://localhost:3001/avatar/gesture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gesture, duration, mirror })
    });

    const data = await response.json();
    if (data.success && data.command) {
      await executeAvatarCommand(head, data.command);
    }
  } catch (error) {
    console.error('Error fetching gesture:', error);
  }
}

/**
 * Fetch and execute mood command from backend
 */
export async function fetchAndExecuteMood(head: any, mood: string): Promise<void> {
  try {
    const response = await fetch('http://localhost:3001/avatar/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood })
    });

    const data = await response.json();
    if (data.success && data.command) {
      await executeAvatarCommand(head, data.command);
    }
  } catch (error) {
    console.error('Error fetching mood:', error);
  }
}

/**
 * Fetch animation suggestions from text and execute them
 */
export async function fetchAndExecuteSuggestions(head: any, text: string): Promise<void> {
  try {
    const response = await fetch('http://localhost:3001/avatar/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    if (data.success && data.animations) {
      for (const animation of data.animations) {
        await executeAvatarCommand(head, animation);
      }
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
}

/**
 * Get available animation options from backend
 */
export async function getAvatarOptions(): Promise<{
  gestures: string[];
  moods: string[];
  emojis: string[];
} | null> {
  try {
    const response = await fetch('http://localhost:3001/avatar/options');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching options:', error);
    return null;
  }
}
