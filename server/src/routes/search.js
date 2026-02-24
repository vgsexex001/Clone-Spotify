import { Router } from 'express';
import { searchDeezer } from '../services/deezerService.js';
import { searchJamendo } from '../services/jamendoService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { q, source, limit = 25 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 25, 50);

    if (source === 'deezer') {
      const results = await searchDeezer(q, parsedLimit);
      return res.json(results);
    }

    if (source === 'jamendo') {
      const results = await searchJamendo(q, parsedLimit);
      return res.json(results);
    }

    // Default: parallel search both
    const [deezer, jamendo] = await Promise.all([
      searchDeezer(q, parsedLimit).catch((err) => {
        console.error('Deezer search error:', err.message);
        return { tracks: [], artists: [], albums: [] };
      }),
      searchJamendo(q, Math.floor(parsedLimit / 2)).catch((err) => {
        console.error('Jamendo search error:', err.message);
        return { tracks: [], artists: [], albums: [] };
      }),
    ]);

    res.json({
      tracks: [...deezer.tracks, ...jamendo.tracks],
      artists: [...deezer.artists, ...(jamendo.artists || [])],
      albums: [...deezer.albums, ...(jamendo.albums || [])],
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
