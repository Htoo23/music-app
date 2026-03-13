import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import SearchBar from './components/SearchBar';
import TrackRow from './components/TrackRow';
import HeroBanner from './components/HeroBanner';
import { itunesSearchTracks, itunesSearchAlbums, adbArtistInfo } from './api';

const DEFAULT_ARTIST = 'coldplay';

// Normalise iTunes track/album data into our internal shape
function normaliseTrack(r) {
  return {
    id:           r.trackId,
    strTrack:     r.trackName,
    strArtist:    r.artistName,
    strAlbum:     r.collectionName,
    strAlbumThumb: r.artworkUrl100?.replace('100x100', '300x300') || '',
    intDuration:  r.trackTimeMillis,
    preview:      r.previewUrl || null,      // ← real MP3, always present from iTunes
    trackNumber:  r.trackNumber,
  };
}

function normaliseAlbum(r) {
  return {
    id:            r.collectionId,
    strAlbum:      r.collectionName,
    strAlbumThumb: r.artworkUrl100?.replace('100x100', '300x300') || '',
    intYearReleased: r.releaseDate?.slice(0, 4),
  };
}

export default function App() {
  const [activeNav, setActiveNav]         = useState('home');
  const [tracks, setTracks]               = useState([]);
  const [albums, setAlbums]               = useState([]);
  const [artistInfo, setArtistInfo]       = useState(null);
  const [currentTrack, setCurrentTrack]   = useState(null);
  const [currentIndex, setCurrentIndex]   = useState(-1);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const loadArtist = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    setTracks([]);
    setAlbums([]);
    setArtistInfo(null);
    setSelectedAlbum(null);
    setShowAllTracks(false);

    try {
      // All three in parallel — iTunes always works, AudioDB is bonus
      const [tracksRes, albumsRes, adbRes] = await Promise.all([
        itunesSearchTracks(query, 50),
        itunesSearchAlbums(query, 20),
        adbArtistInfo(query),
      ]);

      const rawTracks = tracksRes.results?.filter(r => r.wrapperType === 'track') || [];
      const rawAlbums = albumsRes.results?.filter(r => r.wrapperType === 'collection') || [];

      if (!rawTracks.length) {
        setError(`No results for "${query}". Try: Coldplay, Adele, Radiohead, Daft Punk.`);
        setLoading(false);
        return;
      }

      const normTracks = rawTracks.map(normaliseTrack);
      const normAlbums = rawAlbums.map(normaliseAlbum);

      // Deduplicate albums by name
      const seen = new Set();
      const uniqueAlbums = normAlbums.filter(a => {
        if (seen.has(a.strAlbum)) return false;
        seen.add(a.strAlbum);
        return true;
      });

      setTracks(normTracks);
      setAlbums(uniqueAlbums);

      // Use AudioDB artist info if proxy worked, otherwise build from iTunes
      if (adbRes?.artists?.[0]) {
        setArtistInfo(adbRes.artists[0]);
      } else {
        // Build minimal artist card from iTunes data
        const first = rawTracks[0];
        setArtistInfo({
          strArtist:    first?.artistName || query,
          strGenre:     first?.primaryGenreName || '',
          strArtistThumb: null,
          strBiographyEN: null,
        });
      }
    } catch (e) {
      setError('Failed to load music. Please check your connection.');
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadArtist(DEFAULT_ARTIST); }, [loadArtist]);

  // Play a track by index in filteredTracks
  function playAtIndex(idx, list) {
    const t = list[idx];
    if (!t) return;
    setCurrentIndex(idx);
    setCurrentTrack({
      name:    t.strTrack,
      artist:  t.strArtist,
      album:   t.strAlbum,
      thumb:   t.strAlbumThumb,
      preview: t.preview,
    });
  }

  function playNext(list) { playAtIndex(currentIndex + 1, list); }
  function playPrev(list) { playAtIndex(Math.max(0, currentIndex - 1), list); }

  const filteredTracks = selectedAlbum
    ? tracks.filter(t => t.strAlbum === selectedAlbum)
    : tracks;
  const visibleTracks = showAllTracks ? filteredTracks : filteredTracks.slice(0, 8);

  return (
    <div style={S.app}>
      <Sidebar active={activeNav} setActive={setActiveNav} />
      <div style={S.main}>
        <div style={S.content}>

          <div style={S.header}>
            <SearchBar onSearch={loadArtist} loading={loading} />
            <div style={S.headerRight}>
              <button style={S.notifBtn}>🔔</button>
            </div>
          </div>

          {error && <div style={S.error}>{error}</div>}

          {loading && (
            <div style={S.loadingState}>
              <div style={S.spinner} />
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>Loading music…</span>
            </div>
          )}

          {/* Artist Banner */}
          {!loading && artistInfo && (
            <div style={S.artistBanner}>
              {artistInfo.strArtistThumb
                ? <img src={artistInfo.strArtistThumb} alt={artistInfo.strArtist} style={S.artistThumb} />
                : <div style={S.artistThumbFallback}>{artistInfo.strArtist?.[0]}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.artistGenre}>
                  {artistInfo.strGenre || 'Music'}
                  {artistInfo.strCountry ? ` · ${artistInfo.strCountry}` : ''}
                </div>
                <div style={S.artistName}>{artistInfo.strArtist}</div>
                {artistInfo.strBiographyEN && (
                  <div style={S.artistBio}>{artistInfo.strBiographyEN.slice(0, 220)}…</div>
                )}
              </div>
              <div style={S.artistStats}>
                {[
                  { n: tracks.length,                         l: 'Tracks'   },
                  { n: tracks.filter(t => t.preview).length,  l: 'Playable' },
                  { n: albums.length,                         l: 'Albums'   },
                ].map(({ n, l }) => (
                  <div key={l} style={S.stat}>
                    <span style={S.statNum}>{n}</span>
                    <span style={S.statLabel}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !artistInfo && !error && <HeroBanner onPlay={() => loadArtist('coldplay')} />}

          {/* Tracks */}
          {!loading && tracks.length > 0 && (
            <div style={S.section}>
              <div style={S.sectionHeader}>
                <h2 style={S.sectionTitle}>{selectedAlbum ? `📀 ${selectedAlbum}` : 'Tracks'}</h2>
                <span style={S.count}>{filteredTracks.length} songs</span>
                {selectedAlbum && (
                  <button style={S.clearFilter}
                    onClick={() => { setSelectedAlbum(null); setShowAllTracks(false); }}>
                    ✕ All tracks
                  </button>
                )}
              </div>
              <div style={S.trackHeader}>
                <div style={{ width: 28 }}>#</div>
                <div style={{ width: 42 }} />
                <div style={{ flex: 1 }}>TITLE</div>
                <div style={{ width: 170 }}>ALBUM</div>
                <div style={{ width: 52, textAlign: 'right' }}>TIME</div>
                <div style={{ width: 32 }} />
              </div>
              {visibleTracks.map((t, i) => (
                <TrackRow
                  key={t.id || i}
                  track={t}
                  index={i}
                  onPlay={() => playAtIndex(i, filteredTracks)}
                  isPlaying={currentTrack?.name === t.strTrack && currentTrack?.artist === t.strArtist}
                  hasPreview={!!t.preview}
                />
              ))}
              {filteredTracks.length > 8 && (
                <button style={S.seeAll} onClick={() => setShowAllTracks(s => !s)}>
                  {showAllTracks ? '▲ Show less' : `▼ Show all ${filteredTracks.length} tracks`}
                </button>
              )}
            </div>
          )}

          {/* Albums */}
          {!loading && albums.length > 0 && (
            <div style={S.section}>
              <div style={S.sectionHeader}>
                <h2 style={S.sectionTitle}>Albums</h2>
                <span style={S.count}>{albums.length} albums · click to filter</span>
              </div>
              <div style={S.albumGrid}>
                {albums.map((al, i) => {
                  const active = selectedAlbum === al.strAlbum;
                  return (
                    <div key={al.id || i}
                      style={{ ...S.albumCard, ...(active ? S.albumCardActive : {}) }}
                      onClick={() => { setSelectedAlbum(s => s === al.strAlbum ? null : al.strAlbum); setShowAllTracks(false); }}>
                      {al.strAlbumThumb
                        ? <img src={al.strAlbumThumb} alt={al.strAlbum} style={S.albumThumb} />
                        : <div style={S.albumFallback}>{al.strAlbum?.[0] || '♪'}</div>}
                      <div style={S.albumName}>{al.strAlbum}</div>
                      <div style={S.albumYear}>{al.intYearReleased || '—'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && !tracks.length && !error && (
            <div style={S.emptyState}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>♪</div>
              <div style={{ color: 'var(--muted)', fontSize: 15 }}>Search for an artist to get started</div>
              <div style={S.suggestions}>
                {['Coldplay', 'Adele', 'Radiohead', 'Daft Punk'].map(a => (
                  <button key={a} style={S.suggBtn} onClick={() => loadArtist(a)}>{a}</button>
                ))}
              </div>
            </div>
          )}

        </div>
        <Player
          track={currentTrack}
          onNext={() => playNext(filteredTracks)}
          onPrev={() => playPrev(filteredTracks)}
        />
      </div>
    </div>
  );
}

const S = {
  app: { display: 'flex', height: '100vh', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  content: { flex: 1, overflowY: 'auto', padding: '24px 32px' },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  headerRight: { display: 'flex', gap: 10, marginLeft: 'auto' },
  notifBtn: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: 16 },
  error: { background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.3)', borderRadius: 10, padding: '12px 16px', color: 'var(--pink)', fontSize: 13, marginBottom: 20 },
  loadingState: { display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: 60 },
  spinner: { width: 22, height: 22, border: '2px solid var(--border)', borderTopColor: 'var(--pink)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  artistBanner: { display: 'flex', gap: 20, alignItems: 'center', background: 'var(--surface)', borderRadius: 16, padding: '18px 22px', marginBottom: 24, border: '1px solid var(--border)' },
  artistThumb: { width: 76, height: 76, borderRadius: 12, objectFit: 'cover', flexShrink: 0 },
  artistThumbFallback: { width: 76, height: 76, borderRadius: 12, background: 'linear-gradient(135deg,var(--pink),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0 },
  artistGenre: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--pink)', textTransform: 'uppercase', marginBottom: 4 },
  artistName: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 },
  artistBio: { fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.6 },
  artistStats: { display: 'flex', gap: 24, flexShrink: 0 },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statNum: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 },
  statLabel: { fontSize: 10, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' },
  section: { marginBottom: 32 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 },
  count: { fontSize: 12, color: 'var(--muted)' },
  clearFilter: { marginLeft: 'auto', background: 'rgba(247,37,133,0.15)', border: '1px solid rgba(247,37,133,0.3)', borderRadius: 16, color: 'var(--pink)', fontSize: 12, padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  trackHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 8px', borderBottom: '1px solid var(--border)', marginBottom: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)' },
  seeAll: { background: 'none', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--muted)', fontSize: 12, padding: '8px 18px', cursor: 'pointer', marginTop: 12, fontFamily: 'var(--font-body)' },
  albumGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 },
  albumCard: { cursor: 'pointer', borderRadius: 12, padding: 4, border: '2px solid transparent', transition: 'transform .15s' },
  albumCardActive: { border: '2px solid var(--pink)' },
  albumThumb: { width: '100%', aspectRatio: '1', borderRadius: 10, objectFit: 'cover', display: 'block', marginBottom: 8 },
  albumFallback: { width: '100%', aspectRatio: '1', background: 'linear-gradient(135deg, var(--purple), var(--blue))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 8 },
  albumName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  albumYear: { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 },
  suggestions: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  suggBtn: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text)', fontSize: 13, padding: '8px 18px', cursor: 'pointer', fontFamily: 'var(--font-body)' },
};
