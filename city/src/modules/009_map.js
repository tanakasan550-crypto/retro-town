  // src/map.js
  var GROUND_SOLID = /* @__PURE__ */ new Set([T.WATER, T.RAIL, T.ROCK, T.FOREST]);
  var DECO_SOLID = /* @__PURE__ */ new Set([D.TREE, D.VENDING, D.BENCH, D.POST, D.LAMP, D.FENCE, D.BUILDING]);
  var coastY = (x) => Math.round(148 + 3 * Math.sin(x / 9) + (x > 150 ? 2 : 0));
  var riverX = (y) => Math.round(128 + 6 * Math.sin(y / 14));
  function noise2(seed, x, y, cell2) {
    const gx = Math.floor(x / cell2), gy = Math.floor(y / cell2);
    const fx = x / cell2 - gx, fy = y / cell2 - gy;
    const v = (a2, b2) => hash2(hash2(seed, a2), b2) / 4294967296;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = v(gx, gy), b = v(gx + 1, gy), c = v(gx, gy + 1), d = v(gx + 1, gy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function stationById(id) {
    return STATIONS.find((s) => s.id === id);
  }
  function buildRailPath(line2, lookup = stationById) {
    const sts = line2.stations.map(lookup);
    const pts = [[sts[0].x, sts[0].y]];
    const stopIdx = [0];
    for (let i = 1; i < sts.length; i++) {
      const A2 = sts[i - 1], B2 = sts[i];
      const d = Math.sign(B2.x - A2.x) || 1;
      const p = [[A2.x + 4 * d, A2.y], [A2.x + 4 * d, B2.y], [B2.x - 4 * d, B2.y], [B2.x, B2.y]];
      for (const q of p) {
        const l = pts[pts.length - 1];
        if (l[0] !== q[0] || l[1] !== q[1]) pts.push(q);
      }
      stopIdx.push(pts.length - 1);
    }
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]));
    return { id: line2.id, pts, cum, len: cum[cum.length - 1], stopDist: stopIdx.map((i) => cum[i]) };
  }
  function posOnPath(path, d) {
    d = Math.max(0, Math.min(path.len, d));
    let i = 1;
    while (i < path.pts.length - 1 && path.cum[i] < d) i++;
    const a = path.pts[i - 1], b = path.pts[i], seg = path.cum[i] - path.cum[i - 1] || 1;
    const t = (d - path.cum[i - 1]) / seg;
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, dx: Math.sign(b[0] - a[0]), dy: Math.sign(b[1] - a[1]) };
  }
  var TRUNK = /* @__PURE__ */ new Set(["aoumi_chuo", "tohtower", "midoricho", "showacho", "shiomi"]);
  function generateMap(seed, opts = {}) {
    applySizes(opts.ver || 1);
    if ((opts.ver || 1) >= 4) return generateCity2(seed, opts, { assignNames, buildRailPath });
    let rng = new Rng(seed, "map");
    const N2 = MAP_W * MAP_H;
    const ground = new Uint8Array(N2), deco = new Uint8Array(N2), bid = new Int16Array(N2).fill(-1), net = new Uint8Array(N2);
    const I2 = (x, y) => y * MAP_W + x;
    const inb = (x, y) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
    const buildings = [];
    const zones = [];
    for (const s of STATIONS) zones.push({ id: s.zone, name: s.name + "\u5468\u8FBA", x: s.x, y: s.y + 8, rx: s.zone === "farm" ? 34 : s.zone === "onsen" ? 20 : 26, ry: s.zone === "farm" ? 22 : 15, station: s.id });
    for (const z of EXTRA_ZONES) zones.push({ ...z });
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      let g = T.GRASS;
      const cy = coastY(x);
      if (y >= cy) g = T.WATER;
      else if (y >= cy - 3 && x > 120) g = T.SAND;
      else if (y >= cy - 2 && x < 44) g = T.QUAY;
      const rx = riverX(y);
      if (y < cy && Math.abs(x - rx) <= 1) g = T.WATER;
      const mi = Math.max(0, Math.min(1, (x - 168) / 40)) * Math.max(0, Math.min(1, (46 - y) / 30)) + (noise2(seed, x, y, 6) - 0.5) * 0.35;
      const mi2 = Math.max(0, (46 - x) / 46) * Math.max(0, (34 - y) / 34) + (noise2(seed + 1, x, y, 6) - 0.5) * 0.3;
      if (g === T.GRASS) {
        const m = Math.max(mi, mi2);
        if (m > 0.72) g = T.ROCK;
        else if (m > 0.4) g = T.FOREST;
      }
      if (g === T.GRASS && x > 166 && y > 26 && y < 80 && noise2(seed + 2, x, y, 9) > 0.35) g = noise2(seed + 3, x, y, 5) > 0.55 ? T.PADDY : T.FARM;
      if (g === T.GRASS && x > 90 && x < 130 && y < 50 && noise2(seed + 4, x, y, 7) > 0.62) g = T.FOREST;
      ground[I2(x, y)] = g;
    }
    for (const s of STATIONS) for (let y = s.y - 6; y < s.y + 14; y++) for (let x = s.x - 22; x < s.x + 22; x++) if (inb(x, y)) {
      const g = ground[I2(x, y)];
      if (g === T.FOREST || g === T.ROCK) ground[I2(x, y)] = T.GRASS;
    }
    const railPaths = {};
    const setG = (x, y, g) => {
      if (inb(x, y)) ground[I2(x, y)] = g;
    };
    for (const line2 of LINES) {
      const rp = buildRailPath(line2);
      railPaths[line2.id] = rp;
      for (let i = 1; i < rp.pts.length; i++) {
        const [x0, y0] = rp.pts[i - 1], [x1, y1] = rp.pts[i];
        const sx = Math.sign(x1 - x0), sy = Math.sign(y1 - y0);
        let x = x0, y = y0;
        setG(x, y, T.RAIL);
        while (x !== x1 || y !== y1) {
          x += sx;
          y += sy;
          setG(x, y, T.RAIL);
        }
      }
    }
    const stations = [];
    for (const s of STATIONS) {
      for (let x = s.x - 3; x <= s.x + 3; x++) {
        setG(x, s.y + 1, T.PLATFORM);
      }
      for (let y = s.y + 5; y <= s.y + 6; y++) for (let x = s.x - 5; x <= s.x + 5; x++) setG(x, y, T.PLAZA);
      for (let y = s.y + 2; y <= s.y + 4; y++) for (let x = s.x - 6; x <= s.x + 6; x++) if (ground[I2(x, y)] !== T.RAIL && ground[I2(x, y)] !== T.WATER) setG(x, y, T.GRASS);
      const b = addBuilding("station", s.x - 3, s.y + 2, s.zone, { stationId: s.id, name: s.name + "\u99C5" });
      stations.push({ ...s, door: { x: b.doorX, y: b.doorY }, building: b.idx, platformY: s.y + 1 });
    }
    function addBuilding(type, bx, by, zone, extra2 = {}) {
      const bt = BTYPES[type];
      const idx = buildings.length;
      const b = { idx, id: "B" + String(idx).padStart(4, "0"), type, x: bx, y: by, w: bt.w, h: bt.h, doorX: bx + (bt.w >> 1), doorY: by + bt.h, zone, floors: bt.floors || 1, ...extra2 };
      buildings.push(b);
      for (let y = by; y < by + bt.h; y++) for (let x = bx; x < bx + bt.w; x++) if (inb(x, y)) bid[I2(x, y)] = idx;
      return b;
    }
    const isRoadish = (g) => g === T.ROAD || g === T.PLAZA || g === T.BRIDGE || g === T.CROSSING;
    const walkG2 = (g) => g !== T.WATER && g !== T.RAIL && g !== T.ROCK && g !== T.FOREST;
    const blocked = (x, y) => !inb(x, y) || bid[I2(x, y)] >= 0 || !walkG2(ground[I2(x, y)]) || DECO_SOLID.has(deco[I2(x, y)]);
    let localOnly = false;
    const V2 = (opts.ver || 1) >= 2;
    const rmeta = V2 ? { ax: new Uint8Array(N2), th: new Uint8Array(N2), ln: new Uint8Array(N2), ow: new Uint8Array(N2) } : null;
    function carveRoad(x, y, axBit = 0, thick = 1, lane = 0) {
      if (!inb(x, y) || bid[I2(x, y)] >= 0) return;
      const g = ground[I2(x, y)];
      if (localOnly && (g === T.WATER || g === T.RAIL || g === T.PLATFORM)) return;
      if (g === T.WATER) ground[I2(x, y)] = T.BRIDGE;
      else if (g === T.RAIL) ground[I2(x, y)] = T.CROSSING;
      else if (g === T.PLAZA || g === T.PLATFORM || g === T.CROSSING || g === T.BRIDGE) {
      } else ground[I2(x, y)] = T.ROAD;
      deco[I2(x, y)] = D.NONE;
      net[I2(x, y)] = 1;
      if (rmeta && axBit && (ground[I2(x, y)] === T.ROAD || ground[I2(x, y)] === T.BRIDGE || ground[I2(x, y)] === T.CROSSING || ground[I2(x, y)] === T.PLAZA)) {
        const k = I2(x, y), had = rmeta.ax[k];
        if (!had || (had & axBit) === 0 || thick >= rmeta.th[k]) {
          if (had && (had & axBit) === 0) {
            rmeta.th[k] = 0;
          } else {
            rmeta.th[k] = thick;
            rmeta.ln[k] = lane;
          }
        }
        rmeta.ax[k] = had | axBit;
      }
    }
    function carveLine(x0, y0, x1, y1, w) {
      if (V2) {
        const ex = w - 1, ey = w - 1;
        if (y0 === y1) {
          for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + ex; x++) for (let k = 0; k < w; k++) carveRoad(x, y0 + k, 1, w, k);
        } else if (x0 === x1) {
          for (let y = Math.min(y0, y1); y <= Math.max(y0, y1) + ey; y++) for (let k = 0; k < w; k++) carveRoad(x0 + k, y, 2, w, k);
        } else {
          for (let x = Math.min(x0, x1); x <= Math.max(x0, x1) + ex; x++) for (let k = 0; k < w; k++) carveRoad(x, y0 + k, 1, w, k);
          for (let y = Math.min(y0, y1); y <= Math.max(y0, y1) + ey; y++) for (let k = 0; k < w; k++) carveRoad(x1 + k, y, 2, w, k);
        }
        return;
      }
      for (let k = 0; k < w; k++) {
        let x = x0, y = y0;
        const sx = Math.sign(x1 - x0);
        while (x !== x1) {
          carveRoad(x, y + k);
          x += sx;
        }
        const sy = Math.sign(y1 - y0);
        carveRoad(x + k, y);
        while (y !== y1) {
          carveRoad(x + k, y);
          y += sy;
        }
        carveRoad(x + k, y);
      }
    }
    const roadSegs = [];
    for (const line2 of LINES) {
      for (let i = 1; i < line2.stations.length; i++) {
        const A2 = stationById(line2.stations[i - 1]), B2 = stationById(line2.stations[i]);
        const tw = (opts.ver || 1) >= 2 && TRUNK.has(A2.id) && TRUNK.has(B2.id) ? 4 : 2;
        const o = tw === 4 ? 1 : 0;
        if ((opts.ver || 1) >= 2 && B2.y > A2.y + 6) {
          const vx = B2.x + 12 < MAP_W - 3 ? B2.x + 12 : B2.x - 12, ya = A2.y + 5 - o, yb = B2.y + 5 - o;
          carveLine(A2.x, ya, vx - o, ya, tw);
          carveLine(vx - o, ya, vx - o, yb, tw);
          carveLine(vx - o, yb, B2.x, yb, tw);
        } else {
          carveLine(A2.x, A2.y + 5 - o, B2.x - o, A2.y + 5 - o, tw);
          carveLine(B2.x - o, A2.y + 5 - o, B2.x - o, B2.y + 5, tw);
        }
        roadSegs.push({ line: line2.id, from: A2.id, to: B2.id, pts: [[A2.x, A2.y + 5], [B2.x, A2.y + 5], [B2.x, B2.y + 5]] });
      }
    }
    for (const s of STATIONS) for (let y = s.y + 5; y <= s.y + 6; y++) for (let x = s.x - 5; x <= s.x + 5; x++) net[I2(x, y)] = 1;
    function carveLocalStreets() {
      localOnly = true;
      for (const s of STATIONS) {
        if (["farm", "onsen"].includes(s.zone)) continue;
        const ry = s.zone === "port" ? 12 : 18;
        for (let yy = s.y + 5; yy <= s.y + 5 + ry; yy += 9) carveLine(s.x - 24, yy, s.x + 24, yy, 1);
        for (let xx = s.x - 24; xx <= s.x + 24; xx += 12) carveLine(xx, s.y + 5, xx, s.y + 5 + ry, 1);
        if (rmeta) {
          let ri2 = 0;
          for (let yy = s.y + 5 + 9; yy < s.y + 5 + ry; yy += 9, ri2++) if (ri2 % 2 === 0) for (let x = s.x - 14; x <= s.x + 14; x++) {
            const k = I2(x, yy);
            if (inb(x, yy) && rmeta.ax[k] === 1 && rmeta.th[k] === 1) rmeta.ow[k] = ri2 >> 1 & 1 ? 1 : 4;
          }
          let ci = 0;
          for (let xx = s.x - 24 + 12; xx < s.x + 24; xx += 12, ci++) if (ci % 2 === 0) for (let y = s.y + 5 + 4; y <= s.y + 5 + ry - 3; y++) {
            const k = I2(xx, y);
            if (inb(xx, y) && rmeta.ax[k] === 2 && rmeta.th[k] === 1) rmeta.ow[k] = ci >> 1 & 1 ? 2 : 8;
          }
        }
      }
      localOnly = false;
    }
    function connectRoadComponents() {
      const rd2 = (g) => g === T.ROAD || g === T.BRIDGE || g === T.CROSSING;
      const comp = new Int32Array(N2).fill(-1);
      const comps = [];
      for (let k = 0; k < N2; k++) {
        if (comp[k] >= 0 || !rd2(ground[k])) continue;
        const q = [k];
        comp[k] = comps.length;
        for (let qi = 0; qi < q.length; qi++) {
          const t = q[qi], x = t % MAP_W, y = t / MAP_W | 0;
          for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + ax, ny = y + ay;
            if (!inb(nx, ny)) continue;
            const nk = I2(nx, ny);
            if (comp[nk] < 0 && rd2(ground[nk])) {
              comp[nk] = comps.length;
              q.push(nk);
            }
          }
        }
        comps.push(q);
      }
      const big = comps.map((q, i) => i).filter((i) => comps[i].length >= 12);
      if (big.length < 2) return;
      const samp = (i) => {
        const q = comps[i], st3 = Math.max(1, q.length / 120 | 0);
        const o = [];
        for (let j = 0; j < q.length; j += st3) o.push([q[j] % MAP_W, q[j] / MAP_W | 0]);
        return o;
      };
      const S2 = new Map(big.map((i) => [i, samp(i)]));
      const par = new Map(big.map((i) => [i, i]));
      const find = (i) => {
        while (par.get(i) !== i) {
          par.set(i, par.get(par.get(i)));
          i = par.get(i);
        }
        return i;
      };
      const cand = [];
      for (let a = 0; a < big.length; a++) for (let b = a + 1; b < big.length; b++) {
        let best = 1e9, bp = null;
        for (const p of S2.get(big[a])) for (const q of S2.get(big[b])) {
          const d = Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]);
          if (d < best) {
            best = d;
            bp = [p, q];
          }
        }
        cand.push([best, bp, big[a], big[b]]);
      }
      cand.sort((u, v) => u[0] - v[0]);
      const cost = (x0, y0, x1, y1, hFirst) => {
        let bad = 0, wet = 0;
        const chk = (x, y) => {
          if (!inb(x, y)) {
            bad += 9;
            return;
          }
          const k = I2(x, y);
          if (bid[k] >= 0 || ground[k] === T.PLATFORM) bad++;
          if (ground[k] === T.WATER || ground[k] === T.RAIL) wet++;
        };
        const seg = (xa, ya, xb, yb) => {
          let x = xa, y = ya;
          const sx = Math.sign(xb - xa), sy = Math.sign(yb - ya);
          while (x !== xb || y !== yb) {
            for (let k = 0; k < 2; k++) chk(sx !== 0 ? x : x + k, sx !== 0 ? y + k : y);
            if (x !== xb) x += sx;
            else y += sy;
          }
        };
        if (hFirst) {
          seg(x0, y0, x1, y0);
          seg(x1, y0, x1, y1);
        } else {
          seg(x0, y0, x0, y1);
          seg(x0, y1, x1, y1);
        }
        return { bad, wet };
      };
      for (const [d, [p, q], a, b] of cand) {
        if (find(a) === find(b) || d > 70) continue;
        const c1 = cost(p[0], p[1], q[0], q[1], true), c2 = cost(p[0], p[1], q[0], q[1], false);
        const pick5 = c1.bad + c1.wet * 2 <= c2.bad + c2.wet * 2 ? [true, c1] : [false, c2];
        if (pick5[1].bad > 0 || pick5[1].wet > 6) continue;
        if (pick5[0]) {
          carveLine(p[0], p[1], q[0], p[1], 2);
          carveLine(q[0], p[1], q[0], q[1], 2);
        } else {
          carveLine(p[0], p[1], p[0], q[1], 2);
          carveLine(p[0], q[1], q[0], q[1], 2);
        }
        par.set(find(a), find(b));
      }
    }
    const lotFree = (bx, by, w, h) => {
      for (let y = by - 1; y <= by + h; y++) for (let x = bx - 1; x <= bx + w; x++) {
        if (!inb(x, y)) return false;
        const k = I2(x, y);
        if (bid[k] >= 0) return false;
        const g = ground[k];
        const inside = x >= bx && x < bx + w && y >= by && y < by + h;
        if (inside) {
          if (!(g === T.GRASS || g === T.FARM || g === T.SAND || g === T.QUAY) || deco[k] === D.TREE) return false;
        } else if (g === T.RAIL) return false;
      }
      const dx = bx + (w >> 1), dy = by + h;
      return inb(dx, dy) && walkG2(ground[I2(dx, dy)]) && bid[I2(dx, dy)] < 0;
    };
    function connectDoor(dx, dy, maxD = 30) {
      if (net[I2(dx, dy)]) return true;
      const prev = /* @__PURE__ */ new Map();
      const q = [[dx, dy]];
      prev.set(I2(dx, dy), -1);
      let found = -1;
      for (let qi = 0; qi < q.length && found < 0; qi++) {
        const [x, y] = q[qi];
        for (const [ax, ay] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
          const nx = x + ax, ny = y + ay;
          if (!inb(nx, ny)) continue;
          const k2 = I2(nx, ny);
          if (prev.has(k2)) continue;
          if (Math.abs(nx - dx) + Math.abs(ny - dy) > maxD) continue;
          if (blocked(nx, ny)) continue;
          prev.set(k2, I2(x, y));
          if (net[k2]) {
            found = k2;
            break;
          }
          q.push([nx, ny]);
        }
      }
      if (found < 0) return false;
      let k = prev.get(found);
      const path = [];
      while (k !== -1 && k !== void 0) {
        path.push(k);
        k = prev.get(k);
      }
      for (const kk of path) {
        if (!isRoadish(ground[kk])) {
          if (ground[kk] !== T.QUAY && ground[kk] !== T.SAND) ground[kk] = T.PATH;
        }
        net[kk] = 1;
      }
      return true;
    }
    function recomputeNet() {
      const st3 = STATIONS[2];
      const start2 = I2(st3.x, st3.y + 5);
      const seen = new Uint8Array(N2);
      const q = [start2];
      seen[start2] = 1;
      for (let qi = 0; qi < q.length; qi++) {
        const k = q[qi], x = k % MAP_W, y = k / MAP_W | 0;
        for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + ax, ny = y + ay;
          if (!inb(nx, ny)) continue;
          const kk = I2(nx, ny);
          if (seen[kk] || blocked(nx, ny)) continue;
          seen[kk] = 1;
          q.push(kk);
        }
      }
      for (let k = 0; k < N2; k++) net[k] = seen[k] && (isRoadish(ground[k]) || ground[k] === T.PATH || ground[k] === T.QUAY) ? 1 : 0;
    }
    const carveLocalStreetsOnce = () => {
    };
    const dbg = {};
    function tryPlace(type, zone, cx, cy, rx, ry, coastal) {
      const bt = BTYPES[type];
      for (let att = 0; att < 140; att++) {
        let bx, by;
        const ang = rng.next() * Math.PI * 2, rr3 = Math.sqrt(rng.next());
        const gr = att > 90 ? 2 : att > 50 ? 1.5 : 1;
        bx = Math.round(cx + Math.cos(ang) * rx * gr * rr3 - bt.w / 2);
        by = Math.round(cy + Math.sin(ang) * ry * gr * rr3 - bt.h / 2);
        if (coastal) {
          bx = Math.round(cx + (rng.next() * 2 - 1) * rx * gr - bt.w / 2);
          let cmin = 999, cmax = -999;
          for (let xx = bx - 1; xx <= bx + bt.w; xx++) {
            const c = coastY(Math.max(0, Math.min(MAP_W - 1, xx)));
            if (c < cmin) cmin = c;
            if (c > cmax) cmax = c;
          }
          if (cmax - cmin > (att > 100 ? 1 : 0)) continue;
          by = cmin - bt.h - 2;
        }
        if (bx < 2 || by < 2 || bx + bt.w >= MAP_W - 2 || by + bt.h >= MAP_H - 6) {
          dbg[type + ":range"] = (dbg[type + ":range"] || 0) + 1;
          continue;
        }
        if (!lotFree(bx, by, bt.w, bt.h)) {
          dbg[type + ":lot"] = (dbg[type + ":lot"] || 0) + 1;
          continue;
        }
        const b = addBuilding(type, bx, by, zone);
        if (!connectDoor(b.doorX, b.doorY)) {
          for (let y = by; y < by + bt.h; y++) for (let x = bx; x < bx + bt.w; x++) bid[I2(x, y)] = -1;
          buildings.pop();
          dbg[type + ":conn"] = (dbg[type + ":conn"] || 0) + 1;
          continue;
        }
        return b;
      }
      return null;
    }
    function addTenant(par, type, extra2 = {}) {
      const bt = BTYPES[type];
      const idx = buildings.length;
      const t = { idx, id: "B" + String(idx).padStart(4, "0"), type, x: par.x, y: par.y, w: par.w, h: par.h, tw: bt.w, th: bt.h, doorX: par.doorX, doorY: par.doorY, zone: par.zone, floors: 1, parent: par.idx, tenant: true, ...extra2 };
      buildings.push(t);
      return t;
    }
    function placeAt(type, zone, bx, by) {
      const bt = BTYPES[type];
      if (bx < 2 || by < 2 || bx + bt.w >= MAP_W - 2 || by + bt.h >= MAP_H - 6) return null;
      if (!lotFree(bx, by, bt.w, bt.h)) return null;
      const b = addBuilding(type, bx, by, zone);
      if (!connectDoor(b.doorX, b.doorY, 14)) {
        for (let y = by; y < by + bt.h; y++) for (let x = bx; x < bx + bt.w; x++) bid[I2(x, y)] = -1;
        buildings.pop();
        return null;
      }
      return b;
    }
    const lotFreeAt = (type, bx, by) => {
      const bt = BTYPES[type];
      return !(bx < 2 || by < 2 || bx + bt.w >= MAP_W - 2 || by + bt.h >= MAP_H - 6) && lotFree(bx, by, bt.w, bt.h);
    };
    const priority = (t) => ({ cityhall: 0, hospital: 0, univ: 0, hs: 1, jh: 1, elem: 1, special: 1, tourtower: 1, court: 1, police: 1, fire: 1, mall: 1, dept: 1, hotel: 2, resorthotel: 2, market: 2, factory: 3, warehouse: 3, office: 3, tower: 3 })[t] ?? 5;
    const COASTAL = /* @__PURE__ */ new Set(["pier", "marina", "ferry", "beachhouse", "market"]);
    const placeLog = {};
    const zoneList = [...zones];
    const runZones = (pred) => {
      for (const z of zoneList) {
        const mix3 = ZONE_MIX[z.id] || ZONE_MIX.default;
        const list = [];
        for (const [t, n2] of Object.entries(mix3)) for (let i = 0; i < n2; i++) if (pred(t)) list.push(t);
        list.sort((a, b) => priority(a) - priority(b));
        for (const t of list) {
          const b = tryPlace(t, z.id, z.x, z.y, z.rx, z.ry, COASTAL.has(t));
          placeLog[t] = (placeLog[t] || 0) + (b ? 1 : 0);
        }
      }
    };
    runZones((t) => COASTAL.has(t));
    const extra = [["pier", "port", 22, "kazeminato"], ["pier", "port", 34, "kazeminato"], ["beachhouse", "resort", 170, "rinkai"], ["beachhouse", "resort", 184, "rinkai"], ["beachhouse", "resort", 192, "rinkai"]];
    for (const [t, zid, x, sid] of extra) {
      const z = zones.find((q) => q.station === sid);
      tryPlace(t, zid, x, z.y, 6, 4, true);
    }
    runZones((t) => priority(t) <= 3 && !COASTAL.has(t));
    const MUST = { hs: 4, univ: 2, elem: 4, jh: 3, kinder: 4, special: 1, hospital: 2, super: 4, market: 1, mall: 1, cityhall: 1 };
    const FALL = { hs: ["school", "suburb_n", "suburb_e", "civic"], univ: ["campus", "downtown"], elem: ["school", "suburb_n", "suburb_e", "farm", "civic"], jh: ["school", "suburb_n", "suburb_e"], kinder: ["school", "civic", "suburb_w", "farm"], special: ["school", "civic"], hospital: ["civic", "downtown"], super: ["civic", "school", "oldtown", "campus"], market: ["port"], mall: ["downtown", "tower"], cityhall: ["civic"] };
    for (const [t, n2] of Object.entries(MUST)) {
      let have = buildings.filter((b) => b.type === t).length;
      for (let i = 0; have < n2 && i < 40; i++) {
        const zid = FALL[t][i % FALL[t].length];
        const z = zones.find((q) => q.id === zid);
        if (tryPlace(t, zid, z.x, z.y, z.rx + 4, z.ry + 3, COASTAL.has(t))) have++;
      }
    }
    carveLocalStreets();
    if ((opts.ver || 1) >= 2) connectRoadComponents();
    recomputeNet();
    runZones((t) => priority(t) > 3 && !COASTAL.has(t));
    const edo = tryPlace("edovillage", "tower", 168, 100, 14, 8, false);
    if (edo) edo.name = "\u6C5F\u6238\u3055\u304F\u3089\u6751";
    const capNow = () => buildings.reduce((s, b) => s + (BTYPES[b.type].cat === "res" ? b.cap ?? BTYPES[b.type].cap : 0), 0);
    const resZones = ["suburb_n", "suburb_e", "suburb_w", "school", "civic", "oldtown", "campus", "shotengai", "downtown", "tower", "port"].map((id) => zones.find((z) => z.id === id)).filter(Boolean);
    let guard = 0;
    while (capNow() < 11800 && guard++ < 400) {
      const z = resZones[guard % resZones.length];
      tryPlace(rng.chance(0.65) ? "apt" : "house", z.id, z.x, z.y, z.rx + 6, z.ry + 6, false);
    }
    for (let i = 0; i < 18; i++) {
      const z = zones.find((q) => q.id === "farm");
      tryPlace("farmhouse", "farm", z.x, z.y, z.rx + 4, z.ry, false);
    }
    for (const [t, zids] of [["media", ["downtown", "tower", "civic", "shotengai"]], ["aquarium", ["resort", "tower", "downtown", "port"]]]) {
      let have = buildings.filter((b) => b.type === t).length;
      for (let i = 0; have < 1 && i < 60; i++) {
        const z = zones.find((q) => q.id === zids[i % zids.length]);
        if (z && tryPlace(t, z.id, z.x, z.y, z.rx + 10 + i * 3, z.ry + 8 + i * 2, COASTAL.has(t))) have++;
      }
    }
    let v2info = null;
    if ((opts.ver || 1) >= 2) {
      carveLocalStreetsOnce();
      v2info = fillPlan({ buildings, zones, tryPlace, placeAt, lotFreeAt, addTenant, setRng: (r) => {
        rng = r;
      }, seed, COASTAL });
    }
    for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
      const k = I2(x, y);
      const g = ground[k];
      if (bid[k] >= 0 || deco[k] || net[k]) continue;
      if (g === T.GRASS) {
        const urban = false;
        const r = rng.next();
        let pt = 0.035;
        if (x > 166 && y < 60) pt = 0.02;
        if (y < 30) pt = 0.06;
        if (r < pt) deco[k] = D.TREE;
        else if (r < pt + 0.02) deco[k] = D.FLOWER;
      }
    }
    for (const b of buildings) {
      const bt = BTYPES[b.type];
      if (["konbini", "super", "station", "mall", "dept"].includes(b.type)) {
        const vx = b.x + b.w, vy = b.y + b.h - 1;
        if (inb(vx, vy) && bid[I2(vx, vy)] < 0 && ground[I2(vx, vy)] === T.GRASS) deco[I2(vx, vy)] = D.VENDING;
      }
      if (bt.cat === "res" || bt.cat === "shop") {
        const px2 = b.x - 1, py = b.y + b.h - 1;
        if (inb(px2, py) && bid[I2(px2, py)] < 0 && ground[I2(px2, py)] === T.GRASS && rng.chance(0.35)) deco[I2(px2, py)] = D.POST;
      }
    }
    for (const s of STATIONS) {
      for (const dx of [-6, 6]) {
        const x = s.x + dx, y = s.y + 5;
        if (ground[I2(x, y)] === T.PLAZA) deco[I2(x, y)] = D.LAMP;
      }
      const bx = s.x - 4, by = s.y + 7;
      if (inb(bx, by) && ground[I2(bx, by)] === T.PLAZA) deco[I2(bx, by)] = D.BENCH;
    }
    const solid = new Uint8Array(N2);
    for (let k = 0; k < N2; k++) if (GROUND_SOLID.has(ground[k]) || DECO_SOLID.has(deco[k]) || bid[k] >= 0) solid[k] = 1;
    const names = assignNames(buildings, zones, rng);
    if ((opts.ver || 1) >= 3) {
      const used = /* @__PURE__ */ new Set();
      const nearest3 = (zid, n2, type) => {
        const z = zones.find((q) => q.id === zid);
        if (!z) return;
        const c = buildings.filter((q) => q.type === "warehouse" && !used.has(q.idx) && q.w >= 8 && q.h >= 4).sort((p, q) => Math.abs(p.x - z.x) + Math.abs(p.y - z.y) - (Math.abs(q.x - z.x) + Math.abs(q.y - z.y)) || p.idx - q.idx);
        for (const q of c.slice(0, n2)) {
          used.add(q.idx);
          q.type = type;
          const zn = ((zones.find((r) => r.id === q.zone) || {}).name || "").replace(/周辺$/, "");
          const k = hash2(seed, q.idx);
          q.name = type === "cardealer" ? ["\u30CF\u30EB\u30AB\u30BC\u81EA\u52D5\u8ECA", "\u30DB\u30B7\u30BE\u30E9\u30E2\u30FC\u30BF\u30FC\u30BA", "\u30DF\u30CA\u30C8\u5DE5\u6A5F", "\u30B5\u30AF\u30E9\u30AE\u81EA\u5DE5", "\u30CA\u30AE\u88FD\u4F5C\u6240"][k % 5] + " " + zn + "\u5E97" : zn + ["\u30AA\u30FC\u30C8", "\u30AB\u30FC\u30BB\u30F3\u30BF\u30FC", "\u30E2\u30FC\u30BF\u30FC\u30B9", "\u30AC\u30EC\u30FC\u30B8"][k % 4];
          q.carShop = true;
        }
      };
      nearest3("suburb_e", 1, "cardealer");
      nearest3("downtown", 1, "cardealer");
      nearest3("industrial", 1, "usedcar");
      nearest3("suburb_w", 1, "usedcar");
      nearest3("rural_s", 1, "usedcar");
    }
    for (const t of buildings) if (t.tenant) {
      const par = buildings[t.parent];
      t.addr = par.addr + " " + (t.tfloor || 1) + "F";
    }
    return { W: MAP_W, H: MAP_H, seed, ground, deco, solid, bid, net, buildings, zones, stations, railPaths, roadSegs, placeLog, dbg, v2info, ver: opts.ver || 1, rmeta, idx: I2 };
  }
  function assignNames(buildings, zones, rng) {
    const counter = {};
    for (const b of buildings) {
      const z = zones.find((q) => q.id === b.zone) || { name: "\u90CA\u5916" };
      const zn = (z.name || "").replace(/周辺$/, "");
      counter[b.zone] = (counter[b.zone] || 0) + 1;
      b.addr = `${zn}${1 + counter[b.zone] % 9}\u4E01\u76EE${1 + counter[b.zone] * 7 % 27}-${1 + counter[b.zone] * 3 % 12}`;
      if (b.name) continue;
      const bt = BTYPES[b.type];
      const pfx = rng.pick(SHOP_PREFIX);
      switch (b.type) {
        case "apt":
          b.name = rng.pick(APT_NAMES) + rng.pick(APT_FLOWER);
          break;
        case "tower":
          b.name = rng.pick(["\u6F6E\u898B", "\u9752\u6D77", "\u6771\u90FD", "\u6E2F\u5357"]) + rng.pick(["\u30B9\u30AB\u30A4\u30EC\u30B8\u30C7\u30F3\u30B9", "\u30BF\u30EF\u30FC\u30EC\u30B8\u30C7\u30F3\u30B9", "\u30B0\u30E9\u30F3\u30C9\u30BF\u30EF\u30FC"]);
          break;
        case "house":
        case "farmhouse":
        case "villa":
          b.name = bt.label;
          break;
        case "cityhall":
          b.name = "\u9752\u6D77\u5E02\u5F79\u6240";
          break;
        case "hospital":
          b.name = "\u9752\u6D77\u4E2D\u592E\u7DCF\u5408\u75C5\u9662";
          break;
        case "police":
          b.name = "\u9752\u6D77\u8B66\u5BDF\u7F72";
          break;
        case "fire":
          b.name = "\u9752\u6D77\u6D88\u9632\u7F72";
          break;
        case "court":
          b.name = "\u9752\u6D77\u5730\u65B9\u88C1\u5224\u6240";
          break;
        case "library":
          b.name = "\u9752\u6D77\u5E02\u7ACB\u56F3\u66F8\u9928";
          break;
        case "museum":
          b.name = "\u9752\u6D77\u5E02\u7ACB\u535A\u7269\u9928";
          break;
        case "tourtower":
          b.name = "\u6771\u90FD\u30BF\u30EF\u30FC";
          break;
        case "media":
          b.name = "\u9752\u6D77\u30E1\u30C7\u30A3\u30A2\u30BB\u30F3\u30BF\u30FC";
          break;
        case "hotel":
          b.name = rng.pick(["\u6771\u90FD\u30B0\u30E9\u30F3\u30C9\u30DB\u30C6\u30EB", "\u30DB\u30C6\u30EB\u9752\u6D77", "\u30B7\u30C6\u30A3\u30DB\u30C6\u30EB" + zn]);
          break;
        case "bizhotel":
          b.name = rng.pick(["\u30D3\u30B8\u30CD\u30B9\u30A4\u30F3", "\u30B9\u30C6\u30A4"]) + zn;
          break;
        case "resorthotel":
          b.name = rng.pick(["\u81E8\u6D77\u30EA\u30BE\u30FC\u30C8\u30DB\u30C6\u30EB", "\u30DE\u30EA\u30F3\u30C6\u30E9\u30B9", "\u30D6\u30EB\u30FC\u30B3\u30FC\u30B9\u30C8"]) + "";
          break;
        case "ryokan":
          b.name = rng.pick(["\u6708\u898B\u306E\u5BBF", "\u6E6F\u3051\u3080\u308A\u8358", "\u5C71\u5439\u306E\u6E6F", "\u96EB\u5EB5"]);
          break;
        case "beachhouse":
          b.name = "\u6D77\u306E\u5BB6" + rng.pick(["\u306A\u304E\u3055\u4EAD", "\u3055\u3056\u306A\u307F", "\u306F\u307E\u304B\u305C"]);
          break;
        case "univ":
          b.name = ["\u9752\u6D77\u5927\u5B66", "\u5B66\u5712\u90FD\u5E02\u5DE5\u79D1\u5927\u5B66", "\u9752\u6D77\u82B8\u8853\u5927\u5B66"][(counter.__u = (counter.__u || 0) + 1) - 1 % 3] || "\u9752\u6D77\u7B2C\u4E8C\u5927\u5B66";
          break;
        case "hs":
          b.name = "\u9752\u6D77" + ["\u7B2C\u4E00", "\u685C\u30F6\u4E18", "\u6E2F\u5357", "\u307F\u306E\u308A", "\u4E2D\u592E", "\u6F6E\u898B"][((counter.__h = (counter.__h || 0) + 1) - 1) % 6] + "\u9AD8\u7B49\u5B66\u6821";
          break;
        case "jh":
          b.name = zn + "\u4E2D\u5B66\u6821";
          break;
        case "elem":
          b.name = zn + "\u5C0F\u5B66\u6821";
          break;
        case "kinder":
          b.name = zn + rng.pick(["\u3053\u3069\u3082\u5712", "\u4FDD\u80B2\u5712", "\u5E7C\u7A1A\u5712"]);
          break;
        case "special":
          b.name = "\u9752\u6D77\u7279\u5225\u652F\u63F4\u5B66\u6821";
          break;
        case "shrine":
          b.name = zn + rng.pick(["\u795E\u793E", "\u516B\u5E61\u5BAE", "\u7A32\u8377\u795E\u793E"]);
          break;
        case "temple":
          b.name = zn + rng.pick(["\u5BFA", "\u5C71\u5149\u5BFA", "\u5186\u798F\u5BFA"]);
          break;
        case "station":
          break;
        case "cardealer":
          b.name = rng.pick(["\u30CF\u30EB\u30AB\u30BC\u81EA\u52D5\u8ECA", "\u30DB\u30B7\u30BE\u30E9\u30E2\u30FC\u30BF\u30FC\u30BA", "\u30DF\u30CA\u30C8\u5DE5\u6A5F", "\u30B5\u30AF\u30E9\u30AE\u81EA\u5DE5", "\u30CA\u30AE\u88FD\u4F5C\u6240"]) + " " + zn + "\u5E97";
          break;
        case "usedcar":
          b.name = zn + rng.pick(["\u30AA\u30FC\u30C8", "\u30AB\u30FC\u30BB\u30F3\u30BF\u30FC", "\u30E2\u30FC\u30BF\u30FC\u30B9", "\u30AC\u30EC\u30FC\u30B8"]);
          break;
        default:
          b.name = pfx + bt.label;
      }
    }
    const seen = {};
    for (const b of buildings) {
      seen[b.name] = (seen[b.name] || 0) + 1;
      if (seen[b.name] > 1 && !["house", "farmhouse", "villa"].includes(b.type)) b.name += (seen[b.name] === 2 ? "" : "") + (seen[b.name] > 1 ? "\u7B2C" + seen[b.name] : "");
    }
  }

