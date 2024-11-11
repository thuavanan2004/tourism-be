const generateCodeHelper = require("../../helpers/generateCode.helper");
const transformeDataHelper = require("../../helpers/transformeData");
const slugify = require("slugify");
const unidecode = require("unidecode")
const Tour = require("../../models/tour.model");
const sequelize = require("../../config/database");
const Category = require("../../models/category.model");
const TourCategory = require("../../models/tour-category.model");
const Schedule = require("../../models/schedule.model");
const Information = require("../../models/information.model");
const TourDetail = require("../../models/tour-detail.model");
const Image = require("../../models/image.model");
const Destination = require("../../models/destination.model");
const Departure = require("../../models/departure.model");
const Transportation = require("../../models/transportation.model");
const {
  QueryTypes,
} = require("sequelize");

/**
 * @swagger
 * /tours/search:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Tìm kiếm tour theo tiêu đề
 *     description: Trả về danh sách các tour phù hợp dựa trên các tiêu chí tìm kiếm.
 *     operationId: searchTours
 *     parameters:
 *       - name: title
 *         in: query
 *         required: false
 *         description: Tiêu đề tour để tìm kiếm.
 *         schema:
 *           type: string
 *           example: "Tour du lịch Đà Nẵng"
 *     responses:
 *       200:
 *         description: Danh sách các tour tìm được
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Tour Đà Nẵng 2024"
 *                   source:
 *                     type: string
 *                     example: "https://example.com/images/default_image.jpg"
 *                   code:
 *                     type: string
 *                     example: "DN2024"
 *                   status:
 *                     type: integer
 *                     example: 1
 *                   isFeatured:
 *                     type: boolean
 *                     example: true
 *                   adultPrice:
 *                     type: number
 *                     format: float
 *                     example: 1200000.0
 *                   dayStart:
 *                     type: string
 *                     format: date
 *                     example: "2024-12-25"
 *                   dayReturn:
 *                     type: string
 *                     format: date
 *                     example: "2024-12-30"
 *                   categories:
 *                     type: string
 *                     example: "Du lịch biển"
 *                   destination:
 *                     type: string
 *                     example: "Đà Nẵng"
 *                   departure:
 *                     type: string
 *                     example: "Hà Nội"
 *                   transportation:
 *                     type: string
 *                     example: "Máy bay"
 *       404:
 *         description: Không tìm thấy tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy tour nào."
 *       500:
 *         description: Có lỗi xảy ra khi tìm kiếm tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra khi tìm kiếm tour."
 */

//[GET] /tours/search
module.exports.search = async (req, res) => {
  const {
    title,
  } = req.query;

  const replacements = {};

  // Tìm kiếm theo tiêu đề
  if (title) {
    const titleUnidecode = unidecode(title);
    const titleSlug = titleUnidecode.replace(/\s+/g, "-");
    const titleRegex = `%${titleSlug}%`;
    var querySearch = "AND tours.slug LIKE :titleSlug";
    replacements.titleSlug = titleRegex;
  }


  try {
    let query = `
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
    JOIN tour_detail ON tour_detail.tourId = tours.id
    JOIN departure ON departure.id = tours.departureId
    JOIN images ON images.tourId = tours.id
    WHERE
      tours.status = 1
      AND tours.deleted = 0
      AND DATEDIFF(tour_detail.dayStart, NOW()) > 0
      AND categories.deleted = 0
      AND categories.status = 1
      ${querySearch}
    GROUP BY tours.id, tours.title, tours.code, tours.status, tours.isFeatured, 
    destination.title, departure.title, transportation.title
  `;
    // Gọi truy vấn cơ sở dữ liệu và chờ kết quả
    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });

    if (tours.length === 0) {
      return res.status(404).json({
        message: 'Không tìm thấy tour nào.'
      });
    }

    res.status(200).json(tours);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Có lỗi xảy ra khi tìm kiếm tour.'
    });
  }
}

