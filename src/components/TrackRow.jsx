import React, { useState } from 'react'

const fmt = ms => {
  if (!ms) return '--:--'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function TrackRow({ track, index, onPlay, isPlaying }) {
  const [hovered, setHovered] = useState(false)
  const [liked,   setLiked]   = useState(false)

  return (
    <div
      style={{ ...S.row, background: hovered || isPlaying ? 'rgba(255,255,255,0.04)' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
    >
      <div style={S.idx}>
        {hovered || isPlaying
          ? <button style={S.playMini}>{isPlaying ? '⏸' : '▶'}</button>
          : <span style={S.idxNum}>{index + 1}</span>}
      </div>

      <div style={S.thumb}>
        {track.thumb
          ? <img src={track.thumb} alt="" style={S.thumbImg} />
          : <div style={S.thumbBg}>{track.name?.[0]}</div>}
        {isPlaying && <div style={S.overlay}>▶</div>}
      </div>

      <div style={S.info}>
        <div style={{ ...S.name, color: isPlaying ? 'var(--pink)' : 'var(--text)' }}>
          {track.name}
          {track.preview && <span style={S.dot} />}
        </div>
        <div style={S.artist}>{track.artist}</div>
      </div>

      <div style={S.album}>{track.album}</div>
      <div style={S.dur}>{fmt(track.duration)}</div>

      <button style={{ ...S.heart, color: liked ? 'var(--pink)' : 'var(--muted)' }}
        onClick={e => { e.stopPropagation(); setLiked(l => !l) }}>
        {liked ? '♥' : '♡'}
      </button>
    </div>
  )
}

const S = {
  row:      { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderRadius: 10, cursor: 'pointer', transition: 'background .15s', animation: 'slideUp .25s ease both' },
  idx:      { width: 24, textAlign: 'center', flexShrink: 0 },
  idxNum:   { fontSize: 13, color: 'var(--muted)' },
  playMini: { background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 13, padding: 0 },
  thumb:    { width: 38, height: 38, borderRadius: 6, overflow: 'hidden', flexShrink: 0, position: 'relative' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbBg:  { width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--purple),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white', fontWeight: 700 },
  overlay:  { position: 'absolute', inset: 0, background: 'rgba(247,37,133,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white' },
  info:     { flex: 1, minWidth: 0 },
  name:     { fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 },
  dot:      { width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0 },
  artist:   { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
  album:    { width: 160, fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  dur:      { width: 46, fontSize: 12, color: 'var(--muted)', textAlign: 'right' },
  heart:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0, transition: 'color .2s' },
}
