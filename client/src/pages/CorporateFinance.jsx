import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import {
  CORPORATE_FINANCE_LABS,
  CORPORATE_FINANCE_MODULES,
  CORPORATE_FINANCE_SOURCES,
} from '../content/corporateFinanceCurriculum.js'

const CHECKLIST_KEY = 'tradelearn.corporate-finance-checklist'
const MODULE_IDS = new Set(CORPORATE_FINANCE_MODULES.map((module) => module.id))
const SOURCES_BY_ID = new Map(CORPORATE_FINANCE_SOURCES.map((source) => [source.id, source]))

const formatNumber = (value, maximumFractionDigits = 1) =>
  Number(value || 0).toLocaleString('vi-VN', { maximumFractionDigits })

function storedChecklist() {
  try {
    const value = JSON.parse(window.localStorage.getItem(CHECKLIST_KEY) || '[]')
    return Array.isArray(value) ? value.filter((id) => MODULE_IDS.has(id)) : []
  } catch {
    return []
  }
}

function NumberField({ id, label, value, onChange, suffix = 'triệu đồng', min = 0, step = 1, help }) {
  return (
    <label className="field corp-input" htmlFor={id}>
      <span>{label}</span>
      <div className="corp-input-row">
        <input
          id={id}
          className="input num"
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
        />
        <span>{suffix}</span>
      </div>
      {help && <small>{help}</small>}
    </label>
  )
}

function ModuleDetail({ module, done, onToggle }) {
  const sources = module.sources.map((id) => SOURCES_BY_ID.get(id)).filter(Boolean)

  return (
    <section className="corp-module-detail" aria-live="polite">
      <div className="corp-detail-top">
        <div>
          <div className="corp-kicker">MÔ-ĐUN {module.order} · {module.minutes}</div>
          <h2>{module.title}</h2>
          <p className="corp-lede">{module.outcome}</p>
        </div>
        <button className={`btn ${done ? 'active' : 'ghost'}`} onClick={onToggle} aria-pressed={done}>
          {done ? 'Đã nắm ý chính' : 'Đánh dấu đã hiểu'}
        </button>
      </div>

      <div className="corp-prerequisite"><b>Cần biết trước:</b> {module.prerequisite}</div>
      <div className="corp-question"><span>Câu hỏi công việc</span><b>{module.question}</b></div>
      <p className="muted corp-paragraph">{module.explain}</p>

      <div className="corp-concept-grid">
        {module.blocks.map((block) => (
          <div className="corp-concept" key={block.title}>
            <b>{block.title}</b>
            <p>{block.text}</p>
          </div>
        ))}
      </div>

      <div className="corp-formula">
        <span>{module.formula.label}</span>
        <code>{module.formula.expression}</code>
        <p>{module.formula.explanation}</p>
      </div>

      <div className="corp-worked-example">
        <div className="corp-example-label">VÍ DỤ ĐÃ GIẢI</div>
        <p><b>Bối cảnh:</b> {module.workedExample.context}</p>
        <p><b>Cách tính:</b> {module.workedExample.calculation}</p>
        <p><b>Kết luận:</b> {module.workedExample.conclusion}</p>
      </div>

      <div className="corp-detail-columns">
        <div><b>Điểm dễ sai</b><p>{module.pitfall}</p></div>
        <div><b>Đầu ra khi đi làm</b><p>{module.jobOutput}</p></div>
      </div>

      <div className="corp-guided-practice">
        <div className="corp-practice-head">
          <div><span>THỰC HÀNH CÓ HƯỚNG DẪN</span><h3>{module.practice.case}</h3></div>
          <span className="badge green">Không có đáp án chọn sẵn</span>
        </div>
        <ol>
          {module.practice.steps.map((item) => <li key={item}>{item}</li>)}
        </ol>
        <div className="corp-self-check">
          <b>Tự đối chiếu trước khi chuyển mô-đun</b>
          <ul>{module.practice.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>

      <div className="corp-module-sources">
        <span>Khung tham khảo đã kiểm chứng:</span>
        {sources.map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
            {source.institution} · {source.title}
          </a>
        ))}
      </div>
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
  const contribution = values.revenue - values.cogs

  return (
    <section className="corp-lab" id="pnl-lab">
      <div className="corp-section-head">
        <div><div className="corp-kicker">LAB 01 · KẾT QUẢ KINH DOANH</div><h2>Máy đọc P&amp;L: từng dòng thay đổi điều gì?</h2></div>
        <span className="badge green">Tự thay số để học</span>
      </div>
      <p className="muted corp-paragraph">Đơn vị là triệu đồng. Thử giảm giá vốn hoặc tăng chi phí vận hành, sau đó giải thích vì sao lợi nhuận ròng đổi khác doanh thu.</p>
      <div className="corp-lab-grid">
        <div className="corp-inputs">
          <NumberField id="pnl-revenue" label="Doanh thu" value={values.revenue} onChange={update('revenue')} />
          <NumberField id="pnl-cogs" label="Giá vốn hàng bán" value={values.cogs} onChange={update('cogs')} help="Chi phí trực tiếp tạo hoặc mua hàng hóa, dịch vụ đã bán." />
          <NumberField id="pnl-opex" label="Chi phí vận hành" value={values.opex} onChange={update('opex')} help="Lương, thuê văn phòng, marketing, phần mềm và chi phí quản lý." />
          <NumberField id="pnl-interest" label="Chi phí lãi vay" value={values.interest} onChange={update('interest')} />
          <NumberField id="pnl-tax" label="Thuế suất minh họa" value={values.taxRate} onChange={update('taxRate')} suffix="%" min={0} step={1} />
        </div>
        <div className="corp-pnl-output">
          <div><span>Doanh thu</span><strong>{formatNumber(values.revenue)}</strong></div>
          <div><span>Trừ giá vốn</span><strong>{formatNumber(values.cogs)}</strong></div>
          <div className="corp-total"><span>Lợi nhuận gộp</span><strong>{formatNumber(grossProfit)}</strong></div>
          <div><span>Trừ chi phí vận hành</span><strong>{formatNumber(values.opex)}</strong></div>
          <div className="corp-total"><span>EBIT</span><strong>{formatNumber(ebit)}</strong></div>
          <div><span>Trừ lãi vay và thuế</span><strong>{formatNumber(values.interest + tax)}</strong></div>
          <div className={`corp-total ${netIncome >= 0 ? 'positive' : 'negative'}`}><span>Lợi nhuận ròng</span><strong>{formatNumber(netIncome)}</strong></div>
          <p>Biên ròng: <b>{margin.toFixed(1)}%</b>. Phần đóng góp trước chi phí vận hành: <b>{formatNumber(contribution)}</b> triệu đồng. Hãy tách hai khái niệm này khi trình bày với quản lý.</p>
        </div>
      </div>
    </section>
  )
}

