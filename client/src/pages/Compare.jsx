import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'
import ExplainableValue from '../components/ExplainableValue.jsx'

// Phase 5 — So sánh 3-5 doanh nghiệp + median + 7 red-flags rule-based
const AVAILABLE = ['AAPL', 'MSFT', 'KO', 'FPT', 'VNM']
const METRICS = [
  ['P/E (giá/EPS)', 'pe'], ['P/B', 'pb'], ['ROE', 'roe'], ['Biên ròng', 'netMargin'],
  ['Tăng trưởng doanh thu', 'revenueGrowth'], ['Nợ/Vốn chủ', 'debtToEquity'], ['OCF/Lợi nhuận ròng', 'ocfToNi'], ['FCF', 'fcf'],
]
// với các chỉ số "càng thấp càng tốt"
const LOWER_BETTER = new Set(['pe', 'pb', 'debtToEquity'])
const SEV_CLASS = { 'cao': 'red', 'trung bình': 'amber', 'thấp': 'gray' }
const PERCENT_METRICS = new Set(['roe', 'netMargin', 'revenueGrowth', 'debtToEquity', 'ocfToNi'])
const MULTIPLE_METRICS = new Set(['pe', 'pb'])

const number = (value) => (Number.isFinite(value) ? value.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '—')
const metricUnit = (key, item) => (PERCENT_METRICS.has(key) ? '%' : MULTIPLE_METRICS.has(key) ? 'lần' : key === 'fcf' ? item?.unit || 'tỷ' : '')
const metricValue = (key, value) => number(value)

function redFlagMetricKey(flag) {
  const text = `${flag.title} ${flag.evidence}`.toLowerCase()
  if (text.includes('ocf/ln')) return 'ocfToNi'
  if (text.includes('phải thu')) return 'receivables'
  if (text.includes('tồn kho')) return 'inventory'
  if (text.includes('biên lợi nhuận')) return 'netMargin'
  if (text.includes('nợ')) return 'totalLiabilities'
  if (text.includes('goodwill')) return 'goodwill'
  if (text.includes('số cổ phiếu') || text.includes('số cp')) return 'shares'
  return null
}

