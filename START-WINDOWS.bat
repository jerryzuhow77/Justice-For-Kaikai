@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>&1
if %errorlevel%==0 (
  py -3 run_animation.py
  goto :end
)

where python >nul 2>&1
if %errorlevel%==0 (
  python run_animation.py
  goto :end
)

echo.
echo [無法啟動] 此電腦尚未安裝 Python 3。
echo 請安裝 Python 3 後，再雙擊本檔案。
echo 也可以將整個資料夾放進任何靜態網站伺服器後，開啟 /?reel=1。
echo.
pause

:end
endlocal
