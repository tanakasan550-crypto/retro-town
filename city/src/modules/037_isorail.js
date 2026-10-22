  // src/isorail.js
  var cache7 = /* @__PURE__ */ new WeakMap();
  function crossingsOf(map2) {
    let c = cache7.get(map2);
    if (c) return c;
    const W2 = map2.W, H4 = map2.H, seen = new Uint8Array(W2 * H4);
    c = [];
    for (let y = 0; y < H4; y++) for (let x = 0; x < W2; x++) {
      const k = x + y * W2;
      if (seen[k] || map2.ground[k] !== T.CROSSING) continue;
      const q = [k];
      seen[k] = 1;
      let x0 = x, x1 = x, y0 = y, y1 = y;
      for (let i = 0; i < q.length; i++) {
        const t = q[i], tx = t % W2, ty = t / W2 | 0;
        x0 = Math.min(x0, tx);
        x1 = Math.max(x1, tx);
        y0 = Math.min(y0, ty);
        y1 = Math.max(y1, ty);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = tx + dx, ny = ty + dy;
          if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
          const nk = nx + ny * W2;
          if (!seen[nk] && map2.ground[nk] === T.CROSSING) {
            seen[nk] = 1;
            q.push(nk);
          }
        }
      }
      const rv = map2.ground[x0 + (y0 - 1) * W2] === T.RAIL || map2.ground[x0 + (y1 + 1) * W2] === T.RAIL;
      c.push({ x0, y0, x1: x1 + 1, y1: y1 + 1, railVert: rv, cx: (x0 + x1 + 1) / 2, cy: (y0 + y1 + 1) / 2, ang: 0, id: c.length });
    }
    cache7.set(map2, c);
    return c;
  }
  function gatesOf(cr) {
    const g = [];
    if (cr.railVert) {
      const len = (cr.y1 - cr.y0) / 2 + 0.1;
      g.push({ pu: cr.x0 - 0.15, pv: cr.y0 + 0.05, du: 0, dv: 1, len, side: 0 }, { pu: cr.x1 + 0.15, pv: cr.y1 - 0.05, du: 0, dv: -1, len, side: 1 });
    } else {
      const len = (cr.x1 - cr.x0) / 2 + 0.1;
      g.push({ pu: cr.x0 + 0.05, pv: cr.y0 - 0.15, du: 1, dv: 0, len, side: 0 }, { pu: cr.x1 - 0.05, pv: cr.y1 + 0.15, du: -1, dv: 0, len, side: 1 });
    }
    return g;
  }
  var poly2 = (c, pts, fill) => {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  };
  function drawGate(c, P2, Z, gt, arm, t, closed) {
    const { pu, pv, du, dv, len, side } = gt;
    const m = 2;
    const PX = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
    const w = 0.09;
    poly2(c, [PX(pu - w, pv + w, 0), PX(pu + w, pv + w, 0), PX(pu + w, pv + w, 2), PX(pu - w, pv + w, 2)], "#9a9da3");
    poly2(c, [PX(pu + w, pv + w, 0), PX(pu + w, pv - w, 0), PX(pu + w, pv - w, 2), PX(pu + w, pv + w, 2)], "#6f7278");
    const on2 = closed && (Math.floor(t * 2.6) & 1) === side;
    const lampZ = 1.7;
    for (let i = 0; i < 2; i++) {
      const z = lampZ + i * 0.28, lit = closed && (Math.floor(t * 2.6) + i & 1) === side;
      const q = PX(pu, pv, z);
      c.fillStyle = lit ? "#ff2a2a" : "#5a1a1a";
      c.beginPath();
      c.arc(q[0], q[1], 1.5 * Z, 0, 7);
      c.fill();
    }
    void on2;
    const a = arm * Math.PI / 2;
    const reach = len * Math.sin(a), up = 1 + len * m * Math.cos(a) * 0.9;
    const segs = 8;
    for (let i = 0; i < segs; i++) {
      const u0 = i / segs, u1 = (i + 1) / segs;
      const p02 = { u: pu + du * reach * u0, v: pv + dv * reach * u0, z: 1 + (up - 1) * u0 }, p1 = { u: pu + du * reach * u1, v: pv + dv * reach * u1, z: 1 + (up - 1) * u1 };
      const th = 0.07;
      poly2(c, [PX(p02.u, p02.v, p02.z - th * 2), PX(p1.u, p1.v, p1.z - th * 2), PX(p1.u, p1.v, p1.z + th * 2), PX(p02.u, p02.v, p02.z + th * 2)], i & 1 ? "#f4f4f0" : "#d8352f");
    }
  }
  var fbCache = /* @__PURE__ */ new WeakMap();
  function footbridgesOf(map2) {
    let r = fbCache.get(map2);
    if (r) return r;
    r = [];
    const W2 = map2.W, ok = (x, y) => {
      const k = x + y * W2;
      const g = map2.ground[k];
      return (g === T.GRASS || g === T.PATH || g === T.PLAZA) && map2.bid[k] < 0 && !map2.solid[k];
    };
    for (const s of map2.stations) for (const dx of [-5, -4, 5, 4]) {
      const x = s.x + dx;
      let ry = -1;
      for (let y = s.y - 4; y <= s.y + 2; y++) if (map2.ground[x + y * W2] === T.RAIL && map2.ground[x - 1 + y * W2] === T.RAIL && map2.ground[x + 1 + y * W2] === T.RAIL) {
        ry = y;
        break;
      }
      if (ry < 0) continue;
      if (ok(x, ry - 1) && ok(x, ry + 2) && map2.ground[x + (ry + 1) * W2] !== T.RAIL) {
        r.push({ x, ry, v0: ry - 1, v1: ry + 3, st: s.id });
        break;
      }
    }
    fbCache.set(map2, r);
    return r;
  }
  var brCache = /* @__PURE__ */ new WeakMap();
  function bridgeTilesOf(map2) {
    let r = brCache.get(map2);
    if (r) return r;
    r = [];
    const W2 = map2.W, H4 = map2.H, g = (x, y) => x < 0 || y < 0 || x >= W2 || y >= H4 ? -1 : map2.ground[x + y * W2];
    for (let y = 0; y < H4; y++) for (let x = 0; x < W2; x++) if (map2.ground[x + y * W2] === T.BRIDGE) {
      const e = { x, y, n: g(x, y - 1) !== T.BRIDGE && g(x, y - 1) !== T.ROAD && g(x, y - 1) !== T.CROSSING, w: g(x - 1, y) !== T.BRIDGE && g(x - 1, y) !== T.ROAD && g(x - 1, y) !== T.CROSSING, s: g(x, y + 1) !== T.BRIDGE && g(x, y + 1) !== T.ROAD && g(x, y + 1) !== T.CROSSING, e: g(x + 1, y) !== T.BRIDGE && g(x + 1, y) !== T.ROAD && g(x + 1, y) !== T.CROSSING };
      if (e.n || e.w || e.s || e.e) r.push(e);
    }
    brCache.set(map2, r);
    return r;
  }
  function drawBridgeTile(c, P2, Z, b) {
    const PX = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
    const { x, y } = b;
    const post = (u, v) => {
      const w = 0.07;
      poly2(c, [PX(u - w, v + w, 0), PX(u + w, v + w, 0), PX(u + w, v + w, 1.15), PX(u - w, v + w, 1.15)], "#d6d3cc");
      poly2(c, [PX(u + w, v + w, 0), PX(u + w, v - w, 0), PX(u + w, v - w, 1.15), PX(u + w, v + w, 1.15)], "#a9a69f");
    };
    const rail = (u0, v0, u1, v1) => {
      for (const z of [0.55, 1]) {
        poly2(c, [PX(u0, v0, z), PX(u1, v1, z), PX(u1, v1, z + 0.08), PX(u0, v0, z + 0.08)], "#8d98a6");
      }
    };
    const slab = (u0, v0, u1, v1, col) => poly2(c, [PX(u0, v0, 0), PX(u1, v1, 0), PX(u1, v1, -0.5), PX(u0, v0, -0.5)], col);
    if (b.s) slab(x, y + 1, x + 1, y + 1, "#a5a8ae");
    if (b.e) slab(x + 1, y + 1, x + 1, y, "#7f838a");
    if (b.n) {
      rail(x, y + 0.05, x + 1, y + 0.05);
      post(x + 0.03, y + 0.05);
      post(x + 0.97, y + 0.05);
    }
    if (b.w) {
      rail(x + 0.05, y, x + 0.05, y + 1);
      post(x + 0.05, y + 0.03);
      post(x + 0.05, y + 0.97);
    }
    if (b.s) {
      rail(x, y + 0.95, x + 1, y + 0.95);
      post(x + 0.03, y + 0.95);
      post(x + 0.97, y + 0.95);
    }
    if (b.e) {
      rail(x + 0.95, y, x + 0.95, y + 1);
      post(x + 0.95, y + 0.03);
      post(x + 0.95, y + 0.97);
    }
  }
  function drawBusStop(c, P2, Z, x, y, night) {
    const PX = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
    const u0 = x + 0.12, u1 = x + 0.88, v0 = y + 0.3, v1 = y + 0.7;
    const q = (a, b, d, e, col) => poly2(c, [a, b, d, e], col);
    q(PX(u0, v0, 0.1), PX(u1, v0, 0.1), PX(u1, v0, 2.1), PX(u0, v0, 2.1), "rgba(150,200,225,0.55)");
    q(PX(u0 + 0.1, v0 + 0.05, 0.5), PX(u1 - 0.1, v0 + 0.05, 0.5), PX(u1 - 0.1, v0 + 0.18, 0.5), PX(u0 + 0.1, v0 + 0.18, 0.5), "#8b6b4a");
    for (const u of [u0, u1]) {
      q(PX(u - 0.03, v1, 0), PX(u + 0.03, v1, 0), PX(u + 0.03, v1, 2.2), PX(u - 0.03, v1, 2.2), "#6a7078");
    }
    q(PX(u0 - 0.05, v1 + 0.1, 2.2), PX(u1 + 0.05, v1 + 0.1, 2.2), PX(u1 + 0.05, v1 + 0.1, 2.35), PX(u0 - 0.05, v1 + 0.1, 2.35), "#b83a30");
    q(PX(u1 + 0.05, v1 + 0.1, 2.2), PX(u1 + 0.05, v0 - 0.1, 2.2), PX(u1 + 0.05, v0 - 0.1, 2.35), PX(u1 + 0.05, v1 + 0.1, 2.35), "#8c2a22");
    q(PX(u0 - 0.05, v0 - 0.1, 2.35), PX(u1 + 0.05, v0 - 0.1, 2.35), PX(u1 + 0.05, v1 + 0.1, 2.35), PX(u0 - 0.05, v1 + 0.1, 2.35), "#d9544a");
    const s = PX(u1 + 0.12, v1, 2.9);
    q(PX(u1 + 0.1, v1, 0), PX(u1 + 0.14, v1, 0), PX(u1 + 0.14, v1, 2.9), PX(u1 + 0.1, v1, 2.9), "#555a62");
    c.fillStyle = "#d63a2f";
    c.beginPath();
    c.arc(s[0], s[1] - 1.5 * Z, 4.2 * Z, 0, 7);
    c.fill();
    c.fillStyle = "#fff";
    c.font = `bold ${Math.round(3.6 * Z)}px sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("BUS", s[0], s[1] - 1.5 * Z);
  }

