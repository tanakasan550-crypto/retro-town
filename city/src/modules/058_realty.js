  // src/realty.js
  var yenS2 = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  var estate = (h) => h.estate || (h.estate = { props: [], land: [], loans: [], reform: {}, deposit: 0, sold: {}, nextLand: 1 });
  var BROKER = (p) => Math.round((p * 0.03 + 6e4) * 1.1 / 1e3) * 1e3;
  var marketValue = (g, bi) => homePrice(g, g.bld(bi));
  function appraisal(g, bi) {
    const b = g.bld(bi), a = ageInfo(g, b);
    const li = landIndex(g, b), af = ageFactor(g, b);
    return { value: marketValue(g, bi), landIdx: +li.toFixed(2), ageF: +af.toFixed(2), built: a.built, age: a.age, effAge: a.eff, reform: a.rf, name: b.name, wa: b.wa || null, district: b.zone, brokerFee: BROKER(marketValue(g, bi)) };
  }
  function sellResidence(g) {
    const h = g.hero, E2 = estate(h);
    const bi = h.homeB;
    if (!h.owned.includes(bi)) return { ok: false, msg: "\u6301\u3061\u5BB6\u306B\u4F4F\u3093\u3067\u3044\u307E\u305B\u3093" };
    if (E2.sold[bi] && E2.sold[bi].M === g.S.M) return { ok: false, msg: "\u3059\u3067\u306B\u58F2\u5374\u306E\u624B\u7D9A\u304D\u4E2D\u3067\u3059" };
    const v = Math.round(marketValue(g, bi) * 0.97 / 1e3) * 1e3, fee = BROKER(v);
    const bal = h.mort && h.mort.bi === bi ? Math.round(h.mort.bal) : 0;
    h.owned = h.owned.filter((x) => x !== bi);
    if (h.mort && h.mort.bi === bi) h.mort = null;
    const net = v - fee - bal;
    if (net >= 0) g.earn(net, "\u4F4F\u5B85\u306E\u58F2\u5374");
    else g.pay(-net, "\u4F4F\u5B85\u306E\u58F2\u5374(\u30ED\u30FC\u30F3\u6B8B\u50B5\u30FB\u624B\u6570\u6599)");
    E2.sold[bi] = { M: g.S.M, price: v };
    h.flags.moveBy = g.S.M + 3;
    g.log("home", `\u6301\u3061\u5BB6(${g.bld(bi).name})\u3092\u58F2\u5374\u3057\u305F(${yenS2(v)}\u30FB\u624B\u53D6\u308A${yenS2(net)})\u30023\u304B\u6708\u4EE5\u5185\u306B\u6B21\u306E\u4F4F\u307E\u3044\u3078\u5F15\u3063\u8D8A\u3059(\u305D\u308C\u307E\u3067\u306F\u8CC3\u8CB8\u3067\u4EEE\u4F4F\u307E\u3044)`);
    return { ok: true, msg: `${g.bld(bi).name}\u3092${yenS2(v)}\u3067\u58F2\u5374\u3057\u307E\u3057\u305F(\u4EF2\u4ECB\u624B\u6570\u6599${yenS2(fee)}${bal ? `\u30FB\u6B8B\u50B5${yenS2(bal)}\u3092\u7CBE\u7B97` : ""}\u30FB\u624B\u53D6\u308A${yenS2(net)})\u3002\u5F15\u3063\u8D8A\u3057\u5148\u3092\u63A2\u3057\u307E\u3057\u3087\u3046(3\u304B\u6708\u4EE5\u5185)\u3002`, v, fee, bal, net };
  }
  function autoRelocate(g) {
    const h = g.hero;
    if (!h.flags.moveBy || g.S.M < h.flags.moveBy) return false;
    if (h.owned.includes(h.homeB)) {
      h.flags.moveBy = 0;
      return false;
    }
    const w = g.world;
    const cand = [];
    for (const t of ["apt", "house"]) for (const bi of w.resList[t]) {
      const b = w.map.buildings[bi];
      if (w.occ[bi] >= capOf(b) * 0.96 || bi === h.homeB) continue;
      cand.push(bi);
    }
    cand.sort((x, y) => g.rentOf(w.map.buildings[x]) - g.rentOf(w.map.buildings[y]) || w.dist(h.homeB, x) - w.dist(h.homeB, y));
    const nb = cand[0];
    if (nb == null) {
      h.flags.moveBy = g.S.M + 1;
      return false;
    }
    const group = [h.id];
    if (h.spouse != null) group.push(h.spouse);
    for (const k of h.kids) if (!w.pop.gone[k] && g.ageOf(k) < 18) group.push(k);
    for (const i of group) w.moveHome(i, nb);
    h.homeB = nb;
    h.homeIsParents = false;
    h.flags.moveBy = 0;
    g.S.stats.moves++;
    onMove(g, g.rentOf(w.map.buildings[nb]));
    g.log("move", `\u58F2\u5374\u3057\u305F\u5BB6\u304B\u3089${w.map.buildings[nb].name}\u3078\u5F15\u3063\u8D8A\u3057\u305F(\u5BB6\u65CF\u305D\u308D\u3063\u3066)`, { b: nb });
    g.syncWorldFlags();
    return true;
  }
  function onMove(g, newRent) {
    const E2 = estate(g.hero);
    if (E2.deposit > 0) {
      const back = Math.round(E2.deposit * 0.8);
      g.earn(back, "\u6577\u91D1\u306E\u8FD4\u9084");
    }
    E2.deposit = Math.round(newRent);
  }
  function investCandidates(g, limit = 8) {
    const h = g.hero, w = g.world, E2 = estate(h);
    const own = new Set(E2.props.map((p) => p.bi));
    const out = [];
    for (const t of ["apt", "house", "tower"]) for (const bi of w.resList[t]) {
      if (bi === h.homeB || own.has(bi)) continue;
      const b = w.map.buildings[bi];
      if (!w.occ[bi]) continue;
      out.push({ bi, name: b.name, type: t, price: marketValue(g, bi), rent: g.rentOf(b), d: w.dist(h.homeB, bi), zone: b.zone });
    }
    out.sort((a, c) => a.d - c.d);
    return out.slice(0, limit);
  }
  function investQuote(g, bi) {
    const price = marketValue(g, bi), r = loanRate(g.year()) + 5e-3, n2 = 300;
    const down = Math.round(price * 0.25), fees = BROKER(price), loan = price - down;
    return { price, down, fees, loan, rate: r, months: n2, pay: Math.round(pmt(loan, r, n2)), rent: g.rentOf(g.bld(bi)), yield: +(g.rentOf(g.bld(bi)) * 12 * 0.9 / price * 100).toFixed(1) };
  }
  function buyInvest(g, bi) {
    const h = g.hero, E2 = estate(h);
    if (g.age() < 20) return { ok: false, msg: "\u4E0D\u52D5\u7523\u6295\u8CC7\u306F20\u6B73\u304B\u3089\u3067\u3059" };
    if (bi === h.homeB || h.owned.includes(bi) || E2.props.some((p) => p.bi === bi)) return { ok: false, msg: "\u3059\u3067\u306B\u3042\u306A\u305F\u306E\u7269\u4EF6\u3067\u3059(\u307E\u305F\u306F\u81EA\u5B85\u3067\u3059)" };
    const q = investQuote(g, bi);
    const cash = h.money >= q.price + q.fees;
    const w = g.world;
    if (!cash) {
      if (!h.job || h.flags.partTime) return { ok: false, msg: "\u6295\u8CC7\u7528\u30ED\u30FC\u30F3\u306B\u306F\u6B63\u793E\u54E1\u306E\u5B89\u5B9A\u3057\u305F\u53CE\u5165\u304C\u5FC5\u8981\u3067\u3059" };
      if (h.money < q.down + q.fees) return { ok: false, msg: `\u982D\u91D1\u3068\u8AF8\u8CBB\u7528\u304C\u8DB3\u308A\u307E\u305B\u3093(\u5FC5\u8981 ${yenS2(q.down + q.fees)})` };
      if (E2.loans.length >= 3) return { ok: false, msg: "\u6295\u8CC7\u7528\u30ED\u30FC\u30F3\u306F3\u4EF6\u307E\u3067\u3067\u3059" };
      if ((h.mort ? h.mort.pay : 0) + E2.loans.reduce((s, l) => s + l.pay, 0) + q.pay > g.monthlyWage() * 0.6) return { ok: false, msg: "\u8FD4\u6E08\u306E\u5408\u8A08\u304C\u53CE\u5165\u306B\u5BFE\u3057\u3066\u91CD\u3059\u304E\u307E\u3059" };
    }
    g.pay(cash ? q.price + q.fees : q.down + q.fees, cash ? "\u8CC3\u8CB8\u7269\u4EF6\u306E\u8CFC\u5165(\u73FE\u91D1)" : "\u8CC3\u8CB8\u7269\u4EF6\u306E\u8CFC\u5165(\u982D\u91D1\u30FB\u8AF8\u8CBB\u7528)");
    const tenant = tenantOf(g, bi);
    E2.props.push({ bi, price: q.price, M0: g.S.M, tenant, vac: 0, kind: "buy" });
    if (!cash) E2.loans.push({ bi, bal: q.loan, rate: q.rate, pay: q.pay, left: q.months });
    g.log("home", `\u8CC3\u8CB8\u7269\u4EF6(${g.bld(bi).name})\u3092\u8CFC\u5165\u3057\u305F(${yenS2(q.price)}\u30FB\u60F3\u5B9A\u5BB6\u8CC3\u6708${yenS2(q.rent)})`, { b: bi });
    return { ok: true, msg: `${g.bld(bi).name}\u3092\u8CFC\u5165\u3057\u307E\u3057\u305F\u3002\u5165\u5C45\u8005\u304B\u3089\u5BB6\u8CC3\u304C\u5165\u308A\u307E\u3059\u3002`, q };
  }
  function tenantOf(g, bi) {
    const p = g.world.pop, h = g.hero;
    for (let i = 0; i < p.n; i++) if (p.home[i] === bi && !p.gone[i] && i !== h.id && ageYears(p, i, g.world.M) >= 20) return i;
    return -1;
  }
  function sellInvest(g, bi) {
    const h = g.hero, E2 = estate(h);
    const i = E2.props.findIndex((p) => p.bi === bi);
    if (i < 0) return { ok: false, msg: "\u305D\u306E\u7269\u4EF6\u306F\u6301\u3063\u3066\u3044\u307E\u305B\u3093" };
    const v = Math.round(marketValue(g, bi) * 0.96 / 1e3) * 1e3, fee = BROKER(v);
    const li = E2.loans.findIndex((l) => l.bi === bi);
    const bal = li >= 0 ? Math.round(E2.loans[li].bal) : 0;
    if (li >= 0) E2.loans.splice(li, 1);
    const net = v - fee - bal;
    E2.props.splice(i, 1);
    E2.sold[bi] = { M: g.S.M, price: v };
    if (net >= 0) g.earn(net, "\u8CC3\u8CB8\u7269\u4EF6\u306E\u58F2\u5374");
    else g.pay(-net, "\u8CC3\u8CB8\u7269\u4EF6\u306E\u58F2\u5374(\u30ED\u30FC\u30F3\u6B8B\u50B5)");
    g.log("home", `\u8CC3\u8CB8\u7269\u4EF6(${g.bld(bi).name})\u3092\u58F2\u5374\u3057\u305F(\u624B\u53D6\u308A${yenS2(net)})`);
    return { ok: true, msg: `${g.bld(bi).name}\u3092\u58F2\u5374\u3057\u307E\u3057\u305F(\u624B\u53D6\u308A${yenS2(net)})\u3002`, net };
  }
  var DIST = [["downtown", "\u9752\u6D77\u4E2D\u592E"], ["shotengai", "\u662D\u548C\u753A"], ["suburb_n", "\u685C\u30F6\u4E18"], ["suburb_e", "\u7DD1\u753A"], ["port", "\u6F6E\u898B"], ["farm", "\u307F\u306E\u308A\u91CE"]];
  function landOffers(g) {
    const E2 = estate(g.hero);
    const y = g.year();
    const out = [];
    for (let k = 0; k < 6; k++) {
      const id = (y - 1900) * 10 + k;
      if (E2.land.some((l) => l.id === id) || E2.sold["L" + id]) continue;
      const [z, nm] = DIST[hash2(id, 6001) % DIST.length];
      const area = 90 + hash2(id, 6002) % 17 * 10;
      const ppm = Math.round(g.yen(6e4 * zoneK(z) * landCurve(y)) / 1e3) * 1e3;
      out.push({ id, zone: z, dist: nm, area, ppm, price: area * ppm });
    }
    return out;
  }
  function landValue(g, l) {
    const y = g.year();
    return Math.round(l.area * g.yen(6e4 * zoneK(l.zone) * landCurve(y)) / 1e3) * 1e3;
  }
  function buyLand(g, id) {
    const h = g.hero, E2 = estate(h);
    const o = landOffers(g).find((x) => x.id === id);
    if (!o) return { ok: false, msg: "\u305D\u306E\u571F\u5730\u306F\u3082\u3046\u3042\u308A\u307E\u305B\u3093" };
    if (g.age() < 20) return { ok: false, msg: "\u571F\u5730\u306E\u8CFC\u5165\u306F20\u6B73\u304B\u3089\u3067\u3059" };
    const fee = BROKER(o.price);
    if (h.money < o.price + fee) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\u5FC5\u8981 ${yenS2(o.price + fee)})` };
    g.pay(o.price + fee, `\u571F\u5730\u306E\u8CFC\u5165(${o.dist} ${o.area}\u33A1)`);
    E2.land.push({ id, zone: o.zone, dist: o.dist, area: o.area, price: o.price, M0: g.S.M });
    g.log("home", `${o.dist}\u306E\u571F\u5730(${o.area}\u33A1)\u3092\u8CFC\u5165\u3057\u305F(${yenS2(o.price)})`);
    return { ok: true, msg: `${o.dist}\u306E\u571F\u5730\u3092\u8CFC\u5165\u3057\u307E\u3057\u305F\u3002` };
  }
  function sellLand(g, id) {
    const E2 = estate(g.hero);
    const i = E2.land.findIndex((l2) => l2.id === id);
    if (i < 0) return { ok: false, msg: "\u305D\u306E\u571F\u5730\u306F\u6301\u3063\u3066\u3044\u307E\u305B\u3093" };
    const l = E2.land[i];
    const v = landValue(g, l), fee = BROKER(v);
    E2.land.splice(i, 1);
    E2.sold["L" + id] = { M: g.S.M, price: v };
    g.earn(v - fee, `\u571F\u5730\u306E\u58F2\u5374(${l.dist})`);
    g.log("home", `${l.dist}\u306E\u571F\u5730\u3092\u58F2\u5374\u3057\u305F(${yenS2(v)})`);
    return { ok: true, msg: `\u571F\u5730\u3092${yenS2(v)}\u3067\u58F2\u5374\u3057\u307E\u3057\u305F(\u624B\u6570\u6599${yenS2(fee)})\u3002`, net: v - fee };
  }
  var REFORMS = [{ id: 1, name: "\u5C0F\u898F\u6A21(\u6C34\u56DE\u308A\u30FB\u5185\u88C5)", cost: 12e5, yrs: 8 }, { id: 2, name: "\u5927\u898F\u6A21(\u5168\u9762\u6539\u88C5)", cost: 45e5, yrs: 20 }, { id: 3, name: "\u548C\u98A8\u306E\u4FEE\u7E55(\u74E6\u30FB\u8305\u306E\u847A\u304D\u66FF\u3048\u3001\u7573\u30FB\u969C\u5B50\u30FB\u7E01\u5074)", cost: 28e5, yrs: 14, wa: true }];
  function reform(g, bi, level) {
    const h = g.hero, E2 = estate(h);
    const rf = REFORMS.find((r) => r.id === level);
    if (!rf) return { ok: false, msg: "" };
    const mine = h.owned.includes(bi) || E2.props.some((p) => p.bi === bi);
    if (!mine) return { ok: false, msg: "\u81EA\u5206\u306E\u7269\u4EF6\u3067\u306F\u3042\u308A\u307E\u305B\u3093" };
    if (rf.wa && !g.bld(bi).wa) return { ok: false, msg: "\u65E5\u672C\u5BB6\u5C4B\u3067\u306F\u3042\u308A\u307E\u305B\u3093" };
    const wk = { kaya: 1.6, machiya: 1.25, garden: 1.3 }[g.bld(bi).wa] || 1;
    const cost = g.yen(rf.cost * (rf.wa ? wk : 1));
    if (h.money < cost) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(${yenS2(cost)})` };
    const cur2 = E2.reform[bi] || { yrs: 0, n: 0 };
    const before = marketValue(g, bi);
    g.pay(cost, `\u30EA\u30D5\u30A9\u30FC\u30E0(${rf.name})`);
    E2.reform[bi] = { yrs: Math.min(40, cur2.yrs + rf.yrs), n: cur2.n + 1, M: g.S.M };
    const after = marketValue(g, bi);
    g.log("home", `${g.bld(bi).name}\u3092\u30EA\u30D5\u30A9\u30FC\u30E0\u3057\u305F(${rf.name}\u30FB${yenS2(cost)})`);
    return { ok: true, msg: `${rf.name}\u3092\u3057\u307E\u3057\u305F(\u6642\u4FA1 ${yenS2(before)} \u2192 ${yenS2(after)})\u3002`, before, after, cost };
  }
  function monthlyRealty(g) {
    const h = g.hero, E2 = h.estate;
    const w = g.world;
    if (h.flags.moveBy) autoRelocate(g);
    if (h.homeIsParents) estate(h).parentB = h.homeB;
    else if (h.estate) inheritParentsHome(g);
    if (h.owned.includes(h.homeB) && !h.homeIsParents) {
      const t = g.bld(h.homeB).type;
      if (t === "apt" || t === "tower") g.pay(Math.round(marketValue(g, h.homeB) * 25e-4 / 12 + g.yen(8e3)), "\u7BA1\u7406\u8CBB\u30FB\u4FEE\u7E55\u7A4D\u7ACB\u91D1");
    }
    if (!E2) return;
    for (const p of E2.props.slice()) {
      const b = g.bld(p.bi), rent = g.rentOf(b);
      const ok = p.tenant >= 0 && !w.pop.gone[p.tenant] && w.pop.home[p.tenant] === p.bi;
      if (!ok) {
        if (p.vac <= 0 && p.tenant >= 0) p.vac = 2;
        p.tenant = -1;
        if (p.vac > 0) p.vac--;
        if (p.vac <= 0) {
          const t = tenantOf(g, p.bi);
          if (t >= 0) {
            p.tenant = t;
            g.log("home", `${b.name}\u306B\u65B0\u3057\u3044\u5165\u5C45\u8005\u304C\u6C7A\u307E\u3063\u305F`);
          }
        }
      }
      if (p.tenant >= 0) g.earn(Math.round(rent * 0.93), `\u5BB6\u8CC3\u53CE\u5165(${b.name})`);
      g.pay(Math.round(marketValue(g, p.bi) * 0.014 / 12 + rent * 0.07), `\u56FA\u5B9A\u8CC7\u7523\u7A0E\u30FB\u7BA1\u7406\u8CBB(${b.name})`);
    }
    for (const l of E2.loans.slice()) {
      const intr = l.bal * l.rate / 12, pay = Math.min(l.pay, l.bal + intr);
      g.pay(pay, "\u6295\u8CC7\u7528\u30ED\u30FC\u30F3\u8FD4\u6E08");
      l.bal = Math.max(0, l.bal - (pay - intr));
      l.left--;
      if (l.bal < 1 || l.left <= 0) E2.loans.splice(E2.loans.indexOf(l), 1);
    }
    for (const l of E2.land) g.pay(Math.round(landValue(g, l) * 25e-4 / 12 * 1.4), "\u571F\u5730\u306E\u56FA\u5B9A\u8CC7\u7523\u7A0E");
  }
  function estateSummary(g) {
    const h = g.hero, E2 = estate(h);
    const own = h.owned.filter((b) => b !== h.homeB || !h.homeIsParents).reduce((s, b) => s + marketValue(g, b), 0);
    const prop = E2.props.reduce((s, p) => s + marketValue(g, p.bi), 0), land = E2.land.reduce((s, l) => s + landValue(g, l), 0);
    const debt = E2.loans.reduce((s, l) => s + l.bal, 0) + (h.mort ? h.mort.bal : 0);
    return { own, prop, land, debt, net: own + prop + land - debt };
  }
  function inheritParentsHome(g) {
    const h = g.hero, E2 = estate(h), p = g.world.pop;
    if (E2.inherited || h.homeIsParents) return null;
    if (!(p.gone[h.mother] && p.gone[h.father])) return null;
    E2.inherited = 1;
    const bi = E2.parentB != null ? E2.parentB : p.home[h.mother] >= 0 ? p.home[h.mother] : p.home[h.father];
    if (bi == null || bi < 0 || bi === h.homeB || E2.props.some((q) => q.bi === bi)) return null;
    let heirs = 0;
    for (let k = 0; k < p.n; k++) if (p.mother[k] === h.mother && !p.gone[k]) heirs++;
    heirs = Math.max(1, heirs);
    ;
    const v = marketValue(g, bi), base = g.yen(3e7 + 6e6 * heirs);
    const share = Math.round(v / heirs / 1e3) * 1e3;
    const tax = share > base / heirs ? Math.round((share - base / heirs) * 0.12 / 1e3) * 1e3 : 0;
    if (tax) g.pay(tax, "\u76F8\u7D9A\u7A0E");
    E2.props.push({ bi, price: share, M0: g.S.M, tenant: -1, vac: 2, kind: "inherit", share: heirs });
    g.log("home", `\u5B9F\u5BB6(${g.bld(bi).name})\u3092\u76F8\u7D9A\u3057\u305F(\u6642\u4FA1${yenS2(v)}${heirs > 1 ? `\u30FB${heirs}\u4EBA\u3067\u5206\u3051\u3066${yenS2(share)}` : ""}${tax ? `\u30FB\u76F8\u7D9A\u7A0E${yenS2(tax)}` : "\u30FB\u57FA\u790E\u63A7\u9664\u306E\u7BC4\u56F2\u3067\u76F8\u7D9A\u7A0E\u306A\u3057"})\u3002\u4F4F\u3080\u30FB\u8CB8\u3059\u30FB\u58F2\u308B\u3092\u9078\u3079\u308B`);
    return { bi, v, tax };
  }
  HOOK.onMove = onMove;

