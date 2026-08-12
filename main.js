const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const isSmoke = !!process.env.SMOKE;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 700,
    minHeight: 560,
    title: 'Nipunadhamma Singlish — Singlish → සිංහල',
    icon: path.join(__dirname, 'image', 'app-logo.png'),
    backgroundColor: '#fdf9f3',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  win.removeMenu();

  win.loadFile('index.html');

  win.webContents.on('did-fail-load', function (e, code, desc) {
    console.error('PAGE FAILED TO LOAD:', code, desc);
  });

  win.webContents.on('console-message', function (e, level, message) {
    if (isSmoke && level >= 2) console.error('RENDERER ERROR:', message);
  });

  win.webContents.setWindowOpenHandler(function ({ url }) {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', function (e, url) {
    if (!/^file:/.test(url)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  if (isSmoke) {
    win.webContents.once('did-finish-load', function () {
      console.log('SMOKE OK — index.html loaded');
      setTimeout(function () { app.quit(); }, 400);
    });
  }
}

app.whenReady().then(function () {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
