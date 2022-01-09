const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Metric = require("./metricModel");

const Customer = sequelize.define(
  "Customer",
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
    phoneNumber: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING
    },
    pinCode: {
      type: DataTypes.STRING
    },
    state: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING(10000),
    },
    totalDeal: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "customers",
    freezeTableName: true,
  }
);

// Customer.belongsTo(Metric, { foreignKey: "metricId", targetKey: "id" });
module.exports = Customer;
