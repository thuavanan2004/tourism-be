const tourRoutes = require("./tour.route");
const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");
const destinationRoutes = require("./destination.route");
const orderRoutes = require("./order.route");

const authMiddleware = require("../../middlewares/client/auth.middlware");


module.exports = (app) => {
  const version = '/api';

  app.use(version + '/tours', tourRoutes);

  app.use(version + '/auth', authRoutes);

  app.use(version + "/user", authMiddleware.requireAuth, userRoutes)

  app.use(version + "/destination", destinationRoutes);

  app.use(version + "/orders", orderRoutes);
};