  // src/archstyle.js
  var BAND = [[1946, 1974], [1975, 1999], [2e3, 2060]];
  function facadeYear(b, year) {
    const era = Math.max(0, Math.min(2, b.era ?? 1));
    const [lo, hi2] = BAND[era];
    const span = Math.max(4, Math.min(hi2, year) - lo + 1);
    return Math.min(year, lo + HB(b.idx, 301) % span);
  }
  var fashionOf = (fy) => fy < 1955 ? 0 : fy < 1970 ? 1 : fy < 1985 ? 2 : fy < 2e3 ? 3 : fy < 2015 ? 4 : 5;
  var WALL_BY_FASHION = {
    res: [["shitami", "plank"], ["mortar", "plank", "plaster"], ["mosaic", "mortar", "tile"], ["tile", "brick", "siding", "mortar"], ["siding", "siding", "panel", "tile"], ["siding", "panel", "panel", "tile"]],
    apt: [["plank", "mortar"], ["mortar", "conc"], ["mosaic", "tile", "conc"], ["tile", "tile", "brick"], ["panel", "tile", "siding"], ["panel", "glass", "panel"]],
    shop: [["plank", "plaster"], ["mortar", "tile"], ["tile", "mosaic", "metal"], ["panel", "tile", "metal"], ["panel", "metal", "siding"], ["panel", "glass", "metal"]],
    civic: [["mortar", "stone"], ["stone", "brick", "mortar"], ["tile", "brick", "stone"], ["tile", "brick", "panel"], ["panel", "stone", "tile"], ["panel", "glass", "stone"]],
    hall: [["metal", "plank"], ["metal", "mortar"], ["metal", "panel"], ["metal", "panel"], ["panel", "metal"], ["panel", "metal"]],
    office: [["mortar", "stone"], ["tile", "mortar", "conc"], ["tile", "mosaic", "conc"], ["tile", "glass", "panel"], ["glass", "panel", "glass"], ["glass", "glass", "panel"]],
    wa: [["plank", "plaster"], ["plank", "mortar"], ["plank", "mortar"], ["siding", "plank"], ["siding", "plank"], ["siding", "plank"]]
  };
  var GROUP = {
    res: "res",
    apt: "apt",
    shop: "shop",
    conv: "shop",
    super: "shop",
    eat: "shop",
    game: "shop",
    cardealer: "shop",
    usedcar: "shop",
    gas: "shop",
    pier: "shop",
    civic: "civic",
    bank: "civic",
    school: "civic",
    hosp: "civic",
    clinic: "civic",
    care: "civic",
    kinder: "civic",
    cinema: "civic",
    station: "civic",
    tourtower: "civic",
    hall: "hall",
    office: "office",
    tower: "office",
    hotel: "office",
    mall: "office",
    dept: "office",
    ryokan: "wa",
    shrine: "wa",
    temple: "wa",
    yard: "civic"
  };
  var MAT_COL = {
    plank: ["#8a6a46", "#a07a50", "#7d6040", "#b08a5c"],
    shitami: ["#3a2f28", "#2f2a26", "#463a30"],
    mortar: ["#e8dcc4", "#d9d1bd", "#efe6d2", "#cfc3a8", "#e6d3b8"],
    plaster: ["#f1ece0", "#e9e3d3", "#f6f2e8"],
    namako: ["#f2eee4"],
    mosaic: ["#d8c9a8", "#c9d3d6", "#d9b9a0", "#b9c7b2", "#e0d2b0"],
    tile: ["#c98d6a", "#d8cdb8", "#b9bdb6", "#cdb6a0", "#a9b4bc", "#d6a98c"],
    brick: ["#b5714f", "#a9654a", "#c18a64", "#9d5f45"],
    stone: ["#d5ccbd", "#c4baa6", "#bfb7a8", "#d9d0bf"],
    conc: ["#c8c6bf", "#bdbbb4", "#d2d0c8", "#b5b3ac"],
    panel: ["#e7e4dc", "#d8dde0", "#efece4", "#cfd5d9", "#dcd3c3", "#bfc7cc"],
    siding: ["#e5ddcc", "#cfc4ae", "#d6dadb", "#c9b9a0", "#b9c3c8", "#e9e2d4"],
    glass: ["#9fc0d6", "#8fb0c4", "#b6c6d4"],
    metal: ["#aeb8bf", "#c0c6c8", "#9aa6ae", "#b5b8a8"]
  };
  var ROOF_BY_FASHION = [["kawara", "kawara", "tin"], ["kawara", "tin", "kawara"], ["tin", "kawara", "slate"], ["slate", "kawara", "slate", "metal"], ["slate", "metal", "slate"], ["slate", "metal", "solar"]];
  var ROOF_COL = { kawara: ["#3e434d", "#4a4a52", "#6b4a3a", "#7a4a3a", "#3f5a52"], tin: ["#8b4a3a", "#4a6b8a", "#6a7a56", "#8a8a8a"], slate: ["#4f5a6e", "#38465e", "#5a5f66", "#6c4a3a", "#3f6a5a"], metal: ["#4f5a6e", "#6a7076", "#7a2f2f", "#2f4a3a"], solar: ["#2a3550"] };
  var pick = (a, h) => a[h % a.length];
  function archOf(b, sp, year) {
    const fy = facadeYear(b, year), fa = fashionOf(fy);
    const g = GROUP[sp.kind] || "shop";
    const grp = sp.wa ? "wa" : g;
    const h = (n2) => HB(b.idx, 400 + n2);
    const tier2 = b.type === "villa" || sp.kind === "tower" || sp.kind === "hotel" && b.type === "hotel" || b.zone === "tower" || b.zone === "downtown" ? 2 : b.zone === "oldtown" || b.zone === "farm" || b.zone === "shotengai" ? 0 : h(1) % 3;
    let mats = WALL_BY_FASHION[grp][fa];
    let mat = pick(mats, h(2));
    if (grp === "res" || grp === "apt") {
      if (tier2 === 2 && fa >= 2 && h(3) % 2) mat = fa >= 4 ? "stone" : "brick";
      if (tier2 === 0 && fa >= 2 && h(3) % 3 === 0) mat = "mortar";
    }
    if (sp.kind === "civic" && (b.type === "police" || b.type === "fire")) mat = fa >= 3 ? "tile" : "mortar";
    if (b.type === "library" || b.type === "univ") mat = fa <= 3 ? "brick" : "tile";
    if (sp.kind === "tower" || sp.kind === "office" && sp.winSt === "curtain") mat = fa >= 3 ? "glass" : "tile";
    if (sp.wa) mat = sp.wa === "kawara" || sp.wa === "garden" ? "plaster" : sp.wa === "kaya" ? "plank" : sp.wa === "machiya" ? "shitami" : sp.wa === "showa" ? fa >= 2 ? "mortar" : "plank" : fa >= 3 ? "siding" : "plank";
    if (b.type === "ryokan" || b.type === "onsenbath" || b.type === "sento" || b.type === "minshuku") mat = fa <= 2 ? "plank" : h(4) % 2 ? "plaster" : "plank";
    if (b.type === "shrine" || b.type === "temple") mat = "plaster";
    let win = "res";
    if (b.type === "hospital" || b.type === "clinic" || sp.kind === "hosp" || sp.kind === "clinic" || sp.kind === "care") {
      mat = "tile";
      win = "inst";
    } else if (sp.kind === "school" || sp.kind === "kinder") {
      mat = fa <= 3 ? "mortar" : "tile";
      win = "school";
    } else if (sp.kind === "hall") win = "ind";
    else if (grp === "office" || sp.kind === "shop" || sp.kind === "conv" || sp.kind === "super") win = "comm";
    const cols2 = MAT_COL[mat];
    let col = mat === "glass" ? sp.wall : mat === "plank" || mat === "shitami" ? pick(cols2, h(5)) : tier2 === 2 && (mat === "mortar" || mat === "siding" || mat === "panel") ? pick(cols2, h(5) + 1) : pick(cols2, h(5));
    if (sp.kind === "res" && !sp.wa && !(mat === "brick" || mat === "stone" || mat === "tile" || mat === "mosaic")) col = pick(cols2, h(5));
    const wear = Math.max(0, Math.min(1, (year - fy) / 38)) * (tier2 === 2 ? 0.55 : 1);
    const rm = pick(ROOF_BY_FASHION[fa], h(6));
    const rcol = sp.roofCol || pick(ROOF_COL[rm], h(7));
    const frame2 = grp === "wa" ? "wood" : fa === 0 ? "wood" : fa === 1 ? g === "res" ? "wood" : "steel" : fa === 2 ? "alu" : fa === 3 ? h(8) % 2 ? "alu" : "bronze" : fa === 4 ? h(8) % 3 ? "resin" : "black" : h(8) % 2 ? "black" : "resin";
    const frameCol = { wood: "#6a4a30", steel: "#5f6a72", alu: "#c9ced2", bronze: "#4a3a2e", resin: "#f3f3ef", black: "#2c3036" }[frame2];
    const bal = g === "apt" ? fa <= 1 ? "solid" : fa === 2 ? "solid" : fa === 3 ? "rail" : "glass" : sp.kind === "hotel" || sp.kind === "office" && sp.nf <= 6 ? fa >= 3 ? "juliet" : "none" : g === "res" && !sp.wa && sp.nf >= 2 && h(9) % 3 === 0 ? "rail" : "none";
    const shutter = grp === "wa" ? "amado" : g === "res" && fa <= 2 && h(10) % 3 === 0 ? "amado" : g === "res" && fa >= 3 && h(10) % 4 === 0 ? "louver" : tier2 === 2 && g === "res" && h(10) % 2 ? "louver" : null;
    const acRate = fa <= 1 ? 0 : fa === 2 ? 0.1 : fa === 3 ? 0.3 : 0.4;
    const curtain = ["#d9c7a0", "#b9c9d6", "#e6b8b0", "#c8d6b4", "#e8e0c8", "#a9a0c0", "#f0e8d8", "#c0a890"];
    if (win === "inst") col = pick(["#e9eff0", "#e2eaec", "#eef0ea"], h(5));
    else if (win === "school") col = pick(["#e9dfc2", "#dcd4b8", "#ece4cc"], h(5));
    return {
      win,
      fy,
      fa,
      grp,
      mat,
      col,
      tier: tier2,
      wear,
      roofMat: rm,
      roofCol: rcol,
      frame: frame2,
      frameCol,
      bal,
      shutter,
      acRate,
      curtain,
      h,
      sill: fa <= 3 || tier2 >= 1,
      lintel: mat === "brick" || mat === "stone" || mat === "tile" && fa <= 3,
      pipes: grp !== "office" && sp.nf <= 5,
      gutter: sp.roof !== "flat" && sp.roof !== "saw",
      cornice: tier2 >= 1 && (g === "civic" || g === "shop") && fa <= 3,
      eaves: sp.wa ? 0.5 : fa <= 2 ? 0.28 : 0.16,
      grime: wear
    };
  }
  function interiorStyle(b, sp, year) {
    const A2 = archOf(b, sp, year);
    const fa = A2.fa, tier2 = A2.tier;
    const h = (n2) => HB(b.idx, 500 + n2);
    const home = sp.kind === "res" || sp.kind === "apt";
    const wallpaper = home ? fa <= 1 ? "fusuma" : fa === 2 ? ["floral", "stripe", "plain"][h(1) % 3] : fa === 3 ? ["stripe", "plain", "cloth"][h(1) % 3] : ["plain", "cloth", "accent"][h(1) % 3] : tier2 === 2 ? "cloth" : "plain";
    const light = fa <= 1 ? "bulb" : fa === 2 ? "fluor" : fa === 3 ? tier2 === 2 ? "chandelier" : "fluor" : tier2 === 2 ? "down" : "led";
    const floor = b.wa || home && fa <= 1 ? "tatami" : home ? fa <= 2 ? h(2) % 2 ? "wood" : "vinyl" : tier2 === 2 ? "wood" : "vinyl" : tier2 === 2 ? "marble" : "tile";
    const ceiling = fa <= 2 ? "board" : fa === 3 ? "cross" : "white";
    return { fy: A2.fy, fa, tier: tier2, wallpaper, light, floor, ceiling, curtain: A2.curtain[h(3) % A2.curtain.length], wallCol: ["#f1e8d6", "#e8e1cf", "#efe2d0", "#e3e8e6", "#f4efe4", "#dfe5ec"][h(4) % 6], tv: fa <= 1 ? "none" : fa === 2 ? "crt" : fa === 3 ? "crt" : fa === 4 ? "flat" : "flat", clock: h(5) % 3 !== 0, poster: h(6) % 3 === 0 };
  }

