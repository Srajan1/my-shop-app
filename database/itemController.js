const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const Item = require("../models/itemModel");
const sequelize = require("./db");
const { Op } = require("sequelize");

ipcMain.on("item-window-loaded", async (event, queryData) => {
  try {
    const where = {};
    if (queryData.where.name != null)
      where.name = { [Op.like]: "%" + queryData.where.name + "%" };
    if (queryData.where.hsn != null)
      where.hsn = { [Op.like]: "%" + queryData.where.hsn + "%" };
    const metrics = await Metric.findAll();
    const items = await Item.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: queryData.perPage,
      offset: (queryData.pageNumber - 1) * queryData.perPage,
      include: [Metric],
    });

    const itemArray = [];
    const metricArray = [];
    metrics.forEach((metric) => metricArray.push(metric.dataValues));
    items.rows.forEach((item) => itemArray.push(item.dataValues));
    const itemCount = items.count;

    event.sender.send("item-metric-list-fetched", {
      metricArray,
      itemArray,
      itemCount,
    });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("add-item", async (event, item) => {
  try {
    await Item.create(item);
    event.sender.send("item-added");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});
