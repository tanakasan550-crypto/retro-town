  // src/cars.js
  var MAKERS = { harukaze: "\u30CF\u30EB\u30AB\u30BC\u81EA\u52D5\u8ECA", hoshizora: "\u30DB\u30B7\u30BE\u30E9\u30E2\u30FC\u30BF\u30FC\u30BA", minato: "\u30DF\u30CA\u30C8\u5DE5\u6A5F", sakuragi: "\u30B5\u30AF\u30E9\u30AE\u81EA\u5DE5", nagi: "\u30CA\u30AE\u88FD\u4F5C\u6240" };
  var MODELS = [
    { id: "pocket", maker: "harukaze", name: "\u30DD\u30B1\u30C3\u30C8", type: "kei", cls: "kei", from: 1985, to: 2200, price: 6e5, econ0: 17, tank: 28, fuel: "reg", seats: 4 },
    { id: "mini", maker: "hoshizora", name: "\u30DF\u30CB\u30FB\u30B9\u30BF\u30FC", type: "kei", cls: "kei", from: 1988, to: 2011, price: 57e4, econ0: 18, tank: 27, fuel: "reg", seats: 4 },
    { id: "nono", maker: "hoshizora", name: "\u30CE\u30CE", type: "kei", cls: "kei", from: 2003, to: 2200, price: 88e4, econ0: 22, tank: 30, fuel: "reg", seats: 4 },
    { id: "hako", maker: "harukaze", name: "\u30CF\u30B3(\u8EFD\u30C8\u30E9)", type: "keitruck", cls: "kei", from: 1980, to: 2200, price: 7e5, econ0: 15, tank: 30, fuel: "reg", seats: 2 },
    { id: "cs", maker: "minato", name: "\u30B3\u30F3\u30D1\u30AF\u30C8S", type: "compact", cls: "small", from: 1985, to: 2200, price: 115e4, econ0: 14, tank: 40, fuel: "reg", seats: 5 },
    { id: "cityfam", maker: "sakuragi", name: "\u30B7\u30C6\u30A3\u30FB\u30D5\u30A1\u30DF\u30EA\u30A2", type: "compact", cls: "small", from: 1992, to: 2018, price: 125e4, econ0: 15, tank: 42, fuel: "reg", seats: 5 },
    { id: "serenade", maker: "nagi", name: "\u30BB\u30EC\u30CA\u30FC\u30C7", type: "sedan", cls: "mid", from: 1980, to: 2200, price: 23e5, econ0: 11, tank: 55, fuel: "reg", seats: 5 },
    { id: "exe", maker: "sakuragi", name: "\u30A8\u30B0\u30BC(\u9AD8\u7D1A\u30BB\u30C0\u30F3)", type: "sedan", cls: "large", from: 1985, to: 2200, price: 44e5, econ0: 9, tank: 65, fuel: "hi", seats: 5 },
    { id: "boxwagon", maker: "minato", name: "\u30DC\u30C3\u30AF\u30B9\u30EF\u30B4\u30F3", type: "minivan", cls: "mid", from: 1995, to: 2200, price: 21e5, econ0: 10, tank: 60, fuel: "reg", seats: 7 },
    { id: "famvan", maker: "hoshizora", name: "\u30D5\u30A1\u30DF\u30EA\u30FC\u30D0\u30F3", type: "minivan", cls: "mid", from: 1985, to: 2004, price: 185e4, econ0: 9, tank: 55, fuel: "reg", seats: 7 },
    { id: "trail", maker: "nagi", name: "\u30C8\u30EC\u30A4\u30EB(SUV)", type: "suv", cls: "mid", from: 1998, to: 2200, price: 27e5, econ0: 10, tank: 62, fuel: "reg", seats: 5 },
    { id: "lightning", maker: "sakuragi", name: "\u30E9\u30A4\u30C8\u30CB\u30F3\u30B0GT", type: "sports", cls: "large", from: 1985, to: 2200, price: 35e5, econ0: 8, tank: 60, fuel: "hi", seats: 2 },
    { id: "roadmini", maker: "minato", name: "\u30ED\u30FC\u30C9\u30DF\u30CB", type: "sports", cls: "small", from: 1989, to: 2006, price: 19e5, econ0: 12, tank: 45, fuel: "hi", seats: 2 },
    { id: "touring", maker: "minato", name: "\u30C4\u30FC\u30EA\u30F3\u30B0\u30EF\u30B4\u30F3", type: "wagon", cls: "mid", from: 1989, to: 2200, price: 24e5, econ0: 11, tank: 58, fuel: "reg", seats: 5 },
    { id: "royal", maker: "nagi", name: "\u30ED\u30A4\u30E4\u30EB(\u30B7\u30E7\u30FC\u30D5\u30A1\u30FC)", type: "luxury", cls: "large", from: 1975, to: 2200, price: 78e5, econ0: 7, tank: 75, fuel: "hi", seats: 5 },
    { id: "classic", maker: "sakuragi", name: "\u30D6\u30EB\u30FC\u30D0\u30FC\u30C9\u65E7\u578B(\u30AF\u30E9\u30B7\u30C3\u30AF)", type: "sedan", cls: "mid", from: 1955, to: 1984, price: 11e5, econ0: 8, tank: 50, fuel: "reg", seats: 5 },
    { id: "ecohatch", maker: "hoshizora", name: "\u30A8\u30B3\u30CF\u30C3\u30C1(\u30CF\u30A4\u30D6\u30EA\u30C3\u30C9)", type: "compact", cls: "small", from: 2012, to: 2200, price: 28e5, econ0: 20, tank: 40, fuel: "reg", seats: 5 },
    { id: "cargo", maker: "harukaze", name: "\u30AB\u30FC\u30B4\u30D0\u30F3(\u914D\u9001)", type: "delivery", cls: "mid", from: 1980, to: 2200, price: 2e6, econ0: 9, tank: 70, fuel: "dsl", seats: 3 }
  ];
  var MODEL = Object.fromEntries(MODELS.map((m) => [m.id, m]));
  var GRADES = [{ id: "basic", name: "\u30D9\u30FC\u30B7\u30C3\u30AF", k: 1 }, { id: "std", name: "\u30B9\u30BF\u30F3\u30C0\u30FC\u30C9", k: 1.14 }, { id: "lux", name: "\u30E9\u30B0\u30B8\u30E5\u30A2\u30EA\u30FC", k: 1.34 }];
  var FUEL_NAMES = { reg: "\u30EC\u30AE\u30E5\u30E9\u30FC", hi: "\u30CF\u30A4\u30AA\u30AF", dsl: "\u8EFD\u6CB9" };
  var CLS_NAMES = { kei: "\u8EFD\u81EA\u52D5\u8ECA", small: "\u5C0F\u578B\u8ECA", mid: "\u4E2D\u578B\u8ECA", large: "\u5927\u578B\u8ECA" };
  var KM_PER_TILE = 0.08;
  var modelOnSale = (m, y) => y >= m.from && y <= m.to;
  var econOf = (m, my) => Math.min(m.econ0 * 1.45, m.econ0 * (1 + 0.012 * Math.max(0, my - m.from)));
  var getCars = (h) => {
    const v = h.veh || (h.veh = { own: {}, ride: null });
    if (!v.cars) {
      v.cars = [];
      v.cur = null;
      v.sold = {};
      v.nextUid = 1;
    }
    return v;
  };
  function migrateLegacy(g) {
    const h = g.hero;
    const v = getCars(h);
    if (v.legacyDone) return;
    v.legacyDone = 1;
    if (v.own.car) {
      const m = MODEL.cs, y = g.year();
      const c = newCarRecord(g, m, Math.max(m.from, y - 6), 1, true, 62e3, 55);
      v.cars.push(c);
      v.cur = c.uid;
      delete v.own.car;
      if (v.ride === "car") v.ride = "car";
    }
  }
  var newPrice = (g, m, grade = 1, y = g.year()) => Math.round(g.yen(m.price) * (1 + 0.01 * Math.max(0, y - m.from)) * grade / 1e3) * 1e3;
  function usedValue(g, c, y = g.year()) {
    const m = MODEL[c.model];
    const age = Math.max(0, y - c.my);
    const base = g.yen(m.price) * (1 + 0.01 * Math.max(0, c.my - m.from)) * (c.grade || 1);
    const depr = Math.pow(0.84, age) * (0.72 + 0.28 * c.cond / 100) * (1 - Math.min(0.4, c.odo / 28e4));
    return Math.max(g.yen(3e4), Math.round(base * depr / 1e3) * 1e3);
  }
  var GP = [[1970, 60], [1980, 150], [1986, 95], [1990, 120], [1995, 105], [2e3, 105], [2005, 125], [2008, 175], [2009, 130], [2012, 150], [2015, 128], [2020, 135], [2022, 170], [2026, 160]];
  function gasPrice(year, M = 0, fuel = "reg") {
    let p;
    if (year <= GP[0][0]) p = GP[0][1];
    else if (year >= 2026) p = GP[GP.length - 1][1] * Math.pow(1.01, year - 2026);
    else {
      for (let i = 1; i < GP.length; i++) if (year <= GP[i][0]) {
        const [x0, y0] = GP[i - 1], [x1, y1] = GP[i];
        p = y0 + (y1 - y0) * (year - x0) / (x1 - x0);
        break;
      }
    }
    const wob = 1 + (hash2(M + 77, 31) % 1e3 / 1e3 - 0.5) * 0.06;
    p *= wob;
    if (fuel === "hi") p += 11;
    else if (fuel === "dsl") p -= 22;
    return Math.round(p);
  }
  function newCarRecord(g, m, my, gk, used, odo, cond, color) {
    const v = getCars(g.hero);
    const uid = v.nextUid++;
    const M = g.S.M;
    return {
      uid,
      model: m.id,
      my,
      grade: gk,
      color: color ?? hash2(uid * 31, m.price) % CAR_COLORS.length,
      odo: odo || 0,
      cond: cond ?? 100,
      fuel: Math.min(m.tank, used ? m.tank * 0.25 : m.tank * 0.5),
      boughtM: M,
      used: !!used,
      insM: M + 12,
      shakenM: M + (used ? 12 : 36),
      taxY: g.year(),
      lapsed: false,
      parked: null
    };
  }
  var curCar = (h) => {
    const v = getCars(h);
    return v.cars.find((c) => c.uid === v.cur) || null;
  };
  var carName = (c) => {
    const m = MODEL[c.model];
    return `${c.my}\u5E74\u5F0F ${MAKERS[m.maker]} ${m.name}`;
  };
  var fuelPct = (c) => Math.round(100 * c.fuel / MODEL[c.model].tank);
  function usedLot(g, shopIdx, M = g.S.M) {
    const out = [];
    const y0 = Math.floor(M / 12) + 1900;
    for (let a = M - 5; a <= M; a++) for (let k = 0; k < 2; k++) {
      const key = shopIdx * 1e5 + a * 4 + k;
      const h = hash2(key, 23063);
      const ya = Math.floor(a / 12) + 1900;
      const age = 1 + (h >>> 3) % 13;
      const my = ya - age;
      const pool = MODELS.filter((m2) => modelOnSale(m2, my));
      if (!pool.length) continue;
      const m = pool[(h >>> 8) % pool.length];
      const kmYear = 5e3 + hash2(key, 3) % 9e3;
      const odo = Math.round(age * kmYear / 100) * 100;
      const cond = 35 + hash2(key, 5) % 60;
      const color = hash2(key, 9) % CAR_COLORS.length;
      const c = { lot: key, model: m.id, my, grade: [1, 1.14, 1.34][hash2(key, 11) % 3], odo, cond, color, fuel: m.tank * 0.3, used: true };
      const price = Math.round(usedValueAt(g, c, ya) * 1.12 / 1e3) * 1e3;
      out.push({ ...c, price, arrived: a });
    }
    void y0;
    return out.filter((c) => !getCars(g.hero).sold[c.lot]).sort((p, q) => q.arrived - p.arrived || p.lot - q.lot);
  }
  function usedValueAt(g, c, y) {
    const m = MODEL[c.model];
    const age = Math.max(0, y - c.my);
    const piY = g.yen(m.price) * (1 + 0.01 * Math.max(0, c.my - m.from)) * c.grade;
    return piY * Math.pow(0.84, age) * (0.72 + 0.28 * c.cond / 100) * (1 - Math.min(0.4, c.odo / 28e4));
  }
  function newStock(g, y = g.year()) {
    return MODELS.filter((m) => modelOnSale(m, y));
  }
  function canOwn(g) {
    if (g.age() < 18) return { ok: false, msg: "\u8ECA\u3092\u8CB7\u3048\u308B\u306E\u306F18\u6B73\u304B\u3089\u3067\u3059" };
    if (!g.hero.quals.driver) return { ok: false, msg: "\u904B\u8EE2\u514D\u8A31\u304C\u5FC5\u8981\u3067\u3059(18\u6B73\u304B\u3089\u6559\u7FD2\u6240\u306E\u6848\u5185\u304C\u6765\u307E\u3059)" };
    return { ok: true };
  }
  function buyNew(g, modelId, gradeIdx, color, dealerIdx) {
    const c0 = canOwn(g);
    if (!c0.ok) return c0;
    const m = MODEL[modelId];
    if (!m || !modelOnSale(m, g.year())) return { ok: false, msg: "\u3053\u306E\u8ECA\u7A2E\u306F\u73FE\u5728\u8CA9\u58F2\u3057\u3066\u3044\u307E\u305B\u3093" };
    const grade = GRADES[gradeIdx] || GRADES[0];
    const price = newPrice(g, m, grade.k);
    if (g.hero.money < price) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${price.toLocaleString("ja-JP")})` };
    const v = getCars(g.hero);
    const car = newCarRecord(g, m, g.year(), grade.k, false, 5, 100, color);
    g.pay(price, `\u65B0\u8ECA\u8CFC\u5165: ${m.name}(${grade.name})`);
    v.cars.push(car);
    v.cur = car.uid;
    setParkedNear(g, car, dealerIdx);
    carBought(g, car, price);
    return { ok: true, msg: `${carName(car)}\u3092\u7D0D\u8ECA\u3057\u307E\u3057\u305F\u3002\u304A\u5E97\u306E\u524D\u306B\u505C\u3081\u3066\u3042\u308A\u307E\u3059\u3002`, car };
  }
  function buyUsed(g, lotItem, dealerIdx) {
    const c0 = canOwn(g);
    if (!c0.ok) return c0;
    const st3 = usedLot(g, dealerIdx).find((x) => x.lot === lotItem.lot);
    if (!st3) return { ok: false, msg: "\u3053\u306E\u8ECA\u306F\u3082\u3046\u58F2\u308C\u3066\u3057\u307E\u3063\u305F\u3088\u3046\u3067\u3059" };
    if (g.hero.money < st3.price) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${st3.price.toLocaleString("ja-JP")})` };
    const v = getCars(g.hero);
    const m = MODEL[st3.model];
    const car = newCarRecord(g, m, st3.my, st3.grade, true, st3.odo, st3.cond, st3.color);
    car.fuel = st3.fuel;
    g.pay(st3.price, `\u4E2D\u53E4\u8ECA\u8CFC\u5165: ${m.name}`);
    v.sold[st3.lot] = 1;
    v.cars.push(car);
    v.cur = car.uid;
    setParkedNear(g, car, dealerIdx);
    carBought(g, car, st3.price);
    return { ok: true, msg: `${carName(car)}\u3092\u8CB7\u3044\u307E\u3057\u305F\u3002\u304A\u5E97\u306E\u524D\u306B\u505C\u3081\u3066\u3042\u308A\u307E\u3059\u3002`, car };
  }
  function carBought(g, car, price) {
    g.log("buy", `\u8ECA\u3092\u8CB7\u3063\u305F: ${carName(car)}(\xA5${price.toLocaleString("ja-JP")})`, { car: 1 });
    const v = getCars(g.hero);
    if (v.cars.length === 1) {
      g.hero.flags.firstCar = g.S.M;
      g.log("memory", `\u306F\u3058\u3081\u3066\u306E\u8ECA\u3092\u8CB7\u3063\u305F(${carName(car)})`, { mem: "firstcar" });
    }
  }
  function setParkedNear(g, car, bIdx) {
    const b = bIdx != null ? g.world.map.buildings[bIdx] : null;
    if (b) car.parked = { x: b.doorX + 0.5 + 2, y: b.doorY + 0.5, d: 0, b: b.idx, where: b.name };
    else car.parked = { x: g.S.loc.x, y: g.S.loc.y, d: 1, where: "\u8857\u306E\u4E2D" };
  }
  function parkHere(g) {
    const v = getCars(g.hero);
    const c = curCar(g.hero);
    if (!c) return;
    const L2 = g.S.loc;
    c.parked = { x: L2.x, y: L2.y, d: dirIdx(L2.f), where: where(g, L2.x, L2.y) };
    if (v.ride === "car") v.ride = null;
  }
  var dirIdx = (f2) => f2 === "r" ? 0 : f2 === "d" ? 1 : f2 === "l" ? 2 : 3;
  function where(g, x, y) {
    let best = null, bd = 1e9;
    for (const b of g.world.map.buildings) {
      const d = Math.abs(b.doorX - x) + Math.abs(b.doorY - y);
      if (d < bd) {
        bd = d;
        best = b;
      }
    }
    return best ? `${best.name}\u306E\u8FD1\u304F` : "\u8857\u306E\u4E2D";
  }
  function distToParked(g, c) {
    if (!c || !c.parked) return 0;
    const L2 = g.S.loc;
    return Math.hypot(c.parked.x - L2.x, c.parked.y - L2.y);
  }
  function canDrive(g) {
    migrateLegacy(g);
    const h = g.hero;
    const c = curCar(h);
    if (!c) return { ok: false, msg: "\u8ECA\u3092\u6301\u3063\u3066\u3044\u307E\u305B\u3093" };
    if (g.age() < 18) return { ok: false, msg: "\u904B\u8EE2\u306F18\u6B73\u304B\u3089" };
    if (!h.quals.driver) return { ok: false, msg: "\u904B\u8EE2\u514D\u8A31\u304C\u3042\u308A\u307E\u305B\u3093" };
    if (c.rep && g.S.M < c.rep.until) return { ok: false, msg: `${c.rep.kind}\u306E\u4FEE\u7406\u4E2D\u3067\u3059(\u4FEE\u7406\u5DE5\u5834\u3002\u3042\u3068${c.rep.until - g.S.M}\u304B\u6708\u307B\u3069)` };
    if (c.fuel <= 0.05) return { ok: false, msg: "\u30AC\u30B9\u6B20\u3067\u3059\u3002\u30AC\u30BD\u30EA\u30F3\u30B9\u30BF\u30F3\u30C9\u3067\u7D66\u6CB9\u3057\u3066\u304F\u3060\u3055\u3044(\u8ECA\u306F\u7F6E\u3044\u3066\u3001\u6B69\u3044\u3066\u5411\u304B\u3046)" };
    if (c.lapsed) return { ok: false, msg: "\u8ECA\u691C\u307E\u305F\u306F\u4FDD\u967A\u304C\u5207\u308C\u3066\u3044\u307E\u3059\u3002\u30AC\u30BD\u30EA\u30F3\u30B9\u30BF\u30F3\u30C9\u304B\u8CA9\u58F2\u5E97\u3067\u624B\u7D9A\u304D\u3057\u3066\u304F\u3060\u3055\u3044" };
    return { ok: true };
  }
  function boardCar(g) {
    const c = canDrive(g);
    if (!c.ok) return c;
    const v = getCars(g.hero);
    const car = curCar(g.hero);
    if (g.S.loc.k !== "out") return { ok: false, msg: "\u8ECA\u306F\u5C4B\u5916\u3067\u306E\u307F\u4E57\u308C\u307E\u3059" };
    if (car.parked && distToParked(g, car) > 5) return { ok: false, msg: `\u8ECA\u306F ${car.parked.where} \u306B\u505C\u3081\u3066\u3042\u308A\u307E\u3059(\u3044\u307E\u306E\u5834\u6240\u304B\u3089\u9060\u3044)` };
    v.ride = "car";
    if (car.parked) {
      g.S.loc.x = car.parked.x;
      g.S.loc.y = car.parked.y;
    }
    car.parked = null;
    return { ok: true, msg: `${carName(car)}\u306B\u4E57\u308A\u307E\u3057\u305F\u3002` };
  }
  function driveTick(g, tiles) {
    const v = g.hero.veh;
    if (!v || v.ride !== "car") return null;
    const c = curCar(g.hero);
    if (!c) {
      v.ride = null;
      return null;
    }
    const km = tiles * KM_PER_TILE;
    const m = MODEL[c.model];
    const eff = econOf(m, c.my) * (0.85 + 0.15 * c.cond / 100);
    const use = km / eff;
    c.odo += km;
    c.fuel = Math.max(0, c.fuel - use);
    c.cond = Math.max(0, c.cond - km * 8e-4);
    if (c.fuel <= 0.01 && g.S.loc.lv) {
      c.fuel = 0.02;
      return null;
    }
    if (c.fuel <= 0.01) {
      v.ride = null;
      const L2 = g.S.loc;
      c.parked = { x: L2.x, y: L2.y, d: dirIdx(L2.f), where: where(g, L2.x, L2.y) };
      return { empty: true, msg: "\u30AC\u30B9\u6B20\u306B\u306A\u308A\u307E\u3057\u305F\u3002\u8ECA\u3092\u964D\u308A\u307E\u3059\u3002" };
    }
    return null;
  }
  function fuelQuote(g, c, fuel) {
    const m = MODEL[c.model];
    const price = gasPrice(g.year(), g.S.M, fuel);
    const room2 = Math.max(0, m.tank - c.fuel);
    return { price, room: room2, tank: m.tank, ok: fuel === m.fuel };
  }
  function refuel(g, uid, fuel, liters) {
    const v = getCars(g.hero);
    const c = v.cars.find((q2) => q2.uid === uid);
    if (!c) return { ok: false, msg: "\u8ECA\u304C\u3042\u308A\u307E\u305B\u3093" };
    const m = MODEL[c.model];
    if (fuel !== m.fuel) return { ok: false, msg: `\u3053\u306E\u8ECA\u306F${FUEL_NAMES[m.fuel]}\u3067\u3059(${FUEL_NAMES[fuel]}\u306F\u5165\u308C\u3089\u308C\u307E\u305B\u3093)` };
    const q = fuelQuote(g, c, fuel);
    let L2 = liters === "full" ? q.room : Math.min(q.room, Math.max(0, liters));
    L2 = Math.floor(L2 * 10) / 10;
    if (L2 <= 0) return { ok: false, msg: "\u3082\u3046\u6E80\u30BF\u30F3\u3067\u3059" };
    const cost = Math.round(L2 * q.price);
    if (g.hero.money < cost) {
      const aff = Math.floor(g.hero.money / q.price * 10) / 10;
      if (aff <= 0) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${cost.toLocaleString("ja-JP")})` };
      L2 = aff;
    }
    const pay = Math.round(L2 * q.price);
    g.pay(pay, `\u30AC\u30BD\u30EA\u30F3\u4EE3(${FUEL_NAMES[fuel]} ${L2}L)`);
    c.fuel = Math.min(m.tank, c.fuel + L2);
    return { ok: true, msg: `${FUEL_NAMES[fuel]}\u3092${L2}L(\xA5${pay.toLocaleString("ja-JP")})\u7D66\u6CB9\u3057\u307E\u3057\u305F\u3002`, liters: L2, cost: pay };
  }
  var TAX = { kei: 10800, small: 30500, mid: 39500, large: 51e3 };
  var SHAKEN = { kei: 7e4, small: 9e4, mid: 11e4, large: 14e4 };
  var parkingFee = (g) => {
    const h = g.hero;
    const home = h.homeB != null ? g.world.map.buildings[h.homeB] : null;
    if (home && (home.type === "house" || home.type === "farmhouse" || home.type === "villa")) return 0;
    return g.yen(12e3);
  };
  function monthlyCars(g) {
    const h = g.hero;
    const v = h.veh;
    if (!v) return;
    migrateLegacy(g);
    if (!v.cars || !v.cars.length) return;
    const M = g.S.M, y = g.year(), m0 = M % 12;
    for (const c of v.cars) {
      const m = MODEL[c.model];
      const fee = parkingFee(g);
      if (fee) g.pay(fee, `\u99D0\u8ECA\u5834\u4EE3(${m.name})`);
      if (m0 === 3 && c.taxY !== y) {
        c.taxY = y;
        g.pay(g.yen(TAX[m.cls]), `\u81EA\u52D5\u8ECA\u7A0E(${m.name})`);
      }
      if (M >= c.insM) {
        const p = insPremium(g, c, m.cls);
        if (h.money >= p) {
          g.pay(p, `\u81EA\u52D5\u8ECA\u4FDD\u967A(${m.name})`);
          c.insM = M + 12;
        } else if (!c.lapsedIns) {
          c.lapsedIns = 1;
          c.lapsed = true;
          g.log("car", `\u304A\u91D1\u304C\u8DB3\u308A\u305A\u3001${m.name}\u306E\u4FDD\u967A\u3092\u66F4\u65B0\u3067\u304D\u306A\u304B\u3063\u305F`);
        }
      }
      if (M >= c.shakenM) {
        const p = g.yen(SHAKEN[m.cls]) * (c.cond < 50 ? 1.3 : 1);
        if (h.money >= p) {
          g.pay(p, `\u8ECA\u691C\u30FB\u6574\u5099(${m.name})`);
          c.shakenM = M + 24;
          c.cond = Math.min(100, c.cond + 25);
        } else if (!c.lapsed) {
          c.lapsed = true;
          g.log("car", `\u304A\u91D1\u304C\u8DB3\u308A\u305A\u3001${m.name}\u306E\u8ECA\u691C\u3092\u901A\u305B\u306A\u304B\u3063\u305F`);
        }
      }
      if (c.lapsed && M < c.insM && M < c.shakenM) {
        c.lapsed = false;
        c.lapsedIns = 0;
      }
    }
  }
  function renewDocs(g, uid) {
    const v = getCars(g.hero);
    const c = v.cars.find((q) => q.uid === uid);
    if (!c) return { ok: false, msg: "" };
    const m = MODEL[c.model];
    const M = g.S.M;
    let cost = 0;
    const si = M >= c.insM ? insPremium(g, c, m.cls) : 0, ss = M >= c.shakenM ? g.yen(SHAKEN[m.cls]) * (c.cond < 50 ? 1.3 : 1) : 0;
    cost = si + ss;
    if (!cost) return { ok: false, msg: "\u66F4\u65B0\u304C\u5FC5\u8981\u306A\u624B\u7D9A\u304D\u306F\u3042\u308A\u307E\u305B\u3093" };
    if (g.hero.money < cost) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${Math.round(cost).toLocaleString("ja-JP")})` };
    g.pay(cost, `\u8ECA\u306E\u4FDD\u967A\u30FB\u8ECA\u691C\u306E\u66F4\u65B0(${m.name})`);
    if (si) c.insM = M + 12;
    if (ss) {
      c.shakenM = M + 24;
      c.cond = Math.min(100, c.cond + 25);
    }
    c.lapsed = false;
    c.lapsedIns = 0;
    return { ok: true, msg: `\u624B\u7D9A\u304D\u3092\u6E08\u307E\u305B\u307E\u3057\u305F(\xA5${Math.round(cost).toLocaleString("ja-JP")})\u3002` };
  }
  function serviceCar(g, uid) {
    const v = getCars(g.hero);
    const c = v.cars.find((q) => q.uid === uid);
    if (!c) return { ok: false, msg: "" };
    const cost = g.yen(8e3);
    if (c.cond >= 95) return { ok: false, msg: "\u6574\u5099\u306F\u5341\u5206\u3067\u3059" };
    if (g.hero.money < cost) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\xA5${cost.toLocaleString("ja-JP")})` };
    g.pay(cost, "\u70B9\u691C\u30FB\u30AA\u30A4\u30EB\u4EA4\u63DB");
    c.cond = Math.min(100, c.cond + 15);
    return { ok: true, msg: "\u70B9\u691C\u3068\u30AA\u30A4\u30EB\u4EA4\u63DB\u3092\u3057\u307E\u3057\u305F\u3002" };
  }
  function pumpSpot(b) {
    return { x: b.x + 4.7, y: b.y + 2.9 };
  }
  function moveToPump(g, bIdx) {
    const v = getCars(g.hero);
    if (v.ride !== "car" || g.S.loc.k !== "out") return false;
    const b = g.world.map.buildings[bIdx];
    if (!b) return false;
    const L2 = g.S.loc;
    if (!g.S.pump) g.S.pump = { restore: { x: L2.x, y: L2.y, f: L2.f }, b: bIdx };
    const p = pumpSpot(b);
    L2.x = p.x;
    L2.y = p.y;
    L2.f = "r";
    return true;
  }
  function leavePump(g) {
    const P2 = g.S.pump;
    if (!P2) return false;
    const L2 = g.S.loc;
    if (L2.k === "out") {
      L2.x = P2.restore.x;
      L2.y = P2.restore.y;
      L2.f = P2.restore.f;
    }
    g.S.pump = null;
    return true;
  }

