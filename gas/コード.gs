/**
 * Equal Web — ホームページ管理OS
 * フェーズ①: データベース構築スクリプト v1.0
 *
 * 使い方:
 *   1. 新しいGoogleスプレッドシートを作成（名前: 「Equal Web_DB」推奨）
 *   2. 拡張機能 → Apps Script にこのファイルを貼り付けて保存
 *   3. 関数 initialSetup を実行（初回のみ承認ダイアログ→許可）
 *   → company_master / news_master / article_master の3シートが自動生成される
 *
 * 再実行しても既存シートはスキップされ、データは壊れない。
 */

// ==================== 設定 ====================

var HEADER_BG = '#1a3c6e';   // ヘッダー背景（Equal Web ネイビー）
var HEADER_FG = '#ffffff';

var STATUS_COMPANY = ['active', 'archived'];
var STATUS_CONTENT = ['draft', 'published', 'archived'];
var STATUS_INQUIRY = ['未対応', '対応中', '対応済'];
var CATEGORY_NEWS = ['お知らせ', '営業案内', '採用', 'キャンペーン', 'その他'];
var CATEGORY_ARTICLE = ['ブログ', '施工事例', 'スタッフ紹介', 'コラム', 'その他'];

// シート定義: [カラム名, 説明（ヘッダーのメモに表示）, 幅px]
var SHEET_DEFS = {
  company_master: {
    idPrefix: 'CMP',
    columns: [
      ['company_id', '主キー。CMP-0001形式（自動採番・編集しない）', 100],
      ['company_name', '会社名（正式名称）※必須', 180],
      ['company_name_kana', '会社名かな', 160],
      ['representative_name', '代表者名', 120],
      ['postal_code', '郵便番号（例: 010-0001）', 100],
      ['address', '住所', 240],
      ['tel', '電話番号', 120],
      ['fax', 'FAX', 120],
      ['email', '代表メールアドレス', 180],
      ['business_hours', '営業時間（例: 9:00〜18:00）', 140],
      ['holidays', '定休日', 120],
      ['established_date', '設立日 yyyy-MM-dd', 110],
      ['capital', '資本金（表示用。例: 500万円）', 110],
      ['employees', '従業員数（表示用。例: 12名）', 100],
      ['business_description', '事業内容', 240],
      ['logo_url', 'ロゴ画像URL', 160],
      ['website_url', '現ホームページURL', 160],
      ['google_map_url', 'GoogleマップURL', 160],
      ['instagram_url', 'Instagram URL', 140],
      ['x_url', 'X(旧Twitter) URL', 140],
      ['facebook_url', 'Facebook URL', 140],
      ['line_url', 'LINE公式 URL', 140],
      ['youtube_url', 'YouTube URL', 140],
      ['status', 'active=有効 / archived=論理削除', 90],
      ['created_at', '登録日時（自動・編集しない）', 140],
      ['updated_at', '更新日時（自動・編集しない）', 140]
    ]
  },
  news_master: {
    idPrefix: 'NEWS',
    columns: [
      ['news_id', '主キー。NEWS-0001形式（自動採番・編集しない）', 100],
      ['company_id', '会社ID（company_masterのcompany_id）※必須', 100],
      ['title', 'タイトル ※必須', 260],
      ['body', '本文（短文。改行可）', 300],
      ['category', 'お知らせ/営業案内/採用/キャンペーン/その他', 110],
      ['link_url', '詳細リンク先URL', 160],
      ['image_url', '画像URL', 160],
      ['is_pinned', '先頭固定表示（チェック=ON）', 80],
      ['published_at', '公開日時。この日時以降にHPへ表示', 140],
      ['status', 'draft=下書き / published=公開 / archived=非表示', 90],
      ['created_at', '登録日時（自動・編集しない）', 140],
      ['updated_at', '更新日時（自動・編集しない）', 140]
    ]
  },
  article_master: {
    idPrefix: 'ART',
    columns: [
      ['article_id', '主キー。ART-0001形式（自動採番・編集しない）', 100],
      ['company_id', '会社ID（company_masterのcompany_id）※必須', 100],
      ['title', '記事タイトル ※必須', 260],
      ['slug', 'URL用スラッグ（英数字とハイフン）※必須・重複不可', 150],
      ['summary', '概要・抜粋（一覧カードに表示）', 240],
      ['body', '本文（Markdown形式）※必須', 340],
      ['category', 'ブログ/施工事例/スタッフ紹介/コラム/その他', 110],
      ['tags', 'カンマ区切り（例: 外壁,リフォーム）', 140],
      ['thumbnail_url', 'サムネイル画像URL', 160],
      ['author_name', '執筆者名', 100],
      ['is_featured', '注目記事（チェック=ON）', 80],
      ['published_at', '公開日時', 140],
      ['status', 'draft=下書き / published=公開 / archived=非表示', 90],
      ['created_at', '登録日時（自動・編集しない）', 140],
      ['updated_at', '更新日時（自動・編集しない）', 140]
    ]
  },
  inquiry_log: {
    idPrefix: 'INQ',
    columns: [
      ['inquiry_id', '主キー。INQ-0001形式（自動採番・編集しない）', 100],
      ['company_id', '会社ID（どの会社サイトからの問い合わせか）', 100],
      ['name', 'お名前', 120],
      ['company', 'お客様の会社名', 180],
      ['email', 'メールアドレス', 200],
      ['topic', 'ご相談内容（フォームの選択肢）', 240],
      ['message', 'メッセージ本文', 340],
      ['status', '未対応 / 対応中 / 対応済', 90],
      ['created_at', '受信日時（自動・編集しない）', 140],
      ['updated_at', '更新日時（自動・編集しない）', 140]
    ]
  },
  site_settings: {
    idPrefix: 'SET',
    columns: [
      ['setting_id', '主キー。SET-0001形式（自動採番・編集しない）', 100],
      ['company_id', '会社ID（company_masterのcompany_id）', 100],
      ['label', '項目名（例: 建設業許可）※必須', 160],
      ['value', '内容（改行可）。会社概要表などに表示', 380],
      ['display_order', '表示順（小さいほど上。10,20,30…）', 90],
      ['status', 'active=表示 / archived=論理削除', 90],
      ['created_at', '登録日時（自動・編集しない）', 140],
      ['updated_at', '更新日時（自動・編集しない）', 140]
    ]
  },
  recruit_settings: {
    idPrefix: 'REC',
    columns: [
      ['recruit_id', '主キー。REC-0001形式（自動採番・編集しない）', 100],
      ['company_id', '会社ID（company_masterのcompany_id）', 100],
      ['label', '項目名（例: 給与形態）※必須', 160],
      ['value', '内容（改行可）。募集要項表に表示', 380],
      ['display_order', '表示順（小さいほど上。10,20,30…）', 90],
      ['status', 'active=表示 / archived=論理削除', 90],
      ['created_at', '登録日時（自動・編集しない）', 140],
      ['updated_at', '更新日時（自動・編集しない）', 140]
    ]
  },
  photo_master: {
    idPrefix: 'PHT',
    columns: [
      ['photo_id', '主キー。PHT-0001形式（自動採番・編集しない）', 100],
      ['company_id', '会社ID（company_masterのcompany_id）', 100],
      ['slot', 'HP側の差し込み位置キー（英字。変更しない）', 140],
      ['label', 'どこの写真か（例: トップ：会社紹介の写真）', 220],
      ['image_url', '画像URL（空=HP初期写真を表示）', 300],
      ['display_order', '表示順（管理画面の並び）', 90],
      ['status', 'active=有効 / archived=論理削除', 90],
      ['created_at', '登録日時（自動・編集しない）', 140],
      ['updated_at', '更新日時（自動・編集しない）', 140]
    ]
  },
  text_master: {
    idPrefix: 'TXT',
    columns: [
      ['text_id', '主キー。TXT-0001形式（自動採番・編集しない）', 100],
      ['company_id', '会社ID（company_masterのcompany_id）', 100],
      ['slot', 'HP側の差し込み位置キー（英字。変更しない）', 140],
      ['label', 'どこの文章か（例: トップ：会社紹介の本文）', 220],
      ['value', '文章（空=HP初期の文章を表示。改行可・【】で囲むと強調色）', 380],
      ['display_order', '表示順（管理画面の並び）', 90],
      ['status', 'active=有効 / archived=論理削除', 90],
      ['created_at', '登録日時（自動・編集しない）', 140],
      ['updated_at', '更新日時（自動・編集しない）', 140]
    ]
  }
};

