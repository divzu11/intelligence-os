import { useState } from 'react'
import { useTrends } from '../../hooks/useTrends'
import TrendCard from './TrendCard'
import { runTrendAnalysis, getTrendArticles } from '../../lib/api'
import { RefreshCw, X } from 'lucide-react'

export default function TrendRadar() {
  const { trends, loading, error, refetch } = useTrends()
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [topicArticles, setTopicArticles] = useState([])
  const [topicLoading, setTopicLoading] = useState(false)

  const handleRunAnalysis = async () => {
    setAnalyzing(true)
    try {
      await runTrendAnalysis()
      await refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleViewStories = async (topic) => {
    setSelectedTopic(topic)
    setTopicLoading(true)
    try {
      const data = await getTrendArticles(topic)
      setTopicArticles(data)
    } catch (e) {
      setTopicArticles([])
    } finally {
      setTopicLoading(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: 'var(--surface)',
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', fontFamily: '"Playfair Display", serif' }}>
            Trend Radar
          </h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Signal detection across your source network
          </p>
        </div>
        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 6,
            border: '1px solid var(--border2)',
            background: 'var(--surface2)',
            color: 'var(--text)',
            fontSize: 12, fontWeight: 500, cursor: analyzing ? 'not-allowed' : 'pointer',
            opacity: analyzing ? 0.6 : 1,
          }}
        >
          <RefreshCw size={13} style={{ animation: analyzing ? 'spin 1s linear infinite' : 'none' }} />
          {analyzing ? 'Analyzing…' : 'Run now'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Trends grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{
                  height: 160, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ color: 'var(--warn)', fontSize: 14 }}>Error loading trends: {error}</div>
          ) : trends.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: 'var(--muted)', maxWidth: 400, margin: '0 auto',
            }}>
              <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No trends detected yet</p>
              <p style={{ fontSize: 13, marginBottom: 20 }}>
                Trend analysis runs nightly. Check back tomorrow, or run the analysis now.
              </p>
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                style={{
                  padding: '10px 20px', borderRadius: 6,
                  border: '1px solid var(--ht)',
                  background: 'var(--ht-d)',
                  color: 'var(--ht)', fontSize: 13,
                  fontWeight: 500, cursor: 'pointer',
                }}
              >
                {analyzing ? 'Running…' : 'Run analysis now'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {trends.map(trend => (
                <TrendCard key={trend.id || trend.topic} trend={trend} onViewStories={handleViewStories} />
              ))}
            </div>
          )}
        </div>

        {/* Topic articles panel */}
        {selectedTopic && (
          <div style={{
            width: 340, borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--surface)', flexShrink: 0,
          }}>
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{selectedTopic}</span>
              <button
                onClick={() => setSelectedTopic(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
              >
                <X size={14} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {topicLoading ? (
                <div style={{ color: 'var(--muted)', fontSize: 13, padding: 12 }}>Loading…</div>
              ) : topicArticles.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 13, padding: 12 }}>No articles found.</div>
              ) : topicArticles.map(a => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '10px 12px',
                    borderRadius: 6, border: '1px solid var(--border)',
                    marginBottom: 8, textDecoration: 'none',
                    background: 'var(--surface2)',
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{a.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{a.source_name}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  )
}
