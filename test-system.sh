#!/bin/bash

echo "🔍 Testing Job Tracker System..."
echo ""

# Test 1: Backend Health
echo "1️⃣ Testing Backend Health..."
HEALTH=$(curl -s http://localhost:3000/health)
if [[ $HEALTH == *"healthy"* ]]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not responding"
    exit 1
fi
echo ""

# Test 2: Auth endpoint
echo "2️⃣ Testing Auth Endpoint..."
AUTH=$(curl -s http://localhost:3000/auth/google)
if [[ $AUTH == *"authUrl"* ]]; then
    echo "✅ Auth endpoint working"
else
    echo "❌ Auth endpoint failed"
fi
echo ""

# Test 3: Dashboard
echo "3️⃣ Testing Dashboard..."
DASH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [[ $DASH == "200" ]]; then
    echo "✅ Dashboard is running"
else
    echo "❌ Dashboard not responding (code: $DASH)"
fi
echo ""

echo "📋 Summary:"
echo "- Backend: http://localhost:3000"
echo "- Dashboard: http://localhost:5173"
echo "- Extension: Load from /Users/abhiramrangoon/Desktop/job/job-tracker/extension"
echo ""
echo "🔧 Next Steps:"
echo "1. Click extension icon → Sign in with Google"
echo "2. Visit LinkedIn job page"
echo "3. Click 'Save to Tracker' button"
echo "4. Check dashboard for saved job"
