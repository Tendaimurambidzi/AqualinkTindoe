#!/bin/bash

# APK Update Script for SplashLine
# Usage: ./update-apk.sh "v1.1.0" "https://new-download-link.com/splashline-v1.1.0.apk"

if [ $# -lt 2 ]; then
    echo "Usage: $0 <version> <download_url>"
    echo "Example: $0 v1.1.0 https://dropbox.com/s/xxxxx/splashline-v1.1.0.apk?dl=1"
    exit 1
fi

VERSION=$1
DOWNLOAD_URL=$2

echo "🚀 Updating SplashLine to $VERSION"

# Update version in landing page
sed -i "s|SplashLine.*Connect|SplashLine $VERSION - Connect|g" docs/index.html

# Update download link
sed -i "s|href=\"[^\"]*splashline\.apk\"|href=\"$DOWNLOAD_URL\"|g" docs/index.html
sed -i "s|fetch('[^']*splashline\.apk'|fetch('$DOWNLOAD_URL'|g" docs/script.js

# Update README
echo "# SplashLine $VERSION" > docs/README.md
echo "Latest version: $VERSION" >> docs/README.md
echo "Download: $DOWNLOAD_URL" >> docs/README.md

echo "✅ Updated to version $VERSION"
echo "📱 Download URL: $DOWNLOAD_URL"
echo ""
echo "Next steps:"
echo "1. Test the updated landing page locally"
echo "2. Commit and push changes:"
echo "   git add docs/"
echo "   git commit -m 'Update to SplashLine $VERSION'"
echo "   git push origin github-pages-deploy"
echo "3. Announce update to users"