// ==================== 初期セットアップ ====================

function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var created = [];
  var skipped = [];

  Object.keys(SHEET_DEFS).forEach(function (name) {
    if (ss.getSheetByName(name)) {
      skipped.push(name);
    } else {
      buildSheet_(ss, name, SHEET_DEFS[name]);
      created.push(name);
    }
  });

  // 初期シート「シート1」が空なら削除
  var s1 = ss.getSheetByName('シート1') || ss.getSheetByName('Sheet1');
  if (s1 && s1.getLastRow() === 0 && ss.getSheets().length > 1) {
    ss.deleteSheet(s1);
  }

  if (created.length > 0) insertSampleData_(ss, created);
  installOnEditTrigger_();

  var msg = 'Equal Web DB セットアップ完了\n' +
    '作成: ' + (created.join(', ') || 'なし') + '\n' +
    'スキップ(既存): ' + (skipped.join(', ') || 'なし');
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* トリガー実行時はUI無し */ }
}

// シート1枚を構築
function buildSheet_(ss, name, def) {
  var sheet = ss.insertSheet(name);
  var cols = def.columns;
  var n = cols.length;

  // ヘッダー行
  var headers = cols.map(function (c) { return c[0]; });
  var range = sheet.getRange(1, 1, 1, n);
  range.setValues([headers])
    .setBackground(HEADER_BG)
    .setFontColor(HEADER_FG)
    .setFontWeight('bold')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);

  // 列ごとの説明メモ・列幅・書式
  cols.forEach(function (c, i) {
    var col = i + 1;
    sheet.getRange(1, col).setNote(c[1]);
    sheet.setColumnWidth(col, c[2]);

    var colName = c[0];
    var dataRange = sheet.getRange(2, col, sheet.getMaxRows() - 1, 1);

    if (/_id$/.test(colName) || colName === 'postal_code' || colName === 'tel' || colName === 'fax') {
      dataRange.setNumberFormat('@'); // 書式なしテキスト（数値化け防止）
    } else if (/_at$/.test(colName)) {
      dataRange.setNumberFormat('yyyy-mm-dd hh:mm:ss');
    } else if (/_date$/.test(colName)) {
      dataRange.setNumberFormat('yyyy-mm-dd');
    } else if (colName === 'is_pinned' || colName === 'is_featured') {
      dataRange.insertCheckboxes();
    }

    // プルダウン（入力規則）
    var list = null;
    if (colName === 'status') {
      list = (name === 'company_master' || name === 'site_settings' || name === 'recruit_settings' || name === 'photo_master' || name === 'text_master') ? STATUS_COMPANY
           : (name === 'inquiry_log') ? STATUS_INQUIRY
           : STATUS_CONTENT;
    } else if (colName === 'category') {
      list = (name === 'news_master') ? CATEGORY_NEWS : CATEGORY_ARTICLE;
    }
    if (list) {
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(list, true)
        .setAllowInvalid(false)
        .build();
      dataRange.setDataValidation(rule);
    }
  });

  // 余分な列を削除
  var maxCols = sheet.getMaxColumns();
  if (maxCols > n) sheet.deleteColumns(n + 1, maxCols - n);
}

