#!/bin/bash

# SplashLine Landing Page Deployment Script

echo "🚀 Deploying SplashLine Landing Page..."

# Check if APK exists
if [ ! -f "splashline.apk" ]; then
    echo "❌ Error: splashline.apk not found!"
    echo "Please add your APK file to this directory."
    echo "Run: cp /path/to/your/app.apk ./splashline.apk"
    exit 1
fi

# Check APK size
APK_SIZE=$(stat -f%z splashline.apk 2>/dev/null || stat -c%s splashline.apk 2>/dev/null)
if [ "$APK_SIZE" -gt 100000000 ]; then
    echo "⚠️  Warning: APK is larger than 100MB ($APK_SIZE bytes)"
    echo "This may exceed GitHub's file size limit."
    echo "Consider using Git LFS or hosting the APK separately."
fi

echo "✅ APK found: $(ls -lh splashline.apk | awk '{print $5}')"

# Test local server
echo "🧪 Testing local server..."
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 2

# Check if server is running
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Local server running at http://localhost:8000"
else
    echo "❌ Local server failed to start"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

kill $SERVER_PID 2>/dev/null

echo ""
echo "📋 Deployment Checklist:"
echo "1. Push code to GitHub repository"
echo "2. Connect repository to Netlify"
echo "3. Set publish directory to: splashline-landing"
echo "4. Deploy!"
echo ""
echo "🌐 Your landing page will be live at: https://your-site.netlify.app"
echo ""
echo "🎉 Ready for deployment!"