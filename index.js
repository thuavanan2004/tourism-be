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

// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
// }));

// app.options('*', cors());

app.use((req, res, next) => {
  // Thêm header CORS cho mọi yêu cầu
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Cho phép yêu cầu từ localhost:5173
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Các phương thức HTTP được phép
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With'); // Các header được phép
  res.header('Access-Control-Allow-Credentials', 'true'); // Nếu bạn cần gửi cookie hoặc thông tin xác thực

  // Nếu là preflight request (OPTIONS), chỉ cần trả về 200 OK
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  // Tiến hành xử lý yêu cầu tiếp theo
  next();
});

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