const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { shell } = require('electron')

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
  ipcMain.handle('minimize', () => window.minimize());
  ipcMain.handle('maximize', () => window.maximize());
  ipcMain.handle('close', () => app.quit());
  ipcMain.handle('open-dev-tools', () => { window.webContents.openDevTools() });

}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('list-files', async (event, directoryPath) => {
  return fs.readdirSync(directoryPath).map(file => {
    const filePath = path.join(directoryPath, file);
    return {
      name: file,
      path: filePath,
      isDirectory: fs.statSync(filePath).isDirectory()
    };
  });
});

ipcMain.handle('open-file', async (event, filePath) => {
  try {
    console.log(`Opening file ${filePath}`)
    await shell.openPath(filePath);
  } catch (err) {
    console.error('Error opening file:', err);
  }
});
