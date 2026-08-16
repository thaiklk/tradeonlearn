@echo off
chcp 65001 >nul
title TradeLearn - Web hoc tai chinh
echo ============================================================
echo    TRADELEARN - KHOI DONG WEB + MO ONLINE (CLOUDFLARE)
echo ============================================================
echo.
echo [1/3] Khoi dong server...
start "TradeLearn Server" cmd /k "cd /d %~dp0server && npm start"
timeout /t 4 /nobreak >nul
echo [2/3] Mo web trong trinh duyet tai http://localhost:4001 ...
start "" http://localhost:4001
echo [3/3] Mo duong ham Cloudflare (link online cho dien thoai / ban be)...
echo.
echo    ==================== LINK ONLINE ====================
echo    Xem dong "https://xxxx.trycloudflare.com" in o duoi
echo    (cho vai giay). Copy link do de dung tu bat ky dau!
echo    ====================================================
echo.
npx -y cloudflared tunnel --url http://localhost:4001
echo.
echo Duong ham da dong. Nhan phim bat ky de thoat...
pause >nul
