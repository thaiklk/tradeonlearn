import { Router } from 'express'
import { cached } from '../services/cache.js'
import { getHistory, getQuote, getQuotes, getOverview, searchStocks, marketOf, stockName, VN_STOCKS, US_STOCKS, isVnSymbol } from '../services/marketService.js'
import { usFundamentals } from '../services/usMarket.js'
import { analyzeCandles } from '../services/signals.js'

// Chú thích giáo dục cho từng chỉ số cơ bản: cách đọc + ngưỡng tham khảo (dùng cho người mới học)
const FUNDAMENTALS_EXPLAIN = {
  marketCap: { label: 'Vốn hóa thị trường', how: 'Tổng giá trị = giá cổ phiếu × số cổ phiếu đang lưu hành. Trên 10 tỷ $ gọi là "large-cap" (ổn định), dưới 2 tỷ $ là "small-cap" (biến động mạnh).' },
  trailingPE: { label: 'P/E (trailing)', how: 'Giá / EPS 12 tháng qua. P/E thấp (dưới ~15) có thể là rẻ hoặc tăng trưởng kém; P/E cao (trên ~30) thường hàm chứa kỳ vọng tăng trưởng lớn. Luôn so với trung bình ngành.' },
  forwardPE: { label: 'P/E (forward)', how: 'Giá / EPS dự phóng năm tới. Forward P/E < Trailing P/E = thị trường kỳ vọng lợi nhuận tăng.' },
  priceToBook: { label: 'P/B', how: 'Giá / giá trị sổ sách của vốn chủ sở hữu. P/B < 1 có thể là "rẻ hơn giá trị tài sản ròng" — hãy kiểm tra lý do (có thể tài sản đã mất giá).' },
  trailingEps: { label: 'EPS (lợi nhuận/cổ phiếu)', how: 'Lợi nhuận ròng chia cho số cổ phiếu. EPS tăng đều qua các năm là dấu hiệu tốt.' },
  roe: { label: 'ROE (%)', how: 'Lợi nhuận ròng / vốn chủ sở hữu. Trên 15% là khá tốt, trên 20% là xuất sắc. ROE cao + nợ thấp = chất lượng kinh doanh thật sự.' },
  roa: { label: 'ROA (%)', how: 'Lợi nhuận ròng / tổng tài sản. Cho biết 1 đồng tài sản tạo ra bao nhiêu đồng lợi nhuận. Trên 5% là khá.' },
  profitMargin: { label: 'Biên lợi nhuận ròng (%)', how: 'Lợi nhuận ròng / doanh thu. Càng cao càng tốt; so sánh với đối thủ cùng ngành.' },
  grossMargin: { label: 'Biên gộp (%)', how: '(Doanh thu - giá vốn) / doanh thu. Biên gộp cao và ổn định cho thấy quyền lực định giá (thương hiệu, công nghệ).' },
  operatingMargin: { label: 'Biên hoạt động (%)', how: 'Lợi nhuận hoạt động / doanh thu — phản hiện hiệu quả vận hành cốt lõi, chưa gồm lãi/vay và thuế.' },
  revenueGrowth: { label: 'Tăng trưởng doanh thu (%)', how: 'So sánh doanh thu năm nay với năm trước. Tăng trưởng dương đều đặn là nền tảng của cổ phiếu tăng giá dài hạn.' },
  earningsGrowth: { label: 'Tăng trưởng lợi nhuận (%)', how: 'Tốc độ tăng lợi nhuận. Lợi nhuận tăng nhanh hơn doanh thu = đang có "đòn bẩy hoạt động" tốt.' },
  debtToEquity: { label: 'Nợ / Vốn chủ (%)', how: 'Tổng nợ / vốn chủ sở hữu. Dưới ~100% thường an toàn; trên 200% cần xem xét kỹ (riêng ngân hàng vốn chất nợ cao là bình thường).' },
  currentRatio: { label: 'Hệ số thanh toán hiện hành', how: 'Tài sản ngắn hạn / nợ ngắn hạn. Trên 1.5 là thanh khoản tốt; dưới 1 có thể thiếu tiền trả nợ ngắn hạn.' },
  freeCashflow: { label: 'Dòng tiền tự do (FCF)', how: 'Tiền mặt tạo ra sau khi trừ chi phí đầu tư. FCF dương và tăng là "oxy" của công ty — lợi nhuận sổ sách có thể làm đẹp, tiền mặt thì khó.' },
  dividendYield: { label: 'Tỷ suất cổ tức (%)', how: 'Cổ tức mỗi năm / giá cổ phiếu. Cao (trên 4%) hấp dẫn nhưng hãy kiểm tra tỷ lệ chi trả để biết có bền không.' },
  beta: { label: 'Beta', how: 'Độ nhạy với thị trường. Beta 1 = dao động như thị trường; 1.5 = rủi ro cao hơn; dưới 1 = êm hơn.' },
  recommendation: { label: 'Đồng thuận phân tích viên', how: 'Ý kiến trung bình của các phân tích viên (buy/hold/sell). Chỉ mang tính tham khảo — bạn cần tự phân tích.' },
  targetMeanPrice: { label: 'Giá mục tiêu trung bình', how: 'Mức giá mà các phân tích viên dự báo. So sánh với giá hiện tại để thấy "khoảng cách kỳ vọng".' },
}

