const tourRoutes = require("./tours.routes");
const authRoutes = require("./auth.routes");
const tourDetailRoutes = require("./tour_detail.routes");
const categoryRoutes = require("./category.routes");
const transportationRoutes = require("./transportation.routes");
const departureRoutes = require("./departure.routes");
const destinationRoutes = require("./destination.routes");
const orderRoutes = require("./order.routes");
const rolesRoutes = require("./roles.routes");
const accountRoutes = require("./account.routes");
const statisticsRoutes = require("./statistics.routes");

const {
  requireAuth
} = require("../../middlewares/admin/auth.middleware");

module.exports = (app) => {
  const version = '/api/admin';

  app.use(version + '/auth', authRoutes);

  app.use(version + '/tours', requireAuth, tourRoutes);

  app.use(version + "/tour_detail", requireAuth, tourDetailRoutes);

  app.use(version + "/category", requireAuth, categoryRoutes);

  app.use(version + "/transportation", requireAuth, transportationRoutes);

  app.use(version + "/departure", requireAuth, departureRoutes);

  app.use(version + "/destination", requireAuth, destinationRoutes);

  app.use(version + "/orders", requireAuth, orderRoutes);

  app.use(version + "/roles", requireAuth, rolesRoutes);

  app.use(version + "/account", requireAuth, accountRoutes);

  app.use(version + "/statistics", requireAuth, statisticsRoutes);
}