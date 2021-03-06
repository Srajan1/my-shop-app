const { app, BrowserWindow } = require("electron");
const sequelize = require("./database/db.js");
require('./database/myCompanyController');
require('./database/orderController')
require('./database/supplierController')
require('./database/metricController')
require('./database/itemController')
require('./database/itemSpecificController');
require('./database/orderSpecificController');
require('./database/supplierSpecificController');
require('./database/customerSpecificController');
require('./database/customerController');
require('./database/saleController');
require('./database/saleSpecificController');
require('./database/passwodController')
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
  win.loadFile('./frontend/passwordProtection.html')
  win.maximize();
  win.on('ready-to-show', ()=>{
    win.show();
  })
});
