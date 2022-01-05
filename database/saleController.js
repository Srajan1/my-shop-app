const Sale = require("../models/saleModel");
const SaleItemJunction = require("../models/saleItemJunction");
const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const Customer = require("../models/customerModel");
const Item = require("../models/itemModel");
const SellingPrice = require('../models/sellingPriceModel');

ipcMain.on('fetch-all-sales', async(event, data) => {
  try{
    const {where, limit, pageNumber} = data;
    const sales = await Sale.findAndCountAll({where, limit, offset: (pageNumber-1)*limit, include: [Customer], sale: [["createdAt", "DESC"]],});
    const saleArray = [];
    sales.rows.forEach(sale => saleArray.push(sale.dataValues))
    event.sender.send('sales-fetched', {saleArray, count: sales.count});
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on("sale-window-loaded", async (event) => {
  try {
    const customers = await Customer.findAll({sale: [["name", "ASC"]],});
    const customerArray = [];
    customers.forEach((customer) => customerArray.push(customer.dataValues));
    const items = await Item.findAll({sale: [["name", "ASC"]], include: [{model: Metric, attributes: ['name']}]});
    const sellingPrices = await SellingPrice.findAll({where: {current: 1}});
    const sellingPriceArray = [];
    sellingPrices.forEach(sellingPrice => sellingPriceArray.push(sellingPrice.dataValues));
    
    const itemArray = [];
    items.forEach((item) => itemArray.push(item.dataValues));
    event.sender.send('customer-item-fetched', {customerArray, itemArray, sellingPriceArray})
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('place-sale', async (event, data) => {
  try{
    const allItems = data.allItems, saleData = data.sale;
    const sale = await Sale.create(saleData);
    const saleId = sale.dataValues.id;
    allItems.forEach(item => item.saleId = saleId);
    await SaleItemJunction.bulkCreate(allItems);
    event.sender.send('sale-placed');
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})