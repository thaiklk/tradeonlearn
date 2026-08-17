import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

function text(value) {
  return String(value || '').trim()
}

function trackOf(lesson) {
  if (text(lesson.track)) return text(lesson.track)
  return lesson.chapter ? 'Tài chính doanh nghiệp' : 'Đầu tư và thị trường'
}

function chapterOf(lesson) {
  if (text(lesson.chapter)) return text(lesson.chapter)
  return 'Nền tảng đầu tư và phân tích thị trường'
}

function lessonOrder(lesson) {
  const value = Number(lesson.courseOrder ?? lesson.order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}

function chapterOrder(chapter) {
  const matched = text(chapter).match(/\d+/)
  return matched ? Number(matched[0]) : Number.MAX_SAFE_INTEGER
}

function levelClass(level) {
  const normalized = text(level).toLocaleLowerCase('vi')
  if (normalized.includes('nền') || normalized.includes('cơ bản')) return 'c1'
  if (normalized.includes('trung')) return 'c2'
  if (normalized.includes('nâng')) return 'c3'
  return 'c4'
}

function practiceState(lesson) {
  if (lesson.progress?.practiceSubmitted || lesson.progress?.practiceStatus === 'submitted') return 'submitted'
  if (lesson.progress?.practiceStatus === 'draft') return 'draft'
  if (lesson.progress?.read) return 'read'
  return 'new'
}

function stateLabel(state) {
  if (state === 'submitted') return 'Đã nộp'
  if (state === 'draft') return 'Bản nháp'
  if (state === 'read') return 'Đã đọc'
  return 'Chưa bắt đầu'
}

function groupLessons(lessons) {
  const tracks = new Map()
  lessons.forEach((lesson) => {
    const track = trackOf(lesson)
    const chapter = chapterOf(lesson)
    if (!tracks.has(track)) tracks.set(track, new Map())
    const chapters = tracks.get(track)
    if (!chapters.has(chapter)) chapters.set(chapter, [])
    chapters.get(chapter).push(lesson)
  })

  return [...tracks.entries()]
    .map(([track, chapters]) => ({
      track,
      chapters: [...chapters.entries()]
        .map(([chapter, items]) => ({
          chapter,
          items: [...items].sort((a, b) => lessonOrder(a) - lessonOrder(b) || text(a.title).localeCompare(text(b.title), 'vi')),
        }))
        .sort((a, b) => chapterOrder(a.chapter) - chapterOrder(b.chapter) || a.chapter.localeCompare(b.chapter, 'vi')),
    }))
    .sort((a, b) => {
      const aCorporate = a.track === 'Tài chính doanh nghiệp'
      const bCorporate = b.track === 'Tài chính doanh nghiệp'
      if (aCorporate !== bCorporate) return aCorporate ? -1 : 1
      return a.track.localeCompare(b.track, 'vi')
    })
}

function matchesStatus(lesson, status) {
  const state = practiceState(lesson)
  if (status === 'all') return true
  if (status === 'new') return state === 'new'
  if (status === 'active') return state === 'read' || state === 'draft'
  return state === status
}

function TrackTabs({ tracks, value, onChange }) {
  return (
    <div className="course-track-tabs" role="tablist" aria-label="Lọc theo lộ trình">
      <button className={value === 'all' ? 'course-track-tab active' : 'course-track-tab'} type="button" onClick={() => onChange('all')}>
        Tất cả
      </button>
      {tracks.map((track) => (
        <button
          key={track}
          className={value === track ? 'course-track-tab active' : 'course-track-tab'}
          type="button"
          role="tab"
          aria-selected={value === track}
          onClick={() => onChange(track)}
        >
          {track}
        </button>
      ))}
    </div>
  )
}

function LessonRow({ lesson }) {
  const state = practiceState(lesson)
  const sequence = lessonOrder(lesson)
  const practiceCount = Number(lesson.practiceFieldCount || 0)

  return (
    <Link className="course-lesson-row" to={`/learn/${lesson.id}`}>
      <span className="course-lesson-order" aria-label={`Bài ${sequence}`}>{Number.isFinite(sequence) && sequence !== Number.MAX_SAFE_INTEGER ? sequence : '•'}</span>
      <span className="course-lesson-copy">
        <span className="course-lesson-title">{lesson.title}</span>
        {lesson.summary && <span className="course-lesson-summary">{lesson.summary}</span>}
      </span>
      <span className="course-lesson-meta">
        {lesson.level && <span className={`lesson-level ${levelClass(lesson.level)}`}>{lesson.level}</span>}
        <span>{lesson.minutes || 0} phút</span>
        {practiceCount > 0 && <span>{practiceCount} mục thực hành</span>}
      </span>
      <span className={`course-lesson-state ${state}`}>{stateLabel(state)}</span>
    </Link>
  )
}

export default function Learn() {
  const { data: lessons, loading: lessonsLoading, error: lessonsError } = useApi(() => api.lessons(), [])
  const { data: progress, loading: progressLoading } = useApi(() => api.progress(), [])
  const [query, setQuery] = useState('')
  const [track, setTrack] = useState('all')
  const [level, setLevel] = useState('all')
  const [status, setStatus] = useState('all')

  const allLessons = Array.isArray(lessons) ? lessons : []
  const tracks = useMemo(() => [...new Set(allLessons.map(trackOf))].sort((a, b) => {
    if (a === 'Tài chính doanh nghiệp') return -1
    if (b === 'Tài chính doanh nghiệp') return 1
    return a.localeCompare(b, 'vi')
  }), [allLessons])
  const levels = useMemo(() => [...new Set(allLessons.map((lesson) => text(lesson.level)).filter(Boolean))], [allLessons])
  const normalizedQuery = query.trim().toLocaleLowerCase('vi')
  const filteredLessons = useMemo(() => allLessons.filter((lesson) => {
    if (track !== 'all' && trackOf(lesson) !== track) return false
    if (level !== 'all' && lesson.level !== level) return false
    if (!matchesStatus(lesson, status)) return false
    if (!normalizedQuery) return true
    return [lesson.title, lesson.summary, lesson.chapter, lesson.track, ...(lesson.relatedTerms || [])]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('vi')
      .includes(normalizedQuery)
  }), [allLessons, track, level, status, normalizedQuery])
  const groups = useMemo(() => groupLessons(filteredLessons), [filteredLessons])
  const recommended = useMemo(() => {
    const preferred = [...allLessons].sort((a, b) => {
      const aTrack = trackOf(a) === 'Tài chính doanh nghiệp' ? 0 : 1
      const bTrack = trackOf(b) === 'Tài chính doanh nghiệp' ? 0 : 1
      return aTrack - bTrack || lessonOrder(a) - lessonOrder(b)
    })
    return preferred.find((lesson) => practiceState(lesson) !== 'submitted') || preferred[0]
  }, [allLessons])
  const filtersActive = Boolean(normalizedQuery) || track !== 'all' || level !== 'all' || status !== 'all'
  const filterKey = `${track}-${level}-${status}-${normalizedQuery}`

  if (lessonsLoading) return <div className="spinner" />
  if (lessonsError) return <div className="error-box">Không tải được lộ trình học: {lessonsError}</div>

  return (
    <div className="course-page">
      <section className="course-hero" aria-labelledby="course-title">
        <div>
          <div className="course-eyebrow">Lộ trình nghề nghiệp</div>
          <h1 id="course-title">Học tài chính doanh nghiệp từ số 0</h1>
          <p>
            Học theo từng chương như một finance intern: hiểu khái niệm, làm ví dụ số, nhận diện lỗi thường gặp và viết
            workpaper ngắn. Nhánh đầu tư và thị trường vẫn ở đây để bạn luyện cách đọc dữ liệu doanh nghiệp trong bối cảnh thật.
          </p>
        </div>
        <div className="course-progress" aria-label="Tiến độ học tập">
          <div>
            <span>Đã đọc</span>
            <strong>{progress?.lessonsRead || 0}<small>/{progress?.lessonsTotal || allLessons.length}</small></strong>
          </div>
          <div>
            <span>Đã nộp workpaper</span>
            <strong>{progress?.practicesDone || 0}</strong>
          </div>
          <div>
            <span>Đang làm</span>
            <strong>{progress?.practicesDraft || 0}</strong>
          </div>
        </div>
      </section>

      {recommended && (
        <section className="course-continue" aria-label="Bài học nên tiếp tục">
          <div>
            <span className="course-eyebrow">Bài nên làm tiếp</span>
            <b>{recommended.title}</b>
            <p>{recommended.summary}</p>
          </div>
          <Link className="btn primary" to={`/learn/${recommended.id}`}>Mở bài học</Link>
        </section>
      )}

      <section className="course-controls" aria-label="Tìm và lọc bài học">
        <label className="course-search" htmlFor="course-search">
          <span>Tìm trong bài học</span>
          <input
            id="course-search"
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ví dụ: NPV, dòng tiền, vốn lưu động..."
          />
        </label>
        <div className="course-filter-row">
          <label className="course-select" htmlFor="course-level">
            <span>Cấp độ</span>
            <select id="course-level" className="input" value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="all">Tất cả cấp độ</option>
              {levels.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="course-select" htmlFor="course-status">
            <span>Trạng thái</span>
            <select id="course-status" className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="new">Chưa bắt đầu</option>
              <option value="active">Đang học hoặc đang làm</option>
              <option value="submitted">Đã nộp workpaper</option>
            </select>
          </label>
        </div>
        <TrackTabs tracks={tracks} value={track} onChange={setTrack} />
      </section>

      <div className="course-results" aria-live="polite">
        {filtersActive ? `Tìm thấy ${filteredLessons.length} bài phù hợp.` : `${allLessons.length} bài học được sắp theo lộ trình và chương.`}
      </div>

      {progressLoading && <div className="course-loading muted">Đang cập nhật tiến độ...</div>}

      <div className="curriculum-list">
        {groups.map(({ track: groupTrack, chapters }) => (
          <section className="curriculum-track" key={groupTrack} aria-labelledby={`track-${groupTrack}`}>
            <header className="curriculum-track-header">
              <div>
                <span className="course-eyebrow">Lộ trình</span>
                <h2 id={`track-${groupTrack}`}>{groupTrack}</h2>
              </div>
              <span>{chapters.reduce((total, chapter) => total + chapter.items.length, 0)} bài</span>
            </header>

            {chapters.map(({ chapter, items }, chapterIndex) => {
              const completed = items.filter((lesson) => practiceState(lesson) === 'submitted').length
              return (
                <details
                  className="curriculum-chapter"
                  key={`${chapter}-${filterKey}`}
                  open={filtersActive || chapterIndex === 0}
                >
                  <summary>
                    <span>
                      <b>{chapter}</b>
                      <small>{items.length} bài · {completed} bài đã nộp</small>
                    </span>
                    <span className="curriculum-disclosure" aria-hidden="true">Mở</span>
                  </summary>
                  <div className="course-lesson-list">
                    {items.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} />)}
                  </div>
                </details>
              )
            })}
          </section>
        ))}
      </div>

      {!filteredLessons.length && (
        <div className="course-empty">
          Không có bài phù hợp với bộ lọc này. Hãy thử bỏ bớt từ khóa hoặc chọn lại lộ trình.
        </div>
      )}
    </div>
  )
}
