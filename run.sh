#!/bin/bash

# Function to handle termination
cleanup() {
    echo "Stopping servers..."
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Starting Mainstay Application..."

# Add current directory to PYTHONPATH so "backend.main" works
export PYTHONPATH=$PYTHONPATH:$(pwd)

# 1. Start Backend
echo "Starting Backend (FastAPI)..."
if [ -d "backend/venv" ]; then
    source backend/venv/bin/activate
fi
# Run from root so that "from backend.graph import ..." works
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 2. Start Frontend
echo "Starting Frontend (Next.js)..."
cd frontend
npm run dev -- -p 3000 &
FRONTEND_PID=$!
cd ..

echo "Servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both servers."

# Wait for background processes
wait
