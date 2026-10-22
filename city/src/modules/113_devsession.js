  // src/devsession.js
  function openTestSession(g, opts = {}) {
    if (!devToolsEnabled()) return null;
    const c = Game.load(fromJSON(toJSON(g.serialize())));
    c.S.testSession = { since: Date.now(), bypass: { ...TEST_DEFAULT_BYPASS, ...opts.bypass || {} }, moves: [], insp: {} };
    if (c.S.testSession.bypass.money) testMoneyOn(c);
    c.S.testSession.bypass.age = !!c.S.testSession.bypass.age;
    clearInteriorCache();
    return c;
  }
  var sessionOf = (g) => isTestSession(g) ? g.S.testSession : null;
  function districtOf2(b) {
    const a = b.addr || "";
    const m = a.match(/^(.*?)(?:\d|丁目)/);
    return (m ? m[1] : a).replace(/\s+$/, "") || b.zone || "-";
  }
  function floorList(b) {
    const k = bigKind(b);
    if (k) {
      const { lo, hi: hi2 } = levelRange(b);
      const out2 = [];
      for (let f2 = lo; f2 <= hi2; f2++) out2.push({ floor: f2, label: levelLabel(b, f2) });
      return out2;
    }
    if (isSchoolBig(b)) {
      const n3 = b.floors || 1;
      const out2 = [];
      for (let f2 = 0; f2 < n3; f2++) out2.push({ floor: f2, label: floorLabel(b, f2) });
      return out2;
    }
    const n2 = b.floors || 1;
    const out = [];
    for (let f2 = 0; f2 < n2; f2++) out.push({ floor: f2, label: f2 + 1 + "F" });
    return out;
  }
  function facilityRows(g, { q = "", type = "", district = "", enterOnly = false } = {}) {
    const map2 = g.world.map;
    const rows2 = [];
    for (const b of map2.buildings) {
      const bt = BTYPES[b.type];
      if (!bt) continue;
      if (type && b.type !== type) continue;
      const d = districtOf2(b);
      if (district && d !== district) continue;
      if (enterOnly && !bt.enter) continue;
      if (q && !`${b.name}${bt.label}${b.addr || ""}${b.id}`.includes(q)) continue;
      rows2.push({ idx: b.idx, id: b.id, name: b.name, type: b.type, label: bt.label, district: d, x: b.x, y: b.y, w: b.w, h: b.h, doorX: b.doorX, doorY: b.doorY, floors: floorList(b).length, enter: !!bt.enter, status: b.status || "open" });
    }
    return rows2;
  }
  function mark(g, what) {
    const s = sessionOf(g);
    if (s) s.moves.push({ what, M: g.S.M, teleport: true });
  }
  function devGotoDoor(g, bIdx) {
    if (!isTestSession(g)) return { ok: false, msg: "\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u4E2D\u306E\u307F\u4F7F\u3048\u307E\u3059" };
    const b = g.world.map.buildings[bIdx];
    if (!b) return { ok: false, msg: "\u65BD\u8A2D\u304C\u3042\u308A\u307E\u305B\u3093" };
    const L2 = g.S.loc;
    if (L2.k === "in") {
      delete L2.tr;
      delete L2.z;
    }
    delete L2.b;
    delete L2.floor;
    delete L2.sl;
    L2.k = "out";
    L2.x = b.doorX + 0.5;
    L2.y = b.doorY + 0.6;
    L2.f = "u";
    if (g.hero.veh) g.hero.veh.ride = null;
    mark(g, "door:" + b.id);
    clearInteriorCache();
    return { ok: true, msg: `${b.name}\u306E\u5165\u53E3\u3078\u79FB\u52D5(\u8A66\u9A13\u7528\u306E\u76F4\u63A5\u79FB\u52D5)` };
  }
  function devGotoFloor(g, bIdx, floor = 0) {
    if (!isTestSession(g)) return { ok: false, msg: "\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u4E2D\u306E\u307F\u4F7F\u3048\u307E\u3059" };
    const b = g.world.map.buildings[bIdx];
    if (!b) return { ok: false, msg: "\u65BD\u8A2D\u304C\u3042\u308A\u307E\u305B\u3093" };
    const bt = BTYPES[b.type];
    if (!bt.enter) return { ok: false, msg: `${b.name}\u306F\u7ACB\u5165\u3067\u304D\u306A\u3044\u65BD\u8A2D\u3067\u3059(\u5916\u89B3\u306E\u307F)` };
    const L2 = g.S.loc;
    delete L2.tr;
    delete L2.z;
    delete L2.sl;
    L2.k = "in";
    L2.b = bIdx;
    L2.floor = floor;
    const { I: I2 } = interiorOf(g, bIdx, floor);
    L2.x = I2.door ? I2.door.x + 0.5 : I2.W / 2;
    L2.y = I2.H - 1.6;
    L2.f = "u";
    mark(g, `in:${b.id}:${floor}`);
    const fl = floorList(b).find((f2) => f2.floor === floor);
    return { ok: true, msg: `${b.name} ${fl ? fl.label : floor}\u3078(\u8A66\u9A13\u7528\u306E\u76F4\u63A5\u79FB\u52D5)` };
  }

