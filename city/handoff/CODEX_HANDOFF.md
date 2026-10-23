# CODEX_HANDOFF — 人生物語・日本モデル都市(NAGAYAMA ☆LAB)

GPT Codex が最初に読む引継ぎ説明書です。2026-10-23、Claude Code の利用制限のため、実装担当を Codex へ引き継ぎます。

これまでの成果はすべて残します。作り直しはしません。現在の最新状態から開発を続けてください。

---

## 1. ゲームの目的と全体構造

- **目的**: 1人の主人公が架空の日本の街で、0歳から80歳までの人生を生きる。
  - 舞台は青海市。年代は1946〜2070年ごろで、時代の変化がある。
  - 約3万人の住民(NPC)にも、それぞれの家族・学校・仕事・夢・死がある。
  - 主人公は住民と出会い、働き、暮らす。
  - 最後に、80年の年譜と、街の人の表彰(記録だけを根拠にする)が出る。
- **形**: 画像・音・プログラムを1つにまとめた単体 HTML。
  - Android のブラウザでそのまま遊べることを目標にしている(横持ち・ジョイスティック・タップ移動)。
  - サーバーは不要。
- **ソースの構造**: `city/src/modules/NNN_*.js` を `city/src/modules/ORDER.txt` の順に連結し、1つの IIFE にする。
  - トップレベルの変数と関数は全モジュールで共有される。
  - `999_end.js` は最後。
  - 主な層:
    - データ: `002`〜`008`(職業 `004_jobs_ext.js`・`005_data.js` の BTYPES/JOBS/QUALS)
    - 世界(人口・職・学校・毎月の進行): `036_world.js`
    - ゲーム(主人公・日記・出来事): `077_game.js`・`076_events.js`・`067_actions.js`
    - 描画: アイソメ `087`〜`110`、通り視点 `098_streetview.js`
    - 画面: `133_main.js`(UI・`window.NLS` = 試験用の窓口)
    - 施設の作り直しの共通基盤: `143_fac_core.js`。各施設は `FAC_BUILD`・`FAC_RANGE`・`FAC_LABEL`・`FAC_KEY` に登録する。
    - 今回の主な追加: `178_tenants.js`(テナント)・`179_reunion.js`(再会)・`180_worktask.js`(職業の作業)・`181`〜`184_fac_*`(住宅・飲食・小売・職場の中)・`185_dreams.js`(夢と資格)

## 2. 現在の最新コミット

- ブランチ `ccr-2a73e5bf-wii4bj`(Claude Code の作業ブランチ)。**このブランチは保護してください**。
- 引継ぎ時点のコミットと、試験に使ったビルドの SHA-256 は `handoff/HANDOFF_TEST_REPORT.md` と `handoff/GIT_INFO.txt` にある。
- Codex の作業ブランチ: `codex/lifestory-v2-improvement`(引継ぎ時点のコミットから作成済み)。

### リポジトリの公開状態と Codex の接続(2026-10-23 に確認)

- **注意: GitHub API では、このリポジトリは現在「公開(public)」です**(`private:false`)。指示書の前提(非公開)と違います。
  - Claude Code は設定を変えていません。非公開にするかどうかは代表者が GitHub の Settings → General → Danger Zone → Change visibility で決めてください。
  - GitHub Pages(`https://tanakasan550-crypto.github.io/retro-town/`)は main の `index.html`(日立レトロ横丁)を配信しています。`city/` のゲームは main に無いため、Pages では配信されていません(`city/...` は 404 を確認)。ただし作業ブランチのソースと `release/*.html` は、リポジトリが公開である限り誰でも読めます。
- Codex からの接続: ChatGPT の Codex の設定で GitHub 連携を有効にし、`tanakasan550-crypto/retro-town` へのアクセスを許可して、ブランチ `codex/lifestory-v2-improvement` を選ぶ。
  - 連携が使えないときは、引継ぎ一式の `CODEX_HANDOFF_GIT.bundle`(全履歴)から `git clone CODEX_HANDOFF_GIT.bundle retro-town` で復元できる。
  - トークンや鍵をリポジトリ・文書に書かないこと。

## 3. ソースと素材の配置(`city/`)

