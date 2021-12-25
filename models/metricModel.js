const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Item = require("./itemModel");

class Metric extends Model {}

Metric.init(
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
    description: {
      type: DataTypes.STRING(10000),
    },
  },
  {
    sequelize,
    tableName: 'metrics', freezeTableName: true 
  }
);
Item.Metric = Item.belongsTo(Metric)
module.exports = Metric;
