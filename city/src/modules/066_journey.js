  // src/journey.js
  var MODE = {
    air: { label: "\u822A\u7A7A\u6A5F", place: "\u7A7A\u6E2F", edge: "air", slot: { from: 7 * 60, to: 20 * 60, every: 90 }, scene: "plane", icon: "\u2708" },
    ferry: { label: "\u8239", place: "\u30D5\u30A7\u30EA\u30FC\u30BF\u30FC\u30DF\u30CA\u30EB", edge: "ferry", slot: { from: 8 * 60, to: 17 * 60, every: 60 }, scene: "ship", icon: "\u26F4" },
    bullet: { label: "\u65B0\u5E79\u7DDA", place: "\u65B0\u5E79\u7DDA\u99C5", edge: "shinkansen", slot: { from: 6 * 60, to: 22 * 60, every: 30 }, scene: "bullet", icon: "\u{1F685}" }
  };
  var SCENIC = { air: { id: "scenic", name: "\u904A\u89A7\u98DB\u884C(\u7A7A\u6E2F\u3092\u767A\u7740\u3057\u3001\u8857\u3068\u6D77\u306E\u4E0A\u3092\u4E00\u5468)", fare: 12e3, mins: 40, from: 1960 }, ferry: { id: "scenic", name: "\u6E7E\u5185\u30AF\u30EB\u30FC\u30BA(\u6E2F\u3092\u307E\u308F\u3063\u3066\u623B\u308B)", fare: 2500, mins: 50, from: 1946 } };
  var hm = (m) => {
    m = (m % 1440 + 1440) % 1440;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
  };
  function nextSlot(mode2, min) {
    const s = MODE[mode2].slot;
    if (min > s.to) return null;
    if (min <= s.from) return s.from;
    return s.from + Math.ceil((min - s.from) / s.every) * s.every <= s.to ? s.from + Math.ceil((min - s.from) / s.every) * s.every : null;
  }
  function departures(mode2, min, n2 = 4) {
    const out = [];
    let t = min;
    for (let i = 0; i < n2; i++) {
      const d = nextSlot(mode2, t);
      if (d == null) break;
      out.push(d);
      t = d + 1;
    }
    return out;
  }
  function offers(g, mode2) {
    const year = g.year(), age = g.age(), money = g.hero.money, has = new Set(Object.keys(g.hero.quals || {}));
    const out = [];
    const sc = SCENIC[mode2];
    if (sc && year >= sc.from) {
      const f2 = g.yen(sc.fare);
      out.push({ id: sc.id, name: sc.name, fare: f2, mins: sc.mins, scenic: true, stub: false, ok: money >= f2 && age >= 3, reasons: money >= f2 ? [] : ["money"] });
    }
    for (const c of connectionsFrom(HOME_REGION, { year, age, money: 1e12, has }, g.world.map, { includeUnavailable: true })) {
      if (c.mode !== MODE[mode2].edge) continue;
      const f2 = g.yen(c.fare) * 2;
      if (c.reasons.includes("era")) continue;
      const reasons = c.reasons.filter((r) => r !== "money");
      if (money < f2) reasons.push("money");
      if (age < 12) reasons.push("age");
      out.push({ id: c.to, name: `${c.name}(\u5F80\u5FA9)`, fare: f2, mins: c.mins, scenic: false, stub: !REGIONS[c.to].available, ok: reasons.length === 0, reasons });
    }
    return out;
  }
  var REASON = { money: "\u6240\u6301\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093", era: "\u3053\u306E\u5E74\u4EE3\u306B\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093", age: "12\u6B73\u672A\u6E80\u306F\u4FDD\u8B77\u8005\u306E\u540C\u4F34\u304C\u5FC5\u8981\u3067\u3059(\u672A\u5BFE\u5FDC)", "need:passport": "\u65C5\u5238(\u30D1\u30B9\u30DD\u30FC\u30C8)\u304C\u5FC5\u8981\u3067\u3059" };
  function buyTicket(g, mode2, id) {
    const S2 = g.S;
    if (S2.trip) return { ok: false, msg: "\u3059\u3067\u306B\u4E57\u8ECA\u5238\u3092\u304A\u6301\u3061\u3067\u3059\u3002\u5148\u306B\u4F7F\u3046\u304B\u3001\u6255\u3044\u623B\u3057\u3066\u304F\u3060\u3055\u3044\u3002" };
    const o = offers(g, mode2).find((x) => x.id === id);
    if (!o) return { ok: false, msg: "\u305D\u306E\u4FBF\u306F\u3042\u308A\u307E\u305B\u3093\u3002" };
    if (!o.ok) return { ok: false, msg: o.reasons.map((r) => REASON[r] || r).join(" / ") };
    g.pay(o.fare, `${MODE[mode2].label}\u306E\u4E57\u8ECA\u5238`);
    g.advance(8);
    S2.trip = { mode: mode2, id: o.id, name: o.name, fare: o.fare, mins: o.mins, scenic: o.scenic, stub: o.stub, step: 1, origin: g.S.loc && g.S.loc.b };
    return { ok: true, msg: `${o.name}\u306E\u4E57\u8ECA\u5238\u3092\u8CB7\u3044\u307E\u3057\u305F(\xA5${o.fare.toLocaleString()})\u3002` + (mode2 === "air" ? "\u4FDD\u5B89\u691C\u67FB\u5834\u3092\u901A\u3063\u3066\u3001\u642D\u4E57\u53E3\u3078\u9032\u307F\u307E\u3057\u3087\u3046\u3002" : "\u4E57\u308A\u5834\u3078\u9032\u307F\u307E\u3057\u3087\u3046\u3002") };
  }
  function refund(g) {
    const t = g.S.trip;
    if (!t || t.step >= 3) return { ok: false, msg: "\u6255\u3044\u623B\u3057\u3067\u304D\u308B\u5238\u304C\u3042\u308A\u307E\u305B\u3093\u3002" };
    const back = Math.round(t.fare * 0.8);
    g.hero.money += back;
    g.S.trip = null;
    return { ok: true, msg: `\u6255\u3044\u623B\u3057\u307E\u3057\u305F(\u624B\u6570\u6599\u3092\u5F15\u3044\u3066\xA5${back.toLocaleString()})\u3002` };
  }
  function securityCheck(g) {
    const t = g.S.trip;
    if (!t || t.mode !== "air") return { ok: false, msg: "\u642D\u4E57\u5238\u304C\u3042\u308A\u307E\u305B\u3093\u30021\u968E\u306E\u642D\u4E57\u624B\u7D9A\u304D\u30AB\u30A6\u30F3\u30BF\u30FC\u3067\u822A\u7A7A\u5238\u3092\u8CB7\u3063\u3066\u304F\u3060\u3055\u3044\u3002" };
    if (t.step >= 2) return { ok: true, msg: "\u3059\u3067\u306B\u4FDD\u5B89\u691C\u67FB\u3092\u901A\u904E\u3057\u3066\u3044\u307E\u3059\u3002\u642D\u4E57\u53E3\u3078\u3069\u3046\u305E\u3002" };
    g.advance(15);
    t.step = 2;
    return { ok: true, msg: "\u624B\u8377\u7269\u691C\u67FB\u3068\u91D1\u5C5E\u63A2\u77E5\u3092\u901A\u904E\u3057\u307E\u3057\u305F\u3002\u642D\u4E57\u53E3\u3078\u9032\u3081\u307E\u3059\u3002" };
  }
  function boardInfo(g, mode2) {
    const t = g.S.trip;
    if (!t || t.mode !== mode2) return { ok: false, msg: `\u3053\u306E\u4E57\u308A\u5834\u3067\u4F7F\u3048\u308B\u4E57\u8ECA\u5238\u304C\u3042\u308A\u307E\u305B\u3093\u3002` + (mode2 === "air" ? "\u642D\u4E57\u624B\u7D9A\u304D\u30AB\u30A6\u30F3\u30BF\u30FC\u3078\u3002" : "\u5207\u7B26\u58F2\u308A\u5834\u3078\u3002") };
    if (mode2 === "air" && t.step < 2) return { ok: false, msg: "\u4FDD\u5B89\u691C\u67FB\u3092\u6E08\u307E\u305B\u3066\u304F\u3060\u3055\u3044(\u642D\u4E57\u624B\u7D9A\u304D\u2192\u4FDD\u5B89\u691C\u67FB\u5834\u2192\u642D\u4E57\u53E3)\u3002" };
    if (t.step >= 3) return { ok: false, msg: "\u3059\u3067\u306B\u4E57\u8ECA\u6E08\u307F\u3067\u3059\u3002" };
    const now = g.S.min;
    const dep = nextSlot(mode2, now + 5);
    if (dep == null) return { ok: false, msg: "\u672C\u65E5\u306E\u904B\u822A\u306F\u7D42\u4E86\u3057\u307E\u3057\u305F\u3002\u5238\u306F\u6255\u3044\u623B\u3057\u3067\u304D\u307E\u3059\u3002" };
    return { ok: true, dep, wait: dep - now, trip: t };
  }
  function board(g, mode2) {
    const bi = boardInfo(g, mode2);
    if (!bi.ok) return bi;
    const t = bi.trip;
    g.advance(bi.wait);
    t.step = 3;
    const sceneKind = MODE[mode2].scene;
    const verb = mode2 === "air" ? "\u642D\u4E57" : mode2 === "ferry" ? "\u4E57\u8239" : "\u4E57\u8ECA";
    return { ok: true, scene: { kind: sceneKind, dur: 11, mins: t.mins, text: t.scenic ? `${t.name.replace(/\(.*/, "")} \u7D04${t.mins}\u5206` : `${t.name.replace(/\(.*/, "")}\u3078 \u7D04${t.mins}\u5206`, scenic: t.scenic }, msg: `${hm(bi.dep)}\u767A\u306B${verb}\u3057\u307E\u3057\u305F\u3002` };
  }
  function arrive(g) {
    const t = g.S.trip;
    if (!t) return { ok: false, msg: "" };
    if (t.scenic) {
      g.advance(t.mins);
      g.chg({ mood: 14, energy: -4 });
      record(g, t, "\u904A\u89A7");
      g.S.stats.rides++;
      g.log("trip", `${MODE[t.mode].label}\u3067${t.name.replace(/\(.*/, "")}\u3092\u697D\u3057\u3093\u3060`);
      g.S.trip = null;
      return { ok: true, back: true, msg: `${t.name.replace(/\(.*/, "")}\u304B\u3089\u623B\u308A\u307E\u3057\u305F\u3002\u666F\u8272\u304C\u5FD8\u308C\u3089\u308C\u307E\u305B\u3093\u3002` };
    }
    g.advance(t.mins);
    t.step = 4;
    g.S.stats.rides++;
    return { ok: true, away: true, msg: `${t.name.replace(/\(.*/, "")}\u306B\u5230\u7740\u3057\u307E\u3057\u305F\u3002` };
  }
  var awayInfo = (g) => {
    const t = g.S.trip;
    return t && t.step === 4 ? { name: t.name.replace(/\(.*/, ""), stub: t.stub, mode: t.mode, mins: t.mins } : null;
  };
  function stayAway(g) {
    const t = g.S.trip;
    if (!t || t.step !== 4) return { ok: false, msg: "" };
    g.advance(90);
    g.chg({ mood: 8, hunger: -12, energy: -4 });
    t.stays = (t.stays || 0) + 1;
    return { ok: true, msg: `${t.name.replace(/\(.*/, "")}\u306E\u5230\u7740\u30ED\u30D3\u30FC\u3067\u540D\u7269\u3092\u98DF\u3079\u3001\u3086\u3063\u304F\u308A\u904E\u3054\u3057\u307E\u3057\u305F\u3002` + (t.stub ? "(\u3053\u306E\u8857\u306E\u8A73\u7D30\u30DE\u30C3\u30D7\u306F\u4ECA\u5F8C\u306E\u958B\u767A\u3067\u3059)" : "") };
  }
  function goHome(g) {
    const t = g.S.trip;
    if (!t || t.step !== 4) return { ok: false, msg: "" };
    const dep = nextSlot(t.mode, g.S.min + 5);
    if (dep == null) {
      g.advance(Math.max(0, 24 * 60 + MODE[t.mode].slot.from - g.S.min));
    } else g.advance(dep - g.S.min);
    return { ok: true, mins: t.mins, mode: t.mode, scene: { kind: MODE[t.mode].scene, dur: 9, mins: t.mins, text: `\u9752\u6D77\u3078\u623B\u308A\u307E\u3059 \u7D04${t.mins}\u5206`, ret: true } };
  }
  function finishReturn(g) {
    const t = g.S.trip;
    if (!t) return { ok: false, msg: "" };
    g.advance(t.mins);
    g.chg({ mood: 6, energy: -6 });
    record(g, t, "\u65C5\u884C");
    g.log("trip", `${t.name.replace(/\(.*/, "")}\u3078\u306E\u65C5\u304B\u3089\u5E30\u3063\u305F`);
    g.S.trip = null;
    return { ok: true, msg: `\u65C5\u304B\u3089\u5E30\u308A\u307E\u3057\u305F\u3002` };
  }
  function record(g, t, note) {
    const S2 = g.S;
    if (!S2.life) S2.life = newLifeRecord(g.hero.id);
    addTravel(S2.life, { region: t.scenic ? HOME_REGION : t.id, mode: MODE[t.mode].edge, ym: g.S.M, fare: t.fare, mins: t.mins, note });
  }
  function shuttleTarget(map2, fromBuilding) {
    const air = map2.buildings.find((b) => b.type === "airport");
    if (!air) return null;
    const st3 = map2.stations.find((s) => s.id === "kuko");
    if (!st3) return null;
    if (fromBuilding && fromBuilding.type === "airport") return { to: "station", bIdx: st3.building, label: "\u7A7A\u6E2F\u99C5", x: st3.door.x + 0.5, y: st3.door.y + 0.6 };
    return { to: "terminal", bIdx: air.idx, label: air.name, x: air.doorX + 0.5, y: air.doorY + 0.6 };
  }

