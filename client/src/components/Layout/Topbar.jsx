import FilterPills from '../Reader/FilterPills'

export default function Topbar({ filter, onFilterChange, count }) {
  return (
    <header style={{
      height: 52,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ fontSize: 16, fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 600, color: 'var(--text)', minWidth: 140 }}>
        Intelligence<span style={{ fontStyle: 'normal', fontWeight: 700 }}>OS</span>
      </div>

      {/* Filter Pills */}
      <FilterPills active={filter} onChange={onFilterChange} />

      {/* Story count */}
      <div style={{ minWidth: 140, display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{
          fontSize: 11,
          color: 'var(--muted)',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          padding: '3px 10px',
          borderRadius: 20,
          fontWeight: 500,
          letterSpacing: '0.04em',
        }}>
          {count ?? 0} stories
        </span>
      </div>
    </header>
  )
}
