import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi, useQuoteStream } from '../hooks.js'
import { fmtPrice } from '../format.js'
import ExplainableValue from '../components/ExplainableValue.jsx'

function metricKeyFor(text = '') {
  const value = String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (value.includes('roe')) return 'roe'
  if (value.includes('p/e')) return 'pe'
  if (value.includes('eps')) return 'eps'
  if (value.includes('bien') && value.includes('rong')) return 'netMargin'
  if (value.includes('tang truong') && (value.includes('doanh thu') || value.includes(' dt'))) return 'revenueGrowth'
  if (value.includes('no/von') || value.includes('d/e')) return 'debtToEquity'
  if (value.includes('ocf') && value.includes('ln')) return 'ocfToNi'
  if (value.includes('ocf')) return 'ocf'
  if (value.includes('fcf')) return 'fcf'
  if (value.includes('doanh thu')) return 'revenue'
  if (value.includes('phai thu')) return 'receivables'
  if (value.includes('ton kho')) return 'inventory'
  if (value.includes('goodwill')) return 'goodwill'
  if (value.includes('co tuc') && value.includes('yield')) return 'dividendYield'
  if (value.includes('ma200')) return 'ma200'
  if (value.includes('ma50')) return 'ma50'
  if (value.includes('ma20')) return 'ma20'
  if (value.includes('rsi')) return 'rsi14'
  if (value.includes('macd')) return 'macdHistogram'
  if (value.includes('gia hien tai') || value.includes('gia co phieu')) return 'price'
  return null
}

function ExplainableCaseValue({ value, metricKey }) {
  if (!metricKey) return value
  return <ExplainableValue metricKey={metricKey} value={String(value)} ctx={{ source: 'Dữ liệu case do phòng phân tích cung cấp' }} />
}

function EmailCard({ email }) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg,#141d31,#101726)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        <b style={{ color: '#cfe0ff' }}>📧 {email.subject}</b>
        <span className="muted" style={{ fontSize: 12 }}>Từ: {email.from}</span>
      </div>
      <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 10, fontSize: 14, color: '#d5dcea' }}>
        {email.body.map((p, i) => (
          <p key={i} style={{ margin: '6px 0' }}>{p}</p>
        ))}
      </div>
    </div>
  )
}