/**
 * @swagger
 * /tours/create:
 *   post:
 *     tags:
 *       - Tours
 *     summary: Tạo một tour mới
 *     description: Tạo một tour mới với thông tin về tên, lịch trình, chi tiết, hình ảnh, và các thuộc tính khác.
 *     operationId: createTour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tên của tour
 *                 example: "Tour Mùa Xuân 2024"
 *               isFeatured:
 *                 type: boolean
 *                 description: Xác định xem tour có phải là tour nổi bật không
 *                 example: false
 *               information:
 *                 type: string
 *                 description: Thông tin thêm về tour dưới dạng JSON string
 *                 example: '{"attractions": "Điểm du lịch nổi bật", "cuisine": "Ẩm thực đặc trưng"}'
 *               schedule:
 *                 type: string
 *                 description: Lịch trình của tour dưới dạng JSON string
 *                 example: '[{"day": "Ngày 1", "title": "Hà Nội - Sapa", "information": "Di chuyển và tham quan"}]'
 *               departureId:
 *                 type: integer
 *                 description: ID của địa điểm khởi hành
 *                 example: 1
 *               transportationId:
 *                 type: integer
 *                 description: ID của phương tiện di chuyển
 *                 example: 2
 *               destinationId:
 *                 type: integer
 *                 description: ID của điểm đến
 *                 example: 3
 *               categoryId:
 *                 type: integer
 *                 description: ID của danh mục tour
 *                 example: 4
 *               infoImage:
 *                 type: string
 *                 description: Thông tin về hình ảnh dưới dạng JSON string
 *                 example: '[{"name": "ảnh chính", "isMain": "true"}]'
 *               images:
 *                 type: array
 *                 description: Danh sách các đường dẫn hình ảnh
 *                 items:
 *                   type: file
 *                 example: key - image
 *               tour_detail:
 *                 type: string
 *                 description: Chi tiết của tour dưới dạng JSON string
 *                 example: '[{"adultPrice": 1000, "stock": 20, "dayStart": "2024-01-01", "dayReturn": "2024-01-07"}]'
 *     responses:
 *       200:
 *         description: Tour mới được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo tour mới thành công!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Tour Mùa Xuân 2024"
 *                     code:
 *                       type: string
 *                       example: "SPRING2024"
 *                     slug:
 *                       type: string
 *                       example: "tour-mua-xuan-2024"
 *                     isFeatured:
 *                       type: boolean
 *                       example: false
 *                     departureId:
 *                       type: integer
 *                       example: 1
 *                     destinationId:
 *                       type: integer
 *                       example: 3
 *                     transportationId:
 *                       type: integer
 *                       example: 2
 *                     information:
 *                       type: object
 *                       description: Thông tin về tour đã lưu
 *                     tourDetail:
 *                       type: array
 *                       description: Các chi tiết của tour
 *                       items:
 *                         type: object
 *                     schedule:
 *                       type: array
 *                       description: Lịch trình của tour
 *                       items:
 *                         type: object
 *                     images:
 *                       type: array
 *                       description: Các hình ảnh của tour
 *                       items:
 *                         type: object
 *       400:
 *         description: Yêu cầu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Title là bắt buộc!"
 *       500:
 *         description: Có lỗi xảy ra khi tạo tour mới
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi tạo tour mới!"
 */

