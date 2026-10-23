# 最新版の保存場所

- `lifestory_city_v2.html` … 試遊用の単体HTML(画像・音・プログラム内蔵)。
  - Claude Code → Codex 引継ぎ時点の版。ソースは `ccr-2a73e5bf-wii4bj` のコミット(`../handoff/HANDOFF_TEST_REPORT.md` に記載)。
  - 地図v4は `?city=4`(既定)。SHA256 は `SHA256SUMS`。
  - 試験の結果は `../handoff/HANDOFF_TEST_REPORT.md`。
- `archive/` … 前の試遊用HTML(消さずに残す)。
  - `lifestory_city_v2_23e944e.html`: 版 23e944e・全46試験と80年の通し回帰に合格した時点。
- ソースのバックアップ
  - `backup_src_31f40a7.zip`(版 31f40a7 のソース)。
  - このブランチそのもの。
  - 引継ぎ一式の ZIP(`CODEX_HANDOFF_FULL.zip`)。
- 施設監査 … `docs/audit_facilities.csv`・`docs/audit_summary.json`・`docs/audit_sheets/*.jpg`。元の画像は作業環境の `audit_out/`(大きいのでリポジトリには入れていない。引継ぎでは別の ZIP)。
- 未完成・未検証 … `docs/unverified.md`・`docs/FEATURE_STATUS.md`

一般公開は HOLD。main への統合はしていません。Android 実機は未検証です。
