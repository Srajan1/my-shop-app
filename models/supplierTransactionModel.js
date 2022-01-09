const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Supplier = require("./supplierModel");
const moment = require('moment')
const SupplierTransaction = sequelize.define(
  "SupplierTransaction",
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
    tableName: "supplierTransactions",
    freezeTableName: true,
  }
);

SupplierTransaction.belongsTo(Supplier, { foreignKey: "supplierId", targetKey: "id" });
module.exports = SupplierTransaction;