//[POST] /tours/create
module.exports.create = async (req, res) => {
  const {
    title,
    isFeatured,
    information,
    schedule,
    departureId,
    transportationId,
    destinationId,
    categoryId,
    infoImage,
    images,
    tour_detail
  } = req.body;

  if (!title) {
    return res.status(400).json("Title là bắt buộc!");
  }
  if (!tour_detail) {
    return res.status(400).json("Tour_detail là bắt buộc!");
  }
  if (!departureId) {
    return res.status(400).json("DepartureId là bắt buộc!");
  }
  if (!transportationId) {
    return res.status(400).json("TransportaionId là bắt buộc!");
  }
  if (!destinationId) {
    return res.status(400).json("DestinationId là bắt buộc!");
  }
  if (!categoryId) {
    return res.status(400).json("CategoryId là bắt buộc!");
  }

  try {
    const transaction = await sequelize.transaction();
    const code = generateCodeHelper.generateTourCode();
    const slug = slugify(title, {
      lower: true
    });

    const tour = await Tour.create({
      title: title,
      code: code,
      slug: slug,
      isFeatured: isFeatured || 0,
      departureId: departureId,
      destinationId: destinationId,
      transportationId: transportationId
    }, {
      transaction: transaction
    });

    await TourCategory.create({
      tourId: tour.id,
      categoryId: categoryId
    }, {
      transaction: transaction
    });

    if (information) {
      const informationParse = JSON.parse(information);
      var informationRecord = await Information.create({
        tourId: tour.id,
        attractions: informationParse.attractions || "",
        cuisine: informationParse.cuisine || "",
        suitableObject: informationParse.suitableObject || "",
        idealTime: informationParse.idealTime || "",
        vehicle: informationParse.vehicle || "",
        promotion: informationParse.promotion || ""
      }, {
        transaction
      });
    }


    if (schedule && JSON.parse(schedule).length > 0) {
      const scheduleParse = JSON.parse(schedule);

      var scheduleRecords = await Promise.all(scheduleParse.map(async (item) => {
        if (!item.day || !item.title) {
          throw new Error("Yêu cầu gửi đủ thông tin schedule");
        }
        return await Schedule.create({
          tourId: tour.id,
          day: item.day,
          title: item.title,
          information: item.information || ""
        }, {
          transaction
        });
      }));
    }

    if (tour_detail && JSON.parse(tour_detail).length > 0) {
      const tourDetailParse = JSON.parse(tour_detail);

      var tourDetailRecords = await Promise.all(tourDetailParse.map(async (item) => {
        if (!item.adultPrice || !item.stock || !item.dayStart || !item.dayReturn) {
          throw new Error("Yêu cầu gửi đủ thông tin tour_detail");
        }
        return await TourDetail.create({
          tourId: tour.id,
          adultPrice: item.adultPrice,
          childrenPrice: item.childrenPrice || 0,
          childPrice: item.childPrice || 0,
          babyPrice: item.babyPrice || 0,
          singleRoomSupplementPrice: item.singleRoomSupplementPrice || 0,
          stock: item.stock,
          dayStart: item.dayStart,
          dayReturn: item.dayReturn,
          discount: item.discount || 0
        }, {
          transaction
        })
      }));
    }


    if (images && Array.isArray(images) && images.length > 0) {
      if (!infoImage || JSON.parse(infoImage).length !== images.length) {
        throw new Error("infoImage không được xác định đúng hoặc không khớp với độ dài của hình ảnh.");
      }

      const infoImageParse = JSON.parse(infoImage);
      const dataImages = images.map((file, index) => ({
        tourId: tour.id,
        source: file,
        name: infoImageParse[index].name || "",
        isMain: infoImageParse[index].isMain === 'true'
      }));

      var imageRecords = await Image.bulkCreate(dataImages, {
        transaction
      });
    }

    await transaction.commit();
    res.status(200).json({
      message: "Tạo tour mới thành công!",
      data: {
        id: tour.id,
        title: tour.title,
        code: tour.code,
        slug: tour.slug,
        isFeatured: tour.isFeatured,
        departureId: tour.departureId,
        destinationId: tour.destinationId,
        transportationId: tour.transportationId,
        information: informationRecord,
        tourDetail: tourDetailRecords,
        schedule: scheduleRecords,
        images: imageRecords
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi khi tạo tour mới!"
    })
  }
}

/**
 * @swagger
 * /tours/edit/{tourId}:
 *   patch:
 *     summary: Chỉnh sửa thông tin tour
 *     description: Cập nhật thông tin của một tour đã tồn tại, bao gồm tên, trạng thái, lịch trình, hình ảnh, thông tin chi tiết tour, v.v.
 *     tags:
 *       - Tours
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         description: ID của tour cần chỉnh sửa
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *               information:
 *                 type: string
 *               schedule:
 *                 type: string
 *               departureId:
 *                 type: integer
 *               transportationId:
 *                 type: integer
 *               destinationId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               infoImage:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tour_detail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật tour thành công
 *       400:
 *         description: TourId là bắt buộc
 *       404:
 *         description: Không tìm thấy tour
 *       500:
 *         description: Có lỗi khi chỉnh sửa thông tin tour
 */
// [PATCH] /tours/edit/:tourId
module.exports.edit = async (req, res) => {
  let transaction = await sequelize.transaction();
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json("TourId là bắt buộc!");
  }

  const {
    title,
    status,
    isFeatured,
    information,
    schedule,
    departureId,
    transportationId,
    destinationId,
    categoryId,
    infoImage,
    images,
    tour_detail
  } = req.body;

  try {
    const tour = await Tour.findOne({
      where: {
        id: tourId
      },
      transaction
    });

    if (!tour) {
      return res.status(404).json("Không tìm thấy tour");
    }
    if (title) {
      var slug = slugify(title, {
        lower: true
      })
    }

    await tour.update({
      title: title || tour.title,
      slug: slug || tour.slug,
      status: status || tour.status,
      isFeatured: isFeatured !== undefined ? isFeatured : tour.isFeatured,
      departureId: departureId || tour.departureId,
      transportationId: transportationId || tour.transportationId,
      destinationId: destinationId || tour.destinationId
    }, {
      transaction
    });

    // Update categoryId for tour
    if (categoryId) {
      await TourCategory.update({
        categoryId
      }, {
        where: {
          tourId
        },
        transaction
      });
    }

    // Update information
    if (information) {
      const informationParse = JSON.parse(information);
      const record = await Information.findOne({
        where: {
          tourId
        },
        transaction
      });

      await Information.update({
        attractions: informationParse.attractions || record.attractions,
        cuisine: informationParse.cuisine || record.cuisine,
        suitableObject: informationParse.suitableObject || record.suitableObject,
        idealTime: informationParse.idealTime || record.idealTime,
        vehicle: informationParse.vehicle || record.vehicle,
        promotion: informationParse.promotion || record.promotion
      }, {
        where: {
          tourId
        },
        transaction
      });
    }

    // Update schedule
    if (schedule && JSON.parse(schedule).length > 0) {
      await Schedule.destroy({
        where: {
          tourId
        },
        transaction
      });

      const scheduleParse = JSON.parse(schedule);
      await Promise.all(scheduleParse.map(item => {
        if (!item.day || !item.title) {
          throw new Error("Yêu cầu gửi đủ thông tin Schedule");
        }
        return Schedule.create({
          tourId,
          day: item.day,
          title: item.title,
          information: item.information || ""
        }, {
          transaction
        });
      }));
    }

    // Update images
    if (images && Array.isArray(images) && images.length > 0) {
      await Image.destroy({
        where: {
          tourId
        },
        transaction
      });

      if (!infoImage || JSON.parse(infoImage).length !== images.length) {
        throw new Error("infoImage không được xác định đúng hoặc không khớp với độ dài của hình ảnh.");
      }

      const infoImageParse = JSON.parse(infoImage);
      const dataImages = images.map((file, index) => ({
        tourId,
        source: file,
        name: infoImageParse[index].name || "",
        isMain: infoImageParse[index].isMain === 'true'
      }));

      await Image.bulkCreate(dataImages, {
        transaction
      });
    }

    // Update tour detail
    if (tour_detail && JSON.parse(tour_detail).length > 0) {
      const tourDetailParse = JSON.parse(tour_detail);

      await Promise.all(tourDetailParse.map(async (item) => {
        const tourDetailExist = TourDetail.findOne({
          where: {
            id: item.id,
            tourId: tourId
          }
        })
        if (!tourDetailExist) {
          throw new Error("Tour detail không tồn tại!");
        }

        if (!item.adultPrice || !item.stock || !item.dayStart || !item.dayReturn) {
          throw new Error("Yêu cầu gửi đủ thông tin tour_detail");
        }

        return await TourDetail.update({
          tourId: tourId,
          adultPrice: item.adultPrice,
          childrenPrice: item.childrenPrice || 0,
          childPrice: item.childPrice || 0,
          babyPrice: item.babyPrice || 0,
          singleRoomSupplementPrice: item.singleRoomSupplementPrice || 0,
          stock: item.stock,
          dayStart: item.dayStart,
          dayReturn: item.dayReturn,
          discount: item.discount || 0
        }, {
          where: {
            id: item.id
          },
          transaction
        })
      }));
    }

    await transaction.commit();
    res.status(200).json("Cập nhật tour thành công");

  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return res.status(500).json("Có lỗi khi chỉnh sửa thông tin một tour");
  }
}

