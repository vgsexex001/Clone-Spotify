import { Heart } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/AuthContext';
import useLikedSongs from '../../hooks/useLikedSongs';
import { formatTime } from '../../utils/formatTime';
import PlayButton from '../ui/PlayButton';

export default function LikedSongsPage() {
  const { playTrackList } = useAudio();
  const { user } = useAuth();
  const { likedSongs } = useLikedSongs();

  const playableTracks = likedSongs.map(s => ({
    id: s.track_id,
    source: s.source,
    title: s.title,
    artist: s.artist,
    album: s.album,
    albumCover: s.album_cover,
    previewUrl: s.preview_url,
    duration: s.duration,
  }));

  if (!user) {
    return (
      <div className="px-6 py-8 text-center text-sp-text-sub">
        <p className="text-lg">Faça login para ver suas músicas curtidas</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-end gap-6 px-6 pt-8 pb-6 bg-gradient-to-b from-purple-900/60 to-sp-base">
        <div className="w-[230px] h-[230px] bg-gradient-to-br from-indigo-700 to-white rounded-lg flex items-center justify-center shadow-2xl">
          <Heart size={80} className="text-white fill-white" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sp-text-sub mb-1">Playlist</p>
          <h1 className="text-4xl font-black text-white mb-3">Músicas Curtidas</h1>
          <p className="text-sm text-sp-text-sub">
            {likedSongs.length} música{likedSongs.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Play Button */}
      <div className="px-6 py-4">
        <PlayButton
          size={56}
          onClick={() => {
            if (playableTracks.length > 0) playTrackList(playableTracks, 0);
          }}
        />
      </div>

      {/* Track List */}
      {likedSongs.length > 0 ? (
        <div className="px-6">
          <div className="flex items-center gap-4 px-2 pb-2 border-b border-white/10 text-xs text-sp-text-sub uppercase tracking-wider">
            <span className="w-5 text-right">#</span>
            <span className="flex-1">Título</span>
            <span className="hidden sm:block w-40">Álbum</span>
            <span className="w-12 text-right">Duração</span>
          </div>
          {likedSongs.map((song, i) => (
            <button
              key={song.id}
              onClick={() => playTrackList(playableTracks, i)}
              className="flex items-center gap-4 w-full p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-left"
            >
              <span className="text-sm text-sp-text-sub w-5 text-right">{i + 1}</span>
              <div className="w-10 h-10 rounded shrink-0 overflow-hidden">
                <img src={song.album_cover || '/images/covers/liked-songs.png'} alt={song.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{song.title}</p>
                <p className="text-xs text-sp-text-sub truncate">{song.artist}</p>
              </div>
              <span className="hidden sm:block text-xs text-sp-text-sub w-40 truncate">{song.album}</span>
              <span className="text-xs text-sp-text-sub w-12 text-right">{formatTime(song.duration)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center text-sp-text-sub">
          <p>Nenhuma música curtida ainda</p>
          <p className="text-sm mt-1">Curta músicas para vê-las aqui</p>
        </div>
      )}
    </div>
  );
}
