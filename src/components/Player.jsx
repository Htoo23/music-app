import React, { useState, useRef, useEffect } from 'react';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export default function Player({ track, onNext, onPrev }) {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]   = useState(0.8);
  const audio = useRef(null);

  // Create audio element once
  useEffect(() => {
    const el = new Audio();
    el.volume = 0.8;
    audio.current = el;

    el.addEventListener('timeupdate',     () => setCurrent(el.currentTime));
    el.addEventListener('loadedmetadata', () => setDuration(el.duration));
    el.addEventListener('ended',          () => { setPlaying(false); onNext?.(); });
    el.addEventListener('error',          () => setPlaying(false));

    return () => { el.pause(); el.src = ''; };
  }, []); // eslint-disable-line

  // New track → load & autoplay
  useEffect(() => {
    if (!track?.preview || !audio.current) return;
    const el = audio.current;
    el.pause();
    el.src = track.preview;
    el.load();
    setCurrent(0);
    setDuration(0);
    el.play()
      .then(() => setPlaying(true))
      .catch(err => {
        console.warn('Playback error:', err);
        setPlaying(false);
      });
  }, [track?.preview, track?.name]); // re-trigger if same preview URL but different track name

  function togglePlay() {
    const el = audio.current;
    if (!el || !track?.preview) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  function seek(e) {
    const el = audio.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
    el.currentTime = t;
    setCurrent(t);
  }

  function setVol(v) {
    setVolume(v);
    if (audio.current) audio.current.volume = v;
  }

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <footer style={S.bar}>
      {/* Track info */}
      <div style={S.info}>
        <div style={S.thumb}>
          {track?.thumb
            ? <img src={track.thumb} alt="" style={S.thumbImg} />
            : <div style={S.thumbBg} />}
          {playing && (
            <div style={S.eqOverlay}>
              {[0,1,2,3].map(i => <span key={i} style={{ ...S.eqBar, animationDelay: `${i*0.18}s` }} />)}
            </div>
          )}
        </div>
        <div style={S.meta}>
          <div style={S.name}>{track?.name  || 'No track selected'}</div>
          <div style={S.artist}>{track?.artist || 'Click any track to play'}</div>
        </div>
        <button style={S.icon}>♡</button>
      </div>

      {/* Controls */}
      <div style={S.controls}>
        <div style={S.buttons}>
          <button style={S.icon}>⇄</button>
          <button style={S.icon} onClick={onPrev}>⏮</button>
          <button style={S.playBtn} onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>
          <button style={S.icon} onClick={onNext}>⏭</button>
          <button style={S.icon}>↻</button>
        </div>
        <div style={S.progress}>
          <span style={S.time}>{fmt(current)}</span>
          <div style={S.track} onClick={seek}>
            <div style={{ ...S.fill, width: `${pct}%` }}>
              <div style={S.dot} />
            </div>
          </div>
          <span style={S.time}>{fmt(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div style={S.vol}>
        <button style={S.icon} onClick={() => setVol(volume > 0 ? 0 : 0.8)}>
          {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </button>
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={e => setVol(+e.target.value)} style={S.slider} />
      </div>
    </footer>
  );
}

const S = {
  bar: { height: 76, background: 'linear-gradient(90deg,#1a0a2e,#0d1b4b)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 24, flexShrink: 0 },
  info: { display: 'flex', alignItems: 'center', gap: 14, width: 280, minWidth: 200 },
  thumb: { width: 46, height: 46, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbBg: { width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--purple),var(--blue))' },
  eqOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, paddingBottom: 6 },
  eqBar: { display: 'inline-block', width: 3, background: 'var(--pink)', borderRadius: 2, animation: 'barAnim 0.7s ease-in-out infinite' },
  meta: { flex: 1, minWidth: 0 },
  name: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  artist: { fontSize: 11, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  icon: { background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0 },
  controls: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  buttons: { display: 'flex', alignItems: 'center', gap: 20 },
  playBtn: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--pink),var(--purple))', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(247,37,133,0.4)' },
  progress: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 440 },
  time: { fontSize: 11, color: 'var(--muted)', width: 34, textAlign: 'center', flexShrink: 0 },
  track: { flex: 1, height: 4, background: 'var(--surface2)', borderRadius: 2, cursor: 'pointer', position: 'relative' },
  fill: { height: '100%', background: 'linear-gradient(90deg,var(--pink),var(--blue))', borderRadius: 2, position: 'relative' },
  dot: { width: 11, height: 11, borderRadius: '50%', background: 'white', position: 'absolute', right: -5, top: -3.5 },
  vol: { display: 'flex', alignItems: 'center', gap: 8, width: 140, flexShrink: 0 },
  slider: { flex: 1, accentColor: 'var(--pink)', cursor: 'pointer' },
};
