/* ============================================================
   Equal Web 連携 — お知らせ配信 / 会社概要反映 / お問い合わせ受信
   ------------------------------------------------------------
   equalweb-config.js の apiUrl で会社専用APIへ接続。
   接続失敗時はサンプルに置き換えず、送信も成功扱いにしない。
   ページ内に対象要素（#ewNews / [data-ew] / #cform）が
   ある場合のみ、それぞれの機能が動く。
============================================================ */
(function () {
  'use strict';
  var API = ((window.EQUAL_WEB || {}).apiUrl || '').trim();

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function fmtD(s) { return String(s || '').slice(0, 10).replace(/-/g, '.'); }

  /* ---- 簡易Markdown→HTML（エスケープ済みテキストに適用） ---- */
  function md(src) {
    var lines = esc(src || '').split(/\r?\n/), out = [], list = null;
    function closeList() { if (list) { out.push(list === 'ul' ? '</ul>' : '</ol>'); list = null; } }
    function inline(t) {
      return t
        .replace(/!\[([^\]]*)\]\((https?:[^)\s]+|[a-zA-Z0-9_\-./]+\.(?:jpg|jpeg|png|webp|gif))\)/g, '<img src="$2" alt="$1" loading="lazy">')
        .replace(/\[([^\]]+)\]\((https?:[^)\s]+|#[^)\s]*)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }
    lines.forEach(function (ln) {
      var t = ln.trim(), m;
      if (!t) { closeList(); return; }
      if (m = t.match(/^(#{1,4})\s+(.*)/)) { closeList(); var lv = Math.min(m[1].length + 1, 5); out.push('<h' + lv + '>' + inline(m[2]) + '</h' + lv + '>'); return; }
      if (/^(---|\*\*\*)$/.test(t)) { closeList(); out.push('<hr>'); return; }
      if (m = t.match(/^&gt;\s?(.*)/)) { closeList(); out.push('<blockquote>' + inline(m[1]) + '</blockquote>'); return; }
      if (m = t.match(/^[-*]\s+(.*)/)) { if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inline(m[1]) + '</li>'); return; }
      if (m = t.match(/^\d+\.\s+(.*)/)) { if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inline(m[1]) + '</li>'); return; }
      closeList(); out.push('<p>' + inline(t) + '</p>');
    });
    closeList(); return out.join('');
  }

  /* ---- モーダル ---- */
  var modal = null;
  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div'); modal.className = 'ewm';
    modal.innerHTML = '<div class="ewm-card"><button class="ewm-x" aria-label="閉じる">✕</button><div class="ewm-meta"></div><div class="ewm-title"></div><div class="ewm-body"></div></div>';
    document.body.appendChild(modal);
    function close() { modal.classList.remove('on'); document.body.style.overflow = ''; }
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('.ewm-x').onclick = close;
  }
  function openModal(metaHtml, title, bodyHtml) {
    ensureModal();
    modal.querySelector('.ewm-meta').innerHTML = metaHtml;
    modal.querySelector('.ewm-title').textContent = title;
    modal.querySelector('.ewm-body').innerHTML = bodyHtml;
    modal.classList.add('on'); document.body.style.overflow = 'hidden';
  }

  /* ---- お知らせ描画（#ewNews がある場合のみ） ---- */
  function renderNews(list) {
    var el = document.getElementById('ewNews');
    if (!el) return;
    el.innerHTML = list.slice(0, 6).map(function (n, i) {
      return '<div class="ewn-item" data-i="' + i + '">' +
        '<span class="ewn-date">' + esc(fmtD(n.published_at)) + (n.is_pinned ? ' 📌' : '') + '</span>' +
        '<span class="ewn-cat">' + esc(n.category || 'お知らせ') + '</span>' +
        '<span class="ewn-title">' + esc(n.title) + '</span>' +
        '<span class="ewn-arrow">→</span></div>';
    }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.ewn-item'), function (item) {
      item.onclick = function () {
        var n = list[+item.dataset.i];
        if (n.link_url) {
          if (n.link_url.charAt(0) === '#') { location.hash = n.link_url; }
          else if (/^https?:/.test(n.link_url)) { window.open(n.link_url, '_blank', 'noopener'); }
          else { location.href = n.link_url; }
          return;
        }
        var html = (n.image_url ? '<p><img src="' + esc(n.image_url) + '" alt=""></p>' : '') +
          String(n.body || '').split(/\n/).map(function (p) { return p.trim() ? '<p>' + esc(p) + '</p>' : ''; }).join('');
        openModal('<span class="ewn-cat">' + esc(n.category || '') + '</span><span>' + esc(fmtD(n.published_at)) + '</span>', n.title, html || '<p>詳細は近日お知らせします。</p>');
      };
    });
  }

  function renderArticles(list) {
    var el=document.getElementById('ewArticles');if(!el)return;
    el.innerHTML=list.length?list.map(function(a,i){return '<button type="button" class="wk-card article-card" data-article-index="'+i+'">'+(a.thumbnail_url?'<div class="wk-thumb"><img src="'+esc(a.thumbnail_url)+'" alt="" loading="lazy"></div>':'<div class="wk-thumb wk-thumb-ph">記事</div>')+'<div class="wk-bd"><div class="wk-date">'+esc(fmtD(a.published_at))+'</div><h3 class="wk-title">'+esc(a.title)+'</h3><p class="wk-sum">'+esc(a.summary||'')+'</p></div></button>';}).join(''):'<p>記事は準備中です。</p>';
    el.querySelectorAll('[data-article-index]').forEach(function(card){card.onclick=function(){var a=list[Number(card.dataset.articleIndex)];var body=(a.thumbnail_url?'<p><img src="'+esc(a.thumbnail_url)+'" alt=""></p>':'')+String(a.body||'').split(/\n/).map(function(p){return p.trim()?'<p>'+esc(p)+'</p>':'';}).join('');openModal('<span>記事</span><span>'+esc(fmtD(a.published_at))+'</span>',a.title,body);};});
  }

  /* ---- 説明文差し替え（[data-ew-text] がある場合のみ）----
     map = {slot: 文章}。文章が設定されているスロットだけ差し替え、
     未設定のスロットはHTMLに書かれた初期の文章のまま。
     改行はそのまま、空行で段落分け（DIV要素のみ）、【】は強調色になる。 */
  function applyTexts(map) {
    if (!map) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-ew-text]'), function (el) {
      if (el._ewInitialHtml === undefined) el._ewInitialHtml = el.innerHTML;
      var v = map[el.getAttribute('data-ew-text')];
      if (!v) { el.innerHTML = el._ewInitialHtml; return; }
      var html = esc(v).replace(/【([^】]*)】/g, '<span class="ac">$1</span>');
      if (el.tagName === 'DIV') {
        el.innerHTML = html.split(/\n\s*\n/).map(function (p) {
          return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
        }).join('');
      } else {
        el.innerHTML = html.replace(/\n/g, '<br>');
      }
    });
  }

  /* ---- 会社概要反映（[data-ew] / [data-ew-href] がある場合のみ） ---- */
  function fillCompany(c) {
    if (!c) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-ew]'), function (td) {
      var k = td.getAttribute('data-ew'), v = '';
      if (k === 'address' || k === 'hq_address') { v = [c.postal_code ? '〒' + c.postal_code : '', c.address || ''].filter(Boolean).join(' '); }
      else if (k === 'established_date') { v = String(c.established_date || '').replace(/-/g, '/'); }
      else { v = c[k] || ''; }
      if (v) td.textContent = v;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-ew-href]'), function (a) {
      var v = c[a.getAttribute('data-ew-href')];
      if (v) a.href = v;
    });
  }

  /* ---- ラベル+値のテーブル描画（会社概要 追加項目 / 募集要項 共通） ---- */
  function renderKV(tbodyId, list) {
    var tb = document.getElementById(tbodyId);
    if (!tb || !list || !list.length) return;
    tb.innerHTML = list.map(function (s) {
      var val = String(s.value == null ? '' : s.value).split(/\n/).map(esc).join('<br>');
      return '<tr><th><span>' + esc(s.label) + '</span></th><td>' + val + '</td></tr>';
    }).join('');
  }
  function renderSettings(list) { renderKV('ewSettings', list); }
  function renderRecruit(list) { renderKV('ewRecruit', list); }

  /* ---- 施工事例（#ewWorks がある場合のみ）----
     記事のうち category=施工事例 を表示。タグ=工事ジャンルで絞り込み。
     URLの ?genre=◯◯ で初期絞り込み（リノベーションページからの導線）。 ---- */
  function renderWorks(articles) {
    var serviceGrids = document.querySelectorAll('[data-work-service]');
    if (serviceGrids.length) {
      var aliases = window.businessServiceAliases || {};
      var cases = (articles || []).filter(function(a){return a.category === '施工事例';});
      function ids(a){return (a.tags || []).map(function(t){return aliases[t] || (t.indexOf('service:')===0 ? t.slice(8) : '');}).filter(function(id){return id && document.querySelector('[data-work-service="'+id.replace(/[^a-z-]/g,'')+'"]');});}
      serviceGrids.forEach(function(grid){
        var key=grid.dataset.workService;
        var list=cases.filter(function(a){var matches=ids(a);return key==='unassigned' ? !matches.length : matches.indexOf(key)!==-1;});
        if(key==='unassigned')grid.parentElement.hidden=!list.length;
        grid.className='service-case-grid';
        grid.innerHTML=list.length ? list.map(function(a,i){return '<button type="button" class="service-case" data-case-index="'+i+'">'+(a.thumbnail_url?'<img src="'+esc(a.thumbnail_url)+'" alt="" loading="lazy">':'')+'<span><small>'+esc(fmtD(a.published_at))+'</small><strong>'+esc(a.title)+'</strong>'+(a.summary?'<span>'+esc(a.summary)+'</span>':'')+'<em>施工事例を見る →</em></span></button>';}).join('') : '<p class="cases-empty">施工事例は準備中です。</p>';
        grid.querySelectorAll('[data-case-index]').forEach(function(card){card.onclick=function(){var a=list[Number(card.dataset.caseIndex)];var dialog=document.getElementById('case-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='case-dialog';dialog.className='service-dialog';dialog.setAttribute('aria-labelledby','case-title');dialog.innerHTML='<button type="button" class="dialog-close" aria-label="施工事例を閉じる">×</button><div class="map-kicker">WORKS / 施工事例</div><h2 id="case-title"></h2><div class="case-body"></div>';document.body.appendChild(dialog);dialog.querySelector('button').onclick=function(){dialog.close();};}dialog.querySelector('h2').textContent=a.title;dialog.querySelector('.case-body').innerHTML=(a.thumbnail_url?'<p><img src=\"'+esc(a.thumbnail_url)+'\" alt=\"\" style=\"max-width:100%\"></p>':'')+md(a.body);dialog.showModal();};});
      });
    }
    var grid = document.getElementById('ewWorks');
    if (!grid) return;
    var chipsEl = document.getElementById('wkChips');
    var emptyEl = document.getElementById('wkEmpty');
    var works = (articles || []).filter(function (a) { return a.category === '施工事例'; });
    var genre = '';
    try { genre = new URLSearchParams(location.search).get('genre') || ''; } catch (e) { }

    // ジャンル一覧 = 登録済みタグの集合（+URL指定ジャンル）
    var genres = [];
    works.forEach(function (a) { (a.tags || []).forEach(function (t) { if (genres.indexOf(t) === -1) genres.push(t); }); });
    if (genre && genres.indexOf(genre) === -1) genres.push(genre);

    function draw() {
      var list = genre ? works.filter(function (a) { return (a.tags || []).indexOf(genre) !== -1; }) : works;

      if (chipsEl) {
        chipsEl.innerHTML = ['<button class="wk-chip' + (genre === '' ? ' on' : '') + '" data-g="">すべて<span>' + works.length + '</span></button>']
          .concat(genres.map(function (g) {
            var n = works.filter(function (a) { return (a.tags || []).indexOf(g) !== -1; }).length;
            return '<button class="wk-chip' + (genre === g ? ' on' : '') + '" data-g="' + esc(g) + '">' + esc(g) + '<span>' + n + '</span></button>';
          })).join('');
        Array.prototype.forEach.call(chipsEl.querySelectorAll('.wk-chip'), function (b) {
          b.onclick = function () {
            genre = b.dataset.g;
            try { history.replaceState(null, '', genre ? '?genre=' + encodeURIComponent(genre) : location.pathname); } catch (e) { }
            draw();
          };
        });
      }

      grid.innerHTML = list.map(function (a, i) {
        var thumb = a.thumbnail_url
          ? '<div class="wk-thumb"><img src="' + esc(a.thumbnail_url) + '" alt="" loading="lazy"></div>'
          : '<div class="wk-thumb wk-thumb-ph">🏗</div>';
        return '<div class="wk-card" data-slug="' + esc(a.slug) + '">' + thumb +
          '<div class="wk-bd">' +
          '<div class="wk-tags">' + (a.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
          '<div class="wk-title">' + esc(a.title) + '</div>' +
          (a.summary ? '<div class="wk-sum">' + esc(a.summary) + '</div>' : '') +
          '<div class="wk-date">' + esc(fmtD(a.published_at)) + '</div>' +
          '</div></div>';
      }).join('');

      if (emptyEl) emptyEl.hidden = list.length > 0;

      Array.prototype.forEach.call(grid.querySelectorAll('.wk-card'), function (card) {
        card.onclick = function () {
          var a = list.filter(function (x) { return x.slug === card.dataset.slug; })[0];
          if (!a) return;
          var body = md(a.body) +
            ((a.tags && a.tags.length) ? '<div class="ewm-tags">' + a.tags.map(function (t) { return '<span class="ewm-tag">#' + esc(t) + '</span>'; }).join('') + '</div>' : '');
          openModal('<span class="ewn-cat">施工事例</span><span>' + esc(fmtD(a.published_at)) + '</span>', a.title, body);
        };
      });

      if (typeof window.reveal === 'function') window.reveal();
    }
    draw();
  }

  /* ---- 写真差し替え（[data-photo] がある場合のみ）----
     map = {slot: 画像URL}。URLが設定されているスロットだけ差し替え、
     未設定のスロットはHTMLに書かれた初期写真のまま。 */
  function applyPhotos(map) {
    map = map || {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-photo]'), function (el) {
      var url = map[el.getAttribute('data-photo')];
      var img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (!img) return;
      if (img._ewInitialSrc === undefined) img._ewInitialSrc = img.getAttribute('data-photo-initial') || img.getAttribute('src');
      var target = url || img._ewInitialSrc;
      if (img.getAttribute('src') !== target) img.setAttribute('src', target);
    });
  }

  /* ---- 描画・取得 ---- */
  function render(d, isMock) {
    var posts=(d.articles || []).filter(function(a){return a.category !== '施工事例';}).map(function(a){return Object.assign({},a,{category:'記事',image_url:a.thumbnail_url});});
    renderNews(d.news || []);
    renderArticles(posts);
      renderWorks(isMock && document.getElementById('service-details') ? [] : (d.articles || []));
    fillCompany(d.company);
    renderSettings(d.settings || []);
    renderRecruit(d.recruit || []);
    applyPhotos(d.photos || null);
    applyTexts(d.texts || null);
      if (!render.businessReady && document.getElementById('service-details')) {
        render.businessReady = true;
        var anchor = document.getElementById(location.hash.slice(1));
        if (anchor && location.hash.indexOf('#service-') === 0) anchor.scrollIntoView();
      }
    var st = document.getElementById('ewStamp');
    if (st) st.textContent = isMock ? '（サンプルデータ表示中 — Equal Web接続前）' : (d.generated_at ? '最終更新 ' + String(d.generated_at).slice(11, 16) : '');
    if (typeof window.reveal === 'function') window.reveal();
  }
  var contentLoaded = false;
  function readResponse(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  function loadFailed(e) {
    console.warn('Equal Web API 接続エラー:', e);
    if (!contentLoaded) ['ewNews', 'ewArticles', 'ewWorks'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '現在情報を取得できません。時間をおいて再度ご確認ください。';
    });
    var st = document.getElementById('ewStamp');
    if (st) st.textContent = contentLoaded ? '最新情報への更新を待っています。' : '情報を取得できませんでした。';
  }
  function load() {
    if (!API) { loadFailed(new Error('API未設定')); return; }
    fetch(API).then(readResponse).then(function (d) {
      if (!d || d.ok === false || !d.company) throw new Error('Invalid site response');
      render(d, false); contentLoaded = true;
    }).catch(loadFailed);
  }
  if (document.getElementById('ewNews') || document.querySelector('[data-ew], [data-ew-text], [data-photo]')) {
    load();
    if (API) setInterval(load, 60000); // 1分ごとに自動更新
  }

  /* ---- お問い合わせフォーム（#cform がある場合のみ） ---- */
  var pendingInquiry = null;
  var form = document.getElementById('cform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('cf-submit');
      var reply = form.querySelector('input[name="reply"]:checked');
      var payload = {
        action: 'inquiry',
        company: (document.getElementById('cf-company').value || '').trim(),
        name: (document.getElementById('cf-name').value || '').trim(),
        email: (document.getElementById('cf-email').value || '').trim(),
        topic: (document.getElementById('cf-tel').value ? 'TEL:' + document.getElementById('cf-tel').value.trim() + ' / ' : '') + '返信希望:' + (reply ? reply.value : '未選択'),
        message: (document.getElementById('cf-message').value || '').trim(),
        website: document.getElementById('cf-website').value // ハニーポット（人間は空のまま）
      };
      function done() { form.style.display = 'none'; document.getElementById('thanks').classList.add('on'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      function fail() { btn.disabled = false; btn.innerHTML = '送信する <span class="ar">→</span>'; alert('送信に失敗しました。お手数ですが、時間をおいて再度お試しください。'); }
      btn.disabled = true; btn.textContent = '送信中…';
      if (!API) { fail(); return; }
      var fingerprint = JSON.stringify(payload);
      if (!pendingInquiry || pendingInquiry.fingerprint !== fingerprint) pendingInquiry = {fingerprint: fingerprint, id: crypto.randomUUID()};
      payload.requestId = pendingInquiry.id;
      fetch(API, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }) // 会社専用APIで受信し、再送は同じ受付IDで重複を防ぐ
        .then(readResponse)
        .then(function (d) { if (d && d.ok) { done(); } else { console.warn('inquiry error:', d); fail(); } })
        .catch(function (err) { console.warn('inquiry error:', err); fail(); });
    });
  }
})();