| 場所 | 中身 |
|---|---|
| `original/` | 受領した正本(編集禁止。`SHA256SUMS` で照合)。`lifestory_v11_single.html` が開発の基準、`lifestory_v2_original.html` が最初の版 |
| `src/head.html`・`src/assets.js`・`src/tail.html` | 外枠と素材(画像・SVG・音の定義はプログラムで生成、または `assets.js` に内蔵) |
| `src/modules/*.js`・`ORDER.txt` | ソース本体(182 ファイル) |
| `tools/build.py` | 単体 HTML を作る(`dist/index.html`) |
| `tools/shot.mjs`・`tools/scen/*.mjs` | ヘッドレス Chromium(Pixel 7 横画面)での試験と撮影 |
| `tools/run_tests.sh` | 全試験 → `docs/test_results.md` |
| `release/` | 試遊用の単体 HTML(`lifestory_city_v2.html`)・`SHA256SUMS`・`README.md`。前の版は `release/archive/` |
| `docs/requirements_ledger.csv` | 要求台帳。前の開発から引き継いだ行は列の数がまちまちなので、ゆるい読み方で読む |
| `docs/unverified.md` | 未完成・未検証の一覧(正直な現状) |
| `docs/FEATURE_STATUS.md` | 機能ごとの完成状況 |
| `docs/SAVE_COMPAT.md` | セーブの形式・互換・移行の仕様 |
| `docs/job_audit.md`・`job_audit.csv`・`tenant_audit.csv` | 職業と事業所の監査 |
| `docs/audit_facilities.csv`・`audit_summary.json`・`audit_sheets/` | 施設完成度の監査(版 b3ea4c9 の撮影) |
| `docs/android_checklist.md` | Android 実機の検証手順 |
| `docs/perf_80y.json`・`test_results.md` | 性能と試験の結果 |
| `DEV_STATE.md`・`TASKS.md` | 開発の状態と再開地点 |
| `original/v11_changed_sources/` | 前の開発の DEV_STATE・指示書・台帳(参照用) |

## 4. 正しいビルド手順

```bash
cd city
python3 tools/build.py           # → city/dist/index.html(約6MB・181モジュール)
```

- 必要なもの: Python 3(標準ライブラリのみ)。
- `dist/` は `.gitignore` に入っているので、成果は `release/` に置く(§11)。
- 地図v4(現在の街)は URL に `?city=4`。試験は既定でこれを付ける。

## 5. 自動試験の実行方法

```bash
cd city
# 1本(最後の行が "no errors" なら合格)
OUT=/tmp/x node tools/shot.mjs tools/scen/save.mjs
# 全部(並列。結果は docs/test_results.md)
JOBS=4 HTML=dist/index.html OUTD=/tmp/tests bash tools/run_tests.sh
# 別に回す長い試験
OUT=/tmp/x node tools/shot.mjs tools/scen/life80.mjs     # 80年の人生(約3〜5分)
OUT=/tmp/x node tools/shot.mjs tools/scen/perf.mjs       # 80年の性能とセーブの大きさ(約30分)
```

- **必要なもの**: Node 22 と Playwright 1.56 の Chromium。
- この環境と場所が違うときは、環境変数で指定する:

```bash
export PLAYWRIGHT_MODULE=$(node -e "console.log(require.resolve('playwright').replace(/index\.js$/,'index.mjs'))")
export CHROMIUM_PATH=/path/to/chrome   # 空文字なら Playwright の既定のブラウザ
```

- 全試験は4並列で約1時間かかる。並列が多すぎると、起動待ち(150秒)を超えて落ちることがある。
- `tools/run_tests.sh` の `SKIP` に入っているものは別に回す: `lib`・`compare`・`survey`・`dbg*`・`nav_dbg`・`probe`・`life80`・`migrate`・`mapview`・`perf`。
- `_` で始まるファイルは作業用(例: `_prof.mjs` は CPU プロファイル)。

## 6. 旧セーブ互換試験

```bash
OLD_HTML=../handoff/fixtures/old_31f40a7.html OUT=/tmp/x node tools/shot.mjs tools/scen/migrate.mjs
```

- `old_31f40a7.html` は ZIP に同梱している。
- 作り直す場合: `git worktree add /tmp/old 31f40a7 && python3 /tmp/old/city/tools/build.py`。同じ SHA-256 になることを確認済み。
- 詳しくは `docs/SAVE_COMPAT.md`。

## 7. 最新の合格・不合格・未検証

