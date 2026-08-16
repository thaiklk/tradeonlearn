// "Phòng phân tích" — task giả lập như đi làm thật, chấm điểm bằng dữ liệu thị trường LIVE
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import db from '../db.js'
import { marketOf, getQuote } from '../services/marketService.js'
import { usFundamentals } from '../services/usMarket.js'
import { analyzeCandles } from '../services/signals.js'
import { getHistory } from '../services/marketService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TASKS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'tasks.json'), 'utf8'))

const router = Router()

function progressOf(taskId) {
  const row = db.prepare('SELECT * FROM task_progress WHERE task_id = ?').get(taskId)
  return row ? { done: true, score: row.score, total: row.total, xp: row.xp, submittedAt: row.submitted_at } : { done: false }
}

function totalXp() {
  const rows = db.prepare('SELECT xp FROM task_progress').all()
  return rows.reduce((s, r) => s + (r.xp || 0), 0)
}

export function analystRank(xp) {
  if (xp >= 400) return { name: 'Senior Analyst 🏆', next: null }
  if (xp >= 250) return { name: 'Analyst 📊', next: 400 - xp, nextName: 'Senior Analyst' }
  if (xp >= 100) return { name: 'Junior Analyst 💼', next: 250 - xp, nextName: 'Analyst' }
  return { name: 'Intern 🌱', next: 100 - xp, nextName: 'Junior Analyst' }
}

// Lấy giá trị nguồn live cho field: "fundamentals:MSFT:roe" | "quote:AAPL:price" | "account:investedUsdValue"
async function resolveSource(src, submitted) {
  if (!src) return null
  const [kind, symbol, key] = src.split(':')
  if (kind === 'fundamentals') {
    const f = await usFundamentals(symbol).catch(() => null)
    return f?.[key] ?? null
  }
  if (kind === 'quote') {
    const q = await getQuote(symbol).catch(() => null)
    return q?.[key] ?? null
  }
  if (kind === 'account') {
    // investedUsdValue lấy từ vị thế ví giả lập (đã có trong submitted context)
    return submitted?.__accountInvested ?? null
  }
  return null
}

// Chấm field dạng select theo quy tắc suy ra từ dữ liệu live
async function resolveRule(rule, symbol, submitted) {
  const hist = await getHistory(symbol || 'AAPL', '6mo').catch(() => null)
  if (!hist?.candles?.length) return null
  const a = analyzeCandles(hist.candles)
  const ind = a.indicators
  const price = ind.price
  if (rule === 'vs_ma200') return ind.ma200 != null && price >= ind.ma200 ? 0 : 1
  if (rule === 'ma_stack') {
    if (ind.ma20 != null && ind.ma50 != null && price >= ind.ma20 && ind.ma20 >= ind.ma50) return 0
    if (ind.ma20 != null && ind.ma50 != null && price <= ind.ma20 && ind.ma20 <= ind.ma50) return 1
    return 2
  }
  if (rule === 'rsi_zone') {
    const r = ind.rsi14
    if (r == null) return 1
    return r < 30 ? 0 : r > 70 ? 2 : 1
  }
  if (rule === 'macd_hist') return ind.macdHist != null && ind.macdHist >= 0 ? 0 : 1
  if (rule === 'valuation_verdict') {
    // dùng giá hợp lý thí sinh tự điền (fair_value), hoặc tính lại từ công thức của field computed
    let fair = Number(submitted?.fair_value)
    if (!Number.isFinite(fair) || fair <= 0) {
      const task = TASKS.find((t) => t.id === 'valuation')
      const cf = task?.fields.find((f) => f.type === 'computed')
      if (cf?.formula) {
        const expr = cf.formula.replace(/[a-z_]+/g, (name) => Number(submitted?.[name]))
        try {
          fair = Function(`"use strict";return (${expr})`)()
        } catch {
          fair = null
        }
      }
    }
    const q = await getQuote(symbol).catch(() => null)
    if (!Number.isFinite(fair) || fair <= 0 || q?.price == null) return 1
    const diff = (q.price - fair) / fair
    if (diff <= -0.15) return 0 // giá thấp hơn hợp lý ≥15% → MUA
    if (diff >= 0.15) return 2 // đắt ≥15%
    return 1
  }
  return null
}

function submittedFair(submitted) {
  const eps = Number(submitted?.eps)
  const pe = Number(submitted?.pe_choice)
  if (Number.isFinite(eps) && Number.isFinite(pe) && eps > 0 && pe > 0) return eps * pe
  return null
}

