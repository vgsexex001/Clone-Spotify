import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { music as musicApi } from '../../services/api';
import { useAudio } from '../../contexts/AudioContext';
import { formatTime } from '../../utils/formatTime';
import PlayButton from '../ui/PlayButton';

export default function AlbumPage() {
  const { source, id } = useParams();
  const { playTrackList } = useAudio();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    musicApi.getAlbum(source, id)
      .then(setAlbum)
      .catch(() => setAlbum(null))
      .finally(() => setLoading(false));
  }, [source, id]);

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

  if (!album) {
    return (
      <div className="px-6 py-8 text-center text-sp-text-sub">
        <p className="text-lg">Álbum não encontrado</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-end gap-6 px-6 pt-8 pb-6 bg-gradient-to-b from-sp-elevated/50 to-sp-base">
        <img
          src={album.coverBig || album.cover}
          alt={album.title}
          className="w-[230px] h-[230px] rounded-lg shadow-2xl object-cover"
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-sp-text-sub mb-1">Álbum</p>
          <h1 className="text-4xl font-black text-white mb-3">{album.title}</h1>
          <p className="text-sm text-sp-text-sub">
            <span className="text-white font-semibold">{album.artist}</span>
            {album.releaseDate && ` · ${album.releaseDate.split('-')[0]}`}
            {album.nbTracks > 0 && ` · ${album.nbTracks} músicas`}
          </p>
        </div>
      </div>

      {/* Play Button */}
      <div className="px-6 py-4">
        <PlayButton
          size={56}
          onClick={() => {
            if (album.tracks?.length > 0) playTrackList(album.tracks, 0);
          }}
        />
      </div>

      {/* Track List */}
      <div className="px-6">
        <div className="flex items-center gap-4 px-2 pb-2 border-b border-white/10 text-xs text-sp-text-sub uppercase tracking-wider">
          <span className="w-5 text-right">#</span>
          <span className="flex-1">Título</span>
          <span className="w-12 text-right">Duração</span>
        </div>
        {album.tracks?.map((track, i) => (
          <button
            key={track.id}
            onClick={() => playTrackList(album.tracks, i)}
            className="flex items-center gap-4 w-full p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-left"
          >
            <span className="text-sm text-sp-text-sub w-5 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{track.title}</p>
              <p className="text-xs text-sp-text-sub truncate">{track.artist}</p>
            </div>
            <span className="text-xs text-sp-text-sub w-12 text-right">{formatTime(track.duration)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
