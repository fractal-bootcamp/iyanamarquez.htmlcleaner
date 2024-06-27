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

  //   Take an html body and remove all _attributes + nav tags
  const cleanHTML = async () => {
    const regex = /(<nav\b[^>]*>[\s\S]*?<\/nav>)|(\s*\S*\="[^"]+"\s*)/gm;
    return await htmlBody.replace(regex, "");
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

      Array.from(aTagsData).forEach((tag, idx) => {
        if (idx < numberOfLinks) {
          links.push(tag.href);
        } else {
          console.log("jumpscare");
        }
      });
      return links;
    }, numberOfLinks);
    return result;
  };

  //   const cleanedHtml = await cleanHTML();
  //   const kilobyteSize = await getHTMLSize();
  //   fs.mkdir("output", () => {
  //     console.log("making directory");
  //   });

  //   fs.writeFile("output/Hello.txt", cleanedHtml, (err) => {
  //     // In case of a error throw err.
  //     if (err) throw err;
  //   });
  //   let depth = 2;
  let firstPageList = await getTags(5);
  let allData = [{ id: 0, data: firstPageList }];

  const visitPages = async (depth: number) => {
    let counter = 0;
    while (counter < depth) {
      console.log("counter is ", counter);
      //   console.log("alll data", allData);
      let currentDepthArr = allData[counter]?.data;
      console.log("currentDepthArr", currentDepthArr);
      if (currentDepthArr.length) {
        for (let link of currentDepthArr) {
          console.log("link ", link);
          try {
            const newPage = await browser.newPage();
            await newPage.goto(link, { waitUntil: "networkidle2" });
            await newPage.waitForSelector("body");

            const newTags = await getTags(2);
            console.log("counter here", counter);
            const newObj = { id: counter + 1, data: newTags };
            newObj.data = newTags;
            allData.push(newObj);
            await newPage.close();
          } catch (error) {
            console.error("Error when visiting pages:", error);
          }
        }
        counter++;
      }
      return;
    }
  };

  console.log(await visitPages(1));
  console.log("data after while loop", allData);

  //   console.log(await getTags(2));

  await page.setViewport({ width: 1080, height: 1024 });

  await browser.close();
};
// const url = process.argv[2]; // Get the first command line argument

webScraperTechnical(url);
