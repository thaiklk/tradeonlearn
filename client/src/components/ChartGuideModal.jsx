import { Link } from 'react-router-dom'
import { fmtCompact, fmtPrice } from '../format.js'

const KINDS = {
  candle: {
    title: 'Hướng dẫn đọc biểu đồ NẾN GIÁ & KHỐI LƯỢNG',
    lesson: { id: 'doc-hieu-bieu-do-nen', label: '📖 Bài 3 · Đọc hiểu biểu đồ nến' },
    lessons: [
      { id: 'doc-hieu-bieu-do-nen', label: 'Bài 3 · Nến Nhật' },
      { id: 'khoi-luong-xu-huong', label: 'Bài 4 · Khối lượng & xu hướng' },
      { id: 'duong-trung-binh-ma', label: 'Bài 5 · Đường MA' },
    ],
    terms: ['Nến Nhật (Candlestick)', 'Khối lượng (Volume)', 'Ria nến (Wick/Shadow)', 'Doji'],
    steps: [
      'Mỗi CÂY NẾN = 1 phiên giao dịch, chứa 4 con số: giá mở cửa, đóng cửa, cao nhất, thấp nhất.',
      'MÀU nến cho biết phe thắng: xanh = đóng cửa CAO hơn mở cửa (người mua thắng); đỏ = ngược lại.',
      'THÂN nến (phần dày) = khoảng cách mở↔đóng: thân dài = áp đảo; thân ngắn = giằng co.',
      'RIA nến (vạch mảnh) = vùng giá từng chạm nhưng bị đẩy ngược: ria dưới dài = phe mua bảo vệ đáy.',
      'CỘT KHỐI LƯỢNG dưới = "xăng" của phiên: giá tăng kèm KL lớn mới là sóng thật (Bài 4).',
    ],
  },
  rsi: {
    title: 'Hướng dẫn đọc bảng RSI (14 phiên)',
    lesson: { id: 'rsi-dong-luong', label: '📖 Bài 6 · RSI — động lượng' },
    lessons: [
      { id: 'rsi-dong-luong', label: 'Bài 6 · RSI' },
      { id: 'duong-trung-binh-ma', label: 'Bài 5 · Xác định xu hướng trước' },
    ],
    terms: ['RSI', 'Quá mua (Overbought)', 'Quá bán (Oversold)', 'Phân kỳ (Divergence)'],
    steps: [
      'RSI gộp sức mạnh các phiên tăng/giảm trong 14 phiên gần nhất thành số 0–100.',
      'Trên đường 70 = vùng QUÁ MUA (mua đã kéo dài, cẩn trọng điều chỉnh); dưới 30 = QUÁ BÁN.',
      'Quy tắc 30/70 đẹp nhất trong thị trường ĐI NGANG; trong xu hướng tăng mạnh RSI có thể "mắc kẹt" trên 70 lâu.',
      'Chỉ nên coi RSI là 1 phiếu bầu — kết hợp MA (bối cảnh) và khối lượng như mục Gợi ý của web.',
    ],
  },
  macd: {
    title: 'Hướng dẫn đọc bảng MACD (12, 26, 9)',
    lesson: { id: 'macd-hoi-tu-phan-ky', label: '📖 Bài 7 · MACD — bước ngoặt động lượng' },
    lessons: [
      { id: 'macd-hoi-tu-phan-ky', label: 'Bài 7 · MACD' },
      { id: 'rsi-dong-luong', label: 'Bài 6 · RSI để đối chiếu' },
    ],
    terms: ['MACD', 'Đường tín hiệu (Signal line)', 'Histogram', 'Phân kỳ (Divergence)'],
    steps: [
      'Đường xanh MACD = EMA(12) − EMA(26): khoảng cách 2 đường trung bình (sóng ngắn vs sóng dài).',
      'Đường vàng Signal = EMA(9) của MACD — mốc so sánh.',
      'CỘT histogram = MACD − Signal: chuyển từ âm sang dương (cột đỏ → xanh) = động lượng tăng khởi động.',
      'MACD cắt lên XUỐNG vạch 0 = xác nhận tầng trung hạn; trong thị trường đi ngang MACD sinh nhiều tín hiệu giả.',
    ],
  },
}

