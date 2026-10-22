  // src/estatelife.js
  var STAFF_DEFS = [
    { k: "butler_chief", jp: "\u57F7\u4E8B\u9577", a: 6, b: 22 },
    { k: "butler", jp: "\u57F7\u4E8B", a: 7, b: 21 },
    { k: "cook_chief", jp: "\u6599\u7406\u9577", a: 5, b: 21 },
    { k: "cook", jp: "\u6599\u7406\u4EBA", a: 6, b: 20 },
    { k: "maid", jp: "\u5BB6\u653F\u30B9\u30BF\u30C3\u30D5", a: 7, b: 19 },
    { k: "cleaner", jp: "\u6E05\u6383\u30B9\u30BF\u30C3\u30D5", a: 8, b: 17 },
    { k: "gardener", jp: "\u5EAD\u5E2B", a: 7, b: 17 },
    { k: "driver", jp: "\u5C02\u5C5E\u904B\u8EE2\u624B", a: 6, b: 22 },
    { k: "guard", jp: "\u8B66\u5099\u54E1", a: 0, b: 24 },
    { k: "facility", jp: "\u65BD\u8A2D\u7BA1\u7406\u62C5\u5F53", a: 8, b: 18 },
    { k: "pilot", jp: "\u30D1\u30A4\u30ED\u30C3\u30C8", a: 8, b: 17 },
    { k: "secretary", jp: "\u79D8\u66F8", a: 9, b: 18 }
  ];
  var staffDef = (k) => STAFF_DEFS.find((d) => d.k === k);
  function staffRoster(g) {
    const yr = g.year();
    return STAFF_DEFS.filter((d) => d.k !== "pilot" || yr >= 1975).filter((d) => d.k !== "secretary" || yr >= 1960);
  }
  function hireStaff(g) {
    const h = g.hero, F = h.family;
    if (!F || F.env !== "rich") return [];
    const W2 = g.world, p = W2.pop;
    const M = g.S.M;
    const used = /* @__PURE__ */ new Set([h.id, h.father, h.mother]);
    for (const k of Object.keys(h.rel || {})) used.add(+k);
    const ids = {};
    const out = [];
    for (const d of staffRoster(g)) {
      let pick5 = -1;
      for (let q = 0; q < 400; q++) {
        const i = hash2(g.S.seed + d.k.length * 7 + q, 91e3 + STAFF_DEFS.indexOf(d)) % p.n;
        if (used.has(i) || p.gone[i] || p.home[i] < 0 || p.home[i] === h.homeB) continue;
        const a = Math.floor((M - p.born[i]) / 12);
        if (a < 26 || a > 62) continue;
        pick5 = i;
        break;
      }
      if (pick5 < 0) continue;
      used.add(pick5);
      ids[d.k] = pick5;
      out.push({ k: d.k, id: pick5 });
    }
    F.staffIds = ids;
    syncStaff(g);
    return out;
  }
  function syncStaff(g) {
    const W2 = g.world;
    const F = g.hero && g.hero.family;
    W2.staffDuty = null;
    if (!F || !F.staffIds) return;
    const duty = {};
    for (const [k, id] of Object.entries(F.staffIds)) duty[id] = { k, b: g.hero.homeB };
    W2.staffDuty = duty;
  }
  function staffDutyState(world, id, minuteOfDay, dow) {
    const sd = world.staffDuty && world.staffDuty[id];
    if (!sd) return null;
    const d = staffDef(sd.k);
    const h = minuteOfDay / 60;
    const off = ["guard", "butler_chief", "cook_chief", "driver"].includes(sd.k) ? false : dow === 0 && hash2(id, 5) % 2 === 0 || dow === 6 && hash2(id, 6) % 3 === 0;
    if (off) return { s: 0 };
    if (h >= d.a && h < d.b) return { s: 2, at: sd.b, staff: sd.k };
    return { s: 0 };
  }
  var IN = (f2, role, act) => ({ in: { f: f2, role, act } });
  function staffTask(g, k, id) {
    const dt = g.date(), hr = dt.h + dt.mi / 60;
    const alt = hash2(id || 0, Math.floor(hr)) % 2;
    const T4 = (now, where2, next) => ({ now, where: where2, next });
    switch (k) {
      case "butler_chief":
        if (hr < 8) return T4("\u4ECA\u65E5\u306E\u5BB6\u306E\u4E88\u5B9A\u3092\u78BA\u8A8D\u4E2D", IN(0, "butler", "plan"), "8\u6642\u3054\u308D\u7384\u95A2\u3067\u6765\u5BA2\u306E\u6E96\u5099");
        if (hr < 11) return T4("\u6765\u5BA2\u306E\u304A\u51FA\u8FCE\u3048\u306E\u6E96\u5099\u4E2D", IN(0, "butler", "greet"), "\u663C\u98DF\u306E\u914D\u81B3\u3092\u78BA\u8A8D");
        if (hr < 13) return T4("\u663C\u98DF\u306E\u914D\u81B3\u3092\u78BA\u8A8D\u4E2D", IN(0, "cook", "serve"), "\u5348\u5F8C\u306F\u30B9\u30BF\u30C3\u30D5\u3078\u306E\u696D\u52D9\u9023\u7D61");
        if (hr < 17) return T4("\u4ED6\u306E\u30B9\u30BF\u30C3\u30D5\u3068\u696D\u52D9\u9023\u7D61\u4E2D", IN(0, "butler", "plan"), "\u5915\u98DF\u306E\u914D\u81B3\u3092\u6307\u63EE");
        if (hr < 20) return T4("\u5915\u98DF\u306E\u914D\u81B3\u3092\u6307\u63EE\u4E2D", IN(0, "cook", "serve"), "\u6238\u7DE0\u307E\u308A\u306E\u78BA\u8A8D");
        return T4("\u6238\u7DE0\u307E\u308A\u3092\u78BA\u8A8D\u4E2D", IN(0, "butler", "greet"), "\u7FCC\u671D6\u6642\u304B\u3089\u52E4\u52D9");
      case "butler":
        if (hr < 10) return T4("\u5FDC\u63A5\u5BA4\u3067\u6765\u5BA2\u306E\u6E96\u5099\u4E2D", IN(0, "butler", "guest"), "\u7384\u95A2\u30DB\u30FC\u30EB\u3067\u6765\u5BA2\u5BFE\u5FDC");
        if (hr < 16) return T4("\u7384\u95A2\u30DB\u30FC\u30EB\u3067\u6765\u5BA2\u5BFE\u5FDC\u4E2D", IN(0, "butler", "greet"), "\u4E3B\u4EBA\u516C\u30FB\u5BB6\u65CF\u306E\u4E88\u5B9A\u3092\u6848\u5185");
        return T4("\u3054\u5BB6\u65CF\u3078\u306E\u6848\u5185\u30FB\u5915\u98DF\u306E\u6E96\u5099\u78BA\u8A8D\u4E2D", IN(0, "butler", "greet"), "21\u6642\u306B\u52E4\u52D9\u7D42\u4E86");
      case "cook_chief":
        if (hr < 9) return T4("\u671D\u98DF\u306E\u8ABF\u7406\u4E2D", IN(0, "cook", "cook"), "\u98DF\u6750\u306E\u78BA\u8A8D");
        if (hr < 11) return T4("\u98DF\u6750\u3092\u78BA\u8A8D\u4E2D", IN(0, "cook", "prep"), "\u663C\u98DF\u306E\u8ABF\u7406");
        if (hr < 14) return T4("\u663C\u98DF\u306E\u8ABF\u7406\u4E2D", IN(0, "cook", "cook"), "\u5915\u98DF\u306E\u4ED5\u8FBC\u307F");
        if (hr < 16) return T4("\u5915\u98DF\u306E\u4ED5\u8FBC\u307F\u4E2D", IN(0, "cook", "prep"), "\u5915\u98DF\u306E\u8ABF\u7406");
        if (hr < 20) return T4("\u5915\u98DF\u306E\u8ABF\u7406\u4E2D", IN(0, "cook", "cook"), "\u5F8C\u7247\u4ED8\u3051");
        return T4("\u5F8C\u7247\u4ED8\u3051\u3092\u3057\u3066\u3044\u308B", IN(0, "cook", "prep"), "\u7FCC\u671D5\u6642\u304B\u3089\u52E4\u52D9");
      case "cook":
        if (hr < 11) return T4("\u671D\u98DF\u306E\u914D\u81B3\u30FB\u5F8C\u7247\u4ED8\u3051\u4E2D", IN(0, "cook", "serve"), "\u663C\u98DF\u306E\u4E0B\u3054\u3057\u3089\u3048");
        if (hr < 16) return T4("\u88DC\u52A9\u53A8\u623F\u3067\u4E0B\u3054\u3057\u3089\u3048\u4E2D", IN(0, "cook", "prep"), "\u5915\u98DF\u306E\u914D\u81B3");
        return T4("\u5915\u98DF\u306E\u914D\u81B3\u3092\u3057\u3066\u3044\u308B", IN(0, "cook", "serve"), "\u5F8C\u7247\u4ED8\u3051");
      case "maid":
        if (hr < 9) return T4("\u671D\u98DF\u306E\u914D\u81B3\u3092\u624B\u4F1D\u3063\u3066\u3044\u308B", IN(0, "maid", "rest"), "\u5BA4\u5185\u306E\u6383\u9664");
        if (hr < 12) return T4("\u30EA\u30D3\u30F3\u30B0\u306E\u5BA4\u5185\u7BA1\u7406\u4E2D", IN(0, "maid", "rest"), "2\u968E\u306E\u30D9\u30C3\u30C9\u30E1\u30A4\u30AF");
        if (hr < 15) return T4("2\u968E\u306E\u30D9\u30C3\u30C9\u30E1\u30A4\u30AF\u4E2D", IN(1, "maid", "clean"), "\u6D17\u6FEF\u30FB\u30AF\u30ED\u30FC\u30AF\u6574\u7406");
        return T4("\u30AF\u30ED\u30FC\u30AF\u3068\u6D17\u6FEF\u306E\u6574\u7406\u4E2D", IN(0, "maid", alt ? "rest" : "rest"), "19\u6642\u306B\u52E4\u52D9\u7D42\u4E86");
      case "cleaner":
        if (hr < 12) return T4("\u7384\u95A2\u30DB\u30FC\u30EB\u3092\u6E05\u6383\u4E2D", IN(0, "maid", "rest"), "\u663C\u4F11\u307F");
        if (hr < 13) return T4("\u4F7F\u7528\u4EBA\u63A7\u5BA4\u3067\u4F11\u61A9\u4E2D", IN(0, "maid", "rest"), "\u5348\u5F8C\u306F\u5ECA\u4E0B\u30FB\u6D74\u5BA4\u306E\u6E05\u6383");
        return T4("2\u968E\u306E\u5ECA\u4E0B\u3068\u6D74\u5BA4\u3092\u6E05\u6383\u4E2D", IN(1, "maid", "clean"), "17\u6642\u306B\u52E4\u52D9\u7D42\u4E86");
      case "gardener":
        if (hr >= 12 && hr < 13) return T4("\u4F7F\u7528\u4EBA\u63A7\u5BA4\u3067\u4F11\u61A9\u4E2D", IN(0, "gardener", "rest"), "\u5348\u5F8C\u306F\u829D\u751F\u306E\u7BA1\u7406");
        return T4(hr < 12 ? "\u5EAD\u5712\u306E\u690D\u7269\u306E\u624B\u5165\u308C\u4E2D" : "\u829D\u751F\u3068\u5EAD\u5712\u306E\u7BA1\u7406\u4E2D", { out: "garden" }, "17\u6642\u306B\u52E4\u52D9\u7D42\u4E86");
      case "driver":
        if (g.S.driveAway) return T4("\u9001\u8FCE\u306E\u904B\u8EE2\u4E2D", { out: "away" }, "\u5E30\u5EAB\u3057\u3066\u5F85\u6A5F");
        if (hr < 8) return T4("\u8ECA\u4E21\u3092\u70B9\u691C\u4E2D", IN(-1, "driver", "check"), "\u30AC\u30EC\u30FC\u30B8\u3067\u5F85\u6A5F");
        if (hr >= 8 && hr < 9) return T4("\u7384\u95A2\u524D\u306B\u8ECA\u3092\u56DE\u3057\u3066\u3044\u308B", { out: "front" }, "\u30AC\u30EC\u30FC\u30B8\u3067\u5F85\u6A5F");
        return T4("\u30AC\u30EC\u30FC\u30B8\u3067\u5F85\u6A5F\u4E2D", IN(-1, "driver", "wait"), "\u547C\u3079\u3070\u3059\u3050\u306B\u8ECA\u3092\u51FA\u305B\u308B");
      case "guard":
        if (alt) return T4("\u9632\u72AF\u30AB\u30E1\u30E9\u3092\u76E3\u8996\u4E2D", IN(-1, "guard", "monitor"), "\u6B63\u9580\u306E\u8B66\u5099\u306B\u623B\u308B");
        return T4("\u6B63\u9580\u3067\u6765\u5BA2\u3092\u78BA\u8A8D\u4E2D", { out: "gate" }, "\u6577\u5730\u3092\u5DE1\u56DE");
      case "facility":
        return hr < 12 ? T4("\u8A2D\u5099\u3092\u70B9\u691C\u4E2D", IN(-1, "facility", "check"), "\u5348\u5F8C\u306F\u5EAD\u30FB\u30D7\u30FC\u30EB\u306E\u70B9\u691C") : T4("\u30D7\u30FC\u30EB\u3068\u5EAD\u5712\u8A2D\u5099\u3092\u70B9\u691C\u4E2D", { out: "pool" }, "18\u6642\u306B\u52E4\u52D9\u7D42\u4E86");
      case "pilot":
        return hr < 10 ? T4("\u30D8\u30EA\u30B3\u30D7\u30BF\u30FC\u306E\u6A5F\u4F53\u3092\u70B9\u691C\u4E2D", { out: "heli" }, "\u98DB\u884C\u6E96\u5099") : hr < 15 ? T4("\u30D8\u30EA\u30DD\u30FC\u30C8\u3067\u5F85\u6A5F\u4E2D", { out: "heli" }, "\u547C\u3070\u308C\u305F\u3089\u9001\u8FCE\u306E\u30D5\u30E9\u30A4\u30C8") : T4("\u683C\u7D0D\u5EAB\u3067\u6A5F\u4F53\u3092\u6574\u5099\u4E2D", { out: "heli" }, "17\u6642\u306B\u52E4\u52D9\u7D42\u4E86");
      case "secretary":
        return hr < 12 ? T4("\u304A\u7236\u69D8\u306E\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u3092\u8ABF\u6574\u4E2D", IN(0, "butler", "plan"), "\u663C\u306E\u4F1A\u8B70\u306E\u9023\u7D61") : T4("\u6765\u5BA2\u3068\u96FB\u8A71\u306E\u5BFE\u5FDC\u4E2D", IN(0, "butler", "guest"), "18\u6642\u306B\u52E4\u52D9\u7D42\u4E86");
    }
    return T4("\u52E4\u52D9\u4E2D", IN(0, "maid", "rest"), "");
  }
  function staffInfo(g, id) {
    const W2 = g.world;
    const sd = W2.staffDuty && W2.staffDuty[id];
    if (!sd) return null;
    const d = staffDef(sd.k);
    const dt = g.date();
    const st3 = staffDutyState(W2, id, g.S.min, dt.dow);
    if (!st3 || st3.s !== 2) return { jp: d.jp, now: "\u52E4\u52D9\u6642\u9593\u5916(\u81EA\u5B85\u3067\u904E\u3054\u3057\u3066\u3044\u308B)", next: `${d.a === 0 ? "\u4EA4\u4EE3\u5236" : d.a + "\u6642\u3054\u308D"}\u304B\u3089\u52E4\u52D9`, dest: "" };
    const t = staffTask(g, sd.k, id);
    const dest = t.where.in ? ["", "", ""][0] + { "-1": "\u5730\u4E0B", 0: "1\u968E", 1: "2\u968E", 2: "3\u968E" }[t.where.in.f] + "\u3067\u52E4\u52D9" : { garden: "\u5EAD\u5712", gate: "\u6B63\u9580", front: "\u7384\u95A2\u524D", pool: "\u30D7\u30FC\u30EB\u30FB\u5EAD\u5712\u8A2D\u5099", heli: "\u30D8\u30EA\u30DD\u30FC\u30C8", away: "\u5916\u51FA\u4E2D" }[t.where.out] || "";
    return { jp: d.jp, now: t.now, next: t.next, dest };
  }
  function familyPlace(g, id, hr) {
    const h = g.hero;
    const dt = g.date();
    const isF = id === h.father;
    if (hr < 6.5 || hr >= 23) return { f: 1, role: isF ? "father" : "mother", act: "rest" };
    if (hr < 7.5) return { f: 0, role: "cook", act: "serve", dining: true };
    if (hr < 20 && hr >= 18.5) return { f: 0, role: "cook", act: "serve", dining: true };
    if (hr >= 20) return { f: 1, role: isF ? "father" : "mother", act: "rest" };
    return { f: 1, role: isF ? "father" : "mother", act: isF ? "work" : "hobby" };
  }
  function mansionPeople(crowd, g, bIdx, I2, floor, res, personActivity2, dt) {
    const W2 = g.world, p = W2.pop, m = g.S.min, hr = m / 60;
    const used = /* @__PURE__ */ new Set();
    const take = (role, act, seed) => {
      const c = (I2.staffSpots || []).filter((s) => s.role === role && (!act || s.act === act));
      const c2 = c.length ? c : (I2.staffSpots || []).filter((s) => s.role === role);
      if (!c2.length) return null;
      for (let k = 0; k < c2.length; k++) {
        const s = c2[(seed + k) % c2.length];
        const key = s.x + "," + s.y;
        if (!used.has(key)) {
          used.add(key);
          return s;
        }
      }
      return null;
    };
    for (const i of [g.hero.father, g.hero.mother]) {
      if (i == null || i < 0 || p.gone[i]) continue;
      const a = personActivity2(W2, i, m, dt.dow);
      if (a.s !== 0) continue;
      const pl = familyPlace(g, i, hr);
      if (pl.f !== floor) continue;
      let s = null;
      if (pl.dining) {
        const seats = I2.seatSpots || [];
        s = seats.length ? { x: seats[i % 4 + (i === g.hero.father ? 0 : 2)]?.x ?? 6, y: seats[i % 4 + (i === g.hero.father ? 0 : 2)]?.y ?? 22 } : null;
      } else s = take(pl.role, pl.act, i);
      if (s) res.push({ id: i, x: s.x + 0.5, y: s.y + 0.5, dir: "d", role: "family" });
    }
    const duty = W2.staffDuty || {};
    for (const [sid, sd] of Object.entries(duty)) {
      const id = +sid;
      if (p.gone[id] || sd.b !== bIdx) continue;
      const a = personActivity2(W2, id, m, dt.dow);
      if (a.s !== 2) continue;
      const t = staffTask(g, sd.k, id);
      if (!t.where.in || t.where.in.f !== floor) continue;
      const s = take(t.where.in.role, t.where.in.act, id);
      if (s) res.push({ id, x: s.x + 0.5, y: s.y + 0.5, dir: "d", role: "staff", act: t.where.in.act });
    }
    return res;
  }
  function estateOf(g) {
    const m = g.world.map;
    const hb = g.bld(g.hero.homeB);
    return (m.estates || []).find((e) => hb.x >= e.x0 && hb.x <= e.x0 + e.w && hb.y >= e.y0 && hb.y <= e.y0 + e.h) || null;
  }
  function estateOutdoorPeople(g, hx2, hy, radius) {
    const W2 = g.world;
    const duty = W2.staffDuty;
    if (!duty) return [];
    const E2 = estateOf(g);
    if (!E2) return [];
    if (Math.abs(E2.x0 + E2.w / 2 - hx2) > radius + E2.w || Math.abs(E2.y0 + E2.h / 2 - hy) > radius + E2.h) return [];
    const m = g.S.min, dt = g.date();
    const out = [];
    const { personActivity: personActivity2 } = g._pa || {};
    void personActivity2;
    const spot = { garden: [E2.x0 + 12, E2.y0 + 30], gate: [E2.gate.x + 3, E2.gate.y - 3], front: [E2.x0 + 33, E2.y0 + 29], pool: [E2.pool ? E2.pool[0] - 1 : E2.x0 + 40, E2.pool ? E2.pool[1] + 6 : E2.y0 + 20], heli: [E2.heli ? E2.heli.cx + 3 : E2.x0 + 8, E2.heli ? E2.heli.cy + 3 : E2.y0 + 8], away: null };
    for (const [sid, sd] of Object.entries(duty)) {
      const id = +sid;
      const st3 = staffDutyState(W2, id, m, dt.dow);
      if (!st3 || st3.s !== 2) continue;
      const t = staffTask(g, sd.k, id);
      if (!t.where.out) continue;
      const pt = spot[t.where.out];
      if (!pt) continue;
      const jx = (hash2(id, 3) % 5 - 2) * 0.6, jy = (hash2(id, 4) % 5 - 2) * 0.5;
      out.push({ id, static: true, x: pt[0] + jx + 0.5, y: pt[1] + jy + 0.5, dx: 0, dy: 1, s: 3 });
    }
    return out;
  }
  function chauffeurAvail(g) {
    const F = g.hero.family;
    if (!F || !F.staffIds || !F.staffIds.driver) return { ok: false, msg: "\u5C02\u5C5E\u904B\u8EE2\u624B\u306F\u3044\u307E\u305B\u3093" };
    const id = F.staffIds.driver;
    const dt = g.date();
    const st3 = staffDutyState(g.world, id, g.S.min, dt.dow);
    if (!st3 || st3.s !== 2) return { ok: false, msg: "\u5C02\u5C5E\u904B\u8EE2\u624B\u306F\u52E4\u52D9\u6642\u9593\u5916\u3067\u3059(\u671D6\u6642\u301C\u591C22\u6642)" };
    if (g.S.driveAway) return { ok: false, msg: "\u904B\u8EE2\u624B\u306F\u3044\u307E\u9001\u8FCE\u4E2D\u3067\u3059" };
    return { ok: true, id, msg: "\u5C02\u5C5E\u904B\u8EE2\u624B\u304C\u7384\u95A2\u306B\u8ECA\u3092\u56DE\u3057\u307E\u3059(\u89AA\u306E\u6240\u6709\u3059\u308B\u8ECA\u30FB\u6599\u91D1\u306F\u304B\u304B\u308A\u307E\u305B\u3093)" };
  }

