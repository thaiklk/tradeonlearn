import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

const MODULES = [
  {
    id: 'map',
    order: '01',
    label: 'Nền móng',
    minutes: '35 phút',
    title: 'Bản đồ tài chính của một doanh nghiệp',
    outcome: 'Đọc được 3 báo cáo tài chính mà không bị ngợp bởi thuật ngữ.',
    question: 'Công ty đang bán gì, có lời không, và tiền có thật sự về tài khoản chưa?',
    explain:
      'Tài chính doanh nghiệp không bắt đầu bằng giá cổ phiếu. Nó bắt đầu bằng việc hiểu một doanh nghiệp biến đầu vào thành doanh thu, lợi nhuận và tiền mặt như thế nào. Ba báo cáo tài chính kể cùng một câu chuyện, chỉ ở ba góc nhìn khác nhau.',
    blocks: [
      ['Báo cáo kết quả kinh doanh (P&L)', 'Ghi doanh thu và chi phí trong một giai đoạn. Câu hỏi nó trả lời: công ty bán được bao nhiêu và lãi hay lỗ?'],
      ['Bảng cân đối kế toán (Balance Sheet)', 'Ảnh chụp tại một ngày. Câu hỏi nó trả lời: công ty đang có gì, nợ ai và phần còn lại thuộc về chủ sở hữu là bao nhiêu?'],
      ['Báo cáo lưu chuyển tiền tệ (Cash Flow)', 'Theo dõi tiền thật đi vào và đi ra. Câu hỏi nó trả lời: lợi nhuận trên sổ sách đã biến thành tiền chưa?'],
    ],
    formula: 'Tài sản = Nợ phải trả + Vốn chủ sở hữu',
    example: 'Một cửa hàng có 500 triệu tiền, hàng tồn kho và máy móc. Nếu còn nợ nhà cung cấp và ngân hàng 180 triệu, phần giá trị thuộc về chủ sở hữu là 320 triệu.',
    pitfall: 'Đừng nhầm doanh thu với tiền thu về. Bán chịu làm doanh thu tăng ngay, nhưng tiền có thể về sau nhiều tháng.',
    work: 'Khi phỏng vấn, hãy tập nói 30 giây: “P&L cho em biết lợi nhuận, bảng cân đối cho em biết nguồn lực và nghĩa vụ, còn cash flow kiểm tra chất lượng lợi nhuận.”',
  },
  {
    id: 'drivers',
    order: '02',
    label: 'Business drivers',
    minutes: '40 phút',
    title: 'Từ vận hành đến ngân sách và forecast',
    outcome: 'Dự phóng doanh thu, giá vốn và chi phí bằng các động lực kinh doanh rõ ràng.',
    question: 'Doanh thu tháng sau tăng vì bán nhiều hơn, tăng giá hay thay đổi cơ cấu sản phẩm?',
    explain:
      'Người làm FP&A không “đoán” doanh thu. Họ nối số tài chính với động lực vận hành. Với cửa hàng: số khách × giá trị hóa đơn. Với SaaS: số khách trả phí × giá gói. Với nhà máy: sản lượng × giá bán, sau đó trừ hao hụt và chiết khấu.',
    blocks: [
      ['Actual', 'Số đã xảy ra và đã khóa sổ. Đây là sự thật để so sánh.'],
      ['Budget', 'Cam kết đầu năm hoặc đầu kỳ. Đây là “đích” đã được phê duyệt.'],
      ['Forecast', 'Dự báo mới nhất dựa trên dữ liệu hiện có. Forecast có thể khác budget; cập nhật sớm là dấu hiệu tốt, không phải thất bại.'],
    ],
    formula: 'Doanh thu = Số lượng bán × Giá bán bình quân',
    example: 'Kế hoạch bán 1.000 đơn × 500.000đ = 500 triệu. Nếu chỉ bán 900 đơn nhưng giá bình quân lên 520.000đ, doanh thu thực tế là 468 triệu. Variance không chỉ có một nguyên nhân.',
    pitfall: 'Không nói “doanh thu giảm 6%” rồi dừng. Hãy tách thành giá, sản lượng, cơ cấu sản phẩm, mùa vụ hoặc thời điểm ghi nhận.',
    work: 'Một analyst mới cần biết làm bảng Actual vs Budget và viết được ba dòng nêu nguyên nhân, mức tác động, hành động tiếp theo.',
  },
  {
    id: 'working-capital',
    order: '03',
    label: 'Dòng tiền',
    minutes: '45 phút',
    title: 'Vốn lưu động và chu kỳ chuyển đổi tiền mặt',
    outcome: 'Nhìn ra vì sao doanh thu tăng mà tiền mặt vẫn có thể cạn.',
    question: 'Công ty phải bỏ tiền trước bao lâu rồi mới thu được tiền từ khách?',
    explain:
      'Vốn lưu động là khoản tiền bị giữ trong hàng tồn kho và phải thu, sau đó được bù lại một phần bằng khoản phải trả nhà cung cấp. Nó là chỗ nhiều doanh nghiệp tăng trưởng nhanh bị “nghẹt thở” nhất.',
    blocks: [
      ['DIO - Days Inventory Outstanding', 'Hàng nằm trong kho bao nhiêu ngày trước khi bán. DIO tăng mạnh có thể là tồn kho chậm luân chuyển.'],
      ['DSO - Days Sales Outstanding', 'Bán xong phải chờ khách trả tiền bao lâu. DSO tăng làm tiền kẹt ở khoản phải thu.'],
      ['DPO - Days Payable Outstanding', 'Công ty mất bao lâu để trả nhà cung cấp. DPO cao hơn có thể giúp giữ tiền, nhưng kéo quá xa làm quan hệ nhà cung cấp xấu đi.'],
    ],
    formula: 'CCC = DIO + DSO − DPO',
    example: 'DIO 45 ngày, DSO 35 ngày, DPO 30 ngày nghĩa là công ty tự bỏ tiền ra khoảng 50 ngày trước khi thu hồi.',
    pitfall: 'CCC thấp thường tốt hơn, nhưng luôn so cùng ngành. Siêu thị có thể thu tiền ngay và trả nhà cung cấp sau; công ty dự án lại có chu kỳ dài là bình thường.',
    work: 'Trong interview case, hãy hỏi ngay: khoản phải thu, tồn kho và công nợ phải trả thay đổi thế nào so với doanh thu?',
  },
  {
    id: 'close',
    order: '04',
    label: 'FP&A',
    minutes: '40 phút',
    title: 'Monthly close và variance analysis',
    outcome: 'Biến bảng số liệu thành một bản tin cho quản lý ra quyết định.',
    question: 'Kết quả tháng này lệch kế hoạch ở đâu, tại sao và tháng tới phải làm gì?',
    explain:
      'Sau khi kế toán khóa sổ, nhóm FP&A không chỉ gửi một file Excel. Họ biến Actual vs Budget thành một câu chuyện ngắn: KPI nào tốt/xấu, nguyên nhân chính, rủi ro tới cuối năm và hành động đề xuất.',
    blocks: [
      ['Mức chênh lệch', 'Tính chênh lệch tuyệt đối và %. Dùng % để so các dòng có quy mô khác nhau.'],
      ['Nguyên nhân gốc', 'Tách biến động thành giá, sản lượng, mix, năng suất, tỷ giá, chi phí một lần hoặc thời điểm ghi nhận.'],
      ['Hành động', 'Nêu chủ sở hữu của việc cần làm, thời hạn và ảnh hưởng dự kiến. Không biến báo cáo thành danh sách than phiền.'],
    ],
    formula: 'Variance = Actual − Budget',
    example: 'Chi phí marketing vượt budget 120 triệu. Nguyên nhân có thể là chiến dịch ra mắt mang thêm 800 đơn. Nếu lợi nhuận gộp tăng nhiều hơn 120 triệu, đây có thể là chủ động đầu tư chứ không phải “chi vượt”.',
    pitfall: 'Màu đỏ không tự động là xấu. Chi phí cao hơn budget có thể tốt nếu mang lại doanh thu, năng lực hoặc thị phần bền vững hơn.',
    work: 'Luyện một memo 1 trang: headline, ba biến động lớn nhất, forecast cuối năm, rủi ro và ba hành động có chủ sở hữu.',
  },
  {
    id: 'capital',
    order: '05',
    label: 'Đầu tư vốn',
    minutes: '50 phút',
    title: 'CAPEX, NPV, IRR và chi phí vốn',
    outcome: 'Đánh giá dự án bằng tiền mặt tăng thêm, không chỉ bằng cảm giác “có vẻ lời”.',
    question: 'Có nên chi tiền hôm nay để mở chi nhánh, mua máy hoặc xây sản phẩm mới?',
    explain:
      'Một dự án tốt phải tạo ra dòng tiền tăng thêm sau khi trả mọi chi phí liên quan. Đồng tiền hôm nay có giá trị hơn đồng tiền nhiều năm sau, vì hôm nay bạn có thể đầu tư nó hoặc vì dự án có rủi ro. NPV đưa các dòng tiền tương lai về cùng một mốc để so sánh.',
    blocks: [
      ['CAPEX', 'Chi tiền cho tài sản dùng dài hạn như máy móc, hệ thống hoặc nhà xưởng. Không phải toàn bộ CAPEX là “chi phí” ngay trên P&L.'],
      ['WACC', 'Chi phí sử dụng vốn bình quân: lợi suất tối thiểu doanh nghiệp đòi hỏi từ dự án, xét cả nợ và vốn chủ.'],
      ['NPV', 'Giá trị hiện tại ròng. NPV dương nghĩa là dự án tạo giá trị sau khi đã trừ vốn đầu tư và chi phí vốn theo giả định.'],
    ],
    formula: 'NPV = Σ [Dòng tiền năm t ÷ (1 + WACC)^t] − Vốn đầu tư ban đầu',
    example: 'Chi 1 tỷ hôm nay, thu về 450 triệu/năm trong 3 năm. Bạn không cộng thẳng 1,35 tỷ rồi kết luận; phải chiết khấu từng năm theo rủi ro và chi phí vốn.',
    pitfall: 'IRR và payback không thay thế NPV. Một dự án thu hồi vốn nhanh vẫn có thể nhỏ về giá trị; NPV trả lời trực tiếp câu hỏi “dự án thêm bao nhiêu giá trị?”.',
    work: 'Trong case phỏng vấn, luôn nêu giả định: sản lượng, giá, biên, CAPEX, vốn lưu động, WACC và sensitivity. Một con số không có giả định không phải là phân tích.',
  },
  {
    id: 'career',
    order: '06',
    label: 'Đi làm',
    minutes: '30 phút',
    title: 'Portfolio, Excel và cách kể câu chuyện bằng số',
    outcome: 'Biết phải tạo những đầu ra nào để ứng tuyển intern hoặc junior finance.',
    question: 'Nhà tuyển dụng cần thấy bằng chứng gì ngoài điểm số và chứng chỉ?',
    explain:
      'Người mới không cần một model 50 sheet. Họ cần cho thấy ba điều: hiểu cơ bản kế toán-tài chính, làm sạch và kiểm tra số liệu cẩn thận, và giao tiếp được kết luận cho người không chuyên tài chính.',
    blocks: [
      ['Excel / Sheets', 'SUMIFS, XLOOKUP, IFERROR, Pivot Table, biểu đồ, định dạng, kiểm tra logic và tham chiếu tuyệt đối. Đây là công cụ làm việc hằng ngày.'],
      ['Slide / memo', 'Một trang kết luận trước, bằng chứng sau. Quản lý không cần xem hết bảng tính trước khi biết bạn đề xuất gì.'],
      ['Portfolio', 'Ba case tự làm: forecast P&L, variance analysis, và NPV/sensitivity. Ẩn dữ liệu nhạy cảm nếu dùng case thật.'],
    ],
    formula: 'Kết luận → Bằng chứng → Rủi ro → Hành động đề xuất',
    example: '“Doanh thu dưới budget 6% chủ yếu vì sản lượng, nhưng biên tốt hơn kế hoạch. Forecast năm giảm 2%; đề xuất chuyển ngân sách marketing sang kênh có CAC thấp hơn.”',
    pitfall: 'Đừng khoe dashboard đẹp nhưng không kiểm tra công thức, đơn vị, thời kỳ hay nguồn số liệu. Finance tuyển người đáng tin trước khi tuyển người trình bày đẹp.',
    work: 'Hoàn thành ba mini case dưới đây, lưu file có tab Assumptions rõ ràng, rồi viết một README 5 dòng giải thích mục tiêu, nguồn và kết luận.',
  },
]

