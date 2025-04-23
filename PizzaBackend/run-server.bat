@echo off
SETLOCAL

echo Adding NuGet source if not exists...
dotnet nuget list source | find "api.nuget.org" > nul
if %ERRORLEVEL% neq 0 (
    dotnet nuget add source https://api.nuget.org/v3/index.json -n nuget.org
) else (
    echo NuGet source already exists
)

echo Restoring packages...
dotnet restore
if %ERRORLEVEL% neq 0 (
    echo Failed to restore packages
    pause
    exit /b 1
)

echo Cleaning solution...
dotnet clean
if %ERRORLEVEL% neq 0 (
    echo Clean failed
    pause
    exit /b 1
)

echo Running the backend with HTTP and HTTPS...
dotnet run -- --urls "http://localhost:5278;https://localhost:7059"

ENDLOCAL
pause