// Giao dịch giả lập (paper trading): ví USD 100.000 + ví VND 500 triệu, giá theo báo giá thật.
import { Router } from 'express'
import db from '../db.js'
import { getQuote, marketOf, stockName } from '../services/marketService.js'

const router = Router()

function getAccount() {
  return db.prepare('SELECT * FROM account WHERE id = 1').get()
}

async function enrichPositions() {
  const rows = db.prepare('SELECT * FROM positions').all()
  const quotes = rows.length ? await Promise.all(rows.map((r) => getQuote(r.symbol))) : []
  return rows.map((r, i) => {
    const q = quotes[i]
    const marketValue = q?.price != null ? q.price * r.qty : r.avg_price * r.qty
    const cost = r.avg_price * r.qty
    const profit = marketValue - cost
    return {
      ...r,
      name: stockName(r.symbol),
      currentPrice: q?.price ?? null,
      changePercent: q?.changePercent ?? null,
      marketValue,
      cost,
      profit,
      profitPercent: cost ? (profit / cost) * 100 : 0,
      currency: r.market === 'VN' ? 'VND' : 'USD',
    }
  })
}

async function portfolioSummary() {
  const account = getAccount()
  const positions = await enrichPositions()
  const usdValue = positions.filter((p) => p.market === 'US').reduce((s, p) => s + p.marketValue, 0)
  const vndValue = positions.filter((p) => p.market === 'VN').reduce((s, p) => s + p.marketValue, 0)
  const usdProfit = positions.filter((p) => p.market === 'US').reduce((s, p) => s + p.profit, 0)
  const vndProfit = positions.filter((p) => p.market === 'VN').reduce((s, p) => s + p.profit, 0)
  const usdTotal = account.cash_usd + usdValue
  const vndTotal = account.cash_vnd + vndValue
  return {
    cashUsd: account.cash_usd,
    cashVnd: account.cash_vnd,
    startingUsd: account.starting_usd,
    startingVnd: account.starting_vnd,
    investedUsdValue: usdValue,
    investedVndValue: vndValue,
    totalUsd: usdTotal,
    totalVnd: vndTotal,
    profitUsd: usdTotal - account.starting_usd,
    profitVnd: vndTotal - account.starting_vnd,
    profitUsdPercent: account.starting_usd ? ((usdTotal - account.starting_usd) / account.starting_usd) * 100 : 0,
    profitVndPercent: account.starting_vnd ? ((vndTotal - account.starting_vnd) / account.starting_vnd) * 100 : 0,
    openProfitUsd: usdProfit,
    openProfitVnd: vndProfit,
    positions,
  }
}

router.get('/account', async (_req, res) => {
  res.json(await portfolioSummary())
})

router.get('/history', (_req, res) => {
  const trades = db.prepare('SELECT * FROM trades ORDER BY id DESC LIMIT 100').all()
  res.json(trades)
})

router.post('/order', async (req, res) => {
  const { symbol, side, qty } = req.body || {}
  const sym = String(symbol || '').toUpperCase()
  const quantity = Number(qty)
  if (!sym) return res.status(400).json({ error: 'Thiếu mã cổ phiếu' })
  if (!['BUY', 'SELL'].includes(side)) return res.status(400).json({ error: 'Lệnh phải là BUY hoặc SELL' })
  if (!Number.isFinite(quantity) || quantity <= 0)
    return res.status(400).json({ error: 'Số lượng phải là số dương' })

  const market = marketOf(sym)
  const quote = await getQuote(sym)
  if (quote?.price == null) return res.status(502).json({ error: 'Không lấy được giá hiện tại' })
  const price = quote.price
  const total = price * quantity

  try {
    const result = db.transaction(() => {
      const account = getAccount()
      const position = db.prepare('SELECT * FROM positions WHERE symbol = ?').get(sym)

      if (side === 'BUY') {
        const cash = market === 'VN' ? account.cash_vnd : account.cash_usd
        if (total > cash + 1e-9) {
          throw new OrderError(
            `Không đủ tiền mặt: cần ${(market === 'VN' ? total : total).toLocaleString('vi-VN')} ${market === 'VN' ? '₫' : '$'}, hiện có ${cash.toLocaleString('vi-VN')} ${market === 'VN' ? '₫' : '$'}`
          )
        }
        if (position) {
          const newQty = position.qty + quantity
          const newAvg = (position.avg_price * position.qty + total) / newQty
          db.prepare('UPDATE positions SET qty = ?, avg_price = ?, updated_at = datetime("now") WHERE symbol = ?').run(
            newQty,
            newAvg,
            sym
          )
        } else {
          db.prepare('INSERT INTO positions (symbol, market, qty, avg_price) VALUES (?, ?, ?, ?)').run(
            sym,
            market,
            quantity,
            price
          )
        }
        const cashAfter = (market === 'VN' ? account.cash_vnd : account.cash_usd) - total
        if (market === 'VN') db.prepare('UPDATE account SET cash_vnd = ? WHERE id = 1').run(cashAfter)
        else db.prepare('UPDATE account SET cash_usd = ? WHERE id = 1').run(cashAfter)
        db.prepare(
          'INSERT INTO trades (symbol, market, side, qty, price, total, cash_after) VALUES (?,?,?,?,?,?,?)'
        ).run(sym, market, side, quantity, price, total, cashAfter)
        return { message: `Đã MUA ${quantity} cp ${sym} @ ${price.toLocaleString('vi-VN')}`, cashAfter }
      }

      // SELL
      if (!position || position.qty + 1e-9 < quantity) {
        throw new OrderError(
          position ? `Bạn chỉ đang giữ ${position.qty} cp ${sym}, không đủ để bán ${quantity}` : `Bạn chưa giữ cp ${sym} nào`
        )
      }
      const newQty = position.qty - quantity
      if (newQty <= 1e-9) db.prepare('DELETE FROM positions WHERE symbol = ?').run(sym)
      else db.prepare('UPDATE positions SET qty = ?, updated_at = datetime("now") WHERE symbol = ?').run(newQty, sym)
      const cashAfter = (market === 'VN' ? account.cash_vnd : account.cash_usd) + total
      if (market === 'VN') db.prepare('UPDATE account SET cash_vnd = ? WHERE id = 1').run(cashAfter)
      else db.prepare('UPDATE account SET cash_usd = ? WHERE id = 1').run(cashAfter)
      db.prepare('INSERT INTO trades (symbol, market, side, qty, price, total, cash_after) VALUES (?,?,?,?,?,?,?)').run(
        sym,
        market,
        side,
        quantity,
        price,
        total,
        cashAfter
      )
      return { message: `Đã BÁN ${quantity} cp ${sym} @ ${price.toLocaleString('vi-VN')}`, cashAfter }
    })()

    res.json({ ok: true, ...result, account: await portfolioSummary() })
  } catch (err) {
    if (err instanceof OrderError) return res.status(400).json({ error: err.message })
    throw err
  }
})

router.post('/reset', (_req, res) => {
  db.transaction(() => {
    db.prepare('DELETE FROM positions').run()
    db.prepare('DELETE FROM trades').run()
    db.prepare('UPDATE account SET cash_usd = starting_usd, cash_vnd = starting_vnd WHERE id = 1').run()
  })()
  res.json({ ok: true, message: 'Đã reset ví về số dư ban đầu' })
})

class OrderError extends Error {}

export default router
