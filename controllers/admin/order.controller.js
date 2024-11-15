const OrderItem = require("../../models/order_item.model")
const Order = require("../../models/orders.model")
const Transaction = require("../../models/transactions.model")
const sendEmailCofirmOrderHelper = require("../../helpers/sendEmailCofirmOrder.helper");

/**
 * @swagger
 * /orders/get-all:
 *   get:
 *     tags:
 *       - Order
 *     summary: Lấy tất cả đơn hàng chưa bị xóa
 *     description: API này trả về danh sách tất cả các đơn hàng trong hệ thống mà không bị đánh dấu là đã xóa.
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID của đơn hàng.
 *                       customerId:
 *                         type: integer
 *                         description: ID của khách hàng liên kết với đơn hàng.
 *                       totalAmount:
 *                         type: number
 *                         format: float
 *                         description: Tổng tiền của đơn hàng.
 *                       status:
 *                         type: string
 *                         description: Trạng thái của đơn hàng (e.g., 'pending', 'completed', 'cancelled').
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Thời gian tạo đơn hàng.
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Thời gian cập nhật đơn hàng lần cuối.
 *       500:
 *         description: Lỗi hệ thống khi lấy danh sách đơn hàng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy danh sách đơn hàng"
 */

// [GET] /order/get-all
module.exports.getAllOrders = async (req, res) => {
  const orders = await Order.findAll({
    where: {
      deleted: false
    }
  })
  res.status(200).json({
    orders: orders
  })
}

/**
 * @swagger
 * /orders/order-item/{orderId}:
 *   get:
 *     tags:
 *       - Order
 *     summary: Lấy chi tiết của đơn hàng và các item liên quan
 *     description: API này trả về chi tiết đơn hàng cùng với các thông tin về giao dịch và item trong đơn hàng.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần lấy chi tiết.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy thông tin đơn hàng, giao dịch và item thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID của đơn hàng.
 *                     customerId:
 *                       type: integer
 *                       description: ID của khách hàng liên kết với đơn hàng.
 *                     totalAmount:
 *                       type: number
 *                       format: float
 *                       description: Tổng tiền của đơn hàng.
 *                     status:
 *                       type: string
 *                       description: Trạng thái của đơn hàng (e.g., 'pending', 'completed', 'cancelled').
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Thời gian tạo đơn hàng.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Thời gian cập nhật đơn hàng lần cuối.
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID của giao dịch liên quan đến đơn hàng.
 *                     amount:
 *                       type: number
 *                       format: float
 *                       description: Số tiền của giao dịch.
 *                     status:
 *                       type: string
 *                       description: Trạng thái của giao dịch (e.g., 'completed', 'failed').
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Thời gian tạo giao dịch.
 *                 orderItem:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID của item trong đơn hàng.
 *                     quantity:
 *                       type: integer
 *                       description: Số lượng sản phẩm trong đơn hàng.
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: Giá của mỗi sản phẩm.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Thời gian tạo item trong đơn hàng.
 *       400:
 *         description: Không tìm thấy đơn hàng, giao dịch hoặc item trong đơn hàng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Yêu cầu gửi lên orderId"
 *       500:
 *         description: Lỗi hệ thống khi lấy chi tiết đơn hàng hoặc item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy chi tiết một order item"
 */

// [GET] /order/order-item/:orderId
module.exports.orderItem = async (req, res) => {
  const orderId = req.params.orderId;
  if (!orderId) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên orderId"
    })
  }
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(400).json({
        message: "Order không tồn tại"
      })
    }
    const transaction = await Transaction.findOne({
      where: {
        id: order.transactionId
      }
    })
    if (!transaction) {
      return res.status(400).json("Không tồn tại transaction ứng với order")
    }
    const orderItem = await OrderItem.findOne({
      where: {
        orderId: order.id
      }
    });
    if (!orderItem) {
      return res.status(400).json({
        message: "Order item không tồn tại"
      })
    }
    res.status(200).json({
      order: order,
      transaction: transaction,
      orderItem: orderItem
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết một order item"
    })
  }
}

