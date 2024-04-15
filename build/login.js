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
exports.startLaunch = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth")); // Use v2.4.5 instead of latest
const readline = __importStar(require("readline"));
const puppeteer_screen_recorder_1 = require("puppeteer-screen-recorder");
const Config = {
    followNewTab: true,
    fps: 25,
    ffmpeg_Path: '<path of ffmpeg_path>' || null,
    videoFrame: {
        width: 1024,
        height: 768,
    },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
    autopad: {
        color: 'black',
    },
    aspectRatio: '4:3',
};
const stealth = (0, puppeteer_extra_plugin_stealth_1.default)();
stealth.enabledEvasions.delete("iframe.contentWindow");
stealth.enabledEvasions.delete("media.codecs");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
// Use '-h' arg for headful login.
const headless = !process.argv.includes('-h');
// Prompt user for email and password.
const prompt = (query, hidden = false) => new Promise((resolve, reject) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    try {
        if (hidden) {
            const stdin = process.openStdin();
            process.stdin.on('data', (char) => {
                char = char + '';
                switch (char) {
                    case '\n':
                    case '\r':
                    case '\u0004':
                        stdin.pause();
                        break;
                    default:
                        process.stdout.clearLine(0);
                        readline.cursorTo(process.stdout, 0);
                        process.stdout.write(query + Array(rl.line.length + 1).join('*'));
                        break;
                }
            });
        }
        rl.question(query, (value) => {
            resolve(value);
            rl.close();
        });
    }
    catch (err) {
        reject(err);
    }
});
function startLaunch() {
    // Launch puppeteer browser.
    puppeteer_extra_1.default.launch({ headless: false, env: { DISPLAY: ":99" } }).then((browser) => __awaiter(this, void 0, void 0, function* () {
        console.log('Opening chromium browser...');
        const page = yield browser.newPage();
        const pages = yield browser.pages();
        yield page.setBypassCSP(true);
        const recorder = new puppeteer_screen_recorder_1.PuppeteerScreenRecorder(page);
        yield recorder.start('./simple.mp4');
        // Close the new tab that chromium always opens first.
        pages[0].close();
        yield page.goto('https://accounts.google.com/signin/v2/identifier', { waitUntil: 'networkidle2' });
        if (headless) {
            // Only needed if sign in requires you to click 'sign in with google' button.
            // await page.waitForSelector('button[data-test="google-button-login"]');
            // await page.waitFor(1000);
            // await page.click('button[data-test="google-button-login"]');
            // Wait for email input.
            yield page.waitForSelector('#identifierId');
            let badInput = true;
            // Keep trying email until user inputs email correctly.
            // This will error due to captcha if too many incorrect inputs.
            while (badInput) {
                const email = yield prompt('Email or phone: ');
                yield page.type('#identifierId', email);
                yield new Promise(resolve => setTimeout(resolve, 1000));
                yield page.keyboard.press('Enter');
                yield new Promise(resolve => setTimeout(resolve, 1000));
                badInput = yield page.evaluate(() => document.querySelector('#identifierId[aria-invalid="true"]') !== null);
                if (badInput) {
                    console.log('Incorrect email or phone. Please try again.');
                    yield page.click('#identifierId', { clickCount: 3 });
                }
            }
            const password = yield prompt('Enter your password: ', true);
            console.log('Finishing up...');
            // Wait for password input
            yield recorder.stop();
            yield page.type('input[type="password"]', password);
            yield page.waitFor(1000);
            yield page.keyboard.press('Enter');
            // For headless mode, 2FA needs to be handled here.
            // Login via gmail app works autmatically.
        }
    }));
}
exports.startLaunch = startLaunch;