export default function TaskDetail() {
  const { id } = useParams()
  const { data: task, loading, error } = useApi(() => api.task(id), [id])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const symbol = task?.symbol
  const { quotes, updatedAt } = useQuoteStream(symbol ? [symbol] : [])
  const live = symbol ? quotes[symbol.toUpperCase()] : null

  const set = (fid, val) => setAnswers((a) => ({ ...a, [fid]: val }))

  const submit = async () => {
    const missing = (task?.fields || []).filter((f) => !String(answers[f.id] ?? '').trim())
    if (missing.length) {
      if (!window.confirm(`Còn ${missing.length} mục chưa điền (${missing.map((m) => m.label.slice(0, 30)).join('; ')}...). Nộp luôn?`)) return
    }
    setBusy(true)
    try {
      const res = await api.submitTask(id, answers)
      setResult(res)
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } catch (e) {
      window.alert('Lỗi nộp bài: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="spinner" />
  if (error) return <div className="error-box">Không mở được task: {error}</div>

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="muted" style={{ marginBottom: 6 }}>
        <Link to="/desk">← Phòng phân tích</Link>
      </div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>{task.title}</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <span className="badge amber">{task.level}</span>
        <span className="badge gray">{task.role}</span>
        <span className="muted">⏱ ~{task.minutes} phút · +{task.xp} XP</span>
        {task.progress?.done && (
          <span className="badge green">✓ Đã nộp: <ExplainableValue metricKey="taskScore" value={`${task.progress.score}/${task.progress.total}`} ctx={{ source: 'Kết quả task đã nộp' }} /></span>
        )}
      </div>

      {/* Email sếp giao việc */}
      <EmailCard email={task.briefEmail} />

      {/* Bảng số liệu "phòng cung cấp" (case data) */}
      {task.caseTable && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">🗂️ {task.caseTable.title}</div>
          <table className="table">
            <thead>
              <tr>
                {task.caseTable.columns.map((c) => (
                  <th key={c}><ExplainableCaseValue value={c} metricKey={metricKeyFor(c)} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {task.caseTable.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => {
                    const metricKey = metricKeyFor(task.caseTable.columns[j]) || metricKeyFor(j === 0 ? cell : row[0])
                    return (
                      <td key={j} className={j > 0 && j < row.length - 1 ? 'num' : ''}>
                        {j === 0 ? <b><ExplainableCaseValue value={cell} metricKey={metricKey} /></b> : <ExplainableCaseValue value={cell} metricKey={metricKey} />}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Giá realtime của mã liên quan */}
      {symbol && (
        <div className="card" style={{ marginTop: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span>
            📡 Dữ liệu làm việc: <b>{symbol}</b>{' '}
            {live && (
              <span className={`num ${live.changePercent >= 0 ? 'up' : 'down'}`}>
                <ExplainableValue metricKey="price" value={fmtPrice(live.price, live.currency)} ctx={{ symbol, source: 'Luồng giá cập nhật' }} /> ({live.changePercent >= 0 ? '+' : ''}
                <ExplainableValue metricKey="changePercent" value={`${live.changePercent?.toFixed(2)}%`} ctx={{ symbol, period: 'So với phiên trước' }} />)
              </span>
            )}
          </span>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {updatedAt && <span className="badge green">● TRỰC TIẾP {updatedAt.toLocaleTimeString('vi-VN')}</span>}
            <Link className="btn sm" to={`/stock/${symbol}`} target="_blank">
              Mở biểu đồ real-time ↗
            </Link>
          </span>
        </div>
      )}

      {/* Hướng dẫn từng bước */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">🧭 Hướng dẫn từng bước (cho người mới — làm theo đúng thứ tự)</div>
        <ol style={{ margin: 0, paddingLeft: 22 }}>
          {task.steps.map((s, i) => (
            <li key={i} style={{ margin: '10px 0', color: '#d5dcea' }}>{s}</li>
          ))}
        </ol>
        {task.relatedLessons?.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <b className="muted" style={{ fontSize: 12.5 }}>📚 Bài học nên đọc trước/khi làm:</b>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
              {task.relatedLessons.map((lid) => (
                <Link key={lid} className="btn sm" to={`/learn/${lid}`}>📖 {lid}</Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form nộp bài */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">🧾 Phiếu hoàn thành nhiệm vụ ({task.fields.reduce((s, f) => s + f.points, 0)} điểm)</div>
        {task.fields.map((f) => {
          const r = result?.results?.find((x) => x.id === f.id)
          return (
            <div key={f.id} style={{ marginBottom: 16 }}>
              <label className="field" style={{ marginBottom: 6 }}>
                <span>
                  {metricKeyFor(f.label) ? <ExplainableValue metricKey={metricKeyFor(f.label)} value={f.label} ctx={{ source: 'Yêu cầu của task' }} /> : f.label} <span className="muted-2">({f.points}đ)</span>
                </span>
              </label>
              {f.type === 'select' ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(f.options || []).map((opt, oi) => (
                    <button
                      key={oi}
                      className={`btn sm ${answers[f.id] === oi ? 'active' : ''}`}
                      onClick={() => set(f.id, oi)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : f.type === 'number' || f.type === 'computed' ? (
                <input
                  className="input num"
                  type="number"
                  step="any"
                  placeholder={f.type === 'computed' ? 'Kết quả phép tính...' : 'Con số...'}
                  value={answers[f.id] ?? ''}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              ) : (
                <textarea
                  className="input"
                  rows={f.type === 'text' && (f.minLen || 0) >= 100 ? 4 : 2}
                  placeholder="Em điền câu trả lời ở đây..."
                  value={answers[f.id] ?? ''}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              )}
              {f.hint && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>💡 {f.hint}</div>}
              {r && (
                <div className={`badge ${r.ok ? 'green' : 'red'}`} style={{ marginTop: 6 }}>
                  {r.ok ? `✅ Đúng +${r.points}đ` : '❌ Chưa đúng'}
                </div>
              )}
              {r && r.expected && !r.ok && (
                <div className="explain" style={{ marginTop: 6 }}>📌 {r.expected}</div>
              )}
            </div>
          )
        })}

        <button className="btn primary" style={{ width: '100%' }} disabled={busy} onClick={submit}>
          {busy ? 'Mentor đang chấm...' : '📤 Nộp cho mentor chấm (dữ liệu live)'}
        </button>
      </div>

      {/* Kết quả & phản hồi mentor */}
      {result && (
        <div className={`quiz-result ${result.passed ? 'pass' : 'fail'}`} style={{ marginTop: 12 }}>
          {result.passed ? '🎉 ĐẠT' : '📔 CHƯA ĐẠT (cần ≥60%)'} — <ExplainableValue metricKey="taskScore" value={`${result.score}/${result.total} điểm`} ctx={{ source: 'Kết quả mentor chấm' }} /> · +<ExplainableValue metricKey="xp" value={`${result.xp} XP`} ctx={{ source: 'XP nhận từ task' }} /> ·
          Tổng XP: <ExplainableValue metricKey="xp" value={result.totalXp} ctx={{ source: 'Tổng tiến độ phòng phân tích' }} /> · Cấp bậc: {result.rank.name}
        </div>
      )}
      {result && (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="card-title">🧑‍🏫 Phản hồi từ mentor</div>
          <p style={{ margin: 0, color: '#d5dcea' }}>{result.mentor}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
        {task.prev ? <Link to={`/desk/${task.prev}`} className="btn">← Task trước</Link> : <span />}
        {task.next ? (
          <Link to={`/desk/${task.next}`} className="btn primary">Task tiếp theo →</Link>
        ) : (
          <Link to="/desk" className="btn primary">🏁 Hoàn thành phòng tập →</Link>
        )}
      </div>
    </div>
  )
}
