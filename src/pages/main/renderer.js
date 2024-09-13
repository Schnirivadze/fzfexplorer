// Constants
const PLATFORM = window.electronAPI.platform;
const SPLITTER = PLATFORM === "win32" ? '\\' : '/';
let openedDirectoryHistory = [];
let openedDirectoryOffset = 0;

// Initialize the app once DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeApp);

// Application Initialization
async function initializeApp() {
    try {
        await setupWindowControls();
        await setupFileSystem();
        setupEventListeners();
    } catch (error) {
        console.error("Failed to initialize the application:", error);
    }
}

// Setup window controls (minimize, maximize, close)
async function setupWindowControls() {
    document.getElementById("window-button-minimize").addEventListener("click", window.electronAPI.minimize);
    document.getElementById("window-button-maximize").addEventListener("click", window.electronAPI.maximize);
    document.getElementById("window-button-close").addEventListener("click", window.electronAPI.close);
}

// Setup file system (home directory, quick access, drives)
async function setupFileSystem() {
    const homeDirectory = await window.electronAPI.getHomeDirectory();
    console.log(`Current folder set to: ${homeDirectory}`);

    openFolder(homeDirectory);
    updateNavigationArrows();
    await setupQuickAccess();
    await loadDrives();
}

// Setup general event listeners
function setupEventListeners() {
    document.body.addEventListener("keypress", handleKeyPress);
}

// Handle key press events
function handleKeyPress(event) {
    if (event.code === "Backslash") {
        window.electronAPI.openDevTools();
    }
}

// Load and display directory contents
async function loadDirectory(directoryPath) {
    const fileContainer = document.getElementById('contents');
    const fileAmount = document.getElementById('items-amount');
    fileContainer.innerHTML = '';

    try {
        let files = await window.electronAPI.listFiles(directoryPath);
        files = files.filter(file => file !== undefined);

        fileAmount.innerText = `${files.length} item${files.length !== 1 ? 's' : ''}`;

        if (files.length === 0) {
            displayEmptyFolderMessage(fileContainer);
        } else {
            files.forEach(file => createFileElement(file, fileContainer));
        }
    } catch (error) {
        console.error(`Failed to load directory: ${directoryPath}`, error);
    }
}

// Create an element for each file or folder
function createFileElement(file, container) {
    const item = document.createElement("button");
    item.classList.add("item");

    const icon = document.createElement("img");
    const name = document.createElement("p");
    name.classList.add("name");
    name.innerText = file.name;

    icon.src = file.isDirectory ? "../../img/folder.svg" : "../../img/text-x-generic.svg";
    item.addEventListener('click', () => {
        file.isDirectory ? openFolder(file.path) : window.electronAPI.openFile(file.path);
    });
    item.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        window.electronAPI.showContextMenu(event, file);
    });

    item.appendChild(icon);
    item.appendChild(name);
    container.appendChild(item);
}

// Display a message when the folder is empty
function displayEmptyFolderMessage(container) {
    container.innerHTML = `<h1 class="folder-empty">Folder is empty</h1>`;
}

// Open a folder and manage history
function openFolder(directoryPath) {
    updateDirectoryHistory(directoryPath);
    updateNavigationArrows();
    updatePathDisplay();
    loadCurrentDirectory();
}

// Update the directory history and offset
function updateDirectoryHistory(directoryPath) {
    openedDirectoryHistory = openedDirectoryHistory.slice(0, openedDirectoryHistory.length - openedDirectoryOffset);
    openedDirectoryOffset = 0;
    openedDirectoryHistory.push(directoryPath);
}

// Get the current directory
function getCurrentDirectory() {
    return openedDirectoryHistory[openedDirectoryHistory.length - 1 - openedDirectoryOffset];
}

// Load the contents of the current directory
function loadCurrentDirectory() {
    loadDirectory(getCurrentDirectory());
}

// Get the parent directory path
function getParentDirectory(directoryPath) {
    const defaultPath = PLATFORM === "win32" ? "C:\\" : "/";
    const parts = directoryPath.split(SPLITTER).filter(Boolean);
    parts.pop();
    return parts.join(SPLITTER) || defaultPath;
}

// Navigate up to the parent directory
function goUpDirectory() {
    openFolder(getParentDirectory(getCurrentDirectory()));
    updateNavigationArrows();
}

// Navigate back to the previous directory in history
function goBackDirectory() {
    openedDirectoryOffset++;
    updateNavigationArrows();
    updatePathDisplay();
    loadCurrentDirectory();
}

// Navigate forward to the next directory in history
function goForwardDirectory() {
    openedDirectoryOffset--;
    updateNavigationArrows();
    updatePathDisplay();
    loadCurrentDirectory();
}

// Update the availability of navigation arrows (back, forward, up)
function updateNavigationArrows() {
    updateArrowState("forward-arrow", openedDirectoryOffset === 0, goForwardDirectory);
    updateArrowState("back-arrow", openedDirectoryHistory.length - 1 - openedDirectoryOffset === 0, goBackDirectory);
    updateArrowState("up-arrow", getCurrentDirectory().split(SPLITTER).filter(x => x).length > 1, goUpDirectory);
}

