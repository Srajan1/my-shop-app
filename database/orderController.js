const Order = require("../models/orderModel");
const OrderItemJunction = require("../models/orderItemJunction");
const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const Supplier = require("../models/supplierModel");
const Item = require("../models/itemModel");
const CostPrice = require('../models/costPriceModel');

ipcMain.on("order-window-loaded", async (event) => {
  try {
    const suppliers = await Supplier.findAll({order: [["name", "ASC"]],});
    const supplierArray = [];
    suppliers.forEach((supplier) => supplierArray.push(supplier.dataValues));
    const items = await Item.findAll({order: [["name", "ASC"]], include: [{model: Metric, attributes: ['name']}]});
    const costPrices = await CostPrice.findAll({where: {current: 1}});
    const costPriceArray = [];
    costPrices.forEach(costPrice => costPriceArray.push(costPrice.dataValues));
    
    const itemArray = [];
    items.forEach((item) => itemArray.push(item.dataValues));
    event.sender.send('supplier-item-fetched', {supplierArray, itemArray, costPriceArray})
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('place-order', async (event, data) => {
  try{
    const allItems = data.allItems, orderData = data.order;
    const order = await Order.create(orderData);
    const orderId = order.dataValues.id;
    allItems.forEach(item => item.orderId = orderId);
    await OrderItemJunction.bulkCreate(allItems);
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})