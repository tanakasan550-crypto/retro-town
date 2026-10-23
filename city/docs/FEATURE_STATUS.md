# 機能ごとの完成状況(引継ぎ時点)

作成: 2026-10-23(Claude Code → GPT Codex 引継ぎ)。基準コミットは `handoff/HANDOFF_TEST_REPORT.md` に記載。

区分:
- **実装済**: 実装があり、引継ぎ時点のビルドで自動試験(`tools/scen/*.mjs`)が合格したもの
- **部分実装**: 一部は動くが、指示の範囲の一部が未完成
- **未実装**: 実装がない
- **未検証**: 実装はあるが、確かめる手段がまだ使えていないもの

**共通の注意**
- Android 実機ではどの機能もまだ確かめていない(ヘッドレス Chromium の Pixel 7 横画面の再現のみ)。実機で見つかった不具合は `CODEX_HANDOFF.md` §8 に記載。
- 「自動試験」はプログラムで状態と描画を確かめたもの。見た目の良し悪しは人の目で一部を確認しただけ。
- 要求台帳 `docs/requirements_ledger.csv` の L・C・D 番号の行は、前の開発(チャット版 Claude の v11)から引き継いだもの。
  - そこに書かれた `tests/test_*.mjs` と `ui_*.py` はこのリポジトリには無い(v11 の開発環境の試験)。
  - このリポジトリの試験は `tools/scen/*.mjs`。

| 機能 | 状況 | 根拠(試験・台帳) | 残り・注意 |
|---|---|---|---|
| 都市v4と地図拡張(1280×1180・埋立地の島・大型施設の敷地) | 実装済 | sites・island・bigsites・relocate・lifesphere・nav1〜3 | 空港の縮尺の見直しは未着手。地図の生成(敷地の移設)に約3.5秒 |
| 建物の敷地・外観・内部・階数 | 部分実装 | houses・aptunits・foods・retail・works・tenants・pubfac・hotel・ho・aq・tp・sd・zoo・bath・campus・elemland | 美容室・銀行・旅館/民宿・幼稚園・スーパーなど約600件は v11 の汎用の中。施設監査の表(`docs/audit_facilities.csv`・版 b3ea4c9)は撮り直していない |
| 住民の通勤・通学 | 実装済 | commute・campuslife・relocate・lifesphere | 小学生の2km超の通学が99人中2人 |
| バス・地下鉄・鉄道・自動車 | 部分実装 | bus2・busin・trip・metro・st・stpeople・nav | NPC の車の駐車行動・乗降の一連の流れ(L63)は未着手。乗客数からの増便は未 |
| 空港・新幹線・フェリー | 部分実装 | fly(空港)・台帳 L272/L288(v11 で論理と UI が合格) | フェリーと地域性の行(L221・L260・L261)は PENDING |
| 学校・勤務・生活動作 | 実装済 | classroom・campuslife・works・jobaudit(81職すべてに作業)・leisure | 給食・掃除・授業の中身・テストは未 |
| 家族・親族・結婚・子ども・老化・死亡 | 実装済 | life80・popcap・kinout・kinvisit・perf | 親族との旅行は未。生きている住民は約29,600人(3万人にわずかに届かない) |
| 葬儀・喪主・火葬場 | 実装済 | funeral | 四十九日・喪中の暮らしへの影響は未 |
| 職業・勤務先・企業・テナント | 実装済 | jobaudit(82職)・tenants・tenantlife・works | 現場へ出る業種の工事現場、清掃工場・発電所は未。物流の職は高齢化で人手不足 |
| 子どもの頃の夢と進路 | 実装済 | dreams(30年) | 主人公の資格試験は大学・採用試験の道だけ(看護・美容などは従来の専門学校) |
| 資格・就職・転職・起業 | 実装済 | dreams・tenantlife(主人公の空室の賃借)・jobaudit | NPC の独立は30年で数件 |
| NPC の実績・会話・記憶 | 部分実装 | talk・reunion・ledger・kinvisit・funeral | 会話の幅(台帳の会話の行の多くは PENDING)。記憶は詳しい人物(lives)だけ |
| 人生ミッション | 部分実装 | ledger(NPC の目標と進み具合)・dreams(主人公の夢の画面) | 達成したときの演出は未 |
| 街の発展と時代変化 | 部分実装 | towndev・tenantlife(年代の需要で企業が入れ替わる) | 住宅から集合住宅への用途変更・乗客数からの増便は未 |
| エンディングと NPC 表彰 | 実装済 | ledger・dreams・life80 | エンディング音楽は未着手(L34) |
| アイソメ視点・通り視点 | 部分実装 | hud・street・enter・tap・tap11 | 通り視点で車体が描かれない(不具合C)・カメラの自由操作が無い(課題D) |
| 車両の乗降・車内表示 | 部分実装 | trip・台帳 L126(乗用車の窓越しの乗員・NPC 運転手) | 専属の運転手の車がタクシーで表示される(不具合B)・乗降の流れ(L63)は未着手 |
| Android 操作・セーブ・復元 | 未検証 | save・devcheck・joy・tap・tap11・migrate(すべて PC の再現) | 実機の試遊で不具合A〜Dが見つかっている。`docs/android_checklist.md` |
| 環境音・BGM・効果音 | 部分実装 | zoo(音の字幕)・台帳 C3-01〜06・L76 | 実際の音の聞こえ方は未確認(字幕で確認)。楽器・学校設備の音の拡充は未 |