const router = Router()

// Tổng quan: chỉ số, tăng/giảm mạnh nhất
router.get('/overview', async (_req, res) => {
  try {
    res.json(await cached('overview', 30 * 1000, () => getOverview()))
  } catch (err) {
    res.status(500).json({ error: 'Không tải được tổng quan thị trường', detail: err.message })
  }
})

// Tìm kiếm cổ phiếu (US + VN)
router.get('/search', async (req, res) => {
  try {
    res.json(await searchStocks(req.query.q))
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tìm kiếm', detail: err.message })
  }
})

// Báo giá 1 hoặc nhiều symbol (cách nhau bằng dấu phẩy)
router.get('/:symbol/quote', async (req, res) => {
  try {
    const symbols = String(req.params.symbol).split(',').map((s) => s.trim()).filter(Boolean)
    if (symbols.length === 1) {
      const q = await cached(`q:${symbols[0].toUpperCase()}`, 20 * 1000, () => getQuote(symbols[0]))
      return res.json(q)
    }
    res.json(await getQuotes(symbols))
  } catch (err) {
    res.status(500).json({ error: 'Không tải được báo giá', detail: err.message })
  }
})

// Lịch sử nến + toàn bộ phân tích kỹ thuật + gợi ý (dùng cho trang chi tiết)
router.get('/:symbol/analysis', async (req, res) => {
  try {
    const symbol = String(req.params.symbol).toUpperCase()
    const range = ['1d', '1mo', '3mo', '6mo', '1y', '2y', '5y'].includes(req.query.range) ? req.query.range : '6mo'
    // chạy song song để giảm thời gian chờ
    const [hist, quote] = await Promise.all([getHistory(symbol, range), getQuote(symbol)])
    const analysis = analyzeCandles(hist.candles)
    // chỉ gửi về ~180 nến gần nhất + series tương ứng để nhẹ payload
    const keep = Math.min(180, hist.candles.length)
    const slice = (arr) => arr.slice(arr.length - keep)
    res.json({
      symbol,
      name: stockName(symbol),
      market: hist.market,
      currency: hist.currency,
      demo: hist.demo || quote.delayed === 'Dữ liệu mô phỏng',
      quote,
      range,
      candles: hist.candles.slice(-keep),
      series: {
        ma20: slice(analysis.series.ma20),
        ma50: slice(analysis.series.ma50),
        ma200: slice(analysis.series.ma200),
        bbUpper: slice(analysis.series.bbUpper),
        bbLower: slice(analysis.series.bbLower),
        rsi14: slice(analysis.series.rsi14),
        macd: slice(analysis.series.macd),
        macdSignal: slice(analysis.series.macdSignal),
        macdHist: slice(analysis.series.macdHist),
      },
      indicators: analysis.indicators,
      signals: analysis.signals,
      overall: analysis.overall,
      score: analysis.score,
      disclaimer: analysis.disclaimer,
    })
  } catch (err) {
    res.status(500).json({ error: 'Không phân tích được mã này', detail: err.message })
  }
})

// Lịch sử nến thô (nhẹ, dùng cho sparkline / biểu đồ nhanh)
router.get('/:symbol/history', async (req, res) => {
  try {
    const symbol = String(req.params.symbol).toUpperCase()
    const range = ['1d', '1mo', '3mo', '6mo', '1y', '2y', '5y'].includes(req.query.range) ? req.query.range : '6mo'
    res.json(await getHistory(symbol, range))
  } catch (err) {
    res.status(500).json({ error: 'Không tải được lịch sử giá', detail: err.message })
  }
})

