const Tour = require("../../models/tour.model");
const Category = require("../../models/category.model");
const Destination = require("../../models/destination.model");
const Transportation = require("../../models/transportation.model");
const Departure = require("../../models/departure.model");
const Order = require("../../models/orders.model");


const sequelize = require("../../config/database");

/**
 * @swagger
 * /statistics/tours:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy thống kê về các tour du lịch
 *     description: API này cung cấp các thông tin thống kê về tổng số tour, tour hoạt động, tour không hoạt động, tour được yêu thích và đặt nhiều nhất, thống kê theo tháng và tuần.
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin thống kê tour.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTours:
 *                   type: integer
 *                   example: 120
 *                 activeTours:
 *                   type: integer
 *                   example: 100
 *                 inactiveTours:
 *                   type: integer
 *                   example: 20
 *                 featuredTours:
 *                   type: integer
 *                   example: 15
 *                 mostBookedTour:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Tour Phượt Hà Giang"
 *                       orderCount:
 *                         type: integer
 *                         example: 50
 *                 mostFavoritedTour:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       title:
 *                         type: string
 *                         example: "Tour Đà Nẵng"
 *                       favoriteCount:
 *                         type: integer
 *                         example: 75
 *                 monthlyStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       month:
 *                         type: integer
 *                         example: 11
 *                       count:
 *                         type: integer
 *                         example: 10
 *                 weeklyStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       week:
 *                         type: integer
 *                         example: 45
 *                       count:
 *                         type: integer
 *                         example: 5
 *       500:
 *         description: Lỗi khi lấy thống kê tour.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving tours statistics"
 */

// [GET] /statistics/tours
module.exports.tours = async (req, res) => {
  try {
    const totalTours = await Tour.count();
    const activeTours = await Tour.count({
      where: {
        status: true
      }
    });
    const inactiveTours = await Tour.count({
      where: {
        status: false
      }
    });
    const featuredTours = await Tour.count({
      where: {
        isFeatured: true
      }
    });

    const mostBookedTourQuery = `
    SELECT tours.id, tours.title, COUNT(order_item.id) AS orderCount
    FROM tours 
    LEFT JOIN tour_detail ON tour_detail.tourId = tours.id
    JOIN order_item ON order_item.tourDetailId = tour_detail.id
    GROUP BY tours.id
    HAVING orderCount > 0
    ORDER BY orderCount DESC
    `;

    const mostBookedTour = await sequelize.query(mostBookedTourQuery, {
      type: sequelize.QueryTypes.SELECT
    });



    // Tour được thêm vào danh sách yêu thích nhiều nhất
    const mostFavoritedTourQuery = `
    SELECT tours.id, tours.title, COUNT(favorites.id) AS favoriteCount
    FROM tours 
    LEFT JOIN favorites ON favorites.tourId = tours.id
    GROUP BY tours.id
    HAVING favoriteCount > 0
    ORDER BY favoriteCount DESC;
    `;

    const mostFavoritedTour = await sequelize.query(mostFavoritedTourQuery, {
      type: sequelize.QueryTypes.SELECT
    });


    // Thống kê tour theo tháng, tuần
    const monthlyStatsQuery = `
    SELECT
      YEAR(t.createdAt) AS year,
      MONTH(t.createdAt) AS month,
      COUNT(t.id) AS count
    FROM tours t
    GROUP BY year, month
    ORDER BY year DESC, month DESC;
    `;

    const monthlyStats = await sequelize.query(monthlyStatsQuery, {
      type: sequelize.QueryTypes.SELECT
    });


    // Thống kê tour theo tuần
    const weeklyStatsQuery = `
    SELECT
      YEAR(t.createdAt) AS year,
      WEEK(t.createdAt) AS week,
      COUNT(t.id) AS count
    FROM tours t
    GROUP BY year, week
    ORDER BY year DESC, week DESC;
    `;

    const weeklyStats = await sequelize.query(weeklyStatsQuery, {
      type: sequelize.QueryTypes.SELECT
    });


    res.status(200).json({
      totalTours,
      activeTours,
      inactiveTours,
      mostBookedTour,
      featuredTours,
      mostFavoritedTour,
      monthlyStats,
      weeklyStats
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving tours statistics",
      error
    });
  }
};

