import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth'; // Use v2.4.5 instead of latest
import * as readline from 'readline';

import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
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

const stealth = pluginStealth();
stealth.enabledEvasions.delete("iframe.contentWindow")
stealth.enabledEvasions.delete("media.codecs")
puppeteer.use(pluginStealth());

// Use '-h' arg for headful login.
const headless = !process.argv.includes('-h');

// Prompt user for email and password.
const prompt = (query: string, hidden = false): Promise<string> =>
    new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        try {
            if (hidden) {
                const stdin = process.openStdin();
                process.stdin.on('data', (char: string) => {
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
        } catch (err) {
            reject(err);
        }
    });

export function startLaunch() {
    // Launch puppeteer browser.
    puppeteer.launch({ headless: false, env: { DISPLAY: ":99"} }).then(async (browser: any) => {
        console.log('Opening chromium browser...');
        const page = await browser.newPage();
        const pages = await browser.pages();
        await page.setBypassCSP(true)
        const recorder = new PuppeteerScreenRecorder(page);
        await recorder.start('./simple.mp4');
        // Close the new tab that chromium always opens first.
        pages[0].close();
        await page.goto('https://accounts.google.com/signin/v2/identifier', { waitUntil: 'networkidle2' });
        if (headless) {
            // Only needed if sign in requires you to click 'sign in with google' button.
            // await page.waitForSelector('button[data-test="google-button-login"]');
            // await page.waitFor(1000);
            // await page.click('button[data-test="google-button-login"]');

            // Wait for email input.
            await page.waitForSelector('#identifierId');
            let badInput = true;

            // Keep trying email until user inputs email correctly.
            // This will error due to captcha if too many incorrect inputs.
            while (badInput) {
                const email = await prompt('Email or phone: ');
                await page.type('#identifierId', email);
                await new Promise(resolve => setTimeout(resolve, 1000));

                await page.keyboard.press('Enter');
                await new Promise(resolve => setTimeout(resolve, 1000));

                badInput = await page.evaluate(() => document.querySelector('#identifierId[aria-invalid="true"]') !== null);
                if (badInput) {
                    console.log('Incorrect email or phone. Please try again.');
                    await page.click('#identifierId', { clickCount: 3 });
                }
            }
            const password = await prompt('Enter your password: ', true);
            console.log('Finishing up...');
            // Wait for password input
            await recorder.stop();
            await page.type('input[type="password"]', password);
            await page.waitFor(1000);
            await page.keyboard.press('Enter');
            // For headless mode, 2FA needs to be handled here.
            // Login via gmail app works autmatically.
        }
    });
}
