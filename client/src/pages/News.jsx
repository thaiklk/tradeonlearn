import { useState } from 'react'
import { api } from '../api.js'
import { useApi } from '../hooks.js'
import { timeAgo } from '../format.js'

export default function News() {
  const [market, setMarket] = useState('vn')
  const { data, loading } = useApi(() => api.news(market), [market])

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 23 }}>📰 Tin tức thị trường</h1>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
              Tổng hợp từ Google News (2 ngày qua). Đọc tin để nắm bối cảnh — nhưng nhớ Bài 15: quyết định mua/bán theo
              quy trình, không theo tít báo.
            </p>
          </div>
          <div className="range-tabs">
            <button className={`btn ${market === 'vn' ? 'active' : ''}`} onClick={() => setMarket('vn')}>
              🇻🇳 Việt Nam
            </button>
            <button className={`btn ${market === 'us' ? 'active' : ''}`} onClick={() => setMarket('us')}>
              🇺🇸 Quốc tế / Mỹ
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="spinner" />}
      {data?.error && <div className="error-box">{data.error}</div>}

      <div className="card">
        {(data?.items || []).map((n, i) => (
          <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="news-item">
            <span className="news-title">{n.title}</span>
            <span className="news-meta">
              {n.source} · {timeAgo(n.pubDate)}
            </span>
          </a>
        ))}
        {data && !data.error && data.items.length === 0 && <div className="empty">Chưa có tin mới.</div>}
      </div>
    </div>
  )
}
