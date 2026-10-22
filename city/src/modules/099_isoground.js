  // src/isoground.js
  var CH = 8;
  var K2 = 2;
  var MAXPX = 26e6;
  function groundName(map2, x, y, wf) {
    const g = map2.ground[x + y * map2.W];
    switch (g) {
      case T.GRASS:
        return "grass" + ((x * 7 + y * 13) % 5 === 0 ? 2 : (x + y) % 3 === 0 ? 1 : 0);
      case T.ROAD:
        return "road";
      case T.PLAZA:
        return "plaza";
      case T.WATER:
        return "water" + wf;
      case T.SAND:
        return "sand";
      case T.RAIL: {
        const L2 = map2.ground[x - 1 + y * map2.W], R5 = map2.ground[x + 1 + y * map2.W];
        return L2 === T.RAIL || R5 === T.RAIL || L2 === T.PLATFORM || R5 === T.PLATFORM || L2 === T.CROSSING || R5 === T.CROSSING ? "rail_h" : "rail_v";
      }
      case T.PLATFORM:
        return "platform";
      case T.FARM:
        return "farm";
      case T.FOREST:
        return "forest";
      case T.ROCK:
        return "rock";
      case T.BRIDGE:
        return "bridge";
      case T.CROSSING:
        return "crossing";
      case T.PATH:
        return "path";
      case T.QUAY:
        return "quay";
      case T.PADDY:
        return "paddy";
      default:
        return "grass0";
    }
  }
  var GroundCache = class {
    constructor(A2) {
      this.A = A2;
      this.map = null;
      this.c = /* @__PURE__ */ new Map();
      this.stamp = 0;
      this.built = 0;
      this.Z = 0;
      this.px = 0;
      this.scratch = null;
    }
    reset(map2, Z) {
      this.map = map2;
      this.Z = Z;
      this.c.clear();
      this.px = 0;
    }
    // チャンク(cx,cy)の画面用ビットマップ({cv,water})。無ければ作る(canBuild=false なら null)
    get(map2, cx, cy, wf, canBuild, Z) {
      if (this.map !== map2 || this.Z !== Z) this.reset(map2, Z);
      const k0 = cx + cy * 4096;
      let e = this.c.get(k0);
      if (e) {
        e.t = ++this.stamp;
        const v = e.water ? e.cv[wf] : e.cv[0];
        if (v) return v;
      }
      if (!canBuild) return null;
      return this.build(map2, cx, cy, wf, e, Z);
    }
    build(map2, cx, cy, wf, e, Z) {
      const A2 = this.A, TI = A2.tileIdx;
      const x0 = cx * CH, y0 = cy * CH;
      const N2 = CH + 2;
      if (!e) {
        let water = false;
        for (let y = y0 - 1; y <= y0 + CH && !water; y++) for (let x = x0 - 1; x <= x0 + CH; x++) if (x >= 0 && y >= 0 && x < map2.W && y < map2.H && map2.ground[x + y * map2.W] === T.WATER) {
          water = true;
          break;
        }
        e = { water, cv: [null, null], t: 0 };
        this.c.set(cx + cy * 4096, e);
      }
      const SS = N2 * 16 * K2;
      let sc = this.scratch;
      if (!sc) {
        sc = this.scratch = document.createElement("canvas");
        sc.width = sc.height = SS;
      }
      const sx = sc.getContext("2d");
      sx.imageSmoothingEnabled = false;
      sx.clearRect(0, 0, SS, SS);
      sx.fillStyle = "#6aa84f";
      sx.fillRect(0, 0, SS, SS);
      const ox = -(x0 - 1) * 16 * K2, oy = -(y0 - 1) * 16 * K2, TS = 16 * K2;
      for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
        if (x < 0 || y < 0 || x >= map2.W || y >= map2.H) continue;
        const i = TI[groundName(map2, x, y, wf)];
        if (i === void 0) continue;
        sx.drawImage(A2.tiles, i % 16 * 16, (i / 16 | 0) * 16, 16, 16, ox + x * TS, oy + y * TS, TS, TS);
      }
      paintParking(sx, parkingOf(map2), x0 - 1, y0 - 1, x0 + CH, y0 + CH, ox, oy, TS);
      if (A2.veh) drawRoads(sx, map2, Math.max(0, x0 - 1), Math.max(0, y0 - 1), Math.min(map2.W - 1, x0 + CH), Math.min(map2.H - 1, y0 + CH), ox, oy, K2, 0, { signals: false });
      const halfW = Math.round(16 * Z * N2), Wd = halfW * 2, Hd = Math.round(16 * Z * N2);
      const cv2 = document.createElement("canvas");
      cv2.width = Wd;
      cv2.height = Hd;
      const ctx4 = cv2.getContext("2d");
      ctx4.imageSmoothingEnabled = true;
      ctx4.imageSmoothingQuality = "medium";
      const a = TW * Z / (16 * K2), b = TH * Z / (16 * K2);
      ctx4.setTransform(a, b, -a, b, halfW, 0);
      ctx4.drawImage(sc, 0, 0);
      e.cv[e.water ? wf : 0] = cv2;
      e.t = ++this.stamp;
      this.built++;
      this.px += Wd * Hd;
      if (this.px > MAXPX) this.evict();
      return cv2;
    }
    evict() {
      const a = [...this.c.entries()].sort((p, q) => p[1].t - q[1].t);
      for (let i = 0; i < a.length * 0.35; i++) {
        for (const v of a[i][1].cv) if (v) this.px -= v.width * v.height;
        this.c.delete(a[i][0]);
      }
    }
    // 画面へ転写。チャンク左上タイルの角が (P.X(u0,v0), P.Y(u0,v0)) にあり、ビットマップの頂点はその1タイル分(−16Z)上
    draw(ctx4, cv2, cx, cy, P2) {
      const u0 = cx * CH, v0 = cy * CH;
      ctx4.drawImage(cv2, Math.round(P2.X(u0, v0) - cv2.width / 2), Math.round(P2.Y(u0, v0) - 16 * P2.Z));
    }
  };

