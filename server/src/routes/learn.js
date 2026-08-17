// API khóa học: curriculum tài chính doanh nghiệp, workpaper thực hành và tiến độ.
// Quiz cũ được giữ ở DB/snapshot để tương thích dữ liệu, nhưng không còn là API công khai.
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import db, { ensureWorkspace } from '../db.js'
import { persistWorkspace } from '../cloudState.js'
import { asyncHandler } from '../http.js'
import { LESSON_PRACTICES } from '../content/lessonPractices.js'
import {
  CORPORATE_FINANCE_CURRICULUM,
  CORPORATE_FINANCE_LESSON_BY_ID,
  CORPORATE_FINANCE_PRACTICES,
} from '../content/corporateFinanceCurriculum.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const readContent = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', file), 'utf8'))

// Các link cũ trong trang cổ phiếu, task và guide vẫn mở được. Chúng không nằm
// trong curriculum 49 bài nên không làm thay đổi tổng tiến độ mới.
const LEGACY_LESSONS = [...readContent('lessons-1.json'), ...readContent('lessons-2.json')]
const LEGACY_LESSON_BY_ID = new Map(LEGACY_LESSONS.map((lesson) => [lesson.id, lesson]))
const CURRICULUM_LESSON_IDS = new Set(CORPORATE_FINANCE_LESSON_BY_ID.keys())
const PRACTICES_BY_LESSON_ID = new Map([
  ...Object.entries(LESSON_PRACTICES),
  ...Object.entries(CORPORATE_FINANCE_PRACTICES),
])

const router = Router()

