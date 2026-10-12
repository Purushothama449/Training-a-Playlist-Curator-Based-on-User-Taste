@echo off
echo ========================================================
echo Launching AI Playlist Curator Web Application
echo ========================================================

echo Starting FastAPI Backend on http://localhost:8000 ...
start "AI Playlist Curator - Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

timeout /t 3

echo Starting React Frontend on http://localhost:5173 ...
start "AI Playlist Curator - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application launched! Open http://localhost:5173 in your web browser.
