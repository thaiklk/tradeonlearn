// Facade dữ liệu thị trường: điều phối nguồn US (Yahoo) / VN (VNDirect),
// tự động fallback về dữ liệu mô phỏng khi không gọi được API ngoài.
import { cached } from './cache.js'
import { isVnSymbol, vnHistory, vnQuote, vnSearch, vnName, VN_STOCKS, VN_INDEXES } from './vnMarket.js'
import { usQuote, usHistory, usSearch, US_STOCKS, US_INDEXES } from './usMarket.js'
import { demoCandles, demoQuote } from './demo.js'

export { isVnSymbol, vnName, VN_STOCKS, VN_INDEXES, US_STOCKS, US_INDEXES }

export function marketOf(symbol) {
  return isVnSymbol(symbol) ? 'VN' : 'US'
}

export function stockName(symbol) {
  const up = String(symbol || '').toUpperCase()
  const us = US_STOCKS.find((s) => s.symbol === up)
  if (us) return us.name
  const vn = [...VN_INDEXES, ...VN_STOCKS].find((s) => s.symbol === up)
  if (vn) return vn.name
  return up
}

// ---- Báo giá ----
export async function getQuote(symbol) {
  const up = String(symbol).toUpperCase()
  const market = marketOf(up)
  try {
    const raw = market === 'VN' ? await vnQuote(up) : await usQuote(up)
    const q = Array.isArray(raw) ? raw[0] : raw
    if (q && q.price != null) return q
    throw new Error('Báo giá rỗng')
  } catch (err) {
    console.warn(`[quote] fallback demo cho ${up}:`, err.message)
    return demoQuote(up, market)
  }
}

export async function getQuotes(symbols) {
  const vn = []
  const us = []
  for (const s of symbols) {
    const up = String(s).toUpperCase()
    if (isVnSymbol(up)) vn.push(up)
    else us.push(up)
  }
  const results = []
  const tasks = []
  if (us.length) {
    tasks.push(
      usQuote(us)
        .then((qs) => results.push(...(Array.isArray(qs) ? qs : [qs]).filter(Boolean)))
        .catch((err) => {
          console.warn('[quotes] Yahoo lỗi, dùng demo:', err.message)
          results.push(...us.map((s) => demoQuote(s, 'US')))
        })
    )
  }
  for (const s of vn) {
    tasks.push(
      cached(`vnq:${s}`, 60 * 1000, () => vnQuote(s))
        .then((q) => results.push(q))
        .catch((err) => {
          console.warn(`[quotes] Nguồn VN lỗi cho ${s}, dùng demo:`, err.message)
          results.push(demoQuote(s, 'VN'))
        })
    )
  }
  await Promise.allSettled(tasks)
  return results
}

// ---- Lịch sử nến ----
export async function getHistory(symbol, range = '6mo') {
  const up = String(symbol).toUpperCase()
  const market = marketOf(up)
  const key = `hist:${market}:${up}:${range}`
  try {
    return await cached(key, 5 * 60 * 1000, async () => {
      const candles = market === 'VN' ? await vnHistory(up, range) : await usHistory(up, range)
      return { symbol: up, market, currency: market === 'VN' ? 'VND' : 'USD', candles, demo: false }
    })
  } catch (err) {
    console.warn(`[history] fallback demo cho ${up} (${range}):`, err.message)
    return {
      symbol: up,
      market,
      currency: market === 'VN' ? 'VND' : 'USD',
      candles: demoCandles(up, range, market),
      demo: true,
    }
  }
}

// ---- Tìm kiếm ----
export async function searchStocks(q) {
  const query = String(q || '').trim()
  if (!query) return []
  const out = []
  out.push(...vnSearch(query))
  try {
    const us = await usSearch(query)
    out.push(...us)
  } catch (err) {
    console.warn('[search] Yahoo lỗi:', err.message)
    const seen = out.map((o) => o.symbol)
    US_STOCKS.filter(
      (s) => s.symbol.toLowerCase().includes(query.toLowerCase()) && !seen.includes(s.symbol)
    ).forEach((s) => out.push({ symbol: s.symbol, name: s.name, market: 'US', exchange: 'US' }))
  }
  return out.slice(0, 12)
}

// ---- Tổng quan thị trường ----
export async function getOverview() {
  const [usIndexQuotes, vnIndexQuotes, movers] = await Promise.all([
    cached('ov:usidx', 60 * 1000, () => usQuote(US_INDEXES.map((i) => i.symbol)))
      .then((qs) => {
        // spark trả về thứ tự ngẫu nhiên — phải map theo symbol chứ không theo vị trí
        const bySym = new Map((Array.isArray(qs) ? qs : [qs]).filter(Boolean).map((q) => [q.symbol, q]))
        return US_INDEXES.map((ui) => {
          const q = bySym.get(ui.symbol)
          return q ? { ...q, displaySymbol: ui.displaySymbol, name: ui.name } : null
        }).filter(Boolean)
      })
      .catch(() =>
        US_INDEXES.map((i) => ({
          ...demoQuote(i.symbol, 'US'),
          displaySymbol: i.displaySymbol,
          isIndex: true,
        }))
      ),
    Promise.all(
      VN_INDEXES.map((i) =>
        cached(`vnq:${i.symbol}`, 60 * 1000, () => vnQuote(i.symbol)).catch(() => demoQuote(i.symbol, 'VN'))
      )
    ),
    getMovers(),
  ])
  return {
    usIndexes: usIndexQuotes.map((q) => ({ ...q, isIndex: true })),
    vnIndexes: vnIndexQuotes.map((q) => ({ ...q, isIndex: true })),
    ...movers,
  }
}

async function getMovers() {
  const universe = [
    ...US_STOCKS.slice(0, 16).map((s) => s.symbol),
    ...VN_STOCKS.slice(0, 16).map((s) => s.symbol),
  ]
  const quotes = await getQuotes(universe)
  const valid = quotes.filter((q) => q && q.price != null && Number.isFinite(q.changePercent))
  const sorted = [...valid].sort((a, b) => b.changePercent - a.changePercent)
  return {
    gainers: sorted.slice(0, 5),
    losers: sorted.slice(-5).reverse(),
  }
}
