/**
 * 株式会社マウント 専用: 初期データ投入スクリプト
 *
 * 使い方:
 *   initialSetup を実行した後に、この seedMount を1回実行する。
 *   （再実行しても重複はしない。会社情報は上書き保存、追加項目は最新の内容に置き換わる）
 */
function seedMount() {
  // ---- 会社情報（company_master）----
  apiSaveCompany({
    company_name: '株式会社マウント',
    company_name_kana: 'かぶしきがいしゃまうんと',
    representative_name: '仲 隆宏',
    postal_code: '190-0034',
    address: '東京都立川市西砂町2-51-10 2F',
    tel: '042-569-6960',
    fax: '042-569-6961',
    email: 'info@mount-cp.com',
    // 設立日を入れるとHPの表記が「2007/03/19」形式になる。
    // 空のままなら、HPは現行の「平成19年3月19日」表記を維持する。
    established_date: '',
    capital: '1億円',
    employees: '45名',
    business_description: '大規模修繕工事、補助金工事取扱い、建物調査診断、防水工事、電気工事、設備工事、塗装工事、外壁補修工事、シーリング工事、仮設工事、内装工事、その他工事全般',
    website_url: 'https://mount-inc.com/',
    instagram_url: 'https://www.instagram.com/mount_tachikawa/',
    facebook_url: 'https://www.facebook.com/mount.tachikawa/'
  });

  // ---- 会社概要 追加項目（site_settings）----
  apiSaveSettings([
    { label: '北関東営業所', value: '〒373-0851 群馬県太田市飯田町612 レジデンス幸501号室\nTEL 0276-55-4961 ／ FAX 0276-55-4962' },
    { label: '建設業許可', value: '国土交通大臣 許可（特-8）第29911号\n建築工事業、大工工事業、左官工事業、とび・土工工事業、石工事業、屋根工事業、タイル・れんが・ブロック工事業、鋼構造物工事業、鉄筋工事業、板金工事業、ガラス工事業、塗装工事業、防水工事業、内装仕上工事業、熱絶縁工事業、建具工事業、解体工事業\n\n国土交通大臣 許可（般-8）第29911号\n電気工事業、管工事業' },
    { label: '産業廃棄物収集運搬業許可', value: '対象エリア：東京都、埼玉県、神奈川県、山梨県' },
    { label: '保有資格', value: '1級建築士、1級施工管理技士、2級施工管理技士、1級電気施工管理技士、2級管工事施工管理技士、マンション維持修繕技術者、1級ウレタン防水施工技能士、1級アスファルト防水施工技能士、1級塩化ビニル防水施工技能士、アスベスト調査者、その他業務等' },
    { label: '取引銀行', value: 'りそな銀行、多摩信用金庫、きらぼし銀行、東和銀行' },
    { label: '協力業者', value: '45社程度' },
    { label: '主要仕入先', value: '化研マテリアル株式会社／城北化研株式会社／シーカ・ジャパン株式会社／野口興産株式会社／株式会社K・Cアスカ／森商事株式会社／荻野化成株式会社／ニチハ株式会社／新明電材株式会社' },
    { label: '所属団体', value: '一般社団法人マンション計画修繕施工協会（MKS）／関東防水管理事業協同組合／ダイフレックス防水工事業協同組合／一般社団法人機能性外壁工業会／ハイブリットルーフ研究会／コニシべステム工業会／SDGsジャパン' }
  ]);

  // ---- 最初のお知らせ（公開状態で1件・再実行時は追加しない）----
  var seedTitle = 'ホームページをリニューアルしました';
  var exists = apiList('news').some(function (n) { return n.title === seedTitle; });
  if (!exists) {
    apiSaveItem('news', {
      title: seedTitle,
      body: 'この度、株式会社マウントのホームページをリニューアルいたしました。\n今後はこちらで、お知らせや施工情報を随時発信してまいります。',
      category: 'お知らせ',
      is_pinned: true,
      status: 'published',
      published_at: nowString_()
    });
  }

  Logger.log('マウント初期データの投入が完了しました');
}
