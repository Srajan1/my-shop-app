const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const Item = require("../models/itemModel");
const sequelize = require("./db");
const { Op } = require("sequelize");

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
    const metric = itemData.dataValues.Metric.dataValues;
    event.sender.send('item-metric-list-fetched', {item, metric, metricArray});
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('update-item', async (event, data) => {
  try{
    await Item.update(data.item, {where: {id: data.itemId}});
    event.sender.send('item-updated');
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})
