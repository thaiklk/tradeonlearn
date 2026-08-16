// Giao dịch giả lập (paper trading): ví USD 100.000 + ví VND 500 triệu, giá theo báo giá thật.
import { Router } from 'express'
import db, { ensureWorkspace } from '../db.js'
import { persistWorkspace } from '../cloudState.js'
import { getQuote, marketOf, stockName } from '../services/marketService.js'
import { asyncHandler } from '../http.js'

const router = Router()

function getAccount(userId) {
  ensureWorkspace(userId)
  return db.prepare('SELECT * FROM user_accounts WHERE user_id = ?').get(userId)
}

async function enrichPositions(userId) {
  const rows = db.prepare('SELECT * FROM user_positions WHERE user_id = ?').all(userId)
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

async function portfolioSummary(userId) {
  const account = getAccount(userId)
  const positions = await enrichPositions(userId)
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

router.get('/account', async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  res.json(await portfolioSummary(userId))
})

router.get('/history', (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  const trades = db.prepare('SELECT * FROM user_trades WHERE user_id = ? ORDER BY id DESC LIMIT 100').all(userId)
  res.json(trades)
})

router.post('/order', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
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
      const account = getAccount(userId)
      const position = db.prepare('SELECT * FROM user_positions WHERE user_id = ? AND symbol = ?').get(userId, sym)

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
          db.prepare('UPDATE user_positions SET qty = ?, avg_price = ?, updated_at = datetime("now") WHERE user_id = ? AND symbol = ?').run(
            newQty,
            newAvg,
            userId,
            sym
          )
        } else {
          db.prepare('INSERT INTO user_positions (user_id, symbol, market, qty, avg_price) VALUES (?, ?, ?, ?, ?)').run(
            userId,
            sym,
            market,
            quantity,
            price
          )
        }
        const cashAfter = (market === 'VN' ? account.cash_vnd : account.cash_usd) - total
        if (market === 'VN') db.prepare('UPDATE user_accounts SET cash_vnd = ? WHERE user_id = ?').run(cashAfter, userId)
        else db.prepare('UPDATE user_accounts SET cash_usd = ? WHERE user_id = ?').run(cashAfter, userId)
        db.prepare(
          'INSERT INTO user_trades (user_id, symbol, market, side, qty, price, total, cash_after) VALUES (?,?,?,?,?,?,?,?)'
        ).run(userId, sym, market, side, quantity, price, total, cashAfter)
        return { message: `Đã MUA ${quantity} cp ${sym} @ ${price.toLocaleString('vi-VN')}`, cashAfter }
      }

      // SELL
      if (!position || position.qty + 1e-9 < quantity) {
        throw new OrderError(
          position ? `Bạn chỉ đang giữ ${position.qty} cp ${sym}, không đủ để bán ${quantity}` : `Bạn chưa giữ cp ${sym} nào`
        )
      }
      const newQty = position.qty - quantity
      if (newQty <= 1e-9) db.prepare('DELETE FROM user_positions WHERE user_id = ? AND symbol = ?').run(userId, sym)
      else db.prepare('UPDATE user_positions SET qty = ?, updated_at = datetime("now") WHERE user_id = ? AND symbol = ?').run(newQty, userId, sym)
      const cashAfter = (market === 'VN' ? account.cash_vnd : account.cash_usd) + total
      if (market === 'VN') db.prepare('UPDATE user_accounts SET cash_vnd = ? WHERE user_id = ?').run(cashAfter, userId)
      else db.prepare('UPDATE user_accounts SET cash_usd = ? WHERE user_id = ?').run(cashAfter, userId)
      db.prepare('INSERT INTO user_trades (user_id, symbol, market, side, qty, price, total, cash_after) VALUES (?,?,?,?,?,?,?,?)').run(
        userId,
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

    await persistWorkspace(userId)
    res.json({ ok: true, ...result, account: await portfolioSummary(userId) })
  } catch (err) {
    if (err instanceof OrderError) return res.status(400).json({ error: err.message })
    throw err
  }
}))

router.post('/reset', asyncHandler(async (req, res) => {
  const userId = ensureWorkspace(req.workspaceId)
  db.transaction(() => {
    db.prepare('DELETE FROM user_positions WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM user_trades WHERE user_id = ?').run(userId)
    db.prepare('UPDATE user_accounts SET cash_usd = starting_usd, cash_vnd = starting_vnd WHERE user_id = ?').run(userId)
  })()
  await persistWorkspace(userId)
  res.json({ ok: true, message: 'Đã reset ví về số dư ban đầu' })
}))

class OrderError extends Error {}

export default router