// ==================== サンプルデータ ====================

function insertSampleData_(ss, createdNames) {
  var now = nowString_();

  if (createdNames.indexOf('company_master') !== -1) {
    appendRowByHeader_(ss.getSheetByName('company_master'), {
      company_id: 'CMP-0001',
      company_name: 'サンプル株式会社',
      company_name_kana: 'さんぷるかぶしきがいしゃ',
      representative_name: '山田 太郎',
      postal_code: '010-0001',
      address: '秋田県秋田市中通1-1-1',
      tel: '018-000-0000',
      email: 'info@example.com',
      business_hours: '9:00〜18:00',
      holidays: '土日祝',
      business_description: 'サンプル事業（この行はテスト用。削除してOK）',
      status: 'active',
      created_at: now,
      updated_at: now
    });
  }

  if (createdNames.indexOf('news_master') !== -1) {
    appendRowByHeader_(ss.getSheetByName('news_master'), {
      news_id: 'NEWS-0001',
      company_id: 'CMP-0001',
      title: 'ホームページをリニューアルしました（サンプル）',
      body: 'Equal Webの動作確認用サンプルです。削除してOK。',
      category: 'お知らせ',
      is_pinned: false,
      published_at: now,
      status: 'draft',
      created_at: now,
      updated_at: now
    });
  }

  if (createdNames.indexOf('article_master') !== -1) {
    appendRowByHeader_(ss.getSheetByName('article_master'), {
      article_id: 'ART-0001',
      company_id: 'CMP-0001',
      title: 'はじめての記事（サンプル）',
      slug: 'sample-first-article',
      summary: 'Equal Webの動作確認用サンプル記事です。',
      body: '# はじめての記事\n\nこれはサンプルです。本文はMarkdownで書きます。削除してOK。',
      category: 'ブログ',
      tags: 'サンプル,テスト',
      author_name: '管理者',
      is_featured: false,
      published_at: now,
      status: 'draft',
      created_at: now,
      updated_at: now
    });
  }
}

// ==================== 自動採番 + updated_at 自動更新 ====================

/**
 * インストール型onEdit。
 * ・ID列が空の行にデータが入ったら自動採番（CMP-/NEWS-/ART- + 4桁）
 * ・行を編集したら updated_at を自動更新、created_at が空なら記入
 */
function onEditInstalled(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  var name = sheet.getName();
  var def = SHEET_DEFS[name];
  if (!def) return;

  var row = e.range.getRow();
  if (row === 1) return; // ヘッダー行は対象外

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idCol = 1; // 各テーブルともA列が主キー
  var createdCol = headers.indexOf('created_at') + 1;
  var updatedCol = headers.indexOf('updated_at') + 1;

  var lastRow = e.range.getLastRow();
  for (var r = row; r <= lastRow; r++) {
    // 行に何かデータがあるか
    var rowValues = sheet.getRange(r, 1, 1, headers.length).getValues()[0];
    var hasData = rowValues.some(function (v) { return v !== '' && v !== false; });
    if (!hasData) continue;

    // 自動採番
    var idCell = sheet.getRange(r, idCol);
    if (idCell.getValue() === '') {
      idCell.setNumberFormat('@').setValue(nextId_(sheet, def.idPrefix));
    }

    // created_at / updated_at
    var now = nowString_();
    if (createdCol > 0 && sheet.getRange(r, createdCol).getValue() === '') {
      sheet.getRange(r, createdCol).setValue(now);
    }
    if (updatedCol > 0 && (e.range.getColumn() !== updatedCol || e.range.getNumColumns() > 1)) {
      sheet.getRange(r, updatedCol).setValue(now);
    }
  }
}

// シート内の既存IDから次の連番を発行（例: CMP-0003）
function nextId_(sheet, prefix) {
  var lastRow = sheet.getLastRow();
  var max = 0;
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var re = new RegExp('^' + prefix + '-(\\d+)$');
    ids.forEach(function (r) {
      var m = String(r[0]).match(re);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
  }
  return prefix + '-' + String(max + 1).padStart(4, '0');
}

function installOnEditTrigger_() {
  var exists = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'onEditInstalled';
  });
  if (!exists) {
    ScriptApp.newTrigger('onEditInstalled')
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onEdit()
      .create();
  }
}

// ==================== ユーティリティ ====================

function nowString_() {
  return Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
}

