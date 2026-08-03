/* 現行サイト(mount-inc.com)の画像を収集して originals/ に保存する一回きりのスクリプト
   使い方: node _fetch-photos.js */
const fs = require('fs');
const path = require('path');

const BASE = 'https://mount-inc.com/';
const PAGES = ['index.html', 'about.html', 'renovation.html', 'electric.html', 'staff.html', 'recruit.html', 'contact.html'];
const OUT = path.join(__dirname, 'originals');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const urls = new Set();

  // HTMLから <img src> / srcset / style背景 を抽出
  for (const p of PAGES) {
    const res = await fetch(BASE + p);
    if (!res.ok) { console.warn('skip', p, res.status); continue; }
    const html = await res.text();
    for (const m of html.matchAll(/(?:src|href)=["']([^"']+\.(?:jpe?g|png|gif|webp|svg))["']/gi)) urls.add(m[1]);
    for (const m of html.matchAll(/url\(["']?([^"')]+\.(?:jpe?g|png|gif|webp))["']?\)/gi)) urls.add(m[1]);
    // CSSファイルも辿る
    for (const m of html.matchAll(/<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi)) {
      try {
        const cssUrl = new URL(m[1], BASE + p).href;
        if (!cssUrl.startsWith('https://mount-inc.com')) continue;
        const css = await (await fetch(cssUrl)).text();
        for (const mm of css.matchAll(/url\(["']?([^"')]+\.(?:jpe?g|png|gif|webp))["']?\)/gi)) {
          urls.add(new URL(mm[1], cssUrl).href);
        }
      } catch (e) { /* ignore */ }
    }
  }

  // 絶対URL化 + 自サイトのみ
  const list = [...urls]
    .map(u => { try { return new URL(u, BASE).href; } catch { return null; } })
    .filter(u => u && u.startsWith('https://mount-inc.com'));

  console.log('found', list.length, 'images');
  const manifest = [];
  for (const u of [...new Set(list)]) {
    const rel = decodeURIComponent(new URL(u).pathname).replace(/^\//, '').replace(/[\\/]/g, '__');
    const dest = path.join(OUT, rel);
    try {
      const res = await fetch(u);
      if (!res.ok) { console.warn('NG', res.status, u); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      manifest.push({ url: u, file: rel, bytes: buf.length });
      console.log('ok', rel, (buf.length / 1024).toFixed(0) + 'KB');
    } catch (e) { console.warn('ERR', u, e.message); }
  }
  fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('done:', manifest.length, 'saved to originals/');
})();
