  // src/nav.js
  var pedCache = /* @__PURE__ */ new WeakMap();
  var footC = /* @__PURE__ */ new WeakMap();
  function footLinks(map2) {
    let r = footC.get(map2);
    if (r) return r;
    const W2 = map2.W, H4 = map2.H;
    r = /* @__PURE__ */ new Map();
    const ok = (x, y) => x >= 0 && y >= 0 && x < W2 && y < H4 && !map2.solid[x + y * W2] && map2.ground[x + y * W2] !== T.RAIL && map2.ground[x + y * W2] !== T.WATER;
    for (const fb of footbridgesOf(map2)) {
      let a = null, b = null;
      for (const dy of [1, 2, 3]) if (!a && ok(fb.x, fb.ry - dy)) a = [fb.x, fb.ry - dy];
      for (const dy of [2, 3, 4]) if (!b && ok(fb.x, fb.ry + dy)) b = [fb.x, fb.ry + dy];
      if (!a || !b) continue;
      const cost = (b[1] - a[1]) * 1.1 + 4;
      r.set(a[0] + a[1] * W2, { to: b[0] + b[1] * W2, cost });
      r.set(b[0] + b[1] * W2, { to: a[0] + a[1] * W2, cost });
    }
    footC.set(map2, r);
    return r;
  }
  function pedExtra(map2) {
    if ((map2.ver || 1) < 2) return null;
    let a = pedCache.get(map2);
    if (a) return a;
    const ri = roadInfo(map2), cl = junctions(map2);
    a = new Float32Array(map2.W * map2.H);
    for (let k = 0; k < a.length; k++) {
      if (!ri.drv[k] || map2.ground[k] !== T.ROAD) continue;
      const ax = ri.axis[k];
      if (ax === AX.J) a[k] = 1.5;
      else if (ri.thick[k] >= 2 && !cl.cwk[k]) a[k] = 3 + ri.thick[k];
    }
    pedCache.set(map2, a);
    return a;
  }
  var Heap = class {
    constructor() {
      this.a = [];
    }
    push(k, v) {
      const a = this.a;
      a.push([k, v]);
      let i = a.length - 1;
      while (i > 0) {
        const p = i - 1 >> 1;
        if (a[p][0] <= a[i][0]) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    pop() {
      const a = this.a;
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (; ; ) {
          let l = 2 * i + 1, r = l + 1, m = i;
          if (l < a.length && a[l][0] < a[m][0]) m = l;
          if (r < a.length && a[r][0] < a[m][0]) m = r;
          if (m === i) break;
          [a[m], a[i]] = [a[i], a[m]];
          i = m;
        }
      }
      return top;
    }
    get size() {
      return this.a.length;
    }
  };
  var MODE2 = { WALK: 0, WHEEL: 1, CANE: 2 };
  function tileCost(g, mode2) {
    switch (g) {
      case T.ROAD:
      case T.PLAZA:
      case T.BRIDGE:
      case T.PLATFORM:
      case T.QUAY:
        return 1;
      case T.CROSSING:
        return mode2 === MODE2.CANE ? 1.2 : 1.1;
      case T.PATH:
        return mode2 === MODE2.WHEEL ? 1.6 : 1.05;
      case T.GRASS:
        return mode2 === MODE2.WHEEL ? 3 : mode2 === MODE2.CANE ? 1.8 : 1.4;
      case T.SAND:
        return mode2 === MODE2.WHEEL ? Infinity : 2.2;
      case T.FARM:
      case T.PADDY:
        return mode2 === MODE2.WHEEL ? Infinity : 2;
      default:
        return 1.5;
    }
  }
  var NAVBUF = { n: 0 };
  function navBuf(n2) {
    if (NAVBUF.n !== n2) {
      NAVBUF.n = n2;
      NAVBUF.g = new Float32Array(n2);
      NAVBUF.prev = new Int32Array(n2);
      NAVBUF.mark = new Uint32Array(n2);
      NAVBUF.closed = new Uint32Array(n2);
      NAVBUF.cur = 0;
    }
    NAVBUF.cur++;
    return NAVBUF;
  }
  function findPath(map2, sx, sy, tx, ty, mode2 = MODE2.WALK, maxNodes = 12e4, useFoot = false) {
    if (maxNodes === 12e4 && map2.W * map2.H > 1e5) maxNodes = 12e5;
    const { W: W2, H: H4, solid, ground } = map2;
    sx |= 0;
    sy |= 0;
    tx |= 0;
    ty |= 0;
    if (sx === tx && sy === ty) return [[sx, sy]];
    const px2 = pedExtra(map2);
    const FL = useFoot ? footLinks(map2) : null;
    const B2 = navBuf(W2 * H4), cur2 = B2.cur, G4 = B2.g, prev = B2.prev, mark2 = B2.mark, closed = B2.closed;
    const gv = (k) => mark2[k] === cur2 ? G4[k] : Infinity;
    const heap = new Heap();
    const sk2 = sx + sy * W2;
    mark2[sk2] = cur2;
    G4[sk2] = 0;
    prev[sk2] = -1;
    heap.push(Math.abs(sx - tx) + Math.abs(sy - ty), sk2);
    let nodes = 0;
    while (heap.size) {
      const [fk, k] = heap.pop();
      const x = k % W2, y = k / W2 | 0;
      if (x === tx && y === ty) break;
      if (closed[k] === cur2) continue;
      closed[k] = cur2;
      if (fk > G4[k] + Math.abs(x - tx) + Math.abs(y - ty) + 1e-3) continue;
      if (++nodes > maxNodes) return null;
      if (FL && FL.size) {
        const lk = FL.get(k);
        if (lk && closed[lk.to] !== cur2) {
          const ng = G4[k] + lk.cost;
          if (ng < gv(lk.to)) {
            mark2[lk.to] = cur2;
            G4[lk.to] = ng;
            prev[lk.to] = k;
            const lx = lk.to % W2, ly = lk.to / W2 | 0;
            heap.push(ng + Math.abs(lx - tx) + Math.abs(ly - ty), lk.to);
          }
        }
      }
      for (let d = 0; d < 4; d++) {
        const nx = x + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = y + (d === 2 ? 1 : d === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
        const kk = nx + ny * W2;
        if (solid[kk] && !(nx === tx && ny === ty)) continue;
        let c = tileCost(ground[kk], mode2);
        if (!isFinite(c)) continue;
        if (px2) c += px2[kk];
        const ng = G4[k] + c;
        if (ng < gv(kk)) {
          mark2[kk] = cur2;
          G4[kk] = ng;
          prev[kk] = k;
          heap.push(ng + Math.abs(nx - tx) + Math.abs(ny - ty), kk);
        }
      }
    }
    const tk = tx + ty * W2;
    if (mark2[tk] !== cur2 || prev[tk] < 0) return null;
    const path = [];
    for (let k = tk; k >= 0; k = prev[k]) {
      path.push([k % W2, k / W2 | 0]);
      if (k === sk2) break;
    }
    return path.reverse();
  }
  var DIRN = { "1,0": "\u6771", "-1,0": "\u897F", "0,1": "\u5357", "0,-1": "\u5317" };
  function describeRoute(map2, path, destName) {
    if (!path || path.length < 2) return ["\u3059\u3067\u306B\u76EE\u7684\u5730\u306E\u8FD1\u304F\u306B\u3044\u307E\u3059\u3002"];
    const segs = [];
    let cur2 = null;
    for (let i = 1; i < path.length; i++) {
      const d = [path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]].join(",");
      if (!cur2 || cur2.d !== d) {
        cur2 = { d, n: 0, at: path[i - 1] };
        segs.push(cur2);
      }
      cur2.n++;
    }
    const lm = (x, y) => {
      let best = null, bd = 6;
      const R5 = 6;
      for (let yy = y - R5; yy <= y + R5; yy++) for (let xx = x - R5; xx <= x + R5; xx++) {
        if (xx < 0 || yy < 0 || xx >= map2.W || yy >= map2.H) continue;
        const bi = map2.bid[xx + yy * map2.W];
        if (bi >= 0) {
          const d = Math.abs(xx - x) + Math.abs(yy - y);
          if (d < bd) {
            const b = map2.buildings[bi];
            if (!["house", "farmhouse", "apt", "villa"].includes(b.type)) {
              bd = d;
              best = b;
            }
          }
        }
      }
      return best;
    };
    const out = [];
    let prevDir = null;
    segs.forEach((s, i) => {
      const dn = DIRN[s.d];
      let t = i === 0 ? `${dn}\u3078 ${s.n}\u30BF\u30A4\u30EB\u9032\u3080` : `${dn}\u3078\u66F2\u304C\u3063\u3066 ${s.n}\u30BF\u30A4\u30EB\u9032\u3080`;
      const L2 = i < segs.length - 1 ? lm(s.at[0] + (s.d.split(",")[0] | 0) * s.n, s.at[1] + (s.d.split(",")[1] | 0) * s.n) : null;
      if (L2 && s.n > 3) t += `(${L2.name}\u304C\u76EE\u5370)`;
      out.push(t);
    });
    out.push(`${destName}\u306B\u5230\u7740`);
    return out;
  }
  var KANA = (t) => t.replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 96));
  var normQ = (t) => KANA(String(t || "").normalize("NFKC").toLowerCase().replace(/[\s　・ー\-_「」『』()（）]/g, ""));
  var ALIAS = { stadium: ["\u30B9\u30BF\u30B8\u30A2\u30E0", "\u7AF6\u6280\u5834", "\u7403\u5834", "\u91CE\u7403\u5834", "\u30B5\u30C3\u30AB\u30FC\u5834", "\u30C9\u30FC\u30E0", "\u30B9\u30BF\u30B8\u30A2\u30E0"], station: ["\u99C5", "\u3048\u304D", "\u9244\u9053", "\u96FB\u8ECA"], hospital: ["\u75C5\u9662", "\u7DCF\u5408\u75C5\u9662"], clinic: ["\u533B\u9662", "\u30AF\u30EA\u30CB\u30C3\u30AF", "\u8A3A\u7642\u6240"], konbini: ["\u30B3\u30F3\u30D3\u30CB", "\u30B3\u30F3\u30D3\u30CB\u30A8\u30F3\u30B9"], cityhall: ["\u5E02\u5F79\u6240", "\u5F79\u6240", "\u5F79\u5834"], ryokan: ["\u65C5\u9928", "\u5BBF"], onsenbath: ["\u6E29\u6CC9", "\u92AD\u6E6F", "\u98A8\u5442", "\u6E6F"], airport: ["\u7A7A\u6E2F", "\u98DB\u884C\u5834"], ferry: ["\u30D5\u30A7\u30EA\u30FC", "\u6E2F", "\u8239"] };
  function buildingMatches(world, q, limit = 30, okOnly = false) {
    const nq = normQ(q);
    if (!nq) return [];
    const B2 = world.map.buildings, out = [], late = [];
    for (const b of B2) {
      const bt = BTYPES[b.type];
      const al = ALIAS[b.type] || [];
      const hay = normQ(`${b.name}${bt.label}${b.addr || ""}${b.type}${al.join("")}`);
      if (!hay.includes(nq)) continue;
      if (b.status === "closed") {
        if (!okOnly) late.push(b);
        continue;
      }
      out.push(b);
      if (out.length >= limit) break;
    }
    return out.concat(late).slice(0, limit);
  }
  function nearestOfType(world, x, y, pred, n2 = 3) {
    const arr = [];
    for (const b of world.map.buildings) {
      if (b.status === "closed" || !pred(b)) continue;
      arr.push([Math.abs(b.doorX - x) + Math.abs(b.doorY - y), b]);
    }
    arr.sort((a, c) => a[0] - c[0]);
    return arr.slice(0, n2).map((a) => ({ d: a[0], b: a[1] }));
  }

