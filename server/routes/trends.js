import { Router } from 'express'
import { getTrends, getTrendArticles } from '../lib/db.js'
import { runAnalysis } from '../jobs/analyze.js'

const router = Router()

// GET /api/trends
router.get('/', async (req, res) => {
  try {
    const trends = await getTrends()
    res.json(trends)
  } catch (err) {
    console.error('[trends] GET /:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/trends/analyze — manual trigger
router.post('/analyze', async (req, res) => {
  try {
    await runAnalysis()
    const trends = await getTrends()
    res.json({ ok: true, trends })
  } catch (err) {
    console.error('[trends] POST /analyze:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/trends/:topic/articles
router.get('/:topic/articles', async (req, res) => {
  try {
    const articles = await getTrendArticles(decodeURIComponent(req.params.topic))
    res.json(articles)
  } catch (err) {
    console.error('[trends] GET /:topic/articles:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
