@echo off
setlocal enabledelayedexpansion

echo ============================
echo   INICIANDO PORTFOLIO
echo ============================

REM ---------- FRONTEND ----------
echo.
echo [FRONTEND] Comprobando dependencias...
if not exist "frontend\node_modules" (
    echo [FRONTEND] Instalando dependencias...
    pushd frontend
    call npm install
    popd
) else (
    echo [FRONTEND] Dependencias ya instaladas.
)

REM ---------- ARRANQUE ----------
echo.
echo Arrancando FRONTEND...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Frontend servido en localhost:3000
pause
