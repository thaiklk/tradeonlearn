import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

function asItems(value) {
  if (Array.isArray(value)) return value.flatMap(asItems)
  if (value == null || value === '') return []
  return [value]
}

function asText(value) {
  return asItems(value)
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item).trim()
      if (item && typeof item === 'object') return String(item.text || item.label || item.title || item.note || '').trim()
      return ''
    })
    .filter(Boolean)
}

function unique(items) {
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))]
}

function levelClass(level) {
  const normalized = String(level || '').toLocaleLowerCase('vi')
  if (normalized.includes('nền') || normalized.includes('cơ bản')) return 'c1'
  if (normalized.includes('trung')) return 'c2'
  if (normalized.includes('nâng')) return 'c3'
  return 'c4'
}

function sectionId(index) {
  return `lesson-section-${index + 1}`
}

function sectionText(section) {
  return [...asText(section?.p), ...asText(section?.p2), ...asText(section?.content), ...asText(section?.body)]
}

function sectionsMatching(lesson, pattern) {
  return (lesson?.sections || []).filter((section) => pattern.test(`${section.h || section.title || ''} ${sectionText(section).join(' ')}`))
}

function learningObjectives(lesson) {
  const explicit = unique([
    ...asText(lesson?.objectives),
    ...asText(lesson?.learningObjectives),
    ...asText(lesson?.outcomes),
    ...asText(lesson?.goals),
  ])
  if (explicit.length) return explicit
  return unique(asText(lesson?.keyPoints).filter((item) => !/^tránh:/i.test(item))).slice(0, 3)
}

function formulas(lesson) {
  const direct = [
    ...asText(lesson?.formula),
    ...asText(lesson?.formulas),
    ...asText(lesson?.learningActivity?.calculation),
  ]
  const fromSections = sectionsMatching(lesson, /công thức|formula|khung tính/i)
    .flatMap((section) => [
      ...asText(section.formula),
      ...sectionText(section).filter((item) => /công thức|khung tính|^fv\s*=|^pv\s*=|^npv\s*=|^wacc\s*=|^ccc\s*=/i.test(item)),
    ])
  return unique([...direct, ...fromSections])
}

function examples(lesson) {
  const direct = [...asText(lesson?.example), ...asText(lesson?.examples), ...asText(lesson?.workedExample)]
  const fromSections = sectionsMatching(lesson, /ví dụ|example/i)
    .flatMap((section) => [...asText(section.example), ...asText(section.examples), ...sectionText(section).filter((item) => /ví dụ|example/i.test(item))])
  return unique([...direct, ...fromSections])
}

function pitfalls(lesson) {
  const direct = [
    ...asText(lesson?.warning),
    ...asText(lesson?.warnings),
    ...asText(lesson?.pitfalls),
    ...asText(lesson?.mistakes),
    ...asText(lesson?.learningActivity?.warning),
  ]
  const fromSections = sectionsMatching(lesson, /dễ sai|cảnh giác|lỗi thường gặp|warning/i)
    .flatMap((section) => [...asText(section.warning), ...sectionText(section).filter((item) => /cảnh giác|dễ sai|tránh|lỗi/i.test(item))])
  return unique([...direct, ...fromSections])
}