export default function Compare() {
  const [selected, setSelected] = useState(['AAPL', 'MSFT', 'KO'])
  const { data, loading, error } = useApi(
    () => (selected.length >= 2 ? api.get(`/stocks/peers/compare?symbols=${selected.join(',')}`) : Promise.resolve(null)),
    [selected.join(',')]
  )

  const toggle = (s) =>
    setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : cur.length >= 5 ? cur : [...cur, s]))

  const hasMixedCurrency = data?.items && new Set(data.items.map((it) => it.currency)).size > 1
  const contextFor = (key, item, medianValue) => ({
    symbol: item?.symbol,
    period: key === 'pe' || key === 'pb' ? 'FY2025 mẫu + báo giá gần nhất' : 'FY2025 (BCTC mẫu)',
    source: data?.source,
    status: 'demo',
    unit: metricUnit(key, item),
    compare: key === 'fcf' && hasMixedCurrency
      ? 'FCF của các công ty đang dùng tiền tệ khác nhau, nên không so trực tiếp với median nhóm. Hãy so FCF theo xu hướng của cùng một công ty hoặc quy đổi cùng tiền tệ trước.'
      : medianValue == null
      ? 'Chưa có đủ dữ liệu để lấy mốc trung vị của nhóm.'
      : `Median của nhóm đang chọn: ${metricValue(key, medianValue)} ${metricUnit(key, item)}. ${LOWER_BETTER.has(key) ? 'Với chỉ số này, thấp hơn median thường nhẹ hơn, nhưng vẫn phải xem lý do.' : 'Với chỉ số này, cao hơn median có thể tốt hơn, nhưng không thay thế việc đọc BCTC.'}`,
  })

  return (
    <div style={{ maxWidth: 940, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>⚖️ So sánh doanh nghiệp & Săn dấu hiệu đỏ</h1>
      <p className="muted" style={{ margin: '6px 0 14px', fontSize: 13.5 }}>
        Chọn 2–5 doanh nghiệp → so 8 chỉ số với <b>median</b> nhóm → xem <b>red-flags</b> (7 quy tắc, có mức độ & bằng chứng).
        Câu hỏi vàng: <b>"Công ty nào tốt hơn, VÌ SAO?"</b> — đừng kết luận chỉ vì 1 chỉ số đẹp.
      </p>

      {/* Chọn mã */}
      <div className="card">
        <div className="card-title">
          <span>Chọn doanh nghiệp ({selected.length}/5, tối thiểu 2)</span>
          <span className="badge demo">BCTC: DEMO DATA · Giá: LIVE</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AVAILABLE.map((s) => (
            <button key={s} className={`btn ${selected.includes(s) ? 'active' : ''}`} onClick={() => toggle(s)}>
              {selected.includes(s) ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
        {selected.length < 2 && <div className="empty">Chọn ít nhất 2 mã để bắt đầu so sánh.</div>}
      </div>

      {loading && <div className="spinner" />}
      {error && <div className="error-box">Lỗi: {error}</div>}

      {/* Bảng so sánh + median */}
      {data?.items?.length >= 2 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-title">
            <span>📊 Bảng so sánh ngang hàng</span>
            <span className="muted" style={{ fontSize: 11, textTransform: 'none' }}>
              Nguồn: {data.source} · {new Date(data.fetchedAt).toLocaleString('vi-VN')}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Chỉ số</th>
                  {data.items.map((it) => <th key={it.symbol} className="right"><Link to={`/stock/${it.symbol}`}>{it.symbol}</Link></th>)}
                  <th className="right">
                    <ExplainableValue metricKey="median" ctx={{ source: data.source, status: 'demo', period: 'FY2025 (BCTC mẫu)' }}>
                      Median nhóm ⓘ
                    </ExplainableValue>
                  </th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map(([label, key]) => (
                  <tr key={key}>
                    <td>
                      <ExplainableValue
                        metricKey={key}
                        className="muted"
                        ctx={{ source: data.source, status: 'demo', unit: metricUnit(key), period: 'FY2025 (BCTC mẫu)' }}
                      >
                        {label} ⓘ
                      </ExplainableValue>
                    </td>
                    {data.items.map((it) => {
                      const m = data.median[key]
                      const comparable = key !== 'fcf' || !hasMixedCurrency
                      const better = comparable && m != null && it[key] != null && (LOWER_BETTER.has(key) ? it[key] <= m : it[key] >= m)
                      return (
                        <td key={it.symbol} className={`right num ${comparable && m != null && it[key] != null ? (better ? 'up' : 'down') : ''}`}>
                          {it[key] != null ? (
                            <ExplainableValue
                              metricKey={key}
                              value={metricValue(key, it[key])}
                              ctx={contextFor(key, it, m)}
                            >
                              {metricValue(key, it[key])} {metricUnit(key, it)}
                            </ExplainableValue>
                          ) : '—'}
                        </td>
                      )
                    })}
                    <td className="right num">
                      {key === 'fcf' && hasMixedCurrency ? (
                        <span className="muted" title="Không cộng hoặc lấy median FCF giữa VND và USD">Khác tiền tệ</span>
                      ) : data.median[key] != null ? (
                        <ExplainableValue
                          metricKey={key}
                          value={metricValue(key, data.median[key])}
                          ctx={{
                            symbol: 'Nhóm đã chọn',
                            period: 'FY2025 (BCTC mẫu)',
                            source: data.source,
                            status: 'demo',
                            unit: metricUnit(key, data.items[0]),
                            compare: 'Median là mốc tham khảo của nhóm hiện tại, không phải chuẩn đúng/sai hay giá mục tiêu.',
                          }}
                        >
                          <b>{metricValue(key, data.median[key])} {metricUnit(key, data.items[0])}</b>
                        </ExplainableValue>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tip-box">💡 {data.question} — chỉ số xanh = đẹp hơn median, đỏ = kém hơn median (P/E, P/B, Nợ/Vốn thì thấp hơn median là tốt).</div>
          {hasMixedCurrency && <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Lưu ý: nhóm đang có cả USD và VND. Chỉ so trực tiếp các tỷ số (% và lần); FCF được giữ nguyên đơn vị từng công ty nên không có median chung.</div>}
        </div>
      )}

      {/* Red flags từng mã */}
      {data?.items?.length >= 2 && (
        <div className="grid cols-2" style={{ marginTop: 14 }}>
          {data.items.map((it) => (
            <div className="card" key={it.symbol}>
              <div className="card-title">
                <span>🚩 Red-flags: {it.symbol}</span>
                {it.redFlags.length === 0 ? (
                  <span className="badge green">✓ Không có tín hiệu</span>
                ) : (
                  <span className="badge red">{it.redFlags.length} tín hiệu</span>
                )}
              </div>
              {it.redFlags.length === 0 && (
                <div className="muted" style={{ fontSize: 13 }}>Không quy tắc nào kích hoạt trên số liệu hiện có — không có nghĩa là "an toàn tuyệt đối", chỉ là chưa có dấu hiệu trong 7 quy tắc.</div>
              )}
              {it.redFlags.map((f, i) => (
                <RedFlag key={i} flag={f} item={it} source={data.source} />
              ))}
            </div>
          ))}
        </div>
      )}

      {data && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="muted" style={{ fontSize: 12.5 }}>⚠️ {data.disclaimer}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Link className="btn sm" to="/learn/bao-cao-tai-chinh-3-luu-chuyen-tien">📖 Bài 11 · Dòng tiền</Link>
            <Link className="btn sm" to="/desk/red-flags">💼 Task 13 · Săn dấu hiệu đỏ</Link>
            <Link className="btn sm" to="/learn/chi-so-dinh-gia">📖 Bài 12 · Chỉ số định giá</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function RedFlag({ flag, item, source }) {
  const metricKey = redFlagMetricKey(flag)
  const context = metricKey ? {
    symbol: item.symbol,
    period: 'FY2025 và các kỳ gần nhất (BCTC mẫu)',
    source,
    status: 'demo',
    unit: metricUnit(metricKey, item),
    compare: flag.note,
  } : null

  return (
    <div className={`signal ${flag.severity === 'cao' ? 'bear' : 'neutral'}`} style={{ borderColor: flag.severity === 'cao' ? 'var(--red)' : flag.severity === 'trung bình' ? 'var(--amber)' : 'var(--border)' }}>
      <div className="s-title">
        <span className={`badge ${SEV_CLASS[flag.severity] || 'gray'}`}>{flag.severity}</span>
        {metricKey ? (
          <ExplainableValue metricKey={metricKey} ctx={context}>{flag.title} ⓘ</ExplainableValue>
        ) : <span>{flag.title}</span>}
      </div>
      <div className="s-detail">
        📐 Bằng chứng: {metricKey ? <ExplainableValue metricKey={metricKey} value={flag.evidence} ctx={context}>{flag.evidence} ⓘ</ExplainableValue> : flag.evidence}
      </div>
      <div className="s-detail">🔍 {flag.note}</div>
    </div>
  )
}
