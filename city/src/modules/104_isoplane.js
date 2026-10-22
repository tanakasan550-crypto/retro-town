  // src/isoplane.js
  var LIV = [["#1f4f93", "#e9eef6"], ["#c0392b", "#f4f4f2"], ["#23885a", "#eef4ee"], ["#d9a021", "#f3f0e6"]];
  function drawPlane(ctx4, P2, Z, cx, cy, heading, liv, opt = {}) {
    const S2 = heading === "S";
    const W2 = (a, c, z) => S2 ? P2(cx + c, cy + a, z) : P2(cx + a, cy + c, z);
    const poly7 = (pts, fill, stroke) => {
      ctx4.beginPath();
      pts.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
      ctx4.closePath();
      ctx4.fillStyle = fill;
      ctx4.fill();
      if (stroke) {
        ctx4.strokeStyle = stroke;
        ctx4.lineWidth = Math.max(1, Z * 0.06);
        ctx4.stroke();
      }
    };
    const [col, body] = LIV[liv % LIV.length];
    const z0 = opt.z || 0;
    const L2 = 9.2, hw = 0.85, zb = z0 + 0.7, zt = z0 + 3, wing = 8.4, scale = opt.scale || 1;
    void scale;
    poly7([W2(-L2, -2.2, z0), W2(L2, -2.2, z0), W2(L2, 2.2, z0), W2(-L2, 2.2, z0)].map((p) => [p[0] + 0, p[1]]), "rgba(30,40,30,.18)");
    poly7([W2(-1.5, -wing, z0), W2(2, -wing * 0.3, z0), W2(2, wing * 0.3, z0), W2(-1.5, wing, z0)], "rgba(30,40,30,.14)");
    for (const [a, c] of [[3, -0.5], [3, 0.5], [-1.5, -1.1], [-1.5, 1.1], [7, 0]]) poly7([W2(a - 0.25, c - 0.12, z0), W2(a + 0.25, c - 0.12, z0), W2(a + 0.25, c - 0.12, zb), W2(a - 0.25, c - 0.12, zb)], "#2b2f35");
    const wingPoly = (sg) => [W2(2.6, sg * hw, zb + 0.7), W2(-1.2, sg * wing, zb + 1.1), W2(-3.3, sg * wing, zb + 1.1), W2(-0.9, sg * hw, zb + 0.7)];
    const engine = (sg) => {
      const a = 0.8, c = sg * 3.1, r = 0.55;
      poly7([W2(a - 1.1, c - r, zb + 0.15), W2(a + 1.1, c - r, zb + 0.15), W2(a + 1.1, c + r, zb + 0.15), W2(a - 1.1, c + r, zb + 0.15)], "#8f979f");
      poly7([W2(a - 1.1, c + r, zb + 0.15), W2(a + 1.1, c + r, zb + 0.15), W2(a + 1.1, c + r, zb + 1.1), W2(a - 1.1, c + r, zb + 1.1)], "#c9ced3");
      poly7([W2(a - 1.1, c - r, zb + 1.1), W2(a + 1.1, c - r, zb + 1.1), W2(a + 1.1, c + r, zb + 1.1), W2(a - 1.1, c + r, zb + 1.1)], "#e1e4e7");
    };
    const stab = (sg) => poly7([W2(-6.7, sg * hw, zt - 0.5), W2(-8.3, sg * 3.7, zt - 0.5), W2(-9.3, sg * 3.7, zt - 0.5), W2(-8.7, sg * hw, zt - 0.5)], shade(body, 0.9), "rgba(40,50,60,.4)");
    poly7(wingPoly(-1), shade(body, 0.86), "rgba(40,50,60,.45)");
    engine(-1);
    stab(-1);
    poly7([W2(-5.2, 0, zt), W2(-8.9, 0, zt), W2(-9.3, 0, zt + 3.4), W2(-7.6, 0, zt + 3.4)], col, "rgba(20,30,50,.5)");
    poly7([W2(-8, 0.05, zt + 1.2), W2(-8.8, 0.05, zt + 1.2), W2(-9, 0.05, zt + 2.4), W2(-8.2, 0.05, zt + 2.4)], "#fff");
    const nose = L2 + 1.5;
    poly7([W2(-L2, -hw, zt), W2(L2, -hw, zt), W2(L2, hw, zt), W2(-L2, hw, zt)], "#f6f7f8", "rgba(60,70,80,.35)");
    poly7([W2(-L2, hw, zb), W2(L2, hw, zb), W2(L2, hw, zt), W2(-L2, hw, zt)], body, "rgba(60,70,80,.4)");
    poly7([W2(-L2, hw, zb), W2(L2, hw, zb), W2(L2, hw, zb + 0.55), W2(-L2, hw, zb + 0.55)], col);
    poly7([W2(L2, -hw, zb), W2(L2, hw, zb), W2(L2, hw, zt), W2(L2, -hw, zt)], shade(body, 0.8));
    poly7([W2(L2, -0.6, zb + 0.5), W2(nose, -0.3, zb + 0.9), W2(nose, 0.3, zb + 0.9), W2(L2, 0.6, zb + 0.5)], shade(body, 0.95));
    poly7([W2(L2, -hw, zt), W2(nose, -0.35, zt - 0.6), W2(nose, 0.35, zt - 0.6), W2(L2, hw, zt)], "#eef0f2");
    poly7([W2(L2, hw, zb + 0.3), W2(nose, 0.4, zb + 0.5), W2(nose, 0.4, zt - 0.6), W2(L2, hw, zt)], shade(body, 0.88));
    for (let a = -8; a <= 7.2; a += 0.9) {
      if (Math.abs(a - 5.6) < 0.5) continue;
      poly7([W2(a, hw + 0.01, zt - 1.2), W2(a + 0.35, hw + 0.01, zt - 1.2), W2(a + 0.35, hw + 0.01, zt - 0.8), W2(a, hw + 0.01, zt - 0.8)], "#3a5670");
    }
    poly7([W2(5.2, hw + 0.01, zb + 0.55), W2(6, hw + 0.01, zb + 0.55), W2(6, hw + 0.01, zt - 0.4), W2(5.2, hw + 0.01, zt - 0.4)], "#aab2ba", "rgba(50,60,70,.5)");
    poly7([W2(L2 + 0.05, -0.55, zt - 1.2), W2(L2 + 0.05, 0.55, zt - 1.2), W2(L2 + 0.05, 0.55, zt - 0.7), W2(L2 + 0.05, -0.55, zt - 0.7)], "#2f4a63");
    poly7([W2(L2, hw, zt - 1.2), W2(nose - 0.4, 0.4, zt - 1), W2(nose - 0.4, 0.4, zt - 0.7), W2(L2, hw, zt - 0.7)], "#2f4a63");
    poly7(wingPoly(1), shade(body, 0.96), "rgba(40,50,60,.5)");
    poly7([W2(2.6, hw, zb + 0.7), W2(-0.9, hw, zb + 0.7), W2(-0.9, hw, zb + 0.55), W2(2.6, hw, zb + 0.55)], col);
    engine(1);
    stab(1);
    if (opt.night) {
      ctx4.fillStyle = "rgba(255,60,40,.9)";
      const a = W2(-1.2, -wing, zb + 1.2);
      ctx4.beginPath();
      ctx4.arc(a[0], a[1], Z * 0.5, 0, 7);
      ctx4.fill();
      ctx4.fillStyle = "rgba(80,255,120,.9)";
      const c = W2(-1.2, wing, zb + 1.2);
      ctx4.beginPath();
      ctx4.arc(c[0], c[1], Z * 0.5, 0, 7);
      ctx4.fill();
    }
  }
  function runwayCycle(minAbs, idx) {
    const T4 = 14;
    const ph = (minAbs + idx * 5) % T4 / T4;
    if (ph < 0.08) return { x: 0.15 + ph / 0.08 * 0.5, state: "land", alt: Math.max(0, 6 - ph / 0.08 * 6), dir: 1 };
    if (ph < 0.14) return { x: 0.65 + (ph - 0.08) / 0.06 * 0.2, state: "roll", alt: 0, dir: 1 };
    if (ph >= 0.5 && ph < 0.57) return { x: 0.2 + (ph - 0.5) / 0.07 * 0.55, state: "takeoffroll", alt: 0, dir: 1 };
    if (ph >= 0.57 && ph < 0.66) return { x: 0.75 + (ph - 0.57) / 0.09 * 0.25, state: "climb", alt: (ph - 0.57) / 0.09 * 9, dir: 1 };
    return null;
  }
  function drawAirfield(ctx4, P2, Z, rw, hero, night) {
    const q = (u0, v0, u1, v1, col, z = 0.02) => {
      ctx4.beginPath();
      const a = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
      a.forEach(([u, v], i) => {
        const x = P2.X(u, v), y = P2.Y(u, v, z);
        i ? ctx4.lineTo(x, y) : ctx4.moveTo(x, y);
      });
      ctx4.closePath();
      ctx4.fillStyle = col;
      ctx4.fill();
    };
    const near2 = (u, r = 52) => Math.abs(u - hero.x) < r;
    const y0 = rw.y0, y1 = rw.y1 + 1, x0 = rw.x0, x1 = rw.x1 + 1;
    if (Math.abs((y0 + rw.apron.y0) / 2 - hero.y) > 90) return;
    const asp = night ? "#3c3f45" : "#5d6066", tw = night ? "#43464c" : "#6e7176", ap = night ? "#57595e" : "#a3a5a8";
    const ax0 = rw.apron.x0, ax1 = rw.apron.x0 + rw.apron.w, ay0 = rw.apron.y0;
    q(Math.max(x0, hero.x - 60), y0, Math.min(x1, hero.x + 60), y1, asp);
    q(Math.max(x0, hero.x - 60), rw.taxi.y0, Math.min(x1, hero.x + 60), rw.taxi.y1 + 1, tw);
    const cx0 = ax0 + (rw.apron.w >> 1) - 2;
    q(cx0, rw.taxi.y1 + 1, cx0 + 4, ay0 + 1, tw);
    q(ax0, ay0, ax1, ay0 + 22, ap);
    for (let u = Math.max(x0 + 1, Math.floor(hero.x - 56)); u < Math.min(x1 - 1, hero.x + 56); u += 1) {
    }
    const l0 = Math.max(x0, Math.floor(hero.x - 56)), l1 = Math.min(x1, Math.ceil(hero.x + 56));
    if (l1 > l0) {
      q(l0, y0 + 0.15, l1, y0 + 0.35, "#e8e8e4");
      q(l0, y1 - 0.35, l1, y1 - 0.15, "#e8e8e4");
      for (let u = Math.ceil(l0 / 5) * 5; u < l1; u += 5) q(u, (y0 + y1) / 2 - 0.12, u + 2.6, (y0 + y1) / 2 + 0.12, "#f2f2ee");
    }
    for (const [e, dir] of [[x0, 1], [x1, -1]]) {
      if (!near2(e, 60)) continue;
      for (let k = 0; k < 8; k++) {
        const vv = y0 + 0.5 + k * ((y1 - y0 - 1.2) / 7);
        q(e + (dir > 0 ? 0.8 : -3.6), vv, e + (dir > 0 ? 3.6 : -0.8), vv + 0.28, "#f2f2ee");
      }
      for (let k = 0; k < 3; k++) {
        q(e + dir * (12 + k * 4) - (dir > 0 ? 0 : 1.6), y0 + 0.8, e + dir * (12 + k * 4) + (dir > 0 ? 1.6 : 0), y0 + 1.5, "#f2f2ee");
        q(e + dir * (12 + k * 4) - (dir > 0 ? 0 : 1.6), y1 - 1.5, e + dir * (12 + k * 4) + (dir > 0 ? 1.6 : 0), y1 - 0.8, "#f2f2ee");
      }
    }
    const tl = (rw.taxi.y0 + rw.taxi.y1 + 1) / 2;
    if (l1 > l0) q(l0, tl - 0.08, l1, tl + 0.08, "#e6c23a");
    q(cx0 + 1.9, rw.taxi.y1 + 1, cx0 + 2.1, ay0 + 11, "#e6c23a");
    for (const st3 of rw.stands) {
      if (!near2(st3.x, 40)) continue;
      q(st3.x - 10, st3.y - 11, st3.x + 10, st3.y - 10.85, "rgba(235,235,230,.8)");
      q(st3.x - 10, st3.y - 11, st3.x - 9.85, st3.y + 10.5, "rgba(235,235,230,.8)");
      q(st3.x + 9.85, st3.y - 11, st3.x + 10, st3.y + 10.5, "rgba(235,235,230,.8)");
      q(st3.x - 0.08, st3.y - 10.9, st3.x + 0.08, st3.y + 10, "#e6c23a");
      q(st3.x - 1.2, st3.y + 8.6, st3.x + 1.2, st3.y + 8.8, "#e6c23a");
    }
    const fc = rw.fc;
    if (fc && near2(fc.x0 + fc.w / 2, 60)) {
      const dx = rw.doorX;
      for (let r = 0; r < 1; r++) {
        const yy = fc.y0 + 5 + r * 7;
        for (let x = fc.x0 + 1; x < fc.x0 + fc.w - 1; x += 2.4) {
          if (Math.abs(x - dx) < 5) continue;
          q(x, yy, x + 0.1, yy + 5, "rgba(240,240,235,.75)");
        }
        q(fc.x0 + 1, yy, fc.x0 + fc.w - 1, yy + 0.1, "rgba(240,240,235,.5)");
      }
      for (let k = 0; k < 5; k++) q(dx - 2.5 + k * 1.1, fc.y0 - 0.4, dx - 2 + k * 1.1, fc.y0 + 4.3, "rgba(245,245,240,.85)");
    }
  }
  function drawLots(ctx4, P2, Z, lots, hero) {
    const q = (u0, v0, u1, v1, col, z = 0.02) => {
      ctx4.beginPath();
      [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].forEach(([u, v], i) => {
        const x = P2.X(u, v), y = P2.Y(u, v, z);
        i ? ctx4.lineTo(x, y) : ctx4.moveTo(x, y);
      });
      ctx4.closePath();
      ctx4.fillStyle = col;
      ctx4.fill();
    };
    for (const L2 of lots) {
      if (Math.abs(L2.x + L2.w / 2 - hero.x) > L2.w / 2 + 34 || Math.abs(L2.y + L2.h / 2 - hero.y) > L2.h / 2 + 30) continue;
      for (const yy of lotRows(L2)) {
        for (let x = L2.x + 1; x <= L2.x + L2.w - 1; x += 2.4) q(x, yy, x + 0.1, yy + 4.6, "rgba(240,240,235,.78)");
        q(L2.x + 1, yy, L2.x + L2.w - 1, yy + 0.1, "rgba(240,240,235,.55)");
      }
    }
  }
  function lotRows(L2) {
    const r = [];
    for (let y = L2.y + 1; y + 4.6 <= L2.y + L2.h - 0.5; y += 7) r.push(y);
    return r;
  }

