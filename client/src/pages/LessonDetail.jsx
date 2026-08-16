import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

function asItems(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

function PracticePanel({ lesson }) {
  const practice = lesson.practice || {}
  const steps = asItems(practice.steps || practice.instructions || practice.tasks)
  const checklist = asItems(practice.checklist || practice.review || practice.selfCheck)
  const objective = practice.objective || practice.goal || practice.outcome
  const deliverable = practice.deliverable || practice.output || practice.record
  const activityLink = practice.link || practice.href || lesson.tryIt?.link
  const activityText = practice.text || lesson.tryIt?.text
  const fields = Array.isArray(practice.fields) ? practice.fields : []
  const [answers, setAnswers] = useState(() => lesson.progress?.practiceAnswers || {})
  const [status, setStatus] = useState(lesson.progress?.practiceStatus || null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setAnswers(lesson.progress?.practiceAnswers || {})
    setStatus(lesson.progress?.practiceStatus || null)
    setNotice('')
  }, [lesson.id])

  const update = (id, value) => setAnswers((current) => ({ ...current, [id]: value }))
  const save = async (submit) => {
    setBusy(true)
    setNotice('')
    try {
      const response = await api.saveLessonPractice(lesson.id, answers, submit)
      setAnswers(response.progress?.practiceAnswers || answers)
      setStatus(response.progress?.practiceStatus || (submit ? 'submitted' : 'draft'))
      setNotice(submit ? 'Đã nộp đầu ra thực hành. Bây giờ hãy tự đối chiếu rubric và lời giải mẫu.' : 'Đã lưu bản nháp thực hành.')
    } catch (error) {
      setNotice(error.message || 'Không lưu được bài thực hành.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card practice-workbench" style={{ marginTop: 16 }} aria-labelledby="guided-practice-title">
      <div className="card-title" id="guided-practice-title">
        <span>🧭 {practice.title || 'Thực hành có hướng dẫn'}</span>
        {status === 'submitted' && <span className="badge green">✓ Đã nộp</span>}
        {status === 'draft' && <span className="badge amber">Bản nháp</span>}
      </div>
      <div className="try-box" style={{ margin: 0 }}>
        {objective && <p style={{ margin: '0 0 10px' }}><b>Mục tiêu:</b> {objective}</p>}
        {practice.scenario && <p className="practice-scenario"><b>Tình huống:</b> {practice.scenario}</p>}
        {activityText && <p style={{ margin: '0 0 10px' }}>{activityText}</p>}

        {steps.length > 0 && (
          <>
            <b>Các bước thực hiện</b>
            <ol style={{ margin: '8px 0 10px', paddingLeft: 22 }}>
              {steps.map((step, index) => <li key={`${index}-${step}`} style={{ marginBottom: 6 }}>{step}</li>)}
            </ol>
          </>
        )}

        {checklist.length > 0 && (
          <>
            <b>Tự đối chiếu trước khi chuyển bài</b>
            <ul style={{ margin: '8px 0 10px', paddingLeft: 20 }}>
              {checklist.map((item, index) => <li key={`${index}-${item}`} style={{ marginBottom: 6 }}>{item}</li>)}
            </ul>
          </>
        )}

        {deliverable && <p style={{ margin: '0 0 10px' }}><b>Ghi lại:</b> {deliverable}</p>}
        {activityLink && <Link to={activityLink} className="btn sm">Mở dữ liệu hoặc công cụ →</Link>}
      </div>

      {fields.length > 0 && (
        <div className="practice-fields">
          <div className="practice-fields-title">Bài làm của bạn</div>
          {fields.map((item) => (
            <label className="field practice-field" key={item.id} htmlFor={`${lesson.id}-${item.id}`}>
              <span>{item.label}{item.required !== false && <b className="practice-required"> *</b>}</span>
              {item.help && <small>{item.help}</small>}
              <textarea
                id={`${lesson.id}-${item.id}`}
                className="input"
                rows={4}
                maxLength={5000}
                value={answers[item.id] || ''}
                placeholder={item.placeholder || 'Viết câu trả lời của bạn...'}
                onChange={(event) => update(item.id, event.target.value)}
              />
            </label>
          ))}
          <div className="practice-actions">
            <button className="btn ghost" disabled={busy} onClick={() => save(false)}>
              {busy ? 'Đang lưu...' : 'Lưu bản nháp'}
            </button>
            <button className="btn primary" disabled={busy} onClick={() => save(true)}>
              {busy ? 'Đang nộp...' : 'Nộp đầu ra thực hành'}
            </button>
          </div>
          {notice && <div className={notice.startsWith('Đã') ? 'practice-notice ok' : 'practice-notice'}>{notice}</div>}
        </div>
      )}

      {(checklist.length > 0 || practice.rubric) && status === 'submitted' && (
        <details className="practice-review">
          <summary>Rubric tự đối chiếu</summary>
          {checklist.length > 0 && <ul>{checklist.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}
          {asItems(practice.rubric).length > 0 && <ul>{asItems(practice.rubric).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>}
        </details>
      )}
      {practice.modelAnswer && status === 'submitted' && (
        <details className="practice-review">
          <summary>Gợi ý đối chiếu sau khi nộp</summary>
          <p>{practice.modelAnswer}</p>
        </details>
      )}
    </section>
  )
}

export default function LessonDetail() {
  const { id } = useParams()
  const { data: lesson, loading, error } = useApi(() => api.lesson(id), [id])
  const [marked, setMarked] = useState(false)

  useEffect(() => {
    setMarked(false)
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (lesson && !lesson.progress?.read && !marked) {
      api.markRead(lesson.id).then(() => setMarked(true)).catch(() => {})
    }
  }, [lesson, marked])

  if (loading) return <div className="spinner" />
  if (error) return <div className="error-box">Không mở được bài học: {error}</div>

  return (
    <article style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="muted" style={{ marginBottom: 6 }}>
        <Link to="/learn">← Tất cả bài học</Link>
      </div>
      <h1 style={{ margin: '0 0 6px', fontSize: 25 }}>{lesson.title}</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <span className={`lesson-level ${lesson.level === 'Cơ bản' ? 'c1' : lesson.level === 'Trung cấp' ? 'c2' : 'c3'}`}>
          {lesson.level}
        </span>
        <span className="muted">⏱ {lesson.minutes} phút đọc</span>
        {lesson.progress?.read && <span className="badge green">✓ Đã đọc</span>}
      </div>

      <div className="card lesson-body">
        {lesson.sections.map((sec, i) => (
          <section key={i}>
            <h3>{sec.h}</h3>
            {(sec.p || []).map((para, j) => (
              <p key={j}>{para}</p>
            ))}
            {sec.list && (
              <ul>
                {sec.list.map((li, j) => (
                  <li key={j}>{li}</li>
                ))}
              </ul>
            )}
            {(sec.p2 || []).map((para, j) => (
              <p key={`p2-${j}`}>{para}</p>
            ))}
            {sec.tip && <div className="tip-box">💡 <b>Mẹo:</b> {sec.tip}</div>}
          </section>
        ))}

        {lesson.keyPoints && (
          <div className="keypoints">
            <b>📌 Tóm tắt cần nhớ</b>
            <ul style={{ margin: '8px 0 0' }}>
              {lesson.keyPoints.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </div>
        )}

        {(lesson.relatedTerms || []).length > 0 && (
          <div style={{ marginTop: 14 }}>
            <b className="muted">🔖 Thuật ngữ trong bài:</b>{' '}
            <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {lesson.relatedTerms.map((t) => (
                <Link key={t} className="btn sm ghost" to={`/glossary?q=${encodeURIComponent(t)}`}>
                  {t}
                </Link>
              ))}
            </span>
          </div>
        )}
      </div>

      <PracticePanel lesson={lesson} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
        {lesson.prev ? (
          <Link to={`/learn/${lesson.prev}`} className="btn">
            ← Bài trước
          </Link>
        ) : (
          <span />
        )}
        {lesson.next ? (
          <Link to={`/learn/${lesson.next}`} className="btn primary">
            Bài tiếp theo →
          </Link>
        ) : (
          <Link to="/trading" className="btn primary">
            🎓 Hoàn thành! Bắt đầu thực hành →
          </Link>
        )}
      </div>
    </article>
  )
}
