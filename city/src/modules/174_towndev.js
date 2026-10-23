  // src/towndev.js — 住民の実際の記録から決まる街の発展(毎年1月・乱数を使わない)。
  // 根拠は人口の配列(在籍している学校・住まい・年齢・勤め先)だけ。決めたことは w.dev に根拠つきで残し(セーブに保存)、
  // 建物の歴史(b.history)と街のニュース(newsLog)にも書く。
  //   ・学校: 在籍者が定員(先生の数×20人。幼稚園は保育士×15人)の110%を2年続けて超えたら増築(1階ふやす・最大+2)
  //           50%を下回る年が3年続いたら「学級を減らした」と記録(建物は残す・定員を半分にして以後を判定・1度だけ)
  //   ・介護施設・病院: 半径60マスの80歳以上の人数が施設あたり120人を超えたら増築(介護施設)・病棟を増やす(病院)
  //   ・閉まった店: 半径30マスに住む人が250人以上なら、次の年に店が入る(空き店舗の解消)。どの店かは記録に残す
  var DEV_CAP_K = { kinder: ["childcare", 15], elem: ["teacher", 20], jh: ["teacher", 20], hs: ["teacher", 20] };
  var DEV_SHOPS = /* @__PURE__ */ new Set(["shop", "ramen", "restaurant", "cafe", "clothes", "bookstore", "izakaya", "fishshop", "greengrocer", "liquor"]);
  function devCap(b) {
    const k = DEV_CAP_K[b.type];
    if (!k) return 0;
    const n2 = (BTYPES[b.type].slots || {})[k[0]] || 0;
    return Math.round(n2 * k[1] * (1 + 0.5 * (b.devFl || 0)) * (b.devLess ? 0.5 : 1));
  }
  function townDev(w, y) {
    const p = w.pop, B2 = w.map.buildings, M = w.M;
    if (!w.dev) w.dev = [];
    const stu = new Int32Array(B2.length), res = new Int32Array(B2.length);
    const old = [];
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i]) continue;
      if (p.school[i] >= 0) stu[p.school[i]]++;
      if (p.home[i] >= 0) {
        res[p.home[i]]++;
        if (M - p.born[i] >= 960) old.push(p.home[i]);
      }
    }
    let n2 = 0;
    const log = (b, kind, text, ev) => {
      w.dev.push({ y, b: b.idx, kind, text, ev });
      if (b.history) b.history.push({ y, text: `${y}年 ${text}(根拠: ${ev})` });
      w.newsLog.push({ y, kind: "town", text: `${b.name}: ${text}`, b: b.idx });
      n2++;
    };
    // 学校
    for (const b of B2) {
      const cap = devCap(b);
      if (!cap || b.status === "closed") continue;
      const r = stu[b.idx] / cap;
      b.devOver = r > 1.1 ? (b.devOver || 0) + 1 : 0;
      b.devUnder = r < 0.5 ? (b.devUnder || 0) + 1 : 0;
      if (b.devOver >= 2 && (b.devFl || 0) < 2) {
        b.devFl = (b.devFl || 0) + 1;
        b.nf = Math.max(b.nf || 0, (b.floors || 2)) + 1;
        b.devOver = 0;
        log(b, "school_ext", "校舎を増築した(1階ふやした)", `在籍 ${stu[b.idx]}人・定員 ${cap}人を2年続けて超えた`);
      } else if (b.devUnder >= 3 && !b.devLess) {
        // 1度だけ(学級を半分にした定員で、そのあとを判定する)
        b.devUnder = 0;
        b.devLess = 1;
        log(b, "school_less", "学級を減らした", `在籍 ${stu[b.idx]}人・定員 ${cap}人の半分未満が3年続いた`);
      }
    }
    // 介護施設・病院: 近くの80歳以上
    const care = B2.filter((b) => (b.type === "nursing" || b.type === "hospital") && b.status !== "closed");
    if (care.length && old.length) {
      const near = new Int32Array(B2.length);
      for (const h of old) {
        const hb = B2[h];
        let best = -1, bd = 61;
        for (const c of care) {
          const d = Math.abs(c.doorX - hb.doorX) + Math.abs(c.doorY - hb.doorY);
          if (d < bd) {
            bd = d;
            best = c.idx;
          }
        }
        if (best >= 0) near[best]++;
      }
      for (const c of care) {
        const lim = c.type === "hospital" ? 600 : 120, k = c.type === "hospital" ? "ward" : "care_ext";
        if (near[c.idx] > lim * (1 + (c.devFl || 0)) && (c.devFl || 0) < 2) {
          c.devFl = (c.devFl || 0) + 1;
          c.nf = Math.max(c.nf || 0, c.floors || 1) + 1;
          log(c, k, c.type === "hospital" ? "病棟を増やした" : "介護施設を増築した", `近くに住む80歳以上 ${near[c.idx]}人(1施設の目安 ${lim}人)`);
        }
      }
    }
    // 空き店舗: 近くに住む人が多ければ、店が入る
    for (const b of B2) {
      if (!DEV_SHOPS.has(b.type) || b.status !== "closed" || b.campusOf != null) continue;
      let r = 0;
      for (const q of B2) if (res[q.idx] && Math.abs(q.doorX - b.doorX) + Math.abs(q.doorY - b.doorY) < 30) r += res[q.idx];
      if (r < 250) continue;
      const old2 = b.name;
      b.status = "open";
      const nm0 = rngPickStable(SHOP_PREFIX, b.idx * 31 + y) + BTYPES[b.type].label;
      b.name = typeof shopOpenName === "function" ? shopOpenName(w.map, b, nm0) : nm0;
      b.nameSim = 1;
      b.openYear = y;
      b.era = y < 1975 ? 0 : y < 2e3 ? 1 : 2;
      log(b, "shop_open", `空き店舗に開店した(前の店: ${old2})`, `半径30マスに住む人 ${r}人`);
    }
    // オフィスビルの入居企業の入れ替わり(tenants.js)
    if (typeof tenantTurnover === "function") tenantTurnover(w, y, log);
    // 増築した建物の管理(受付・警備)などの職の枠を、その年のうちに足す(セーブを読み直したときと同じ枠になるように)
    if (typeof w.extendSlots === "function") w.extendSlots();
    if (w.dev.length > 600) w.dev.splice(0, w.dev.length - 600);
    return n2;
  }
  var rngPickStable = (arr, k) => arr[uh(k, 913) % arr.length];
  // 主人公の住む地区の、最近の街の発展(人物・日記で使う)
  function devRecent(w, n2 = 8) {
    return (w.dev || []).slice(-n2).reverse().map((e) => ({ ...e, name: (w.map.buildings[e.b] || {}).name }));
  }
