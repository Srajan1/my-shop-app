const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/db');

class Supplier extends Model {};

Supplier.init({
    id: {
      type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING
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
    remainingBalance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    tableName: 'suppliers', freezeTableName: true 
  })
  
  module.exports = Supplier;