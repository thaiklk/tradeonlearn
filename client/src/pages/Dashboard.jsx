import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../api.js'
import { usePolling, useApi, useQuoteStream } from '../hooks.js'
import { fmtPct, fmtPrice, fmtMoney, timeAgo } from '../format.js'
import StockSearch from '../components/StockSearch.jsx'
import AnalysisCharts from '../components/PriceCharts.jsx'
import ExplainableValue from '../components/ExplainableValue.jsx'
import { ErrorBoundary } from '../App.jsx'

// Đường sparkline SVG nhẹ từ chuỗi giá đóng cửa
function Sparkline({ symbol, range = '6mo' }) {
  const { data } = useApi(() => api.priceHistory(symbol, range).catch(() => null), [symbol, range])
  if (!data?.candles?.length) return <div style={{ height: 38 }} />
  const closes = data.candles.map((c) => c.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const span = max - min || 1
  const w = 220
  const h = 38
  const pts = closes.map((v, i) => `${(i / (closes.length - 1)) * w},${h - 4 - ((v - min) / span) * (h - 8)}`)
  const up = closes[closes.length - 1] >= closes[0]
  const color = up ? '#22c55e' : '#ef4444'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 38, display: 'block', marginTop: 4 }}>
      <polygon points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill={color} opacity="0.12" />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  )
}

// "Chỉ số này là gì?" — giải thích cho người chưa biết gì (bấm ℹ️ trên từng thẻ)
const INDEX_INFO = {
  'S&P 500': 'Rổ 500 công ty lớn nhất nước Mỹ — "nhiệt kế" được nhìn nhiều nhất của thị trường Mỹ. Nó giảm = đa số cổ phiếu Mỹ đang giảm.',
  NASDAQ: 'Chỉ số của sàn Nasdaq — nơi niêm yết các công ty công nghệ (Apple, Microsoft...). Nên nó phản ánh "sức khỏe" của nhóm công nghệ.',
  DOW: 'Dow Jones — 30 công ty lớn, lâu đời nhất nước Mỹ. Ít mã hơn S&P 500 nên mỗi mã ảnh hưởng mạnh hơn.',
  'VN-Index': 'TẤT CẢ cổ phiếu niêm yết trên sàn TP.HCM (HOSE) — "nhiệt kế" của thị trường Việt Nam. Trên 1.000 điểm hay xuất hiện trên báo chí.',
  VN30: 'Rổ 30 cổ phiếu lớn nhất và được giao dịch nhiều nhất HOSE — bản "rút gọn chất lượng" của VN-Index.',
  'HNX-Index': 'Chỉ số của sàn Hà Nội (HNX) — nơi các công ty thường nhỏ hơn HOSE. Hai sàn này cùng tạo nên thị trường chứng khoán Việt Nam.',
}

