import { Link } from 'react-router-dom'

function Step({ n, title, children }) {
  return (
    <div className="step-row">
      <span className="step-badge">{n}</span>
      <div>
        <b>{title}</b>
        <div className="muted" style={{ fontSize: 13.5 }}>{children}</div>
      </div>
    </div>
  )
}

function Section({ id, title, children }) {
  return (
    <div className="card" id={id}>
      <h2 style={{ margin: '0 0 10px', fontSize: 19 }}>{title}</h2>
      {children}
    </div>
  )
}

export default function Guide() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="card">
        <h1 style={{ margin: 0, fontSize: 25 }}>📖 Hướng dẫn sử dụng TradeLearn</h1>
        <p className="muted" style={{ margin: '8px 0 0' }}>
          TradeLearn là web <b>học tài chính doanh nghiệp, phân tích và đầu tư chứng khoán</b> bằng dữ liệu gần thời gian thực
          của thị trường Mỹ & Việt Nam. Nếu mục tiêu của bạn là đi làm FP&A/corporate finance, hãy bắt đầu ở{' '}
          <Link to="/corporate-finance">track Tài chính doanh nghiệp</Link>; nhánh biểu đồ và đầu tư là phần thực hành mở rộng.
        </p>
        <div className="guide-toc" style={{ marginTop: 14 }}>
          <a href="#quickstart">⚡ Bắt đầu nhanh trong 5 phút</a>
          <Link to="/corporate-finance">💼 Track tài chính doanh nghiệp</Link>
          <a href="#pages">🖥️ Hướng dẫn từng trang</a>
          <a href="#signals">💡 Dùng "Gợi ý đầu tư" đúng cách</a>
          <a href="#roadmap">🗺️ Lộ trình tài chính doanh nghiệp</a>
          <a href="#workflow">🔄 Quy trình 1 lệnh mua mẫu</a>
          <a href="#data">🗄️ Dữ liệu & những điều cần biết</a>
          <a href="#faq">❓ Câu hỏi thường gặp</a>
        </div>
      </div>

      <Section id="quickstart" title="⚡ Bắt đầu nhanh trong 5 phút">
        <Step n={1} title="Làm quen bảng điều khiển (Tổng quan)">
          Mở <Link to="/">Trang tổng quan</Link>: nhìn 6 thẻ chỉ số (S&P 500, NASDAQ, DOW, VN-Index, VN30, HNX) — hôm nay
          thị trường màu gì? Xem hai danh sách "Tăng/Giảm mạnh nhất" để biết mã nào đang sôi động.
        </Step>
        <Step n={2} title="Tra một cổ phiếu">
          Gõ <b>AAPL</b> hoặc <b>VNM</b> vào ô tìm kiếm trên cùng → mở trang chi tiết: giá, biểu đồ nến, RSI, MACD, gợi ý
          phân tích và phân tích cơ bản. Bấm ⭐ để thêm vào danh sách theo dõi.
        </Step>
        <Step n={3} title="Đặt lệnh đầu tiên bằng tiền ảo">
          Vào <Link to="/trading">Giao dịch giả lập</Link> — bạn có sẵn <b>100.000$ + 500 triệu ₫</b>. Chọn mã, số lượng,
          bấm MUA. Không lo lỗ thật: đây là ví luyện tay.
        </Step>
        <Step n={4} title="Bắt đầu lộ trình tài chính doanh nghiệp">
          Vào <Link to="/learn">Học tập</Link>, mở <Link to="/learn/tcdn-tai-chinh-doanh-nghiep-la-gi">bài đầu tiên</Link> và nộp workpaper ngắn.
          Lộ trình có 49 bài theo 16 chương; mỗi bài có tình huống, các ô tự luận, bản nháp, rubric tự đối chiếu và liên kết đến công cụ trên web.
        </Step>
        <Step n={5} title="Đọc hết trang này">
          Phần "Quy trình 1 lệnh mua mẫu" bên dưới là cách dùng web như một nhà đầu tư thật sự — đừng bỏ qua.
        </Step>
      </Section>

      <Section id="pages" title="🖥️ Hướng dẫn từng trang">
        <h3 style={{ color: '#cfe0ff' }}>1. Trang tổng quan</h3>
        <ul className="muted">
          <li><b>Thẻ ví</b> (giữa trang): tổng tài sản 2 ví giả lập + lãi/lỗ từ đầu — cập nhật liên tục.</li>
          <li><b>Danh sách theo dõi</b>: những mã bạn bấm ⭐, giá tự cập nhật mỗi 20 giây. Bấm vào mã để xem chi tiết, bấm ✕ để xóa.</li>
          <li><b>Tăng/giảm mạnh nhất</b>: quét ~32 mã thanh khoản cao — nơi tìm ý tưởng, <i>không phải</i> danh sách mua gợi ý.</li>
          <li><b>Tiến độ học & tin tức</b>: nhắc bạn học tiếp và bối cảnh thị trường hôm nay.</li>
        </ul>
        <h3 style={{ color: '#cfe0ff' }}>2. Trang chi tiết cổ phiếu — "phòng phân tích" của bạn</h3>
        <ul className="muted">
          <li><b>Biểu đồ nến + khối lượng</b>: kéo ngang để xem, lăn chuột để phóng to. Nút khung thời gian (1 ngày → 5 năm) và công tắc MA20/MA50/MA200/Bollinger nằm phía trên.</li>
          <li><b>🎁 Bấm vào bất kỳ cây nến / điểm RSI / cột MACD</b>: web mở hộp "Hướng dẫn đọc" phân tích chi tiết đúng thời điểm bạn bấm (nến tăng/giảm? thân dài? ria? khối lượng thế nào? RSI lúc đó bao nhiêu?) kèm bài học & thuật ngữ liên quan. Mỗi bảng còn có nút "ℹ️ Cách đọc" cho hướng dẫn tổng quan.</li>
          <li><b> badge "● TRỰC TIẾP"</b> cạnh giá: giá được đẩy liên tục qua kết nối thời gian thực (~5 giây/lần) — không cần refresh trang.</li>
          <li><b>Bảng RSI</b> (giữa): hai đường ngang 30/70 — dưới 30 quá bán, trên 70 quá mua (chi tiết <Link to="/learn/rsi-dong-luong">Bài 6</Link>).</li>
          <li><b>Bảng MACD</b> (dưới): cột xanh chuyển đỏ = động lượng đổi chiều (chi tiết <Link to="/learn/macd-hoi-tu-phan-ky">Bài 7</Link>). Ba bảng tự đồng bộ khi bạn kéo.</li>
          <li><b>💡 Gợi ý đầu tư</b> (cột phải): kết luận MUA/BÁN/TRUNG TÍNH từ tổ hợp 4 chỉ báo, mỗi tín hiệu đều kèm giải thích + nút "Học bài liên quan".</li>
          <li><b>🏦 Phân tích cơ bản</b>: P/E, P/B, ROE, biên lợi nhuận, nợ/vốn... kèm chú thích "cách đọc" cho từng chỉ số — nguyên liệu của <Link to="/learn/chi-so-dinh-gia">Bài 12</Link>.</li>
        </ul>
        <h3 style={{ color: '#cfe0ff' }}>3. 💼 Phòng phân tích — "đi làm thật"</h3>
        <ul className="muted">
          <li>13 task mô phỏng công việc analyst thật: nhận <b>email sếp giao việc</b> → làm theo <b>hướng dẫn từng bước</b> (dành cho người chưa biết gì) → điền phiếu hoàn thành → <b>mentor phản hồi bằng dữ liệu live</b>.</li>
          <li>Làm task theo thứ tự từ Morning Brief đến Investment Memo. Những phần cần dữ liệu sẽ nêu rõ cách tính và số liệu đối chiếu để bạn sửa bài, không phải bài kiểm tra chọn đáp án.</li>
          <li>Tích <b>XP thăng chức</b>: Intern 🌱 → Junior 💼 → Analyst 📊 → Senior 🏆. Giá & biểu đồ trong task cập nhật <b>thời gian thực</b> (badge ● TRỰC TIẾP).</li>
        </ul>
        <h3 style={{ color: '#cfe0ff' }}>4. Giao dịch giả lập</h3>
        <ul className="muted">
          <li>Hai ví riêng: USD (thị trường Mỹ) và VND (thị trường Việt Nam) — mua AAPL trừ ví USD, mua VNM trừ ví VND.</li>
          <li>Đặt lệnh theo <b>giá hiện tại</b> (Mỹ: gần thời gian thực; VN: giá cuối ngày). Lệnh KHÔNG khớp khi thiếu tiền/thiếu cp — giống thật.</li>
          <li><b>Vị thế</b> tự tính lãi/lỗ theo giá mới; <b>Lịch sử lệnh</b> ghi lại toàn bộ — đó là "nhật ký giao dịch" thô của bạn (Bài 13 khuyên bạn viết thêm lý do vào sổ).</li>
          <li>Nút ♻️ Reset ví để bắt đầu lại từ đầu (sau khi thử nghiệm chiến lược, ví dụ).</li>
        </ul>
        <h3 style={{ color: '#cfe0ff' }}>5. Học tập · Từ điển · Tin tức</h3>
        <ul className="muted">
          <li><b>Học tập</b>: lộ trình 49 bài theo 16 chương tài chính doanh nghiệp, kèm nhánh đầu tư để luyện dữ liệu. Mỗi bài có đầu ra tự luận, bản nháp và bài nộp được lưu theo workspace của bạn.</li>
          <li><b>Từ điển</b>: 85 thuật ngữ có thể tìm bằng tiếng Anh lẫn tiếng Việt, lọc theo chủ đề.</li>
          <li><b>Tin tức</b>: tin 2 ngày qua theo 2 thị trường. Quy tắc: đọc để hiểu bối cảnh, không mua theo tít; hãy ghi lại dữ kiện cần kiểm chứng trong workpaper.</li>
        </ul>
      </Section>

      <Section id="signals" title={'💡 Dùng mục "Gợi ý đầu tư" đúng cách'}>
        <p className="muted">
          Mục Gợi ý trên trang cổ phiếu là <b>công cụ học tập</b>: nó tính toán MA, RSI, MACD, Bollinger và khối lượng
          theo đúng cách các bài 4–8 dạy, rồi cho bạn thấy kết luận sẽ trông thế nào. Ba nguyên tắc sử dụng:
        </p>
        <ol className="muted">
          <li><b>Đọc lý do, không chép kết luận.</b> Mỗi tín hiệu có giải thích + bài học liên quan — mục tiêu là sau khi học phần nền tảng, bạn tự viết được những phân tích đó.</li>
          <li><b>Kết hợp với phân tích cơ bản.</b> Tín hiệu kỹ thuật chỉ là "khi nào mua"; "có đáng mua không" phụ thuộc doanh nghiệp (Bài 9–12) và giá có biên an toàn không.</li>
          <li><b>Không phải lời khuyên đầu tư.</b> Máy không biết mục tiêu, tài chính và khẩu vị rủi ro của bạn. Nó còn non hơn nhiều so với thị trường thật.</li>
        </ol>
        <div className="tip-box">
          Cách dùng tốt nhất: trước khi mở mục Gợi ý, hãy tự nhìn biểu đồ và viết dự đoán của bạn ("RSI đang ~35, MA20
          cắt lên MA50 → thiên về mua"). Rồi so với kết luận của máy. Sai lệch ở đâu chính là chỗ bạn cần học lại.
        </div>
      </Section>

      <Section id="roadmap" title="🗺️ Lộ trình tài chính doanh nghiệp 16 tuần (3-4 giờ/tuần)">
        <Step n={1} title="Tuần 1–2 · Vai trò finance và mục tiêu giá trị (Chương 1)">
          Học doanh nghiệp tạo tiền thế nào, ba quyết định đầu tư - tài trợ - vận hành tiền, và cách ghi một nhận định có dữ kiện thay vì chỉ kể lại số liệu.
        </Step>
        <Step n={2} title="Tuần 3–5 · Báo cáo tài chính và tài sản (Chương 2–3)">
          Đọc Báo cáo kết quả kinh doanh, Bảng cân đối kế toán và Báo cáo lưu chuyển tiền tệ; sau mỗi bài, viết một workpaper tách rõ lợi nhuận, tiền và vốn lưu động.
        </Step>
        <Step n={3} title="Tuần 6–7 · Phân tích và giá trị thời gian của tiền (Chương 4–5)">
          Tính tỷ số có đơn vị đúng, thực hành PV/FV và kiểm tra kỳ tính lãi. Đừng chuyển chương khi chưa giải thích được kết quả bằng lời của mình.
        </Step>
        <Step n={4} title="Tuần 8–10 · Định giá và dự án đầu tư (Chương 6–8)">
          Học trái phiếu, cổ phiếu, dòng tiền tăng thêm, NPV/IRR, vốn lưu động và giá trị cuối. Hoàn thành workpaper trước, sau đó dùng lab NPV để đối chiếu phép tính.
        </Step>
        <Step n={5} title="Tuần 11–13 · Rủi ro, huy động vốn và chi phí vốn (Chương 9–13)">
          Phân biệt lợi tức với rủi ro, đọc nguồn vốn, tính WACC và nhìn cơ cấu vốn cùng với khả năng trả nợ chứ không chỉ một tỷ lệ đẹp.
        </Step>
        <Step n={6} title="Tuần 14–16 · Cổ tức, vốn lưu động và treasury (Chương 14–16)">
          Lập kế hoạch tiền, theo dõi CCC, tồn kho và khoản phải thu. Kết thúc bằng một memo ngắn: vấn đề, số liệu, khuyến nghị, rủi ro và bước kiểm chứng tiếp theo.
        </Step>
      </Section>

      <Section id="workflow" title="🔄 Quy trình 1 lệnh mua mẫu trên web (áp dụng Bài 13)">
        <Step n={1} title="Sàng lọc: mở trang Tổng quan → Biến động mạnh hoặc danh sách theo dõi">
          Chọn 1 mã bạn hiểu ngành (VD: KO — nước ngọt, dễ hiểu). Mở trang chi tiết.
        </Step>
        <Step n={2} title="Cơ bản: đọc thẻ 🏦 Phân tích cơ bản">
          KO có P/E bao nhiêu so với trung bình ngành đồ uống? ROE có trên 15% không? Biên lợi nhuận ổn định không?
          Nợ/Vốn có an toàn không? — trả lời được mới sang bước 3.
        </Step>
        <Step n={3} title="Định giá: EPS × P/E hợp lý = giá hợp lý">
          Dùng EPS & P/E từ thẻ cơ bản + cách làm ở Bài 12. Nếu giá hiện tại thấp hơn giá hợp lý ≥15–25% → có biên an
          toàn. Viết 3 dòng luận điểm ra sổ.
        </Step>
        <Step n={4} title="Kỹ thuật: chọn điểm vào">
          Trên biểu đồ 6 tháng–1 năm: giá có trên MA200? MA20/50 xếp tầng tăng? RSI chưa quá mua? Khối lượng xác nhận?
          Mục Gợi ý là đối chiếu chéo cho bước này.
        </Step>
        <Step n={5} title="Rủi ro: tính số lượng theo stop-loss">
          Quy tắc 1–2% tài khoản (Bài 14). Xác định giá stop (dưới vùng hỗ trợ gần nhất) TRƯỚC, rồi tính: số cp = (tài
          sản × 1%) / (giá vào − giá stop).
        </Step>
        <Step n={6} title="Đặt lệnh tại Giao dịch giả lập + ghi sổ">
          Đặt lệnh đúng số lượng vừa tính. Ghi vào sổ cá nhân: ngày, mã, lý do (3 dòng), stop, mục tiêu.
        </Step>
        <Step n={7} title={'Theo dõi mỗi tuần & chốt khi 1 trong 3 luật xảy ra'}>
          Luận điểm sai → cắt lỗ; đạt mục tiêu/đắt rõ rệt → chốt từng phần; có cơ hội tốt hơn → hoán đổi. Không bán vì
          "thấy đỏ".
        </Step>
      </Section>

      <Section id="data" title="🗄️ Dữ liệu & những điều cần biết">
        <ul className="muted">
          <li><b>Thị trường Mỹ</b>: báo giá gần thời gian thực (thường trễ vài phút), lịch sử nến đầy đủ — nguồn Yahoo Finance.</li>
          <li><b>Thị trường Việt Nam</b>: dữ liệu giá <b>cuối ngày (EOD)</b> từ nguồn công khai VNDirect — đủ để học phân tích, giao dịch giả lập sẽ khớp theo giá đóng cửa gần nhất.</li>
          <li><b>Chế độ mô phỏng</b>: nếu mất kết nối tới nguồn dữ liệu, web tự chuyển sang dữ liệu mô phỏng (có nhãn vàng "DỮ LIỆU MÔ PHỎNG") để bạn vẫn học/học tiếp được.</li>
          <li><b>Dữ liệu học của bạn</b> (watchlist, ví giả lập, tiến độ, bài thực hành, ghi chú) được tách theo workspace ẩn danh của từng trình duyệt và đồng bộ sang Cloudflare D1 trên bản online. Đừng xóa dữ liệu trình duyệt nếu muốn giữ đúng workspace này.</li>
          <li><b>Giờ giao dịch</b>: Mỹ mở 21:30–04:00 giờ VN (sáng sớm hôm sau là lúc có biến động mới); VN mở 09:15–14:45 các ngày trong tuần.</li>
        </ul>
      </Section>

      <Section id="faq" title="❓ Câu hỏi thường gặp">
        <p className="muted"><b>Web này có giúp tôi kiếm tiền thật không?</b> — Nó giúp bạn <i>học cách ra quyết định có căn cứ</i>. Kiếm tiền hay không phụ thuộc kỷ luật và trải nghiệm của bạn sau này trên thị trường thật. Hãy coi tiền thật là "kỳ thi tốt nghiệp" chỉ vào sau khi ví giả lập của bạn kỷ luật 8/10.</p>
        <p className="muted"><b>Sao cổ phiếu Việt không có P/E, ROE trên web?</b> — Chỉ số tài chính chi tiết của công ty VN chưa có trên nguồn công khai web dùng được. Hãy tự tra cafef/vietstock và dùng thẻ "cách đọc chỉ số" làm trợ lý ôn — đó cũng chính là bài tập của Bài 9–12.</p>
        <p className="muted"><b>Giá VNM trên web khác cafef?</b> — Giá VN trên web là giá đóng cửa phiên gần nhất (EOD). Trong phiên, cafef sẽ nhanh hơn — đây là giới hạn của nguồn dữ liệu miễn phí.</p>
        <p className="muted"><b>Máy tính báo lỗi/chưa tải được dữ liệu?</b> — Kiểm tra 2 terminal (server :4001 + web :5173) còn chạy không; xem README trong thư mục dự án. Nếu mạng chặn nguồn dữ liệu ngoài, web vẫn chạy với chế độ mô phỏng.</p>
        <p className="muted"><b>Tôi muốn làm lại một bài?</b> — Mở lại bài đó, sửa nội dung trong phần thực hành rồi nộp lại. Dữ liệu cũ được thay bằng phiên bản mới nhất của chính bạn.</p>
        <p className="muted"><b>Nên học theo điện thoại được không?</b> — Web hiển thị tốt trên mobile, nhưng bài tập "đọc biểu đồ + tính toán" nên làm trên máy tính để tập trung.</p>
      </Section>

      <div className="card">
        <div className="tip-box" style={{ margin: 0 }}>
          ⚠️ <b>Miễn trách nhiệm:</b> TradeLearn là công cụ giáo dục. Toàn bộ "gợi ý đầu tư" sinh tự động từ chỉ báo kỹ
          thuật và <b>không phải lời khuyên mua/bán</b> đối với bất kỳ tài sản nào. Dữ liệu có thể trễ hoặc sai lệch. Bạn
          tự chịu trách nhiệm với mọi quyết định đầu tư thật của mình.
        </div>
      </div>
    </div>
  )
}
