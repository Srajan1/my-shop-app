const Order = require("../models/orderModel");
const OrderItemJunction = require("../models/orderItemJunction");
const Metric = require("../models/metricModel");
const { ipcMain, dialog } = require("electron");
const Supplier = require("../models/supplierModel");
const Item = require("../models/itemModel");
const CostPrice = require("../models/costPriceModel");
const sequelize = require('./db')

ipcMain.on("order-specific-window-loaded", async (event, data) => {
  try {
    const orderId = data;
    const suppliers = await Supplier.findAll({ order: [["name", "ASC"]] });
    const supplierArray = [];
    suppliers.forEach((supplier) => supplierArray.push(supplier.dataValues));
    const items = await Item.findAll({
      order: [["name", "ASC"]],
      include: [{ model: Metric, attributes: ["name"] }],
    });
    const costPrices = await CostPrice.findAll({ where: { current: 1 } });
    const costPriceArray = [];
    costPrices.forEach((costPrice) =>
      costPriceArray.push(costPrice.dataValues)
    );
    const itemArray = [];
    items.forEach((item) => itemArray.push(item.dataValues));
    const orderData = await Order.findOne({where: {id: orderId}});
    const order = orderData.dataValues;
    const orderItemJunctionData = await OrderItemJunction.findAll({where: {orderId}});
    const orderItemArray = [];
    orderItemJunctionData.forEach(orderItem => orderItemArray.push(orderItem.dataValues));

    event.sender.send("order-specific-data", {
      supplierArray,
      itemArray,
      costPriceArray,
      order,
      orderItemArray
    });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('mark-as-settled', async(event, {orderId, newValue}) => {
  try{
    await Order.update({settled: newValue }, {where: {id: orderId}});
    event.sender.send('order-updated');
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on('update-order', async(event, {allItems, order, orderId}) => {
  try{
    const t = await sequelize.transaction();
    await Order.update(order, {where: {id: orderId}, transaction: t});
    await OrderItemJunction.destroy({where: {orderId}, transaction: t});
    await OrderItemJunction.bulkCreate(allItems, {transaction: t});
    t.commit();
    event.sender.send('order-updated');
  }catch(err){
    console.log(err);
    await t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
})