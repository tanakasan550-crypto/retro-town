  // src/bsub.js
  var ZONE_D = { downtown: "D01", tower: "D02", shotengai: "D04", oldtown: "D04", school: "D05", suburb_n: "D05", suburb_w: "D05", campus: "D06", civic: "D07", suburb_e: "D08", farm: "D09", onsen: "D10", temple_town: "D10", port: "D11", industrial: "D11", marina: "D12", resort: "D12", chinatown: "D04", culture: "D07", newtown: "D08", themepark: "D12", airport: "D11", shinkansen: "D02", logistics: "D11", bunka: "D07" };
  var D03_TYPES = /* @__PURE__ */ new Set(["cinema", "gamecenter", "bowling", "izakaya", "mall", "dept", "clothes", "agency", "media"]);
  function districtOf(b) {
    if (b.dist) return b.dist;
    if (b.zone === "downtown" && D03_TYPES.has(b.type)) return "D03";
    return ZONE_D[b.zone] || "D05";
  }
  var SUBS = {
    house: [["small", 1], ["std", 2], ["modern", 3], ["oldwood", 4], ["mansion", 5]],
    villa: [["villa", 5]],
    farmhouse: [["farm", 12]],
    apt: [["small", 6], ["old", 7], ["mid", 8], ["danchi", 10], ["share", 11]],
    tower: [["high", 9]],
    konbini: [["ekimae", 13], ["resi", 14], ["suburb", 15]],
    super: [["small", 16], ["bldg1f", 17], ["big", 18], ["lux", 19], ["old", 20]],
    shop: [["gen", 0], ["drug", 21], ["yen100", 22], ["bakery", 23], ["boutique", 25], ["appliance", 26], ["flower", 27], ["pet", 28]],
    bookstore: [["book", 24]],
    clothes: [["boutique", 25]],
    pharmacy: [["pharm", 57]],
    ramen: [["ramen", 29]],
    restaurant: [["shokudo", 30], ["family", 33], ["fastfood", 34], ["soba", 35], ["yakiniku", 36], ["sushi", 38], ["fine", 39]],
    cafe: [["cafe", 31], ["kissa", 32]],
    izakaya: [["izakaya", 37], ["snack", 40]],
    seafood: [["sushi", 38]],
    kinder: [["kinder", 41]],
    elem: [["elem", 42]],
    jh: [["jh", 43]],
    hs: [["hs", 44]],
    univ: [["univ", 45]],
    cram: [["cram", 46]],
    cityhall: [["hall", 47]],
    police: [["station", 48], ["koban", 49]],
    fire: [["fire", 50]],
    library: [["lib", 51]],
    welfare: [["support", 59]],
    hospital: [["gen", 53]],
    clinic: [["clinic", 54], ["dental", 55], ["special", 56], ["psy", 60]],
    nursing: [["home", 58]],
    station: [["large", 61], ["local", 62], ["bldg", 63]],
    gasstation: [["gas", 67]],
    marina: [["port", 68]],
    ferry: [["port", 68]],
    cinema: [["cinema", 69]],
    bowling: [["bowl", 70]],
    gamecenter: [["arcade", 70], ["netcafe", 71]],
    gym: [["gym", 72]],
    sento: [["sento", 73]],
    onsenbath: [["onsen", 74]],
    bizhotel: [["biz", 75]],
    hotel: [["city", 75]],
    resorthotel: [["resort", 76]],
    ryokan: [["ryokan", 76]],
    minshuku: [["minshuku", 76]],
    shrine: [["shrine", 77]],
    temple: [["temple", 78]]
  };
  var H = (b, salt) => hash2(b.idx * 7919 + salt, 1374496523) >>> 0;
  var frac = (b, salt) => H(b, salt) % 1e3 / 1e3;
  function subOf(b, world) {
    const t = b.type, L2 = SUBS[t];
    if (!L2) return null;
    if (b.pin) return b.pin;
    if (L2.length === 1) return L2[0][0];
    const d = districtOf(b), era = b.era ?? 1, f2 = frac(b, 1), f22 = frac(b, 2);
    switch (t) {
      case "house":
        if (["D05", "D06", "D12", "D02"].includes(d) && f2 < 0.07) return "mansion";
        if (era === 0) return f2 < 0.8 ? "oldwood" : f22 < 0.5 ? "small" : "std";
        if ((d === "D04" || d === "D09" || d === "D10") && f2 < 0.3) return "oldwood";
        if (f2 < (era === 2 ? 0.6 : 0.3)) return "modern";
        return f22 < 0.45 ? "small" : "std";
      case "apt": {
        if (d === "D07" && f2 < 0.5) return "danchi";
        if (era === 0) return "old";
        if (f2 < 0.07) return "share";
        return f22 < 0.45 ? "small" : "mid";
      }
      case "konbini":
        return ["D01", "D02", "D03", "D06"].includes(d) ? "ekimae" : ["D08", "D09", "D10", "D11", "D12"].includes(d) ? "suburb" : "resi";
      case "super": {
        if (["D01", "D02", "D03"].includes(d)) return f2 < 0.5 ? "bldg1f" : "lux";
        if (d === "D08" || d === "D07") return "big";
        if (d === "D04" || d === "D09" || d === "D10" || era === 0) return "old";
        if (d === "D12") return "lux";
        return "small";
      }
      case "shop": {
        const tbl = d === "D04" ? ["gen", "gen", "gen", "bakery", "flower", "drug", "gen"] : ["D01", "D02", "D03"].includes(d) ? ["boutique", "drug", "yen100", "bakery", "flower", "appliance", "pet", "boutique"] : d === "D08" ? ["appliance", "pet", "yen100", "drug", "gen"] : ["gen", "drug", "bakery", "flower", "gen", "yen100", "pet"];
        return tbl[H(b, 3) % tbl.length];
      }
      case "restaurant": {
        const tbl = ["D01", "D02", "D03"].includes(d) ? ["fastfood", "fine", "sushi", "yakiniku", "soba", "shokudo"] : d === "D08" ? ["family", "fastfood", "yakiniku", "family"] : d === "D11" || d === "D12" ? ["sushi", "shokudo", "family", "fine"] : d === "D10" ? ["soba", "shokudo", "soba"] : ["shokudo", "shokudo", "soba", "yakiniku", "family"];
        return tbl[H(b, 4) % tbl.length];
      }
      case "cafe":
        return d === "D04" || d === "D09" || d === "D10" || era === 0 ? "kissa" : "cafe";
      case "izakaya":
        return f2 < 0.32 ? "snack" : "izakaya";
      case "police":
        return b.w <= 4 || f2 < 0.45 ? "koban" : "station";
      case "clinic":
        return f2 < 0.55 ? "clinic" : f2 < 0.75 ? "dental" : f2 < 0.9 ? "special" : "psy";
      case "station": {
        if (["D01", "D02", "D06"].includes(d)) return f2 < 0.6 ? "bldg" : "large";
        if (["D03", "D11", "D07"].includes(d)) return "large";
        return "local";
      }
      case "gamecenter":
        return f2 < 0.4 ? "netcafe" : "arcade";
      default:
        return L2[0][0];
    }
  }
  var cache = /* @__PURE__ */ new WeakMap();
  function subKey(b) {
    let c = cache.get(b);
    const k = (b.era ?? 1) + "|" + b.status;
    if (c && c.k === k) return c.s;
    const s = subOf(b);
    cache.set(b, { k, s });
    return s;
  }

