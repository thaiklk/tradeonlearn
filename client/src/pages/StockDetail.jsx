import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApi, useQuoteStream } from '../hooks.js'
import { fmtCompact, fmtPct, fmtPrice, fmtMoney } from '../format.js'
import AnalysisCharts from '../components/PriceCharts.jsx'
import { ErrorBoundary } from '../App.jsx'

const RANGES = [
  { key: '1d', label: '1 ngày' },
  { key: '1mo', label: '1 tháng' },
  { key: '3mo', label: '3 tháng' },
  { key: '6mo', label: '6 tháng' },
  { key: '1y', label: '1 năm' },
  { key: '2y', label: '2 năm' },
  { key: '5y', label: '5 năm' },
]

function overallBadge(overall) {
  if (!overall) return null
  if (overall.includes('MUA')) return <span className="badge green">🟢 {overall}</span>
  if (overall.includes('BÁN')) return <span className="badge red">🔴 {overall}</span>
  return <span className="badge gray">⚪ {overall}</span>
}

function SignalCard({ signal }) {
  const icon = signal.type === 'bull' ? '🐂' : signal.type === 'bear' ? '🐻' : '⚖️'
  return (
    <div className={`signal ${signal.type}`}>
      <div className="s-title">
        <span>{icon}</span>
        <span>{signal.title}</span>
      </div>
      <div className="s-detail">{signal.detail}</div>
      <div className="s-links">
        {signal.lessonId && (
          <Link className="btn sm" to={`/learn/${signal.lessonId}`}>
            📖 Học bài liên quan
          </Link>
        )}
        {(signal.terms || []).slice(0, 3).map((t) => (
          <Link key={t} className="btn sm ghost" to={`/glossary?q=${encodeURIComponent(t)}`}>
            {t}
          </Link>
        ))}
      </div>
    </div>
  )
}

import MetricExplainer from '../components/MetricExplainer.jsx'

// "Doanh nghiệp này bán gì?" — 1 câu cho người mới (nguồn: mô tả kinh doanh chính)
const BUSINESS_MODEL = {
  FPT: 'Bán dịch vụ phát triển phần mềm (xuất khẩu IT), giải pháp số và bán lẻ thiết bị công nghệ.',
  VNM: 'Sản xuất và bán sữa cùng các sản phẩm dinh dưỡng cho mọi lứa tuổi.',
  AAPL: 'Bán iPhone, máy tính, phụ kiện và các dịch vụ số (App Store, iCloud...) — phần lớn lợi nhuận đến từ dịch vụ.',
  MSFT: 'Bán phần mềm đám mây (Azure), Office, Windows và dịch vụ doanh nghiệp theo thuê.',
  KO: 'Bán nước ngọt và đồ uống có thương hiệu toàn cầu qua mạng lưới đóng chai.',
}

const last = (a) => (a?.length ? a[a.length - 1] : null)

function SummaryCard({ symbol, name, fin, quote }) {
  const notable = []
  const g = last(fin?.ratios?.revenueGrowth)
  const ocf = last(fin?.ratios?.ocfToNi)
  const de = last(fin?.ratios?.debtToEquity)
  const roe = last(fin?.ratios?.roe)
  if (g != null) notable.push(`Doanh thu ${g >= 0 ? 'tăng' : 'giảm'} ${Math.abs(g)}% năm gần nhất ${g >= 15 ? '(tăng trưởng khỏe)' : g >= 0 ? '(chậm)' : '(co lại — cần hiểu lý do)'}`)
  if (roe != null) notable.push(`ROE ${roe}% ${roe >= 15 ? '— vốn chủ sinh lời khá hiệu quả' : '— dưới mốc 15% thường xem là tốt'}`)
  if (ocf != null) notable.push(`OCF/Lợi nhuận ${ocf}% ${ocf >= 80 ? '— lợi nhuận chuyển thành tiền khá thật' : '— CẦN KIỂM TRA THÊM: tiền chưa về đủ (xem Bài 11)'}`)
  if (de != null) notable.push(`Nợ/Vốn ${de}% ${de <= 100 ? '— gánh nợ tương đối nhẹ' : '— nợ cao hơn vốn, xem lãi vay'}`)
  return (
    <div className="card">
      <div className="card-title"><span>⏱️ Tóm tắt 5 phút (cho người mới)</span></div>
      <p style={{ margin: '0 0 8px' }}><b>Doanh nghiệp kiếm tiền bằng cách nào?</b></p>
      <p className="muted" style={{ margin: 0 }}>{BUSINESS_MODEL[symbol] || `Chưa có mô tả cho ${symbol} — hãy tra mục "Hồ sơ công ty" trên cafef/vietstock và tự viết 1 câu (đó là Bước 1 của mọi analyst).`}</p>
      <p style={{ margin: '12px 0 6px' }}><b>Ba điểm đáng chú ý</b> <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>(từ số liệu bên dưới{fin?.status === 'demo' ? ' — đang là dữ liệu mẫu giáo dục' : ''})</span>:</p>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {(notable.length ? notable.slice(0, 3) : ['Chưa có dữ liệu để tóm tắt — xem thẻ BCTC bên dưới hoặc nhập tay']).map((n, i) => <li key={i} style={{ margin: '4px 0', fontSize: 13.5 }}>{n}</li>)}
      </ul>
      <p style={{ margin: '12px 0 6px' }}><b>Ba câu hỏi cần kiểm tra</b> <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>(tự trả lời khi đọc tiếp trang)</span>:</p>
      <ul className="muted" style={{ margin: 0, paddingLeft: 20, fontSize: 13.5 }}>
        <li>Lợi nhuận có đi CÙNG dòng tiền không?</li>
        <li>Nợ có tăng nhanh hơn tài sản không?</li>
        <li>Giá hiện tại đang trả bao nhiêu cho 1 đồng lợi nhuận (P/E) — đắt hay rẻ so với chính nó?</li>
      </ul>
    </div>
  )
}

