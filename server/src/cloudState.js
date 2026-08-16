// Đồng bộ workspace sang Cloudflare D1 qua Worker. Render vẫn là nơi chạy
// engine dữ liệu thị trường; D1 chỉ lưu state người học bền vững.
import db, { ensureWorkspace, workspaceId } from './db.js'
import { gzipSync, gunzipSync } from 'node:zlib'
import { randomUUID } from 'node:crypto'

const syncUrl = String(process.env.CLOUDFLARE_STATE_URL || '').replace(/\/$/, '')
const syncToken = String(process.env.CLOUDFLARE_STATE_TOKEN || '')
const loadedWorkspaces = new Map()
const persistQueues = new Map()
const workspaceVersions = new Map()
const MAX_ENCODED_SNAPSHOT_BYTES = 1_500_000

const TABLES = [
  ['user_positions', 'positions'],
  ['user_trades', 'trades'],
  ['user_watchlist', 'watchlist'],
  ['user_quiz_progress', 'quizProgress'],
  ['user_read_progress', 'readProgress'],
  ['user_lesson_practice_progress', 'lessonPractices'],
  ['user_corporate_finance_progress', 'corporateFinanceProgress'],
  ['user_task_progress', 'taskProgress'],
  ['user_research_notes', 'researchNotes'],
  ['user_manual_financials', 'manualFinancials'],
]

class CloudStateError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = 'CloudStateError'
  }
}

export function isCloudStateError(error) {
  return error instanceof CloudStateError
}

function endpoint(userId) {
  return `${syncUrl}/v1/workspaces/${encodeURIComponent(userId)}`
}

function cloudEnabled() {
  return Boolean(syncUrl && syncToken)
}