// Kiểm tra nhóm từ khóa: mỗi nhóm cần ít nhất 1 từ xuất hiện
function checkKeywords(text, keywordGroups) {
  const t = String(text || '').toLowerCase()
  for (const group of keywordGroups || []) {
    if (!group.some((kw) => t.includes(String(kw).toLowerCase()))) return false
  }
  return true
}

router.get('/', (_req, res) => {
  const xp = totalXp()
  res.json({
    xp,
    rank: analystRank(xp),
    totalXpAvailable: TASKS.reduce((s, t) => s + t.xp, 0),
    tasks: TASKS.map((t) => ({
      id: t.id,
      title: t.title,
      level: t.level,
      role: t.role,
      minutes: t.minutes,
      xp: t.xp,
      fieldCount: t.fields.length,
      progress: progressOf(t.id),
    })),
  })
})

// Chi tiết task (bỏ các thông tin chấm điểm nhạy cảm)
router.get('/:id', (req, res) => {
  const task = TASKS.find((t) => t.id === req.params.id)
  if (!task) return res.status(404).json({ error: 'Không tìm thấy task' })
  const { fields, ...rest } = task
  res.json({
    ...rest,
    fields: fields.map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type,
      points: f.points,
      hint: f.hint || null,
      options: f.options || null,
      min: f.min ?? null,
      max: f.max ?? null,
    })),
    progress: progressOf(task.id),
    prev: TASKS[TASKS.indexOf(task) - 1]?.id || null,
    next: TASKS[TASKS.indexOf(task) + 1]?.id || null,
  })
})

