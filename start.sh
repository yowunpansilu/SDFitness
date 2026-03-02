#!/bin/zsh
# SDFitness — Start all services
# Usage: ./start.sh
# Run this once after a terminal restart

PROJECT="/Users/yowunpansilu/Documents/GitHub/SDFitness"

echo "🚀 Starting SDFitness services..."

# Kill any existing
pkill -f "python app.py" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# ML service (port 5001)
source "$PROJECT/.venv/bin/activate"
cd "$PROJECT/ml-service"
nohup python app.py > "$PROJECT/logs/ml-service.log" 2>&1 &
ML_PID=$!
echo "  ✅ ML service started (PID $ML_PID)"

# Backend (port 3005)
cd "$PROJECT/backend"
nohup node server.js > "$PROJECT/logs/backend.log" 2>&1 &
BE_PID=$!
echo "  ✅ Backend started (PID $BE_PID)"

# Frontend (port 3000)
cd "$PROJECT/frontend"
nohup npm run dev -- --port 3000 > "$PROJECT/logs/frontend.log" 2>&1 &
FE_PID=$!
echo "  ✅ Frontend started (PID $FE_PID)"

# Admin Panel (port 3001)
cd "$PROJECT/admin-pannel"
nohup npm run dev > "$PROJECT/logs/admin-pannel.log" 2>&1 &
AP_PID=$!
echo "  ✅ Admin Panel started (PID $AP_PID)"

# Store PIDs
echo "$ML_PID" > "$PROJECT/logs/ml.pid"
echo "$BE_PID" > "$PROJECT/logs/backend.pid"
echo "$FE_PID" > "$PROJECT/logs/frontend.pid"
echo "$AP_PID" > "$PROJECT/logs/admin-pannel.pid"

sleep 4
echo ""
echo "  Checking ports..."
lsof -i :5001 | grep LISTEN && echo "  🐍 ML service :5001 UP" || echo "  ❌ ML service DOWN — check logs/ml-service.log"
lsof -i :3005 | grep LISTEN && echo "  🟢 Backend    :3005 UP" || echo "  ❌ Backend DOWN — check logs/backend.log"
lsof -i :3000 | grep LISTEN && echo "  💻 Frontend   :3000 UP" || echo "  ❌ Frontend DOWN — check logs/frontend.log"
lsof -i :3001 | grep LISTEN && echo "  🛠️  Admin Panel:3001 UP" || echo "  ❌ Admin Panel DOWN — check logs/admin-pannel.log"
echo ""
echo "Done. Tail logs with:"
echo "  tail -f $PROJECT/logs/ml-service.log"
echo "  tail -f $PROJECT/logs/backend.log"
echo "  tail -f $PROJECT/logs/frontend.log"
echo "  tail -f $PROJECT/logs/admin-pannel.log"
