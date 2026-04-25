// Mesure les valeurs CSS reelles + positions du Hero sur prod ET staging.
// Sortie : diff lisible + screenshots cote a cote.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

// REFERENCE = la page cybersec actuelle que Gilles utilise comme template
// TARGET    = ma nouvelle home avec React island
const REFERENCE_URL = 'https://staging.inaricom.com/accueil-cybersecurite/';
const TARGET_URL = 'https://staging.inaricom.com/';
const VIEWPORT = { width: 1920, height: 1080 };

const credPath = path.resolve('../../STAGING_CREDENTIALS.txt');
const credText = fs.readFileSync(credPath, 'utf8');
const passMatch = credText.match(/Password\s*:\s*(\S+)/);
const HTTP_PASS = passMatch ? passMatch[1] : '';

fs.mkdirSync('./out', { recursive: true });

async function inspect(page) {
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(4000);

    return await page.evaluate(() => {
        function elInfo(el) {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {
                tag: el.tagName,
                text: (el.innerText || '').substring(0, 90).replace(/\s+/g, ' ').trim(),
                top: Math.round(r.top + window.scrollY),
                left: Math.round(r.left),
                width: Math.round(r.width),
                height: Math.round(r.height),
                fontSize: cs.fontSize,
                lineHeight: cs.lineHeight,
                fontFamily: cs.fontFamily.substring(0, 40),
                fontWeight: cs.fontWeight,
                color: cs.color,
                textAlign: cs.textAlign,
                background: cs.backgroundColor,
                borderRadius: cs.borderTopLeftRadius,
            };
        }

        // H1 hero : 1er H1 visible dans la zone superieure
        const h1s = Array.from(document.querySelectorAll('h1'));
        const heroH1 = h1s.find((h) => {
            const r = h.getBoundingClientRect();
            return r.top + window.scrollY < window.innerHeight * 1.5 && r.height > 30;
        });

        // Badge : pilule courte avec border-radius >= 12px contenant texte significatif
        let badge = null;
        const cands = Array.from(document.querySelectorAll('div, span, p'));
        for (const el of cands) {
            const r = el.getBoundingClientRect();
            if (r.height < 24 || r.height > 80) continue;
            if (r.width < 100 || r.width > 700) continue;
            if (r.top + window.scrollY > window.innerHeight) continue;
            const cs = getComputedStyle(el);
            const radius = parseFloat(cs.borderTopLeftRadius);
            if (radius < 12) continue;
            const text = (el.innerText || '').trim().toUpperCase();
            if (!/WEB|INFRASTRUCTURE|BLOCKCHAIN|CYBERS|INARICOM/.test(text)) continue;
            if (text.length > 80) continue;
            badge = el;
            break;
        }

        // Sous-titre : 1er <p> apres H1 dans le DOM ascendant commun
        let subtitle = null;
        if (heroH1) {
            const ancestor = heroH1.closest('section, main, article, div');
            if (ancestor) {
                const ps = Array.from(ancestor.querySelectorAll('p'));
                subtitle = ps.find((p) => {
                    const r = p.getBoundingClientRect();
                    return (
                        r.top + window.scrollY > heroH1.getBoundingClientRect().top + window.scrollY &&
                        r.height > 10 &&
                        r.width > 100 &&
                        (p.innerText || '').length > 20
                    );
                });
            }
        }

        // CTA primaire : 1er bouton/lien rouge plein
        const ctas = Array.from(document.querySelectorAll('a, button'));
        let cta = null;
        for (const el of ctas) {
            const r = el.getBoundingClientRect();
            if (r.top + window.scrollY > window.innerHeight * 1.5) continue;
            if (r.height < 30) continue;
            const cs = getComputedStyle(el);
            const bg = cs.backgroundColor;
            const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!m) continue;
            const [, rr, gg, bb] = m.map(Number);
            if (rr > 150 && gg < 80 && bb < 80) {
                cta = el;
                break;
            }
        }

        // Header
        const header =
            document.querySelector('header.site-header') ||
            document.querySelector('.kadence-header-row-inner') ||
            document.querySelector('header');

        // Canvas/svg/img de la fox (la prod cybersec utilise un SVG, le staging un canvas)
        const foxCandidates = [
            ...Array.from(document.querySelectorAll('canvas')),
            ...Array.from(document.querySelectorAll('svg')).filter((s) => {
                const r = s.getBoundingClientRect();
                return r.width > 200 && r.height > 200;
            }),
            ...Array.from(document.querySelectorAll('img')).filter((i) => {
                const r = i.getBoundingClientRect();
                const src = i.src || '';
                return r.width > 200 && (/fox|renard|inari/i.test(src) || /fox|renard|inari/i.test(i.alt || ''));
            }),
        ];
        const fox = foxCandidates.find((c) => {
            const r = c.getBoundingClientRect();
            return r.top + window.scrollY < window.innerHeight * 1.5 && r.width > 200;
        });

        return {
            viewport: { w: window.innerWidth, h: window.innerHeight },
            documentHeight: document.documentElement.scrollHeight,
            header: elInfo(header),
            badge: elInfo(badge),
            h1: elInfo(heroH1),
            subtitle: elInfo(subtitle),
            cta: elInfo(cta),
            fox: elInfo(fox),
        };
    });
}

