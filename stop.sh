#!/bin/bash

echo "Stopping Mainstay services..."

# Find and kill the FastAPI backend (running on port 8000)
BACKEND_PID=$(lsof -t -i :8000)
if [ -z "$BACKEND_PID" ]; then
    echo "Backend is not running on port 8000."
else
    echo "Killing Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
fi

# Find and kill the Next.js frontend (running on port 3000)
FRONTEND_PID=$(lsof -t -i :3000)
if [ -z "$FRONTEND_PID" ]; then
    echo "Frontend is not running on port 3000."
else
    echo "Killing Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID
fi

echo "All services stopped."
