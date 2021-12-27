const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Item = require('./itemModel')
const Order = require('./orderModel')

const OrderItemJunction = sequelize.define('OrderItemJunction', {
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
    tableName: "orderItemJunctions",
    freezeTableName: true,
  }
);
OrderItemJunction.belongsTo(Item, {foreignKey: 'itemId', targetKey: 'id'});
OrderItemJunction.belongsTo(Order, {foreignKey: 'orderId', targetKey: 'id'});

module.exports = OrderItemJunction;
