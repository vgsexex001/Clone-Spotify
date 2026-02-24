import { Heart, X } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';
import { NOW_PLAYING } from '../../data/mockData';

export default function RightPanel({ onClose }) {
  const { currentTrack } = useAudio();

  const track = currentTrack || {
    title: NOW_PLAYING.title,
    artist: NOW_PLAYING.artist,
    album: NOW_PLAYING.album,
    albumCover: NOW_PLAYING.albumImage,
    albumCoverBig: NOW_PLAYING.albumImage,
    artistImage: NOW_PLAYING.artistImage,
    artistAbout: NOW_PLAYING.artistAbout,
    artistFollowers: NOW_PLAYING.artistFollowers,
    artistMonthly: NOW_PLAYING.artistMonthly,
  };

  const albumImage = track.albumCoverBig || track.albumCover || NOW_PLAYING.albumImage;
  const artistImage = track.artistImage || NOW_PLAYING.artistImage;
  const artistAbout = track.artistAbout || NOW_PLAYING.artistAbout;
  const artistFollowers = track.artistFollowers || NOW_PLAYING.artistFollowers;
  const artistMonthly = track.artistMonthly || NOW_PLAYING.artistMonthly;

  return (
    <div className="w-[350px] min-w-[350px] shrink-0 bg-sp-base rounded-lg overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-bold text-white">{track.artist}</span>
        <button onClick={onClose} className="text-sp-text-sub hover:text-white transition cursor-pointer">
          <X size={18} />
        </button>
      </div>

      <div className="px-4 pb-3">
        <img
          src={albumImage}
          alt={track.album || track.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-white truncate">{track.title}</p>
            <p className="text-sm text-sp-text-sub truncate">{track.artist}</p>
          </div>
          <button className="ml-3 transition cursor-pointer text-sp-text-sub hover:text-white">
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-sp-surface rounded-lg overflow-hidden">
          <div className="relative h-[200px] flex items-end">
            <img
              src={artistImage}
              alt={track.artist}
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
                <p className="text-base font-bold text-white">{track.artist}</p>
                <p className="text-xs text-sp-text-sub">{artistMonthly} ouvintes mensais</p>
              </div>
              <button className="px-4 py-1.5 rounded-full border border-white/30 text-sm font-semibold text-white hover:border-white hover:scale-105 transition-all cursor-pointer">
                Seguir
              </button>
            </div>
            <p className="text-sm text-sp-text-sub leading-relaxed line-clamp-3">
              {artistAbout}
            </p>
            <p className="text-xs text-sp-text-sub mt-2">{artistFollowers} seguidores</p>
          </div>
        </div>
      </div>
    </div>
  );
}
