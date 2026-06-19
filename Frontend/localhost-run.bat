@echo off
setlocal

cd /d "%~dp0"

rem Start Vite dev server on localhost
rem (Uses VITE defaults; optionally set VITE_BACKEND_URL)

echo Starting frontend Vite dev server...

if "%VITE_BACKEND_URL%"=="" (
  echo VITE_BACKEND_URL not set. Using default from code: http://localhost:5000
) else (
  echo Using VITE_BACKEND_URL=%VITE_BACKEND_URL%
)

call npm run dev
endlocal

