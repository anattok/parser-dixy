const puppeteer = require("puppeteer");
const fs = require("fs");

const products = [];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 50,
  });
  const page = await browser.newPage();

  await page.goto(
    `https://dostavka.dixy.ru/catalog/ovoshchi_frukty_zelen_griby/`,
    { waiiUntil: "domcontentloaded" }
  );
  const arrowNext = (await page.$(".flex-next")) !== null; //на последнй странице стрелка будет false

  ///пока существует стрелка далее
  while (arrowNext) {
    //загружаем каталог карточек на странице
    await page.waitForSelector("div.inner_wrapper");

    //делаем список карточек с линками на переход внутрь
    let cards = await page.evaluate(() => {
      let links = Array.from(document.querySelectorAll(".card-link")).map(
        (link) => link.href
      );
      return { links };
    });

    for (let i = 0; i < cards.links.length; i++) {
      await page.goto(cards.links[i]);

      await page.waitForSelector(".detail-page");

      const product = {};

      try {
        //заголок
        await page.waitForSelector("div.product-title > span");
        const title = await page.$eval("div.product-title > span", (elem) => {
          return elem.innerHTML;
        });
        product.title = title;
      } catch (error) {}

      try {
        //артикул
        await page.waitForSelector("div.top-info > span");
        const article = await page.$eval("div.top-info > span", (elem) => {
          return elem.innerHTML.slice(10, -1);
        });
        product.article = article;
      } catch (error) {}

      try {
        await page.waitForSelector(".product-gallery");
        const picture = await page.$eval(
          "#slick-slide00 > div > div > img",
          (elem) => {
            return elem.src;
          }
        );
        product.picture = picture;
      } catch (error) {}

      try {
        //страна
        await page.waitForSelector(
          "div.property-list > div:nth-child(2) > div.prop-value"
        );
        const country = await page.$eval(
          "div.property-list > div:nth-child(2) > div.prop-value",
          (elem) => {
            return elem.innerText;
          }
        );
        product.country = country;
      } catch (error) {}

      try {
        await page.waitForSelector(
          "div.property-list > div:nth-child(3) > div.prop-value"
        );
        const type = await page.$eval(
          "div.property-list > div:nth-child(3) > div.prop-value",
          (elem) => {
            return elem.innerText;
          }
        );
        product.type = type;
      } catch (error) {}

      products.push(product);

      fs.writeFile("products.js", JSON.stringify(products), function (err) {
        if (err) throw err;
        console.log("Products saved to products.txt!");
      });

      await page.click("#bx_breadcrumb_2 > a > span");
    }

    await page.waitForSelector(".flex-next");

    if (arrowNext) {
      await page.click(".flex-next");
    } else {
      await browser.close();
    }
  }
})();
