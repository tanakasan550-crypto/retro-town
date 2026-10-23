# セーブの形式・互換性・移行の仕様

引継ぎ時点(2026-10-23)の実装に合わせて書いたもの。**既存のセーブを読めなくする変更は禁止**です。

## 保存先と形式(`src/modules/113_save.js`)

- **保存先**: IndexedDB `nagayama_japan_lifestory_db`(版 1)の `saves`。
  - 使えないときは localStorage の `nagayama_japan_lifestory_save_<枠>`(gzip + base64)。
- **中身**: `Game.serialize()` → `{ S: ゲームの状態, world: World.serialize() }`。
  - `S` には主人公・日記 `S.log`・予定・お金などが入る。
- **人口の配列**: `World.ARRS`(`036_world.js`)と `save.js` の `ARR`・`CTOR` は、**必ず同じ一覧**にする。
  - 配列を足すときは、**末尾に足し**、両方へ同じ型で書く。
  - 既定値は `POP_FILL`(`036_world.js` の先頭)。
  - 古いセーブに無い配列は、新しく作った既定値の配列のまま読み込まれる(`restore` は、ある配列だけを上書きする)。

## 変えてはいけない番号(ID)

- **人物ID**(人口の配列の添字)
  - 新しい人は末尾に足す(市外の親族も末尾)。
  - 亡くなっても番号は再利用しない。
- **建物ID**(`map.buildings` の添字と `B0123` 形式の id)
  - 地図の生成は seed から決定的。
  - 敷地の移設は**場所**を変えるが、**番号は変えない**。
- **地図の版** `mapVer` 1〜4
  - v1〜v3 の寸法・配置は変えない(`applySizes`)。
  - 新しい作りは v4(`?city=4`)だけに入れる。
- **職業の番号** `JOB_IDS2 = Object.keys(JOBS)`
  - `p.job` は Uint8 で、255 は「なし」。
  - 職業を足すときは `JOBS_EXT`(`004_jobs_ext.js`)の**末尾へ**。並べ替えは禁止。
- **夢の番号** `DREAMS`(`185_dreams.js`)
  - 末尾にだけ足す(`p.dr1`・`p.dr2` に番号で残る)。
- **資格**
  - `QUALS` は 16 個で `p.quals`(Uint16)が満杯。
  - 足すときは `p.lic2`(Uint8・`LIC2` の8ビットも満杯)とは別の配列が要る。
- **入居企業の記録** `world.bizOv`・`world.bizFz`(`178_tenants.js`)
  - 区画キー `"階:区画"` と枠の番号を記録している。

## 古いセーブを読み込むときの一度だけの処理(`World.restore`)

1. 建物の動的な値(名前・階数 `nf`・状態)を戻してから、職の枠を拡張する(`extendSlots`)。
   - オフィスビルの入居企業は階数で決まるため、この順でないとずれる。
2. 市外の親族を足す(`kinOutside`)。
   - 人物IDは末尾に足す。
3. 夢と免許(`dreamV` が無いセーブ)では `dreamUpgrade` を実行する:
   - 免許の要る職で働く人に、その免許を付ける(記録より前 `pre`)。
   - 大人の資格(記録より前)を付ける。
   - 子どもと若い人に夢を付ける。
4. 名前の正規化(`163_names.js`)。
   - 内部の番号は変えない。

## 試験

- **`tools/scen/migrate.mjs`**
  - 古い版の単体HTML(`OLD_HTML`)でセーブを作り、新しい版で読み込む。
  - 次が一致することを確かめる: 建物ID・人物ID・住まい・人数・主人公の場所・施設の移転・セーブの往復。
  - 実行例: `OLD_HTML=<古い版>.html node tools/shot.mjs tools/scen/migrate.mjs`
  - 古い版(コミット 31f40a7)は引継ぎ一式の `fixtures/old_31f40a7.html` に入っている。
  - 作り直す場合は `git worktree add /tmp/old 31f40a7 && python3 /tmp/old/city/tools/build.py`。
- **`tools/scen/save.mjs`**: セーブの往復と古いセーブの互換。
- **`tools/scen/dreams.mjs`**: 夢の配列を消したセーブを読み込み、`dreamUpgrade` が働くこと。
- **`tools/scen/perf.mjs`**: 80年の各10年でセーブの往復が一致すること(`same:true`)。セーブの大きさも記録する。
