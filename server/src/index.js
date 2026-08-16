import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDb } from './db.js'
import marketRoutes from './routes/market.js'
import tradingRoutes from './routes/trading.js'
import learnRoutes from './routes/learn.js'
import watchlistRoutes from './routes/watchlist.js'
import newsRoutes from './routes/news.js'
import glossaryRoutes from './routes/glossary.js'
import streamRoutes from './routes/stream.js'
import taskRoutes from './routes/tasks.js'
import researchRoutes from './routes/research.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())

initDb()

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'TradeLearn API', time: new Date().toISOString() }))

app.use('/api/stocks', marketRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/trading', tradingRoutes)
app.use('/api/lessons', learnRoutes)
app.use('/api/watchlist', watchlistRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/glossary', glossaryRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/research', researchRoutes)
app.use('/api', streamRoutes)

// Chế độ production (deploy 1 service duy nhất): phục vụ bản build của client
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDist, 'index.html'))
  })
  console.log('📦 Đang phục vụ giao diện từ client/dist (chế độ production)')
}

app.use((_req, res) => res.status(404).json({ error: 'Không tìm thấy endpoint' }))
app.use((err, _req, res, _next) => {
  console.error('[API error]', err)
  res.status(500).json({ error: 'Lỗi máy chủ nội bộ', detail: String(err?.message || err) })
})

const PORT = process.env.PORT || 4001
app.listen(PORT, () => {
  console.log(`✅ TradeLearn API chạy tại http://localhost:${PORT}`)
})
