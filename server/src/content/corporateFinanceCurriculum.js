// Curriculum chính gồm 14 bài nền tảng (Chương 1-4) và 35 bài nâng cao
// (Chương 5-16). Hai bộ dữ liệu đã được biên soạn với thứ tự 1-49 riêng.
import { CORPORATE_FINANCE_FOUNDATION_LESSONS } from './corporateFinanceLessonsFoundation.js'
import { CORPORATE_FINANCE_ADVANCED_LESSONS } from './corporateFinanceLessonsAdvanced.js'

const FOUNDATION_SOURCE_NOTE = 'Nội dung được biên soạn mới bằng tiếng Việt theo khung giáo trình Quản trị Tài chính Doanh nghiệp mà người học cung cấp; không sao chép nguyên văn.'

function chapterNumber(chapter) {
  const match = /^Chương\s+(\d+)/i.exec(String(chapter || ''))
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

const rawCurriculum = [
  ...CORPORATE_FINANCE_FOUNDATION_LESSONS,
  ...CORPORATE_FINANCE_ADVANCED_LESSONS,
]

const uniqueIds = new Set()
for (const [index, lesson] of rawCurriculum.entries()) {
  const expectedOrder = index + 1
  if (!lesson?.id || uniqueIds.has(lesson.id)) {
    throw new Error(`Curriculum tài chính doanh nghiệp có id bài học trùng hoặc thiếu: ${lesson?.id || '(trống)'}`)
  }
  if (Number(lesson.courseOrder) !== expectedOrder) {
    throw new Error(`Thứ tự curriculum không liên tục tại ${lesson.id}: cần ${expectedOrder}, nhận ${lesson.courseOrder}`)
  }
  if (!lesson.practice?.fields?.length) {
    throw new Error(`Thiếu workpaper thực hành cho bài ${lesson.id}`)
  }
  uniqueIds.add(lesson.id)
}

if (rawCurriculum.length !== 49) {
  throw new Error(`Curriculum tài chính doanh nghiệp phải có 49 bài, nhưng đang có ${rawCurriculum.length}`)
}

export const CORPORATE_FINANCE_CURRICULUM = rawCurriculum.map((lesson) => {
  const { quiz: _legacyQuiz, ...rest } = lesson
  const chapterOrder = chapterNumber(rest.chapter)
  return {
    ...rest,
    order: rest.courseOrder,
    courseOrder: rest.courseOrder,
    chapterOrder,
    chapterId: `chuong-${chapterOrder}`,
    track: rest.track || 'Tài chính doanh nghiệp',
    sourceNote: rest.sourceNote || FOUNDATION_SOURCE_NOTE,
    sources: Array.isArray(rest.sources) ? rest.sources : [],
  }
})

export const CORPORATE_FINANCE_LESSON_BY_ID = new Map(
  CORPORATE_FINANCE_CURRICULUM.map((lesson) => [lesson.id, lesson])
)

export const CORPORATE_FINANCE_PRACTICES = Object.fromEntries(
  CORPORATE_FINANCE_CURRICULUM.map((lesson) => [lesson.id, lesson.practice])
)
