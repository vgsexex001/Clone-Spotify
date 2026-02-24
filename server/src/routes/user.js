import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getSqlite } from '../db/index.js';

const router = Router();

// ─── Liked Songs ───────────────────────────────────────────────

router.get('/liked-songs', requireAuth, (req, res) => {
  try {
    const db = getSqlite();
    const songs = db.prepare(
      'SELECT * FROM liked_songs WHERE user_id = ? ORDER BY liked_at DESC'
    ).all(req.user.id);
    res.json({ songs });
  } catch (err) {
    console.error('Get liked songs error:', err);
    res.status(500).json({ error: 'Failed to get liked songs' });
  }
});

router.post('/liked-songs', requireAuth, (req, res) => {
  try {
    const { trackId, source, title, artist, album, albumCover, previewUrl, duration } = req.body;
    if (!trackId || !source || !title || !artist) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getSqlite();
    db.prepare(`
      INSERT OR IGNORE INTO liked_songs (user_id, track_id, source, title, artist, album, album_cover, preview_url, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, trackId, source, title, artist, album || '', albumCover || '', previewUrl || '', duration || 0);

    res.status(201).json({ liked: true });
  } catch (err) {
    console.error('Like song error:', err);
    res.status(500).json({ error: 'Failed to like song' });
  }
});

router.delete('/liked-songs', requireAuth, (req, res) => {
  try {
    const { trackId, source } = req.body;
    if (!trackId || !source) {
      return res.status(400).json({ error: 'trackId and source are required' });
    }

    const db = getSqlite();
    db.prepare(
      'DELETE FROM liked_songs WHERE user_id = ? AND track_id = ? AND source = ?'
    ).run(req.user.id, trackId, source);

    res.json({ liked: false });
  } catch (err) {
    console.error('Unlike song error:', err);
    res.status(500).json({ error: 'Failed to unlike song' });
  }
});

router.get('/liked-songs/check/:source/:trackId', requireAuth, (req, res) => {
  try {
    const { trackId, source } = req.params;
    const db = getSqlite();
    const row = db.prepare(
      'SELECT id FROM liked_songs WHERE user_id = ? AND track_id = ? AND source = ?'
    ).get(req.user.id, trackId, source);

    res.json({ liked: !!row });
  } catch (err) {
    console.error('Check liked error:', err);
    res.status(500).json({ error: 'Failed to check liked status' });
  }
});

// ─── Playlists ─────────────────────────────────────────────────

router.get('/playlists', requireAuth, (req, res) => {
  try {
    const db = getSqlite();
    const playlists = db.prepare(
      'SELECT * FROM playlists WHERE user_id = ? ORDER BY updated_at DESC'
    ).all(req.user.id);
    res.json({ playlists });
  } catch (err) {
    console.error('Get playlists error:', err);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

router.post('/playlists', requireAuth, (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const db = getSqlite();
    const result = db.prepare(
      'INSERT INTO playlists (user_id, name, description) VALUES (?, ?, ?)'
    ).run(req.user.id, name, description || '');

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ playlist });
  } catch (err) {
    console.error('Create playlist error:', err);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

router.get('/playlists/:id', requireAuth, (req, res) => {
  try {
    const db = getSqlite();
    const playlist = db.prepare(
      'SELECT * FROM playlists WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    const tracks = db.prepare(
      'SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC'
    ).all(playlist.id);

    res.json({ playlist, tracks });
  } catch (err) {
    console.error('Get playlist error:', err);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

router.put('/playlists/:id', requireAuth, (req, res) => {
  try {
    const { name, description, coverUrl } = req.body;
    const db = getSqlite();

    const playlist = db.prepare(
      'SELECT * FROM playlists WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    db.prepare(`
      UPDATE playlists SET name = ?, description = ?, cover_url = ?, updated_at = unixepoch()
      WHERE id = ?
    `).run(name || playlist.name, description ?? playlist.description, coverUrl ?? playlist.cover_url, playlist.id);

    const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlist.id);
    res.json({ playlist: updated });
  } catch (err) {
    console.error('Update playlist error:', err);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

router.delete('/playlists/:id', requireAuth, (req, res) => {
  try {
    const db = getSqlite();
    const result = db.prepare(
      'DELETE FROM playlists WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) return res.status(404).json({ error: 'Playlist not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete playlist error:', err);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

router.post('/playlists/:id/tracks', requireAuth, (req, res) => {
  try {
    const { trackId, source, title, artist, album, albumCover, previewUrl, duration } = req.body;
    if (!trackId || !source || !title || !artist) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getSqlite();
    const playlist = db.prepare(
      'SELECT * FROM playlists WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    const maxPos = db.prepare(
      'SELECT MAX(position) as maxPos FROM playlist_tracks WHERE playlist_id = ?'
    ).get(playlist.id);

    const position = (maxPos?.maxPos ?? -1) + 1;

    db.prepare(`
      INSERT INTO playlist_tracks (playlist_id, track_id, source, title, artist, album, album_cover, preview_url, duration, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(playlist.id, trackId, source, title, artist, album || '', albumCover || '', previewUrl || '', duration || 0, position);

    db.prepare('UPDATE playlists SET updated_at = unixepoch() WHERE id = ?').run(playlist.id);

    res.status(201).json({ added: true });
  } catch (err) {
    console.error('Add track to playlist error:', err);
    res.status(500).json({ error: 'Failed to add track' });
  }
});

router.delete('/playlists/:id/tracks', requireAuth, (req, res) => {
  try {
    const { trackId, source } = req.body;
    if (!trackId || !source) {
      return res.status(400).json({ error: 'trackId and source are required' });
    }

    const db = getSqlite();
    const playlist = db.prepare(
      'SELECT * FROM playlists WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    db.prepare(
      'DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ? AND source = ?'
    ).run(playlist.id, trackId, source);

    db.prepare('UPDATE playlists SET updated_at = unixepoch() WHERE id = ?').run(playlist.id);

    res.json({ removed: true });
  } catch (err) {
    console.error('Remove track from playlist error:', err);
    res.status(500).json({ error: 'Failed to remove track' });
  }
});

// ─── History ───────────────────────────────────────────────────

router.get('/history', requireAuth, (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const db = getSqlite();
    const history = db.prepare(
      'SELECT * FROM listening_history WHERE user_id = ? ORDER BY played_at DESC LIMIT ?'
    ).all(req.user.id, parseInt(limit, 10));
    res.json({ history });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

router.post('/history', requireAuth, (req, res) => {
  try {
    const { trackId, source, title, artist, album, albumCover, previewUrl, duration } = req.body;
    if (!trackId || !source || !title || !artist) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getSqlite();
    db.prepare(`
      INSERT INTO listening_history (user_id, track_id, source, title, artist, album, album_cover, preview_url, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, trackId, source, title, artist, album || '', albumCover || '', previewUrl || '', duration || 0);

    res.status(201).json({ recorded: true });
  } catch (err) {
    console.error('Record history error:', err);
    res.status(500).json({ error: 'Failed to record history' });
  }
});

// ─── Daily Mixes ───────────────────────────────────────────────

router.get('/daily-mixes', requireAuth, (req, res) => {
  try {
    const db = getSqlite();
    const mixes = db.prepare(
      'SELECT * FROM daily_mixes WHERE user_id = ? ORDER BY mix_index ASC'
    ).all(req.user.id);

    const result = mixes.map(m => ({
      ...m,
      tracks: JSON.parse(m.tracks_json),
    }));

    res.json({ mixes: result });
  } catch (err) {
    console.error('Get daily mixes error:', err);
    res.status(500).json({ error: 'Failed to get daily mixes' });
  }
});

export default router;
