import { useState } from 'react'
import { Link } from 'react-router-dom'
import ExplainableValue from './ExplainableValue.jsx'

// Component giải thích chuẩn 3 tầng (progressive disclosure) cho MỌI chỉ số tài chính
// Tầng 1: một câu đơn giản hiện sẵn · Tầng 2: bấm "Giải thích" (công thức/ví dụ/cách đọc/bẫy) · Tầng 3: link đọc sâu
// metricKey (tuỳ chọn): giá trị trở thành ExplainableValue dùng chung registry metricDefinitions.js
export default function MetricExplainer({ name, value, unit, simple, formula, example, readUp, readDown, traps, compare, period, source, status, links, metricKey, evCtx }) {
  const [open, setOpen] = useState(false)
  const statusClass = status === 'live' ? 'green' : status === 'demo' ? 'demo' : status === 'manual' ? 'amber' : 'gray'
  return (
    <div className="metric-explainer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <b>{name}</b>
        <span className="num" style={{ fontSize: 18, fontWeight: 800 }}>
          {metricKey ? <ExplainableValue metricKey={metricKey} value={String(value)} ctx={evCtx} /> : value}
          {unit ? <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}> {unit}</span> : null}
        </span>
      </div>
      <div style={{ fontSize: 13, marginTop: 3, color: '#d5dcea' }}>{simple}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn sm ghost" onClick={() => setOpen(!open)}>{open ? '▲ Thu gọn' : '💡 Giải thích'}</button>
        {(links || []).slice(0, 2).map((l, i) => (
          <Link key={i} className="btn sm ghost" to={l.to}>📚 {l.label}</Link>
        ))}
      </div>
      {open && (
        <div className="explain" style={{ marginTop: 8 }}>
          {formula && <div><b>Công thức:</b> {formula}</div>}
          {example && <div style={{ marginTop: 4 }}><b>Ví dụ dễ tính:</b> {example}</div>}
          {(readUp || readDown) && (
            <div style={{ marginTop: 4 }}><b>Cách đọc:</b> <span className="up">Tăng</span> — {readUp} · <span className="down">giảm</span> — {readDown}</div>
          )}
          {traps && <div style={{ marginTop: 4 }}><b>⚠️ Giới hạn & bẫy:</b> {traps}</div>}
          {compare && <div style={{ marginTop: 4 }}><b>So với ai:</b> {compare}</div>}
        </div>
      )}
      <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
        Kỳ: {period || '—'} · Nguồn: {source || '—'} · <span className={`badge ${statusClass}`}>{status || 'no-data'}</span>
      </div>
    </div>
  )
}