// ヘッダー名→値 のオブジェクトで1行追加
function appendRowByHeader_(sheet, obj) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) {
    return (h in obj) ? obj[h] : '';
  });
  sheet.appendRow(row);
  // appendRow後、ID列をテキスト書式で上書き（数値化け防止の保険）
  var r = sheet.getLastRow();
  sheet.getRange(r, 1).setNumberFormat('@');
}

// ============================================================
// フェーズ② WEB管理画面 (v2.0)
// index.html を配信し、google.script.run 経由でCRUDを提供する。
// お客様はスプレッドシートを開かず、必ずこの管理画面から編集する。
// ============================================================

var APP_VERSION = 'v3.6';

var KIND_DEF = {
  news:           { sheet: 'news_master',      idKey: 'news_id',    prefix: 'NEWS' },
  article:        { sheet: 'article_master',   idKey: 'article_id', prefix: 'ART' },
  inquiry:        { sheet: 'inquiry_log',      idKey: 'inquiry_id', prefix: 'INQ' },
  sitesetting:    { sheet: 'site_settings',    idKey: 'setting_id', prefix: 'SET' },
  recruitsetting: { sheet: 'recruit_settings', idKey: 'recruit_id', prefix: 'REC' },
  photo:          { sheet: 'photo_master',     idKey: 'photo_id',   prefix: 'PHT' },
  text:           { sheet: 'text_master',      idKey: 'text_id',    prefix: 'TXT' }
};

function doGet(e) {
  var p = (e && e.parameter) || {};

  // 公開API（ホームページが読む。認証不要・公開データのみ）
  if (p.action === 'api') return publicApi_(p);

  // 管理画面（ADMIN_KEY設定後は ?key=XXXX が必須になる）
  if (!isAdminAllowed_(p)) {
    return HtmlService.createHtmlOutput(
      '<div style="font-family:sans-serif;padding:60px 20px;text-align:center;color:#6b7280;">' +
      '<div style="font-size:20px;font-weight:700;color:#1a3c6e;margin-bottom:12px;">Equal Web</div>' +
      'このURLでは管理画面を開けません。<br>管理者から受け取った正しいURL（keyつき）を開いてください。</div>'
    ).setTitle('Equal Web');
  }
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Equal Web 管理画面')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ---------- API（クライアントから google.script.run で呼ばれる） ----------

// 初回ロード用: 全データをまとめて返す
function apiGetAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    version: APP_VERSION,
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    company: apiGetCompany(),
    news: apiList('news'),
    article: apiList('article'),
    inquiry: safeList_('inquiry'),
    sitesettings: safeList_('sitesetting'),
    recruitsettings: safeList_('recruitsetting'),
    photos: safeList_('photo'),
    texts: safeList_('text')
  };
}

// シート未作成でも管理画面全体を壊さない（initialSetup未再実行への保険）
function safeList_(kind) {
  try { return apiList(kind); } catch (e) { return []; }
}

function apiGetCompany() {
  var data = readRows_('company_master');
  var active = data.rows.filter(function (r) { return r.status !== 'archived'; });
  return active[0] || null;
}

function apiSaveCompany(input) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = readRows_('company_master');
    var sheet = data.sheet, headers = data.headers;
    var now = nowString_();

    if (!input || !String(input.company_name || '').trim()) {
      throw new Error('会社名は必須です');
    }

    var target = null;
    if (input.company_id) {
      target = data.rows.filter(function (r) { return r.company_id === input.company_id; })[0];
    }
    if (!target) {
      target = data.rows.filter(function (r) { return r.status !== 'archived'; })[0];
    }

    if (target) {
      var merged = mergeRow_(headers, target, input);
      merged.company_id = target.company_id; // 主キーは変更不可
      merged.created_at = target.created_at;
      merged.updated_at = now;
      if (!merged.status) merged.status = 'active';
      writeRow_(sheet, headers, target._row, merged);
    } else {
      // レコードが無ければ新規作成
      var fresh = mergeRow_(headers, {}, input);
      fresh.company_id = nextId_(sheet, 'CMP');
      fresh.status = 'active';
      fresh.created_at = now;
      fresh.updated_at = now;
      appendRowByHeader_(sheet, fresh);
    }
    return apiGetCompany();
  } finally {
    lock.releaseLock();
  }
}

function apiList(kind) {
  var def = kindDef_(kind);
  return readRows_(def.sheet).rows;
}

// 会社概要 追加項目（site_settings）の一括保存
function apiSaveSettings(list) { return saveKVList_('sitesetting', list); }

// 募集要項（recruit_settings）の一括保存
function apiSaveRecruit(list) { return saveKVList_('recruitsetting', list); }

// ==================== 写真管理（photo_master + Google Drive） ====================

// 写真スロットの一括登録（seed用）。既存slotはスキップ。list = [{slot, label}]
function apiSeedPhotoSlots(list) { return seedSlots_('photo', list, { image_url: '' }); }

// 文章スロットの一括登録（seed用）。既存slotはスキップ。list = [{slot, label, value}]
function apiSeedTextSlots(list) { return seedSlots_('text', list); }

