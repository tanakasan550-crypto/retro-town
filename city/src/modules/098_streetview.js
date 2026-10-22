  // src/streetview.js
  var NW = 560;
  var MAXD = 46;
  var FOVK = 0.92;
  var EYE = 1.5;
  var TILE_M = 2;
  var HORK = 0.4;
  var camBack = (R5) => Math.max(1.6, Math.min(6, 3.8 - 0.55 * (R5.zl || 0)));
  var GROUND = { [T.GRASS]: [95, 154, 71], [T.ROAD]: [92, 95, 104], [T.PLAZA]: [207, 196, 168], [T.WATER]: [59, 127, 181], [T.SAND]: [227, 212, 160], [T.RAIL]: [110, 96, 82], [T.PLATFORM]: [191, 191, 184], [T.FARM]: [156, 122, 74], [T.FOREST]: [63, 122, 58], [T.ROCK]: [138, 138, 133], [T.BRIDGE]: [122, 122, 128], [T.CROSSING]: [92, 95, 104], [T.PATH]: [205, 185, 138], [T.QUAY]: [154, 160, 166], [T.PADDY]: [127, 174, 90] };
  var YAW = { r: 0, d: Math.PI / 2, l: Math.PI, u: -Math.PI / 2 };
  var hexRGB = (h) => {
    const n2 = parseInt(h.slice(1), 16);
    return [n2 >> 16 & 255, n2 >> 8 & 255, n2 & 255];
  };
  var mix2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  var css = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  function initStreet(R5) {
    R5.sv = { yaw: 0, cv: null, img: null, spr: /* @__PURE__ */ new Map(), z: new Float32Array(NW), t: 0 };
  }
  var yawOf = (f2) => YAW[f2] ?? 0;
  var setYawFromFacing = (R5, f2) => {
    if (!R5.sv) initStreet(R5);
    R5.sv.yaw = yawOf(f2);
  };
  function facingOfYaw(yaw) {
    const a = (yaw % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    return a < Math.PI / 4 || a >= 7 * Math.PI / 4 ? "r" : a < 3 * Math.PI / 4 ? "d" : a < 5 * Math.PI / 4 ? "l" : "u";
  }
  function sprite(R5, key, w, h, draw2, minPx = 0) {
    const m = R5.sv.spr;
    let s = m.get(key);
    if (s) return s;
    s = document.createElement("canvas");
    s.width = w;
    s.height = h;
    draw2(s.getContext("2d"));
    if (minPx) {
      const d = s.getContext("2d").getImageData(0, 0, w, h).data;
      let n2 = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n2++;
      if (n2 < minPx) return s;
    }
    if (m.size > 400) m.clear();
    m.set(key, s);
    return s;
  }
  function personSprite(R5, w) {
    const g = R5.g, look = g.world.pop.look[w.id];
    if (look === void 0) return null;
    const dir = Math.abs(w.dx || 0) > Math.abs(w.dy || 0) ? (w.dx || 0) > 0 ? "r" : "l" : (w.dy || 0) > 0 ? "d" : "u";
    const age = w.hero ? g.age() : g.ageOf(w.id);
    return sprite(R5, "p" + w.id + dir + (w.hero ? "h" + (age | 0) : ""), 44, 64, (c) => {
      const keep = R5.S;
      R5.S = 2.2;
      try {
        R5.drawChar(c, 22, 58, look, age, dir, false, { id: w.id });
      } catch (e) {
      }
      R5.S = keep;
    }, 300);
  }
  var carSprite = (R5, col) => sprite(R5, "c" + col, 90, 40, (c) => {
    c.fillStyle = "rgba(0,0,0,0.25)";
    c.fillRect(4, 34, 82, 5);
    c.fillStyle = col;
    c.fillRect(6, 14, 78, 20);
    c.fillRect(20, 4, 48, 14);
    c.fillStyle = "#9ec7e0";
    c.fillRect(24, 7, 18, 9);
    c.fillRect(46, 7, 18, 9);
    c.fillStyle = "#222";
    c.beginPath();
    c.arc(22, 34, 7, 0, 7);
    c.arc(68, 34, 7, 0, 7);
    c.fill();
  });
  var treeSprite = (R5, cl) => sprite(R5, "t" + cl, 64, 96, (c) => {
    c.fillStyle = "#6a4a2a";
    c.fillRect(28, 56, 8, 38);
    c.fillStyle = cl;
    c.beginPath();
    c.arc(32, 36, 26, 0, 7);
    c.arc(20, 46, 16, 0, 7);
    c.arc(44, 46, 16, 0, 7);
    c.fill();
  });
  var POLE2 = sprite0((c, W2, H4) => {
    c.fillStyle = "#6b6f78";
    c.fillRect(W2 / 2 - 2, 0, 4, H4);
    c.fillRect(W2 / 2 - 14, 6, 28, 3);
  });
  function sprite0(f2) {
    return { f: f2 };
  }
  function drawStreet(R5, dt, hero, extras = {}) {
    if (!R5.sv) initStreet(R5);
    beginFrame(8);
    const sv = R5.sv, g = R5.g, map2 = g.world.map, ctxMain = R5.ctx, CW = R5.cv.width, CH3 = R5.cv.height;
    R5.time += dt;
    sv.t += dt;
    const NH = Math.max(160, Math.round(NW * CH3 / CW));
    if (!sv.cv || sv.cv.height !== NH) {
      sv.cv = document.createElement("canvas");
      sv.cv.width = NW;
      sv.cv.height = NH;
      sv.img = null;
    }
    const ctx4 = sv.cv.getContext("2d");
    const year = g.year(), hour = g.S.min / 60, night = R5.nightAlpha();
    const yaw = sv.yaw, dx = Math.cos(yaw), dy = Math.sin(yaw), plx = -dy * FOVK, ply = dx * FOVK;
    const K3 = NW / (2 * FOVK), hor = Math.round(NH * HORK);
    let back = camBack(R5);
    let px2 = hero.x - dx * back, py = hero.y - dy * back;
    for (let i = 0; i < 14 && (px2 < 0 || py < 0 || px2 >= map2.W || py >= map2.H || map2.bid[Math.floor(px2) + Math.floor(py) * map2.W] >= 0 || map2.solid[Math.floor(px2) + Math.floor(py) * map2.W] === 1); i++) {
      back = Math.max(0.15, back - 0.3);
      px2 = hero.x - dx * back;
      py = hero.y - dy * back;
    }
    const dayTop = [110, 178, 236], dayHor = [214, 232, 245], nT = [16, 24, 52], nH = [48, 58, 96];
    const k = Math.min(1, night * 1.8);
    const skyTop = mix2(dayTop, nT, k), skyHor = mix2(dayHor, nH, k);
    const gr = ctx4.createLinearGradient(0, 0, 0, hor);
    gr.addColorStop(0, css(skyTop));
    gr.addColorStop(1, css(skyHor));
    ctx4.fillStyle = gr;
    ctx4.fillRect(0, 0, NW, hor);
    if (!sv.img || sv.img.height !== NH - hor) sv.img = ctx4.createImageData(NW, NH - hor);
    const px32 = sv.img.data;
    const { W: W2, H: H4, ground, bid, deco } = map2;
    const dim2 = 1 - night * 0.55;
    for (let y = hor + 1; y < NH; y++) {
      const rd2 = EYE * K3 / (y - hor);
      const fx0 = px2 + rd2 * (dx - plx), fy0 = py + rd2 * (dy - ply), sx = rd2 * 2 * plx / NW, sy = rd2 * 2 * ply / NW;
      const fog = Math.min(1, Math.pow(rd2 / MAXD, 1.4));
      let fx = fx0, fy = fy0;
      let o = (y - hor) * NW * 4;
      for (let x = 0; x < NW; x++, fx += sx, fy += sy, o += 4) {
        const tx = Math.floor(fx), ty = Math.floor(fy);
        let c;
        if (tx < 0 || ty < 0 || tx >= W2 || ty >= H4) c = GROUND[T.WATER];
        else {
          const gt = ground[tx + ty * W2];
          c = GROUND[gt] || GROUND[T.GRASS];
          const n2 = (tx * 7 + ty * 13 & 3) * 2;
          let r = c[0] + n2, gg = c[1] + n2, b = c[2] + n2;
          if (gt === T.ROAD || gt === T.CROSSING) {
            const u = fx - tx, v = fy - ty;
            if (gt === T.CROSSING && (u * 5 | 0) & 1) {
              r = 236;
              gg = 236;
              b = 230;
            } else {
              const edge = u < 0.06 || u > 0.94 || v < 0.06 || v > 0.94;
              if (edge) {
                r += 14;
                gg += 14;
                b += 14;
              }
            }
          } else if (bid[tx + ty * W2] >= 0) {
            r = 150;
            gg = 145;
            b = 140;
          }
          c = [r, gg, b];
        }
        const rr3 = (c[0] + (skyHor[0] - c[0]) * fog) * dim2, gg2 = (c[1] + (skyHor[1] - c[1]) * fog) * dim2, bb = (c[2] + (skyHor[2] - c[2]) * fog) * dim2;
        px32[o] = rr3;
        px32[o + 1] = gg2;
        px32[o + 2] = bb;
        px32[o + 3] = 255;
      }
    }
    ctx4.putImageData(sv.img, 0, hor);
    const zb = sv.z;
    zb.fill(1e9);
    const seen = /* @__PURE__ */ new Map();
    const spots = [];
    const bcache = sv.bs || (sv.bs = /* @__PURE__ */ new Map());
    const spec = (b) => {
      let s = bcache.get(b.idx + ":" + year);
      if (!s) {
        s = bldSpec(b, map2, year);
        try {
          s.arch = archOf(b, s, year);
          if (!s.wa && s.arch.mat !== "glass") s.wall = s.arch.col;
          if (s.roofCol && !s.wa) s.roofCol = s.arch.roofCol;
        } catch (e) {
          s.arch = null;
        }
        if (bcache.size > 600) bcache.clear();
        bcache.set(b.idx + ":" + year, s);
      }
      return s;
    };
    const labels = [];
    for (let x = 0; x < NW; x++) {
      const cam = 2 * x / NW - 1, rdx = dx + plx * cam, rdy = dy + ply * cam;
      let mx = Math.floor(px2), my = Math.floor(py);
      const ddx = Math.abs(1 / (rdx || 1e-9)), ddy = Math.abs(1 / (rdy || 1e-9));
      const stx = rdx < 0 ? -1 : 1, sty = rdy < 0 ? -1 : 1;
      let sdx = (rdx < 0 ? px2 - mx : mx + 1 - px2) * ddx, sdy = (rdy < 0 ? py - my : my + 1 - py) * ddy;
      let side = 0, dist2 = 0, lastB = -1;
      const hits = [];
      for (let i = 0; i < MAXD * 2.2; i++) {
        if (sdx < sdy) {
          dist2 = sdx;
          sdx += ddx;
          mx += stx;
          side = 0;
        } else {
          dist2 = sdy;
          sdy += ddy;
          my += sty;
          side = 1;
        }
        if (mx < 0 || my < 0 || mx >= W2 || my >= H4) break;
        if (dist2 > MAXD) break;
        const k2 = mx + my * W2;
        const bi = bid[k2];
        if (bi !== lastB) {
          if (bi >= 0 && dist2 > 0.05) hits.push({ b: map2.buildings[bi], d: dist2, side, mx, my, u: (side === 0 ? py + dist2 * rdy : px2 + dist2 * rdx) % 1 });
          lastB = bi;
        }
        if (dist2 < 24 && (deco[k2] || bi < 0)) {
          const key = k2;
          if (!seen.has(key)) seen.set(key, dist2);
        }
      }
      if (hits.length) zb[x] = hits[0].d;
      for (let h = hits.length - 1; h >= 0; h--) {
        const ht = hits[h];
        const b = ht.b;
        if (!b) continue;
        const sp = spec(b);
        const Hm = (sp.blocks && sp.blocks.length ? sp.blocks[sp.blocks.length - 1].z1 : 3) / TILE_M;
        const d = Math.max(0.12, ht.d);
        const bot = hor + EYE * K3 / d, top = bot - Hm * K3 / d;
        if (bot < hor - 1 && top < 0) continue;
        const shade2 = (ht.side === 0 ? 0.82 : 1) * dim2;
        const fog = Math.min(1, Math.pow(d / MAXD, 1.5));
        const wc = hexRGB(sp.wall), tc = hexRGB(sp.trim || "#666");
        const col = mix2([wc[0] * shade2, wc[1] * shade2, wc[2] * shade2], skyHor, fog);
        ctx4.fillStyle = css(col);
        ctx4.fillRect(x, top, 1, bot - top);
        {
          const A2 = sp.arch;
          if (A2 && d < 16 && !sp.wa) {
            const mt = A2.mat;
            const wallPx = bot - top;
            const PITCH = { brick: 0.1, tile: 0.25, stone: 0.4, siding: 0.14, panel: 1.1, mortar: 0, plank: 0, shitami: 0.9, namako: 0.5, mosaic: 0.15 }[mt];
            if (PITCH && PITCH * K3 / d >= 2.6 && wallPx > 4) {
              ctx4.fillStyle = "rgba(20,15,10,0.16)";
              const n0 = Math.min(60, Math.floor(Hm * TILE_M / PITCH));
              for (let j = 1; j <= n0; j++) {
                const yy = bot - j * PITCH / TILE_M * K3 / d;
                if (yy < top) break;
                ctx4.fillRect(x, yy, 1, 1);
              }
            }
            if ((mt === "brick" || mt === "tile" || mt === "stone" || mt === "mosaic") && d < 11) {
              const cw = mt === "stone" ? 0.5 : mt === "brick" ? 0.34 : 0.25;
              const row = PITCH ? PITCH * K3 / d >= 2.6 ? PITCH : 0 : 0;
              if (row) {
                const ju = (ht.u < 0 ? ht.u + 1 : ht.u) * (TILE_M / cw);
                const fr = ju - Math.floor(ju);
                if (fr < 0.08) {
                  ctx4.fillStyle = "rgba(20,15,10,0.16)";
                  for (let j = 0; j * row < Hm * TILE_M; j += 2) {
                    const y0 = bot - (j * row + row) / TILE_M * K3 / d;
                    ctx4.fillRect(x, Math.max(top, y0), 1, Math.min(bot - Math.max(top, y0), row / TILE_M * K3 / d));
                  }
                }
              }
            }
            if (mt === "plank" || mt === "shitami") {
              const u3 = (ht.u < 0 ? ht.u + 1 : ht.u) * TILE_M / 0.18;
              if (u3 - Math.floor(u3) < 0.2) {
                ctx4.fillStyle = "rgba(30,18,6,0.22)";
                ctx4.fillRect(x, top, 1, wallPx);
              }
            }
            if (mt === "conc" || mt === "mortar") {
              const gh = hash2(b.idx, (x >> 2) + 3) % 5;
              if (gh === 0) {
                ctx4.fillStyle = "rgba(0,0,0,0.05)";
                ctx4.fillRect(x, top, 1, wallPx);
              }
            }
            if (A2.wear > 0.55 && d < 9) {
              const gy = Math.max(top, bot - 0.5 * K3 / d);
              ctx4.fillStyle = "rgba(50,60,30,0.18)";
              ctx4.fillRect(x, gy, 1, bot - gy);
            }
          }
        }
        {
          const rt = sp.roof;
          if ((rt === "gable" || rt === "hip" || rt === "pagoda") && sp.roofCol && !sp.wa || (rt === "gable" || rt === "hip") && sp.wa && sp.roofCol) {
            const rise = (rt === "pagoda" ? 1.1 : 0.85) * K3 / d;
            const yTop = top - rise;
            if (yTop < hor && rise > 1) {
              const rcol = hexRGB(sp.roofCol);
              const rs = mix2([rcol[0] * shade2, rcol[1] * shade2, rcol[2] * shade2], skyHor, fog);
              ctx4.fillStyle = css(rs);
              ctx4.fillRect(x, yTop, 1, rise);
              const rm = sp.arch && sp.arch.roofMat;
              if (rise > 5 && d < 14) {
                ctx4.fillStyle = "rgba(0,0,0,0.20)";
                const stp = Math.max(2.5, 0.16 * K3 / d);
                for (let yy = top - stp; yy > yTop; yy -= stp) ctx4.fillRect(x, yy, 1, 1);
                if (rm === "kawara" && x >> 1 & 1) {
                  ctx4.fillStyle = "rgba(255,255,255,0.08)";
                  ctx4.fillRect(x, yTop, 1, rise);
                }
              }
              ctx4.fillStyle = css(mix2(tc, skyHor, fog));
              ctx4.fillRect(x, yTop, 1, 1);
            }
          }
        }
        const u = ht.u < 0 ? ht.u + 1 : ht.u;
        const nf = Math.max(1, sp.nf || 1);
        const fz = (sp.gh || 3.3) / TILE_M, sh3 = (sp.sh || 3.3) / TILE_M;
        const wcol = mix2([70, 92, 112], skyHor, fog);
        const lit = night > 0.25 && hash2(b.idx, 5 + (u * 3 | 0)) % 3 !== 0;
        for (let f2 = 0; f2 < nf; f2++) {
          const z0 = f2 === 0 ? 0 : fz + (f2 - 1) * sh3, z1 = f2 === 0 ? fz : z0 + sh3;
          const yb = hor + (EYE - z0 - (z1 - z0) * 0.12) * K3 / d, yt = hor + (EYE - z0 - (z1 - z0) * 0.72) * K3 / d;
          const wu = u * (Math.max(b.w, b.h) > 4 ? 3 : 2) % 1;
          if (f2 === 0) {
            const front = ht.side === 1 && sty > 0 ? false : ht.side === 1;
            const doorTile = front && ht.mx === b.doorX && ht.my === b.doorY - 1;
            const shopK = sp.kind === "shop" || sp.kind === "eat" || sp.kind === "conv" || sp.kind === "super" || sp.kind === "game" || sp.kind === "cinema";
            if (doorTile) {
              const dtop = hor + (EYE - 1.15) * K3 / d;
              ctx4.fillStyle = css(mix2([60, 44, 30], skyHor, fog));
              ctx4.fillRect(x, dtop, 1, bot - dtop);
              if (!spots.some((s) => s.b === b)) spots.push({ b, x, d });
            } else if (shopK && wu > 0.12 && wu < 0.9) {
              const gl = mix2(night > 0.25 ? [250, 220, 150] : [120, 150, 170], skyHor, fog);
              ctx4.fillStyle = css(gl);
              ctx4.fillRect(x, yt + (yb - yt) * 0.15, 1, (yb - yt) * 0.85);
              const pc = hash2(b.idx * 31 + (u * 6 | 0), 9) % 6, cols2 = ["#e2503a", "#f0c23a", "#4aa05a", "#4a7fd0", "#d070b0", "#f2f2ee"];
              ctx4.fillStyle = css(mix2(hexRGB(cols2[pc]), skyHor, fog));
              ctx4.fillRect(x, yb - (yb - yt) * 0.4, 1, (yb - yt) * 0.28);
            } else if (!shopK && wu > 0.2 && wu < 0.8) {
              ctx4.fillStyle = css(lit ? mix2([255, 226, 150], skyHor, fog) : wcol);
              ctx4.fillRect(x, yt, 1, yb - yt);
            }
            const sg = hor + (EYE - fz * 0.98) * K3 / d;
            if (shopK) {
              ctx4.fillStyle = css(mix2(tc, skyHor, fog));
              ctx4.fillRect(x, sg, 1, Math.max(1, (yb - yt) * 0.12 + 1));
            }
          } else if (wu > 0.22 && wu < 0.78) {
            ctx4.fillStyle = css(lit ? mix2([255, 226, 150], skyHor, fog) : wcol);
            ctx4.fillRect(x, yt, 1, yb - yt);
          }
        }
        ctx4.fillStyle = css(mix2(tc, skyHor, fog));
        ctx4.fillRect(x, top, 1, Math.max(1, 0.12 * K3 / d));
      }
    }
    const sprites = [];
    const PR = R5.A && R5.A.props ? buildProps(map2) : null;
    const inv = 1 / (plx * dy - dx * ply);
    const addS = (wx, wy, img, wTiles, hTiles, extra) => {
      const rx = wx - px2, ry = wy - py;
      const tx = inv * (dy * rx - dx * ry), ty = inv * (-ply * rx + plx * ry);
      if (ty < 0.3 || ty > MAXD) return;
      sprites.push({ tx, ty, img, w: wTiles, h: hTiles, ...extra });
    };
    for (const [k2, dist2] of seen) {
      const tx = k2 % W2, ty = k2 / W2 | 0;
      const dc = deco[k2];
      const cx = tx + 0.5, cy = ty + 0.5;
      if (dc === D.TREE) addS(cx, cy, treeSprite(R5, ["#3f8a46", "#4a9a4a", "#37773e"][(tx + ty) % 3]), 1.5, 2.4, {});
      else if (dc === D.LAMP || dc === D.POST) addS(cx, cy, sprite(R5, "pole", 32, 96, (c) => {
        c.fillStyle = "#6b6f78";
        c.fillRect(14, 8, 4, 88);
        c.fillStyle = night > 0.2 ? "#ffe08a" : "#d8d8d0";
        c.fillRect(8, 2, 16, 8);
      }), 0.5, 2.6, {});
      else if (dc === D.VENDING) addS(cx, cy, sprite(R5, "vend", 32, 52, (c) => {
        c.fillStyle = "#d83a3a";
        c.fillRect(2, 2, 28, 48);
        c.fillStyle = "#e8f4ff";
        c.fillRect(6, 6, 20, 20);
        c.fillStyle = "#fff";
        c.fillRect(6, 32, 20, 4);
      }), 0.55, 1, {});
      else if (dc === D.BENCH) addS(cx, cy, sprite(R5, "bench", 48, 24, (c) => {
        c.fillStyle = "#8a6a44";
        c.fillRect(0, 8, 48, 6);
        c.fillRect(2, 14, 4, 10);
        c.fillRect(42, 14, 4, 10);
        c.fillRect(0, 0, 48, 4);
      }), 0.9, 0.45, {});
      else if (dc === D.FLOWER) addS(cx, cy, sprite(R5, "flw", 32, 24, (c) => {
        c.fillStyle = "#e86a9a";
        c.fillRect(6, 10, 6, 6);
        c.fillStyle = "#f2c23a";
        c.fillRect(16, 6, 6, 6);
        c.fillStyle = "#4a9a4a";
        c.fillRect(4, 16, 24, 6);
      }), 0.5, 0.3, {});
      if (PR) {
        const pp = PR.get(k2);
        if (pp && R5.A.props.p[pp.k]) {
          const e = R5.A.props.p[pp.k], kk = R5.A.props.k;
          addS(cx, cy, sprite(R5, "pr" + pp.k, e[2], e[3], (c) => c.drawImage(R5.A.props.img, e[0], e[1], e[2], e[3], 0, 0, e[2], e[3])), e[2] / kk * 0.1, e[3] / kk * 0.1, {});
        }
      }
      if (map2.ver === 4) {
        for (const s of boardsIn(map2, tx >> 3, ty >> 3)) if (s.x === tx && s.y === ty) addS(cx, cy, sprite(R5, `bd${s.x}_${s.y}_${year}_${g.month0()}_${night > 0.25 ? 1 : 0}_${Math.floor(sv.t / 4)}`, 160, 150, (c) => {
          drawBoard(c, 80, 146, 5.2, s, year, g.month0(), map2, sv.t, night > 0.25);
        }), 1.9, 1.8, {});
      }
    }
    for (const s of signalSpots(map2)) {
      if (Math.abs(s.x - px2) > 26 || Math.abs(s.y - py) > 26) continue;
      const st3 = signalAt(s.c, R5.time, s.horiz ? AX.H : AX.V);
      const col = st3 === "G" ? "#3ddc6a" : st3 === "Y" ? "#ffd33a" : "#ff4b3a";
      addS(s.x + 0.5, s.y + 0.5, sprite(R5, "sg" + st3, 40, 110, (c) => {
        c.fillStyle = "#4a4c55";
        c.fillRect(18, 22, 4, 88);
        c.fillStyle = "#2b2d34";
        c.fillRect(6, 4, 28, 20);
        c.fillStyle = col;
        c.beginPath();
        c.arc(st3 === "G" ? 28 : st3 === "Y" ? 20 : 12, 14, 5, 0, 7);
        c.fill();
      }), 0.7, 2.6, {});
    }
    for (const w of R5.walkers || []) {
      if (Math.abs(w.x - px2) > 30 || Math.abs(w.y - py) > 30) continue;
      const sp2 = personSprite(R5, w);
      if (sp2) addS(w.x, w.y, sp2, 1.07, 1.55, {});
    }
    {
      const hs = personSprite(R5, { id: g.hero.id, dx, dy, hero: true });
      if (hs) addS(hero.x, hero.y, hs, 1.07, 1.55, { hero: true });
    }
    try {
      const cars = R5.carsNow(0, hero, extras.trs || []);
      for (const c of cars) {
        if (Math.abs(c.x - px2) > 34 || Math.abs(c.y - py) > 34) continue;
        addS(c.x, c.y, carSprite(R5, c.color || "#c8352f"), (c.len || 2.2) * 0.75, 0.9, {});
      }
    } catch (e) {
    }
    sprites.sort((a, b) => b.ty - a.ty);
    for (const s of sprites) {
      const sw = s.w * K3 / s.ty, sh3 = s.h * K3 / s.ty;
      const sxC = NW / 2 * (1 + s.tx / s.ty);
      const bot = hor + EYE * K3 / s.ty;
      const x0 = Math.floor(sxC - sw / 2), x1 = Math.ceil(sxC + sw / 2);
      if (x1 < 0 || x0 >= NW) continue;
      const fogA = 1 - Math.min(0.85, Math.pow(s.ty / MAXD, 1.5));
      ctx4.globalAlpha = fogA;
      const iw = s.img.width;
      for (let x = Math.max(0, x0); x < Math.min(NW, x1); x++) {
        if (zb[x] < s.ty - 0.05) continue;
        const u = (x - x0) / (x1 - x0);
        ctx4.drawImage(s.img, Math.floor(u * iw), 0, 1, s.img.height, x, bot - sh3, 1, sh3);
      }
      ctx4.globalAlpha = 1;
    }
    ctx4.textAlign = "center";
    ctx4.textBaseline = "middle";
    for (const sp of spots) {
      const b = sp.b;
      if (sp.d > 16) continue;
      const px22 = Math.max(5, Math.min(10, 5 * K3 / sp.d / 6));
      const y = hor + (EYE - 3) * K3 / sp.d * 0.9 - 0;
      ctx4.font = `700 ${px22}px sans-serif`;
      const tw = ctx4.measureText(b.name).width;
      ctx4.fillStyle = "rgba(20,24,34,0.72)";
      ctx4.fillRect(sp.x - tw / 2 - 3, y - px22 * 0.7, tw + 6, px22 * 1.4);
      ctx4.fillStyle = "#ffe9a6";
      ctx4.fillText(b.name, sp.x, y);
    }
    if (night > 0.05) {
      ctx4.fillStyle = `rgba(8,14,40,${(night * 0.35).toFixed(2)})`;
      ctx4.fillRect(0, 0, NW, NH);
    }
    ctxMain.setTransform(1, 0, 0, 1, 0, 0);
    ctxMain.imageSmoothingEnabled = true;
    ctxMain.imageSmoothingQuality = "medium";
    ctxMain.drawImage(sv.cv, 0, 0, NW, NH, 0, 0, CW, CH3);
    void POLE2;
    void hour;
  }

