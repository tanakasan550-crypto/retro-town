  // src/vehicle.js
  var VEHICLES = {
    bicycle: { name: "\u81EA\u8EE2\u8ECA", price: 28e3, mult: 1.9, minAge: 6, upkeep: 0 },
    moto: { name: "\u539F\u4ED8\u30D0\u30A4\u30AF", price: 18e4, mult: 2.5, minAge: 16, upkeep: 3e3 },
    car: { name: "\u81EA\u5BB6\u7528\u8ECA(\u4E2D\u53E4)", price: 9e5, mult: 3, minAge: 18, upkeep: 21e3, license: "driver" },
    // 旧セーブ互換(購入すると cars.js の実体のある車に変換される)
    test: { name: "\u8A66\u4E57\u8ECA", price: 0, mult: 3, minAge: 18 }
  };
  var getVeh = (h) => h.veh || (h.veh = { own: {}, ride: null });
  var speedMult = (g) => {
    const _v = g.hero.veh;
    if (_v && _v.ride === "test" && _v.test && Date.now() > _v.test.until) endTest(g);
    const v = g.hero.veh;
    if (!v || !v.ride || g.S.loc.k !== "out") return 1;
    return VEHICLES[v.ride]?.mult || 1;
  };
  function canRide(g, id) {
    if (id === "car") return canDrive(g);
    const V2 = VEHICLES[id], h = g.hero, nd = g.world.pop.needs[h.id];
    if (!V2) return { ok: false, msg: "\u4E57\u308A\u7269\u304C\u3042\u308A\u307E\u305B\u3093" };
    if (!getVeh(h).own[id]) return { ok: false, msg: `${V2.name}\u3092\u6301\u3063\u3066\u3044\u307E\u305B\u3093` };
    if (g.age() < V2.minAge) return { ok: false, msg: `${V2.name}\u306F${V2.minAge}\u6B73\u304B\u3089` };
    if (V2.license && !h.quals[V2.license]) return { ok: false, msg: "\u904B\u8EE2\u514D\u8A31\u304C\u3042\u308A\u307E\u305B\u3093" };
    if (id === "bicycle" && nd & 3) return { ok: false, msg: "\u3053\u306E\u4F53\u3067\u306F\u81EA\u8EE2\u8ECA\u306F\u96E3\u3057\u3044\u3088\u3046\u3067\u3059" };
    return { ok: true };
  }
  function buyVehicle(g, id) {
    const V2 = VEHICLES[id], h = g.hero;
    if (!V2) return { ok: false, msg: "" };
    const v = getVeh(h);
    if (v.own[id]) return { ok: false, msg: `\u3059\u3067\u306B${V2.name}\u3092\u6301\u3063\u3066\u3044\u307E\u3059` };
    if (g.age() < V2.minAge) return { ok: false, msg: `${V2.name}\u306F${V2.minAge}\u6B73\u304B\u3089\u8CB7\u3048\u307E\u3059` };
    if (V2.license && !h.quals[V2.license]) return { ok: false, msg: "\u904B\u8EE2\u514D\u8A31\u304C\u5FC5\u8981\u3067\u3059(18\u6B73\u304B\u3089\u6559\u7FD2\u6240\u306E\u6848\u5185\u304C\u6765\u307E\u3059)" };
    const p = g.yen(V2.price);
    if (h.money < p) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${p.toLocaleString("ja-JP")})` };
    g.pay(p, V2.name + "\u306E\u8CFC\u5165");
    v.own[id] = 1;
    g.log("buy", `${V2.name}\u3092\u8CB7\u3063\u305F`);
    return { ok: true, msg: `${V2.name}\u3092\u8CB7\u3044\u307E\u3057\u305F\u3002\u6301\u3061\u7269\u304B\u3089\u4E57\u308C\u307E\u3059\u3002` };
  }
  function setRide(g, id) {
    if (id && drunkLeft(g) > 0) return { ok: false, msg: `\u304A\u9152\u3092\u98F2\u3093\u3067\u3044\u308B\u305F\u3081\u904B\u8EE2\u3067\u304D\u307E\u305B\u3093(\u3042\u3068\u7D04${Math.ceil(drunkLeft(g) / 60)}\u6642\u9593)` };
    const v = getVeh(g.hero);
    if (!id && g.S.loc.lv) return { ok: false, msg: "\u9AD8\u67B6\u30FB\u9AD8\u901F\u306E\u4E0A\u3067\u306F\u964D\u308A\u3089\u308C\u307E\u305B\u3093\u3002\u51FA\u53E3\u306E\u30E9\u30F3\u30D7\u3092\u4E0B\u308A\u3066\u304B\u3089\u964D\u308A\u307E\u3057\u3087\u3046\u3002" };
    if (!id) {
      if (v.ride === "car") {
        const r = parkHere2(g);
        return r;
      }
      if (v.ride === "moto") parkMoto(g);
      let pm = "";
      if (v.ride === "bicycle") pm = parkBike(g);
      v.ride = null;
      if (pm) return { ok: true, msg: pm };
      return { ok: true, msg: "\u964D\u308A\u307E\u3057\u305F\u3002" };
    }
    if (id === "car") {
      migrateLegacy(g);
      return boardCar(g);
    }
    if (g.S.loc.k !== "out") return { ok: false, msg: "\u4E57\u308A\u7269\u306F\u5C4B\u5916\u3067\u306E\u307F\u4E57\u308C\u307E\u3059" };
    const c = canRide(g, id);
    if (!c.ok) return c;
    if (id === "bicycle" && v.bike && v.bike.parked) {
      const pk = v.bike.parked;
      if (Math.hypot(pk.x - g.S.loc.x, pk.y - g.S.loc.y) > 8) return { ok: false, msg: "\u81EA\u8EE2\u8ECA\u306F\u5C11\u3057\u96E2\u308C\u305F\u5834\u6240\u306B\u505C\u3081\u3066\u3042\u308A\u307E\u3059(\u505C\u3081\u305F\u6240\u307E\u3067\u623B\u308A\u307E\u3057\u3087\u3046)" };
      delete v.bike;
    }
    if (id === "moto" && v.moto && v.moto.parked) {
      const pk = v.moto.parked;
      if (Math.hypot(pk.x - g.S.loc.x, pk.y - g.S.loc.y) > 8) return { ok: false, msg: "\u30D0\u30A4\u30AF\u306F\u5C11\u3057\u96E2\u308C\u305F\u5834\u6240\u306B\u505C\u3081\u3066\u3042\u308A\u307E\u3059(\u5730\u56F3\u306E\u8FD1\u304F\u30FB\u505C\u3081\u305F\u6240\u307E\u3067\u623B\u308A\u307E\u3057\u3087\u3046)" };
      delete v.moto.parked;
    }
    v.ride = id;
    return { ok: true, msg: `${VEHICLES[id].name}\u306B\u4E57\u308A\u307E\u3057\u305F\u3002` };
  }
  function monthlyVehicle(g) {
    const v = g.hero.veh;
    if (!v) return;
    monthlyBike(g);
    monthlyCars(g);
    monthlyCarBiz(g);
  }
  function parkHere2(g) {
    parkHere(g);
    return { ok: true, msg: "\u3053\u3053\u306B\u99D0\u8ECA\u3057\u3066\u964D\u308A\u307E\u3057\u305F\u3002" };
  }
  function endTest(g) {
    const v = g.hero.veh;
    if (!v || !v.test) return;
    g.S.loc.lv = null;
    g.S.loc.z = 0;
    const t = v.test;
    v.ride = t.prevRide || null;
    g.S.loc.x = t.x;
    g.S.loc.y = t.y;
    delete v.test;
    if (g.toastFn) g.toastFn("\u8A66\u4E57\u304C\u7D42\u308F\u308A\u307E\u3057\u305F\u3002");
    g.S.testEnded = (g.S.testEnded || 0) + 1;
  }
  var FDIR = { r: 0, d: 1, l: 2, u: 3 };
  function parkMoto(g) {
    const v = getVeh(g.hero), L2 = g.S.loc;
    if (L2.k !== "out") return;
    v.moto = { parked: { x: +(L2.x - 0.9).toFixed(2), y: +(L2.y + 0.2).toFixed(2), d: FDIR[L2.f] ?? 1 } };
  }
  var rackCache = /* @__PURE__ */ new WeakMap();
  function racksOf(map2) {
    let r = rackCache.get(map2);
    if (!r) {
      r = [];
      for (const p of buildProps(map2).values()) if (p.k === "bikerack") r.push({ x: p.x, y: p.y });
      rackCache.set(map2, r);
    }
    return r;
  }
  function nearestRack(g, x, y, r = 5) {
    let best = null, bd = r;
    for (const k of racksOf(g.world.map)) {
      const d = Math.hypot(k.x + 0.5 - x, k.y + 0.5 - y);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best;
  }
  function parkBike(g) {
    const v = getVeh(g.hero), L2 = g.S.loc;
    if (L2.k !== "out") return "";
    const rk = nearestRack(g, L2.x, L2.y);
    if (rk) {
      v.bike = { parked: { x: rk.x + 0.5, y: rk.y + 0.5, d: rk.x + rk.y & 1 ? 1 : 3, rack: true, M: g.S.M } };
      return "\u99D0\u8F2A\u5834\u306B\u81EA\u8EE2\u8ECA\u3092\u505C\u3081\u307E\u3057\u305F\u3002";
    }
    v.bike = { parked: { x: +(L2.x - 0.7).toFixed(2), y: +(L2.y + 0.3).toFixed(2), d: FDIR[L2.f] ?? 1, rack: false, M: g.S.M } };
    const st3 = g.world.map.stations || [];
    let dS = 99;
    for (const s of st3) dS = Math.min(dS, Math.abs(s.door.x - L2.x) + Math.abs(s.door.y - L2.y));
    return dS < 10 ? "\u8DEF\u4E0A\u306B\u505C\u3081\u307E\u3057\u305F\u3002\u99C5\u306E\u8FD1\u304F\u306F\u653E\u7F6E\u81EA\u8EE2\u8ECA\u3068\u3057\u3066\u64A4\u53BB\u3055\u308C\u308B\u3053\u3068\u304C\u3042\u308A\u307E\u3059(\u99D0\u8F2A\u5834\u306B\u505C\u3081\u307E\u3057\u3087\u3046)\u3002" : "\u8DEF\u4E0A\u306B\u81EA\u8EE2\u8ECA\u3092\u505C\u3081\u307E\u3057\u305F\u3002";
  }
  function monthlyBike(g) {
    const v = g.hero.veh;
    if (!v || !v.bike || !v.bike.parked) return;
    const pk = v.bike.parked;
    if (pk.rack || g.S.M - (pk.M ?? g.S.M) < 1) return;
    const st3 = g.world.map.stations || [];
    let dS = 99;
    for (const s of st3) dS = Math.min(dS, Math.abs(s.door.x - pk.x) + Math.abs(s.door.y - pk.y));
    if (dS >= 10) return;
    delete v.bike;
    delete v.own.bicycle;
    g.pay(g.yen(3e3), "\u653E\u7F6E\u81EA\u8EE2\u8ECA\u306E\u64A4\u53BB\u30FB\u4FDD\u7BA1\u6599");
    g.log("life", "\u99C5\u524D\u306B\u505C\u3081\u305F\u81EA\u8EE2\u8ECA\u304C\u64A4\u53BB\u3055\u308C\u305F(\u4FDD\u7BA1\u6599\u3092\u652F\u6255\u3063\u305F)");
  }

