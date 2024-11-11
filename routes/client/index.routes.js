const tourRoutes = require("./tour.routes");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const destinationRoutes = require("./destination.routes");
const orderRoutes = require("./order.routes");

const authMiddleware = require("../../middlewares/client/auth.middlware");


module.exports = (app) => {
  const version = '/api/client';

  app.get("/", (req, res) => {
    res.send("Hello api from Thừa Văn An")
  })

  app.use(version + '/tours', tourRoutes);

  app.use(version + '/auth', authRoutes);

  app.use(version + "/user", authMiddleware.requireAuth, userRoutes)

  app.use(version + "/destination", destinationRoutes);

  app.use(version + "/orders", orderRoutes);
};