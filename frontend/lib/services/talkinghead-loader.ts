// Dynamic loader for TalkingHead library
import { TALKING_HEAD_CDN } from '../constants/config';

declare global {
  interface Window {
    TalkingHead?: any;
  }
}

/**
 * Load TalkingHead library dynamically from CDN
 */
export async function loadTalkingHead(): Promise<any> {
  if (typeof window === 'undefined') return null;
  
  // Check if already loaded
  if (window.TalkingHead) {
    return window.TalkingHead;
  }

  // Add import map for Three.js dependencies
  const importMap = document.createElement('script');
  importMap.type = 'importmap';
  importMap.textContent = JSON.stringify({
    imports: {
      'three': TALKING_HEAD_CDN.THREE_JS,
      'three/addons/': TALKING_HEAD_CDN.THREE_ADDONS,
    },
  });
  document.head.appendChild(importMap);

  // Wait for import map to be processed
  await new Promise(resolve => setTimeout(resolve, 100));

  // Load the TalkingHead module
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { TalkingHead } from '${TALKING_HEAD_CDN.TALKING_HEAD}';
      window.TalkingHead = TalkingHead;
      window.dispatchEvent(new Event('talkinghead-loaded'));
    `;
    
    const handleLoad = () => {
      resolve(window.TalkingHead);
    };
    
    window.addEventListener('talkinghead-loaded', handleLoad, { once: true });
    script.onerror = () => reject(new Error('Failed to load TalkingHead'));
    
    document.head.appendChild(script);
  });
}