function IndexCard({ name, symbol, price, changePercent, market }) {
  const cls = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'muted-c'
  const [info, setInfo] = useState(false)
  return (
    <div className="card idx-card" style={{ textDecoration: 'none' }}>
      <span className="idx-name">
        <Link to={`/stock/${symbol}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {name}
        </Link>{' '}
        {market === 'VN' ? <span className="badge vn">VN</span> : <span className="badge us">US</span>}
        <button className="btn sm ghost" style={{ padding: '0 6px', marginLeft: 4, fontSize: 11 }} onClick={() => setInfo(!info)} title="Chỉ số này là gì?">
          {info ? '✕' : 'ℹ️'}
        </button>
      </span>
      {info && <div className="muted" style={{ fontSize: 11.5, margin: '4px 0' }}>{INDEX_INFO[name] || 'Chỉ số thị trường — giỏ cổ phiếu tiêu biểu dùng đo sức khỏe cả thị trường.'}</div>}
      <ExplainableValue
        metricKey="indexPoints"
        value={price != null ? price.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '—'}
        ctx={{ source: 'Chỉ số thị trường', period: 'Phiên hiện tại' }}
        className={`idx-value num ${cls}`}
      />
      <ExplainableValue
        metricKey="changePercent"
        value={`${changePercent > 0 ? '▲' : changePercent < 0 ? '▼' : '•'} ${fmtPct(changePercent)}`}
        ctx={{ source: 'Chỉ số thị trường', period: 'So với phiên trước' }}
        className={`idx-sub num ${cls}`}
      />
      <Sparkline symbol={symbol} />
    </div>
  )
}

// Biểu đồ chứng khoán nhanh ngay tại trang chủ — bấm nến để học đọc
function QuickChart() {
  const chips = [
    { symbol: 'AAPL', market: 'US' }, { symbol: 'NVDA', market: 'US' }, { symbol: 'TSLA', market: 'US' },
    { symbol: 'MSFT', market: 'US' }, { symbol: 'VNM', market: 'VN' }, { symbol: 'FPT', market: 'VN' },
    { symbol: 'HPG', market: 'VN' }, { symbol: 'VIC', market: 'VN' },
    { symbol: '^GSPC', market: 'US' }, { symbol: 'VNINDEX', market: 'VN' },
  ]
  const [symbol, setSymbol] = useState('AAPL')
  const [toggles, setToggles] = useState({ ma20: true, ma50: false, ma200: false, bb: false })
  const { data } = useApi(() => api.analysis(symbol, '6mo'), [symbol])
  const { quotes } = useQuoteStream([symbol])
  const q = quotes[symbol.toUpperCase()]

  return (
    <div className="card">
      <div className="card-title">
        <span>🕯️ Biểu đồ chứng khoán nhanh</span>
        <Link to={`/stock/${symbol}`} style={{ fontSize: 11, textTransform: 'none' }}>
          Phân tích đầy đủ →
        </Link>
      </div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 8 }}>
        💡 Mỗi cây nến = 1 ngày giao dịch: <span className="up">xanh = đóng cao hơn mở (người mua thắng)</span>, <span className="down">đỏ = ngược lại</span> · cột dưới = khối lượng cp đổi chủ · <b>bấm vào bất kỳ cây nến để học cách đọc nó</b>
      </div>
      <div className="chart-legend" style={{ marginBottom: 12 }}>
        {chips.map((c) => (
          <button
            key={c.symbol}
            className={`btn sm ${symbol === c.symbol ? 'active' : ''}`}
            onClick={() => setSymbol(c.symbol)}
          >
            {c.symbol.replace('^', '')}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {[
          ['ma20', 'MA20'],
          ['ma50', 'MA50'],
          ['ma200', 'MA200'],
          ['bb', 'BB'],
        ].map(([k, label]) => (
          <button key={k} className={`btn sm ${toggles[k] ? 'active' : ''}`} onClick={() => setToggles((t) => ({ ...t, [k]: !t[k] }))}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <span>
          <b style={{ fontSize: 17 }}>{data?.name || symbol}</b>{' '}
          <span className={`badge ${data?.market === 'VN' ? 'vn' : 'us'}`}>{data?.market || ''}</span>
        </span>
        <span className={`num ${(q?.changePercent ?? data?.quote?.changePercent) >= 0 ? 'up' : 'down'}`} style={{ fontWeight: 800 }}>
          <ExplainableValue metricKey="price" value={fmtPrice(q?.price ?? data?.quote?.price, data?.currency)} ctx={{ symbol, source: q ? 'Luồng giá cập nhật' : 'Dữ liệu biểu đồ' }} />
          {' '}(
          <ExplainableValue metricKey="changePercent" value={fmtPct(q?.changePercent ?? data?.quote?.changePercent)} ctx={{ symbol, period: 'So với phiên trước' }} />
          )
        </span>
      </div>
      {data ? (
        <ErrorBoundary>
          <AnalysisCharts
            candles={data.candles}
            series={data.series}
            toggles={toggles}
            ranges={{ intraday: false }}
            symbol={symbol}
            market={data.market}
            currency={data.currency}
            compact
            live={q}
          />
        </ErrorBoundary>
      ) : (
        <div className="spinner" />
      )}
    </div>
  )
}

function WatchlistTable() {
  const { data: watch, refresh } = usePolling(() => api.watchlist(), 10000)
  const navigate = useNavigate()

  const remove = async (symbol) => {
    await api.removeWatch(symbol)
    refresh()
  }

  const add = async (it) => {
    await api.addWatch(it.symbol, it.name)
    refresh()
  }

  return (
    <div className="card">
      <div className="card-title">
        <span>⭐ Danh sách theo dõi</span>
        <span style={{ fontSize: 11, textTransform: 'none' }}>tự cập nhật mỗi 10 giây</span>
      </div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 8 }}>
        💡 Danh sách những mã bạn quan tâm · % = thay đổi giá so với đóng cửa hôm trước · bấm mã để mở trang phân tích
      </div>
      <div style={{ marginBottom: 12 }}>
        <StockSearch placeholder="🔍 Tìm mã để THÊM vào danh sách (AAPL, VNM...)" onPick={add} />
      </div>
      {!watch ? (
        <div className="spinner" />
      ) : watch.length === 0 ? (
        <div className="empty">
          Chưa có mã nào. Tìm một mã (VD: <b>AAPL</b>, <b>VNM</b>, <b>FPT</b>...) rồi mở trang chi tiết và bấm ⭐ để thêm
          vào đây.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Mã</th>
              <th className="right">Giá</th>
              <th className="right">%</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {watch.map((w) => (
              <tr key={w.symbol} className="clickable" onClick={() => navigate(`/stock/${w.symbol}`)}>
                <td>
                  <b>{w.symbol}</b> <span className={`badge ${w.market === 'VN' ? 'vn' : 'us'}`}>{w.market}</span>
                  <div className="muted" style={{ fontSize: 12 }}>{w.name}</div>
                </td>
                <td className={`right num ${w.changePercent > 0 ? 'up' : w.changePercent < 0 ? 'down' : ''}`}>
                  {fmtPrice(w.price, w.currency)}
                </td>
                <td className={`right num ${w.changePercent > 0 ? 'up' : w.changePercent < 0 ? 'down' : ''}`}>
                  {fmtPct(w.changePercent)}
                </td>
                <td className="right">
                  <button
                    className="btn sm ghost"
                    title="Xóa khỏi danh sách"
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(w.symbol)
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function MoverList({ title, emoji, items }) {
  return (
    <div className="card">
      <div className="card-title">{emoji} {title}</div>
      <div className="muted" style={{ fontSize: 11.5, marginBottom: 6 }}>% = hôm nay · chỉ là nơi TÌM ý tưởng, không phải gợi ý mua</div>
      {(!items || items.length === 0) && <div className="empty">Đang tải...</div>}
      {items?.slice(0, 5).map((m) => (
        <Link key={m.market + m.symbol} to={`/stock/${m.symbol}`} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid var(--border-soft)' }}>
            <span>
              <b>{m.symbol}</b> <span className={`badge ${m.market === 'VN' ? 'vn' : 'us'}`}>{m.market}</span>
            </span>
            <span className={`num ${m.changePercent > 0 ? 'up' : 'down'}`}>{fmtPct(m.changePercent)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { data: overview } = usePolling(() => api.overview(), 30000)
  const { data: account } = usePolling(() => api.account(), 30000)
  const { data: progress } = useApi(() => api.progress(), [])
  const { data: news } = useApi(() => api.news('vn'), [])
  const { data: desk } = useApi(() => api.tasks(), [])

  const indexes = overview ? [...(overview.usIndexes || []), ...(overview.vnIndexes || [])] : []
  const nextTask = (desk?.tasks || []).find((t) => !t.progress?.done) || null

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* 🎯 HERO: định hướng người mới — phân tích doanh nghiệp TRƯỚC, thị trường sau */}
      <div className="card hero-card" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #4f8cff44' }}>
        <div style={{ flex: 2, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>🎯 Phân tích doanh nghiệp đầu tiên — 15 phút</h1>
          <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>
            Quy trình của một nhà phân tích, từng bước nhỏ:
            <b> mô hình kinh doanh → tăng trưởng → biên lợi nhuận → nợ → dòng tiền → định giá → rủi ro</b>.
            Không cần biết trước gì — sếp sẽ giao việc và hướng dẫn từng bước.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <Link to="/start" className="btn primary">▶ Bắt đầu phân tích doanh nghiệp (15 phút)</Link>
            <Link to="/corporate-finance" className="btn">💼 Học tài chính doanh nghiệp để đi làm</Link>
            {nextTask ? (
              <Link to={`/desk/${nextTask.id}`} className="btn">
                Task tiếp: {nextTask.title.split('·')[1]?.trim() || nextTask.title} (+{nextTask.xp} XP)
              </Link>
            ) : (
              <Link to="/desk" className="btn">💼 Phòng phân tích</Link>
            )}
            <Link to="/stock/FPT" className="btn ghost">Xem mẫu: doanh nghiệp FPT 🇻🇳</Link>
          </div>
        </div>
        {progress && (
          <div style={{ textAlign: 'center', minWidth: 180 }}>
            <div className="muted" style={{ fontSize: 12 }}>TIẾN ĐỘ CỦA BẠN</div>
            <div className="big num">{progress.lessonsRead}/{progress.lessonsTotal} bài</div>
            <div className="muted num" style={{ fontSize: 13 }}>
              {desk ? `${desk.tasks.filter((t) => t.progress?.done).length}/${desk.tasks.length} task · ${desk.xp} XP · ${desk.rank.name}` : ''}
            </div>
          </div>
        )}
      </div>

      {/* Chào mừng + ví */}
      <div className="card" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Xin chào người học đầu tư 👋</h1>
          <p className="muted" style={{ margin: '6px 0 0', maxWidth: 640 }}>
            Chào mừng đến <b>TradeLearn</b> — nơi bạn học phân tích tài chính bằng dữ liệu gần thời gian thực của thị
            trường Mỹ & Việt Nam, luyện tay bằng ví tiền ảo. Mới bắt đầu? Mở <Link to="/guide">📖 Hướng dẫn sử dụng</Link> hoặc vào <Link to="/learn">Khóa học 15 bài</Link> ngay.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
          <div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>VÍ GIẢ LẬP USD</div>
            <div className="big num">{account ? <ExplainableValue metricKey="portfolioValue" value={fmtMoney(account.totalUsd)} ctx={{ source: 'Ví giả lập', currency: 'USD' }} /> : '...'}</div>
            <div className={`num ${account?.profitUsd >= 0 ? 'up' : 'down'}`} style={{ fontSize: 13 }}>
              {account ? <><ExplainableValue metricKey="pnl" value={fmtMoney(account.profitUsd)} ctx={{ source: 'Ví giả lập', currency: 'USD' }} /> ({fmtPct(account.profitUsdPercent)})</> : ''}
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>💵 Tiền ẢO để luyện — không phải tiền thật</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>VÍ GIẢ LẬP VND</div>
            <div className="big num">{account ? <ExplainableValue metricKey="portfolioValue" value={fmtMoney(account.totalVnd, 'VND')} ctx={{ source: 'Ví giả lập', currency: 'VND' }} /> : '...'}</div>
            <div className={`num ${account?.profitVnd >= 0 ? 'up' : 'down'}`} style={{ fontSize: 13 }}>
              {account ? <><ExplainableValue metricKey="pnl" value={fmtMoney(account.profitVnd, 'VND')} ctx={{ source: 'Ví giả lập', currency: 'VND' }} /> ({fmtPct(account.profitVndPercent)})</> : ''}
            </div>
          </div>
          <Link to="/trading" className="btn primary">Mua/Bán giả lập →</Link>
        </div>
      </div>

      {/* Chỉ số — kèm chú giải cho người mới */}
      <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>
        📊 <b>Chỉ số</b> là "nhiệt kế" của cả thị trường (mỗi thẻ = 1 giỏ cổ phiếu tiêu biểu) · ▲ <span className="up">xanh = tăng</span>, ▼ <span className="down">đỏ = giảm</span> so với đóng cửa hôm trước · bấm ℹ️ để xem từng chỉ số là gì
      </div>
      <div className="grid cols-3">
        {indexes.length === 0 && <div className="card"><div className="spinner" /></div>}
        {indexes.map((idx) => (
          <IndexCard
            key={idx.market + idx.symbol}
            name={idx.displaySymbol || idx.name}
            symbol={idx.symbol}
            price={idx.price}
            changePercent={idx.changePercent}
            market={idx.market}
          />
        ))}
      </div>

      {/* Biểu đồ nhanh trên trang chủ */}
      <QuickChart />

      {/* Watchlist + biến động */}
      <div className="grid cols-2">
        <WatchlistTable />
        <div className="grid" style={{ gap: 16 }}>
          <MoverList title="Tăng mạnh nhất" emoji="🚀" items={overview?.gainers} />
          <MoverList title="Giảm mạnh nhất" emoji="🩸" items={overview?.losers} />
        </div>
      </div>

      {/* Tiến độ học + tin tức */}
      <div className="grid cols-2">
        <div className="card">
          <div className="card-title">🎓 Tiến độ học của bạn</div>
          {progress ? (
            <>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div className="muted" style={{ fontSize: 12 }}>Đã đọc</div>
                  <div className="big num">{progress.lessonsRead}/{progress.lessonsTotal}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 12 }}>Đầu ra đã nộp</div>
                  <div className="big num">{progress.practicesDone}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 12 }}>Bản nháp</div>
                  <div className="big num">{progress.practicesDraft}</div>
                </div>
              </div>
              <Link to="/learn" className="btn" style={{ marginTop: 14 }}>Tiếp tục học →</Link>
              <div style={{ marginTop: 10, borderTop: '1px solid var(--border-soft)', paddingTop: 10 }}>
                <span className="muted" style={{ fontSize: 12.5 }}>
                  💼 Phòng phân tích: làm task như đi làm thật
                </span>
                <div>
                  <Link to="/desk" className="btn sm" style={{ marginTop: 6 }}>Vào làm việc →</Link>
                </div>
              </div>
            </>
          ) : (
            <div className="spinner" />
          )}
        </div>
        <div className="card">
          <div className="card-title">
            <span>📰 Tin tức thị trường</span>
            <Link to="/news" style={{ fontSize: 11, textTransform: 'none' }}>Xem tất cả →</Link>
          </div>
          {(news?.items || []).slice(0, 6).map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="news-item">
              <span className="news-title">{n.title}</span>
              <span className="news-meta">{n.source} · {timeAgo(n.pubDate)}</span>
            </a>
          ))}
          {news && news.items.length === 0 && <div className="empty">{news.error || 'Chưa có tin'}</div>}
        </div>
      </div>
    </div>
  )
}
