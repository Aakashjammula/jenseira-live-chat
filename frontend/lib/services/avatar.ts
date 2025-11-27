// Avatar initialization and management
import { loadTalkingHead } from './talkinghead-loader';
import { AVATAR_CONFIG } from '../constants/config';
import type { StatusCallback, AvatarConfig, AvatarLoadOptions } from '../types';

/**
 * Initialize the TalkingHead avatar instance
 */
export async function initAvatar(container: HTMLElement): Promise<any> {
  const TalkingHead = await loadTalkingHead();
  
  if (!TalkingHead) {
    throw new Error('TalkingHead not available');
  }
  
  const config: AvatarConfig = {
    ttsEndpoint: 'N/A',
    lipsyncModules: [],
    cameraView: AVATAR_CONFIG.CAMERA_VIEW,
    mixerGainSpeech: AVATAR_CONFIG.MIXER_GAIN,
    cameraRotateEnable: false,
  };

  return new TalkingHead(container, config);
}

/**
 * Load and display the avatar model
 */
export async function loadAvatar(
  head: any,
  statusCallback: StatusCallback
): Promise<boolean> {
  try {
    statusCallback('Loading avatar...');
    
    const options: AvatarLoadOptions = {
      url: AVATAR_CONFIG.DEFAULT_AVATAR,
      body: AVATAR_CONFIG.BODY_TYPE,
      avatarMood: AVATAR_CONFIG.MOOD,
    };

    await head.showAvatar(options, (ev: ProgressEvent) => {
      if (ev?.lengthComputable) {
        const progress = Math.round((ev.loaded / ev.total) * 100);
        statusCallback(`Loading: ${progress}%`);
      }
    });

    head.setView(AVATAR_CONFIG.CAMERA_VIEW, { cameraY: AVATAR_CONFIG.CAMERA_Y });
    statusCallback('Ready');
    return true;
  } catch (error: any) {
    statusCallback('Error: ' + error.message);
    console.error('Avatar loading error:', error);
    return false;
  }
}
