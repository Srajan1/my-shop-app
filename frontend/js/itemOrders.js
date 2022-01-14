const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const itemId = sessionStorage.getItem("itemId");

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('item-orders-loaded')
})