import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

// Luồng học tập dẫn dắt lần đầu — 8 bước nhỏ, thử TRẢ LỜI trước rồi mới xem đáp án
const BUSINESS = {
  FPT: 'FPT bán dịch vụ viết phần mềm (xuất khẩu IT), giải pháp số và máy tính — quen thuộc với sinh viên Việt Nam, báo cáo dễ tra trên cafef.',
  AAPL: 'Apple bán iPhone, máy tính và dịch vụ số (App Store, iCloud) — sản phẩm ai cũng biết, dễ hình dung "tiền đến từ đâu".',
}
const last = (a) => (a?.length ? a[a.length - 1] : null)

export default function StartTour() {
  const [symbol, setSymbol] = useState(null)
  const { data: fin } = useApi(() => (symbol ? api.get(`/stocks/${encodeURIComponent(symbol)}/financials`) : Promise.resolve(null)), [symbol])
  const [step, setStep] = useState(0)
  const [pick, setPick] = useState(null)
  const [checked, setChecked] = useState(false)

  const r = fin?.rows, q = fin?.ratios
  const unit = fin?.unit || ''
  const eps = last(r?.eps)
  const STEPS = symbol && fin?.years ? [
    { t: 'Bước 1/8 · Doanh nghiệp này bán gì?', goal: 'Mô hình kinh doanh', body: BUSINESS[symbol] || '', ex: null,
      quiz: { q: 'Khi bạn mua 1 cổ phiếu, bạn thực sự đang làm gì?', opts: ['Cho công ty vay tiền', 'Sở hữu một phần rất nhỏ của công ty', 'Cược may rủi'], ans: 1, why: 'Cổ phiếu = chứng nhận sở hữu. Cho vay là trái phiếu — khác hẳn.', hint: 'Nhớ Bài 1: sở hữu, không phải cho vay.' } },
    { t: 'Bước 2/8 · Doanh thu', goal: 'Hiểu quy mô', body: `Năm gần nhất ${symbol} bán được ${last(r.revenue)?.toLocaleString('vi-VN')} ${unit} hàng hóa/dịch vụ — đó là DOANH THU.`, ex: `Bán 1 triệu sp × 50.000₫ = 50 ${unit}`,
      quiz: { q: `Doanh thu ${last(r.revenue)} nghĩa là công ty đã...`, opts: ['Thu được đủ tiền mặt', 'Bán được giá trị đó (có thể chưa thu tiền)', 'Lãi chừng đó'], ans: 1, why: 'Doanh thu là giá trị đã BÁN — tiền có thể chưa về (bán chịu). Vì vậy phải đọc kèm dòng tiền ở Bước 6.', hint: 'Bán ≠ thu tiền.' } },
    { t: 'Bước 3/8 · Lợi nhuận ròng', goal: 'Phần "kiếm được thật" theo sổ sách', body: `Sau khi trừ mọi chi phí, ${symbol} giữ lại ${last(r.netIncome)?.toLocaleString('vi-VN')} ${unit} — gọi là LỢI NHUẬN RÒNG.`, ex: 'Doanh thu 100 − chi phí 88 = lãi 12',
      quiz: { q: 'Doanh thu 100, giá vốn + chi phí 88. Lợi nhuận ròng là bao nhiêu?', opts: ['100', '88', '12'], ans: 2, why: '100 − 88 = 12. Đơn giản vậy — mọi chỉ số lợi nhuận đều từ phép trừ này mà ra.', hint: 'Phần CÒN LẠI sau chi phí.' } },
    { t: 'Bước 4/8 · Biên lợi nhuận', goal: 'Chất lượng mỗi đồng bán ra', body: `Biên ròng của ${symbol}: ${last(q.netMargin)}% — mỗi 100 đồng doanh thu giữ lại ${last(q.netMargin)} đồng.`, ex: 'Lãi 12 / doanh thu 100 = biên 12%',
      quiz: { q: `Biên ròng ${symbol} là ${last(q.netMargin)}%. Điều này nghĩa là mỗi 100đ doanh thu...`, opts: [`giữ lại ${last(q.netMargin)}đ lãi`, 'chi hết ${x}đ', 'thu 100đ tiền mặt'], ans: 0, why: 'Biên = phần giữ lại trên mỗi đồng doanh thu. >10% thường xem là khá (tùy ngành).', hint: 'Chia lãi cho doanh thu.' } },
    { t: 'Bước 5/8 · Tài sản & nợ', goal: 'Bức ảnh sức mạnh tài chính', body: `Tài sản ${last(r.totalAssets)?.toLocaleString('vi-VN')} = Nợ ${last(r.totalLiabilities)?.toLocaleString('vi-VN')} + Vốn chủ ${last(r.equity)?.toLocaleString('vi-VN')} ${unit}. Phần THẬT của chủ sở hữu là Vốn chủ.`, ex: 'Xe 100 = nợ 40 + vốn thật 60',
      quiz: { q: `Nợ/Vốn của ${symbol} ≈ ${last(q.debtToEquity)}%. Nhận định đúng:`, opts: ['Nợ nhẹ hơn vốn → gánh trả nợ tương đối dễ', 'Sắp phá sản', 'Không có ý nghĩa gì'], ans: 0, why: `Dưới 100% nghĩa là nợ nhỏ hơn vốn chủ. (Số liệu ${fin.status === 'demo' ? 'mẫu giáo dục' : fin.status}).`, hint: 'So nợ với vốn, không nhìn tổng tài sản.' } },
    { t: 'Bước 6/8 · Dòng tiền (quan trọng nhất!)', goal: 'Lợi nhuận có thành TIỀN không', body: `OCF (tiền thật từ kinh doanh) ${last(r.ocf)?.toLocaleString('vi-VN')} ${unit} so với lợi nhuận ${last(r.netIncome)?.toLocaleString('vi-VN')} → tỷ lệ ${last(q.ocfToNi)}%.`, ex: 'Lãi 12 nhưng OCF 3 → "lợi nhuận trên giấy"',
      quiz: { q: `OCF/LN của ${symbol} = ${last(q.ocfToNi)}%. Kết luận thận trọng:`, opts: [`≥80% — lợi nhuận khá "thật"`, 'Công ty giàu ngay lập tức', 'Sai số kế toán'], ans: 0, why: '≥80% nhiều năm = lợi nhuận chuyển thành tiền tốt. <50% kéo dài = cần hỏi sâu (Bài 11).', hint: 'Đây là bộ lọc số 1 của analyst.' } },
    { t: 'Bước 7/8 · Định giá (P/E)', goal: 'Giá đang đắt hay rẻ — THEO GIẢ ĐỊNH', body: `P/E = Giá cổ phiếu ÷ EPS. EPS của ${symbol} ≈ ${eps}. Mở trang /stock/${symbol} nhìn giá hiện tại, TỰ CHIA cho ${eps} — đó là P/E bạn vừa tự tính!`, ex: 'Giá 300 ÷ EPS 8.5 = P/E 35',
      quiz: { q: 'P/E 35 nghĩa là gì?', opts: ['Chắc chắn đắt', 'Trả 35 đồng cho mỗi 1 đồng lợi nhuận/năm — phải so ngành & lịch sử mới nói đắt/rẻ', 'Lãi 35%'], ans: 1, why: 'P/E chỉ có nghĩa khi so sánh: cùng ngành, chính nó năm trước, và tốc độ tăng trưởng (Bài 12).', hint: 'Không kết luận từ 1 con số.' } },
    { t: 'Bước 8/8 · Rủi ro & kết thúc', goal: 'Nghĩ như analyst', body: 'Mọi phân tích đều cần điều kiện "TÔI SẼ SAI NẾU..." — viết trước, giữ kỷ luật sau. Bạn vừa đi đủ: mô hình → doanh thu → lợi nhuận → biên → nợ → dòng tiền → định giá → rủi ro!', ex: null,
      quiz: { q: 'Điều nào KHÔNG nên làm khi phân tích?', opts: ['Viết điều kiện dừng trước khi mua', 'Kết luận từ 1 chỉ số 1 năm', 'So sánh với đối thủ cùng ngành'], ans: 1, why: 'Một chỉ số một năm không đủ — luôn cần xu hướng + so sánh + dòng tiền.', hint: 'Tính hệ thống, không phán đoán đơn lẻ.' } },
  ] : []

  // P/E live cho bước 7
  const s = STEPS[Math.min(step, Math.max(STEPS.length - 1, 0))]

  if (!symbol)
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>🎯 Bắt đầu phân tích doanh nghiệp đầu tiên</h1>
        <p className="muted" style={{ fontSize: 13.5 }}>Chọn 1 công ty mẫu — mình chọn 2 mã quen thuộc nhất để bạn tập trung HỌC CÁCH PHÂN TÍCH chứ không phải tìm hiểu doanh nghiệp lạ:</p>
        <div className="grid cols-2" style={{ marginTop: 12 }}>
          {[['FPT', '🇻🇳', 'Công ty IT Việt Nam — báo cáo dễ tra tiếng Việt trên cafef'], ['AAPL', '🇺🇸', 'Apple — sản phẩm ai cũng biết, dễ hình dung tiền đến từ đâu']].map(([sym, flag, why]) => (
            <button key={sym} className="card" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => setSymbol(sym)}>
              <div style={{ fontSize: 22 }}>{flag} <b style={{ fontSize: 18 }}>{sym}</b></div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{why}</div>
              <div className="btn sm primary" style={{ marginTop: 10 }}>Chọn {sym} →</div>
            </button>
          ))}
        </div>
      </div>
    )

  if (!s) return <div className="spinner" />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="muted"><Link to="/">← Trang chủ</Link> · {symbol}</div>
      <div style={{ height: 8, background: '#ffffff12', borderRadius: 99, margin: '10px 0 14px', overflow: 'hidden' }}>
        <div style={{ width: `${((step + 1) / STEPS.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--green))', transition: 'width .3s' }} />
      </div>
      <div className="card">
        <div className="card-title"><span>{s.t}</span><span className="badge us">🎯 {s.goal}</span></div>
        <p style={{ margin: '0 0 8px', fontSize: 14.5 }}>{s.body}</p>
        {s.ex && <div className="tip-box" style={{ margin: '8px 0' }}>📐 <b>Ví dụ dễ tính:</b> {s.ex}</div>}
        <div className="quiz-q" style={{ marginTop: 10, marginBottom: 0 }}>
          <div className="q-text">❓ {s.quiz.q}</div>
          {s.quiz.opts.map((o, i) => {
            let cls = 'opt'
            if (!checked && pick === i) cls += ' selected'
            if (checked) { if (i === s.quiz.ans) cls += ' correct'; else if (i === pick) cls += ' wrong' }
            return <div key={i} className={cls} onClick={() => !checked && setPick(i)}><span className="letter">{String.fromCharCode(65 + i)}.</span><span>{o}</span></div>
          })}
          {!checked ? (
            <button className="btn primary" style={{ width: '100%', marginTop: 6 }} disabled={pick == null} onClick={() => setChecked(true)}>Kiểm tra đáp án</button>
          ) : (
            <>
              <div className={`quiz-result ${pick === s.quiz.ans ? 'pass' : 'fail'}`}>{pick === s.quiz.ans ? '✅ Chính xác!' : '💡 Chưa đúng — đọc giải thích:'}</div>
              <div className="explain">{s.quiz.why}{pick !== s.quiz.ans && ` (Gợi ý: ${s.quiz.hint})`}</div>
              <button className="btn primary" style={{ width: '100%', marginTop: 8 }} onClick={() => { setPick(null); setChecked(false); setStep(step + 1) }}>
                {step === STEPS.length - 1 ? '🏁 Hoàn thành!' : 'Bước tiếp theo →'}
              </button>
            </>
          )}
        </div>
      </div>
      {step >= STEPS.length && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">🎓 Bạn đã đi hết hành trình phân tích đầu tiên!</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn primary" to={`/stock/${symbol}`}>Xem trang {symbol} đầy đủ →</Link>
            <Link className="btn" to="/desk/morning-brief">Nhận task đầu tiên từ sếp →</Link>
            <Link className="btn ghost" to={`/health-check/${symbol}`}>Làm Health Check 6 bước →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
