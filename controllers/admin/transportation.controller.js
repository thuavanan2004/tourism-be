const Transportation = require("../../models/transportation.model");

/**
 * @swagger
 * /transportation/create:
 *   post:
 *     tags:
 *       - Transportations
 *     summary: Tạo mới một phương tiện vận chuyển
 *     description: API này cho phép tạo mới một phương tiện vận chuyển với thông tin tiêu đề và thông tin mô tả.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Xe khách"
 *                 description: Tiêu đề của phương tiện vận chuyển (bắt buộc)
 *               information:
 *                 type: string
 *                 example: "Phương tiện vận chuyển hành khách trong nội thành"
 *                 description: Thông tin chi tiết về phương tiện vận chuyển (tuỳ chọn)
 *     responses:
 *       200:
 *         description: Tạo mới phương tiện vận chuyển thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo mới transportation thành công"
 *                 transportation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                       description: Mã ID của phương tiện vận chuyển.
 *                     title:
 *                       type: string
 *                       example: "Xe khách"
 *                     information:
 *                       type: string
 *                       example: "Phương tiện vận chuyển hành khách trong nội thành"
 *                     createdBy:
 *                       type: integer
 *                       example: 2
 *                       description: ID của admin đã tạo phương tiện vận chuyển.
 *       400:
 *         description: Thiếu thông tin bắt buộc hoặc không thể tạo phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên title"
 *       500:
 *         description: Lỗi hệ thống khi tạo mới phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi tạo mới một transportation"
 */

// [POST] /transportation/create
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
    const transportation = await Transportation.create({
      title: title,
      information: information || "",
      createdBy: adminId
    });

    if (!transportation) {
      return res.status(400).json("Không thể tạo một transportation")
    }
    res.status(200).json({
      message: "Tạo mới transportation thành công",
      transportation: transportation
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi tạo mới một transportation")
  }
}

/**
 * @swagger
 * /transportation/update:
 *   patch:
 *     tags:
 *       - Transportations
 *     summary: Cập nhật thông tin phương tiện vận chuyển
 *     description: API này cho phép cập nhật thông tin của một phương tiện vận chuyển, bao gồm tiêu đề, thông tin mô tả và trạng thái.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transportationId:
 *                 type: integer
 *                 example: 1
 *                 description: ID của phương tiện vận chuyển (bắt buộc).
 *               title:
 *                 type: string
 *                 example: "Xe giường nằm"
 *                 description: Tiêu đề mới của phương tiện vận chuyển (tuỳ chọn).
 *               information:
 *                 type: string
 *                 example: "Phương tiện vận chuyển giường nằm, chất lượng cao"
 *                 description: Thông tin chi tiết mới về phương tiện vận chuyển (tuỳ chọn).
 *               status:
 *                 type: string
 *                 enum:
 *                   - "true"
 *                   - "false"
 *                 example: "true"
 *                 description: Trạng thái phương tiện vận chuyển (true là kích hoạt, false là tắt).
 *     responses:
 *       200:
 *         description: Cập nhật phương tiện vận chuyển thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật transportation thành công!"
 *       400:
 *         description: Thiếu thông tin bắt buộc hoặc phương tiện vận chuyển không tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên transportationId"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi cập nhật transportation"
 */

// [PATCH] /transportation/update
module.exports.update = async (req, res) => {
  const {
    transportationId,
    title,
    information,
  } = req.body;
  if (!transportationId) {
    return res.status(400).json("Vui lòng gửi lên transportationId");
  }
  try {
    const transportation = await Transportation.findByPk(transportationId);

    if (!transportation) {
      return res.status(400).json("Transportation không tồn tại!")
    }
    const adminId = res.locals.adminId;
    await transportation.update({
      title: title || transportation.title,
      information: information || transportation.information,
      updatedBy: adminId
    })

    res.status(200).json({
      message: "Cập nhật transportation thành công!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi cập nhật transportation")
  }

}

/**
 * @swagger
 * /transportation/delete/{transportationId}:
 *   patch:
 *     tags:
 *       - Transportations
 *     summary: Xóa phương tiện vận chuyển
 *     description: API này cho phép đánh dấu một phương tiện vận chuyển là đã xóa (soft delete), lưu thông tin người thực hiện xóa.
 *     parameters:
 *       - name: transportationId
 *         in: path
 *         required: true
 *         description: ID của phương tiện vận chuyển cần xóa.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Xóa phương tiện vận chuyển thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa transportation thành công"
 *       400:
 *         description: Phương tiện vận chuyển không tồn tại hoặc thiếu thông tin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transportation không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi xóa phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi xóa transportation"
 */

// [PATCH] /transportation/delete/:transportationId
module.exports.delete = async (req, res) => {
  const transportationId = req.params.transportationId;
  if (!transportationId) {
    return res.status(400).json("Yêu cầu gửi lên transportationId")
  }
  try {
    const transportation = await Transportation.findByPk(transportationId);
    if (!transportation) {
      return res.status(400).json("Transportation không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await transportation.update({
      deleted: true,
      deletedBy: adminId
    });
    res.status(200).json({
      message: "Xóa transportation thành công",
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi xóa transportation"
    })
  }
}

/**
 * @swagger
 * /transportation/get-all-transportation:
 *   get:
 *     tags:
 *       - Transportations
 *     summary: Lấy danh sách phương tiện vận chuyển
 *     description: API này trả về danh sách tất cả các phương tiện vận chuyển chưa bị xóa, có thể lọc theo trạng thái của phương tiện.
 *     parameters:
 *       - name: status
 *         in: query
 *         description: Trạng thái của phương tiện vận chuyển (true/false).
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: Lấy danh sách phương tiện vận chuyển thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transportations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Xe Bus"
 *                       information:
 *                         type: string
 *                         example: "Thông tin chi tiết về xe bus"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       createdBy:
 *                         type: integer
 *                         example: 1
 *                       updatedBy:
 *                         type: integer
 *                         example: 2
 *                       deleted:
 *                         type: boolean
 *                         example: false
 *                       deletedBy:
 *                         type: integer
 *                         example: null
 *       400:
 *         description: Danh sách phương tiện vận chuyển rỗng hoặc yêu cầu lọc không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh sách transportation rỗng"
 *       500:
 *         description: Lỗi hệ thống khi lấy danh sách phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy danh sách transportations"
 */

// [GET] /transportation/get-all-transportation 
module.exports.getAllTransportation = async (req, res) => {
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

    const transportations = await Transportation.findAll({
      where: whereCondition
    });

    if (transportations.length == 0) {
      return res.status(400).json("Danh sách transportation rỗng");
    }

    res.status(200).json({
      transportations: transportations
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách transportations"
    })
  }
}

