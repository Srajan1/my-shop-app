const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");

const Password = sequelize.define(
  "Password",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "passswords",
    freezeTableName: true,
  }
);

module.exports = Password;