function PracticePanel({ lesson }) {
  const practice = lesson.practice || lesson.learningActivity || null
  const steps = asText(practice?.steps || practice?.instructions || practice?.tasks)
  const checklist = asText(practice?.checklist || practice?.review || practice?.selfCheck)
  const rubric = asText(practice?.rubric)
  const fields = Array.isArray(practice?.fields) ? practice.fields : []
  const objective = practice?.objective || practice?.goal || practice?.outcome
  const deliverable = practice?.deliverable || practice?.output || practice?.record
  const activityLink = practice?.link || practice?.href || lesson.tryIt?.link
  const activityText = practice?.text || lesson.tryIt?.text
  const [answers, setAnswers] = useState(() => lesson.progress?.practiceAnswers || {})
  const [status, setStatus] = useState(lesson.progress?.practiceStatus || null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [missing, setMissing] = useState([])

  useEffect(() => {
    setAnswers(lesson.progress?.practiceAnswers || {})
    setStatus(lesson.progress?.practiceStatus || null)
    setNotice(null)
    setMissing([])
  }, [lesson.id, lesson.progress?.practiceStatus])

  if (!practice) return null

  const update = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }))
    setMissing((current) => current.filter((item) => item !== id))
  }

  const save = async (submit) => {
    const missingFields = submit
      ? fields.filter((field) => field.required !== false && !String(answers[field.id] || '').trim()).map((field) => field.id)
      : []
    if (missingFields.length) {
      setMissing(missingFields)
      setNotice({ type: 'error', text: 'Hãy hoàn thành các mục bắt buộc trước khi nộp.' })
      return
    }

    setBusy(true)
    setNotice(null)
    try {
      const response = await api.saveLessonPractice(lesson.id, answers, submit)
      setAnswers(response.progress?.practiceAnswers || answers)
      setStatus(response.progress?.practiceStatus || (submit ? 'submitted' : 'draft'))
      setNotice({
        type: 'success',
        text: submit
          ? 'Đã nộp workpaper. Bạn có thể mở rubric và gợi ý mẫu để tự đối chiếu.'
          : 'Đã lưu bản nháp workpaper.',
      })
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Không lưu được bài thực hành.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="practice-workbench" aria-labelledby="guided-practice-title">
      <header className="practice-workbench-header">
        <div>
          <span className="course-eyebrow">Thực hành tự luận</span>
          <h2 id="guided-practice-title">{practice.title || 'Workpaper có hướng dẫn'}</h2>
        </div>
        {status === 'submitted' && <span className="badge green">Đã nộp</span>}
        {status === 'draft' && <span className="badge amber">Bản nháp</span>}
      </header>

      <div className="practice-context">
        {objective && <p><b>Mục tiêu:</b> {objective}</p>}
        {practice.scenario && <p className="practice-scenario"><b>Tình huống:</b> {practice.scenario}</p>}
        {activityText && <p>{activityText}</p>}
        {steps.length > 0 && (
          <div>
            <b>Cách làm</b>
            <ol>{steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>
          </div>
        )}
        {deliverable && <p><b>Đầu ra cần có:</b> {deliverable}</p>}
        {activityLink && <Link to={activityLink} className="btn sm">Mở công cụ liên quan</Link>}
      </div>

      {fields.length > 0 && (
        <div className="practice-fields">
          <div className="practice-fields-title">Bài làm của bạn</div>
          {fields.map((field) => {
            const invalid = missing.includes(field.id)
            return (
              <label className="field practice-field" key={field.id} htmlFor={`${lesson.id}-${field.id}`}>
                <span>{field.label}{field.required !== false && <b className="practice-required"> *</b>}</span>
                {field.help && <small>{field.help}</small>}
                <textarea
                  id={`${lesson.id}-${field.id}`}
                  className={invalid ? 'input practice-input invalid' : 'input practice-input'}
                  rows={5}
                  maxLength={5000}
                  aria-invalid={invalid}
                  value={answers[field.id] || ''}
                  placeholder={field.placeholder || 'Viết câu trả lời của bạn...'}
                  onChange={(event) => update(field.id, event.target.value)}
                />
                {invalid && <small className="practice-validation">Mục này cần được hoàn thành trước khi nộp.</small>}
              </label>
            )
          })}
          <div className="practice-actions">
            <button className="btn ghost" type="button" disabled={busy} onClick={() => save(false)}>
              {busy ? 'Đang lưu...' : 'Lưu bản nháp'}
            </button>
            <button className="btn primary" type="button" disabled={busy} onClick={() => save(true)}>
              {busy ? 'Đang nộp...' : 'Nộp workpaper'}
            </button>
          </div>
          {notice && <div className={`practice-notice ${notice.type === 'success' ? 'ok' : ''}`}>{notice.text}</div>}
        </div>
      )}

      {(checklist.length > 0 || rubric.length > 0) && status === 'submitted' && (
        <details className="practice-review">
          <summary>Rubric tự đối chiếu</summary>
          {checklist.length > 0 && <ul>{checklist.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}
          {rubric.length > 0 && <ul>{rubric.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}
        </details>
      )}
      {practice.modelAnswer && status === 'submitted' && (
        <details className="practice-review">
          <summary>Gợi ý mẫu sau khi nộp</summary>
          <p>{practice.modelAnswer}</p>
        </details>
      )}
    </section>
  )
}

function LessonSection({ section, index }) {
  const paragraphs = sectionText(section)
  const list = asText(section.list || section.bullets || section.items)
  const tip = section.tip || section.note
  const warning = section.warning

  return (
    <section className="lesson-section" id={sectionId(index)}>
      <h2>{section.h || section.title || `Phần ${index + 1}`}</h2>
      {paragraphs.map((paragraph, paragraphIndex) => <p key={`${index}-p-${paragraphIndex}`}>{paragraph}</p>)}
      {list.length > 0 && <ul>{list.map((item, itemIndex) => <li key={`${index}-item-${itemIndex}`}>{item}</li>)}</ul>}
      {section.formula && <div className="lesson-inline-formula">{section.formula}</div>}
      {asText(section.example || section.examples).map((example, exampleIndex) => (
        <div className="lesson-inline-example" key={`${index}-example-${exampleIndex}`}>{example}</div>
      ))}
      {tip && <div className="tip-box"><b>Lưu ý:</b> {tip}</div>}
      {warning && <div className="lesson-inline-warning"><b>Lỗi thường gặp:</b> {warning}</div>}
    </section>
  )
}

function Sources({ lesson }) {
  const sourceNote = String(lesson.sourceNote || '').trim()
  const sources = asItems(lesson.sources)
    .map((source) => {
      if (typeof source === 'string') return { title: source, note: '' }
      return {
        title: String(source?.title || source?.name || source?.url || '').trim(),
        url: String(source?.url || source?.href || '').trim(),
        note: String(source?.note || source?.description || '').trim(),
      }
    })
    .filter((source) => source.title)

  if (!sourceNote && !sources.length) return null
  return (
    <section className="lesson-sources" aria-labelledby="lesson-sources-title">
      <h2 id="lesson-sources-title">Nguồn và cách dùng</h2>
      {sourceNote && <p>{sourceNote}</p>}
      {sources.length > 0 && (
        <ul>
          {sources.map((source) => (
            <li key={source.url || source.title}>
              {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : <b>{source.title}</b>}
              {source.note && <span> — {source.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function LessonDetail() {
  const { id } = useParams()
  const { data: lesson, loading, error } = useApi(() => api.lesson(id), [id])
  const [markedRead, setMarkedRead] = useState(false)

  useEffect(() => {
    setMarkedRead(false)
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (!lesson || lesson.progress?.read || markedRead) return
    api.markRead(lesson.id).then(() => setMarkedRead(true)).catch(() => {})
  }, [lesson, markedRead])

  const sections = useMemo(() => lesson?.sections || [], [lesson])
  const objectives = useMemo(() => learningObjectives(lesson), [lesson])
  const formulaItems = useMemo(() => formulas(lesson), [lesson])
  const exampleItems = useMemo(() => examples(lesson), [lesson])
  const pitfallItems = useMemo(() => pitfalls(lesson), [lesson])
  const read = Boolean(lesson?.progress?.read || markedRead)

  if (loading) return <div className="spinner" />
  if (error) return <div className="error-box">Không mở được bài học: {error}</div>
  if (!lesson) return null

  return (
    <article className="lesson-page">
      <header className="lesson-header">
        <Link to="/learn" className="lesson-back">Quay lại lộ trình</Link>
        <div className="lesson-header-meta">
          {lesson.track && <span>{lesson.track}</span>}
          {lesson.chapter && <span>{lesson.chapter}</span>}
        </div>
        <h1>{lesson.title}</h1>
        <div className="lesson-meta">
          {lesson.level && <span className={`lesson-level ${levelClass(lesson.level)}`}>{lesson.level}</span>}
          <span>{lesson.minutes || 0} phút học</span>
          {read && <span className="badge green">Đã đọc</span>}
        </div>
        {lesson.summary && <p className="lesson-summary">{lesson.summary}</p>}
      </header>

      <div className="lesson-layout">
        <aside className="lesson-toc" aria-label="Mục lục bài học">
          <b>Trong bài này</b>
          <a href="#lesson-objectives">Mục tiêu học</a>
          {formulaItems.length > 0 && <a href="#lesson-quick-reference">Công thức và ví dụ</a>}
          {sections.map((section, index) => <a key={sectionId(index)} href={`#${sectionId(index)}`}>{section.h || section.title || `Phần ${index + 1}`}</a>)}
          <a href="#guided-practice-title">Thực hành tự luận</a>
          {(lesson.sources || lesson.sourceNote) && <a href="#lesson-sources-title">Nguồn tham khảo</a>}
        </aside>

        <main className="lesson-content">
          {objectives.length > 0 && (
            <section className="lesson-objectives" id="lesson-objectives">
              <div>
                <span className="course-eyebrow">Sau bài này, bạn có thể</span>
                <h2>Đi từ khái niệm đến quyết định</h2>
              </div>
              <ul>{objectives.map((objective, index) => <li key={`${index}-${objective}`}>{objective}</li>)}</ul>
            </section>
          )}

          {(formulaItems.length > 0 || exampleItems.length > 0 || pitfallItems.length > 0) && (
            <section className="lesson-quick-reference" id="lesson-quick-reference" aria-label="Công thức, ví dụ và lỗi thường gặp">
              {formulaItems.length > 0 && (
                <div className="lesson-quick formula">
                  <span>Công thức trọng tâm</span>
                  {formulaItems.slice(0, 2).map((formula, index) => <p key={`${index}-${formula}`}>{formula}</p>)}
                </div>
              )}
              {exampleItems.length > 0 && (
                <div className="lesson-quick example">
                  <span>Ví dụ số</span>
                  <p>{exampleItems[0]}</p>
                </div>
              )}
              {pitfallItems.length > 0 && (
                <div className="lesson-quick warning">
                  <span>Lỗi thường gặp</span>
                  <p>{pitfallItems[0]}</p>
                </div>
              )}
            </section>
          )}

          <section className="lesson-reading" aria-label="Kiến thức bài học">
            <span className="course-eyebrow">Kiến thức bài học</span>
            {sections.map((section, index) => <LessonSection key={sectionId(index)} section={section} index={index} />)}
          </section>

          {lesson.keyPoints && (
            <section className="lesson-keypoints">
              <h2>Tóm tắt cần nhớ</h2>
              <ul>{asText(lesson.keyPoints).map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}</ul>
            </section>
          )}

          {(lesson.relatedTerms || []).length > 0 && (
            <section className="lesson-terms" aria-labelledby="lesson-terms-title">
              <h2 id="lesson-terms-title">Thuật ngữ cần tra</h2>
              <div>
                {lesson.relatedTerms.map((term) => (
                  <Link key={term} className="lesson-term" to={`/glossary?q=${encodeURIComponent(term)}`}>{term}</Link>
                ))}
              </div>
            </section>
          )}

          <PracticePanel lesson={lesson} />
          <Sources lesson={lesson} />
        </main>
      </div>

      <nav className="lesson-navigation" aria-label="Điều hướng bài học">
        {lesson.prev ? <Link to={`/learn/${lesson.prev}`} className="btn">Bài trước</Link> : <span />}
        {lesson.next ? (
          <Link to={`/learn/${lesson.next}`} className="btn primary">Bài tiếp theo</Link>
        ) : (
          <Link to="/learn" className="btn primary">Xem toàn bộ lộ trình</Link>
        )}
      </nav>
    </article>
  )
}
