const sequelize = require("../../config/database");
const Destination = require("../../models/destination.model");
const slugify = require("slugify");
const createTreeHelper = require("../../helpers/createTree.helper");

/**
 * @swagger
 * /destination/create:
 *   post:
 *     tags:
 *       - Destination
 *     summary: Tạo mới một destination
 *     description: API này cho phép tạo mới một destination với thông tin như title, thông tin mô tả, hình ảnh và danh mục cha.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề của destination.
 *                 example: "Hạ Long Bay"
 *               information:
 *                 type: string
 *                 description: Thông tin mô tả của destination.
 *                 example: "Một trong những kỳ quan thiên nhiên thế giới."
 *               image:
 *                 type: string
 *                 description: Đường dẫn hình ảnh đại diện cho destination.
 *                 example: "https://example.com/image.jpg"
 *               parentId:
 *                 type: integer
 *                 description: ID của danh mục cha của destination (nếu có).
 *                 example: 1
 *     responses:
 *       200:
 *         description: Tạo mới destination thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo mới departure thành công"
 *                 destination:
 *                   type: object
 *                   description: Thông tin về destination mới tạo.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Hạ Long Bay"
 *                     information:
 *                       type: string
 *                       example: "Một trong những kỳ quan thiên nhiên thế giới."
 *                     slug:
 *                       type: string
 *                       example: "ha-long-bay"
 *                     image:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *                     parentId:
 *                       type: integer
 *                       example: 1
 *                     createdBy:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Lỗi khi không gửi lên thông tin cần thiết hoặc không tìm thấy danh mục cha.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh mục cha của Destination không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi tạo mới destination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi tạo mới một destination"
 */
