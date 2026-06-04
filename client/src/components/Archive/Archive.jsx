import { useState } from 'react'
import { useArchive } from '../../hooks/useArchive'
import AskArchive from './AskArchive'
import { ExternalLink } from 'lucide-react'
import { getArticle } from '../../lib/api'

const SECTIONS = ['', 'healthtech', 'investing', 'operations', 'insurance']
const GEOS = ['', 'US', 'India', 'Global']

const SECTION_COLORS = {
  healthtech: 'var(--ht)',
  investing: 'var(--inv)',
  operations: 'var(--ops)',
  insurance: 'var(--ins)',
}

export default function Archive() {
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { results, loading, error, setParams, params } = useArchive()

  const handleSelectArticle = async (article) => {
    setSelectedArticle(article)
    setDetailLoading(true)
    try {
      const full = await getArticle(article.id)
      // Merge: full article has tags + summaries arrays from Supabase join
      const merged = {
        ...article,
        ...full,
        summary: full.summaries?.[0]?.summary || article.summary,
        operator_take: full.summaries?.[0]?.operator_take || article.operator_take,
        investor_take: full.summaries?.[0]?.investor_take || article.investor_take,
        paywalled: full.summaries?.[0]?.paywalled || article.paywalled,
        tags: full.tags?.[0] || null,
      }
      setSelectedArticle(merged)
    } catch (_) {
      // Keep basic article data if full fetch fails
    } finally {
      setDetailLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{
        width: '40%',
        minWidth: 280,
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', fontFamily: '"Playfair Display", serif', marginBottom: 12 }}>
            Archive
          </h1>

          {/* Search */}
          <input
            value={params.q || ''}
            onChange={e => handleChange('q', e.target.value)}
            placeholder="Search articles…"
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 13,
              color: 'var(--text)',
              outline: 'none',
              marginBottom: 8,
            }}
          />

          {/* Filters row */}
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              value={params.section || ''}
              onChange={e => handleChange('section', e.target.value)}
              style={selectStyle}
            >
              <option value="">All sections</option>
              {SECTIONS.filter(Boolean).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={params.geo || ''}
              onChange={e => handleChange('geo', e.target.value)}
              style={selectStyle}
            >
              <option value="">All geos</option>
              {GEOS.filter(Boolean).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Date filters */}
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <input
              type="date"
              value={params.dateFrom || ''}
              onChange={e => handleChange('dateFrom', e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
            />
            <input
              type="date"
              value={params.dateTo || ''}
              onChange={e => handleChange('dateTo', e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
            />
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loading ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: 8 }}>Searching…</div>
          ) : error ? (
            <div style={{ color: 'var(--warn)', fontSize: 13, padding: 8 }}>{error}</div>
          ) : results.length === 0 && params.q ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: 8 }}>No results found.</div>
          ) : results.length === 0 ? (
            <div style={{ color: 'var(--faint)', fontSize: 13, padding: 8 }}>
              Search your reading history above.
            </div>
          ) : results.map(article => {
            const color = SECTION_COLORS[article.section] || 'var(--muted)'
            const isSelected = selectedArticle?.id === article.id
            return (
              <button
                key={article.id}
                onClick={() => handleSelectArticle(article)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: isSelected ? `1px solid ${color}` : '1px solid var(--border)',
                  background: isSelected ? 'var(--surface2)' : 'transparent',
                  marginBottom: 6,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {article.section}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--faint)' }}>
                    {article.source_name}
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>
                  {article.title}
                </p>
              </button>
            )
          })}
        </div>

        {/* AskArchive */}
        <div style={{ padding: 12, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <AskArchive />
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 32, background: 'var(--bg)', position: 'relative' }}>
        {detailLoading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, var(--ops), transparent)`,
            animation: 'slide 1.2s ease-in-out infinite',
          }} />
        )}
        {!selectedArticle ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--faint)', textAlign: 'center',
          }}>
            <div>
              <p style={{ fontSize: 15, marginBottom: 6 }}>Select an article to read</p>
              <p style={{ fontSize: 13 }}>Search and filter your archive on the left</p>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 620, margin: '0 auto' }}>
            {/* Section + geo */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: SECTION_COLORS[selectedArticle.section] || 'var(--muted)',
                background: 'var(--surface2)', padding: '3px 8px', borderRadius: 4,
                border: '1px solid var(--border)',
              }}>
                {selectedArticle.section}
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface2)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                {selectedArticle.geo}
              </span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 24, fontWeight: 600,
              color: 'var(--text)', lineHeight: 1.35, marginBottom: 16,
            }}>
              {selectedArticle.title}
            </h2>

            {/* Summary */}
            {selectedArticle.summary && (
              <div style={{
                borderLeft: `3px solid ${SECTION_COLORS[selectedArticle.section] || 'var(--muted)'}`,
                paddingLeft: 16, marginBottom: 20,
              }}>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text)' }}>
                  {selectedArticle.summary}
                </p>
              </div>
            )}

            {/* Operator / Investor takes */}
            {selectedArticle.operator_take && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ops)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Operator Take
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{selectedArticle.operator_take}</p>
              </div>
            )}
            {selectedArticle.investor_take && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--inv)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Investor Take
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{selectedArticle.investor_take}</p>
              </div>
            )}

            {/* Tags */}
            {selectedArticle.tags && (
              <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  ...(selectedArticle.tags.topics || []),
                  ...(selectedArticle.tags.companies || []),
                  ...(selectedArticle.tags.technologies || []),
                ].map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 4,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--muted)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Read original */}
            <a
              href={selectedArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: SECTION_COLORS[selectedArticle.section] || 'var(--text)',
                textDecoration: 'none', fontWeight: 500,
              }}
            >
              Read original <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>
    <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }`}</style>
    </div>
  )
}

const selectStyle = {
  flex: 1,
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 6,
  padding: '6px 8px',
  fontSize: 12,
  color: 'var(--text)',
  outline: 'none',
}
