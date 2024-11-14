const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const clientRoutes = require("./routes/client/index.routes");
const adminRoutes = require("./routes/admin/index.routes");
const sequelize = require("./config/database");
const swaggerDocsClient = require("./swagger.client");
const swaggerDocsAdmin = require("./swagger.admin");
const swaggerUi = require("swagger-ui-express");

const srapeData = require("./scrape-data/index");
const cron = require('node-cron');
const cors = require('cors');

mysql: //root:nwSxozPCwWXzZHnltrpZbretJXVpcGqz@junction.proxy.rlwy.net:27845/railway
  sequelize;

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.options('*', cors());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

clientRoutes(app);
adminRoutes(app);

// Tạo middleware riêng cho client
app.use("/api-docs/client", swaggerUi.serveFiles(swaggerDocsClient), swaggerUi.setup(swaggerDocsClient));

// Tạo middleware riêng cho admin
app.use("/api-docs/admin", swaggerUi.serveFiles(swaggerDocsAdmin), swaggerUi.setup(swaggerDocsAdmin));


app.listen(port, () => {
  console.log(`App đang lắng nghe trên cổng ${port}`)
})