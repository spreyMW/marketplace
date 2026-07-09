@echo off
setlocal enabledelayedexpansion

echo.
echo 🌾 Setting up Agricultural Marketplace Development Environment...
echo.

REM Backend Setup
echo 📦 Backend Setup...
cd backend

if exist composer.json (
    echo ✅ Installing PHP dependencies...
    call composer install
) else (
    echo ❌ composer.json not found
)

if not exist .env (
    echo ⚠️  .env file not found, configure database credentials in .env
) else (
    echo ✅ .env file found
)

echo ✅ Backend configured
echo    Start server: php spark serve
echo    API URL: http://localhost:8080
echo.

REM Frontend Setup
echo ⚛️  Frontend Setup...
cd ..\frontend

if exist package.json (
    echo ✅ Installing Node dependencies...
    call npm install
) else (
    echo ❌ package.json not found
)

if not exist .env (
    echo ✅ Creating .env file...
    (
        echo VITE_API_URL=http://localhost:8080/api
    ) > .env
)

echo ✅ Frontend configured
echo    Start server: npm run dev
echo    URL: http://localhost:5173
echo.

echo 🎉 Setup Complete! Follow these steps to run the application:
echo.
echo PowerShell Terminal 1 - Backend:
echo   cd backend
echo   php spark serve
echo.
echo PowerShell Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open http://localhost:5173 in your browser
echo.
pause
