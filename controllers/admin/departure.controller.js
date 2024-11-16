const Departure = require("../../models/departure.model");

/**
 * @swagger
 * /departure/create:
 *   post:
 *     tags:
 *       - Departure
 *     summary: Tạo mới một điểm xuất phát (departure)
 *     description: API này cho phép tạo mới một điểm xuất phát với thông tin tiêu đề và thông tin mô tả.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề của điểm xuất phát.
 *                 example: "Hà Nội"
 *               information:
 *                 type: string
 *                 description: Thông tin mô tả về điểm xuất phát.
 *                 example: "Thủ đô của Việt Nam, nơi bắt đầu các chuyến tour du lịch."
 *     responses:
 *       200:
 *         description: Tạo mới thành công điểm xuất phát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo mới departure thành công"
 *                 departure:
 *                   type: object
 *                   description: Thông tin của điểm xuất phát vừa tạo.
 *                   example:
 *                     id: 1
 *                     title: "Hà Nội"
 *                     information: "Thủ đô của Việt Nam, nơi bắt đầu các chuyến tour du lịch."
 *                     createdBy: 2
 *       400:
 *         description: Lỗi khi không cung cấp đủ thông tin cần thiết (title).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên title"
 *       500:
 *         description: Lỗi hệ thống khi tạo mới điểm xuất phát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi tạo mới một departure"
 */

