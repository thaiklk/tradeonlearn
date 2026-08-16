// Chế độ dữ liệu mô phỏng (demo): sinh chuỗi nến giả định nhưng hợp lý theo symbol.
// Dùng khi không gọi được API ngoài (mất mạng / bị chặn) để web luôn chạy được để học tập.

function hashString(str) {
  let h = 1779033703
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function demoCandles(symbol, range = '6mo', market = 'US') {
  const up = String(symbol).toUpperCase()
  const rng = mulberry32(hashString(up + market))
  const days = { '1d': 78, '1mo': 22, '3mo': 66, '6mo': 130, '1y': 250, '2y': 500, '5y': 1040 }[range] || 130
  const baseUsd = 30 + rng() * 420
  const baseVnd = 12000 + rng() * 90000
  let price = market === 'VN' ? baseVnd : baseUsd
  const vol = market === 'VN' ? 0.016 : 0.02
  const drift = (rng() - 0.45) * 0.0022

  const candles = []
  const now = Math.floor(Date.now() / 1000)
  const step = range === '1d' ? 5 * 60 : 86400
  let t = now - days * step

  for (let i = 0; i < days; i++) {
    // random walk có xu hướng + nhiễu
    const shock = (rng() - 0.5) * 2 * vol
    const cycle = Math.sin((i / 34) * Math.PI * 2 + rng() * 0.4) * vol * 0.55
    const ret = drift + shock + cycle
    const open = price
    const close = Math.max(open * (1 + ret), open * 0.9)
    const high = Math.max(open, close) * (1 + rng() * vol * 0.7)
    const low = Math.min(open, close) * (1 - rng() * vol * 0.7)
    const volume = Math.floor((0.5 + rng()) * (market === 'VN' ? 9e5 : 1.4e7))
    candles.push({
      time: t,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    })
    price = close
    t += step
    // bỏ qua cuối tuần
    if (range !== '1d' && (new Date(t * 1000).getUTCDay() === 0 || new Date(t * 1000).getUTCDay() === 6)) t += 86400
  }
  return candles
}

export function demoQuote(symbol, market = 'US') {
  const candles = demoCandles(symbol, '1mo', market)
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2] || last
  const change = last.close - prev.close
  return {
    symbol: String(symbol).toUpperCase(),
    market,
    currency: market === 'VN' ? 'VND' : 'USD',
    delayed: 'Dữ liệu mô phỏng',
    name: `${symbol.toUpperCase()} (mô phỏng)`,
    price: last.close,
    change,
    changePercent: prev.close ? (change / prev.close) * 100 : 0,
    dayHigh: last.high,
    dayLow: last.low,
    volume: last.volume,
    time: last.time,
  }
}
