import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = process.env.SHOT_DIR || '/tmp/shots';
mkdirSync(OUT, { recursive: true });
const base = 'http://localhost:4321';
const pages = process.env.PAGES ? process.env.PAGES.split(',') : ['index','servicios','proyectos','empresa','contacto'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];
for (const theme of ['light','dark']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, colorScheme: theme });
  for (const p of pages) {
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type()==='error') errs.push(`${p}[${theme}] ${m.text()}`); });
    page.on('pageerror', e => errs.push(`${p}[${theme}] PAGEERROR ${e.message}`));
    await page.goto(`${base}/${p}.html`, { waitUntil: 'networkidle' }).catch(e=>errs.push(`${p} ${e.message}`));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${p}-${theme}-top.png` });
    if (theme === 'light') await page.screenshot({ path: `${OUT}/${p}-full.png`, fullPage: true });
    await page.close();
  }
  await ctx.close();
}
const ctxm = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mp = await ctxm.newPage();
await mp.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
await mp.waitForTimeout(500);
await mp.screenshot({ path: `${OUT}/mobile-top.png` });
await b.close();
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'sin errores de consola');
