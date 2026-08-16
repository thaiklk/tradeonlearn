// Live stream giá qua Server-Sent Events (SSE) — đẩy báo giá mới mỗi ~5 giây,
// không cần client refresh. Fallback tự nhiên: nếu client không hỗ trợ SSE thì dùng polling.
import { Router } from 'express'
import { cached } from '../services/cache.js'
import { getQuotes } from '../services/marketService.js'

const router = Router()

router.get('/stream/quotes', (req, res) => {
  const symbols = String(req.query.symbols || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 30)

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.write(`retry: 5000\n\n`)

  let closed = false
  let sending = false

  const push = async () => {
    if (closed || sending || !symbols.length) return
    sending = true
    try {
      // cache 8s để nhiều tab dùng chung không đánh spam nguồn dữ liệu
      const quotes = await cached(`stream:${symbols.join(',')}`, 8000, () => getQuotes(symbols))
      if (!closed) res.write(`data: ${JSON.stringify({ quotes, t: Date.now() })}\n\n`)
    } catch (err) {
      if (!closed) res.write(`event: err\ndata: ${JSON.stringify({ error: String(err?.message || err) })}\n\n`)
    } finally {
      sending = false
    }
  }

  push()
  const tick = setInterval(push, 5000)
  const beat = setInterval(() => !closed && res.write(': ping\n\n'), 15000)

  req.on('close', () => {
    closed = true
    clearInterval(tick)
    clearInterval(beat)
  })
})

export default router
