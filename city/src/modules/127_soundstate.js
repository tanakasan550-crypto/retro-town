  // src/soundstate.js
  var cache13 = /* @__PURE__ */ new WeakMap();
  function bset(map2) {
    let c = cache13.get(map2);
    if (!c) {
      c = { shop: map2.buildings.filter((b) => ["konbini", "super", "shop", "mall", "dept", "clothes", "greengrocer", "liquor", "seafood", "fishshop", "ramen", "izakaya", "restaurant", "cafe"].includes(b.type)), school: map2.buildings.filter((b) => ["elem", "jh", "hs", "kinder", "univ"].includes(b.type)), station: map2.buildings.filter((b) => b.type === "station"), arcs: arcadesOf(map2) };
      cache13.set(map2, c);
    }
    return c;
  }
  var dist = (arr, x, y, r) => {
    let best = Infinity;
    for (const b of arr) {
      const d = Math.abs(b.x + b.w / 2 - x) + Math.abs(b.y + b.h / 2 - y);
      if (d < best) best = d;
    }
    return best <= r ? best : null;
  };
  function soundState(g, R5, hero) {
    const L2 = g.S.loc, map2 = g.world.map, inside = L2.k === "in", hr = Math.floor(g.S.min / 60), dt = g.date();
    const s = { inside, night: g.S.min >= 20 * 60 || g.S.min < 6 * 60, hour: hr, min: g.S.min, month0: g.month0(), weather: R5.weather(), weekday: [1, 2, 3, 4, 5].includes(dt.dow !== void 0 ? dt.dow : 1), outdoor: !inside, hourChime: true, year: g.year() };
    if (inside) {
      try {
        s.party = soundLevel(g);
      } catch (_) {
        s.party = 0;
      }
      s.salon = !!(g.bld(L2.b) && g.bld(L2.b).salon);
      s.shopD = (() => {
        const b = g.bld(L2.b);
        return b && ["konbini", "super", "shop", "mall", "dept", "clothes"].includes(b.type) ? 2 : null;
      })();
      return typeof soundExtra === "function" ? soundExtra(g, R5, s) : s;
    }
    const x = L2.x, y = L2.y, c = bset(map2);
    s.shopD = dist(c.shop, x, y, 14);
    s.schoolD = dist(c.school, x, y, 16);
    s.stationD = dist(c.station, x, y, 8);
    let w = 1e9, gr = 0, n2 = 0, rail = false, road = false;
    const W2 = map2.W, H4 = map2.H;
    for (let dy = -6; dy <= 6; dy += 2) for (let dx = -6; dx <= 6; dx += 2) {
      const tx = Math.floor(x + dx), ty = Math.floor(y + dy);
      if (tx < 0 || ty < 0 || tx >= W2 || ty >= H4) continue;
      const t = map2.ground[ty * W2 + tx];
      n2++;
      if (t === T.WATER) w = Math.min(w, Math.hypot(dx, dy));
      if (t === T.GRASS || t === T.FOREST || t === T.FARM || t === T.PADDY) gr++;
      if (t === T.CROSSING) rail = true;
    }
    s.waterD = w < 1e8 ? w : null;
    s.green = n2 ? gr / n2 : 0;
    s.crossing = rail;
    void road;
    s.trainD = null;
    s.trainMoving = false;
    s.trainAtStop = false;
    try {
      for (const t of R5.trainsNow()) {
        const d = Math.hypot(t.x - x, t.y - y);
        if (s.trainD === null || d < s.trainD) {
          s.trainD = d;
          s.trainMoving = t.atStop < 0;
          s.trainAtStop = t.atStop >= 0;
        }
      }
    } catch (e) {
    }
    s.carD = null;
    s.carN = 0;
    s.busD = null;
    const tf = R5.traffic;
    if (tf && tf.cars) for (const q of tf.cars) {
      const d = Math.hypot(q.x - x, q.y - y);
      if (d < 24) s.carN++;
      if (s.carD === null || d < s.carD) s.carD = d;
      if ((q.ty === "bus" || q.ty === "tourbus") && (s.busD === null || d < s.busD)) s.busD = d;
    }
    s.arcade = false;
    {
      const A2 = arcadeAt(map2, Math.floor(x), Math.floor(y));
      if (A2) {
        s.arcade = true;
        s.arcadeKind = arcadeKind(A2, g.year());
        s.arcadeStyle = arcadeStyle(A2, s.arcadeKind, g.month0()).festival ? "festival" : null;
      }
    }
    s.open = s.waterD !== null || s.green > 0.5;
    return typeof soundExtra === "function" ? soundExtra(g, R5, s) : s;
  }

