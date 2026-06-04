import cron from 'node-cron'
import { getClient, getSources, updateSource } from '../lib/db.js'
import { fetchFeed } from '../lib/rss.js'
import { isPaywalled } from '../lib/paywall.js'

let _running = false

export async function runIngest() {
  if (_running) {
    console.log('[ingest] Already running — skipping duplicate trigger')
    return
  }
  _running = true
  try {
    await _doIngest()
  } finally {
    _running = false
  }
}

export function isIngestRunning() { return _running }

async function _doIngest() {
  console.log('[ingest] Starting RSS ingest job...')
  let sources
  try {
    sources = await getSources()
  } catch (err) {
    console.error('[ingest] Failed to load sources:', err.message)
    return
  }

  const activeSources = sources.filter(s => s.active !== false)
  console.log(`[ingest] Processing ${activeSources.length} active sources`)

  for (const source of activeSources) {
    try {
      const items = await fetchFeed(source.url)
      const fetchSucceeded = true

      if (items.length === 0) {
        // Fetch succeeded but no items
        const newScore = Math.max(0, (source.health_score ?? 80) - 5)
        await updateSource(source.id, {
          health_score: newScore,
          last_fetched: new Date().toISOString(),
        })
        continue
      }

      // Count paywalled items
      const paywallCount = items.filter(i => isPaywalled(i.content)).length
      const paywallRatio = paywallCount / items.length

      // Insert new articles — skip duplicates, count genuine inserts
      let newCount = 0
      // Batch check existing URLs to avoid N queries
      const urls = items.map(i => i.url)
      const { data: existing } = await getClient()
        .from('articles')
        .select('url')
        .in('url', urls)
      const existingUrls = new Set((existing || []).map(r => r.url))

      const newItems = items.filter(i => !existingUrls.has(i.url))
      newCount = newItems.length

      if (newItems.length > 0) {
        const rows = newItems.map(item => ({
          title: item.title,
          url: item.url,
          source_name: item.sourceName || source.name,
          section: source.section,
          geo: source.geo,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          content: item.content || '',
        }))
        const { error: insertError } = await getClient().from('articles').insert(rows)
        if (insertError) {
          // Fallback: row-by-row to avoid batch failure on any remaining dupe
          newCount = 0
          for (const row of rows) {
            const { error: e } = await getClient().from('articles').insert(row)
            if (!e) newCount++
          }
        }
      }

      // Health score update
      let delta = 0
      if (newCount > 0) delta += 10
      else delta -= 5
      if (paywallRatio > 0.8) delta -= 15

      const newScore = Math.min(100, Math.max(0, (source.health_score ?? 80) + delta))

      await updateSource(source.id, {
        health_score: newScore,
        last_fetched: new Date().toISOString(),
      })

      console.log(`[ingest] ${source.name}: ${newCount} new articles (paywall ratio: ${Math.round(paywallRatio * 100)}%)`)
    } catch (err) {
      console.error(`[ingest] Error processing ${source.name}:`, err.message)
      // Fetch failed: -20
      const newScore = Math.max(0, (source.health_score ?? 80) - 20)
      try {
        await updateSource(source.id, { health_score: newScore })
      } catch (e) {
        // ignore
      }
    }
  }

  console.log('[ingest] Ingest job complete.')
}

// Schedule: every 6 hours
cron.schedule('0 */6 * * *', () => {
  runIngest().catch(err => console.error('[ingest] Cron error:', err.message))
})