/**
 * @swagger
 * /statistics/categories:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy thống kê về các danh mục
 *     description: API này cung cấp các thông tin thống kê về tổng số danh mục, số lượng danh mục đang hoạt động và không hoạt động, và số lượng tour liên quan đến mỗi danh mục.
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin thống kê danh mục.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCategories:
 *                   type: integer
 *                   example: 10
 *                 activeCategories:
 *                   type: integer
 *                   example: 8
 *                 inactiveCategories:
 *                   type: integer
 *                   example: 2
 *                 categoriesWithTourCount:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Tour Adventure"
 *                       tourCount:
 *                         type: integer
 *                         example: 5
 *       500:
 *         description: Lỗi khi lấy thống kê danh mục.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving categories statistics"
 */

// [GET] /statistics/categories
module.exports.categories = async (req, res) => {
  try {
    const totalCategories = await Category.count();

    // Số danh mục active và inactive
    const activeCategories = await Category.count({
      where: {
        status: true
      } // Điều chỉnh theo giá trị status của bạn
    });

    const inactiveCategories = await Category.count({
      where: {
        status: false
      }
    });

    // Số lượng tour cho mỗi danh mục
    const categoriesWithTourCountQuery = `
    SELECT
      c.id,
      c.title,
      COUNT(t.id) AS tourCount
    FROM categories c
    JOIN tours_categories tc ON tc.categoryId = c.id
    JOIN tours t ON t.id = tc.tourId
    GROUP BY c.id, c.title;
    `;

    const categoriesWithTourCount = await sequelize.query(categoriesWithTourCountQuery, {
      type: sequelize.QueryTypes.SELECT
    });


    // Trả về kết quả
    res.status(200).json({
      totalCategories,
      activeCategories,
      inactiveCategories,
      categoriesWithTourCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving categories statistics",
      error
    });
  }
}

/**
 * @swagger
 * /statistics/destinations:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy thống kê về các điểm đến
 *     description: API này cung cấp các thông tin thống kê về tổng số điểm đến, số lượng điểm đến đang hoạt động và không hoạt động, và số lượng tour liên quan đến mỗi điểm đến.
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin thống kê điểm đến.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDestinations:
 *                   type: integer
 *                   example: 15
 *                 activeDestinations:
 *                   type: integer
 *                   example: 12
 *                 inactiveDestinations:
 *                   type: integer
 *                   example: 3
 *                 destinationsWithTourCount:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Paris"
 *                       tourCount:
 *                         type: integer
 *                         example: 8
 *       500:
 *         description: Lỗi khi lấy thống kê điểm đến.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving destination statistics"
 */

