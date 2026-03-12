@echo off
echo Installing APK on Android Emulator...
echo.
echo Make sure your Android emulator is running.
echo.
pause

cd android\app\build\outputs\apk\release

echo.
echo Installing app-release.apk on emulator...
adb -e install -r app-release.apk

echo.
echo Installation complete!
echo.
pause
