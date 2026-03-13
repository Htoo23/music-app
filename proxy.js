/**
 * Tiny local proxy server — runs on port 3001.
 * React dev server (port 3000) forwards /api/* requests here via "proxy" in package.json.
 * This server fetches from TheAudioDB with no CORS restrictions (server-to-server).
 */
const express = require('express');
const fetch   = require('node-fetch');
const app     = express();

const AUDIODB = 'https://www.theaudiodb.com/api/v1/json/123';

// GET /api/audiodb/:path  →  fetches AUDIODB/:path
app.get('/api/audiodb/:path(*)', async (req, res) => {
  const url = `${AUDIODB}/${req.params.path}${req.query ? '?' + new URLSearchParams(req.query).toString() : ''}`;
  console.log('[proxy] →', url);
  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'MusicApp/1.0' } });
    const body = await upstream.text();
    res.set('Content-Type', 'application/json');
    res.status(upstream.status).send(body);
  } catch (err) {
    console.error('[proxy] error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('[proxy] running on http://localhost:3001'));
