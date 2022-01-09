const Supplier = require("../models/supplierModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");
const { Op } = require("sequelize");
const Order = require("../models/orderModel");
const SupplierTransaction = require('../models/supplierTransactionModel')

ipcMain.on("supplier-specific-window-loaded", async (event, supplierId) => {
  try {
    const supplierData = await Supplier.findOne({ where: { id: supplierId } });
    const supplier = supplierData.dataValues;
    event.sender.send("supplier-data-fetched", supplier);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('fetch-order-for-supplier', async(event, {supplierId, limit, pageNumber}) => {
  try{  
    const orderData = await Order.findAndCountAll({where: {supplierId}, limit, offset: (pageNumber-1)*limit});
    const count = orderData.count;
    const orderArray = [];
    orderData.rows.forEach(order => orderArray.push(order.dataValues));
    event.sender.send('order-fetched-for-supplier', {orderArray, count});
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on("update-supplier", async (event, data) => {
  try {
    const { supplier, supplierId } = data;
    await Supplier.update(supplier, { where: { id: supplierId } });
    event.sender.send("supplier-updated");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('supplier-transaction-window-loaded', async(event, supplierId) => {
  try{  
    const supplier = await Supplier.findOne({where: {id: supplierId}});
    const supplierTransaction = await SupplierTransaction.findAll({where: {supplierId}, order: [["createdAt", "DESC"]],});
    const supplierTransactionArray = [];
    supplierTransaction.forEach( transaction => {
      supplierTransactionArray.push(transaction.dataValues);
    })
    event.sender.send('supplier-transaction-loaded', ({supplier: supplier.dataValues, transactions: supplierTransactionArray}));
  }catch{
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on('add-supplier-history', async(event, data) => {
  try{
    await SupplierTransaction.create(data);
    event.sender.send('supplier-transaction-added');
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})