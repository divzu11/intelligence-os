import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProgressBar({ current, total, onPrev, onNext }) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0

  return (
    <div style={{
      height: 64,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      flexShrink: 0,
    }}>
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={current === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid var(--border)',
          background: 'transparent',
          color: current === 0 ? 'var(--faint)' : 'var(--text)',
          cursor: current === 0 ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 500,
          transition: 'all 0.15s',
        }}
      >
        <ChevronLeft size={15} /> Prev
      </button>

      {/* Centre */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, maxWidth: 300 }}>
        <div style={{ width: '100%', height: 2, background: 'var(--border)', borderRadius: 1 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--ht)', borderRadius: 1, transition: 'width 0.2s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
            {total > 0 ? current + 1 : 0} / {total}
          </span>
          <span style={{ fontSize: 11, color: 'var(--faint)' }}>← → to navigate</span>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={current >= total - 1}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid var(--border)',
          background: 'transparent',
          color: current >= total - 1 ? 'var(--faint)' : 'var(--text)',
          cursor: current >= total - 1 ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 500,
          transition: 'all 0.15s',
        }}
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  )
}