// BCTC chuẩn hóa 3-5 năm — nguyên tắc brief: mọi số liệu có source/periodEnd/fetchedAt/currency/status
const FIN_FIXTURES = {
  AAPL: { c: 'USD', u: 'tỷ USD', rows: {
    revenue: [394.3, 383.3, 391.0, 416.0], grossProfit: [170.8, 169.1, 180.7, 195.0], operatingIncome: [119.4, 114.3, 123.2, 130.0], netIncome: [99.8, 97.0, 93.7, 104.0],
    totalAssets: [352.8, 352.6, 365.0, 380.0], totalLiabilities: [302.1, 290.4, 308.0, 315.0], equity: [50.7, 62.1, 57.0, 65.0],
    ocf: [122.2, 110.5, 118.3, 125.0], capex: [-10.7, -11.0, -9.4, -10.0], sharesB: [15.9, 15.6, 15.4, 15.1], dividends: [0.91, 0.94, 0.98, 1.0],
    receivables: [26.3, 29.3, 33.4, 35.0], inventory: [4.9, 6.3, 7.0, 6.5], goodwill: [0, 0, 0, 0] } },
  MSFT: { c: 'USD', u: 'tỷ USD', rows: {
    revenue: [198.3, 211.9, 245.1, 281.0], grossProfit: [135.6, 146.1, 171.0, 196.0], operatingIncome: [83.4, 88.5, 109.4, 128.0], netIncome: [72.7, 72.4, 88.1, 101.0],
    totalAssets: [364.8, 412.0, 512.0, 590.0], totalLiabilities: [198.3, 205.8, 247.0, 275.0], equity: [166.5, 206.2, 265.0, 315.0],
    ocf: [89.0, 87.6, 118.5, 136.0], capex: [-23.9, -28.1, -44.5, -52.0], sharesB: [7.5, 7.4, 7.4, 7.4], dividends: [2.72, 3.00, 3.32, 3.60],
    receivables: [44.3, 48.7, 56.4, 62.0], inventory: [3.0, 3.5, 2.9, 3.2], goodwill: [67.5, 69.1, 71.0, 72.0] } },
  FPT: { c: 'VND', u: 'nghìn tỷ ₫', rows: {
    revenue: [28.9, 36.6, 52.6, 62.8], grossProfit: [6.2, 7.6, 10.0, 11.9], operatingIncome: [4.0, 4.9, 6.3, 7.6], netIncome: [4.3, 5.3, 6.1, 7.3],
    totalAssets: [30.4, 37.5, 50.0, 58.0], totalLiabilities: [14.2, 17.4, 24.0, 27.0], equity: [16.2, 20.1, 26.0, 31.0],
    ocf: [4.6, 5.7, 6.6, 7.9], capex: [-2.1, -2.6, -3.2, -3.8], sharesB: [0.54, 0.54, 0.55, 0.55], dividends: [1.2, 1.5, 1.8, 2.0],
    receivables: [5.5, 7.3, 11.0, 13.5], inventory: [0.6, 0.8, 1.1, 1.4], goodwill: [0.3, 0.4, 0.5, 0.6] } },
  VNM: { c: 'VND', u: 'nghìn tỷ ₫', rows: {
    revenue: [59.5, 60.5, 61.3, 62.5], grossProfit: [22.0, 21.8, 22.3, 23.0], operatingIncome: [13.5, 12.8, 13.2, 13.8], netIncome: [8.6, 8.0, 8.3, 8.8],
    totalAssets: [37.0, 36.5, 37.2, 38.0], totalLiabilities: [17.5, 16.4, 16.6, 16.8], equity: [19.5, 20.1, 20.6, 21.2],
    ocf: [10.2, 9.6, 9.9, 10.4], capex: [-2.5, -1.8, -2.0, -2.2], sharesB: [2.3, 2.3, 2.3, 2.3], dividends: [7.0, 7.5, 7.8, 8.0],
    receivables: [4.0, 4.3, 4.6, 4.8], inventory: [8.5, 9.0, 9.4, 9.8], goodwill: [2.1, 2.1, 2.2, 2.2] } },
  KO: { c: 'USD', u: 'tỷ USD', rows: {
    revenue: [43.0, 45.8, 47.1, 48.5], grossProfit: [25.0, 26.6, 27.5, 28.3], operatingIncome: [10.9, 11.3, 11.5, 12.0], netIncome: [9.5, 10.7, 10.6, 11.1],
    totalAssets: [92.8, 100.5, 102.0, 104.0], totalLiabilities: [71.5, 76.6, 77.0, 78.0], equity: [21.3, 23.9, 25.0, 26.0],
    ocf: [11.0, 11.6, 6.8, 9.5], capex: [-1.8, -1.9, -2.0, -2.1], sharesB: [5.5, 5.5, 5.4, 5.4], dividends: [1.76, 1.84, 1.92, 2.00],
    receivables: [3.5, 3.4, 3.6, 3.7], inventory: [4.2, 4.4, 4.6, 4.7], goodwill: [19.6, 18.9, 18.5, 18.0] } },
}

