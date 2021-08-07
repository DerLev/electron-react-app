const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 940,
    minHeight: 500,
    fullscreenable: false,
    icon: path.join(__dirname, '/../build/favicon.ico'),
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(startUrl);

  if(process.env.ELECTRON_START_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
      mainWindow = null
  });

  listeners();
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

var maximized = false;

const listeners = () => {
  mainWindow.on('maximize', () => {
    maximized = true;
  });
  
  mainWindow.on('unmaximize', () => {
    maximized = false;
  });
}

ipcMain.on('window', (e, arg) => {
  if(arg == 'close') {
    mainWindow.close();
  }

  if(arg == 'maximize') {
    if (maximized == true) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }

  if(arg == 'minimize') {
    mainWindow.minimize();
  }
})
