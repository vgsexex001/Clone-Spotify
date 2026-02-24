import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSearch from '../../hooks/useSearch';
import { useAudio } from '../../contexts/AudioContext';
import MediaCard from '../ui/MediaCard';
import ScrollSection from '../ui/ScrollSection';
import { formatTime } from '../../utils/formatTime';

export default function SearchPage() {
  const { query, setQuery, results, isSearching } = useSearch();
  const { playTrackList } = useAudio();
  const navigate = useNavigate();

  return (
    <div className="px-6 py-4">
      {/* Search Input */}
      <div className="relative max-w-[480px] mb-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-text-sub" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="O que você quer ouvir?"
          className="w-full bg-sp-tinted text-white pl-10 pr-4 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-white/30 placeholder:text-sp-text-sub"
          autoFocus
        />
      </div>

      {isSearching && (
        <div className="flex items-center gap-2 text-sp-text-sub mb-4">
          <div className="w-4 h-4 border-2 border-sp-text-sub border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Buscando...</span>
        </div>
      )}

      {!query && !isSearching && (
        <div className="text-center text-sp-text-sub mt-20">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">Busque músicas, artistas ou álbuns</p>
          <p className="text-sm mt-1">Digite para começar a buscar</p>
        </div>
      )}

      {/* Track Results */}
      {results.tracks.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-white mb-3">Músicas</h2>
          <div className="flex flex-col gap-1">
            {results.tracks.slice(0, 10).map((track, i) => (
              <button
                key={`${track.source}-${track.id}`}
                onClick={() => playTrackList(results.tracks, i)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded shrink-0 overflow-hidden">
                  <img src={track.albumCover || '/images/covers/liked-songs.png'} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{track.title}</p>
                  <p className="text-xs text-sp-text-sub truncate">
                    {track.source === 'jamendo' && <span className="text-sp-green text-[10px] mr-1">CC</span>}
                    {track.artist}
                  </p>
                </div>
                <span className="text-xs text-sp-text-sub">{track.album}</span>
                <span className="text-xs text-sp-text-sub w-10 text-right">{formatTime(track.duration)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Artist Results */}
      {results.artists.length > 0 && (
        <ScrollSection title="Artistas">
          {results.artists.map((artist) => (
            <MediaCard
              key={`${artist.source}-${artist.id}`}
              image={artist.image || '/images/covers/liked-songs.png'}
              name={artist.name}
              desc="Artista"
              circular
              onPlay={() => navigate(`/artist/${artist.source}/${artist.id}`)}
            />
          ))}
        </ScrollSection>
      )}

      {/* Album Results */}
      {results.albums.length > 0 && (
        <ScrollSection title="Álbuns">
          {results.albums.map((album) => (
            <MediaCard
              key={`${album.source}-${album.id}`}
              image={album.cover || '/images/covers/liked-songs.png'}
              name={album.title}
              desc={album.artist}
              onPlay={() => navigate(`/album/${album.source}/${album.id}`)}
            />
          ))}
        </ScrollSection>
      )}

      {query && !isSearching && results.tracks.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
        <div className="text-center text-sp-text-sub mt-20">
          <p className="text-lg font-semibold">Nenhum resultado encontrado para "{query}"</p>
          <p className="text-sm mt-1">Tente buscar com termos diferentes</p>
        </div>
      )}
    </div>
  );
}
