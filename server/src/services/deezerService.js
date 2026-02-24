import { getCached, setCache, cacheKey, TTL } from '../utils/cache.js';

const BASE_URL = 'https://api.deezer.com';

async function fetchDeezer(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Deezer API error: ${res.status}`);
  return res.json();
}

function normalizeTrack(t) {
  return {
    id: String(t.id),
    source: 'deezer',
    title: t.title || t.title_short,
    artist: t.artist?.name || 'Unknown',
    artistId: String(t.artist?.id || ''),
    album: t.album?.title || '',
    albumId: String(t.album?.id || ''),
    albumCover: t.album?.cover_medium || t.album?.cover || '',
    albumCoverBig: t.album?.cover_big || t.album?.cover_xl || '',
    previewUrl: t.preview || '',
    duration: t.duration || 30,
    explicit: t.explicit_lyrics || false,
  };
}

function normalizeArtist(a) {
  return {
    id: String(a.id),
    source: 'deezer',
    name: a.name,
    image: a.picture_medium || a.picture || '',
    imageBig: a.picture_big || a.picture_xl || '',
    fans: a.nb_fan || 0,
    albums: a.nb_album || 0,
  };
}

function normalizeAlbum(a) {
  return {
    id: String(a.id),
    source: 'deezer',
    title: a.title,
    artist: a.artist?.name || 'Unknown',
    artistId: String(a.artist?.id || ''),
    cover: a.cover_medium || a.cover || '',
    coverBig: a.cover_big || a.cover_xl || '',
    tracks: a.tracks?.data?.map(normalizeTrack) || [],
    releaseDate: a.release_date || '',
    nbTracks: a.nb_tracks || 0,
  };
}

export async function searchDeezer(query, limit = 25) {
  const key = cacheKey('deezer:search', query, limit);
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchDeezer(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  const tracks = (data.data || []).map(normalizeTrack);

  // Also search artists and albums
  const [artistData, albumData] = await Promise.all([
    fetchDeezer(`/search/artist?q=${encodeURIComponent(query)}&limit=6`).catch(() => ({ data: [] })),
    fetchDeezer(`/search/album?q=${encodeURIComponent(query)}&limit=6`).catch(() => ({ data: [] })),
  ]);

  const result = {
    tracks,
    artists: (artistData.data || []).map(normalizeArtist),
    albums: (albumData.data || []).map(normalizeAlbum),
  };

  setCache(key, result, TTL.SEARCH);
  return result;
}

export async function getTrack(id) {
  const key = cacheKey('deezer:track', id);
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchDeezer(`/track/${id}`);
  const result = normalizeTrack(data);
  setCache(key, result, TTL.DETAILS);
  return result;
}

export async function getArtist(id) {
  const key = cacheKey('deezer:artist', id);
  const cached = getCached(key);
  if (cached) return cached;

  const [artist, topTracks, albums] = await Promise.all([
    fetchDeezer(`/artist/${id}`),
    fetchDeezer(`/artist/${id}/top?limit=10`),
    fetchDeezer(`/artist/${id}/albums?limit=20`),
  ]);

  const result = {
    ...normalizeArtist(artist),
    bio: '',
    topTracks: (topTracks.data || []).map(normalizeTrack),
    albums: (albums.data || []).map(normalizeAlbum),
  };

  setCache(key, result, TTL.DETAILS);
  return result;
}

export async function getAlbum(id) {
  const key = cacheKey('deezer:album', id);
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchDeezer(`/album/${id}`);
  const result = normalizeAlbum(data);
  setCache(key, result, TTL.DETAILS);
  return result;
}

export async function getCharts() {
  const key = 'deezer:charts';
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchDeezer('/chart');
  const result = {
    tracks: (data.tracks?.data || []).map(normalizeTrack),
    artists: (data.artists?.data || []).map(normalizeArtist),
    albums: (data.albums?.data || []).map(normalizeAlbum),
  };

  setCache(key, result, TTL.CHARTS);
  return result;
}

export async function getGenreTracks(genreId) {
  const key = cacheKey('deezer:genre', genreId);
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchDeezer(`/chart/${genreId}/tracks?limit=25`);
  const result = (data.data || []).map(normalizeTrack);
  setCache(key, result, TTL.GENRES);
  return result;
}

export async function getRadio(artistId) {
  const key = cacheKey('deezer:radio', artistId);
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchDeezer(`/artist/${artistId}/radio?limit=25`);
  const result = (data.data || []).map(normalizeTrack);
  setCache(key, result, TTL.SEARCH);
  return result;
}