// 7 red-flags rule-based (Phase 5.4) — chỉ là điểm cần KIỂM TRA THÊM, không khẳng định gian lận
function computeRedFlags(fx) {
  const r = fx.rows
  const n = r.revenue.length
  const L = (a) => a[n - 1], P = (a) => a[n - 2]
  const g = (a) => +(((L(a) - P(a)) / P(a)) * 100).toFixed(1)
  const ocfNi = (i) => (r.ocf[i] / r.netIncome[i]) * 100
  const flags = []
  const push = (sev, title, ev, note) => flags.push({ severity: sev, title, evidence: ev, note })
  const ocf2 = [ocfNi(n - 1), ocfNi(n - 2)]
  if (Math.min(...ocf2) < 80) push(Math.min(...ocf2) < 50 ? 'cao' : 'trung bình', 'OCF thấp hơn lợi nhuận kéo dài', `OCF/LN 2 năm gần nhất: ${ocf2.map((v) => v.toFixed(0) + '%').join(', ')}`, 'Lợi nhuận chưa chuyển thành tiền — xem Bài 11 + Task 8')
  if (g(r.receivables) > g(r.revenue) + 5) push(g(r.receivables) > g(r.revenue) + 15 ? 'cao' : 'trung bình', 'Phải thu tăng nhanh hơn doanh thu', `Phải thu +${g(r.receivables)}% vs Doanh thu +${g(r.revenue)}%`, 'Có thể bán chịu để "đẩy" doanh thu — hỏi chính sách công nợ')
  if (g(r.inventory) > 30) push('trung bình', 'Tồn kho tăng bất thường', `Tồn kho +${g(r.inventory)}%/năm`, 'Hàng bán chậm? So sánh với tốc độ doanh thu')
  const nm = r.netIncome.map((v, i) => (v / r.revenue[i]) * 100)
  if (nm[n - 1] < nm[n - 2] && nm[n - 2] < nm[n - 3]) push('trung bình', 'Biên lợi nhuận giảm liên tục', `Biên ròng: ${nm.slice(-3).map((v) => v.toFixed(1) + '%').join(' → ')}`, 'Cạnh tranh gay hơn hay chi phí tăng?')
  if (g(r.totalLiabilities) > 20) push('trung bình', 'Nợ tăng nhanh', `Nợ phải trả +${g(r.totalLiabilities)}%/năm`, 'Vay để làm gì — mở rộng hay xoay vốn?')
  const gwEq = (L(r.goodwill) / L(r.equity)) * 100
  if (gwEq > 15) push(gwEq > 30 ? 'cao' : 'thấp', 'Goodwill/tài sản vô hình lớn', `Goodwill/VCSH ≈ ${gwEq.toFixed(0)}%`, 'Đã trả đắt các thương vụ M&A — có ngày phải xóa sổ')
  if (g(r.sharesB) > 2) push('thấp', 'Số cổ phiếu pha loãng', `Số cp +${g(r.sharesB)}%/năm`, 'Phát hành thêm làm loãng tỷ lệ sở hữu của cổ đông cũ')
  return flags
}

