import puppeteer from "puppeteer";
import fs from "fs";

const url = "https://quotes.toscrape.com/";

const webScraperTechnical = async (url: string) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForSelector("body");
  let htmlBody = await page.content();

  const cleanHTML = async () => {
    const regex = /(<nav\b[^>]*>[\s\S]*?<\/nav>)|(\s*\S*\="[^"]+"\s*)/gm;

    return await htmlBody.replace(regex, "");
  };

  const getHTMLSize = async () => {
    // await page.waitForSelector("body");
    // let htmlBody = await page.content();
    return Buffer.byteLength(htmlBody, "utf8") / 1024;
  };

  const aTags = await page.evaluate(async () => {
    const aTagsData = document.querySelectorAll("a");
    return Array.from(aTagsData).map((tag) => {
      console.log("jumpscare");
      return tag.href;
    });
  });

  const cleanedHtml = await cleanHTML();
  const kilobyteSize = await getHTMLSize();
  fs.mkdir("output", () => {
    console.log("making directory");
  });

  fs.writeFile("output/Hello.txt", cleanedHtml, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });

  await page.setViewport({ width: 1080, height: 1024 });

  await browser.close();
};
// const url = process.argv[2]; // Get the first command line argument

webScraperTechnical(url);
