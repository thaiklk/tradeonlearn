import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

function Quiz({ lessonId, questions, onDone }) {
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const choose = (qi, oi) => {
    if (result) return
    setAnswers((a) => ({ ...a, [qi]: oi }))
  }

  const submit = async () => {
    const arr = questions.map((_, i) => (answers[i] != null ? answers[i] : -1))
    if (arr.some((a) => a === -1)) {
      window.alert('Bạn còn câu chưa chọn đáp án.')
      return
    }
    setBusy(true)
    try {
      const res = await api.submitQuiz(lessonId, arr)
      setResult(res)
      onDone?.(res)
    } catch (e) {
      window.alert('Lỗi nộp bài: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  const retake = () => {
    setAnswers({})
    setResult(null)
  }

  return (
    <div>
      {questions.map((q, qi) => {
        const r = result?.results?.[qi]
        return (
          <div key={qi} className="quiz-q">
            <div className="q-text">
              Câu {qi + 1}. {q.q}
            </div>
            {q.options.map((opt, oi) => {
              let cls = 'opt'
              if (!result && answers[qi] === oi) cls += ' selected'
              if (result) {
                if (oi === r.answer) cls += ' correct'
                else if (oi === r.selected) cls += ' wrong'
              }
              return (
                <div key={oi} className={cls} onClick={() => choose(qi, oi)}>
                  <span className="letter">{String.fromCharCode(65 + oi)}.</span>
                  <span>{opt}</span>
                  {result && oi === r.answer && <span style={{ marginLeft: 'auto' }}>✅</span>}
                  {result && oi === r.selected && oi !== r.answer && <span style={{ marginLeft: 'auto' }}>❌</span>}
                </div>
              )
            })}
            {result && <div className="explain">💡 {r.explain}</div>}
          </div>
        )
      })}
      {!result ? (
        <button className="btn primary" style={{ width: '100%' }} disabled={busy} onClick={submit}>
          {busy ? 'Đang chấm...' : '📝 Nộp bài & xem kết quả'}
        </button>
      ) : (
        <div className="grid cols-2" style={{ alignItems: 'center' }}>
          <div className={`quiz-result ${result.passed ? 'pass' : 'fail'}`}>
            {result.passed ? '🎉 ĐẠT' : '📔 CHƯA ĐẠT (cần ≥60%)'} — Đúng {result.score}/{result.total} câu (kỷ lục:{' '}
            {result.best.score}/{result.best.total})
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={retake}>
              🔁 Làm lại
            </button>
          </div>
        </div>
      )}
    </div>
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
        {lesson.progress?.quizScore != null && (
          <span className="badge gray">Điểm tốt nhất: {lesson.progress.quizScore}/{lesson.progress.quizTotal}</span>
        )}
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

        {lesson.tryIt && (
          <div className="try-box">
            🧪 <b>Thực hành trên web:</b> {lesson.tryIt.text}
            {lesson.tryIt.link && (
              <>
                {' '}
                <Link to={lesson.tryIt.link} className="btn sm" style={{ marginLeft: 6 }}>
                  Mở ngay →
                </Link>
              </>
            )}
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

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">📝 Trắc nghiệm — kiểm tra kiến thức</div>
        <Quiz lessonId={lesson.id} questions={lesson.quiz} />
      </div>

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
