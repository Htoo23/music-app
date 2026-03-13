import React from 'react';

const BANNERS = [
  { title: 'GET LOST', sub: 'in your music.', gradient: 'linear-gradient(135deg, #f72585, #b5179e, #7209b7)' },
  { title: 'MELLOW', sub: 'beats.', gradient: 'linear-gradient(135deg, #4361ee, #4cc9f0)' },
  { title: 'FEEL IT', sub: 'all around you.', gradient: 'linear-gradient(135deg, #f77f00, #d62828)' },
];

export default function HeroBanner({ onPlay }) {
  return (
    <div style={styles.container}>
      {BANNERS.map((b, i) => (
        <div key={i} style={{ ...styles.card, background: b.gradient }}>
          <div style={styles.noise} />
          <div>
            <div style={styles.title}>{b.title}</div>
            <div style={styles.sub}>{b.sub}</div>
          </div>
          <button style={styles.playBtn} onClick={onPlay}>▶</button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { display: 'flex', gap: 16, marginBottom: 32 },
  card: {
    flex: 1, borderRadius: 16, padding: '28px 24px 20px', display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', minHeight: 140, position: 'relative', overflow: 'hidden', cursor: 'pointer',
    transition: 'transform .2s, box-shadow .2s',
  },
  noise: { position: 'absolute', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.08\'/%3E%3C/svg%3E")', opacity: 0.5 },
  title: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: -1, color: 'white', lineHeight: 1 },
  sub: { fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  playBtn: { width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.6)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
};
