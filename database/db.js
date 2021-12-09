var Sequelize = require("sequelize");
var sequelize = new Sequelize(
    "database",
    'user',
    'password',
    {
      dialect: "sqlite",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      host: "./database.sqlite"
    }
  );
module.exports = sequelize;