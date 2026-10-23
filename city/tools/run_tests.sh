#!/usr/bin/env bash
# 全シナリオ試験を並列で回し、docs/test_results.md に結果(合格/不合格・最後の行)を書く。
# 使い方: python3 tools/build.py && bash tools/run_tests.sh   (JOBS=5 で並列数)
cd "$(dirname "$0")/.." || exit 1
OUTD=${OUTD:-/tmp/claude-0/tests}; JOBS=${JOBS:-5}; mkdir -p "$OUTD"
SKIP="lib compare survey dbg2 dbg3 nav_dbg probe life80 migrate mapview"
names=()
for f in tools/scen/*.mjs; do n=$(basename "$f" .mjs); case " $SKIP " in *" $n "*) continue;; esac; [[ $n == _* ]] && continue; names+=("$n"); done
for n in "${names[@]}"; do
  ( OUT="$OUTD/$n" timeout 600 node tools/shot.mjs "tools/scen/$n.mjs" > "$OUTD/$n.log" 2>&1 ) &
  while (( $(jobs -r | wc -l) >= JOBS )); do wait -n; done
done
wait
{
  echo "# 試験結果"; echo; echo "実行: $(date '+%Y-%m-%d %H:%M') / HTML: dist/index.html ($(stat -c %s dist/index.html) bytes) / コミット: $(git rev-parse --short HEAD)"; echo
  echo "| 試験 | 結果 | 最後の行 |"; echo "|---|---|---|"
  pass=0; fail=0
  for n in "${names[@]}"; do last=$(tail -n1 "$OUTD/$n.log" | tr '|' '/' | cut -c1-120); if [[ $last == "no errors" ]]; then r="合格"; pass=$((pass+1)); else r="**不合格**"; fail=$((fail+1)); fi; echo "| $n | $r | $last |"; done
  echo; echo "合格 $pass / 不合格 $fail(80年の通し回帰 life80 は別に実行: tools/scen/life80.mjs)"
} > docs/test_results.md
tail -n1 docs/test_results.md
