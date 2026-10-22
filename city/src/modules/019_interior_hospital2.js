  // src/interior_hospital2.js
  var isHospitalV2 = (b) => b.type === "hospital" && b.w >= 16;
  function buildHospital2(b, floor, g) {
    const W2 = 44, H4 = 24, floors = 4;
    const tiles = new Array(W2 * H4).fill("floor_tile");
    const objs = [];
    const occ = /* @__PURE__ */ new Set();
    const staffSpots = [], seatSpots = [], rooms = [];
    const add = (t, x, y, act, label2, solid = true, extra = {}) => {
      if (x < 0 || y < 1 || x >= W2 || y >= H4 - 1) return false;
      const k = x + y * W2;
      if (occ.has(k)) return false;
      occ.add(k);
      objs.push({ t, x, y, act, label: label2, solid, ...extra });
      return true;
    };
    const wide = (t, x, y, w, h, act, label2, extra = {}) => {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (xx < 1 || xx >= W2 - 1 || yy < 1 || yy >= H4 - 1 || occ.has(xx + yy * W2)) return false;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) occ.add(xx + yy * W2);
      objs.push({ t, x, y, w, h, act, label: label2, solid: true, ...extra });
      return true;
    };
    const wall = (x, y) => add("pwall", x, y, null, "\u58C1", true);
    const floorRect = (x0, y0, x1, y1, tp) => {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && y >= 1 && x < W2 && y < H4) tiles[x + y * W2] = tp;
    };
    for (let x = 0; x < W2; x++) tiles[x] = "wall";
    const door = { x: 22, y: H4 - 1 };
    if (floor === 0) {
      tiles[door.x + door.y * W2] = "exit";
      occ.add(door.x + (H4 - 2) * W2);
      occ.add(door.x + (H4 - 3) * W2);
    }
    for (let x = 1; x < W2 - 1; x += 3) objs.push({ t: "window", x, y: 0, solid: true, deco: true });
    const stairsDef = [];
    const stY = 8;
    if (floor === 0) {
      add("stairs_up", W2 - 2, stY, "stairs", "2\u968E(\u5C02\u9580\u5916\u6765\u30FB\u691C\u67FB)\u3078", false, { to: 1 });
      stairsDef.push({ x: W2 - 2, y: stY, to: 1 });
    } else {
      add("stairs_down", W2 - 2, stY, "stairs", `${floor}\u968E\u3078`, false, { to: floor - 1 });
      stairsDef.push({ x: W2 - 2, y: stY, to: floor - 1 });
      if (floor + 1 < floors) {
        add("stairs_up", W2 - 2, stY - 2, "stairs", "\u4E0A\u306E\u968E\u3078", false, { to: floor + 1 });
        stairsDef.push({ x: W2 - 2, y: stY - 2, to: floor + 1 });
      }
    }
    for (let i = 0; i < 2; i++) wide("elev", 34 + i * 3, 9, 2, 1, "lift", `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC${i + 1}\u53F7\u6A5F`, { shaft: i, lo: 0, hi: floors - 1 });
    const roomRow = (names, kind) => {
      names.forEach((nm, k) => {
        const x0 = 1 + 4 * k;
        for (let y = 1; y <= 5; y++) wall(x0 + 3, y);
        for (let x = x0; x <= x0 + 2; x++) if (x !== x0 + 1) wall(x, 5);
        add("doormat", x0 + 1, 5, null, nm, false);
        if (kind === "consult") {
          add("hospital_bed", x0, 1, "checkup", `${nm}\u306E\u8A3A\u5BDF\u53F0`, true);
          add("desk", x0 + 2, 1, "work", "\u533B\u5E2B\u306E\u673A(\u96FB\u5B50\u30AB\u30EB\u30C6)", true);
          add("chair", x0 + 2, 3, null, "\u60A3\u8005\u306E\u6905\u5B50", false);
          add("shelf", x0, 3, null, "\u533B\u7642\u7528\u54C1\u68DA", true);
          add("curtain", x0, 2, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 1 });
          staffSpots.push({ x: x0 + 2, y: 2, role: "doctor" });
          rooms.push({ name: nm, bed: { x: x0, y: 1 } });
        } else if (kind === "ward") {
          add("hospital_bed", x0 + 2, 2, "ward", `${nm}\u306E\u30D9\u30C3\u30C9`, true);
          add("chair", x0, 3, null, "\u4ED8\u304D\u6DFB\u3044\u306E\u6905\u5B50", false);
          add("curtain", x0 + 2, 1, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 1 });
          add("plant", x0, 1, null, "\u82B1", true);
          rooms.push({ name: nm, bed: { x: x0 + 2, y: 2 } });
        } else if (kind === "exam") {
          add("hospital_bed", x0 + 1, 2, "checkup", `${nm}\u306E\u691C\u67FB\u53F0`, true);
          add("desk", x0, 1, "work", "\u691C\u67FB\u6280\u5E2B\u306E\u673A", true);
          add("cabinet", x0 + 2, 1, null, "\u691C\u67FB\u6A5F\u5668", true);
          staffSpots.push({ x: x0, y: 2, role: "nurse" });
          rooms.push({ name: nm, bed: { x: x0 + 1, y: 2 } });
        }
      });
    };
    floorRect(1, 6, W2 - 2, 8, "floor_corr");
    let label = "1\u968E(\u5916\u6765\u30FB\u6551\u6025)";
    const corridorFurn = (seatRow = true) => {
      if (seatRow) for (let k = 0; k < 10; k++) {
        const x0 = 1 + 4 * k;
        add("seat", x0, 7, null, "\u8A3A\u5BDF\u5F85\u3061\u306E\u5E2D", false);
        add("seat", x0 + 2, 7, null, "\u8A3A\u5BDF\u5F85\u3061\u306E\u5E2D", false);
        seatSpots.push({ x: x0, y: 7 }, { x: x0 + 2, y: 7 });
      }
    };
    if (floor === 0) {
      roomRow(["\u5185\u79D11", "\u5185\u79D12", "\u5185\u79D13", "\u5916\u79D1", "\u6574\u5F62\u5916\u79D1", "\u5C0F\u5150\u79D1", "\u8033\u9F3B\u54BD\u5589\u79D1", "\u773C\u79D1", "\u76AE\u819A\u79D1", "\u7523\u5A66\u4EBA\u79D1"], "consult");
      corridorFurn();
      add("board", 1, 1, null, "\u5916\u6765\u62C5\u5F53\u533B\u8868\u30FB\u8A3A\u7642\u6642\u9593", true);
      floorRect(14, 11, 29, 21, "floor_marble");
      for (const x of [17, 18, 19, 20]) add("counter", x, 13, "clinic", "\u7DCF\u5408\u53D7\u4ED8", true);
      for (const x of [24, 25, 26, 27]) add("counter", x, 13, "clinic", "\u7DCF\u5408\u53D7\u4ED8", true);
      for (const x of [18, 20, 25, 27]) staffSpots.push({ x, y: 12, role: "recep" });
      add("tmachine", 15, 13, "clinic", "\u518D\u6765\u53D7\u4ED8\u6A5F(\u8A3A\u5BDF\u5238)", true);
      add("tmachine", 16, 13, "clinic", "\u518D\u6765\u53D7\u4ED8\u6A5F", true);
      add("dirsign", 22, 11, null, "\u9662\u5185\u6848\u5185\u677F(\u5916\u6765\u30FB\u691C\u67FB\u30FB\u6551\u6025\u30FB\u75C5\u68DF\u30FB\u58F2\u5E97)", true, { signText: "\u5916\u6765 \u25B2|\u691C\u67FB \u25C0|\u6551\u6025 \u25B6|EV 2\u301C4F \u25B6" });
      for (const x of [24, 25, 26, 27]) add("counter", x, 17, "clinic", "\u4F1A\u8A08\u30FB\u51E6\u65B9\u305B\u3093", true);
      add("tmachine", 28, 17, "clinic", "\u81EA\u52D5\u7CBE\u7B97\u6A5F", true);
      for (const x of [25, 27]) staffSpots.push({ x, y: 16, role: "recep" });
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
        const x = 15 + c * 2, y = 15 + r * 2;
        add("seat", x, y, null, "\u5F85\u5408\u5E2D", false);
        seatSpots.push({ x, y });
      }
      add("sofa", 15, 21, "rest", "\u5F85\u5408\u30BD\u30D5\u30A1", false, { w: 2 });
      add("mrack", 18, 21, null, "\u96D1\u8A8C\u68DA", true);
      add("watersrv", 14, 12, null, "\u7D66\u6C34\u6A5F", true);
      add("tv", 29, 12, null, "\u5F85\u5408\u306E\u30C6\u30EC\u30D3", true);
      add("clock", 22, 1, null, "\u58C1\u639B\u3051\u6642\u8A08", false);
      for (const [x, y] of [[14, 20], [29, 20], [29, 11]]) add("plant", x, y, null, "\u89B3\u8449\u690D\u7269");
      add("trashbin", 21, 21, null, "\u3054\u307F\u7BB1");
      add("aed", 23, 11, null, "AED");
      add("extinguisher", 13, 10, null, "\u6D88\u706B\u5668");
      for (const x of [26, 27]) add("counter", x, 20, "clinic", "\u85AC\u5C40\u7A93\u53E3(\u85AC\u306E\u53D7\u3051\u53D6\u308A)", true);
      staffSpots.push({ x: 26, y: 21, role: "recep" });
      add("cabinet", 27, 21, null, "\u8ABF\u5264\u68DA", true);
      for (const x of [14, 15, 16]) add("shelf", x, 11, "shelf", "\u58F2\u5E97\u306E\u5546\u54C1\u68DA(\u75C5\u9662\u30B3\u30F3\u30D3\u30CB: \u98F2\u307F\u7269\u30FB\u8EFD\u98DF\u30FB\u65E5\u7528\u54C1)", true);
      add("register", 17, 11, "register", "\u58F2\u5E97\u306E\u30EC\u30B8", true);
      staffSpots.push({ x: 17, y: 10 });
      for (let y = 10; y <= 15; y++) wall(12, y);
      for (let x = 1; x <= 12; x++) if (x !== 6) wall(x, 16);
      add("xray", 3, 11, null, "X\u7DDA\u64AE\u5F71\u88C5\u7F6E", true);
      add("hospital_bed", 8, 12, "checkup", "CT\u691C\u67FB\u53F0", true);
      add("desk", 10, 11, "work", "\u653E\u5C04\u7DDA\u6280\u5E2B\u306E\u5E2D", true);
      add("cabinet", 2, 14, null, "\u753B\u50CF\u30B5\u30FC\u30D0\u30FC", true);
      staffSpots.push({ x: 5, y: 12, role: "nurse" });
      rooms.push({ name: "\u653E\u5C04\u7DDA\u79D1(X\u7DDA\u30FBCT)", bed: { x: 8, y: 12 } });
      add("doormat", 6, 16, null, "\u653E\u5C04\u7DDA\u79D1", false);
      add("dirsign", 12, 17, null, "\u653E\u5C04\u7DDA\u79D1\u30FB\u63A1\u8840\u5BA4\u30FB\u691C\u4F53\u691C\u67FB", true, { signText: "\u653E\u5C04\u7DDA\u79D1|\u63A1\u8840\u5BA4|\u691C\u4F53\u691C\u67FB" });
      for (const x of [2, 3, 4]) add("counter", x, 19, "clinic", "\u63A1\u8840\u5BA4(\u63A1\u8840\u30FB\u691C\u4F53\u63D0\u51FA)", true);
      add("chair", 2, 20, null, "\u63A1\u8840\u306E\u6905\u5B50", false);
      add("chair", 4, 20, null, "\u63A1\u8840\u306E\u6905\u5B50", false);
      add("cabinet", 8, 18, null, "\u691C\u4F53\u691C\u67FB\u306E\u5206\u6790\u88C5\u7F6E", true);
      add("cabinet", 9, 18, null, "\u691C\u4F53\u691C\u67FB\u306E\u5206\u6790\u88C5\u7F6E", true);
      add("desk", 10, 18, "work", "\u691C\u67FB\u6280\u5E2B\u306E\u5E2D", true);
      add("seat", 6, 21, null, "\u63A1\u8840\u5F85\u3061\u306E\u5E2D", false);
      add("seat", 8, 21, null, "\u63A1\u8840\u5F85\u3061\u306E\u5E2D", false);
      seatSpots.push({ x: 6, y: 21 }, { x: 8, y: 21 });
      staffSpots.push({ x: 3, y: 18, role: "nurse" }, { x: 9, y: 19, role: "nurse" });
      for (let y = 10; y <= 22; y++) if (y !== 16) wall(31, y);
      label = "1\u968E(\u5916\u6765\u30FB\u6551\u6025)";
      for (const [x, y] of [[34, 12], [38, 12], [34, 20], [38, 20]]) {
        add("hospital_bed", x, y, "checkup", "\u6551\u6025\u51E6\u7F6E\u30D9\u30C3\u30C9", true);
        add("curtain", x, y - 1, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 1 });
        rooms.push({ name: "\u6551\u6025\u5916\u6765", bed: { x, y } });
      }
      for (const x of [36, 37, 38]) add("counter", x, 16, "nurse", "\u6551\u6025\u306E\u30CA\u30FC\u30B9\u30B9\u30C6\u30FC\u30B7\u30E7\u30F3", true);
      staffSpots.push({ x: 37, y: 15, role: "nurse" }, { x: 40, y: 15, role: "doctor" });
      add("desk", 40, 16, "work", "\u6551\u6025\u533B\u306E\u673A", true);
      add("cart", 41, 12, null, "\u6551\u6025\u30AB\u30FC\u30C8", true);
      add("dirsign", 32, 17, null, "\u6551\u6025\u5916\u6765(\u6551\u6025\u8ECA\u306E\u5165\u53E3)", true, { signText: "\u6551\u6025\u5916\u6765|ER \u25B6" });
      add("board", 40, 21, null, "\u6551\u6025\u5916\u6765\u306E\u3054\u6848\u5185", true);
    } else if (floor === 1) {
      label = "2\u968E(\u5C02\u9580\u5916\u6765\u30FB\u691C\u67FB)";
      roomRow(["\u5FAA\u74B0\u5668\u5185\u79D1", "\u6D88\u5316\u5668\u5185\u79D1", "\u547C\u5438\u5668\u5185\u79D1", "\u8133\u795E\u7D4C\u5185\u79D1", "\u6CCC\u5C3F\u5668\u79D1", "\u7CBE\u795E\u79D1", "\u6B6F\u79D1\u53E3\u8154\u5916\u79D1", "\u9EBB\u9154\u79D1\u5916\u6765", "\u653E\u5C04\u7DDA\u6CBB\u7642\u79D1", "\u7DE9\u548C\u30B1\u30A2\u79D1"], "consult");
      corridorFurn();
      add("board", 1, 1, null, "\u5C02\u9580\u5916\u6765\u306E\u62C5\u5F53\u533B\u8868", true);
      floorRect(1, 10, 42, 22, "floor_carpet");
      for (let y = 10; y <= 22; y++) {
        if (![5, 17, 29].includes(y)) {
          wall(12, y);
          wall(24, y);
        }
      }
      add("hospital_bed", 3, 12, "checkup", "\u5FC3\u96FB\u56F3\u30FB\u8D85\u97F3\u6CE2\u306E\u691C\u67FB\u53F0", true);
      add("cabinet", 6, 11, null, "\u8D85\u97F3\u6CE2\u8A3A\u65AD\u88C5\u7F6E", true);
      add("desk", 9, 11, "work", "\u691C\u67FB\u6280\u5E2B\u306E\u5E2D", true);
      add("hospital_bed", 3, 16, "checkup", "\u5185\u8996\u93E1\u691C\u67FB\u53F0", true);
      add("cabinet", 6, 16, null, "\u5185\u8996\u93E1\u30B7\u30B9\u30C6\u30E0", true);
      staffSpots.push({ x: 5, y: 13, role: "nurse" }, { x: 8, y: 17, role: "doctor" });
      rooms.push({ name: "\u751F\u7406\u691C\u67FB\u5BA4", bed: { x: 3, y: 12 } }, { name: "\u5185\u8996\u93E1\u5BA4", bed: { x: 3, y: 16 } });
      add("dirsign", 12, 9, null, "\u751F\u7406\u691C\u67FB\u30FB\u5185\u8996\u93E1 \u25C0|\u30EA\u30CF\u30D3\u30EA \u25B2\u25B6", true, { signText: "\u751F\u7406\u691C\u67FB\u30FB\u5185\u8996\u93E1|\u30EA\u30CF\u30D3\u30EA \u25B6|\u5065\u8A3A \u25B6\u25B6" });
      wide("handrail", 14, 12, 6, 1, null, "\u6B69\u884C\u8A13\u7DF4\u306E\u5E73\u884C\u68D2", {});
      for (const x of [15, 17, 19]) add("bench", x, 16, null, "\u30EA\u30CF\u30D3\u30EA\u306E\u30DE\u30C3\u30C8\u53F0", false);
      add("hospital_bed", 14, 19, "checkup", "\u30EA\u30CF\u30D3\u30EA\u306E\u30D9\u30C3\u30C9", true);
      add("hospital_bed", 17, 19, "checkup", "\u30EA\u30CF\u30D3\u30EA\u306E\u30D9\u30C3\u30C9", true);
      add("mirror", 21, 11, null, "\u59FF\u52E2\u77EF\u6B63\u306E\u93E1", true);
      staffSpots.push({ x: 15, y: 13, role: "nurse" }, { x: 18, y: 18, role: "nurse" });
      rooms.push({ name: "\u30EA\u30CF\u30D3\u30EA\u30C6\u30FC\u30B7\u30E7\u30F3\u5BA4", bed: { x: 14, y: 19 } });
      for (const x of [26, 27, 28]) add("counter", x, 12, "clinic", "\u5065\u8A3A\u30BB\u30F3\u30BF\u30FC\u306E\u53D7\u4ED8", true);
      add("hospital_bed", 33, 14, "checkup", "\u4EBA\u9593\u30C9\u30C3\u30AF\u306E\u8A3A\u5BDF\u53F0", true);
      add("hospital_bed", 37, 14, "checkup", "\u4EBA\u9593\u30C9\u30C3\u30AF\u306E\u8A3A\u5BDF\u53F0", true);
      add("desk", 40, 12, "work", "\u5065\u8A3A\u533B\u306E\u5E2D", true);
      add("sofa", 26, 20, "rest", "\u5065\u8A3A\u306E\u5F85\u5408\u30BD\u30D5\u30A1", false, { w: 2 });
      add("sofa", 30, 20, "rest", "\u5065\u8A3A\u306E\u5F85\u5408\u30BD\u30D5\u30A1", false, { w: 2 });
      add("plant", 25, 11, null, "\u89B3\u8449\u690D\u7269");
      add("plant", 42, 21, null, "\u89B3\u8449\u690D\u7269");
      add("watersrv", 25, 20, null, "\u7D66\u6C34\u6A5F", true);
      staffSpots.push({ x: 27, y: 11, role: "recep" }, { x: 40, y: 13, role: "doctor" });
      rooms.push({ name: "\u5065\u8A3A\u30BB\u30F3\u30BF\u30FC", bed: { x: 33, y: 14 } });
      add("aed", 23, 11, null, "AED");
      add("extinguisher", 13, 21, null, "\u6D88\u706B\u5668");
    } else if (floor === 2) {
      label = "3\u968E(\u75C5\u68DFA\u30FB\u30CA\u30FC\u30B9\u30B9\u30C6\u30FC\u30B7\u30E7\u30F3)";
      roomRow(["301\u53F7\u5BA4", "302\u53F7\u5BA4", "303\u53F7\u5BA4", "304\u53F7\u5BA4", "305\u53F7\u5BA4", "306\u53F7\u5BA4"], "ward");
      for (const [k, nm] of [[6, "\u5927\u90E8\u5C4BA(4\u5E8A)"], [8, "\u5927\u90E8\u5C4BB(4\u5E8A)"]]) {
        const x0 = 1 + 4 * k;
        for (let y = 1; y <= 5; y++) wall(x0 + 7, y);
        for (let x = x0; x <= x0 + 6; x++) if (x !== x0 + 3) wall(x, 5);
        add("doormat", x0 + 3, 5, null, nm, false);
        for (const [x, y] of [[x0, 2], [x0 + 5, 2], [x0, 4], [x0 + 5, 4]]) {
          add("hospital_bed", x, y, "ward", `${nm}\u306E\u30D9\u30C3\u30C9`, true);
          rooms.push({ name: nm, bed: { x, y } });
        }
        add("curtain", x0 + 2, 1, null, "\u30AB\u30FC\u30C6\u30F3", false, { w: 1 });
      }
      floorRect(1, 10, 42, 22, "floor_corr");
      for (const x of [18, 19, 20, 21, 22, 23, 24]) add("counter", x, 13, "nurse", "\u30CA\u30FC\u30B9\u30B9\u30C6\u30FC\u30B7\u30E7\u30F3", true);
      for (const x of [18, 20, 22, 24]) staffSpots.push({ x, y: 12, role: "nurse" });
      add("desk", 18, 11, "work", "\u770B\u8B77\u8A18\u9332\u306E\u5E2D", true);
      add("cabinet", 21, 11, null, "\u85AC\u54C1\u30FB\u533B\u7642\u6750\u6599\u5EAB", true);
      add("cabinet", 23, 11, null, "\u96FB\u5B50\u30AB\u30EB\u30C6\u7AEF\u672B", true);
      staffSpots.push({ x: 26, y: 12, role: "doctor" });
      add("desk", 26, 11, "work", "\u75C5\u68DF\u533B\u306E\u5E2D", true);
      floorRect(4, 16, 20, 21, "floor_carpet");
      add("tv", 5, 16, null, "\u30C7\u30A4\u30EB\u30FC\u30E0\u306E\u30C6\u30EC\u30D3", true);
      for (const x of [5, 8, 11]) {
        add("sofa", x, 18, "rest", "\u30C7\u30A4\u30EB\u30FC\u30E0\u306E\u30BD\u30D5\u30A1", false, { w: 2 });
        seatSpots.push({ x, y: 18 });
      }
      for (const x of [14, 17]) {
        add("table", x, 18, null, "\u98DF\u5802\u306E\u30C6\u30FC\u30D6\u30EB", true);
        add("chair", x - 1, 18, null, "", false);
        add("chair", x + 1, 18, null, "", false);
        seatSpots.push({ x: x - 1, y: 18 }, { x: x + 1, y: 18 });
      }
      add("mrack", 4, 21, null, "\u96D1\u8A8C\u30FB\u65B0\u805E\u68DA", true);
      add("watersrv", 20, 21, null, "\u7D66\u6C34\u6A5F", true);
      add("plant", 3, 16, null, "\u89B3\u8449\u690D\u7269");
      add("plant", 21, 16, null, "\u89B3\u8449\u690D\u7269");
      add("board", 2, 1, null, "\u75C5\u68DF\u306E\u3054\u6848\u5185(\u9762\u4F1A\u6642\u9593 14:00\u301C19:00)", true);
      add("clock", 5, 6, null, "", false);
      add("handrail", 1, 9, null, "\u624B\u3059\u308A", false, { w: 6 });
      for (const x of [28, 31]) {
        add("sofa", x, 16, "rest", "\u9762\u4F1A\u8005\u306E\u30BD\u30D5\u30A1", false, { w: 2 });
      }
      add("dirsign", 27, 9, null, "\u75C5\u68DFA(301\u301C\u5927\u90E8\u5C4B)\u30FB\u30CA\u30FC\u30B9\u30B9\u30C6\u30FC\u30B7\u30E7\u30F3", true, { signText: "\u75C5\u68DFA|\u9762\u4F1A\u5BA4 \u25B6|EV \u25B6" });
      for (let y = 15; y <= 21; y++) if (y !== 18) wall(26, y);
      add("cabinet", 33, 16, null, "\u30EA\u30CD\u30F3\u5EAB", true);
      add("cabinet", 34, 16, null, "\u30EA\u30CD\u30F3\u5EAB", true);
      add("bath", 38, 16, null, "\u75C5\u68DF\u306E\u6D74\u5BA4", false);
      add("toilet", 40, 16, "toilet", "\u30C8\u30A4\u30EC");
      add("toilet", 41, 16, "toilet", "\u591A\u76EE\u7684\u30C8\u30A4\u30EC");
      add("aed", 23, 9, null, "AED");
      add("extinguisher", 3, 10, null, "\u6D88\u706B\u5668");
    } else {
      label = "4\u968E(\u75C5\u68DFB\u30FBICU\u30FB\u624B\u8853\u5BA4)";
      roomRow(["401\u53F7\u5BA4", "402\u53F7\u5BA4", "403\u53F7\u5BA4", "404\u53F7\u5BA4"], "ward");
      for (const [k, nm] of [[4, "\u624B\u8853\u5BA41"], [6, "\u624B\u8853\u5BA42"], [8, "\u624B\u8853\u5BA43"]]) {
        const x0 = 1 + 4 * k + (k > 4 ? k - 4 : 0);
        const w0 = 6;
        for (let y = 1; y <= 5; y++) wall(x0 + w0, y);
        for (let x = x0; x < x0 + w0; x++) if (x !== x0 + 2) wall(x, 5);
        add("doormat", x0 + 2, 5, null, nm, false);
        add("hospital_bed", x0 + 1, 2, "checkup", `${nm}\u306E\u624B\u8853\u53F0`, true);
        add("cabinet", x0 + 4, 1, null, "\u9EBB\u9154\u5668", true);
        add("cabinet", x0 + 4, 3, null, "\u5668\u68B0\u53F0", true);
        add("plant", x0 + 1, 3, null, "\u7121\u5F71\u706F(\u624B\u8853\u53F0\u306E\u771F\u4E0A)", false);
        staffSpots.push({ x: x0 + 2, y: 3, role: "doctor" }, { x: x0 + 3, y: 3, role: "nurse" });
        rooms.push({ name: nm, bed: { x: x0 + 1, y: 2 } });
      }
      floorRect(1, 10, 42, 22, "floor_corr");
      for (let y = 10; y <= 21; y++) if (y !== 15) wall(24, y);
      for (const [x, y] of [[3, 12], [7, 12], [11, 12], [3, 19], [7, 19], [11, 19]]) {
        add("hospital_bed", x, y, "ward", "ICU\u306E\u30D9\u30C3\u30C9", true);
        add("cabinet", x + 1, y, null, "\u751F\u4F53\u30E2\u30CB\u30BF\u30FC", true);
        rooms.push({ name: "ICU", bed: { x, y } });
      }
      for (const x of [5, 6, 7, 8, 9]) add("counter", x, 15, "nurse", "ICU\u306E\u30CA\u30FC\u30B9\u30B9\u30C6\u30FC\u30B7\u30E7\u30F3", true);
      staffSpots.push({ x: 6, y: 14, role: "nurse" }, { x: 8, y: 14, role: "nurse" }, { x: 7, y: 16, role: "doctor" });
      add("dirsign", 24, 9, null, "ICU \u25C0|\u624B\u8853\u5BA4 \u25B2|\u5BB6\u65CF\u5F85\u5408 \u25B6", true, { signText: "ICU \u25C0|\u624B\u8853\u5BA4 \u25B2|\u5BB6\u65CF\u63A7\u5BA4 \u25B6" });
      add("sofa", 28, 14, "rest", "\u5BB6\u65CF\u63A7\u5BA4\u306E\u30BD\u30D5\u30A1(\u624B\u8853\u30FBICU\u306E\u5F85\u6A5F)", false, { w: 2 });
      add("sofa", 32, 14, "rest", "\u5BB6\u65CF\u63A7\u5BA4\u306E\u30BD\u30D5\u30A1", false, { w: 2 });
      add("tv", 30, 12, null, "\u5BB6\u65CF\u63A7\u5BA4\u306E\u30C6\u30EC\u30D3", true);
      add("table", 30, 17, null, "\u5BB6\u65CF\u63A7\u5BA4\u306E\u30C6\u30FC\u30D6\u30EB", true);
      add("watersrv", 36, 12, null, "\u7D66\u6C34\u6A5F", true);
      for (const x of [29, 30, 31, 32]) add("counter", x, 20, "nurse", "\u75C5\u68DFB\u306E\u30CA\u30FC\u30B9\u30B9\u30C6\u30FC\u30B7\u30E7\u30F3", true);
      staffSpots.push({ x: 30, y: 21, role: "nurse" }, { x: 32, y: 21, role: "nurse" });
      add("board", 2, 1, null, "\u75C5\u68DFB\u306E\u3054\u6848\u5185(ICU\u306F\u9762\u4F1A\u5236\u9650\u3042\u308A)", true);
      add("plant", 40, 12, null, "\u89B3\u8449\u690D\u7269");
      add("aed", 23, 9, null, "AED");
      add("extinguisher", 38, 21, null, "\u6D88\u706B\u5668");
      add("toilet", 40, 20, "toilet", "\u30C8\u30A4\u30EC");
    }
    return { W: W2, H: H4, floors, floor, kind: "hospital", tiles, objs, door, stairs: stairsDef, staffSpots, seatSpots, accessible: true, noDoor: floor !== 0, hospital: true, wardFloor: floor >= 2, hRooms: rooms, label };
  }

