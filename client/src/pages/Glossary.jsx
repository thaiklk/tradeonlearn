import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

export default function Glossary() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  const { data, loading } = useApi(() => api.glossary(q, category), [q, category])

  const selectCat = (c) => {
    setCategory(c === category ? '' : c)
    setSearchParams(c === category ? {} : { category: c })
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h1 style={{ margin: '0 0 4px', fontSize: 23 }}>📚 Từ điển thuật ngữ tài chính</h1>
        <p className="muted" style={{ margin: 0 }}>
          {data ? `${data.total} thuật ngữ` : '...'} — tra nhanh Anh–Việt, kèm cách đọc hiểu cho người mới. Các thuật
          ngữ cũng được liên kết trực tiếp từ phần Gợi ý đầu tư và bài học.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 240 }}
            placeholder="🔍 Tìm thuật ngữ (VD: RSI, cổ tức, P/E...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {(data?.categories || []).map((c) => (
            <button key={c} className={`btn sm ${category === c ? 'active' : ''}`} onClick={() => selectCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="spinner" />}

      <div className="grid cols-3">
        {(data?.items || []).map((t) => (
          <div key={t.term} className="term-card">
            <div className="term-en">{t.term}</div>
            <div className="term-vi">{t.vi} · {t.category}</div>
            <div className="term-def">{t.def}</div>
          </div>
        ))}
      </div>

      {data && data.items.length === 0 && !loading && (
        <div className="card">
          <div className="empty">Không tìm thấy thuật ngữ nào khớp "{q}". Thử từ khóa khác (VD: "P/E", "RSI", "dòng tiền").</div>
        </div>
      )}
    </div>
  )
}
