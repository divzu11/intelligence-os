import { Router } from 'express'
import { getSources, insertSource, updateSource } from '../lib/db.js'
import { runIngest, isIngestRunning } from '../jobs/ingest.js'

const router = Router()

// GET /api/sources
router.get('/', async (req, res) => {
  try {
    const sources = await getSources()
    res.json(sources)
  } catch (err) {
    console.error('[sources] GET /:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/sources
router.post('/', async (req, res) => {
  try {
    const { name, url, type, section, geo } = req.body
    if (!name || !url) return res.status(400).json({ error: 'name and url are required' })
    const source = await insertSource({ name, url, type: type || 'rss', section, geo })
    res.status(201).json(source)
  } catch (err) {
    console.error('[sources] POST /:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/sources/:id
router.patch('/:id', async (req, res) => {
  try {
    const { active } = req.body
    const source = await updateSource(req.params.id, { active })
    res.json(source)
  } catch (err) {
    console.error('[sources] PATCH /:id:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/sources/ingest/status — is ingest currently running?
router.get('/ingest/status', (req, res) => {
  res.json({ running: isIngestRunning() })
})

// POST /api/sources/ingest — trigger manual ingest
router.post('/ingest', (req, res) => {
  if (isIngestRunning()) {
    return res.json({ ok: true, message: 'Ingest already running', alreadyRunning: true })
  }
  res.json({ ok: true, message: 'Ingest started' })
  runIngest().catch(err => console.error('[sources] manual ingest error:', err.message))
})

// DELETE /api/sources/:id — sets active = false
router.delete('/:id', async (req, res) => {
  try {
    const source = await updateSource(req.params.id, { active: false })
    res.json(source)
  } catch (err) {
    console.error('[sources] DELETE /:id:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
