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
          <a href="#roadmap">🗺️ Lộ trình học 8 tuần</a>
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
        <Step n={4} title="Bắt đầu khóa học">
          Vào <Link to="/learn">Học tập</Link>, đọc <Link to="/learn/co-phieu-la-gi">Bài 1</Link> và làm trắc nghiệm. Mỗi
          bài 10–15 phút, có bài tập thực hành ngay trên web.
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
          <li>7 task mô phỏng công việc analyst thật: nhận <b>email sếp giao việc</b> → làm theo <b>hướng dẫn từng bước</b> (dành cho người chưa biết gì) → điền phiếu hoàn thành → <b>mentor chấm bằng dữ liệu live</b>.</li>
          <li>Làm đúng thứ tự 1→7 (Morning Brief → Screening → Health-check → Định giá → Kỹ thuật → Danh mục → Investment Memo). Sai mục nào sẽ hiện đáp án/số liệu đúng để học — nộp lại được.</li>
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
          <li><b>Học tập</b>: 15 bài chia 3 cấp độ, tiến độ và điểm cao nhất được lưu tự động trên máy bạn.</li>
          <li><b>Từ điển</b>: 85 thuật ngữ có thể tìm bằng tiếng Anh lẫn tiếng Việt, lọc theo chủ đề.</li>
          <li><b>Tin tức</b>: tin 2 ngày qua theo 2 thị trường. Quy tắc: đọc để hiểu bối cảnh, không mua theo tít (Bài 15).</li>
        </ul>
      </Section>

      <Section id="signals" title={'💡 Dùng mục "Gợi ý đầu tư" đúng cách'}>
        <p className="muted">
          Mục Gợi ý trên trang cổ phiếu là <b>công cụ học tập</b>: nó tính toán MA, RSI, MACD, Bollinger và khối lượng
          theo đúng cách các bài 4–8 dạy, rồi cho bạn thấy kết luận sẽ trông thế nào. Ba nguyên tắc sử dụng:
        </p>
        <ol className="muted">
          <li><b>Đọc lý do, không chép kết luận.</b> Mỗi tín hiệu có giải thích + bài học liên quan — mục tiêu là sau 15 bài bạn tự viết được những phân tích đó.</li>
          <li><b>Kết hợp với phân tích cơ bản.</b> Tín hiệu kỹ thuật chỉ là "khi nào mua"; "có đáng mua không" phụ thuộc doanh nghiệp (Bài 9–12) và giá có biên an toàn không.</li>
          <li><b>Không phải lời khuyên đầu tư.</b> Máy không biết mục tiêu, tài chính và khẩu vị rủi ro của bạn. Nó còn non hơn nhiều so với thị trường thật.</li>
        </ol>
        <div className="tip-box">
          Cách dùng tốt nhất: trước khi mở mục Gợi ý, hãy tự nhìn biểu đồ và viết dự đoán của bạn ("RSI đang ~35, MA20
          cắt lên MA50 → thiên về mua"). Rồi so với kết luận của máy. Sai lệch ở đâu chính là chỗ bạn cần học lại.
        </div>
      </Section>

      <Section id="roadmap" title="🗺️ Lộ trình học 8 tuần (mỗi tuần ~2 bài, 2-3 giờ)">
        <Step n={1} title="Tuần 1–2 · Nền tảng (Bài 1–4)">
          Đọc xong làm trắc nghiệm ≥60%. Thực hành: thêm 5 mã vào watchlist; mỗi ngày 5 phút nhìn biểu đồ và mô tả nến
          hôm nay bằng ngôn ngữ bài 3–4.
        </Step>
        <Step n={2} title="Tuần 3–4 · Chỉ báo (Bài 5–8)">
          Thực hành: trên 1 mã bất kỳ, lần lượt bật MA → RSI → MACD → Bollinger và viết 1 câu nhận xét cho từng bảng.
          So sánh với mục Gợi ý của web.
        </Step>
        <Step n={3} title="Tuần 5–6 · Phân tích tài chính (Bài 9–12) — trọng tâm">
          Thực hành: chọn 2 mã Mỹ, ghi chép đầy đủ P/E, ROE, biên lợi nhuận, Nợ/Vốn từ thẻ Phân tích cơ bản; với mã
          Việt, tự tra cafef/vietstock bảng cân đối & P&L gần nhất và tính biên gộp, biên ròng. Làm hết ví dụ số trong bài.
        </Step>
        <Step n={4} title="Tuần 7 · Quy trình & rủi ro (Bài 13–14)">
          Thực hành: chạy đủ 7 bước cho 1 mã — viết 3 dòng luận điểm + điều kiện "tôi sẽ sai nếu" + giá stop, rồi đặt
          lệnh giả lập đúng cỡ vị thế 1–2%.
        </Step>
        <Step n={5} title="Tuần 8 · Tâm lý & tổng duyệt (Bài 15)">
          Viết "hiến pháp nhà đầu tư" 10 dòng. Đọc lại nhật ký giao dịch giả lập từ tuần 1: thống kê lệnh đúng quy
          trình vs lệch quy trình. Sau đó duy trì nhịp: mỗi tuần 1 mã mới qua đủ 7 bước.
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
          <li><b>Dữ liệu học của bạn</b> (watchlist, ví giả lập, tiến độ, ghi chú) được tách theo workspace ẩn danh của từng trình duyệt. Khi chạy local, nó nằm trong SQLite trên máy; bản Render miễn phí dùng bộ nhớ tạm nên sẽ mất khi service khởi động lại hoặc được deploy lại.</li>
          <li><b>Giờ giao dịch</b>: Mỹ mở 21:30–04:00 giờ VN (sáng sớm hôm sau là lúc có biến động mới); VN mở 09:15–14:45 các ngày trong tuần.</li>
        </ul>
      </Section>

      <Section id="faq" title="❓ Câu hỏi thường gặp">
        <p className="muted"><b>Web này có giúp tôi kiếm tiền thật không?</b> — Nó giúp bạn <i>học cách ra quyết định có căn cứ</i>. Kiếm tiền hay không phụ thuộc kỷ luật và trải nghiệm của bạn sau này trên thị trường thật. Hãy coi tiền thật là "kỳ thi tốt nghiệp" chỉ vào sau khi ví giả lập của bạn kỷ luật 8/10.</p>
        <p className="muted"><b>Sao cổ phiếu Việt không có P/E, ROE trên web?</b> — Chỉ số tài chính chi tiết của công ty VN chưa có trên nguồn công khai web dùng được. Hãy tự tra cafef/vietstock và dùng thẻ "cách đọc chỉ số" làm trợ lý ôn — đó cũng chính là bài tập của Bài 9–12.</p>
        <p className="muted"><b>Giá VNM trên web khác cafef?</b> — Giá VN trên web là giá đóng cửa phiên gần nhất (EOD). Trong phiên, cafef sẽ nhanh hơn — đây là giới hạn của nguồn dữ liệu miễn phí.</p>
        <p className="muted"><b>Máy tính báo lỗi/chưa tải được dữ liệu?</b> — Kiểm tra 2 terminal (server :4001 + web :5173) còn chạy không; xem README trong thư mục dự án. Nếu mạng chặn nguồn dữ liệu ngoài, web vẫn chạy với chế độ mô phỏng.</p>
        <p className="muted"><b>Tôi muốn reset lại tiến độ học?</b> — Xoá file <span className="mono">server/data/app.db</span> rồi khởi động lại server (mất cả watchlist & ví — cân nhắc!).</p>
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