function fmtDate(t) {
  return new Date(t * 1000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function avg(arr, n = 20) {
  const v = arr.filter((x) => Number.isFinite(x)).slice(-n)
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null
}

// Phân tích chi tiết 1 cây nến người dùng vừa bấm
function CandleAnalysis({ candles, series, idx, currency }) {
  const c = candles[idx]
  const prev = candles[idx - 1]
  const bodies = candles.slice(Math.max(0, idx - 20), idx).map((x) => Math.abs(x.close - x.open))
  const avgBody = bodies.length ? bodies.reduce((s, x) => s + x, 0) / bodies.length : null
  const vols = candles.slice(Math.max(0, idx - 20), idx).map((x) => Number(x.volume) || 0)
  const avgVol = vols.length ? vols.reduce((s, x) => s + x, 0) / vols.length : null

  const isUp = c.close >= c.open
  const body = Math.abs(c.close - c.open)
  const upperWick = c.high - Math.max(c.open, c.close)
  const lowerWick = Math.min(c.open, c.close) - c.low
  const volRatio = avgVol ? c.volume / avgVol : null
  const rsi = series?.rsi14?.[idx]
  const hist = series?.macdHist?.[idx]
  const ma20 = series?.ma20?.[idx]
  const ma50 = series?.ma50?.[idx]
  const pct = c.open ? ((c.close - c.open) / c.open) * 100 : 0

  const notes = []
  notes.push(
    `${isUp ? '🟢 Nến TĂNG' : '🔴 Nến GIẢM'} ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}% — phe ${
      isUp ? 'mua' : 'bán'
    } thắng phiên này.`
  )
  if (avgBody && body > avgBody * 1.6)
    notes.push('Thân nến DÀI bất thường so với 20 phiên trước → một phe áp đảo rõ rệt, động lượng phiên này "thật".')
  else if (avgBody && body < avgBody * 0.4)
    notes.push(
      'Thân nến NGẮN (gần doji) → hai phe giằng co, do dự. Nếu xuất hiện sau đợt tăng/giảm dài, hay là dấu hiệu bước ngoặt (Bài 3).'
    )
  if (lowerWick > body * 1.5 && body > 0)
    notes.push('Ria dưới DÀI: giá từng bị đẩy sâu xuống nhưng phe mua kéo lên được — dấu hiệu bảo vệ vùng đáy.')
  if (upperWick > body * 1.5 && body > 0)
    notes.push('Ria trên DÀI: giá từng vượt cao nhưng bị bán trở lại — phe bán phản ứng mạnh ở vùng giá cao.')
  if (volRatio != null && volRatio > 1.8)
    notes.push(
      `Khối lượng gấp ~${volRatio.toFixed(1)} lần bình quân 20 phiên ${isUp ? 'kèm nến tăng → dòng tiền đổ vào thật (Bài 4)' : 'kèm nến giảm → áp lực bán lớn, thận trọng với tín hiệu mua ngược'}.`
    )
  else if (volRatio != null && volRatio < 0.5)
    notes.push('Khối lượng loãng (dưới nửa bình quân) → biến động phiên này thiếu "xăng", dễ là nhiễu.')
  if (prev) {
    const gap = ((c.open - prev.close) / prev.close) * 100
    if (Math.abs(gap) >= 2)
      notes.push(`Phiên mở cửa LỆCH ${gap > 0 ? 'tăng' : 'giảm'} ~${Math.abs(gap).toFixed(1)}% so với đóng cửa hôm trước (gap) — thường do tin tức qua đêm.`)
  }
  if (rsi != null)
    notes.push(
      `RSI thời điểm đó = ${rsi.toFixed(1)} ${rsi < 30 ? '(vùng QUÁ BÁN)' : rsi > 70 ? '(vùng QUÁ MUA)' : '(trung tính)'} — xem Bài 6.`
    )
  if (hist != null)
    notes.push(
      `Histogram MACD lúc đó ${hist >= 0 ? 'dương' : 'âm'} (${hist.toFixed(2)}) → động lượng ${hist >= 0 ? 'tăng' : 'giảm'} đang chiếm ưu thế (Bài 7).`
    )
  if (ma20 != null && ma50 != null)
    notes.push(
      `Giá đóng lúc đó ${c.close >= ma20 ? 'TRÊN' : 'DƯỚI'} MA20 và ${c.close >= ma50 ? 'TRÊN' : 'DƯỚI'} MA50 → vị trí trong cấu trúc xu hướng ngắn/trung hạn (Bài 5).`
    )

  return (
    <div>
      <h4 style={{ margin: '0 0 8px' }}>
        🔍 Nến bạn vừa bấm — {fmtDate(c.time)}
      </h4>
      <table className="table" style={{ marginBottom: 10 }}>
        <tbody>
          <tr>
            <td className="muted">Mở cửa</td><td className="right num">{fmtPrice(c.open, currency)}</td>
            <td className="muted">Đóng cửa</td><td className="right num"><b className={isUp ? 'up' : 'down'}>{fmtPrice(c.close, currency)}</b></td>
          </tr>
          <tr>
            <td className="muted">Cao nhất</td><td className="right num">{fmtPrice(c.high, currency)}</td>
            <td className="muted">Thấp nhất</td><td className="right num">{fmtPrice(c.low, currency)}</td>
          </tr>
          <tr>
            <td className="muted">Khối lượng</td>
            <td className="right num">{fmtCompact(c.volume)}{volRatio != null ? ` (×${volRatio.toFixed(1)} TB)` : ''}</td>
            <td className="muted">RSI lúc đó</td>
            <td className="right num">{rsi != null ? rsi.toFixed(1) : '—'}</td>
          </tr>
        </tbody>
      </table>
      <b className="muted" style={{ fontSize: 12.5 }}>Cách diễn giải nến này:</b>
      <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
        {notes.map((n, i) => (
          <li key={i} style={{ margin: '6px 0', color: '#d5dcea' }}>{n}</li>
        ))}
      </ul>
    </div>
  )
}

function PointAnalysis({ kind, series, idx, candles }) {
  if (idx == null) return null
  if (kind === 'rsi') {
    const v = series?.rsi14?.[idx]
    if (v == null) return null
    const zone = v < 30 ? 'QUÁ BÁN — áp lực bán kéo dài, khả năng hồi phục (cần xác nhận)' : v > 70 ? 'QUÁ MUA — sóng mua "nóng", cẩn trọng điều chỉnh' : 'TRUNG TÍNH — chưa có tín hiệu cực đoan'
    return (
      <div className="signal neutral" style={{ marginTop: 8 }}>
        <div className="s-title">📍 RSI ngày {fmtDate(candles[idx].time)} = {v.toFixed(1)}</div>
        <div className="s-detail">Vùng: {zone}. Nhớ bẫy số 1 (Bài 6): trong xu hướng tăng mạnh, RSI có thể ở trên 70 nhiều tuần.</div>
      </div>
    )
  }
  if (kind === 'macd') {
    const m = series?.macd?.[idx]
    const s = series?.macdSignal?.[idx]
    const h = series?.macdHist?.[idx]
    if (m == null) return null
    return (
      <div className="signal neutral" style={{ marginTop: 8 }}>
        <div className="s-title">📍 MACD ngày {fmtDate(candles[idx].time)}</div>
        <div className="s-detail">
          MACD = {m.toFixed(2)} · Signal = {s != null ? s.toFixed(2) : '—'} · Histogram ={' '}
          <b className={h >= 0 ? 'up' : 'down'}>{h != null ? h.toFixed(2) : '—'}</b> → động lượng{' '}
          {h >= 0 ? 'tăng' : 'giảm'} {h >= 0 ? 'đang trên' : 'đang dưới'} ưu thế. Histogram cụt dần = đang mất tốc (Bài 7).
        </div>
      </div>
    )
  }
  return null
}

export default function ChartGuideModal({ kind, symbol, market, currency, candles, series, idx, onClose }) {
  if (!kind) return null
  const meta = KINDS[kind]
  const lastIdx = candles ? candles.length - 1 : null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100, background: '#05070bcc', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4vh 16px', overflowY: 'auto',
      }}
    >
      <div className="card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, width: '100%', margin: 0 }}>
        <div className="card-title">
          <span>{meta.title}</span>
          <button className="btn sm ghost" onClick={onClose}>✕ Đóng</button>
        </div>

        <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
          Áp dụng cho <b style={{ color: 'var(--text)' }}>{symbol}</b>{' '}
          <span className={`badge ${market === 'VN' ? 'vn' : 'us'}`}>{market}</span> — nhưng cách đọc áp dụng cho mọi
          cổ phiếu.
        </div>

        {idx != null && candles?.[idx] && kind === 'candle' && (
          <CandleAnalysis candles={candles} series={series} idx={idx} currency={currency} />
        )}
        {idx != null && kind !== 'candle' && <PointAnalysis kind={kind} series={series} idx={idx} candles={candles} />}

        <h4 style={{ margin: '14px 0 8px' }}>📚 Cách đọc loại biểu đồ này (5 bước)</h4>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {meta.steps.map((s, i) => (
            <li key={i} style={{ margin: '7px 0', color: '#d5dcea' }}>{s}</li>
          ))}
        </ol>

        {lastIdx != null && (
          <div className="signal neutral" style={{ marginTop: 12 }}>
            <div className="s-title">📍 Giá trị MỚI NHẤT của {symbol}</div>
            <div className="s-detail">
              {kind === 'rsi' && `RSI hiện tại = ${series?.rsi14?.[lastIdx] != null ? series.rsi14[lastIdx].toFixed(1) : '—'}`}
              {kind === 'macd' &&
                `MACD = ${series?.macd?.[lastIdx]?.toFixed(2) ?? '—'} · Histogram = ${series?.macdHist?.[lastIdx]?.toFixed(2) ?? '—'}`}
              {kind === 'candle' &&
                `Giá đóng gần nhất ${fmtPrice(candles[lastIdx].close, currency)} · so sánh với nến bạn bấm ở trên để thấy diễn biến.`}
            </div>
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <b className="muted" style={{ fontSize: 12.5 }}>🎓 Kiến thức liên quan trong khóa học:</b>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
            {meta.lessons.map((l) => (
              <Link key={l.id} className="btn sm" to={`/learn/${l.id}`} onClick={onClose}>
                {l.label}
              </Link>
            ))}
          </div>
          <b className="muted" style={{ fontSize: 12.5, display: 'block', marginTop: 12 }}>🔖 Thuật ngữ:</b>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {meta.terms.map((t) => (
              <Link key={t} className="btn sm ghost" to={`/glossary?q=${encodeURIComponent(t)}`} onClick={onClose}>
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