// Update the state of an individual arrow (active/inactive)
function updateArrowState(arrowId, isInactive, clickHandler) {
    const arrow = document.getElementById(arrowId);
    if (isInactive) {
        arrow.classList.replace("arrow-img-active", "arrow-img-inactive");
        arrow.removeEventListener("click", clickHandler);
    } else {
        arrow.classList.replace("arrow-img-inactive", "arrow-img-active");
        arrow.addEventListener("click", clickHandler);
    }
}

// Setup quick access for common folders
async function setupQuickAccess() {
    const homeFolder = await window.electronAPI.getHomeDirectory();
    const folders = ["Desktop", "Documents", "Music", "Pictures", "Videos", "Downloads"];
    const trashPath = PLATFORM === "win32" ? "C:\\$Recycle.Bin" : `${homeFolder}/.local/share/Trash/files`;

    folders.forEach(folder => {
        const folderPath = `${homeFolder}${SPLITTER}${folder}`;
        setupQuickAccessItem(folder.toLowerCase(), folderPath);
    });

    setupQuickAccessItem("trash", trashPath);
}

// Setup a single quick access item
function setupQuickAccessItem(folderId, folderPath) {
    const element = document.getElementById(`quick-access-${folderId}`);
    if (element) {
        window.electronAPI.pathExists(folderPath)
            .then(exists => {
                if (exists) {
                    element.addEventListener("click", () => openFolder(folderPath));
                } else {
                    element.remove();
                }
            });
    }
}

// Load and display available drives
async function loadDrives() {
    try {

        const drives = await window.electronAPI.driveList();
        if (PLATFORM != "win32") {
            drives.forEach((drive) => {
                const icon = (drive.isRemovable) ? "media-removable" : "Drive"
                drive.mountpoints.forEach((mountpoint) => {
                    const lastPart = mountpoint.path.substring(mountpoint.path.lastIndexOf(SPLITTER) + 1)
                    if (mountpoint.path.includes(SPLITTER)) document.getElementById("devices").innerHTML += `<button class="navbar-list-element" onclick="loadDirectory('${mountpoint.path}');document.getElementById('current-folder').innerText='${(lastPart == "") ? "This Drive" : lastPart}';" > <img src="../../img/${icon}.svg" class="navbar-icon">${(lastPart == "") ? "This Drive" : lastPart}</button>`

                });
            });
        } else {
            drives.forEach((drive) => {
                const icon = (drive.isRemovable) ? "media-removable" : "Drive"
                drive.mountpoints.forEach((mountpoint) => {
                    document.getElementById("devices").innerHTML += `<button class="navbar-list-element" onclick="loadDirectory('${mountpoint.path.replace('\\', "\\\\")}');document.getElementById('current-folder').innerText='${mountpoint.path.replace('\\', "\\\\")}';" > <img src="../../img/${icon}.svg" class="navbar-icon">${mountpoint.path}</button>`
                });
            });
        }
    } catch (err) {
        console.error(`Error: ${ err }`);
    }
}

// Get the last part of a path
function getLastPathPart(path) {
    return path.substring(path.lastIndexOf(SPLITTER) + 1);
}

// Create the HTML for a drive button
function createDriveButtonHTML(path, icon, label) {
    const sanitizedPath = PLATFORM === "win32" ? path.replace(/\\/g, "\\\\") : path;
    return `<button class="navbar-list-element" onclick="loadDirectory('${sanitizedPath}'); document.getElementById('current-folder').innerText='${label}';"><img src="../../img/${icon}.svg" class="navbar-icon">${label}</button>`;
}

// Update the interactable path display
function updatePathDisplay() {
    const pathWrapper = document.getElementById("path-wrapper");
    pathWrapper.innerHTML = `<button class="path-button">This PC</button><span class="path-arrow"><img src="../../img/right-arrow.svg"></span>`;

    const pathParts = getCurrentDirectory().split(SPLITTER).filter(Boolean);
    pathParts.forEach((folder, index) => {
        const folderPath = constructFolderPath(pathParts.slice(0, index + 1).join(SPLITTER));
        pathWrapper.innerHTML += createPathButtonHTML(folderPath, folder);
    });

    pathWrapper.scrollLeft = pathWrapper.scrollWidth;
    togglePathWrapperOverflow(pathWrapper);
}

// Construct the full path to a folder
function constructFolderPath(folderPath) {
    return PLATFORM === "win32" ? folderPath.replace(/\\/g, "\\\\") : folderPath;
}

// Create the HTML for a path button
function createPathButtonHTML(folderPath, folderName) {
    return `<button class="path-button" onclick="openFolder('${folderPath}')">${folderName}</button><span class="path-arrow"><img src="../../img/right-arrow.svg"></span>`;
}

// Toggle overflow behavior for the path wrapper
function togglePathWrapperOverflow(wrapper) {
    wrapper.style.overflowX = wrapper.scrollWidth > wrapper.clientWidth ? "scroll" : "hidden";
}