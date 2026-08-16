# 🧪 HƯỚNG DẪN KIỂM THỬ TRADELEARN (dành cho AI/model kiểm thử)

## Sản phẩm
Web học **phân tích tài chính doanh nghiệp** cho sinh viên từ số 0: 15 bài học, 13 task analyst kiểu đi làm thật (email sếp + hướng dẫn từng bước + chấm điểm live + XP), Health Check 6 bước, so sánh ngang hàng + 7 red-flags, research workspace xuất memo, nhập tay BCTC VN, ví giao dịch giả lập $100k + 500tr₫, biểu đồ nến/RSI/MACD **cập nhật realtime ~5s** (SSE).

- Repo: https://github.com/thaiklk/tradeonlearn (branch main)
- Bản online: https://tradeonlearn.onrender.com
- Stack: client/ = React 18 + Vite + lightweight-charts **v4.2.3** · server/ = Node Express + better-sqlite3 · SQLite tại server/data/app.db (KHÔNG commit — .gitignore)

## Chạy local
```bash
cd server && npm install && node src/index.js        # API :4001 + phục vụ client/dist
cd client && npm install && npm run build            # build UI (hoặc npm run dev cho :5173)
```
Mở http://localhost:4001

## Route cần smoke-test (SPA, tất cả phải HTTP 200)
`/` `/stock/AAPL` `/stock/FPT` `/desk` `/desk/health-check` `/learn` `/trading` `/roadmap` `/glossary` `/news` `/guide` `/compare` `/research` `/research/FPT` `/manual` `/health-check/FPT`

## API chính (qua :4001)
| Endpoint | Kỳ vọng |
|---|---|
| GET /api/health | {"ok":true} |
| GET /api/tasks | 13 task, tổng 915 XP |
| GET /api/stocks/AAPL/analysis?range=6mo | candles + series.rsi14 + signals + overall + demo flag |
| GET /api/stocks/FPT/financials | status demo, years FY2022-2025, ratios đầy đủ |
| GET /api/stocks/TSLA/financials | status no-data (KHÔNG bịa số) |
| GET /api/stocks/peers/compare?symbols=AAPL,MSFT,KO | items ≥2 + median + redFlags có severity |
| GET /api/stocks/FPT/redflags | flags (mảng, có thể rỗng) |
| GET/PUT /api/research/:symbol | lưu/đọc workspace (8 mục) |
| GET/POST /api/manual/:symbol | BCTC người học nhập, status manual |
| POST /api/tasks/health-check/submit | chấm điểm (text keywords đã normalize KHÔNG phân biệt dấu TV) |
| GET /api/stream/quotes?symbols=AAPL | SSE, data mỗi ~5s |
| GET /api/lessons (15) · /api/glossary (~85) · /api/news?market=vn | OK |

## Tiêu chí nghiệm thu (từ brief gốc)
1. Build sạch: `cd client && npm run build`
2. Không còn `priceScale()` không đối số trong PriceCharts.jsx (đã sửa thành `priceScale('right')` dòng 127/143 — regression check!)
3. Chart lỗi chỉ chết chart (ErrorBoundary), không sập trang
4. **Không** dùng chữ MUA/BÁN làm kết luận phân tích cơ bản (signals.js chỉ cho kỹ thuật; HealthCheck/financials là giáo dục)
5. Mọi số liệu có nhãn trạng thái: live / delayed / eod / demo / manual / no-data + nguồn + kỳ — KHÔNG trình bày demo như live
6. Tiếng Việt nhất quán; responsive ~390px không tràn ngang
7. Route cũ (Desk/Learn/Trading/News/Glossary/Roadmap) vẫn hoạt động

## Giới hạn đã biết (không phải bug)
- Yahoo chặn quoteSummary (crumb) từ datacenter IP → fundamentals Mỹ thường rơi về DEMO fixture (AAPL/MSFT/KO/FPT/VNM) — có nhãn rõ
- VNDirect finfo DNS hỏng trên một số mạng VN → VN dùng Yahoo .VN (trễ ~15') + cafef cho index
- Render free: SQLite reset mỗi deploy; ngủ 15' không dùng (wake ~30-60s)
- Dữ liệu cá nhân chỉ ở local (server/data/app.db, đã gitignore)

## 13 commit gần nhất = toàn bộ lịch sử phát triển (xem `git log --oneline`)
