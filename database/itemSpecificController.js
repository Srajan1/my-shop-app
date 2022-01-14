const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const Item = require("../models/itemModel");
const CostPrice = require("../models/costPriceModel");
const SellingPrice = require("../models/sellingPriceModel");
const sequelize = require("./db");
const { Op } = require("sequelize");
const SaleItemJunction = require("../models/saleItemJunction");
const OrderItemJunction = require("../models/orderItemJunction");
const Sale = require("../models/saleModel");
const Customer = require("../models/customerModel");

ipcMain.on("item-specific-window-loaded", async (event, itemId) => {
  try {
    const itemData = await Item.findOne({
      where: { id: itemId },
      include: [Metric],
    });
    const metrics = await Metric.findAll({});
    const metricArray = [];
    metrics.forEach((metric) => metricArray.push(metric.dataValues));
    const item = {};
    item.id = itemData.dataValues.id;
    item.name = itemData.dataValues.name;
    item.available = itemData.dataValues.available;
    item.hsn = itemData.dataValues.hsn;
    const metric = itemData.dataValues.Metric.dataValues;
    event.sender.send("item-metric-list-fetched", {
      item,
      metric,
      metricArray,
    });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("save-selling-price", async (event, recievedData) => {
  try {
    const itemId = recievedData.itemId,
      data = recievedData.sellingPrice;
    const previousInstance = await SellingPrice.findOne({
      where: {
        itemId,
        current: 1,
      },
    });
    data.current = 1;
    if (previousInstance)
      await SellingPrice.update(
        { toDate: Date(), current: 0 },
        { where: { id: previousInstance.dataValues.id } }
      );
    await SellingPrice.create(data);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("save-cost-price", async (event, recievedData) => {
  try {
    const itemId = recievedData.itemId,
      data = recievedData.costPrice;
    const previousInstance = await CostPrice.findOne({
      where: {
        itemId,
        current: 1,
      },
    });
    data.current = 1;
    if (previousInstance)
      await CostPrice.update(
        { toDate: Date(), current: 0 },
        { where: { id: previousInstance.dataValues.id } }
      );
    await CostPrice.create(data);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("fetch-prices", async (event, data) => {
  try {
    const { itemId, limit, page } = data;
    const costPrices = await CostPrice.findAll({
      where: { itemId },
      limit,
      offset: (page - 1) * limit,
      order: [["fromDate", "DESC"]],
    });
    const sellingPrices = await SellingPrice.findAll({
      where: { itemId },
      limit,
      offset: (page - 1) * limit,
      order: [["fromDate", "DESC"]],
    });
    event.sender.send("prices-fetched", { costPrices, sellingPrices });
  } catch (err) {
    console.log(err);
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("update-item", async (event, data) => {
  try {
    await Item.update(data.item, { where: { id: data.itemId } });
    event.sender.send("item-updated");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("delete-item", async (event, itemId) => {
  const t = await sequelize.transaction();
  try {
    const sales = await SaleItemJunction.findAll({
      where: { itemId },
      transaction: t,
    });
    const orders = await OrderItemJunction.findAll({
      where: { itemId },
      transaction: t,
    });
    if (sales.length) {
      dialog.showErrorBox(
        "Cannot delete item",
        "Item is listed in sales, please remove all sales of this item to delete this item."
      );
    } else if (orders.length) {
      dialog.showErrorBox(
        "Cannot delete item",
        "Item is listed in orders, please remove all orders of this item to delete this item."
      );
    } else {
      await SellingPrice.destroy({ where: { itemId }, transaction: t });
      await CostPrice.destroy({ where: { itemId }, transaction: t });
      await Item.destroy({ where: { id: itemId }, transaction: t });
    }
    t.commit();
    event.sender.send("item-deleted");
  } catch (err) {
    t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("item-sales-loaded", async (event, itemId) => {
  try {
    const saleData = await SaleItemJunction.findAll({
      where: { itemId },
      attributes: [sequelize.fn("DISTINCT", sequelize.col("saleId")), "saleId"],
      
    });
    // var sales = new Array();
    // saleData.forEach(async (sale) => {
    //   const {saleId} = sale.dataValues;
    //   const fetchedSale = await Sale.findOne({where: {id: saleId}, attributes: ['id', 'total', 'paid', 'settled', 'salePlacedDate'], include: [{model: Customer, attributes: ['id', 'name']}]});
    //   sales.push(fetchedSale.dataValues);
    // });
    // console.log(sales);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});
