const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Customer = require("./customerModel");
const moment = require('moment')
const CustomerTransaction = sequelize.define(
  "CustomerTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    paid: {
      type: DataTypes.INTEGER
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return moment(this.getDataValue('fromDate')).format('DD/MM/YYYY h:mm:ss');
    }
    },
    paymentMode: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "customerTransactions",
    freezeTableName: true,
  }
);

CustomerTransaction.belongsTo(Customer, { foreignKey: "customerId", targetKey: "id" });
module.exports = CustomerTransaction;
