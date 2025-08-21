#!/bin/bash

# Kill any existing Next.js processes
echo "🔄 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Check if port 3000 is free
if lsof -i:3000 >/dev/null 2>&1; then
    echo "❌ Port 3000 is still in use. Please check what's running on that port."
    exit 1
fi

# Navigate to project directory and start server
echo "🚀 Starting Next.js development server..."
cd "/Users/benserota/Documents/Code Projects/iterative_translator"
npm run dev