const ROLE_CARDS = [
  ['FP&A', 'Lập ngân sách, forecast, phân tích Actual vs Budget, giải thích KPI cho ban điều hành.', 'Công ty cần biết cuối năm sẽ đạt kế hoạch không và phải hành động gì từ tháng này.'],
  ['Corporate Finance', 'Đánh giá CAPEX/M&A, huy động vốn, cấu trúc nợ-vốn chủ, quản trị tiền mặt.', 'Công ty cần quyết định dự án nào tạo giá trị và dùng nguồn vốn nào hợp lý.'],
  ['Equity Research', 'Phân tích doanh nghiệp và định giá cho nhà đầu tư.', 'Đây là nhánh đầu tư; các bài biểu đồ và cổ phiếu hiện có của TradeLearn là phần mở rộng hữu ích sau core finance.'],
]

const CHECKLIST_KEY = 'tradelearn.corporate-finance-checklist'

function storedChecklist() {
  try {
    const value = JSON.parse(window.localStorage.getItem(CHECKLIST_KEY) || '[]')
    return Array.isArray(value) ? value.filter((id) => MODULES.some((module) => module.id === id)) : []
  } catch {
    return []
  }
}

function NumberField({ id, label, value, onChange, suffix = 'triệu đồng', min = 0, step = 1, help }) {
  return (
    <label className="field corp-input" htmlFor={id}>
      <span>{label}</span>
      <div className="corp-input-row">
        <input id={id} className="input num" type="number" min={min} step={step} value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} />
        <span>{suffix}</span>
      </div>
      {help && <small>{help}</small>}
    </label>
  )
}

