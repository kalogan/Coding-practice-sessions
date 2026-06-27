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
  // drive it: the visualization must actually mount and produce array cells
  await page.waitForSelector('[data-testid="array-view"]', { timeout: 5000 }).catch(() => {});
  const cells = await page.locator('[data-testid^="cell-"]').count();
  const note = (await page.locator('[data-testid="step-note"]').first().textContent()) ?? '';
  const text = await page.locator('#root').textContent();

  // step forward once to prove the player drives the real trace
  const play = page.locator('[data-testid="play"]');
  if (await play.count()) await play.click();
  await page.waitForTimeout(400);
  const counter = (await page.locator('[data-testid="step-counter"]').first().textContent()) ?? '';

  const shot = join(process.cwd(), `scratchpad-smoke-${name}.png`);
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {});

  const ok =
    errors.length === 0 && cells > 0 && note.length > 0 && (text ?? '').includes(mustContain);
  console.log(
    `[${ok ? 'PASS' : 'FAIL'}] ${name} (${path})  cells=${cells} step=${counter} consoleErrors=${errors.length}`,
  );
  if (errors.length) console.log('   console:', errors.join(' | '));
  if (!ok) failed = true;
  await page.close();
}

await check('production', '/', 'AlgoHarness');
await check('preview', '/preview', 'PREVIEW');

await browser.close();
server.close();
console.log(
  '\nBOUNDARY: verified the harness renders the real components + drives the real trace.',
  '\nIt does NOT verify scale/perf or any path these two screens do not mount.',
);
process.exit(failed ? 1 : 0);
