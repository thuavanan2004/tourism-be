const TourDetail = require("../../models/tour-detail.model");
const Tour = require("../../models/tour.model");

/**
 * @swagger
 * /tour_detail/create:
 *   post:
 *     tags:
 *       - TourDetails
 *     summary: Tạo một bản ghi chi tiết tour mới
 *     description: API này tạo một bản ghi chi tiết tour mới với các thông tin về giá và thời gian của tour, cũng như các yếu tố liên quan khác như số lượng, discount, etc.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourId:
 *                 type: integer
 *                 example: 1
 *                 description: Mã tour (bắt buộc)
 *               adultPrice:
 *                 type: number
 *                 example: 100000
 *                 description: Giá cho người lớn (bắt buộc)
 *               childrenPrice:
 *                 type: number
 *                 example: 50000
 *                 description: Giá cho trẻ em
 *               childPrice:
 *                 type: number
 *                 example: 30000
 *                 description: Giá cho trẻ em dưới 6 tuổi
 *               babyPrice:
 *                 type: number
 *                 example: 20000
 *                 description: Giá cho trẻ sơ sinh
 *               singleRoomSupplementPrice:
 *                 type: number
 *                 example: 50000
 *                 description: Phụ thu phòng đơn
 *               stock:
 *                 type: integer
 *                 example: 50
 *                 description: Số lượng vé còn lại (bắt buộc)
 *               dayStart:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-01"
 *                 description: Ngày bắt đầu tour (bắt buộc)
 *               dayReturn:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-07"
 *                 description: Ngày kết thúc tour (bắt buộc)
 *               discount:
 *                 type: number
 *                 example: 10
 *                 description: Giảm giá cho tour (theo %)
 *     responses:
 *       200:
 *         description: Tạo tour detail thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 tourId:
 *                   type: integer
 *                   example: 1
 *                 adultPrice:
 *                   type: number
 *                   example: 100000
 *                 childrenPrice:
 *                   type: number
 *                   example: 50000
 *                 childPrice:
 *                   type: number
 *                   example: 30000
 *                 babyPrice:
 *                   type: number
 *                   example: 20000
 *                 singleRoomSupplementPrice:
 *                   type: number
 *                   example: 50000
 *                 stock:
 *                   type: integer
 *                   example: 50
 *                 dayStart:
 *                   type: string
 *                   example: "2024-12-01"
 *                 dayReturn:
 *                   type: string
 *                   example: "2024-12-07"
 *                 discount:
 *                   type: number
 *                   example: 10
 *       400:
 *         description: Thông tin không hợp lệ hoặc thiếu thông tin bắt buộc.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng gửi đủ dữ liệu lên!"
 *       500:
 *         description: Lỗi khi tạo tour detail.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi tạo một tour detail"
 */

// [POST] /tour_detail/create
module.exports.create = async (req, res) => {
  const {
    tourId,
    adultPrice,
    childrenPrice,
    childPrice,
    babyPrice,
    singleRoomSupplementPrice,
    stock,
    dayStart,
    dayReturn,
    discount
  } = req.body;
  if (!tourId) {
    return res.status(400).json({
      message: "TourId là bắt buộc!"
    })
  }
  if (!adultPrice || !stock || !dayStart || !dayReturn) {
    return res.status(400).json({
      message: "Vui lòng gửi đủ dữ liệu lên!"
    })
  }
  if (new Date(dayStart) > new Date(dayReturn)) {
    return res.status(400).json({
      message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc!"
    });
  }
  try {
    const tourExist = await Tour.findByPk(tourId);
    if (!tourExist) {
      return res.status(400).json({
        message: "Tour không tồn tại!"
      })
    }
    const tourDetail = await TourDetail.create({
      tourId: tourId,
      adultPrice: adultPrice,
      childrenPrice: childrenPrice || 0,
      childPrice: childPrice || 0,
      babyPrice: babyPrice || 0,
      singleRoomSupplementPrice: singleRoomSupplementPrice || 0,
      stock: stock,
      dayStart: dayStart,
      dayReturn: dayReturn,
      discount: discount || 0
    })

    if (!tourDetail) {
      return res.status(400).json({
        message: "Lỗi tạo tour detail"
      })
    }
    res.status(200).json(tourDetail)
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi tạo một tour detail")
  }
}

