/* ============================================================
   Equal Web 連携 — お知らせ配信 / 会社概要反映 / お問い合わせ受信
   ------------------------------------------------------------
   equalweb-config.js の apiUrl にGASのURLを貼ると本番データに切替。
   未設定の間はサンプルデータで表示（デモ・開発用）。
   ページ内に対象要素（#ewNews / [data-ew] / #cform）が
   ある場合のみ、それぞれの機能が動く。
============================================================ */
(function () {
  'use strict';
  var API = ((window.EQUAL_WEB || {}).apiUrl || '').trim().replace(/\?.*$/, '');

  /* ---- サンプルデータ（API未接続時のみ使用） ---- */
  var MOCK = {
    company: {
      company_name: '株式会社マウント',
      representative_name: '仲 隆宏',
      postal_code: '190-0034',
      address: '東京都立川市西砂町2-51-10 2F',
      tel: '042-569-6960',
      fax: '042-569-6961',
      email: 'info@mount-cp.com',
      established_date: '', // 空=HTMLの「平成19年3月19日」を維持
      capital: '1億円',
      employees: '45名',
      business_description: '大規模修繕工事、補助金工事取扱い、建物調査診断、防水工事、電気工事、設備工事、塗装工事、外壁補修工事、シーリング工事、仮設工事、内装工事、その他工事全般',
      facebook_url: 'https://www.facebook.com/mount.tachikawa/',
      instagram_url: 'https://www.instagram.com/mount_tachikawa/'
    },
    settings: [
      { label: '北関東営業所', value: '〒373-0851 群馬県太田市飯田町612 レジデンス幸501号室\nTEL 0276-55-4961 ／ FAX 0276-55-4962' },
      { label: '建設業許可', value: '国土交通大臣 許可（特-8）第29911号\n建築工事業、大工工事業、左官工事業、とび・土工工事業、石工事業、屋根工事業、タイル・れんが・ブロック工事業、鋼構造物工事業、鉄筋工事業、板金工事業、ガラス工事業、塗装工事業、防水工事業、内装仕上工事業、熱絶縁工事業、建具工事業、解体工事業\n\n国土交通大臣 許可（般-8）第29911号\n電気工事業、管工事業' },
      { label: '産業廃棄物収集運搬業許可', value: '対象エリア：東京都、埼玉県、神奈川県、山梨県' },
      { label: '保有資格', value: '1級建築士、1級施工管理技士、2級施工管理技士、1級電気施工管理技士、2級管工事施工管理技士、マンション維持修繕技術者、1級ウレタン防水施工技能士、1級アスファルト防水施工技能士、1級塩化ビニル防水施工技能士、アスベスト調査者、その他業務等' },
      { label: '取引銀行', value: 'りそな銀行、多摩信用金庫、きらぼし銀行、東和銀行' },
      { label: '協力業者', value: '45社程度' },
      { label: '主要仕入先', value: '化研マテリアル株式会社／城北化研株式会社／シーカ・ジャパン株式会社／野口興産株式会社／株式会社K・Cアスカ／森商事株式会社／荻野化成株式会社／ニチハ株式会社／新明電材株式会社' },
      { label: '所属団体', value: '一般社団法人マンション計画修繕施工協会（MKS）／関東防水管理事業協同組合／ダイフレックス防水工事業協同組合／一般社団法人機能性外壁工業会／ハイブリットルーフ研究会／コニシべステム工業会／SDGsジャパン' }
    ],
    recruit: [
      { label: '職務内容', value: '工事管理業務・現場作業・営業・事務作業' },
      { label: '勤務地', value: '本社・北関東営業所・関東一円' },
      { label: '資格・経験', value: '現場代理人：1・2級施工管理優遇\n現場作業員：1級防水技能士優遇\n営業：特になし\n事務・経理：簿記取得者優遇' },
      { label: '応募資格', value: '現場代理人：20歳〜55歳位（未経験可、学歴・経験不問）※施工管理技士資格者優遇。55歳以上でもやる気のある方大歓迎。\n現場作業員：18歳〜55歳（未経験可、学歴・経験不問）※55歳以上でもやる気と体力のある方大歓迎。普通免許があれば尚可。週払い可。\n営業：普通免許があれば尚可。\n事務・経理：普通免許があれば尚可。' },
      { label: '給与形態', value: '現場代理人：月給 35万円〜 ※施工管理資格者は別途手当金あり\n現場作業員：日当 11,000円〜20,000円 ※経験者は応相談\n営業：月給 23万円〜 ※経験者は相談\n事務・経理：月給 20万円〜 ※パート・アルバイトは時給1,200円〜' },
      { label: '昇給', value: 'あり（年1回）' },
      { label: '募集人数', value: '複数名' },
      { label: '雇用形態', value: '正社員、アルバイト（シフト制可）' },
      { label: '就業時間', value: '現場代理人・現場作業員：8:30〜17:00\n営業・営業アシスタント・事務・経理：9:00〜18:00\n※パート・アルバイトは状況により応相談' },
      { label: '休日・休暇', value: '土日、祝日、年末年始、有給休暇、慶弔休暇、育児休暇制度あり、その他応相談' },
      { label: '諸手当', value: '通勤交通費（上限月2万円）' },
      { label: '待遇・福利厚生', value: '昇給年1回、賞与業績により（年2回夏・冬）、労災保険、雇用保険、健康保険（土建国保）、厚生年金、通勤手当、時間外手当、資格支援制度（講習及び受験費負担）、社員旅行、保養施設利用可' }
    ],
    news: [
      { id: 'S1', title: 'ホームページをリニューアルしました', body: 'この度、株式会社マウントのホームページをリニューアルいたしました。\n今後は管理画面から、お知らせや施工情報を随時発信してまいります。', category: 'お知らせ', link_url: '', image_url: '', is_pinned: true, published_at: '2026-07-17 09:00:00' },
      { id: 'S2', title: '夏季休業のお知らせ（8/13〜8/16）', body: '誠に勝手ながら、下記期間を夏季休業とさせていただきます。\n期間中のお問い合わせは、休業明けに順次ご対応いたします。', category: '営業案内', link_url: '', image_url: '', is_pinned: false, published_at: '2026-07-10 10:00:00' },
      { id: 'S3', title: '電気事業部 スタッフ募集を開始しました', body: '', category: '採用', link_url: 'recruit.html', image_url: '', is_pinned: false, published_at: '2026-07-01 09:00:00' }
    ],
    articles: [],
    generated_at: ''
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function fmtD(s) { return String(s || '').slice(0, 10).replace(/-/g, '.'); }

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

  /* ---- 説明文差し替え（[data-ew-text] がある場合のみ）----
     map = {slot: 文章}。文章が設定されているスロットだけ差し替え、
     未設定のスロットはHTMLに書かれた初期の文章のまま。
     改行はそのまま、空行で段落分け（DIV要素のみ）、【】は強調色になる。 */
  function applyTexts(map) {
    if (!map) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-ew-text]'), function (el) {
      var v = map[el.getAttribute('data-ew-text')];
      if (!v) return;
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

  /* ---- 写真差し替え（[data-photo] がある場合のみ）----
     map = {slot: 画像URL}。URLが設定されているスロットだけ差し替え、
     未設定のスロットはHTMLに書かれた初期写真のまま。 */
  function applyPhotos(map) {
    if (!map) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-photo]'), function (el) {
      var url = map[el.getAttribute('data-photo')];
      if (!url) return;
      var img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (img && img.src !== url) img.src = url;
    });
  }

  /* ---- 描画・取得 ---- */
  function render(d, isMock) {
    renderNews(d.news || []);
    fillCompany(d.company);
    renderSettings(d.settings || []);
    renderRecruit(d.recruit || []);
    applyPhotos(d.photos || null);
    applyTexts(d.texts || null);
    var st = document.getElementById('ewStamp');
    if (st) st.textContent = isMock ? '（サンプルデータ表示中 — Equal Web接続前）' : (d.generated_at ? '最終更新 ' + String(d.generated_at).slice(11, 16) : '');
    if (typeof window.reveal === 'function') window.reveal();
  }
  function load() {
    if (!API) { render(MOCK, true); return; }
    fetch(API + '?action=api').then(function (r) { return r.json(); }).then(function (d) { render(d, false); })
      .catch(function (e) { console.warn('Equal Web API 接続エラー:', e); render(MOCK, true); });
  }
  if (document.getElementById('ewNews') || document.querySelector('[data-ew]')) {
    load();
    if (API) setInterval(load, 60000); // 1分ごとに自動更新
  }

  /* ---- お問い合わせフォーム（#cform がある場合のみ） ---- */
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
      if (!API) { setTimeout(done, 600); return; } // API未接続（デモ）時は成功扱い
      fetch(API, { method: 'POST', body: JSON.stringify(payload) }) // Content-Type未指定=text/plainでCORSプリフライト回避
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d && d.ok) { done(); } else { console.warn('inquiry error:', d); fail(); } })
        .catch(function (err) { console.warn('inquiry error:', err); fail(); });
    });
  }
})();
