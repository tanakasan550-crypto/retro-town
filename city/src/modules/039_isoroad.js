  // src/isoroad.js
  var LOT = /* @__PURE__ */ new Set(["konbini", "super", "market", "mall", "hospital", "cardealer", "usedcar", "cityhall", "hotel", "restaurant", "univ", "hs", "clinic", "pharmacy", "bank", "homecenter", "gasstation", "dept", "library", "gym", "cinema", "factory", "logistics", "warehouse", "office"]);
  var cache8 = /* @__PURE__ */ new WeakMap();
  var grc = /* @__PURE__ */ new WeakMap();
  var FREE = /* @__PURE__ */ new Set([T.GRASS, T.PLAZA, T.SAND, T.PATH]);
  function parkingOf(map2) {
    let r = cache8.get(map2);
    if (r) return r;
    r = [];
    const W2 = map2.W, H4 = map2.H;
    const idx = (x, y) => x + y * W2;
    const used = new Uint8Array(W2 * H4);
    const ri = roadInfo(map2);
    const roadAdj = (x, y, w, h) => {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + i + dx, ny = y + j + dy;
        if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
        const k = idx(nx, ny);
        if (map2.ground[k] === T.ROAD && ri.drv[k]) return true;
      }
      return false;
    };
    const ok = (x, y) => x >= 0 && y >= 0 && x < W2 && y < H4 && FREE.has(map2.ground[idx(x, y)]) && map2.deco[idx(x, y)] === D.NONE && map2.bid[idx(x, y)] < 0 && !map2.net[idx(x, y)] && !used[idx(x, y)];
    const rectOk = (x, y, w, h) => {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (!ok(x + i, y + j)) return false;
      return true;
    };
    for (const b of map2.buildings) {
      if (b.tenant || !LOT.has(b.type)) continue;
      const bw = Math.min(b.w, 6), cands = [];
      for (let dep = 2; dep <= 3; dep++) {
        const wd = Math.max(4, Math.min(bw, 6));
        for (let sh3 = -1; sh3 <= b.w - wd + 1; sh3++) {
          cands.push({ x: b.x + sh3, y: b.y + b.h + 1, w: wd, h: dep, side: "S" });
          cands.push({ x: b.x + sh3, y: b.y - dep, w: wd, h: dep, side: "N" });
        }
        for (let sy = -1; sy <= b.h - 3 + 1; sy++) {
          cands.push({ x: b.x + b.w, y: b.y + sy + 0, w: dep, h: 3, side: "E" });
          cands.push({ x: b.x - dep, y: b.y + sy + 0, w: dep, h: 3, side: "W" });
        }
      }
      cands.sort((p, q) => q.w * q.h - p.w * p.h);
      for (const c of cands) if (rectOk(c.x, c.y, c.w, c.h) && roadAdj(c.x, c.y, c.w, c.h)) {
        for (let j = 0; j < c.h; j++) for (let i = 0; i < c.w; i++) used[idx(c.x + i, c.y + j)] = 1;
        r.push({ b: b.idx, ...c });
        break;
      }
    }
    cache8.set(map2, r);
    return r;
  }
  function paintParking(sx, lots, x0, y0, x1, y1, ox, oy, TS2) {
    for (const L2 of lots) {
      if (L2.x + L2.w < x0 || L2.x > x1 || L2.y + L2.h < y0 || L2.y > y1) continue;
      const px2 = ox + L2.x * TS2, py = oy + L2.y * TS2, pw = L2.w * TS2, ph = L2.h * TS2;
      sx.fillStyle = "#585b61";
      sx.fillRect(px2, py, pw, ph);
      sx.fillStyle = "#4c4f55";
      for (let i = 0; i < L2.w * L2.h; i += 2) {
        const gx = i % L2.w, gy = i / L2.w | 0;
        sx.fillRect(px2 + gx * TS2 + TS2 * 0.1, py + gy * TS2 + TS2 * 0.1, TS2 * 0.2, TS2 * 0.2);
      }
      sx.fillStyle = "#e9e9e4";
      const lw = Math.max(1, TS2 * 0.06);
      if (L2.side === "S" || L2.side === "N") {
        for (let i = 0; i <= L2.w; i++) sx.fillRect(px2 + i * TS2 - lw / 2, py, lw, ph - TS2 * 0);
        sx.fillRect(px2, py + ph - lw, pw, lw);
        sx.fillStyle = "#b8bcc4";
        for (let i = 0; i < L2.w; i++) sx.fillRect(px2 + i * TS2 + TS2 * 0.25, L2.side === "N" ? py + ph - TS2 * 0.22 : py + TS2 * 0.12, TS2 * 0.5, TS2 * 0.1);
      } else {
        for (let j = 0; j <= L2.h; j++) sx.fillRect(px2, py + j * TS2 - lw / 2, pw, lw);
        const e = L2.side === "E" ? px2 + pw - lw : px2;
        sx.fillRect(e, py, lw, ph);
        sx.fillStyle = "#b8bcc4";
        for (let j = 0; j < L2.h; j++) sx.fillRect(L2.side === "E" ? px2 + pw - TS2 * 0.22 : px2 + TS2 * 0.12, py + j * TS2 + TS2 * 0.25, TS2 * 0.1, TS2 * 0.5);
      }
    }
  }
  function guardrailsOf(map2) {
    let k = grc.get(map2);
    if (k) return k;
    const W2 = map2.W, H4 = map2.H, out = [];
    const g = (x, y) => x < 0 || y < 0 || x >= W2 || y >= H4 ? -1 : map2.ground[x + y * W2];
    const wat = (t) => t === T.WATER;
    for (let y = 0; y < H4; y++) for (let x = 0; x < W2; x++) {
      if (map2.ground[x + y * W2] !== T.ROAD) continue;
      const n2 = wat(g(x, y - 1)), s = wat(g(x, y + 1)), w = wat(g(x - 1, y)), e = wat(g(x + 1, y));
      if (n2 || s || w || e) out.push({ x, y, n: n2, s, w, e });
    }
    grc.set(map2, out);
    return out;
  }
  function drawGuardrail(c, P2, Z, G4) {
    const PX = (u, v, z) => [P2.X(u, v), P2.Y(u, v, z)];
    const poly7 = (pts, col) => {
      c.fillStyle = col;
      c.beginPath();
      pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      c.closePath();
      c.fill();
    };
    const rail = (u0, v0, u1, v1) => {
      poly7([PX(u0, v0, 0.55), PX(u1, v1, 0.55), PX(u1, v1, 0.85), PX(u0, v0, 0.85)], "#c9ced6");
      poly7([PX(u0, v0, 0.55), PX(u1, v1, 0.55), PX(u1, v1, 0.6), PX(u0, v0, 0.6)], "#8d96a3");
    };
    const post = (u, v) => {
      const w = 0.05;
      poly7([PX(u - w, v + w, 0), PX(u + w, v + w, 0), PX(u + w, v + w, 0.9), PX(u - w, v + w, 0.9)], "#9aa1ab");
    };
    const { x, y } = G4;
    if (G4.n) {
      rail(x, y + 0.08, x + 1, y + 0.08);
      post(x + 0.1, y + 0.08);
      post(x + 0.9, y + 0.08);
    }
    if (G4.w) {
      rail(x + 0.08, y, x + 0.08, y + 1);
      post(x + 0.08, y + 0.1);
      post(x + 0.08, y + 0.9);
    }
    if (G4.s) {
      rail(x, y + 0.92, x + 1, y + 0.92);
      post(x + 0.1, y + 0.92);
      post(x + 0.9, y + 0.92);
    }
    if (G4.e) {
      rail(x + 0.92, y, x + 0.92, y + 1);
      post(x + 0.92, y + 0.1);
      post(x + 0.92, y + 0.9);
    }
  }
  function drawParkSign(c, P2, Z, L2) {
    const u = L2.side === "E" ? L2.x + 0.15 : L2.side === "W" ? L2.x + L2.w - 0.15 : L2.x + 0.2, v = L2.side === "S" ? L2.y + 0.15 : L2.side === "N" ? L2.y + L2.h - 0.15 : L2.y + 0.2;
    const PX = (a2, b2, z) => [P2.X(a2, b2), P2.Y(a2, b2, z)];
    c.fillStyle = "#7d848f";
    const a = PX(u, v, 0), b = PX(u, v, 1.7);
    c.fillRect(a[0] - 1.2 * Z, b[1], 2.4 * Z, a[1] - b[1]);
    c.fillStyle = "#1d5fb8";
    c.fillRect(b[0] - 5 * Z, b[1] - 8 * Z, 10 * Z, 10 * Z);
    c.fillStyle = "#fff";
    c.font = `bold ${Math.round(9 * Z)}px sans-serif`;
    c.textAlign = "center";
    c.fillText("P", b[0], b[1] - 0.2 * Z);
  }

