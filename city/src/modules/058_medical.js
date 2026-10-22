  // src/medical.js
  var COND = (h) => h.cond || (h.cond = { ill: null, vax: {}, ward: null, hist: [], mental: 0 });
  var VACCINES = [
    { id: "hibpcv", name: "\u5C0F\u5150\u7528\u80BA\u708E\u7403\u83CC\u30FB\u30D2\u30D6", am: [2, 14], yFrom: 1995, cost: 0, auto: true, eff: { cold: 0.05 } },
    { id: "dpt", name: "\u56DB\u7A2E\u6DF7\u5408(\u30B8\u30D5\u30C6\u30EA\u30A2\u30FB\u767E\u65E5\u305B\u304D\u30FB\u7834\u50B7\u98A8\u30FB\u30DD\u30EA\u30AA)", am: [3, 18], yFrom: 1970, cost: 0, auto: true, eff: {} },
    { id: "bcg", name: "BCG(\u7D50\u6838)", am: [5, 12], yFrom: 1970, cost: 0, auto: true, eff: {} },
    { id: "mr1", name: "\u9EBB\u3057\u3093\u30FB\u98A8\u3057\u3093(1\u56DE\u76EE)", am: [12, 24], yFrom: 1978, cost: 0, auto: true, eff: {} },
    { id: "varicella", name: "\u6C34\u307C\u3046\u305D\u3046", am: [12, 36], yFrom: 2014, cost: 0, auto: true, eff: {} },
    { id: "je", name: "\u65E5\u672C\u8133\u708E", am: [36, 48], yFrom: 1970, cost: 0, auto: true, eff: {} },
    { id: "mr2", name: "\u9EBB\u3057\u3093\u30FB\u98A8\u3057\u3093(2\u56DE\u76EE)", am: [60, 71], yFrom: 2006, cost: 0, auto: true, eff: {} },
    { id: "flu", name: "\u30A4\u30F3\u30D5\u30EB\u30A8\u30F3\u30B6(\u6BCE\u5E74)", ageMin: 1, months: [9, 10, 11, 0], yFrom: 1970, cost: 3500, yearly: true, eff: { flu: 0.5 } },
    { id: "covid", name: "\u65B0\u578B\u30B3\u30ED\u30CA", ageMin: 5, yFrom: 2021, yTo: 2026, cost: 0, repeatM: 8, eff: { covid: 0.6 }, costAfter: 15e3 },
    { id: "pneumo65", name: "\u9AD8\u9F62\u8005\u306E\u80BA\u708E\u7403\u83CC", ageMin: 65, yFrom: 2014, cost: 4e3, once: true, eff: { flu: 0.1, cold: 0.08 } }
  ];
  var DISEASES = {
    cold: { name: "\u304B\u305C", dur: [3, 6], sevP: [0.04, 5e-3] },
    flu: { name: "\u30A4\u30F3\u30D5\u30EB\u30A8\u30F3\u30B6", dur: [5, 9], sevP: [0.22, 0.04] },
    covid: { name: "\u65B0\u578B\u30B3\u30ED\u30CA", dur: [5, 12], sevP: [0.25, 0.04] },
    injury: { name: "\u3051\u304C", dur: [5, 14], sevP: [0.1, 0] }
  };
  function dueVaccines(g) {
    const out = [];
    const y = g.year(), am = g.ageMonths(), age = g.age(), c = COND(g.hero), m0 = g.date().m0;
    for (const v of VACCINES) {
      if (y < v.yFrom || v.yTo && y > v.yTo + 2) continue;
      const last = c.vax[v.id];
      if (v.am) {
        if (am >= v.am[0] && am <= v.am[1] && last == null) out.push(v);
        continue;
      }
      if (age < (v.ageMin || 0)) continue;
      if (v.yearly) {
        if (v.months.includes(m0) && !(last != null && Math.floor((g.S.M - last) / 12) < 1 && g.S.M - last < 10)) out.push(v);
        continue;
      }
      if (v.once) {
        if (last == null) out.push(v);
        continue;
      }
      if (v.repeatM) {
        if (last == null || g.S.M - last >= v.repeatM) out.push(v);
      }
    }
    return out;
  }
  function vaccineCost(g, v) {
    const y = g.year();
    const base = v.yTo && y > v.yTo ? v.costAfter || v.cost : v.cost;
    return base ? g.yen(base) : 0;
  }
  function giveVaccine(g, id, opt = {}) {
    const v = VACCINES.find((x) => x.id === id);
    if (!v) return { ok: false, msg: "" };
    const c = COND(g.hero);
    const due = dueVaccines(g).some((x) => x.id === id);
    if (!due) return { ok: false, msg: "\u4ECA\u306F\u63A5\u7A2E\u306E\u5BFE\u8C61\u3067\u306F\u3042\u308A\u307E\u305B\u3093(\u307E\u305F\u306F\u63A5\u7A2E\u6E08\u307F\u3067\u3059)" };
    const cost = vaccineCost(g, v);
    if (cost > g.hero.money) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${cost.toLocaleString("ja-JP")})` };
    if (cost) g.pay(cost, "\u4E88\u9632\u63A5\u7A2E");
    if (!opt.auto) g.advance(30);
    c.vax[id] = g.S.M;
    g.log("vax", opt.auto ? `\u5BB6\u65CF\u306B\u9023\u308C\u3089\u308C\u3066\u300C${v.name}\u300D\u3092\u63A5\u7A2E\u3057\u305F` : `\u300C${v.name}\u300D\u306E\u4E88\u9632\u63A5\u7A2E\u3092\u53D7\u3051\u305F`);
    return { ok: true, msg: `\u300C${v.name}\u300D\u3092\u63A5\u7A2E\u3057\u307E\u3057\u305F${cost ? `(\xA5${cost.toLocaleString("ja-JP")})` : "(\u516C\u8CBB)"}\u3002\u63A5\u7A2E\u5F8C\u306F\u4F53\u8ABF\u306B\u6C17\u3092\u3064\u3051\u3066\u3002` };
  }
  function vaxEff(g, disease) {
    const c = COND(g.hero);
    let eff = 0;
    for (const v of VACCINES) {
      const e = v.eff && v.eff[disease];
      if (!e) continue;
      const last = c.vax[v.id];
      if (last == null) continue;
      const mo = g.S.M - last;
      const span = v.id === "covid" ? 8 : v.id === "flu" ? 9 : 120;
      if (mo <= span) eff = 1 - (1 - eff) * (1 - e * (1 - mo / (span * 1.6)));
    }
    return eff;
  }
  var copayRate = (g) => {
    const a = g.age();
    return a < 15 ? 0 : a >= 70 ? 0.1 : 0.3;
  };
  var waveOf = (M) => {
    const h = (Math.sin(M * 0.52) + Math.sin(M * 0.17 + 1.3) + 2) / 4;
    return Math.max(0, h - 0.18) * 1.2;
  };
  function infectionRisk(g, kind) {
    const a = g.age(), st3 = g.hero.stats, y = g.year(), m0 = g.date().m0;
    let p = 0;
    if (kind === "cold") p = 0.14 + (a < 10 ? 0.12 : 0) + ([11, 0, 1, 2].includes(m0) ? 0.05 : 0);
    else if (kind === "flu") p = 0.012 * ([11, 0, 1, 2].includes(m0) ? 4 : [10, 3].includes(m0) ? 2 : 0.25) * (a < 12 ? 1.6 : 1);
    else if (kind === "covid") {
      const ym = y * 12 + m0;
      if (ym < 2020 * 12 + 1) return 0;
      const fade2 = ym > 2023 * 12 + 4 ? 0.3 : 1;
      p = 0.07 * waveOf(g.S.M) * 3 * fade2;
    }
    const hf = 1.35 - st3.health / 140;
    return Math.min(0.5, p * hf * (1 - vaxEff(g, kind)) * (a >= 75 ? 1.15 : 1));
  }
  function fallIll(g, kind, why = "") {
    const c = COND(g.hero);
    if (c.ill) return null;
    const D3 = DISEASES[kind];
    const rng = g.actRng("ill");
    const a = g.age(), st3 = g.hero.stats;
    const risk = a < 5 || a >= 70 ? 1.8 : 1;
    let sev = 0;
    const e = vaxEff(g, kind);
    if (rng.next() < D3.sevP[0] * risk * (1.3 - st3.health / 120) * (1 - 0.7 * e) * (kind === "cold" ? 0.1 : 1)) sev = 1;
    if (sev && rng.next() < D3.sevP[1] * 8 * risk * (1 - 0.8 * e)) sev = 2;
    const days = D3.dur[0] + rng.int(D3.dur[1] - D3.dur[0] + 1) + sev * 5;
    c.ill = { kind, sev, days, total: days, since: g.S.M, treated: false };
    g.log("health", `${D3.name}\u306B\u304B\u304B\u3063\u305F${sev === 2 ? "(\u91CD\u75C7\u30FB\u5165\u9662\u304C\u5FC5\u8981)" : sev === 1 ? "(\u3064\u3089\u3044\u75C7\u72B6)" : ""}${why}`);
    if (sev === 2) admit(g);
    return c.ill;
  }
  function admit(g) {
    const c = COND(g.hero);
    if (!c.ill || c.ward) return;
    const hosp = g.world.map.buildings.find((b) => b.type === "hospital");
    if (!hosp) return;
    c.ward = { b: hosp.idx, since: g.S.M, cost: 0 };
    const L2 = g.S.loc;
    L2.k = "in";
    L2.b = hosp.idx;
    L2.floor = hosp.type === "hospital" ? 1 : 0;
    L2.moving = false;
    L2.x = hosp.type === "hospital" ? 2.5 : 6;
    L2.y = hosp.type === "hospital" ? 7.5 : 4;
    g.log("health", `${hosp.name}\u306B\u5165\u9662\u3057\u305F`);
    g.queueEvent("ward_admit", { name: DISEASES[c.ill.kind].name });
  }
  var isSick = (g) => {
    const i = g.hero.cond?.ill;
    return !!(i && i.sev >= 1);
  };
  function dailyHealth(g) {
    const c = g.hero.cond;
    if (!c || !c.ill) return;
    const i = c.ill, st3 = g.hero.stats;
    i.days -= i.treated ? 1.5 : 1;
    st3.health = Math.max(5, st3.health - (0.25 + i.sev * 0.9));
    st3.energy = Math.min(st3.energy, 100 - 20 * (i.sev + 1));
    st3.mood = Math.max(0, st3.mood - 0.5);
    if (c.ward) {
      const day = Math.round(g.yen(18e3) * Math.max(0.1, copayRate(g) || 0.05));
      c.ward.cost += day;
      g.pay(day, "\u5165\u9662\u8CBB(\u81EA\u5DF1\u8CA0\u62C5)");
    }
    if (i.days <= 0) {
      g.log("health", `${DISEASES[i.kind].name}\u304C\u6CBB\u3063\u305F${c.ward ? "\u3002\u9000\u9662\u3057\u305F" : ""}`);
      const ward = c.ward;
      c.ill = null;
      c.ward = null;
      st3.health = Math.min(100, st3.health + 5);
      if (ward) {
        const L2 = g.S.loc;
        L2.k = "out";
        const b = g.world.map.buildings[ward.b];
        delete L2.b;
        delete L2.floor;
        L2.x = b.doorX + 0.5;
        L2.y = b.doorY + 1.2;
      }
    }
  }
  function monthlyHealth(g) {
    const c = COND(g.hero), a = g.age();
    if (a < 15) {
      for (const v of dueVaccines(g)) if (v.auto) giveVaccine(g, v.id, { auto: true });
    }
    if (c.ill || g.S.ended) return;
    const rng = g.actRng("infect");
    for (const k of ["covid", "flu", "cold"]) {
      if (rng.next() < infectionRisk(g, k)) {
        fallIll(g, k);
        break;
      }
    }
  }
  function visitDoctor(g, where2 = "clinic") {
    const c = COND(g.hero), st3 = g.hero.stats, rng = g.actRng("visit");
    const lines = [];
    const t0 = g.absMin();
    const wait = where2 === "hospital" ? 25 + rng.int(45) : 10 + rng.int(30);
    g.advance(5);
    lines.push("\u53D7\u4ED8\u3092\u3059\u307E\u305B\u307E\u3057\u305F\u3002");
    g.advance(wait);
    lines.push(`\u5F85\u5408\u5BA4\u3067${wait}\u5206\u307B\u3069\u5F85\u3061\u307E\u3057\u305F\u3002`);
    g.advance(15);
    let fee = g.yen(where2 === "hospital" ? 6500 : 4200);
    if (c.ill) {
      const D3 = DISEASES[c.ill.kind];
      lines.push(`\u8A3A\u5BDF\u306E\u7D50\u679C\u306F\u300C${D3.name}\u300D${c.ill.sev ? "(\u75C7\u72B6\u304C\u5F37\u3081)" : ""}\u3002\u85AC\u304C\u51E6\u65B9\u3055\u308C\u3001\u5B89\u9759\u3092\u6307\u793A\u3055\u308C\u307E\u3057\u305F\u3002`);
      c.ill.treated = true;
      fee += g.yen(1800);
      g.advance(10);
      lines.push("\u85AC\u5C40\u3067\u85AC\u3092\u53D7\u3051\u53D6\u308A\u307E\u3057\u305F\u3002");
    } else lines.push("\u8A3A\u5BDF\u306E\u7D50\u679C\u3001\u3044\u307E\u306F\u7279\u306B\u75C5\u6C17\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u751F\u6D3B\u30EA\u30BA\u30E0\u3092\u6574\u3048\u307E\u3057\u3087\u3046\u3001\u3068\u8A00\u308F\u308C\u307E\u3057\u305F\u3002");
    const pay = Math.round(fee * copayRate(g));
    if (pay) g.pay(pay, "\u8A3A\u5BDF\u30FB\u85AC\u4EE3(\u81EA\u5DF1\u8CA0\u62C5)");
    lines.push(pay ? `\u4F1A\u8A08\u306F\u81EA\u5DF1\u8CA0\u62C5 \xA5${pay.toLocaleString("ja-JP")}\u3002` : "\u4F1A\u8A08\u306F\u52A9\u6210\u306B\u3088\u308A\u7121\u6599\u3067\u3057\u305F\u3002");
    st3.health = Math.min(100, st3.health + (c.ill ? 4 : 6));
    g.log("health", c.ill ? `\u8A3A\u5BDF\u3092\u53D7\u3051\u3001${DISEASES[c.ill.kind].name}\u306E\u6CBB\u7642\u3092\u59CB\u3081\u305F` : "\u8A3A\u5BDF\u3092\u53D7\u3051\u305F");
    return { msg: lines.join("\n"), mins: g.absMin() - t0 };
  }
  function mentalConsult(g) {
    const c = COND(g.hero), st3 = g.hero.stats;
    const fee = Math.round(g.yen(5e3) * copayRate(g));
    g.advance(60);
    if (fee) g.pay(fee, "\u3053\u3053\u308D\u306E\u76F8\u8AC7(\u81EA\u5DF1\u8CA0\u62C5)");
    c.mental++;
    st3.mood = Math.min(100, st3.mood + 10 + Math.min(6, c.mental));
    st3.energy = Math.min(100, st3.energy + 3);
    g.log("health", "\u3053\u3053\u308D\u306E\u76F8\u8AC7\u3092\u53D7\u3051\u305F");
    return { msg: `\u3086\u3063\u304F\u308A\u8A71\u3092\u805E\u3044\u3066\u3082\u3089\u3044\u307E\u3057\u305F\u3002\u76F8\u8AC7\u3059\u308B\u3053\u3068\u306F\u3001\u3075\u3064\u3046\u306E\u3053\u3068\u3067\u3059\u3002
\u8A3A\u5BDF\u3067\u306F\u306A\u304F\u76F8\u8AC7\u3068\u3057\u3066\u6271\u308F\u308C\u3001\u8A3A\u65AD\u540D\u306F\u3064\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002${fee ? `(\u81EA\u5DF1\u8CA0\u62C5 \xA5${fee.toLocaleString("ja-JP")})` : ""}` };
  }

