  // src/finance.js
  var HOOK = {};
  var LOAN_MONTHS = 420;
  var homePrice = (g, b) => Math.round(g.rentOf(b) * 12 * 22 * valueFactor(g, b) / 1e3) * 1e3;
  var loanRate2 = (y) => y < 1995 ? 0.045 : y < 2e3 ? 0.03 : y < 2020 ? 0.015 : 0.02;
  function pmt(P2, r, n2) {
    const i = r / 12;
    return i === 0 ? P2 / n2 : P2 * i / (1 - Math.pow(1 + i, -n2));
  }
  function buyQuote(g, bi) {
    const b = g.bld(bi), price = homePrice(g, b), down = Math.round(price * 0.2), fees = Math.round(price * 0.05), loan = price - down, r = loanRate2(g.year()), pay = Math.round(pmt(loan, r, LOAN_MONTHS));
    return { price, down, fees, loan, rate: r, pay, cash: price + fees, name: b.name };
  }
  function sellValue(g, bi) {
    const b = g.bld(bi);
    return Math.round(homePrice(g, b) * 0.92);
  }
  function sellOwned(g) {
    const h = g.hero;
    if (!h.owned.includes(h.homeB)) return null;
    const bi = h.homeB;
    const v = sellValue(g, bi);
    const bal = h.mort && h.mort.bi === bi ? Math.round(h.mort.bal) : 0;
    h.owned = h.owned.filter((x) => x !== bi);
    if (h.mort && h.mort.bi === bi) h.mort = null;
    const net = v - bal;
    if (net >= 0) g.earn(net, "\u4F4F\u5B85\u306E\u58F2\u5374");
    else g.pay(-net, "\u4F4F\u5B85\u306E\u58F2\u5374(\u30ED\u30FC\u30F3\u6B8B\u50B5)");
    g.log("home", `\u6301\u3061\u5BB6(${g.bld(bi).name})\u3092\u58F2\u5374\u3057\u305F(\u624B\u53D6\u308A \xA5${net.toLocaleString("ja-JP")})`);
    return { bi, v, bal, net };
  }
  function buyHome(g, bi) {
    const h = g.hero, w = g.world;
    if (g.age() < 20) return { ok: false, msg: "\u4F4F\u5B85\u306E\u8CFC\u5165\u306F20\u6B73\u304B\u3089\u3067\u3059" };
    if (g.blocked()) return { ok: false, msg: "\u5148\u306B\u76EE\u306E\u524D\u306E\u51FA\u6765\u4E8B\u3092\u7247\u3065\u3051\u307E\u3057\u3087\u3046" };
    if (h.owned.includes(bi)) return { ok: false, msg: "\u3059\u3067\u306B\u3042\u306A\u305F\u306E\u5BB6\u3067\u3059" };
    if (h.mort && !h.owned.includes(h.homeB)) h.mort = null;
    const q = buyQuote(g, bi);
    const sellGain = h.owned.includes(h.homeB) ? sellValue(g, h.homeB) - (h.mort && h.mort.bi === h.homeB ? Math.round(h.mort.bal) : 0) : 0;
    const cashBuy = h.money + sellGain >= q.cash;
    if (!cashBuy) {
      if (!h.job || h.flags.partTime) return { ok: false, msg: "\u30ED\u30FC\u30F3\u3092\u7D44\u3080\u306B\u306F\u6B63\u793E\u54E1\u306E\u5B89\u5B9A\u3057\u305F\u53CE\u5165\u304C\u5FC5\u8981\u3067\u3059" };
      if (h.money + sellGain < q.down + q.fees) return { ok: false, msg: `\u982D\u91D1\u3068\u8AF8\u8CBB\u7528\u304C\u8DB3\u308A\u307E\u305B\u3093(\u5FC5\u8981 \xA5${(q.down + q.fees).toLocaleString("ja-JP")})` };
      if (q.pay > g.monthlyWage() * 0.35) return { ok: false, msg: `\u8FD4\u6E08\u984D(\u6708\xA5${q.pay.toLocaleString("ja-JP")})\u304C\u53CE\u5165\u306B\u5BFE\u3057\u3066\u91CD\u3059\u304E\u307E\u3059(\u7D66\u4E0E\u306E35%\u307E\u3067)` };
    }
    const sold2 = sellOwned(g);
    const group = [h.id];
    if (h.spouse != null) group.push(h.spouse);
    for (const k of h.kids) if (!w.pop.gone[k] && g.ageOf(k) < 18) group.push(k);
    if (cashBuy) {
      g.pay(q.cash, "\u4F4F\u5B85\u306E\u8CFC\u5165(\u73FE\u91D1)");
      h.mort = null;
    } else {
      g.pay(q.down + q.fees, "\u4F4F\u5B85\u306E\u8CFC\u5165(\u982D\u91D1\u30FB\u8AF8\u8CBB\u7528)");
      h.mort = { bi, bal: q.loan, rate: q.rate, pay: q.pay, left: LOAN_MONTHS };
    }
    if (HOOK.onMove) HOOK.onMove(g, 0);
    h.flags.moveBy = 0;
    for (const i of group) w.moveHome(i, bi);
    h.homeB = bi;
    h.homeIsParents = false;
    h.owned.push(bi);
    g.S.stats.moves++;
    g.syncWorldFlags();
    g.log("home", `${q.name}\u3092\u8CFC\u5165\u3057\u305F(${cashBuy ? "\u73FE\u91D1" : `\u30ED\u30FC\u30F3\u6708\xA5${q.pay.toLocaleString("ja-JP")}\xD735\u5E74`})`, { b: bi });
    return { ok: true, msg: `${q.name}\u3092\u8CFC\u5165\u3057\u307E\u3057\u305F\u3002${cashBuy ? "" : `(\u4F4F\u5B85\u30ED\u30FC\u30F3 \u6708\xA5${q.pay.toLocaleString("ja-JP")})`}`, q, sold: sold2 };
  }
  function monthlyHousing(g) {
    const h = g.hero;
    if (h.homeIsParents) return;
    if (h.owned.includes(h.homeB)) g.pay(Math.round(homePrice(g, g.bld(h.homeB)) * 0.014 / 12), "\u56FA\u5B9A\u8CC7\u7523\u7A0E");
    const m = h.mort;
    if (!m) return;
    const intr = m.bal * m.rate / 12;
    let pay = Math.min(m.pay, m.bal + intr);
    const prin = pay - intr;
    g.pay(Math.round(pay), "\u4F4F\u5B85\u30ED\u30FC\u30F3\u8FD4\u6E08");
    m.bal = Math.max(0, m.bal - prin);
    m.left--;
    if (m.bal < 1 || m.left <= 0) {
      h.mort = null;
      g.log("home", "\u304A\u3081\u3067\u3068\u3046!\u4F4F\u5B85\u30ED\u30FC\u30F3\u3092\u5B8C\u6E08\u3057\u305F");
    }
  }
  var INVEST_STEPS = [0, 1e4, 3e4, 5e4, 1e5];
  var getInvest = (h) => h.invest || (h.invest = { bal: 0, paid: 0, monthly: 0 });
  function setMonthly(g, k) {
    const iv = getInvest(g.hero);
    iv.monthly = k;
    return iv;
  }
  function monthlyInvest(g) {
    const h = g.hero;
    const iv = h.invest;
    if (!iv || iv.bal <= 0 && !iv.monthly) return;
    const rng = g.actRng("invest");
    const z = (rng.next() + rng.next() + rng.next() + rng.next() - 2) / 0.58;
    const shock = g.year() === 2008 || g.year() === 2020 ? -0.012 : 0;
    const r = Math.max(-0.35, 35e-4 + z * 0.035 + shock);
    iv.bal = Math.max(0, iv.bal * (1 + r));
    if (iv.monthly && g.age() >= 18) {
      const amt = Math.min(g.yen(iv.monthly), Math.max(0, h.money - g.yen(3e5)));
      if (amt > 0) {
        g.pay(amt, "\u7A4D\u7ACB\u6295\u8CC7");
        iv.bal += amt;
        iv.paid += amt;
      }
    }
  }
  function withdrawInvest(g) {
    const iv = getInvest(g.hero);
    if (iv.bal <= 0) return { ok: false, msg: "\u904B\u7528\u4E2D\u306E\u8CC7\u7523\u304C\u3042\u308A\u307E\u305B\u3093" };
    const n2 = Math.round(iv.bal);
    g.earn(n2, "\u6295\u8CC7\u306E\u5F15\u304D\u51FA\u3057");
    iv.paid = 0;
    iv.bal = 0;
    return { ok: true, msg: `\xA5${n2.toLocaleString("ja-JP")}\u3092\u5F15\u304D\u51FA\u3057\u307E\u3057\u305F`, n: n2 };
  }
  var investValue = (h) => Math.round(h.invest?.bal || 0);

