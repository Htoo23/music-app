import React, { useState } from 'react'

const fmt = ms => {
  if (!ms) return '--:--'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function TrackRow({ track, index, onPlay, isPlaying }) {
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked]     = useState(false)

  return (
    <div
      className={`track-row${isPlaying ? ' playing' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
    >
      <div className="track-idx">
        {hovered || isPlaying
          ? <button className="track-play-btn">{isPlaying ? '⏸' : '▶'}</button>
          : <span>{index + 1}</span>}
      </div>

      <div className="track-thumb">
        {track.thumb
          ? <img src={track.thumb} alt="" />
          : <div className="track-thumb-fb">{track.name?.[0]}</div>}
        {isPlaying && <div className="track-thumb-overlay">▶</div>}
      </div>

      <div className="track-info">
        <div className={`track-name${isPlaying ? ' playing' : ''}`}>
          {track.name}
          {track.preview && <span className="track-preview-dot" />}
        </div>
        <div className="track-artist">{track.artist}</div>
      </div>

      <div className="track-album">{track.album}</div>
      <div className="track-dur">{fmt(track.duration)}</div>

      <button
        className="track-heart"
        style={{ color: liked ? 'var(--pink)' : 'var(--muted)' }}
        onClick={e => { e.stopPropagation(); setLiked(l => !l) }}
      >
        {liked ? '♥' : '♡'}
      </button>
    </div>
  )
}
