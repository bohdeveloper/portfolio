@echo off
echo ============================
echo   INICIANDO PORTFOLIO
echo ============================

REM --- FRONTEND ---
echo.
echo [FRONTEND] Comprobando dependencias...
if not exist "frontend\node_modules" (
    echo [FRONTEND] node_modules no encontrado. Instalando...
    cd frontend
    npm install
    cd ..
)

REM --- BACKEND ---
echo.
echo [BACKEND] Comprobando dependencias...
if not exist "backend\node_modules" (
    echo [BACKEND] node_modules no encontrado. Instalando...
    cd backend
    npm install
    cd ..
)

echo.
echo Lanzando backend...
start cmd /k "cd backend && npm run dev"

echo.
echo Lanzando frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Todo listo.
pause
