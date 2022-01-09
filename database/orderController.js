const Order = require("../models/orderModel");
const OrderItemJunction = require("../models/orderItemJunction");
const sequelize = require("./db");
const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const Supplier = require("../models/supplierModel");
const Item = require("../models/itemModel");
const CostPrice = require("../models/costPriceModel");

ipcMain.on("fetch-all-orders", async (event, data) => {
  try {
    const { where, limit, pageNumber } = data;
    const orders = await Order.findAndCountAll({
      where,
      limit,
      offset: (pageNumber - 1) * limit,
      include: [Supplier],
      order: [["createdAt", "DESC"]],
    });
    const orderArray = [];
    orders.rows.forEach((order) => orderArray.push(order.dataValues));
    event.sender.send("orders-fetched", { orderArray, count: orders.count });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("order-window-loaded", async (event) => {
  try {
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
    event.sender.send("supplier-item-fetched", {
      supplierArray,
      itemArray,
      costPriceArray,
    });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("place-order", async (event, query) => {
  const t = await sequelize.transaction();
  try {
    const allItems = query.allItems,
      orderData = query.order;
    const supplierId = orderData.supplierId;
    const order = await Order.create(orderData, {transaction: t});
    const orderId = order.dataValues.id;
    allItems.forEach((item) => (item.orderId = orderId));
    await OrderItemJunction.bulkCreate(allItems, {transaction: t});
    const supplier = await Supplier.findOne({
      where: { id: supplierId },
      transaction: t
    });
    const data = {
      remainingBalance:
        supplier.dataValues.remainingBalance + parseInt(orderData.total),
    };
    await Supplier.update(data, { where: { id: supplierId }, transaction: t});
    t.commit();
    event.sender.send("order-placed");
  } catch (err) {
    console.log(err);
    t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
});
