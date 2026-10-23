// Headless phone smoke test: node tools/shot.mjs [steps.json] ; writes shots to $OUT (default scratch)
// Playwright と Chromium の場所は環境変数で変えられる(既定はこの開発環境の場所)。
//   PLAYWRIGHT_MODULE=/path/to/node_modules/playwright/index.mjs  CHROMIUM_PATH=/path/to/chrome
const { chromium, devices } = await import(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright/index.mjs');
import fs from 'fs'; import path from 'path';
const OUT = process.env.OUT || '/tmp/claude-0/shots'; fs.mkdirSync(OUT, { recursive: true });
const file = 'file://' + path.resolve(process.env.HTML || 'dist/index.html') + '?city=' + (process.env.CITY || '4');
const land = process.env.PORTRAIT ? false : true;
const dev = devices['Pixel 7'];
const vp = land ? { width: 915, height: 412 } : dev.viewport;
const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH === '' ? {} : { executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' }), args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ ...dev, viewport: vp, screen: vp });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 6).join('\n'))); page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.goto(file); await page.waitForTimeout(1500);
const script = process.argv[2] ? (await import(path.resolve(process.argv[2]))).default : async (p, shot) => { await shot('title'); };
let n = 0; const shot = async (name) => { const f = `${OUT}/${String(++n).padStart(2,'0')}_${name}.png`; await page.screenshot({ path: f }); console.log('shot', f); };
try { await script(page, shot); } catch (e) { errs.push('script: ' + e.stack); await shot('fail'); }
console.log(errs.length ? errs.join('\n') : 'no errors');
await browser.close();
