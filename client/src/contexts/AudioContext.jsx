import { createContext, useContext } from 'react';
import useAudioPlayer from '../hooks/useAudioPlayer';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audio = useAudioPlayer();
  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
