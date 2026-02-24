import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Home, Search, Library, Plus, ChevronLeft, ChevronRight,
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Mic2, ListMusic, MonitorSpeaker, Volume2, Volume1, VolumeX,
  Maximize2, MoreHorizontal, ChevronDown, ExternalLink, X
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────

const PALETTE = [
  '#E13300', '#1E3264', '#8C1932', '#148A08',
  '#E8115B', '#509BF5', '#BA5D07', '#27856A',
  '#8D67AB', '#A56752', '#477D95', '#1DB954',
];

const PLAYLISTS = [
  { id: 1, name: 'Músicas Curtidas', type: 'playlist', special: true },
  { id: 2, name: 'Discover Weekly', type: 'playlist', color: 0 },
  { id: 3, name: 'Rock Clássico', type: 'playlist', color: 1 },
  { id: 4, name: 'Pop Brasil', type: 'playlist', color: 4 },
  { id: 5, name: 'Lo-Fi Beats', type: 'playlist', color: 7 },
  { id: 6, name: 'Indie Mix', type: 'playlist', color: 8 },
  { id: 7, name: 'Workout', type: 'playlist', color: 3 },
  { id: 8, name: 'Chill Vibes', type: 'playlist', color: 6 },
];

const QUICK_ACCESS = [
  { id: 1, name: 'Músicas Curtidas', special: true },
  { id: 2, name: 'Discover Weekly', color: 0 },
  { id: 3, name: 'Rock Clássico', color: 1 },
  { id: 4, name: 'Daily Mix 1', color: 3, dailyMix: 1 },
  { id: 5, name: 'Pop Brasil', color: 4 },
  { id: 6, name: 'Lo-Fi Beats', color: 7 },
  { id: 7, name: 'Indie Mix', color: 8 },
  { id: 8, name: 'Chill Vibes', color: 6 },
];

const FEATURED_CARDS = [
  { id: 1, name: 'Daily Mix 1', desc: 'Ana Vitória, Tiago Iorc, Anavitória e mais', color: 3, dailyMix: 1 },
  { id: 2, name: 'Daily Mix 2', desc: 'Coldplay, Imagine Dragons, OneRepublic e mais', color: 9, dailyMix: 2 },
  { id: 3, name: 'Daily Mix 3', desc: 'Charlie Brown Jr., Legião Urbana, Titãs e mais', color: 1, dailyMix: 3 },
  { id: 4, name: 'Daily Mix 4', desc: 'Billie Eilish, Lana Del Rey, Arctic Monkeys e mais', color: 8, dailyMix: 4 },
  { id: 5, name: 'Daily Mix 5', desc: 'Djavan, Milton Nascimento, Gilberto Gil e mais', color: 7, dailyMix: 5 },
  { id: 6, name: 'Daily Mix 6', desc: 'Ludmilla, Anitta, MC Kevinho e mais', color: 4, dailyMix: 6 },
];

const MADE_FOR_YOU = [
  { id: 1, name: 'Radar de Novidades', desc: 'Fique por dentro dos seus novos lançamentos', color: 0 },
  { id: 2, name: 'Descobertas da Semana', desc: 'Sua mixtape semanal de músicas fresquinhas', color: 5 },
  { id: 3, name: 'Déjà Vu', desc: 'As músicas que você não escuta há um tempo', color: 10 },
  { id: 4, name: 'Mix Relaxar', desc: 'Chill lo-fi beats para estudar e relaxar', color: 7 },
  { id: 5, name: 'Mix Energia', desc: 'Motivação pura para o treino', color: 3 },
  { id: 6, name: 'Repeteco', desc: 'As músicas que você mais ouviu', color: 4 },
];

const RECENT_ARTISTS = [
  { id: 1, name: 'Tiago Iorc', type: 'artist', initials: 'TI', color: 1 },
  { id: 2, name: 'Ana Vitória', type: 'artist', initials: 'AV', color: 4 },
  { id: 3, name: 'Coldplay', type: 'artist', initials: 'CP', color: 5 },
  { id: 4, name: 'Billie Eilish', type: 'artist', initials: 'BE', color: 8 },
  { id: 5, name: 'Charlie Brown Jr.', type: 'artist', initials: 'CB', color: 0 },
  { id: 6, name: 'Djavan', type: 'artist', initials: 'DJ', color: 7 },
  { id: 7, name: 'Legião Urbana', type: 'artist', initials: 'LU', color: 1 },
  { id: 8, name: 'Anitta', type: 'artist', initials: 'AN', color: 4 },
];