/**
 * @swagger
 * /tour_detail/edit:
 *   patch:
 *     tags:
 *       - TourDetails
 *     summary: Cập nhật thông tin chi tiết tour
 *     description: API này cho phép cập nhật thông tin chi tiết của một tour cụ thể như giá người lớn, trẻ em, số lượng vé, ngày bắt đầu và kết thúc, giảm giá, v.v.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourDetailId:
 *                 type: integer
 *                 example: 1
 *                 description: Mã chi tiết tour cần cập nhật (bắt buộc)
 *               adultPrice:
 *                 type: number
 *                 example: 100000
 *                 description: Giá cho người lớn
 *               childrenPrice:
 *                 type: number
 *                 example: 50000
 *                 description: Giá cho trẻ em
 *               childPrice:
 *                 type: number
 *                 example: 30000
 *                 description: Giá cho trẻ em dưới 6 tuổi
 *               babyPrice:
 *                 type: number
 *                 example: 20000
 *                 description: Giá cho trẻ sơ sinh
 *               singleRoomSupplementPrice:
 *                 type: number
 *                 example: 50000
 *                 description: Phụ thu phòng đơn
 *               stock:
 *                 type: integer
 *                 example: 50
 *                 description: Số lượng vé còn lại
 *               dayStart:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-01"
 *                 description: Ngày bắt đầu tour
 *               dayReturn:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-07"
 *                 description: Ngày kết thúc tour
 *               discount:
 *                 type: number
 *                 example: 10
 *                 description: Giảm giá cho tour (theo %)
 *     responses:
 *       200:
 *         description: Cập nhật chi tiết tour thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thành công"
 *                 tourDetail:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     tourId:
 *                       type: integer
 *                       example: 1
 *                     adultPrice:
 *                       type: number
 *                       example: 100000
 *                     childrenPrice:
 *                       type: number
 *                       example: 50000
 *                     childPrice:
 *                       type: number
 *                       example: 30000
 *                     babyPrice:
 *                       type: number
 *                       example: 20000
 *                     singleRoomSupplementPrice:
 *                       type: number
 *                       example: 50000
 *                     stock:
 *                       type: integer
 *                       example: 50
 *                     dayStart:
 *                       type: string
 *                       example: "2024-12-01"
 *                     dayReturn:
 *                       type: string
 *                       example: "2024-12-07"
 *                     discount:
 *                       type: number
 *                       example: 10
 *       400:
 *         description: Thông tin không hợp lệ hoặc thiếu thông tin bắt buộc.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ngày bắt đầu không thể lớn hơn ngày kết thúc!"
 *       404:
 *         description: Không tìm thấy bản ghi chi tiết tour với `tourDetailId` đã cho.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tour Detail không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi cập nhật chi tiết tour.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi cập nhật một tour detail"
 */

// [PATCH] /tour_detail/edit
module.exports.edit = async (req, res) => {
  const {
    tourDetailId,
    adultPrice,
    childrenPrice,
    childPrice,
    babyPrice,
    singleRoomSupplementPrice,
    stock,
    dayStart,
    dayReturn,
    discount
  } = req.body;

  if (!tourDetailId) {
    return res.status(400).json({
      message: "tourDetailId là bắt buộc!"
    })
  }
  if (new Date(dayStart) > new Date(dayReturn)) {
    return res.status(400).json({
      message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc!"
    });
  }

  try {
    const tourDetailExist = await TourDetail.findByPk(tourDetailId);
    if (!tourDetailExist) {
      return res.status(400).json({
        message: "Tour Detail không tồn tại!"
      })
    }

    const [updatedCount] = await TourDetail.update({
      adultPrice: adultPrice,
      childrenPrice: childrenPrice || 0,
      childPrice: childPrice || 0,
      babyPrice: babyPrice || 0,
      singleRoomSupplementPrice: singleRoomSupplementPrice || 0,
      stock: stock,
      dayStart: dayStart,
      dayReturn: dayReturn,
      discount: discount || 0
    }, {
      where: {
        id: tourDetailId
      }
    })

    if (updatedCount === 0) {
      return res.status(400).json({
        message: "Không có bản ghi nào được cập nhật. Vui lòng kiểm tra lại."
      });
    }
    const updatedTourDetail = await TourDetail.findByPk(tourDetailId);
    res.status(200).json({
      message: "Cập nhật thành công",
      tourDetail: updatedTourDetail
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật một tour detail")
  }
}

/**
 * @swagger
 * /tour_detail/delete:
 *   delete:
 *     tags:
 *       - TourDetails
 *     summary: Xóa một chi tiết tour
 *     description: API này cho phép xóa một chi tiết tour cụ thể dựa trên `tourDetailId`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourDetailId:
 *                 type: integer
 *                 example: 1
 *                 description: Mã chi tiết tour cần xóa (bắt buộc)
 *     responses:
 *       200:
 *         description: Xóa chi tiết tour thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa tour detail thành công!"
 *       400:
 *         description: Không tìm thấy chi tiết tour với `tourDetailId` đã cho hoặc thiếu thông tin bắt buộc.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tour Detail không tồn tại!"
 *       500:
 *         description: Lỗi hệ thống khi xóa chi tiết tour.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi xoá một tour detail"
 */

// [DELETE] /tour_detail/delete
module.exports.delete = async (req, res) => {
  const {
    tourDetailId
  } = req.body;

  if (!tourDetailId) {
    return res.status(400).json({
      message: "tourDetailId là bắt buộc!"
    })
  }
  try {
    const tourDetailExist = await TourDetail.findByPk(tourDetailId);
    if (!tourDetailExist) {
      return res.status(400).json({
        message: "Tour Detail không tồn tại!"
      })
    }

    await tourDetailExist.destroy();

    res.status(200).json({
      message: "Xóa tour detail thành công!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi xoá một tour detail")
  }
}