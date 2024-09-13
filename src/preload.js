const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    platform: () => ipcRenderer.invoke('platform'),
    minimize: () => ipcRenderer.invoke('minimize'),
    maximize: () => ipcRenderer.invoke('maximize'),
    close: () => ipcRenderer.invoke('close'),
    getHomeDirectory: () => ipcRenderer.invoke('getHomeDirectory'),
    openDevTools: () => ipcRenderer.invoke('openDevTools'),
    openFile: (filePath) => ipcRenderer.invoke('openFile', filePath),
    listFiles: (directoryPath) => ipcRenderer.invoke('listFiles', directoryPath),
    pathExists: (filePath) => ipcRenderer.invoke('pathExists', filePath),
    driveList: () => ipcRenderer.invoke('driveList'),
    showContextMenu: (event, file) => ipcRenderer.send('show-context-menu', { event, file })
});