- `handoff/HANDOFF_TEST_REPORT.md` を見る。
- 合格は、引継ぎ時点のビルド(同じ SHA-256)で実際に回したものだけを書いている。
- 主な未検証:
  - Android 実機(すべて)。
  - 音の実際の聞こえ方。
  - 施設監査の全件撮影。
  - 見た目の良し悪しの大部分(人の目での確認が必要)。

## 8. 最初に修正すべき4項目(実機の試遊で見つかったもの)

**修正の進め方(共通)**
1. 原因を確かめる。
2. 直す。
3. `tools/scen/` に回帰試験を足す。
4. 全試験を回す。
5. 新しい試遊用 HTML を `release/` に作る。

**A. 豪邸から外に出られない・今いる階が分かりにくい**
- 該当箇所:
  - 豪邸(`estate === 2`)の中は `020_interior_estate.js` の `buildMansion`。階は `MANSION`(lo -1 〜 hi 2)。
  - 各階の部屋の間取りは `PLAN3`。階の名前は `MANSION_LABEL`。エレベーターは `EV_X`/`EV_Y`。
  - 出口(`exit` タイル)は1階だけにある(142行付近)。
  - エレベーターと階段: `047_lift.js`。
  - 豪邸での家族の配置: `027_estatelife.js` の `mansionPeople`(`080_crowd.js` から呼ぶ)。
  - 画面の階の表示と「階の案内」ボタン: `133_main.js`。
- 確かめること:
  - どの階(B1・1F・2F・3F)からも、階段・エレベーター・玄関を通って屋外まで歩けるか。
  - 試験の例: `houses.mjs` の歩いて行けるかの検査を、豪邸の各階と出口まで広げる。
  - 今いる階と出口の方向が画面に分かる表示。
  - `isMansion` の家は `181_fac_house.js` の一戸建ての作りの対象外。

**B. 専属の運転手の送迎なのにタクシーが表示される**
- 該当箇所:
  - 送迎の開始: `133_main.js` 1902行付近(`chauffeurAvail` → `taxiTripBegin(..., { chauffeur: true })`)。
  - 送迎のとき `106_taxi.js` は `g.S.driveAway = 1` を立てるだけ。
  - アイソメ描画は `109_isorender.js` 813行付近で、乗っている車をいつも `"taxi"` で描いている(`pushVeh(hero.x, hero.y, ..., "taxi", ...)`)。
  - 乗車の場面も `kind: "taxi"` で出している(`133_main.js` 1924行付近)。
- 直す方向:
  - 送迎のときは、家の車(高級車 `luxury` など。`087_isoveh.js` の車種)・運転手(家の使用人)・乗る位置(後ろの席)にそろえる。
  - 家の車の記録は `072_lifestart.js` の `F.staff.chauffeur` と `027_estatelife.js`。

**C. 通り視点で車体が透けて、人物だけが動く**
- 該当箇所:
  - 通り視点は `098_streetview.js`。
  - 461〜470行付近で、主人公は**いつも**立っている人物の絵で描かれる(`personSprite(... hero: true)`)。
  - 周りの車は `R5.carsNow()` から描くが、主人公が乗っている車(タクシー・送迎 `TAXI.trip`・自分の車)は描いていない。そのため、体だけが道を進む。
- 直す方向:
  - 乗っているあいだは、車体・窓・座席の乗員(主人公を含む)を描く。
  - 描く順番(手前と奥)と、カメラの位置(車の後ろ上)を車に合わせる。

**D. カメラの自由操作(Android)**
- 今の作り:
  - 左のジョイスティック(`133_main.js` の `joyMove`・`CTL`)で歩く。
  - 通り視点の向きは主人公の向きから決まる(`098_streetview.js` の `setYawFromFacing`・`R5.sv.yaw`)。
  - 右側のドラッグでカメラを回す仕組みは無い。
- 求められていること:
  - 左のジョイスティック = 移動。
  - 右側のドラッグ = カメラの左右の回転(必要なら上下も)。移動とは別にできること。
  - 歩いているときにも、車に乗っているときにも使えること。
- 試験の例: `joy.mjs`・`street.mjs`・`tap.mjs` を広げる。

## 9. 現行の重要な設計判断

