# AGENTS.md — このリポジトリでの作業規則(Codex など)

このリポジトリの開発対象は `city/`(人生物語・日本モデル都市・単体HTMLのゲーム)。最初に `city/handoff/CODEX_HANDOFF.md` を読むこと。
ルート直下のほかの HTML・画像(`index.html`・`dagashi.html` など)は別の作品なので触らない。

## ビルドと試験
- ビルド: `cd city && python3 tools/build.py` → `city/dist/index.html`
- 試験1本: `cd city && OUT=/tmp/x node tools/shot.mjs tools/scen/<名前>.mjs`(最後の行が `no errors` で合格)
- 全試験: `cd city && JOBS=4 bash tools/run_tests.sh`(結果 `city/docs/test_results.md`)。長い試験 `life80.mjs`・`perf.mjs`・`migrate.mjs`(OLD_HTML が要る)は別に回す
- Playwright/Chromium の場所が違うときは `PLAYWRIGHT_MODULE`・`CHROMIUM_PATH` を指定

## 規則
- 作業ブランチは `codex/lifestory-v2-improvement`(または代表者の指定)。`ccr-2a73e5bf-wii4bj`(Claude Code の成果)を書き換えない・リセットしない
- main へのマージ・リポジトリの公開・ゲームの一般公開・販売・外部アップロード・有料 API は代表者の承認なしに行わない(追加費用0円)
- `city/original/` は編集禁止。既存ソースを削除しない
- 人物ID・建物ID・車両ID・職業/夢/資格の番号・セーブの互換を守る(`city/docs/SAVE_COMPAT.md`)。配列や職業は末尾にだけ足す
- モジュールは `city/src/modules/NNN_*.js` を `ORDER.txt` の順に連結する1つのIIFE。新しいモジュールは番号を付けて ORDER.txt に足す(`999_end.js` は最後)
- 試験の期待値を弱めない。合格を偽らない。Android 実機で確かめていないことは「未検証」と書く(PC の再現を実機の合格としない)
- 会話・表彰・エンディングは実際の記録(職歴・日記・人口の配列)だけを根拠にする。架空の実績を作らない
- 作業の終わりに `city/DEV_STATE.md`・`city/docs/unverified.md`・`city/docs/requirements_ledger.csv`・`city/docs/test_results.md`・`city/release/` を更新してコミット・プッシュする
- 秘密情報(APIキー・トークン・個人情報)をコミットしない