/**
 * @swagger
 * /tours/detail/{tourId}:
 *   get:
 *     summary: "Lấy thông tin chi tiết của một tour du lịch"
 *     description: "Trả về các thông tin chi tiết của tour du lịch bao gồm thông tin, lịch trình, điểm đến, phương tiện di chuyển, hình ảnh, và các chi tiết tour."
 *     tags: 
 *       - Tours
 *     parameters:
 *       - name: "tourId"
 *         in: "path"
 *         description: "ID của tour cần lấy thông tin chi tiết"
 *         required: true
 *         schema:
 *           type: "string"
 *     responses:
 *       200:
 *         description: "Thông tin chi tiết của tour"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 tour:
 *                   type: "object"
 *                   description: "Thông tin cơ bản của tour"
 *                 information:
 *                   type: "object"
 *                   description: "Thông tin bổ sung về tour"
 *                 schedule:
 *                   type: "array"
 *                   description: "Danh sách lịch trình của tour"
 *                   items:
 *                     type: "object"
 *                 destination:
 *                   type: "object"
 *                   description: "Thông tin về điểm đến"
 *                 departure:
 *                   type: "object"
 *                   description: "Thông tin về điểm xuất phát"
 *                 transportation:
 *                   type: "object"
 *                   description: "Thông tin về phương tiện di chuyển"
 *                 images:
 *                   type: "array"
 *                   description: "Danh sách hình ảnh của tour"
 *                   items:
 *                     type: "object"
 *                 tourDetails:
 *                   type: "array"
 *                   description: "Chi tiết tour (giá, số lượng, v.v.)"
 *                   items:
 *                     type: "object"
 *       400:
 *         description: "Không tìm thấy tour"
 *         content:
 *           application/json:
 *             schema:
 *               type: "string"
 *               example: "Không tìm thấy tour"
 *       500:
 *         description: "Lỗi khi lấy thông tin tour"
 *         content:
 *           application/json:
 *             schema:
 *               type: "string"
 *               example: "Có lỗi khi lấy ra thông tin một tour"
 */
