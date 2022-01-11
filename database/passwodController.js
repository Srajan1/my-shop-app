const Password = require("../models/passwordModel");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sequelize = require("./db");
const { Op } = require("sequelize");

ipcMain.on('verify-password', async (event, enteredPassword) => {
    try{
        const passwordData = await Password.findAll({});
        var fetchedPass;
        if(!passwordData.length)
        fetchedPass = '123456';
        else 
        fetchedPass = passwordData[0].dataValues.password
        if(enteredPassword === fetchedPass)
        event.sender.send('successful-login');
        else 
        event.sender.send('unsuccessful-login');
    }catch(err){
        dialog.showErrorBox("An error message", err.message);
    }
})

ipcMain.on('change-password', async(event, {oldPassword, newPassword}) => {
    const t = await sequelize.transaction();
    try{
        const passwordData = await Password.findAll({transactions: t});
        var fetchedPass;
        if(!passwordData.length)
        fetchedPass = '123456';
        else 
        fetchedPass = passwordData[0].dataValues.password;
        if(oldPassword === fetchedPass){
            console.log('here');
            await Password.destroy({ transaction: t, where: {}, truncate: true });
            await Password.create({password: newPassword}, {transaction: t});
            event.sender.send('password-changed');
        }
        else {
            event.sender.send('password-change-failed');
        }
        t.commit();
    }catch(err){
        t.rollback();
        console.log(err);
        dialog.showErrorBox("An error message", err.message);
    }
})