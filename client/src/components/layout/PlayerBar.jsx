import {
  Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Mic2, ListMusic, MonitorSpeaker, Volume2, Volume1, VolumeX,
  Maximize2,
} from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { formatTime } from '../../utils/formatTime';
import { useAudio } from '../../contexts/AudioContext';
import { NOW_PLAYING } from '../../data/mockData';

export default function PlayerBar() {
  const {
    currentTrack, isPlaying, progress, duration, volume,
    isShuffle, repeatMode, togglePlay, next, previous,
    seek, setVolume, toggleShuffle, toggleRepeat,
  } = useAudio();

  const track = currentTrack || {
    title: NOW_PLAYING.title,
    artist: NOW_PLAYING.artist,
    albumCover: NOW_PLAYING.albumImage,
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="h-[72px] bg-black grid grid-cols-3 items-center px-4 gap-2 select-none">
      {/* Left: Now Playing */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-14 h-14 rounded shrink-0 overflow-hidden">
          <img src={track.albumCover || NOW_PLAYING.albumImage} alt={track.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate hover:underline cursor-pointer">{track.title}</p>
          <p className="text-xs text-sp-text-sub truncate hover:text-white hover:underline cursor-pointer">{track.artist}</p>
        </div>
        <button className="ml-1 transition cursor-pointer text-sp-text-sub hover:text-white">
          <Heart size={16} />
        </button>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-4 mb-1">
          <button
            onClick={toggleShuffle}
            className={`relative transition cursor-pointer ${isShuffle ? 'text-sp-green' : 'text-sp-text-sub hover:text-white'}`}
          >
            <Shuffle size={18} />
            {isShuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sp-green rounded-full" />}
          </button>
          <button onClick={previous} className="text-sp-text-sub hover:text-white transition cursor-pointer">
            <SkipBack size={20} className="fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:scale-105 transition-transform cursor-pointer"
          >
            {isPlaying
              ? <Pause size={16} className="text-black fill-black" />
              : <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #000', marginLeft: 2 }} />
            }
          </button>
          <button onClick={next} className="text-sp-text-sub hover:text-white transition cursor-pointer">
            <SkipForward size={20} className="fill-current" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`relative transition cursor-pointer ${repeatMode !== 'off' ? 'text-sp-green' : 'text-sp-text-sub hover:text-white'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            {repeatMode !== 'off' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sp-green rounded-full" />}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-[600px]">
          <span className="text-[11px] text-sp-text-sub w-10 text-right tabular-nums">{formatTime(progress)}</span>
          <ProgressBar value={progress} max={duration} onChange={seek} className="flex-1" />
          <span className="text-[11px] text-sp-text-sub w-10 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & extras */}
      <div className="flex items-center gap-3 justify-end min-w-0">
        <button className="text-sp-text-sub hover:text-white transition cursor-pointer">
          <Mic2 size={16} />
        </button>
        <button className="text-sp-text-sub hover:text-white transition cursor-pointer">
          <ListMusic size={16} />
        </button>
        <button className="text-sp-text-sub hover:text-white transition cursor-pointer">
          <MonitorSpeaker size={16} />
        </button>
        <div className="flex items-center gap-1.5 w-[120px]">
          <button
            onClick={() => setVolume(volume === 0 ? 70 : 0)}
            className="text-sp-text-sub hover:text-white transition cursor-pointer"
          >
            <VolumeIcon size={16} />
          </button>
          <ProgressBar value={volume} max={100} onChange={setVolume} className="flex-1" />
        </div>
        <button className="text-sp-text-sub hover:text-white transition cursor-pointer">
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}
