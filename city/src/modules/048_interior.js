  // src/interior.js
  var KIND_LAYOUTS2 = { ...KIND_LAYOUTS, ...KINDS2 };
  var ELEVATOR_TYPES = /* @__PURE__ */ new Set(["tower", "mall", "dept", "hospital", "univ", "cityhall", "special", "resorthotel", "hotel", "office", "tourtower", "airport", "stadium"]);
  var hasElevator = (b) => ELEVATOR_TYPES.has(b.type) || b.type === "apt" && aptLifts(b) > 0;
  function interiorSize(b) {
    const bt = BTYPES[b.type];
    let W2 = Math.max(10, Math.min(22, (b.tw ?? b.w) * 2)), H4 = Math.max(9, Math.min(14, (b.th ?? b.h) * 2 + 3));
    const mn = INT_MIN[b.type];
    if (mn) {
      W2 = Math.max(W2, mn[0]);
      H4 = Math.max(H4, mn[1]);
    }
    if (b.type === "onsenbath" || b.type === "sento") return { W: b.type === "onsenbath" ? 16 : 13, H: b.type === "onsenbath" ? 11 : 10 };
    return { W: W2, H: H4 };
  }
  function settleSpots(I2) {
    if (!I2 || !I2.objs || !I2.W) return I2;
    const sol = interiorSolid(I2), W2 = I2.W, H4 = I2.H;
    const fix = (arr) => {
      if (!arr) return;
      for (const sp of arr) {
        if (sp.x >= 0 && sp.y >= 0 && sp.x < W2 && sp.y < H4 && !sol[sp.x + sp.y * W2]) continue;
        const seen = /* @__PURE__ */ new Set([sp.x + "," + sp.y]);
        const q = [[sp.x, sp.y]];
        let hit2 = null;
        for (let h = 0; h < q.length && !hit2; h++) {
          const [x, y] = q[h];
          for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const nx = x + dx, ny = y + dy, k = nx + "," + ny;
            if (nx < 0 || ny < 1 || nx >= W2 || ny >= H4 - 1 || seen.has(k)) continue;
            seen.add(k);
            if (!sol[nx + ny * W2]) {
              hit2 = [nx, ny];
              break;
            }
            q.push([nx, ny]);
          }
        }
        if (hit2) {
          sp.x = hit2[0];
          sp.y = hit2[1];
        }
      }
    };
    fix(I2.staffSpots);
    fix(I2.seatSpots);
    return I2;
  }
  function buildInterior(b, floor = 0, g = null) {
    return settleSpots(buildInterior0(b, floor, g));
  }
  function buildInterior0(b, floor = 0, g = null) {
    if (isUnitFloor(floor)) {
      const I2 = buildInterior({ ...b, floors: 1 }, 0, g);
      I2.unit = decodeUnit(floor);
      I2.unitCode = floor;
      I2.floor = floor;
      I2.label = "\u4F4F\u6238\u306E\u4E2D";
      return I2;
    }
    if (bigKind(b)) {
      const I2 = buildBig(b, floor, g);
      if (g && g.year && I2.objs) {
        const yr = g.year();
        for (let i = I2.objs.length - 1; i >= 0; i--) if ((ERA_MIN[I2.objs[i].t] || 0) > yr) I2.objs.splice(i, 1);
      }
      return I2;
    }
    if (isSchoolBig(b)) {
      const I2 = buildSchool(b, floor, g);
      return I2;
    }
    if (isHospitalBig(b)) {
      const I2 = buildHospital(b, floor, g);
      return I2;
    }
    const bt = BTYPES[b.type];
    const kind = b.type === "onsenbath" || b.type === "sento" ? "onsen" : b.type === "airport" ? "airport" : b.type === "ferry" ? "ferry" : bt.interior || (b.type === "office" ? "office" : "unimpl");
    const { W: W2, H: H4 } = interiorSize(b);
    const floors = kind === "onsen" ? b.type === "onsenbath" ? 4 : 3 : b.floors || 1;
    const h = hash2(b.idx, 4242 + floor);
    const floorTile = { home: "floor_wood", shop: "floor_tile", food: "floor_wood", office: "floor_carpet", school: "floor_wood", hospital: "floor_tile", hotel: "floor_carpet", bath: "bath", shrine: "floor_tatami", station: "floor_tile", leisure: "floor_carpet", factory: "floor_tile", warehouse: "floor_tile", tower: "floor_tile", airport: "floor_marble", ferry: "floor_tile", onsen: "floor_wood" }[kind] || "floor_wood";
    const tiles = new Array(W2 * H4).fill(floorTile);
    for (let x = 0; x < W2; x++) tiles[x] = "wall";
    const objs = [];
    const occ = /* @__PURE__ */ new Set();
    const add = (t, x, y, act, label, solid = true, extra = {}) => {
      if (x < 0 || y < 1 || x >= W2 || y >= H4 - 1) return;
      const k = x + y * W2;
      if (occ.has(k)) return;
      occ.add(k);
      objs.push({ t, x, y, act, label, solid, ...extra });
    };
    const door = { x: W2 >> 1, y: H4 - 1 };
    tiles[door.x + door.y * W2] = "exit";
    occ.add(door.x + (H4 - 2) * W2);
    occ.add(door.x + (H4 - 3) * W2);
    const staffSpots = [], seatSpots = [];
    for (let x = 1; x < W2 - 1; x += 3) objs.push({ t: "window", x, y: 0, solid: true, deco: true });
    const stairsDef = [];
    if (floors > 1 && kind !== "onsen") {
      if (floor === 0) {
        add("stairs_up", W2 - 2, 1, "stairs", "2\u968E\u3078", false, { to: 1 });
        stairsDef.push({ x: W2 - 2, y: 1, to: 1 });
      } else {
        add("stairs_down", W2 - 2, 1, "stairs", "1\u968E\u3078", false, { to: floor - 1 });
        stairsDef.push({ x: W2 - 2, y: 1, to: floor - 1 });
        if (floor + 1 < floors) {
          add("stairs_up", W2 - 3, 1, "stairs", "\u4E0A\u306E\u968E\u3078", false, { to: floor + 1 });
          stairsDef.push({ x: W2 - 3, y: 1, to: floor + 1 });
        }
      }
    }
    const upper = floor > 0;
    const wideAdd = (t, x, y, w, h3, act, label, extra = {}) => {
      for (let yy = y; yy < y + h3; yy++) for (let xx = x; xx < x + w; xx++) {
        if (xx < 1 || xx >= W2 - 1 || yy < 1 || yy >= H4 - 1 || occ.has(xx + yy * W2)) return false;
      }
      for (let yy = y; yy < y + h3; yy++) for (let xx = x; xx < x + w; xx++) occ.add(xx + yy * W2);
      objs.push({ t, x, y, w, h: h3, act, label, solid: true, ...extra });
      return true;
    };
    const LAYOUT = KIND_LAYOUTS2[b.type];
    const LAYOUT_OK = LAYOUT && (!upper || LAYOUT.multi);
    if (LAYOUT_OK && LAYOUT({ W: W2, H: H4, add, wide: wideAdd, staffSpots, seatSpots, setFloor: (t) => {
      for (let i = W2; i < W2 * H4; i++) if (tiles[i] === floorTile) tiles[i] = t;
    }, b, bt, floor, floors, upper, g, door, tiles }) !== false) {
    } else switch (kind) {
      case "home":
        if (b.wa) {
          const dk = b.wa === "kaya" || b.wa === "kawara" || b.wa === "machiya";
          for (let y = 1; y < H4; y++) for (let x = 0; x < W2; x++) {
            const k = x + y * W2;
            if (tiles[k] === "exit") continue;
            tiles[k] = y >= H4 - 2 ? dk ? "floor_paving" : "floor_wood" : y === H4 - 3 ? "floor_wood" : "floor_tatami";
          }
          for (const o of objs) if (o.t === "window") o.shoji = true;
          add("tokonoma", 3, 1, null, "\u5E8A\u306E\u9593(\u639B\u8EF8\u3068\u82B1)", false);
          add("futon", 6, 1, "sleep", "\u5E03\u56E3(\u62BC\u5165\u308C\u304B\u3089\u51FA\u3057\u3066\u5BDD\u308B)");
          add("futon", 7, 1, "sleep", "\u5E03\u56E3");
          add("desk", 9, 1, "study", "\u6587\u673A");
          add("fridge", W2 - 3, 2, "fridge", "\u51B7\u8535\u5EAB");
          add("sink", W2 - 2, 3, "kitchen", "\u53F0\u6240(\u571F\u9593)");
          add("tv", 2, 4, "tv", "\u30C6\u30EC\u30D3");
          add("zabuton", 5, 4, "rest", "\u5EA7\u5E03\u56E3", false);
          add("zabuton", 8, 4, "rest", "\u5EA7\u5E03\u56E3", false);
          add("table", 6, 4, "meal", "\u3061\u3083\u3076\u53F0");
          add("plant", 1, H4 - 4, null, "\u76C6\u683D");
          add("doormat", door.x, H4 - 2, null, "", false);
          for (const [x, y] of [[5, 4], [8, 4], [6, 3], [7, 5]]) seatSpots.push({ x, y });
          staffSpots.push({ x: 7, y: 5 }, { x: 5, y: 3 }, { x: 9, y: 4 }, { x: 4, y: 3 }, { x: 8, y: 3 }, { x: 10, y: 4 });
          break;
        } else {
          add("bed", 1, 1, "sleep", "\u30D9\u30C3\u30C9");
          add("bed", 3, 1, "sleep", "\u30D9\u30C3\u30C9");
          add("desk", 6, 1, "study", "\u52C9\u5F37\u673A");
          add("fridge", W2 - 4, 1, "fridge", "\u51B7\u8535\u5EAB");
          add("sink", W2 - 3, 1, "kitchen", "\u53F0\u6240");
          add("tv", 2, 5, "tv", "\u30C6\u30EC\u30D3");
          add("sofa", 2, 6, "rest", "\u30BD\u30D5\u30A1", false);
          add("table", 7, 5, "meal", "\u3061\u3083\u3076\u53F0");
          add("chair", 6, 5, null, "", false);
          add("chair", 8, 5, null, "", false);
          add("plant", W2 - 2, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
          add("doormat", door.x, H4 - 2, null, "", false);
          for (const [x, y] of [[5, 4], [8, 4], [4, 6], [9, 6]]) seatSpots.push({ x, y });
          staffSpots.push({ x: 7, y: 6 }, { x: 5, y: 5 }, { x: 9, y: 5 }, { x: 4, y: 3 }, { x: 8, y: 3 }, { x: 10, y: 4 });
          break;
        }
      case "shop": {
        const rows2 = [2, 4];
        if (b.salon) {
          const lux = b.salon.k === "luxury", old = b.salon.k === "oldbarber" || b.salon.k === "barber";
          const n2 = lux ? 3 : old ? 2 : 3;
          for (let i = 0; i < n2; i++) {
            const x = 2 + i * 2;
            add("mirror", x, 1, null, "\u5927\u304D\u306A\u93E1", true, { deco: false });
            add("hairchair", x, 3, "hair", old ? "\u7406\u5BB9\u6905\u5B50(\u30AB\u30C3\u30C8\u30FB\u3072\u3052\u5243\u308A)" : lux ? "\u30E9\u30B0\u30B8\u30E5\u30A2\u30EA\u30FC\u30FB\u30C1\u30A7\u30A2(\u65BD\u8853\u5E2D)" : "\u65BD\u8853\u5E2D(\u30AB\u30C3\u30C8\u30FB\u30AB\u30E9\u30FC\u30FB\u30D1\u30FC\u30DE)");
            staffSpots.push({ x, y: 4 });
          }
          add("basin", W2 - 3, 2, "work", "\u30B7\u30E3\u30F3\u30D7\u30FC\u53F0(\u3053\u3053\u3067\u50CD\u304F)");
          add("basin", W2 - 3, 4, null, "\u30B7\u30E3\u30F3\u30D7\u30FC\u53F0");
          add("sofa", 2, H4 - 3, "rest", old ? "\u5F85\u5408\u306E\u9577\u6905\u5B50(\u65B0\u805E\u30FB\u30DE\u30F3\u30AC)" : "\u5F85\u5408\u30BD\u30D5\u30A1(\u96D1\u8A8C)", false);
          seatSpots.push({ x: 2, y: H4 - 3 });
          add("shelf", 7, 1, null, "\u30D8\u30A2\u30B1\u30A2\u5546\u54C1\u68DA");
          staffSpots.push({ x: W2 - 4, y: 3 });
        } else if (b.type === "clothes") {
          for (const y of rows2) for (let x = 1; x < W2 - 5; x += 2) add("rack", x, y, "fitting", "\u6D0B\u670D\u30E9\u30C3\u30AF(\u8A66\u7740\u3067\u304D\u307E\u3059)");
          add("fitting", W2 - 3, 1, "fitting", "\u8A66\u7740\u5BA4");
          add("fitting", W2 - 5, 1, "fitting", "\u8A66\u7740\u5BA4");
          add("mirror", 1, 1, null, "\u59FF\u898B", true, { deco: false });
        } else {
          for (const y of rows2) for (let x = 1; x < W2 - 4; x += 2) add("shelf", x, y, "shelf", b.type === "bookstore" || b.type === "library" ? "\u672C\u68DA" : "\u5546\u54C1\u68DA");
          if (b.type === "konbini" || b.type === "super") {
            for (let x = 2; x < W2 - 5; x += 2) add("fridge", x, 1, "shelf", "\u30C9\u30EA\u30F3\u30AF\u30FB\u65E5\u914D\u54C1\u306E\u51B7\u8535\u68DA");
          }
          if (b.type === "dept" || b.type === "mall") {
            add("rack", 2, 6, "fitting", "\u6D0B\u670D\u58F2\u308A\u5834(\u8A66\u7740\u3067\u304D\u307E\u3059)");
            add("rack", 4, 6, "fitting", "\u6D0B\u670D\u58F2\u308A\u5834(\u8A66\u7740\u3067\u304D\u307E\u3059)");
            add("fitting", W2 - 3, 1, "fitting", "\u8A66\u7740\u5BA4");
          }
        }
        add("register", W2 - 3, H4 - 3, "register", "\u30EC\u30B8");
        add("counter", W2 - 4, H4 - 3, null, "", true);
        add("counter", W2 - 2, H4 - 3, null, "", true);
        staffSpots.push({ x: W2 - 3, y: H4 - 4 }, { x: 3, y: 3 }, { x: 5, y: 5 }, { x: 8, y: 3 });
        break;
      }
      case "food": {
        for (let i = 0; i < 4; i++) {
          const x = 2 + i % 2 * 4, y = 4 + (i / 2 | 0) * 2;
          add("table", x, y, "order", "\u30C6\u30FC\u30D6\u30EB\u5E2D");
          add("chair", x - 1, y, null, "", false);
          add("chair", x + 1, y, null, "", false);
          seatSpots.push({ x: x - 1, y }, { x: x + 1, y });
        }
        add("counter", W2 - 5, 2, "order", "\u30AB\u30A6\u30F3\u30BF\u30FC\u5E2D");
        add("counter", W2 - 4, 2, "order", "\u30AB\u30A6\u30F3\u30BF\u30FC\u5E2D");
        add("counter", W2 - 3, 2, "order", "\u30AB\u30A6\u30F3\u30BF\u30FC\u5E2D");
        add("sink", W2 - 5, 1, null, "\u53A8\u623F");
        add("fridge", W2 - 3, 1, null, "\u51B7\u8535\u5EAB");
        staffSpots.push({ x: W2 - 4, y: 1 }, { x: W2 - 2, y: 3 }, { x: 4, y: 4 }, { x: 6, y: 6 });
        break;
      }
      case "office": {
        const hall = !!bt.hall;
        if (b.type === "bank") {
          add("counter", 3, 3, "bank", "\u7A93\u53E3(\u4F4F\u5B85\u30ED\u30FC\u30F3\u30FB\u7A4D\u7ACB\u6295\u8CC7)");
          add("counter", 4, 3, "bank", "\u7A93\u53E3(\u4F4F\u5B85\u30ED\u30FC\u30F3\u30FB\u7A4D\u7ACB\u6295\u8CC7)");
          staffSpots.push({ x: 3, y: 2 }, { x: 4, y: 2 });
        }
        if (hall) {
          add("counter", 3, 3, "hall", "\u7A93\u53E3");
          add("counter", 4, 3, "hall", "\u7A93\u53E3");
          add("counter", 5, 3, "hall", "\u7A93\u53E3");
          add("board", 8, 1, "board", "\u63B2\u793A\u677F(\u6C42\u4EBA\u30FB\u304A\u77E5\u3089\u305B)");
          staffSpots.push({ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 5, y: 2 });
        }
        add("desk", 2, 6 - (hall ? 0 : 3), "work", "\u5E2D");
        for (let y = hall ? 6 : 3; y < H4 - 3; y += 3) for (let x = 2; x < W2 - 2; x += 3) add("desk", x, y, "work", "\u5E2D");
        if (b.voc) {
          add("counter", 3, 3, "voc", "\u5165\u5B66\u76F8\u8AC7\u30FB\u5B66\u751F\u7A93\u53E3(\u5C02\u9580\u5B66\u6821)");
          add("counter", 4, 3, "voc", "\u5165\u5B66\u76F8\u8AC7\u30FB\u5B66\u751F\u7A93\u53E3(\u5C02\u9580\u5B66\u6821)");
          staffSpots.push({ x: 3, y: 2 }, { x: 4, y: 2 });
        }
        add("board", W2 - 3, 1, "board", "\u63B2\u793A\u677F");
        add("plant", 1, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
        for (let y = 3; y < H4 - 3; y += 3) for (let x = 2; x < W2 - 2; x += 3) staffSpots.push({ x, y: y + 1 });
        break;
      }
      case "school": {
        if (upper) {
          for (let y = 3; y < H4 - 3; y += 2) for (let x = 2; x < W2 - 4; x += 2) {
            add("desk", x, y, "class", "\u673A");
            seatSpots.push({ x, y: y + 1 });
          }
          add("board", 5, 1, "board", "\u9ED2\u677F");
          staffSpots.push({ x: 6, y: 2 });
        } else {
          for (let y = 3; y < H4 - 3; y += 2) for (let x = 2; x < W2 - 6; x += 2) {
            add("desk", x, y, "class", "\u673A");
            seatSpots.push({ x, y: y + 1 });
          }
          add("board", 4, 1, "board", "\u9ED2\u677F");
          add("locker", W2 - 4, 2, "locker", "\u4E0B\u99C4\u7BB1");
          add("locker", W2 - 3, 2, "locker", "\u4E0B\u99C4\u7BB1");
          staffSpots.push({ x: 5, y: 2 }, { x: W2 - 5, y: H4 - 3 });
        }
        break;
      }
      case "hospital": {
        if (upper) {
          for (let x = 1; x < W2 - 4; x += 3) {
            add("hospital_bed", x, 2, "ward", "\u75C5\u5E8A");
            add("hospital_bed", x, 5, "ward", "\u75C5\u5E8A");
            seatSpots.push({ x: x + 1, y: 3 });
          }
          staffSpots.push({ x: 4, y: 4 }, { x: 8, y: 4 });
        } else {
          add("counter", 3, 3, "clinic", "\u53D7\u4ED8\u30FB\u8A3A\u5BDF");
          add("counter", 4, 3, "clinic", "\u53D7\u4ED8\u30FB\u8A3A\u5BDF");
          add("hospital_bed", 8, 1, "checkup", "\u8A3A\u5BDF\u53F0");
          add("seat", 2, 6, null, "\u5F85\u5408\u5E2D", false);
          add("seat", 4, 6, null, "\u5F85\u5408\u5E2D", false);
          add("seat", 6, 6, null, "\u5F85\u5408\u5E2D", false);
          staffSpots.push({ x: 4, y: 2 }, { x: 9, y: 3 }, { x: 7, y: 4 });
          if (b.type === "nursing" || b.type === "hospital") {
            add("hospital_bed", 11, 2, "ward", "\u75C5\u5E8A");
          }
          add("clock", 6, 1, null, "\u58C1\u639B\u3051\u6642\u8A08", false);
          add("board", 2, 1, null, "\u304A\u77E5\u3089\u305B(\u8A3A\u7642\u6642\u9593\u30FB\u4E88\u9632\u63A5\u7A2E)", true);
          add("curtain", 6, 2, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 1 });
          add("handrail", 1, 1, null, "\u624B\u3059\u308A", false, { w: 1 });
          add("dirsign", W2 - 3, 5, null, "\u9662\u5185\u6848\u5185\u677F", true);
          add("mrack", 1, H4 - 3, null, "\u96D1\u8A8C\u68DA", true);
          add("watersrv", W2 - 2, 4, null, "\u7D66\u6C34\u6A5F", true);
          add("sofa", 1, 7, "rest", "\u5F85\u5408\u30BD\u30D5\u30A1", false, { w: 2 });
          add("plant", W2 - 2, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
          add("plant", 1, 2, null, "\u89B3\u8449\u690D\u7269");
        }
        break;
      }
      case "hotel": {
        add("counter", 3, 3, "stay", "\u30D5\u30ED\u30F3\u30C8");
        add("counter", 4, 3, "stay", "\u30D5\u30ED\u30F3\u30C8");
        add("sofa", 8, 5, "rest", "\u30ED\u30D3\u30FC\u306E\u30BD\u30D5\u30A1", false);
        add("plant", 1, 2, null, "\u89B3\u8449\u690D\u7269");
        add("plant", W2 - 2, 2, null, "\u89B3\u8449\u690D\u7269");
        if (bt.onsen) {
          add("bath", W2 - 4, 2, "bath", "\u5927\u6D74\u5834(\u5185\u6E6F)", false, { tub: "stone" });
          add("bath", W2 - 3, 2, "bath", "\u5927\u6D74\u5834(\u5185\u6E6F)", false, { tub: "stone" });
          add("wash", W2 - 4, 4, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
          add("wash", W2 - 3, 4, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
          add("lamp", W2 - 5, 2, null, "\u884C\u706F", true);
          add("rock", W2 - 2, 2, null, "\u81EA\u7136\u77F3", true);
        }
        staffSpots.push({ x: 4, y: 2 }, { x: 6, y: 4 });
        break;
      }
      case "bath": {
        for (let x = 2; x < W2 - 2; x += 3) add("bath", x, 3, "bath", "\u6E6F\u8239", false);
        add("counter", 2, H4 - 3, "pay", "\u756A\u53F0");
        add("locker", W2 - 3, 1, "locker", "\u8131\u8863\u30ED\u30C3\u30AB\u30FC");
        staffSpots.push({ x: 3, y: H4 - 4 });
        break;
      }
      case "shrine": {
        add("altar", W2 >> 1, 2, "pray", "\u672C\u6BBF");
        add("plant", 2, 4, null, "", true);
        add("plant", W2 - 3, 4, null, "", true);
        add("counter", 2, H4 - 3, "omamori", "\u304A\u5B88\u308A\u6388\u4E0E\u6240");
        staffSpots.push({ x: 3, y: H4 - 4 }, { x: (W2 >> 1) + 1, y: 3 });
        break;
      }
      case "onsen": {
        const rot = b.type === "onsenbath", big = h % 3 === 0, hinoki = (h >>> 3) % 2 === 0;
        if (floor === 0) {
          for (let y = 1; y < H4; y++) for (let x = 0; x < W2; x++) if (tiles[x + y * W2] !== "exit") tiles[x + y * W2] = "floor_wood";
          add("counter", 2, 3, "reception", "\u53D7\u4ED8(\u5165\u6D74\u5238)");
          add("counter", 3, 3, "reception", "\u53D7\u4ED8(\u5165\u6D74\u5238)");
          add("locker", 1, H4 - 3, "locker", "\u4E0B\u8DB3\u7BB1");
          add("locker", 2, H4 - 3, "locker", "\u4E0B\u8DB3\u7BB1");
          if (b.type === "onsenbath") add("noren", (W2 >> 1) - 1, 1, "stairs", "\u5BB6\u65CF\u98A8\u5442(\u8CB8\u5207)\u3078(\u306E\u308C\u3093)", false, { to: 3, gate: "K", family: true });
          add("noren", 1, 1, "stairs", "\u7537\u6E6F(\u306E\u308C\u3093)", false, { to: 1, gate: "M" });
          add("noren", W2 - 3, 1, "stairs", "\u5973\u6E6F(\u306E\u308C\u3093)", false, { to: 2, gate: "F" });
          add("vending", W2 - 2, 3, "milk", "\u725B\u4E73\u30FB\u98F2\u307F\u7269\u306E\u81EA\u52D5\u8CA9\u58F2\u6A5F");
          add("seat", 5, 4, "rest", "\u4F11\u61A9\u6240\u306E\u5EA7\u5E03\u56E3", false);
          add("seat", 6, 4, "rest", "\u4F11\u61A9\u6240\u306E\u5EA7\u5E03\u56E3", false);
          add("seat", 5, 5, "rest", "\u4F11\u61A9\u6240", false);
          add("plant", W2 - 2, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
          staffSpots.push({ x: 2, y: 4 }, { x: 5, y: 6 });
          seatSpots.push({ x: 5, y: 4 }, { x: 6, y: 4 });
        } else {
          if (floor === 3) {
            for (let y = 1; y < H4; y++) for (let x = 0; x < W2; x++) tiles[x + y * W2] = y >= H4 - 3 ? "floor_wood" : "bath";
            tiles[door.x + door.y * W2] = "exit";
            add("noren", 1, H4 - 2, "stairs", "\u53D7\u4ED8\u30ED\u30D3\u30FC\u3078(\u306E\u308C\u3093)", false, { to: 0 });
            const pw = (x, y) => add("pwall", x, y, null, "\u4ED5\u5207\u308A", true);
            for (let y = 1; y <= H4 - 4; y++) pw(8, y);
            for (let x = 0; x < W2 - 1; x++) if (x !== 4 && x !== 11) pw(x, H4 - 4);
            add("doormat", 4, H4 - 4, null, "\u8CB8\u5207\u98A8\u5442A(\u5185\u6E6F)", false);
            add("doormat", 11, H4 - 4, null, "\u8CB8\u5207\u98A8\u5442B(\u9732\u5929\u3064\u304D)", false);
            add("bath", 1, 2, "bath", "\u6A9C\u306E\u5185\u6E6F(\u5BB6\u65CF\u98A8\u5442A)", false, { tub: "hinoki" });
            add("bath", 2, 2, "bath", "\u6A9C\u306E\u5185\u6E6F(\u5BB6\u65CF\u98A8\u5442A)", false, { tub: "hinoki" });
            add("bath", 3, 2, "bath", "\u6A9C\u306E\u5185\u6E6F(\u5BB6\u65CF\u98A8\u5442A)", false, { tub: "hinoki" });
            add("wash", 5, 3, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
            add("wash", 6, 3, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
            add("lamp", 6, 5, null, "\u884C\u706F", true);
            for (let i = 0; i < 3; i++) add("rotenbath", 12 + i, 2, "bath", "\u9732\u5929\u98A8\u5442(\u5BB6\u65CF\u98A8\u5442B\u30FB\u5CA9\u98A8\u5442)", false);
            for (let x = 11; x < W2 - 1; x++) add("fence", x, 1, null, "\u6728\u306E\u67F5", true);
            add("rock", 11, 3, null, "\u81EA\u7136\u77F3", true);
            add("rock", W2 - 2, 3, null, "\u81EA\u7136\u77F3", true);
            add("lamp", 11, 2, null, "\u884C\u706F", true);
            objs.push({ t: "rotenview", x: 11, y: 0, w: W2 - 11, act: null, label: "\u9732\u5929\u306E\u5EAD", solid: true });
            add("wash", 9, 3, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
            add("wash", 10, 3, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
            add("seat", 9, 5, "rest", "\u6E6F\u4E0A\u304C\u308A\u306E\u4F11\u61A9\u30D9\u30F3\u30C1", false);
            add("seat", 3, 5, "rest", "\u6E6F\u4E0A\u304C\u308A\u306E\u4F11\u61A9\u30D9\u30F3\u30C1", false);
            add("locker", 2, H4 - 6, "locker", "\u8131\u8863\u304B\u3054", false);
            add("locker", 13, H4 - 6, "locker", "\u8131\u8863\u304B\u3054", false);
            seatSpots.push({ x: 3, y: 5 }, { x: 9, y: 5 });
            break;
          }
          const side = floor === 1 ? "M" : "F";
          for (let y = 1; y < H4; y++) for (let x = 0; x < W2; x++) tiles[x + y * W2] = y >= H4 - 3 ? "floor_wood" : "bath";
          tiles[door.x + door.y * W2] = "exit";
          add("noren", 1, H4 - 2, "stairs", "\u53D7\u4ED8\u30ED\u30D3\u30FC\u3078(\u306E\u308C\u3093)", false, { to: 0, gate: side });
          for (let i = 0; i < 4; i++) add("locker", 3 + i, H4 - 2, "locker", "\u8131\u8863\u30ED\u30C3\u30AB\u30FC");
          add("vanity", W2 - 3, H4 - 2, null, "\u6D17\u9762\u53F0");
          add("toilet", W2 - 2, H4 - 3, null, "\u30C8\u30A4\u30EC");
          for (let i = 0; i < (big ? 4 : 3); i++) add("wash", 1 + i * 2, H4 - 5, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
          add("bath", 1, 2, "bath", hinoki ? "\u6A9C\u306E\u5185\u6E6F" : "\u5185\u6E6F", false, { tub: hinoki ? "hinoki" : "stone" });
          add("bath", 2, 2, "bath", hinoki ? "\u6A9C\u306E\u5185\u6E6F" : "\u5185\u6E6F", false, { tub: hinoki ? "hinoki" : "stone" });
          if (rot) {
            const rx = W2 - (big ? 5 : 4);
            for (let i = 0; i < (big ? 3 : 2); i++) add("rotenbath", rx + i, 2, "bath", "\u9732\u5929\u98A8\u5442(\u5CA9\u98A8\u5442)", false);
            for (let x = rx - 1; x < W2; x++) add("fence", x, 1, null, "\u6728\u306E\u67F5", true);
            add("rock", rx - 1, 3, null, "\u81EA\u7136\u77F3", true);
            add("rock", W2 - 1, 3, null, "\u81EA\u7136\u77F3", true);
            add("lamp", rx - 1, 2, null, "\u884C\u706F", true);
            objs.push({ t: "rotenview", x: rx - 1, y: 0, w: W2 - (rx - 1), act: null, label: "\u9732\u5929\u306E\u5EAD", solid: true, w2: 1 });
          }
          add("seat", 5, 3, "rest", "\u8131\u8863\u6240\u306E\u30D9\u30F3\u30C1", false);
          staffSpots.push({ x: 4, y: H4 - 4 });
          seatSpots.push({ x: 5, y: 3 });
        }
        break;
      }
      case "airport": {
        if (!upper) {
          for (let i = 0; i < 4; i++) add("counter", 3 + i * 2, 3, "checkin", "\u642D\u4E57\u624B\u7D9A\u304D\u30AB\u30A6\u30F3\u30BF\u30FC(\u822A\u7A7A\u5238)");
          add("board", 12, 1, "jinfo", "\u51FA\u767A\u6848\u5185(\u30D5\u30E9\u30A4\u30C8)");
          add("board", 16, 1, "jinfo", "\u51FA\u767A\u6848\u5185(\u30D5\u30E9\u30A4\u30C8)");
          add("counter", W2 - 4, 4, "shuttle", "\u7A7A\u6E2F\u9023\u7D61\u30D0\u30B9\u4E57\u308A\u5834(\u7A7A\u6E2F\u99C5\u884C\u304D)");
          add("seat", 3, 7, null, "\u5F85\u5408\u5E2D", false);
          add("seat", 5, 7, null, "\u5F85\u5408\u5E2D", false);
          add("seat", 10, 7, null, "\u5F85\u5408\u5E2D", false);
          add("plant", 1, 2, null, "\u89B3\u8449\u690D\u7269");
          add("plant", W2 - 2, 6, null, "\u89B3\u8449\u690D\u7269");
          staffSpots.push({ x: 4, y: 2 }, { x: 8, y: 2 }, { x: 12, y: 5 });
        } else {
          for (let i = 0; i < 3; i++) add("counter", 2 + i, 4, "security", "\u4FDD\u5B89\u691C\u67FB\u5834");
          for (let i = 0; i < 3; i++) {
            add("counter", 10 + i * 4, 3, "gate", `\u642D\u4E57\u53E3${i + 1}(\u822A\u7A7A\u6A5F\u3078)`);
            add("board", 10 + i * 4, 1, "jinfo", `\u642D\u4E57\u53E3${i + 1} \u6848\u5185`);
          }
          add("seat", 9, 5, null, "\u642D\u4E57\u5F85\u5408\u5E2D", false);
          add("seat", 13, 5, null, "\u642D\u4E57\u5F85\u5408\u5E2D", false);
          add("seat", 17, 5, null, "\u642D\u4E57\u5F85\u5408\u5E2D", false);
          add("window", 14, 1, "view", "\u99D0\u6A5F\u5834\u306E\u822A\u7A7A\u6A5F\u304C\u898B\u3048\u308B\u7A93", true);
          staffSpots.push({ x: 5, y: 3 }, { x: 11, y: 3 }, { x: 15, y: 3 });
        }
        break;
      }
      case "ferry": {
        add("counter", 3, 3, "ferryticket", "\u4E57\u8239\u5238\u58F2\u5834");
        add("counter", 4, 3, "ferryticket", "\u4E57\u8239\u5238\u58F2\u5834");
        add("board", 7, 1, "jinfo", "\u51FA\u822A\u6848\u5185");
        add("exit", W2 - 3, 2, "boardship", "\u4E57\u8239\u53E3(\u685F\u6A4B\u30FB\u8239\u3078)", false);
        add("seat", 2, 6, null, "\u5F85\u5408\u30D9\u30F3\u30C1", false);
        add("seat", 4, 6, null, "\u5F85\u5408\u30D9\u30F3\u30C1", false);
        add("seat", 6, 6, null, "\u5F85\u5408\u30D9\u30F3\u30C1", false);
        add("plant", 1, 2, null, "\u89B3\u8449\u690D\u7269");
        staffSpots.push({ x: 3, y: 2 }, { x: W2 - 4, y: 3 });
        break;
      }
      case "station": {
        const bullet = !!(g && g.world && g.world.map.hubs && g.world.map.hubs.some((h3) => h3.kind === "shinkansen" && h3.stationId === b.stationId));
        if (bullet) {
          add("counter", 9, 2, "bullet", "\u65B0\u5E79\u7DDA\u304D\u3063\u3077\u58F2\u308A\u5834");
          add("counter", 10, 2, "bullet", "\u65B0\u5E79\u7DDA\u304D\u3063\u3077\u58F2\u308A\u5834");
          add("exit", W2 - 3, 4, "bulletgate", "\u65B0\u5E79\u7DDA\u6539\u672D(\u306E\u308A\u3070\u3078)", false);
          add("board", 12, 1, "jinfo", "\u65B0\u5E79\u7DDA\u767A\u8ECA\u6848\u5185");
        }
        if (b.stationId === "kuko") add("counter", 6, 5, "shuttle", "\u7A7A\u6E2F\u9023\u7D61\u30D0\u30B9\u4E57\u308A\u5834(\u30BF\u30FC\u30DF\u30CA\u30EB\u884C\u304D)");
        add("counter", 2, 2, "ticket", "\u5238\u58F2\u6A5F\u30FB\u6539\u672D");
        add("counter", 3, 2, "ticket", "\u5238\u58F2\u6A5F\u30FB\u6539\u672D");
        add("board", 6, 1, "timetable", "\u6642\u523B\u8868\u30FB\u8DEF\u7DDA\u56F3");
        add("exit", W2 - 3, 2, "platform", "\u30DB\u30FC\u30E0\u3078(\u4E57\u8ECA)", false);
        add("seat", 2, 6, null, "\u30D9\u30F3\u30C1", false);
        add("seat", 4, 6, null, "\u30D9\u30F3\u30C1", false);
        staffSpots.push({ x: 3, y: 1 }, { x: W2 - 4, y: 3 });
        break;
      }
      case "leisure": {
        for (let x = 2; x < W2 - 2; x += 3) {
          add("arcade", x, 2, "play", b.type === "cinema" ? "\u30B9\u30AF\u30EA\u30FC\u30F3\u5E2D" : b.type === "gym" ? "\u30C8\u30EC\u30FC\u30CB\u30F3\u30B0\u6A5F\u5668" : "\u904A\u622F" + x);
          add("arcade", x, 5, "play", b.type === "cinema" ? "\u30B9\u30AF\u30EA\u30FC\u30F3\u5E2D" : b.type === "gym" ? "\u30C8\u30EC\u30FC\u30CB\u30F3\u30B0\u6A5F\u5668" : "\u904A\u622F" + x);
        }
        add("counter", W2 - 3, H4 - 3, "pay", "\u53D7\u4ED8");
        staffSpots.push({ x: W2 - 3, y: H4 - 4 }, { x: 5, y: 4 });
        break;
      }
      case "factory": {
        for (let x = 2; x < W2 - 2; x += 3) {
          add("arcade", x, 3, "work", "\u6A5F\u68B0");
          add("arcade", x, 6, "work", "\u6A5F\u68B0");
          staffSpots.push({ x, y: 4 }, { x, y: 7 });
        }
        add("locker", W2 - 2, 1, "locker", "\u30ED\u30C3\u30AB\u30FC");
        break;
      }
      case "warehouse": {
        const wide = (t, x, y, w, h3, act, label, extra = {}) => {
          for (let yy = y; yy < y + h3; yy++) for (let xx = x; xx < x + w; xx++) {
            if (xx >= W2 - 1 || yy >= H4 - 1) return false;
            if (occ.has(xx + yy * W2)) return false;
          }
          for (let yy = y; yy < y + h3; yy++) for (let xx = x; xx < x + w; xx++) occ.add(xx + yy * W2);
          objs.push({ t, x, y, w, h: h3, act, label, solid: true, ...extra });
          return true;
        };
        const logi = b.type === "logistics", fish = b.type === "pier";
        if (logi) {
          for (const y of [2, 5]) {
            if (wide("conveyor", 2, y, Math.min(W2 - 6, 8), 1, "work", "\u4ED5\u5206\u3051\u30E9\u30A4\u30F3")) {
              for (let x = 2; x < Math.min(W2 - 4, 10); x += 3) {
                staffSpots.push({ x, y: y + 1 });
              }
            }
          }
          for (let x = 2; x < W2 - 4; x += 2) wide("parcel", x, 1, 2, 1, null, "\u4ED5\u5206\u3051\u524D\u306E\u8377\u7269");
          for (const x of [W2 - 3]) for (const y of [3, 5]) wide("pallet", x, y, 1, 1, "work", "\u51FA\u8377\u30D1\u30EC\u30C3\u30C8(\u691C\u54C1\u30FB\u7A4D\u307F\u4ED8\u3051)");
          wide("forklift", W2 - 4, H4 - 3, 1, 1, null, "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8");
          for (let x = 3; x < W2 - 5; x += 3) wide("palrack", x, 8, 1, 2, null, "\u30D1\u30EC\u30C3\u30C8\u30E9\u30C3\u30AF");
        } else {
          for (let x = 2; x < W2 - 4; x += 3) for (const y of [2, 6]) {
            if (y + 1 >= H4 - 2) continue;
            if (wide("palrack", x, y, 1, 2, null, fish ? "\u7DB2\u30FB\u6F01\u5177\u306E\u68DA" : "\u30D1\u30EC\u30C3\u30C8\u30E9\u30C3\u30AF")) staffSpots.push({ x: x + 1, y: y + 1 });
          }
          for (const y of [2, 4, 6]) if (y < H4 - 3) wide("pallet", W2 - 3, y, 1, 1, "work", fish ? "\u6C34\u63DA\u3052\u3057\u305F\u9B5A\u306E\u7BB1(\u9078\u5225)" : "\u8377\u3055\u3070\u304D(\u691C\u54C1\u30FB\u4ED5\u5206\u3051)");
          wide("forklift", W2 - 5, H4 - 3, 1, 1, null, "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8");
        }
        add("locker", W2 - 2, 1, "locker", "\u30ED\u30C3\u30AB\u30FC");
        add("desk", 1, 1, "work", "\u4E8B\u52D9\u673A(\u4F1D\u7968\u6574\u7406)");
        staffSpots.push({ x: 2, y: 2 });
        break;
      }
      case "showroom": {
        const bigAdd = (t, x, y, w, h3, act, label, extra = {}) => {
          for (let yy = y; yy < y + h3; yy++) for (let xx = x; xx < x + w; xx++) occ.add(xx + yy * W2);
          objs.push({ t, x, y, w, h: h3, act, label, solid: true, ...extra });
        };
        const n2 = W2 >= 14 ? 3 : 2;
        for (let i = 0; i < n2; i++) bigAdd("showcar", 2 + i * 4 + (n2 === 2 ? 2 : 0), 2, 2, 4, "dealer", b.type === "usedcar" ? "\u5C55\u793A\u4E2D\u306E\u4E2D\u53E4\u8ECA" : "\u5C55\u793A\u8ECA(\u898B\u7A4D\u308A\u30FB\u8CFC\u5165\u30FB\u8A66\u4E57)", { slot: i });
        add("counter", W2 - 4, H4 - 4, "dealer", "\u5546\u8AC7\u30AB\u30A6\u30F3\u30BF\u30FC");
        add("counter", W2 - 3, H4 - 4, "dealer", "\u5546\u8AC7\u30AB\u30A6\u30F3\u30BF\u30FC");
        add("desk", W2 - 2, H4 - 5, null, "\u4E8B\u52D9\u673A");
        add("plant", 1, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
        add("plant", W2 - 2, 2, null, "\u89B3\u8449\u690D\u7269");
        add("board", 3, 1, "board", "\u30AD\u30E3\u30F3\u30DA\u30FC\u30F3\u6848\u5185");
        staffSpots.push({ x: W2 - 4, y: H4 - 5 }, { x: W2 - 3, y: H4 - 5 }, { x: 6, y: H4 - 4 });
        break;
      }
      case "tower": {
        if (upper) {
          add("window", 3, 1, "view", "\u5C55\u671B\u7A93", true);
          add("window", 7, 1, "view", "\u5C55\u671B\u7A93", true);
          add("window", 11, 1, "view", "\u5C55\u671B\u7A93", true);
        } else {
          add("counter", 3, 3, "pay", "\u5C55\u671B\u53F0\u53D7\u4ED8");
          staffSpots.push({ x: 4, y: 2 });
        }
        break;
      }
      case "unimpl": {
        add("board", 3, 1, "board", "(\u3053\u306E\u65BD\u8A2D\u306E\u5185\u90E8\u306F\u672A\u5B9F\u88C5\u3067\u3059)");
        break;
      }
      default:
        add("desk", 3, 3, "work", "\u5E2D");
    }
    if (!upper || b.type === "office") enrich({ W: W2, H: H4, add, b, occupied: (x, y) => occ.has(x + y * W2) });
    if (floors > 1 && b.type === "office" && !objs.some((o) => o.t === "elev")) addLift({ W: W2, floors, wide: wideAdd });
    if (g && g.year) {
      const yr = g.year();
      for (let i = objs.length - 1; i >= 0; i--) if ((ERA_MIN[objs[i].t] || 0) > yr) objs.splice(i, 1);
    }
    return { W: W2, H: H4, floors, floor, kind, tiles, objs, door, stairs: stairsDef, staffSpots, seatSpots, accessible: floors === 1 || hasElevator(b), family: kind === "onsen" && floor === 3 };
  }
  var ERA_MIN = { arcade: 1978, vending: 1965, tv: 1955 };
  var PC_YEAR = 1985;
  var FLATPANEL_YEAR = 2003;
  var eraBucket = (y) => Math.floor((y || 0) / 5);
  function interiorSolid(I2) {
    const s = new Uint8Array(I2.W * I2.H);
    for (let x = 0; x < I2.W; x++) s[x] = 1;
    if (I2.noDoor) for (let x = 0; x < I2.W; x++) s[x + (I2.H - 1) * I2.W] = 1;
    for (const o of I2.objs) if (o.solid && !o.deco) {
      for (let yy = o.y; yy < o.y + (o.h || 1); yy++) for (let xx = o.x; xx < o.x + (o.w || 1); xx++) if (xx < I2.W && yy < I2.H) s[xx + yy * I2.W] = 1;
    }
    for (const o of I2.objs) if (o.deco) s[o.x + o.y * I2.W] = 1;
    return s;
  }

