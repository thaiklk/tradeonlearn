import { useEffect, useRef, useState } from 'react'
import { ColorType, CrosshairMode, LineStyle, createChart } from 'lightweight-charts'
import ChartGuideModal from './ChartGuideModal.jsx'

const BASE_OPTIONS = {
  layout: {
    background: { type: ColorType.Solid, color: 'transparent' },
    textColor: '#8b96ad',
    fontSize: 11,
  },
  grid: {
    vertLines: { color: '#1a243855' },
    horzLines: { color: '#1a243855' },
  },
  rightPriceScale: { borderColor: '#1f2a40' },
  timeScale: { borderColor: '#1f2a40', timeVisible: false },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: { color: '#4f8cff88', labelBackgroundColor: '#4f8cff' },
    horzLine: { color: '#4f8cff88', labelBackgroundColor: '#4f8cff' },
  },
}

// Ghép series giá trị với mốc thời gian của nến, bỏ null
function alignSeries(candles, values) {
  if (!values || !candles) return []
  const out = []
  for (let i = 0; i < candles.length; i++) {
    const v = values[i]
    if (v != null && Number.isFinite(v)) out.push({ time: candles[i].time, value: v })
  }
  return out
}

// Bộ 3 biểu đồ đồng bộ: Nến+KL | RSI | MACD — bấm vào biểu đồ để mở hướng dẫn đọc
export default function AnalysisCharts({
  symbol = '?',
  market = 'US',
  currency = 'USD',
  candles,
  series,
  toggles,
  ranges,
  compact = false,
}) {
  const priceRef = useRef(null)
  const rsiRef = useRef(null)
  const macdRef = useRef(null)
  const [guide, setGuide] = useState(null) // {kind, idx|null}

  const priceH = compact ? 300 : 380
  const subH = compact ? 110 : 140

  useEffect(() => {
    if (!candles?.length || !priceRef.current || !rsiRef.current || !macdRef.current) return

    const indexOfTime = (time) => candles.findIndex((c) => c.time === time)

    /* ---------- Chart 1: Nến + Khối lượng + MA/BB ---------- */
    const priceChart = createChart(priceRef.current, {
      ...BASE_OPTIONS,
      width: priceRef.current.clientWidth,
      height: priceRef.current.clientHeight,
    })
    const candleSeries = priceChart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55eaa',
      wickDownColor: '#ef4444aa',
    })
    candleSeries.setData(candles)

    const volumeSeries = priceChart.addHistogramSeries({
      priceScaleId: 'vol',
      priceFormat: { type: 'volume' },
      priceLineVisible: false,
      lastValueVisible: false,
    })
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? '#22c55e3d' : '#ef44443d',
      }))
    )
    priceChart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.86, bottom: 0 } })

    const addOverlay = (data, color, title, width = 1, dashed = false) => {
      if (!data.length) return
      const s = priceChart.addLineSeries({
        color,
        lineWidth: width,
        title,
        lineStyle: dashed ? LineStyle.Dashed : LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
      s.setData(data)
    }
    if (toggles.ma20) addOverlay(alignSeries(candles, series.ma20), '#f59e0b', 'MA20')
    if (toggles.ma50) addOverlay(alignSeries(candles, series.ma50), '#4f8cff', 'MA50')
    if (toggles.ma200) addOverlay(alignSeries(candles, series.ma200), '#a78bfa', 'MA200', 2)
    if (toggles.bb) {
      addOverlay(alignSeries(candles, series.bbUpper), '#22d3ee88', 'BB+', 1, true)
      addOverlay(alignSeries(candles, series.bbLower), '#22d3ee88', 'BB-', 1, true)
    }

    /* ---------- Chart 2: RSI ---------- */
    const rsiChart = createChart(rsiRef.current, {
      ...BASE_OPTIONS,
      width: rsiRef.current.clientWidth,
      height: rsiRef.current.clientHeight,
    })
    const rsiLine = rsiChart.addLineSeries({ color: '#a78bfa', lineWidth: 2, priceLineVisible: false })
    rsiLine.setData(alignSeries(candles, series.rsi14))
    rsiLine.createPriceLine({
      price: 70, color: '#ef444499', lineStyle: LineStyle.Dashed, lineWidth: 1,
      title: 'Quá mua 70', axisLabelVisible: true,
    })
    rsiLine.createPriceLine({
      price: 30, color: '#22c55e99', lineStyle: LineStyle.Dashed, lineWidth: 1,
      title: 'Quá bán 30', axisLabelVisible: true,
    })
    rsiChart.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.08 } })

    /* ---------- Chart 3: MACD ---------- */
    const macdChart = createChart(macdRef.current, {
      ...BASE_OPTIONS,
      width: macdRef.current.clientWidth,
      height: macdRef.current.clientHeight,
    })
    const histSeries = macdChart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false })
    histSeries.setData(
      alignSeries(candles, series.macdHist).map((p) => ({ ...p, color: p.value >= 0 ? '#22c55e66' : '#ef444466' }))
    )
    const macdLine = macdChart.addLineSeries({ color: '#4f8cff', lineWidth: 2, priceLineVisible: false, title: 'MACD' })
    macdLine.setData(alignSeries(candles, series.macd))
    const signalLine = macdChart.addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false, title: 'Signal' })
    signalLine.setData(alignSeries(candles, series.macdSignal))
    macdChart.priceScale().applyOptions({ scaleMargins: { top: 0.15, bottom: 0.08 } })

    /* ---------- Bấm vào biểu đồ → mở hướng dẫn đọc ---------- */
    const clickPrice = (param) => {
      if (param.time == null) return setGuide({ kind: 'candle', idx: null })
      const idx = indexOfTime(param.time)
      setGuide({ kind: 'candle', idx: idx >= 0 ? idx : null })
    }
    const clickSub = (kind) => (param) => {
      if (param.time == null) return setGuide({ kind, idx: null })
      const idx = indexOfTime(param.time)
      setGuide({ kind, idx: idx >= 0 ? idx : null })
    }
    priceChart.subscribeClick(clickPrice)
    rsiChart.subscribeClick(clickSub('rsi'))
    macdChart.subscribeClick(clickSub('macd'))

    /* ---------- Đồng bộ 3 chart ---------- */
    const charts = [priceChart, rsiChart, macdChart]
    let syncing = false
    const unsubscribers = charts.map((chart, i) => {
      const handler = (range) => {
        if (!range || syncing) return
        syncing = true
        charts.forEach((other, j) => {
          if (i !== j) other.timeScale().setVisibleLogicalRange(range)
        })
        syncing = false
      }
      chart.timeScale().subscribeVisibleLogicalRangeChange(handler)
      return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(handler)
    })

    priceChart.applyOptions({
      timeScale: { ...BASE_OPTIONS.timeScale, timeVisible: ranges?.intraday === true },
    })
    charts.forEach((c) => c.timeScale().fitContent())

    /* ---------- Resize ---------- */
    const observers = [priceRef, rsiRef, macdRef].map((ref) => {
      const ob = new ResizeObserver(() => {
        if (!ref.current) return
        priceChart.applyOptions({ width: priceRef.current.clientWidth, height: priceRef.current.clientHeight })
        rsiChart.applyOptions({ width: rsiRef.current.clientWidth, height: rsiRef.current.clientHeight })
        macdChart.applyOptions({ width: macdRef.current.clientWidth, height: macdRef.current.clientHeight })
      })
      ob.observe(ref.current)
      return ob
    })

    return () => {
      priceChart.unsubscribeClick(clickPrice)
      rsiChart.unsubscribeClick(clickSub('rsi'))
      macdChart.unsubscribeClick(clickSub('macd'))
      unsubscribers.forEach((u) => u())
      observers.forEach((o) => o.disconnect())
      charts.forEach((c) => c.remove())
    }
  }, [candles, series, toggles])

  const labelBtn = (kind) => (
    <button
      className="btn sm ghost"
      style={{ padding: '1px 8px', fontSize: 11, marginLeft: 6 }}
      onClick={() => setGuide({ kind, idx: null })}
    >
      ℹ️ Cách đọc
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="chart-box">
        <span className="chart-label" style={{ display: 'flex', alignItems: 'center' }}>
          NẾN GIÁ · KHỐI LƯỢNG {labelBtn('candle')}
        </span>
        <div ref={priceRef} className="chart-price" style={{ height: priceH }} />
      </div>
      <div className="chart-box">
        <span className="chart-label" style={{ display: 'flex', alignItems: 'center' }}>
          RSI (14) — ĐỘNG LƯỢNG {labelBtn('rsi')}
        </span>
        <div ref={rsiRef} className="chart-sub" style={{ height: subH }} />
      </div>
      <div className="chart-box">
        <span className="chart-label" style={{ display: 'flex', alignItems: 'center' }}>
          MACD (12, 26, 9) — BƯỚC NGOẶT {labelBtn('macd')}
        </span>
        <div ref={macdRef} className="chart-sub" style={{ height: subH }} />
      </div>
      <div className="muted" style={{ fontSize: 12 }}>
        💡 Mẹo học: <b>bấm vào bất kỳ cây nến / điểm RSI / cột MACD</b> để mở hướng dẫn đọc chi tiết đúng thời điểm đó —
        kèm bài học & thuật ngữ liên quan.
      </div>

      {guide && (
        <ChartGuideModal
          kind={guide.kind}
          idx={guide.idx}
          symbol={symbol}
          market={market}
          currency={currency}
          candles={candles}
          series={series}
          onClose={() => setGuide(null)}
        />
      )}
    </div>
  )
}
