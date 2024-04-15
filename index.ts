import { launch, getStream, wss } from "puppeteer-stream";

import * as fs from "fs";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())
const file = fs.createWriteStream("./test.webm");
const html = fs.createWriteStream("./test.html");

(async () => {
  // Launch the browser and open a new blank page
  const browser = await launch(puppeteer,{
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

  await page.goto('https://app.zoom.us/wc/join/82945776470?fromPWA=1&pwd=OuGeZPYkJlNme31x9ATLokxfayyLzU.1');
  page.on('console', async (msg) => {
    const msgArgs = msg.args();
    for (let i = 0; i < msgArgs.length; ++i) {
      console.log(await msgArgs[i].jsonValue());
    }
  });

  const stream = await getStream(page, { audio: true, video: true });
  console.log("Recording Started");
  stream.pipe(file);

  console.log("Before start");

  await new Promise(resolve => setTimeout(resolve, 5000));
  let content = await page.content();
  html.write(content);
  html.close();
  await page.locator('//button[text()="Continue"]').click();
  await new Promise(resolve => setTimeout(resolve, 10000));
  await page.screenshot({ path: `./screenshot.jpg` });
  await stream.destroy();
  file.close();
  console.log("Recording stopped");
  await browser.close();
  (await wss).close();
  // const getTotalCount = async () => await totalCountElem.evaluate((item) => item.textContent);
  // let Interval = setInterval(async () => {
  //   let meetingEnded = await getTotalCount() == "1";
  //   console.log("meetingEnded");
  //   console.log(meetingEnded);
  //   if (meetingEnded) {
  //     clearInterval(Interval);
  //     await stream.destroy();
  //     file.close();
  //     console.log("Recording stopped");
  //     await browser.close();
  //     (await wss).close();
  //   }
// }, 5000);


}) ();

