const fs = require("fs");
const puppeteer = require("puppeteer");

let products = [];

async function start() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    // devtools: true,
  });
  const page = await browser.newPage();

  await page.goto(
    "https://dostavka.dixy.ru/catalog/ovoshchi_frukty_zelen_griby/"
  );

  await page.waitForSelector(".inner_wrapper");

  let cards = await page.evaluate(() => {
    let links = Array.from(document.querySelectorAll(".card-link")).map(
      (link) => link.href
    );
    return { links };
  });

  console.log(cards);

  for (let i = 0; i < cards.links.length; i++) {
    await page.goto(cards.links[i]);

    await page.waitForSelector(".detail-page");

    const product = {};

    //заголок
    await page.waitForSelector("div.product-title > span");
    const title = await page.$eval("div.product-title > span", (elem) => {
      return elem.innerHTML;
    });
    product.title = title;
    //артикул
    await page.waitForSelector("div.top-info > span");
    const article = await page.$eval("div.top-info > span", (elem) => {
      return elem.innerHTML.slice(10, -1);
    });
    product.article = article;

    //картинка
    // await page.waitForSelector("product-gallery");
    // const picture = await page.evaluate(() => {
    //   let pictureElem = document.querySelector(".gallery-pic").img;
    //   if (!pictureElem) {
    //     pictureElem = document.querySelector(".gallery-pic").img;
    //   }
    //   console.log(pictureElem);
    //   return pictureElem;
    //   // return picture.src;
    // })
    // product.picture = picture;

    await page.waitForSelector(".product-gallery");
    let pictureElem = await page.evaluate(() => {
      let picture = document.querySelector("#slick-slide00 > div > div > img");
      if (!picture) {
        picture = document.querySelector(".product-gallery_item > img");
      }
      return picture;
    });
    const picture = await page.$eval(pictureElem, (elem) => {
      elem.src;
    });
    product.picture = picture;

    // let pictureElem = await page.$("#slick-slide00 > div > div > img");
    // if (!pictureElem) {
    //   pictureElem = await page.$(
    //     "#div.picture-block > div > div > img"
    //   );
    // }
    // const picture = pictureElem.$eval((elem) => elem.src);
    // product.picture = picture;

    //цена
    await page.waitForSelector("div.card-prices > div > div > span.int.p");
    const price = await page.$eval(
      "div.card-prices > div > div > span.int.p",
      (elem) => {
        return elem.innerText;
      }
    );
    product.price = price;
    //количество
    await page.waitForSelector("div.card-prices > div > div > span.msr");
    const count = await page.$eval(
      "div.card-prices > div > div > span.msr",
      (elem) => {
        return elem.innerText.slice(1);
      }
    );
    product.count = count;
    //описание
    await page.waitForSelector(
      "div.content-block > div.description-block > div"
    );
    const description = await page.$eval(
      "div.content-block > div.description-block > div",
      (elem) => {
        return elem.innerText;
      }
    );
    product.description = description;
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
    //тип товара
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

    products.push(product);

    // console.log(products);

    fs.writeFile("products.txt", JSON.stringify(products), function (err) {
      if (err) throw err;
      console.log("Products saved to products.txt!");
    });

    await page.click("#bx_breadcrumb_2 > a");
  }

  await page.screenshot({ path: "exemple.png" });

  await browser.close();
}

start();

// console.log(products);
