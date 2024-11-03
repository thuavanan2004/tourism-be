const startBrowser = require("./browser");
const scrapeController = require("./scrapeController");

module.exports.srape = () => {
  let browser = startBrowser();
  scrapeController(browser);
}