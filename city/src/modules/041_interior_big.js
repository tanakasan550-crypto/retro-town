  // src/interior_big.js
  var bigKind = (b) => b.type === "dept" ? "dept" : b.type === "mall" ? "mall" : isCondo(b) ? "condo" : null;
  function levelRange(b) {
    {
      const fr = facRange(b);
      if (fr) return fr;
    }
    const nf = storeys(b), k = bigKind(b);
    if (k === "dept") return { lo: -1, hi: nf, nf };
    if (k === "mall") return { lo: -1, hi: nf, nf };
    if (k === "condo") return { lo: b.type === "tower" ? -1 : 0, hi: nf - 1, nf };
    return { lo: 0, hi: (b.floors || 1) - 1, nf };
  }
  var DEPT = ["\u5316\u7CA7\u54C1\u30FB\u6848\u5185", "\u5A66\u4EBA\u670D", "\u7D33\u58EB\u670D", "\u5B50\u4F9B\u670D\u30FB\u73A9\u5177", "\u5BB6\u5177\u30FB\u751F\u6D3B\u7528\u54C1", "\u66F8\u7C4D\u30FB\u6587\u5177\u30FB\u50AC\u4E8B", "\u30EC\u30B9\u30C8\u30E9\u30F3\u8857", "\u50AC\u4E8B\u5834\u30FB\u30AE\u30E3\u30E9\u30EA\u30FC"];
  var MALL = ["\u5C02\u9580\u5E97\u30FB\u96D1\u8CA8", "\u30D5\u30A1\u30C3\u30B7\u30E7\u30F3", "\u30D5\u30FC\u30C9\u30B3\u30FC\u30C8\u30FB\u30B2\u30FC\u30E0\u30FB\u6620\u753B"];
  function levelLabel(b, lv) {
    {
      const fl = facLabel(b, lv);
      if (fl) return fl;
    }
    const k = bigKind(b);
    const { nf } = levelRange(b);
    const fl = lv < 0 ? "B" + -lv + "F" : lv >= nf && (k === "dept" || k === "mall") ? "R" : lv + 1 + "F";
    if (k === "dept") return lv === -1 ? "B1 \u98DF\u54C1\u58F2\u5834" : lv >= nf ? "\u5C4B\u4E0A \u5EAD\u5712\u30FB\u4F11\u61A9\u65BD\u8A2D" : `${lv + 1}F ${DEPT[lv]}`;
    if (k === "mall") return lv === -1 ? "B1 \u98DF\u54C1\u30FB\u30B9\u30FC\u30D1\u30FC" : lv >= nf ? "\u5C4B\u4E0A \u5E83\u5834\u30FB\u99D0\u8ECA\u5834" : `${lv + 1}F ${MALL[Math.min(lv, MALL.length - 1)]}`;
    if (k === "condo") return lv === -1 ? "B1 \u99D0\u8ECA\u5834" : lv === 0 ? "1F \u30A8\u30F3\u30C8\u30E9\u30F3\u30B9\u30FB\u5171\u7528\u90E8" : `${lv + 1}F \u5C45\u4F4F\u968E`;
    return `${lv + 1}F`;
  }
  var levelShort = (b, lv) => {
    const k = bigKind(b);
    const { nf } = levelRange(b);
    return lv < 0 ? "B" + -lv : (k === "dept" || k === "mall") && lv >= nf ? "R" : String(lv + 1);
  };
  var TEN = {
    food: ["\u60E3\u83DC \u3072\u306A\u305F", "\u6D0B\u83D3\u5B50 \u30EB\u30CA\u30FC\u30EB", "\u7CBE\u8089 \u307E\u308B\u3088\u3057", "\u9BAE\u9B5A \u6F6E\u9A12", "\u9752\u679C \u307F\u3069\u308A\u5C4B", "\u548C\u83D3\u5B50 \u82B1\u3054\u3088\u307F", "\u30D9\u30FC\u30AB\u30EA\u30FC \u9EA6\u306E\u7A42", "\u8336\u8217 \u4E00\u714E", "\u6F2C\u7269 \u4EAC\u306E\u8535", "\u5F01\u5F53 \u3044\u308D\u306F", "\u73C8\u7432\u8C46 \u30CE\u30EF\u30FC\u30EB", "\u30EF\u30A4\u30F3\u3068\u9152 \u8535\u4EBA"],
    cosme: ["\u30B3\u30B9\u30E1 \u30EB\u30DF\u30A8\u30FC\u30EB", "\u9999\u6C34 \u30A8\u30C8\u30EF\u30FC\u30EB", "\u30B9\u30AD\u30F3\u30B1\u30A2 \u96EB", "\u8CC7\u751F\u5802\u98A8 \u5316\u7CA7\u54C1 \u693F(\u67B6\u7A7A)", "\u30D8\u30A2\u30B1\u30A2 \u30B5\u30ED\u30F3\u30C9\u30FC\u30EB", "\u6848\u5185\u6240"],
    women: ["\u30EC\u30C7\u30A3\u30FC\u30B9 \u30D6\u30FC\u30B1", "\u30DF\u30BB\u30B9\u30B5\u30ED\u30F3 \u85E4", "\u30D6\u30E9\u30A6\u30B9&\u30B9\u30AB\u30FC\u30C8 \u30CB\u30B3", "\u30C9\u30EC\u30B9 \u30BD\u30EF\u30EC", "\u30CB\u30C3\u30C8 \u7F8A\u96F2", "\u30D0\u30C3\u30B0\u30FB\u9774 \u30A2\u30EB\u30C6"],
    men: ["\u7D33\u58EB\u670D \u82F1\u56FD\u5C4B(\u67B6\u7A7A)", "\u30D3\u30B8\u30CD\u30B9 \u30B9\u30FC\u30C4\u9928", "\u30AB\u30B8\u30E5\u30A2\u30EB \u30E1\u30F3\u30BA\u6D77", "\u30CD\u30AF\u30BF\u30A4\u30FB\u5C0F\u7269 \u7D33", "\u30B9\u30DD\u30FC\u30C4\u30A6\u30A7\u30A2 \u30B8\u30E0", "\u9774 \u9769\u5320"],
    kids: ["\u30D9\u30D3\u30FC\u30FB\u5B50\u4F9B\u670D \u3074\u3088\u3074\u3088", "\u304A\u3082\u3061\u3083 \u30EF\u30F3\u30C0\u30FC", "\u306C\u3044\u3050\u308B\u307F \u3082\u3053\u3082\u3053", "\u30B2\u30FC\u30E0\u30FB\u30D7\u30E9\u30E2 \u5DE5\u623F", "\u7D75\u672C\u3068\u30D1\u30BA\u30EB", "\u5B66\u7528\u54C1 \u30E9\u30F3\u30C9\u30BB\u30EB\u9928"],
    furn: ["\u5BB6\u5177 \u6728\u306E\u5BB6", "\u30D9\u30C3\u30C9\u30FB\u5BDD\u5177 \u7720", "\u30AD\u30C3\u30C1\u30F3\u7528\u54C1 \u53F0\u6240\u5C4B", "\u7167\u660E\u30FB\u30A4\u30F3\u30C6\u30EA\u30A2 \u706F", "\u98DF\u5668 \u5668\u306E\u91CC", "\u5BB6\u96FB \u66AE\u3089\u3057\u306E\u96FB\u6C17"],
    books: ["\u66F8\u7C4D \u6587\u6797\u5802(\u67B6\u7A7A)", "\u6587\u5177 \u30DA\u30F3\u3068\u7D19", "\u753B\u6750\u30FB\u624B\u82B8 \u5F69", "\u50AC\u4E8B\u5834 \u5317\u6D77\u9053\u7269\u7523\u5C55", "\u96D1\u8A8C\u30FB\u30B3\u30DF\u30C3\u30AF", "\u97F3\u697D\u30FB\u6620\u50CF \u30EC\u30B3\u30FC\u30C9\u306E\u68EE"],
    dine: ["\u548C\u98DF \u3055\u304F\u3089\u4EAD", "\u5BFF\u53F8 \u6CE2\u306E\u82B1", "\u3068\u3093\u304B\u3064 \u52DD\u9B28", "\u3046\u3069\u3093 \u8B83\u5C90\u5C4B", "\u6D0B\u98DF \u30B0\u30EA\u30EB\u6B05", "\u4E2D\u83EF \u9F8D\u9580", "\u30AB\u30D5\u30A7 \u7A93\u8FBA", "\u30A4\u30BF\u30EA\u30A2\u30F3 \u30C8\u30E9\u30C3\u30C8\u30EA\u30A2\u677E", "\u7518\u5473\u51E6 \u307F\u3064\u8C46", "\u5929\u3077\u3089 \u56DB\u5B63"],
    event: ["\u7279\u8A2D\u50AC\u4E8B\u5834", "\u30AE\u30E3\u30E9\u30EA\u30FC \u5149", "\u6587\u5316\u6559\u5BA4(\u30AB\u30EB\u30C1\u30E3\u30FC)", "\u5C55\u793A\u30DB\u30FC\u30EB", "\u30AD\u30C3\u30BA\u30B9\u30DA\u30FC\u30B9", "\u30D9\u30D3\u30FC\u4F11\u61A9\u5BA4"],
    mallA: ["\u96D1\u8CA8 \u3053\u3068\u306E\u306F", "\u66F8\u5E97 \u30DA\u30FC\u30B8", "\u30C9\u30E9\u30C3\u30B0 \u30CF\u30FC\u30D6", "\u773C\u93E1 \u30E1\u30AC\u30CD\u306E\u68EE", "100\u5186\u5747\u4E00 \u307E\u308B\u3054\u3068", "\u643A\u5E2F\u30FB\u5BB6\u96FB \u30C7\u30F3\u30AD\u5C4B"],
    mallB: ["\u30A2\u30D1\u30EC\u30EB \u30D6\u30EB\u30FC\u30E0", "\u30E6\u30CB\u30D5\u30A9\u30FC\u30E0 SHIRO", "\u9774 \u30B9\u30C6\u30C3\u30D7", "\u30D0\u30C3\u30B0 \u30B3\u30B3\u30ED", "\u30A2\u30AF\u30BB\u30B5\u30EA\u30FC \u661F\u5C51", "\u30B9\u30DD\u30FC\u30C4\u7528\u54C1 \u75BE\u98A8"],
    mallC: ["\u30D5\u30FC\u30C9\u30B3\u30FC\u30C8 \u305F\u3079\u3088\u3046", "\u30B2\u30FC\u30BB\u30F3 \u30D4\u30B3", "\u6620\u753B\u9928 \u30B7\u30CD\u30DE\u30FB\u30B3\u30B9\u30E2", "\u30A2\u30A4\u30B9 \u30DF\u30EB\u30AD\u30FC", "\u30AF\u30EC\u30FC\u30D7 \u82B1", "\u30DC\u30A6\u30EB&\u30AB\u30E9\u30AA\u30B1"]
  };
  function tenantsOf(b, lv) {
    const k = bigKind(b), { nf } = levelRange(b);
    const out = [];
    let key, style;
    if (k === "dept") {
      if (lv === -1) {
        key = "food";
        style = "food";
      } else if (lv >= nf) return out;
      else {
        key = ["cosme", "women", "men", "kids", "furn", "books", "dine", "event"][lv];
        style = ["cosme", "apparel", "apparel", "kids", "furn", "books", "dine", "event"][lv];
      }
    } else if (k === "mall") {
      if (lv === -1) {
        key = "food";
        style = "food";
      } else if (lv >= nf) return out;
      else {
        key = ["mallA", "mallB", "mallC"][Math.min(lv, 2)];
        style = ["books", "apparel", "dine"][Math.min(lv, 2)];
      }
    } else return out;
    const pool = TEN[key];
    for (let i = 0; i < 6; i++) {
      let nm = pool[(hash2(b.idx, lv * 17 + 3) + i) % pool.length];
      out.push({ style: key === "cosme" && i === 0 ? "cosme" : style, name: nm, side: i < 3 ? "N" : "S", i, x0: [5, 12, 22][i % 3] });
    }
    if (k === "dept" && lv === 0) {
      out[3] = { style: "cosme", name: "\u30B3\u30B9\u30E1 \u30EB\u30DF\u30A8\u30FC\u30EB \u672C\u5E97", side: "S", i: 3, x0: 5 };
    }
    return out;
  }
  function floorGuide(b) {
    const { lo, hi: hi2 } = levelRange(b);
    const rows2 = [];
    for (let lv = hi2; lv >= lo; lv--) rows2.push(`${levelLabel(b, lv)}: ${tenantsOf(b, lv).map((t) => t.name).join("\u3001") || (bigKind(b) === "condo" ? "" : "\u5EAD\u5712\u30FB\u30D9\u30F3\u30C1\u30FB\u81EA\u8CA9\u6A5F")}`);
    return rows2.join("\n");
  }
  function buildBig(b, floor, g) {
    const k = bigKind(b);
    const { lo, hi: hi2, nf } = levelRange(b);
    const lv = Math.max(lo, Math.min(hi2, floor));
    return k === "condo" ? buildCondo(b, lv, g, { lo, hi: hi2, nf }) : buildStore(b, lv, k, { lo, hi: hi2, nf });
  }
  function mk2(W2, H4, tile, kind) {
    const tiles = new Array(W2 * H4).fill(tile);
    for (let x = 0; x < W2; x++) tiles[x] = "wall";
    const objs = [], occ = /* @__PURE__ */ new Set();
    const add = (t, x, y, act, label, solid = true, extra = {}) => {
      if (x < 0 || y < 1 || x >= W2 || y >= H4) return null;
      const kk = x + y * W2;
      if (occ.has(kk)) return null;
      const w = extra.w || 1, h = extra.h || 1;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) occ.add(xx + yy * W2);
      const o = { t, x, y, act, label, solid, ...extra };
      objs.push(o);
      return o;
    };
    const reserve = (x0, y0, x1, y1) => {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) occ.add(x + y * W2);
    };
    return { tiles, objs, occ, add, reserve };
  }
  function buildStore(b, lv, k, R5) {
    const { lo, hi: hi2, nf } = R5;
    const W2 = 40, H4 = 24;
    const roof = lv >= nf;
    const ground = lv === 0;
    const m = mk2(W2, H4, roof ? "floor_paving" : lv === -1 ? "floor_tile" : "floor_marble", "shop");
    const { tiles, objs, add, reserve } = m;
    const staffSpots = [], seatSpots = [], stairsDef = [];
    const door = ground ? { x: 20, y: H4 - 1 } : { x: -9, y: -9 };
    if (ground) tiles[door.x + door.y * W2] = "exit";
    if (ground) {
      reserve(door.x, H4 - 2, door.x, H4 - 2);
      reserve(door.x, H4 - 3, door.x, H4 - 3);
    }
    for (let x = 1; x < W2 - 1; x += 3) if (!roof) objs.push({ t: "window", x, y: 0, solid: true, deco: true });
    if (lv < hi2) {
      add("stairs_up", 4, 1, "stairs", `${levelShort(b, lv + 1)}\u968E\u3078(\u968E\u6BB5)`, false, { to: lv + 1, via: "main" });
      stairsDef.push({ x: 4, y: 1, to: lv + 1, via: "main" });
    }
    if (lv > lo) {
      add("stairs_down", 1, 1, "stairs", `${levelShort(b, lv - 1)}\u968E\u3078(\u968E\u6BB5)`, false, { to: lv - 1, via: "main" });
      stairsDef.push({ x: 1, y: 1, to: lv - 1, via: "main" });
    }
    const escUp = lv < hi2 && !roof, escDn = lv > lo;
    const esc5 = [];
    if (!roof || lv > lo) {
      if (lv < hi2 && lv < nf) {
        add("esc", 14, 8, "esc", `\u4E0A\u308A\u30A8\u30B9\u30AB\u30EC\u30FC\u30BF\u30FC(${levelShort(b, lv + 1)}\u968E\u3078)`, true, { w: 1, h: 3, dir: "up", to: lv + 1, enter: { x: 14, y: 11 }, land: { x: 14, y: 6 } });
        esc5.push({ dir: "up", x: 14, y: 8, to: lv + 1 });
      }
      if (lv > lo) {
        add("esc", 16, 8, "esc", `\u4E0B\u308A\u30A8\u30B9\u30AB\u30EC\u30FC\u30BF\u30FC(${levelShort(b, lv - 1)}\u968E\u3078)`, true, { w: 1, h: 3, dir: "down", to: lv - 1, enter: { x: 16, y: 7 }, land: { x: 16, y: 12 } });
        esc5.push({ dir: "down", x: 16, y: 8, to: lv - 1 });
      }
    }
    const nl = k === "dept" ? 3 : 2;
    const lifts = [];
    for (let i = 0; i < nl; i++) {
      const x = 32 + i * 2;
      add("elev", x, 1, "lift", `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC${i + 1}\u53F7\u6A5F`, true, { w: 2, h: 1, shaft: i, lo, hi: hi2 });
      lifts.push({ shaft: i, x, y: 1 });
    }
    add("board", 19, 1, "info", "\u30D5\u30ED\u30A2\u30AC\u30A4\u30C9(\u58F2\u5834\u6848\u5185)", true);
    if (!roof) {
      add("sofa", 31, 8, "rest", "\u4F11\u61A9\u6240\u306E\u30BD\u30D5\u30A1", false);
      add("sofa", 33, 8, "rest", "\u4F11\u61A9\u6240\u306E\u30BD\u30D5\u30A1", false);
      add("plant", 35, 8, null, "\u89B3\u8449\u690D\u7269");
      add("sofa", 31, 10, "rest", "\u4F11\u61A9\u6240\u306E\u30BD\u30D5\u30A1", false);
      add("sofa", 33, 10, "rest", "\u4F11\u61A9\u6240\u306E\u30BD\u30D5\u30A1", false);
      seatSpots.push({ x: 31, y: 9 }, { x: 33, y: 9 }, { x: 31, y: 11 }, { x: 33, y: 11 });
      add("plant", 6, 8, null, "\u89B3\u8449\u690D\u7269");
      add("plant", 24, 8, null, "\u89B3\u8449\u690D\u7269");
      add("plant", 27, 10, null, "\u89B3\u8449\u690D\u7269");
      add("toilet", 31, 13, "toilet", "\u5316\u7CA7\u5BA4(\u7537\u5B50)", true, { w: 2, h: 2, sign: "\u7537" });
      add("toilet", 33, 13, "toilet", "\u5316\u7CA7\u5BA4(\u5973\u5B50)", true, { w: 2, h: 2, sign: "\u5973" });
      add("toilet", 35, 13, "toilet", "\u591A\u76EE\u7684\u30C8\u30A4\u30EC(\u8ECA\u3044\u3059\u30FB\u304A\u3080\u3064\u66FF\u3048)", true, { w: 2, h: 2, sign: "\u591A" });
    }
    if (ground) {
      add("counter", 22, 19, "info", "\u7DCF\u5408\u6848\u5185\u6240", true);
      add("counter", 23, 19, "info", "\u7DCF\u5408\u6848\u5185\u6240", true);
      staffSpots.push({ x: 22, y: 18 }, { x: 23, y: 18 });
      add("plant", 18, 20, null, "\u89B3\u8449\u690D\u7269");
      add("plant", 23, 21, null, "\u89B3\u8449\u690D\u7269");
      add("doormat", door.x, H4 - 2, null, "", false);
    }
    const ten = tenantsOf(b, lv);
    const tenAt = [];
    for (const t of ten) {
      const x0 = t.x0, north = t.side === "N";
      const row = (dy) => north ? 1 + dy : 17 - dy;
      const at = (tt, dx, dy, act, label, solid = true, ex) => add(tt, x0 + dx, row(dy), act, label, solid, ex);
      if (t.style === "food") {
        for (let dx = 0; dx < 7; dx++) at("fridge", dx, 0, "shelf", `${t.name}(\u51B7\u8535\u30B1\u30FC\u30B9)`);
        for (const dx of [1, 3, 5]) at("shelf", dx, 2, "shelf", `${t.name}\u306E\u58F2\u5834`);
        at("register", 5, 4, "register", `${t.name} \u30EC\u30B8`);
        at("counter", 4, 4);
        at("counter", 6, 4);
      } else if (t.style === "cosme") {
        for (let dx = 0; dx < 7; dx += 2) at("mirror", dx, 0, null, "\u93E1");
        for (const dx of [1, 3, 5]) {
          at("counter", dx, 2, "shelf", `${t.name}\u306E\u30AB\u30A6\u30F3\u30BF\u30FC(\u8A66\u4F9B\u54C1\u30FB\u5546\u54C1)`);
        }
        at("register", 5, 4, "register", `${t.name} \u30EC\u30B8`);
        at("counter", 4, 4);
        at("counter", 6, 4);
      } else if (t.style === "apparel") {
        for (let dx = 0; dx < 7; dx++) at("rack", dx, 0, "fitting", `${t.name}(\u8A66\u7740\u3067\u304D\u307E\u3059)`);
        for (const dx of [1, 3, 5]) at("rack", dx, 2, "fitting", `${t.name}(\u8A66\u7740\u3067\u304D\u307E\u3059)`);
        at("fitting", 6, 3, "fitting", "\u8A66\u7740\u5BA4");
        at("register", 5, 4, "register", `${t.name} \u30EC\u30B8`);
        at("counter", 4, 4);
      } else if (t.style === "kids") {
        for (let dx = 0; dx < 7; dx++) at("shelf", dx, 0, "shelf", `${t.name}(\u304A\u3082\u3061\u3083\u30FB\u5B50\u4F9B\u670D)`);
        for (const dx of [1, 3]) at("rack", dx, 2, "fitting", `${t.name}(\u5B50\u4F9B\u670D)`);
        at("sofa", 5, 2, "rest", "\u30AD\u30C3\u30BA\u30B9\u30DA\u30FC\u30B9\u306E\u30BD\u30D5\u30A1", false);
        at("register", 5, 4, "register", `${t.name} \u30EC\u30B8`);
        at("counter", 4, 4);
        seatSpots.push({ x: x0 + 5, y: row(3) });
      } else if (t.style === "furn") {
        at("bed", 0, 0, "shelf", `${t.name}(\u5C55\u793A\u30D9\u30C3\u30C9)`);
        at("bed", 1, 0, "shelf", `${t.name}(\u5C55\u793A\u30D9\u30C3\u30C9)`);
        at("sofa", 3, 0, "shelf", `${t.name}(\u5C55\u793A\u30BD\u30D5\u30A1)`);
        at("sofa", 4, 0, "shelf", `${t.name}(\u5C55\u793A\u30BD\u30D5\u30A1)`);
        at("tv", 6, 0, "shelf", "\u5C55\u793A\u30C6\u30EC\u30D3");
        at("table", 1, 2, "shelf", `${t.name}(\u5C55\u793A\u30C6\u30FC\u30D6\u30EB)`);
        at("chair", 0, 2, null, "", false);
        at("chair", 2, 2, null, "", false);
        at("desk", 4, 2, "shelf", `${t.name}(\u5C55\u793A\u673A)`);
        at("shelf", 6, 2, "shelf", `${t.name}(\u751F\u6D3B\u7528\u54C1)`);
        at("register", 5, 4, "register", `${t.name} \u30EC\u30B8`);
        at("counter", 4, 4);
      } else if (t.style === "books") {
        for (let dx = 0; dx < 7; dx++) at("shelf", dx, 0, "shelf", `${t.name}(\u68DA)`);
        for (const dx of [1, 3, 5]) at("shelf", dx, 2, "shelf", `${t.name}(\u68DA)`);
        at("register", 5, 4, "register", `${t.name} \u30EC\u30B8`);
        at("counter", 4, 4);
        at("counter", 6, 4);
      } else if (t.style === "dine") {
        at("sink", 0, 0, null, "\u53A8\u623F");
        at("fridge", 1, 0, null, "\u51B7\u8535\u5EAB");
        at("sink", 2, 0, null, "\u53A8\u623F");
        for (let dx = 3; dx < 7; dx++) at("counter", dx, 1, "order", `${t.name} \u6CE8\u6587\u30AB\u30A6\u30F3\u30BF\u30FC`);
        for (const [dx, dy] of [[1, 3], [4, 3], [1, 5], [4, 5]]) {
          at("table", dx, dy, "order", `${t.name} \u30C6\u30FC\u30D6\u30EB\u5E2D`);
          at("chair", dx - 1, dy, null, "", false);
          at("chair", dx + 1, dy, null, "", false);
          seatSpots.push({ x: x0 + dx - 1, y: row(dy) }, { x: x0 + dx + 1, y: row(dy) });
        }
        staffSpots.push({ x: x0 + 4, y: row(0) }, { x: x0 + 5, y: row(0) });
      } else {
        for (const dx of [1, 3, 5]) at("table", dx, 1, "shelf", `${t.name}(\u50AC\u4E8B\u306E\u58F2\u308A\u5834)`);
        for (const dx of [1, 3, 5]) at("table", dx, 3, "shelf", `${t.name}(\u50AC\u4E8B\u306E\u58F2\u308A\u5834)`);
        at("register", 5, 5, "register", `${t.name} \u30EC\u30B8`);
        at("board", 0, 0, "info", `${t.name}\u306E\u6848\u5185`);
      }
      objs.push({ t: "tsign", x: x0 + 3, y: north ? 6 : 12, text: t.name, solid: false, deco: false });
      staffSpots.push({ x: x0 + 5, y: north ? 4 : 14 });
      staffSpots.push({ x: x0 + 3, y: north ? 4 : 14 });
      tenAt.push({ ...t, reg: { x: x0 + 5, y: north ? 5 : 13 } });
    }
    if (roof) {
      for (let y = 1; y < H4 - 1; y++) for (let x = 0; x < W2; x++) if ((x + y * 3) % 11 === 0 || x > 4 && x < 36 && y > 13 && y < 22 && (x * 7 + y) % 5 < 4) tiles[x + y * W2] = "floor_grass";
      for (const [x, y] of [[6, 4], [11, 5], [26, 3], [34, 5], [8, 15], [30, 16], [36, 20], [24, 20], [13, 20]]) add("tree", x, y, null, "\u5EAD\u6728");
      for (const [x, y] of [[8, 8], [12, 9], [26, 8], [29, 9]]) add("bench", x, y, "rest", "\u30D9\u30F3\u30C1", false);
      for (const [x, y] of [[3, 15], [5, 15], [16, 15], [18, 15], [24, 16], [27, 16]]) add("planter", x, y, null, "\u82B1\u58C7");
      add("vending", 36, 9, "vend", "\u81EA\u52D5\u8CA9\u58F2\u6A5F", true);
      add("vending", 37, 9, "vend", "\u81EA\u52D5\u8CA9\u58F2\u6A5F", true);
      add("shrine", 22, 5, "pray", "\u5C4B\u4E0A\u306E\u5C0F\u3055\u306A\u7960(\u304A\u53C2\u308A\u3067\u304D\u307E\u3059)", true);
      add("slide", 31, 14, "rest", "\u3053\u3069\u3082\u5E83\u5834(\u3059\u3079\u308A\u53F0)", true, { w: 2, h: 2 });
      seatSpots.push({ x: 8, y: 9 }, { x: 12, y: 10 }, { x: 26, y: 9 }, { x: 29, y: 10 });
      staffSpots.push({ x: 20, y: 9 });
    }
    const I2 = { W: W2, H: H4, floors: hi2 - lo + 1, floor: lv, kind: roof ? "roof" : "shop", big: true, bigKind: k, lv, lo, hi: hi2, tiles, objs, door, stairs: stairsDef, staffSpots, seatSpots, accessible: true, noDoor: !ground, wallH: roof ? 1.1 : 3, label: levelLabel(b, lv), lifts, esc: esc5, tenants: tenAt };
    I2.escEntries = objs.filter((o) => o.t === "esc").map((o) => ({ o, to: o.to, dir: o.dir, enter: o.enter, land: o.land }));
    return I2;
  }
  function buildCondo(b, lv, g, R5) {
    const { lo, hi: hi2, nf } = R5;
    const reg = g ? registry(g, b.idx) : null;
    const plan = reg ? reg.plan : condoPlan(b);
    const tower = b.type === "tower";
    const perSide = plan.perFloor;
    const unitW = 3;
    const xc = 2 + unitW * perSide + 1;
    const coreW = tower ? 16 : plan.lifts > 0 ? 14 : 8;
    const W2 = Math.max(26, Math.min(64, xc + coreW));
    if (lv <= 0) return buildCondoGround(b, lv, g, R5, plan, W2, reg);
    const H4 = 9;
    const m = mk2(W2, H4, "floor_corr", "condo");
    const { tiles, objs, add, reserve } = m;
    const stairsDef = [], staffSpots = [], seatSpots = [];
    const door = { x: -9, y: -9 };
    for (let y = 6; y <= 7; y++) for (let x = 0; x < W2; x++) tiles[x + y * W2] = "floor_corr";
    const lifts = [];
    const units = [];
    for (let p = 0; p < perSide; p++) {
      const x = 2 + p * unitW;
      const u = reg ? reg.units[(lv - 1) * plan.perFloor + p] : null;
      const room2 = roomNo(lv, p);
      add("ublock", x, 1, null, "", true, { w: unitW, h: 5, room: room2, wallc: p % 2, mine: !!(u && u.hero), vacant: u ? u.root < 0 : false, plate: u && u.root >= 0 ? nameplate(g, u) : "" });
      const label = u ? `${room2}\u53F7\u5BA4 ${u.root < 0 ? "\u7A7A\u5BA4" : nameplate(g, u)}${u.hero ? "(\u3042\u306A\u305F\u306E\u90E8\u5C4B)" : ""}` : `${room2}\u53F7\u5BA4`;
      add("udoor", x + 1, 6, "unit", label, false, { room: room2, lv, pos: p, vacant: u ? u.root < 0 : false, mine: !!(u && u.hero) });
      units.push({ lv, pos: p, room: room2, x: x + 1, y: 6 });
    }
    if (lv < hi2) {
      add("stairs_up", W2 - 7, 1, "stairs", `${lv + 2}\u968E\u3078(\u968E\u6BB5)`, false, { to: lv + 1, via: "main" });
      stairsDef.push({ x: W2 - 7, y: 1, to: lv + 1, via: "main" });
    }
    if (lv > lo) {
      add("stairs_down", W2 - 2, 1, "stairs", `${lv}\u968E\u3078(\u968E\u6BB5)`, false, { to: lv - 1, via: "main" });
      stairsDef.push({ x: W2 - 2, y: 1, to: lv - 1, via: "main" });
    }
    if (lv < hi2) {
      add("estair", 1, 6, "stairs", `\u975E\u5E38\u968E\u6BB5(${lv + 2}\u968E\u3078)`, false, { to: lv + 1, via: "emg" });
      stairsDef.push({ x: 1, y: 6, to: lv + 1, via: "emg" });
    } else if (lv > lo) {
      add("estair", 1, 6, "stairs", `\u975E\u5E38\u968E\u6BB5(${lv}\u968E\u3078)`, false, { to: lv - 1, via: "emg" });
      stairsDef.push({ x: 1, y: 6, to: lv - 1, via: "emg" });
    }
    if (lv === hi2 && lv > lo) {
    }
    if (plan.lifts > 0) {
      for (let i = 0; i < plan.lifts; i++) {
        const x = xc + 1 + i * 2;
        add("elev", x, 1, "lift", `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC${i + 1}\u53F7\u6A5F`, true, { w: 2, h: 1, shaft: i, lo, hi: hi2 });
        lifts.push({ shaft: i, x, y: 1 });
      }
      add("board", xc + 1 + plan.lifts * 2, 1, "info", "\u63B2\u793A\u677F(\u7BA1\u7406\u7D44\u5408\u306E\u304A\u77E5\u3089\u305B)", true);
    }
    add("plant", W2 - 4, 6, null, "\u89B3\u8449\u690D\u7269");
    staffSpots.push({ x: xc + 2, y: 3 });
    const I2 = { W: W2, H: H4, floors: hi2 - lo + 1, floor: lv, kind: "condo", big: true, bigKind: "condo", lv, lo, hi: hi2, tiles, objs, door, stairs: stairsDef, staffSpots, seatSpots, accessible: plan.lifts > 0, noDoor: true, wallH: 3, label: levelLabel(b, lv), lifts, units, esc: [], corridor: { y0: 6, y1: 7, x0: 2, x1: W2 - 2 } };
    return I2;
  }
  function buildCondoGround(b, lv, g, R5, plan, W2, reg) {
    const { lo, hi: hi2 } = R5;
    const tower = b.type === "tower";
    const H4 = lv < 0 ? 18 : 16;
    const park = lv < 0;
    const m = mk2(W2, H4, park ? "floor_asphalt" : "floor_marble", "condo");
    const { tiles, objs, add, reserve } = m;
    const stairsDef = [], staffSpots = [], seatSpots = [];
    const ground = lv === 0;
    const door = ground ? { x: W2 >> 1, y: H4 - 1 } : { x: -9, y: -9 };
    if (ground) {
      tiles[door.x + door.y * W2] = "exit";
      reserve(door.x, H4 - 2, door.x, H4 - 3);
    }
    const lifts = [];
    if (ground) {
      const nb = Math.min(10, Math.ceil(plan.units / 16));
      for (let i = 0; i < nb; i++) {
        const a = i * 16, c = Math.min(plan.units, a + 16) - 1;
        add("mailbank", 2 + i, 1, "mail", `\u90F5\u4FBF\u53D7\u3051(${roomNo(1 + Math.floor(a / plan.perFloor), a % plan.perFloor)}\u301C${roomNo(1 + Math.floor(c / plan.perFloor), c % plan.perFloor)}\u53F7\u5BA4)`, true, { from: a, to: c });
      }
      const px2 = 3 + nb;
      add("parcel", px2, 1, "parcel", "\u5B85\u914D\u30DC\u30C3\u30AF\u30B9", true, { w: 2, h: 1 });
      add("board", px2 + 3, 1, "info", "\u63B2\u793A\u677F(\u7BA1\u7406\u7D44\u5408\u306E\u304A\u77E5\u3089\u305B\u30FB\u9632\u707D)", true);
      add("extinguisher", px2 + 6, 1, null, "\u6D88\u706B\u5668", false);
      add("umbrella", (W2 >> 1) + 5, H4 - 3, null, "\u5098\u7ACB\u3066", false);
      add("managerroom", 2, 7, "manager", "\u7BA1\u7406\u4EBA\u5BA4(\u7A93\u53E3)", true, { w: 3, h: 2 });
      staffSpots.push({ x: 3, y: 9 }, { x: 4, y: 9 });
      if (plan.lifts > 0) for (let i = 0; i < plan.lifts; i++) {
        const x = (tower ? W2 - 18 : W2 - 12) + i * 2;
        add("elev", x, 1, "lift", `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC${i + 1}\u53F7\u6A5F`, true, { w: 2, h: 1, shaft: i, lo, hi: hi2 });
        lifts.push({ shaft: i, x, y: 1 });
      }
      if (hi2 > lo) {
        add("stairs_up", W2 - 7, 1, "stairs", "2\u968E\u3078(\u968E\u6BB5)", false, { to: 1, via: "main" });
        stairsDef.push({ x: W2 - 7, y: 1, to: 1, via: "main" });
      }
      if (lo < 0) {
        add("stairs_down", W2 - 2, 1, "stairs", "B1 \u99D0\u8ECA\u5834\u3078(\u968E\u6BB5)", false, { to: -1, via: "main" });
        stairsDef.push({ x: W2 - 2, y: 1, to: -1, via: "main" });
      }
      add("estair", 1, 13, "stairs", "\u975E\u5E38\u968E\u6BB5(\u4E0A\u3078)", false, { to: 1, via: "emg" });
      stairsDef.push({ x: 1, y: 13, to: 1, via: "emg" });
      const nbk = Math.min(12, Math.ceil(plan.units / 4));
      for (let i = 0; i < nbk; i++) add("bikerack", W2 - 12 + i % 6 * 2, 10 + Math.floor(i / 6) * 2, "bike", "\u99D0\u8F2A\u5834(\u81EA\u8EE2\u8ECA\u7F6E\u304D\u5834)", true, { w: 1, h: 1 });
      add("trashroom", 9, 7, "trash", "\u3054\u307F\u7F6E\u304D\u5834(\u53CE\u96C6\u65E5\u3092\u78BA\u8A8D\u3067\u304D\u307E\u3059)", true, { w: 2, h: 2 });
      add("sofa", W2 - 8, 7, "rest", "\u30A8\u30F3\u30C8\u30E9\u30F3\u30B9\u306E\u30D9\u30F3\u30C1", false);
      add("plant", W2 - 6, 7, null, "\u89B3\u8449\u690D\u7269");
      seatSpots.push({ x: W2 - 8, y: 8 });
      add("plant", (W2 >> 1) - 3, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
      add("plant", (W2 >> 1) + 3, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
      add("doormat", door.x, H4 - 2, null, "", false);
    } else {
      const owners = reg && g ? reg.units.filter((u) => u.root >= 0 && ownsCar(g.world, u.root, g.year())).map((u) => u.root) : [];
      const n2 = Math.min(plan.units, 2 * Math.floor((W2 - 6) / 3));
      let stall = 0;
      for (let i = 0; i < n2; i++) {
        const north = i % 2 === 0;
        const x = 2 + Math.floor(i / 2) * 3;
        const y = north ? 1 : 12;
        if (x + 2 >= W2 - 6) break;
        stall++;
        add("pstall", x, y, "park", `\u99D0\u8ECA\u533A\u753B ${stall}`, false, { w: 2, h: 4, no: stall, pos: i, carOwner: owners[stall - 1] ?? null });
      }
      add("stairs_up", W2 - 3, 1, "stairs", "1\u968E\u30A8\u30F3\u30C8\u30E9\u30F3\u30B9\u3078(\u968E\u6BB5)", false, { to: 0, via: "main" });
      stairsDef.push({ x: W2 - 3, y: 1, to: 0, via: "main" });
      if (plan.lifts > 0) for (let i = 0; i < plan.lifts; i++) {
        const x = (tower ? W2 - 18 : W2 - 12) + i * 2;
        add("elev", x, 1, "lift", `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC${i + 1}\u53F7\u6A5F`, true, { w: 2, h: 1, shaft: i, lo, hi: hi2 });
        lifts.push({ shaft: i, x, y: 1 });
      }
      add("estair", 1, 8, "stairs", "\u975E\u5E38\u968E\u6BB5(1\u968E\u3078)", false, { to: 0, via: "emg" });
      stairsDef.push({ x: 1, y: 8, to: 0, via: "emg" });
    }
    return { W: W2, H: H4, floors: hi2 - lo + 1, floor: lv, kind: "condo", big: true, bigKind: "condo", lv, lo, hi: hi2, tiles, objs, door, stairs: stairsDef, staffSpots, seatSpots, accessible: true, noDoor: !ground, wallH: 3, label: levelLabel(b, lv), lifts, esc: [], parking: park };
  }

