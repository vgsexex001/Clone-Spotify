import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Home, Search, Library, Plus, ChevronLeft, ChevronRight,
  Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Mic2, ListMusic, MonitorSpeaker, Volume2, Volume1, VolumeX,
  Maximize2, ExternalLink, X
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────

const PLAYLISTS = [
  { id: 1, name: 'Músicas Curtidas', image: '/images/covers/liked-songs.png' },
  { id: 2, name: 'Daily Mix 1', image: '/images/covers/daily-mix-1.png' },
  { id: 3, name: 'Coding Bootcamp', image: '/images/covers/coding-bootcamp.png' },
  { id: 4, name: 'Trilha Leitura', image: '/images/covers/trilha-leitura.png' },
  { id: 5, name: 'FROID ¿Dónde?', image: '/images/covers/froid-donde.png' },
  { id: 6, name: 'Matuê', image: '/images/covers/matue.png' },
  { id: 7, name: 'Cérebro 100%', image: '/images/covers/cerebro-100.png' },
  { id: 8, name: 'Brandão85', image: '/images/covers/brandao85.png' },
];

const QUICK_ACCESS = [
  { id: 1, name: 'Músicas Curtidas', image: '/images/covers/liked-songs.png' },
  { id: 2, name: 'Daily Mix 1', image: '/images/covers/daily-mix-1.png' },
  { id: 3, name: 'This Is Coding Bootcamp', image: '/images/covers/coding-bootcamp.png' },
  { id: 4, name: 'Trilha Sonora de Leitura', image: '/images/covers/trilha-leitura.png' },
  { id: 5, name: 'FROID ¿Dónde?', image: '/images/covers/froid-donde.png' },
  { id: 6, name: 'Matuê', image: '/images/covers/matue.png' },
  { id: 7, name: 'Cérebro 100%', image: '/images/covers/cerebro-100.png' },
  { id: 8, name: 'This Is Brandão85', image: '/images/covers/brandao85.png' },
];

const FEATURED_CARD = {
  id: 1,
  name: 'Robyn — LIVE from Los Angeles',
  desc: 'Uma apresentação exclusiva Spotify com os maiores hits',
  image: '/images/covers/robyn-live.png',
};

const MADE_FOR_YOU = [
  { id: 1, name: 'Descobertas da Semana', desc: 'Sua mixtape semanal de músicas fresquinhas', image: '/images/covers/descobertas-semana.png' },
  { id: 2, name: 'Daily Mix 2', desc: 'Coldplay, Imagine Dragons, OneRepublic e mais', image: '/images/covers/daily-mix-2.png' },
  { id: 3, name: 'Daily Mix 3', desc: 'Filipe Ret, Djonga, Racionais e mais', image: '/images/covers/daily-mix-3.png' },
  { id: 4, name: 'Daily Mix 4', desc: 'Lofi chill beats para relaxar e estudar', image: '/images/covers/daily-mix-4.png' },
  { id: 5, name: 'Daily Mix 5', desc: 'Coding music, synthwave, eletrônica e mais', image: '/images/covers/daily-mix-5.png' },
  { id: 6, name: 'Daily Mix 6', desc: 'Charlie Brown Jr., Legião Urbana, Titãs e mais', image: '/images/covers/daily-mix-6.png' },
  { id: 7, name: 'Radar de Novidades', desc: 'Fique por dentro dos seus novos lançamentos', image: '/images/covers/radar-novidades.png' },
];

const RECENTLY_PLAYED = [
  { id: 1, name: 'Músicas Curtidas', subtitle: 'Playlist', image: '/images/covers/liked-songs.png', circular: false },
  { id: 2, name: 'Daily Mix 1', subtitle: 'Playlist', image: '/images/covers/daily-mix-1.png', circular: false },
  { id: 3, name: 'FROID ¿Dónde?', subtitle: 'Álbum', image: '/images/covers/froid-donde.png', circular: false },
  { id: 4, name: 'Coding Bootcamp', subtitle: 'Playlist', image: '/images/covers/coding-bootcamp.png', circular: false },
  { id: 5, name: 'This Is Brandão85', subtitle: 'Playlist', image: '/images/covers/brandao85.png', circular: false },
  { id: 6, name: 'Matuê', subtitle: 'Artista', image: '/images/artists/matue-artist.png', circular: true },
  { id: 7, name: 'Daily Mix 6', subtitle: 'Playlist', image: '/images/covers/daily-mix-6.png', circular: false },
  { id: 8, name: 'Trilha Sonora de Leitura', subtitle: 'Playlist', image: '/images/covers/trilha-leitura.png', circular: false },
  { id: 9, name: 'FLOW ABSURDO!', subtitle: 'Playlist', image: '/images/covers/flow-absurdo.png', circular: false },
  { id: 10, name: 'Músicas para Leituras', subtitle: 'Playlist', image: '/images/covers/musicas-leituras.png', circular: false },
];