function HealthMetricsCard({ symbol, fin, quote }) {
  const r = fin?.rows, q = fin?.ratios
  const period = fin?.periodEnd || '—'
  const source = fin?.source || '—'
  const status = fin?.status || 'no-data'
  const unit = fin?.unit || ''
  const eps = last(r?.eps)
  const pe = quote?.price != null && eps > 0 ? (quote.price / eps).toFixed(1) : null
  const M = (props) => <MetricExplainer period={period} source={source} status={status} {...props} />
  const items = [
    { name: 'Doanh thu (Revenue)', value: last(r?.revenue) != null ? last(r.revenue).toLocaleString('vi-VN') : '—', unit, simple: 'Tổng tiền doanh nghiệp bán được trong kỳ — quy mô của việc kinh doanh.', formula: 'Tổng giá trị hàng/dịch vụ đã bán', example: 'Bán 1 triệu sản phẩm × 50.000₫ = 50 tỷ doanh thu', readUp: 'đang mở rộng quy mô hoặc giá tăng', readDown: 'co lại — cần tìm lý do (cạnh tranh? nhu cầu?)', traps: 'Doanh thu ≠ tiền thu được: có thể là bán chịu. Luôn đọc cạnh OCF.', compare: 'So với chính nó năm trước và các đối thủ cùng ngành', links: [{ to: '/learn/bao-cao-tai-chinh-2-ket-qua', label: 'Bài 10' }, { to: '/glossary?q=Doanh thu', label: 'Thuật ngữ' }] },
    { name: 'Lợi nhuận ròng (Net Income)', value: last(r?.netIncome) != null ? last(r.netIncome).toLocaleString('vi-VN') : '—', unit, simple: 'Phần còn lại sau khi trừ MỌI chi phí — "kiếm được thật" theo sổ sách.', formula: 'Doanh thu − giá vốn − chi phí − lãi vay − thuế', example: 'Doanh thu 100, chi phí hết 88 → lãi ròng 12', readUp: 'kinh doanh hiệu quả hơn', readDown: 'chi phí ăn mòn hoặc doanh thu giảm', traps: 'Lợi nhuận là QUAN ĐIỂM kế toán — có thể đẹp mà chưa có tiền. Đọc cạnh OCF.', links: [{ to: '/learn/bao-cao-tai-chinh-2-ket-qua', label: 'Bài 10' }] },
    { name: 'Dòng tiền kinh doanh (OCF)', value: last(r?.ocf) != null ? last(r.ocf).toLocaleString('vi-VN') : '—', unit, simple: 'Tiền THẬT vào két sắt từ việc buôn bán — số khó làm đẹp nhất.', formula: 'Tiền thu từ khách − tiền trả lương/nhà cung cấp...', example: 'Lãi 12 nhưng khách chưa trả → OCF có thể chỉ 3', readUp: 'kinh doanh tự nuôi mình tốt', readDown: 'dấu hiệu cần kiểm tra: bán chịu nhiều / tồn kho chất', traps: 'OCF < lợi nhuận nhiều năm = "lợi nhuận trên giấy" (Bài 11).', links: [{ to: '/learn/bao-cao-tai-chinh-3-luu-chuyen-tien', label: 'Bài 11' }] },
    { name: 'Dòng tiền tự do (FCF)', value: last(r?.fcf) != null ? last(r.fcf).toLocaleString('vi-VN') : '—', unit, simple: 'Tiền dư SAU khi đầu tư nhà xưởng — tiền thật sự "tự do" cho cổ đông.', formula: 'OCF − CAPEX (tiền đầu tư)', example: 'OCF 10 − đầu tư 3 = FCF 7', readUp: 'càng nhiều "oxy" cho trả nợ/cổ tức', readDown: 'đang đầu tư nặng tay hoặc kinh doanh yếu', traps: 'FCF âm liên tục ở công ty "già" là cảnh báo.', links: [{ to: '/learn/bao-cao-tai-chinh-3-luu-chuyen-tien', label: 'Bài 11' }] },
    { name: 'ROE (%)', value: last(q?.roe) != null ? last(q.roe) : '—', unit: '%', simple: `Với mỗi 100 đồng vốn của chủ sở hữu, doanh nghiệp tạo ra khoảng ${last(q?.roe) ?? '?'} đồng lợi nhuận trong kỳ.`, formula: 'Lợi nhuận ròng ÷ Vốn chủ sở hữu', example: 'Lãi 18 / vốn 100 = ROE 18%', readUp: 'dùng vốn hiệu quả — nhưng xem có phải do NỢ cao đẩy lên (DuPont)', readDown: 'vốn sinh lời kém hoặc lợi nhuận suy giảm', traps: 'Không kết luận từ 1 năm hoặc 1 chỉ số. ROE cao + nợ thấp mới chất lượng.', compare: '≥15% thường xem là khá; so cùng ngành', links: [{ to: '/learn/chi-so-dinh-gia', label: 'Bài 12' }, { to: '/desk/dupont', label: 'Task 9 DuPont' }] },
    { name: 'Biên lợi nhuận ròng (%)', value: last(q?.netMargin) != null ? last(q.netMargin) : '—', unit: '%', simple: 'Mỗi 100 đồng doanh thu giữ lại được bao nhiêu đồng lợi nhuận.', formula: 'Lợi nhuận ròng ÷ Doanh thu × 100', example: 'Lãi 12 / doanh thu 100 = biên 12%', readUp: 'định giá mạnh hoặc cắt chi phí tốt', readDown: 'cạnh tranh gay hoặc chi phí tăng', traps: 'Mỗi ngành khác nhau (siêu thị 2% vẫn ổn, phần mềm 30% mới thường).', links: [{ to: '/learn/bao-cao-tai-chinh-2-ket-qua', label: 'Bài 10' }] },
    { name: 'Nợ / Vốn chủ (%)', value: last(q?.debtToEquity) != null ? last(q.debtToEquity) : '—', unit: '%', simple: 'Bao nhiêu đồng nợ trên mỗi 1 đồng vốn thật của chủ sở hữu.', formula: 'Tổng nợ phải trả ÷ Vốn chủ sở hữu', example: 'Nợ 40 / vốn 100 = 40%', readUp: 'đòn bẩy mạnh hơn — lợi nhuận và rủi ro cùng tăng', readDown: 'gánh nợ nhẹ đi', traps: '≤100% thường thoải mái; ngân hàng nợ cao là bản chất ngành. Nợ cao + lãi suất tăng = nguy hiểm.', links: [{ to: '/learn/bao-cao-tai-chinh-1-can-doi', label: 'Bài 9' }] },
    { name: 'P/E (Giá ÷ EPS)', value: pe ?? '—', unit: 'lần', simple: pe ? `Ở giá hiện tại, bạn trả ${pe} đồng cho mỗi 1 đồng lợi nhuận mỗi năm.` : 'Cần giá live + EPS để tính.', formula: 'Giá cổ phiếu ÷ Lợi nhuận trên mỗi cổ phiếu (EPS)', example: 'Giá 300 ÷ EPS 8.5 = P/E 35', readUp: 'thị trường kỳ vọng tăng trưởng lớn (hoặc đang đắt)', readDown: 'kỳ vọng thấp hoặc đang rẻ — PHẢI so cùng ngành + lịch sử', traps: 'Bẫy giá rẻ: P/E thấp có thể vì doanh nghiệp đang hỏng. P/E = 0 nghĩa đang lỗ.', compare: 'Dải bình thường mỗi ngành khác nhau (ngân hàng ~10, công nghệ ~30)', links: [{ to: '/learn/chi-so-dinh-gia', label: 'Bài 12' }, { to: '/desk/valuation', label: 'Task 4' }] },
  ]
  return (
    <div className="card">
      <div className="card-title"><span>🩺 Sức khỏe tài chính — bấm "Giải thích" ở mỗi chỉ số</span></div>
      <div className="grid cols-2" style={{ gap: 10 }}>
        {items.map((it) => <div key={it.name}><M {...it} /></div>)}
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        💡 Mọi kết luận trên chỉ là <b>dấu hiệu cần kiểm tra thêm</b> so với mốc tham khảo — không phải lời khuyên mua/bán.
      </div>
    </div>
  )
}

