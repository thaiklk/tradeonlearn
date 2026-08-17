# 📈 TradeLearn — Web học tài chính & chứng khoán (Mỹ + Việt Nam)

Web ứng dụng **học tài chính doanh nghiệp từ con số 0 để đi làm**, rồi dùng dữ liệu đầu tư để luyện phân tích; theo dõi dữ liệu giá **gần thời gian thực** của thị trường
Mỹ & Việt Nam, kèm **biểu đồ nến + chỉ báo kỹ thuật**, **gợi ý phân tích có giải thích**, **phân tích cơ bản doanh
nghiệp**, **ví giao dịch giả lập (paper trading)** và **lộ trình 49 bài tài chính doanh nghiệp cho người mới bắt đầu** — trọng tâm là
**phân tích tài chính để tự ra quyết định đầu tư**.

> ⚠️ **Miễn trách nhiệm**: Mọi "gợi ý đầu tư" trên web được sinh tự động từ chỉ báo kỹ thuật, chỉ phục vụ mục đích
> **học tập**, không phải lời khuyên đầu tư. Giao dịch bằng ví giả lập — tiền ảo, kiến thức thật.

---

## ✨ Tính năng

| Nhóm | Chi tiết |
|---|---|
| 📊 **Tổng quan thị trường** | 6 chỉ số (S&P 500, NASDAQ, DOW, VN-Index, VN30, HNX), tăng/giảm mạnh nhất, watchlist tự cập nhật |
| 🕯️ **Biểu đồ chuyên nghiệp** | Nến Nhật + khối lượng, MA20/50/200, Bollinger Bands, bảng RSI & MACD — 3 biểu đồ đồng bộ kéo chung, 7 khung thời gian (1 ngày → 5 năm) |
| 💡 **Gợi ý đầu tư (học tập)** | Tổng hợp RSI + MA cross + MACD + Bollinger + khối lượng thành kết luận MUA/BÁN/TRUNG TÍNH, **mỗi tín hiệu kèm giải thích + bài học liên quan** |
| 🏦 **Phân tích cơ bản** | P/E, forward P/E, P/B, EPS, ROE, ROA, biên lợi nhuận, tăng trưởng, Nợ/Vốn, FCF, cổ tức... kèm **chú thích "cách đọc" cho người mới** (Bài 9–12) |
| 💵 **Giao dịch giả lập** | Ví 100.000$ (thị trường Mỹ) + 500 triệu ₫ (thị trường VN), khớp lệnh theo giá hiện tại, vị thế tự tính lãi/lỗ, lịch sử lệnh |
| 🎓 **Lộ trình 49 bài tài chính doanh nghiệp** | 16 chương từ nhập môn, báo cáo tài chính, giá trị thời gian của tiền, dự án đầu tư, rủi ro, chi phí vốn đến treasury/vốn lưu động. Mỗi bài có ví dụ số, lỗi thường gặp, nguồn học thuật và workpaper tự luận lưu tiến độ. |
| 📚 **Từ điển** | 85 thuật ngữ Anh–Việt, tìm kiếm & lọc theo chủ đề |
| 📰 **Tin tức** | Tin 2 ngày qua theo 2 thị trường (Google News) |
| 📖 **Hướng dẫn sử dụng** | Trang hướng dẫn chi tiết trong web: bắt đầu nhanh, từng trang, lộ trình tài chính doanh nghiệp 16 tuần, quy trình 1 lệnh mẫu, FAQ |

## 🚀 Chạy dự án

