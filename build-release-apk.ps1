# Build Release APK with Local Gradle Home
# This script builds a release APK using a local Gradle home to avoid cache locking

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Release APK (Local Gradle)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "android\app\build.gradle")) {
    Write-Host "Error: Must run from project root directory" -ForegroundColor Red
    exit 1
}

# Set local Gradle home
$localGradleHome = Join-Path $PSScriptRoot ".gradle-local"
$env:GRADLE_USER_HOME = $localGradleHome

Write-Host "Using local Gradle home: $localGradleHome" -ForegroundColor Yellow
Write-Host ""

# Stop any running Gradle daemons
Write-Host "Stopping Gradle daemons..." -ForegroundColor Yellow
Push-Location android
try {
    .\gradlew --stop 2>$null
} catch {
    Write-Host "No daemons to stop" -ForegroundColor Gray
}
Pop-Location

Write-Host ""
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
Push-Location android
try {
    .\gradlew clean --no-daemon
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

# Build the release APK with local Gradle home
Push-Location android
try {
    .\gradlew assembleRelease --no-daemon
    
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
            
            # Find universal APK first, fallback to regular release
            $universalApk = $apks | Where-Object { $_.Name -like "*universal*" } | Select-Object -First 1
            $regularApk = $apks | Where-Object { $_.Name -like "app-release.apk" } | Select-Object -First 1
            
            if ($universalApk) {
                Write-Host "  adb install -r `"$($universalApk.FullName)`"" -ForegroundColor White
            } elseif ($regularApk) {
                Write-Host "  adb install -r `"$($regularApk.FullName)`"" -ForegroundColor White
            }
        }
        
        Write-Host ""
        
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "Build Failed!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Check the error messages above for details." -ForegroundColor Yellow
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host ""
