# Phase 0 — 正本・ソース・美術の確定(2026-10-23)

## 正本
- 開発基準: `original/lifestory_v11_single.html`(SHA256 は `original/SHA256SUMS`)。
- `src/` は v11 単体HTMLをモジュール単位に分割したもの。`tools/build.py` で単体HTML(画像・音・プログラム内蔵)を再生成。
- 受領した `changed_sources_v11.zip` は変更ソース3本+文書のみ(`original/v11_changed_sources/`)。
  **プロジェクト全体(tools/svgchar・tests・SVG原画・esbuild設定)はこの環境に存在しない。** 単体HTMLに埋め込まれた生成済みの素材とバンドル済みコードが唯一の実体。

## 美術(実画面での確認)
| 項目 | 生成元 | 画面で使われているか | 確認方法 |
|---|---|---|---|
| 人物(2頭身) | `assets/parts/atlas_0.png` + `index.json`(SVG由来パーツの書き出し)を `compose.js`/`render.js drawLife` が合成 | **使用中**(lifeOn=true・parts読込済み。屋外で drawLife 7回/0回: cast・旧シート・legacy) | 描画関数の呼び出し計数(tools/scen 相当の試験) |
| 旧方式(人物シート) | `charSheet`/`drawCharLegacy` | 使われない(`?old=1` でのみ) | 同上 |
| 建物外観 | `isobld.js`・`archpaint.js`・`isospecial.js` の手続き描画(SVG由来の色・部材規則をコード化) | 使用中 | 画面撮影 |
| 建物PNG `assets/buildings/*.png` | 旧トップダウン用 | アイソメ表示では未使用(`?top=1` のみ) | `R.iso=true` |
| 街の小物 | `assets/props.png/json` | 使用中(`A.props`) | |

- SVG原画・書き出しツールは手元に無いため、「原画→PNG→単体HTML」の再書き出しはこの環境では不可能。
  以後の美術改善は (1) 埋め込み済みパーツの活用、(2) 手続き描画(建物・乗り物・看板)の改良、で行う。
- 旧方式への復帰は無し(既定は新方式)。

## セーブ互換
- 追加した保存項目はすべて任意(無くても読める): `S.hotel` `S.rail` `S.railIn` `S.hq` `S.sdTicket` `S.tpDay` `S.aqDay` `S.homeUnit` `b.planNf`(bdyn) `S.onBus` `S.busWait` `S.ctrip`(バス乗車中に保存した場合、読み込み時は最寄りの停留所で降りた状態になる)。
- GAME_ID / SCHEMA_VERSION / 既存フィールドは変更なし。地図v1〜v3は不変。v4は生成結果を変えず、生成後の追加処理(階数の補正など)は決定的。
