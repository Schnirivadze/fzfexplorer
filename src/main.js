const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
// const { driveList } = require('nodejs-disks');
const contextMenu = require('./contextMenu');
const driveList = require('drivelist');

// Constants
const isMac = process.platform === 'darwin';
const homeDirectory = os.homedir();

// Create the main window when the app is ready
app.whenReady().then(() => {
    createMainWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
    if (!isMac) app.quit();
});

// Create the main application window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        transparent: true,  // This should ensure transparency
        frame: false,       // Disables the default window frame
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

    mainWindow.loadFile('./src/pages/main/index.html');

    // Open DevTools (optional)
    // mainWindow.webContents.openDevTools();
}

// IPC Handlers
ipcMain.handle('platform', () => process.platform);
ipcMain.handle('minimize', (event) => BrowserWindow.fromWebContents(event.sender).minimize());
ipcMain.handle('maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.isMaximized() ? window.unmaximize() : window.maximize();
});
ipcMain.handle('close', (event) => BrowserWindow.fromWebContents(event.sender).close());

ipcMain.handle('getHomeDirectory', () => homeDirectory);
ipcMain.handle('openDevTools', (event) => BrowserWindow.fromWebContents(event.sender).webContents.openDevTools());
ipcMain.handle('openFile', (event, filePath) => shell.openPath(filePath));
ipcMain.handle('listFiles', async (event, directoryPath) => await fs.readdir(directoryPath, { withFileTypes: true }).then(files => files.map(file => ({
    name: file.name,
    isDirectory: file.isDirectory(),
    path: path.join(directoryPath, file.name)
}))));
ipcMain.handle('pathExists', async (event, filePath) => await fs.access(filePath).then(() => true).catch(() => false));
ipcMain.handle('driveList', async () => await driveList.list());

contextMenu.setupContextMenu(ipcMain);