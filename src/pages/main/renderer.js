const splitter = (window.electronAPI.platform == "win32") ? '\\' : '/'
var openedDirectoryHistory = []
var openedDirectoryOffset = 0

document.addEventListener("DOMContentLoaded", async () => { await initializeApp(); });

async function initializeApp() {
    try {
        getDrives();
        var homedir = await window.electronAPI.getHomeDirectory();
        console.log(`Current folder set to: ${homedir}`);

        openFolder(homedir);
        setArrowsAvailability()
        await setUpQuickAccess();

        // Event listeners
        document.getElementById("window-button-minimize").addEventListener("click", window.electronAPI.minimize);
        document.getElementById("window-button-maximize").addEventListener("click", window.electronAPI.maximize);
        document.getElementById("window-button-close").addEventListener("click", window.electronAPI.close);
        document.getElementsByTagName("body")[0].addEventListener("keypress", (event) => { if (event.code === "Backslash") window.electronAPI.openDevTools(); });
    } catch (error) {
        console.error("Failed to set current folder:", error);
    }
}

async function loadDirectory(directoryPath) {
    console.log(`Loading directory ${directoryPath}`);
    const fileContainer = document.getElementById('contents');
    const fileAmount = document.getElementById('items-amount')
    fileContainer.innerHTML = '';

    try {
        var files = await window.electronAPI.listFiles(directoryPath);
        files = files.filter((file) => file != undefined)
        fileAmount.innerText = (files.length == 1) ? "1 item" : `${files.length} items`
        if (files.length != 0) {
            files.forEach(file => {
                var item = document.createElement("button");
                item.classList.add("item");

                var icon = document.createElement("img");
                var name = document.createElement("p");
                name.classList.add("name");
                name.innerText = file.name;

                if (file.isDirectory) {
                    icon.src = "../../img/folder.svg";
                    item.addEventListener('click', () => { openFolder(file.path) });
                } else {
                    icon.src = "../../img/text-x-generic.svg";
                    item.addEventListener('click', () => { window.electronAPI.openFile(file.path); });
                }

                item.appendChild(icon);
                item.appendChild(name);
                fileContainer.appendChild(item);
            });
        } else {
            fileContainer.innerHTML = `<h1 class="folder-empty">Folder is empty</h1>`
        }
    } catch (error) {
        console.error(`Failed to load directory: ${directoryPath}`, error);
    }
}

const openFolder = (directoryPath) => {
    openedDirectoryHistory = openedDirectoryHistory.slice(0, openedDirectoryHistory.length - openedDirectoryOffset)
    openedDirectoryOffset = 0
    openedDirectoryHistory.push(directoryPath)
    setArrowsAvailability()
    fillInteractablePath()
    loadCurrentDirectory()
}

const getCurrentDirectory = () => openedDirectoryHistory[openedDirectoryHistory.length - 1 - openedDirectoryOffset]

const loadCurrentDirectory = () => loadDirectory(getCurrentDirectory())

function getParentDirectory(directoryPath) {
    const defaultPath = (window.electronAPI.platform == "win32") ? "C:\\" : "/"
    const parts = directoryPath.split(splitter);
    parts.pop(); // Remove the last part of the path
    return parts.join(splitter) || defaultPath; // Join the remaining parts and handle root directory
}

const goUpDirectory = () => {
    openFolder(getParentDirectory(getCurrentDirectory()));
    setArrowsAvailability()
}

const goBackDirectory = () => {
    openedDirectoryOffset++
    setArrowsAvailability()
    fillInteractablePath()
    loadCurrentDirectory()
}

const goForwardDirectory = () => {
    openedDirectoryOffset--
    setArrowsAvailability()
    fillInteractablePath()
    loadCurrentDirectory()
}

const setArrowsAvailability = () => {
    const forwardArrow = document.getElementById("forward-arrow")
    if (openedDirectoryOffset == 0) {//at most recent directory
        if (forwardArrow.classList.contains("arrow-img-active")) {
            forwardArrow.classList.remove("arrow-img-active")
            forwardArrow.classList.add("arrow-img-inactive")
            forwardArrow.removeEventListener("click", goForwardDirectory)
        }
    } else {
        if (forwardArrow.classList.contains("arrow-img-inactive")) {
            forwardArrow.classList.remove("arrow-img-inactive")
            forwardArrow.classList.add("arrow-img-active")
            forwardArrow.addEventListener("click", goForwardDirectory)
        }
    }

    const backArrow = document.getElementById("back-arrow")
    if (openedDirectoryHistory.length - 1 - openedDirectoryOffset == 0) {//at oldest directory
        if (backArrow.classList.contains("arrow-img-active")) {
            backArrow.classList.remove("arrow-img-active")
            backArrow.classList.add("arrow-img-inactive")
            backArrow.removeEventListener("click", goBackDirectory)
        }
    } else {
        if (backArrow.classList.contains("arrow-img-inactive")) {
            backArrow.classList.remove("arrow-img-inactive")
            backArrow.classList.add("arrow-img-active")
            backArrow.addEventListener("click", goBackDirectory)
        }
    }

    const upArrow = document.getElementById("up-arrow")
    console.info(getCurrentDirectory().split(splitter).filter((x) => x != ''))
    if (getCurrentDirectory().split(splitter).filter((x) => x != '').length > 1) {
        if (upArrow.classList.contains("arrow-img-inactive")) {
            upArrow.classList.remove("arrow-img-inactive")
            upArrow.classList.add("arrow-img-active")
            upArrow.addEventListener("click", goUpDirectory)
        }
    } else {
        if (upArrow.classList.contains("arrow-img-active")) {
            upArrow.classList.remove("arrow-img-active")
            upArrow.classList.add("arrow-img-inactive")
            upArrow.removeEventListener("click", goUpDirectory)
        }
    }
}

