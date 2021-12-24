const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/db');

class Metric extends Model {};

Metric.init({
    id: {
      type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(10000),
    }
  }, {
    sequelize,
  })
  
  module.exports = Metric;