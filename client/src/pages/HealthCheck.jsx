import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'
import ExplainableValue from '../components/ExplainableValue.jsx'

const last = (a) => (a?.length ? a[a.length - 1] : null)
const score = (v, tiers) => (tiers.find(([min]) => v >= min)?.[1] ?? 0)
const number = (v, digits = 1) => (Number.isFinite(v) ? v.toLocaleString('vi-VN', { maximumFractionDigits: digits }) : '—')

const evidence = (metricKey, label, value, unit = '%') => ({ metricKey, label, value, unit })

function groups(fin) {
  const r = fin.ratios || {}
  const roe = last(r.roe), nm = last(r.netMargin), gr = last(r.revenueGrowth), de = last(r.debtToEquity), ocf = last(r.ocfToNi)
  return [
    {
      key: 'Sinh lời',
      v: Math.round((score(roe, [[20,10],[15,8],[10,6],[0,4]]) + score(nm, [[20,10],[10,8],[5,6],[0,4]])) / 2),
      rule: 'Điểm là trung bình hai bậc thang: ROE và biên ròng. Đây là mốc học tập, không phải điểm tín nhiệm.',
      evidence: [evidence('roe', 'ROE', roe), evidence('netMargin', 'Biên ròng', nm)],
    },
    {
      key: 'Tăng trưởng',
      v: score(gr, [[15,10],[8,7],[0,5],[-100,2]]),
      rule: 'Tăng trưởng doanh thu ≥15% nhận 10/10; ≥8% nhận 7/10; dương nhận 5/10.',
      evidence: [evidence('revenueGrowth', 'Tăng trưởng doanh thu', gr)],
    },
    {
      key: 'Đòn bẩy/nợ',
      v: 10 - Math.min(8, Math.ceil(de / 60)),
      rule: 'Mỗi khoảng 60% Nợ/Vốn chủ làm giảm 1 điểm; ngành ngân hàng là ngoại lệ quan trọng.',
      evidence: [evidence('debtToEquity', 'Nợ/Vốn chủ', de)],
    },
    {
      key: 'Dòng tiền',
      v: score(ocf, [[90,10],[70,7],[40,4],[0,1]]),
      rule: 'OCF/Lợi nhuận ròng ≥90% nhận 10/10; ≥70% nhận 7/10; ≥40% nhận 4/10.',
      evidence: [evidence('ocfToNi', 'OCF/Lợi nhuận ròng', ocf)],
    },
    {
      key: 'Định giá',
      v: null,
      rule: 'Không tự chấm bằng một con số. Đọc P/E cùng ngành, lịch sử của chính doanh nghiệp và triển vọng lợi nhuận.',
      evidence: [evidence('pe', 'P/E: xem cùng ngành và lịch sử', null, 'lần')],
    },
  ]
}
const STEPS = [
  { q: 'Doanh nghiệp này bán gì, kiếm tiền kiểu nào?', hint: 'Mô hình kinh doanh — đọc tên công ty + ngành trên trang mã. Viết 1-2 câu bằng lời của bạn.' },
  { q: 'Doanh thu & lợi nhuận đang tăng hay giảm?', hint: 'Nhìn xu hướng doanh thu và lợi nhuận qua nhiều năm. Cùng đi lên là tín hiệu tốt, nhưng chưa đủ để kết luận.', concepts: [{ metricKey: 'revenueGrowth', label: 'Tăng trưởng doanh thu' }] },
  { q: 'Biên lợi nhuận & ROE có tốt không?', hint: 'Biên ròng ≥10% khá; ROE ≥15% tốt. So với chính nó năm trước vì xu hướng quan trọng hơn một con số.', concepts: [{ metricKey: 'netMargin', label: 'Biên lợi nhuận ròng' }, { metricKey: 'roe', label: 'ROE' }] },
  { q: 'Nợ có nặng không?', hint: 'Nợ/Vốn chủ ≤100% thường dễ thở với đa số ngành; ngân hàng là một ngoại lệ lớn.', concepts: [{ metricKey: 'debtToEquity', label: 'Nợ/Vốn chủ' }] },
  { q: 'Lợi nhuận có thành tiền thật không?', hint: 'OCF/Lợi nhuận ròng ≥80% trong nhiều năm là đáng tin hơn một năm riêng lẻ.', concepts: [{ metricKey: 'ocfToNi', label: 'OCF/Lợi nhuận ròng' }] },
  { q: 'Định giá & rủi ro hiện tại?', hint: 'Đọc P/E cùng trung bình ngành, rồi nêu một điều kiện khiến kết luận của bạn có thể sai.', concepts: [{ metricKey: 'pe', label: 'P/E' }] },
]

function currentMetricValue(fin, metricKey) {
  const r = fin?.ratios || {}
  if (metricKey === 'roe') return last(r.roe)
  if (metricKey === 'netMargin') return last(r.netMargin)
  if (metricKey === 'revenueGrowth') return last(r.revenueGrowth)
  if (metricKey === 'debtToEquity') return last(r.debtToEquity)
  if (metricKey === 'ocfToNi') return last(r.ocfToNi)
  return null
}

