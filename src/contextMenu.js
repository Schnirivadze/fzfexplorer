const { Menu, MenuItem, shell, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

function createContextMenu(file) {
    const contextMenu = new Menu();

    if (file.isDirectory) {
        contextMenu.append(new MenuItem({
            label: 'Open folder',
            click: () => {
                const focusedWindow = BrowserWindow.getFocusedWindow();
                if (focusedWindow) {
                    focusedWindow.webContents.send('open-file', file.path);
                }
            }
        }));

        contextMenu.append(new MenuItem({
            label: 'Delete folder',
            click: async () => {
                try {
                    // Check if directory is empty
                    fs.readdir(file.path, async (err, files) => {
                        if (err) {
                            console.error('Error reading directory:', err);
                            return;
                        }

                        if (files.length === 0) {
                            // Directory is empty
                            fs.rmSync(file.path, { recursive: true, force: true });
                        } else {
                            // Directory is not empty, ask for confirmation
                            const focusedWindow = BrowserWindow.getFocusedWindow();
                            if (focusedWindow) {
                                const result = await dialog.showMessageBox(focusedWindow, {
                                    type: 'warning',
                                    title: 'Confirm Delete',
                                    message: 'The folder is not empty. Are you sure you want to delete it?',
                                    buttons: ['Yes', 'No']
                                });

                                if (result.response === 0) { // 0 is the index of 'Yes'
                                    fs.rmSync(file.path, { recursive: true, force: true });
                                }
                            }
                        }
                    });
                } catch (err) {
                    console.error('Failed to delete folder:', err);
                }
            }
        }));

    } else {
        contextMenu.append(new MenuItem({
            label: 'Open file',
            click: () => {
                shell.openPath(file.path);
            }
        }));

        contextMenu.append(new MenuItem({
            label: 'Delete',
            click: () => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Failed to delete file:', err);
                });
            }
        }));
    }

    return contextMenu;
}

module.exports = { createContextMenu };