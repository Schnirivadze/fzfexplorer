document.getElementById("window-button-minimize").addEventListener("click", () => { window.electronAPI.minimize() })
document.getElementById("window-button-maximize").addEventListener("click", () => { window.electronAPI.maximize() })
document.getElementById("window-button-close").addEventListener("click", () => { window.electronAPI.close() })