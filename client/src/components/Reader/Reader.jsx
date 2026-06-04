import { useState, useEffect, useCallback, useRef } from 'react'
import { getArticles, getSummary, markRead } from '../../lib/api'
import Topbar from '../Layout/Topbar'
import StoryCard from './StoryCard'
import ProgressBar from './ProgressBar'

export default function Reader({ filter, onFilterChange }) {
  const [articles, setArticles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [summaryCache, setSummaryCache] = useState({})
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const touchStartX = useRef(null)
  const PAGE_SIZE = 50

  // Load articles when filter changes
  useEffect(() => {
    setLoading(true)
    setError(null)
    setCurrentIndex(0)
    setHasMore(true)
    const params = filter !== 'all'
      ? { section: filter, limit: PAGE_SIZE }
      : { limit: PAGE_SIZE }
    getArticles(params)
      .then(data => {
        setArticles(data)
        setHasMore(data.length === PAGE_SIZE)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch more articles when nearing the end of current batch
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return
    if (articles.length === 0) return
    if (currentIndex < articles.length - 8) return // only trigger near end

    setLoadingMore(true)
    const params = {
      ...(filter !== 'all' ? { section: filter } : {}),
      limit: PAGE_SIZE,
      offset: articles.length,
    }
    getArticles(params)
      .then(data => {
        if (data.length > 0) setArticles(prev => [...prev, ...data])
        setHasMore(data.length === PAGE_SIZE)
        setLoadingMore(false)
      })
      .catch(() => setLoadingMore(false))
  }, [currentIndex, articles.length, hasMore, loadingMore, loading, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch summary for current article; pre-fetch next
  useEffect(() => {
    const article = articles[currentIndex]
    if (!article) return

    // Mark as read (fire-and-forget)
    markRead(article.id, { completed: false })

    // Fetch current summary if not cached
    if (!summaryCache[article.id]) {
      setSummaryLoading(true)
      getSummary(article.id)
        .then(data => {
          setSummaryCache(prev => ({ ...prev, [article.id]: data }))
          setSummaryLoading(false)
        })
        .catch(() => {
          setSummaryCache(prev => ({ ...prev, [article.id]: { error: true } }))
          setSummaryLoading(false)
        })
    } else {
      setSummaryLoading(false)
    }

    // Pre-fetch next article's summary in the background
    const next = articles[currentIndex + 1]
    if (next && !summaryCache[next.id]) {
      getSummary(next.id)
        .then(data => setSummaryCache(prev => ({ ...prev, [next.id]: data })))
        .catch(() => {})
    }
  }, [currentIndex, articles]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, articles.length - 1))
  }, [articles.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  // Touch / swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta < -50) goNext()
    else if (delta > 50) goPrev()
    touchStartX.current = null
  }

  const article = articles[currentIndex]
  const summary = article ? summaryCache[article.id] : null

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar filter={filter} onFilterChange={onFilterChange} count={0} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {[
              { color: 'var(--ht)',  delay: '0s' },
              { color: 'var(--inv)', delay: '0.18s' },
              { color: 'var(--ops)', delay: '0.36s' },
            ].map(({ color, delay }, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%', background: color,
                animation: `bounceDot 1.1s ease-in-out ${delay} infinite`,
              }} />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes bounceDot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40%            { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Topbar filter={filter} onFilterChange={onFilterChange} count={0} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warn)' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <p style={{ fontSize: 14, marginBottom: 6 }}>Could not load articles</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Topbar filter={filter} onFilterChange={onFilterChange} count={articles.length} />

      {/* Card area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        alignItems: articles.length === 0 ? 'center' : 'flex-start',
        justifyContent: 'center',
        padding: '24px 20px',
      }}>
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', maxWidth: 400 }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>No articles yet</p>
            <p style={{ fontSize: 13 }}>RSS feeds are fetched every 6 hours. Add sources to get started, or wait for the next ingest cycle.</p>
          </div>
        ) : (
          <StoryCard
            article={article}
            summary={summary}
            loading={summaryLoading && !summaryCache[article?.id]}
            error={summary?.error ? 'Failed to load' : null}
          />
        )}
      </div>

      {loadingMore && (
        <div style={{
          position: 'absolute', bottom: 68, left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, color: 'var(--muted)', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 12,
          padding: '3px 10px', pointerEvents: 'none',
        }}>
          Loading more…
        </div>
      )}
      <ProgressBar
        current={currentIndex}
        total={articles.length}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  )
}
