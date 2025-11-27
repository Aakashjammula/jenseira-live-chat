// Custom hook for avatar management
import { useEffect, useRef, useState } from 'react';
import { initAvatar, loadAvatar } from '@/lib';

export function useAvatar(containerRef: React.RefObject<HTMLDivElement>) {
  const [status, setStatus] = useState('Loading avatar...');
  const headRef = useRef<any | null>(null);

  useEffect(() => {
    const init = async () => {
      if (containerRef.current && !headRef.current) {
        try {
          headRef.current = await initAvatar(containerRef.current);
          await loadAvatar(headRef.current, setStatus);
        } catch (error) {
          console.error('Failed to initialize avatar:', error);
          setStatus('Failed to load avatar');
        }
      }
    };
    
    init();
  }, [containerRef]);

  return { head: headRef.current, status };
}
