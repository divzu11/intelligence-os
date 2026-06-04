import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import articlesRouter from './routes/articles.js'
import summariesRouter from './routes/summaries.js'
import trendsRouter from './routes/trends.js'
import archiveRouter from './routes/archive.js'
import memoRouter from './routes/memo.js'
import sourcesRouter from './routes/sources.js'

import { seedSources } from './lib/db.js'
import { runIngest } from './jobs/ingest.js'

// Start cron jobs (imports register the schedules as a side-effect)
import './jobs/analyze.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}))
app.use(express.json())

// API Routes
app.use('/api/articles', articlesRouter)
app.use('/api/summaries', summariesRouter)
app.use('/api/trends', trendsRouter)
app.use('/api/archive', archiveRouter)
app.use('/api/memo', memoRouter)
app.use('/api/sources', sourcesRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../client/dist')
  app.use(express.static(clientBuild))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'))
  })
}

// Startup
app.listen(PORT, async () => {
  console.log(`[server] Intelligence OS API running on port ${PORT}`)
  try {
    await seedSources()
  } catch (err) {
    console.error('[server] seedSources error:', err.message)
  }
  // Run initial ingest after a short delay so the server is fully ready
  setTimeout(() => {
    console.log('[server] Running initial RSS ingest...')
    runIngest().catch(err => console.error('[server] Initial ingest error:', err.message))
  }, 2000)
})

export default app
