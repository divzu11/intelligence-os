import { Router } from 'express'
import { getLatestMemo, getAllMemos, getMemoById, insertMemo, getArticles, getTrends } from '../lib/db.js'
import { generateWeeklyMemo } from '../lib/claude.js'

const router = Router()

// ── Static routes FIRST — must come before /:id ─────────────────────────────

// GET /api/memo/latest
router.get('/latest', async (req, res) => {
  try {
    const memo = await getLatestMemo()
    if (!memo) return res.json(null)
    res.json(memo)
  } catch (err) {
    console.error('[memo] GET /latest:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/memo/all — list of all memos (id + week_start only, no content)
router.get('/all', async (req, res) => {
  try {
    const memos = await getAllMemos()
    res.json(memos)
  } catch (err) {
    console.error('[memo] GET /all:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── Dynamic route LAST ────────────────────────────────────────────────────────

// GET /api/memo/:id — fetch a specific memo by id
router.get('/:id', async (req, res) => {
  try {
    const memo = await getMemoById(req.params.id)
    res.json(memo)
  } catch (err) {
    console.error('[memo] GET /:id:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/memo/generate
router.post('/generate', async (req, res) => {
  try {
    // Fetch top 30 articles from past 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const articles = await getArticles({ limit: 30, offset: 0 })
    const trends = await getTrends()
    const topTrends = trends.slice(0, 10)

    const articlesJson = JSON.stringify(
      articles.map(a => ({
        title: a.title,
        source: a.source_name,
        section: a.section,
        geo: a.geo,
        summary: a.summary || '',
        date: a.published_at,
      })),
      null, 2
    )

    const trendsJson = JSON.stringify(
      topTrends.map(t => ({
        topic: t.topic,
        velocity: t.velocity,
        status: t.status,
        articleCount: t.article_count_this_week,
      })),
      null, 2
    )

    const content = await generateWeeklyMemo(articlesJson, trendsJson)

    // Week start = most recent Monday
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)

    const memo = await insertMemo(weekStart.toISOString(), content)
    res.json(memo)
  } catch (err) {
    console.error('[memo] POST /generate:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
