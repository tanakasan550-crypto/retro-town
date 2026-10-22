  // src/hiway.js
  var cache8 = /* @__PURE__ */ new WeakMap();
  var rd = (g) => g === T.ROAD || g === T.CROSSING || g === T.BRIDGE || g === T.PLAZA;
  var DECK_THICK = { exp: 0.8, elev: 0.7, foot: 0.45 };
  var MARGIN = { exp: 0.32, elev: 0.32, foot: 0.27 };
  function bands4(map2) {
    const { W: W2, H: H4, ground } = map2;
    const out = [];
    for (let y = 0; y < H4 - 4; y++) {
      let cur2 = null;
      for (let x = 0; x <= W2; x++) {
        let ok = x < W2;
        if (ok) {
          for (let k = 0; k < 4; k++) if (!rd(ground[x + (y + k) * W2])) {
            ok = false;
            break;
          }
        }
        if (ok) {
          if (!cur2) cur2 = [x, x];
          else cur2[1] = x;
        } else {
          if (cur2 && cur2[1] - cur2[0] >= 36) out.push({ ax: "x", f: y, a: cur2[0], b: cur2[1] });
          cur2 = null;
        }
      }
    }
    for (let x = 0; x < W2 - 4; x++) {
      let cur2 = null;
      for (let y = 0; y <= H4; y++) {
        let ok = y < H4;
        if (ok) {
          for (let k = 0; k < 4; k++) if (!rd(ground[x + k + y * W2])) {
            ok = false;
            break;
          }
        }
        if (ok) {
          if (!cur2) cur2 = [y, y];
          else cur2[1] = y;
        } else {
          if (cur2 && cur2[1] - cur2[0] >= 36) out.push({ ax: "y", f: x, a: cur2[0], b: cur2[1] });
          cur2 = null;
        }
      }
    }
    return out;
  }
  var rectOf = (s) => s.ax === "x" ? [s.a, s.f, s.b + 1, s.f + s.th] : [s.f, s.a, s.f + s.th, s.b + 1];
  var hit = (r, q) => !(r[2] <= q[0] || q[2] <= r[0] || r[3] <= q[1] || q[3] <= r[1]);
  var tileAt = (map2, s, p, q) => s.ax === "x" ? map2.ground[Math.floor(p) + Math.floor(s.f + q) * map2.W] : map2.ground[Math.floor(s.f + q) + Math.floor(p) * map2.W];
  function highwaysOf(map2) {
    let r = cache8.get(map2);
    if (r) return r;
    const segs = [];
    const cand = bands4(map2).sort((p, q) => q.b - q.a - (p.b - p.a));
    const taken = [];
    for (const c of cand) {
      const s = { ...c, th: 4 };
      const rc = rectOf(s);
      if (taken.some((t) => hit(t, rc))) continue;
      if (map2.siteRects && map2.siteRects.some((q) => hit(rc, [q[0], q[1], q[0] + q[2], q[1] + q[3]]))) continue;
      const first = segs.filter((z) => z.kind === "exp" || z.kind === "elev").length;
      s.kind = first === 0 ? "exp" : "elev";
      s.Hh = s.kind === "exp" ? 7.2 : 5.4;
      s.ramp = s.kind === "exp" ? 16 : 12;
      s.veh = true;
      const low = (p) => {
        for (let q = 0; q < 4; q++) {
          const g = tileAt(map2, s, p + 0.5, q + 0.5);
          if (g === T.CROSSING || g === T.BRIDGE) return true;
        }
        return false;
      };
      for (let i = 0; i < 40 && [...Array(s.ramp + 1).keys()].some((k) => low(s.a + k)); i++) s.a++;
      for (let i = 0; i < 40 && [...Array(s.ramp + 1).keys()].some((k) => low(s.b - k)); i++) s.b--;
      if (s.b - s.a < s.ramp * 2 + 8) continue;
      const n2 = first + 1;
      s.id = (s.kind === "exp" ? "EX" : "EL") + n2;
      taken.push(rc);
      s.name = s.kind === "exp" ? "\u90FD\u5E02\u9AD8\u901F1\u53F7 \u9752\u6D77\u7DDA" : `\u9AD8\u67B6\u9053\u8DEF \u7B2C${n2 - 1}\u53F7`;
      s.nameIn = s.kind === "exp" ? "\u9752\u6D77IC" : `\u9AD8\u67B6${n2 - 1}\u5165\u53E3`;
      s.nameOut = s.kind === "exp" ? "\u6F6E\u898BIC" : `\u9AD8\u67B6${n2 - 1}\u51FA\u53E3`;
      segs.push(s);
    }
    try {
      const ri = roadInfo(map2);
      const { W: W2, H: H4 } = map2;
      let best = null;
      const scan3 = (ax) => {
        const L1 = ax === "x" ? H4 : W2, L2 = ax === "x" ? W2 : H4;
        for (let f2 = 0; f2 < L1; f2++) {
          let i = 0;
          while (i < L2) {
            const x = ax === "x" ? i : f2, y = ax === "x" ? f2 : i;
            const k = x + y * W2;
            if (ri.axis[k] === (ax === "x" ? AX.H : AX.V) && ri.thick[k] === 2 && ri.lane[k] === 0) {
              let j = i;
              while (j + 1 < L2) {
                const k2 = ax === "x" ? j + 1 + f2 * W2 : f2 + (j + 1) * W2;
                if (ri.axis[k2] === (ax === "x" ? AX.H : AX.V) && ri.thick[k2] === 2 && ri.lane[k2] === 0) j++;
                else break;
              }
              if (j - i >= 22) {
                let fo = 0, tot = 0;
                for (let p = i; p <= j; p++) for (const d of [-2, -1, 2, 3]) {
                  const xx = ax === "x" ? p : f2 + d, yy = ax === "x" ? f2 + d : p;
                  if (xx < 0 || yy < 0 || xx >= W2 || yy >= H4) continue;
                  tot++;
                  const g = map2.ground[xx + yy * W2];
                  if (g === T.FOREST || g === T.ROCK) fo++;
                }
                const sc = tot ? fo / tot : 0;
                if (!best || sc > best.sc) best = { ax, f: f2, a: i, b: j, sc };
              }
              i = j + 1;
            } else i++;
          }
        }
      };
      scan3("x");
      scan3("y");
      if (best) {
        const len = Math.min(20, best.b - best.a - 8);
        const a = best.a + Math.floor((best.b - best.a - len) / 2);
        segs.push({ id: "TN1", kind: "tun", name: "\u9752\u6D77\u30C8\u30F3\u30CD\u30EB", ax: best.ax, f: best.f, th: 2, a, b: a + len - 1, Hh: 4.6, ramp: 0, veh: true });
      }
    } catch {
    }
    for (const fb of footbridgesOf(map2)) segs.push({ id: "FB-" + fb.st, kind: "foot", name: "\u6B69\u9053\u6A4B", ax: "y", f: fb.x, th: 1, a: fb.v0, b: fb.v1 - 1, Hh: 5.4, ramp: 1, veh: false, ry: fb.ry });
    const byId = {};
    for (const s of segs) byId[s.id] = s;
    r = { segs, byId };
    cache8.set(map2, r);
    return r;
  }
  var coords = (s, x, y) => s.ax === "x" ? { p: x, q: y - s.f } : { p: y, q: x - s.f };
  var worldOf = (s, p, q) => s.ax === "x" ? [p, s.f + q] : [s.f + q, p];
  function zAt(s, p) {
    if (s.kind === "tun") return 0;
    if (p <= s.a || p >= s.b + 1) return 0;
    const d = Math.min(p - s.a, s.b + 1 - p);
    return s.Hh * Math.max(0, Math.min(1, d / Math.max(1e-4, s.ramp)));
  }
  function entryLane(s, end) {
    if (s.th === 1) return [0, 1];
    const lo = [0, 1], hi2 = [s.th - 1, s.th];
    return end === "a" === (s.ax === "x") ? lo : hi2;
  }
  function nearSegs(map2, x, y, r = 40) {
    return highwaysOf(map2).segs.filter((s) => {
      const [x0, y0, x1, y1] = rectOf(s);
      return x > x0 - r && x < x1 + r && y > y0 - r && y < y1 + r;
    });
  }
  function stepLevel(g, L2, ix, iy, sp, ride) {
    const map2 = g.world.map;
    const hw = highwaysOf(map2);
    if (L2.lv) {
      const s = hw.byId[L2.lv];
      if (!s || s.veh && ride !== "car" || !s.veh && ride === "car") {
        L2.lv = null;
        L2.z = 0;
        return null;
      }
      const m = MARGIN[s.kind] || 0.3;
      const ok = (x, y) => {
        const { p: p2, q } = coords(s, x, y);
        return q >= m && q <= s.th - m && p2 >= s.a - 0.02 && p2 <= s.b + 1.02;
      };
      let moved = false;
      const nx = L2.x + ix * sp, ny = L2.y + iy * sp;
      if (ok(nx, L2.y)) {
        L2.x = nx;
        moved = true;
      }
      if (ok(L2.x, ny)) {
        L2.y = ny;
        moved = true;
      }
      const { p } = coords(s, L2.x, L2.y);
      L2.z = zAt(s, p);
      if (p < s.a + 0.2 || p > s.b + 0.8) {
        if (s.kind === "foot" && s.ax === "y" && p < s.a + 0.2) L2.y = Math.max(L2.y, s.a + 0.3);
        L2.lv = null;
        L2.z = 0;
      }
      return { handled: true, moved };
    }
    return null;
  }
  function tryBoard(g, L2, ix, iy, ride) {
    const map2 = g.world.map;
    const hw = highwaysOf(map2);
    if (!hw.segs.length || L2.lv) return false;
    for (const s of nearSegs(map2, L2.x, L2.y, 2)) {
      if (s.kind === "tun") continue;
      if (s.veh ? ride !== "car" : ride === "car") continue;
      const { p, q } = coords(s, L2.x, L2.y);
      const dp = s.ax === "x" ? ix : iy;
      const lane = (e) => entryLane(s, e);
      const ma = MARGIN[s.kind] || 0.3;
      const la = lane("a"), lb = lane("b");
      if (p >= s.a + 0.35 && p <= s.a + 1 && dp > 0.2 && q >= la[0] + (s.th === 1 ? ma : 0.1) && q <= la[1] - (s.th === 1 ? ma : 0.1)) {
        L2.lv = s.id;
        L2.z = zAt(s, p);
        return true;
      }
      if (p <= s.b + 0.65 && p >= s.b + 0 && dp < -0.2 && q >= lb[0] + (s.th === 1 ? ma : 0.1) && q <= lb[1] - (s.th === 1 ? ma : 0.1)) {
        L2.lv = s.id;
        L2.z = zAt(s, p);
        return true;
      }
    }
    return false;
  }
  function deckCars(s, t, year) {
    if (!s.veh || s.kind === "tun") return [];
    const out = [];
    const len = s.b + 1 - s.a;
    const lanes = s.th === 4 ? s.ax === "x" ? [[0.5, 1], [1.5, 1], [2.5, -1], [3.5, -1]] : [[2.5, 1], [3.5, 1], [0.5, -1], [1.5, -1]] : [];
    const v = s.kind === "exp" ? 6.2 : 4.4;
    const gap = s.kind === "exp" ? 11 : 9;
    const era = year < 2e3 ? 0 : year < 2015 ? 1 : 2;
    const types = ["sedan", "compact", "kei", "sedan", "minivan", "suv", "delivery", "bigtruck", "sedan", "compact"];
    let li = 0;
    for (const [q, dir] of lanes) {
      li++;
      const n2 = Math.floor(len / gap);
      for (let i = 0; i < n2; i++) {
        const hh = (s.a * 31 + li * 977 + i * 131 >>> 0) % 997;
        const sp = v * (0.85 + hh % 7 * 0.04);
        const span = n2 * gap;
        let pos = (i * gap + hh % 5 + t * sp) % span;
        if (pos < 0) pos += span;
        const p = dir > 0 ? s.a + pos : s.b + 1 - pos;
        const z = zAt(s, p);
        if (z < 0.7) continue;
        const ty = types[hh % types.length];
        const [x, y] = worldOf(s, p, q);
        const d = s.ax === "x" ? dir > 0 ? 0 : 2 : dir > 0 ? 1 : 3;
        out.push({ x, y, d, z, ty, col: hh % 9, p, era });
      }
    }
    return out;
  }
  function syncLevel(g) {
    const L2 = g.S.loc;
    if (!L2 || !L2.lv) {
      if (L2 && L2.z) L2.z = 0;
      return;
    }
    const hw = highwaysOf(g.world.map);
    const s = hw.byId[L2.lv];
    if (L2.k !== "out" || !s) {
      L2.lv = null;
      L2.z = 0;
      return;
    }
    const { p, q } = coords(s, L2.x, L2.y);
    if (p < s.a - 0.1 || p > s.b + 1.1 || q < -0.05 || q > s.th + 0.05) {
      L2.lv = null;
      L2.z = 0;
      return;
    }
    L2.z = zAt(s, p);
  }
  var carLinkC = /* @__PURE__ */ new WeakMap();
  function carLinks(map2) {
    let r = carLinkC.get(map2);
    if (r) return r;
    r = /* @__PURE__ */ new Map();
    const ri = roadInfo(map2), W2 = map2.W;
    for (const s of highwaysOf(map2).segs) {
      if (!s.veh || s.kind === "tun" || s.kind === "foot") continue;
      for (const end of ["a", "b"]) {
        const d = s.ax === "x" ? end === "a" ? 0 : 2 : end === "a" ? 1 : 3;
        const lane = entryLane(s, end);
        const q = lane[0];
        const [p02, p1] = end === "a" ? [s.a, s.b] : [s.b, s.a];
        const step2 = end === "a" ? 1 : -1;
        const tiles = [];
        for (let p = p02; p !== p1 + step2; p += step2) tiles.push(worldOf(s, p, q));
        const t0 = tiles[0], t1 = tiles[tiles.length - 1];
        const k0 = t0[0] + t0[1] * W2, k1 = t1[0] + t1[1] * W2;
        const ok = (k) => {
          const m = laneDirs(ri, k);
          return !!m && (m >> d & 1) === 1 && map2.ground[k] === T.ROAD;
        };
        if (!ok(k0) || !ok(k1)) continue;
        r.set(k0 * 4 + d, { to: k1 * 4 + d, cost: tiles.length * 0.6, tiles, seg: s.id });
      }
    }
    carLinkC.set(map2, r);
    return r;
  }