function finiteOr(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function encodeSnapshot(snapshot) {
  return gzipSync(JSON.stringify(snapshot)).toString('base64url')
}

function decodeSnapshot(payload) {
  return JSON.parse(gunzipSync(Buffer.from(String(payload), 'base64url')).toString('utf8'))
}

function queryRows(table, userId) {
  return db.prepare(`SELECT * FROM ${table} WHERE user_id = ?`).all(userId)
}

export function exportWorkspace(input) {
  const userId = ensureWorkspace(input)
  const account = db.prepare('SELECT * FROM user_accounts WHERE user_id = ?').get(userId)
  const data = { version: 1, account, exportedAt: new Date().toISOString() }
  for (const [table, key] of TABLES) data[key] = queryRows(table, userId)
  return data
}

function rows(value) {
  return Array.isArray(value) ? value : []
}

// Import chỉ nhận snapshot do Worker trả về. Tất cả truy vấn đều bind tham số.
export function importWorkspace(input, snapshot) {
  const userId = workspaceId(input)
  if (!snapshot || typeof snapshot !== 'object') return false

  db.transaction(() => {
    for (const [table] of TABLES) db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(userId)
    db.prepare('DELETE FROM user_accounts WHERE user_id = ?').run(userId)

    const account = snapshot.account || {}
    db.prepare(
      `INSERT INTO user_accounts (user_id, starting_usd, cash_usd, starting_vnd, cash_vnd, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      userId,
      finiteOr(account.starting_usd, 100000),
      finiteOr(account.cash_usd, 100000),
      finiteOr(account.starting_vnd, 500000000),
      finiteOr(account.cash_vnd, 500000000),
      String(account.created_at || new Date().toISOString())
    )

    const position = db.prepare('INSERT INTO user_positions (user_id, symbol, market, qty, avg_price, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    for (const item of rows(snapshot.positions)) {
      if (!/^[A-Z0-9^.-]{1,16}$/.test(String(item.symbol || ''))) continue
      position.run(userId, item.symbol, item.market === 'VN' ? 'VN' : 'US', Number(item.qty) || 0, Number(item.avg_price) || 0, String(item.updated_at || new Date().toISOString()))
    }

    const trade = db.prepare('INSERT INTO user_trades (user_id, ts, symbol, market, side, qty, price, total, cash_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    for (const item of rows(snapshot.trades).slice(0, 500)) {
      if (!/^[A-Z0-9^.-]{1,16}$/.test(String(item.symbol || '')) || !['BUY', 'SELL'].includes(item.side)) continue
      trade.run(userId, String(item.ts || new Date().toISOString()), item.symbol, item.market === 'VN' ? 'VN' : 'US', item.side, Number(item.qty) || 0, Number(item.price) || 0, Number(item.total) || 0, Number(item.cash_after) || 0)
    }

    const watch = db.prepare('INSERT INTO user_watchlist (user_id, symbol, market, name, added_at) VALUES (?, ?, ?, ?, ?)')
    for (const item of rows(snapshot.watchlist).slice(0, 100)) {
      if (!/^[A-Z0-9^.-]{1,16}$/.test(String(item.symbol || ''))) continue
      watch.run(userId, item.symbol, item.market === 'VN' ? 'VN' : 'US', String(item.name || '').slice(0, 240), String(item.added_at || new Date().toISOString()))
    }

    const quiz = db.prepare('INSERT INTO user_quiz_progress (user_id, lesson_id, score, total, submitted_at) VALUES (?, ?, ?, ?, ?)')
    for (const item of rows(snapshot.quizProgress).slice(0, 100)) quiz.run(userId, String(item.lesson_id || '').slice(0, 120), Number(item.score) || 0, Number(item.total) || 0, String(item.submitted_at || new Date().toISOString()))

    const read = db.prepare('INSERT INTO user_read_progress (user_id, lesson_id, read_at) VALUES (?, ?, ?)')
    for (const item of rows(snapshot.readProgress).slice(0, 100)) read.run(userId, String(item.lesson_id || '').slice(0, 120), String(item.read_at || new Date().toISOString()))

    const lessonPractice = db.prepare(
      'INSERT INTO user_lesson_practice_progress (user_id, lesson_id, answers, status, updated_at, submitted_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    for (const item of rows(snapshot.lessonPractices).slice(0, 100)) {
      const lessonId = String(item.lesson_id || '').slice(0, 120)
      const answers = String(item.answers || '{}').slice(0, 50000)
      if (!lessonId) continue
      lessonPractice.run(
        userId,
        lessonId,
        answers,
        item.status === 'submitted' ? 'submitted' : 'draft',
        String(item.updated_at || new Date().toISOString()),
        item.submitted_at ? String(item.submitted_at) : null
      )
    }

    const corporateFinance = db.prepare('INSERT INTO user_corporate_finance_progress (user_id, module_id, completed_at) VALUES (?, ?, ?)')
    for (const item of rows(snapshot.corporateFinanceProgress).slice(0, 20)) {
      const moduleId = String(item.module_id || '')
      if (!/^[a-z-]{1,40}$/.test(moduleId)) continue
      corporateFinance.run(userId, moduleId, String(item.completed_at || new Date().toISOString()))
    }

    const task = db.prepare('INSERT INTO user_task_progress (user_id, task_id, score, total, xp, submitted_at) VALUES (?, ?, ?, ?, ?, ?)')
    for (const item of rows(snapshot.taskProgress).slice(0, 100)) task.run(userId, String(item.task_id || '').slice(0, 120), Number(item.score) || 0, Number(item.total) || 0, Number(item.xp) || 0, String(item.submitted_at || new Date().toISOString()))

    const research = db.prepare('INSERT INTO user_research_notes (user_id, symbol, thesis, evidence, valuation, catalysts, risks, invalidation, sources, checklist, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    for (const item of rows(snapshot.researchNotes).slice(0, 100)) {
      if (!/^[A-Z0-9^.-]{1,16}$/.test(String(item.symbol || ''))) continue
      research.run(userId, item.symbol, ...['thesis', 'evidence', 'valuation', 'catalysts', 'risks', 'invalidation', 'sources', 'checklist'].map((key) => String(item[key] || '').slice(0, 8000)), String(item.updated_at || new Date().toISOString()))
    }

    const manual = db.prepare('INSERT INTO user_manual_financials (user_id, symbol, period, source, currency, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    for (const item of rows(snapshot.manualFinancials).slice(0, 100)) {
      if (!/^[A-Z0-9^.-]{1,16}$/.test(String(item.symbol || ''))) continue
      manual.run(userId, item.symbol, String(item.period || '').slice(0, 20), String(item.source || '').slice(0, 200), item.currency === 'USD' ? 'USD' : 'VND', String(item.data || '{}').slice(0, 16000), String(item.created_at || new Date().toISOString()))
    }
  })()
  return true
}

async function requestSnapshot(userId) {
  let response
  try {
    response = await fetch(endpoint(userId), {
      headers: { Accept: 'application/json', 'X-TradeLearn-State-Token': syncToken },
      signal: AbortSignal.timeout(8000),
    })
  } catch (cause) {
    throw new CloudStateError('Không kết nối được Cloudflare state', { cause })
  }
  if (response.status === 404) return null
  if (!response.ok) throw new CloudStateError(`Cloudflare state trả HTTP ${response.status}`)
  try {
    const body = await response.json()
    return body?.payload ? { snapshot: decodeSnapshot(body.payload), version: Number(body.version) || 0 } : null
  } catch (cause) {
    throw new CloudStateError('Snapshot Cloudflare không hợp lệ', { cause })
  }
}

export async function hydrateWorkspace(input) {
  const userId = workspaceId(input)
  if (!cloudEnabled()) {
    ensureWorkspace(userId)
    return userId
  }
  if (loadedWorkspaces.has(userId)) {
    await loadedWorkspaces.get(userId)
    return userId
  }

  const pending = (async () => {
    const remote = await requestSnapshot(userId)
    if (remote) {
      importWorkspace(userId, remote.snapshot)
      workspaceVersions.set(userId, remote.version)
    } else {
      ensureWorkspace(userId)
      workspaceVersions.set(userId, 0)
    }
  })()
  loadedWorkspaces.set(userId, pending)
  try {
    await pending
  } catch (error) {
    loadedWorkspaces.delete(userId)
    throw error
  }
  return userId
}

async function persistNow(userId) {
  if (!cloudEnabled()) return false
  const payload = encodeSnapshot(exportWorkspace(userId))
  if (Buffer.byteLength(payload, 'utf8') > MAX_ENCODED_SNAPSHOT_BYTES) {
    throw new CloudStateError('Workspace vượt giới hạn đồng bộ 1,5 MB')
  }
  const writeId = randomUUID()
  const baseVersion = workspaceVersions.get(userId) ?? 0
  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(endpoint(userId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-TradeLearn-State-Token': syncToken },
        body: JSON.stringify({ payload, baseVersion, writeId }),
        signal: AbortSignal.timeout(8000),
      })
      if (response.ok) {
        const body = await response.json().catch(() => ({}))
        workspaceVersions.set(userId, Number(body.version) || baseVersion + 1)
        return true
      }
      if (response.status === 409) {
        const body = await response.json().catch(() => ({}))
        throw new CloudStateError(`Cloudflare state xung đột phiên bản ${body.version ?? '?'}`)
      }
      lastError = new CloudStateError(`Cloudflare state trả HTTP ${response.status}`)
    } catch (error) {
      lastError = error
      if (isCloudStateError(error) && String(error.message).includes('xung đột phiên bản')) throw error
    }
    if (attempt < 2) {
      const delay = 200 * (2 ** attempt) + Math.round(Math.random() * 100)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  if (isCloudStateError(lastError)) throw lastError
  throw new CloudStateError('Không lưu được Cloudflare state', { cause: lastError })
}

export function persistWorkspace(input) {
  const userId = workspaceId(input)
  if (!cloudEnabled()) return Promise.resolve(false)
  const previous = persistQueues.get(userId) || Promise.resolve()
  const current = previous
    .catch(() => undefined)
    .then(() => persistNow(userId))
  persistQueues.set(userId, current)
  current.finally(() => {
    if (persistQueues.get(userId) === current) persistQueues.delete(userId)
  }).catch(() => undefined)
  return current
}
