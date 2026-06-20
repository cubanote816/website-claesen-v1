import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleErrors = [];

page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push(e.message));

await page.goto('https://www.claesen-verlichting.be/projecten/domaine-des-sources-ballenvangers/', {
    waitUntil: 'networkidle', timeout: 30000
});

// Wait for client:load hydration to complete
await page.waitForTimeout(4000);

// Section headings
const h2s = await page.locator('h2').allTextContents();

// Body text (the editorial paragraph under "In actie")
const bodyText = await page.locator('article div').first().textContent().catch(() => '');

// Highlight cards (uitdaging / oplossing / resultaat)
const cards = await page.locator('section div[class*="min-h"]').count();
const cardTitles = await page.locator('section h3').allTextContents();

// Is any section visible around "In actie"?
const sections = await page.locator('main section').count();

// Screenshot
await page.screenshot({ path: 'tmp/verify-in-actie.png', fullPage: false });
await page.screenshot({ path: 'tmp/verify-in-actie-full.png', fullPage: true });

console.log('sections in main:', sections);
console.log('h2s:', JSON.stringify(h2s));
console.log('bodyText (120ch):', bodyText.trim().slice(0, 120));
console.log('highlight cards found:', cards);
console.log('card h3 titles:', JSON.stringify(cardTitles));
console.log('console errors:', consoleErrors.length ? consoleErrors : 'none');

await browser.close();
