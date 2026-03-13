import React, { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [q, setQ] = useState('')

  const submit = e => {
    e.preventDefault()
    if (q.trim()) onSearch(q.trim())
  }

  return (
    <form className="searchbar" onSubmit={submit}>
      <span className="searchbar-icon">🔍</span>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search artists, albums, songs…"
      />
      {loading && <div className="searchbar-spinner" />}
      <button type="submit" className="searchbar-btn">Search</button>
    </form>
  )
}
