import { Router } from 'express'
import db, { ensureWorkspace } from '../db.js'
import { persistWorkspace } from '../cloudState.js'
import { asyncHandler } from '../http.js'

const MODULE_IDS = new Set(['map', 'drivers', 'working-capital', 'close', 'capital', 'career'])
const router = Router()

router.get('/progress', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const rows = db.prepare('SELECT module_id FROM user_corporate_finance_progress WHERE user_id = ? ORDER BY completed_at').all(userId)
  res.json({ completedIds: rows.map((row) => row.module_id) })
})

router.post('/progress', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const moduleId = String(req.body?.moduleId || '')
  const completed = req.body?.completed
  if (!MODULE_IDS.has(moduleId) || typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Tiến độ module không hợp lệ' })
  }

  const result = completed
    ? db.prepare('INSERT OR IGNORE INTO user_corporate_finance_progress (user_id, module_id) VALUES (?, ?)').run(userId, moduleId)
    : db.prepare('DELETE FROM user_corporate_finance_progress WHERE user_id = ? AND module_id = ?').run(userId, moduleId)
  if (result.changes) await persistWorkspace(userId)
  res.json({ ok: true, moduleId, completed })
}))

export default router
