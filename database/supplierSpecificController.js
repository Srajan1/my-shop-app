const Supplier = require("../models/supplierModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");
const { Op } = require("sequelize");
const Order = require("../models/orderModel");
const SupplierTransaction = require("../models/supplierTransactionModel");
const OrderItemJunction = require("../models/orderItemJunction");

ipcMain.on("supplier-specific-window-loaded", async (event, supplierId) => {
  try {
    const supplierData = await Supplier.findOne({ where: { id: supplierId } });
    const supplier = supplierData.dataValues;
    event.sender.send("supplier-data-fetched", supplier);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("delete-supplier", async (event, supplierId) => {
  const t = await sequelize.transaction();
  try {
    await Order.destroy({ where: { supplierId }, transaction: t });
    await OrderItemJunction.destroy({
      where: {
        orderId: {
          [Op.eq]: null,
        },
      },
      transaction: t,
    });
    await SupplierTransaction.destroy({
      where: { supplierId },
      transaction: t,
    });
    await Supplier.destroy({ where: { id: supplierId }, transaction: t });
    event.sender.send("supplier-deleted");
    t.commit();
  } catch (err) {
    console.log(err);
    t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on(
  "fetch-order-for-supplier",
  async (event, { supplierId, limit, pageNumber }) => {
    try {
      const orderData = await Order.findAndCountAll({
        where: { supplierId },
        limit,
        offset: (pageNumber - 1) * limit,
      });
      const count = orderData.count;
      const orderArray = [];
      orderData.rows.forEach((order) => orderArray.push(order.dataValues));
      event.sender.send("order-fetched-for-supplier", { orderArray, count });
    } catch (err) {
      dialog.showErrorBox("An error message", err.message);
    }
  }
);

ipcMain.on("update-supplier", async (event, data) => {
  try {
    const { supplier, supplierId } = data;
    await Supplier.update(supplier, { where: { id: supplierId } });
    event.sender.send("supplier-updated");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("delete-supplier-transaction", async (event, {transactionId}) => {
  try {
    
    await SupplierTransaction.destroy({where: {id: transactionId}});
    event.sender.send("supplier-transaction-added");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("supplier-transaction-window-loaded", async (event, supplierId) => {
  try {
    const supplier = await Supplier.findOne({ where: { id: supplierId } });
    const supplierTransaction = await SupplierTransaction.findAll({
      where: { supplierId },
      order: [["createdAt", "DESC"]],
    });
    const supplierTransactionArray = [];
    supplierTransaction.forEach((transaction) => {
      supplierTransactionArray.push(transaction.dataValues);
    });
    event.sender.send("supplier-transaction-loaded", {
      supplier: supplier.dataValues,
      transactions: supplierTransactionArray,
    });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("add-supplier-history", async (event, data) => {
  try {
    await SupplierTransaction.create(data);
    event.sender.send("supplier-transaction-added");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});