function MetricChip({ item, fin }) {
  const display = item.value == null ? item.label : `${item.label} ${number(item.value)}${item.unit}`
  return (
    <ExplainableValue
      metricKey={item.metricKey}
      value={item.value == null ? '' : number(item.value)}
      ctx={{
        symbol: fin?.symbol,
        period: fin?.periodEnd || 'Kỳ gần nhất',
        source: fin?.source,
        status: fin?.status,
        unit: item.unit,
      }}
    >
      {display} ⓘ
    </ExplainableValue>
  )
}

function HealthScore({ group, fin, children }) {
  return (
    <ExplainableValue
      metricKey="healthScore"
      value={group.v == null ? 'Chưa chấm' : `${group.v}/10`}
      ctx={{
        symbol: fin?.symbol,
        period: fin?.periodEnd || 'Kỳ gần nhất',
        source: fin?.source,
        status: fin?.status,
        unit: 'điểm /10',
        calc: group.rule,
        compare: 'Đọc điểm cùng bằng chứng bên cạnh; không cộng các nhóm thành một kết luận mua hoặc bán.',
      }}
    >
      {children}
    </ExplainableValue>
  )
}

export default function HealthCheck() {
  const { symbol } = useParams()
  const { data: fin } = useApi(() => api.get(`/stocks/${encodeURIComponent(symbol)}/financials`), [symbol])
  const [step, setStep] = useState(0)
  const [notes, setNotes] = useState({})
  const g = fin?.years?.length ? groups(fin) : null
  const done = step >= STEPS.length
  const dataLabel = fin?.status === 'demo' ? 'DEMO DATA' : fin?.status === 'manual' ? 'NGƯỜI HỌC NHẬP' : fin ? 'DỮ LIỆU THEO NGUỒN' : ''
  const dataDescription = fin?.status === 'demo' ? 'số liệu mẫu giáo dục, không phải dữ liệu thị trường live' : fin?.status === 'manual' ? 'số liệu do người học nhập, cần đối chiếu báo cáo gốc' : 'nguồn và kỳ được ghi trên từng phần giải thích'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="muted" style={{ marginBottom: 6 }}>
        <Link to={`/stock/${symbol}`}>← {symbol}</Link>
      </div>
      <h1 style={{ margin: '0 0 4px', fontSize: 23 }}>🩺 Health Check 15 phút — {symbol}</h1>
      <div className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
        6 bước như analyst thật: tự trả lời TRƯỚC khi xem điểm mẫu. {fin && (
          <span className={`badge ${fin.status === 'demo' || fin.status === 'manual' ? 'demo' : 'gray'}`}>{dataLabel}</span>
        )} {fin && <i> — {dataDescription}</i>}
      </div>
      <div className="tip-box" style={{ marginBottom: 12, fontSize: 12.5 }}>
        Mới bắt đầu? Bạn không cần nhớ các chỉ số. Bấm vào tên chỉ số, điểm hoặc số liệu có dấu ⓘ để xem định nghĩa, công thức, ví dụ và bẫy thường gặp.
      </div>
      <div style={{ height: 8, background: '#ffffff12', borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--green))', transition: 'width .3s' }} />
      </div>

      {!done && (
        <div className="card">
          <div className="card-title">Bước {step + 1}/{STEPS.length}</div>
          <h3 style={{ margin: '0 0 8px' }}>{STEPS[step].q}</h3>
          <div className="muted" style={{ fontSize: 13 }}>💡 {STEPS[step].hint}</div>
          {STEPS[step].concepts?.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 9, fontSize: 12.5 }}>
              {STEPS[step].concepts.map((concept) => (
                <MetricChip
                  key={concept.metricKey}
                  fin={fin}
                  item={{ ...concept, value: currentMetricValue(fin, concept.metricKey), unit: concept.metricKey === 'pe' ? 'lần' : '%' }}
                />
              ))}
            </div>
          )}
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
                <b style={{ width: 120 }}><HealthScore group={x} fin={fin}>{x.key} ⓘ</HealthScore></b>
                <div style={{ flex: 1, height: 9, background: '#ffffff10', borderRadius: 99 }}>
                  {x.v != null && <div style={{ width: `${x.v * 10}%`, height: '100%', borderRadius: 99, background: x.v >= 7 ? 'var(--green)' : x.v >= 4 ? 'var(--amber)' : 'var(--red)' }} />}
                </div>
                <span className="num" style={{ width: 42, textAlign: 'right' }}>
                  <HealthScore group={x} fin={fin}>{x.v != null ? x.v + '/10' : '—'}</HealthScore>
                </span>
                <span className="muted" style={{ fontSize: 12, flex: 2, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {x.evidence.map((item) => <MetricChip key={item.metricKey} item={item} fin={fin} />)}
                </span>
              </div>
            ))}
            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              ⚠️ Điểm quy tắc đơn giản trên số liệu {fin.status === 'demo' ? 'mẫu' : fin.status === 'manual' ? 'người học nhập' : 'theo nguồn'} — chỉ để học cách đọc, cần kiểm tra thêm BCTC thật trước mọi quyết định.
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
