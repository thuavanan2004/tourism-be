const slugify = require("slugify");
const Category = require("../../models/category.model");
const sequelize = require("../../config/database");
const {
  QueryTypes
} = require("sequelize");

/**
 * @swagger
 * /category/create:
 *   post:
 *     tags:
 *       - Category
 *     summary: Tạo mới một danh mục
 *     description: API này dùng để tạo mới một danh mục với tiêu đề và mô tả. Tiêu đề sẽ được chuyển thành slug tự động.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề danh mục
 *                 example: "Tour Du Lịch"
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết về danh mục
 *                 example: "Danh mục cho các tour du lịch"
 *     responses:
 *       200:
 *         description: Tạo mới danh mục thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo mới category thành công!"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Tour Du Lịch"
 *                     description:
 *                       type: string
 *                       example: "Danh mục cho các tour du lịch"
 *                     slug:
 *                       type: string
 *                       example: "tour-du-lich"
 *                     createdBy:
 *                       type: integer
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-11T12:00:00Z"
 *       400:
 *         description: Tiêu đề danh mục bị thiếu hoặc lỗi tạo danh mục.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên title"
 *       500:
 *         description: Lỗi hệ thống khi tạo danh mục.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra khi tạo category!"
 */

// [POST] /category/create
module.exports.create = async (req, res) => {
  const {
    title,
    description
  } = req.body;
  if (!title) {
    return res.status(400).json({
      message: "Vui lòng gửi lên title"
    })
  }
  try {
    const slug = slugify(title, {
      replacement: '-',
      lower: true
    });
    const adminId = res.locals.adminId;

    const category = await Category.create({
      title: title,
      description: description || "",
      slug: slug,
      createdBy: adminId
    })

    if (!category) {
      return res.status(400).json("Lỗi không tạo được category!")
    }

    res.status(200).json({
      message: "Tạo mới category thành công!",
      category: category
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi tạo category!"
    })
  }

}

/**
 * @swagger
 * /category/update:
 *   patch:
 *     tags:
 *       - Category
 *     summary: Cập nhật thông tin danh mục
 *     description: API này dùng để cập nhật thông tin danh mục, bao gồm tiêu đề, mô tả, trạng thái và slug.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 description: ID của danh mục cần cập nhật.
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: Tiêu đề danh mục mới.
 *                 example: "Tour Mới"
 *               description:
 *                 type: string
 *                 description: Mô tả mới cho danh mục.
 *                 example: "Danh mục cho các tour du lịch mới."
 *               status:
 *                 type: string
 *                 description: Trạng thái của danh mục, "true" hoặc "false".
 *                 example: "true"
 *     responses:
 *       200:
 *         description: Cập nhật danh mục thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật category thành công"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Tour Mới"
 *                     description:
 *                       type: string
 *                       example: "Danh mục cho các tour du lịch mới."
 *                     slug:
 *                       type: string
 *                       example: "tour-moi"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     updatedBy:
 *                       type: integer
 *                       example: 2
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-11T12:00:00Z"
 *       400:
 *         description: Category không tồn tại hoặc thiếu categoryId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật danh mục.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi update category"
 */

// [PATCH] /category/update 
module.exports.update = async (req, res) => {
  const {
    categoryId,
    title,
    description,
    status
  } = req.body;
  if (!categoryId) {
    return res.status(400).json("Yêu cầu gửi lên categoryId")
  }
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json("Category không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await category.update({
      title: title || category.title,
      description: description || category.description,
      slug: slugify(title || category.title, {
        replacement: '-',
        lower: true
      }),
      status: status === 'true',
      updatedBy: adminId
    });
    res.status(200).json({
      message: "Cập nhật category thành công",
      category: category
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi update category"
    })
  }
}

/**
 * @swagger
 * /category/delete/{categoryId}:
 *   patch:
 *     tags:
 *       - Category
 *     summary: Xóa danh mục
 *     description: API này dùng để xóa danh mục bằng cách cập nhật trạng thái `deleted` của danh mục đó thành `true`.
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: ID của danh mục cần xóa.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Xóa danh mục thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa category thành công"
 *       400:
 *         description: Category không tồn tại hoặc thiếu categoryId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi xóa danh mục.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi xóa category"
 */

