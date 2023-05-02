const puppeteer = require("puppeteer");
const fs = require("fs");

const catalog = [];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });
  const page = await browser.newPage();

  //?PAGEN_1=13

  await page.goto(
    "https://dostavka.dixy.ru/catalog/ovoshchi_frukty_zelen_griby/",
    { waiiUntil: "domcontentloaded" }
  );
  const arrowNext = (await page.$(".flex-next")) !== null; //на последнй странице стрелка будет false

  while (arrowNext) {
    await page.waitForSelector("div.inner_wrapper", {
      waiiUntil: "domcontentloaded",
    });
    const products = await page.$$(
      "div.inner_wrapper > div.ajax_load.cur.block > div.top_wrapper.items_wrapper.catalog_block_template > .items > .item"
    );
    await page.waitForSelector(".main-catalog-wrapper", {
      waiiUntil: "domcontentloaded",
    });

    for (product of products) {
      const item = {};
        const title = await page.evaluate(
          (el) => el.querySelector(".card-name").innerText,
          product
        );
    //   const title = await page.$eval(".card-name", (elem) => {
    //     return elem.innerText;
    //   });

      item.title = title;
      catalog.push(item);

      fs.writeFile("products.txt", JSON.stringify(catalog), function (err) {
        if (err) throw err;
      });
    }

    await page.waitForSelector(".flex-next");
    await page.click(".flex-next", {
      timeout: 3000,
    });
  }
  await browser.close();
})();
