document.addEventListener('DOMContentLoaded', async () => {
    const directoryPath = '/home/veniamin/Projects/Software';
    // await loadDirectory(directoryPath);
});

// async function loadDirectory(directoryPath) {
//     const fileContainer = document.getElementById('file-container');
//     fileContainer.innerHTML = ''; // Clear existing contents

//     const files = await window.electronAPI.listFiles(directoryPath);
//     files.forEach(file => {
//         const button = document.createElement('button');
//         button.textContent = file.name;
//         button.addEventListener('click', () => {
//             if (file.isDirectory) {
//                 loadDirectory(file.path); // Load new directory if button represents a folder
//             } else {
//                 window.electronAPI.openFile(file.path); // Send message to main process to open the file
//             }
//         });
//         fileContainer.appendChild(button);
//     });
// }