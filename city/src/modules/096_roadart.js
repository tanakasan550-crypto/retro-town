  // src/roadart.js
  var WHITE = "#f4f4ee";
  var YEL = "#e8c43a";
  var WALK = "#cfc9bb";
  var CURB = "#9a968c";
  var POLE = "#4a4c55";
  function drawRoads(ctx4, map2, x0, y0, x1, y1, ox, oy, S2, clock, opt = {}) {
    const ri = roadInfo(map2), cl = junctions(map2), W2 = map2.W, TS2 = 16 * S2;
    const R5 = (px2, py, w, h, c) => {
      ctx4.fillStyle = c;
      ctx4.fillRect(Math.round(px2), Math.round(py), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    };
    const isRoadish = (g) => g === T.ROAD || g === T.BRIDGE || g === T.CROSSING || g === T.PLAZA || g === T.RAIL || g === T.PLATFORM || g === T.WATER || g === T.QUAY;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = x + y * W2;
      if (!ri.drv[k]) continue;
      if (map2.ground[k] !== T.ROAD) continue;
      const a = ri.axis[k], px2 = ox + x * TS2, py = oy + y * TS2;
      if (a === AX.H || a === AX.V) {
        const t = ri.thick[k], l = ri.lane[k];
        if (t >= 2) {
          const sides = a === AX.H ? [[0, -1, l === 0], [0, 1, l === t - 1]] : [[-1, 0, l === 0], [1, 0, l === t - 1]];
          for (const [sx, sy, edge] of sides) {
            if (!edge) continue;
            const nx = x + sx, ny = y + sy;
            if (nx < 0 || ny < 0 || nx >= W2 || ny >= map2.H) continue;
            const nk = nx + ny * W2;
            if (map2.ground[nk] !== T.GRASS || map2.bid[nk] >= 0) continue;
            const npx = ox + nx * TS2, npy = oy + ny * TS2;
            if (a === AX.H) {
              const yy = sy < 0 ? npy + TS2 - 5 * S2 : npy;
              R5(npx, yy, TS2, 5 * S2, WALK);
              R5(npx, sy < 0 ? yy + 4 * S2 : yy, TS2, S2, CURB);
            } else {
              const xx = sx < 0 ? npx + TS2 - 5 * S2 : npx;
              R5(xx, npy, 5 * S2, TS2, WALK);
              R5(sx < 0 ? xx + 4 * S2 : xx, npy, S2, TS2, CURB);
            }
          }
        }
        const horiz = a === AX.H;
        const half = t >> 1;
        if (t === 1) {
          const m0 = laneDirs(ri, k);
          if ((horiz ? x : y) % 4 === 2 && !(m0 & m0 - 1)) {
            const m = m0;
            const east = !!(m & 1) || !!(m & 2);
            const cx = px2 + TS2 / 2, cy = py + TS2 / 2;
            ctx4.fillStyle = WHITE;
            ctx4.beginPath();
            const dir = m & 1 ? 0 : m & 2 ? 1 : m & 4 ? 2 : 3;
            const vx = DX[dir], vy = DY[dir];
            const sz = 4 * S2;
            ctx4.moveTo(cx + vx * sz, cy + vy * sz);
            ctx4.lineTo(cx - vy * sz * 0.8 - vx * sz * 0.2, cy + vx * sz * 0.8 - vy * sz * 0.2);
            ctx4.lineTo(cx + vy * sz * 0.8 - vx * sz * 0.2, cy - vx * sz * 0.8 - vy * sz * 0.2);
            ctx4.closePath();
            ctx4.fill();
          }
        } else {
          if (l === 0) horiz ? R5(px2, py + S2, TS2, S2, WHITE) : R5(px2 + S2, py, S2, TS2, WHITE);
          if (l === t - 1) horiz ? R5(px2, py + TS2 - 2 * S2, TS2, S2, WHITE) : R5(px2 + TS2 - 2 * S2, py, S2, TS2, WHITE);
          if (t % 2 === 0 && l === half - 1) {
            const yellow = t >= 4;
            if (yellow) {
              horiz ? (R5(px2, py + TS2 - 2 * S2, TS2, S2, YEL), R5(px2, py + TS2, TS2, S2, YEL)) : (R5(px2 + TS2 - 2 * S2, py, S2, TS2, YEL), R5(px2 + TS2, py, S2, TS2, YEL));
            } else if (((horiz ? x : y) & 1) === 0) horiz ? R5(px2 + 2 * S2, py + TS2 - S2, 5 * S2, S2, WHITE) : R5(px2 + TS2 - S2, py + 2 * S2, S2, 5 * S2, WHITE);
          }
          if (t === 4 && (l === 0 || l === 2) && l !== half - 1) {
            if (((horiz ? x : y) & 1) === 0) horiz ? R5(px2 + 2 * S2, py + TS2 - S2, 5 * S2, S2, WHITE) : R5(px2 + TS2 - S2, py + 2 * S2, S2, 5 * S2, WHITE);
          }
          if (t === 4 && l === 1 + 0 && false) {
          }
          if (t % 2 === 1 && l === half) {
            R5(px2, py, TS2, TS2, "#6d8f5a");
            R5(px2, py, TS2, S2, CURB);
            R5(px2, py + TS2 - S2, TS2, S2, CURB);
            if (!horiz) {
              R5(px2, py, S2, TS2, CURB);
              R5(px2 + TS2 - S2, py, S2, TS2, CURB);
            }
          }
        }
      }
    }
    for (const c of cl.list) {
      if (c.signal || c.x1 < x0 - 1 || c.x0 > x1 + 1 || c.y1 < y0 - 1 || c.y0 > y1 + 1) continue;
      for (const a of c.arms) {
        const ax = a.k % W2, ay = a.k / W2 | 0, ed = (a.d + 2) % 4;
        if (!(laneDirs(ri, a.k) >> ed & 1)) continue;
        const tx = ax + DX[a.d], ty = ay + DY[a.d];
        if (tx < 0 || ty < 0 || tx >= W2 || ty >= map2.H) continue;
        const tk = tx + ty * W2;
        if (!ri.drv[tk] || ri.axis[tk] === AX.J || map2.ground[tk] !== T.ROAD) continue;
        const cx = ox + tx * TS2 + TS2 / 2, cy = oy + ty * TS2 + TS2 / 2;
        ctx4.save();
        ctx4.translate(cx, cy);
        ctx4.rotate(Math.atan2(DY[ed], DX[ed]) + Math.PI / 2);
        ctx4.fillStyle = WHITE;
        ctx4.font = `bold ${Math.round(3.6 * S2)}px sans-serif`;
        ctx4.textAlign = "center";
        ctx4.textBaseline = "middle";
        ctx4.fillText("\u6B62\u307E\u308C", 0, 0);
        ctx4.restore();
      }
    }
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = x + y * W2;
      if (!ri.drv[k] || ri.axis[k] === AX.J) continue;
      const px2 = ox + x * TS2, py = oy + y * TS2, horiz = ri.axis[k] === AX.H;
      if (cl.cwk[k] && map2.ground[k] === T.ROAD) {
        for (let i = 0; i < 5; i++) horiz ? R5(px2 + 3 * S2, py + (1 + i * 3) * S2, 10 * S2, 2 * S2, WHITE) : R5(px2 + (1 + i * 3) * S2, py + 3 * S2, 2 * S2, 10 * S2, WHITE);
      }
      const sbA = cl.stop[k];
      if (sbA && map2.ground[k] === T.ROAD) {
        const mA = laneDirs(ri, k), ci = cl.stopCl[k], jc = ci >= 0 ? cl.list[ci] : null;
        for (let d = 0; d < 4; d++) if (sbA >> d & 1 && mA >> d & 1) {
          const bk = x - DX[d] + (y - DY[d]) * W2;
          if (x - DX[d] < 0 || y - DY[d] < 0 || x - DX[d] >= W2 || y - DY[d] >= map2.H || map2.ground[bk] !== T.ROAD || !ri.drv[bk] || ri.axis[bk] === AX.J || cl.cwk[bk]) continue;
          const bx = ox + (x - DX[d]) * TS2 + TS2 / 2, by = oy + (y - DY[d]) * TS2 + TS2 / 2, vx = DX[d], vy = DY[d], lx = vy, ly = -vx, t0 = ri.thick[k], l0 = ri.lane[k];
          ;
          if (jc && !jc.signal) continue;
          const leftEdge = (() => {
            const nx = x - DX[d] + lx, ny = y - DY[d] + ly;
            return nx < 0 || ny < 0 || nx >= W2 || ny >= map2.H || !(laneDirs(ri, nx + ny * W2) & 1 << d);
          })();
          const arm = (turn) => {
            ctx4.strokeStyle = WHITE;
            ctx4.fillStyle = WHITE;
            ctx4.lineWidth = Math.max(1, 0.9 * S2);
            ctx4.lineCap = "butt";
            const a0 = [bx - vx * 4 * S2, by - vy * 4 * S2];
            ctx4.beginPath();
            ctx4.moveTo(a0[0], a0[1]);
            if (turn === 0) {
              const e = [bx + vx * 2 * S2, by + vy * 2 * S2];
              ctx4.lineTo(e[0], e[1]);
              ctx4.stroke();
              ctx4.beginPath();
              ctx4.moveTo(e[0] + vx * 2.6 * S2, e[1] + vy * 2.6 * S2);
              ctx4.lineTo(e[0] - vy * 1.8 * S2, e[1] + vx * 1.8 * S2);
              ctx4.lineTo(e[0] + vy * 1.8 * S2, e[1] - vx * 1.8 * S2);
              ctx4.closePath();
              ctx4.fill();
            } else {
              const sd = turn;
              const q = [bx, by], e = [bx + sd * -ly * 3.2 * S2, by + sd * lx * 3.2 * S2];
              ctx4.lineTo(q[0], q[1]);
              ctx4.lineTo(e[0], e[1]);
              ctx4.stroke();
              const ux = e[0] - q[0], uy = e[1] - q[1], ul = Math.hypot(ux, uy) || 1;
              const nx = ux / ul, ny = uy / ul;
              ctx4.beginPath();
              ctx4.moveTo(e[0] + nx * 2.4 * S2, e[1] + ny * 2.4 * S2);
              ctx4.lineTo(e[0] - ny * 1.7 * S2, e[1] + nx * 1.7 * S2);
              ctx4.lineTo(e[0] + ny * 1.7 * S2, e[1] - nx * 1.7 * S2);
              ctx4.closePath();
              ctx4.fill();
            }
          };
          arm(0);
          if (leftEdge && t0 >= 2) {
            arm(-1);
          }
        }
      }
      const sb = cl.stop[k];
      if (sb && map2.ground[k] === T.ROAD) {
        const m = laneDirs(ri, k);
        for (let d = 0; d < 4; d++) if (sb >> d & 1 && m >> d & 1) {
          if (d === 0) R5(px2 + TS2 - 2 * S2, py + S2, S2 * 1.5, TS2 - 2 * S2, WHITE);
          else if (d === 2) R5(px2 + S2 * 0.5, py + S2, S2 * 1.5, TS2 - 2 * S2, WHITE);
          else if (d === 1) R5(px2 + S2, py + TS2 - 2 * S2, TS2 - 2 * S2, S2 * 1.5, WHITE);
          else R5(px2 + S2, py + S2 * 0.5, TS2 - 2 * S2, S2 * 1.5, WHITE);
        }
      }
    }
    if (opt.signals !== false) for (const c of cl.list) {
      if (!c.signal) continue;
      if (c.x1 < x0 - 1 || c.x0 > x1 + 1 || c.y1 < y0 - 1 || c.y0 > y1 + 1) continue;
      for (const ar of c.arms) {
        const ax = ar.k % W2, ay = ar.k / W2 | 0;
        const horiz = ri.axis[ar.k] === AX.H;
        const st3 = signalAt(c, clock, horiz ? AX.H : AX.V);
        const pst = signalAt(c, clock, horiz ? AX.V : AX.H);
        const sx = horiz ? 0 : ri.lane[ar.k] === 0 ? -1 : ri.lane[ar.k] === ri.thick[ar.k] - 1 ? 1 : 0, sy = horiz ? ri.lane[ar.k] === 0 ? -1 : ri.lane[ar.k] === ri.thick[ar.k] - 1 ? 1 : 0 : 0;
        if (!sx && !sy) continue;
        const px2 = ox + (ax + (sx > 0 ? 1 : sx < 0 ? 0 : 0.5)) * TS2 + (sx > 0 ? 1 : sx < 0 ? -3 : 0) * S2, py = oy + (ay + (sy > 0 ? 1 : sy < 0 ? 0 : 0.5)) * TS2 + (sy > 0 ? 1 : sy < 0 ? -3 : 0) * S2;
        R5(px2 + S2, py - 6 * S2, S2, 6 * S2, POLE);
        R5(px2 - S2, py - 9 * S2, 4 * S2, 3 * S2, "#2b2d34");
        const col = st3 === "G" ? "#3ddc6a" : st3 === "Y" ? "#ffd33a" : "#ff4b3a";
        R5(px2, py - 8.5 * S2, 2 * S2, 2 * S2, col);
        const pg = pst === "G" ? "#3ddc6a" : pst === "Y" && (clock * 2 | 0) % 2 ? "#3ddc6a" : "#ff4b3a";
        R5(px2 + 2 * S2, py - 4.5 * S2, 2 * S2, 2 * S2, pg);
      }
    }
  }
  var spotCache = /* @__PURE__ */ new WeakMap();
  function signalSpots(map2) {
    let r = spotCache.get(map2);
    if (r) return r;
    r = [];
    const ri = roadInfo(map2), cl = junctions(map2), W2 = map2.W;
    for (const c of cl.list) {
      if (!c.signal) continue;
      for (const ar of c.arms) {
        const ax = ar.k % W2, ay = ar.k / W2 | 0;
        const horiz = ri.axis[ar.k] === AX.H;
        const sx = horiz ? 0 : ri.lane[ar.k] === 0 ? -1 : ri.lane[ar.k] === ri.thick[ar.k] - 1 ? 1 : 0, sy = horiz ? ri.lane[ar.k] === 0 ? -1 : ri.lane[ar.k] === ri.thick[ar.k] - 1 ? 1 : 0 : 0;
        if (!sx && !sy) continue;
        const first = !c._sg;
        c._sg = true;
        r.push({ c, ci: cl.list.indexOf(c), x: ax + (sx > 0 ? 1.12 : sx < 0 ? -0.12 : 0.5), y: ay + (sy > 0 ? 1.12 : sy < 0 ? -0.12 : 0.5), horiz, sign: first ? c.arms.map((a2) => ({ d: a2.d, name: areaName(map2, c.x0 + DX[a2.d] * 26, c.y0 + DY[a2.d] * 26) })) : null });
      }
    }
    spotCache.set(map2, r);
    return r;
  }

