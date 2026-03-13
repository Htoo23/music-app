import React from 'react';

const NAV = [
  { icon: '⊞', label: 'Home', id: 'home' },
  { icon: '♪', label: 'Songs', id: 'songs' },
  { icon: '≡', label: 'Playlists', id: 'playlists' },
  { icon: '✦', label: 'Just for You', id: 'foryou' },
  { icon: '↑', label: 'Top Charts', id: 'charts' },
];

const PLAYLISTS = ['Workout Mix', 'Chillin\' at Home', 'Booping at Adobe', 'XD 4 Life'];

export default function Sidebar({ active, setActive }) {
  return (
    <aside style={styles.aside}>
      <div style={styles.profile}>
        <div style={styles.avatar}>J</div>
        <div>
          <div style={styles.userName}>Joshua</div>
          <div style={styles.badge}>PREMIUM</div>
        </div>
      </div>

      <div style={styles.section}>BROWSE</div>
      {NAV.map(n => (
        <button key={n.id} style={{ ...styles.navItem, ...(active === n.id ? styles.navActive : {}) }}
          onClick={() => setActive(n.id)}>
          <span style={styles.navIcon}>{n.icon}</span>
          {n.label}
        </button>
      ))}

      <div style={{ ...styles.section, marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>YOUR PLAYLISTS</span>
        <button style={styles.addBtn}>+</button>
      </div>
      {PLAYLISTS.map(p => (
        <button key={p} style={styles.navItem}>
          <span style={styles.playlistDot} />
          {p}
        </button>
      ))}
    </aside>
  );
}

const styles = {
  aside: {
    width: 220, minWidth: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '24px 0', overflowY: 'auto', flexShrink: 0,
  },
  profile: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 24px', borderBottom: '1px solid var(--border)' },
  avatar: {
    width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pink), var(--purple))',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
  },
  userName: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 },
  badge: { fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--pink)', background: 'rgba(247,37,133,0.15)', padding: '2px 6px', borderRadius: 3, display: 'inline-block', marginTop: 2 },
  section: { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--muted)', padding: '16px 20px 8px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: 'none', border: 'none',
    color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer', width: '100%',
    textAlign: 'left', borderRadius: 0, transition: 'color .2s, background .2s',
  },
  navActive: { color: 'var(--text)', background: 'rgba(255,255,255,0.06)' },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  playlistDot: { width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pink), var(--blue))', flexShrink: 0 },
  addBtn: { width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)', background: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
