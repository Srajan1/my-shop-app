const Supplier = require("../models/supplierModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");

ipcMain.on("supplier-window-loaded", async function (event, pageNumber) {
    
  try {
    const limit = 2;
    const suppliers = await Supplier.findAndCountAll({
      limit,
      offset: ((pageNumber - 1)*limit),
    });
    const supplierArray = [];
    const count = suppliers.count;
    suppliers.rows.forEach(supplier => supplierArray.push(supplier.dataValues));
    event.sender.send('fetched-suppliers', {supplierArray, count});
    
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
