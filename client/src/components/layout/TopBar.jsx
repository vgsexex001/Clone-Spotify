import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function TopBar({ activeTab, onTabChange }) {
  const tabs = ['Tudo', 'Música', 'Podcasts'];
  const navigate = useNavigate();
  const { user, setShowLogin } = useAuth();

  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-2 sticky top-0 z-10 bg-sp-base">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
        >
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
        {user ? (
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-sp-green hover:bg-sp-green-light hover:scale-105 transition-all text-black font-bold text-sm cursor-pointer"
            title={user.username}
          >
            {user.username.charAt(0).toUpperCase()}
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition-all cursor-pointer"
          >
            Entrar
          </button>
        )}
      </div>
    </div>
  );
}
