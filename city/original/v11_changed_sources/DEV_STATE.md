# 再開用の開発状態(最終更新: 2026-10-20 / v5.0自律開発 第1回)
正本: `/home/claude/NAGAYAMA_Japan_LifeStory_Claude_MasterPrompt_v5.0.md`。要求台帳: `docs/requirements_ledger.csv`(PASS/PARTIAL/HOLD/未着手)。監査: `reports/audit_report.md`。

## 起動・テスト
- 遊ぶ: `dist/nagayama_lifestory_single.html`(Androidでタップして開ける単体HTML) / PCでは `python start_for_phone.py`
- テスト用サーバ: `python3 tests/serve.py`(別ターミナル)。全回帰は `README_PLAY.md` の「テスト」節の順に実行
- 単体HTML再生成: `cd tools && npm i esbuild`(開発時のみ) → `node tools/make_single_html.mjs`
- 配布ZIP: `python3 tools/make_release.py build ../nagayama_japan_lifestory_vNN_phone.zip` → `verify`
- 経済バランス計測: `node tools/econ_probe.mjs 8`

## 今回までに完了
スマホ(content://)起動・下部メニュー・セーブ保存先自動切替 / SVG共通ツール(tools/svgchar) / 経済調整 / タクシー / 効果音+環境BGM

## 次の優先(上から)
1. 主人公の乗り物: バスは実装済(src/bus.js, 地図の道案内から乗る)。残り: 自転車/バイク/自家用車/船(L30)
2. 非対話の職業(41+53)を対話・実働化(careers_176.csv の registered/engine)
3. 住宅購入・ローン・資産運用(L10)
4. 早世・病気の分岐(寿命の変動はオプション設定として。80年完走テストは維持)
5. 多言語(日本語以外)・エンディング音楽
6. 実機確認(Android: IndexedDB保存・音量・FPS)
7. 美術: 新方式(?life=1)の標準化は利用者の美術承認後

## 守ること
追加課金0円 / 他作品・公開サイト・GitHub・Cloudflareに触れない / セーブ互換 / テスト基準を勝手に緩めない / 完成と宣言しない(美術最終承認は利用者)

## 運用方針(2026-10-20 20:14 最終変更・最優先)
- マスタープロンプトv5.0を正本に、完成条件を全て満たすまで自律開発。途中PASS報告・監査ZIP逐次提出・確認質問は不要。
- 未達は要求台帳に残し、完成と宣言しない。最終提出は完成版+検証結果+監査資料(ChatGPT最終監査用)。
- 内部ではテスト/バックアップ継続。課金・ログイン・公開・重大仕様変更のみ確認。0円・他作品保護・セーブ互換。
- 再開手順: README_PLAY.md「テスト」節 / docs/requirements_ledger.csv の未達行を上から消化 / tools/make_audit_zip.py で監査ZIP / tools/make_release.py でリリースZIP。

## 医療モジュール完了(src/medical.js) — 次の未完: 年末総括 → 善行依頼 → 葬儀/墓参り → 農作業 → 授業参観 → i18n → 株/見守り精霊/BGM曲 等
再開手順: tests/serve.py起動 → /tmp/runall.sh(無ければREPRODUCE.md)で全回帰 → 台帳 docs/requirements_ledger.csv を確認して次項へ。

## 追加済み(今回): 医療/年末総括/善行/葬儀・墓参り/農作業の季節仕事/授業参観/多言語の土台
未完(台帳に残す): 歴史IF6・旅行5、船・バイク・駐車/事故、BGM曲・エンディング曲、多言語の本文・外国人NPC、株式・架空企業、見守り精霊、建物の歴史、大型ビジョン、服装反映、新方式美術(ユーザー承認待ちHOLD)、実機Android確認
全回帰: bash /tmp/runall.sh (無ければ REPRODUCE.md の一覧を順に実行)

## 追加指示(2026-10-21 02:27 JST) docs/directive_20261021_art_approval.md
代表者が新方式(SVG由来2頭身)美術を正式承認(HOLD解除)。順序: 大型ビジョン→①新方式を標準表示 ②街並み/建物SVG全面改善 ③移動ボタン不具合(Android) ④拡大縮小(＋/－/ピンチ/地図) ⑤両親情報の明示 ⑥試験用所持金MAX(開発用・公開版で無効化可) → その後マスタープロンプトv5.0の未実装を継続。確認質問・中間監査は不要。

## 2026-10-21 追加指示の進捗
完了: ①新方式標準 ③浮動ジョイスティック/入力解除/ピンチ ④ズーム(画面+地図) ⑤両親情報 ⑥所持金MAX(開発用) 大型ビジョン / 単体HTML再ビルドは回帰後。
未完(台帳): L45 街並みの地域別重ね描き、L46 実機確認、歴史IF6・旅行5、船・バイク・駐車/事故、BGM曲/エンディング曲、多言語本文・外国人NPC、服の外見反映。
全回帰: bash /tmp/runall.sh(42行+新規8行)。公開用単体HTML: ESBUILD_DIR=... node tools/make_single_html.mjs <out> --public

## 追加指示(2026-10-21 03:05) docs/directive_20261021_svg_buildings_v1.md
SVG建物78種・数百外観・12街区配置計画。台帳L51-L59。まず現状の建物種別/街区別の実数を調べ、既存IDとの対応表(docs/building_mapping.md)を作る→構造差のあるバリアント→複合建築物→LOD の順。

## 2026-10-21 街の生活感(L55)完了
src/streetscape.js(決定的・描画時のみ・当たり判定なし)+ assets/props.png/json(tools/build_props_svg.py)+ render.js kind 'p'。sw.js FILESに追加済み。docs/building_mapping.md(tools/gen_building_mapping.mjs)。
次: 施設数拡張(512→1819目標: 複合建築・D03補充・0件分類 バスターミナル/タクシー乗り場/立体駐車場/公民館)、動的占有区画、住居収容、80年変化+履歴連動、LOD、検証14項目、単体HTML再ビルド。

## 追加指示(2026-10-21 04:53) docs/directive_20261021_roads_scale_v1.md  台帳L60-L67
道路構造・信号・歩行者・車種・乗降・縮尺規格・ズーム整合。建物計画(L51-L59)も継続。
地図v2(mapVer=2): src/mapv2.js(追加配置+ビル内テナント)、旧セーブはmapVer無し=v1で完全不変(tests/test_tenants.mjs V1)。館内案内(main.js showDirectory)、案内板prop。回帰ra13実行中(/tmp/ra13.out)。

## 指示4 (2026-10-21 05:25) docs/directive_20261021_isometric_signs_night_v1.md / ledger L68–L75
アイソメトリック標準化・外観看板・夜景・商店街アーチ。道路指示(L60–L67)と並行して実装。順序案: 道路描画→交通→投影層(src/iso.js: 世界⇄画面変換)→看板→夜景→アーケード。

- 2026-10-21 06:13 指示5(アイソメ完全移行 v1.0)受領。指示4(L68-L75)と同内容を強化: 地面/建物/道路/鉄道/車/人物を共通アイソメで。実装中(src/iso*.js)。
- 2026-10-21 06:20 指示6(音響・店舗内装・自動車販売・ガソリン・生活経済 L76-L84)受領。アイソメ(L68-L75)完了後に着手。docs/directive_20261021_audio_shops_cars_v1.md

## 2026-10-21 アイソメ継続(商店街・木)
- src/arcade.js: 商店街アーケード(arcadesOf(map): shotengai ゾーンの幅1〜2道路で両側に建物が並ぶ直線を1本、閉じても道路網が分断されない候補のみ。v2地図のみ)。歩行者専用化(roads.js roadInfo で drv を落とす)、時代で old(<1990 波板)/new(〜2011 ポリカ)/open(2012〜 青空+フラッグ)、季節飾り(夏祭り提灯/春/年末/秋)、入口アーチ(名称板)、夜の灯り。屋根は2タイル別要素(isorender)で人物は下を歩ける。主人公が下/裏だと半透明。
- isorender: 主人公を隠す建物は半透明(0.38)化(夜の灯りも)。src/isotree.js: 手続き生成の木(季節4×形3)。
- tests/run_all.mjs T84(投影/操作/奥行き) T85(アーケード) T86(縮尺)。sw.js FILES に新規モジュールを追加、CACHE v13。
- 未: アーケード下の家具(ベンチ/自販機/花壇/自転車置場)、駅ホーム屋根・ガスSTキャノピー・寺社等、歩道橋/高架/トンネル、era別外観、モバイル性能、UIテスト再実行、単体HTML再生成。
- 2026-10-21 続き: src/isospecial.js(寺=基壇+朱柱+二重寄棟/神社=高床+切妻+千木+鳥居/ガソリンST=キャノピー+給油機+価格看板+事務所/玄関庇ポルティコ: 駅・病院・ホテル)、arcade.js に駅ホーム上屋(platformsOf, 2タイル別要素・半透明)。isorender: 主人公を隠す建物は半透明0.5。tests: T84-86追加、test_life T13 を「画面で重なる人物のみ・主人公(重ね描き)除外」に変更(reports/v5_progress_report.md 記録)。
- 次: 指示6(L76-84)。順序案: 車の所有/燃料/維持費+ガソリンスタンド利用 → 新車/中古車店 → 店内(商品・衣料品)→音響 → NPC施設利用。

## 2026-10-21 車ディーラー配置(Directive 6 / 地図v3)
- map.js ver>=3: 倉庫(8x4)を 新車ディーラー(2)/中古車販売店(3)へ用途変更(ID/位置不変、ver2地図は不変を確認)。配置は臨港工業地・海風港周辺に偏る(倉庫がそこにしか無いため)。
- isospecial.js: cardealer/usedcar 外観(全面ガラス展示場+展示車、中古は屋外展示車+旗)。sw.js に cars/carui/isospecial 追加。
- 残: 主人公の車スプライト(車種/色)、給油機停止演出、店内商品表示、服屋/試着、音響、NPCの施設利用。
- 2026-10-21 指示6の実装: 音響(audio.js/soundstate.js)、店内商品(shop.js/shopui.js)、服(clothing.js)、NPC施設利用(npcfac.js)、給油所フロー。tests/runall.sh に全回帰を保存。sw.js CACHE=v14。

## 踏切遮断機 (isorail.js)
- 踏切に遮断機(縞アーム・赤点滅灯・夜光)を追加。12マス以内に電車で降下。昼/夜スクリーンショット確認済、test_life T13 0逆転・T84/T85 PASS。sw.js FILES登録済。
- 残: 歩道橋・高架/高速/IC/トンネル/橋の等角描画、駐車場入口、ガードレール、バス停、店内等角化、ショールーム入店、実機確認。
- 歩道橋(footbridgesOf/drawFootbridge, isorail.js): 駅の東西4〜5マスで線路をまたぐ階段塔+デッキ(見た目のみ、通行は地上)。スクショ確認、T13 0逆転。
- 橋(bridgeTilesOf/drawBridgeTile): 欄干・親柱・橋桁側面を追加、スクショ確認。
- バス停(drawBusStop): 屋根・ベンチ・BUS標識の等角描画に置換(夜は灯り)。

## 高架・都市高速・IC・トンネル・歩道橋(実通行)
- src/hiway.js: 地図から決定的に導く構造物(EX1=都市高速1号 青海線 y126 x56-112 / EL2,EL3=高架 / TN1=青海トンネル x224 y27-45 / FB-*=歩道橋10基)。保存データなし・地面/道路網/建物は不変(既存セーブ互換)。L.lv(構造物ID)・L.z(高さm)をS.locに持つ。syncLevel()が毎フレーム整合を取る。
- 通行: 車(ride=car/test)はIC入口レーン(帯の端1タイル)から進入→ランプで上昇→反対側で地上へ。歩道橋は徒歩のみ。高架上は降車不可(vehicle.setRide)・ガス欠でも止まらない(cars.driveTick)。
- 描画: src/isohw.js(タイル単位要素・上の人/車は要素内で描く)、isorender.jsに構造物ループ・カメラz追従・ヒーロー退避(cap)。環境車は上層を時間で走る(deckCars)。歩道橋に歩行者の見た目。
- テスト: tests/test_highway.mjs, tests/ui_highway.py(スクショ /tmp/ui_highway/*.png)。test_life T13は高所(z持ち上げ)の人物を地上足元yの比較から除外(理由: 高所の人物は足元yが画面上で持ち上がるため。旧: 全員比較/新: z≠0を除外)。
- 未着手: 駐車場入口・ガードレール・NPCの実際の高速利用/歩道橋利用(見た目のみ)・店内の等角化・ショールーム入店・実機確認。

## 店内等角化・ショールーム(isoint)
- src/isoint.js: drawInteriorIso。render.js drawInterior が iso 時に委譲(globalThis.NOISOINT で旧描画)。
- cardealer/usedcar は enter:true・interior 'showroom'(showcar x3, counter act 'dealer')。徒歩=入店、乗車中=従来modal。
- tests/ui_isoint.py 12項目PASS。残: 上階/階段、夜間照明、大型家具との歩行衝突、店内NPC・バス待ち/ファミレス描写。
- src/isoroad.js: parkingOf/guardrailsOf(地図から導出)。駐車場の舗装は isoground のチャンク見下ろし図に描画、Pサイン/ガードレールは立体アイテム。tests/test_isoroad.mjs。
- 残(駐車): NPC車が駐車場に入って止まる動き、駐車料金の連動の見た目。
- 店内夜間照明(暖色の光だまり+室内減光)実装、ui_isoint I11。残: 階段/上階の磨き込み、大型家具との歩行衝突。
- 検証の鮮度: tests/_browser.py の launch() がサーバー停止を検知して serve.py を自動再起動し、全スクリーンショットに <png>.json(撮影時刻・ソースhash・swキャッシュ版・URL・HUD)を併記。古い画像は最新の検証結果として扱わない。
- 年代別車種は isoveh.js eraShape。NPC歩行者/環境車の高架・歩道橋利用は引き続き見た目のみ(人口IDの実在人物を表示するが経路探索には未接続)。
- 住民の歩道橋/高架利用: nav.footLinks(歩行)、hiway.carLinks(車)を経路探索に追加し、routePos/posAlong の jump・lv で橋上/高架上の高さ付き描画。ambient(Traffic)の車は従来の見た目のみ。
- 画質自動調整: main.js autoQuality / render.js qs。webdriver(自動テスト)では無効、window.__autoQ で状態確認。店内の棚は低く(1.3m)して人物を見やすく。
- 優先1 縮尺: 人物/車/バス/電車/階高をメートル基準で検証、docs/scale_spec.md + tests/ui_scale.py 追加 (PASS)。次: 優先2 装飾車のNPC連動、優先6 自動画質の看板可読性
- 優先6: qs下限0.70+見かけ縮尺維持(render.js/main.js)。ui_autoq/mapzoom/touch/scale PASS。次: 優先2 装飾車→NPC連動、優先3 店内行動、優先4 灯り/音
- 優先2: 装飾車→住民PV車に連動(traffic.js)。優先3: 店内動線(crowd.js shopLife/animIndoor)。次: 優先4 灯り/ネオン/季節/音、残り台帳項目
- 追加仕様(docs/directive_lifeindustry.md)受領。台帳 L105-L114。車両分(売却/下取り/ローン/保険/事故/修理)実装済み。次: 不動産(L107)→共通経営エンジン(L109)→新業種(L108)→百貨店/共用部(L110/111)
- 不動産(L115-120)実装: realty.js/realtyidx.js/realtyui.js(住まいを探す→不動産の資産管理)。次: 共通経営エンジン(L109)
- 経営エンジン(L121-124)実装: industry.js firm.js firmui.js。T41決定論不具合(childrenOfキャッシュ)を修正。次: 百貨店の階層構造/エスカレーター・エレベーター(L110)、高層マンション共用部(L111)
- 巨大建築(L110/L111)実装: src/interior_big.js(百貨店/モール/タワー/アパートの階生成・テナント・フロアガイド)、src/units.js(住戸台帳=世帯ごとの部屋番号・階・所有区分・空室。決定論)、src/lift.js(エレベーター=待つ→ドア→乗る→階選択→移動→降りる・定員10・混雑で見送り/エスカレーター=乗車4.2秒)、src/biglife.js(操作と館内の人の配置)。階番号は 地上1階=0/地下=-1/屋上=階数。住戸の中は floor>=1000(units.unitCode)。isoint.js は大きな床(W+H>46)で主人公追従カメラ・視野外カリング。game.fixLoc()で旧セーブの屋内位置を補正。exterior階数は isobld.storeys(dept 7-8F/tower 12-18F)と一致。tests/test_bigbld.mjs(47)・tests/ui_bigbld.py(スクショ reports/shots_bigbld/)。sw.js v16。
- 巨大建築の残: 外形の拡大(セーブ互換のため据え置き=館内40m×24mは別館連絡通路込み)・NPCのエレベーター/エスカレーター乗車の見た目・オフィス/複合ビルの共用部・百貨店の各売場の専用サービス(試食・配達等)・タワーの部屋の間取り差。

## 2026-10-21 19:55 巨大建築 最終回帰
- ui_batch 全PASS(ui_isoint/shoplife/scale/bigbld/realty/carbiz/firm/pwa, test_bigbld 47/47), run_all 47/47。
- single HTML 2種を再ビルド(19/19確認)。フル runall.sh は /tmp/runall_full.out で実行中(DONEまで)。
- 残: L108業種別内部, L124他社昇進, L118土地建築, L106修理工場/事故現場, 不動産営業UI, L113人生史連携, 環境車ルート追従, 飲食客の食事動作, オフィス/ホテル/病院EV, 外観スケール拡大(任意), Android実機は未検証。

## 2026-10-21 20:5x
- 完了: 原付ライフサイクル/自転車専用スプライト/美容室(hair.js, hairui.js, test_hair.mjs, ui_salon.py)/切替仕様書(docs/ride_switch_spec.md)。run_all 47/47, test_moto 11/11, 単一HTML 19/19。
- 次: 車種カタログ・乗員連動(NPC)・駐輪場・夜間比較画像・美容師職業/経営・家族の髪型保存。再開は tests/runall.sh 全実行から。

## 2026-10-22 (継続)
- 追加完了: 家族/NPC髪型保存・美容師職業(歩合/免許/開業条件)・駐輪・車種23種・夜ヘッドライト・端末診断・建て替え・音・席客。テスト: test_hair 19/19, test_bikepark 9/9, test_rebuild 6/6, run_all 47/47(直前)。
- 再開手順: `node tests/run_all.mjs` → `bash tests/runall.sh`(setsid nohup, ^DONE待ち) → 単一HTML再ビルド(README手順) → test_single_html.py 19/19。
- 次: 全体回帰(未実施: 今回の変更後) / L54, L58, L59, L63, L66, L109 / 駅前再開発 / 乗員NPCのバス・電車連動拡張。


## 2026-10-22 05:10 試遊版提出時点
- 提出HTML: submit/nagayama_lifestory_trial_20261022_0505.html (SHA256 176e4756…f391)。run_all 47/47(単独)、single 19/19、test_license 39/39、test_gather 23/23。python UI全体回帰(runall.sh)は未完了。
- 次: 日本家屋/文化施設/工場・物流・インフラ職(L230-L235)、他の台帳PENDING。回帰は他テストと同時に走らせない(T50が競合で遅延)。再開手順: bash tests/runall.sh を単独で実行(setsid nohup)。

## 05:36 日本家屋(L231)
- 外観: isobld.js(WA)+shoji窓, 屋内: interior.js home+wa(畳/縁側/土間/床の間/布団), 修繕: realty.js REFORMS id3, 建て替え: world.js(hash2のみ・rng不変でセーブ互換)。tests/test_wa.mjs 15/15, 実画面 reports/shots_wa/*.png
- 全体回帰(/tmp/snap): run_all 47/47, taxi 9/9, bus 12/12 ほか進行中。T50は並列負荷時のみ失敗(コード起因でない)。test_vehicle は direct=true に変更(借家は鍵のため)。

## 05:25 代表者Android実機フィードバック受領 (docs/directive_20261022_android_feedback.txt)
- 最優先に切替: L240ズーム→L241案内→L242MAX資金→L243名字→L244親ガチャ→L245子供の生活→L246時代整合→L247引継ぎ。
- 並行作業中だった日本家屋/産業職業(L231,L233-235)は実装済み部分をtest_wa/test_industryで確認済み、culture.jsは未配線(L232)。
- 05:30 追加指示2件受領(出生美術L248/L249, 初期設定UI L250, 時代街並み L251)。docs/directive_20261022_birth_art.txt, directive_20261022_setup_era.txt
- 05:35 最終改善指示(directive_20261022_final_handover.txt)受領。優先順位P0→P1→P2。進捗: L240ズーム実装済(初期S=2.5*dpr,最大12,屋内izl追従)/L241案内実装(guides.js)。次: L242 MAX資金開始選択, L250初期設定UI, L243名字。

## 05:50 初期設定UI刷新・MAX資金開始選択
- src/setupui.js新規、main.js showTitle全面刷新(3ステップ/髪型見本/年齢別プレビュー/名字名前分離/見た目と呼ばれ方の分離/資金選択)。ふく色スウォッチは人物合成で未使用だったため廃止。
- HUD: MAX資金時 【MAX資金】表示。#title z-index修正。
- tests/shots_setup.py(390x844)で無スクロール確認。runall.shにtest_names追加。
- 未実装: 呼ばれ方の台詞反映、親ガチャ(L244)、年齢制約(L245)、年代別街並み(L251)、出生美術(L248)。

## 05:58 年齢制約(L245)
- src/minor.js: tier/enterBlock/leashBlock/routine/freePlay。motion.js tryEnter・moveHero に接続。設定+開始画面に自由試遊(開発用)。tests/test_minor.mjs 19/19、runall.sh追加。

## 06:05 親ガチャ(L244)
- src/household.js + world.pickParents(pickFn) + game.create。別乱数列(birth-household)で既存の乱数列を動かさない。新規人生のみ出生家庭が変わる(既存セーブは影響なし)。tests/test_household.mjs 10/10。

## 06:25 追加指示の取り込み
- docs/directive_20261022_npc_life_talk.txt (L253-258) / directive_20261022_onsen_scale_region.txt (L259-261) を台帳に登録。
- L253: career.backfill の前職選択を実在求人(slots)から選ぶよう修正。検査 src/jobcheck.js + tests/test_career_consistency.mjs。UI直列テスト(/tmp/ui_seq.sh)終了後に実行する(並列禁止)。

## 2026-10-22 07:2x 提出ビルド
単一HTML再生成(開発版/公開版)・test_single_html 19/19・ui_pwa 19/19・test_era 7/7・test_activity 11/11・test_career_consistency 8/8。era調整: tower LOW_CAP 8→4、1980年前はカーテンウォール窓なし。runall.shに era/activity/career_consistency 追加。引継ぎ書 HANDOVER_NEW_CHAT.md。台帳 L244-L263 の状態を更新(DONE_EMU/PARTIAL/PENDING)。


## 2026-10-22 都市v2(mapVer 4・30倍)追加分
- 正本ZIPは未改変(`/home/claude/work/canon`、ZIP_SHA256.txt)。作業は dev_copy。v1〜v3 は無変更(run_all 47/47)。
- 新規: `src/city2.js`(生成) `src/tiles.js` `src/regions.js`(地域・交通接続表・人生記録構造) `docs/save_compat_spec.md` `tests/test_city2.mjs` `tests/test_save_v4.mjs`。
- 変更: map.js(ver>=4分岐) world.js(v4人口/住居・職場の近接配置) career.js(メモ化) nav.js(A*バッファ再利用) render.js(ミニマップ) transit.js main.js game.js(都市選択 `?city=`)、data.js/isobld.js/bsub.js(空港・スタジアム・テーマパーク・動物園)。
- 起動: `python3 tests/serve.py 8765` → `index.html?city=4`(1280x960・約6,000棟・人口30,000)。
- 未完(台帳 L270-L279): 人口密度調整、長距離A*、Android横画面UI、NPC生活行動、広い屋内、上位品質方針の代表8施設、完全UI回帰(未実行・前後比較用)、実機確認。
- 禁止事項継続: 追加費用/GitHub/一般公開/販売/SNS/強制広告/決済。

## 2026-10-22 09:30 商品の高精細化(代表例)
- 新規: src/goodsart.js(青果/酒/本/魚肉のベクター描画)、tests/test_goods.mjs。shop.js に 青果10品・酒13品+おつまみ・書籍追加、成人限定(20歳)、飲酒後は車・バイク運転不可(S.drunkUntil、自転車は対象外=簡略)。酒屋(BTYPES.liquor)を追加し v4 の商店街に配置。棚の高さ/段位置を調整(商品が棚内に収まる)。
- 参考資料: docs/design/v2_reference/(主指示・商店街・学校・参考画像2枚)。
- 次: 中学校1フロア(教室+廊下+職員室+着席/授業の可視化)、店員・客の動作、病院/交差点の密度向上、Android横画面。

## 2026-10-22 09:50 性別欄と酒の修正
- 性別欄(identity.js): 初期設定step0。hero.ident.sex。旧セーブ不変。酒は購入=所持品/飲む=酔い。自転車も運転不可。
- 次: 中学校1フロア→店員・客の生活動作→病院・交差点の高精細化。

## 2026-10-22 完成優先への方針変更(10:24) と 本日の実装
- 方針: 代表1件の試作→指摘の繰り返しをやめ、都市v2全体の完成を目標。台帳(docs/requirements_ledger.csv L287〜)と docs/facility_status.csv(tools/facility_status.mjs で再生成)で完成管理。世界各地マップ・タイムマシンはその後。
- 実装済(本日): 墓地誤入場P0修正+現在地表示(where.js)/年代別看板・掲示板(eraads.js, v4のみ)/空港・フェリー・新幹線の乗降体験(journey.js, journeyart.js, 連絡バス)/温泉・銭湯の男女別浴場+露天(onsen)。
- テスト: run_all 47 / test_city2 25 / test_save_v4 6 / test_goods 51 / test_identity 39 / test_enter_guard 58 / test_eraads 15 / test_journey 37 / test_onsen 28 / ui_journey 7 / ui_where 14 / ui_sexsetup 16(順次実行。重い回帰は並列にしない)。完全UI回帰は未実行。Android実機は未検証。
- 次の優先: ①通り視点(L291, 未着手) ②露天の美術強化・入浴姿勢・NPC入浴 ③中学校1フロア ④店員/客の生活動作 ⑤病院・交差点の高精細化 ⑥旅館大浴場 ⑦施設別「NPC生活動作」の固有化(facility_status の4→5)。
- 保存の任意フィールド(なくても読める): S.trip(旅の途中)/S.life(旅の記録)/S.washedAt。version は上げていない。

## 2026-10-22 午後(連続作業)
- 中学校: interior_school.js(4層・各学年5クラス)、crowd.js で学年/組/席の配置と休み時間(廊下)。test_school 62。
- 露天風呂: 庭の背景(木・月・星)・竹垣・岩。fence は deco だと描画されない(isoint が deco を飛ばす)ので注意。
- 施設別の生活動作 kindLife(crowd.js) + stateLabel(activity.js)。test_kindlife 137。facility_status.mjs の LIFE 判定を更新。
- 病院内装の小物追加(isoint.js dirsign/mrack/watersrv/clock/curtain/handrail)、信号灯器を3灯式+歩行者信号+点字ブロック(isorender.js)。
- 次の再開地点: ①病院の個室(診察室/2階病棟)の作り込み ②交差点の路面標示・案内標識 ③露天風呂の入浴姿勢/NPC入浴検証・家族風呂 ④小学校/高校/大学/幼稚園の休み時間・体育 ⑤人生全体の長期テスト(tests に長期シミュレーションを追加)。

## 2026-10-22 13:40 固定順序(病院→交差点→入浴→学校→長期回帰)完了
- 学校: crowd.js schoolPeople(名簿→学年の階→組均等→席/通路立ち、休み時間、教員巡回)。test_school 62 / test_school_roster 36。
- 長期回帰: tests/test_longlife.mjs(quick引数で1シード)。自動保存監視: src/autosave.js + save.js verifySlot、main.js が toast で通知。
- 全回帰: run_all 47/47、node各テスト全PASS、UI(journey/where/sexsetup/street/isoint/single_html)PASS。Android実機は未検証。一般公開はHOLD。
- 次の再開地点: 人生の連続性監査(同級生の進路・再会・親の老い・NPC同士の関係と記憶)。

## 2026-10-22 15:10 方針変更(都市基盤優先)への対応
- 代表指示(14:16): 人生の連続性の監査指摘は台帳に登録(L304〜L309, docs/audits/)し、都市基盤(施設・交通・景観)の完成を優先。人物関係の高度化は基盤完成後。人物関係の途中実装は取り消し済み(テスト済みの状態に復元)。
- 追加: tests/test_facilities_all.mjs(全82種類の内部を機械検査→docs/facility_audit.json)、interior_kinds.js(専用レイアウト11種)、倉庫/物流/桟橋の屋内、公園の住民、小学校/高校/大学の階構成、autosave監視。
- facility_status.csv: 5検証済み=82 / 6屋外利用=3。density列「薄い」54種類が次の作り込み候補(station/hotel/office/factory/cinema等)。
- 次の再開地点: density「薄い」の施設(駅・ホテル・オフィス・町工場・商店系)の専用レイアウト → 通り視点・年代別景観・交通(鉄道/空港/港)の屋内外の残り項目。

## 2026-10-22 21:14 P0: 線路・道路を渡れない問題(代表者の試遊で発見)
- 原因: ①線路は solid で、踏切は駅間の幹線にしかなく、長い線路沿いで反対側への遠回りが数百マス ②街区の道路が線路・川の手前で行き止まり → 走行網(車線の強連結成分)から街区ごと孤立(タクシーが実走できない) ③大邸宅(estate1)47軒の玄関が建物内部。
- 対応(src/city2.js・map v4のみ・乱数不使用): 10a joinRoads(対向に同じ道路がある行き止まりを CROSSING/BRIDGE でつなぐ) → 10b addRailCrossings(約28マスごとに2マス幅の歩行者踏切+取付PATH) → 10c addWaterBridges(遠回り>110の川に人道橋) / estate1 doorY修正。
- motion.js: trainNear/CROSS_MSG(遮断機が閉まっている間は踏切の手前で止める・渡り始めた人は出られる)。pedsignal.js: 住民も遮断機待ち。
- 検証: tests/test_crossing_p0.mjs 43 / audit_reach 5484 全歩行PASS / test_taxi_real 8/8 / test_xing 13。docs/directive_20261022_2114_P0_crossing.txt。
- 未対応(次): 跨線橋・地下道の追加(駅以外)、車両が踏切で止まる実走確認(test_cars系)、タクシー・一般車の踏切停止の目視、年代別(昔は踏切のみ/現代は立体化)の差、主人公が踏切内に取り残された場合の扱い。

## 2026-10-23 02:09 Android実機試遊に基づく全面改修(P0 前半)
- 実装: タップ自動移動(src/autowalk.js: 屋外=findPath、屋内=BFS、再経路・踏切待ち・中止■)、設備/出口/階段/NPC名のタップ→歩いて近づき→操作表示、
  ジョイスティック(小さく動かして向き変更・感度/大きさ/固定・浮動・十字キー、指を離すと確実に停止・走りリセット)、操作設定モーダル、
  時間 ⏸/🐢/▶/⏩、常設「🏠自宅へ」(自動で歩く/タクシー/駅から)、建物内「🏢階の案内」(各階の設備一覧)、
  上階の出口は階段/EVで1階へ降りてから外へ(瞬間移動廃止)、地図検索の道案内を要約表示(距離・徒歩分・次の3手・自動で歩く)。
- 検証(PC): run_all 47/47, audit_floors 987/987, audit_reach 5484/5484, tests/e2e_autowalk.py(屋内外タップ・出口チェーン・自宅・タッチ操作・時間停止)。
- 未検証(Android実機): タッチ操作の体感(感度・大きさ)、十字キーの配置、長押し/ピンチとの干渉。
- 未実装: 屋内の経路線描画、タップ目印の描画、進行中の次曲がり角/残距離HUD、P1(駅・水族館・スタジアム等の個別改築)、P2。
