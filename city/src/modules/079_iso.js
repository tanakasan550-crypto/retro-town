  // src/iso.js
  var ISO_ZK = 0.75;
  var PXM = 12;
  var TW = 16;
  var TH = 8;
  var Proj = class {
    constructor() {
      this.Z = 2;
      this.x0 = 0;
      this.y0 = 0;
    }
    // 世界点(cu,cv)を画面の(sx,sy)に置く
    set(Z, cu, cv2, sx, sy) {
      this.Z = Z;
      this.x0 = Math.round(sx - (cu - cv2) * TW * Z);
      this.y0 = Math.round(sy - (cu + cv2) * TH * Z);
    }
    // 整数画素に丸める(地面・建物・人物のずれを防ぐ)
    X(u, v) {
      return this.x0 + (u - v) * TW * this.Z;
    }
    Y(u, v, z = 0) {
      return this.y0 + (u + v) * TH * this.Z - z * PXM * this.Z;
    }
    // 画面→世界(地面 z=0 への逆変換。タッチ操作・地図操作に使う)
    U(sx, sy) {
      const a = (sx - this.x0) / (TW * this.Z), b = (sy - this.y0) / (TH * this.Z);
      return (a + b) / 2;
    }
    V(sx, sy) {
      const a = (sx - this.x0) / (TW * this.Z), b = (sy - this.y0) / (TH * this.Z);
      return (b - a) / 2;
    }
  };
  function screenToWorldDir(ix, iy) {
    return [ix + 2 * iy, 2 * iy - ix];
  }
  function finalizeP(out, E2) {
    const pos = [];
    for (let i = 0; i < out.length; i++) if (out[i].isP) pos.push(i);
    if (pos.length > 1 && pos.length < 400) for (let pass = 0; pass < 3; pass++) {
      let sw = false;
      for (let a = 0; a < pos.length; a++) for (let b = a + 1; b < pos.length; b++) {
        const p = out[pos[a]], q = out[pos[b]];
        if (q.sx0 > p.sx1 || q.sx1 < p.sx0 || q.sy0 > p.sy1 || q.sy1 < p.sy0) continue;
        if (p.x1 + p.y1 > q.x1 + q.y1 + E2) {
          out[pos[a]] = q;
          out[pos[b]] = p;
          sw = true;
        }
      }
      if (!sw) break;
    }
    return out;
  }
  function depthSort(items) {
    const n2 = items.length;
    if (n2 < 2) return items;
    const E2 = 1e-4;
    const out = [];
    const st3 = new Uint8Array(n2);
    const behind = (a, b) => {
      const ax = a.x1 <= b.x0 + E2, bx = b.x1 <= a.x0 + E2, ay = a.y1 <= b.y0 + E2, by = b.y1 <= a.y0 + E2;
      if (ax && by || bx && ay) return 0;
      if (ax || ay) return 1;
      if (bx || by) return -1;
      const ka = a.x1 + a.y1, kb = b.x1 + b.y1;
      return ka < kb ? 1 : ka > kb ? -1 : 0;
    };
    const order = items.map((_, i) => i).sort((i, j) => items[i].x1 + items[i].y1 - (items[j].x1 + items[j].y1) || items[i].y1 - items[j].y1);
    const adj = Array.from({ length: n2 }, () => []);
    for (let ai = 0; ai < n2; ai++) {
      const a = items[order[ai]];
      for (let bi = ai + 1; bi < n2; bi++) {
        const b = items[order[bi]];
        if (b.sx0 > a.sx1 || b.sx1 < a.sx0 || b.sy0 > a.sy1 || b.sy1 < a.sy0) continue;
        const r = behind(a, b);
        if (r > 0) adj[order[bi]].push(order[ai]);
        else if (r < 0) adj[order[ai]].push(order[bi]);
      }
    }
    const visit2 = (i) => {
      if (st3[i]) return;
      st3[i] = 1;
      for (const j of adj[i]) visit2(j);
      out.push(items[i]);
    };
    for (const i of order) visit2(i);
    return finalizeP(out, E2);
  }