//[GET] /tours/detail/:tourId
module.exports.getTour = async (req, res) => {
  const tourId = req.params.tourId;

  try {
    const tour = await Tour.findOne({
      where: {
        id: tourId,
        deleted: false
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deleted', 'deletedAt', 'deletedBy', 'updatedBy']
      }
    });
    if (!tour) {
      return res.status(400).json("Không tìm thấy tour");
    }
    const information = await Information.findOne({
      where: {
        tourId: tourId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });
    const schedule = await Schedule.findAll({
      where: {
        tourId: tourId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });
    const destination = await Destination.findOne({
      where: {
        id: tour.destinationId
      },
      attributes: {
        exclude: ['deleted']
      }
    });
    const departure = await Departure.findOne({
      where: {
        id: tour.departureId
      }
    });
    const transportation = await Transportation.findOne({
      where: {
        id: tour.transportationId
      }
    });
    const images = await Image.findAll({
      where: {
        tourId: tourId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });
    const tourDetails = await TourDetail.findAll({
      where: {
        tourId: tourId
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'tourId']
      }
    });
    res.status(200).json({
      tour: tour,
      information: information,
      schedule: schedule,
      destination: destination,
      departure: departure,
      transportation: transportation,
      images: images,
      tourDetails: tourDetails
    })

  } catch (error) {
    console.log(error);
    res.status(500).json("Có lỗi khi lấy ra thông tin một tour")
  }
}


/**
 * @swagger
 * /tours/remove/{tourId}:
 *   patch:
 *     summary: "Xóa tour du lịch"
 *     description: "Cập nhật trạng thái của tour thành đã xóa (deleted: true)."
 *     tags: 
 *       - Tours
 *     parameters:
 *       - name: "tourId"
 *         in: "path"
 *         description: "ID của tour cần xóa"
 *         required: true
 *         schema:
 *           type: "string"
 *     responses:
 *       200:
 *         description: "Xóa tour thành công"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   type: "string"
 *                   example: "Xóa tour thành công!"
 *       400:
 *         description: "TourId là bắt buộc"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 message:
 *                   type: "string"
 *                   example: "TourId là bắt buộc!"
 *       500:
 *         description: "Lỗi khi xóa tour"
 *         content:
 *           application/json:
 *             schema:
 *               type: "string"
 *               example: "Lỗi khi xóa một tour!"
 */
// [PATCH] /tours/remove/:tourId
module.exports.removeTour = async (req, res) => {
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json({
      message: "TourId là bắt buộc!"
    });
  }
  try {
    await Tour.update({
      deleted: true
    }, {
      where: {
        id: tourId
      }
    });

    res.status(200).json({
      message: "Xóa tour thành công!"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi khi xóa một tour!");
  }
}

/**
 * @swagger
 * /tours/get-all-tour:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy tất cả các tour với các bộ lọc tùy chọn
 *     description: API này cho phép người dùng lấy danh sách các tour với các bộ lọc khác nhau như điểm đến, nơi khởi hành, ngày bắt đầu, loại phương tiện và danh mục.
 *     parameters:
 *       - in: query
 *         name: destinationTo
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của điểm đến để lọc tour theo điểm đến.
 *       - in: query
 *         name: departureFrom
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của nơi khởi hành để lọc tour theo nơi khởi hành.
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu tour .
 *       - in: query
 *         name: transTypeId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của loại phương tiện để lọc tour theo phương tiện.
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của danh mục để lọc tour theo danh mục.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Trạng thái của tour. 1 là hoạt động, 0 là không hoạt động.
 *       - in: query
 *         name: isFeatured
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Cờ lọc tour theo tour nổi bật. 1 là nổi bật, 0 là không nổi bật.
 *       - in: query
 *         name: sortOder
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *         description: Thứ tự sắp xếp tour theo giá (giá người lớn).
 *     responses:
 *       200:
 *         description: Danh sách các tour phù hợp với bộ lọc.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Tên của tour.
 *                   source:
 *                     type: string
 *                     description: Đường dẫn hình ảnh (hoặc hình ảnh mặc định nếu không có).
 *                   code:
 *                     type: string
 *                     description: Mã của tour.
 *                   status:
 *                     type: integer
 *                     description: Trạng thái của tour (1 là hoạt động, 0 là không hoạt động).
 *                   isFeatured:
 *                     type: integer
 *                     description: Liệu tour có phải là tour nổi bật không.
 *                   adultPrice:
 *                     type: number
 *                     description: Giá tour cho người lớn.
 *                   dayStart:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày bắt đầu sớm nhất của tour.
 *                   dayReturn:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày kết thúc tour.
 *                   categories:
 *                     type: string
 *                     description: Danh mục của tour.
 *                   destination:
 *                     type: string
 *                     description: Điểm đến của tour.
 */

// [GET] /tour/get-all-tour
module.exports.getAllTour = async (req, res) => {
  const {
    destinationTo,
    departureFrom,
    fromDate,
    transTypeId,
    categoryId,
    status,
    isFeatured,
    sortOder
  } = req.query;

  try {
    let sortQuery = '';
    if (sortOder) {
      sortQuery = `ORDER BY tour_detail.adultPrice ${sortOder === 'desc' ? 'DESC' : 'ASC'}`;
    }

    var statusQuery = '';
    if (status) {
      statusQuery = `AND tours.status=${status === '1'}`
    }

    var isFeaturedQuery = '';
    if (isFeatured) {
      isFeaturedQuery = `AND tours.isFeatured=${isFeatured}`
    }

    var destinationQuery = '';
    if (destinationTo) {
      destinationQuery = `AND tours.departureId=${destinationTo}`
    }

    var departureQuery = '';
    if (departureFrom) {
      departureQuery = `AND tours.destinationId=${departureFrom}`
    }

    var transportationQuery = '';
    if (transTypeId) {
      transportationQuery = `AND tours.transportationId=${transTypeId}`
    }

    var categoryQuery = '';
    if (categoryId) {
      categoryQuery = `AND categories.id=${categoryId}`
    }

    var dayQuery = '';
    if (fromDate) {
      const [year, month, day] = fromDate.split("-");
      const dayFormat = new Date(year, month - 1, day);
      const formattedDate = dayFormat.toISOString().slice(0, 19).replace('T', ' ');
      dayQuery = `AND tour_detail.dayStart > '${formattedDate}'`
    }

    const query = `
    SELECT 
      tours.title, 
      IFNULL(MAX(images.source), 'default_image.jpg') AS source,
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
    LEFT JOIN tours_categories ON tours.id = tours_categories.tourId
    LEFT JOIN categories ON tours_categories.categoryId = categories.id
    LEFT JOIN destination ON tours.destinationId = destination.id
    LEFT JOIN transportation ON transportation.id = tours.transportationId
    LEFT JOIN tour_detail ON tour_detail.tourId = tours.id
    LEFT JOIN departure ON departure.id = tours.departureId
    LEFT JOIN images ON images.tourId = tours.id
    WHERE
      categories.status = 1
      AND categories.deleted = 0
      AND images.isMain = 1
      AND tours.deleted = false
      AND tours.status = 1
      AND DATEDIFF(tour_detail.dayStart, NOW()) >= 0
      ${statusQuery}
      ${isFeaturedQuery}
      ${categoryQuery}
      ${departureQuery}
      ${transportationQuery} 
      ${destinationQuery}
      ${dayQuery}
    GROUP BY tours.id, destination.title, departure.title, transportation.title
      ${sortQuery}
    `;

    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    if (tours.length == 0) {
      return res.status(400).json({
        message: "Không lấy được tour nào!"
      })
    }

    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching category tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu"
    });
  }
};

/**
 * @swagger
 * /tours/expired:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy danh sách các tour đã hết hạn
 *     description: API này trả về danh sách các tour đã hết hạn với các bộ lọc tùy chọn như điểm đến, nơi khởi hành, ngày bắt đầu, loại phương tiện, danh mục và trạng thái.
 *     parameters:
 *       - in: query
 *         name: destinationTo
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của điểm đến để lọc tour theo điểm đến.
 *       - in: query
 *         name: departureFrom
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của nơi khởi hành để lọc tour theo nơi khởi hành.
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu tour .
 *       - in: query
 *         name: transTypeId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của loại phương tiện để lọc tour theo phương tiện.
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của danh mục để lọc tour theo danh mục.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Trạng thái của tour. 1 là hoạt động, 0 là không hoạt động.
 *       - in: query
 *         name: isFeatured
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Cờ lọc tour theo tour nổi bật. 1 là nổi bật, 0 là không nổi bật.
 *       - in: query
 *         name: sortOder
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *         description: Thứ tự sắp xếp tour theo giá (giá người lớn).
 *     responses:
 *       200:
 *         description: Danh sách các tour đã hết hạn phù hợp với bộ lọc.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Tên của tour.
 *                   source:
 *                     type: string
 *                     description: Đường dẫn hình ảnh (hoặc hình ảnh mặc định nếu không có).
 *                   code:
 *                     type: string
 *                     description: Mã của tour.
 *                   status:
 *                     type: integer
 *                     description: Trạng thái của tour (1 là hoạt động, 0 là không hoạt động).
 *                   isFeatured:
 *                     type: integer
 *                     description: Liệu tour có phải là tour nổi bật không.
 *                   adultPrice:
 *                     type: number
 *                     description: Giá tour cho người lớn.
 *                   dayStart:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày bắt đầu sớm nhất của tour.
 *                   dayReturn:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày kết thúc tour.
 *                   categories:
 *                     type: string
 *                     description: Danh mục của tour.
 *                   destination:
 *                     type: string
 *                     description: Điểm đến của tour.
 *                   countTourDetail:
 *                     type: integer
 *                     description: Số lượng chi tiết tour (dùng để xác định tour đã hết hạn).
 *       400:
 *         description: Không tìm thấy tour nào thỏa mãn yêu cầu.
 *       500:
 *         description: Lỗi hệ thống khi lấy dữ liệu tour hết hạn.
 */

// [GET] /tours/expired
module.exports.getExpiredTours = async (req, res) => {
  const {
    destinationTo,
    departureFrom,
    fromDate,
    transTypeId,
    categoryId,
    status,
    isFeatured,
    sortOder
  } = req.query;

  try {
    let sortQuery = '';
    if (sortOder) {
      sortQuery = `ORDER BY tour_detail.adultPrice ${sortOder === 'desc' ? 'DESC' : 'ASC'}`;
    }

    var statusQuery = '';
    if (status) {
      statusQuery = `AND tours.status=${status === '1'}`
    }

    var isFeaturedQuery = '';
    if (isFeaturedQuery) {
      isFeaturedQuery = `AND tours.isFeatured=${isFeatured}`
    }

    var destinationQuery = '';
    if (destinationTo) {
      destinationQuery = `AND tours.departureId=${destinationTo}`
    }

    var departureQuery = '';
    if (departureFrom) {
      departureQuery = `AND tours.destinationId=${departureFrom}`
    }

    var transportationQuery = '';
    if (transTypeId) {
      transportationQuery = `AND tours.transportationId=${transTypeId}`
    }

    var categoryQuery = '';
    if (categoryId) {
      categoryQuery = `AND categories.id=${categoryId}`
    }

    var dayQuery = '';
    if (fromDate) {
      const [year, month, day] = fromDate.split("-");
      const dayFormat = new Date(year, month - 1, day);
      const formattedDate = dayFormat.toISOString().slice(0, 19).replace('T', ' ');
      dayQuery = `AND tour_detail.dayStart > '${formattedDate}'`
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
      transportation.title AS transportation,
      COUNT(tour_detail.id) AS countTourDetail
    FROM tours
    LEFT JOIN tours_categories ON tours.id = tours_categories.tourId
    LEFT JOIN categories ON tours_categories.categoryId = categories.id
    LEFT JOIN destination ON tours.destinationId = destination.id
    LEFT JOIN transportation ON transportation.id = tours.transportationId
    LEFT JOIN tour_detail ON tour_detail.tourId = tours.id
    LEFT JOIN departure ON departure.id = tours.departureId
    LEFT JOIN images ON images.tourId = tours.id
    WHERE
      DATEDIFF(tour_detail.dayStart, NOW()) > 0 
      ${statusQuery}
      ${isFeaturedQuery}
      ${categoryQuery}
      ${departureQuery}
      ${transportationQuery} 
      ${destinationQuery}
      ${dayQuery}
    GROUP BY tours.id, destination.title, departure.title, transportation.title
    HAVING countTourDetail = 0;
    `;

    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    if (tours.length == 0) {
      return res.status(400).json({
        message: "Không lấy được tour nào!"
      })
    }

    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching category tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu tour hết hạn"
    });
  }
}

/**
 * @swagger
 * /tours/expired-soon:
 *   get:
 *     tags:
 *       - Tours
 *     summary: Lấy danh sách các tour sắp hết hạn (từ 0 đến 7 ngày)
 *     description: API này trả về danh sách các tour sắp hết hạn trong vòng 7 ngày tới, với các bộ lọc tùy chọn như điểm đến, nơi khởi hành, ngày bắt đầu, loại phương tiện, danh mục và trạng thái.
 *     parameters:
 *       - in: query
 *         name: destinationTo
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của điểm đến để lọc tour theo điểm đến.
 *       - in: query
 *         name: departureFrom
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của nơi khởi hành để lọc tour theo nơi khởi hành.
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu tour .
 *       - in: query
 *         name: transTypeId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của loại phương tiện để lọc tour theo phương tiện.
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID của danh mục để lọc tour theo danh mục.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Trạng thái của tour. 1 là hoạt động, 0 là không hoạt động.
 *       - in: query
 *         name: isFeatured
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         description: Cờ lọc tour theo tour nổi bật. 1 là nổi bật, 0 là không nổi bật.
 *       - in: query
 *         name: sortOder
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *         description: Thứ tự sắp xếp tour theo giá (giá người lớn).
 *     responses:
 *       200:
 *         description: Danh sách các tour sắp hết hạn trong vòng 7 ngày tới phù hợp với bộ lọc.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: Tên của tour.
 *                   source:
 *                     type: string
 *                     description: Đường dẫn hình ảnh (hoặc hình ảnh mặc định nếu không có).
 *                   code:
 *                     type: string
 *                     description: Mã của tour.
 *                   status:
 *                     type: integer
 *                     description: Trạng thái của tour (1 là hoạt động, 0 là không hoạt động).
 *                   isFeatured:
 *                     type: integer
 *                     description: Liệu tour có phải là tour nổi bật không.
 *                   adultPrice:
 *                     type: number
 *                     description: Giá tour cho người lớn.
 *                   dayStart:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày bắt đầu sớm nhất của tour.
 *                   dayReturn:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày kết thúc tour.
 *                   categories:
 *                     type: string
 *                     description: Danh mục của tour.
 *                   destination:
 *                     type: string
 *                     description: Điểm đến của tour.
 *                   daysRemaining:
 *                     type: integer
 *                     description: Số ngày còn lại cho đến khi tour hết hạn.
 *                   countTourDetailExpired:
 *                     type: integer
 *                     description: Số lượng chi tiết tour đã hết hạn trong danh sách.
 *       400:
 *         description: Không tìm thấy tour nào thỏa mãn yêu cầu.
 *       500:
 *         description: Lỗi hệ thống khi lấy dữ liệu tour sắp hết hạn.
 */

// [GET] /tours/expired-soon
module.exports.getExpiredSoonTours = async (req, res) => {
  const {
    destinationTo,
    departureFrom,
    fromDate,
    transTypeId,
    categoryId,
    status,
    isFeatured,
    sortOder
  } = req.query;

  try {
    let sortQuery = '';
    if (sortOder) {
      sortQuery = `ORDER BY tour_detail.adultPrice ${sortOder === 'desc' ? 'DESC' : 'ASC'}`;
    }

    var statusQuery = '';
    if (status) {
      statusQuery = `AND tours.status=${status === '1'}`
    }

    var isFeaturedQuery = '';
    if (isFeaturedQuery) {
      isFeaturedQuery = `AND tours.isFeatured=${isFeatured}`
    }

    var destinationQuery = '';
    if (destinationTo) {
      destinationQuery = `AND tours.departureId=${destinationTo}`
    }

    var departureQuery = '';
    if (departureFrom) {
      departureQuery = `AND tours.destinationId=${departureFrom}`
    }

    var transportationQuery = '';
    if (transTypeId) {
      transportationQuery = `AND tours.transportationId=${transTypeId}`
    }

    var categoryQuery = '';
    if (categoryId) {
      categoryQuery = `AND categories.id=${categoryId}`
    }

    var dayQuery = '';
    if (fromDate) {
      const [year, month, day] = fromDate.split("-");
      const dayFormat = new Date(year, month - 1, day);
      const formattedDate = dayFormat.toISOString().slice(0, 19).replace('T', ' ');
      dayQuery = `AND tour_detail.dayStart > '${formattedDate}'`
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
      transportation.title AS transportation,
      COUNT(DISTINCT tour_detail.id) AS countTourDetailExpired,
      DATEDIFF(MIN(tour_detail.dayStart), NOW()) AS daysRemaining
    FROM tours
    LEFT JOIN tours_categories ON tours.id = tours_categories.tourId
    LEFT JOIN categories ON tours_categories.categoryId = categories.id
    LEFT JOIN destination ON tours.destinationId = destination.id
    LEFT JOIN transportation ON transportation.id = tours.transportationId
    LEFT JOIN tour_detail ON tour_detail.tourId = tours.id
    LEFT JOIN departure ON departure.id = tours.departureId
    LEFT JOIN images ON images.tourId = tours.id
    WHERE
      DATEDIFF(tour_detail.dayStart, NOW()) BETWEEN 0 AND 7 
      ${statusQuery}
      ${isFeaturedQuery}
      ${categoryQuery}
      ${departureQuery}
      ${transportationQuery} 
      ${destinationQuery}
      ${dayQuery}
    GROUP BY tours.id, destination.title, departure.title, transportation.title
    `;

    const tours = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    if (tours.length == 0) {
      return res.status(400).json({
        message: "Không lấy được tour nào!"
      })
    }

    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching category tours:", error);
    res.status(500).json({
      error: "Lỗi lấy dữ liệu tour hết hạn"
    });
  }
}

/**
 * @swagger
 * /tours/status/{tourId}:
 *   patch:
 *     tags:
 *       - Tours
 *     summary: Cập nhật trạng thái tour
 *     description: API này cho phép cập nhật trạng thái của một tour cụ thể thông qua tourId. Trạng thái có thể là "hoạt động" hoặc "không hoạt động".
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tour cần cập nhật trạng thái.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái mới của tour. "true" là hoạt động, "false" là không hoạt động.
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái tour thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *                 tourId:
 *                   type: string
 *                   description: ID của tour đã được cập nhật trạng thái.
 *       400:
 *         description: Thiếu tourId hoặc tham số không hợp lệ.
 *       404:
 *         description: Tour không tồn tại.
 *       500:
 *         description: Lỗi hệ thống khi cập nhật trạng thái tour.
 */

// [PATCH] /tours/status/:tourId
module.exports.updateTourStatus = async (req, res) => {
  const {
    status
  } = req.body;
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json("Yêu cầu gửi lên tourId");
  }
  try {
    const updated = await Tour.update({
      status: status === 'true'
    }, {
      where: {
        id: tourId
      }
    });
    if (updated) {
      res.status(200).json({
        message: "Cập nhật trạng thái tour thành công",
        tourId
      });
    } else {
      res.status(404).json({
        message: "Tour không tồn tại"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật trạng thái tour");
  }
}

/**
 * @swagger
 * /tours/featured/{tourId}:
 *   patch:
 *     tags:
 *       - Tours
 *     summary: Cập nhật trạng thái tour nổi bật
 *     description: API này cho phép cập nhật trạng thái "nổi bật" của một tour cụ thể thông qua tourId.
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tour cần cập nhật trạng thái nổi bật.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isFeatured:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái mới của tour, "true" là tour nổi bật, "false" là không nổi bật.
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái tour nổi bật thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *                 tourId:
 *                   type: string
 *                   description: ID của tour đã được cập nhật trạng thái nổi bật.
 *       400:
 *         description: Thiếu tourId hoặc tham số không hợp lệ.
 *       404:
 *         description: Tour không tồn tại.
 *       500:
 *         description: Lỗi hệ thống khi cập nhật tour nổi bật.
 */

// [PATCH] /tours/featured/:tourId
module.exports.updateTourFeatured = async (req, res) => {
  const {
    isFeatured
  } = req.body;
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json("Yêu cầu gửi lên tourId");
  }
  try {
    const updated = await Tour.update({
      isFeatured: isFeatured === 'true'
    }, {
      where: {
        id: tourId
      }
    });
    if (updated) {
      res.status(200).json({
        message: "Cập nhật tour nổi bật thành công",
        tourId
      });
    } else {
      res.status(404).json({
        message: "Tour không tồn tại"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật tour nổi bật");
  }
}

/**
 * @swagger
 * /tours/update-multiple:
 *   patch:
 *     tags:
 *       - Tours
 *     summary: Cập nhật nhiều tour
 *     description: API này cho phép cập nhật trạng thái, trạng thái nổi bật và trạng thái xóa cho nhiều tour cùng một lúc thông qua danh sách tourIds.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID các tour cần cập nhật.
 *               status:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái mới của các tour, "true" là kích hoạt, "false" là hủy.
 *               isFeatured:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái nổi bật của các tour, "true" là tour nổi bật, "false" là không nổi bật.
 *               deleted:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: Trạng thái xóa của các tour, "true" là đã xóa, "false" là chưa xóa.
 *     responses:
 *       200:
 *         description: Cập nhật nhiều tour thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo thành công.
 *                 updatedTours:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Danh sách ID của các tour đã được cập nhật.
 *       400:
 *         description: Danh sách ID tour không hợp lệ hoặc không tìm thấy tour để cập nhật.
 *       500:
 *         description: Lỗi hệ thống khi cập nhật nhiều tour.
 */

// [PATCH] /tours/update-multiple
module.exports.updateMultiple = async (req, res) => {
  const {
    tourIds,
    status,
    isFeatured,
    deleted
  } = req.body;

  if (!tourIds || !Array.isArray(tourIds) || tourIds.length === 0) {
    return res.status(400).json({
      message: "Danh sách ID tour không hợp lệ"
    });
  }

  try {
    const updatedTours = await Tour.update({
      status,
      isFeatured,
      deleted
    }, {
      where: {
        id: tourIds
      }
    })
    if (updatedTours[0] > 0) {
      return res.json({
        message: "Cập nhật thành công",
        updatedTours: tourIds
      });
    } else {
      return res.status(400).json({
        message: "Không tìm thấy tour để cập nhật"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Lỗi cập nhật nhiều tour")
  }

}


// [GET] /tours/statistics
module.exports.statistics = async (req, res) => {
  const tourId = req.params.tourId;
  if (!tourId) {
    return res.status(400).json("Vui lòng gửi lên tourId");
  }
  try {
    const tour = await Tour.findOne({
      where: {
        deleted: false,
        id: tourId
      }
    })
    if (!tour) {
      return res.status(400).json({
        message: "Tour không tồn tại!"
      })
    }


  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Lỗi lấy thống kê tour"
    })
  }
}