const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { shell } = require('electron')
const os = require('os');
const drivelist = require('drivelist');

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    transparent: true,
    frame: false,
    'minHeight': 450,
    'minWidth': 850,
  });

  window.loadFile(path.join(__dirname, 'pages/main/index.html'));
  window.on('resize', () => {
    // Send resize event to renderer process
    window.webContents.send('window-resize');
  });
  ipcMain.handle('minimize', () => window.minimize());
  ipcMain.handle('maximize', () => window.maximize());
  ipcMain.handle('close', () => app.quit());
  ipcMain.handle('open-dev-tools', () => { window.webContents.openDevTools() });
  ipcMain.handle('path-exists', (path) => { fs.existsSync(path) })
  ipcMain.handle('drive-list', drivelist.list)
  ipcMain.handle('username', () => { return os.userInfo().username })
  ipcMain.handle('is-maximized', () => { return window.isMaximized() })
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('list-files', async (event, directoryPath) => {
  return fs.readdirSync(directoryPath).map(file => {
    const filePath = path.join(directoryPath, file);
    try {
      return {
        name: file,
        path: filePath,
        isDirectory: fs.statSync(filePath).isDirectory()
      };
    } catch (error) {
      console.error(`Error reading info of ${filePath}`)
    }
  });
});

ipcMain.handle('open-file', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
  } catch (err) {
    console.error('Error opening file:', err);
  }
});
ipcMain.handle('get-home-directory', () => { return os.homedir() })