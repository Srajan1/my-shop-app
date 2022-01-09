const Company = require("../models/myCompanyModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");
const { Op } = require("sequelize");

ipcMain.on("company-window-loaded", async (event) => {
  try {
    const details = await Company.findAll();
    if (details.length === 0) {
      event.sender.send("company-details-not-available");
    } else {
      event.sender.send("company-details-fetched", details[0].dataValues);
    }
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("save-company-details", async (event, data) => {
  const t = await sequelize.transaction();
  try {
    await Company.destroy({ transaction: t, where: {}, truncate: true });
    await Company.create(data, { transaction: t });
    event.sender.send('company-details-updated');
    t.commit();
  } catch (err) {
    t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
});
