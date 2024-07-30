var currentFolder = "/home/veniamin/Projects"

document.addEventListener("DOMContentLoaded", () => { loadDirectory(currentFolder) });
document.getElementById("window-button-minimize").addEventListener("click", () => { window.electronAPI.minimize() });
document.getElementById("window-button-maximize").addEventListener("click", () => { window.electronAPI.maximize() });
document.getElementById("window-button-close").addEventListener("click", () => { window.electronAPI.close() });
document.getElementsByTagName("body")[0].addEventListener("keypress", (event) => { if (event.code == "Backslash") { window.electronAPI.openDevTools() } });
document.getElementById("back-arrow").addEventListener("click", () => { loadDirectory(getParentDirectory(currentFolder)); });

async function loadDirectory(directoryPath) {
    console.log(`loading dirrectory ${directoryPath}`)
    const fileContainer = document.getElementById('contents');
    fileContainer.innerHTML = '';

    const files = await window.electronAPI.listFiles(directoryPath);
    files.forEach(file => {
        var item = document.createElement("button");
        item.classList = ["item"];

        var icon = document.createElement("img")
        var name = document.createElement("p")
        name.classList = ["name"]
        name.innerText = file.name

        if (file.isDirectory) {
            icon.src = "../../img/folder.svg"
            item.addEventListener('click', () => { loadDirectory(file.path); })
        } else {
            icon.src = "../../img/text-x-generic.svg"
            item.addEventListener('click', () => { window.electronAPI.openFile(file.path); })
        }

        item.appendChild(icon);
        item.appendChild(name);

        fileContainer.appendChild(item);
    });
    currentFolder = directoryPath;
}

function getParentDirectory(directoryPath) {
    const parts = directoryPath.split('/');
    parts.pop(); // Remove the last part of the path
    return parts.join('/') || '/'; // Join the remaining parts and handle root directory
}