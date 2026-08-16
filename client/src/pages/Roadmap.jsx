import { Link } from 'react-router-dom'

const PHASES = [
  {
    n: 1, title: 'Giai đoạn 1 · Nền tảng (tháng 1-2)', color: '#22c55e',
    goal: 'Hiểu ngôn ngữ tiền của doanh nghiệp',
    steps: [
      ['Khái niệm gốc', 'Cổ phiếu, cổ tức, lợi nhuận, tài sản/nợ/vốn chủ — Bài 1-2 khóa học', '/learn/co-phieu-la-gi'],
      ['Đọc 3 báo cáo tài chính', 'Cân đối kế toán → Kết quả KD → Lưu chuyển tiền tệ. Làm Task 3 & 8', '/learn/bao-cao-tai-chinh-1-can-doi'],
      ['5 hệ số sinh tồn', 'P/E, ROE, Biên LN, Nợ/Vốn, OCF/LN — đọc được là không bị lừa bởi 1 con số đẹp', '/learn/chi-so-dinh-gia'],
      ['Công cụ cần có', 'Google Sheets/Excel cơ bản: SUM, AVERAGE, một cột chia một cột. Chỉ vậy thôi ở giai đoạn này!', null],
    ],
  },
  {
    n: 2, title: 'Giai đoạn 2 · Phân tích (tháng 3-5)', color: '#4f8cff',
    goal: 'Từ đọc số → phán xét doanh nghiệp',
    steps: [
      ['Bộ chỉ số đầy đủ', 'P/B, P/S, PEG, ROA, biên gộp, FCF, vòng quay tài sản — Bài 12 + Task 9 (DuPont)', '/learn/chi-so-dinh-gia'],
      ['So sánh ngang hàng', 'Mọi con số chỉ có nghĩa khi so với cùng ngành + lịch sử chính nó — Task 10', '/desk/peer-compare'],
      ['Định giá cơ bản', 'Giá hợp lý = EPS × P/E hợp lý; biên an toàn 15-25% — Task 4', '/desk/valuation'],
      ['Dấu hiệu đỏ', 'Bộ lọc 5 red-flags trước khi tin bất kỳ mã nào — Task 13', '/desk/red-flags'],
      ['Công cụ', 'Excel trung cấp: XLOOKUP/SUMIFS, Pivot Table, biểu đồ. Trang tra cứu: cafef.vn & vietstock.vn (VN), stockanalysis.com (US)', null],
    ],
  },
  {
    n: 3, title: 'Giai đoạn 3 · Thực chiến (tháng 6-9)', color: '#a78bfa',
    goal: 'Làm toàn trình như analyst đi làm',
    steps: [
      ['Quy trình 7 bước', 'Mục tiêu → sàng lọc → cơ bản → định giá → kỹ thuật → rủi ro → theo dõi — Bài 13 + Task 11', '/learn/quy-trinh-ra-quyet-dinh'],
      ['Viết báo cáo', 'Investment memo chuẩn: luận điểm, số liệu, rủi ro — Task 7', '/desk/investment-memo'],
      ['Quản lý danh mục', 'Đa dạng hóa, position sizing 1-2%, tái cân bằng — Task 6 + ví giả lập liên tục', '/trading'],
      ['Công cụ', 'PowerPoint/Docs trình bày memo; nhật ký giao dịch; TradingView bản free cho kỹ thuật nâng cao', null],
    ],
  },
  {
    n: 4, title: 'Giai đoạn 4 · Chuyên sâu (tháng 10-12+)', color: '#f59e0b',
    goal: 'Nâng cấp vũ khí để đi làm thật',
    steps: [
      ['Mô hình tài chính', 'Xây model 3 báo cáo dự phóng 3-5 năm trong Excel — tìm khóa "financial modeling" cơ bản', null],
      ['Định giá nâng cao', 'DCF (chiết khấu dòng tiền), so sánh đa bội số — khi P/E đơn giản không đủ', null],
      ['Lập trình (tùy chọn nhưng mạnh)', 'Python + pandas tự kéo dữ liệu & backtest; SQL truy vấn dữ liệu lớn; Power BI dashboard', null],
      ['Chứng chỉ định hướng nghề', 'CFA (chuẩn vàng, nặng), FMVA (thực hành model), Chứng chỉ AAOF/VSDP tại VN — chọn theo mục tiêu', null],
      ['Theo nghề', 'CV: portfolio 5-7 bài phân tích tự viết + memo Task 7 chính là mẫu đầu tiên của em!', null],
    ],
  },
]