function StatsCard({ data }) {
  const { indicators, quote, currency } = data
  const rows = [
    ['Giá hiện tại', fmtPrice(quote?.price, currency)],
    ['Thay đổi hôm nay', `${fmtPrice(quote?.change, currency)} (${fmtPct(quote?.changePercent)})`],
    ['Cao nhất phiên', fmtPrice(quote?.dayHigh, currency)],
    ['Thấp nhất phiên', fmtPrice(quote?.dayLow, currency)],
    ['Khối lượng', fmtCompact(quote?.volume)],
    ['RSI (14)', indicators?.rsi14 != null ? indicators.rsi14.toFixed(1) : '—'],
    ['MA20', fmtPrice(indicators?.ma20, currency)],
    ['MA50', fmtPrice(indicators?.ma50, currency)],
    ['MA200', fmtPrice(indicators?.ma200, currency)],
  ]
  return (
    <div className="card">
      <div className="card-title">📊 Số liệu chính</div>
      <table className="table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className="muted">{k}</td>
              <td className="right num">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FinancialsCard({ symbol, fin: finProp }) {
  // dùng BCTC cha đã fetch nếu có, chỉ tự fetch khi đứng một mình
  const { data: finSelf } = useApi(() => (finProp ? Promise.resolve(finProp) : api.get(`/stocks/${encodeURIComponent(symbol)}/financials`)), [symbol, finProp])
  const fin = finProp || finSelf
  const [basic, setBasic] = useState(true) // Phase 3: Cơ bản (5 chỉ số + câu hỏi) / Nâng cao (đủ bảng)
  const [openRow, setOpenRow] = useState(null) // dòng BCTC đang mở giải thích
  if (!fin || fin.status === 'no-data' || !fin.years?.length)
    return (
      <div className="card">
        <div className="card-title"><span>📗 Báo cáo tài chính</span><span className="badge gray">CHƯA CÓ DỮ LIỆU</span></div>
        <div className="muted" style={{ fontSize: 13 }}>Mã này chưa có bộ BCTC trên web. Bạn có thể tự nhập số liệu từ báo cáo đã kiểm toán (cafef/vietstock) — sẽ được gắn nhãn "dữ liệu người học nhập", tách biệt với dữ liệu live.</div>
        <Link to={`/manual/${symbol}`} className="btn sm" style={{ marginTop: 10 }}>✍️ Nhập tay BCTC cho {symbol}</Link>
      </div>
    )
  const isDemo = fin.status === 'demo'
  const fmt = (v) => (v == null ? '—' : Number.isFinite(v) ? v.toLocaleString('vi-VN') : '—')
  const rRows = [
    ['Doanh thu', fin.rows.revenue], ['LN gộp', fin.rows.grossProfit], ['LN hoạt động', fin.rows.operatingIncome],
    ['LN ròng', fin.rows.netIncome], ['EPS', fin.rows.eps], ['Tài sản', fin.rows.totalAssets],
    ['Nợ phải trả', fin.rows.totalLiabilities], ['Vốn chủ', fin.rows.equity], ['OCF', fin.rows.ocf],
    ['CAPEX', fin.rows.capex], ['FCF', fin.rows.fcf],
  ]
  // 👇 Giải thích TỪNG DÒNG cho người chưa từng đọc BCTC — bấm tên dòng để mở (ví dụ dùng chính số thật của năm cuối)
  const F = (x) => (x != null ? x.toLocaleString('vi-VN') : '—')
  const L = (a) => (a?.length ? a[a.length - 1] : null)
  const P = (a) => (a?.length > 1 ? a[a.length - 2] : null)
  const EX = {
    'Doanh thu': [`Tổng tiền bán được trong năm — quy mô kinh doanh.`, `Số sản phẩm bán ra × giá bán.`, `FPT bán được ${F(L(fin.rows.revenue))} ${fin.unit} năm nay.`, `Doanh thu ≠ tiền đã thu: có thể bán chịu (chưa thu tiền) — luôn đọc cạnh OCF.`],
    'LN gộp': [`Tiền lời thô sau khi trừ GIÁ VỎN hàng bán.`, `Doanh thu − giá vốn hàng bán.`, `${F(L(fin.rows.revenue))} − giá vốn = còn ${F(L(fin.rows.grossProfit))}.`, `So với doanh thu = biên gộp (quyền lực định giá sản phẩm).`],
    'LN hoạt động': [`Lời từ nghề chính, chưa trừ lãi vay & thuế.`, `LN gộp − chi phí bán hàng/quản lý.`, `${F(L(fin.rows.grossProfit))} − chi phí = ${F(L(fin.rows.operatingIncome))}.`, `Đây là "sức khỏe cốt lõi" — thu nhập ngoài nghề không tính vào.`],
    'LN ròng': [`Phần CUỐI CÙNG về tay cổ đông sau MỌI chi phí.`, `LN hoạt động − lãi vay − thuế.`, `${F(L(fin.rows.operatingIncome))} − lãi vay − thuế = ${F(L(fin.rows.netIncome))}.`, `Là số LIỆU KẾ TOÁN — có thể đẹp mà chưa có tiền (so OCF).`],
    'EPS': [`Lợi nhuận tính trên MỖI CỔ PHIẾU — cây cầu giữa DN và giá CP.`, `LN ròng ÷ số cổ phiếu.`, `${F(L(fin.rows.netIncome))} ${fin.unit} ÷ ${F(L(fin.rows.sharesB))} tỷ cp = ${F(L(fin.rows.eps))} ${fin.currency === 'VND' ? '₫' : '$'}/cp.`, `Phát hành thêm cp làm EPS loãng — theo dõi số cp tăng không.`],
    'Tài sản': [`Tổng giá trị DN đang SỞ HỮU (tiền, kho, nhà xưởng...).`, `Cộng mọi tài sản ngắn + dài hạn.`, `Toàn bộ gia tài = ${F(L(fin.rows.totalAssets))} ${fin.unit}.`, `Tài sản to chưa chắc tốt — phải SINH LỜI được (xem ROA).`],
    'Nợ phải trả': [`Tổng DN đang NỢ (nhà cung cấp, ngân hàng...).`, `Cộng nợ ngắn hạn + dài hạn.`, `Đang nợ ${F(L(fin.rows.totalLiabilities))} ${fin.unit}.`, `Nợ không hẳn xấu — vấn đề là dùng nợ làm gì và trả nổi không.`],
    'Vốn chủ': [`Phần THẬT thuộc cổ đông = Tài sản − Nợ.`, `${F(L(fin.rows.totalAssets))} − ${F(L(fin.rows.totalLiabilities))} = ${F(L(fin.rows.equity))}.`, `Nếu thanh lý hết, trả nợ xong, cổ đông được chừng này.`, `Vốn chủ tăng đều qua năm (do lợi nhuận giữ lại) là dấu hiệu tốt.`],
    'OCF': [`TIỀN THẬT chảy vào từ buôn bán — khác lợi nhuận kế toán.`, `Tiền thu từ khách − tiền trả lương/nhà cung cấp...`, `Năm nay két sắt thêm ${F(L(fin.rows.ocf))} ${fin.unit} từ kinh doanh.`, `OCF < LN nhiều năm = "lợi nhuận trên giấy" — bẫy số 1 (Bài 11).`],
    'CAPEX': [`Tiền ĐẦU TƯ mua/sửa tài sản dài hạn (nhà xưởng, máy...).`, `Tổng chi mua sắm trong kỳ (hiện âm cho dễ thấy tiền RA).`, `Vừa chi ${F(Math.abs(L(fin.rows.capex)))} ${fin.unit} đầu tư.`, `CAPEX lớn ở DN tăng trưởng là bình thường — ở DN già là dấu hỏi.`],
    'FCF': [`Tiền TỰ DO còn lại sau đầu tư — "oxy" cho cổ đông.`, `OCF − CAPEX.`, `${F(L(fin.rows.ocf))} − ${F(Math.abs(L(fin.rows.capex)))} = ${F(L(fin.rows.fcf))} ${fin.unit}.`, `FCF âm nhiều năm ở DN trưởng thành = cảnh báo.`],
    'Tăng trưởng DT %': [`Doanh thu năm nay hơn năm trước bao nhiêu %.`, `(DT năm nay − năm trước) ÷ năm trước × 100.`, `${F(P(fin.rows.revenue))} → ${F(L(fin.rows.revenue))} = +${L(fin.ratios.revenueGrowth)}%.`, `1 năm tăng mạnh chưa nói gì — xem 3-5 năm liền.`],
    'Biên ròng %': [`Mỗi 100đ doanh thu giữ lại mấy đồng lãi.`, `LN ròng ÷ Doanh thu × 100.`, `${F(L(fin.rows.netIncome))} ÷ ${F(L(fin.rows.revenue))} = ${L(fin.ratios.netMargin)}%.`, `Mỗi ngành một dải bình thường — chỉ so cùng ngành.`],
    'ROE %': [`100đ vốn chủ sinh ra mấy đồng lãi/năm.`, `LN ròng ÷ Vốn chủ × 100.`, `${F(L(fin.rows.netIncome))} ÷ ${F(L(fin.rows.equity))} = ${L(fin.ratios.roe)}%.`, `ROE cao có thể do NỢ cao đẩy lên — xem kèm Nợ/Vốn (DuPont).`],
    'Nợ/Vốn %': [`Mấy đồng nợ trên 1đ vốn thật.`, `Nợ phải trả ÷ Vốn chủ × 100.`, `${F(L(fin.rows.totalLiabilities))} ÷ ${F(L(fin.rows.equity))} = ${L(fin.ratios.debtToEquity)}%.`, `≤100% thường thoải mái (ngân hàng ngoại lệ).`],
    'OCF/LN %': [`Bao nhiêu % lợi nhuận THÀNH TIỀN THẬT — bộ lọc số 1.`, `OCF ÷ LN ròng × 100.`, `${F(L(fin.rows.ocf))} ÷ ${F(L(fin.rows.netIncome))} = ${L(fin.ratios.ocfToNi)}%.`, `≥80% tốt; <50% kéo dài = phải hỏi sâu (Bài 11).`],
  }
  const qRows = [
    ['Tăng trưởng DT %', fin.ratios.revenueGrowth, 'Doanh thu đang tăng hay giảm?'], ['Tăng trưởng LN %', fin.ratios.netIncomeGrowth, 'Lợi nhuận cùng chiều doanh thu không?'],
    ['Biên gộp %', fin.ratios.grossMargin, 'Sản phẩm định giá mạnh không?'], ['Biên hoạt động %', fin.ratios.operatingMargin, 'Vận hành hiệu quả không?'], ['Biên ròng %', fin.ratios.netMargin, 'Mỗi 100đ doanh thu giữ lại mấy đồng? (≥10% khá)'],
    ['ROE %', fin.ratios.roe, '1đ vốn chủ sinh mấy đ lợi nhuận? ≥15% tốt — cạm bẫy: ROE cao có thể do NỢ cao (DuPont, Task 9)'],
    ['ROA %', fin.ratios.roa, 'Máy kiếm tiền tính trên TOÀN BỘ tài sản — ≥5% khá'], ['Nợ/Vốn %', fin.ratios.debtToEquity, '≤100% thoải mái; cao thì xem lãi vay (cạm bẫy: ngân hàng nợ cao là bản chất)'],
    ['OCF/LN %', fin.ratios.ocfToNi, '≥80% = lợi nhuận thành TIỀN thật; thấp = cảnh báo "giấy" (Bài 11)'],
  ]
  const shownQ = basic ? qRows.filter((_, i) => [4, 5, 7, 8, 0].includes(i)) : qRows
  return (
    <div className="card">
      <div className="card-title">
        <span>📗 Báo cáo tài chính 4 năm (chuẩn hóa)</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className={`btn sm ${basic ? 'active' : ''}`} onClick={() => setBasic(true)}>🌱 Cơ bản</button>
          <button className={`btn sm ${!basic ? 'active' : ''}`} onClick={() => setBasic(false)}>📚 Nâng cao</button>
          <span className={`badge ${isDemo ? 'demo' : 'green'}`}>{isDemo ? 'DEMO DATA' : 'LIVE'}</span>
        </span>
      </div>
      <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
        Nguồn: {fin.source} · Kỳ: {fin.periodEnd} · Đơn vị: {fin.unit} · Cập nhật: {new Date(fin.fetchedAt).toLocaleString('vi-VN')} —{' '}
        <Link to="/learn/bao-cao-tai-chinh-1-can-doi">học cách đọc ở Bài 9-11</Link>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 560 }}>
              <thead><tr><th>Chỉ số ▸ bấm để giải thích</th>{fin.years.map((y) => <th key={y} className="right">{y}</th>)}</tr></thead>
              <tbody>
                {rRows.map(([n, arr]) => {
                  const label = n === 'EPS' ? `EPS (${fin.currency === 'VND' ? '₫/cp' : '$/cp'})` : n
                  return [
                    <tr key={n}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn sm ghost" style={{ padding: '1px 7px', fontSize: 11.5 }} onClick={() => setOpenRow(openRow === n ? null : n)} title="Là gì? Tính thế nào? Ví dụ? Giới hạn?">{openRow === n ? '▾' : '▸'}</button>{' '}
                        <span className="muted">{label}</span>
                      </td>
                      {(arr || []).map((v, i) => <td key={i} className="right num">{fmt(v)}</td>)}
                    </tr>,
                    openRow === n && EX[n] && (
                      <tr key={n + '-ex'}><td colSpan={fin.years.length + 1} style={{ background: '#0d1422', padding: '8px 12px' }}>
                        <div style={{ fontSize: 12.5 }}><b>Là gì:</b> {EX[n][0]}</div>
                        <div style={{ fontSize: 12.5 }}><b>Tính:</b> {EX[n][1]}</div>
                        <div style={{ fontSize: 12.5 }}><b>Ví dụ (số năm cuối):</b> {EX[n][2]}</div>
                        <div style={{ fontSize: 12.5, color: '#fbd38d' }}><b>⚠️ Giới hạn:</b> {EX[n][3]}</div>
                      </td></tr>
                    ),
                  ]
                })}
                {qRows.map(([n, arr], i) => (
                  <tr key={n} style={{ borderTop: '2px solid var(--border)' }}><td className="muted">{n}</td>{(arr || []).map((v, j) => (
                    <td key={j} className={`right num ${v != null && (n.includes('Tăng trưởng') || n.includes('ROE') || n.includes('OCF')) ? (v >= 0 ? 'up' : 'down') : ''}`}>{fmt(v)}</td>
                  ))}</tr>
                )).filter((_, i) => shownQ.includes(qRows[i]))}
              </tbody>
        </table>
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        💡 Câu hỏi phân tích: doanh thu &amp; LN cùng chiều không? Biên ổn định không? OCF/LN ≥ 80% không? Nợ/Vốn xu hướng gì? — trả lời được là bạn vừa "health-check" xong 1 doanh nghiệp.
      </div>
      <Link to={`/health-check/${symbol}`} className="btn primary" style={{ marginTop: 10 }}>🩺 Chạy Health Check 15 phút (6 bước)</Link>
    </div>
  )
}

