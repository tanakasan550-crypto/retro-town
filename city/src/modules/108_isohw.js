  // src/isohw.js
  var poly5 = (c, pts, fill) => {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  };
  var mk4 = (P2, s) => (p, q, z) => {
    const [u, v] = worldOf(s, p, q);
    return [P2.X(u, v), P2.Y(u, v, z)];
  };
  function tileBox(P2, Z, s, i, top) {
    const lo = s.kind === "tun" ? -1.5 : -0.3, hi2 = s.th + (s.kind === "tun" ? 1.5 : 0.3);
    const pt = mk4(P2, s);
    const xs = [], ys = [];
    for (const p of [i, i + 1]) for (const q of [lo, hi2]) {
      for (const z of [0, top]) {
        const a = pt(p, q, z);
        xs.push(a[0]);
        ys.push(a[1]);
      }
    }
    const [u0, v0] = worldOf(s, i, lo), [u1, v1] = worldOf(s, i + 1, hi2);
    return { x0: Math.min(u0, u1), y0: Math.min(v0, v1), x1: Math.max(u0, u1), y1: Math.max(v0, v1), sx0: Math.min(...xs) - 6 * Z, sx1: Math.max(...xs) + 6 * Z, sy0: Math.min(...ys) - 14 * Z, sy1: Math.max(...ys) + 4 * Z };
  }
  var box3 = (c, P2, s, p02, q0, p1, q1, z0, z1, top, lf, rt) => {
    const pt = mk4(P2, s);
    const near2 = (a, b, za, zb, col) => poly5(c, [pt(a[0], a[1], za), pt(b[0], b[1], za), pt(b[0], b[1], zb), pt(a[0], a[1], zb)], col);
    near2([p02, q1], [p1, q1], z0, z1, s.ax === "x" ? lf : rt);
    near2([p1, q0], [p1, q1], z0, z1, s.ax === "x" ? rt : lf);
    poly5(c, [pt(p02, q0, z1), pt(p1, q0, z1), pt(p1, q1, z1), pt(p02, q1, z1)], top);
  };
  function drawDeckTile(c, P2, Z, s, i, o) {
    const th = s.th, dk = DECK_THICK[s.kind];
    const z0 = zAt(s, i), z1 = zAt(s, i + 1), zm = zAt(s, i + 0.5);
    const pt = mk4(P2, s);
    const ex = s.kind === "exp";
    const col = ex ? { top: "#3b3e44", wallIn: "#c9c6bd", wallOut: "#b1aea5", cap: "#dddad1", under: "#7a7d83", pier: ["#bdb9b0", "#9d9a92", "#d3d0c8"] } : { top: "#454a4d", wallIn: "#bfbdb2", wallOut: "#a6a49a", cap: "#d0cec3", under: "#767a7c", pier: ["#b3b1a6", "#96948a", "#c6c4b9"] };
    if (o.alpha < 1) c.globalAlpha = o.alpha;
    if (zm > 2.4 && (i - s.a) % 5 === 2) {
      const w = 0.16, cq = th / 2;
      box3(c, P2, s, i + 0.5 - w, cq - w, i + 0.5 + w, cq + w, 0, zm - dk, col.pier[2], col.pier[0], col.pier[1]);
      box3(c, P2, s, i + 0.15, cq - th * 0.36, i + 0.85, cq + th * 0.36, zm - dk - 0.55, zm - dk, col.pier[2], col.pier[0], col.pier[1]);
    }
    poly5(c, [pt(i, th, z0 - dk), pt(i + 1, th, z1 - dk), pt(i + 1, th, z1), pt(i, th, z0)], col.under);
    poly5(c, [pt(i, 0, z0), pt(i + 1, 0, z1), pt(i + 1, 0, z1 + 1), pt(i, 0, z0 + 1)], col.wallIn);
    poly5(c, [pt(i, 0, z0 + 1), pt(i + 1, 0, z1 + 1), pt(i + 1, 0.16, z1 + 1), pt(i, 0.16, z0 + 1)], col.cap);
    poly5(c, [pt(i, 0, z0), pt(i + 1, 0, z1), pt(i + 1, th, z1), pt(i, th, z0)], col.top);
    const line2 = (q, a, b, colr, wd) => poly5(c, [pt(i + a, q - wd, z0 + (z1 - z0) * a + 0.02), pt(i + b, q - wd, z0 + (z1 - z0) * b + 0.02), pt(i + b, q + wd, z0 + (z1 - z0) * b + 0.02), pt(i + a, q + wd, z0 + (z1 - z0) * a + 0.02)], colr);
    line2(th / 2 - 0.05, 0, 1, "#e8c44a", 0.025);
    line2(th / 2 + 0.05, 0, 1, "#e8c44a", 0.025);
    if (th >= 4) {
      const ph = i - s.a & 1;
      line2(th / 4, 0.1 + 0.5 * ph, 0.5 + 0.5 * ph, "#eeeeea", 0.03);
      line2(th * 3 / 4, 0.1 + 0.5 * ph, 0.5 + 0.5 * ph, "#eeeeea", 0.03);
    }
    line2(0.12, 0, 1, "#eeeeea", 0.025);
    line2(th - 0.12, 0, 1, "#eeeeea", 0.025);
    if (o.riders && o.riders.length) {
      o.riders.sort((a, b) => a.k - b.k);
      for (const r of o.riders) {
        c.save();
        c.translate(0, -r.z * 12 * Z);
        r.it.draw(c);
        c.restore();
      }
    }
    poly5(c, [pt(i, th, z0 - dk), pt(i + 1, th, z1 - dk), pt(i + 1, th, z1 + 1), pt(i, th, z0 + 1)], col.wallOut);
    poly5(c, [pt(i, th, z0 + 0.62), pt(i + 1, th, z1 + 0.62), pt(i + 1, th, z1 + 0.7), pt(i, th, z0 + 0.7)], "rgba(255,255,255,0.28)");
    poly5(c, [pt(i, th - 0.16, z0 + 1), pt(i + 1, th - 0.16, z1 + 1), pt(i + 1, th, z1 + 1), pt(i, th, z0 + 1)], col.cap);
    if ((i - s.a) % 4 === 1 && zm > 1.2) {
      const a = pt(i + 0.5, th - 0.12, zm + 1), b = pt(i + 0.5, th - 0.12, zm + 5), h = pt(i + 0.5, th - 0.55, zm + 5);
      c.strokeStyle = "#59606a";
      c.lineWidth = Math.max(1, 0.9 * Z);
      c.beginPath();
      c.moveTo(a[0], a[1]);
      c.lineTo(b[0], b[1]);
      c.lineTo(h[0], h[1]);
      c.stroke();
      c.fillStyle = "#f2ecc4";
      c.beginPath();
      c.arc(h[0], h[1] + 0.8 * Z, 1.5 * Z, 0, 7);
      c.fill();
    }
    if (o.sign) {
      const a = pt(o.sign.p, -0.55, 0), b = pt(o.sign.p, -0.55, 3.6);
      c.strokeStyle = "#59606a";
      c.lineWidth = Math.max(1, 1.1 * Z);
      c.beginPath();
      c.moveTo(a[0], a[1]);
      c.lineTo(b[0], b[1]);
      c.stroke();
      const w = 25 * Z, h = 8.5 * Z, x = b[0] - w / 2, y = b[1] - h + 3 * Z;
      c.fillStyle = "#0d5a9c";
      c.fillRect(x, y, w, h);
      c.strokeStyle = "#fff";
      c.lineWidth = Math.max(1, 0.6 * Z);
      c.strokeRect(x + 0.8 * Z, y + 0.8 * Z, w - 1.6 * Z, h - 1.6 * Z);
      c.fillStyle = "#fff";
      c.font = `bold ${Math.round(3.6 * Z)}px sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(o.sign.text, x + w / 2, y + h * 0.36);
      c.font = `${Math.round(2.9 * Z)}px sans-serif`;
      c.fillText(o.sign.sub, x + w / 2, y + h * 0.74);
    }
    c.globalAlpha = 1;
  }
  function lightDeckTile(c, P2, Z, s, i, o, glow2) {
    const zm = zAt(s, i + 0.5), th = s.th;
    const pt = mk4(P2, s);
    if ((i - s.a) % 4 === 1 && zm > 1.2) {
      const h = pt(i + 0.5, th - 0.55, zm + 5);
      glow2(c, h[0], h[1] + 0.8 * Z, 11 * Z, "rgba(255,238,170,0.7)");
      const g0 = pt(i + 0.5, th / 2, zm);
      glow2(c, g0[0], g0[1], 16 * Z, "rgba(255,230,160,0.22)");
    }
    if (o.riders) {
      for (const r of o.riders) if (r.it.lt) {
        c.save();
        c.translate(0, -r.z * 12 * Z);
        r.it.lt(c);
        c.restore();
      }
    }
    if (o.sign) {
      const b = pt(o.sign.p, -0.55, 3);
      glow2(c, b[0], b[1], 9 * Z, "rgba(120,190,255,0.5)");
    }
  }
  function drawFootTile(c, P2, Z, s, i, o) {
    const pt = mk4(P2, s);
    const tower = i === s.a || i === s.b;
    const dk = 0.45;
    const zd = s.Hh;
    if (o.alpha < 1) c.globalAlpha = o.alpha;
    if (tower) {
      box3(c, P2, s, i + 0.08, 0.1, i + 0.92, 0.9, 0, zd + 0.3, "#b9bcc2", "#a3a7ae", "#868a92");
    }
    const base = tower ? null : 1;
    if (base) {
      if (i === s.b - 1) box3(c, P2, s, i + 0.38, 0.36, i + 0.62, 0.64, 0, zd - dk, "#b9bcc2", "#a3a7ae", "#868a92");
      poly5(c, [pt(i, 1, zd - dk), pt(i + 1, 1, zd - dk), pt(i + 1, 1, zd), pt(i, 1, zd)], "#8a8e96");
      poly5(c, [pt(i, 0, zd), pt(i + 1, 0, zd), pt(i + 1, 1, zd), pt(i, 1, zd)], "#9ea2a9");
      if (o.riders && o.riders.length) for (const r of o.riders) {
        c.save();
        c.translate(0, -r.z * 12 * Z);
        r.it.draw(c);
        c.restore();
      }
      poly5(c, [pt(i, 1, zd), pt(i + 1, 1, zd), pt(i + 1, 1, zd + 1.3), pt(i, 1, zd + 1.3)], "rgba(130,180,205,0.5)");
      poly5(c, [pt(i, 0, zd + 1.7), pt(i + 1, 0, zd + 1.7), pt(i + 1, 1, zd + 1.7), pt(i, 1, zd + 1.7)], o.alpha < 1 ? "rgba(125,131,140,0.55)" : "#7d838c");
      poly5(c, [pt(i, 1, zd + 1.7), pt(i + 1, 1, zd + 1.7), pt(i + 1, 1, zd + 1.9), pt(i, 1, zd + 1.9)], "#6b7079");
    } else {
      for (let k = 0; k < 4; k++) {
        const z = 0.8 + k * 1.3;
        poly5(c, [pt(i + 0.15, 0.9, z), pt(i + 0.85, 0.9, z), pt(i + 0.85, 0.9, z + 0.7), pt(i + 0.15, 0.9, z + 0.7)], "#4c6f8c");
      }
      if (o.riders && o.riders.length) for (const r of o.riders) {
        c.save();
        c.translate(0, -r.z * 12 * Z);
        r.it.draw(c);
        c.restore();
      }
    }
    c.globalAlpha = 1;
  }
  function drawTunnelTile(c, P2, Z, s, i, o) {
    const th = s.th, Hh = s.Hh, pt = mk4(P2, s);
    const lo = -1.5, hi2 = th + 1.5, cl = 0.4, ch = th - 0.4;
    if (o.alpha < 1) c.globalAlpha = o.alpha;
    const seed = (i * 2654435761 >>> 0) % 97;
    poly5(c, [pt(i, hi2, 0), pt(i + 1, hi2, 0), pt(i + 1, ch, Hh), pt(i, ch, Hh)], "#6d7c52");
    poly5(c, [pt(i, cl, Hh), pt(i + 1, cl, Hh), pt(i + 1, ch, Hh), pt(i, ch, Hh)], "#86a062");
    for (let k = 0; k < 3; k++) {
      const q = ch + 0.25 + (seed + k * 29) % 100 / 100 * (hi2 - ch - 0.5), z = Hh * (1 - (q - ch) / (hi2 - ch)) * 0.9 + 0.2;
      const a = pt(i + 0.15 + (seed + k * 13) % 70 / 100, q, z);
      c.fillStyle = k % 2 ? "#8e8f86" : "#5c6a44";
      c.beginPath();
      c.ellipse(a[0], a[1], 2.6 * Z, 1.6 * Z, 0, 0, 7);
      c.fill();
    }
    if (i % 3 === 0) {
      const a = pt(i + 0.5, (cl + ch) / 2, Hh), b = pt(i + 0.5, (cl + ch) / 2, Hh + 3.2);
      c.fillStyle = "#5a3d27";
      c.fillRect(a[0] - 0.8 * Z, b[1] + 6 * Z, 1.6 * Z, a[1] - b[1] - 6 * Z);
      c.fillStyle = "#3f7a45";
      c.beginPath();
      c.moveTo(b[0], b[1]);
      c.lineTo(b[0] + 4 * Z, b[1] + 9 * Z);
      c.lineTo(b[0] - 4 * Z, b[1] + 9 * Z);
      c.fill();
    }
    if (i === s.b) {
      const pp = i + 1;
      poly5(c, [pt(pp, lo, 0), pt(pp, hi2, 0), pt(pp, ch, Hh), pt(pp, cl, Hh)], s.ax === "x" ? "#8d8f86" : "#8a8c83");
      poly5(c, [pt(pp, lo, 0), pt(pp, hi2, 0), pt(pp, hi2 - 0.2, 0), pt(pp, lo + 0.2, 0)], "#6e7066");
      const m = 0.25, a0 = m, a1 = th - m, zh = 3.2;
      const arch = [];
      arch.push(pt(pp, a0, 0));
      for (let k = 0; k <= 10; k++) {
        const t = Math.PI * k / 10;
        arch.push(pt(pp, th / 2 - (th / 2 - m) * Math.cos(t), zh + 0.7 * Math.sin(t)));
      }
      arch.push(pt(pp, a1, 0));
      poly5(c, arch, "#101215");
      c.strokeStyle = "#c9c7bd";
      c.lineWidth = Math.max(1, 1.2 * Z);
      c.beginPath();
      c.moveTo(arch[0][0], arch[0][1]);
      for (let k = 1; k < arch.length; k++) c.lineTo(arch[k][0], arch[k][1]);
      c.stroke();
      const t0 = pt(pp, th / 2, zh + 1.7), w = 17 * Z, h = 5 * Z;
      c.fillStyle = "#1d5f4a";
      c.fillRect(t0[0] - w / 2, t0[1] - h / 2, w, h);
      c.fillStyle = "#fff";
      c.font = `bold ${Math.round(3.3 * Z)}px sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(s.name, t0[0], t0[1]);
      for (const q of [m + 0.15, th - m - 0.15]) {
        const l = pt(pp, q, zh - 0.1);
        c.fillStyle = "#ffb347";
        c.beginPath();
        c.arc(l[0], l[1], 1.1 * Z, 0, 7);
        c.fill();
      }
    }
    c.globalAlpha = 1;
  }
  function lightTunnelTile(c, P2, Z, s, i, glow2) {
    if (i !== s.b) return;
    const pt = mk4(P2, s);
    const pp = i + 1;
    for (const q of [0.4, s.th - 0.4]) {
      const l = pt(pp, q, 3.1);
      glow2(c, l[0], l[1], 9 * Z, "rgba(255,170,70,0.85)");
    }
    const m = pt(pp, s.th / 2, 1.6);
    glow2(c, m[0], m[1], 15 * Z, "rgba(255,190,100,0.28)");
  }

