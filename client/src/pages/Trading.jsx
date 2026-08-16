import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { usePolling } from '../hooks.js'
import { fmtMoney, fmtPct, fmtPrice, fmtCompact } from '../format.js'
import StockSearch from '../components/StockSearch.jsx'

function WalletCard({ title, emoji, cash, total, profit, profitPct, currency }) {
  const cls = profit >= 0 ? 'up' : 'down'
  return (
    <div className="card">
      <div className="card-title">{emoji} {title}</div>
      <div className="muted" style={{ fontSize: 12 }}>Tổng tài sản</div>
      <div className="big num">{fmtMoney(total, currency)}</div>
      <div className={`num ${cls}`} style={{ fontSize: 13.5 }}>
        Lãi/lỗ: {fmtMoney(profit, currency)} ({fmtPct(profitPct)})
      </div>
      <div className="muted num" style={{ fontSize: 12.5, marginTop: 4 }}>Tiền mặt: {fmtMoney(cash, currency)}</div>
    </div>
  )
}

function OrderForm({ prefillSymbol, prefillSide, account, onDone }) {
  const [side, setSide] = useState(prefillSide === 'SELL' ? 'SELL' : 'BUY')
  const [symbol, setSymbol] = useState((prefillSymbol || '').toUpperCase())
  const [qty, setQty] = useState('')
  const [quote, setQuote] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const currency = quote?.market === 'VN' || symbol === 'VNM' ? 'VND' : quote?.currency || 'USD'
  const qtyNum = Number(qty) || 0
  const estimate = quote?.price != null && qtyNum > 0 ? quote.price * qtyNum : null

  const loadQuote = async (sym) => {
    if (!sym) return setQuote(null)
    try {
      setQuote(await api.quote(sym))
    } catch {
      setQuote(null)
    }
  }

  const submit = async () => {
    if (!symbol || qtyNum <= 0) {
      setMsg({ type: 'error', text: 'Chọn mã cổ phiếu và nhập số lượng hợp lệ.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const res = await api.order(symbol, side, qtyNum)
      setMsg({ type: 'ok', text: res.message })
      setQty('')
      onDone?.()
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  const enoughCash =
    estimate == null || !account
      ? true
      : currency === 'VND'
        ? account.cashVnd >= estimate
        : account.cashUsd >= estimate

  return (
    <div className="card">
      <div className="card-title">🛒 Đặt lệnh (giá theo báo giá hiện tại)</div>
      <div className="grid cols-2" style={{ gap: 12 }}>
        <div>
          <label className="field">
            <span>MÃ CỔ PHIẾU</span>
            <StockSearch
              placeholder={symbol || 'Tìm mã... (AAPL, VNM...)'}
              onPick={(it) => {
                setSymbol(it.symbol)
                setQuote(null)
                loadQuote(it.symbol)
              }}
            />
          </label>
          <div className="muted" style={{ fontSize: 12.5 }}>
            {symbol ? (
              <>
                Đang chọn: <b>{symbol}</b>
                {quote && (
                  <>
                    {' '}· Giá: <b className="num">{fmtPrice(quote.price, quote.currency)}</b>
                    {quote.market === 'VN' ? ' (cuối ngày)' : ' (gần thời gian thực)'}
                  </>
                )}
                {!quote && (
                  <button className="btn sm" style={{ marginLeft: 8 }} onClick={() => loadQuote(symbol)}>
                    Lấy giá
                  </button>
                )}
              </>
            ) : (
              'Tìm và chọn một mã để bắt đầu.'
            )}
          </div>
        </div>
        <div>
          <label className="field">
            <span>LOẠI LỆNH</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`btn buy ${side === 'BUY' ? '' : 'ghost'}`} style={{ flex: 1 }} onClick={() => setSide('BUY')}>
                MUA
              </button>
              <button className={`btn sell ${side === 'SELL' ? '' : 'ghost'}`} style={{ flex: 1 }} onClick={() => setSide('SELL')}>
                BÁN
              </button>
            </div>
          </label>
          <label className="field">
            <span>SỐ LƯỢNG (cổ phiếu)</span>
            <input
              className="input num"
              type="number"
              min="1"
              placeholder="VD: 10"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div
        style={{
          background: 'var(--panel-2)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          margin: '6px 0 12px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span className="muted">Ước tính giá trị lệnh</span>
        <span className="num" style={{ fontWeight: 800, fontSize: 17 }}>
          {estimate != null ? fmtMoney(estimate, currency) : '—'}
        </span>
      </div>

      {estimate != null && side === 'BUY' && !enoughCash && (
        <div className="error-box">💵 Không đủ tiền mặt trong ví {currency}. Giảm số lượng hoặc chọn ví còn dư.</div>
      )}
      {msg && (
        <div className={msg.type === 'ok' ? 'quiz-result pass' : 'error-box'} style={{ marginBottom: 12 }}>
          {msg.type === 'ok' ? '✅ ' : '⚠️ '}
          {msg.text}
        </div>
      )}

      <button
        className={`btn ${side === 'BUY' ? 'buy' : 'sell'}`}
        style={{ width: '100%' }}
        disabled={busy || (side === 'BUY' && !enoughCash)}
        onClick={submit}
      >
        {busy ? 'Đang khớp lệnh...' : `${side === 'BUY' ? '🟢 MUA' : '🔴 BÁN'} ${qtyNum > 0 ? qtyNum.toLocaleString('vi-VN') + ' cp ' : ''}${symbol || ''}`}
      </button>
      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        💡 Luyện tập đúng kỷ luật: trước khi bấm, hãy trả lời 3 câu của <Link to="/learn/quy-trinh-ra-quyet-dinh">Bài 13</Link> — mua vì sao? chốt lời ở đâu? cắt lỗ ở đâu?
      </p>
    </div>
  )
}

export default function Trading() {
  const [searchParams] = useSearchParams()
  const [version, setVersion] = useState(0)
  const { data: account } = usePolling(() => api.account(), 20000, [version])
  const { data: history } = usePolling(() => api.history(), 30000, [version])

  const positions = account?.positions || []
  const refresh = () => setVersion((v) => v + 1)

  const sellAll = async (p) => {
    if (!window.confirm(`Bán toàn bộ ${p.qty} cp ${p.symbol}?`)) return
    try {
      await api.order(p.symbol, 'SELL', p.qty)
      refresh()
    } catch (e) {
      window.alert(e.message)
    }
  }

  const reset = async () => {
    if (!window.confirm('Reset toàn bộ ví về số dư ban đầu ($100.000 + 500 triệu ₫)? Lịch sử lệnh sẽ bị xóa.')) return
    await api.resetAccount()
    refresh()
  }

  const totalUsdPositions = useMemo(
    () => positions.filter((p) => p.market === 'US').reduce((s, p) => s + p.marketValue, 0),
    [positions]
  )
  const totalVndPositions = useMemo(
    () => positions.filter((p) => p.market === 'VN').reduce((s, p) => s + p.marketValue, 0),
    [positions]
  )

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card" style={{ padding: '12px 16px' }}>
        <div className="muted" style={{ fontSize: 13 }}>
          🎓 <b>Đây là sàn luyện bằng tiền ẢO</b> — bạn được tặng $100.000 + 500 triệu ₫ để mua/bán theo giá thật,
          tự tính lãi/lỗ mà <b>không mất một đồng thật nào</b>. Lỗi ở đây rẻ nhất: mất tiền ảo, giữ lại kinh nghiệm.
          Quy trình đúng: viết 3 dòng luận điểm + giá cắt lỗ TRƯỚC, rồi mới bấm lệnh (<Link to="/learn/quy-trinh-ra-quyet-dinh">Bài 13</Link>).
        </div>
      </div>
      <div className="grid cols-2">
        <WalletCard
          title="VÍ USD — Thị trường Mỹ"
          emoji="🇺🇸"
          cash={account?.cashUsd}
          total={account?.totalUsd}
          profit={account?.profitUsd}
          profitPct={account?.profitUsdPercent}
          currency="USD"
        />
        <WalletCard
          title="VÍ VND — Thị trường Việt Nam"
          emoji="🇻🇳"
          cash={account?.cashVnd}
          total={account?.totalVnd}
          profit={account?.profitVnd}
          profitPct={account?.profitVndPercent}
          currency="VND"
        />
      </div>

      <OrderForm
        prefillSymbol={searchParams.get('symbol')}
        prefillSide={searchParams.get('side')}
        account={account}
        onDone={refresh}
      />

      <div className="card">
        <div className="card-title">
          <span>📦 Vị thế đang nắm giữ ({positions.length})</span>
          <span className="muted" style={{ fontSize: 11, textTransform: 'none' }}>
            USD đang đầu tư: {fmtMoney(totalUsdPositions)} · VND: {fmtMoney(totalVndPositions, 'VND')}
          </span>
        </div>
        {positions.length === 0 ? (
          <div className="empty">
            Chưa có vị thế nào. Đặt lệnh đầu tiên của bạn ở trên — nhớ quy tắc rủi ro của{' '}
            <Link to="/learn/quan-tri-rui-ro">Bài 14</Link>!
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th className="right">SL</th>
                <th className="right">Giá mua TB</th>
                <th className="right">Giá hiện tại</th>
                <th className="right">Giá trị</th>
                <th className="right">Lãi/lỗ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.symbol}>
                  <td>
                    <Link to={`/stock/${p.symbol}`}>
                      <b>{p.symbol}</b>
                    </Link>{' '}
                    <span className={`badge ${p.market === 'VN' ? 'vn' : 'us'}`}>{p.market}</span>
                  </td>
                  <td className="right num">{p.qty.toLocaleString('vi-VN')}</td>
                  <td className="right num">{fmtPrice(p.avg_price, p.currency)}</td>
                  <td className="right num">{fmtPrice(p.currentPrice, p.currency)}</td>
                  <td className="right num">{fmtMoney(p.marketValue, p.currency)}</td>
                  <td className={`right num ${p.profit >= 0 ? 'up' : 'down'}`}>
                    {fmtMoney(p.profit, p.currency)}
                    <div style={{ fontSize: 12 }}>{fmtPct(p.profitPercent)}</div>
                  </td>
                  <td className="right">
                    <button className="btn sm sell" onClick={() => sellAll(p)}>
                      Bán hết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-title">
          <span>📒 Lịch sử lệnh</span>
          <button className="btn sm ghost" onClick={reset} title="Reset ví">
            ♻️ Reset ví
          </button>
        </div>
        {!history || history.length === 0 ? (
          <div className="empty">Chưa có lệnh nào.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Thời điểm</th>
                <th>Lệnh</th>
                <th>Mã</th>
                <th className="right">SL</th>
                <th className="right">Giá</th>
                <th className="right">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr key={t.id}>
                  <td className="muted num" style={{ fontSize: 13 }}>{t.ts}</td>
                  <td>
                    <span className={`badge ${t.side === 'BUY' ? 'green' : 'red'}`}>{t.side === 'BUY' ? 'MUA' : 'BÁN'}</span>
                  </td>
                  <td>
                    <b>{t.symbol}</b> <span className={`badge ${t.market === 'VN' ? 'vn' : 'us'}`}>{t.market}</span>
                  </td>
                  <td className="right num">{t.qty.toLocaleString('vi-VN')}</td>
                  <td className="right num">{fmtPrice(t.price, t.market === 'VN' ? 'VND' : 'USD')}</td>
                  <td className="right num" style={{ fontWeight: 700 }}>
                    {fmtMoney(t.total, t.market === 'VN' ? 'VND' : 'USD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
