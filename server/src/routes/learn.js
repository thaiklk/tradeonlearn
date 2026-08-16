// API khóa học: bài học, thực hành có hướng dẫn và tiến độ học
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import db, { ensureWorkspace } from '../db.js'
import { persistWorkspace } from '../cloudState.js'
import { asyncHandler } from '../http.js'
import { LESSON_PRACTICES } from '../content/lessonPractices.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const readContent = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', f), 'utf8'))
const LESSONS = [...readContent('lessons-1.json'), ...readContent('lessons-2.json')]

const router = Router()

function parseAnswers(value) {
  try {
    const parsed = JSON.parse(value || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function progressOf(lessonId, userId, includeAnswers = false) {
  const practice = db.prepare('SELECT * FROM user_lesson_practice_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId) || null
  const read = db.prepare('SELECT 1 FROM user_read_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId) || null
  return {
    read: !!read,
    practiceStatus: practice?.status || null,
    practiceSubmitted: practice?.status === 'submitted',
    practiceUpdatedAt: practice?.updated_at || null,
    practiceSubmittedAt: practice?.submitted_at || null,
    ...(includeAnswers ? { practiceAnswers: parseAnswers(practice?.answers) } : {}),
  }
}

// Tổng quan tiến độ học
router.get('/progress', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const practices = db.prepare('SELECT status FROM user_lesson_practice_progress WHERE user_id = ?').all(userId)
  const reads = db.prepare('SELECT lesson_id FROM user_read_progress WHERE user_id = ?').all(userId)
  const readSet = new Set(reads.map((r) => r.lesson_id))
  res.json({
    lessonsTotal: LESSONS.length,
    lessonsRead: readSet.size,
    practicesDone: practices.filter((practice) => practice.status === 'submitted').length,
    practicesDraft: practices.filter((practice) => practice.status === 'draft').length,
    lessonIds: LESSONS.map((l) => l.id),
  })
})

// Danh sách bài học + tiến độ
router.get('/', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  res.json(
    LESSONS.map((l, idx) => ({
      id: l.id,
      order: idx + 1,
      title: l.title,
      level: l.level,
      minutes: l.minutes,
      summary: l.summary,
      sectionCount: l.sections.length,
      practiceFieldCount: LESSON_PRACTICES[l.id]?.fields?.length || 0,
      relatedTerms: l.relatedTerms,
      progress: progressOf(l.id, userId),
    }))
  )
})

// Chi tiết 1 bài học. Bài thực hành có đầu ra thay thế trắc nghiệm chọn đáp án.
router.get('/:id', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = LESSONS.find((l) => l.id === req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  const { quiz: _legacyQuiz, ...rest } = lesson
  res.json({
    ...rest,
    practice: LESSON_PRACTICES[lesson.id] || null,
    progress: progressOf(lesson.id, userId, true),
    prev: LESSONS[LESSONS.indexOf(lesson) - 1]?.id || null,
    next: LESSONS[LESSONS.indexOf(lesson) + 1]?.id || null,
  })
})

// Đánh dấu đã đọc
router.post('/:id/read', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = LESSONS.find((l) => l.id === req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  db.prepare('INSERT OR REPLACE INTO user_read_progress (user_id, lesson_id) VALUES (?, ?)').run(userId, lesson.id)
  await persistWorkspace(userId)
  res.json({ ok: true })
}))

// Lưu bản nháp hoặc nộp bài thực hành. Bài làm tự luận được lưu nguyên vẹn;
// rubric và lời giải mẫu giúp người học tự đối chiếu thay vì máy chấm A/B/C.
router.post('/:id/practice', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = LESSONS.find((l) => l.id === req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  const practice = LESSON_PRACTICES[lesson.id]
  if (!practice) return res.status(404).json({ error: 'Bài thực hành chưa được biên soạn' })

  const rawAnswers = req.body?.answers && typeof req.body.answers === 'object' && !Array.isArray(req.body.answers)
    ? req.body.answers
    : {}
  const answers = {}
  for (const item of practice.fields || []) {
    answers[item.id] = String(rawAnswers[item.id] || '').trim().slice(0, 5000)
  }
  const submit = Boolean(req.body?.submit)
  const missing = (practice.fields || []).filter((item) => item.required !== false && !answers[item.id])
  if (submit && missing.length) {
    return res.status(400).json({ error: 'Hãy hoàn thành đủ các phần bắt buộc trước khi nộp', missing: missing.map((item) => item.id) })
  }

  const existing = db.prepare('SELECT status, submitted_at FROM user_lesson_practice_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lesson.id)
  const status = submit || existing?.status === 'submitted' ? 'submitted' : 'draft'
  const submittedAt = status === 'submitted' ? existing?.submitted_at || new Date().toISOString() : null
  db.prepare(
    `INSERT INTO user_lesson_practice_progress (user_id, lesson_id, answers, status, updated_at, submitted_at)
     VALUES (?, ?, ?, ?, datetime('now'), ?)
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET
       answers = excluded.answers,
       status = excluded.status,
       updated_at = datetime('now'),
       submitted_at = excluded.submitted_at`
  ).run(userId, lesson.id, JSON.stringify(answers), status, submittedAt)
  await persistWorkspace(userId)
  res.json({ ok: true, progress: progressOf(lesson.id, userId, true), practice })
}))

export default router
