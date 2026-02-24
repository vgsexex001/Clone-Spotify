import { Router } from 'express';
import * as deezer from '../services/deezerService.js';
import * as jamendo from '../services/jamendoService.js';

const router = Router();

router.get('/track/:source/:id', async (req, res) => {
  try {
    const { source, id } = req.params;
    let track;

    if (source === 'deezer') {
      track = await deezer.getTrack(id);
    } else if (source === 'jamendo') {
      track = await jamendo.getTrack(id);
    } else {
      return res.status(400).json({ error: 'Invalid source' });
    }

    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json(track);
  } catch (err) {
    console.error('Get track error:', err);
    res.status(500).json({ error: 'Failed to get track' });
  }
});

router.get('/artist/:source/:id', async (req, res) => {
  try {
    const { source, id } = req.params;
    let artist;

    if (source === 'deezer') {
      artist = await deezer.getArtist(id);
    } else if (source === 'jamendo') {
      artist = await jamendo.getArtist(id);
    } else {
      return res.status(400).json({ error: 'Invalid source' });
    }

    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    console.error('Get artist error:', err);
    res.status(500).json({ error: 'Failed to get artist' });
  }
});

router.get('/album/:source/:id', async (req, res) => {
  try {
    const { source, id } = req.params;
    let album;

    if (source === 'deezer') {
      album = await deezer.getAlbum(id);
    } else if (source === 'jamendo') {
      album = await jamendo.getAlbumTracks(id);
    } else {
      return res.status(400).json({ error: 'Invalid source' });
    }

    if (!album) return res.status(404).json({ error: 'Album not found' });
    res.json(album);
  } catch (err) {
    console.error('Get album error:', err);
    res.status(500).json({ error: 'Failed to get album' });
  }
});

router.get('/charts', async (req, res) => {
  try {
    const charts = await deezer.getCharts();
    res.json(charts);
  } catch (err) {
    console.error('Charts error:', err);
    res.status(500).json({ error: 'Failed to get charts' });
  }
});

router.get('/discover', async (req, res) => {
  try {
    const charts = await deezer.getCharts();
    // Return a curated discover feed from charts
    res.json({
      trending: charts.tracks.slice(0, 10),
      topArtists: charts.artists.slice(0, 6),
      topAlbums: charts.albums.slice(0, 6),
    });
  } catch (err) {
    console.error('Discover error:', err);
    res.status(500).json({ error: 'Failed to get discover feed' });
  }
});

export default router;
