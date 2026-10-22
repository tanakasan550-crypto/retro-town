  // src/isoveh.js
  var V = {
    // L全長 W全幅 H全高 bh腰の高さ cab=[後端,前端](全長に対する割合) sl=屋根の前後の傾斜(m) wheelR
    kei: { L: 3.4, W: 1.48, H: 1.65, bh: 0.85, cab: [0.14, 0.95], sl: [0.5, 0.55] },
    compact: { L: 3.9, W: 1.69, H: 1.5, bh: 0.78, cab: [0.18, 0.88], sl: [0.8, 0.7] },
    sedan: { L: 4.7, W: 1.8, H: 1.42, bh: 0.78, cab: [0.24, 0.78], sl: [0.85, 0.85] },
    minivan: { L: 4.7, W: 1.7, H: 1.85, bh: 0.88, cab: [0.06, 0.93], sl: [0.5, 0.95] },
    suv: { L: 4.6, W: 1.85, H: 1.7, bh: 0.92, cab: [0.1, 0.84], sl: [0.5, 0.9] },
    sports: { L: 4.4, W: 1.85, H: 1.22, bh: 0.7, cab: [0.3, 0.72], sl: [0.9, 0.9] },
    keitruck: { L: 3.4, W: 1.48, H: 1.9, bh: 0.95, cab: [0.62, 0.97], sl: [0.3, 0.3], bed: 1.1 },
    delivery: { L: 4.7, W: 1.7, H: 2.2, bh: 1, cab: [0.72, 0.98], sl: [0.3, 0.5], box: [0.02, 0.7, 2.2] },
    bigtruck: { L: 8.5, W: 2.4, H: 3.2, bh: 1.3, cab: [0.78, 0.99], sl: [0.2, 0.4], box: [0.02, 0.76, 3.2] },
    taxi: { L: 4.7, W: 1.75, H: 1.5, bh: 0.78, cab: [0.2, 0.8], sl: [0.8, 0.85] },
    bus: { L: 10.5, W: 2.5, H: 3.1, bh: 1, cab: [0.01, 0.99], sl: [0.1, 0.2], bus: 1 },
    tourbus: { L: 11, W: 2.5, H: 3.4, bh: 1.2, cab: [0.01, 0.99], sl: [0.1, 0.4], bus: 1 },
    police: { L: 4.7, W: 1.8, H: 1.45, bh: 0.78, cab: [0.22, 0.78], sl: [0.85, 0.85] },
    ambulance: { L: 5.5, W: 2, H: 2.55, bh: 1.1, cab: [0.62, 0.98], sl: [0.3, 0.6], box: [0.02, 0.66, 2.55] },
    firetruck: { L: 7, W: 2.5, H: 3, bh: 1.4, cab: [0.7, 0.99], sl: [0.2, 0.4], box: [0.02, 0.72, 3] },
    wagon: { L: 4.6, W: 1.76, H: 1.5, bh: 0.8, cab: [0.2, 0.97], sl: [0.7, 0.92] },
    luxury: { L: 5.1, W: 1.88, H: 1.45, bh: 0.8, cab: [0.24, 0.76], sl: [0.88, 0.85] },
    hearse: { L: 5.2, W: 1.85, H: 1.62, bh: 0.84, cab: [0.2, 0.97], sl: [0.55, 0.9] },
    microbus: { L: 6.9, W: 2.05, H: 2.6, bh: 1, cab: [0.02, 0.98], sl: [0.2, 0.4], bus: 1 },
    garbage: { L: 6, W: 2.2, H: 2.7, bh: 1.2, cab: [0.72, 0.99], sl: [0.25, 0.5], box: [0.02, 0.7, 2.7] },
    vacuum: { L: 6.4, W: 2.2, H: 2.6, bh: 1.2, cab: [0.72, 0.99], sl: [0.25, 0.5], box: [0.02, 0.7, 2.6] },
    tow: { L: 5.8, W: 2, H: 2.4, bh: 1.1, cab: [0.5, 0.98], sl: [0.3, 0.5], bed: 1 },
    sweeper: { L: 5.4, W: 2.1, H: 2.5, bh: 1.1, cab: [0.5, 0.98], sl: [0.3, 0.5], box: [0.02, 0.5, 2.5] }
  };
  var SPECIAL2 = { garbage: { body: [76, 160, 92] }, vacuum: { body: [200, 214, 232] }, tow: { body: [244, 120, 36] }, sweeper: { body: [60, 120, 196] }, hearse: { body: [30, 30, 34] }, microbus: { body: [236, 240, 246] }, taxi: { body: [244, 196, 48] }, police: { body: [248, 248, 248], top: [30, 30, 34] }, ambulance: { body: [250, 250, 250] }, firetruck: { body: [210, 40, 36] }, bus: { body: [246, 246, 246] }, tourbus: { body: [250, 250, 250] }, bigtruck: { body: [230, 232, 236] }, delivery: { body: [248, 248, 248] } };
  var VEH_DIMS = V;
  var rgb = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  function mk3(R5, hu, hv, Hm) {
    const ax = Math.ceil((hu + hv) * 16 * R5) + 6, top = Math.ceil(Hm * 12 * R5) + 6;
    const ay = top + Math.ceil((hu + hv) * 8 * R5);
    const cw = ax * 2, ch = ay + Math.ceil((hu + hv) * 8 * R5) + 8;
    const cv2 = document.createElement("canvas");
    cv2.width = cw;
    cv2.height = ch;
    const ctx4 = cv2.getContext("2d");
    const P2 = (u, v, z) => [ax + (u - v) * 16 * R5, ay + (u + v) * 8 * R5 - z * 12 * R5];
    return { cv: cv2, ctx: ctx4, P: P2, ax, ay };
  }
  function face(ctx4, P2, pts, cen, col, o = {}) {
    const a = pts[0], b = pts[1], c = pts[2];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l;
    ny /= l;
    nz /= l;
    const gx = pts.reduce((s, p) => s + p[0], 0) / pts.length - cen[0], gy = pts.reduce((s, p) => s + p[1], 0) / pts.length - cen[1], gz2 = pts.reduce((s, p) => s + p[2], 0) / pts.length - cen[2];
    if (nx * gx + ny * gy + nz * gz2 * 0.5 < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    const vis = nx + ny + nz * 1.6;
    if (vis <= 0.01) return false;
    const f2 = o.flat ? 1 : 0.68 + 0.32 * Math.max(0, nz) + 0.2 * Math.max(0, ny) + 0.02 * Math.max(0, nx);
    ctx4.beginPath();
    pts.forEach((p, i) => {
      const q = P2(p[0], p[1], p[2]);
      i ? ctx4.lineTo(q[0], q[1]) : ctx4.moveTo(q[0], q[1]);
    });
    ctx4.closePath();
    ctx4.fillStyle = o.raw ? col : shade(col, f2);
    ctx4.fill();
    if (o.stroke) {
      ctx4.strokeStyle = o.stroke;
      ctx4.lineWidth = o.lw || 1;
      ctx4.stroke();
    }
    return true;
  }
  var mapper = (d) => (cx, cy, L2, W2) => (s, t, z) => {
    const a = (s - L2 / 2) / 2, c = (t - W2 / 2) / 2;
    if (d === 0) return [cx + a, cy + c, z];
    if (d === 2) return [cx - a, cy - c, z];
    if (d === 1) return [cx - c, cy + a, z];
    return [cx + c, cy - a, z];
  };
  var ERA_SHAPE = [{ h: 1.05, a: 0.6, c: 0 }, { h: 1, a: 1, c: 0 }, { h: 0.98, a: 1.12, c: 0.01 }, { h: 0.94, a: 1.3, c: 0.03 }];
  var PASSENGER = /* @__PURE__ */ new Set(["kei", "compact", "sedan", "minivan", "suv", "sports", "taxi", "police", "wagon", "luxury", "hearse"]);
  function eraShape(vt, ty, era) {
    if (!PASSENGER.has(ty)) return vt;
    const e = ERA_SHAPE[Math.max(0, Math.min(3, era))];
    if (e.h === 1 && e.a === 1 && !e.c) return vt;
    return { ...vt, H: +(vt.H * e.h).toFixed(3), sl: [vt.sl[0] * e.a, vt.sl[1] * e.a], cab: [Math.max(0.01, vt.cab[0] - e.c), Math.min(0.99, vt.cab[1] + e.c)] };
  }
  function vehicleSprite(ty, era, colIdx, d, R5, colors) {
    const vt = eraShape(V[ty] || V.sedan, ty, era | 0);
    const sp = SPECIAL2[ty];
    const base = sp ? sp.body : colors[colIdx % colors.length];
    const L2 = vt.L, W2 = vt.W, Hm = vt.H;
    const horiz = d % 2 === 0;
    const hu = (horiz ? L2 : W2) / 4, hv = (horiz ? W2 : L2) / 4;
    const { cv: cv2, ctx: ctx4, P: P2, ax, ay } = mk3(R5, hu, hv, Hm + 0.7);
    const M = mapper(d)(0, 0, L2, W2);
    const cen = [0, 0, Hm / 2];
    const cenS = M(L2 / 2, W2 / 2, Hm / 2);
    const body = rgb(base);
    const glass = era >= 2 ? "#1b2a3a" : "#2c4256";
    const dark = "#23252b";
    ctx4.fillStyle = "rgba(30,40,30,0.32)";
    {
      const pts = [M(-0.15, -0.15, 0), M(L2 + 0.15, -0.15, 0), M(L2 + 0.15, W2 + 0.15, 0), M(-0.15, W2 + 0.15, 0)];
      ctx4.beginPath();
      pts.forEach((p, i) => {
        const q = P2(p[0], p[1], 0);
        i ? ctx4.lineTo(q[0], q[1]) : ctx4.moveTo(q[0], q[1]);
      });
      ctx4.fill();
    }
    const quadS = (s0, s1, t0, t1, z0, z1, col, o) => {
      const c = [(s0 + s1) / 2, (t0 + t1) / 2, (z0 + z1) / 2];
      const cc = M(c[0], c[1], c[2]);
      const F = [[[s0, t0, z0], [s1, t0, z0], [s1, t1, z0], [s0, t1, z0]], [[s0, t0, z1], [s1, t0, z1], [s1, t1, z1], [s0, t1, z1]], [[s0, t0, z0], [s1, t0, z0], [s1, t0, z1], [s0, t0, z1]], [[s0, t1, z0], [s1, t1, z0], [s1, t1, z1], [s0, t1, z1]], [[s0, t0, z0], [s0, t1, z0], [s0, t1, z1], [s0, t0, z1]], [[s1, t0, z0], [s1, t1, z0], [s1, t1, z1], [s1, t0, z1]]];
      for (const f2 of F) face(ctx4, P2, f2.map((p) => M(p[0], p[1], p[2])), cc, col, o);
      return F;
    };
    const zc = 0.28;
    const ends = (which) => {
      if (!PASSENGER.has(ty)) return;
      const fr = which === "front";
      if (era <= 0) {
        const s0 = fr ? L2 - 0.06 : -0.04;
        quadS(s0, s0 + 0.1, 0.05, W2 - 0.05, zc + 0.05, zc + 0.2, "#c9cdd3");
      }
      if (era >= 3) {
        const s0 = fr ? L2 - 0.04 : -0.02;
        quadS(s0, s0 + 0.06, W2 * 0.1, W2 * 0.9, vt.bh * 0.68, vt.bh * 0.74, fr ? "#e6f4ff" : "#ff4040", { flat: true, raw: true });
      }
    };
    if (PASSENGER.has(ty)) ends(d < 2 ? "rear" : "front");
    if (vt.bus) {
      quadS(0, L2, 0, W2, zc, Hm, body);
      const bandCol = ty === "tourbus" ? "#3a6ab0" : "#2f7d4f";
      for (const t of [0, W2]) {
        const p = (s, z) => M(s, t, z);
        face(ctx4, P2, [p(0.7, Hm - 0.35), p(L2 - 0.7, Hm - 0.35), p(L2 - 0.7, 1.15), p(0.7, 1.15)], cenS, glass, { raw: false });
      }
      face(ctx4, P2, [M(L2, 0.12, Hm - 0.3), M(L2, W2 - 0.12, Hm - 0.3), M(L2, W2 - 0.12, 1.2), M(L2, 0.12, 1.2)], M(L2 / 2, W2 / 2, Hm / 2), glass);
      face(ctx4, P2, [M(0, 0.12, Hm - 0.3), M(0, W2 - 0.12, Hm - 0.3), M(0, W2 - 0.12, 1.4), M(0, 0.12, 1.4)], M(L2 / 2, W2 / 2, Hm / 2), glass);
      for (const t of [0, W2]) {
        const p = (s, z) => M(s, t, z);
        face(ctx4, P2, [p(0.05, 0.9), p(L2 - 0.05, 0.9), p(L2 - 0.05, 0.55), p(0.05, 0.55)], cenS, bandCol);
        face(ctx4, P2, [p(L2 - 2.7, 2.5), p(L2 - 1.4, 2.5), p(L2 - 1.4, 0.35), p(L2 - 2.7, 0.35)], cenS, "#cfe2ee");
      }
      quadS(L2 * 0.5, L2 * 0.75, W2 * 0.2, W2 * 0.8, Hm, Hm + 0.25, "#d7dce0");
      wheels(ctx4, P2, M, [L2 * 0.16, L2 * 0.8], W2, 0.52, R5, d);
    } else if (vt.box) {
      const [b0, b1, bh2] = vt.box;
      quadS(vt.cab[0] * L2, vt.cab[1] * L2, 0.06, W2 - 0.06, zc, vt.bh + 0.55, body);
      cabin(ctx4, P2, M, L2, W2, vt.cab[0] * L2, vt.cab[1] * L2, vt.bh + 0.55, Hm - (ty === "ambulance" ? 0 : 0.35), [0.1, 0.5], body, glass, 0.06);
      quadS(b0 * L2, b1 * L2, 0, W2, zc + 0.1, bh2, ty === "firetruck" ? "#d22a24" : ty === "ambulance" ? "#fafafa" : "#f4f6f8");
      if (ty === "ambulance") {
        for (const t of [0, W2]) {
          const p = (s, z) => M(s, t, z);
          face(ctx4, P2, [p(0.5, 1.5), p(L2 * 0.66 - 0.2, 1.5), p(L2 * 0.66 - 0.2, 1.2), p(0.5, 1.2)], cenS, "#d9302a");
        }
        quadS(L2 * 0.3, L2 * 0.34, 0.2, 0.4, Hm, Hm + 0.15, "#ff3b30");
        quadS(L2 * 0.3, L2 * 0.34, W2 - 0.4, W2 - 0.2, Hm, Hm + 0.15, "#3b6bff");
      }
      if (ty === "firetruck") {
        quadS(L2 * 0.2, L2 * 0.6, 0.4, W2 - 0.4, Hm, Hm + 0.25, "#c9ccd0");
        quadS(L2 * 0.3, L2 * 0.34, 0.2, 0.4, Hm + 0.25, Hm + 0.4, "#ff3b30");
        for (const t of [0, W2]) {
          const p = (s, z) => M(s, t, z);
          face(ctx4, P2, [p(0.3, 1.9), p(L2 * 0.7, 1.9), p(L2 * 0.7, 1.7), p(0.3, 1.7)], cenS, "#f3f3f3");
        }
      }
      wheels(ctx4, P2, M, ty === "bigtruck" || ty === "firetruck" ? [L2 * 0.18, L2 * 0.3, L2 * 0.88] : [L2 * 0.2, L2 * 0.86], W2, 0.5, R5, d);
    } else if (vt.bed) {
      quadS(0, vt.cab[0] * L2, 0.02, W2 - 0.02, zc, vt.bed, "#8b949c");
      for (const [s0, s1] of [[0, 0.06], [vt.cab[0] * L2 - 0.06, vt.cab[0] * L2]]) quadS(s0, s1, 0.02, W2 - 0.02, vt.bed, vt.bed + 0.25, "#a3acb4");
      quadS(vt.cab[0] * L2, L2 * 0.995, 0.03, W2 - 0.03, zc, vt.bh, body);
      cabin(ctx4, P2, M, L2, W2, vt.cab[0] * L2, vt.cab[1] * L2, vt.bh, Hm, vt.sl, body, glass, 0.06);
      wheels(ctx4, P2, M, [L2 * 0.18, L2 * 0.82], W2, 0.4, R5, d);
    } else {
      const top = sp && sp.top ? rgb(sp.top) : body;
      quadS(0, L2, 0.02, W2 - 0.02, zc, vt.bh, body);
      if (ty === "police") quadS(0, L2, 0.02, W2 - 0.02, vt.bh * 0.55, vt.bh * 0.8, "#1d1e22");
      cabin(ctx4, P2, M, L2, W2, vt.cab[0] * L2, vt.cab[1] * L2, vt.bh, Hm, vt.sl, top === body ? body : top, glass, 0.1);
      if (ty === "taxi") {
        quadS(L2 * 0.45, L2 * 0.55, W2 * 0.3, W2 * 0.7, Hm, Hm + 0.22, "#ffe08a");
      }
      if (ty === "police") {
        quadS(L2 * 0.45, L2 * 0.52, 0.3, 0.7, Hm, Hm + 0.14, "#ff3b30");
        quadS(L2 * 0.45, L2 * 0.52, W2 - 0.7, W2 - 0.3, Hm, Hm + 0.14, "#3b6bff");
      }
      wheels(ctx4, P2, M, [L2 * 0.2, L2 * 0.82], W2, ty === "suv" || ty === "minivan" ? 0.38 : 0.33, R5, d);
    }
    if (PASSENGER.has(ty)) ends(d < 2 ? "front" : "rear");
    const lights = [];
    const lampF = era >= 2 ? "#e6f4ff" : "#fff6c8", lampR = "#e0262a";
    const zl = vt.bus ? 0.8 : vt.bh * 0.72;
    for (const t of [W2 * 0.14, W2 * 0.86]) {
      const pf = M(L2, t, zl), pr = M(0, t, zl);
      lights.push({ u: pf[0], v: pf[1], z: zl, k: "head", d });
      lights.push({ u: pr[0], v: pr[1], z: zl, k: "tail", d });
      for (const [pp, c2] of [[pf, lampF], [pr, lampR]]) {
        const q = P2(pp[0], pp[1], pp[2]);
        ctx4.fillStyle = c2;
        ctx4.beginPath();
        ctx4.ellipse(q[0], q[1], 1.6 * R5, 1.1 * R5, 0, 0, 7);
        ctx4.fill();
      }
    }
    return { cv: cv2, ax, ay, lights, L: L2, W: W2, d };
  }
  function cabin(ctx4, P2, M, L2, W2, s0, s1, z0, z1, sl, col, glass, inset) {
    const t0 = inset, t1 = W2 - inset;
    const f0 = s0 + sl[0], f1 = s1 - sl[1];
    const cen = M((s0 + s1) / 2, W2 / 2, (z0 + z1) / 2);
    const g = (pts, c, o) => face(ctx4, P2, pts.map((p) => M(p[0], p[1], p[2])), cen, c, o);
    g([[f0, t0, z1], [f1, t0, z1], [f1, t1, z1], [f0, t1, z1]], col);
    for (const t of [t0, t1]) {
      g([[s0, t, z0], [s1, t, z0], [f1, t, z1], [f0, t, z1]], col);
      const k = 0.14;
      g([[s0 + 0.18, t, z0 + 0.06], [s1 - 0.16, t, z0 + 0.06], [f1 + k * 0.4, t, z1 - 0.08], [f0 - k * 0.4, t, z1 - 0.08]], glass);
      const sm = (s0 + s1) / 2;
      g([[sm - 0.04, t, z0 + 0.06], [sm + 0.04, t, z0 + 0.06], [sm + 0.04, t, z1 - 0.08], [sm - 0.04, t, z1 - 0.08]], col);
    }
    g([[s1, t0, z0], [s1, t1, z0], [f1, t1, z1], [f1, t0, z1]], glass);
    g([[s0, t0, z0], [s0, t1, z0], [f0, t1, z1], [f0, t0, z1]], mixc("#2c4256", "#4a6a86", 0));
  }
  function wheels(ctx4, P2, M, ss, W2, r, R5, d) {
    const t = d === 0 || d === 3 ? W2 - 0.02 : 0.02;
    for (const s of ss) {
      const q = P2(...M(s, t, r));
      const rr3 = r * 12 * R5;
      ctx4.fillStyle = "#16171b";
      ctx4.beginPath();
      ctx4.arc(q[0], q[1], rr3, 0, 7);
      ctx4.fill();
      ctx4.fillStyle = "#9aa0a8";
      ctx4.beginPath();
      ctx4.arc(q[0], q[1], rr3 * 0.42, 0, 7);
      ctx4.fill();
    }
  }
  function trainSprite(lineRgb, era, horiz, R5, load) {
    const L2 = 19.8, W2 = 3, Hm = 3.6;
    const d = horiz ? 0 : 1;
    const hu = (horiz ? L2 : W2) / 4, hv = (horiz ? W2 : L2) / 4;
    const { cv: cv2, ctx: ctx4, P: P2, ax, ay } = mk3(R5, hu, hv, Hm + 1.2);
    const M = mapper(d)(0, 0, L2, W2);
    const body = era <= 0 ? "#d9d4c3" : era === 1 ? "#e7e9ec" : "#f0f2f4";
    const stripe = rgb(lineRgb);
    const glass = "#2b3f55";
    ctx4.fillStyle = "rgba(30,40,30,0.30)";
    {
      const pts = [M(0, -0.2, 0), M(L2, -0.2, 0), M(L2, W2 + 0.2, 0), M(0, W2 + 0.2, 0)];
      ctx4.beginPath();
      pts.forEach((p, i) => {
        const q = P2(p[0], p[1], 0);
        i ? ctx4.lineTo(q[0], q[1]) : ctx4.moveTo(q[0], q[1]);
      });
      ctx4.fill();
    }
    const cc = M(L2 / 2, W2 / 2, Hm / 2);
    const F = (pts, c, o) => face(ctx4, P2, pts.map((p) => M(p[0], p[1], p[2])), cc, c, o);
    F([[0.8, 0.3, 0.3], [L2 - 0.8, 0.3, 0.3], [L2 - 0.8, 0.3, 0.9], [0.8, 0.3, 0.9]], "#3a3d44");
    F([[0.8, W2 - 0.3, 0.3], [L2 - 0.8, W2 - 0.3, 0.3], [L2 - 0.8, W2 - 0.3, 0.9], [0.8, W2 - 0.3, 0.9]], "#3a3d44");
    const bx = [[[0, 0, 0.9], [L2, 0, 0.9], [L2, W2, 0.9], [0, W2, 0.9]], [[0, 0, Hm], [L2, 0, Hm], [L2, W2, Hm], [0, W2, Hm]], [[0, 0, 0.9], [L2, 0, 0.9], [L2, 0, Hm], [0, 0, Hm]], [[0, W2, 0.9], [L2, W2, 0.9], [L2, W2, Hm], [0, W2, Hm]], [[0, 0, 0.9], [0, W2, 0.9], [0, W2, Hm], [0, 0, Hm]], [[L2, 0, 0.9], [L2, W2, 0.9], [L2, W2, Hm], [L2, 0, Hm]]];
    for (const f2 of bx) F(f2, body);
    F([[0.3, 0.3, Hm], [L2 - 0.3, 0.3, Hm], [L2 - 0.3, W2 - 0.3, Hm], [0.3, W2 - 0.3, Hm]], "#c9ced3");
    for (const s of [3, 8, 13, 17]) {
      F([[s, 0.8, Hm], [s + 1.6, 0.8, Hm], [s + 1.6, W2 - 0.8, Hm], [s, W2 - 0.8, Hm]], "#aeb5bb");
      F([[s, 0.8, Hm], [s + 1.6, 0.8, Hm], [s + 1.6, 0.8, Hm + 0.3], [s, 0.8, Hm + 0.3]], "#aeb5bb");
      F([[s, W2 - 0.8, Hm], [s + 1.6, W2 - 0.8, Hm], [s + 1.6, W2 - 0.8, Hm + 0.3], [s, W2 - 0.8, Hm + 0.3]], "#aeb5bb");
      F([[s + 1.6, 0.8, Hm], [s + 1.6, W2 - 0.8, Hm], [s + 1.6, W2 - 0.8, Hm + 0.3], [s + 1.6, 0.8, Hm + 0.3]], "#aeb5bb");
      F([[s, 0.8, Hm + 0.3], [s + 1.6, 0.8, Hm + 0.3], [s + 1.6, W2 - 0.8, Hm + 0.3], [s, W2 - 0.8, Hm + 0.3]], "#bfc6cc");
    }
    for (const t of [0, W2]) {
      const S0 = (s, z) => [s, t, z];
      F([S0(0, 1), S0(L2, 1), S0(L2, 1.35), S0(0, 1.35)], stripe);
      F([S0(0, 2.55 + 0), S0(L2, 2.55), S0(L2, 2.7), S0(0, 2.7)], mixc(rgb(lineRgb), "#ffffff", 0.3));
      for (let i = 0; i < 4; i++) {
        const c = 2.6 + i * 4.9;
        F([S0(c - 0.65, 0.95), S0(c + 0.65, 0.95), S0(c + 0.65, 3), S0(c - 0.65, 3)], "#b9c4cc");
        F([S0(c - 0.55, 1.05), S0(c - 0.04, 1.05), S0(c - 0.04, 2.95), S0(c - 0.55, 2.95)], glass);
        F([S0(c + 0.04, 1.05), S0(c + 0.55, 1.05), S0(c + 0.55, 2.95), S0(c + 0.04, 2.95)], glass);
        if (i < 3) {
          for (let k = 0; k < 2; k++) {
            const s0 = c + 0.9 + k * 1.9;
            F([S0(s0, 1.65), S0(s0 + 1.7, 1.65), S0(s0 + 1.7, 2.85), S0(s0, 2.85)], glass);
          }
        }
      }
      F([S0(0.1, 1.65), S0(0.9, 1.65), S0(0.9, 2.85), S0(0.1, 2.85)], glass);
      F([S0(L2 - 0.9, 1.65), S0(L2 - 0.2, 1.65), S0(L2 - 0.2, 2.85), S0(L2 - 0.9, 2.85)], glass);
    }
    const cols2 = ["#3b2a20", "#222", "#8a5a2b", "#c9a15a", "#9aa0a6", "#5a3b2e"];
    const n2 = Math.min(10, Math.round((load || 0) / 4));
    for (let k = 0; k < n2; k++) {
      const h = HB(k * 31 + 7, 3);
      const slot = h % 8;
      const s = 1.8 + slot * 2.1 + (h >>> 5 & 1) * 0.5;
      const t = h >>> 3 & 1 ? W2 : 0;
      const q = P2(...M(s, t, 2.35));
      ctx4.fillStyle = cols2[(h >>> 4) % cols2.length];
      ctx4.beginPath();
      ctx4.ellipse(q[0], q[1], 1.9 * R5, 2.4 * R5, 0, 0, 7);
      ctx4.fill();
    }
    F([[L2, 0.4, 1.7], [L2, W2 - 0.4, 1.7], [L2, W2 - 0.4, 2.9], [L2, 0.4, 2.9]], glass);
    F([[0, 0.4, 1.7], [0, W2 - 0.4, 1.7], [0, W2 - 0.4, 2.9], [0, 0.4, 2.9]], glass);
    const lights = [{ k: "head" }];
    return { cv: cv2, ax, ay, lights, L: L2, W: W2, d, windows: true };
  }
  function cabinGeom(ty, era, d, cx, cy) {
    if (!PASSENGER.has(ty)) return null;
    const vt = eraShape(V[ty] || V.sedan, ty, era | 0);
    const L2 = vt.L, W2 = vt.W, s0 = vt.cab[0] * L2, s1 = vt.cab[1] * L2, z0 = vt.bh, z1 = vt.H;
    const M = mapper(d)(cx, cy, L2, W2);
    const t = d === 0 || d === 3 ? W2 - 0.1 : 0.1;
    const f0 = s0 + vt.sl[0], f1 = s1 - vt.sl[1], k = 0.14;
    const win = [[s0 + 0.18, t, z0 + 0.06], [s1 - 0.16, t, z0 + 0.06], [f1 + k * 0.4, t, z1 - 0.08], [f0 - k * 0.4, t, z1 - 0.08]].map((q) => M(q[0], q[1], q[2]));
    const cl = s1 - s0, sf = s0 + cl * 0.62, sr = s0 + cl * 0.27, hz = z0 + (globalThis.__HZ ?? 0.4);
    const seatAt = (s, tt) => M(s, tt, hz);
    const seats = { drv: seatAt(sf, W2 * 0.73), pas: seatAt(sf, W2 * 0.27), rl: seatAt(sr, W2 * 0.2), rr: seatAt(sr, W2 * 0.8) };
    const nearRight = d === 0 || d === 3;
    return { win, seats, near: { drv: nearRight, rr: nearRight, pas: !nearRight, rl: !nearRight }, L: L2, W: W2 };
  }

