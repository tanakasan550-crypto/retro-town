  // src/carbiz.js
  var yenS3 = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  var getLoans = (h) => h.carLoans || (h.carLoans = []);
  var loanRate2 = (y) => y < 1995 ? 0.06 : y < 2005 ? 0.045 : y < 2020 ? 0.03 : 0.035;
  function appraise(g, c, channel = "usedshop") {
    const base = usedValue(g, c);
    const m = MODEL[c.model];
    const y = g.year();
    const age = Math.max(0, y - c.my);
    const accN = c.accs || 0, rep = c.rep && g.S.M < c.rep.until;
    const f2 = { \u5E74\u5F0F: age, \u8D70\u884C: Math.round(c.odo), \u72B6\u614B: Math.round(c.cond), \u4E8B\u6545\u6B74: accN };
    let k = channel === "dealer" ? 0.9 : 0.8;
    k *= 1 - Math.min(0.2, accN * 0.07);
    if (rep) k *= 0.75;
    if (c.lapsed) k *= 0.92;
    const price = Math.max(g.yen(1e4), Math.round(base * k / 1e3) * 1e3);
    const loan = getLoans(g.hero).find((l) => l.uid === c.uid);
    const bal = loan ? Math.round(loan.bal) : 0;
    return { price, base, factors: f2, loanBal: bal, net: price - bal, name: carName(c), model: m.name, channel };
  }
  function sellCarEx(g, uid, channel = "usedshop", why = "\u8ECA\u306E\u58F2\u5374") {
    const h = g.hero, v = getCars(h);
    v.soldUids || (v.soldUids = {});
    if (v.soldUids[uid]) return { ok: false, msg: "\u3053\u306E\u8ECA\u306F\u3059\u3067\u306B\u58F2\u5374\u6E08\u307F\u3067\u3059" };
    const i = v.cars.findIndex((c2) => c2.uid === uid);
    if (i < 0) return { ok: false, msg: "\u305D\u306E\u8ECA\u306F\u6301\u3063\u3066\u3044\u307E\u305B\u3093" };
    const c = v.cars[i], a = appraise(g, c, channel);
    v.soldUids[uid] = { M: g.S.M, price: a.price, ch: channel };
    v.cars.splice(i, 1);
    if (v.ride === "car" && v.cur === uid) v.ride = null;
    if (v.cur === uid) v.cur = v.cars.length ? v.cars[v.cars.length - 1].uid : null;
    const L2 = getLoans(h), li = L2.findIndex((l) => l.uid === uid);
    if (li >= 0) L2.splice(li, 1);
    const left = Math.max(0, c.insM - g.S.M);
    let refund2 = 0;
    if (left > 0 && !c.lapsed) refund2 = Math.round(insPremium(g, c, MODEL[c.model].cls) * left / 12 * 0.5 / 100) * 100;
    if (a.net >= 0) g.earn(a.net, `${why}: ${a.name}`);
    else g.pay(-a.net, `${why}(\u30ED\u30FC\u30F3\u6B8B\u50B5\u306E\u7CBE\u7B97): ${a.name}`);
    if (refund2) g.earn(refund2, `\u81EA\u52D5\u8ECA\u4FDD\u967A\u306E\u89E3\u7D04\u8FD4\u623B(${a.name})`);
    c.parked = null;
    c.owner = "sold";
    g.log("sell", `\u8ECA\u3092\u58F2\u3063\u305F: ${a.name}(${yenS3(a.price)}${a.loanBal ? `\u30FB\u6B8B\u50B5${yenS3(a.loanBal)}\u3092\u7CBE\u7B97` : ""})`);
    return { ok: true, msg: `${a.name}\u3092${yenS3(a.price)}\u3067${channel === "dealer" ? "\u4E0B\u53D6\u308A\u306B\u51FA\u3057\u307E\u3057\u305F" : "\u58F2\u308A\u307E\u3057\u305F"}${a.loanBal ? `(\u30ED\u30FC\u30F3\u6B8B\u50B5 ${yenS3(a.loanBal)} \u3092\u7CBE\u7B97)` : ""}\u3002`, price: a.price, net: a.net, refund: refund2 };
  }
  function quote2(g, price, { tradeUid = null, loanYears = 0 } = {}) {
    const h = g.hero, v = getCars(h);
    let trade = null;
    if (tradeUid != null) {
      const c = v.cars.find((q) => q.uid === tradeUid);
      if (c) trade = appraise(g, c, "dealer");
    }
    const credit = trade ? trade.net : 0, due = price - credit;
    const wage = g.monthlyWage ? g.monthlyWage() : 0;
    const out = { price, trade, due, loan: null, cash: due, ok: true, msg: "" };
    if (loanYears > 0) {
      const down = Math.max(0, Math.round(due * 0.2 / 1e3) * 1e3), principal = Math.max(0, due - down), r = loanRate2(g.year()), n2 = loanYears * 12, i = r / 12;
      const pay = principal ? Math.round(principal * i / (1 - Math.pow(1 + i, -n2))) : 0;
      out.loan = { down, principal, rate: r, months: n2, pay };
      out.cash = down;
      if (!h.job || h.flags.partTime) {
        out.ok = false;
        out.msg = "\u30ED\u30FC\u30F3\u306B\u306F\u6B63\u793E\u54E1\u306E\u5B89\u5B9A\u3057\u305F\u53CE\u5165\u304C\u5FC5\u8981\u3067\u3059";
      } else if (pay > wage * 0.4) {
        out.ok = false;
        out.msg = `\u8FD4\u6E08\u984D(\u6708${yenS3(pay)})\u304C\u53CE\u5165\u306B\u5BFE\u3057\u3066\u91CD\u3059\u304E\u307E\u3059(\u7D66\u4E0E\u306E40%\u307E\u3067)`;
      } else if (getLoans(h).length >= 2) {
        out.ok = false;
        out.msg = "\u8ECA\u306E\u30ED\u30FC\u30F3\u306F\u540C\u6642\u306B2\u4EF6\u307E\u3067\u3067\u3059";
      }
    }
    if (out.ok && h.money < out.cash) {
      out.ok = false;
      out.msg = `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\u5FC5\u8981 ${yenS3(Math.max(0, out.cash))})`;
    }
    return out;
  }
  function finish(g, buyFn, price, opts) {
    const q = quote2(g, price, opts);
    if (!q.ok) return { ok: false, msg: q.msg };
    const h = g.hero;
    const before = h.money;
    let sold2 = null;
    if (opts.tradeUid != null) {
      sold2 = sellCarEx(g, opts.tradeUid, "dealer", "\u4E0B\u53D6\u308A");
      if (!sold2.ok) return sold2;
    }
    if (q.loan) h.money += q.loan.principal;
    const r = buyFn();
    if (!r.ok) {
      if (q.loan) h.money -= q.loan.principal;
      return r;
    }
    if (q.loan && q.loan.principal > 0) getLoans(h).push({ uid: r.car.uid, bal: q.loan.principal, rate: q.loan.rate, pay: q.loan.pay, left: q.loan.months, missed: 0 });
    r.trade = sold2;
    r.quote = q;
    void before;
    return r;
  }
  function buyNewEx(g, modelId, gradeIdx, color, dealerIdx, opts = {}) {
    const c0 = canOwn(g);
    if (!c0.ok) return c0;
    const m = MODEL[modelId];
    if (!m || !modelOnSale(m, g.year())) return { ok: false, msg: "\u3053\u306E\u8ECA\u7A2E\u306F\u73FE\u5728\u8CA9\u58F2\u3057\u3066\u3044\u307E\u305B\u3093" };
    const price = newPrice(g, m, (GRADES[gradeIdx] || GRADES[0]).k);
    return finish(g, () => buyNew(g, modelId, gradeIdx, color, dealerIdx), price, opts);
  }
  function buyUsedEx(g, lotItem, dealerIdx, opts = {}) {
    const c0 = canOwn(g);
    if (!c0.ok) return c0;
    const st3 = usedLot(g, dealerIdx).find((x) => x.lot === lotItem.lot);
    if (!st3) return { ok: false, msg: "\u3053\u306E\u8ECA\u306F\u3082\u3046\u58F2\u308C\u3066\u3057\u307E\u3063\u305F\u3088\u3046\u3067\u3059" };
    return finish(g, () => buyUsed(g, lotItem, dealerIdx), st3.price, opts);
  }
  function monthlyCarBiz(g) {
    const h = g.hero, v = h.veh;
    if (!v || !v.cars) return;
    const L2 = getLoans(h);
    for (const l of L2.slice()) {
      const c = v.cars.find((q) => q.uid === l.uid);
      if (!c) {
        L2.splice(L2.indexOf(l), 1);
        continue;
      }
      const intr = l.bal * l.rate / 12, pay = Math.min(l.pay, l.bal + intr);
      if (h.money >= pay) {
        g.pay(pay, `\u81EA\u52D5\u8ECA\u30ED\u30FC\u30F3\u8FD4\u6E08(${carName(c)})`);
        l.bal = Math.max(0, l.bal - (pay - intr));
        l.left--;
        l.missed = 0;
        if (l.bal < 1 || l.left <= 0) {
          L2.splice(L2.indexOf(l), 1);
          g.log("car", `${carName(c)}\u306E\u30ED\u30FC\u30F3\u3092\u5B8C\u6E08\u3057\u305F`);
        }
      } else {
        l.missed++;
        g.log("car", `\u304A\u91D1\u304C\u8DB3\u308A\u305A\u3001${carName(c)}\u306E\u30ED\u30FC\u30F3\u3092\u6255\u3048\u306A\u304B\u3063\u305F(${l.missed}\u304B\u6708)`);
        if (l.missed >= 3) {
          const price = appraise(g, c, "usedshop").price;
          v.cars.splice(v.cars.indexOf(c), 1);
          L2.splice(L2.indexOf(l), 1);
          if (v.cur === c.uid) v.cur = v.cars.length ? v.cars[v.cars.length - 1].uid : null;
          if (v.ride === "car") v.ride = null;
          v.soldUids || (v.soldUids = {});
          v.soldUids[c.uid] = { M: g.S.M, price, ch: "repo" };
          const rest = Math.max(0, l.bal - price);
          if (rest) h.debt += rest;
          g.log("car", `\u30ED\u30FC\u30F3\u306E\u6EDE\u7D0D\u3067${carName(c)}\u304C\u5F15\u304D\u4E0A\u3052\u3089\u308C\u305F`);
        }
      }
    }
    for (const c of v.cars) if (c.rep && g.S.M >= c.rep.until) {
      c.cond = Math.min(100, c.cond + 12);
      delete c.rep;
      g.log("car", `${carName(c)}\u306E\u4FEE\u7406\u304C\u7D42\u308F\u3063\u305F`);
    }
    if (g.age() >= 18) accidentsMonth(g);
  }
  var dmgBase = [[0.65, 6e4, 25e4, "\u8EFD\u3044", 0], [0.28, 25e4, 9e5, "\u4E2D\u7A0B\u5EA6\u306E", 1], [0.07, 9e5, 25e5, "\u5927\u304D\u306A", 2]];
  function accidentRisk(g, c, km) {
    const h = g.hero, H4 = histOf(h), age = g.age();
    let k = km / 6e4;
    if (age < 25) k *= 1.8;
    else if (age >= 75) k *= 1.5;
    if (c.cond < 40) k *= 1.4;
    k *= 1 + 0.15 * Math.min(6, H4.viol);
    return Math.min(0.2, k);
  }
  function accidentsMonth(g) {
    const h = g.hero, v = h.veh, rng = g.actRng("caracc"), M = g.S.M;
    for (const c of v.cars) {
      const km = Math.max(0, c.odo - (c.odoPrev ?? c.odo));
      c.odoPrev = c.odo;
      if (c.rep && M < c.rep.until) continue;
      const m = MODEL[c.model];
      if (km > 0 && rng.next() < accidentRisk(g, c, km)) {
        occurrence(g, c, rng.next() < 0.4 ? "solo" : "collision", rng);
        continue;
      }
      const age = Math.max(0, g.year() - c.my);
      const pb = (c.cond < 40 ? 0.04 : c.cond < 70 ? 0.012 : 2e-3) + (age > 10 ? 0.01 : 0);
      if (rng.next() < pb) occurrence(g, c, "breakdown", rng);
      void m;
    }
  }
  function occurrence(g, c, kind, rng) {
    const h = g.hero, H4 = histOf(h), M = g.S.M, m = MODEL[c.model];
    const r = rng.next();
    let acc = 0, tier2 = dmgBase[0];
    for (const t of dmgBase) {
      acc += t[0];
      if (r < acc) {
        tier2 = t;
        break;
      }
    }
    if (kind === "breakdown") tier2 = tier2[4] === 2 ? dmgBase[1] : tier2;
    let cost = Math.round(g.yen(tier2[1] + rng.next() * (tier2[2] - tier2[1])) / 1e3) * 1e3;
    const val = usedValue(g, c);
    const pol = c.pol || defaultPol(), cv2 = COVERS[pol.cover] || COVERS.std, active = insActive(g, c), ded = g.yen(pol.ded);
    const atFault = kind === "collision" ? rng.next() < 0.65 : false;
    const third = atFault ? Math.round(cost * 0.7 / 1e3) * 1e3 : 0;
    const total = cost > val * 0.7 && kind !== "breakdown";
    const lines = [];
    let own = cost, insurer = 0;
    const label = kind === "solo" ? "\u96FB\u67F1\u306B\u3053\u3059\u3063\u305F(\u5358\u72EC\u4E8B\u6545)" : kind === "collision" ? atFault ? "\u4EA4\u5DEE\u70B9\u3067\u4ED6\u306E\u8ECA\u3068\u63A5\u89E6\u3057\u305F(\u81EA\u5206\u306B\u3082\u904E\u5931)" : "\u8FFD\u7A81\u3055\u308C\u305F(\u76F8\u624B\u306B\u904E\u5931)" : "\u8D70\u884C\u4E2D\u306B\u6545\u969C\u3057\u305F";
    if (kind === "collision") lines.push("\u8B66\u5BDF\u304C\u6765\u3066\u4E8B\u6545\u306E\u624B\u7D9A\u304D\u3092\u3057\u305F");
    if (tier2[4] === 2 && kind !== "breakdown") lines.push("\u5FF5\u306E\u305F\u3081\u6551\u6025\u8ECA\u3067\u75C5\u9662\u3078(\u8EFD\u75C7)");
    if (kind === "breakdown") own = Math.round(cost * 0.5 / 1e3) * 1e3;
    const towFee = g.yen(15e3);
    let tow = towFee;
    if (kind === "collision" && !atFault) {
      own = 0;
      lines.push("\u4FEE\u7406\u8CBB\u306F\u76F8\u624B\u306E\u4FDD\u967A\u3067\u652F\u6255\u308F\u308C\u305F");
      tow = 0;
    } else if (active && cv2.veh && kind !== "breakdown") {
      insurer = Math.max(0, (total ? val : own) - ded);
      own = Math.min(own, ded);
      H4.acc.push({ M, kind, cost, claimed: true });
      if (cv2.tow) tow = 0;
      lines.push(`\u4FDD\u967A\u91D1 ${yenS3(insurer)} \u304C\u652F\u6255\u308F\u308C\u305F(\u514D\u8CAC ${yenS3(Math.min(ded, cost))})`);
    } else if (kind !== "breakdown") {
      H4.acc.push({ M, kind, cost, claimed: false });
      lines.push(active ? "\u8ECA\u4E21\u4FDD\u967A\u304C\u306A\u3044\u305F\u3081\u4FEE\u7406\u8CBB\u306F\u81EA\u5DF1\u8CA0\u62C5" : "\u4FDD\u967A\u304C\u5207\u308C\u3066\u3044\u305F\u305F\u3081\u4FEE\u7406\u8CBB\u306F\u81EA\u5DF1\u8CA0\u62C5");
    }
    if (third) {
      if (active) {
        lines.push(`\u76F8\u624B\u3078\u306E\u8CE0\u511F ${yenS3(third)} \u306F\u4FDD\u967A\u3067\u652F\u6255\u308F\u308C\u305F`);
        H4.acc.push({ M, kind: "liab", cost: third, claimed: true });
      } else {
        own += third;
        lines.push(`\u76F8\u624B\u3078\u306E\u8CE0\u511F ${yenS3(third)} \u3092\u81EA\u5DF1\u8CA0\u62C5\u3057\u305F`);
      }
    }
    if (kind === "breakdown" && active && cv2.tow) tow = 0;
    if (total) {
      const v = h.veh;
      const i = v.cars.indexOf(c);
      v.cars.splice(i, 1);
      if (v.cur === c.uid) v.cur = v.cars.length ? v.cars[v.cars.length - 1].uid : null;
      if (v.ride === "car") v.ride = null;
      v.soldUids || (v.soldUids = {});
      v.soldUids[c.uid] = { M, price: 0, ch: "total" };
      const L2 = getLoans(h), li = L2.findIndex((l) => l.uid === c.uid);
      if (li >= 0) {
        const bal = Math.round(L2[li].bal);
        L2.splice(li, 1);
        if (bal > insurer) h.debt += bal - insurer;
      }
      if (insurer) g.earn(insurer, `\u8ECA\u4E21\u4FDD\u967A\u91D1(\u5168\u640D): ${carName(c)}`);
      lines.push("\u4FEE\u7406\u3067\u304D\u306A\u3044\u307B\u3069\u50B7\u3093\u3067\u3001\u5EC3\u8ECA\u306B\u306A\u3063\u305F");
      if (own > 0) g.pay(own, `\u4E8B\u6545\u306E\u81EA\u5DF1\u8CA0\u62C5(${carName(c)})`);
    } else {
      if (insurer) g.earn(insurer, `\u8ECA\u4E21\u4FDD\u967A\u91D1: ${carName(c)}`);
      if (own + tow > 0) g.pay(own + tow, `${kind === "breakdown" ? "\u6545\u969C\u4FEE\u7406" : "\u4E8B\u6545\u4FEE\u7406"}\u30FB\u30EC\u30C3\u30AB\u30FC: ${carName(c)}`);
      c.rep = { until: M + tier2[4] + (kind === "breakdown" ? 0 : 1), cost, kind: kind === "breakdown" ? "\u6545\u969C" : "\u4E8B\u6545" };
      if (kind !== "breakdown") c.accs = (c.accs || 0) + 1;
      c.cond = Math.max(5, c.cond - 15);
      if (h.veh.ride === "car" && h.veh.cur === c.uid) {
        h.veh.ride = null;
        c.parked = { x: g.S.loc.x, y: g.S.loc.y, d: 0, where: "\u4FEE\u7406\u5DE5\u5834" };
      }
      lines.push(`${tow ? "\u30EC\u30C3\u30AB\u30FC\u8ECA\u3067" : ""}\u4FEE\u7406\u5DE5\u5834\u3078(${m.name}\u30FB${tier2[3]}\u640D\u50B7)`);
    }
    g.log("car", `${label}\u3002${lines.join("\u3002")}\u3002`, { acc: kind });
    return { kind, cost, insurer, own, total, lines };
  }
  function setPolicy(g, uid, patch) {
    const c = getCars(g.hero).cars.find((q) => q.uid === uid);
    if (!c) return { ok: false, msg: "" };
    c.pol = { ...c.pol || defaultPol(), ...patch };
    const p = insPremium(g, c, MODEL[c.model].cls);
    return { ok: true, msg: `${(INS_CO.find((x) => x.id === c.pol.co) || INS_CO[0]).name}\u30FB${COVERS[c.pol.cover].name}\u30FB\u514D\u8CAC${yenS3(g.yen(c.pol.ded))}(\u5E74\u984D ${yenS3(p)})\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002`, premium: p };
  }

