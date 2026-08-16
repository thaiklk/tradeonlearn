// Dữ liệu thị trường Mỹ — gọi TRỰC TIẾP Yahoo Finance API (không cần key, không cần thư viện):
// - v8 chart  : lịch sử nến + meta giá hiện tại (hoạt động tốt, không cần crumb)
// - v7 spark  : báo giá hàng loạt
// - v1 search : tìm kiếm mã
// Ghi chú: endpoint v7/quote bị Yahoo chặn (401) nên KHÔNG dùng.
import { withTimeout, cached } from './cache.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
const BASE = 'https://query1.finance.yahoo.com'

export const US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
  { symbol: 'KO', name: 'The Coca-Cola Company' },
  { symbol: 'PEP', name: 'PepsiCo Inc.' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'BA', name: 'The Boeing Company' },
  { symbol: 'MCD', name: "McDonald's Corporation" },
  { symbol: 'NKE', name: 'NIKE Inc.' },
  { symbol: 'PFE', name: 'Pfizer Inc.' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.' },
  { symbol: 'PLTR', name: 'Palantir Technologies' },
]

export const US_INDEXES = [
  { symbol: '^GSPC', name: 'S&P 500', displaySymbol: 'S&P 500' },
  { symbol: '^IXIC', name: 'Nasdaq Composite', displaySymbol: 'NASDAQ' },
  { symbol: '^DJI', name: 'Dow Jones Industrial', displaySymbol: 'DOW' },
]

