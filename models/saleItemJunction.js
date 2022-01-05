const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Item = require('./itemModel')
const Sale = require('./saleModel')

const SaleItemJunction = sequelize.define('SaleItemJunction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "saleItemJunctions",
    freezeTableName: true,
  }
);
SaleItemJunction.belongsTo(Item, {foreignKey: 'itemId', targetKey: 'id'});
SaleItemJunction.belongsTo(Sale, {foreignKey: 'saleId', targetKey: 'id'});

module.exports = SaleItemJunction;
