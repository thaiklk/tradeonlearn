import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

// Phase 6 — Research workspace theo mã + xuất investment memo
const SECTIONS = [
  ['thesis', '1) Luận điểm chính', 'Tại sao đáng nghiên cứu? 3 dòng "Tôi tin... vì..." (dùng số liệu)'],
  ['evidence', '2) Số liệu hỗ trợ', 'ROE, biên, OCF/LN, tăng trưởng — copy từ trang /stock hoặc task đã làm'],
  ['valuation', '3) Giả định định giá', 'EPS × P/E hợp lý = giá hợp lý; biên an toàn bao nhiêu %?'],
  ['catalysts', '4) Catalyst', 'Chuyện gì có thể đẩy giá lên? (kết quả quý, sản phẩm mới, ngành...)'],
  ['risks', '5) Rủi ro', '3 rủi ro lớn nhất — mỗi cái kèm "mức độ nặng + khả năng"'],
  ['invalidation', '6) Điều kiện làm luận điểm SAI', '"Tôi sẽ bán/thoái lui nếu..." — viết TRƯỚC khi mua (Bài 13)'],
  ['sources', '7) Nguồn & ngày đọc', 'Link cafef/vietstock/báo cáo + ngày bạn đọc từng nguồn'],
]
const CHECKLIST = [
  'Đã đọc BCTC đủ 3 năm (trang /stock hoặc cafef)',
  'Lợi nhuận có thành tiền không? (OCF/LN ≥ 80%)',
  'Đã so với 2-3 đối thủ cùng ngành (/compare)',
  'Đã định giá và có biên an toàn ≥15%',
  'Đã viết điều kiện "tôi sẽ sai nếu..."',
  'Đã định sẵn mức cắt lỗ theo quy tắc 1-2%',
  'Đã ghi nguồn và ngày đọc',
  'Không dùng tiền cần trong 3-5 năm, không đòn bẩy',
]

