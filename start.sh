#!/bin/bash

echo "🚀 Starting Job Tracker System..."
echo ""

# Check if backend is already running
BACKEND_RUNNING=$(curl -s http://localhost:3000/health 2>/dev/null)

if [[ $BACKEND_RUNNING == *"healthy"* ]]; then
    echo "✅ Backend already running on port 3000"
else
    echo "⚠️  Backend not running. Start it with:"
    echo "   cd backend && npm run dev"
fi

echo ""

# Check if dashboard is running
DASH_RUNNING=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null)

if [[ $DASH_RUNNING == "200" ]]; then
    echo "✅ Dashboard already running on port 5173"
else
    echo "⚠️  Dashboard not running. Start it with:"
    echo "   cd dashboard && npm run dev"
fi

echo ""
echo "📋 Quick Start Guide:"
echo ""
echo "1️⃣  Make sure both servers are running:"
echo "   - Backend: http://localhost:3000"
echo "   - Dashboard: http://localhost:5173"
echo ""
echo "2️⃣  Load extension in Chrome:"
echo "   - Go to chrome://extensions/"
echo "   - Enable Developer mode"
echo "   - Click 'Load unpacked'"
echo "   - Select: $(pwd)/extension"
echo ""
echo "3️⃣  Sign in to extension:"
echo "   - Click extension icon in Chrome toolbar"
echo "   - Click 'Sign in with Google'"
echo "   - Use: dummyuser1118@gmail.com"
echo ""
echo "4️⃣  Test saving a job:"
echo "   - Visit: https://www.linkedin.com/jobs/"
echo "   - Click any job posting"
echo "   - Click '💼 Save to Tracker' button"
echo "   - Should show '✅ Saved!'"
echo ""
echo "5️⃣  View saved jobs:"
echo "   - Dashboard: http://localhost:5173"
echo "   - Or click 'View Google Sheet' in extension"
echo ""
echo "📖 Full troubleshooting guide:"
echo "   See: troubleshooting.md"
echo ""
