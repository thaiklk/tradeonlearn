// API khóa học: bài học, trắc nghiệm, tiến độ học
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import db, { ensureWorkspace } from '../db.js'
import { persistWorkspace } from '../cloudState.js'
import { asyncHandler } from '../http.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const readContent = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', f), 'utf8'))
const LESSONS = [...readContent('lessons-1.json'), ...readContent('lessons-2.json')]

const router = Router()

function progressOf(lessonId, userId) {
  const quiz = db.prepare('SELECT * FROM user_quiz_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId) || null
  const read = db.prepare('SELECT 1 FROM user_read_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId) || null
  return { read: !!read, quizScore: quiz ? quiz.score : null, quizTotal: quiz ? quiz.total : null }
}

// Tổng quan tiến độ học
router.get('/progress', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const quizzes = db.prepare('SELECT * FROM user_quiz_progress WHERE user_id = ?').all(userId)
  const reads = db.prepare('SELECT lesson_id FROM user_read_progress WHERE user_id = ?').all(userId)
  const readSet = new Set(reads.map((r) => r.lesson_id))
  const totalScore = quizzes.reduce((s, q) => s + q.score, 0)
  const totalQ = quizzes.reduce((s, q) => s + q.total, 0)
  res.json({
    lessonsTotal: LESSONS.length,
    lessonsRead: readSet.size,
    quizzesDone: quizzes.length,
    avgScorePercent: totalQ ? Math.round((totalScore / totalQ) * 100) : null,
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
      quizCount: l.quiz.length,
      relatedTerms: l.relatedTerms,
      progress: progressOf(l.id, userId),
    }))
  )
})

// Chi tiết 1 bài học (BỎ answer để không lộ đáp án)
router.get('/:id', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = LESSONS.find((l) => l.id === req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  const { quiz, ...rest } = lesson
  res.json({
    ...rest,
    quiz: quiz.map((q) => ({ q: q.q, options: q.options })),
    progress: progressOf(lesson.id, userId),
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

// Nộp bài trắc nghiệm — chấm trên server
router.post('/:id/quiz', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = LESSONS.find((l) => l.id === req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : []
  const results = lesson.quiz.map((q, i) => ({
    selected: Number.isInteger(answers[i]) ? answers[i] : null,
    correct: answers[i] === q.answer,
    answer: q.answer,
    explain: q.explain,
  }))
  const score = results.filter((r) => r.correct).length
  const total = lesson.quiz.length
  const existing = db.prepare('SELECT score FROM user_quiz_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lesson.id)
  if (!existing || score > existing.score) {
    db.prepare('INSERT OR REPLACE INTO user_quiz_progress (user_id, lesson_id, score, total) VALUES (?, ?, ?, ?)').run(userId, lesson.id, score, total)
    await persistWorkspace(userId)
  }
  const best = db.prepare('SELECT * FROM user_quiz_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lesson.id)
  res.json({ score, total, results, best: { score: best.score, total: best.total }, passed: score / total >= 0.6 })
}))

export default router
