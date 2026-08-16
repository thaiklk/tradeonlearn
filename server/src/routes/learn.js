// API khóa học: bài học, trắc nghiệm, tiến độ học
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import db from '../db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const readContent = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', f), 'utf8'))
const LESSONS = [...readContent('lessons-1.json'), ...readContent('lessons-2.json')]

const router = Router()

function progressOf(lessonId) {
  const quiz = db.prepare('SELECT * FROM quiz_progress WHERE lesson_id = ?').get(lessonId) || null
  const read = db.prepare('SELECT 1 FROM read_progress WHERE lesson_id = ?').get(lessonId) || null
  return { read: !!read, quizScore: quiz ? quiz.score : null, quizTotal: quiz ? quiz.total : null }
}

// Tổng quan tiến độ học
router.get('/progress', (_req, res) => {
  const quizzes = db.prepare('SELECT * FROM quiz_progress').all()
  const reads = db.prepare('SELECT lesson_id FROM read_progress').all()
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
router.get('/', (_req, res) => {
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
      progress: progressOf(l.id),
    }))
  )
})

// Chi tiết 1 bài học (BỎ answer để không lộ đáp án)
router.get('/:id', (req, res) => {
  const lesson = LESSONS.find((l) => l.id === req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  const { quiz, ...rest } = lesson
  res.json({
    ...rest,
    quiz: quiz.map((q) => ({ q: q.q, options: q.options })),
    progress: progressOf(lesson.id),
    prev: LESSONS[LESSONS.indexOf(lesson) - 1]?.id || null,
    next: LESSONS[LESSONS.indexOf(lesson) + 1]?.id || null,
  })
})

// Đánh dấu đã đọc
router.post('/:id/read', (req, res) => {
  const lesson = LESSONS.find((l) => l.id === req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  db.prepare('INSERT OR REPLACE INTO read_progress (lesson_id) VALUES (?)').run(lesson.id)
  res.json({ ok: true })
})

// Nộp bài trắc nghiệm — chấm trên server
router.post('/:id/quiz', (req, res) => {
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
  const existing = db.prepare('SELECT score FROM quiz_progress WHERE lesson_id = ?').get(lesson.id)
  if (!existing || score > existing.score) {
    db.prepare('INSERT OR REPLACE INTO quiz_progress (lesson_id, score, total) VALUES (?, ?, ?)').run(lesson.id, score, total)
  }
  const best = db.prepare('SELECT * FROM quiz_progress WHERE lesson_id = ?').get(lesson.id)
  res.json({ score, total, results, best: { score: best.score, total: best.total }, passed: score / total >= 0.6 })
})

export default router
