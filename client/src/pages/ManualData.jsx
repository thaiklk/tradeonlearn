import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

// Phase 7 — Nhập tay BCTC Việt Nam (từ cafef/vietstock, báo cáo ĐÃ KIỂM TOÁN)
// Nguyên tắc: dữ liệu "người học nhập" — tách biệt, không bao giờ gọi là live
const COLS = [
  ['revenue', 'Doanh thu'], ['grossProfit', 'LN gộp'], ['operatingIncome', 'LN hoạt động'], ['netIncome', 'LN ròng'],
  ['totalAssets', 'Tổng tài sản'], ['totalLiabilities', 'Nợ phải trả'], ['equity', 'Vốn chủ'],
  ['ocf', 'Tiền từ kinh doanh (OCF)'], ['capex', 'Đầu tư (CAPEX, số dương)'], ['receivables', 'Phải thu'],
  ['inventory', 'Tồn kho'], ['goodwill', 'Goodwill'], ['shares', 'Số cp (tỷ cp)'],
]
const TEMPLATE = 'kỳ,' + COLS.map((c) => c[0]).join(',') + '\nFY2024,,,,,,\nFY2023,,,,,,'
const num = (v) => { const n = Number(String(v ?? '').replace(/[,;\s]/g, '')); return Number.isFinite(n) ? n : null }

function parseCsv(text) {
  const lines = String(text || '').split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return []
  const head = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase().replace(/kỳ|ky/, 'period'))
  const rows = []
  for (const line of lines.slice(1)) {
    const cells = line.split(/[,;\t]/)
    const row = {}
    head.forEach((h, i) => { row[h] = cells[i] })
    if (!row.period || !/^(FY)?\d{4}(-\d{2})?/i.test(String(row.period).trim())) continue
    let has = false
    for (const c of COLS) { const v = num(row[c[0]]); if (v != null) { row[c[0]] = v; has = true } else delete row[c[0]] }
    if (has) rows.push(row)
  }
  return rows
}
const ratiosOf = (d) => ({
  'Biên ròng %': d.revenue && d.netIncome != null ? ((d.netIncome / d.revenue) * 100).toFixed(1) : null,
  'ROE %': d.equity && d.netIncome != null ? ((d.netIncome / d.equity) * 100).toFixed(1) : null,
  'Nợ/Vốn %': d.equity && d.totalLiabilities != null ? ((d.totalLiabilities / d.equity) * 100).toFixed(1) : null,
  'OCF/LN %': d.netIncome && d.ocf != null ? ((d.ocf / d.netIncome) * 100).toFixed(0) : null,
  'FCF': d.ocf != null && d.capex != null ? (d.ocf - d.capex).toFixed(1) : null,
})

