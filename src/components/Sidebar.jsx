import React from 'react'

const NAV = [
  { icon: '⊞', label: 'Home',        id: 'home'      },
  { icon: '♪', label: 'Songs',       id: 'songs'     },
  { icon: '≡', label: 'Playlists',   id: 'playlists' },
  { icon: '✦', label: 'Just for You',id: 'foryou'    },
  { icon: '↑', label: 'Top Charts',  id: 'charts'    },
]
const PLAYLISTS = ["Workout Mix", "Chillin' at Home", "Late Night Drive", "XD 4 Life"]

export default function Sidebar({ active, setActive, open, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-profile">
          <div className="sidebar-avatar">J</div>
          <div>
            <div className="sidebar-name">Joshua</div>
            <div className="sidebar-badge">PREMIUM</div>
          </div>
        </div>

        <div className="sidebar-label">BROWSE</div>
        {NAV.map(n => (
          <button key={n.id} className={`sidebar-item${active === n.id ? ' active' : ''}`}
            onClick={() => { setActive(n.id); onClose() }}>
            <span className="sidebar-icon">{n.icon}</span>{n.label}
          </button>
        ))}

        <div className="sidebar-label" style={{ marginTop: 16 }}>
          <span>YOUR PLAYLISTS</span>
          <span style={{ cursor: 'pointer', fontSize: 16 }}>+</span>
        </div>
        {PLAYLISTS.map(p => (
          <button key={p} className="sidebar-item" onClick={onClose}>
            <span className="sidebar-dot" />{p}
          </button>
        ))}
      </aside>
    </>
  )
}
