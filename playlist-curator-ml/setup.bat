@echo off
echo ========================================================
echo Setting up AI Playlist Curator ML Mini-Project Environment
echo ========================================================

echo.
echo [1/3] Setting up Python Backend Virtual Environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo.
echo [2/3] Installing Frontend Node Dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Generating Default Dataset & Pre-training Model...
cd backend
call venv\Scripts\python.exe -c "import app.main"
cd ..

echo.
echo ========================================================
echo Setup Complete! Run 'run.bat' to launch the application.
echo ========================================================
pause
