  // src/isobld.js
  var H3 = HB;
  var px = shade;
  var KIT = {
    house: { k: "res", f: [2, 2], roof: "gable", wall: "home" },
    farmhouse: { k: "res", f: [1, 2], roof: "hip", wall: "wood", big: 1 },
    villa: { k: "res", f: [2, 2], roof: "hip", wall: "villa" },
    apt: { k: "apt", f: [3, 4], roof: "flat", wall: "conc" },
    tower: { k: "tower", f: [12, 18], roof: "flat", wall: "glass" },
    shop: { k: "shop", f: [1, 2], roof: "flat", wall: "shop" },
    konbini: { k: "conv", f: [1, 1], roof: "flat", wall: "white" },
    super: { k: "super", f: [1, 2], roof: "flat", wall: "white" },
    mall: { k: "mall", f: [3, 4], roof: "flat", wall: "mall" },
    dept: { k: "dept", f: [7, 8], roof: "flat", wall: "dept" },
    bookstore: { k: "shop", f: [1, 2], roof: "flat", wall: "shop" },
    clothes: { k: "shop", f: [1, 2], roof: "flat", wall: "shop" },
    pharmacy: { k: "shop", f: [1, 2], roof: "flat", wall: "white" },
    fishshop: { k: "shop", f: [1, 1], roof: "shed", wall: "shop" },
    greengrocer: { k: "shop", f: [1, 2], roof: "shed", wall: "shop" },
    liquor: { k: "shop", f: [1, 2], roof: "shed", wall: "wood" },
    homecenter: { k: "super", f: [1, 1], roof: "flat", wall: "orange" },
    directsale: { k: "shop", f: [1, 1], roof: "shed", wall: "wood" },
    cardealer: { k: "cardealer", f: [1, 1], roof: "flat", wall: "white" },
    usedcar: { k: "usedcar", f: [1, 1], roof: "flat", wall: "white" },
    gasstation: { k: "gas", f: [1, 1], roof: "flat", wall: "white" },
    ramen: { k: "eat", f: [1, 2], roof: "gable", wall: "shop" },
    restaurant: { k: "eat", f: [1, 2], roof: "gable", wall: "shop" },
    seafood: { k: "eat", f: [1, 2], roof: "gable", wall: "wood" },
    izakaya: { k: "eat", f: [2, 3], roof: "flat", wall: "dark" },
    cafe: { k: "eat", f: [1, 2], roof: "gable", wall: "cafe" },
    market: { k: "hall", f: [1, 1], roof: "saw", wall: "conc" },
    pier: { k: "pier", f: [1, 1], roof: "flat", wall: "wood" },
    harboroffice: { k: "office", f: [2, 2], roof: "flat", wall: "sea" },
    warehouse: { k: "hall", f: [1, 1], roof: "saw", wall: "steel" },
    factory: { k: "hall", f: [1, 2], roof: "saw", wall: "steel", chim: 1 },
    logistics: { k: "hall", f: [1, 2], roof: "flat", wall: "steel" },
    construction: { k: "shop", f: [1, 2], roof: "shed", wall: "orange" },
    farmcoop: { k: "hall", f: [1, 1], roof: "gable", wall: "green" },
    office: { k: "office", f: [3, 5], roof: "flat", wall: "glass" },
    bank: { k: "bank", f: [2, 3], roof: "flat", wall: "stone" },
    media: { k: "office", f: [3, 4], roof: "flat", wall: "glass" },
    agency: { k: "office", f: [2, 3], roof: "flat", wall: "white" },
    lawfirm: { k: "office", f: [2, 3], roof: "flat", wall: "stone" },
    court: { k: "civic", f: [3, 3], roof: "flat", wall: "stone" },
    cityhall: { k: "civic", f: [3, 4], roof: "flat", wall: "stone", clock: 1 },
    police: { k: "civic", f: [2, 3], roof: "flat", wall: "police" },
    fire: { k: "civic", f: [2, 3], roof: "flat", wall: "fire", tower: 1 },
    library: { k: "civic", f: [2, 2], roof: "flat", wall: "brick" },
    museum: { k: "civic", f: [2, 2], roof: "hip", wall: "stone" },
    hospital: { k: "hosp", f: [3, 5], roof: "flat", wall: "white" },
    clinic: { k: "clinic", f: [2, 3], roof: "flat", wall: "white" },
    nursing: { k: "care", f: [2, 3], roof: "hip", wall: "cream" },
    welfare: { k: "care", f: [2, 2], roof: "hip", wall: "cream" },
    kinder: { k: "kinder", f: [1, 2], roof: "hip", wall: "pastel" },
    elem: { k: "school", f: [3, 3], roof: "flat", wall: "school", clock: 1 },
    jh: { k: "school", f: [3, 4], roof: "flat", wall: "school", clock: 1 },
    hs: { k: "school", f: [3, 4], roof: "flat", wall: "school", clock: 1 },
    univ: { k: "school", f: [3, 5], roof: "flat", wall: "brick", clock: 1 },
    special: { k: "school", f: [2, 3], roof: "flat", wall: "school" },
    cram: { k: "shop", f: [2, 3], roof: "flat", wall: "white" },
    lab: { k: "office", f: [2, 4], roof: "flat", wall: "glass" },
    hotel: { k: "hotel", f: [4, 7], roof: "flat", wall: "hotel" },
    bizhotel: { k: "hotel", f: [4, 6], roof: "flat", wall: "conc" },
    resorthotel: { k: "hotel", f: [4, 7], roof: "flat", wall: "sea" },
    ryokan: { k: "ryokan", f: [2, 2], roof: "hip", wall: "wood" },
    minshuku: { k: "ryokan", f: [1, 2], roof: "gable", wall: "wood" },
    onsenbath: { k: "ryokan", f: [1, 2], roof: "hip", wall: "wood" },
    sento: { k: "ryokan", f: [1, 1], roof: "hip", wall: "wood", chim: 1 },
    cinema: { k: "cinema", f: [2, 3], roof: "flat", wall: "dark" },
    gamecenter: { k: "game", f: [2, 3], roof: "flat", wall: "dark" },
    bowling: { k: "hall", f: [2, 2], roof: "flat", wall: "cream" },
    gym: { k: "hall", f: [2, 2], roof: "shed", wall: "white" },
    aquarium: { k: "hall", f: [2, 2], roof: "flat", wall: "sea" },
    tourtower: { k: "tourtower", f: [1, 1], roof: "flat", wall: "white" },
    edovillage: { k: "ryokan", f: [2, 2], roof: "hip", wall: "wood", big: 1 },
    beachhouse: { k: "eat", f: [1, 1], roof: "shed", wall: "cafe" },
    shrine: { k: "shrine", f: [1, 1], roof: "hip", wall: "wood" },
    temple: { k: "temple", f: [1, 1], roof: "hip", wall: "wood" },
    funeral: { k: "civic", f: [1, 2], roof: "hip", wall: "dark" },
    crematorium: { k: "civic", f: [1, 1], roof: "flat", wall: "dark", chim: 1 },
    station: { k: "station", f: [2, 2], roof: "gable", wall: "station" },
    marina: { k: "hall", f: [1, 1], roof: "shed", wall: "sea" },
    ferry: { k: "hall", f: [1, 2], roof: "shed", wall: "sea" },
    airport: { k: "airport", f: [2, 2], roof: "flat", wall: "white" },
    stadium: { k: "stadium", f: [3, 3], roof: "flat", wall: "white", big: 1 },
    themepark: { k: "hall", f: [2, 2], roof: "gable", wall: "sea" },
    zoo: { k: "hall", f: [1, 2], roof: "shed", wall: "white" },
    cemetery: { k: "yard", f: [0, 0], roof: "flat", wall: "stone" },
    park: { k: "yard", f: [0, 0], roof: "flat", wall: "stone" }
  };
  var PAL = {
    home: [["#f2e6cf", "#c56a4b"], ["#fbfbf6", "#6f7c95"], ["#e9d3b0", "#7a4b3a"], ["#dfe9f1", "#8a5a4a"], ["#f4efe0", "#4d6b57"], ["#f0d8c8", "#5b5f7a"]],
    wood: [["#a77c52", "#4b4a50"], ["#b98d5f", "#6b4a3a"], ["#8f6a45", "#3d4047"]],
    villa: [["#fdf6e8", "#a24c3a"], ["#eef2f6", "#415a7a"], ["#f6e9d8", "#5a7a52"]],
    conc: [["#d9d6cf", "#7b8794"], ["#e8e2d4", "#8a8f9a"], ["#cfd8de", "#6f7d8b"], ["#e7d9cb", "#7c7f86"]],
    glass: [["#9fc0d6", "#6f8696"], ["#b6c6d4", "#7a8794"], ["#8fb0c4", "#63788a"]],
    shop: [["#f0e2c6", "#9a6b4f"], ["#e5dccb", "#7a8794"], ["#f4ead8", "#8d6a58"], ["#dfe4e8", "#6d7b8a"]],
    white: [["#f6f7f4", "#6b7a8d"], ["#eef1f2", "#7c8794"]],
    mall: [["#efe7dd", "#b04a5b"], ["#e7edf2", "#4a7fb0"]],
    dept: [["#e9dccb", "#9b3a3a"], ["#e4e0d8", "#6a4a8a"]],
    orange: [["#f3e4cb", "#e77b2a"], ["#eee7d8", "#e0902f"]],
    dark: [["#4a4650", "#2b2a30"], ["#53473f", "#2f2b2a"]],
    cafe: [["#f3e5cc", "#7a5236"], ["#efe0c7", "#8b4b3c"]],
    sea: [["#e8f1f4", "#2f7fa3"], ["#f5f7f4", "#2d5f8c"]],
    steel: [["#b9c1c8", "#6d7a86"], ["#c9ced2", "#5c6a75"], ["#aeb8bf", "#47617a"]],
    green: [["#e0e8d0", "#4f8a4d"]],
    stone: [["#dcd3c4", "#6b6f78"], ["#e3dccf", "#4a5a6a"], ["#d8d0c0", "#7a6a5a"]],
    police: [["#e8edf2", "#2e4d8a"]],
    fire: [["#eadbd5", "#c33a2f"]],
    brick: [["#b5714f", "#5d6168"], ["#a9654a", "#4d5560"], ["#c18a64", "#5a5f66"]],
    cream: [["#f4ead2", "#6c8f5b"], ["#f1e6cf", "#9a6a4a"]],
    pastel: [["#ffe6ee", "#f08aa3"], ["#fff1c9", "#6ab0d6"], ["#e3f3d9", "#e89a4a"]],
    school: [["#efe9d6", "#5f7ea8"], ["#e8e4d4", "#6a8b5f"], ["#ece6d2", "#a2604f"]],
    hotel: [["#eadfd0", "#2f3f5a"], ["#e5e1db", "#6a3a4f"]],
    station: [["#e9e5da", "#2f6aa8"]]
  };
  var signEra = (year) => year < 1992 ? 0 : year < 2012 ? 1 : 2;
  function baseStoreys(b) {
    const kit = KIT[b.kit || b.type] || { f: [1, 2] };
    let nf = kit.f[0] + (kit.f[1] > kit.f[0] ? H3(b.idx, 11) % (kit.f[1] - kit.f[0] + 1) : 0);
    if (kit.k === "res" && b.type === "house" && b.w * b.h <= 9) nf = 2;
    if (b.type === "apt" && b.w >= 6) nf = Math.max(nf, 4);
    if (b.floors > 1 && nf < 2) nf = 2;
    return nf;
  }
  function storeys(b) {
    return b.nf || baseStoreys(b);
  }
  var LOW_CAP = { tower: 4, office: 3, dept: 4, mall: 2, media: 3, lab: 2, hospital: 3, hotel: 4 };
  var ZONE_ERA = { downtown: [1958, 40], tower: [1972, 38], shotengai: [1950, 90], oldtown: [1950, 100], civic: [1960, 50], campus: [1965, 50], port: [1960, 60], farm: [1950, 120], onsen: [1950, 90], suburb_n: [1962, 55], suburb_e: [1962, 55], suburb_w: [1962, 55] };
  function eraProgress(zone, year) {
    const z = ZONE_ERA[zone] || [1960, 55];
    return Math.max(0, Math.min(1, (year - z[0]) / z[1]));
  }
  function eraFloors(b, year) {
    const base = baseStoreys(b), low = LOW_CAP[b.type];
    if (low == null || base <= low) return base;
    return Math.max(low, Math.round(low + (base - low) * eraProgress(b.zone, year)));
  }
  function bldSpec(b, map2, year) {
    const kit = KIT[b.kit || b.type] || { k: "shop", f: [1, 2], roof: "flat", wall: "shop" };
    const h0 = H3(b.idx, 7), h1 = H3(b.idx, 11), h22 = H3(b.idx, 13), h3 = H3(b.idx, 17);
    const pal = PAL[kit.wall === "glass" && year < 1980 ? "conc" : kit.wall] || PAL.shop;
    const wp2 = pal[h0 % pal.length];
    let nf = kit.f[0] + (kit.f[1] > kit.f[0] ? h1 % (kit.f[1] - kit.f[0] + 1) : 0);
    const area = b.w * b.h;
    if (kit.k === "res" && b.type === "house" && b.w * b.h <= 9) nf = 2;
    if (b.type === "apt" && b.w >= 6) nf = Math.max(nf, 4);
    if (b.floors > 1 && nf < 2) nf = 2;
    if (b.nf) nf = b.nf;
    const ten = [];
    if (b.tenants && b.tenants.length) for (const i of b.tenants) {
      const c = map2.buildings[i];
      if (c) ten.push({ name: c.name, type: c.type, f: c.tfloor || 1, open: c.status !== "closed", idx: c.idx });
    }
    const era = b.era ?? 1;
    let roof = kit.roof;
    if (kit.k === "res" || roof === "gable" || roof === "hip") {
      if (b.type === "house" && h22 % 5 === 0) roof = "hip";
      else if (b.type === "house" && h22 % 5 === 1) roof = "shed";
    }
    const ridgeU = kit.roof === "saw" ? false : b.w >= b.h ? (h3 & 1) === 0 : h3 % 3 === 0;
    const roofCols = ["#b4533c", "#4f5a6e", "#6c4a3a", "#3f6a5a", "#7a7a80", "#a1643e", "#38465e"];
    const rc = kit.k === "res" || kit.roof === "gable" || kit.roof === "hip" ? roofCols[(h1 >>> 3) % roofCols.length] : null;
    const sh3 = kit.k === "tower" || kit.k === "hotel" || kit.k === "office" || kit.k === "hosp" ? 3.2 : kit.k === "res" ? 2.9 : 3.3;
    const gh = ["shop", "conv", "super", "eat", "mall", "dept", "bank", "game", "cinema", "hotel", "tower", "hosp", "clinic", "civic"].includes(kit.k) ? 3.6 : sh3;
    const blocks = [];
    const big = ["office", "tower", "hotel", "hosp", "dept", "mall", "school", "civic", "apt"].includes(kit.k);
    let mass = "box";
    if (big && nf >= 4 && b.w >= 5 && b.h >= 4) {
      const r = (h22 >>> 4) % 10;
      mass = nf >= 7 && b.w >= 6 && b.h >= 5 && r < 4 ? "stepped" : r < 6 ? "podium" : "box";
    }
    const fz = (n2) => n2 <= 0 ? 0 : gh + (n2 - 1) * sh3;
    if (mass === "box") blocks.push({ u0: 0, v0: 0, u1: b.w, v1: b.h, z0: 0, z1: fz(nf), f0: 0, n: nf });
    else if (mass === "podium") {
      const np = Math.min(2, nf - 2);
      blocks.push({ u0: 0, v0: 0, u1: b.w, v1: b.h, z0: 0, z1: fz(np), f0: 0, n: np });
      blocks.push({ u0: 0, v0: 0, u1: b.w - 1, v1: b.h - 1, z0: fz(np), z1: fz(nf), f0: np, n: nf - np });
    } else {
      const np = 2, nm = Math.ceil((nf - 2) / 2);
      blocks.push({ u0: 0, v0: 0, u1: b.w, v1: b.h, z0: 0, z1: fz(np), f0: 0, n: np });
      blocks.push({ u0: 0, v0: 0, u1: b.w - 1, v1: b.h - 1, z0: fz(np), z1: fz(np + nm), f0: np, n: nm });
      blocks.push({ u0: 0, v0: 0, u1: b.w - 2, v1: b.h - 2, z0: fz(np + nm), z1: fz(nf), f0: np + nm, n: nf - np - nm });
    }
    const winSt = kit.k === "office" || kit.k === "tower" ? (year < 1980 ? ["ribbon", "punch", "punch"] : ["ribbon", "curtain", "punch"])[(h1 >>> 6) % 3] : kit.k === "hosp" ? ["ribbon", "punch"][h1 >>> 6 & 1] : kit.k === "hotel" ? ["punch", "ribbon"][h1 >>> 6 & 1] : "punch";
    const wallPat = ["plain", "tile", "brick", "siding", "stripe"][kit.k === "res" ? (h3 >>> 5) % 3 === 0 ? 3 : 0 : kit.k === "apt" ? [1, 0, 4][(h3 >>> 5) % 3] : kit.wall === "brick" ? 2 : kit.wall === "wood" ? 3 : (h3 >>> 5) % 5];
    const WA = b.wa && (b.type === "house" || b.type === "farmhouse") ? b.wa : null;
    let waO = null;
    if (WA) {
      const P2 = { kawara: { wall: "#e8dfc8", trim: "#5a3f2a", roof: "#3e434d", nf: 1 + h1 % 2, pat: 0 }, kaya: { wall: "#8f7552", trim: "#4a3626", roof: "#b39d5f", nf: 1, pat: 3 }, machiya: { wall: "#7d5d41", trim: "#3f2c1d", roof: "#454a52", nf: 2, pat: 3 }, showa: { wall: "#a88e68", trim: "#5a4630", roof: h1 & 1 ? "#7d4a3a" : "#4d525b", nf: 1 + h1 % 2, pat: 3 }, garden: { wall: "#eadfc6", trim: "#4a3322", roof: "#394049", nf: 1 + h1 % 2, pat: 0 }, modern: { wall: "#ddd5c2", trim: "#6a4b32", roof: "#3a3f47", nf: 2, pat: 0 } }[WA];
      waO = P2;
      nf = P2.nf;
      const ins = Math.min(0.55, Math.min(b.w, b.h) * 0.16), shW = 2.75;
      blocks.length = 0;
      blocks.push({ u0: ins, v0: ins, u1: b.w - ins, v1: b.h - ins, z0: 0, z1: nf * shW + 0.25, f0: 0, n: nf });
    }
    if (b.estate === 2) {
      nf = 3;
      const gh2 = 4.2, sh22 = 3.6;
      const fz2 = (n2) => gh2 + (n2 - 1) * sh22;
      blocks.length = 0;
      blocks.push({ u0: 1, v0: 1.5, u1: 8.5, v1: 8, z0: 0, z1: fz2(2), f0: 0, n: 2, roof: "hip", rk: 0.34, nm: "W" });
      blocks.push({ u0: 0.5, v0: 8, u1: 8.5, v1: 11.6, z0: 0, z1: gh2 - 0.6, f0: 0, n: 1, roof: "hip", rk: 0.22, nm: "G", garage: true });
      blocks.push({ u0: 8.5, v0: 1, u1: 19.5, v1: 10.6, z0: 0, z1: fz2(3), f0: 0, n: 3, roof: "hip", rk: 0.3, nm: "C", door: true });
      blocks.push({ u0: 19.5, v0: 1.5, u1: 27, v1: 8, z0: 0, z1: fz2(2), f0: 0, n: 2, roof: "hip", rk: 0.34, nm: "E" });
      blocks.push({ u0: 19.5, v0: 8, u1: 26.4, v1: 10.8, z0: 0, z1: gh2 - 0.4, f0: 0, n: 1, roof: "glass", rk: 0.1, nm: "S", sun: true });
      blocks.sort((p, q) => p.u0 + p.u1 + p.v0 + p.v1 - (q.u0 + q.u1 + q.v0 + q.v1));
    } else if (b.estate) {
      nf = 2;
      blocks.length = 0;
      const ew = b.w, eh = b.h;
      blocks.push({ u0: 1.6, v0: 0.9, u1: ew - 1.4, v1: eh - 2.7, z0: 0, z1: gh + 3.2, f0: 0, n: 2 });
      if (b.w >= 8) blocks.push({ u0: ew - 3.6, v0: 1.2, u1: ew - 1.4, v1: eh - 2.7, z0: gh + 3.2, z1: gh + 6, f0: 2, n: 1 });
    }
    const waRoof = WA ? WA === "machiya" ? "gable" : "hip" : null;
    return { kit, wa: WA, es: b.estate === 2 ? 2 : !!b.estate, waO, kind: kit.k, blocks, mass, winSt, wallPat: waO ? ["plain", "tile", "brick", "siding", "stripe"][waO.pat] : wallPat, wall: waO ? waO.wall : wp2[0], trim: waO ? waO.trim : wp2[1], nf, sh: waO ? 2.75 : b.estate === 2 ? 3.6 : sh3, gh: waO ? 2.75 : b.estate === 2 ? 4.2 : gh, roof: waRoof || (b.estate ? "hip" : roof), ridgeU: waO ? WA === "machiya" ? false : ridgeU : ridgeU, roofCol: waO ? waO.roof : rc || (kit.k === "ryokan" ? "#4a4a52" : null), ten, era, h0, h1, h2: h22, h3, year, big: !!kit.big, chim: !!kit.chim, clock: !!kit.clock, closed: b.status === "closed" };
  }
  function bldHeight(sp, b) {
    return sp.nf <= 0 ? 0 : sp.blocks[sp.blocks.length - 1].z1;
  }
  var BldCache = class {
    constructor() {
      this.m = /* @__PURE__ */ new Map();
      this.stamp = 0;
      this.px = 0;
      this.R = 0;
    }
    key(b, R5, year) {
      return `${b.idx}|${R5}|${b.nf || 0}|${b.era}|${b.name}|${b.status}|${signEra(year)}|${facadeYear(b, year)}`;
    }
    get(b, map2, R5, year) {
      if (this.R !== R5) {
        this.m.clear();
        this.px = 0;
        this.R = R5;
      }
      const k = this.key(b, R5, year);
      let e = this.m.get(k);
      if (e) {
        e.t = ++this.stamp;
        return e;
      }
      e = renderBuilding(b, map2, R5, year);
      e.t = ++this.stamp;
      e.k = k;
      this.m.set(k, e);
      this.px += e.cv.width * e.cv.height * 2;
      if (this.px > 6e7) this.evict();
      return e;
    }
    evict() {
      const a = [...this.m.entries()].sort((p, q) => p[1].t - q[1].t);
      for (let i = 0; i < a.length * 0.4; i++) {
        const e = a[i][1];
        this.px -= e.cv.width * e.cv.height * 2;
        this.m.delete(a[i][0]);
      }
    }
    // 夜用レイヤー(遅延生成)
    lit(e) {
      if (!e.litCv) e.litCv = renderLit(e);
      return e.litCv;
    }
  };
  function renderBuilding(b, map2, R5, year) {
    const sp = bldSpec(b, map2, year);
    const w = b.w, h = b.h;
    const Hm = bldHeight(sp, b);
    sp.arch = archOf(b, sp, year);
    if (!sp.wa && sp.arch.mat !== "glass") sp.wall = sp.arch.col;
    else if (sp.wa) sp.arch.col = sp.wall;
    if (sp.roofCol && !sp.wa) sp.roofCol = sp.arch.roofCol;
    const tb0 = sp.blocks[sp.blocks.length - 1];
    const mwh = sp.es ? Math.min(tb0.u1 - tb0.u0, tb0.v1 - tb0.v0) : Math.min(w, h);
    const rh = sp.roof === "gable" || sp.roof === "hip" || sp.roof === "pagoda" ? mwh * 0.5 * 1.25 * (sp.wa === "kaya" ? 1.3 : sp.wa ? 0.8 : 1) : sp.roof === "shed" ? 0.9 : sp.roof === "saw" ? 1.6 : 0.5;
    const hasRoofSign = sp.kind === "super" || sp.kind === "mall" || sp.kind === "dept" || sp.kind === "hotel" || sp.kind === "game" || sp.kind === "cinema";
    const extra = (hasRoofSign ? 3.6 : 1.2) + (sp.kind === "yard" ? 2.2 : 0) + (sp.kind === "tourtower" ? 60 : sp.kind === "ctower" ? 18 : 0) + (SPECIAL.has(sp.kind) ? 5 : 0) + (sp.chim ? 6 : 0) + (sp.clock ? 3 : 0);
    const padT = (Hm + rh + extra) * 12 * R5, padL = 8 * R5, padR = 8 * R5, padB = 8 * R5;
    const cw = Math.ceil((w + h) * 16 * R5 + padL + padR), ch = Math.ceil((w + h) * 8 * R5 + padT + padB);
    const ax = Math.ceil(h * 16 * R5 + padL), ay = Math.ceil(padT);
    const cv2 = document.createElement("canvas");
    cv2.width = cw;
    cv2.height = ch;
    const ctx4 = cv2.getContext("2d");
    const e = { cv: cv2, ax, ay, R: R5, w, h, b, sp, Hm, rh, cw, ch };
    paint(ctx4, e, "day");
    return e;
  }
  function renderLit(e) {
    const cv2 = document.createElement("canvas");
    cv2.width = Math.ceil(e.cw / 2);
    cv2.height = Math.ceil(e.ch / 2);
    const ctx4 = cv2.getContext("2d");
    ctx4.drawImage(e.cv, 0, 0, cv2.width, cv2.height);
    ctx4.globalCompositeOperation = "source-in";
    ctx4.fillStyle = "#000";
    ctx4.fillRect(0, 0, cv2.width, cv2.height);
    ctx4.globalCompositeOperation = "source-over";
    ctx4.scale(0.5, 0.5);
    paint(ctx4, e, "lit");
    ctx4.setTransform(1, 0, 0, 1, 0, 0);
    return cv2;
  }
  function paint(ctx4, e, mode2) {
    const { b, sp, w, h, R: R5, ax, ay } = e;
    const day = mode2 === "day";
    const L2 = !day;
    const P2 = (u, v, z) => [ax + (u - v) * 16 * R5, ay + (u + v) * 8 * R5 - z * 12 * R5];
    const poly7 = (pts, fill, stroke, lw) => {
      ctx4.beginPath();
      pts.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
      ctx4.closePath();
      if (fill) {
        ctx4.fillStyle = fill;
        ctx4.fill();
      }
      if (stroke) {
        ctx4.strokeStyle = stroke;
        ctx4.lineWidth = lw || 1;
        ctx4.stroke();
      }
    };
    const Hm = e.Hm;
    const wall = sp.wall, trim = sp.trim;
    const S_ = 0.9, E_ = 0.7;
    const doorU = Math.max(0.5, Math.min(w - 0.5, b.doorX - b.x + 0.5));
    const rng = (() => {
      let s = (H3(b.idx, 99) | 1) >>> 0;
      return () => {
        s ^= s << 13;
        s >>>= 0;
        s ^= s >> 17;
        s ^= s << 5;
        s >>>= 0;
        return s / 4294967296;
      };
    })();
    const plan = signPlan(b, sp, map_year(sp));
    e.plan = plan;
    const top = sp.blocks[sp.blocks.length - 1];
    e.top = top;
    const base = ctx4.getTransform();
    const south = (fn, u0 = 0, v = h, z = 0) => {
      ctx4.save();
      const p = P2(u0, v, z);
      ctx4.setTransform(base);
      ctx4.transform(1, 0.5, 0, 1, p[0], p[1]);
      fn();
      ctx4.restore();
    };
    const east = (u, fn, v0 = h, z = 0) => {
      ctx4.save();
      const p = P2(u, v0, z);
      ctx4.setTransform(base);
      ctx4.transform(1, -0.5, 0, 1, p[0], p[1]);
      fn();
      ctx4.restore();
    };
    const T4 = 16 * R5, M = 12 * R5;
    const kind = sp.kind;
    if (kind === "yard" || sp.nf <= 0) {
      paintYard(ctx4, e, P2, poly7, mode2);
      return;
    }
    if (SPECIAL.has(kind)) {
      paintSpecial(ctx4, e, P2, poly7, mode2, px);
      paintSigns(ctx4, e, P2, poly7, mode2, { south, east, doorU });
      return;
    }
    if (day && sp.es) paintEstateGround(ctx4, e, P2, poly7);
    else if (day && sp.wa) paintWaGround(ctx4, e, P2, poly7);
    else if (day) poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "rgba(60,70,50,0.35)");
    if (sp.es === 2) {
      paintMansion(ctx4, e, P2, poly7, mode2, { south, east, doorU, T: T4, M, rng, L: L2 });
      paintSigns(ctx4, e, P2, poly7, mode2, { south, east, doorU });
      return;
    }
    const wallS = px(wall, S_), wallE = px(wall, E_);
    sp.blocks.forEach((bl, bi) => {
      const isTop = bi === sp.blocks.length - 1;
      if (day) {
        poly7([P2(bl.u0, bl.v1, bl.z0), P2(bl.u1, bl.v1, bl.z0), P2(bl.u1, bl.v1, bl.z1), P2(bl.u0, bl.v1, bl.z1)], wallS);
        poly7([P2(bl.u1, bl.v1, bl.z0), P2(bl.u1, bl.v0, bl.z0), P2(bl.u1, bl.v0, bl.z1), P2(bl.u1, bl.v1, bl.z1)], wallE);
      }
      south(() => facade(ctx4, e, "S", { T: T4, M, rng, mode: mode2, L: L2, bl, doorU: doorU - bl.u0 }), bl.u0, bl.v1, bl.z0);
      east(bl.u1, () => facade(ctx4, e, "E", { T: T4, M, rng, mode: mode2, L: L2, bl, doorU: 0 }), bl.v1, bl.z0);
      if (!isTop && day) {
        poly7([P2(bl.u0, bl.v0, bl.z1), P2(bl.u1, bl.v0, bl.z1), P2(bl.u1, bl.v1, bl.z1), P2(bl.u0, bl.v1, bl.z1)], "#cfd0cb");
        poly7([P2(bl.u0, bl.v1, bl.z1), P2(bl.u1, bl.v1, bl.z1), P2(bl.u1, bl.v1, bl.z1 + 0.35), P2(bl.u0, bl.v1, bl.z1 + 0.35)], px(wall, 0.95));
        poly7([P2(bl.u1, bl.v1, bl.z1), P2(bl.u1, bl.v0, bl.z1), P2(bl.u1, bl.v0, bl.z1 + 0.35), P2(bl.u1, bl.v1, bl.z1 + 0.35)], px(wall, 0.72));
      }
    });
    if (day) {
      ctx4.strokeStyle = px(trim, 0.8);
      ctx4.lineWidth = Math.max(1, R5);
      ctx4.beginPath();
      const p02 = P2(0, h, 0.08), p1 = P2(w, h, 0.08);
      ctx4.moveTo(p02[0], p02[1]);
      ctx4.lineTo(p1[0], p1[1]);
      ctx4.stroke();
    }
    paintRoof(ctx4, e, P2, poly7, mode2);
    roofExtras(ctx4, e, P2, poly7, mode2);
    if (sp.wa && day) paintWaFence(ctx4, e, P2, poly7, doorU);
    if (sp.es && day) paintEstateFront(ctx4, e, P2, poly7, doorU);
    if (day && (kind === "station" || kind === "hosp" || kind === "hotel" || kind === "civic" && w >= 5) && w >= 4) paintCanopy(ctx4, e, P2, poly7, doorU, kind === "station" ? Math.min(5, w - 1) : 3, kind === "station" ? 1 : 0.9, kind === "station" ? 3.4 : 3.2, kind === "station" ? "#4f6f8f" : "#6b7280", kind !== "civic");
    paintSigns(ctx4, e, P2, poly7, mode2, { south, east, doorU });
  }
  function map_year(sp) {
    return sp.year;
  }
  function facade(ctx4, e, side, o) {
    const { b, sp } = e;
    const { T: T4, M, rng, mode: mode2, L: L2, bl } = o;
    const R5 = e.R;
    const day = !L2;
    const w = side === "S" ? bl.u1 - bl.u0 : bl.v1 - bl.v0;
    const doorU = o.doorU;
    const Wp = w * T4;
    const Ht = (bl.z1 - bl.z0) * M;
    const kind = sp.kind;
    const closed = sp.closed;
    const gh = sp.gh, sh3 = sp.sh;
    const st3 = sp.winSt;
    const lit = (p) => !closed && rng() < p;
    const winCol = side === "S" ? "#bfe0f2" : "#9fc4da";
    const glassG = (x, y, ww, hh) => {
      const g = ctx4.createLinearGradient(x, y - hh, x, y);
      g.addColorStop(0, side === "S" ? "#cfe6f3" : "#a9cde0");
      g.addColorStop(1, side === "S" ? "#9cc3dc" : "#80a9c2");
      return g;
    };
    let winN = 0;
    const A0 = sp.arch;
    const drawWin = (x, y, ww, hh, litP, frame2) => {
      const isLit = lit(litP);
      if (day && sp.wa) {
        const sw = ww * 1.25, sx = x - ww * 0.12;
        ctx4.fillStyle = "#4a3624";
        ctx4.fillRect(sx - 1.5, y - hh - 1.5, sw + 3, hh + 3);
        ctx4.fillStyle = side === "S" ? "#f3eedb" : "#d9d3bd";
        ctx4.fillRect(sx, y - hh, sw, hh);
        ctx4.strokeStyle = "#6b5238";
        ctx4.lineWidth = 1;
        ctx4.beginPath();
        for (let k = 1; k < 4; k++) {
          const xx = sx + sw * k / 4;
          ctx4.moveTo(xx, y - hh);
          ctx4.lineTo(xx, y);
        }
        for (let k = 1; k < 3; k++) {
          const yy = y - hh + hh * k / 3;
          ctx4.moveTo(sx, yy);
          ctx4.lineTo(sx + sw, yy);
        }
        ctx4.stroke();
      } else if (day) {
        winN++;
        paintWindow(ctx4, e, A2, side, x, y, ww, hh, 900 + winN * 7 + (side === "S" ? 0 : 3e3) + bl.f0 * 131, { ac: kind === "res" || kind === "apt", dim: false });
      } else if (isLit) {
        ctx4.fillStyle = "rgba(255,214,120,0.95)";
        ctx4.fillRect(x, y - hh, ww, hh);
      }
    };
    const A2 = sp.arch;
    if (day) paintWallMat(ctx4, e, A2, Wp, Ht, T4, M, side, bl);
    const floors = [];
    {
      let z = 0;
      for (let i = 0; i < bl.n; i++) {
        const f2 = bl.f0 + i;
        const hh = f2 === 0 ? gh : sh3;
        floors.push({ f: f2, z, h: hh });
        z += hh;
      }
    }
    const tallKind = kind === "tower" || kind === "office" || kind === "hotel" || kind === "hosp";
    const bay = tallKind ? 0.55 : kind === "res" ? 0.95 : 0.8;
    const nb = Math.max(1, Math.round(w / (bay + (kind === "res" ? 0.35 : 0.25))));
    const bw = w / nb;
    for (const fl of floors) {
      if (fl.f === 0) continue;
      const z0 = fl.z;
      if (day && (kind === "apt" || tallKind || kind === "dept" || kind === "mall" || kind === "school")) {
        ctx4.fillStyle = px(sp.trim, side === "S" ? 0.95 : 0.78);
        ctx4.fillRect(0, -z0 * M - 2, Wp, 3);
      }
      if (st3 === "curtain" && tallKind) {
        if (day) {
          ctx4.fillStyle = glassG(0, -z0 * M, Wp, fl.h * M);
          ctx4.fillRect(0.06 * T4, -(z0 + fl.h - 0.35) * M, Wp - 0.12 * T4, (fl.h - 0.5) * M);
          ctx4.strokeStyle = "rgba(70,95,115,0.7)";
          ctx4.lineWidth = 1;
          for (let i = 0; i <= nb; i++) {
            const x = 0.06 * T4 + i * (Wp - 0.12 * T4) / nb;
            ctx4.beginPath();
            ctx4.moveTo(x, -(z0 + fl.h - 0.35) * M);
            ctx4.lineTo(x, -(z0 + 0.15) * M);
            ctx4.stroke();
          }
          ctx4.fillStyle = "rgba(255,255,255,0.16)";
          ctx4.fillRect(0.06 * T4, -(z0 + fl.h - 0.35) * M, (Wp - 0.12 * T4) * 0.35, (fl.h - 0.5) * M * 0.5);
        } else for (let i = 0; i < nb; i++) if (lit(0.4)) {
          ctx4.fillStyle = "rgba(255,214,120,0.9)";
          ctx4.fillRect(0.06 * T4 + i * (Wp - 0.12 * T4) / nb + 1, -(z0 + fl.h - 0.35) * M, (Wp - 0.12 * T4) / nb - 2, (fl.h - 0.5) * M);
        }
        continue;
      }
      if (st3 === "ribbon" && tallKind) {
        const y1 = -(z0 + 0.8) * M, hh = 1.6 * M;
        if (day) {
          ctx4.fillStyle = px(sp.trim, 0.9);
          ctx4.fillRect(0.05 * T4, y1 - hh - 1, Wp - 0.1 * T4, hh + 2);
          ctx4.fillStyle = glassG(0, y1, Wp, hh);
          ctx4.fillRect(0.05 * T4 + 1, y1 - hh, Wp - 0.1 * T4 - 2, hh);
          ctx4.fillStyle = "rgba(70,95,115,0.6)";
          for (let i = 1; i < nb; i++) ctx4.fillRect(i * Wp / nb - 0.5, y1 - hh, 1.2, hh);
          ctx4.fillStyle = "rgba(255,255,255,0.18)";
          ctx4.fillRect(0.05 * T4 + 1, y1 - hh, (Wp - 0.1 * T4) * 0.3, hh * 0.5);
        } else for (let i = 0; i < nb; i++) if (lit(0.4)) {
          ctx4.fillStyle = "rgba(255,214,120,0.9)";
          ctx4.fillRect(i * Wp / nb + 1, y1 - hh, Wp / nb - 2, hh);
        }
        continue;
      }
      const tn = 0;
      void tn;
      for (let i = 0; i < nb; i++) {
        const x = (i + 0.5) * bw * T4 - (tallKind ? bw * T4 * 0.4 : bw * T4 * 0.28);
        const ww = tallKind ? bw * T4 * 0.8 : bw * T4 * 0.56;
        const hh = (tallKind ? 1.9 : kind === "res" ? 1.2 : 1.35) * M;
        const sill = z0 + (tallKind ? 0.7 : 0.9);
        if ((kind === "apt" || A2.bal !== "none") && side === "S" && A2.bal !== "none" && kind !== "hotel" || kind === "hotel" && A2.bal === "juliet" && side === "S") {
          drawWin(x, -sill * M, ww * 0.9, hh * 0.95, 0.35);
          if (day) paintBalcony(ctx4, e, A2, x, -z0 * M, ww * 0.9, 1500 + i * 17 + fl.f * 131);
        } else drawWin(x, -sill * M, ww, hh, kind === "res" ? 0.28 : 0.45);
      }
    }
    const gf = floors.find((f2) => f2.f === 0);
    if (gf) {
      if (side === "S") groundFloor(ctx4, e, { T: T4, M, w, doorU, mode: mode2, L: L2 }, drawWin, nb, bw);
      else {
        const nbe = Math.max(1, Math.round(w / 1.2));
        for (let i = 0; i < nbe; i++) {
          const x = (i + 0.5) * (w / nbe) * T4 - 0.3 * T4;
          const hh = (kind === "conv" || kind === "super" || kind === "shop" ? 1.5 : 1.3) * M;
          drawWin(x, -0.9 * M, 0.6 * T4, hh, 0.3);
        }
        if (day && kind === "hall") {
          ctx4.fillStyle = px(sp.wall, 0.8);
          for (let i = 0; i < 3; i++) ctx4.fillRect(i * Wp / 3, -2.4 * M, 2, 2.4 * M);
        }
      }
    }
    if (day) {
      ctx4.fillStyle = px(sp.trim, side === "S" ? 1 : 0.8);
      ctx4.fillRect(0, -Ht, Wp, 3 + R5);
      paintPipes(ctx4, e, A2, Wp, Ht, side, M, T4);
    }
    if (day && (b.type === "ryokan" || b.type === "minshuku" || b.type === "sento" || b.type === "onsenbath") && (sp.nf || 1) >= 1) {
      const gz2 = (sp.gh || 3.3) * M;
      const col = A2.roofCol || "#4a4a52";
      const ov = 0.5 * M;
      if ((sp.nf || 1) >= 2) {
        ctx4.fillStyle = px(col, side === "S" ? 1 : 0.75);
        ctx4.beginPath();
        ctx4.moveTo(-ov * 0.4, -gz2 + 0.2 * M);
        ctx4.lineTo(Wp + ov * 0.4, -gz2 + 0.2 * M);
        ctx4.lineTo(Wp + ov * 0.4, -gz2 - 0.18 * M);
        ctx4.lineTo(-ov * 0.4, -gz2 - 0.18 * M);
        ctx4.closePath();
        ctx4.fill();
        ctx4.strokeStyle = px(col, 0.55);
        ctx4.lineWidth = Math.max(1, R5 * 0.6);
        ctx4.beginPath();
        for (let u = 0; u < Wp; u += 0.55 * T4) {
          ctx4.moveTo(u, -gz2 - 0.18 * M);
          ctx4.lineTo(u, -gz2 + 0.2 * M);
        }
        ctx4.stroke();
        ctx4.fillStyle = "rgba(0,0,0,0.22)";
        ctx4.fillRect(0, -gz2 + 0.2 * M, Wp, 0.35 * M);
      }
      ctx4.strokeStyle = side === "S" ? "rgba(70,42,20,0.55)" : "rgba(50,30,14,0.5)";
      ctx4.lineWidth = Math.max(0.8, R5 * 0.7);
      ctx4.beginPath();
      for (let u = 0.12 * T4; u < Wp; u += 0.2 * T4) {
        if (side === "S" && Math.abs(u - doorU * T4) < 0.9 * T4) continue;
        ctx4.moveTo(u, -0.15 * M);
        ctx4.lineTo(u, -gz2 + 0.45 * M);
      }
      ctx4.stroke();
      ctx4.beginPath();
      ctx4.moveTo(0, -gz2 * 0.55);
      ctx4.lineTo(Wp, -gz2 * 0.55);
      ctx4.stroke();
    }
  }
  function groundFloor(ctx4, e, o, drawWin, nb, bw) {
    const { b, sp } = e;
    const { T: T4, M, w, doorU, mode: mode2, L: L2 } = o;
    const day = !L2;
    const kind = sp.kind;
    const Wp = w * T4;
    const gh = sp.gh;
    const closed = sp.closed;
    const shopLike = ["shop", "conv", "super", "eat", "mall", "dept", "bank", "game", "cinema", "clinic", "hotel", "hosp", "civic", "office", "tower", "hall", "care", "kinder", "school", "station", "cinema", "ryokan"].includes(kind);
    const dx = doorU * T4;
    const dw = (kind === "res" ? 0.55 : 0.9) * T4 * (kind === "super" || kind === "dept" || kind === "mall" || kind === "hosp" ? 1.3 : 1);
    const glassKinds = ["conv", "super", "shop", "mall", "dept", "game", "eat", "clinic"].includes(kind);
    if (day) {
      ctx4.fillStyle = px(sp.trim, 0.85);
      ctx4.fillRect(0, -0.35 * M, Wp, 0.35 * M);
    }
    if (glassKinds) {
      const gy = -0.45 * M, gh1 = (gh - 1.35) * M;
      const gx0 = 0.12 * T4, gx1 = Wp - 0.12 * T4;
      if (day) {
        if (closed) {
          ctx4.fillStyle = "#9aa2a8";
          ctx4.fillRect(gx0, gy - gh1, gx1 - gx0, gh1);
          ctx4.strokeStyle = "#838b91";
          ctx4.lineWidth = 1;
          for (let y = 0; y < gh1; y += 3) {
            ctx4.beginPath();
            ctx4.moveTo(gx0, gy - y);
            ctx4.lineTo(gx1, gy - y);
            ctx4.stroke();
          }
        } else {
          ctx4.fillStyle = px(sp.trim, 0.7);
          ctx4.fillRect(gx0 - 1, gy - gh1 - 1, gx1 - gx0 + 2, gh1 + 2);
          ctx4.fillStyle = "#cfe8f5";
          ctx4.fillRect(gx0, gy - gh1, gx1 - gx0, gh1);
          ctx4.fillStyle = "rgba(255,255,255,0.45)";
          ctx4.beginPath();
          ctx4.moveTo(gx0, gy - gh1);
          ctx4.lineTo(gx0 + (gx1 - gx0) * 0.3, gy - gh1);
          ctx4.lineTo(gx0 + (gx1 - gx0) * 0.12, gy);
          ctx4.lineTo(gx0, gy);
          ctx4.fill();
          const nm = Math.max(1, Math.round((gx1 - gx0) / (0.9 * T4)));
          ctx4.fillStyle = "rgba(70,90,110,0.55)";
          for (let i = 1; i < nm; i++) ctx4.fillRect(gx0 + (gx1 - gx0) * i / nm - 0.5, gy - gh1, 1.2, gh1);
        }
      } else if (!closed) {
        ctx4.fillStyle = kind === "conv" || kind === "super" ? "rgba(255,248,214,0.95)" : kind === "eat" ? "rgba(255,210,140,0.85)" : "rgba(255,236,180,0.8)";
        ctx4.fillRect(gx0, gy - gh1, gx1 - gx0, gh1);
      }
      if (day) {
        ctx4.fillStyle = closed ? "#7a8288" : "#dff1fb";
        ctx4.fillRect(dx - dw / 2, gy - 2.1 * M, dw, 2.1 * M);
        ctx4.strokeStyle = px(sp.trim, 0.6);
        ctx4.lineWidth = 1.2;
        ctx4.strokeRect(dx - dw / 2, gy - 2.1 * M, dw, 2.1 * M);
        ctx4.beginPath();
        ctx4.moveTo(dx, gy - 2.1 * M);
        ctx4.lineTo(dx, gy);
        ctx4.stroke();
      }
      if (day && (kind === "shop" || kind === "eat" || kind === "conv") && sp.h2 % 3 !== 0) {
        const ac = ["#d94b4b", "#3f7fc4", "#3da36a", "#e0a23a", "#8d5fc0"][sp.h1 % 5];
        ctx4.fillStyle = ac;
        ctx4.beginPath();
        ctx4.moveTo(gx0, gy - gh1 - 0.05 * M);
        ctx4.lineTo(gx1, gy - gh1 - 0.05 * M);
        ctx4.lineTo(gx1 + 2, gy - gh1 + 0.55 * M);
        ctx4.lineTo(gx0 - 2, gy - gh1 + 0.55 * M);
        ctx4.fill();
        ctx4.fillStyle = "rgba(255,255,255,0.5)";
        for (let x = gx0; x < gx1; x += 0.5 * T4) ctx4.fillRect(x, gy - gh1 - 0.05 * M, 0.25 * T4, 0.6 * M);
      }
    } else {
      const nbg = Math.max(1, Math.round(w / 1));
      for (let i = 0; i < nbg; i++) {
        const x = (i + 0.5) * (w / nbg) * T4 - 0.3 * T4;
        if (Math.abs(x + 0.3 * T4 - dx) < 0.55 * T4) continue;
        drawWin(x, -(kind === "res" ? 0.9 : 0.8) * M, 0.6 * T4, (kind === "hall" ? 1 : 1.35) * M, 0.25);
      }
      if (day) {
        const dh = 2.1 * M;
        ctx4.fillStyle = closed || kind === "res" ? px(sp.trim, 1) : "#dff1fb";
        ctx4.fillRect(dx - dw / 2, -dh, dw, dh);
        ctx4.strokeStyle = px(sp.trim, 0.55);
        ctx4.lineWidth = 1.4;
        ctx4.strokeRect(dx - dw / 2, -dh, dw, dh);
        if (kind !== "res") {
          ctx4.beginPath();
          ctx4.moveTo(dx, -dh);
          ctx4.lineTo(dx, 0);
          ctx4.stroke();
        } else {
          ctx4.fillStyle = "#e8c04a";
          ctx4.fillRect(dx + dw * 0.25, -dh * 0.5, 2, 2);
        }
        ctx4.fillStyle = px(sp.trim, 0.9);
        ctx4.fillRect(dx - dw / 2 - 3, -dh - 0.35 * M, dw + 6, 0.3 * M);
        if (kind === "civic" || kind === "bank" || kind === "school" || kind === "hosp") {
          ctx4.fillStyle = px(sp.wall, 1.1);
          ctx4.fillRect(dx - dw / 2 - 5, -dh - 0.6 * M, 4, dh + 0.6 * M);
          ctx4.fillRect(dx + dw / 2 + 1, -dh - 0.6 * M, 4, dh + 0.6 * M);
        }
      } else if (!closed && kind !== "res") {
        ctx4.fillStyle = "rgba(255,240,190,0.85)";
        ctx4.fillRect(dx - dw / 2, -2.1 * M, dw, 2.1 * M);
      }
    }
    void shopLike;
  }
  function paintRoof(ctx4, e, P0, poly7, mode2) {
    if (mode2 !== "day") return;
    const { sp, R: R5 } = e;
    const T0 = e.top;
    const w = T0.u1 - T0.u0, h = T0.v1 - T0.v0, Hm = T0.z1;
    const P2 = (u, v, z) => P0(u + T0.u0, v + T0.v0, z);
    const rt = sp.roof;
    const col = sp.roofCol || "#6f7d8b";
    const ov = sp.wa ? 0.5 : 0.12;
    if (rt === "flat" || rt === "saw" && false) {
      const par = 0.5;
      poly7([P2(0, 0, Hm), P2(w, 0, Hm), P2(w, h, Hm), P2(0, h, Hm)], sp.kind === "tower" || sp.kind === "office" ? "#c5ccd2" : "#d6d6d0");
      poly7([P2(0, h, Hm), P2(w, h, Hm), P2(w, h, Hm + par), P2(0, h, Hm + par)], px(sp.wall, 0.95));
      poly7([P2(w, h, Hm), P2(w, 0, Hm), P2(w, 0, Hm + par), P2(w, h, Hm + par)], px(sp.wall, 0.72));
      poly7([P2(0, 0, Hm + par), P2(w, 0, Hm + par), P2(w, h, Hm + par), P2(0, h, Hm + par)], null, "rgba(255,255,255,0.35)", 1);
      const nx = Math.min(3, Math.max(1, Math.floor(w * h / 12)));
      for (let i = 0; i < nx; i++) {
        const u = 0.8 + (sp.h0 >>> i * 3) % 100 / 100 * Math.max(0.1, w - 2.4), v = 0.8 + (sp.h1 >>> i * 3) % 100 / 100 * Math.max(0.1, h - 2.4);
        box(ctx4, P2, u, v, 0.8, 0.6, Hm + par, 0.9, i % 2 ? "#b9c0c6" : "#9aa5ad");
      }
      if (sp.kind === "apt" || sp.kind === "tower" || sp.kind === "hotel") box(ctx4, P2, w * 0.62, h * 0.25, 1, 1, Hm + par, 1.8, "#a9b3b9");
    } else if (rt === "saw") {
      poly7([P2(0, 0, Hm), P2(w, 0, Hm), P2(w, h, Hm), P2(0, h, Hm)], "#aeb6bb");
      const n2 = Math.max(2, Math.round(w / 1.6));
      for (let i = 0; i < n2; i++) {
        const u0 = i * w / n2, u1 = (i + 1) * w / n2;
        poly7([P2(u0, h, Hm), P2(u1, h, Hm), P2(u1, h, Hm + 1.2), P2(u0, h, Hm)], px("#8c96a0", 0.95));
        poly7([P2(u0, 0, Hm), P2(u0, h, Hm), P2(u1, h, Hm + 1.2), P2(u1, 0, Hm + 1.2)], px(col, 1));
      }
      if (sp.chim) {
        box(ctx4, P2, w * 0.8, h * 0.2, 0.9, 0.9, Hm, 7, "#a77b6a");
      }
    } else if (rt === "shed") {
      const rh = 0.9;
      poly7([P2(0, h, Hm), P2(w, h, Hm), P2(w, 0, Hm + rh), P2(0, 0, Hm + rh)], px(col, 0.98));
      poly7([P2(w, h, Hm), P2(w, 0, Hm), P2(w, 0, Hm + rh)], px(col, 0.7));
    } else {
      const rh = e.rh;
      const o2 = ov;
      if (rt === "gable" || rt === "pagoda") {
        if (sp.ridgeU) {
          poly7([P2(w, h, Hm), P2(w, 0, Hm), P2(w, h / 2, Hm + rh)], px(sp.wall, 0.72));
          poly7([P2(-o2, h + o2, Hm - 0.1), P2(w + o2, h + o2, Hm - 0.1), P2(w + o2, h / 2, Hm + rh), P2(-o2, h / 2, Hm + rh)], px(col, 1));
          poly7([P2(w + o2, h + o2, Hm - 0.1), P2(w + o2, h / 2, Hm + rh), P2(w + o2, h / 2 - 0, Hm + rh)], px(col, 0.7));
          {
            const am = sp.arch && sp.arch.roofMat;
            if (am && !sp.wa) roofTex(ctx4, P2, [-o2, h + o2, Hm - 0.1], [w + o2, h + o2, Hm - 0.1], [-o2, h / 2, Hm + rh], am, col, R5, e.b.idx * 31 + 7, sp.arch.wear);
            else tileLines(ctx4, P2, [-o2, h + o2, Hm - 0.1], [w + o2, h + o2, Hm - 0.1], [-o2, h / 2, Hm + rh], 7, px(col, 0.82));
          }
          const a = P2(-o2, h / 2, Hm + rh), b = P2(w + o2, h / 2, Hm + rh);
          ctx4.strokeStyle = px(col, 1.18);
          ctx4.lineWidth = Math.max(1.5, R5 * 1.3);
          ctx4.beginPath();
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(b[0], b[1]);
          ctx4.stroke();
          poly7([P2(w + o2, h + o2, Hm - 0.1), P2(w + o2, 0 - o2, Hm - 0.1), P2(w + o2, h / 2, Hm + rh)], px(col, 0.72));
        } else {
          poly7([P2(0, h, Hm), P2(w, h, Hm), P2(w / 2, h, Hm + rh)], px(sp.wall, 0.9));
          poly7([P2(w + o2, h + o2, Hm - 0.1), P2(w + o2, -o2, Hm - 0.1), P2(w / 2, -o2, Hm + rh), P2(w / 2, h + o2, Hm + rh)], px(col, 0.78));
          {
            const am = sp.arch && sp.arch.roofMat;
            if (am && !sp.wa) roofTex(ctx4, P2, [w + o2, h + o2, Hm - 0.1], [w + o2, -o2, Hm - 0.1], [w / 2, h + o2, Hm + rh], am, col, R5, e.b.idx * 31 + 9, sp.arch.wear);
            else tileLines(ctx4, P2, [w + o2, h + o2, Hm - 0.1], [w + o2, -o2, Hm - 0.1], [w / 2, h + o2, Hm + rh], 7, px(col, 0.62), true);
          }
          const a = P2(w / 2, -o2, Hm + rh), b = P2(w / 2, h + o2, Hm + rh);
          ctx4.strokeStyle = px(col, 1.1);
          ctx4.lineWidth = Math.max(1.5, R5 * 1.3);
          ctx4.beginPath();
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(b[0], b[1]);
          ctx4.stroke();
          poly7([P2(-o2, h + o2, Hm - 0.1), P2(w / 2, h + o2, Hm + rh), P2(w + o2, h + o2, Hm - 0.1)], px(col, 0.98));
          poly7([P2(0.06, h + 0, Hm), P2(w - 0.06, h + 0, Hm), P2(w / 2, h + 0, Hm + rh * 0.86)], px(sp.wall, 0.9));
        }
      } else {
        const rr3 = Math.max(0.2, Math.abs(w - h) / 2);
        const rhh = rh * 0.9;
        const ex = Math.min(w, h) / 2;
        const A2 = [P2(-o2, h + o2, Hm - 0.1), P2(w + o2, h + o2, Hm - 0.1)];
        const r0 = [ex, h - ex, Hm + rhh], r1 = [w - ex, h - ex, Hm + rhh];
        let ridgeA, ridgeB;
        if (w >= h) {
          ridgeA = [ex, h / 2, Hm + rhh];
          ridgeB = [w - ex, h / 2, Hm + rhh];
        } else {
          ridgeA = [w / 2, ex, Hm + rhh];
          ridgeB = [w / 2, h - ex, Hm + rhh];
        }
        void r0;
        void r1;
        void rr3;
        const pa = P2(ridgeA[0], ridgeA[1], ridgeA[2]), pb = P2(ridgeB[0], ridgeB[1], ridgeB[2]);
        const c1 = P2(-o2, -o2, Hm - 0.1), c2 = P2(w + o2, -o2, Hm - 0.1), c3 = P2(w + o2, h + o2, Hm - 0.1), c4 = P2(-o2, h + o2, Hm - 0.1);
        const fill = (pts, f2) => {
          ctx4.beginPath();
          pts.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
          ctx4.closePath();
          ctx4.fillStyle = f2;
          ctx4.fill();
        };
        fill([c1, c2, pb, pa], px(col, 0.9));
        fill([c1, c4, w >= h ? pa : pa, pa], px(col, 0.85));
        fill([c2, c3, w >= h ? pb : pb, pb], px(col, 0.72));
        fill([c3, c4, w >= h ? pa : pb, w >= h ? pb : pa], px(col, 1));
        ctx4.strokeStyle = px(col, 0.6);
        ctx4.lineWidth = 1;
        for (const [p, q] of [[c4, pa], [c3, pb]]) {
          ctx4.beginPath();
          ctx4.moveTo(p[0], p[1]);
          ctx4.lineTo(q[0], q[1]);
          ctx4.stroke();
        }
        ctx4.strokeStyle = px(col, 1.2);
        ctx4.lineWidth = Math.max(1.5, R5 * 1.3);
        ctx4.beginPath();
        ctx4.moveTo(pa[0], pa[1]);
        ctx4.lineTo(pb[0], pb[1]);
        ctx4.stroke();
        ctx4.strokeStyle = px(col, 0.8);
        ctx4.lineWidth = 1;
        for (let i = 1; i < 6; i++) {
          const t = i / 6;
          const a1 = lerp(c4, w >= h ? pa : pb, t), b1 = lerp(c3, w >= h ? pb : pa, t);
          ctx4.beginPath();
          ctx4.moveTo(a1[0], a1[1]);
          ctx4.lineTo(b1[0], b1[1]);
          ctx4.stroke();
        }
      }
    }
    if (sp.clock && (sp.kind === "school" || sp.kind === "civic")) {
      const u = w / 2, v = h / 2;
      box(ctx4, P2, u - 0.6, v - 0.6, 1.2, 1.2, Hm + 0.5, 2.6, "#e4dccb");
      const q = P2(u + 0.6, v + 0.6, Hm + 2.4);
      ctx4.fillStyle = "#fff";
      ctx4.beginPath();
      ctx4.arc(q[0] - 6 * R5, q[1] + 3 * R5, 4 * R5, 0, 7);
      ctx4.fill();
      ctx4.strokeStyle = "#555";
      ctx4.lineWidth = 1;
      ctx4.stroke();
    }
    if (sp.chim && sp.kind !== "hall") box(ctx4, P2, w * 0.8, h * 0.2, 0.7, 0.7, Hm, 6, "#8d6a5a");
  }
  function roofExtras(ctx4, e, P0, poly7, mode2) {
    if (mode2 !== "day") return;
    const { sp, R: R5 } = e;
    const A2 = sp.arch;
    if (!A2) return;
    const T0 = e.top;
    const w = T0.u1 - T0.u0, h = T0.v1 - T0.v0, Hm = T0.z1;
    const P2 = (u, v, z) => P0(u + T0.u0, v + T0.v0, z);
    const rt = sp.roof;
    const res = sp.kind === "res" || sp.kind === "apt";
    const lw = Math.max(1, R5 * 0.9);
    if (rt === "flat") {
      const par = 0.5;
      ctx4.strokeStyle = "#8b9299";
      ctx4.lineWidth = lw * 0.8;
      if (sp.kind !== "yard" && w >= 3) {
        const a = P2(0.05, h - 0.05, Hm + par + 0.5), b = P2(w - 0.05, h - 0.05, Hm + par + 0.5), c = P2(w - 0.05, 0.05, Hm + par + 0.5);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(b[0], b[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
        for (let k = 0; k <= 6; k++) {
          const q = P2(w * k / 6, h - 0.05, Hm + par), q2 = P2(w * k / 6, h - 0.05, Hm + par + 0.5);
          ctx4.beginPath();
          ctx4.moveTo(q[0], q[1]);
          ctx4.lineTo(q2[0], q2[1]);
          ctx4.stroke();
        }
      }
      if (sp.nf >= 3 && w >= 3 && h >= 3) box(ctx4, P2, 0.5, 0.5, 1.3, 1.1, Hm + par, 1.9, px(sp.wall, 0.92));
      if (A2.fa >= 4 && w * h >= 16) {
        for (let k = 0; k < 3; k++) box(ctx4, P2, w * 0.35 + k * 0.9, h * 0.5, 0.8, 1.5, Hm + par, 0.35, "#2d4468");
      }
      if ((sp.kind === "hosp" || sp.kind === "clinic") && w >= 4 && h >= 3) {
        const c = P2(w * 0.62, h * 0.5, Hm + par + 0.02);
        ctx4.fillStyle = "#6f7b84";
        ctx4.beginPath();
        ctx4.ellipse(c[0], c[1], 1.4 * 16 * R5 * 0.5 * 2, 1.4 * 8 * R5 * 0.5 * 2, 0, 0, 7);
        ctx4.fill();
        ctx4.strokeStyle = "#f3e7a0";
        ctx4.lineWidth = lw;
        ctx4.stroke();
        ctx4.fillStyle = "#f3e7a0";
        ctx4.font = `bold ${Math.max(7, 7 * R5)}px sans-serif`;
        ctx4.textAlign = "center";
        ctx4.textBaseline = "middle";
        ctx4.fillText("H", c[0], c[1]);
        const q = P2(w * 0.15, h * 0.2, Hm + par);
        ctx4.fillStyle = "#e8eef0";
        ctx4.fillRect(q[0] - 3 * R5 * 1.6, q[1] - 18 * R5, 3 * R5 * 3.2, 11 * R5 * 1.5);
        ctx4.fillStyle = "#d33a3a";
        ctx4.fillRect(q[0] - 0.8 * R5, q[1] - 17 * R5, 1.6 * R5, 8.5 * R5 * 1.5 + 0);
        ctx4.fillRect(q[0] - 3.4 * R5, q[1] - 12.5 * R5, 6.8 * R5, 1.8 * R5);
      }
      if ((sp.kind === "school" || sp.kind === "kinder") && w >= 4) {
        const q = P2(w * 0.85, h * 0.3, Hm + par);
        ctx4.strokeStyle = "#d9dcdf";
        ctx4.lineWidth = lw * 0.9;
        ctx4.beginPath();
        ctx4.moveTo(q[0], q[1]);
        ctx4.lineTo(q[0], q[1] - 26 * R5);
        ctx4.stroke();
        ctx4.fillStyle = "#e8e8e8";
        ctx4.fillRect(q[0], q[1] - 26 * R5, 10 * R5, 6 * R5);
        ctx4.fillStyle = "#d93a3a";
        ctx4.beginPath();
        ctx4.arc(q[0] + 5 * R5, q[1] - 23 * R5, 1.8 * R5, 0, 7);
        ctx4.fill();
        const c = P2(w * 0.5, h, Hm + par + 0.2);
        ctx4.fillStyle = "#f6f2e2";
        ctx4.beginPath();
        ctx4.arc(c[0], c[1] - 7 * R5, 5.5 * R5, 0, 7);
        ctx4.fill();
        ctx4.strokeStyle = "#4a4a4a";
        ctx4.lineWidth = lw * 0.7;
        ctx4.stroke();
        ctx4.beginPath();
        ctx4.moveTo(c[0], c[1] - 7 * R5);
        ctx4.lineTo(c[0], c[1] - 10.5 * R5);
        ctx4.moveTo(c[0], c[1] - 7 * R5);
        ctx4.lineTo(c[0] + 2.6 * R5, c[1] - 6 * R5);
        ctx4.stroke();
      }
      if (sp.kind === "dept" && w >= 4) {
        const q = P2(w * 0.5, h * 0.8, Hm + par);
        ctx4.fillStyle = "#c93a3a";
        ctx4.fillRect(q[0] - 18 * R5, q[1] - 22 * R5, 36 * R5, 9 * R5);
        ctx4.fillStyle = "#fff";
        ctx4.font = `bold ${Math.max(7, 6 * R5)}px sans-serif`;
        ctx4.textAlign = "center";
        ctx4.textBaseline = "middle";
        ctx4.fillText("SALE", q[0], q[1] - 17.5 * R5);
        ctx4.strokeStyle = "#6f7479";
        ctx4.lineWidth = lw;
        ctx4.beginPath();
        ctx4.moveTo(q[0] - 12 * R5, q[1] - 13 * R5);
        ctx4.lineTo(q[0] - 12 * R5, q[1]);
        ctx4.moveTo(q[0] + 12 * R5, q[1] - 13 * R5);
        ctx4.lineTo(q[0] + 12 * R5, q[1]);
        ctx4.stroke();
      }
    } else if (res && A2.fa >= 1 && A2.fa <= 3 && w * h >= 6) {
      const q = P2(w * 0.55, h * 0.5, Hm + (e.rh || 1) * 0.85);
      ctx4.strokeStyle = "#55585c";
      ctx4.lineWidth = lw * 0.8;
      ctx4.beginPath();
      ctx4.moveTo(q[0], q[1]);
      ctx4.lineTo(q[0], q[1] - 15 * R5);
      ctx4.stroke();
      for (let k = 0; k < 4; k++) {
        const y = q[1] - (4 + k * 3) * R5;
        ctx4.beginPath();
        ctx4.moveTo(q[0] - (6 - k) * R5, y);
        ctx4.lineTo(q[0] + (6 - k) * R5, y);
        ctx4.stroke();
      }
      if (A2.fa <= 2 && A2.h(11) % 2) box(ctx4, P2, w * 0.7, h * 0.3, 0.45, 0.45, Hm + (e.rh || 1) * 0.35, 1.2, "#8d6a5a");
    } else if (res && A2.fa >= 5 && (rt === "gable" || rt === "hip" || rt === "shed")) {
      const pa = P2(w * 0.2, h + 0.05, Hm + 0.3), pb = P2(w * 0.8, h + 0.05, Hm + 0.3), pc = P2(w * 0.8, h * 0.62, Hm + (e.rh || 1) * 0.55), pd = P2(w * 0.2, h * 0.62, Hm + (e.rh || 1) * 0.55);
      poly7([pa, pb, pc, pd], "#27406a", "#7b8aa6", 1);
    }
  }
  var lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function tileLines(ctx4, P2, A2, B2, C2, n2, col, vert) {
    ctx4.strokeStyle = col;
    ctx4.lineWidth = 1;
    for (let i = 1; i < n2; i++) {
      const t = i / n2;
      const a = P2(A2[0] + (C2[0] - A2[0]) * t, A2[1] + (C2[1] - A2[1]) * t, A2[2] + (C2[2] - A2[2]) * t), b = P2(B2[0] + (C2[0] - A2[0]) * t, B2[1] + (C2[1] - A2[1]) * t, B2[2] + (C2[2] - A2[2]) * t);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.stroke();
    }
    void vert;
  }
  function box(ctx4, P2, u, v, du, dv, z0, hz, col) {
    const pg = (pts) => {
      ctx4.beginPath();
      pts.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
      ctx4.closePath();
      ctx4.fill();
    };
    ctx4.fillStyle = px(col, 1.05);
    pg([P2(u, v, z0 + hz), P2(u + du, v, z0 + hz), P2(u + du, v + dv, z0 + hz), P2(u, v + dv, z0 + hz)]);
    ctx4.fillStyle = px(col, 0.9);
    pg([P2(u, v + dv, z0), P2(u + du, v + dv, z0), P2(u + du, v + dv, z0 + hz), P2(u, v + dv, z0 + hz)]);
    ctx4.fillStyle = px(col, 0.7);
    pg([P2(u + du, v + dv, z0), P2(u + du, v, z0), P2(u + du, v, z0 + hz), P2(u + du, v + dv, z0 + hz)]);
  }
  function paintMansion(ctx4, e, P2, poly7, mode2, o) {
    const { sp, w, h, R: R5 } = e;
    const day = mode2 === "day";
    const { south, east, T: T4, M, rng, L: L2 } = o;
    const wall = sp.wall, trim = sp.trim;
    const wallS = px(wall, 0.9), wallE = px(wall, 0.7);
    const doorU = Math.max(0.5, Math.min(w - 0.5, e.b.doorX - e.b.x + 0.5));
    const roofCol = sp.roofCol || "#4f5a6e";
    if (day) {
      poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#b9b29c");
      poly7([P2(2, 10.4, 0.02), P2(w - 2, 10.4, 0.02), P2(w - 2, h, 0.02), P2(2, h, 0.02)], "#d9d2bf");
      for (let k = 0; k < 4; k++) {
        const v = 11.9 + k * 0.28, z = 0.6 - k * 0.15;
        poly7([P2(doorU - 2.6 - k * 0.2, v, z), P2(doorU + 2.6 + k * 0.2, v, z), P2(doorU + 2.6 + k * 0.2, v, 0), P2(doorU - 2.6 - k * 0.2, v, 0)], px("#e4ddc9", 0.88 - k * 0.04));
        poly7([P2(doorU - 2.6 - k * 0.2, v - 0.28, z), P2(doorU + 2.6 + k * 0.2, v - 0.28, z), P2(doorU + 2.6 + k * 0.2, v, z), P2(doorU - 2.6 - k * 0.2, v, z)], "#efe9d8");
      }
    }
    for (const bl of sp.blocks) {
      if (day) {
        poly7([P2(bl.u0, bl.v1, bl.z0), P2(bl.u1, bl.v1, bl.z0), P2(bl.u1, bl.v1, bl.z1), P2(bl.u0, bl.v1, bl.z1)], wallS);
        poly7([P2(bl.u1, bl.v1, bl.z0), P2(bl.u1, bl.v0, bl.z0), P2(bl.u1, bl.v0, bl.z1), P2(bl.u1, bl.v1, bl.z1)], wallE);
      }
      const du = bl.door ? doorU - bl.u0 : -99;
      south(() => facade(ctx4, e, "S", { T: T4, M, rng, mode: mode2, L: L2, bl, doorU: du }), bl.u0, bl.v1, bl.z0);
      east(bl.u1, () => facade(ctx4, e, "E", { T: T4, M, rng, mode: mode2, L: L2, bl, doorU: 0 }), bl.v1, bl.z0);
      if (day) {
        ctx4.strokeStyle = px(trim, 0.9);
        ctx4.lineWidth = Math.max(1, R5);
        for (const z of [bl.z0 + 4.2, bl.z0 + 7.8]) {
          if (z >= bl.z1 - 0.2) continue;
          const a = P2(bl.u0, bl.v1, z), c = P2(bl.u1, bl.v1, z), d = P2(bl.u1, bl.v0, z);
          ctx4.beginPath();
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(c[0], c[1]);
          ctx4.lineTo(d[0], d[1]);
          ctx4.stroke();
        }
        if (bl.garage) {
          for (let i = 0; i < 3; i++) {
            const u = bl.u0 + 0.55 + i * 2.45;
            poly7([P2(u, bl.v1, 0), P2(u + 2.2, bl.v1, 0), P2(u + 2.2, bl.v1, 2.6), P2(u, bl.v1, 2.6)], "#aab3bb", "#6b737b", 1);
            ctx4.strokeStyle = "rgba(70,80,90,0.5)";
            for (let k = 1; k < 6; k++) {
              const a = P2(u, bl.v1, k * 0.43), c = P2(u + 2.2, bl.v1, k * 0.43);
              ctx4.beginPath();
              ctx4.moveTo(a[0], a[1]);
              ctx4.lineTo(c[0], c[1]);
              ctx4.stroke();
            }
          }
        }
        const T0 = e.top;
        e.top = bl;
        const rt0 = sp.roof;
        const rh0 = e.rh;
        if (bl.roof === "glass") {
          poly7([P2(bl.u0, bl.v0, bl.z1), P2(bl.u1, bl.v0, bl.z1), P2(bl.u1, bl.v1, bl.z1), P2(bl.u0, bl.v1, bl.z1)], "#bcd9e8");
          ctx4.strokeStyle = "rgba(255,255,255,0.8)";
          for (let u = bl.u0; u <= bl.u1; u += 1.15) {
            const a = P2(u, bl.v0, bl.z1), c = P2(u, bl.v1, bl.z1);
            ctx4.beginPath();
            ctx4.moveTo(a[0], a[1]);
            ctx4.lineTo(c[0], c[1]);
            ctx4.stroke();
          }
          poly7([P2(bl.u0, bl.v1, bl.z1), P2(bl.u1, bl.v1, bl.z1), P2(bl.u1, bl.v1, bl.z1 + 0.25), P2(bl.u0, bl.v1, bl.z1 + 0.25)], px(wall, 0.95));
        } else {
          sp.roof = "hip";
          e.rh = Math.min(bl.u1 - bl.u0, bl.v1 - bl.v0) * 0.5 * 1.25 * (bl.rk / 0.3) * 0.8;
          paintRoof(ctx4, e, P2, poly7, mode2);
        }
        sp.roof = rt0;
        e.rh = rh0;
        e.top = T0 || e.top;
      }
    }
    if (day) {
      const c0 = sp.blocks.find((q) => q.door);
      const v = 11.9, zc = 7.8;
      const cols2 = [-1.9, -0.65, 0.65, 1.9].map((d) => doorU + d);
      poly7([P2(doorU - 2.6, v - 0.3, 4.2), P2(doorU + 2.6, v - 0.3, 4.2), P2(doorU + 2.6, v + 0.45, 4.2), P2(doorU - 2.6, v + 0.45, 4.2)], "#e9e2cf");
      for (const u of cols2) {
        poly7([P2(u - 0.2, v, 0), P2(u + 0.2, v, 0), P2(u + 0.2, v, zc), P2(u - 0.2, v, zc)], "#f1ebdb");
        poly7([P2(u + 0.2, v, 0), P2(u + 0.2, v - 0.25, 0), P2(u + 0.2, v - 0.25, zc), P2(u + 0.2, v, zc)], "#cfc8b4");
      }
      ctx4.strokeStyle = "#d8d1be";
      ctx4.lineWidth = Math.max(1, R5);
      for (let k = 0; k <= 12; k++) {
        const u = doorU - 2.6 + k * 5.2 / 12;
        const a = P2(u, v + 0.45, 4.2), c = P2(u, v + 0.45, 5.1);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
      {
        const a = P2(doorU - 2.6, v + 0.45, 5.1), c = P2(doorU + 2.6, v + 0.45, 5.1);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
      poly7([P2(doorU - 2.75, v + 0.5, zc), P2(doorU + 2.75, v + 0.5, zc), P2(doorU + 2.75, v + 0.5, zc + 0.35), P2(doorU - 2.75, v + 0.5, zc + 0.35)], "#efe8d4");
      poly7([P2(doorU - 2.75, v + 0.5, zc + 0.35), P2(doorU, v + 0.5, zc + 1.9), P2(doorU + 2.75, v + 0.5, zc + 0.35)], "#f3eddc", "#b9b29c", 1);
      poly7([P2(doorU - 2.2, v + 0.5, zc + 0.5), P2(doorU, v + 0.5, zc + 1.5), P2(doorU + 2.2, v + 0.5, zc + 0.5)], px(wall, 0.96));
      poly7([P2(doorU - 1, 10.6, 0), P2(doorU + 1, 10.6, 0), P2(doorU + 1, 10.6, 3.6), P2(doorU - 1, 10.6, 3.6)], "#4a2f1e", "#c9a23a", 1);
      poly7([P2(doorU - 0.06, 10.6, 0), P2(doorU + 0.06, 10.6, 0), P2(doorU + 0.06, 10.6, 3.6), P2(doorU - 0.06, 10.6, 3.6)], "#c9a23a");
      for (const [u, vv] of [[10.2, 3], [17.6, 3.4]]) {
        const zt = (c0 ? c0.z1 : 15) + 2.2;
        box(ctx4, P2, u, vv, 0.9, 0.9, zt, 2.4, "#a77b6a");
        box(ctx4, P2, u - 0.1, vv - 0.1, 1.1, 1.1, zt + 2.4, 0.25, "#7d5a4c");
      }
    }
  }
  function paintEstateGround(ctx4, e, P2, poly7) {
    const { b, w, h } = e;
    const hh = H3(b.idx, 6101);
    const du = Math.max(1.2, Math.min(w - 1.2, b.doorX - b.x + 0.5));
    poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#8fae68");
    for (let i = 0; i < 6; i++) poly7([P2(0.2, 0.6 + i * 1.1, 0), P2(w - 0.2, 0.6 + i * 1.1, 0), P2(w - 0.2, 0.9 + i * 1.1, 0), P2(0.2, 0.9 + i * 1.1, 0)], "rgba(255,255,255,0.07)");
    poly7([P2(0.2, h - 2.7, 0.01), P2(w - 0.2, h - 2.7, 0.01), P2(w - 0.2, h - 0.15, 0.01), P2(0.2, h - 0.15, 0.01)], "#9bb872");
    poly7([P2(0.5, h - 2, 0.02), P2(3.3, h - 2, 0.02), P2(3.3, h, 0.02), P2(0.5, h, 0.02)], "#c9c2b0");
    poly7([P2(du - 0.45, h - 2.7, 0.02), P2(du + 0.45, h - 2.7, 0.02), P2(du + 0.45, h, 0.02), P2(du - 0.45, h, 0.02)], "#ddd6c4");
    for (let i = 0; i < 5; i++) poly7([P2(du - 0.42, h - 2.6 + i * 0.5, 0.025), P2(du + 0.42, h - 2.6 + i * 0.5, 0.025), P2(du + 0.42, h - 2.55 + i * 0.5, 0.025), P2(du - 0.42, h - 2.55 + i * 0.5, 0.025)], "rgba(90,80,60,0.25)");
    poly7([P2(du - 1.1, h - 2.7, 0.02), P2(du + 1.1, h - 2.7, 0.02), P2(du + 1.1, h - 2.3, 0.02), P2(du - 1.1, h - 2.3, 0.02)], "#e4dece");
    const pu = w - 2, pv = h - 3.9;
    ctx4.fillStyle = "#6fa8c4";
    ctx4.beginPath();
    {
      const q = P2(pu, pv, 0.02);
      ctx4.ellipse(q[0], q[1], 0.9 * 16 * e.R, 0.9 * 8 * e.R, 0, 0, 7);
      ctx4.fill();
    }
    ctx4.strokeStyle = "rgba(255,255,255,0.45)";
    ctx4.lineWidth = 1;
    {
      const q = P2(pu - 0.2, pv - 0.1, 0.02);
      ctx4.beginPath();
      ctx4.ellipse(q[0], q[1], 0.25 * 16 * e.R, 0.25 * 8 * e.R, 0, 0, 7);
      ctx4.stroke();
    }
    const fl = ["#e9658a", "#f2c94c", "#f08a4b", "#b58ae6"];
    for (let i = 0; i < 9; i++) {
      const u = du - 1.6 - i % 3 * 0.5, v = h - 2.2 + (i / 3 | 0) * 0.5;
      if (u < 0.5) continue;
      const q = P2(u, v, 0.03);
      ctx4.fillStyle = fl[(hh + i) % 4];
      ctx4.beginPath();
      ctx4.ellipse(q[0], q[1], 3 * e.R, 2 * e.R, 0, 0, 7);
      ctx4.fill();
    }
  }
  function paintEstateFront(ctx4, e, P2, poly7, doorU) {
    const { b, w, h } = e;
    const du = Math.max(1.2, Math.min(w - 1.2, doorU));
    const hh = H3(b.idx, 6102);
    box(ctx4, P2, 0.3, h - 4.1, 3.2, 2, 0, 2.7, "#e4dccb");
    poly7([P2(0.3, h - 2.1, 2.7), P2(3.5, h - 2.1, 2.7), P2(3.5, h - 2.1, 2.95), P2(0.3, h - 2.1, 2.95)], "#8a7f6e");
    poly7([P2(0.5, h - 2.1, 0), P2(3.3, h - 2.1, 0), P2(3.3, h - 2.1, 2.2), P2(0.5, h - 2.1, 2.2)], "#9aa3ab");
    ctx4.strokeStyle = "rgba(60,70,80,0.45)";
    ctx4.lineWidth = 1;
    for (let k = 1; k < 8; k++) {
      const a = P2(0.5, h - 2.1, k * 0.27), c = P2(3.3, h - 2.1, k * 0.27);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.stroke();
    }
    for (const u of [du - 0.9, du + 0.9]) box(ctx4, P2, u - 0.09, h - 2.55, 0.18, 0.18, 0, 2.7, "#f2ece0");
    poly7([P2(du - 1.15, h - 2.75, 2.7), P2(du + 1.15, h - 2.75, 2.7), P2(du + 1.15, h - 2.3, 2.7), P2(du - 1.15, h - 2.3, 2.7)], "#d6d0c0");
    poly7([P2(du - 1.15, h - 2.3, 2.7), P2(du + 1.15, h - 2.3, 2.7), P2(du + 1.15, h - 2.3, 2.95), P2(du - 1.15, h - 2.3, 2.95)], "#8a7f6e");
    const tree = (u, v, r, c1, c2) => {
      const q0 = P2(u, v, 0);
      ctx4.fillStyle = "rgba(30,50,25,0.28)";
      ctx4.beginPath();
      ctx4.ellipse(q0[0] + 3 * e.R, q0[1], r * 16 * e.R, r * 7 * e.R, 0, 0, 7);
      ctx4.fill();
      box(ctx4, P2, u - 0.07, v - 0.07, 0.14, 0.14, 0, 1.2 * r + 0.5, "#6a4b32");
      for (const [dz, rr3, c] of [[1.1 * r + 0.5, r, c1], [1.6 * r + 0.55, r * 0.78, c2], [2 * r + 0.55, r * 0.5, c1]]) {
        const q = P2(u, v, dz);
        ctx4.fillStyle = c;
        ctx4.beginPath();
        ctx4.ellipse(q[0], q[1], rr3 * 16 * e.R * 0.9, rr3 * 11 * e.R, 0, 0, 7);
        ctx4.fill();
      }
    };
    tree(0.8, 1.2, 0.9, "#3f7a47", "#4f8f56");
    tree(w - 0.7, 0.9, 1, "#356c3e", "#4a8650");
    tree(w - 1, h - 1, 0.7, "#4a8650", "#5ba064");
    tree(3.9, h - 0.9, 0.55, "#3f7a47", "#58a05f");
    tree(0.7, h - 3, 0.65, "#3a7343", "#4f8f56");
    const fh = 1.15, col = "#d8d1c0";
    const gaps = [[du - 0.65, du + 0.65], [0.6, 3.2]];
    gaps.sort((a, c) => a[0] - c[0]);
    let cur2 = 0;
    for (const [g0, g1] of gaps) {
      if (g0 > cur2) wallSeg(cur2, g0);
      cur2 = g1;
    }
    if (cur2 < w) wallSeg(cur2, w);
    function wallSeg(u0, u1) {
      poly7([P2(u0, h, 0), P2(u1, h, 0), P2(u1, h, fh), P2(u0, h, fh)], px(col, 0.98));
      poly7([P2(u0, h, fh), P2(u1, h, fh), P2(u1, h - 0.14, fh), P2(u0, h - 0.14, fh)], "#b9b2a0");
      for (let u = u0 + 0.5; u < u1; u += 0.5) {
        const a = P2(u, h, 0.05), c = P2(u, h, fh - 0.05);
        ctx4.strokeStyle = "rgba(80,70,55,0.22)";
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
    }
    poly7([P2(w, h, 0), P2(w, 0, 0), P2(w, 0, fh), P2(w, h, fh)], px(col, 0.7));
    poly7([P2(w, h, fh), P2(w, 0, fh), P2(w, 0, fh + 0.1), P2(w, h, fh + 0.1)], "#a49d8b");
    for (const [g0, g1] of gaps) {
      for (const u of [g0, g1]) box(ctx4, P2, u - 0.12, h - 0.12, 0.24, 0.24, 0, 1.55, "#efe8d8");
      ctx4.strokeStyle = "#2d3036";
      ctx4.lineWidth = Math.max(1, e.R);
      for (let u = g0 + 0.1; u <= g1 - 0.05; u += 0.14) {
        const a = P2(u, h, 0.05), c = P2(u, h, 1.35);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
      const q0 = P2(g0, h, 1.35), q1 = P2(g1, h, 1.35);
      ctx4.beginPath();
      ctx4.moveTo(q0[0], q0[1]);
      ctx4.lineTo(q1[0], q1[1]);
      ctx4.stroke();
    }
    {
      const q = P2(du - 0.65 + 0, h, 1.7);
      ctx4.fillStyle = "#fff2b3";
      ctx4.beginPath();
      ctx4.arc(q[0], q[1], 2.5 * e.R, 0, 7);
      ctx4.fill();
    }
    void hh;
  }
  function paintWaGround(ctx4, e, P2, poly7) {
    const { b, sp, w, h } = e;
    const g = sp.wa === "garden" ? "#9bb07c" : "#b9ae92";
    poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], g);
    const hh = H3(b.idx, 5201);
    ctx4.strokeStyle = "rgba(255,255,255,0.28)";
    ctx4.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const a = P2(0.2, h - 0.2 - i * 0.12, 0), c = P2(w - 0.2, h - 0.2 - i * 0.12, 0);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.stroke();
    }
    const du = Math.max(0.8, Math.min(w - 0.8, b.doorX - b.x + 0.5));
    for (let i = 0; i < 3; i++) {
      const v = h - 0.15 - i * 0.14, u = du + (i % 2 ? 0.12 : -0.12);
      poly7([P2(u - 0.14, v, 0), P2(u + 0.14, v, 0), P2(u + 0.14, v - 0.12, 0), P2(u - 0.14, v - 0.12, 0)], "#8c8a84");
    }
    const tu = hh % 2 ? 0.35 : w - 0.4, tv = h - 0.55;
    box(ctx4, P2, tu - 0.06, tv - 0.06, 0.12, 0.12, 0, 0.9, "#6a4b32");
    for (const [dz, r] of [[0.9, 0.34], [1.25, 0.26], [1.55, 0.16]]) {
      const q = P2(tu, tv, dz);
      ctx4.fillStyle = sp.wa === "garden" ? "#2f6b3a" : "#3d7a47";
      ctx4.beginPath();
      ctx4.ellipse(q[0], q[1], r * 16 * e.R * 1.1, r * 9 * e.R, 0, 0, 7);
      ctx4.fill();
    }
    if (sp.wa === "garden") {
      const lu = hh % 2 ? w - 0.45 : 0.4;
      box(ctx4, P2, lu - 0.07, tv - 0.07, 0.14, 0.14, 0, 0.5, "#9a9890");
      box(ctx4, P2, lu - 0.12, tv - 0.12, 0.24, 0.24, 0.5, 0.18, "#7d7b75");
    }
  }
  function paintWaFence(ctx4, e, P2, poly7, doorU) {
    const { b, sp, w, h } = e;
    const fh = sp.wa === "machiya" ? 0.6 : 1.15;
    const col = sp.wa === "kawara" || sp.wa === "garden" ? "#d9ceb4" : "#6f5238";
    const gw = 0.9;
    const du = Math.max(gw, Math.min(w - gw, doorU));
    const seg = (u0, u1) => {
      if (u1 - u0 < 0.05) return;
      poly7([P2(u0, h, 0), P2(u1, h, 0), P2(u1, h, fh), P2(u0, h, fh)], px(col, 0.95));
      poly7([P2(u0, h, fh), P2(u1, h, fh), P2(u1, h - 0.1, fh), P2(u0, h - 0.1, fh)], "#3e434d");
    };
    seg(0, du - gw / 2);
    seg(du + gw / 2, w);
    poly7([P2(w, h, 0), P2(w, 0, 0), P2(w, 0, fh), P2(w, h, fh)], px(col, 0.7));
    poly7([P2(w, h, fh), P2(w, 0, fh), P2(w + 0, 0, fh + 0.1), P2(w, h, fh + 0.1)], "#3e434d");
    for (const u of [du - gw / 2, du + gw / 2]) box(ctx4, P2, u - 0.08, h - 0.08, 0.16, 0.16, 0, 1.7, "#5a3f2a");
    poly7([P2(du - gw / 2 - 0.2, h + 0.15, 1.75), P2(du + gw / 2 + 0.2, h + 0.15, 1.75), P2(du + gw / 2 + 0.2, h - 0.35, 2.15), P2(du - gw / 2 - 0.2, h - 0.35, 2.15)], "#3e434d");
    poly7([P2(du - gw / 2 - 0.2, h + 0.15, 1.75), P2(du + gw / 2 + 0.2, h + 0.15, 1.75), P2(du + gw / 2 + 0.2, h + 0.15, 1.65), P2(du - gw / 2 - 0.2, h + 0.15, 1.65)], "#2c3037");
  }
  function paintYard(ctx4, e, P2, poly7, mode2) {
    if (mode2 !== "day") return;
    const { b, w, h } = e;
    const cem = b.type === "cemetery";
    const hsh = (i, k) => (b.idx * 2654435761 + i * 40503 + k * 9973 >>> 0) % 1e3 / 1e3;
    const door = Math.max(1, Math.min(w - 1, b.doorX - b.x + 0.5));
    poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], cem ? "#c9c3ae" : "#a9c97f");
    poly7([P2(door - 0.55, 0.3, 0), P2(door + 0.55, 0.3, 0), P2(door + 0.55, h, 0), P2(door - 0.55, h, 0)], cem ? "#e4dfcf" : "#ddd3b8");
    if (!cem) poly7([P2(0.4, h * 0.5 - 0.4, 0), P2(w - 0.4, h * 0.5 - 0.4, 0), P2(w - 0.4, h * 0.5 + 0.4, 0), P2(0.4, h * 0.5 + 0.4, 0)], "#ddd3b8");
    const items = [];
    const fence = (u, v, du, dv) => items.push([u + v, () => box(ctx4, P2, u, v, du, dv, 0, cem ? 0.5 : 0.35, cem ? "#b9b5a8" : "#8a6a46")]);
    if (cem) {
      fence(0, 0, w, 0.18);
      fence(0, 0, 0.18, h);
      fence(w - 0.18, 0, 0.18, h);
      fence(0, h - 0.18, door - 0.6, 0.18);
      fence(door + 0.6, h - 0.18, w - door - 0.6, 0.18);
      items.push([door - 0.8 + h, () => box(ctx4, P2, door - 0.85, h - 0.35, 0.22, 0.22, 0, 1.5, "#8c9196")]);
      items.push([door + 0.6 + h, () => box(ctx4, P2, door + 0.62, h - 0.35, 0.22, 0.22, 0, 1.5, "#8c9196")]);
      const cols2 = [Math.max(0.5, door - 2.6), Math.max(0.5, door - 1.6), Math.min(w - 1.2, door + 1.2), Math.min(w - 1.2, door + 2.2)];
      let n2 = 0;
      for (let v = 1.1; v < h - 1.6; v += 1.05) for (const u of cols2) {
        if (u < 0.5 || u > w - 1.1) continue;
        n2++;
        const tall = 0.75 + hsh(n2, 1) * 0.35, c0 = hsh(n2, 2) < 0.5 ? "#9da3a6" : "#8e949a";
        items.push([u + v, () => {
          box(ctx4, P2, u - 0.06, v - 0.04, 0.58, 0.34, 0, 0.12, "#b3b8ba");
          box(ctx4, P2, u, v, 0.46, 0.2, 0.12, tall, c0);
          if (hsh(n2, 3) < 0.6) {
            const fc = ["#e8527a", "#f2c94c", "#ffffff", "#b07ad8"][Math.floor(hsh(n2, 4) * 4)];
            box(ctx4, P2, u + 0.02, v + 0.2, 0.1, 0.1, 0.12, 0.2, "#6a8f5a");
            box(ctx4, P2, u + 0.34, v + 0.2, 0.1, 0.1, 0.12, 0.2, "#6a8f5a");
            poly7([P2(u + 0.04, v + 0.3, 0.34), P2(u + 0.14, v + 0.3, 0.34), P2(u + 0.14, v + 0.3, 0.44), P2(u + 0.04, v + 0.3, 0.44)], fc);
            poly7([P2(u + 0.36, v + 0.3, 0.34), P2(u + 0.46, v + 0.3, 0.34), P2(u + 0.46, v + 0.3, 0.44), P2(u + 0.36, v + 0.3, 0.44)], fc);
          }
        }]);
      }
      items.push([0.6 + h - 1.6, () => {
        box(ctx4, P2, 0.5, h - 1.7, 0.9, 0.5, 0, 0.45, "#8a9298");
        poly7([P2(0.58, h - 1.62, 0.46), P2(1.32, h - 1.62, 0.46), P2(1.32, h - 1.28, 0.46), P2(0.58, h - 1.28, 0.46)], "#6fb4d8");
        box(ctx4, P2, 1.6, h - 1.55, 0.3, 0.3, 0, 0.3, "#c8a15a");
      }]);
      items.push([w - 2 + 0.4, () => {
        box(ctx4, P2, w - 2.4, 0.4, 1.9, 1.3, 0, 1.9, "#e6dcc8");
        poly7([P2(w - 2.55, 0.25, 1.9), P2(w - 0.35, 0.25, 1.9), P2(w - 0.35, 1.8, 1.9), P2(w - 2.55, 1.8, 1.9), P2(w - 2.55, 1.8, 2.15), P2(w - 0.35, 1.8, 2.15)], "#5c4a40");
        poly7([P2(w - 1.7, 1.7, 0), P2(w - 1.1, 1.7, 0), P2(w - 1.1, 1.7, 1.3), P2(w - 1.7, 1.7, 1.3)], "#7a5a3a");
      }]);
    } else {
      fence(0, 0, w, 0.12);
      fence(0, 0, 0.12, h);
      fence(w - 0.12, 0, 0.12, h);
      for (let i = 0; i < 4; i++) {
        const u = i < 2 ? door - 1.6 - i % 2 * 1.8 : door + 1.1 + i % 2 * 1.8, v = i % 2 ? h * 0.5 - 1.2 : h - 1.4;
        if (u < 0.3 || u > w - 1.2) continue;
        const fc = ["#e8527a", "#f2c94c", "#ff9a3c", "#b07ad8"][i];
        items.push([u + v, () => {
          box(ctx4, P2, u, v, 0.9, 0.5, 0, 0.18, "#a98a5a");
          poly7([P2(u + 0.08, v + 0.08, 0.2), P2(u + 0.82, v + 0.08, 0.2), P2(u + 0.82, v + 0.42, 0.2), P2(u + 0.08, v + 0.42, 0.2)], fc);
        }]);
      }
      for (const [u, v] of [[door - 1, h * 0.5 + 0.7], [door + 0.55, h * 0.5 - 1.1]]) items.push([u + v, () => {
        box(ctx4, P2, u, v, 0.5, 0.18, 0.22, 0.05, "#8a6a46");
        box(ctx4, P2, u, v, 0.05, 0.18, 0, 0.22, "#5a4630");
        box(ctx4, P2, u + 0.45, v, 0.05, 0.18, 0, 0.22, "#5a4630");
        box(ctx4, P2, u, v - 0.08, 0.5, 0.06, 0.22, 0.3, "#8a6a46");
      }]);
      items.push([w - 2 + 1, () => {
        for (const [du, dv] of [[0, 0], [1.6, 0], [0, 1.2], [1.6, 1.2]]) box(ctx4, P2, w - 3.2 + du, 0.5 + dv, 0.14, 0.14, 0, 1.9, "#8a6a46");
        poly7([P2(w - 3.4, 0.35, 1.9), P2(w - 1.4, 0.35, 1.9), P2(w - 1.4, 2, 1.9), P2(w - 3.4, 2, 1.9), P2(w - 2.4, 1.2, 2.5)], "#a3523a");
      }]);
      for (const u of [door - 1.4, door + 1.2]) items.push([u + h, () => {
        box(ctx4, P2, u, h - 0.5, 0.08, 0.08, 0, 1.4, "#3a3f46");
        poly7([P2(u - 0.1, h - 0.5, 1.5), P2(u + 0.18, h - 0.5, 1.5), P2(u + 0.18, h - 0.5, 1.7), P2(u - 0.1, h - 0.5, 1.7)], "#f2e6a0");
      }]);
    }
    items.sort((a, c) => a[0] - c[0]);
    for (const it of items) it[1]();
  }
  function paintSigns(ctx4, e, P2, poly7, mode2, o) {
    paintSignsImpl(ctx4, e, P2, poly7, mode2, o);
  }

