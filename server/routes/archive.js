import { Router } from 'express'
import { searchArticles, getRecentlyRead } from '../lib/db.js'
import { askArchive as claudeAskArchive } from '../lib/claude.js'

const router = Router()

// GET /api/archive/search
router.get('/search', async (req, res) => {
  try {
    const { q, section, geo, dateFrom, dateTo, limit = 20 } = req.query
    const results = await searchArticles({
      q: q || null,
      section: section || null,
      geo: geo || null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      limit: parseInt(limit),
    })
    res.json(results)
  } catch (err) {
    console.error('[archive] GET /search:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/archive/ask
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: 'Question required' })

    // Merge keyword-matched articles with recently-read articles for richer context
    const [searched, recentlyRead] = await Promise.all([
      searchArticles({ q: question, limit: 15 }),
      getRecentlyRead(10).catch(() => []),
    ])
    // Deduplicate by id — searched results take priority
    const seen = new Set(searched.map(a => a.id))
    const extra = recentlyRead.filter(a => a && !seen.has(a.id))
    const articles = [...searched, ...extra].slice(0, 20)

    const articlesJson = JSON.stringify(
      articles.map(a => ({
        title: a.title,
        source: a.source_name,
        section: a.section,
        date: a.published_at,
        summary: a.summary || a.content?.slice(0, 300) || '',
      })),
      null, 2
    )

    const answer = await claudeAskArchive(question, articlesJson)
    res.json({ answer })
  } catch (err) {
    console.error('[archive] POST /ask:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
