// QA visuelle staging Inaricom
// Usage : node screenshot.mjs [url] [outprefix]
// Sortie : <outprefix>-desktop.png, <outprefix>-mobile.png, <outprefix>-report.json

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const URL_TARGET = process.argv[2] || 'https://staging.inaricom.com/';
const OUT_PREFIX = process.argv[3] || path.resolve('./out/staging-home');
const OUT_DIR = path.dirname(OUT_PREFIX);
fs.mkdirSync(OUT_DIR, { recursive: true });

// Credentials basic auth lus depuis le fichier projet
const credPath = path.resolve('../../STAGING_CREDENTIALS.txt');
const credText = fs.readFileSync(credPath, 'utf8');
const userMatch = credText.match(/User\s*:\s*(\S+)/);
const passMatch = credText.match(/Password\s*:\s*(\S+)/);
const HTTP_USER = userMatch ? userMatch[1] : 'staging';
const HTTP_PASS = passMatch ? passMatch[1] : '';

console.log(`[QA] target=${URL_TARGET}`);
console.log(`[QA] user=${HTTP_USER}`);
console.log(`[QA] outprefix=${OUT_PREFIX}`);

const browser = await chromium.launch({ headless: true });

const consoleMessages = [];
const networkErrors = [];
const allRequests = [];

async function captureViewport(label, viewport) {
  const context = await browser.newContext({
    httpCredentials: { username: HTTP_USER, password: HTTP_PASS },
    viewport,
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    consoleMessages.push({
      label,
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });

  page.on('pageerror', (err) => {
    consoleMessages.push({ label, type: 'pageerror', text: err.message, stack: err.stack });
  });

  page.on('requestfailed', (req) => {
    networkErrors.push({
      label,
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText || 'unknown',
    });
  });

  page.on('response', (resp) => {
    const status = resp.status();
    const url = resp.url();
    allRequests.push({ label, url, status });
    if (status >= 400) {
      networkErrors.push({ label, url, status, statusText: resp.statusText() });
    }
  });

  await page.goto(URL_TARGET, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait pour que les animations React + Three.js chargent
  await page.waitForTimeout(5000);

  const outPath = `${OUT_PREFIX}-${label}.png`;
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`[QA] screenshot ${label} : ${outPath}`);

  // Inspection DOM : data-theme, mount points React, présence des bundles
  const inspection = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const mountPoint = document.querySelector('#inari-homepage-root');
    const skeleton = document.querySelector('.inari-skeleton-hero');
    const canvas = document.querySelectorAll('canvas');
    const reactRoot = mountPoint?.children?.length || 0;

    return {
      htmlDataTheme: html.getAttribute('data-theme'),
      htmlClass: html.className,
      bodyClass: body.className,
      mountPointExists: !!mountPoint,
      mountPointChildrenCount: reactRoot,
      mountPointHTML: mountPoint ? mountPoint.outerHTML.substring(0, 500) : null,
      skeletonStillVisible: !!skeleton && skeleton.offsetParent !== null,
      canvasCount: canvas.length,
      canvasInfo: Array.from(canvas).map((c) => ({
        width: c.width,
        height: c.height,
        cssWidth: c.offsetWidth,
        cssHeight: c.offsetHeight,
        parentClass: c.parentElement?.className || null,
      })),
      computedBg: getComputedStyle(body).backgroundColor,
      title: document.title,
      urlFinal: location.href,
    };
  });

  console.log(`[QA] inspection ${label} :`, JSON.stringify(inspection, null, 2));

  await context.close();
  return inspection;
}

const desktop = await captureViewport('desktop', { width: 1440, height: 900 });
const mobile = await captureViewport('mobile', { width: 390, height: 844 });

await browser.close();

const report = {
  url: URL_TARGET,
  timestamp: new Date().toISOString(),
  inspection: { desktop, mobile },
  consoleMessages: consoleMessages.filter(
    (m) => m.type === 'error' || m.type === 'warning' || m.type === 'pageerror'
  ),
  networkErrors,
  bundleLoaded: {
    homepageJs: allRequests.some((r) => r.url.includes('homepage-Cvzmx7Ya') && r.status === 200),
    homepageCss: allRequests.some((r) => r.url.includes('homepage-CcwWSLGY') && r.status === 200),
    threeChunk: allRequests.find((r) => r.url.includes('three.module-')),
  },
  totalRequests: allRequests.length,
};

const reportPath = `${OUT_PREFIX}-report.json`;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`[QA] report : ${reportPath}`);
console.log(`[QA] erreurs console : ${report.consoleMessages.length}`);
console.log(`[QA] erreurs reseau : ${networkErrors.length}`);
console.log(`[QA] DONE`);
