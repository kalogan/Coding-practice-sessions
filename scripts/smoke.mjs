// Agent runtime-smoke (preview-harness §C): serve the FRESHLY BUILT bundle on an
// alt port, drive both entries, and read real signals — console errors first,
// then DOM, then a screenshot. A clean console + rendered content + the path
// actually exercised = PASS. Anything thrown = FAIL.
//
// Usage: pnpm build && pnpm smoke
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { globSync } from 'node:fs';
import { chromium } from 'playwright';

// The managed env pre-installs Chromium under PLAYWRIGHT_BROWSERS_PATH but the
// pinned playwright build may differ — point at whatever full chrome is present
// rather than downloading (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD is set).
function findChrome() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const hits = globSync(`${root}/chromium-*/chrome-linux/chrome`);
  return hits[0];
}

const DIST = join(process.cwd(), 'dist');
const PORT = 4319; // alt port — never disturb a running dev server
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

if (!existsSync(DIST)) {
  console.error('FAIL: no dist/ — run `pnpm build` first.');
  process.exit(1);
}

// static server with the same /preview -> /preview.html rewrite vercel.json does
const server = http.createServer(async (req, res) => {
  let path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (path === '/' || path === '') path = '/index.html';
  if (path === '/preview') path = '/preview.html';
  if (path === '/playground') path = '/playground.html';
  const file = normalize(join(DIST, path));
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((r) => server.listen(PORT, r));
const base = `http://localhost:${PORT}`;
const executablePath = findChrome();
const browser = await chromium.launch(executablePath ? { executablePath } : {});

let failed = false;

async function check(name, path, mustContain) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const url = m.location()?.url ?? '';
    // favicon.ico is requested by the browser and 404s on the bare static
    // server (and on Vercel without one) — harness noise, not an app error.
    if (url.includes('favicon')) return;
    errors.push(m.text() + (url ? ` [${url}]` : ''));
  });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="step-view"]', { timeout: 5000 }).catch(() => {});

  // drive EVERY algorithm in the picker — each must mount some view, render a
  // note, and advance one step without throwing. A renderer that breaks for one
  // view kind fails here (a per-topic green-but-broken catcher).
  const items = page.locator('.picker-item');
  const count = await items.count();
  let drivenViews = 0;
  for (let i = 0; i < count; i++) {
    await items.nth(i).click();
    await page.waitForTimeout(120);
    const rendered = await page.locator('[data-testid="step-view"] *').count();
    const note = (await page.locator('[data-testid="step-note"]').first().textContent()) ?? '';
    if (rendered > 0 && note.length > 0) drivenViews++;
    else errors.push(`picker item ${i}: rendered=${rendered} note="${note.slice(0, 30)}"`);
    // step forward once to prove the player drives the real trace
    const play = page.locator('[data-testid="play"]');
    if (await play.count()) await play.click();
    await page.waitForTimeout(200);
    if (await play.count()) await play.click(); // pause
  }
  const text = (await page.locator('#root').textContent()) ?? '';

  const shot = join(process.cwd(), `scratchpad-smoke-${name}.png`);
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {});

  const ok = errors.length === 0 && drivenViews === count && count > 0 && text.includes(mustContain);
  console.log(
    `[${ok ? 'PASS' : 'FAIL'}] ${name} (${path})  algos=${count} driven=${drivenViews} consoleErrors=${errors.length}`,
  );
  if (errors.length) console.log('   issues:', errors.join(' | '));
  if (!ok) failed = true;
  await page.close();
}

// Mobile overflow guard: at phone width, the PAGE must never scroll sideways
// (the bar chart / code may scroll inside their own box, but the page must not).
// Checks every algorithm — a wide view that stretches the layout fails here.
async function checkMobile(path, width = 390) {
  const page = await browser.newPage({ viewport: { width, height: 780 }, isMobile: true });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="step-view"]', { timeout: 5000 }).catch(() => {});

  const items = page.locator('.picker-item');
  const count = await items.count();
  let worstOverflow = 0;
  let worstAlgo = '';
  for (let i = 0; i < count; i++) {
    const title = (await items.nth(i).textContent()) ?? `#${i}`;
    await items.nth(i).click();
    await page.waitForTimeout(120);
    // page-level horizontal overflow = scrollWidth beyond the viewport
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    if (overflow > worstOverflow) {
      worstOverflow = overflow;
      worstAlgo = title.trim();
    }
  }
  await page.screenshot({ path: join(process.cwd(), 'scratchpad-smoke-mobile.png') }).catch(() => {});

  // allow 1px for sub-pixel rounding
  const ok = errors.length === 0 && worstOverflow <= 1;
  console.log(
    `[${ok ? 'PASS' : 'FAIL'}] mobile ${width}px (${path})  algos=${count} maxHorizOverflow=${worstOverflow}px${worstOverflow > 1 ? ` (worst: ${worstAlgo})` : ''}`,
  );
  if (!ok) failed = true;
  await page.close();
}

// Playground (JS path): type nothing, just hit Run on the starter and confirm
// the user's REAL code executes in the worker and its trace renders in the
// Player — end to end, no console errors, no run-error panel.
async function checkPlayground(path) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const url = m.location()?.url ?? '';
    if (url.includes('favicon')) return;
    errors.push(m.text() + (url ? ` [${url}]` : ''));
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="code-editor"]', { timeout: 5000 }).catch(() => {});
  await page.locator('[data-testid="run"]').click();
  const rendered1 = await page
    .waitForSelector('[data-testid="step-view"]', { timeout: 6000 })
    .then(() => true)
    .catch(() => false);
  await page.waitForTimeout(200);
  const rendered = await page.locator('[data-testid="step-view"] *').count();
  const note = (await page.locator('[data-testid="step-note"]').first().textContent()) ?? '';
  const runErrors = await page.locator('[data-testid="run-error"]').count();
  await page.screenshot({ path: join(process.cwd(), 'scratchpad-smoke-playground.png'), fullPage: true }).catch(() => {});

  const ok = errors.length === 0 && rendered1 && rendered > 0 && note.length > 0 && runErrors === 0;
  console.log(
    `[${ok ? 'PASS' : 'FAIL'}] playground JS (${path})  rendered=${rendered} runError=${runErrors} consoleErrors=${errors.length}`,
  );
  if (errors.length) console.log('   console:', errors.join(' | '));
  if (runErrors) console.log('   runError:', await page.locator('[data-testid="run-error"]').textContent());
  if (!ok) failed = true;
  await page.close();
}

await check('production', '/', 'AlgoHarness');
await check('preview', '/preview', 'PREVIEW');
await checkMobile('/', 390);
await checkMobile('/preview', 360);
await checkPlayground('/playground');

await browser.close();
server.close();
console.log(
  '\nBOUNDARY: verified the harness renders the real components + drives the real trace.',
  '\nIt does NOT verify scale/perf or any path these two screens do not mount.',
);
process.exit(failed ? 1 : 0);
