  // src/minor.js
  var freePlayOn = (g) => !!((g.hero.freePlay || testBypass(g, "age")) && devToolsEnabled());
  var setFreePlay = (g, on2) => {
    if (!devToolsEnabled()) return false;
    g.hero.freePlay = !!on2;
    g.log("dev", on2 ? "\u3010\u81EA\u7531\u8A66\u904A\u3011\u5E74\u9F62\u306B\u3088\u308B\u884C\u52D5\u5236\u9650\u3092\u89E3\u9664\u3057\u307E\u3057\u305F(\u958B\u767A\u7528)\u3002" : "\u3010\u81EA\u7531\u8A66\u904A\u3011\u5E74\u9F62\u306B\u3088\u308B\u884C\u52D5\u5236\u9650\u3092\u623B\u3057\u307E\u3057\u305F\u3002");
    return true;
  };
  var HOME = ["house", "farmhouse", "apt", "tower", "villa"];
  var T1 = /* @__PURE__ */ new Set([...HOME, "kinder", "park", "clinic", "hospital", "library", "museum", "aquarium", "shrine", "temple", "sento", "super", "konbini", "shop", "bookstore", "cafe", "restaurant", "ramen", "clothes", "pharmacy", "greengrocer", "liquor", "fishshop", "special"]);
  var T2 = /* @__PURE__ */ new Set([...T1, "elem", "cram", "cinema", "gamecenter", "bowling", "gym", "mall", "dept", "market", "edovillage", "tourtower", "seafood", "homecenter", "station", "pier", "onsenbath", "cityhall", "jh"]);
  var T3 = /* @__PURE__ */ new Set([...T2, "jh", "hs", "univ", "bank", "directsale", "media", "police", "fire", "farmcoop", "cemetery", "funeral", "welfare", "nursing", "ferry", "marina", "beachhouse", "special"]);
  var BLOCK17 = /* @__PURE__ */ new Set(["izakaya", "cardealer", "usedcar", "hotel", "bizhotel", "resorthotel", "ryokan", "minshuku", "lawfirm", "court", "gasstation"]);
  function tier(g) {
    const m = g.ageMonths();
    return m < 72 ? 1 : m < 144 ? 2 : m < 180 ? 3 : m < 216 ? 4 : 5;
  }
  function enterBlock(g, b, type) {
    if (freePlayOn(g)) return null;
    const t = tier(g);
    if (t >= 5) return null;
    if (HOME.includes(type)) return null;
    const set = t === 1 ? T1 : t === 2 ? T2 : t === 3 ? T3 : null;
    const ok = t === 4 ? !BLOCK17.has(type) : set.has(type);
    if (ok) return null;
    return t <= 2 ? `${b.name}\u306F\u3001\u304A\u3068\u306A\u3068\u4E00\u7DD2\u3067\u306A\u3044\u3068\u5165\u308C\u307E\u305B\u3093` : t === 3 ? `${b.name}\u306F\u3001\u4E2D\u5B66\u751F\u3060\u3051\u3067\u306F\u5165\u308C\u307E\u305B\u3093` : `${b.name}\u306F\u300118\u6B73\u672A\u6E80\u306F\u5229\u7528\u3067\u304D\u307E\u305B\u3093`;
  }
  function leashTiles(g) {
    if (freePlayOn(g)) return 0;
    const t = tier(g);
    return t === 1 ? 18 : t === 2 ? 60 : 0;
  }
  function leashBlock(g, nx, ny) {
    const R5 = leashTiles(g);
    if (!R5) return false;
    const hb = g.hero.homeB;
    if (hb == null || hb < 0) return false;
    const b = g.world.map.buildings[hb];
    if (!b) return false;
    return Math.hypot(nx - (b.doorX + 0.5), ny - (b.doorY + 0.5)) > R5;
  }
  var LEASH_MSG = "\u304A\u3046\u3061\u304B\u3089\u9060\u304F\u3078\u306F\u3001\u304A\u3068\u306A\u3068\u4E00\u7DD2\u3067\u306A\u3044\u3068\u884C\u3051\u307E\u305B\u3093";

