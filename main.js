const { app, BrowserWindow } = require("electron");
const sequelize = require("./database/db.js");
const order = require('./database/orderController')
const supplier = require('./database/supplierController')
const metric = require('./database/metricController')
const item = require('./database/itemController')
const itemSpecific = require('./database/itemSpecificController');
const orderSpecific = require('./database/orderSpecificController');
require('./utilities')
sequelize
  .sync()
  .then(() => {
    console.log("created");
  })
  .catch((err) => {
    console.log(err);
  });

app.on("ready", () => {
  let win = new BrowserWindow({
    show: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  win.loadFile('./frontend/index.html')
  win.maximize();
  win.on('ready-to-show', ()=>{
    win.show();
  })
});
