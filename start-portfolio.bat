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

REM ---------- BACKEND ----------
echo.
echo [BACKEND] Comprobando dependencias...
if not exist "backend\node_modules" (
    echo [BACKEND] Instalando dependencias...
    pushd backend
    call npm install
    popd
) else (
    echo [BACKEND] Dependencias ya instaladas.
)

REM ---------- ARRANQUE ----------
echo.
echo Arrancando BACKEND...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo Arrancando FRONTEND...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Todo configurado y ejecutándose.
pause