function ModuleDetail({ module, done, onToggle }) {
  return (
    <section className="corp-module-detail" aria-live="polite">
      <div className="corp-detail-top">
        <div>
          <div className="corp-kicker">{module.label} · {module.minutes}</div>
          <h2>{module.title}</h2>
          <p className="corp-lede">{module.outcome}</p>
        </div>
        <button className={`btn ${done ? 'active' : 'ghost'}`} onClick={onToggle} aria-pressed={done}>
          {done ? '✓ Đã nắm ý chính' : 'Đánh dấu đã hiểu'}
        </button>
      </div>
      <div className="corp-question">Câu hỏi công việc: <b>{module.question}</b></div>
      <p className="muted corp-paragraph">{module.explain}</p>
      <div className="corp-concept-grid">
        {module.blocks.map(([title, text]) => (
          <div className="corp-concept" key={title}>
            <b>{title}</b>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="corp-formula"><span>Công thức hoặc khung suy nghĩ</span><code>{module.formula}</code></div>
      <div className="corp-detail-columns">
        <div><b>Ví dụ dễ hình dung</b><p>{module.example}</p></div>
        <div><b>Điểm dễ sai</b><p>{module.pitfall}</p></div>
      </div>
      <div className="corp-work"><b>Đầu ra để đi làm:</b> {module.work}</div>
    </section>
  )
}

function PnlLab() {
  const [values, setValues] = useState({ revenue: 1000, cogs: 540, opex: 250, interest: 35, taxRate: 20 })
  const update = (key) => (value) => setValues((current) => ({ ...current, [key]: value }))
  const grossProfit = values.revenue - values.cogs
  const ebit = grossProfit - values.opex
  const profitBeforeTax = ebit - values.interest
  const tax = Math.max(0, profitBeforeTax * values.taxRate / 100)
  const netIncome = profitBeforeTax - tax
  const margin = values.revenue ? netIncome / values.revenue * 100 : 0

  return (
    <section className="corp-lab" id="pnl-lab">
      <div className="corp-section-head">
        <div><div className="corp-kicker">LAB 01 · KẾT QUẢ KINH DOANH</div><h2>Máy đọc P&L: mỗi dòng đang nói gì?</h2></div>
        <span className="badge green">Tự thay số để học</span>
      </div>
      <p className="muted corp-paragraph">Đơn vị là triệu đồng. Đây là một P&L tối giản: thay số để nhìn trực tiếp đường đi từ doanh thu đến lợi nhuận ròng.</p>
      <div className="corp-lab-grid">
        <div className="corp-inputs">
          <NumberField id="pnl-revenue" label="Doanh thu" value={values.revenue} onChange={update('revenue')} />
          <NumberField id="pnl-cogs" label="Giá vốn hàng bán" value={values.cogs} onChange={update('cogs')} help="Nguyên vật liệu, hàng mua vào hoặc chi phí trực tiếp tạo ra sản phẩm." />
          <NumberField id="pnl-opex" label="Chi phí vận hành" value={values.opex} onChange={update('opex')} help="Lương, thuê văn phòng, marketing, phần mềm..." />
          <NumberField id="pnl-interest" label="Chi phí lãi vay" value={values.interest} onChange={update('interest')} />
          <NumberField id="pnl-tax" label="Thuế suất" value={values.taxRate} onChange={update('taxRate')} suffix="%" min={0} step={1} />
        </div>
        <div className="corp-pnl-output">
          <div><span>Doanh thu</span><strong>{values.revenue.toLocaleString('vi-VN')}</strong></div>
          <div><span>− Giá vốn</span><strong>{values.cogs.toLocaleString('vi-VN')}</strong></div>
          <div className="corp-total"><span>= Lợi nhuận gộp</span><strong>{grossProfit.toLocaleString('vi-VN')}</strong></div>
          <div><span>− Chi phí vận hành</span><strong>{values.opex.toLocaleString('vi-VN')}</strong></div>
          <div className="corp-total"><span>= EBIT</span><strong>{ebit.toLocaleString('vi-VN')}</strong></div>
          <div><span>− Lãi vay và thuế</span><strong>{(values.interest + tax).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</strong></div>
          <div className={`corp-total ${netIncome >= 0 ? 'positive' : 'negative'}`}><span>= Lợi nhuận ròng</span><strong>{netIncome.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</strong></div>
          <p>Biên ròng: <b>{margin.toFixed(1)}%</b>. Mỗi 100 đồng doanh thu, công ty giữ lại khoảng {margin.toFixed(1)} đồng sau mọi chi phí.</p>
        </div>
      </div>
    </section>
  )
}

function WorkingCapitalLab() {
  const [cycle, setCycle] = useState({ dio: 45, dso: 38, dpo: 30 })
  const update = (key) => (value) => setCycle((current) => ({ ...current, [key]: value }))
  const ccc = cycle.dio + cycle.dso - cycle.dpo
  const signal = ccc <= 0 ? 'Công ty thu tiền từ khách trước khi phải trả nhà cung cấp. Mô hình này có thể tạo tiền tốt, nhưng vẫn cần kiểm tra tính bền vững.' : ccc <= 45 ? 'Tiền bị giam ở mức tương đối kiểm soát được. Hãy so với lịch sử của chính công ty và đối thủ cùng ngành.' : 'Tiền bị giam khá lâu. Ưu tiên tìm xem tồn kho, công nợ phải thu hay điều khoản thanh toán nào đang kéo dài chu kỳ.'

  return (
    <section className="corp-lab" id="working-capital-lab">
      <div className="corp-section-head">
        <div><div className="corp-kicker">LAB 02 · VỐN LƯU ĐỘNG</div><h2>Chu kỳ tiền mặt: lợi nhuận chưa chắc đã là tiền</h2></div>
        <span className="badge amber">So sánh theo ngành</span>
      </div>
      <div className="corp-lab-grid">
        <div className="corp-inputs">
          <NumberField id="dio" label="DIO - số ngày hàng nằm trong kho" value={cycle.dio} onChange={update('dio')} suffix="ngày" />
          <NumberField id="dso" label="DSO - số ngày chờ khách thanh toán" value={cycle.dso} onChange={update('dso')} suffix="ngày" />
          <NumberField id="dpo" label="DPO - số ngày chờ trả nhà cung cấp" value={cycle.dpo} onChange={update('dpo')} suffix="ngày" />
        </div>
        <div className="corp-cycle-output">
          <div className="corp-cycle-number">{ccc.toFixed(0)} <span>ngày</span></div>
          <div className="corp-cycle-formula">{cycle.dio} DIO + {cycle.dso} DSO − {cycle.dpo} DPO</div>
          <p>{signal}</p>
          <div className="corp-mini-note"><b>Thử nghiệm:</b> giảm DSO từ {cycle.dso} xuống {Math.max(0, cycle.dso - 10)} ngày. Cùng một doanh thu, công ty thu tiền sớm hơn 10 ngày; đó có thể là nguồn vốn rẻ hơn vay ngân hàng.</div>
        </div>
      </div>
    </section>
  )
}

function NpvLab() {
  const [project, setProject] = useState({ investment: 1000, annualCashFlow: 450, years: 3, rate: 12 })
  const update = (key) => (value) => setProject((current) => ({ ...current, [key]: value }))
  const discountedCashFlows = useMemo(() => Array.from({ length: Math.max(0, Math.floor(project.years)) }, (_, index) => project.annualCashFlow / Math.pow(1 + project.rate / 100, index + 1)), [project])
  const npv = discountedCashFlows.reduce((total, cashFlow) => total + cashFlow, 0) - project.investment
  const payback = project.annualCashFlow > 0 ? project.investment / project.annualCashFlow : null

  return (
    <section className="corp-lab" id="npv-lab">
      <div className="corp-section-head">
        <div><div className="corp-kicker">LAB 03 · QUYẾT ĐỊNH ĐẦU TƯ</div><h2>Đánh giá một dự án bằng NPV</h2></div>
        <span className={`badge ${npv >= 0 ? 'green' : 'red'}`}>{npv >= 0 ? 'NPV dương' : 'NPV âm'}</span>
      </div>
      <p className="muted corp-paragraph">Mô hình học tập giả định dòng tiền tăng thêm bằng nhau mỗi năm. Trong model thật, mỗi năm có thể khác nhau và cần thêm thuế, CAPEX duy trì, vốn lưu động cùng sensitivity.</p>
      <div className="corp-lab-grid">
        <div className="corp-inputs">
          <NumberField id="investment" label="Vốn đầu tư ban đầu" value={project.investment} onChange={update('investment')} />
          <NumberField id="annual-cash-flow" label="Dòng tiền tăng thêm mỗi năm" value={project.annualCashFlow} onChange={update('annualCashFlow')} />
          <NumberField id="project-years" label="Số năm tạo dòng tiền" value={project.years} onChange={update('years')} suffix="năm" min={1} step={1} />
          <NumberField id="discount-rate" label="WACC / tỷ lệ chiết khấu" value={project.rate} onChange={update('rate')} suffix="%" min={0} step={0.5} />
        </div>
        <div className="corp-npv-output">
          <div className={`corp-npv-number ${npv >= 0 ? 'positive' : 'negative'}`}>{npv.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} <span>triệu đồng</span></div>
          <p><b>Kết luận theo giả định hiện tại:</b> {npv >= 0 ? 'dự án tạo giá trị sau khi đòi hỏi lợi suất tối thiểu.' : 'dự án chưa bù được vốn đầu tư và chi phí vốn.'}</p>
          <ul>
            <li>Tổng dòng tiền đã chiết khấu: {discountedCashFlows.reduce((total, value) => total + value, 0).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu.</li>
            <li>Payback thô: {payback ? `${payback.toFixed(1)} năm` : 'không xác định'}; dùng để xem thanh khoản, không dùng một mình để chọn dự án.</li>
            <li>Việc tiếp theo: giảm dòng tiền 15% và tăng WACC 2 điểm % để xem kết luận có đảo chiều không.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function CorporateFinance() {
  const [activeId, setActiveId] = useState(MODULES[0].id)
  const [completed, setCompleted] = useState(storedChecklist)
  const completedRef = useRef(completed)
  const activeModule = MODULES.find((module) => module.id === activeId) || MODULES[0]

  useEffect(() => {
    completedRef.current = completed
    try {
      window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(completed))
    } catch {
      // Tiến độ là tiện ích cục bộ; học vẫn hoạt động khi localStorage bị chặn.
    }
  }, [completed])

  useEffect(() => {
    let cancelled = false
    api.corporateFinanceProgress()
      .then(({ completedIds }) => {
        if (cancelled) return
        const remote = Array.isArray(completedIds) ? completedIds : []
        const local = storedChecklist()
        const merged = [...new Set([...local, ...remote])]
        completedRef.current = merged
        setCompleted(merged)
        const missingRemote = local.filter((id) => !remote.includes(id))
        return Promise.all(missingRemote.map((id) => api.setCorporateFinanceProgress(id, true)))
      })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  const toggleModule = (id) => {
    const current = completedRef.current
    const done = !current.includes(id)
    const next = done ? [...current, id] : current.filter((item) => item !== id)
    completedRef.current = next
    setCompleted(next)
    api.setCorporateFinanceProgress(id, done).catch(() => undefined)
  }

  return (
    <div className="corp-page">
      <section className="corp-hero">
        <div>
          <div className="corp-kicker">TRACK NỀN TẢNG · CORPORATE FINANCE / FP&A</div>
          <h1>Tài chính doanh nghiệp từ số 0 đến công việc đầu tiên</h1>
          <p>Học cách doanh nghiệp kiếm tiền, giữ tiền và ra quyết định đầu tư. Mỗi chủ đề gắn với một câu hỏi mà intern hoặc junior finance thực sự gặp khi đi làm.</p>
          <div className="corp-hero-actions">
            <a className="btn primary" href="#curriculum">Bắt đầu lộ trình</a>
            <a className="btn" href="#labs">Làm lab với số liệu</a>
            <Link className="btn ghost" to="/desk">Luyện task phân tích cổ phiếu</Link>
          </div>
        </div>
        <div className="corp-hero-proof" aria-label="Kết quả học tập">
          <div><strong>6</strong><span>module nền tảng</span></div>
          <div><strong>3</strong><span>lab tính toán</span></div>
          <div><strong>3</strong><span>case portfolio nên có</span></div>
        </div>
      </section>

      <section className="corp-section" aria-labelledby="roles-title">
        <div className="corp-section-head">
          <div><div className="corp-kicker">CHỌN ĐÚNG HƯỚNG</div><h2 id="roles-title">Tài chính doanh nghiệp khác gì đầu tư chứng khoán?</h2></div>
        </div>
        <p className="muted corp-paragraph">Nếu mục tiêu là đi làm trong phòng finance của một doanh nghiệp, hãy học track này trước. Phân tích biểu đồ và cổ phiếu ở TradeLearn vẫn hữu ích, nhưng là nhánh Equity Research & Investing sau khi đã vững nền tảng.</p>
        <div className="corp-role-grid">
          {ROLE_CARDS.map(([title, job, why]) => (
            <article className="corp-role" key={title}>
              <h3>{title}</h3>
              <p><b>Làm gì:</b> {job}</p>
              <p><b>Vì sao có việc:</b> {why}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="corp-section" id="curriculum" aria-labelledby="curriculum-title">
        <div className="corp-section-head">
          <div><div className="corp-kicker">LỘ TRÌNH 6 BƯỚC</div><h2 id="curriculum-title">Học đúng thứ tự để số liệu không còn rời rạc</h2></div>
          <span className="badge gray">{completed.length}/{MODULES.length} ý chính đã nắm</span>
        </div>
        <div className="corp-module-picker" role="tablist" aria-label="Các module tài chính doanh nghiệp">
          {MODULES.map((module) => (
            <button key={module.id} className={`corp-module-tab ${module.id === activeId ? 'active' : ''} ${completed.includes(module.id) ? 'done' : ''}`} role="tab" aria-selected={module.id === activeId} onClick={() => setActiveId(module.id)}>
              <span>{module.order}</span><b>{module.label}</b><small>{module.minutes}</small>
            </button>
          ))}
        </div>
        <ModuleDetail module={activeModule} done={completed.includes(activeModule.id)} onToggle={() => toggleModule(activeModule.id)} />
      </section>

      <section className="corp-section" id="labs" aria-labelledby="labs-title">
        <div className="corp-section-head">
          <div><div className="corp-kicker">HỌC BẰNG SỐ</div><h2 id="labs-title">Ba lab nền tảng</h2></div>
        </div>
        <PnlLab />
        <WorkingCapitalLab />
        <NpvLab />
      </section>

      <section className="corp-section" aria-labelledby="portfolio-title">
        <div className="corp-section-head">
          <div><div className="corp-kicker">SẴN SÀNG ỨNG TUYỂN</div><h2 id="portfolio-title">Ba sản phẩm đưa vào portfolio</h2></div>
        </div>
        <div className="corp-deliverable-grid">
          <article><span>01</span><h3>Monthly P&L và forecast</h3><p>Tự chọn một mô hình đơn giản: quán cà phê, cửa hàng online hoặc SaaS. Có tab Assumptions, Actual, Budget, Forecast và biểu đồ doanh thu-biên lợi nhuận.</p><b>Phải giải thích được:</b> forecast đổi vì giá, sản lượng hay chi phí nào?</article>
          <article><span>02</span><h3>Variance analysis 1 trang</h3><p>Tạo một bảng Actual vs Budget, chọn ba biến động lớn nhất, tách nguyên nhân và viết phần action có người phụ trách, hạn hoàn thành.</p><b>Phải giải thích được:</b> chênh lệch nào quan trọng nhất và ảnh hưởng cả năm ra sao?</article>
          <article><span>03</span><h3>Business case NPV</h3><p>Đánh giá mở cửa hàng, mua thiết bị hoặc triển khai hệ thống. Nêu CAPEX, dòng tiền tăng thêm, WACC, NPV và bảng sensitivity doanh thu/WACC.</p><b>Phải giải thích được:</b> giả định nào quyết định nhất, và điểm hòa vốn ở đâu?</article>
        </div>
        <div className="corp-next-step">
          <div><b>Nhịp học đề xuất:</b> mỗi tuần một module, sau đó làm lại lab bằng số của chính bạn. Khi hoàn thành, quay lại <Link to="/roadmap">Lộ trình Analyst</Link> để mở rộng sang định giá, nghiên cứu doanh nghiệp và thị trường.</div>
          <Link className="btn primary" to="/learn/bao-cao-tai-chinh-1-can-doi">Ôn bài Bảng cân đối →</Link>
        </div>
      </section>
    </div>
  )
}
