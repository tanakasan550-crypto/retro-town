  // src/mapv2.js
  var SPEC = (() => {
    const m = {};
    for (const [t, L2] of Object.entries(SUBS)) for (const [k, no] of L2) if (no && !m[no]) m[no] = [t, k];
    return m;
  })();
  var CAP_V2 = { "house/small": 6, "house/std": 8, "house/modern": 8, "house/oldwood": 8, "house/mansion": 10, "villa/villa": 4, "farmhouse/farm": 9, "apt/small": 30, "apt/old": 40, "apt/mid": 150, "apt/danchi": 600, "apt/share": 15, "tower/high": 300 };
  var DZ = (() => {
    const m = {};
    for (const [z, d] of Object.entries(ZONE_D)) (m[d] || (m[d] = [])).push(z);
    m.D03 = ["downtown"];
    m.D09 = [...m.D09 || [], "rural_s"];
    return m;
  })();
  var NATURAL = /* @__PURE__ */ new Set([13, 14, 15, 17, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 46, 54, 55, 56, 57, 60, 70, 71, 72]);
  var NEAR = { D01: ["D02", "D03"], D02: ["D01", "D03"], D03: ["D01", "D02"], D04: ["D01", "D05"], D05: ["D06", "D07", "D04"], D06: ["D05", "D07"], D07: ["D05", "D06", "D08"], D08: ["D07", "D05"], D09: ["D08", "D10"], D10: ["D09"], D11: ["D12", "D04"], D12: ["D11"] };
  var NAME_BY_SPEC = { 13: "\u30B3\u30F3\u30D3\u30CB", 14: "\u30B3\u30F3\u30D3\u30CB", 15: "\u30B3\u30F3\u30D3\u30CB", 17: "\u30B9\u30FC\u30D1\u30FC", 21: "\u30C9\u30E9\u30C3\u30B0", 22: "100\u5186\u30B7\u30E7\u30C3\u30D7", 23: "\u30D9\u30FC\u30AB\u30EA\u30FC", 24: "\u66F8\u5E97", 25: "\u30D6\u30C6\u30A3\u30C3\u30AF", 26: "\u96FB\u5668", 27: "\u30D5\u30E9\u30EF\u30FC", 28: "\u30DA\u30C3\u30C8\u30B7\u30E7\u30C3\u30D7", 29: "\u3089\u30FC\u3081\u3093", 30: "\u98DF\u5802", 31: "\u30AB\u30D5\u30A7", 32: "\u73C8\u7432\u5E97", 33: "\u30D5\u30A1\u30DF\u30EA\u30FC\u30EC\u30B9\u30C8\u30E9\u30F3", 34: "\u30D0\u30FC\u30AC\u30FC", 35: "\u305D\u3070\u51E6", 36: "\u713C\u8089", 37: "\u5C45\u9152\u5C4B", 38: "\u5BFF\u53F8", 39: "\u30EC\u30B9\u30C8\u30E9\u30F3", 40: "\u30B9\u30CA\u30C3\u30AF", 46: "\u9032\u5B66\u587E", 54: "\u30AF\u30EA\u30CB\u30C3\u30AF", 55: "\u6B6F\u79D1", 56: "\u5C02\u9580\u30AF\u30EA\u30CB\u30C3\u30AF", 57: "\u85AC\u5C40", 60: "\u3053\u3053\u308D\u306E\u30AF\u30EA\u30CB\u30C3\u30AF", 70: "\u30B2\u30FC\u30E0\u30B3\u30FC\u30CA\u30FC", 71: "\u30CD\u30C3\u30C8\u30AB\u30D5\u30A7", 72: "\u30D5\u30A3\u30C3\u30C8\u30CD\u30B9" };
  var NAMED_TYPES = /* @__PURE__ */ new Set(["shop", "restaurant", "cafe", "izakaya", "clothes", "bookstore", "pharmacy", "clinic", "gamecenter", "gym", "cram", "ramen", "konbini", "seafood"]);
  var TENANT_SPEC = { 70: ["gamecenter", "arcade"] };
  var PARENT_CAP = { mall: 14, dept: 10, tower: 5, office: 6, hotel: 2, resorthotel: 2, bizhotel: 1, hospital: 3, univ: 3, tourtower: 3 };
  var parentCap = (b) => {
    if (b.tenant) return 0;
    if (b.type === "apt") {
      const k = subOf(b);
      return k === "mid" ? 2 : k === "danchi" ? 3 : 0;
    }
    return PARENT_CAP[b.type] || 0;
  };
  var accepts = (par, no) => par.type === "hospital" ? [13, 31, 57].includes(no) : par.type === "univ" ? [13, 24, 30, 31].includes(no) : par.type === "tourtower" ? [29, 30, 31, 33, 39].includes(no) : true;
  var floorOf = (par, no, rng) => {
    const top = Math.max(1, par.floors || 1);
    const f2 = no >= 54 && no <= 60 ? 2 + rng.int(3) : no === 46 ? 3 : no === 72 ? 2 : no === 71 ? 3 + rng.int(2) : no >= 29 && no <= 40 ? 1 + rng.int(2) : 1;
    return Math.max(1, Math.min(f2, top > 1 ? Math.max(2, top + 2) : f2));
  };
  var PRI = (t) => ({ cityhall: 0, hospital: 0, univ: 0, hs: 1, jh: 1, elem: 1, mall: 1, dept: 1, tower: 2, station: 2, hotel: 2, resorthotel: 2, super: 3, apt: 4, house: 5, farmhouse: 5 })[t] ?? 3;
  function fillPlan(env) {
    var _a;
    const { buildings, zones, tryPlace, placeAt, lotFreeAt, addTenant, setRng, seed, COASTAL } = env;
    const rng = new Rng(seed, "map-v2");
    setRng(rng);
    dead = /* @__PURE__ */ new Set();
    const cnt = {};
    const addC = (no, d) => {
      (cnt[no] || (cnt[no] = {}))[d] = (cnt[no][d] || 0) + 1;
    };
    for (const b of buildings) {
      const L2 = SUBS[b.type];
      if (L2 && L2.length === 1 && L2[0][1]) addC(L2[0][1], districtOf(b));
    }
    for (const b of buildings) {
      const L2 = SUBS[b.type];
      if (!L2 || L2.length < 2) continue;
      const d = districtOf(b);
      let best = null, bs = 0;
      for (const [k, no] of L2) {
        if (!no) continue;
        const tg = PLAN[no].d[d.slice(1)] || 0;
        if (!tg) continue;
        const sc = (tg - ((cnt[no] || {})[d] || 0)) / tg;
        if (sc > bs) {
          bs = sc;
          best = [k, no];
        }
      }
      if (best) {
        b.pin = best[0];
        b.spec = best[1];
        const c = CAP_V2[b.type + "/" + best[0]];
        if (c) b.cap = c;
        addC(best[1], d);
      } else {
        const k = subOf(b);
        const no = k ? (L2.find((x) => x[0] === k) || [])[1] : 0;
        if (no) addC(no, d);
      }
    }
    const cur2 = {};
    for (const b of buildings) {
      const sk2 = subOf(b);
      const no = sk2 ? (SUBS[b.type].find((s) => s[0] === sk2) || [])[1] : 0;
      if (!no) continue;
      const d = districtOf(b);
      (cur2[no] || (cur2[no] = {}))[d] = (cur2[no][d] || 0) + 1;
    }
    const jobs = [];
    for (const [no, p] of Object.entries(PLAN)) {
      const sp = SPEC[no];
      if (!sp) continue;
      for (const [d, n2] of Object.entries(p.d)) {
        const need = n2 - ((cur2[no] || {})[`D${d}`] || 0);
        for (let i = 0; i < need; i++) jobs.push({ no: +no, type: sp[0], sub: sp[1], d: "D" + d });
      }
    }
    jobs.sort((a, b) => PRI(a.type) - PRI(b.type) || a.no - b.no);
    const placed = {}, failed = {}, tenants = {};
    const zby = (id) => zones.find((z) => z.id === id);
    const bump2 = (o, k) => {
      o[k] = (o[k] || 0) + 1;
    };
    const rr3 = {};
    const physical = (j) => {
      const zl = (DZ[j.d] || []).map(zby).filter(Boolean);
      if (!zl.length) return null;
      let ok = null;
      for (let t = 0; t < zl.length && !ok; t++) {
        const z = zl[(rr3[j.d] = (rr3[j.d] || 0) + 1) % zl.length];
        if (COASTAL.has(j.type)) {
          ok = tryPlace(j.type, z.id, z.x, z.y, z.rx + 2, z.ry + 2, true);
          continue;
        }
        ok = scan(j.type, z, rng, lotFreeAt, placeAt);
      }
      if (ok) {
        ok.pin = j.sub;
        ok.spec = j.no;
        const c = CAP_V2[j.type + "/" + j.sub];
        if (c) ok.cap = c;
      }
      return ok;
    };
    for (const j of jobs) {
      if (PRI(j.type) > 4 || NATURAL.has(j.no)) continue;
      if (physical(j)) bump2(placed, j.no);
      else bump2(failed, j.no);
    }
    const room2 = /* @__PURE__ */ new Map();
    for (const b of buildings) {
      if (b.tenant) continue;
      const c = parentCap(b);
      if (c > 0) room2.set(b.idx, c - (b.tenants ? b.tenants.length : 0));
    }
    const byD = {};
    for (const b of buildings) if (room2.has(b.idx)) (byD[_a = districtOf(b)] || (byD[_a] = [])).push(b);
    for (const j of jobs) {
      if (!NATURAL.has(j.no)) continue;
      const ts = TENANT_SPEC[j.no] || [j.type, j.sub];
      let cand = [];
      for (const dd of [j.d, ...NEAR[j.d] || []]) {
        cand = (byD[dd] || []).filter((b) => room2.get(b.idx) > 0 && accepts(b, j.no));
        if (cand.length) break;
      }
      if (!cand.length) {
        bump2(failed, j.no);
        continue;
      }
      const par = cand[rng.int(cand.length)];
      room2.set(par.idx, room2.get(par.idx) - 1);
      const t = addTenant(par, ts[0], { pin: ts[1], spec: j.no, tfloor: floorOf(par, j.no, rng), name: rng.pick(SHOP_PREFIX) + (NAME_BY_SPEC[j.no] || BTYPES[ts[0]].label) });
      if (districtOf(par) !== j.d) t.dist = j.d;
      (par.tenants || (par.tenants = [])).push(t.idx);
      bump2(tenants, j.no);
    }
    for (const j of jobs) {
      if (PRI(j.type) <= 4 || NATURAL.has(j.no)) continue;
      if (physical(j)) bump2(placed, j.no);
      else bump2(failed, j.no);
    }
    for (const b of buildings) if (!b.tenant && b.spec && NAME_BY_SPEC[b.spec] && NAMED_TYPES.has(b.type) && !b.name) b.name = rng.pick(SHOP_PREFIX) + NAME_BY_SPEC[b.spec];
    return { placed, failed, tenants, wanted: jobs.length };
  }
  var dead = /* @__PURE__ */ new Set();
  function scan(type, z, rng, lotFreeAt, placeAt) {
    const bt = BTYPES[type];
    const cands = [];
    const dk = bt.w + "x" + bt.h + "|" + z.id;
    if (dead.has(dk)) return null;
    for (const gr of BTYPES[type].cat === "res" ? [1, 1.6, 2.2, 3, 4] : [1, 1.6, 2.2]) {
      cands.length = 0;
      for (let by = Math.floor(z.y - z.ry * gr); by <= z.y + z.ry * gr; by++) for (let bx = Math.floor(z.x - z.rx * gr); bx <= z.x + z.rx * gr; bx++) {
        const dx = (bx + bt.w / 2 - z.x) / (z.rx * gr), dy = (by + bt.h / 2 - z.y) / (z.ry * gr);
        if (dx * dx + dy * dy > 1) continue;
        if (lotFreeAt(type, bx, by)) cands.push(bx, by);
      }
      let n2 = cands.length / 2;
      for (let tr = 0; tr < 10 && n2 > 0; tr++) {
        const i = rng.int(n2), b = placeAt(type, z.id, cands[i * 2], cands[i * 2 + 1]);
        if (b) return b;
        cands[i * 2] = cands[(n2 - 1) * 2];
        cands[i * 2 + 1] = cands[(n2 - 1) * 2 + 1];
        n2--;
      }
    }
    dead.add(dk);
    return null;
  }

