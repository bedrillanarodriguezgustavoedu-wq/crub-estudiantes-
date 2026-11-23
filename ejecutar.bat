@echo off
setlocal
chcp 65001 >nul
title GalyCrud - Iniciando servicios

set "ROOT=%~dp0"
set "DOTNET_ROOT=%USERPROFILE%\.dotnet"
set "PATH=%DOTNET_ROOT%;%PATH%"
set "DOTNET_EXE=%DOTNET_ROOT%\dotnet.exe"

echo ============================================
echo   GalyCrud - Colegio Galy
echo ============================================
echo.

if not exist "%DOTNET_EXE%" (
    echo [ERROR] No se encontro el SDK de .NET en:
    echo         %DOTNET_EXE%
    echo         Instala el SDK 8.0 antes de continuar.
    pause
    exit /b 1
)

if not exist "%ROOT%Frontend\node_modules" (
    echo Instalando dependencias de Angular...
    pushd "%ROOT%Frontend"
    call npm ci --no-audit --no-fund
    if errorlevel 1 (
        echo [ERROR] No se pudieron instalar las dependencias de Angular.
        popd
        pause
        exit /b 1
    )
    popd
)

set "FRONTEND_PORT=4200"
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 4200 -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
if errorlevel 1 set "FRONTEND_PORT=4201"

if "%FRONTEND_PORT%"=="4201" (
    powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 4201 -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
    if errorlevel 1 (
        echo [ERROR] Los puertos 4200 y 4201 ya estan ocupados.
        echo         Cierra la instancia anterior de Angular e intenta de nuevo.
        pause
        exit /b 1
    )
)

echo Iniciando backend ^(http://localhost:5000^) ...
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
if errorlevel 1 (
    curl.exe -fsS --max-time 2 http://localhost:5000/health >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] El puerto 5000 esta ocupado por otro servicio.
        echo         Libera el puerto y vuelve a ejecutar este archivo.
        pause
        exit /b 1
    )
    echo Backend existente detectado; se reutilizara.
    echo Si actualizaste el codigo del backend, cierra su ventana con Ctrl+C y vuelve a ejecutar este archivo.
) else (
    start "GalyCrud - Backend" cmd /k "cd /d ""%ROOT%Backend"" && dotnet build GalyCrudBackend.csproj && set ASPNETCORE_ENVIRONMENT=Development && set ASPNETCORE_URLS=http://localhost:5000 && dotnet bin\Debug\net8.0\GalyCrudBackend.dll"
)

echo Iniciando frontend en el puerto %FRONTEND_PORT% ...
start "GalyCrud - Frontend" cmd /k "cd /d ""%ROOT%Frontend"" && npm start -- --port %FRONTEND_PORT%"

echo.
echo Abre http://localhost:%FRONTEND_PORT% en tu navegador.
echo Swagger: http://localhost:5000/swagger
echo.
pause
