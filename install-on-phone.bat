@echo off
echo Installing APK on connected phone...
echo.
echo Make sure your phone is connected via USB with USB debugging enabled.
echo.
pause

cd android\app\build\outputs\apk\release

echo.
echo Installing app-release.apk...
adb install -r app-release.apk

echo.
echo Installation complete!
echo.
pause
