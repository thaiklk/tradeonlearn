import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useDebounce } from '../hooks.js'

// Ô tìm kiếm cổ phiếu Mỹ/Việt có gợi ý
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
      setOpen(false)
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

  return (
    <div className="search-wrap" style={compact ? { maxWidth: 320, marginLeft: 'auto' } : undefined}>
      <input
        className="input"
        placeholder={placeholder || (loading ? 'Đang tìm...' : '🔍 Tìm mã cổ phiếu (AAPL, VNM, FPT...)')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => {
          if (items.length) setOpen(true)
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 180)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && items.length) pick(items[0])
        }}
      />
      {open && items.length > 0 && (
        <div className="search-drop" onMouseDown={(e) => e.preventDefault()}>
          {items.map((it) => (
            <div key={it.market + it.symbol} className="search-item" onClick={() => pick(it)}>
              <div style={{ minWidth: 0 }}>
                <div className="s">
                  {it.symbol} <span className={`badge ${it.market === 'VN' ? 'vn' : 'us'}`}>{it.market}</span>
                </div>
                <div className="n">{it.name}</div>
              </div>
              <span className="muted" style={{ fontSize: 12, flexShrink: 0 }}>
                {it.exchange}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
