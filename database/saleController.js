const Sale = require("../models/saleModel");
const SaleItemJunction = require("../models/saleItemJunction");
const Metric = require("../models/metricModel");
const sequelize = require("./db");
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

ipcMain.on('place-sale', async (event, query) => {
  const t = await sequelize.transaction();
  try{
    const allItems = query.allItems, saleData = query.sale;
    const {customerId} = saleData;
    const sale = await Sale.create(saleData, {transaction: t});
    const saleId = sale.dataValues.id;
    allItems.forEach(item => item.saleId = saleId);
    await SaleItemJunction.bulkCreate(allItems, {transaction: t});
    const customer = await Customer.findOne({
      where: { id: customerId },
      transaction: t
    });
    const data = {
      totalDeal:
        customer.dataValues.totalDeal + parseInt(saleData.total),
    };
    await Customer.update(data, { where: { id: customerId }, transaction: t});
    t.commit();
    event.sender.send('sale-placed');
  }catch(err){
    t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
})