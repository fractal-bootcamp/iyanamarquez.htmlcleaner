import puppeteer from "puppeteer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const url = "https://quotes.toscrape.com/";

const webScraperTechnical = async (
  url: string,
  depthNumber: number,
  linkNumber: number
) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForSelector("body");
  let htmlBody = await page.content();

  //   Take an html body and remove all _attributes + nav tags
  const cleanHTML = async () => {
    let randomId = uuidv4();
    const regex = /(<nav\b[^>]*>[\s\S]*?<\/nav>)|(\s*\S*\="[^"]+"\s*)/gm;
    const cleanedHTML = await htmlBody.replace(regex, "");
    fs.mkdir("output", () => {
      console.log("making directory");
    });
    fs.writeFile(`output/cleanedhtml${randomId}`, cleanedHTML, (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
    return "html cleaned?";
  };

  //   Calculates kilobyte size of the current page
  const getHTMLSize = async () => {
    // await page.waitForSelector("body");
    // let htmlBody = await page.content();
    return Buffer.byteLength(htmlBody, "utf8") / 1024;
  };

  // Returns an array of hrefs collected from the current page
  const getTags = async (numberOfLinks: number) => {
    const result = await page.evaluate((numberOfLinks: number) => {
      const aTagsData = document.querySelectorAll("a");
      const links = [];

      Array.from(aTagsData).forEach((tag: HTMLAnchorElement, idx: number) => {
        if (idx < numberOfLinks && tag instanceof HTMLAnchorElement) {
          links.push(tag.href);
        } else {
          console.log("jumpscare");
        }
      });

      return links;
    }, numberOfLinks);
    return result;
  };

  const cleanedHtml = await cleanHTML();
  const kilobyteSize = await getHTMLSize();

  const isValidUrl = (urlString) => {
    var urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // validate protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // validate fragment locator
    return !!urlPattern.test(urlString);
  };

  const visitDepthPagesAndClean = async (depth: number) => {
    let firstPageList = await getTags(linkNumber);
    firstPageList.forEach(async (link) => {
      const newPage = await browser.newPage();
      await newPage.goto(link, { waitUntil: "networkidle2" });
      await newPage.waitForSelector("body");
      // Clean Page HTML
    });
    let allData = [{ page: 0, data: firstPageList }];
    let counter = 0;
    while (counter < depth) {
      let list = [];
      let currentDepthArr = allData[counter]?.data; // ['','','']
      let newId = counter + 1;
      let newObjDepth = { page: newId, data: [] };
      if (currentDepthArr.length) {
        for (let idx = 0; idx < currentDepthArr.length; idx++) {
          let link = currentDepthArr[idx];
          if (isValidUrl(link)) {
            try {
              const newPage = await browser.newPage();
              await newPage.goto(link, { waitUntil: "networkidle2" });
              await newPage.waitForSelector("body");
              const newTags = await getTags(2);
              list.push(...newTags);

              await newPage.close();
            } catch (error) {
              console.error("Error when visiting pages:", error);
            }
          } else {
            console.log("invalid url");
          }
        }
        newObjDepth.data = list;
        allData.push(newObjDepth);

        counter++;
      } else {
        counter++;
        // return;
      }
    }
    return allData;
  };

  const allData = await visitDepthPagesAndClean(depthNumber);
  const cleanAllLinks = async (allData) => {
    for (let i = 0; i < allData.length; i++) {
      let currentDepth = allData[i].data;
      for (let j = 0; j < currentDepth.length; j++) {
        let link = currentDepth[j];
        const newPage = await browser.newPage();
        await newPage.goto(link, { waitUntil: "networkidle2" });
        await newPage.waitForSelector("body");
        await cleanHTML();
        await newPage.close();
      }
    }
  };
  await cleanAllLinks(allData);
  await page.setViewport({ width: 1080, height: 1024 });

  await browser.close();
};
// const url = process.argv[2]; // Get the first command line argument

webScraperTechnical(url, 2, 2);
