  // src/hair.js
  var SALON_KINDS = [
    { k: "salon", n: "\u7F8E\u5BB9\u5BA4", mul: 1, svc: "all", era: 1965 },
    { k: "barber", n: "\u7406\u5BB9\u5BA4", mul: 0.8, svc: "men", era: 0 },
    { k: "discount", n: "\u683C\u5B89\u30AB\u30C3\u30C8", mul: 0.38, svc: "cut", era: 1995 },
    { k: "luxury", n: "\u9AD8\u7D1A\u30B5\u30ED\u30F3", mul: 3.2, svc: "all", era: 1985 },
    { k: "oldbarber", n: "\u753A\u306E\u5E8A\u5C4B", mul: 0.7, svc: "men", era: 0 },
    { k: "kids", n: "\u30AD\u30C3\u30BA\u30D8\u30A2", mul: 0.7, svc: "kids", era: 1990 },
    { k: "total", n: "\u30D8\u30A2&\u30D3\u30E5\u30FC\u30C6\u30A3", mul: 1.4, svc: "all", era: 1980 }
  ];
  var SHOP_PRE = ["\u30DF\u30E2\u30B6", "\u30EB\u30CA", "\u30BD\u30E9", "\u30EA\u30DC\u30F3", "\u30CF\u30CA", "\u30A2\u30F3", "\u30DF\u30EB\u30AF", "\u30D6\u30FC\u30B1"];
  function salonName(b, cur2) {
    const K3 = salonKind(b), old = K3.k === "barber" || K3.k === "oldbarber";
    return (old ? cur2 && !/理容室|床屋/.test(cur2) ? cur2.slice(0, 3) : cur2 ? cur2.slice(0, 3) : "\u307E\u3061" : SHOP_PRE[hash2(b.idx, 4419) % SHOP_PRE.length]) + (K3.k === "salon" ? "\u7F8E\u5BB9\u5BA4" : K3.n);
  }
  function assignSalons(map2) {
    for (const b of map2.buildings) {
      if (b.type !== "shop" || b.salon || b.spec && ![22, 26, 27, 28].includes(b.spec)) continue;
      if (hash2(b.idx, 4417) % 3 !== 0) continue;
      const ks = SALON_KINDS.filter((q) => q.k !== "kids" || hash2(b.idx, 4420) % 3 === 0);
      const K3 = ks[hash2(b.idx, 4418) % ks.length];
      b.salon = { k: K3.k };
      b.name = salonName(b, b.name);
    }
  }
  var salonKind = (b) => b && b.salon ? SALON_KINDS.find((q) => q.k === b.salon.k) : null;
  var S = (key, n2, from = 0, to = 9999, grp = [2]) => ({ key, n: n2, from, to, grp });
  var STYLES = [
    S("short", "\u89D2\u5208\u308A", 0, 1999),
    S("short", "\u30B7\u30E7\u30FC\u30C8", 1975),
    S("short", "\u30D9\u30EA\u30FC\u30B7\u30E7\u30FC\u30C8", 2e3),
    S("short", "\u574A\u3061\u3083\u3093\u5208\u308A", 0, 9999, [1]),
    S("spiky", "\u30C4\u30F3\u30C4\u30F3\u30D8\u30A2", 1995),
    S("swept", "\u4E03\u4E09\u5206\u3051", 0),
    S("swept", "\u30C4\u30FC\u30D6\u30ED\u30C3\u30AF", 2012),
    S("side", "\u30B5\u30A4\u30C9\u30D1\u30FC\u30C8", 0),
    S("fringe", "\u3071\u3063\u3064\u3093\u524D\u9AEA", 1985),
    S("curly", "\u30D1\u30F3\u30C1\u30D1\u30FC\u30DE", 1965, 1992),
    S("curly", "\u3086\u308B\u3075\u308F\u30D1\u30FC\u30DE", 1996),
    S("bob", "\u30DC\u30D6", 0),
    S("bobkid", "\u304A\u304B\u3063\u3071", 0, 9999, [1]),
    S("long", "\u30ED\u30F3\u30B0", 0),
    S("ponytail", "\u30DD\u30CB\u30FC\u30C6\u30FC\u30EB", 0),
    S("pixie", "\u30D4\u30AF\u30B7\u30FC", 1992),
    S("bun", "\u304A\u56E3\u5B50", 2003),
    S("twin", "\u30C4\u30A4\u30F3\u30C6\u30FC\u30EB", 2e3, 9999, [1, 2]),
    S("bowl", "\u30DE\u30C3\u30B7\u30E5", 2014),
    S("bowl", "\u30DE\u30C3\u30B7\u30E5\u30EB\u30FC\u30E0", 1965, 1978),
    S("bald", "\u30B9\u30AD\u30F3\u30D8\u30C3\u30C9", 1985),
    S("fringe", "\u3071\u3063\u3064\u3093(\u3053\u3069\u3082)", 0, 9999, [1]),
    S("side", "\u3055\u308F\u3084\u304B(\u3053\u3069\u3082)", 0, 9999, [1]),
    S("twin", "\u30C4\u30A4\u30F3\u30C6\u30FC\u30EB(\u3053\u3069\u3082)", 0, 9999, [1])
  ];
  var DYES = [["\u9ED2", "#1c1a1e"], ["\u30C0\u30FC\u30AF\u30D6\u30E9\u30A6\u30F3", "#4a3224"], ["\u30D6\u30E9\u30A6\u30F3", "#7a5233"], ["\u30A2\u30C3\u30B7\u30E5", "#8a8a90"], ["\u30D6\u30ED\u30F3\u30C9", "#d6b46a"], ["\u8D64\u8336", "#8c3a2c"], ["\u30D4\u30F3\u30AF", "#e48aa8"], ["\u30D6\u30EB\u30FC", "#4a74c8"]];
  var SERVICES = [
    { id: "cut", n: "\u30AB\u30C3\u30C8", p: 3200, m: 50, who: "all" },
    { id: "kidcut", n: "\u30AD\u30C3\u30BA\u30AB\u30C3\u30C8", p: 1800, m: 30, who: "kid" },
    { id: "bangs", n: "\u524D\u9AEA\u30AB\u30C3\u30C8", p: 800, m: 15, who: "adult" },
    { id: "buzz", n: "\u574A\u4E3B\u30FB\u4E38\u5208\u308A", p: 1500, m: 20, who: "all" },
    { id: "len", n: "\u9577\u3055\u3092\u5909\u3048\u308B(\u4F38\u3070\u3059/\u6574\u3048\u308B)", p: 2800, m: 40, who: "adult" },
    { id: "perm", n: "\u30D1\u30FC\u30DE", p: 8e3, m: 120, who: "adult" },
    { id: "straight", n: "\u7E2E\u6BDB\u77EF\u6B63", p: 12e3, m: 150, who: "adult" },
    { id: "color", n: "\u30AB\u30E9\u30FC", p: 6e3, m: 90, who: "adult" },
    { id: "gray", n: "\u767D\u9AEA\u67D3\u3081", p: 5500, m: 80, who: "adult" },
    { id: "set", n: "\u30BB\u30C3\u30C8\u30FB\u7D50\u3044\u4E0A\u3052", p: 4500, m: 40, who: "adult" },
    { id: "beard", n: "\u3072\u3052\u3092\u6574\u3048\u308B", p: 1200, m: 20, who: "man" },
    { id: "shave", n: "\u30B7\u30A7\u30FC\u30D3\u30F3\u30B0(\u3072\u3052\u5243\u308A)", p: 1500, m: 20, who: "man" },
    { id: "elder", n: "\u30B7\u30CB\u30A2\u30AB\u30C3\u30C8(\u30B7\u30E3\u30F3\u30D7\u30FC\u4ED8\u304D)", p: 2600, m: 45, who: "senior" }
  ];
  var grpOf = (age) => age < 13 ? 1 : 2;
  function servicesFor(g, b, age, man) {
    const K3 = salonKind(b) || SALON_KINDS[0];
    const gr = grpOf(age);
    const mul = K3.mul;
    return SERVICES.filter((s) => (s.who === "all" || s.who === "kid" && gr === 1 || s.who === "adult" && gr === 2 || s.who === "man" && gr === 2 && man !== false || s.who === "senior" && age >= 65) && (K3.svc === "all" || K3.svc === "cut" && ["cut", "kidcut", "buzz", "bangs"].includes(s.id) || K3.svc === "men" && ["cut", "kidcut", "buzz", "bangs", "len", "beard", "shave", "elder", "perm", "color", "gray"].includes(s.id) || K3.svc === "kids" && ["kidcut", "cut", "bangs"].includes(s.id))).map((s) => ({ ...s, price: Math.max(300, Math.round(g.yen(s.p * mul) / 100) * 100), min: s.m }));
  }
  var stylesFor = (year, age) => STYLES.filter((s) => s.grp.includes(grpOf(age)) && year >= s.from && year <= s.to);
  var GROW = { bald: ["short", 2], short: ["swept", 6], spiky: ["swept", 6], pixie: ["bob", 8], bob: ["long", 14], bowl: ["side", 8], fringe: ["side", 10], curly: ["side", 12], swept: ["side", 9] };
  function hairNow(hd, M, age) {
    if (!hd || age < 3) return null;
    const mo = Math.max(0, M - (hd.m || 0));
    let key = hd.key;
    const gr = GROW[key];
    if (gr && mo >= gr[1] && !hd.noGrow) key = gr[0];
    if (HAIR_KEYS.indexOf(key) < 0) key = hd.key;
    const roots = hd.col ? Math.min(1, Math.max(0, (M - (hd.cm ?? hd.m ?? 0) - 4) / 14)) : 0;
    return { key, col: hd.col || null, roots, facial: hd.facial === void 0 ? void 0 : hd.facial, shaveM: hd.shaveM };
  }
  function npcHair(g, id) {
    return g.S.hairNpc && g.S.hairNpc[id] || null;
  }
  function hairFor(g, id, age) {
    const hd = id === g.hero.id ? g.hero.hairdo : npcHair(g, id);
    return hd ? hairNow(hd, g.S.M, age) : null;
  }
  function quote(g, b, age, man, sel) {
    const L2 = servicesFor(g, b, age, man);
    const items = (sel.svc || []).map((id) => L2.find((s) => s.id === id)).filter(Boolean);
    return { items, total: items.reduce((a, s) => a + s.price, 0), minutes: items.reduce((a, s) => a + s.min, 0) };
  }
  function doHair(g, b, sel, id = g.hero.id) {
    var _a, _b;
    const age = g.age();
    const man = sel.man;
    const q = quote(g, b, age, man, sel);
    if (!q.items.length) return { ok: false, msg: "\u30E1\u30CB\u30E5\u30FC\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044" };
    if (g.S.hairBusy) return { ok: false, msg: "\u65BD\u8853\u4E2D\u3067\u3059" };
    if (g.hero.money < q.total) return { ok: false, msg: `\u6240\u6301\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\u5408\u8A08 \xA5${q.total.toLocaleString("ja-JP")})` };
    g.S.hairBusy = true;
    try {
      const hd = { ...g.hero.hairdo || {} };
      const year = g.year();
      const ids = q.items.map((s) => s.id);
      const M = g.S.M;
      const st3 = sel.style != null ? stylesFor(year, age)[sel.style] : null;
      if (ids.some((x) => ["cut", "kidcut", "len", "set", "perm", "straight", "buzz", "elder", "bangs"].includes(x)) || st3) {
        let key = st3 ? st3.key : hd.key || sel.curKey || "short";
        if (ids.includes("buzz")) key = "bald";
        if (ids.includes("perm") && !st3) key = "curly";
        if (ids.includes("straight") && key === "curly") key = "side";
        if (ids.includes("len") && !st3 && !ids.includes("buzz")) key = GROW[key] ? GROW[key][0] : "long";
        hd.key = key;
        hd.m = M;
        hd.name = st3 ? st3.n : void 0;
        hd.noGrow = false;
      }
      if (ids.includes("color") || ids.includes("gray")) {
        const d = DYES[sel.dye ?? 1];
        hd.col = ids.includes("gray") && sel.dye == null ? DYES[1][1] : d[1];
        hd.colName = ids.includes("gray") && sel.dye == null ? DYES[1][0] : d[0];
        hd.cm = M;
        if (!hd.key) {
          hd.key = sel.curKey || "short";
          hd.m = M;
        }
      }
      if (ids.includes("beard") && sel.facial) hd.facial = sel.facial;
      if (ids.includes("shave")) {
        hd.facial = "";
        hd.shaveM = M;
      }
      g.hero.hairdo = hd;
      g.pay(q.total, `\u7406\u7F8E\u5BB9: ${q.items.map((s) => s.n).join("\u30FB")}`);
      g.advance(q.minutes);
      const ch = g.chg({ charm: 1 + q.items.length * 0.3, mood: 4 });
      g.log("shop", `${b.name}\u3067${q.items.map((s) => s.n).join("\u30FB")}\u3092\u3057\u305F`);
      ((_a = g.S).hairLog || (_a.hairLog = [])).push([M, b.idx, q.total]);
      if (g.S.hairLog.length > 120) g.S.hairLog.shift();
      ((_b = g.S).salonSales || (_b.salonSales = {}))[b.idx] = (g.S.salonSales[b.idx] || 0) + q.total;
      return { ok: true, msg: `${q.items.map((s) => s.n).join("\u30FB")}\u3092\u7D42\u3048\u307E\u3057\u305F(\xA5${q.total.toLocaleString("ja-JP")})\u3002${ch}`, total: q.total };
    } finally {
      g.S.hairBusy = false;
    }
  }
  function monthlySalon(world, g) {
    const out = /* @__PURE__ */ new Map();
    const B2 = world.map.buildings;
    const sal = B2.filter((b) => b.salon && b.status !== "closed");
    if (!sal.length) return out;
    const pop = world.pop;
    const n2 = pop.n || pop.home.length;
    const key = sal.map((b) => b.idx).join(",");
    if (world._salonKey !== key) {
      world._salonKey = key;
      world._salonNear = /* @__PURE__ */ new Map();
    }
    const near2 = (hb) => {
      let r = world._salonNear.get(hb);
      if (r === void 0) {
        const hh = B2[hb];
        let best = sal[0], bd = 1e9;
        for (const b of sal) {
          const d = Math.abs(b.doorX - (hh ? hh.doorX : 0)) + Math.abs(b.doorY - (hh ? hh.doorY : 0));
          if (d < bd) {
            bd = d;
            best = b;
          }
        }
        r = best;
        world._salonNear.set(hb, r);
      }
      return r;
    };
    for (let id = 0; id < n2; id++) {
      if (pop.gone[id] || pop.home[id] < 0) continue;
      if (hash2(id * 7 + g.S.M, 4431) % 2 !== 0) continue;
      const b = near2(pop.home[id]);
      const K3 = salonKind(b);
      const r = out.get(b.idx) || { visits: 0, sales: 0 };
      r.visits++;
      r.sales += Math.round(g.yen(3200 * K3.mul) / 100) * 100;
      out.set(b.idx, r);
    }
    return out;
  }
  var nearestSalon = (g, b) => {
    let best = null, bd = 1e9;
    for (const s of g.world.map.buildings) {
      if (!s.salon || s.status === "closed") continue;
      const d = Math.abs(s.doorX - b.doorX) + Math.abs(s.doorY - b.doorY);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best;
  };
  function visit(g, id, age, salon, cut = true) {
    var _a, _b;
    const S2 = (_a = g.S).hairNpc || (_a.hairNpc = {});
    const hd = S2[id] || (S2[id] = { hist: [] });
    const M = g.S.M, yr = g.year();
    const K3 = salonKind(salon) || SALON_KINDS[0];
    const price = Math.max(300, Math.round(g.yen((age < 13 ? 1800 : 3200) * K3.mul) / 100) * 100);
    const st3 = stylesFor(yr, age);
    if (cut && st3.length) {
      const s = st3[hash2(id * 31 + M, 4440) % st3.length];
      hd.key = s.key;
      hd.m = M;
      hd.noGrow = false;
    }
    if (age >= 14 && hash2(id * 13 + M, 4441) % 9 === 0) {
      hd.col = DYES[hash2(id, M + 7) % DYES.length][1];
      hd.cm = M;
    } else if (age >= 55 && hash2(id + M, 4442) % 3 === 0) {
      hd.col = DYES[1][1];
      hd.cm = M;
    }
    hd.hist.push([M, salon.idx, price]);
    if (hd.hist.length > 6) hd.hist.shift();
    ((_b = g.S).salonSales || (_b.salonSales = {}))[salon.idx] = (g.S.salonSales[salon.idx] || 0) + price;
    return price;
  }
  function monthlyHair(g) {
    var _a;
    const h = g.hero, W2 = g.world;
    if (!W2.map.buildings.some((b) => b.salon)) return 0;
    let n2 = 0;
    const fam = /* @__PURE__ */ new Set();
    const agg = monthlySalon(W2, g);
    g.S.salonSalesM = {};
    let totV = 0;
    for (const [bi, r] of agg) {
      g.S.salonSalesM[bi] = r;
      ((_a = g.S).salonSales || (_a.salonSales = {}))[bi] = (g.S.salonSales[bi] || 0) + r.sales;
      totV += r.visits;
    }
    g.S.salonVisitsM = totV;
    if (h.job && h.job.jobId === "hairdresser") {
      const r = g.S.salonSalesM[h.job.b];
      const key = salonKey(g.bld(h.job.b));
      const lic = hasLic(g, key);
      const lv = Math.min(5, Math.floor((h.skills ? h.skills.styling || 0 : 0) / 20));
      if (lic && r) {
        const c = Math.round(r.sales * (0.03 + 5e-3 * lv));
        if (c > 0) g.earn(c, "\u6307\u540D\u6B69\u5408\u30FB\u6280\u8853\u624B\u5F53");
      }
      if (lic && h.job.role === "chief") g.earn(g.yen(5e4), "\u5E97\u9577\u624B\u5F53");
      if (lic && isKanri(g, key) && g.S.salonSalesM[h.job.b] && r.visits > 40) g.earn(g.yen(2e4), key === "barber" ? "\u7BA1\u7406\u7406\u5BB9\u5E2B\u624B\u5F53" : "\u7BA1\u7406\u7F8E\u5BB9\u5E2B\u624B\u5F53");
      g.S.hairAssist = lic ? 0 : 1;
    }
    if (h.spouse != null) fam.add(h.spouse);
    for (const k of Object.keys(h.rel || {})) {
      const r = h.rel[k];
      if (r.family) fam.add(+k);
    }
    const home = W2.map.buildings[h.homeB] || W2.map.buildings[0];
    for (const id of fam) {
      if (W2.pop.gone[id]) continue;
      const age = g.ageOf(id);
      if (age < 3) continue;
      const every2 = age < 13 ? 2 : 3;
      if (hash2(id * 5 + g.S.M, 4450) % every2 !== 0) continue;
      const sl = nearestSalon(g, home);
      if (!sl) continue;
      const p = visit(g, id, age, sl);
      n2++;
      if (id === h.spouse || age < 13 && h.children && h.children.includes && h.children.includes(id)) {
        g.pay(p, "\u5BB6\u65CF\u306E\u7406\u7F8E\u5BB9");
      }
    }
    if (W2.lives) for (const id of W2.lives.keys()) {
      if (fam.has(id) || W2.pop.gone[id] || id === h.id) continue;
      if (hash2(id * 3 + g.S.M, 4451) % 10 !== 0) continue;
      const age = g.ageOf(id);
      if (age < 3) continue;
      const hb = W2.map.buildings[W2.pop.home[id]];
      const sl = hb && nearestSalon(g, hb);
      if (sl) {
        visit(g, id, age, sl);
        n2++;
      }
    }
    g.S.hairVisitsMonth = n2;
    return n2;
  }