async function setUpQuickAccess() {
    var homeFolder = await window.electronAPI.getHomeDirectory();
    const folders = ["Desktop", "Documents", "Music", "Pictures", "Videos", "Downloads"]
    if (window.electronAPI.platform == "win32") {
        folders.forEach(folder => {
            if (window.electronAPI.pathExists(homeFolder + "\\" + folder)) {
                document.getElementById("quick-access-" + folder.toLowerCase()).addEventListener("click", () => { openFolder(homeFolder + "\\" + folder); });
            } else {
                document.getElementById("quick-access-" + folder.toLowerCase()).remove()
            }
        });
        document.getElementById("quick-access-trash").addEventListener("click", () => { openFolder("C:\\$Recycle.Bin"); });
    } else {
        folders.forEach(folder => {

            if (window.electronAPI.pathExists(homeFolder + "/" + folder)) {
                document.getElementById("quick-access-" + folder.toLowerCase()).addEventListener("click", () => { openFolder(homeFolder + "/" + folder); });
            } else {
                document.getElementById("quick-access-" + folder.toLowerCase()).remove()
            }
        });
        document.getElementById("quick-access-trash").addEventListener("click", () => { openFolder(homeFolder + "/.local/share/Trash/files"); });
    }
}

async function getDrives() {
    try {

        const drives = await window.electronAPI.driveList();
        if (window.electronAPI.platform != "win32") {
            drives.forEach((drive) => {
                const icon = (drive.isRemovable) ? "media-removable" : "Drive"
                drive.mountpoints.forEach((mountpoint) => {
                    const lastPart = mountpoint.path.substring(mountpoint.path.lastIndexOf(splitter) + 1)
                    if (mountpoint.path.includes(splitter)) document.getElementById("devices").innerHTML += `<button class="navbar-list-element" onclick="loadDirectory('${mountpoint.path}');document.getElementById('current-folder').innerText='${(lastPart == "") ? "This Drive" : lastPart}';"><img src="../../img/${icon}.svg" class="navbar-icon">${(lastPart == "") ? "This Drive" : lastPart}</button>`

                });
            });
        } else {
            drives.forEach((drive) => {
                const icon = (drive.isRemovable) ? "media-removable" : "Drive"
                drive.mountpoints.forEach((mountpoint) => {
                    document.getElementById("devices").innerHTML += `<button class="navbar-list-element" onclick="loadDirectory('${mountpoint.path.replace('\\', "\\\\")}');document.getElementById('current-folder').innerText='${mountpoint.path.replace('\\', "\\\\")}';"><img src="../../img/${icon}.svg" class="navbar-icon">${mountpoint.path}</button>`
                });
            });
        }
    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

const fillInteractablePath = () => {
    const pathWrapper = document.getElementById("path-wrapper")
    pathWrapper.innerHTML = `
    <button class="path-button">This PC</button>
    <span class="path-arrow"><img src="../../img/right-arrow.svg"></span>`

    getCurrentDirectory().split(splitter).filter((folder) => folder != '').forEach((folder) => {
        if (folder.length == 2 && folder[1] == ':') {
            pathWrapper.innerHTML += `
            <button class="path-button">Local Disk (${folder.toUpperCase()})</button>
            <span class="path-arrow"><img src="../../img/right-arrow.svg"></span>`
        } else {
            pathWrapper.innerHTML += `
            <button class="path-button" onclick=openFolder("${getCurrentDirectory().substring(0, getCurrentDirectory().indexOf(folder)) + folder}")>${folder}</button>
            <span class="path-arrow"><img src="../../img/right-arrow.svg"></span>`
        }
    })
    pathWrapper.scrollLeft = 100000000
    if (pathWrapper.scrollWidth > pathWrapper.clientWidth) {
        pathWrapper.classList.add("path-wrapper-overflow")
    } else {
        pathWrapper.classList.remove("path-wrapper-overflow")
    }

}


window.electronAPI.ipcRenderer.on('window-resize', () => {
    const pathWrapper = document.getElementById("path-wrapper")
    pathWrapper.scrollLeft = 100000000
    if (pathWrapper.scrollWidth > pathWrapper.clientWidth) {
        pathWrapper.classList.add("path-wrapper-overflow")
    } else {
        pathWrapper.classList.remove("path-wrapper-overflow")
    }
});