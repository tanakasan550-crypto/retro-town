  // src/taxi.js
  var TILE_M2 = 20;
  function taxiQuote(g, tiles) {
    const km = tiles * TILE_M2 / 1e3;
    const night = g.S.min >= 22 * 60 || g.S.min < 5 * 60;
    const fare2 = Math.round((500 + Math.max(0, km - 1) * 400) * (night ? 1.2 : 1));
    const mins = 5 + Math.ceil(km / 0.5);
    return { km: +km.toFixed(2), fare: g.yen(fare2), mins, night };
  }
  function taxiRide(g, destB, tiles) {
    const h = g.hero, L2 = g.S.loc;
    if (g.age() < 12 && !testBypass(g, "age")) return { ok: false, msg: "12\u6B73\u672A\u6E80\u306F\u3072\u3068\u308A\u3067\u30BF\u30AF\u30B7\u30FC\u306B\u4E57\u308C\u307E\u305B\u3093" };
    if (g.blocked()) return { ok: false, msg: "\u5148\u306B\u76EE\u306E\u524D\u306E\u51FA\u6765\u4E8B\u3092\u7247\u3065\u3051\u307E\u3057\u3087\u3046" };
    const q = taxiQuote(g, Math.max(1, tiles));
    if (h.money < q.fare) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\u904B\u8CC3\u306E\u76EE\u5B89 \xA5${q.fare.toLocaleString("ja-JP")})` };
    g.pay(q.fare, "\u30BF\u30AF\u30B7\u30FC\u4EE3");
    g.advance(q.mins);
    L2.k = "out";
    delete L2.b;
    delete L2.floor;
    L2.x = destB.doorX + 0.5;
    L2.y = destB.doorY + 0.6;
    L2.f = "d";
    L2.moving = false;
    g.log("taxi", `\u30BF\u30AF\u30B7\u30FC\u3067${destB.name}\u3078(\u7D04${q.mins}\u5206\u30FB\xA5${q.fare.toLocaleString("ja-JP")})`);
    return { ok: true, msg: `\u30BF\u30AF\u30B7\u30FC\u3067${destB.name}\u306B\u7740\u304D\u307E\u3057\u305F(\u7D04${q.mins}\u5206\u30FB\xA5${q.fare.toLocaleString("ja-JP")})`, q };
  }
  var TAXI = { trip: null, SPEED: 18 };
  function nearestPadBuilding(map2, x, y) {
    let best = -1, bd = 1e9;
    const R5 = 14;
    for (let dy = -R5; dy <= R5; dy++) for (let dx = -R5; dx <= R5; dx++) {
      const xx = Math.floor(x) + dx, yy = Math.floor(y) + dy;
      if (xx < 0 || yy < 0 || xx >= map2.W || yy >= map2.H) continue;
      const bi = map2.bid[xx + yy * map2.W];
      if (bi < 0) continue;
      const d = Math.abs(dx) + Math.abs(dy);
      if (d < bd && padFor(map2, bi)) {
        bd = d;
        best = bi;
      }
    }
    return best;
  }
  function taxiTripActive(g) {
    return !!(g.S && g.S.taxiTrip);
  }
  function taxiTripBegin(g, destB, tiles) {
    const h = g.hero, L2 = g.S.loc, map2 = g.world.map;
    if (g.age() < 12 && !testBypass(g, "age")) return { ok: false, msg: "12\u6B73\u672A\u6E80\u306F\u3072\u3068\u308A\u3067\u30BF\u30AF\u30B7\u30FC\u306B\u4E57\u308C\u307E\u305B\u3093" };
    if (g.blocked()) return { ok: false, msg: "\u5148\u306B\u76EE\u306E\u524D\u306E\u51FA\u6765\u4E8B\u3092\u7247\u3065\u3051\u307E\u3057\u3087\u3046" };
    const fromB = L2.k === "in" ? L2.b : nearestPadBuilding(map2, L2.x, L2.y);
    const toB = destB.idx;
    const a = fromB >= 0 ? padFor(map2, fromB) : null, b = padFor(map2, toB);
    const route = a && b && fromB !== toB ? driveRoute(map2, a, b) : null;
    if (!route || route.len < 6) {
      const r = taxiRide(g, destB, tiles);
      r.real = false;
      return r;
    }
    const q = taxiQuote(g, Math.max(tiles, route.len));
    if (h.money < q.fare) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\u904B\u8CC3\u306E\u76EE\u5B89 \xA5${q.fare.toLocaleString("ja-JP")})` };
    g.pay(q.fare, "\u30BF\u30AF\u30B7\u30FC\u4EE3");
    if (L2.k === "in") {
      const fb = g.bld(L2.b);
      L2.k = "out";
      delete L2.b;
      delete L2.floor;
      L2.x = fb.doorX + 0.5;
      L2.y = fb.doorY + 0.6;
    }
    const p02 = routePos(map2, route, 0);
    L2.x = p02.x;
    L2.y = p02.y;
    L2.f = ["r", "d", "l", "u"][p02.d & 3];
    L2.moving = false;
    g.S.taxiTrip = { dest: toB, mins: q.mins, fare: q.fare, from: fromB };
    TAXI.trip = { route, s: 0, dest: toB, q, d: p02.d };
    g.log("taxi", `\u30BF\u30AF\u30B7\u30FC\u306B\u4E57\u8ECA(${g.bld(toB).name}\u3078\u30FB\u7D04${q.mins}\u5206\u30FB\xA5${q.fare.toLocaleString("ja-JP")})`);
    return { ok: true, real: true, q, msg: `\u30BF\u30AF\u30B7\u30FC\u306B\u4E57\u308A\u307E\u3057\u305F\u3002${destB.name}\u3078\u5411\u304B\u3044\u307E\u3059(A\u30DC\u30BF\u30F3\u3067\u65E9\u9001\u308A)`, route };
  }
  function taxiTripEnd(g) {
    const tr = g.S.taxiTrip;
    if (!tr) return null;
    const dest = g.bld(tr.dest), L2 = g.S.loc;
    g.advance(tr.mins);
    L2.k = "out";
    delete L2.b;
    delete L2.floor;
    L2.x = dest.doorX + 0.5;
    L2.y = dest.doorY + 0.6;
    L2.f = "d";
    L2.moving = false;
    delete L2.lv;
    L2.z = 0;
    g.S.taxiTrip = null;
    TAXI.trip = null;
    g.log("taxi", `\u30BF\u30AF\u30B7\u30FC\u3067${dest.name}\u306B\u5230\u7740(\u7D04${tr.mins}\u5206\u30FB\xA5${tr.fare.toLocaleString("ja-JP")})`);
    return { dest, msg: `${dest.name}\u306B\u7740\u304D\u307E\u3057\u305F(\u904B\u8CC3 \xA5${tr.fare.toLocaleString("ja-JP")})` };
  }
  function taxiTripTick(g, dt, fast = false) {
    const tr = g.S.taxiTrip;
    if (!tr) return false;
    const T0 = TAXI.trip;
    if (!T0) {
      taxiTripEnd(g);
      return { ended: true };
    }
    const map2 = g.world.map;
    T0.t = (T0.t || 0) + dt * 10;
    let ns = T0.s + (fast ? 1e9 : TAXI.SPEED * dt);
    if (!fast) {
      const cl = junctions(map2);
      for (const sp of T0.route.stops) {
        const line = sp.s - 0.15;
        if (T0.s <= line + 1e-6 && ns > line) {
          const sg = signalAt(cl.list[sp.cl], T0.t, sp.d % 2 === 0 ? AX.H : AX.V);
          if (sg === "R" || sg === "Y") {
            ns = line;
            T0.waiting = true;
            break;
          }
        }
      }
    }
    T0.s = ns;
    if (T0.s >= T0.route.len - 0.2) {
      const r = taxiTripEnd(g);
      return { ended: true, ...r };
    }
    const p = routePos(map2, T0.route, T0.s);
    const L2 = g.S.loc;
    L2.x = p.x;
    L2.y = p.y;
    L2.f = ["r", "d", "l", "u"][p.d & 3];
    T0.d = p.d;
    L2.moving = false;
    return { riding: true };
  }

