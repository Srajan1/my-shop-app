const Customer = require("../models/customerModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");
const { Op } = require("sequelize");
const Sale = require("../models/saleModel");
const CustomerTransaction = require('../models/customerTransactionModel')

ipcMain.on("customer-specific-window-loaded", async (event, customerId) => {
  try {
    const customerData = await Customer.findOne({ where: { id: customerId } });
    const customer = customerData.dataValues;
    event.sender.send("customer-data-fetched", customer);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('fetch-sale-for-customer', async(event, {customerId, limit, pageNumber}) => {
  try{  
    const saleData = await Sale.findAndCountAll({where: {customerId}, limit, offset: (pageNumber-1)*limit});
    const count = saleData.count;
    const saleArray = [];
    saleData.rows.forEach(sale => saleArray.push(sale.dataValues));
    event.sender.send('sale-fetched-for-customer', {saleArray, count});
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on("update-customer", async (event, data) => {
  try {
    const { customer, customerId } = data;
    await Customer.update(customer, { where: { id: customerId } });
    event.sender.send("customer-updated");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});
