const {ipcMain, dialog } = require("electron");
ipcMain.on('error-occured', (event, {heading, message}) => {
    dialog.showErrorBox(heading, message);
})