// Nộp task — chấm bằng dữ liệu live
router.post('/:id/submit', async (req, res) => {
  const task = TASKS.find((t) => t.id === req.params.id)
  if (!task) return res.status(404).json({ error: 'Không tìm thấy task' })
  const submitted = { ...(req.body?.answers || {}) }

  // dữ liệu ví giả lập cho rule account:*
  let accountInvested = null
  if (task.fields.some((f) => (f.source || '').startsWith('account:'))) {
    const positions = db.prepare('SELECT qty, avg_price FROM positions WHERE market = ?').all('US')
    accountInvested = positions.reduce((s, p) => s + p.qty * p.avg_price, 0)
  }

  const results = []
  let score = 0
  let total = 0

  for (const f of task.fields) {
    total += f.points
    const raw = submitted[f.id]
    let ok = false
    let expectedNote = ''

    try {
      if (f.type === 'number' && f.source) {
        const expected = await resolveSource(f.source, { __accountInvested: accountInvested })
        const tol = f.tolerance ?? 0.25
        if (expected == null) {
          // nguồn live tạm không tra được → khoan dung, không phạt người học
          ok = String(raw ?? '').trim().length > 0
          expectedNote = 'Nguồn số liệu tạm không phản hồi — mục này được tính theo sự nghiêm túc điền số.'
        } else {
          ok = Number.isFinite(Number(raw)) && Math.abs(Number(raw) - expected) <= Math.abs(expected) * tol
          expectedNote = `Số liệu hiện tại: ${Number(expected).toFixed(2)}`
        }
      } else if (f.type === 'number' && f.expectedValue != null) {
        const expected = f.expectedValue
        const tol = f.tolerance ?? 0.08
        ok = Number.isFinite(Number(raw)) && Math.abs(Number(raw) - expected) <= Math.abs(expected) * tol
        expectedNote = `Đáp án: ${expected}`
      } else if (f.type === 'computed') {
        // công thức dạng "8.57*pe_choice" — tính từ các field khác
        const expr = (f.formula || '').replace(/[a-z_]+/g, (name) => Number(submitted[name]))
        let expect = null
        try {
          expect = Function(`"use strict";return (${expr})`)()
        } catch {
          expect = null
        }
        ok = Number.isFinite(expect) && Number.isFinite(Number(raw)) && Math.abs(Number(raw) - expect) <= Math.max(1e-9, Math.abs(expect) * (f.tolerance ?? 0.05))
        expectedNote = Number.isFinite(expect) ? `Kết quả đúng: ${expect.toFixed(2)}` : 'Thiếu số liệu để tính'
      } else if (f.type === 'select' && f.rule) {
        const expectedIdx = await resolveRule(f.rule, task.symbol || submitted?.ticker, submitted)
        ok = expectedIdx != null && Number(raw) === expectedIdx
        expectedNote = expectedIdx != null ? `Theo dữ liệu live hiện tại: "${f.options[expectedIdx]}"` : ''
      } else if (f.type === 'select' && Array.isArray(f.expected)) {
        ok = f.expected.includes(Number(raw))
      } else if (f.type === 'symbols') {
        const picks = String(raw || '')
          .split(/[,;\s]+/)
          .map((s) => s.trim().toUpperCase())
          .filter((s) => /^[A-Z.-]{1,8}$/.test(s))
          .slice(0, 6)
        if (f.expectedAny) {
          const valid = picks.filter((p) => f.expectedAny.includes(p))
          const ratio = picks.length ? valid.length / picks.length : 0
          ok = picks.length >= (f.minPicks || 3) && ratio >= 0.99
          expectedNote =
            picks.filter((p) => !f.expectedAny.includes(p)).length > 0
              ? `Các mã không đạt bộ lọc: ${picks.filter((p) => !f.expectedAny.includes(p)).join(', ')}`
              : ''
          results.push({ id: f.id, ok, points: Math.round(f.points * ratio), detail: expectedNote, expected: expectedNote })
          score += Math.round(f.points * ratio)
          continue
        }
        const passes = []
        for (const sym of picks) {
          const fnd = await usFundamentals(sym).catch(() => null)
          if (!fnd) {
            passes.push({ sym, ok: true, note: 'không tra được — tính đạt' })
            continue
          }
          const c = f.criteria
          const okSym =
            (fnd.roe == null || fnd.roe >= c.roeMin) &&
            ((fnd.trailingPE ?? fnd.forwardPE) == null || (fnd.trailingPE ?? fnd.forwardPE) < c.peMax) &&
            (fnd.profitMargin == null || fnd.profitMargin > c.marginMin)
          passes.push({
            sym,
            ok: okSym,
            note: `ROE ${fnd.roe?.toFixed(0) ?? '—'}% · P/E ${(fnd.trailingPE ?? fnd.forwardPE)?.toFixed(1) ?? '—'} · Biên ${fnd.profitMargin?.toFixed(0) ?? '—'}%`,
          })
        }
        const okCount = passes.filter((p) => p.ok).length
        const ratio = picks.length ? okCount / picks.length : 0
        ok = picks.length >= (f.minPicks || 3) && ratio >= 0.99
        expectedNote = passes.map((p) => `${p.ok ? '✅' : '❌'} ${p.sym} (${p.note})`).join(' · ') || 'Chưa nhập mã hợp lệ'
        results.push({ id: f.id, ok, points: Math.round(f.points * ratio), detail: expectedNote, expected: expectedNote })
        score += Math.round(f.points * ratio)
        continue
      } else if (f.type === 'text') {
        const t = String(raw || '').trim()
        const longEnough = t.length >= (f.minLen || 40)
        const kwOk = f.keywords ? checkKeywords(t, f.keywords) : true
        ok = longEnough && kwOk
        expectedNote = !longEnough
          ? `Cần viết tối thiểu ${f.minLen || 40} ký tự (em viết ${t.length})`
          : !kwOk && f.keywords
            ? 'Thiếu ý chính — xem gợi ý cấu trúc ở nhãn câu hỏi'
            : ''
      } else {
        ok = String(raw || '').trim().length > 0
      }
    } catch (e) {
      ok = false
      expectedNote = 'Lỗi chấm: ' + e.message
    }

    if (ok) score += f.points
    results.push({ id: f.id, ok, points: ok ? f.points : 0, expected: expectedNote })
  }

  const passed = total > 0 && score / total >= 0.6
  const earnedXp = passed ? Math.round(task.xp * Math.min(1, score / total)) : 0

  const existing = db.prepare('SELECT score FROM task_progress WHERE task_id = ?').get(task.id)
  if (!existing || score > existing.score) {
    db.prepare(
      `INSERT OR REPLACE INTO task_progress (task_id, score, total, xp, submitted_at) VALUES (?, ?, ?, ?, datetime('now'))`
    ).run(task.id, score, total, earnedXp)
  }
  const xp = totalXp()

  // Phản hồi của "mentor"
  const wrongOnes = results.filter((r) => !r.ok)
  const mentorLines = []
  if (passed) {
    mentorLines.push(`Tốt lắm! Em đạt ${score}/${total} điểm — đúng ${results.length - wrongOnes.length}/${results.length} mục.`)
    if (wrongOnes.length) mentorLines.push(`Sửa lại ${wrongOnes.length} mục chưa đúng dưới đây rồi nộp lại để lấy điểm cao hơn nhé.`)
  } else {
    mentorLines.push(`Chưa đạt (${score}/${total}, cần ≥60%). Đọc kỹ lại phần hướng dẫn từng bước và các mục chấm bên dưới — rồi làm lại. Sai ở đâu học ở đó, em.`)
  }
  mentorLines.push(task.mentorNote || '')

  res.json({
    score,
    total,
    passed,
    xp: earnedXp,
    totalXp: xp,
    rank: analystRank(xp),
    results,
    mentor: mentorLines.join(' '),
  })
})

export default router
