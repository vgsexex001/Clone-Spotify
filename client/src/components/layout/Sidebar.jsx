import { Home, Search, Library, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePlaylists } from '../../contexts/PlaylistContext';
import { PLAYLISTS } from '../../data/mockData';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { playlists, createPlaylist } = usePlaylists();

  const sidebarPlaylists = user ? playlists : PLAYLISTS;

  const handleCreatePlaylist = async () => {
    if (!user) return;
    const name = `Minha Playlist #${playlists.length + 1}`;
    const playlist = await createPlaylist(name);
    if (playlist) navigate(`/playlist/${playlist.id}`);
  };

  return (
    <div className="flex flex-col gap-2 w-[72px] min-w-[72px] shrink-0">
      <div className="bg-sp-base rounded-lg flex flex-col items-center py-3 gap-5">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
            location.pathname === '/' ? 'text-white' : 'text-sp-text-sub hover:text-white'
          }`}
        >
          <Home size={24} />
          <span className="text-[10px] font-semibold">Início</span>
        </button>
        <button
          onClick={() => navigate('/search')}
          className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
            location.pathname === '/search' ? 'text-white' : 'text-sp-text-sub hover:text-white'
          }`}
        >
          <Search size={24} />
          <span className="text-[10px] font-semibold">Buscar</span>
        </button>
      </div>

      <div className="bg-sp-base rounded-lg flex flex-col items-center flex-1 py-3 gap-1 overflow-y-auto">
        <button className="flex flex-col items-center gap-0.5 text-sp-text-sub hover:text-white transition-colors mb-2 cursor-pointer">
          <Library size={24} />
          <span className="text-[10px] font-semibold">Biblioteca</span>
        </button>
        <button
          onClick={handleCreatePlaylist}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-sp-tinted hover:bg-sp-highlight text-sp-text-sub hover:text-white transition-colors mb-2 cursor-pointer"
        >
          <Plus size={16} />
        </button>
        {sidebarPlaylists.map((pl) => (
          <button
            key={pl.id}
            onClick={() => user ? navigate(`/playlist/${pl.id}`) : null}
            className="w-10 h-10 rounded overflow-hidden shrink-0 hover:ring-1 hover:ring-white/20 transition-all cursor-pointer mb-0.5"
            title={pl.name}
          >
            <img src={pl.cover_url || pl.image || '/images/covers/liked-songs.png'} alt={pl.name} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
