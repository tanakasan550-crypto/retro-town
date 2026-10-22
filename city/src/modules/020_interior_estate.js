  // src/interior_estate.js
  var isMansion = (b) => b && b.estate === 2;
  var MANSION = { W: 48, H: 30, lo: -1, hi: 2, nf: 3 };
  var MANSION_LABEL = { "-1": "B1 \u5730\u4E0B(\u30EF\u30A4\u30F3\u30BB\u30E9\u30FC\u30FB\u30AC\u30EC\u30FC\u30B8)", 0: "1F \u8FCE\u8CD3\u30FB\u751F\u6D3B\u7A7A\u9593", 1: "2F \u5BB6\u65CF\u306E\u5C45\u4F4F\u7A7A\u9593", 2: "3F \u8DA3\u5473\u30FB\u30B2\u30B9\u30C8\u30B9\u30A4\u30FC\u30C8" };
  var EV_X = [32, 35];
  var EV_Y = 15;
  var PLAN3 = {
    "0": [
      ["hall", "\u5DE8\u5927\u7384\u95A2\u30DB\u30FC\u30EB", 18, 0, 30, 29, "floor_marble", "hall", []],
      ["salon1", "\u5FDC\u63A5\u5BA4(\u8FCE\u8CD3)", 0, 0, 9, 9, "floor_carpet", "salon", [[9, 4], [4, 9]]],
      ["salon2", "\u5FDC\u63A5\u5BA4(\u5C0F)", 9, 0, 18, 9, "floor_carpet", "salon2", [[18, 4]]],
      ["living", "\u5927\u578B\u30EA\u30D3\u30F3\u30B0", 0, 9, 18, 19, "floor_carpet", "living", [[18, 14], [13, 9]]],
      ["dining", "\u5927\u578B\u30C0\u30A4\u30CB\u30F3\u30B0(\u6669\u9910\u5BA4)", 0, 19, 18, 29, "floor_wood", "dining", [[18, 24], [9, 19]]],
      ["kitchen", "\u4E3B\u53A8\u623F", 30, 0, 39, 9, "floor_tile", "kitchen", [[30, 4], [39, 2]]],
      ["kitchen2", "\u88DC\u52A9\u53A8\u623F(\u4F7F\u7528\u4EBA\u5074)", 39, 0, 47, 5, "floor_tile", "kitchen2", [[43, 5]]],
      ["pantry", "\u6599\u7406\u4EBA\u306E\u4F5C\u696D\u5BA4\u30FB\u98DF\u54C1\u5EAB", 39, 5, 47, 9, "floor_tile", "pantry", [[43, 9]]],
      ["butler", "\u57F7\u4E8B\u5BA4", 30, 9, 38, 14, "floor_wood", "butler", [[30, 11], [38, 11]]],
      ["staff", "\u4F7F\u7528\u4EBA\u63A7\u5BA4", 38, 9, 47, 14, "floor_wood", "staff", [[43, 9]]],
      ["evl", "\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u30DB\u30FC\u30EB", 30, 14, 38, 22, "floor_marble", "evl", [[30, 18]]],
      ["guest", "\u6765\u5BA2\u63A7\u5BA4", 38, 14, 47, 22, "floor_carpet", "guestwait", [[38, 18]]],
      ["cloak", "\u30AF\u30ED\u30FC\u30AF", 30, 22, 38, 29, "floor_wood", "cloak", [[30, 25]]],
      ["wc", "\u5927\u578B\u30C8\u30A4\u30EC\u30FB\u6D17\u9762", 38, 22, 47, 29, "floor_tile", "wc", [[38, 25]]]
    ],
    "1": [
      ["gal", "2\u968E\u30AE\u30E3\u30E9\u30EA\u30FC(\u5439\u304D\u629C\u3051)", 18, 0, 30, 29, "floor_marble", "gal", []],
      ["hbed", "\u4E3B\u4EBA\u516C\u306E\u5BDD\u5BA4", 0, 0, 12, 10, "floor_carpet", "hbed", [[12, 5], [4, 10], [10, 10]]],
      ["hstudy", "\u4E3B\u4EBA\u516C\u306E\u66F8\u658E", 12, 0, 18, 10, "floor_wood", "study", [[18, 5]]],
      ["hbath", "\u4E3B\u4EBA\u516C\u306E\u5C02\u7528\u6D74\u5BA4\u30FB\u6D17\u9762", 0, 10, 9, 17, "bath", "hbath", []],
      ["wic", "\u5927\u578B\u30AF\u30ED\u30FC\u30BC\u30C3\u30C8", 9, 10, 18, 17, "floor_wood", "wic", []],
      ["mbed", "\u6BCD\u306E\u5BDD\u5BA4", 0, 17, 10, 29, "floor_carpet", "mbed", [[10, 20]]],
      ["mhobby", "\u6BCD\u306E\u8DA3\u5473\u5BA4", 10, 17, 18, 23, "floor_wood", "hobby", [[18, 20], [14, 23]]],
      ["fam", "\u5BB6\u65CF\u306E\u5C45\u5BA4", 10, 23, 18, 29, "floor_carpet", "famroom", []],
      ["fbed", "\u7236\u306E\u5BDD\u5BA4", 30, 0, 41, 9, "floor_carpet", "fbed", [[30, 5], [41, 5]]],
      ["fstudy", "\u7236\u306E\u66F8\u658E", 41, 0, 47, 9, "floor_wood", "study2", []],
      ["g1", "\u30B2\u30B9\u30C8\u30EB\u30FC\u30E01", 30, 9, 38, 14, "floor_carpet", "guestroom", [[30, 11], [38, 11]]],
      ["g2", "\u30B2\u30B9\u30C8\u30EB\u30FC\u30E02", 38, 9, 47, 14, "floor_carpet", "guestroom", []],
      ["evl", "\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u30DB\u30FC\u30EB", 30, 14, 38, 22, "floor_marble", "evl", [[30, 18]]],
      ["lounge", "\u5BB6\u65CF\u7528\u30E9\u30A6\u30F3\u30B8", 38, 14, 47, 22, "floor_carpet", "lounge", [[38, 18]]],
      ["g3", "\u30B2\u30B9\u30C8\u30EB\u30FC\u30E03", 30, 22, 38, 29, "floor_carpet", "guestroom", [[30, 25]]],
      ["balc", "\u30D0\u30EB\u30B3\u30CB\u30FC\u30FB\u30C6\u30E9\u30B9", 38, 22, 47, 29, "floor_tile", "balc", [[38, 25]]]
    ],
    "2": [
      ["gal", "3\u968E\u30AE\u30E3\u30E9\u30EA\u30FC(\u5439\u304D\u629C\u3051)", 18, 0, 30, 29, "floor_marble", "gal", []],
      ["suite", "\u30B2\u30B9\u30C8\u30B9\u30A4\u30FC\u30C8", 0, 0, 13, 10, "floor_carpet", "suite", [[13, 5]]],
      ["sbath", "\u30B9\u30A4\u30FC\u30C8\u306E\u6D74\u5BA4", 13, 0, 18, 10, "bath", "sbath", [[18, 3]]],
      ["lib", "\u56F3\u66F8\u5BA4", 0, 10, 18, 19, "floor_wood", "lib", [[18, 14]]],
      ["music", "\u97F3\u697D\u5BA4", 0, 19, 10, 29, "floor_wood", "music", [[10, 24]]],
      ["art", "\u7F8E\u8853\u54C1\u5C55\u793A\u5BA4", 10, 19, 18, 29, "floor_marble", "art", [[18, 24]]],
      ["theater", "\u5927\u578B\u30DB\u30FC\u30E0\u30B7\u30A2\u30BF\u30FC", 30, 0, 47, 10, "floor_carpet", "theater", [[30, 5]]],
      ["game", "\u30B2\u30FC\u30E0\u30EB\u30FC\u30E0", 30, 10, 47, 14, "floor_carpet", "game", [[30, 12]]],
      ["evl", "\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u30DB\u30FC\u30EB", 30, 14, 38, 22, "floor_marble", "evl", [[30, 18]]],
      ["gym", "\u30D5\u30A3\u30C3\u30C8\u30CD\u30B9\u30EB\u30FC\u30E0", 38, 14, 47, 22, "floor_tile", "gym", [[38, 18]]],
      ["pool", "\u5C4B\u5185\u30D7\u30FC\u30EB", 30, 22, 40, 29, "floor_tile", "ipool", [[30, 25]]],
      ["store", "\u66F4\u8863\u5BA4\u30FB\u5927\u578B\u53CE\u7D0D", 40, 22, 47, 29, "floor_wood", "store", [[40, 25]]]
    ],
    "-1": [
      ["hall", "\u5730\u4E0B\u30DB\u30FC\u30EB", 18, 0, 30, 29, "floor_tile", "bhall", []],
      ["wine", "\u30EF\u30A4\u30F3\u30BB\u30E9\u30FC", 0, 0, 12, 10, "floor_tile", "wine", [[12, 5]]],
      ["taste", "\u30C6\u30A4\u30B9\u30C6\u30A3\u30F3\u30B0\u30EB\u30FC\u30E0", 12, 0, 18, 10, "floor_wood", "taste", [[18, 5]]],
      ["larder", "\u98DF\u54C1\u8CAF\u8535\u5EAB", 0, 10, 10, 18, "floor_tile", "larder", [[10, 14]]],
      ["vault", "\u53CE\u8535\u5BA4(\u7F8E\u8853\u54C1\u30FB\u91D1\u5EAB)", 10, 10, 18, 18, "floor_tile", "vaultroom", [[18, 14]]],
      ["mech", "\u6A5F\u68B0\u5BA4", 0, 18, 10, 29, "floor_tile", "mech", [[10, 24]]],
      ["fac", "\u8A2D\u5099\u7BA1\u7406\u5BA4", 10, 18, 18, 29, "floor_tile", "fac", [[18, 24]]],
      ["garA", "\u5730\u4E0B\u30AC\u30EC\u30FC\u30B8A", 30, 0, 47, 14, "floor_tile", "garage", [[30, 7]]],
      ["evl", "\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u30DB\u30FC\u30EB", 30, 14, 38, 22, "floor_marble", "evl", [[30, 18]]],
      ["car", "\u6D17\u8ECA\u30FB\u6574\u5099\u5BA4", 38, 14, 47, 22, "floor_tile", "carwash", [[38, 18]]],
      ["garB", "\u5730\u4E0B\u30AC\u30EC\u30FC\u30B8B", 30, 22, 47, 29, "floor_tile", "garage2", [[30, 25]]]
    ]
  };
  var CARS = [
    // 地下ガレージの車(親の所有物)。type / colIdx / 名称
    { ty: "sports", c: 1, n: "\u30B9\u30DD\u30FC\u30C4\u30AB\u30FC(\u7236)" },
    { ty: "sedan", c: 5, n: "\u9AD8\u7D1A\u30BB\u30C0\u30F3(\u7236)" },
    { ty: "suv", c: 0, n: "\u9AD8\u7D1ASUV(\u5BB6\u65CF)" },
    { ty: "sedan", c: 2, n: "\u904B\u8EE2\u624B\u4ED8\u304D\u9001\u8FCE\u8ECA(\u9ED2\u5857\u308A)" },
    { ty: "sports", c: 3, n: "\u30B9\u30FC\u30D1\u30FC\u30AB\u30FC(\u8DA3\u5473\u8ECA)" },
    { ty: "sedan", c: 4, n: "\u9AD8\u7D1A\u30EA\u30E0\u30B8\u30F3" },
    { ty: "sedan", c: 6, n: "\u30AF\u30E9\u30B7\u30C3\u30AF\u30AB\u30FC(\u8DA3\u5473\u8ECA)" },
    { ty: "suv", c: 7, n: "\u5BB6\u65CF\u9001\u8FCE\u8ECA" },
    { ty: "sports", c: 8, n: "\u30AA\u30FC\u30D7\u30F3\u30AB\u30FC(\u6BCD)" },
    { ty: "sedan", c: 9, n: "\u4E88\u5099\u8ECA" }
  ];
  function buildMansion(b, floor, g) {
    const { W: W2, H: H4, lo, hi: hi2 } = MANSION;
    const lv = Math.max(lo, Math.min(hi2, floor));
    const tiles = new Array(W2 * H4).fill("floor_wood");
    for (let x = 0; x < W2; x++) tiles[x] = "wall";
    const objs = [], occ = /* @__PURE__ */ new Set(), staffSpots = [], seatSpots = [], rooms = [];
    const guard = /* @__PURE__ */ new Set();
    const add = (t, x, y, act, label2, solid = true, extra = {}) => {
      if (x < 0 || y < 1 || x >= W2 || y >= H4 - 1) return false;
      const k = x + y * W2;
      if (occ.has(k)) return false;
      const w = extra.w || 1, h = extra.h || 1;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
        if (xx >= W2 || yy >= H4 - 1) return false;
        if (occ.has(xx + yy * W2)) return false;
        if (solid && t !== "pwall" && guard.has(xx + "," + yy)) return false;
      }
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) occ.add(xx + yy * W2);
      objs.push({ t, x, y, act, label: label2, solid, ...extra });
      return true;
    };
    const deco = (t, x, y, label2, extra = {}) => {
      objs.push({ t, x, y, act: null, label: label2, solid: false, ...extra });
    };
    const plan = PLAN3[String(lv)];
    const gaps = /* @__PURE__ */ new Set();
    const R5 = {};
    for (const [id, nm, x0, y0, x1, y1, fl, fn, doors] of plan) {
      R5[id] = { id, nm, x0, y0, x1, y1, fl, fn, ix0: x0 + 1, iy0: y0 + 1, ix1: x1 - 1, iy1: y1 - 1 };
      for (const [dx, dy] of doors) gaps.add(dx + "," + dy);
    }
    for (const r of Object.values(R5)) for (let y = Math.max(1, r.y0); y <= Math.min(H4 - 2, r.y1); y++) for (let x = r.x0; x <= r.x1; x++) tiles[x + y * W2] = r.fl;
    const wallAt = (x, y) => {
      if (gaps.has(x + "," + y) || y < 1 || y > H4 - 2) return;
      add("pwall", x, y, null, "\u58C1", true);
    };
    for (const r of Object.values(R5)) {
      for (let x = r.x0; x <= r.x1; x++) {
        wallAt(x, r.y0);
        wallAt(x, r.y1);
      }
      for (let y = r.y0; y <= r.y1; y++) {
        wallAt(r.x0, y);
        wallAt(r.x1, y);
      }
    }
    for (const k of gaps) {
      const [x, y] = k.split(",").map(Number);
      if (y >= 1 && y <= H4 - 2) deco("doormat", x, y, "\u6249");
    }
    for (const k of gaps) {
      const [x, y] = k.split(",").map(Number);
      for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) guard.add(x + dx + "," + (y + dy));
    }
    for (let x = 1; x < W2 - 1; x += 3) objs.push({ t: "window", x, y: 0, solid: true, deco: true });
    const stairsDef = [];
    const lifts = [];
    const door = { x: 24, y: H4 - 1 };
    if (lv === 0) {
      tiles[door.x + door.y * W2] = "exit";
      occ.add(door.x + (H4 - 2) * W2);
      occ.add(door.x + (H4 - 3) * W2);
      occ.add(door.x - 1 + (H4 - 2) * W2);
      occ.add(door.x + 1 + (H4 - 2) * W2);
    }
    const stair = (t, x, y, to, label2) => {
      add(t, x, y, "stairs", label2, false, { to, via: "main" });
      stairsDef.push({ x, y, to, via: "main" });
    };
    if (lv === 0) {
      stair("stairs_up", 24, 2, 1, "2\u968E\u3078(\u5927\u968E\u6BB5)");
      stair("stairs_down", 20, 2, -1, "\u5730\u4E0B1\u968E\u3078(\u30EF\u30A4\u30F3\u30BB\u30E9\u30FC\u30FB\u30AC\u30EC\u30FC\u30B8)");
    } else if (lv === 1) {
      stair("stairs_down", 24, 2, 0, "1\u968E\u3078(\u5927\u968E\u6BB5)");
      stair("stairs_up", 22, 2, 2, "3\u968E\u3078(\u968E\u6BB5)");
    } else if (lv === 2) {
      stair("stairs_down", 22, 2, 1, "2\u968E\u3078(\u968E\u6BB5)");
    } else {
      stair("stairs_up", 20, 2, 0, "1\u968E\u3078(\u968E\u6BB5)");
    }
    for (let i = 0; i < 2; i++) {
      const x = EV_X[i];
      add("elev", x, EV_Y, "lift", `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC${i + 1}\u53F7\u6A5F`, true, { w: 2, h: 1, shaft: i, lo, hi: hi2 });
      lifts.push({ shaft: i, x, y: EV_Y });
    }
    for (const st3 of stairsDef) for (let dy = 1; dy <= 2; dy++) for (const dx of [-1, 0, 1]) guard.add(st3.x + dx + "," + (st3.y + dy));
    for (const l of lifts) for (const dx of [0, 1, 2, -1]) for (const dy of [1, 2]) guard.add(l.x + dx + "," + (l.y + dy));
    const line2 = (t, x, y, n2, dx, dy, act, label2, extra = {}) => {
      for (let k = 0; k < n2; k++) add(t, x + dx * k, y + dy * k, act, label2, true, extra);
    };
    const cx = (r) => r.ix0 + r.ix1 >> 1, cy = (r) => r.iy0 + r.iy1 >> 1;
    const rug = (x, y, w, h, col, edge) => deco("rug", x, y, "\u7D68\u6BEF", { w, h, col, edge });
    const paint2 = (x, y, w = 1) => deco("painting", x, y, "\u7D75\u753B", { w });
    const staff = (x, y, role, extra = {}) => staffSpots.push({ x, y, role, ...extra });
    const bedKing = (x, y, label2, act = "sleep") => {
      add("bed", x, y, act, label2, true);
      add("bed", x + 1, y, act, label2, true);
    };
    const ROOM = {
      hall: (r) => {
        deco("chandelier", 22, 8, "\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2(\u5439\u304D\u629C\u3051)", { w: 4, h: 4 });
        deco("chandelier", 22, 17, "\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2", { w: 4, h: 4 });
        rug(21, 4, 6, 24, "#7a1f2e", "#d4b25a");
        deco("gstair", 22, 1, "\u5927\u968E\u6BB5", { w: 5, h: 3 });
        for (const x of [19, 28]) {
          add("statue", x, 4, null, "\u5927\u7406\u77F3\u306E\u5F6B\u523B", true);
          add("vase", x, 9, null, "\u5927\u304D\u306A\u82B1\u74F6", true);
          add("statue", x, 15, null, "\u5973\u795E\u50CF", true);
          add("vase", x, 21, null, "\u82B1\u74F6", true);
          add("plant", x, 26, null, "\u89B3\u8449\u690D\u7269", true);
        }
        add("console", 19, 12, null, "\u7384\u95A2\u306E\u98FE\u308A\u68DA", true, { w: 2 });
        add("clock", 28, 12, null, "\u5927\u6642\u8A08", true);
        add("mirror", 19, 18, null, "\u59FF\u898B", true);
        add("console", 27, 18, null, "\u98FE\u308A\u68DA", true, { w: 2 });
        for (let k = 0; k < 6; k++) paint2(19 + k % 2 * 9, 1 + k * 0 + (k >> 1) * 0, 1);
        add("sofa", 20, 24, "rest", "\u7384\u95A2\u30DB\u30FC\u30EB\u306E\u30BD\u30D5\u30A1(\u5F85\u5408)", false);
        add("sofa", 27, 24, "rest", "\u7384\u95A2\u30DB\u30FC\u30EB\u306E\u30BD\u30D5\u30A1", false);
        add("lamp", 19, 24, null, "\u5927\u578B\u30B9\u30BF\u30F3\u30C9\u7167\u660E", true);
        add("lamp", 29, 24, null, "\u5927\u578B\u30B9\u30BF\u30F3\u30C9\u7167\u660E", true);
        add("umbrella", 22, 27, null, "\u5098\u7ACB\u3066", false);
        add("coatrack", 26, 27, null, "\u30B3\u30FC\u30C8\u30CF\u30F3\u30AC\u30FC", true);
        staff(24, 24, "butler", { act: "greet" });
        staff(21, 20, "maid");
        staff(27, 14, "guard");
        seatSpots.push({ x: 20, y: 24 }, { x: 27, y: 24 });
      },
      salon: (r) => {
        rug(3, 3, 4, 4, "#2f4a6e");
        add("sofa", 2, 2, "rest", "\u5FDC\u63A5\u306E\u30BD\u30D5\u30A1", false);
        add("sofa", 3, 2, "rest", "\u5FDC\u63A5\u306E\u30BD\u30D5\u30A1", false);
        add("sofa", 4, 2, "rest", "\u5FDC\u63A5\u306E\u30BD\u30D5\u30A1", false);
        add("table", 4, 4, null, "\u5FDC\u63A5\u30C6\u30FC\u30D6\u30EB");
        add("table", 5, 4, null, "\u5FDC\u63A5\u30C6\u30FC\u30D6\u30EB");
        add("chair", 3, 6, null, "\u6765\u5BA2\u7528\u306E\u6905\u5B50", false);
        add("chair", 6, 6, null, "\u6765\u5BA2\u7528\u306E\u6905\u5B50", false);
        add("piano", 1, 6, null, "\u30B0\u30E9\u30F3\u30C9\u30D4\u30A2\u30CE", true, { w: 1, h: 2 });
        add("showcase", 7, 1, null, "\u98FE\u308A\u68DA(\u4E5D\u8C37\u98A8\u306E\u58FA)", true);
        add("showcase", 8, 3, null, "\u98FE\u308A\u68DA", true);
        add("clock", 1, 1, null, "\u5927\u6642\u8A08", true);
        add("plant", 8, 7, null, "\u89B3\u8449\u690D\u7269", true);
        add("vase", 1, 4, null, "\u82B1\u74F6", true);
        paint2(3, 1);
        paint2(6, 1);
        deco("chandelier", 3, 3, "\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2", { w: 3, h: 3 });
        staff(5, 6, "butler", { act: "guest" });
      },
      salon2: (r) => {
        rug(11, 2, 4, 4, "#5a2f2f");
        add("sofa", 11, 2, "rest", "\u5FDC\u63A5\u306E\u30BD\u30D5\u30A1", false);
        add("sofa", 12, 2, "rest", "\u30BD\u30D5\u30A1", false);
        add("table", 12, 4, null, "\u5FDC\u63A5\u30C6\u30FC\u30D6\u30EB");
        add("chair", 11, 4, null, "\u8098\u639B\u3051\u6905\u5B50", false);
        add("chair", 14, 4, null, "\u8098\u639B\u3051\u6905\u5B50", false);
        add("bookcase", 16, 2, null, "\u6D0B\u66F8\u306E\u66F8\u68DA", true);
        add("bookcase", 16, 3, null, "\u6D0B\u66F8\u306E\u66F8\u68DA", true);
        add("bar", 10, 7, null, "\u30C9\u30EA\u30F3\u30AF\u30D0\u30FC", true, { w: 3 });
        add("tv", 15, 7, null, "\u5927\u578B\u30C6\u30EC\u30D3", true);
        add("plant", 10, 1, null, "\u89B3\u8449\u690D\u7269", true);
        paint2(13, 1);
        paint2(15, 1);
      },
      living: (r) => {
        rug(5, 12, 9, 5, "#4a3a6e");
        for (let k = 0; k < 6; k++) add("sofa", 4 + k, 11, "rest", "\u5927\u578B\u30BD\u30D5\u30A1", false);
        for (let k = 0; k < 3; k++) {
          add("sofa", 4, 12 + k, "rest", "\u5927\u578B\u30BD\u30D5\u30A1", false);
          add("sofa", 13, 12 + k, "rest", "\u5927\u578B\u30BD\u30D5\u30A1", false);
        }
        add("table", 7, 14, null, "\u5927\u7406\u77F3\u306E\u30ED\u30FC\u30C6\u30FC\u30D6\u30EB");
        add("table", 8, 14, null, "\u5927\u7406\u77F3\u306E\u30ED\u30FC\u30C6\u30FC\u30D6\u30EB");
        add("table", 9, 14, null, "\u5927\u7406\u77F3\u306E\u30ED\u30FC\u30C6\u30FC\u30D6\u30EB");
        add("tv", 7, 17, "tv", "\u8D85\u5927\u578B\u30C6\u30EC\u30D3(\u5BB6\u65CF\u306E\u30EA\u30D3\u30F3\u30B0)", true);
        add("tv", 8, 17, "tv", "\u8D85\u5927\u578B\u30C6\u30EC\u30D3", true);
        add("tv", 9, 17, "tv", "\u8D85\u5927\u578B\u30C6\u30EC\u30D3", true);
        add("bookcase", 1, 10, null, "\u98FE\u308A\u68DA", true);
        add("showcase", 1, 12, null, "\u7F8E\u8853\u54C1\u306E\u98FE\u308A\u68DA", true);
        add("clock", 17, 11, null, "\u67F1\u6642\u8A08", true);
        add("plant", 1, 18, null, "\u89B3\u8449\u690D\u7269", true);
        add("plant", 17, 18, null, "\u89B3\u8449\u690D\u7269", true);
        add("lamp", 3, 11, null, "\u30B9\u30BF\u30F3\u30C9\u7167\u660E", true);
        add("lamp", 15, 11, null, "\u30B9\u30BF\u30F3\u30C9\u7167\u660E", true);
        add("piano", 15, 16, null, "\u30D4\u30A2\u30CE", true, { w: 1, h: 2 });
        add("curtain", 2, 10, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 3 });
        add("curtain", 8, 10, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 3 });
        paint2(6, 10, 2);
        paint2(11, 10, 2);
        deco("chandelier", 8, 13, "\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2", { w: 4, h: 3 });
        seatSpots.push({ x: 4, y: 11 }, { x: 5, y: 11 }, { x: 13, y: 13 });
        staff(10, 17, "maid");
      },
      dining: (r) => {
        rug(3, 21, 12, 6, "#6e2f2f");
        for (let k = 0; k < 8; k++) {
          add("table", 4 + k, 23, null, "\u9577\u3044\u98DF\u5353(\u6669\u9910\u7528)");
          add("table", 4 + k, 24, null, "\u9577\u3044\u98DF\u5353");
          if (k % 1 === 0) {
            add("chair", 4 + k, 22, "meal", "\u98DF\u5353\u306E\u6905\u5B50", false);
            add("chair", 4 + k, 25, "meal", "\u98DF\u5353\u306E\u6905\u5B50", false);
            seatSpots.push({ x: 4 + k, y: 22 }, { x: 4 + k, y: 25 });
          }
        }
        add("chair", 3, 23, "meal", "\u4E0A\u5EA7\u306E\u6905\u5B50", false);
        add("chair", 12, 23, "meal", "\u4E0A\u5EA7\u306E\u6905\u5B50", false);
        seatSpots.push({ x: 3, y: 23 }, { x: 12, y: 23 });
        add("showcase", 1, 20, null, "\u98DF\u5668\u68DA(\u9AD8\u7D1A\u98DF\u5668)", true);
        add("showcase", 2, 20, null, "\u98DF\u5668\u68DA", true);
        add("showcase", 15, 20, null, "\u98DF\u5668\u68DA(\u9280\u98DF\u5668)", true);
        add("console", 6, 20, null, "\u914D\u81B3\u53F0", true, { w: 3 });
        add("bar", 11, 20, null, "\u30EF\u30A4\u30F3\u306E\u914D\u81B3\u53F0", true, { w: 3 });
        add("winerack", 1, 27, null, "\u30EF\u30A4\u30F3\u68DA", true, { w: 2 });
        add("clock", 16, 20, null, "\u67F1\u6642\u8A08", true);
        add("plant", 16, 27, null, "\u89B3\u8449\u690D\u7269", true);
        paint2(4, 20);
        paint2(9, 20);
        deco("chandelier", 5, 22, "\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2", { w: 6, h: 4 });
        staff(9, 27, "cook", { act: "serve" });
        staff(14, 20, "maid");
      },
      kitchen: (r) => {
        line2("kitchen", 31, 1, 4, 1, 0, "kitchen", "\u4E3B\u53A8\u623F\u306E\u8ABF\u7406\u53F0", { w: 2 });
        add("stove", 32, 7, null, "\u30AC\u30B9\u30EC\u30F3\u30B8(\u696D\u52D9\u7528)", true, { w: 2 });
        add("fridge", 38, 1, "fridge", "\u5927\u578B\u51B7\u8535\u5EAB", true);
        add("fridge", 38, 2, "fridge", "\u5927\u578B\u51B7\u51CD\u5EAB", true);
        add("sink", 34, 7, "kitchen", "\u5927\u578B\u30B7\u30F3\u30AF", true);
        add("sink", 35, 7, "kitchen", "\u30B7\u30F3\u30AF", true);
        add("table", 33, 4, null, "\u4F5C\u696D\u53F0(\u4E2D\u592E\u30A2\u30A4\u30E9\u30F3\u30C9)");
        add("table", 34, 4, null, "\u4F5C\u696D\u53F0");
        add("table", 35, 4, null, "\u4F5C\u696D\u53F0");
        add("cabinet", 37, 7, null, "\u9AD8\u7D1A\u98DF\u5668\u68DA", true);
        add("shelf", 31, 7, null, "\u8ABF\u5473\u6599\u68DA", true);
        staff(34, 5, "cook", { act: "cook" });
        staff(33, 6, "cook");
      },
      kitchen2: (r) => {
        line2("kitchen", 40, 1, 3, 2, 0, "kitchen", "\u4F7F\u7528\u4EBA\u7528\u306E\u8ABF\u7406\u53F0", { w: 2 });
        add("stove", 45, 1, null, "\u30B3\u30F3\u30ED", true, { w: 1 });
        add("sink", 45, 2, "kitchen", "\u30B7\u30F3\u30AF", true);
        add("fridge", 46, 1, "fridge", "\u696D\u52D9\u7528\u51B7\u8535\u5EAB", true);
        add("table", 42, 3, null, "\u914D\u81B3\u306E\u53F0");
        add("table", 43, 3, null, "\u914D\u81B3\u306E\u53F0");
        staff(42, 4, "cook", { act: "prep" });
      },
      pantry: (r) => {
        add("shelf", 40, 6, null, "\u98DF\u6750\u68DA", true);
        add("shelf", 41, 6, null, "\u98DF\u6750\u68DA", true);
        add("shelf", 42, 6, null, "\u98DF\u6750\u68DA", true);
        add("winerack", 44, 6, null, "\u30EF\u30A4\u30F3\u7F6E\u304D", true, { w: 2 });
        add("fridge", 46, 7, "fridge", "\u98DF\u54C1\u5EAB\u306E\u51B7\u8535\u5EAB", true);
        add("table", 41, 8, null, "\u4ED5\u8FBC\u307F\u53F0");
        add("cart", 45, 8, null, "\u914D\u81B3\u30EF\u30B4\u30F3", true);
      },
      butler: (r) => {
        add("desk", 32, 10, "work", "\u57F7\u4E8B\u9577\u306E\u673A(\u5BB6\u306E\u4E88\u5B9A\u8868)", true);
        add("chair", 32, 11, null, "\u57F7\u4E8B\u306E\u6905\u5B50", false);
        add("bookcase", 31, 10, null, "\u5E33\u7C3F\u306E\u66F8\u68DA", true);
        add("bookcase", 36, 10, null, "\u6765\u5BA2\u540D\u7C3F\u30FB\u9375\u306E\u68DA", true);
        add("keyrack", 34, 10, null, "\u9375\u7F6E\u304D\u5834(\u90B8\u5185\u5168\u5BA4\u306E\u9375)", true);
        add("board", 35, 12, null, "\u4ECA\u65E5\u306E\u5BB6\u306E\u4E88\u5B9A", true);
        add("clock", 37, 10, null, "\u6642\u8A08", true);
        add("coatrack", 36, 13, null, "\u5236\u670D\u639B\u3051", true);
        staff(33, 12, "butler", { act: "plan" });
      },
      staff: (r) => {
        rug(40, 10, 4, 3, "#3a4a5a", "#8a8f98");
        add("table", 41, 11, null, "\u4F11\u61A9\u306E\u30C6\u30FC\u30D6\u30EB");
        add("chair", 41, 10, null, "\u6905\u5B50", false);
        add("chair", 42, 12, null, "\u6905\u5B50", false);
        add("bunk", 45, 10, "rest", "\u4F7F\u7528\u4EBA\u306E\u4E8C\u6BB5\u30D9\u30C3\u30C9", true);
        add("locker", 46, 11, null, "\u4F7F\u7528\u4EBA\u306E\u30ED\u30C3\u30AB\u30FC", true);
        add("locker", 46, 12, null, "\u30ED\u30C3\u30AB\u30FC", true);
        add("tv", 39, 13, null, "\u30C6\u30EC\u30D3", true);
        add("watersrv", 39, 10, null, "\u7D66\u6C34\u6A5F", true);
        staff(42, 11, "maid", { act: "rest" });
        staff(43, 12, "gardener", { act: "rest" });
      },
      evl: (r) => {
        rug(32, 17, 5, 4, "#7a1f2e");
        add("sofa", 31, 20, "rest", "\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u5F85\u3061\u306E\u30BD\u30D5\u30A1", false);
        add("plant", 36, 20, null, "\u89B3\u8449\u690D\u7269", true);
        add("mirror", 37, 16, null, "\u59FF\u898B", true);
        add("dirsign", 33, 21, null, "\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u6848\u5185", true, { signText: "B1 \u30AC\u30EC\u30FC\u30B8\u30FB\u30EF\u30A4\u30F3\u30BB\u30E9\u30FC|1F \u7384\u95A2\u30FB\u5FDC\u63A5\u30FB\u98DF\u5802|2F \u5C45\u5BA4|3F \u66F8\u658E\u30FB\u30B7\u30A2\u30BF\u30FC\u30FB\u30D7\u30FC\u30EB" });
        deco("chandelier", 32, 18, "\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2", { w: 3, h: 3 });
      },
      guestwait: (r) => {
        rug(40, 16, 4, 4, "#3f5a3f");
        add("sofa", 40, 15, "rest", "\u30BD\u30D5\u30A1", false);
        add("sofa", 41, 15, "rest", "\u30BD\u30D5\u30A1", false);
        add("table", 41, 17, null, "\u30C6\u30A3\u30FC\u30C6\u30FC\u30D6\u30EB");
        add("chair", 40, 17, null, "\u6905\u5B50", false);
        add("chair", 43, 17, null, "\u6905\u5B50", false);
        add("bookcase", 45, 15, null, "\u96D1\u8A8C\u68DA", true);
        add("plant", 45, 20, null, "\u89B3\u8449\u690D\u7269", true);
        add("tv", 44, 21, null, "\u30C6\u30EC\u30D3", true);
        paint2(42, 14);
      },
      cloak: (r) => {
        line2("coatrack", 31, 23, 6, 1, 0, null, "\u30AF\u30ED\u30FC\u30AF(\u30B3\u30FC\u30C8\u639B\u3051)", {});
        add("shoebox", 31, 27, null, "\u9774\u7BB1", true);
        add("shoebox", 32, 27, null, "\u9774\u7BB1", true);
        add("umbrella", 34, 27, null, "\u5098\u7ACB\u3066", false);
        add("desk", 36, 27, null, "\u9810\u304B\u308A\u53D7\u4ED8", true);
        staff(35, 26, "maid");
      },
      wc: (r) => {
        for (let k = 0; k < 3; k++) add("toilet", 40 + k * 2, 23, "toilet", "\u30C8\u30A4\u30EC(\u500B\u5BA4)", true, { w: 1, h: 1, sign: "" });
        for (let k = 0; k < 3; k++) add("basin", 40 + k * 2, 27, null, "\u6D17\u9762\u53F0", true);
        add("mirror", 41, 28, null, "\u5927\u304D\u306A\u93E1", true);
        add("plant", 45, 27, null, "\u751F\u82B1", true);
        add("toilet", 45, 23, "toilet", "\u30C8\u30A4\u30EC(\u5E83\u3044\u500B\u5BA4)", true, { w: 1, h: 1, sign: "" });
      },
      // ---- 2階 ----
      gal: (r) => {
        for (let y = 4; y <= 26; y++) for (const x of [22, 23, 24, 25, 26]) {
          if (y >= 6 && y <= 24 && x >= 22 && x <= 26) {
            if (y === 6 || y === 24 || x === 22 || x === 26) add("handrail", x, y, null, "\u5439\u304D\u629C\u3051\u306E\u624B\u3059\u308A", true);
          }
        }
        deco("chandelier", 22, 12, "\u5439\u304D\u629C\u3051\u306E\u5927\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2", { w: 5, h: 5 });
        rug(19, 3, 3, 24, "#7a1f2e", "#d4b25a");
        rug(27, 3, 3, 24, "#7a1f2e", "#d4b25a");
        for (const y of [8, 14, 20]) {
          add("statue", 19, y, null, "\u5F6B\u523B", true);
          add("vase", 29, y, null, "\u82B1\u74F6", true);
        }
        for (const y of [6, 12, 18, 24]) {
          paint2(19, y);
          paint2(29, y);
        }
        add("plant", 19, 26, null, "\u89B3\u8449\u690D\u7269", true);
        add("plant", 29, 26, null, "\u89B3\u8449\u690D\u7269", true);
        staff(20, 14, "maid", { act: "clean" });
      },
      hbed: (r) => {
        rug(3, 4, 6, 4, "#2f4a6e");
        bedKing(5, 1, "\u3042\u306A\u305F\u306E\u5927\u578B\u30D9\u30C3\u30C9");
        add("table", 4, 1, null, "\u30D9\u30C3\u30C9\u30B5\u30A4\u30C9\u30C6\u30FC\u30D6\u30EB");
        add("lamp", 4, 2, null, "\u9593\u63A5\u7167\u660E", true);
        add("table", 7, 1, null, "\u30D9\u30C3\u30C9\u30B5\u30A4\u30C9\u30C6\u30FC\u30D6\u30EB");
        add("lamp", 7, 2, null, "\u9593\u63A5\u7167\u660E", true);
        add("sofa", 3, 6, "rest", "\u5BDD\u5BA4\u306E\u30BD\u30D5\u30A1", false);
        add("sofa", 4, 6, "rest", "\u30BD\u30D5\u30A1", false);
        add("tv", 8, 7, "tv", "\u5BDD\u5BA4\u306E\u5927\u578B\u30C6\u30EC\u30D3", true);
        add("table", 3, 7, null, "\u30ED\u30FC\u30C6\u30FC\u30D6\u30EB");
        add("mirror", 1, 3, null, "\u59FF\u898B", true);
        add("curtain", 2, 0, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 3 });
        add("curtain", 7, 0, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 3 });
        add("clock", 10, 3, null, "\u7F6E\u304D\u6642\u8A08", true);
        add("plant", 1, 8, null, "\u89B3\u8449\u690D\u7269", true);
        paint2(5, 0, 2);
        deco("chandelier", 5, 4, "\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2", { w: 3, h: 3 });
      },
      study: (r) => {
        add("desk", 14, 2, "study", "\u3042\u306A\u305F\u306E\u66F8\u658E\u306E\u673A", true);
        add("desk", 15, 2, "study", "\u66F8\u658E\u306E\u673A", true);
        add("chair", 14, 3, null, "\u9769\u5F35\u308A\u306E\u6905\u5B50", false);
        add("bookcase", 13, 1, null, "\u66F8\u68DA", true);
        add("bookcase", 14, 1, null, "\u66F8\u68DA", true);
        add("bookcase", 15, 1, null, "\u66F8\u68DA", true);
        add("bookcase", 16, 1, null, "\u66F8\u68DA", true);
        add("lamp", 17, 2, null, "\u30C7\u30B9\u30AF\u30B9\u30BF\u30F3\u30C9", true);
        add("sofa", 13, 7, "rest", "\u66F8\u658E\u306E\u5FDC\u63A5\u30BD\u30D5\u30A1", false);
        add("table", 14, 7, null, "\u30ED\u30FC\u30C6\u30FC\u30D6\u30EB");
        add("plant", 17, 8, null, "\u89B3\u8449\u690D\u7269", true);
        add("clock", 17, 5, null, "\u6642\u8A08", true);
      },
      hbath: (r) => {
        add("bath", 1, 1, "bath", "\u5927\u7406\u77F3\u306E\u5927\u578B\u30D0\u30B9\u30BF\u30D6", true, { tub: "marble" });
        add("bath", 2, 1, "bath", "\u5927\u578B\u30D0\u30B9\u30BF\u30D6", true, { tub: "marble" });
        add("wash", 5, 1, "wash", "\u30B7\u30E3\u30EF\u30FC", true);
        add("wash", 6, 1, "wash", "\u30B7\u30E3\u30EF\u30FC", true);
        add("basin", 3, 5, "wash", "\u6D17\u9762\u53F0(2\u9023)", true);
        add("basin", 4, 5, "wash", "\u6D17\u9762\u53F0", true);
        add("mirror", 3, 6, null, "\u5927\u304D\u306A\u93E1", true);
        add("mirror", 4, 6, null, "\u5927\u304D\u306A\u93E1", true);
        add("toilet", 7, 5, "toilet", "\u30C8\u30A4\u30EC", true, { w: 1, h: 1, sign: "" });
        add("plant", 7, 6, null, "\u89B3\u8449\u690D\u7269", true);
        add("cabinet", 1, 6, null, "\u30BF\u30AA\u30EB\u68DA", true);
      },
      wic: (r) => {
        for (let k = 0; k < 7; k++) add("wardrobe", 10 + k, 11, null, "\u3042\u306A\u305F\u306E\u8863\u88C5", true, { w: 1 });
        for (let k = 0; k < 5; k++) add("wardrobe", 10 + k, 16, null, "\u8863\u88C5", true, { w: 1 });
        add("showcase", 17, 11, null, "\u6642\u8A08\u30FB\u5C0F\u7269\u306E\u98FE\u308A\u68DA", true);
        add("showcase", 17, 14, null, "\u9774\u306E\u98FE\u308A\u68DA", true);
        add("mirror", 14, 13, null, "\u5168\u8EAB\u93E1", true);
        add("table", 13, 14, null, "\u4E2D\u592E\u306E\u53CE\u7D0D\u30C6\u30FC\u30D6\u30EB");
        add("table", 14, 14, null, "\u53CE\u7D0D\u30C6\u30FC\u30D6\u30EB");
        rug(11, 12, 5, 3, "#6e5a3a");
      },
      mbed: (r) => {
        rug(2, 20, 6, 5, "#6e2f4a");
        bedKing(4, 18, "\u6BCD\u306E\u5927\u578B\u30D9\u30C3\u30C9", null);
        add("table", 3, 18, null, "\u30D9\u30C3\u30C9\u30B5\u30A4\u30C9");
        add("lamp", 3, 19, null, "\u9593\u63A5\u7167\u660E", true);
        add("table", 6, 18, null, "\u30D9\u30C3\u30C9\u30B5\u30A4\u30C9");
        add("wardrobe", 1, 26, null, "\u6BCD\u306E\u8863\u88C5\u68DA", true, { w: 1 });
        add("wardrobe", 2, 26, null, "\u8863\u88C5\u68DA", true, { w: 1 });
        add("wardrobe", 3, 26, null, "\u8863\u88C5\u68DA", true, { w: 1 });
        add("mirror", 1, 22, null, "\u5316\u7CA7\u53F0\u306E\u93E1", true);
        add("table", 1, 23, null, "\u5316\u7CA7\u53F0");
        add("sofa", 5, 27, "rest", "\u30BD\u30D5\u30A1", false);
        add("tv", 8, 27, null, "\u30C6\u30EC\u30D3", true);
        add("plant", 8, 18, null, "\u89B3\u8449\u690D\u7269", true);
        add("curtain", 3, 17, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 3 });
        staff(6, 22, "mother", { act: "rest" });
      },
      hobby: (r) => {
        add("piano", 11, 18, null, "\u6BCD\u306E\u30B0\u30E9\u30F3\u30C9\u30D4\u30A2\u30CE", true, { w: 1, h: 2 });
        add("table", 15, 20, null, "\u624B\u82B8\u53F0");
        add("table", 16, 20, null, "\u624B\u82B8\u53F0");
        add("chair", 15, 21, null, "\u6905\u5B50", false);
        add("bookcase", 13, 18, null, "\u753B\u96C6\u306E\u68DA", true);
        add("bookcase", 14, 18, null, "\u624B\u82B8\u306E\u68DA", true);
        add("showcase", 17, 18, null, "\u4F5C\u54C1\u306E\u98FE\u308A\u68DA", true);
        add("plant", 11, 22, null, "\u89B3\u8449\u690D\u7269", true);
        add("plant", 17, 22, null, "\u89B3\u8449\u690D\u7269", true);
        add("sofa", 12, 21, "rest", "\u30BD\u30D5\u30A1", false);
        paint2(15, 18);
        staff(14, 20, "mother", { act: "hobby" });
      },
      famroom: (r) => {
        rug(11, 25, 6, 3, "#3a4a5a");
        add("sofa", 11, 24, "rest", "\u30BD\u30D5\u30A1", false);
        add("sofa", 12, 24, "rest", "\u30BD\u30D5\u30A1", false);
        add("sofa", 13, 24, "rest", "\u30BD\u30D5\u30A1", false);
        add("table", 12, 26, null, "\u30ED\u30FC\u30C6\u30FC\u30D6\u30EB");
        add("tv", 17, 26, "tv", "\u5927\u578B\u30C6\u30EC\u30D3", true);
        add("bookcase", 15, 24, null, "\u672C\u68DA", true);
        add("plant", 11, 28, null, "\u89B3\u8449\u690D\u7269", true);
        add("clock", 16, 28, null, "\u6642\u8A08", true);
      },
      fbed: (r) => {
        rug(33, 3, 6, 4, "#2f3a5a");
        bedKing(34, 1, "\u7236\u306E\u5927\u578B\u30D9\u30C3\u30C9", null);
        add("table", 33, 1, null, "\u30D9\u30C3\u30C9\u30B5\u30A4\u30C9");
        add("lamp", 33, 2, null, "\u9593\u63A5\u7167\u660E", true);
        add("table", 36, 1, null, "\u30D9\u30C3\u30C9\u30B5\u30A4\u30C9");
        add("wardrobe", 38, 1, null, "\u7236\u306E\u8863\u88C5\u68DA", true, { w: 1 });
        add("wardrobe", 38, 2, null, "\u8863\u88C5\u68DA", true, { w: 1 });
        add("wardrobe", 38, 3, null, "\u8863\u88C5\u68DA", true, { w: 1 });
        add("sofa", 33, 6, "rest", "\u30BD\u30D5\u30A1", false);
        add("tv", 36, 7, null, "\u30C6\u30EC\u30D3", true);
        add("mirror", 40, 4, null, "\u59FF\u898B", true);
        add("plant", 40, 7, null, "\u89B3\u8449\u690D\u7269", true);
        paint2(34, 0, 2);
        staff(36, 5, "father", { act: "rest" });
      },
      study2: (r) => {
        add("desk", 43, 2, "work", "\u7236\u306E\u66F8\u658E\u306E\u673A(\u91CD\u5F79\u7528)", true);
        add("desk", 44, 2, "work", "\u91CD\u5F79\u7528\u306E\u673A", true);
        add("chair", 43, 3, null, "\u9769\u5F35\u308A\u306E\u6905\u5B50", false);
        add("bookcase", 42, 1, null, "\u66F8\u68DA", true);
        add("bookcase", 43, 1, null, "\u66F8\u68DA", true);
        add("bookcase", 44, 1, null, "\u66F8\u68DA", true);
        add("bookcase", 45, 1, null, "\u66F8\u68DA", true);
        add("lamp", 45, 2, null, "\u30B9\u30BF\u30F3\u30C9", true);
        add("sofa", 42, 6, "rest", "\u5FDC\u63A5\u30BD\u30D5\u30A1", false);
        add("table", 43, 6, null, "\u30ED\u30FC\u30C6\u30FC\u30D6\u30EB");
        add("clock", 45, 7, null, "\u6642\u8A08", true);
        add("vault", 45, 4, null, "\u66F8\u658E\u306E\u91D1\u5EAB", true);
        staff(43, 4, "father", { act: "work" });
      },
      guestroom: (r) => {
        const g0 = r.ix0;
        add("bed", g0 + 2, r.iy0, "rest", "\u30B2\u30B9\u30C8\u30D9\u30C3\u30C9", true);
        add("bed", g0 + 3, r.iy0, "rest", "\u30B2\u30B9\u30C8\u30D9\u30C3\u30C9", true);
        add("table", g0 + 1, r.iy0, null, "\u30D9\u30C3\u30C9\u30B5\u30A4\u30C9");
        add("lamp", g0 + 1, r.iy0 + 1, null, "\u7167\u660E", true);
        add("desk", r.ix1, r.iy0, null, "\u30E9\u30A4\u30C6\u30A3\u30F3\u30B0\u30C7\u30B9\u30AF", true);
        add("wardrobe", r.ix1, r.iy0 + 1, null, "\u30AF\u30ED\u30FC\u30BC\u30C3\u30C8", true, { w: 1 });
        add("sofa", g0, r.iy1, "rest", "\u30BD\u30D5\u30A1", false);
        add("tv", g0 + 3, r.iy1, null, "\u30C6\u30EC\u30D3", true);
        add("plant", r.ix1, r.iy1, null, "\u89B3\u8449\u690D\u7269", true);
        rug(g0 + 1, r.iy0 + 2, 4, 2, "#4a5a6e");
      },
      lounge: (r) => {
        rug(40, 16, 6, 4, "#4a3a6e");
        for (let k = 0; k < 4; k++) add("sofa", 40 + k, 15, "rest", "\u30E9\u30A6\u30F3\u30B8\u306E\u30BD\u30D5\u30A1", false);
        add("table", 41, 17, null, "\u30C6\u30FC\u30D6\u30EB");
        add("table", 42, 17, null, "\u30C6\u30FC\u30D6\u30EB");
        add("bar", 40, 21, null, "\u5BB6\u65CF\u7528\u30D0\u30FC\u30AB\u30A6\u30F3\u30BF\u30FC", true, { w: 4 });
        add("tv", 46, 17, "tv", "\u5927\u578B\u30C6\u30EC\u30D3", true);
        add("plant", 46, 15, null, "\u89B3\u8449\u690D\u7269", true);
        add("lamp", 39, 15, null, "\u30B9\u30BF\u30F3\u30C9", true);
        paint2(42, 14, 2);
        deco("chandelier", 41, 16, "\u30B7\u30E3\u30F3\u30C7\u30EA\u30A2", { w: 3, h: 3 });
      },
      balc: (r) => {
        for (let x = 39; x <= 46; x++) add("fence", x, 28, null, "\u624B\u3059\u308A", true);
        for (const [x, y] of [[40, 24], [44, 24]]) {
          add("table", x, y, null, "\u30C6\u30E9\u30B9\u30C6\u30FC\u30D6\u30EB");
          add("chair", x - 1, y, null, "\u30C6\u30E9\u30B9\u306E\u6905\u5B50", false);
          add("chair", x + 1, y, null, "\u30C6\u30E9\u30B9\u306E\u6905\u5B50", false);
        }
        add("plant", 39, 23, null, "\u9262\u690D\u3048", true);
        add("plant", 46, 23, null, "\u9262\u690D\u3048", true);
        add("plant", 39, 27, null, "\u9262\u690D\u3048", true);
        add("plant", 46, 27, null, "\u9262\u690D\u3048", true);
        add("tree", 42, 27, null, "\u690D\u683D", true);
      },
      // ---- 3階 ----
      suite: (r) => {
        rug(3, 3, 6, 4, "#2f5a4a");
        bedKing(5, 1, "\u30B2\u30B9\u30C8\u30B9\u30A4\u30FC\u30C8\u306E\u30D9\u30C3\u30C9", "rest");
        add("table", 4, 1, null, "\u30D9\u30C3\u30C9\u30B5\u30A4\u30C9");
        add("lamp", 4, 2, null, "\u7167\u660E", true);
        add("sofa", 3, 6, "rest", "\u30BD\u30D5\u30A1", false);
        add("sofa", 4, 6, "rest", "\u30BD\u30D5\u30A1", false);
        add("tv", 8, 7, null, "\u30C6\u30EC\u30D3", true);
        add("desk", 11, 1, null, "\u30C7\u30B9\u30AF", true);
        add("wardrobe", 11, 4, null, "\u30AF\u30ED\u30FC\u30BC\u30C3\u30C8", true, { w: 1 });
        add("plant", 1, 8, null, "\u89B3\u8449\u690D\u7269", true);
        paint2(5, 0, 2);
      },
      sbath: (r) => {
        add("bath", 14, 1, "bath", "\u5927\u578B\u30D0\u30B9\u30BF\u30D6", true, { tub: "marble" });
        add("wash", 16, 1, "wash", "\u30B7\u30E3\u30EF\u30FC", true);
        add("basin", 14, 8, "wash", "\u6D17\u9762\u53F0", true);
        add("mirror", 15, 8, null, "\u93E1", true);
        add("toilet", 16, 8, "toilet", "\u30C8\u30A4\u30EC", true, { w: 1, h: 1, sign: "" });
      },
      lib: (r) => {
        for (let k = 0; k < 16; k++) add("bookcase", 1 + k, 10 + 1, null, "\u8535\u66F8\u306E\u66F8\u68DA", true);
        for (let k = 0; k < 6; k++) {
          add("bookcase", 2 + k, 13, null, "\u66F8\u67B6", true);
          add("bookcase", 10 + k, 13, null, "\u66F8\u67B6", true);
        }
        add("table", 5, 16, null, "\u95B2\u89A7\u30C6\u30FC\u30D6\u30EB");
        add("table", 6, 16, null, "\u95B2\u89A7\u30C6\u30FC\u30D6\u30EB");
        add("chair", 5, 17, null, "\u6905\u5B50", false);
        add("chair", 6, 17, null, "\u6905\u5B50", false);
        add("sofa", 12, 17, "rest", "\u8AAD\u66F8\u306E\u30BD\u30D5\u30A1", false);
        add("lamp", 11, 17, null, "\u8AAD\u66F8\u706F", true);
        add("lamp", 14, 17, null, "\u8AAD\u66F8\u706F", true);
        add("clock", 17, 17, null, "\u6642\u8A08", true);
        add("desk", 1, 17, "study", "\u8ABF\u3079\u7269\u306E\u673A", true);
        add("chair", 1, 18, null, "\u6905\u5B50", false);
        rug(4, 15, 5, 3, "#3f2f5a");
      },
      music: (r) => {
        add("piano", 2, 21, null, "\u30B0\u30E9\u30F3\u30C9\u30D4\u30A2\u30CE", true, { w: 1, h: 2 });
        add("piano", 5, 21, null, "\u30A2\u30C3\u30D7\u30E9\u30A4\u30C8\u30D4\u30A2\u30CE", true, { w: 1, h: 2 });
        add("stool", 3, 23, null, "\u30D4\u30A2\u30CE\u6905\u5B50", false);
        for (let k = 0; k < 4; k++) add("chair", 2 + k * 2, 26, null, "\u6F14\u594F\u7528\u306E\u6905\u5B50", false);
        add("bookcase", 8, 20, null, "\u697D\u8B5C\u68DA", true);
        add("showcase", 8, 23, null, "\u30F4\u30A1\u30A4\u30AA\u30EA\u30F3\u30FB\u697D\u5668\u306E\u98FE\u308A\u68DA", true);
        add("lamp", 8, 27, null, "\u30B9\u30BF\u30F3\u30C9", true);
        rug(2, 24, 5, 3, "#5a2f4a");
      },
      art: (r) => {
        for (let k = 0; k < 7; k++) paint2(11 + k, 19, 1);
        for (let k = 0; k < 6; k++) paint2(11 + k, 28 - 0, 1);
        add("statue", 12, 22, null, "\u5F6B\u523B(\u5927\u7406\u77F3)", true);
        add("statue", 16, 22, null, "\u5F6B\u523B(\u30D6\u30ED\u30F3\u30BA)", true);
        add("showcase", 12, 26, null, "\u9676\u78C1\u5668\u306E\u5C55\u793A\u30B1\u30FC\u30B9", true);
        add("showcase", 14, 26, null, "\u5B9D\u98FE\u54C1\u306E\u5C55\u793A\u30B1\u30FC\u30B9", true);
        add("showcase", 16, 26, null, "\u9AA8\u8463\u306E\u5C55\u793A\u30B1\u30FC\u30B9", true);
        add("vase", 14, 22, null, "\u5927\u58FA", true);
        add("bench", 14, 24, null, "\u9451\u8CDE\u7528\u306E\u30D9\u30F3\u30C1", false);
      },
      theater: (r) => {
        add("screen", 33, 1, null, "\u5927\u578B\u30B9\u30AF\u30EA\u30FC\u30F3", true, { w: 10 });
        for (const y of [5, 7]) for (let k = 0; k < 9; k++) {
          if (k === 4) continue;
          add("sofa", 33 + k, y, "rest", "\u30B7\u30A2\u30BF\u30FC\u306E\u30EA\u30AF\u30E9\u30A4\u30CB\u30F3\u30B0\u30B7\u30FC\u30C8", false);
        }
        add("bar", 40, 9, null, "\u30C9\u30EA\u30F3\u30AF\u30AB\u30A6\u30F3\u30BF\u30FC", true, { w: 4 });
        add("mrack", 46, 8, null, "\u30DD\u30C3\u30D7\u30B3\u30FC\u30F3\u30FB\u6620\u753B\u30D1\u30F3\u30D5", true);
        rug(33, 4, 10, 5, "#3a1f2a");
        seatSpots.push({ x: 34, y: 5 }, { x: 36, y: 7 });
      },
      game: (r) => {
        add("billiard", 32, 11, null, "\u30D3\u30EA\u30E4\u30FC\u30C9\u53F0", true, { w: 3, h: 2 });
        add("arcade", 36, 11, "arcade", "\u30A2\u30FC\u30B1\u30FC\u30C9\u30B2\u30FC\u30E0\u6A5F", true);
        add("arcade", 37, 11, "arcade", "\u30B2\u30FC\u30E0\u6A5F", true);
        add("table", 41, 12, null, "\u30DC\u30FC\u30C9\u30B2\u30FC\u30E0\u306E\u5353");
        add("chair", 40, 12, null, "\u6905\u5B50", false);
        add("chair", 42, 12, null, "\u6905\u5B50", false);
        add("tv", 45, 11, "tv", "\u30B2\u30FC\u30E0\u7528\u306E\u5927\u578B\u30C6\u30EC\u30D3", true);
        add("sofa", 44, 13, "rest", "\u30B2\u30FC\u30E0\u306E\u30BD\u30D5\u30A1", false);
        add("sofa", 45, 13, "rest", "\u30BD\u30D5\u30A1", false);
      },
      gym: (r) => {
        for (let k = 0; k < 3; k++) add("treadmill", 39 + k * 2, 15, "exercise", "\u30E9\u30F3\u30CB\u30F3\u30B0\u30DE\u30B7\u30F3", true);
        for (let k = 0; k < 3; k++) add("weights", 39 + k * 2, 18, "exercise", "\u30A6\u30A7\u30A4\u30C8\u5668\u5177", true);
        add("mirror", 46, 16, null, "\u5927\u304D\u306A\u93E1", true);
        add("watersrv", 46, 20, null, "\u7D66\u6C34\u6A5F", true);
        add("plant", 39, 21, null, "\u89B3\u8449\u690D\u7269", true);
        add("mat", 42, 21, null, "\u30E8\u30AC\u30DE\u30C3\u30C8", false, { w: 2 });
      },
      ipool: (r) => {
        add("pool", 32, 24, null, "\u5C4B\u5185\u30D7\u30FC\u30EB(25m\u98A8\u30FB\u30D7\u30FC\u30EB\u5BA4)", true, { w: 6, h: 4 });
        for (let k = 0; k < 3; k++) add("bench", 31 + k * 3, 28, "rest", "\u30C7\u30C3\u30AD\u30C1\u30A7\u30A2", false);
        add("plant", 38, 23, null, "\u5357\u56FD\u306E\u690D\u683D", true);
        add("plant", 38, 27, null, "\u690D\u683D", true);
        add("showcase", 31, 23, null, "\u30BF\u30AA\u30EB\u68DA", true);
      },
      store: (r) => {
        for (let k = 0; k < 5; k++) add("locker", 41 + k, 23, null, "\u66F4\u8863\u30ED\u30C3\u30AB\u30FC", true);
        for (let k = 0; k < 3; k++) {
          add("shelf", 41 + k, 27, null, "\u5927\u578B\u53CE\u7D0D(\u5B63\u7BC0\u7528\u54C1)", true);
        }
        add("cabinet", 45, 27, null, "\u5927\u578B\u53CE\u7D0D", true);
        add("cabinet", 46, 27, null, "\u5927\u578B\u53CE\u7D0D", true);
        add("mirror", 44, 23, null, "\u93E1", true);
      },
      // ---- 地下 ----
      bhall: (r) => {
        rug(22, 4, 4, 22, "#3a3a44", "#8a8f98");
        for (const y of [6, 12, 18, 24]) {
          add("lamp", 19, y, null, "\u5730\u4E0B\u306E\u7167\u660E", true);
          add("lamp", 29, y, null, "\u7167\u660E", true);
        }
        add("plant", 29, 3, null, "\u690D\u683D", true);
        add("extinguisher", 19, 2, null, "\u6D88\u706B\u5668", true);
        add("board", 28, 2, null, "\u5730\u4E0B\u306E\u6848\u5185(\u30EF\u30A4\u30F3\u30BB\u30E9\u30FC\u30FB\u30AC\u30EC\u30FC\u30B8\u30FB\u6A5F\u68B0\u5BA4)", true);
        staff(24, 20, "driver", { act: "wait" });
      },
      wine: (r) => {
        for (let k = 0; k < 5; k++) {
          add("winerack", 1, 2 + k * 2, null, "\u30EF\u30A4\u30F3\u68DA(\u30DC\u30EB\u30C9\u30FC\u30FB\u30D6\u30EB\u30B4\u30FC\u30CB\u30E5)", true, { w: 2 });
        }
        for (let k = 0; k < 4; k++) add("winerack", 5 + k % 2 * 3, 2 + (k >> 1) * 4, null, "\u30EF\u30A4\u30F3\u68DA", true, { w: 2 });
        for (let k = 0; k < 4; k++) add("winerack", 4 + k * 2, 9 - 0, null, "\u30EF\u30A4\u30F3\u68DA", true, { w: 2 });
        add("table", 9, 4, null, "\u30EF\u30A4\u30F3\u6A3D\u306E\u53F0");
        add("table", 10, 4, null, "\u6A3D");
      },
      taste: (r) => {
        add("bar", 13, 1, null, "\u30C6\u30A4\u30B9\u30C6\u30A3\u30F3\u30B0\u30AB\u30A6\u30F3\u30BF\u30FC", true, { w: 4 });
        for (let k = 0; k < 4; k++) add("stool", 13 + k, 3, null, "\u30B9\u30C4\u30FC\u30EB", false);
        add("table", 14, 6, null, "\u4E38\u30C6\u30FC\u30D6\u30EB");
        add("chair", 13, 6, null, "\u6905\u5B50", false);
        add("chair", 15, 6, null, "\u6905\u5B50", false);
        add("winerack", 13, 9, null, "\u8A66\u98F2\u7528\u30EF\u30A4\u30F3\u68DA", true, { w: 4 });
        add("lamp", 17, 1, null, "\u7167\u660E", true);
        rug(13, 5, 4, 3, "#5a2f2f");
      },
      larder: (r) => {
        for (let k = 0; k < 4; k++) add("shelf", 1 + k * 2, 11, null, "\u98DF\u54C1\u8CAF\u8535\u68DA", true, { w: 1 });
        for (let k = 0; k < 4; k++) add("shelf", 2 + k * 2, 11, null, "\u8CAF\u8535\u68DA", true, { w: 1 });
        add("fridge", 1, 15, "fridge", "\u5927\u578B\u51B7\u8535\u5EAB", true);
        add("fridge", 2, 15, "fridge", "\u5927\u578B\u51B7\u51CD\u5EAB", true);
        add("fridge", 3, 15, "fridge", "\u51B7\u51CD\u5EAB", true);
        add("pallet", 6, 14, null, "\u7C73\u30FB\u7F36\u8A70\u306E\u4FDD\u7BA1", true);
        add("pallet", 8, 14, null, "\u98F2\u6599\u30B1\u30FC\u30B9", true);
        add("cart", 5, 16, null, "\u904B\u642C\u30AB\u30FC\u30C8", true);
      },
      vaultroom: (r) => {
        add("vault", 11, 11, null, "\u5927\u91D1\u5EAB", true);
        add("vault", 12, 11, null, "\u91D1\u5EAB", true);
        for (let k = 0; k < 4; k++) add("showcase", 13 + k, 11, null, "\u7F8E\u8853\u54C1\u306E\u53CE\u8535\u68DA", true);
        paint2(11, 17, 1);
        paint2(14, 17, 1);
        add("statue", 16, 14, null, "\u53CE\u8535\u306E\u5F6B\u523B", true);
        add("rack", 12, 15, null, "\u984D\u7E01\u306E\u4FDD\u7BA1\u30E9\u30C3\u30AF", true);
        add("rack", 13, 15, null, "\u984D\u7E01\u30E9\u30C3\u30AF", true);
        add("desk", 16, 16, null, "\u53CE\u8535\u53F0\u5E33\u306E\u673A", true);
      },
      mech: (r) => {
        add("cabinet", 1, 19, null, "\u5206\u96FB\u76E4\u30FB\u53D7\u5909\u96FB\u8A2D\u5099", true, { w: 1 });
        add("cabinet", 2, 19, null, "\u53D7\u5909\u96FB\u8A2D\u5099", true);
        add("cabinet", 3, 19, null, "\u975E\u5E38\u7528\u767A\u96FB\u6A5F", true);
        add("cabinet", 4, 19, null, "\u767A\u96FB\u6A5F", true);
        add("washer", 7, 19, null, "\u5927\u578B\u30DC\u30A4\u30E9\u30FC(\u7D66\u6E6F)", true);
        add("washer", 8, 19, null, "\u30DC\u30A4\u30E9\u30FC", true);
        add("cabinet", 1, 23, null, "\u7A7A\u8ABF\u6A5F\u68B0", true);
        add("cabinet", 2, 23, null, "\u7A7A\u8ABF\u6A5F\u68B0", true);
        add("pallet", 6, 26, null, "\u5099\u54C1\u30FB\u4E88\u5099\u90E8\u6750", true);
        add("tmachine", 8, 24, null, "\u9632\u72AF\u30B7\u30B9\u30C6\u30E0\u306E\u5236\u5FA1\u76E4", true);
        add("extinguisher", 9, 19, null, "\u6D88\u706B\u5668", true);
      },
      fac: (r) => {
        add("desk", 12, 20, "work", "\u8A2D\u5099\u7BA1\u7406\u306E\u673A(\u76E3\u8996\u76E4)", true);
        add("pcdesk", 13, 20, "work", "\u9632\u72AF\u30AB\u30E1\u30E9\u306E\u30E2\u30CB\u30BF\u30FC", true);
        add("pcdesk", 14, 20, "work", "\u9632\u72AF\u30AB\u30E1\u30E9\u306E\u30E2\u30CB\u30BF\u30FC", true);
        add("chair", 13, 21, null, "\u6905\u5B50", false);
        add("shelf", 16, 20, null, "\u5DE5\u5177\u68DA", true);
        add("locker", 17, 20, null, "\u4F5C\u696D\u670D\u30ED\u30C3\u30AB\u30FC", true);
        add("locker", 17, 21, null, "\u30ED\u30C3\u30AB\u30FC", true);
        add("rack", 12, 26, null, "\u90E8\u54C1\u68DA", true);
        add("table", 14, 25, null, "\u4F5C\u696D\u53F0");
        add("board", 15, 27, null, "\u8A2D\u5099\u70B9\u691C\u8868", true);
        staff(13, 22, "facility", { act: "check" });
        staff(15, 23, "guard", { act: "monitor" });
      },
      garage: (r) => {
        const slots = [[31, 1], [33, 1], [35, 1], [37, 1], [39, 1], [41, 1], [43, 1], [45, 1], [31, 7], [33, 7], [35, 7], [37, 7], [39, 7], [41, 7]];
        let n2 = 0;
        for (const [x, y] of slots) {
          if (n2 >= 8) break;
          const c = CARS[n2];
          add("showcar", x, y, "park", c.n, true, { w: 2, h: 4, cartype: c.ty, colIdx: c.c, slot: n2, own: "parents" });
          n2++;
        }
        rug(31, 5, 15, 2, "#3a3a40", "#8a8f98");
        add("extinguisher", 46, 12, null, "\u6D88\u706B\u5668", true);
        add("lamp", 30 + 1, 12, null, "\u7167\u660E", true);
        add("tmachine", 46, 5, null, "\u96FB\u52D5\u30B7\u30E3\u30C3\u30BF\u30FC\u64CD\u4F5C\u76E4", true);
        staff(44, 12, "driver", { act: "check" });
      },
      garage2: (r) => {
        const slots = [[33, 23], [35, 23]];
        slots.forEach(([x, y], i) => {
          const c = CARS[8 + i];
          add("showcar", x, y, "park", c.n, true, { w: 2, h: 4, cartype: c.ty, colIdx: c.c, slot: 8 + i, own: "parents" });
        });
        add("shelf", 40, 23, null, "\u30BF\u30A4\u30E4\u30FB\u5DE5\u5177\u68DA", true, { w: 1 });
        add("cart", 42, 24, null, "\u6574\u5099\u30AB\u30FC\u30C8", true);
        add("cabinet", 46, 23, null, "\u5DE5\u5177\u7BB1", true);
        add("watersrv", 46, 27, null, "\u7D66\u6C34\u6A5F", true);
      },
      carwash: (r) => {
        add("washer", 40, 16, "wash", "\u6D17\u8ECA\u6A5F", true);
        add("washer", 41, 16, null, "\u6D17\u8ECA\u6A5F", true);
        add("cart", 44, 15, null, "\u6D17\u8ECA\u7528\u54C1\u30EF\u30B4\u30F3", true);
        add("cabinet", 46, 15, null, "\u6D17\u5264\u30FB\u30EF\u30C3\u30AF\u30B9\u68DA", true);
        add("shelf", 46, 19, null, "\u90E8\u54C1\u68DA", true);
        add("rack", 39, 20, null, "\u30EA\u30D5\u30C8(\u6574\u5099\u7528)", true);
      }
    };
    for (const r of Object.values(R5)) {
      const f2 = ROOM[r.fn];
      if (f2) f2(r);
      rooms.push({ id: r.id, name: r.nm, x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 });
    }
    const label = MANSION_LABEL[String(lv)];
    const I2 = { W: W2, H: H4, floors: hi2 - lo + 1, floor: lv, kind: "home", mansion: true, estate: 2, lv, lo, hi: hi2, tiles, objs, door, stairs: stairsDef, staffSpots, seatSpots, accessible: true, noDoor: lv !== 0, wallH: 3.2, label, lifts, esc: [], mansionRooms: rooms, nRooms: rooms.length };
    return I2;
  }

