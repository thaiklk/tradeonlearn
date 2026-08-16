import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

// Phase 5 — So sánh 3-5 doanh nghiệp + median + 7 red-flags rule-based
const AVAILABLE = ['AAPL', 'MSFT', 'KO', 'FPT', 'VNM']
const METRICS = [
  ['P/E (giá live/EPS)', 'pe'], ['P/B', 'pb'], ['ROE %', 'roe'], ['Biên ròng %', 'netMargin'],
  ['Tăng trưởng DT %', 'revenueGrowth'], ['Nợ/Vốn %', 'debtToEquity'], ['OCF/LN %', 'ocfToNi'], ['FCF', 'fcf'],
]
// với các chỉ số "càng thấp càng tốt"
const LOWER_BETTER = new Set(['pe', 'pb', 'debtToEquity'])
const SEV_CLASS = { 'cao': 'red', 'trung bình': 'amber', 'thấp': 'gray' }

export default function Compare() {
  const [selected, setSelected] = useState(['AAPL', 'MSFT', 'KO'])
  const { data, loading, error } = useApi(
    () => (selected.length >= 2 ? api.get(`/stocks/peers/compare?symbols=${selected.join(',')}`) : Promise.resolve(null)),
    [selected.join(',')]
  )

  const toggle = (s) =>
    setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : cur.length >= 5 ? cur : [...cur, s]))

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
                </tr>
              </thead>
              <tbody>
                {METRICS.map(([label, key]) => (
                  <tr key={key}>
                    <td className="muted">{label}</td>
                    {data.items.map((it) => {
                      const m = data.median[key]
                      const better = m != null && it[key] != null && (LOWER_BETTER.has(key) ? it[key] <= m : it[key] >= m)
                      return (
                        <td key={it.symbol} className={`right num ${m != null && it[key] != null ? (better ? 'up' : 'down') : ''}`}>
                          {it[key] != null ? it[key].toLocaleString('vi-VN') : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 560 }}>
              <tbody>
                <tr>
                  <td className="muted" style={{ minWidth: 150 }}><b>Median nhóm</b></td>
                  {METRICS.map(([label, key]) => (
                    <td key={key} className="right num"><b>{data.median[key] != null ? data.median[key].toLocaleString('vi-VN') : '—'}</b></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="tip-box">💡 {data.question} — chỉ số xanh = đẹp hơn median, đỏ = kém hơn median (P/E, P/B, Nợ/Vốn thì thấp hơn median là tốt).</div>
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
                <div key={i} className={`signal ${f.severity === 'cao' ? 'bear' : 'neutral'}`} style={{ borderColor: f.severity === 'cao' ? 'var(--red)' : f.severity === 'trung bình' ? 'var(--amber)' : 'var(--border)' }}>
                  <div className="s-title">
                    <span className={`badge ${SEV_CLASS[f.severity] || 'gray'}`}>{f.severity}</span>
                    <span>{f.title}</span>
                  </div>
                  <div className="s-detail">📐 Bằng chứng: {f.evidence}</div>
                  <div className="s-detail">🔍 {f.note}</div>
                </div>
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
