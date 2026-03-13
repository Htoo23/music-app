/**
 * api.js
 *
 * PRIMARY: iTunes Search API — fetched directly from browser (native CORS, no proxy)
 *   - Artist search, track list, album list, 30-sec MP3 previews
 *
 * BONUS: TheAudioDB — artist bio & hi-res artwork via local proxy
 *   Falls back gracefully if proxy is unavailable
 */

// ── iTunes (direct, no proxy needed) ─────────────────────────────────────────

export async function itunesSearchTracks(artist, limit = 50) {
  const url = `https://itunes.apple.com/search?${new URLSearchParams({
    term: artist, entity: 'song', limit, sort: 'popular',
  })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes ${res.status}`);
  return res.json(); // .results[] each has: trackName, artistName, collectionName, previewUrl, artworkUrl100, trackTimeMillis
}

export async function itunesSearchAlbums(artist, limit = 20) {
  const url = `https://itunes.apple.com/search?${new URLSearchParams({
    term: artist, entity: 'album', limit,
  })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes albums ${res.status}`);
  return res.json();
}

export async function itunesLookupArtist(artist) {
  const url = `https://itunes.apple.com/search?${new URLSearchParams({
    term: artist, entity: 'musicArtist', limit: 1,
  })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes artist ${res.status}`);
  return res.json();
}

// ── TheAudioDB via local proxy (bonus — artist bio/artwork) ──────────────────

async function adbFetch(endpoint, params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const url = `/api/audiodb/${endpoint}${qs ? '?' + qs : ''}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null; // proxy down — no problem, iTunes handles everything
  }
}

export const adbArtistInfo = (s) => adbFetch('search.php', { s });
