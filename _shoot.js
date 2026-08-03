/* スクリーンショット撮影スクリプト
   使い方: node _shoot.js            → 全ページ PC(1440)+SP(390) フルページ撮影
           node _shoot.js index sp   → 指定ページ・指定サイズのみ
   保存先: docs/screenshots/         前提: dev server (http://localhost:5197) 起動中 */
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Users\\TTS06\\.cache\\puppeteer\\chrome\\win64-150.0.7871.124\\chrome-win64\\chrome.exe';
const BASE = 'http://localhost:5197';
const OUT = path.join(__dirname, 'docs', 'screenshots');
const PAGES = ['index', 'about', 'renovation', 'electric', 'staff', 'recruit', 'contact'];
const SIZES = { pc: { width: 1440, height: 900 }, sp: { width: 390, height: 844 } };

(async () => {
  const argPage = process.argv[2];
  const argSize = process.argv[3];
  const pages = argPage ? [argPage] : PAGES;
  const sizes = argSize ? [argSize] : Object.keys(SIZES);

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const tab = await browser.newPage();
  for (const size of sizes) {
    await tab.setViewport({ ...SIZES[size], deviceScaleFactor: 1 });
    for (const p of pages) {
      const file = p === 'index' ? '' : p + '.html';
      await tab.goto(`${BASE}/${file}?noanim`, { waitUntil: 'networkidle0', timeout: 30000 });
      // lazy画像を全て読み込ませてからトップへ戻す
      await tab.evaluate(async () => {
        document.querySelectorAll('img[loading]').forEach(i => { i.loading = 'eager'; });
        await new Promise(res => {
          let y = 0;
          const t = setInterval(() => {
            y += 900; scrollTo(0, y);
            if (y >= document.documentElement.scrollHeight) { clearInterval(t); res(); }
          }, 50);
        });
        await Promise.all(Array.from(document.images).filter(i => !i.complete)
          .map(i => new Promise(res => { i.onload = i.onerror = res; })));
        scrollTo(0, 0);
      });
      await new Promise(r => setTimeout(r, 400));
      const out = path.join(OUT, `${size}-${p}.png`);
      await tab.screenshot({ path: out, fullPage: true });
      console.log('saved', out);
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
