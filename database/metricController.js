const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");

ipcMain.on("add-metric", async (event, metric) => {
  try {
    const window = BrowserWindow.getFocusedWindow();
    await Metric.create(metric);
    event.sender.send("added-metric");
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('metric-window-loaded', async(event) => {
    try{
        const metrics = await Metric.findAll();
        const metricArray = [];
        metrics.forEach(metric => metricArray.push(metric.dataValues));
        event.sender.send('metric-list-fetched', metricArray);
    }catch(err){
        dialog.showErrorBox("An error message", err.message);
    }
})