export default function ResearchHome() {
  const { data: list, setData } = useApi(() => api.researchList(), [])
  const [sym, setSym] = useState('')
  const navigate = useNavigate()
  const open = (s) => navigate(`/research/${s.trim().toUpperCase()}`)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>🔬 Research Workspace</h1>
      <p className="muted" style={{ margin: '6px 0 14px', fontSize: 13.5 }}>
        Ghi chú nghiên cứu theo từng mã — đúng cấu trúc memo của analyst: luận điểm → số liệu → định giá → catalyst →
        rủi ro → điều kiện sai → nguồn → checklist. Lưu tự động trên máy (bản local) — bấm vào mã để viết tiếp.
      </p>
      <div className="card">
        <div className="card-title">Mở workspace</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 220 }} placeholder="Mã cổ phiếu (VD: FPT)" value={sym} onChange={(e) => setSym(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && sym && open(sym)} />
          <button className="btn primary" disabled={!sym} onClick={() => open(sym)}>Mở / tạo →</button>
          <span className="muted" style={{ alignSelf: 'center', fontSize: 12.5 }}>Gợi ý: AAPL · MSFT · KO · FPT · VNM</span>
        </div>
      </div>
      <div className="grid" style={{ gap: 10, marginTop: 14 }}>
        {(!list || list.length === 0) && <div className="card"><div className="empty">Chưa có workspace nào. Nhập mã ở trên để bắt đầu nghiên cứu đầu tiên!</div></div>}
        {list?.map((w) => (
          <Link key={w.symbol} to={`/research/${w.symbol}`} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-sm)', background: '#0e1523aa', textDecoration: 'none', color: 'var(--text)' }}>
            <b style={{ fontSize: 17 }}>{w.symbol}</b>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div className="muted" style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.thesis || '(chưa có luận điểm)'}</div>
              <div style={{ height: 5, background: '#ffffff10', borderRadius: 99, marginTop: 6, maxWidth: 260 }}>
                <div style={{ width: `${(w.filled / w.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--green))', borderRadius: 99 }} />
              </div>
            </span>
            <span className="badge gray">{w.filled}/{w.total} mục</span>
            <button className="btn sm ghost" onClick={(e) => { e.preventDefault(); if (window.confirm(`Xóa workspace ${w.symbol}?`)) { api.researchDelete(w.symbol).then(() => setData(list.filter((x) => x.symbol !== w.symbol))) } }}>✕</button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function ResearchEditor() {
  const { symbol } = useParams()
  const [fields, setFields] = useState({})
  const [checks, setChecks] = useState({})
  const [saved, setSaved] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.researchGet(symbol).then((r) => {
      setFields(r || {})
      try { setChecks(r?.checklist ? JSON.parse(r.checklist) : {}) } catch { setChecks({}) }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [symbol])

  const set = (k, v) => setFields((f) => ({ ...f, [k]: v }))
  const save = async () => {
    const payload = { ...fields }
    delete payload.summary; delete payload.symbol
    payload.checklist = JSON.stringify(checks)
    const r = await api.researchSave(symbol, payload)
    setSaved(`Đã lưu ${new Date().toLocaleTimeString('vi-VN')} (${r.summary.filled}/${r.summary.total} mục)`)
  }
  const exportMemo = () => {
    const done = CHECKLIST.filter((_, i) => checks[i]).length
    const memo = [
      `INVESTMENT MEMO — ${symbol}`, `Ngày: ${new Date().toLocaleDateString('vi-VN')}`, '',
      ...SECTIONS.map(([k, label]) => `${label}\n${(fields[k] || '(chưa điền)').trim()}\n`),
      `Checklist trước khi kết luận: ${done}/${CHECKLIST.length}`,
      ...CHECKLIST.map((c, i) => `  ${checks[i] ? '☑' : '☐'} ${c}`), '',
      '⚠️ Tài liệu giáo dục — không phải khuyến nghị đầu tư.',
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([memo], { type: 'text/plain;charset=utf-8' }))
    a.download = `memo-${symbol}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
  }

  if (loading) return <div className="spinner" />
  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="muted"><Link to="/research">← Research</Link> · <Link to={`/stock/${symbol}`}>xem trang mã ↗</Link></div>
      <h1 style={{ margin: '6px 0 12px', fontSize: 24 }}>🔬 {symbol} — ghi chú nghiên cứu</h1>
      {SECTIONS.map(([k, label, hint]) => (
        <div className="card" key={k} style={{ padding: '13px 16px', marginTop: 10 }}>
          <label className="field" style={{ margin: 0 }}>
            <span>{label}</span>
            <textarea className="input" rows={3} placeholder={hint} value={fields[k] || ''} onChange={(e) => set(k, e.target.value)} />
          </label>
        </div>
      ))}
      <div className="card" style={{ marginTop: 10 }}>
        <div className="card-title">✅ Checklist trước khi kết luận ({CHECKLIST.filter((_, i) => checks[i]).length}/{CHECKLIST.length})</div>
        {CHECKLIST.map((c, i) => (
          <label key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', cursor: 'pointer', fontSize: 13.5 }}>
            <input type="checkbox" checked={!!checks[i]} onChange={(e) => setChecks((s) => ({ ...s, [i]: e.target.checked }))} style={{ width: 17, height: 17 }} />
            <span className={checks[i] ? '' : 'muted'}>{c}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn primary" onClick={save}>💾 Lưu workspace</button>
        <button className="btn" onClick={exportMemo}>📄 Xuất Investment Memo (.txt)</button>
        <Link className="btn ghost" to={`/health-check/${symbol}`}>🩺 Health check mã này</Link>
        {saved && <span className="badge green">{saved}</span>}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        💡 Quy trình: điền đủ 7 mục + checklist 8/8 → Xuất memo → nộp ở <Link to="/desk/investment-memo">Task 7</Link> để sếp chấm.
      </div>
    </div>
  )
}
