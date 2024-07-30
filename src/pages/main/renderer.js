document.addEventListener("DOMContentLoaded", async () => {
    await initializeApp();
});
var currentFolder = "";
async function initializeApp() {
    try {
        var currentFolder = await window.electronAPI.getHomeDirectory();
        console.log(`Current folder set to: ${currentFolder}`);

        await loadDirectory(currentFolder);
        await setUpQuickAccess();

        // Event listeners
        document.getElementById("window-button-minimize").addEventListener("click", window.electronAPI.minimize);
        document.getElementById("window-button-maximize").addEventListener("click", window.electronAPI.maximize);
        document.getElementById("window-button-close").addEventListener("click", window.electronAPI.close);
        document.getElementsByTagName("body")[0].addEventListener("keypress", (event) => { if (event.code === "Backslash") window.electronAPI.openDevTools(); });
        document.getElementById("back-arrow").addEventListener("click", goUpDirectory);
    } catch (error) {
        console.error("Failed to set current folder:", error);
    }
}

async function loadDirectory(directoryPath) {
    currentFolder = directoryPath;
    console.log(`Loading directory ${directoryPath}`);
    const fileContainer = document.getElementById('contents');
    fileContainer.innerHTML = '';

    try {
        const files = await window.electronAPI.listFiles(directoryPath);
        files.forEach(file => {
            var item = document.createElement("button");
            item.classList.add("item");

            var icon = document.createElement("img");
            var name = document.createElement("p");
            name.classList.add("name");
            name.innerText = file.name;

            if (file.isDirectory) {
                icon.src = "../../img/folder.svg";
                item.addEventListener('click', () => { loadDirectory(file.path); });
            } else {
                icon.src = "../../img/text-x-generic.svg";
                item.addEventListener('click', () => { window.electronAPI.openFile(file.path); });
            }

            item.appendChild(icon);
            item.appendChild(name);
            fileContainer.appendChild(item);
        });
    } catch (error) {
        console.error(`Failed to load directory: ${directoryPath}`, error);
    }
    console.log(`current directory is ${currentFolder}`);

}

function getParentDirectory(directoryPath) {
    const defaultPath = (window.electronAPI.platform == "win32") ? "C:\\" : "/"
    const splitter = (window.electronAPI.platform == "win32") ? '\\' : '/'
    const parts = directoryPath.split(splitter);
    parts.pop(); // Remove the last part of the path
    return parts.join(splitter) || defaultPath; // Join the remaining parts and handle root directory
}

function goUpDirectory() {
    loadDirectory(getParentDirectory(currentFolder));
}

async function setUpQuickAccess() {
    var homeFolder = await window.electronAPI.getHomeDirectory();
    const folders = ["Desktop", "Documents", "Music", "Pictures", "Videos", "Downloads"]
    if (window.electronAPI.platform == "win32") {
        folders.forEach(folder => {
            if (window.electronAPI.pathExists(homeFolder + "\\" + folder)) {
                document.getElementById("quick-access-" + folder.toLowerCase()).addEventListener("click", () => { loadDirectory(homeFolder + "\\" + folder); });
            } else {
                document.getElementById("quick-access-" + folder.toLowerCase()).remove()
            }
        });
        document.getElementById("quick-access-trash").addEventListener("click", () => { loadDirectory("C:\\$Recycle.Bin"); });
    } else {
        folders.forEach(folder => {

            if (window.electronAPI.pathExists(homeFolder + "/" + folder)) {
                document.getElementById("quick-access-" + folder.toLowerCase()).addEventListener("click", () => { loadDirectory(homeFolder + "/" + folder); });
            } else {
                document.getElementById("quick-access-" + folder.toLowerCase()).remove()
            }
        });
        document.getElementById("quick-access-trash").addEventListener("click", () => { loadDirectory(homeFolder + "/.local/share/Trash/files"); });
    }
}