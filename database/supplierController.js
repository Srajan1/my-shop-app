const Supplier = require('../models/supplierModel');
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require('./db');

ipcMain.on('supplier-window-loaded', async function(event) {
    
});

ipcMain.on('add-supplier', async function(event, supplier) {
    try{
        const newSupplier = await Supplier.create(supplier);
        event.sender.send('supplier-added', newSupplier);
    }catch(err){
        dialog.showErrorBox('An error message', err.message);
    }
})