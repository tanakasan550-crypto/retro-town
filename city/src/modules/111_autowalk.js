  // src/autowalk.js
  function screenToGround(R5, inside, sx, sy, z = 0) {
    if (inside) {
      const P3 = R5.ip;
      if (!P3) return null;
      const Z2 = P3.Z, y2 = sy + z * 12 * Z2;
      const a2 = (sx - P3.ox) / (8 * Z2), b2 = (y2 - P3.oy) / (4 * Z2);
      return [(a2 + b2) / 2, (b2 - a2) / 2];
    }
    const P2 = R5.P;
    if (!P2) return null;
    const Z = P2.Z, y = sy + z * 12 * Z;
    const a = (sx - P2.x0) / (16 * Z), b = (y - P2.y0) / (8 * Z);
    return [(a + b) / 2, (b - a) / 2];
  }
  var pxOf = (R5, inside, u, v, z = 0) => {
    const P2 = inside ? R5.ip : R5.P;
    return [P2.X(u, v), P2.Y(u, v, z)];
  };
  function resolveTap(g, R5, crowd, sx, sy) {
    const L2 = g.S.loc, map2 = g.world.map, inside = L2.k === "in";
    const Zp = inside ? R5.ip && R5.ip.Z : R5.P && R5.P.Z;
    if (!Zp) return null;
    let best = null, bd = 1e9;
    for (const w of crowd || []) {
      const wx = w.x ?? w.cx, wy = w.y ?? w.cy;
      if (wx == null) continue;
      const [px2, py] = pxOf(R5, inside, wx, wy, 0.9);
      const dx = Math.abs(sx - px2), dy = Math.abs(sy - py);
      if (dx < 0.55 * 16 * Zp && dy < 1.1 * 12 * Zp) {
        const d = dx + dy;
        if (d < bd) {
          bd = d;
          best = { kind: "npc", id: w.id, x: wx, y: wy, label: g.nameOf ? g.nameOf(w.id) : "\u4EBA" };
        }
      }
    }
    if (best) return best;
    if (!inside) {
      let hit3 = null;
      for (let z = 0; z <= 16; z += 2) {
        const q3 = screenToGround(R5, false, sx, sy, z);
        if (!q3) continue;
        const tx2 = Math.floor(q3[0]), ty2 = Math.floor(q3[1]);
        if (tx2 < 0 || ty2 < 0 || tx2 >= map2.W || ty2 >= map2.H) continue;
        const bi = map2.bid[tx2 + ty2 * map2.W];
        if (bi < 0) continue;
        const b = map2.buildings[bi];
        const hh = Math.max(3, (b.floors || 1) * 3.3 + 1);
        if (z <= hh) {
          if (!hit3 || z > hit3.z) hit3 = { b: bi, z };
        }
      }
      if (hit3) {
        const b = map2.buildings[hit3.b];
        const bt = BTYPES[b.type];
        return { kind: "door", b: hit3.b, x: b.doorX, y: b.doorY, label: b.name, enter: !bt || bt.enter !== false };
      }
      const q2 = screenToGround(R5, false, sx, sy, 0);
      if (!q2) return null;
      const tx = Math.floor(q2[0]), ty = Math.floor(q2[1]);
      if (tx < 0 || ty < 0 || tx >= map2.W || ty >= map2.H) return null;
      const d = map2.deco[tx + ty * map2.W];
      if (d === 2 || d === 3) return { kind: "deco", x: tx, y: ty, d, label: d === 2 ? "\u81EA\u52D5\u8CA9\u58F2\u6A5F" : "\u30D9\u30F3\u30C1" };
      return { kind: "tile", x: tx, y: ty };
    }
    const { I: I2 } = interiorOf(g, L2.b, L2.floor);
    if (I2.door && !I2.noDoor) {
      const ip = R5.ip, cx = I2.door.x + 0.5, cy = I2.door.y + 0.5;
      let hit3 = false;
      try {
        const dx = sx - ip.X(cx, cy), dy = sy - ip.Y(cx, cy, 3.4);
        hit3 = Math.abs(dx) < 46 * (ip.Z || 1) + 14 && Math.abs(dy) < 16 * (ip.Z || 1) + 12;
      } catch (_) {
      }
      const q2 = screenToGround(R5, true, sx, sy, 0);
      if (hit3 || q2 && Math.abs(q2[0] - cx) < 1.6 && Math.abs(q2[1] - cy) < 1.8) return { kind: "exit", x: I2.door.x, y: I2.door.y, label: "\u51FA\u53E3" };
    }
    let hit2 = null;
    for (const z of [0, 0.8, 1.6, 2.4]) {
      const q2 = screenToGround(R5, true, sx, sy, z);
      if (!q2) continue;
      for (const o of I2.objs) {
        if (!o.act) continue;
        const w = o.w || 1, h = o.h || 1;
        if (q2[0] >= o.x - 0.15 && q2[0] <= o.x + w + 0.15 && q2[1] >= o.y - 0.15 && q2[1] <= o.y + h + 0.15) {
          const sc = z * 0.1 + (o.act === "stairs" ? 0 : 0);
          if (!hit2 || sc < hit2.sc) hit2 = { o, sc, z };
        }
      }
      if (hit2) break;
    }
    if (hit2) {
      const o = hit2.o;
      if (o.act === "stairs") return { kind: "stairs", o, x: o.x, y: o.y, label: o.label || "\u968E\u6BB5" };
      return { kind: "obj", o, x: o.x, y: o.y, label: o.label || o.t };
    }
    const q = screenToGround(R5, true, sx, sy, 0);
    if (!q) return null;
    return { kind: "tile", x: Math.floor(q[0]), y: Math.floor(q[1]) };
  }
  function bfsIn(I2, solid, sx, sy, isGoal) {
    const W2 = I2.W, H4 = I2.H;
    const par = new Int32Array(W2 * H4).fill(-2);
    const s = sx + sy * W2;
    if (sx < 0 || sy < 0 || sx >= W2 || sy >= H4) return null;
    par[s] = -1;
    const q = [s];
    for (let i = 0; i < q.length; i++) {
      const k = q[i], x = k % W2, y = k / W2 | 0;
      if (isGoal(x, y)) {
        const p = [];
        for (let c = k; c !== -1; c = par[c]) p.push([c % W2, c / W2 | 0]);
        return p.reverse();
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
        const nk = nx + ny * W2;
        if (par[nk] !== -2 || solid[nk]) continue;
        par[nk] = k;
        q.push(nk);
      }
    }
    return null;
  }
  var AutoWalk = class {
    constructor() {
      this.goal = null;
      this.path = null;
      this.i = 0;
      this.stuckT = 0;
      this.replans = 0;
      this.waitT = 0;
      this.lastX = 0;
      this.lastY = 0;
      this.onDone = null;
      this.status = "";
      this.t = 0;
    }
    get active() {
      return !!this.goal;
    }
    cancel(why) {
      const was = this.goal;
      this.goal = null;
      this.path = null;
      this.status = why || "";
      return was;
    }
    // goal: {kind, ...}。屋外は座標で、屋内は設備/出口/タイルで指定
    goTo(g, goal) {
      this.goal = goal;
      this.chain = false;
      this.replans = 0;
      this.stuckT = 0;
      this.waitT = 0;
      this.t = 0;
      this.status = "";
      const ok = this.plan(g);
      if (!ok) {
        const why = this.status || "\u884C\u3051\u306A\u3044\u5834\u6240\u3067\u3059";
        this.goal = null;
        return { ok: false, msg: why };
      }
      return { ok: true };
    }
    plan(g) {
      const L2 = g.S.loc, goal = this.goal;
      if (!goal) return false;
      const sx = Math.floor(L2.x), sy = Math.floor(L2.y);
      if (L2.k === "out") {
        const map2 = g.world.map;
        const walk = (x, y) => x >= 0 && y >= 0 && x < map2.W && y < map2.H && !map2.solid[x + y * map2.W] && map2.ground[x + y * map2.W] !== T.WATER && map2.ground[x + y * map2.W] !== T.RAIL;
        let tx = goal.x, ty = goal.y;
        if (goal.kind === "npc") {
          tx = Math.floor(goal.x);
          ty = Math.floor(goal.y);
        }
        if (goal.kind === "door" || goal.kind === "deco") {
        }
        if (goal.kind === "deco") {
          let b = null, bd = 1e9;
          for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1]]) {
            const x = goal.x + dx, y = goal.y + dy;
            if (walk(x, y)) {
              const d = Math.abs(x - sx) + Math.abs(y - sy);
              if (d < bd) {
                bd = d;
                b = [x, y];
              }
            }
          }
          if (!b) {
            this.status = "\u305D\u3053\u3078\u306F\u8FD1\u3065\u3051\u307E\u305B\u3093";
            return false;
          }
          tx = b[0];
          ty = b[1];
        }
        if (!walk(tx, ty)) {
          let b = null, bd = 1e9;
          for (let r = 1; r <= 4 && !b; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const x = tx + dx, y = ty + dy;
            if (walk(x, y)) {
              const d = Math.abs(dx) + Math.abs(dy);
              if (d < bd) {
                bd = d;
                b = [x, y];
              }
            }
          }
          if (!b) {
            this.status = "\u305D\u3053\u3078\u306F\u884C\u3051\u307E\u305B\u3093";
            return false;
          }
          tx = b[0];
          ty = b[1];
        }
        const p2 = findPath(map2, sx, sy, tx, ty, MODE2.WALK, 12e5, false);
        if (!p2 || !p2.length) {
          this.status = "\u9053\u304C\u3064\u306A\u304C\u3063\u3066\u3044\u307E\u305B\u3093(\u30BF\u30AF\u30B7\u30FC\u3084\u96FB\u8ECA\u3092\u4F7F\u3044\u307E\u3057\u3087\u3046)";
          return false;
        }
        this.path = p2;
        this.i = 0;
        this.dest = { x: tx, y: ty };
        return true;
      }
      const { I: I2, solid } = interiorOf(g, L2.b, L2.floor);
      const W2 = I2.W;
      let isGoal;
      if (goal.kind === "exit" && L2.floor !== 0 && !isUnitFloor(L2.floor)) {
        const down = (I2.stairs || []).filter((st3) => typeof st3.to === "number" && (L2.floor > 0 ? st3.to < L2.floor : st3.to > L2.floor));
        if (down.length) {
          let b = null, bd = 1e9;
          for (const st3 of down) {
            const d = Math.abs(st3.x - sx) + Math.abs(st3.y - sy);
            if (d < bd) {
              bd = d;
              b = st3;
            }
          }
          this.chain = true;
          goal.kind = "stairs";
          goal.o = { x: b.x, y: b.y };
        } else {
          const lf = (I2.objs || []).filter((o) => o.act === "lift");
          if (lf.length) {
            let b = null, bd = 1e9;
            for (const o of lf) {
              const d = Math.abs(o.x - sx) + Math.abs(o.y - sy);
              if (d < bd) {
                bd = d;
                b = o;
              }
            }
            goal.kind = "obj";
            goal.o = b;
            this.status = "\u4E0A\u306E\u968E\u3067\u3059\u3002\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC\u30671\u968E\u3078\u964D\u308A\u307E\u3057\u3087\u3046";
          }
        }
      }
      if (goal.kind === "exit") {
        const dx = I2.door.x;
        const dy0 = Math.min(I2.door.y, I2.H - 1);
        isGoal = (x, y) => y >= dy0 && x === dx;
      } else if (goal.kind === "stairs") {
        const o = goal.o;
        isGoal = (x, y) => x === o.x && y === o.y;
      } else if (goal.kind === "obj") {
        const o = goal.o, w = o.w || 1, h = o.h || 1;
        isGoal = (x, y) => {
          const cx = Math.max(o.x + 0.5, Math.min(x + 0.5, o.x + w - 0.5)), cy = Math.max(o.y + 0.5, Math.min(y + 0.5, o.y + h - 0.5));
          return Math.hypot(cx - (x + 0.5), cy - (y + 0.5)) <= 1.25 && !(x >= o.x && x < o.x + w && y >= o.y && y < o.y + h);
        };
      } else if (goal.kind === "npc") {
        const nx = Math.floor(goal.x), ny = Math.floor(goal.y);
        isGoal = (x, y) => Math.hypot(x - nx, y - ny) <= 1.3 && !(x === nx && y === ny);
      } else {
        const tx = goal.x, ty = goal.y;
        isGoal = (x, y) => x === tx && y === ty;
        if (solid[tx + ty * W2]) {
          isGoal = (x, y) => Math.abs(x - tx) + Math.abs(y - ty) <= 1;
        }
      }
      const sol = solid;
      const p = bfsIn(I2, sol, sx, sy, isGoal);
      if (!p) {
        this.status = "\u305D\u3053\u3078\u306F\u884C\u3051\u307E\u305B\u3093(\u5BB6\u5177\u3084\u58C1\u3067\u3075\u3055\u304C\u308C\u3066\u3044\u307E\u3059)";
        return false;
      }
      this.path = p;
      this.i = 0;
      this.dest = { x: p[p.length - 1][0], y: p[p.length - 1][1] };
      return true;
    }
    // 毎フレーム: 世界座標の進行方向ベクトル[ix,iy]を返す(到着/失敗なら null と status)。
    // arrived: 到着した(onArrive を呼ぶべき)  failed: 中止
    dir(g, dt, lastRes) {
      const L2 = g.S.loc, goal = this.goal;
      if (!goal) return null;
      this.t += dt;
      if (goal.kind === "npc" && L2.k === "out" && goal.live) {
        const w = goal.live();
        if (w) {
          goal.x = w.x;
          goal.y = w.y;
        }
      }
      if (lastRes && lastRes.msg === CROSS_MSG) {
        this.waitT += dt;
        this.stuckT = 0;
        if (this.waitT > 240) {
          this.cancel("\u906E\u65AD\u6A5F\u304C\u958B\u304D\u307E\u305B\u3093");
          return null;
        }
        return [0, 0];
      }
      const moved = Math.hypot(L2.x - this.lastX, L2.y - this.lastY);
      this.lastX = L2.x;
      this.lastY = L2.y;
      if (moved < 4e-3) this.stuckT += dt;
      else this.stuckT = 0;
      if (this.stuckT > 0.45) {
        this.stuckT = 0;
        if (++this.replans > 6) {
          this.cancel("\u9014\u4E2D\u3067\u9032\u3081\u306A\u304F\u306A\u308A\u307E\u3057\u305F");
          return null;
        }
        if (!this.plan(g)) {
          this.cancel(this.status || "\u9032\u3081\u306A\u304F\u306A\u308A\u307E\u3057\u305F");
          return null;
        }
      }
      if (goal.kind === "npc" && this.t > 1.5 && this.t % 1.5 < dt) this.plan(g);
      const p = this.path;
      if (!p) return null;
      const last = p[p.length - 1];
      const cx = last[0] + 0.5, cy = last[1] + 0.5;
      const dEnd = Math.hypot(L2.x - cx, L2.y - cy);
      for (let k = Math.min(p.length - 1, this.i + 4); k >= this.i; k--) {
        const w = p[k];
        if (Math.hypot(L2.x - (w[0] + 0.5), L2.y - (w[1] + 0.5)) < 0.42) {
          this.i = Math.min(p.length - 1, k + 1);
          break;
        }
      }
      let tgt = p[Math.min(this.i, p.length - 1)];
      if (dEnd < 0.3) {
        if (goal.kind === "exit") {
          return [0, 1];
        }
        this.arrived = true;
        return null;
      }
      const la = Math.min(p.length - 1, this.i + 3);
      for (let j = la; j > this.i; j--) {
        const w = p[j];
        if (this.clear(g, L2.x, L2.y, w[0] + 0.5, w[1] + 0.5)) {
          tgt = w;
          break;
        }
      }
      const dx = tgt[0] + 0.5 - L2.x, dy = tgt[1] + 0.5 - L2.y;
      const d = Math.hypot(dx, dy) || 1;
      return [dx / d, dy / d];
    }
    // (x0,y0)→(x1,y1) を主人公の体(半径HR)で通れるか(0.2刻みで標本)
    clear(g, x0, y0, x1, y1) {
      const L2 = g.S.loc;
      const n2 = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.2);
      let sol, W2, H4, isOut = L2.k === "out";
      let map2 = null, I2 = null;
      if (isOut) {
        map2 = g.world.map;
        sol = map2.solid;
        W2 = map2.W;
        H4 = map2.H;
      } else {
        const r = interiorOf(g, L2.b, L2.floor);
        I2 = r.I;
        sol = r.solid;
        W2 = I2.W;
        H4 = I2.H;
      }
      const bad = (x, y) => {
        const tx = Math.floor(x), ty = Math.floor(y);
        if (tx < 0 || ty < 0 || tx >= W2 || ty >= H4) return true;
        const k = tx + ty * W2;
        if (sol[k]) return true;
        if (isOut) {
          const gr = map2.ground[k];
          return gr === T.WATER || gr === T.RAIL;
        }
        return false;
      };
      for (let i = 1; i <= n2; i++) {
        const t = i / n2, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        if (bad(x - R3, y - R3) || bad(x + R3, y - R3) || bad(x - R3, y + R3) || bad(x + R3, y + R3)) return false;
      }
      return true;
    }
    facing(vx, vy, prev) {
      return worldDirToFacing(vx, vy, prev);
    }
  };

