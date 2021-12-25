const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Metric = require("./metricModel");
class Item extends Model {}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metricId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    available: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    incoming: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "items",
    freezeTableName: true,
  }
);

module.exports = Item;
