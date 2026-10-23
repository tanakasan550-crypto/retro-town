  // src/interior_school.js
  var SCHOOL_CFG = { jh: { floors: 4, gpf: 1, cpg: 6, g0: 11, G: 3, nm: "\u4E2D\u5B66\u6821" }, hs: { floors: 4, gpf: 1, cpg: 7, g0: 14, G: 3, nm: "\u9AD8\u6821" }, elem: { floors: 4, gpf: 2, cpg: 4, g0: 5, G: 6, nm: "\u5C0F\u5B66\u6821" }, univ: { floors: 5, gpf: 1, cpg: 6, g0: 17, G: 4, nm: "\u5927\u5B66" } };
  var SCHOOL_FLOORS = Object.fromEntries(Object.entries(SCHOOL_CFG).map(([k, v]) => [k, v.floors]));
  var schoolFloors = (b) => SCHOOL_FLOORS[b.type] || 0;
  var cfgOf = (b) => SCHOOL_CFG[b.type] || SCHOOL_CFG.jh;
  var floorOfGrade = (cfg, grade) => 1 + Math.floor((grade - 1) / cfg.gpf);
  // 1学年の学級数: 在籍する人数から(1学級35人まで)。年ごとに数え直す(学級編成)。cpg は学級数の上限
  var SCH_PER_CLASS = 35;
  var schClsC = /* @__PURE__ */ new Map();
  function schoolClasses(w, b) {
    if (!w || !b) return 1;
    const y = Math.floor(w.M / 12), c = schClsC.get(b.idx);
    if (c && c.y === y && c.w === w) return c.n;
    const cfg = cfgOf(b), p = w.pop, cnt = new Array(cfg.G + 2).fill(0);
    for (let i = 0; i < p.n; i++) if (!p.gone[i] && p.school[i] === b.idx) cnt[gradeOfPerson(w, i, cfg)]++;
    const n2 = Math.max(1, Math.min(cfg.cpg, Math.ceil(Math.max(...cnt) / SCH_PER_CLASS)));
    schClsC.set(b.idx, { y, w, n: n2 });
    return n2;
  }
  // 学級編成(年ごと): 学年の在籍者を決まった順(人ごとの値)に並べ、1組から順に配る(人数の差は1人まで・35人を超えない)
  var schKumiC = /* @__PURE__ */ new Map();
  function kumiAt(w, b, id) {
    const y = Math.floor(w.M / 12);
    let c = schKumiC.get(b.idx);
    if (!c || c.y !== y || c.w !== w) {
      const cfg = cfgOf(b), nC = schoolClasses(w, b), p = w.pop, byG = /* @__PURE__ */ new Map(), map = /* @__PURE__ */ new Map();
      for (let i = 0; i < p.n; i++) if (!p.gone[i] && p.school[i] === b.idx) {
        const gr = gradeOfPerson(w, i, cfg);
        (byG.get(gr) || byG.set(gr, []).get(gr)).push(i);
      }
      for (const [gr, L3] of byG) {
        L3.sort((a, c2) => uh(a, 770 + gr) - uh(c2, 770 + gr) || a - c2);
        L3.forEach((i, k) => map.set(i, k % nC));
      }
      schKumiC.set(b.idx, c = { y, w, map });
    }
    const v = c.map.get(id);
    return v != null ? v : -1;
  }
  // 学級(組): 人ごとに決まる(学年ごと)。学級数が変わるとその数で割りなおす
  var slotOf = (cfg, grade, k, nC = cfg.cpg) => (grade - 1) % cfg.gpf * nC + k % nC;
  function roomInfo(b, floor, slot, nC = cfgOf(b).cpg) {
    const cfg = cfgOf(b);
    const grade = (floor - 1) * cfg.gpf + 1 + Math.floor(slot / nC);
    const cls = slot % nC + 1;
    if (grade > cfg.G) return { grade, cls, label: slot === nC * cfg.gpf - 1 && cfg.gpf > 1 ? "\u7279\u5225\u6559\u5BA4(\u97F3\u697D\u30FB\u56F3\u5DE5)" : `${cfg.nm}\u306E\u4E88\u5099\u6559\u5BA4`, special: true };
    return { grade, cls, label: b.type === "univ" ? `${grade}\u5E74\u6B21 \u8B1B\u7FA9\u5BA4${slot + 1}` : `${grade}\u5E74${cls}\u7D44` };
  }
  var floorLabel = (b, floor) => {
    const cfg = cfgOf(b);
    if (floor === 0) return "\u7BA1\u7406\u68DF1\u968E";
    if (cfg.gpf > 1) {
      const g0 = (floor - 1) * cfg.gpf + 1;
      return `${g0}\u30FB${g0 + cfg.gpf - 1}\u5E74\u751F\u306E\u968E`;
    }
    return b.type === "univ" ? `${floor}\u5E74\u6B21\u306E\u8B1B\u7FA9\u68DF` : `${floor}\u5E74\u751F\u306E\u968E`;
  };
  var isSchoolBig = (b) => !!SCHOOL_FLOORS[b.type];
  // 学年は4月始まりの学年度で数える(早生まれも同じ学年)
  function gradeOfPerson(w, i, cfg = SCHOOL_CFG.jh) {
    const M = w.M, Ms = M - ((M % 12 - 3) % 12 + 12) % 12;
    return Math.max(1, Math.min(cfg.G, Math.floor((Ms - w.pop.born[i]) / 12) - cfg.g0));
  }
  function gradeOfAge(age, cfg = SCHOOL_CFG.jh) {
    return Math.max(1, Math.min(cfg.G, age - cfg.g0));
  }
  function buildSchool(b, floor, g) {
    const cfg = cfgOf(b);
    // 教室は1学級35席(机7列×5段)。1階あたりの教室数 = 学年(gpf)×学級数。幅は教室の数で決まる
    const nC = schoolClasses(g && g.world, b), rooms = cfg.gpf * nC;
    const W2 = Math.max(27, 2 + rooms * 10 + 4), H4 = 18, floors = cfg.floors;
    const tiles = new Array(W2 * H4).fill("floor_wood");
    const objs = [];
    const occ = /* @__PURE__ */ new Set();
    const staffSpots = [], seatSpots = [];
    const classSeats = Array.from({ length: Math.max(5, rooms) }, () => []);
    const classStand = Array.from({ length: Math.max(5, rooms) }, () => []);
    const add = (t, x, y, act, label2, solid = true, extra = {}) => {
      if (x < 0 || y < 1 || x >= W2 || y >= H4 - 1) return false;
      const k = x + y * W2;
      if (occ.has(k)) return false;
      occ.add(k);
      objs.push({ t, x, y, act, label: label2, solid, ...extra });
      return true;
    };
    for (let x = 0; x < W2; x++) tiles[x] = "wall";
    for (let y = 1; y < 4; y++) for (let x = 0; x < W2; x++) tiles[x + y * W2] = "floor_corr";
    const door = { x: 11, y: H4 - 1 };
    if (floor === 0) tiles[door.x + door.y * W2] = "exit";
    if (floor === 0) {
      occ.add(door.x + (H4 - 2) * W2);
      occ.add(door.x + (H4 - 3) * W2);
    }
    for (let x = 1; x < W2 - 1; x += 3) objs.push({ t: "window", x, y: 0, solid: true, deco: true });
    const wall = (x, y) => add("pwall", x, y, null, "\u58C1", true);
    const stairsDef = [];
    if (floor === 0) {
      add("stairs_up", W2 - 2, 1, "stairs", `${floorLabel(b, 1)}\u3078(\u968E\u6BB5)`, false, { to: 1 });
      stairsDef.push({ x: W2 - 2, y: 1, to: 1 });
    } else {
      add("stairs_down", W2 - 2, 1, "stairs", `${floorLabel(b, floor - 1)}\u3078(\u968E\u6BB5)`, false, { to: floor - 1 });
      stairsDef.push({ x: W2 - 2, y: 1, to: floor - 1 });
      if (floor + 1 < floors) {
        add("stairs_up", W2 - 3, 1, "stairs", `${floorLabel(b, floor + 1)}\u3078(\u968E\u6BB5)`, false, { to: floor + 1 });
        stairsDef.push({ x: W2 - 3, y: 1, to: floor + 1 });
      }
    }
    const grade = floor;
    let label = floorLabel(b, floor);
    if (floor >= 1) {
      for (let r = 0; r < rooms; r++) {
        const x0 = 1 + 10 * r;
        // 教室の壁(右)と廊下側の壁(入口は右上)
        for (let y = 5; y <= H4 - 2; y++) wall(x0 + 9, y);
        for (let x = x0; x < x0 + 8; x++) wall(x, 4);
        const ri = roomInfo(b, floor, r, nC);
        add("doormat", x0 + 8, 4, null, `${ri.label}の入口`, false);
        add("kokuban", x0 + 1, 5, null, `${ri.label} 黒板`, true, { w: 6 });
        add("podium", x0 + 4, 6, "class", "教卓", true);
        staffSpots.push({ x: x0 + 5, y: 6 });
        for (let yy = 7; yy <= H4 - 2; yy++) classStand[r].push({ x: x0 + 8, y: yy });
        for (const yy of [7, 9, 11, 13, 15]) for (let xx = x0 + 1; xx <= x0 + 7; xx++) {
          if (add("desk", xx, yy, "class", "机と椅子")) {
            classSeats[r].push({ x: xx, y: yy + 1 });
            seatSpots.push({ x: xx, y: yy + 1 });
          }
        }
      }
      for (let x = 1; x < W2 - 3; x += 5) add("board", x, 1, null, `${label} \u63B2\u793A\u677F(\u6642\u9593\u5272\u30FB\u304A\u77E5\u3089\u305B)`, true);
    } else {
      for (let x = 14; x <= 20; x++) wall(x, 4);
      for (let y = 5; y <= 12; y++) {
        if (y !== 6 && y !== 10) wall(8, y);
        if (y !== 6 && y !== 10) wall(14, y);
      }
      for (let x = 1; x <= 7; x++) wall(x, 4);
      wall(1, 9);
      wall(2, 9);
      wall(3, 9);
      wall(5, 9);
      wall(6, 9);
      wall(7, 9);
      for (let x = 15; x <= 20; x++) if (x !== 17) wall(x, 8);
      wall(20, 9);
      for (let y = 6; y <= 11; y += 1) {
        if (y === 6 || y === 10) continue;
        add("locker", 9, y, null, "\u4E0B\u99C4\u7BB1", true);
        add("locker", 13, y, null, "\u4E0B\u99C4\u7BB1", true);
      }
      add("board", 10, 5, null, "\u5B66\u6821\u3060\u3088\u308A\u30FB\u884C\u4E8B\u4E88\u5B9A", true);
      add("plant", 12, 5, null, "\u89B3\u8449\u690D\u7269", true);
      for (let y = 5; y <= 8; y += 1) for (let x = 2; x <= 6; x += 2) if ((y + x) % 2 === 0 && add("desk", x, y, "work", "\u6559\u54E1\u306E\u673A")) {
        staffSpots.push({ x, y: y + 1 > 8 ? y - 1 : y + 1 });
      }
      add("board", 1, 5, "info", "\u8077\u54E1\u5BA4 \u9ED2\u677F(\u9023\u7D61\u4E8B\u9805)", true);
      add("counter", 7, 8, null, "\u8077\u54E1\u5BA4\u306E\u53D7\u4ED8", true);
      add("sofa", 2, 11, "rest", "\u5FDC\u63A5\u30BD\u30D5\u30A1", false);
      add("desk", 5, 11, "work", "\u6821\u9577\u306E\u673A");
      add("plant", 6, 10, null, "\u89B3\u8449\u690D\u7269", true);
      staffSpots.push({ x: 5, y: 12 });
      add("hospital_bed", 15, 5, "ward", "\u4FDD\u5065\u5BA4\u306E\u30D9\u30C3\u30C9", true);
      add("hospital_bed", 17, 5, "ward", "\u4FDD\u5065\u5BA4\u306E\u30D9\u30C3\u30C9", true);
      add("shelf", 19, 5, null, "\u85AC\u68DA", true);
      add("desk", 19, 7, "work", "\u4FDD\u5065\u306E\u5148\u751F\u306E\u673A");
      staffSpots.push({ x: 19, y: 8 });
      for (let x = 15; x <= 19; x += 2) add("shelf", x, 10, "read", "\u66F8\u67B6(\u672C)", true);
      for (let x = 15; x <= 19; x += 2) {
        add("desk", x, 12, "read", "\u95B2\u89A7\u5E2D");
        seatSpots.push({ x, y: 11 });
      }
      add("toilet", 1, 1, null, "\u30C8\u30A4\u30EC(\u7537\u5B50)", true);
      add("toilet", 3, 1, null, "\u30C8\u30A4\u30EC(\u5973\u5B50)", true);
      add("plant", 9, 1, null, "\u89B3\u8449\u690D\u7269", true);
      seatSpots.push({ x: 11, y: 7 }, { x: 11, y: 9 });
      label = "\u7BA1\u7406\u68DF1\u968E(\u6607\u964D\u53E3\u30FB\u8077\u54E1\u5BA4\u30FB\u4FDD\u5065\u5BA4\u30FB\u56F3\u66F8\u5BA4)";
    }
    return { W: W2, H: H4, floors, floor, kind: "school", tiles, objs, door, stairs: stairsDef, staffSpots, seatSpots, classSeats, classStand, accessible: false, noDoor: floor !== 0, label, school: true };
  }

