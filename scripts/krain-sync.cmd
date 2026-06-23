@echo off
REM Monthly Krain stats sync launcher (run by Task Scheduler).
REM Scans #Architecture, updates lib/siteStats.ts, and if changed pushes + deploys.
cd /d "C:\Users\kepne\OneDrive\Documents\GitHub\krain-studio"
echo. >> "%TEMP%\krain-sync.log"
echo ==== [%date% %time%] krain stats sync ==== >> "%TEMP%\krain-sync.log"
"C:\Program Files\nodejs\node.exe" scripts\sync-stats.mjs --deploy >> "%TEMP%\krain-sync.log" 2>&1
echo exit code: %ERRORLEVEL% >> "%TEMP%\krain-sync.log"
