  // src/interior_kinds2.js
  function addLift(ctx4, n2 = 1) {
    const { W: W2, wide, floors } = ctx4;
    if (!(floors > 1)) return false;
    let ok = true;
    for (let i = 0; i < n2; i++) ok = wide("elev", W2 - 6 - i * 3, 1, 2, 1, "lift", `\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC${i + 1}\u53F7\u6A5F`, { shaft: i, lo: 0, hi: floors - 1 }) && ok;
    return ok;
  }
  var rowsOf = (a, b, s) => {
    const o = [];
    for (let v = a; v <= b; v += s) o.push(v);
    return o;
  };
  function station(ctx4) {
    const { W: W2, H: H4, add, wide, staffSpots, seatSpots, setFloor, b, floor, upper, g, door, floors } = ctx4;
    setFloor("floor_tile");
    addLift(ctx4);
    const major = floors >= 3;
    if (floor === 1 || upper && !major) {
      {
        const gaps = [5, 10, 13, 17];
        let a = 1;
        for (const gx of [...gaps, W2 - 4]) {
          if (gx - a >= 1) {
            wide("track", a, 2, gx - a, 1, null, "\u7DDA\u8DEF");
            if (gx - a >= 2) wide("train", Math.max(a, 2), 3, gx - Math.max(a, 2), 2, null, "\u96FB\u8ECA(\u505C\u8ECA\u4E2D)");
          }
          a = gx + 1;
        }
      }
      for (let x = 3; x < W2 - 6; x += 4) add("pdoor", x, 5, "platform", "\u30DB\u30FC\u30E0\u30C9\u30A2\u30FB\u4E57\u8ECA\u53E3(\u96FB\u8ECA\u306B\u4E57\u308B)");
      for (let x = 1; x < W2 - 1; x++) add("ptline", x, 6, null, "", false);
      add("stationsign", 4, 7, null, b.name || "\u99C5\u540D\u6A19");
      add("stationsign", W2 - 5, 7, null, b.name || "\u99C5\u540D\u6A19");
      add("stationsign", (W2 >> 1) - 1, 7, null, b.name || "\u99C5\u540D\u6A19");
      add("board", W2 - 4, 1, "timetable", "\u6642\u523B\u8868\u30FB\u8DEF\u7DDA\u56F3", true);
      add("board", 7, 1, "timetable", "\u6642\u523B\u8868\u30FB\u8DEF\u7DDA\u56F3", true);
      add("board", 14, 1, "jinfo", "\u767A\u8ECA\u6848\u5185(\u6B21\u306E\u96FB\u8ECA)", true);
      for (const x of [1, 8, 13, 18]) add("bench", x, 8, null, "\u30DB\u30FC\u30E0\u306E\u30D9\u30F3\u30C1", false);
      add("kiosk", 10, 8, null, "\u30DB\u30FC\u30E0\u306E\u58F2\u5E97(\u7ACB\u3061\u98DF\u3044\u305D\u3070\u30FB\u98F2\u307F\u7269)");
      add("vending", 1, 6, null, "\u81EA\u8CA9\u6A5F");
      add("vending", 21, 8, null, "\u81EA\u8CA9\u6A5F");
      add("extinguisher", W2 - 2, 6, null, "\u6D88\u706B\u5668");
      add("trashbin", W2 - 2, 7, null, "\u3054\u307F\u7BB1");
      add("clock", 12, 1, null, "\u30DB\u30FC\u30E0\u306E\u6642\u8A08", true);
      seatSpots.push({ x: 1, y: 8 }, { x: 8, y: 8 }, { x: 13, y: 8 }, { x: 18, y: 8 });
      staffSpots.push({ x: 6, y: 7 }, { x: 11, y: 7 }, { x: 17, y: 7 });
      return;
    }
    if (major && floor === 2) {
      setFloor("floor_marble");
      add("board", 3, 1, "info", "\u30D5\u30ED\u30A2\u30AC\u30A4\u30C9(\u99C5\u30D3\u30EB)", true);
      wide("kitchen", 6, 2, 5, 1, null, "\u53A8\u623F(\u30EC\u30B9\u30C8\u30E9\u30F3\u8857)");
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
        const x = 6 + c * 3, y = 5 + r * 3;
        add("table", x, y, "order", "\u30EC\u30B9\u30C8\u30E9\u30F3\u8857\u306E\u30C6\u30FC\u30D6\u30EB\u5E2D");
        add("chair", x - 1, y, null, "", false);
        add("chair", x + 1, y, null, "", false);
        seatSpots.push({ x: x - 1, y }, { x: x + 1, y });
      }
      add("menuboard", 7, 1, null, "\u30EC\u30B9\u30C8\u30E9\u30F3\u306E\u30E1\u30CB\u30E5\u30FC\u770B\u677F", true);
      add("counter", 14, 3, "order", "\u30AB\u30D5\u30A7\u30FB\u55AB\u8336\u30AB\u30A6\u30F3\u30BF\u30FC");
      add("counter", 15, 3, "order", "\u30AB\u30D5\u30A7\u30FB\u55AB\u8336\u30AB\u30A6\u30F3\u30BF\u30FC");
      for (const x of [14, 17]) {
        add("table", x, 6, "order", "\u30AB\u30D5\u30A7\u306E\u30C6\u30FC\u30D6\u30EB");
        add("chair", x, 7, null, "", false);
        seatSpots.push({ x, y: 7 });
      }
      for (const x of [4, 5, 6, 7]) add("bookcase", x, 8, null, "\u66F8\u5E97\u306E\u68DA(\u6587\u5EAB\u30FB\u96D1\u8A8C)");
      add("showcase", 19, 3, null, "\u96D1\u8CA8\u30FB\u304A\u307F\u3084\u3052\u306E\u5E97(\u5730\u5143\u9298\u83D3)");
      add("showcase", 20, 3, null, "\u96D1\u8CA8\u30FB\u304A\u307F\u3084\u3052\u306E\u5E97");
      add("shelf", 19, 5, "shelf", "\u99C5\u30CA\u30AB\u306E\u304A\u307F\u3084\u3052\u58F2\u308A\u5834(\u99C5\u5F01\u30FB\u9298\u83D3)");
      add("register", 20, 5, "register", "\u304A\u307F\u3084\u3052\u58F2\u308A\u5834\u30EC\u30B8");
      for (const x of [14, 16, 18]) {
        add("sofa", x, 9, null, "\u5F85\u5408\u30E9\u30A6\u30F3\u30B8\u306E\u30BD\u30D5\u30A1(\u3086\u3063\u305F\u308A\u5E2D)", false);
        seatSpots.push({ x, y: 9 });
      }
      add("tv", 22, 1, null, "\u5F85\u5408\u30E9\u30A6\u30F3\u30B8\u306E\u30C6\u30EC\u30D3", true);
      add("toilet", W2 - 3, 8, "toilet", "\u30C8\u30A4\u30EC");
      add("plant", 12, 9, null, "\u89B3\u8449\u690D\u7269");
      staffSpots.push({ x: 8, y: 3 }, { x: 14, y: 2 }, { x: 20, y: 4 });
      return;
    }
    const bullet = !!(g && g.world && g.world.map.hubs && g.world.map.hubs.some((h) => h.kind === "shinkansen" && h.stationId === b.stationId));
    if (bullet) {
      add("counter", 14, 2, "bullet", "\u65B0\u5E79\u7DDA\u304D\u3063\u3077\u58F2\u308A\u5834");
      add("counter", 15, 2, "bullet", "\u65B0\u5E79\u7DDA\u304D\u3063\u3077\u58F2\u308A\u5834");
      add("exit", W2 - 3, 5, "bulletgate", "\u65B0\u5E79\u7DDA\u6539\u672D(\u306E\u308A\u3070\u3078)", false);
      add("board", 17, 1, "jinfo", "\u65B0\u5E79\u7DDA\u767A\u8ECA\u6848\u5185");
    }
    if (b.stationId === "kuko") add("counter", 10, 6, "shuttle", "\u7A7A\u6E2F\u9023\u7D61\u30D0\u30B9\u4E57\u308A\u5834(\u30BF\u30FC\u30DF\u30CA\u30EB\u884C\u304D)");
    for (const x of [2, 3, 4, 5]) add("tmachine", x, 2, "ticket", "\u5238\u58F2\u6A5F");
    add("counter", 7, 2, "ticket", "\u307F\u3069\u308A\u306E\u7A93\u53E3(\u304D\u3063\u3077\u30FB\u6307\u5B9A\u5E2D)");
    add("counter", 8, 2, "ticket", "\u307F\u3069\u308A\u306E\u7A93\u53E3(\u304D\u3063\u3077\u30FB\u6307\u5B9A\u5E2D)");
    add("board", 11, 1, "timetable", "\u6642\u523B\u8868\u30FB\u904B\u8CC3\u8868\u30FB\u8DEF\u7DDA\u56F3");
    add("board", 12, 1, "timetable", "\u99C5\u69CB\u5185\u6848\u5185\u56F3");
    for (const x of [6, 7, 9, 10, 12, 13]) add("gate", x, 5, "platform", "\u81EA\u52D5\u6539\u672D(\u30DB\u30FC\u30E0\u3078\u30FB\u4E57\u8ECA)");
    add("counter", 8, 5, null, "\u6709\u4EBA\u6539\u672D", false);
    add("exit", 1, 5, "platform", "\u30DB\u30FC\u30E0\u3078(\u4E57\u8ECA)", false);
    add("kiosk", 17, 2, null, "\u58F2\u5E97(\u30AD\u30AA\u30B9\u30AF\u30FB\u65B0\u805E\u30FB\u98F2\u307F\u7269)");
    add("shelf", 19, 2, "shelf", "\u99C5\u5F01\u58F2\u308A\u5834(\u5E55\u306E\u5185\u30FB\u3054\u5F53\u5730\u5F01\u5F53\u30FB\u304A\u8336)");
    add("shelf", 20, 2, "shelf", "\u99C5\u5F01\u58F2\u308A\u5834(\u5E55\u306E\u5185\u30FB\u3054\u5F53\u5730\u5F01\u5F53\u30FB\u304A\u8336)");
    add("register", 21, 2, "register", "\u99C5\u5F01\u58F2\u308A\u5834 \u30EC\u30B8");
    add("showcase", 23, 2, null, "\u304A\u307F\u3084\u3052(\u5730\u5143\u9298\u83D3\u30FB\u5DE5\u82B8\u54C1)");
    add("showcase", W2 - 2, 2, null, "\u304A\u307F\u3084\u3052(\u5730\u5143\u9298\u83D3\u30FB\u5DE5\u82B8\u54C1)");
    add("fridge", 17, 8, null, "\u98F2\u307F\u7269\u306E\u30B1\u30FC\u30B9");
    add("vending", 19, 8, null, "\u81EA\u8CA9\u6A5F");
    add("vending", 20, 8, null, "\u81EA\u8CA9\u6A5F");
    for (const x of [22, 23]) add("locker", x, 8, "locker", "\u30B3\u30A4\u30F3\u30ED\u30C3\u30AB\u30FC");
    add("toilet", W2 - 2, 8, "toilet", "\u30C8\u30A4\u30EC");
    add("board", 3, 8, "info", "\u99C5\u69CB\u5185\u6848\u5185\u56F3(\u51FA\u53E3\u30FB\u30D0\u30B9\u4E57\u308A\u5834\u30FB\u30BF\u30AF\u30B7\u30FC\u4E57\u308A\u5834)", true);
    add("bench", 2, 7, null, "\u5F85\u5408\u5BA4\u306E\u30D9\u30F3\u30C1", false);
    add("bench", 4, 7, null, "\u5F85\u5408\u5BA4\u306E\u30D9\u30F3\u30C1", false);
    add("bench", 6, 7, null, "\u5F85\u5408\u5BA4\u306E\u30D9\u30F3\u30C1", false);
    add("bench", 8, 8, null, "\u5F85\u5408\u5BA4\u306E\u30D9\u30F3\u30C1", false);
    add("extinguisher", 1, 8, null, "\u6D88\u706B\u5668");
    add("aed", 12, 8, null, "AED");
    add("trashbin", 14, 8, null, "\u3054\u307F\u7BB1");
    add("coatrack", 15, 8, null, "\u5098\u7ACB\u3066");
    add("clock", 9, 1, null, "\u99C5\u306E\u5927\u6642\u8A08", true);
    seatSpots.push({ x: 2, y: 7 }, { x: 4, y: 7 }, { x: 6, y: 7 }, { x: 8, y: 8 });
    staffSpots.push({ x: 7, y: 1 }, { x: 8, y: 1 }, { x: 8, y: 4 }, { x: 19, y: 1 }, { x: 21, y: 1 });
    void door;
    void H4;
  }
  station.multi = true;
  function stadium(ctx4) {
    const { W: W2, H: H4, add, wide, staffSpots, seatSpots, setFloor, floor, upper } = ctx4;
    const cx = W2 >> 1;
    addLift(ctx4, 2);
    if (!upper) {
      setFloor("floor_marble");
      wide("reception", 2, 2, 5, 1, "pay", "\u30C1\u30B1\u30C3\u30C8\u58F2\u308A\u5834(\u7A93\u53E3)");
      for (const x of [8, 10, 12]) add("ticketbooth", x, 2, "pay", "\u5F53\u65E5\u5238\u7A93\u53E3");
      for (let k = -3; k <= 2; k++) add("gate", cx + k * 2, 2, "play", `\u5165\u5834\u30B2\u30FC\u30C8${k + 4}(\u30B9\u30BF\u30F3\u30C9\u3078)`);
      for (const x of [cx + 8, cx + 10]) add("kiosk", x, 2, null, "\u58F2\u5E97(\u30D3\u30FC\u30EB\u30FB\u30B8\u30E5\u30FC\u30B9\u30FB\u8EFD\u98DF)");
      add("menuboard", cx + 9, 1, null, "\u30D5\u30FC\u30C9\u30B3\u30FC\u30C8\u306E\u30E1\u30CB\u30E5\u30FC", true);
      for (let x = 2; x < 13; x += 2) add("shelf", x, 6, null, "\u30B0\u30C3\u30BA\u58F2\u308A\u5834(\u30BF\u30AA\u30EB\u30FB\u30E6\u30CB\u30D5\u30A9\u30FC\u30E0\u30FB\u5FDC\u63F4\u30B0\u30C3\u30BA)");
      add("endcap", 3, 8, null, "\u30E6\u30CB\u30D5\u30A9\u30FC\u30E0\u5C55\u793A");
      add("flag", 6, 5, null, "\u30C1\u30FC\u30E0\u30D5\u30E9\u30C3\u30B0");
      add("flag", W2 - 8, 5, null, "\u30C1\u30FC\u30E0\u30D5\u30E9\u30C3\u30B0");
      for (let k = 0; k < 3; k++) {
        add("table", cx - 4 + k * 4, 11, "order", "\u30D5\u30FC\u30C9\u30B3\u30FC\u30C8\u306E\u30C6\u30FC\u30D6\u30EB\u5E2D");
        add("chair", cx - 5 + k * 4, 11, null, "", false);
        add("chair", cx - 3 + k * 4, 11, null, "", false);
        seatSpots.push({ x: cx - 5 + k * 4, y: 11 }, { x: cx - 3 + k * 4, y: 11 });
      }
      add("toilet", W2 - 3, 9, "toilet", "\u30C8\u30A4\u30EC(\u7537\u5973)");
      add("toilet", W2 - 3, 12, "toilet", "\u30C8\u30A4\u30EC(\u591A\u76EE\u7684)");
      add("vending", W2 - 3, 6, null, "\u81EA\u8CA9\u6A5F");
      add("vending", W2 - 4, 6, null, "\u81EA\u8CA9\u6A5F");
      add("aed", W2 - 3, 15, null, "AED\u30FB\u6551\u8B77\u5BA4");
      add("extinguisher", 1, 12, null, "\u6D88\u706B\u5668");
      for (const x of [3, 9, 15, 21]) add("bench", x, 15, null, "\u30D9\u30F3\u30C1", false);
      add("board", W2 - 6, 1, "info", "\u8A66\u5408\u65E5\u7A0B\u30FB\u6848\u5185\u56F3(\u30B2\u30FC\u30C8\u30FB\u5EA7\u5E2D)", true);
      add("trashbin", W2 - 3, 17, null, "\u3054\u307F\u7BB1");
      add("screen", cx - 2, 1, null, "\u5927\u578B\u30D3\u30B8\u30E7\u30F3(\u8A66\u5408\u901F\u5831)", true);
      seatSpots.push({ x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 });
      staffSpots.push({ x: 4, y: 1 }, { x: 10, y: 1 }, { x: cx - 4, y: 1 }, { x: cx + 3, y: 1 }, { x: cx + 9, y: 1 });
      return;
    }
    setFloor("floor_paving");
    wide("scoreboard", cx - 4, 1, 8, 1, "view", "\u96FB\u5149\u63B2\u793A\u677F\u30FB\u5927\u578B\u30D3\u30B8\u30E7\u30F3");
    wide("pitch", 7, 4, W2 - 14, 7, "view", "\u30D4\u30C3\u30C1(\u8A66\u5408\u3092\u89B3\u308B)");
    wide("stand", 1, 4, 5, 8, "play", "\u30B9\u30BF\u30F3\u30C9\u5E2D(\u89B3\u6226)", { sec: 1 });
    wide("stand", W2 - 6, 4, 5, 8, "play", "\u30B9\u30BF\u30F3\u30C9\u5E2D(\u89B3\u6226)", { sec: 2 });
    wide("stand", 7, 12, cx - 7, 4, "play", "\u30B9\u30BF\u30F3\u30C9\u5E2D(\u89B3\u6226)", { sec: 3 });
    wide("stand", cx + 1, 12, W2 - 2 - cx - 1, 4, "play", "\u30B9\u30BF\u30F3\u30C9\u5E2D(\u89B3\u6226)", { sec: 4 });
    for (const x of [6, W2 - 7]) add("flag", x, 1, null, "\u30C1\u30FC\u30E0\u30D5\u30E9\u30C3\u30B0");
    for (let x = 8; x < W2 - 8; x += 6) add("stationsign", x, 17, null, "\u30B2\u30FC\u30C8\u6848\u5185");
    add("kiosk", 2, 17, null, "\u30B9\u30BF\u30F3\u30C9\u306E\u58F2\u5E97");
    add("toilet", W2 - 3, 17, "toilet", "\u30C8\u30A4\u30EC");
    for (const x of [6, 7, 8, 12, 13, 14, 22, 23]) seatSpots.push({ x, y: 16 });
    staffSpots.push({ x: 8, y: 16 }, { x: cx, y: 16 });
  }
  stadium.multi = true;
  function airport(ctx4) {
    const { W: W2, H: H4, add, wide, staffSpots, seatSpots, setFloor, floor, g, b } = ctx4;
    const cx = W2 >> 1;
    addLift(ctx4, 2);
    const intl = !!(g && g.year && g.year() >= 1978);
    if (floor === 0) {
      setFloor("floor_marble");
      wide("conveyor", 14, 2, 15, 1, null, "\u624B\u8377\u7269\u9810\u3051\u306E\u30D9\u30EB\u30C8\u30B3\u30F3\u30D9\u30A2(\u30D0\u30C3\u30AF\u30E4\u30FC\u30C9\u3078)");
      for (let x = 14; x < 29; x += 2) add("counter", x, 4, "checkin", "\u642D\u4E57\u624B\u7D9A\u304D\u30AB\u30A6\u30F3\u30BF\u30FC(\u30C1\u30A7\u30C3\u30AF\u30A4\u30F3\u30FB\u822A\u7A7A\u5238)");
      for (const x of [31, 33, 35]) add("tmachine", x, 4, "checkin", "\u81EA\u52D5\u30C1\u30A7\u30C3\u30AF\u30A4\u30F3\u6A5F");
      for (const x of [17, 22, 27]) add("board", x, 1, "jinfo", "\u51FA\u767A\u6848\u5185(\u30D5\u30E9\u30A4\u30C8\u30FB\u642D\u4E57\u53E3)", true);
      add("dirsign", 13, 6, null, "\u51FA\u767A \u21912\u968E \u4FDD\u5B89\u691C\u67FB\u5834", true, { signText: "\u51FA\u767A|2F \u4FDD\u5B89\u691C\u67FB|\u968E\u6BB5\u30FBEV \u25B6" });
      add("dirsign", 30, 6, null, "\u5230\u7740/\u30D0\u30B9\u30FB\u96FB\u8ECA", true, { signText: "\u5230\u7740 \u2190|\u30D0\u30B9 \u25B6|\u96FB\u8ECA \u25B6" });
      for (const x of [14, 20, 26]) {
        add("sofa", x, 10, null, "\u5F85\u5408\u30BD\u30D5\u30A1", false);
        add("sofa", x + 1, 10, null, "\u5F85\u5408\u30BD\u30D5\u30A1", false);
        seatSpots.push({ x, y: 10 }, { x: x + 1, y: 10 });
      }
      for (const x of [15, 21, 27]) add("planter", x, 8, null, "\u690D\u683D");
      for (const x of [13, 19, 25, 31]) add("plant", x, 12, null, "\u89B3\u8449\u690D\u7269");
      wide("conveyor", 2, 3, 7, 2, null, "\u624B\u8377\u7269\u53D7\u53D6\u6240(\u30BF\u30FC\u30F3\u30C6\u30FC\u30D6\u30EB1)");
      wide("conveyor", 2, 8, 7, 2, null, "\u624B\u8377\u7269\u53D7\u53D6\u6240(\u30BF\u30FC\u30F3\u30C6\u30FC\u30D6\u30EB2)");
      add("cart", 10, 4, null, "\u624B\u8377\u7269\u30AB\u30FC\u30C8");
      add("cart", 10, 5, null, "\u624B\u8377\u7269\u30AB\u30FC\u30C8");
      add("cart", 10, 9, null, "\u624B\u8377\u7269\u30AB\u30FC\u30C8");
      add("board", 5, 1, "jinfo", "\u5230\u7740\u6848\u5185(\u5230\u7740\u4FBF\u30FB\u624B\u8377\u7269\u53D7\u53D6\u306E\u30EC\u30FC\u30F3)", true);
      add("counter", 3, 13, "info", "\u5230\u7740\u30ED\u30D3\u30FC\u7DCF\u5408\u6848\u5185");
      add("counter", 4, 13, "info", "\u5230\u7740\u30ED\u30D3\u30FC\u7DCF\u5408\u6848\u5185");
      add("bench", 2, 17, null, "\u51FA\u8FCE\u3048\u306E\u30D9\u30F3\u30C1", false);
      add("bench", 4, 17, null, "\u51FA\u8FCE\u3048\u306E\u30D9\u30F3\u30C1", false);
      add("bench", 6, 17, null, "\u51FA\u8FCE\u3048\u306E\u30D9\u30F3\u30C1", false);
      seatSpots.push({ x: 2, y: 17 }, { x: 4, y: 17 }, { x: 6, y: 17 });
      add("counter", 37, 10, "shuttle", "\u7A7A\u6E2F\u9023\u7D61\u30D0\u30B9\u4E57\u308A\u5834(\u7A7A\u6E2F\u99C5\u884C\u304D\u30FB\u7121\u6599)");
      add("counter", 38, 10, "shuttle", "\u7A7A\u6E2F\u9023\u7D61\u30D0\u30B9\u4E57\u308A\u5834(\u7A7A\u6E2F\u99C5\u884C\u304D\u30FB\u7121\u6599)");
      add("dirsign", 36, 12, null, "\u30BF\u30AF\u30B7\u30FC\u4E57\u308A\u5834/\u7A7A\u6E2F\u99C5", true, { signText: "\u30BF\u30AF\u30B7\u30FC|\u7A7A\u6E2F\u99C5|\u51FA\u53E3 \u25BC" });
      add("kiosk", 33, 14, "shelf", "\u58F2\u5E97(\u65B0\u805E\u30FB\u98F2\u307F\u7269\u30FB\u8EFD\u98DF)");
      add("showcase", 35, 14, null, "\u304A\u571F\u7523(\u5730\u5143\u9298\u83D3\u30FB\u5DE5\u82B8\u54C1)");
      add("showcase", 36, 14, null, "\u304A\u571F\u7523(\u5730\u5143\u9298\u83D3\u30FB\u5DE5\u82B8\u54C1)");
      add("shelf", 38, 14, "shelf", "\u58F2\u5E97\u30FB\u304A\u571F\u7523\u30FB\u65C5\u884C\u7528\u54C1(\u8CB7\u3046)");
      add("kiosk", 34, 14, "shelf", "\u58F2\u5E97(\u65B0\u805E\u30FB\u98F2\u307F\u7269\u30FB\u8EFD\u98DF)");
      for (const x of [40, 41]) add("locker", x, 6, "locker", "\u30B3\u30A4\u30F3\u30ED\u30C3\u30AB\u30FC");
      add("toilet", 41, 12, "toilet", "\u30C8\u30A4\u30EC");
      add("vending", 41, 8, null, "\u81EA\u52D5\u8CA9\u58F2\u6A5F");
      add("vending", 41, 9, null, "\u81EA\u52D5\u8CA9\u58F2\u6A5F");
      add("extinguisher", 12, 1, null, "\u6D88\u706B\u5668");
      add("aed", 30, 1, null, "AED");
      add("trashbin", 12, 18, null, "\u3054\u307F\u7BB1");
      add("clock", 22, 1, null, "\u5927\u6642\u8A08", true);
      staffSpots.push({ x: 14, y: 3 }, { x: 18, y: 3 }, { x: 22, y: 3 }, { x: 26, y: 3 }, { x: 3, y: 12 }, { x: 37, y: 11 }, { x: 33, y: 13 });
      return;
    }
    if (floor === 1) {
      setFloor("floor_carpet");
      wide("xray", 3, 14, 8, 1, "security", "\u4FDD\u5B89\u691C\u67FB\u5834(\u624B\u8377\u7269X\u7DDA\u30FB\u91D1\u5C5E\u63A2\u77E5)");
      for (const x of [3, 6, 9]) add("counter", x, 16, "security", "\u4FDD\u5B89\u691C\u67FB\u5834(\u624B\u8377\u7269\u691C\u67FB)");
      add("dirsign", 12, 14, null, "\u642D\u4E57\u53E3 \u2192", true, { signText: "\u642D\u4E57\u53E3|1\u301C4|\u25B6" });
      for (const x of [3, 6, 9]) staffSpots.push({ x, y: 15 });
      for (let i = 0; i < 4; i++) {
        const x = 8 + i * 9;
        add("gate", x, 3, "gate", `\u642D\u4E57\u53E3${i + 1}(\u822A\u7A7A\u6A5F\u3078\u30FB\u642D\u4E57\u6A4B)`);
        add("board", x + 1, 1, "jinfo", `\u642D\u4E57\u53E3${i + 1} \u51FA\u767A\u6848\u5185`, true);
        for (let k = 0; k < 3; k++) {
          add("seat", x - 2 + k * 2, 6, null, "\u642D\u4E57\u5F85\u5408\u5E2D", false);
          seatSpots.push({ x: x - 2 + k * 2, y: 6 });
        }
        add("window", x + 3, 1, "view", "\u99D0\u6A5F\u5834\u306E\u822A\u7A7A\u6A5F\u304C\u898B\u3048\u308B\u5927\u7A93", true);
        add("window", x - 2, 1, "view", "\u99D0\u6A5F\u5834\u306E\u822A\u7A7A\u6A5F\u304C\u898B\u3048\u308B\u5927\u7A93", true);
      }
      add("showcase", 14, 12, null, "\u514D\u7A0E\u5E97\u30FB\u304A\u571F\u7523(\u9152\u30FB\u83D3\u5B50\u30FB\u96D1\u8CA8)");
      add("showcase", 15, 12, null, "\u514D\u7A0E\u5E97\u30FB\u304A\u571F\u7523");
      add("showcase", 16, 12, null, "\u514D\u7A0E\u5E97\u30FB\u304A\u571F\u7523");
      add("register", 17, 12, "pay", "\u514D\u7A0E\u5E97\u306E\u30EC\u30B8");
      add("kiosk", 24, 12, "shelf", "\u58F2\u5E97(\u304A\u5F01\u5F53\u30FB\u98F2\u307F\u7269)");
      add("kiosk", 25, 12, null, "\u58F2\u5E97");
      add("showcase", 28, 12, null, "\u7A7A\u6E2F\u9650\u5B9A\u571F\u7523");
      add("showcase", 29, 12, null, "\u7A7A\u6E2F\u9650\u5B9A\u571F\u7523");
      add("shelf", 32, 12, "shelf", "\u65C5\u884C\u96D1\u8CA8\u306E\u68DA(\u8CB7\u3046)");
      add("shelf", 33, 12, null, "\u66F8\u7C4D\u30FB\u96D1\u8A8C");
      for (const x of [14, 22, 30, 36]) add("planter", x, 9, null, "\u690D\u683D");
      add("toilet", 41, 12, "toilet", "\u30C8\u30A4\u30EC");
      add("vending", 41, 8, null, "\u81EA\u52D5\u8CA9\u58F2\u6A5F");
      add("vending", 41, 9, null, "\u81EA\u52D5\u8CA9\u58F2\u6A5F");
      for (const x of [20, 28, 34]) {
        add("sofa", x, 16, null, "\u5F85\u5408\u30BD\u30D5\u30A1", false);
        add("sofa", x + 1, 16, null, "\u5F85\u5408\u30BD\u30D5\u30A1", false);
        seatSpots.push({ x, y: 16 }, { x: x + 1, y: 16 });
      }
      if (intl) {
        add("counter", 38, 16, null, "\u51FA\u5165\u56FD\u5BE9\u67FB(\u56FD\u969B\u7DDA\u306E\u307F\u30FB\u9589\u9396\u4E2D)");
      }
      add("extinguisher", 12, 18, null, "\u6D88\u706B\u5668");
      add("clock", 22, 1, null, "\u5927\u6642\u8A08", true);
      staffSpots.push({ x: 8, y: 4 }, { x: 17, y: 4 }, { x: 26, y: 4 }, { x: 35, y: 4 }, { x: 18, y: 11 });
      return;
    }
    setFloor("floor_wood");
    add("menuboard", 3, 1, null, "\u30EC\u30B9\u30C8\u30E9\u30F3\u306E\u30E1\u30CB\u30E5\u30FC\u770B\u677F(\u5B9A\u98DF\u30FB\u9EBA\u30FB\u30AB\u30EC\u30FC)", true);
    wide("kitchen", 2, 2, 6, 1, null, "\u53A8\u623F(\u30EC\u30B9\u30C8\u30E9\u30F3\u8857)");
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x = 3 + c * 4, y = 5 + r * 4;
      add("table", x, y, "order", "\u30EC\u30B9\u30C8\u30E9\u30F3\u306E\u30C6\u30FC\u30D6\u30EB\u5E2D");
      add("chair", x - 1, y, null, "", false);
      add("chair", x + 1, y, null, "", false);
      seatSpots.push({ x: x - 1, y }, { x: x + 1, y });
    }
    add("counter", 14, 4, "order", "\u30AB\u30D5\u30A7\u30AB\u30A6\u30F3\u30BF\u30FC(\u30B3\u30FC\u30D2\u30FC\u30FB\u8EFD\u98DF)");
    add("counter", 15, 4, "order", "\u30AB\u30D5\u30A7\u30AB\u30A6\u30F3\u30BF\u30FC");
    add("menuboard", 14, 1, null, "\u30AB\u30D5\u30A7\u306E\u30E1\u30CB\u30E5\u30FC", true);
    for (let c = 0; c < 3; c++) {
      add("table", 17 + c * 3, 8, "order", "\u30AB\u30D5\u30A7\u306E\u30C6\u30FC\u30D6\u30EB");
      add("chair", 17 + c * 3, 9, null, "", false);
      seatSpots.push({ x: 17 + c * 3, y: 9 });
    }
    wide("bar", 26, 3, 6, 1, "order", "\u30E9\u30A6\u30F3\u30B8\u306E\u30D0\u30FC\u30AB\u30A6\u30F3\u30BF\u30FC(\u30C9\u30EA\u30F3\u30AF)");
    for (const x of [27, 29, 31]) add("stool", x, 5, null, "\u30D0\u30FC\u306E\u30B9\u30C4\u30FC\u30EB", false);
    add("tv", 34, 1, null, "\u30E9\u30A6\u30F3\u30B8\u306E\u30C6\u30EC\u30D3(\u30CB\u30E5\u30FC\u30B9)", true);
    for (const [x, y] of [[26, 9], [30, 9], [34, 9], [26, 13], [30, 13], [34, 13]]) {
      add("sofa", x, y, null, "\u30E9\u30A6\u30F3\u30B8\u306E\u8098\u639B\u3051\u30BD\u30D5\u30A1", false);
      add("sofa", x + 1, y, null, "\u30E9\u30A6\u30F3\u30B8\u306E\u8098\u639B\u3051\u30BD\u30D5\u30A1", false);
      seatSpots.push({ x, y }, { x: x + 1, y });
    }
    add("bookcase", 38, 4, null, "\u30E9\u30A6\u30F3\u30B8\u306E\u96D1\u8A8C\u30FB\u66F8\u7C4D\u68DA");
    add("bookcase", 39, 4, null, "\u30E9\u30A6\u30F3\u30B8\u306E\u96D1\u8A8C\u30FB\u66F8\u7C4D\u68DA");
    for (const x of [8, 14, 20, 26, 32]) add("window", x, 1, "view", "\u5C55\u671B\u7A93(\u6ED1\u8D70\u8DEF\u3068\u99D0\u6A5F\u5834\u306E\u822A\u7A7A\u6A5F)", true);
    add("toilet", 41, 12, "toilet", "\u30C8\u30A4\u30EC");
    add("vending", 41, 8, null, "\u81EA\u52D5\u8CA9\u58F2\u6A5F");
    add("plant", 24, 14, null, "\u89B3\u8449\u690D\u7269");
    add("plant", 24, 4, null, "\u89B3\u8449\u690D\u7269");
    add("clock", 22, 1, null, "\u5927\u6642\u8A08", true);
    staffSpots.push({ x: 4, y: 3 }, { x: 6, y: 3 }, { x: 14, y: 3 }, { x: 28, y: 4 });
  }
  airport.multi = true;
  function hotel(ctx4) {
    const { W: W2, H: H4, add, wide, staffSpots, seatSpots, b, bt, upper, floor } = ctx4;
    addLift(ctx4);
    if (upper) {
      for (let x0 = 1; x0 + 3 < W2 - 4; x0 += 4) {
        for (const y of [1, 2, 3]) add("pwall", x0, y, null, "\u5BA2\u5BA4\u306E\u58C1", true);
        add("bed", x0 + 1, 1, null, "\u5BA2\u5BA4\u306E\u30D9\u30C3\u30C9", true);
        add("wardrobe", x0 + 2, 1, null, "\u30AF\u30ED\u30FC\u30BC\u30C3\u30C8");
        add("minibar", x0 + 2, 3, null, "\u30DF\u30CB\u30D0\u30FC");
        add("luggage", x0 + 1, 3, null, "\u5BBF\u6CCA\u5BA2\u306E\u8377\u7269");
      }
      add("sofa", 3, 6, "rest", "\u5ECA\u4E0B\u306E\u30BD\u30D5\u30A1", false);
      add("vending", 1, 6, null, "\u81EA\u8CA9\u6A5F");
      add("plant", W2 - 2, 6, null, "\u89B3\u8449\u690D\u7269");
      add("extinguisher", W2 - 2, 4, null, "\u6D88\u706B\u5668");
      add("exitsign", W2 - 4, 1, null, "\u975E\u5E38\u53E3", false);
      staffSpots.push({ x: 4, y: 5 }, { x: 8, y: 5 });
      seatSpots.push({ x: 3, y: 6 });
      return;
    }
    wide("reception", 3, 3, 3, 1, "stay", "\u30D5\u30ED\u30F3\u30C8(\u30C1\u30A7\u30C3\u30AF\u30A4\u30F3)");
    wide("keyrack", 3, 1, 3, 1, null, "\u30EB\u30FC\u30E0\u30AD\u30FC\u68DA");
    add("sofa", 8, 5, "rest", "\u30ED\u30D3\u30FC\u306E\u30BD\u30D5\u30A1", false);
    add("sofa", 10, 5, "rest", "\u30ED\u30D3\u30FC\u306E\u30BD\u30D5\u30A1", false);
    add("luggage", 7, 3, null, "\u8377\u7269\u9810\u304B\u308A");
    add("coatrack", 1, 3, null, "\u5098\u7ACB\u3066");
    add("plant", 1, 2, null, "\u89B3\u8449\u690D\u7269");
    add("plant", W2 - 2, 2, null, "\u89B3\u8449\u690D\u7269");
    add("extinguisher", 1, 5, null, "\u6D88\u706B\u5668");
    add("board", 8, 1, "info", "\u9928\u5185\u6848\u5185", true);
    if (bt.onsen) {
      add("bath", W2 - 4, 2, "bath", "\u5927\u6D74\u5834(\u5185\u6E6F)", false, { tub: "stone" });
      add("bath", W2 - 3, 2, "bath", "\u5927\u6D74\u5834(\u5185\u6E6F)", false, { tub: "stone" });
      add("wash", W2 - 4, 4, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
      add("wash", W2 - 3, 4, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
      add("lamp", W2 - 5, 2, null, "\u884C\u706F", true);
      add("rock", W2 - 2, 3, null, "\u81EA\u7136\u77F3", true);
    }
    staffSpots.push({ x: 4, y: 2 }, { x: 6, y: 4 });
    seatSpots.push({ x: 8, y: 5 }, { x: 10, y: 5 });
  }
  hotel.multi = true;
  function ryokan(ctx4) {
    const { W: W2, H: H4, add, wide, staffSpots, seatSpots, setFloor, tiles, b, bt, upper, door } = ctx4;
    addLift(ctx4);
    const set = (x0, y0, x1, y1, t) => {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (tiles[x + y * W2] !== "exit") tiles[x + y * W2] = t;
    };
    setFloor("floor_wood");
    if (upper) {
      const rooms = [];
      for (let x0 = 1; x0 + 3 < W2 - 5; x0 += 4) rooms.push(x0);
      for (const x0 of rooms) {
        set(x0, 1, x0 + 2, 3, "floor_tatami");
        for (const y of [1, 2, 3]) add("pwall", x0 + 3, y, null, "\u5BA2\u5BA4\u306E\u4ED5\u5207\u308A(\u8956)", true);
        wide("tokonoma", x0, 1, 2, 1, null, "\u5E8A\u306E\u9593(\u639B\u3051\u8EF8\u3068\u82B1)");
        add("kottu", x0 + 1, 2, null, "\u5EA7\u5353(\u304A\u8336\u3068\u304A\u83D3\u5B50)", false);
        add("zabuton", x0, 2, null, "\u5EA7\u5E03\u56E3", false);
        add("zabuton", x0 + 2, 2, null, "\u5EA7\u5E03\u56E3", false);
        add("futon", x0 + 1, 3, null, "\u6577\u304D\u5E03\u56E3(\u591C\u306F\u5E03\u56E3\u304C\u6577\u304B\u308C\u307E\u3059)", false);
        add("luggage", x0 + 2, 3, null, "\u5BBF\u6CCA\u5BA2\u306E\u8377\u7269");
      }
      for (let x = 1; x < W2 - 4; x += 3) add("lantern", x, 5, null, "\u884C\u706F", false);
      add("shoebox", 1, 6, null, "\u4E0B\u99C4\u7BB1(\u30B9\u30EA\u30C3\u30D1)");
      add("vending", W2 - 5, 6, null, "\u81EA\u8CA9\u6A5F");
      add("plant", W2 - 2, 6, null, "\u89B3\u8449\u690D\u7269");
      add("extinguisher", W2 - 2, 4, null, "\u6D88\u706B\u5668");
      add("exitsign", W2 - 4, 1, null, "\u975E\u5E38\u53E3", false);
      staffSpots.push({ x: 4, y: 5 }, { x: 9, y: 5 });
      seatSpots.push({ x: 3, y: 6 });
      return;
    }
    set(Math.max(0, door.x - 3), H4 - 3, Math.min(W2 - 1, door.x + 3), H4 - 1, "floor_tile");
    set(1, 1, Math.min(W2 - 6, 8), 4, "floor_tatami");
    wide("reception", 2, 5, 3, 1, "stay", "\u5E33\u5834(\u30C1\u30A7\u30C3\u30AF\u30A4\u30F3)");
    wide("keyrack", 6, 5, 2, 1, null, "\u9375\u639B\u3051");
    add("shoebox", Math.max(1, door.x - 4), H4 - 2, null, "\u4E0B\u99C4\u7BB1(\u30B9\u30EA\u30C3\u30D1)");
    wide("tokonoma", 1, 1, 2, 1, null, "\u5E8A\u306E\u9593(\u639B\u3051\u8EF8\u30FB\u751F\u3051\u82B1)");
    add("kottu", 4, 3, null, "\u56F2\u7089\u88CF\u98A8\u306E\u5EA7\u5353", false);
    add("zabuton", 3, 3, null, "\u5EA7\u5E03\u56E3", false);
    add("zabuton", 5, 3, null, "\u5EA7\u5E03\u56E3", false);
    add("zabuton", 4, 2, null, "\u5EA7\u5E03\u56E3", false);
    add("lantern", 8, 5, null, "\u884C\u706F", false);
    add("plant", 1, 5, null, "\u5EAD\u306E\u677E(\u9262)");
    add("board", 8, 1, "info", "\u9928\u5185\u6848\u5185(\u304A\u98DF\u4E8B\u30FB\u304A\u98A8\u5442\u306E\u6642\u9593)", true);
    add("luggage", 7, 6, null, "\u8377\u7269\u9810\u304B\u308A");
    add("umbrella", door.x + 4, H4 - 2, null, "\u5098\u7ACB\u3066", false);
    if (bt.onsen) {
      add("bath", W2 - 4, 2, "bath", "\u5927\u6D74\u5834(\u5185\u6E6F)", false, { tub: "stone" });
      add("bath", W2 - 3, 2, "bath", "\u5927\u6D74\u5834(\u5185\u6E6F)", false, { tub: "stone" });
      add("wash", W2 - 4, 4, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
      add("wash", W2 - 3, 4, "wash", "\u6D17\u3044\u5834(\u30B7\u30E3\u30EF\u30FC\u30FB\u6876\u30FB\u6905\u5B50)", false);
      add("lamp", W2 - 5, 2, null, "\u77F3\u706F\u7C60", true);
      add("rock", W2 - 2, 3, null, "\u81EA\u7136\u77F3", true);
    }
    add("sofa", 10, 6, "rest", "\u5F85\u5408\u306E\u30BD\u30D5\u30A1", false);
    staffSpots.push({ x: 3, y: 6 }, { x: 6, y: 6 });
    seatSpots.push({ x: 3, y: 3 }, { x: 5, y: 3 }, { x: 10, y: 7 });
  }
  ryokan.multi = true;
  var KINDS2 = { airport, station, stadium, hotel, resorthotel: hotel, ryokan, minshuku: ryokan };
  var T_OFFICE = [["pcdesk", "\u30D1\u30BD\u30B3\u30F3\u306E\u673A"], ["cabinet", "\u66F8\u985E\u30AD\u30E3\u30D3\u30CD\u30C3\u30C8"], ["copier", "\u30B3\u30D4\u30FC\u6A5F"], ["whiteboard", "\u30DB\u30EF\u30A4\u30C8\u30DC\u30FC\u30C9"], ["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051", null, false], ["extinguisher", "\u6D88\u706B\u5668"], ["plant", "\u89B3\u8449\u690D\u7269"]];
  var EN = {
    themepark: { top: [["ticketbooth", "\u30C1\u30B1\u30C3\u30C8\u30D6\u30FC\u30B9"], ["kiosk", "\u58F2\u5E97"], ["flag", "\u30D1\u30FC\u30AF\u306E\u65D7"]], left: [["tree", "\u690D\u3048\u8FBC\u307F"], ["bench", "\u30D9\u30F3\u30C1", null, false], ["trashbin", "\u3054\u307F\u7BB1"]], right: [["vending", "\u81EA\u8CA9\u6A5F"], ["tree", "\u690D\u3048\u8FBC\u307F"], ["bench", "\u30D9\u30F3\u30C1", null, false]] },
    edovillage: { top: [["noren", "\u306E\u308C\u3093"], ["lantern", "\u63D0\u706F"], ["lantern", "\u63D0\u706F"], ["kiosk", "\u8336\u5E97"]], left: [["tree", "\u677E"], ["bench", "\u7E01\u53F0", null, false]], right: [["lantern", "\u884C\u706F"], ["bench", "\u7E01\u53F0", null, false]] },
    factory: { top: [["cabinet", "\u5DE5\u5177\u30AD\u30E3\u30D3\u30CD\u30C3\u30C8"], ["whiteboard", "\u4F5C\u696D\u4E88\u5B9A\u8868"], ["extinguisher", "\u6D88\u706B\u5668"], ["exitsign", "\u975E\u5E38\u53E3", null, false]], left: [["pallet", "\u90E8\u6750\u30D1\u30EC\u30C3\u30C8"], ["pallet", "\u90E8\u6750\u30D1\u30EC\u30C3\u30C8"], ["forklift", "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8"]], right: [["locker", "\u30ED\u30C3\u30AB\u30FC"], ["trashbin", "\u5EC3\u6750\u5165\u308C"], ["pallet", "\u88FD\u54C1\u30D1\u30EC\u30C3\u30C8"]] },
    gamecenter: { top: [["vending", "\u81EA\u8CA9\u6A5F"], ["atm", "\u4E21\u66FF\u6A5F"], ["vending", "\u81EA\u8CA9\u6A5F"]], left: [["trashbin", "\u3054\u307F\u7BB1"], ["bench", "\u30D9\u30F3\u30C1", null, false]], right: [["locker", "\u30B3\u30A4\u30F3\u30ED\u30C3\u30AB\u30FC"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    shop: { top: [["stockdoor", "\u30D0\u30C3\u30AF\u30E4\u30FC\u30C9"], ["shelf", "\u5546\u54C1\u68DA"], ["frozen", "\u51B7\u30B1\u30FC\u30B9"], ["shelf", "\u5546\u54C1\u68DA"]], left: [["basket", "\u8CB7\u3044\u7269\u304B\u3054"], ["umbrella", "\u5098\u7ACB\u3066"]], right: [["cart", "\u30AB\u30FC\u30C8"], ["trashbin", "\u3054\u307F\u7BB1"]] },
    pharmacy: { top: [["showcase", "\u533B\u85AC\u54C1\u30B1\u30FC\u30B9"], ["cabinet", "\u8ABF\u5264\u68DA"], ["shelf", "\u533B\u85AC\u54C1\u68DA"], ["shelf", "\u65E5\u7528\u54C1\u68DA"]], left: [["chair", "\u5F85\u5408\u306E\u6905\u5B50", null, false], ["chair", "\u5F85\u5408\u306E\u6905\u5B50", null, false]], right: [["aed", "AED"], ["basket", "\u304B\u3054"]] },
    fishshop: { top: [["frozen", "\u6C37\u306E\u9673\u5217\u53F0"], ["showcase", "\u9BAE\u9B5A\u30B1\u30FC\u30B9"], ["sink", "\u8ABF\u7406\u53F0"], ["frozen", "\u6C37\u306E\u9673\u5217\u53F0"]], left: [["basket", "\u767A\u6CE1\u30B9\u30C1\u30ED\u30FC\u30EB\u306E\u7BB1"], ["basket", "\u767A\u6CE1\u30B9\u30C1\u30ED\u30FC\u30EB\u306E\u7BB1"]], right: [["stockdoor", "\u51B7\u8535\u5EAB(\u88CF)"]] },
    liquor: { top: [["shelf", "\u9152\u68DA"], ["cabinet", "\u4E00\u5347\u74F6\u306E\u68DA"], ["frozen", "\u51B7\u8535\u30B1\u30FC\u30B9"], ["shelf", "\u9152\u68DA"]], left: [["pallet", "\u30D3\u30FC\u30EB\u30B1\u30FC\u30B9"], ["pallet", "\u30D3\u30FC\u30EB\u30B1\u30FC\u30B9"]], right: [["cart", "\u53F0\u8ECA"]] },
    greengrocer: { top: [["produce", "\u91CE\u83DC\u306E\u5C71"], ["produce", "\u679C\u7269\u306E\u5C71"], ["produce", "\u91CE\u83DC\u306E\u5C71"], ["basket", "\u304B\u3054"]], left: [["produce", "\u6839\u83DC\u306E\u7BB1"], ["produce", "\u8449\u7269\u306E\u7BB1"]], right: [["cart", "\u30AB\u30FC\u30C8"], ["basket", "\u304B\u3054"]] },
    bookstore: { top: [["bookcase", "\u672C\u68DA"], ["bookcase", "\u672C\u68DA"], ["bookcase", "\u672C\u68DA"], ["bookcase", "\u672C\u68DA"]], left: [["bookcase", "\u96D1\u8A8C\u68DA"], ["bookcase", "\u6587\u5EAB\u68DA"]], right: [["cart", "\u5E73\u53F0(\u65B0\u520A)"], ["bookcase", "\u6587\u5177\u68DA"]] },
    directsale: { top: [["produce", "\u63A1\u308C\u305F\u3066\u91CE\u83DC"], ["produce", "\u679C\u7269"], ["showcase", "\u52A0\u5DE5\u54C1\u30B1\u30FC\u30B9"]], left: [["basket", "\u888B\u8A70\u3081\u91CE\u83DC"], ["produce", "\u91CE\u83DC\u306E\u7BB1"]], right: [["cart", "\u30AB\u30FC\u30C8"], ["trashbin", "\u3054\u307F\u7BB1"]] },
    homecenter: { top: [["palrack", "\u8CC7\u6750\u30E9\u30C3\u30AF"], ["palrack", "\u8CC7\u6750\u30E9\u30C3\u30AF"], ["shelf", "\u5DE5\u5177\u68DA"], ["shelf", "\u5712\u82B8\u7528\u54C1\u68DA"]], left: [["pallet", "\u571F\u30FB\u80A5\u6599\u306E\u888B"], ["planter", "\u82B1\u82D7"]], right: [["cart", "\u30AB\u30FC\u30C8"], ["forklift", "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8"]] },
    clothes: { top: [["rack", "\u6D0B\u670D\u30E9\u30C3\u30AF"], ["rack", "\u6D0B\u670D\u30E9\u30C3\u30AF"], ["mirror", "\u59FF\u898B"]], left: [["basket", "\u304B\u3054"]], right: [["cart", "\u30AB\u30FC\u30C8"]] },
    lab: { top: [["pcdesk", "\u89E3\u6790\u7528\u30D1\u30BD\u30B3\u30F3"], ["whiteboard", "\u5B9F\u9A13\u30CE\u30FC\u30C8\u63B2\u793A"], ["cabinet", "\u8A66\u85AC\u30AD\u30E3\u30D3\u30CD\u30C3\u30C8"], ["xray", "\u5206\u6790\u88C5\u7F6E"]], left: [["sink", "\u5B9F\u9A13\u7528\u6D41\u3057"], ["locker", "\u767D\u8863\u30ED\u30C3\u30AB\u30FC"]], right: [["copier", "\u30D7\u30EA\u30F3\u30BF"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    shrine: { top: [["lantern", "\u706F\u7C60"], ["offering", "\u304A\u8CFD\u92AD\u7BB1"], ["bell", "\u9234"], ["lantern", "\u706F\u7C60"]], left: [["omikuji", "\u304A\u307F\u304F\u3058\u639B\u3051"], ["tree", "\u5FA1\u795E\u6728"]], right: [["torii", "\u9CE5\u5C45(\u5185\u5074)"], ["lantern", "\u706F\u7C60"]] },
    temple: { top: [["lantern", "\u706F\u7C60"], ["altar", "\u672C\u5C0A\u306E\u524D\u306E\u53F0"], ["bell", "\u9418"], ["lantern", "\u706F\u7C60"]], left: [["offering", "\u9999\u7089"], ["tree", "\u5EAD\u6728"]], right: [["omikuji", "\u304A\u307F\u304F\u3058\u639B\u3051"], ["lantern", "\u706F\u7C60"]] },
    construction: { top: T_OFFICE.slice(0, 4), left: [["cabinet", "\u56F3\u9762\u68DA"], ["coatrack", "\u30D8\u30EB\u30E1\u30C3\u30C8\u639B\u3051"]], right: [["whiteboard", "\u5DE5\u7A0B\u8868"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    agency: { top: [["pcdesk", "\u30DE\u30CD\u30FC\u30B8\u30E3\u30FC\u306E\u673A"], ["whiteboard", "\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u8868"], ["cabinet", "\u8CC7\u6599\u68DA"], ["sofa", "\u5FDC\u63A5\u30BD\u30D5\u30A1"]], left: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051"], ["plant", "\u89B3\u8449\u690D\u7269"]], right: [["copier", "\u30B3\u30D4\u30FC\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    lawfirm: { top: [["cabinet", "\u6CD5\u5F8B\u66F8\u306E\u66F8\u68DA"], ["cabinet", "\u6CD5\u5F8B\u66F8\u306E\u66F8\u68DA"], ["pcdesk", "\u5F01\u8B77\u58EB\u306E\u673A"], ["whiteboard", "\u6848\u4EF6\u30DC\u30FC\u30C9"]], left: [["sofa", "\u76F8\u8AC7\u7528\u30BD\u30D5\u30A1"], ["plant", "\u89B3\u8449\u690D\u7269"]], right: [["copier", "\u30B3\u30D4\u30FC\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    harboroffice: { top: [["whiteboard", "\u5165\u51FA\u6E2F\u4E88\u5B9A\u677F"], ["pcdesk", "\u4E8B\u52D9\u673A"], ["cabinet", "\u6D77\u56F3\u68DA"], ["dboard", "\u6F6E\u4F4D\u8868\u793A"]], left: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051"], ["pallet", "\u66F8\u985E\u7BB1"]], right: [["extinguisher", "\u6D88\u706B\u5668"], ["lamp", "\u5E38\u591C\u706F"]] },
    media: { top: [["pcdesk", "\u7DE8\u96C6\u7528\u30D1\u30BD\u30B3\u30F3"], ["pcdesk", "\u7DE8\u96C6\u7528\u30D1\u30BD\u30B3\u30F3"], ["whiteboard", "\u756A\u7D44\u8868"], ["dboard", "\u30E2\u30CB\u30BF\u30FC"]], left: [["cabinet", "\u6A5F\u6750\u68DA"], ["stage", "\u64AE\u5F71\u30B9\u30DA\u30FC\u30B9"]], right: [["copier", "\u30D7\u30EA\u30F3\u30BF"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    farmcoop: { top: [["cabinet", "\u8FB2\u696D\u8CC7\u6599\u68DA"], ["pcdesk", "\u4E8B\u52D9\u673A"], ["whiteboard", "\u51FA\u8377\u4E88\u5B9A"], ["shelf", "\u80A5\u6599\u30FB\u8CC7\u6750\u898B\u672C"]], left: [["pallet", "\u7C73\u888B"], ["pallet", "\u80A5\u6599\u888B"]], right: [["produce", "\u51FA\u8377\u524D\u306E\u91CE\u83DC"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    welfare: { top: [["cabinet", "\u4F5C\u696D\u7528\u54C1\u306E\u68DA"], ["whiteboard", "\u4F5C\u696D\u4E88\u5B9A\u8868"], ["pcdesk", "\u4E8B\u52D9\u673A"]], left: [["table", "\u4F5C\u696D\u53F0"], ["chair", "\u6905\u5B50", null, false]], right: [["locker", "\u30ED\u30C3\u30AB\u30FC"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    cram: { top: [["kokuban", "\u9ED2\u677F"], ["whiteboard", "\u30DB\u30EF\u30A4\u30C8\u30DC\u30FC\u30C9"], ["bookcase", "\u53C2\u8003\u66F8\u68DA"]], left: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051"], ["shoebox", "\u4E0B\u99C4\u7BB1"]], right: [["vending", "\u81EA\u8CA9\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    kinder: { top: [["shoebox", "\u4E0B\u99C4\u7BB1"], ["bookcase", "\u7D75\u672C\u68DA"], ["piano", "\u30D4\u30A2\u30CE"], ["cabinet", "\u304A\u3082\u3061\u3083\u68DA"]], left: [["slide", "\u3059\u3079\u308A\u53F0"], ["mat", "\u304A\u663C\u5BDD\u30DE\u30C3\u30C8", null, false]], right: [["locker", "\u8377\u7269\u30ED\u30C3\u30AB\u30FC"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    crematorium: { top: [["altar", "\u796D\u58C7"], ["lantern", "\u71ED\u53F0"], ["lantern", "\u71ED\u53F0"]], left: [["bench", "\u5F85\u5408\u306E\u6905\u5B50", null, false], ["plant", "\u4F9B\u82B1"]], right: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    funeral: { top: [["altar", "\u796D\u58C7"], ["offering", "\u713C\u9999\u53F0"], ["lantern", "\u71ED\u53F0"]], left: [["bench", "\u53C2\u5217\u8005\u306E\u6905\u5B50", null, false], ["plant", "\u4F9B\u82B1"]], right: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051"], ["table", "\u53D7\u4ED8\u306E\u673A"]] },
    bizhotel: { top: [["reception", "\u30D5\u30ED\u30F3\u30C8"], ["keyrack", "\u30EB\u30FC\u30E0\u30AD\u30FC\u68DA"], ["luggage", "\u8377\u7269\u7F6E\u304D\u5834"]], left: [["vending", "\u81EA\u8CA9\u6A5F"], ["sofa", "\u5F85\u3061\u5408\u3044\u30BD\u30D5\u30A1"]], right: [["plant", "\u89B3\u8449\u690D\u7269"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    minshuku: { top: [["shoebox", "\u4E0B\u99C4\u7BB1"], ["keyrack", "\u9375\u639B\u3051"], ["umbrella", "\u5098\u7ACB\u3066"]], left: [["zabuton", "\u5EA7\u5E03\u56E3", null, false], ["tokonoma", "\u5E8A\u306E\u9593"]], right: [["lantern", "\u884C\u706F"], ["luggage", "\u304A\u5BA2\u69D8\u306E\u8377\u7269"]] },
    ryokan: { top: [["shoebox", "\u4E0B\u99C4\u7BB1"], ["keyrack", "\u9375\u639B\u3051"], ["tokonoma", "\u5E8A\u306E\u9593"], ["lantern", "\u884C\u706F"]], left: [["luggage", "\u304A\u5BA2\u69D8\u306E\u8377\u7269"], ["zabuton", "\u5EA7\u5E03\u56E3", null, false]], right: [["umbrella", "\u5098\u7ACB\u3066"], ["lantern", "\u884C\u706F"]] },
    marina: { top: [["flag", "\u4FE1\u53F7\u65D7"], ["kiosk", "\u58F2\u5E97"], ["dboard", "\u6F6E\u4F4D\u8868\u793A"]], left: [["rock", "\u4FC2\u7559\u7528\u306E\u77F3"], ["pallet", "\u8264\u88C5\u54C1\u306E\u7BB1"]], right: [["extinguisher", "\u6D88\u706B\u5668"], ["lamp", "\u5E38\u591C\u706F"]] },
    market: { top: [["frozen", "\u6C37\u306E\u53F0"], ["frozen", "\u6C37\u306E\u53F0"], ["stockdoor", "\u51B7\u8535\u5EAB"]], left: [["pallet", "\u767A\u6CE1\u30B9\u30C1\u30ED\u30FC\u30EB\u306E\u7BB1"], ["basket", "\u9B5A\u304B\u3054"]], right: [["cart", "\u30BF\u30FC\u30EC(\u53F0\u8ECA)"], ["pallet", "\u9B5A\u7BB1"]] },
    pier: { top: [["ticketbooth", "\u5238\u58F2\u6240"], ["flag", "\u65D7"]], left: [["rock", "\u30D3\u30C3\u30C8"], ["bench", "\u30D9\u30F3\u30C1", null, false]], right: [["lamp", "\u8857\u706F"], ["trashbin", "\u3054\u307F\u7BB1"]] },
    tourtower: { top: [["kiosk", "\u571F\u7523\u58F2\u5E97"], ["dboard", "\u5C55\u671B\u6848\u5185"], ["flag", "\u65D7"]], left: [["bench", "\u30D9\u30F3\u30C1", null, false], ["trashbin", "\u3054\u307F\u7BB1"]], right: [["vending", "\u81EA\u8CA9\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    library: { top: [["bookcase", "\u66F8\u67B6"], ["bookcase", "\u66F8\u67B6"], ["dboard", "\u8535\u66F8\u691C\u7D22\u7AEF\u672B"]], left: [["cart", "\u8FD4\u5374\u30AB\u30FC\u30C8"]], right: [["copier", "\u30B3\u30D4\u30FC\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    konbini: { top: [["frozen", "\u30C9\u30EA\u30F3\u30AF\u306E\u51B7\u30B1\u30FC\u30B9"], ["frozen", "\u30C9\u30EA\u30F3\u30AF\u306E\u51B7\u30B1\u30FC\u30B9"], ["stockdoor", "\u30D0\u30C3\u30AF\u30E4\u30FC\u30C9"]], left: [["atm", "ATM"], ["trashbin", "\u3054\u307F\u7BB1"]], right: [["umbrella", "\u5098\u7ACB\u3066"], ["vending", "\u81EA\u8CA9\u6A5F"]] },
    super: { top: [["frozen", "\u51B7\u51CD\u30B1\u30FC\u30B9"], ["produce", "\u9752\u679C"], ["stockdoor", "\u30D0\u30C3\u30AF\u30E4\u30FC\u30C9"]], left: [["basket", "\u8CB7\u3044\u7269\u304B\u3054"], ["cart", "\u30AB\u30FC\u30C8"]], right: [["cart", "\u30AB\u30FC\u30C8"], ["aed", "AED"]] },
    warehouse: { top: [["palrack", "\u30D1\u30EC\u30C3\u30C8\u30E9\u30C3\u30AF"], ["palrack", "\u30D1\u30EC\u30C3\u30C8\u30E9\u30C3\u30AF"], ["exitsign", "\u975E\u5E38\u53E3", null, false]], left: [["pallet", "\u30D1\u30EC\u30C3\u30C8"], ["forklift", "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8"]], right: [["pcdesk", "\u5728\u5EAB\u7BA1\u7406\u7AEF\u672B"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    restaurant: { top: [["stove", "\u8ABF\u7406\u5834\u306E\u30B3\u30F3\u30ED"], ["menuboard", "\u54C1\u66F8\u304D"], ["fridge", "\u696D\u52D9\u7528\u51B7\u8535\u5EAB"]], left: [["umbrella", "\u5098\u7ACB\u3066"], ["stool", "\u5F85\u3061\u5E2D", null, false]], right: [["trashbin", "\u3054\u307F\u7BB1"], ["plant", "\u89B3\u8449\u690D\u7269"]] },
    cafe: { top: [["menuboard", "\u30E1\u30CB\u30E5\u30FC\u9ED2\u677F"], ["bar", "\u30B3\u30FC\u30D2\u30FC\u30DE\u30B7\u30F3\u53F0"], ["fridge", "\u30B7\u30E7\u30FC\u30B1\u30FC\u30B9\u51B7\u8535"]], left: [["plant", "\u89B3\u8449\u690D\u7269"], ["umbrella", "\u5098\u7ACB\u3066"]], right: [["lamp", "\u30B9\u30BF\u30F3\u30C9\u30E9\u30A4\u30C8"], ["trashbin", "\u3054\u307F\u7BB1"]] },
    ramen: { top: [["stove", "\u5BF8\u80F4\u306E\u30B3\u30F3\u30ED"], ["menuboard", "\u54C1\u66F8\u304D"], ["fridge", "\u51B7\u8535\u5EAB"]], left: [["ticketqueue", "\u98DF\u5238\u6A5F\u30FB\u5F85\u3061\u884C\u5217"], ["umbrella", "\u5098\u7ACB\u3066"]], right: [["trashbin", "\u3054\u307F\u7BB1"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    izakaya: { top: [["menuboard", "\u304A\u3059\u3059\u3081\u9ED2\u677F"], ["stove", "\u53A8\u623F\u30B3\u30F3\u30ED"], ["fridge", "\u30D3\u30FC\u30EB\u51B7\u8535\u5EAB"]], left: [["noren", "\u306E\u308C\u3093"], ["umbrella", "\u5098\u7ACB\u3066"]], right: [["lantern", "\u63D0\u706F"], ["trashbin", "\u3054\u307F\u7BB1"]] },
    seafood: { top: [["menuboard", "\u672C\u65E5\u306E\u6D77\u9BAE"], ["stove", "\u53A8\u623F\u30B3\u30F3\u30ED"], ["frozen", "\u6C37\u306E\u53F0"]], left: [["noren", "\u306E\u308C\u3093"], ["umbrella", "\u5098\u7ACB\u3066"]], right: [["trashbin", "\u3054\u307F\u7BB1"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    beachhouse: { top: [["menuboard", "\u304B\u304D\u6C37\u306E\u54C1\u66F8\u304D"], ["stove", "\u713C\u304D\u305D\u3070\u306E\u9244\u677F"], ["fridge", "\u30AF\u30FC\u30E9\u30FC\u30DC\u30C3\u30AF\u30B9"]], left: [["umbrella", "\u30D3\u30FC\u30C1\u30D1\u30E9\u30BD\u30EB"], ["basket", "\u6D6E\u304D\u8F2A"]], right: [["shoebox", "\u30ED\u30C3\u30AB\u30FC"], ["trashbin", "\u3054\u307F\u7BB1"]] },
    usedcar: { top: [["whiteboard", "\u4FA1\u683C\u30DC\u30FC\u30C9"], ["pcdesk", "\u5546\u8AC7\u673A"], ["cabinet", "\u66F8\u985E\u68DA"]], left: [["showcar", "\u5C55\u793A\u8ECA"]], right: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    cardealer: { top: [["whiteboard", "\u65B0\u8ECA\u30AB\u30BF\u30ED\u30B0\u68DA"], ["pcdesk", "\u5546\u8AC7\u673A"], ["cabinet", "\u30AB\u30BF\u30ED\u30B0\u68DA"]], left: [["plant", "\u89B3\u8449\u690D\u7269"]], right: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    aquarium: { top: [["kiosk", "\u58F2\u5E97"], ["dboard", "\u5C55\u793A\u6848\u5185"]], left: [["trashbin", "\u3054\u307F\u7BB1"]], right: [["vending", "\u81EA\u8CA9\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    zoo: { top: [["kiosk", "\u58F2\u5E97"], ["dboard", "\u5712\u5185\u6848\u5185"]], left: [["trashbin", "\u3054\u307F\u7BB1"]], right: [["vending", "\u81EA\u8CA9\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    museum: { top: [["showcase", "\u5C55\u793A\u30B1\u30FC\u30B9"], ["showcase", "\u5C55\u793A\u30B1\u30FC\u30B9"]], left: [["bench", "\u9451\u8CDE\u7528\u30D9\u30F3\u30C1", null, false]], right: [["kiosk", "\u30DF\u30E5\u30FC\u30B8\u30A2\u30E0\u30B7\u30E7\u30C3\u30D7"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    gym: { top: [["mirror", "\u5927\u304D\u306A\u93E1"], ["mirror", "\u5927\u304D\u306A\u93E1"]], left: [["shoebox", "\u9774\u7BB1"]], right: [["vending", "\u81EA\u8CA9\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    bowling: { top: [["dboard", "\u30B9\u30B3\u30A2\u30E2\u30CB\u30BF\u30FC"]], left: [["shoebox", "\u8CB8\u3057\u9774\u68DA"]], right: [["vending", "\u81EA\u8CA9\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    cinema: { top: [["flag", "\u4E0A\u6620\u30DD\u30B9\u30BF\u30FC"], ["dboard", "\u4E0A\u6620\u6848\u5185"]], left: [["trashbin", "\u3054\u307F\u7BB1"]], right: [["vending", "\u81EA\u8CA9\u6A5F"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    fire: { top: [["cabinet", "\u9632\u706B\u670D\u30ED\u30C3\u30AB\u30FC"], ["whiteboard", "\u51FA\u52D5\u8868"]], left: [["extinguisher", "\u6D88\u706B\u5668"]], right: [["aed", "AED"]] },
    police: { top: [["whiteboard", "\u7BA1\u5185\u306E\u5730\u56F3"], ["cabinet", "\u66F8\u985E\u68DA"]], left: [["flag", "\u65E5\u7AE0\u65D7"]], right: [["extinguisher", "\u6D88\u706B\u5668"], ["aed", "AED"]] },
    court: { top: [["flag", "\u65E5\u7AE0\u65D7"]], left: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051"]], right: [["extinguisher", "\u6D88\u706B\u5668"], ["aed", "AED"]] },
    bank: { top: [["dboard", "\u70BA\u66FF\u30FB\u91D1\u5229\u8868\u793A"], ["vault", "\u91D1\u5EAB\u5BA4"]], left: [["sofa", "\u5F85\u5408\u30BD\u30D5\u30A1"]], right: [["extinguisher", "\u6D88\u706B\u5668"], ["aed", "AED"]] },
    sento: { top: [["mirror", "\u5927\u304D\u306A\u93E1"], ["noren", "\u306E\u308C\u3093"]], left: [["shoebox", "\u4E0B\u99C4\u7BB1"]], right: [["vending", "\u725B\u4E73\u306E\u51B7\u8535\u5EAB"], ["basket", "\u8131\u8863\u304B\u3054"]] },
    onsenbath: { top: [["mirror", "\u6D17\u9762\u306E\u93E1"], ["noren", "\u306E\u308C\u3093"]], left: [["shoebox", "\u4E0B\u99C4\u7BB1"]], right: [["vending", "\u725B\u4E73\u306E\u51B7\u8535\u5EAB"], ["basket", "\u8131\u8863\u304B\u3054"]] },
    logistics: { top: [["palrack", "\u30D1\u30EC\u30C3\u30C8\u30E9\u30C3\u30AF"], ["palrack", "\u30D1\u30EC\u30C3\u30C8\u30E9\u30C3\u30AF"], ["conveyor", "\u4ED5\u5206\u3051\u30B3\u30F3\u30D9\u30A2"]], left: [["pallet", "\u8377\u7269\u30D1\u30EC\u30C3\u30C8"], ["forklift", "\u30D5\u30A9\u30FC\u30AF\u30EA\u30D5\u30C8"]], right: [["pcdesk", "\u4ED5\u5206\u3051\u7BA1\u7406\u7AEF\u672B"], ["extinguisher", "\u6D88\u706B\u5668"]] },
    house: { top: [["shoebox", "\u4E0B\u99C4\u7BB1"], ["washer", "\u6D17\u6FEF\u6A5F"]], left: [["wardrobe", "\u305F\u3093\u3059"], ["umbrella", "\u5098\u7ACB\u3066"]], right: [["extinguisher", "\u6D88\u706B\u5668"]] },
    farmhouse: { top: [["shoebox", "\u4E0B\u99C4\u7BB1"], ["washer", "\u6D17\u6FEF\u6A5F"]], left: [["wardrobe", "\u305F\u3093\u3059"], ["basket", "\u53CE\u7A6B\u304B\u3054"]], right: [["umbrella", "\u5098\u7ACB\u3066"]] },
    villa: { top: [["shoebox", "\u4E0B\u99C4\u7BB1"], ["wardrobe", "\u30AF\u30ED\u30FC\u30BC\u30C3\u30C8"]], left: [["luggage", "\u65C5\u884C\u304B\u3070\u3093"], ["plant", "\u89B3\u8449\u690D\u7269"]], right: [["umbrella", "\u5098\u7ACB\u3066"]] },
    office: { top: T_OFFICE.slice(0, 4), left: [["coatrack", "\u30B3\u30FC\u30C8\u639B\u3051", null, false], ["plant", "\u89B3\u8449\u690D\u7269"]], right: [["extinguisher", "\u6D88\u706B\u5668"], ["exitsign", "\u975E\u5E38\u53E3", null, false]] }
  };
  function enrich(ctx4) {
    const E2 = EN[ctx4.b.type];
    if (!E2) return;
    const { W: W2, H: H4, add, occupied } = ctx4;
    const slots = { top: rowsOf(1, W2 - 2, 1).map((x) => [x, 1]), left: rowsOf(2, H4 - 4, 1).map((y) => [1, y]), right: rowsOf(2, H4 - 4, 1).map((y) => [W2 - 2, y]) };
    for (const [side, items] of Object.entries(E2)) {
      const ss = slots[side];
      let i = 0;
      for (const it of items) {
        while (i < ss.length && occupied(ss[i][0], ss[i][1])) i++;
        if (i >= ss.length) break;
        const [t, label, act = null, solid = true] = it;
        add(t, ss[i][0], ss[i][1], act, label, solid);
        i++;
      }
    }
  }

