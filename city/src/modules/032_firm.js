  // src/firm.js
  var yenS = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  var firmsOf = (h) => h.firms || (h.firms = []);
  var heirFirms = (h) => h.heirFirms || (h.heirFirms = []);
  var ZLOC = { downtown: 1.5, tower: 1.4, shotengai: 1.3, oldtown: 1, school: 1.1, suburb_n: 0.9, suburb_w: 0.85, suburb_e: 0.85, campus: 1.15, civic: 1.1, farm: 0.5, onsen: 0.9, temple_town: 0.9, port: 0.8, industrial: 0.7 };
  var EC = [[1980, 0.95], [1990, 1.12], [1992, 1], [1998, 0.88], [2003, 0.86], [2007, 0.98], [2009, 0.84], [2013, 0.92], [2019, 1.02], [2020, 0.8], [2022, 0.95], [2030, 1.02], [2060, 1.05], [2100, 1.05]];
  function econIndex(y) {
    if (y <= EC[0][0]) return EC[0][1];
    for (let i = 1; i < EC.length; i++) if (y <= EC[i][0]) {
      const a = EC[i - 1], b = EC[i];
      return a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0]);
    }
    return EC[EC.length - 1][1];
  }
  var SEASON = [0.92, 0.88, 1, 1, 1.02, 1, 1.04, 1.08, 1, 1, 1.04, 1.2];
  function sites(g, indId, limit = 6) {
    const ind = IND[indId];
    if (!ind) return [];
    const B2 = g.world.map.buildings, h = g.hero;
    const used = new Set(firmsOf(h).filter((f2) => f2.state === "open").map((f2) => f2.b));
    const out = [];
    const onlySalon = indId === "salon" && B2.some((b) => b.salon);
    for (const b of B2) {
      if (!ind.hosts.includes(b.type) || used.has(b.idx)) continue;
      if (onlySalon && !b.salon) continue;
      if (b.type === "office" && b.tenant) continue;
      out.push({ b: b.idx, name: b.name, type: b.type, zone: b.zone, d: g.world.dist(h.homeB, b.idx), loc: ZLOC[b.zone] || 1 });
    }
    out.sort((a, c) => a.d - c.d || a.b - c.b);
    const seen = {};
    const pick5 = [];
    for (const o of out) {
      seen[o.type] = (seen[o.type] || 0) + 1;
      if (seen[o.type] <= 3) pick5.push(o);
      if (pick5.length >= limit) break;
    }
    return pick5;
  }
  function canOpen(g, indId) {
    const ind = IND[indId], h = g.hero;
    if (!ind) return { ok: false, msg: "" };
    if (ind.cap === 0) return { ok: false, msg: "\u3053\u306E\u5206\u91CE\u306F\u6C11\u9593\u3067\u306F\u7D4C\u55B6\u3067\u304D\u307E\u305B\u3093(\u516C\u5171\u306E\u7D44\u7E54\u3067\u3059)" };
    if (g.age() < 20) return { ok: false, msg: "\u4E8B\u696D\u3092\u59CB\u3081\u3089\u308C\u308B\u306E\u306F20\u6B73\u304B\u3089\u3067\u3059" };
    const lic = { gp: "doctor", dental: "doctor", derm: "doctor", plastic: "doctor", vet: "doctor", pharmacy_biz: "pharmacist", lawoffice: "bar", taxacc: "boki", accounting: "boki" }[ind.id];
    if (lic && !(h.quals && h.quals[lic])) {
      const nm = { doctor: "\u533B\u5E2B\u514D\u8A31", pharmacist: "\u85AC\u5264\u5E2B\u514D\u8A31", bar: "\u53F8\u6CD5\u8A66\u9A13\u5408\u683C", boki: "\u7C3F\u8A18\u306E\u8CC7\u683C" }[lic];
      return { ok: false, msg: `${ind.n}\u306B\u306F${nm}\u304C\u5FC5\u8981\u3067\u3059(\u307E\u305F\u306F\u6709\u8CC7\u683C\u306E\u7BA1\u7406\u8005\u3092\u96C7\u3046\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059)` };
    }
    if (ind.id === "salon" && !(h.quals && (h.quals.beautician || h.quals.barber))) {
      const lic2 = salonLicensedCandidates(g);
      if (!lic2) return { ok: false, msg: "\u7406\u7F8E\u5BB9\u5BA4\u306B\u306F\u514D\u8A31\u3092\u6301\u3064\u65BD\u8853\u8005\u304C\u5FC5\u8981\u3067\u3059\u3002\u81EA\u5206\u304C\u7F8E\u5BB9\u5E2B(\u7406\u5BB9\u5E2B)\u514D\u8A31\u3092\u53D6\u308B\u304B\u3001\u514D\u8A31\u3092\u6301\u3064\u4EBA\u3092\u96C7\u3048\u308B\u3088\u3046\u306B\u306A\u3063\u3066\u304B\u3089\u958B\u696D\u3057\u3066\u304F\u3060\u3055\u3044" };
    }
    if (ind.id === "plastic" && g.year() < 1965) return { ok: false, msg: "\u3053\u306E\u6642\u4EE3\u306B\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093" };
    return { ok: true, need: ind.cap };
  }
  function openFirm(g, indId, siteB, name) {
    const ind = IND[indId], h = g.hero, ck = canOpen(g, indId);
    if (!ck.ok) return ck;
    const F = firmsOf(h);
    if (F.filter((f3) => f3.state === "open").length >= 3) return { ok: false, msg: "\u540C\u6642\u306B\u7D4C\u55B6\u3067\u304D\u308B\u4E8B\u696D\u306F3\u3064\u307E\u3067\u3067\u3059" };
    const st3 = sites(g, indId, 30).find((s) => s.b === siteB);
    if (!st3) return { ok: false, msg: "\u305D\u306E\u5834\u6240\u3067\u306F\u958B\u696D\u3067\u304D\u307E\u305B\u3093" };
    const capital = g.yen(ind.cap), deposit = g.yen(ind.rent) * 6, equip = Math.round(capital * 0.45);
    const need = capital + deposit;
    if (h.money < need) return { ok: false, msg: `\u958B\u696D\u8CC7\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\u5FC5\u8981 ${yenS(need)}: \u8A2D\u5099\u30FB\u958B\u696D\u8CBB${yenS(capital)} + \u4FDD\u8A3C\u91D1${yenS(deposit)})` };
    g.pay(need, `\u958B\u696D(${ind.n})`);
    const id = h.firmSeq = (h.firmSeq || 0) + 1;
    const f2 = { id, ind: indId, name: name || `${g.bld(siteB).name.slice(0, 6)}\u306E${ind.n}`, b: siteB, state: "open", M0: g.S.M, capital, equip, deposit, cash: Math.round(capital * 0.25), staff: [], mgr: null, price: 1, stock: 2, hrs: ind.hrs.split("-").map(Number), rep: 40, loss: 0, boom: 0, comp: 0, tax: 0, carry: 0, last: null, hist: [], regulars: [], owner: h.id, hoursWorked: 0 };
    F.push(f2);
    hire(g, id);
    g.log("biz", `${ind.n}\u300C${f2.name}\u300D\u3092\u958B\u696D\u3057\u305F(${yenS(need)})`, { b: siteB });
    return { ok: true, msg: `${ind.n}\u300C${f2.name}\u300D\u3092\u958B\u696D\u3057\u307E\u3057\u305F\u3002`, firm: f2 };
  }
  var getF = (g, id) => firmsOf(g.hero).find((f2) => f2.id === id);
  function candidates(g, f2) {
    const p = g.world.pop, h = g.hero;
    const out = [];
    const used = /* @__PURE__ */ new Set([...firmsOf(h).flatMap((x) => x.staff.map((s) => s.id)), h.id, h.spouse]);
    for (let i = 0; i < p.n && out.length < 6; i++) {
      if (p.gone[i] || used.has(i) || p.work[i] >= 0 || p.school[i] >= 0) continue;
      const a = ageYears(p, i, g.world.M);
      if (a < 18 || a > 64) continue;
      if (g.world.dist(p.home[i], f2.b) > 40) continue;
      out.push(i);
    }
    return out;
  }
  function salonLicensedCandidates(g) {
    const p = g.world.pop, h = g.hero;
    let n2 = 0;
    for (let i = 0; i < p.n && n2 < 1; i++) {
      if (p.gone[i] || i === h.id || p.work[i] >= 0 || p.school[i] >= 0) continue;
      if (ageYears(p, i, g.world.M) >= 21 && ageYears(p, i, g.world.M) <= 64) n2++;
    }
    return n2 > 0;
  }
  function hire(g, id) {
    const f2 = getF(g, id);
    if (!f2 || f2.state !== "open") return { ok: false, msg: "" };
    const ind = IND[f2.ind];
    if (f2.staff.length >= Math.max(ind.staff, 1) * 3) return { ok: false, msg: "\u5F93\u696D\u54E1\u304C\u591A\u3059\u304E\u307E\u3059" };
    let c = candidates(g, f2);
    if (f2.ind === "salon") {
      c = c.filter((i) => npcLicensed(g, i));
    }
    if (!c.length) return { ok: false, msg: "\u96C7\u3048\u308B\u4EBA\u304C\u8FD1\u304F\u306B\u3044\u307E\u305B\u3093" };
    const pid = c[hash2(f2.id + f2.staff.length, 61) % c.length];
    f2.staff.push({ id: pid, M: g.S.M, skill: 0.7 + hash2(pid, 62) % 50 / 100, lic: f2.ind === "salon" ? 1 : void 0 });
    return { ok: true, msg: `${g.nameOf(pid)}\u3055\u3093\u3092\u5F93\u696D\u54E1\u3068\u3057\u3066\u96C7\u3044\u307E\u3057\u305F\u3002`, who: pid };
  }
  function fire(g, id, pid) {
    const f2 = getF(g, id);
    if (!f2) return { ok: false, msg: "" };
    const i = f2.staff.findIndex((s) => s.id === pid);
    if (i < 0) return { ok: false, msg: "" };
    f2.staff.splice(i, 1);
    if (f2.mgr === pid) f2.mgr = null;
    return { ok: true, msg: `${g.nameOf(pid)}\u3055\u3093\u306B\u9000\u8077\u3057\u3066\u3082\u3089\u3044\u307E\u3057\u305F\u3002` };
  }
  function appointManager(g, id, pid) {
    const f2 = getF(g, id);
    if (!f2) return { ok: false, msg: "" };
    const s = f2.staff.find((q) => q.id === pid);
    if (!s) return { ok: false, msg: "\u5F93\u696D\u54E1\u3067\u306F\u3042\u308A\u307E\u305B\u3093" };
    if (g.S.M - s.M < 12) return { ok: false, msg: "\u5E97\u9577\u306B\u3059\u308B\u306B\u306F\u52E4\u7D9A1\u5E74\u4EE5\u4E0A\u304C\u5FC5\u8981\u3067\u3059" };
    f2.mgr = pid;
    return { ok: true, msg: `${g.nameOf(pid)}\u3055\u3093\u3092\u5E97\u9577\u306B\u3057\u307E\u3057\u305F(\u65E5\u3005\u306E\u904B\u55B6\u3092\u4EFB\u305B\u307E\u3059)\u3002` };
  }
  var setPrice = (g, id, p) => {
    const f2 = getF(g, id);
    if (!f2) return { ok: false, msg: "" };
    f2.price = Math.max(0.8, Math.min(1.3, p));
    return { ok: true, msg: `\u4FA1\u683C\u6C34\u6E96\u3092${Math.round(f2.price * 100)}%\u306B\u3057\u307E\u3057\u305F\u3002` };
  };
  var setStock = (g, id, lv) => {
    const f2 = getF(g, id);
    if (!f2) return { ok: false, msg: "" };
    f2.stock = Math.max(1, Math.min(3, lv));
    return { ok: true, msg: `\u5728\u5EAB\u306E\u6C34\u6E96\u3092${["", "\u5C11\u306A\u3081", "\u6A19\u6E96", "\u591A\u3081"][f2.stock]}\u306B\u3057\u307E\u3057\u305F\u3002` };
  };
  var setHours = (g, id, o, c) => {
    const f2 = getF(g, id);
    if (!f2) return { ok: false, msg: "" };
    f2.hrs = [o, c];
    return { ok: true, msg: `\u55B6\u696D\u6642\u9593\u3092${o}\u6642\u301C${c}\u6642\u306B\u3057\u307E\u3057\u305F\u3002` };
  };
  function workHere(g, id) {
    const f2 = getF(g, id), h = g.hero;
    if (!f2 || f2.state !== "open") return { ok: false, msg: "" };
    if (h.stats.energy < 15) return { ok: false, msg: "\u75B2\u308C\u3059\u304E\u3066\u3044\u307E\u3059\u3002\u4F11\u307F\u307E\u3057\u3087\u3046\u3002" };
    g.advance(60);
    f2.hoursWorked = (f2.hoursWorked || 0) + 1;
    h.stats.energy = Math.max(0, h.stats.energy - 4.5);
    g.S.stats.workHours = (g.S.stats.workHours || 0) + 1;
    return { ok: true, msg: `${f2.name}\u3067\u50CD\u304D\u307E\u3057\u305F(\u4ECA\u6708${f2.hoursWorked}\u6642\u9593)\u3002` };
  }
  function withdraw(g, id, amt) {
    const f2 = getF(g, id);
    if (!f2) return { ok: false, msg: "" };
    const a = Math.min(f2.cash - g.yen(3e5), amt ?? f2.cash);
    if (a <= 0) return { ok: false, msg: "\u5F15\u304D\u51FA\u305B\u308B\u4F59\u88D5\u8CC7\u91D1\u304C\u3042\u308A\u307E\u305B\u3093" };
    f2.cash -= a;
    g.earn(a, `\u4E8B\u696D\u304B\u3089\u306E\u5F79\u54E1\u5831\u916C\u30FB\u914D\u5F53(${f2.name})`);
    return { ok: true, msg: `${yenS(a)}\u3092\u53D7\u3051\u53D6\u308A\u307E\u3057\u305F\u3002` };
  }
  function invest(g, id, amt) {
    const f2 = getF(g, id), h = g.hero;
    if (!f2 || h.money < amt) return { ok: false, msg: "\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093" };
    g.pay(amt, `\u4E8B\u696D\u3078\u306E\u51FA\u8CC7(${f2.name})`);
    f2.cash += amt;
    return { ok: true, msg: `${yenS(amt)}\u3092\u51FA\u8CC7\u3057\u307E\u3057\u305F\u3002` };
  }
  function report(g, f2) {
    const ind = IND[f2.ind], y = g.year(), m0 = g.date().m0;
    const b = g.bld(f2.b);
    const loc = ZLOC[b.zone] || 1, eco = econIndex(y), sea = SEASON[m0] ?? 1;
    const open2 = Math.max(0, f2.hrs[1] - f2.hrs[0]), nstaff = f2.staff.length;
    const ownerOps = f2.mgr != null ? 0 : 1;
    const mgrSk = f2.mgr != null ? f2.staff.find((s) => s.id === f2.mgr)?.skill || 0.8 : 0.55 + Math.min(0.45, (f2.hoursWorked || 0) / 120);
    const rep = 0.5 + f2.rep / 100, pr = Math.pow(f2.price, -1.6), boom = f2.boom > 0 ? 1.15 : 1, comp = f2.comp > 0 ? 0.92 : 1;
    const base = ind.rent * 10 / Math.max(1, ind.tk);
    const serviceK = Math.pow(Math.min(1, (nstaff + 1) / (ind.staff + 1)), 0.7) * (f2.ind === "salon" ? salonLawK(g, f2) : 1);
    const customers = base * (0.7 + 0.1 * ind.foot) * loc * eco * sea * rep * pr * boom * comp * (0.6 + 0.4 * Math.min(1.2, open2 / 10)) * (0.55 + 0.45 * mgrSk) * serviceK;
    const capCust = (nstaff + 1) * 26 * Math.max(1, open2) * (ind.foot >= 4 ? 8 : 4) * (ind.staff === 0 ? 5 : 1);
    const stockOut = f2.stock === 1 ? 0.92 : f2.stock === 2 ? 0.985 : 1;
    const served = Math.max(0, Math.min(customers, capCust)) * stockOut;
    const rev = served * g.yen(ind.tk) * f2.price;
    const cogs = rev * ind.cogs * (f2.stock === 3 ? 1.03 : 1) * (1 - 0.03 * (mgrSk - 0.8));
    const wage = nstaff * g.yen(15e4 + 2e4 * IND_WAGE(ind)) + (f2.mgr != null ? g.yen(6e4) : 0);
    const rent = g.yen(ind.rent), util = rev * 0.03, dep = f2.equip / 120;
    const pre = rev - cogs - wage - rent - util - dep;
    const taxBase = Math.max(0, pre - f2.carry), tax = Math.round(taxBase * 0.25);
    return { customers: Math.round(customers), served: Math.round(served), rev: Math.round(rev), cogs: Math.round(cogs), wage: Math.round(wage), rent, util: Math.round(util), dep: Math.round(dep), pre: Math.round(pre), tax, profit: Math.round(pre - tax), eco: +eco.toFixed(2), rep: Math.round(f2.rep) };
  }
  var IND_WAGE = (ind) => ({ clerk: 0, stocker: 0, cleaner: 0, cook: 1, waitstaff: 0, logistics: 1, carpenter: 2, teacher: 3, nurse: 4, pharmacist: 6, caregiver: 1, officeworker: 3, banker: 5, lawyer: 8, funeralstaff: 2, hotelstaff: 1, factory: 1, childcare: 1, priest: 1, firefighter: 2 })[ind.job] ?? 0;
  function monthlyFirms(g) {
    const h = g.hero;
    if (!h.firms || !h.firms.length) return;
    const rng = g.actRng("firm");
    const y = g.year();
    for (const f2 of h.firms) {
      if (f2.state !== "open") continue;
      const ind = IND[f2.ind];
      const rp = report(g, f2);
      f2.last = rp;
      f2.cash += rp.profit;
      if (rp.pre < 0) f2.carry += -rp.pre;
      else f2.carry = Math.max(0, f2.carry - rp.pre);
      f2.tax += rp.tax;
      f2.hist.push([g.S.M, rp.rev, rp.profit]);
      if (f2.hist.length > 60) f2.hist.shift();
      f2.rep = Math.max(0, Math.min(100, f2.rep + (rp.profit > 0 ? 0.5 : -0.6) + (f2.price < 1 ? 0.2 : f2.price > 1.15 ? -0.3 : 0) + (f2.mgr != null ? 0.1 : Math.min(0.6, (f2.hoursWorked || 0) / 120))));
      f2.hoursWorked = 0;
      if (f2.boom > 0) f2.boom--;
      if (f2.comp > 0) f2.comp--;
      const r = rng.next();
      if (r < 0.03 && f2.rep > 55 && !f2.boom) {
        f2.boom = 3;
        g.log("biz", `\u300C${f2.name}\u300D\u304C\u8A55\u5224\u306B\u306A\u308A\u3001\u304A\u5BA2\u3055\u3093\u304C\u5897\u3048\u305F`);
      } else if (r < 0.055 && !f2.comp) {
        f2.comp = 6;
        g.log("biz", `\u8FD1\u304F\u306B\u540C\u696D\u306E\u65B0\u3057\u3044\u5E97\u304C\u3067\u304D\u3001\u300C${f2.name}\u300D\u306E\u5BA2\u8DB3\u304C\u843D\u3061\u305F`);
      }
      if (econIndex(y) < 0.85 && !f2.rec) {
        f2.rec = 1;
        g.log("biz", `\u4E0D\u6CC1\u3067\u300C${f2.name}\u300D\u306E\u58F2\u4E0A\u304C\u843D\u3061\u3066\u3044\u308B`);
      }
      if (econIndex(y) >= 0.9) f2.rec = 0;
      if (!f2.regulars.length || f2.hist.length % 6 === 0) f2.regulars = regulars(g, f2);
      f2.loss = rp.profit < 0 ? f2.loss + 1 : 0;
      if (f2.cash < -g.yen(ind.rent) * 6 || f2.loss >= 18) closeFirm(g, f2.id, true);
      if (f2.cash < 0) {
        const intr = Math.round(-f2.cash * 4e-3);
        f2.cash -= intr;
      }
      if (f2.state === "open" && g.age() >= 60 && h.kids.some((k) => !g.world.pop.gone[k] && g.ageOf(k) >= 22) && !f2.heirAsked) {
        f2.heirAsked = 1;
        g.log("biz", `\u300C${f2.name}\u300D\u3092\u5B50\u3069\u3082\u306B\u7D99\u304C\u305B\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059(\u4E8B\u696D\u30FB\u7D4C\u55B6\u306E\u753B\u9762\u304B\u3089)`);
      }
    }
  }
  function regulars(g, f2) {
    const p = g.world.pop;
    const out = [];
    for (let i = 0; i < p.n && out.length < 5; i++) {
      if (p.gone[i] || p.home[i] < 0 || hash2(i + f2.b * 7, 71) % 40 !== 0) continue;
      if (g.world.dist(p.home[i], f2.b) > 30) continue;
      out.push(i);
    }
    return out;
  }
  function closeFirm(g, id, forced = false) {
    const f2 = getF(g, id);
    if (!f2 || f2.state !== "open") return { ok: false, msg: "" };
    f2.state = forced ? "bankrupt" : "closed";
    const ret = Math.round(f2.deposit * (forced ? 0.3 : 0.7) + f2.equip * (forced ? 0.05 : 0.2) + Math.max(0, f2.cash));
    const owe = f2.cash < 0 ? -f2.cash : 0;
    if (ret - owe > 0) g.earn(ret - owe, `\u9589\u5E97\u306E\u7CBE\u7B97(${f2.name})`);
    else if (owe - ret > 0) g.pay(owe - ret, `\u9589\u5E97\u306E\u7CBE\u7B97(\u672A\u6255\u3044\u30FB${f2.name})`);
    f2.staff = [];
    f2.mgr = null;
    g.log("biz", forced ? `\u300C${f2.name}\u300D\u306F\u8CC7\u91D1\u7E70\u308A\u306B\u884C\u304D\u8A70\u307E\u308A\u3001\u9589\u5E97\u3057\u305F` : `\u300C${f2.name}\u300D\u3092\u9589\u5E97\u3057\u305F(\u7CBE\u7B97 ${yenS(ret - owe)})`);
    return { ok: true, msg: forced ? "\u9589\u5E97\u3057\u307E\u3057\u305F\u3002" : `\u9589\u5E97\u3057\u307E\u3057\u305F(\u7CBE\u7B97 ${yenS(ret - owe)})\u3002` };
  }
  function passOn(g, id, kid) {
    const h = g.hero, f2 = getF(g, id);
    if (!f2 || f2.state !== "open") return { ok: false, msg: "" };
    if (kid == null) kid = h.kids.find((k) => !g.world.pop.gone[k] && g.ageOf(k) >= 22);
    if (kid == null || g.world.pop.gone[kid] || g.ageOf(kid) < 22) return { ok: false, msg: "\u7D99\u304C\u305B\u3089\u308C\u308B\u5E74\u3054\u308D\u306E\u5B50\u3069\u3082\u304C\u3044\u307E\u305B\u3093(22\u6B73\u301C)" };
    h.firms.splice(h.firms.indexOf(f2), 1);
    f2.owner = kid;
    f2.gen = (f2.gen || 1) + 1;
    f2.passedM = g.S.M;
    heirFirms(h).push(f2);
    g.log("biz", `\u300C${f2.name}\u300D\u3092${g.nameOf(kid)}\u306B\u7D99\u304C\u305B\u305F(${f2.gen}\u4EE3\u76EE)`, { who: kid });
    return { ok: true, msg: `${g.nameOf(kid)}\u304C${f2.gen}\u4EE3\u76EE\u3068\u3057\u3066\u7D99\u304E\u307E\u3057\u305F\u3002`, kid };
  }
  function firmSummary(g) {
    const h = g.hero;
    const open2 = firmsOf(h).filter((f2) => f2.state === "open");
    return { n: open2.length, cash: open2.reduce((s, f2) => s + f2.cash, 0), monthly: open2.reduce((s, f2) => s + (f2.last ? f2.last.profit : 0), 0), staff: open2.reduce((s, f2) => s + f2.staff.length, 0) };
  }
  var BT2IND = { bookstore: "bookstore", homecenter: "homecenter", pharmacy: "drugstore", clothes: "clothes_shop", ramen: "shokudo", restaurant: "shokudo", cafe: "kissaten", izakaya: "washoku", seafood: "sushi", konbini: null, gasstation: "autorepair", cram: "cram", clinic: "gp", bank: "bank_biz", lawfirm: "lawoffice", funeral: "funeral_co", nursing: "nursinghome", kinder: "nursery", logistics: "delivery", mall: null };
  function npcFirmHistory(g, b, toYear = g.year()) {
    const ind = BT2IND[b.type];
    if (!ind && !["shop", "dept", "super", "konbini"].includes(b.type)) return [];
    const r = (k) => hash2(b.idx, 9300 + k);
    const t0 = Math.max(1950, g.S.startYear - 5 - r(1) % 35);
    const out = [];
    const nm = ind ? IND[ind].n : "\u5E97";
    out.push({ y: t0, text: `${nm}\u3068\u3057\u3066\u958B\u696D`, kind: "open" });
    let y = t0 + 8 + r(2) % 12;
    let gen = 1;
    if (r(3) % 100 < 55) {
      out.push({ y, text: `${gen + 1}\u4EE3\u76EE\u3078\u4E8B\u696D\u627F\u7D99`, kind: "succ" });
      gen++;
      y += 14 + r(4) % 14;
    }
    for (const [yy, lab] of [[1992, "\u4E0D\u6CC1\u3067\u82E6\u6226"], [2009, "\u4E0D\u6CC1\u3067\u82E6\u6226"], [2020, "\u611F\u67D3\u75C7\u306E\u5F71\u97FF\u3067\u82E6\u6226"]]) if (r(yy) % 100 < 45 && yy > t0) out.push({ y: yy, text: lab, kind: "bad" });
    if (r(5) % 100 < 40) out.push({ y: 1996 + r(6) % 20, text: "\u8A55\u5224\u304C\u5E83\u307E\u308A\u7E41\u76DB\u3057\u305F", kind: "boom" });
    if (r(7) % 100 < 30) out.push({ y: Math.min(2060, y + 10 + r(8) % 20), text: gen > 1 ? "\u5F8C\u7D99\u8005\u304C\u304A\u3089\u305A\u9589\u5E97\u3057\u305F" : "\u9589\u5E97\u3057\u305F", kind: "close" });
    return out.filter((e) => e.y <= toYear).sort((a, c) => a.y - c.y);
  }

