  // src/business.js
  var biz = (g) => g.hero.biz || null;
  var MAX_STAFF = 4;
  function monthlyReport(g, b = biz(g)) {
    const hours = g.S.m.biz || 0;
    const staff = b.staff;
    const demand = 1500 * (0.4 + b.rep / 100) * (b.season ?? 1), cap2 = (hours + 160 * staff) * 10;
    const sold2 = Math.max(0, Math.min(demand, cap2));
    const rev = sold2 * g.yen(900), mat = rev * 0.52, wage = staff * g.yen(17e4), fixed = g.yen(9e4);
    return { demand: Math.round(demand), cap: Math.round(cap2), sold: Math.round(sold2), rev: Math.round(rev), cost: Math.round(mat + wage + fixed), profit: Math.round(rev - mat - wage - fixed), hours };
  }
  function setupBiz(g) {
    const B2 = g.world.map.buildings;
    const cand = B2.filter((b) => ["shop", "greengrocer", "liquor", "fishshop", "bookstore", "clothes"].includes(b.type));
    const st3 = g.world.map.stations.find((s) => s.id === "showacho") || g.world.map.stations[0];
    cand.sort((a, c) => Math.abs(a.doorX - st3.door.x) + Math.abs(a.doorY - st3.door.y) - (Math.abs(c.doorX - st3.door.x) + Math.abs(c.doorY - st3.door.y)));
    const shop = cand[0];
    g.hero.biz = { b: shop.idx, name: shop.name, gen: 4, rep: 45, staff: 1, ad: 0, reno: -99, heir: 0, months: 0, loss: 0, state: "open", last: null };
    g.log("biz", `${g.hero.name}\u306F\u5275\u696D${g.hero.biz.gen}\u4EE3\u7D9A\u304F\u5BB6\u696D\u300C${shop.name}\u300D\u3092\u7D99\u3044\u3060\u3002`);
    return g.hero.biz;
  }
  function standShop(g) {
    const b = biz(g), h = g.hero;
    if (!b || b.state !== "open") return { ok: false, msg: "\u5E97\u306F\u3042\u308A\u307E\u305B\u3093" };
    if (h.stats.energy < 15) return { ok: false, msg: "\u75B2\u308C\u3059\u304E\u3066\u3044\u307E\u3059\u3002\u4F11\u307F\u307E\u3057\u3087\u3046\u3002" };
    if (g.blocked()) return { ok: false, msg: "\u5148\u306B\u76EE\u306E\u524D\u306E\u51FA\u6765\u4E8B\u3092\u7247\u3065\u3051\u307E\u3057\u3087\u3046" };
    g.advance(60);
    g.S.m.biz = (g.S.m.biz || 0) + 1;
    h.stats.energy = Math.max(0, h.stats.energy - 4.5);
    h.stats.hunger = Math.max(0, h.stats.hunger - 1.5);
    g.S.stats.workHours = (g.S.stats.workHours || 0) + 1;
    const rng = g.actRng("shop");
    let extra = "";
    if (rng.next() < 0.22) {
      b.rep = Math.min(100, b.rep + 0.15);
      extra = ["\n\u306A\u3058\u307F\u306E\u304A\u5BA2\u3055\u3093\u304C\u7B11\u9854\u3067\u5E30\u3063\u3066\u3044\u3063\u305F\u3002", "\n\u300C\u3053\u3053\u306E\u304C\u4E00\u756A\u300D\u3068\u8A00\u3063\u3066\u3082\u3089\u3048\u305F\u3002", "\n\u521D\u3081\u3066\u306E\u304A\u5BA2\u3055\u3093\u304C\u5E38\u9023\u306B\u306A\u308A\u305D\u3046\u3060\u3002"][rng.int(3)];
    }
    return { ok: true, msg: `\u5E97\u306B\u7ACB\u3061\u307E\u3057\u305F\u3002(\u4ECA\u6708 ${g.S.m.biz}\u6642\u9593)` + extra };
  }
  function adjust(g, what) {
    const b = biz(g), h = g.hero;
    if (!b || b.state !== "open") return { ok: false, msg: "" };
    if (what === "hire") {
      if (b.staff >= MAX_STAFF) return { ok: false, msg: `\u5F93\u696D\u54E1\u306F${MAX_STAFF}\u4EBA\u307E\u3067\u3067\u3059` };
      b.staff++;
      return { ok: true, msg: `\u5F93\u696D\u54E1\u3092\u96C7\u3044\u307E\u3057\u305F(${b.staff}\u4EBA)` };
    }
    if (what === "fire") {
      if (b.staff <= 0) return { ok: false, msg: "\u5F93\u696D\u54E1\u306F\u3044\u307E\u305B\u3093" };
      b.staff--;
      return { ok: true, msg: `\u5F93\u696D\u54E1\u3092\u6E1B\u3089\u3057\u307E\u3057\u305F(${b.staff}\u4EBA)` };
    }
    if (what === "ad") {
      const c = g.yen(5e4);
      if (b.adM === g.S.M) return { ok: false, msg: "\u5E83\u544A\u306F\u6708\u306B1\u56DE\u307E\u3067\u3067\u3059" };
      if (h.money < c) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${c.toLocaleString("ja-JP")})` };
      g.pay(c, "\u5E97\u306E\u5E83\u544A");
      b.adM = g.S.M;
      b.rep = Math.min(100, b.rep + 2);
      return { ok: true, msg: "\u5E83\u544A\u3092\u51FA\u3057\u307E\u3057\u305F(\u8A55\u5224+2)" };
    }
    if (what === "reno") {
      const c = g.yen(8e5);
      if (g.S.M - b.reno < 24) return { ok: false, msg: "\u6539\u88C5\u306F2\u5E74\u306B1\u5EA6\u307E\u3067\u3067\u3059" };
      if (h.money < c) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${c.toLocaleString("ja-JP")})` };
      g.pay(c, "\u5E97\u306E\u6539\u88C5");
      b.reno = g.S.M;
      b.rep = Math.min(100, b.rep + 6);
      g.log("biz", `\u300C${b.name}\u300D\u3092\u6539\u88C5\u3057\u305F`);
      return { ok: true, msg: "\u5E97\u3092\u6539\u88C5\u3057\u307E\u3057\u305F(\u8A55\u5224+6)" };
    }
    if (what === "teach") {
      const kid = h.kids.find((k) => !g.world.pop.gone[k] && g.ageOf(k) >= 10);
      if (kid == null) return { ok: false, msg: "\u5E97\u3092\u6559\u3048\u3089\u308C\u308B\u5E74\u3054\u308D\u306E\u5B50\u3069\u3082\u304C\u3044\u307E\u305B\u3093(10\u6B73\u301C)" };
      if (b.teachM === g.S.M) return { ok: false, msg: "\u4ECA\u6708\u306F\u3082\u3046\u6559\u3048\u307E\u3057\u305F" };
      g.advance(120);
      b.teachM = g.S.M;
      b.heir = Math.min(24, b.heir + 1);
      return { ok: true, msg: `${g.nameOf(kid)}\u306B\u5E97\u306E\u4ED5\u4E8B\u3092\u6559\u3048\u307E\u3057\u305F(\u5F8C\u7D99\u8005\u306E\u7FD2\u719F ${b.heir}/12)` };
    }
    if (what === "close") {
      b.state = "closed";
      g.log("biz", `\u300C${b.name}\u300D\u3092\u7573\u3093\u3060`);
      return { ok: true, msg: "\u5E97\u3092\u7573\u307F\u307E\u3057\u305F" };
    }
    return { ok: false, msg: "" };
  }
  function monthlyBiz(g) {
    const b = biz(g);
    if (!b || b.state !== "open") return;
    const rp = monthlyReport(g, b);
    b.last = rp;
    b.months++;
    if (rp.profit >= 0) g.earn(rp.profit, "\u5E97\u306E\u5229\u76CA");
    else g.pay(-rp.profit, "\u5E97\u306E\u8D64\u5B57");
    const hrs = rp.hours;
    b.rep = Math.max(0, Math.min(100, b.rep + Math.min(1.6, hrs / 75) - (hrs < 40 ? 0.5 : 0.1) + (rp.sold < rp.demand * 0.9 ? -0.3 : 0.1)));
    b.season = [0.9, 0.85, 0.95, 1, 1, 1, 1.05, 1.1, 1, 1, 1.05, 1.25][(g.date().m0 + 1) % 12];
    b.loss = rp.profit < 0 ? b.loss + 1 : 0;
    if (b.loss >= 12 && g.hero.debt > g.yen(15e5)) {
      b.state = "closed";
      g.log("biz", `\u8D64\u5B57\u304C\u7D9A\u304D\u3001\u300C${b.name}\u300D\u306F\u5E97\u3092\u9589\u3058\u308B\u3053\u3068\u306B\u306A\u3063\u305F`);
    }
  }