const NOW_PLAYING = {
  title: '10K É Pouco Eu Sei',
  artist: 'Raffa Moreira, Klyn',
  album: '10K É Pouco Eu Sei',
  albumImage: '/images/now-playing/10k-e-pouco.png',
  artistImage: '/images/artists/raffa-moreira.png',
  artistFollowers: '2.145.832',
  artistMonthly: '5.678.421',
  artistAbout: 'Raffa Moreira é um rapper e cantor brasileiro de São Paulo, conhecido pelo seu estilo agressivo e letras que retratam a realidade das ruas. Um dos pioneiros do trap brasileiro.',
};

// ─── ProgressBar ───────────────────────────────────────────────

function ProgressBar({ value, max, onChange, className = '' }) {
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
      style={{ height: 12 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        setIsDragging(true);
        onChange(calcValue(e.clientX));
      }}
    >
      <div className="w-full rounded-full h-1 bg-white/30">
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
          className="absolute w-3 h-3 bg-white rounded-full shadow-md"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      )}
    </div>
  );
}

// ─── PlayButton ────────────────────────────────────────────────

function PlayButton({ size = 48, className = '', onClick }) {
  const tri = size * 0.36;
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full bg-sp-green hover:bg-sp-green-light hover:scale-105 transition-all shadow-lg shadow-black/40 cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: `${tri / 2}px solid transparent`,
          borderBottom: `${tri / 2}px solid transparent`,
          borderLeft: `${tri}px solid #000`,
          marginLeft: size * 0.06,
        }}
      />
    </button>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────

