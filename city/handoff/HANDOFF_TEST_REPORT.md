# HANDOFF_TEST_REPORT — 引継ぎ前の試験結果

作成: 2026-10-23(Claude Code → GPT Codex 引継ぎ)

## 対象

- ブランチ: `ccr-2a73e5bf-wii4bj`
- 試験を実行した時点のコミット: `16004f8`
  - これ以降のコミットは、引継ぎの文書・チェックサム・固定データだけ。ゲームのソース(`src/`)は変えていない。
  - ゲームのソースが最後に変わったのはコミット `f276a66`。その後は `tools/shot.mjs` の Playwright の場所の指定と、文書だけを変えている。
- 試験した単体HTML: `release/lifestory_city_v2.html`
  - SHA-256 `88ec9b08aac97ec6c0e2da97a16e6b703650cda1e1b4101158d6020d6bfdcb88`
  - 6,123,850 バイト・181モジュール
  - `python3 tools/build.py` で作り直すと同じ SHA-256 になる(確認済み)。
- 環境
  - Linux(クラウドの作業環境)
  - Node v22.22.0・Python 3.13.16
  - Playwright 1.56.1 の Chromium(ヘッドレス・Pixel 7 横画面 915×412・swiftshader)

## 結果(引継ぎ時点の単体HTMLで実行して再現できたもの)

| 試験 | 結果 |
|---|---|
| 全試験 `tools/run_tests.sh`(4並列) | **合格 59 / 不合格 0** |
| 旧セーブ移行 `migrate.mjs` | **合格**(旧版 31f40a7 で作ったセーブを読み込む。no errors) |
| 80年の人生 `life80.mjs` | **合格**(no errors) |
| 80年の性能 `perf.mjs` | **合格**(各10年でセーブの往復が一致 same:true) |

- `perf.mjs` は、同じ SHA-256 の単体HTMLで、引継ぎの直前に実行したもの。

### 80年の実測(perf.mjs・この作業環境)

```
PERF {"y":2015,"n":71243,"alive":29588,"cap":90000,"outKin":12106,"simMs":15466,"heapMB":156,"saveKB":20533,"saveMs":582,"loadMs":7619,"same":true}
PERF {"y":2025,"n":75939,"alive":29582,"cap":90000,"outKin":7731,"simMs":16531,"heapMB":127,"saveKB":22554,"saveMs":727,"loadMs":7297,"same":true}
PERF {"y":2035,"n":84719,"alive":29576,"cap":90000,"outKin":9237,"simMs":16710,"heapMB":213,"saveKB":24705,"saveMs":699,"loadMs":7579,"same":true}
PERF {"y":2045,"n":95699,"alive":29573,"cap":135000,"outKin":12004,"simMs":16290,"heapMB":266,"saveKB":27273,"saveMs":715,"loadMs":10092,"same":true}
PERF {"y":2055,"n":106262,"alive":29575,"cap":135000,"outKin":13432,"simMs":17989,"heapMB":258,"saveKB":29579,"saveMs":865,"loadMs":7949,"same":true}
PERF {"y":2065,"n":116505,"alive":29579,"cap":135000,"outKin":14149,"simMs":16988,"heapMB":179,"saveKB":31618,"saveMs":831,"loadMs":7411,"same":true}
PERF {"y":2069,"n":121128,"alive":29555,"cap":135000,"outKin":14470,"simMs":8297,"heapMB":276,"saveKB":32523,"saveMs":801,"loadMs":7379,"same":true}
STORE {"jsonMB":31.8,"gzMB":6,"idb":{"ok":true,"ms":9913}}
```

- 10年の計算: 約16〜18秒(以前の版は同じ環境で約14.8秒)
- セーブ: 32.5MB(gzip 6MB)
- 読み込み: 約7.5秒
- 生きている住民: 約29,600人
- 人物の記録: 約12万件(故人・市外の親族を含む)
- 夢の試験 dreams.mjs(30年)
  - 先生にあこがれて先生になった人: 282人
  - 30年後のセーブ: 24.2MB

