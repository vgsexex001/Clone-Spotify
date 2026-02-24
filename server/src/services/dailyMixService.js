import { getSqlite } from '../db/index.js';
import { getCharts, getGenreTracks, getRadio } from './deezerService.js';

const GENRE_MAP = {
  'pop': 132,
  'rock': 152,
  'hip-hop': 116,
  'rap': 116,
  'electronic': 106,
  'r&b': 165,
  'latin': 197,
  'brazilian': 173,
  'jazz': 129,
  'classical': 98,
  'metal': 464,
  'indie': 85,
  'reggae': 144,
  'country': 84,
  'blues': 153,
};

const DEFAULT_GENRES = [132, 116, 152, 106, 173, 85];

export async function generateDailyMixes(userId) {
  const db = getSqlite();

  // Check if mixes were generated in last 24h
  const recent = db.prepare(
    'SELECT * FROM daily_mixes WHERE user_id = ? AND generated_at > unixepoch() - 86400 LIMIT 1'
  ).get(userId);

  if (recent) return; // Already fresh

  // Clear old mixes
  db.prepare('DELETE FROM daily_mixes WHERE user_id = ?').run(userId);

  // Analyze user history and likes for genre preferences
  const historyArtists = db.prepare(`
    SELECT artist, COUNT(*) as count FROM listening_history
    WHERE user_id = ? GROUP BY artist ORDER BY count DESC LIMIT 20
  `).all(userId);

  const likedArtists = db.prepare(`
    SELECT artist, COUNT(*) as count FROM liked_songs
    WHERE user_id = ? GROUP BY artist ORDER BY count DESC LIMIT 20
  `).all(userId);

  const hasData = historyArtists.length > 0 || likedArtists.length > 0;

  if (!hasData) {
    // Fallback: generate mixes from popular genres
    await generateFallbackMixes(userId, db);
    return;
  }

  // Merge artist frequencies
  const artistCounts = new Map();
  for (const { artist, count } of [...historyArtists, ...likedArtists]) {
    artistCounts.set(artist, (artistCounts.get(artist) || 0) + count);
  }

  const topArtists = [...artistCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // Generate up to 6 mixes based on top artists
  const insert = db.prepare(`
    INSERT INTO daily_mixes (user_id, mix_index, name, description, cover_url, tracks_json, genre, generated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())
  `);

  // Group artists into mixes of ~2 each
  for (let i = 0; i < Math.min(6, Math.ceil(topArtists.length / 2)); i++) {
    const mixArtists = topArtists.slice(i * 2, i * 2 + 2);
    const artistNames = mixArtists.map(([name]) => name);
    const description = artistNames.join(', ') + ' e mais';

    // Try to get radio tracks for first artist
    let tracks = [];
    try {
      // Search for artist ID from history
      const historyTracks = db.prepare(`
        SELECT DISTINCT track_id, source, title, artist, album, album_cover, preview_url, duration
        FROM listening_history WHERE user_id = ? AND artist IN (${artistNames.map(() => '?').join(',')})
        ORDER BY played_at DESC LIMIT 25
      `).all(userId, ...artistNames);

      const likedTracks = db.prepare(`
        SELECT DISTINCT track_id, source, title, artist, album, album_cover, preview_url, duration
        FROM liked_songs WHERE user_id = ? AND artist IN (${artistNames.map(() => '?').join(',')})
      `).all(userId, ...artistNames);

      const seen = new Set();
      for (const t of [...likedTracks, ...historyTracks]) {
        const key = `${t.source}:${t.track_id}`;
        if (!seen.has(key)) {
          seen.add(key);
          tracks.push({
            id: t.track_id,
            source: t.source,
            title: t.title,
            artist: t.artist,
            album: t.album,
            albumCover: t.album_cover,
            previewUrl: t.preview_url,
            duration: t.duration,
          });
        }
      }
    } catch (err) {
      console.error('Error building mix tracks:', err.message);
    }

    if (tracks.length < 5) {
      // Supplement with chart tracks
      try {
        const charts = await getCharts();
        const shuffled = charts.tracks.sort(() => Math.random() - 0.5);
        tracks.push(...shuffled.slice(0, 25 - tracks.length));
      } catch {}
    }

    const coverUrl = tracks[0]?.albumCover || '';

    insert.run(
      userId, i, `Daily Mix ${i + 1}`, description, coverUrl,
      JSON.stringify(tracks.slice(0, 25)), null
    );
  }
}

async function generateFallbackMixes(userId, db) {
  const insert = db.prepare(`
    INSERT INTO daily_mixes (user_id, mix_index, name, description, cover_url, tracks_json, genre, generated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())
  `);

  const genreNames = ['Pop', 'Hip-Hop', 'Rock', 'Electronic', 'Brazilian', 'Indie'];

  for (let i = 0; i < DEFAULT_GENRES.length; i++) {
    try {
      const tracks = await getGenreTracks(DEFAULT_GENRES[i]);
      const shuffled = tracks.sort(() => Math.random() - 0.5).slice(0, 25);
      const coverUrl = shuffled[0]?.albumCover || '';

      insert.run(
        userId, i, `Daily Mix ${i + 1}`,
        `${genreNames[i]} hits e mais`,
        coverUrl, JSON.stringify(shuffled), genreNames[i].toLowerCase()
      );
    } catch (err) {
      console.error(`Failed to generate fallback mix ${i}:`, err.message);
    }
  }
}
