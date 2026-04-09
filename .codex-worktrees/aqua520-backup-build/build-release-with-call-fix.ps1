# Build Release APK with Call Notification Fixes
# This script builds a release APK with the incoming call notification and ringtone fixes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Release APK with Call Fixes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "android\app\build.gradle")) {
    Write-Host "Error: Must run from project root directory" -ForegroundColor Red
    exit 1
}

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
Push-Location android
try {
    .\gradlew clean
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Clean failed, continuing anyway..." -ForegroundColor Yellow
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Building release APK..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
Write-Host ""

# Build the release APK
Push-Location android
try {
    .\gradlew assembleRelease
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Build Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        
        # Find the APK files
        $apkDir = "app\build\outputs\apk\release"
        if (Test-Path $apkDir) {
            $apks = Get-ChildItem -Path $apkDir -Filter "*.apk"
            
            Write-Host "APK files generated:" -ForegroundColor Cyan
            foreach ($apk in $apks) {
                $size = [math]::Round($apk.Length / 1MB, 2)
                Write-Host "  - $($apk.Name) ($size MB)" -ForegroundColor White
                Write-Host "    Location: $($apk.FullName)" -ForegroundColor Gray
            }
            
            Write-Host ""
            Write-Host "To install on a connected device:" -ForegroundColor Yellow
            Write-Host "  adb install -r $apkDir\app-release.apk" -ForegroundColor White
            Write-Host ""
            Write-Host "Or install the universal APK:" -ForegroundColor Yellow
            Write-Host "  adb install -r $apkDir\app-universal-release.apk" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "Call Notification Features:" -ForegroundColor Cyan
        Write-Host "  ✓ Full-screen incoming call notification" -ForegroundColor Green
        Write-Host "  ✓ Default ringtone plays automatically" -ForegroundColor Green
        Write-Host "  ✓ Answer/Decline buttons on notification" -ForegroundColor Green
        Write-Host "  ✓ Works when app is in background or killed" -ForegroundColor Green
        Write-Host ""
        
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "Build Failed!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Check the error messages above for details." -ForegroundColor Yellow
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  - Missing Android SDK or NDK" -ForegroundColor Gray
        Write-Host "  - Gradle version mismatch" -ForegroundColor Gray
        Write-Host "  - Missing dependencies" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Install the APK on a test device" -ForegroundColor White
Write-Host "2. Test incoming calls with app in foreground, background, and killed" -ForegroundColor White
Write-Host "3. Verify ringtone plays and notification shows" -ForegroundColor White
Write-Host "4. Test Answer and Decline buttons from notification" -ForegroundColor White
Write-Host ""
Write-Host "For integration instructions, see:" -ForegroundColor Yellow
Write-Host "  CALL_NOTIFICATION_INTEGRATION.md" -ForegroundColor White
Write-Host ""
