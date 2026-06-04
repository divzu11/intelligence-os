import { Router } from 'express'
import { getArticleById, getSummaryByArticleId, insertSummary, insertTags } from '../lib/db.js'
import { generateSummary, generateTags } from '../lib/claude.js'
import { isPaywalled } from '../lib/paywall.js'

const router = Router()

// POST /api/summaries/:articleId
router.post('/:articleId', async (req, res) => {
  const { articleId } = req.params

  try {
    // Check for cached summary
    const existing = await getSummaryByArticleId(articleId)
    if (existing) return res.json(existing)

    // Get article
    const article = await getArticleById(articleId)
    if (!article) return res.status(404).json({ error: 'Article not found' })

    // Check paywall
    const paywalled = isPaywalled(article.content)

    if (paywalled) {
      const summary = await insertSummary(articleId, {
        summary: `This article appears to be behind a paywall. Based on the headline: "${article.title}" — this story likely covers developments in healthcare worth monitoring.`,
        operatorTake: '',
        investorTake: '',
        wordCount: 0,
        paywalled: true,
      })
      return res.json(summary)
    }

    // Generate with Claude
    const [summaryData, tagsData] = await Promise.all([
      generateSummary(article.title, article.content),
      generateTags(article.title, article.content),
    ])

    // Store both
    const [summary] = await Promise.all([
      insertSummary(articleId, {
        summary: summaryData.summary,
        operatorTake: summaryData.operatorTake,
        investorTake: summaryData.investorTake,
        wordCount: summaryData.wordCount,
        paywalled: false,
      }),
      insertTags(articleId, tagsData).catch(e => console.error('insertTags error:', e.message)),
    ])

    res.json(summary)
  } catch (err) {
    console.error('[summaries] POST /:articleId:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
