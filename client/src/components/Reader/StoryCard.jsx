import { useState } from 'react'
import { Lock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { markRead } from '../../lib/api'

const SECTION_COLORS = {
  healthtech: 'var(--ht)',
  investing: 'var(--inv)',
  operations: 'var(--ops)',
  insurance: 'var(--ins)',
}

const GEO_FLAGS = { US: '🇺🇸', India: '🇮🇳', Global: '🌐' }

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function StoryCard({ article, summary, loading, error }) {
  const [operatorOpen, setOperatorOpen] = useState(false)
  const [investorOpen, setInvestorOpen] = useState(false)

  if (!article) {
    return (
      <div style={{
        maxWidth: 700, width: '100%', background: 'var(--surface)', borderRadius: 12,
        padding: 40, textAlign: 'center', color: 'var(--muted)', border: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: 16 }}>No articles available.</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>Add RSS sources to get started.</p>
      </div>
    )
  }

  const color = SECTION_COLORS[article.section] || 'var(--muted)'
  const flag = GEO_FLAGS[article.geo] || '🌐'
  const isPaywalled = summary?.paywalled

  return (
    <div style={{
      maxWidth: 700,
      width: '100%',
      background: 'var(--surface)',
      borderRadius: 12,
      border: '1px solid var(--border)',
      borderTop: `3px solid ${color}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
          color, background: `${color}18`, padding: '3px 8px', borderRadius: 4,
        }}>
          {article.section || 'general'}
        </span>
        <span style={{
          fontSize: 11, color: 'var(--muted)', background: 'var(--surface2)',
          padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)',
        }}>
          {flag} {article.geo || 'Global'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--faint)', marginLeft: 'auto' }}>
          {article.source_name || 'Unknown source'} · {timeAgo(article.published_at)}
        </span>
      </div>

      {/* Headline */}
      <h2 style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: 22,
        fontWeight: 600,
        lineHeight: 1.35,
        color: 'var(--text)',
        padding: '14px 24px 0',
      }}>
        {article.title}
      </h2>

      {/* Summary Area */}
      <div style={{ padding: '16px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
            <span style={{ display: 'inline-flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--muted)',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </span>
            Generating summary…
          </div>
        ) : isPaywalled ? (
          <div style={{
            background: 'var(--inv-d)',
            border: '1px solid var(--inv)',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <Lock size={15} style={{ color: 'var(--inv)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, color: 'var(--inv)', fontWeight: 600, marginBottom: 4 }}>Paywalled article</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                Full content unavailable. The headline suggests: {article.title?.toLowerCase()}.
              </p>
            </div>
          </div>
        ) : summary?.summary ? (
          <div>
            <div style={{
              borderLeft: `3px solid ${color}`,
              paddingLeft: 14,
              marginBottom: 12,
            }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>{summary.summary}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{
                fontSize: 10, color: 'var(--faint)', background: 'var(--surface2)',
                padding: '2px 6px', borderRadius: 3, border: '1px solid var(--border)',
              }}>
                {summary.word_count || 0}w
              </span>
              <span style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '0.06em' }}>
                AI SUMMARY
              </span>
            </div>
          </div>
        ) : error ? (
          <p style={{ fontSize: 13, color: 'var(--warn)' }}>Failed to load summary.</p>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Select to generate summary.</p>
        )}
      </div>

      {/* Operator + Investor Takes */}
      {summary && !isPaywalled && !loading && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '0 24px 4px' }}>
          {/* Operator Take */}
          <button
            onClick={() => setOperatorOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', padding: '12px 0', cursor: 'pointer',
              color: 'var(--ops)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            Operator Take
            {operatorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {operatorOpen && (
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text)', paddingBottom: 12 }}>
              {summary.operator_take || 'No operator take available.'}
            </p>
          )}

          {/* Investor Take */}
          <button
            onClick={() => setInvestorOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', padding: '12px 0', cursor: 'pointer',
              color: 'var(--inv)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              borderTop: '1px solid var(--border)',
            }}
          >
            Investor Take
            {investorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {investorOpen && (
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text)', paddingBottom: 12 }}>
              {summary.investor_take || 'No investor take available.'}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => markRead(article.id, { completed: true })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: color, textDecoration: 'none', fontWeight: 500,
          }}
        >
          Read full article <ExternalLink size={13} />
          {isPaywalled && <Lock size={12} style={{ color: 'var(--inv)' }} />}
        </a>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
