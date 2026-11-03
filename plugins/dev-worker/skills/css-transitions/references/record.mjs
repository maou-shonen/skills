// usage: node record.mjs <page.html> <out-basename>
// Edit the scripted interactions below to match the page under review.
// Records the scripted interaction to <out>.mp4 (needs playwright + ffmpeg).
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import path from 'path';
const [page_, out] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 520, height: 560 }, recordVideo: { dir: '/tmp/rec', size: { width: 520, height: 560 } } });
await ctx.addInitScript(() => addEventListener('DOMContentLoaded', () => {
  const c = document.createElement('div');
  c.style.cssText = 'position:fixed;width:14px;height:14px;border-radius:50%;background:rgba(220,40,80,.55);pointer-events:none;z-index:9;left:-20px;top:-20px;transform:translate(-50%,-50%)';
  document.body.append(c); addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px' });
}));
const p = await ctx.newPage();
const t0 = Date.now(); const marks = [];
const mark = n => marks.push([n, ((Date.now() - t0) / 1000).toFixed(2)]);
await p.goto('file://' + path.resolve(page_)); await p.waitForTimeout(1200);
const click = async (sel) => { const bx = await p.locator(sel).first().boundingBox(); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2, { steps: 8 }); await p.waitForTimeout(120); await p.mouse.down(); await p.waitForTimeout(90); await p.mouse.up(); };
for (const txt of ['買牛奶', '回覆信件', '整理 skills repo']) {
  await p.locator('#t').fill(txt); mark('add ' + txt); await click('.add'); await p.waitForTimeout(800);
}
mark('check'); await click('li:nth-child(2) .box'); await p.waitForTimeout(1000);
mark('filter done'); await click('[data-f=done]'); await p.waitForTimeout(1000);
mark('filter all'); await click('[data-f=all]'); await p.waitForTimeout(1000);
mark('delete 1'); await click('li:nth-child(1) .del'); await p.waitForTimeout(900);
mark('delete 2'); await click('li:nth-child(1) .del'); await p.waitForTimeout(900);
mark('delete 3 -> empty'); await click('li:nth-child(1) .del'); await p.waitForTimeout(1600);
const v = p.video(); await ctx.close(); await b.close();
execSync(`ffmpeg -y -loglevel error -i ${await v.path()} -c:v libx264 -pix_fmt yuv420p -r 30 ${out}.mp4`);
console.log(JSON.stringify(marks));
