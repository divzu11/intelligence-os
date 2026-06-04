import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { INITIAL_SOURCES } from '../config/sources.js'

// ── Client singleton ──────────────────────────────────────────────────────────

let _client = null

export function getClient() {
  if (_client) return _client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env')
  _client = createClient(url, key)
  return _client
}

// ── Seed ──────────────────────────────────────────────────────────────────────

export async function seedSources() {
  try {
    const db = getClient()
    const { data, error } = await db.from('sources').select('id').limit(1)
    if (error) { console.error('seedSources check error:', error.message); return }
    if (data && data.length === 0) {
      const { error: insertError } = await db.from('sources').insert(
        INITIAL_SOURCES.map(s => ({ ...s, active: true, health_score: 80 }))
      )
      if (insertError) console.error('seedSources insert error:', insertError.message)
      else console.log(`[db] Seeded ${INITIAL_SOURCES.length} sources.`)
    }
  } catch (err) {
    console.error('seedSources error:', err.message)
  }
}

// ── Articles ──────────────────────────────────────────────────────────────────

export async function getArticles({ section, geo, limit = 50, offset = 0 } = {}) {
  const db = getClient()
  let query = db
    .from('articles')
    .select(`
      id, title, url, source_name, section, geo, published_at,
      summaries (summary, operator_take, investor_take, word_count, paywalled)
    `)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (section) query = query.eq('section', section)
  if (geo)     query = query.eq('geo', geo)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []).map(flattenSummary)
}

export async function getArticleById(id) {
  const { data, error } = await getClient()
    .from('articles')
    .select(`
      id, title, url, source_name, section, geo, published_at, content,
      summaries (summary, operator_take, investor_take, word_count, paywalled),
      tags (topics, companies, people, policies, technologies, geo, sentiment)
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Summaries ─────────────────────────────────────────────────────────────────

export async function getSummaryByArticleId(articleId) {
  const { data, error } = await getClient()
    .from('summaries')
    .select('*')
    .eq('article_id', articleId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function insertSummary(articleId, { summary, operatorTake, investorTake, wordCount, paywalled = false }) {
  const { data, error } = await getClient()
    .from('summaries')
    .insert({
      article_id:   articleId,
      summary,
      operator_take: operatorTake,
      investor_take: investorTake,
      word_count:   wordCount,
      paywalled,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export async function insertTags(articleId, tags) {
  const { data, error } = await getClient()
    .from('tags')
    .insert({ article_id: articleId, ...tags })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Trends ────────────────────────────────────────────────────────────────────

export async function getTrends() {
  const { data, error } = await getClient()
    .from('trends')
    .select('*')
    .order('velocity', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getTrendArticles(topic) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await getClient()
    .from('tags')
    .select('article_id, articles(id, title, url, source_name, section, geo, published_at)')
    .contains('topics', [topic])
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(20)

  if (error) throw new Error(error.message)
  return (data || []).map(t => t.articles).filter(Boolean)
}

// ── Archive / Search ──────────────────────────────────────────────────────────

export async function searchArticles({ q, section, geo, dateFrom, dateTo, limit = 20 } = {}) {
  const db = getClient()
  let query = db
    .from('articles')
    .select(`
      id, title, url, source_name, section, geo, published_at,
      summaries (summary, operator_take, investor_take, paywalled)
    `)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (q)        query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
  if (section)  query = query.eq('section', section)
  if (geo)      query = query.eq('geo', geo)
  if (dateFrom) query = query.gte('published_at', dateFrom)
  if (dateTo)   query = query.lte('published_at', dateTo)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []).map(flattenSummary)
}

// ── Reading history ───────────────────────────────────────────────────────────

export async function recordRead(articleId, { completed = false, skipped = false } = {}) {
  const { error } = await getClient()
    .from('reading_history')
    .insert({ article_id: articleId, completed, skipped })
  if (error) console.error('recordRead error:', error.message)
}

export async function getRecentlyRead(limit = 20) {
  const { data, error } = await getClient()
    .from('reading_history')
    .select('article_id, read_at, completed, skipped, articles(id, title, url, source_name, section, geo, published_at)')
    .order('read_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data || [])
    .map(r => r.articles ? { ...r.articles, read_at: r.read_at, completed: r.completed, skipped: r.skipped } : null)
    .filter(Boolean)
}

// ── Memos ─────────────────────────────────────────────────────────────────────

export async function getLatestMemo() {
  const { data, error } = await getClient()
    .from('memos')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function getAllMemos() {
  const { data, error } = await getClient()
    .from('memos')
    .select('id, week_start, created_at')
    .order('week_start', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function getMemoById(id) {
  const { data, error } = await getClient()
    .from('memos')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function insertMemo(weekStart, content) {
  // Upsert so re-generating the same week replaces instead of duplicating
  const { data, error } = await getClient()
    .from('memos')
    .upsert({ week_start: weekStart, content }, { onConflict: 'week_start' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Sources ───────────────────────────────────────────────────────────────────

export async function getSources() {
  const { data, error } = await getClient()
    .from('sources')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function insertSource(sourceData) {
  const { data, error } = await getClient()
    .from('sources')
    .insert({ ...sourceData, active: true, health_score: 80 })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateSource(id, updates) {
  const { data, error } = await getClient()
    .from('sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenSummary(a) {
  return {
    ...a,
    summary:       a.summaries?.[0]?.summary       || null,
    operator_take: a.summaries?.[0]?.operator_take || null,
    investor_take: a.summaries?.[0]?.investor_take || null,
    word_count:    a.summaries?.[0]?.word_count    || null,
    paywalled:     a.summaries?.[0]?.paywalled     || false,
    summaries:     undefined, // remove the raw array
  }
}