/**
 * @swagger
 * /orders/change-status-transaction/{transactionId}:
 *   patch:
 *     tags:
 *       - Order
 *     summary: Thay đổi trạng thái của giao dịch
 *     description: API này cho phép thay đổi trạng thái của giao dịch dựa trên `transactionId`. Các trạng thái hợp lệ bao gồm `pending`, `completed`, và `failed`.
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: ID của giao dịch cần thay đổi trạng thái.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Trạng thái mới của giao dịch.
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái giao dịch thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng thái transaction thành công!"
 *       400:
 *         description: Tham số `transactionId` hoặc `status` không hợp lệ, hoặc trạng thái không đúng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên đúng trạng thái"
 *       500:
 *         description: Lỗi khi thay đổi trạng thái giao dịch.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi thay đổi trạng thái transaction"
 */

// [PATCH] /order/change-status-transaction/:transactionId
module.exports.changeStatusTransaction = async (req, res) => {
  const transactionId = req.params.transactionId;
  const {
    status
  } = req.body;
  if (!transactionId) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên transactionId"
    })
  }

  if (!status) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên status"
    })
  }

  const validationStatus = ['pending', 'completed', 'failed'];
  if (!validationStatus.includes(status)) {
    return res.status(400).json("Vui lòng gửi lên đúng trạng thái")
  }

  try {
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(400).json({
        message: "Transaction không tồn tại"
      })
    };
    await transaction.update({
      status: status
    })

    res.status(200).json({
      message: "Cập nhật trạng thái transaction thành công!"
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi thay đổi trạng thái transaction"
    })
  }
}

/**
 * @swagger
 * /orders/change-status-order/{orderId}:
 *   patch:
 *     tags:
 *       - Order
 *     summary: Thay đổi trạng thái của đơn hàng
 *     description: API này cho phép thay đổi trạng thái của đơn hàng dựa trên `orderId`.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần thay đổi trạng thái.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Trạng thái mới của đơn hàng.
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái đơn hàng thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng thái order thành công!"
 *       400:
 *         description: Tham số `orderId` hoặc `status` không hợp lệ, hoặc trạng thái không đúng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên đúng trạng thái"
 *       500:
 *         description: Lỗi khi thay đổi trạng thái đơn hàng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi thay đổi trạng thái order"
 */

// [PATCH] /order/change-status-order/:orderId
module.exports.changeStatusOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const {
    status
  } = req.body;
  if (!orderId) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên orderId"
    })
  }

  if (!status) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên status"
    })
  }

  const validationStatus = ['pending', 'confirmed', 'cancelled'];
  if (!validationStatus.includes(status)) {
    return res.status(400).json("Vui lòng gửi lên đúng trạng thái")
  }

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(400).json({
        message: "Order không tồn tại"
      })
    };
    await order.update({
      status: status
    })

    const transaction = await Transaction.findOne({
      where: {
        id: order.transactionId
      }
    })
    if (!transaction) {
      return res.status(400).json("Không tồn tại transaction ứng với order")
    }
    order.amount = transaction.amount;
    const emailSubject = "Xác nhận đặt tour";
    const emailText = `Xin chào ${order.fullName},\n\nĐơn hàng của bạn đã được xác nhận với mã đơn hàng: ${order.code}.\nCảm ơn bạn đã đặt tour!`;
    sendEmailCofirmOrderHelper.sendEmail(order.email, emailSubject, emailText, order);
    res.status(200).json({
      message: "Cập nhật trạng thái order thành công!"
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi thay đổi trạng thái order"
    })
  }
}

/**
 * @swagger
 * /orders/remove/{orderId}:
 *   patch:
 *     tags:
 *       - Order
 *     summary: Xóa một đơn hàng
 *     description: API này cho phép xóa một đơn hàng bằng cách đánh dấu đơn hàng là đã xóa dựa trên `orderId`.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID của đơn hàng cần xóa.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Đơn hàng đã được xóa thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa đơn hàng thành công!"
 *       400:
 *         description: Tham số `orderId` không hợp lệ hoặc không tìm thấy đơn hàng với ID cung cấp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order không tồn tại"
 *       500:
 *         description: Lỗi khi xóa đơn hàng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi xóa đơn hàng"
 */

// [PATCH] /order/remove/:orderId
module.exports.removeOrder = async (req, res) => {
  const orderId = req.params.orderId;
  if (!orderId) {
    return res.status(400).json({
      message: "Yêu cầu gửi lên orderId"
    })
  }

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(400).json({
        message: "Order không tồn tại"
      })
    };
    await order.update({
      deleted: true
    })

    res.status(200).json({
      message: "Xóa đơn hàng thành công!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi xóa đơn hàng")
  }
}