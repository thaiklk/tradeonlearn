// Dữ liệu thị trường Việt Nam — chuỗi nguồn dự phòng nhiều tầng:
// 1) Cổ phiếu: Yahoo Finance (đuôi .VN — giá VND, trễ ~15 phút/EOD)
// 2) Cổ phiếu (dự phòng): VNDirect finfo API (EOD) — một số mạng DNS bị lỗi nội bộ
// 3) Chỉ số (VNINDEX/VN30/HNXINDEX...): banggia.cafef.vn (gần thời gian thực)
// 4) Cuối cùng: dữ liệu mô phỏng (services/demo.js)
import { withTimeout, cached } from './cache.js'
import { demoCandles, demoQuote } from './demo.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
const YBASE = 'https://query1.finance.yahoo.com'

// Danh sách cổ phiếu phổ biến (HOSE / HNX) để tìm kiếm, watchlist và quét biến động
export const VN_STOCKS = [
  { symbol: 'VNM', name: 'Công ty CP Sữa Việt Nam', exchange: 'HOSE' },
  { symbol: 'FPT', name: 'Công ty CP FPT', exchange: 'HOSE' },
  { symbol: 'VIC', name: 'Tập đoàn Vingroup', exchange: 'HOSE' },
  { symbol: 'HPG', name: 'Tập đoàn Hòa Phát', exchange: 'HOSE' },
  { symbol: 'MWG', name: 'Công ty CP Đầu tư Thế Giới Di Động', exchange: 'HOSE' },
  { symbol: 'VCB', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', exchange: 'HOSE' },
  { symbol: 'BID', name: 'Ngân hàng TMCP Đầu tư và Phát triển VN', exchange: 'HOSE' },
  { symbol: 'CTG', name: 'Ngân hàng TMCP Công thương Việt Nam', exchange: 'HOSE' },
  { symbol: 'TCB', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', exchange: 'HOSE' },
  { symbol: 'MBB', name: 'Ngân hàng TMCP Quân đội', exchange: 'HOSE' },
  { symbol: 'ACB', name: 'Ngân hàng TMCP Á Châu', exchange: 'HOSE' },
  { symbol: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', exchange: 'HOSE' },
  { symbol: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', exchange: 'HOSE' },
  { symbol: 'VHM', name: 'Công ty CP Vinhomes', exchange: 'HOSE' },
  { symbol: 'VRE', name: 'Công ty CP Vincom Retail', exchange: 'HOSE' },
  { symbol: 'MSN', name: 'Công ty CP Masan Group', exchange: 'HOSE' },
  { symbol: 'DGC', name: 'Công ty CP Tập đoàn Hóa chất Đức Giang', exchange: 'HOSE' },
  { symbol: 'GAS', name: 'Tổng công ty Khí Việt Nam', exchange: 'HOSE' },
  { symbol: 'PLX', name: 'Tổng công ty Xăng dầu Việt Nam', exchange: 'HOSE' },
  { symbol: 'POW', name: 'Tổng công ty Điện lực Dầu khí VN', exchange: 'HOSE' },
  { symbol: 'SSI', name: 'Công ty CP Chứng khoán SSI', exchange: 'HOSE' },
  { symbol: 'VCI', name: 'Công ty CP Chứng khoán Vietcap', exchange: 'HOSE' },
  { symbol: 'HCM', name: 'Công ty CP Chứng khoán TPBank', exchange: 'HOSE' },
  { symbol: 'DHG', name: 'Công ty CP Dược Hậu Giang', exchange: 'HOSE' },
  { symbol: 'IMP', name: 'Công ty CP Dược phẩm Imexpharm', exchange: 'HOSE' },
  { symbol: 'REE', name: 'Công ty CP Cơ điện lạnh', exchange: 'HOSE' },
  { symbol: 'PNJ', name: 'Công ty CP Vàng bạc Đá quý Phú Nhuận', exchange: 'HOSE' },
  { symbol: 'VJC', name: 'Tổng công ty Hàng không Việt Nam', exchange: 'HOSE' },
  { symbol: 'SAB', name: 'Tổng công ty CP Bia - Rượu - NGK Sài Gòn', exchange: 'HOSE' },
  { symbol: 'MSB', name: 'Ngân hàng TMCP Hàng Hải', exchange: 'HOSE' },
  { symbol: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', exchange: 'HOSE' },
  { symbol: 'OCB', name: 'Ngân hàng TMCP Phương Đông', exchange: 'HOSE' },
  { symbol: 'TPB', name: 'Ngân hàng TMCP Tiên Phong', exchange: 'HOSE' },
  { symbol: 'HDB', name: 'Ngân hàng TMCP Phát triển TP.HCM', exchange: 'HOSE' },
  { symbol: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam', exchange: 'HOSE' },
  { symbol: 'LPB', name: 'Ngân hàng TMCP Bảo Việt', exchange: 'HOSE' },
  { symbol: 'NLG', name: 'Công ty CP Địa ốc Nam Long', exchange: 'HOSE' },
  { symbol: 'KDH', name: 'Công ty CP Đầu tư và Kinh doanh nhà Khang Điền', exchange: 'HOSE' },
  { symbol: 'PDR', name: 'Công ty CP Phát triển BĐS Phát Đạt', exchange: 'HOSE' },
  { symbol: 'KBC', name: 'Tổng công ty Phát triển Đô thị Kinh Bắc', exchange: 'HOSE' },
  { symbol: 'BSR', name: 'Tổng công ty CP Lọc hóa dầu Bình Sơn', exchange: 'HOSE' },
  { symbol: 'PVS', name: 'Tổng công ty CP Dịch vụ Kỹ thuật Dầu khí VN', exchange: 'HOSE' },
  { symbol: 'PVD', name: 'Tổng công ty CP Khoan và Dịch vụ Dầu khí', exchange: 'HOSE' },
  { symbol: 'PC1', name: 'Công ty CP Tập đoàn PC1', exchange: 'HOSE' },
  { symbol: 'NT2', name: 'Công ty CP Điện lực Dầu khí Nhơn Trạch 2', exchange: 'HOSE' },
  { symbol: 'SHS', name: 'Công ty CP Chứng khoán Sài Gòn - Hà Nội', exchange: 'HNX' },
  { symbol: 'CEO', name: 'Công ty CP Chứng khoán CE Group', exchange: 'HNX' },
  { symbol: 'IDC', name: 'Tổng công ty CP Đầu tư và Kinh doanh Capital', exchange: 'HNX' },
  { symbol: 'VEA', name: 'Công ty CP Chứng khoán VEA', exchange: 'HNX' },
]

export const VN_INDEXES = [
  { symbol: 'VNINDEX', name: 'VN-Index', exchange: 'HOSE' },
  { symbol: 'VN30', name: 'VN30', exchange: 'HOSE' },
  { symbol: 'HNXINDEX', name: 'HNX-Index', exchange: 'HNX' },
]

const VN_SYMBOL_SET = new Set([...VN_STOCKS, ...VN_INDEXES].map((s) => s.symbol))

export function isVnSymbol(symbol) {
  return VN_SYMBOL_SET.has(String(symbol || '').toUpperCase())
}

export function vnName(symbol) {
  const up = String(symbol || '').toUpperCase()
  const found = [...VN_INDEXES, ...VN_STOCKS].find((s) => s.symbol === up)
  return found ? found.name : up
}

function isVnIndex(symbol) {
  return VN_INDEXES.some((i) => i.symbol === String(symbol).toUpperCase())
}

/* ---------------- Nguồn 1: Yahoo (.VN) ---------------- */

async function yahooChart(symbolWithSuffix, range, interval) {
  const res = await withTimeout(
    fetch(`${YBASE}/v8/finance/chart/${encodeURIComponent(symbolWithSuffix)}?range=${range}&interval=${interval}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    }),
    7000,
    'Yahoo VN'
  )
  if (!res.ok) throw new Error(`Yahoo VN HTTP ${res.status}`)
  return res.json()
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

async function yahooVnHistory(symbol, range) {
  const r = ['1d', '1mo', '3mo', '6mo', '1y', '2y', '5y'].includes(range) ? range : '6mo'
  const interval = r === '1d' ? '5m' : r === '5y' ? '1wk' : '1d'
  const j = await yahooChart(`${symbol}.VN`, r, interval)
  const candles = chartToCandles(j?.chart?.result?.[0])
  if (!candles.length) throw new Error(`Yahoo không có ${symbol}.VN`)
  return candles
}

async function yahooVnQuote(symbol) {
  const j = await yahooChart(`${symbol}.VN`, '5d', '1d')
  const result = j?.chart?.result?.[0]
  const m = result?.meta
  const closes = (result?.indicators?.quote?.[0]?.close || []).filter(Number.isFinite)
  if (!m) throw new Error('meta rỗng')
  const price = m.regularMarketPrice ?? closes[closes.length - 1] ?? null
  const prev = m.chartPreviousClose ?? (closes.length >= 2 ? closes[closes.length - 2] : closes[0]) ?? null
  const change = price != null && prev != null ? price - prev : null
  return {
    symbol: String(symbol).toUpperCase(),
    market: 'VN',
    currency: 'VND',
    delayed: 'Trễ ~15 phút',
    name: m.shortName || vnName(symbol),
    price,
    change,
    changePercent: price != null && prev ? (change / prev) * 100 : null,
    dayHigh: m.regularMarketDayHigh ?? null,
    dayLow: m.regularMarketDayLow ?? null,
    volume: m.regularMarketVolume ?? null,
    time: m.regularMarketTime ?? Math.floor(Date.now() / 1000),
  }
}

/* ---------------- Nguồn 2 (dự phòng): VNDirect finfo ---------------- */

function rangeToFrom(range) {
  const days = { '1mo': 40, '3mo': 100, '6mo': 190, '1y': 370, '2y': 740, '5y': 1830 }[range] || 190
  return new Date(Date.now() - days * 864e5).toISOString().slice(0, 10)
}

async function vndirectHistory(symbol, range = '6mo') {
  const to = new Date().toISOString().slice(0, 10)
  const url = `https://finfo-api.vndirect.com.vn/v4/stock_prices?sort=date&size=1000&page=1&q=code:${symbol}~date:${rangeToFrom(range)}~${to}`
  const res = await withTimeout(fetch(url, { headers: { Accept: 'application/json' } }), 4000, 'VNDirect')
  if (!res.ok) throw new Error(`VNDirect HTTP ${res.status}`)
  const rows = (await res.json())?.data || []
  const candles = rows
    .map((r) => {
      const time = Math.floor(Date.parse(`${r.date}T00:00:00+07:00`) / 1000)
      const scale = Number(r.close) < 1000 ? 1000 : 1 // finfo trả nghìn đồng cho cp
      return { time, open: +r.open * scale, high: +r.high * scale, low: +r.low * scale, close: +r.close * scale, volume: Number(r.volume) || 0 }
    })
    .filter((c) => Number.isFinite(c.time) && Number.isFinite(c.close))
    .sort((a, b) => a.time - b.time)
  if (!candles.length) throw new Error(`Không có dữ liệu VNDirect cho ${symbol}`)
  return candles
}

/* ---------------- Nguồn 3: chỉ số VN từ cafef ---------------- */

async function cafefIndexes() {
  return cached('cafef:indexes', 60000, async () => {
    const res = await withTimeout(
      fetch('https://banggia.cafef.vn/stockhandler.ashx?center=1&index=true', {
        headers: { 'User-Agent': UA, Referer: 'https://cafef.vn/', Accept: 'application/json' },
      }),
      6000,
      'Cafef'
    )
    if (!res.ok) throw new Error(`Cafef HTTP ${res.status}`)
    const arr = await res.json()
    const num = (v) => Number(String(v).replace(/,/g, ''))
    const out = {}
    for (const it of arr || []) {
      if (!it?.name) continue
      out[String(it.name).toUpperCase()] = {
        index: num(it.index),
        change: num(it.change),
        percent: num(it.percent),
        volume: num(it.volume),
      }
    }
    return out
  })
}

/* ---------------- API chính của module ---------------- */

export async function vnHistory(symbol, range = '6mo') {
  const up = String(symbol).toUpperCase()
  if (isVnIndex(up)) {
    // Chỉ số VN chưa có nguồn lịch sử công khai ổn định → dùng chuỗi mô phỏng cho biểu đồ,
    // còn GIÁ/PHẦN TRĂM thay đổi ở bảng điều khiển vẫn là số THẬT từ cafef (vnQuote).
    return demoCandles(up, range, 'VN')
  }
  try {
    return await yahooVnHistory(up, range)
  } catch {
    return await vndirectHistory(up, range)
  }
}

export async function vnQuote(symbol) {
  const up = String(symbol).toUpperCase()
  if (isVnIndex(up)) {
    try {
      const idx = (await cafefIndexes())[up]
      if (idx && Number.isFinite(idx.index)) {
        return {
          symbol: up,
          market: 'VN',
          currency: 'VND',
          delayed: 'Gần thời gian thực (cafef)',
          name: VN_INDEXES.find((i) => i.symbol === up)?.name || up,
          price: idx.index,
          change: idx.change,
          changePercent: idx.percent,
          dayHigh: null,
          dayLow: null,
          volume: idx.volume,
          time: Math.floor(Date.now() / 1000),
        }
      }
    } catch {
      /* rơi xuống demo */
    }
    return demoQuote(up, 'VN')
  }
  try {
    return await yahooVnQuote(up)
  } catch {
    try {
      const candles = await vndirectHistory(up, '1mo')
      const last = candles[candles.length - 1]
      const prev = candles[candles.length - 2] || last
      return {
        symbol: up, market: 'VN', currency: 'VND', delayed: 'EOD (VNDirect)', name: vnName(up),
        price: last.close, change: last.close - prev.close,
        changePercent: prev.close ? ((last.close - prev.close) / prev.close) * 100 : 0,
        dayHigh: last.high, dayLow: last.low, volume: last.volume, time: last.time,
      }
    } catch {
      return demoQuote(up, 'VN')
    }
  }
}

export function vnSearch(q) {
  const query = String(q || '').toLowerCase()
  const seen = new Set()
  return VN_STOCKS
    .filter((s) => {
      if (seen.has(s.symbol)) return false
      seen.add(s.symbol)
      return s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    })
    .slice(0, 10)
    .map((s) => ({ symbol: s.symbol, name: s.name, market: 'VN', exchange: s.exchange }))
}
