const express = require("express");
const router = express.Router();

const {
  checkPermission
} = require("../../middlewares/admin/checkPermission.middleware");

const controllers = require("../../controllers/admin/order.controller");

router.get("/get-all", checkPermission("READ_ORDER"), controllers.getAllOrders);

router.get("/order-item/:orderId", checkPermission("READ_ORDER"), controllers.orderItem);

router.patch("/change-status-transaction/:transactionId", checkPermission("UPDATE_ORDER"), controllers.changeStatusTransaction);

router.patch("/change-status-order/:orderId", checkPermission("UPDATE_ORDER"), controllers.changeStatusOrder);

router.patch("/remove-order/:orderId", checkPermission("DELETE_ORDER"), controllers.removeOrder)

module.exports = router;