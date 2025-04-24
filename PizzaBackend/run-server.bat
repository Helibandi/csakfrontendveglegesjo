@echo off
SETLOCAL ENABLEEXTENSIONS

:: Save starting directory
set "BASE_DIR=%~dp0"

:: Add NuGet source if not exists
echo Adding NuGet source if not exists...
dotnet nuget list source | findstr /C:"api.nuget.org" >nul
if %ERRORLEVEL% neq 0 (
    dotnet nuget add source https://api.nuget.org/v3/index.json -n nuget.org
) else (
    echo NuGet source already exists.
)

:: Restore backend packages
echo Restoring backend packages...
dotnet restore
if %ERRORLEVEL% neq 0 (
    echo Failed to restore backend packages.
    pause
    exit /b 1
)

:: Clean backend solution
echo Cleaning backend solution...
dotnet clean
if %ERRORLEVEL% neq 0 (
    echo Failed to clean backend solution.
    pause
    exit /b 1
)

:: Start backend server
echo Starting backend server...
pushd "%BASE_DIR%"
start "Backend Server" cmd /k "dotnet run --urls http://localhost:5278;https://localhost:7059"
popd

:: Start frontend separately
echo Starting frontend...
pushd "%BASE_DIR%..\frontend"

:: Check if node_modules exist
if exist node_modules (
    echo Node modules already installed.
) else (
    echo Installing frontend dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install frontend dependencies.
        popd
        pause
        exit /b 1
    )
)

:: Start frontend server
start "Frontend Server" cmd /k "npm run dev"
popd

:: Keep original batch file window open
echo Servers are starting. Press any key to exit this window.
pause
exit /b 0