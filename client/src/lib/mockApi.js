// ─────────────────────────────────────────────────────────────────────────────
// DEMO-MODE REQUEST RESOLVER
//
// Intercepts the same paths the Express backend serves and answers them from
// local sample data (mockData.js). This lets the entire app run with no server,
// no Supabase, and no Anthropic key.
//
// Demo mode is ON by default. To run against the real backend instead, set
// VITE_DEMO=false in client/.env (and provide the real Supabase/Anthropic keys).
// ─────────────────────────────────────────────────────────────────────────────
import {
  ARTICLES,
  TAGS_BY_ARTICLE,
  TRENDS,
  MEMOS,
  SOURCES,
  buildArchiveAnswer,
} from './mockData'

export const DEMO = import.meta.env.VITE_DEMO !== 'false'

// Mutable copies so the Sources page feels interactive within a session.
let sources = SOURCES.map((s) => ({ ...s }))
let nextSourceId = sources.length + 1

// Small artificial latency so loading states render naturally on camera.
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms))

function parseQuery(path) {
  const qIndex = path.indexOf('?')
  const out = {}
  if (qIndex === -1) return { pathname: path, query: out }
  const pathname = path.slice(0, qIndex)
  const sp = new URLSearchParams(path.slice(qIndex + 1))
  for (const [k, v] of sp.entries()) out[k] = v
  return { pathname, query: out }
}

export async function mockRequest(rawPath, options = {}) {
  await delay()
  const method = (options.method || 'GET').toUpperCase()
  const { pathname, query } = parseQuery(rawPath)
  const body = options.body ? JSON.parse(options.body) : {}

  // ── Articles ──────────────────────────────────────────────────────────────
  if (pathname === '/api/articles' && method === 'GET') {
    let list = ARTICLES
    if (query.section) list = list.filter((a) => a.section === query.section)
    if (query.geo) list = list.filter((a) => a.geo === query.geo)
    const offset = parseInt(query.offset || '0', 10)
    const limit = parseInt(query.limit || '50', 10)
    return list.slice(offset, offset + limit)
  }

  const articleRead = pathname.match(/^\/api\/articles\/(.+)\/read$/)
  if (articleRead && method === 'POST') return { ok: true }

  const articleById = pathname.match(/^\/api\/articles\/(.+)$/)
  if (articleById && method === 'GET') {
    const a = ARTICLES.find((x) => x.id === articleById[1])
    if (!a) throw new Error('Not found')
    return { ...a, tags: [TAGS_BY_ARTICLE[a.id]] }
  }

  // ── Summaries ────────────────────────────────────────────────────────────
  const summary = pathname.match(/^\/api\/summaries\/(.+)$/)
  if (summary && method === 'POST') {
    const a = ARTICLES.find((x) => x.id === summary[1])
    if (!a) throw new Error('Article not found')
    return {
      article_id: a.id,
      summary: a.summary,
      operator_take: a.operator_take,
      investor_take: a.investor_take,
      word_count: a.word_count,
      paywalled: a.paywalled,
    }
  }

  // ── Trends ───────────────────────────────────────────────────────────────
  if (pathname === '/api/trends' && method === 'GET') return TRENDS
  if (pathname === '/api/trends/analyze' && method === 'POST') {
    return { ok: true, trends: TRENDS }
  }
  const trendArticles = pathname.match(/^\/api\/trends\/(.+)\/articles$/)
  if (trendArticles && method === 'GET') {
    const topic = decodeURIComponent(trendArticles[1])
    return ARTICLES.filter((a) => (a.topics || []).includes(topic))
  }

  // ── Archive ──────────────────────────────────────────────────────────────
  if (pathname === '/api/archive/search' && method === 'GET') {
    let list = ARTICLES
    if (query.q) {
      const q = query.q.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.summary || '').toLowerCase().includes(q) ||
          (a.content || '').toLowerCase().includes(q)
      )
    }
    if (query.section) list = list.filter((a) => a.section === query.section)
    if (query.geo) list = list.filter((a) => a.geo === query.geo)
    if (query.dateFrom) list = list.filter((a) => a.published_at >= query.dateFrom)
    if (query.dateTo) list = list.filter((a) => a.published_at <= query.dateTo)
    return list
  }
  if (pathname === '/api/archive/ask' && method === 'POST') {
    await delay(500) // mimic a model "thinking" beat
    return { answer: buildArchiveAnswer(body.question || '') }
  }

  // ── Memos ────────────────────────────────────────────────────────────────
  if (pathname === '/api/memo/latest' && method === 'GET') return MEMOS[0] || null
  if (pathname === '/api/memo/all' && method === 'GET') {
    return MEMOS.map((m) => ({ id: m.id, week_start: m.week_start, created_at: m.created_at }))
  }
  if (pathname === '/api/memo/generate' && method === 'POST') {
    await delay(600)
    return MEMOS[0]
  }
  const memoById = pathname.match(/^\/api\/memo\/(.+)$/)
  if (memoById && method === 'GET') {
    return MEMOS.find((m) => m.id === memoById[1]) || null
  }

  // ── Sources ──────────────────────────────────────────────────────────────
  if (pathname === '/api/sources' && method === 'GET') {
    return [...sources].sort((a, b) => a.name.localeCompare(b.name))
  }
  if (pathname === '/api/sources' && method === 'POST') {
    const s = {
      id: `s${nextSourceId++}`,
      name: body.name,
      url: body.url,
      type: body.type || 'rss',
      section: body.section || 'healthtech',
      geo: body.geo || 'Global',
      active: true,
      health_score: 80,
      last_fetched: null,
    }
    sources.push(s)
    return s
  }
  if (pathname === '/api/sources/ingest' && method === 'POST') {
    return { ok: true, message: 'Demo mode — ingest simulated.' }
  }
  if (pathname === '/api/sources/ingest/status' && method === 'GET') {
    return { running: false }
  }
  const sourceById = pathname.match(/^\/api\/sources\/(.+)$/)
  if (sourceById && method === 'PATCH') {
    const s = sources.find((x) => x.id === sourceById[1])
    if (s && typeof body.active === 'boolean') s.active = body.active
    return s || {}
  }
  if (sourceById && method === 'DELETE') {
    sources = sources.filter((x) => x.id !== sourceById[1])
    return { ok: true }
  }

  // Fallback — surface unmapped routes during development.
  throw new Error(`[demo] Unhandled route: ${method} ${pathname}`)
}