const NOW_PLAYING = {
  title: 'Amei Te Ver',
  artist: 'Tiago Iorc',
  album: 'Reconstrução',
  artistInitials: 'TI',
  color: 1,
  artistFollowers: '4.832.519',
  artistMonthly: '8.245.102',
  artistAbout: 'Tiago Iorc é um cantor, compositor e multi-instrumentista brasileiro, conhecido por suas composições poéticas e melodias envolventes.',
};

// ─── PlaceholderImage ──────────────────────────────────────────

function PlaceholderImage({ name, color, special, dailyMix, initials, circular, size = 'full', className = '' }) {
  if (special) {
    return (
      <div
        className={`flex items-center justify-center ${circular ? 'rounded-full' : 'rounded'} ${className}`}
        style={{
          background: 'linear-gradient(135deg, #450AF5, #C4EFD9)',
          width: size === 'full' ? '100%' : size,
          height: size === 'full' ? '100%' : size,
          aspectRatio: size === 'full' ? '1' : undefined,
        }}
      >
        <Heart className="w-1/3 h-1/3 fill-white text-white" />
      </div>
    );
  }

  const colorIdx = typeof color === 'number' ? color : 0;
  const bg1 = PALETTE[colorIdx % PALETTE.length];
  const bg2 = PALETTE[(colorIdx + 3) % PALETTE.length];

  return (
    <div
      className={`relative flex items-center justify-center ${circular ? 'rounded-full' : 'rounded'} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
        width: size === 'full' ? '100%' : size,
        height: size === 'full' ? '100%' : size,
        aspectRatio: size === 'full' ? '1' : undefined,
      }}
    >
      {initials ? (
        <span className="text-2xl font-bold text-white/90 select-none">{initials}</span>
      ) : dailyMix ? (
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-white/80 leading-none">DAILY</span>
          <span className="text-3xl font-extrabold text-white leading-none">{dailyMix}</span>
          <span className="text-xs font-medium text-white/80 leading-none">MIX</span>
        </div>
      ) : (
        <span className="text-xs font-semibold text-white/70 text-center px-1 select-none leading-tight">
          {name}
        </span>
      )}
    </div>
  );
}

// ─── ProgressBar ───────────────────────────────────────────────

function ProgressBar({ value, max, onChange, className = '', thin = false }) {
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const percent = max > 0 ? (value / max) * 100 : 0;

  const calcValue = useCallback((clientX) => {
    if (!barRef.current) return value;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * max;
  }, [max, value]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => onChange(calcValue(e.clientX));
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, calcValue, onChange]);

  const showActive = isHovered || isDragging;

  return (
    <div
      ref={barRef}
      className={`relative flex items-center cursor-pointer group ${className}`}
      style={{ height: thin ? 12 : 16 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        setIsDragging(true);
        onChange(calcValue(e.clientX));
      }}
    >
      <div className={`w-full rounded-full ${thin ? 'h-1' : 'h-1'} bg-white/30`}>
        <div
          className="h-full rounded-full transition-colors"
          style={{
            width: `${percent}%`,
            backgroundColor: showActive ? '#1DB954' : '#fff',
          }}
        />
      </div>
      {showActive && (
        <div
          className="absolute w-3 h-3 bg-white rounded-full shadow-md -translate-y-0"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      )}
    </div>
  );
}

// ─── PlayButton ────────────────────────────────────────────────

function PlayButton({ size = 48, className = '', onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full bg-sp-green hover:bg-sp-green-light hover:scale-105 transition-all shadow-lg shadow-black/40 cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <Play className="text-black fill-black" style={{ width: size * 0.4, height: size * 0.4, marginLeft: size * 0.05 }} />
    </button>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────

function Sidebar() {
  return (
    <div className="flex flex-col gap-2 w-[72px] min-w-[72px] shrink-0">
      {/* Top navigation */}
      <div className="bg-sp-base rounded-lg flex flex-col items-center py-3 gap-5">
        <button className="flex flex-col items-center gap-0.5 text-white hover:text-white transition-colors cursor-pointer">
          <Home size={24} />
          <span className="text-[10px] font-semibold">Início</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-sp-text-sub hover:text-white transition-colors cursor-pointer">
          <Search size={24} />
          <span className="text-[10px] font-semibold">Buscar</span>
        </button>
      </div>

      {/* Library */}
      <div className="bg-sp-base rounded-lg flex flex-col items-center flex-1 py-3 gap-1 overflow-y-auto">
        <button className="flex flex-col items-center gap-0.5 text-sp-text-sub hover:text-white transition-colors mb-2 cursor-pointer">
          <Library size={24} />
          <span className="text-[10px] font-semibold">Biblioteca</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-sp-tinted hover:bg-sp-highlight text-sp-text-sub hover:text-white transition-colors mb-2 cursor-pointer">
          <Plus size={16} />
        </button>
        {PLAYLISTS.map((pl) => (
          <button
            key={pl.id}
            className="w-10 h-10 rounded overflow-hidden shrink-0 hover:ring-1 hover:ring-white/20 transition-all cursor-pointer mb-0.5"
            title={pl.name}
          >
            <PlaceholderImage
              name={pl.name}
              color={pl.color}
              special={pl.special}
              size="full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TopBar ────────────────────────────────────────────────────

function TopBar({ activeTab, onTabChange }) {
  const tabs = ['Tudo', 'Música', 'Podcasts'];

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 z-10 bg-sp-base">
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer">
          <ChevronLeft size={18} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer">
          <ChevronRight size={18} />
        </button>
        <div className="flex items-center gap-2 ml-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-sp-tinted text-white hover:bg-sp-highlight'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-sp-tinted hover:bg-sp-highlight hover:scale-105 transition-all text-white cursor-pointer">
          <ExternalLink size={16} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-sp-green hover:bg-sp-green-light hover:scale-105 transition-all text-black font-bold text-sm cursor-pointer">
          D
        </button>
      </div>
    </div>
  );
}

// ─── QuickAccessGrid ───────────────────────────────────────────

function QuickAccessGrid({ isCompact, onPlay }) {
  return (
    <div className="px-4 pt-2 pb-2">
      <div className={`grid gap-2 ${isCompact ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {QUICK_ACCESS.map((item) => (
          <button
            key={item.id}
            className="group flex items-center bg-white/10 hover:bg-white/20 rounded overflow-hidden h-14 transition-colors cursor-pointer"
            onClick={onPlay}
          >
            <div className="w-14 h-14 shrink-0">
              <PlaceholderImage
                name={item.name}
                color={item.color}
                special={item.special}
                dailyMix={item.dailyMix}
                size="full"
                className="!rounded-none"
              />
            </div>
            <span className="flex-1 text-sm font-semibold text-white px-3 truncate text-left">
              {item.name}
            </span>
            <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 pr-2">
              <PlayButton size={32} onClick={onPlay} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SectionRow ────────────────────────────────────────────────

function SectionRow({ title, items, onPlay }) {
  const scrollRef = useRef(null);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">{title}</h2>
        <button className="text-sm font-semibold text-sp-text-sub hover:text-white transition-colors cursor-pointer">
          Mostrar tudo
        </button>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col bg-sp-surface hover:bg-sp-elevated rounded-lg p-3 transition-colors cursor-pointer shrink-0"
            style={{ width: 170 }}
          >
            <div className="relative mb-3">
              <PlaceholderImage
                name={item.name}
                color={item.color}
                dailyMix={item.dailyMix}
                size="full"
                className="rounded-md shadow-lg shadow-black/40"
              />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <PlayButton size={44} onClick={onPlay} />
              </div>
            </div>
            <span className="text-sm font-semibold text-white truncate">{item.name}</span>
            <span className="text-xs text-sp-text-sub mt-1 line-clamp-2 leading-relaxed">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RecentlyPlayed ────────────────────────────────────────────

function RecentlyPlayed({ onPlay }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">Tocados recentemente</h2>
        <button className="text-sm font-semibold text-sp-text-sub hover:text-white transition-colors cursor-pointer">
          Mostrar tudo
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {RECENT_ARTISTS.map((artist) => (
          <div
            key={artist.id}
            className="group flex flex-col items-center bg-sp-surface hover:bg-sp-elevated rounded-lg p-3 transition-colors cursor-pointer shrink-0"
            style={{ width: 170 }}
          >
            <div className="relative mb-3 w-full flex justify-center">
              <PlaceholderImage
                initials={artist.initials}
                color={artist.color}
                circular
                size={140}
                className="shadow-lg shadow-black/40"
              />
              <div className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <PlayButton size={44} onClick={onPlay} />
              </div>
            </div>
            <span className="text-sm font-semibold text-white truncate w-full text-center">{artist.name}</span>
            <span className="text-xs text-sp-text-sub mt-0.5">Artista</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RightPanel ────────────────────────────────────────────────

function RightPanel({ isLiked, onToggleLike, onClose }) {
  return (
    <div className="w-[350px] min-w-[350px] shrink-0 bg-sp-base rounded-lg overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-bold text-white">{NOW_PLAYING.artist}</span>
        <button onClick={onClose} className="text-sp-text-sub hover:text-white transition cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* Album Art */}
      <div className="px-4 pb-3">
        <PlaceholderImage
          name={NOW_PLAYING.album}
          color={NOW_PLAYING.color}
          size="full"
          className="rounded-lg shadow-lg"
        />
      </div>

      {/* Song Info */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-white truncate">{NOW_PLAYING.title}</p>
            <p className="text-sm text-sp-text-sub truncate">{NOW_PLAYING.artist}</p>
          </div>
          <button
            onClick={onToggleLike}
            className={`ml-3 transition cursor-pointer ${isLiked ? 'text-sp-green' : 'text-sp-text-sub hover:text-white'}`}
          >
            <Heart size={20} className={isLiked ? 'fill-sp-green' : ''} />
          </button>
        </div>
      </div>

      {/* About the Artist */}
      <div className="px-4 pb-4">
        <div className="bg-sp-surface rounded-lg overflow-hidden">
          <div className="relative h-40 flex items-end">
            <PlaceholderImage
              initials={NOW_PLAYING.artistInitials}
              color={NOW_PLAYING.color}
              size="full"
              className="absolute inset-0 !rounded-none"
            />
            <div className="relative z-10 p-4">
              <span className="text-sm font-bold text-white">Sobre o artista</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-base font-bold text-white">{NOW_PLAYING.artist}</p>
                <p className="text-xs text-sp-text-sub">{NOW_PLAYING.artistMonthly} ouvintes mensais</p>
              </div>
              <button className="px-4 py-1.5 rounded-full border border-white/30 text-sm font-semibold text-white hover:border-white hover:scale-105 transition-all cursor-pointer">
                Seguir
              </button>
            </div>
            <p className="text-sm text-sp-text-sub leading-relaxed line-clamp-3">
              {NOW_PLAYING.artistAbout}
            </p>
            <p className="text-xs text-sp-text-sub mt-2">{NOW_PLAYING.artistFollowers} seguidores</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PlayerBar ─────────────────────────────────────────────────

function PlayerBar({
  isPlaying, onTogglePlay,
  progress, duration, onProgressChange,
  volume, onVolumeChange,
  isLiked, onToggleLike,
  isShuffle, onToggleShuffle,
  repeatMode, onToggleRepeat,
}) {
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className="h-[72px] bg-black flex items-center px-4 gap-4 select-none">
      {/* Left: Now Playing */}
      <div className="flex items-center gap-3 w-[280px] min-w-[200px]">
        <div className="w-14 h-14 rounded shrink-0 overflow-hidden">
          <PlaceholderImage name={NOW_PLAYING.album} color={NOW_PLAYING.color} size="full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate hover:underline cursor-pointer">{NOW_PLAYING.title}</p>
          <p className="text-xs text-sp-text-sub truncate hover:text-white hover:underline cursor-pointer">{NOW_PLAYING.artist}</p>
        </div>
        <button
          onClick={onToggleLike}
          className={`ml-1 transition cursor-pointer ${isLiked ? 'text-sp-green' : 'text-sp-text-sub hover:text-white'}`}
        >
          <Heart size={16} className={isLiked ? 'fill-sp-green' : ''} />
        </button>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center flex-1 max-w-[600px]">
        <div className="flex items-center gap-4 mb-1">
          <button
            onClick={onToggleShuffle}
            className={`relative transition cursor-pointer ${isShuffle ? 'text-sp-green' : 'text-sp-text-sub hover:text-white'}`}
          >
            <Shuffle size={18} />
            {isShuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sp-green rounded-full" />}
          </button>
          <button className="text-sp-text-sub hover:text-white transition cursor-pointer">
            <SkipBack size={20} className="fill-current" />
          </button>
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:scale-105 transition-transform cursor-pointer"
          >
            {isPlaying
              ? <Pause size={18} className="text-black fill-black" />
              : <Play size={18} className="text-black fill-black ml-0.5" />
            }
          </button>
          <button className="text-sp-text-sub hover:text-white transition cursor-pointer">
            <SkipForward size={20} className="fill-current" />
          </button>
          <button
            onClick={onToggleRepeat}
            className={`relative transition cursor-pointer ${repeatMode !== 'off' ? 'text-sp-green' : 'text-sp-text-sub hover:text-white'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            {repeatMode !== 'off' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sp-green rounded-full" />}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[11px] text-sp-text-sub w-10 text-right tabular-nums">{formatTime(progress)}</span>
          <ProgressBar value={progress} max={duration} onChange={onProgressChange} className="flex-1" thin />
          <span className="text-[11px] text-sp-text-sub w-10 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & extras */}
      <div className="flex items-center gap-3 w-[280px] min-w-[200px] justify-end">
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
            onClick={() => onVolumeChange(volume === 0 ? 70 : 0)}
            className="text-sp-text-sub hover:text-white transition cursor-pointer"
          >
            <VolumeIcon size={16} />
          </button>
          <ProgressBar value={volume} max={100} onChange={onVolumeChange} className="flex-1" thin />
        </div>
        <button className="text-sp-text-sub hover:text-white transition cursor-pointer">
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── SpotifyClone (Root) ───────────────────────────────────────

export default function SpotifyClone() {
  const [activeTab, setActiveTab] = useState('Tudo');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(67);
  const [duration] = useState(243);
  const [volume, setVolume] = useState(70);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  // Simulate progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= duration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      setShowRightPanel(window.innerWidth >= 1200);
      setIsCompact(window.innerWidth < 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Main area */}
      <div className="flex flex-1 gap-2 p-2 overflow-hidden">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 bg-sp-base rounded-lg overflow-y-auto overflow-x-hidden min-w-0">
          <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
          <QuickAccessGrid isCompact={isCompact} onPlay={() => setIsPlaying(true)} />
          <SectionRow title="Escolhido para você" items={FEATURED_CARDS} onPlay={() => setIsPlaying(true)} />
          <SectionRow title="Feito para você" items={MADE_FOR_YOU} onPlay={() => setIsPlaying(true)} />
          <RecentlyPlayed onPlay={() => setIsPlaying(true)} />
          <div className="h-8" />
        </main>

        {/* Right panel */}
        {showRightPanel && (
          <RightPanel
            isLiked={isLiked}
            onToggleLike={() => setIsLiked(!isLiked)}
            onClose={() => setShowRightPanel(false)}
          />
        )}
      </div>

      {/* Player bar */}
      <PlayerBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        progress={progress}
        duration={duration}
        onProgressChange={setProgress}
        volume={volume}
        onVolumeChange={setVolume}
        isLiked={isLiked}
        onToggleLike={() => setIsLiked(!isLiked)}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        repeatMode={repeatMode}
        onToggleRepeat={toggleRepeat}
      />
    </div>
  );
}
