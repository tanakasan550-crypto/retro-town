  // src/arcade.js
  var cache3 = /* @__PURE__ */ new WeakMap();
  var ZR = 4.3;
  var RISE = 0.8;
  var isRoadG = (g) => g === T.ROAD;
  var bldAt = (map2, x, y) => {
    if (x < 0 || y < 0 || x >= map2.W || y >= map2.H) return false;
    const i = x + y * map2.W;
    const b = map2.bid[i];
    return b !== 65535 && b >= 0 && !!map2.solid[i];
  };
  var walkG = (map2, x, y) => {
    if (x < 0 || y < 0 || x >= map2.W || y >= map2.H) return false;
    const i = x + y * map2.W;
    if (map2.solid[i] || map2.bid[i] !== 65535 && map2.bid[i] >= 0) return false;
    const g = map2.ground[i];
    return g === T.GRASS || g === T.PATH || g === T.PLAZA || g === T.SAND;
  };
  function arcadesOf(map2) {
    let a = cache3.get(map2);
    if (a) return a;
    a = [];
    if ((map2.ver || 1) >= 2 && map2.rmeta) {
      const z = map2.zones.find((q) => q.id === "shotengai");
      if (z) {
        const cands = [];
        const sc = (ax, c0, w, p02, p1) => {
          let s = 0;
          for (let p = p02; p <= p1; p++) for (let k = 0; k < w; k++) {
            const cc = c0 + k;
            const x = ax ? p : cc, y = ax ? cc : p;
            void x;
            void y;
          }
          for (let p = p02; p <= p1; p++) {
            const lx = ax ? p : c0 - 1, ly = ax ? c0 - 1 : p, rx = ax ? p : c0 + w, ry = ax ? c0 + w : p;
            const l = bldAt(map2, lx, ly) || bldAt(map2, lx - (ax ? 0 : 1), ly - (ax ? 1 : 0)), r = bldAt(map2, rx, ry) || bldAt(map2, rx + (ax ? 0 : 1), ry + (ax ? 1 : 0));
            s += (l ? 1 : 0) + (r ? 1 : 0);
          }
          return s;
        };
        for (const ax of [0, 1]) {
          const lo = ax ? z.y - z.ry : z.x - z.rx, hi2 = ax ? z.y + z.ry : z.x + z.rx, plo = ax ? z.x - z.rx : z.y - z.ry, phi = ax ? z.x + z.rx : z.y + z.ry;
          for (let c = lo; c <= hi2; c++) {
            const road = (p2) => ax ? isRoadG(map2.ground[p2 + c * map2.W]) : isRoadG(map2.ground[c + p2 * map2.W]);
            const prev = (p2) => ax ? isRoadG(map2.ground[p2 + (c - 1) * map2.W]) : isRoadG(map2.ground[c - 1 + p2 * map2.W]);
            let p = plo;
            while (p <= phi) {
              if (!road(p) || prev(p)) {
                p++;
                continue;
              }
              let e = p;
              while (e + 1 <= phi && road(e + 1) && !prev(e + 1)) e++;
              let w = 1;
              while (w < 3 && (ax ? isRoadG(map2.ground[p + (c + w) * map2.W]) : isRoadG(map2.ground[c + w + p * map2.W]))) w++;
              if (w <= 2) {
                const len = e - p + 1;
                if (len >= 6) {
                  for (const L2 of [Math.min(len, 12), Math.min(len, 8), 6]) {
                    if (L2 > len) continue;
                    for (let s0 = p; s0 + L2 - 1 <= e; s0++) {
                      const sc0 = sc(ax, c, w, s0, s0 + L2 - 1);
                      const sco = sc0 / (2 * L2);
                      if (sco >= 0.45) cands.push({ s: sc0 * (L2 / 12 + 0.5), ax, c0: c, w, a0: s0, a1: s0 + L2 - 1 });
                    }
                  }
                }
              }
              p = e + 1;
            }
          }
        }
        const roadish = (x, y) => {
          if (x < 0 || y < 0 || x >= map2.W || y >= map2.H) return false;
          const k = x + y * map2.W;
          const g = map2.ground[k];
          return (g === T.ROAD || g === T.PLAZA || g === T.BRIDGE || g === T.CROSSING) && !!map2.rmeta.ax[k];
        };
        const connected = (q) => {
          const closed = /* @__PURE__ */ new Set();
          for (let p = q.a0; p <= q.a1; p++) for (let c = q.c0; c < q.c0 + q.w; c++) closed.add(q.ax ? p + c * map2.W : c + p * map2.W);
          const st3 = (a2, c) => q.ax ? [a2, c] : [c, a2];
          const [sx, sy] = st3(q.a0 - 1, q.c0), [tx, ty] = st3(q.a1 + 1, q.c0);
          if (!roadish(sx, sy) || !roadish(tx, ty)) return false;
          const count = (useClosed) => {
            const seen = new Uint8Array(map2.W * map2.H);
            const stack = [sx + sy * map2.W];
            seen[stack[0]] = 1;
            let n2 = 0;
            while (stack.length) {
              const k = stack.pop();
              n2++;
              const x = k % map2.W, y = k / map2.W | 0;
              for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nx = x + dx, ny = y + dy;
                if (!roadish(nx, ny)) continue;
                const j = nx + ny * map2.W;
                if (seen[j] || useClosed && closed.has(j)) continue;
                seen[j] = 1;
                stack.push(j);
              }
            }
            return n2;
          };
          void tx;
          void ty;
          return count(true) === count(false) - closed.size;
        };
        cands.sort((p, q) => q.s - p.s);
        let best = null, tried = 0;
        for (const q of cands) {
          if (tried++ > 40) break;
          if (connected(q)) {
            best = q;
            break;
          }
        }
        let noClose = false;
        if (!best && cands.length) {
          best = cands[0];
          noClose = true;
        }
        if (best) {
          let e0 = 0, e1 = 0;
          const okSide = (side) => {
            let n2 = 0;
            for (let p = best.a0; p <= best.a1; p++) {
              const cc = side < 0 ? best.c0 - 1 : best.c0 + best.w;
              const x = best.ax ? p : cc, y = best.ax ? cc : p;
              if (walkG(map2, x, y)) n2++;
            }
            return n2 >= (best.a1 - best.a0 + 1) * 0.7;
          };
          if (okSide(-1)) e0 = 1;
          if (okSide(1)) e1 = 1;
          a.push({ id: "shotengai", name: "\u662D\u548C\u753A\u5546\u5E97\u8857", ax: best.ax, c0: best.c0 - e0, c1: best.c0 + best.w + e1, a0: best.a0, a1: best.a1 + 1, roadC0: best.c0, roadC1: best.c0 + best.w, rc0: best.c0 - e0 - (e0 ? 0 : 0.5), rc1: best.c0 + best.w + e1 + (e1 ? 0 : 0.5), seed: (map2.seed ^ 20973) >>> 0, noClose });
        }
      }
    }
    cache3.set(map2, a);
    return a;
  }
  function closeToCars(map2, drv, W2) {
    if (globalThis.NOARC) return;
    for (const A2 of arcadesOf(map2)) if (!A2.noClose) for (let p = A2.a0; p < A2.a1; p++) for (let c = A2.roadC0; c < A2.roadC1; c++) {
      const x = A2.ax ? p : c, y = A2.ax ? c : p;
      drv[x + y * W2] = 0;
    }
  }
  var arcadeKind = (A2, year) => year < 1990 ? "old" : year < 2012 ? "new" : A2.seed & 1 ? "open" : "new";
  function arcadeAt(map2, x, y) {
    for (const A2 of arcadesOf(map2)) {
      const p = A2.ax ? x : y, c = A2.ax ? y : x;
      if (p >= A2.a0 && p < A2.a1 && c >= A2.c0 && c < A2.c1) return A2;
    }
    return null;
  }
  function arcadeStyle(A2, kind, month0) {
    const festival = month0 === 6 || month0 === 7, spring = month0 === 2 || month0 === 3, xmas = month0 === 11 || month0 === 0, autumn = month0 === 9 || month0 === 10;
    return { kind, festival, spring, xmas, autumn };
  }
  var mk = (A2, P2) => {
    const X = (a, c, z = 0) => A2.ax ? P2.X(c, a) : P2.X(a, c);
    const Y2 = (a, c, z = 0) => A2.ax ? P2.Y(c, a, z) : P2.Y(a, c, z);
    return [X, Y2];
  };
  var poly2 = (ctx4, pts, fill, stroke) => {
    ctx4.beginPath();
    pts.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
    ctx4.closePath();
    if (fill) {
      ctx4.fillStyle = fill;
      ctx4.fill();
    }
    if (stroke) {
      ctx4.strokeStyle = stroke;
      ctx4.stroke();
    }
  };
  function drawArcadeGround(ctx4, A2, P2, Z, kind, st3, W2, H4) {
    const [X, Y2] = mk(A2, P2);
    const ca = A2.c1 - A2.c0;
    const base = kind === "old" ? "#a9a39a" : kind === "new" ? "#c9a98a" : "#bdb2a0", line2 = kind === "old" ? "#8b857c" : "#a98a6e";
    for (let a = A2.a0; a < A2.a1; a++) for (let c = A2.c0; c < A2.c1; c++) {
      const pts = [[X(a, c), Y2(a, c)], [X(a + 1, c), Y2(a + 1, c)], [X(a + 1, c + 1), Y2(a + 1, c + 1)], [X(a, c + 1), Y2(a, c + 1)]];
      const sx = Math.min(...pts.map((p) => p[0])), sx1 = Math.max(...pts.map((p) => p[0])), sy = Math.min(...pts.map((p) => p[1])), sy1 = Math.max(...pts.map((p) => p[1]));
      if (sx1 < 0 || sx > W2 || sy1 < 0 || sy > H4) continue;
      const mid = c >= A2.roadC0 && c < A2.roadC1;
      const alt = a + c & 1;
      poly2(ctx4, pts, mid ? kind === "new" ? alt ? "#d3b394" : "#cfae8e" : base : shade(base, alt ? 0.97 : 1.03), line2);
      if (kind !== "old" && mid && (a * 3 + c) % 5 === 0) {
        ctx4.globalAlpha = 0.35;
        poly2(ctx4, [[X(a + 0.2, c + 0.2), Y2(a + 0.2, c + 0.2)], [X(a + 0.8, c + 0.2), Y2(a + 0.8, c + 0.2)], [X(a + 0.8, c + 0.8), Y2(a + 0.8, c + 0.8)], [X(a + 0.2, c + 0.8), Y2(a + 0.2, c + 0.8)]], "#8d6a52");
        ctx4.globalAlpha = 1;
      }
    }
    if (kind !== "open") {
      ctx4.globalAlpha = kind === "old" ? 0.22 : 0.12;
      poly2(ctx4, [[X(A2.a0, A2.c0), Y2(A2.a0, A2.c0)], [X(A2.a1, A2.c0), Y2(A2.a1, A2.c0)], [X(A2.a1, A2.c1), Y2(A2.a1, A2.c1)], [X(A2.a0, A2.c1), Y2(A2.a0, A2.c1)]], "#000");
      ctx4.globalAlpha = 1;
    }
    void ca;
    void st3;
  }
  function drawArcadeSeg(ctx4, A2, P2, Z, kind, st3, s0, s1, alpha, first, last, year) {
    const [X, Y2] = mk(A2, P2);
    const c0 = A2.rc0, c1 = A2.rc1, cm = (c0 + c1) / 2;
    const hz = 12 * Z;
    const sy = (a, c, z) => Y2(a, c, z), sx = (a, c) => X(a, c);
    const L2 = (a, c, z) => [sx(a, c), sy(a, c, z)];
    ctx4.lineJoin = "round";
    ctx4.lineWidth = Math.max(1, Z * 0.18);
    const dz = ZR - 0.5;
    for (let a = s0; a < s1; a++) {
      const am = a + 0.5;
      if (st3.festival) {
        for (let k = 0; k < 2; k++) {
          const c = c0 + (c1 - c0) * (k + 1) / 3;
          const [x, y] = L2(am, c, dz);
          ctx4.fillStyle = "#d83a2c";
          ctx4.beginPath();
          ctx4.ellipse(x, y + 0.35 * hz, 0.7 * Z, 0.95 * Z, 0, 0, 7);
          ctx4.fill();
          ctx4.fillStyle = "#ffe9a8";
          ctx4.fillRect(x - 0.5 * Z, y + 0.3 * hz, Z, 0.25 * Z);
          ctx4.strokeStyle = "#3a2a22";
          ctx4.beginPath();
          ctx4.moveTo(x, y - 0.1 * hz);
          ctx4.lineTo(x, y + 0.1 * hz);
          ctx4.stroke();
        }
      } else if (st3.spring) {
        for (let k = 0; k < 3; k++) {
          const c = c0 + (c1 - c0) * (k + 0.5) / 3;
          const [x, y] = L2(am, c, dz + 0.2);
          ctx4.fillStyle = a + k & 1 ? "#f6b6c8" : "#fbd3df";
          ctx4.beginPath();
          ctx4.arc(x, y + 0.2 * hz, 0.9 * Z, 0, 7);
          ctx4.fill();
        }
      } else if (st3.xmas) {
        const c = cm;
        const [x, y] = L2(am, c, dz + 0.3);
        ctx4.strokeStyle = "#2f7a43";
        ctx4.beginPath();
        ctx4.moveTo(x - 4 * Z, y);
        ctx4.lineTo(x + 4 * Z, y + 1.2 * Z);
        ctx4.stroke();
        ctx4.fillStyle = a & 1 ? "#e4412f" : "#f6cf3a";
        ctx4.beginPath();
        ctx4.arc(x, y + 0.5 * Z, 0.7 * Z, 0, 7);
        ctx4.fill();
      } else {
        for (let k = 0; k < 2; k++) {
          const c = c0 + (c1 - c0) * (k + 1) / 3;
          const [x, y] = L2(am, c, dz);
          ctx4.fillStyle = st3.autumn ? a + k & 1 ? "#d2692c" : "#b9892e" : a + k & 1 ? "#e7d4a0" : "#d9604b";
          ctx4.fillRect(x - 0.7 * Z, y, 1.4 * Z, 2.2 * Z);
        }
      }
    }
    ctx4.fillStyle = "#eef3f2";
    for (let a = s0; a < s1; a++) {
      const [x, y] = L2(a + 0.5, cm, ZR - 0.15);
      ctx4.fillRect(x - 2.2 * Z, y, 4.4 * Z, 0.6 * Z);
    }
    const pc = [c0 + 0.12, c1 - 0.12];
    for (const c of pc) {
      const a = s1 - 0.02;
      if (first) {
        const [x2, y02] = L2(s0 + 0.02, c, 0), [, y12] = L2(s0 + 0.02, c, ZR);
        ctx4.fillStyle = kind === "old" ? "#5d7a68" : "#7f8c97";
        ctx4.fillRect(x2 - 0.5 * Z, y12, 1 * Z, y02 - y12);
      }
      const [x, y0] = L2(a, c, 0), [, y1] = L2(a, c, ZR);
      ctx4.fillStyle = kind === "old" ? "#5d7a68" : "#7f8c97";
      ctx4.fillRect(x - 0.5 * Z, y1, 1 * Z, y0 - y1);
      ctx4.fillStyle = "rgba(0,0,0,0.18)";
      ctx4.fillRect(x, y1, 0.5 * Z, y0 - y1);
    }
    if (kind === "open") {
      const col = st3.festival ? ["#d83a2c", "#f2d13a"] : st3.spring ? ["#f6b6c8", "#fbd3df"] : st3.xmas ? ["#2f7a43", "#d63c2a"] : st3.autumn ? ["#d2692c", "#b9892e"] : ["#3a7bd5", "#e86a4a"];
      ctx4.strokeStyle = "#555";
      ctx4.beginPath();
      const a0 = L2(s0, c0 + 0.12, ZR), a1 = L2(s1, c0 + 0.12, ZR);
      ctx4.moveTo(a0[0], a0[1]);
      ctx4.lineTo(a1[0], a1[1]);
      const b0 = L2(s0, c1 - 0.12, ZR), b1 = L2(s1, c1 - 0.12, ZR);
      ctx4.moveTo(b0[0], b0[1]);
      ctx4.lineTo(b1[0], b1[1]);
      ctx4.stroke();
      for (let a = s0; a < s1; a++) for (let q = 0; q < 4; q++) for (const c of pc) {
        const f2 = (q + 0.5) / 4;
        const [x, y] = L2(a + f2, c, ZR);
        ctx4.fillStyle = col[a + q & 1];
        poly2(ctx4, [[x - 0.8 * Z, y], [x + 0.8 * Z, y], [x, y + 1.6 * Z]], ctx4.fillStyle);
      }
      return;
    }
    const al = alpha * (kind === "new" ? 0.72 : 1);
    ctx4.globalAlpha = al;
    const e0 = (a, c) => L2(a, c, ZR), r = (a) => L2(a, cm, ZR + RISE);
    const lo = kind === "old" ? "#6f8f7d" : "#9fc4d8", hi2 = kind === "old" ? "#85a592" : "#b9d8e8";
    poly2(ctx4, [e0(s0, c0), e0(s1, c0), r(s1), r(s0)], shade(lo, 0.85), "rgba(40,50,50,0.55)");
    poly2(ctx4, [e0(s0, c1), e0(s1, c1), r(s1), r(s0)], hi2, "rgba(40,50,50,0.55)");
    ctx4.strokeStyle = kind === "old" ? "rgba(40,60,50,0.45)" : "rgba(255,255,255,0.7)";
    for (let a = s0; a <= s1; a += kind === "old" ? 0.5 : 1) {
      const p = e0(a, c0), q = r(a), s = e0(a, c1);
      ctx4.beginPath();
      ctx4.moveTo(p[0], p[1]);
      ctx4.lineTo(q[0], q[1]);
      ctx4.lineTo(s[0], s[1]);
      ctx4.stroke();
    }
    const fz = 0.35;
    ctx4.fillStyle = kind === "old" ? "#46604f" : "#6c7a85";
    poly2(ctx4, [e0(s0, c1), e0(s1, c1), L2(s1, c1, ZR - fz), L2(s0, c1, ZR - fz)], ctx4.fillStyle);
    if (last) {
      const p = [e0(s1, c0), r(s1), e0(s1, c1), L2(s1, c1, ZR - fz), L2(s1, c0, ZR - fz)];
      poly2(ctx4, p, kind === "old" ? "#4d6a57" : "#7c8a95");
    }
    ctx4.globalAlpha = 1;
    void year;
  }
  function drawArcadeGate(ctx4, A2, P2, Z, kind, st3, end, alpha, year) {
    const [X, Y2] = mk(A2, P2);
    const a = end ? A2.a1 - 0.1 : A2.a0 + 0.1;
    const c0 = A2.rc0, c1 = A2.rc1;
    const L2 = (c, z) => [X(a, c), Y2(a, c, z)];
    const hz = 12 * Z;
    ctx4.globalAlpha = 1;
    const poleC = kind === "old" ? "#3f6b4f" : kind === "new" ? "#8a2b2b" : "#6a5a48";
    for (const c of [c0 + 0.12, c1 - 0.12]) {
      const [x, y0] = L2(c, 0), [, y1] = L2(c, ZR + 1.4);
      ctx4.fillStyle = poleC;
      ctx4.fillRect(x - 0.9 * Z, y1, 1.8 * Z, y0 - y1);
      ctx4.fillStyle = "rgba(0,0,0,0.2)";
      ctx4.fillRect(x, y1, 0.9 * Z, y0 - y1);
    }
    const zb0 = ZR + 0.05, zb1 = ZR + 1.55;
    const cs = X(a, c0) <= X(a, c1) ? [c0, c1] : [c1, c0];
    const q = [L2(cs[0], zb0), L2(cs[1], zb0), L2(cs[1], zb1), L2(cs[0], zb1)];
    ctx4.globalAlpha = Math.max(alpha, 0.45);
    poly2(ctx4, q, kind === "old" ? "#1f5a3a" : kind === "new" ? "#c43a32" : "#f1e4c2", "#222");
    ctx4.globalAlpha = 1;
    ctx4.save();
    const p02 = q[0];
    const sl = (q[1][1] - q[0][1]) / (q[1][0] - q[0][0]);
    ctx4.setTransform(1, 0, 0, 1, 0, 0);
    ctx4.transform(1, sl, 0, 1, p02[0], p02[1]);
    const wpx = q[1][0] - q[0][0], hpx = Math.abs(q[3][1] - q[0][1]);
    const name = A2.name;
    ctx4.font = `bold ${Math.floor(hpx * 0.62)}px ${SIGN_FONT}`;
    const mw = ctx4.measureText(name).width;
    const k = Math.min(1, wpx * 0.86 / mw);
    ctx4.translate(wpx / 2, -hpx * 0.5);
    ctx4.scale(k, 1);
    ctx4.textAlign = "center";
    ctx4.textBaseline = "middle";
    ctx4.fillStyle = kind === "new" ? "#fff6dd" : kind === "old" ? "#f5f1d8" : "#3a2a1c";
    ctx4.fillText(name, 0, 0);
    ctx4.restore();
    if (st3.festival) for (const f2 of [0.18, 0.5, 0.82]) {
      const [x, y] = L2(c0 + (c1 - c0) * f2, zb0);
      ctx4.fillStyle = "#d83a2c";
      ctx4.beginPath();
      ctx4.ellipse(x, y + 1 * Z, 0.75 * Z, 1 * Z, 0, 0, 7);
      ctx4.fill();
    }
    if (kind === "old") {
      const [x, y] = L2((c0 + c1) / 2, zb1);
      ctx4.fillStyle = "#d9c36a";
      ctx4.beginPath();
      ctx4.arc(x, y - 0.4 * Z, 0.9 * Z, 0, 7);
      ctx4.fill();
    }
    void hz;
    void year;
  }
  function lightArcadeSeg(A2, P2, Z, kind, st3, s0, s1, glow2) {
    const [X, Y2] = mk(A2, P2);
    const cm = (A2.rc0 + A2.rc1) / 2;
    for (let a = s0 + 0.5; a < s1; a += 1) {
      glow2(X(a, cm), Y2(a, cm, ZR - 0.3), 6 * Z, kind === "old" ? "rgba(255,235,170,0.8)" : "rgba(235,245,255,0.8)");
      glow2(X(a, cm), Y2(a, cm, 0.1), 9 * Z, "rgba(255,224,150,0.38)", 0.5);
      if (st3.festival) for (const f2 of [1 / 3, 2 / 3]) {
        const c = A2.rc0 + (A2.rc1 - A2.rc0) * f2;
        glow2(X(a, c), Y2(a, c, ZR - 0.5), 3.4 * Z, "rgba(255,90,60,0.85)");
      }
    }
  }
  function lightArcadeGate(A2, P2, Z, end, glow2) {
    const [X, Y2] = mk(A2, P2);
    const a = end ? A2.a1 - 0.1 : A2.a0 + 0.1;
    const cm = (A2.rc0 + A2.rc1) / 2;
    glow2(X(a, cm), Y2(a, cm, ZR + 0.8), 10 * Z, "rgba(255,240,190,0.7)", 0.5);
    glow2(X(a, cm), Y2(a, cm, ZR + 0.8), 5 * Z, "rgba(255,255,230,0.8)");
  }
  var pcache = /* @__PURE__ */ new WeakMap();
  function platformsOf(map2) {
    let a = pcache.get(map2);
    if (a) return a;
    a = [];
    const { W: W2, H: H4 } = map2;
    const isP = (x, y) => x >= 0 && y >= 0 && x < W2 && y < H4 && map2.ground[x + y * W2] === T.PLATFORM;
    const seen = new Uint8Array(W2 * H4);
    for (let y = 0; y < H4; y++) for (let x = 0; x < W2; x++) {
      if (!isP(x, y) || seen[x + y * W2]) continue;
      let x0 = x, x1 = x, y0 = y, y1 = y;
      const st3 = [[x, y]];
      seen[x + y * W2] = 1;
      while (st3.length) {
        const [cx, cy] = st3.pop();
        x0 = Math.min(x0, cx);
        x1 = Math.max(x1, cx);
        y0 = Math.min(y0, cy);
        y1 = Math.max(y1, cy);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx, ny = cy + dy;
          if (isP(nx, ny) && !seen[nx + ny * W2]) {
            seen[nx + ny * W2] = 1;
            st3.push([nx, ny]);
          }
        }
      }
      const wx = x1 - x0 + 1, wy = y1 - y0 + 1;
      if (Math.max(wx, wy) < 6) continue;
      const ax = wx >= wy ? 1 : 0;
      const p02 = ax ? x0 : y0, p1 = ax ? x1 : y1;
      const c0 = ax ? y0 : x0, c1 = (ax ? y1 : x1) + 1;
      const L2 = p1 - p02 + 1;
      const n2 = Math.min(L2 - 2, 14);
      const s0 = p02 + Math.floor((L2 - n2) / 2);
      a.push({ id: "plat", ax, c0, c1, rc0: c0 - 0.3, rc1: c1 + 0.3, a0: s0, a1: s0 + n2, roadC0: c0, roadC1: c1 });
    }
    pcache.set(map2, a);
    return a;
  }
  var PZ = 3.7;
  function drawPlatformSeg(ctx4, A2, P2, Z, s0, s1, alpha, first, last) {
    const [X, Y2] = mk(A2, P2);
    const L2 = (a, c, z) => [X(a, c), Y2(a, c, z)];
    const c0 = A2.rc0, c1 = A2.rc1, cm = (A2.c0 + A2.c1) / 2;
    ctx4.lineJoin = "round";
    ctx4.lineWidth = Math.max(1, Z * 0.15);
    for (const a of first ? [s0 + 0.02, s1 - 0.02] : [s1 - 0.02]) {
      const [x, y0] = L2(a, cm, 0), [, y1] = L2(a, cm, PZ);
      ctx4.fillStyle = "#9aa3ad";
      ctx4.fillRect(x - 0.5 * Z, y1, 1 * Z, y0 - y1);
      ctx4.fillStyle = "rgba(0,0,0,.2)";
      ctx4.fillRect(x, y1, 0.5 * Z, y0 - y1);
    }
    ctx4.globalAlpha = alpha;
    const rf = "#dfe6ea";
    const q = [L2(s0, c0, PZ), L2(s1, c0, PZ), L2(s1, c1, PZ), L2(s0, c1, PZ)];
    ctx4.beginPath();
    q.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
    ctx4.closePath();
    ctx4.fillStyle = rf;
    ctx4.fill();
    ctx4.strokeStyle = "rgba(60,70,80,.5)";
    ctx4.stroke();
    ctx4.strokeStyle = "rgba(90,110,130,.35)";
    for (let a = s0; a <= s1; a += 1) {
      const p = L2(a, c0, PZ), r = L2(a, c1, PZ);
      ctx4.beginPath();
      ctx4.moveTo(p[0], p[1]);
      ctx4.lineTo(r[0], r[1]);
      ctx4.stroke();
    }
    const e1 = [L2(s0, c1, PZ), L2(s1, c1, PZ), L2(s1, c1, PZ - 0.35), L2(s0, c1, PZ - 0.35)];
    ctx4.beginPath();
    e1.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
    ctx4.closePath();
    ctx4.fillStyle = "#7c8c9c";
    ctx4.fill();
    if (last) {
      const e2 = [L2(s1, c0, PZ), L2(s1, c1, PZ), L2(s1, c1, PZ - 0.35), L2(s1, c0, PZ - 0.35)];
      ctx4.beginPath();
      e2.forEach((p, i) => i ? ctx4.lineTo(p[0], p[1]) : ctx4.moveTo(p[0], p[1]));
      ctx4.closePath();
      ctx4.fillStyle = "#8d9cab";
      ctx4.fill();
    }
    ctx4.globalAlpha = 1;
  }
  function lightPlatformSeg(A2, P2, Z, s0, s1, glow2) {
    const [X, Y2] = mk(A2, P2);
    const cm = (A2.c0 + A2.c1) / 2;
    for (let a = s0 + 0.5; a < s1; a += 1.5) glow2(X(a, cm), Y2(a, cm, PZ - 0.2), 6 * Z, "rgba(235,245,255,0.85)");
  }

