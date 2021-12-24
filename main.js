const { app, BrowserWindow } = require("electron");
const sequelize = require("./database/db.js");
const supplier = require('./database/supplierController')
const metric = require('./database/metricController')
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
