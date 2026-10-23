# 最新版の保存場所

- `lifestory_city_v2.html` … 単体HTML(画像・音・プログラム内蔵)。地図v4は `?city=4`。SHA256 は `SHA256SUMS`
- ソースのバックアップ … このブランチ(ccr-2a73e5bf-wii4bj)そのもの。ZIP が要るときは `git archive --format=zip -o backup.zip HEAD city`(リポジトリの外に出しません)
- 施設監査 … `docs/audit_facilities.csv`(全5,530施設・撮影/未撮影と理由)・`docs/audit_summary.json`・`docs/audit_sheets/*.jpg`(撮影した951枚の縮小一覧)。元の画像の ZIP は作業環境の `audit_out/`(大きいのでリポジトリには入れていません)
- 試験結果 … `docs/test_results.md`・80年の通し回帰は `tools/scen/life80.mjs`
- 未完成・未検証 … `docs/unverified.md`

一般公開は HOLD・main への統合はしていません。