// [POST] /departure/create
module.exports.create = async (req, res) => {
  const {
    title,
    information
  } = req.body;
  if (!title) {
    return res.status(400).json("Vui lòng gửi lên title")
  }
  try {
    const adminId = res.locals.adminId;
    const departure = await Departure.create({
      title: title,
      information: information || "",
      createdBy: adminId
    });

    if (!departure) {
      return res.status(400).json("Không thể tạo một departure")
    }
    res.status(200).json({
      message: "Tạo mới departure thành công",
      departure: departure
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi tạo mới một departure")
  }
}

/**
 * @swagger
 * /departure/update:
 *   patch:
 *     tags:
 *       - Departure
 *     summary: Cập nhật thông tin điểm xuất phát (departure)
 *     description: API này cho phép cập nhật thông tin của một điểm xuất phát bao gồm tiêu đề, thông tin mô tả và trạng thái.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departureId:
 *                 type: integer
 *                 description: ID của điểm xuất phát cần cập nhật.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: Tiêu đề của điểm xuất phát.
 *                 example: "Hà Nội"
 *               information:
 *                 type: string
 *                 description: Thông tin mô tả về điểm xuất phát.
 *                 example: "Thủ đô của Việt Nam."
 *               status:
 *                 type: string
 *                 enum: [true, false]
 *                 description: Trạng thái hoạt động của điểm xuất phát (true cho hoạt động, false cho không hoạt động).
 *                 example: "true"
 *     responses:
 *       200:
 *         description: Cập nhật thông tin điểm xuất phát thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật departure thành công!"
 *       400:
 *         description: Lỗi khi không tìm thấy departure hoặc thiếu thông tin cần thiết.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên departureId"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật điểm xuất phát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi cập nhật departure"
 */
// [PATCH] /departure/update
module.exports.update = async (req, res) => {
  const {
    departureId,
    title,
    information,
  } = req.body;
  if (!departureId) {
    return res.status(400).json("Vui lòng gửi lên departureId");
  }
  try {
    const departure = await Departure.findByPk(departureId);

    if (!departure) {
      return res.status(400).json("Departure không tồn tại!")
    }
    const adminId = res.locals.adminId;
    await departure.update({
      title: title || departure.title,
      information: information || departure.information,
      updatedBy: adminId
    })

    res.status(200).json({
      message: "Cập nhật departure thành công!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi cập nhật departure")
  }
}

/**
 * @swagger
 * /departure/delete/{departureId}:
 *   patch:
 *     tags:
 *       - Departure
 *     summary: Xóa điểm xuất phát (departure)
 *     description: API này cho phép xóa một điểm xuất phát bằng cách đánh dấu nó là đã xóa (soft delete).
 *     parameters:
 *       - in: path
 *         name: departureId
 *         required: true
 *         description: ID của điểm xuất phát cần xóa.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Xóa điểm xuất phát thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa departure thành công"
 *       400:
 *         description: Lỗi khi không tìm thấy departure hoặc thiếu thông tin cần thiết.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Yêu cầu gửi lên departureId"
 *       500:
 *         description: Lỗi hệ thống khi xóa điểm xuất phát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi xóa departure"
 */
// [PATCH] /departure/delete/:departureId
module.exports.delete = async (req, res) => {
  const departureId = req.params.departureId;
  if (!departureId) {
    return res.status(400).json("Yêu cầu gửi lên departureId")
  }
  try {
    const departure = await Departure.findByPk(departureId);
    if (!departure) {
      return res.status(400).json("Departure không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await departure.update({
      deleted: true,
      deletedBy: adminId
    });
    res.status(200).json({
      message: "Xóa departure thành công",
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi xóa departure"
    })
  }
}

/**
 * @swagger
 * /departure/get-all-departure:
 *   get:
 *     tags:
 *       - Departure
 *     summary: Lấy danh sách tất cả điểm xuất phát
 *     description: API này trả về danh sách tất cả điểm xuất phát (departure), có thể lọc theo trạng thái nếu có.
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         description: Trạng thái của điểm xuất phát.
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách điểm xuất phát.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 departures:
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
 *                       information:
 *                         type: string
 *                         example: "Thông tin về Hà Nội"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Lỗi khi không tìm thấy bất kỳ departure nào.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh sách departures rỗng"
 *       500:
 *         description: Lỗi hệ thống khi lấy danh sách departure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy danh sách departures"
 */

// [GET] /departure/get-all-departure
module.exports.getAllDeparture = async (req, res) => {
  const {
    status
  } = req.query;
  try {
    var whereCondition = {
      deleted: false
    };
    if (status) {
      whereCondition.status = status;
    }

    const departures = await Departure.findAll({
      where: whereCondition
    });

    if (departures.length == 0) {
      return res.status(400).json("Danh sách departures rỗng");
    }

    res.status(200).json({
      departures: departures
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách departures"
    })
  }
}

/**
 * @swagger
 * /departure/change-status/{departureId}:
 *   patch:
 *     tags:
 *       - Departure
 *     summary: Cập nhật trạng thái của một departure
 *     description: API này cập nhật trạng thái của một departure dựa trên `departureId` và `status` được gửi lên.
 *     parameters:
 *       - in: path
 *         name: departureId
 *         required: true
 *         description: ID của departure cần cập nhật.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: body
 *         name: status
 *         required: true
 *         description: Trạng thái mới của departure (true/false).
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: ["true", "false"]
 *               example: "true"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái departure thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng thái departure thành công"
 *       400:
 *         description: Lỗi khi không gửi đủ thông tin hoặc departure không tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Departure không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái departure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi cập nhật trạng thái departure"
 */

// [PATCH] /departure/change-status/:departureId
module.exports.changeStatus = async (req, res) => {
  const departureId = req.params.departureId;
  const {
    status
  } = req.body;
  if (!departureId) {
    return res.status(400).json("Yêu cầu gửi lên departureId")
  }
  if (status == undefined) {
    return res.status(400).json("Yêu cầu gửi lên status")
  }
  try {
    const departure = await Departure.findByPk(departureId);
    if (!departure) {
      return res.status(400).json("Departure không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await departure.update({
      status: status,
      updatedBy: adminId
    });
    res.status(200).json({
      message: "Cập nhật trạng tái departure thành công",
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái departure"
    })
  }
}

/**
 * @swagger
 * /departure/change-status-multiple:
 *   patch:
 *     tags:
 *       - Departure
 *     summary: Cập nhật trạng thái cho nhiều departure
 *     description: API này cho phép cập nhật trạng thái của nhiều departure dựa trên danh sách `ids` và `status` được gửi lên.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               status:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 example: "true"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công cho nhiều departure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thành công"
 *                 updatedDepartures:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 2, 3]
 *       400:
 *         description: Lỗi khi không gửi đủ thông tin hoặc không tìm thấy departure để cập nhật.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy Departure để cập nhật"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái cho nhiều departure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi cập nhật nhiều Departure"
 */

// [PATCH] /departure/change-status-multiple
module.exports.changeStatusMultiple = async (req, res) => {
  const {
    ids,
    status
  } = req.body;
  if (ids.length == 0 || !ids) {
    return res.status(400).json("Vui lòng gửi lên danh sánh ids")
  }
  if (!status) {
    return res.status(400).json("Vui lòng gửi lên status")
  }
  try {
    const adminId = res.locals.adminId;

    const updatedDepartures = await Departure.update({
      status: status == "true",
      updatedBy: adminId
    }, {
      where: {
        id: ids
      }
    })
    if (updatedDepartures[0] > 0) {
      return res.json({
        message: "Cập nhật thành công",
        updatedDepartures: ids
      });
    } else {
      return res.status(400).json({
        message: "Không tìm thấy Departure để cập nhật"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật nhiều Departure")
  }
}

/**
 * @swagger
 * /departure/get-departure/{departureId}:
 *   get:
 *     tags:
 *       - Departure
 *     summary: Lấy thông tin chi tiết của một departure
 *     description: API này cho phép lấy chi tiết thông tin của một departure dựa trên `departureId` được gửi lên.
 *     parameters:
 *       - in: path
 *         name: departureId
 *         required: true
 *         description: ID của departure cần lấy thông tin.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lấy thông tin departure thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 departure:
 *                   type: object
 *                   description: Thông tin chi tiết về departure.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Hà Nội"
 *                     information:
 *                       type: string
 *                       example: "Thông tin về điểm xuất phát."
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     createdBy:
 *                       type: integer
 *                       example: 1
 *                     updatedBy:
 *                       type: integer
 *                       example: 2
 *                     deleted:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Lỗi khi không có `departureId` hoặc không tìm thấy departure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Departure không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi lấy thông tin departure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy chi tiết một departure"
 */
// [GET] /departure/get-departure/:departureId
module.exports.getDeparture = async (req, res) => {
  const departureId = req.params.departureId;
  if (!departureId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên departureId"
    })
  }
  try {
    const departure = await Departure.findByPk(departureId);
    if (!departure) {
      return res.status(400).json("Departure không tồn tại!")
    }

    res.status(200).json({
      departure: departure,
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết một departure"
    })
  }
}