import React, { useState, useRef, useEffect } from 'react'

const fmt = s => !s || isNaN(s) ? '0:00' : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`

export default function Player({ track, onNext, onPrev }) {
  const [playing,  setPlaying]  = useState(false)
  const [current,  setCurrent]  = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume,   setVolume]   = useState(0.8)
  const elRef = useRef(null)

  useEffect(() => {
    const el = new Audio()
    el.volume = 0.8
    elRef.current = el
    el.addEventListener('timeupdate',     () => setCurrent(el.currentTime))
    el.addEventListener('loadedmetadata', () => setDuration(el.duration))
    el.addEventListener('ended',          () => { setPlaying(false); onNext?.() })
    return () => { el.pause(); el.src = '' }
  }, []) // eslint-disable-line

  useEffect(() => {
    const el = elRef.current
    if (!el || !track?.preview) return
    el.pause(); el.src = track.preview; el.volume = volume; el.load()
    setCurrent(0); setDuration(0)
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [track?.preview, track?.name]) // eslint-disable-line

  const toggle = () => {
    const el = elRef.current
    if (!el || !track?.preview) return
    if (playing) { el.pause(); setPlaying(false) }
    else el.play().then(() => setPlaying(true)).catch(() => {})
  }

  const seek = e => {
    const el = elRef.current
    if (!el || !duration) return
    const r = e.currentTarget.getBoundingClientRect()
    const t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration
    el.currentTime = t; setCurrent(t)
  }

  const setVol = v => { setVolume(v); if (elRef.current) elRef.current.volume = v }
  const pct = duration ? (current / duration) * 100 : 0

  return (
    <footer className="player">
      {/* Info */}
      <div className="player-info">
        <div className="player-thumb">
          {track?.thumb ? <img src={track.thumb} alt="" /> : <div className="player-thumb-bg" />}
          {playing && (
            <div className="player-eq">
              {[0,1,2,3].map(i => (
                <span key={i} className="player-eq-bar" style={{ animationDelay: `${i*0.18}s` }} />
              ))}
            </div>
          )}
        </div>
        <div className="player-meta">
          <div className="player-name">{track?.name   || 'No track selected'}</div>
          <div className="player-artist">{track?.artist || 'Click a track to play'}</div>
        </div>
        <button className="player-heart">♡</button>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <div className="player-btns">
          <button className="player-btn">⇄</button>
          <button className="player-btn" onClick={onPrev}>⏮</button>
          <button className="player-play-btn" onClick={toggle}>{playing ? '⏸' : '▶'}</button>
          <button className="player-btn" onClick={onNext}>⏭</button>
          <button className="player-btn">↻</button>
        </div>
        <div className="player-progress">
          <span className="player-time">{fmt(current)}</span>
          <div className="player-bar" onClick={seek}>
            <div className="player-fill" style={{ width: `${pct}%` }}>
              <div className="player-dot" />
            </div>
          </div>
          <span className="player-time">{fmt(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="player-vol">
        <button className="player-btn" onClick={() => setVol(volume > 0 ? 0 : 0.8)}>
          {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </button>
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={e => setVol(+e.target.value)} />
      </div>
    </footer>
  )
}
