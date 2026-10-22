  // src/interior_kinds.js
  var INT_MIN = { airport: [44, 22], stadium: [36, 20], hospital: [38, 18], univ: [40, 20], station: [26, 12], cinema: [20, 13], bowling: [20, 12], gym: [16, 11], aquarium: [22, 13], zoo: [24, 13], library: [20, 12], museum: [20, 13], police: [18, 12], fire: [20, 12], court: [20, 12], bank: [16, 11] };
  var rows = (a, b, s) => {
    const o = [];
    for (let v = a; v <= b; v += s) o.push(v);
    return o;
  };
  var KIND_LAYOUTS = {
    cinema({ W: W2, H: H4, add, wide, staffSpots, setFloor }) {
      setFloor("floor_carpet");
      wide("screen", 2, 1, W2 - 4, 1, null, "\u30B9\u30AF\u30EA\u30FC\u30F3");
      const ax = W2 >> 1;
      for (const y of rows(4, H4 - 5, 2)) for (let x = 2; x < W2 - 2; x++) {
        if (x === ax) continue;
        add("seat", x, y, "play", "\u30B9\u30AF\u30EA\u30FC\u30F3\u5E2D", false);
      }
      wide("counter", 2, H4 - 3, 3, 1, "pay", "\u53D7\u4ED8\u30FB\u58F2\u5E97");
      add("vending", 6, H4 - 3, null, "\u81EA\u8CA9\u6A5F");
      add("board", W2 - 3, H4 - 3, "info", "\u4E0A\u6620\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB", true);
      add("plant", W2 - 2, 3, null, "\u89B3\u8449\u690D\u7269");
      staffSpots.push({ x: 3, y: H4 - 2 });
    },
    bowling({ W: W2, H: H4, add, wide, staffSpots, seatSpots, setFloor }) {
      setFloor("floor_wood");
      const len = H4 - 6;
      for (let x = 2; x < W2 - 4; x += 2) wide("lane", x, 1, 1, len, "play", "\u30EC\u30FC\u30F3");
      wide("counter", W2 - 6, H4 - 3, 3, 1, "pay", "\u53D7\u4ED8\u30FB\u8CB8\u3057\u9774");
      add("shelf", W2 - 2, H4 - 5, null, "\u8CB8\u3057\u9774\u306E\u68DA");
      add("vending", W2 - 2, 3, null, "\u81EA\u8CA9\u6A5F");
      add("sofa", 2, H4 - 4, "rest", "\u5F85\u3061\u5E2D", false);
      add("sofa", 3, H4 - 4, "rest", "\u5F85\u3061\u5E2D", false);
      seatSpots.push({ x: 2, y: H4 - 4 }, { x: 3, y: H4 - 4 });
      staffSpots.push({ x: W2 - 5, y: H4 - 2 });
    },
    gym({ W: W2, H: H4, add, wide, staffSpots, setFloor }) {
      setFloor("floor_tile");
      for (let x = 2; x < W2 - 3; x += 2) add("treadmill", x, 2, "play", "\u30E9\u30F3\u30CB\u30F3\u30B0\u30DE\u30B7\u30F3");
      for (let x = 2; x < W2 - 3; x += 3) wide("weights", x, 5, 2, 1, "play", "\u30D9\u30F3\u30C1\u30D7\u30EC\u30B9\u30FB\u30A6\u30A7\u30A4\u30C8");
      for (let x = 2; x < W2 - 4; x += 2) add("playmat", x, H4 - 5, null, "\u30B9\u30C8\u30EC\u30C3\u30C1\u30DE\u30C3\u30C8", false);
      wide("counter", W2 - 4, H4 - 3, 2, 1, "pay", "\u53D7\u4ED8");
      add("watersrv", W2 - 2, 2, null, "\u7D66\u6C34\u6A5F");
      add("locker", 1, 1, "locker", "\u30ED\u30C3\u30AB\u30FC");
      staffSpots.push({ x: W2 - 4, y: H4 - 2 }, { x: 4, y: 4 });
    },
    aquarium({ W: W2, H: H4, add, wide, staffSpots, setFloor }) {
      setFloor("floor_marble");
      for (let x = 1; x + 3 <= W2 - 1; x += 4) wide("fishtank", x, 1, 3, 1, "play", "\u5927\u6C34\u69FD(\u898B\u5B66)");
      for (let x = 2; x + 3 <= W2 - 2; x += 5) {
        if (Math.abs(x + 1 - (W2 >> 1)) < 2) continue;
        wide("fishtank", x, 5, 3, 1, "play", "\u56DE\u904A\u6C34\u69FD(\u898B\u5B66)");
      }
      for (let x = 2; x < W2 - 3; x += 3) add("bench", x, 3, null, "\u30D9\u30F3\u30C1", false);
      add("bench", 3, 7, null, "\u30D9\u30F3\u30C1", false);
      add("bench", W2 - 4, 7, null, "\u30D9\u30F3\u30C1", false);
      wide("counter", W2 - 5, H4 - 3, 3, 1, "pay", "\u53D7\u4ED8\u30FB\u30DF\u30E5\u30FC\u30B8\u30A2\u30E0\u30B7\u30E7\u30C3\u30D7");
      staffSpots.push({ x: W2 - 4, y: H4 - 2 }, { x: 6, y: 4 });
    },
    zoo({ W: W2, H: H4, add, wide, staffSpots, setFloor }) {
      setFloor("floor_tile");
      for (let x = 1; x + 2 <= W2 - 1; x += 3) wide("cell", x, 1, 2, 2, "play", "\u5C55\u793A(\u898B\u5B66)", { animal: (x * 7 >> 1) % 4 });
      for (let x = 3; x + 2 <= W2 - 2; x += 5) {
        if (Math.abs(x + 1 - (W2 >> 1)) < 2) continue;
        wide("cell", x, 5, 2, 2, "play", "\u5C55\u793A(\u898B\u5B66)", { animal: (x >> 1) % 4 });
      }
      add("bench", 2, 4, null, "\u30D9\u30F3\u30C1", false);
      add("bench", W2 - 3, 4, null, "\u30D9\u30F3\u30C1", false);
      wide("counter", W2 - 5, H4 - 3, 3, 1, "pay", "\u53D7\u4ED8\u30FB\u58F2\u5E97");
      staffSpots.push({ x: W2 - 4, y: H4 - 2 }, { x: 5, y: 4 });
    },
    police({ W: W2, H: H4, add, wide, staffSpots, setFloor, bt }) {
      setFloor("floor_tile");
      for (const x of [3, 4, 5]) add("counter", x, 3, bt.hall ? "hall" : null, "\u53D7\u4ED8\u7A93\u53E3");
      staffSpots.push({ x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 });
      for (const x of rows(2, W2 - 8, 3)) add("desk", x, 7, "work", "\u5E2D"), staffSpots.push({ x, y: 8 });
      wide("cell", W2 - 6, 1, 2, 2, null, "\u7559\u7F6E\u5BA4");
      wide("cell", W2 - 6, 4, 2, 2, null, "\u7559\u7F6E\u5BA4");
      add("board", 8, 1, "board", "\u63B2\u793A\u677F(\u9632\u72AF\u30FB\u4EA4\u901A\u5B89\u5168)");
      add("locker", W2 - 3, 8, null, "\u88C5\u5099\u30ED\u30C3\u30AB\u30FC");
      add("plant", 1, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
      add("bench", 2, 5, null, "\u5F85\u5408\u306E\u30D9\u30F3\u30C1", false);
    },
    fire({ W: W2, H: H4, add, wide, staffSpots, setFloor, bt }) {
      setFloor("floor_tile");
      wide("firetruck", 1, 2, 3, 2, null, "\u6D88\u9632\u8ECA(\u30DD\u30F3\u30D7\u8ECA)");
      wide("firetruck", 5, 2, 3, 2, null, "\u6D88\u9632\u8ECA(\u306F\u3057\u3054\u8ECA)");
      for (const x of [W2 - 5, W2 - 3]) add("desk", x, 3, "work", "\u5E2D"), staffSpots.push({ x, y: 4 });
      add("locker", W2 - 2, 6, null, "\u9632\u706B\u8863\u30ED\u30C3\u30AB\u30FC");
      add("board", 10, 1, "board", "\u63B2\u793A\u677F(\u9632\u706B\u30FB\u9632\u707D)");
      add("counter", W2 - 4, H4 - 3, bt.hall ? "hall" : null, "\u53D7\u4ED8");
      add("plant", 1, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
      staffSpots.push({ x: 9, y: 4 }, { x: 9, y: 6 });
    },
    court({ W: W2, H: H4, add, wide, staffSpots, setFloor, bt }) {
      setFloor("floor_wood");
      wide("judgebench", (W2 >> 1) - 1, 1, 3, 1, null, "\u88C1\u5224\u5B98\u5E2D");
      add("desk", 3, 4, "work", "\u539F\u544A\u5E2D");
      add("desk", W2 - 4, 4, "work", "\u88AB\u544A\u5E2D");
      staffSpots.push({ x: W2 >> 1, y: 2 }, { x: 3, y: 5 }, { x: W2 - 4, y: 5 });
      const ax = W2 >> 1;
      for (const y of rows(7, H4 - 4, 2)) for (let x = 2; x < W2 - 2; x++) {
        if (x === ax) continue;
        add("bench", x, y, null, "\u508D\u8074\u5E2D", false);
      }
      add("counter", W2 - 4, H4 - 3, bt.hall ? "hall" : null, "\u66F8\u8A18\u5B98\u7A93\u53E3");
      add("plant", 1, 2, null, "\u89B3\u8449\u690D\u7269");
      add("board", 2, 1, "board", "\u958B\u5EF7\u8868", true);
    },
    bank({ W: W2, H: H4, add, wide, staffSpots, setFloor }) {
      setFloor("floor_marble");
      for (const x of [3, 4, 5, 6]) add("counter", x, 3, "bank", "\u7A93\u53E3(\u4F4F\u5B85\u30ED\u30FC\u30F3\u30FB\u7A4D\u7ACB\u6295\u8CC7)"), staffSpots.push({ x, y: 2 });
      add("atm", W2 - 3, 1, "bank", "ATM");
      add("atm", W2 - 5, 1, "bank", "ATM");
      wide("vault", W2 - 4, 5, 2, 2, null, "\u91D1\u5EAB\u5BA4");
      add("sofa", 2, 6, "rest", "\u5F85\u3061\u5E2D", false);
      add("sofa", 3, 6, "rest", "\u5F85\u3061\u5E2D", false);
      add("desk", 3, 8, "work", "\u76F8\u8AC7\u5E2D");
      add("desk", 6, 8, "work", "\u76F8\u8AC7\u5E2D");
      staffSpots.push({ x: 3, y: 9 > H4 - 3 ? H4 - 3 : 9 }, { x: 6, y: 9 > H4 - 3 ? H4 - 3 : 9 });
      add("board", 9, 1, "board", "\u91D1\u5229\u30FB\u70BA\u66FF\u306E\u63B2\u793A", true);
      add("plant", 1, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
    },
    library({ W: W2, H: H4, add, wide, staffSpots, seatSpots, setFloor }) {
      setFloor("floor_carpet");
      for (const y of [2, 4]) for (let x = 1; x + 2 <= W2 - 2; x += 3) wide("bookcase", x, y, 2, 1, "shelf", "\u672C\u68DA");
      wide("bookcase", 1, 1, W2 - 3, 1, "shelf", "\u672C\u68DA(\u58C1\u9762)");
      for (let x = 2; x + 1 < W2 - 2; x += 4) {
        add("desk", x, 7, "read", "\u95B2\u89A7\u5E2D");
        seatSpots.push({ x, y: 8 });
        add("desk", x + 1, 7, "read", "\u95B2\u89A7\u5E2D");
        seatSpots.push({ x: x + 1, y: 8 });
      }
      wide("counter", W2 - 5, H4 - 3, 3, 1, "register", "\u8CB8\u51FA\u30AB\u30A6\u30F3\u30BF\u30FC");
      add("plant", 1, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
      staffSpots.push({ x: W2 - 4, y: H4 - 2 }, { x: 6, y: 6 });
    },
    museum({ W: W2, H: H4, add, wide, staffSpots, setFloor }) {
      setFloor("floor_marble");
      for (let x = 2; x + 2 <= W2 - 2; x += 4) wide("showcase", x, 2, 2, 1, "shelf", "\u5C55\u793A\u30B1\u30FC\u30B9");
      for (let x = 3; x + 2 <= W2 - 3; x += 5) {
        if (Math.abs(x + 1 - (W2 >> 1)) < 2) continue;
        wide("showcase", x, 6, 2, 1, "shelf", "\u5C55\u793A\u30B1\u30FC\u30B9");
      }
      add("board", 1, 1, "info", "\u5C55\u793A\u306E\u3054\u6848\u5185", true);
      add("bench", 3, 9 > H4 - 4 ? H4 - 4 : 9, null, "\u30D9\u30F3\u30C1", false);
      wide("counter", W2 - 5, H4 - 3, 3, 1, "register", "\u53D7\u4ED8\u30FB\u30DF\u30E5\u30FC\u30B8\u30A2\u30E0\u30B7\u30E7\u30C3\u30D7");
      add("plant", 1, H4 - 3, null, "\u89B3\u8449\u690D\u7269");
      staffSpots.push({ x: W2 - 4, y: H4 - 2 }, { x: 8, y: 4 });
    }
  };

