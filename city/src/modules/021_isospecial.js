  // src/isospecial.js
  var SPECIAL = /* @__PURE__ */ new Set(["temple", "shrine", "gas", "cardealer", "usedcar", "stadium", "airport", "station"]);
  var prism = (poly7, P2, u0, v0, u1, v1, z0, z1, cs, ce, ct) => {
    poly7([P2(u0, v1, z0), P2(u1, v1, z0), P2(u1, v1, z1), P2(u0, v1, z1)], cs);
    poly7([P2(u1, v1, z0), P2(u1, v0, z0), P2(u1, v0, z1), P2(u1, v1, z1)], ce);
    if (ct) poly7([P2(u0, v0, z1), P2(u1, v0, z1), P2(u1, v1, z1), P2(u0, v1, z1)], ct);
  };
  function hipRoof(ctx4, poly7, P2, u0, v0, u1, v1, ze, zr, col, tile) {
    const d = Math.min(u1 - u0, v1 - v0) / 2, vm = (v0 + v1) / 2;
    const ra = [u0 + d, vm], rb = [u1 - d, vm];
    poly7([P2(u0, v1, ze), P2(u1, v1, ze), P2(rb[0], rb[1], zr), P2(ra[0], ra[1], zr)], shade(col, 1.1), "rgba(20,20,25,.55)", 1);
    poly7([P2(u1, v1, ze), P2(u1, v0, ze), P2(rb[0], rb[1], zr)], shade(col, 0.82), "rgba(20,20,25,.55)", 1);
    if (tile) {
      ctx4.strokeStyle = "rgba(255,255,255,.12)";
      ctx4.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        const a = [u0 + (ra[0] - u0) * t, v1 + (ra[1] - v1) * t], c = [u1 + (rb[0] - u1) * t, v1 + (rb[1] - v1) * t];
        const p2 = P2(a[0], a[1], ze + (zr - ze) * t), q2 = P2(c[0], c[1], ze + (zr - ze) * t);
        ctx4.beginPath();
        ctx4.moveTo(p2[0], p2[1]);
        ctx4.lineTo(q2[0], q2[1]);
        ctx4.stroke();
      }
    }
    const p = P2(ra[0], ra[1], zr), q = P2(rb[0], rb[1], zr);
    ctx4.strokeStyle = shade(col, 0.55);
    ctx4.lineWidth = 2;
    ctx4.beginPath();
    ctx4.moveTo(p[0], p[1]);
    ctx4.lineTo(q[0], q[1]);
    ctx4.stroke();
  }
  function gableRoof(ctx4, poly7, P2, u0, v0, u1, v1, ze, zr, col) {
    const vm = (v0 + v1) / 2;
    poly7([P2(u0, v1, ze), P2(u1, v1, ze), P2(u1, vm, zr), P2(u0, vm, zr)], shade(col, 1.12), "rgba(20,30,25,.5)", 1);
    poly7([P2(u1, v1, ze), P2(u1, v0, ze), P2(u1, vm, zr)], shade(col, 0.9), "rgba(20,30,25,.5)", 1);
    void ctx4;
  }
  function paintStadium(ctx4, e, P2, poly7, mode2) {
    const { b, w, h, R: R5 } = e;
    const lit = mode2 !== "day";
    const hsh = HB(b.idx, 5);
    const zt = 7.2, wall = "#e6e8ea", rib = "#c7ccd2", conc = "#b9bdc2";
    const u0 = 0.25, v0 = 0.3, u1 = w - 0.25, v1 = h - 0.3;
    const doorU = Math.max(2, Math.min(w - 2, b.doorX - b.x + 0.5));
    if (!lit) {
      poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#cfcfc8");
      for (let u = 0.8; u < w; u += 1.6) poly7([P2(u, h - 0.05, 0.01), P2(u + 0.04, h - 0.05, 0.01), P2(u + 0.04, h, 0.01), P2(u, h, 0.01)], "#b7b7b0");
      poly7([P2(u0, v1, 0), P2(u1, v1, 0), P2(u1, v1, zt), P2(u0, v1, zt)], wall);
      poly7([P2(u1, v1, 0), P2(u1, v0, 0), P2(u1, v0, zt), P2(u1, v1, zt)], shade(wall, 0.78));
      for (let u = u0 + 0.5; u < u1 - 0.9; u += 1) {
        if (Math.abs(u + 0.3 - doorU) < 1.4) continue;
        poly7([P2(u, v1, 0), P2(u + 0.6, v1, 0), P2(u + 0.6, v1, 2.2), P2(u + 0.3, v1, 2.7), P2(u, v1, 2.2)], "#4a5058");
      }
      for (let v = v0 + 0.6; v < v1 - 0.7; v += 1) poly7([P2(u1, v + 0.6, 0), P2(u1, v, 0), P2(u1, v, 2.2), P2(u1, v + 0.3, 2.7), P2(u1, v + 0.6, 2.2)], "#3a3f46");
      poly7([P2(u0, v1, 3.2), P2(u1, v1, 3.2), P2(u1, v1, 5.6), P2(u0, v1, 5.6)], "#8fb4c8");
      poly7([P2(u1, v1, 3.2), P2(u1, v0, 3.2), P2(u1, v0, 5.6), P2(u1, v1, 5.6)], "#6f93a8");
      for (let u = u0; u <= u1 + 0.01; u += 1) poly7([P2(u - 0.07, v1, 0), P2(u + 0.07, v1, 0), P2(u + 0.07, v1, zt), P2(u - 0.07, v1, zt)], rib);
      for (let v = v0; v <= v1 + 0.01; v += 1) poly7([P2(u1, v - 0.07, 0), P2(u1, v + 0.07, 0), P2(u1, v + 0.07, zt), P2(u1, v - 0.07, zt)], shade(rib, 0.8));
      poly7([P2(u0, v1, 5.6), P2(u1, v1, 5.6), P2(u1, v1, 6), P2(u0, v1, 6)], "#2f5fa8");
      poly7([P2(u1, v1, 5.6), P2(u1, v0, 5.6), P2(u1, v0, 6), P2(u1, v1, 6)], "#234a86");
      poly7([P2(doorU - 1.2, v1, 0), P2(doorU + 1.2, v1, 0), P2(doorU + 1.2, v1, 3.4), P2(doorU - 1.2, v1, 3.4)], "#2b2f36");
      poly7([P2(doorU - 1, v1, 0), P2(doorU + 1, v1, 0), P2(doorU + 1, v1, 3), P2(doorU - 1, v1, 3)], "#e9d9a0");
      for (let k = 0; k < 4; k++) poly7([P2(doorU - 1 + 0.5 * k + 0.22, v1, 0), P2(doorU - 1 + 0.5 * k + 0.28, v1, 0), P2(doorU - 1 + 0.5 * k + 0.28, v1, 3), P2(doorU - 1 + 0.5 * k + 0.22, v1, 3)], "#6a6f76");
      const hu0 = 1.7, hu1 = w - 1.7, hv0 = 1.5, hv1 = h - 1.5;
      poly7([P2(u0, v0, zt), P2(u1, v0, zt), P2(u1, v1, zt), P2(u0, v1, zt)], "#f2f4f6", "rgba(60,65,75,.5)", 1);
      const q = [P2(hu0, hv0, zt), P2(hu1, hv0, zt), P2(hu1, hv1, zt), P2(hu0, hv1, zt)];
      ctx4.save();
      ctx4.beginPath();
      q.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
      ctx4.closePath();
      ctx4.clip();
      poly7([P2(hu0 - 0.2, hv0 - 0.2, 0), P2(hu1 + 0.2, hv0 - 0.2, 0), P2(hu1 + 0.2, hv1 + 0.2, 0), P2(hu0 - 0.2, hv1 + 0.2, 0)], "#4f9a4a");
      for (let i = 0; i < 8; i++) {
        const a = hu0 + (hu1 - hu0) * i / 8;
        poly7([P2(a, hv0, 0.02), P2(a + (hu1 - hu0) / 16, hv0, 0.02), P2(a + (hu1 - hu0) / 16, hv1, 0.02), P2(a, hv1, 0.02)], i & 1 ? "#478f43" : "#58a652");
      }
      ctx4.strokeStyle = "rgba(255,255,255,.8)";
      ctx4.lineWidth = Math.max(1, R5 * 0.7);
      {
        const a = P2((hu0 + hu1) / 2, hv0, 0.03), c = P2((hu0 + hu1) / 2, hv1, 0.03);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
      {
        const a = P2(hu0 + 0.3, hv0 + 0.3, 0.03), bb = P2(hu1 - 0.3, hv0 + 0.3, 0.03), c = P2(hu1 - 0.3, hv1 - 0.3, 0.03), d = P2(hu0 + 0.3, hv1 - 0.3, 0.03);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(bb[0], bb[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.lineTo(d[0], d[1]);
        ctx4.closePath();
        ctx4.stroke();
      }
      const tiers = 6;
      for (let k = 0; k < tiers; k++) {
        const z0 = k * (zt / tiers), z1 = (k + 1) * (zt / tiers), vv = hv0 - 0.15 - (tiers - k) * 0 + k * -0;
        const cc = k % 2 ? "#2f5fa8" : "#b8352f";
        poly7([P2(hu0, hv0, z0), P2(hu1, hv0, z0), P2(hu1, hv0, z1), P2(hu0, hv0, z1)], shade(cc, k % 2 ? 0.95 : 1));
        for (let s = 0; s < 14; s++) {
          const uu = hu0 + (hu1 - hu0) * (s + 0.5) / 14;
          poly7([P2(uu - 0.08, hv0, z0 + 0.2), P2(uu + 0.08, hv0, z0 + 0.2), P2(uu + 0.08, hv0, z0 + 0.55), P2(uu - 0.08, hv0, z0 + 0.55)], k % 2 ? "#e9eef6" : "#f5d9d6");
        }
        poly7([P2(hu0, hv0, z0), P2(hu0, hv1, z0), P2(hu0, hv1, z1), P2(hu0, hv0, z1)], shade(cc, 0.78));
      }
      ctx4.restore();
      ctx4.strokeStyle = "rgba(90,96,108,.7)";
      ctx4.lineWidth = Math.max(1, R5 * 0.8);
      ctx4.beginPath();
      q.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
      ctx4.closePath();
      ctx4.stroke();
      poly7([P2(u0 - 0.2, v1 + 0.15, zt - 0.2), P2(u1 + 0.2, v1 + 0.15, zt - 0.2), P2(u1 + 0.2, v1 + 0.15, zt + 0.15), P2(u0 - 0.2, v1 + 0.15, zt + 0.15)], "#d9dde2");
      poly7([P2(u1 + 0.2, v1 + 0.15, zt - 0.2), P2(u1 + 0.2, v0, zt - 0.2), P2(u1 + 0.2, v0, zt + 0.15), P2(u1 + 0.2, v1 + 0.15, zt + 0.15)], "#aeb3ba");
      const tower = (u, v) => {
        poly7([P2(u - 0.06, v, 0), P2(u + 0.06, v, 0), P2(u + 0.06, v, 10.2), P2(u - 0.06, v, 10.2)], "#8a8f96");
        poly7([P2(u - 0.55, v, 9.6), P2(u + 0.55, v, 9.6), P2(u + 0.55, v, 10.6), P2(u - 0.55, v, 10.6)], "#dfe3e8", "rgba(60,64,72,.7)", 1);
        for (let i = 0; i < 4; i++) poly7([P2(u - 0.5 + i * 0.28, v, 9.7), P2(u - 0.3 + i * 0.28, v, 9.7), P2(u - 0.3 + i * 0.28, v, 10.5), P2(u - 0.5 + i * 0.28, v, 10.5)], "#fffbe0");
      };
      tower(u0 + 0.2, v1 + 0.5);
      tower(u1 - 0.2, v1 + 0.5);
      for (let k = -2; k <= 2; k++) {
        const fu = doorU + k * 1.3;
        poly7([P2(fu, v1 + 0.05, zt), P2(fu + 0.03, v1 + 0.05, zt), P2(fu + 0.03, v1 + 0.05, zt + 1.4), P2(fu, v1 + 0.05, zt + 1.4)], "#6d7279");
        poly7([P2(fu + 0.03, v1 + 0.05, zt + 1.4), P2(fu + 0.65, v1 + 0.05, zt + 1.25), P2(fu + 0.65, v1 + 0.05, zt + 0.85), P2(fu + 0.03, v1 + 0.05, zt + 0.95)], k + hsh & 1 ? "#c0392b" : "#2f5fa8");
      }
    } else {
      ctx4.fillStyle = "rgba(255,238,170,.9)";
      poly7([P2(doorU - 1, v1, 0), P2(doorU + 1, v1, 0), P2(doorU + 1, v1, 3), P2(doorU - 1, v1, 3)], "rgba(255,232,150,.85)");
      poly7([P2(u0, v1, 3.2), P2(u1, v1, 3.2), P2(u1, v1, 5.6), P2(u0, v1, 5.6)], "rgba(255,240,190,.55)");
      poly7([P2(u1, v1, 3.2), P2(u1, v0, 3.2), P2(u1, v0, 5.6), P2(u1, v1, 5.6)], "rgba(255,230,170,.45)");
      for (const [u, v] of [[u0 + 0.2, v1 + 0.5], [u1 - 0.2, v1 + 0.5]]) {
        const c = P2(u, v, 10.1);
        const g = ctx4.createRadialGradient(c[0], c[1], 1, c[0], c[1], 9 * R5 * 3);
        g.addColorStop(0, "rgba(255,250,215,.85)");
        g.addColorStop(1, "rgba(255,250,215,0)");
        ctx4.fillStyle = g;
        ctx4.beginPath();
        ctx4.arc(c[0], c[1], 9 * R5 * 3, 0, 7);
        ctx4.fill();
      }
    }
  }
  function paintAirport(ctx4, e, P2, poly7, mode2) {
    const { b, w, h, R: R5 } = e;
    const lit = mode2 !== "day";
    const doorU = Math.max(3, Math.min(w - 3, b.doorX - b.x + 0.5));
    const u0 = 0.2, u1 = w - 0.2, v0 = 0.4, v1 = h - 0.6, z1 = 4.4, z2 = 8, zr = 8.6, gl = "#86b4cc", gl2 = "#678fa8", wall = "#eef0f2", mul = "#5c6872", blue = "#1f4f93";
    const hu0 = w * 0.34, hu1 = w * 0.66, zh = 12;
    if (!lit) {
      poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#c9c9c3");
      poly7([P2(u0, v1, 0), P2(u1, v1, 0), P2(u1, v1, z1), P2(u0, v1, z1)], gl);
      poly7([P2(u1, v1, 0), P2(u1, v0, 0), P2(u1, v0, z1), P2(u1, v1, z1)], gl2);
      const v2 = v1 - 0.8;
      poly7([P2(u0, v2, z1), P2(u1, v2, z1), P2(u1, v2, z2), P2(u0, v2, z2)], "#9cc4d8");
      poly7([P2(u1, v2, z1), P2(u1, v0, z1), P2(u1, v0, z2), P2(u1, v2, z2)], "#7aa3b9");
      poly7([P2(u0, v1, z1), P2(u1, v1, z1), P2(u1, v2, z1), P2(u0, v2, z1)], "#d9dde0");
      ctx4.strokeStyle = mul;
      ctx4.lineWidth = Math.max(1, R5 * 0.5);
      for (let u = u0; u <= u1 + 0.01; u += 1.6) {
        let a = P2(u, v1, 0), c = P2(u, v1, z1);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
        a = P2(u, v2, z1);
        c = P2(u, v2, z2);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
      for (let v = v0; v <= v1 + 0.01; v += 1.6) {
        const a = P2(u1, v, 0), c = P2(u1, v, z1);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
        const a2 = P2(u1, v, z1), c2 = P2(u1, v, z2);
        ctx4.beginPath();
        ctx4.moveTo(a2[0], a2[1]);
        ctx4.lineTo(c2[0], c2[1]);
        ctx4.stroke();
      }
      {
        const a = P2(u0, v1, 2.2), c = P2(u1, v1, 2.2);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
      for (let u = 3.2; u < w - 2; u += 5.2) {
        const dw = Math.abs(u - doorU) < 2.6 ? 0 : 1;
        void dw;
        poly7([P2(u, v1, 0), P2(u + 1.8, v1, 0), P2(u + 1.8, v1, 2.8), P2(u, v1, 2.8)], "#2b333b");
        poly7([P2(u + 0.1, v1, 0), P2(u + 0.9, v1, 0), P2(u + 0.9, v1, 2.7), P2(u + 0.1, v1, 2.7)], "#b8dcec");
        poly7([P2(u + 0.95, v1, 0), P2(u + 1.75, v1, 0), P2(u + 1.75, v1, 2.7), P2(u + 0.95, v1, 2.7)], "#b8dcec");
      }
      const vc = v1 + 1.3;
      poly7([P2(u0 - 0.5, v1, z1 + 0.2), P2(u1 + 0.5, v1, z1 + 0.2), P2(u1 + 0.5, vc, z1 - 0.3), P2(u0 - 0.5, vc, z1 - 0.3)], "#f4f5f6", "rgba(60,70,80,.55)", 1);
      poly7([P2(u0 - 0.5, vc, z1 - 0.3), P2(u1 + 0.5, vc, z1 - 0.3), P2(u1 + 0.5, vc, z1 - 0.62), P2(u0 - 0.5, vc, z1 - 0.62)], "#cfd3d7");
      poly7([P2(u1 + 0.5, vc, z1 - 0.3), P2(u1 + 0.5, v1, z1 + 0.2), P2(u1 + 0.5, v1, z1 - 0.1), P2(u1 + 0.5, vc, z1 - 0.62)], "#9aa0a6");
      for (let u = u0 + 2; u < u1; u += 8) poly7([P2(u - 0.1, vc - 0.1, 0), P2(u + 0.1, vc - 0.1, 0), P2(u + 0.1, vc - 0.1, z1 - 0.6), P2(u - 0.1, vc - 0.1, z1 - 0.6)], "#8d949a");
      poly7([P2(u0 - 0.3, v0, z2), P2(u1 + 0.3, v0, z2), P2(u1 + 0.3, v2 + 0.5, z2), P2(u0 - 0.3, v2 + 0.5, z2)], "#f1f2f3", "rgba(70,80,90,.5)", 1);
      poly7([P2(u0 - 0.3, v2 + 0.5, z2), P2(u1 + 0.3, v2 + 0.5, z2), P2(u1 + 0.3, v2 + 0.5, z2 + 0.45), P2(u0 - 0.3, v2 + 0.5, z2 + 0.45)], "#dcdfe2");
      poly7([P2(u1 + 0.3, v2 + 0.5, z2), P2(u1 + 0.3, v0, z2), P2(u1 + 0.3, v0, z2 + 0.45), P2(u1 + 0.3, v2 + 0.5, z2 + 0.45)], "#b7bcc1");
      for (let u = 2; u < w - 3; u += 4.4) {
        if (u + 2.2 > hu0 - 0.4 && u < hu1 + 0.4) continue;
        poly7([P2(u, v0 + 1.2, z2 + 0.02), P2(u + 2.2, v0 + 1.2, z2 + 0.02), P2(u + 2.2, v2 - 0.4, z2 + 0.02), P2(u, v2 - 0.4, z2 + 0.02)], "#a9cde0", "rgba(60,80,95,.5)", 1);
      }
      for (let u = 3; u < w - 3; u += 9) {
        if (u > hu0 - 2 && u < hu1 + 1) continue;
        ctx4.fillStyle = "rgba(0,0,0,0)";
        prism(poly7, P2, u, v0 + 0.3, u + 1.4, v0 + 1, z2, z2 + 0.9, "#b8bfc5", "#8f979d", "#d3d8dc");
      }
      const hv = v2 - 0.2;
      poly7([P2(hu0, hv, z2), P2(hu1, hv, z2), P2(hu1, hv, zh), P2(hu0, hv, zh)], "#a9d0e4");
      poly7([P2(hu1, hv, z2), P2(hu1, v0 + 0.6, z2), P2(hu1, v0 + 0.6, zh), P2(hu1, hv, zh)], "#7fa8be");
      ctx4.strokeStyle = mul;
      for (let u = hu0; u <= hu1 + 0.01; u += 1.2) {
        const a = P2(u, hv, z2), c = P2(u, hv, zh);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
      {
        const a = P2(hu0, hv, (z2 + zh) / 2), c = P2(hu1, hv, (z2 + zh) / 2);
        ctx4.beginPath();
        ctx4.moveTo(a[0], a[1]);
        ctx4.lineTo(c[0], c[1]);
        ctx4.stroke();
      }
      poly7([P2(hu0 - 0.6, hv + 0.6, zh), P2(hu1 + 0.6, hv + 0.6, zh), P2(hu1 + 0.6, hv + 0.6, zh + 0.55), P2(hu0 - 0.6, hv + 0.6, zh + 0.55)], "#ffffff", "rgba(60,70,80,.5)", 1);
      poly7([P2(hu0 - 0.6, v0, zh + 0.55), P2(hu1 + 0.6, v0, zh + 0.55), P2(hu1 + 0.6, hv + 0.6, zh + 0.55), P2(hu0 - 0.6, hv + 0.6, zh + 0.55)], "#f6f7f8", "rgba(70,80,90,.5)", 1);
      poly7([P2(hu1 + 0.6, hv + 0.6, zh), P2(hu1 + 0.6, v0, zh), P2(hu1 + 0.6, v0, zh + 0.55), P2(hu1 + 0.6, hv + 0.6, zh + 0.55)], "#b5bac0");
      poly7([P2(u0, v1, z1 - 0.9), P2(u1, v1, z1 - 0.9), P2(u1, v1, z1 - 0.1), P2(u0, v1, z1 - 0.1)], blue);
      poly7([P2(u1, v1, z1 - 0.9), P2(u1, v0, z1 - 0.9), P2(u1, v0, z1 - 0.1), P2(u1, v1, z1 - 0.1)], "#173b6e");
      for (let u = u0 + 3; u < u1; u += 12) {
        poly7([P2(u, vc + 0.5, 0), P2(u + 0.06, vc + 0.5, 0), P2(u + 0.06, vc + 0.5, 5.2), P2(u, vc + 0.5, 5.2)], "#78808a");
        poly7([P2(u - 0.35, vc + 0.5, 5), P2(u + 0.41, vc + 0.5, 5), P2(u + 0.41, vc + 0.5, 5.25), P2(u - 0.35, vc + 0.5, 5.25)], "#e4e8ec");
      }
    } else {
      poly7([P2(u0, v1, 0), P2(u1, v1, 0), P2(u1, v1, z1), P2(u0, v1, z1)], "rgba(255,238,175,.55)");
      poly7([P2(u1, v1, 0), P2(u1, v0, 0), P2(u1, v0, z1), P2(u1, v1, z1)], "rgba(255,228,160,.42)");
      const v2 = v1 - 0.8;
      poly7([P2(u0, v2, z1), P2(u1, v2, z1), P2(u1, v2, z2), P2(u0, v2, z2)], "rgba(255,244,200,.62)");
      poly7([P2(hu0, v2 - 0.2, z2), P2(hu1, v2 - 0.2, z2), P2(hu1, v2 - 0.2, zh), P2(hu0, v2 - 0.2, zh)], "rgba(255,248,215,.75)");
      for (let u = 3.2; u < w - 2; u += 5.2) poly7([P2(u, v1, 0), P2(u + 1.8, v1, 0), P2(u + 1.8, v1, 2.8), P2(u, v1, 2.8)], "rgba(255,250,225,.9)");
      for (let u = u0 + 3; u < u1; u += 12) {
        const c = P2(u + 0.03, v1 + 1.8, 5.1);
        const g = ctx4.createRadialGradient(c[0], c[1], 1, c[0], c[1], 7 * R5 * 3);
        g.addColorStop(0, "rgba(255,250,215,.8)");
        g.addColorStop(1, "rgba(255,250,215,0)");
        ctx4.fillStyle = g;
        ctx4.beginPath();
        ctx4.arc(c[0], c[1], 7 * R5 * 3, 0, 7);
        ctx4.fill();
      }
    }
  }
  function paintStation(ctx4, e, P2, poly7, mode2) {
    const { b, w, h, R: R5, sp } = e;
    const lit = mode2 !== "day";
    const doorU = Math.max(2, Math.min(w - 2, b.doorX - b.x + 0.5));
    const major = (b.floors || 2) >= 3;
    const hsh = HB(b.idx, 9);
    const u0 = 0.1, u1 = w - 0.1, v0 = 0.2, v1 = h - 0.25;
    const col = sp.wallCol || ["#d8cdb6", "#cfd6dc", "#d9c9b8"][hsh % 3];
    if (!lit) {
      poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#cfcdc4");
      if (major) {
        const zt = 14.2, z1 = 4.4, wallc = ["#b8a898", "#c9ccd0", "#c4b4a4"][hsh % 3];
        poly7([P2(u0, v1, 0), P2(u1, v1, 0), P2(u1, v1, zt), P2(u0, v1, zt)], wallc);
        poly7([P2(u1, v1, 0), P2(u1, v0, 0), P2(u1, v0, zt), P2(u1, v1, zt)], shade(wallc, 0.78));
        poly7([P2(u0, v1, 0.1), P2(u1, v1, 0.1), P2(u1, v1, z1), P2(u0, v1, z1)], "#9fc3d2");
        poly7([P2(u1, v1, 0.1), P2(u1, v0, 0.1), P2(u1, v0, z1), P2(u1, v1, z1)], "#7fa2b2");
        for (let u = u0; u <= u1 + 0.01; u += 1.5) poly7([P2(u - 0.05, v1, 0), P2(u + 0.05, v1, 0), P2(u + 0.05, v1, z1), P2(u - 0.05, v1, z1)], "#5c6770");
        poly7([P2(u0, v1, z1), P2(u1, v1, z1), P2(u1, v1, z1 + 0.7), P2(u0, v1, z1 + 0.7)], "#1f5ea8");
        poly7([P2(u1, v1, z1), P2(u1, v0, z1), P2(u1, v0, z1 + 0.7), P2(u1, v1, z1 + 0.7)], "#174a86");
        for (let f2 = 0; f2 < 3; f2++) {
          const za = z1 + 1.3 + f2 * 3, zb = za + 1.7;
          for (let u = u0 + 0.5; u < u1 - 0.7; u += 1.5) poly7([P2(u, v1, za), P2(u + 1, v1, za), P2(u + 1, v1, zb), P2(u, v1, zb)], "#7e9db0");
          for (let v = v0 + 0.5; v < v1 - 0.6; v += 1.2) poly7([P2(u1, v + 0.8, za), P2(u1, v, za), P2(u1, v, zb), P2(u1, v + 0.8, zb)], "#62849a");
        }
        poly7([P2(doorU - 1.8, v1 + 0.02, 0), P2(doorU + 1.8, v1 + 0.02, 0), P2(doorU + 1.8, v1 + 0.02, 9.5), P2(doorU - 1.8, v1 + 0.02, 9.5)], "#b5d8e6");
        for (let k = -3; k <= 3; k++) poly7([P2(doorU + k * 0.6 - 0.04, v1 + 0.03, 0), P2(doorU + k * 0.6 + 0.04, v1 + 0.03, 0), P2(doorU + k * 0.6 + 0.04, v1 + 0.03, 9.5), P2(doorU + k * 0.6 - 0.04, v1 + 0.03, 9.5)], "#56646e");
        poly7([P2(u0, v0, zt), P2(u1, v0, zt), P2(u1, v1, zt), P2(u0, v1, zt)], "#d4d6d8");
        poly7([P2(u0, v1, zt), P2(u1, v1, zt), P2(u1, v1, zt + 0.7), P2(u0, v1, zt + 0.7)], shade(wallc, 1.05));
        poly7([P2(u1, v1, zt), P2(u1, v0, zt), P2(u1, v0, zt + 0.7), P2(u1, v1, zt + 0.7)], shade(wallc, 0.72));
        poly7([P2(w * 0.18, v1 - 0.4, zt + 0.7), P2(w * 0.82, v1 - 0.4, zt + 0.7), P2(w * 0.82, v1 - 0.4, zt + 2.6), P2(w * 0.18, v1 - 0.4, zt + 2.6)], "#1f5ea8");
        poly7([P2(w * 0.18, v1 - 0.4, zt + 2.6), P2(w * 0.82, v1 - 0.4, zt + 2.6), P2(w * 0.82, v1 - 0.8, zt + 2.6), P2(w * 0.18, v1 - 0.8, zt + 2.6)], "#e8eef4");
        for (let k = 0; k < 4; k++) prism(poly7, P2, 1.2 + k * 3.1, v0 + 0.6, 2.6 + k * 3.1, v0 + 1.6, zt, zt + 1.3, "#aeb5ba", "#8a9298", "#c6ccd0");
      } else {
        const wl = 3.6, hz = 6.4, zr = 8.2, wing = Math.min(4.4, w * 0.34), cu0 = wing, cu1 = w - wing;
        prism(poly7, P2, u0, v0, cu0 + 0.2, v1, 0, wl, col, shade(col, 0.76), null);
        prism(poly7, P2, cu1 - 0.2, v0, u1, v1, 0, wl, col, shade(col, 0.76), null);
        for (let f2 = 0; f2 < 2; f2++) for (const [a, c] of [[u0 + 0.7, cu0 - 0.5], [cu1 + 0.5, u1 - 0.7]]) for (let u = a; u < c - 0.5; u += 1.25) poly7([P2(u, v1, 0.9 + f2 * 1.4), P2(u + 0.7, v1, 0.9 + f2 * 1.4), P2(u + 0.7, v1, 1.7 + f2 * 1.4), P2(u, v1, 1.7 + f2 * 1.4)], "#6f8ea3");
        const rc = ["#a9432f", "#4a5560", "#6a4a3a"][hsh % 3];
        for (const [a, c] of [[u0 - 0.2, cu0 + 0.2], [cu1 - 0.2, u1 + 0.2]]) {
          poly7([P2(a, v1 + 0.3, wl), P2(c, v1 + 0.3, wl), P2(c, (v0 + v1) / 2, wl + 1.5), P2(a, (v0 + v1) / 2, wl + 1.5)], shade(rc, 1.1), "rgba(20,20,25,.45)", 1);
          poly7([P2(c, v1 + 0.3, wl), P2(c, v0, wl), P2(c, (v0 + v1) / 2, wl + 1.5)], shade(rc, 0.8));
        }
        prism(poly7, P2, cu0, v0, cu1, v1, 0, hz, shade(col, 1.04), shade(col, 0.74), null);
        poly7([P2(cu0 - 0.3, v1 + 0.3, hz), P2(cu1 + 0.3, v1 + 0.3, hz), P2(cu1 + 0.3, (v0 + v1) / 2, zr), P2(cu0 - 0.3, (v0 + v1) / 2, zr)], shade(rc, 1.12), "rgba(20,20,25,.5)", 1);
        poly7([P2(cu1 + 0.3, v1 + 0.3, hz), P2(cu1 + 0.3, v0, hz), P2(cu1 + 0.3, (v0 + v1) / 2, zr)], shade(rc, 0.78));
        poly7([P2(cu0, v1, hz), P2(cu1, v1, hz), P2((cu0 + cu1) / 2, v1, zr - 0.4)], shade(col, 0.96), "rgba(40,40,45,.35)", 1);
        poly7([P2(doorU - 1.5, v1 + 0.02, 0), P2(doorU + 1.5, v1 + 0.02, 0), P2(doorU + 1.5, v1 + 0.02, 4.6), P2(doorU - 1.5, v1 + 0.02, 4.6)], "#a8cfdf");
        for (let k = -2; k <= 2; k++) poly7([P2(doorU + k * 0.6 - 0.04, v1 + 0.03, 0), P2(doorU + k * 0.6 + 0.04, v1 + 0.03, 0), P2(doorU + k * 0.6 + 0.04, v1 + 0.03, 4.6), P2(doorU + k * 0.6 - 0.04, v1 + 0.03, 4.6)], "#56646e");
        poly7([P2(cu0 + 0.4, v1 + 0.03, 4.9), P2(cu1 - 0.4, v1 + 0.03, 4.9), P2(cu1 - 0.4, v1 + 0.03, 5.8), P2(cu0 + 0.4, v1 + 0.03, 5.8)], "#1f5ea8");
        {
          const c = P2(doorU, v1 + 0.04, zr - 1.4);
          ctx4.fillStyle = "#f6f2e4";
          ctx4.beginPath();
          ctx4.arc(c[0], c[1], 1.1 * R5 * 4, 0, 7);
          ctx4.fill();
          ctx4.strokeStyle = "#4a4034";
          ctx4.lineWidth = Math.max(1, R5 * 0.6);
          ctx4.stroke();
          const a = P2(doorU, v1 + 0.05, zr - 1.4), q1 = P2(doorU, v1 + 0.05, zr - 0.8), q2 = P2(doorU + 0.5, v1 + 0.05, zr - 1.4);
          ctx4.beginPath();
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(q1[0], q1[1]);
          ctx4.moveTo(a[0], a[1]);
          ctx4.lineTo(q2[0], q2[1]);
          ctx4.stroke();
        }
      }
      const cw = major ? 4.6 : 3.4;
      poly7([P2(doorU - cw, v1, 5), P2(doorU + cw, v1, 5), P2(doorU + cw, v1 + 1.4, 4.4), P2(doorU - cw, v1 + 1.4, 4.4)], "#e6e9ec", "rgba(60,70,80,.5)", 1);
    } else {
      if (major) {
        poly7([P2(u0, v1, 0.1), P2(u1, v1, 0.1), P2(u1, v1, 4.4), P2(u0, v1, 4.4)], "rgba(255,240,180,.55)");
        for (let f2 = 0; f2 < 3; f2++) poly7([P2(u0, v1, 5.7 + f2 * 3), P2(u1, v1, 5.7 + f2 * 3), P2(u1, v1, 7.4 + f2 * 3), P2(u0, v1, 7.4 + f2 * 3)], "rgba(255,238,175,.35)");
        poly7([P2(doorU - 1.8, v1 + 0.03, 0), P2(doorU + 1.8, v1 + 0.03, 0), P2(doorU + 1.8, v1 + 0.03, 9.5), P2(doorU - 1.8, v1 + 0.03, 9.5)], "rgba(255,248,210,.8)");
      } else {
        poly7([P2(doorU - 1.5, v1 + 0.03, 0), P2(doorU + 1.5, v1 + 0.03, 0), P2(doorU + 1.5, v1 + 0.03, 4.6), P2(doorU - 1.5, v1 + 0.03, 4.6)], "rgba(255,240,170,.85)");
        poly7([P2(0.8, v1, 0.9), P2(w - 0.8, v1, 0.9), P2(w - 0.8, v1, 2.6), P2(0.8, v1, 2.6)], "rgba(255,238,175,.28)");
      }
    }
  }
  function paintSpecial(ctx4, e, P2, poly7, mode2, px2) {
    if (e.sp.kind === "stadium") {
      paintStadium(ctx4, e, P2, poly7, mode2);
      return;
    }
    if (e.sp.kind === "airport") {
      paintAirport(ctx4, e, P2, poly7, mode2);
      return;
    }
    if (e.sp.kind === "station") {
      paintStation(ctx4, e, P2, poly7, mode2);
      return;
    }
    if (e.sp.kind === "metro") {
      paintMetro(ctx4, e, P2, poly7);
      return;
    }
    const { b, sp, w, h, R: R5 } = e;
    const lit = mode2 !== "day";
    const kind = sp.kind;
    const hsh = HB(b.idx, 5);
    const M = 12 * R5, T4 = 16 * R5;
    void M;
    void T4;
    if (kind === "temple") {
      const ve = "#a8392b", pl = "#ece4d0", st3 = "#a9a69d", wd = "#6d4a32", rf = "#4b505a";
      const u0 = 0.7, u1 = w - 0.7, v0 = 0.5, v1 = h - 0.9;
      if (!lit) {
        poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#d9ceb0");
        prism(poly7, P2, u0 - 0.3, v0 - 0.3, u1 + 0.3, v1 + 0.3, 0, 0.7, shade(st3, 0.95), shade(st3, 0.72), shade(st3, 1.08));
        const wu0 = u0 + 0.5, wu1 = u1 - 0.5, wv0 = v0 + 0.4, wv1 = v1 - 0.3;
        prism(poly7, P2, wu0, wv0, wu1, wv1, 0.7, 3.6, shade(pl, 0.96), shade(pl, 0.74), null);
        const n2 = Math.max(3, Math.round((wu1 - wu0) / 0.9));
        for (let i = 0; i <= n2; i++) {
          const u = wu0 + (wu1 - wu0) * i / n2;
          poly7([P2(u - 0.07, wv1, 0.7), P2(u + 0.07, wv1, 0.7), P2(u + 0.07, wv1, 3.6), P2(u - 0.07, wv1, 3.6)], ve);
        }
        const dm = (wu0 + wu1) / 2;
        poly7([P2(dm - 0.9, wv1, 0.7), P2(dm + 0.9, wv1, 0.7), P2(dm + 0.9, wv1, 3), P2(dm - 0.9, wv1, 3)], wd);
        for (let i = 0; i < 4; i++) {
          const u = dm - 0.9 + 0.45 * i + 0.22;
          poly7([P2(u - 0.2, wv1, 0.8), P2(u + 0.2, wv1, 0.8), P2(u + 0.2, wv1, 2.9), P2(u - 0.2, wv1, 2.9)], i & 1 ? "#7d583c" : "#6a4830");
        }
        poly7([P2(wu0, wv1, 3.6), P2(wu1, wv1, 3.6), P2(wu1, wv1, 3.9), P2(wu0, wv1, 3.9)], ve);
        for (let i = 1; i <= 3; i++) prism(poly7, P2, dm - 1.2 - 0.3 * i, wv1 + 0.2 * (i - 1) * 0.5 + 0.05, dm + 1.2 + 0.3 * i, wv1 + 0.2 * i * 0.5 + 0.35, 0.7 - 0.2 * i * 0, 0.7, st3, shade(st3, 0.7), null);
        hipRoof(ctx4, poly7, P2, u0 - 0.2, v0 - 0.2, u1 + 0.2, v1 + 0.2, 3.9, 5.2, rf, true);
        hipRoof(ctx4, poly7, P2, wu0 + 0.2, wv0 + 0.1, wu1 - 0.2, wv1 - 0.1, 4.8, 8, rf, true);
        const rp = P2((wu0 + wu1) / 2, (wv0 + wv1) / 2, 8);
        ctx4.fillStyle = "#d6b24a";
        ctx4.beginPath();
        ctx4.arc(rp[0] - 0.8 * T4, rp[1] - 0.2 * M, 1.1 * R5, 0, 7);
        ctx4.arc(rp[0] + 0.8 * T4, rp[1] - 0.2 * M, 1.1 * R5, 0, 7);
        ctx4.fill();
        if (hsh & 1) {
          const lu = u0 - 0.1, lv = v1 + 0.5;
          prism(poly7, P2, lu, lv, lu + 0.3, lv + 0.3, 0, 0.6, "#9a978f", "#77746c", "#b0ada4");
          prism(poly7, P2, lu + 0.05, lv + 0.05, lu + 0.25, lv + 0.25, 0.6, 1.3, "#aaa79e", "#85827a", "#bab7ae");
        }
      } else {
        const wu0 = u0 + 0.5, wu1 = u1 - 0.5, wv1 = v1 - 0.3, dm = (wu0 + wu1) / 2;
        ctx4.fillStyle = "rgba(255,214,130,.9)";
        poly7([P2(dm - 0.6, wv1, 0.9), P2(dm + 0.6, wv1, 0.9), P2(dm + 0.6, wv1, 2.6), P2(dm - 0.6, wv1, 2.6)], "rgba(255,200,110,.55)");
      }
      return true;
    }
    if (kind === "shrine") {
      const ve = "#c4432e", wh = "#efe6cf", wd = "#b58a58", rf = "#7ba08a";
      const u0 = w * 0.5 - 1.6, u1 = w * 0.5 + 1.6, v0 = 0.6, v1 = 2.6;
      if (!lit) {
        poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#e0d6bc");
        poly7([P2(w * 0.5 - 0.5, v1 + 0.6, 0.01), P2(w * 0.5 + 0.5, v1 + 0.6, 0.01), P2(w * 0.5 + 0.5, h, 0.01), P2(w * 0.5 - 0.5, h, 0.01)], "#bdb6a6");
        prism(poly7, P2, u0 - 0.2, v0 - 0.2, u1 + 0.2, v1 + 0.2, 0, 1, "#a9a69d", "#7f7c74", "#bcb9b0");
        prism(poly7, P2, u0 + 0.1, v0 + 0.1, u1 - 0.1, v1 - 0.1, 1, 3.4, wh, shade(wh, 0.76), null);
        const n2 = 4;
        for (let i = 0; i <= n2; i++) {
          const u = u0 + 0.1 + (u1 - u0 - 0.2) * i / n2;
          poly7([P2(u - 0.07, v1 - 0.1, 1), P2(u + 0.07, v1 - 0.1, 1), P2(u + 0.07, v1 - 0.1, 3.4), P2(u - 0.07, v1 - 0.1, 3.4)], wd);
        }
        const dm = w * 0.5;
        poly7([P2(dm - 0.7, v1 - 0.1, 1), P2(dm + 0.7, v1 - 0.1, 1), P2(dm + 0.7, v1 - 0.1, 2.8), P2(dm - 0.7, v1 - 0.1, 2.8)], "#7a5a3c");
        for (let i = 1; i <= 3; i++) prism(poly7, P2, dm - 0.8, v1 + 0.1 * i - 0.05, dm + 0.8, v1 + 0.1 * i + 0.25, 0.3 * (3 - i), 0.3 * (4 - i) + 0.01, "#b9b6ad", "#8d8a82", null);
        gableRoof(ctx4, poly7, P2, u0 - 0.5, v0 - 0.5, u1 + 0.5, v1 + 0.6, 3.4, 5.6, rf);
        const rp = P2(u0 - 0.5, (v0 + v1) / 2, 5.6), rq = P2(u1 + 0.5, (v0 + v1) / 2, 5.6);
        ctx4.strokeStyle = "#d7be7b";
        ctx4.lineWidth = 2;
        for (const q of [rp, rq]) {
          ctx4.beginPath();
          ctx4.moveTo(q[0] - 3 * R5, q[1] - 2.2 * R5);
          ctx4.lineTo(q[0] + 3 * R5, q[1] + 1 * R5);
          ctx4.moveTo(q[0] + 3 * R5, q[1] - 2.2 * R5);
          ctx4.lineTo(q[0] - 3 * R5, q[1] + 1 * R5);
          ctx4.stroke();
        }
        const tv = h - 0.7, tu = w * 0.5, tw = 1.9;
        for (const s of [-1, 1]) prism(poly7, P2, tu + s * tw - 0.14, tv - 0.14, tu + s * tw + 0.14, tv + 0.14, 0, 4.2, ve, shade(ve, 0.72), null);
        poly7([P2(tu - tw - 0.3, tv + 0.15, 3.6), P2(tu + tw + 0.3, tv + 0.15, 3.6), P2(tu + tw + 0.3, tv + 0.15, 4.4), P2(tu - tw - 0.3, tv + 0.15, 4.4)], "#2a2a2e");
        poly7([P2(tu - tw - 0.5, tv + 0.15, 4.4), P2(tu + tw + 0.5, tv + 0.15, 4.4), P2(tu + tw + 0.3, tv + 0.15, 4.75), P2(tu - tw - 0.3, tv + 0.15, 4.75)], "#232327");
        poly7([P2(tu - tw, tv + 0.15, 3.05), P2(tu + tw, tv + 0.15, 3.05), P2(tu + tw, tv + 0.15, 3.3), P2(tu - tw, tv + 0.15, 3.3)], ve);
        for (const s of [-1, 1]) prism(poly7, P2, tu + s * 1.2 - 0.2, tv - 1, tu + s * 1.2 + 0.2, tv - 0.6, 0, 0.9, "#aeaba2", "#85827a", "#c0bdb4");
      }
      return true;
    }
    if (kind === "gas") {
      const brand = [["#d6342a", "#ffffff"], ["#1f7a4a", "#f2d24a"], ["#2b5fa8", "#ffffff"]][hsh % 3];
      const cz = 4.8;
      if (!lit) {
        poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#7d7f84");
        poly7([P2(1.4, 1.2, 0.01), P2(w - 0.3, 1.2, 0.01), P2(w - 0.3, h - 0.2, 0.01), P2(1.4, h - 0.2, 0.01)], "#6d6f74");
        prism(poly7, P2, 0.2, 0.2, 2.2, 1.3, 0, 3.2, "#ecebe6", "#bdbcb6", "#d9d9d3");
        poly7([P2(0.5, 1.3, 1), P2(1.9, 1.3, 1), P2(1.9, 1.3, 2.7), P2(0.5, 1.3, 2.7)], "#9cc6dd");
        poly7([P2(0.2, 1.3, 3), P2(2.2, 1.3, 3), P2(2.2, 1.3, 3.2), P2(0.2, 1.3, 3.2)], brand[0]);
        for (const iu of [2.6, 4.4]) {
          prism(poly7, P2, iu - 0.45, 1.85, iu + 0.45, 2.15, 0, 0.2, "#9a9ca0", "#74767a", "#b0b2b6");
          for (const pu of [iu - 0.3, iu + 0.3]) prism(poly7, P2, pu - 0.18, 1.88, pu + 0.18, 2.12, 0.2, 1.7, shade(brand[0], 1), shade(brand[0], 0.7), shade(brand[0], 1.15));
        }
        for (const [pu, pv] of [[1.5, 1.45], [w - 0.5, 1.45], [1.5, h - 0.45], [w - 0.5, h - 0.45]]) prism(poly7, P2, pu - 0.12, pv - 0.12, pu + 0.12, pv + 0.12, 0, cz, "#d7d8db", "#a9aaae", null);
        const cu0 = 1.2, cu1 = w - 0.3, cv0 = 1, cv1 = h - 0.2;
        poly7([P2(cu0, cv1, cz), P2(cu1, cv1, cz), P2(cu1, cv1, cz + 0.55), P2(cu0, cv1, cz + 0.55)], brand[1]);
        poly7([P2(cu0, cv1, cz + 0.18), P2(cu1, cv1, cz + 0.18), P2(cu1, cv1, cz + 0.38), P2(cu0, cv1, cz + 0.38)], brand[0]);
        poly7([P2(cu1, cv1, cz), P2(cu1, cv0, cz), P2(cu1, cv0, cz + 0.55), P2(cu1, cv1, cz + 0.55)], shade(brand[1], 0.78));
        poly7([P2(cu0, cv0, cz + 0.55), P2(cu1, cv0, cz + 0.55), P2(cu1, cv1, cz + 0.55), P2(cu0, cv1, cz + 0.55)], "#eceeef");
        prism(poly7, P2, 0.05, h - 0.35, 0.3, h - 0.1, 0, 6.2, "#b9babe", "#8e8f93", null);
        prism(poly7, P2, -0.25, h - 0.42, 0.62, h - 0.05, 4.6, 6.8, brand[1], shade(brand[1], 0.75), brand[1]);
        poly7([P2(-0.25, h - 0.05, 4.7), P2(0.62, h - 0.05, 4.7), P2(0.62, h - 0.05, 5.3), P2(-0.25, h - 0.05, 5.3)], brand[0]);
        ctx4.save();
        const p02 = P2(-0.2, h - 0.05, 6.7);
        ctx4.setTransform(ctx4.getTransform());
        ctx4.restore();
        void p02;
      } else {
        const cz2 = 4.8, cu0 = 1.2, cu1 = w - 0.3, cv1 = h - 0.2;
        for (let u = cu0 + 0.5; u < cu1; u += 1.1) {
          const q = P2(u, (1 + cv1) / 2, cz2);
          ctx4.fillStyle = "rgba(255,255,240,.95)";
          ctx4.fillRect(q[0] - 3 * R5, q[1] - 0.5 * R5, 6 * R5, 1.1 * R5);
        }
        poly7([P2(-0.25, h - 0.05, 4.7), P2(0.62, h - 0.05, 4.7), P2(0.62, h - 0.05, 6.8), P2(-0.25, h - 0.05, 6.8)], "rgba(255,240,190,.85)");
        poly7([P2(0.5, 1.3, 1), P2(1.9, 1.3, 1), P2(1.9, 1.3, 2.7), P2(0.5, 1.3, 2.7)], "rgba(255,240,190,.85)");
      }
      return true;
    }
    if (kind === "cardealer" || kind === "usedcar") {
      const cols2 = ["#c9343a", "#2f5fa6", "#e8e8ea", "#2a2c33", "#d9b23c", "#3b8a5a", "#8e949c"];
      const car = (u, v, i) => {
        const c = cols2[(hsh + i * 3) % cols2.length];
        prism(poly7, P2, u, v, u + 1.5, v + 0.8, 0.12, 0.62, shade(c, 1), shade(c, 0.72), shade(c, 1.12));
        prism(poly7, P2, u + 0.35, v + 0.08, u + 1.1, v + 0.72, 0.62, 1.05, "#9cc6dd", "#6f94a8", shade(c, 1.1));
      };
      if (!lit) {
        poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#7b7d82");
        if (kind === "cardealer") {
          const bz = 3.6, bv1 = h - 1.3, bc = "#f1f1ee";
          prism(poly7, P2, 0.2, 0.3, w - 0.2, bv1, 0, bz, bc, shade(bc, 0.78), "#d4d6da");
          poly7([P2(0.5, bv1, 0.3), P2(w - 0.5, bv1, 0.3), P2(w - 0.5, bv1, 2.9), P2(0.5, bv1, 2.9)], "#a9d0e4");
          for (let i = 0; i < 2; i++) car(1 + i * (w - 3.5), bv1 - 1.2, i);
          poly7([P2(0.2, bv1, 3), P2(w - 0.2, bv1, 3), P2(w - 0.2, bv1, 3.6), P2(0.2, bv1, 3.6)], "#c33a3a");
          for (let i = 0; i < 3; i++) car(0.8 + i * 2.6, h - 0.95, i + 2);
        } else {
          const bz = 2.6;
          prism(poly7, P2, 0.2, 0.3, 3.2, 1.7, 0, bz, "#e9e3cf", "#b9b39d", "#cfc9b4");
          poly7([P2(0.5, 1.7, 0.8), P2(2.9, 1.7, 0.8), P2(2.9, 1.7, 2.1), P2(0.5, 1.7, 2.1)], "#9cc6dd");
          poly7([P2(0.2, 1.7, bz), P2(3.2, 1.7, bz), P2(3.2, 1.7, bz + 0.5), P2(0.2, 1.7, bz + 0.5)], "#e0a526");
          for (let i = 0; i < 5; i++) car(0.6 + i % 3 * 2.5, 2.3 + Math.floor(i / 3) * 1.1, i);
          for (let u = 0.5; u < w - 0.4; u += 1.2) {
            poly7([P2(u, h - 0.1, 0), P2(u + 0.04, h - 0.1, 0), P2(u + 0.04, h - 0.1, 1.5), P2(u, h - 0.1, 1.5)], "#555");
            poly7([P2(u, h - 0.1, 1.5), P2(u + 0.7, h - 0.1, 1.5), P2(u + 0.7, h - 0.1, 1.2), P2(u, h - 0.1, 1.2)], hsh & 1 ? "#e0a526" : "#d6342a");
          }
        }
      } else if (kind === "cardealer") {
        poly7([P2(0.5, h - 1.3, 0.3), P2(w - 0.5, h - 1.3, 0.3), P2(w - 0.5, h - 1.3, 2.9), P2(0.5, h - 1.3, 2.9)], "rgba(255,240,190,.8)");
      } else {
        poly7([P2(0.5, 1.7, 0.8), P2(2.9, 1.7, 0.8), P2(2.9, 1.7, 2.1), P2(0.5, 1.7, 2.1)], "rgba(255,240,190,.8)");
      }
      return true;
    }
    return false;
  }
  function paintCanopy(ctx4, e, P2, poly7, doorU, ww, d, z, col, posts) {
    const w = e.w, h = e.h;
    const u0 = Math.max(0.1, doorU - ww / 2), u1 = Math.min(w - 0.1, doorU + ww / 2), v1 = h, v0 = h - d;
    if (posts) for (const u of [u0 + 0.15, u1 - 0.15]) poly7([P2(u - 0.1, v0 + 0.05, 0), P2(u + 0.1, v0 + 0.05, 0), P2(u + 0.1, v0 + 0.05, z), P2(u - 0.1, v0 + 0.05, z)], "#cfd2d6");
    poly7([P2(u0, v0, z), P2(u1, v0, z), P2(u1, v1, z), P2(u0, v1, z)], shade(col, 1.1));
    poly7([P2(u0, v0, z), P2(u1, v0, z), P2(u1, v0, z - 0.35), P2(u0, v0, z - 0.35)], col);
    poly7([P2(u1, v0, z), P2(u1, v1, z), P2(u1, v1, z - 0.35), P2(u1, v0, z - 0.35)], shade(col, 0.72));
    void ctx4;
  }

