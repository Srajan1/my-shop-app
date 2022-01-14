const Sale = require("../models/saleModel");
const SaleItemJunction = require("../models/saleItemJunction");
const Metric = require("../models/metricModel");
const { ipcMain, dialog } = require("electron");
const Customer = require("../models/customerModel");
const Item = require("../models/itemModel");
const SellingPrice = require("../models/sellingPriceModel");
const sequelize = require("./db");

ipcMain.on("sale-specific-window-loaded", async (event, data) => {
  try {
    const saleId = data;
    const customers = await Customer.findAll({ sale: [["name", "ASC"]] });
    const customerArray = [];
    customers.forEach((customer) => customerArray.push(customer.dataValues));
    const items = await Item.findAll({
      sale: [["name", "ASC"]],
      include: [{ model: Metric, attributes: ["name"] }],
    });
    const sellingPrices = await SellingPrice.findAll({ where: { current: 1 } });
    const sellingPriceArray = [];
    sellingPrices.forEach((sellingPrice) =>
      sellingPriceArray.push(sellingPrice.dataValues)
    );
    const itemArray = [];
    items.forEach((item) => itemArray.push(item.dataValues));
    const saleData = await Sale.findOne({ where: { id: saleId } });
    const sale = saleData.dataValues;
    const saleItemJunctionData = await SaleItemJunction.findAll({
      where: { saleId },
    });
    const saleItemArray = [];
    saleItemJunctionData.forEach((saleItem) =>
      saleItemArray.push(saleItem.dataValues)
    );

    event.sender.send("sale-specific-data", {
      customerArray,
      itemArray,
      sellingPriceArray,
      sale,
      saleItemArray,
    });
  } catch (err) {
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on('fetch-sold-item-data', async(event, saleId) => {
  try{
    const soldItemData = await SaleItemJunction.findAll({where: {saleId}, include: [Item]})
    const products = [];
    soldItemData.forEach(data => {
      const description = data.dataValues.Item.dataValues.name
      const quantity = data.dataValues.quantity;
      const price = (data.dataValues.price/data.dataValues.quantity); 
      products.push({description: description, quantity, price, 'tax': 0});
    })
    event.sender.send('sold-items-fetched', products);
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on('fetch-pakka-sold-item-data', async(event, query) => {
  try{
    const {saleId, gstValue} = query;
    const soldItemData = await SaleItemJunction.findAll({where: {saleId}, include: [Item]})
    const products = [];
    soldItemData.forEach(data => {
      if(!data.dataValues.Item.dataValues.hsn){
        throw {message: `HSN Value not available for  ${data.dataValues.Item.dataValues.name}`};
      }
      const description = `${data.dataValues.Item.dataValues.name} HSN: ${data.dataValues.Item.dataValues.hsn}`
      const quantity = data.dataValues.quantity;
      const price = (data.dataValues.price/data.dataValues.quantity); 
      products.push({description: description, quantity, price, 'tax': parseInt(gstValue)});
    })
    event.sender.send('pakka-sold-items-fetched', products);
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on('fetch-customer-data-for-sale', async (event, customerId) => {
  try{
    const customerData = await Customer.findOne({ where: { id: customerId } });
    const customer = customerData.dataValues;
    event.sender.send("customer-data-fetched-for-sale", customer);
  }catch(err){
    dialog.showErrorBox("An error message", err.message);
  }
})

ipcMain.on("mark-sale-as-settled", async (event, { saleId, newValue }) => {
  const t = await sequelize.transaction();
  try {
    if (newValue === 0) {
      const items = await SaleItemJunction.findAll({
        where: { saleId },
        attributes: ["itemId", "quantity"],
      });
      const itemsArray = [];
      items.forEach((item) => itemsArray.push(item.dataValues));
      itemsArray.forEach(async (item) => {
        const { itemId, quantity } = item;
        if (quantity == null) quantity = 0;
        const itemDetails = await Item.findOne({
          where: { id: itemId },
          attributes: ["available"],
        });
        const data = { available: itemDetails.available + quantity };
        Item.update(data, { where: { id: itemId }, transaction: t })
          .then(() => {
            Sale.update(
              { settled: newValue },
              { where: { id: saleId }, transaction: t }
            )
              .then(() => {
                t.commit();
              })
              .catch(async (err) => {
                await t.rollback();
                dialog.showErrorBox("An error message", err.message);
              });
          })
          .catch(async (err) => {
            await t.rollback();
            dialog.showErrorBox("An error message", err.message);
          });
      });
    } else {
      const items = await SaleItemJunction.findAll({
        where: { saleId },
        attributes: ["itemId", "quantity"],
      });
      const itemsArray = [];
      items.forEach((item) => itemsArray.push(item.dataValues));
      itemsArray.forEach(async (item) => {
        const { itemId, quantity } = item;
        if (quantity == null) quantity = 0;
        const itemDetails = await Item.findOne({
          where: { id: itemId },
          attributes: ["available"],
        });
        if (itemDetails.available < quantity) itemDetails.available = quantity;
        const data = { available: itemDetails.available - quantity };
        Item.update(data, { where: { id: itemId }, transaction: t })
          .then(() => {
            Sale.update(
              { settled: newValue },
              { where: { id: saleId }, transaction: t }
            )
              .then(() => {
                t.commit();
              })
              .catch(async (err) => {
                await t.rollback();
                dialog.showErrorBox("An error message", err.message);
              });
          })
          .catch(async (err) => {
            await t.rollback();
            dialog.showErrorBox("An error message", err.message);
          });
      });
    }
    event.sender.send("sale-updated");
  } catch (err) {
    await t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
});

ipcMain.on("update-sale", async (event, { allItems, sale, saleId }) => {
  const t = await sequelize.transaction();
  try {
    const customerId = sale.customerId;
    const currentPrice = await Sale.findOne({ where: { id: saleId }, transaction: t });
    const customerData = await Customer.findOne({ where: { id: customerId }, transaction: t });
    const data = {
      totalDeal: parseInt(customerData.dataValues.totalDeal) - parseInt(currentPrice.dataValues.total)+parseInt(sale.total)
    };
    await Customer.update(data, { where: { id: customerId }, transaction: t })
    await Sale.update(sale, { where: { id: saleId }, transaction: t });
    await SaleItemJunction.destroy({ where: { saleId }, transaction: t });
    await SaleItemJunction.bulkCreate(allItems, { transaction: t });
    t.commit();
    event.sender.send("sale-updated");
  } catch (err) {
    console.log(err);
    await t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
});


ipcMain.on('delete-sale', async(event, data) => {
  const t = await sequelize.transaction();
  try{
    const {saleId, totalDeal, customerId} = data;
    
    await SaleItemJunction.destroy({where: {saleId}, transaction: t});
    
    await Sale.destroy({where: {id: saleId}, transaction: t});
    
    const customer = await Customer.findOne({where: {id: customerId}, transaction: t});
    const updateData = {
      totalDeal: customer.dataValues.totalDeal-totalDeal
    };
    await Customer.update(updateData, {where: {id: customerId}, transaction: t});
    
    t.commit();
    
    event.sender.send('sale-deleted');
  }catch(err){
    
    t.rollback();
    dialog.showErrorBox("An error message", err.message);
  }
})