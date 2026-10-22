  // src/interior_hospital.js
  var isHospitalBig = (b) => b.type === "hospital";
  function buildHospital(b, floor, g) {
    const W2 = 20, H4 = 13, floors = 2;
    const tiles = new Array(W2 * H4).fill("floor_tile");
    const objs = [];
    const occ = /* @__PURE__ */ new Set();
    const staffSpots = [], seatSpots = [];
    const add = (t, x, y, act, label2, solid = true, extra = {}) => {
      if (x < 0 || y < 1 || x >= W2 || y >= H4 - 1) return false;
      const k = x + y * W2;
      if (occ.has(k)) return false;
      occ.add(k);
      objs.push({ t, x, y, act, label: label2, solid, ...extra });
      return true;
    };
    const wall = (x, y) => add("pwall", x, y, null, "\u58C1", true);
    for (let x = 0; x < W2; x++) tiles[x] = "wall";
    const door = { x: 10, y: H4 - 1 };
    if (floor === 0) tiles[door.x + door.y * W2] = "exit";
    if (floor === 0) {
      occ.add(door.x + (H4 - 2) * W2);
      occ.add(door.x + (H4 - 3) * W2);
    }
    for (let x = 1; x < W2 - 1; x += 3) objs.push({ t: "window", x, y: 0, solid: true, deco: true });
    const stairsDef = [];
    if (floor === 0) {
      add("stairs_up", W2 - 2, 8, "stairs", "2\u968E(\u75C5\u68DF)\u3078", false, { to: 1 });
      stairsDef.push({ x: W2 - 2, y: 8, to: 1 });
    } else {
      add("stairs_down", W2 - 2, 1, "stairs", "1\u968E(\u5916\u6765)\u3078", false, { to: 0 });
      stairsDef.push({ x: W2 - 2, y: 1, to: 0 });
    }
    const rooms = [];
    let label = "1\u968E(\u5916\u6765)";
    if (floor === 0) {
      for (const x of [2, 3, 4]) add("counter", x, 3, "clinic", "\u53D7\u4ED8", true);
      for (const x of [14, 15]) add("counter", x, 8, "clinic", "\u4F1A\u8A08\u30FB\u51E6\u65B9\u305B\u3093", true);
      staffSpots.push({ x: 2, y: 2, role: "recep" }, { x: 4, y: 2, role: "recep" });
      add("clock", 6, 1, null, "\u58C1\u639B\u3051\u6642\u8A08", false);
      add("board", 1, 1, null, "\u8A3A\u7642\u6642\u9593\u30FB\u5916\u6765\u62C5\u5F53\u8868", true);
      add("board", 3, 1, null, "\u4E88\u9632\u63A5\u7A2E\u306E\u304A\u77E5\u3089\u305B", true);
      for (let y = 1; y <= 5; y++) {
        wall(9, y);
        wall(13, y);
        wall(17, y);
      }
      for (const x0 of [10, 14]) {
        for (let x = x0; x <= x0 + 2; x++) if (x !== x0 + 1) wall(x, 5);
        add("hospital_bed", x0, 1, "checkup", `\u7B2C${x0 === 10 ? 1 : 2}\u8A3A\u5BDF\u5BA4\u306E\u8A3A\u5BDF\u53F0`, true);
        add("desk", x0 + 2, 1, "work", "\u533B\u5E2B\u306E\u673A(\u96FB\u5B50\u30AB\u30EB\u30C6)", true);
        add("chair", x0 + 2, 3, null, "\u60A3\u8005\u306E\u6905\u5B50", false);
        add("shelf", x0, 4, null, "\u533B\u7642\u5668\u5177\u306E\u68DA", true);
        add("doormat", x0 + 1, 5, null, `\u7B2C${x0 === 10 ? 1 : 2}\u8A3A\u5BDF\u5BA4`, false);
        add("curtain", x0, 2, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 1 });
        staffSpots.push({ x: x0 + 2, y: 2, role: "doctor" });
        rooms.push({ name: `\u7B2C${x0 === 10 ? 1 : 2}\u8A3A\u5BDF\u5BA4`, bed: { x: x0, y: 1 } });
      }
      add("hospital_bed", 18, 2, "checkup", "\u51E6\u7F6E\u5BA4\u306E\u30D9\u30C3\u30C9", true);
      staffSpots.push({ x: 18, y: 3, role: "nurse" });
      for (const [x, y] of [[2, 6], [4, 6], [6, 6], [2, 8], [4, 8]]) {
        add("seat", x, y, null, "\u5F85\u5408\u5E2D", false);
        seatSpots.push({ x, y: y - 0 });
      }
      add("sofa", 1, 10, "rest", "\u5F85\u5408\u30BD\u30D5\u30A1", false, { w: 2 });
      add("mrack", 6, 10, null, "\u96D1\u8A8C\u68DA", true);
      add("watersrv", 8, 6, null, "\u7D66\u6C34\u6A5F", true);
      add("dirsign", 12, 8, null, "\u9662\u5185\u6848\u5185\u677F(\u8A3A\u5BDF\u5BA4\u30FB\u75C5\u68DF\u30FB\u4F1A\u8A08)", true);
      add("plant", 1, 2, null, "\u89B3\u8449\u690D\u7269");
      add("plant", 8, 10, null, "\u89B3\u8449\u690D\u7269");
      add("plant", W2 - 2, 11, null, "\u89B3\u8449\u690D\u7269");
      add("plant", 12, 10, null, "\u89B3\u8449\u690D\u7269");
      add("counter", 16, 8, "clinic", "\u85AC\u306E\u53D7\u3051\u53D6\u308A", true);
      staffSpots.push({ x: 15, y: 9, role: "recep" });
      label = "1\u968E(\u5916\u6765\u30FB\u8A3A\u5BDF\u5BA4)";
    } else {
      for (let y = 1; y <= 4; y++) for (let x = 0; x < W2; x++) tiles[x + y * W2] = "floor_corr";
      for (let r = 0; r < 3; r++) {
        const x0 = 1 + 4 * r;
        for (let y = 5; y <= 11; y++) wall(x0 + 3, y);
        for (let x = x0; x <= x0 + 2; x++) if (x !== x0 + 1) wall(x, 5);
        add("doormat", x0 + 1, 5, null, `${301 + r}\u53F7\u5BA4(\u500B\u5BA4)`, false);
        add("hospital_bed", x0 + 2, 7, "ward", `${301 + r}\u53F7\u5BA4\u306E\u30D9\u30C3\u30C9`, true);
        add("chair", x0, 9, null, "\u4ED8\u304D\u6DFB\u3044\u306E\u6905\u5B50", false);
        add("curtain", x0 + 2, 6, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 1 });
        add("plant", x0, 10, null, "\u898B\u821E\u3044\u306E\u82B1", true);
        rooms.push({ name: `${301 + r}\u53F7\u5BA4`, bed: { x: x0 + 2, y: 7 } });
      }
      for (let x = 13; x <= 18; x++) if (x !== 15) wall(x, 5);
      add("doormat", 15, 5, null, "\u5927\u90E8\u5C4B(4\u5E8A)", false);
      for (const [x, y] of [[13, 7], [13, 10], [18, 7], [18, 10]]) {
        add("hospital_bed", x, y, "ward", "\u5927\u90E8\u5C4B\u306E\u30D9\u30C3\u30C9", true);
        add("curtain", x, y - 1, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 1 });
        rooms.push({ name: "\u5927\u90E8\u5C4B", bed: { x, y } });
      }
      for (const x of [7, 8, 9, 10]) add("counter", x, 3, "nurse", "\u30CA\u30FC\u30B9\u30B9\u30C6\u30FC\u30B7\u30E7\u30F3", true);
      add("desk", 7, 2, "work", "\u770B\u8B77\u8A18\u9332\u306E\u673A", true);
      add("shelf", 10, 1, null, "\u85AC\u54C1\u68DA", true);
      staffSpots.push({ x: 8, y: 2, role: "nurse" }, { x: 9, y: 2, role: "nurse" }, { x: 6, y: 2, role: "nurse" });
      add("board", 2, 1, null, "\u75C5\u68DF\u306E\u3054\u6848\u5185(\u9762\u4F1A\u6642\u9593 14:00\u301C19:00)", true);
      add("clock", 5, 1, null, "\u58C1\u639B\u3051\u6642\u8A08", false);
      add("handrail", 1, 1, null, "\u624B\u3059\u308A", false, { w: 6 });
      add("watersrv", 15, 2, null, "\u7D66\u6C34\u6A5F", true);
      for (const x of [1, 16]) add("sofa", x, 4, "rest", "\u9762\u4F1A\u8005\u306E\u30BD\u30D5\u30A1", false);
      staffSpots.push({ x: 12, y: 3, role: "doctor" });
      label = "2\u968E(\u75C5\u68DF\u30FB\u30CA\u30FC\u30B9\u30B9\u30C6\u30FC\u30B7\u30E7\u30F3)";
    }
    return { W: W2, H: H4, floors, floor, kind: "hospital", tiles, objs, door, stairs: stairsDef, staffSpots, seatSpots, accessible: false, noDoor: floor !== 0, hospital: true, hRooms: rooms, label };
  }
  function inpatientsOf(g, b, I2) {
    const w = g.world, p = w.pop, out = [];
    const beds = (I2.objs || []).filter((o) => o.t === "hospital_bed" && o.act === "ward");
    if (!beds.length) return out;
    const day = g.S.M * 31 + (g.S.day || 0);
    const used = /* @__PURE__ */ new Set();
    const want = Math.max(1, Math.round(beds.length * 0.6));
    for (let k = 0; k < 400 && out.length < want; k++) {
      const i = (hash2(b.idx * 101 + day, 500 + k) >>> 0) % p.n;
      if (used.has(i) || p.gone[i] || i === g.hero.id || p.home[i] < 0) continue;
      const age = ageYears(p, i, w.M);
      if (age < 60 && hash2(i, day) % 5) continue;
      used.add(i);
      out.push({ id: i, bed: beds[out.length] });
    }
    return out;
  }

