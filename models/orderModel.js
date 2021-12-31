const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Supplier = require('./supplierModel')
const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    paid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      settled: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    orderPlacedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    orderExpectedDate:{
        type: DataTypes.DATE,
    }
  },
  {
    sequelize,
    tableName: "orders",
    freezeTableName: true,
  }
);

Order.belongsTo(Supplier, {foreignKey: 'supplierId', targetKey: 'id'});
module.exports = Order;