/**
 * @swagger
 * /transportation/change-status/{transportationId}:
 *   patch:
 *     tags:
 *       - Transportations
 *     summary: Cập nhật trạng thái phương tiện vận chuyển
 *     description: API này cập nhật trạng thái của một phương tiện vận chuyển cụ thể.
 *     parameters:
 *       - name: transportationId
 *         in: path
 *         description: ID của phương tiện vận chuyển cần cập nhật trạng thái.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *                 description: Trạng thái mới của phương tiện vận chuyển (true/false).
 *                 example: true
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái phương tiện vận chuyển thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng thái transportation thành công"
 *       400:
 *         description: Thông tin không hợp lệ hoặc phương tiện vận chuyển không tồn tại.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Yêu cầu gửi lên transportationId"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi cập nhật trạng thái transportation"
 */

// [PATCH] /transportation/change-status/:transportationId
module.exports.changeStatus = async (req, res) => {
  const transportationId = req.params.transportationId;
  const {
    status
  } = req.body;
  if (!transportationId) {
    return res.status(400).json("Yêu cầu gửi lên transportationId")
  }
  if (status == undefined) {
    return res.status(400).json("Yêu cầu gửi lên status")
  }
  try {
    const transportation = await Transportation.findByPk(transportationId);
    if (!transportation) {
      return res.status(400).json("Transportation không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await transportation.update({
      status: status,
      updatedBy: adminId
    });
    res.status(200).json({
      message: "Cập nhật trạng tái transportation thành công",
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái transportation"
    })
  }
}

/**
 * @swagger
 * /transportation/change-status-multiple:
 *   patch:
 *     tags:
 *       - Transportations
 *     summary: Cập nhật trạng thái cho nhiều phương tiện vận chuyển
 *     description: API này cho phép cập nhật trạng thái của nhiều phương tiện vận chuyển cùng một lúc.
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
 *                 description: Danh sách các ID của phương tiện vận chuyển cần cập nhật trạng thái.
 *                 example: [1, 2, 3]
 *               status:
 *                 type: boolean
 *                 description: Trạng thái mới của các phương tiện vận chuyển (true/false).
 *                 example: true
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái cho các phương tiện vận chuyển thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thành công"
 *                 updatedTransportations:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: Danh sách các phương tiện vận chuyển đã được cập nhật trạng thái.
 *                   example: [1, 2, 3]
 *       400:
 *         description: Lỗi khi thiếu thông tin IDs hoặc trạng thái, hoặc không tìm thấy phương tiện vận chuyển để cập nhật.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên danh sánh ids"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái cho nhiều phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi cập nhật nhiều Transportation"
 */

// [PATCH] /transportation/change-status-multiple
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

    const updatedTransportations = await Transportation.update({
      status: status == "true",
      updatedBy: adminId
    }, {
      where: {
        id: ids
      }
    })
    if (updatedTransportations[0] > 0) {
      return res.json({
        message: "Cập nhật thành công",
        updatedTransportations: ids
      });
    } else {
      return res.status(400).json({
        message: "Không tìm thấy Transportation để cập nhật"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật nhiều Transportation")
  }
}

/**
 * @swagger
 * /transportation/get-transportation/{transportationId}:
 *   get:
 *     tags:
 *       - Transportations
 *     summary: Lấy chi tiết của một phương tiện vận chuyển
 *     description: API này cho phép lấy thông tin chi tiết của một phương tiện vận chuyển dựa trên ID.
 *     parameters:
 *       - name: transportationId
 *         in: path
 *         required: true
 *         description: ID của phương tiện vận chuyển cần lấy thông tin.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Trả về chi tiết phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transportation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Xe bus"
 *                     information:
 *                       type: string
 *                       example: "Xe bus chạy từ Hà Nội đến Sài Gòn"
 *                     status:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Không tìm thấy phương tiện vận chuyển với ID đã cung cấp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transportation không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi lấy thông tin phương tiện vận chuyển.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy chi tiết một transportation"
 */

// [GET] /transportation/get-transportation/:transportationId
module.exports.getTransportation = async (req, res) => {
  const transportationId = req.params.transportationId;
  if (!transportationId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên transportationId"
    })
  }
  try {
    const transportation = await Transportation.findByPk(transportationId);
    if (!transportation) {
      return res.status(400).json("Transportation không tồn tại!")
    }

    res.status(200).json({
      transportation: transportation,
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết một transportation"
    })
  }
}