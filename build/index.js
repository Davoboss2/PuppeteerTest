"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_stream_1 = require("puppeteer-stream");
const fs = __importStar(require("fs"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
const file = fs.createWriteStream("./test.webm");
const html = fs.createWriteStream("./test.html");
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Launch the browser and open a new blank page
    const browser = yield (0, puppeteer_stream_1.launch)(puppeteer_extra_1.default, {
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
    const page = yield browser.newPage();
    yield page.goto('https://app.zoom.us/wc/join/82945776470?fromPWA=1&pwd=OuGeZPYkJlNme31x9ATLokxfayyLzU.1');
    page.on('console', (msg) => __awaiter(void 0, void 0, void 0, function* () {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
            console.log(yield msgArgs[i].jsonValue());
        }
    }));
    const stream = yield (0, puppeteer_stream_1.getStream)(page, { audio: true, video: true });
    console.log("Recording Started");
    stream.pipe(file);
    console.log("Before start");
    yield new Promise(resolve => setTimeout(resolve, 5000));
    let content = yield page.content();
    html.write(content);
    html.close();
    yield page.locator('//button[text()="Continue"]').click();
    yield new Promise(resolve => setTimeout(resolve, 10000));
    yield page.screenshot({ path: `./screenshot.jpg` });
    yield stream.destroy();
    file.close();
    console.log("Recording stopped");
    yield browser.close();
    (yield puppeteer_stream_1.wss).close();
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
}))();