// So sánh nhiều DN (Phase 5.1-5.3): chọn 3-5, 8 chỉ số + median, P/E & P/B tính từ giá live
router.get('/peers/compare', async (req, res) => {
  const symbols = String(req.query.symbols || '')
    .split(/[,;\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => FIN_FIXTURES[s])
    .slice(0, 5)
  if (symbols.length < 2) return res.json({ items: [], median: null, error: 'Chọn 2-5 mã trong danh sách có dữ liệu' })
  const items = []
  for (const sym of symbols) {
    const fx = FIN_FIXTURES[sym]
    const r = fx.rows
    const n = r.revenue.length
    const q = await getQuote(sym).catch(() => null)
    const eps = +(r.netIncome[n - 1] / r.sharesB[n - 1]).toFixed(2)
    items.push({
      symbol: sym, currency: fx.c, unit: fx.u, price: q?.price ?? null,
      pe: q?.price != null ? +(q.price / eps).toFixed(1) : null,
      pb: q?.price != null ? +((q.price * r.sharesB[n - 1]) / r.equity[n - 1]).toFixed(1) : null,
      roe: +((r.netIncome[n - 1] / r.equity[n - 1]) * 100).toFixed(1),
      netMargin: +((r.netIncome[n - 1] / r.revenue[n - 1]) * 100).toFixed(1),
      revenueGrowth: +(((r.revenue[n - 1] / r.revenue[n - 2]) - 1) * 100).toFixed(1),
      debtToEquity: +((r.totalLiabilities[n - 1] / r.equity[n - 1]) * 100).toFixed(1),
      ocfToNi: +((r.ocf[n - 1] / r.netIncome[n - 1]) * 100).toFixed(0),
      fcf: +(r.ocf[n - 1] + r.capex[n - 1]).toFixed(1),
      redFlags: computeRedFlags(fx),
    })
  }
  const med = (k) => { const s = items.map((x) => x[k]).filter(Number.isFinite).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null }
  res.json({
    status: 'demo + giá live', source: 'Bộ số liệu mẫu giáo dục (BCTC) + báo giá live', fetchedAt: new Date().toISOString(),
    items, median: { pe: med('pe'), pb: med('pb'), roe: med('roe'), netMargin: med('netMargin'), revenueGrowth: med('revenueGrowth'), debtToEquity: med('debtToEquity'), ocfToNi: med('ocfToNi'), fcf: med('fcf') },
    question: 'Công ty nào tốt hơn, VÌ SAO? Dùng median làm mốc — đừng kết luận chỉ vì 1 chỉ số đẹp.',
    disclaimer: 'Red-flags chỉ là điểm cần kiểm tra thêm trong BCTC thật — không khẳng định gian lận, không phải khuyến nghị đầu tư.',
  })
})

router.get('/:symbol/redflags', (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase()
  const fx = FIN_FIXTURES[symbol]
  if (!fx) return res.json({ symbol, status: 'no-data', flags: [], note: 'Chưa có dữ liệu để chạy red-flags cho mã này.' })
  res.json({ symbol, status: 'demo', source: 'Bộ số liệu mẫu giáo dục', fetchedAt: new Date().toISOString(), flags: computeRedFlags(fx),
    disclaimer: 'Chỉ là điểm cần kiểm tra thêm — không khẳng định gian lận hay khuyến nghị đầu tư.' })
})
const FY = ['FY2022', 'FY2023', 'FY2024', 'FY2025']

router.get('/:symbol/financials', async (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase()
  const market = marketOf(symbol)
  // 1) Thử nguồn live (chỉ có với mã Mỹ khi Yahoo cho phép)
  if (market === 'US') {
    try {
      const f = await usFundamentals(symbol)
      if (f?.available && f.trailingPE != null) {
        return res.json({ symbol, market, currency: 'USD', unit: 'snapshot', status: 'live', source: 'Yahoo Finance', periodEnd: 'quý gần nhất', fetchedAt: new Date().toISOString(),
          snapshot: { pe: f.trailingPE, forwardPe: f.forwardPE, roe: f.roe, roa: f.roa, margin: f.profitMargin, de: f.debtToEquity, growth: f.revenueGrowth, eps: f.trailingEps, fcf: f.freeCashflow }, years: [], ratios: null })
      }
    } catch { /* rơi xuống fixture */ }
  }
  // 2) Fixture giáo dục — NHÃN RÕ, không giả vờ live
  const fx = FIN_FIXTURES[symbol]
  if (!fx) return res.json({ symbol, market, status: 'no-data', note: 'Chưa có dữ liệu BCTC cho mã này. Bạn có thể tự nhập theo Bài 9-11 (tính năng nhập tay sắp có).', years: [], ratios: null })
  const r = fx.rows
  const pct = (a) => a.map((v, i) => (i > 0 && a[i - 1] ? +(((v - a[i - 1]) / a[i - 1]) * 100).toFixed(1) : null))
  const div = (a, b) => a.map((v, i) => (b[i] ? +((v / b[i]) * 100).toFixed(1) : null))
  const fcf = r.ocf.map((v, i) => +(v + r.capex[i]).toFixed(1))
  res.json({
    symbol, market, currency: fx.c, unit: fx.u, status: 'demo', source: 'Bộ số liệu mẫu giáo dục (không phải dữ liệu live) — để học cách đọc BCTC',
    periodEnd: 'FY2025 (mô phỏng)', fetchedAt: new Date().toISOString(),
    years: FY,
    rows: { ...r, fcf, eps: r.netIncome.map((n, i) => +(n / r.sharesB[i]).toFixed(2)) },
    ratios: {
      revenueGrowth: pct(r.revenue), netIncomeGrowth: pct(r.netIncome),
      grossMargin: div(r.grossProfit, r.revenue), operatingMargin: div(r.operatingIncome, r.revenue), netMargin: div(r.netIncome, r.revenue),
      roe: div(r.netIncome, r.equity), roa: div(r.netIncome, r.totalAssets),
      debtToEquity: div(r.totalLiabilities, r.equity), ocfToNi: r.ocf.map((v, i) => +((v / r.netIncome[i]) * 100).toFixed(0)),
    },
  })
})

// So sánh ngang hàng + median (Phase 5 foundation) — dùng tỷ số từ /financials + giá live
const PEER_MAP = { AAPL: ['AAPL', 'MSFT', 'KO'], MSFT: ['MSFT', 'AAPL', 'KO'], KO: ['KO', 'AAPL', 'MSFT'], FPT: ['FPT', 'VNM'], VNM: ['VNM', 'FPT'] }
const med = (a) => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null }