const TOOL_BOX = [
  ['📊 Excel / Google Sheets', 'Vũ khí số 1 của nghề: SUMIFS, XLOOKUP, Pivot Table, vẽ biểu đồ, model dự phóng. 80% công việc analyst là ở đây.'],
  ['🇻🇳 cafef.vn · vietstock.vn', 'Kho số liệu BCTC công ty VN miễn phí: chỉ số tài chính, báo cáo 10 năm, tin ngành.'],
  ['🇺🇸 stockanalysis.com · Macrotrends', 'Số liệu 10-20 năm của công ty Mỹ: chuỗi P/E, ROE, doanh thu — xem XU HƯỚNG chứ không chỉ con số hiện tại.'],
  ['📈 TradingView (free)', 'Biểu đồ kỹ thuật chuyên nghiệp hơn, vẽ hỗ trợ/kháng cự lưu được.'],
  ['📝 Nhật ký giao dịch', 'File Sheets đơn giản: ngày, mã, lý do vào, stop, kết quả, 1 bài học. Tài sản lớn nhất của bạn sau 6 tháng.'],
  ['🧠 (Nâng cao) Python · SQL · Power BI', 'Tự động kéo dữ liệu, backtest chiến lược, dashboard —区分 junior và senior về tốc độ.'],
]

export default function Roadmap() {
  return (
    <div style={{ maxWidth: 940, margin: '0 auto' }}>
      <div className="card hero-card">
        <h1 style={{ margin: 0, fontSize: 25 }}>🧭 Lộ trình trở thành Analyst Phân tích Tài chính</h1>
        <p className="muted" style={{ margin: '8px 0 0' }}>
          Từ con số 0 → đi làm thật trong ~12 tháng. Mỗi giai đoạn gồm: <b>học gì</b> (bài nào, task nào trong web này)
          + <b>công cụ gì</b> + tiêu chí "đủ điều kiện lên giai đoạn sau". Làm theo đúng thứ tự, không nhảy cóc.
        </p>
      </div>

      {PHASES.map((p) => (
        <div className="card" key={p.n} style={{ marginTop: 14 }}>
          <div className="card-title">
            <span style={{ color: p.color }}>{p.title}</span>
            <span className="muted" style={{ textTransform: 'none', fontSize: 12 }}>🎯 {p.goal}</span>
          </div>
          <div className="grid cols-2" style={{ gap: 10 }}>
            {p.steps.map(([name, desc, link], i) => (
              <div key={i} className="step-card">
                <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{desc}</div>
                {link && (
                  <Link to={link} className="btn sm" style={{ marginTop: 8 }}>
                    Mở ngay →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-title">🧰 Hộp công cụ cần thành thạo (tổng hợp)</div>
        <div className="grid cols-2" style={{ gap: 10 }}>
          {TOOL_BOX.map(([name, desc]) => (
            <div key={name} className="step-card">
              <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-title">✅ Tiêu chí "đủ giỏi" ở mỗi mốc</div>
        <ul className="muted" style={{ margin: 0, paddingLeft: 20, fontSize: 13.5 }}>
          <li><b>Tháng 2:</b> đọc 1 BCTC thật trên cafef và chỉ ra được OCF, LN, ROE mà không cần ai chỉ.</li>
          <li><b>Tháng 5:</b> 15 phút "health-check" 1 công ty bất kỳ (Task 3) đạt ≥80% điểm, giải thích được vì sao mỗi chỉ số vậy.</li>
          <li><b>Tháng 9:</b> tự viết 1 investment memo hoàn chỉnh (Task 7 ≥90%) + nhật ký 20 lệnh kỷ luật.</li>
          <li><b>Tháng 12:</b> có portfolio 5 bài phân tích + 1 model Excel dự phóng đơn giản → sẵn sàng ứng tuyển vị trí junior/fresher.</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-title">🚀 Bắt đầu từ đâu NGAY BÂY GIỜ?</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/learn/co-phieu-la-gi" className="btn primary">📖 Học Bài 1 (12 phút)</Link>
          <Link to="/desk/morning-brief" className="btn">💼 Nhận Task đầu tiên từ sếp</Link>
        </div>
      </div>
    </div>
  )
}
