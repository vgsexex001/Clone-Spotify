import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { music as musicApi } from '../../services/api';
import { useAudio } from '../../contexts/AudioContext';
import { formatTime } from '../../utils/formatTime';
import PlayButton from '../ui/PlayButton';
import MediaCard from '../ui/MediaCard';
import ScrollSection from '../ui/ScrollSection';

export default function ArtistPage() {
  const { source, id } = useParams();
  const { playTrackList } = useAudio();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    musicApi.getArtist(source, id)
      .then(setArtist)
      .catch(() => setArtist(null))
      .finally(() => setLoading(false));
  }, [source, id]);

  if (loading) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse">
          <div className="h-48 bg-sp-elevated rounded-lg mb-6" />
          <div className="h-6 w-48 bg-sp-elevated rounded mb-3" />
          <div className="h-4 w-32 bg-sp-elevated rounded" />
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="px-6 py-8 text-center text-sp-text-sub">
        <p className="text-lg">Artista não encontrado</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="relative h-[300px] flex items-end px-6 pb-6">
        <img
          src={artist.imageBig || artist.image}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sp-base via-sp-base/60 to-transparent" />
        <div className="relative z-10">
          <p className="text-xs text-sp-text-sub font-medium uppercase tracking-wider mb-1">Artista</p>
          <h1 className="text-5xl font-black text-white mb-2">{artist.name}</h1>
          {artist.fans > 0 && (
            <p className="text-sm text-sp-text-sub">{artist.fans.toLocaleString('pt-BR')} fãs</p>
          )}
        </div>
      </div>

      {/* Play Button */}
      <div className="px-6 py-4 flex items-center gap-4">
        <PlayButton
          size={56}
          onClick={() => {
            if (artist.topTracks?.length > 0) playTrackList(artist.topTracks, 0);
          }}
        />
        <button className="px-4 py-1.5 rounded-full border border-white/30 text-sm font-semibold text-white hover:border-white hover:scale-105 transition-all cursor-pointer">
          Seguir
        </button>
      </div>

      {/* Top Tracks */}
      {artist.topTracks?.length > 0 && (
        <section className="px-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Populares</h2>
          <div className="flex flex-col">
            {artist.topTracks.slice(0, 5).map((track, i) => (
              <button
                key={track.id}
                onClick={() => playTrackList(artist.topTracks, i)}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-left"
              >
                <span className="text-sm text-sp-text-sub w-5 text-right">{i + 1}</span>
                <div className="w-10 h-10 rounded shrink-0 overflow-hidden">
                  <img src={track.albumCover} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{track.title}</p>
                </div>
                <span className="text-xs text-sp-text-sub">{formatTime(track.duration)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {artist.albums?.length > 0 && (
        <ScrollSection title="Discografia">
          {artist.albums.map((album) => (
            <MediaCard
              key={album.id}
              image={album.cover || album.coverBig}
              name={album.title}
              desc={album.releaseDate?.split('-')[0] || 'Álbum'}
              onPlay={() => {
                if (album.tracks?.length > 0) playTrackList(album.tracks, 0);
              }}
            />
          ))}
        </ScrollSection>
      )}
    </div>
  );
}
