const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const Item = require("../models/itemModel");


ipcMain.on('item-window-loaded', async(event) => {
    try{
        const metrics = await Metric.findAll();
        const items = await Item.findAll({include: [Metric]});
        const itemArray = [];
        const metricArray = [];
        metrics.forEach(metric => metricArray.push(metric.dataValues));
        items.forEach(item => itemArray.push(item.dataValues));
        
        event.sender.send('item-metric-list-fetched', {metricArray, itemArray});
    }catch(err){
        
        dialog.showErrorBox("An error message", err.message);
    }
})

ipcMain.on('add-item', async(event, item) => {
    try{
        await Item.create(item);
        event.sender.send('item-added');
    }catch(err){
        dialog.showErrorBox("An error message", err.message);
    }
})