export default function ManualData() {
  const params = useParams()
  const [symbol, setSymbol] = useState(params.symbol || '')
  const [csv, setCsv] = useState('')
  const [source, setSource] = useState('')
  const [msg, setMsg] = useState(null)
  const [version, setVersion] = useState(0)
  const active = (params.symbol || symbol).toUpperCase()
  const { data, setData } = useApi(() => (active ? api.manualGet(active) : Promise.resolve(null)), [active, version])

  const submit = async () => {
    const rows = parseCsv(csv)
    if (!rows.length) return setMsg({ type: 'error', text: 'Không dòng nào hợp lệ. Dòng 1 phải là header đúng mẫu; mỗi dòng sau: kỳ (VD FY2024) + số liệu.' })
    try {
      const r = await api.manualPost(active, { source, rows })
      setMsg({ type: 'ok', text: `Đã lưu ${r.inserted} kỳ cho ${active} (nhãn: dữ liệu người học nhập).` })
      setCsv('')
      api.manualGet(active).then(setData).catch(() => {})
    } catch (e) { setMsg({ type: 'error', text: e.message }) }
  }
  const dl = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF' + TEMPLATE], { type: 'text/csv;charset=utf-8' })); a.download = 'mau-bctc.csv'; a.click() }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>✍️ Nhập BCTC Việt Nam bằng tay</h1>
      <p className="muted" style={{ margin: '6px 0 12px', fontSize: 13.5 }}>
        Tra <b>cafef.vn / vietstock.vn</b> → trang mã → "Báo cáo tài chính" (chọn bản <b>đã kiểm toán</b>) → copy số vào
        mẫu dưới. Mọi số liệu sẽ được gắn nhãn <span className="badge demo">DỮ LIỆU NGƯỜI HỌC NHẬP</span> — tách biệt
        hoàn toàn với dữ liệu live, chỉ phục vụ luyện phân tích. Xem <Link to="/learn/bao-cao-tai-chinh-1-can-doi">Bài 9-11</Link> để biết mỗi dòng nghĩa là gì.
      </p>
      <div className="card">
        <div className="card-title">
          <span>1. Mã & nguồn</span>
          <button className="btn sm" onClick={dl}>⬇ Tải mẫu CSV</button>
        </div>
        <div className="grid cols-2" style={{ gap: 10 }}>
          <input className="input" placeholder="Mã (VD: HPG, SHB...)" value={params.symbol || symbol} disabled={!!params.symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
          <input className="input" placeholder="Nguồn & ngày đọc (VD: cafef HPG BCTC kiểm toán 2024, đọc 16/08)" value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Đơn vị mặc định: <b>tỷ đồng</b> (USD thì ghi rõ trong nguồn). CAPEX nhập số dương.</div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-title">2. Dán CSV (dòng 1 = header mẫu; có thể dán nhiều năm)</div>
        <textarea className="input mono" rows={5} style={{ fontSize: 12.5 }} placeholder={TEMPLATE} value={csv} onChange={(e) => setCsv(e.target.value)} />
        <div className="muted" style={{ fontSize: 12, margin: '6px 0 10px' }}>
          Cột: kỳ, {COLS.map((c) => c[1]).join(', ')} — điền được cột nào thì điền, bỏ trống phần còn lại.
        </div>
        <button className="btn primary" style={{ width: '100%' }} disabled={!active} onClick={submit}>💾 Lưu {active || ''} (nhãn: người học nhập)</button>
        {msg && <div className={msg.type === 'ok' ? 'quiz-result pass' : 'error-box'} style={{ marginTop: 10 }}>{msg.text}</div>}
      </div>

      {data?.entries?.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title"><span>3. Đã nhập cho {active}</span><span className="badge demo">DỮ LIỆU NGƯỜI HỌC NHẬP</span></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 640 }}>
              <thead><tr><th>Kỳ</th><th>DT</th><th>LN ròng</th><th>Biên ròng</th><th>ROE</th><th>Nợ/Vốn</th><th>OCF/LN</th><th>FCF</th><th></th></tr></thead>
              <tbody>
                {data.entries.map((e) => {
                  const r = ratiosOf(e.data)
                  return (
                    <tr key={e.id}>
                      <td><b>{e.period}</b><div className="muted" style={{ fontSize: 11 }}>{(e.source || '').slice(0, 40)}</div></td>
                      <td className="right num">{e.data.revenue ?? '—'}</td>
                      <td className="right num">{e.data.netIncome ?? '—'}</td>
                      <td className="right num">{r['Biên ròng %'] ?? '—'}</td>
                      <td className="right num">{r['ROE %'] ?? '—'}</td>
                      <td className="right num">{r['Nợ/Vốn %'] ?? '—'}</td>
                      <td className={`right num ${Number(r['OCF/LN %']) >= 80 ? 'up' : Number(r['OCF/LN %']) < 50 ? 'down' : ''}`}>{r['OCF/LN %'] ?? '—'}</td>
                      <td className="right num">{r.FCF ?? '—'}</td>
                      <td><button className="btn sm ghost" onClick={() => { if (window.confirm(`Xóa kỳ ${e.period}?`)) { api.manualDelete(e.id).then(() => setData({ ...data, entries: data.entries.filter((x) => x.id !== e.id) })) } }}>✕</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="tip-box" style={{ marginTop: 10 }}>💡 Tự kiểm tra: OCF/LN ≥ 80% (tiền thật)? Nợ/Vốn ≤ 100%? ROE ≥ 15%? — đây chính là Health Check bằng số BẢN TAY copy từ báo cáo thật!</div>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <Link to="/health-check/FPT" className="btn ghost">🩺 Huấn luyện Health Check (dữ liệu mẫu)</Link>
      </div>
    </div>
  )
}
