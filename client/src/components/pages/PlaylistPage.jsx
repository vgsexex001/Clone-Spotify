import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Pencil } from 'lucide-react';
import { user as userApi } from '../../services/api';
import { useAudio } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePlaylists } from '../../contexts/PlaylistContext';
import { formatTime } from '../../utils/formatTime';
import PlayButton from '../ui/PlayButton';

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrackList } = useAudio();
  const { user } = useAuth();
  const { deletePlaylist, updatePlaylist } = usePlaylists();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    userApi.getPlaylist(id)
      .then(data => {
        setPlaylist(data.playlist);
        setTracks(data.tracks || []);
        setEditName(data.playlist?.name || '');
      })
      .catch(() => setPlaylist(null))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleDelete = async () => {
    if (await deletePlaylist(parseInt(id))) {
      navigate('/');
    }
  };

  const handleSaveName = async () => {
    if (editName.trim() && editName !== playlist.name) {
      const updated = await updatePlaylist(parseInt(id), { name: editName.trim() });
      if (updated) setPlaylist(prev => ({ ...prev, name: editName.trim() }));
    }
    setIsEditing(false);
  };

  const handleRemoveTrack = async (trackId, source) => {
    await userApi.removeTrackFromPlaylist(id, trackId, source);
    setTracks(prev => prev.filter(t => !(t.track_id === trackId && t.source === source)));
  };

  const playableTracks = tracks.map(t => ({
    id: t.track_id,
    source: t.source,
    title: t.title,
    artist: t.artist,
    album: t.album,
    albumCover: t.album_cover,
    previewUrl: t.preview_url,
    duration: t.duration,
  }));

  if (!user) {
    return (
      <div className="px-6 py-8 text-center text-sp-text-sub">
        <p className="text-lg">Faça login para ver suas playlists</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse">
          <div className="flex gap-6 mb-6">
            <div className="w-[230px] h-[230px] bg-sp-elevated rounded-lg" />
            <div className="flex flex-col justify-end">
              <div className="h-8 w-48 bg-sp-elevated rounded mb-3" />
              <div className="h-4 w-32 bg-sp-elevated rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="px-6 py-8 text-center text-sp-text-sub">
        <p className="text-lg">Playlist não encontrada</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-end gap-6 px-6 pt-8 pb-6 bg-gradient-to-b from-sp-elevated/50 to-sp-base">
        <div className="w-[230px] h-[230px] bg-sp-elevated rounded-lg flex items-center justify-center shadow-2xl">
          {playlist.cover_url ? (
            <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover rounded-lg" />
          ) : tracks.length > 0 && tracks[0].album_cover ? (
            <img src={tracks[0].album_cover} alt={playlist.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-6xl text-sp-text-sub">♪</span>
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sp-text-sub mb-1">Playlist</p>
          {isEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="text-4xl font-black text-white bg-sp-elevated px-2 py-1 rounded outline-none mb-3"
              autoFocus
            />
          ) : (
            <h1
              className="text-4xl font-black text-white mb-3 cursor-pointer hover:underline"
              onClick={() => setIsEditing(true)}
            >
              {playlist.name}
            </h1>
          )}
          <p className="text-sm text-sp-text-sub">
            {tracks.length} música{tracks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex items-center gap-4">
        <PlayButton
          size={56}
          onClick={() => {
            if (playableTracks.length > 0) playTrackList(playableTracks, 0);
          }}
        />
        <button
          onClick={() => setIsEditing(true)}
          className="text-sp-text-sub hover:text-white transition cursor-pointer"
          title="Editar"
        >
          <Pencil size={20} />
        </button>
        <button
          onClick={handleDelete}
          className="text-sp-text-sub hover:text-red-400 transition cursor-pointer"
          title="Excluir playlist"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Track List */}
      {tracks.length > 0 ? (
        <div className="px-6">
          <div className="flex items-center gap-4 px-2 pb-2 border-b border-white/10 text-xs text-sp-text-sub uppercase tracking-wider">
            <span className="w-5 text-right">#</span>
            <span className="flex-1">Título</span>
            <span className="w-12 text-right">Duração</span>
            <span className="w-8" />
          </div>
          {tracks.map((track, i) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 transition-colors group"
            >
              <button
                onClick={() => playTrackList(playableTracks, i)}
                className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer text-left"
              >
                <span className="text-sm text-sp-text-sub w-5 text-right">{i + 1}</span>
                <div className="w-10 h-10 rounded shrink-0 overflow-hidden">
                  <img src={track.album_cover || '/images/covers/liked-songs.png'} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{track.title}</p>
                  <p className="text-xs text-sp-text-sub truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-sp-text-sub w-12 text-right">{formatTime(track.duration)}</span>
              </button>
              <button
                onClick={() => handleRemoveTrack(track.track_id, track.source)}
                className="opacity-0 group-hover:opacity-100 text-sp-text-sub hover:text-red-400 transition cursor-pointer"
                title="Remover"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center text-sp-text-sub">
          <p>Essa playlist está vazia</p>
          <p className="text-sm mt-1">Busque músicas e adicione aqui</p>
        </div>
      )}
    </div>
  );
}
