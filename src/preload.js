const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    listFiles: (directoryPath) => ipcRenderer.invoke('list-files', directoryPath),
    openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
    minimize: () => ipcRenderer.invoke('minimize'),
    maximize: () => ipcRenderer.invoke('maximize'),
    close: () => ipcRenderer.invoke('close'),
    openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
    getHomeDirectory: () => ipcRenderer.invoke('get-home-directory'),
    pathExists: (path) => ipcRenderer.invoke('path-exists', path),
    driveList: () => ipcRenderer.invoke('drive-list'),
    getUsername: () => ipcRenderer.invoke('username'),
    isMaximized: () => ipcRenderer.invoke('is-maximized'),
    showContextMenu: (event, file) => ipcRenderer.invoke('show-context-menu', { x: event.x, y: event.y, file }),

    platform: process.platform,
    ipcRenderer: {
        on: (channel, func) => {
            const validChannels = ['window-resize'];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, func);
            }
        },
        send: (channel, data) => {
            const validChannels = ['window-resize'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        }
    }
});