router.get('/:symbol/peers', async (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase()
  const peers = PEER_MAP[symbol] || [symbol]
  const out = []
  for (const p of peers) {
    const fx = FIN_FIXTURES[p]
    const q = await getQuote(p).catch(() => null)
    if (!fx) continue
    const r = fx.rows
    const L = (a) => a[a.length - 1]
    out.push({
      symbol: p, price: q?.price ?? null, changePercent: q?.changePercent ?? null, currency: fx.c,
      roe: +((L(r.netIncome) / L(r.equity)) * 100).toFixed(1),
      netMargin: +((L(r.netIncome) / L(r.revenue)) * 100).toFixed(1),
      debtToEquity: +((L(r.totalLiabilities) / L(r.equity)) * 100).toFixed(1),
      revenueGrowth: +(((L(r.revenue) / r.revenue[r.revenue.length - 2]) - 1) * 100).toFixed(1),
      ocfToNi: +((L(r.ocf) / L(r.netIncome)) * 100).toFixed(0),
      fcf: +(L(r.ocf) + L(r.capex)).toFixed(1), unit: fx.u,
    })
  }
  res.json({
    symbol, status: out.length ? 'demo' : 'no-data',
    source: 'So sánh trên bộ số liệu mẫu giáo dục + giá live', fetchedAt: new Date().toISOString(),
    peers: out,
    median: out.length ? { roe: med(out.map((x) => x.roe)), netMargin: med(out.map((x) => x.netMargin)), debtToEquity: med(out.map((x) => x.debtToEquity)), revenueGrowth: med(out.map((x) => x.revenueGrowth)), ocfToNi: med(out.map((x) => x.ocfToNi)) } : null,
    note: 'Câu hỏi phân tích: công ty nào tốt hơn VÌ SAO — dùng median làm mốc, không kết luận nhanh.',
  })
})

// Chỉ số cơ bản để phân tích tài chính + chú thích giáo dục cho từng chỉ số
router.get('/:symbol/fundamentals', async (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase()
  const market = marketOf(symbol)
  try {
    let data
    if (market === 'VN') {
      data = { available: false, note: 'Chỉ số tài chính chi tiết của công ty Việt Nam chưa có trong nguồn dữ liệu công khai này. Bạn có thể xem trên cafef.vn/vietstock.vn — và dùng phần Chỉ số định giá bên dưới để luyện cách đọc.' }
    } else {
      data = await usFundamentals(symbol)
    }
    res.json({ symbol, market, ...data, explain: FUNDAMENTALS_EXPLAIN })
  } catch (err) {
    res.json({
      symbol,
      market,
      available: false,
      note: 'Chưa tải được chỉ số cơ bản cho mã này (có thể là chỉ số thị trường hoặc nguồn dữ liệu tạm lỗi).',
      explain: FUNDAMENTALS_EXPLAIN,
    })
  }
})

// Danh sách cổ phiếu gợi ý sẵn để khám phá
router.get('/lists/popular', (_req, res) => {
  const vnMap = new Map()
  VN_STOCKS.forEach((s) => vnMap.set(s.symbol, s))
  res.json({
    US: US_STOCKS.slice(0, 14),
    VN: [...vnMap.values()].slice(0, 20).map((s) => ({ ...s, market: 'VN' })),
  })
})

export default router
