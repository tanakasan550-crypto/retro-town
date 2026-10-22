  // src/city2.js
  var CITY2 = { W: 1280, H: 960, VER: 4, AREA_RATIO: 1280 * 960 / (240 * 170) };
  var W = CITY2.W;
  var H2 = CITY2.H;
  var N = W * H2;
  var coast2 = (x) => Math.round(806 + 13 * Math.sin(x / 61) + 8 * Math.sin(x / 17 + 1) + (x > 900 && x < 1e3 ? 6 : 0));
  var river2 = (y) => Math.round(640 + 42 * Math.sin(y / 105));
  var STATIONS2 = [
    { id: "kazeminato", name: "\u6D77\u98A8\u6E2F", kana: "\u304B\u305C\u307F\u306A\u3068", x: 110, y: 716, zone: "port" },
    { id: "shiomi", name: "\u6F6E\u898B", kana: "\u3057\u304A\u307F", x: 260, y: 596, zone: "oldtown" },
    { id: "aoumi_chuo", name: "\u9752\u6D77\u4E2D\u592E", kana: "\u3042\u304A\u307F\u3061\u3085\u3046\u304A\u3046", x: 640, y: 480, zone: "downtown" },
    { id: "midoricho", name: "\u7DD1\u753A", kana: "\u307F\u3069\u308A\u3061\u3087\u3046", x: 800, y: 330, zone: "civic" },
    { id: "sakuragaoka", name: "\u685C\u30F6\u4E18", kana: "\u3055\u304F\u3089\u304C\u304A\u304B", x: 970, y: 290, zone: "school" },
    { id: "minorino", name: "\u307F\u306E\u308A\u91CE", kana: "\u307F\u306E\u308A\u306E", x: 1060, y: 180, zone: "farm" },
    { id: "tsukimi_onsen", name: "\u6708\u898B\u6E29\u6CC9", kana: "\u3064\u304D\u307F\u304A\u3093\u305B\u3093", x: 1190, y: 80, zone: "onsen" },
    { id: "gakuen", name: "\u5B66\u5712\u90FD\u5E02", kana: "\u304C\u304F\u3048\u3093\u3068\u3057", x: 190, y: 330, zone: "campus" },
    { id: "showacho", name: "\u662D\u548C\u753A", kana: "\u3057\u3087\u3046\u308F\u3061\u3087\u3046", x: 400, y: 496, zone: "shotengai" },
    { id: "tohtower", name: "\u6771\u90FD\u30BF\u30EF\u30FC\u524D", kana: "\u3068\u3046\u3068\u305F\u308F\u30FC\u307E\u3048", x: 800, y: 590, zone: "tower" },
    { id: "rinkai", name: "\u81E8\u6D77\u30EA\u30BE\u30FC\u30C8", kana: "\u308A\u3093\u304B\u3044\u308A\u305E\u30FC\u3068", x: 960, y: 740, zone: "resort" },
    { id: "konan", name: "\u6E2F\u5357\u30DE\u30EA\u30FC\u30CA", kana: "\u3053\u3046\u306A\u3093\u307E\u308A\u30FC\u306A", x: 1170, y: 730, zone: "marina" },
    { id: "higashino", name: "\u6771\u91CE", kana: "\u3072\u304C\u3057\u306E", x: 990, y: 530, zone: "suburb_e" },
    { id: "kuko", name: "\u9752\u6D77\u7A7A\u6E2F", kana: "\u3042\u304A\u307F\u304F\u3046\u3053\u3046", x: 1120, y: 640, zone: "airport" },
    { id: "newtown", name: "\u30CB\u30E5\u30FC\u30BF\u30A6\u30F3\u4E2D\u592E", kana: "\u306B\u3085\u30FC\u305F\u3046\u3093\u3061\u3085\u3046\u304A\u3046", x: 1070, y: 390, zone: "newtown" },
    { id: "yuenchi", name: "\u904A\u5712\u5730\u524D", kana: "\u3086\u3046\u3048\u3093\u3061\u307E\u3048", x: 800, y: 150, zone: "themepark" },
    { id: "shinaomi", name: "\u65B0\u9752\u6D77", kana: "\u3057\u3093\u3042\u304A\u307F", x: 640, y: 380, zone: "shinkansen", shin: true },
    { id: "kita", name: "\u5317\u90CA", kana: "\u304D\u305F\u3053\u3046\u304C\u3044", x: 420, y: 240, zone: "suburb_n" },
    { id: "bunka", name: "\u6587\u5316\u306E\u68EE", kana: "\u3076\u3093\u304B\u306E\u3082\u308A", x: 560, y: 320, zone: "culture" },
    { id: "nishi", name: "\u897F\u90CA", kana: "\u306B\u3057\u3053\u3046\u304C\u3044", x: 70, y: 520, zone: "suburb_w" }
  ];
  var LINES2 = [
    { id: "AOUMI", name: "\u9752\u6D77\u7DDA", color: "#1e88e5", stations: ["kazeminato", "shiomi", "aoumi_chuo", "midoricho", "sakuragaoka", "minorino", "tsukimi_onsen"], speed: 13, headway: 8, dwell: 1 },
    { id: "LOOP", name: "\u6771\u897F\u74B0\u72B6\u7DDA", color: "#e53935", stations: ["gakuen", "showacho", "aoumi_chuo", "tohtower", "rinkai", "konan"], speed: 12, headway: 8, dwell: 1 },
    { id: "KUKO", name: "\u7A7A\u6E2F\u7DDA", color: "#8e24aa", stations: ["tohtower", "higashino", "kuko"], speed: 16, headway: 10, dwell: 1 },
    { id: "NT", name: "\u30CB\u30E5\u30FC\u30BF\u30A6\u30F3\u7DDA", color: "#43a047", stations: ["higashino", "newtown"], speed: 12, headway: 12, dwell: 1 },
    { id: "YUEN", name: "\u904A\u5712\u5730\u7DDA", color: "#fb8c00", stations: ["midoricho", "yuenchi"], speed: 12, headway: 15, dwell: 1 },
    { id: "KITA", name: "\u5317\u90E8\u7DDA", color: "#00897b", stations: ["nishi", "gakuen", "kita", "bunka", "shinaomi", "aoumi_chuo"], speed: 12, headway: 10, dwell: 1 }
  ];
  var KR = 1.4;
  var R = (id, name, x, y, rx, ry, ss, sv, fill, art = 2) => ({ id, name, x, y, rx: Math.round(rx * KR), ry: Math.round(ry * KR), ss, sv, fill, art });
  var REGIONS2 = [
    R("downtown", "\u9752\u6D77\u4E2D\u592E", 640, 490, 135, 80, 8, 16, 0.97, 4),
    R("shinkansen", "\u65B0\u9752\u6D77", 640, 388, 72, 30, 8, 16, 0.9, 2),
    R("tower", "\u6771\u90FD\u30A6\u30A9\u30FC\u30BF\u30FC\u30D5\u30ED\u30F3\u30C8", 805, 602, 95, 55, 8, 16, 0.95, 4),
    R("shotengai", "\u662D\u548C\u753A\u5546\u5E97\u8857", 400, 505, 100, 58, 8, 14, 0.97),
    R("chinatown", "\u4E2D\u83EF\u8857", 485, 642, 44, 26, 8, 12, 0.99),
    R("oldtown", "\u6F6E\u898B\u65E7\u5E02\u8857", 260, 606, 85, 50, 8, 14, 0.95),
    R("port", "\u6D77\u98A8\u6E2F", 115, 724, 85, 40, 8, 14, 0.9),
    R("industrial", "\u81E8\u6E2F\u5DE5\u696D\u30FB\u7269\u6D41\u5730\u533A", 305, 728, 125, 48, 9, 18, 0.85),
    R("campus", "\u5B66\u5712\u90FD\u5E02", 190, 338, 95, 58, 8, 16, 0.85),
    R("culture", "\u6587\u5316\u306E\u68EE(\u7F8E\u8853\u9928\u30FB\u535A\u7269\u9928)", 560, 328, 80, 48, 8, 16, 0.8),
    R("suburb_n", "\u5317\u90CA\u4F4F\u5B85\u5730", 420, 248, 95, 45, 9, 12, 0.9),
    R("civic", "\u7DD1\u753A(\u884C\u653F\u5730\u533A)", 800, 338, 85, 52, 8, 16, 0.9),
    R("school", "\u685C\u30F6\u4E18\u6587\u6559\u5730\u533A", 970, 298, 80, 50, 9, 14, 0.88),
    R("newtown", "\u30CB\u30E5\u30FC\u30BF\u30A6\u30F3", 1070, 398, 90, 52, 9, 18, 0.85),
    R("suburb_e", "\u6771\u91CE\u4F4F\u5B85\u5730", 990, 538, 80, 45, 9, 12, 0.9),
    R("suburb_w", "\u897F\u90CA\u4F4F\u5B85\u5730", 75, 528, 60, 42, 9, 12, 0.9),
    R("farm", "\u307F\u306E\u308A\u91CE(\u8FB2\u6751)", 1060, 188, 120, 70, 12, 20, 0.45, 1),
    R("onsen", "\u6708\u898B\u6E29\u6CC9\u8857", 1190, 88, 75, 50, 8, 12, 0.95),
    R("themepark", "\u904A\u5712\u5730\u30FB\u52D5\u7269\u5712", 800, 158, 100, 55, 10, 20, 0.7),
    R("resort", "\u81E8\u6D77\u30EA\u30BE\u30FC\u30C8", 960, 748, 110, 38, 8, 14, 0.9),
    R("marina", "\u6E2F\u5357\u30DE\u30EA\u30FC\u30CA", 1170, 738, 70, 36, 8, 14, 0.9),
    R("airport", "\u9752\u6D77\u7A7A\u6E2F", 1095, 672, 100, 46, 10, 20, 0.7),
    R("temple_town", "\u5BFA\u753A", 560, 150, 70, 40, 9, 14, 0.8),
    R("rural_n", "\u5C71\u9593\u96C6\u843D", 440, 92, 90, 40, 12, 22, 0.35, 1),
    R("rural_s", "\u5357\u8FB2\u6751", 640, 745, 110, 36, 12, 20, 0.45, 1)
  ];
  var REGBY = Object.fromEntries(REGIONS2.map((r) => [r.id, r]));
  var norm = (r, x, y) => ((x - r.x) / r.rx) ** 2 + ((y - r.y) / r.ry) ** 2;
  function zoneAt(x, y, maxN = 1) {
    let best = null, bn = maxN;
    for (const r of REGIONS2) {
      const n2 = norm(r, x, y);
      if (n2 < bn) {
        bn = n2;
        best = r;
      }
    }
    return best;
  }
  var MIX2 = {
    chinatown: { restaurant: 8, ramen: 6, shop: 7, izakaya: 3, cafe: 2, bookstore: 1, apt: 3, house: 3, greengrocer: 2, seafood: 2, clothes: 2, temple: 0, konbini: 1 },
    culture: { museum: 0, cafe: 4, restaurant: 3, bookstore: 3, house: 5, apt: 4, konbini: 2, shop: 3, clinic: 1, gym: 1, library: 0 },
    newtown: { apt: 14, house: 8, super: 2, konbini: 3, clinic: 2, pharmacy: 2, cafe: 2, restaurant: 3, kinder: 2, shop: 3, gasstation: 0, ramen: 1, nursing: 1, cram: 2, gym: 1 },
    themepark: { restaurant: 4, cafe: 3, shop: 6, hotel: 2, konbini: 2, resorthotel: 1, izakaya: 1, apt: 1, house: 1 },
    airport: { hotel: 3, bizhotel: 3, restaurant: 4, cafe: 3, konbini: 3, shop: 3, gasstation: 2, warehouse: 0, office: 2, agency: 2 },
    shinkansen: { office: 8, bizhotel: 4, hotel: 3, restaurant: 5, cafe: 4, konbini: 4, shop: 3, bank: 2, izakaya: 3, apt: 2, tower: 2, lawfirm: 1, agency: 2 },
    rural_n: { farmhouse: 12, house: 3, shop: 1, directsale: 1, shrine: 1 },
    culture_: {}
  };
  var mixOf = (id) => MIX2[id] || ZONE_MIX[id] || ZONE_MIX.default;
  var SITE_TYPES = /* @__PURE__ */ new Set(["cityhall", "hospital", "univ", "hs", "jh", "elem", "special", "tourtower", "court", "mall", "dept", "museum", "library", "factory", "market", "marina", "pier", "ferry", "station", "edovillage", "aquarium", "cemetery", "crematorium", "airport", "stadium", "themepark", "zoo", "lab", "homecenter", "park", "police", "fire", "kinder", "beachhouse", "media", "resorthotel", "construction", "cardealer", "usedcar", "shrine", "temple"]);
  var LOTK = { mall: [50, 17], dept: [30, 10], hospital: [38, 12], homecenter: [28, 8], stadium: [84, 22], factory: [38, 8], logistics: [58, 10], cityhall: [24, 6] };
  var SITE = {
    kinder: { w: 16, h: 11, yard: "sand", fence: 1 },
    elem: { w: 32, h: 21, yard: "sand", fence: 1, ex: ["gym"], pool: 1 },
    jh: { w: 36, h: 23, yard: "sand", fence: 1, ex: ["gym"], pool: 1 },
    hs: { w: 42, h: 25, yard: "sand", fence: 1, ex: ["gym", "gym"], pool: 1 },
    special: { w: 26, h: 16, yard: "sand", fence: 1, ex: ["gym"] },
    univ: { w: 84, h: 48, yard: "grass", fence: 0, ex: ["univ", "lab", "lab", "library", "gym", "cafe"], pool: 0 },
    hospital: { w: 44, h: 26, yard: "plaza", fence: 0, ex: ["clinic", "pharmacy"] },
    cityhall: { w: 28, h: 17, yard: "plaza", fence: 0, ex: ["police"] },
    police: { w: 14, h: 9, yard: "plaza" },
    fire: { w: 16, h: 10, yard: "plaza" },
    museum: { w: 26, h: 16, yard: "grass" },
    library: { w: 20, h: 12, yard: "grass" },
    park: { w: 26, h: 16, yard: "park" },
    cemetery: { w: 22, h: 14, yard: "grass", fence: 1 },
    court: { w: 22, h: 13, yard: "plaza" },
    media: { w: 18, h: 11, yard: "plaza" },
    lab: { w: 20, h: 12, yard: "plaza" },
    factory: { w: 44, h: 26, yard: "plaza", fence: 1, ex: ["warehouse", "factory"] },
    logistics: { w: 64, h: 30, yard: "plaza", fence: 1, ex: ["logistics", "logistics", "warehouse"] },
    warehouse: { w: 30, h: 16, yard: "plaza", fence: 1, ex: ["warehouse"] },
    mall: { w: 56, h: 30, yard: "plaza", fence: 0 },
    dept: { w: 34, h: 20, yard: "plaza" },
    homecenter: { w: 32, h: 18, yard: "plaza" },
    stadium: { w: 90, h: 56, yard: "plaza", fence: 0 },
    airport: { w: 236, h: 72, yard: "grass", fence: 1, runway: 1, ex: ["warehouse", "warehouse", "warehouse", "tourtower"] },
    themepark: { w: 112, h: 72, yard: "park", fence: 1, ex: ["aquarium", "edovillage", "park", "park", "restaurant", "cafe", "shop", "shop"] },
    zoo: { w: 84, h: 52, yard: "park", fence: 1, ex: ["park", "park", "restaurant", "shop"], pens: 1 },
    edovillage: { w: 34, h: 22, yard: "grass" },
    aquarium: { w: 22, h: 14, yard: "plaza" },
    tourtower: { w: 16, h: 14, yard: "plaza" },
    crematorium: { w: 16, h: 11, yard: "grass", fence: 1 },
    shrine: { w: 22, h: 16, yard: "grass" },
    temple: { w: 22, h: 14, yard: "grass", fence: 1 },
    grandestate: { w: 60, h: 44, yard: "grass", fence: 0, grand: 1 },
    construction: { w: 20, h: 12, yard: "plaza", fence: 1 },
    cardealer: { w: 22, h: 11, yard: "plaza" },
    usedcar: { w: 24, h: 12, yard: "plaza" },
    resorthotel: { w: 26, h: 14, yard: "grass" }
  };
  var PLAN2 = {
    downtown: { dept: 3, mall: 2, court: 1, hospital: 1, police: 1, fire: 1, media: 2, library: 1, park: 3, tourtower: 0 },
    shinkansen: { dept: 1, park: 1, police: 1 },
    tower: { grandestate: 1, tourtower: 1, mall: 1, aquarium: 1, park: 3, stadium: 1, resorthotel: 1 },
    shotengai: { shrine: 1, park: 2, fire: 1, kinder: 2, elem: 2 },
    chinatown: { temple: 1 },
    oldtown: { temple: 2, shrine: 1, elem: 2, jh: 1, kinder: 2, park: 2, crematorium: 0 },
    port: { market: 2, pier: 4, ferry: 1, marina: 1, warehouse: 3, kinder: 1, park: 1, fire: 1, police: 1 },
    industrial: { factory: 4, logistics: 2, warehouse: 2, construction: 2, homecenter: 1 },
    campus: { grandestate: 1, univ: 3, lab: 3, hs: 1, kinder: 2, library: 1, park: 2, elem: 2 },
    culture: { museum: 5, library: 2, edovillage: 1, park: 4, univ: 1, aquarium: 0 },
    suburb_n: { grandestate: 1, elem: 3, jh: 2, hs: 1, kinder: 3, park: 3, fire: 1, homecenter: 1, cemetery: 1 },
    civic: { cityhall: 1, hospital: 2, police: 1, fire: 1, library: 1, court: 1, park: 2, kinder: 2, elem: 2, welfare: 0 },
    school: { grandestate: 1, elem: 3, jh: 2, hs: 2, kinder: 3, special: 1, park: 3, library: 1 },
    newtown: { grandestate: 1, elem: 4, jh: 2, hs: 1, kinder: 3, mall: 1, hospital: 1, park: 4, fire: 1, police: 1, library: 1 },
    suburb_e: { grandestate: 1, elem: 3, jh: 2, hs: 1, kinder: 2, homecenter: 1, park: 2, cardealer: 1, usedcar: 1 },
    suburb_w: { grandestate: 1, elem: 2, jh: 1, kinder: 2, park: 2, usedcar: 1, cemetery: 1 },
    farm: { elem: 2, kinder: 1, crematorium: 1, shrine: 1 },
    onsen: { shrine: 1, park: 1 },
    themepark: { themepark: 1, zoo: 1 },
    resort: { grandestate: 1, resorthotel: 3, aquarium: 1, park: 2, stadium: 0 },
    marina: { marina: 1, ferry: 1, park: 1 },
    airport: { airport: 1, construction: 1 },
    temple_town: { temple: 6, shrine: 2, cemetery: 3, crematorium: 1, park: 2 },
    rural_n: { shrine: 1, elem: 1 },
    rural_s: { elem: 1, kinder: 1, shrine: 1 }
  };
  var COASTAL2 = /* @__PURE__ */ new Set(["pier", "marina", "ferry", "market", "beachhouse"]);
  var FREEG = /* @__PURE__ */ new Set([T.GRASS, T.FARM, T.SAND, T.QUAY, T.PADDY]);
  function noise(seed, x, y, cell2) {
    const gx = Math.floor(x / cell2), gy = Math.floor(y / cell2), fx = x / cell2 - gx, fy = y / cell2 - gy;
    const v = (a2, b2) => hash2(hash2(seed, a2), b2) / 4294967296;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = v(gx, gy), b = v(gx + 1, gy), c = v(gx, gy + 1), d = v(gx + 1, gy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function generateCity2(seed, opts = {}, helpers = {}) {
    const { assignNames: assignNames2, buildRailPath: buildRailPath2 } = helpers;
    const rng = new Rng(seed, "city2");
    const ground = new Uint8Array(N), deco = new Uint8Array(N), bid = new Int16Array(N).fill(-1), net = new Uint8Array(N);
    const res = new Uint8Array(N);
    const rmeta = { ax: new Uint8Array(N), th: new Uint8Array(N), ln: new Uint8Array(N), ow: new Uint8Array(N) };
    const I2 = (x, y) => y * W + x, inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H2;
    const buildings = [], zones = [], stations = [], sites2 = [], dbg = {}, placeLog = {};
    const stById = Object.fromEntries(STATIONS2.map((s) => [s.id, s]));
    for (const r of REGIONS2) zones.push({ id: r.id, name: r.name + "\u5468\u8FBA", x: r.x, y: r.y, rx: r.rx, ry: r.ry, station: (STATIONS2.find((s) => s.zone === r.id) || {}).id });
    for (let y = 0; y < H2; y++) for (let x = 0; x < W; x++) {
      let g = T.GRASS;
      const cy = coast2(x);
      if (y >= cy) g = T.WATER;
      else if (y >= cy - 4 && x > 800) g = T.SAND;
      else if (y >= cy - 3 && x < 340) g = T.QUAY;
      if (y < cy && Math.abs(x - river2(y)) <= 2) g = T.WATER;
      if (g === T.GRASS) {
        const mn = Math.max(0, (210 - y) / 210), mne = Math.max(0, (x - 1e3) / 280) * Math.max(0, (340 - y) / 340), mw = Math.max(0, (150 - x) / 150) * Math.max(0, (400 - y) / 400);
        const m = Math.max(mn, mne, mw) * 1.05 + (noise(seed, x, y, 14) - 0.5) * 0.42;
        if (m > 0.8) g = T.ROCK;
        else if (m > 0.46) g = T.FOREST;
        else if (noise(seed + 7, x, y, 40) > 0.55 && (x > 900 && y > 90 && y < 330 || x > 470 && x < 800 && y > 90 && y < 250 && noise(seed + 9, x, y, 22) > 0.5)) g = T.FOREST;
      }
      ground[I2(x, y)] = g;
    }
    for (const r of REGIONS2) {
      const k = r.id === "onsen" ? 0.85 : 1.08;
      for (let y = Math.max(0, r.y - r.ry * 1.1 | 0); y < Math.min(H2, r.y + r.ry * 1.1); y++) for (let x = Math.max(0, r.x - r.rx * 1.1 | 0); x < Math.min(W, r.x + r.rx * 1.1); x++) if (norm(r, x, y) < k * k) {
        const g = ground[I2(x, y)];
        if (g === T.FOREST || g === T.ROCK) ground[I2(x, y)] = T.GRASS;
      }
    }
    for (const s of STATIONS2) for (let y = s.y - 6; y < s.y + 16; y++) for (let x = s.x - 24; x < s.x + 24; x++) if (inb(x, y)) {
      const g = ground[I2(x, y)];
      if (g === T.FOREST || g === T.ROCK) ground[I2(x, y)] = T.GRASS;
    }
    for (const r of REGIONS2) if (r.art === 1) for (let y = Math.max(0, r.y - r.ry | 0); y < Math.min(H2 - 1, r.y + r.ry); y++) for (let x = Math.max(0, r.x - r.rx | 0); x < Math.min(W, r.x + r.rx); x++) {
      if (ground[I2(x, y)] === T.GRASS && norm(r, x, y) < 1 && noise(seed + 2, x, y, 12) > 0.4) ground[I2(x, y)] = noise(seed + 3, x, y, 7) > 0.55 ? T.PADDY : T.FARM;
    }
    const setG = (x, y, g) => {
      if (inb(x, y)) ground[I2(x, y)] = g;
    };
    const railPaths = {};
    const lookup = (id) => stById[id];
    for (const line2 of LINES2) {
      const rp = buildRailPath2(line2, lookup);
      railPaths[line2.id] = rp;
      for (let i = 1; i < rp.pts.length; i++) {
        const [x0, y0] = rp.pts[i - 1], [x1, y1] = rp.pts[i];
        const sx = Math.sign(x1 - x0), sy = Math.sign(y1 - y0);
        let x = x0, y = y0;
        setG(x, y, T.RAIL);
        while (x !== x1 || y !== y1) {
          x += sx;
          y += sy;
          setG(x, y, T.RAIL);
        }
      }
    }
    const markRes = (x0, y0, w, h) => {
      for (let y = Math.max(0, y0); y < Math.min(H2, y0 + h); y++) for (let x = Math.max(0, x0); x < Math.min(W, x0 + w); x++) res[I2(x, y)] = 1;
    };
    function addBuilding(type, bx, by, zone, extra = {}) {
      const bt = BTYPES[type];
      const idx = buildings.length;
      const b = { idx, id: "B" + String(idx).padStart(4, "0"), type, x: bx, y: by, w: bt.w, h: bt.h, doorX: bx + (bt.w >> 1), doorY: by + bt.h, zone, floors: bt.floors || 1, ...extra };
      buildings.push(b);
      for (let y = by; y < by + b.h; y++) for (let x = bx; x < bx + b.w; x++) if (inb(x, y)) bid[I2(x, y)] = idx;
      return b;
    }
    const hubs = [];
    const lots = [];
    for (const s of STATIONS2) {
      const MAJ0 = ["aoumi_chuo", "tohtower", "shinaomi", "kuko", "showacho", "gakuen", "kazeminato"].includes(s.id), PL = MAJ0 ? 17 : 8;
      for (let x = s.x - PL; x <= s.x + PL; x++) setG(x, s.y + 1, T.PLATFORM);
      for (let y = s.y + 5; y <= s.y + 6; y++) for (let x = s.x - 9; x <= s.x + 9; x++) setG(x, y, T.PLAZA);
      for (let y = s.y + 2; y <= s.y + 4; y++) for (let x = s.x - 9; x <= s.x + 9; x++) if (ground[I2(x, y)] !== T.RAIL && ground[I2(x, y)] !== T.WATER) setG(x, y, T.GRASS);
      const MAJOR = ["aoumi_chuo", "tohtower", "shinaomi", "kuko", "showacho", "gakuen", "kazeminato"].includes(s.id);
      const sw = MAJOR ? 17 : 9;
      const b = addBuilding("station", s.x - (sw >> 1), s.y + 2, s.zone, { stationId: s.id, name: s.name + "\u99C5", w: sw, doorX: s.x - (sw >> 1) + (sw >> 1), ...MAJOR ? { floors: 3, nf: 4 } : {} });
      stations.push({ ...s, door: { x: b.doorX, y: b.doorY }, building: b.idx, platformY: s.y + 1 });
      markRes(s.x - Math.max(11, PL + 1), s.y - 2, 2 * Math.max(11, PL + 1) + 1, 7);
      if (s.shin) {
        for (let y = s.y + 8; y <= s.y + 9; y++) for (let x = s.x - 14; x <= s.x + 14; x++) setG(x, y, y === s.y + 8 ? T.PLATFORM : T.RAIL);
        for (let x = s.x - 14; x <= s.x + 14; x++) setG(x, s.y + 7, T.PLATFORM);
        markRes(s.x - 16, s.y + 7, 33, 4);
        hubs.push({ id: "hub_shinkansen", kind: "shinkansen", stationId: s.id, name: s.name + "(\u65B0\u5E79\u7DDA)", door: { x: b.doorX, y: b.doorY }, platform: { x0: s.x - 14, x1: s.x + 14, y: s.y + 8 }, gates: [{ dir: "W", label: "\u65B0\u5E79\u7DDA \u897F\u65B9\u9762" }, { dir: "E", label: "\u65B0\u5E79\u7DDA \u6771\u65B9\u9762" }] });
      }
    }
    let localOnly = false;
    function carveRoad(x, y, axBit = 0, thick = 1, lane = 0) {
      if (!inb(x, y)) return;
      const k = I2(x, y);
      if (bid[k] >= 0) return;
      if (res[k] === 2) return;
      const g = ground[k];
      if (res[k] === 1 && g !== T.PLAZA) return;
      if (localOnly && (g === T.WATER || g === T.RAIL || g === T.PLATFORM)) return;
      if (g === T.WATER) ground[k] = T.BRIDGE;
      else if (g === T.RAIL) ground[k] = T.CROSSING;
      else if (g === T.PLAZA || g === T.PLATFORM || g === T.CROSSING || g === T.BRIDGE) {
      } else ground[k] = T.ROAD;
      deco[k] = D.NONE;
      net[k] = 1;
      const gg = ground[k];
      if (axBit && (gg === T.ROAD || gg === T.BRIDGE || gg === T.CROSSING || gg === T.PLAZA)) {
        const had = rmeta.ax[k];
        if (!had || (had & axBit) === 0 || thick >= rmeta.th[k]) {
          if (had && (had & axBit) === 0) {
            rmeta.th[k] = 0;
          } else {
            rmeta.th[k] = thick;
            rmeta.ln[k] = lane;
          }
        }
        rmeta.ax[k] = had | axBit;
      }
    }
    function carveLine(x0, y0, x1, y1, w) {
      const e = w - 1;
      if (y0 === y1) {
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + e; x++) for (let k = 0; k < w; k++) carveRoad(x, y0 + k, 1, w, k);
      } else if (x0 === x1) {
        for (let y = Math.min(y0, y1); y <= Math.max(y0, y1) + e; y++) for (let k = 0; k < w; k++) carveRoad(x0 + k, y, 2, w, k);
      } else {
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + e; x++) for (let k = 0; k < w; k++) carveRoad(x, y0 + k, 1, w, k);
        for (let y = Math.min(y0, y1); y <= Math.max(y0, y1) + e; y++) for (let k = 0; k < w; k++) carveRoad(x1 + k, y, 2, w, k);
      }
    }
    const TRUNK2 = /* @__PURE__ */ new Set(["aoumi_chuo", "tohtower", "midoricho", "showacho", "shinaomi"]);
    const roadSegs = [];
    for (const line2 of LINES2) for (let i = 1; i < line2.stations.length; i++) {
      const A2 = stById[line2.stations[i - 1]], B2 = stById[line2.stations[i]];
      const tw = TRUNK2.has(A2.id) && TRUNK2.has(B2.id) ? 4 : 2;
      const o = tw === 4 ? 1 : 0;
      if (B2.y > A2.y + 6) {
        const vx = B2.x + 12 < W - 3 ? B2.x + 12 : B2.x - 12, ya = A2.y + 5 - o, yb = B2.y + 5 - o;
        carveLine(A2.x, ya, vx - o, ya, tw);
        carveLine(vx - o, ya, vx - o, yb, tw);
        carveLine(vx - o, yb, B2.x, yb, tw);
      } else {
        carveLine(A2.x, A2.y + 5 - o, B2.x - o, A2.y + 5 - o, tw);
        carveLine(B2.x - o, A2.y + 5 - o, B2.x - o, B2.y + 5, tw);
      }
      roadSegs.push({ line: line2.id, from: A2.id, to: B2.id, pts: [[A2.x, A2.y + 5], [B2.x, A2.y + 5], [B2.x, B2.y + 5]] });
    }
    for (const s of STATIONS2) for (let y = s.y + 5; y <= s.y + 6; y++) for (let x = s.x - 9; x <= s.x + 9; x++) net[I2(x, y)] = 1;
    const zby = (id) => zones.find((z) => z.id === id);
    const rowsOf2 = (r) => {
      const out = [];
      const y0 = r.y - r.ry * 1.05, y1 = r.y + r.ry * 1.05;
      for (let y = r.y - Math.floor((r.y - y0) / r.ss) * r.ss; y <= y1; y += r.ss) out.push(Math.round(y));
      return out;
    };
    function siteFree(x0, y0, w, h) {
      if (x0 < 3 || y0 < 3 || x0 + w >= W - 3 || y0 + h + 3 >= H2) return false;
      for (let y = y0 - 1; y <= y0 + h; y++) for (let x = x0 - 1; x <= x0 + w; x++) {
        const k = I2(x, y);
        if (res[k] || bid[k] >= 0) return false;
        const g = ground[k];
        const inside = y < y0 + h && x >= x0 && x < x0 + w;
        if (inside) {
          if (!FREEG.has(g)) return false;
        } else if (g === T.RAIL || g === T.PLATFORM) return false;
      }
      for (let x = x0; x < x0 + w; x++) {
        const g = ground[I2(x, y0 + h)];
        if (g === T.WATER || g === T.RAIL || g === T.PLATFORM || res[I2(x, y0 + h)]) return false;
      }
      return true;
    }
    function placeSite(kind, r, tries = 500) {
      const sp = SITE[kind];
      const bt = BTYPES[kind] || (kind === "grandestate" ? BTYPES.house : null);
      if (!sp || !bt) return null;
      const rows2 = rowsOf2(r).filter((y) => y - sp.h > r.y - r.ry * 1.25 && y < r.y + r.ry * 1.3);
      if (COASTAL2.has(kind)) return null;
      for (let t = 0; t < tries; t++) {
        const grow = t > 250 ? 1.5 : t > 120 ? 1.25 : 1;
        const y = rows2.length ? rows2[rng.int(rows2.length)] : Math.round(r.y);
        const cx = r.x + (rng.next() * 2 - 1) * r.rx * grow;
        const x0 = Math.round(cx - sp.w / 2), y0 = y - sp.h;
        if (norm(r, x0 + sp.w / 2, y0 + sp.h / 2) > grow * grow + 0.1) continue;
        if (!siteFree(x0, y0, sp.w, sp.h)) continue;
        return buildSite(kind, r, x0, y0, sp);
      }
      const cand = [];
      for (const y of rowsOf2(r)) for (let x0 = Math.round(r.x - r.rx * 1.3); x0 + sp.w < r.x + r.rx * 1.3; x0 += 3) {
        const y0 = y - sp.h;
        const d = norm(r, x0 + sp.w / 2, y0 + sp.h / 2);
        if (d <= 1.7) cand.push([d, x0, y0]);
      }
      cand.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      for (const [, x0, y0] of cand) if (siteFree(x0, y0, sp.w, sp.h)) return buildSite(kind, r, x0, y0, sp);
      dbg["site:" + kind] = (dbg["site:" + kind] || 0) + 1;
      return null;
    }
    const grandWall = /* @__PURE__ */ new Set();
    const grandSolid = [];
    function buildGrand(S2, x0, y0, sp, main) {
      const W0 = sp.w, H0 = sp.h;
      const at = (x, y) => [x0 + x, y0 + y];
      const put2 = (x, y, t) => {
        const [X, Y2] = at(x, y);
        if (inb(X, Y2) && bid[I2(X, Y2)] < 0) {
          ground[I2(X, Y2)] = t;
          deco[I2(X, Y2)] = 0;
        }
      };
      const rect2 = (x, y, w, h, t) => {
        for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put2(i, j, t);
      };
      const E2 = { x0, y0, w: W0, h: H0, gate: { x: x0 + 30, y: y0 + H0 - 1 }, ring: { cx: x0 + 30, cy: y0 + 35, r: 6 }, fountain: { cx: x0 + 30, cy: y0 + 35 }, wallMinX: x0, solid: [] };
      for (let j = 0; j < H0; j++) for (let i = 0; i < W0; i++) {
        const [X, Y2] = at(i, j);
        if (bid[I2(X, Y2)] < 0) {
          ground[I2(X, Y2)] = T.GRASS;
          deco[I2(X, Y2)] = 0;
        }
      }
      rect2(28, 28, 5, 16, T.PLAZA);
      rect2(26, 27, 9, 1, T.PLAZA);
      for (let j = 28; j <= 42; j++) for (let i = 22; i <= 38; i++) {
        const d = Math.hypot(i - 30, j - 35);
        if (d <= 6.4 && d >= 3.6) put2(i, j, T.PLAZA);
      }
      for (let j = 33; j <= 37; j++) for (let i = 28; i <= 32; i++) {
        const d = Math.hypot(i - 30, j - 35);
        if (d < 3.6) put2(i, j, T.GRASS);
      }
      rect2(2, 27, 26, 3, T.PLAZA);
      rect2(3, 20, 12, 7, T.PLAZA);
      rect2(14, 14, 2, 14, T.PATH);
      rect2(2, 40, 26, 2, T.PATH);
      rect2(3, 3, 11, 11, T.PLAZA);
      rect2(45, 13, 14, 9, T.PLAZA);
      rect2(47, 15, 10, 5, T.WATER);
      for (let j = 15; j < 20; j++) for (let i = 47; i < 57; i++) E2.solid.push([x0 + i, y0 + j]);
      rect2(45, 25, 14, 15, T.PLAZA);
      for (let i = 45; i < 59; i++) for (const j of [25, 39]) {
        const [X, Y2] = at(i, j);
        if (bid[I2(X, Y2)] < 0) deco[I2(X, Y2)] = D.FENCE;
      }
      for (let j = 25; j < 40; j++) for (const i of [45, 58]) {
        if (i === 45 && (j === 31 || j === 32)) continue;
        const [X, Y2] = at(i, j);
        if (bid[I2(X, Y2)] < 0) deco[I2(X, Y2)] = D.FENCE;
      }
      for (let i = 33; i < 59; i++) for (const j of [1]) {
        const [X, Y2] = at(i, j);
        if (bid[I2(X, Y2)] < 0) deco[I2(X, Y2)] = D.FENCE;
      }
      for (let i = 0; i < W0; i++) for (const j of [0, H0 - 1]) {
        if (j === H0 - 1 && i >= 28 && i <= 32) continue;
        const [X, Y2] = at(i, j);
        if (bid[I2(X, Y2)] < 0) {
          deco[I2(X, Y2)] = D.FENCE;
          grandWall.add(I2(X, Y2));
        }
      }
      for (let j = 0; j < H0; j++) for (const i of [0, W0 - 1]) {
        const [X, Y2] = at(i, j);
        if (bid[I2(X, Y2)] < 0) {
          deco[I2(X, Y2)] = D.FENCE;
          grandWall.add(I2(X, Y2));
        }
      }
      for (let j = 39; j <= 40; j++) for (let i = 34; i <= 36; i++) E2.solid.push(at(i, j));
      for (let j = 34; j <= 36; j++) for (let i = 29; i <= 31; i++) E2.solid.push(at(i, j));
      const keep = (i, j) => i >= 27 && i <= 33 && j >= 27 || i >= 14 && i <= 44 && j >= 13 && j <= 27 || i >= 21 && i <= 39 && j >= 28 && j <= 43 || i >= 2 && i <= 28 && j >= 26 && j <= 31 || i >= 3 && i <= 14 && j >= 3 && j <= 14 || i >= 44 && i <= 59 && j >= 12 && j <= 40 || i >= 32 && j <= 12 && i >= 33;
      for (let j = 1; j < H0 - 1; j++) for (let i = 1; i < W0 - 1; i++) {
        if (keep(i, j)) continue;
        const [X, Y2] = at(i, j);
        const k = I2(X, Y2);
        if (bid[k] >= 0 || deco[k] || ground[k] !== T.GRASS) continue;
        if (hash2(X * 7 + Y2, 6203) % 100 < (j < 14 || i < 14 ? 11 : 7)) deco[k] = D.TREE;
        else if (hash2(X + Y2 * 9, 6204) % 100 < 3) deco[k] = D.FLOWER;
      }
      E2.cars = [{ x: x0 + 5.5, y: y0 + 28.5, d: 1, ty: "sports", c: 0 }, { x: x0 + 10.5, y: y0 + 28.5, d: 1, ty: "luxury", c: 1 }, { x: x0 + 15.5, y: y0 + 28.5, d: 1, ty: "suv", c: 2 }, { x: x0 + 20.5, y: y0 + 28.5, d: 1, ty: "luxury", c: 3 }];
      E2.heli = { cx: x0 + 8.5, cy: y0 + 8.5 };
      E2.pool = [x0 + 47, y0 + 15, 10, 5];
      E2.tennis = [x0 + 46, y0 + 26, 12, 13];
      E2.golf = [x0 + 34, y0 + 2, 24, 9];
      E2.deck = [x0 + 45, y0 + 13, 14, 9];
      E2.garage = { x: x0 + 16, y: y0 + 20, w: 9, h: 7 };
      grandEstates.push(E2);
      S2.estate = E2;
      for (const [x, y] of E2.solid) grandSolid.push(I2(x, y));
      for (const [px_, py_, pw_, ph_] of [[x0 + 14, y0 + 13, 31, 15], [x0 + 21, y0 + 28, 18, 16]]) res;
    }
    const grandEstates = [];
    function buildSite(kind, r, x0, y0, sp) {
      const bt = kind === "grandestate" ? { ...BTYPES.house, w: 28, h: 13 } : BTYPES[kind];
      const S2 = { kind, zone: r.id, x: x0, y: y0, w: sp.w, h: sp.h, parts: [] };
      for (let y = y0; y < y0 + sp.h; y++) for (let x = x0; x < x0 + sp.w; x++) {
        const k = I2(x, y);
        res[k] = 2;
        if (sp.yard === "sand") ground[k] = T.SAND;
        else if (sp.yard === "plaza") ground[k] = T.PLAZA;
        else if (sp.yard === "park" || sp.yard === "grass") ground[k] = T.GRASS;
      }
      if (kind === "grandestate") {
        const bx2 = x0 + 16, by2 = y0 + 14;
        const main2 = addBuilding("house", bx2, by2, r.id, { site: sites2.length, w: 28, h: 13, estate: 2, pin: "mansion", name: "\u5927\u90B8\u5B85", floors: 3, doorX: bx2 + 14, doorY: by2 + 13 });
        S2.main = main2.idx;
        S2.parts.push(main2.idx);
        buildGrand(S2, x0, y0, sp, main2);
        sites2.push(S2);
        placeLog[kind] = (placeLog[kind] || 0) + 1;
        return S2;
      }
      const FC = kind === "airport" ? 14 : 0;
      const bx = x0 + (sp.w - bt.w >> 1), by = y0 + sp.h - bt.h - FC;
      const main = addBuilding(kind, bx, by, r.id, { site: sites2.length });
      S2.main = main.idx;
      S2.parts.push(main.idx);
      if (kind === "airport") main.name = "\u9752\u6D77\u7A7A\u6E2F\u30BF\u30FC\u30DF\u30CA\u30EB";
      if (sp.fence) {
        const gateX = bx + bt.w + 1;
        for (let x = x0; x < x0 + sp.w; x++) {
          for (const y of [y0, y0 + sp.h - 1]) {
            if (y === y0 + sp.h - 1 && (x >= bx - 6 && x < bx + bt.w + 6 || x >= gateX && x < gateX + 4)) continue;
            if (bid[I2(x, y)] < 0) deco[I2(x, y)] = D.FENCE;
          }
        }
        for (let y = y0; y < y0 + sp.h; y++) for (const x of [x0, x0 + sp.w - 1]) if (bid[I2(x, y)] < 0) deco[I2(x, y)] = D.FENCE;
      }
      const occ = [];
      occ.push([bx - 1, by - 1, bt.w + 2, bt.h + 3]);
      const clash = (x, y, w, h) => occ.some((o) => !(x + w <= o[0] || o[0] + o[2] <= x || y + h <= o[1] || o[1] + o[3] <= y));
      if (LOTK[kind]) {
        const L2 = LOTK[kind];
        const lw = Math.min(sp.w - 6, L2[0]), lh = Math.min(sp.h - bt.h - 7, L2[1]);
        if (lh >= 8 && lw >= 12) {
          const lx = x0 + 3 + (kind === "stadium" ? 0 : sp.w - 6 - lw >> 1), ly = y0 + 2;
          if (!clash(lx - 1, ly - 1, lw + 2, lh + 2)) {
            for (let y = ly; y < ly + lh; y++) for (let x = lx; x < lx + lw; x++) if (bid[I2(x, y)] < 0) {
              ground[I2(x, y)] = T.PLAZA;
              deco[I2(x, y)] = 0;
            }
            occ.push([lx - 1, ly - 1, lw + 2, lh + 2]);
            (S2.lots || (S2.lots = [])).push([lx, ly, lw, lh]);
            lots.push({ x: lx, y: ly, w: lw, h: lh, kind });
          }
        }
      }
      if (sp.pool) {
        const px2 = x0 + sp.w - 14, py = y0 + 3, pw = 11, ph = 5;
        if (!clash(px2, py, pw, ph)) {
          for (let y = py; y < py + ph; y++) for (let x = px2; x < px2 + pw; x++) {
            ground[I2(x, y)] = T.WATER;
            deco[I2(x, y)] = 0;
          }
          occ.push([px2 - 1, py - 1, pw + 2, ph + 2]);
          S2.pool = [px2, py, pw, ph];
        }
      }
      if (sp.field) {
        const fx = x0 + 8, fy = y0 + 6, fw = sp.w - 16, fh = sp.h - BTYPES.stadium.h - 12;
        for (let y = fy; y < fy + fh; y++) for (let x = fx; x < fx + fw; x++) ground[I2(x, y)] = T.GRASS;
        for (let x = fx - 1; x <= fx + fw; x++) for (const y of [fy - 1, fy + fh]) if (inb(x, y) && bid[I2(x, y)] < 0) deco[I2(x, y)] = D.FENCE;
        for (let y = fy - 1; y <= fy + fh; y++) for (const x of [fx - 1, fx + fw]) if (bid[I2(x, y)] < 0) deco[I2(x, y)] = D.FENCE;
        for (let x = fx + (fw >> 1) - 2; x < fx + (fw >> 1) + 2; x++) deco[I2(x, fy + fh)] = 0;
        occ.push([fx - 2, fy - 2, fw + 4, fh + 4]);
        S2.field = [fx, fy, fw, fh];
      }
      if (FC) {
        for (let y = by + bt.h; y < y0 + sp.h; y++) for (let x = bx - 6; x < bx + bt.w + 6; x++) if (bid[I2(x, y)] < 0) {
          ground[I2(x, y)] = T.PLAZA;
          deco[I2(x, y)] = 0;
        }
      }
      if (sp.runway) {
        const ry0 = y0 + 6;
        for (let y = ry0; y < ry0 + 6; y++) for (let x = x0 + 8; x < x0 + sp.w - 8; x++) ground[I2(x, y)] = T.PLAZA;
        for (let y = ry0 + 8; y < ry0 + 11; y++) for (let x = x0 + 8; x < x0 + sp.w - 8; x++) ground[I2(x, y)] = T.PLAZA;
        const gx0 = x0 + (sp.w >> 1) - 2;
        for (let y = ry0 + 11; y < y0 + sp.h; y++) for (let x = gx0; x < gx0 + 4; x++) if (bid[I2(x, y)] < 0) ground[I2(x, y)] = T.PLAZA;
        const ax0 = x0 + (sp.w >> 1) - 46, ay0 = by - 22;
        for (let y = ay0; y < y0 + sp.h; y++) for (let x = ax0; x < ax0 + 92; x++) if (bid[I2(x, y)] < 0) ground[I2(x, y)] = T.PLAZA;
        occ.push([x0 + 6, ry0 - 2, sp.w - 12, 16]);
        occ.push([ax0, ay0 - 1, 92, 24]);
        S2.runway = { x0: x0 + 8, x1: x0 + sp.w - 9, y0: ry0, y1: ry0 + 5, taxi: { y0: ry0 + 8, y1: ry0 + 10 }, apron: { x0: ax0, y0: ay0, w: 92 }, stands: [0, 1, 2, 3].map((i) => ({ x: ax0 + 10 + i * 24, y: ay0 + 11, liv: i })), rwPlane: { x: x0 + 70, y: ry0 + 3 }, doorX: main.doorX, fc: { x0: bx - 6, y0: by + bt.h + 1, w: bt.w + 12, h: FC - 2 } };
        hubs.push({ id: "hub_airport", kind: "airport", stationId: "kuko", name: "\u9752\u6D77\u7A7A\u6E2F", building: main.idx, door: { x: main.doorX, y: main.doorY }, runway: S2.runway });
      }
      if (sp.pens) {
        let n2 = 0;
        for (let py = y0 + 4; py + 8 < y0 + sp.h - 14 && n2 < 12; py += 12) for (let px2 = x0 + 4; px2 + 12 < x0 + sp.w - 4 && n2 < 12; px2 += 16) {
          if (clash(px2, py, 12, 8)) continue;
          for (let x = px2; x < px2 + 12; x++) for (const y of [py, py + 7]) deco[I2(x, y)] = D.FENCE;
          for (let y = py; y < py + 8; y++) for (const x of [px2, px2 + 11]) deco[I2(x, y)] = D.FENCE;
          for (let y = py + 1; y < py + 7; y++) for (let x = px2 + 1; x < px2 + 11; x++) ground[I2(x, y)] = (x + y) % 5 === 0 ? T.FOREST : T.GRASS;
          for (let x = px2 + 5; x < px2 + 7; x++) deco[I2(x, py + 7)] = 0;
          occ.push([px2 - 1, py - 1, 14, 10]);
          n2++;
        }
        S2.pens = n2;
      }
      let attempt = 0;
      for (const et of sp.ex || []) {
        const ebt = BTYPES[et];
        if (!ebt) continue;
        let done = false;
        for (let a = 0; a < 80 && !done; a++, attempt++) {
          const ex = x0 + 3 + rng.int(Math.max(1, sp.w - ebt.w - 6)), ey = y0 + 3 + rng.int(Math.max(1, sp.h - ebt.h - 8));
          if (ey + ebt.h >= y0 + sp.h - 2 || clash(ex - 1, ey - 1, ebt.w + 2, ebt.h + 3)) continue;
          if (sp.runway && ey < y0 + 6 + 14) continue;
          const eb = addBuilding(et, ex, ey, r.id, { site: sites2.length });
          for (let x = ex - 1; x <= ex + ebt.w; x++) {
          }
          occ.push([ex - 1, ey - 1, ebt.w + 2, ebt.h + 3]);
          S2.parts.push(eb.idx);
          done = true;
          if (et === "tourtower" && kind === "airport") eb.name = "\u7BA1\u5236\u5854";
          if (et === "warehouse" && kind === "airport") eb.name = "\u822A\u7A7A\u6A5F\u683C\u7D0D\u5EAB" + (S2.parts.length - 1);
        }
        if (!done) dbg["siteEx:" + et] = (dbg["siteEx:" + et] || 0) + 1;
      }
      if (sp.yard === "park") {
        for (let y = y0 + 1; y < y0 + sp.h - 1; y++) for (let x = x0 + 1; x < x0 + sp.w - 1; x++) {
          const k = I2(x, y);
          if (bid[k] >= 0 || deco[k] || ground[k] !== T.GRASS) continue;
          const q = rng.next();
          if (q < 0.05) deco[k] = D.TREE;
          else if (q < 0.09) deco[k] = D.FLOWER;
          else if (q < 0.092) deco[k] = D.BENCH;
        }
      }
      sites2.push(S2);
      placeLog[kind] = (placeLog[kind] || 0) + 1;
      return S2;
    }
    const planList = [];
    for (const [zid, m] of Object.entries(PLAN2)) for (const [t, n2] of Object.entries(m)) for (let i = 0; i < n2; i++) planList.push([t, zid]);
    const SIZE = (t) => SITE[t] ? SITE[t].w * SITE[t].h : 0;
    planList.sort((a, b) => SIZE(b[0]) - SIZE(a[0]) || (a[1] < b[1] ? -1 : 1));
    const pending2 = [];
    for (const [t, zid] of planList) {
      if (COASTAL2.has(t)) {
        pending2.push([t, zid]);
        continue;
      }
      if (!SITE[t]) {
        pending2.push([t, zid]);
        continue;
      }
      if (!placeSite(t, REGBY[zid])) dbg["siteFail:" + t + "@" + zid] = (dbg["siteFail:" + t + "@" + zid] || 0) + 1;
    }
    localOnly = true;
    const arterialEvery = 3;
    for (const r of REGIONS2) {
      const rows2 = rowsOf2(r);
      const j0 = rows2.indexOf(Math.round(r.y));
      void j0;
      const cols2 = [];
      for (let x = r.x - Math.floor(r.rx * 1.05 / r.sv) * r.sv; x <= r.x + r.rx * 1.05; x += r.sv) cols2.push(Math.round(x));
      rows2.forEach((y, j) => {
        const dy = (y - r.y) / r.ry;
        if (Math.abs(dy) >= 1.05) return;
        const half = r.rx * Math.sqrt(Math.max(0, 1.1 - dy * dy));
        const w = r.art >= 4 && j % arterialEvery === 1 ? 2 : 1;
        carveLine(Math.round(r.x - half), y, Math.round(r.x + half), y, w);
      });
      cols2.forEach((x, i) => {
        const dx = (x - r.x) / r.rx;
        if (Math.abs(dx) >= 1.05) return;
        const half = r.ry * Math.sqrt(Math.max(0, 1.1 - dx * dx));
        const w = r.art >= 4 && i % arterialEvery === 1 ? 2 : 1;
        carveLine(x, Math.round(r.y - half), x, Math.round(r.y + half), w);
      });
    }
    for (const S2 of sites2) {
      const w = S2.w > 60 ? 2 : 1;
      carveLine(S2.x - 3, S2.y + S2.h, S2.x + S2.w + 2, S2.y + S2.h, w);
    }
    const SG = REGBY.shotengai;
    const sgY = rowsOf2(SG).reduce((p, y) => Math.abs(y - SG.y) < Math.abs(p - SG.y) ? y : p, rowsOf2(SG)[0]);
    const shopStreet = { y: sgY, x0: SG.x - 78, x1: SG.x + 78, w: 2 };
    localOnly = true;
    carveLine(shopStreet.x0, shopStreet.y, shopStreet.x1, shopStreet.y, 2);
    const CT = REGBY.chinatown;
    const ctY = rowsOf2(CT).reduce((p, y) => Math.abs(y - CT.y) < Math.abs(p - CT.y) ? y : p, rowsOf2(CT)[0]);
    const chinaStreet = { y: ctY, x0: CT.x - 38, x1: CT.x + 38, w: 2 };
    carveLine(chinaStreet.x0, ctY, chinaStreet.x1, ctY, 2);
    localOnly = false;
    const isRd = (g) => g === T.ROAD || g === T.BRIDGE || g === T.CROSSING || g === T.PLAZA;
    function connectComponents(minSize, maxDist) {
      const comp = new Int32Array(N).fill(-1);
      const comps = [];
      const q = new Int32Array(N);
      for (let k = 0; k < N; k++) {
        if (comp[k] >= 0 || !isRd(ground[k]) || !rmeta.ax[k]) continue;
        let qh = 0, qt = 0;
        q[qt++] = k;
        comp[k] = comps.length;
        const mem = [];
        while (qh < qt) {
          const t = q[qh++];
          mem.push(t);
          const x = t % W, y = t / W | 0;
          if (x + 1 < W) {
            const n2 = t + 1;
            if (comp[n2] < 0 && isRd(ground[n2]) && rmeta.ax[n2]) {
              comp[n2] = comps.length;
              q[qt++] = n2;
            }
          }
          if (x > 0) {
            const n2 = t - 1;
            if (comp[n2] < 0 && isRd(ground[n2]) && rmeta.ax[n2]) {
              comp[n2] = comps.length;
              q[qt++] = n2;
            }
          }
          if (y + 1 < H2) {
            const n2 = t + W;
            if (comp[n2] < 0 && isRd(ground[n2]) && rmeta.ax[n2]) {
              comp[n2] = comps.length;
              q[qt++] = n2;
            }
          }
          if (y > 0) {
            const n2 = t - W;
            if (comp[n2] < 0 && isRd(ground[n2]) && rmeta.ax[n2]) {
              comp[n2] = comps.length;
              q[qt++] = n2;
            }
          }
        }
        comps.push(mem);
      }
      const big = comps.map((c, i) => i).filter((i) => comps[i].length >= minSize);
      if (big.length < 2) return { comps: comps.length, big: big.length, joined: 0 };
      const samp = (i) => {
        const c = comps[i], st3 = Math.max(1, c.length / 160 | 0);
        const o = [];
        for (let j = 0; j < c.length; j += st3) o.push([c[j] % W, c[j] / W | 0]);
        return o;
      };
      const S2 = new Map(big.map((i) => [i, samp(i)]));
      const par = new Map(big.map((i) => [i, i]));
      const find = (i) => {
        while (par.get(i) !== i) {
          par.set(i, par.get(par.get(i)));
          i = par.get(i);
        }
        return i;
      };
      const cand = [];
      for (let a = 0; a < big.length; a++) for (let b = a + 1; b < big.length; b++) {
        let best = 1e9, bp = null;
        const A2 = S2.get(big[a]), B2 = S2.get(big[b]);
        for (const p of A2) for (const q2 of B2) {
          const d = Math.abs(p[0] - q2[0]) + Math.abs(p[1] - q2[1]);
          if (d < best) {
            best = d;
            bp = [p, q2];
          }
        }
        if (best <= maxDist) cand.push([best, bp, big[a], big[b]]);
      }
      cand.sort((u, v) => u[0] - v[0]);
      let joined = 0;
      const segCost = (xa, ya, xb, yb) => {
        let bad = 0, x = xa, y = ya;
        const sx = Math.sign(xb - xa), sy = Math.sign(yb - ya);
        while (true) {
          for (let k = 0; k < 2; k++) {
            const cx = sx !== 0 ? x : x + k, cy = sx !== 0 ? y + k : y;
            if (!inb(cx, cy)) {
              bad += 9;
              continue;
            }
            const kk = I2(cx, cy);
            if (bid[kk] >= 0 || res[kk] === 2 || ground[kk] === T.PLATFORM || res[kk] === 1 && ground[kk] !== T.PLAZA) bad++;
          }
          if (x === xb && y === yb) break;
          if (x !== xb) x += sx;
          else y += sy;
        }
        return bad;
      };
      for (const [d, [p, q2], a, b] of cand) {
        if (find(a) === find(b)) continue;
        const c1 = segCost(p[0], p[1], q2[0], p[1]) + segCost(q2[0], p[1], q2[0], q2[1]), c2 = segCost(p[0], p[1], p[0], q2[1]) + segCost(p[0], q2[1], q2[0], q2[1]);
        const h = c1 <= c2;
        if ((h ? c1 : c2) > 0) continue;
        if (h) {
          carveLine(p[0], p[1], q2[0], p[1], 2);
          carveLine(q2[0], p[1], q2[0], q2[1], 2);
        } else {
          carveLine(p[0], p[1], p[0], q2[1], 2);
          carveLine(p[0], q2[1], q2[0], q2[1], 2);
        }
        par.set(find(a), find(b));
        joined++;
      }
      return { comps: comps.length, big: big.length, joined };
    }
    dbg.join1 = connectComponents(30, 160);
    const doorOk = (x, y) => inb(x, y) && net[I2(x, y)] === 1 && (ground[I2(x, y)] === T.ROAD || ground[I2(x, y)] === T.PLAZA);
    const fits = (bx, by, w, h) => {
      if (bx < 2 || by < 2 || bx + w >= W - 2 || by + h >= H2 - 2) return false;
      for (let y = by; y < by + h; y++) for (let x = bx; x < bx + w; x++) {
        const k = I2(x, y);
        if (bid[k] >= 0 || res[k] || !FREEG.has(ground[k]) || deco[k] === D.TREE) return false;
      }
      return doorOk(bx + (w >> 1), by + h);
    };
    const bagCache = {};
    const bagOf = (zid) => bagCache[zid] || (bagCache[zid] = (() => {
      const m = mixOf(zid);
      const a = [];
      for (const [t, n2] of Object.entries(m)) if (n2 > 0 && BTYPES[t] && !SITE_TYPES.has(t)) a.push([t, n2]);
      if (!a.length) a.push(["house", 10]);
      return a;
    })());
    const ESTATE_ZONES = /* @__PURE__ */ new Set(["school", "campus", "suburb_n", "suburb_e", "suburb_w", "marina", "tower", "newtown", "civic", "resort"]);
    const ESTATE = { w: 10, h: 7 };
    let estates = 0;
    const typeCount = {};
    for (const b of buildings) typeCount[b.type] = (typeCount[b.type] || 0) + 1;
    function fillRow(r, y, xa, xb, onlyRes) {
      let x = xa;
      let guard = 0;
      while (x < xb && guard++ < 4e3) {
        const z = zoneAt(x + 2, y - 3, 1.15) || r;
        const rr3 = REGBY[z.id] || r;
        {
          const nn = norm(rr3, x + 2, y - 3);
          const pf = Math.max(0.12, rr3.fill * (1 - 0.62 * Math.pow(Math.min(1.2, nn), 1.1)));
          if (rng.next() > pf) {
            x += 1 + rng.int(4);
            continue;
          }
        }
        let bag = bagOf(z.id);
        if (onlyRes) bag = bag.filter(([t]) => BTYPES[t].cat === "res");
        if (!bag.length) {
          x += 3;
          continue;
        }
        let placed = false;
        for (let a = 0; a < 4 && !placed; a++) {
          const t = rng.weighted(bag);
          const bt = BTYPES[t];
          const bx = x, by = y - bt.h;
          if (t === "house" && ESTATE_ZONES.has(z.id) && estates < 120 && rng.next() < 0.25 && fits(x, y - ESTATE.h, ESTATE.w, ESTATE.h)) {
            addBuilding("house", x, y - ESTATE.h, z.id, { w: ESTATE.w, h: ESTATE.h, estate: 1, pin: "mansion", name: "\u5927\u90B8\u5B85", doorY: y });
            estates++;
            x += ESTATE.w + 1;
            placed = true;
            continue;
          }
          if (fits(bx, by, bt.w, bt.h)) {
            addBuilding(t, bx, by, z.id);
            typeCount[t] = (typeCount[t] || 0) + 1;
            x += bt.w + (z.id === "shotengai" || z.id === "chinatown" || z.id === "downtown" ? 0 : rng.int(2));
            placed = true;
          }
        }
        if (!placed) x += 1;
      }
    }
    const SHOPS = [["shop", 6], ["restaurant", 3], ["ramen", 3], ["cafe", 2], ["clothes", 3], ["bookstore", 1], ["pharmacy", 1], ["izakaya", 2], ["fishshop", 2], ["greengrocer", 2], ["liquor", 2], ["konbini", 1]];
    localOnly = true;
    {
      const bs = shopStreet.y + 6;
      carveLine(shopStreet.x0, bs, shopStreet.x1, bs, 1);
      shopStreet.back = bs;
    }
    localOnly = false;
    {
      let x = shopStreet.x0;
      while (x < shopStreet.x1) {
        const t = rng.weighted(SHOPS);
        const bt = BTYPES[t];
        const by = shopStreet.y - bt.h;
        if (fits(x, by, bt.w, bt.h)) {
          addBuilding(t, x, by, "shotengai", { shotengaiStreet: true });
          x += bt.w;
        } else x += 1;
      }
    }
    {
      const by0 = shopStreet.back;
      let x = shopStreet.x0;
      while (x < shopStreet.x1) {
        const t = rng.weighted(SHOPS);
        const bt = BTYPES[t];
        const by = by0 - bt.h;
        if (by >= shopStreet.y + 2 && fits(x, by, bt.w, bt.h)) {
          addBuilding(t, x, by, "shotengai", { shotengaiStreet: true });
          x += bt.w;
        } else x += 1;
      }
    }
    {
      const SH2 = [["restaurant", 6], ["ramen", 4], ["shop", 5], ["izakaya", 2], ["greengrocer", 2], ["seafood", 2]];
      let x = chinaStreet.x0;
      while (x < chinaStreet.x1) {
        const t = rng.weighted(SH2);
        const bt = BTYPES[t];
        const by = chinaStreet.y - bt.h;
        if (fits(x, by, bt.w, bt.h)) {
          addBuilding(t, x, by, "chinatown", { chinatown: true });
          x += bt.w;
        } else x += 1;
      }
    }
    for (const r of REGIONS2) {
      for (const y of rowsOf2(r)) {
        const dy = (y - r.y) / r.ry;
        if (Math.abs(dy) >= 1.05) continue;
        const half = r.rx * Math.sqrt(Math.max(0, 1.1 - dy * dy));
        fillRow(r, y, Math.round(r.x - half), Math.round(r.x + half), false);
      }
    }
    const coastRoadY = (x) => Math.floor(coast2(x) / 8) * 8 - 3;
    const coastBand = (x0, x1) => {
      localOnly = false;
      let px2 = x0;
      for (let x = x0; x <= x1; x += 8) {
        const yy = coastRoadY(x);
        const nx = Math.min(x + 8, x1 + 1);
        carveLine(x, yy, nx - 1, yy, 1);
        if (x > x0) {
          const py = coastRoadY(x - 8);
          if (py !== yy) carveLine(x, Math.min(py, yy), x, Math.max(py, yy), 1);
        }
        px2 = x;
      }
      void px2;
    };
    coastBand(30, 340);
    coastBand(840, 1250);
    const placeCoastal = (type, zid) => {
      const r = REGBY[zid];
      const bt = BTYPES[type];
      for (let a = 0; a < 200; a++) {
        const bx = Math.round(r.x + (rng.next() * 2 - 1) * r.rx * (a > 100 ? 1.4 : 1)) - (bt.w >> 1);
        const yy = coastRoadY(bx + (bt.w >> 1));
        const by = yy - bt.h;
        for (let x = bx; x < bx + bt.w; x++) if (coastRoadY(x) !== yy) {
          a += 0;
        }
        if (!fits(bx, by, bt.w, bt.h)) continue;
        let ok = true;
        for (let x = bx; x < bx + bt.w; x++) if (coastRoadY(x) !== yy) ok = false;
        if (!ok) continue;
        return addBuilding(type, bx, by, zid);
      }
      dbg["coastFail:" + type + "@" + zid] = (dbg["coastFail:" + type + "@" + zid] || 0) + 1;
      return null;
    };
    for (const [t, zid] of pending2) if (COASTAL2.has(t)) {
      const b = placeCoastal(t, zid);
      if (b) placeLog[t] = (placeLog[t] || 0) + 1;
    }
    for (let i = 0; i < 6; i++) placeCoastal("beachhouse", "resort");
    for (let i = 0; i < 3; i++) {
      const b = placeCoastal("pier", "marina");
      void b;
    }
    for (const [t, zid] of pending2) if (!COASTAL2.has(t)) {
      const r = REGBY[zid];
      let done = false;
      for (const y of rowsOf2(r)) {
        const bt = BTYPES[t];
        for (let x = r.x - r.rx; x < r.x + r.rx; x += 3) if (fits(x, y - bt.h, bt.w, bt.h)) {
          addBuilding(t, x, y - bt.h, zid);
          placeLog[t] = (placeLog[t] || 0) + 1;
          done = true;
          break;
        }
        if (done) break;
      }
    }
    const capNow = () => buildings.reduce((s, b) => s + (BTYPES[b.type].cat === "res" ? b.cap ?? BTYPES[b.type].cap : 0), 0);
    let pass = 0;
    while (capNow() < 16e3 && pass++ < 6) for (const r of REGIONS2) {
      if (!["suburb_n", "suburb_e", "suburb_w", "newtown", "oldtown", "campus", "school", "civic", "port"].includes(r.id)) continue;
      for (const y of rowsOf2(r)) {
        const dy = (y - r.y) / r.ry;
        if (Math.abs(dy) >= 1.05) continue;
        const half = r.rx * Math.sqrt(Math.max(0, 1.1 - dy * dy));
        fillRow({ ...r, fill: 1 }, y, Math.round(r.x - half), Math.round(r.x + half), true);
      }
    }
    dbg.capacity = capNow();
    dbg.join2 = connectComponents(30, 160);
    const pxy = (x) => x;
    void pxy;
    for (let y = 1; y < H2 - 1; y++) for (let x = 1; x < W - 1; x++) {
      const k = I2(x, y);
      if (bid[k] >= 0 || deco[k] || net[k] || res[k] === 2) continue;
      if (ground[k] === T.GRASS) {
        const q = rng.next();
        let pt = 0.03;
        if (y < 220 || x > 1e3 && y < 340) pt = 0.06;
        if (q < pt) deco[k] = D.TREE;
        else if (q < pt + 0.02) deco[k] = D.FLOWER;
      }
    }
    for (const b of buildings) {
      if (["konbini", "super", "station", "mall", "dept"].includes(b.type)) {
        const vx = b.x + b.w, vy = b.y + b.h - 1;
        if (inb(vx, vy) && bid[I2(vx, vy)] < 0 && ground[I2(vx, vy)] === T.GRASS && !deco[I2(vx, vy)]) deco[I2(vx, vy)] = D.VENDING;
      }
      const bt = BTYPES[b.type];
      if (bt.cat === "res" || bt.cat === "shop") {
        const px2 = b.x - 1, py = b.y + b.h - 1;
        if (inb(px2, py) && bid[I2(px2, py)] < 0 && ground[I2(px2, py)] === T.GRASS && !deco[I2(px2, py)] && rng.chance(0.3)) deco[I2(px2, py)] = D.POST;
      }
    }
    for (const s of STATIONS2) {
      for (const dx of [-9, -4, 4, 9]) {
        const x = s.x + dx, y = s.y + 5;
        if (ground[I2(x, y)] === T.PLAZA) deco[I2(x, y)] = D.LAMP;
      }
      const bx = s.x - 6, by = s.y + 7;
      if (inb(bx, by) && ground[I2(bx, by)] === T.PLAZA) deco[I2(bx, by)] = D.BENCH;
    }
    dbg.roadJoined = joinRoads();
    function joinRoads() {
      const isD = (k) => {
        const g = ground[k];
        return (g === T.ROAD || g === T.BRIDGE || g === T.CROSSING || g === T.PLAZA) && rmeta.ax[k] > 0;
      };
      let n2 = 0;
      for (const [G4, maxE, TO] of [[T.RAIL, 9, T.CROSSING], [T.WATER, 14, T.BRIDGE]]) for (const bit of [2, 1]) {
        for (let u = 1; u < (bit === 2 ? W : H2) - 1; u++) for (let v = 1; v < (bit === 2 ? H2 : W) - 1; v++) {
          const X = bit === 2 ? u : v, Y2 = bit === 2 ? v : u;
          const k = I2(X, Y2);
          if (ground[k] !== G4) continue;
          const px2 = bit === 2 ? X : X - 1, py = bit === 2 ? Y2 - 1 : Y2;
          if (ground[I2(px2, py)] === G4) continue;
          let e = 0;
          while (e < maxE + 1 && inb(bit === 2 ? X : X + e, bit === 2 ? Y2 + e : Y2) && ground[I2(bit === 2 ? X : X + e, bit === 2 ? Y2 + e : Y2)] === G4) e++;
          if (e > maxE) continue;
          const a = I2(px2, py), bx = bit === 2 ? X : X + e, by = bit === 2 ? Y2 + e : Y2;
          if (!inb(bx, by)) continue;
          const b = I2(bx, by);
          if (!isD(a) || !isD(b) || rmeta.ax[a] !== bit || rmeta.ax[b] !== bit || rmeta.th[a] !== rmeta.th[b] || rmeta.ln[a] !== rmeta.ln[b]) continue;
          for (let i = 0; i < e; i++) {
            const cx = bit === 2 ? X : X + i, cy = bit === 2 ? Y2 + i : Y2, ck = I2(cx, cy);
            if (bid[ck] >= 0 || res[ck] === 2) {
              i = -1;
              break;
            }
          }
          if (!(e > 0)) continue;
          let blocked = false;
          for (let i = 0; i < e; i++) {
            const ck = I2(bit === 2 ? X : X + i, bit === 2 ? Y2 + i : Y2);
            if (bid[ck] >= 0 || res[ck] === 2) blocked = true;
          }
          if (blocked) continue;
          for (let i = 0; i < e; i++) {
            const ck = I2(bit === 2 ? X : X + i, bit === 2 ? Y2 + i : Y2);
            ground[ck] = TO;
            deco[ck] = D.NONE;
            net[ck] = 1;
            rmeta.ax[ck] = bit;
            rmeta.th[ck] = rmeta.th[a];
            rmeta.ln[ck] = rmeta.ln[a];
          }
          n2++;
        }
      }
      return n2;
    }
    dbg.xingAdded = addRailCrossings();
    function addRailCrossings() {
      const FREEG2 = /* @__PURE__ */ new Set([T.GRASS, T.ROAD, T.PATH, T.PLAZA, T.SAND, T.FARM, T.PADDY]);
      const CLR = /* @__PURE__ */ new Set([D.TREE, D.FENCE, D.FLOWER, D.POST, D.BENCH, D.LAMP, D.VENDING]);
      const freeAt = (x, y) => {
        if (!inb(x, y)) return false;
        const k = I2(x, y);
        if (bid[k] >= 0 || res[k] === 2) return false;
        if (!FREEG2.has(ground[k])) return false;
        return !deco[k] || CLR.has(deco[k]) || deco[k] === D.NONE;
      };
      const comp = new Int32Array(N).fill(-1);
      let nc = 0;
      for (let k0 = 0; k0 < N; k0++) {
        if (ground[k0] !== T.RAIL && ground[k0] !== T.CROSSING || comp[k0] >= 0) continue;
        const q = [k0];
        comp[k0] = nc;
        for (let i = 0; i < q.length; i++) {
          const t = q[i], tx = t % W, ty = t / W | 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const x = tx + dx, y = ty + dy;
            if (!inb(x, y)) continue;
            const kk = I2(x, y);
            if (comp[kk] < 0 && (ground[kk] === T.RAIL || ground[kk] === T.CROSSING)) {
              comp[kk] = nc;
              q.push(kk);
            }
          }
        }
        nc++;
      }
      const placed = [];
      for (let y = 0; y < H2; y++) for (let x = 0; x < W; x++) if (ground[I2(x, y)] === T.CROSSING) {
        const c = comp[I2(x, y)];
        if (c >= 0) placed.push([x, y, c]);
        else {
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const cc = inb(x + dx, y + dy) ? comp[I2(x + dx, y + dy)] : -1;
            if (cc >= 0) {
              placed.push([x, y, cc]);
              break;
            }
          }
        }
      }
      const SP = 28;
      let n2 = 0;
      const near2 = (x, y, c) => {
        for (const p of placed) if (p[2] === c && Math.hypot(p[0] - x, p[1] - y) < SP) return true;
        return false;
      };
      const apply = (cells, ends, c, cx, cy) => {
        for (const [x, y] of cells) {
          ground[I2(x, y)] = T.CROSSING;
          deco[I2(x, y)] = D.NONE;
        }
        for (const [x, y] of ends) {
          if (ground[I2(x, y)] !== T.ROAD && ground[I2(x, y)] !== T.PLAZA) ground[I2(x, y)] = T.PATH;
          deco[I2(x, y)] = D.NONE;
        }
        placed.push([cx, cy, c]);
        n2++;
      };
      for (let pass2 = 0; pass2 < 2; pass2++) for (let a = 2; a < (pass2 ? H2 : W) - 3; a++) for (let b = 2; b < (pass2 ? W : H2) - 1; b++) {
        const X = pass2 ? b : a, Y2 = pass2 ? a : b;
        if (ground[I2(X, Y2)] !== T.RAIL) continue;
        if (pass2 ? ground[I2(X - 1, Y2)] === T.RAIL : ground[I2(X, Y2 - 1)] === T.RAIL) continue;
        let e = 0;
        const step2 = pass2 ? [1, 0] : [0, 1];
        while (e < 9 && ground[I2(X + step2[0] * e, Y2 + step2[1] * e)] === T.RAIL) e++;
        if (e > 8) continue;
        const ex = X + step2[0] * e, ey = Y2 + step2[1] * e, sx = X - step2[0], sy = Y2 - step2[1];
        const lat = pass2 ? [0, 1] : [1, 0];
        const cells = [], ends = [];
        let ok = true;
        for (let w = 0; w < 2 && ok; w++) {
          const ox = lat[0] * w, oy = lat[1] * w;
          for (let i = 0; i < e; i++) {
            const x = X + step2[0] * i + ox, y = Y2 + step2[1] * i + oy;
            if (ground[I2(x, y)] !== T.RAIL) {
              ok = false;
              break;
            }
            cells.push([x, y]);
          }
          if (!ok) break;
          if (!freeAt(sx + ox, sy + oy) || !freeAt(ex + ox, ey + oy)) ok = false;
          ends.push([sx + ox, sy + oy], [ex + ox, ey + oy]);
        }
        if (!ok) continue;
        const c = comp[I2(X, Y2)];
        const cx = X + step2[0] * (e / 2), cy = Y2 + step2[1] * (e / 2);
        if (near2(cx, cy, c)) continue;
        let tooClose = false;
        for (const p of placed) if (Math.hypot(p[0] - cx, p[1] - cy) < 5) {
          tooClose = true;
          break;
        }
        if (tooClose) continue;
        apply(cells, ends, c, cx, cy);
      }
      return n2;
    }
    dbg.bridgeAdded = addWaterBridges();
    function addWaterBridges() {
      const FREEG2 = /* @__PURE__ */ new Set([T.GRASS, T.ROAD, T.PATH, T.PLAZA, T.SAND, T.FARM, T.PADDY]);
      const CLR = /* @__PURE__ */ new Set([D.TREE, D.FENCE, D.FLOWER, D.POST, D.BENCH, D.LAMP, D.VENDING]);
      const freeAt = (x, y) => {
        if (!inb(x, y)) return false;
        const k = I2(x, y);
        if (bid[k] >= 0 || res[k] === 2) return false;
        if (!FREEG2.has(ground[k])) return false;
        return !deco[k] || CLR.has(deco[k]) || deco[k] === D.NONE;
      };
      const walk = (k) => {
        const g = ground[k];
        if (bid[k] >= 0) return false;
        if (!(FREEG2.has(g) || g === T.BRIDGE || g === T.CROSSING || g === T.QUAY)) return false;
        const d = deco[k];
        return !d || !(d === D.TREE || d === D.FENCE || d === D.VENDING || d === D.BENCH || d === D.POST || d === D.LAMP || d === D.BUILDING);
      };
      const stamp = new Int32Array(N), dist2 = new Int32Array(N);
      let sid = 0;
      const qa = new Int32Array(6e4);
      const detour = (a, b, cap2) => {
        sid++;
        let h = 0, t = 0;
        qa[t++] = a;
        stamp[a] = sid;
        dist2[a] = 0;
        while (h < t) {
          const c = qa[h++], d = dist2[c];
          if (c === b) return d;
          if (d >= cap2) continue;
          const x = c % W, y = c / W | 0;
          for (let q = 0; q < 4; q++) {
            const nx = x + (q === 0) - (q === 1), ny = y + (q === 2) - (q === 3);
            if (nx < 0 || ny < 0 || nx >= W || ny >= H2) continue;
            const kk = ny * W + nx;
            if (stamp[kk] !== sid && walk(kk)) {
              stamp[kk] = sid;
              dist2[kk] = d + 1;
              if (t < qa.length) qa[t++] = kk;
            }
          }
        }
        return -1;
      };
      let n2 = 0;
      const CAP2 = 110;
      for (let pass2 = 0; pass2 < 2; pass2++) for (let a = 2; a < (pass2 ? H2 : W) - 3; a += 2) for (let b = 2; b < (pass2 ? W : H2) - 1; b++) {
        const X = pass2 ? b : a, Y2 = pass2 ? a : b;
        if (ground[I2(X, Y2)] !== T.WATER) continue;
        if (pass2 ? ground[I2(X - 1, Y2)] === T.WATER : ground[I2(X, Y2 - 1)] === T.WATER) continue;
        const step2 = pass2 ? [1, 0] : [0, 1];
        let e = 0;
        while (e < 22 && ground[I2(X + step2[0] * e, Y2 + step2[1] * e)] === T.WATER) e++;
        if (e > 20) continue;
        const lat = pass2 ? [0, 1] : [1, 0];
        const cells = [], ends = [];
        let ok = true;
        for (let w = 0; w < 2 && ok; w++) {
          const ox = lat[0] * w, oy = lat[1] * w;
          for (let i = 0; i < e; i++) {
            const x = X + step2[0] * i + ox, y = Y2 + step2[1] * i + oy;
            if (ground[I2(x, y)] !== T.WATER) {
              ok = false;
              break;
            }
            cells.push([x, y]);
          }
          if (!ok) break;
          const sx = X - step2[0] + ox, sy = Y2 - step2[1] + oy, ex = X + step2[0] * e + ox, ey = Y2 + step2[1] * e + oy;
          if (!freeAt(sx, sy) || !freeAt(ex, ey)) ok = false;
          ends.push([sx, sy], [ex, ey]);
        }
        if (!ok) continue;
        const A2 = I2(ends[0][0], ends[0][1]), B2 = I2(ends[1][0], ends[1][1]);
        if (detour(A2, B2, CAP2) >= 0) continue;
        for (const [x, y] of cells) {
          ground[I2(x, y)] = T.BRIDGE;
          deco[I2(x, y)] = D.NONE;
        }
        for (const [x, y] of ends) deco[I2(x, y)] = D.NONE;
        n2++;
      }
      return n2;
    }
    const GROUND_SOLID2 = /* @__PURE__ */ new Set([T.WATER, T.RAIL, T.ROCK, T.FOREST]);
    const DECO_SOLID2 = /* @__PURE__ */ new Set([D.TREE, D.VENDING, D.BENCH, D.POST, D.LAMP, D.FENCE, D.BUILDING]);
    const solid = new Uint8Array(N);
    for (let k = 0; k < N; k++) if (GROUND_SOLID2.has(ground[k]) || DECO_SOLID2.has(deco[k]) || bid[k] >= 0) solid[k] = 1;
    for (const k of grandSolid) solid[k] = 1;
    const ferries = buildings.filter((b) => b.type === "ferry");
    ferries.forEach((b, i) => hubs.push({ id: "hub_ferry" + (i + 1), kind: "ferry", name: (zones.find((z) => z.id === b.zone) || { name: "" }).name.replace(/周辺$/, "") + "\u30D5\u30A7\u30EA\u30FC\u30BF\u30FC\u30DF\u30CA\u30EB", building: b.idx, door: { x: b.doorX, y: b.doorY } }));
    assignNames2(buildings, zones, rng);
    for (const b of buildings) {
      if (b.type === "station" && b.stationId) continue;
      if (b.type === "ferry") b.name = "\u9752\u6D77" + (b.zone === "marina" ? "\u6E2F\u5357" : "\u6D77\u98A8") + "\u30D5\u30A7\u30EA\u30FC\u30BF\u30FC\u30DF\u30CA\u30EB";
      if (b.type === "stadium") b.name = "\u9752\u6D77\u7DCF\u5408\u30B9\u30BF\u30B8\u30A2\u30E0";
      if (b.type === "themepark") b.name = "\u9752\u6D77\u30C9\u30EA\u30FC\u30E0\u30D1\u30FC\u30AF";
      if (b.type === "zoo") b.name = "\u9752\u6D77\u3069\u3046\u3076\u3064\u5712";
      if (b.type === "airport") b.name = "\u9752\u6D77\u7A7A\u6E2F\u30BF\u30FC\u30DF\u30CA\u30EB";
    }
    return {
      W,
      H: H2,
      seed,
      ground,
      deco,
      solid,
      bid,
      net,
      buildings,
      zones,
      stations,
      railPaths,
      roadSegs,
      placeLog,
      dbg,
      v2info: { city2: true, sites: sites2.length },
      lots,
      estates: grandEstates,
      estWall: grandWall,
      siteRects: sites2.map((S2) => [S2.x, S2.y, S2.w, S2.h]),
      ver: opts.ver || 4,
      rmeta,
      idx: I2,
      lines: LINES2,
      sites: sites2,
      hubs,
      shopStreet,
      chinaStreet,
      regionId: "aoumi_v2",
      regions: REGIONS2
    };
  }

