module.exports.scrapeTour = (browser, url) => new Promise(async (resolve, reject) => {
  try {
    let page = await browser.newPage();
    console.log('>> Mở tab mới ...');

    await page.goto(url);
    console.log("Truy cập vào trang " + url);

    await page.waitForSelector(".find-tour-content__list--main");
    console.log('>> Website đã load xong...');


    const dataTour = await page.$$eval(".find-tour-content__list--main .card-filter-desktop", els => {
      dataTour = els.map(el => {
        const titleEl = el.querySelector(".card-filter-desktop__content .card-filter-desktop__content--header-wrapper a");
        const imageEl = el.querySelector(".card-filter-desktop__thumbnail img");
        const tourCodeEl = el.querySelector(".card-filter-desktop__content .info-tour-tourCode p");
        const items = Array.from(el.querySelectorAll(".info-tour-dayStayText p")).map(item => item.textContent.trim());;
        const transportation = items[1];
        const dayStay = items[0];
        const tourDepartureEl = el.querySelector(".card-filter-desktop__content--info-tour .info-tour-departure p");
        const timeStart = Array.from(el.querySelectorAll(".card-filter-desktop__content--info-tour .info-tour-calendar .list-item__container .list-item a")).map(item => item.textContent.trim()).toString();
        const priceString = el.querySelector(".card-filter-desktop__content--price .card-filter-desktop__content--price-newPrice p").textContent;
        let priceInt = parseInt(priceString.replace(/[₫\s.]/g, ''), 10);

        return {
          title: titleEl ? titleEl.title : "no data",
          code: tourCodeEl ? tourCodeEl.textContent : "no data",
          image: imageEl ? imageEl.src : "no data",
          price: priceInt,
          transportation: transportation ? transportation : "no data",
          timeStart: timeStart,
          dayStay: dayStay,
          departure: tourDepartureEl ? tourDepartureEl.textContent : "no data",
          url: titleEl.href + `tourcode=${tourCodeEl.textContent}`
        };
      })
      return dataTour;
    });
    await page.close();
    console.log('>> Tab đã đóng.');
    resolve(dataTour);

  } catch (error) {
    console.log("Lỗi ở hàm scrape tour : " + error)
    reject(error)
  }
});


module.exports.scrapeCategories = (browser, url) => new Promise(async (resolve, reject) => {
  try {
    let page = await browser.newPage();
    console.log('>> Mở tab mới ...');

    await page.goto(url);
    console.log("Truy cập vào trang " + url);

    await page.waitForSelector(".home-banner-section__container--buttonGroup");
    console.log('>> Website đã load xong...');

    const dataCategories = await page.$$eval(".home-banner-section__container--buttonGroup .home-banner-section__container--buttonGroup--button", els => {
      dataCategories = els.map(el => {
        const title = el.querySelector("button img").alt;
        return {
          title: title,
        };
      })
      return dataCategories;
    });
    await page.close();
    console.log('>> Tab đã đóng.');
    resolve(dataCategories);

  } catch (error) {
    console.log("Lỗi ở hàm scrape category : " + error)
    reject(error)
  }
})

module.exports.scrapeTourDetail = (browser, url) => new Promise(async (resolve, reject) => {
  try {
    let page = await browser.newPage();
    console.log('>> Mở tab mới ...');

    await page.goto(url);
    console.log("Truy cập vào trang " + url);

    await page.waitForSelector(".tour--detail__content--left");
    console.log('>> Website đã load xong...');

    const dataTourDetail = await page.$$eval(".tour--detail__content--left > div", els => {
      dataTourDetail = els.map(el => {
        if (el.class == "image-gallery") {
          var images = el.querySelectorAll("img").map(item => item.src);
        }
        if (el.id == "overview") {
          var divOverview = el.querySelectorAll(".tour--detail__content--left--overview__content-item").map(div => {
            return {
              title: div.querySelector(".tour--detail__content--left--overview__content-title").textContent,
              content: div.querySelector("p").textContent
            }
          })
        }
        if (el.id == "schedule") {
          var divSchedule = el.querySelectorAll("ul.content li").map(div => {
            return {
              address: div.querySelector("span").textContent,
              info: div.querySelector(".meal-inFor span p").textContent
            }
          })
        }
        if (el.id == "tour-note") {
          var divTourNote = el.querySelectorAll("ul li").map(div => {
            return {
              title: div.querySelector("button").textContent,
              info: div.querySelector("wrapper").textContent
            }
          })
        }
        return {
          images: images,
          divOverview: divOverview,
          divSchedule: divSchedule,
          divTourNote: divTourNote
        }
      })
      return dataTourDetail;
    });
    await page.close();
    console.log('>> Tab đã đóng.');
    resolve(dataTourDetail);

  } catch (error) {
    console.log("Lỗi ở hàm scrape dataTourDetail : " + error)
    reject(error)
  }
})