- **決定的**: 住民の決定は、seed・人物ID・年月からのハッシュ(`hash2`・`uh`・`monthRng`)。乱数の流れを変える変更はできるだけ避ける。
- **記録だけを根拠にする**: 会話・表彰・エンディング・ミッションは、実際の記録だけを根拠にする。記録とは、職歴 `prof.hist`、日記 `S.log`、人口の配列、`w.dev`。架空の実績を足すことは禁止。
- **資格の要る職**: 資格を取るまで就けない(`eligibleFor` → `holdsJob`)。資格は養成と試験で取り、記録に残る(`185_dreams.js`)。
- **建物の中は施設ごと**: 施設ごとの専用の作り(`FAC_*`)で作る。登録が無い施設は v11 の汎用の中を使う。
- **テナント**: オフィスビルは 階 → 区画 → 企業 → 社員 → 仕事 の順につながる。入れ替わりは `world.bizOv`・`bizFz` に記録する。
- **地図v4だけを変える**: 地図v1〜v3 と旧セーブの寸法は変えない。
- **性能**: 人口の記録は約12万人(生存は約3万)。10年の計算は約16.5秒、セーブは32MB。重い処理は月や年ごとにまとめて計算し、結果を覚えておく。

## 10. 変更禁止とデータ保護

| 禁止 | 理由・詳細 |
|---|---|
| `original/` の編集 | 正本 |
| 既存ソースの削除 | 使わなくなったものも、残して切り替える |
| 人物ID・建物ID・車両ID・職業/夢/資格の番号の変更・並べ替え | `docs/SAVE_COMPAT.md` |
| 旧セーブを読めなくする変更 | migrate.mjs・save.mjs で確かめる |
| `ccr-2a73e5bf-wii4bj` ブランチの書き換え・リセット | Claude Code の成果を守る |
| main へのマージ | 代表者の承認が必要 |
| GitHub のリポジトリを公開する・ゲームを一般公開する・販売する・外部へアップロードする | 代表者の承認が必要 |
| 有料 API・有料の契約 | 追加費用は0円 |
| 試験の期待値を弱める・合格を偽る | 「未完成を完成と報告しない」 |
| Android 実機で確かめていないことを「実機合格」と書く | PC の再現は実機の合格ではない |

## 11. 試遊用 HTML の作り方

```bash
cd city && python3 tools/build.py
cp dist/index.html release/lifestory_city_v2.html
(cd release && sha256sum lifestory_city_v2.html > SHA256SUMS)
# release/README.md に、版(コミット)と試験の結果を書く
```

- 前の版は `release/archive/` に移して残す(消さない)。
- 単体 HTML は Android の Chrome で開ける(`?city=4` は既定)。
- 端末の中での検証は、設定 →「端末の検証」(`docs/android_checklist.md`)。

## 12. 次の開発順序

1. §8 の A〜D(操作と表示の不具合)。修正、回帰試験、試遊用 HTML まで。
2. 大型施設の外観と敷地の整合(スタジアム・空港の縮尺・銭湯/温泉の外観と中の広さ)。
3. 汎用の中の残り(約600件: 美容室・銀行・旅館/民宿・幼稚園・スーパーなど)。
   - `181`〜`184_fac_*` と同じ方式で作る。
   - 全件の試験(設備・席・歩けるか・間取りの違い)を付ける。
4. 温泉・水族館・動物園・学校などの完成度。
5. 人物IDに基づく会話の幅と長期記憶。
6. 職業とテナントの統合の残り(工事現場・清掃工場・発電所)。主人公と NPC の職業ごとのミッション。
7. 街と住民の長期の変化(住宅 → 集合住宅・乗客数からの増便)。
8. Android の操作と性能。実機での「端末の検証」は代表者の端末で行う。

- 既にある仕組み(上の各モジュール)を使う。同じ機能を別に作り直さない。
- 詳しくは `docs/unverified.md` と `DEV_STATE.md` の「再開地点」。

## 13. 作業の終わりの成果の保存

```bash
git add -A city && git commit -m "..."         # 作業ブランチ codex/lifestory-v2-improvement へ
git push -u origin codex/lifestory-v2-improvement
```

作業を終えるときは、次を必ず更新する:
- `city/DEV_STATE.md`
- `docs/unverified.md`
- `docs/requirements_ledger.csv`(行を足す)
- `docs/test_results.md`(全試験)
- `release/`(試遊用 HTML と SHA256SUMS)

将来 Claude Code と統合するときは、`ccr-2a73e5bf-wii4bj` と `codex/lifestory-v2-improvement` の差分を見て、試験を全部回してから統合する。
