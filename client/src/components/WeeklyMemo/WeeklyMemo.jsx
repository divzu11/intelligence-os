import { useState, useEffect } from 'react'
import { getLatestMemo, getAllMemos, getMemoById, generateMemo } from '../../lib/api'
import { FileText, Loader, ChevronRight } from 'lucide-react'

const SECTIONS = [
  { key: 'THIS WEEK IN BRIEF',    color: 'var(--ht)' },
  { key: 'TOP 3 SIGNALS',         color: 'var(--inv)' },
  { key: 'WEAK SIGNAL TO WATCH',  color: 'var(--ins)' },
  { key: 'US TO INDIA WATCH',     color: 'var(--ops)' },
]

function parseMemo(text) {
  if (!text) return [{ heading: '', body: text || '', color: 'var(--muted)' }]
  const parts = []
  const upperText = text.toUpperCase()

  // Find the position of each section header
  const found = SECTIONS
    .map(s => ({ ...s, idx: upperText.indexOf(s.key) }))
    .filter(s => s.idx !== -1)
    .sort((a, b) => a.idx - b.idx)

  if (found.length === 0) {
    return [{ heading: '', body: text, color: 'var(--muted)' }]
  }

  for (let i = 0; i < found.length; i++) {
    const { key, color, idx } = found[i]
    const bodyStart = idx + key.length
    const bodyEnd = i + 1 < found.length ? found[i + 1].idx : text.length
    const body = text.slice(bodyStart, bodyEnd).trim()
    parts.push({ heading: key, body, color })
  }

  // If there's text before the first header, prepend it as unlabeled
  if (found[0].idx > 0) {
    const preamble = text.slice(0, found[0].idx).trim()
    if (preamble) parts.unshift({ heading: '', body: preamble, color: 'var(--muted)' })
  }

  return parts
}

function formatWeek(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const end = new Date(d)
  end.setDate(end.getDate() + 6)
  const opts = { month: 'long', day: 'numeric' }
  return `${d.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

export default function WeeklyMemo() {
  const [memo, setMemo]           = useState(null)
  const [allMemos, setAllMemos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError]         = useState(null)

  // Load latest memo + index of all memos
  useEffect(() => {
    setLoading(true)
    Promise.all([
      getLatestMemo().catch(() => null),
      getAllMemos().catch(() => []),
    ]).then(([latest, all]) => {
      setMemo(latest)
      setAllMemos(all)
      setLoading(false)
    })
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const data = await generateMemo()
      setMemo(data)
      // Refresh the index
      getAllMemos().then(setAllMemos).catch(() => {})
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSelectMemo = async (id) => {
    try {
      const data = await getMemoById(id)
      setMemo(data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    }
  }

  const sections = memo?.content ? parseMemo(memo.content) : []

  // Previous memos = all memos except the currently displayed one
  const previousMemos = allMemos.filter(m => m.id !== memo?.id)

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 4,
            }}>
              Weekly Intelligence Memo
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              {memo?.week_start
                ? `Week of ${formatWeek(memo.week_start)}`
                : 'Your weekly healthcare intelligence briefing'}
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 6,
              border: '1px solid var(--ins)', background: 'var(--ins-d)',
              color: 'var(--ins)', fontSize: 13, fontWeight: 500,
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.7 : 1, flexShrink: 0,
            }}
          >
            {generating
              ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analysing…</>
              : <><FileText size={13} /> {memo ? 'Regenerate' : 'Generate'}</>
            }
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--warn-d)', border: '1px solid var(--warn)',
            borderRadius: 8, padding: 16, color: 'var(--warn)', fontSize: 13, marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</div>
        ) : generating ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, color: 'var(--muted)',
          }}>
            <Loader size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: 'var(--ins)' }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>Analysing your week in healthcare…</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>This takes about 10 seconds</p>
          </div>
        ) : !memo ? (
          /* Empty state */
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          }}>
            <FileText size={32} style={{ color: 'var(--faint)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>
              No memo yet this week
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              Generate your weekly intelligence briefing based on recent articles and trends.
            </p>
            <button
              onClick={handleGenerate}
              style={{
                padding: '10px 20px', borderRadius: 6,
                border: '1px solid var(--ins)', background: 'var(--ins-d)',
                color: 'var(--ins)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Generate This Week's Memo
            </button>
          </div>
        ) : (
          /* Memo content */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sections.map(({ heading, body, color }, i) => (
              <div key={i} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${color}`,
                borderRadius: '0 8px 8px 0',
                padding: '18px 20px',
              }}>
                {heading && (
                  <h3 style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color, marginBottom: 12,
                  }}>
                    {heading}
                  </h3>
                )}
                <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Previous memos */}
        {previousMemos.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{
              fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12,
            }}>
              Previous Memos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {previousMemos.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMemo(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text)', cursor: 'pointer',
                    textAlign: 'left', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>
                      Week of {formatWeek(m.week_start)}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      Generated {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--faint)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
