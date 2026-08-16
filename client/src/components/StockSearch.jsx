import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useDebounce } from '../hooks.js'

// Ô tìm kiếm cổ phiếu Mỹ/Việt có gợi ý
const STARTER_PICKS = [
  { symbol: 'FPT', name: 'Công ty CP FPT', market: 'VN', exchange: 'Mẫu cho người mới' },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', exchange: 'Mẫu cho người mới' },
]

export default function StockSearch({ compact = false, onPick, placeholder }) {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(q, 350)
  const navigate = useNavigate()
  const blurTimer = useRef(null)

  useEffect(() => {
    let alive = true
    if (!debounced.trim()) {
      setItems([])
      return
    }
    setLoading(true)
    api
      .search(debounced.trim())
      .then((res) => {
        if (!alive) return
        setItems(res)
        setOpen(true)
      })
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [debounced])

  const pick = (it) => {
    setOpen(false)
    setQ('')
    setItems([])
    if (onPick) onPick(it)
    else navigate(`/stock/${it.symbol}`)
  }

  const showingStarterPicks = !q.trim()
  const visibleItems = showingStarterPicks ? STARTER_PICKS : items

  return (
    <div className="search-wrap" style={compact ? { maxWidth: 320, marginLeft: 'auto' } : undefined}>
      <input
        className="input"
        placeholder={placeholder || (loading ? 'Đang tìm...' : '🔍 Nhập FPT rồi Enter để xem công ty mẫu')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 180)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && visibleItems.length) pick(visibleItems[0])
        }}
      />
      {open && visibleItems.length > 0 && (
        <div className="search-drop" onMouseDown={(e) => e.preventDefault()}>
          {showingStarterPicks && <div className="search-starter">Bắt đầu với công ty mẫu</div>}
          {visibleItems.map((it) => (
            <button type="button" key={it.market + it.symbol} className="search-item" onClick={() => pick(it)}>
              <div style={{ minWidth: 0 }}>
                <div className="s">
                  {it.symbol} <span className={`badge ${it.market === 'VN' ? 'vn' : 'us'}`}>{it.market}</span>
                </div>
                <div className="n">{it.name}</div>
              </div>
              <span className="muted" style={{ fontSize: 12, flexShrink: 0 }}>
                {it.exchange}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
