const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const url = require('url');
const pjson = require('../package.json');
const AutoLaunch = require('auto-launch');
const { autoUpdater } = require('electron-updater');
const Store = require('./store.js');

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 1280, height: 720 },
    windowMaximized: false,
    autoStart: true
  }
});

let mainWindow;
let tray;
let autoLaunch;

function createWindow() {
  let { width, height } = store.get('windowBounds');

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 940,
    minHeight: 500,
    fullscreenable: false,
    icon: path.join(__dirname, '/../build/icon-256x256.png'),
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

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
  });

  let windowMaximized = store.get('windowMaximized');
  if(windowMaximized == true) {
    mainWindow.maximize();
  }
}

app.on('ready', () => {
  createWindow();

  tray = new Tray(path.join(__dirname, '/../build/icon.png'));
  tray.setToolTip(pjson.productName);
  tray.on('click', () => {
    mainWindow.show();
    autoUpdater.checkForUpdates();
  });

  const trayMenuTemplate = [
    {
      label: pjson.productName,
      sublabel: 'v' + pjson.version,
      enabled: false,
      icon: path.join(__dirname, '/../build/trayMenu.png')
    },
    {
      type: 'separator'
    },
    {
      label: 'Open App',
      click: () => {mainWindow.show(); autoUpdater.checkForUpdates();}
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

  let autoStart = store.get('autoStart');

  if(!process.env.ELECTRON_START_URL) {
    autoLaunch = new AutoLaunch({
      name: pjson.productName,
      path: app.getPath('exe'),
    });
    autoLaunch.isEnabled().then((isEnabled) => {
      if (!isEnabled && autoStart) autoLaunch.enable();
      if (!autoStart) autoLaunch.disable();
    });
  }
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

const listeners = () => {
  mainWindow.on('maximize', () => {
    store.set('windowMaximized', true);
  });
  
  mainWindow.on('unmaximize', () => {
    store.set('windowMaximized', false);
  });
  
  mainWindow.on('resize', () => {
    let { width, height } = mainWindow.getBounds();
    let windowMaximized = store.get('windowMaximized');
    setTimeout(() => {
      if(windowMaximized == false) {
        store.set('windowBounds', { width, height });
      }
    }, 10);
  });
}

ipcMain.on('window', (e, arg) => {
  if(arg == 'close') {
    mainWindow.hide();
  }

  if(arg == 'maximize') {
    let windowMaximized = store.get('windowMaximized');

    if (windowMaximized == true) {
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
    e.returnValue = pjson.productName;
  }

  if(arg == 'version') {
    e.returnValue = app.getVersion();
  }

  if(arg == 'update') {
    autoUpdater.quitAndInstall();
  }

  if(arg == 'autostart-disable') {
    autoLaunch.disable();
    store.set('autoStart', false);
  }

  if(arg == 'autostart-enable') {
    autoLaunch.enable();
    store.set('autoStart', true);
  }
})

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update', 'available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update', 'downloaded');
});
