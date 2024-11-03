const Category = require("../models/category.model");
const Tour = require("../models/tour.model");
const TourCategory = require("../models/tour-category.model");
const sequelize = require("../config/database");
const slugify = require("slugify");
const {
  QueryTypes
} = require("sequelize")
const scrapers = require("./scraper");
const Transportation = require("../models/transportation.model");
const Departure = require("../models/departure.model");


const scrapeController = async (browserInstance) => {
  try {
    let browser = await browserInstance;
    // const urlCategory = "https://travel.com.vn";

    // let dataCategories = await scrapers.scrapeCategories(browser, urlCategory);
    // await Category.sync();
    // console.log(dataCategories);
    // await Category.bulkCreate(dataCategories, {
    //   transaction
    // });
    // console.log('Dữ liệu Category đã được nạp thành công vào cơ sở dữ liệu!');


    const categories = await sequelize.query('SELECT id, url FROM Categories', {
      type: QueryTypes.SELECT
    });
    await Promise.all(categories.map(async (category) => {
      const categoryId = category.id;
      const url = category.url;
      let transaction;

      try {
        transaction = await sequelize.transaction();
        let dataTours = await scrapers.scrapeTour(browser, url);

        if (dataTours && dataTours.length > 0) {

          const newTours = await Promise.all(dataTours.map(async (tour) => {
            // Kiểm tra hoặc thêm transportation nếu chưa tồn tại
            let [recordOfTransportation] = await Transportation.findOrCreate({
              where: {
                title: tour.transportation
              },
              defaults: {
                title: tour.transportation
              },
              transaction
            });

            // Kiểm tra hoặc thêm departure nếu chưa tồn tại
            let [recordOfDeparture] = await Departure.findOrCreate({
              where: {
                title: tour.departure
              },
              defaults: {
                title: tour.departure
              },
              transaction
            });

            return {
              title: tour.title,
              code: tour.code,
              image: tour.image,
              price: tour.price,
              timeStart: tour.timeStart,
              dayStay: tour.dayStay,
              slug: slugify(tour.title, {
                lower: true
              }),
              url: tour.url,
              departureId: recordOfDeparture.id,
              transportationId: recordOfTransportation.id
            };
          }));

          const createdTours = await Tour.bulkCreate(newTours, {
            transaction,
            ignoreDuplicates: true
          });

          const tourCategories = createdTours.map(tour => {
            if (tour.id != null) {
              return {
                tour_id: tour.id,
                category_id: categoryId
              }
            }
          }).filter(item => item !== undefined);

          await TourCategory.bulkCreate(tourCategories, {
            transaction
          });

        } else {
          console.log(`Không có tour nào cho danh mục ${categoryId}`);
        }

        await transaction.commit();
      } catch (error) {

        if (transaction) await transaction.rollback();
        console.log(`Lỗi khi xử lý category ${categoryId}: ${error}`);
      }
    }));


    // Lấy tour detail
    // const urls = await sequelize.query("SELECT url FROM tours", {
    //   type: QueryTypes.SELECT
    // })
    // await Promise.all(urls.map(async (url) => {
    //   let dataTourDetails = await scrapers.scrapeTourDetail(browser, url);
    //   console.log(dataTourDetails);
    // }));

  } catch (error) {
    console.log("Lỗi ở scrape controller " + error);
    await transaction.rollback();
  }

}

module.exports = scrapeController;