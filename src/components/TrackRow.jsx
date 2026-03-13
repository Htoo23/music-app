import React, { useState } from 'react';

function formatDuration(ms) {
  if (!ms) return '--:--';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function TrackRow({ track, index, onPlay, isPlaying, hasPreview }) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div
      style={{
        ...styles.row,
        background: hovered || isPlaying ? 'rgba(255,255,255,0.04)' : 'transparent',
        opacity: hasPreview === false ? 0.5 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
      title={!hasPreview ? 'No preview available' : ''}
    >
      <div style={styles.indexCell}>
        {hovered || isPlaying ? (
          <button style={styles.playMini}>{isPlaying ? '⏸' : '▶'}</button>
        ) : (
          <span style={styles.indexNum}>{index + 1}</span>
        )}
      </div>
      <div style={styles.thumb}>
        {track.strTrackThumb || track.strAlbumThumb ? (
          <img src={track.strTrackThumb || track.strAlbumThumb} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
        ) : (
          <div style={styles.thumbFallback}>{track.strTrack?.[0] || '♪'}</div>
        )}
        {isPlaying && <div style={styles.playingOverlay}>▶</div>}
      </div>
      <div style={styles.info}>
        <div style={{ ...styles.trackName, color: isPlaying ? 'var(--pink)' : 'var(--text)' }}>
          {track.strTrack || 'Unknown'}
          {hasPreview && <span style={styles.previewDot} title="Preview available" />}
        </div>
        <div style={styles.artistName}>{track.strArtist || '—'}</div>
      </div>
      <div style={styles.album}>{track.strAlbum || '—'}</div>
      <div style={styles.duration}>{formatDuration(track.intDuration)}</div>
      <button
        style={{ ...styles.likeBtn, color: liked ? 'var(--pink)' : 'var(--muted)' }}
        onClick={e => { e.stopPropagation(); setLiked(l => !l); }}>
        {liked ? '♥' : '♡'}
      </button>
    </div>
  );
}

const styles = {
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderRadius: 10, cursor: 'pointer', transition: 'background .15s, opacity .15s', animation: 'slideUp .3s ease both' },
  indexCell: { width: 24, textAlign: 'center', flexShrink: 0 },
  indexNum: { fontSize: 13, color: 'var(--muted)' },
  playMini: { background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 13, padding: 0 },
  thumb: { width: 38, height: 38, borderRadius: 6, overflow: 'hidden', flexShrink: 0, position: 'relative' },
  thumbFallback: { width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--purple), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  playingOverlay: { position: 'absolute', inset: 0, background: 'rgba(247,37,133,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white' },
  info: { flex: 1, minWidth: 0 },
  trackName: { fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 },
  previewDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0, display: 'inline-block' },
  artistName: { fontSize: 11, color: 'var(--muted)', marginTop: 2 },
  album: { width: 160, fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  duration: { width: 48, fontSize: 12, color: 'var(--muted)', textAlign: 'right' },
  likeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0, transition: 'color .2s' },
};
