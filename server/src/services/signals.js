// Engine "Gợi ý đầu tư" dựa trên phân tích kỹ thuật quy tắc (rule-based).
// MỤC ĐÍCH GIÁO DỤC: mỗi tín hiệu đều kèm giải thích + bài học liên quan.
import { sma, ema, rsi, macd, bollinger, lastValid, crossedAbove, crossedBelow } from './indicators.js'

export const DISCLAIMER =
  'Gợi ý này được sinh tự động từ các chỉ báo kỹ thuật, chỉ phục vụ mục đích HỌC TẬP. ' +
  'Đây không phải lời khuyên đầu tư. Thị trường luôn có rủi ro, hãy tự nghiên cứu kỹ trước khi ra quyết định.'

export function analyzeCandles(candles) {
  const closes = candles.map((c) => c.close)
  const volumes = candles.map((c) => c.volume)
  const n = candles.length
  const last = candles[n - 1]

  const ma20 = sma(closes, 20)
  const ma50 = sma(closes, 50)
  const ma200 = sma(closes, 200)
  const ema20 = ema(closes, 20)
  const rsi14 = rsi(closes, 14)
  const { macd: macdLine, signal: macdSignal, hist } = macd(closes)
  const bb = bollinger(closes, 20, 2)
  const volAvg20 = sma(volumes.map((v) => Number(v) || 0), 20)

  const price = last.close
  const rsiNow = lastValid(rsi14)
  const ma20v = lastValid(ma20)
  const ma50v = lastValid(ma50)
  const ma200v = lastValid(ma200)
  const bbU = lastValid(bb.upper)
  const bbL = lastValid(bb.lower)
  const histNow = lastValid(hist)
  const volNow = Number(last.volume) || 0
  const volAvg = lastValid(volAvg20) || volNow || 1

  const signals = []
  let score = 0 // điểm dương = thiên về mua, âm = thiên về bán

  // 1) RSI - động lượng
  if (rsiNow != null) {
    if (rsiNow < 30) {
      score += 2
      signals.push({
        type: 'bull',
        weight: 2,
        title: `RSI = ${rsiNow.toFixed(1)} — vùng QUÁ BÁN`,
        detail:
          'RSI dưới 30 cho thấy áp lực bán đã mạnh và kéo dài, giá có thể đang bị "bán quá mức" nên khả năng hồi phục tăng. Tuy nhiên trong xu hướng giảm mạnh, RSI có thể giữ ở vùng thấp lâu — hãy kết hợp xu hướng dài hạn.',
        lessonId: 'rsi-dong-luong',
        terms: ['RSI', 'Quá bán (Oversold)', 'Động lượng (Momentum)'],
      })
    } else if (rsiNow > 70) {
      score -= 2
      signals.push({
        type: 'bear',
        weight: 2,
        title: `RSI = ${rsiNow.toFixed(1)} — vùng QUÁ MUA`,
        detail:
          'RSI trên 70 cho thấy sóng mua rất mạnh, giá có thể tăng "quá nóng" và nguy cơ điều chỉnh ngắn hạn cao. Nên thận trọng khi mua thêm ở vùng này.',
        lessonId: 'rsi-dong-luong',
        terms: ['RSI', 'Quá mua (Overbought)'],
      })
    } else {
      signals.push({
        type: 'neutral',
        weight: 0,
        title: `RSI = ${rsiNow.toFixed(1)} — vùng trung tính`,
        detail:
          'RSI giữa 30 và 70 cho thấy động lượng cân bằng, chưa có tín hiệu quá mua/quá bán. Hãy chờ RSI tiến về vùng biên hoặc dùng thêm chỉ báo khác xác nhận.',
        lessonId: 'rsi-dong-luong',
        terms: ['RSI'],
      })
    }
  }

  // 2) MA20 giao cắt MA50 (golden/death cross ngắn hạn)
  if (crossedAbove(ma20, ma50, 5)) {
    score += 2
    signals.push({
      type: 'bull',
      weight: 2,
      title: 'MA20 cắt LÊN MA50 — "Golden Cross" ngắn hạn',
      detail:
        'Đường trung bình 20 ngày cắt lên 20 phiên vượt 50 ngày: xu hướng ngắn hạn đang chuyển sang tăng. Đây là một trong những tín hiệu theo xu hướng kinh điển.',
      lessonId: 'duong-trung-binh-ma',
      terms: ['MA (Đường trung bình)', 'Golden Cross'],
    })
  } else if (crossedBelow(ma20, ma50, 5)) {
    score -= 2
    signals.push({
      type: 'bear',
      weight: 2,
      title: 'MA20 cắt XUỐNG MA50 — "Death Cross" ngắn hạn',
      detail:
        'MA20 cắt xuống MA50: động lượng tăng gần đây suy yếu, xu hướng ngắn hạn có thể chuyển sang giảm. Cân nhắc giảm tỷ trọng hoặc đặt điểm cắt lỗ.',
      lessonId: 'duong-trung-binh-ma',
      terms: ['MA (Đường trung bình)', 'Death Cross'],
    })
  }

  // 3) Xu hướng dài hạn qua MA200
  if (ma200v != null) {
    if (price > ma200v) {
      score += 1
      signals.push({
        type: 'bull',
        weight: 1,
        title: 'Giá đang TRÊN MA200 — xu hướng dài hạn tích cực',
        detail:
          'Giá trên đường trung bình 200 ngày thường được xem là thị trường hướng tăng dài hạn. Nhà đầu tư giá trị thường chỉ mua khi điều kiện này đúng.',
        lessonId: 'duong-trung-binh-ma',
        terms: ['MA (Đường trung bình)', 'Xu hướng (Trend)'],
      })
    } else {
      score -= 1
      signals.push({
        type: 'bear',
        weight: 1,
        title: 'Giá đang DƯỚI MA200 — xu hướng dài hạn yếu',
        detail:
          'Giá dưới MA200 cho thấy xu hướng dài hạn đang giảm. Mua trong vùng này là "chơi ngược xu hướng" — rủi ro cao hơn hẳn, cần kế hoạch rõ ràng.',
        lessonId: 'duong-trung-binh-ma',
        terms: ['MA (Đường trung bình)', 'Xu hướng (Trend)'],
      })
    }
  }

  // 4) MACD histogram cắt 0
  if (histNow != null) {
    if (crossedAbove(hist, hist.map(() => 0), 3)) {
      score += 1
      signals.push({
        type: 'bull',
        weight: 1,
        title: 'MACD histogram vừa chuyển DƯƠNG',
        detail:
          'Histogram MACD vượt lên trên 0 nghĩa là đường MACD cắt lên đường tín hiệu — động lượng tăng đang chiếm ưu thế trong ngắn hạn.',
        lessonId: 'macd-hoi-tu-phan-ky',
        terms: ['MACD', 'Đường tín hiệu (Signal line)'],
      })
    } else if (crossedBelow(hist, hist.map(() => 0), 3)) {
      score -= 1
      signals.push({
        type: 'bear',
        weight: 1,
        title: 'MACD histogram vừa chuyển ÂM',
        detail:
          'Histogram MACD xuống dưới 0 = MACD cắt xuống đường tín hiệu, động lượng giảm đang mạnh lên. Với người mua, đây là tín hiệu cảnh báo.',
        lessonId: 'macd-hoi-tu-phan-ky',
        terms: ['MACD'],
      })
    } else {
      signals.push({
        type: 'neutral',
        weight: 0,
        title: `MACD histogram = ${histNow >= 0 ? '+' : ''}${histNow.toFixed(2)}`,
        detail:
          histNow >= 0
            ? 'Histogram dương: động lượng tăng vẫn duy trì nhưng chưa có bước ngoặt mới trong vài phiên gần đây.'
            : 'Histogram âm: động lượng giảm vẫn duy trì, chưa có tín hiệu đảo chiều từ MACD.',
        lessonId: 'macd-hoi-tu-phan-ky',
        terms: ['MACD'],
      })
    }
  }

  // 5) Bollinger Bands — giãn cách biên độ
  if (bbU != null && bbL != null && price) {
    if (price <= bbL) {
      score += 1
      signals.push({
        type: 'bull',
        weight: 1,
        title: 'Giá chạm/dưới dải DƯỚI Bollinger',
        detail:
          'Giá chạm dải dưới cho thấy biến động đẩy giá về vùng cực thấp của 20 phiên gần nhất — thường đi kèm khả năng bật lại về đường giữa. Phù hợp phong cách giao dịch đảo chiều ngắn hạn.',
        lessonId: 'bollinger-bands',
        terms: ['Bollinger Bands', 'Biến động (Volatility)'],
      })
    } else if (price >= bbU) {
      score -= 1
      signals.push({
        type: 'bear',
        weight: 1,
        title: 'Giá chạm/vượt dải TRÊN Bollinger',
        detail:
          'Giá trên dải trên = sóng mua rất mạnh trong ngắn hạn, nhưng cũng là vùng dễ hạ nhiệt. Với người theo dõi Bollinger, đây là lúc chốt lời từng phần thay vì mua thêm.',
        lessonId: 'bollinger-bands',
        terms: ['Bollinger Bands', 'Biến động (Volatility)'],
      })
    }
  }

  // 6) Khối lượng xác nhận
  if (volNow > volAvg * 1.8) {
    const up = last.close >= last.open
    if (up) {
      score += 1
      signals.push({
        type: 'bull',
        weight: 1,
        title: `Khối lượng cao bất thường (+${(((volNow / volAvg) - 1) * 100).toFixed(0)}%) kèm nến tăng`,
        detail:
          'Khối lượng lớn hơn hẳn bình quân 20 phiên trong khi giá tăng cho thấy dòng tiền thật sự đổ vào ("dư cầu"). Biến động mạnh có khả năng tiếp diễn.',
        lessonId: 'khoi-luong-xu-huong',
        terms: ['Khối lượng (Volume)', 'Nến tăng/nến giảm'],
      })
    } else {
      score -= 1
      signals.push({
        type: 'bear',
        weight: 1,
        title: `Khối lượng cao bất thường (+${(((volNow / volAvg) - 1) * 100).toFixed(0)}%) kèm nến giảm`,
        detail:
          'Khối lượng đột biến khi giá giảm cho thấy áp lực bán lớn và thật sự (không phải thiếu thanh khoản). Cần thận trọng với tín hiệu mua ngược.',
        lessonId: 'khoi-luong-xu-huong',
        terms: ['Khối lượng (Volume)'],
      })
    }
  }

  let overall = 'TRUNG TÍNH'
  if (score >= 3) overall = 'MUA (học tập)'
  else if (score >= 1) overall = 'THIÊN VỀ MUA'
  else if (score <= -3) overall = 'BÁN/GIẢM TỶ TRỌNG (học tập)'
  else if (score <= -1) overall = 'THIÊN VỀ BÁN'

  return {
    overall,
    score,
    signals,
    indicators: {
      price,
      rsi14: rsiNow,
      ma20: ma20v,
      ma50: ma50v,
      ma200: ma200v,
      macd: lastValid(macdLine),
      macdSignal: lastValid(macdSignal),
      macdHist: histNow,
      bbUpper: bbU,
      bbLower: bbL,
      volume: volNow,
      volumeAvg20: volAvg,
    },
    series: {
      ma20,
      ma50,
      ma200,
      ema20,
      bbUpper: bb.upper,
      bbLower: bb.lower,
      rsi14,
      macd: macdLine,
      macdSignal,
      macdHist: hist,
    },
    disclaimer: DISCLAIMER,
  }
}
