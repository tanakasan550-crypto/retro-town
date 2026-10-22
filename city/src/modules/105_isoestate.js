  // src/isoestate.js
  var sh = (hex2, f2) => {
    const n2 = parseInt(hex2.slice(1), 16);
    const r = Math.min(255, Math.max(0, Math.round((n2 >> 16 & 255) * f2))), g = Math.min(255, Math.max(0, Math.round((n2 >> 8 & 255) * f2))), b = Math.min(255, Math.max(0, Math.round((n2 & 255) * f2)));
    return `rgb(${r},${g},${b})`;
  };
  var quad = (ctx4, P2, pts, fill, stroke) => {
    ctx4.beginPath();
    pts.forEach(([x, y, z], i) => {
      const px2 = P2.X(x, y), py = P2.Y(x, y, z || 0);
      i ? ctx4.lineTo(px2, py) : ctx4.moveTo(px2, py);
    });
    ctx4.closePath();
    if (fill) {
      ctx4.fillStyle = fill;
      ctx4.fill();
    }
    if (stroke) {
      ctx4.strokeStyle = stroke;
      ctx4.lineWidth = 1;
      ctx4.stroke();
    }
  };
  function prism2(ctx4, P2, x0, y0, x1, y1, z0, z1, col) {
    quad(ctx4, P2, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], sh(col, 0.92));
    quad(ctx4, P2, [[x1, y1, z0], [x1, y0, z0], [x1, y0, z1], [x1, y1, z1]], sh(col, 0.72));
    quad(ctx4, P2, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], sh(col, 1.08));
  }
  var ell2 = (ctx4, P2, cx, cy, r, z, fill, stroke, Z) => {
    const X = P2.X(cx, cy), Y2 = P2.Y(cx, cy, z);
    ctx4.beginPath();
    ctx4.ellipse(X, Y2, Math.abs(r * 22.6 * Z), Math.abs(r * 11.3 * Z), 0, 0, 7);
    if (fill) {
      ctx4.fillStyle = fill;
      ctx4.fill();
    }
    if (stroke) {
      ctx4.strokeStyle = stroke;
      ctx4.lineWidth = Math.max(1, Z * 0.8);
      ctx4.stroke();
    }
  };
  var line = (ctx4, P2, a, b, col, w = 1, z = 0.03) => {
    ctx4.strokeStyle = col;
    ctx4.lineWidth = w;
    ctx4.beginPath();
    ctx4.moveTo(P2.X(a[0], a[1]), P2.Y(a[0], a[1], z));
    ctx4.lineTo(P2.X(b[0], b[1]), P2.Y(b[0], b[1], z));
    ctx4.stroke();
  };
  var rectP = (ctx4, P2, x, y, w, h, fill, z = 0.02) => quad(ctx4, P2, [[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]], fill);
  function drawEstateGround(ctx4, P2, Z, estates, hero, tsec) {
    for (const E2 of estates) {
      if (Math.abs(E2.x0 + E2.w / 2 - hero.x) > E2.w / 2 + 40 || Math.abs(E2.y0 + E2.h / 2 - hero.y) > E2.h / 2 + 34) continue;
      const { x0, y0 } = E2;
      const lw = Math.max(1, Z * 0.8);
      for (let j = 2; j < E2.h - 2; j += 2) {
        if (j >> 1 & 1) rectP(ctx4, P2, x0 + 1, y0 + j, E2.w - 2, 1, "rgba(255,255,255,0.045)", 0.01);
      }
      ctx4.save();
      line(ctx4, P2, [x0 + 30, y0 + 28], [x0 + 30, y0 + 29], "rgba(255,255,255,0.0)", 1);
      for (const k of [-1.9, 1.9]) line(ctx4, P2, [x0 + 30 + k, y0 + 41.5], [x0 + 30 + k, y0 + 28], "rgba(232,226,208,0.55)", lw, 0.03);
      {
        const c = E2.ring;
        ctx4.setLineDash([3 * Z, 3 * Z]);
        ell2(ctx4, P2, c.cx + 0.5, c.cy + 0.5, 5.5, 0.03, null, "rgba(240,235,215,0.55)", Z);
        ctx4.setLineDash([]);
        ell2(ctx4, P2, c.cx + 0.5, c.cy + 0.5, 3.7, 0.04, null, "rgba(235,228,205,0.9)", Z);
      }
      for (let i = 0; i < 7; i++) line(ctx4, P2, [x0 + 3 + i * 3.8, y0 + 27.2], [x0 + 3 + i * 3.8, y0 + 29.8], "rgba(250,250,245,0.55)", lw, 0.03);
      {
        const c = E2.fountain;
        ell2(ctx4, P2, c.cx + 0.5, c.cy + 0.5, 1.9, 0.08, "#c9c3b2", "#8f8a7c", Z);
        ell2(ctx4, P2, c.cx + 0.5, c.cy + 0.5, 1.55, 0.14, "#6fb7d6", "rgba(255,255,255,0.6)", Z);
        const ph = tsec * 0.8 % 1;
        ell2(ctx4, P2, c.cx + 0.5, c.cy + 0.5, 0.35 + ph * 1, 0.16, null, `rgba(255,255,255,${(0.7 * (1 - ph)).toFixed(2)})`, Z);
      }
      {
        const [px2, py, pw, ph] = E2.pool;
        rectP(ctx4, P2, px2 - 0.4, py - 0.4, pw + 0.8, ph + 0.8, "#e9e4d6", 0.03);
        rectP(ctx4, P2, px2, py, pw, ph, "#35b6d6", 0.05);
        rectP(ctx4, P2, px2 + 0.2, py + 0.2, pw - 0.4, ph - 0.4, "#4cc8e4", 0.055);
        for (let i = 1; i < 4; i++) line(ctx4, P2, [px2 + 0.4, py + i * ph / 4], [px2 + pw - 0.4, py + i * ph / 4], "rgba(255,255,255,0.45)", lw, 0.06);
        for (let k = 0; k < 14; k++) {
          const u = px2 + 0.5 + hash2(k, 51) % 100 / 100 * (pw - 1), v = py + 0.4 + hash2(k, 52) % 100 / 100 * (ph - 0.8);
          const a = 0.25 + 0.25 * Math.sin(tsec * 2 + k);
          ell2(ctx4, P2, u, v, 0.18, 0.07, `rgba(255,255,255,${a.toFixed(2)})`, null, Z);
        }
      }
      {
        const [tx, ty, tw, th] = E2.tennis;
        rectP(ctx4, P2, tx - 0.5, ty - 0.5, tw + 1, th + 1, "#3d6e8f", 0.03);
        const cx0 = tx + 2.2, cy0 = ty + 0.5, cw = tw - 4.4, ch = th - 1;
        rectP(ctx4, P2, cx0, cy0, cw, ch, "#4e9a62", 0.04);
        const w = "rgba(255,255,255,0.92)";
        const ln = (a, b) => line(ctx4, P2, a, b, w, Math.max(1.2, Z * 1.1), 0.05);
        ln([cx0, cy0], [cx0 + cw, cy0]);
        ln([cx0, cy0 + ch], [cx0 + cw, cy0 + ch]);
        ln([cx0, cy0], [cx0, cy0 + ch]);
        ln([cx0 + cw, cy0], [cx0 + cw, cy0 + ch]);
        ln([cx0 + cw * 0.14, cy0], [cx0 + cw * 0.14, cy0 + ch]);
        ln([cx0 + cw * 0.86, cy0], [cx0 + cw * 0.86, cy0 + ch]);
        ln([cx0 + cw * 0.14, cy0 + ch * 0.27], [cx0 + cw * 0.86, cy0 + ch * 0.27]);
        ln([cx0 + cw * 0.14, cy0 + ch * 0.73], [cx0 + cw * 0.86, cy0 + ch * 0.73]);
        ln([cx0 + cw / 2, cy0 + ch * 0.27], [cx0 + cw / 2, cy0 + ch * 0.73]);
      }
      {
        const [gx, gy, gw, gh] = E2.golf;
        for (let i = 0; i < gw; i += 2) rectP(ctx4, P2, gx + i, gy, 1, gh, i % 4 === 0 ? "rgba(120,200,110,0.55)" : "rgba(80,160,80,0.5)", 0.02);
        ell2(ctx4, P2, gx + gw - 4, gy + 4, 2.6, 0.04, "#7fd081", "#5fae62", Z);
        ell2(ctx4, P2, gx + gw - 4 - 0.3, gy + 4.2, 0.3, 0.05, "#222", null, Z);
        ell2(ctx4, P2, gx + 12, gy + 3, 1.6, 0.04, "#e9d9a4", null, Z);
        ell2(ctx4, P2, gx + 15, gy + 7, 1.2, 0.04, "#e9d9a4", null, Z);
        for (let k = 0; k < 4; k++) rectP(ctx4, P2, gx + 0.5, gy + 1 + k * 2, 1.4, 1.1, "#2f8f4e", 0.05);
      }
      {
        const c = E2.heli;
        ell2(ctx4, P2, c.cx + 1, c.cy + 1, 5.2, 0.04, "#9a9fa6", "#e9e9e9", Z);
        ell2(ctx4, P2, c.cx + 1, c.cy + 1, 4.4, 0.05, null, "#f2c94c", Z);
        const hz = 0.06;
        const L2 = (a, b) => line(ctx4, P2, a, b, "#f4f4f4", Math.max(2, Z * 2.2), hz);
        L2([c.cx - 0.7, c.cy - 1.5], [c.cx - 0.7, c.cy + 3.5]);
        L2([c.cx + 2.7, c.cy - 1.5], [c.cx + 2.7, c.cy + 3.5]);
        L2([c.cx - 0.7, c.cy + 1], [c.cx + 2.7, c.cy + 1]);
      }
      ctx4.restore();
    }
  }
  function drawWallTile(ctx4, P2, Z, x, y, k6) {
    const col = "#cfc6b2";
    prism2(ctx4, P2, x, y + 0.25, x + 1, y + 0.75, 0, 2.5, col);
    quad(ctx4, P2, [[x, y + 0.25, 2.5], [x + 1, y + 0.25, 2.5], [x + 1, y + 0.25, 2.62], [x, y + 0.25, 2.62]], null);
    prism2(ctx4, P2, x - 0.02, y + 0.2, x + 1.02, y + 0.8, 2.5, 2.7, "#b3aa96");
    ctx4.strokeStyle = "rgba(70,60,45,0.2)";
    ctx4.lineWidth = 1;
    for (let z = 0.5; z < 2.5; z += 0.5) {
      const a = [P2.X(x, y + 0.75), P2.Y(x, y + 0.75, z)], b = [P2.X(x + 1, y + 0.75), P2.Y(x + 1, y + 0.75, z)];
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.stroke();
    }
    if (k6) {
      prism2(ctx4, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.9, 0, 3.1, "#e2dac6");
      prism2(ctx4, P2, x, y, x + 1, y + 1, 3.1, 3.3, "#a69d88");
    }
  }
  function drawGatePillar(ctx4, P2, Z, x, y, night) {
    prism2(ctx4, P2, x + 0.1, y + 0.1, x + 0.9, y + 0.9, 0, 4, "#e6dfcd");
    prism2(ctx4, P2, x, y, x + 1, y + 1, 4, 4.3, "#a69d88");
    prism2(ctx4, P2, x + 0.3, y + 0.3, x + 0.7, y + 0.7, 4.3, 5, night ? "#fff0b0" : "#f4ecd2");
    const q = [P2.X(x + 0.5, y + 1), P2.Y(x + 0.5, y + 1, 4.65)];
    ctx4.fillStyle = night ? "rgba(255,240,170,0.95)" : "#fff6cf";
    ctx4.beginPath();
    ctx4.arc(q[0], q[1], Math.max(2, Z * 1.6), 0, 7);
    ctx4.fill();
  }
  function drawGateLeaf(ctx4, P2, Z, x, y0, y1) {
    ctx4.strokeStyle = "#26282d";
    ctx4.lineWidth = Math.max(1, Z * 0.9);
    for (let v = Math.min(y0, y1); v <= Math.max(y0, y1) + 0.01; v += 0.22) {
      const a = [P2.X(x, v), P2.Y(x, v, 0.1)], b = [P2.X(x, v), P2.Y(x, v, 2.4)];
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.stroke();
    }
    for (const z of [0.2, 1.2, 2.4]) {
      const a = [P2.X(x, y0), P2.Y(x, y0, z)], b = [P2.X(x, y1), P2.Y(x, y1, z)];
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.stroke();
    }
    ctx4.fillStyle = "#c9a23a";
    const m = [P2.X(x, (y0 + y1) / 2), P2.Y(x, (y0 + y1) / 2, 1.6)];
    ctx4.beginPath();
    ctx4.arc(m[0], m[1], Math.max(1.5, Z * 1.2), 0, 7);
    ctx4.fill();
  }
  function drawGuardhouse(ctx4, P2, Z, x, y) {
    prism2(ctx4, P2, x, y, x + 3, y + 2, 0, 2.8, "#d8d2c0");
    quad(ctx4, P2, [[x + 0.3, y + 2, 0.9], [x + 2.7, y + 2, 0.9], [x + 2.7, y + 2, 2.3], [x + 0.3, y + 2, 2.3]], "rgba(150,200,225,0.8)");
    prism2(ctx4, P2, x - 0.25, y - 0.25, x + 3.25, y + 2.25, 2.8, 3.05, "#5a5f6a");
  }
  function drawFountainJet(ctx4, P2, Z, cx, cy, tsec) {
    const X = P2.X(cx, cy), Y2 = P2.Y(cx, cy, 0.3);
    ctx4.fillStyle = "#d4cdbb";
    ctx4.beginPath();
    ctx4.ellipse(X, P2.Y(cx, cy, 0.5), 0.6 * 22.6 * Z, 0.6 * 11.3 * Z, 0, 0, 7);
    ctx4.fill();
    prism2(ctx4, P2, cx - 0.2, cy - 0.2, cx + 0.2, cy + 0.2, 0.3, 1.6, "#c4bdac");
    ctx4.strokeStyle = "rgba(200,235,255,0.85)";
    ctx4.lineWidth = Math.max(1, Z);
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * Math.PI * 2 + tsec * 0.6, r = 0.9 + 0.15 * Math.sin(tsec * 3 + k);
      ctx4.beginPath();
      ctx4.moveTo(X, P2.Y(cx, cy, 1.9));
      ctx4.quadraticCurveTo(P2.X(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5), P2.Y(cx, cy, 3 + 0.4 * Math.sin(tsec * 2 + k)), P2.X(cx + Math.cos(a) * r, cy + Math.sin(a) * r), Y2 + 0);
      ctx4.stroke();
    }
    void Y2;
  }
  function drawHeli(ctx4, P2, Z, cx, cy, tsec) {
    const X = P2.X(cx, cy), Y0 = P2.Y(cx, cy, 0);
    ctx4.fillStyle = "rgba(0,0,0,0.22)";
    ctx4.beginPath();
    ctx4.ellipse(X, Y0, 2.6 * 22.6 * Z * 0.8, 2.6 * 11.3 * Z * 0.8, 0, 0, 7);
    ctx4.fill();
    ctx4.strokeStyle = "#33373d";
    ctx4.lineWidth = Math.max(1.5, Z * 1.3);
    for (const dx of [-0.9, 0.9]) {
      const a = [P2.X(cx + dx - 0.2, cy - 1.2), P2.Y(cx + dx - 0.2, cy - 1.2, 0.2)], b = [P2.X(cx + dx + 0.2, cy + 1.2), P2.Y(cx + dx + 0.2, cy + 1.2, 0.2)];
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.stroke();
    }
    ctx4.fillStyle = "#e8edf2";
    quad(ctx4, P2, [[cx - 0.3, cy + 0.6, 1.1], [cx + 0.3, cy + 0.6, 1.1], [cx + 0.15, cy + 3.8, 1.7], [cx - 0.15, cy + 3.8, 1.7]], "#e8edf2");
    prism2(ctx4, P2, cx - 0.12, cy + 3.5, cx + 0.12, cy + 3.9, 1.3, 2.4, "#c8352b");
    const bx = P2.X(cx, cy + 0.2), by = P2.Y(cx, cy + 0.2, 1.4);
    ctx4.fillStyle = "#1f3b6e";
    ctx4.beginPath();
    ctx4.ellipse(bx, by, 1.15 * 22.6 * Z * 0.62, 1.55 * 11.3 * Z * 0.9, 0, 0, 7);
    ctx4.fill();
    ctx4.fillStyle = "#eef2f6";
    ctx4.beginPath();
    ctx4.ellipse(bx, by - 2 * Z, 1 * 22.6 * Z * 0.55, 1.3 * 11.3 * Z * 0.8, 0, 0, 7);
    ctx4.fill();
    ctx4.fillStyle = "rgba(120,180,220,0.85)";
    ctx4.beginPath();
    ctx4.ellipse(bx, by - 3 * Z, 0.7 * 22.6 * Z * 0.5, 0.7 * 11.3 * Z * 0.7, 0, 0, 7);
    ctx4.fill();
    const mx = P2.X(cx, cy + 0.1), my = P2.Y(cx, cy + 0.1, 2.2);
    ctx4.strokeStyle = "#2a2d33";
    ctx4.lineWidth = Math.max(1, Z * 0.9);
    ctx4.beginPath();
    ctx4.moveTo(bx, by - 4 * Z);
    ctx4.lineTo(mx, my);
    ctx4.stroke();
    const ang = tsec * 0.5;
    ctx4.strokeStyle = "rgba(40,44,52,0.85)";
    ctx4.lineWidth = Math.max(1.5, Z * 1.4);
    for (let k = 0; k < 2; k++) {
      const a = ang + k * Math.PI;
      ctx4.beginPath();
      ctx4.moveTo(mx - Math.cos(a) * 4.4 * 22.6 * Z * 0.5, my - Math.sin(a) * 4.4 * 11.3 * Z * 0.5);
      ctx4.lineTo(mx + Math.cos(a) * 4.4 * 22.6 * Z * 0.5, my + Math.sin(a) * 4.4 * 11.3 * Z * 0.5);
      ctx4.stroke();
    }
  }
  function drawTennisNet(ctx4, P2, Z, tx, ty, tw, th) {
    const cx0 = tx + 2.2, cw = tw - 4.4, yy = ty + th / 2;
    ctx4.strokeStyle = "#2b2b2b";
    ctx4.lineWidth = Math.max(1, Z);
    const a = [P2.X(cx0 - 0.3, yy), P2.Y(cx0 - 0.3, yy, 1)], b = [P2.X(cx0 + cw + 0.3, yy), P2.Y(cx0 + cw + 0.3, yy, 1)];
    ctx4.beginPath();
    ctx4.moveTo(a[0], a[1]);
    ctx4.lineTo(b[0], b[1]);
    ctx4.stroke();
    ctx4.fillStyle = "rgba(245,245,245,0.55)";
    ctx4.beginPath();
    ctx4.moveTo(a[0], a[1]);
    ctx4.lineTo(b[0], b[1]);
    ctx4.lineTo(P2.X(cx0 + cw + 0.3, yy), P2.Y(cx0 + cw + 0.3, yy, 0.1));
    ctx4.lineTo(P2.X(cx0 - 0.3, yy), P2.Y(cx0 - 0.3, yy, 0.1));
    ctx4.closePath();
    ctx4.fill();
    for (const u of [cx0 - 0.3, cx0 + cw + 0.3]) {
      const p02 = [P2.X(u, yy), P2.Y(u, yy, 0)], p1 = [P2.X(u, yy), P2.Y(u, yy, 1.1)];
      ctx4.strokeStyle = "#555";
      ctx4.beginPath();
      ctx4.moveTo(p02[0], p02[1]);
      ctx4.lineTo(p1[0], p1[1]);
      ctx4.stroke();
    }
  }
  function drawGolfFlag(ctx4, P2, Z, x, y) {
    const p02 = [P2.X(x, y), P2.Y(x, y, 0)], p1 = [P2.X(x, y), P2.Y(x, y, 2)];
    ctx4.strokeStyle = "#ececec";
    ctx4.lineWidth = Math.max(1, Z * 0.8);
    ctx4.beginPath();
    ctx4.moveTo(p02[0], p02[1]);
    ctx4.lineTo(p1[0], p1[1]);
    ctx4.stroke();
    ctx4.fillStyle = "#e0392d";
    ctx4.beginPath();
    ctx4.moveTo(p1[0], p1[1]);
    ctx4.lineTo(p1[0] + 7 * Z, p1[1] + 2.5 * Z);
    ctx4.lineTo(p1[0], p1[1] + 5 * Z);
    ctx4.closePath();
    ctx4.fill();
  }
  function drawLounger(ctx4, P2, Z, x, y) {
    prism2(ctx4, P2, x, y, x + 0.7, y + 1.7, 0, 0.35, "#f1efe8");
    prism2(ctx4, P2, x, y, x + 0.7, y + 0.5, 0.3, 0.8, "#f1efe8");
    prism2(ctx4, P2, x + 1, y + 0.4, x + 1.5, y + 0.9, 0, 0.9, "#7aa7c7");
    quad(ctx4, P2, [[x + 0.9, y + 0.3, 1.9], [x + 1.6, y + 0.3, 1.9], [x + 1.6, y + 1, 1.9], [x + 0.9, y + 1, 1.9]], "#f4a259");
  }

