  // src/archint.js
  var cache11 = /* @__PURE__ */ new Map();
  function styleOfBuilding(g, b) {
    const yr = g.year();
    const k = b.idx + "|" + b.era + "|" + (b.nf || 0) + "|" + yr;
    let s = cache11.get(k);
    if (s) return s;
    if (cache11.size > 400) cache11.clear();
    const sp = bldSpec(b, g.world.map, yr);
    s = interiorStyle(b, sp, yr);
    s.kindSp = sp.kind;
    cache11.set(k, s);
    return s;
  }
  var wallDado = (kind, st3, b) => {
    if (kind === "school") return { col: "#b9cdb0", h: 0.95, rail: "#8fa584" };
    if (kind === "hospital") return { col: "#cfe3ea", h: 0.9, rail: "#a8c4cf" };
    if (kind === "hotel" && st3.tier >= 1) return { col: "#7a5236", h: 1, rail: "#5a3a24", wood: true };
    if (kind === "office" && st3.tier >= 2) return { col: "#7a6a56", h: 0.9, rail: "#5a4c3c", wood: true };
    if (kind === "factory" || kind === "warehouse") return { col: "#8f9494", h: 1.1, rail: "#6f7474" };
    if (kind === "station") return { col: "#c9d4da", h: 1, rail: "#9fb0ba" };
    if (kind === "food" && st3.tier >= 1) return { col: "#6a4a32", h: 0.9, rail: "#4a3220", wood: true };
    return null;
  };
  function finishWall(ctx4, pt, a, b, WH, st3, kind, base, shadeK, dado) {
    const lerp2 = (t, z) => pt(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const q = (t0, t1, z0, z1, fill) => {
      const p = [lerp2(t0, z0), lerp2(t1, z0), lerp2(t1, z1), lerp2(t0, z1)];
      ctx4.beginPath();
      ctx4.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < 4; i++) ctx4.lineTo(p[i][0], p[i][1]);
      ctx4.closePath();
      ctx4.fillStyle = fill;
      ctx4.fill();
    };
    const ln = (t0, z0, t1, z1, col, w) => {
      const p = lerp2(t0, z0), r = lerp2(t1, z1);
      ctx4.strokeStyle = col;
      ctx4.lineWidth = w;
      ctx4.beginPath();
      ctx4.moveTo(p[0], p[1]);
      ctx4.lineTo(r[0], r[1]);
      ctx4.stroke();
    };
    const wp2 = st3.wallpaper;
    const hw = Math.max(1, ctx4._z * 0.5);
    const step2 = 1 / len;
    if (wp2 === "stripe") {
      for (let u = 0; u < len; u += 0.5) if ((u / 0.5 | 0) % 2) q(u * step2, Math.min(1, (u + 0.25) * step2), 0.12, WH - 0.1, "rgba(120,100,70,0.10)");
    } else if (wp2 === "cloth") {
      for (let u = 0; u < len; u += 0.22) ln(u * step2, 0.12, u * step2, WH - 0.1, "rgba(90,80,60,0.06)", hw * 0.6);
    } else if (wp2 === "floral") {
      for (let u = 0.3; u < len; u += 0.6) for (let z = 0.4; z < WH - 0.2; z += 0.6) {
        const c = lerp2(u * step2, z + (u / 0.6 | 0) % 2 * 0.3);
        ctx4.fillStyle = "rgba(190,120,110,0.22)";
        ctx4.beginPath();
        ctx4.arc(c[0], c[1], hw * 1.7, 0, 7);
        ctx4.fill();
        ctx4.fillStyle = "rgba(110,150,100,0.2)";
        ctx4.beginPath();
        ctx4.arc(c[0] + hw * 1.6, c[1], hw, 0, 7);
        ctx4.fill();
      }
    } else if (wp2 === "accent") {
      q(0.3, 0.7, 0.12, WH - 0.1, mixc(base, "#6a7a8a", 0.18));
    } else if (wp2 === "fusuma") {
      q(0, 1, 1.85, WH, mixc(base, "#c9b48a", 0.35));
      q(0, 1, 1.78, 1.9, "#6a4a30");
      for (let u = 0; u < len; u += 1.8) {
        q(u * step2, Math.min(1, (u + 0.9) * step2), 0.1, 1.78, "rgba(255,248,225,0.55)");
        q(Math.min(1, (u + 0.9) * step2), Math.min(1, (u + 1.8) * step2), 0.1, 1.78, "rgba(235,225,195,0.5)");
        ln(u * step2, 0.1, u * step2, 1.9, "#5a3d26", hw * 1.6);
        ln((u + 0.9) * step2, 0.1, (u + 0.9) * step2, 1.78, "rgba(90,60,35,0.7)", hw);
      }
    }
    if (dado) {
      q(0, 1, 0.1, dado.h, dado.col);
      q(0, 1, dado.h, dado.h + 0.07, dado.rail);
      if (dado.wood) for (let u = 0; u < len; u += 0.45) ln(u * step2, 0.1, u * step2, dado.h, "rgba(0,0,0,0.22)", hw * 0.7);
    }
    q(0, 1, 0, 0.12, "rgba(60,45,30,0.55)");
    q(0, 1, WH - 0.1, WH, "rgba(255,255,255,0.35)");
    if (kind === "shrine" || st3.fa <= 0 && kind === "home") for (let u = 0; u <= len + 0.01; u += 1.8) q(Math.max(0, u * step2 - 0.012), Math.min(1, u * step2 + 0.012), 0, WH, "rgba(80,55,35,0.6)");
    void shadeK;
  }
  function outsideView(ctx4, pt, x0, x1, z0, z1, night, st3, b) {
    const p = (u, z) => pt(u, 1, z);
    const r = HB(b.idx, 811);
    ctx4.save();
    ctx4.beginPath();
    const a = p(x0, z0), c = p(x1, z0), d = p(x1, z1), e = p(x0, z1);
    ctx4.moveTo(a[0], a[1]);
    ctx4.lineTo(c[0], c[1]);
    ctx4.lineTo(d[0], d[1]);
    ctx4.lineTo(e[0], e[1]);
    ctx4.closePath();
    ctx4.clip();
    const zone = b.zone || "";
    const hills = zone.startsWith("farm") || zone === "onsen" || zone.startsWith("suburb");
    const h0 = z0 + (z1 - z0) * 0.32;
    if (hills) {
      ctx4.fillStyle = night ? "#1d2a2e" : "#7ea48a";
      const m0 = p(x0, h0), m1 = p((x0 + x1) / 2, h0 + (z1 - z0) * 0.28), m2 = p(x1, h0 + 0.05);
      ctx4.beginPath();
      ctx4.moveTo(p(x0, z0)[0], p(x0, z0)[1]);
      ctx4.lineTo(m0[0], m0[1]);
      ctx4.lineTo(m1[0], m1[1]);
      ctx4.lineTo(m2[0], m2[1]);
      ctx4.lineTo(p(x1, z0)[0], p(x1, z0)[1]);
      ctx4.fill();
    } else {
      const n2 = 5;
      for (let i = 0; i < n2; i++) {
        const u0 = x0 + (x1 - x0) * i / n2, u1 = x0 + (x1 - x0) * (i + 1) / n2 - 0.05;
        const hh = h0 + (r >>> i * 3) % 7 / 7 * (z1 - z0) * 0.45;
        ctx4.fillStyle = night ? "#252b46" : ["#a7b2bb", "#b9c0c4", "#9aa7b3"][(r >>> i) % 3];
        const aa = p(u0, z0), bb = p(u1, z0), cc = p(u1, hh), dd = p(u0, hh);
        ctx4.beginPath();
        ctx4.moveTo(aa[0], aa[1]);
        ctx4.lineTo(bb[0], bb[1]);
        ctx4.lineTo(cc[0], cc[1]);
        ctx4.lineTo(dd[0], dd[1]);
        ctx4.fill();
        if (night) {
          ctx4.fillStyle = "rgba(255,214,120,0.9)";
          for (let k = 0; k < 3; k++) {
            const w = p(u0 + (u1 - u0) * 0.3, h0 + (hh - h0) * (k + 0.5) / 3);
            ctx4.fillRect(w[0], w[1], 2, 2);
          }
        }
      }
    }
    ctx4.fillStyle = night ? "#18331f" : "#5c9a5a";
    const tg = p(x0 + (x1 - x0) * 0.8, z0), tt = p(x0 + (x1 - x0) * 0.8, z0 + (z1 - z0) * 0.3);
    ctx4.beginPath();
    ctx4.arc(tt[0], tt[1], Math.abs(tg[1] - tt[1]) * 0.9 + 2, 0, 7);
    ctx4.fill();
    ctx4.restore();
    void st3;
  }
  function drawWindowFinish(ctx4, pt, Z, x0, x1, z0, z1, st3, kind, b, night, key) {
    outsideView(ctx4, pt, x0, x1, z0, z1, night, st3, b);
    const lw = Math.max(1, 0.55 * Z);
    const A2 = pt(x0, 1, z0), B2 = pt(x1, 1, z0), C2 = pt(x1, 1, z1), D3 = pt(x0, 1, z1);
    const r = HB(b.idx, key) % 100;
    const ww = x1 - x0;
    const wood = st3.fa <= 1 || kind === "shrine" || kind === "home" && st3.fa <= 2;
    const frameCol = wood ? "#7a5a3a" : st3.fa >= 4 ? "#f3f3ef" : "#cfd4d8";
    ctx4.strokeStyle = frameCol;
    ctx4.lineWidth = Math.max(1.6, 1.4 * Z);
    ctx4.beginPath();
    ctx4.moveTo(A2[0], A2[1]);
    ctx4.lineTo(B2[0], B2[1]);
    ctx4.lineTo(C2[0], C2[1]);
    ctx4.lineTo(D3[0], D3[1]);
    ctx4.closePath();
    const m0 = pt((x0 + x1) / 2, 1, z0), m1 = pt((x0 + x1) / 2, 1, z1);
    ctx4.moveTo(m0[0], m0[1]);
    ctx4.lineTo(m1[0], m1[1]);
    if (wood) {
      const h0 = pt(x0, 1, (z0 + z1) / 2), h1 = pt(x1, 1, (z0 + z1) / 2);
      ctx4.moveTo(h0[0], h0[1]);
      ctx4.lineTo(h1[0], h1[1]);
    }
    ctx4.stroke();
    const quad = (u0, u1, za, zb, fill) => {
      const a = pt(u0, 1, za), b2 = pt(u1, 1, za), c = pt(u1, 1, zb), d = pt(u0, 1, zb);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b2[0], b2[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.closePath();
      ctx4.fillStyle = fill;
      ctx4.fill();
    };
    if (kind === "home" || kind === "hotel" || kind === "shop" && r % 3 === 0 || kind === "food" && r % 2) {
      if (r < 55) {
        const cc = st3.curtain;
        quad(x0 - 0.05, x0 + ww * 0.3, z0 - 0.05, z1 + 0.1, cc);
        quad(x1 - ww * 0.3, x1 + 0.05, z0 - 0.05, z1 + 0.1, cc);
        ctx4.strokeStyle = "rgba(0,0,0,0.14)";
        ctx4.lineWidth = Math.max(0.6, 0.4 * Z);
        for (let k = 1; k < 4; k++) for (const [ua, ub] of [[x0, x0 + ww * 0.3], [x1 - ww * 0.3, x1]]) {
          const u = ua + (ub - ua) * k / 4;
          const p02 = pt(u, 1, z0), p1 = pt(u, 1, z1 + 0.1);
          ctx4.beginPath();
          ctx4.moveTo(p02[0], p02[1]);
          ctx4.lineTo(p1[0], p1[1]);
          ctx4.stroke();
        }
        const rod = pt(x0 - 0.1, 1, z1 + 0.12), rod2 = pt(x1 + 0.1, 1, z1 + 0.12);
        ctx4.strokeStyle = "#6a5a4a";
        ctx4.lineWidth = Math.max(1, 0.6 * Z);
        ctx4.beginPath();
        ctx4.moveTo(rod[0], rod[1]);
        ctx4.lineTo(rod2[0], rod2[1]);
        ctx4.stroke();
      } else if (r < 80) {
        const dz = (z1 - z0) * (0.3 + r % 5 / 10);
        quad(x0, x1, z1 - dz, z1, "rgba(235,230,215,0.92)");
        ctx4.strokeStyle = "rgba(100,90,70,0.35)";
        ctx4.lineWidth = Math.max(0.5, 0.35 * Z);
        for (let z = z1 - 0.06; z > z1 - dz; z -= 0.09) {
          const p02 = pt(x0, 1, z), p1 = pt(x1, 1, z);
          ctx4.beginPath();
          ctx4.moveTo(p02[0], p02[1]);
          ctx4.lineTo(p1[0], p1[1]);
          ctx4.stroke();
        }
      }
    }
    if (kind === "office" || kind === "hospital" || kind === "school") {
      const dz = (z1 - z0) * 0.5;
      quad(x0, x1, z1 - dz, z1, "rgba(225,225,215,0.85)");
      ctx4.strokeStyle = "rgba(100,100,90,0.35)";
      ctx4.lineWidth = Math.max(0.5, 0.35 * Z);
      for (let z = z1 - 0.05; z > z1 - dz; z -= 0.1) {
        const p02 = pt(x0, 1, z), p1 = pt(x1, 1, z);
        ctx4.beginPath();
        ctx4.moveTo(p02[0], p02[1]);
        ctx4.lineTo(p1[0], p1[1]);
        ctx4.stroke();
      }
    }
    const s0 = pt(x0 - 0.12, 1, z0), s1 = pt(x1 + 0.12, 1, z0), s2 = pt(x1 + 0.12, 0.8, z0 - 0.05), s3 = pt(x0 - 0.12, 0.8, z0 - 0.05);
    ctx4.beginPath();
    ctx4.moveTo(s0[0], s0[1]);
    ctx4.lineTo(s1[0], s1[1]);
    ctx4.lineTo(s2[0], s2[1]);
    ctx4.lineTo(s3[0], s3[1]);
    ctx4.closePath();
    ctx4.fillStyle = wood ? "#8a6a48" : "#e4dfd2";
    ctx4.fill();
    if (!night && st3.fa >= 3 && r % 4 === 0) {
      const c = pt((x0 + x1) / 2, 0.9, z0 + 0.15);
      ctx4.fillStyle = "#6a4a30";
      ctx4.fillRect(c[0] - 3 * Z, c[1] - 3 * Z, 6 * Z, 3 * Z);
      ctx4.fillStyle = "#4f9a4f";
      ctx4.beginPath();
      ctx4.arc(c[0], c[1] - 5 * Z, 3.4 * Z, 0, 7);
      ctx4.fill();
    }
  }
  function drawWallDecor(ctx4, pt, Z, I2, st3, kind, b, gaps) {
    const items = [];
    const r = (n2) => HB(b.idx, 900 + n2);
    const poster = (u, z0, w, h, col, col2) => {
      const a = pt(u, 1, z0), c = pt(u + w, 1, z0), d = pt(u + w, 1, z0 + h), e = pt(u, 1, z0 + h);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.lineTo(e[0], e[1]);
      ctx4.closePath();
      ctx4.fillStyle = col;
      ctx4.fill();
      ctx4.strokeStyle = "rgba(40,30,20,0.55)";
      ctx4.lineWidth = Math.max(1, 0.5 * Z);
      ctx4.stroke();
      const m = pt(u + w * 0.5, 1, z0 + h * 0.6);
      ctx4.fillStyle = col2;
      ctx4.beginPath();
      ctx4.arc(m[0], m[1], Math.max(2, 2.6 * Z * Math.min(w, h)), 0, 7);
      ctx4.fill();
      const t = pt(u + w * 0.5, 1, z0 + h * 0.18);
      ctx4.fillStyle = "rgba(30,30,30,0.6)";
      ctx4.fillRect(t[0] - 5 * Z * w, t[1], 10 * Z * w, Math.max(1, 0.8 * Z));
    };
    const clock = (u, z) => {
      const c = pt(u, 1, z);
      const rr3 = Math.max(3, 2.2 * Z);
      ctx4.fillStyle = "#f4f1e6";
      ctx4.beginPath();
      ctx4.arc(c[0], c[1], rr3, 0, 7);
      ctx4.fill();
      ctx4.strokeStyle = "#4a3a2c";
      ctx4.lineWidth = Math.max(1, 0.7 * Z);
      ctx4.stroke();
      const ang = r(1) % 12 / 12 * 6.283;
      ctx4.beginPath();
      ctx4.moveTo(c[0], c[1]);
      ctx4.lineTo(c[0] + Math.sin(ang) * rr3 * 0.55, c[1] - Math.cos(ang) * rr3 * 0.55);
      ctx4.moveTo(c[0], c[1]);
      ctx4.lineTo(c[0] + rr3 * 0.8, c[1] - rr3 * 0.1);
      ctx4.stroke();
    };
    const calendar = (u, z) => {
      const a = pt(u, 1, z), c = pt(u + 0.5, 1, z), d = pt(u + 0.5, 1, z + 0.7), e = pt(u, 1, z + 0.7);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.lineTo(e[0], e[1]);
      ctx4.closePath();
      ctx4.fillStyle = "#fbfaf3";
      ctx4.fill();
      ctx4.strokeStyle = "#8a4a3a";
      ctx4.lineWidth = Math.max(1, 0.6 * Z);
      ctx4.stroke();
      const h = pt(u + 0.25, 1, z + 0.55);
      ctx4.fillStyle = "#c94a3a";
      ctx4.fillRect(h[0] - 4 * Z * 0.5, h[1] - 1.5 * Z, 8 * Z * 0.5, 3 * Z);
    };
    const board2 = (u, z, w) => {
      const a = pt(u, 1, z), c = pt(u + w, 1, z), d = pt(u + w, 1, z + 0.8), e = pt(u, 1, z + 0.8);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.lineTo(e[0], e[1]);
      ctx4.closePath();
      ctx4.fillStyle = "#b08a5a";
      ctx4.fill();
      ctx4.strokeStyle = "#5a3d26";
      ctx4.lineWidth = Math.max(1, 0.8 * Z);
      ctx4.stroke();
      for (let k = 0; k < 4; k++) {
        const p = pt(u + w * (0.12 + 0.22 * k), 1, z + 0.12 + k % 2 * 0.28);
        ctx4.fillStyle = ["#fff", "#f6e08a", "#bfe0f0", "#f0c0c0"][k];
        ctx4.fillRect(p[0], p[1], 4 * Z * w, 4 * Z * 0.8);
      }
    };
    let gi = 0;
    const cols2 = [["#e6c9a0", "#c0504d"], ["#cfe0ee", "#3a78b0"], ["#e8e0f0", "#7a5ab0"], ["#f0d8d0", "#d07050"], ["#d8e8d0", "#4a9a5a"]];
    for (const g of gaps) {
      const u = g.x + 0.07, w = Math.min(0.85, g.w - 0.14);
      if (w < 0.4) continue;
      const k = (gi++ + r(2)) % 6;
      if (kind === "home") {
        if (k === 0 && st3.clock) clock(u + w / 2, 1.9);
        else if (k === 1) calendar(u + 0.1, 1.2);
        else if (k === 2 && st3.poster) {
          const c = cols2[r(3) % cols2.length];
          poster(u, 1.1, w, 1, c[0], c[1]);
        }
      } else if (kind === "office" || kind === "school" || kind === "hospital" || kind === "station" || kind === "airport") {
        if (k % 3 === 0) clock(u + w / 2, 2);
        else if (k % 3 === 1) board2(u, 1.3, w);
      } else if (kind === "shop" || kind === "food") {
        if (k % 2 === 0) {
          const c = cols2[r(4 + gi) % cols2.length];
          poster(u, 1.2, w, 0.9, c[0], c[1]);
        } else if (k === 1 && st3.clock) clock(u + w / 2, 2);
      } else if (kind === "hotel") {
        if (k % 2 === 0) {
          const c = cols2[r(5 + gi) % cols2.length];
          poster(u, 1.2, w, 1, c[0], c[1]);
        }
      } else if (kind === "leisure" && k % 2) board2(u, 1.3, w);
    }
    void items;
    void I2;
  }
  function drawWallFinishAll(ctx4, pt, Z, I2, WH, st3, kind, wall) {
    ctx4._z = Z;
    const dado = wallDado(kind, st3);
    finishWall(ctx4, pt, [0, 1], [I2.W, 1], WH, st3, kind, wall, 1, dado);
    finishWall(ctx4, pt, [0, 1], [0, I2.H], WH, st3, kind, wall, 0.8, dado);
  }
  function floorFinish(ctx4, pt, Z, t, x, y, st3, kind) {
    const lw = Math.max(0.8, 0.45 * Z);
    if (t === "floor_wood") {
      const tone2 = st3.floor === "vinyl" ? 0.55 : st3.fa <= 1 ? -0.1 : st3.fa >= 4 ? 0.3 : 0.08;
      ctx4.fillStyle = tone2 > 0 ? `rgba(255,240,215,${tone2})` : `rgba(40,20,0,${-tone2})`;
      const a = pt(x, y), b = pt(x + 1, y), c = pt(x + 1, y + 1), d = pt(x, y + 1);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.fill();
      ctx4.strokeStyle = "rgba(70,40,10,0.24)";
      ctx4.lineWidth = lw;
      ctx4.beginPath();
      if (st3.tier >= 2 && st3.floor === "wood") {
        if (x + y & 1) for (const v of [0.25, 0.5, 0.75]) {
          const p = pt(x, y + v), q = pt(x + 1, y + v);
          ctx4.moveTo(p[0], p[1]);
          ctx4.lineTo(q[0], q[1]);
        }
        else for (const u of [0.25, 0.5, 0.75]) {
          const p = pt(x + u, y), q = pt(x + u, y + 1);
          ctx4.moveTo(p[0], p[1]);
          ctx4.lineTo(q[0], q[1]);
        }
      } else if (st3.floor === "vinyl") {
        const p = pt(x + 0.5, y), q = pt(x + 0.5, y + 1);
        ctx4.moveTo(p[0], p[1]);
        ctx4.lineTo(q[0], q[1]);
      } else {
        for (const v of [0.33, 0.66]) {
          const p2 = pt(x, y + v), q2 = pt(x + 1, y + v);
          ctx4.moveTo(p2[0], p2[1]);
          ctx4.lineTo(q2[0], q2[1]);
        }
        const off = (x * 7 + y * 13) % 3 / 3;
        const p = pt(x + off, y), q = pt(x + off, y + 0.33);
        ctx4.moveTo(p[0], p[1]);
        ctx4.lineTo(q[0], q[1]);
      }
      ctx4.stroke();
      return true;
    }
    if (t === "floor_tatami") {
      const horiz = (x + y * 2) % 4 < 2;
      ctx4.strokeStyle = "rgba(30,40,20,0.55)";
      ctx4.lineWidth = lw * 1.3;
      ctx4.beginPath();
      const a = pt(x, y), b = pt(x + 1, y), c = pt(x + 1, y + 1), d = pt(x, y + 1);
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.lineTo(d[0], d[1]);
      ctx4.closePath();
      ctx4.stroke();
      ctx4.strokeStyle = "rgba(80,100,40,0.22)";
      ctx4.lineWidth = lw * 0.7;
      ctx4.beginPath();
      for (let k = 1; k < 5; k++) {
        const p = horiz ? pt(x, y + k / 5) : pt(x + k / 5, y), q = horiz ? pt(x + 1, y + k / 5) : pt(x + k / 5, y + 1);
        ctx4.moveTo(p[0], p[1]);
        ctx4.lineTo(q[0], q[1]);
      }
      ctx4.stroke();
      return true;
    }
    if (t === "floor_carpet" && kind !== "hotel") {
      const a = pt(x, y), b = pt(x + 1, y), c = pt(x + 1, y + 1), d = pt(x, y + 1);
      ctx4.strokeStyle = "rgba(255,255,255,0.07)";
      ctx4.lineWidth = lw;
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(c[0], c[1]);
      ctx4.stroke();
      void b;
      void d;
    }
    if (t === "floor_marble") {
      const a = pt(x, y), c = pt(x + 1, y + 1);
      ctx4.strokeStyle = "rgba(110,100,90,0.16)";
      ctx4.lineWidth = lw;
      const k = (x * 5 + y * 11) % 4;
      ctx4.beginPath();
      ctx4.moveTo(a[0] + (c[0] - a[0]) * 0.1 * k, a[1] + (c[1] - a[1]) * 0.2);
      ctx4.lineTo(a[0] + (c[0] - a[0]) * (0.5 + 0.1 * k), a[1] + (c[1] - a[1]) * 0.8);
      ctx4.stroke();
    }
    return false;
  }
  function drawCeilingLights(ctx4, pt, Z, I2, st3, night) {
    const WH = I2.wallH || 3;
    const n2 = Math.max(1, Math.floor(I2.W / 5));
    for (let i = 0; i < n2; i++) {
      const u = (i + 0.5) * I2.W / n2;
      const top = pt(u, 1.6, WH), low = pt(u, 1.6, WH - 0.45);
      const on2 = night;
      ctx4.strokeStyle = "#4a4a4a";
      ctx4.lineWidth = Math.max(1, 0.45 * Z);
      ctx4.beginPath();
      ctx4.moveTo(top[0], top[1]);
      ctx4.lineTo(low[0], low[1]);
      ctx4.stroke();
      if (st3.light === "bulb") {
        ctx4.fillStyle = on2 ? "#fff3b0" : "#e9e2c0";
        ctx4.beginPath();
        ctx4.arc(low[0], low[1] + 2 * Z, 2.2 * Z, 0, 7);
        ctx4.fill();
        ctx4.fillStyle = "#4a4a4a";
        ctx4.fillRect(low[0] - 2.6 * Z, low[1] - 1 * Z, 5.2 * Z, 1.6 * Z);
      } else if (st3.light === "fluor") {
        ctx4.fillStyle = on2 ? "#fffbe0" : "#e8ecee";
        ctx4.fillRect(low[0] - 6 * Z, low[1], 12 * Z, 2 * Z);
        ctx4.strokeStyle = "#9aa0a4";
        ctx4.lineWidth = 0.6 * Z;
        ctx4.strokeRect(low[0] - 6 * Z, low[1], 12 * Z, 2 * Z);
      } else if (st3.light === "chandelier") {
        ctx4.fillStyle = on2 ? "#ffe8a0" : "#d9c892";
        for (let k = -2; k <= 2; k++) {
          ctx4.beginPath();
          ctx4.arc(low[0] + k * 2.6 * Z, low[1] + Math.abs(k) * 0.8 * Z + 2 * Z, 1.5 * Z, 0, 7);
          ctx4.fill();
        }
        ctx4.strokeStyle = "#b8a060";
        ctx4.lineWidth = 0.7 * Z;
        ctx4.beginPath();
        ctx4.moveTo(low[0] - 5.2 * Z, low[1] + 2 * Z);
        ctx4.lineTo(low[0] + 5.2 * Z, low[1] + 2 * Z);
        ctx4.stroke();
      } else if (st3.light === "down") {
        ctx4.fillStyle = on2 ? "#fff6d0" : "#d8d8d4";
        ctx4.beginPath();
        ctx4.ellipse(top[0], top[1] + 0.6 * Z, 2.6 * Z, 1.1 * Z, 0, 0, 7);
        ctx4.fill();
      } else {
        ctx4.fillStyle = on2 ? "#ffffff" : "#eceeee";
        ctx4.beginPath();
        ctx4.ellipse(low[0], low[1] + 1 * Z, 5 * Z, 2 * Z, 0, 0, 7);
        ctx4.fill();
        ctx4.strokeStyle = "#b5bcc0";
        ctx4.lineWidth = 0.5 * Z;
        ctx4.stroke();
      }
    }
  }
  function condoFloorAcc() {
    return { dk: new Path2D(), lt: new Path2D(), fill: new Path2D(), dot: new Path2D(), dot2: new Path2D(), rug: new Path2D(), n: 0 };
  }
  function condoFloor(acc, pt, Z, t, x, y, st3) {
    if (t !== "floor_corr" && t !== "floor_marble") return false;
    const era = st3.fy < 1975 ? 0 : st3.fy < 2e3 ? 1 : 2;
    const h = (x * 73856093 ^ y * 19349663) >>> 0;
    const a = pt(x, y), b = pt(x + 1, y), c = pt(x + 1, y + 1), d = pt(x, y + 1);
    const seg = (P2, u0, v0, u1, v1) => {
      const p = pt(x + u0, y + v0), q = pt(x + u1, y + v1);
      P2.moveTo(p[0], p[1]);
      P2.lineTo(q[0], q[1]);
    };
    const sq = (P2, u0, v0, u1, v1) => {
      const p = pt(x + u0, y + v0), q = pt(x + u1, y + v0), r = pt(x + u1, y + v1), s = pt(x + u0, y + v1);
      P2.moveTo(p[0], p[1]);
      P2.lineTo(q[0], q[1]);
      P2.lineTo(r[0], r[1]);
      P2.lineTo(s[0], s[1]);
      P2.closePath();
    };
    if (t === "floor_corr") {
      if (era === 0) {
        for (let k = 0; k < 5; k++) {
          const u = (h >> k * 3 & 7) / 8 * 0.9 + 0.03, v = (h >> k * 3 + 1 & 7) / 8 * 0.9 + 0.03;
          sq(k & 1 ? acc.dot : acc.dot2, u, v, u + 0.07, v + 0.07);
        }
        if (x % 3 === 0) seg(acc.dk, 0, 0, 0, 1);
      } else if (era === 1) {
        if (x + y & 1) {
          sq(acc.fill, 0, 0, 0.5, 0.5);
          sq(acc.fill, 0.5, 0.5, 1, 1);
        } else {
          sq(acc.fill, 0.5, 0, 1, 0.5);
          sq(acc.fill, 0, 0.5, 0.5, 1);
        }
        seg(acc.dk, 0, 0, 1, 0);
        seg(acc.dk, 0, 0, 0, 1);
      } else {
        seg(acc.dk, 0, 0, 1, 0);
        seg(acc.dk, 0, 0, 0, 1);
        if (st3.tier >= 2) seg(acc.lt, 0.5, 0, 0.5, 1);
      }
      if (st3.tier >= 2 && y >= 6 && y <= 7) sq(acc.rug, 0.02, y === 6 ? 0.45 : 0, 0.98, y === 6 ? 1 : 0.55);
      return true;
    }
    if (era === 0 && st3.tier < 2) {
      for (let k = 0; k < 7; k++) {
        const u = (h >> k * 3 & 7) / 8 * 0.9 + 0.03, v = (h >> k * 3 + 2 & 7) / 8 * 0.9 + 0.03;
        sq(k & 1 ? acc.dot : acc.dot2, u, v, u + 0.06, v + 0.06);
      }
      if (x % 4 === 0) seg(acc.dk, 0, 0, 0, 1);
      if (y % 4 === 0) seg(acc.dk, 0, 0, 1, 0);
      return true;
    }
    if (st3.tier >= 2) {
      if (x + y & 1) sq(acc.fill, 0.25, 0.25, 0.75, 0.75);
      seg(acc.lt, 0, 0, 1, 1);
      seg(acc.dk, 0, 0, 1, 0);
      seg(acc.dk, 0, 0, 0, 1);
      return true;
    }
    if (x % 2 === 0 && y % 2 === 0) {
      sq(acc.fill, 0, 0, 2, 2);
    }
    seg(acc.dk, 0, 0, 1, 0);
    seg(acc.dk, 0, 0, 0, 1);
    return true;
  }
  function condoFloorFlush(ctx4, acc, Z) {
    ctx4.lineWidth = Math.max(0.8, 0.45 * Z);
    ctx4.fillStyle = "rgba(40,36,30,0.07)";
    ctx4.fill(acc.fill);
    ctx4.fillStyle = "rgba(70,64,58,0.55)";
    ctx4.fill(acc.dot);
    ctx4.fillStyle = "rgba(255,255,255,0.6)";
    ctx4.fill(acc.dot2);
    ctx4.fillStyle = "rgba(120,40,46,0.55)";
    ctx4.fill(acc.rug);
    ctx4.strokeStyle = "rgba(70,60,50,0.2)";
    ctx4.stroke(acc.dk);
    ctx4.strokeStyle = "rgba(255,255,255,0.22)";
    ctx4.stroke(acc.lt);
  }
  function unitFront(ctx4, pt, Z, x, y, w2, h22, o, st3) {
    const fy = y + h22;
    const era = st3.fy < 1975 ? 0 : st3.fy < 2e3 ? 1 : 2;
    const hh = (parseInt(String(o.room).replace(/\D/g, ""), 10) || 0) * 2654435761 >>> 0;
    const P2 = (pts, col) => {
      ctx4.fillStyle = col;
      ctx4.beginPath();
      pts.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
      ctx4.closePath();
      ctx4.fill();
    };
    const dxm = x + w2 / 2 - 0.45;
    const doorCols = era === 0 ? ["#8fb39a", "#a9b4bd", "#b79b78", "#c8c3a2"] : era === 1 ? ["#8a6a4a", "#9a9486", "#6f7f6a", "#b0a08a"] : st3.tier >= 2 ? ["#5b4331", "#3a3f46", "#6a5038"] : ["#4a4f57", "#7a7f86", "#8a6a4a"];
    const dc = o.mine ? "#3f7fd0" : o.vacant ? "#9a9f99" : doorCols[hh % doorCols.length];
    if (st3.tier >= 2 && era === 2) {
      P2([pt(dxm - 0.25, fy, 0), pt(dxm + 1.15, fy, 0), pt(dxm + 1.15, fy, 2.2), pt(dxm - 0.25, fy, 2.2)], "rgba(30,30,34,0.28)");
      P2([pt(dxm - 0.2, fy, 0.1), pt(dxm - 0.02, fy, 0.1), pt(dxm - 0.02, fy, 2), pt(dxm - 0.2, fy, 2)], "rgba(160,205,225,0.7)");
    }
    P2([pt(dxm, fy, 0), pt(dxm + 0.9, fy, 0), pt(dxm + 0.9, fy, 2.05), pt(dxm, fy, 2.05)], dc);
    if (era === 2 && st3.tier >= 1) {
      ctx4.strokeStyle = "rgba(255,255,255,0.10)";
      ctx4.lineWidth = Math.max(0.6, 0.3 * Z);
      ctx4.beginPath();
      for (let k = 1; k < 5; k++) {
        const p = pt(dxm + 0.18 * k, fy, 0.1), q = pt(dxm + 0.18 * k, fy, 1.95);
        ctx4.moveTo(p[0], p[1]);
        ctx4.lineTo(q[0], q[1]);
      }
      ctx4.stroke();
    } else P2([pt(dxm + 0.12, fy, 0.15), pt(dxm + 0.78, fy, 0.15), pt(dxm + 0.78, fy, 1.9), pt(dxm + 0.12, fy, 1.9)], mixc(dc, "#ffffff", era === 0 ? 0.14 : 0.08));
    const ph = pt(dxm + 0.45, fy, 1.6);
    ctx4.fillStyle = "#2a2a2a";
    ctx4.beginPath();
    ctx4.arc(ph[0], ph[1], 0.55 * Z, 0, 7);
    ctx4.fill();
    if (era === 0) {
      const sl = pt(dxm + 0.45, fy, 0.95);
      ctx4.fillStyle = "#7a7a72";
      ctx4.fillRect(sl[0] - 1.6 * Z, sl[1] - 0.35 * Z, 3.2 * Z, 0.7 * Z);
    }
    const kn = pt(dxm + 0.72, fy, 1);
    ctx4.fillStyle = era === 2 ? "#bfc4ca" : "#d9c070";
    ctx4.beginPath();
    ctx4.arc(kn[0], kn[1], 0.8 * Z, 0, 7);
    ctx4.fill();
    const wx0 = x + 0.28, wx1 = x + 0.82, wz0 = era === 0 ? 1.15 : 1, wz1 = era === 0 ? 1.65 : 1.7;
    const lit = o.vacant ? "#aeb4b8" : mixc("#9fc6e8", "#ffffff", 0.1);
    P2([pt(wx0 - 0.04, fy, wz0 - 0.04), pt(wx1 + 0.04, fy, wz0 - 0.04), pt(wx1 + 0.04, fy, wz1 + 0.04), pt(wx0 - 0.04, fy, wz1 + 0.04)], era === 2 ? "#8a8f95" : "#c8c8c0");
    P2([pt(wx0, fy, wz0), pt(wx1, fy, wz0), pt(wx1, fy, wz1), pt(wx0, fy, wz1)], lit);
    ctx4.strokeStyle = era === 2 ? "rgba(60,64,70,0.55)" : "rgba(70,50,40,0.6)";
    ctx4.lineWidth = Math.max(0.6, 0.35 * Z);
    ctx4.beginPath();
    const bars = era === 0 ? 4 : 3;
    for (let k = 1; k <= bars; k++) {
      const u = wx0 + (wx1 - wx0) * k / (bars + 1);
      const p = pt(u, fy, wz0), q = pt(u, fy, wz1);
      ctx4.moveTo(p[0], p[1]);
      ctx4.lineTo(q[0], q[1]);
    }
    if (era !== 2) {
      const p = pt(wx0, fy, (wz0 + wz1) / 2), q = pt(wx1, fy, (wz0 + wz1) / 2);
      ctx4.moveTo(p[0], p[1]);
      ctx4.lineTo(q[0], q[1]);
    }
    ctx4.stroke();
    const mxu = dxm + 1.05;
    if (mxu + 0.4 < x + w2 && era <= 1) {
      P2([pt(mxu, fy, 0.5), pt(mxu + 0.4, fy, 0.5), pt(mxu + 0.4, fy, 1.5), pt(mxu, fy, 1.5)], "#a9a9a0");
      ctx4.strokeStyle = "rgba(0,0,0,0.3)";
      ctx4.lineWidth = Math.max(0.6, 0.3 * Z);
      const p = pt(mxu + 0.2, fy, 0.5), q = pt(mxu + 0.2, fy, 1.5);
      ctx4.beginPath();
      ctx4.moveTo(p[0], p[1]);
      ctx4.lineTo(q[0], q[1]);
      ctx4.stroke();
    }
    if (era === 0 && hh % 3 === 0) {
      P2([pt(dxm - 0.38, fy, 1.1), pt(dxm - 0.08, fy, 1.1), pt(dxm - 0.08, fy, 1.4), pt(dxm - 0.38, fy, 1.4)], "#c9b48a");
    }
    if (era === 2) {
      const ib = pt(dxm + 1, fy, 1.3);
      ctx4.fillStyle = "#d9dde2";
      ctx4.fillRect(ib[0] - 0.9 * Z, ib[1] - 1.1 * Z, 1.8 * Z, 2.2 * Z);
      ctx4.fillStyle = "#2a6fd0";
      ctx4.fillRect(ib[0] - 0.4 * Z, ib[1] - 0.5 * Z, 0.8 * Z, 0.7 * Z);
      const dl = pt(dxm + 0.45, fy, 2.15);
      ctx4.fillStyle = "rgba(255,240,190,0.9)";
      ctx4.beginPath();
      ctx4.arc(dl[0], dl[1], 0.9 * Z, 0, 7);
      ctx4.fill();
    } else {
      const lp = pt(dxm + 0.45, fy, 2.15);
      ctx4.fillStyle = era === 0 ? "#e8dca0" : "#f0e6b8";
      ctx4.beginPath();
      ctx4.arc(lp[0], lp[1], 0.8 * Z, 0, 7);
      ctx4.fill();
    }
    if (!o.vacant) {
      const v = hh % 5;
      if (v === 0) {
        const q = pt(dxm - 0.5, fy + 0.18, 0);
        ctx4.fillStyle = "#6c7a8a";
        ctx4.fillRect(q[0] - 1 * Z, q[1] - 2.4 * Z, 2 * Z, 2.4 * Z);
      } else if (v === 1) {
        const q = pt(dxm + 1.1, fy + 0.22, 0);
        ctx4.fillStyle = "#7a5a3a";
        ctx4.fillRect(q[0] - 1.6 * Z, q[1] - 0.9 * Z, 3.2 * Z, 0.9 * Z);
      } else if (v === 2 && era >= 1) {
        const q = pt(dxm + 1.05, fy + 0.2, 0);
        ctx4.fillStyle = "#2e7d4f";
        ctx4.beginPath();
        ctx4.arc(q[0], q[1] - 1.2 * Z, 1.5 * Z, 0, 7);
        ctx4.fill();
        ctx4.fillStyle = "#8a5a3a";
        ctx4.fillRect(q[0] - 0.9 * Z, q[1] - 0.8 * Z, 1.8 * Z, 0.8 * Z);
      }
    }
  }

