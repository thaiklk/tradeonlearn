import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { METRICS } from '../content/metricDefinitions.js'

// ═══ ExplainableValue — MỌI con số trên web đều bấm được để hỏi "này là gì?" ═══
// ctx (tuỳ chọn): { symbol, calc, compare, period, source, status, unit, currency, note }
// - calc:    chuỗi "tính lại cho công ty này" (VD: "7,3 ÷ 31 = 23,5%")
// - compare: chuỗi so sánh cùng kỳ trước/đối thủ nếu có
let EV_ID = 0

export default function ExplainableValue({ metricKey, children, value, ctx = {}, className = '', style }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const idRef = useRef(++EV_ID)
  const def = METRICS[metricKey]

  // Escape đóng panel + focus trả về nút
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!def) {
    // Không fallback im lặng — lỗi dev phải thấy được (mục 13 của brief)
    return (
      <span className="ev-missing" style={style} title={`⚠️ THIẾU ĐỊNH NGHĨA: "${metricKey}" — thêm vào metricDefinitions.js`}>
        {children ?? value}
      </span>
    )
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`ev ${className}`}
        style={style}
        aria-haspopup="dialog"
        aria-label={`Giải thích: ${def.labelVi}`}
        onClick={() => setOpen(true)}
      >
        {children ?? value}
      </button>

      {open && (
        <div className="ev-overlay" onClick={() => { setOpen(false); btnRef.current?.focus() }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={def.labelVi}
            className="ev-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ev-head">
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{def.labelVi}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{def.en} · {def.cat}</div>
              </div>
              <button className="btn sm ghost" aria-label="Đóng" onClick={() => { setOpen(false); btnRef.current?.focus() }}>✕ Đóng</button>
            </div>

            <div className="ev-body">
              <div className="ev-value">{value != null && value !== '' ? <b className="num">{value}</b> : null} {ctx.unit ? <span className="muted">{ctx.unit}</span> : null}</div>

              <Section title="🔍 Đây là gì?">{def.def}</Section>
              {def.why && <Section title="❓ Vì sao quan trọng?">{def.why}</Section>}
              {def.formula && (
                <Section title="🧮 Tính như thế nào?">
                  <div className="mono" style={{ background: '#0d1422', padding: '8px 10px', borderRadius: 8, fontSize: 13 }}>{def.formula}</div>
                  {def.parts?.length > 0 && (
                    <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12.5 }}>{def.parts.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  )}
                </Section>
              )}
              {def.example && <Section title="📐 Ví dụ dễ hiểu">{def.example}</Section>}
              {ctx.calc && <Section title={`🧑‍🔬 Tính lại cho ${ctx.symbol || 'công ty này'}`}>{ctx.calc}</Section>}
              {(def.up || def.down || def.flat) && (
                <Section title="📈 Đọc ra sao khi thay đổi?">
                  {def.up && <div><span className="up">▲ Tăng:</span> {def.up}</div>}
                  {def.down && <div><span className="down">▼ Giảm:</span> {def.down}</div>}
                  {def.flat && <div><span className="muted">• Đi ngang:</span> {def.flat}</div>}
                </Section>
              )}
              {ctx.compare && <Section title="⚖️ So sánh">{ctx.compare}</Section>}
              {def.pitfalls && <Section title="⚠️ Bẫy & khi nào nhận xét có thể sai">{def.pitfalls}</Section>}
              {def.bench && <Section title="📏 Mốc tham khảo">{def.bench}</Section>}

              <div className="ev-meta">
                <b>Đơn vị:</b> {def.unit || ctx.unit || '—'}
                {ctx.symbol && <> · <b>Mã:</b> {ctx.symbol}</>}
                {ctx.period && <> · <b>Kỳ:</b> {ctx.period}</>}
                {ctx.source && <> · <b>Nguồn:</b> {ctx.source}</>}
                {ctx.status && <> · <span className={`badge ${ctx.status === 'demo' ? 'demo' : ctx.status === 'live' ? 'green' : 'gray'}`}>{ctx.status}</span></>}
              </div>

              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
                {(def.terms || []).slice(0, 2).map((t) => (
                  <Link key={t} className="btn sm ghost" to={`/glossary?q=${encodeURIComponent(t)}`}>📚 {t}</Link>
                ))}
                {def.lesson && <Link className="btn sm" to={`/learn/${def.lesson}`}>📖 Bài học liên quan</Link>}
                {def.task && <Link className="btn sm" to={`/desk/${def.task}`}>💼 Task thực hành</Link>}
              </div>

              <TryIt def={def} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: '#d5dcea', marginTop: 2 }}>{children}</div>
    </div>
  )
}

function TryIt({ def }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginTop: 14, borderTop: '1px dashed var(--border)', paddingTop: 10 }}>
      <b style={{ fontSize: 13 }}>🤔 Bạn thử tự kết luận: nhìn con số này, doanh nghiệp đang "khỏe" chỗ nào — cần kiểm tra gì?</b>
      {!show ? (
        <button className="btn sm" style={{ marginTop: 6 }} onClick={() => setShow(true)}>Xem gợi ý</button>
      ) : (
        <div className="explain" style={{ marginTop: 6 }}>
          Gợi ý: dùng phần "Đọc ra sao" ở trên + so với mốc tham khảo {def.bench ? '' : 'của ngành'} — và LUÔN đặt câu hỏi ngược: "điều gì sẽ khiến nhận xét này sai?"
          {def.pitfalls ? ` (Gợi ý bẫy: ${def.pitfalls.split('.')[0]}.)` : ''}
        </div>
      )}
    </div>
  )
}
