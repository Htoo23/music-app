import React, { useState, useEffect, useCallback } from 'react'
import Sidebar   from './components/Sidebar'
import Player    from './components/Player'
import SearchBar from './components/SearchBar'
import TrackRow  from './components/TrackRow'
import { searchTracks, searchAlbums, normaliseTrack, normaliseAlbum } from './api'

const DEFAULT     = 'coldplay'
const SUGGESTIONS = ['Coldplay', 'Adele', 'Radiohead', 'Daft Punk', 'The Weeknd', 'Billie Eilish']

export default function App() {
  const [nav, setNav]                   = useState('home')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [tracks, setTracks]             = useState([])
  const [albums, setAlbums]             = useState([])
  const [artistName, setArtistName]     = useState('')
  const [genre, setGenre]               = useState('')
  const [currentTrack, setCurrentTrack] = useState(null)
  const [currentIdx, setCurrentIdx]     = useState(-1)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [showAll, setShowAll]           = useState(false)

  const load = useCallback(async (query) => {
    setLoading(true); setError(null)
    setTracks([]); setAlbums([])
    setSelectedAlbum(null); setShowAll(false)
    try {
      const [tRes, aRes] = await Promise.all([
        searchTracks(query, 50),
        searchAlbums(query, 24),
      ])
      const rawTracks = (tRes.results || []).filter(r => r.wrapperType === 'track')
      const rawAlbums = (aRes.results || []).filter(r => r.wrapperType === 'collection')
      if (!rawTracks.length) {
        setError(`No results for "${query}". Try a suggestion below.`)
        setLoading(false); return
      }
      const t = rawTracks.map(normaliseTrack)
      const seen = new Set()
      const a = rawAlbums.map(normaliseAlbum).filter(al => {
        if (seen.has(al.name)) return false
        seen.add(al.name); return true
      })
      setTracks(t); setAlbums(a)
      setArtistName(t[0]?.artist || query)
      setGenre(t[0]?.genre || '')
    } catch {
      setError('Could not load music. Please check your connection.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { load(DEFAULT) }, [load])

  const filtered = selectedAlbum ? tracks.filter(t => t.album === selectedAlbum) : tracks
  const visible  = showAll ? filtered : filtered.slice(0, 8)

  function playAt(i, list) {
    const t = list[i]
    if (!t) return
    if (!t.preview) { alert(`No preview for "${t.name}"`); return }
    setCurrentIdx(i)
    setCurrentTrack({ name: t.name, artist: t.artist, album: t.album, thumb: t.thumb, preview: t.preview })
  }

  return (
    <div className="app">
      <Sidebar
        active={nav}
        setActive={setNav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main">
        <div className="content">

          {/* Header */}
          <div className="header">
            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <SearchBar onSearch={load} loading={loading} />
            <button className="notif-btn">🔔</button>
          </div>

          {error && <div className="error-box">{error}</div>}

          {loading && (
            <div className="loader">
              <div className="spinner" />
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</span>
            </div>
          )}

          {/* Artist Banner */}
          {!loading && artistName && (
            <div className="banner">
              <div className="banner-art">
                {tracks[0]?.thumb
                  ? <img src={tracks[0].thumb} alt={artistName} />
                  : <div className="banner-art-fb">{artistName[0]}</div>}
              </div>
              <div className="banner-meta">
                <div className="banner-genre">{genre || 'Music'}</div>
                <div className="banner-name">{artistName}</div>
              </div>
              <div className="banner-stats">
                {[
                  { n: tracks.length,                        l: 'Tracks'   },
                  { n: tracks.filter(t => t.preview).length, l: 'Playable' },
                  { n: albums.length,                        l: 'Albums'   },
                ].map(({ n, l }) => (
                  <div key={l} className="stat">
                    <span className="stat-n">{n}</span>
                    <span className="stat-l">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hero (empty state) */}
          {!loading && !artistName && !error && (
            <div className="hero">
              <div className="hero-card">
                <div className="hero-title">GET LOST</div>
                <div className="hero-sub">in your music.</div>
              </div>
              <div className="hero-card">
                <div className="hero-title">MELLOW</div>
                <div className="hero-sub">beats.</div>
              </div>
            </div>
          )}

          {/* Tracks */}
          {!loading && tracks.length > 0 && (
            <div className="section">
              <div className="sec-head">
                <h2 className="sec-title">{selectedAlbum ? `📀 ${selectedAlbum}` : 'Tracks'}</h2>
                <span className="sec-count">{filtered.length} songs</span>
                {selectedAlbum && (
                  <button className="clear-btn" onClick={() => { setSelectedAlbum(null); setShowAll(false) }}>
                    ✕ All tracks
                  </button>
                )}
              </div>

              {/* Column headers */}
              <div className="col-head">
                <div style={{ width: 28 }}>#</div>
                <div style={{ width: 46 }} />
                <div style={{ flex: 1 }}>TITLE</div>
                <div className="col-album" style={{ width: 160 }}>ALBUM</div>
                <div className="col-time" style={{ width: 48, textAlign: 'right' }}>TIME</div>
                <div style={{ width: 32 }} />
              </div>

              {visible.map((t, i) => (
                <TrackRow key={t.id || i} track={t} index={i}
                  onPlay={() => playAt(i, filtered)}
                  isPlaying={currentTrack?.name === t.name && currentTrack?.artist === t.artist} />
              ))}

              {filtered.length > 8 && (
                <button className="more-btn" onClick={() => setShowAll(s => !s)}>
                  {showAll ? '▲ Show less' : `▼ Show all ${filtered.length} tracks`}
                </button>
              )}
            </div>
          )}

          {/* Albums */}
          {!loading && albums.length > 0 && (
            <div className="section">
              <div className="sec-head">
                <h2 className="sec-title">Albums</h2>
                <span className="sec-count">{albums.length} · click to filter</span>
              </div>
              <div className="album-grid">
                {albums.map((al, i) => (
                  <div key={al.id || i}
                    className={`album-card${selectedAlbum === al.name ? ' active' : ''}`}
                    onClick={() => { setSelectedAlbum(s => s === al.name ? null : al.name); setShowAll(false) }}>
                    {al.thumb
                      ? <img src={al.thumb} alt={al.name} />
                      : <div className="album-card-fb">{al.name?.[0]}</div>}
                    <div className="album-name">{al.name}</div>
                    <div className="album-year">{al.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty / suggestions */}
          {!loading && !tracks.length && !error && (
            <div className="empty">
              <div style={{ fontSize: 52, opacity: 0.2 }}>♪</div>
              <div style={{ color: 'var(--muted)' }}>Search for an artist to get started</div>
              <div className="suggest-tags">
                {SUGGESTIONS.map(a => (
                  <button key={a} className="suggest-tag" onClick={() => load(a)}>{a}</button>
                ))}
              </div>
            </div>
          )}

        </div>

        <Player
          track={currentTrack}
          onNext={() => playAt(currentIdx + 1, filtered)}
          onPrev={() => playAt(Math.max(0, currentIdx - 1), filtered)}
        />
      </div>
    </div>
  )
}
