  // src/carlife.js
  var PRIV = /* @__PURE__ */ new Set(["kei", "compact", "sedan", "minivan", "suv", "sports", "keitruck", "wagon", "luxury"]);
  var startAge = (id) => 20 + hash2(id, 8802) % 8;
  var cycleOf = (id) => 6 + hash2(id, 8803) % 6;
  var ageAt = (world, id, year) => ageYears(world.pop, id, world.M) - (Math.floor(world.M / 12) + 1900 - year);
  function ownsCar(world, id, year) {
    const p = world.pop;
    const age = ageYears(p, id, world.M);
    if (age < 18 || age > 85) return false;
    const h = hash2(id, 8801) % 100;
    const base = year < 1995 ? 38 : year < 2005 ? 52 : 58;
    if (h >= base) return false;
    return ageAt(world, id, year) >= startAge(id);
  }
  function carLife(world, id, year) {
    const a = ageAt(world, id, year), s0 = startAge(id), cy = cycleOf(id);
    const k = Math.max(0, Math.floor((a - s0) / cy));
    const buyYear = year - Math.max(0, a - s0 - k * cy);
    const used = k === 0 ? hash2(id, 8804) % 100 < 70 : hash2(id * 3 + k, 8805) % 100 < 30;
    return { gen: k, buyYear, used, my: used ? buyYear - 2 - hash2(id + k, 8806) % 5 : buyYear };
  }
  function carOfAt(world, id, year, gen) {
    const buyYear = year;
    let ty = "compact";
    for (let i = 0; i < 6; i++) {
      ty = pickVehType(hash2(id * 7 + i + gen * 131, 4401) >>> 0, buyYear);
      if (PRIV.has(ty)) break;
      ty = "compact";
    }
    return { ty, era: eraOfYear(buyYear) };
  }
  function carOf(world, id, year) {
    const L2 = carLife(world, id, year);
    const { ty, era } = carOfAt(world, id, L2.buyYear, L2.gen);
    const col = (hash2(id + L2.gen * 17, 5503) >>> 0) % CAR_COLORS.length;
    return { id: "PV" + String(id).padStart(5, "0"), ty, color: col, era, owner: id, gen: L2.gen, buyYear: L2.buyYear, used: L2.used, my: L2.my };
  }
  var coreCache = /* @__PURE__ */ new WeakMap();
  function coreTiles(map2) {
    let c = coreCache.get(map2);
    if (c) return c;
    const ri = roadInfo(map2), W2 = map2.W, H4 = map2.H, N2 = W2 * H4;
    const cands = [];
    if (0) for (let k = 0; k < N2; k += 7) {
      if (ri.drv[k] && ri.axis[k] !== AX.J && ri.thick[k] >= 2 && ri.thick[k] <= 4 && map2.ground[k] === T.ROAD) {
        const m = laneDirs(ri, k);
        for (let d = 0; d < 4; d++) if (m >> d & 1) cands.push(k * 4 + d);
      }
    }
    const fwd = [], tmp = [];
    const rv = /* @__PURE__ */ new Map();
    for (let k = 0; k < N2; k++) {
      if (!ri.drv[k]) continue;
      const m = laneDirs(ri, k);
      for (let d = 0; d < 4; d++) {
        if (!(m >> d & 1)) continue;
        const st3 = k * 4 + d;
        nextStates(ri, k, d, tmp);
        const L2 = [];
        for (let i = 0; i < tmp.length; i += 2) {
          L2.push(tmp[i]);
          let a = rv.get(tmp[i]);
          if (!a) rv.set(tmp[i], a = []);
          a.push(st3);
        }
        fwd[st3] = L2;
      }
    }
    const idx = new Int32Array(N2 * 4).fill(-1), low = new Int32Array(N2 * 4), onS = new Uint8Array(N2 * 4), comp = new Int32Array(N2 * 4).fill(-1);
    let counter = 0, nc = 0;
    const sizes = [];
    const stack = [];
    for (let root = 0; root < N2 * 4; root++) {
      if (idx[root] >= 0 || !fwd[root]) continue;
      const call = [[root, 0]];
      idx[root] = low[root] = counter++;
      stack.push(root);
      onS[root] = 1;
      while (call.length) {
        const fr = call[call.length - 1], v = fr[0], L2 = fwd[v] || [];
        if (fr[1] < L2.length) {
          const w = L2[fr[1]++];
          if (!fwd[w]) continue;
          if (idx[w] < 0) {
            idx[w] = low[w] = counter++;
            stack.push(w);
            onS[w] = 1;
            call.push([w, 0]);
          } else if (onS[w]) low[v] = Math.min(low[v], idx[w]);
        } else {
          if (low[v] === idx[v]) {
            let n2 = 0, w;
            do {
              w = stack.pop();
              onS[w] = 0;
              comp[w] = nc;
              n2++;
            } while (w !== v);
            sizes.push(n2);
            nc++;
          }
          call.pop();
          if (call.length) {
            const u = call[call.length - 1][0];
            low[u] = Math.min(low[u], low[v]);
          }
        }
      }
    }
    globalThis.__scc = { comp, sizes };
    let bi = -1, bs = 0;
    sizes.forEach((n2, i) => {
      if (n2 > bs) {
        bs = n2;
        bi = i;
      }
    });
    const best = { F: new Uint8Array(N2 * 4), Rv: new Uint8Array(N2 * 4) };
    for (let st3 = 0; st3 < N2 * 4; st3++) if (comp[st3] === bi) {
      best.F[st3] = 1;
      best.Rv[st3] = 1;
    }
    const out = new Uint8Array(N2);
    if (best) {
      for (let st3 = 0; st3 < N2 * 4; st3++) if (best.F[st3] && best.Rv[st3]) out[st3 >> 2] = 1;
    }
    coreCache.set(map2, out);
    return out;
  }
  var padCache = /* @__PURE__ */ new WeakMap();
  var lotOwn = /* @__PURE__ */ new WeakMap();
  function lotOwner(map2) {
    let m = lotOwn.get(map2);
    if (!m) {
      m = /* @__PURE__ */ new Map();
      for (const l of parkingOf(map2)) for (let j = 0; j < l.h; j++) for (let i = 0; i < l.w; i++) m.set(l.x + i + (l.y + j) * map2.W, l.b);
      lotOwn.set(map2, m);
    }
    return m;
  }
  function padFor(map2, bi) {
    let c = padCache.get(map2);
    if (!c) padCache.set(map2, c = /* @__PURE__ */ new Map());
    if (c.has(bi)) return c.get(bi);
    const ri = roadInfo(map2), W2 = map2.W, H4 = map2.H, b = map2.buildings[bi];
    const PR = buildProps(map2), core = coreTiles(map2), LO = lotOwner(map2);
    let best = null, bd = 1e9;
    const R5 = 28;
    for (let dy = -R5; dy <= R5; dy++) for (let dx = -R5; dx <= R5; dx++) {
      const x = b.doorX + dx, y = b.doorY + dy;
      if (x < 1 || y < 1 || x >= W2 - 1 || y >= H4 - 1) continue;
      const k = x + y * W2;
      const g = map2.ground[k];
      if (g !== T.GRASS && g !== T.PLAZA && g !== T.PATH || map2.bid[k] >= 0 || map2.deco[k] || map2.solid[k] || PR.has(k)) continue;
      for (let d = 0; d < 4; d++) {
        const rx = x + DX[d], ry = y + DY[d], rk = rx + ry * W2;
        if (!ri.drv[rk] || map2.ground[rk] !== T.ROAD || ri.axis[rk] === AX.J || !core[rk]) continue;
        const m = laneDirs(ri, rk);
        if (!m) continue;
        let ld = -1;
        for (let q = 0; q < 4; q++) if (m >> q & 1) {
          ld = q;
          break;
        }
        if (ld < 0) continue;
        const dist2 = Math.abs(dx) + Math.abs(dy) + (dy < 0 ? 1 : 0) - (LO.get(k) === bi ? 6 : 0);
        if (dist2 < bd) {
          bd = dist2;
          best = { px: x, py: y, rx, ry, ld, side: d };
        }
      }
    }
    if (!best) {
      for (let dy = -30; dy <= 30; dy++) for (let dx = -30; dx <= 30; dx++) {
        const x = b.doorX + dx, y = b.doorY + dy;
        if (x < 0 || y < 0 || x >= W2 || y >= H4) continue;
        const k = x + y * W2;
        if (!ri.drv[k] || map2.ground[k] !== T.ROAD || ri.axis[k] === AX.J || !core[k]) continue;
        const m = laneDirs(ri, k);
        if (!m) continue;
        const dist2 = Math.abs(dx) + Math.abs(dy);
        if (dist2 < bd) {
          let ld = 0;
          for (let q = 0; q < 4; q++) if (m >> q & 1) {
            ld = q;
            break;
          }
          bd = dist2;
          best = { px: x, py: y, rx: x, ry: y, ld, side: -1, onRoad: true };
        }
      }
    }
    c.set(bi, best);
    return best;
  }
  var G = null;
  var Q = null;
  var NS = [];
  var routeCache = /* @__PURE__ */ new WeakMap();
  function driveRoute(map2, from, to) {
    const ri = roadInfo(map2), cl = junctions(map2), W2 = map2.W, H4 = map2.H;
    let rc = routeCache.get(map2);
    if (!rc) routeCache.set(map2, rc = /* @__PURE__ */ new Map());
    const key = from.rx + from.ry * W2 + "," + to.rx + to.ry * W2;
    if (rc.has(key)) return rc.get(key);
    if (!G || G.length !== W2 * H4 * 4) {
      G = new Float32Array(W2 * H4 * 4);
      Q = new Int32Array(W2 * H4 * 4);
    }
    G.fill(1e9);
    const prev = /* @__PURE__ */ new Map();
    const open2 = [];
    const push = (f2, st3) => {
      open2.push([f2, st3]);
      let i = open2.length - 1;
      while (i > 0) {
        const p = i - 1 >> 1;
        if (open2[p][0] <= open2[i][0]) break;
        [open2[p], open2[i]] = [open2[i], open2[p]];
        i = p;
      }
    };
    const pop = () => {
      const top = open2[0], last = open2.pop();
      if (open2.length) {
        open2[0] = last;
        let i = 0;
        for (; ; ) {
          const l = 2 * i + 1, r2 = l + 1;
          let m = i;
          if (l < open2.length && open2[l][0] < open2[m][0]) m = l;
          if (r2 < open2.length && open2[r2][0] < open2[m][0]) m = r2;
          if (m === i) break;
          [open2[m], open2[i]] = [open2[i], open2[m]];
          i = m;
        }
      }
      return top;
    };
    const HL = carLinks(map2);
    const sk2 = from.rx + from.ry * W2, tk = to.rx + to.ry * W2;
    const hx2 = to.rx, hy = to.ry;
    const h = (k) => Math.abs(k % W2 - hx2) + Math.abs((k / W2 | 0) - hy);
    const m0 = laneDirs(ri, sk2);
    for (let d = 0; d < 4; d++) if (m0 >> d & 1) {
      G[sk2 * 4 + d] = 0;
      push(h(sk2), sk2 * 4 + d);
      prev.set(sk2 * 4 + d, -1);
    }
    let goal = -1, nodes = 0;
    while (open2.length && nodes++ < 4e5) {
      const [f2, st3] = pop();
      const k = st3 >> 2, d = st3 & 3;
      const g = G[st3];
      if (f2 > g + h(k) + 1e-3) continue;
      if (k === tk) {
        goal = st3;
        break;
      }
      {
        const lk = HL.get(st3);
        if (lk) {
          const ng = g + lk.cost;
          if (ng < G[lk.to]) {
            G[lk.to] = ng;
            prev.set(lk.to, st3);
            push(ng + h(lk.to >> 2), lk.to);
          }
        }
      }
      nextStates(ri, k, d, NS);
      for (let i = 0; i < NS.length; i += 2) {
        const ns = NS[i], nk = ns >> 2, nd = ns & 3;
        const ng = g + 1 + (nd !== d ? 0.6 : 0) + NS[i + 1] * 0.8 + (ri.thick[nk] === 1 ? 0.5 : 0);
        if (ng < G[ns]) {
          G[ns] = ng;
          prev.set(ns, st3);
          push(ng + h(nk), ns);
        }
      }
    }
    let r = null;
    if (goal >= 0) {
      const pts = [];
      for (let st3 = goal; st3 !== -1 && st3 !== void 0; st3 = prev.get(st3)) {
        const k = st3 >> 2;
        pts.push([k % W2, k / W2 | 0, st3 & 3]);
      }
      pts.reverse();
      for (let i = pts.length - 1; i > 0; i--) {
        const a = pts[i - 1], b = pts[i];
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) > 1.5) {
          const lk = HL.get(a[0] * 0 + (a[0] + a[1] * W2) * 4 + a[2]);
          if (lk && lk.to === (b[0] + b[1] * W2) * 4 + b[2]) {
            const mid = lk.tiles.map((t) => [t[0], t[1], a[2], lk.seg]);
            mid[0] = [a[0], a[1], a[2]];
            mid[mid.length - 1] = [b[0], b[1], b[2]];
            pts.splice(i - 1, 2, ...mid);
          }
        }
      }
      const stops = [];
      let s = 0;
      for (let i = 0; i < pts.length; i++) {
        const [x, y, d] = pts[i];
        const k = x + y * W2;
        if (i > 0) s += 1;
        if (!pts[i][3] && cl.stop[k] >> d & 1) {
          const ci = cl.stopCl[k];
          if (ci >= 0 && cl.list[ci].signal) stops.push({ s: s + 0.5, cl: ci, d });
        }
      }
      r = { pts, len: pts.length - 1, stops };
    }
    rc.set(key, r);
    if (rc.size > 3e3) rc.delete(rc.keys().next().value);
    return r;
  }
  function carTrip(map2, fromB, toB) {
    const a = padFor(map2, fromB), b = padFor(map2, toB);
    if (!a || !b) return null;
    const fb = map2.buildings[fromB], tb = map2.buildings[toB];
    if (Math.abs(fb.doorX - tb.doorX) + Math.abs(fb.doorY - tb.doorY) < 30) return null;
    const route = driveRoute(map2, a, b);
    if (!route || route.len < 12) return null;
    return { a, b, route };
  }
  var narrowOff = (ri, k, d) => isNarrowTwoWay(ri, k) ? d === 0 || d === 3 ? -0.22 : 0.22 : 0;
  function routePos(map2, route, s) {
    const ri = roadInfo(map2), W2 = map2.W, p = route.pts;
    const n2 = p.length;
    if (n2 < 2) {
      const q = p[0];
      return { x: q[0] + 0.5, y: q[1] + 0.5, d: q[2] };
    }
    s = Math.max(0, Math.min(n2 - 1 - 1e-6, s));
    const i = Math.floor(s), u = s - i;
    const a = p[i], b = p[i + 1];
    const oa = narrowOff(ri, a[0] + a[1] * W2, a[2]), ob = narrowOff(ri, b[0] + b[1] * W2, b[2]);
    const horiz = (a2) => a2[2] % 2 === 0;
    const ax = a[0] + 0.5 + (horiz(a) ? 0 : oa), ay = a[1] + 0.5 + (horiz(a) ? oa : 0), bx = b[0] + 0.5 + (horiz(b) ? 0 : ob), by = b[1] + 0.5 + (horiz(b) ? ob : 0);
    const x = ax + (bx - ax) * u, y = ay + (by - ay) * u;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    let d = b[2];
    if (a[2] === b[2] && (dx || dy) && Math.abs(dx) + Math.abs(dy) === 1) d = a[2];
    const lv = a[3] && b[3] && a[3] === b[3] ? a[3] : void 0;
    return { x, y, d, lv };
  }
  function padCarPos(pad) {
    return { x: pad.px + 0.5, y: pad.py + 0.5, d: pad.ld };
  }
  function padDoorPos(pad) {
    if (pad.onRoad) {
      const horiz = pad.ld % 2 === 0;
      return { x: pad.px + 0.5 + (horiz ? 0 : -0.9), y: pad.py + 0.5 + (horiz ? -0.9 : 0) };
    }
    const dx = pad.rx - pad.px, dy = pad.ry - pad.py;
    return { x: pad.px + 0.5 - dx * 0.95, y: pad.py + 0.5 - dy * 0.95 };
  }

