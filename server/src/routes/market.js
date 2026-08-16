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