function parseAnswers(value) {
  try {
    const parsed = JSON.parse(value || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function lessonFor(id) {
  return CORPORATE_FINANCE_LESSON_BY_ID.get(id) || LEGACY_LESSON_BY_ID.get(id) || null
}

function practiceFor(lessonId) {
  return PRACTICES_BY_LESSON_ID.get(lessonId) || null
}

function isCurriculumLesson(lessonId) {
  return CURRICULUM_LESSON_IDS.has(lessonId)
}

function publicLesson(lesson) {
  // Bài legacy còn field quiz trong file JSON. Không để đáp án/chọn đáp án đi ra API.
  const { quiz: _legacyQuiz, ...rest } = lesson
  return rest
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

function curriculumProgress(userId) {
  const practiceRows = db.prepare('SELECT lesson_id, status FROM user_lesson_practice_progress WHERE user_id = ?').all(userId)
  const readRows = db.prepare('SELECT lesson_id FROM user_read_progress WHERE user_id = ?').all(userId)
  const practiceByLesson = new Map(practiceRows.map((row) => [row.lesson_id, row.status]))
  const reads = new Set(readRows.map((row) => row.lesson_id))
  const chapters = new Map()

  for (const lesson of CORPORATE_FINANCE_CURRICULUM) {
    if (!chapters.has(lesson.chapterId)) {
      chapters.set(lesson.chapterId, {
        id: lesson.chapterId,
        title: lesson.chapter,
        order: lesson.chapterOrder,
        lessonsTotal: 0,
        lessonsRead: 0,
        practicesDone: 0,
        practicesDraft: 0,
      })
    }
    const chapter = chapters.get(lesson.chapterId)
    chapter.lessonsTotal += 1
    if (reads.has(lesson.id)) chapter.lessonsRead += 1
    if (practiceByLesson.get(lesson.id) === 'submitted') chapter.practicesDone += 1
    if (practiceByLesson.get(lesson.id) === 'draft') chapter.practicesDraft += 1
  }

  return {
    lessonsTotal: CORPORATE_FINANCE_CURRICULUM.length,
    lessonsRead: CORPORATE_FINANCE_CURRICULUM.filter((lesson) => reads.has(lesson.id)).length,
    practicesDone: CORPORATE_FINANCE_CURRICULUM.filter((lesson) => practiceByLesson.get(lesson.id) === 'submitted').length,
    practicesDraft: CORPORATE_FINANCE_CURRICULUM.filter((lesson) => practiceByLesson.get(lesson.id) === 'draft').length,
    lessonIds: CORPORATE_FINANCE_CURRICULUM.map((lesson) => lesson.id),
    chapters: [...chapters.values()],
  }
}

function listItem(lesson, userId) {
  const practice = practiceFor(lesson.id)
  return {
    id: lesson.id,
    order: lesson.order,
    courseOrder: lesson.courseOrder || lesson.order,
    title: lesson.title,
    track: lesson.track,
    chapter: lesson.chapter,
    chapterId: lesson.chapterId,
    chapterOrder: lesson.chapterOrder,
    level: lesson.level,
    minutes: lesson.minutes,
    summary: lesson.summary,
    sectionCount: lesson.sections?.length || 0,
    practiceFieldCount: practice?.fields?.length || 0,
    practiceTitle: practice?.title || null,
    relatedTerms: lesson.relatedTerms || [],
    progress: progressOf(lesson.id, userId),
  }
}

function sanitizedAnswers(practice, previousAnswers, inputAnswers) {
  const source = inputAnswers && typeof inputAnswers === 'object' && !Array.isArray(inputAnswers) ? inputAnswers : {}
  const answers = {}
  for (const item of practice.fields || []) {
    const hasIncoming = Object.prototype.hasOwnProperty.call(source, item.id)
    const value = hasIncoming ? source[item.id] : previousAnswers[item.id]
    answers[item.id] = String(value ?? '').trim().slice(0, 5000)
  }
  return answers
}

async function savePractice(req, res, submit) {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = lessonFor(req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  const practice = practiceFor(lesson.id)
  if (!practice) return res.status(404).json({ error: 'Bài thực hành chưa được biên soạn' })

  const existing = db.prepare(
    'SELECT answers, status, submitted_at FROM user_lesson_practice_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(userId, lesson.id)
  const answers = sanitizedAnswers(practice, parseAnswers(existing?.answers), req.body?.answers)
  const missing = (practice.fields || []).filter((item) => item.required !== false && !answers[item.id])

  if (submit && missing.length) {
    return res.status(400).json({
      error: 'Hãy hoàn thành đủ các phần bắt buộc trước khi nộp',
      missing: missing.map((item) => item.id),
    })
  }

  // Một workpaper đã nộp có thể được mở lại để sửa. Nếu người học xóa một
  // mục bắt buộc rồi chỉ lưu nháp, hạ trạng thái về draft để tiến độ không
  // tiếp tục báo hoàn thành với bài làm thiếu dữ liệu.
  const status = submit
    ? 'submitted'
    : missing.length
      ? 'draft'
      : existing?.status === 'submitted'
        ? 'submitted'
        : 'draft'
  const submittedAt = status === 'submitted'
    ? (submit ? new Date().toISOString() : existing?.submitted_at || new Date().toISOString())
    : null
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
  return res.json({
    ok: true,
    submitted: status === 'submitted',
    practice,
    progress: progressOf(lesson.id, userId, true),
  })
}

// Tổng quan tiến độ curriculum 49 bài, có chapters để frontend hiển thị theo chương.
router.get('/progress', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  res.json(curriculumProgress(userId))
})

// Danh sách curriculum chính. Mỗi item có chapter/chapterId/chapterOrder, không có quiz.
router.get('/', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  res.json(CORPORATE_FINANCE_CURRICULUM.map((lesson) => listItem(lesson, userId)))
})

router.get('/:id/practice', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = lessonFor(req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  const practice = practiceFor(lesson.id)
  if (!practice) return res.status(404).json({ error: 'Bài thực hành chưa được biên soạn' })
  res.json({ lessonId: lesson.id, practice, progress: progressOf(lesson.id, userId, true) })
})

// Chi tiết bài học. Link bài cũ vẫn đọc được nhưng được đánh dấu legacy và không có quiz.
router.get('/:id', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = lessonFor(req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  const curriculumIndex = isCurriculumLesson(lesson.id)
    ? CORPORATE_FINANCE_CURRICULUM.findIndex((item) => item.id === lesson.id)
    : -1
  res.json({
    ...publicLesson(lesson),
    practice: practiceFor(lesson.id),
    progress: progressOf(lesson.id, userId, true),
    legacy: curriculumIndex < 0,
    prev: curriculumIndex > 0 ? CORPORATE_FINANCE_CURRICULUM[curriculumIndex - 1].id : null,
    next: curriculumIndex >= 0 && curriculumIndex < CORPORATE_FINANCE_CURRICULUM.length - 1
      ? CORPORATE_FINANCE_CURRICULUM[curriculumIndex + 1].id
      : null,
  })
})

router.post('/:id/read', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const lesson = lessonFor(req.params.id)
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })
  db.prepare('INSERT OR REPLACE INTO user_read_progress (user_id, lesson_id) VALUES (?, ?)').run(userId, lesson.id)
  await persistWorkspace(userId)
  res.json({ ok: true, progress: progressOf(lesson.id, userId) })
}))

// PATCH lưu nháp; POST nộp bài. POST { submit: false } giữ tương thích client cũ.
router.patch('/:id/practice', asyncHandler((req, res) => savePractice(req, res, false)))
router.post('/:id/practice', asyncHandler((req, res) => savePractice(req, res, req.body?.submit !== false)))

export default router
