import { Router } from 'express'
import { getArticles, getArticleById, recordRead } from '../lib/db.js'

const router = Router()

// GET /api/articles
router.get('/', async (req, res) => {
  try {
    const { section, geo, limit = 50, offset = 0 } = req.query
    const articles = await getArticles({
      section: section || null,
      geo: geo || null,
      limit: parseInt(limit),
      offset: parseInt(offset),
    })
    res.json(articles)
  } catch (err) {
    console.error('[articles] GET /:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  try {
    const article = await getArticleById(req.params.id)
    if (!article) return res.status(404).json({ error: 'Not found' })
    res.json(article)
  } catch (err) {
    console.error('[articles] GET /:id:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/articles/:id/read  — fire-and-forget reading history
router.post('/:id/read', async (req, res) => {
  const { completed = false, skipped = false } = req.body || {}
  try {
    await recordRead(req.params.id, { completed, skipped })
    res.json({ ok: true })
  } catch (err) {
    // Non-fatal — don't surface to frontend
    res.json({ ok: false })
  }
})

export default router
