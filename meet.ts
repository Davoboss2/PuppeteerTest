import { launch, getStream, wss } from "puppeteer-stream";

import * as fs from "fs";
import puppeteer, { ElementHandle } from 'puppeteer';
import { filter, waitUntil } from "./utils";


const file = fs.createWriteStream("./test.webm");

(async () => {
  // Launch the browser and open a new blank page
  const browser = await launch({
    executablePath: puppeteer.executablePath(),
    args: [
      '--no-sandbox',
      '--start-fullscreen',
      '--disable-gpu',
      `--window-size=${700},${700}`,
      '--disable-setuid-sandbox',
      `--ozone-override-screen-size=${700},${700}`,
      '--headless=new',
      '--user-data-dir=/workspaces/PuppeteerTest/chrome_data',
      '--profile-directory=Profile 1'
    ],
    // userDataDir: '.',

  });
  const page = await browser.newPage();

  await page.goto('https://meet.google.com/png-pqee-ose');
  page.on('console', async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });

  const stream = await getStream(page, { audio: true, video: false });
  console.log("Recording Started");
  stream.pipe(file);

  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log("Before start");

  const b = await page.waitForSelector('button', { timeout: 10000 });
  const elements = await page.$$('button');
  const results = await filter<ElementHandle<HTMLButtonElement>>(elements as any, async element => {
    let val = await element.evaluate((item) => item.textContent?.toLowerCase().includes("join"))
    return val;
  })

  await results[0].click();

  await new Promise(resolve => setTimeout(resolve, 5000));
  await page.screenshot({ path: `./screenshot.jpg` });
  const [totalCountElem] = await page.$x(`/html/body/div[1]/c-wiz/div/div/div[24]/div[3]/div[10]/div/div/div[3]/div/div[2]/div/div/div`);

  const getTotalCount = async () => await totalCountElem.evaluate((item) => item.textContent);
  let Interval = setInterval(async () => {
    let meetingEnded = await getTotalCount() == "1";
    console.log("meetingEnded");
    console.log(meetingEnded);
    if (meetingEnded) {
      clearInterval(Interval);
      await stream.destroy();
      file.close();
      console.log("Recording stopped");
      await browser.close();
      (await wss).close();
    }
  }, 5000);


})();

