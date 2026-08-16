// Phase 6 — Research workspace theo từng mã: lưu/mở/xóa ghi chú nghiên cứu
import { Router } from 'express'
import db, { ensureWorkspace } from '../db.js'
import { persistWorkspace } from '../cloudState.js'
import { asyncHandler } from '../http.js'

const router = Router()

const FIELDS = ['thesis', 'evidence', 'valuation', 'catalysts', 'risks', 'invalidation', 'sources', 'checklist']

function summarize(row) {
  if (!row) return { filled: 0, total: FIELDS.length }
  const filled = FIELDS.filter((f) => String(row[f] || '').trim().length > 0).length
  return { filled, total: FIELDS.length }
}

// Danh sách workspace
router.get('/', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const rows = db.prepare('SELECT * FROM user_research_notes WHERE user_id = ? ORDER BY updated_at DESC').all(userId)
  res.json(
    rows.map((r) => ({
      symbol: r.symbol,
      updatedAt: r.updated_at,
      thesis: r.thesis ? r.thesis.slice(0, 120) : '',
      ...summarize(r),
    }))
  )
})

// Lấy 1 workspace
router.get('/:symbol', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const symbol = String(req.params.symbol || '').toUpperCase()
  const row = db.prepare('SELECT * FROM user_research_notes WHERE user_id = ? AND symbol = ?').get(userId, symbol)
  res.json({ symbol, ...(row || {}), summary: summarize(row) })
})

// Lưu (upsert)
router.put('/:symbol', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const symbol = String(req.params.symbol || '').toUpperCase().slice(0, 10)
  if (!/^[A-Z0-9^.-]{1,10}$/.test(symbol)) return res.status(400).json({ error: 'Mã không hợp lệ' })
  const body = req.body || {}
  const vals = FIELDS.map((f) => (body[f] != null ? String(body[f]).slice(0, 8000) : ''))
  db.prepare(
    `INSERT INTO user_research_notes (user_id, symbol, ${FIELDS.join(', ')}, updated_at)
     VALUES (?, ?, ${FIELDS.map(() => '?').join(', ')}, datetime('now'))
     ON CONFLICT(user_id, symbol) DO UPDATE SET ${FIELDS.map((f) => `${f} = excluded.${f}`).join(', ')}, updated_at = datetime('now')`
  ).run(userId, symbol, ...vals)
  await persistWorkspace(userId)
  const row = db.prepare('SELECT * FROM user_research_notes WHERE user_id = ? AND symbol = ?').get(userId, symbol)
  res.json({ ok: true, symbol, summary: summarize(row) })
}))

// Xóa
router.delete('/:symbol', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const result = db.prepare('DELETE FROM user_research_notes WHERE user_id = ? AND symbol = ?').run(userId, String(req.params.symbol || '').toUpperCase())
  if (result.changes) await persistWorkspace(userId)
  res.json({ ok: true })
}))

export default router
