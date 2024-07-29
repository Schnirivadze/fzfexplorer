const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
try {
  require('electron-reloader')(module)
} catch (_) {}
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    transparent: true, 
    frame: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'pages/main/index.html'));
  // mainWindow.webContents.openDevTools();
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

// Handle the open-file IPC message
ipcMain.on('open-file', async (event, filePath) => {
  try {
    console.log(filePath)
    const { default: open } = await import('open'); // Use dynamic import to load the module
    await open(filePath);
  } catch (err) {
    console.error('Error opening file:', err);
  }
});

