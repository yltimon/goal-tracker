@echo off
echo Installing Goal Tracker Dependencies...
echo.

echo Step 1: Installing Backend Dependencies...
cd backend
call npm install
echo Backend dependencies installed!
echo.

echo Step 2: Installing Frontend Dependencies...
cd ..\frontend
call npm install
echo Frontend dependencies installed!
echo.

echo Step 3: Starting Servers...
echo.
echo Please open TWO Command Prompts:
echo.
echo In First Command Prompt:
echo   cd goal-tracker\backend
echo   npm run dev
echo.
echo In Second Command Prompt:
echo   cd goal-tracker\frontend
echo   npm start
echo.
pause