import { useState, useEffect, useCallback } from 'react';
import { user as userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function useLikedSongs() {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState(new Set());
  const [likedSongs, setLikedSongs] = useState([]);

  const loadLikedSongs = useCallback(async () => {
    if (!user) {
      setLikedIds(new Set());
      setLikedSongs([]);
      return;
    }
    try {
      const data = await userApi.getLikedSongs();
      const songs = data.songs || [];
      setLikedSongs(songs);
      setLikedIds(new Set(songs.map(s => `${s.source}:${s.track_id}`)));
    } catch {
      // Not authenticated
    }
  }, [user]);

  useEffect(() => {
    loadLikedSongs();
  }, [loadLikedSongs]);

  const isLiked = useCallback((trackId, source) => {
    return likedIds.has(`${source}:${trackId}`);
  }, [likedIds]);

  const toggleLike = useCallback(async (track) => {
    if (!user) return;
    const key = `${track.source}:${track.id}`;

    if (likedIds.has(key)) {
      // Optimistic remove
      setLikedIds(prev => { const next = new Set(prev); next.delete(key); return next; });
      setLikedSongs(prev => prev.filter(s => !(s.track_id === track.id && s.source === track.source)));
      try {
        await userApi.unlikeSong(track.id, track.source);
      } catch {
        // Revert
        setLikedIds(prev => new Set(prev).add(key));
        loadLikedSongs();
      }
    } else {
      // Optimistic add
      setLikedIds(prev => new Set(prev).add(key));
      try {
        await userApi.likeSong({
          trackId: track.id,
          source: track.source,
          title: track.title,
          artist: track.artist,
          album: track.album,
          albumCover: track.albumCover,
          previewUrl: track.previewUrl,
          duration: track.duration,
        });
        loadLikedSongs();
      } catch {
        setLikedIds(prev => { const next = new Set(prev); next.delete(key); return next; });
      }
    }
  }, [user, likedIds, loadLikedSongs]);

  return { likedSongs, isLiked, toggleLike, loadLikedSongs };
}
