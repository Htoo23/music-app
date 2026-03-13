import React, { useState, useEffect, useCallback } from 'react'
import Sidebar   from './components/Sidebar'
import Player    from './components/Player'
import SearchBar from './components/SearchBar'
import TrackRow  from './components/TrackRow'
import { searchTracks, searchAlbums, normaliseTrack, normaliseAlbum } from './api'

const DEFAULT = 'coldplay'
const SUGGESTIONS = ['Coldplay', 'Adele', 'Radiohead', 'Daft Punk', 'The Weeknd', 'Billie Eilish']

export default function App() {
  const [nav, setNav]                 = useState('home')
  const [tracks, setTracks]           = useState([])
  const [albums, setAlbums]           = useState([])
  const [artistName, setArtistName]   = useState('')
  const [genre, setGenre]             = useState('')
  const [currentTrack, setCurrentTrack] = useState(null)
  const [currentIdx, setCurrentIdx]   = useState(-1)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [showAll, setShowAll]         = useState(false)

  const load = useCallback(async (query) => {
    setLoading(true)
    setError(null)
    setTracks([])
    setAlbums([])
    setSelectedAlbum(null)
    setShowAll(false)

    try {
      const [tRes, aRes] = await Promise.all([
        searchTracks(query, 50),
        searchAlbums(query, 24),
      ])

      const rawTracks = (tRes.results || []).filter(r => r.wrapperType === 'track')
      const rawAlbums = (aRes.results || []).filter(r => r.wrapperType === 'collection')

      if (!rawTracks.length) {
        setError(`No results for "${query}". Try one of the suggestions below.`)
        setLoading(false)
        return
      }

      const t = rawTracks.map(normaliseTrack)
      // Deduplicate albums
      const seen = new Set()
      const a = rawAlbums.map(normaliseAlbum).filter(al => {
        if (seen.has(al.name)) return false
        seen.add(al.name); return true
      })

      setTracks(t)
      setAlbums(a)
      setArtistName(t[0]?.artist || query)
      setGenre(t[0]?.genre || '')
    } catch (e) {
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
    if (!t.preview) { alert(`No 30-sec preview for "${t.name}"`) ; return }
    setCurrentIdx(i)
    setCurrentTrack({ name: t.name, artist: t.artist, album: t.album, thumb: t.thumb, preview: t.preview })
  }

  return (
    <div style={S.app}>
      <Sidebar active={nav} setActive={setNav} />

      <div style={S.main}>
        <div style={S.content}>

          {/* Header */}
          <div style={S.header}>
            <SearchBar onSearch={load} loading={loading} />
            <button style={S.notif}>🔔</button>
          </div>

          {error && <div style={S.error}>{error}</div>}

          {loading && (
            <div style={S.loader}>
              <div style={S.spinner} />
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</span>
            </div>
          )}

          {/* Artist Banner */}
          {!loading && artistName && (
            <div style={S.banner}>
              <div style={S.bannerArt}>
                {tracks[0]?.thumb
                  ? <img src={tracks[0].thumb} alt="" style={S.bannerImg} />
                  : <div style={S.bannerFb}>{artistName[0]}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.genreTag}>{genre || 'Music'}</div>
                <div style={S.artistName}>{artistName}</div>
              </div>
              <div style={S.stats}>
                {[
                  { n: tracks.length,                        l: 'Tracks'   },
                  { n: tracks.filter(t => t.preview).length, l: 'Playable' },
                  { n: albums.length,                        l: 'Albums'   },
                ].map(({ n, l }) => (
                  <div key={l} style={S.stat}>
                    <span style={S.statN}>{n}</span>
                    <span style={S.statL}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hero (empty state) */}
          {!loading && !artistName && !error && (
            <div style={S.hero}>
              <div style={S.heroCard}>
                <div style={S.heroTitle}>GET LOST</div>
                <div style={S.heroSub}>in your music.</div>
              </div>
              <div style={{ ...S.heroCard, background: 'linear-gradient(135deg,#4361ee,#4cc9f0)' }}>
                <div style={S.heroTitle}>MELLOW</div>
                <div style={S.heroSub}>beats.</div>
              </div>
            </div>
          )}

          {/* Tracks */}
          {!loading && tracks.length > 0 && (
            <div style={S.section}>
              <div style={S.secHead}>
                <h2 style={S.secTitle}>{selectedAlbum ? `📀 ${selectedAlbum}` : 'Tracks'}</h2>
                <span style={S.secCount}>{filtered.length} songs</span>
                {selectedAlbum && (
                  <button style={S.clearBtn} onClick={() => { setSelectedAlbum(null); setShowAll(false) }}>
                    ✕ All tracks
                  </button>
                )}
              </div>
              <div style={S.colHead}>
                <div style={{ width: 28 }}>#</div>
                <div style={{ width: 42 }} />
                <div style={{ flex: 1 }}>TITLE</div>
                <div style={{ width: 160 }}>ALBUM</div>
                <div style={{ width: 48, textAlign: 'right' }}>TIME</div>
                <div style={{ width: 32 }} />
              </div>
              {visible.map((t, i) => (
                <TrackRow key={t.id || i} track={t} index={i}
                  onPlay={() => playAt(i, filtered)}
                  isPlaying={currentTrack?.name === t.name && currentTrack?.artist === t.artist} />
              ))}
              {filtered.length > 8 && (
                <button style={S.moreBtn} onClick={() => setShowAll(s => !s)}>
                  {showAll ? '▲ Show less' : `▼ Show all ${filtered.length} tracks`}
                </button>
              )}
            </div>
          )}

          {/* Albums */}
          {!loading && albums.length > 0 && (
            <div style={S.section}>
              <div style={S.secHead}>
                <h2 style={S.secTitle}>Albums</h2>
                <span style={S.secCount}>{albums.length} · click to filter</span>
              </div>
              <div style={S.grid}>
                {albums.map((al, i) => {
                  const active = selectedAlbum === al.name
                  return (
                    <div key={al.id || i}
                      style={{ ...S.albumCard, ...(active ? S.albumActive : {}) }}
                      onClick={() => { setSelectedAlbum(s => s === al.name ? null : al.name); setShowAll(false) }}>
                      {al.thumb
                        ? <img src={al.thumb} alt={al.name} style={S.albumImg} />
                        : <div style={S.albumFb}>{al.name?.[0]}</div>}
                      <div style={S.albumName}>{al.name}</div>
                      <div style={S.albumYear}>{al.year}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty suggestions */}
          {!loading && !tracks.length && !error && (
            <div style={S.empty}>
              <div style={{ fontSize: 52, opacity: 0.2 }}>♪</div>
              <div style={{ color: 'var(--muted)' }}>Search for an artist to get started</div>
              <div style={S.tags}>
                {SUGGESTIONS.map(a => (
                  <button key={a} style={S.tag} onClick={() => load(a)}>{a}</button>
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

const S = {
  app:        { display: 'flex', height: '100vh', overflow: 'hidden' },
  main:       { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  content:    { flex: 1, overflowY: 'auto', padding: '24px 32px' },
  header:     { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  notif:      { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: 16, marginLeft: 'auto', flexShrink: 0 },
  error:      { background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.3)', borderRadius: 10, padding: '12px 16px', color: 'var(--pink)', fontSize: 13, marginBottom: 20 },
  loader:     { display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: 60 },
  spinner:    { width: 22, height: 22, border: '2px solid var(--border)', borderTopColor: 'var(--pink)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  banner:     { display: 'flex', gap: 20, alignItems: 'center', background: 'var(--surface)', borderRadius: 16, padding: '18px 22px', marginBottom: 24, border: '1px solid var(--border)' },
  bannerArt:  { width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0 },
  bannerImg:  { width: '100%', height: '100%', objectFit: 'cover' },
  bannerFb:   { width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--pink),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white' },
  genreTag:   { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--pink)', textTransform: 'uppercase', marginBottom: 4 },
  artistName: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 },
  stats:      { display: 'flex', gap: 24, flexShrink: 0 },
  stat:       { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statN:      { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 },
  statL:      { fontSize: 10, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' },
  hero:       { display: 'flex', gap: 16, marginBottom: 28 },
  heroCard:   { flex: 1, background: 'linear-gradient(135deg,var(--pink),var(--purple))', borderRadius: 16, padding: '28px 24px', minHeight: 130 },
  heroTitle:  { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'white', letterSpacing: -1 },
  heroSub:    { fontFamily: 'var(--font-display)', fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  section:    { marginBottom: 32 },
  secHead:    { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  secTitle:   { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 },
  secCount:   { fontSize: 12, color: 'var(--muted)' },
  clearBtn:   { marginLeft: 'auto', background: 'rgba(247,37,133,0.15)', border: '1px solid rgba(247,37,133,0.3)', borderRadius: 16, color: 'var(--pink)', fontSize: 12, padding: '4px 12px', cursor: 'pointer' },
  colHead:    { display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 8px', borderBottom: '1px solid var(--border)', marginBottom: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)' },
  moreBtn:    { background: 'none', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--muted)', fontSize: 12, padding: '8px 18px', cursor: 'pointer', marginTop: 12, fontFamily: 'var(--font-body)' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 },
  albumCard:  { cursor: 'pointer', borderRadius: 12, padding: 4, border: '2px solid transparent', transition: 'border-color .15s' },
  albumActive:{ border: '2px solid var(--pink)' },
  albumImg:   { width: '100%', aspectRatio: '1', borderRadius: 10, objectFit: 'cover', display: 'block', marginBottom: 8 },
  albumFb:    { width: '100%', aspectRatio: '1', background: 'linear-gradient(135deg,var(--purple),var(--blue))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 8 },
  albumName:  { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  albumYear:  { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
  empty:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 60 },
  tags:       { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  tag:        { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text)', fontSize: 13, padding: '8px 18px', cursor: 'pointer', fontFamily: 'var(--font-body)' },
}