// スロット型テーブルの初期登録（共通処理）
function seedSlots_(kind, list, extra) {
  var def = kindDef_(kind);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = readRows_(def.sheet);
    var now = nowString_();
    list.forEach(function (item, i) {
      var exists = data.rows.some(function (r) { return r.slot === item.slot && r.status !== 'archived'; });
      if (exists) return;
      var row = {
        company_id: defaultCompanyId_(),
        slot: item.slot,
        label: item.label,
        display_order: (i + 1) * 10,
        status: 'active',
        created_at: now,
        updated_at: now
      };
      row[def.idKey] = nextId_(data.sheet, def.prefix);
      if (extra) Object.keys(extra).forEach(function (k) { row[k] = extra[k]; });
      if (item.value != null) row.value = String(item.value);
      appendRowByHeader_(data.sheet, row);
      data = readRows_(def.sheet);
    });
    return apiList(kind);
  } finally {
    lock.releaseLock();
  }
}

// 説明文の一括保存。list = [{text_id, value}]（slot/labelは変更しない）
function apiSaveTexts(list) {
  if (!Array.isArray(list)) throw new Error('保存データの形式が不正です');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = readRows_('text_master');
    var now = nowString_();
    list.forEach(function (item) {
      var target = data.rows.filter(function (r) { return r.text_id === item.text_id; })[0];
      if (!target) return;
      var merged = mergeRow_(data.headers, target, { value: item.value == null ? '' : String(item.value) });
      merged.updated_at = now;
      writeRow_(data.sheet, data.headers, target._row, merged);
    });
    return apiList('text');
  } finally {
    lock.releaseLock();
  }
}

// 画像アップロード: base64のdataURLを受け取り、Driveに保存して公開URLを写真行に記録する
function apiUploadPhoto(photoId, filename, dataUrl) {
  var m = String(dataUrl || '').match(/^data:(image\/[a-z0-9+.-]+);base64,(.+)$/i);
  if (!m) throw new Error('画像データの形式が不正です');
  var bytes = Utilities.base64Decode(m[2]);
  if (bytes.length > 8 * 1024 * 1024) throw new Error('画像が大きすぎます（8MBまで）');
  var blob = Utilities.newBlob(bytes, m[1], filename || ('photo-' + photoId));
  var file = photoFolder_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var url = 'https://lh3.googleusercontent.com/d/' + file.getId();
  return apiSetPhotoUrl(photoId, url);
}

// 画像URLの直接設定（''で初期写真に戻す）。戻り値は最新一覧
function apiSetPhotoUrl(photoId, url) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = readRows_('photo_master');
    var target = data.rows.filter(function (r) { return r.photo_id === photoId; })[0];
    if (!target) throw new Error('対象の写真枠が見つかりません: ' + photoId);
    var merged = mergeRow_(data.headers, target, { image_url: String(url || '').trim() });
    merged.updated_at = nowString_();
    writeRow_(data.sheet, data.headers, target._row, merged);
    return apiList('photo');
  } finally {
    lock.releaseLock();
  }
}

// アップロード先のDriveフォルダ（無ければ作成）
function photoFolder_() {
  var name = 'Equal Web_写真_' + SpreadsheetApp.getActiveSpreadsheet().getName();
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

// ラベル+値リストの一括保存（共通処理）。
// list = [{<idKey>?, label, value}, ...]（配列の順番がそのまま表示順になる）
// listに含まれない既存行は archived にする（ゴミ箱方式）。戻り値は最新一覧。
function saveKVList_(kind, list) {
  var def = kindDef_(kind);
  if (!Array.isArray(list)) throw new Error('保存データの形式が不正です');
  list.forEach(function (item) {
    if (!String(item.label || '').trim()) throw new Error('項目名が空の行があります');
  });
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = readRows_(def.sheet);
    var sheet = data.sheet, headers = data.headers;
    var now = nowString_();
    var keepIds = {};

    list.forEach(function (item, i) {
      var order = (i + 1) * 10;
      var target = item[def.idKey]
        ? data.rows.filter(function (r) { return r[def.idKey] === item[def.idKey]; })[0]
        : null;
      if (target) {
        keepIds[target[def.idKey]] = true;
        var merged = mergeRow_(headers, target, {
          label: String(item.label).trim(),
          value: item.value == null ? '' : String(item.value),
          display_order: order,
          status: 'active'
        });
        merged[def.idKey] = target[def.idKey];
        merged.created_at = target.created_at;
        merged.updated_at = now;
        writeRow_(sheet, headers, target._row, merged);
      } else {
        var id = nextId_(sheet, def.prefix);
        keepIds[id] = true;
        var fresh = {
          company_id: defaultCompanyId_(),
          label: String(item.label).trim(),
          value: item.value == null ? '' : String(item.value),
          display_order: order,
          status: 'active',
          created_at: now,
          updated_at: now
        };
        fresh[def.idKey] = id;
        appendRowByHeader_(sheet, fresh);
        // appendでdata.rowsが古くなるため、次のnextId_のために再読込
        data = readRows_(def.sheet);
        sheet = data.sheet; headers = data.headers;
      }
    });

    // リストに無い既存activeは削除（archived）
    data = readRows_(def.sheet);
    data.rows.forEach(function (r) {
      if (r.status !== 'archived' && !keepIds[r[def.idKey]]) {
        var merged = mergeRow_(headers, r, { status: 'archived' });
        merged.updated_at = now;
        writeRow_(data.sheet, data.headers, r._row, merged);
      }
    });

    return apiList(kind);
  } finally {
    lock.releaseLock();
  }
}

