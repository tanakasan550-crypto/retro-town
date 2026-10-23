  // src/isoint.js
  var JOB_KEYS = Object.keys(JOBS);
  var IP = class {
    constructor(Z, ox, oy) {
      this.Z = Z;
      this.ox = ox;
      this.oy = oy;
    }
    X(u, v) {
      return this.ox + (u - v) * 8 * this.Z;
    }
    Y(u, v, z = 0) {
      return this.oy + (u + v) * 4 * this.Z - z * 12 * this.Z;
    }
  };
  var hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  var mix = (a, b, t) => {
    const A2 = hex(a), B2 = hex(b);
    return "#" + [0, 1, 2].map((i) => Math.round(A2[i] + (B2[i] - A2[i]) * t).toString(16).padStart(2, "0")).join("");
  };
  var cols = (base) => [mix(base, "#ffffff", 0.22), base, mix(base, "#000000", 0.24)];
  var poly4 = (c, pts, fill) => {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  };
  var WALL = { home: "#eadfc8", shop: "#f2efe4", food: "#ead3b2", office: "#e0e5ea", school: "#e8e8da", hospital: "#eef4f4", hotel: "#e8dac8", bath: "#cfe7ec", shrine: "#d8c6a0", station: "#e6e7eb", airport: "#e9eef3", ferry: "#e1edf2", leisure: "#3a3656", showroom: "#f1f3f6", factory: "#cdcfcb", tower: "#e0e5ea", roof: "#d9e6ee", condo: "#e6e1d6" };
  var FLOORC = { floor_marble: ["#efece4", "#e3dfd5"], floor_paving: ["#c9c2b4", "#bdb6a8"], floor_grass: ["#7fb36a", "#74a860"], floor_asphalt: ["#6d7077", "#656870"], floor_corr: ["#d6d1c6", "#cbc6bb"], floor_wood: ["#b88a57", "#c4975f"], floor_tile: ["#e9e7e0", "#d8d6cf"], floor_carpet: ["#6f7f9a", "#74849f"], floor_tatami: ["#b9c88c", "#aebe82"], bath: ["#9ccfe0", "#8ec4d6"], exit: ["#7a5a3a", "#6e5033"] };
  function drawInteriorIso(R5, dtSec, hero, I2, people, extras = {}) {
    R5.time += dtSec;
    const ctx4 = R5.ctx, W2 = R5.cv.width, H4 = R5.cv.height;
    const S0 = R5.S;
    const g = R5.g;
    const L2 = g.S.loc;
    const b = g.world.map.buildings[L2.b];
    const bt = b ? BTYPES[b.type] : null;
    const kind = I2.kind || "office";
    const bigI = I2.W + I2.H > 46;
    const fw = bigI ? Math.min(I2.W, 26) : I2.W, fh = bigI ? Math.min(I2.H, 16) : I2.H;
    const zw = W2 * 0.96 / ((fw + fh - 1) * 8), zh = H4 * 0.74 / ((fw + fh) * 4 + 40);
    const S2 = Math.max(1, Math.floor(Math.min(zw, zh) / 0.75) + (R5.izl ?? 1));
    const Z = S2 * 0.75;
    R5.S = S2;
    const P0 = new IP(Z, 0, 0);
    const minY = P0.Y(0, 1, 3.2), maxY = P0.Y(I2.W, I2.H, -0.4);
    const minX = P0.X(0, I2.H), maxX = P0.X(I2.W, 1);
    let ox = Math.round(W2 / 2 - (minX + maxX) / 2), oy = Math.round(H4 * 0.47 - (minY + maxY) / 2);
    if (hero) {
      const hx2 = P0.X(hero.x, hero.y), hy = P0.Y(hero.x, hero.y, 0);
      if (maxX - minX > W2 * 0.96) ox = Math.round(Math.min(W2 * 0.02 - minX, Math.max(W2 * 0.98 - maxX, W2 / 2 - hx2)));
      if (maxY - minY > H4 * 0.9) oy = Math.round(Math.min(H4 * 0.04 - minY, Math.max(H4 * 0.96 - maxY, H4 * 0.52 - hy)));
    }
    const P2 = new IP(Z, ox, oy);
    R5.ip = P2;
    R5.iZ = Z;
    ctx4.setTransform(1, 0, 0, 1, 0, 0);
    ctx4.imageSmoothingEnabled = true;
    ctx4.fillStyle = "#1b1b24";
    ctx4.fillRect(0, 0, W2, H4);
    const pt = (u, v, z = 0) => [P2.X(u, v), P2.Y(u, v, z)];
    let st3 = null;
    try {
      if (b && (!I2.big || I2.bigKind === "condo")) st3 = styleOfBuilding(g, b);
    } catch (e) {
      st3 = null;
    }
    const wall = st3 && (kind === "home" || kind === "condo") && !b.wa ? st3.wallCol : WALL[kind] || "#e0e0e0";
    const wc = cols(wall);
    const fl = (u0, v0, u1, v1, col) => poly4(ctx4, [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)], col);
    poly4(ctx4, [pt(0, I2.H, 0), pt(I2.W, I2.H, 0), pt(I2.W, I2.H, -0.35), pt(0, I2.H, -0.35)], "#8f8a80");
    poly4(ctx4, [pt(I2.W, I2.H, 0), pt(I2.W, 1, 0), pt(I2.W, 1, -0.35), pt(I2.W, I2.H, -0.35)], "#6f6b63");
    const batch = /* @__PURE__ */ new Map();
    let gridT = null, gridM = null;
    const BATCH = /* @__PURE__ */ new Set(["floor_tile", "floor_marble", "floor_paving", "floor_asphalt", "floor_corr", "floor_grass"]);
    let ux0 = 0, ux1 = I2.W, vy0 = 1, vy1 = I2.H;
    if (bigI) {
      let uMin = 1e9, uMax = -1e9, vMin = 1e9, vMax = -1e9;
      for (const [sx, sy] of [[0, 0], [W2, 0], [0, H4], [W2, H4]]) {
        const a1 = (sx - P2.ox) / (8 * Z), b1 = (sy - P2.oy) / (4 * Z);
        const u = (a1 + b1) / 2, v = (b1 - a1) / 2;
        uMin = Math.min(uMin, u);
        uMax = Math.max(uMax, u);
        vMin = Math.min(vMin, v);
        vMax = Math.max(vMax, v);
      }
      ux0 = Math.max(0, Math.floor(uMin) - 2);
      ux1 = Math.min(I2.W, Math.ceil(uMax) + 2);
      vy0 = Math.max(1, Math.floor(vMin) - 2);
      vy1 = Math.min(I2.H, Math.ceil(vMax) + 2);
    }
    const cAcc = st3 && I2.bigKind === "condo" ? condoFloorAcc() : null;
    for (let y = vy0; y < vy1; y++) for (let x = ux0; x < ux1; x++) {
      {
        const cx = P2.X(x + 0.5, y + 0.5), cy = P2.Y(x + 0.5, y + 0.5);
        if (cx < -18 * Z || cx > W2 + 18 * Z || cy < -10 * Z || cy > H4 + 10 * Z) continue;
      }
      const t = I2.tiles[x + y * I2.W];
      const fc = FLOORC[t] || FLOORC.floor_tile;
      const alt = x + y & 1;
      let col = fc[alt];
      if (t === "floor_carpet") col = mix(fc[0], kind === "hotel" ? "#8a2f3a" : "#6f7f9a", kind === "hotel" ? 0.85 : 0), col = alt ? mix(col, "#ffffff", 0.04) : col;
      if (cAcc) condoFloor(cAcc, pt, Z, t, x, y, st3);
      if (bigI && BATCH.has(t)) {
        let pp = batch.get(col);
        if (!pp) {
          pp = new Path2D();
          batch.set(col, pp);
        }
        const a0 = pt(x, y), b0 = pt(x + 1, y), c0 = pt(x + 1, y + 1), d0 = pt(x, y + 1);
        pp.moveTo(a0[0], a0[1]);
        pp.lineTo(b0[0], b0[1]);
        pp.lineTo(c0[0], c0[1]);
        pp.lineTo(d0[0], d0[1]);
        pp.closePath();
        if (t === "floor_tile" || t === "floor_marble") {
          const gp = t === "floor_tile" ? gridT || (gridT = new Path2D()) : gridM || (gridM = new Path2D());
          gp.moveTo(b0[0], b0[1]);
          gp.lineTo(a0[0], a0[1]);
          gp.lineTo(d0[0], d0[1]);
        }
        continue;
      }
      fl(x, y, x + 1, y + 1, col);
      if (st3 && floorFinish(ctx4, pt, Z, t, x, y, st3, kind)) continue;
      if (t === "floor_wood") {
        ctx4.strokeStyle = "rgba(70,40,10,0.22)";
        ctx4.lineWidth = Math.max(1, 0.5 * Z);
        ctx4.beginPath();
        for (const v of [0.33, 0.66]) {
          const a = pt(x, y + v), d = pt(x + 1, y + v);
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(d[0], d[1]);
        }
        ctx4.stroke();
      } else if (t === "floor_tile") {
        ctx4.strokeStyle = "rgba(0,0,0,0.10)";
        ctx4.lineWidth = Math.max(1, 0.5 * Z);
        const a = pt(x, y), d = pt(x + 1, y), e = pt(x, y + 1);
        ctx4.beginPath();
        ctx4.moveTo(d[0], d[1]);
        ctx4.lineTo(a[0], a[1]);
        ctx4.lineTo(e[0], e[1]);
        ctx4.stroke();
      } else if (t === "floor_tatami") {
        ctx4.strokeStyle = "rgba(60,80,30,0.45)";
        ctx4.lineWidth = Math.max(1, 0.7 * Z);
        const a = pt(x, y), d = pt(x + 1, y), e = pt(x, y + 1), f2 = pt(x + 1, y + 1);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(d[0], d[1]);
        ctx4.lineTo(f2[0], f2[1]);
        ctx4.lineTo(e[0], e[1]);
        ctx4.closePath();
        ctx4.stroke();
      } else if (t === "exit") {
        fl(x + 0.05, y + 0.1, x + 0.95, y + 0.9, "#a07a4e");
      } else if (t === "floor_marble") {
        ctx4.strokeStyle = "rgba(120,110,95,0.10)";
        ctx4.lineWidth = Math.max(1, 0.5 * Z);
        const a = pt(x, y), d = pt(x + 1, y), e = pt(x, y + 1);
        ctx4.beginPath();
        ctx4.moveTo(d[0], d[1]);
        ctx4.lineTo(a[0], a[1]);
        ctx4.lineTo(e[0], e[1]);
        ctx4.stroke();
      }
    }
    for (const [col, pp] of batch) {
      ctx4.fillStyle = col;
      ctx4.fill(pp);
    }
    if (cAcc) condoFloorFlush(ctx4, cAcc, Z);
    ctx4.lineWidth = Math.max(1, 0.5 * Z);
    if (gridT) {
      ctx4.strokeStyle = "rgba(0,0,0,0.10)";
      ctx4.stroke(gridT);
    }
    if (gridM) {
      ctx4.strokeStyle = "rgba(120,110,95,0.10)";
      ctx4.stroke(gridM);
    }
    const WH = I2.wallH || 3;
    poly4(ctx4, [pt(0, 1, 0), pt(I2.W, 1, 0), pt(I2.W, 1, WH), pt(0, 1, WH)], wc[1]);
    poly4(ctx4, [pt(0, 1, 0), pt(I2.W, 1, 0), pt(I2.W, 1, 0.14), pt(0, 1, 0.14)], mix(wall, "#000000", 0.18));
    poly4(ctx4, [pt(0, 1, 0), pt(0, I2.H, 0), pt(0, I2.H, WH), pt(0, 1, WH)], wc[2]);
    poly4(ctx4, [pt(0, 1, 0), pt(0, I2.H, 0), pt(0, I2.H, 0.14), pt(0, 1, 0.14)], mix(wall, "#000000", 0.34));
    poly4(ctx4, [pt(-0.2, 0.8, WH), pt(I2.W, 0.8, WH), pt(I2.W, 1, WH), pt(-0.2, 1, WH)], wc[0]);
    poly4(ctx4, [pt(-0.2, 0.8, WH), pt(0, 1, WH), pt(0, I2.H, WH), pt(-0.2, I2.H, WH)], wc[0]);
    poly4(ctx4, [pt(-0.2, I2.H, WH), pt(0, I2.H, WH), pt(0, I2.H, 0), pt(-0.2, I2.H, 0)], wc[1]);
    if (st3) drawWallFinishAll(ctx4, pt, Z, I2, WH, st3, kind, wall);
    const winRanges = [];
    const hr = g.S.min / 60 % 24;
    const night = hr < 5.5 || hr >= 18.5;
    const sky = night ? ["#1b2244", "#2a3568"] : hr < 8 || hr >= 17 ? ["#f2c9a0", "#9fcdf0"] : ["#bfe3fa", "#8cc6ee"];
    for (const o of I2.objs) if (o.t === "window" && o.y === 0) {
      const x0 = o.x + 0.1, x1 = o.x + 1.9 > I2.W - 0.2 ? I2.W - 0.2 : o.x + 1.9;
      const z0 = 1, z1 = 2.4;
      const gr = ctx4.createLinearGradient(0, P2.Y(0, 1, z1), 0, P2.Y(0, 1, z0));
      gr.addColorStop(0, sky[1]);
      gr.addColorStop(1, sky[0]);
      if (o.shoji) {
        gr.addColorStop(0, "#f6f1de");
        gr.addColorStop(1, "#ebe4cc");
      }
      poly4(ctx4, [pt(x0, 1, z0), pt(x1, 1, z0), pt(x1, 1, z1), pt(x0, 1, z1)], gr);
      if (o.shoji) {
        ctx4.strokeStyle = "#7a5e3e";
        ctx4.lineWidth = Math.max(1, 0.9 * Z);
        ctx4.beginPath();
        for (let k = 1; k < 5; k++) {
          const xx = x0 + (x1 - x0) * k / 5, q0 = pt(xx, 1, z0), q1 = pt(xx, 1, z1);
          ctx4.moveTo(q0[0], q0[1]);
          ctx4.lineTo(q1[0], q1[1]);
        }
        for (let k = 1; k < 4; k++) {
          const zz = z0 + (z1 - z0) * k / 4, q0 = pt(x0, 1, zz), q1 = pt(x1, 1, zz);
          ctx4.moveTo(q0[0], q0[1]);
          ctx4.lineTo(q1[0], q1[1]);
        }
        ctx4.stroke();
      }
      ctx4.strokeStyle = "#fbfbf6";
      ctx4.lineWidth = Math.max(1.2, 1.1 * Z);
      ctx4.beginPath();
      let a = pt(x0, 1, z0), d = pt(x1, 1, z0), e = pt(x1, 1, z1), f2 = pt(x0, 1, z1);
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.lineTo(e[0], e[1]);
      ctx4.lineTo(f2[0], f2[1]);
      ctx4.closePath();
      const m0 = pt((x0 + x1) / 2, 1, z0), m1 = pt((x0 + x1) / 2, 1, z1);
      ctx4.moveTo(m0[0], m0[1]);
      ctx4.lineTo(m1[0], m1[1]);
      ctx4.stroke();
      if (st3 && !o.shoji) drawWindowFinish(ctx4, pt, Z, x0, x1, z0, z1, st3, kind, b, night, 31 + o.x);
      winRanges.push([x0, x1]);
      if (!night) {
        poly4(ctx4, [pt(x0, 1, 0), pt(x1, 1, 0), pt(x1 + 0.9, 2.4, 0), pt(x0 + 0.9, 2.4, 0)], "rgba(255,248,210,0.10)");
      }
    }
    if (st3) {
      const gaps = [];
      let prev = 0.15;
      winRanges.sort((p02, q0) => p02[0] - q0[0]);
      for (const [a0, a1] of winRanges) {
        if (a0 - prev >= 0.5) gaps.push({ x: prev, w: a0 - prev });
        prev = a1;
      }
      if (I2.W - 0.15 - prev >= 0.5) gaps.push({ x: prev, w: I2.W - 0.15 - prev });
      drawWallDecor(ctx4, pt, Z, I2, st3, kind, b, gaps);
      drawCeilingLights(ctx4, pt, Z, I2, st3, night);
    }
    if (night) {
      const q = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
      const hx2 = [q(0, I2.H, 0), q(I2.W, I2.H, 0), q(I2.W, 1, 0), q(I2.W, 1, 3), q(0, 1, 3), q(0, I2.H, 3)];
      ctx4.save();
      ctx4.beginPath();
      hx2.forEach((p02, i) => i ? ctx4.lineTo(p02[0], p02[1]) : ctx4.moveTo(p02[0], p02[1]));
      ctx4.closePath();
      ctx4.clip();
      ctx4.globalCompositeOperation = "multiply";
      ctx4.fillStyle = "rgb(138,136,180)";
      ctx4.fillRect(0, 0, W2, H4);
      ctx4.globalCompositeOperation = "lighter";
      for (let u = 2; u < I2.W; u += 4) for (let v = 3; v < I2.H; v += 4) {
        const [lx, ly] = q(u, v, 0), rr3 = 4.2 * 16 * Z;
        const gr = ctx4.createRadialGradient(lx, ly, 0, lx, ly, rr3);
        gr.addColorStop(0, "rgba(255,214,150,0.24)");
        gr.addColorStop(1, "rgba(255,214,150,0)");
        ctx4.fillStyle = gr;
        ctx4.fillRect(lx - rr3, ly - rr3, rr3 * 2, rr3 * 2);
      }
      ctx4.restore();
    }
    const items = [];
    const env = { st: st3, P: P2, Z, kind, I: I2, g, b, bt, shop: extras.shop, ctx: ctx4, R: R5, lod: bigI && Z < 2.8 };
    const pad = 5 * Z;
    for (const o of I2.objs) {
      if (o.deco || o.t === "window") continue;
      if (bigI) {
        const cx = P2.X(o.x + (o.w || 1) / 2, o.y + (o.h || 1) / 2);
        if (cx < -40 * Z - (o.w || 1) * 16 * Z || cx > W2 + 40 * Z + (o.w || 1) * 16 * Z) continue;
        const cy = P2.Y(o.x + (o.w || 1) / 2, o.y + (o.h || 1) / 2);
        if (cy < -60 * Z || cy > H4 + 40 * Z) continue;
      }
      const hh = objH(o);
      const x0 = o.x, y0 = o.y, x1 = o.x + (o.w || 1), y1 = o.y + (o.h || 1);
      items.push({ x0, y0, x1, y1, sx0: P2.X(x0, y1) - pad, sx1: P2.X(x1, y0) + pad, sy0: P2.Y(x0, y0, hh) - pad, sy1: P2.Y(x1, y1, 0) + pad, o, draw: (c) => drawObj(c, env, o) });
    }
    const pop = g.world.pop;
    const tr0 = g.S.loc.tr;
    const hz = tr0 && tr0.k === "esc" ? g.S.loc.z || 0 : 0;
    const hideHero = tr0 && tr0.k === "lift" && (tr0.stage === "ride" || tr0.stage === "select" && false);
    const addP = (id, x, y, dir, mv, hero0, pose) => {
      const X = P2.X(x, y), Y2 = P2.Y(x, y) - (hero0 ? hz * 12 * Z : 0);
      const nd = pop.needs[id];
      const look = pop.look[id];
      const age = hero0 ? g.age() : g.ageOf(id);
      const sitB = (hero0 ? R5.heroPose && R5.heroPose.pose === "sit" && (R5.heroPose.k ?? 1) >= 0.35 : pose === "sit") ? 0.5 : 0;
      // 湯船(1マスの湯船と、広い湯船 fx_yubune)
      const tubO = I2.objs.find((o) => (o.t === "bath" || o.t === "rotenbath" || o.t === "fx_yubune") && x >= o.x && x < o.x + (o.w || 1) && y >= o.y && y < o.y + (o.h || 1));
      items.push({ x0: x - 0.2, y0: y - 0.2, x1: x + 0.2 + sitB, y1: y + 0.2 + sitB + (hero0 && tr0 && tr0.k === "esc" ? 3.2 : 0), sx0: X - 9 * Z, sx1: X + 9 * Z, sy0: Y2 - 26 * Z, sy1: Y2 + 3 * Z, isP: true, tub: tubO ? { X, Y: Y2 } : null, isH: !!hero0, draw: (c) => {
        c.fillStyle = "rgba(0,0,0,0.22)";
        c.beginPath();
        c.ellipse(X, Y2, 5.5 * Z, 2.4 * Z, 0, 0, 7);
        c.fill();
        const po = hero0 ? R5.heroPose : pose ? { pose } : null;
        const base = hero0 ? { wheel: !!(nd & 1), cane: !!(nd & 2), id } : { wheel: !!(nd & 1), id };
        if (po && po.pose === "sit") Object.assign(base, { pose: "sit", poseK: po.k ?? 1, seatPx: (P2.Y(x, y, 0.42) - P2.Y(x, y, 0)) * -1, hip: hipFrac(age) });
        R5.drawChar(c, X, Y2, look, age, dir || "d", !!mv, base);
        if (typeof bathTowel === "function") bathTowel(c, I2, x, y, X, Y2, Z, !!tubO);
        if (typeof mourningDress === "function") mourningDress(c, id, X, Y2, Z);
      } });
    };
    const bubbles = [];
    for (const p of people) {
      addP(p.id, p.x, p.y, p.dir, !!p.moving, false, p.pose);
      if (p.say) bubbles.push(p);
    }
    if (!hideHero) addP(g.hero.id, hero.x, hero.y, hero.f, hero.moving, true);
    {
      const ord = depthSort(items);
      const hit2 = ord.find((i) => i.isH);
      const FA = R5._ifa || (R5._ifa = /* @__PURE__ */ new Map());
      const occl = /* @__PURE__ */ new Set();
      let hidden = false;
      if (hit2) {
        const hi2 = ord.indexOf(hit2);
        for (let i = hi2 + 1; i < ord.length; i++) {
          const o = ord[i];
          if (o.o && objH(o.o) >= 1.3 && o.sx0 < hit2.sx1 && o.sx1 > hit2.sx0 && o.sy0 < hit2.sy1 && o.sy1 > hit2.sy0) occl.add(o.o);
        }
      }
      for (const [k, e] of FA) {
        if (occl.has(k)) e.hold = 0.3;
        else e.hold -= dtSec;
        const goal = occl.has(k) || e.hold > 0 ? 0.4 : 1;
        e.a += Math.sign(goal - e.a) * Math.min(Math.abs(goal - e.a), dtSec * (goal < e.a ? 5 : 2.2));
        if (e.a >= 0.999 && !occl.has(k) && e.hold <= 0) FA.delete(k);
      }
      for (const k of occl) if (!FA.has(k)) FA.set(k, { a: 1, hold: 0.3 });
      if (FA.size > 64) FA.clear();
      for (const it of ord) {
        const e = it.o && FA.get(it.o);
        if (e && e.a < 0.999) {
          if (e.a < 0.9) hidden = true;
          ctx4.globalAlpha = e.a;
          it.draw(ctx4);
          ctx4.globalAlpha = 1;
        } else it.draw(ctx4);
        if (it.isP && it.tub) {
          const { X, Y: Y2 } = it.tub, t = performance.now() / 1e3;
          ctx4.save();
          ctx4.fillStyle = "rgba(120,200,224,0.72)";
          ctx4.beginPath();
          ctx4.ellipse(X, Y2 - 8 * Z, 10 * Z, 5 * Z, 0, 0, 7);
          ctx4.fill();
          ctx4.strokeStyle = "rgba(255,255,255,0.75)";
          ctx4.lineWidth = Math.max(1, 0.6 * Z);
          for (let i = 0; i < 2; i++) {
            ctx4.beginPath();
            ctx4.ellipse(X, Y2 - 8 * Z, (6 + i * 3 + Math.sin(t * 2 + i) * 1) * Z, (2.4 + i * 1.2) * Z, 0, 0, 7);
            ctx4.stroke();
          }
          ctx4.restore();
        }
      }
      if (hit2 && hidden) {
        ctx4.strokeStyle = "rgba(255,240,74,0.95)";
        ctx4.lineWidth = Math.max(2, S2 * 0.8);
        const hx2 = (hit2.sx0 + hit2.sx1) / 2, hy = hit2.sy1;
        ctx4.beginPath();
        ctx4.ellipse(hx2, hy, 9 * Z, 4.5 * Z, 0, 0, 7);
        ctx4.stroke();
        ctx4.globalAlpha = 0.9;
        hit2.draw(ctx4);
        ctx4.globalAlpha = 1;
      }
    }
    if (bubbles.length) {
      ctx4.save();
      ctx4.font = `${Math.max(8, 5.5 * Z)}px sans-serif`;
      ctx4.textAlign = "center";
      ctx4.textBaseline = "middle";
      for (const p of bubbles) {
        if (Math.hypot(p.x - hero.x, p.y - hero.y) > 9) continue;
        const X = P2.X(p.x, p.y), Y2 = P2.Y(p.x, p.y) - 31 * Z;
        const t = String(p.say);
        const w = ctx4.measureText(t).width + 8 * Z, h = 12 * Z;
        ctx4.fillStyle = "rgba(255,255,255,0.94)";
        ctx4.strokeStyle = "rgba(60,60,80,0.6)";
        ctx4.lineWidth = 1;
        ctx4.beginPath();
        ctx4.roundRect(X - w / 2, Y2 - h / 2, w, h, 4 * Z);
        ctx4.fill();
        ctx4.stroke();
        ctx4.beginPath();
        ctx4.moveTo(X - 2 * Z, Y2 + h / 2);
        ctx4.lineTo(X, Y2 + h / 2 + 3 * Z);
        ctx4.lineTo(X + 2 * Z, Y2 + h / 2);
        ctx4.fill();
        ctx4.fillStyle = "#222";
        ctx4.fillText(t, X, Y2 + 0.5);
      }
      ctx4.restore();
    }
    {
      const near2 = !hero ? [] : people.map((p) => ({ p, d: Math.hypot(p.x - hero.x, p.y - hero.y) })).filter((q) => q.d <= 5.5 && !q.p.say).sort((a, c) => a.d - c.d).slice(0, 6);
      const jid = (id) => {
        const j = g.world.pop.job[id];
        return j === 255 || j == null ? "" : JOB_KEYS[j];
      };
      const food = bt.cat === "food";
      ctx4.save();
      ctx4.font = `${Math.max(7, 4.6 * Z)}px sans-serif`;
      ctx4.textAlign = "center";
      ctx4.textBaseline = "middle";
      for (const { p, d } of near2) {
        const t = stateLabel(p, jid, food);
        if (!t) continue;
        const X = P2.X(p.x, p.y), Y2 = P2.Y(p.x, p.y) - (p.pose === "sit" ? 22 : 28) * Z;
        const w = ctx4.measureText(t).width + 6 * Z, h = 8.5 * Z;
        ctx4.globalAlpha = Math.max(0.35, 1 - d / 7);
        ctx4.fillStyle = "rgba(20,28,52,0.72)";
        ctx4.beginPath();
        ctx4.roundRect(X - w / 2, Y2 - h / 2, w, h, 3 * Z);
        ctx4.fill();
        ctx4.fillStyle = "#fff";
        ctx4.fillText(t, X, Y2 + 0.3 * Z);
      }
      ctx4.restore();
    }
    if (hero && I2.objs) {
      try {
        drawIndoorGuides(R5, ctx4, P2, hero, I2, g, b);
      } catch (e) {
      }
    }
    if (extras.focus) {
      const f2 = extras.focus;
      ctx4.strokeStyle = "#fff04a";
      ctx4.lineWidth = Math.max(2, S2 * 0.7);
      ctx4.beginPath();
      const a = pt(f2.x, f2.y), d = pt(f2.x + 1, f2.y), e = pt(f2.x + 1, f2.y + 1), h22 = pt(f2.x, f2.y + 1);
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.lineTo(e[0], e[1]);
      ctx4.lineTo(h22[0], h22[1]);
      ctx4.closePath();
      ctx4.stroke();
    }
    {
      const L0 = g.S.loc, key = L0.b + ":" + L0.floor;
      if (R5._ik !== key) {
        R5._ik = key;
        R5.fadeT = 0.35;
      }
      if (R5.fadeT > 0) {
        ctx4.fillStyle = `rgba(0,0,0,${Math.min(0.85, R5.fadeT / 0.35 * 0.85).toFixed(3)})`;
        ctx4.fillRect(0, 0, W2, H4);
        R5.fadeT -= dtSec;
      }
    }
    R5.ioff = { iso: true, x: P2.ox, y: P2.oy, TS: 16 * S2 };
    R5.S = S0;
  }
  function objH(o) {
    switch (o.t) {
      case "screen":
        return 2.8;
      case "lane":
        return 0.5;
      case "treadmill":
        return 1.5;
      case "weights":
        return 1;
      case "fishtank":
        return 2;
      case "cell":
        return 1.9;
      case "firetruck":
        return 1.9;
      case "judgebench":
        return 1.7;
      case "atm":
        return 1.6;
      case "vault":
        return 1.8;
      case "bookcase":
        return 2.3;
      case "showcase":
        return 1.4;
      case "playmat":
        return 0.05;
      case "palrack":
        return 2.7;
      case "pallet":
        return 1.3;
      case "forklift":
        return 1.9;
      case "conveyor":
        return 0.7;
      case "esc":
        return 1.3;
      case "elev":
        return 2.6;
      case "toilet":
        return 2.2;
      case "tsign":
        return 3;
      case "ublock":
        return 3;
      case "mailbank":
      case "parcel":
        return 2;
      case "managerroom":
        return 2.2;
      case "tree":
        return 3.2;
      case "bench":
        return 0.9;
      case "vending":
        return 1.8;
      case "trashroom":
        return 1.6;
      case "bikerack":
        return 1.1;
      case "slide":
        return 1.8;
      case "estair":
        return 2.2;
      case "shelf":
        return 1.4;
      case "fridge":
        return 1.7;
      case "rack":
        return 1.7;
      case "fitting":
        return 2.2;
      case "locker":
        return 1.9;
      case "arcade":
        return 1.9;
      case "board":
        return 2.1;
      case "dirsign":
        return 2.3;
      case "mrack":
        return 1.3;
      case "watersrv":
        return 1.5;
      case "plant":
        return 1.4;
      case "altar":
        return 1.4;
      case "tv":
        return 1.1;
      case "tokonoma":
        return 2;
      case "stairs_up":
      case "stairs_down":
        return 2.3;
      case "mirror":
        return 1.9;
      case "showcar":
        return 1.8;
      default:
        return FXH[o.t] ?? XH[o.t] ?? 1.1;
    }
  }
  function box2(c, P2, x0, y0, x1, y1, z0, z1, base) {
    const [tp, lf, rt] = cols(base);
    const pt = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
    poly4(c, [pt(x0, y1, z0), pt(x1, y1, z0), pt(x1, y1, z1), pt(x0, y1, z1)], lf);
    poly4(c, [pt(x1, y1, z0), pt(x1, y0, z0), pt(x1, y0, z1), pt(x1, y1, z1)], rt);
    poly4(c, [pt(x0, y0, z1), pt(x1, y0, z1), pt(x1, y1, z1), pt(x0, y1, z1)], tp);
  }
  var shadow = (c, P2, x0, y0, x1, y1) => {
    const pt = (u, v) => [P2.X(u, v), P2.Y(u, v)];
    poly4(c, [pt(x0 + 0.05, y0 + 0.1), pt(x1 + 0.12, y0 + 0.1), pt(x1 + 0.12, y1 + 0.12), pt(x0 + 0.05, y1 + 0.12)], "rgba(0,0,0,0.16)");
  };
  var wallPanel = (c, P2, x0, x1, z0, z1, fill, y = 1) => poly4(c, [[P2.X(x0, y), P2.Y(x0, y, z0)], [P2.X(x1, y), P2.Y(x1, y, z0)], [P2.X(x1, y), P2.Y(x1, y, z1)], [P2.X(x0, y), P2.Y(x0, y, z1)]], fill);
  var pick3 = (a, h) => a[h % a.length];
  var R_time = (env) => env.R && env.R.time || 0;
  var GREEN = ["#4f9a54", "#3f8a4a", "#5aa85a"];
  var GAR = ["#d9534f", "#4a7fc8", "#e8c44a", "#58a868", "#9a6ac0", "#e88aa8", "#f08a3c", "#3aa6a0"];
  function drawObj(c, env, o) {
    const { P: P2, Z, kind, I: I2, g, b, bt, st: st3 } = env;
    const x = o.x, y = o.y;
    const h = x * 7 + y * 13 + (b ? b.idx : 0) >>> 0;
    const pt = (u, v, z = 0) => [P2.X(u, v), P2.Y(u, v, z)];
    switch (o.t) {
      case "shelf":
      case "fridge": {
        const cooler = o.t === "fridge";
        const ph = cooler ? 1.6 : 1.5;
        shadow(c, P2, x + 0.05, y + 0.25, x + 0.95, y + 0.85);
        const base = cooler ? "#e8f0f4" : kind === "shop" && b && (b.type === "bookstore" || b.type === "liquor") ? "#8b6b46" : kind === "shop" && b && b.type === "greengrocer" ? "#b88a52" : "#c9ccd2";
        box2(c, P2, x + 0.04, y + 0.3, x + 0.96, y + 0.82, 0, ph, base);
        const fy = y + 0.82;
        poly4(c, [pt(x + 0.1, fy, 0.12), pt(x + 0.9, fy, 0.12), pt(x + 0.9, fy, ph - 0.1), pt(x + 0.1, fy, ph - 0.1)], cooler ? "rgba(150,200,230,0.55)" : "#7f848c");
        const tiers = 3;
        for (let t = 0; t < tiers; t++) {
          const zb = 0.2 + t * 0.43;
          poly4(c, [pt(x + 0.06, fy, zb), pt(x + 0.94, fy, zb), pt(x + 0.94, fy + 0.1, zb), pt(x + 0.06, fy + 0.1, zb - 0)], "#aeb2b9");
        }
        if (env.lod) {
          for (let t = 0; t < 3; t++) {
            const zb = 0.22 + t * 0.43;
            for (let k = 0; k < 3; k++) {
              const u0 = x + 0.12 + k * 0.28;
              poly4(c, [pt(u0, fy + 0.02, zb), pt(u0 + 0.25, fy + 0.02, zb), pt(u0 + 0.25, fy + 0.02, zb + 0.36), pt(u0, fy + 0.02, zb + 0.36)], pick3(GAR, h + t * 7 + k * 3));
            }
          }
          break;
        }
        const lay = env.shop && env.shop.b ? o._lay && o._layM === g.S.M ? o._lay : (() => {
          try {
            o._lay = shelfLayout(g, env.shop.b, env.shop.bt, o, cooler);
          } catch {
            o._lay = [];
          }
          o._layM = g.S.M;
          return o._lay;
        })() : [];
        for (const q of lay) {
          const zb = 0.2 + (2 - q.t) * 0.43 + 0.02;
          const u0 = x + 0.12 + q.k * 0.155;
          if (q.id && hasGlyph(q.id)) {
            const gw = 0.145, gh = q.it.cat === "\u9152" ? 0.39 : 0.35;
            const bl = pt(u0, fy + 0.02, zb), br = pt(u0 + gw, fy + 0.02, zb), tl = pt(u0, fy + 0.02, zb + gh);
            c.save();
            c.transform(br[0] - bl[0], br[1] - bl[1], tl[0] - bl[0], tl[1] - bl[1], bl[0], bl[1]);
            drawGood(c, q.id, q.k + q.t * 3 & 3);
            c.restore();
            continue;
          }
          const w = q.kind === "flat" ? 0.07 : 0.11, hh = q.kind === "bottle" ? 0.36 : q.kind === "flat" ? 0.38 : 0.26;
          const col = q.it.col;
          poly4(c, [pt(u0, fy + 0.02, zb), pt(u0 + w, fy + 0.02, zb), pt(u0 + w, fy + 0.02, zb + hh), pt(u0, fy + 0.02, zb + hh)], col);
          poly4(c, [pt(u0, fy + 0.02, zb + hh), pt(u0 + w, fy + 0.02, zb + hh), pt(u0 + w, fy - 0.05, zb + hh), pt(u0, fy - 0.05, zb + hh)], mix(col, "#ffffff", 0.35));
          if (q.kind === "bottle") poly4(c, [pt(u0 + 0.025, fy + 0.02, zb + hh), pt(u0 + w - 0.025, fy + 0.02, zb + hh), pt(u0 + w - 0.025, fy + 0.02, zb + hh + 0.07), pt(u0 + 0.025, fy + 0.02, zb + hh + 0.07)], "#f0f0f0");
        }
        if (!lay.length && kind === "shop") for (let t = 0; t < 3; t++) for (let k = 0; k < 5; k++) {
          const zb = 0.22 + t * 0.43, u0 = x + 0.12 + k * 0.155;
          poly4(c, [pt(u0, fy + 0.02, zb), pt(u0 + 0.1, fy + 0.02, zb), pt(u0 + 0.1, fy + 0.02, zb + 0.3), pt(u0, fy + 0.02, zb + 0.3)], pick3(GAR, h + t * 5 + k));
        }
        break;
      }
      case "palrack": {
        const hh = o.h || 2;
        shadow(c, P2, x + 0.05, y + 0.1, x + 0.95, y + hh - 0.1);
        for (const u of [x + 0.1, x + 0.9]) for (const v of [y + 0.12, y + hh - 0.12]) box2(c, P2, u - 0.04, v - 0.04, u + 0.04, v + 0.04, 0, 2.6, "#3d6fb5");
        for (const z of [0.45, 1.25, 2.05]) {
          box2(c, P2, x + 0.05, y + 0.08, x + 0.95, y + hh - 0.08, z, z + 0.07, "#e08a2b");
          for (let k = 0; k < hh * 2; k++) {
            if ((h + k + (z * 7 | 0)) % 3 === 0) continue;
            const y0 = y + 0.14 + k * 0.45;
            box2(c, P2, x + 0.18, y0, x + 0.82, y0 + 0.38, z + 0.07, z + 0.45 + (h + k) % 2 * 0.15, pick3(["#d6a74a", "#c9a05a", "#b88a4a"], h + k + (z * 5 | 0)));
          }
        }
        break;
      }
      case "pallet": {
        shadow(c, P2, x + 0.08, y + 0.08, x + 0.92, y + 0.92);
        box2(c, P2, x + 0.08, y + 0.08, x + 0.92, y + 0.92, 0, 0.14, "#b08850");
        for (const [a, b2] of [[0.1, 0.1], [0.5, 0.1], [0.1, 0.5], [0.5, 0.5]]) box2(c, P2, x + a, y + b2, x + a + 0.38, y + b2 + 0.38, 0.14, 0.62 + (h + (a * 10 | 0) + (b2 * 10 | 0)) % 2 * 0.12, pick3(["#d6a74a", "#c9a05a", "#9ec3d8"], h + (a * 10 | 0) + (b2 * 7 | 0)));
        box2(c, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.9, 0.7, 0.74, "rgba(230,236,244,0.85)");
        break;
      }
      case "forklift": {
        shadow(c, P2, x + 0.08, y + 0.1, x + 0.92, y + 0.95);
        box2(c, P2, x + 0.15, y + 0.2, x + 0.85, y + 0.85, 0.2, 0.85, "#e8b82a");
        box2(c, P2, x + 0.15, y + 0.2, x + 0.85, y + 0.35, 0.85, 1, "#2a2f38");
        for (const u of [x + 0.2, x + 0.8]) {
          box2(c, P2, u - 0.04, y + 0.25, u + 0.04, y + 0.3, 0.85, 1.75, "#2a2f38");
          box2(c, P2, u - 0.04, y + 0.75, u + 0.04, y + 0.8, 0.85, 1.75, "#2a2f38");
        }
        box2(c, P2, x + 0.15, y + 0.2, x + 0.85, y + 0.8, 1.75, 1.8, "#e8b82a");
        box2(c, P2, x + 0.22, y + 0.9, x + 0.78, y + 0.98, 0.1, 1.5, "#8a8f98");
        box2(c, P2, x + 0.15, y + 0.88, x + 0.85, y + 0.92, 0.15, 0.2, "#6a6f78");
        for (const [u, v] of [[0.2, 0.2], [0.8, 0.2], [0.2, 0.75], [0.8, 0.75]]) box2(c, P2, x + u - 0.07, y + v - 0.07, x + u + 0.07, y + v + 0.07, 0, 0.2, "#1c1f24");
        break;
      }
      case "conveyor": {
        const w2 = o.w || 3;
        shadow(c, P2, x + 0.05, y + 0.1, x + w2 - 0.05, y + 0.9);
        box2(c, P2, x + 0.05, y + 0.15, x + w2 - 0.05, y + 0.85, 0, 0.5, "#4b5563");
        box2(c, P2, x + 0.05, y + 0.2, x + w2 - 0.05, y + 0.8, 0.5, 0.58, "#2f343b");
        for (let k = 0; k < w2 * 3; k++) box2(c, P2, x + 0.1 + k * 0.33, y + 0.22, x + 0.14 + k * 0.33, y + 0.78, 0.58, 0.6, "#6b7280");
        for (let k = 0; k < w2; k += 1) box2(c, P2, x + 0.2 + k * 0.95, y + 0.3, x + 0.7 + k * 0.95, y + 0.7, 0.58, 0.58 + 0.22 + (h + k) % 2 * 0.1, pick3(["#d6a74a", "#9ec3d8", "#c9ced6"], h + k));
        break;
      }
      case "screen": {
        const w2 = o.w || 6;
        box2(c, P2, x, y + 0.05, x + w2, y + 0.22, 0.3, 2.7, "#15181d");
        const fy = y + 0.22;
        poly4(c, [pt(x + 0.3, fy, 0.5), pt(x + w2 - 0.3, fy, 0.5), pt(x + w2 - 0.3, fy, 2.5), pt(x + 0.3, fy, 2.5)], "#cfd8e0");
        poly4(c, [pt(x + 0.3, fy, 0.5), pt(x + w2 - 0.3, fy, 0.5), pt(x + w2 - 0.3, fy, 1.4), pt(x + 0.3, fy, 1.4)], "rgba(120,150,190,0.35)");
        box2(c, P2, x, y + 0.05, x + 0.28, y + 0.45, 0, 2.7, "#8e2430");
        box2(c, P2, x + w2 - 0.28, y + 0.05, x + w2, y + 0.45, 0, 2.7, "#8e2430");
        break;
      }
      case "lane": {
        const L2 = o.h || 4;
        box2(c, P2, x + 0.05, y, x + 0.95, y + L2, 0, 0.12, "#3a3d44");
        box2(c, P2, x + 0.2, y, x + 0.8, y + L2, 0.12, 0.16, "#d9b27a");
        for (let k = 0; k < L2 * 4; k++) if (k % 3 === 0) box2(c, P2, x + 0.25 + k % 2 * 0.3, y + k * 0.25, x + 0.3 + k % 2 * 0.3, y + k * 0.25 + 0.2, 0.16, 0.165, "#b8905a");
        for (const [u, v] of [[0.5, 0.2], [0.35, 0.35], [0.65, 0.35], [0.2, 0.5], [0.5, 0.5], [0.8, 0.5]]) box2(c, P2, x + u - 0.05, y + v - 0.05, x + u + 0.05, y + v + 0.05, 0.16, 0.5, "#f4f4f0");
        box2(c, P2, x + 0.12, y, x + 0.88, y + 0.12, 0.16, 0.45, "#2a2d34");
        break;
      }
      case "treadmill": {
        shadow(c, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.95);
        box2(c, P2, x + 0.15, y + 0.15, x + 0.85, y + 0.95, 0, 0.22, "#2b2f36");
        box2(c, P2, x + 0.2, y + 0.2, x + 0.8, y + 0.92, 0.22, 0.27, "#5b616c");
        for (const u of [x + 0.18, x + 0.82]) box2(c, P2, u - 0.03, y + 0.15, u + 0.03, y + 0.2, 0.22, 1.3, "#9aa0a8");
        box2(c, P2, x + 0.18, y + 0.14, x + 0.82, y + 0.24, 1, 1.35, "#22252a");
        box2(c, P2, x + 0.3, y + 0.15, x + 0.7, y + 0.2, 1.1, 1.3, "#5aa0c8");
        break;
      }
      case "weights": {
        const w2 = o.w || 2;
        shadow(c, P2, x + 0.1, y + 0.15, x + w2 - 0.1, y + 0.9);
        box2(c, P2, x + 0.3, y + 0.3, x + w2 - 0.3, y + 0.7, 0, 0.4, "#2b2f36");
        box2(c, P2, x + 0.3, y + 0.35, x + w2 - 0.3, y + 0.65, 0.4, 0.5, "#9a2f2f");
        for (const u of [x + 0.4, x + w2 - 0.4]) box2(c, P2, u - 0.04, y + 0.2, u + 0.04, y + 0.25, 0, 1, "#6a6f78");
        box2(c, P2, x + 0.1, y + 0.2, x + w2 - 0.1, y + 0.25, 0.95, 1, "#c9ced6");
        for (const u of [x + 0.15, x + w2 - 0.2]) box2(c, P2, u, y + 0.15, u + 0.07, y + 0.3, 0.82, 1.13, "#1c1f24");
        break;
      }
      case "fishtank": {
        const w2 = o.w || 3;
        shadow(c, P2, x, y + 0.1, x + w2, y + 0.95);
        box2(c, P2, x, y + 0.1, x + w2, y + 0.95, 0, 0.55, "#2b3440");
        box2(c, P2, x, y + 0.1, x + w2, y + 0.95, 1.95, 2.05, "#2b3440");
        const fy = y + 0.95;
        poly4(c, [pt(x + 0.05, fy, 0.55), pt(x + w2 - 0.05, fy, 0.55), pt(x + w2 - 0.05, fy, 1.95), pt(x + 0.05, fy, 1.95)], "rgba(60,150,205,0.78)");
        poly4(c, [pt(x + 0.05, fy, 0.55), pt(x + w2 - 0.05, fy, 0.55), pt(x + w2 - 0.05, fy, 0.8), pt(x + 0.05, fy, 0.8)], "rgba(214,190,130,0.9)");
        for (let k = 0; k < w2 * 2; k++) {
          const fx = x + 0.3 + k * 0.5, fz = 0.95 + (h + k * 3) % 7 * 0.13, q = pt(fx, fy, fz);
          c.fillStyle = pick3(["#f08a3c", "#f4d34a", "#e8e8f0", "#d9534f", "#58a8d8"], h + k);
          c.fillRect(q[0] - 3 * Z, q[1] - 1.6 * Z, 6 * Z, 3.2 * Z);
        }
        break;
      }
      case "cell": {
        const w2 = o.w || 2, h22 = o.h || 2;
        box2(c, P2, x + 0.05, y + 0.05, x + w2 - 0.05, y + h22 - 0.05, 0, 0.12, o.animal != null ? "#8a9a6a" : "#7d8087");
        box2(c, P2, x + 0.05, y + 0.05, x + w2 - 0.05, y + 0.18, 0.12, 1.9, "#9aa0a8");
        box2(c, P2, x + 0.05, y + 0.05, x + 0.18, y + h22 - 0.05, 0.12, 1.9, "#9aa0a8");
        if (o.animal != null) {
          const col = ["#c98a3a", "#7a6a58", "#d8d0b8", "#4a4a4a"][o.animal % 4];
          box2(c, P2, x + 0.5, y + 0.6, x + 1.1, y + 1, 0.12, 0.6, col);
          box2(c, P2, x + 0.95, y + 0.65, x + 1.25, y + 0.95, 0.4, 0.8, col);
        } else {
          box2(c, P2, x + 0.3, y + 0.4, x + w2 - 0.3, y + 0.9, 0.12, 0.45, "#c9ced6");
        }
        const fy = y + h22 - 0.05;
        for (let k = 0; k <= w2 * 3; k++) {
          const u = x + 0.1 + k * ((w2 - 0.2) / (w2 * 3));
          box2(c, P2, u - 0.02, fy - 0.03, u + 0.02, fy, 0.12, 1.9, "#5b606a");
        }
        box2(c, P2, x + 0.05, fy - 0.05, x + w2 - 0.05, fy, 1.8, 1.9, "#5b606a");
        break;
      }
      case "firetruck": {
        const w2 = o.w || 3;
        shadow(c, P2, x + 0.05, y + 0.1, x + w2 - 0.05, y + (o.h || 2) - 0.05);
        const h22 = o.h || 2;
        box2(c, P2, x + 0.1, y + 0.2, x + w2 - 0.1, y + h22 - 0.2, 0.3, 1.25, "#c83232");
        box2(c, P2, x + 0.1, y + 0.2, x + 0.85, y + h22 - 0.2, 1.25, 1.75, "#c83232");
        poly4(c, [pt(x + 0.1, y + h22 - 0.2, 1.3), pt(x + 0.85, y + h22 - 0.2, 1.3), pt(x + 0.85, y + h22 - 0.2, 1.65), pt(x + 0.1, y + h22 - 0.2, 1.65)], "#cfe6f2");
        box2(c, P2, x + 0.12, y + h22 - 0.22, x + w2 - 0.12, y + h22 - 0.2, 0.6, 0.75, "#f4f4f0");
        box2(c, P2, x + 1, y + 0.4, x + w2 - 0.2, y + h22 - 0.4, 1.25, 1.4, "#b8bcc4");
        box2(c, P2, x + 1, y + h22 * 0.5 - 0.06, x + w2 - 0.2, y + h22 * 0.5 + 0.06, 1.4, 1.55, "#8a8f98");
        box2(c, P2, x + 0.3, y + 0.25, x + 0.7, y + 0.4, 1.75, 1.95, "#e8c44a");
        for (const u of [0.5, w2 - 0.6]) for (const v of [0.15, h22 - 0.3]) box2(c, P2, x + u, y + v, x + u + 0.4, y + v + 0.15, 0, 0.45, "#1c1f24");
        break;
      }
      case "judgebench": {
        const w2 = o.w || 3;
        shadow(c, P2, x, y + 0.1, x + w2, y + 0.95);
        box2(c, P2, x, y + 0.1, x + w2, y + 0.95, 0, 1.2, "#6a4a2e");
        box2(c, P2, x - 0.02, y + 0.06, x + w2 + 0.02, y + 0.98, 1.2, 1.3, "#8a6240");
        box2(c, P2, x + w2 / 2 - 0.5, y + 0.15, x + w2 / 2 + 0.5, y + 0.3, 1.3, 1.65, "#3a2a1c");
        box2(c, P2, x + w2 / 2 - 0.1, y + 0.7, x + w2 / 2 + 0.3, y + 0.85, 1.3, 1.34, "#e4e1d8");
        break;
      }
      case "atm": {
        shadow(c, P2, x + 0.12, y + 0.2, x + 0.88, y + 0.85);
        box2(c, P2, x + 0.12, y + 0.2, x + 0.88, y + 0.8, 0, 1.55, "#3c6e50");
        const fy = y + 0.8;
        poly4(c, [pt(x + 0.2, fy, 1), pt(x + 0.8, fy, 1), pt(x + 0.8, fy, 1.45), pt(x + 0.2, fy, 1.45)], "#9fd0e8");
        poly4(c, [pt(x + 0.25, fy, 0.55), pt(x + 0.75, fy, 0.55), pt(x + 0.75, fy, 0.85), pt(x + 0.25, fy, 0.85)], "#d6d9de");
        break;
      }
      case "vault": {
        const w2 = o.w || 2, h22 = o.h || 2;
        shadow(c, P2, x, y, x + w2, y + h22);
        box2(c, P2, x, y, x + w2, y + h22, 0, 1.8, "#6b7078");
        const fy = y + h22;
        const cx = P2.X(x + w2 / 2, fy), cy = P2.Y(x + w2 / 2, fy, 0.9);
        c.fillStyle = "#9aa0a8";
        c.beginPath();
        c.arc(cx, cy, 0.55 * 16 * Z * 0.6, 0, 6.3);
        c.fill();
        c.fillStyle = "#c9ced6";
        c.beginPath();
        c.arc(cx, cy, 0.28 * 16 * Z * 0.6, 0, 6.3);
        c.fill();
        break;
      }
      case "bookcase": {
        const w2 = o.w || 2;
        shadow(c, P2, x + 0.05, y + 0.2, x + w2 - 0.05, y + 0.9);
        box2(c, P2, x + 0.05, y + 0.25, x + w2 - 0.05, y + 0.85, 0, 2.2, "#7a5636");
        const fy = y + 0.85;
        for (const z of [0.15, 0.85, 1.55]) {
          poly4(c, [pt(x + 0.1, fy, z), pt(x + w2 - 0.1, fy, z), pt(x + w2 - 0.1, fy, z + 0.62), pt(x + 0.1, fy, z + 0.62)], "#3d2c1c");
          for (let k = 0; k < w2 * 6; k++) {
            const bx = x + 0.13 + k * ((w2 - 0.26) / (w2 * 6)), q0 = pt(bx, fy, z + 0.03), q1 = pt(bx + 0.13 * (w2 - 0.26) / (w2 * 6) * 6 * 0.9, fy, z + 0.03 + 0.4 + (h + k) % 3 * 0.05);
            c.fillStyle = pick3(["#c8553d", "#4a78a8", "#d8b04a", "#5a9a68", "#8a5aa8", "#e8e0d0", "#3a5a7a"], h + k * 3 + (z * 7 | 0));
            c.fillRect(q0[0], q1[1], Math.max(1, (q1[0] - q0[0]) * 0.8), q0[1] - q1[1]);
          }
        }
        break;
      }
      case "showcase": {
        const w2 = o.w || 2;
        shadow(c, P2, x + 0.05, y + 0.2, x + w2 - 0.05, y + 0.9);
        box2(c, P2, x + 0.05, y + 0.25, x + w2 - 0.05, y + 0.85, 0, 0.7, "#4a3f36");
        const fy = y + 0.85;
        poly4(c, [pt(x + 0.08, fy, 0.7), pt(x + w2 - 0.08, fy, 0.7), pt(x + w2 - 0.08, fy, 1.4), pt(x + 0.08, fy, 1.4)], "rgba(190,225,240,0.5)");
        box2(c, P2, x + 0.05, y + 0.25, x + w2 - 0.05, y + 0.85, 1.38, 1.44, "#4a3f36");
        for (let k = 0; k < w2 * 2; k++) box2(c, P2, x + 0.25 + k * 0.45, y + 0.45, x + 0.5 + k * 0.45, y + 0.65, 0.7, 0.7 + 0.2 + (h + k) % 3 * 0.1, pick3(["#c9a05a", "#7a9ab8", "#b8584a", "#9ab87a"], h + k));
        break;
      }
      case "playmat": {
        const w2 = o.w || 1;
        box2(c, P2, x + 0.08, y + 0.08, x + w2 - 0.08, y + 0.92, 0, 0.04, pick3(["#e8584a", "#4a8ad8", "#e8c44a", "#58b868"], h));
        break;
      }
      case "rack": {
        shadow(c, P2, x + 0.1, y + 0.3, x + 0.9, y + 0.8);
        for (const u of [x + 0.1, x + 0.9]) box2(c, P2, u - 0.03, y + 0.45, u + 0.03, y + 0.5, 0, 1.55, "#8a8f98");
        box2(c, P2, x + 0.08, y + 0.44, x + 0.92, y + 0.52, 1.5, 1.57, "#8a8f98");
        for (let i = 0; i < 6; i++) {
          const u0 = x + 0.14 + i * 0.12, col = pick3(GAR, h + i * 3);
          poly4(c, [pt(u0, y + 0.52, 0.55), pt(u0 + 0.1, y + 0.52, 0.55), pt(u0 + 0.1, y + 0.52, 1.5), pt(u0, y + 0.52, 1.5)], col);
          poly4(c, [pt(u0 + 0.1, y + 0.52, 0.55), pt(u0 + 0.1, y + 0.45, 0.55), pt(u0 + 0.1, y + 0.45, 1.5), pt(u0 + 0.1, y + 0.52, 1.5)], mix(col, "#000000", 0.25));
        }
        break;
      }
      case "fitting": {
        shadow(c, P2, x, y + 0.1, x + 1, y + 0.95);
        box2(c, P2, x + 0.03, y + 0.05, x + 0.97, y + 0.95, 0, 2.1, "#b8997a");
        const fy = y + 0.95;
        poly4(c, [pt(x + 0.1, fy, 0.05), pt(x + 0.9, fy, 0.05), pt(x + 0.9, fy, 1.95), pt(x + 0.1, fy, 1.95)], pick3(GAR, h));
        ctx2(c, "#00000022");
        for (let i = 1; i < 6; i++) {
          const u = x + 0.1 + i * 0.133;
          c.strokeStyle = "rgba(0,0,0,0.2)";
          c.lineWidth = Math.max(1, 0.5 * Z);
          const a = pt(u, fy, 0.05), d = pt(u, fy, 1.95);
          c.beginPath();
          c.moveTo(a[0], a[1]);
          c.lineTo(d[0], d[1]);
          c.stroke();
        }
        break;
      }
      case "hairchair": {
        shadow(c, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.95);
        box2(c, P2, x + 0.38, y + 0.38, x + 0.62, y + 0.62, 0, 0.3, "#8a8f98");
        box2(c, P2, x + 0.14, y + 0.14, x + 0.86, y + 0.8, 0.3, 0.52, "#2c2f3a");
        box2(c, P2, x + 0.14, y + 0.62, x + 0.86, y + 0.8, 0.52, 1.25, "#3a3f4e");
        box2(c, P2, x + 0.08, y + 0.2, x + 0.2, y + 0.7, 0.52, 0.72, "#8a8f98");
        box2(c, P2, x + 0.8, y + 0.2, x + 0.92, y + 0.7, 0.52, 0.72, "#8a8f98");
        box2(c, P2, x + 0.25, y + 0.02, x + 0.75, y + 0.16, 0.05, 0.14, "#b9bdc6");
        try {
          const R5 = env.R;
          const pop = g.world.pop, slot = Math.floor(g.S.min / 45), occ = hash2((b ? b.idx : 0) * 31 + x * 7 + slot, 4460) % 3 !== 0 && g.S.min % 1440 >= 9 * 60 && g.S.min % 1440 < 19 * 60;
          if (occ && R5 && rideReady(R5)) {
            let cid = hash2((b ? b.idx : 0) * 17 + x + slot * 3, 4461) % pop.n;
            for (let q = 0; q < 8 && (pop.gone[cid] || g.ageOf(cid) < 6); q++) cid = (cid + 977) % pop.n;
            const spec = riderColors(R5, cid, pop.look[cid], g.ageOf(cid));
            const hx2 = P2.X(x + 0.5, y + 0.55), hy = P2.Y(x + 0.5, y + 0.55, 1.25);
            box2(c, P2, x + 0.18, y + 0.3, x + 0.82, y + 0.78, 0.45, 1.05, "#eceaf2");
            drawBust(R5, c, spec, "B", hx2, hy + 6 * Z, RIDE_UNIT.bust * Z * 0.75, { flip: false });
          }
        } catch (e) {
        }
        break;
      }
      case "basin": {
        shadow(c, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.9);
        box2(c, P2, x + 0.2, y + 0.2, x + 0.8, y + 0.8, 0, 0.8, "#e9ecef");
        box2(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 0.8, 0.86, "#8fb4c8");
        break;
      }
      case "mirror": {
        box2(c, P2, x + 0.2, y + 0.4, x + 0.8, y + 0.5, 0, 1.8, "#7a6046");
        const fy = y + 0.5;
        poly4(c, [pt(x + 0.28, fy, 0.15), pt(x + 0.72, fy, 0.15), pt(x + 0.72, fy, 1.7), pt(x + 0.28, fy, 1.7)], "#cfe2ea");
        break;
      }
      case "counter": {
        shadow(c, P2, x, y + 0.1, x + 1, y + 0.9);
        box2(c, P2, x, y + 0.1, x + 1, y + 0.9, 0, 0.95, kind === "food" ? "#7a5a3a" : "#6c7078");
        box2(c, P2, x - 0.01, y + 0.06, x + 1.01, y + 0.94, 0.95, 1.02, kind === "food" ? "#a67c52" : "#e4e1d8");
        if (kind === "hospital" && o.act === "clinic" && /受付|会計/.test(o.label || "") && !I2.objs.some((q) => q.t === "counter" && q.label === o.label && q.y === o.y && q.x === o.x - 1)) {
          box2(c, P2, x + 0.2, y + 0.3, x + 0.7, y + 0.6, 1.02, 1.3, "#2d3138");
          poly4(c, [pt(x + 0.22, y + 0.6, 1.1), pt(x + 0.68, y + 0.6, 1.1), pt(x + 0.68, y + 0.6, 1.28), pt(x + 0.22, y + 0.6, 1.28)], "#9fd0ea");
          const sg = pt(x + 0.5, y + 0.94, 0.5);
          c.save();
          c.fillStyle = "#2a58a0";
          c.fillRect(sg[0] - 9 * Z, sg[1] - 3.2 * Z, 18 * Z, 6.4 * Z);
          c.fillStyle = "#fff";
          c.font = `bold ${Math.max(6, 4.6 * Z)}px sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(/会計/.test(o.label) ? "\u4F1A\u8A08" : "\u53D7\u4ED8", sg[0], sg[1]);
          c.restore();
        }
        break;
      }
      case "dirsign": {
        shadow(c, P2, x + 0.1, y + 0.3, x + 0.9, y + 0.8);
        box2(c, P2, x + 0.15, y + 0.3, x + 0.85, y + 0.7, 0, 2.3, "#d9d6cb");
        const fy = y + 0.7;
        poly4(c, [pt(x + 0.2, fy, 0.9), pt(x + 0.8, fy, 0.9), pt(x + 0.8, fy, 2.2), pt(x + 0.2, fy, 2.2)], "#27456f");
        c.save();
        c.fillStyle = "#fff";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = `bold ${Math.max(5, 3.6 * Z)}px sans-serif`;
        (o.signText ? o.signText.split("|") : ["\u8A3A\u5BDF\u5BA4", "2F\u75C5\u68DF", "EV \u25B6"]).forEach((t, i) => {
          const q = pt(x + 0.5, fy, 1.9 - i * 0.4);
          c.fillText(t, q[0], q[1]);
        });
        c.restore();
        break;
      }
      case "mrack": {
        shadow(c, P2, x + 0.1, y + 0.2, x + 0.9, y + 0.85);
        box2(c, P2, x + 0.15, y + 0.3, x + 0.85, y + 0.75, 0, 1.3, "#a67c52");
        const fy = y + 0.75;
        ["#d9534f", "#4a7fc8", "#e8c44a", "#58a868", "#e88aa8", "#f08a3c"].forEach((col, i) => {
          const u = x + 0.2 + i % 3 * 0.2, z0 = 0.35 + Math.floor(i / 3) * 0.5;
          poly4(c, [pt(u, fy, z0), pt(u + 0.16, fy, z0), pt(u + 0.16, fy, z0 + 0.4), pt(u, fy, z0 + 0.4)], col);
        });
        break;
      }
      case "watersrv": {
        shadow(c, P2, x + 0.2, y + 0.3, x + 0.8, y + 0.8);
        box2(c, P2, x + 0.25, y + 0.35, x + 0.75, y + 0.75, 0, 1, "#eef1f3");
        box2(c, P2, x + 0.3, y + 0.4, x + 0.7, y + 0.7, 1, 1.5, "#9fd8f0");
        box2(c, P2, x + 0.4, y + 0.75, x + 0.6, y + 0.8, 0.5, 0.65, "#3a7ad0");
        break;
      }
      case "clock": {
        const a = pt(x + 0.5, 0.98, 1.9);
        c.save();
        c.fillStyle = "#fbfaf3";
        c.strokeStyle = "#3a3a3a";
        c.lineWidth = Math.max(1, 0.7 * Z);
        c.beginPath();
        c.arc(a[0], a[1], 5 * Z, 0, 7);
        c.fill();
        c.stroke();
        const mm = g.S.min, ha = mm / 60 % 12 / 12 * 6.283 - 1.5708, ma = mm % 60 / 60 * 6.283 - 1.5708;
        c.beginPath();
        c.moveTo(a[0], a[1]);
        c.lineTo(a[0] + Math.cos(ha) * 2.6 * Z, a[1] + Math.sin(ha) * 2.6 * Z);
        c.moveTo(a[0], a[1]);
        c.lineTo(a[0] + Math.cos(ma) * 4 * Z, a[1] + Math.sin(ma) * 4 * Z);
        c.stroke();
        c.restore();
        break;
      }
      case "curtain": {
        const w = o.w || 2;
        for (let i = 0; i < w * 4; i++) {
          const u0 = x + i * 0.25;
          poly4(c, [pt(u0, 0.97, 0.7), pt(u0 + 0.25, 0.97, 0.7), pt(u0 + 0.25, 0.97, 2.3), pt(u0, 0.97, 2.3)], i % 2 ? "#a9d4c0" : "#bfe3d1");
        }
        poly4(c, [pt(x, 0.96, 2.3), pt(x + w, 0.96, 2.3), pt(x + w, 0.96, 2.38), pt(x, 0.96, 2.38)], "#8a8f95");
        break;
      }
      case "handrail": {
        poly4(c, [pt(x, 0.97, 0.85), pt(x + (o.w || 1), 0.97, 0.85), pt(x + (o.w || 1), 0.97, 0.95), pt(x, 0.97, 0.95)], "#c79a5e");
        break;
      }
      case "register": {
        box2(c, P2, x + 0.05, y + 0.1, x + 0.95, y + 0.9, 0, 0.95, "#6c7078");
        box2(c, P2, x, y + 0.06, x + 1, y + 0.94, 0.95, 1.02, "#e4e1d8");
        box2(c, P2, x + 0.25, y + 0.3, x + 0.7, y + 0.7, 1.02, 1.2, "#2d3138");
        const fy = y + 0.7;
        poly4(c, [pt(x + 0.3, fy, 1.2), pt(x + 0.66, fy, 1.2), pt(x + 0.66, fy, 1.5), pt(x + 0.3, fy, 1.5)], "#86c4e8");
        break;
      }
      case "desk": {
        shadow(c, P2, x + 0.1, y + 0.2, x + 0.9, y + 0.85);
        for (const [u, v] of [[0.12, 0.2], [0.82, 0.2], [0.12, 0.8], [0.82, 0.8]]) box2(c, P2, x + u, y + v, x + u + 0.06, y + v + 0.06, 0, 0.72, "#6f5238");
        box2(c, P2, x + 0.08, y + 0.15, x + 0.92, y + 0.88, 0.72, 0.78, kind === "school" ? "#c8a878" : "#b58b5a");
        if (kind === "office") {
          const yr = g.year();
          if (yr >= PC_YEAR) {
            const crt = yr < FLATPANEL_YEAR;
            box2(c, P2, x + 0.3, y + 0.22, x + 0.7, y + (crt ? 0.5 : 0.35), 0.78, crt ? 1.22 : 1.15, crt ? "#c9c4b0" : "#2d3138");
            if (crt) box2(c, P2, x + 0.34, y + 0.5, x + 0.66, y + 0.52, 0.86, 1.14, "#1f2a2a");
            box2(c, P2, x + 0.32, y + 0.55, x + 0.68, y + 0.72, 0.78, 0.82, "#d8d4c4");
          } else {
            box2(c, P2, x + 0.28, y + 0.3, x + 0.66, y + 0.66, 0.78, 0.8, "#f4f1e8");
            box2(c, P2, x + 0.7, y + 0.25, x + 0.82, y + 0.37, 0.78, 0.92, "#2a2a30");
            box2(c, P2, x + 0.2, y + 0.55, x + 0.34, y + 0.7, 0.78, 0.86, "#c9a14a");
          }
        } else box2(c, P2, x + 0.3, y + 0.3, x + 0.62, y + 0.62, 0.78, 0.83, "#f4f1e8");
        break;
      }
      case "table": {
        const lowT = kind === "home" && !(b && b.type === "restaurant");
        const zt = lowT ? 0.38 : 0.74;
        shadow(c, P2, x + 0.1, y + 0.1, x + 0.95, y + 0.95);
        box2(c, P2, x + 0.45, y + 0.45, x + 0.55, y + 0.55, 0, zt, "#6f5238");
        box2(c, P2, x + 0.05, y + 0.05, x + 0.95, y + 0.95, zt, zt + 0.06, "#b58b5a");
        break;
      }
      case "chair":
      case "seat": {
        box2(c, P2, x + 0.25, y + 0.25, x + 0.75, y + 0.75, 0.38, 0.45, o.t === "seat" ? "#2f6a90" : "#8a6a46");
        for (const [u, v] of [[0.28, 0.28], [0.68, 0.28], [0.28, 0.68], [0.68, 0.68]]) box2(c, P2, x + u, y + v, x + u + 0.05, y + v + 0.05, 0, 0.38, "#5a4630");
        box2(c, P2, x + 0.25, y + 0.22, x + 0.75, y + 0.28, 0.45, 0.95, o.t === "seat" ? "#2f6a90" : "#8a6a46");
        break;
      }
      case "sofa": {
        shadow(c, P2, x, y + 0.15, x + 1, y + 0.9);
        box2(c, P2, x + 0.02, y + 0.1, x + 0.98, y + 0.92, 0, 0.42, "#a14a4a");
        box2(c, P2, x + 0.02, y + 0.1, x + 0.98, y + 0.3, 0.42, 0.95, "#8c3d3d");
        box2(c, P2, x + 0.02, y + 0.1, x + 0.16, y + 0.92, 0.42, 0.7, "#8c3d3d");
        box2(c, P2, x + 0.84, y + 0.1, x + 0.98, y + 0.92, 0.42, 0.7, "#8c3d3d");
        break;
      }
      case "bed":
      case "hospital_bed": {
        const hosp = o.t === "hospital_bed";
        shadow(c, P2, x, y + 0.05, x + 1, y + 0.98);
        box2(c, P2, x + 0.04, y + 0.04, x + 0.96, y + 0.98, 0, 0.32, hosp ? "#aab3bc" : "#8a6a46");
        box2(c, P2, x + 0.08, y + 0.1, x + 0.92, y + 0.95, 0.32, 0.5, hosp ? "#f2f6f8" : pick3(["#6f8fcf", "#cf7f9a", "#7fbf8a", "#d8b058"], h));
        box2(c, P2, x + 0.14, y + 0.12, x + 0.86, y + 0.34, 0.5, 0.62, "#f7f5ee");
        break;
      }
      case "tv": {
        box2(c, P2, x + 0.15, y + 0.3, x + 0.85, y + 0.7, 0, 0.42, "#6f5238");
        box2(c, P2, x + 0.18, y + 0.38, x + 0.82, y + 0.56, 0.42, 1.08, "#22252a");
        const fy = y + 0.56;
        poly4(c, [pt(x + 0.22, fy, 0.5), pt(x + 0.78, fy, 0.5), pt(x + 0.78, fy, 1.02), pt(x + 0.22, fy, 1.02)], "#5aa0c8");
        break;
      }
      case "sink": {
        box2(c, P2, x + 0.05, y + 0.1, x + 0.95, y + 0.9, 0, 0.88, "#d8dadd");
        box2(c, P2, x + 0.03, y + 0.08, x + 0.97, y + 0.92, 0.88, 0.94, "#c8ccd0");
        box2(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 0.9, 0.95, "#8ab4d0");
        box2(c, P2, x + 0.46, y + 0.12, x + 0.52, y + 0.2, 0.94, 1.22, "#b8bcc0");
        break;
      }
      case "plant": {
        box2(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 0, 0.35, "#9a5b3a");
        const t0 = pt(x + 0.5, y + 0.5, 0.35);
        for (let i = 0; i < 6; i++) {
          const a = i * 1.047 + h % 5, r = (0.45 + i % 2 * 0.15) * 8 * Z;
          c.fillStyle = i % 2 ? "#3f9a4a" : "#56b05a";
          c.beginPath();
          c.ellipse(t0[0] + Math.cos(a) * r * 0.6, t0[1] - (0.45 + i % 3 * 0.22) * 12 * Z + Math.sin(a) * r * 0.25, 3.6 * Z, 5.2 * Z, Math.cos(a) * 0.7, 0, 7);
          c.fill();
        }
        break;
      }
      case "locker": {
        box2(c, P2, x + 0.08, y + 0.2, x + 0.92, y + 0.85, 0, 1.85, "#7e8a98");
        const fy = y + 0.85;
        for (let i = 0; i < 3; i++) {
          const u = x + 0.12 + i * 0.26;
          poly4(c, [pt(u, fy, 0.1), pt(u + 0.22, fy, 0.1), pt(u + 0.22, fy, 1.8), pt(u, fy, 1.8)], "#9aa7b6");
          poly4(c, [pt(u + 0.17, fy, 0.9), pt(u + 0.2, fy, 0.9), pt(u + 0.2, fy, 1.05), pt(u + 0.17, fy, 1.05)], "#444");
        }
        break;
      }
      case "board": {
        const kind2 = o.label && /黒板/.test(o.label);
        wallPanel(c, P2, x + 0.05, x + 0.95 + (kind2 ? 1.6 : 0), 0.95, 2.1, kind2 ? "#26493a" : "#c9a36a", 1);
        wallPanel(c, P2, x + 0.12, x + 0.88 + (kind2 ? 1.5 : 0), 1.05, 2, kind2 ? "#2f5d49" : "#f1ead6", 1);
        break;
      }
      case "altar": {
        box2(c, P2, x - 0.4, y + 0.1, x + 1.4, y + 0.95, 0, 0.3, "#8a6a46");
        box2(c, P2, x - 0.1, y + 0.2, x + 1.1, y + 0.85, 0.3, 0.6, "#a14a3a");
        box2(c, P2, x + 0.15, y + 0.3, x + 0.85, y + 0.75, 0.6, 1.2, "#d4af58");
        break;
      }
      case "pwall": {
        box2(c, P2, x, y, x + 1, y + 1, 0, 1.15, "#ddd8c6");
        box2(c, P2, x, y, x + 1, y + 1, 1, 1.15, "#b9b39e");
        break;
      }
      // 教室の間仕切り(腰高。机と生徒が見えるように)
      case "kokuban": {
        const w = o.w || 3;
        shadow(c, P2, x, y + 0.2, x + w, y + 0.5);
        box2(c, P2, x + 0.04, y + 0.1, x + w - 0.04, y + 0.3, 0.7, 2.1, "#6b5a3a");
        box2(c, P2, x + 0.12, y + 0.3, x + w - 0.12, y + 0.34, 0.85, 1.95, "#2f5d49");
        box2(c, P2, x + 0.2, y + 0.34, x + 0.9, y + 0.37, 0.7, 0.76, "#f2f2ee");
        break;
      }
      case "podium": {
        box2(c, P2, x + 0.1, y + 0.15, x + 0.9, y + 0.8, 0, 0.95, "#a8814f");
        box2(c, P2, x + 0.05, y + 0.1, x + 0.95, y + 0.85, 0.95, 1.02, "#8a6a3f");
        break;
      }
      case "noren": {
        const male = /男/.test(o.label || ""), lobby = /ロビー/.test(o.label || "");
        const col = lobby ? "#6b5a48" : male ? "#2f5fa8" : "#c0405a";
        box2(c, P2, x + 0.05, y + 0.1, x + 0.12, y + 0.9, 0, 2.1, "#6a4a2a");
        box2(c, P2, x + 0.88, y + 0.1, x + 0.95, y + 0.9, 0, 2.1, "#6a4a2a");
        for (let i = 0; i < 3; i++) poly4(c, [pt(x + 0.14 + i * 0.25, y + 0.5, 1), pt(x + 0.36 + i * 0.25, y + 0.5, 1), pt(x + 0.36 + i * 0.25, y + 0.5, 1.9), pt(x + 0.14 + i * 0.25, y + 0.5, 1.9)], col);
        if (!lobby) {
          c.save();
          c.fillStyle = "#fff";
          c.font = `${Math.max(7, 0.6 * Z * 12)}px sans-serif`;
          c.textAlign = "center";
          c.fillText(male ? "\u7537" : "\u5973", P2.X(x + 0.5, y + 0.5), P2.Y(x + 0.5, y + 0.5, 1.5));
          c.restore();
        }
        break;
      }
      case "wash": {
        box2(c, P2, x + 0.15, y + 0.55, x + 0.45, y + 0.85, 0, 0.28, "#d9b88a");
        box2(c, P2, x + 0.55, y + 0.6, x + 0.85, y + 0.85, 0, 0.18, "#e8c15a");
        box2(c, P2, x + 0.4, y + 0.1, x + 0.6, y + 0.2, 0.7, 0.8, "#b9c2c9");
        box2(c, P2, x + 0.46, y + 0.1, x + 0.54, y + 0.18, 0.2, 0.7, "#9aa4ad");
        break;
      }
      case "rock": {
        shadow(c, P2, x + 0.1, y + 0.2, x + 0.9, y + 0.9);
        const blob = (u, v, z, rx, ry, col, hi2) => {
          const a = pt(u, v, z);
          c.fillStyle = col;
          c.beginPath();
          c.ellipse(a[0], a[1], rx * Z, ry * Z, 0, 0, 7);
          c.fill();
          c.fillStyle = hi2;
          c.beginPath();
          c.ellipse(a[0] - rx * Z * 0.25, a[1] - ry * Z * 0.35, rx * Z * 0.55, ry * Z * 0.4, 0, 0, 7);
          c.fill();
        };
        blob(x + 0.35, y + 0.65, 0.35, 7.5, 6.5, "#7b7872", "#9a978f");
        blob(x + 0.7, y + 0.55, 0.3, 6.5, 5.5, "#85827b", "#a6a39a");
        blob(x + 0.5, y + 0.4, 0.75, 5, 4.5, "#6f6c66", "#928f87");
        break;
      }
      case "fence": {
        for (let i = 0; i < 6; i++) {
          box2(c, P2, x + 0.03 + i * 0.16, y + 0.42, x + 0.12 + i * 0.16, y + 0.55, 0, 1.4, i % 2 ? "#c8b46a" : "#b9a45a");
        }
        box2(c, P2, x, y + 0.38, x + 1, y + 0.6, 0.35, 0.46, "#6a4a2a");
        box2(c, P2, x, y + 0.38, x + 1, y + 0.6, 1.1, 1.2, "#6a4a2a");
        break;
      }
      case "rotenview": {
        const w = o.w || 4, night = g.S.min / 60 % 24 < 5.5 || g.S.min / 60 % 24 >= 18.5, X0 = x, X1 = x + w;
        const t = performance.now() / 1e3;
        poly4(c, [pt(X0, 0.98, 0.2), pt(X1, 0.98, 0.2), pt(X1, 0.98, 3), pt(X0, 0.98, 3)], night ? "#141b3a" : "#a9d8f2");
        if (night) {
          c.fillStyle = "#fffbe0";
          const m = pt(X0 + w * 0.72, 0.98, 2.4);
          c.beginPath();
          c.arc(m[0], m[1], 4.5 * Z, 0, 7);
          c.fill();
          c.fillStyle = "#141b3a";
          c.beginPath();
          c.arc(m[0] + 2 * Z, m[1] - 1 * Z, 4 * Z, 0, 7);
          c.fill();
          for (let i = 0; i < 9; i++) {
            const a = pt(X0 + 0.3 + (i * 0.37 + h % 5 * 0.11) % (w - 0.4), 0.98, 1.6 + i * 0.53 % 1.3);
            c.fillStyle = `rgba(255,255,255,${(0.5 + 0.4 * Math.sin(t * 1.5 + i)).toFixed(2)})`;
            c.fillRect(a[0], a[1], Math.max(1, Z * 0.6), Math.max(1, Z * 0.6));
          }
        }
        for (let i = 0; i < Math.ceil(w * 1.4); i++) {
          const u = X0 + 0.3 + i * 0.7, a = pt(u, 0.98, 1.2), r = (7 + (i * 5 + h) % 4) * Z;
          c.fillStyle = night ? "#16301f" : "#3d8a4a";
          c.beginPath();
          c.arc(a[0], a[1] - r * 0.6, r, 0, 7);
          c.fill();
          c.fillStyle = night ? "#1d3d28" : "#5aa85a";
          c.beginPath();
          c.arc(a[0] - r * 0.3, a[1] - r * 0.9, r * 0.6, 0, 7);
          c.fill();
          c.fillStyle = night ? "#2a1d12" : "#5b3f26";
          c.fillRect(a[0] - Z * 0.8, a[1] - r * 0.1, Z * 1.6, r * 0.9);
        }
        poly4(c, [pt(X0, 0.98, 0.2), pt(X1, 0.98, 0.2), pt(X1, 0.98, 1), pt(X0, 0.98, 1)], night ? "#2a2a24" : "#b9a45a");
        break;
      }
      case "lamp": {
        box2(c, P2, x + 0.4, y + 0.4, x + 0.6, y + 0.6, 0, 0.9, "#6a4a2a");
        box2(c, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 0.9, 1.35, g && g.S.min >= 17 * 60 || g && g.S.min < 6 * 60 ? "#ffd27a" : "#e9d9b0");
        break;
      }
      case "rotenbath": {
        box2(c, P2, x - 0.02, y + 0.05, x + 1.02, y + 0.98, 0, 0.5, "#7f7c74");
        box2(c, P2, x + 0.1, y + 0.15, x + 0.92, y + 0.9, 0.48, 0.54, "#78c6dc");
        const t = performance.now() / 1e3;
        c.save();
        c.strokeStyle = "rgba(255,255,255,0.55)";
        c.lineWidth = Math.max(1, Z * 0.5);
        for (let i = 0; i < 2; i++) {
          const a = pt(x + 0.3 + i * 0.3 + Math.sin(t + h + i) * 0.05, y + 0.5 + i * 0.12, 0.56);
          c.beginPath();
          c.ellipse(a[0], a[1], 5 * Z, 1.8 * Z, 0, 0, 7);
          c.stroke();
        }
        c.restore();
        for (let i = 0; i < 3; i++) {
          const ph = (t * 0.35 + i / 3 + h % 7 / 7) % 1;
          const a = pt(x + 0.25 + i * 0.25, y + 0.5, 0.6 + ph * 1.6);
          c.fillStyle = `rgba(255,255,255,${(0.5 * (1 - ph)).toFixed(2)})`;
          c.beginPath();
          c.arc(a[0] + Math.sin(t * 2 + i) * 2 * Z, a[1], (3 + ph * 4) * Z, 0, 7);
          c.fill();
        }
        break;
      }
      case "bath": {
        box2(c, P2, x + 0.02, y + 0.05, x + 0.98, y + 0.95, 0, 0.55, o.tub === "hinoki" ? "#c79a5e" : "#d8dee2");
        if (o.tub) {
          const t = performance.now() / 1e3, ph = (t * 0.3 + h % 5 / 5) % 1, a = pt(x + 0.5, y + 0.5, 0.7 + ph * 1.4);
          c.fillStyle = `rgba(255,255,255,${(0.45 * (1 - ph)).toFixed(2)})`;
          c.beginPath();
          c.arc(a[0], a[1], (3 + ph * 4) * Z, 0, 7);
          c.fill();
        }
        box2(c, P2, x + 0.12, y + 0.15, x + 0.88, y + 0.85, 0.5, 0.56, "#6cbfe0");
        break;
      }
      case "arcade": {
        box2(c, P2, x + 0.12, y + 0.2, x + 0.88, y + 0.8, 0, 1.75, "#3b3e66");
        const fy = y + 0.8;
        poly4(c, [pt(x + 0.2, fy, 1), pt(x + 0.8, fy, 1), pt(x + 0.8, fy, 1.6), pt(x + 0.2, fy, 1.6)], "#58d0f0");
        poly4(c, [pt(x + 0.2, fy, 0.8), pt(x + 0.8, fy, 0.8), pt(x + 0.8, fy, 0.95), pt(x + 0.2, fy, 0.95)], "#e85a5a");
        break;
      }
      case "stairs_up": {
        shadow(c, P2, x + 0.05, y + 0.1, x + 0.95, y + 1);
        const N2 = 7;
        for (let i = 0; i < N2; i++) {
          const v0 = y + 0.04 + i * 0.13, zz = 2.55 - i * 0.36;
          box2(c, P2, x + 0.06, v0, x + 0.94, v0 + 0.13, 0, zz, i % 2 ? "#c4b394" : "#b6a58a");
        }
        poly4(c, [pt(x + 0.06, y + 0.95, 0), pt(x + 0.06, y + 0.04, 2.6), pt(x + 0.06, y + 0.04, 2.7), pt(x + 0.06, y + 0.95, 0.12)], "#7a6a52");
        poly4(c, [pt(x + 0.94, y + 0.95, 0), pt(x + 0.94, y + 0.04, 2.6), pt(x + 0.94, y + 0.04, 2.7), pt(x + 0.94, y + 0.95, 0.12)], "#8a7a60");
        const ap = pt(x + 0.5, y + 1.25, 0);
        c.fillStyle = "rgba(255,240,150,0.9)";
        c.beginPath();
        c.moveTo(ap[0], ap[1] - 3 * Z);
        c.lineTo(ap[0] + 4 * Z, ap[1] + 1 * Z);
        c.lineTo(ap[0] - 4 * Z, ap[1] + 1 * Z);
        c.closePath();
        c.fill();
        break;
      }
      case "stairs_down": {
        poly4(c, [pt(x + 0.05, y + 0.05), pt(x + 0.95, y + 0.05), pt(x + 0.95, y + 0.95), pt(x + 0.05, y + 0.95)], "#2a2622");
        for (let i = 0; i < 4; i++) poly4(c, [pt(x + 0.1, y + 0.15 + i * 0.2), pt(x + 0.9, y + 0.15 + i * 0.2), pt(x + 0.9, y + 0.27 + i * 0.2), pt(x + 0.1, y + 0.27 + i * 0.2)], i % 2 ? "#4a4238" : "#3a342c");
        for (const xx of [x + 0.05, x + 0.95]) {
          poly4(c, [pt(xx, y + 0.95, 0), pt(xx, y + 0.95, 0.95), pt(xx, y + 0.95, 1), pt(xx, y + 0.95, 0)], "#9aa0a8");
          poly4(c, [pt(xx, y + 0.05, 0.95), pt(xx, y + 0.95, 0.95), pt(xx, y + 0.95, 1), pt(xx, y + 0.05, 1)], "#c9ced6");
        }
        const ap = pt(x + 0.5, y + 1.25, 0);
        c.fillStyle = "rgba(150,220,255,0.9)";
        c.beginPath();
        c.moveTo(ap[0], ap[1] + 1 * Z);
        c.lineTo(ap[0] + 4 * Z, ap[1] - 3 * Z);
        c.lineTo(ap[0] - 4 * Z, ap[1] - 3 * Z);
        c.closePath();
        c.fill();
        break;
      }
      case "showcar": {
        const R5 = env.R;
        const yr = g.year();
        const used = b && b.type === "usedcar";
        let ty = "compact", col = ((b ? b.idx : 0) * 5 + (o.slot || 0) * 3) % CAR_COLORS.length;
        if (!used) {
          try {
            const st4 = newStock(g, yr);
            const m = st4[((b ? b.idx : 0) + (o.slot || 0) * 2) % st4.length];
            const mm = m && (MODEL[m.id] || m);
            ty = mm && mm.type || "compact";
          } catch {
          }
        } else ty = ["kei", "compact", "sedan", "minivan", "suv", "compact"][((b ? b.idx : 0) + (o.slot || 0) * 5) % 6];
        if (o.cartype) ty = o.cartype;
        if (o.colIdx != null) col = o.colIdx % CAR_COLORS.length;
        const era = yr < 2e3 ? 0 : yr < 2015 ? 1 : 2;
        const key = `${ty}|${era}|${col}|${Z}`;
        R5.isp = R5.isp || /* @__PURE__ */ new Map();
        let sp = R5.isp.get(key);
        if (!sp) {
          sp = vehicleSprite(ty, era, col, 1, Z, CAR_COLORS);
          R5.isp.set(key, sp);
          if (R5.isp.size > 80) R5.isp.clear();
        }
        const cx = x + o.w / 2, cy = y + o.h / 2;
        poly4(c, [pt(x + 0.05, y + 0.05), pt(x + o.w - 0.05, y + 0.05), pt(x + o.w - 0.05, y + o.h - 0.05), pt(x + 0.05, y + o.h - 0.05)], "rgba(120,130,150,0.28)");
        poly4(c, [pt(x + 0.05, y + o.h - 0.05, 0), pt(x + o.w - 0.05, y + o.h - 0.05, 0), pt(x + o.w - 0.05, y + o.h - 0.05, 0.08), pt(x + 0.05, y + o.h - 0.05, 0.08)], "#b9bec8");
        c.drawImage(sp.cv, P2.X(cx, cy) - sp.ax, P2.Y(cx, cy) - sp.ay);
        const pp = pt(x + o.w + 0.05, y + 0.3, 0.9);
        c.fillStyle = "#fff";
        c.fillRect(pp[0] - 3 * Z, pp[1] - 2 * Z, 6 * Z, 4 * Z);
        c.fillStyle = "#d63a2f";
        c.fillRect(pp[0] - 3 * Z, pp[1] - 2 * Z, 6 * Z, 1.2 * Z);
        break;
      }
      case "esc": {
        const up = o.dir === "up";
        const hgt = 0.9;
        shadow(c, P2, x, y, x + 1, y + 3);
        box2(c, P2, x + 0.08, y + 0.02, x + 0.92, y + 2.98, 0, 0.3, "#5d646e");
        const ph = R_time(env) * 0.55 % 1;
        for (let i = -1; i < 7; i++) {
          const t0 = (i + (up ? -ph : ph)) * 0.5;
          const v0 = y + 0.15 + t0, v1 = v0 + 0.22;
          if (v0 < y + 0.05 || v1 > y + 2.95) continue;
          poly4(c, [pt(x + 0.16, v0, 0.31), pt(x + 0.84, v0, 0.31), pt(x + 0.84, v1, 0.31), pt(x + 0.16, v1, 0.31)], i % 2 ? "#d9dde2" : "#aab1ba");
        }
        box2(c, P2, x + 0.06, y + 0.02, x + 0.1, y + 2.98, 0.3, hgt, "#4a525c");
        poly4(c, [pt(x + 0.92, y + 0.02, 0.3), pt(x + 0.92, y + 2.98, 0.3), pt(x + 0.92, y + 2.98, 0.78), pt(x + 0.92, y + 0.02, 0.78)], "rgba(86,100,116,0.5)");
        box2(c, P2, x + 0.04, y + 0.02, x + 0.12, y + 2.98, hgt, hgt + 0.06, "#20242a");
        c.strokeStyle = "#20242a";
        c.lineWidth = Math.max(1.2, 0.9 * Z);
        c.beginPath();
        {
          const A2 = pt(x + 0.94, y + 0.02, 0.8), D3 = pt(x + 0.94, y + 2.98, 0.8);
          c.moveTo(A2[0], A2[1]);
          c.lineTo(D3[0], D3[1]);
        }
        c.stroke();
        const ap = pt(x + 0.5, up ? y + 3.3 : y - 0.35, 0);
        c.fillStyle = up ? "rgba(255,230,120,0.95)" : "rgba(140,215,255,0.95)";
        c.beginPath();
        if (up) {
          c.moveTo(ap[0], ap[1] - 3 * Z);
          c.lineTo(ap[0] + 4 * Z, ap[1] + 1 * Z);
          c.lineTo(ap[0] - 4 * Z, ap[1] + 1 * Z);
        } else {
          c.moveTo(ap[0], ap[1] + 3 * Z);
          c.lineTo(ap[0] + 4 * Z, ap[1] - 1 * Z);
          c.lineTo(ap[0] - 4 * Z, ap[1] - 1 * Z);
        }
        c.closePath();
        c.fill();
        break;
      }
      case "elev": {
        const w2 = o.w || 2;
        const tr = g.S.loc.tr;
        const mineT = tr && tr.k === "lift" && tr.shaft === o.shaft && tr.b === b.idx && tr.stage !== "ride";
        const dr = mineT ? tr.stage === "wait" ? 0 : tr.door == null ? 0 : tr.door : 0;
        box2(c, P2, x - 0.06, y, x + w2 + 0.06, y + 0.22, 0, 2.55, "#98a1ab");
        const fy = y + 0.22;
        poly4(c, [pt(x + 0.08, fy, 0), pt(x + w2 - 0.08, fy, 0), pt(x + w2 - 0.08, fy, 2.25), pt(x + 0.08, fy, 2.25)], "#2b3038");
        if (dr > 0.02) poly4(c, [pt(x + 0.12, fy, 0.04), pt(x + w2 - 0.12, fy, 0.04), pt(x + w2 - 0.12, fy, 2.2), pt(x + 0.12, fy, 2.2)], "#efe3c6");
        const half = (w2 - 0.16) / 2, open2 = half * dr;
        for (const [a0, a1] of [[x + 0.08, x + 0.08 + half - open2], [x + w2 - 0.08 - half + open2, x + w2 - 0.08]]) if (a1 - a0 > 0.02) {
          poly4(c, [pt(a0, fy, 0.02), pt(a1, fy, 0.02), pt(a1, fy, 2.22), pt(a0, fy, 2.22)], "#b8c0c9");
          poly4(c, [pt(a0, fy, 1), pt(a1, fy, 1), pt(a1, fy, 1.04), pt(a0, fy, 1.04)], "rgba(0,0,0,0.12)");
        }
        const lamp = pt(x + w2 / 2, fy, 2.42);
        const cf = tr && tr.k === "lift" && tr.shaft === o.shaft && tr.b === b.idx && tr.stage === "ride" ? tr.pos : carFloor(b, o.shaft, o.lo, o.hi, tNow(g));
        const nm = levelShort(b, Math.round(cf));
        c.fillStyle = "#15181c";
        c.fillRect(lamp[0] - 5.5 * Z, lamp[1] - 2.2 * Z, 11 * Z, 4.4 * Z);
        c.fillStyle = "#ff9a2e";
        c.font = `bold ${Math.max(8, 3.6 * Z)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(nm, lamp[0], lamp[1] + 0.2 * Z);
        const bt2 = pt(x + w2 + 0.25, fy, 1.1);
        c.fillStyle = mineT ? "#ffd24a" : "#9aa0a8";
        c.beginPath();
        c.arc(bt2[0], bt2[1], 1.5 * Z, 0, 7);
        c.fill();
        break;
      }
      case "toilet": {
        const sg = o.sign;
        const col = sg === "\u7537" ? "#7fa8d8" : sg === "\u5973" ? "#e49ab4" : "#8fcf9a";
        shadow(c, P2, x, y + 0.1, x + o.w, y + o.h);
        box2(c, P2, x + 0.05, y + 0.05, x + o.w - 0.05, y + o.h - 0.05, 0, 2.2, col);
        const fy = y + o.h - 0.05;
        poly4(c, [pt(x + 0.5, fy, 0), pt(x + o.w - 0.5, fy, 0), pt(x + o.w - 0.5, fy, 1.9), pt(x + 0.5, fy, 1.9)], mix(col, "#000000", 0.18));
        const q = pt(x + o.w / 2, fy, 1.5);
        c.fillStyle = "#fff";
        c.beginPath();
        c.arc(q[0], q[1], 2.1 * Z, 0, 7);
        c.fill();
        c.fillStyle = "#333";
        c.font = `bold ${Math.max(8, 3 * Z)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(sg === "\u591A" ? "\u267F" : sg, q[0], q[1] + 0.2 * Z);
        break;
      }
      case "tsign": {
        const t = o.text || "";
        const q = pt(x + 0.5, y + 0.5, 2.7);
        const fs = Math.max(8, 3.2 * Z);
        c.font = `bold ${fs}px sans-serif`;
        const mk0 = fs + "|" + t;
        env.R._mt = env.R._mt || /* @__PURE__ */ new Map();
        let tw0 = env.R._mt.get(mk0);
        if (tw0 == null) {
          tw0 = c.measureText(t).width;
          env.R._mt.set(mk0, tw0);
          if (env.R._mt.size > 400) env.R._mt.clear();
        }
        const tw = tw0 + 4 * Z;
        c.strokeStyle = "rgba(60,60,70,0.7)";
        c.lineWidth = Math.max(1, 0.6 * Z);
        c.beginPath();
        const a = pt(x + 0.5, y + 0.5, 3.05);
        c.moveTo(q[0] - tw / 3, q[1] - 1.6 * Z);
        c.lineTo(a[0] - tw / 3, a[1]);
        c.moveTo(q[0] + tw / 3, q[1] - 1.6 * Z);
        c.lineTo(a[0] + tw / 3, a[1]);
        c.stroke();
        c.fillStyle = "rgba(255,252,240,0.96)";
        c.fillRect(q[0] - tw / 2, q[1] - 2 * Z, tw, 4 * Z);
        c.strokeStyle = "#9b3a3a";
        c.strokeRect(q[0] - tw / 2, q[1] - 2 * Z, tw, 4 * Z);
        c.fillStyle = "#3a2a2a";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(t, q[0], q[1] + 0.2 * Z);
        break;
      }
      case "ublock": {
        const w2 = o.w, h22 = o.h;
        let base = o.wallc ? "#d8cfbd" : "#d2d6dc";
        if (st3) base = mix(st3.wallCol, base, st3.tier >= 2 ? 0.25 : 0.45);
        shadow(c, P2, x, y, x + w2, y + h22);
        box2(c, P2, x, y, x + w2, y + h22, 0, 3, base);
        if (st3) {
          unitFront(c, pt, Z, x, y, w2, h22, o, st3);
          const fy0 = y + h22;
          const rn0 = pt(x + w2 / 2, fy0, 2.45);
          const gold = st3.tier >= 2;
          c.fillStyle = gold ? "#2a2622" : "#fffdf2";
          c.fillRect(rn0[0] - 5 * Z, rn0[1] - 2 * Z, 10 * Z, 4 * Z);
          c.strokeStyle = gold ? "#c9a55a" : "#8a8478";
          c.strokeRect(rn0[0] - 5 * Z, rn0[1] - 2 * Z, 10 * Z, 4 * Z);
          c.fillStyle = o.mine ? gold ? "#ffd27a" : "#1f4f9a" : gold ? "#e6cf9a" : "#2b2b2b";
          c.font = `bold ${Math.max(8, 3.3 * Z)}px sans-serif`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText(o.room, rn0[0], rn0[1] + 0.2 * Z);
          if (o.plate && Z >= 1.5) {
            const pl = pt(x + w2 / 2 + 0.75, fy0, 1.5);
            c.fillStyle = gold ? "#2a2622" : "#f3efe2";
            c.fillRect(pl[0] - 3.5 * Z, pl[1] - 1.5 * Z, 7 * Z, 3 * Z);
            c.fillStyle = gold ? "#e6cf9a" : "#444";
            c.font = `${Math.max(7, 2.4 * Z)}px sans-serif`;
            c.fillText(o.plate, pl[0], pl[1] + 0.2 * Z);
          }
          break;
        }
        const fy = y + h22;
        const dxm = x + w2 / 2 - 0.45;
        const dc = o.mine ? "#3f7fd0" : o.vacant ? "#9a9f99" : "#7a5a3a";
        poly4(c, [pt(dxm, fy, 0), pt(dxm + 0.9, fy, 0), pt(dxm + 0.9, fy, 2.05), pt(dxm, fy, 2.05)], dc);
        poly4(c, [pt(dxm + 0.12, fy, 0.15), pt(dxm + 0.78, fy, 0.15), pt(dxm + 0.78, fy, 1.9), pt(dxm + 0.12, fy, 1.9)], mix(dc, "#ffffff", 0.12));
        const kn = pt(dxm + 0.72, fy, 1);
        c.fillStyle = "#d9c070";
        c.beginPath();
        c.arc(kn[0], kn[1], 0.8 * Z, 0, 7);
        c.fill();
        poly4(c, [pt(x + 0.25, fy, 1.5), pt(x + 0.25 + 0.5, fy, 1.5), pt(x + 0.75, fy, 2), pt(x + 0.25, fy, 2)], "rgba(150,200,230,0.0)");
        const rn = pt(x + w2 / 2, fy, 2.45);
        c.fillStyle = "#fffdf2";
        c.fillRect(rn[0] - 5 * Z, rn[1] - 2 * Z, 10 * Z, 4 * Z);
        c.strokeStyle = "#8a8478";
        c.strokeRect(rn[0] - 5 * Z, rn[1] - 2 * Z, 10 * Z, 4 * Z);
        c.fillStyle = o.mine ? "#1f4f9a" : "#2b2b2b";
        c.font = `bold ${Math.max(8, 3.3 * Z)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(o.room, rn[0], rn[1] + 0.2 * Z);
        if (o.plate && Z >= 1.5) {
          const pl = pt(x + w2 / 2 + 0.75, fy, 1.5);
          c.fillStyle = "#f3efe2";
          c.fillRect(pl[0] - 3.5 * Z, pl[1] - 1.5 * Z, 7 * Z, 3 * Z);
          c.fillStyle = "#444";
          c.font = `${Math.max(7, 2.4 * Z)}px sans-serif`;
          c.fillText(o.plate, pl[0], pl[1] + 0.2 * Z);
        }
        const wn = pt(x + 0.5, fy, 1.3);
        poly4(c, [pt(x + 0.3, fy, 1), pt(x + 0.8, fy, 1), pt(x + 0.8, fy, 1.6), pt(x + 0.3, fy, 1.6)], mix("#9fc6e8", "#ffffff", 0.1));
        break;
      }
      case "udoor": {
        poly4(c, [pt(x + 0.15, y + 0.2), pt(x + 0.85, y + 0.2), pt(x + 0.85, y + 0.8), pt(x + 0.15, y + 0.8)], o.mine ? "rgba(63,127,208,0.35)" : "rgba(120,100,70,0.22)");
        break;
      }
      case "estair": {
        box2(c, P2, x - 0.05, y + 0.1, x + 1.05, y + 0.35, 0, 2.3, "#6f8a74");
        const fy = y + 0.35;
        poly4(c, [pt(x + 0.1, fy, 0), pt(x + 0.9, fy, 0), pt(x + 0.9, fy, 2), pt(x + 0.1, fy, 2)], "#3f7a56");
        const q = pt(x + 0.5, fy, 2.15);
        c.fillStyle = "#2ecf6d";
        c.fillRect(q[0] - 3 * Z, q[1] - 1.1 * Z, 6 * Z, 2.2 * Z);
        c.fillStyle = "#fff";
        c.font = `bold ${Math.max(7, 2 * Z)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("\u975E\u5E38\u53E3", q[0], q[1] + 0.1 * Z);
        break;
      }
      case "mailbank": {
        wallPanel(c, P2, x + 0.04, x + 0.96, 0.6, 1.9, "#9aa4ae", y);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
          const z0 = 0.66 + r * 0.31, x0 = x + 0.08 + k * 0.22;
          wallPanel(c, P2, x0, x0 + 0.19, z0, z0 + 0.26, (r + k) % 3 === 0 ? "#c9ced6" : "#b3bac3", y);
        }
        break;
      }
      case "parcel": {
        const w2 = o.w || 2;
        wallPanel(c, P2, x + 0.05, x + w2 - 0.05, 0.3, 2, "#6d7884", y);
        for (let r = 0; r < 3; r++) for (let k = 0; k < w2 * 2; k++) {
          const z0 = 0.36 + r * 0.54, x0 = x + 0.1 + k * 0.46;
          wallPanel(c, P2, x0, x0 + 0.42, z0, z0 + 0.5, pick3(["#d6a74a", "#9ec3d8", "#c9ced6"], h + r * 3 + k), y);
        }
        break;
      }
      case "managerroom": {
        const w2 = o.w, h22 = o.h;
        shadow(c, P2, x, y, x + w2, y + h22);
        box2(c, P2, x, y, x + w2, y + h22, 0, 2.3, "#e1d7c3");
        const fy = y + h22;
        poly4(c, [pt(x + 0.3, fy, 0.9), pt(x + w2 - 0.3, fy, 0.9), pt(x + w2 - 0.3, fy, 1.9), pt(x + 0.3, fy, 1.9)], "#9cc7e6");
        box2(c, P2, x + 0.2, fy, x + w2 - 0.2, fy + 0.25, 0.9, 1, "#8a6a46");
        const q = pt(x + w2 / 2, fy, 2.15);
        c.fillStyle = "#2b6f4a";
        c.font = `bold ${Math.max(8, 2.8 * Z)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("\u7BA1\u7406\u4EBA\u5BA4", q[0], q[1]);
        break;
      }
      case "bikerack": {
        shadow(c, P2, x, y + 0.1, x + 1, y + 0.9);
        box2(c, P2, x + 0.05, y + 0.1, x + 0.95, y + 0.14, 0, 0.12, "#7d838c");
        for (let k = 0; k < 2; k++) {
          const u = x + 0.28 + k * 0.45;
          box2(c, P2, u, y + 0.15, u + 0.05, y + 0.85, 0.12, 0.78, pick3(["#d9534f", "#4a7fc8", "#58a868", "#e8c44a"], h + k));
          box2(c, P2, u - 0.02, y + 0.12, u + 0.07, y + 0.2, 0, 0.16, "#2a2d33");
          box2(c, P2, u - 0.02, y + 0.8, u + 0.07, y + 0.88, 0, 0.16, "#2a2d33");
        }
        break;
      }
      case "trashroom": {
        shadow(c, P2, x, y, x + o.w, y + o.h);
        box2(c, P2, x, y, x + o.w, y + o.h, 0, 1.5, "#7f8c86");
        const fy = y + o.h;
        for (let k = 0; k < o.w * 2; k++) box2(c, P2, x + 0.1 + k * 0.45, fy, x + 0.45 + k * 0.45, fy + 0.3, 0, 0.9, pick3(["#3f8a4a", "#d9a24a", "#4a7fc8", "#8a8f98"], h + k));
        break;
      }
      case "pstall": {
        poly4(c, [pt(x, y), pt(x + o.w, y), pt(x + o.w, y + o.h), pt(x, y + o.h)], "rgba(255,255,255,0.10)");
        c.strokeStyle = "rgba(255,255,255,0.75)";
        c.lineWidth = Math.max(1, 0.5 * Z);
        c.beginPath();
        for (const [a, d] of [[[x, y], [x, y + o.h]], [[x + o.w, y], [x + o.w, y + o.h]], [[x, y + o.h], [x + o.w, y + o.h]]]) {
          const A2 = pt(a[0], a[1]), D3 = pt(d[0], d[1]);
          c.moveTo(A2[0], A2[1]);
          c.lineTo(D3[0], D3[1]);
        }
        c.stroke();
        if (o.carOwner != null) {
          const R22 = env.R;
          const ty = ["kei", "compact", "sedan", "minivan", "suv", "compact"][hash2(o.carOwner, 9) % 6];
          const col = hash2(o.carOwner, 11) % CAR_COLORS.length;
          const yr = g.year();
          const era = yr < 2e3 ? 0 : yr < 2015 ? 1 : 2;
          const key = `${ty}|${era}|${col}|${Z}`;
          R22.isp = R22.isp || /* @__PURE__ */ new Map();
          let sp = R22.isp.get(key);
          if (!sp) {
            sp = vehicleSprite(ty, era, col, 1, Z, CAR_COLORS);
            R22.isp.set(key, sp);
            if (R22.isp.size > 80) R22.isp.clear();
          }
          const cx = x + o.w / 2, cy = y + o.h / 2;
          c.drawImage(sp.cv, P2.X(cx, cy) - sp.ax, P2.Y(cx, cy) - sp.ay);
        }
        const nq = pt(x + o.w / 2, y + 0.3);
        c.fillStyle = "rgba(255,255,255,0.8)";
        c.font = `bold ${Math.max(7, 2.2 * Z)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(String(o.no), nq[0], nq[1]);
        break;
      }
      case "tree": {
        box2(c, P2, x + 0.42, y + 0.42, x + 0.58, y + 0.58, 0, 1.3, "#6f4e32");
        const t0 = pt(x + 0.5, y + 0.5, 1.6);
        for (let i = 0; i < 7; i++) {
          const a = i * 0.9 + h % 5, r = (0.9 + i % 3 * 0.3) * 8 * Z;
          c.fillStyle = pick3(GREEN, i + h);
          c.beginPath();
          c.ellipse(t0[0] + Math.cos(a) * r * 0.7, t0[1] + Math.sin(a) * r * 0.35 - i % 2 * 5 * Z, r * 0.85, r * 0.6, 0, 0, 7);
          c.fill();
        }
        break;
      }
      case "bench": {
        shadow(c, P2, x, y + 0.2, x + 1, y + 0.8);
        box2(c, P2, x + 0.04, y + 0.3, x + 0.96, y + 0.7, 0.35, 0.42, "#9a7448");
        box2(c, P2, x + 0.1, y + 0.33, x + 0.16, y + 0.4, 0, 0.35, "#5a4630");
        box2(c, P2, x + 0.84, y + 0.33, x + 0.9, y + 0.4, 0, 0.35, "#5a4630");
        box2(c, P2, x + 0.04, y + 0.28, x + 0.96, y + 0.34, 0.42, 0.9, "#8a6a40");
        break;
      }
      case "planter": {
        box2(c, P2, x + 0.08, y + 0.15, x + 0.92, y + 0.85, 0, 0.42, "#a88a68");
        const t0 = pt(x + 0.5, y + 0.5, 0.45);
        for (let i = 0; i < 6; i++) {
          c.fillStyle = pick3(["#e86a8a", "#f0c24a", "#9a6ac0", "#ff8a4a", "#fff"], i + h);
          const q = pt(x + 0.2 + i % 3 * 0.3, y + 0.3 + (i / 3 | 0) * 0.35, 0.55);
          c.beginPath();
          c.arc(q[0], q[1], 1.6 * Z, 0, 7);
          c.fill();
        }
        break;
      }
      case "vending": {
        box2(c, P2, x + 0.12, y + 0.2, x + 0.88, y + 0.8, 0, 1.75, pick3(["#c63b3b", "#3a7fc8", "#e8c44a"], h));
        const fy = y + 0.8;
        poly4(c, [pt(x + 0.2, fy, 0.9), pt(x + 0.8, fy, 0.9), pt(x + 0.8, fy, 1.6), pt(x + 0.2, fy, 1.6)], "#e9f3f8");
        for (let k = 0; k < 4; k++) {
          const q = pt(x + 0.28 + k * 0.14, fy, 1.3);
          c.fillStyle = pick3(GAR, h + k);
          c.fillRect(q[0] - 1 * Z, q[1] - 1.6 * Z, 2 * Z, 3.2 * Z);
        }
        break;
      }
      case "slide": {
        box2(c, P2, x + 0.1, y + 0.1, x + 0.5, y + 1.9, 0, 0.1, "#e8c44a");
        box2(c, P2, x + 0.1, y + 0.1, x + 0.6, y + 0.5, 0.1, 1.5, "#d9534f");
        poly4(c, [pt(x + 0.3, y + 0.5, 1.4), pt(x + 0.3, y + 1.9, 0.1), pt(x + 0.5, y + 1.9, 0.1), pt(x + 0.5, y + 0.5, 1.4)], "#4a7fc8");
        break;
      }
      case "doormat":
      case "exit": {
        break;
      }
      case "futon": {
        box2(c, P2, x + 0.06, y + 0.04, x + 0.94, y + 0.98, 0, 0.12, "#f1ecdc");
        box2(c, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.95, 0.12, 0.26, pick3(["#5f7fb8", "#b86f86", "#6fa87a", "#c9a24c"], h));
        box2(c, P2, x + 0.2, y + 0.1, x + 0.8, y + 0.3, 0.26, 0.38, "#fbf9f0");
        break;
      }
      case "zabuton": {
        box2(c, P2, x + 0.2, y + 0.2, x + 0.8, y + 0.8, 0, 0.1, pick3(["#7a3f3f", "#3f5f7a", "#5f7a3f"], h));
        break;
      }
      case "tokonoma": {
        box2(c, P2, x - 0.02, y + 0.02, x + 2.02, y + 0.98, 0, 0.22, "#5a4028");
        box2(c, P2, x + 0.1, y + 0.08, x + 1.9, y + 0.9, 0.22, 0.3, "#3c2c1c");
        const fy = y + 0.12;
        poly4(c, [pt(x + 0.5, fy, 0.45), pt(x + 1.5, fy, 0.45), pt(x + 1.5, fy, 2), pt(x + 0.5, fy, 2)], "#efe8cf");
        poly4(c, [pt(x + 0.62, fy, 0.6), pt(x + 1.38, fy, 0.6), pt(x + 1.38, fy, 1.9), pt(x + 0.62, fy, 1.9)], "#e3d9b8");
        box2(c, P2, x + 1.55, y + 0.3, x + 1.85, y + 0.6, 0.3, 0.7, "#7a8fa8");
        box2(c, P2, x + 1.65, y + 0.4, x + 1.75, y + 0.5, 0.7, 1.15, "#4f8a4c");
        break;
      }
      case "engawa": {
        box2(c, P2, x, y + 0.05, x + 1, y + 0.95, 0, 0.06, "#b98d5a");
        break;
      }
      default: {
        if (drawFac(c, env, o, { box: box2, poly: poly4, shadow, pick: pick3, pt, mix })) break;
        if (drawExtra(c, env, o, { box: box2, poly: poly4, shadow, pick: pick3, pt, mix })) break;
        shadow(c, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.9);
        box2(c, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.9, 0, 0.9, "#9aa0a8");
      }
    }
  }
  function ctx2() {
  }