// [GET] /statistics/destinations
module.exports.destinations = async (req, res) => {
  try {
    // Tổng số điểm đến
    const totalDestinations = await Destination.count();

    // Số điểm đến active và inactive
    const activeDestinations = await Destination.count({
      where: {
        status: true
      }
    });

    const inactiveDestinations = await Destination.count({
      where: {
        status: false
      }
    });

    // Số lượng tour cho mỗi điểm đến
    const destinationsWithTourCountQuery = `
    SELECT
      d.id,
      d.title,
      COUNT(t.id) AS tourCount
    FROM destination d
    LEFT JOIN tours t ON t.destinationId = d.id
    GROUP BY d.id, d.title;
    `;

    const destinationsWithTourCount = await sequelize.query(destinationsWithTourCountQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    // Trả về kết quả
    res.status(200).json({
      totalDestinations,
      activeDestinations,
      inactiveDestinations,
      destinationsWithTourCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving destination statistics",
      error
    });
  }
}

/**
 * @swagger
 * /statistics/departures:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy thống kê về các điểm khởi hành (departure)
 *     description: API này cung cấp các thông tin thống kê về tổng số điểm khởi hành, số lượng điểm khởi hành đang hoạt động và không hoạt động, và số lượng tour liên quan đến mỗi điểm khởi hành.
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin thống kê điểm khởi hành.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDepartures:
 *                   type: integer
 *                   example: 10
 *                 activeDepartures:
 *                   type: integer
 *                   example: 8
 *                 inactiveDepartures:
 *                   type: integer
 *                   example: 2
 *                 departuresWithTourCount:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Hà Nội"
 *                       tourCount:
 *                         type: integer
 *                         example: 5
 *       500:
 *         description: Lỗi khi lấy thống kê điểm khởi hành.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving departure statistics"
 */

// [GET] /statistics/departures
module.exports.departures = async (req, res) => {
  try {
    // Tổng số departure
    const totalDepartures = await Departure.count();

    // Số departure active và inactive
    const activeDepartures = await Departure.count({
      where: {
        status: true // Điều chỉnh trạng thái nếu cần
      }
    });

    const inactiveDepartures = await Departure.count({
      where: {
        status: false // Điều chỉnh trạng thái nếu cần
      }
    });

    // Số lượng tour cho mỗi departure
    const departuresWithTourCountQuery = `
      SELECT
        d.id,
        d.title,
        COUNT(t.id) AS tourCount
      FROM departure d
      LEFT JOIN tours t ON t.departureId = d.id
      GROUP BY d.id, d.title;
    `;

    const departuresWithTourCount = await sequelize.query(departuresWithTourCountQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    // Trả về kết quả
    res.status(200).json({
      totalDepartures,
      activeDepartures,
      inactiveDepartures,
      departuresWithTourCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving departure statistics",
      error
    });
  }
}

/**
 * @swagger
 * /statistics/transportations:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy thống kê về các phương tiện vận chuyển (transportation)
 *     description: API này cung cấp các thông tin thống kê về tổng số phương tiện vận chuyển, số lượng phương tiện vận chuyển đang hoạt động và không hoạt động, và số lượng tour liên quan đến mỗi phương tiện vận chuyển.
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin thống kê phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTransportations:
 *                   type: integer
 *                   example: 12
 *                 activeTransportations:
 *                   type: integer
 *                   example: 10
 *                 inactiveTransportations:
 *                   type: integer
 *                   example: 2
 *                 transportationsWithTourCount:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Máy bay"
 *                       tourCount:
 *                         type: integer
 *                         example: 8
 *       500:
 *         description: Lỗi khi lấy thống kê phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving transportation statistics"
 */

// [GET] /statistics/transportations
module.exports.transportations = async (req, res) => {
  try {
    // Tổng số transportation
    const totalTransportations = await Transportation.count();

    // Số transportation active và inactive
    const activeTransportations = await Transportation.count({
      where: {
        status: true
      }
    });

    const inactiveTransportations = await Transportation.count({
      where: {
        status: false
      }
    });

    // Số lượng tour cho mỗi transportation
    const transportationsWithTourCountQuery = `
      SELECT
        t.id,
        t.title,
        COUNT(tt.id) AS tourCount
      FROM transportation t
      LEFT JOIN tours tt ON tt.transportationId = t.id
      GROUP BY t.id, t.title;
    `;

    const transportationsWithTourCount = await sequelize.query(transportationsWithTourCountQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    // Trả về kết quả
    res.status(200).json({
      totalTransportations,
      activeTransportations,
      inactiveTransportations,
      transportationsWithTourCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving transportation statistics",
      error
    });
  }
}

/**
 * @swagger
 * /statistics/orders:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy thống kê về các đơn hàng
 *     description: API này cung cấp các thông tin thống kê về tổng số đơn hàng, số đơn hàng theo từng trạng thái, doanh thu theo tháng và tuần, doanh thu theo phương thức thanh toán, số lượng đơn hàng theo tour, và tỷ lệ hủy đơn hàng.
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin thống kê đơn hàng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                   example: 120
 *                 pendingOrders:
 *                   type: integer
 *                   example: 50
 *                 confirmedOrders:
 *                   type: integer
 *                   example: 60
 *                 canceledOrders:
 *                   type: integer
 *                   example: 10
 *                 revenueByMonth:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       month:
 *                         type: integer
 *                         example: 11
 *                       revenue:
 *                         type: number
 *                         example: 500000
 *                 revenueByWeek:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       week:
 *                         type: integer
 *                         example: 45
 *                       revenue:
 *                         type: number
 *                         example: 120000
 *                 revenueByPaymentMethod:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       paymentMethod:
 *                         type: string
 *                         example: "Zalo Pay"
 *                       revenue:
 *                         type: number
 *                         example: 200000
 *                 ordersByTour:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tourName:
 *                         type: string
 *                         example: "Tour Hà Nội"
 *                       orderCount:
 *                         type: integer
 *                         example: 50
 *                 cancellationRate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       month:
 *                         type: integer
 *                         example: 11
 *                       canceledCount:
 *                         type: integer
 *                         example: 5
 *                       totalOrders:
 *                         type: integer
 *                         example: 100
 *                       cancelRate:
 *                         type: number
 *                         example: 5.0
 *       500:
 *         description: Lỗi khi lấy thống kê đơn hàng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving order statistics"
 */

// [GET] /statistics/orders
module.exports.orders = async (req, res) => {
  try {
    // Tổng số đơn hàng
    const totalOrders = await Order.count();

    // Số đơn hàng theo từng trạng thái
    const pendingOrders = await Order.count({
      where: {
        status: 'pending'
      }
    });

    const confirmedOrders = await Order.count({
      where: {
        status: 'confirmed'
      }
    });

    const canceledOrders = await Order.count({
      where: {
        status: 'canceled'
      }
    });

    // Thống kê doanh thu theo tháng
    const revenueByMonthQuery = `
      SELECT
        YEAR(orders.createdAt) AS year,
        MONTH(orders.createdAt) AS month,
        SUM(transactions.amount) AS revenue
      FROM orders
      JOIN transactions ON transactions.id = orders.transactionId
      GROUP BY YEAR(orders.createdAt), MONTH(orders.createdAt)
      ORDER BY year DESC, month DESC
    `;

    const revenueByMonth = await sequelize.query(revenueByMonthQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    // Thống kê doanh thu theo tuần
    const revenueByWeekQuery = `
      SELECT
        YEAR(orders.createdAt) AS year,
        WEEK(orders.createdAt) AS week,
        SUM(transactions.amount) AS revenue
      FROM orders
      JOIN transactions ON transactions.id = orders.transactionId
      GROUP BY YEAR(orders.createdAt), WEEK(orders.createdAt)
      ORDER BY year DESC, week DESC
    `;

    const revenueByWeek = await sequelize.query(revenueByWeekQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    // Doanh thu theo các phương thức thanh toán
    const revenueByPaymentMethodQuery = `
    SELECT
      paymentMethod,
      SUM(amount) AS revenue
    FROM orders
    JOIN transactions ON transactions.id = orders.transactionId
    GROUP BY paymentMethod
    ORDER BY revenue DESC;
    `;

    const revenueByPaymentMethod = await sequelize.query(revenueByPaymentMethodQuery, {
      type: sequelize.QueryTypes.SELECT
    });


    //Số lượng đơn hàng theo từng sản phẩm
    const ordersByTourQuery = `
    SELECT
      t.title AS tourName,
      COUNT(o.id) AS orderCount
    FROM orders o
    LEFT JOIN order_item oi ON oi.orderId = o.id
    LEFT JOIN tour_detail td ON td.id = oi.tourDetailId
    LEFT JOIN tours t ON t.id = td.tourId
    GROUP BY t.id
    ORDER BY orderCount DESC;
    `;

    const ordersByTour = await sequelize.query(ordersByTourQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    // Số đơn hàng được hủy trong tháng
    const cancellationRateQuery = `
    SELECT
      YEAR(createdAt) AS year,
      MONTH(createdAt) AS month,
      COUNT(CASE WHEN status = 'canceled' THEN 1 END) AS canceledCount,
      COUNT(id) AS totalOrders,
      (COUNT(CASE WHEN status = 'canceled' THEN 1 END) / COUNT(id)) * 100 AS cancelRate
    FROM orders
    GROUP BY YEAR(createdAt), MONTH(createdAt)
    ORDER BY year DESC, month DESC;
    `;

    const cancellationRate = await sequelize.query(cancellationRateQuery, {
      type: sequelize.QueryTypes.SELECT
    });


    // Trả về kết quả
    res.status(200).json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      canceledOrders,
      revenueByMonth,
      revenueByWeek,
      revenueByPaymentMethod,
      ordersByTour,
      cancellationRate
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving order statistics",
      error
    });
  }
}