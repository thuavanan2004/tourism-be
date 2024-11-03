const unidecode = require("unidecode");
const sequelize = require("../../config/database");
const {
  QueryTypes
} = require("sequelize");

/**
 * @swagger
 * /destination/:
 *   get:
 *     tags:
 *       - Destination
 *     summary: Lấy danh sách địa điểm theo tiêu đề
 *     description: Truy xuất danh sách các địa điểm phù hợp với tiêu đề đã cung cấp.
 *                  - Khi người dùng gõ từng ký tự vào ô input tìm kiếm, API này sẽ được gọi để lấy ra địa điểm.
 *                  - Khi người dùng bấm nút tìm kiếm, API `/tours/search` sẽ được gọi.
 *     operationId: getDestinations
 *     parameters:
 *       - name: title
 *         in: query
 *         required: true
 *         description: Tiêu đề của địa điểm cần tìm
 *         schema:
 *           type: string
 *           example: "Hà Nội"
 *     responses:
 *       200:
 *         description: Danh sách các địa điểm phù hợp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Hà Nội"
 *                   slug:
 *                     type: string
 *                     example: "ha-noi"
 *                   image:
 *                     type: string
 *                     example: "https://example.com/image.jpg"
 *       400:
 *         description: Thiếu title.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Thiếu title."
 *       404:
 *         description: Không lấy được địa điểm nào.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy địa điểm nào."
 *       500:
 *         description: Có lỗi xảy ra khi lấy danh sách địa điểm.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra khi lấy danh sách địa điểm."
 */

// [GET] /api/destination/
module.exports.index = async (req, res) => {
  const title = req.query.title;

  if (!title) {
    return res.status(400).json({
      message: 'Thiếu title.'
    });
  }

  const titleUnidecode = unidecode(title);
  const titleRegex = `%${titleUnidecode}%`;

  const query = `
  SELECT title, slug, image 
  FROM destination 
  WHERE
    deleted = false
    AND title LIKE :titleRegex
  `;

  try {
    const destination = await sequelize.query(query, {
      replacements: {
        titleRegex: titleRegex
      },
      type: QueryTypes.SELECT
    });

    if (destination.length === 0) {
      return res.status(404).json({
        message: 'Không lấy được địa điểm nào.'
      });
    }

    return res.status(200).json(destination);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Có lỗi xảy ra khi lấy danh sách địa điểm.'
    });
  }
};