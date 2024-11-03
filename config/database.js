const {
  Sequelize
} = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: "mysql",
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Kết nối database thành công!.");
  })
  .catch((error) => {
    console.error("Kết nối databse thất bại: ", error);
  });

module.exports = sequelize;