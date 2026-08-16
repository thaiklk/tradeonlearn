import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useApi } from '../hooks.js'

// Luồng học lần đầu: quan sát trước, mở giải thích, rồi ghi nhận xét của riêng bạn.
const BUSINESS = {
  FPT: 'FPT bán dịch vụ phần mềm, giải pháp số và máy tính. Khi đọc báo cáo, hãy tìm xem từng mảng dịch vụ đóng góp doanh thu, biên lợi nhuận và dòng tiền như thế nào.',
  AAPL: 'Apple bán iPhone, máy tính và dịch vụ số như App Store, iCloud. Đây là ví dụ dễ hình dung doanh thu đến từ sản phẩm, hệ sinh thái và khách hàng trung thành.',
}

const last = (items) => (items?.length ? items[items.length - 1] : null)

function Reflection({ item }) {
  return (
    <details className="reflection-card">
      <summary>Dừng 30 giây để tự trả lời: {item.prompt}</summary>
      <div className="reflection-answer"><b>Giải thích:</b> {item.explain}</div>
      <div className="reflection-action"><b>Thử làm:</b> {item.action}</div>
    </details>
  )
}

export default function StartTour() {
  const [symbol, setSymbol] = useState(null)
  const { data: fin } = useApi(
    () => (symbol ? api.get(`/stocks/${encodeURIComponent(symbol)}/financials`) : Promise.resolve(null)),
    [symbol]
  )
  const [step, setStep] = useState(0)

  const rows = fin?.rows
  const ratios = fin?.ratios
  const unit = fin?.unit || ''
  const eps = last(rows?.eps)
  const steps = symbol && fin?.years ? [
    {
      title: 'Bước 1/8 · Doanh nghiệp này bán gì?',
      goal: 'Mô hình kinh doanh',
      body: BUSINESS[symbol] || '',
      reflection: {
        prompt: 'Nếu mua một cổ phiếu, bạn đang sở hữu điều gì?',
        explain: 'Cổ phiếu là một phần sở hữu trong doanh nghiệp. Người mua không cho công ty vay như trái phiếu, và cũng không chỉ dự đoán giá trong một phiên.',
        action: 'Viết một câu: doanh nghiệp này bán gì, bán cho ai và thu tiền bằng cách nào?',
      },
    },
    {
      title: 'Bước 2/8 · Doanh thu',
      goal: 'Hiểu quy mô',
      body: `Năm gần nhất, ${symbol} ghi nhận ${last(rows.revenue)?.toLocaleString('vi-VN')} ${unit} doanh thu. Doanh thu là giá trị hàng hóa hoặc dịch vụ đã bán ra, không đồng nghĩa đã thu đủ tiền mặt.`,
      example: `Bán 1 triệu sản phẩm × 50.000 đồng = 50 ${unit}`,
      reflection: {
        prompt: 'Doanh thu khác tiền thu về ở điểm nào?',
        explain: 'Bán chịu làm doanh thu tăng khi hàng hóa hoặc dịch vụ được ghi nhận, nhưng tiền có thể về sau. Vì vậy analyst phải đọc kèm khoản phải thu và dòng tiền kinh doanh.',
        action: 'Tìm một ví dụ về bán chịu: công ty đã bán gì và mất bao lâu mới thu tiền?',
      },
    },
    {
      title: 'Bước 3/8 · Lợi nhuận ròng',
      goal: 'Phần còn lại sau chi phí',
      body: `Sau khi trừ giá vốn, chi phí vận hành, lãi vay và thuế, ${symbol} còn ${last(rows.netIncome)?.toLocaleString('vi-VN')} ${unit} lợi nhuận ròng trong kỳ gần nhất.`,
      example: 'Doanh thu 100 − tổng chi phí 88 = lợi nhuận ròng 12',
      reflection: {
        prompt: 'Nếu doanh thu là 100 và tổng chi phí là 88, còn lại bao nhiêu?',
        explain: 'Còn lại 12. P&L là câu chuyện từ doanh thu, trừ dần các lớp chi phí để tìm ra phần lợi nhuận của kỳ.',
        action: 'Đánh dấu một khoản chi phí có thể tăng nhanh hơn doanh thu trong ngành bạn đang quan sát.',
      },
    },
    {
      title: 'Bước 4/8 · Biên lợi nhuận',
      goal: 'Chất lượng mỗi đồng bán ra',
      body: `Biên ròng của ${symbol} là ${last(ratios.netMargin)}%. Trung bình 100 đồng doanh thu tạo ra khoảng ${last(ratios.netMargin)} đồng lợi nhuận ròng theo sổ sách.`,
      example: 'Lợi nhuận 12 / doanh thu 100 = biên ròng 12%',
      reflection: {
        prompt: 'Biên lợi nhuận kể cho bạn nghe câu chuyện gì?',
        explain: 'Biên cho biết doanh nghiệp giữ lại bao nhiêu sau chi phí trên mỗi đồng doanh thu. Một con số chỉ có ý nghĩa khi so theo lịch sử, đối thủ và mô hình kinh doanh.',
        action: 'So sánh biên ròng với một đối thủ cùng ngành trước khi kết luận nó cao hay thấp.',
      },
    },
    {
      title: 'Bước 5/8 · Tài sản và nợ',
      goal: 'Sức mạnh tài chính',
      body: `Tài sản ${last(rows.totalAssets)?.toLocaleString('vi-VN')} = nợ phải trả ${last(rows.totalLiabilities)?.toLocaleString('vi-VN')} + vốn chủ sở hữu ${last(rows.equity)?.toLocaleString('vi-VN')} ${unit}.`,
      example: 'Tài sản 100 = nợ 40 + vốn chủ 60',
      reflection: {
        prompt: 'Vốn chủ sở hữu phản ánh điều gì sau khi trừ nợ?',
        explain: 'Đó là phần giá trị còn lại của chủ sở hữu theo sổ sách. Tỷ lệ nợ/vốn giúp đặt câu hỏi về áp lực trả nợ, nhưng phải xem thêm lãi vay, kỳ hạn nợ và dòng tiền.',
        action: 'Ghi một câu hỏi cần kiểm tra trước khi gọi nợ là an toàn hoặc nguy hiểm.',
      },
    },
    {
      title: 'Bước 6/8 · Dòng tiền',
      goal: 'Lợi nhuận có thành tiền không',
      body: `Dòng tiền từ hoạt động kinh doanh của ${symbol} là ${last(rows.ocf)?.toLocaleString('vi-VN')} ${unit}, so với lợi nhuận ${last(rows.netIncome)?.toLocaleString('vi-VN')} ${unit}; tỷ lệ hiển thị là ${last(ratios.ocfToNi)}%.`,
      example: 'Lãi 12 nhưng OCF 3: cần tìm xem tiền đang kẹt ở đâu',
      reflection: {
        prompt: 'Vì sao lợi nhuận cao vẫn có thể kém tiền?',
        explain: 'Tiền có thể kẹt trong khoản phải thu hay tồn kho, hoặc doanh nghiệp ghi nhận doanh thu trước khi thu tiền. Một kỳ thấp chưa kết luận điều gì; xu hướng và thuyết minh mới quan trọng.',
        action: 'Nêu một nguyên nhân bình thường và một rủi ro cần kiểm tra khi OCF thấp hơn lợi nhuận.',
      },
    },
    {
      title: 'Bước 7/8 · Định giá P/E',
      goal: 'Giá theo giả định',
      body: `P/E = giá cổ phiếu / EPS. EPS của ${symbol} gần đây là ${eps}. Mở trang chi tiết của mã này, lấy giá hiện tại chia cho EPS để tự tính bội số.`,
      example: 'Giá 300 / EPS 8,5 = P/E 35',
      reflection: {
        prompt: 'P/E 35 có tự động có nghĩa là đắt không?',
        explain: 'Không. Bội số có thể cao vì thị trường kỳ vọng tăng trưởng, biên lợi nhuận hoặc rủi ro thấp hơn. Cần so sánh với lịch sử công ty, đối thủ và chất lượng dòng tiền.',
        action: 'Liệt kê ba bằng chứng cần có trước khi kết luận một bội số rẻ hoặc đắt.',
      },
    },
    {
      title: 'Bước 8/8 · Rủi ro và kết luận',
      goal: 'Nghĩ như analyst',
      body: 'Một phân tích tốt luôn có câu “tôi sẽ sai nếu...”. Bạn đã đi qua mô hình kinh doanh, doanh thu, lợi nhuận, biên, nợ, dòng tiền, định giá và rủi ro.',
      reflection: {
        prompt: 'Điều gì không nên làm khi phân tích một doanh nghiệp?',
        explain: 'Không kết luận từ một chỉ số của một năm. Hãy kết hợp xu hướng, so sánh cùng ngành, dòng tiền và rủi ro; sau đó viết điều kiện làm luận điểm không còn đúng.',
        action: 'Viết một điều kiện có thể quan sát được để bạn xem lại luận điểm của mình.',
      },
    },
  ] : []

  const activeStep = steps[Math.min(step, Math.max(steps.length - 1, 0))]

  if (!symbol) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>Bắt đầu phân tích doanh nghiệp đầu tiên</h1>
        <p className="muted" style={{ fontSize: 13.5 }}>Chọn một doanh nghiệp quen thuộc để tập trung vào cách đọc số liệu và đặt câu hỏi, không phải ghi nhớ đáp án.</p>
        <div className="grid cols-2" style={{ marginTop: 12 }}>
          {[
            ['FPT', 'Công ty IT Việt Nam, dễ hình dung dịch vụ, nhân sự và hợp đồng.', 'Việt Nam'],
            ['AAPL', 'Sản phẩm quen thuộc, dễ quan sát doanh thu từ thiết bị và dịch vụ.', 'Hoa Kỳ'],
          ].map(([ticker, why, market]) => (
            <button key={ticker} className="card start-company" onClick={() => { setSymbol(ticker); setStep(0) }}>
              <div><b style={{ fontSize: 18 }}>{ticker}</b><span className="badge gray">{market}</span></div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{why}</div>
              <span className="btn sm primary" style={{ marginTop: 10 }}>Chọn {ticker}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!activeStep) return <div className="spinner" />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="muted"><Link to="/">Trang chủ</Link> · {symbol}</div>
      <div className="start-progress" aria-label={`Tiến độ ${Math.min(step + 1, steps.length)} trên ${steps.length}`}>
        <div style={{ width: `${(Math.min(step + 1, steps.length) / steps.length) * 100}%` }} />
      </div>
      <div className="card">
        <div className="card-title"><span>{activeStep.title}</span><span className="badge us">{activeStep.goal}</span></div>
        <p style={{ margin: '0 0 8px', fontSize: 14.5 }}>{activeStep.body}</p>
        {activeStep.example && <div className="tip-box" style={{ margin: '8px 0' }}><b>Ví dụ để tính:</b> {activeStep.example}</div>}
        <Reflection item={activeStep.reflection} />
        {step < steps.length && (
          <button className="btn primary start-next" onClick={() => setStep((current) => current + 1)}>
            {step === steps.length - 1 ? 'Kết thúc hành trình' : 'Bước tiếp theo'}
          </button>
        )}
      </div>
      {step >= steps.length && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-title">Bạn đã đi hết hành trình phân tích đầu tiên</div>
          <p className="muted">Bây giờ hãy biến câu trả lời của bạn thành một ghi chú có bằng chứng và điều kiện sai, sau đó chuyển sang bài thực hành có lưu kết quả.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn primary" to={`/stock/${symbol}`}>Xem {symbol} đầy đủ</Link>
            <Link className="btn" to="/learn/quy-trinh-ra-quyet-dinh">Làm memo quyết định</Link>
            <Link className="btn ghost" to="/corporate-finance">Học tài chính doanh nghiệp</Link>
          </div>
        </div>
      )}
    </div>
  )
}
