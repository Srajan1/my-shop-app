const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");
const Item = require("../models/itemModel");

ipcMain.on("add-metric", async (event, metric) => {
  try {
    const window = BrowserWindow.getFocusedWindow();
    await Metric.create(metric);
    event.sender.send("added-metric");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('delete-metric', async(event, {metricId}) => {
  try{
    const items = await Item.findAll({where: {metricId}});
    if(items.length){
      dialog.showErrorBox("Cannot delete metric", `Metric is being used by ${items[0].dataValues.name}`);
    }else{
      await Metric.destroy({where: {id: metricId}});
      event.sender.send('metric-deleted')
    }
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on("metric-window-loaded", async (event) => {
  try {
    const metrics = await Metric.findAll();
    const metricArray = [];
    metrics.forEach((metric) => metricArray.push(metric.dataValues));
    event.sender.send("metric-list-fetched", metricArray);
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});
