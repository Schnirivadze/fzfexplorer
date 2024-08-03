const { Menu, MenuItem, shell, ipcMain } = require('electron');
const fs = require('fs');

function createContextMenu(file) {
    const contextMenu = new Menu();

    contextMenu.append(new MenuItem({
        label: 'Open file',
        click: () => {
            hell.openPath(file.path);
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

    return contextMenu;
}

module.exports = { createContextMenu };