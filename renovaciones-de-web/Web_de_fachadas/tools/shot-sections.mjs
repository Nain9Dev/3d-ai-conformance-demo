import { chromium } from 'playwright';
const OUT = process.env.SHOT_DIR;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/' + (process.env.PAGE || 'index') + '.html', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);
for (const sel of (process.env.SECTIONS || '#sistema,#materiales,#proyectos,#presupuesto').split(',')) {
  const el = await page.$(sel);
  if (!el) { console.log('no encontrado', sel); continue; }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await el.screenshot({ path: `${OUT}/sec-${(process.env.PAGE||'index')}-${sel.replace(/[#.]/g,'')}.png` });
  console.log('ok', sel);
}
await b.close();
