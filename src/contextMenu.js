const { Menu, BrowserWindow, dialog, shell } = require('electron');
const fs = require('fs').promises;

// Setup context menu
function setupContextMenu(ipcMain) {
    ipcMain.on('show-context-menu', async (event, { event: clickEvent, file }) => {
        const template = getContextMenuTemplate(file);
        const menu = Menu.buildFromTemplate(template);
        const win = BrowserWindow.fromWebContents(event.sender);

        menu.popup({
            window: win,
            x: clickEvent.x,
            y: clickEvent.y
        });
    });
}

// Get context menu template based on file type (directory or file)
function getContextMenuTemplate(file) {
    const template = [
        { label: 'Open', click: () => shell.openPath(file.path) },
        { type: 'separator' }
    ];

    if (file.isDirectory) {
        template.push({
            label: 'Delete',
            click: () => confirmAndDeleteDirectory(file.path)
        });
    } else {
        template.push({
            label: 'Delete',
            click: () => confirmAndDeleteFile(file.path)
        });
    }

    return template;
}

// Confirm and delete directory with all its contents
async function confirmAndDeleteDirectory(directoryPath) {
    const options = {
        type: 'warning',
        buttons: ['Cancel', 'Delete'],
        defaultId: 1,
        title: 'Delete Directory',
        message: 'Are you sure you want to delete this directory and all its contents?',
    };

    const { response } = await dialog.showMessageBox(options);

    if (response === 1) {
        try {
            await fs.rm(directoryPath, { recursive: true, force: true });
        } catch (error) {
            console.error('Failed to delete directory:', error);
        }
    }
}

// Confirm and delete a single file
async function confirmAndDeleteFile(filePath) {
    const options = {
        type: 'warning',
        buttons: ['Cancel', 'Delete'],
        defaultId: 1,
        title: 'Delete File',
        message: 'Are you sure you want to delete this file?',
    };

    const { response } = await dialog.showMessageBox(options);

    if (response === 1) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    }
}

module.exports = { setupContextMenu };
