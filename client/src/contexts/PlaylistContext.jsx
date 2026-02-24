import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { user as userApi } from '../services/api';
import { useAuth } from './AuthContext';

const PlaylistContext = createContext(null);

export function PlaylistProvider({ children }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  const loadPlaylists = useCallback(async () => {
    if (!user) {
      setPlaylists([]);
      return;
    }
    try {
      const data = await userApi.getPlaylists();
      setPlaylists(data.playlists || []);
    } catch {
      setPlaylists([]);
    }
  }, [user]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const createPlaylist = async (name, description) => {
    try {
      const data = await userApi.createPlaylist(name, description);
      setPlaylists(prev => [data.playlist, ...prev]);
      return data.playlist;
    } catch {
      return null;
    }
  };

  const deletePlaylist = async (id) => {
    try {
      await userApi.deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  const updatePlaylist = async (id, data) => {
    try {
      const result = await userApi.updatePlaylist(id, data);
      setPlaylists(prev => prev.map(p => p.id === id ? result.playlist : p));
      return result.playlist;
    } catch {
      return null;
    }
  };

  return (
    <PlaylistContext.Provider value={{
      playlists, loadPlaylists, createPlaylist, deletePlaylist, updatePlaylist,
    }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error('usePlaylists must be used within PlaylistProvider');
  return ctx;
}
