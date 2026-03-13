import React from 'react'

const NAV = [
  { icon: '⊞', label: 'Home',       id: 'home'     },
  { icon: '♪', label: 'Songs',      id: 'songs'    },
  { icon: '≡', label: 'Playlists',  id: 'playlists'},
  { icon: '✦', label: 'Just for You',id: 'foryou'  },
  { icon: '↑', label: 'Top Charts', id: 'charts'   },
]
const PLAYLISTS = ['Workout Mix', "Chillin' at Home", 'Late Night Drive', 'XD 4 Life']

export default function Sidebar({ active, setActive }) {
  return (
    <aside style={S.aside}>
      <div style={S.profile}>
        <div style={S.avatar}>J</div>
        <div>
          <div style={S.name}>Joshua</div>
          <div style={S.badge}>PREMIUM</div>
        </div>
      </div>

      <div style={S.label}>BROWSE</div>
      {NAV.map(n => (
        <button key={n.id}
          style={{ ...S.item, ...(active === n.id ? S.itemActive : {}) }}
          onClick={() => setActive(n.id)}>
          <span style={S.icon}>{n.icon}</span>{n.label}
        </button>
      ))}

      <div style={{ ...S.label, marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <span>YOUR PLAYLISTS</span>
        <span style={{ cursor: 'pointer', fontSize: 16, color: 'var(--muted)' }}>+</span>
      </div>
      {PLAYLISTS.map(p => (
        <button key={p} style={S.item}>
          <span style={S.dot} />{p}
        </button>
      ))}
    </aside>
  )
}

const S = {
  aside:      { width: 220, minWidth: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0', overflowY: 'auto', flexShrink: 0 },
  profile:    { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 },
  avatar:     { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--pink),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, flexShrink: 0 },
  name:       { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 },
  badge:      { fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--pink)', background: 'rgba(247,37,133,0.15)', padding: '2px 6px', borderRadius: 3, display: 'inline-block', marginTop: 2 },
  label:      { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--muted)', padding: '12px 20px 6px' },
  item:       { display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'color .15s, background .15s' },
  itemActive: { color: 'var(--text)', background: 'rgba(255,255,255,0.05)' },
  icon:       { fontSize: 15, width: 20, textAlign: 'center' },
  dot:        { width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,var(--pink),var(--blue))', flexShrink: 0 },
}
