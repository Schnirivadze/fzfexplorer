const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    listFiles: (directoryPath) => ipcRenderer.invoke('list-files', directoryPath),
    openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
    minimize: () => ipcRenderer.invoke('minimize'),
    maximize: () => ipcRenderer.invoke('maximize'),
    close: () => ipcRenderer.invoke('close'),
    openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
    getHomeDirectory: () => ipcRenderer.invoke('get-home-directory'),
    pathExists: () => ipcRenderer.invoke('path-exists'),
    driveList: () => ipcRenderer.invoke('drive-list'),
    getUsername: () => ipcRenderer.invoke('username'),

    platform: process.platform,
});