const BASE_URL = '/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    // Optionally handle auth expiry
    return { error: 'Unauthorized', status: 401 };
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

// Auth
export const auth = {
  signup: (email, username, password) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, username, password }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () =>
    request('/auth/logout', { method: 'POST' }),
  me: () =>
    request('/auth/me'),
};

// Search
export const search = {
  query: (q, source, limit) => {
    const params = new URLSearchParams({ q });
    if (source) params.set('source', source);
    if (limit) params.set('limit', limit);
    return request(`/search?${params}`);
  },
};

// Music
export const music = {
  getTrack: (source, id) => request(`/music/track/${source}/${id}`),
  getArtist: (source, id) => request(`/music/artist/${source}/${id}`),
  getAlbum: (source, id) => request(`/music/album/${source}/${id}`),
  getCharts: () => request('/music/charts'),
  getDiscover: () => request('/music/discover'),
};

// User
export const user = {
  getLikedSongs: () => request('/user/liked-songs'),
  likeSong: (track) => request('/user/liked-songs', { method: 'POST', body: JSON.stringify(track) }),
  unlikeSong: (trackId, source) =>
    request('/user/liked-songs', { method: 'DELETE', body: JSON.stringify({ trackId, source }) }),
  checkLiked: (source, trackId) => request(`/user/liked-songs/check/${source}/${trackId}`),

  getPlaylists: () => request('/user/playlists'),
  createPlaylist: (name, description) =>
    request('/user/playlists', { method: 'POST', body: JSON.stringify({ name, description }) }),
  getPlaylist: (id) => request(`/user/playlists/${id}`),
  updatePlaylist: (id, data) =>
    request(`/user/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlaylist: (id) =>
    request(`/user/playlists/${id}`, { method: 'DELETE' }),
  addTrackToPlaylist: (playlistId, track) =>
    request(`/user/playlists/${playlistId}/tracks`, { method: 'POST', body: JSON.stringify(track) }),
  removeTrackFromPlaylist: (playlistId, trackId, source) =>
    request(`/user/playlists/${playlistId}/tracks`, { method: 'DELETE', body: JSON.stringify({ trackId, source }) }),

  getHistory: (limit) => request(`/user/history?limit=${limit || 50}`),
  recordHistory: (track) => request('/user/history', { method: 'POST', body: JSON.stringify(track) }),

  getDailyMixes: () => request('/user/daily-mixes'),
};
