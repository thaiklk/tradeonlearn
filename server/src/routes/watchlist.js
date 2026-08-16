import { Router } from 'express'
import db, { ensureWorkspace } from '../db.js'
import { getQuotes, marketOf } from '../services/marketService.js'

const router = Router()

router.get('/', async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const rows = db.prepare('SELECT * FROM user_watchlist WHERE user_id = ? ORDER BY added_at DESC').all(userId)
  if (!rows.length) return res.json([])
  const quotes = await getQuotes(rows.map((r) => r.symbol))
  const bySymbol = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]))
  res.json(
    rows.map((r) => {
      const q = bySymbol.get(r.symbol.toUpperCase())
      return {
        ...r,
        price: q?.price ?? null,
        change: q?.change ?? null,
        changePercent: q?.changePercent ?? null,
        currency: q?.currency || (r.market === 'VN' ? 'VND' : 'USD'),
        delayed: q?.delayed || null,
      }
    })
  )
})

router.post('/', async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const symbol = String(req.body?.symbol || '').toUpperCase().trim()
  if (!symbol) return res.status(400).json({ error: 'Thiếu mã cổ phiếu' })
  const market = marketOf(symbol)
  const exists = db.prepare('SELECT 1 FROM user_watchlist WHERE user_id = ? AND symbol = ?').get(userId, symbol)
  if (!exists) {
    db.prepare('INSERT INTO user_watchlist (user_id, symbol, market, name) VALUES (?, ?, ?, ?)').run(userId, symbol, market, req.body?.name || null)
  }
  res.json({ ok: true, symbol, market })
})

router.delete('/:symbol', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  db.prepare('DELETE FROM user_watchlist WHERE user_id = ? AND symbol = ?').run(userId, String(req.params.symbol).toUpperCase())
  res.json({ ok: true })
})

export default router
