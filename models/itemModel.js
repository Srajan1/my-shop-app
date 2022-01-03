const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Metric = require("./metricModel");

// Item.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     available: {
//       type: DataTypes.FLOAT,
//       defaultValue: 0,
//     },
//     incoming: {
//       type: DataTypes.FLOAT,
//       defaultValue: 0,
//     },
//   },
//   {
//     sequelize,
//     tableName: "items",
//     freezeTableName: true,
//   }
// );
// Item.belongsTo(Metric)
// module.exports = Item;

const Item = sequelize.define(
  "Item",
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
    available: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    incoming: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "items",
    freezeTableName: true,
  }
);

Item.belongsTo(Metric, { foreignKey: "metricId", targetKey: "id" });
module.exports = Item;