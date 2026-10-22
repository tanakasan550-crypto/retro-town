  // src/transit.js
  var SERVICE_START = 5 * 60;
  var SERVICE_END = 24 * 60 + 20;
  function buildTransit(map2) {
    const LS = map2.lines || LINES, nameOf2 = map2.lines ? ((sid) => map2.stations.find((q) => q.id === sid).name) : ((sid) => stationById(sid).name);
    const lines = LS.map((l) => {
      const path = map2.railPaths?.[l.id] || buildRailPath(l);
      const stops = l.stations.map((sid, i) => ({ id: sid, name: nameOf2(sid), dist: path.stopDist[i], idx: i }));
      const arr = [0], dep = [l.dwell || 1];
      for (let i = 1; i < stops.length; i++) {
        arr.push(dep[i - 1] + (stops[i].dist - stops[i - 1].dist) / l.speed);
        dep.push(arr[i] + (l.dwell || 1));
      }
      const trip = arr[arr.length - 1];
      return { ...l, path, stops, arr, dep, trip };
    });
    return { lines, byId: Object.fromEntries(lines.map((l) => [l.id, l])) };
  }
  function trainsAt(tr, t) {
    const out = [];
    const day = Math.floor(t / 1440);
    for (const L2 of tr.lines) {
      for (const dir of [1, -1]) {
        const off = dir === 1 ? 0 : L2.headway / 2 | 0;
        for (let d0 = day - 1; d0 <= day; d0++) {
          const base = d0 * 1440 + SERVICE_START + off;
          const kMin = Math.max(0, Math.floor((t - L2.trip - base - 2) / L2.headway)), kMax = Math.floor((t - base) / L2.headway);
          for (let k = kMin; k <= kMax; k++) {
            const depT = base + k * L2.headway;
            if (depT > d0 * 1440 + SERVICE_END) break;
            if (depT < base) continue;
            const tau = t - depT;
            if (tau < 0 || tau > L2.trip + (L2.dwell || 1)) continue;
            {
              const ts = trainState(L2, dir, tau, hash2(L2.id.length * 131 + (dir > 0 ? 1 : 2), depT));
              ts.dep = Math.round(depT - d0 * 1440);
              ts.d0 = d0;
              out.push(ts);
            }
          }
        }
      }
    }
    return out;
  }
  function trainState(L2, dir, tau, id) {
    const n2 = L2.stops.length;
    let d = 0, atStop = -1;
    let i = 0;
    while (i < n2 - 1 && tau > L2.dep[i]) i++;
    if (tau <= L2.dep[i] && tau >= L2.arr[i]) {
      d = L2.stops[i].dist;
      atStop = i;
    } else {
      const a = L2.dep[i - 1], b = L2.arr[i];
      const u = Math.max(0, Math.min(1, (tau - a) / (b - a)));
      d = L2.stops[i - 1].dist + (L2.stops[i].dist - L2.stops[i - 1].dist) * u;
    }
    const dd = dir === 1 ? d : L2.path.len - d;
    const pos = posOnPath(L2.path, dd);
    return { id, line: L2.id, color: L2.color, dir, dd, len: L2.path.len, x: pos.x, y: pos.y, dx: dir === 1 ? pos.dx : -pos.dx, dy: dir === 1 ? pos.dy : -pos.dy, atStop: atStop < 0 ? -1 : dir === 1 ? atStop : n2 - 1 - atStop };
  }
  function nextDeparture(tr, lineId, dir, stopIdx, t) {
    const L2 = tr.byId[lineId];
    const n2 = L2.stops.length;
    const si = dir === 1 ? stopIdx : n2 - 1 - stopIdx;
    const offT = L2.dep[si];
    const off = dir === 1 ? 0 : L2.headway / 2 | 0;
    const day = Math.floor(t / 1440);
    for (let d0 = day - 1; d0 <= day + 1; d0++) {
      const base = d0 * 1440 + SERVICE_START + off;
      let k = Math.max(0, Math.ceil((t - base - offT) / L2.headway));
      for (; ; k++) {
        const depT = base + k * L2.headway;
        if (depT > d0 * 1440 + SERVICE_END) break;
        const at = depT + offT;
        if (at >= t) return { at, trainDep: depT };
      }
    }
    return null;
  }
  function rideMinutes(tr, lineId, i, j) {
    const L2 = tr.byId[lineId];
    const a = Math.min(i, j), b = Math.max(i, j);
    return L2.arr[b] - L2.dep[a];
  }
  function fare(stopsCount, yen1990 = 1) {
    return Math.round((140 + 20 * stopsCount) * yen1990 / 10) * 10;
  }
  function planRail(tr, fromId, toId) {
    if (fromId === toId) return { legs: [], stops: 0 };
    const adj = {};
    for (const L2 of tr.lines) L2.stops.forEach((s, i) => {
      var _a;
      (adj[_a = s.id] || (adj[_a] = [])).push({ line: L2.id, i });
    });
    const best = /* @__PURE__ */ new Map();
    const pq = [];
    const key = (s, l) => s + "|" + l;
    for (const a of adj[fromId] || []) {
      best.set(key(fromId, a.line), { c: 0, prev: null, st: fromId, line: a.line });
      pq.push(best.get(key(fromId, a.line)));
    }
    const done = /* @__PURE__ */ new Set();
    while (pq.length) {
      pq.sort((a, b) => a.c - b.c);
      const cur2 = pq.shift();
      const k = key(cur2.st, cur2.line);
      if (done.has(k)) continue;
      done.add(k);
      if (cur2.st === toId) {
        const legsRev = [];
        for (let n2 = cur2; n2; n2 = n2.prev) legsRev.push(n2);
        legsRev.reverse();
        return compress(tr, legsRev);
      }
      const L2 = tr.byId[cur2.line];
      const i = L2.stops.findIndex((s) => s.id === cur2.st);
      for (const j of [i - 1, i + 1]) if (j >= 0 && j < L2.stops.length) {
        const k2 = key(L2.stops[j].id, cur2.line);
        const c2 = cur2.c + (L2.stops[j].dist - L2.stops[i].dist) / L2.speed + 1;
        if (!best.has(k2) || best.get(k2).c > c2) {
          const nn = { c: c2, prev: cur2, st: L2.stops[j].id, line: cur2.line };
          best.set(k2, nn);
          pq.push(nn);
        }
      }
      for (const a of adj[cur2.st] || []) if (a.line !== cur2.line) {
        const k2 = key(cur2.st, a.line);
        const c2 = cur2.c + 10;
        if (!best.has(k2) || best.get(k2).c > c2) {
          const nn = { c: c2, prev: cur2, st: cur2.st, line: a.line, xfer: true };
          best.set(k2, nn);
          pq.push(nn);
        }
      }
    }
    return null;
  }
  function compress(tr, nodes) {
    const legs = [];
    let cur2 = null;
    for (const n2 of nodes) {
      if (!cur2 || cur2.line !== n2.line) {
        cur2 = { line: n2.line, from: n2.st, to: n2.st, stops: 0 };
        legs.push(cur2);
      } else if (n2.st !== cur2.to) {
        cur2.to = n2.st;
        cur2.stops++;
      }
    }
    const out = legs.filter((l) => l.from !== l.to);
    for (const l of out) {
      const L2 = tr.byId[l.line];
      l.fromIdx = L2.stops.findIndex((s) => s.id === l.from);
      l.toIdx = L2.stops.findIndex((s) => s.id === l.to);
      l.dir = l.toIdx > l.fromIdx ? 1 : -1;
    }
    return { legs: out, stops: out.reduce((a, l) => a + l.stops, 0) };
  }
  function simulateTrip(tr, plan, t0) {
    let t = t0;
    const out = [];
    for (const lg of plan.legs) {
      const nd = nextDeparture(tr, lg.line, lg.dir, lg.fromIdx, t);
      if (!nd) return { ok: false, reason: "\u7D42\u96FB\u5F8C\u3067\u3059", t };
      const L2 = tr.byId[lg.line];
      const board2 = nd.at;
      const alight = board2 + rideMinutes(tr, lg.line, lg.dir === 1 ? lg.fromIdx : L2.stops.length - 1 - lg.fromIdx, lg.dir === 1 ? lg.toIdx : L2.stops.length - 1 - lg.toIdx);
      out.push({ ...lg, board: board2, alight });
      t = alight + 2;
    }
    return { ok: true, arrive: out.length ? out[out.length - 1].alight : t0, legs: out };
  }