function PeersCard({ symbol }) {
  const { data: p } = useApi(() => api.get(`/stocks/${encodeURIComponent(symbol)}/peers`), [symbol])
  const [showCols, setShowCols] = useState(false)
  if (!p?.peers?.length) return null
  const rows = [['ROE %', 'roe'], ['Biên ròng %', 'netMargin'], ['Nợ/Vốn %', 'debtToEquity'], ['Tăng trưởng DT %', 'revenueGrowth'], ['OCF/LN %', 'ocfToNi']]
  const COL_EX = {
    roe: ['100đ vốn chủ sinh mấy đồng lãi/năm. Ví dụ: 23,5% = 100đ vốn → 23,5đ lãi. Giới hạn: cao có thể do nợ cao.', 'so với'],
    netMargin: ['Mỗi 100đ doanh thu giữ lại mấy đồng lãi. Ví dụ: 11,6% = bán 100đ lãi 11,6đ. Giới hạn: mỗi ngành một dải — không so chéo ngành.', 'so với'],
    debtToEquity: ['Mấy đồng nợ / 1đ vốn thật. ≤100% thường thoải mái. Giới hạn: ngân hàng nợ cao là bản chất ngành.', 'thấp hơn median là tốt'],
    revenueGrowth: ['Doanh thu năm nay hơn năm trước bao nhiêu %. Giới hạn: 1 năm không nói gì — cần 3-5 năm.', 'cao hơn median là tốt'],
    ocfToNi: ['% lợi nhuận thành tiền thật. ≥80% tốt, <50% kéo dài cần hỏi. Đây là bộ lọc quan trọng nhất bảng này.', 'cao hơn median là tốt'],
  }
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-title">
        <span>⚖️ So sánh ngang hàng + median</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn sm ghost" onClick={() => setShowCols(!showCols)}>{showCols ? '▲ Thu gọn' : '📘 Giải thích các cột'}</button>
          <span className="badge demo">DEMO DATA + giá live</span>
        </span>
      </div>
      {showCols && (
        <div style={{ marginBottom: 10 }}>
          {rows.map(([n, k]) => (
            <div key={k} style={{ fontSize: 12.5, padding: '5px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <b>{n}</b>: {COL_EX[k][0]} <span className="muted">(Trong bảng: {COL_EX[k][1]} median là hướng tốt.)</span>
            </div>
          ))}
          <div style={{ fontSize: 12.5, padding: '5px 0' }}><b>Median</b>: giá trị ĐỨNG GIỮA sau khi sắp xếp nhóm (không phải điểm chuẩn đúng/sai — chỉ là mốc so sánh "trung bình của bọn nó").</div>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 420 }}>
          <thead><tr><th>Mã</th>{rows.map(([n]) => <th key={n} className="right">{n}</th>)}</tr></thead>
          <tbody>
            {p.peers.map((x) => (
              <tr key={x.symbol}><td><b>{x.symbol}</b></td>{rows.map(([n, k]) => (
                <td key={k} className={`right num ${(k === 'debtToEquity') ? (x[k] <= (p.median[k] ?? 0) ? 'up' : 'down') : (x[k] >= (p.median[k] ?? 0) ? 'up' : 'down')}`}>{x[k] != null ? x[k].toLocaleString('vi-VN') : '—'}</td>
              ))}</tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--border)' }}><td className="muted"><b>Median</b></td>{rows.map(([n, k]) => <td key={k} className="right num">{p.median[k] != null ? p.median[k].toLocaleString('vi-VN') : '—'}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>💡 {p.note} · Nguồn: {p.source}</div>
    </div>
  )
}

function Fundamentals({ symbol, market }) {
  const { data: fund } = useApi(() => api.fundamentals(symbol), [symbol])

  const valueFormatters = {
    marketCap: (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} tỷ` : `$${(v / 1e6).toFixed(0)} tr`),
    freeCashflow: (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} tỷ` : `$${fmtCompact(v)}`),
    totalCash: (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} tỷ` : `$${fmtCompact(v)}`),
    totalDebt: (v) => (v >= 1e9 ? `$${(v / 1e9).toFixed(1)} tỷ` : `$${fmtCompact(v)}`),
    targetMeanPrice: (v) => (v ? `$${v.toFixed(2)}` : '—'),
  }
  const pctKeys = new Set(['roe', 'roa', 'profitMargin', 'grossMargin', 'operatingMargin', 'revenueGrowth', 'earningsGrowth', 'dividendYield'])
  const plainKeys = new Set(['trailingPE', 'forwardPE', 'priceToBook', 'currentRatio', 'beta', 'debtToEquity', 'trailingEps'])

  const fmt = (key, v) => {
    if (v == null || !Number.isFinite(v)) return '—'
    if (valueFormatters[key]) return valueFormatters[key](v)
    if (pctKeys.has(key)) return `${v.toFixed(1)}%`
    if (plainKeys.has(key)) return v.toFixed(2)
    return String(v)
  }

  const order = [
    'marketCap', 'trailingPE', 'forwardPE', 'priceToBook', 'trailingEps',
    'roe', 'roa', 'profitMargin', 'grossMargin', 'operatingMargin',
    'revenueGrowth', 'earningsGrowth', 'debtToEquity', 'currentRatio',
    'freeCashflow', 'totalCash', 'totalDebt', 'dividendYield', 'beta',
  ]

  return (
    <div className="card">
      <div className="card-title">
        <span>🏦 Phân tích cơ bản — soi doanh nghiệp (Bài 9–12)</span>
        {fund?.available && <span className="badge us">{fund.source || 'US'}</span>}
      </div>
      {market === 'VN' && (
        <p className="muted" style={{ fontSize: 13 }}>
          {fund?.note || 'Chỉ số tài chính chi tiết của công ty Việt Nam chưa có trên nguồn dữ liệu công khai này.'}{' '}
          Hãy dùng bảng dưới như <b>trợ lý ôn tập</b>: đọc mỗi định nghĩa và tự tìm số liệu tương ứng trên cafef/vietstock
          — đó chính là bài tập của <Link to="/learn/bao-cao-tai-chinh-2-ket-qua">Bài 9–11</Link>.
        </p>
      )}
      {!fund?.available && market !== 'VN' && (
        <p className="muted" style={{ fontSize: 13 }}>{fund?.note || 'Chưa tải được chỉ số cơ bản cho mã này.'}</p>
      )}
      <div className="grid cols-3">
        {order
          .filter((k) => (fund?.available ? fund[k] != null : ['trailingPE', 'priceToBook', 'roe', 'debtToEquity', 'profitMargin', 'revenueGrowth'].includes(k)))
          .map((k) => (
            <div key={k} className="term-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span className="term-en">{fund?.explain?.[k]?.label || k}</span>
                <span className="num" style={{ fontWeight: 800, fontSize: 16 }}>{fmt(k, fund?.[k])}</span>
              </div>
              <div className="term-def">{fund?.explain?.[k]?.how}</div>
            </div>
          ))}
      </div>
      {fund?.available && fund.recommendation && (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
          Đồng thuận phân tích viên: <b>{fund.recommendation}</b>
          {fund.targetMeanPrice ? ` · Giá mục tiêu TB: $${fund.targetMeanPrice.toFixed(2)}` : ''} — chỉ tham khảo, hãy tự
          phân tích theo <Link to="/learn/chi-so-dinh-gia">Bài 12</Link>.
        </p>
      )}
    </div>
  )
}

export default function StockDetail() {
  const { symbol } = useParams()
  const [searchParams] = useSearchParams()
  const [range, setRange] = useState(searchParams.get('range') || '6mo')
  const [toggles, setToggles] = useState({ ma20: true, ma50: true, ma200: false, bb: false })
  const [inWatch, setInWatch] = useState(null)
  const navigate = useNavigate()

  const { data, loading, error } = useApi(() => api.analysis(symbol, range), [symbol, range])
  // Báo giá live qua SSE (~5s) + polling dự phòng
  const { quotes, updatedAt, live } = useQuoteStream([symbol])
  const live2 = quotes[symbol.toUpperCase()] || null
  // BCTC chuẩn hóa dùng chung cho Tóm tắt + Sức khỏe + bảng 4 năm (1 request)
  const { data: fin } = useApi(() => api.get(`/stocks/${encodeURIComponent(symbol)}/financials`), [symbol])
  const [beginnerCharts, setBeginnerCharts] = useState(false)
  const effectiveToggles = beginnerCharts ? { ma20: false, ma50: false, ma200: false, bb: false } : toggles

  useEffect(() => {
    api
      .watchlist()
      .then((w) => setInWatch(w.some((x) => x.symbol === symbol.toUpperCase())))
      .catch(() => {})
  }, [symbol])

  const toggleWatch = async () => {
    const sym = symbol.toUpperCase()
    if (inWatch) {
      await api.removeWatch(sym)
      setInWatch(false)
    } else {
      await api.addWatch(sym, data?.name)
      setInWatch(true)
    }
  }

  const lessonIds = useMemo(() => [...new Set((data?.signals || []).map((s) => s.lessonId).filter(Boolean))], [data])
  const relatedTerms = useMemo(
    () => [...new Set((data?.signals || []).flatMap((s) => s.terms || []))].slice(0, 10),
    [data]
  )

  const price = live2?.price ?? data?.quote?.price
  const changePct = live2?.changePercent ?? data?.quote?.changePercent
  const currency = data?.currency || live2?.currency || 'USD'

  if (loading && !data) return <div className="spinner" />
  if (error && !data)
    return (
      <div className="error-box">
        Không tải được dữ liệu cho <b>{symbol}</b>: {error}. Kiểm tra lại mã cổ phiếu hoặc thử lại sau.
      </div>
    )

  const scorePct = data ? Math.max(0, Math.min(100, 50 + data.score * 9)) : 50

  return (
    <div className="grid side">
      <div>
        {/* Header */}
        <div className="card">
          <div className="stock-head">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="stock-symbol">{symbol.toUpperCase()}</span>
                <span className={`badge ${data?.market === 'VN' ? 'vn' : 'us'}`}>{data?.market === 'VN' ? 'Việt Nam' : 'Mỹ'}</span>
                {data?.demo && <span className="badge demo">DỮ LIỆU MÔ PHỎNG</span>}
                {data?.quote?.delayed && !data?.demo && <span className="badge gray">{data.quote.delayed}</span>}
                {live2 ? (
                  <span className="badge green" title={updatedAt ? `Nhận lúc ${updatedAt.toLocaleTimeString('vi-VN')}` : ''}>
                    ● {live2.delayed || 'trực tiếp'} {updatedAt ? updatedAt.toLocaleTimeString('vi-VN') : ''}
                  </span>
                ) : (
                  <span className="badge gray">○ cập nhật định kỳ</span>
                )}
              </div>
              <div className="muted">{data?.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={`stock-price num ${changePct > 0 ? 'up' : changePct < 0 ? 'down' : ''}`}>
                {fmtPrice(price, currency)}
              </div>
              <div className={`num ${changePct > 0 ? 'up' : changePct < 0 ? 'down' : ''}`} style={{ fontWeight: 700 }}>
                {changePct > 0 ? '▲' : changePct < 0 ? '▼' : '•'} {fmtPct(changePct)}
              </div>
              <div className="muted" style={{ fontSize: 11.5, fontWeight: 400, marginTop: 2 }}>
                % so với đóng cửa hôm trước · nguồn {live2?.delayed || data?.quote?.delayed || '—'} (giá có thể chậm hơn thị trường)
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className={`btn ${inWatch ? 'active' : ''}`} onClick={toggleWatch}>
                {inWatch ? '⭐ Đang theo dõi' : '☆ Theo dõi'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn buy sm" onClick={() => navigate(`/trading?symbol=${symbol}&side=BUY`)}>
                  MUA
                </button>
                <button className="btn sell sm" onClick={() => navigate(`/trading?symbol=${symbol}&side=SELL`)}>
                  BÁN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Tóm tắt 5 phút cho người mới */}
        <div style={{ marginTop: 16 }}>
          <SummaryCard symbol={symbol.toUpperCase()} name={data?.name} fin={fin} quote={live2 || data?.quote} />
        </div>

        {/* 3. Sức khỏe tài chính với MetricExplainer */}
        <div style={{ marginTop: 16 }}>
          <HealthMetricsCard symbol={symbol.toUpperCase()} fin={fin} quote={live2 || data?.quote} />
        </div>

        {/* 4. BCTC 4 năm + tỷ số (kèm toggle Cơ bản/Nâng cao) */}
        <div style={{ marginTop: 16 }}>
          <FinancialsCard symbol={symbol} fin={fin} />
        </div>

        {/* 5. So sánh đối thủ + red-flags */}
        <div style={{ marginTop: 16 }}>
          <PeersCard symbol={symbol} />
        </div>

        {/* 6. Research workspace */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title"><span>🔬 Ghi chú nghiên cứu {symbol.toUpperCase()}</span></div>
          <div className="muted" style={{ fontSize: 13.5 }}>
            Lưu luận điểm, bằng chứng, rủi ro và xuất Investment Memo cho mã này — workspace riêng của bạn.
          </div>
          <Link to={`/research/${symbol.toUpperCase()}`} className="btn sm" style={{ marginTop: 10 }}>Mở workspace →</Link>
        </div>

        {/* 7. Biểu đồ kỹ thuật — bài học BỔ TRỢ, đặt cuối */}
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div className="range-tabs">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  title={r.key === '1d' ? 'Mỗi nến = 5 phút trong phiên hôm nay — xem biến động ngắn' : `Mỗi nến = 1 ngày, nhìn ${r.label.toLowerCase()} để thấy xu hướng lớn`}
                  className={`btn sm ${range === r.key ? 'active' : ''}`}
                  onClick={() => setRange(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="chart-legend">
              <button
                className={`btn sm ${beginnerCharts ? 'active' : ''}`}
                title="Người mới: ẩn mọi đường chỉ báo, chỉ còn nến giá + khối lượng cho dễ nhìn"
                onClick={() => setBeginnerCharts(!beginnerCharts)}
              >
                🌱 Ẩn chỉ báo
              </button>
              {[
                ['ma20', 'MA20', 'Trung bình giá 20 phiên (~1 tháng) — nhịp ngắn hạn'],
                ['ma50', 'MA50', 'Trung bình giá 50 phiên (~1 quý) — huyết mạch trung hạn'],
                ['ma200', 'MA200', 'Trung bình giá 200 phiên (~1 năm) — ranh giới tăng/giảm dài hạn'],
                ['bb', 'Bollinger', 'Dải biến động ±2 độ lệch chuẩn quanh MA20 — đo "sức ép" biến động'],
              ].map(([key, label, tip]) => (
                <button
                  key={key}
                  title={tip}
                  disabled={beginnerCharts}
                  className={`btn sm ${toggles[key] && !beginnerCharts ? 'active' : ''}`}
                  onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {data?.candles?.length ? (
            <ErrorBoundary>
              <AnalysisCharts
                candles={data.candles}
                series={data.series}
                toggles={effectiveToggles}
                ranges={{ intraday: range === '1d' }}
                symbol={symbol.toUpperCase()}
                market={data.market}
                currency={currency}
                live={live2}
                liveCandles={data.market === 'US' && !data.demo}
              />
            </ErrorBoundary>
          ) : (
            <div className="empty">Không có dữ liệu nến.</div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div>
        <div className="card">
          <div className="card-title">💡 Gợi ý đầu tư (học tập)</div>
          {data && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                {overallBadge(data.overall)}
                <span className="muted num" style={{ fontSize: 12 }}>
                  Điểm tín hiệu: {data.score > 0 ? '+' : ''}
                  {data.score}
                </span>
              </div>
              <div className="score-meter">
                <div className="score-thumb" style={{ left: `${scorePct}%` }} />
              </div>
              <div className="muted" style={{ fontSize: 11.5, marginBottom: 12 }}>
                Bán ← — — — — — — — — → Mua
              </div>
              {data.signals.map((s, i) => (
                <SignalCard key={i} signal={s} />
              ))}
              <div className="tip-box" style={{ marginTop: 10 }}>
                ⚠️ {data.disclaimer}
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="card-title">🎓 Kiến thức liên quan</div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
            Các bài học gắn với các tín hiệu đang hiển thị trên biểu đồ của {symbol}:
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {lessonIds.map((id) => (
              <Link key={id} className="btn sm" to={`/learn/${id}`}>
                📖 {id === 'rsi-dong-luong' ? 'Bài 6 · RSI' : id === 'duong-trung-binh-ma' ? 'Bài 5 · MA' : id === 'macd-hoi-tu-phan-ky' ? 'Bài 7 · MACD' : id === 'bollinger-bands' ? 'Bài 8 · Bollinger' : id === 'khoi-luong-xu-huong' ? 'Bài 4 · KL & Xu hướng' : id}
              </Link>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 13, margin: '12px 0 8px' }}>Thuật ngữ xuất hiện trong gợi ý:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {relatedTerms.map((t) => (
              <Link key={t} className="btn sm ghost" to={`/glossary?q=${encodeURIComponent(t)}`}>
                {t}
              </Link>
            ))}
          </div>
        </div>

        {data && <StatsCard data={data} />}
      </div>
    </div>
  )
}
