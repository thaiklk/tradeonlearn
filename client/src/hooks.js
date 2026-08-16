import { useCallback, useEffect, useRef, useState } from 'react'

// Fetch một lần + tự động refetch khi deps đổi
export function useApi(producer, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fn = useCallback(producer, deps)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fn()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [fn])

  return { data, loading, error, setData }
}

// Fetch + làm mới định kỳ (dùng cho báo giá "gần thời gian thực")
export function usePolling(producer, intervalMs = 15000, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const fn = useCallback(producer, deps)
  const timer = useRef(null)

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        const d = await fn()
        if (alive) {
          setData(d)
          setError(null)
        }
      } catch (e) {
        if (alive) setError(e.message)
      }
    }
    run()
    timer.current = setInterval(run, intervalMs)
    return () => {
      alive = false
      if (timer.current) clearInterval(timer.current)
    }
  }, [fn, intervalMs])

  return { data, error, refresh: () => fn().then(setData).catch(() => {}) }
}

// Debounce cho ô tìm kiếm
export function useDebounce(value, ms = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

// Live stream báo giá qua SSE (đẩy mỗi ~5s) + polling dự phòng 15s.
// Trả về { quotes: {SYMBOL: quote}, updatedAt, live: boolean }
export function useQuoteStream(symbols) {
  const key = (symbols || []).filter(Boolean).join(',').toUpperCase()
  const [quotes, setQuotes] = useState({})
  const [updatedAt, setUpdatedAt] = useState(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!key) return
    let alive = true
    const apply = (list, t) => {
      const m = {}
      ;(list || []).forEach((q) => {
        if (q?.symbol) m[q.symbol.toUpperCase()] = q
      })
      if (!alive) return
      setQuotes((prev) => ({ ...prev, ...m }))
      setUpdatedAt(new Date(t || Date.now()))
    }

    // 1) SSE — cập nhật gần thời gian thực
    let es = null
    try {
      es = new EventSource(`/api/stream/quotes?symbols=${encodeURIComponent(key)}`)
      es.onopen = () => alive && setLive(true)
      es.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data)
          apply(d.quotes, d.t)
        } catch {
          /* bỏ qua gói lỗi */
        }
      }
      es.onerror = () => {
        if (alive) setLive(false)
        // EventSource tự kết nối lại; polling bên dưới là dự phòng
      }
    } catch {
      setLive(false)
    }

    // 2) Polling dự phòng (rẻ, có cache phía server) — qua tunnel công cộng SSE có thể bị đệm
    const poll = async () => {
      try {
        const res = await fetch(`/api/stocks/${key}/quote`)
        if (!res.ok) return
        const data = await res.json()
        apply(Array.isArray(data) ? data : [data])
      } catch {
        /* lỗi mạng — SSE hoặc lần poll sau sẽ bù */
      }
    }
    poll()
    const timer = setInterval(poll, 10000)

    return () => {
      alive = false
      es?.close()
      clearInterval(timer)
    }
  }, [key])

  return { quotes, updatedAt, live }
}
