const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require('path');
var http = require('http');

ipcMain.on("error-occured", (event, { heading, message }) => {
  dialog.showErrorBox(heading, message);
});
ipcMain.on("show-message", (event, { heading, message }) => {
  dialog.showMessageBox({ title: heading, message });
});

ipcMain.on("show-save-dialog", (event, name) => {
    
});
