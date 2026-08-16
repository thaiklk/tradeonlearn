import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi, useQuoteStream } from '../hooks.js'
import { fmtCompact, fmtPct, fmtPrice, fmtMoney } from '../format.js'
import AnalysisCharts from '../components/PriceCharts.jsx'
import { ErrorBoundary } from '../App.jsx'

const RANGES = [
  { key: '1d', label: '1 ngày' },
  { key: '1mo', label: '1 tháng' },
  { key: '3mo', label: '3 tháng' },
  { key: '6mo', label: '6 tháng' },
  { key: '1y', label: '1 năm' },
  { key: '2y', label: '2 năm' },
  { key: '5y', label: '5 năm' },
]

function overallBadge(overall) {
  if (!overall) return null
  if (overall.includes('MUA')) return <span className="badge green">🟢 {overall}</span>
  if (overall.includes('BÁN')) return <span className="badge red">🔴 {overall}</span>
  return <span className="badge gray">⚪ {overall}</span>
}

function SignalCard({ signal }) {
  const icon = signal.type === 'bull' ? '🐂' : signal.type === 'bear' ? '🐻' : '⚖️'
  return (
    <div className={`signal ${signal.type}`}>
      <div className="s-title">
        <span>{icon}</span>
        <span>{signal.title}</span>
      </div>
      <div className="s-detail">{signal.detail}</div>
      <div className="s-links">
        {signal.lessonId && (
          <Link className="btn sm" to={`/learn/${signal.lessonId}`}>
            📖 Học bài liên quan
          </Link>
        )}
        {(signal.terms || []).slice(0, 3).map((t) => (
          <Link key={t} className="btn sm ghost" to={`/glossary?q=${encodeURIComponent(t)}`}>
            {t}
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatsCard({ data }) {
  const { indicators, quote, currency } = data
  const rows = [
    ['Giá hiện tại', fmtPrice(quote?.price, currency)],
    ['Thay đổi hôm nay', `${fmtPrice(quote?.change, currency)} (${fmtPct(quote?.changePercent)})`],
    ['Cao nhất phiên', fmtPrice(quote?.dayHigh, currency)],
    ['Thấp nhất phiên', fmtPrice(quote?.dayLow, currency)],
    ['Khối lượng', fmtCompact(quote?.volume)],
    ['RSI (14)', indicators?.rsi14 != null ? indicators.rsi14.toFixed(1) : '—'],
    ['MA20', fmtPrice(indicators?.ma20, currency)],
    ['MA50', fmtPrice(indicators?.ma50, currency)],
    ['MA200', fmtPrice(indicators?.ma200, currency)],
  ]
  return (
    <div className="card">
      <div className="card-title">📊 Số liệu chính</div>
      <table className="table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className="muted">{k}</td>
              <td className="right num">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FinancialsCard({ symbol }) {
  const { data: fin } = useApi(() => api.get(`/stocks/${encodeURIComponent(symbol)}/financials`), [symbol])
  if (!fin || fin.status === 'no-data' || !fin.years?.length) return null
  const isDemo = fin.status === 'demo'
  const fmt = (v) => (v == null ? '—' : Number.isFinite(v) ? v.toLocaleString('vi-VN') : '—')
  const rRows = [
    ['Doanh thu', fin.rows.revenue], ['LN gộp', fin.rows.grossProfit], ['LN hoạt động', fin.rows.operatingIncome],
    ['LN ròng', fin.rows.netIncome], ['EPS', fin.rows.eps], ['Tài sản', fin.rows.totalAssets],
    ['Nợ phải trả', fin.rows.totalLiabilities], ['Vốn chủ', fin.rows.equity], ['OCF', fin.rows.ocf],
    ['CAPEX', fin.rows.capex], ['FCF', fin.rows.fcf],
  ]
  const qRows = [
    ['Tăng trưởng DT %', fin.ratios.revenueGrowth], ['Tăng trưởng LN %', fin.ratios.netIncomeGrowth],
    ['Biên gộp %', fin.ratios.grossMargin], ['Biên hoạt động %', fin.ratios.operatingMargin], ['Biên ròng %', fin.ratios.netMargin],
    ['ROE %', fin.ratios.roe], ['ROA %', fin.ratios.roa], ['Nợ/Vốn %', fin.ratios.debtToEquity], ['OCF/LN %', fin.ratios.ocfToNi],
  ]
  return (
    <div className="card">
      <div className="card-title">
        <span>📗 Báo cáo tài chính 4 năm (chuẩn hóa)</span>
        <span className={`badge ${isDemo ? 'demo' : 'green'}`}>{isDemo ? 'DEMO DATA' : 'LIVE'}</span>
      </div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
        Nguồn: {fin.source} · Kỳ: {fin.periodEnd} · Đơn vị: {fin.unit} · Cập nhật: {new Date(fin.fetchedAt).toLocaleString('vi-VN')} —{' '}
        <Link to="/learn/bao-cao-tai-chinh-1-can-doi">học cách đọc ở Bài 9-11</Link>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 560 }}>
          <thead><tr><th>Chỉ số</th>{fin.years.map((y) => <th key={y} className="right">{y}</th>)}</tr></thead>
          <tbody>
            {rRows.map(([n, arr]) => (
              <tr key={n}><td className="muted">{n}</td>{(arr || []).map((v, i) => <td key={i} className="right num">{fmt(v)}</td>)}</tr>
            ))}
            {qRows.map(([n, arr]) => (
              <tr key={n} style={{ borderTop: '2px solid var(--border)' }}><td className="muted">{n}</td>{(arr || []).map((v, i) => (
                <td key={i} className={`right num ${v != null && n.includes('Tăng trưởng') || n.includes('ROE') || n.includes('OCF') ? (v >= 0 ? 'up' : 'down') : ''}`}>{fmt(v)}</td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        💡 Câu hỏi phân tích: doanh thu &amp; LN cùng chiều không? Biên ổn định không? OCF/LN ≥ 80% không? Nợ/Vốn xu hướng gì? — trả lời được là bạn vừa "health-check" xong 1 doanh nghiệp.
      </div>
      <Link to={`/health-check/${symbol}`} className="btn primary" style={{ marginTop: 10 }}>🩺 Chạy Health Check 15 phút (6 bước)</Link>
    </div>
  )
}

function PeersCard({ symbol }) {
  const { data: p } = useApi(() => api.get(`/stocks/${encodeURIComponent(symbol)}/peers`), [symbol])
  if (!p?.peers?.length) return null
  const rows = [['ROE %', 'roe'], ['Biên ròng %', 'netMargin'], ['Nợ/Vốn %', 'debtToEquity'], ['Tăng trưởng DT %', 'revenueGrowth'], ['OCF/LN %', 'ocfToNi']]
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-title"><span>⚖️ So sánh ngang hàng + median</span><span className="badge demo">DEMO DATA + giá live</span></div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 420 }}>
          <thead><tr><th>Mã</th>{rows.map(([n]) => <th key={n} className="right">{n}</th>)}</tr></thead>
          <tbody>
            {p.peers.map((x) => (
              <tr key={x.symbol}><td><b>{x.symbol}</b></td>{rows.map(([n, k]) => (
                <td key={k} className={`right num ${(k === 'debtToEquity') ? (x[k] <= (p.median[k] ?? 0) ? 'up' : 'down') : (x[k] >= (p.median[k] ?? 0) ? 'up' : 'down')}`}>{x[k] != null ? x[k].toLocaleString('vi-VN') : '—'}</td>
              ))}</tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--border)' }}><td className="muted"><b>Median</b></td>{rows.map(([n, k]) => <td key={k} className="right num">{p.median[k] != null ? p.median[k].toLocaleString('vi-VN') : '—'}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>💡 {p.note} · Nguồn: {p.source}</div>
    </div>
  )
}

function Fundamentals({ symbol, market }) {
  const { data: fund } = useApi(() => api.fundamentals(symbol), [symbol])

  const valueFormatters = {
    marketCap: (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} tỷ` : `$${(v / 1e6).toFixed(0)} tr`),
    freeCashflow: (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} tỷ` : `$${fmtCompact(v)}`),
    totalCash: (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} tỷ` : `$${fmtCompact(v)}`),
    totalDebt: (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} tỷ` : `$${fmtCompact(v)}`),
    targetMeanPrice: (v) => (v ? `$${v.toFixed(2)}` : '—'),
  }
  const pctKeys = new Set(['roe', 'roa', 'profitMargin', 'grossMargin', 'operatingMargin', 'revenueGrowth', 'earningsGrowth', 'dividendYield'])
  const plainKeys = new Set(['trailingPE', 'forwardPE', 'priceToBook', 'currentRatio', 'beta', 'debtToEquity', 'trailingEps'])

  const fmt = (key, v) => {
    if (v == null || !Number.isFinite(v)) return '—'
    if (valueFormatters[key]) return valueFormatters[key](v)
    if (pctKeys.has(key)) return `${v.toFixed(1)}%`
    if (plainKeys.has(key)) return v.toFixed(2)
    return String(v)
  }

  const order = [
    'marketCap', 'trailingPE', 'forwardPE', 'priceToBook', 'trailingEps',
    'roe', 'roa', 'profitMargin', 'grossMargin', 'operatingMargin',
    'revenueGrowth', 'earningsGrowth', 'debtToEquity', 'currentRatio',
    'freeCashflow', 'totalCash', 'totalDebt', 'dividendYield', 'beta',
  ]

  return (
    <div className="card">
      <div className="card-title">
        <span>🏦 Phân tích cơ bản — soi doanh nghiệp (Bài 9–12)</span>
        {fund?.available && <span className="badge us">{fund.source || 'US'}</span>}
      </div>
      {market === 'VN' && (
        <p className="muted" style={{ fontSize: 13 }}>
          {fund?.note || 'Chỉ số tài chính chi tiết của công ty Việt Nam chưa có trên nguồn dữ liệu công khai này.'}{' '}
          Hãy dùng bảng dưới như <b>trợ lý ôn tập</b>: đọc mỗi định nghĩa và tự tìm số liệu tương ứng trên cafef/vietstock
          — đó chính là bài tập của <Link to="/learn/bao-cao-tai-chinh-2-ket-qua">Bài 9–11</Link>.
        </p>
      )}
      {!fund?.available && market !== 'VN' && (
        <p className="muted" style={{ fontSize: 13 }}>{fund?.note || 'Chưa tải được chỉ số cơ bản cho mã này.'}</p>
      )}
      <div className="grid cols-3">
        {order
          .filter((k) => (fund?.available ? fund[k] != null : ['trailingPE', 'priceToBook', 'roe', 'debtToEquity', 'profitMargin', 'revenueGrowth'].includes(k)))
          .map((k) => (
            <div key={k} className="term-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span className="term-en">{fund?.explain?.[k]?.label || k}</span>
                <span className="num" style={{ fontWeight: 800, fontSize: 16 }}>{fmt(k, fund?.[k])}</span>
              </div>
              <div className="term-def">{fund?.explain?.[k]?.how}</div>
            </div>
          ))}
      </div>
      {fund?.available && fund.recommendation && (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
          Đồng thuận phân tích viên: <b>{fund.recommendation}</b>
          {fund.targetMeanPrice ? ` · Giá mục tiêu TB: $${fund.targetMeanPrice.toFixed(2)}` : ''} — chỉ tham khảo, hãy tự
          phân tích theo <Link to="/learn/chi-so-dinh-gia">Bài 12</Link>.
        </p>
      )}
    </div>
  )
}

export default function StockDetail() {
  const { symbol } = useParams()
  const [searchParams] = useSearchParams()
  const [range, setRange] = useState(searchParams.get('range') || '6mo')
  const [toggles, setToggles] = useState({ ma20: true, ma50: true, ma200: false, bb: false })
  const [inWatch, setInWatch] = useState(null)
  const navigate = useNavigate()

  const { data, loading, error } = useApi(() => api.analysis(symbol, range), [symbol, range])
  // Báo giá live qua SSE (~5s) + polling dự phòng
  const { quotes, updatedAt, live } = useQuoteStream([symbol])
  const live2 = quotes[symbol.toUpperCase()] || null

  useEffect(() => {
    api
      .watchlist()
      .then((w) => setInWatch(w.some((x) => x.symbol === symbol.toUpperCase())))
      .catch(() => {})
  }, [symbol])

  const toggleWatch = async () => {
    const sym = symbol.toUpperCase()
    if (inWatch) {
      await api.removeWatch(sym)
      setInWatch(false)
    } else {
      await api.addWatch(sym, data?.name)
      setInWatch(true)
    }
  }

  const lessonIds = useMemo(() => [...new Set((data?.signals || []).map((s) => s.lessonId).filter(Boolean))], [data])
  const relatedTerms = useMemo(
    () => [...new Set((data?.signals || []).flatMap((s) => s.terms || []))].slice(0, 10),
    [data]
  )

  const price = live2?.price ?? data?.quote?.price
  const changePct = live2?.changePercent ?? data?.quote?.changePercent
  const currency = data?.currency || live2?.currency || 'USD'

  if (loading && !data) return <div className="spinner" />
  if (error && !data)
    return (
      <div className="error-box">
        Không tải được dữ liệu cho <b>{symbol}</b>: {error}. Kiểm tra lại mã cổ phiếu hoặc thử lại sau.
      </div>
    )

  const scorePct = data ? Math.max(0, Math.min(100, 50 + data.score * 9)) : 50

  return (
    <div className="grid side">
      <div>
        {/* Header */}
        <div className="card">
          <div className="stock-head">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="stock-symbol">{symbol.toUpperCase()}</span>
                <span className={`badge ${data?.market === 'VN' ? 'vn' : 'us'}`}>{data?.market === 'VN' ? 'Việt Nam' : 'Mỹ'}</span>
                {data?.demo && <span className="badge demo">DỮ LIỆU MÔ PHỎNG</span>}
                {data?.quote?.delayed && !data?.demo && <span className="badge gray">{data.quote.delayed}</span>}
                {live ? (
                  <span className="badge green" title={updatedAt ? `Cập nhật lúc ${updatedAt.toLocaleTimeString('vi-VN')}` : ''}>
                    ● TRỰC TIẾP {updatedAt ? updatedAt.toLocaleTimeString('vi-VN') : ''}
                  </span>
                ) : (
                  <span className="badge gray">○ cập nhật định kỳ</span>
                )}
              </div>
              <div className="muted">{data?.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={`stock-price num ${changePct > 0 ? 'up' : changePct < 0 ? 'down' : ''}`}>
                {fmtPrice(price, currency)}
              </div>
              <div className={`num ${changePct > 0 ? 'up' : changePct < 0 ? 'down' : ''}`} style={{ fontWeight: 700 }}>
                {changePct > 0 ? '▲' : changePct < 0 ? '▼' : '•'} {fmtPct(changePct)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className={`btn ${inWatch ? 'active' : ''}`} onClick={toggleWatch}>
                {inWatch ? '⭐ Đang theo dõi' : '☆ Theo dõi'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn buy sm" onClick={() => navigate(`/trading?symbol=${symbol}&side=BUY`)}>
                  MUA
                </button>
                <button className="btn sell sm" onClick={() => navigate(`/trading?symbol=${symbol}&side=SELL`)}>
                  BÁN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div className="range-tabs">
              {RANGES.map((r) => (
                <button key={r.key} className={`btn sm ${range === r.key ? 'active' : ''}`} onClick={() => setRange(r.key)}>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="chart-legend">
              {[
                ['ma20', 'MA20'],
                ['ma50', 'MA50'],
                ['ma200', 'MA200'],
                ['bb', 'Bollinger'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`btn sm ${toggles[key] ? 'active' : ''}`}
                  onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {data?.candles?.length ? (
            <ErrorBoundary>
              <AnalysisCharts
                candles={data.candles}
                series={data.series}
                toggles={toggles}
                ranges={{ intraday: range === '1d' }}
                symbol={symbol.toUpperCase()}
                market={data.market}
                currency={currency}
              />
            </ErrorBoundary>
          ) : (
            <div className="empty">Không có dữ liệu nến.</div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <FinancialsCard symbol={symbol} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Fundamentals symbol={symbol} market={data?.market} />
        </div>
      </div>

      {/* Sidebar */}
      <div>
        <div className="card">
          <div className="card-title">💡 Gợi ý đầu tư (học tập)</div>
          {data && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                {overallBadge(data.overall)}
                <span className="muted num" style={{ fontSize: 12 }}>
                  Điểm tín hiệu: {data.score > 0 ? '+' : ''}
                  {data.score}
                </span>
              </div>
              <div className="score-meter">
                <div className="score-thumb" style={{ left: `${scorePct}%` }} />
              </div>
              <div className="muted" style={{ fontSize: 11.5, marginBottom: 12 }}>
                Bán ← — — — — — — — — → Mua
              </div>
              {data.signals.map((s, i) => (
                <SignalCard key={i} signal={s} />
              ))}
              <div className="tip-box" style={{ marginTop: 10 }}>
                ⚠️ {data.disclaimer}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title">🎓 Kiến thức liên quan</div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
            Các bài học gắn với các tín hiệu đang hiển thị trên biểu đồ của {symbol}:
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {lessonIds.map((id) => (
              <Link key={id} className="btn sm" to={`/learn/${id}`}>
                📖 {id === 'rsi-dong-luong' ? 'Bài 6 · RSI' : id === 'duong-trung-binh-ma' ? 'Bài 5 · MA' : id === 'macd-hoi-tu-phan-ky' ? 'Bài 7 · MACD' : id === 'bollinger-bands' ? 'Bài 8 · Bollinger' : id === 'khoi-luong-xu-huong' ? 'Bài 4 · KL & Xu hướng' : id}
              </Link>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 13, margin: '12px 0 8px' }}>Thuật ngữ xuất hiện trong gợi ý:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {relatedTerms.map((t) => (
              <Link key={t} className="btn sm ghost" to={`/glossary?q=${encodeURIComponent(t)}`}>
                {t}
              </Link>
            ))}
          </div>
        </div>

        {data && <StatsCard data={data} />}
      </div>
    </div>
  )
}
