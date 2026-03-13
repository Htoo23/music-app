// Vercel Serverless Function — proxies TheAudioDB to avoid CORS
// Accessible at /api/audiodb?path=search.php&s=coldplay

export default async function handler(req, res) {
  const { path, ...params } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  const qs = new URLSearchParams(params).toString();
  const url = `https://www.theaudiodb.com/api/v1/json/123/${path}${qs ? '?' + qs : ''}`;

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'MusicApp/1.0' },
    });
    const data = await upstream.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