function Sidebar() {
  return (
    <div className="flex flex-col gap-2 w-[72px] min-w-[72px] shrink-0">
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
            <img src={pl.image} alt={pl.name} className="w-full h-full object-cover" />
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
    <div className="flex items-center justify-between px-6 pt-4 pb-2 sticky top-0 z-10 bg-sp-base">
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
    <div className="px-6 pt-2 pb-2">
      <div className={`grid gap-2 ${isCompact ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {QUICK_ACCESS.map((item) => (
          <button
            key={item.id}
            className="group flex items-center bg-white/10 hover:bg-white/20 rounded overflow-hidden h-14 transition-colors cursor-pointer"
            onClick={onPlay}
          >
            <div className="w-14 h-14 shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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

// ─── FeaturedSection ───────────────────────────────────────────

function FeaturedSection({ onPlay }) {
  return (
    <div className="px-6 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">Escolhido para você</h2>
        <button className="text-sm font-semibold text-sp-text-sub hover:text-white transition-colors cursor-pointer">
          Mostrar tudo
        </button>
      </div>
      <div className="group relative bg-sp-surface hover:bg-sp-elevated rounded-lg overflow-hidden cursor-pointer transition-colors flex h-[220px]">
        <div className="w-[220px] h-[220px] shrink-0">
          <img src={FEATURED_CARD.image} alt={FEATURED_CARD.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-end p-5 flex-1 min-w-0">
          <span className="text-xs text-sp-text-sub font-medium uppercase tracking-wider mb-1">Spotify Presents</span>
          <h3 className="text-2xl font-bold text-white mb-2 truncate">{FEATURED_CARD.name}</h3>
          <p className="text-sm text-sp-text-sub line-clamp-2">{FEATURED_CARD.desc}</p>
        </div>
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <PlayButton size={48} onClick={onPlay} />
        </div>
      </div>
    </div>
  );
}

// ─── ScrollSection ─────────────────────────────────────────────

function ScrollSection({ title, children }) {
  return (
    <section className="mb-2">
      <div className="flex items-center justify-between mb-3 px-6">
        <h2 className="text-xl font-bold text-white hover:underline cursor-pointer">{title}</h2>
        <button className="text-sm font-semibold text-sp-text-sub hover:text-white transition-colors cursor-pointer">
          Mostrar tudo
        </button>
      </div>
      <div
        className="flex gap-4 overflow-x-auto px-6 pb-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}

// ─── MediaCard ─────────────────────────────────────────────────

function MediaCard({ image, name, desc, circular = false, onPlay }) {
  return (
    <div
      className="group flex flex-col bg-sp-surface hover:bg-sp-elevated rounded-lg p-3 transition-colors cursor-pointer shrink-0 w-[164px]"
    >
      <div className="relative mb-3">
        <img
          src={image}
          alt={name}
          className={`shadow-lg shadow-black/40 object-cover ${
            circular
              ? 'w-[140px] h-[140px] rounded-full mx-auto'
              : 'w-full aspect-square rounded-md'
          }`}
        />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <PlayButton size={44} onClick={onPlay} />
        </div>
      </div>
      <span className={`text-sm font-semibold text-white truncate ${circular ? 'text-center' : ''}`}>{name}</span>
      {desc && <span className="text-xs text-sp-text-sub mt-1 line-clamp-2 leading-relaxed">{desc}</span>}
    </div>
  );
}

// ─── RightPanel ────────────────────────────────────────────────

function RightPanel({ isLiked, onToggleLike, onClose }) {
  return (
    <div className="w-[350px] min-w-[350px] shrink-0 bg-sp-base rounded-lg overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-bold text-white">{NOW_PLAYING.artist}</span>
        <button onClick={onClose} className="text-sp-text-sub hover:text-white transition cursor-pointer">
          <X size={18} />
        </button>
      </div>

      <div className="px-4 pb-3">
        <img
          src={NOW_PLAYING.albumImage}
          alt={NOW_PLAYING.album}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
      </div>

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

      <div className="px-4 pb-4">
        <div className="bg-sp-surface rounded-lg overflow-hidden">
          <div className="relative h-[200px] flex items-end">
            <img
              src={NOW_PLAYING.artistImage}
              alt={NOW_PLAYING.artist}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
      <div className="flex items-center gap-3 w-[280px] min-w-[200px]">
        <div className="w-14 h-14 rounded shrink-0 overflow-hidden">
          <img src={NOW_PLAYING.albumImage} alt={NOW_PLAYING.album} className="w-full h-full object-cover" />
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
              ? <Pause size={16} className="text-black fill-black" />
              : <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #000', marginLeft: 2 }} />
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
          <ProgressBar value={progress} max={duration} onChange={onProgressChange} className="flex-1" />
          <span className="text-[11px] text-sp-text-sub w-10 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

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
          <ProgressBar value={volume} max={100} onChange={onVolumeChange} className="flex-1" />
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
      <div className="flex flex-1 gap-2 p-2 overflow-hidden">
        <Sidebar />

        <main className="flex-1 bg-sp-base rounded-lg overflow-y-auto overflow-x-hidden min-w-0">
          <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
          <QuickAccessGrid isCompact={isCompact} onPlay={() => setIsPlaying(true)} />
          <FeaturedSection onPlay={() => setIsPlaying(true)} />
          <ScrollSection title="Feito para você">
            {MADE_FOR_YOU.map((item) => (
              <MediaCard key={item.id} image={item.image} name={item.name} desc={item.desc} onPlay={() => setIsPlaying(true)} />
            ))}
          </ScrollSection>
          <ScrollSection title="Tocados recentemente">
            {RECENTLY_PLAYED.map((item) => (
              <MediaCard key={item.id} image={item.image} name={item.name} desc={item.subtitle} circular={item.circular} onPlay={() => setIsPlaying(true)} />
            ))}
          </ScrollSection>
          <div className="h-8" />
        </main>

        {showRightPanel && (
          <RightPanel
            isLiked={isLiked}
            onToggleLike={() => setIsLiked(!isLiked)}
            onClose={() => setShowRightPanel(false)}
          />
        )}
      </div>

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