// [PATCH] /category/delete/:categoryId
module.exports.delete = async (req, res) => {
  const categoryId = req.params.categoryId;
  if (!categoryId) {
    return res.status(400).json("Yêu cầu gửi lên categoryId")
  }
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json("Category không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await category.update({
      deleted: true,
      deletedBy: adminId
    });
    res.status(200).json({
      message: "Xóa category thành công",
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi xóa category"
    })
  }
}

/**
 * @swagger
 * /category/get-all-category:
 *   get:
 *     tags:
 *       - Category
 *     summary: Lấy tất cả danh mục
 *     description: API này dùng để lấy danh sách tất cả danh mục, có thể lọc theo trạng thái (`status`).
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         description: Trạng thái của danh mục (true hoặc false) để lọc.
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: Danh sách danh mục được trả về thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Danh mục du lịch"
 *                       description:
 *                         type: string
 *                         example: "Danh mục tour du lịch trong nước."
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-11T10:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-11T10:00:00Z"
 *       400:
 *         description: Danh sách category rỗng.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Danh sách category rỗng"
 *       500:
 *         description: Lỗi hệ thống khi lấy danh sách category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy danh sách category"
 */
// [GET] /category/get-all-category 
module.exports.getAllCategory = async (req, res) => {
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

    const categories = await Category.findAll({
      where: whereCondition
    });

    if (categories.length == 0) {
      return res.status(400).json("Danh sách category rỗng");
    }

    res.status(200).json({
      categories: categories
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách category"
    })
  }
}

/**
 * @swagger
 * /category/change-status/{categoryId}:
 *   patch:
 *     tags:
 *       - Category
 *     summary: Cập nhật trạng thái của category
 *     description: API này dùng để thay đổi trạng thái của một danh mục. Trạng thái có thể là `true` hoặc `false`.
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: ID của danh mục cần cập nhật trạng thái.
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
 *                 description: Trạng thái mới của danh mục.
 *                 example: true
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng thái category thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ (không gửi đầy đủ thông tin hoặc category không tồn tại).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Yêu cầu gửi lên status"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi cập nhật trạng thái category"
 */
// [PATCH] /category/change-status/:categoryId
module.exports.changeStatus = async (req, res) => {
  const categoryId = req.params.categoryId;
  const {
    status
  } = req.body;
  if (!categoryId) {
    return res.status(400).json("Yêu cầu gửi lên categoryId")
  }
  if (status == undefined) {
    return res.status(400).json("Yêu cầu gửi lên status")
  }
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json("Category không tồn tại!")
    }
    const adminId = res.locals.adminId;

    await category.update({
      status: status,
      updatedBy: adminId
    });
    res.status(200).json({
      message: "Cập nhật trạng tái category thành công",
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái category"
    })
  }
}

/**
 * @swagger
 * /category/change-status-multiple:
 *   patch:
 *     tags:
 *       - Category
 *     summary: Cập nhật trạng thái cho nhiều danh mục
 *     description: API này dùng để thay đổi trạng thái của nhiều danh mục cùng lúc. Trạng thái có thể là `true` hoặc `false`.
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
 *                 description: Danh sách ID của các danh mục cần cập nhật trạng thái.
 *                 example: [1, 2, 3]
 *               status:
 *                 type: boolean
 *                 description: Trạng thái mới cho các danh mục.
 *                 example: true
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công cho các danh mục.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thành công"
 *                 updatedCategories:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 2, 3]
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không tìm thấy danh mục để cập nhật.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên danh sách ids"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật nhiều danh mục.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi cập nhật nhiều category"
 */

