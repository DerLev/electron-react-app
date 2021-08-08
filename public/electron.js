const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const url = require('url');
const pjson = require('../package.json');

let mainWindow;
let tray;

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

app.on('ready', () => {
  createWindow();

  tray = new Tray(path.join(__dirname, '/../build/icon.png'));
  tray.setToolTip(pjson.name);
  tray.on('click', () => {
    mainWindow.show();
  });

  const trayMenuTemplate = [
    {
      label: pjson.name,
      sublabel: 'v' + pjson.version,
      enabled: false,
      icon: path.join(__dirname, '/../build/trayMenu.png')
    },
    {
      type: 'separator'
    },
    {
      label: 'Open App',
      click: () => mainWindow.show()
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit App',
      click: () => app.quit()
    }
  ];
  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setContextMenu(trayMenu);
});

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
    mainWindow.hide();
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

ipcMain.on('app', (e, arg) => {
  if(arg == 'title') {
    e.returnValue = pjson.name;
  }
})