// 新規作成（idなし）と更新（idあり）を兼ねる。戻り値は最新の一覧
function apiSaveItem(kind, input) {
  var def = kindDef_(kind);
  validateItem_(kind, input);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = readRows_(def.sheet);
    var sheet = data.sheet, headers = data.headers;
    var now = nowString_();

    // スラッグ重複チェック（記事のみ）
    if (kind === 'article' && input.slug) {
      var dup = data.rows.filter(function (r) {
        return r.slug === input.slug && r[def.idKey] !== input[def.idKey];
      });
      if (dup.length) throw new Error('スラッグ「' + input.slug + '」は既に使われています');
    }

    var id = input[def.idKey];
    if (id) {
      var target = data.rows.filter(function (r) { return r[def.idKey] === id; })[0];
      if (!target) throw new Error('対象が見つかりません: ' + id);
      var merged = mergeRow_(headers, target, input);
      merged[def.idKey] = id;             // 主キーは変更不可
      merged.created_at = target.created_at;
      merged.updated_at = now;
      writeRow_(sheet, headers, target._row, merged);
    } else {
      var fresh = mergeRow_(headers, {}, input);
      fresh[def.idKey] = nextId_(sheet, def.prefix);
      fresh.company_id = fresh.company_id || defaultCompanyId_();
      fresh.status = fresh.status || 'draft';
      if (!fresh.published_at) fresh.published_at = now;
      fresh.created_at = now;
      fresh.updated_at = now;
      appendRowByHeader_(sheet, fresh);
    }
    return apiList(kind);
  } finally {
    lock.releaseLock();
  }
}

// 公開/非公開/削除(論理)/復元 はすべて status の変更で行う
function apiSetStatus(kind, id, status) {
  var def = kindDef_(kind);
  var allowed = (kind === 'inquiry') ? STATUS_INQUIRY : STATUS_CONTENT;
  if (allowed.indexOf(status) === -1) throw new Error('不正なstatus: ' + status);
  var data = readRows_(def.sheet);
  var target = data.rows.filter(function (r) { return r[def.idKey] === id; })[0];
  if (!target) throw new Error('対象が見つかりません: ' + id);
  var headers = data.headers;
  data.sheet.getRange(target._row, headers.indexOf('status') + 1).setValue(status);
  data.sheet.getRange(target._row, headers.indexOf('updated_at') + 1).setValue(nowString_());
  return apiList(kind);
}

// ---------- 内部ヘルパー（WEBアプリ用） ----------

function kindDef_(kind) {
  var def = KIND_DEF[kind];
  if (!def) throw new Error('不正なkind: ' + kind);
  return def;
}

function defaultCompanyId_() {
  var c = apiGetCompany();
  return c ? c.company_id : 'CMP-0001';
}

function validateItem_(kind, input) {
  if (!input || !String(input.title || '').trim()) throw new Error('タイトルは必須です');
  if (kind === 'article') {
    if (!String(input.slug || '').trim()) throw new Error('スラッグは必須です');
    if (!/^[a-z0-9-]+$/.test(input.slug)) throw new Error('スラッグは英小文字・数字・ハイフンのみ使えます');
    if (!String(input.body || '').trim()) throw new Error('本文は必須です');
  }
}

// シート全行をオブジェクト配列で返す（_row = 実際の行番号）
function readRows_(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('シートがありません: ' + sheetName + '（initialSetup を実行してください）');
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rows = [];
  if (lastRow >= 2) {
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    values.forEach(function (v, i) {
      var hasData = v.some(function (c) { return c !== '' && c !== false; });
      if (!hasData) return;
      var obj = { _row: i + 2 };
      headers.forEach(function (h, j) { obj[h] = serializeCell_(h, v[j]); });
      rows.push(obj);
    });
  }
  return { sheet: sheet, headers: headers, rows: rows };
}

// Date→文字列などクライアントに渡せる形へ
function serializeCell_(header, value) {
  if (value instanceof Date) {
    var fmt = /_date$/.test(header) ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss';
    return Utilities.formatDate(value, 'Asia/Tokyo', fmt);
  }
  return value;
}

// headers順で base（既存値）に input（送信値）を上書きしたオブジェクトを作る
function mergeRow_(headers, base, input) {
  var obj = {};
  headers.forEach(function (h) {
    if (Object.prototype.hasOwnProperty.call(input, h)) obj[h] = input[h];
    else if (Object.prototype.hasOwnProperty.call(base, h)) obj[h] = base[h];
    else obj[h] = '';
    if (h.indexOf('is_') === 0) obj[h] = (obj[h] === true || obj[h] === 'TRUE'); // チェックボックス列はboolean固定
    if (h === '_row') delete obj[h];
  });
  return obj;
}

function writeRow_(sheet, headers, rowIndex, obj) {
  var row = headers.map(function (h) {
    return (obj[h] === undefined || obj[h] === null) ? '' : obj[h];
  });
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
  sheet.getRange(rowIndex, 1).setNumberFormat('@'); // ID列の数値化け防止
}

// ============================================================
// フェーズ③ ホームページ連携 (v3.0)
// ?action=api で「公開中」かつ公開日時を過ぎたデータだけをJSONで返す。
// ホームページ(demo-site等)はこのAPIを fetch して表示する。
// ============================================================

// ---------- 公開API ----------

