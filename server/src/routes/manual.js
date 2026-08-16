// Phase 7 — BCTC do NGƯỜI HỌC NHẬP TAY (từ báo cáo đã kiểm toán cafef/vietstock).
// Tách biệt tuyệt đối với dữ liệu live/demo — mọi response đều gắn status:'manual'.
import { Router } from 'express'
import db, { ensureWorkspace } from '../db.js'

const router = Router()

// các cột hợp lệ (đúng dòng BCTC, khớp cấu trúc /financials)
const COLS = ['revenue', 'grossProfit', 'operatingIncome', 'netIncome', 'totalAssets', 'totalLiabilities', 'equity', 'ocf', 'capex', 'receivables', 'inventory', 'goodwill', 'shares']
const num = (v) => { const n = Number(String(v ?? '').replace(/[,;\s]/g, '')); return Number.isFinite(n) ? n : null }

router.get('/:symbol', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const symbol = String(req.params.symbol || '').toUpperCase()
  const rows = db.prepare('SELECT * FROM user_manual_financials WHERE user_id = ? AND symbol = ? ORDER BY period DESC').all(userId, symbol)
  res.json({
    symbol, status: 'manual',
    note: 'Dữ liệu do người học nhập — không phải dữ liệu live, không dùng để khuyến nghị.',
    entries: rows.map((r) => ({ id: r.id, period: r.period, source: r.source, currency: r.currency, createdAt: r.created_at, data: JSON.parse(r.data) })),
  })
})

// Nhập nhiều kỳ cùng lúc: body { source, currency, rows: [{period, revenue, ...}] }
router.post('/:symbol', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const symbol = String(req.params.symbol || '').toUpperCase()
  if (!/^[A-Z0-9^.-]{1,10}$/.test(symbol)) return res.status(400).json({ error: 'Mã không hợp lệ' })
  const { source, currency, rows } = req.body || {}
  const list = Array.isArray(rows) ? rows.slice(0, 10) : []
  const valid = []
  for (const row of list) {
    const period = String(row?.period || '').trim().slice(0, 12)
    if (!/^(FY)?\d{4}(-\d{2})?/i.test(period)) continue
    const data = {}
    let has = false
    for (const c of COLS) { const v = num(row?.[c]); if (v != null) { data[c] = v; has = true } }
    if (!has) continue
    valid.push([userId, symbol, period, String(source || '').slice(0, 200), currency === 'USD' ? 'USD' : 'VND', JSON.stringify(data)])
  }
  if (!valid.length) return res.status(400).json({ error: 'Không có dòng hợp lệ — cần kỳ (VD FY2024) + ít nhất 1 số liệu' })
  const ins = db.prepare('INSERT INTO user_manual_financials (user_id, symbol, period, source, currency, data) VALUES (?,?,?,?,?,?)')
  const tx = db.transaction(() => valid.forEach((v) => ins.run(...v)))
  tx()
  res.json({ ok: true, inserted: valid.length, status: 'manual' })
})

router.delete('/entry/:id', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  db.prepare('DELETE FROM user_manual_financials WHERE user_id = ? AND id = ?').run(userId, Number(req.params.id) || 0)
  res.json({ ok: true })
})

export default router
