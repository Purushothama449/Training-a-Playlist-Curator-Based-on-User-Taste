#!/bin/bash
echo "========================================================"
echo "Setting up AI Playlist Curator ML Mini-Project Environment"
echo "========================================================"

echo "[1/2] Setting up Python Virtual Environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "[2/2] Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo "Setup complete! Run 'bash run.sh' or start backend and frontend separately."
