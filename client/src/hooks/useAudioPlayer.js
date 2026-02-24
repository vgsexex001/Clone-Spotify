import { useState, useRef, useCallback, useEffect } from 'react';
import { user as userApi } from '../services/api';

export default function useAudioPlayer() {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize audio element once
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.7;
  }

  const audio = audioRef.current;

  // Audio event listeners
  useEffect(() => {
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onCanPlay = () => setIsLoading(false);
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };
    const onError = () => {
      console.error('Audio playback error');
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [repeatMode]);

  const recordHistory = useCallback((track) => {
    // Fire-and-forget
    userApi.recordHistory({
      trackId: track.id,
      source: track.source,
      title: track.title,
      artist: track.artist,
      album: track.album,
      albumCover: track.albumCover,
      previewUrl: track.previewUrl,
      duration: track.duration,
    }).catch(() => {}); // Silently fail for unauthenticated users
  }, []);

  const play = useCallback((track) => {
    if (!track?.previewUrl) return;
    setCurrentTrack(track);
    setIsLoading(true);
    audio.src = track.previewUrl;
    audio.play().then(() => {
      setIsPlaying(true);
      recordHistory(track);
    }).catch(() => {
      setIsPlaying(false);
      setIsLoading(false);
    });
  }, [recordHistory]);

  const pause = useCallback(() => {
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      pause();
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, currentTrack, pause]);

  const seek = useCallback((time) => {
    audio.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((vol) => {
    const v = Math.max(0, Math.min(100, vol));
    setVolumeState(v);
    audio.volume = v / 100;
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    setQueueIndex(nextIndex);
    play(queue[nextIndex]);
  }, [queue, queueIndex, isShuffle, repeatMode, play]);

  const previous = useCallback(() => {
    // If more than 3s into track, restart it
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (queue.length === 0) return;
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
    }
    setQueueIndex(prevIndex);
    play(queue[prevIndex]);
  }, [queue, queueIndex, repeatMode, play]);

  const playTrackList = useCallback((tracks, startIndex = 0) => {
    if (!tracks || tracks.length === 0) return;
    setQueue(tracks);
    setQueueIndex(startIndex);
    play(tracks[startIndex]);
  }, [play]);

  const addToQueue = useCallback((track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  // Expose next as a stable reference
  const next = nextTrack;

  return {
    currentTrack,
    queue,
    isPlaying,
    progress,
    duration,
    volume,
    isShuffle,
    repeatMode,
    isLoading,
    play,
    pause,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    playTrackList,
    addToQueue,
  };
}
