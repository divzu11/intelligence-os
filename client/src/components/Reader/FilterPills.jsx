const FILTERS = [
  { label: 'All',         value: 'all',        color: 'var(--text)' },
  { label: 'Health Tech', value: 'healthtech', color: 'var(--ht)' },
  { label: 'Investing',   value: 'investing',  color: 'var(--inv)' },
  { label: 'Operations',  value: 'operations', color: 'var(--ops)' },
  { label: 'Insurance',   value: 'insurance',  color: 'var(--ins)' },
]

export default function FilterPills({ active, onChange }) {
  return (
    <>
      <div style={{
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        overflowX: 'auto',
        // Hide scrollbar on all browsers
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        // Slight padding so active ring isn't clipped
        padding: '2px 4px',
      }}>
        {FILTERS.map(({ label, value, color }) => {
          const isActive = active === value
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                border: isActive ? `1px solid ${color}` : '1px solid var(--border)',
                background: isActive ? 'var(--surface2)' : 'transparent',
                color: isActive ? color : 'var(--muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '0.02em',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
      {/* Hide webkit scrollbar */}
      <style>{`.filter-pills::-webkit-scrollbar { display: none; }`}</style>
    </>
  )
}
