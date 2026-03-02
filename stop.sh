#!/bin/zsh
PROJECT="/Users/yowunpansilu/Documents/GitHub/SDFitness"

echo "🛑 Stopping SDFitness services..."

pkill -f "python app.py" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "✅ All services stopped."
