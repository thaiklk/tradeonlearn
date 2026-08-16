import { Router } from 'express'
import db, { ensureWorkspace } from '../db.js'
import { persistWorkspace } from '../cloudState.js'
import { asyncHandler } from '../http.js'

// Giữ danh sách ở server để chỉ chấp nhận tiến độ cho các mô-đun đang xuất bản.
// Nội dung chi tiết nằm ở client; id ổn định để Cloudflare D1 giữ được tiến độ.
const MODULE_IDS = new Set([
  'orientation-business-model',
  'accounting-three-statements',
  'pnl-unit-economics',
  'budget-forecast-drivers',
  'working-capital-cash-cycle',
  'monthly-close-variance',
  'cash-budget-liquidity',
  'capex-npv-irr-sensitivity',
  'wacc-capital-structure',
  'valuation-decision-memo',
  'controls-model-review',
  'capstone-career-portfolio',
])
const LEGACY_MODULE_MAP = {
  map: 'accounting-three-statements',
  drivers: 'budget-forecast-drivers',
  'working-capital': 'working-capital-cash-cycle',
  close: 'monthly-close-variance',
  capital: 'capex-npv-irr-sensitivity',
  career: 'capstone-career-portfolio',
}
const router = Router()

router.get('/progress', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const rows = db.prepare('SELECT module_id FROM user_corporate_finance_progress WHERE user_id = ? ORDER BY completed_at').all(userId)
  res.json({ completedIds: [...new Set(rows.map((row) => LEGACY_MODULE_MAP[row.module_id] || row.module_id).filter((id) => MODULE_IDS.has(id)))] })
})

router.post('/progress', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const moduleId = String(req.body?.moduleId || '')
  const completed = req.body?.completed
  if (!MODULE_IDS.has(moduleId) || typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Tiến độ module không hợp lệ' })
  }

  const legacyIds = Object.entries(LEGACY_MODULE_MAP)
    .filter(([, currentId]) => currentId === moduleId)
    .map(([legacyId]) => legacyId)
  const result = completed
    ? db.prepare('INSERT OR IGNORE INTO user_corporate_finance_progress (user_id, module_id) VALUES (?, ?)').run(userId, moduleId)
    : db.prepare(
      `DELETE FROM user_corporate_finance_progress
       WHERE user_id = ? AND module_id IN (${[moduleId, ...legacyIds].map(() => '?').join(', ')})`
    ).run(userId, moduleId, ...legacyIds)
  if (result.changes) await persistWorkspace(userId)
  res.json({ ok: true, moduleId, completed })
}))

export default router
