import React, { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <span style={styles.icon}>🔍</span>
      <input
        style={styles.input}
        placeholder="Search artists, albums, songs..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {loading && <div style={styles.spinner} />}
      <button type="submit" style={styles.btn}>Search</button>
    </form>
  );
}

const styles = {
  form: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 40, padding: '8px 16px', width: '100%', maxWidth: 500 },
  icon: { fontSize: 14, color: 'var(--muted)' },
  input: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)' },
  spinner: { width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--pink)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 },
  btn: { background: 'linear-gradient(135deg, var(--pink), var(--purple))', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: 'var(--font-body)' },
};
