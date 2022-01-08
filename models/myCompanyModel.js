const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const MyCompany = sequelize.define(
  "MyCompany",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    GSTIN: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber1: {
      type: DataTypes.STRING,
    },
    phoneNumber2: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "myCompany",
    freezeTableName: true,
  }
);

module.exports = MyCompany;
