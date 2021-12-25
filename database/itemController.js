const Metric = require("../models/metricModel");
const { BrowserWindow, ipcMain, dialog } = require("electron");
const Item = require("../models/itemModel");


ipcMain.on('item-window-loaded', async(event, queryData) => {
    
    try{
        const metrics = await Metric.findAll();
        const items = await Item.findAndCountAll({limit: queryData.perPage, offset: (queryData.pageNumber-1)*queryData.perPage,include: [Metric]});
        
        const itemArray = [];
        const metricArray = [];
        metrics.forEach(metric => metricArray.push(metric.dataValues));
        items.rows.forEach(item => itemArray.push(item.dataValues));
        const itemCount = items.count;
        event.sender.send('item-metric-list-fetched', {metricArray, itemArray, itemCount});
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