import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';

export default function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { togglePlay, seek, progress, setVolume, volume, next, previous } = useAudio();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(progress + 5, 999));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(progress - 5, 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(volume + 5, 100));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(volume - 5, 0));
          break;
        case 'm':
        case 'M':
          setVolume(volume === 0 ? 70 : 0);
          break;
        case '/':
          e.preventDefault();
          navigate('/search');
          break;
        case 'n':
        case 'N':
          if (e.shiftKey) {
            next();
          }
          break;
        case 'p':
        case 'P':
          if (e.shiftKey) {
            previous();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, progress, setVolume, volume, navigate, next, previous]);
}
