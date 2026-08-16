// Các chỉ báo kỹ thuật cơ bản: SMA, EMA, RSI, MACD, Bollinger Bands.
// Mỗi hàm trả về mảng cùng độ dài với dữ liệu vào (null ở những vị trí chưa đủ dữ liệu).

export function sma(values, period) {
  const out = new Array(values.length).fill(null)
  if (values.length < period) return out
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= period) sum -= values[i - period]
    if (i >= period - 1) out[i] = sum / period
  }
  return out
}

export function ema(values, period) {
  const out = new Array(values.length).fill(null)
  if (values.length < period) return out
  const k = 2 / (period + 1)
  let prev = 0
  for (let i = 0; i < period; i++) prev += values[i]
  prev /= period // seed bằng SMA
  out[period - 1] = prev
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    out[i] = prev
  }
  return out
}

// RSI chuẩn Wilder
export function rsi(closes, period = 14) {
  const out = new Array(closes.length).fill(null)
  if (closes.length <= period) return out
  let gain = 0
  let loss = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) gain += diff
    else loss -= diff
  }
  gain /= period
  loss /= period
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss)
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    const g = diff > 0 ? diff : 0
    const l = diff < 0 ? -diff : 0
    gain = (gain * (period - 1) + g) / period
    loss = (loss * (period - 1) + l) / period
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss)
  }
  return out
}

// MACD (12, 26, 9)
export function macd(closes, fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(closes, fast)
  const emaSlow = ema(closes, slow)
  const macdLine = closes.map((_, i) => (emaFast[i] != null && emaSlow[i] != null ? emaFast[i] - emaSlow[i] : null))
  const firstIdx = macdLine.findIndex((v) => v != null)
  const signalLine = new Array(closes.length).fill(null)
  if (firstIdx >= 0) {
    const compact = macdLine.slice(firstIdx)
    const sig = ema(compact, signalPeriod)
    for (let i = 0; i < sig.length; i++) signalLine[firstIdx + i] = sig[i]
  }
  const hist = macdLine.map((v, i) => (v != null && signalLine[i] != null ? v - signalLine[i] : null))
  return { macd: macdLine, signal: signalLine, hist }
}

// Bollinger Bands (20, 2)
export function bollinger(closes, period = 20, mult = 2) {
  const mid = sma(closes, period)
  const upper = new Array(closes.length).fill(null)
  const lower = new Array(closes.length).fill(null)
  for (let i = period - 1; i < closes.length; i++) {
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) variance += (closes[j] - mid[i]) ** 2
    const sd = Math.sqrt(variance / period)
    upper[i] = mid[i] + mult * sd
    lower[i] = mid[i] - mult * sd
  }
  return { upper, mid, lower }
}

export function lastValid(arr) {
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null && Number.isFinite(arr[i])) return arr[i]
  return null
}

// dò tìm điểm giao cắt gần đây (trong k bar cuối) giữa 2 đường
export function crossedAbove(a, b, k = 3) {
  const n = a.length
  for (let i = n - 1; i >= Math.max(1, n - k); i--) {
    if (a[i] == null || b[i] == null || a[i - 1] == null || b[i - 1] == null) continue
    if (a[i - 1] <= b[i - 1] && a[i] > b[i]) return true
  }
  return false
}

export function crossedBelow(a, b, k = 3) {
  const n = a.length
  for (let i = n - 1; i >= Math.max(1, n - k); i--) {
    if (a[i] == null || b[i] == null || a[i - 1] == null || b[i - 1] == null) continue
    if (a[i - 1] >= b[i - 1] && a[i] < b[i]) return true
  }
  return false
}
