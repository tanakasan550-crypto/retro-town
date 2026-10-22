  // src/stocks.js
  var COMPANIES = [
    { id: "aomi_rail", name: "\u9752\u6D77\u96FB\u9244(\u67B6\u7A7A)", px0: 1200, vol: 0.045, div: 0.018, beta: 0.7 },
    { id: "nagisa_fish", name: "\u306A\u304E\u3055\u6C34\u7523(\u67B6\u7A7A)", px0: 650, vol: 0.06, div: 0.015, beta: 0.9 },
    { id: "minato_log", name: "\u6E2F\u6E7E\u30ED\u30B8\u30B9\u30C6\u30A3\u30AF\u30B9(\u67B6\u7A7A)", px0: 980, vol: 0.055, div: 0.02, beta: 1.1 },
    { id: "hikari_elec", name: "\u3072\u304B\u308A\u96FB\u6A5F(\u67B6\u7A7A)", px0: 2100, vol: 0.09, div: 8e-3, beta: 1.5 },
    { id: "aomi_bank", name: "\u9752\u6D77\u9280\u884C(\u67B6\u7A7A)", px0: 800, vol: 0.05, div: 0.025, beta: 1 },
    { id: "kikyo_pharma", name: "\u6854\u6897\u88FD\u85AC(\u67B6\u7A7A)", px0: 1700, vol: 0.05, div: 0.012, beta: 0.6 },
    { id: "shiokaze_hotel", name: "\u6F6E\u98A8\u30DB\u30C6\u30EB\u30B0\u30EB\u30FC\u30D7(\u67B6\u7A7A)", px0: 900, vol: 0.08, div: 0.01, beta: 1.4 },
    { id: "minori_food", name: "\u307F\u306E\u308A\u98DF\u54C1(\u67B6\u7A7A)", px0: 1100, vol: 0.04, div: 0.022, beta: 0.5 }
  ];
  var LOT2 = 10;
  var FEE = 55e-4;
  var TAX2 = 0.2;
  function marketDrift(y, m0) {
    let d = 65e-4;
    if (y === 1990) d = -0.012;
    else if (y === 1991 || y === 1992) d = -0.015;
    else if (y === 1993 || y === 1994) d = -2e-3;
    else if (y === 2008) d = m0 >= 8 ? -0.07 : -0.012;
    else if (y === 2009) d = m0 < 3 ? -0.03 : 0.025;
    else if (y === 2020) d = m0 === 1 ? -0.04 : m0 === 2 ? -0.1 : m0 < 6 ? 0.03 : 0.012;
    else if (y >= 2013 && y <= 2017) d = 7e-3;
    return d;
  }
  function stkState(g) {
    var _a;
    return (_a = g.S).stk || (_a.stk = { M: g.S.M, px: Object.fromEntries(COMPANIES.map((c) => [c.id, c.px0 * (1 + 0)])), prev: {} });
  }
  function monthlyStocks(g) {
    const st3 = stkState(g);
    const y = g.year(), m0 = g.month0();
    const mk5 = marketDrift(y, m0);
    st3.prev = { ...st3.px };
    const mr = new Rng(g.S.seed, "stk:mkt:" + g.S.M);
    const mz = (mr.next() + mr.next() + mr.next() + mr.next() - 2) / 0.58;
    for (const c of COMPANIES) {
      const r = new Rng(g.S.seed, "stk:" + c.id + ":" + g.S.M);
      const z = (r.next() + r.next() + r.next() + r.next() - 2) / 0.58;
      const ret = Math.max(-0.45, c.beta * (mk5 + 0.025 * mz) + 0.55 * c.vol * z - 4e-4);
      st3.px[c.id] = Math.max(30, st3.px[c.id] * (1 + ret));
    }
    st3.M = g.S.M;
    const H4 = g.hero.stocks;
    if (H4 && (m0 === 2 || m0 === 8) && g.age() >= 18) {
      let tot = 0;
      for (const c of COMPANIES) {
        const h = H4[c.id];
        if (h && h.n > 0) tot += Math.round(h.n * st3.px[c.id] * g.pi() * c.div / 2);
      }
      if (tot > 0) g.earn(tot, "\u682A\u306E\u914D\u5F53\u91D1");
    }
  }
  var priceOf2 = (g, id) => Math.round(stkState(g).px[id] * g.pi());
  var changeOf = (g, id) => {
    const st3 = stkState(g);
    const p02 = st3.prev[id] || st3.px[id];
    return st3.px[id] / p02 - 1;
  };
  var getStocks = (h) => h.stocks || (h.stocks = {});
  function holdingsValue(g) {
    const H4 = g.hero.stocks;
    if (!H4) return 0;
    let v = 0;
    for (const c of COMPANIES) {
      const h = H4[c.id];
      if (h && h.n > 0) v += h.n * priceOf2(g, c.id);
    }
    return v;
  }
  function buyStock(g, id, lots = 1) {
    var _a;
    const c = COMPANIES.find((x) => x.id === id);
    if (!c) return { ok: false, msg: "" };
    if (g.age() < 18) return { ok: false, msg: "\u682A\u306E\u58F2\u8CB7\u306F18\u6B73\u304B\u3089\u3067\u3059" };
    const n2 = LOT2 * lots, px2 = priceOf2(g, id), cost = n2 * px2, fee = Math.max(g.yen(100), Math.round(cost * FEE));
    if (g.hero.money < cost + fee) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\u5FC5\u8981 \xA5${(cost + fee).toLocaleString("ja-JP")})` };
    g.pay(cost + fee, `\u682A\u306E\u8CFC\u5165(${c.name})`);
    const h = (_a = getStocks(g.hero))[id] || (_a[id] = { n: 0, cost: 0 });
    h.n += n2;
    h.cost += cost + fee;
    g.log("money", `${c.name}\u3092${n2}\u682A\u8CB7\u3063\u305F`);
    return { ok: true, msg: `${c.name}\u3092${n2}\u682A\u8CB7\u3044\u307E\u3057\u305F(\u624B\u6570\u6599 \xA5${fee.toLocaleString("ja-JP")})\u3002\u682A\u4FA1\u306F\u4E0A\u304C\u308B\u3053\u3068\u3082\u4E0B\u304C\u308B\u3053\u3068\u3082\u3042\u308A\u307E\u3059\u3002` };
  }
  function sellStock(g, id, lots = 1) {
    const c = COMPANIES.find((x) => x.id === id), h = g.hero.stocks?.[id];
    if (!c || !h || h.n <= 0) return { ok: false, msg: "\u6301\u3063\u3066\u3044\u307E\u305B\u3093" };
    const n2 = Math.min(h.n, LOT2 * lots), px2 = priceOf2(g, id), gross = n2 * px2, fee = Math.max(g.yen(100), Math.round(gross * FEE));
    const basis = h.cost * n2 / h.n;
    const gain = gross - fee - basis;
    const tax = gain > 0 ? Math.round(gain * TAX2) : 0;
    const net = gross - fee - tax;
    g.earn(net, `\u682A\u306E\u58F2\u5374(${c.name})`);
    h.cost -= basis;
    h.n -= n2;
    if (h.n <= 0) delete g.hero.stocks[id];
    g.log("money", `${c.name}\u3092${n2}\u682A\u58F2\u3063\u305F(\u640D\u76CA ${gain >= 0 ? "+" : ""}${Math.round(gain)}\u5186)`);
    return { ok: true, gain, msg: `${c.name}\u3092${n2}\u682A\u58F2\u308A\u307E\u3057\u305F\u3002${gain >= 0 ? `\u5229\u76CA\u306E20%(\xA5${tax.toLocaleString("ja-JP")})\u304C\u7A0E\u3068\u3057\u3066\u5F15\u304B\u308C\u307E\u3057\u305F\u3002` : `\u640D\u5931\u306F\xA5${Math.round(-gain).toLocaleString("ja-JP")}\u3067\u3057\u305F\u3002`}` };
  }

