import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDb, workspaceId } from './db.js'
import { hydrateWorkspace, isCloudStateError } from './cloudState.js'
import marketRoutes from './routes/market.js'
import tradingRoutes from './routes/trading.js'
import learnRoutes from './routes/learn.js'
import watchlistRoutes from './routes/watchlist.js'
import newsRoutes from './routes/news.js'
import glossaryRoutes from './routes/glossary.js'
import streamRoutes from './routes/stream.js'
import taskRoutes from './routes/tasks.js'
import researchRoutes from './routes/research.js'
import manualRoutes from './routes/manual.js'
import corporateFinanceRoutes from './routes/corporateFinance.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:5173,https://tradeonlearn.onrender.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
)
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    return callback(null, false)
  },
  allowedHeaders: ['Content-Type', 'X-TradeLearn-Workspace'],
}))
app.use(express.json())
app.use(async (req, _res, next) => {
  try {
    req.workspaceId = workspaceId(req.get('X-TradeLearn-Workspace'))
    const needsWorkspace = ['/api/trading', '/api/watchlist', '/api/lessons', '/api/tasks', '/api/research', '/api/manual', '/api/corporate-finance']
      .some((prefix) => req.path.startsWith(prefix))
    if (needsWorkspace) await hydrateWorkspace(req.workspaceId)
    next()
  } catch (error) {
    next(error)
  }
})

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
app.use('/api/manual', manualRoutes)
app.use('/api/corporate-finance', corporateFinanceRoutes)
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
  if (isCloudStateError(err)) {
    return res.status(503).json({ error: 'Cloudflare đang tạm không phản hồi. Dữ liệu chưa được xác nhận đồng bộ; hãy tải lại trước khi thao tác tiếp.' })
  }
  const payload = { error: 'Lỗi máy chủ nội bộ' }
  if (process.env.NODE_ENV !== 'production') payload.detail = String(err?.message || err)
  res.status(500).json(payload)
})

const PORT = process.env.PORT || 4001
app.listen(PORT, () => {
  console.log(`✅ TradeLearn API chạy tại http://localhost:${PORT}`)
})