### 全試験の内訳

| 試験 | 結果 | 最後の行 |
|---|---|---|
| aptunits | 合格 | no errors |
| aq | 合格 | no errors |
| bath | 合格 | no errors |
| bigsites | 合格 | no errors |
| bus2 | 合格 | no errors |
| busin | 合格 | no errors |
| campus | 合格 | no errors |
| campuslife | 合格 | no errors |
| capacity | 合格 | no errors |
| classroom | 合格 | no errors |
| commute | 合格 | no errors |
| compare2 | 合格 | no errors |
| devcheck | 合格 | no errors |
| dreams | 合格 | no errors |
| elemland | 合格 | no errors |
| enter | 合格 | no errors |
| fly | 合格 | no errors |
| foods | 合格 | no errors |
| funeral | 合格 | no errors |
| ho | 合格 | no errors |
| hotel | 合格 | no errors |
| houses | 合格 | no errors |
| hud | 合格 | no errors |
| island | 合格 | no errors |
| jobaudit | 合格 | no errors |
| joy | 合格 | no errors |
| kinout | 合格 | no errors |
| kinvisit | 合格 | no errors |
| ledger | 合格 | no errors |
| leisure | 合格 | no errors |
| lifesphere | 合格 | no errors |
| metro | 合格 | no errors |
| names | 合格 | no errors |
| nav1 | 合格 | no errors |
| nav2 | 合格 | no errors |
| nav3 | 合格 | no errors |
| popcap | 合格 | no errors |
| pubfac | 合格 | no errors |
| relocate | 合格 | no errors |
| retail | 合格 | no errors |
| reunion | 合格 | no errors |
| save | 合格 | no errors |
| sd | 合格 | no errors |
| sites | 合格 | no errors |
| st | 合格 | no errors |
| stpeople | 合格 | no errors |
| street | 合格 | no errors |
| talk | 合格 | no errors |
| tap | 合格 | no errors |
| tap11 | 合格 | no errors |
| tenantlife | 合格 | no errors |
| tenants | 合格 | no errors |
| tour | 合格 | no errors |
| towndev | 合格 | no errors |
| tp | 合格 | no errors |
| trip | 合格 | no errors |
| works | 合格 | no errors |
| zoo | 合格 | no errors |
| zooout | 合格 | no errors |

合格 59 / 不合格 0(80年の通し回帰 life80 は別に実行: tools/scen/life80.mjs)

## 未検証(実行できなかったもの・人の確認が要るもの)

- **Android 実機**(操作・音・速さ・メモリ・セーブ): 未検証。
  - すべて PC のヘッドレス Chromium での再現。
  - 実機の試遊で不具合A〜Dが見つかっている(`CODEX_HANDOFF.md` §8)。
- 音の実際の聞こえ方。試験は字幕と音の状態の記録で確認している。
- 施設監査の全件撮影。
  - 監査の表は版 b3ea4c9 のまま。
  - 住宅・飲食店・小売・職場の中を作り直した後に、撮り直していない。
- 見た目の良し悪し。代表の画像を数枚ずつ目で見ただけ。
- 実際のブラウザで、IndexedDB の容量の上限まで長く遊んだときの動き。
- 前の開発(v11)の試験 `tests/*.mjs`・`ui_*.py`(台帳の L/C/D 行の根拠に書かれているもの)。
  - このリポジトリには無く、今回は実行していない。

## 注意

- 全試験の途中で `tools/shot.mjs` を変えた。
  - 変更内容: Playwright と Chromium の場所を、環境変数で指定できるようにした。既定値は前と同じ。
  - 全試験の後半はこの版で実行した。動きは同じ。
- 全試験は4並列で約1時間。
  - 並列を増やすと、起動待ち(150秒)を超えて落ちることがある(以前に tap11 で一度)。
  - これは試験の中身の失敗ではない。
