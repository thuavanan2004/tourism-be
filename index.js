const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const clientRoutes = require("./routes/client/index");
const sequelize = require("./config/database");
const swaggerDocs = require("./swagger");
const swaggerUi = require("swagger-ui-express");
const srapeData = require("./scrape-data/index");
const cron = require('node-cron');

mysql: //root:nwSxozPCwWXzZHnltrpZbretJXVpcGqz@junction.proxy.rlwy.net:27845/railway

  sequelize;

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cookieParser());

cron.schedule("0 20 * * *", () => {
  console.log("Bắt đầu cào dữ liệu...");

  srapeData.srape()
    .then(() => console.log("Cào dữ liệu hoàn tất"))
    .catch(error => console.log("Lỗi khi cào dữ liệu:", error));
});

clientRoutes(app);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(`App đang lắng nghe trên cổng ${port}`)
})