// [POST] /destination/create
module.exports.create = async (req, res) => {
  const {
    title,
    information,
    image,
    parentId
  } = req.body;
  if (!title) {
    return res.status(400).json("Vui lòng gửi lên title")
  }
  try {
    const parentDestination = await Destination.findByPk(parentId);
    if (!parentDestination) {
      return res.status(400).json("Danh mục cha của Destination không tồn tại!")
    }

    const slug = slugify(title, {
      lower: true,
      replacement: "-"
    })
    const adminId = res.locals.adminId;
    const destination = await Destination.create({
      title: title,
      information: information || "",
      slug: slug,
      image: image,
      parentId: parentId || null,
      createdBy: adminId,
    });

    if (!destination) {
      return res.status(400).json("Không thể tạo một destination")
    }

    res.status(200).json({
      message: "Tạo mới departure thành công",
      destination: destination
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi tạo mới một destination")
  }
}

/**
 * @swagger
 * /destination/update:
 *   patch:
 *     tags:
 *       - Destination
 *     summary: Cập nhật thông tin một destination
 *     description: API này cho phép cập nhật thông tin của một destination, bao gồm title, thông tin mô tả, hình ảnh, trạng thái và danh mục cha.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destinationId:
 *                 type: integer
 *                 description: ID của destination cần cập nhật.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: Tiêu đề của destination.
 *                 example: "Hạ Long Bay"
 *               information:
 *                 type: string
 *                 description: Thông tin mô tả của destination.
 *                 example: "Một trong những kỳ quan thiên nhiên thế giới."
 *               status:
 *                 type: boolean
 *                 description: Trạng thái của destination (true hoặc false).
 *                 example: true
 *               image:
 *                 type: string
 *                 description: Đường dẫn hình ảnh đại diện cho destination.
 *                 example: "https://example.com/image.jpg"
 *               parentId:
 *                 type: integer
 *                 description: ID của danh mục cha của destination (nếu có).
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cập nhật destination thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật destination thành công"
 *                 destination:
 *                   type: object
 *                   description: Thông tin của destination sau khi được cập nhật.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Hạ Long Bay"
 *                     information:
 *                       type: string
 *                       example: "Một trong những kỳ quan thiên nhiên thế giới."
 *                     slug:
 *                       type: string
 *                       example: "ha-long-bay"
 *                     image:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *                     parentId:
 *                       type: integer
 *                       example: 2
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     updatedBy:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Lỗi khi thông tin đầu vào không hợp lệ hoặc không tìm thấy destination hoặc danh mục cha.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh mục cha của Destination không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật destination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi tạo mới một destination"
 */

// [PATCH] /destination/update
module.exports.update = async (req, res) => {
  const {
    destinationId,
    title,
    information,
    status,
    image,
    parentId
  } = req.body;
  if (!destinationId) {
    return res.status(400).json("Vui lòng gửi lên destinationId")
  }
  try {
    const destination = await Destination.findByPk(destinationId);

    if (!destination) {
      return res.status(400).json("Destination không tồn tại!")
    }

    const parentDestination = await Destination.findByPk(parentId);
    if (!parentDestination) {
      return res.status(400).json("Danh mục cha của Destination không tồn tại!")
    }

    const adminId = res.locals.adminId;
    await destination.update({
      title: title || destination.title,
      information: information || destination.information,
      slug: slugify(title || destination.title, {
        lower: true,
        replacement: "-"
      }),
      image: image || destination.image,
      parentId: parentId || destination.parentId,
      status: status || destination.status,
      updatedBy: adminId
    });

    res.status(200).json({
      message: "Cập nhật destination thành công",
      destination: destination
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi tạo mới một destination")
  }
}

/**
 * @swagger
 * /destination/delete/{destinationId}:
 *   patch:
 *     tags:
 *       - Destination
 *     summary: Xóa một destination
 *     description: API này cho phép xóa (đánh dấu là xóa) một destination, không thực sự xóa dữ liệu mà chỉ cập nhật trạng thái `deleted` thành true.
 *     parameters:
 *       - name: destinationId
 *         in: path
 *         required: true
 *         description: ID của destination cần xóa.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Xóa destination thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa destination thành công"
 *       400:
 *         description: Lỗi khi không tìm thấy destination hoặc thông tin không hợp lệ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Destination không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi xóa destination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi xóa destination"
 */
// [PATCH] /destination/delete/:destinationId
module.exports.delete = async (req, res) => {
  const destinationId = req.params.destinationId;
  if (!destinationId) {
    return res.status(400).json("Yêu cầu gửi lên departureId")
  }
  try {
    const destination = await Destination.findByPk(destinationId);
    if (!destination) {
      return res.status(400).json("Destination không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await destination.update({
      deleted: true,
      deletedBy: adminId
    });
    res.status(200).json({
      message: "Xóa destination thành công",
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi xóa destination"
    })
  }
}

/**
 * @swagger
 * /destination/get-all-destination:
 *   get:
 *     tags:
 *       - Destination
 *     summary: Lấy danh sách tất cả destinations
 *     description: API này cho phép lấy danh sách tất cả destinations với các tham số phân trang, tìm kiếm, và lọc theo trạng thái và danh mục cha.
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Trang hiện tại, mặc định là 1.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Số lượng bản ghi trong một trang, mặc định là 10.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: q
 *         in: query
 *         description: Từ khóa tìm kiếm theo tiêu đề destination.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Beach"
 *       - name: status
 *         in: query
 *         description: Trạng thái của destination (active, inactive).
 *         required: false
 *         schema:
 *           type: string
 *           example: "active"
 *       - name: parentId
 *         in: query
 *         description: ID của danh mục cha, nếu có.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Trả về danh sách destinations với phân trang.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 destinations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       information:
 *                         type: string
 *                       status:
 *                         type: string
 *                       parentId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       400:
 *         description: Lỗi khi danh sách trống hoặc không có kết quả phù hợp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh sách rỗng"
 *       500:
 *         description: Lỗi hệ thống khi lấy danh sách destinations.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy danh sách điểm đến"
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */

// [GET] /destination/get-all-destination
module.exports.getAllDestination = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, q = '', status, parentId
    } = req.query;

    const offset = (page - 1) * limit;

    // Tạo các điều kiện truy vấn SQL từ các tham số truyền vào
    const replacements = {
      q: q ? `%${q}%` : null,
      status: status || null,
      parentId: parentId || null,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // Câu lệnh SQL
    const query = `
      SELECT *
      FROM destination
      WHERE (:q IS NULL OR title LIKE :q)
        AND (:status IS NULL OR status = :status)
        AND (:parentId IS NULL OR parentId = :parentId)
      ORDER BY createdAt DESC
      LIMIT :limit OFFSET :offset;
    `;

    // Thực hiện truy vấn
    const destinations = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Đếm tổng số bản ghi phù hợp
    const countQuery = `
      SELECT COUNT(*) as total
      FROM destination
      WHERE (:q IS NULL OR title LIKE :q)
        AND (:status IS NULL OR status = :status)
        AND (:parentId IS NULL OR parentId = :parentId);
    `;

    const [countResult] = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const total = countResult.total;

    // Nếu không có bản ghi
    if (destinations.length === 0) {
      return res.status(400).json({
        message: "Danh sách rỗng"
      });
    }

    // Phản hồi kết quả
    res.status(200).json({
      destinations: destinations,
      pagination: {
        total: total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách điểm đến',
      error: error.message
    });
  }
}

/**
 * @swagger
 * /destination/change-status/{destinationId}:
 *   patch:
 *     tags:
 *       - Destination
 *     summary: Cập nhật trạng thái của một destination
 *     description: API này cho phép thay đổi trạng thái (active/inactive) của một destination dựa trên destinationId.
 *     parameters:
 *       - name: destinationId
 *         in: path
 *         description: ID của destination cần thay đổi trạng thái.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: status
 *         in: body
 *         description: Trạng thái mới của destination (true hoặc false).
 *         required: true
 *         schema:
 *           type: string
 *           example: "true"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái của destination thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng tái destination thành công"
 *       400:
 *         description: Lỗi khi không tìm thấy destination hoặc thiếu thông tin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Destination không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái destination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi cập nhật trạng thái destination"
 */

// [PATCH] /destination/change-status/:destinationId
module.exports.changeStatus = async (req, res) => {
  const destinationId = req.params.destinationId;
  const {
    status
  } = req.body;
  if (!destinationId) {
    return res.status(400).json("Yêu cầu gửi lên destinationId")
  }
  if (!status) {
    return res.status(400).json("Yêu cầu gửi lên status")
  }
  try {
    const destination = await Destination.findByPk(destinationId);
    if (!destination) {
      return res.status(400).json("Destination không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await destination.update({
      status: status == "true",
      updatedBy: adminId
    });
    res.status(200).json({
      message: "Cập nhật trạng tái destination thành công",
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái destination"
    })
  }
}

/**
 * @swagger
 * /departure/change-status-multiple:
 *   patch:
 *     tags:
 *       - Departure
 *     summary: Cập nhật trạng thái cho nhiều Departure
 *     description: API này cho phép thay đổi trạng thái (active/inactive) cho nhiều Departure cùng lúc.
 *     parameters:
 *       - name: ids
 *         in: body
 *         description: Danh sách các ID của Departure cần thay đổi trạng thái.
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2, 3]
 *       - name: status
 *         in: body
 *         description: Trạng thái mới của các Departure (true hoặc false).
 *         required: true
 *         schema:
 *           type: string
 *           example: "true"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái cho nhiều Departure thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thành công"
 *                 updatedDestinations:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 2, 3]
 *       400:
 *         description: Lỗi khi không gửi lên danh sách ids hoặc thiếu status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên danh sách ids"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật nhiều Departure.
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

    const updatedDestinations = await Destination.update({
      status: status == "true",
      updatedBy: adminId
    }, {
      where: {
        id: ids
      }
    })
    if (updatedDestinations[0] > 0) {
      return res.json({
        message: "Cập nhật thành công",
        updatedDestinations: ids
      });
    } else {
      return res.status(400).json({
        message: "Không tìm thấy Destination để cập nhật"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật nhiều Destination")
  }
}

/**
 * @swagger
 * /destination/get-destination/{destinationId}:
 *   get:
 *     tags:
 *       - Destination
 *     summary: Lấy thông tin chi tiết của một Destination
 *     description: API này cho phép lấy thông tin chi tiết của một Destination theo `destinationId`.
 *     parameters:
 *       - name: destinationId
 *         in: path
 *         description: ID của Destination cần lấy thông tin chi tiết.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lấy thông tin Destination thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 destination:
 *                   type: object
 *                   description: Thông tin chi tiết của Destination.
 *                   example: 
 *                     id: 1
 *                     title: "Hạ Long Bay"
 *                     information: "Một trong những kỳ quan thiên nhiên của thế giới."
 *                     image: "https://example.com/images/halong.jpg"
 *                     status: true
 *       400:
 *         description: Không tìm thấy Destination với `destinationId` đã cung cấp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Destination không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi lấy thông tin Destination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy chi tiết một destination"
 */

// [GET] /destination/get-destination/:destinationId
module.exports.getDestination = async (req, res) => {
  const destinationId = req.params.destinationId;
  if (!destinationId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên destinationId"
    })
  }
  try {
    const destination = await Destination.findByPk(destinationId);
    if (!destination) {
      return res.status(400).json("Destination không tồn tại!")
    }

    res.status(200).json({
      destination: destination,
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết một destination"
    })
  }
}

/**
 * @swagger
 * /destination/get-tree:
 *   get:
 *     tags:
 *       - Destination
 *     summary: Lấy danh sách Destination theo cấu trúc cây
 *     description: API này trả về danh sách các Destination dưới dạng cây, giúp dễ dàng xem các mối quan hệ cha-con giữa các destination.
 *     responses:
 *       200:
 *         description: Lấy danh sách destination thành công dưới dạng cây.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID của destination.
 *                   title:
 *                     type: string
 *                     description: Tiêu đề của destination.
 *                   image:
 *                     type: string
 *                     description: Đường dẫn hình ảnh của destination.
 *                   parentId:
 *                     type: integer
 *                     description: ID của destination cha (nếu có).
 *                   children:
 *                     type: array
 *                     description: Danh sách các destination con.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID của destination con.
 *                         title:
 *                           type: string
 *                           description: Tiêu đề của destination con.
 *                         image:
 *                           type: string
 *                           description: Đường dẫn hình ảnh của destination con.
 *                         parentId:
 *                           type: integer
 *                           description: ID của destination cha.
 *       400:
 *         description: Danh sách destination rỗng hoặc không có destination nào phù hợp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh sách destination rỗng"
 *       500:
 *         description: Lỗi hệ thống khi lấy danh sách destination dưới dạng cây.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi lấy danh sách destination dạng tree"
 */

// [GET] /destination/get-tree
module.exports.getTree = async (req, res) => {
  try {
    const data = await Destination.findAll({
      where: {
        deleted: false,
        status: true
      }
    })
    if (data.length == 0) {
      return res.status(400).json({
        message: "Danh sách destination rỗng"
      })
    }
    const tree = createTreeHelper(data)
    const formatChildren = (node) => {
      return {
        id: node.dataValues.id,
        title: node.dataValues.title,
        image: node.dataValues.image,
        parentId: node.dataValues.parentId,
        children: node.children ? node.children.map(formatChildren) : []
      };
    };

    const formattedTree = tree.map(formatChildren);

    res.status(200).json(formattedTree);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi lấy danh sách destination dạng tree"
    })
  }
}

