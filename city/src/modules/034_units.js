  // src/units.js
  var UNIT_BASE = 1e3;
  var unitCode = (lv, pos) => UNIT_BASE + lv * 100 + pos;
  var isUnitFloor = (f2) => f2 >= UNIT_BASE;
  var decodeUnit = (f2) => ({ lv: Math.floor((f2 - UNIT_BASE) / 100), pos: (f2 - UNIT_BASE) % 100 });
  function aptLifts(b, nf = storeys(b)) {
    if (b.type !== "apt") return 0;
    const e = b.era | 0;
    if (!(nf >= 5 && e >= 1 || nf >= 4 && e >= 2 || nf >= 6)) return 0;
    return nf >= 8 ? 2 : 1;
  }
  function condoPlan(b, need = 0) {
    // 住戸の割り当ては建設当初の階数で固定(旧セーブの部屋番号を保つ)。実際の階数は fixCondoHeights で居住者数に合わせる
    const nf = b.planNf || storeys(b);
    const bt = BTYPES[b.type];
    const resFloors = Math.max(1, nf - 1);
    const total = Math.max(resFloors * 2, Math.round((bt.cap || 40) / 2.4), Math.ceil(need * 1.1));
    const perFloor = Math.min(16, Math.max(2, Math.ceil(total / resFloors)));
    return { nf, resFloors, perFloor, units: resFloors * perFloor, tower: b.type === "tower", lifts: b.type === "tower" ? storeys(b) >= 14 ? 3 : 2 : aptLifts(b, storeys(b)) };
  }
  var isCondo = (b) => b && (b.type === "apt" || b.type === "tower");
  var roomNo = (lv, pos) => String((lv + 1) * 100 + pos + 1);
  var cache5 = /* @__PURE__ */ new Map();
  function homeOfPerson(g, i) {
    return i === g.hero.id ? g.hero.homeB : g.world.pop.home[i];
  }
  function registry(g, bIdx) {
    const w = g.world, p = w.pop, b = w.map.buildings[bIdx];
    let plan = condoPlan(b);
    const stamp = g.S.M + ":" + (g.hero.homeB === bIdx ? 1 : 0) + ":" + (g.hero.owned || []).includes(bIdx);
    const c = cache5.get(bIdx);
    if (c && c.stamp === stamp && c.pop === p) return c.v;
    const res = [];
    for (let i = 0; i < p.n; i++) {
      if (p.gone[i]) continue;
      if (i === g.hero.id) {
        if (g.hero.homeB === bIdx) res.push(i);
        continue;
      }
      if (p.home[i] === bIdx) res.push(i);
    }
    const root = /* @__PURE__ */ new Map();
    const find = (i) => {
      while (root.get(i) !== i) i = root.get(i);
      return i;
    };
    for (const i of res) root.set(i, i);
    const inB = (i) => i >= 0 && root.has(i);
    for (const i of res) {
      for (const j of [p.spouse[i], p.mother[i], p.father[i]]) if (inB(j)) {
        const a = find(i), c2 = find(j);
        if (a !== c2) root.set(Math.max(a, c2), Math.min(a, c2));
      }
    }
    const hh = /* @__PURE__ */ new Map();
    for (const i of res) {
      const r = find(i);
      if (!hh.has(r)) hh.set(r, []);
      hh.get(r).push(i);
    }
    plan = condoPlan(b, hh.size);
    const units = [];
    for (let s = 0; s < Math.max(plan.units, hh.size); s++) {
      const lv = 1 + Math.floor(s / plan.perFloor), pos = s % plan.perFloor;
      units.push({ slot: s, lv, pos, room: roomNo(lv, pos), hh: [], root: -1, owner: "vacant" });
    }
    const roots = [...hh.keys()].sort((a, c2) => a - c2);
    for (const r of roots) {
      let s = hash2(r, bIdx * 31 + 7) % plan.units;
      for (let k = 0; k < units.length && units[s % units.length].root >= 0; k++) s++;
      const u = units[s % units.length];
      u.root = r;
      u.hh = hh.get(r);
    }
    const mine = g.hero.homeB === bIdx;
    for (const u of units) {
      if (u.root < 0) {
        u.owner = hash2(bIdx, u.slot * 13 + 5) % 100 < 35 ? "investor" : "developer";
        continue;
      }
      if (u.hh.includes(g.hero.id)) {
        u.owner = mine && (g.hero.owned || []).includes(bIdx) ? "hero" : "landlord";
        u.hero = true;
        continue;
      }
      u.owner = hash2(u.root, 4141) % 100 < (b.type === "tower" ? 62 : 38) ? "resident" : "landlord";
    }
    const v = { plan, units, households: roots.length, residents: res.length, vacant: units.filter((u) => u.root < 0).length };
    cache5.set(bIdx, { stamp, pop: p, v });
    if (cache5.size > 40) cache5.clear();
    return v;
  }
  function unitOfPerson(g, i) {
    const bi = homeOfPerson(g, i);
    if (bi == null || bi < 0) return null;
    const b = g.world.map.buildings[bi];
    if (!isCondo(b)) return null;
    const R5 = registry(g, bi);
    const u = R5.units.find((x) => x.hh.includes(i));
    return u ? { b: bi, ...u } : null;
  }
  var nameplate = (g, u) => u.root < 0 ? "\u7A7A\u5BA4" : g.nameOf(u.root).split(/\s|　/)[0] + "\u5BB6";
  var OWNER_LABEL = { hero: "\u3042\u306A\u305F\u306E\u6301\u3061\u5BB6", resident: "\u5206\u8B72(\u5C45\u4F4F\u8005\u304C\u6240\u6709)", landlord: "\u8CC3\u8CB8(\u8CB8\u4E3B\u3042\u308A)", investor: "\u7A7A\u5BA4(\u6295\u8CC7\u7528\u30FB\u8CC3\u8CB8\u52DF\u96C6)", developer: "\u7A7A\u5BA4(\u5206\u8B72\u30FB\u58F2\u51FA\u3057\u4E2D)" };

