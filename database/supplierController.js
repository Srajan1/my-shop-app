const Supplier = require("../models/supplierModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");
const { Op } = require("sequelize");

ipcMain.on("supplier-window-loaded", async function (event, query) {
  const pageNumber = query.pageNumber;
  const where = {};
  const limit = query.limit;
  query = query.where;

  if (query.name != null) where.name = { [Op.like]: "%" + query.name + "%" };
  if (query.address != null)
    where.address = { [Op.like]: "%" + query.address + "%" };
  if (query.phone != null)
    where.phoneNumber = { [Op.like]: "%" + query.phone + "%" };
  if (query.city != null) where.city = { [Op.like]: "%" + query.city + "%" };
  if (query.state != null) where.state = { [Op.like]: "%" + query.state + "%" };
  if (query.pinCode != null) where.pinCode = { [Op.like]: "%" + query.pinCode + "%" };
  try {
    const suppliers = await Supplier.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset: (pageNumber - 1) * limit,
      where,
    });

    const supplierArray = [];
    const count = suppliers.count;
    suppliers.rows.forEach((supplier) =>
      supplierArray.push(supplier.dataValues)
    );

    event.sender.send("fetched-suppliers", { supplierArray, count });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("fetch-all-suppliers", async (event) => {
  try {
    const supplierData = await Supplier.findAll();
    const suppliers = [];
    supplierData.forEach((supplier) => suppliers.push(supplier.dataValues));
    event.sender.send("all-suppliers-fetched", suppliers);
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
