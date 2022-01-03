const {ipcMain, dialog } = require("electron");
ipcMain.on('error-occured', (event, {heading, message}) => {
    dialog.showErrorBox(heading, message);
})
ipcMain.on('show-message', (event, {heading, message}) => {
    dialog.showMessageBox({title: heading, message});
})