function publicApi_(p) {
  var now = nowString_();

  function published(kind) {
    return apiList(kind).filter(function (r) {
      return r.status === 'published' && String(r.published_at) <= now;
    });
  }

  var payload;
  if (p.slug) {
    // 記事1件（スラッグ指定）
    var one = published('article').filter(function (r) { return r.slug === p.slug; })[0];
    payload = { article: one ? pickArticle_(one) : null };
  } else {
    var news = published('news').sort(function (a, b) {
      var pin = (b.is_pinned === true ? 1 : 0) - (a.is_pinned === true ? 1 : 0);
      if (pin !== 0) return pin;
      return String(b.published_at).localeCompare(String(a.published_at));
    }).map(pickNews_);

    var articles = published('article').sort(function (a, b) {
      return String(b.published_at).localeCompare(String(a.published_at));
    }).map(pickArticle_);

    payload = {
      company: pickCompany_(apiGetCompany()),
      news: news,
      articles: articles,
      settings: publicKV_('sitesetting'),
      recruit: publicKV_('recruitsetting'),
      photos: publicPhotos_(),
      texts: publicTexts_(),
      generated_at: now
    };
  }
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// 公開してよい項目だけに絞る（内部管理用の列は出さない）
// 写真の公開データ: {slot: image_url} のマップ（URL設定済みのactiveのみ）
function publicPhotos_() {
  try {
    var out = {};
    apiList('photo').forEach(function (r) {
      if (r.status === 'active' && r.image_url && r.slot) out[r.slot] = r.image_url;
    });
    return out;
  } catch (e) { return {}; } // シート未作成でもAPIを壊さない
}

// 説明文の公開データ: {slot: 文章} のマップ（文章が入っているactiveのみ）
function publicTexts_() {
  try {
    var out = {};
    apiList('text').forEach(function (r) {
      if (r.status === 'active' && r.slot && String(r.value || '').trim() !== '') out[r.slot] = String(r.value);
    });
    return out;
  } catch (e) { return {}; } // シート未作成でもAPIを壊さない
}

// ラベル+値リストの公開データ（active のみ、表示順ソート）
function publicKV_(kind) {
  try {
    return apiList(kind)
      .filter(function (r) { return r.status === 'active'; })
      .sort(function (a, b) { return (Number(a.display_order) || 0) - (Number(b.display_order) || 0); })
      .map(function (r) { return { label: r.label, value: r.value == null ? '' : String(r.value) }; });
  } catch (e) { return []; } // シート未作成でもAPIを壊さない
}

function pickCompany_(c) {
  if (!c) return null;
  var keys = ['company_name', 'company_name_kana', 'representative_name', 'postal_code',
    'address', 'tel', 'fax', 'email', 'business_hours', 'holidays', 'established_date',
    'capital', 'employees', 'business_description', 'logo_url', 'website_url',
    'google_map_url', 'instagram_url', 'x_url', 'facebook_url', 'line_url', 'youtube_url'];
  var out = {};
  keys.forEach(function (k) { out[k] = c[k] == null ? '' : c[k]; });
  return out;
}

function pickNews_(r) {
  return {
    id: r.news_id, title: r.title, body: r.body, category: r.category,
    link_url: r.link_url, image_url: r.image_url,
    is_pinned: r.is_pinned === true, published_at: r.published_at
  };
}

function pickArticle_(r) {
  return {
    id: r.article_id, title: r.title, slug: r.slug, summary: r.summary, body: r.body,
    category: r.category,
    tags: String(r.tags || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean),
    thumbnail_url: r.thumbnail_url, author_name: r.author_name,
    is_featured: r.is_featured === true, published_at: r.published_at
  };
}

// ---------- お問い合わせ受信 (v3.2) ----------

/**
 * ホームページのフォームから POST で受信する。
 * fetch(API, {method:'POST', body: JSON.stringify({action:'inquiry', ...})})
 * ※Content-Typeを付けない(text/plain)ことでCORSプリフライトを回避する
 */
function doPost(e) {
  var out;
  try {
    var body = {};
    try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (ignore) {}
    if (body.action === 'inquiry') out = receiveInquiry_(body);
    else out = { ok: false, error: '不正なアクションです' };
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function receiveInquiry_(b) {
  if (String(b.website || '')) return { ok: true }; // ハニーポット: botには成功を装って捨てる
  var name = String(b.name || '').trim().slice(0, 100);
  var company = String(b.company || '').trim().slice(0, 200);
  var email = String(b.email || '').trim().slice(0, 200);
  var topic = String(b.topic || '').trim().slice(0, 200);
  var message = String(b.message || '').trim().slice(0, 2000);
  if (!name || !email) throw new Error('お名前とメールアドレスは必須です');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('メールアドレスの形式が正しくありません');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('inquiry_log');
    if (!sheet) throw new Error('inquiry_log シートがありません（initialSetup を再実行してください）');
    var now = nowString_();
    appendRowByHeader_(sheet, {
      inquiry_id: nextId_(sheet, 'INQ'),
      company_id: defaultCompanyId_(),
      name: name, company: company, email: email, topic: topic, message: message,
      status: '未対応', created_at: now, updated_at: now
    });
  } finally {
    lock.releaseLock();
  }

  // メール通知（失敗しても受信自体は成立させる）
  try {
    var to = PropertiesService.getScriptProperties().getProperty('INQUIRY_NOTIFY_EMAIL')
          || Session.getEffectiveUser().getEmail();
    if (to) {
      MailApp.sendEmail(to, '【Equal Web】お問い合わせ: ' + name + ' 様',
        'ホームページからお問い合わせが届きました。\n\n' +
        'お名前: ' + name + '\n会社名: ' + company + '\nメール: ' + email + '\n' +
        'ご相談内容: ' + topic + '\n\n--- メッセージ ---\n' + message + '\n\n' +
        'Equal Web管理画面の「お問い合わせ」で確認・状態管理できます。');
    }
  } catch (mailErr) {
    Logger.log('通知メール送信失敗: ' + mailErr);
  }
  return { ok: true };
}

// ---------- 管理画面の保護（公開デプロイ用） ----------

function isAdminAllowed_(p) {
  var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key) return true; // キー未設定なら従来どおり誰でも（互換モード）
  return p.key === key;
}

/**
 * 公開モードを有効にする（HP連携する案件で1回だけ実行）。
 * 管理画面キーを発行し、以後 管理画面は ?key=XXXX 付きURLでのみ開ける。
 * 実行後、ログ（実行ログ）に表示されるURLの作り方に従うこと。
 */
function enablePublicMode() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('ADMIN_KEY');
  if (!key) {
    key = 'EW-' + Utilities.getUuid().replace(/-/g, '').slice(0, 24);
    props.setProperty('ADMIN_KEY', key);
  }
  var msg =
    '公開モードを有効にしました。\n\n' +
    '【管理画面キー】\n' + key + '\n\n' +
    '【このあとやること】\n' +
    '1. 「デプロイ」→「新しいデプロイ」→ ウェブアプリ\n' +
    '   実行: 自分 ／ アクセス: 全員（匿名）\n' +
    '2. 発行されたURL（…/exec）に対して:\n' +
    '   ・お客様に渡す管理画面URL = URL + ?key=' + key + '\n' +
    '   ・ホームページ用API URL   = URL（config.jsに貼る）\n\n' +
    '※キー無しでexecを開いても管理画面は表示されません。';
  Logger.log(msg);
  return msg;
}

