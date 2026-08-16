import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

const last = (a) => (a?.length ? a[a.length - 1] : null)
const score = (v, tiers) => (tiers.find(([min]) => v >= min)?.[1] ?? 0)

function groups(fin) {
  const r = fin.ratios || {}
  const roe = last(r.roe), nm = last(r.netMargin), gr = last(r.revenueGrowth), de = last(r.debtToEquity), ocf = last(r.ocfToNi)
  return [
    { key: 'sinh lời', v: Math.round((score(roe, [[20,10],[15,8],[10,6],[0,4]]) + score(nm, [[20,10],[10,8],[5,6],[0,4]])) / 2), ev: `ROE ${roe}% · Biên ròng ${nm}%` },
    { key: 'tăng trưởng', v: score(gr, [[15,10],[8,7],[0,5],[-100,2]]), ev: `Doanh thu ${gr}%/năm` },
    { key: 'đòn bẩy/nợ', v: 10 - Math.min(8, Math.ceil(de / 60)), ev: `Nợ/Vốn ${de}%` },
    { key: 'dòng tiền', v: score(ocf, [[90,10],[70,7],[40,4],[0,1]]), ev: `OCF/LN ${ocf}%` },
    { key: 'định giá', v: null, ev: 'Xem P/E so ngành & lịch sử (Bài 12) — tự kết luận' },
  ]
}
const STEPS = [
  { q: 'Doanh nghiệp này bán gì, kiếm tiền kiểu nào?', hint: 'Mô hình kinh doanh — đọc tên công ty + ngành trên trang mã. 1-2 câu.' },
  { q: 'Doanh thu & lợi nhuận đang tăng hay giảm?', hint: 'Nhìn 2 dòng đầu bảng BCTC: tăng trưởng DT %, tăng trưởng LN %. Cùng chiều là tốt.' },
  { q: 'Biên lợi nhuận & ROE có tốt không?', hint: 'Biên ròng ≥10% khá; ROE ≥15% tốt. So với chính nó năm trước (xu hướng quan trọng hơn con số).' },
  { q: 'Nợ có nặng không?', hint: 'Nợ/Vốn ≤100% thoải mái với đa số ngành (ngân hàng là ngoại lệ).' },
  { q: 'Lợi nhuận có thành tiền thật không?', hint: 'OCF/LN ≥80% nhiều năm = thật. Thấp = "lợi nhuận trên giấy" (Bài 11).' },
  { q: 'Định giá & rủi ro hiện tại?', hint: 'P/E hiện tại so trung bình ngành + điều kiện "tôi sẽ sai nếu..." (Bài 12-13).' },
]

export default function HealthCheck() {
  const { symbol } = useParams()
  const { data: fin } = useApi(() => api.get(`/stocks/${encodeURIComponent(symbol)}/financials`), [symbol])
  const [step, setStep] = useState(0)
  const [notes, setNotes] = useState({})
  const g = fin?.years?.length ? groups(fin) : null
  const done = step >= STEPS.length

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="muted" style={{ marginBottom: 6 }}>
        <Link to={`/stock/${symbol}`}>← {symbol}</Link>
      </div>
      <h1 style={{ margin: '0 0 4px', fontSize: 23 }}>🩺 Health Check 15 phút — {symbol}</h1>
      <div className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
        6 bước như analyst thật: tự trả lời TRƯỚC khi xem điểm mẫu. {fin && (
          <span className={`badge ${fin.status === 'demo' ? 'demo' : 'green'}`}>{fin.status === 'demo' ? 'DEMO DATA' : 'LIVE'}</span>
        )} {fin?.status === 'demo' && <i> — số liệu mẫu giáo dục, không phải live</i>}
      </div>
      <div style={{ height: 8, background: '#ffffff12', borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--green))', transition: 'width .3s' }} />
      </div>

      {!done && (
        <div className="card">
          <div className="card-title">Bước {step + 1}/{STEPS.length}</div>
          <h3 style={{ margin: '0 0 8px' }}>{STEPS[step].q}</h3>
          <div className="muted" style={{ fontSize: 13 }}>💡 {STEPS[step].hint}</div>
          <textarea className="input" rows={3} style={{ marginTop: 10 }} placeholder="Tự viết 1-2 câu trả lời của bạn..." value={notes[step] || ''} onChange={(e) => setNotes((n) => ({ ...n, [step]: e.target.value }))} />
          <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'space-between' }}>
            <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>← Trước</button>
            <button className="btn primary" onClick={() => setStep(step + 1)}>{step === STEPS.length - 1 ? 'Xem kết quả ✅' : 'Tiếp →'}</button>
          </div>
        </div>
      )}

      {done && g && (
        <>
          <div className="card">
            <div className="card-title">Kết luận sức khỏe — 5 nhóm (giáo dục, KHÔNG phải khuyến nghị mua/bán)</div>
            {g.map((x) => (
              <div key={x.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                <b style={{ width: 120 }}>{x.key}</b>
                <div style={{ flex: 1, height: 9, background: '#ffffff10', borderRadius: 99 }}>
                  {x.v != null && <div style={{ width: `${x.v * 10}%`, height: '100%', borderRadius: 99, background: x.v >= 7 ? 'var(--green)' : x.v >= 4 ? 'var(--amber)' : 'var(--red)' }} />}
                </div>
                <span className="num" style={{ width: 42, textAlign: 'right' }}>{x.v != null ? x.v + '/10' : '—'}</span>
                <span className="muted" style={{ fontSize: 12, flex: 2 }}>{x.ev}</span>
              </div>
            ))}
            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              ⚠️ Điểm quy tắc đơn giản trên số liệu {fin.status === 'demo' ? 'mẫu' : 'live'} — chỉ để học cách đọc, cần kiểm tra thêm BCTC thật trước mọi quyết định.
            </div>
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-title">Ghi chú của bạn</div>
            {STEPS.map((s, i) => (
              <div key={i} style={{ fontSize: 13, marginBottom: 8 }}><b>{i + 1}. {s.q}</b><div className="muted">{notes[i] || '(chưa viết)'}</div></div>
            ))}
          </div>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setStep(0)}>🔁 Làm lại</button>
        </>
      )}
      {done && !g && <div className="card"><div className="empty">Mã này chưa có dữ liệu BCTC trên web (no-data) — chọn FPT, VNM, AAPL, MSFT hoặc KO.</div></div>}
    </div>
  )
}