/**
 * @swagger
 * /destination/get-by-parent/{parentId}:
 *   get:
 *     tags:
 *       - Destination
 *     summary: Lấy danh sách Destination theo parentId
 *     description: API này trả về danh sách các destination thuộc về một destination cha được xác định bởi `parentId`.
 *     parameters:
 *       - name: parentId
 *         in: path
 *         description: ID của destination cha.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy danh sách destination thành công theo parentId.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID của destination.
 *                   title:
 *                     type: string
 *                     description: Tiêu đề của destination.
 *                   image:
 *                     type: string
 *                     description: Đường dẫn hình ảnh của destination.
 *                   parentId:
 *                     type: integer
 *                     description: ID của destination cha.
 *       400:
 *         description: Destination cha không tồn tại hoặc không có destination con nào.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Destination cha không tồn tại"
 *       500:
 *         description: Lỗi hệ thống khi lấy danh sách destination theo parentId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy danh sách destination by parent"
 */

// [GET] /destination//get-by-parent/:parentId
module.exports.getByParentId = async (req, res) => {
  const {
    parentId
  } = req.params;
  try {
    const parentDestination = await Destination.findByPk(parentId);
    if (!parentDestination) {
      return res.status(400).json({
        message: "Destination cha không tồn tại"
      })
    }
    const destinations = await Destination.findAll({
      where: {
        parentId,
        deleted: false
      }
    });
    res.status(200).json(destinations);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách destination by parent"
    });
  }
}