async function yfetch(path, ms = 7000) {
  const res = await withTimeout(
    fetch(`${BASE}${path}`, { headers: { 'User-Agent': UA, Accept: 'application/json' } }),
    ms,
    'Yahoo'
  )
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`)
  return res.json()
}

function intervalFor(range) {
  if (range === '1d') return '5m'
  if (range === '5y') return '1wk'
  return '1d'
}

function chartToCandles(result) {
  const ts = result?.timestamp || []
  const q = result?.indicators?.quote?.[0] || {}
  const out = []
  for (let i = 0; i < ts.length; i++) {
    const o = q.open?.[i]
    const h = q.high?.[i]
    const l = q.low?.[i]
    const c = q.close?.[i]
    if ([o, h, l, c].every((v) => Number.isFinite(v))) {
      out.push({ time: ts[i], open: o, high: h, low: l, close: c, volume: Number(q.volume?.[i]) || 0 })
    }
  }
  return out
}

function metaToQuote(meta, closes, symbol) {
  const price = meta?.regularMarketPrice ?? (closes?.length ? closes[closes.length - 1] : null)
  const prev = meta?.chartPreviousClose ?? (closes?.length >= 2 ? closes[closes.length - 2] : closes?.[0] ?? null)
  const change = price != null && prev != null ? price - prev : null
  return {
    symbol,
    market: 'US',
    currency: 'USD',
    delayed: 'Trễ vài phút',
    name: meta?.shortName || meta?.longName || symbol,
    price,
    change,
    changePercent: price != null && prev ? (change / prev) * 100 : null,
    dayHigh: meta?.regularMarketDayHigh ?? null,
    dayLow: meta?.regularMarketDayLow ?? null,
    volume: meta?.regularMarketVolume ?? null,
    time: meta?.regularMarketTime ?? Math.floor(Date.now() / 1000),
    previousClose: prev,
  }
}

// Lịch sử nến từ v8 chart
export async function usHistory(symbol, range = '6mo') {
  const r = ['1d', '1mo', '3mo', '6mo', '1y', '2y', '5y'].includes(range) ? range : '6mo'
  const j = await yfetch(`/v8/finance/chart/${encodeURIComponent(symbol)}?range=${r}&interval=${intervalFor(r)}`, 9000)
  const candles = chartToCandles(j?.chart?.result?.[0])
  if (!candles.length) throw new Error(`Không có dữ liệu Yahoo cho ${symbol}`)
  return candles
}

// Báo giá: 1 mã qua v8 chart meta, nhiều mã qua spark (hàng loạt)
export async function usQuote(symbols) {
  const arr = (Array.isArray(symbols) ? symbols : [symbols]).map(String)
  if (arr.length === 1) {
    const j = await yfetch(`/v8/finance/chart/${encodeURIComponent(arr[0])}?range=5d&interval=1d`)
    const result = j?.chart?.result?.[0]
    const closes = (result?.indicators?.quote?.[0]?.close || []).filter(Number.isFinite)
    if (!result?.meta) throw new Error('meta rỗng')
    return metaToQuote(result.meta, closes, arr[0])
  }
  const j = await yfetch(`/v7/finance/spark?symbols=${arr.map(encodeURIComponent).join(',')}&range=5d&interval=1d`, 10000)
  const items = j?.spark?.result || []
  const out = items
    .map((it) => {
      const resp = it?.response?.[0]
      if (!resp?.meta) return null
      const closes = (resp.close || []).filter(Number.isFinite)
      return metaToQuote(resp.meta, closes, it.symbol)
    })
    .filter(Boolean)
  if (!out.length) throw new Error('spark rỗng')
  return out
}

// Tìm kiếm mã
export async function usSearch(q) {
  const j = await yfetch(`/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`, 6000)
  return (j?.quotes || [])
    .filter((it) => ['EQUITY', 'ETF', 'INDEX'].includes(it.quoteType))
    .slice(0, 8)
    .map((it) => ({
      symbol: it.symbol,
      name: it.shortname || it.longname || it.symbol,
      market: it.symbol?.endsWith('.VN') || it.symbol?.endsWith('.HM') ? 'VN' : 'US',
      exchange: it.exchange || 'US',
    }))
}

// Chỉ số cơ bản: quoteSummary cần crumb — thử lấy crumb bằng cookie, thất bại thì ném lỗi cho route xử lý
export async function usFundamentals(symbol) {
  const fetchOpts = { headers: { 'User-Agent': UA, Accept: 'application/json' } }
  const cookieRes = await withTimeout(fetch('https://fc.yahoo.com', fetchOpts), 5000, 'fc.yahoo')
  const cookies = (cookieRes.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ')
  const crumbRes = await withTimeout(
    fetch(`${BASE}/v1/test/getcrumb`, { ...fetchOpts, headers: { ...fetchOpts.headers, Cookie: cookies } }),
    5000,
    'getcrumb'
  )
  const crumb = (await crumbRes.text()).trim()
  if (!crumb) throw new Error('Không lấy được crumb')
  const res = await withTimeout(
    fetch(
      `${BASE}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=financialData,defaultKeyStatistics,summaryDetail&crumb=${encodeURIComponent(crumb)}`,
      { ...fetchOpts, headers: { ...fetchOpts.headers, Cookie: cookies } }
    ),
    8000,
    'quoteSummary'
  )
  if (!res.ok) throw new Error(`quoteSummary HTTP ${res.status}`)
  const summary = (await res.json())?.quoteSummary?.result?.[0]
  const f = summary?.financialData || {}
  const k = summary?.defaultKeyStatistics || {}
  const d = summary?.summaryDetail || {}
  const pct = (v) => (Number.isFinite(v) ? v * 100 : null)
  return {
    available: true,
    source: 'Yahoo Finance',
    marketCap: d.marketCap ?? k.marketCap ?? null,
    trailingPE: d.trailingPE ?? null,
    forwardPE: d.forwardPE ?? k.forwardPE ?? null,
    priceToBook: k.priceToBook ?? null,
    trailingEps: k.trailingEps ?? null,
    roe: pct(f.returnOnEquity),
    roa: pct(f.returnOnAssets),
    profitMargin: pct(f.profitMargins),
    grossMargin: pct(f.grossMargins),
    operatingMargin: pct(f.operatingMargins),
    revenueGrowth: pct(f.revenueGrowth),
    earningsGrowth: pct(f.earningsGrowth),
    debtToEquity: f.debtToEquity != null ? f.debtToEquity * 100 : null,
    currentRatio: f.currentRatio ?? null,
    freeCashflow: f.freeCashflow ?? null,
    totalCash: f.totalCash ?? null,
    totalDebt: f.totalDebt ?? null,
    dividendYield: pct(d.dividendYield),
    beta: d.beta ?? null,
    recommendation: f.recommendationKey ?? null,
    targetMeanPrice: f.targetMeanPrice ?? null,
  }
}
