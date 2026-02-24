import { config } from '../config.js';
import { getCached, setCache, cacheKey, TTL } from '../utils/cache.js';

const BASE_URL = 'https://api.jamendo.com/v3.0';

function isConfigured() {
  return !!config.jamendoClientId;
}

async function fetchJamendo(path, params = {}) {
  if (!isConfigured()) return null;

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('client_id', config.jamendoClientId);
  url.searchParams.set('format', 'json');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Jamendo API error: ${res.status}`);
  const data = await res.json();
  return data;
}

function normalizeTrack(t) {
  return {
    id: String(t.id),
    source: 'jamendo',
    title: t.name,
    artist: t.artist_name || 'Unknown',
    artistId: String(t.artist_id || ''),
    album: t.album_name || '',
    albumId: String(t.album_id || ''),
    albumCover: t.album_image || t.image || '',
    albumCoverBig: t.album_image || t.image || '',
    previewUrl: t.audio || t.audiodownload || '',
    duration: t.duration || 0,
    explicit: false,
    license: t.license_ccurl || '',
  };
}

function normalizeArtist(a) {
  return {
    id: String(a.id),
    source: 'jamendo',
    name: a.name,
    image: a.image || '',
    imageBig: a.image || '',
    website: a.website || '',
  };
}

export async function searchJamendo(query, limit = 15) {
  if (!isConfigured()) return { tracks: [], artists: [] };

  const key = cacheKey('jamendo:search', query, limit);
  const cached = getCached(key);
  if (cached) return cached;

  try {
    const [trackData, artistData] = await Promise.all([
      fetchJamendo('/tracks/', { search: query, limit, include: 'musicinfo' }),
      fetchJamendo('/artists/', { namesearch: query, limit: 6 }),
    ]);

    const result = {
      tracks: (trackData?.results || []).map(normalizeTrack),
      artists: (artistData?.results || []).map(normalizeArtist),
      albums: [],
    };

    setCache(key, result, TTL.SEARCH);
    return result;
  } catch (err) {
    console.error('Jamendo search error:', err.message);
    return { tracks: [], artists: [], albums: [] };
  }
}

export async function getTrack(id) {
  if (!isConfigured()) return null;

  const key = cacheKey('jamendo:track', id);
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchJamendo('/tracks/', { id });
  const track = data?.results?.[0];
  if (!track) return null;

  const result = normalizeTrack(track);
  setCache(key, result, TTL.DETAILS);
  return result;
}

export async function getArtist(id) {
  if (!isConfigured()) return null;

  const key = cacheKey('jamendo:artist', id);
  const cached = getCached(key);
  if (cached) return cached;

  const [artistData, tracksData] = await Promise.all([
    fetchJamendo('/artists/', { id }),
    fetchJamendo('/artists/tracks/', { id, limit: 20 }),
  ]);

  const artist = artistData?.results?.[0];
  if (!artist) return null;

  const tracks = tracksData?.results?.[0]?.tracks || [];

  const result = {
    ...normalizeArtist(artist),
    topTracks: tracks.map(normalizeTrack),
    albums: [],
  };

  setCache(key, result, TTL.DETAILS);
  return result;
}

export async function getAlbumTracks(albumId) {
  if (!isConfigured()) return null;

  const key = cacheKey('jamendo:album', albumId);
  const cached = getCached(key);
  if (cached) return cached;

  const data = await fetchJamendo('/albums/tracks/', { id: albumId });
  const album = data?.results?.[0];
  if (!album) return null;

  const result = {
    id: String(album.id),
    source: 'jamendo',
    title: album.name,
    artist: album.artist_name || 'Unknown',
    artistId: String(album.artist_id || ''),
    cover: album.image || '',
    coverBig: album.image || '',
    tracks: (album.tracks || []).map(normalizeTrack),
    releaseDate: album.releasedate || '',
    nbTracks: album.tracks?.length || 0,
  };

  setCache(key, result, TTL.DETAILS);
  return result;
}