**Yêu cầu:** [Node.js](https://nodejs.org) 18+ (đã test trên Node 22).

### Cách 1 — Chạy 1 lệnh từ thư mục gốc

```bash
npm run setup   # cài dependencies cho cả server + client (chạy 1 lần)
npm run dev     # khởi động cả 2 cùng lúc
```

### Cách 2 — Chạy 2 terminal riêng

```bash
# Terminal 1 — API server (cổng 4001)
cd server
npm install
npm run dev

# Terminal 2 — Web (cổng 5173)
cd client
npm install
npm run dev
```

Sau đó mở trình duyệt: **http://localhost:5173** ✅

**Chạy chế độ production 1 dịch vụ duy nhất** (kiểu khi deploy):
```bash
npm run setup          # lần đầu
npm run build          # build giao diện
npm start              # server Express phục vụ cả web + API tại http://localhost:4001
```

**Đưa lên server miễn phí (Render/Railway/Fly.io)**: xem hướng dẫn từng bước trong [`DEPLOY.md`](./DEPLOY.md).

## 🗂️ Cấu trúc thư mục

```
project web tai chinh/
├── server/                  # Backend Node.js + Express
│   ├── src/
│   │   ├── index.js         # Khởi tạo app
│   │   ├── db.js            # SQLite (ví, vị thế, watchlist, tiến độ học)
│   │   ├── routes/          # market, trading, watchlist, learn, glossary, news
│   │   ├── services/
│   │   │   ├── usMarket.js  # Dữ liệu Mỹ — Yahoo Finance (không cần key)
│   │   │   ├── vnMarket.js  # Dữ liệu VN — VNDirect finfo API (EOD, không cần key)
│   │   │   ├── demo.js      # Dữ liệu mô phỏng khi mất kết nối
│   │   │   ├── indicators.js# SMA, EMA, RSI, MACD, Bollinger
│   │   │   ├── signals.js   # Engine gợi ý đầu tư (rule-based, có giải thích)
│   │   │   └── marketService.js  # Facade US/VN/demo + cache
│   │   └── content/         # Curriculum 49 bài + từ điển (nội dung tiếng Việt)
│   └── data/app.db          # Dữ liệu của bạn (tự tạo)
└── client/                  # Frontend React + Vite
    └── src/
        ├── components/      # NavBar, StockSearch, PriceCharts (lightweight-charts)
        └── pages/           # Dashboard, StockDetail, Trading, Learn, Glossary, News, Guide
```

## 🗄️ Về dữ liệu

- **Thị trường Mỹ**: báo giá gần thời gian thực qua Yahoo Finance — **không cần đăng ký API key**.
- **Thị trường Việt Nam**: dữ liệu giá **cuối ngày (EOD)** qua API công khai của VNDirect. Trong phiên, web hiển thị
  giá đóng cửa gần nhất (có nhãn riêng).
- **Chế độ mô phỏng**: nếu máy không gọi được nguồn dữ liệu ngoài, web **tự chuyển sang dữ liệu mô phỏng** (nhãn vàng
  "DỮ LIỆU MÔ PHỎNG") để mọi chức năng vẫn dùng được khi học.
- **Dữ liệu cá nhân** (watchlist, ví giả lập, tiến độ học, workpaper) lưu trong `server/data/app.db` khi chạy local. Bản
  online đồng bộ snapshot workspace ẩn danh sang Cloudflare D1 qua Worker; không đưa khóa đồng bộ hoặc dữ liệu cá nhân vào frontend.

## 🛠️ Công nghệ

React 18 · Vite 5 · React Router 6 · [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts) ·
Node.js · Express · better-sqlite3 · yahoo-finance2 · fast-xml-parser

## ❓ Xử lý sự cố

| Vấn đề | Cách xử lý |
|---|---|
| Web trắng / không tải dữ liệu | Kiểm tra terminal server còn chạy ở cổng 4001; terminal client ở 5173 |
| Cổng 4001 bị chiếm (`EADDRINUSE`) | Đóng tiến trình node cũ hoặc đổi cổng: `set PORT=4002 && npm run dev` trong `server` (và sửa proxy trong `client/vite.config.js`) |
| Giá Mỹ/VN không cập nhật | Web đang ở chế độ mô phỏng do mất kết nối nguồn ngoài — kiểm tra mạng; dữ liệu sẽ tự về khi nối lại |
| Lỗi `npm install` server | Xóa `server/node_modules` + `server/package-lock.json` rồi cài lại |

---

Chúc bạn học tập hiệu quả và kỷ luật! 📈🎓
