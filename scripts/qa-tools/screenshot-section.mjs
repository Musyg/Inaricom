// QA visuelle ciblee : scroll jusqu a la TechDemo + attend typewriter
// Usage : node screenshot-section.mjs <selector> [outprefix] [waitMs]
//
// Exemples :
//   node screenshot-section.mjs '#techdemo-title' ./out/techdemo
//   node screenshot-section.mjs 'main > section:nth-child(2)' ./out/section2

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SELECTOR = process.argv[2] || '#techdemo-title';
const OUT_PREFIX = process.argv[3] || path.resolve('./out/section');
const WAIT_MS = Number(process.argv[4] ?? 14000);
const URL_TARGET = 'https://staging.inaricom.com/';

const OUT_DIR = path.dirname(OUT_PREFIX);
fs.mkdirSync(OUT_DIR, { recursive: true });

const credPath = path.resolve('../../STAGING_CREDENTIALS.txt');
const credText = fs.readFileSync(credPath, 'utf8');
const userMatch = credText.match(/User\s*:\s*(\S+)/);
const passMatch = credText.match(/Password\s*:\s*(\S+)/);
const HTTP_USER = userMatch ? userMatch[1] : 'staging';
const HTTP_PASS = passMatch ? passMatch[1] : '';

console.log(`[QA] target=${URL_TARGET}`);
console.log(`[QA] selector=${SELECTOR}`);
console.log(`[QA] waitMs=${WAIT_MS}`);
console.log(`[QA] outprefix=${OUT_PREFIX}`);

const browser = await chromium.launch({ headless: true });

const consoleMessages = [];
const networkErrors = [];

async function captureViewport(label, viewport) {
    const context = await browser.newContext({
        httpCredentials: { username: HTTP_USER, password: HTTP_PASS },
        viewport,
        deviceScaleFactor: 1,
        ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            consoleMessages.push({ label, type: msg.type(), text: msg.text() });
        }
    });
    page.on('pageerror', (err) => {
        consoleMessages.push({ label, type: 'pageerror', text: err.message });
    });
    page.on('requestfailed', (req) => {
        networkErrors.push({
            label,
            url: req.url(),
            failure: req.failure()?.errorText,
        });
    });

    await page.goto(URL_TARGET, { waitUntil: 'networkidle', timeout: 30000 });
    // Petit delai pour que React hydrate
    await page.waitForTimeout(2000);

    // Scroll jusqu a la section ciblee
    const found = await page
        .locator(SELECTOR)
        .first()
        .scrollIntoViewIfNeeded({ timeout: 8000 })
        .then(() => true)
        .catch(() => false);

    if (!found) {
        console.warn(`[QA] selector "${SELECTOR}" introuvable !`);
    }

    // Attend que le typewriter joue
    await page.waitForTimeout(WAIT_MS);

    // Screenshot 1 : section visible dans le viewport (clipped)
    const viewportPath = `${OUT_PREFIX}-${label}-viewport.png`;
    await page.screenshot({ path: viewportPath, fullPage: false });
    console.log(`[QA] viewport ${label} : ${viewportPath}`);

    // Screenshot 2 : full page
    const fullPath = `${OUT_PREFIX}-${label}-full.png`;
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`[QA] fullpage ${label} : ${fullPath}`);

    // Inspection ciblee
    const inspect = await page.evaluate((sel) => {
        const node = document.querySelector(sel);
        if (!node) return { found: false };
        const section = node.closest('section') || node;
        const text = section.innerText.substring(0, 600);
        return {
            found: true,
            sectionTag: section.tagName,
            sectionAriaLabel: section.getAttribute('aria-labelledby') || null,
            buttonsCount: section.querySelectorAll('button').length,
            textPreview: text,
            tabsRole: section.querySelector('[role="tablist"]') ? 'present' : 'absent',
            terminalRole: section.querySelector('[role="log"]') ? 'present' : 'absent',
        };
    }, SELECTOR);
    console.log(`[QA] inspect ${label} :`, JSON.stringify(inspect, null, 2));

    await context.close();
}

await captureViewport('desktop', { width: 1440, height: 900 });
await captureViewport('mobile', { width: 390, height: 844 });

await browser.close();

const reportPath = `${OUT_PREFIX}-report.json`;
fs.writeFileSync(
    reportPath,
    JSON.stringify(
        { timestamp: new Date().toISOString(), consoleMessages, networkErrors },
        null,
        2,
    ),
);
console.log(`[QA] report : ${reportPath}`);
console.log(`[QA] erreurs console : ${consoleMessages.length}`);
console.log(`[QA] erreurs reseau : ${networkErrors.length}`);
console.log('[QA] DONE');
