const Customer = require("../models/customerModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");
const { Op } = require("sequelize");

ipcMain.on("customer-window-loaded", async function (event, query) {
  const pageNumber = query.pageNumber;
  const where = {};
  const limit = query.limit;
  query = query.where;

  if (query.name != null) where.name = { [Op.like]: "%" + query.name + "%" };
  if (query.address != null)
    where.address = { [Op.like]: "%" + query.address + "%" };
  if (query.phone != null)
    where.phoneNumber = { [Op.like]: "%" + query.phone + "%" };

  try {
    const customers = await Customer.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset: (pageNumber - 1) * limit,
      where,
    });

    const customerArray = [];
    const count = customers.count;
    customers.rows.forEach((customer) =>
      customerArray.push(customer.dataValues)
    );

    event.sender.send("fetched-customers", { customerArray, count });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("add-customer", async function (event, customer) {
  try {
    const newCustomer = await Customer.create(customer);
    event.sender.send("customer-added", newCustomer);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});
