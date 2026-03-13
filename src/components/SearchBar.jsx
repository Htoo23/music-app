import React, { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [q, setQ] = useState('')

  const submit = e => {
    e.preventDefault()
    if (q.trim()) onSearch(q.trim())
  }

  return (
    <form onSubmit={submit} style={S.form}>
      <span style={S.icon}>🔍</span>
      <input
        style={S.input}
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search artists, albums, songs…"
      />
      {loading && <div style={S.spinner} />}
      <button type="submit" style={S.btn}>Search</button>
    </form>
  )
}

const S = {
  form:    { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 40, padding: '8px 16px', width: '100%', maxWidth: 480 },
  icon:    { fontSize: 14, color: 'var(--muted)', flexShrink: 0 },
  input:   { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)' },
  spinner: { width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--pink)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 },
  btn:     { background: 'linear-gradient(135deg,var(--pink),var(--purple))', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 },
}
