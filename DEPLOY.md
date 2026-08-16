# 🚀 Hướng dẫn đưa TradeLearn lên server MIỄN PHÍ

Web đã được chuẩn bị ở **chế độ production 1 dịch vụ duy nhất**: Express vừa chạy API vừa phục vụ giao diện
(`client/dist`), nên chỉ cần **1 service free** là đủ — không cần thuê 2 chỗ riêng cho frontend/backend.

> Web chỉ cần Node.js, **không cần API key**, **không cần database riêng** để chạy thử (dùng SQLite file). Mỗi trình duyệt có workspace ẩn danh riêng, nên không dùng chung ví, tiến độ hay ghi chú với người khác.

---

## 🥇 Cách 0 — Chạy "online" ngay không cần deploy (0 phút)

Nếu bạn muốn dùng web từ điện thoại/máy khác mà vẫn giữ dữ liệu trên máy mình:

```bash
# trong thư mục dự án (cần Node đang chạy server :4001)
npx cloudflared tunnel --url http://localhost:4001
```

Cloudflare sẽ in ra một địa chỉ `https://xxx.trycloudflare.com` — mở từ bất kỳ thiết bị nào.
**Ưu điểm**: dữ liệu (ví, watchlist, tiến độ học) nằm nguyên trên máy bạn.

---

## 🥇 Cách 1 — Render.com (khuyên dùng, dễ nhất, có sẵn `render.yaml`)

1. **Đưa code lên GitHub**
   ```bash
   cd "project web tai chinh"
   git init
   git add .
   git commit -m "TradeLearn - web hoc tai chinh"
   # tạo repo trên github.com rồi:
   git remote add origin https://github.com/<tên-bạn>/tradeonlearn.git
   git push -u origin main
   ```
   (Nếu chưa cài git / mới dùng GitHub: tải GitHub Desktop, kéo thả thư mục vào là xong.)

2. **Tạo service trên Render**
   - Vào **https://render.com** → đăng ký miễn phí bằng GitHub
   - Bấm **New +** → chọn **Blueprint** → chọn repo `tradeonlearn` → Render tự đọc file `render.yaml` có sẵn
   - Bấm **Apply** — Render tự build (cài server + build client) trong ~3-5 phút
   - Xong, Render cấp địa chỉ dạng `https://tradeonlearn.onrender.com` 🎉

   *Hoặc tạo tay (nếu không dùng Blueprint):* New → **Web Service** → connect repo →
   - Runtime: **Node**
   - Build Command: `npm ci --prefix server && npm ci --prefix client && npm run build --prefix client`
   - Start Command: `cd server && npm start`
   - Plan: **Free**

3. **Kiểm tra**: mở `https://.../api/health` thấy `{"ok":true}` là thành công.

### ⚠️ Đặc điểm gói Free của Render (cần biết)
| Đặc điểm | Giải thích |
|---|---|
| **Ngủ sau 15 phút không dùng** | Lần mở sau đó mất ~30-60 giây để "đánh thức". Vào trang chủ mình 1 lần là server tỉnh lại |
| **SQLite là bộ nhớ tạm** | Watchlist/ví/tiến độ học **reset khi Render khởi động lại service** (vài ngày/lần hoặc khi bạn deploy lại). Với web học tập thì chấp nhận được; muốn giữ dữ liệu lâu dài → dùng Cách 0, Render paid disk hoặc Postgres |
| **IP server có thể bị Yahoo giới hạn** | Nếu giá Mỹ không tải được trên server Render, web tự chuyển sang **chế độ mô phỏng** vẫn dùng tốt. Giải pháp triệt để: chạy Cách 0 trên máy bạn |

---

## 🥈 Cách 2 — Railway.app (tương tự Render, tặng credit dùng thử)

1. **https://railway.app** → đăng nhập bằng GitHub → **New Project** → **Deploy from GitHub repo**
2. Chọn repo → Railway tự nhận Node.js. Thiết lập:
   - Build Command: như Render ở trên
   - Start Command: `cd server && npm start`
3. Vào **Settings → Networking → Generate Domain** để nhận địa chỉ public.
   Lưu ý: Railway chỉ tặng credit giới hạn (vài đô/tháng) — đủ chạy thử nghiệm vài tuần.

---

## 🥉 Cách 3 — Fly.io (nếu đã có thẻ quốc tế, dùng được `Dockerfile` có sẵn)

```bash
# cài flyctl từ https://fly.io/docs/flyctl/install/ rồi:
fly launch --dockerfile-ignorefile .gitignore --internal-port 4001
fly deploy
```
Fly có gói miễn phí nhỏ (3 shared VM + 3GB volume) — có thể gắn **volume giữ liệu SQLite lâu dài**:
```bash
fly volumes create tradelearn_data --size 1
# trong fly.toml thêm mount: [mounts] source="tradelearn_data" destination="/app/server/data"
```

---

## ✅ Checklist trước khi deploy

- [ ] Chạy `npm run build` trong `client` không lỗi (đã kiểm tra khi phát triển)
- [ ] Truy cập `/api/health` trả `{"ok":true}`
- [ ] Mở trang chủ thấy biểu đồ + dashboard (nếu thấy nhãn "DỮ LIỆU MÔ PHỎNG" → server đó bị nguồn dữ liệu ngoài chặn, web vẫn dùng được để học)
- [ ] Mở `/corporate-finance` và thử 3 lab P&L, vốn lưu động, NPV

## 🔧 Sau khi deploy xong

Vào **Học tập → Bài 1** bắt đầu lộ trình, mở web trên điện thoại để theo dõi watchlist mọi lúc —
giá trên trang chi tiết cập nhật trực tiếp (~5 giây/lần qua SSE) phục vụ phân tích.