/** 管理画面キーを確認したいときに実行 */
function showAdminKey() {
  var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  Logger.log(key ? '管理画面キー: ' + key + '\n管理画面URL = デプロイURL + ?key=' + key
                 : 'キー未発行です（enablePublicMode を実行すると発行されます）');
}

// ============================================================
// 会社設立マスター 連携 (v3.1)
// 同じスプレッドシート内の「00_設立マスター」（縦型フォーム）から
// 会社情報を company_master に取り込む。
// ラベル名で探すので、行がずれても動く。設立マスター側は一切書き換えない。
// ============================================================

var SETSURITSU_SHEET = '00_設立マスター';

/**
 * 00_設立マスター → company_master 取込。
 * 設立マスターに無い項目（電話・メール・SNS等）は触らないので、
 * 管理画面で入力した値はそのまま残る。何度実行しても安全。
 */
function importFromSetsuritsuMaster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var src = ss.getSheetByName(SETSURITSU_SHEET);
  if (!src) throw new Error('「' + SETSURITSU_SHEET + '」シートが見つかりません（このGASは会社設立マスターのスプレッドシートに貼ってください）');
  var values = src.getRange(1, 1, src.getLastRow(), Math.max(2, src.getLastColumn())).getValues();

  function findValue(label) {
    for (var i = 0; i < values.length; i++) {
      if (String(values[i][0]).trim() === label) return String(values[i][1]).trim();
    }
    return '';
  }
  // 「発起人/代表取締役」行のB列 = 代表者名
  function findRepresentative() {
    for (var i = 0; i < values.length; i++) {
      if (String(values[i][0]).indexOf('代表取締役') !== -1 && String(values[i][1]).trim()) {
        return String(values[i][1]).replace(/[\s　]+/g, ' ').trim();
      }
    }
    return '';
  }

  var input = {
    company_name: findValue('商号'),
    company_name_kana: findValue('商号カナ'),
    representative_name: findRepresentative(),
    address: findValue('本店（登記）'),
    capital: findValue('資本金'),
    established_date: toIsoDate_(findValue('会社成立予定日'))
  };
  // 取れなかった項目は上書きしない（既存値を保護）
  Object.keys(input).forEach(function (k) { if (!input[k]) delete input[k]; });
  if (!input.company_name) throw new Error('商号が取得できませんでした。00_設立マスターのA列に「商号」行があるか確認してください');

  var company = apiSaveCompany(input);
  var msg = '会社設立マスターから取り込みました。\n\n' +
    Object.keys(input).map(function (k) { return '・' + k + ' = ' + input[k]; }).join('\n') +
    '\n\n※電話・メール・営業時間・SNS等はEqual Web管理画面で入力してください。';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* エディタ実行時はUI無しでもOK */ }
  return company;
}

// 和暦（令和/平成）・西暦どちらの表記でも yyyy-MM-dd に変換。変換できなければ空
function toIsoDate_(s) {
  s = String(s || '').trim();
  var m = s.match(/令和(\d+)年(\d+)月(\d+)日/);
  if (m) return isoDate_(2018 + parseInt(m[1], 10), m[2], m[3]);
  m = s.match(/平成(\d+)年(\d+)月(\d+)日/);
  if (m) return isoDate_(1988 + parseInt(m[1], 10), m[2], m[3]);
  m = s.match(/(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/);
  if (m) return isoDate_(m[1], m[2], m[3]);
  return '';
}
function isoDate_(y, m, d) {
  return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}
