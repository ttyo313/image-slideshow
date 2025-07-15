@echo off
echo Electron 앱 빌드 중...
npm install
npx electron-packager . slideshow --platform=win32 --arch=x64 --overwrite
echo 빌드 완료! \slideshow-win32-x64\ 폴더에 실행파일이 있습니다.
pause
