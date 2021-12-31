const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Item = require("./itemModel");
const moment = require('moment')
const CostPrice = sequelize.define(
  "CostPrice",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    fromDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue('fromDate')).format('DD/MM/YYYY h:mm:ss');
    }
    },
    toDate: {
      type: DataTypes.DATE,
      
    },
  },
  {
    sequelize,
    tableName: "costPrices",
    freezeTableName: true,
  }
);

CostPrice.belongsTo(Item, { foreignKey: "itemId", targetKey: "id" });
module.exports = CostPrice;