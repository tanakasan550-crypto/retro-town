  // src/isorender.js
  var DECO_K = { tree: 1.5, lamp: 1.5, vending: 0.95, bench: 0.8, flower: 0.8, post: 1, fence: 0.9, crop: 0.8 };
  var clamp2 = (v, a, b) => Math.max(a, Math.min(b, v));
  function initIso(R5) {
    R5.iso = !/[?&]top=1/.test(location.search);
    R5.P = new Proj();
    R5.gc = new GroundCache(R5.A);
    R5.bc = new BldCache();
    R5.vsp = /* @__PURE__ */ new Map();
    R5.cst = /* @__PURE__ */ new Map();
    R5.glowC = /* @__PURE__ */ new Map();
    R5.treeC = /* @__PURE__ */ new Map();
    R5.lightCv = document.createElement("canvas");
    R5.lastHero = { x: 0, y: 0, d: 0 };
  }
  var bidx = /* @__PURE__ */ new WeakMap();
  function bIndex(map2) {
    let m = bidx.get(map2);
    if (m) return m;
    m = /* @__PURE__ */ new Map();
    for (const b of map2.buildings) {
      if (b.parent !== void 0) continue;
      for (let cy = Math.floor(b.y / CH); cy <= Math.floor((b.y + b.h - 1) / CH); cy++) for (let cx = Math.floor(b.x / CH); cx <= Math.floor((b.x + b.w - 1) / CH); cx++) {
        const k = cx + cy * 4096;
        let a = m.get(k);
        if (!a) m.set(k, a = []);
        a.push(b);
      }
    }
    bidx.set(map2, m);
    return m;
  }
  function chunkStatics(R5, map2, cx, cy) {
    const k = cx + cy * 4096;
    let a = R5.cst.get(k);
    if (a) return a;
    a = [];
    const PR = R5.A.props ? buildProps(map2) : null;
    const W2 = map2.W;
    for (let y = cy * CH; y < (cy + 1) * CH; y++) for (let x = cx * CH; x < (cx + 1) * CH; x++) {
      if (x < 0 || y < 0 || x >= W2 || y >= map2.H) continue;
      const i = x + y * W2;
      const d = map2.deco[i];
      if (d && d !== D.BUILDING) {
        const nm = d === D.TREE ? "tree" : d === D.VENDING ? "vending" : d === D.BENCH ? "bench" : d === D.FLOWER ? "flower" : d === D.POST ? "post" : d === D.LAMP ? "lamp" : d === D.FENCE ? map2.estWall && map2.estWall.has(i) ? "estwall" : "fence" : d === D.CROP ? "crop" : null;
        if (nm) a.push({ t: "d", x, y, nm });
      }
      if (PR) {
        const q = PR.get(i);
        if (q) a.push({ t: "p", x, y, k: q.k });
      }
    }
    if (R5.cst.size > 400) R5.cst.clear();
    R5.cst.set(k, a);
    return a;
  }
  function glowSprite(R5, col) {
    let c = R5.glowC.get(col);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, col);
    g.addColorStop(0.35, col.replace(/[\d.]+\)$/, "0.35)"));
    g.addColorStop(1, col.replace(/[\d.]+\)$/, "0)"));
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    R5.glowC.set(col, c);
    return c;
  }
  var glow = (R5, ctx4, x, y, r, col, sy = 1) => {
    const s = glowSprite(R5, col);
    ctx4.drawImage(s, x - r, y - r * sy, r * 2, r * 2 * sy);
  };
  function litAlpha(b, hour, sp) {
    const k = sp ? sp.kind : "shop";
    const t = hour;
    if (["conv", "gas", "station", "hosp", "hotel", "civic", "tourtower", "ryokan"].includes(k)) return 1;
    if (k === "res" || k === "apt" || k === "tower") return t >= 17 || t < 1 ? 1 : t < 2 ? 0.5 : t < 5 ? 0.12 : t < 6.5 ? 0.6 : 0.3;
    if (k === "game" || k === "cinema" || b.type === "izakaya") return t >= 17 || t < 2 ? 1 : 0.08;
    if (k === "eat") return t >= 17 && t < 23 || t < 0.5 ? 1 : 0.12;
    if (k === "office" || k === "bank" || k === "school" || k === "hall" || k === "care" || k === "kinder") return t >= 17 && t < 22 ? 0.9 : 0.18;
    return t >= 17 && t < 21.5 ? 1 : 0.15;
  }
  function drawOutdoorIso(R5, dtSec, hero, extras = {}) {
    beginFrame(8);
    R5.time += dtSec;
    syncLevel(R5.g);
    const ctx4 = R5.ctx, g = R5.g, map2 = g.world.map, S2 = R5.S, W2 = R5.cv.width, H4 = R5.cv.height;
    const Z = S2 * ISO_ZK;
    const P2 = R5.P;
    const year = g.year();
    const hour = g.S.min / 60;
    const Rr = Z;
    ctx4.setTransform(1, 0, 0, 1, 0, 0);
    ctx4.imageSmoothingEnabled = true;
    ctx4.imageSmoothingQuality = "low";
    ctx4.fillStyle = "#5f9a47";
    ctx4.fillRect(0, 0, W2, H4);
    const cu = clamp2(hero.x, 2, map2.W - 2), cv2 = clamp2(hero.y, 2, map2.H - 2);
    {
      const tz = g.S.loc && g.S.loc.lv ? g.S.loc.z || 0 : 0;
      R5._cz = R5._cz === void 0 ? tz : R5._cz + (tz - R5._cz) * Math.min(1, dtSec * 7);
      P2.set(Z, cu, cv2, W2 / 2, H4 * 0.55 + R5._cz * 12 * Z * 0.85);
    }
    R5.cam.x = cu * 16 - W2 / S2 / 2;
    R5.cam.y = cv2 * 16 - H4 / S2 / 2;
    const padB = 26 * 12 * Z;
    const cs = [[0, 0], [W2, 0], [0, H4 + padB], [W2, H4 + padB]];
    let umin = 1e9, umax = -1e9, vmin = 1e9, vmax = -1e9;
    for (const [sx, sy] of cs) {
      const u = P2.U(sx, sy), v = P2.V(sx, sy);
      umin = Math.min(umin, u);
      umax = Math.max(umax, u);
      vmin = Math.min(vmin, v);
      vmax = Math.max(vmax, v);
    }
    const _t = [performance.now()];
    const wf = Math.floor(R5.time * 1.6) & 1;
    const c0x = Math.max(0, Math.floor(umin / CH)), c1x = Math.min(Math.floor((map2.W - 1) / CH), Math.floor(umax / CH)), c0y = Math.max(0, Math.floor(vmin / CH)), c1y = Math.min(Math.floor((map2.H - 1) / CH), Math.floor(vmax / CH));
    let budget = R5.gc.c.size < 8 ? 999 : 6;
    const visChunks = [];
    for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) {
      const u0 = cx * CH, v0 = cy * CH, u1 = u0 + CH, v1 = v0 + CH;
      const xs = [P2.X(u0, v0), P2.X(u1, v0), P2.X(u1, v1), P2.X(u0, v1)], ys = [P2.Y(u0, v0), P2.Y(u1, v0), P2.Y(u1, v1), P2.Y(u0, v1)];
      if (Math.max(...xs) < 0 || Math.min(...xs) > W2 || Math.max(...ys) < 0 || Math.min(...ys) > H4 + 60) continue;
      visChunks.push([cx, cy]);
      let img = R5.gc.get(map2, cx, cy, wf, budget > 0, Z);
      if (img && R5.gc.built !== R5._gb) {
        budget--;
        R5._gb = R5.gc.built;
      }
      if (img) R5.gc.draw(ctx4, img, cx, cy, P2);
      else {
        R5.lifePending = true;
        ctx4.fillStyle = "#6aa84f";
        ctx4.beginPath();
        ctx4.moveTo(xs[0], ys[0]);
        ctx4.lineTo(xs[1], ys[1]);
        ctx4.lineTo(xs[2], ys[2]);
        ctx4.lineTo(xs[3], ys[3]);
        ctx4.fill();
      }
    }
    ctx4.imageSmoothingQuality = "medium";
    if (map2.lots) drawLots(ctx4, P2, Z, map2.lots, hero);
    if (map2.estates && map2.estates.length) drawEstateGround(ctx4, P2, Z, map2.estates, hero, R5.time || 0);
    for (const hb of map2.hubs || []) if (hb.kind === "airport" && hb.runway) {
      const hr0 = g.S.min / 60;
      drawAirfield(ctx4, P2, Z, hb.runway, hero, hr0 < 5.5 || hr0 >= 18.2);
    }
    const arcs = arcadesOf(map2), mo0 = g.month0();
    const arcInfo = arcs.map((A2) => ({ A: A2, kind: arcadeKind(A2, year), st: null }));
    for (const q of arcInfo) {
      q.st = arcadeStyle(q.A, q.kind, mo0);
      drawArcadeGround(ctx4, q.A, P2, Z, q.kind, q.st, W2, H4);
    }
    _t.push(performance.now());
    const items = [];
    const k = Z / Rr;
    const hz = 12 * Z;
    const hzo = g.S.loc && g.S.loc.lv ? g.S.loc.z || 0 : 0;
    const hbx = P2.X(hero.x, hero.y), hby = P2.Y(hero.x, hero.y, hzo);
    const heroBox = { sx0: hbx - 9 * Z, sx1: hbx + 9 * Z, sy0: hby - 26 * Z, sy1: hby + 3 * Z };
    let cap2 = null;
    const push = (x0, y0, x1, y1, sx0, sx1, sy0, sy1, draw2, lt, extra) => {
      if (cap2) {
        const it2 = { x0, y0, x1, y1, sx0, sx1, sy0, sy1, draw: draw2, lt, ...extra };
        cap2.push(it2);
        return it2;
      }
      if (sx1 < 0 || sx0 > W2 || sy1 < 0 || sy0 > H4) return null;
      const it = { x0, y0, x1, y1, sx0, sx1, sy0, sy1, draw: draw2, lt, ...extra };
      items.push(it);
      return it;
    };
    const BI = bIndex(map2);
    const seenB = /* @__PURE__ */ new Set();
    let bBudget = 4;
    const bc0x = Math.max(0, c0x - 1), bc1x = c1x + 1, bc0y = Math.max(0, c0y - 1), bc1y = c1y + 1;
    for (let cy = bc0y; cy <= bc1y; cy++) for (let cx = bc0x; cx <= bc1x; cx++) {
      const a = BI.get(cx + cy * 4096);
      if (!a) continue;
      for (const b of a) {
        if (seenB.has(b.idx)) continue;
        seenB.add(b.idx);
        const sp0 = bldSpec(b, map2, year);
        const hm2 = bldHeight(sp0, b) + 6;
        const bx0 = P2.X(b.x, b.y + b.h), bx1 = P2.X(b.x + b.w, b.y), by0 = P2.Y(b.x, b.y, hm2 + 3), by1 = P2.Y(b.x + b.w, b.y + b.h, 0);
        const sx0 = P2.X(b.x, b.y + b.h) - 24 * Z, sx1 = P2.X(b.x + b.w, b.y) + 24 * Z;
        void bx0;
        void bx1;
        if (sx1 < 0 || sx0 > W2 || by1 < 0 || by0 > H4) continue;
        const it = push(b.x, b.y, b.x + b.w, b.y + b.h, sx0, sx1, by0, by1, null, null, { isB: true, b });
        if (!it) continue;
        it.draw = (c) => {
          const key = R5.bc.key(b, Rr, year);
          let e = R5.bc.m.get(key);
          if (!e) {
            if (bBudget <= 0) {
              fallbackBox(c, P2, b, sp0, hm2 - 6);
              R5.lifePending = true;
              return;
            }
            bBudget--;
            e = R5.bc.get(b, map2, Rr, year);
          } else e.t = ++R5.bc.stamp;
          c.drawImage(e.cv, P2.X(b.x, b.y) - e.ax * k, P2.Y(b.x, b.y) - e.ay * k, e.cw * k, e.ch * k);
        };
        it.lt = (c) => {
          const e = R5.bc.m.get(R5.bc.key(b, Rr, year));
          if (!e) return;
          const lc = R5.bc.lit(e);
          const a2 = litAlpha(b, hour, e.sp);
          c.globalAlpha = a2;
          c.drawImage(lc, P2.X(b.x, b.y) - e.ax * k, P2.Y(b.x, b.y) - e.ay * k, e.cw * k, e.ch * k);
          c.globalAlpha = 1;
        };
      }
    }
    const DI = R5.A.decoIdx;
    const sigOn = {};
    for (const [cx, cy] of visChunks) for (const s of chunkStatics(R5, map2, cx, cy)) {
      const X = P2.X(s.x + 0.5, s.y + 0.5), Y2 = P2.Y(s.x + 0.5, s.y + 0.5);
      if (s.t === "d" && s.nm === "estwall") {
        const sx0 = P2.X(s.x, s.y + 1) - 2 * Z, sx1 = P2.X(s.x + 1, s.y) + 2 * Z, sy0 = P2.Y(s.x, s.y, 3.4) - 2 * Z, sy1 = P2.Y(s.x + 1, s.y + 1, 0) + 2 * Z;
        const k6 = (s.x * 3 + s.y * 5) % 7 === 0;
        push(s.x, s.y, s.x + 1, s.y + 1, sx0, sx1, sy0, sy1, (c) => drawWallTile(c, P2, Z, s.x, s.y, k6), null);
        continue;
      }
      if (s.t === "d" && s.nm === "tree") {
        const ts = treeSprite2(R5, R5.season(), s.x * 7 + s.y * 13 >>> 0, Z, R5.weather() === "snow");
        const w = ts.cv.width, h = ts.cv.height;
        const tx = Math.round(X - ts.ax), ty = Math.round(Y2 - ts.ay + 1.2 * Z);
        push(s.x + 0.3, s.y + 0.3, s.x + 0.7, s.y + 0.7, tx, tx + w, ty, ty + h, (c) => {
          c.drawImage(ts.cv, tx, ty);
        }, null);
        continue;
      }
      if (s.t === "d") {
        const i = DI[s.nm === "tree" ? "tree" + R5.season() : s.nm];
        if (i === void 0) continue;
        const sc = (DECO_K[s.nm] || 1) * Z;
        const w = 16 * sc, h = 24 * sc;
        push(s.x + 0.35, s.y + 0.35, s.x + 0.65, s.y + 0.65, X - w / 2, X + w / 2, Y2 - h, Y2 + 2, (c) => {
          c.drawImage(R5.A.deco, i * 16, 0, 16, 24, Math.round(X - w / 2), Math.round(Y2 - h + 2 * Z), w, h);
        }, s.nm === "lamp" ? (c) => {
          glow(R5, c, X, Y2 - 4.6 * hz, 4 * Z, "rgba(255,240,180,0.95)");
          glow(R5, c, X, Y2 - 0.2 * hz, 11 * Z, "rgba(255,226,150,0.42)", 0.5);
        } : null);
      } else if (s.k === "busstop") {
        push(s.x + 0.1, s.y + 0.3, s.x + 0.9, s.y + 0.7, X - 14 * Z, X + 14 * Z, Y2 - 40 * Z, Y2 + 2 * Z, (c) => drawBusStop(c, P2, Z, s.x, s.y), (c) => {
          glow(R5, c, P2.X(s.x + 0.5, s.y + 0.5), P2.Y(s.x + 0.5, s.y + 0.5, 2.1), 5 * Z, "rgba(255,235,170,0.8)");
        });
      } else {
        const e = R5.A.props.p[s.k];
        if (!e) continue;
        const kk = R5.A.props.k;
        const w = e[2] / kk * 1.5 * Z, h = e[3] / kk * 1.5 * Z;
        push(s.x + 0.3, s.y + 0.3, s.x + 0.7, s.y + 0.7, X - w / 2, X + w / 2, Y2 - h, Y2 + 2, (c) => {
          c.drawImage(R5.A.props.img, e[0], e[1], e[2], e[3], Math.round(X - w / 2), Math.round(Y2 - h + 2 * Z), w, h);
        }, /vending|lamp|busstop|taxisign|infoboard|lantern|chochin|sign/i.test(s.k) ? (c) => {
          glow(R5, c, X, Y2 - h * 0.55, 4.5 * Z, /vending/.test(s.k) ? "rgba(190,235,255,0.8)" : "rgba(255,230,160,0.75)");
        } : null);
      }
    }
    void sigOn;
    if (map2.ver === 4) {
      const mo = g.month0(), night = hour < 5.5 || hour >= 18.2;
      for (const [cx, cy] of visChunks) for (const s of boardsIn(map2, cx, cy)) {
        const X = P2.X(s.x + 0.5, s.y + 0.5), Y2 = P2.Y(s.x + 0.5, s.y + 0.5);
        if (X < -40 * Z || X > W2 + 40 * Z || Y2 < -10 * Z || Y2 > H4 + 60 * Z) continue;
        push(s.x + 0.3, s.y + 0.3, s.x + 0.7, s.y + 0.7, X - 14 * Z, X + 14 * Z, Y2 - 32 * Z, Y2 + 2 * Z, (c) => {
          drawBoard(c, X, Y2, Z, s, year, mo, map2, R5.time, night);
        }, null);
      }
    }
    for (const hb of map2.hubs || []) {
      if (hb.kind !== "airport" || !hb.runway) continue;
      const rw = hb.runway;
      const ccx = rw.apron.x0 + 46, ccy = rw.apron.y0 + 11;
      if (Math.abs(ccx - hero.x) > 90 || Math.abs(ccy - hero.y) > 60) continue;
      const Pf = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
      const hr = g.S.min / 60, nightP = hr < 5.5 || hr >= 18.2;
      const dayN = Math.floor(g.absMin() / 1440);
      const pushPlane = (cx, cy, hd, lv, z, nt) => {
        const a = hd === "S" ? 1.3 : 10.8, c = hd === "S" ? 10.8 : 1.3;
        const xs = [P2.X(cx - c, cy - a), P2.X(cx + c, cy - a), P2.X(cx - c, cy + a), P2.X(cx + c, cy + a)];
        const ys = [P2.Y(cx - c, cy - a, 0), P2.Y(cx + c, cy + a, 0)];
        push(cx - (hd === "S" ? 0.9 : 9.5), cy - (hd === "S" ? 9.5 : 0.9), cx + (hd === "S" ? 0.9 : 9.5), cy + (hd === "S" ? 9.5 : 0.9), Math.min(...xs) - 3 * Z, Math.max(...xs) + 3 * Z, Math.min(...ys) - 10 * Z - z * 12 * Z, Math.max(...ys) + 4 * Z, (cc) => drawPlane(cc, Pf, Z, cx, cy, hd, lv, { z, night: nt }), null);
      };
      rw.stands.forEach((st3, i) => {
        if (Math.abs(st3.x - hero.x) > 70) return;
        if (hash2(i * 7 + dayN, 4431) % 5 === 0) return;
        pushPlane(st3.x, st3.y, "S", st3.liv, 0, nightP);
        const by = hb.door.y - 10;
        push(st3.x + 1, st3.y + 5.6, st3.x + 2.4, by, P2.X(st3.x + 1, by) - 2 * Z, P2.X(st3.x + 2.4, st3.y + 5.6) + 2 * Z, P2.Y(st3.x + 1, st3.y + 5.6, 4.4) - 2 * Z, P2.Y(st3.x + 2.4, by, 0) + 2 * Z, (cc) => {
          const q = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
          const poly7 = (pts, f2) => {
            cc.beginPath();
            pts.forEach((p, k2) => k2 ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1]));
            cc.closePath();
            cc.fillStyle = f2;
            cc.fill();
          };
          const u0 = st3.x + 1, u1 = st3.x + 2.4, v0 = st3.y + 5.6, v1 = by, z0 = 2.4, z1 = 4.3;
          poly7([q(u0, v1, z0), q(u1, v1, z0), q(u1, v1, z1), q(u0, v1, z1)], "#cfd5da");
          poly7([q(u1, v1, z0), q(u1, v0, z0), q(u1, v0, z1), q(u1, v1, z1)], "#aab2b9");
          poly7([q(u0, v0, z1), q(u1, v0, z1), q(u1, v1, z1), q(u0, v1, z1)], "#e8ecef");
          poly7([q(u0 + 0.1, v1, z0 + 0.5), q(u1 - 0.1, v1, z0 + 0.5), q(u1 - 0.1, v1, z1 - 0.5), q(u0 + 0.1, v1, z1 - 0.5)], "#7fa3b8");
        }, null);
      });
      const cyc = runwayCycle(g.absMin(), 0);
      if (cyc && Math.abs(rw.y0 - hero.y) < 40) {
        const x = rw.x0 + cyc.x * (rw.x1 - rw.x0);
        if (Math.abs(x - hero.x) < 70) pushPlane(x, rw.y0 + 3, "E", 1, cyc.alt, nightP);
      }
    }
    const nearSig = signalSpots(map2);
    for (const s of nearSig) {
      const X = P2.X(s.x, s.y), Y2 = P2.Y(s.x, s.y);
      if (X < -20 || X > W2 + 20 || Y2 < -20 || Y2 > H4 + 80 * Z) continue;
      const st3 = signalAt(s.c, R5.time, s.horiz ? AX.H : AX.V);
      const hy = Y2 - 4.4 * hz, lx = X + (st3 === "G" ? 2.4 : st3 === "Y" ? 0 : -2.4) * Z;
      push(
        s.x - 0.1,
        s.y - 0.1,
        s.x + 0.1,
        s.y + 0.1,
        X - 6 * Z,
        X + 6 * Z,
        Y2 - 5.2 * hz,
        Y2 + 2,
        (c) => {
          c.fillStyle = "#e8c53a";
          c.beginPath();
          c.ellipse(X, Y2 + 0.6 * Z, 3.6 * Z, 1.7 * Z, 0, 0, 7);
          c.fill();
          c.fillStyle = "#b8951f";
          for (let a = -2; a <= 2; a++) for (let b2 = -1; b2 <= 1; b2++) c.fillRect(X + a * 1.2 * Z - 0.2 * Z, Y2 + 0.6 * Z + b2 * 0.8 * Z - 0.15 * Z, 0.4 * Z, 0.3 * Z);
          c.fillStyle = "#5a5d66";
          c.fillRect(X - 0.6 * Z, hy, 1.2 * Z, Y2 - hy);
          c.fillStyle = "#7b7e88";
          c.fillRect(X - 0.2 * Z, hy, 0.35 * Z, Y2 - hy);
          c.fillStyle = "#23252c";
          c.fillRect(X - 3.9 * Z, hy - 1.7 * Z, 7.8 * Z, 3.4 * Z);
          c.fillStyle = "#34363f";
          c.fillRect(X - 3.9 * Z, hy - 1.7 * Z, 7.8 * Z, 0.7 * Z);
          for (const [k2, cc, on2] of [[-2.4, "#ff4b3a", st3 === "R"], [0, "#ffd33a", st3 === "Y"], [2.4, "#3ddc6a", st3 === "G"]]) {
            c.fillStyle = on2 ? cc : "#4a2f2c";
            if (!on2) c.globalAlpha = 0.5;
            c.beginPath();
            c.arc(X + k2 * Z, hy, 0.95 * Z, 0, 7);
            c.fill();
            c.globalAlpha = 1;
          }
          const ps = pedState(s.c, s.horiz, R5.time), py = Y2 - 2.2 * hz, pg = ps === "G" || ps === "F" && (R5.time * 4 | 0) % 2 === 0;
          c.fillStyle = "#23252c";
          c.fillRect(X - 1.5 * Z, py - 1.9 * Z, 3 * Z, 3.8 * Z);
          c.fillStyle = pg ? "#3ddc6a" : "#ff4b3a";
          c.fillRect(X - 1.1 * Z, py - 1.5 * Z, 2.2 * Z, 3 * Z);
          c.fillStyle = "#fff";
          c.fillRect(X - 0.3 * Z, py - 1.2 * Z, 0.6 * Z, 0.6 * Z);
          c.fillRect(X - 0.5 * Z, py - 0.5 * Z, 1 * Z, 1.3 * Z);
        },
        (c) => {
          const col = st3 === "G" ? "rgba(80,255,130,0.9)" : st3 === "Y" ? "rgba(255,220,60,0.9)" : "rgba(255,70,50,0.9)";
          glow(R5, c, lx, hy, 3.4 * Z, col);
        }
      );
    }
    for (const s of nearSig) {
      if (!s.sign || !s.sign.length) continue;
      const X = P2.X(s.x, s.y), Y2 = P2.Y(s.x, s.y);
      if (X < -40 || X > W2 + 40 || Y2 < -20 || Y2 > H4 + 80 * Z) continue;
      const AR = ["\u2198", "\u2199", "\u2196", "\u2197"];
      const seen = /* @__PURE__ */ new Set(), ln = [];
      for (const q of s.sign) {
        if (seen.has(q.name)) continue;
        seen.add(q.name);
        ln.push(`${AR[q.d]} ${q.name}`);
        if (ln.length >= 3) break;
      }
      const bx = X + 7 * Z, by = Y2 - 15 * hz;
      push(s.x + 0.35, s.y - 0.1, s.x + 0.55, s.y + 0.1, bx - 12 * Z, bx + 12 * Z, by - 6 * Z, Y2 + 2, (c) => {
        c.fillStyle = "#5a5d66";
        c.fillRect(bx - 0.5 * Z, by, 1 * Z, Y2 - by);
        c.fillStyle = "#e8e8e8";
        c.fillRect(bx - 11.3 * Z, by - 5.3 * Z, 22.6 * Z, 2.6 * Z + ln.length * 3.2 * Z + 0.7 * Z);
        c.fillStyle = "#1d5fb8";
        c.fillRect(bx - 10.8 * Z, by - 4.8 * Z, 21.6 * Z, 1.6 * Z + ln.length * 3.2 * Z + 0.7 * Z);
        c.fillStyle = "#fff";
        c.font = `bold ${Math.max(5, 2.6 * Z)}px sans-serif`;
        c.textAlign = "left";
        c.textBaseline = "middle";
        ln.forEach((t, i) => c.fillText(t, bx - 9.8 * Z, by - 2.6 * Z + i * 3.2 * Z + 1.2 * Z));
      });
    }
    for (const { A: A2, kind, st: st3 } of arcInfo) {
      const along = A2.ax ? "y" : "x", cross = A2.ax ? "x" : "y";
      void along;
      void cross;
      const box5 = (a0, a1, c0, c1) => A2.ax ? [c0, a0, c1, a1] : [a0, c0, a1, c1];
      const hp = A2.ax ? hero.y : hero.x, hc = A2.ax ? hero.x : hero.y;
      for (let s0 = A2.a0; s0 < A2.a1; s0 += 2) {
        const s1 = Math.min(A2.a1, s0 + 2);
        const first = s0 === A2.a0, last = s1 === A2.a1;
        const bx = box5(s0, s1, A2.c0, A2.c1);
        const corners = [[s0, A2.c0], [s1, A2.c0], [s0, A2.c1], [s1, A2.c1]].map(([a, c]) => A2.ax ? [c, a] : [a, c]);
        const xs = corners.map(([u, v]) => P2.X(u, v)), top = Math.min(...corners.map(([u, v]) => P2.Y(u, v, 6.4))), bot = Math.max(...corners.map(([u, v]) => P2.Y(u, v, 0)));
        const sx0 = Math.min(...xs) - 2 * Z, sx1 = Math.max(...xs) + 2 * Z;
        const inSeg = hp >= s0 - 0.3 && hp <= s1 + 0.3 && hc >= A2.c0 - 0.3 && hc <= A2.c1 + 0.3;
        const it = push(bx[0], bx[1], bx[2], bx[3], sx0, sx1, top, bot, null, null, { isArc: true });
        if (!it) continue;
        it.draw = (c) => {
          const hit2 = heroBox && heroBox.sx0 < it.sx1 && heroBox.sx1 > it.sx0 && heroBox.sy0 < it.sy1 && heroBox.sy1 > it.sy0 && hero.x + hero.y < it.x1 + it.y1 + 0.6;
          drawArcadeSeg(c, A2, P2, Z, kind, st3, s0, s1, inSeg || hit2 ? 0.22 : 1, first, last, year);
        };
        it.lt = (c) => lightArcadeSeg(A2, P2, Z, kind, st3, s0, s1, (x, y, r, col, sy) => glow(R5, c, x, y, r, col, sy || 1));
      }
      if (kind !== "x") for (let a = A2.a0; a < A2.a1; a++) {
        const m3 = (a * 7 + (A2.seed & 15)) % 4;
        if (m3 > 2) continue;
        const side = a + (A2.seed >> 3) & 1 ? 0.16 : 0.84;
        const nm = m3 === 0 ? "vending" : m3 === 1 ? "bench" : "flower";
        const i = R5.A.decoIdx[nm];
        if (i === void 0) continue;
        const cc = (A2.ax ? A2.roadC0 : A2.roadC0) + side * (A2.roadC1 - A2.roadC0), au = a + 0.5;
        const wu = A2.ax ? cc : au, wv = A2.ax ? au : cc;
        const X = P2.X(wu, wv), Y2 = P2.Y(wu, wv);
        const sc = (DECO_K[nm] || 1) * Z, w = 16 * sc, h = 24 * sc;
        push(wu - 0.2, wv - 0.2, wu + 0.2, wv + 0.2, X - w / 2, X + w / 2, Y2 - h, Y2 + 2, (c) => {
          c.drawImage(R5.A.deco, i * 16, 0, 16, 24, Math.round(X - w / 2), Math.round(Y2 - h + 2 * Z), w, h);
        }, nm === "vending" ? (c) => glow(R5, c, X, Y2 - h * 0.5, 4 * Z, "rgba(190,235,255,0.8)") : null);
      }
      for (const end of [0, 1]) {
        const a = end ? A2.a1 - 0.2 : A2.a0 - 0.1;
        const bx = box5(a, a + 0.3, A2.c0, A2.c1);
        const pts = [[a, A2.c0], [a, A2.c1]].map(([aa, c]) => A2.ax ? [c, aa] : [aa, c]);
        const xs = pts.map(([u, v]) => P2.X(u, v));
        const top = Math.min(...pts.map(([u, v]) => P2.Y(u, v, 6.4))), bot = Math.max(...pts.map(([u, v]) => P2.Y(u, v, 0)));
        const it = push(bx[0], bx[1], bx[2], bx[3], Math.min(...xs) - 2 * Z, Math.max(...xs) + 2 * Z, top, bot, null, null, { isArc: true });
        if (!it) continue;
        it.draw = (c) => drawArcadeGate(c, A2, P2, Z, kind, st3, end, 1, year);
        it.lt = (c) => lightArcadeGate(A2, P2, Z, end, (x, y, r, col, sy) => glow(R5, c, x, y, r, col, sy || 1));
      }
    }
    for (const A2 of platformsOf(map2)) {
      if (Math.abs((A2.ax ? (A2.a0 + A2.a1) / 2 : (A2.c0 + A2.c1) / 2) - hero.x) > 40 || Math.abs((A2.ax ? (A2.c0 + A2.c1) / 2 : (A2.a0 + A2.a1) / 2) - hero.y) > 40) continue;
      const hp = A2.ax ? hero.x : hero.y, hc = A2.ax ? hero.y : hero.x;
      for (let s0 = A2.a0; s0 < A2.a1; s0 += 2) {
        const s1 = Math.min(A2.a1, s0 + 2), first = s0 === A2.a0, last = s1 === A2.a1;
        const bx = A2.ax ? [s0, A2.c0, s1, A2.c1] : [A2.c0, s0, A2.c1, s1];
        const cs2 = [[s0, A2.rc0], [s1, A2.rc0], [s0, A2.rc1], [s1, A2.rc1]].map(([a, c]) => A2.ax ? [a, c] : [c, a]);
        const xs = cs2.map(([u, v]) => P2.X(u, v));
        const top = Math.min(...cs2.map(([u, v]) => P2.Y(u, v, 4.2))), bot = Math.max(...cs2.map(([u, v]) => P2.Y(u, v, 0)));
        const inSeg = hp >= s0 - 0.3 && hp <= s1 + 0.3 && hc >= A2.c0 - 0.5 && hc <= A2.c1 + 0.5;
        const it = push(bx[0], bx[1], bx[2], bx[3], Math.min(...xs) - 2 * Z, Math.max(...xs) + 2 * Z, top, bot, null, null, { isArc: true });
        if (!it) continue;
        it.draw = (c) => {
          const hit2 = heroBox.sx0 < it.sx1 && heroBox.sx1 > it.sx0 && heroBox.sy0 < it.sy1 && heroBox.sy1 > it.sy0 && hero.x + hero.y < it.x1 + it.y1 + 0.6;
          drawPlatformSeg(c, A2, P2, Z, s0, s1, inSeg || hit2 ? 0.25 : 0.95, first, last);
        };
        it.lt = (c) => lightPlatformSeg(A2, P2, Z, s0, s1, (x, y, r, col, sy) => glow(R5, c, x, y, r, col, sy || 1));
      }
    }
    R5.npcObs = [];
    const hs = R5.heroMoveDir(hero);
    const veh = (ty, era, colIdx, d) => {
      const key = `${ty}|${era}|${colIdx}|${d}|${Rr}`;
      let s = R5.vsp.get(key);
      if (!s) {
        s = vehicleSprite(ty, era, colIdx, d, Rr, CAR_COLORS);
        R5.vsp.set(key, s);
        if (R5.vsp.size > 500) R5.vsp.clear();
      }
      return s;
    };
    const npcOcc = (w, ci) => {
      if (!rideReady(R5) || w.id === void 0) return null;
      try {
        const look = g.world.pop.look[w.id];
        const occ = [{ seat: "drv", colors: riderColors(R5, w.id, look, g.ageOf(w.id)) }];
        if (hash2(w.id, 7) % 3 === 0 && ci.ty !== "kei") {
          const o2 = g.world.pop.spouse ? g.world.pop.spouse[w.id] : -1;
          if (o2 >= 0 && !g.world.pop.gone[o2]) occ.push({ seat: "pas", colors: riderColors(R5, o2, g.world.pop.look[o2], g.ageOf(o2)) });
        }
        return occ;
      } catch (e) {
        return null;
      }
    };
    const pushVeh = (cx, cy, d, ty, era, colIdx, len, opts = {}) => {
      const s = veh(ty, era, colIdx, d);
      const X = P2.X(cx, cy), Y2 = P2.Y(cx, cy);
      const lt = VEH_DIMS[ty] || VEH_DIMS.sedan;
      const hl = d % 2 === 0 ? len / 2 : lt.W / 4, hw = d % 2 === 0 ? lt.W / 4 : len / 2;
      const sx0 = X - s.ax * k, sy0 = Y2 - s.ay * k;
      const it = push(
        cx - hl,
        cy - hw,
        cx + hl,
        cy + hw,
        sx0,
        sx0 + s.cv.width * k,
        sy0,
        sy0 + s.cv.height * k,
        (c) => {
          c.drawImage(s.cv, sx0, sy0, s.cv.width * k, s.cv.height * k);
          if (opts.occ) drawCarOccupants(R5, c, P2, Z, ty, era, d, cx, cy, opts.occ);
          if (opts.open) drawOpenDoor(c, P2, cx, cy, d, opts.open, Z);
        },
        (c) => {
          for (const l of s.lights) {
            if (l.k === "head" && opts.moving === false && opts.parked) continue;
            const lx = P2.X(cx + l.u, cy + l.v), ly = P2.Y(cx + l.u, cy + l.v, l.z);
            if (l.u === void 0) continue;
            if (l.k === "head") {
              glow(R5, c, lx, ly, 3.2 * Z, "rgba(255,248,200,0.9)");
              if (opts.moving !== false) {
                const fu = cx + l.u + (d === 0 ? 1.4 : d === 2 ? -1.4 : 0), fv = cy + l.v + (d === 1 ? 1.4 : d === 3 ? -1.4 : 0);
                glow(R5, c, P2.X(fu, fv), P2.Y(fu, fv, 0.2), 9 * Z, "rgba(255,245,190,0.38)", 0.5);
              }
            } else glow(R5, c, lx, ly, 2.4 * Z, "rgba(255,50,40,0.85)");
          }
        },
        { isV: true }
      );
      return it;
    };
    if (map2.estates && map2.estates.length) {
      const tsE = R5.time || 0, nightE = g.S.min / 60 < 5.5 || g.S.min / 60 >= 18.2, eraE = g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : 2;
      const bb = (a, b, c, d, zh, mg = 2) => [P2.X(a, d) - mg * Z, P2.X(c, b) + mg * Z, P2.Y(a, b, zh) - mg * Z, P2.Y(c, d, 0) + mg * Z];
      for (const E2 of map2.estates) {
        if (Math.abs(E2.x0 + E2.w / 2 - hero.x) > E2.w / 2 + 40 || Math.abs(E2.y0 + E2.h / 2 - hero.y) > E2.h / 2 + 34) continue;
        const it = (x0, y0, x1, y1, zh, draw2, lt) => {
          const [a, b, c, d] = bb(x0, y0, x1, y1, zh);
          push(x0, y0, x1, y1, a, b, c, d, draw2, lt || null);
        };
        const gx = E2.x0 + 27, gy = E2.y0 + E2.h - 1;
        it(gx, gy, gx + 1, gy + 1, 5.2, (c) => drawGatePillar(c, P2, Z, gx, gy, nightE), (c) => glow(R5, c, P2.X(gx + 0.5, gy + 1), P2.Y(gx + 0.5, gy + 1, 4.65), 7 * Z, "rgba(255,238,170,0.85)"));
        it(gx + 6, gy, gx + 7, gy + 1, 5.2, (c) => drawGatePillar(c, P2, Z, gx + 6, gy, nightE), (c) => glow(R5, c, P2.X(gx + 6.5, gy + 1), P2.Y(gx + 6.5, gy + 1, 4.65), 7 * Z, "rgba(255,238,170,0.85)"));
        it(gx + 1, gy - 2.2, gx + 1.1, gy + 0.9, 2.5, (c) => drawGateLeaf(c, P2, Z, gx + 1, gy - 2.2, gy + 0.9));
        it(gx + 5.9, gy - 2.2, gx + 6, gy + 0.9, 2.5, (c) => drawGateLeaf(c, P2, Z, gx + 5.9, gy - 2.2, gy + 0.9));
        const ghx = E2.x0 + 34, ghy = E2.y0 + 39;
        it(ghx, ghy, ghx + 3, ghy + 2, 3.2, (c) => drawGuardhouse(c, P2, Z, ghx, ghy), (c) => glow(R5, c, P2.X(ghx + 1.5, ghy + 2), P2.Y(ghx + 1.5, ghy + 2, 1.6), 6 * Z, "rgba(255,230,160,0.6)"));
        const fc = E2.fountain;
        it(fc.cx - 0.3, fc.cy - 0.3, fc.cx + 1.3, fc.cy + 1.3, 4, (c) => drawFountainJet(c, P2, Z, fc.cx + 0.5, fc.cy + 0.5, tsE));
        const hl = E2.heli;
        it(hl.cx - 1.5, hl.cy - 1.5, hl.cx + 3.5, hl.cy + 5, 4, (c) => drawHeli(c, P2, Z, hl.cx + 1, hl.cy + 0.6, tsE));
        const [tx, ty, tw, th] = E2.tennis;
        it(tx + 1.5, ty + th / 2 - 0.1, tx + tw - 1.5, ty + th / 2 + 0.1, 1.2, (c) => drawTennisNet(c, P2, Z, tx, ty, tw, th));
        const [gx0, gy0, gw] = E2.golf;
        for (const [fx, fy] of [[gx0 + gw - 4, gy0 + 4], [gx0 + 12, gy0 + 3], [gx0 + 15, gy0 + 7]]) it(fx, fy, fx + 0.2, fy + 0.2, 2.2, (c) => drawGolfFlag(c, P2, Z, fx, fy));
        for (const [lx, ly] of [[E2.pool[0] + 0.5, E2.pool[1] + 5.6], [E2.pool[0] + 2.2, E2.pool[1] + 5.6], [E2.pool[0] + 7, E2.pool[1] + 5.6]]) it(lx, ly, lx + 1.6, ly + 1.7, 1, (c) => drawLounger(c, P2, Z, lx, ly));
        if (R5.A.veh) for (let ci = 0; ci < E2.cars.length; ci++) {
          const cr = E2.cars[ci];
          const dd = Math.abs(cr.x - hero.x) + Math.abs(cr.y - hero.y);
          if (dd > 60) continue;
          pushVeh(cr.x, cr.y, cr.d, cr.ty, eraE, cr.c * 3 + 1, (LEN_M[cr.ty] || 4.6) / 2, { parked: true, moving: false });
        }
      }
    }
    if (map2.lots && R5.A.veh) {
      const dayL = Math.floor(g.absMin() / 1440), hrL = g.S.min / 60, eraL = g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : 2;
      for (const L3 of map2.lots) {
        if (Math.abs(L3.x + L3.w / 2 - hero.x) > L3.w / 2 + 30 || Math.abs(L3.y + L3.h / 2 - hero.y) > L3.h / 2 + 26) continue;
        const fill = (hrL < 7 || hrL > 21 ? 18 : L3.kind === "stadium" ? 45 : 62) + (dayL % 7 === 0 || dayL % 7 === 6 ? 14 : 0);
        lotRows(L3).forEach((yy, r) => {
          let n2 = 0;
          for (let x = L3.x + 1; x + 2.4 <= L3.x + L3.w; x += 2.4, n2++) {
            if (Math.abs(x - hero.x) > 44 || Math.abs(yy + 2.3 - hero.y) > 40) continue;
            const hv = hash2(n2 * 37 + r * 11 + L3.x * 3 + dayL, 6151);
            if (hv % 100 >= fill) continue;
            const ty = ["compact", "sedan", "kei", "suv", "minivan", "wagon", "keitruck"][hv % 7];
            pushVeh(x + 1.2, yy + 2.3, 1, ty, eraL, hv % 8, (LEN_M[ty] || 4.5) / 2, { parked: true, moving: false });
          }
        });
      }
    }
    for (const hb of map2.hubs || []) {
      if (hb.kind !== "airport" || !hb.runway || !R5.A.veh) continue;
      const rw = hb.runway;
      if (Math.abs(rw.apron.x0 + 46 - hero.x) > 90 || Math.abs(rw.apron.y0 + 11 - hero.y) > 60) continue;
      const tt = g.absMin() * 60 + (R5.time || 0), eraV = g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : 2;
      const dayN2 = Math.floor(g.absMin() / 1440);
      const tri = (t, T4) => {
        const u2 = t % T4 / T4;
        return u2 < 0.5 ? u2 * 2 : 2 - u2 * 2;
      };
      rw.stands.forEach((st3, i) => {
        if (Math.abs(st3.x - hero.x) > 70 || hash2(i * 7 + dayN2, 4431) % 5 === 0) return;
        const ph = hash2(i * 13 + 5, 77) % 60, T12 = 70 + i % 3 * 25;
        const bx = st3.x - 12 + tri(tt + ph, T12) * 8, by = st3.y + 1.5;
        pushVeh(bx, by, (tt + ph) % T12 / T12 < 0.5 ? 0 : 2, "tow", eraV, 0, 1.9, { moving: true });
        for (let c = 1; c <= 2; c++) pushVeh(bx - c * 2.1 * ((tt + ph) % T12 / T12 < 0.5 ? 1 : -1), by, (tt + ph) % T12 / T12 < 0.5 ? 0 : 2, "keitruck", eraV, 3, 1.7, { moving: true });
        pushVeh(st3.x + 6.5, st3.y + 3.2, 1, "bigtruck", eraV, 1, 4.2, { parked: true, moving: false });
        pushVeh(st3.x + 4.5, st3.y - 7.5, 0, "delivery", eraV, 6, 2.35, { parked: true, moving: false });
        if ((i + dayN2) % 2 === 0) pushVeh(st3.x - 1.2, st3.y + 11.2, 1, "tow", eraV, 2, 2.9, { parked: true, moving: false });
        const bt = tri(tt * 0.9 + ph * 3, 140), byy = st3.y + 8 + bt * (hb.door.y - 14 - st3.y - 8 > 4 ? Math.min(hb.door.y - 14 - st3.y - 8, 14) : 4);
        pushVeh(st3.x + 11, byy, 1, "microbus", eraV, 4, 3.5, { moving: true });
      });
      const fc = rw.fc;
      if (fc && Math.abs(fc.x0 + fc.w / 2 - hero.x) < 70 && Math.abs(fc.y0 + 10 - hero.y) < 50) for (let r = 0; r < 1; r++) {
        const yy = fc.y0 + 5 + r * 7 + 2.5;
        let n2 = 0;
        for (let x = fc.x0 + 1; x < fc.x0 + fc.w - 1; x += 2.4, n2++) {
          if (Math.abs(x - rw.doorX) < 5 || Math.abs(x - hero.x) > 50) continue;
          const hv = hash2(n2 * 31 + r * 7 + dayN2, 9091);
          if (hv % 100 < 38) continue;
          const ty = ["compact", "sedan", "kei", "suv", "minivan", "wagon"][hv % 6];
          pushVeh(x + 1, yy, 1, ty, eraV, hv % 8, (LEN_M[ty] || 4.5) / 2, { parked: true, moving: false });
        }
      }
      const loop = rw.apron.w * 2 + 20, u = tt * 0.35 % loop;
      const lx = rw.apron.x0 + (u < rw.apron.w ? u : rw.apron.w - (u - rw.apron.w) % rw.apron.w), ly = rw.apron.y0 + 20;
      pushVeh(Math.max(rw.apron.x0 + 2, Math.min(rw.apron.x0 + rw.apron.w - 2, lx)), ly, u < rw.apron.w ? 0 : 2, "sweeper", eraV, 5, 2.7, { moving: true });
    }
    const hwy = highwaysOf(map2);
    const deckNpc = /* @__PURE__ */ new Map();
    const onFoot = (w) => {
      if (!w.jump) return null;
      for (const sg of hwy.segs) if (sg.kind === "foot" && sg.f === w.jump.fx) {
        const p = w.y;
        if (p >= sg.a + 0.15 && p <= sg.b + 0.85) return { sg, p };
      }
      return null;
    };
    for (const w of R5.walkers) {
      if (onFoot(w)) continue;
      if (w.car && R5.A.veh) {
        const c = R5.npcCar(w, dtSec);
        const ci = c.ci;
        if (c.lv && hwy.byId[c.lv]) {
          (deckNpc.get(c.lv) || deckNpc.set(c.lv, []).get(c.lv)).push(c);
          continue;
        }
        const lenT = c.len;
        pushVeh(c.x, c.y, c.d, ci.ty, ci.era, ci.color, lenT, { open: c.open && c.px !== void 0 ? { px: c.px, py: c.py } : null, moving: !c.stopped, occ: npcOcc(w, ci) });
        if (w.ph === "drive" || w.ph === "in" || w.ph === "park") continue;
      }
      const X = P2.X(w.x, w.y), Y2 = P2.Y(w.x, w.y);
      const age = g.ageOf(w.id);
      const look = g.world.pop.look[w.id];
      const dir = Math.abs(w.dx) >= Math.abs(w.dy) ? w.dx > 0 ? "r" : w.dx < 0 ? "l" : w.dy > 0 ? "d" : "d" : w.dy > 0 ? "d" : "u";
      const nd = g.world.pop.needs[w.id];
      push(w.x - 0.2, w.y - 0.2, w.x + 0.2, w.y + 0.2, X - 9 * Z, X + 9 * Z, Y2 - 26 * Z, Y2 + 3 * Z, (c) => {
        R5.drawChar(c, X, Y2, look, age, dir, !w.idle, { wheel: !!(nd & 1), cane: !!(nd & 2), id: w.id });
      }, null, { isP: true });
    }
    for (const pk of R5.parked || []) {
      if (!R5.A.veh) break;
      const ci = pk.ci;
      pushVeh(pk.pad.px + 0.5, pk.pad.py + 0.5, pk.pad.ld, ci.ty, ci.era, ci.color, (LEN_M[ci.ty] || 4.5) / 2, { parked: true, moving: false });
    }
    try {
      const hv = getCars(g.hero);
      for (const cc of hv.cars) {
        const pk = cc.parked;
        if (!pk || hv.ride === "car" && hv.cur === cc.uid || pk.x === void 0 || Math.hypot(pk.x - hero.x, pk.y - hero.y) > 40) continue;
        const mm = MODEL[cc.model];
        if (!mm || !R5.A.veh) continue;
        const ty = mm.type;
        pushVeh(pk.x, pk.y, pk.d | 0, ty, g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : 2, cc.color, (VEH_DIMS[ty] || VEH_DIMS.compact).L / 2, { parked: true, moving: false, open: R5.dismountT > R5.time && R5.dismountUid === cc.uid ? { px: hero.x, py: hero.y } : null });
      }
    } catch (e) {
    }
    const heroPax = () => {
      const pop = g.world.pop, id = g.hero.id;
      const key = g.S.M + ":" + id;
      if (R5._paxKey !== key) {
        R5._paxKey = key;
        const kids = [];
        for (let i = 0; i < pop.n && kids.length < 3; i++) if (!pop.gone[i] && (pop.mother[i] === id || pop.father[i] === id) && g.ageOf(i) < 13 && pop.home[i] === pop.home[id]) kids.push(i);
        R5._pax = { kids, sp: pop.spouse[id] >= 0 && !pop.gone[pop.spouse[id]] ? pop.spouse[id] : -1 };
      }
      return R5._pax;
    };
    const heroOcc = () => {
      if (!rideReady(R5)) return null;
      const pop = g.world.pop, id = g.hero.id;
      const day = Math.floor(g.absMin() / 1440);
      const occ = [{ seat: "drv", colors: riderColors(R5, id, pop.look[id], g.age()) }];
      const px2 = heroPax();
      if (px2.sp >= 0 && (R5.forcePax || hash2(id, day) % 2 === 0)) occ.push({ seat: "pas", colors: riderColors(R5, px2.sp, pop.look[px2.sp], g.ageOf(px2.sp)) });
      if (px2.kids.length && (R5.forcePax || hash2(id + 5, day) % 3 !== 0)) {
        const k2 = px2.kids[0];
        occ.push({ seat: hash2(k2, day) % 2 ? "rr" : "rl", kid: true, colors: riderColors(R5, k2, pop.look[k2], g.ageOf(k2)) });
      }
      return occ;
    };
    const MOTO_BODY = ["#d83a3a", "#2f6fd0", "#e8e8ec", "#3a3a44", "#e0a020", "#2f9a5a"];
    const motoColors = (rider) => {
      const id = g.hero.id, pop = g.world.pop;
      const b = MOTO_BODY[hash2(id, 91) % MOTO_BODY.length];
      const hc = ["#e6c33a", "#f2f2f6", "#d94052", "#4a90d9"][hash2(id, 92) % 4];
      return riderColors(R5, id, pop.look[id], g.age(), { body: b, bodySh: shadeC(b, 0.74), helmet: hc, helmetSh: shadeC(hc, 0.75) });
    };
    const shadeC = (h, f2) => "#" + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(h.slice(i, i + 2), 16) * f2))).toString(16).padStart(2, "0")).join("");
    const MV = [["f", false], ["f", true], ["b", true], ["b", false]];
    const pushMoto = (cx, cy, d, o) => {
      const X = P2.X(cx, cy), Y2 = P2.Y(cx, cy);
      const u = RIDE_UNIT.bike * Z;
      const [view, flip] = MV[d & 3];
      const w = 48 * u, h = 52 * u;
      const sx0 = X - w / 2, sy0 = Y2 - 49 * u;
      return push(cx - 0.45, cy - 0.45, cx + 0.45, cy + 0.45, sx0, sx0 + w, sy0, sy0 + h, (c) => {
        const idleBob = (o.idle || o.starting) && Math.floor(R5.time * (o.starting ? 18 : 6)) & 1;
        drawMoto(R5, c, o.colors, { kind: o.kind, view, flip, helmet: o.helmet !== false, rider: o.rider, parked: o.rider === false, frame: o.moving ? Math.floor(R5.time * 12) & 1 : 0, bob: o.moving && Math.floor(R5.time * 8) & 1 || idleBob, lean: o.launching }, X, Y2, u);
        if ((o.starting || o.launching) && o.rider) {
          const ph = R5.time * 3 % 1;
          for (let k2 = 0; k2 < 3; k2++) {
            const q = (ph + k2 / 3) % 1;
            const bx = flip ? 1 : -1;
            c.fillStyle = `rgba(210,214,222,${0.55 * (1 - q)})`;
            c.beginPath();
            c.arc(X + bx * 14 * u + bx * q * 7 * u, Y2 - 4 * u - q * 8 * u, (1.6 + q * 2.2) * u, 0, 7);
            c.fill();
          }
        }
      }, null, { isV: true });
    };
    {
      const rv0 = g.hero.veh && g.hero.veh.ride;
      if (R5._prevRide !== rv0) {
        if (rv0 === "moto" && R5._prevRide !== "moto") R5.mountT = R5.time + 1;
        if (rv0 === "bicycle" && R5._prevRide !== "bicycle") {
          R5.mountT = R5.time + 0.7;
          try {
            window.NLSAudio && window.NLSAudio.bicycleBell && window.NLSAudio.bicycleBell();
          } catch (e) {
          }
        }
        if (rv0 === "moto" && R5._prevRide !== "moto") {
          try {
            setTimeout(() => window.NLSAudio && window.NLSAudio.engine && window.NLSAudio.engine(), 500);
          } catch (e) {
          }
        }
        if (R5._prevRide === "moto" || R5._prevRide === "car") {
          R5.dismountT = R5.time + 1.8;
          R5.dismountKind = R5._prevRide;
          R5.dismountUid = R5.lastCarUid;
        }
        R5._prevRide = rv0;
      }
    }
    try {
      const mv = g.hero.veh && g.hero.veh.moto && g.hero.veh.moto.parked;
      if (mv && rideReady(R5) && Math.hypot(mv.x - hero.x, mv.y - hero.y) < 40 && g.S.loc.k === "out") pushMoto(mv.x, mv.y, mv.d | 0, { rider: false, moving: false, colors: motoColors(false) });
    } catch (e) {
    }
    try {
      const bv = g.hero.veh && g.hero.veh.bike && g.hero.veh.bike.parked;
      if (bv && rideReady(R5) && Math.hypot(bv.x - hero.x, bv.y - hero.y) < 40 && g.S.loc.k === "out") pushMoto(bv.x, bv.y, bv.d | 0, { kind: "bicycle", rider: false, moving: false, colors: motoColors(false) });
    } catch (e) {
    }
    {
      if (!R5._taxiStands || R5._taxiStands.map !== map2) {
        const L22 = [];
        for (const b of map2.buildings) {
          if (!["station", "airport", "hospital", "hotel", "resorthotel", "dept", "mall"].includes(b.type)) continue;
          const pd = padFor(map2, b.idx);
          if (!pd) continue;
          const o = [{ x: pd.px, y: pd.py, d: pd.ld }];
          for (let k2 = 1; k2 <= 2; k2++) {
            const bx = pd.px - DX[pd.ld] * k2 * 2.4, by = pd.py - DY[pd.ld] * k2 * 2.4;
            const tx = Math.floor(bx), ty2 = Math.floor(by);
            const gd = map2.ground[tx + ty2 * map2.W];
            if (map2.bid[tx + ty2 * map2.W] < 0 && !map2.deco[tx + ty2 * map2.W] && (gd === T.GRASS || gd === T.PLAZA || gd === T.PATH)) o.push({ x: bx, y: by, d: pd.ld });
          }
          L22.push({ b: b.idx, o, type: b.type });
        }
        R5._taxiStands = { map: map2, list: L22 };
      }
      const era0 = g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : g.year() < 2035 ? 2 : 3;
      if (g.year() >= 1950) for (const st3 of R5._taxiStands.list) {
        const o0 = st3.o[0];
        if (Math.abs(o0.x - hero.x) > 44 || Math.abs(o0.y - hero.y) > 44) continue;
        const nTx = st3.type === "station" || st3.type === "airport" ? 3 : 1;
        st3.o.slice(0, nTx).forEach((q, i) => {
          if (hash2(st3.b * 3 + i, 7717 + Math.floor(g.absMin() / 45)) % 5 === 0) return;
          pushVeh(q.x + (q.d % 2 === 0 ? 0 : 0), q.y, q.d, "taxi", era0, 8, LEN_M.taxi / 2, { moving: false });
        });
      }
    }
    const hlvId = g.S.loc && g.S.loc.lv;
    const hlv = hlvId ? hwy.byId[hlvId] : null;
    if (hlv) cap2 = [];
    const rv = g.hero.veh && g.hero.veh.ride;
    let heroIt = null;
    const hX = P2.X(hero.x, hero.y), hY = P2.Y(hero.x, hero.y);
    const walkHero = (helmetHand) => {
      const nd = g.world.pop.needs[g.hero.id];
      const look = g.world.pop.look[g.hero.id];
      const age = g.age();
      const dir = hero.f || "d";
      const bike = rv === "bicycle";
      const it = push(hero.x - 0.2, hero.y - 0.2, hero.x + 0.2, hero.y + 0.2, hX - 9 * Z, hX + 9 * Z, hY - 26 * Z, hY + 3 * Z, (c) => {
        R5.drawChar(c, hX, hY, look, age, dir, !!hero.moving, { wheel: !!(nd & 1), cane: !!(nd & 2), id: g.hero.id, hat: void 0, bike });
        if (helmetHand && rideReady(R5)) drawHelmetHand(R5, c, motoColors(false), hX + 7 * Z, hY - 8 * Z, RIDE_UNIT.bike * Z * 0.9);
      }, null, { isHero: true });
      R5._heroDraw = null;
      if (it) it.redraw = (c) => {
        R5.drawChar(c, hX, hY, look, age, dir, !!hero.moving, { wheel: !!(nd & 1), cane: !!(nd & 2), id: g.hero.id });
      };
      return it;
    };
    if (g.S.onBus) {
    } else if (g.S.taxiTrip && TAXI.trip) {
      heroIt = pushVeh(hero.x, hero.y, TAXI.trip.d & 3, "taxi", g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : g.year() < 2035 ? 2 : 3, 8, LEN_M.taxi / 2, { moving: true });
      if (heroIt) heroIt.isHero = true;
    } else if (rv === "car" || rv === "test") {
      const cc = curCar(g.hero), mm = cc && MODEL[cc.model];
      const ty = mm ? mm.type : "compact";
      heroIt = pushVeh(hero.x, hero.y, hs, ty, g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : 2, cc ? cc.color : 1, (VEH_DIMS[ty] || VEH_DIMS.compact).L / 2, { moving: hero.moving, occ: heroOcc(), open: R5.dismountT > R5.time && R5.dismountKind === "car" ? { px: hero.x, py: hero.y } : null });
      if (heroIt) heroIt.isHero = true;
      if (cc) R5.lastCarUid = cc.uid;
    } else if (rv === "bicycle" && rideReady(R5) && R5.mountT - R5.time > 0.25) {
      pushMoto(hero.x + 0.4, hero.y - 0.1, hs, { kind: "bicycle", rider: false, moving: false, colors: motoColors(false) });
      heroIt = walkHero(false);
      if (heroIt) heroIt.isHero = true;
    } else if (rv === "bicycle" && rideReady(R5)) {
      const mv = !!hero.moving;
      heroIt = pushMoto(hero.x, hero.y, hs, { kind: "bicycle", rider: true, moving: mv, helmet: g.age() < 13, colors: motoColors(true, true) });
      if (heroIt) heroIt.isHero = true;
    } else if (rv === "moto" && rideReady(R5) && R5.mountT - R5.time > 0.5) {
      pushMoto(hero.x + 0.45, hero.y - 0.15, hs, { rider: false, moving: false, colors: motoColors(false) });
      heroIt = walkHero(true);
      if (heroIt) heroIt.isHero = true;
    } else if (rv === "moto" && rideReady(R5)) {
      const starting = R5.mountT - R5.time > 0;
      const mv = !!hero.moving;
      if (mv) R5._motoMoveT = R5.time;
      const launching = mv && R5.time - (R5._motoStillT || 0) < 0.35;
      if (!mv) R5._motoStillT = R5.time;
      heroIt = pushMoto(hero.x, hero.y, hs, { rider: true, moving: mv, idle: !mv, starting, launching, colors: motoColors(true) });
      if (heroIt) heroIt.isHero = true;
    } else {
      beginFrame(40);
      heroIt = walkHero(R5.dismountT > R5.time && R5.dismountKind === "moto");
      beginFrame(8);
    }
    let heroOnDeck = null;
    if (hlv) {
      heroOnDeck = cap2 && cap2[0];
      cap2 = null;
      heroIt = null;
    }
    const trs = R5.trainsNow();
    const L2 = g.tr.byId;
    const era4 = g.year() < 2e3 ? 0 : g.year() < 2015 ? 1 : g.year() < 2035 ? 2 : 3;
    for (const c of R5.carsNow(dtSec, hero, trs)) {
      if (Math.abs(c.x - hero.x) > 48 || Math.abs(c.y - hero.y) > 48) continue;
      pushVeh(c.x, c.y, c.d, c.ty, c.era ?? era4, c.color, c.len, { moving: c.v > 0.05 });
    }
    for (const b of bridgeTilesOf(map2)) {
      if (Math.abs(b.x - hero.x) > 36 || Math.abs(b.y - hero.y) > 36) continue;
      push(b.x, b.y, b.x + 1, b.y + 1, P2.X(b.x, b.y + 1) - 4 * Z, P2.X(b.x + 1, b.y) + 4 * Z, P2.Y(b.x, b.y, 3), P2.Y(b.x + 1, b.y + 1, -1.2) + 2 * Z, (c) => drawBridgeTile(c, P2, Z, b));
    }
    for (const G4 of guardrailsOf(map2)) {
      if (Math.abs(G4.x - hero.x) > 30 || Math.abs(G4.y - hero.y) > 30) continue;
      push(G4.x, G4.y, G4.x + 1, G4.y + 1, P2.X(G4.x, G4.y + 1) - 2 * Z, P2.X(G4.x + 1, G4.y) + 2 * Z, P2.Y(G4.x, G4.y, 1), P2.Y(G4.x + 1, G4.y + 1, 0) + 1 * Z, (c) => drawGuardrail(c, P2, Z, G4));
    }
    for (const L3 of parkingOf(map2)) {
      if (Math.abs(L3.x - hero.x) > 30 || Math.abs(L3.y - hero.y) > 30) continue;
      const sx = L3.side === "E" ? L3.x + 0.1 : L3.side === "W" ? L3.x + L3.w - 0.3 : L3.x + 0.05, sy = L3.side === "S" ? L3.y + 0.05 : L3.side === "N" ? L3.y + L3.h - 0.3 : L3.y + 0.1;
      push(sx, sy, sx + 0.25, sy + 0.25, P2.X(sx, sy) - 8 * Z, P2.X(sx, sy) + 8 * Z, P2.Y(sx, sy, 2.4) - 10 * Z, P2.Y(sx, sy, 0) + 2 * Z, (c) => drawParkSign(c, P2, Z, L3));
    }
    {
      R5._pushVeh = pushVeh;
      const bi = facOutdoor(R5, hero, push, P2, Z);
      if (bi && g.S.onBus) heroIt = bi;
    }
    for (const sg of hwy.segs) {
      const [rx0, ry0, rx1, ry1] = sg.ax === "x" ? [sg.a, sg.f, sg.b + 1, sg.f + sg.th] : [sg.f, sg.a, sg.f + sg.th, sg.b + 1];
      if (hero.x < rx0 - 50 || hero.x > rx1 + 50 || hero.y < ry0 - 50 || hero.y > ry1 + 50) continue;
      const heroOn = hlv === sg, top = sg.Hh + (sg.kind === "tun" ? 3 : 7), pa = sg.ax === "x" ? hero.x : hero.y;
      const rmap = /* @__PURE__ */ new Map();
      const addR = (i, r) => {
        let a = rmap.get(i);
        if (!a) {
          a = [];
          rmap.set(i, a);
        }
        a.push(r);
      };
      if (sg.kind === "exp" || sg.kind === "elev") for (const cr of deckCars(sg, R5.time, year)) {
        cap2 = [];
        pushVeh(cr.x, cr.y, cr.d, cr.ty, cr.era, cr.col, (LEN_M[cr.ty] || 4.5) / 2, { moving: true });
        const it = cap2[0];
        cap2 = null;
        if (it) addR(Math.floor(cr.p), { it, z: cr.z, k: cr.x + cr.y });
      }
      for (const c of deckNpc.get(sg.id) || []) {
        const p = sg.ax === "x" ? c.x : c.y;
        const ci = c.ci;
        cap2 = [];
        pushVeh(c.x, c.y, c.d, ci.ty, ci.era, ci.color, c.len, { moving: !c.stopped });
        const it = cap2[0];
        cap2 = null;
        if (it) addR(Math.floor(p), { it, z: zAt(sg, p), k: c.x + c.y });
      }
      if (sg.kind === "foot") for (const w of R5.walkers) {
        const of = onFoot(w);
        if (!of || of.sg !== sg) continue;
        const p = of.p, z = zAt(sg, p), x = sg.f + 0.5, y = p;
        const X = P2.X(x, y), Y2 = P2.Y(x, y);
        const age = g.ageOf(w.id), look = g.world.pop.look[w.id];
        if (look === void 0) continue;
        const nd = g.world.pop.needs[w.id];
        const dd = w.dy > 0 ? "d" : "u";
        cap2 = [];
        push(x - 0.2, y - 0.2, x + 0.2, y + 0.2, X - 9 * Z, X + 9 * Z, Y2 - 26 * Z, Y2 + 3 * Z, (c) => {
          R5.drawChar(c, X, Y2, look, age, dd, true, { wheel: !!(nd & 1), cane: !!(nd & 2), id: w.id });
        }, null, { isP: true });
        const it = cap2[0];
        cap2 = null;
        if (it && !(heroOn && Math.abs(p - coords(sg, g.S.loc.x, g.S.loc.y).p) < 0.5)) addR(Math.floor(p), { it, z, k: x + y });
      }
      if (heroOn && heroOnDeck) {
        const { p } = coords(sg, g.S.loc.x, g.S.loc.y);
        addR(Math.min(sg.b, Math.max(sg.a, Math.floor(p))), { it: heroOnDeck, z: g.S.loc.z || 0, k: hero.x + hero.y + 0.01 });
      }
      let tunNear = false;
      if (sg.kind === "tun") {
        const pq = coords(sg, hero.x, hero.y);
        tunNear = pq.p > sg.a - 2 && pq.p < sg.b + 3 && pq.q > -2.5 && pq.q < sg.th + 2.5;
      }
      for (let i = sg.a; i <= sg.b; i++) {
        if (Math.abs(i + 0.5 - pa) > 64) continue;
        const bx = tileBox(P2, Z, sg, i, top);
        const sgn = sg.kind === "exp" || sg.kind === "elev" ? i === sg.a ? { p: sg.a + 0.7, text: sg.nameIn, sub: "\u5165\u53E3 \u25B6" } : i === sg.b ? { p: sg.b + 0.3, text: sg.nameOut, sub: "\u5165\u53E3 \u25C0" } : null : null;
        if (sgn) {
          bx.sx0 -= 18 * Z;
          bx.sx1 += 18 * Z;
          bx.sy0 -= 6 * Z;
        }
        let alpha = 1;
        if (sg.kind === "tun") alpha = tunNear ? 0.3 : 1;
        else if (heroOn && sg.kind === "foot") alpha = 0.42;
        else if (!heroOn && heroBox.sx0 < bx.sx1 && heroBox.sx1 > bx.sx0 && heroBox.sy0 < bx.sy1 && heroBox.sy1 > bx.sy0 && hero.x + hero.y < bx.x1 + bx.y1 - 0.5 && !hlv) alpha = 0.4;
        const o = { riders: rmap.get(i), alpha, sign: sgn };
        push(
          bx.x0,
          bx.y0,
          bx.x1,
          bx.y1,
          bx.sx0,
          bx.sx1,
          bx.sy0,
          bx.sy1,
          sg.kind === "tun" ? (c) => drawTunnelTile(c, P2, Z, sg, i, o) : sg.kind === "foot" ? (c) => drawFootTile(c, P2, Z, sg, i, o) : (c) => drawDeckTile(c, P2, Z, sg, i, o),
          sg.kind === "tun" ? (c) => lightTunnelTile(c, P2, Z, sg, i, (cc, x, y, r, col) => glow(R5, cc, x, y, r, col)) : sg.kind === "foot" ? o.riders ? (c) => {
            for (const r of o.riders) if (r.it.lt) {
              c.save();
              c.translate(0, -r.z * 12 * Z);
              r.it.lt(c);
              c.restore();
            }
          } : null : (c) => lightDeckTile(c, P2, Z, sg, i, o, (cc, x, y, r, col) => glow(R5, cc, x, y, r, col))
        );
      }
    }
    {
      const trs0 = R5.trainsNow();
      const cl = crossingsOf(map2);
      const tsec = R5.time || 0;
      for (const cr of cl) {
        if (Math.abs(cr.cx - hero.x) > 40 || Math.abs(cr.cy - hero.y) > 40) continue;
        let near2 = false;
        for (const t of trs0) if (Math.hypot(t.x - cr.cx, t.y - cr.cy) < 12) {
          near2 = true;
          break;
        }
        const goal = near2 ? 1 : 0;
        cr.ang += Math.sign(goal - cr.ang) * Math.min(Math.abs(goal - cr.ang), dtSec * 0.8);
        const closed = cr.ang > 0.6;
        for (const gt of gatesOf(cr)) {
          const X = P2.X(gt.pu, gt.pv), Y2 = P2.Y(gt.pu, gt.pv);
          const half = (gt.len + 2) * 16 * Z;
          const it0 = push(gt.pu - 0.2, gt.pv - 0.2 - (gt.dv < 0 ? 0 : 0), gt.pu + 0.2, gt.pv + 0.2, X - half, X + half, Y2 - 36 * Z, Y2 + 6 * Z, (c) => drawGate(c, P2, Z, gt, cr.ang, tsec, closed), (c) => {
            if (closed) {
              const lit = (Math.floor(tsec * 2.6) & 1) === gt.side;
              if (lit) glow(R5, c, P2.X(gt.pu, gt.pv), P2.Y(gt.pu, gt.pv, 1.9), 7 * Z, "rgba(255,60,50,0.9)");
            }
          });
          void it0;
        }
      }
    }
    for (const t of trs) for (let car = 0; car < 4; car++) {
      const SP = 9.9;
      const dd = t.dir === 1 ? t.dd - car * SP : t.dd + car * SP;
      const path = L2[t.line].path;
      const pos = posOnPath(path, dd);
      if (Math.abs(pos.x - hero.x) > 56 || Math.abs(pos.y - hero.y) > 56) continue;
      const horiz = pos.dy === 0;
      const cxw = pos.x + 0.5, cyw = pos.y + 0.5;
      const load = Math.min(10, Math.round(R5.trainLoad(t) / 4));
      const lrgb = R5.lineRgb(t.line);
      const key = `T|${lrgb.join()}|${era4}|${horiz ? 1 : 0}|${load}|${Rr}`;
      let s = R5.vsp.get(key);
      if (!s) {
        s = trainSprite(lrgb, era4, horiz, Rr, load * 4);
        R5.vsp.set(key, s);
      }
      const X = P2.X(cxw, cyw), Y2 = P2.Y(cxw, cyw);
      const sx0 = X - s.ax * k, sy0 = Y2 - s.ay * k;
      const hl = horiz ? 4.95 : 0.5, hw = horiz ? 0.5 : 4.95;
      push(
        cxw - hl,
        cyw - hw,
        cxw + hl,
        cyw + hw,
        sx0,
        sx0 + s.cv.width * k,
        sy0,
        sy0 + s.cv.height * k,
        (c) => {
          c.drawImage(s.cv, sx0, sy0, s.cv.width * k, s.cv.height * k);
        },
        (c) => {
          c.fillStyle = "rgba(255,244,200,0.85)";
          const wy = P2.Y(cxw, cyw, 2.3);
          for (let i = -4; i <= 4; i++) {
            const u = cxw + (horiz ? i * 1 : 0), v = cyw + (horiz ? 0 : i * 1);
            c.globalAlpha = 0.7;
            c.fillRect(P2.X(u + (horiz ? 0 : 0.75), v + (horiz ? 0.75 : 0)) - 1.5 * Z, P2.Y(u + (horiz ? 0 : 0.75), v + (horiz ? 0.75 : 0), 2.3) - 1.2 * Z, 3 * Z, 2.4 * Z);
          }
          c.globalAlpha = 1;
          void wy;
        }
      );
    }
    _t.push(performance.now());
    const ordered = depthSort(items);
    R5._dbg = { items, ordered };
    _t.push(performance.now());
    const FA = R5._fa || (R5._fa = /* @__PURE__ */ new Map());
    const occl = /* @__PURE__ */ new Set();
    let hidden = false;
    if (heroIt) {
      const hi2 = ordered.indexOf(heroIt);
      for (let i = hi2 + 1; i < ordered.length; i++) {
        const o = ordered[i];
        if (o.isB && o.sx0 < heroIt.sx1 && o.sx1 > heroIt.sx0 && o.sy0 < heroIt.sy1 && o.sy1 > heroIt.sy0) occl.add(o.b.idx);
      }
    }
    // 施設監査: 監査中の建物を手前で隠している建物は薄く描く
    const aOcc = /* @__PURE__ */ new Set();
    if (R5.auditFocus != null) for (let i = 0; i < ordered.length; i++) {
      const t = ordered[i];
      if (!t.isB || t.b.idx !== R5.auditFocus) continue;
      for (let j = i + 1; j < ordered.length; j++) {
        const o = ordered[j];
        if (o.isB && o.b.idx !== R5.auditFocus && o.sx0 < t.sx1 && o.sx1 > t.sx0 && o.sy0 < t.sy1 && o.sy1 > t.sy0) aOcc.add(o.b.idx);
      }
    }
    for (const [k2, e] of FA) {
      if (occl.has(k2)) e.hold = 0.3;
      else e.hold -= dtSec;
      const goal = occl.has(k2) || e.hold > 0 ? 0.42 : 1;
      e.a += Math.sign(goal - e.a) * Math.min(Math.abs(goal - e.a), dtSec * (goal < e.a ? 5 : 2.2));
      if (e.a >= 0.999 && !occl.has(k2) && e.hold <= 0) FA.delete(k2);
    }
    for (const k2 of occl) if (!FA.has(k2)) FA.set(k2, { a: 1, hold: 0.3 });
    for (const it of ordered) {
      const e = it.isB && FA.get(it.b.idx);
      if (it.isB && aOcc.has(it.b.idx)) {
        ctx4.globalAlpha = 0.22;
        it.draw(ctx4);
        ctx4.globalAlpha = 1;
      } else if (e && e.a < 0.999) {
        it.fa = e.a;
        if (e.a < 0.9) hidden = true;
        const tt = Math.min(1, (1 - e.a) / 0.58);
        ctx4.save();
        ctx4.beginPath();
        ctx4.rect(-4, -4, W2 + 8, H4 + 8);
        if (heroIt && tt > 0.02) ctx4.ellipse(hX, hY - Z * 6, 26 * Z * tt, 28 * Z * tt, 0, 0, 7);
        ctx4.clip("evenodd");
        ctx4.globalAlpha = Math.min(1, e.a + 0.45);
        it.draw(ctx4);
        ctx4.restore();
        ctx4.globalAlpha = 1;
      } else it.draw(ctx4);
    }
    if (heroIt && hidden) {
      ctx4.strokeStyle = "rgba(255,240,74,0.7)";
      ctx4.lineWidth = Math.max(1.5, S2 * 0.5);
      ctx4.beginPath();
      ctx4.ellipse(hX, hY - Z * 0.5, 9 * Z, 4.5 * Z, 0, 0, 7);
      ctx4.stroke();
      ctx4.globalAlpha = 0.9;
      heroIt.draw(ctx4);
      ctx4.globalAlpha = 1;
    }
    ctx4.setTransform(1, 0, 0, 1, 0, 0);
    if (extras.route) {
      ctx4.strokeStyle = "rgba(255,80,80,0.9)";
      ctx4.lineWidth = Math.max(2, S2);
      ctx4.lineJoin = "round";
      ctx4.beginPath();
      extras.route.forEach((p, i) => {
        const x = P2.X(p[0] + 0.5, p[1] + 0.5), y = P2.Y(p[0] + 0.5, p[1] + 0.5);
        if (i) ctx4.lineTo(x, y);
        else ctx4.moveTo(x, y);
      });
      ctx4.stroke();
    }
    if (extras.dest) {
      const b = extras.dest;
      const x = P2.X(b.doorX + 0.5, b.doorY + 0.5), y = P2.Y(b.doorX + 0.5, b.doorY + 0.5, 3.2) - Math.abs(Math.sin(R5.time * 4)) * 6 * S2;
      ctx4.fillStyle = "#ff3b3b";
      ctx4.beginPath();
      ctx4.moveTo(x, y);
      ctx4.lineTo(x - 5 * S2, y - 9 * S2);
      ctx4.lineTo(x + 5 * S2, y - 9 * S2);
      ctx4.fill();
    }
    try {
      drawOutdoorGuides(R5, ctx4, P2, hero, g);
      drawBusOverlay(R5, ctx4, P2, hero, g);
    } catch (e) {
    }
    if (extras.focus) {
      const f2 = extras.focus;
      const u0 = f2.x, v0 = f2.y, u1 = f2.x + (f2.w || 1), v1 = f2.y + (f2.h || 1);
      ctx4.strokeStyle = "#fff04a";
      ctx4.lineWidth = Math.max(2, S2 * 0.7);
      ctx4.beginPath();
      ctx4.moveTo(P2.X(u0, v0), P2.Y(u0, v0));
      ctx4.lineTo(P2.X(u1, v0), P2.Y(u1, v0));
      ctx4.lineTo(P2.X(u1, v1), P2.Y(u1, v1));
      ctx4.lineTo(P2.X(u0, v1), P2.Y(u0, v1));
      ctx4.closePath();
      ctx4.stroke();
    }
    const na = R5.nightAlpha();
    if (na > 0.01) {
      const kk = Math.min(1, na / 0.5);
      const r = Math.round(255 - kk * 150), gg = Math.round(255 - kk * 138), bb = Math.round(255 - kk * 78);
      ctx4.globalCompositeOperation = "multiply";
      ctx4.fillStyle = `rgb(${r},${gg},${bb})`;
      ctx4.fillRect(0, 0, W2, H4);
      ctx4.globalCompositeOperation = "source-over";
      const lc = R5.lightCv;
      const LS = 1, LW = Math.ceil(W2 * LS), LH = Math.ceil(H4 * LS);
      if (lc.width !== LW || lc.height !== LH) {
        lc.width = LW;
        lc.height = LH;
      }
      const lx = lc.getContext("2d");
      lx.setTransform(1, 0, 0, 1, 0, 0);
      lx.globalCompositeOperation = "source-over";
      lx.clearRect(0, 0, LW, LH);
      lx.setTransform(LS, 0, 0, LS, 0, 0);
      lx.imageSmoothingEnabled = true;
      for (const it of ordered) if (it.lt) {
        if (it.fa) {
          lx.globalAlpha = it.fa;
          it.lt(lx);
          lx.globalAlpha = 1;
        } else it.lt(lx);
      }
      if ((rv === "moto" || rv === "car" || rv === "bicycle") && na > 0.2 && g.S.loc.k === "out") {
        const dv = [[1, 0.5], [-1, 0.5], [-1, -0.5], [1, -0.5]][hs & 3];
        const hx2 = P2.X(hero.x, hero.y), hy = P2.Y(hero.x, hero.y, 0.6);
        const reach = (rv === "car" ? 70 : rv === "moto" ? 55 : 34) * S2;
        for (const sgn of rv === "car" ? [-0.35, 0.35] : [0]) {
          const cx0 = hx2 + dv[0] * reach * 0.55 + sgn * dv[1] * 16 * S2, cy0 = hy + dv[1] * reach * 0.55 - sgn * dv[0] * 8 * S2;
          const gr = lx.createRadialGradient(cx0, cy0, 2 * S2, cx0, cy0, reach * 0.8);
          gr.addColorStop(0, "rgba(255,240,190,0.55)");
          gr.addColorStop(1, "rgba(255,240,190,0)");
          lx.save();
          lx.translate(cx0, cy0);
          lx.scale(1, 0.55);
          lx.translate(-cx0, -cy0);
          lx.fillStyle = gr;
          lx.beginPath();
          lx.arc(cx0, cy0, reach * 0.8, 0, 7);
          lx.fill();
          lx.restore();
        }
      }
      ctx4.globalCompositeOperation = "lighter";
      ctx4.globalAlpha = Math.min(1, kk * 1.25);
      ctx4.imageSmoothingEnabled = true;
      ctx4.drawImage(lc, 0, 0, LW, LH, 0, 0, W2, H4);
      ctx4.globalAlpha = 1;
      ctx4.globalCompositeOperation = "source-over";
    }
    const wt = R5.weather();
    if (wt === "rain" || wt === "snow") {
      ctx4.fillStyle = wt === "rain" ? "rgba(180,200,255,0.55)" : "rgba(255,255,255,0.8)";
      for (let i = 0; i < 70; i++) {
        const rx = (i * 97 + R5.time * (wt === "rain" ? 300 : 40)) % (W2 / S2) * S2, ry = (i * 53 + R5.time * (wt === "rain" ? 400 : 60) + (wt === "snow" ? Math.sin(R5.time + i) * 10 : 0)) % (H4 / S2) * S2;
        if (wt === "rain") ctx4.fillRect(rx, ry, S2, 3 * S2);
        else ctx4.fillRect(rx, ry, 1.5 * S2, 1.5 * S2);
      }
    }
    _t.push(performance.now());
    R5.prof = { ground: _t[1] - _t[0], collect: _t[2] - _t[1], sort: _t[3] - _t[2], draw: _t[4] - _t[3], rest: _t[5] - _t[4] };
    R5.isoStats = { items: items.length, chunks: visChunks.length, bld: seenB.size };
  }
  function fallbackBox(c, P2, b, sp, hm2) {
    const w = b.w, h = b.h;
    const q = (u, v, z) => [P2.X(b.x + u, b.y + v), P2.Y(b.x + u, b.y + v, z)];
    const poly7 = (pts, col) => {
      c.beginPath();
      pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      c.closePath();
      c.fillStyle = col;
      c.fill();
    };
    poly7([q(0, h, 0), q(w, h, 0), q(w, h, hm2), q(0, h, hm2)], "#d8d2c2");
    poly7([q(w, h, 0), q(w, 0, 0), q(w, 0, hm2), q(w, h, hm2)], "#b3ad9e");
    poly7([q(0, 0, hm2), q(w, 0, hm2), q(w, h, hm2), q(0, h, hm2)], "#8d98a5");
    void sp;
  }
  function drawOpenDoor(c, P2, cx, cy, d, o, Z) {
    let sx = o.px - cx, sy = o.py - cy;
    if (d % 2 === 0) {
      sx = 0;
      sy = sy >= 0 ? 1 : -1;
    } else {
      sy = 0;
      sx = sx >= 0 ? 1 : -1;
    }
    const ux = cx + sx * 0.5, uy = cy + sy * 0.5;
    const X = P2.X(ux, uy), Y2 = P2.Y(ux, uy, 0.9);
    c.fillStyle = "#eef1f4";
    c.strokeStyle = "#8a95a0";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(X - 4 * Z, Y2);
    c.lineTo(X + 4 * Z, Y2 - 2 * Z);
    c.lineTo(X + 4 * Z, Y2 - 12 * Z);
    c.lineTo(X - 4 * Z, Y2 - 10 * Z);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#7ec8ff";
    c.fillRect(X - 2.6 * Z, Y2 - 9 * Z, 5 * Z, 4 * Z);
  }

