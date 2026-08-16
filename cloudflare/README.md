# Cloudflare State Worker

Worker này lưu snapshot workspace của TradeLearn vào Cloudflare D1. Render vẫn phục vụ các API thị trường, còn dữ liệu học của mỗi trình duyệt được hydrate khi workspace mở và ghi lại sau mỗi thao tác thay đổi state.

## Triển khai

```bash
cd cloudflare
npx wrangler d1 migrations apply tradelearn-production --remote
npx wrangler deploy
```

Chay migration truoc khi deploy Worker. Migration tao bang snapshot mot lan va
khong xoa du lieu da co.

Sau khi deploy, đặt URL Worker vào biến môi trường `CLOUDFLARE_STATE_URL` của dịch vụ Render, ví dụ:

```text
https://tradelearn-state.<subdomain>.workers.dev
```

Tạo cùng một secret `STATE_SYNC_TOKEN` ở Worker và `CLOUDFLARE_STATE_TOKEN` ở Render. Không đặt URL hoặc secret trong frontend. Chỉ Render gọi Worker để người dùng không truy cập trực tiếp tầng lưu trữ.
