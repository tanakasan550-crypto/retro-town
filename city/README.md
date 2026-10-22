# 人生物語｜この街で、生きる。 (NAGAYAMA ☆LAB) — 開発ソース

- `original/` … 受領した正本(単体HTML)の保護コピー。**編集禁止**。`SHA256SUMS` で照合。
  - `lifestory_v11_single.html` … **現在の開発基準**(2026-10-23 受領・チャット版Claudeの最新)。`v11_changed_sources/` に同梱の DEV_STATE・要求台帳・指示書。
  - `lifestory_v2_original.html` … 最初に受領した版(タイトル画面付き)。
- `src/head.html` `src/assets.js` `src/modules/*.js` `src/tail.html` … 開発用ソース(正本をモジュール単位に分割)。
  - JSは `modules/ORDER.txt` の順に連結され、1つのIIFEになる(トップレベル変数は共有)。
- `tools/build.py` … 単体HTML(画像・音・プログラム内蔵)を `dist/index.html` に出力。
- `tools/shot.mjs` + `tools/scen/*.mjs` … Android相当(Pixel 7横持ち)でのヘッドレス操作・撮影。
- `TASKS.md` … 開発タスク台帳と再開地点。

```
python3 city/tools/build.py                 # → city/dist/index.html
cd city && node tools/shot.mjs tools/scen/enter.mjs   # 画面確認(OUT=保存先)
```

公開はHOLD。旧セーブ互換(GAME_ID / SCHEMA_VERSION / save.js)を壊さないこと。