function VarianceLab() {
  const [values, setValues] = useState({
    revenueBudget: 500,
    revenueActual: 468,
    cogsBudget: 280,
    cogsActual: 270,
    payrollBudget: 100,
    payrollActual: 108,
    marketingBudget: 45,
    marketingActual: 62,
  })
  const [memo, setMemo] = useState('')
  const update = (key) => (value) => setValues((current) => ({ ...current, [key]: value }))
  const budgetEbit = values.revenueBudget - values.cogsBudget - values.payrollBudget - values.marketingBudget
  const actualEbit = values.revenueActual - values.cogsActual - values.payrollActual - values.marketingActual
  const lines = [
    ['Doanh thu', values.revenueBudget, values.revenueActual, 'Thu nhập'],
    ['Giá vốn', values.cogsBudget, values.cogsActual, 'Chi phí'],
    ['Chi phí nhân sự', values.payrollBudget, values.payrollActual, 'Chi phí'],
    ['Marketing', values.marketingBudget, values.marketingActual, 'Chi phí'],
    ['EBIT', budgetEbit, actualEbit, 'Lợi nhuận'],
  ]
  const ebitVariance = actualEbit - budgetEbit
  const headline = ebitVariance >= 0
    ? 'Kết quả EBIT đang tốt hơn kế hoạch, nhưng vẫn cần xác định nguồn cải thiện có lặp lại được không.'
    : 'Kết quả EBIT đang dưới kế hoạch; hãy tách tác động doanh thu, giá vốn và các chi phí có chủ đích trước khi đề xuất hành động.'

  return (
    <section className="corp-lab" id="variance-lab">
      <div className="corp-section-head">
        <div><div className="corp-kicker">LAB 02 · ACTUAL VS BUDGET</div><h2>Từ chênh lệch đến memo một trang</h2></div>
        <span className={`badge ${ebitVariance >= 0 ? 'green' : 'red'}`}>{ebitVariance >= 0 ? 'EBIT vượt kế hoạch' : 'EBIT dưới kế hoạch'}</span>
      </div>
      <p className="muted corp-paragraph">Quy ước bảng này là Actual trừ Budget. Với doanh thu, số âm thường không tốt; với chi phí, số dương thường cần giải thích. Đừng chỉ nhìn màu của một ô.</p>
      <div className="corp-lab-grid">
        <div className="corp-inputs corp-compact-inputs">
          <NumberField id="revenue-budget" label="Doanh thu Budget" value={values.revenueBudget} onChange={update('revenueBudget')} />
          <NumberField id="revenue-actual" label="Doanh thu Actual" value={values.revenueActual} onChange={update('revenueActual')} />
          <NumberField id="cogs-budget" label="Giá vốn Budget" value={values.cogsBudget} onChange={update('cogsBudget')} />
          <NumberField id="cogs-actual" label="Giá vốn Actual" value={values.cogsActual} onChange={update('cogsActual')} />
          <NumberField id="payroll-budget" label="Nhân sự Budget" value={values.payrollBudget} onChange={update('payrollBudget')} />
          <NumberField id="payroll-actual" label="Nhân sự Actual" value={values.payrollActual} onChange={update('payrollActual')} />
          <NumberField id="marketing-budget" label="Marketing Budget" value={values.marketingBudget} onChange={update('marketingBudget')} />
          <NumberField id="marketing-actual" label="Marketing Actual" value={values.marketingActual} onChange={update('marketingActual')} />
        </div>
        <div className="corp-variance-output">
          <table className="corp-lab-table">
            <thead><tr><th>Dòng</th><th>Budget</th><th>Actual</th><th>Chênh lệch</th></tr></thead>
            <tbody>
              {lines.map(([label, budget, actual, type]) => {
                const variance = actual - budget
                const percent = budget ? variance / Math.abs(budget) * 100 : 0
                return (
                  <tr key={label}>
                    <td><b>{label}</b><small>{type}</small></td>
                    <td>{formatNumber(budget)}</td>
                    <td>{formatNumber(actual)}</td>
                    <td className={variance >= 0 ? 'up' : 'down'}>{variance >= 0 ? '+' : ''}{formatNumber(variance)} <small>({percent.toFixed(1)}%)</small></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="corp-lab-insight"><b>Headline gợi ý:</b> {headline}</p>
          <label className="field corp-memo" htmlFor="variance-memo">
            <span>Viết 3 dòng theo khung: nguyên nhân → tác động → hành động</span>
            <textarea id="variance-memo" className="input" rows={5} value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="Ví dụ: Doanh thu thiếu do sản lượng thấp hơn kế hoạch..." />
          </label>
          <details className="corp-lab-review">
            <summary>Tự đối chiếu memo</summary>
            <ul>
              <li>Có nêu đúng dòng tài chính và mức chênh lệch.</li>
              <li>Phân biệt nguyên nhân có thể kiểm chứng với suy đoán.</li>
              <li>Có người phụ trách hoặc bước kiểm tra kế tiếp.</li>
            </ul>
          </details>
        </div>
      </div>
    </section>
  )
}

function WorkingCapitalLab() {
  const [cycle, setCycle] = useState({ dio: 45, dso: 38, dpo: 30 })
  const update = (key) => (value) => setCycle((current) => ({ ...current, [key]: value }))
  const ccc = cycle.dio + cycle.dso - cycle.dpo
  const signal = ccc <= 0
    ? 'Công ty thu tiền từ khách trước khi phải trả nhà cung cấp. Đây có thể là lợi thế, nhưng vẫn cần kiểm tra tính bền vững của điều khoản thanh toán.'
    : ccc <= 45
      ? 'Tiền bị giam ở mức cần theo dõi. Hãy so với lịch sử của chính công ty và các doanh nghiệp cùng mô hình.'
      : 'Tiền bị giam khá lâu. Hãy xác định tồn kho, khoản phải thu hay điều khoản trả nhà cung cấp đang là nguyên nhân chính.'

  return (
    <section className="corp-lab" id="working-capital-lab">
      <div className="corp-section-head">
        <div><div className="corp-kicker">LAB 03 · VỐN LƯU ĐỘNG</div><h2>Chu kỳ tiền mặt: lợi nhuận chưa chắc đã là tiền</h2></div>
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
          <div className="corp-cycle-formula">{cycle.dio} DIO + {cycle.dso} DSO - {cycle.dpo} DPO</div>
          <p>{signal}</p>
          <div className="corp-mini-note"><b>Thử nghiệm:</b> giảm DSO từ {cycle.dso} xuống {Math.max(0, cycle.dso - 10)} ngày. Cùng một doanh thu, công ty thu tiền sớm hơn 10 ngày; đó có thể là nguồn vốn rẻ hơn vay ngân hàng.</div>
        </div>
      </div>
    </section>
  )
}

function CashBudgetLab() {
  const [openingCash, setOpeningCash] = useState(120)
  const [weeks, setWeeks] = useState([
    { label: 'Tuần 1', collections: 105, suppliers: 120, payroll: 0, other: 18 },
    { label: 'Tuần 2', collections: 110, suppliers: 85, payroll: 48, other: 18 },
    { label: 'Tuần 3', collections: 85, suppliers: 105, payroll: 0, other: 21 },
    { label: 'Tuần 4', collections: 145, suppliers: 95, payroll: 0, other: 22 },
  ])
  const updateWeek = (index, key, value) => setWeeks((current) => current.map((week, weekIndex) => (
    weekIndex === index ? { ...week, [key]: Number(value) || 0 } : week
  )))
  const schedule = useMemo(() => weeks.reduce((all, week, index) => {
    const opening = index ? all[index - 1].closing : openingCash
    const netFlow = week.collections - week.suppliers - week.payroll - week.other
    all.push({ ...week, opening, netFlow, closing: opening + netFlow })
    return all
  }, []), [openingCash, weeks])
  const minimumCash = Math.min(openingCash, ...schedule.map((week) => week.closing))
  const firstGap = schedule.find((week) => week.closing < 0)

  return (
    <section className="corp-lab" id="cash-budget-lab">
      <div className="corp-section-head">
        <div><div className="corp-kicker">LAB 04 · THANH KHOẢN</div><h2>Ngân sách tiền mặt: phát hiện thiếu tiền trước khi nó xảy ra</h2></div>
        <span className={`badge ${firstGap ? 'red' : 'green'}`}>{firstGap ? 'Có khoảng trống tiền' : 'Không âm tiền theo giả định'}</span>
      </div>
      <p className="muted corp-paragraph">Mô hình minh họa 4 tuần đầu của một kế hoạch 13 tuần. Bạn sẽ thay số thu khách hàng và chi tiền để nhìn ngày thiếu tiền, rồi quyết định thu sớm, giãn chi hoặc chuẩn bị hạn mức.</p>
      <div className="corp-cash-opening">
        <NumberField id="opening-cash" label="Tiền đầu kỳ tuần 1" value={openingCash} onChange={setOpeningCash} />
        <div><b>Quy tắc:</b> tiền cuối kỳ này là tiền đầu kỳ của kỳ sau. Budget lợi nhuận không thay thế được bảng tiền mặt.</div>
      </div>
      <div className="corp-table-scroll">
        <table className="corp-cash-table">
          <thead><tr><th>Tuần</th><th>Thu từ khách</th><th>Trả NCC</th><th>Lương</th><th>Chi khác</th><th>Dòng tiền ròng</th><th>Tiền cuối kỳ</th></tr></thead>
          <tbody>
            {schedule.map((week, index) => (
              <tr key={week.label}>
                <th>{week.label}<small>Đầu kỳ: {formatNumber(week.opening)}</small></th>
                {['collections', 'suppliers', 'payroll', 'other'].map((key) => (
                  <td key={key}><input className="input num" type="number" min="0" value={week[key]} aria-label={`${week.label} ${key}`} onChange={(event) => updateWeek(index, key, event.target.value)} /></td>
                ))}
                <td className={week.netFlow >= 0 ? 'up' : 'down'}>{week.netFlow >= 0 ? '+' : ''}{formatNumber(week.netFlow)}</td>
                <td className={week.closing >= 0 ? 'up' : 'down'}><b>{formatNumber(week.closing)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="corp-cash-result">
        <div><span>Tiền thấp nhất</span><strong className={minimumCash >= 0 ? 'up' : 'down'}>{formatNumber(minimumCash)} triệu đồng</strong></div>
        <p>{firstGap
          ? `Tiền sẽ âm ở ${firstGap.label}. Hãy ưu tiên xác nhận thu khách hàng, điều khoản nhà cung cấp, lịch chi và hạn mức tín dụng trước khi chi thêm.`
          : 'Theo giả định hiện tại chưa có tuần âm tiền. Hãy thử giảm thu khách hàng 15% hoặc tăng chi trả nhà cung cấp để kiểm tra biên an toàn.'}
        </p>
      </div>
    </section>
  )
}

function NpvLab() {
  const [project, setProject] = useState({ investment: 1000, annualCashFlow: 450, years: 3, rate: 12 })
  const update = (key) => (value) => setProject((current) => ({ ...current, [key]: value }))
  const calculateNpv = (annualCashFlow, rate) => (
    Array.from({ length: Math.max(0, Math.floor(project.years)) }, (_, index) => annualCashFlow / Math.pow(1 + rate / 100, index + 1))
      .reduce((total, cashFlow) => total + cashFlow, 0) - project.investment
  )
  const discountedCashFlows = useMemo(() => Array.from(
    { length: Math.max(0, Math.floor(project.years)) },
    (_, index) => project.annualCashFlow / Math.pow(1 + project.rate / 100, index + 1)
  ), [project])
  const npv = calculateNpv(project.annualCashFlow, project.rate)
  const payback = project.annualCashFlow > 0 ? project.investment / project.annualCashFlow : null
  const sensitivityRates = [Math.max(0, project.rate - 2), project.rate, project.rate + 2]
  const sensitivityFlows = [0.85, 1, 1.15]

  return (
    <section className="corp-lab" id="npv-lab">
      <div className="corp-section-head">
        <div><div className="corp-kicker">LAB 05 · QUYẾT ĐỊNH ĐẦU TƯ</div><h2>Đánh giá dự án bằng NPV và sensitivity</h2></div>
        <span className={`badge ${npv >= 0 ? 'green' : 'red'}`}>{npv >= 0 ? 'NPV dương' : 'NPV âm'}</span>
      </div>
      <p className="muted corp-paragraph">Dòng tiền ở đây là dòng tiền tăng thêm sau thuế theo năm để học công thức. Model thật cần thêm vốn lưu động, CAPEX duy trì, thời điểm phát sinh tiền và giá trị thanh lý.</p>
      <div className="corp-lab-grid">
        <div className="corp-inputs">
          <NumberField id="investment" label="Vốn đầu tư ban đầu" value={project.investment} onChange={update('investment')} />
          <NumberField id="annual-cash-flow" label="Dòng tiền tăng thêm mỗi năm" value={project.annualCashFlow} onChange={update('annualCashFlow')} />
          <NumberField id="project-years" label="Số năm tạo dòng tiền" value={project.years} onChange={update('years')} suffix="năm" min={1} step={1} />
          <NumberField id="discount-rate" label="WACC / tỷ lệ chiết khấu" value={project.rate} onChange={update('rate')} suffix="%" min={0} step={0.5} />
        </div>
        <div className="corp-npv-output">
          <div className={`corp-npv-number ${npv >= 0 ? 'positive' : 'negative'}`}>{formatNumber(npv)} <span>triệu đồng</span></div>
          <p><b>Kết luận theo giả định hiện tại:</b> {npv >= 0 ? 'dự án tạo giá trị sau khi đòi hỏi lợi suất tối thiểu.' : 'dự án chưa bù được vốn đầu tư và chi phí vốn.'}</p>
          <ul>
            <li>Tổng dòng tiền đã chiết khấu: {formatNumber(discountedCashFlows.reduce((total, value) => total + value, 0))} triệu đồng.</li>
            <li>Payback thô: {payback ? `${payback.toFixed(1)} năm` : 'không xác định'}; dùng để xem thanh khoản, không dùng một mình để chọn dự án.</li>
          </ul>
          <div className="corp-sensitivity">
            <b>Bảng độ nhạy NPV: dòng tiền / WACC</b>
            <table>
              <thead><tr><th>Dòng tiền</th>{sensitivityRates.map((rate) => <th key={rate}>{formatNumber(rate)}%</th>)}</tr></thead>
              <tbody>{sensitivityFlows.map((factor) => <tr key={factor}><th>{formatNumber(factor * 100)}%</th>{sensitivityRates.map((rate) => <td key={rate} className={calculateNpv(project.annualCashFlow * factor, rate) >= 0 ? 'up' : 'down'}>{formatNumber(calculateNpv(project.annualCashFlow * factor, rate))}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

const ROLE_CARDS = [
  ['FP&A', 'Lập ngân sách, forecast, phân tích Actual vs Budget và giải thích KPI cho ban điều hành.', 'Công ty cần biết cuối năm sẽ đạt kế hoạch không và phải hành động gì từ tháng này.'],
  ['Corporate Finance', 'Đánh giá CAPEX/M&A, nguồn tài trợ, cấu trúc nợ - vốn chủ và thanh khoản.', 'Công ty cần ưu tiên dự án tạo giá trị và chọn nguồn vốn chịu được rủi ro.'],
  ['Kế toán quản trị', 'Thiết kế báo cáo, phân bổ chi phí và giúp đội vận hành dùng số liệu đúng.', 'Quyết định tốt cần số đáng tin, đúng kỳ và đúng cách giải thích.'],
]

export default function CorporateFinance() {
  const [activeId, setActiveId] = useState(CORPORATE_FINANCE_MODULES[0].id)
  const [completed, setCompleted] = useState(storedChecklist)
  const completedRef = useRef(completed)
  const activeModule = CORPORATE_FINANCE_MODULES.find((module) => module.id === activeId) || CORPORATE_FINANCE_MODULES[0]

  useEffect(() => {
    completedRef.current = completed
    try {
      window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(completed))
    } catch {
      // Tiến độ cục bộ chỉ là dự phòng; bản online đồng bộ qua API.
    }
  }, [completed])

  useEffect(() => {
    let cancelled = false
    api.corporateFinanceProgress()
      .then(({ completedIds }) => {
        if (cancelled) return
        const remote = Array.isArray(completedIds) ? completedIds.filter((id) => MODULE_IDS.has(id)) : []
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
          <div className="corp-kicker">GIÁO TRÌNH GỐC BẰNG TIẾNG VIỆT · CORPORATE FINANCE / FP&amp;A</div>
          <h1>Tài chính doanh nghiệp từ số 0 đến công việc đầu tiên</h1>
          <p>Học theo mạch công việc thực tế: hiểu doanh nghiệp, đọc báo cáo, lập kế hoạch, bảo vệ dòng tiền, ra quyết định đầu tư và trình bày kết luận. Không cần biết trước kế toán hay Excel nâng cao.</p>
          <div className="corp-hero-actions">
            <a className="btn primary" href="#curriculum">Bắt đầu mô-đun 01</a>
            <a className="btn" href="#labs">Làm lab với số liệu</a>
            <Link className="btn ghost" to="/desk">Mở Phòng phân tích</Link>
          </div>
        </div>
        <div className="corp-hero-proof" aria-label="Kết quả học tập">
          <div><strong>12</strong><span>mô-đun có thứ tự</span></div>
          <div><strong>5</strong><span>lab tính và viết memo</span></div>
          <div><strong>3</strong><span>sản phẩm portfolio</span></div>
        </div>
      </section>

      <section className="corp-section" aria-labelledby="roles-title">
        <div className="corp-section-head">
          <div><div className="corp-kicker">CHỌN ĐÚNG HƯỚNG</div><h2 id="roles-title">Tài chính doanh nghiệp khác gì đầu tư chứng khoán?</h2></div>
        </div>
        <p className="muted corp-paragraph">Track này dành cho sinh viên muốn đi vào FP&amp;A, corporate finance hoặc kế toán quản trị. Phân tích cổ phiếu ở TradeLearn vẫn hữu ích để luyện tư duy doanh nghiệp, nhưng không thay thế quy trình budget, forecast, cash planning và business case.</p>
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
          <div><div className="corp-kicker">LỘ TRÌNH TỪ NỀN TẢNG ĐẾN ĐI LÀM</div><h2 id="curriculum-title">Mỗi mô-đun là một câu hỏi công việc cần giải</h2></div>
          <span className="badge gray">{completed.length}/{CORPORATE_FINANCE_MODULES.length} mô-đun đã đánh dấu</span>
        </div>
        <p className="muted corp-paragraph">Đọc phần giải thích, tự làm ví dụ, sau đó hoàn thành bài thực hành ở cuối mô-đun. Nút đánh dấu dùng để giữ nhịp học của bạn, không phải điểm số.</p>
        <div className="corp-module-picker" role="tablist" aria-label="Các mô-đun tài chính doanh nghiệp">
          {CORPORATE_FINANCE_MODULES.map((module) => (
            <button key={module.id} className={`corp-module-tab ${module.id === activeId ? 'active' : ''} ${completed.includes(module.id) ? 'done' : ''}`} role="tab" aria-selected={module.id === activeId} onClick={() => setActiveId(module.id)}>
              <span>{module.order}</span><b>{module.label}</b><small>{module.minutes}</small>
            </button>
          ))}
        </div>
        <ModuleDetail module={activeModule} done={completed.includes(activeModule.id)} onToggle={() => toggleModule(activeModule.id)} />
      </section>

      <section className="corp-section" id="labs" aria-labelledby="labs-title">
        <div className="corp-section-head">
          <div><div className="corp-kicker">HỌC BẰNG SỐ VÀ QUYẾT ĐỊNH</div><h2 id="labs-title">Năm lab để luyện tay trước khi ứng tuyển</h2></div>
        </div>
        <div className="corp-lab-map">
          {CORPORATE_FINANCE_LABS.map((lab, index) => <a href={`#${lab.id}`} key={lab.id}><span>{String(index + 1).padStart(2, '0')}</span><b>{lab.title}</b><small>{lab.purpose}</small></a>)}
        </div>
        <PnlLab />
        <VarianceLab />
        <WorkingCapitalLab />
        <CashBudgetLab />
        <NpvLab />
      </section>

      <section className="corp-section" aria-labelledby="portfolio-title">
        <div className="corp-section-head">
          <div><div className="corp-kicker">SẴN SÀNG ỨNG TUYỂN</div><h2 id="portfolio-title">Ba sản phẩm đưa vào portfolio</h2></div>
        </div>
        <div className="corp-deliverable-grid">
          <article><span>01</span><h3>Monthly P&amp;L và forecast</h3><p>Một mô hình đơn giản có Assumptions, Actual, Budget, Forecast, cùng biểu đồ doanh thu và biên lợi nhuận.</p><b>Phải giải thích được: forecast đổi vì giá, sản lượng, cơ cấu hay chi phí nào?</b></article>
          <article><span>02</span><h3>Variance analysis một trang</h3><p>Bảng Actual vs Budget, ba biến động lớn nhất, nguyên nhân, tác động cả năm và hành động có người phụ trách.</p><b>Phải giải thích được: dòng nào quan trọng nhất và cần kiểm chứng điều gì?</b></article>
          <article><span>03</span><h3>Business case NPV</h3><p>CAPEX, dòng tiền tăng thêm, WACC, NPV, bảng sensitivity và memo khuyến nghị có điều kiện.</p><b>Phải giải thích được: giả định nào quyết định kết luận và ngưỡng đảo chiều ở đâu?</b></article>
        </div>
        <div className="corp-next-step">
          <div><b>Nhịp học đề xuất:</b> hai mô-đun mỗi tuần, hoàn thành lab tương ứng rồi lưu một phiên bản có ngày tháng vào portfolio. Khi đã vững core finance, quay lại <Link to="/roadmap">Lộ trình Analyst</Link> để mở rộng sang định giá cổ phiếu và nghiên cứu thị trường.</div>
          <Link className="btn primary" to="/learn/bao-cao-tai-chinh-1-can-doi">Ôn thêm báo cáo tài chính</Link>
        </div>
      </section>

      <section className="corp-section corp-sources" id="sources" aria-labelledby="sources-title">
        <div className="corp-section-head">
          <div><div className="corp-kicker">NGUỒN THAM KHẢO ĐÃ KIỂM CHỨNG</div><h2 id="sources-title">Khung học thuật công khai, nội dung được diễn giải mới bằng tiếng Việt</h2></div>
        </div>
        <p className="muted corp-paragraph">Các nguồn dưới đây được kiểm tra trực tiếp ngày 17/08/2026. TradeLearn chỉ dùng cấu trúc chủ đề, hướng thực hành và khái niệm công khai để biên soạn; phần giải thích, ví dụ và bài tập trên trang là nội dung gốc bằng tiếng Việt, không phải bản sao hay bản dịch nguyên văn giáo trình.</p>
        <div className="corp-source-grid">
          {CORPORATE_FINANCE_SOURCES.map((source) => (
            <a className="corp-source" href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <span>{source.institution}</span>
              <b>{source.title}</b>
              <p>{source.relevance}</p>
              <small>Đã kiểm chứng: {source.lastVerified}</small>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
