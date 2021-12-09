const Supplier = require("../models/supplierModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");

ipcMain.on("supplier-window-loaded", async function (event, pageNumber) {
    
  try {
    const suppliers = await Supplier.findAll({
      limit: 2,
      offset: ((pageNumber - 1)*pageNumber),
    });
    const supplierArray = [];
    suppliers.forEach(supplier => supplierArray.push(supplier.dataValues));
    event.sender.send('fetched-suppliers', supplierArray);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("add-supplier", async function (event, supplier) {
  try {
    const newSupplier = await Supplier.create(supplier);
    event.sender.send("supplier-added", newSupplier);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});
