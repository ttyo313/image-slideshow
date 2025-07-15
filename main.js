const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('get-images', async () => {
  // ✅ .exe 파일이 실행되고 있는 실제 위치
  const exeDir = path.dirname(process.execPath);
  const slidesDir = path.join(exeDir, 'slides');

  let files = [];
  try {
    files = fs.readdirSync(slidesDir);
  } catch (e) {
    console.error('슬라이드 폴더를 찾을 수 없습니다:', slidesDir);
    return [];
  }

  return files
    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    .map(file => `file://${path.join(slidesDir, file)}`);
});
