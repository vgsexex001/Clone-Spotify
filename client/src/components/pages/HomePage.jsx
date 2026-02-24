import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayButton from '../ui/PlayButton';
import MediaCard from '../ui/MediaCard';
import ScrollSection from '../ui/ScrollSection';
import { useAudio } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/AuthContext';
import { music as musicApi, user as userApi } from '../../services/api';
import { QUICK_ACCESS, FEATURED_CARD, MADE_FOR_YOU, RECENTLY_PLAYED } from '../../data/mockData';

export default function HomePage({ isCompact }) {
  const { playTrackList } = useAudio();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [charts, setCharts] = useState(null);
  const [history, setHistory] = useState(null);
  const [dailyMixes, setDailyMixes] = useState(null);

  useEffect(() => {
    musicApi.getCharts().then(setCharts).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      userApi.getHistory(20).then(data => setHistory(data.history)).catch(() => {});
      userApi.getDailyMixes().then(data => setDailyMixes(data.mixes)).catch(() => {});
    }
  }, [user]);

  const handlePlayChartTrack = (tracks, index) => {
    if (tracks && tracks.length > 0) {
      playTrackList(tracks, index);
    }
  };

  // Use real recently played if available
  const recentItems = history && history.length > 0
    ? history.slice(0, 10).map((h, i) => ({
        id: i,
        name: h.title,
        subtitle: h.artist,
        image: h.album_cover || '/images/covers/liked-songs.png',
        circular: false,
        track: {
          id: h.track_id,
          source: h.source,
          title: h.title,
          artist: h.artist,
          album: h.album,
          albumCover: h.album_cover,
          previewUrl: h.preview_url,
          duration: h.duration,
        },
      }))
    : RECENTLY_PLAYED;

  // Use real daily mixes if available
  const madeForYouItems = dailyMixes && dailyMixes.length > 0
    ? dailyMixes.map(m => ({
        id: m.id,
        name: m.name,
        desc: m.description,
        image: m.cover_url || '/images/covers/daily-mix-1.png',
        tracks: m.tracks,
      }))
    : MADE_FOR_YOU;

  return (
    <>
      {/* Quick Access Grid */}
      <div className="px-6 pt-2 pb-2">
        <div className={`grid gap-2 ${isCompact ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {QUICK_ACCESS.map((item) => (
            <button
              key={item.id}
              className="group flex items-center bg-white/10 hover:bg-white/20 rounded overflow-hidden h-14 transition-colors cursor-pointer"
              onClick={() => {
                if (charts?.tracks?.length > 0) {
                  playTrackList(charts.tracks, item.id - 1 < charts.tracks.length ? item.id - 1 : 0);
                }
              }}
            >
              <div className="w-14 h-14 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <span className="flex-1 text-sm font-semibold text-white px-3 truncate text-left">
                {item.name}
              </span>
              <div className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 pr-2">
                <PlayButton size={32} onClick={(e) => e.stopPropagation()} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Section */}
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
            <PlayButton size={48} onClick={() => {
              if (charts?.tracks?.length > 0) playTrackList(charts.tracks, 0);
            }} />
          </div>
        </div>
      </div>

      {/* Charts / Trending */}
      {charts?.tracks?.length > 0 && (
        <ScrollSection title="Em alta">
          {charts.tracks.slice(0, 10).map((track, i) => (
            <MediaCard
              key={track.id}
              image={track.albumCover}
              name={track.title}
              desc={track.artist}
              onPlay={() => handlePlayChartTrack(charts.tracks, i)}
            />
          ))}
        </ScrollSection>
      )}

      {/* Made For You / Daily Mixes */}
      <ScrollSection title="Feito para você">
        {madeForYouItems.map((item, i) => (
          <MediaCard
            key={item.id}
            image={item.image}
            name={item.name}
            desc={item.desc}
            onPlay={() => {
              if (item.tracks?.length > 0) {
                playTrackList(item.tracks, 0);
              }
            }}
          />
        ))}
      </ScrollSection>

      {/* Recently Played */}
      <ScrollSection title="Tocados recentemente">
        {recentItems.map((item, i) => (
          <MediaCard
            key={item.id}
            image={item.image}
            name={item.name}
            desc={item.subtitle || item.desc}
            circular={item.circular}
            onPlay={() => {
              if (item.track) {
                playTrackList([item.track], 0);
              }
            }}
          />
        ))}
      </ScrollSection>

      {/* Top Artists from charts */}
      {charts?.artists?.length > 0 && (
        <ScrollSection title="Artistas populares">
          {charts.artists.slice(0, 8).map((artist) => (
            <MediaCard
              key={artist.id}
              image={artist.image}
              name={artist.name}
              desc="Artista"
              circular
              onPlay={() => navigate(`/artist/${artist.source}/${artist.id}`)}
            />
          ))}
        </ScrollSection>
      )}

      <div className="h-8" />
    </>
  );
}
