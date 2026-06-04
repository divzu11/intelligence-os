import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

const STATUS_STYLES = {
  emerging: { color: 'var(--ht)',   bg: 'var(--ht-d)',   label: 'Emerging' },
  rising:   { color: 'var(--inv)',  bg: 'var(--inv-d)',  label: 'Rising' },
  peaked:   { color: 'var(--muted)',bg: 'var(--surface2)',label: 'Peaked' },
  fading:   { color: 'var(--warn)', bg: 'var(--warn-d)', label: 'Fading' },
}

export default function TrendCard({ trend, onViewStories }) {
  const status = STATUS_STYLES[trend.status] || STATUS_STYLES.peaked
  const vel = trend.velocity ?? 0
  const velPositive = vel > 0
  const velNeutral = Math.abs(vel) < 5

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, flex: 1, marginRight: 10 }}>
          {trend.topic}
        </h3>
        <span style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: status.color, background: status.bg, padding: '3px 8px', borderRadius: 4, flexShrink: 0,
        }}>
          {status.label}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Velocity */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Velocity
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {velNeutral ? (
              <Minus size={14} style={{ color: 'var(--muted)' }} />
            ) : velPositive ? (
              <ArrowUpRight size={14} style={{ color: 'var(--ht)' }} />
            ) : (
              <ArrowDownRight size={14} style={{ color: 'var(--warn)' }} />
            )}
            <span style={{
              fontSize: 18, fontWeight: 700,
              color: velNeutral ? 'var(--muted)' : velPositive ? 'var(--ht)' : 'var(--warn)',
            }}>
              {vel > 0 ? '+' : ''}{Math.round(vel)}%
            </span>
          </div>
        </div>

        {/* Article count */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            This week
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            {trend.article_count_this_week ?? 0}
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)', marginLeft: 4 }}>articles</span>
          </div>
        </div>
      </div>

      {/* First seen */}
      {trend.first_seen && (
        <div style={{ fontSize: 11, color: 'var(--faint)' }}>
          First seen {new Date(trend.first_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}

      {/* View Stories */}
      <button
        onClick={() => onViewStories && onViewStories(trend.topic)}
        style={{
          marginTop: 4,
          padding: '7px 0',
          borderRadius: 6,
          border: '1px solid var(--border2)',
          background: 'var(--surface2)',
          color: 'var(--text)',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s',
          width: '100%',
        }}
      >
        View stories →
      </button>
    </div>
  )
}