// [PATCH] /category/change-status-multiple
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

    const updatedCategories = await Category.update({
      status: status == "true",
      updatedBy: adminId
    }, {
      where: {
        id: ids
      }
    })
    if (updatedCategories[0] > 0) {
      return res.json({
        message: "Cập nhật thành công",
        updatedCategories: ids
      });
    } else {
      return res.status(400).json({
        message: "Không tìm thấy category để cập nhật"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật nhiều category")
  }
}

/**
 * @swagger
 * /category/get-category/{categoryId}:
 *   get:
 *     tags:
 *       - Category
 *     summary: Lấy thông tin chi tiết của một danh mục và các tour liên quan
 *     description: API này trả về thông tin của một danh mục cùng với các tour đã được liên kết với danh mục đó.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của danh mục cần lấy thông tin.
 *         example: 1
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin danh mục và các tour liên quan.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: object
 *                   description: Thông tin chi tiết của danh mục.
 *                   example:
 *                     id: 1
 *                     title: "Tour Miền Bắc"
 *                     description: "Các tour du lịch khám phá miền Bắc"
 *                 tours:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         description: Tên tour.
 *                         example: "Tour Hà Nội - Sapa"
 *                       source:
 *                         type: string
 *                         description: Hình ảnh đại diện của tour.
 *                         example: "image1.jpg"
 *                       code:
 *                         type: string
 *                         description: Mã tour.
 *                         example: "TOUR001"
 *                       status:
 *                         type: boolean
 *                         description: Trạng thái tour.
 *                         example: true
 *                       isFeatured:
 *                         type: boolean
 *                         description: Tour nổi bật hay không.
 *                         example: false
 *                       adultPrice:
 *                         type: number
 *                         format: float
 *                         description: Giá tour cho người lớn.
 *                         example: 500000
 *                       dayStart:
 *                         type: string
 *                         format: date
 *                         description: Ngày bắt đầu tour.
 *                         example: "2024-12-01"
 *                       dayReturn:
 *                         type: string
 *                         format: date
 *                         description: Ngày kết thúc tour.
 *                         example: "2024-12-05"
 *                       categories:
 *                         type: string
 *                         description: Tên danh mục của tour.
 *                         example: "Miền Bắc"
 *                       destination:
 *                         type: string
 *                         description: Điểm đến của tour.
 *                         example: "Sapa"
 *                       departure:
 *                         type: string
 *                         description: Điểm xuất phát của tour.
 *                         example: "Hà Nội"
 *                       transportation:
 *                         type: string
 *                         description: Phương tiện di chuyển trong tour.
 *                         example: "Xe khách"
 *       400:
 *         description: Danh mục không tồn tại hoặc không gửi đủ thông tin categoryId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi lên categoryId"
 *       500:
 *         description: Lỗi hệ thống khi lấy thông tin chi tiết danh mục và các tour.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi lấy chi tiết một category"
 */
// [GET] /category/get-category/:categoryId
module.exports.getCategory = async (req, res) => {
  const categoryId = req.params.categoryId;
  if (!categoryId) {
    return res.status(400).json({
      message: "Vui lòng gửi lên categoryId"
    })
  }
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json("Category không tồn tại!")
    }
    const query = `
    SELECT 
        tours.title, 
        IFNULL(images.source, 'default_image.jpg') AS source, 
        tours.code, 
        tours.status, 
        tours.isFeatured, 
        tour_detail.adultPrice, 
        MIN(tour_detail.dayStart) AS dayStart, 
        tour_detail.dayReturn, 
        categories.title AS categories,
        destination.title AS destination, 
        departure.title AS departure, 
        transportation.title AS transportation
      FROM tours
      JOIN tours_categories ON tours.id = tours_categories.tourId
      JOIN categories ON tours_categories.categoryId = categories.id
      JOIN destination ON tours.destinationId = destination.id
      JOIN transportation ON transportation.id = tours.transportationId
      JOIN departure ON departure.id = tours.departureId
      JOIN tour_detail ON tour_detail.tourId = tours.id
      LEFT JOIN images ON images.tourId = tours.id
      WHERE
        tours.status = 1
        AND tours.deleted = 0
        AND DATEDIFF(tour_detail.dayStart, NOW()) > 0
        AND categories.deleted = 0
        AND categories.status = 1
        AND DATEDIFF(tour_detail.dayStart, NOW()) >= 0
        AND tours_categories.categoryId = :categoryId
      GROUP BY tours.id
    `
    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: {
        categoryId: categoryId
      }
    })

    res.status(200).json({
      category: category,
      tours: tours
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết một category"
    })
  }
}