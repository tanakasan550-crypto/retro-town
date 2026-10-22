  // src/regions.js
  var HOME_REGION = "aoumi_v2";
  var REGIONS = {
    aoumi_v2: { id: "aoumi_v2", name: "\u9752\u6D77\u5E02(\u65E5\u672C\u30E2\u30C7\u30EB\u90FD\u5E02v2)", kind: "home", country: "JP", mapVer: 4, available: true, eras: ["any"] },
    okinawa: { id: "okinawa", name: "\u6C96\u7E04\u30FB\u96E2\u5CF6", kind: "domestic", country: "JP", available: false, eras: ["modern"] },
    kyoto: { id: "kyoto", name: "\u4EAC\u90FD", kind: "domestic", country: "JP", available: false, eras: ["modern"] },
    sapporo: { id: "sapporo", name: "\u672D\u5E4C", kind: "domestic", country: "JP", available: false, eras: ["modern"] },
    seoul: { id: "seoul", name: "\u97D3\u56FD", kind: "overseas", country: "KR", available: false, eras: ["modern"] },
    newyork: { id: "newyork", name: "\u30CB\u30E5\u30FC\u30E8\u30FC\u30AF", kind: "overseas", country: "US", available: false, eras: ["modern"] },
    rome: { id: "rome", name: "\u30ED\u30FC\u30DE", kind: "overseas", country: "IT", available: false, eras: ["modern"] },
    milan: { id: "milan", name: "\u30DF\u30E9\u30CE", kind: "overseas", country: "IT", available: false, eras: ["modern"] },
    florence: { id: "florence", name: "\u30D5\u30A3\u30EC\u30F3\u30C4\u30A7", kind: "overseas", country: "IT", available: false, eras: ["modern"] },
    egypt: { id: "egypt", name: "\u30A8\u30B8\u30D7\u30C8", kind: "overseas", country: "EG", available: false, eras: ["modern"] }
  };
  var Y = (a, b) => ({ from: a, to: b });
  var EDGES = [
    { id: "e_okinawa_air", mode: "air", a: "aoumi_v2", b: "okinawa", fare: 28e3, mins: 170, era: Y(1975, 9999), need: [], minAge: 0 },
    { id: "e_okinawa_ferry", mode: "ferry", a: "aoumi_v2", b: "okinawa", fare: 16e3, mins: 2400, era: Y(1960, 9999), need: [], minAge: 0 },
    { id: "e_kyoto_shin", mode: "shinkansen", a: "aoumi_v2", b: "kyoto", fare: 14500, mins: 140, era: Y(1964, 9999), need: [], minAge: 0 },
    { id: "e_sapporo_air", mode: "air", a: "aoumi_v2", b: "sapporo", fare: 22e3, mins: 110, era: Y(1965, 9999), need: [], minAge: 0 },
    { id: "e_seoul_air", mode: "air", a: "aoumi_v2", b: "seoul", fare: 38e3, mins: 140, era: Y(1970, 9999), need: ["passport"], minAge: 0 },
    { id: "e_newyork_air", mode: "air", a: "aoumi_v2", b: "newyork", fare: 16e4, mins: 780, era: Y(1970, 9999), need: ["passport"], minAge: 0 },
    { id: "e_rome_air", mode: "air", a: "aoumi_v2", b: "rome", fare: 14e4, mins: 840, era: Y(1970, 9999), need: ["passport"], minAge: 0 },
    { id: "e_milan_air", mode: "air", a: "aoumi_v2", b: "milan", fare: 14e4, mins: 800, era: Y(1970, 9999), need: ["passport"], minAge: 0 },
    { id: "e_egypt_air", mode: "air", a: "aoumi_v2", b: "egypt", fare: 15e4, mins: 900, era: Y(1970, 9999), need: ["passport"], minAge: 0 },
    // 欧州内の接続例(ローマ-フィレンツェ-ミラノは鉄道。aoumiからの直通は作らない)
    { id: "e_rome_florence", mode: "rail", a: "rome", b: "florence", fare: 5e3, mins: 95, era: Y(1990, 9999), need: [], minAge: 0 },
    { id: "e_florence_milan", mode: "rail", a: "florence", b: "milan", fare: 5e3, mins: 100, era: Y(1990, 9999), need: [], minAge: 0 }
  ];
  function hubModes(map2) {
    const s = /* @__PURE__ */ new Set(["rail", "car"]);
    for (const h of map2 && map2.hubs || []) s.add(h.kind === "airport" ? "air" : h.kind);
    return s;
  }
  function connectionsFrom(regionId, p = {}, map2 = null, opts = {}) {
    const out = [];
    const modes = map2 ? hubModes(map2) : null;
    for (const e of EDGES) {
      let to = null;
      if (e.a === regionId) to = e.b;
      else if (e.b === regionId) to = e.a;
      else continue;
      const R5 = REGIONS[to];
      if (!R5) continue;
      if (!opts.includeUnavailable && !R5.available) continue;
      if (modes && regionId === HOME_REGION && !modes.has(e.mode)) continue;
      const reasons = [];
      if (p.year != null && (p.year < e.era.from || p.year > e.era.to)) reasons.push("era");
      if (p.age != null && p.age < e.minAge) reasons.push("age");
      for (const n2 of e.need) if (!(p.has && p.has.has(n2))) reasons.push("need:" + n2);
      if (p.money != null && p.money < e.fare) reasons.push("money");
      out.push({ edge: e.id, mode: e.mode, to, name: R5.name, fare: e.fare, mins: e.mins, ok: reasons.length === 0, reasons });
    }
    return out;
  }
  function newLifeRecord(personId) {
    return {
      v: 1,
      personId,
      // 人物ID(世界共通・不変)
      origin: { region: HOME_REGION, era: "any" },
      // 人生の開始地(将来: 他国から開始)
      residence: [],
      // {region, era, buildingId, from, to} 居住履歴
      careers: [],
      // {region, era, jobId, from, to}
      travel: [],
      // {region, era, mode, ym, fare, mins, note} 旅行・訪問履歴
      memories: [],
      // {ym, region, era, text, with:[personId]}
      assets: []
      // {kind, id, region, value}  (所持品・資産。実課金は扱わない)
    };
  }
  function addTravel(rec, t) {
    rec.travel.push({ region: t.region, era: t.era || "any", mode: t.mode, ym: t.ym, fare: t.fare | 0, mins: t.mins | 0, note: t.note || "" });
    return rec;
  }

