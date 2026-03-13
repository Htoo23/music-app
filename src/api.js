/**
 * api.js — all data via iTunes Search API
 * iTunes has native CORS headers → works directly from the browser, no proxy needed.
 * Every track comes with a real 30-second MP3 previewUrl.
 */

const ITUNES = 'https://itunes.apple.com'

async function get(params) {
  const url = `${ITUNES}/search?${new URLSearchParams(params)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`iTunes ${res.status}`)
  return res.json()
}

export async function searchTracks(artist, limit = 50) {
  return get({ term: artist, entity: 'song', limit, sort: 'popular' })
}

export async function searchAlbums(artist, limit = 24) {
  return get({ term: artist, entity: 'album', limit })
}

export function normaliseTrack(r) {
  return {
    id:        r.trackId,
    name:      r.trackName      || 'Unknown',
    artist:    r.artistName     || '',
    album:     r.collectionName || '',
    thumb:     (r.artworkUrl100 || '').replace('100x100bb', '300x300bb'),
    duration:  r.trackTimeMillis || 0,
    preview:   r.previewUrl     || null,
    trackNum:  r.trackNumber,
    genre:     r.primaryGenreName || '',
  }
}

export function normaliseAlbum(r) {
  return {
    id:        r.collectionId,
    name:      r.collectionName || 'Unknown',
    artist:    r.artistName     || '',
    thumb:     (r.artworkUrl100 || '').replace('100x100bb', '300x300bb'),
    year:      r.releaseDate?.slice(0, 4) || '',
    tracks:    r.trackCount || 0,
  }
}
