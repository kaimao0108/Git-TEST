@echo off
chcp 65001 >nul
echo 正在將《勇者鬥惡龍：倖存者》推送到 GitHub (kaimao0108/Git-TEST)...
echo.
cd /d "%~dp0"
git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo 成功推送到 GitHub！
    echo 請至 GitHub 儲存庫確認：https://github.com/kaimao0108/Git-TEST
    echo.
    echo GitHub Pages 部署網址將為：
    echo https://kaimao0108.github.io/Git-TEST/
    echo ========================================================
) else (
    echo.
    echo 推送失敗，請確認是否已登入 GitHub 帳號。
)
pause