const browser = await chromium.launch({ headless: true });

console.log('[1/2] REFERENCE (accueil-cybersecurite) ...');
const refCtx = await browser.newContext({
    viewport: VIEWPORT,
    httpCredentials: { username: 'staging', password: HTTP_PASS },
    ignoreHTTPSErrors: true,
});
const refPage = await refCtx.newPage();
await refPage.goto(REFERENCE_URL, { timeout: 30000 }).catch((e) => console.warn('ref nav err:', e.message));
const reference = await inspect(refPage);
await refPage.screenshot({ path: './out/audit-reference.png', fullPage: false });
await refCtx.close();

console.log('[2/2] TARGET (home staging) ...');
const tgtCtx = await browser.newContext({
    viewport: VIEWPORT,
    httpCredentials: { username: 'staging', password: HTTP_PASS },
    ignoreHTTPSErrors: true,
});
const tgtPage = await tgtCtx.newPage();
await tgtPage.goto(TARGET_URL, { timeout: 30000 }).catch((e) => console.warn('target nav err:', e.message));
const target = await inspect(tgtPage);
await tgtPage.screenshot({ path: './out/audit-target.png', fullPage: false });
await tgtCtx.close();

await browser.close();

fs.writeFileSync(
    './out/audit-report.json',
    JSON.stringify({ reference, target }, null, 2),
);

// === SORTIE LISIBLE ===
console.log('');
console.log('================================================================');
console.log('  REFERENCE (accueil-cybersecurite) vs TARGET (home staging)');
console.log('  viewport', VIEWPORT.width, 'x', VIEWPORT.height);
console.log('================================================================');

function compareEl(name, p, s) {
    console.log('');
    console.log(`### ${name.toUpperCase()} ###`);
    if (!p) console.log('  REFERENCE : NON TROUVE');
    if (!s) console.log('  TARGET    : NON TROUVE');
    if (!p || !s) return;
    console.log(`  REFERENCE : "${p.text.substring(0, 70)}"`);
    console.log(`              top=${p.top}  left=${p.left}  size=${p.width}x${p.height}`);
    console.log(`              font=${p.fontSize} / lh=${p.lineHeight}  align=${p.textAlign}`);
    console.log(`              color=${p.color}  bg=${p.background}  radius=${p.borderRadius}`);
    console.log(`  TARGET    : "${s.text.substring(0, 70)}"`);
    console.log(`              top=${s.top}  left=${s.left}  size=${s.width}x${s.height}`);
    console.log(`              font=${s.fontSize} / lh=${s.lineHeight}  align=${s.textAlign}`);
    console.log(`              color=${s.color}  bg=${s.background}  radius=${s.borderRadius}`);
    const dx = s.left - p.left;
    const dy = s.top - p.top;
    const dw = s.width - p.width;
    const dh = s.height - p.height;
    console.log(`  DELTA     : top ${dy >= 0 ? '+' : ''}${dy}  left ${dx >= 0 ? '+' : ''}${dx}  width ${dw >= 0 ? '+' : ''}${dw}  height ${dh >= 0 ? '+' : ''}${dh}`);
}

for (const k of ['header', 'badge', 'h1', 'subtitle', 'cta', 'fox']) {
    compareEl(k, reference[k], target[k]);
}

function gap(a, b) {
    if (!a || !b) return null;
    return b.top - (a.top + a.height);
}
console.log('');
console.log('--- ESPACES ENTRE ELEMENTS (px) ---');
console.log(`header -> badge      : ref=${gap(reference.header, reference.badge)}  target=${gap(target.header, target.badge)}`);
console.log(`badge  -> h1         : ref=${gap(reference.badge, reference.h1)}  target=${gap(target.badge, target.h1)}`);
console.log(`h1     -> subtitle   : ref=${gap(reference.h1, reference.subtitle)}  target=${gap(target.h1, target.subtitle)}`);
console.log(`sub    -> cta        : ref=${gap(reference.subtitle, reference.cta)}  target=${gap(target.subtitle, target.cta)}`);
console.log('');
console.log('--- ALIGNEMENT H1 vs FOX (h1.top - fox.top) ---');
if (reference.h1 && reference.fox) {
    console.log(`reference : h1.top=${reference.h1.top}  fox.top=${reference.fox.top}  delta=${reference.h1.top - reference.fox.top}px`);
}
if (target.h1 && target.fox) {
    console.log(`target    : h1.top=${target.h1.top}  fox.top=${target.fox.top}  delta=${target.h1.top - target.fox.top}px`);
}
console.log('');
console.log('--- POSITION FOX (left, right) ---');
if (reference.fox) console.log(`reference : fox.left=${reference.fox.left}  right=${reference.fox.left + reference.fox.width}  width=${reference.fox.width}`);
if (target.fox) console.log(`target    : fox.left=${target.fox.left}  right=${target.fox.left + target.fox.width}  width=${target.fox.width}`);
console.log('');
console.log('Screenshots : ./out/audit-reference.png + ./out/audit-target.png');
