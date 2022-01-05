const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Customer = require("./customerModel");
const Sale = sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    settled: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    salePlacedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    saleExpectedDate: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "sales",
    freezeTableName: true,
  }
);

Sale.belongsTo(Customer, { foreignKey: "customerId", targetKey: "id" });
module.exports = Sale;
