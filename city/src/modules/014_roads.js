  // src/roads.js
  var DIR = { E: 0, S: 1, W: 2, N: 3 };
  var DX = [1, 0, -1, 0];
  var DY = [0, 1, 0, -1];
  var AX = { NONE: 0, H: 1, V: 2, J: 3 };
  var cache4 = /* @__PURE__ */ new WeakMap();
  var isDrv = (g) => g === T.ROAD || g === T.BRIDGE || g === T.CROSSING || g === T.PLAZA;
  function roadInfo(map2) {
    let r = cache4.get(map2);
    if (r) return r;
    const { W: W2, H: H4, ground } = map2;
    const N2 = W2 * H4;
    const drv = new Uint8Array(N2);
    if (map2.rmeta) {
      const axis2 = new Uint8Array(N2), thick2 = new Uint8Array(N2), lane2 = new Uint8Array(N2);
      const rm = map2.rmeta;
      for (let k = 0; k < N2; k++) {
        const g = ground[k];
        if (!(g === T.ROAD || g === T.BRIDGE || g === T.CROSSING || g === T.PLAZA) || !rm.ax[k]) continue;
        drv[k] = 1;
        const a = rm.ax[k];
        if (a === 3) axis2[k] = AX.J;
        else {
          axis2[k] = a === 1 ? AX.H : AX.V;
          thick2[k] = rm.th[k] || 1;
          lane2[k] = rm.ln[k];
        }
      }
      closeToCars(map2, drv, W2);
      r = { W: W2, H: H4, drv, axis: axis2, thick: thick2, lane: lane2, map: map2 };
      cache4.set(map2, r);
      return r;
    }
    for (let k = 0; k < N2; k++) drv[k] = isDrv(ground[k]) ? 1 : 0;
    const hr = new Uint16Array(N2), vr = new Uint16Array(N2), hp = new Uint16Array(N2), vp = new Uint16Array(N2);
    for (let y = 0; y < H4; y++) {
      let x = 0;
      while (x < W2) {
        if (!drv[x + y * W2]) {
          x++;
          continue;
        }
        let e = x;
        while (e < W2 && drv[e + y * W2]) e++;
        for (let i = x; i < e; i++) {
          hr[i + y * W2] = e - x;
          hp[i + y * W2] = i - x;
        }
        x = e;
      }
    }
    for (let x = 0; x < W2; x++) {
      let y = 0;
      while (y < H4) {
        if (!drv[x + y * W2]) {
          y++;
          continue;
        }
        let e = y;
        while (e < H4 && drv[x + e * W2]) e++;
        for (let i = y; i < e; i++) {
          vr[x + i * W2] = e - y;
          vp[x + i * W2] = i - y;
        }
        y = e;
      }
    }
    const axis = new Uint8Array(N2), thick = new Uint8Array(N2), lane = new Uint8Array(N2);
    for (let k = 0; k < N2; k++) {
      if (!drv[k]) continue;
      const isH = vr[k] <= 6 && hr[k] >= 2, isV = hr[k] <= 6 && vr[k] >= 2;
      if (isH && !isV) {
        axis[k] = AX.H;
        thick[k] = vr[k];
        lane[k] = vp[k];
      } else if (isV && !isH) {
        axis[k] = AX.V;
        thick[k] = hr[k];
        lane[k] = hp[k];
      } else if (isH && isV) {
        if (hr[k] >= vr[k]) {
          axis[k] = AX.H;
          thick[k] = vr[k];
          lane[k] = vp[k];
        } else {
          axis[k] = AX.V;
          thick[k] = hr[k];
          lane[k] = hp[k];
        }
      } else {
        axis[k] = AX.J;
      }
    }
    r = { W: W2, H: H4, drv, axis, thick, lane, map: map2 };
    cache4.set(map2, r);
    return r;
  }
  var narrowMask = (axisKind, k, W2, map2) => {
    if (map2 && map2.rmeta) return map2.rmeta.ow[k] || (axisKind === AX.H ? 5 : 10);
    const x = k % W2, y = k / W2 | 0;
    const idx = axisKind === AX.H ? y / 9 | 0 : x / 12 | 0;
    if (idx % 3 !== 1) return axisKind === AX.H ? 5 : 10;
    const east = (idx / 3 | 0) & 1;
    return axisKind === AX.H ? east ? 1 << DIR.E : 1 << DIR.W : east ? 1 << DIR.S : 1 << DIR.N;
  };
  var isNarrowTwoWay = (ri, k) => ri.thick[k] === 1 && (ri.axis[k] === AX.H || ri.axis[k] === AX.V) && (laneDirs(ri, k) & laneDirs(ri, k) - 1) !== 0;
  function laneDirs(ri, k) {
    const a = ri.axis[k];
    if (!ri.drv[k] || a === AX.NONE) return 0;
    const t = ri.thick[k], l = ri.lane[k];
    if (a === AX.J) return 15;
    if (a === AX.H) {
      if (t === 1) return narrowMask(a, k, ri.W, ri.map);
      const half2 = t >> 1;
      if (t % 2 === 1 && l === half2) return 0;
      return l < half2 ? 1 << DIR.E : 1 << DIR.W;
    }
    if (t === 1) return narrowMask(a, k, ri.W, ri.map);
    const half = t >> 1;
    if (t % 2 === 1 && l === half) return 0;
    return l < half ? 1 << DIR.N : 1 << DIR.S;
  }
  function canEnter(ri, x, y, d) {
    if (x < 0 || y < 0 || x >= ri.W || y >= ri.H) return false;
    const k = x + y * ri.W;
    if (!ri.drv[k]) return false;
    const a = ri.axis[k];
    if (a === AX.J) return true;
    const m = laneDirs(ri, k);
    return !!(m & 1 << d);
  }
  var SIG = { cycle: 36, hG: 13, y: 3, ar: 2 };
  function signalAt(cl, t, axisKind) {
    if (!cl.signal) return "N";
    const p = ((t + cl.off) % SIG.cycle + SIG.cycle) % SIG.cycle;
    const a = axisKind === AX.H ? p : (p + SIG.cycle / 2) % SIG.cycle;
    return a < SIG.hG ? "G" : a < SIG.hG + SIG.y ? "Y" : "R";
  }
  function junctions(map2) {
    const ri = roadInfo(map2);
    if (ri.cl) return ri.cl;
    const { W: W2, H: H4 } = ri;
    const id = new Int16Array(W2 * H4).fill(-1);
    const list = [];
    for (let k = 0; k < W2 * H4; k++) {
      if (ri.axis[k] !== AX.J || id[k] >= 0) continue;
      const c = { id: list.length, tiles: [], x0: 1e9, y0: 1e9, x1: -1, y1: -1, arms: [] };
      const q = [k];
      id[k] = c.id;
      for (let qi = 0; qi < q.length; qi++) {
        const t = q[qi], x = t % W2, y = t / W2 | 0;
        c.tiles.push(t);
        c.x0 = Math.min(c.x0, x);
        c.x1 = Math.max(c.x1, x);
        c.y0 = Math.min(c.y0, y);
        c.y1 = Math.max(c.y1, y);
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d], ny = y + DY[d];
          if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
          const nk = nx + ny * W2;
          if (ri.axis[nk] === AX.J && id[nk] < 0) {
            id[nk] = c.id;
            q.push(nk);
          }
        }
      }
      list.push(c);
    }
    const cwk = new Uint8Array(W2 * H4);
    const stop = new Uint8Array(W2 * H4);
    for (const c of list) {
      let maxT = 1;
      const seen = /* @__PURE__ */ new Set();
      for (const t of c.tiles) {
        const x = t % W2, y = t / W2 | 0;
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d], ny = y + DY[d];
          if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
          const nk = nx + ny * W2;
          if (!ri.drv[nk] || id[nk] >= 0) continue;
          if (ri.axis[nk] === AX.J) continue;
          const axisKind = ri.axis[nk];
          if (d % 2 === 0 !== (axisKind === AX.H)) continue;
          if (!seen.has(nk)) {
            seen.add(nk);
            c.arms.push({ k: nk, d, thick: ri.thick[nk] });
            maxT = Math.max(maxT, ri.thick[nk]);
          }
        }
      }
      c.signal = maxT >= 2 && c.arms.length >= 3;
      c.off = (hash2(c.x0 * 131 + c.y0, 4242) >>> 0) % SIG.cycle;
      c.maxT = maxT;
      for (const a of c.arms) {
        if (a.thick < 2 && !c.signal) continue;
        cwk[a.k] = 1;
        const bx = a.k % W2 + DX[a.d], by = (a.k / W2 | 0) + DY[a.d];
        if (bx >= 0 && by >= 0 && bx < W2 && by < H4) {
          const bk = bx + by * W2;
          if (ri.drv[bk] && ri.axis[bk] !== AX.J) stop[bk] |= 1 << (a.d + 2) % 4;
        }
      }
    }
    const stopCl = new Int16Array(W2 * H4).fill(-1);
    for (const c of list) for (const a of c.arms) {
      const bx = a.k % W2 + DX[a.d], by = (a.k / W2 | 0) + DY[a.d];
      if (bx >= 0 && by >= 0 && bx < W2 && by < H4) stopCl[bx + by * W2] = c.id;
    }
    ri.cl = { list, id, cwk, stop, stopCl };
    return ri.cl;
  }
  function nextStates(ri, k, d, out) {
    out.length = 0;
    const W2 = ri.W, x = k % W2, y = k / W2 | 0;
    const isJ = ri.axis[k] === AX.J;
    for (const nd of isJ ? [d, (d + 1) % 4, (d + 3) % 4] : [d]) {
      const nx = x + DX[nd], ny = y + DY[nd];
      if (canEnter(ri, nx, ny, nd)) {
        out.push((nx + ny * W2) * 4 + nd, 0);
        continue;
      }
      if (!isJ && nd === d && ri.axis[k] !== AX.J && ri.drv[nx + ny * W2] !== void 0) {
        const px2 = DY[nd] !== 0 ? 1 : 0, py = DX[nd] !== 0 ? 1 : 0;
        for (const sg of [1, -1]) {
          const mx = nx + px2 * sg, my = ny + py * sg;
          if (canEnter(ri, mx, my, nd) && ri.axis[mx + my * W2] !== AX.J) {
            out.push((mx + my * W2) * 4 + nd, 1);
            break;
          }
        }
      }
    }
    return out;
  }

