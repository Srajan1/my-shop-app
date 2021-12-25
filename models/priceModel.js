const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/db');

class Price extends Model {};

Price.init({
    id: {
      type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    from: {
        type: DataTypes.DATE,
        allowNull: false
    },
    to: {
        type: DataTypes.DATE,
        allowNull: false    
    }
  }, {
    sequelize,
    tableName: 'prices', freezeTableName: true 
  })
  Price.associate = models => {
    Price.belongsTo(models.Item, {foreignKey: 'itemId', targetKey: 'id'});
}
  module.exports = Price;