import { launch, getStream, wss } from "puppeteer-stream";

import * as fs from "fs";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())
const file = fs.createWriteStream("./test.webm");

//Zoom meeting

(async () => {
  // Launch the browser and open a new blank page
  const browser = await launch({
    executablePath: puppeteer.executablePath(),
    args: [
      '--no-sandbox',
      '--start-fullscreen',
      '--disable-gpu',
      `--window-size=${1280},${780}`,
      '--disable-setuid-sandbox',
      `--ozone-override-screen-size=${700},${700}`,
      '--headless=new',
      '--user-data-dir=/workspaces/PuppeteerTest/chrome_data',
      '--profile-directory=Profile 1'
    ],
    // userDataDir: '.',

  });
  const page = await browser.newPage();

  await page.goto('https://app.zoom.us/wc/join/89487262342?fromPWA=1');
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

  await new Promise(resolve => setTimeout(resolve, 15000));
  const frame = await page.$('iframe');
  console.log(frame);

  const framecontent = await frame?.contentFrame();
  console.log("content frame");

  const confirmButton = await framecontent?.$$("button");
  if (confirmButton) {
    confirmButton[0].click();
  }

  await new Promise(resolve => setTimeout(resolve, 10000));
  await page.screenshot({ path: `./screenshot.jpg` });
  await stream.destroy();
  file.close();
  console.log("Recording stopped");
  await browser.close();
  (await wss).close();
  
})();

