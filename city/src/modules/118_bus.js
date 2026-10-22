  // src/bus.js
  var BUS_START = 6 * 60;
  var BUS_END = 22 * 60 + 30;
  var BUS_REACH = 30;
  var BUS_KMH = 18;
  function nearestStop(map2, x, y) {
    let best = null, bd = 1e9;
    for (const s of map2.stations) {
      const v = Math.abs(s.door.x - x) + Math.abs(s.door.y - y);
      if (v < bd) {
        bd = v;
        best = s;
      }
    }
    return best ? { stop: best, tiles: bd } : null;
  }
  function headway(min) {
    return min >= 19 * 60 ? 20 : 12;
  }
  function busQuote(g, fromStop, toStop) {
    const t = g.S.min;
    const hw = headway(t);
    const running = t >= BUS_START && t <= BUS_END;
    const wait = running ? (hw - t % hw) % hw || hw : 0;
    const tiles = Math.abs(fromStop.door.x - toStop.door.x) + Math.abs(fromStop.door.y - toStop.door.y) + 6;
    const ride = Math.max(4, Math.ceil(tiles * 0.02 / BUS_KMH * 60 + 2));
    const fare2 = g.yen(g.age() < 12 ? 120 : 230);
    return { running, wait, ride, mins: wait + ride, fare: fare2, hw };
  }
  function busRide(g, destStop) {
    const L2 = g.S.loc;
    if (g.blocked()) return { ok: false, msg: "\u5148\u306B\u76EE\u306E\u524D\u306E\u51FA\u6765\u4E8B\u3092\u7247\u3065\u3051\u307E\u3057\u3087\u3046" };
    if (L2.k !== "out") return { ok: false, msg: "\u5EFA\u7269\u3092\u51FA\u3066\u505C\u7559\u6240\u3078\u5411\u304B\u3044\u307E\u3057\u3087\u3046" };
    const from = nearestStop(g.world.map, L2.x, L2.y);
    if (!from || from.tiles > BUS_REACH) return { ok: false, msg: `\u505C\u7559\u6240\u304C\u9060\u3059\u304E\u307E\u3059(\u99C5\u524D\u306E\u505C\u7559\u6240\u307E\u3067\u7D04${from ? from.tiles : "?"}\u30BF\u30A4\u30EB)` };
    if (from.stop.id === destStop.id) return { ok: false, msg: "\u3053\u3053\u304C\u6700\u5BC4\u308A\u306E\u505C\u7559\u6240\u3067\u3059\u3002\u6B69\u3044\u3066\u884C\u3051\u307E\u3059" };
    const q = busQuote(g, from.stop, destStop);
    if (!q.running) return { ok: false, msg: "\u30D0\u30B9\u306F6:00\u301C22:30\u306E\u904B\u884C\u3067\u3059" };
    if (g.hero.money < q.fare) return { ok: false, msg: `\u304A\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093(\u904B\u8CC3 \xA5${q.fare.toLocaleString("ja-JP")})` };
    g.pay(q.fare, "\u30D0\u30B9\u4EE3");
    g.advance(q.mins);
    L2.k = "out";
    delete L2.b;
    delete L2.floor;
    L2.x = destStop.door.x + 0.5;
    L2.y = destStop.door.y + 0.6;
    L2.f = "d";
    L2.moving = false;
    g.S.stats.rides = (g.S.stats.rides || 0) + 1;
    g.log("bus", `\u30D0\u30B9\u3067${from.stop.name}\u524D\u304B\u3089${destStop.name}\u524D\u3078(\u7D04${q.mins}\u5206\u30FB\xA5${q.fare.toLocaleString("ja-JP")})`);
    return { ok: true, msg: `\u30D0\u30B9\u3067${destStop.name}\u524D\u306B\u7740\u304D\u307E\u3057\u305F(\u5F85\u3061${q.wait}\u5206+\u4E57\u8ECA${q.ride}\u5206\u30FB\xA5${q.fare.toLocaleString("ja-JP")})`, q, from: from.stop };
  }

