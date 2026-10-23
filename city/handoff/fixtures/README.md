# 試験用の固定データ(架空のデータのみ・個人情報や秘密情報は含まない)

- `old_31f40a7.html` … 旧版(コミット 31f40a7)の単体HTML。旧セーブ互換の試験 `tools/scen/migrate.mjs` の `OLD_HTML` に使う。
  - 作り直しは `git worktree add /tmp/old 31f40a7 && python3 /tmp/old/city/tools/build.py` で、同じ SHA-256 になる(確認済み)。
- `sample_save_2006.json.gz` … 引継ぎ時点の版で作ったセーブ(新しい街・試験セッション・2005年から1年すすめた状態・人物67,499件)。
  - 中身は `Game.serialize()` を `nav.toJSON` で文字列にして gzip したもの。
  - 読み込み: `NLS.nav.Game.load(NLS.nav.fromJSON(<gunzip した文字列>))`。
  - 試験セッションのため、所持金は試験用の最大値になっている。
  - 作り直しは `tools/scen/_mksave.mjs`。
